import { createNeonAuth } from "@neondatabase/auth/next/server";

/**
 * Neon Auth (Managed BetterAuth) — replaces Supabase GoTrue.
 *
 * Handles user accounts, email verification, and Google/GitHub OAuth. Separate
 * from lib/auth.ts, which validates the `X-API-Key` header on data routes. The
 * two meet in one place: once Neon Auth confirms a user owns a verified email,
 * /api/keys mints them an API key.
 *
 * Constructed lazily on first use. createNeonAuth throws when
 * NEON_AUTH_COOKIE_SECRET / NEON_AUTH_BASE_URL are absent, and building it at
 * module top level made `next build` fail while collecting page data for the
 * auth routes — the build environment has no runtime secrets. Deferring
 * construction to the first request keeps the build clean; a genuinely missing
 * secret now surfaces as a request-time error, not a build failure.
 */
type NeonAuth = ReturnType<typeof createNeonAuth>;

let instance: NeonAuth | null = null;

export function getAuth(): NeonAuth {
  if (!instance) {
    instance = createNeonAuth({
      baseUrl: process.env.NEON_AUTH_BASE_URL!,
      cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
    });
  }
  return instance;
}
