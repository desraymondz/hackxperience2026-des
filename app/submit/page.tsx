"use client";

import { useState, useEffect } from "react";
import { Montserrat, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import Navbar from "../components/navbar";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
});
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
});

const RED = "#c00000";
const CREAM_BG = "#f2ede5";
const DARK_BG = "#1d1c17";
const OFF_WHITE = "#fef9f1";
const MUTED = "#7a7669";
const LINE = "#d8d2c5";

const FS = "var(--font-montserrat), system-ui, sans-serif";
const FM = "var(--font-ibm-plex-mono), ui-monospace, monospace";
const SHADOW = "6px 6px 0 0 #1d1c17";
const SHADOW_SM = "4px 4px 0 0 #1d1c17";

// Deadline: May 23, 2026 00:00 SGT = May 22 16:00 UTC
const DEADLINE = new Date("2026-05-22T16:00:00Z");

interface Member {
  name: string;
  studentId: string;
  role: string;
  email: string;
}

interface FormState {
  projectName: string;
  teamId: string;
  track: string;
  description: string;
  pitch: string;
  techStack: string[];
  githubUrl: string;
  liveUrl: string;
  videoUrl: string;
  pitchDeckMode: "upload" | "link";
  pitchDeckLink: string;
  members: Member[];
  notes: string;
}

interface Tick {
  d: number;
  h: number;
  m: number;
  s: number;
}

// ─── Atoms ───────────────────────────────────────────────────

function Mono({
  children,
  color = DARK_BG,
  size = 11,
  weight = 600,
  style,
}: {
  children: React.ReactNode;
  color?: string;
  size?: number;
  weight?: number;
  style?: React.CSSProperties;
}) {
  return (
    <span
      style={{
        fontFamily: FM,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: "0.06em",
        color,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
      <span style={{ fontFamily: FM, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: DARK_BG, whiteSpace: "nowrap" }}>
        {children}
      </span>
      {hint && (
        <span style={{ fontFamily: FM, fontSize: 10, color: MUTED, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
          // {hint}
        </span>
      )}
    </div>
  );
}

function SInput({
  value,
  onChange,
  placeholder,
  suffix,
  h = 44,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  suffix?: string;
  h?: number;
}) {
  return (
    <div style={{ position: "relative", boxShadow: SHADOW_SM }}>
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          height: h,
          background: "#fff",
          border: `1.5px solid ${DARK_BG}`,
          padding: `0 ${suffix ? 60 : 14}px 0 14px`,
          fontFamily: FM,
          fontSize: 13,
          color: DARK_BG,
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      {suffix && (
        <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontFamily: FM, fontSize: 10, color: MUTED, pointerEvents: "none" }}>
          {suffix}
        </span>
      )}
    </div>
  );
}

function STextarea({
  value,
  onChange,
  placeholder,
  suffix,
  h = 90,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  suffix?: string;
  h?: number;
}) {
  return (
    <div style={{ position: "relative", boxShadow: SHADOW_SM }}>
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          height: h,
          background: "#fff",
          border: `1.5px solid ${DARK_BG}`,
          padding: "12px 14px",
          fontFamily: FM,
          fontSize: 13,
          color: DARK_BG,
          outline: "none",
          resize: "none",
          lineHeight: 1.5,
          boxSizing: "border-box",
          paddingBottom: suffix ? 28 : 12,
        }}
      />
      {suffix && (
        <span style={{ position: "absolute", right: 10, bottom: 10, fontFamily: FM, fontSize: 10, color: MUTED, pointerEvents: "none" }}>
          {suffix}
        </span>
      )}
    </div>
  );
}

function Badge({ n, size = 28 }: { n: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, background: RED, color: "#fff", fontFamily: FM, fontWeight: 800, fontSize: size > 26 ? 13 : 11, display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto", letterSpacing: "0.04em" }}>
      {n}
    </div>
  );
}

