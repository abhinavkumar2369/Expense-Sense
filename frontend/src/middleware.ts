/**
 * Next.js Middleware – Protected Routes
 * ======================================
 * Redirects unauthenticated users away from /dashboard routes.
 * JWT is stored in localStorage so we check via a cookie-based approach
 * using a thin wrapper: the token is also stored as a cookie named "token".
 *
 * NOTE: Since localStorage isn't available in middleware, the AuthProvider
 * also sets a cookie. As a fallback, the client-side layout guards apply.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard"];
const AUTH_PATHS = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Protect dashboard routes
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));
  if (isAuthPage && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
