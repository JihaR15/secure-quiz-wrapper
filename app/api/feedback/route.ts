import { NextResponse } from "next/server";
import { sendFeedbackEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { name, email, category, message } = body;

    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return NextResponse.json(
        { error: "Pesan saran atau masukan minimal 5 karakter." },
        { status: 400 }
      );
    }

    if (email && (typeof email !== "string" || !email.includes("@"))) {
      return NextResponse.json(
        { error: "Format email yang dimasukkan tidak valid." },
        { status: 400 }
      );
    }

    const result = await sendFeedbackEmail({
      name: typeof name === "string" ? name.trim() : undefined,
      email: typeof email === "string" ? email.trim() : undefined,
      category: typeof category === "string" ? category.trim() : "Saran Fitur",
      message: message.trim(),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Gagal mengirimkan email masukan. Silakan coba lagi nanti." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Terima kasih! Saran & masukan Anda berhasil dikirimkan.",
    });
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat memproses masukan Anda." },
      { status: 500 }
    );
  }
}
