import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { getQuizById, getSubmissionsByQuiz } from "@/lib/db";
import { generateExcelReport } from "@/lib/excel";

export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const quizId = searchParams.get("quizId");

  if (!quizId) {
    return NextResponse.json(
      { error: "Quiz ID parameter required" },
      { status: 400 }
    );
  }

  const quiz = await getQuizById(quizId);
  if (!quiz || quiz.adminId !== admin.id) {
    return NextResponse.json(
      { error: "Kuis tidak ditemukan atau Anda tidak memiliki akses." },
      { status: 403 }
    );
  }

  const submissions = await getSubmissionsByQuiz(quizId);
  const excelBuffer = generateExcelReport(quiz.title, submissions);

  const safeFileName = `${quiz.title.replace(/[^a-zA-Z0-9_-]/g, "_")}_Pelanggaran.xlsx`;

  return new NextResponse(new Uint8Array(excelBuffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${safeFileName}"`,
    },
  });
}
