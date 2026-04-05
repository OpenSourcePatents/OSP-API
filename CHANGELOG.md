# Changelog

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
