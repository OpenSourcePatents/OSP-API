# OSP-API

Free, open-source REST API aggregating congressional accountability data — campaign finance, stock trades, voting records, travel disclosures, and legislation.

## Architecture

There is **no database in the data path**. The API is a thin, authenticated, rate-limited layer over [CongressWatch](https://github.com/OpenSourcePatents/Congresswatch), which rebuilds this data daily from public government records and publishes it as static JSON.

```
CongressWatch pipeline (8 daily cron jobs)
        ↓ commits JSON to git
congresswatch.vercel.app/data/*.json   ← CDN, public, CORS, 1h s-maxage
        ↓ fetch
OSP-API (this repo)                    ← auth, tiers, rate limits, score breakdown
        ↓
consumers
```

Two upstream services back it:

| Concern | Service | Why |
|---|---|---|
| Congressional data | CongressWatch static JSON | Already public, CDN-cached, refreshed daily. Nothing to host. |
| API keys + accounts | **Neon Postgres** + Neon Auth | Durable store for `api_keys`; Managed BetterAuth handles email verification and OAuth. |
| Rate limiting | Upstash Redis | Sliding window, per key, per tier. |
| Email | Resend | Delivers the API key on issuance. |

> **History:** both halves previously ran on Supabase — one project for `api_keys` + GoTrue, another holding the congressional data. That project is gone. The data half was replaced by reading CongressWatch's JSON directly; the accounts half moved to Neon.

## Setup

```bash
npm install
cp .env.local.example .env.local   # fill in the values below
npx drizzle-kit push               # create the api_keys table on Neon
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string. **Use the pooled (`-pooler`) host.** |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL — authentication only, no data lives there |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key; the server uses it to verify the caller's own access token |
| `CONGRESS_DATA_URL` | CongressWatch JSON base URL. Defaults to `https://congresswatch.vercel.app/data` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `RESEND_API_KEY` | Resend API key for the key-delivery email |
| `API_BASE_URL` | Public base URL for the API |

## API Overview

All endpoints live under `/api/v1/` and return a standard JSON envelope. Field names are CongressWatch's native ones, passed through unchanged. Full reference at `/docs`.

**Public** (no key required):
- `GET /api/v1/members` — leaderboard; `chamber`, `party`, `state`, `min_score`, `search`, `sort`, `page`, `per_page`
- `GET /api/v1/stats` — corpus totals

**Authenticated** (`X-API-Key` header):
- `GET /api/v1/members/:bioguide_id` — full vault
- `GET /api/v1/members/:bioguide_id/score` — anomaly score + 6-component breakdown
- `GET /api/v1/members/:bioguide_id/{votes,bills,trades,travel,donors,finances}`
- `GET /api/v1/trades` — every trade, cross-member
- `GET /api/v1/bills` — every bill, cross-member

Rate limits: free 1,000/hr · discounted 10,000/hr · paid 10,000/hr · admin unlimited.

## Notable implementation details

**The score breakdown is recomputed locally.** The API does not fetch or execute `fetch_finance.py`. That file's `compute_score_components()` is the upstream reference for the TypeScript implementation in `lib/scoring.ts`; references to it are documentation, not runtime imports. The `/api/v1/members/:bioguide_id/score` route fetches `members.json` and `details/:bioguide_id.json` through `lib/congress.ts`, then calls the local `computeScore()` function. The JSON base URL remains `CONGRESS_DATA_URL` (default `https://congresswatch.vercel.app/data`). Existing response keys and component maxima are preserved for compatibility. `wealth_gap` now always scores zero: campaign receipts are not personal wealth. Trade activity and sponsored travel exclude future dates. Attendance requires at least 20 recorded votes, exempts non-voting House delegates and the Resident Commissioner, and reaches its five-point maximum at 25% missed votes.

SEC signals contribute only when upstream supplies explicit verified identity, an exact matching nonempty CIK, a nonempty HTTPS evidence URL list, available retrieval status, and a finite nonnegative count. Legacy automatic/name-only matches and failed retrievals contribute zero and cannot retain the SEC-derived `trade` flag in `/score`. Raw upstream CIK/count/provenance remain available unchanged through the source-data endpoints. These endpoints still expose upstream stored scores/flags, so deploy the coordinated CongressWatch correction first; `/score.stored` and `drift` deliberately retain that audit trail.

Bill-derived scoring follows the `activity-v5-official-prose` contract. A bill must have `analysis_version=official-prose-overlap-v2`, `analysis_status=analyzed`, official GovInfo XML source metadata, the `govinfo-legislative-body-v2` extraction version, and source/text SHA-256 hashes. Model similarity additionally requires analyzed primary-model evidence tied to that target text, matched-source/text hashes, a finite passage length of at least 32 words, and at least 20% directional shingle coverage. Raw legacy `alec_best_similarity` cannot contribute by itself. The optional 0–1 `min_alec_similarity` filter on `/bills` likewise includes only bills with validated matching evidence. Unavailable primary-model corpora contribute zero, not a verified finding of no overlap. Donor alignment requires matching current bill/donor analysis versions and available status; otherwise it contributes zero. Historical values and provenance remain in the raw source records.

The legacy keys `trade_timing`, `donor_alignment`, and `foreign_travel` describe activity, donor-industry keyword overlap, and disclosed sponsored travel, not established misconduct or foreign-only travel. Bill similarity does not establish authorship. The suspended wealth component is not redistributed, so the currently attainable maximum is 75, while the response retains the historical 100-point scale.

The `/score` response returns `stored` (what CongressWatch saved), `total` (recomputed now), and `drift`. Drift can reflect data refresh lag, changed methodology, or sliding date windows. Deploy the corresponding CongressWatch update alongside this API change to minimize methodology drift.

**`/v1/trades` and `/v1/bills` build an index at runtime.** CongressWatch publishes trades and bills only *inside* per-member detail files, so there is no single document to page over. `lib/aggregate.ts` fans out across all 536 detail files (~15 MB, ~1–3 s cold, ~240 ms warm) and caches the flattened result for an hour. If CongressWatch ever emits `data/trades.json` and `data/bills.json`, delete that module and read them directly.

## License

AGPL-3.0
