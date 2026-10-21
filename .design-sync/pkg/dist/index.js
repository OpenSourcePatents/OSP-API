// .design-sync/pkg/src/theme.ts
var C = {
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
  codeInk: "#c8c8d0"
};
var F = {
  display: "'Oxanium', sans-serif",
  mono: "'IBM Plex Mono', monospace",
  body: "'Barlow', sans-serif"
};
var accent = (a) => `rgba(59,130,246,${a})`;
var green = (a) => `rgba(34,197,94,${a})`;

// .design-sync/pkg/src/ui.tsx
import { jsx, jsxs } from "react/jsx-runtime";
function StatusDot({
  color = C.accent,
  size = 6
}) {
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: "dc-dot",
      style: {
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 ${size}px ${color}`,
        display: "inline-block",
        animation: "status-blink 2.2s ease-in-out infinite"
      }
    }
  );
}
function TagPill({
  children,
  color = C.muted,
  borderColor = C.border
}) {
  return /* @__PURE__ */ jsx(
    "span",
    {
      style: {
        fontFamily: F.display,
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: 1,
        color,
        border: `1px solid ${borderColor}`,
        borderRadius: 3,
        padding: "2px 8px",
        textTransform: "uppercase"
      },
      children
    }
  );
}
function CardHeaderBar({
  dotColor = C.accent,
  label = "LIVE",
  labelColor = accent(0.7),
  right,
  borderColor = C.border
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        borderBottom: `1px solid ${borderColor}`,
        gap: 8,
        flexWrap: "wrap"
      },
      children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
          /* @__PURE__ */ jsx(StatusDot, { color: dotColor }),
          /* @__PURE__ */ jsx(
            "span",
            {
              style: {
                fontFamily: F.mono,
                fontSize: 9,
                color: labelColor,
                letterSpacing: 1.5
              },
              children: label
            }
          )
        ] }),
        right
      ]
    }
  );
}
function Card({
  header,
  children,
  link = false,
  style,
  borderColor = C.border
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: link ? "dc-card-link" : void 0,
      style: {
        background: C.surface,
        border: `1px solid ${borderColor}`,
        borderRadius: 9,
        overflow: "hidden",
        transition: "border-color 0.15s ease",
        ...style
      },
      children: [
        header,
        children
      ]
    }
  );
}
function NeonTitle({
  children,
  size = 64,
  letterSpacing = 6,
  strokeWidth = 2
}) {
  const base = {
    fontFamily: F.display,
    // Fluid down on narrow viewports so long titles never exceed the screen,
    // capped at the requested px size on larger screens.
    fontSize: `min(${size}px, 11vw)`,
    fontWeight: 800,
    letterSpacing: `min(${letterSpacing}px, 1.4vw)`,
    textTransform: "uppercase",
    lineHeight: 1.1,
    margin: 0
  };
  return /* @__PURE__ */ jsxs("div", { style: { position: "relative", display: "inline-block" }, children: [
    /* @__PURE__ */ jsx(
      "h1",
      {
        style: {
          ...base,
          color: "transparent",
          WebkitTextStroke: `${strokeWidth}px rgba(255,255,255,0.8)`
        },
        children
      }
    ),
    /* @__PURE__ */ jsx(
      "h1",
      {
        className: "dc-neon-fill",
        "aria-hidden": true,
        style: {
          ...base,
          position: "absolute",
          inset: 0,
          color: C.accent,
          animation: "neon-flicker 4s ease-in-out infinite"
        },
        children
      }
    )
  ] });
}
function Eyebrow({
  children,
  color = C.muted,
  align = "left"
}) {
  return /* @__PURE__ */ jsx(
    "p",
    {
      style: {
        fontFamily: F.display,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 2.4,
        color,
        textTransform: "uppercase",
        textAlign: align
      },
      children
    }
  );
}
export {
  C,
  Card,
  CardHeaderBar,
  Eyebrow,
  F,
  NeonTitle,
  StatusDot,
  TagPill,
  accent,
  green
};
