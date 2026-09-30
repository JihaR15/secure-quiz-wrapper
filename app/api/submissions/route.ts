import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import {
  createSubmission,
  updateSubmissionViolations,
  updateSubmissionStatus,
  deleteSubmission,
} from "@/lib/db";
import type { Submission, ViolationType } from "@/lib/types";

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
      violationBreakdown: { tab: 0, window: 0 },
      status: "active",
      startedAt: now,
      lastActiveAt: now,
    };

    await createSubmission(newSubmission);
    return NextResponse.json({ success: true, submission: newSubmission });
  } catch (error) {
    console.error("[api/submissions] gagal:", error);
    return NextResponse.json(
      { error: "Gagal mencatat peserta kuis." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { submissionId, type, status } = body;

    if (!submissionId) {
      return NextResponse.json(
        { error: "Submission ID wajib diisi." },
        { status: 400 }
      );
    }

    if (status) {
      if (status !== "active" && status !== "completed") {
        return NextResponse.json(
          { error: "Status harus bernilai 'active' atau 'completed'." },
          { status: 400 }
        );
      }
      const updatedStatus = await updateSubmissionStatus(submissionId, status);
      if (!updatedStatus) {
        return NextResponse.json(
          { error: "Sesi peserta tidak ditemukan." },
          { status: 404 }
        );
      }
      if (!type) {
        return NextResponse.json({ success: true, submission: updatedStatus });
      }
    }

    const validTypes: ViolationType[] = ["tab", "window"];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Tipe pelanggaran tidak valid. Harus salah satu dari: 'tab', 'window'." },
        { status: 400 }
      );
    }

    const updated = await updateSubmissionViolations(submissionId, type);
    if (!updated) {
      return NextResponse.json(
        { error: "Sesi peserta tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, submission: updated });
  } catch (error) {
    console.error("[api/submissions] gagal:", error);
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

    const success = await deleteSubmission(submissionId);
    if (!success) {
      return NextResponse.json(
        { error: "Data peserta tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/submissions] gagal:", error);
    return NextResponse.json(
      { error: "Gagal menghapus data peserta." },
      { status: 500 }
    );
  }
}
