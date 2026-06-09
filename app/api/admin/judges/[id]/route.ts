import { NextRequest, NextResponse } from "next/server";
import { normalizePortalUsername, toSupabaseAuthEmail, usernameFromSupabaseEmail } from "@/lib/auth/portal-identity";
import { requireRole } from "@/lib/auth/route-guard";
import { supabaseServer } from "@/lib/supabase-server";

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

async function findJudgeRoleById(id: number) {
  return supabaseServer
    .from("user_roles")
    .select("id,user_id,role")
    .eq("id", id)
    .eq("role", "judge")
    .maybeSingle<JudgeRoleRow>();
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const auth = requireRole(request, "admin");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const judgeId = Number(id);
  if (!Number.isInteger(judgeId)) {
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
  const judgeId = Number(id);
  if (!Number.isInteger(judgeId)) {
    return NextResponse.json({ error: "Invalid judge id." }, { status: 400 });
  }

  const { data: judgeRole, error: judgeRoleError } = await findJudgeRoleById(judgeId);
  if (judgeRoleError) {
    return NextResponse.json({ error: judgeRoleError.message }, { status: 500 });
  }
  if (!judgeRole) {
    return NextResponse.json({ error: "Judge not found." }, { status: 404 });
  }

  const { error: authDeleteError } = await supabaseServer.auth.admin.deleteUser(judgeRole.user_id);
  if (authDeleteError) {
    return NextResponse.json({ error: authDeleteError.message }, { status: 500 });
  }

  const { error: roleDeleteError } = await supabaseServer
    .from("user_roles")
    .delete()
    .eq("id", judgeId)
    .eq("role", "judge");

  if (roleDeleteError) {
    return NextResponse.json({ error: roleDeleteError.message }, { status: 500 });
  }

  const scoreDelete = await supabaseServer
    .from("judges_scores")
    .delete()
    .eq("judges_id", judgeId);

  if (scoreDelete.error && !isMissingTableError(scoreDelete.error)) {
    return NextResponse.json({ error: scoreDelete.error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: judgeId });
}
