// Shared visual tokens + responsive CSS for the judge dashboard.

// ── Colour tokens ─────────────────────────────────────────────────
export const C = {
  // Backgrounds
  bgPrimary:    "#FAFAFA", // Main page background
  bgThumbnail:  "#F0EBE3", // Thumbnail placeholder

  // Text
  textPrimary:  "#1A1A1A", // Main text
  textMuted:    "#555555", // Secondary text, labels
  textSuccess:  "#22C55E", // Success states

  // Borders
  borderLight:  "#EAE3D8", // Dividers, subtle borders
  borderMedium: "#D0C8BC", // Card borders, inputs
  borderSuccess:"#22C55E", // Success borders

  // Brands / Accents
  primary:      "#CC0000", // Main accent red
  white:        "#FFFFFF", // Pure white
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
<<<<<<< HEAD
    .r-hero         { padding: 14px 20px 16px !important; }
    .r-hero-h1      { font-size: 30px !important; line-height: 36px !important; margin-bottom: 10px !important; }
    .r-hero-meta    { gap: 10px 20px !important; margin-top: 10px !important; }
=======
    .r-hero      { padding: 14px 20px 16px !important; }
    .r-hero-h1   { font-size: 26px !important; line-height: 32px !important; margin-bottom: 10px !important; }
    .r-hero-meta { gap: 10px 20px !important; margin-top: 10px !important; }
>>>>>>> origin/judge_page_redesign
  }

  /* Body layout */
  @media (max-width: 768px) {
    .r-body    { flex-direction: column !important; }
    .r-sidebar { display: none !important; }
  }

  /* Main content padding adjustments */
  @media (max-width: 768px) {
    .r-progress-section { padding: 16px 20px 14px !important; }
    .r-queue-section    { padding: 16px 20px 16px !important; }
    .r-detail-section   { padding: 0 !important; }
    .r-stat-boxes       { gap: 12px !important; }
  }

  /* Card carousel */
  @media (max-width: 520px) {
    .r-card-carousel { gap: 10px !important; }
    .r-project-card  { width: 140px !important; min-width: 140px !important; }
  }

  /* Filter bar */
  .r-track-list::-webkit-scrollbar { display: none; }
  @media (max-width: 520px) {
    .r-filter-bar  { gap: 6px !important; flex-wrap: wrap !important; }
  }

  /* Scoring panel */
  .r-detail-mobile-only { display: none !important; }
  @media (max-width: 900px) {
    .r-detail-container { flex-direction: column !important; }
    .r-detail-mobile-only { display: flex !important; }
    .r-score-row      { padding: 8px 0 !important; }
    .r-score-desc     { display: none !important; }
    .r-detail-left    { display: none !important; }
  }

  /* Stepper row responsive */
  @media (max-width: 480px) {
    .r-stepper-label { font-size: 10px !important; }
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

  /* Progress bar animation */
  @keyframes r-progress-fill {
    from { width: 0%; }
  }
  .r-progress-bar-fill {
    animation: r-progress-fill 0.8s ease-out forwards;
  }

  /* Scrollbar styling for card carousel */
  .r-card-carousel::-webkit-scrollbar { height: 4px; }
  .r-card-carousel::-webkit-scrollbar-track { background: transparent; }
  .r-card-carousel::-webkit-scrollbar-thumb { background: #3A0808; border-radius: 2px; }
`;
