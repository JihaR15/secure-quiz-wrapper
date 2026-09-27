import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import {
  createSubmission,
  updateSubmissionViolations,
  deleteSubmission,
  Submission,
} from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quizId, participantName } = body;

    if (!quizId || !participantName) {
      return NextResponse.json(
        { error: "Quiz ID dan Nama Peserta wajib diisi." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newSubmission: Submission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      quizId,
      participantName: participantName.trim(),
      violationCount: 0,
      status: "active",
      startedAt: now,
      lastActiveAt: now,
    };

    createSubmission(newSubmission);
    return NextResponse.json({ success: true, submission: newSubmission });
  } catch {
    return NextResponse.json(
      { error: "Gagal mencatat peserta kuis." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { submissionId, violationCount } = body;

    if (!submissionId || typeof violationCount !== "number") {
      return NextResponse.json(
        { error: "Submission ID dan violationCount valid wajib diisi." },
        { status: 400 }
      );
    }

    const updated = updateSubmissionViolations(submissionId, violationCount);
    if (!updated) {
      return NextResponse.json(
        { error: "Sesi peserta tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, submission: updated });
  } catch {
    return NextResponse.json(
      { error: "Gagal memperbarui data pelanggaran." },
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
    const submissionId = searchParams.get("id");

    if (!submissionId) {
      return NextResponse.json(
        { error: "Submission ID required" },
        { status: 400 }
      );
    }

    const success = deleteSubmission(submissionId);
    if (!success) {
      return NextResponse.json(
        { error: "Data peserta tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Gagal menghapus data peserta." },
      { status: 500 }
    );
  }
}
