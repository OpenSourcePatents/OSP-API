import React from "react";
import { C, F, accent } from "@/lib/theme";

/** Blinking status dot (the "LIVE" pip). */
export function StatusDot({
  color = C.accent,
  size = 6,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <span
      className="dc-dot"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 ${size}px ${color}`,
        display: "inline-block",
        animation: "status-blink 2.2s ease-in-out infinite",
      }}
    />
  );
}

/** Small outlined uppercase tag pill (top-right of a card header). */
export function TagPill({
  children,
  color = C.muted,
  borderColor = C.border,
}: {
  children: React.ReactNode;
  color?: string;
  borderColor?: string;
}) {
  return (
    <span
      style={{
        fontFamily: F.display,
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: 1,
        color,
        border: `1px solid ${borderColor}`,
        borderRadius: 3,
        padding: "2px 8px",
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

/** The LIVE-dot + tag header bar that tops every card. */
export function CardHeaderBar({
  dotColor = C.accent,
  label = "LIVE",
  labelColor = accent(0.7),
  right,
  borderColor = C.border,
}: {
  dotColor?: string;
  label?: string;
  labelColor?: string;
  right?: React.ReactNode;
  borderColor?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        borderBottom: `1px solid ${borderColor}`,
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <StatusDot color={dotColor} />
        <span
          style={{
            fontFamily: F.mono,
            fontSize: 9,
            color: labelColor,
            letterSpacing: 1.5,
          }}
        >
          {label}
        </span>
      </div>
      {right}
    </div>
  );
}

/** Surface card with optional header bar. `link` adds the hover-border effect. */
export function Card({
  header,
  children,
  link = false,
  style,
  borderColor = C.border,
}: {
  header?: React.ReactNode;
  children: React.ReactNode;
  link?: boolean;
  style?: React.CSSProperties;
  borderColor?: string;
}) {
  return (
    <div
      className={link ? "dc-card-link" : undefined}
      style={{
        background: C.surface,
        border: `1px solid ${borderColor}`,
        borderRadius: 9,
        overflow: "hidden",
        transition: "border-color 0.15s ease",
        ...style,
      }}
    >
      {header}
      {children}
    </div>
  );
}

/** Double-layered neon title: white stroke outline + flickering blue fill. */
export function NeonTitle({
  children,
  size = 64,
  letterSpacing = 6,
  strokeWidth = 2,
}: {
  children: React.ReactNode;
  size?: number;
  letterSpacing?: number;
  strokeWidth?: number;
}) {
  const base: React.CSSProperties = {
    fontFamily: F.display,
    // Fluid down on narrow viewports so long titles never exceed the screen,
    // capped at the requested px size on larger screens.
    fontSize: `min(${size}px, 11vw)`,
    fontWeight: 800,
    letterSpacing: `min(${letterSpacing}px, 1.4vw)`,
    textTransform: "uppercase",
    lineHeight: 1.1,
    margin: 0,
  };
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <h1
        style={{
          ...base,
          color: "transparent",
          WebkitTextStroke: `${strokeWidth}px rgba(255,255,255,0.8)`,
        }}
      >
        {children}
      </h1>
      <h1
        className="dc-neon-fill"
        aria-hidden
        style={{
          ...base,
          position: "absolute",
          inset: 0,
          color: C.accent,
          animation: "neon-flicker 4s ease-in-out infinite",
        }}
      >
        {children}
      </h1>
    </div>
  );
}

/** Section eyebrow label — tiny uppercase Oxanium. */
export function Eyebrow({
  children,
  color = C.muted,
  align = "left",
}: {
  children: React.ReactNode;
  color?: string;
  align?: React.CSSProperties["textAlign"];
}) {
  return (
    <p
      style={{
        fontFamily: F.display,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 2.4,
        color,
        textTransform: "uppercase",
        textAlign: align,
      }}
    >
      {children}
    </p>
  );
}
