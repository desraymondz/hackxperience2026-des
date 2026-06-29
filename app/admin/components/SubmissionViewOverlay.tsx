"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { HACKX_TRACKS, type AdminSubmission, type SubmissionStatus } from "@/lib/types";
import CustomSelect from "./CustomSelect";
import editStyles from "./SubmissionEditOverlay.module.css";
import styles from "./SubmissionViewOverlay.module.css";

const SPRING = { type: "spring" as const, stiffness: 420, damping: 18 };

// ── Edit draft type ────────────────────────────────────────────────

export type EditDraft = {
  projectName:  string;
  track:        string;
  status:       SubmissionStatus;
  githubUrl:    string;
  liveUrl:      string;
  pitchDeckUrl: string;
  videoDemoUrl: string;
  description:  string;
  shortPitch:   string;
};

function makeEditDraft(s: AdminSubmission): EditDraft {
  return {
    projectName:  s.projectName,
    track:        s.track,
    status:       s.status,
    githubUrl:    s.githubUrl    ?? "",
    liveUrl:      s.liveUrl      ?? "",
    pitchDeckUrl: s.pitchDeckUrl ?? "",
    videoDemoUrl: s.videoDemoUrl ?? "",
    description:  s.description  ?? "",
    shortPitch:   s.shortPitch   ?? "",
  };
}

// ── Helpers ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const cls =
    status === "approved"
      ? styles.badgeApproved
      : status === "pending"
        ? styles.badgePending
        : styles.badgeRejected;
  return <span className={cls}>{status.toUpperCase()}</span>;
}

// ── Props ──────────────────────────────────────────────────────────

export type SubmissionViewOverlayProps = {
  submission: AdminSubmission | null;
  onClose:    () => void;
  onApprove:  (id: string) => void;
  onReject:   (id: string) => void;
  onDelete:   (id: string) => void;
  onSave?:    (id: string, draft: EditDraft) => void;
};

// ── Component ──────────────────────────────────────────────────────

