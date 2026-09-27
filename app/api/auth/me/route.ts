import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";

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
