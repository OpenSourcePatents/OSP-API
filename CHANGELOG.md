# Changelog

## [1.2.1] - 2026-08-03
### Added
- Vercel Analytics: `@vercel/analytics` dependency, with `<Analytics />` rendered in the root
  layout after the page children. No other layout, metadata, or JSON-LD changes.

## [1.2.0] - 2026-08-01
### Added — `POST /api/v1/keys/mine`, backed by Supabase Auth
- New route (`app/api/v1/keys/mine/route.ts`) that hands a signed-in user their API key.
  Identity comes from an `Authorization: Bearer <token>` Supabase access token; the request body is
  never read, so a caller can only act as whoever their token belongs to. Resolution order: a live
  row already claimed by that `user_id` → an unclaimed row with the same verified email, which is
  adopted by backfilling `user_id` → otherwise mint a new key. Returns the standard single-object
  envelope `{ data: { key, tier, created_at } }` (201 on mint, 200 otherwise). `tier` is hardcoded
  `'free'` on insert and never read from input.
- `lib/supabase-auth.ts` — verifies the bearer token via `auth.getUser(token)`, which checks
  signature and expiry server-side. The JWT is never decoded locally. Client is built lazily for the
  same reason `lib/neon-auth.ts` is: constructing it at module scope breaks `next build`, which has
  no runtime secrets. Reads `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `@supabase/supabase-js` added as a dependency.
- `/signup` now signs in with Supabase Auth (Google/GitHub OAuth, PKCE) instead of the Neon Auth
  UI, then calls `POST /api/v1/keys/mine` with the access token and shows the key with a copy
  button and `X-API-Key` usage note. A visitor with a persisted session skips straight to their
  key. The email/password form is gone — OAuth providers supply a verified email, which is what
  issuance requires. `lib/supabase-client.ts` holds the lazily-built browser client. The Neon Auth
  path (`/api/auth/*`, `/api/keys`, `/auth/success`) stays live until this is verified in
  production; only the signup page moved. Failure handling: a failed code exchange or OAuth error
  bounce surfaces a generic retryable message (URL error params are never rendered — they're
  attacker-craftable), the spent `?code=` is scrubbed from the URL, and sign-out verifies the
  session was actually cleared before saying so.

### Changed
- `lib/schema.ts` — declared the `user_id` (text, nullable) and `revoked` (boolean, default false)
  columns that already exist on `api_keys`, plus an index on `user_id`. Drizzle could not query them
  while they were undeclared. Revoked rows are treated as absent: never returned, never adopted.
- `CLAUDE.md` — rewrote the history note that forbade `@supabase/supabase-js` and `SUPABASE_*` env
  vars: Supabase now handles authentication only, and Neon via Drizzle remains the sole database.
  Congressional data still comes from CongressWatch JSON — Supabase replaced Neon Auth as the
  identity provider, nothing more.

## [1.1.2] - 2026-07-15
### Fixed — mobile layout
- Header (`components/Chrome.tsx`) overflowed narrow screens: the rigid `1fr auto 1fr` grid with a
  `nowrap` brand + clock + 4 nav links was wider than a phone, and `body { overflow-x: hidden }`
  clipped the nav. Added class hooks + a `max-width: 760px` media query that stacks the header into
  centered rows, hides the decorative clock, and lets the nav wrap; `≤380px` also drops the "API v2"
  tag and tightens nav padding.
- Hero/pricing titles (`NeonTitle`) rendered at a fixed 64px/40px and overflowed phones. Font size and
  letter-spacing are now `min(px, vw)` — fluid below the cap, unchanged on desktop.
- Landing stat strip: number size and cell padding are now viewport-relative so the four columns don't
  clip under ~360px.

## [1.1.1] - 2026-07-15
### Fixed
- Favicon was referenced in `app/layout.tsx` but the file was missing from `public/` — the tab icon
  was broken. Added the OSP icon set (`favicon.ico`, `icon-32.png`, `apple-touch-icon.png`, copied
  from osp-portal) and expanded the `metadata.icons` config to serve all three.

## [1.1.0] - 2026-07-14
### Added — "Arcade terminal" redesign of all public pages
- Reskinned landing, docs, pricing, signup, and auth-success pages to a dark neon aesthetic
  (blue `#3b82f6` accent) from the Claude Design project: matrix-grid + vignette + scanline
  overlays, neon-flicker titles, a live header clock, and card chrome with LIVE-dot + tag bars.
- `app/globals.css` — font `@import` (Oxanium / IBM Plex Mono / Barlow), keyframes, hover/focus
  utility classes, and a `prefers-reduced-motion` guard that stills the animated chrome.
- `lib/theme.ts` — shared color + font tokens. `components/Chrome.tsx` — shared shell (overlays,
  sticky header with live clock + route-aware nav, footer) wired into the layout.
  `components/ui.tsx` — NeonTitle, Card, CardHeaderBar, TagPill, StatusDot, Eyebrow.
- `public/osp-logo.jpg` for the header. `favicon.ico` referenced in the layout (dropped in separately).

### Note
- All page logic preserved: signup keeps the full Neon Auth flow and password-strength meter;
  auth-success keeps the key-mint-over-session-cookie fetch + copy. Docs keeps full 13-endpoint
  coverage. Rate-limit copy reads 429 (the real status), not the mockup's 401.

## [1.0.0] - 2026-07-14
### Changed — BREAKING: Supabase removed entirely; both databases replaced
The Supabase projects backing this API were deleted. Both halves have been rebuilt on new
infrastructure, and the response contract now uses CongressWatch's native field names.

- **Congressional data → CongressWatch static JSON.** Deleted `lib/supabase.ts` (the hand-rolled
  PostgREST fetch wrapper) and `queryCongress()`. `lib/congress.ts` now reads
  `congresswatch.vercel.app/data/*.json` — already public, CORS-enabled, and CDN-cached with a
  1h `s-maxage`. No database in the data path.
- **API keys + accounts → Neon Postgres.** `lib/db.ts` (Drizzle + node-postgres, module-scope pool
  with `attachDatabasePool` for Vercel Fluid compute) and `lib/schema.ts` replace `queryOSPDB()` /
  `insertOSPDB()`. The `increment_requests_today` Supabase RPC is now a plain SQL UPDATE, no longer
  awaited on the hot path.
- **Auth → Neon Auth (Managed BetterAuth)** replaces Supabase GoTrue. `/api/auth/[...path]` proxies
  sign-up, sign-in, OAuth, and email verification. Deleted `/api/signup` and `/api/auth/confirm`.
- **Response contract now uses native CongressWatch field names.** Renames on trades:
  `trade_type` → `type`, `amount_range` → `amount` (a bracket STRING like `"$15,001 - $50,000"`,
  and null on ~231 rows). Donors: `contributor_name`/`contributor_employer` → `name`/`employer`
  (the array is `top_donors_list`). Bills: `alec_min_score` (0-100) → `min_alec_similarity` (0-1).
  `cash_on_hand` is a preformatted STRING, not a number. `district` is a string, `""` for senators.

### Added
- `GET /api/v1/members/{id}/score` now returns the **six-component breakdown**, not just the total.
  `lib/scoring.ts` ports CongressWatch's `compute_score()` (`fetch_finance.py:312`) to TypeScript —
  verified against the Python original on live data, including Python's banker's rounding.
  Response includes `stored`, recomputed `total`, and `drift`, because CongressWatch recomputes the
  score only in its finance job while votes/trades/travel refresh on separate schedules, so a
  stored score can legitimately lag its own inputs.
- `lib/aggregate.ts` builds the cross-member index for `/v1/trades` and `/v1/bills` (6,833 trades,
  5,296 bills), which exist only inside per-member detail files upstream. Cached 1h; ~1s cold,
  ~240ms warm.
- `/v1/members` gained `search`, `min_score`, and `sort` (`score|name|state|total_raised` × `asc|desc`).
- `POST /api/keys` mints an API key for the verified signed-in user, idempotently.
- Google OAuth via Neon Auth's shared dev app. **GitHub OAuth requires your own client
  credentials** — Neon does not offer a shared GitHub app.

### Fixed
- The API key is no longer passed through a URL query parameter on `/auth/success`. It was landing
  in browser history, referrer headers, and server logs. It is now fetched over the session cookie.

### Removed
- `@supabase/supabase-js` dependency, `lib/supabase.ts`, and all `SUPABASE_*` environment variables.

## [0.7.0] - 2026-04-05
### Added
- Supabase Auth email verification -- users must confirm email before API key is generated
- POST /api/signup now creates Supabase Auth user and triggers confirmation email
- GET /api/auth/confirm callback verifies token, generates API key, emails it via Resend, redirects to success page
- /auth/success page shows API key after email verification
- Tier system: free (1,000/hr), discounted (10,000/hr), paid (10,000/hr), admin (unlimited)
- /pricing page with tier comparison cards and discounted tier application info
- lib/redis.ts exports tier-specific rate limiters instead of single instance
- lib/auth.ts checks tier from api_keys and applies correct rate limiter; admin bypasses entirely

### Changed
- /signup page now collects email + password, shows "check your email" message instead of instant key
- API keys are only generated after email confirmation, not on signup

## [0.6.0] - 2026-04-05
### Changed
- Replaced @supabase/supabase-js createClient with direct REST API fetch calls for sb_secret_ key compatibility
- lib/supabase.ts now exports queryOSPDB(), insertOSPDB(), rpcOSPDB(), queryCongress() using raw PostgREST fetch
- lib/auth.ts updated to use queryOSPDB instead of supabase client
- All 13 API routes updated to use queryCongress/queryOSPDB
- Separated dual-DB env vars: CONGRESS_SUPABASE_URL + CONGRESS_SUPABASE_SERVICE_KEY for congressional data
- .env.local.example updated with new env vars

## [0.5.0] - 2026-04-05
### Added
- Landing page with hero, feature grid, code sample, CongressWatch showcase, and endpoint overview
- Proper metadata in root layout (title + description for SEO)
- Final project polish for v0.5.0 launch

## [0.4.0] - 2026-04-05
### Added
- API documentation page at /docs with full endpoint reference
- Documents all 13 endpoints with method, path, query params, and example responses
- Sections for authentication, rate limits, response format, and pagination
- Dark theme matching signup page

## [0.3.0] - 2026-04-05
### Added
- API key signup page at /signup with dark minimal UI
- POST /api/signup endpoint -- validates email, generates osp_ prefixed key, inserts into api_keys table
- Confirmation email via Resend API with key and usage instructions
- Duplicate email handling -- returns existing key and re-sends email

## [0.2.0] - 2026-04-05
### Fixed
- Upgraded to Next.js 16
- Converted all [bioguide_id] route params to async (Promise<{ bioguide_id: string }>)
- Migrated next.config.js to next.config.ts with ESM export default and NextConfig type
- No middleware.ts existed, none needed to rename

## [0.1.0] - 2026-04-05
### Added
- Initial API scaffold -- 13 routes across /v1/members, /v1/trades, /v1/bills, /v1/stats
- Auth middleware via validateApiKey() checking X-API-Key header against Supabase api_keys table
- Upstash Redis rate limiting -- sliding window, 1000 requests/hour per key
- Supabase dual-client setup -- OSP-API DB for key management, CongressWatch DB for congressional data
- CORS headers on all routes with OPTIONS preflight handling
- Paginated responses with standard JSON envelope
- Public endpoints: /v1/stats, /v1/members list
- Auth-required endpoints: all member sub-routes, /v1/trades, /v1/bills
- .env.local.example with all required environment variables documented
- README.md with setup and local dev instructions
- CLAUDE.md with architecture notes
