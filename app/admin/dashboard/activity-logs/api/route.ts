import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/route-guard";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const auth = requireRole(request, "admin");
  if (!auth.ok) return auth.response;

  const { data, error } = await supabaseServer
    .from("submission_logs")
    .select("id, submission_id, action, performed_by, note, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    if (
      error.code === "42P01" ||
      error.message.toLowerCase().includes("does not exist") ||
      error.message.toLowerCase().includes("relation")
    ) {
      return NextResponse.json({ logs: [] });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ logs: data ?? [] });
}
