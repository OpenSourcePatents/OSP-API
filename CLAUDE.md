# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OSP-API is a free, open-source REST API aggregating congressional accountability data — campaign finance, stock trades, voting records, travel disclosures, and legislation. Licensed under AGPL-3.0.

## Tech Stack

- **Framework:** Next.js 16 App Router (TypeScript)
- **Data source:** [CongressWatch](https://github.com/OpenSourcePatents/Congresswatch) static JSON over CDN — **no database in the data path**
- **API keys / accounts:** Neon Postgres (Drizzle ORM) + Supabase Auth (identity only)
- **Rate limiting:** Redis via `@upstash/ratelimit` (sliding window, per tier) — **fails open if unavailable**
- **Email:** Resend — currently unused. `POST /api/v1/keys/mine` returns the key in its response; the emailing route was removed with Neon Auth. `RESEND_API_KEY` is still declared but nothing reads it.

> **History (read this before touching the data layer):** this API originally ran on two Supabase projects — one for `api_keys` + GoTrue auth, one holding the congressional data. Both were deleted, and the API was rebuilt on Neon + CongressWatch JSON. Supabase has since returned for **authentication only**: `lib/supabase-auth.ts` verifies Supabase access tokens (`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`) for `POST /api/v1/keys/mine`. Neon Auth (Managed BetterAuth) was the identity provider in between and has been **removed entirely** — do not reintroduce `@neondatabase/auth`, `NEON_AUTH_*`, `/api/auth/*`, or `POST /api/keys`. Neon via Drizzle remains the **sole database** — do not store or query data in Supabase, and do not reintroduce a Supabase data client.

## Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server
npx tsc --noEmit         # Typecheck (use this — `npm run lint` is broken; Next 16 removed `next lint`)
npx drizzle-kit push     # Apply lib/schema.ts to Neon
```

## Architecture

```
CongressWatch pipeline → commits JSON to git → congresswatch.vercel.app/data/*.json (CDN, public, CORS)
                                                          ↓ fetch
                                              OSP-API: auth · tiers · rate limits · score breakdown
```

- `lib/congress.ts` — fetches CongressWatch JSON (`members.json`, `details/{id}.json`, `stats.json`). Types + filter/sort/paginate helpers. **This replaced the Supabase data client.**
- `lib/aggregate.ts` — builds the cross-member trades/bills index for the global endpoints, which upstream only exists inside per-member detail files. Fans out over 536 files, cached 1h.
- `lib/scoring.ts` — TypeScript port of CongressWatch's `compute_score()` (`fetch_finance.py:312`), returning the 6 components. Uses Python's banker's rounding to stay faithful.
- `lib/db.ts` / `lib/schema.ts` — Neon Postgres via Drizzle. Module-scope `pg.Pool` + `attachDatabasePool` (required for Vercel Fluid compute).
- `lib/auth.ts` — `validateApiKey()`: `X-API-Key` → Neon lookup → rate limit → usage increment.
- `lib/redis.ts` — tiered rate limiters. Reads `KV_REST_API_*` or `UPSTASH_REDIS_REST_*`.
- `lib/supabase-auth.ts` / `lib/supabase-client.ts` — Supabase Auth: server-side bearer-token verification for `/api/v1/keys/mine`, and the browser sign-in client used by `/signup` (Google/GitHub OAuth, PKCE).
- `lib/handlers.ts` — `memberCollection()` factory shared by the five member sub-collection routes.
- `lib/response.ts` — `ok()`, `paginated()`, `err()`, `options()` with CORS baked in.

## Key Conventions

- **Response envelope:** `{ data, meta: { page, per_page, total } }` for lists, `{ data }` for singles, `{ error }` for errors
- **Native schema:** field names are CongressWatch's, passed through unchanged. Do not rename them.
- **Pagination:** in-memory slice; `per_page` max 100
- **Auth-required routes:** call `validateApiKey(request)` first; on failure return `err(auth.error!, auth.status ?? 401)` — the status matters, rate-limit rejections are **429**, not 401
- **Public routes:** `/v1/members` (list) and `/v1/stats` only
- **CORS:** all responses include `Access-Control-Allow-Origin: *` via response helpers

## Data gotchas (verified against all 542 detail files)

- Detail files are **flat** — there is no `finance` or `donors` sub-object. `total_raised`, `cash_on_hand`, `top_donors_list` are top-level.
- `cash_on_hand` is a **string** (`"$1,234,567"`), not a number.
- Trade `amount` is a **string** bracket (`"$15,001 - $50,000"`) and is **null on ~231 rows**.
- `district` is a **string**, `""` for senators.
- `total_raised` is **null for 69 of 536** members.
- Coverage is uneven: `trades` in 124/542 files, `travel` in 307, `cash_on_hand` in 401. Always use defaults.
- Dates are mostly ISO but legacy trade/travel rows can be `MM/DD/YYYY` — normalize with `parseDateAny()` before comparing.
- The stored `score` can **lag its own inputs**: CongressWatch recomputes it only in its finance job, while votes/trades/travel refresh on separate crons. `/score` returns `stored`, `total`, and `drift` to expose this.

## Changelog convention

Update `CHANGELOG.md` on every change: semver + date + description.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
