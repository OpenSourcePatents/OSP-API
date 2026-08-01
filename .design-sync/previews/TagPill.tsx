import { TagPill, C, accent } from "osp-arcade";

const stage: React.CSSProperties = { background: C.bg, padding: 24 };

/** The default outlined tag. */
export function Default() {
  return (
    <div style={stage}>
      <TagPill>REFERENCE</TagPill>
    </div>
  );
}

/** The tags used across the API's card headers. */
export function Variants() {
  return (
    <div style={{ ...stage, display: "flex", gap: 8, flexWrap: "wrap" }}>
      <TagPill>REFERENCE</TagPill>
      <TagPill color={C.accent} borderColor={accent(0.4)}>AUTH</TagPill>
      <TagPill color={C.success}>PUBLIC</TagPill>
      <TagPill color={C.amber}>BETA</TagPill>
    </div>
  );
}
