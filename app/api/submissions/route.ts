import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { insertSubmissionLog } from "@/lib/server/activity-log";

// POST /api/submissions — create a new submission
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) ?? {};
  const isDraft = typeof body?.isDraft === "boolean" ? body.isDraft : true;

  const { data, error } = await supabaseServer
    .from("submissions")
    .insert({
      project_name:        body.projectName,
      team_id:             body.teamId,
      track:               body.track,
      description:         body.description,
      pitch:               body.pitch,
      tech_stack:          body.techStack ?? [],
      thumbnail_url:       body.thumbnailUrl ?? null,
      github_repo_url:       body.githubRepoUrl,
      live_demo_url:         body.liveDemoUrl || null,
      pitch_deck_share_url:  body.pitchDeckShareUrl,
      pitch_deck_upload_url: body.pitchDeckUploadUrl ?? null,
      demo_video_url:        body.demoVideoUrl || null,
      members:               body.members ?? [],
      notes:                 body.notes || null,
      is_draft:              isDraft,
    })
    .select("id, edit_token")
    .single();

  if (error) {
    // team_id unique violation — team already submitted
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A submission for this Team ID already exists. Use your edit link to update it." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  void insertSubmissionLog({
    submissionId: data.id,
    action: "SUBMITTED",
    performedBy: `team:${body.teamId ?? ""}`,
    note: `Team ${body.teamId ?? ""} submitted project ${body.projectName ?? ""}`,
  }).catch(() => {});

  return NextResponse.json({ id: data.id, editToken: data.edit_token }, { status: 201 });
}
