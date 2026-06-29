"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import CustomSelect from "../../components/CustomSelect";
import { AdminShellConfig, type AdminMetric } from "../../components/AdminShell";
import SubmissionViewOverlay, { type EditDraft } from "../../components/SubmissionViewOverlay";
import type { AdminSubmission } from "@/lib/types";
import { deleteAdminSubmission, fetchAdminSubmissions, updateAdminSubmission } from "@/lib/client/admin-api";
import styles from "./ApprovedSubmissions.module.css";

type TrackFilter = "all" | string;

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

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className={styles.sectionHeader}>
      <h2>&gt; {title}</h2>
      <p>{subtitle}</p>
    </header>
  );
}

function StatusBadge() {
  return <span className={styles.statusBadge}>APPROVED</span>;
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
  submission,
  onViewClick,
  onDeleteClick,
}: {
  submission: AdminSubmission;
  onViewClick: (s: AdminSubmission) => void;
  onDeleteClick: (s: AdminSubmission) => void;
}) {
  return (
    <div className={styles.actions}>
      <button type="button" className={styles.iconAction} aria-label="Reject submission">
        <X aria-hidden="true" />
      </button>
      <button type="button" className={styles.viewAction} onClick={() => onViewClick(submission)}>
        VIEW
      </button>
      <button type="button" className={styles.deleteAction} aria-label="Delete submission" onClick={() => onDeleteClick(submission)}>
        <Trash2 aria-hidden="true" />
      </button>
    </div>
  );
}

