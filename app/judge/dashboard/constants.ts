// Shared visual tokens + responsive CSS for the judge dashboard.

// ── Colour tokens ─────────────────────────────────────────────────
export const C = {
  pageBg:    "#F5F0E8",
  topbarBg:  "#1A1A1A",
  contentBg: "#1A1A1A",
  darkRed:   "#3A0808",
  red:       "#CC0000",
  panelBg:   "#FFFFFF",
  muted:     "#888888",
  muted2:    "#888888",
  offWhite:  "#F5F0E8",
  white:     "#FFFFFF",
} as const;

export const FM        = "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace";
export const FB        = "var(--font-bebas-neue), 'Bebas Neue', sans-serif";
export const SHADOW    = "4px 4px 0 0 #CC0000";
export const SHADOW_LG = "6px 6px 0 0 #CC0000";
export const SPRING    = { type: "spring" as const, stiffness: 420, damping: 18 };

// ── Responsive CSS (scoped — avoids Tailwind colour utilities) ────
export const RESPONSIVE_CSS = `
  /* Hamburger (hidden on desktop, shown on mobile) */
  .r-hamburger { display: none; }

  /* Topbar */
  @media (max-width: 768px) {
    .r-topbar          { padding: 0 16px !important; }
    .r-topbar-status   { display: none !important; }
    .r-topbar-email    { display: none !important; }
    .r-topbar-logout   { display: none !important; }
    .r-hamburger       { display: flex !important; }
  }

  /* Hero */
  @media (max-width: 768px) {
    .r-hero         { padding: 14px 20px 16px !important; }
    .r-hero-h1      { font-size: 30px !important; line-height: 36px !important; margin-bottom: 10px !important; }
    .r-hero-meta    { gap: 10px 20px !important; margin-top: 10px !important; }
  }

  /* Body layout */
  @media (max-width: 768px) {
    .r-body    { flex-direction: column !important; }
    .r-sidebar { display: none !important; }
  }

  /* Content areas */
  @media (max-width: 768px) {
    .r-content-header { padding: 14px 16px 12px !important; }
    .r-project-list   { padding: 16px !important; }
  }

  /* Project rows — wrap at narrow widths */
  @media (max-width: 520px) {
    .r-project-row  { flex-wrap: wrap !important; gap: 8px 10px !important; padding: 10px 12px !important; }
    .r-project-thumb { display: none !important; }
    .r-project-actions { flex: 0 0 100% !important; justify-content: flex-end !important; }
  }

  /* Filter bar */
  @media (max-width: 520px) {
    .r-filter-bar { gap: 8px !important; }
    .r-filter-count { display: none !important; }
  }

  /* Scoring panel */
  @media (max-width: 640px) {
    .r-scoring-panel  { padding: 16px 14px 18px !important; }
    .r-score-row      { padding: 8px 0 !important; }
  }

  /* Overlay — full-screen on mobile */
  @media (max-width: 768px) {
    .r-overlay-backdrop { padding: 0 !important; }
    .r-overlay-panel {
      width: 100% !important;
      max-height: 100dvh !important;
      box-shadow: none !important;
    }
    .r-overlay-body { padding: 16px !important; gap: 14px !important; }
  }
`;
