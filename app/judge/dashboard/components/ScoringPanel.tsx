/* eslint-disable react/jsx-no-comment-textnodes */
"use client";

import { motion } from "framer-motion";
import { C, FM, FB, SPRING, SHADOW } from "../constants";
import { CRITERIA, isFieldInvalid, type CriterionKey, type ScoringCriterion } from "../scoring";
import type { ScoreEntry } from "../types";
import { RedBar } from "./atoms";

export function ScoringPanel({ score, onChange, onSave, criteria }: {
  score: ScoreEntry;
  onChange: (field: string, value: string) => void;
  onSave: () => void;
  criteria?: readonly ScoringCriterion[];
}) {
  const activeCriteria = criteria ?? CRITERIA;
  const anyInvalid = activeCriteria.some(c => isFieldInvalid(score[c.key as CriterionKey], c.max));

  return (
    <div
      className="r-scoring-panel"
      style={{
        background: C.topbarBg,
        border: `1px solid ${C.red}`,
        borderTop: "none",
        borderLeft: `2px solid ${C.red}`,
        padding: "20px 20px 22px",
        boxShadow: SHADOW,
        position: "relative",
      }}
    >
      <RedBar />
      <style>{`
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
        </div>
        <textarea
          className="portal-ta"
          value={score.comment}
          onChange={e => onChange("comment", e.target.value)}
          placeholder="Comment visible only to admins..."
          style={{
            width: "100%", height: 100,
            background: "#0D0D0D",
            border: "1.5px solid #3A0808",
            color: C.offWhite, fontFamily: FM, fontSize: 15,
            padding: "10px 12px", resize: "none", outline: "none",
            boxSizing: "border-box", lineHeight: 1.5,
            boxShadow: "2px 2px 0 0 #3A0808",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <motion.button
          onClick={onSave}
          disabled={anyInvalid}
          whileHover={anyInvalid ? {} : { scale: 1.03 }}
          whileTap={anyInvalid ? {} : { scale: 0.96 }}
          transition={SPRING}
          style={{
            height: 40, padding: "0 20px",
            background: anyInvalid ? "#1F1F1F" : C.red,
            border: anyInvalid ? `1px solid ${C.muted}` : "none",
            fontFamily: FB, fontSize: 26, color: anyInvalid ? C.muted : C.offWhite,
            cursor: anyInvalid ? "not-allowed" : "pointer",
            letterSpacing: "0.05em",
            boxShadow: anyInvalid ? "none" : "4px 4px 0 0 #1A1A1A",
            transition: "background 0.15s",
          }}
        >
          SAVE SCORE
        </motion.button>
        {anyInvalid && (
          <span style={{ fontFamily: FM, fontSize: 13, color: C.red, letterSpacing: "0.06em" }}>// INVALID INPUT</span>
        )}
        {!anyInvalid && score.saved && (
          <span style={{ fontFamily: FM, fontSize: 13, color: C.offWhite, letterSpacing: "0.06em" }}>// SCORE SAVED ✓</span>
        )}
      </div>
    </div>
  );
}
