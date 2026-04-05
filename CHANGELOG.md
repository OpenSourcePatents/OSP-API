# Changelog

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
