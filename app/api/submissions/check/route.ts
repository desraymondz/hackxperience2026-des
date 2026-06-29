import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// Allowlist of direct-column fields to prevent arbitrary column injection
const COLUMN_FIELDS = new Set([
  "team_id",
  "project_name",
]);

// GET /api/submissions/check?field=<db_field>&value=<val>
// Special field: member_email — queries inside the members JSONB array
export async function GET(req: NextRequest) {
  const field = req.nextUrl.searchParams.get("field")?.trim();
  const value = req.nextUrl.searchParams.get("value")?.trim();

  // Legacy support: ?teamId=... (used by earlier implementation)
  const legacyTeamId = req.nextUrl.searchParams.get("teamId")?.trim();
  const resolvedField = field ?? (legacyTeamId ? "team_id" : null);
  const resolvedValue = value ?? legacyTeamId ?? null;

  if (!resolvedField || !resolvedValue) {
    return NextResponse.json({ exists: false });
  }

  if (resolvedField === "member_email") {
    const { data } = await supabaseServer
      .from("submissions")
      .select("id")
      .filter("members", "cs", JSON.stringify([{ email: resolvedValue }]))
      .maybeSingle();
    return NextResponse.json({ exists: data !== null });
  }

  if (!COLUMN_FIELDS.has(resolvedField)) {
    return NextResponse.json({ exists: false });
  }

  const { data } = await supabaseServer
    .from("submissions")
    .select("id")
    .eq(resolvedField, resolvedValue)
    .maybeSingle();

  return NextResponse.json({ exists: data !== null });
}