function RedBtn({ children, onClick, ghost, full, disabled }: { children: React.ReactNode; onClick?: () => void; ghost?: boolean; full?: boolean; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: 46,
        padding: "0 22px",
        background: ghost ? "transparent" : RED,
        color: ghost ? DARK_BG : "#fff",
        border: `1.5px solid ${DARK_BG}`,
        fontFamily: FM,
        fontWeight: 700,
        fontSize: 12,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: SHADOW,
        width: full ? "100%" : "auto",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

function STag({ children, active, onClick }: { children: string; active: boolean; onClick: () => void }) {
  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 28,
        padding: "0 12px",
        border: `1.5px solid ${DARK_BG}`,
        background: active ? RED : "#fff",
        color: active ? "#fff" : DARK_BG,
        fontFamily: FM,
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        boxShadow: active ? SHADOW_SM : "none",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {children}
    </span>
  );
}

function Card({ children, padding = 22, style, dark }: { children: React.ReactNode; padding?: number; style?: React.CSSProperties; dark?: boolean }) {
  return (
    <div style={{ background: dark ? DARK_BG : "#fff", border: `1.5px solid ${DARK_BG}`, boxShadow: SHADOW, padding, position: "relative", ...style }}>
      <div style={{ position: "absolute", top: -1.5, left: -1.5, right: -1.5, height: 4, background: RED }} />
      {children}
    </div>
  );
}



// ─── Hero ─────────────────────────────────────────────────────

function PageHero({ tick }: { tick: Tick }) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div style={{ padding: "36px 48px 28px", display: "flex", alignItems: "flex-end", gap: 32, justifyContent: "space-between", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 280 }}>
        <span style={{ display: "inline-flex", alignItems: "center", height: 26, padding: "0 12px", background: RED, color: "#fff", fontFamily: FM, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em" }}>
          // MODULE_01 · PROJECT_REGISTRY
        </span>
        <div style={{ height: 14 }} />
        <div style={{ fontFamily: FS, fontWeight: 800, fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 0.96, letterSpacing: "-0.02em", textTransform: "uppercase", color: DARK_BG }}>
          SUBMIT YOUR<br />
          <span style={{ color: RED }}>PROJECT.PUSH()</span>
        </div>
        <div style={{ height: 14 }} />
        <Mono color={MUTED} size={11}>// 24-HOUR HACKXPERIENCE 2026 · ONE RECORD PER TEAM · RESUBMIT UNTIL DEADLINE</Mono>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
        <span style={{ display: "inline-flex", alignItems: "center", height: 26, padding: "0 12px", background: DARK_BG, color: "#fff", fontFamily: FM, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em" }}>
          // DEADLINE_IN
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          {([["DAYS", tick.d], ["HOURS", tick.h], ["MINS", tick.m], ["SECS", tick.s]] as [string, number][]).map(([u, n]) => (
            <div key={u} style={{ minWidth: 76, padding: "10px 0", background: "#fff", border: `1.5px solid ${DARK_BG}`, textAlign: "center", boxShadow: SHADOW_SM }}>
              <div style={{ fontFamily: FM, fontSize: 30, fontWeight: 700, color: RED, lineHeight: 1 }}>{pad(n)}</div>
              <div style={{ height: 4 }} />
              <Mono color={MUTED} size={9}>{u}</Mono>
            </div>
          ))}
        </div>
        <Mono color={MUTED} size={10}>// 23 MAY 2026 · 00:00 SGT</Mono>
      </div>
    </div>
  );
}

// ─── Step Rail ────────────────────────────────────────────────

const STEPS = [
  ["01", "IDENTITY", "Name, track, pitch"],
  ["02", "ASSETS", "Repo, demo, deck"],
  ["03", "MANIFEST", "1–5 members"],
  ["04", "REVIEW", "Confirm + submit"],
];

function StepRail({ active }: { active: number }) {
  return (
    <div style={{ width: 200, flexShrink: 0, display: "flex", flexDirection: "column" }}>
      {STEPS.map(([n, label, sub], i) => {
        const isA = i === active;
        const isD = i < active;
        return (
          <div key={i} style={{ display: "flex", gap: 12, padding: "16px 18px", background: isA ? DARK_BG : "#fff", border: `1.5px solid ${DARK_BG}`, borderBottom: i < 3 ? "none" : `1.5px solid ${DARK_BG}`, boxShadow: isA ? SHADOW_SM : "none", marginLeft: isA ? -4 : 0 }}>
            <div style={{ flex: "0 0 auto" }}>
              <div style={{ width: 32, height: 32, background: isD || isA ? RED : "transparent", border: isD || isA ? "none" : `1.5px solid ${isA ? "#fff" : DARK_BG}`, color: "#fff", fontFamily: FM, fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isD ? "✓" : n}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Mono color={isA ? "#fff" : DARK_BG} size={11} weight={800}>[{n}]</Mono>
                <Mono color={isA ? "#fff" : DARK_BG} size={11} weight={700}>{label}</Mono>
              </div>
              <div style={{ height: 4 }} />
              <span style={{ fontFamily: FM, fontSize: 10, color: isA ? "rgba(255,255,255,0.55)" : MUTED }}>{sub}</span>
            </div>
          </div>
        );
      })}
      <div style={{ padding: "10px 18px", border: `1.5px solid ${DARK_BG}`, borderTop: "none", background: "#fff" }}>
        <Mono color={MUTED} size={10}>// AUTOSAVED</Mono>
      </div>
    </div>
  );
}

// ─── Info Sidebar ─────────────────────────────────────────────

function InfoSidebar({ step }: { step: number }) {
  const pcts = [25, 50, 75, 95];
  const pct = pcts[step] ?? 25;
  return (
    <div style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 18 }}>
      <Card padding={18}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Mono size={11} weight={800}>&gt; PROGRESS</Mono>
          <Mono color={RED} size={12} weight={800}>{pct}%</Mono>
        </div>
        <div style={{ height: 8, background: "#e9e3d6", border: `1.5px solid ${DARK_BG}`, position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, width: `${pct}%`, background: RED, transition: "width 0.4s ease" }} />
        </div>
        <div style={{ height: 14 }} />
        {[
          ["done", "Team registered"],
          [step >= 1 ? "done" : "now", "Project Identity"],
          [step >= 2 ? "done" : step === 1 ? "now" : "todo", "Assets uploaded"],
          [step >= 3 ? "done" : step === 2 ? "now" : "todo", "Team manifest"],
          ["todo", "Submitted"],
        ].map(([s, l], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
            <div style={{ width: 16, height: 16, border: `1.5px solid ${DARK_BG}`, background: s === "done" ? RED : s === "now" ? DARK_BG : "#fff", color: "#fff", fontFamily: FM, fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
              {s === "done" ? "✓" : s === "now" ? "·" : ""}
            </div>
            <Mono color={s === "todo" ? MUTED : DARK_BG} size={10} weight={s === "todo" ? 500 : 700}>{l}</Mono>
          </div>
        ))}
      </Card>

      <Card padding={18}>
        <Mono size={11} weight={800}>&gt; JUDGING / 100PTS</Mono>
        <div style={{ height: 12 }} />
        {([["Technical Execution", 30], ["Problem–Solution Fit", 25], ["Innovation + Creativity", 25], ["Presentation Quality", 20]] as [string, number][]).map(([l, p], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: i < 3 ? `1px dashed ${LINE}` : "none", gap: 8 }}>
            <span style={{ fontFamily: FS, fontSize: 11, fontWeight: 500 }}>{l}</span>
            <Mono color={RED} size={11} weight={800} style={{ flex: "0 0 auto" }}>{p} PTS</Mono>
          </div>
        ))}
      </Card>

      <Card padding={16} dark>
        <Mono color={RED} size={11} weight={800}>// DEADLINE_ALERT</Mono>
        <div style={{ height: 8 }} />
        <div style={{ fontFamily: FM, fontSize: 11, color: "#fff", lineHeight: 1.55 }}>
          Late submissions <span style={{ color: RED, fontWeight: 800 }}>NOT</span> accepted.<br />
          Repo must be public · Demo link live.
        </div>
      </Card>
    </div>
  );
}

// ─── Shared step sub-components ───────────────────────────────

function StepHeader({ n, title, status }: { n: string; title: string; status: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
      <Badge n={n} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Mono color={RED} size={12} weight={800} style={{ letterSpacing: "0.14em" }}>&gt; {title}</Mono>
        <div style={{ height: 4 }} />
        <Mono color={MUTED} size={10}>// {status}</Mono>
      </div>
      <Mono color={MUTED} size={11}>STEP {n} / 04</Mono>
    </div>
  );
}

function FormFooter({ onNext, onBack, nextLabel, showBack = true }: { onNext?: () => void; onBack?: () => void; nextLabel: string; showBack?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1.5px dashed ${LINE}`, marginTop: 22, paddingTop: 18 }}>
      <Mono color={MUTED} size={10}>// AUTOSAVED · 12s AGO</Mono>
      <div style={{ display: "flex", gap: 12 }}>
        {showBack && <RedBtn ghost onClick={onBack}>&lt; BACK</RedBtn>}
        <RedBtn onClick={onNext}>{nextLabel}</RedBtn>
      </div>
    </div>
  );
}

// ─── Step 01: PROJECT_IDENTITY ────────────────────────────────

const TECH_TAGS = ["REACT", "NEXT.JS", "TAILWIND", "NODE.JS", "PYTHON", "OPENAI API", "SUPABASE", "FIREBASE", "VERCEL", "GITHUB", "OTHER"];
const TRACKS = ["AI for Campus Life", "Web Development", "Mobile App", "IoT / Hardware", "Data Analytics", "Open Track"];

function Step01({ form, setForm, onNext }: { form: FormState; setForm: (f: FormState) => void; onNext: () => void }) {
  const set = (k: keyof FormState) => (v: string) => setForm({ ...form, [k]: v });
  const toggleTag = (tag: string) => {
    const stack = form.techStack.includes(tag) ? form.techStack.filter((t) => t !== tag) : [...form.techStack, tag];
    setForm({ ...form, techStack: stack });
  };
  const words = (s: string) => s.trim() ? s.trim().split(/\s+/).length : 0;

  return (
    <>
      <StepHeader n="01" title="PROJECT_IDENTITY" status="NAME, TRACK, PITCH, THUMBNAIL, STACK" />
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <FieldLabel hint="REQUIRED">Project Name</FieldLabel>
          <SInput value={form.projectName} onChange={set("projectName")} placeholder="Enter your project codename…" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div>
            <FieldLabel hint="REQUIRED">Team ID</FieldLabel>
            <SInput value={form.teamId} onChange={set("teamId")} placeholder="e.g. TEAM_07" />
          </div>
          <div>
            <FieldLabel hint="REQUIRED">Track</FieldLabel>
            <div style={{ position: "relative", boxShadow: SHADOW_SM }}>
              <select
                value={form.track}
                onChange={(e) => set("track")(e.target.value)}
                style={{ width: "100%", height: 44, background: "#fff", border: `1.5px solid ${DARK_BG}`, padding: "0 36px 0 14px", fontFamily: FM, fontSize: 13, color: form.track ? DARK_BG : MUTED, appearance: "none", outline: "none", cursor: "pointer", boxSizing: "border-box" }}
              >
                <option value="">SELECT TRACK…</option>
                {TRACKS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <Mono color={MUTED} size={12} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>▾</Mono>
            </div>
          </div>
        </div>
        <div>
          <FieldLabel hint="MAX 6 WORDS · REQUIRED">Project Description</FieldLabel>
          <SInput value={form.description} onChange={set("description")} placeholder="e.g. AI campus food-waste tracker" suffix={`${words(form.description)} / 6`} />
        </div>
        <div>
          <FieldLabel hint="MAX 150 WORDS · REQUIRED">Short Pitch</FieldLabel>
          <STextarea value={form.pitch} onChange={set("pitch")} placeholder="One-liner: what does it do, and who is it for?" suffix={`${words(form.pitch)} / 150`} h={86} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, alignItems: "start" }}>
          <div>
            <FieldLabel hint="16:9 · REQUIRED">Thumbnail</FieldLabel>
            <div style={{ height: 146, border: `1.5px dashed ${DARK_BG}`, background: OFF_WHITE, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: SHADOW_SM, cursor: "pointer" }}>
              <Mono color={MUTED} size={11}>[ DRAG &amp; DROP ]</Mono>
              <Mono color={MUTED} size={10}>.JPG .PNG .WEBP</Mono>
              <Mono color={MUTED} size={10}>// CROPPED TO 16:9</Mono>
            </div>
          </div>
          <div>
            <FieldLabel hint="SELECT ALL THAT APPLY">Tech Stack</FieldLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {TECH_TAGS.map((t) => <STag key={t} active={form.techStack.includes(t)} onClick={() => toggleTag(t)}>{t}</STag>)}
            </div>
          </div>
        </div>
      </div>
      <FormFooter onNext={onNext} nextLabel="> NEXT: ASSETS →" showBack={false} />
    </>
  );
}

// ─── Step 02: ASSETS ─────────────────────────────────────────

function Step02({ form, setForm, onNext, onBack }: { form: FormState; setForm: (f: FormState) => void; onNext: () => void; onBack: () => void }) {
  const set = (k: keyof FormState) => (v: string) => setForm({ ...form, [k]: v });
  return (
    <>
      <StepHeader n="02" title="ASSETS" status="LINK YOUR REPO, DEMO, AND DECK" />
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <FieldLabel hint="REQUIRED · MUST BE PUBLIC">GitHub Repo URL</FieldLabel>
          <SInput value={form.githubUrl} onChange={set("githubUrl")} placeholder="https://github.com/your-org/your-repo" />
        </div>
        <div>
          <FieldLabel hint="OPTIONAL">Live URL</FieldLabel>
          <SInput value={form.liveUrl} onChange={set("liveUrl")} placeholder="https://your-project.vercel.app" />
        </div>
        <div>
          <FieldLabel hint="REQUIRED · MAX 3 MIN">Video Demo URL</FieldLabel>
          <SInput value={form.videoUrl} onChange={set("videoUrl")} placeholder="https://youtu.be/… (YouTube · Loom · Drive)" />
          <Mono color={MUTED} size={10} style={{ display: "block", marginTop: 8 }}>// Duration auto-detected on save; flagged if &gt; 3:00.</Mono>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <FieldLabel hint="PDF / PPTX · REQUIRED">Pitch Deck</FieldLabel>
            <div style={{ display: "flex", border: `1.5px solid ${DARK_BG}`, boxShadow: SHADOW_SM }}>
              {(["upload", "link"] as const).map((m) => (
                <span key={m} onClick={() => setForm({ ...form, pitchDeckMode: m })} style={{ padding: "5px 14px", fontFamily: FM, fontSize: 10, fontWeight: 800, background: form.pitchDeckMode === m ? RED : "#fff", color: form.pitchDeckMode === m ? "#fff" : DARK_BG, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
                  {m}
                </span>
              ))}
            </div>
          </div>
          {form.pitchDeckMode === "upload" ? (
            <div style={{ height: 130, border: `1.5px dashed ${DARK_BG}`, background: OFF_WHITE, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: SHADOW_SM, cursor: "pointer" }}>
              <Mono color={MUTED} size={12}>[ DROP DECK HERE ]</Mono>
              <Mono color={MUTED} size={10}>.PDF .PPTX · ≤ 25 MB</Mono>
            </div>
          ) : (
            <SInput value={form.pitchDeckLink} onChange={set("pitchDeckLink")} placeholder="https://drive.google.com/…" />
          )}
        </div>
      </div>
      <FormFooter onNext={onNext} onBack={onBack} nextLabel="> NEXT: MANIFEST →" />
    </>
  );
}

// ─── Step 03: TEAM_MANIFEST ───────────────────────────────────

const memberInputStyle: React.CSSProperties = {
  height: 36,
  border: `1.5px solid ${DARK_BG}`,
  padding: "0 10px",
  fontFamily: FM,
  fontSize: 12,
  color: DARK_BG,
  outline: "none",
  width: "100%",
  boxShadow: SHADOW_SM,
  boxSizing: "border-box",
};

function Step03({ form, setForm, onNext, onBack }: { form: FormState; setForm: (f: FormState) => void; onNext: () => void; onBack: () => void }) {
  const addMember = () => {
    if (form.members.length < 5) setForm({ ...form, members: [...form.members, { name: "", studentId: "", role: "", email: "" }] });
  };
  const removeMember = (i: number) => setForm({ ...form, members: form.members.filter((_, idx) => idx !== i) });
  const updateMember = (i: number, k: keyof Member, v: string) =>
    setForm({ ...form, members: form.members.map((m, idx) => (idx === i ? { ...m, [k]: v } : m)) });

  return (
    <>
      <StepHeader n="03" title="TEAM_MANIFEST" status={`MIN 1 · MAX 5 MEMBERS · CURRENT ${form.members.length}`} />
      <div style={{ display: "grid", gridTemplateColumns: "36px 1.3fr 0.85fr 1fr 1.3fr 28px", gap: 6, background: DARK_BG, padding: "10px 8px", border: `1.5px solid ${DARK_BG}` }}>
        {["#", "NAME", "STUDENT_ID", "ROLE", "EMAIL", ""].map((h, i) => <Mono key={i} color="#fff" size={10} weight={800} style={{ padding: "0 4px" }}>{h}</Mono>)}
      </div>
      {form.members.map((m, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "36px 1.3fr 0.85fr 1fr 1.3fr 28px", gap: 6, alignItems: "center", padding: "8px", borderLeft: `1.5px solid ${DARK_BG}`, borderRight: `1.5px solid ${DARK_BG}`, borderBottom: `1.5px solid ${LINE}`, background: "#fff" }}>
          <Badge n={String(i + 1).padStart(2, "0")} size={26} />
          <input value={m.name} onChange={(e) => updateMember(i, "name", e.target.value)} placeholder="Full name" style={memberInputStyle} />
          <input value={m.studentId} onChange={(e) => updateMember(i, "studentId", e.target.value)} placeholder="SIM-…" style={memberInputStyle} />
          <input value={m.role} onChange={(e) => updateMember(i, "role", e.target.value)} placeholder="Lead / Dev…" style={memberInputStyle} />
          <input value={m.email} onChange={(e) => updateMember(i, "email", e.target.value)} placeholder="name@mail.sim.edu" style={memberInputStyle} />
          <button onClick={() => removeMember(i)} style={{ width: 28, height: 28, border: `1.5px solid ${DARK_BG}`, background: "#fff", fontFamily: FM, fontSize: 14, color: MUTED, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
      ))}
      {form.members.length < 5 && (
        <div onClick={addMember} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 8px", border: `1.5px solid ${DARK_BG}`, background: "rgba(192,0,0,0.04)", cursor: "pointer" }}>
          <Badge n={String(form.members.length + 1).padStart(2, "0")} size={26} />
          <Mono color={RED} size={11} weight={800}>[ + ADD MEMBER ] — ROW {form.members.length + 1} OF 5 AVAILABLE</Mono>
        </div>
      )}
      <div style={{ height: 18 }} />
      <FieldLabel hint="OPTIONAL — DEPENDENCIES, CALL-OUTS">Additional Notes</FieldLabel>
      <STextarea value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} placeholder="Anything judges should know? e.g. 'Stanley led ML; Wei Quan led UX.'" h={70} />
      <FormFooter onNext={onNext} onBack={onBack} nextLabel="> NEXT: REVIEW →" />
    </>
  );
}

// ─── Step 04: REVIEW & SUBMIT ─────────────────────────────────

function Step04({ form, onBack, onSubmit }: { form: FormState; onBack: () => void; onSubmit: () => void }) {
  const [consent, setConsent] = useState(false);

  const RRow = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, padding: "9px 0", borderBottom: `1px dashed ${LINE}`, alignItems: "baseline" }}>
      <Mono color={MUTED} size={10} weight={700}>// {label}</Mono>
      <span style={{ fontFamily: mono ? FM : FS, fontSize: 12.5, color: DARK_BG, lineHeight: 1.5 }}>{value || "—"}</span>
    </div>
  );

  const RBlock = ({ n, title, children }: { n: string; title: string; children: React.ReactNode }) => (
    <div style={{ border: `1.5px solid ${DARK_BG}`, background: "#fff", boxShadow: SHADOW_SM, padding: 18, position: "relative", marginBottom: 14 }}>
      <div style={{ position: "absolute", top: -1.5, left: -1.5, right: -1.5, height: 3, background: RED }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <Badge n={n} size={26} />
        <Mono color={RED} size={12} weight={800} style={{ letterSpacing: "0.12em" }}>{title}</Mono>
      </div>
      {children}
    </div>
  );

  return (
    <>
      <StepHeader n="04" title="REVIEW & SUBMIT" status="ALL FIELDS COMPLETE · READY TO PUSH" />
      <div style={{ maxHeight: 480, overflow: "auto", paddingRight: 4 }}>
        <RBlock n="01" title="PROJECT_IDENTITY">
          <RRow label="PROJECT" value={form.projectName} />
          <RRow label="TEAM_ID" value={form.teamId} mono />
          <RRow label="TRACK" value={form.track} />
          <RRow label="DESCRIPTION" value={form.description} />
          <RRow label="PITCH" value={form.pitch} />
          <RRow label="STACK" value={form.techStack.join(" · ")} mono />
        </RBlock>
        <RBlock n="02" title="ASSETS">
          <RRow label="REPO" value={form.githubUrl} mono />
          <RRow label="LIVE_URL" value={form.liveUrl} mono />
          <RRow label="VIDEO" value={form.videoUrl} mono />
          <RRow label="DECK" value={form.pitchDeckMode === "link" ? form.pitchDeckLink : form.pitchDeckMode === "upload" ? "File attached" : ""} mono />
        </RBlock>
        <RBlock n="03" title="TEAM_MANIFEST">
          <RRow label="MEMBERS" value={form.members.filter((m) => m.name).map((m) => `${m.name} (${m.role})`).join(", ")} />
          <RRow label="NOTES" value={form.notes} />
        </RBlock>
        <div
          onClick={() => setConsent(!consent)}
          style={{ border: `1.5px solid ${DARK_BG}`, background: "rgba(192,0,0,0.04)", padding: 16, display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", marginBottom: 14 }}
        >
          <div style={{ width: 18, height: 18, border: `1.5px solid ${RED}`, background: consent ? RED : "transparent", color: "#fff", fontFamily: FM, fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto", marginTop: 2 }}>
            {consent ? "✓" : ""}
          </div>
          <div>
            <Mono color={RED} size={11} weight={800}>// CONSENT · REQUIRED</Mono>
            <div style={{ height: 4 }} />
            <div style={{ fontFamily: FS, fontSize: 12.5, lineHeight: 1.55, color: DARK_BG }}>
              I confirm all team members consent to this submission, the repo is public, the demo is live, and this project was built within the 24-hour HackXperience window.
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1.5px dashed ${LINE}`, marginTop: 22, paddingTop: 18 }}>
        <RedBtn ghost onClick={onBack}>&lt; BACK</RedBtn>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Mono color={MUTED} size={10}>// FINAL — writes status=PENDING</Mono>
          <RedBtn onClick={onSubmit} disabled={!consent}>&gt; SUBMIT_PROJECT ▶</RedBtn>
        </div>
      </div>
    </>
  );
}

