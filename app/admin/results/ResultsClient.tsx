"use client";

import { Download } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShellConfig, type AdminMetric } from "../components/AdminShell";
import type { AdminSubmission } from "@/lib/types";
import { fetchAdminSubmissions } from "@/lib/client/admin-api";
import styles from "./Results.module.css";

type SettingsPayload = {
  settings?: {
    technical_execution_value?: number;
    problem_solution_fit_value?: number;
    innovation_creativity_value?: number;
    presentation_quality_value?: number;
  };
};

type AggregateRow = {
  id: string;
  projectName: string;
  teamName: string;
  judgeUsername: string;
  aveScore: number;
};

function buildMetrics(submissions: AdminSubmission[]): AdminMetric[] {
  const pending = submissions.filter((submission) => submission.status === "pending").length;
  const approved = submissions.filter((submission) => submission.status === "approved").length;
  const rejected = submissions.filter((submission) => submission.status === "rejected").length;

  return [
    {
      key: "total_submissions",
      label: "TOTAL_SUBMISSIONS",
      value: String(submissions.length),
      helper: "received",
      tone: "neutral",
    },
    {
      key: "pending",
      label: "PENDING",
      value: String(pending),
      helper: "awaiting review",
      tone: "amber",
    },
    {
      key: "approved",
      label: "APPROVED",
      value: String(approved),
      helper: "cleared for showcase",
      tone: "emerald",
    },
    {
      key: "rejected",
      label: "REJECTED",
      value: String(rejected),
      helper: "returned to team",
      tone: "red",
    },
    {
      key: "deadline_countdown",
      label: "DEADLINE_COUNTDOWN",
      value: "00.00.00",
      suffix: "s",
      helper: "until close",
      tone: "neutral",
    },
  ];
}

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function buildCsv(rows: AggregateRow[]) {
  const header = ["Project Name", "Team Name", "Judge Username", "Ave Score"];
  const values = rows.map((row) => [
    row.projectName,
    row.teamName,
    row.judgeUsername.toUpperCase(),
    `${row.aveScore}%`,
  ]);

  return [header, ...values]
    .map((row) => row.map((cell) => escapeCsv(cell)).join(","))
    .join("\n");
}

function normalizeMaxPoints(payload: SettingsPayload | null) {
  const technical =
    typeof payload?.settings?.technical_execution_value === "number"
      ? payload.settings.technical_execution_value
      : 30;
  const problemFit =
    typeof payload?.settings?.problem_solution_fit_value === "number"
      ? payload.settings.problem_solution_fit_value
      : 25;
  const innovation =
    typeof payload?.settings?.innovation_creativity_value === "number"
      ? payload.settings.innovation_creativity_value
      : 25;
  const presentation =
    typeof payload?.settings?.presentation_quality_value === "number"
      ? payload.settings.presentation_quality_value
      : 20;

  return Math.max(1, Math.round(technical + problemFit + innovation + presentation));
}

function buildAggregateRows(submissions: AdminSubmission[], overallMaxPoints: number) {
  const rows = submissions.flatMap((submission) =>
    submission.scores
      .filter(
        (score): score is { judgeId: string; score: number } =>
          typeof score.score === "number" && Number.isFinite(score.score),
      )
      .map((score, index) => {
        const normalizedPercent = (score.score / overallMaxPoints) * 100;
        return {
          id: `${submission.id}:${score.judgeId}:${index}`,
          projectName: submission.projectName,
          teamName: submission.teamName,
          judgeUsername: score.judgeId,
          aveScore: Math.round(normalizedPercent * 100) / 100,
        };
      }),
  );

  return rows.sort((left, right) => {
    if (right.aveScore !== left.aveScore) return right.aveScore - left.aveScore;
    const byProject = left.projectName.localeCompare(right.projectName);
    if (byProject !== 0) return byProject;
    return left.judgeUsername.localeCompare(right.judgeUsername);
  });
}

export default function ResultsClient() {
  const [data, setData] = useState<AdminSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportState, setExportState] = useState("");
  const [overallMaxPoints, setOverallMaxPoints] = useState(100);

  const shellMetrics = useMemo(() => buildMetrics(data), [data]);
  const aggregateRows = useMemo(
    () => buildAggregateRows(data, overallMaxPoints),
    [data, overallMaxPoints],
  );

  const loadResults = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [payload, settingsResponse] = await Promise.all([
        fetchAdminSubmissions(),
        fetch("/api/settings/public", { cache: "no-store" }),
      ]);

      setData(payload.submissions);

      if (settingsResponse.ok) {
        const settingsPayload = (await settingsResponse.json()) as SettingsPayload;
        setOverallMaxPoints(normalizeMaxPoints(settingsPayload));
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load aggregate scores.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadResults();
  }, [loadResults]);

  function exportScoresCsv() {
    const csv = buildCsv(aggregateRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "hackxperience-aggregate-scores.csv";
    link.click();
    URL.revokeObjectURL(url);
    setExportState("SCORES CSV READY");
  }

  return (
    <>
      <AdminShellConfig value={{ metrics: shellMetrics }} />

      <header className={styles.contentHeader}>
        <div>
          <h2>&gt; AGGREGATE_SCORES</h2>
          <p>
            {error
              ? `// ${error.toUpperCase()}`
              : (loading ? "// LOADING JUDGES SCORES" : `// AVE_SCORE = (OVERALL_POINTS / ${overallMaxPoints}) * 100`)}
          </p>
        </div>
        <button type="button" className={styles.exportButton} onClick={exportScoresCsv}>
          <Download aria-hidden="true" />
          <span>[ EXPORT SCORES CSV ]</span>
        </button>
      </header>

      <section className={styles.tablePanel}>
        <div className={styles.tableGrid}>
          <div className={styles.tableHead}>PROJECT_NAME</div>
          <div className={styles.tableHead}>TEAM_NAME</div>
          <div className={styles.tableHead}>JUDGE_USERNAME</div>
          <div className={styles.tableHead}>AVE_SCORE</div>

          {aggregateRows.map((row) => (
            <div className={styles.tableRow} key={row.id}>
              <div className={`${styles.tableCell} ${styles.projectCell}`} data-label="PROJECT_NAME">
                <span className={styles.projectName}>{row.projectName}</span>
              </div>
              <div className={styles.tableCell} data-label="TEAM_NAME">
                {row.teamName}
              </div>
              <div className={styles.tableCell} data-label="JUDGE_USERNAME">
                {row.judgeUsername}
              </div>
              <div className={`${styles.tableCell} ${styles.averageCell}`} data-label="AVE_SCORE">
                <span>{row.aveScore}</span>
                <span className={styles.averageSuffix}>%</span>
              </div>
            </div>
          ))}

          {aggregateRows.length === 0 ? (
            <div className={styles.tableRow}>
              <div className={`${styles.tableCell} ${styles.projectCell}`} data-label="PROJECT_NAME">
                <span className={styles.projectName}>NO SCORED PROJECTS YET</span>
              </div>
              <div className={styles.tableCell} data-label="TEAM_NAME">
                -
              </div>
              <div className={styles.tableCell} data-label="JUDGE_USERNAME">
                -
              </div>
              <div className={`${styles.tableCell} ${styles.averageCell}`} data-label="AVE_SCORE">
                <span>-</span>
                <span className={styles.averageSuffix}>%</span>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <p className={styles.exportState} aria-live="polite">
        {exportState}
      </p>
    </>
  );
}
