# design-sync notes — osp-api (off-script import)

This repo is a **Next.js app**, not a packaged design-system library. The design
system is imported off-script from an embedded set of primitives.

## How the source package is assembled
- `.design-sync/pkg/` is a hand-built mini-package standing in for a real DS dist:
  - `src/theme.ts` — verbatim copy of the repo's `lib/theme.ts` (tokens `C`, `F`, `accent`, `green`).
  - `src/ui.tsx` — verbatim copy of the repo's `components/ui.tsx`, with the one
    import rewritten `@/lib/theme` → `./theme`.
  - `src/index.ts` — re-exports the 6 primitives + tokens.
  - `dist/index.js` — esbuild ESM bundle (react/react-dom external, jsx automatic).
  - `dist/index.d.ts` — **hand-written** props contract for the 6 components.
  - `styles.css` — verbatim copy of the repo's `app/globals.css` (used as `cfg.cssEntry`).
- Components shipped: `StatusDot`, `TagPill`, `CardHeaderBar`, `Card`, `NeonTitle`, `Eyebrow`.
- Excluded from the bundle: the `Chrome`/`Header`/`Nav`/`Footer` shell — it imports
  `next/link` + `next/navigation` (`usePathname`) and can't render standalone in the
  design agent's runtime.
- Tokens `C`/`F` are excluded from the component card list (`componentSrcMap: null`) but
  remain on `window.OSPArcade` for the design agent to reference.

## Rebuild recipe (the "build" for this off-script package)
```sh
node .ds-sync/node_modules/esbuild/bin/esbuild .design-sync/pkg/src/index.ts \
  --bundle --format=esm --jsx=automatic \
  --external:react --external:react-dom --external:react/jsx-runtime \
  --outfile=.design-sync/pkg/dist/index.js
node .ds-sync/package-build.mjs --config .design-sync/config.json \
  --node-modules ./node_modules --entry .design-sync/pkg/dist/index.js --out ./ds-bundle
node .ds-sync/package-validate.mjs ./ds-bundle
```

## Re-sync risks (what can silently go stale)
- **The pkg src copies are snapshots.** If `lib/theme.ts` or `components/ui.tsx` change
  in the app, `.design-sync/pkg/src/{theme.ts,ui.tsx}` must be re-copied (and the `@/lib/theme`
  → `./theme` rewrite re-applied to `ui.tsx`) before rebuilding, or the DS ships stale code.
- **`dist/index.d.ts` is hand-written.** If a primitive's props change, update it by hand.
- **`styles.css` is a copy of `app/globals.css`.** Re-copy on any globals.css change.
- Fonts (Oxanium / IBM Plex Mono / Barlow) load via a remote Google Fonts `@import` at the
  top of globals.css → carried into `_ds_bundle.css`. Expect a `[FONT_REMOTE]` informational line.

## Known render warns (expected — not new on re-sync)
- `[FONT_REMOTE] "Barlow"` — fonts are served by Google Fonts at runtime, by design. No action.

## Preview conventions applied
- Every authored preview wraps its cell in the DS app background (`C.bg`, `#0a0a0f`) — these
  components are dark-theme only, so grading/rendering on white was a context mismatch, not a defect.
- `cfg.overrides.CardHeaderBar.cardMode = "column"` — its 320px frame overflowed the default grid
  cell (`[GRID_OVERFLOW]`); column mode gives one full-width story per row.
