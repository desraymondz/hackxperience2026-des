"use client";

import { Check, LogOut, Plus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShellConfig, type AdminMetric } from "../components/AdminShell";
import { usePortalSettings } from "../components/PortalSettingsContext";
import { HACKX_TRACKS, type AdminSubmission } from "@/lib/types";
import {
  createAdminJudge,
  deleteAdminJudge,
  fetchAdminJudges,
  fetchAdminSettings,
  fetchAdminSubmissions,
  updateAdminJudge,
  updateAdminSettings,
  type AdminJudge,
  type AdminSettingsRow,
} from "@/lib/client/admin-api";
import { logoutPortal } from "@/lib/client/auth-api";
import styles from "./Settings.module.css";

function buildMetrics(all: AdminSubmission[]): AdminMetric[] {
  const pending = all.filter((submission) => submission.status === "pending").length;
  const approved = all.filter((submission) => submission.status === "approved").length;
  const rejected = all.filter((submission) => submission.status === "rejected").length;
  return [
    { key: "total", label: "TOTAL_SUBMISSIONS", value: String(all.length), helper: "received", tone: "neutral" },
    { key: "pending", label: "PENDING", value: String(pending), helper: "awaiting review", tone: "amber" },
    { key: "approved", label: "APPROVED", value: String(approved), helper: "cleared for showcase", tone: "emerald" },
    { key: "rejected", label: "REJECTED", value: String(rejected), helper: "returned to team", tone: "red" },
    { key: "deadline_countdown", label: "DEADLINE_COUNTDOWN", value: "00.00.00.00", helper: "until close", tone: "neutral" },
  ];
}

function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`${styles.toggle} ${on ? styles.toggleOn : styles.toggleOff}`}
      onClick={onToggle}
    >
      <span className={styles.toggleThumb} />
    </button>
  );
}

function SubmissionConfigPanel({
  submissionsOpen,
  allowResubmissions,
  maxTeamSize,
  maxFileSizeMb,
  onToggleSubmissionsOpen,
  onToggleResubmissions,
  onMaxTeamSizeChange,
  onMaxFileSizeChange,
}: {
  submissionsOpen: boolean;
  allowResubmissions: boolean;
  maxTeamSize: number;
  maxFileSizeMb: number;
  onToggleSubmissionsOpen: () => void;
  onToggleResubmissions: () => void;
  onMaxTeamSizeChange: (next: number) => void;
  onMaxFileSizeChange: (next: number) => void;
}) {
  function parsePositiveInt(raw: string, max: number) {
    const value = parseInt(raw, 10);
    if (!Number.isNaN(value) && value > 0 && value <= max) return value;
    return null;
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <h3>&gt; SUBMISSION_CONFIG</h3>
      </div>
      <div className={styles.panelBody}>
        <div className={styles.configRow}>
          <span className={styles.configLabel}>
            SUBMISSION WINDOW
            <span className={styles.configSub}>
              {submissionsOpen ? "// ACCEPTING ENTRIES" : "// CLOSED TO ENTRIES"}
            </span>
          </span>
          <Toggle on={submissionsOpen} onToggle={onToggleSubmissionsOpen} label="Toggle submission window" />
        </div>

        <div className={styles.divider} />

        <div className={styles.configRow}>
          <span className={styles.configLabel}>
            ALLOW RESUBMISSIONS
            <span className={styles.configSub}>{"// TEAMS MAY OVERWRITE SUBMISSION"}</span>
          </span>
          <Toggle on={allowResubmissions} onToggle={onToggleResubmissions} label="Toggle resubmissions" />
        </div>

        <div className={styles.divider} />

        <div className={styles.configRow}>
          <span className={styles.configLabel}>
            MAX TEAM SIZE
            <span className={styles.configSub}>{"// MEMBERS PER SUBMISSION"}</span>
          </span>
          <input
            type="number"
            className={styles.numberInput}
            value={maxTeamSize}
            min={1}
            max={20}
            onChange={(event) => {
              const value = parsePositiveInt(event.target.value, 20);
              if (value != null) onMaxTeamSizeChange(value);
            }}
            aria-label="Max team size"
          />
        </div>

        <div className={styles.divider} />

        <div className={styles.configRow}>
          <span className={styles.configLabel}>
            MAX FILE SIZE
            <span className={styles.configSub}>{"// PER SUBMISSION UPLOAD"}</span>
          </span>
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="number"
              className={styles.numberInput}
              value={maxFileSizeMb}
              min={1}
              max={500}
              onChange={(event) => {
                const value = parsePositiveInt(event.target.value, 500);
                if (value != null) onMaxFileSizeChange(value);
              }}
              aria-label="Max file size in MB"
            />
            <span className={styles.inputUnit}>MB</span>
          </div>
        </div>
      </div>
    </section>
  );
}

