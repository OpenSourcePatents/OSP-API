import { StatusDot, C, F } from "osp-arcade";

// The arcade DS is a dark-theme system (app background #0a0a0f). Render each
// cell on that background so components appear in their true environment.
const stage: React.CSSProperties = { background: C.bg, padding: 24 };
const row: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontFamily: F.mono,
  fontSize: 11,
  letterSpacing: 1.5,
  color: C.muted,
  textTransform: "uppercase",
};

/** The default blinking "LIVE" pip. */
export function Live() {
  return (
    <div style={stage}>
      <div style={row}>
        <StatusDot />
        <span>LIVE</span>
      </div>
    </div>
  );
}

/** The pip in each semantic color the design system ships. */
export function Statuses() {
  return (
    <div style={{ ...stage, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={row}>
        <StatusDot color={C.accent} />
        <span>Operational</span>
      </div>
      <div style={row}>
        <StatusDot color={C.success} />
        <span>Healthy</span>
      </div>
      <div style={row}>
        <StatusDot color={C.amber} />
        <span>Degraded</span>
      </div>
    </div>
  );
}
