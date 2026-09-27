import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { findAdminById, Admin } from "@/lib/db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "secure-quiz-wrapper-secret-key-2026-production"
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(adminId: string): Promise<string> {
  return new SignJWT({ adminId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<{ adminId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { adminId: payload.adminId as string };
  } catch {
    return null;
  }
}

export async function getAuthenticatedAdmin(): Promise<Admin | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("quiz_admin_session")?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload) return null;

    const admin = findAdminById(payload.adminId);
    return admin || null;
  } catch {
    return null;
  }
}
