import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, comparePassword, hashPassword } from "@/lib/auth";
import { updateAdminProfile } from "@/lib/db";

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    admin: { id: admin.id, email: admin.email, name: admin.name },
  });
}

export async function PATCH(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Sesi tidak valid atau telah berakhir." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { name, currentPassword, newPassword } = body;

    const updates: { name?: string; passwordHash?: string } = {};

    // Validate name
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
          { error: "Nama lengkap tidak boleh kosong." },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    // Validate password change
    if (newPassword !== undefined && newPassword !== "") {
      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return NextResponse.json(
          { error: "Kata sandi baru minimal 6 karakter." },
          { status: 400 }
        );
      }

      if (!currentPassword || typeof currentPassword !== "string") {
        return NextResponse.json(
          { error: "Masukkan kata sandi lama Anda untuk konfirmasi." },
          { status: 400 }
        );
      }

      const isMatch = await comparePassword(currentPassword, admin.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { error: "Kata sandi lama yang Anda masukkan salah." },
          { status: 400 }
        );
      }

      updates.passwordHash = await hashPassword(newPassword);
    } else if (currentPassword) {
      return NextResponse.json(
        { error: "Masukkan kata sandi baru jika ingin mengubah kata sandi." },
        { status: 400 }
      );
    }

    if (!updates.name && !updates.passwordHash) {
      return NextResponse.json(
        { error: "Tidak ada data yang diubah." },
        { status: 400 }
      );
    }

    const updatedAdmin = await updateAdminProfile(admin.id, updates);
    if (!updatedAdmin) {
      return NextResponse.json(
        { error: "Gagal memperbarui profil akun." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: updatedAdmin.id,
        email: updatedAdmin.email,
        name: updatedAdmin.name,
      },
    });
  } catch (error) {
    console.error("Update profile API error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat memperbarui akun." },
      { status: 500 }
    );
  }
}

