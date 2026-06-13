/* eslint-disable react/jsx-no-comment-textnodes */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { JudgeProject } from "@/lib/types";
import { C, FM, FB, SPRING, SHADOW, SHADOW_LG, RESPONSIVE_CSS } from "./constants";
import { makeBlankScore, calcLiveTotal, calcMaxTotal, isFieldInvalid, type CriterionKey, type ScoringCriterion } from "./scoring";
import type { ScoreEntry } from "./types";
import { PlaceholderThumb, RedBar } from "./components/atoms";
import { ScoringPanel } from "./components/ScoringPanel";
import { OverlayModal } from "./components/OverlayModal";
import { useSettings } from "@/lib/hooks/use-settings";

type JudgeProjectsResponse = {
  projects: JudgeProject[];
  savedScores: Record<
    string,
    {
      technical_execution: number | null;
      problem_solution_fit: number | null;
      innovation_creativity: number | null;
      presentation_quality: number | null;
      private_comment: string | null;
      total: number | null;
    }
  >;
  session: {
    username: string;
    role: "judge";
  };
  submissionStatusOpen: boolean;
};

function formatDeadline(value: Date | null) {
  if (!value) return "--";
  return value.toLocaleString("en-SG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Singapore",
    timeZoneName: "short",
  });
}

