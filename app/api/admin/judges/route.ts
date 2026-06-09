import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/route-guard";
import { supabaseServer } from "@/lib/supabase-server";
import {
  normalizePortalUsername,
  toSupabaseAuthEmail,
  usernameFromSupabaseEmail,
} from "@/lib/auth/portal-identity";

type JudgeRoleRow = {
  id: number | string;
  user_id: string;
  role: string;
};

type AuthUserListItem = {
  id: string;
  email?: string | null;
};

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

  const { data, error } = await supabaseServer
    .from("user_roles")
    .select("id,user_id,role")
    .eq("role", "judge")
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
      const id = Number(judgeRow.id);
      if (!Number.isFinite(id)) return null;

      const authUser = authUsers.get(judgeRow.user_id);
      const username =
        usernameFromSupabaseEmail(authUser?.email) ||
        authUser?.email ||
        `judge_${id}`;

      return { id, username };
    })
    .filter((entry): entry is { id: number; username: string } => Boolean(entry));

  return NextResponse.json({ judges });
}

export async function POST(request: NextRequest) {
  const auth = requireRole(request, "admin");
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const username = normalizePortalUsername(body?.username);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  const authEmail = toSupabaseAuthEmail(username);

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
    .insert({ user_id: authUserId, role: "judge" })
    .select("id")
    .single<{ id: number | string }>();

  if (roleError) {
    await supabaseServer.auth.admin.deleteUser(authUserId);
    return NextResponse.json({ error: roleError.message }, { status: 500 });
  }

  const judgeId = Number(roleRow?.id ?? Number.NaN);
  if (!Number.isFinite(judgeId)) {
    // Cleanup to avoid orphaned role if we cannot produce a stable ID for the UI.
    await Promise.all([
      supabaseServer.from("user_roles").delete().eq("user_id", authUserId).eq("role", "judge"),
      supabaseServer.auth.admin.deleteUser(authUserId),
    ]);
    return NextResponse.json({ error: "Unable to resolve judge identifier." }, { status: 500 });
  }

  return NextResponse.json({ judge: { id: judgeId, username } }, { status: 201 });
}
