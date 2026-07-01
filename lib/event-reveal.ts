/**
 * Landing-page reveal gate for tracks and judges (announced together at pre-event).
 * Set NEXT_PUBLIC_REVEAL_TRACKS_AND_JUDGES=true in Vercel after 17 Jul pre-event.
 * Defaults to hidden (unset or any value other than "true").
 */
export const REVEAL_TRACKS_AND_JUDGES =
  process.env.NEXT_PUBLIC_REVEAL_TRACKS_AND_JUDGES === "true";
