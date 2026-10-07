import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import {
  getQuizzesByAdmin,
  getSubmissionsByQuizIds,
  createQuiz,
  updateQuizResultUrl,
  updateQuizStealthMode,
  updateQuizActive,
  updateQuiz,
  deleteQuiz,
} from "@/lib/db";
import type { Quiz } from "@/lib/types";
import { encodeFormUrl } from "@/lib/url";
import { isHttpUrl } from "@/lib/result-url";

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
    const { title, formUrl, resultUrl, isStealthMode } = body;

    if (!title || !formUrl) {
      return NextResponse.json(
        { error: "Judul kuis dan URL form wajib diisi." },
        { status: 400 }
      );
    }

    // Optional. An empty string means the teacher skipped it, and anything
    // that is not http(s) is rejected so a bad link never reaches the page.
    const trimmedResult = typeof resultUrl === "string" ? resultUrl.trim() : "";
    if (trimmedResult && !isHttpUrl(trimmedResult)) {
      return NextResponse.json(
        { error: "Link hasil harus berupa URL yang diawali http:// atau https://" },
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
      resultUrl: trimmedResult || null,
      isStealthMode: typeof isStealthMode === "boolean" ? isStealthMode : false,
      isActive: true,
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

export async function PATCH(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { quizId, resultUrl, isStealthMode, isActive, title, formUrl } = body;

    if (!quizId) {
      return NextResponse.json(
        { error: "Quiz ID wajib diisi." },
        { status: 400 }
      );
    }

    let updated: Quiz | null = null;

    if (title !== undefined || formUrl !== undefined) {
      const updates: { title?: string; formUrl?: string; encodedUrl?: string } = {};

      if (title !== undefined) {
        if (typeof title !== "string" || !title.trim()) {
          return NextResponse.json(
            { error: "Judul kuis tidak boleh kosong." },
            { status: 400 }
          );
        }
        updates.title = title.trim();
      }

      if (formUrl !== undefined) {
        if (typeof formUrl !== "string" || !formUrl.trim() || !isHttpUrl(formUrl.trim())) {
          return NextResponse.json(
            { error: "URL formulir harus berupa URL yang diawali http:// atau https://" },
            { status: 400 }
          );
        }
        const trimmedForm = formUrl.trim();
        updates.formUrl = trimmedForm;
        updates.encodedUrl = encodeFormUrl(trimmedForm);
      }

      updated = await updateQuiz(quizId, admin.id, updates);
      if (!updated) {
        return NextResponse.json(
          { error: "Kuis tidak ditemukan atau Anda tidak berhak mengubahnya." },
          { status: 404 }
        );
      }
    }

    if (typeof isStealthMode === "boolean") {
      updated = await updateQuizStealthMode(quizId, admin.id, isStealthMode);
      if (!updated) {
        return NextResponse.json(
          { error: "Kuis tidak ditemukan atau Anda tidak berhak mengubahnya." },
          { status: 404 }
        );
      }
    }

    if (typeof isActive === "boolean") {
      updated = await updateQuizActive(quizId, admin.id, isActive);
      if (!updated) {
        return NextResponse.json(
          { error: "Kuis tidak ditemukan atau Anda tidak berhak mengubahnya." },
          { status: 404 }
        );
      }
    }

    if (typeof resultUrl === "string") {
      const trimmed = resultUrl.trim();
      if (trimmed && !isHttpUrl(trimmed)) {
        return NextResponse.json(
          { error: "Link hasil harus berupa URL yang diawali http:// atau https://" },
          { status: 400 }
        );
      }

      updated = await updateQuizResultUrl(quizId, admin.id, trimmed || null);
      if (!updated) {
        return NextResponse.json(
          { error: "Kuis tidak ditemukan atau Anda tidak berhak mengubahnya." },
          { status: 404 }
        );
      }
    }

    if (!updated) {
      return NextResponse.json(
        { error: "Tidak ada perubahan yang diberikan." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, quiz: updated });
  } catch (error) {
    console.error("[api/quizzes] PATCH gagal:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui kuis." },
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
