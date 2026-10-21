"use client";

import { useId } from "react";

// Shared portal mark: stationary center with an orbiting motto.
export default function LogoBadge({ decorative = false }: { decorative?: boolean }) {
  const ringId = useId();
  return (
    <span className="osp-logo-badge" role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "OpenSourcePatents LLC. People over profits. Founded 2026."}
      aria-hidden={decorative || undefined}>
      <span className="osp-logo-center">
        <img src="/osp-logo.jpg" alt="" />
      </span>
      <svg className="osp-logo-ring" viewBox="0 0 180 180" aria-hidden="true" focusable="false">
        <defs>
          <path id={ringId} d="M90 14a76 76 0 1 1 0 152a76 76 0 1 1 0-152" />
        </defs>
        <text>
          <textPath href={`#${ringId}`} textLength="464" lengthAdjust="spacing">
            {"PEOPLE OVER PROFITS \u2605 FOUNDED 2026 \u2605"}
          </textPath>
        </text>
      </svg>
    </span>
  );
}
