import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/route-guard";
import { verifyRoleMapping } from "@/lib/auth/role-mapping";
import { supabaseServer } from "@/lib/supabase-server";
import {
  DUMMY_AUTH_DOMAIN,
  normalizePortalUsername,
  usernameFromSupabaseEmail,
} from "@/lib/auth/portal-identity";
import { resolveLegacyJudgeId } from "@/lib/server/judge-scores";
import { insertSubmissionLog } from "@/lib/server/activity-log";

type JudgeRoleRow = {
  id: number | string;
  user_id: string;
  role: string;
};

type AuthUserListItem = {
  id: string;
  email?: string | null;
  last_sign_in_at?: string | null;
};

const JUDGE_ROLE = "JUDGE";

function normalizeRoleRowId(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  if (typeof value === "string") return value.trim();
  return "";
}

function isAuthDuplicateError(message: string | undefined) {
  const normalized = message?.toLowerCase() ?? "";
  return normalized.includes("already") || normalized.includes("duplicate");
}

const AUTH_PER_PAGE = 200;
const AUTH_MAX_PAGES = 25;

async function listAuthUsersById() {
  const users = new Map<string, AuthUserListItem>();
  let page = 1;

  for (let checkedPages = 0; checkedPages < AUTH_MAX_PAGES; checkedPages += 1) {
    const { data, error } = await supabaseServer.auth.admin.listUsers({
      page,
      perPage: AUTH_PER_PAGE,
    });
    if (error) throw new Error(error.message);

    for (const user of data.users as AuthUserListItem[]) {
      users.set(user.id, user);
    }

    if (!data.nextPage) break;
    page = data.nextPage;
  }

  return users;
}

export async function GET(request: NextRequest) {
  const auth = requireRole(request, "admin");
  if (!auth.ok) return auth.response;

  const roleCheck = await verifyRoleMapping({
    userRoleId: auth.session.userId,
    expectedRole: "admin",
  });
  if (!roleCheck.ok) {
    return NextResponse.json({ error: roleCheck.error }, { status: roleCheck.status });
  }

  const { data, error } = await supabaseServer
    .from("user_roles")
    .select("id,user_id,role")
    .ilike("role", JUDGE_ROLE)
    .order("id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let authUsers: Map<string, AuthUserListItem>;
  try {
    authUsers = await listAuthUsersById();
  } catch (authLookupError) {
    return NextResponse.json(
      { error: authLookupError instanceof Error ? authLookupError.message : "Unable to load auth users." },
      { status: 500 },
    );
  }

  const judges = ((data ?? []) as JudgeRoleRow[])
    .map((judgeRow) => {
      const id = normalizeRoleRowId(judgeRow.id);
      if (!id) return null;

      const authUser = authUsers.get(judgeRow.user_id);
      const username =
        usernameFromSupabaseEmail(authUser?.email) ||
        authUser?.email ||
        `judge_${id}`;

      return { id, username, last_login: authUser?.last_sign_in_at ?? null };
    })
    .filter((entry): entry is { id: string; username: string; last_login: string | null } => Boolean(entry));

  return NextResponse.json({ judges });
}

export async function POST(request: NextRequest) {
  const auth = requireRole(request, "admin");
  if (!auth.ok) return auth.response;

  const roleCheck = await verifyRoleMapping({
    userRoleId: auth.session.userId,
    expectedRole: "admin",
  });
  if (!roleCheck.ok) {
    return NextResponse.json({ error: roleCheck.error }, { status: roleCheck.status });
  }

  const body = await request.json().catch(() => null);
  const username = normalizePortalUsername(body?.username);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  if (username.includes("@")) {
    return NextResponse.json({ error: "Use username only (without @domain)." }, { status: 400 });
  }

  const authEmail = `${username}@${DUMMY_AUTH_DOMAIN}`;

  const { data: authUserData, error: authCreateError } = await supabaseServer.auth.admin.createUser({
    email: authEmail,
    password,
    email_confirm: true,
  });

  if (authCreateError || !authUserData.user) {
    if (isAuthDuplicateError(authCreateError?.message)) {
      return NextResponse.json({ error: "Judge username already exists." }, { status: 409 });
    }
    return NextResponse.json(
      { error: authCreateError?.message ?? "Unable to create auth user." },
      { status: 500 },
    );
  }

  const authUserId = authUserData.user.id;
  const { data: roleRow, error: roleError } = await supabaseServer
    .from("user_roles")
    .insert({ user_id: authUserId, role: JUDGE_ROLE })
    .select("id")
    .single<{ id: number | string }>();

  if (roleError) {
    await supabaseServer.auth.admin.deleteUser(authUserId);
    return NextResponse.json({ error: roleError.message }, { status: 500 });
  }

  const judgeId = normalizeRoleRowId(roleRow?.id);
  if (!judgeId) {
    // Cleanup to avoid orphaned role if we cannot produce a stable ID for the UI.
    await Promise.all([
      supabaseServer.from("user_roles").delete().eq("user_id", authUserId).ilike("role", JUDGE_ROLE),
      supabaseServer.auth.admin.deleteUser(authUserId),
    ]);
    return NextResponse.json({ error: "Unable to resolve judge identifier." }, { status: 500 });
  }

  try {
    await resolveLegacyJudgeId(username, { createIfMissing: true });
  } catch (legacyJudgeError) {
    await Promise.all([
      supabaseServer.from("user_roles").delete().eq("user_id", authUserId).ilike("role", JUDGE_ROLE),
      supabaseServer.auth.admin.deleteUser(authUserId),
    ]);
    return NextResponse.json(
      {
        error:
          legacyJudgeError instanceof Error
            ? legacyJudgeError.message
            : "Unable to create legacy judge mapping.",
      },
      { status: 500 },
    );
  }

  void insertSubmissionLog({
    submissionId: null,
    action: "JUDGE_CREATED",
    performedBy: auth.session.username,
    note: `Admin ${auth.session.username} created judge account for ${username}`,
  }).catch(() => {});

  return NextResponse.json({ judge: { id: judgeId, username } }, { status: 201 });
}
