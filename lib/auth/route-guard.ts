import { NextRequest, NextResponse } from "next/server";
import {
  PORTAL_SESSION_COOKIE,
  readSessionFromCookies,
  sessionCookieOptions,
  type PortalRole,
  type PortalSession,
} from "./session";

type AuthResult =
  | { ok: true; session: PortalSession }
  | { ok: false; response: NextResponse };

export function requireRole(request: NextRequest, role: PortalRole): AuthResult {
  const session = readSessionFromCookies(request.cookies);
  if (!session) {
    const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    response.cookies.set(PORTAL_SESSION_COOKIE, "", sessionCookieOptions(0));
    return { ok: false, response };
  }

  if (session.role !== role) {
    const response = NextResponse.json({ error: "Forbidden" }, { status: 403 });
    response.cookies.set(PORTAL_SESSION_COOKIE, "", sessionCookieOptions(0));
    return { ok: false, response };
  }

  return { ok: true, session };
}
