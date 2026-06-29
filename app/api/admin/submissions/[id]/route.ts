import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/route-guard";
import { supabaseServer } from "@/lib/supabase-server";
import { mapUiStatusToDb } from "@/lib/server/portal-data";
import { insertSubmissionLog } from "@/lib/server/activity-log";
import type { SubmissionStatus } from "@/lib/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseStatus(value: unknown): SubmissionStatus | null {
  if (value === "pending" || value === "approved" || value === "rejected") return value;
  return null;
}

async function insertAdminLog({
  submissionId,
  action,
  performedBy,
  note,
}: {
  submissionId: string;
  action: string;
  performedBy: string;
  note?: string | null;
}) {
  const { error } = await supabaseServer.from("submission_logs").insert({
    submission_id: submissionId,
    action,
    performed_by: performedBy,
    note: note ?? null,
  });

  // If the log table has not been provisioned yet, don't break admin actions.
  if (error && error.code !== "42P01") {
    throw new Error(error.message);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const auth = requireRole(request, "admin");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);

  const nextStatus = parseStatus(body?.status);
  const updatePayload: Record<string, unknown> = {};

  if (typeof body?.projectName === "string") updatePayload.project_name = body.projectName.trim();
  if (typeof body?.track === "string") updatePayload.track = body.track.trim();
  if (nextStatus) updatePayload.status = mapUiStatusToDb(nextStatus);
  if (typeof body?.githubUrl === "string") updatePayload.github_repo_url = body.githubUrl.trim();
  if (typeof body?.liveUrl === "string") updatePayload.live_demo_url = body.liveUrl.trim() || null;
  if (typeof body?.pitchDeckUrl === "string") updatePayload.pitch_deck_share_url = body.pitchDeckUrl.trim();
  if (typeof body?.videoDemoUrl === "string") updatePayload.demo_video_url = body.videoDemoUrl.trim() || null;
  if (typeof body?.description === "string") updatePayload.description = body.description;
  if (typeof body?.shortPitch === "string") updatePayload.pitch = body.shortPitch;
  if (typeof body?.adminNotes === "string") updatePayload.admin_notes = body.adminNotes || null;
  if (typeof body?.rejectionReason === "string") updatePayload.rejection_reason = body.rejectionReason || null;

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from("submissions")
    .update(updatePayload)
    .eq("id", id)
    .select("id,status,project_name")
    .maybeSingle<{ id: string; status: string; project_name: string | null }>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  const projectName = data.project_name ?? id;

  try {
    await insertAdminLog({
      submissionId: id,
      action: nextStatus ? nextStatus.toUpperCase() : "PROJECT_EDITED",
      performedBy: auth.session.username,
      note: nextStatus === "rejected"
        ? `Admin ${auth.session.username} rejected project ${projectName}`
        : nextStatus === "approved"
          ? `Admin ${auth.session.username} approved project ${projectName}`
          : !nextStatus
            ? `Admin ${auth.session.username} edited project ${projectName}`
            : null,
    });
  } catch {
    // Intentionally ignore non-critical audit failures here to avoid breaking UX.
  }

  return NextResponse.json({ ok: true, id: data.id, status: data.status });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const auth = requireRole(request, "admin");
  if (!auth.ok) return auth.response;

  const { id } = await params;

  // Fetch project name before cascade so the log note is meaningful.
  const { data: submissionForLog } = await supabaseServer
    .from("submissions")
    .select("project_name")
    .eq("id", id)
    .maybeSingle<{ project_name: string | null }>();
  const projectName = submissionForLog?.project_name ?? id;

  const deleteScores = await supabaseServer
    .from("judges_scores")
    .delete()
    .eq("submission_id", id);
  if (deleteScores.error) {
    return NextResponse.json({ error: deleteScores.error.message }, { status: 500 });
  }

  const deleteLogs = await supabaseServer
    .from("submission_logs")
    .delete()
    .eq("submission_id", id);
  if (deleteLogs.error && deleteLogs.error.code !== "42P01") {
    return NextResponse.json({ error: deleteLogs.error.message }, { status: 500 });
  }

  const { data, error } = await supabaseServer
    .from("submissions")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  // submission_id must be null here — the FK row no longer exists.
  void insertSubmissionLog({
    submissionId: null,
    action: "PROJECT_DELETED",
    performedBy: auth.session.username,
    note: `Admin ${auth.session.username} deleted project ${projectName}`,
  }).catch(() => {});

  return NextResponse.json({ ok: true, id: data.id });
}
