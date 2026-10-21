/**
 * Shared visual tokens for the site chrome and pages.
 *
 * The "arcade terminal" look: dark base, blue neon accent, three-font system
 * (Oxanium display, IBM Plex Mono, Barlow body). Fonts are loaded via an @import
 * in globals.css and referenced here by family name. Animated chrome and hover
 * states live in globals.css because inline styles can't express keyframes,
 * :hover, or :focus.
 */

export const C = {
  bg: "#0a0a0f",
  surface: "#12121a",
  surfaceInk: "#0a0a0f",
  border: "#1e1e2e",
  borderLight: "#2a2a3a",
  accent: "#3b82f6",
  accentHover: "#60a5fa",
  text: "#e0e0e0",
  white: "#ffffff",
  muted: "#888888",
  faint: "#555555",
  success: "#22c55e",
  amber: "#f59e0b",
  codeInk: "#c8c8d0",
} as const;

export const F = {
  display: "'Oxanium', sans-serif",
  mono: "'IBM Plex Mono', monospace",
  body: "'Barlow', sans-serif",
} as const;

/** rgba() helpers for the accent + success, used in glows and faint borders. */
export const accent = (a: number) => `rgba(59,130,246,${a})`;
export const green = (a: number) => `rgba(34,197,94,${a})`;
