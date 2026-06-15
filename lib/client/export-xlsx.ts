"use client";

import type { AdminSubmission } from "@/lib/types";

type WriteXlsxFile = typeof import("write-excel-file/browser").default;
type ExcelFileContent = Blob | File | ArrayBuffer;
type ExcelRow = import("write-excel-file/browser").Row;
type ExcelSheet = import("write-excel-file/browser").Sheet<ExcelFileContent>;
type ExcelCell = string | number;

function numOrEmpty(v: number | null | undefined): number | string {
  return typeof v === "number" ? v : "";
}

function strOrEmpty(v: string | null | undefined): string {
  return typeof v === "string" ? v : "";
}

function makeHeaderRow(
  headers: string[],
): ExcelRow {
  return headers.map((header) => ({ value: header, fontWeight: "bold" as const }));
}

function createSheet(
  sheet: string,
  headers: string[],
  rows: ExcelRow[],
  widths: number[],
): ExcelSheet {
  return {
    sheet,
    stickyRowsCount: 1,
    columns: widths.map((width) => ({ width })),
    data: [makeHeaderRow(headers), ...rows],
  };
}

export async function exportScoresXlsx(
  submissions: AdminSubmission[],
  filename: string,
): Promise<void> {
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

  const aggregateRows = aggregated.map((row): ExcelRow => [row.project, row.team, row.avg]);
  const scoresOverviewSheet = createSheet(
    "Aggregate Overview",
    ["Project Name", "Team Name", "Overall Average Score"],
    aggregateRows,
    [32, 26, 24],
  );

  const detailedRows: ExcelRow[] = [];

  for (const sub of submissions) {
    for (const s of sub.scores) {
      if (s.score === null && s.technicalExecution == null) continue;
      detailedRows.push([
        sub.projectName,
        sub.teamName,
        s.judgeId,
        numOrEmpty(s.technicalExecution),
        numOrEmpty(s.problemSolutionFit),
        numOrEmpty(s.innovationCreativity),
        numOrEmpty(s.presentationQuality),
        numOrEmpty(s.score),
        strOrEmpty(s.comments),
      ]);
    }
  }

  const detailedBreakdownSheet = createSheet(
    "Detailed Judge Breakdown",
    [
      "Project Name",
      "Team Name",
      "Judge Username",
      "Technical Execution",
      "Problem/Solution Fit",
      "Innovation/Creativity",
      "Presentation Quality",
      "Total Judge Score",
      "Comments",
    ],
    detailedRows,
    [32, 26, 22, 22, 24, 24, 24, 20, 44],
  );

  await downloadWorkbook([scoresOverviewSheet, detailedBreakdownSheet], filename);
}

export async function exportProjectsXlsx(
  submissions: AdminSubmission[],
  filename: string,
): Promise<void> {
  const rows = submissions.map((sub): ExcelRow => [
    sub.projectName,
    sub.teamName,
    strOrEmpty(sub.teamId),
    sub.track,
    sub.status.toUpperCase(),
    sub.submittedAt,
    strOrEmpty(sub.githubUrl),
    strOrEmpty(sub.liveUrl),
    strOrEmpty(sub.pitchDeckUrl),
  ]);

  const projectsSheet = createSheet(
    "Projects",
    [
      "Project Name",
      "Team Name",
      "Team ID",
      "Track",
      "Status",
      "Submitted At",
      "GitHub URL",
      "Live URL",
      "Pitch Deck URL",
    ],
    rows,
    [32, 26, 16, 20, 14, 22, 40, 36, 36],
  );

  await downloadWorkbook([projectsSheet], filename);
}

async function downloadWorkbook(
  sheets: ExcelSheet[],
  filename: string,
): Promise<void> {
  const { default: writeXlsxFile } = (await import(
    "write-excel-file/browser"
  )) as { default: WriteXlsxFile };
  await writeXlsxFile(sheets).toFile(filename);
}
