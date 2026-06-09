import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type PublicSettingsRow = {
  id: number;
  submission_status: boolean;
  resubmission_status: boolean;
  max_team_size: number;
  max_file_size: number | null;
  deadline: string;
  active_tracks: string[] | null;
  updated_at: string;
};

const DEFAULT_MAX_FILE_SIZE_MB = 10;

export async function GET() {
  const { data, error } = await supabaseServer
    .from("settings")
    .select("id,submission_status,resubmission_status,max_team_size,max_file_size,deadline,active_tracks,updated_at")
    .eq("id", 1)
    .maybeSingle<PublicSettingsRow>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Settings row missing at id=1." }, { status: 404 });
  }

  return NextResponse.json({
    settings: {
      ...data,
      max_file_size: typeof data.max_file_size === "number"
        ? Math.max(1, Math.round(data.max_file_size))
        : DEFAULT_MAX_FILE_SIZE_MB,
      active_tracks: Array.isArray(data.active_tracks)
        ? data.active_tracks.filter((item): item is string => typeof item === "string")
        : [],
    },
  });
}