export default function SubmissionViewOverlay({
  submission,
  onClose,
  onApprove,
  onReject,
  onDelete,
  onSave,
}: SubmissionViewOverlayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsEditing(false);
    setDraft(null);
    setSelectedFile(null);
  }, [submission?.id]);

  function openEdit() {
    if (!submission) return;
    setDraft(makeEditDraft(submission));
    setIsEditing(true);
  }

  function handleSave() {
    if (!submission || !draft) return;
    onSave?.(submission.id, draft);
    setIsEditing(false);
    setSelectedFile(null);
  }

  function handleCancel() {
    setIsEditing(false);
    setDraft(null);
    setSelectedFile(null);
  }

  function setField<K extends keyof EditDraft>(key: K, value: EditDraft[K]) {
    setDraft(prev => prev ? { ...prev, [key]: value } : null);
  }

  return (
    <>
      {/* ── View overlay ── */}
      <AnimatePresence>
        {submission && (
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          >
            <motion.div
              className={styles.panel}
              role="dialog"
              aria-modal="true"
              aria-label={`Project details: ${submission.projectName}`}
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={styles.header}>
                <span className={styles.headerTitle}>
                  &gt; {submission.projectName} // {submission.teamName}
                </span>
                <motion.button
                  type="button"
                  className={styles.headerClose}
                  onClick={onClose}
                  whileTap={{ scale: 0.95 }}
                  transition={SPRING}
                  aria-label="Close details"
                >
                  [ X ]
                </motion.button>
              </div>

              {/* Scrollable body */}
              <div className={styles.body}>

                <div className={styles.thumbnail}>
                  {submission.thumbnailUrl ? (
                    <img
                      src={submission.thumbnailUrl}
                      alt={`${submission.projectName} thumbnail`}
                      style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                    />
                  ) : (
                    <>
                      <svg className={styles.thumbnailSvg} xmlns="http://www.w3.org/2000/svg">
                        <line x1="0" y1="0" x2="100%" y2="100%" stroke="rgba(204,0,0,0.06)" strokeWidth="1.5" />
                        <line x1="100%" y1="0" x2="0" y2="100%" stroke="rgba(204,0,0,0.06)" strokeWidth="1.5" />
                      </svg>
                      <span className={styles.thumbnailLabel}>[ PROJECT THUMBNAIL ]</span>
                    </>
                  )}
                </div>

                {submission.projectAccessKey ? (
                  <div className={styles.fieldBlock}>
                    <span className={styles.fieldLabel}>PROJECT ACCESS KEY</span>
                    <span className={styles.fieldValue}>{submission.projectAccessKey}</span>
                  </div>
                ) : null}

                <div className={styles.divider} />

                <div className={styles.fieldGrid}>
                  <div className={styles.fieldBlock}>
                    <span className={styles.fieldLabel}>PROJECT NAME</span>
                    <span className={styles.fieldValue}>{submission.projectName}</span>
                  </div>
                  <div className={styles.fieldBlock}>
                    <span className={styles.fieldLabel}>TEAM ID</span>
                    <span className={styles.fieldValue}>{submission.teamId ?? submission.id}</span>
                  </div>
                  <div className={styles.fieldBlock}>
                    <span className={styles.fieldLabel}>TRACK</span>
                    <span className={styles.fieldValue}>{submission.track.toUpperCase()}</span>
                  </div>
                  <div className={styles.fieldBlock}>
                    <span className={styles.fieldLabel}>STATUS</span>
                    <StatusBadge status={submission.status} />
                  </div>
                </div>

                <div className={styles.divider} />

                {submission.description ? (
                  <>
                    <div className={styles.fieldBlock}>
                      <span className={styles.fieldLabel}>DESCRIPTION</span>
                      <span className={styles.fieldValue}>{submission.description}</span>
                    </div>
                    <div className={styles.divider} />
                  </>
                ) : null}

                {submission.shortPitch ? (
                  <>
                    <div className={styles.fieldBlock}>
                      <span className={styles.fieldLabel}>SHORT PITCH</span>
                      <span className={styles.fieldValue}>{submission.shortPitch}</span>
                    </div>
                    <div className={styles.divider} />
                  </>
                ) : null}

                {submission.techStack && submission.techStack.length > 0 ? (
                  <>
                    <div className={styles.fieldBlock}>
                      <span className={styles.fieldLabel}>TECH STACK</span>
                      <div className={styles.techStack}>
                        {submission.techStack.map((tag) => (
                          <span key={tag} className={styles.techTag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className={styles.divider} />
                  </>
                ) : null}

                {(submission.githubUrl || submission.liveUrl || submission.pitchDeckUrl ||
                  submission.pitchDeckFileUrl || submission.videoDemoUrl) ? (
                  <>
                    <div className={styles.fieldGrid}>
                                            {submission.githubUrl ? (
                        <div className={styles.fieldBlock}>
                          <span className={styles.fieldLabel}>GITHUB REPO URL</span>
                          <a
                            href={submission.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.fieldLink}
                          >
                            {submission.githubUrl}
                          </a>
                        </div>
                      ) : null}
                      {submission.liveUrl ? (
                        <div className={styles.fieldBlock}>
                          <span className={styles.fieldLabel}>LIVE DEMO URL</span>
                          <a
                            href={submission.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.fieldLink}
                          >
                            {submission.liveUrl}
                          </a>
                        </div>
                      ) : null}
                      {submission.pitchDeckUrl ? (
                        <div className={styles.fieldBlock}>
                          <span className={styles.fieldLabel}>PITCH DECK URL</span>
                          <a
                            href={submission.pitchDeckUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.fieldLink}
                          >
                            {submission.pitchDeckUrl}
                          </a>
                        </div>
                      ) : null}
                      {submission.pitchDeckFileUrl ? (
                        <div className={styles.fieldBlock}>
                          <span className={styles.fieldLabel}>PITCH DECK FILE</span>
                          <a
                            href={submission.pitchDeckFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.fieldLink}
                          >
                            {submission.pitchDeckFileUrl}
                          </a>
                        </div>
                      ) : null}
                      {submission.videoDemoUrl ? (
                        <div className={styles.fieldBlock}>
                          <span className={styles.fieldLabel}>VIDEO DEMO URL</span>
                          <a
                            href={submission.videoDemoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.fieldLink}
                          >
                            {submission.videoDemoUrl}
                          </a>
                        </div>
                      ) : null}
                    </div>
                    <div className={styles.divider} />
                  </>
                ) : null}

                {submission.members && submission.members.length > 0 ? (
                  <>
                    <div className={styles.fieldBlock}>
                      <span className={styles.fieldLabel}>TEAM MEMBERS</span>
                      <div className={styles.membersList}>
                        {submission.members.map((member, i) => (
                          <div key={member.email}>
                            <div className={styles.memberRow}>
                              <span className={styles.memberNumber}>
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              <div className={styles.memberInfo}>
                                <div className={styles.memberName}>{member.name}</div>
                                <div className={styles.memberEmail}>{member.email}</div>
                                {member.role ? <div className={styles.memberEmail}>ROLE: {member.role}</div> : null}
                                {member.university ? <div className={styles.memberEmail}>UNIVERSITY: {member.university}</div> : null}
                                {member.studentId && !member.university ? <div className={styles.memberEmail}>STUDENT ID: {member.studentId}</div> : null}
                              </div>
                            </div>
                            {i < submission.members!.length - 1 ? (
                              <div className={styles.memberDivider} />
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}

                {submission.additionalNotes ? (
                  <>
                    <div className={styles.divider} />
                    <div className={styles.fieldBlock}>
                      <span className={styles.fieldLabel}>ADDITIONAL NOTES</span>
                      <span className={styles.fieldValueMuted}>{submission.additionalNotes}</span>
                    </div>
                  </>
                ) : null}

                <div className={styles.divider} />

                <div className={styles.fieldGrid}>
                  <div className={styles.fieldBlock}>
                    <span className={styles.fieldLabel}>SUBMITTED AT</span>
                    <span className={styles.fieldValueAccent}>{submission.submittedAt}</span>
                  </div>
                  {submission.updatedAt ? (
                    <div className={styles.fieldBlock}>
                      <span className={styles.fieldLabel}>LAST UPDATED AT</span>
                      <span className={styles.fieldValueAccent}>{submission.updatedAt}</span>
                    </div>
                  ) : null}
                </div>

              </div>

              {/* Footer */}
              <div className={styles.footer}>
                <div className={styles.footerLeft}>
                  {submission.status !== "approved" ? (
                    <motion.button
                      type="button"
                      className={styles.footerApprove}
                      onClick={() => onApprove(submission.id)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      transition={SPRING}
                    >
                      APPROVE
                    </motion.button>
                  ) : null}
                  {submission.status !== "rejected" ? (
                    <motion.button
                      type="button"
                      className={styles.footerReject}
                      onClick={() => onReject(submission.id)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      transition={SPRING}
                    >
                      REJECT
                    </motion.button>
                  ) : null}
                  <motion.button
                    type="button"
                    className={styles.footerEdit}
                    onClick={openEdit}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    transition={SPRING}
                  >
                    EDIT
                  </motion.button>
                  <motion.button
                    type="button"
                    className={styles.footerDelete}
                    aria-label="Delete submission"
                    onClick={() => onDelete(submission.id)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    transition={SPRING}
                  >
                    <Trash2 aria-hidden="true" />
                  </motion.button>
                </div>
                <motion.button
                  type="button"
                  className={styles.footerClose}
                  onClick={onClose}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  transition={SPRING}
                >
                  CLOSE
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit overlay ── */}
      <AnimatePresence>
        {isEditing && draft && submission && (
          <motion.div
            className={editStyles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleCancel}
          >
            <motion.div
              className={editStyles.panel}
              role="dialog"
              aria-modal="true"
              aria-label="Edit project details"
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={editStyles.header}>
                <span className={editStyles.headerTitle}>&gt; EDIT_PROJECT_DETAILS</span>
                <motion.button
                  type="button"
                  className={editStyles.headerClose}
                  onClick={handleCancel}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.88 }}
                  transition={SPRING}
                  aria-label="Cancel edit"
                >
                  ×
                </motion.button>
              </div>

              {/* Body */}
              <div className={editStyles.body}>

                {/* Row 1: project name + team id */}
                <div className={editStyles.row}>
                  <div className={editStyles.field}>
                    <label className={editStyles.label}>PROJECT NAME</label>
                    <input
                      type="text"
                      className={editStyles.input}
                      value={draft.projectName}
                      onChange={(e) => setField("projectName", e.target.value)}
                    />
                  </div>
                  <div className={editStyles.field}>
                    <label className={editStyles.label}>TEAM ID</label>
                    <input
                      type="text"
                      className={`${editStyles.input} ${editStyles.inputReadonly}`}
                      value={submission.teamId ?? submission.id}
                      readOnly
                    />
                  </div>
                </div>

                {/* Row 2: track + status */}
                <div className={editStyles.row}>
                  <div className={editStyles.field}>
                    <label className={editStyles.label}>TRACK</label>
                    <CustomSelect
                      variant="edit"
                      value={draft.track}
                      onChange={(v) => setField("track", v)}
                      options={HACKX_TRACKS.map((t) => ({ value: t, label: t }))}
                    />
                  </div>
                  <div className={editStyles.field}>
                    <label className={editStyles.label}>STATUS</label>
                    <CustomSelect
                      variant="edit"
                      value={draft.status}
                      onChange={(v) => setField("status", v as SubmissionStatus)}
                      options={[
                        { value: "pending", label: "PENDING" },
                        { value: "approved", label: "APPROVED" },
                        { value: "rejected", label: "REJECTED" },
                      ]}
                    />
                  </div>
                </div>

                {/* GitHub repo */}
                <div className={editStyles.fieldFull}>
                  <label className={editStyles.label}>GITHUB REPO</label>
                  <input
                    type="text"
                    className={editStyles.input}
                    value={draft.githubUrl}
                    onChange={(e) => setField("githubUrl", e.target.value)}
                  />
                </div>

                {/* Live demo */}
                <div className={editStyles.fieldFull}>
                  <label className={editStyles.label}>LIVE DEMO URL</label>
                  <input
                    type="text"
                    className={editStyles.input}
                    value={draft.liveUrl}
                    onChange={(e) => setField("liveUrl", e.target.value)}
                  />
                </div>

                {/* Pitch deck URL */}
                <div className={editStyles.fieldFull}>
                  <label className={editStyles.label}>PITCH DECK URL</label>
                  <input
                    type="text"
                    className={editStyles.input}
                    value={draft.pitchDeckUrl}
                    onChange={(e) => setField("pitchDeckUrl", e.target.value)}
                  />
                </div>

                {/* Pitch deck file */}
                <div className={editStyles.fieldFull}>
                  <label className={editStyles.label}>PITCH DECK FILE</label>
                  <div className={editStyles.fileRow}>
                    <div
                      className={editStyles.uploadZone}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file) setSelectedFile(file);
                      }}
                    >
                      <span className={editStyles.uploadText}>
                        DRAG-N-DROP<br />or<br />BROWSE
                      </span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      style={{ display: "none" }}
                      onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                    />
                    <div className={editStyles.currentFile}>
                      <span className={editStyles.currentFileLabel}>CURRENT FILE:</span>
                      {selectedFile ? (
                        <span className={editStyles.currentFileLink}>{selectedFile.name}</span>
                      ) : submission.pitchDeckFileUrl ? (
                        <span className={editStyles.currentFileLink}>
                          {submission.pitchDeckFileUrl.split("/").pop()}
                        </span>
                      ) : (
                        <span className={editStyles.currentFileMuted}>NONE</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Video URL */}
                <div className={editStyles.fieldFull}>
                  <label className={editStyles.label}>VIDEO URL</label>
                  <input
                    type="text"
                    className={editStyles.input}
                    value={draft.videoDemoUrl}
                    onChange={(e) => setField("videoDemoUrl", e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className={editStyles.fieldFull}>
                  <label className={editStyles.label}>DESCRIPTION</label>
                  <input
                    type="text"
                    className={editStyles.input}
                    value={draft.description}
                    onChange={(e) => setField("description", e.target.value)}
                  />
                </div>

                {/* Short pitch */}
                <div className={editStyles.fieldFull}>
                  <label className={editStyles.label}>SHORT PITCH</label>
                  <textarea
                    className={editStyles.textarea}
                    value={draft.shortPitch}
                    rows={5}
                    onChange={(e) => setField("shortPitch", e.target.value)}
                  />
                </div>

              </div>

              {/* Footer */}
              <div className={editStyles.footer}>
                <motion.button
                  type="button"
                  className={editStyles.saveBtn}
                  onClick={handleSave}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={SPRING}
                >
                  SAVE
                </motion.button>
                <motion.button
                  type="button"
                  className={editStyles.cancelBtn}
                  onClick={handleCancel}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={SPRING}
                >
                  CANCEL
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
