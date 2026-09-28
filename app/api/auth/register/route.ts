import { NextResponse } from "next/server";
import { findAdminByEmail, createAdmin } from "@/lib/db";
import type { Admin } from "@/lib/types";
import { hashPassword, createSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nama, email, dan password wajib diisi." },
        { status: 400 }
      );
    }

    const existing = await findAdminByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan login." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const newAdmin: Admin = {
      id: `admin_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      email,
      passwordHash,
      name,
      createdAt: new Date().toISOString(),
    };

    try {
      await createAdmin(newAdmin);
    } catch (error) {
      // 23505 is a unique violation, so a parallel registration won the race.
      if ((error as { code?: string }).code === "23505") {
        return NextResponse.json(
          { error: "Email sudah terdaftar. Silakan login." },
          { status: 400 }
        );
      }
      throw error;
    }

    const token = await createSessionToken(newAdmin.id);

    const response = NextResponse.json({
      success: true,
      admin: { id: newAdmin.id, email: newAdmin.email, name: newAdmin.name },
    });

    response.cookies.set({
      name: "quiz_admin_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("[api/auth/register] gagal:", error);
    return NextResponse.json(
      { error: "Gagal memproses pendaftaran admin." },
      { status: 500 }
    );
  }
}
