// Arcade DS entry — re-exports the pure presentational primitives (safe to
// render standalone in the Claude Design runtime) plus the design tokens.
// The Chrome/Nav/Footer shell is intentionally excluded: it depends on
// next/navigation and can't render outside a Next.js app.
export { StatusDot, TagPill, CardHeaderBar, Card, NeonTitle, Eyebrow } from "./ui";
export { C, F, accent, green } from "./theme";
