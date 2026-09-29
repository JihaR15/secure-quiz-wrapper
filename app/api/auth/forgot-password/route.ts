import { NextResponse } from "next/server";
import { findAdminByEmail } from "@/lib/db";
import { createPasswordResetToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400 }
      );
    }

    const admin = await findAdminByEmail(email.trim());

    // Security practice: Return success even if email is not found to prevent user enumeration,
    // but only send the reset email if the user actually exists.
    if (admin) {
      const token = await createPasswordResetToken(admin.id, admin.email);

      // Determine origin from request headers or host
      const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
      const proto = request.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
      const origin = `${proto}://${host}`;

      const resetUrl = `${origin}/admin/reset-password?token=${encodeURIComponent(token)}`;

      await sendPasswordResetEmail({
        to: admin.email,
        name: admin.name,
        resetUrl,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Jika email terdaftar, tautan verifikasi telah dikirimkan ke kotak masuk Anda.",
    });
  } catch (error) {
    console.error("Forgot password API error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat memproses permintaan." },
      { status: 500 }
    );
  }
}
