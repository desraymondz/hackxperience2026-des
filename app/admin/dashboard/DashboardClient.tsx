"use client";

import { Check, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShellConfig, type AdminMetric } from "../components/AdminShell";
import { usePortalSettings } from "../components/PortalSettingsContext";
import { HACKX_TRACKS, type AdminSubmission, type SubmissionStatus } from "@/lib/types";
import { deleteAdminSubmission, fetchAdminSubmissions, updateAdminSubmission } from "@/lib/client/admin-api";
import SubmissionViewOverlay, { type EditDraft } from "../components/SubmissionViewOverlay";
import styles from "./Dashboard.module.css";

type DashboardState = "empty" | "populated";
type TrackFilter = "" | (typeof HACKX_TRACKS)[number];
type StatusFilter = "" | SubmissionStatus;
type SortDir = "asc" | "desc";

const statusLabels: Record<SubmissionStatus, string> = {
  pending: "PENDING",
  approved: "APPROVED",
  rejected: "REJECTED",
};

const emptySubmissions: AdminSubmission[] = [];

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

function scoreLabel(score: number | null) {
  return typeof score === "number" ? `${score}` : "";
}

function scoredAverage(submission: AdminSubmission) {
  const numericScores = submission.scores
    .map((score) => score.score)
    .filter((score): score is number => typeof score === "number");

  if (numericScores.length === 0) return null;
  return Math.round(numericScores.reduce((total, score) => total + score, 0) / numericScores.length);
}

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, "\"\"")}"`;
}

function makeCsv(rows: string[][]) {
  return rows.map((row) => row.map((cell) => escapeCsv(cell)).join(",")).join("\n");
}

function buildScoresCsv(submissions: AdminSubmission[], judgeIds: string[]) {
  const header = ["Project", "Team", ...judgeIds.map((judgeId) => judgeId.toUpperCase()), "Average Score"];
  const rows = submissions.map((submission) => [
    submission.projectName,
    submission.teamName,
    ...judgeIds.map((judgeId) => scoreLabel(submission.scores.find((score) => score.judgeId === judgeId)?.score ?? null)),
    scoreLabel(scoredAverage(submission)),
  ]);
  return makeCsv([header, ...rows]);
}

function buildProjectsCsv(submissions: AdminSubmission[]) {
  const header = ["Project", "Team", "Team ID", "Track", "Status", "Submitted At", "GitHub URL", "Live URL", "Pitch Deck URL"];
  const rows = submissions.map((submission) => [
    submission.projectName,
    submission.teamName,
    submission.teamId ?? "",
    submission.track,
    submission.status.toUpperCase(),
    submission.submittedAt,
    submission.githubUrl ?? "",
    submission.liveUrl ?? "",
    submission.pitchDeckUrl ?? "",
  ]);
  return makeCsv([header, ...rows]);
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className={styles.sectionHeader}>
      <span>&gt; {title}</span>
    </div>
  );
}

function ToggleRow({
  label,
  enabled,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={styles.toggleRow}>
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        className={`${styles.toggle} ${enabled ? styles.toggleOn : styles.toggleOff}`}
        onClick={onToggle}
      >
        <span className={styles.toggleThumb} />
      </button>
    </div>
  );
}

