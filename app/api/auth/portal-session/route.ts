import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import {
  buildSessionToken,
  PORTAL_SESSION_COOKIE,
  sessionCookieOptions,
  type PortalRole,
} from "@/lib/auth/session";
import { normalizePortalUsername, usernameFromSupabaseEmail } from "@/lib/auth/portal-identity";

type UserRoleRow = {
  id: string;
  role: string;
};

function normalizeRole(value: unknown): PortalRole | null {
  if (typeof value !== "string") return null;
  const role = value.trim().toLowerCase();
  if (role === "admin" || role === "judge") return role;
  return null;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const role = normalizeRole(body?.role);
  const accessToken = typeof body?.accessToken === "string" ? body.accessToken : "";
  const requestedUsername = normalizePortalUsername(body?.username);

  if (!role || !accessToken) {
    return NextResponse.json({ error: "Invalid session payload." }, { status: 400 });
  }

  const { data: authUser, error: authError } = await supabaseServer.auth.getUser(accessToken);
  if (authError || !authUser.user) {
    return NextResponse.json({ error: "Invalid Supabase session." }, { status: 401 });
  }

  const { data: roles, error: rolesError } = await supabaseServer
    .from("user_roles")
    .select("id,role")
    .eq("user_id", authUser.user.id);

  if (rolesError) {
    return NextResponse.json({ error: rolesError.message }, { status: 500 });
  }

  const matchedRole = ((roles ?? []) as UserRoleRow[]).find((row) => normalizeRole(row.role) === role);
  if (!matchedRole) {
    const response = NextResponse.json({ error: "Unauthorized role for this portal" }, { status: 403 });
    response.cookies.set(PORTAL_SESSION_COOKIE, "", sessionCookieOptions(0));
    return response;
  }

  const derivedFromEmail = usernameFromSupabaseEmail(authUser.user.email);
  const portalUsername = requestedUsername || derivedFromEmail || authUser.user.id;

  const portalToken = buildSessionToken({
    // `judge_id` in judges_scores references auth.users.id, so session identity
    // must be the auth user UUID, not user_roles.id.
    userId: authUser.user.id,
    username: portalUsername,
    role,
  });

  const response = NextResponse.json({
    ok: true,
    role,
    redirectTo: role === "admin" ? "/admin/dashboard" : "/judge/dashboard",
  });

  response.cookies.set(PORTAL_SESSION_COOKIE, portalToken, sessionCookieOptions());
  return response;
}
