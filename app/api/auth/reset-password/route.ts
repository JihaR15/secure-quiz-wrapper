import { NextResponse } from "next/server";
import { hashPassword, verifyPasswordResetToken } from "@/lib/auth";
import { updateAdminPassword } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Token verifikasi tidak valid atau tidak ditemukan." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Kata sandi baru minimal harus 6 karakter." },
        { status: 400 }
      );
    }

    const verification = await verifyPasswordResetToken(token);
    if (!verification) {
      return NextResponse.json(
        { error: "Tautan verifikasi sudah kedaluwarsa atau tidak valid. Silakan ajukan ulang." },
        { status: 400 }
      );
    }

    const newHash = await hashPassword(password);
    const updated = await updateAdminPassword(verification.adminId, newHash);

    if (!updated) {
      return NextResponse.json(
        { error: "Gagal memperbarui kata sandi. Akun tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Kata sandi berhasil diperbarui. Silakan masuk kembali.",
    });
  } catch (error) {
    console.error("Reset password API error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat memperbarui kata sandi." },
      { status: 500 }
    );
  }
}
