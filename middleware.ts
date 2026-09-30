import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rute autentikasi admin yang dapat diakses publik tanpa sesi
  const publicAdminPaths = [
    "/admin/login",
    "/admin/register",
    "/admin/forgot-password",
    "/admin/reset-password",
  ];

  if (publicAdminPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("quiz_admin_session");

  if (!sessionCookie || !sessionCookie.value) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
