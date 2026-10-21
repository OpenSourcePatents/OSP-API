import { CardHeaderBar, TagPill, C, accent } from "osp-arcade";

const stage: React.CSSProperties = { background: C.bg, padding: 24 };
const frame: React.CSSProperties = {
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 9,
  overflow: "hidden",
  width: 320,
};

/** The default LIVE-dot header bar, shown on its own surface. */
export function Default() {
  return (
    <div style={stage}>
      <div style={frame}>
        <CardHeaderBar />
      </div>
    </div>
  );
}

/** With a tag pill on the right — the standard card-top pattern. */
export function WithTag() {
  return (
    <div style={stage}>
      <div style={frame}>
        <CardHeaderBar right={<TagPill color={C.accent} borderColor={accent(0.4)}>AUTH</TagPill>} />
      </div>
    </div>
  );
}

/** A custom label + green status for a healthy endpoint. */
export function CustomLabel() {
  return (
    <div style={stage}>
      <div style={frame}>
        <CardHeaderBar dotColor={C.success} label="ONLINE" right={<TagPill color={C.success}>PUBLIC</TagPill>} />
      </div>
    </div>
  );
}
