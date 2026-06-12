import { supabaseServer } from "@/lib/supabase-server";

export async function insertSubmissionLog({
  submissionId,
  action,
  performedBy,
  note,
}: {
  submissionId?: string | null;
  action: string;
  performedBy: string;
  note?: string | null;
}): Promise<void> {
  const { error } = await supabaseServer.from("submission_logs").insert({
    submission_id: submissionId ?? null,
    action,
    performed_by: performedBy,
    note: note ?? null,
  });

  // Gracefully swallow missing-table error so callers don't break before migration runs.
  if (error && error.code !== "42P01") {
    throw new Error(error.message);
  }
}
