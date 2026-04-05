# OSP-API

Free, open-source REST API aggregating congressional accountability data — campaign finance, stock trades, voting records, travel disclosures, and legislation. The civic data layer that replaced ProPublica, OpenSecrets, and GovTrack.

## Setup

```bash
npm install
cp .env.local.example .env.local
# Fill in your Supabase, Upstash, and Resend credentials in .env.local
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `API_BASE_URL` | Public base URL for the API |

## API Overview

All endpoints live under `/api/v1/`. Responses use a standard JSON envelope.

**Public endpoints** (no auth required):
- `GET /api/v1/members` — list members with filters
- `GET /api/v1/stats` — aggregate counts and pipeline health

**Authenticated endpoints** (require `X-API-Key` header):
- `GET /api/v1/members/:bioguide_id` — full member profile
- `GET /api/v1/members/:bioguide_id/votes`
- `GET /api/v1/members/:bioguide_id/bills`
- `GET /api/v1/members/:bioguide_id/trades`
- `GET /api/v1/members/:bioguide_id/travel`
- `GET /api/v1/members/:bioguide_id/donors`
- `GET /api/v1/members/:bioguide_id/finances`
- `GET /api/v1/members/:bioguide_id/score`
- `GET /api/v1/trades` — all trades with filters
- `GET /api/v1/bills` — all bills with filters

Rate limit: 1,000 requests/hour per API key (free tier).

## License

AGPL-3.0
