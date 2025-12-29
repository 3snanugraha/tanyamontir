import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // For database sessions, we need to check via the session API
  // Get the session token from cookies
  const sessionToken =
    req.cookies.get("next-auth.session-token") ||
    req.cookies.get("__Secure-next-auth.session-token");

  const isAuthenticated = !!sessionToken;

  // Protect /diagnose and /chat routes
  if (!isAuthenticated) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/diagnose/:path*", "/chat/:path*"],
};
