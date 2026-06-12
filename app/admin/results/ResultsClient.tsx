"use client";

import { Download } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShellConfig, type AdminMetric } from "../components/AdminShell";
import type { AdminSubmission } from "@/lib/types";
import { fetchAdminSubmissions } from "@/lib/client/admin-api";
import styles from "./Results.module.css";

type JudgeBreakdown = {
  judgeId: string;
  normalizedPct: number;
};

type ProjectRow = {
  id: string;
  projectName: string;
  teamName: string;
  aveScore: number;
  breakdowns: JudgeBreakdown[];
};

function buildMetrics(submissions: AdminSubmission[]): AdminMetric[] {
  const pending  = submissions.filter((s) => s.status === "pending").length;
  const approved = submissions.filter((s) => s.status === "approved").length;
  const rejected = submissions.filter((s) => s.status === "rejected").length;
  return [
    { key: "total_submissions", label: "TOTAL_SUBMISSIONS", value: String(submissions.length), helper: "received",            tone: "neutral"  },
    { key: "pending",           label: "PENDING",           value: String(pending),             helper: "awaiting review",    tone: "amber"    },
    { key: "approved",          label: "APPROVED",          value: String(approved),            helper: "cleared for showcase", tone: "emerald" },
    { key: "rejected",          label: "REJECTED",          value: String(rejected),            helper: "returned to team",   tone: "red"      },
    { key: "deadline_countdown", label: "DEADLINE_COUNTDOWN", value: "00.00.00", suffix: "s",   helper: "until close",        tone: "neutral"  },
  ];
}


function buildProjectRows(submissions: AdminSubmission[]): ProjectRow[] {
  const rows: ProjectRow[] = [];

  for (const submission of submissions) {
    const scored = submission.scores.filter(
      (s): s is { judgeId: string; score: number } =>
        typeof s.score === "number" && Number.isFinite(s.score),
    );
    if (scored.length === 0) continue;

    const totalRaw = scored.reduce((sum, s) => sum + s.score, 0);
    const aveScore = Math.round((totalRaw / scored.length) * 10000) / 100;

    rows.push({
      id: submission.id,
      projectName: submission.projectName,
      teamName: submission.teamName,
      aveScore,
      breakdowns: scored.map((s) => ({
        judgeId: s.judgeId,
        normalizedPct: Math.round(s.score * 10000) / 100,
      })),
    });
  }

  return rows.sort((a, b) => b.aveScore - a.aveScore || a.projectName.localeCompare(b.projectName));
}

export default function ResultsClient() {
  const [data,             setData]             = useState<AdminSubmission[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState("");
  const [exportState, setExportState] = useState("");
  const [expanded,    setExpanded]    = useState<Set<string>>(new Set());

  const shellMetrics = useMemo(() => buildMetrics(data), [data]);
  const projectRows  = useMemo(() => buildProjectRows(data), [data]);

  const loadResults = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await fetchAdminSubmissions();
      setData(payload.submissions);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load aggregate scores.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadResults(); }, [loadResults]);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function exportScoresXlsx() {
    const { exportScoresXlsx: doExport } = await import("@/lib/client/export-xlsx");
    await doExport(data, "hackxperience-aggregate-scores.xlsx");
    setExportState("SCORES XLSX READY");
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
              : loading
              ? "// LOADING JUDGES SCORES"
              : "// AVE_SCORE = SUM_OF_SCORES / JUDGE_COUNT"}
          </p>
        </div>
        <button type="button" className={styles.exportButton} onClick={exportScoresXlsx}>
          <Download aria-hidden="true" />
          <span>[ EXPORT SCORES XLSX ]</span>
        </button>
      </header>

      <section className={styles.tablePanel}>
        <div className={styles.tableGrid}>

          {/* ── Column headers ───────────────────────────── */}
          <div className={styles.tableHead}>PROJECT_NAME</div>
          <div className={styles.tableHead}>TEAM_NAME</div>
          <div className={styles.tableHead}>AVE_SCORE</div>
          <div className={styles.tableHead} />

          {/* ── Body ─────────────────────────────────────── */}
          {loading ? (
            <div className={styles.emptyRow}>// LOADING...</div>
          ) : projectRows.length === 0 ? (
            <div className={styles.emptyRow}>[ NO SCORED PROJECTS YET ]</div>
          ) : (
            projectRows.map((row) => {
              const isOpen = expanded.has(row.id);
              return (
                <div className={styles.projectGroup} key={row.id}>

                  {/* Main collapsed row */}
                  <div
                    className={styles.mainRow}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isOpen}
                    onClick={() => toggleExpand(row.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleExpand(row.id);
                      }
                    }}
                  >
                    <div className={`${styles.tableCell} ${styles.projectCell}`} data-label="PROJECT_NAME">
                      <span className={styles.projectName}>{row.projectName}</span>
                    </div>
                    <div className={styles.tableCell} data-label="TEAM_NAME">
                      {row.teamName}
                    </div>
                    <div className={`${styles.tableCell} ${styles.averageCell}`} data-label="AVE_SCORE">
                      {row.aveScore.toFixed(2)}
                    </div>
                    <div className={`${styles.tableCell} ${styles.toggleCell}`}>
                      <span className={styles.expandToggle} aria-hidden="true">
                        {isOpen ? "[-]" : "[+]"}
                      </span>
                    </div>
                  </div>

                  {/* Expanded judge breakdown */}
                  {isOpen && (
                    <div className={styles.breakdownWrap}>
                      <div className={styles.breakdownHeader}>
                        <span>// JUDGE_ID</span>
                        <span>SCORE</span>
                      </div>
                      {row.breakdowns.map((bd) => (
                        <div className={styles.breakdownRow} key={bd.judgeId}>
                          <span className={styles.breakdownJudge}>
                            {bd.judgeId.toUpperCase()}
                          </span>
                          <span className={styles.breakdownScore}>
                            {bd.normalizedPct.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              );
            })
          )}

        </div>
      </section>

      <p className={styles.exportState} aria-live="polite">{exportState}</p>
    </>
  );
}
