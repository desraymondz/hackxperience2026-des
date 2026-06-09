import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { normalizePortalUsername, toSupabaseAuthEmail } from "@/lib/auth/portal-identity";
import { hashPasswordSha256 } from "@/lib/auth/password";
import { requireRole } from "@/lib/auth/route-guard";
import { supabaseServer } from "@/lib/supabase-server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type JudgeRow = {
  id: number;
  username: string;
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

async function findAuthUserByEmail(email: string): Promise<AuthUserListItem | null> {
  let page = 1;
  const normalizedEmail = email.toLowerCase();

  for (let checkedPages = 0; checkedPages < AUTH_MAX_PAGES; checkedPages += 1) {
    const { data, error } = await supabaseServer.auth.admin.listUsers({
      page,
      perPage: AUTH_PER_PAGE,
    });

    if (error) throw new Error(error.message);

    const user = (data.users as AuthUserListItem[]).find(
      (candidate) => (candidate.email ?? "").toLowerCase() === normalizedEmail,
    );
    if (user) return user;

    if (!data.nextPage) return null;
    page = data.nextPage;
  }

  return null;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const auth = requireRole(request, "admin");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const judgeId = Number(id);
  if (!Number.isInteger(judgeId)) {
    return NextResponse.json({ error: "Invalid judge id." }, { status: 400 });
  }

  const { data: existingJudge, error: existingJudgeError } = await supabaseServer
    .from("judges")
    .select("id,username")
    .eq("id", judgeId)
    .maybeSingle<JudgeRow>();

  if (existingJudgeError) {
    return NextResponse.json({ error: existingJudgeError.message }, { status: 500 });
  }
  if (!existingJudge) {
    return NextResponse.json({ error: "Judge not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const nextUsername = normalizePortalUsername(body?.username);
  const nextPassword = typeof body?.password === "string" ? body.password : "";

  if (!nextUsername && !nextPassword) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  const currentAuthEmail = toSupabaseAuthEmail(existingJudge.username);
  let authUser: AuthUserListItem | null = null;
  try {
    authUser = await findAuthUserByEmail(currentAuthEmail);
  } catch (authLookupError) {
    return NextResponse.json(
      { error: authLookupError instanceof Error ? authLookupError.message : "Unable to load auth user." },
      { status: 500 },
    );
  }

  if (!authUser) {
    return NextResponse.json(
      { error: "Linked auth user not found for this judge account." },
      { status: 404 },
    );
  }

  const authUpdatePayload: { email?: string; password?: string; email_confirm?: boolean } = {};
  const judgeUpdatePayload: { username?: string; password?: string } = {};

  if (nextUsername) {
    authUpdatePayload.email = toSupabaseAuthEmail(nextUsername);
    authUpdatePayload.email_confirm = true;
    judgeUpdatePayload.username = nextUsername;
  }

  if (nextPassword) {
    authUpdatePayload.password = nextPassword;
    // Keep legacy non-null password field populated without storing active credentials.
    judgeUpdatePayload.password = hashPasswordSha256(randomUUID());
  }

  const { error: authUpdateError } = await supabaseServer.auth.admin.updateUserById(
    authUser.id,
    authUpdatePayload,
  );

  if (authUpdateError) {
    if (isAuthDuplicateError(authUpdateError.message)) {
      return NextResponse.json({ error: "Judge username already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: authUpdateError.message }, { status: 500 });
  }

  const { data, error } = await supabaseServer
    .from("judges")
    .update(judgeUpdatePayload)
    .eq("id", judgeId)
    .select("id,username")
    .maybeSingle<JudgeRow>();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Judge username already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Judge not found." }, { status: 404 });
  }

  return NextResponse.json({ judge: data });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const auth = requireRole(request, "admin");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const judgeId = Number(id);
  if (!Number.isInteger(judgeId)) {
    return NextResponse.json({ error: "Invalid judge id." }, { status: 400 });
  }

  const { data: existingJudge, error: existingJudgeError } = await supabaseServer
    .from("judges")
    .select("id,username")
    .eq("id", judgeId)
    .maybeSingle<JudgeRow>();

  if (existingJudgeError) {
    return NextResponse.json({ error: existingJudgeError.message }, { status: 500 });
  }
  if (!existingJudge) {
    return NextResponse.json({ error: "Judge not found." }, { status: 404 });
  }

  const authEmail = toSupabaseAuthEmail(existingJudge.username);
  let authUser: AuthUserListItem | null = null;
  try {
    authUser = await findAuthUserByEmail(authEmail);
  } catch (authLookupError) {
    return NextResponse.json(
      { error: authLookupError instanceof Error ? authLookupError.message : "Unable to load auth user." },
      { status: 500 },
    );
  }

  if (authUser) {
    const roleDelete = await supabaseServer
      .from("user_roles")
      .delete()
      .eq("user_id", authUser.id)
      .eq("role", "judge");

    if (roleDelete.error) {
      return NextResponse.json({ error: roleDelete.error.message }, { status: 500 });
    }

    const { error: authDeleteError } = await supabaseServer.auth.admin.deleteUser(authUser.id);
    if (authDeleteError) {
      return NextResponse.json({ error: authDeleteError.message }, { status: 500 });
    }
  }

  const scoreDelete = await supabaseServer
    .from("judges_scores")
    .delete()
    .eq("judges_id", judgeId);

  if (scoreDelete.error) {
    return NextResponse.json({ error: scoreDelete.error.message }, { status: 500 });
  }

  const { data, error } = await supabaseServer
    .from("judges")
    .delete()
    .eq("id", judgeId)
    .select("id")
    .maybeSingle<{ id: number }>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Judge not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
