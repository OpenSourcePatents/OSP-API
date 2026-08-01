# OSP Arcade — how to build with this design system

The "arcade terminal" look: dark base, blue neon accent (`#3b82f6`), three-font
system. Components are exported from `osp-arcade` and rendered from
`window.OSPArcade.*`.

## Dark theme is required
Every component is designed for a **dark background**. Place your UI on the app
background token (`C.bg`, `#0a0a0f`) or a surface (`C.surface`, `#12121a`). On a
light background the neon `NeonTitle` outline and the muted `Eyebrow`/`StatusDot`
labels lose contrast. There is no light theme — build dark.

## Styling idiom: tokens + props, not classes
The six components carry their own styling and are tuned via **props**, not CSS
classes. Compose your surrounding layout with the exported design tokens:

- `C` — colors: `bg`, `surface`, `border`, `borderLight`, `accent`, `accentHover`,
  `text`, `white`, `muted`, `faint`, `success`, `amber`, `codeInk`.
- `F` — font families: `F.display` (Oxanium — titles/labels), `F.mono`
  (IBM Plex Mono — code/status), `F.body` (Barlow — prose).
- `accent(a)` / `green(a)` — `rgba()` helpers for glows and faint borders, e.g.
  `boxShadow: \`0 0 8px ${accent(0.4)}\``.

Import them from the package: `import { C, F, accent } from "osp-arcade"`.

## Utility classes the stylesheet ships (for non-component UI)
`styles.css` (the single stylesheet — link only this) also carries plain CSS
classes for chrome the library doesn't export as components. Use these instead of
inventing your own:

- Buttons / inputs: `dc-btn-primary`, `dc-btn-ghost`, `dc-card-link` (hover-border
  affordance), `dc-navlink`, `dc-arrow`, `dc-copy`, `dc-chip`, `dc-oauth`, `dc-input`.
- Ambient overlays (fixed, pointer-events:none — drop once at the page root for the
  full arcade backdrop): `dc-grid`, `dc-vignette`, `dc-scanline`.
- Animations available to your own elements: `@keyframes` `neon-flicker`,
  `status-blink`, `scanline-move`, `logo-spin`. A `prefers-reduced-motion` guard is
  already shipped.

## Where the truth lives
- `styles.css` — the one stylesheet to link (it `@import`s tokens, fonts, and
  `_ds_bundle.css`). Read it before styling.
- Per component: `<Name>.d.ts` (props) and `<Name>.prompt.md` (usage).

## Idiomatic snippet
```tsx
import { Card, CardHeaderBar, TagPill, C, F, accent } from "osp-arcade";

<div style={{ background: C.bg, padding: 24 }}>
  <Card link header={<CardHeaderBar right={<TagPill color={C.accent} borderColor={accent(0.4)}>REFERENCE</TagPill>} />}>
    <div style={{ padding: "16px 14px" }}>
      <h3 style={{ fontFamily: F.display, color: C.white, letterSpacing: 1.5, textTransform: "uppercase" }}>
        API Documentation
      </h3>
      <p style={{ fontFamily: F.body, color: C.muted }}>13 endpoints, full parameter tables.</p>
    </div>
  </Card>
</div>
```
