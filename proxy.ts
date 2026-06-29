import { NextResponse, type NextRequest } from "next/server";
import { PORTAL_SESSION_COOKIE, readSessionFromCookies, sessionCookieOptions } from "@/lib/auth/session";

function redirectTo(path: string, request: NextRequest, clearSession = false) {
  const response = NextResponse.redirect(new URL(path, request.url));
  if (clearSession) {
    response.cookies.set(PORTAL_SESSION_COOKIE, "", sessionCookieOptions(0));
  }
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = readSessionFromCookies(request.cookies);

  const isAdmin = pathname.startsWith("/admin");
  const isJudge = pathname.startsWith("/judge");
  const isAdminLogin = pathname === "/admin/login";
  const isJudgeLogin = pathname === "/judge/login";

  if (!isAdmin && !isJudge) return NextResponse.next();

  if (pathname === "/admin") {
    if (!session) return redirectTo("/admin/login", request);
    return session.role === "admin"
      ? redirectTo("/admin/dashboard", request)
      : redirectTo("/judge/dashboard", request, true);
  }

  if (pathname === "/judge") {
    if (!session) return redirectTo("/judge/login", request);
    return session.role === "judge"
      ? redirectTo("/judge/dashboard", request)
      : redirectTo("/admin/dashboard", request, true);
  }

  if (isAdminLogin) {
    if (!session) return NextResponse.next();
    return session.role === "admin"
      ? redirectTo("/admin/dashboard", request)
      : redirectTo("/judge/dashboard", request);
  }

  if (isJudgeLogin) {
    if (!session) return NextResponse.next();
    return session.role === "judge"
      ? redirectTo("/judge/dashboard", request)
      : redirectTo("/admin/dashboard", request);
  }

  if (isAdmin) {
    if (!session) return redirectTo("/admin/login", request);
    if (session.role !== "admin") return redirectTo("/judge/login", request, true);
    return NextResponse.next();
  }

  if (isJudge) {
    if (!session) return redirectTo("/judge/login", request);
    if (session.role !== "judge") return redirectTo("/admin/login", request, true);
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/judge/:path*"],
};
