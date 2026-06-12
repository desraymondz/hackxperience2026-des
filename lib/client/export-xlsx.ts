"use client";

import type { AdminSubmission } from "@/lib/types";

const BOLD = { bold: true } as const;
const FREEZE_ROW_1 = [{ state: "frozen" as const, ySplit: 1 }];

function numOrEmpty(v: number | null | undefined): number | string {
  return typeof v === "number" ? v : "";
}

function strOrEmpty(v: string | null | undefined): string {
  return typeof v === "string" ? v : "";
}

export async function exportScoresXlsx(
  submissions: AdminSubmission[],
  filename: string,
): Promise<void> {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "HackXperience Admin";
  wb.created = new Date();

  // ── Sheet 1: Aggregate Overview ─────────────────────────────────────────────
  const ws1 = wb.addWorksheet("Aggregate Overview");
  ws1.columns = [
    { header: "Project Name",          key: "project", width: 32 },
    { header: "Team Name",             key: "team",    width: 26 },
    { header: "Overall Average Score", key: "avg",     width: 24 },
  ];
  ws1.views = FREEZE_ROW_1;
  ws1.getRow(1).eachCell((cell) => { cell.font = BOLD; });

  const aggregated = submissions
    .map((sub) => {
      const valid = sub.scores.filter(
        (s): s is typeof s & { score: number } =>
          typeof s.score === "number" && Number.isFinite(s.score),
      );
      if (valid.length === 0) return null;
      const avg = valid.reduce((sum, s) => sum + s.score, 0) / valid.length;
      return { project: sub.projectName, team: sub.teamName, avg: +avg.toFixed(2) };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => b.avg - a.avg || a.project.localeCompare(b.project));

  for (const row of aggregated) ws1.addRow(row);

  // ── Sheet 2: Detailed Judge Breakdown ────────────────────────────────────────
  const ws2 = wb.addWorksheet("Detailed Judge Breakdown");
  ws2.columns = [
    { header: "Project Name",           key: "project",  width: 32 },
    { header: "Team Name",              key: "team",     width: 26 },
    { header: "Judge Username",         key: "judge",    width: 22 },
    { header: "Technical Execution",    key: "te",       width: 22 },
    { header: "Problem/Solution Fit",   key: "psf",      width: 24 },
    { header: "Innovation/Creativity",  key: "ic",       width: 24 },
    { header: "Presentation Quality",   key: "pq",       width: 24 },
    { header: "Total Judge Score",      key: "total",    width: 20 },
    { header: "Comments",               key: "comments", width: 44 },
  ];
  ws2.views = FREEZE_ROW_1;
  ws2.getRow(1).eachCell((cell) => { cell.font = BOLD; });

  for (const sub of submissions) {
    for (const s of sub.scores) {
      // Skip rows where the judge hasn't submitted anything yet
      if (s.score === null && s.technicalExecution == null) continue;
      ws2.addRow({
        project:  sub.projectName,
        team:     sub.teamName,
        judge:    s.judgeId,
        te:       numOrEmpty(s.technicalExecution),
        psf:      numOrEmpty(s.problemSolutionFit),
        ic:       numOrEmpty(s.innovationCreativity),
        pq:       numOrEmpty(s.presentationQuality),
        total:    numOrEmpty(s.score),
        comments: strOrEmpty(s.comments),
      });
    }
  }

  await downloadWorkbook(wb, filename);
}

export async function exportProjectsXlsx(
  submissions: AdminSubmission[],
  filename: string,
): Promise<void> {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "HackXperience Admin";
  wb.created = new Date();

  const ws = wb.addWorksheet("Projects");
  ws.columns = [
    { header: "Project Name",   key: "project",   width: 32 },
    { header: "Team Name",      key: "team",       width: 26 },
    { header: "Team ID",        key: "teamId",     width: 16 },
    { header: "Track",          key: "track",      width: 20 },
    { header: "Status",         key: "status",     width: 14 },
    { header: "Submitted At",   key: "submitted",  width: 22 },
    { header: "GitHub URL",     key: "github",     width: 40 },
    { header: "Live URL",       key: "live",       width: 36 },
    { header: "Pitch Deck URL", key: "pitchDeck",  width: 36 },
  ];
  ws.views = FREEZE_ROW_1;
  ws.getRow(1).eachCell((cell) => { cell.font = BOLD; });

  for (const sub of submissions) {
    ws.addRow({
      project:   sub.projectName,
      team:      sub.teamName,
      teamId:    strOrEmpty(sub.teamId),
      track:     sub.track,
      status:    sub.status.toUpperCase(),
      submitted: sub.submittedAt,
      github:    strOrEmpty(sub.githubUrl),
      live:      strOrEmpty(sub.liveUrl),
      pitchDeck: strOrEmpty(sub.pitchDeckUrl),
    });
  }

  await downloadWorkbook(wb, filename);
}

async function downloadWorkbook(
  wb: import("exceljs").Workbook,
  filename: string,
): Promise<void> {
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
