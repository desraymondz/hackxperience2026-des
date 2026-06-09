import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/route-guard";
import { supabaseServer } from "@/lib/supabase-server";
import { mapSubmissionToAdminView, totalScore, type JudgeScoreRow } from "@/lib/server/portal-data";
import { usernameFromSupabaseEmail } from "@/lib/auth/portal-identity";
import type { SubmissionRow } from "@/lib/types";

type JudgeRoleRow = {
  id: number | string;
  user_id: string;
  role: string;
};

type AuthUserListItem = {
  id: string;
  email?: string | null;
};

const AUTH_PER_PAGE = 200;
const AUTH_MAX_PAGES = 25;

function isMissingTableError(error: { code?: string; message?: string } | null | undefined) {
  if (!error) return false;
  const message = (error.message ?? "").toLowerCase();
  return error.code === "42P01" || error.code === "PGRST205" || message.includes("could not find the table");
}

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

  const [submissionsResult, scoreRowsResult, judgeRolesResult] = await Promise.all([
    supabaseServer
      .from("submissions")
      .select("*")
      .order("submitted_at", { ascending: false }),
    supabaseServer
      .from("judges_scores")
      .select("judges_id,submission_id,technical_execution,problem_solution_fit,innovation_creativity,presentation_quality,private_comment"),
    supabaseServer
      .from("user_roles")
      .select("id,user_id,role")
      .eq("role", "judge")
      .order("id", { ascending: true }),
  ]);

  if (submissionsResult.error) {
    return NextResponse.json({ error: submissionsResult.error.message }, { status: 500 });
  }
  if (scoreRowsResult.error) {
    return NextResponse.json({ error: scoreRowsResult.error.message }, { status: 500 });
  }

  const submissions = (submissionsResult.data ?? []) as SubmissionRow[];
  const scoreRows = (scoreRowsResult.data ?? []) as JudgeScoreRow[];

  const scoreRowsBySubmission = new Map<string, JudgeScoreRow[]>();
  for (const row of scoreRows) {
    const bucket = scoreRowsBySubmission.get(row.submission_id) ?? [];
    bucket.push(row);
    scoreRowsBySubmission.set(row.submission_id, bucket);
  }

  let judgeLookup: Array<{ id: number; judgeId: string }> = [];
  if (!judgeRolesResult.error) {
    try {
      const authUsers = await listAuthUsersById();
      judgeLookup = ((judgeRolesResult.data ?? []) as JudgeRoleRow[])
        .map((roleRow) => {
          const id = Number(roleRow.id);
          if (!Number.isFinite(id)) return null;

          const authUser = authUsers.get(roleRow.user_id);
          const username =
            usernameFromSupabaseEmail(authUser?.email) ||
            authUser?.email ||
            `judge_${id}`;

          return { id, judgeId: username };
        })
        .filter((entry): entry is { id: number; judgeId: string } => Boolean(entry));
    } catch (authError) {
      return NextResponse.json(
        { error: authError instanceof Error ? authError.message : "Unable to load auth users." },
        { status: 500 },
      );
    }
  } else if (!isMissingTableError(judgeRolesResult.error)) {
    return NextResponse.json({ error: judgeRolesResult.error.message }, { status: 500 });
  }

  const legacyJudgeIds = Array.from(new Set(scoreRows.map((row) => row.judges_id)))
    .filter((judgeId) => !judgeLookup.some((judge) => judge.id === judgeId));

  const judgeColumns =
    judgeLookup.length > 0
      ? [
          ...judgeLookup,
          ...legacyJudgeIds.map((judgeId) => ({ id: judgeId, judgeId: String(judgeId) })),
        ]
      : legacyJudgeIds.map((judgeId) => ({ id: judgeId, judgeId: String(judgeId) }));

  const judgeIds = judgeColumns.map((judge) => judge.judgeId);

  const adminSubmissions = submissions.map((submission) => {
    const rows = scoreRowsBySubmission.get(submission.id) ?? [];

    const scores =
      judgeColumns.length > 0
        ? judgeColumns.map((judge) => {
            const row = rows.find((candidate) => candidate.judges_id === judge.id);
            return { judgeId: judge.judgeId, score: totalScore(row) };
          })
        : rows.map((row) => ({
            judgeId: String(row.judges_id),
            score: totalScore(row),
          }));

    return mapSubmissionToAdminView(submission, scores);
  });

  return NextResponse.json({
    submissions: adminSubmissions,
    judgeIds,
    session: {
      username: auth.session.username,
      role: auth.session.role,
    },
  });
}
