import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import {
  getQuizzesByAdmin,
  createQuiz,
  deleteQuiz,
  getSubmissionsByQuiz,
  Quiz,
} from "@/lib/db";
import { encodeFormUrl } from "@/lib/url";

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const quizzes = getQuizzesByAdmin(admin.id);
  const quizzesWithSubmissions = quizzes.map((q) => ({
    ...q,
    submissions: getSubmissionsByQuiz(q.id),
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

    createQuiz(newQuiz);
    return NextResponse.json({ success: true, quiz: newQuiz });
  } catch {
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

    const success = deleteQuiz(quizId, admin.id);
    if (!success) {
      return NextResponse.json(
        { error: "Kuis tidak ditemukan atau tidak berhak menghapus." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Gagal menghapus kuis." },
      { status: 500 }
    );
  }
}
