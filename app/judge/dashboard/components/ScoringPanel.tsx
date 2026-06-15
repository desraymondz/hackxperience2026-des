/* eslint-disable react/jsx-no-comment-textnodes */
"use client";

import { motion } from "framer-motion";
import { C, FM, FB, SPRING } from "../constants";
import { CRITERIA, isFieldInvalid, calcLiveTotal, type CriterionKey, type ScoringCriterion } from "../scoring";
import type { ScoreEntry } from "../types";

// Subtitles for each criterion matching the design
const CRITERION_SUBTITLES: Record<string, string> = {
  techExec:        "Code quality, system design, functionality, reliability, and robustness.",
  problemSolution: "How well the solution addresses the problem and meets user needs.",
  innovation:      "Originality of idea, creative approach, and differentiation.",
  presentation:    "Clarity, structure, delivery, and visual appeal of the presentation.",
};

function CriterionIcon({ color, criteriaKey }: { color: string; criteriaKey: string }) {
  return (
    <div style={{
      width: 36, height: 36, background: color, borderRadius: 4,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      color: C.white,
    }}>
      {criteriaKey === "techExec" && (
        <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: 13, fontWeight: 700 }}>&lt;/&gt;</span>
      )}
      {criteriaKey === "problemSolution" && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h6v3a2 2 0 1 1 0 4v3H4V6z" />
          <path d="M14 6h6v10h-6v-3a2 2 0 1 0 0-4v-3z" />
        </svg>
      )}
      {criteriaKey === "innovation" && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18h6" />
          <path d="M10 21h4" />
          <path d="M15.5 14c.5-1.5 1.5-2.5 1.5-4a5 5 0 0 0-10 0c0 1.5 1 2.5 1.5 4h7z" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="4.5" y1="4.5" x2="6" y2="6" />
          <line x1="19.5" y1="4.5" x2="18" y2="6" />
          <line x1="1" y1="10" x2="3" y2="10" />
          <line x1="23" y1="10" x2="21" y2="10" />
        </svg>
      )}
      {criteriaKey === "presentation" && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3h6l1 4H8l1-4z" />
          <path d="M8 7L3 18" strokeDasharray="2 3" />
          <path d="M16 7l6 13" strokeDasharray="2 3" />
          <ellipse cx="12" cy="19" rx="9" ry="2.5" />
        </svg>
      )}
    </div>
  );
}

const ICON_COLORS = [C.primary, C.primary, C.primary, C.primary];