type Criterion = {
  key:
    | "technical_execution_value"
    | "problem_solution_fit_value"
    | "innovation_creativity_value"
    | "presentation_quality_value";
  label: string;
  maxPts: number;
};

function JudgingCriteriaPanel({
  criteria,
  onChange,
}: {
  criteria: Criterion[];
  onChange: (key: Criterion["key"], nextValue: number) => void;
}) {
  const total = useMemo(() => criteria.reduce((sum, item) => sum + item.maxPts, 0), [criteria]);

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <h3>&gt; JUDGING_CRITERIA</h3>
      </div>
      <div className={styles.panelBody}>
        {criteria.map((criterion) => (
          <div key={criterion.key} className={styles.criteriaRow}>
            <span className={styles.criteriaLabel}>{criterion.label}</span>
            <div className={styles.criteriaControls}>
              <input
                type="number"
                className={styles.numberInput}
                value={criterion.maxPts}
                min={0}
                max={100}
                onChange={(event) => {
                  const next = parseInt(event.target.value, 10);
                  if (!Number.isNaN(next) && next >= 0 && next <= 100) {
                    onChange(criterion.key, next);
                  }
                }}
                aria-label={`${criterion.label} max points`}
              />
              <span className={styles.inputUnit}>pts</span>
            </div>
          </div>
        ))}
        <p className={styles.criteriaTotal}>
          TOTAL <strong>{total}</strong> pts
        </p>
      </div>
    </section>
  );
}

