import { NextResponse } from "next/server";
import { findAdminByEmail } from "@/lib/db";
import { comparePassword, createSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const admin = await findAdminByEmail(email);
    if (!admin) {
      return NextResponse.json(
        { error: "Email atau password tidak valid." },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Email atau password tidak valid." },
        { status: 401 }
      );
    }

    const token = await createSessionToken(admin.id);

    const response = NextResponse.json({
      success: true,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    });

    response.cookies.set({
      name: "quiz_admin_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("[api/auth/login] gagal:", error);
    return NextResponse.json(
      { error: "Gagal memproses autentikasi admin." },
      { status: 500 }
    );
  }
}