export function ScoringPanel({ score, onChange, onSave, criteria, projectId: _projectId }: {
  score: ScoreEntry;
  onChange: (field: string, value: string) => void;
  onSave: () => void;
  criteria?: readonly ScoringCriterion[];
  projectId?: string;
}) {
  const activeCriteria = criteria ?? CRITERIA;
  const anyInvalid = activeCriteria.some(c => isFieldInvalid(score[c.key as CriterionKey], c.max));
  const liveTotal  = calcLiveTotal(score, activeCriteria);
  const maxTotal   = activeCriteria.reduce((s, c) => s + c.max, 0);

  function step(key: string, max: number, delta: number) {
    const current = parseInt(score[key as CriterionKey]) || 0;
    const next    = Math.min(max, Math.max(0, current + delta));
    onChange(key, String(next));
  }

  return (
    <div
      className="r-scoring-panel"
      style={{
        background: "transparent",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
<<<<<<< HEAD
        .score-input { appearance: none; }
        .score-input::-webkit-outer-spin-button,
        .score-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .score-input:focus { border-color: #CC0000 !important; box-shadow: 2px 2px 0 0 #CC0000 !important; outline: none; }
        .portal-ta::placeholder { color: #555555; font-family: var(--font-ibm-plex-mono), monospace; font-size: 15px; opacity: 1; }
        .portal-ta:focus { border-color: #CC0000 !important; box-shadow: 2px 2px 0 0 #CC0000 !important; outline: none; }
      `}</style>

      <div style={{ fontFamily: FM, fontSize: 13, color: C.muted, letterSpacing: "0.1em", marginBottom: 16 }}>
        // ASSESSMENT_MATRIX
      </div>

      {activeCriteria.map((c, i) => {
        const rowColor = C.offWhite;
        const val      = score[c.key as CriterionKey];
        const invalid  = isFieldInvalid(val, c.max);

        return (
          <div
            key={c.key}
            className="r-score-row"
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "11px 0",
              borderBottom: i < activeCriteria.length - 1 ? "1px solid rgba(85,85,85,0.2)" : "none",
            }}
          >
            <span style={{ fontFamily: FM, fontSize: 15, color: rowColor, flex: 1 }}>{c.label}</span>
            {invalid && (
              <span style={{ fontFamily: FM, fontSize: 13, color: C.red, marginRight: 14, letterSpacing: "0.04em" }}>
                // INVALID
              </span>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <input
                type="text"
                className="score-input"
                value={val}
                onChange={e => onChange(c.key, e.target.value)}
                style={{
                  width: 52, height: 40,
                  background: "#0D0D0D",
                  border: `1.5px solid ${invalid ? C.red : "#3A0808"}`,
                  color: invalid ? C.red : rowColor,
                  fontFamily: FM, fontSize: 18, fontWeight: 700,
                  textAlign: "center", outline: "none",
                  boxSizing: "border-box",
                  boxShadow: invalid ? "2px 2px 0 0 #CC0000" : "2px 2px 0 0 #3A0808",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
              />
              <span style={{ fontFamily: FM, fontSize: 14, color: C.muted, minWidth: 28 }}>/ {c.max}</span>
            </div>
          </div>
        );
      })}

      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <div style={{ fontFamily: FM, fontSize: 13, color: C.muted, letterSpacing: "0.08em", marginBottom: 8 }}>
          // PRIVATE_COMMENT — OPTIONAL
=======
        .portal-ta::placeholder { color: ${C.textMuted}; font-family: var(--font-ibm-plex-mono), monospace; font-size: 12px; opacity: 1; }
        .portal-ta:focus { border-color: ${C.primary} !important; outline: none; }
        .r-stepper-btn { transition: background 0.15s, color 0.15s, border-color 0.15s; }
        .r-stepper-btn:hover { background: ${C.primary} !important; color: ${C.white} !important; border-color: ${C.primary} !important; }
        .r-stepper-btn:active { transform: scale(0.92); }
        .r-score-input::-webkit-inner-spin-button,
        .r-score-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .r-score-input { -moz-appearance: textfield; }
        .r-score-input:focus { border-color: ${C.primary} !important; outline: none; }
      `}</style>

      {/* Scoring rows */}
      <div style={{ flex: 1, padding: "0 16px" }}>
        {activeCriteria.map((c, i) => {
          const val      = parseInt(score[c.key as CriterionKey]) || 0;
          const invalid  = isFieldInvalid(score[c.key as CriterionKey], c.max);
          const subtitle = CRITERION_SUBTITLES[c.key] ?? "";

          return (
            <div
              key={c.key}
              className="r-score-row"
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "13px 0",
                borderBottom: i < activeCriteria.length - 1 ? `1px solid ${C.borderLight}` : "none",
              }}
            >
              <CriterionIcon color={ICON_COLORS[i] ?? C.primary} criteriaKey={c.key} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="r-stepper-label"
                  style={{ fontFamily: FM, fontSize: 12, color: C.textPrimary, letterSpacing: "0.02em", fontWeight: 700 }}
                >
                  {c.label}
                </div>
                <div className="r-score-desc" style={{ fontFamily: FM, fontSize: 10, color: C.textMuted, marginTop: 2, lineHeight: 1.4 }}>
                  {subtitle}
                </div>
                {invalid && (
                  <div style={{ fontFamily: FM, fontSize: 10, color: C.primary, marginTop: 2, lineHeight: 1.4 }}>
                    Please input the current criteria within {c.max}
                  </div>
                )}
              </div>

              {/* Stepper */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <button
                  type="button"
                  className="r-stepper-btn"
                  onClick={() => step(c.key, c.max, -1)}
                  style={{
                    width: 26, height: 26,
                    background: "transparent",
                    border: `1px solid ${C.borderMedium}`,
                    color: C.textMuted,
                    fontFamily: FM, fontSize: 16, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: 0, lineHeight: 1,
                  }}
                  aria-label={`Decrease ${c.label}`}
                >
                  −
                </button>
                <input
                  type="number"
                  className="r-score-input"
                  value={score[c.key as CriterionKey]}
                  min={0}
                  max={c.max}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    onChange(c.key, e.target.value);
                  }}
                  style={{
                    width: 38, height: 26,
                    fontFamily: FM, fontSize: 15, fontWeight: 700,
                    color: invalid ? C.primary : C.textPrimary,
                    background: "transparent",
                    border: `1px solid ${invalid ? C.primary : C.borderMedium}`,
                    textAlign: "center",
                    padding: 0,
                    transition: "border-color 0.15s",
                  }}
                  aria-label={`${c.label} score`}
                />
                <button
                  type="button"
                  className="r-stepper-btn"
                  onClick={() => step(c.key, c.max, +1)}
                  style={{
                    width: 26, height: 26,
                    background: "transparent",
                    border: `1px solid ${C.borderMedium}`,
                    color: C.textMuted,
                    fontFamily: FM, fontSize: 16, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: 0, lineHeight: 1,
                  }}
                  aria-label={`Increase ${c.label}`}
                >
                  +
                </button>
                <span style={{ fontFamily: FM, fontSize: 11, color: C.textMuted, minWidth: 28 }}>/ {c.max}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Private comments */}
      <div style={{ padding: "14px 16px 0", borderTop: `1px solid ${C.borderLight}` }}>
        <div style={{ fontFamily: FM, fontSize: 10, color: C.textMuted, letterSpacing: "0.08em", marginBottom: 8, textTransform: "uppercase" as const }}>
          Private Comments (Optional)
>>>>>>> origin/judge_page_redesign
        </div>
        <textarea
          className="portal-ta"
          value={score.comment}
          onChange={e => onChange("comment", e.target.value)}
          placeholder="Share your feedback with the team (optional)..."
          maxLength={1000}
          style={{
<<<<<<< HEAD
            width: "100%", height: 100,
            background: "#0D0D0D",
            border: "1.5px solid #3A0808",
            color: C.offWhite, fontFamily: FM, fontSize: 15,
=======
            width: "100%", height: 72,
            background: "transparent",
            border: `1px solid ${C.borderMedium}`,
            color: C.textPrimary, fontFamily: FM, fontSize: 12,
>>>>>>> origin/judge_page_redesign
            padding: "10px 12px", resize: "none", outline: "none",
            boxSizing: "border-box", lineHeight: 1.5,
            transition: "border-color 0.15s",
          }}
        />
        <div style={{ fontFamily: FM, fontSize: 10, color: C.textMuted, textAlign: "right", marginTop: 4 }}>
          {score.comment.length} / 1000
        </div>
      </div>

      {/* Footer: save indicator + TOTAL + SAVE SCORE button */}
      <div style={{
        padding: "12px 16px 18px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 10,
        borderTop: `1px solid ${C.borderLight}`,
      }}>
        {/* Left: save / live total */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {score.saved ? (
            <>
              <div style={{
                width: 18, height: 18, background: C.textSuccess, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke={C.white} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: FM, fontSize: 10, color: C.textPrimary, fontWeight: 700 }}>Saved</div>
              </div>
            </>
          ) : (
            <div style={{ fontFamily: FM, fontSize: 11, color: C.textMuted }}>
              TOTAL{" "}
              <span style={{ fontFamily: FB, fontSize: 20, color: C.textPrimary, verticalAlign: "middle" }}>
                {liveTotal}
              </span>
              <span style={{ color: C.textMuted }}> / {maxTotal}</span>
            </div>
          )}
        </div>

        {/* Right: SAVE SCORE */}
        <motion.button
          onClick={onSave}
          disabled={anyInvalid}
          whileHover={anyInvalid ? {} : { scale: 1.03 }}
          whileTap={anyInvalid ? {} : { scale: 0.96 }}
          transition={SPRING}
          style={{
<<<<<<< HEAD
            height: 40, padding: "0 20px",
            background: anyInvalid ? "#1F1F1F" : C.red,
            border: anyInvalid ? `1px solid ${C.muted}` : "none",
            fontFamily: FB, fontSize: 26, color: anyInvalid ? C.muted : C.offWhite,
=======
            height: 38, padding: "0 20px",
            background: anyInvalid ? C.borderLight : C.primary,
            border: "none",
            fontFamily: FB, fontSize: 18,
            color: anyInvalid ? C.textMuted : C.white,
>>>>>>> origin/judge_page_redesign
            cursor: anyInvalid ? "not-allowed" : "pointer",
            letterSpacing: "0.05em",
            display: "flex", alignItems: "center", gap: 8,
            transition: "background 0.15s",
            boxShadow: anyInvalid ? "none" : `3px 3px 0 0 ${C.textPrimary}`,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M7 2v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          SAVE SCORE
        </motion.button>
<<<<<<< HEAD
        {anyInvalid && (
          <span style={{ fontFamily: FM, fontSize: 13, color: C.red, letterSpacing: "0.06em" }}>// INVALID INPUT</span>
        )}
        {!anyInvalid && score.saved && (
          <span style={{ fontFamily: FM, fontSize: 13, color: C.offWhite, letterSpacing: "0.06em" }}>// SCORE SAVED ✓</span>
        )}
=======
>>>>>>> origin/judge_page_redesign
      </div>
    </div>
  );
}
