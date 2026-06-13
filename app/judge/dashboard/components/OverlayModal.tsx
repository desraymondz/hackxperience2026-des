/* eslint-disable react/jsx-no-comment-textnodes */
"use client";

import { motion } from "framer-motion";
import { C, FM, SPRING } from "../constants";
import { fmtDate } from "../scoring";
import type { JudgeProject } from "@/lib/types";
import { RedBar, Divider, FieldBlock } from "./atoms";

export function OverlayModal({ project, onClose }: { project: JudgeProject; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="r-overlay-backdrop"
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{ opacity: 0,    scale: 0.97, y: 12 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        onClick={e => e.stopPropagation()}
        className="r-overlay-panel"
        style={{
          width: "min(750px, 100%)", maxHeight: "calc(100vh - 40px)",
          display: "flex", flexDirection: "column",
          background: C.topbarBg,
          border: `1px solid ${C.red}`,
          borderTop: `3px solid ${C.red}`,
          boxShadow: "8px 8px 0 0 #CC0000",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 22px", background: C.contentBg, borderBottom: `1px solid ${C.darkRed}`, flexShrink: 0, position: "relative" }}>
          <RedBar />
          <span style={{ fontFamily: FM, fontSize: 16, color: C.red, letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: 12 }}>
            &gt; {project.name} // {project.teamName}
          </span>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.88 }}
            transition={SPRING}
            style={{ width: 20, height: 20, background: C.contentBg, border: `0.5px solid ${C.offWhite}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0, flexShrink: 0 }}
          >
            <span style={{ fontFamily: FM, fontSize: 20, fontWeight: 100, color: C.offWhite, lineHeight: 1 }}>×</span>
          </motion.button>
        </div>

        {/* Scrollable body */}
        <div
          className="r-overlay-body"
          style={{ flex: 1, overflowY: "auto", padding: "26px 24px", display: "flex", flexDirection: "column", gap: 20 }}
        >
          {/* Thumbnail */}
          <div style={{ width: "100%", aspectRatio: "16/9", background: "rgba(200,190,180,0.05)", border: `1px solid ${C.darkRed}`, position: "relative", overflow: "hidden", flexShrink: 0 }}>
            {project.thumbnailUrl ? (
              <img
                src={project.thumbnailUrl}
                alt={`${project.name} thumbnail`}
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
              />
            ) : (
              <>
                <svg width="100%" height="100%" style={{ position: "absolute" }}>
                  <line x1="0" y1="0" x2="100%" y2="100%" stroke="rgba(204,0,0,0.07)" strokeWidth="1" />
                  <line x1="100%" y1="0" x2="0" y2="100%" stroke="rgba(204,0,0,0.07)" strokeWidth="1" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: FM, fontSize: 14, color: C.muted, letterSpacing: "0.1em" }}>[ PROJECT THUMBNAIL ]</span>
                </div>
              </>
            )}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            <FieldBlock label="PROJECT NAME" value={project.name} />
            <FieldBlock label="TEAM ID"      value={project.teamId} />
            <FieldBlock label="TRACK"        value={project.track} />
          </div>

          <Divider />
          <FieldBlock label="DESCRIPTION" value={project.description} />
          <Divider />
          <FieldBlock label="SHORT PITCH"  value={project.pitch} />
          <Divider />

          {/* Tech stack */}
          <div>
            <div style={{ fontFamily: FM, fontSize: 14, color: C.red, letterSpacing: "0.08em", marginBottom: 10 }}>TECH STACK</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {project.techStack.map(t => (
                <motion.span
                  key={t}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  style={{ padding: "6px 10px", background: "#241818", border: "1px solid #5E1010", fontFamily: FM, fontSize: 15, color: C.red, display: "inline-block", cursor: "default" }}
                >
                  {t}
                </motion.span>
              ))}
            </div>
          </div>

          <Divider />

          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            <FieldBlock label="GITHUB REPO"  value={project.githubUrl} />
            {project.liveUrl          && <FieldBlock label="LIVE DEMO"  value={project.liveUrl} />}
            <FieldBlock label="PITCH DECK"   value={project.pitchDeckUrl} />
            {project.pitchDeckFileUrl && <FieldBlock label="DECK FILE"  value={project.pitchDeckFileUrl} />}
            {project.videoDemoUrl     && <FieldBlock label="VIDEO DEMO" value={project.videoDemoUrl} />}
          </div>

          <Divider />

          {/* Members */}
          <div>
            <div style={{ fontFamily: FM, fontSize: 14, color: C.red, letterSpacing: "0.08em", marginBottom: 14 }}>TEAM MEMBERS</div>
            {project.members.map((m, i) => (
              <div key={i}>
                <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "10px 0" }}>
                  <span style={{ fontFamily: FM, fontSize: 13, color: C.red, minWidth: 26, fontWeight: 700 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div style={{ fontFamily: FM, fontSize: 16, color: C.offWhite }}>{m.name}</div>
                    <div style={{ fontFamily: FM, fontSize: 14, color: C.muted2, marginTop: 2, wordBreak: "break-all" }}>{m.email.toUpperCase()}</div>
                    {m.role ? (
                      <div style={{ fontFamily: FM, fontSize: 14, color: C.muted2, marginTop: 2 }}>
                        ROLE: {m.role.toUpperCase()}
                      </div>
                    ) : null}
                    {m.studentId ? (
                      <div style={{ fontFamily: FM, fontSize: 14, color: C.muted2, marginTop: 2, wordBreak: "break-all" }}>
                        STUDENT ID: {m.studentId.toUpperCase()}
                      </div>
                    ) : null}
                  </div>
                </div>
                {i < project.members.length - 1 && <Divider />}
              </div>
            ))}
          </div>

          {project.notes && (
            <>
              <Divider />
              <FieldBlock label="ADDITIONAL NOTES" value={project.notes} muted />
            </>
          )}

          <Divider />

          <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
            <div>
              <div style={{ fontFamily: FM, fontSize: 14, color: C.red, letterSpacing: "0.08em", marginBottom: 5 }}>SUBMITTED AT</div>
              <div style={{ fontFamily: FM, fontSize: 14, color: C.muted2 }}>{fmtDate(project.submittedAt)}</div>
            </div>
            <div>
              <div style={{ fontFamily: FM, fontSize: 14, color: C.red, letterSpacing: "0.08em", marginBottom: 5 }}>LAST UPDATED</div>
              <div style={{ fontFamily: FM, fontSize: 14, color: C.muted2 }}>{fmtDate(project.updatedAt)}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: C.contentBg, borderTop: `1px solid ${C.darkRed}`, padding: "12px 22px", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={SPRING}
            style={{ height: 32, padding: "0 16px", background: "#1F1F1F", border: `1px solid ${C.offWhite}`, fontFamily: FM, fontSize: 15, color: C.offWhite, cursor: "pointer", letterSpacing: "0.06em" }}
          >
            CLOSE
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
