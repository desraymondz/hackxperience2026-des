import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireRole } from "@/lib/auth/route-guard";
import { supabaseServer } from "@/lib/supabase-server";
import { hashPasswordSha256 } from "@/lib/auth/password";
import { normalizePortalUsername, toSupabaseAuthEmail } from "@/lib/auth/portal-identity";

type JudgeRow = {
  id: number;
  username: string;
};

function isAuthDuplicateError(message: string | undefined) {
  const normalized = message?.toLowerCase() ?? "";
  return normalized.includes("already") || normalized.includes("duplicate");
}

export async function GET(request: NextRequest) {
  const auth = requireRole(request, "admin");
  if (!auth.ok) return auth.response;

  const { data, error } = await supabaseServer
    .from("judges")
    .select("id,username")
    .order("id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ judges: (data ?? []) as JudgeRow[] });
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
  const placeholderLegacyPassword = hashPasswordSha256(randomUUID());

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
  const { data, error } = await supabaseServer
    .from("judges")
    .insert({ username, password: placeholderLegacyPassword })
    .select("id,username")
    .single<JudgeRow>();

  if (error) {
    await supabaseServer.auth.admin.deleteUser(authUserId);
    if (error.code === "23505") {
      return NextResponse.json({ error: "Judge username already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { error: roleError } = await supabaseServer
    .from("user_roles")
    .insert({ user_id: authUserId, role: "judge" });

  if (roleError) {
    await Promise.all([
      supabaseServer.from("judges").delete().eq("id", data.id),
      supabaseServer.auth.admin.deleteUser(authUserId),
    ]);
    return NextResponse.json({ error: roleError.message }, { status: 500 });
  }

  return NextResponse.json({ judge: data }, { status: 201 });
}
