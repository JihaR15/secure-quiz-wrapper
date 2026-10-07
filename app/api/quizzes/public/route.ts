import { NextResponse } from "next/server";
import { getQuizById } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Parameter id kuis wajib disertakan." },
        { status: 400 }
      );
    }

    const quiz = await getQuizById(id);
    if (!quiz) {
      return NextResponse.json(
        { error: "Kuis tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      title: quiz.title,
      formUrl: quiz.formUrl,
      isStealthMode: quiz.isStealthMode ?? false,
      isActive: quiz.isActive ?? true,
    });
  } catch (error) {
    console.error("[api/quizzes/public] error:", error);
    return NextResponse.json(
      { error: "Gagal memuat informasi kuis." },
      { status: 500 }
    );
  }
}
