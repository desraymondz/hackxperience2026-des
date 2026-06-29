import { NextRequest, NextResponse } from "next/server";
import { normalizePortalUsername, toSupabaseAuthEmail, usernameFromSupabaseEmail } from "@/lib/auth/portal-identity";
import { requireRole } from "@/lib/auth/route-guard";
import { supabaseServer } from "@/lib/supabase-server";
import { resolveJudgeScoresIdColumn } from "@/lib/server/judge-scores";
import { insertSubmissionLog } from "@/lib/server/activity-log";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type JudgeRoleRow = {
  id: number | string;
  user_id: string;
  role: string;
};

type AuthUserListItem = {
  id: string;
  email?: string | null;
};

const JUDGE_ROLE = "JUDGE";

const AUTH_PER_PAGE = 200;
const AUTH_MAX_PAGES = 25;

function isAuthDuplicateError(message: string | undefined) {
  const normalized = message?.toLowerCase() ?? "";
  return normalized.includes("already") || normalized.includes("duplicate");
}

function isMissingTableError(error: { code?: string; message?: string } | null | undefined) {
  if (!error) return false;
  const message = (error.message ?? "").toLowerCase();
  return error.code === "42P01" || error.code === "PGRST205" || message.includes("could not find the table");
}

async function findAuthUserById(userId: string): Promise<AuthUserListItem | null> {
  let page = 1;

  for (let checkedPages = 0; checkedPages < AUTH_MAX_PAGES; checkedPages += 1) {
    const { data, error } = await supabaseServer.auth.admin.listUsers({
      page,
      perPage: AUTH_PER_PAGE,
    });

    if (error) throw new Error(error.message);

    const user = (data.users as AuthUserListItem[]).find((candidate) => candidate.id === userId);
    if (user) return user;

    if (!data.nextPage) return null;
    page = data.nextPage;
  }

  return null;
}

function normalizeRoleRowId(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  if (typeof value === "string") return value.trim();
  return "";
}

function toDatabaseRoleId(id: string): string | number {
  if (/^\d+$/.test(id)) {
    const asNumber = Number(id);
    if (Number.isSafeInteger(asNumber)) return asNumber;
  }
  return id;
}

async function findJudgeRoleById(id: string) {
  const lookupId = toDatabaseRoleId(id);
  return supabaseServer
    .from("user_roles")
    .select("id,user_id,role")
    .eq("id", lookupId)
    .ilike("role", JUDGE_ROLE)
    .maybeSingle<JudgeRoleRow>();
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const auth = requireRole(request, "admin");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const judgeId = normalizeRoleRowId(id);
  if (!judgeId) {
    return NextResponse.json({ error: "Invalid judge id." }, { status: 400 });
  }

  const { data: judgeRole, error: judgeRoleError } = await findJudgeRoleById(judgeId);
  if (judgeRoleError) {
    return NextResponse.json({ error: judgeRoleError.message }, { status: 500 });
  }
  if (!judgeRole) {
    return NextResponse.json({ error: "Judge not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const nextUsername = normalizePortalUsername(body?.username);
  const nextPassword = typeof body?.password === "string" ? body.password : "";

  if (!nextUsername && !nextPassword) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  const authUpdatePayload: { email?: string; password?: string; email_confirm?: boolean } = {};
  if (nextUsername) {
    authUpdatePayload.email = toSupabaseAuthEmail(nextUsername);
    authUpdatePayload.email_confirm = true;
  }
  if (nextPassword) {
    authUpdatePayload.password = nextPassword;
  }

  const { error: authUpdateError } = await supabaseServer.auth.admin.updateUserById(
    judgeRole.user_id,
    authUpdatePayload,
  );

  if (authUpdateError) {
    if (isAuthDuplicateError(authUpdateError.message)) {
      return NextResponse.json({ error: "Judge username already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: authUpdateError.message }, { status: 500 });
  }

  const authUser = await findAuthUserById(judgeRole.user_id).catch(() => null);
  const username = nextUsername || usernameFromSupabaseEmail(authUser?.email) || judgeRole.user_id;

  return NextResponse.json({ judge: { id: judgeId, username } });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const auth = requireRole(request, "admin");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const judgeId = normalizeRoleRowId(id);
  if (!judgeId) {
    return NextResponse.json({ error: "Invalid judge id." }, { status: 400 });
  }

  const { data: judgeRole, error: judgeRoleError } = await findJudgeRoleById(judgeId);
  if (judgeRoleError) {
    return NextResponse.json({ error: judgeRoleError.message }, { status: 500 });
  }
  if (!judgeRole) {
    return NextResponse.json({ error: "Judge not found." }, { status: 404 });
  }

  // Capture username before the auth user is deleted so the log note is meaningful.
  const authUserForLog = await findAuthUserById(judgeRole.user_id).catch(() => null);
  const judgeUsername = usernameFromSupabaseEmail(authUserForLog?.email) || judgeId;

  const { error: authDeleteError } = await supabaseServer.auth.admin.deleteUser(judgeRole.user_id);
  if (authDeleteError) {
    return NextResponse.json({ error: authDeleteError.message }, { status: 500 });
  }

  const { error: roleDeleteError } = await supabaseServer
    .from("user_roles")
    .delete()
    .eq("id", toDatabaseRoleId(judgeId))
    .ilike("role", JUDGE_ROLE);

  if (roleDeleteError) {
    return NextResponse.json({ error: roleDeleteError.message }, { status: 500 });
  }

  let judgeScoreIdColumn: Awaited<ReturnType<typeof resolveJudgeScoresIdColumn>>;
  try {
    judgeScoreIdColumn = await resolveJudgeScoresIdColumn();
  } catch (columnError) {
    return NextResponse.json(
      { error: columnError instanceof Error ? columnError.message : "Unable to resolve judge score column." },
      { status: 500 },
    );
  }

  const scoreDelete = await supabaseServer
    .from("judges_scores")
    .delete()
    .eq(judgeScoreIdColumn, toDatabaseRoleId(judgeId));

  if (scoreDelete.error && !isMissingTableError(scoreDelete.error)) {
    return NextResponse.json({ error: scoreDelete.error.message }, { status: 500 });
  }

  void insertSubmissionLog({
    submissionId: null,
    action: "JUDGE_DELETED",
    performedBy: auth.session.username,
    note: `Admin ${auth.session.username} deleted judge account ${judgeUsername}`,
  }).catch(() => {});

  return NextResponse.json({ ok: true, id: judgeId });
}
