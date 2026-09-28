import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import {
  getQuizzesByAdmin,
  getSubmissionsByQuizIds,
  createQuiz,
  deleteQuiz,
} from "@/lib/db";
import type { Quiz } from "@/lib/types";
import { encodeFormUrl } from "@/lib/url";

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const quizzes = await getQuizzesByAdmin(admin.id);
  // One query for every quiz instead of one per quiz, which is what the
  // in-memory store gave us for free before the move to Postgres.
  const submissions = await getSubmissionsByQuizIds(quizzes.map((q) => q.id));
  const byQuiz = new Map<string, typeof submissions>();
  for (const submission of submissions) {
    const bucket = byQuiz.get(submission.quizId);
    if (bucket) bucket.push(submission);
    else byQuiz.set(submission.quizId, [submission]);
  }
  const quizzesWithSubmissions = quizzes.map((q) => ({
    ...q,
    submissions: byQuiz.get(q.id) ?? [],
  }));

  return NextResponse.json({ quizzes: quizzesWithSubmissions });
}

export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, formUrl } = body;

    if (!title || !formUrl) {
      return NextResponse.json(
        { error: "Judul kuis dan URL form wajib diisi." },
        { status: 400 }
      );
    }

    const encodedUrl = encodeFormUrl(formUrl);
    const newQuiz: Quiz = {
      id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      adminId: admin.id,
      title,
      formUrl,
      encodedUrl,
      createdAt: new Date().toISOString(),
    };

    await createQuiz(newQuiz);
    return NextResponse.json({ success: true, quiz: newQuiz });
  } catch (error) {
    console.error("[api/quizzes] POST gagal:", error);
    return NextResponse.json(
      { error: "Gagal membuat kuis baru." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get("id");
    if (!quizId) {
      return NextResponse.json({ error: "Quiz ID required" }, { status: 400 });
    }

    const success = await deleteQuiz(quizId, admin.id);
    if (!success) {
      return NextResponse.json(
        { error: "Kuis tidak ditemukan atau tidak berhak menghapus." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/quizzes] DELETE gagal:", error);
    return NextResponse.json(
      { error: "Gagal menghapus kuis." },
      { status: 500 }
    );
  }
}
