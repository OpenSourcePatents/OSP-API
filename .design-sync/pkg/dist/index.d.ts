import * as React from "react";

/** Design tokens: colors. */
export declare const C: {
  readonly bg: string;
  readonly surface: string;
  readonly surfaceInk: string;
  readonly border: string;
  readonly borderLight: string;
  readonly accent: string;
  readonly accentHover: string;
  readonly text: string;
  readonly white: string;
  readonly muted: string;
  readonly faint: string;
  readonly success: string;
  readonly amber: string;
  readonly codeInk: string;
};

/** Design tokens: font families (Oxanium display, IBM Plex Mono, Barlow body). */
export declare const F: {
  readonly display: string;
  readonly mono: string;
  readonly body: string;
};

/** rgba() helper for the blue accent at a given alpha. */
export declare function accent(a: number): string;
/** rgba() helper for the success green at a given alpha. */
export declare function green(a: number): string;

export interface StatusDotProps {
  /** Dot color (defaults to the blue accent). */
  color?: string;
  /** Diameter in px (default 6). */
  size?: number;
}
/** Blinking status pip (the "LIVE" dot). */
export declare function StatusDot(props: StatusDotProps): React.JSX.Element;

export interface TagPillProps {
  children: React.ReactNode;
  /** Text color (default muted). */
  color?: string;
  /** Border color (default border). */
  borderColor?: string;
}
/** Small outlined uppercase tag pill, used at the top-right of a card header. */
export declare function TagPill(props: TagPillProps): React.JSX.Element;

export interface CardHeaderBarProps {
  /** Status-dot color (default accent). */
  dotColor?: string;
  /** Left-hand label text (default "LIVE"). */
  label?: string;
  /** Label color. */
  labelColor?: string;
  /** Optional right-hand content, e.g. a TagPill. */
  right?: React.ReactNode;
  borderColor?: string;
}
/** The LIVE-dot + label header bar that tops every Card. */
export declare function CardHeaderBar(props: CardHeaderBarProps): React.JSX.Element;

export interface CardProps {
  /** Optional header node, typically a CardHeaderBar. */
  header?: React.ReactNode;
  children: React.ReactNode;
  /** Adds the hover-border affordance (use for clickable cards). */
  link?: boolean;
  style?: React.CSSProperties;
  borderColor?: string;
}
/** Surface card with an optional header bar. */
export declare function Card(props: CardProps): React.JSX.Element;

export interface NeonTitleProps {
  children: React.ReactNode;
  /** Cap font size in px (fluid below the cap on narrow viewports). Default 64. */
  size?: number;
  /** Letter-spacing in px (default 6). */
  letterSpacing?: number;
  /** White outline stroke width in px (default 2). */
  strokeWidth?: number;
}
/** Double-layered neon title: white stroke outline + flickering blue fill. */
export declare function NeonTitle(props: NeonTitleProps): React.JSX.Element;

export interface EyebrowProps {
  children: React.ReactNode;
  /** Text color (default muted). */
  color?: string;
  /** Text alignment (default "left"). */
  align?: React.CSSProperties["textAlign"];
}
/** Tiny uppercase Oxanium section eyebrow label. */
export declare function Eyebrow(props: EyebrowProps): React.JSX.Element;