function TrackChart({ submissions }: { submissions: AdminSubmission[] }) {
  const dynamicTracks = Array.from(new Set(submissions.map((submission) => submission.track).filter(Boolean)));
  const trackOrder = Array.from(new Set([...HACKX_TRACKS, ...dynamicTracks]));
  const counts = trackOrder.map((track) => ({
    track,
    count: submissions.filter((submission) => submission.track === track).length,
  }));
  const maxCount = Math.max(1, ...counts.map((item) => item.count));

  return (
    <div className={styles.chartWrap}>
      {counts.map((item) => {
        const pct = item.count === 0 ? 0 : Math.max(16, Math.round((item.count / maxCount) * 80));
        return (
          <div className={styles.trackColumn} key={item.track}>
            <div className={styles.barArea}>
              <span className={styles.barValue} style={{ bottom: `calc(${pct}% + 14px)` }}>
                {item.count}
              </span>
              <span className={styles.bar} style={{ height: `${pct}%` }} />
              <span className={styles.baseline} />
            </div>
            <span className={styles.trackLabel}>{item.track}</span>
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <span className={`${styles.statusBadge} ${styles[`status${statusLabels[status]}` as keyof typeof styles]}`}>
      {statusLabels[status]}
    </span>
  );
}

function Thumbnail({ url, alt }: { url?: string | null; alt?: string }) {
  if (url) {
    return (
      <span className={styles.thumbnail}>
        <img
          src={url}
          alt={alt ?? "Project thumbnail"}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </span>
    );
  }
  return (
    <span className={styles.thumbnail} aria-hidden="true">
      <span className={styles.thumbnailLineA} />
      <span className={styles.thumbnailLineB} />
    </span>
  );
}

function SubmissionActions({
  status,
  busy,
  onApprove,
  onReject,
  onDeleteRequest,
  onViewClick,
}: {
  status: SubmissionStatus;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
  onDeleteRequest: () => void;
  onViewClick: () => void;
}) {
  return (
    <div className={styles.actions}>
      {status === "pending" ? (
        <button
          type="button"
          className={`${styles.iconAction} ${styles.approveAction}`}
          aria-label="Approve submission"
          disabled={busy}
          onClick={onApprove}
        >
          <Check aria-hidden="true" />
        </button>
      ) : null}
      <button
        type="button"
        className={`${styles.iconAction} ${styles.rejectAction}`}
        aria-label="Reject submission"
        disabled={busy}
        onClick={onReject}
      >
        <X aria-hidden="true" />
      </button>
      <button
        type="button"
        className={styles.textAction}
        disabled={busy}
        onClick={onViewClick}
      >
        VIEW
      </button>
      <button
        type="button"
        className={`${styles.iconAction} ${styles.deleteAction}`}
        aria-label="Delete submission"
        disabled={busy}
        onClick={onDeleteRequest}
      >
        <Trash2 aria-hidden="true" />
      </button>
    </div>
  );
}

function DeleteConfirmModal({
  projectName,
  teamName,
  busy,
  onConfirm,
  onCancel,
}: {
  projectName: string;
  teamName: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <p className={styles.modalTitle}>!DELETE_PROJECT!</p>
        <p className={styles.modalSubtitle}>// THIS CAN NOT BE UNDONE</p>
        <p className={styles.modalBody}>
          Are you sure you want to{" "}
          <span className={styles.modalDanger}>PERMANENTLY DELETE</span>{" "}
          {projectName}
          <br />
          {"[ "}{teamName}{" ]?"}
        </p>
        <div className={styles.modalBtns}>
          <button
            type="button"
            className={styles.modalConfirmBtn}
            disabled={busy}
            onClick={onConfirm}
          >
            YES
          </button>
          <button
            type="button"
            className={styles.modalCancelBtn}
            disabled={busy}
            onClick={onCancel}
          >
            NO
          </button>
        </div>
      </div>
    </div>
  );
}

function RecentSubmissionsTable({
  submissions,
  onView,
  onApprove,
  onReject,
  onDelete,
}: {
  submissions: AdminSubmission[];
  onView: (id: string) => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState<TrackFilter>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    projectName: string;
    teamName: string;
  } | null>(null);

  const displayed = useMemo(() => {
    let result = submissions;
    if (trackFilter) result = result.filter((s) => s.track === trackFilter);
    if (statusFilter) result = result.filter((s) => s.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.projectName.toLowerCase().includes(q) ||
          s.teamName.toLowerCase().includes(q)
      );
    }
    return [...result]
      .sort((a, b) => {
        const ta = new Date(a.submittedAt).getTime() || 0;
        const tb = new Date(b.submittedAt).getTime() || 0;
        return sortDir === "desc" ? tb - ta : ta - tb;
      })
      .slice(0, 5);
  }, [submissions, trackFilter, statusFilter, search, sortDir]);

  async function handleApproveRow(id: string) {
    setBusyId(id);
    try { await onApprove(id); } finally { setBusyId(null); }
  }

  async function handleRejectRow(id: string) {
    setBusyId(id);
    try { await onReject(id); } finally { setBusyId(null); }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setBusyId(id);
    try {
      await onDelete(id);
      setDeleteTarget(null);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <section className={styles.tablePanel}>
        <div className={styles.tablePanelTop}>
          <span className={styles.sectionHeaderText}>&gt; RECENT_SUBMISSIONS</span>
          <a href="/admin/submissions" className={styles.viewAllBtn}>VIEW ALL →</a>
        </div>

        <div className={styles.tableToolbar}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search project or team..."
            className={styles.searchInput}
          />
          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value as TrackFilter)}
            className={styles.filterSelect}
          >
            <option value="">ALL TRACKS</option>
            {HACKX_TRACKS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className={styles.filterSelect}
          >
            <option value="">ALL STATUS</option>
            <option value="pending">PENDING</option>
            <option value="approved">APPROVED</option>
            <option value="rejected">REJECTED</option>
          </select>
          <button
            type="button"
            onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
            className={styles.sortBtn}
          >
            DATE {sortDir === "desc" ? "↓ DESC" : "↑ ASC"}
          </button>
        </div>

        <div className={styles.tableFrame}>
          <div className={styles.tableGrid}>
            <div className={styles.tableHead}>THUMBNAIL</div>
            <div className={styles.tableHead}>PROJECT</div>
            <div className={styles.tableHead}>TEAM</div>
            <div className={styles.tableHead}>TRACK</div>
            <div className={styles.tableHead}>STATUS</div>
            <div className={styles.tableHead}>SUBMITTED</div>
            <div className={styles.tableHead}>ACTIONS</div>

            {submissions.length === 0 ? (
              <div className={styles.emptyRow}>[ NO SUBMISSIONS YET ]</div>
            ) : displayed.length === 0 ? (
              <div className={styles.emptyRow}>[ NO RESULTS MATCH FILTERS ]</div>
            ) : (
              displayed.map((submission) => (
                <div className={styles.tableRow} key={submission.id}>
                  <div className={styles.tableCell} data-label="THUMBNAIL">
                    <Thumbnail url={submission.thumbnailUrl} alt={`${submission.projectName} thumbnail`} />
                  </div>
                  <div className={styles.tableCell} data-label="PROJECT">{submission.projectName}</div>
                  <div className={styles.tableCell} data-label="TEAM">{submission.teamName}</div>
                  <div className={styles.tableCell} data-label="TRACK">{submission.track}</div>
                  <div className={styles.tableCell} data-label="STATUS">
                    <StatusBadge status={submission.status} />
                  </div>
                  <div className={styles.tableCell} data-label="SUBMITTED">{submission.submittedAt}</div>
                  <div className={styles.tableCell} data-label="ACTIONS">
                    <SubmissionActions
                      status={submission.status}
                      busy={busyId === submission.id}
                      onApprove={() => handleApproveRow(submission.id)}
                      onReject={() => handleRejectRow(submission.id)}
                      onDeleteRequest={() =>
                        setDeleteTarget({
                          id: submission.id,
                          projectName: submission.projectName,
                          teamName: submission.teamName,
                        })
                      }
                      onViewClick={() => onView(submission.id)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {deleteTarget && (
        <DeleteConfirmModal
          projectName={deleteTarget.projectName}
          teamName={deleteTarget.teamName}
          busy={busyId === deleteTarget.id}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}

export default function DashboardClient({ initialState }: { initialState: DashboardState }) {
  const { submissionsOpen, allowResubmissions, toggleSubmissionsOpen, toggleAllowResubmissions } = usePortalSettings();
  const [data, setData] = useState<AdminSubmission[]>(
    initialState === "empty" ? emptySubmissions : []
  );
  const [judgeIds, setJudgeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(initialState !== "empty");
  const [error, setError] = useState("");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const viewingSubmission = useMemo(() => data.find((s) => s.id === viewingId) ?? null, [data, viewingId]);
  const shellMetrics = useMemo(() => buildMetrics(data), [data]);

  const loadSubmissions = useCallback(async () => {
    if (initialState === "empty") {
      setData(emptySubmissions);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payload = await fetchAdminSubmissions();
      setData(payload.submissions);
      setJudgeIds(payload.judgeIds);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load submissions.");
    } finally {
      setLoading(false);
    }
  }, [initialState]);

  useEffect(() => {
    void loadSubmissions();
  }, [loadSubmissions]);

  async function handleApprove(id: string) {
    try {
      await updateAdminSubmission(id, { status: "approved" });
      setData((prev) => prev.map((s) => s.id === id ? { ...s, status: "approved" as SubmissionStatus } : s));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to approve submission.");
    }
  }

  async function handleReject(id: string) {
    try {
      await updateAdminSubmission(id, { status: "rejected" });
      setData((prev) => prev.map((s) => s.id === id ? { ...s, status: "rejected" as SubmissionStatus } : s));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to reject submission.");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteAdminSubmission(id);
      setViewingId(null);
      setData((prev) => prev.filter((s) => s.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete submission.");
    }
  }

  async function handleSave(id: string, draft: EditDraft) {
    try {
      await updateAdminSubmission(id, {
        projectName: draft.projectName,
        track: draft.track,
        status: draft.status,
        githubUrl: draft.githubUrl,
        liveUrl: draft.liveUrl,
        pitchDeckUrl: draft.pitchDeckUrl,
        videoDemoUrl: draft.videoDemoUrl,
        description: draft.description,
        shortPitch: draft.shortPitch,
      });

      setData((prev) => prev.map((s) => s.id !== id ? s : {
        ...s,
        projectName:  draft.projectName,
        track:        draft.track,
        status:       draft.status,
        githubUrl:    draft.githubUrl    || undefined,
        liveUrl:      draft.liveUrl      || null,
        pitchDeckUrl: draft.pitchDeckUrl || undefined,
        videoDemoUrl: draft.videoDemoUrl || null,
        description:  draft.description  || undefined,
        shortPitch:   draft.shortPitch   || undefined,
      }));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save submission.");
    }
  }

  function handleExportScoresCsv() {
    const csv = buildScoresCsv(data, judgeIds);
    downloadCsv("hackxperience-dashboard-scores.csv", csv);
  }

  function handleExportProjectsCsv() {
    const csv = buildProjectsCsv(data);
    downloadCsv("hackxperience-projects-list.csv", csv);
  }

  return (
    <>
      <AdminShellConfig value={{ metrics: shellMetrics }} />

      <header className={styles.contentHeader}>
        <h2>&gt; DASHBOARD_OVERVIEW</h2>
        <p>{error ? `// ${error.toUpperCase()}` : (loading ? "// LOADING LIVE SUBMISSIONS" : "// REAL-TIME SUBMISSION STATUS")}</p>
      </header>

      <div className={styles.dashboardGrid}>
        <section className={styles.chartPanel}>
          <SectionHeader title="SUBMISSIONS_BY_TRACK" />
          <TrackChart submissions={data} />
        </section>

        <section className={styles.quickPanel}>
          <SectionHeader title="QUICK_ACTIONS" />
          <div className={styles.quickActions}>
            <ToggleRow
              label="SUBMISSIONS OPEN"
              enabled={submissionsOpen}
              onToggle={toggleSubmissionsOpen}
            />
            <ToggleRow
              label="ALLOW RESUBMISSIONS"
              enabled={allowResubmissions}
              onToggle={toggleAllowResubmissions}
            />
            <button type="button" className={styles.exportButton} onClick={handleExportScoresCsv}>
              [ EXPORT SCORES CSV ]
            </button>
            <button type="button" className={styles.exportButton} onClick={handleExportProjectsCsv}>
              [ EXPORT PROJECTS CSV ]
            </button>
          </div>
        </section>

        <RecentSubmissionsTable
          submissions={data}
          onView={(id) => setViewingId(id)}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
        />
      </div>

      <SubmissionViewOverlay
        submission={viewingSubmission}
        onClose={() => setViewingId(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
        onSave={handleSave}
      />
    </>
  );
}
