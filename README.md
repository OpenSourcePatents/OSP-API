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

**The score breakdown is recomputed, not read.** CongressWatch persists only the final integer `score`; the six weighted components are discarded. Every *input* survives in the JSON, so `lib/scoring.ts` is a port of its `compute_score()` (`fetch_finance.py:312`) that returns the components. Verified: running CongressWatch's own Python function against the same live JSON produces identical totals.

The `/score` response therefore returns `stored` (what CongressWatch saved), `total` (recomputed now), and `drift` between them. Drift is usually 0 but is legitimately non-zero — the score is only recomputed by CongressWatch's finance job, while votes/trades/travel refresh on their own schedules, so a stored score can lag its own inputs.

**`/v1/trades` and `/v1/bills` build an index at runtime.** CongressWatch publishes trades and bills only *inside* per-member detail files, so there is no single document to page over. `lib/aggregate.ts` fans out across all 536 detail files (~15 MB, ~1–3 s cold, ~240 ms warm) and caches the flattened result for an hour. If CongressWatch ever emits `data/trades.json` and `data/bills.json`, delete that module and read them directly.

## License

AGPL-3.0
