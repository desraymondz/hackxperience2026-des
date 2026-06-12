"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import styles from "./ActivityLogs.module.css";

interface SubmissionLog {
  id: string;
  submission_id: string | null;
  action: string;
  performed_by: string | null;
  note: string | null;
  created_at: string;
}

type RtStatus = "connecting" | "live" | "error";

const ACTION_FILTER_OPTIONS = [
  "APPROVED",
  "JUDGE_CREATED",
  "JUDGE_DELETED",
  "LOGIN",
  "PROJECT_DELETED",
  "PROJECT_EDITED",
  "REJECTED",
  "SCORED",
  "SUBMITTED",
] as const;

function fmtTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-SG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Singapore",
    hour12: false,
  });
}

function actionToneClass(action: string): string {
  const a = action.toUpperCase();
  if (a === "APPROVED" || a === "SUBMITTED" || a === "JUDGE_CREATED") return styles.toneGreen;
  if (a === "REJECTED" || a === "JUDGE_DELETED" || a === "PROJECT_DELETED") return styles.toneRed;
  if (a === "SCORED" || a === "PROJECT_EDITED") return styles.toneAmber;
  return styles.toneNeutral;
}

export default function ActivityLogsClient() {
  const [logs, setLogs] = useState<SubmissionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [rtStatus, setRtStatus] = useState<RtStatus>("connecting");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  // Initial fetch via the scoped route handler (uses service-role key server-side)
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/admin/dashboard/activity-logs/api", { cache: "no-store" });
        if (cancelled) return;
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          setFetchError(body.error ?? "Failed to load logs.");
        } else {
          const payload = (await res.json()) as { logs: SubmissionLog[] };
          setLogs(payload.logs ?? []);
        }
      } catch {
        if (!cancelled) setFetchError("Network error — unable to load activity logs.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Real-time subscription for new INSERT events
  useEffect(() => {
    const channel = supabaseBrowser
      .channel("activity_logs_rt")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on("postgres_changes" as any, { event: "INSERT", schema: "public", table: "submission_logs" }, (payload: { new: SubmissionLog }) => {
        setLogs((prev) => [payload.new, ...prev]);
      })
      .subscribe((status: string) => {
        if (status === "SUBSCRIBED") setRtStatus("live");
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setRtStatus("error");
      });

    return () => { void supabaseBrowser.removeChannel(channel); };
  }, []);

  // Compound filter: action → search (note + performed_by)
  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((l) => {
      if (actionFilter && l.action !== actionFilter) return false;
      if (q) {
        const inNote = l.note?.toLowerCase().includes(q) ?? false;
        const inBy   = l.performed_by?.toLowerCase().includes(q) ?? false;
        if (!inNote && !inBy) return false;
      }
      return true;
    });
  }, [logs, search, actionFilter]);

  const rtPillClass =
    rtStatus === "live"  ? styles.realtimePillLive :
    rtStatus === "error" ? styles.realtimePillError :
                           styles.realtimePillConnecting;

  const rtLabel =
    rtStatus === "live"  ? "LIVE" :
    rtStatus === "error" ? "OFFLINE" :
                           "CONNECTING";

  return (
    <>
      <header className={styles.contentHeader}>
        <div className={styles.headerRow}>
          <div>
            <h2>&gt; ACTIVITY_LOGS</h2>
            <p>
              {loading
                ? "// LOADING..."
                : fetchError
                  ? `// ${fetchError.toUpperCase()}`
                  : `// ${logs.length} EVENTS · SUBMISSION_LOGS`}
            </p>
          </div>
          <span className={`${styles.realtimePill} ${rtPillClass}`}>
            <span className={styles.realtimeDot} />
            <span>{rtLabel}</span>
          </span>
        </div>
        <div className={styles.tabStrip}>
          <Link href="/admin/dashboard" className={styles.tab}>OVERVIEW</Link>
          <span className={`${styles.tab} ${styles.tabActive}`} aria-current="page">
            ACTIVITY LOGS
          </span>
        </div>
      </header>

      <div className={styles.tablePanel}>
        <div className={styles.tablePanelTop}>
          <span className={styles.sectionHeaderText}>&gt; EVENT_STREAM</span>
        </div>

        <div className={styles.tableToolbar}>
          <input
            type="text"
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search note or performed by..."
          />
          <select
            className={styles.filterSelect}
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="">ALL ACTIONS</option>
            {ACTION_FILTER_OPTIONS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <div className={styles.tableFrame}>
          <div className={styles.tableGrid}>
            <div className={styles.tableHead}>ACTION</div>
            <div className={styles.tableHead}>PERFORMED BY</div>
            <div className={styles.tableHead}>NOTE</div>
            <div className={styles.tableHead}>TIMESTAMP (SGT)</div>

            {loading ? (
              <div className={styles.emptyRow}>// LOADING EVENTS...</div>
            ) : fetchError ? (
              <div className={styles.emptyRow}>[ ERROR — {fetchError} ]</div>
            ) : displayed.length === 0 ? (
              <div className={styles.emptyRow}>
                {logs.length === 0
                  ? "[ NO ACTIVITY LOGS YET ]"
                  : "[ NO RESULTS MATCH FILTERS ]"}
              </div>
            ) : (
              displayed.map((log) => (
                <div className={styles.tableRow} key={log.id}>
                  <div className={styles.tableCell} data-label="ACTION">
                    <span className={`${styles.actionBadge} ${actionToneClass(log.action)}`}>
                      {log.action}
                    </span>
                  </div>
                  <div className={styles.tableCell} data-label="PERFORMED BY">
                    {log.performed_by ?? "—"}
                  </div>
                  <div className={styles.tableCell} data-label="NOTE">
                    {log.note ?? "—"}
                  </div>
                  <div className={styles.tableCell} data-label="TIMESTAMP (SGT)">
                    {fmtTimestamp(log.created_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
