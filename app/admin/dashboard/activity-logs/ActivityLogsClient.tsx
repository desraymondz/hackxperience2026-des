"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import CustomSelect from "../../components/CustomSelect";
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

const PAGE_SIZE = 25;

const ACTION_FILTER_OPTIONS = [
  "APPROVED",
  "CRITERIA_UPDATED",
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
  if (a === "SCORED" || a === "PROJECT_EDITED" || a === "CRITERIA_UPDATED") return styles.toneAmber;
  return styles.toneNeutral;
}

export default function ActivityLogsClient({ embedded = false }: { embedded?: boolean } = {}) {
  const [logs, setLogs] = useState<SubmissionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [rtStatus, setRtStatus] = useState<RtStatus>("connecting");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const filterRef = useRef<HTMLDivElement>(null);

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

  // Close custom filter dropdown on outside click
  useEffect(() => {
    if (!isFilterOpen) return;
    function onOutsideClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => { document.removeEventListener("mousedown", onOutsideClick); };
  }, [isFilterOpen]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, actionFilter]);

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

  const totalPages = Math.max(1, Math.ceil(displayed.length / PAGE_SIZE));
  const paginatedLogs = useMemo(
    () => displayed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [displayed, page]
  );

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
      <header className={`${styles.contentHeader}${embedded ? ` ${styles.contentHeaderEmbedded}` : ""}`}>
        <div className={styles.headerRow}>
          <div>
            <h2>&gt; SYSTEM_ACTIVITY_LOGS</h2>
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
          <CustomSelect
            className={styles.filterDropdown}
            variant="toolbar"
            value={actionFilter}
            onChange={setActionFilter}
            options={[
              { value: "", label: "ALL ACTIONS" },
              ...ACTION_FILTER_OPTIONS.map((a) => ({ value: a, label: a })),
            ]}
          />
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
              paginatedLogs.map((log) => (
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

        {!loading && !fetchError && displayed.length > 0 && (
          <div className={styles.paginationBar}>
            <button
              type="button"
              className={styles.paginationBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              [ &lt; PREV ]
            </button>
            <span className={styles.paginationInfo}>
              PAGE {page} OF {totalPages}
            </span>
            <button
              type="button"
              className={styles.paginationBtn}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              [ NEXT &gt; ]
            </button>
            <span className={styles.paginationCount}>
              // {displayed.length} EVENTS
            </span>
          </div>
        )}
      </div>
    </>
  );
}
