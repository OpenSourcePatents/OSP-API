# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OSP-API is a free, open-source REST API aggregating congressional accountability data — campaign finance, stock trades, voting records, travel disclosures, and legislation. Licensed under AGPL-3.0.

## Tech Stack

- **Framework:** Next.js 14 App Router (TypeScript)
- **Database:** Supabase (server-only, service role key — never anon key)
- **Rate Limiting:** Upstash Redis via `@upstash/ratelimit` (sliding window, 1000 req/hr per key)
- **Auth:** API key validation via `X-API-Key` header against `api_keys` table

## Commands

```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run start  # Start production server
npm run lint   # Run linter
```

## Architecture

- `lib/supabase.ts` — singleton Supabase client (service role)
- `lib/redis.ts` — Upstash Redis client + Ratelimit instance
- `lib/auth.ts` — `validateApiKey()` checks header, DB lookup, rate limit, increments counter
- `lib/response.ts` — `ok()`, `paginated()`, `err()`, `options()` helpers with CORS headers baked in
- All API routes under `app/api/v1/` — each exports `GET` and re-exports `OPTIONS` from response helpers

## Key Conventions

- **Response envelope:** `{ data, meta: { page, per_page, total } }` for lists, `{ data }` for singles, `{ error }` for errors
- **Pagination:** Supabase `.range()` with offset = `(page - 1) * per_page`, max 100 per page
- **Auth-required routes:** call `validateApiKey(request)` first; return `err(message, 401)` if invalid
- **Public routes:** `/v1/members` (list) and `/v1/stats` only
- **CORS:** all responses include `Access-Control-Allow-Origin: *` via response helpers
- **Supabase RPC:** `increment_requests_today` function must exist in Supabase for auth counter
