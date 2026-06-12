import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { buildSessionToken, PORTAL_SESSION_COOKIE, sessionCookieOptions, type PortalRole } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { insertSubmissionLog } from "@/lib/server/activity-log";

type LoginRow = {
  id: number;
  username: string;
  password: string;
};

const roleToTable: Record<PortalRole, "admins" | "judges"> = {
  admin: "admins",
  judge: "judges",
};

const roleToDashboard: Record<PortalRole, string> = {
  admin: "/admin/dashboard",
  judge: "/judge/dashboard",
};

function isPortalRole(role: unknown): role is PortalRole {
  return role === "admin" || role === "judge";
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const role = body?.role;
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!isPortalRole(role) || !username || !password) {
    return NextResponse.json({ error: "Invalid login payload." }, { status: 400 });
  }

  const table = roleToTable[role];
  const { data, error } = await supabaseServer
    .from(table)
    .select("id,username,password")
    .ilike("username", username)
    .maybeSingle<LoginRow>();

  if (error || !data || !verifyPassword(data.password, password)) {
    return NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401 }
    );
  }

  const token = buildSessionToken({
    userId: data.id,
    username: data.username,
    role,
  });

  const response = NextResponse.json({
    role,
    username: data.username,
    redirectTo: roleToDashboard[role],
  });

  response.cookies.set(PORTAL_SESSION_COOKIE, token, sessionCookieOptions());

  void insertSubmissionLog({
    submissionId: null,
    action: "LOGIN",
    performedBy: role === "admin" ? `admin:${data.username}` : `judge:${data.username}`,
    note: `${role === "admin" ? "Admin" : "Judge"} "${data.username}" logged in`,
  }).catch(() => {});

  return response;
}