// ─── Success State ────────────────────────────────────────────

function SuccessState({ form }: { form: FormState }) {
  const now = new Date().toLocaleString("en-SG", { timeZone: "Asia/Singapore", dateStyle: "medium", timeStyle: "short" });
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div style={{ width: 56, height: 56, background: RED, color: "#fff", fontFamily: FM, fontWeight: 800, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✓</div>
        <div>
          <Mono color={RED} size={11} weight={800} style={{ letterSpacing: "0.1em" }}>// SUBMISSION_RECEIVED</Mono>
          <div style={{ fontFamily: FS, fontSize: 30, fontWeight: 800, letterSpacing: "-0.01em" }}>You&apos;re in. Good luck.</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
        <Card padding={16}>
          <Mono color={MUTED} size={10} weight={600}>// SUBMISSION_ID</Mono>
          <div style={{ height: 6 }} />
          <div style={{ fontFamily: FM, fontSize: 16, fontWeight: 700, color: DARK_BG }}>HX26-{form.teamId || "TEAM"}-A3F1</div>
          <div style={{ height: 4 }} />
          <Mono color={MUTED} size={10}>Status: PENDING · Admin will review.</Mono>
        </Card>
        <Card padding={16}>
          <Mono color={MUTED} size={10} weight={600}>// TIMESTAMP</Mono>
          <div style={{ height: 6 }} />
          <div style={{ fontFamily: FM, fontSize: 14, fontWeight: 700, color: DARK_BG }}>{now} SGT</div>
          <div style={{ height: 4 }} />
          <Mono color={MUTED} size={10}>Before deadline.</Mono>
        </Card>
      </div>
      <Card padding={18} style={{ marginBottom: 18 }}>
        <Mono color={RED} size={11} weight={800} style={{ letterSpacing: "0.1em" }}>&gt; WHAT_HAPPENS_NEXT</Mono>
        <div style={{ height: 12 }} />
        {[
          ["01", "Admin reviews your submission", "within ~24h — they may approve, reject, or ping for fixes."],
          ["02", "Judges score approved entries", "100 pts split across 4 criteria."],
          ["03", "Results posted to Project Gallery", "1st / 2nd / 3rd / Crowd Choice announced post-event."],
        ].map(([n, t, sub], i) => (
          <div key={i} style={{ display: "flex", gap: 14, padding: "10px 0", borderTop: i ? `1px dashed ${LINE}` : "none" }}>
            <Badge n={n} size={24} />
            <div>
              <div style={{ fontFamily: FS, fontSize: 13, fontWeight: 700 }}>{t}</div>
              <div style={{ fontFamily: FM, fontSize: 11, color: MUTED, marginTop: 2 }}>// {sub}</div>
            </div>
          </div>
        ))}
      </Card>
      <Link href="/" style={{ textDecoration: "none" }}>
        <RedBtn>&gt; BACK TO HACKXPERIENCE →</RedBtn>
      </Link>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

const INITIAL_FORM: FormState = {
  projectName: "",
  teamId: "",
  track: "",
  description: "",
  pitch: "",
  techStack: [],
  githubUrl: "",
  liveUrl: "",
  videoUrl: "",
  pitchDeckMode: "upload",
  pitchDeckLink: "",
  members: [{ name: "", studentId: "", role: "", email: "" }],
  notes: "",
};

// ─── Submission Landing ───────────────────────────────────────

function SubmissionLanding({ tick, onStart }: { tick: Tick; onStart: () => void }) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div style={{ minHeight: "calc(100vh - 44px)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 48px 64px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>

      {/* Top label */}
      <div style={{ marginBottom: 32 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 26, padding: "0 12px", background: RED, color: "#fff", fontFamily: FM, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em" }}>
          // SUBMISSIONS OPEN
        </span>
      </div>

      {/* Main two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "stretch" }}>

        {/* Left: dark terminal card */}
        <div style={{ background: DARK_BG, border: `2px solid ${DARK_BG}`, boxShadow: `12px 12px 0 0 ${RED}`, padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 440 }}>
          <div>
            <Mono color={RED} size={11} weight={700} style={{ letterSpacing: "0.14em" }}>STATUS: SUBMISSIONS_OPEN</Mono>
            <div style={{ height: 24 }} />
            <div style={{ fontFamily: FS, fontWeight: 800, fontSize: "clamp(40px, 4.5vw, 64px)", lineHeight: 0.93, letterSpacing: "-0.02em", textTransform: "uppercase", color: "#fff" }}>
              SUBMIT<br />YOUR<br /><span style={{ color: RED }}>PROJECT.</span>
            </div>
            <div style={{ height: 28 }} />
            <div style={{ fontFamily: FM, fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
              // ONE SUBMISSION PER TEAM<br />
              // RESUBMIT UNTIL DEADLINE<br />
              // REPO MUST BE PUBLIC
            </div>
          </div>

          {/* Countdown */}
          <div style={{ marginTop: 40 }}>
            <Mono color="rgba(255,255,255,0.4)" size={10} weight={600}>// TIME REMAINING</Mono>
            <div style={{ height: 12 }} />
            <div style={{ display: "flex", gap: 8 }}>
              {([["DAYS", tick.d], ["HRS", tick.h], ["MIN", tick.m], ["SEC", tick.s]] as [string, number][]).map(([u, n]) => (
                <div key={u} style={{ flex: 1, padding: "10px 0", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", textAlign: "center" }}>
                  <div style={{ fontFamily: FM, fontSize: 26, fontWeight: 700, color: RED, lineHeight: 1 }}>{pad(n)}</div>
                  <div style={{ height: 4 }} />
                  <span style={{ fontFamily: FM, fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{u}</span>
                </div>
              ))}
            </div>
            <div style={{ height: 8 }} />
            <Mono color="rgba(255,255,255,0.3)" size={10}>// DEADLINE: 23 MAY 2026 · 00:00 SGT</Mono>
          </div>
        </div>

        {/* Right: info + CTA */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Info cards row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              ["01", "4-STEP FORM", "Identity · Assets · Team · Review"],
              ["02", "AUTOSAVED", "Draft saved on every field change"],
              ["03", "ONE RECORD", "Per team · Resubmit until deadline"],
              ["04", "STATUS: PENDING", "Admin reviews before judging"],
            ].map(([n, title, sub]) => (
              <div key={n} style={{ background: "#fff", border: `1.5px solid ${DARK_BG}`, boxShadow: SHADOW_SM, padding: "18px 16px", position: "relative" }}>
                <div style={{ position: "absolute", top: -1.5, left: -1.5, right: -1.5, height: 3, background: RED }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Badge n={n} size={22} />
                  <Mono size={10} weight={800} style={{ letterSpacing: "0.1em" }}>{title}</Mono>
                </div>
                <div style={{ fontFamily: FM, fontSize: 10.5, color: MUTED, lineHeight: 1.5 }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Judging criteria card */}
          <div style={{ background: "#fff", border: `1.5px solid ${DARK_BG}`, boxShadow: SHADOW_SM, padding: "20px 20px", position: "relative", flex: 1 }}>
            <div style={{ position: "absolute", top: -1.5, left: -1.5, right: -1.5, height: 3, background: RED }} />
            <Mono size={11} weight={800}>&gt; JUDGING_CRITERIA / 100 PTS</Mono>
            <div style={{ height: 14 }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {([["Technical Execution", 30], ["Problem–Solution Fit", 25], ["Innovation + Creativity", 25], ["Presentation Quality", 20]] as [string, number][]).map(([l, p]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px dashed ${LINE}`, gap: 8 }}>
                  <span style={{ fontFamily: FS, fontSize: 12, fontWeight: 500 }}>{l}</span>
                  <Mono color={RED} size={11} weight={800} style={{ flex: "0 0 auto" }}>{p} PTS</Mono>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={onStart}
            style={{
              width: "100%",
              height: 72,
              background: RED,
              color: "#fff",
              border: `1.5px solid ${DARK_BG}`,
              boxShadow: SHADOW,
              fontFamily: FM,
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#A20000")}
            onMouseLeave={(e) => (e.currentTarget.style.background = RED)}
          >
            &gt; SUBMIT_PROJECT.PUSH()
            <span style={{ fontSize: 20 }}>▶</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export default function SubmitPage() {
  const [view, setView] = useState<"landing" | "form">("landing");
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [tick, setTick] = useState<Tick>({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const update = () => {
      const diff = DEADLINE.getTime() - Date.now();
      if (diff <= 0) { setTick({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setTick({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: CREAM_BG,
    backgroundImage: `linear-gradient(${LINE} 1px, transparent 1px), linear-gradient(90deg, ${LINE} 1px, transparent 1px)`,
    backgroundSize: "40px 40px",
    backgroundPosition: "-1px -1px",
    fontFamily: FS,
    color: DARK_BG,
  };

  return (
    <div className={`${montserrat.variable} ${ibmPlexMono.variable}`} style={pageStyle}>
      <Navbar />
      <div style={{ paddingTop: 44 }}>
        {view === "landing" && (
          <SubmissionLanding tick={tick} onStart={() => setView("form")} />
        )}
        {view === "form" && !submitted && (
          <>
            <PageHero tick={tick} />
            <div style={{ padding: "0 48px 48px", display: "flex", gap: 24, alignItems: "flex-start" }}>
              <StepRail active={step} />
              <Card padding={28} style={{ flex: 1, minWidth: 0 }}>
                {step === 0 && <Step01 form={form} setForm={setForm} onNext={() => setStep(1)} />}
                {step === 1 && <Step02 form={form} setForm={setForm} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
                {step === 2 && <Step03 form={form} setForm={setForm} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
                {step === 3 && <Step04 form={form} onBack={() => setStep(2)} onSubmit={() => setSubmitted(true)} />}
              </Card>
              <InfoSidebar step={step} />
            </div>
          </>
        )}
        {submitted && (
          <div style={{ padding: "48px" }}>
            <Card padding={28}>
              <SuccessState form={form} />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