function TracksPanel({
  activeTracks,
  onToggleTrack,
}: {
  activeTracks: Set<string>;
  onToggleTrack: (track: string) => void;
}) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <h3>&gt; TRACKS</h3>
      </div>
      <div className={styles.panelBody}>
        {HACKX_TRACKS.map((track, index) => {
          const id = `TRACK_0${index + 1}`;
          const enabled = activeTracks.has(track);
          return (
            <div key={track} className={styles.trackRow}>
              <div className={styles.trackInfo}>
                <div className={styles.trackId}>{id}</div>
                <div className={styles.trackName}>{track}</div>
              </div>
              <Toggle
                on={enabled}
                onToggle={() => onToggleTrack(track)}
                label={`Toggle ${id}`}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AdminSessionPanel({
  username,
  duration,
  onLogout,
}: {
  username: string;
  duration: string;
  onLogout: () => void;
}) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <h3>&gt; ADMIN_SESSION</h3>
      </div>
      <div className={styles.panelBody}>
        <div className={styles.sessionInfo}>
          <div className={styles.sessionField}>
            <span className={styles.sessionFieldLabel}>ADMIN_ID</span>
            <span className={`${styles.sessionFieldValue} ${styles.accent}`}>{username}</span>
          </div>
          <div className={styles.sessionField}>
            <span className={styles.sessionFieldLabel}>ROLE</span>
            <span className={styles.sessionFieldValue}>ADMIN</span>
          </div>
          <div className={styles.sessionField}>
            <span className={styles.sessionFieldLabel}>SESSION_START</span>
            <span className={styles.sessionFieldValue}>ACTIVE</span>
          </div>
          <div className={styles.sessionField}>
            <span className={styles.sessionFieldLabel}>DURATION</span>
            <span className={styles.sessionFieldValue}>{duration}</span>
          </div>
        </div>
        <button type="button" className={styles.logoutBtn} onClick={onLogout}>
          <LogOut aria-hidden="true" />
          <span>LOGOUT_SESSION</span>
        </button>
      </div>
    </section>
  );
}

type EditingState = { id: number; username: string } | null;
type AddingState = { username: string; password: string } | null;

function JudgeAccountsPanel({
  judges,
  onCreate,
  onUpdate,
  onDelete,
}: {
  judges: AdminJudge[];
  onCreate: (payload: { username: string; password: string }) => Promise<void>;
  onUpdate: (id: number, payload: { username?: string; password?: string }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState<EditingState>(null);
  const [adding, setAdding] = useState<AddingState>(null);

  async function confirmEdit() {
    if (!editing || !editing.username.trim()) return;
    try {
      await onUpdate(editing.id, { username: editing.username.trim() });
      setEditing(null);
    } catch {
      // Keep the row open so the admin can fix and retry.
    }
  }

  function cancelEdit() {
    setEditing(null);
  }

  function startEdit(judge: AdminJudge) {
    setAdding(null);
    setEditing({ id: judge.id, username: judge.username });
  }

  function startAdd() {
    setEditing(null);
    setAdding({ username: "", password: "" });
  }

  async function confirmAdd() {
    if (!adding || !adding.username.trim() || !adding.password) return;
    try {
      await onCreate({ username: adding.username.trim(), password: adding.password });
      setAdding(null);
    } catch {
      // Keep the row open so the admin can fix and retry.
    }
  }

  function cancelAdd() {
    setAdding(null);
  }

  return (
    <section className={`${styles.panel} ${styles.fullCol}`}>
      <div className={styles.panelHead}>
        <h3>&gt; JUDGE_ACCOUNTS</h3>
      </div>

      <div className={styles.judgeTableScroll}><div className={styles.judgeTable}>
        <div className={styles.tableHead}>JUDGE_ID</div>
        <div className={styles.tableHead}>NAME</div>
        <div className={styles.tableHead}>STATUS</div>
        <div className={styles.tableHead}>ACTIONS</div>

        {judges.map((judge) =>
          editing?.id === judge.id ? (
            <div className={styles.addFormRow} key={judge.id}>
              <div className={styles.addFormCell} data-label="JUDGE_ID">
                <input
                  type="text"
                  className={styles.addInput}
                  value={String(judge.id)}
                  readOnly
                  aria-label="Judge ID"
                />
              </div>
              <div className={styles.addFormCell} data-label="NAME">
                <input
                  type="text"
                  className={styles.addInput}
                  value={editing.username}
                  placeholder="Judge username..."
                  onChange={(event) => setEditing((prev) => prev && { ...prev, username: event.target.value })}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void confirmEdit();
                    if (event.key === "Escape") cancelEdit();
                  }}
                  autoFocus
                  aria-label="Judge username"
                />
              </div>
              <div className={styles.addFormCell} data-label="STATUS">
                <span className={styles.statusActive}>ACTIVE</span>
              </div>
              <div className={styles.addFormCell} data-label="ACTIONS">
                <div className={styles.addFormActions}>
                  <button type="button" className={styles.confirmBtn} onClick={() => void confirmEdit()} aria-label="Confirm edit">
                    <Check aria-hidden="true" />
                  </button>
                  <button type="button" className={styles.cancelBtn} onClick={cancelEdit} aria-label="Cancel edit">
                    <X aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.judgeRow} key={judge.id}>
              <div className={styles.judgeCell} data-label="JUDGE_ID">{judge.id}</div>
              <div className={styles.judgeCell} data-label="NAME">{judge.username}</div>
              <div className={styles.judgeCell} data-label="STATUS">
                <span className={styles.statusActive}>ACTIVE</span>
              </div>
              <div className={styles.judgeCell} data-label="ACTIONS">
                <div className={styles.judgeActions}>
                  <button type="button" className={styles.editBtn} onClick={() => startEdit(judge)}>
                    EDIT
                  </button>
                  <button type="button" className={styles.deleteBtn} onClick={() => void onDelete(judge.id)}>
                    DELETE
                  </button>
                </div>
              </div>
            </div>
          ),
        )}

        {adding && (
          <div className={styles.addFormRow}>
            <div className={styles.addFormCell} data-label="JUDGE_ID">
              <input
                type="text"
                className={styles.addInput}
                value={adding.username}
                placeholder="judge_username"
                onChange={(event) => setAdding((prev) => prev && { ...prev, username: event.target.value })}
                aria-label="New judge username"
                autoFocus
              />
            </div>
            <div className={styles.addFormCell} data-label="NAME">
              <input
                type="password"
                className={styles.addInput}
                value={adding.password}
                placeholder="Initial password..."
                onChange={(event) => setAdding((prev) => prev && { ...prev, password: event.target.value })}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void confirmAdd();
                  if (event.key === "Escape") cancelAdd();
                }}
                aria-label="New judge password"
              />
            </div>
            <div className={styles.addFormCell} data-label="STATUS">
              <span className={styles.statusActive}>ACTIVE</span>
            </div>
            <div className={styles.addFormCell} data-label="ACTIONS">
              <div className={styles.addFormActions}>
                <button type="button" className={styles.confirmBtn} onClick={() => void confirmAdd()} aria-label="Confirm add">
                  <Check aria-hidden="true" />
                </button>
                <button type="button" className={styles.cancelBtn} onClick={cancelAdd} aria-label="Cancel add">
                  <X aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div></div>

      <div className={styles.panelFooter}>
        <button
          type="button"
          className={styles.addJudgeBtn}
          onClick={startAdd}
          disabled={!!adding}
        >
          <Plus aria-hidden="true" style={{ width: 12, height: 12 }} />
          <span>ADD_JUDGE</span>
        </button>
      </div>
    </section>
  );
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export default function SettingsClient() {
  const router = useRouter();
  const { submissionsOpen, allowResubmissions, toggleSubmissionsOpen, toggleAllowResubmissions } = usePortalSettings();

  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [settings, setSettings] = useState<AdminSettingsRow | null>(null);
  const [judges, setJudges] = useState<AdminJudge[]>([]);
  const [error, setError] = useState("");
  const [sessionUser, setSessionUser] = useState("admin");
  const [sessionStart, setSessionStart] = useState(() => Date.now());
  const [durationNow, setDurationNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setDurationNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const shellMetrics = useMemo(() => buildMetrics(submissions), [submissions]);

  const loadData = useCallback(async () => {
    setError("");

    const [submissionsResult, settingsResult, judgesResult, sessionResult] = await Promise.allSettled([
      fetchAdminSubmissions(),
      fetchAdminSettings(),
      fetchAdminJudges(),
      fetch("/api/auth/session", { cache: "no-store" }).then((response) => response.json()),
    ]);

    if (submissionsResult.status === "fulfilled") {
      setSubmissions(submissionsResult.value.submissions);
    } else {
      setError((prev) => prev || "Unable to load submissions metrics.");
    }

    if (settingsResult.status === "fulfilled") {
      setSettings(settingsResult.value.settings);
    } else {
      setError((prev) => prev || "Unable to load settings.");
    }

    if (judgesResult.status === "fulfilled") {
      setJudges(judgesResult.value.judges);
    } else {
      setError((prev) => prev || "Unable to load judges.");
    }

    if (sessionResult.status === "fulfilled") {
      const username = sessionResult.value?.session?.username;
      if (typeof username === "string" && username) setSessionUser(username);
      const issuedAt = sessionResult.value?.session?.iat;
      if (typeof issuedAt === "number" && Number.isFinite(issuedAt)) {
        setSessionStart(issuedAt * 1000);
      }
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [loadData]);

  const patchSettings = useCallback(async (updates: Partial<AdminSettingsRow>) => {
    try {
      const payload = await updateAdminSettings(updates);
      setSettings(payload.settings);
    } catch (patchError) {
      setError(patchError instanceof Error ? patchError.message : "Unable to save settings.");
    }
  }, []);

  const criteria = useMemo<Criterion[]>(() => [
    { key: "technical_execution_value", label: "TECHNICAL_EXECUTION", maxPts: settings?.technical_execution_value ?? 30 },
    { key: "problem_solution_fit_value", label: "PROBLEM_SOLUTION_FIT", maxPts: settings?.problem_solution_fit_value ?? 25 },
    { key: "innovation_creativity_value", label: "INNOVATION_CREATIVITY", maxPts: settings?.innovation_creativity_value ?? 25 },
    { key: "presentation_quality_value", label: "PRESENTATION_QUALITY", maxPts: settings?.presentation_quality_value ?? 20 },
  ], [settings]);

  const activeTracks = useMemo(
    () => new Set(settings?.active_tracks ?? HACKX_TRACKS),
    [settings?.active_tracks]
  );

  const handleToggleTrack = useCallback((track: string) => {
    const next = new Set(activeTracks);
    if (next.has(track)) {
      next.delete(track);
    } else {
      next.add(track);
    }
    void patchSettings({ active_tracks: Array.from(next) });
  }, [activeTracks, patchSettings]);

  const handleCreateJudge = useCallback(async (payload: { username: string; password: string }) => {
    setError("");
    try {
      const response = await createAdminJudge(payload);
      setJudges((prev) => [...prev, response.judge]);
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : "Unable to create judge.";
      setError(message);
      throw new Error(message);
    }
  }, []);

  const handleUpdateJudge = useCallback(async (id: number, payload: { username?: string; password?: string }) => {
    setError("");
    try {
      const response = await updateAdminJudge(id, payload);
      setJudges((prev) => prev.map((judge) => judge.id === id ? response.judge : judge));
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : "Unable to update judge.";
      setError(message);
      throw new Error(message);
    }
  }, []);

  const handleDeleteJudge = useCallback(async (id: number) => {
    setError("");
    try {
      await deleteAdminJudge(id);
      setJudges((prev) => prev.filter((judge) => judge.id !== id));
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Unable to delete judge.";
      setError(message);
      throw new Error(message);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await logoutPortal();
    router.replace("/admin/login");
  }, [router]);

  return (
    <>
      <AdminShellConfig value={{ metrics: shellMetrics }} />

      <header className={styles.pageHeader}>
        <h2>&gt; SETTINGS</h2>
        <p>{error ? `// ${error.toUpperCase()}` : "// CONFIGURE EVENT PARAMETERS, JUDGING, AND ACCOUNTS"}</p>
      </header>

      <div className={styles.settingsGrid}>
        <SubmissionConfigPanel
          submissionsOpen={submissionsOpen}
          allowResubmissions={allowResubmissions}
          onToggleSubmissionsOpen={toggleSubmissionsOpen}
          onToggleResubmissions={toggleAllowResubmissions}
          maxTeamSize={settings?.max_team_size ?? 5}
          maxFileSizeMb={settings?.max_file_size ?? 10}
          onMaxTeamSizeChange={(next) => void patchSettings({ max_team_size: next })}
          onMaxFileSizeChange={(next) => void patchSettings({ max_file_size: next })}
        />

        <JudgingCriteriaPanel
          criteria={criteria}
          onChange={(key, nextValue) => void patchSettings({ [key]: nextValue })}
        />

        <TracksPanel activeTracks={activeTracks} onToggleTrack={handleToggleTrack} />

        <AdminSessionPanel
          username={sessionUser}
          duration={formatDuration(durationNow - sessionStart)}
          onLogout={handleLogout}
        />

        <JudgeAccountsPanel
          judges={judges}
          onCreate={handleCreateJudge}
          onUpdate={handleUpdateJudge}
          onDelete={handleDeleteJudge}
        />
      </div>
    </>
  );
}
