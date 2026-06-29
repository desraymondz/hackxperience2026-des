import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type UploadLimitRow = {
  max_file_size: number | null;
};

const DEFAULT_MAX_FILE_SIZE_MB = 10;

export async function GET() {
  const { data, error } = await supabaseServer
    .from("settings")
    .select("max_file_size")
    .eq("id", 1)
    .maybeSingle<UploadLimitRow>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const configured = typeof data?.max_file_size === "number" ? Math.round(data.max_file_size) : DEFAULT_MAX_FILE_SIZE_MB;
  const maxFileSizeMb = Math.max(1, configured);

  return NextResponse.json({ max_file_size: maxFileSizeMb });
}