function DeleteModal({
  submission,
  onConfirm,
  onCancel,
}: {
  submission: AdminSubmission;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onCancel}
    >
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalAccent} />
        <p className={styles.modalTitle}>DELETE_PROJECT</p>
        <p className={styles.modalWarning}>{"// THIS ACTION CANNOT BE UNDONE"}</p>
        <p className={styles.modalBody}>
          Are you sure you want to delete &quot;{submission.projectName}&quot; by {submission.teamName}?
        </p>
        <div className={styles.modalButtons}>
          <button type="button" className={styles.modalYes} onClick={onConfirm}>
            YES
          </button>
          <button type="button" className={styles.modalNo} onClick={onCancel}>
            NO
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ApprovedSubmissionsClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [trackFilter, setTrackFilter] = useState<TrackFilter>("all");
  const [data, setData] = useState<AdminSubmission[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<AdminSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<AdminSubmission | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const viewingSubmission = useMemo(
    () => data.find((s) => s.id === viewingId) ?? null,
    [data, viewingId],
  );

  const shellMetrics = useMemo(() => buildMetrics(allSubmissions), [allSubmissions]);
  const trackOptions = useMemo(
    () => Array.from(new Set(allSubmissions.map((submission) => submission.track))),
    [allSubmissions]
  );

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await fetchAdminSubmissions();
      setAllSubmissions(payload.submissions);
      setData(payload.submissions.filter((submission) => submission.status === "approved"));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load approved submissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSubmissions();
  }, [loadSubmissions]);

  const visibleSubmissions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return data.filter((submission) => {
      const matchesTrack = trackFilter === "all" || submission.track === trackFilter;
      const matchesSearch =
        query.length === 0 ||
        [submission.projectName, submission.teamName, submission.track]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesTrack && matchesSearch;
    });
  }, [data, searchTerm, trackFilter]);

  async function handleDeleteConfirm() {
    if (!pendingDelete) return;
    try {
      await deleteAdminSubmission(pendingDelete.id);
      setData((prev) => prev.filter((s) => s.id !== pendingDelete.id));
      setAllSubmissions((prev) => prev.filter((s) => s.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete submission.");
    }
  }

  async function handleReject(id: string) {
    try {
      await updateAdminSubmission(id, { status: "rejected" });
      setData((prev) => prev.filter((s) => s.id !== id));
      setAllSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status: "rejected" } : s));
      setViewingId(null);
    } catch (rejectError) {
      setError(rejectError instanceof Error ? rejectError.message : "Unable to reject submission.");
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

      const next = (submission: AdminSubmission) => ({
        ...submission,
        projectName:  draft.projectName,
        track:        draft.track,
        status:       draft.status,
        githubUrl:    draft.githubUrl    || undefined,
        liveUrl:      draft.liveUrl      || null,
        pitchDeckUrl: draft.pitchDeckUrl || undefined,
        videoDemoUrl: draft.videoDemoUrl || null,
        description:  draft.description  || undefined,
        shortPitch:   draft.shortPitch   || undefined,
      });

      setData((prev) => prev.map((submission) => submission.id !== id ? submission : next(submission)));
      setAllSubmissions((prev) => prev.map((submission) => submission.id !== id ? submission : next(submission)));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save submission.");
    }
  }

  return (
    <>
      <AdminShellConfig value={{ metrics: shellMetrics }} />

      <SectionHeader
        title="APPROVED_SUBMISSIONS"
        subtitle={error ? `// ${error.toUpperCase()}` : (loading ? "// LOADING APPROVED SUBMISSIONS" : "// CLEARED FOR SCORING AND SHOWCASE")}
      />

      <section className={styles.controls}>
        <label className={styles.searchField}>
          <Search className={styles.searchIcon} aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search project, team or track..."
            aria-label="Search approved submissions"
          />
        </label>

        <CustomSelect
          className={styles.selectField}
          variant="controls"
          value={trackFilter}
          onChange={setTrackFilter}
          options={[
            { value: "all", label: "ALL TRACKS" },
            ...trackOptions.map((track) => ({ value: track, label: track.toUpperCase() })),
          ]}
          aria-label="Track filter"
        />

        <CustomSelect
          className={styles.selectField}
          variant="controls"
          value="approved"
          onChange={() => {}}
          options={[{ value: "approved", label: "APPROVED" }]}
          disabled
          aria-label="Status filter"
        />
      </section>

      <section className={styles.tablePanel}>
        <div className={styles.tableGrid}>
          <div className={styles.tableHead}>THUMBNAIL</div>
          <div className={styles.tableHead}>PROJECT</div>
          <div className={styles.tableHead}>TEAM</div>
          <div className={styles.tableHead}>TRACK</div>
          <div className={styles.tableHead}>STATUS</div>
          <div className={styles.tableHead}>SUBMITTED</div>
          <div className={styles.tableHead}>ACTIONS</div>

          {visibleSubmissions.length === 0 ? (
            <div className={styles.emptyRow}>[ NO APPROVED SUBMISSIONS ]</div>
          ) : (
            visibleSubmissions.map((submission) => (
              <div className={styles.tableRow} key={submission.id}>
                <div className={styles.tableCell} data-label="THUMBNAIL">
                  <Thumbnail url={submission.thumbnailUrl} alt={`${submission.projectName} thumbnail`} />
                </div>
                <div className={styles.tableCell} data-label="PROJECT">{submission.projectName}</div>
                <div className={styles.tableCell} data-label="TEAM">{submission.teamName}</div>
                <div className={styles.tableCell} data-label="TRACK">{submission.track}</div>
                <div className={styles.tableCell} data-label="STATUS">
                  <StatusBadge />
                </div>
                <div className={styles.tableCell} data-label="SUBMITTED">{submission.submittedAt}</div>
                <div className={styles.tableCell} data-label="ACTIONS">
                  <SubmissionActions
                    submission={submission}
                    onViewClick={(s) => setViewingId(s.id)}
                    onDeleteClick={setPendingDelete}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <AnimatePresence>
        {pendingDelete && (
          <DeleteModal
            submission={pendingDelete}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setPendingDelete(null)}
          />
        )}
      </AnimatePresence>

      <SubmissionViewOverlay
        submission={viewingSubmission}
        onClose={() => setViewingId(null)}
        onApprove={() => {}}
        onReject={handleReject}
        onDelete={(id) => {
          setViewingId(null);
          setPendingDelete(data.find((s) => s.id === id) ?? null);
        }}
        onSave={handleSave}
      />
    </>
  );
}