export default function JudgeDashboardClient() {
  const { settings, deadlineAt } = useSettings();
  const router = useRouter();
  const [expandedId,     setExpandedId]     = useState<string | null>(null);
  const [overlayProject, setOverlayProject] = useState<JudgeProject | null>(null);
  const [activeTrack,    setActiveTrack]    = useState<string>("ALL");
  const [mobileNavOpen,  setMobileNavOpen]  = useState(false);
  const [projectsData,   setProjectsData]   = useState<JudgeProject[]>([]);
  const [scores,         setScores]         = useState<Record<string, ScoreEntry>>({});
  const [sessionUser,    setSessionUser]    = useState("judge");
  const [submissionOpen, setSubmissionOpen] = useState(true);
  const [loading,        setLoading]        = useState(true);
  const [loadError,      setLoadError]      = useState("");

  const scoringCriteria = useMemo<readonly ScoringCriterion[]>(
    () => [
      {
        key: "techExec",
        label: "Technical Execution",
        max: Math.max(0, Math.round(settings.technical_execution_value)),
      },
      {
        key: "problemSolution",
        label: "Problem-Solution Fit",
        max: Math.max(0, Math.round(settings.problem_solution_fit_value)),
      },
      {
        key: "innovation",
        label: "Innovation + Creativity",
        max: Math.max(0, Math.round(settings.innovation_creativity_value)),
      },
      {
        key: "presentation",
        label: "Presentation Quality",
        max: Math.max(0, Math.round(settings.presentation_quality_value)),
      },
    ],
    [
      settings.innovation_creativity_value,
      settings.presentation_quality_value,
      settings.problem_solution_fit_value,
      settings.technical_execution_value,
    ],
  );

  const maxScoreTotal = useMemo(() => calcMaxTotal(scoringCriteria), [scoringCriteria]);

  const TRACKS = useMemo(
    () => ["ALL", ...Array.from(new Set(projectsData.map((project) => project.track)))],
    [projectsData]
  );

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const response = await fetch("/api/judge/projects", { cache: "no-store" });
      const payload = (await response.json()) as Partial<JudgeProjectsResponse> & { error?: string };
      if (!response.ok) {
        setLoadError(payload.error ?? "Unable to load projects.");
        if (response.status === 401 || response.status === 403) {
          router.replace("/judge/login");
        }
        return;
      }

      const projects = Array.isArray(payload.projects) ? payload.projects : [];
      const savedScores = payload.savedScores ?? {};
      const mergedScores: Record<string, ScoreEntry> = {};

      for (const project of projects) {
        const saved = savedScores[project.id];
        mergedScores[project.id] = {
          techExec: saved?.technical_execution != null ? String(saved.technical_execution) : "",
          problemSolution: saved?.problem_solution_fit != null ? String(saved.problem_solution_fit) : "",
          innovation: saved?.innovation_creativity != null ? String(saved.innovation_creativity) : "",
          presentation: saved?.presentation_quality != null ? String(saved.presentation_quality) : "",
          comment: saved?.private_comment ?? "",
          saved: typeof saved?.total === "number",
          savedTotal: typeof saved?.total === "number" ? saved.total : 0,
        };
      }

      setProjectsData(projects);
      setScores(mergedScores);
      if (typeof payload.session?.username === "string" && payload.session.username) {
        setSessionUser(payload.session.username);
      }
      if (typeof payload.submissionStatusOpen === "boolean") {
        setSubmissionOpen(payload.submissionStatusOpen);
      }
    } catch {
      setLoadError("Unable to reach the judge API.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    setSubmissionOpen(settings.submission_status);
  }, [settings.submission_status]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network failures and force logout navigation.
    }
    router.replace("/judge/login");
  }, [router]);

  function updateScore(projectId: string, field: string, value: string) {
    setScores((prev) => {
      const base = prev[projectId] ?? makeBlankScore();
      return { ...prev, [projectId]: { ...base, [field]: value, saved: false } };
    });
  }

  async function saveScore(projectId: string) {
    const score = scores[projectId] ?? makeBlankScore();
    if (scoringCriteria.some((criterion) => isFieldInvalid(score[criterion.key as CriterionKey], criterion.max))) {
      return;
    }

    const response = await fetch(`/api/judge/scores/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        techExec: score.techExec,
        problemSolution: score.problemSolution,
        innovation: score.innovation,
        presentation: score.presentation,
        comment: score.comment,
      }),
    });

    const payload = await response.json().catch(() => ({} as { error?: string; total?: number }));
    if (!response.ok) {
      setLoadError(payload.error ?? "Unable to save score.");
      return;
    }

    const total = typeof payload.total === "number" ? payload.total : calcLiveTotal(score, scoringCriteria);
    setScores((prev) => ({
      ...prev,
      [projectId]: { ...(prev[projectId] ?? makeBlankScore()), saved: true, savedTotal: total },
    }));
  }

  const projects = activeTrack === "ALL"
    ? projectsData
    : projectsData.filter((project) => project.track === activeTrack);
  const scoredCount = projectsData.filter((project) => scores[project.id]?.saved).length;

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg, display: "flex", flexDirection: "column" }}>
      <style>{RESPONSIVE_CSS}</style>

      {/* ── Topbar ── */}
      <header
        className="r-topbar"
        style={{
          height: 54, background: C.topbarBg,
          borderBottom: `1px solid ${C.red}`,
          boxShadow: "0 2px 16px rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 32px", flexShrink: 0, position: "sticky", top: 0, zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
          <span style={{ fontFamily: FB, fontSize: 26, color: C.offWhite, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
            HACK<span style={{ color: C.red }}>X</span>JUDGE
          </span>
          <span className="r-topbar-status" style={{ fontFamily: FM, fontSize: 15, color: C.red, margin: "0 10px" }}>|</span>
          <span className="r-topbar-status" style={{ fontFamily: FM, fontSize: 14, color: C.muted, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>COMMAND_CENTER · 2026</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span className="r-topbar-status" style={{ fontFamily: FM, fontSize: 14, color: C.muted, whiteSpace: "nowrap" }}>
            SUBMISSION: <span style={{ color: C.red }}>{submissionOpen ? "OPEN" : "CLOSED"}</span>
          </span>
          <span className="r-topbar-email" style={{ fontFamily: FM, fontSize: 14, color: C.muted, whiteSpace: "nowrap" }}>&gt; {sessionUser}</span>
          <motion.button className="r-topbar-logout" onClick={handleLogout} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={SPRING}
            style={{ height: 24, padding: "0 10px", background: "transparent", border: `1px solid ${C.red}`, fontFamily: FM, fontSize: 14, color: C.red, cursor: "pointer", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
            LOGOUT
          </motion.button>
          <button
            className="r-hamburger"
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
            style={{ background: "none", border: `1px solid ${C.muted}`, color: C.muted, width: 32, height: 32, cursor: "pointer", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0, transition: "border-color 0.15s, color 0.15s" }}
          >
            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
              <rect y="0" width="16" height="2" rx="1"/>
              <rect y="5" width="16" height="2" rx="1"/>
              <rect y="10" width="16" height="2" rx="1"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <div
        className="r-hero"
        style={{ background: C.topbarBg, borderBottom: `1px solid ${C.darkRed}`, padding: "22px 32px 18px", position: "relative", overflow: "hidden", flexShrink: 0 }}
      >
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(245,240,232,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(245,240,232,0.015) 1px, transparent 1px)`, backgroundSize: "20px 20px", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <span
            className="r-hero-badge"
            style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 10px", background: C.red, color: C.offWhite, fontFamily: FM, fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10 }}
          >
            // MODULE_02 · SCORING
          </span>
          <h1
            className="r-hero-h1"
            style={{ fontFamily: FB, fontSize: 46, lineHeight: "54px", margin: "0 0 10px", color: C.offWhite }}
          >
            PROJECT <span style={{ color: C.red }}>SUBMISSION</span> PORTAL
          </h1>
          <div className="r-hero-meta" style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            {[
              { label: "EVENT_DATE", value: "JUN 25, 2026",                vc: C.red      },
              { label: "VENUE",      value: "SIM STUDENT HUB BLK B LVL 1", vc: C.offWhite },
              { label: "DEADLINE",   value: formatDeadline(deadlineAt),     vc: C.red      },
            ].map(({ label, value, vc }) => (
              <div key={label}>
                <div style={{ fontFamily: FM, fontSize: 13, color: C.muted, letterSpacing: "0.06em" }}>{label}</div>
                <div style={{ fontFamily: FM, fontSize: 14, color: vc, marginTop: 2 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="r-body" style={{ display: "flex", flex: 1 }}>

        {/* Sidebar */}
        <aside
          className="r-sidebar"
          style={{ width: 230, flexShrink: 0, background: C.topbarBg, borderRight: `1px solid ${C.darkRed}` }}
        >
          <div style={{ paddingTop: 20 }}>
            <div style={{ fontFamily: FM, fontSize: 13, color: C.muted, paddingLeft: 32, marginBottom: 6, letterSpacing: "0.1em" }}>JUDGING</div>
            <div style={{ background: C.darkRed, borderLeft: `3px solid ${C.red}`, padding: "13px 0 13px 30px" }}>
              <span style={{ fontFamily: FM, fontSize: 15, color: C.white, letterSpacing: "0.06em" }}>◆ SCORE PROJECTS</span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Content header */}
          <div
            className="r-content-header"
            style={{ background: C.contentBg, borderBottom: `1px solid ${C.darkRed}`, padding: "18px 28px 16px", position: "relative" }}
          >
            <RedBar />
            <div style={{ fontFamily: FM, fontSize: 16, color: C.red, letterSpacing: "0.06em", marginBottom: 3 }}>&gt; SCORE_PROJECTS</div>
            <div style={{ fontFamily: FM, fontSize: 13, color: C.muted, letterSpacing: "0.06em", marginBottom: 3 }}>// JUDGE VIEW — SCORE APPROVED SUBMISSIONS</div>
            <div style={{ fontFamily: FM, fontSize: 13, color: C.muted, letterSpacing: "0.04em" }}>
              SCORED: <span style={{ color: C.white, fontWeight: 700 }}>{scoredCount}</span> / {projectsData.length} PROJECTS
            </div>
            {loadError ? (
              <div style={{ fontFamily: FM, fontSize: 13, color: C.red, letterSpacing: "0.04em", marginTop: 4 }}>
                // {loadError.toUpperCase()}
              </div>
            ) : null}
          </div>

          {/* Project list */}
          <div
            className="r-project-list"
            style={{ background: C.pageBg, flex: 1, padding: "22px 28px" }}
          >
            {/* Track filter */}
            <div
              className="r-filter-bar"
              style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 22 }}
            >
              {TRACKS.map(track => (
                <motion.button
                  key={track}
                  onClick={() => { setActiveTrack(track); setExpandedId(null); }}
                  whileTap={{ y: 1 }}
                  transition={{ duration: 0.1 }}
                  style={{
                    padding: "5px 18px",
                    fontFamily: FM,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase" as const,
                    border: "2px solid #1A1A1A",
                    borderRadius: 9999,
                    background: activeTrack === track ? C.red : C.panelBg,
                    color: activeTrack === track ? "#FFFFFF" : "#1A1A1A",
                    boxShadow: activeTrack === track ? "none" : "3px 3px 0 0 #1A1A1A",
                    cursor: "pointer",
                    transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
                    whiteSpace: "nowrap" as const,
                  }}
                >
                  {track === "ALL" ? "ALL_TRACKS" : track}
                </motion.button>
              ))}
            </div>

            {/* Project Counter */}
            <span
              className="r-filter-count"
              style={{ fontFamily: FM, fontSize: 13, color: C.muted, fontWeight: 700, letterSpacing: "0.1em", whiteSpace: "nowrap" as const }}
            >
              {projects.length} RECORDS_FOUND
            </span>

            {loading ? (
              <div style={{ fontFamily: FM, fontSize: 16, color: C.muted, textAlign: "center", paddingTop: 40, letterSpacing: "0.06em" }}>
                [ LOADING PROJECTS... ]
              </div>
            ) : projects.length === 0 ? (
              <div style={{ fontFamily: FM, fontSize: 16, color: C.muted, textAlign: "center", paddingTop: 40, letterSpacing: "0.06em" }}>
                [ NO APPROVED SUBMISSIONS TO SCORE YET ]
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {projects.map(p => {
                  const score      = scores[p.id] ?? makeBlankScore();
                  const isExpanded = expandedId === p.id;

                  return (
                    <div key={p.id}>
                      <motion.div
                        onClick={() => setExpandedId(isExpanded ? null : p.id)}
                        className="r-project-row"
                        whileHover={{ boxShadow: SHADOW_LG }}
                        transition={{ duration: 0.15 }}
                        style={{
                          display: "flex", alignItems: "center",
                          background: C.darkRed,
                          borderTop: `0.5px solid ${C.red}`,
                          borderRight: `0.5px solid ${C.red}`,
                          borderBottom: `0.5px solid ${C.red}`,
                          borderLeft: `2px solid ${C.red}`,
                          padding: "12px 16px 12px 15px", gap: 14,
                          boxShadow: SHADOW,
                        }}
                      >
                        <div className="r-project-thumb" style={{ flexShrink: 0 }}>
                          <PlaceholderThumb url={p.thumbnailUrl} alt={`${p.name} thumbnail`} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: FM, fontSize: 16, color: C.white, letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.name}
                          </div>
                          <div style={{ fontFamily: FM, fontSize: 14, color: C.muted, marginTop: 4, letterSpacing: "0.03em" }}>
                            {p.teamName} · {p.category}
                          </div>
                        </div>

                        {/* Actions — wrapped into a group so they move to next row on mobile */}
                        <div className="r-project-actions" style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation(); // prevents setExpandedId() from running
                              setOverlayProject(p)
                            }}
                            whileHover={{ scale: 1.04, borderColor: C.red }}
                            whileTap={{ scale: 0.96 }}
                            transition={SPRING}
                            style={{ height: 36, padding: "0 14px", background: C.panelBg, border: `1px solid ${C.offWhite}`, fontFamily: FM, fontSize: 15, color: "#1A1A1A", cursor: "pointer", flexShrink: 0, letterSpacing: "0.06em", transition: "border-color 0.15s" }}
                          >
                            VIEW
                          </motion.button>
                          <motion.button
                            onClick={() => setExpandedId(isExpanded ? null : p.id)}
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.94 }}
                            transition={SPRING}
                            style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0, padding: "0 4px", display: "flex", alignItems: "baseline", gap: 1 }}
                          >
                            <span style={{ fontFamily: FM, fontSize: 26, color: score.saved ? C.red : C.offWhite, fontWeight: 700, lineHeight: 1 }}>
                              {score.savedTotal}
                            </span>
                            <span style={{ fontFamily: FM, fontSize: 14, color: C.muted, lineHeight: 1 }}>
                              /{maxScoreTotal}
                            </span>
                          </motion.button>
                        </div>
                      </motion.div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            key={`panel-${p.id}`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            style={{ overflow: "hidden" }}
                          >
                            <ScoringPanel
                              score={score}
                              onChange={(field, value) => updateScore(p.id, field, value)}
                              onSave={() => saveScore(p.id)}
                              criteria={scoringCriteria}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {overlayProject && (
          <OverlayModal project={overlayProject} onClose={() => setOverlayProject(null)} />
        )}
      </AnimatePresence>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 60 }}
              onClick={() => setMobileNavOpen(false)}
            />

            {/* Drawer */}
            <motion.nav
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{
                position: "fixed", top: 0, left: 0, height: "100%", width: 280,
                background: C.topbarBg, borderRight: `1px solid ${C.red}`,
                zIndex: 61, display: "flex", flexDirection: "column", overflowY: "auto",
              }}
              aria-label="Mobile navigation"
            >
              {/* Header */}
              <div style={{
                height: 54, padding: "0 20px", flexShrink: 0,
                borderBottom: `1px solid ${C.red}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontFamily: FB, fontSize: 26, color: C.offWhite }}>
                  HACK<span style={{ color: C.red }}>X</span>JUDGE
                </span>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Close navigation"
                  style={{
                    background: "transparent", border: `1px solid ${C.offWhite}`,
                    color: C.offWhite, width: 28, height: 28, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 30, lineHeight: 1, padding: 0, flexShrink: 0,
                  }}
                >
                  ×
                </button>
              </div>

              {/* Nav */}
              <div style={{ flex: 1, paddingTop: 20 }}>
                <div style={{ fontFamily: FM, fontSize: 14, color: C.muted, paddingLeft: 32, marginBottom: 6, letterSpacing: "0.1em" }}>JUDGING</div>
                <div
                  style={{ background: C.darkRed, borderLeft: `3px solid ${C.red}`, padding: "13px 0 13px 30px", cursor: "pointer" }}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <span style={{ fontFamily: FM, fontSize: 15, color: C.white, letterSpacing: "0.06em" }}>◆ SCORE PROJECTS</span>
                </div>
              </div>

              {/* Footer — logout */}
              <div style={{ flexShrink: 0, padding: "16px 20px", borderTop: `1px solid #2a2a2a` }}>
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={SPRING}
                  style={{
                    width: "100%", height: 34,
                    background: "transparent", border: `1px solid ${C.red}`,
                    fontFamily: FM, fontSize: 16, color: C.red, cursor: "pointer",
                    letterSpacing: "0.06em", display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 8,
                  }}
                >
                  LOGOUT
                </motion.button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
