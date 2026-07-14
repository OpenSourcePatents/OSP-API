import { createNeonAuth } from "@neondatabase/auth/next/server";

/**
 * Neon Auth (Managed BetterAuth) — replaces Supabase GoTrue.
 *
 * Handles user accounts, email verification, and Google/GitHub OAuth. It is
 * separate from lib/auth.ts, which validates the `X-API-Key` header on data
 * routes. The two meet in one place: once Neon Auth confirms a user owns a
 * verified email, /api/keys mints them an API key.
 */
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
});
