"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase Auth client — identity only, no data access.
 *
 * The counterpart of lib/supabase-auth.ts: this signs the user in (Google /
 * GitHub OAuth) and holds their session; the server side verifies the access
 * token it produces. Data still comes from CongressWatch JSON and accounts
 * still live in Neon/Drizzle.
 *
 * Constructed lazily for the same reason lib/neon-auth.ts is: createClient
 * throws when its URL/key are absent, and /signup is statically prerendered,
 * so a module-scope client would run during `next build` — which has no env.
 * The NEXT_PUBLIC_* values are inlined into the client bundle at build time;
 * deferring construction to first use (always in the browser: an event handler
 * or effect) keeps the build clean either way.
 *
 * PKCE flow: the OAuth redirect returns a one-time `?code=` instead of putting
 * tokens in the URL fragment, so no token ever lands in history or referrers.
 * supabase-js exchanges the code automatically on client init
 * (detectSessionInUrl defaults to true) and persists the session in
 * localStorage, which is what lets a returning visitor skip sign-in.
 */
let instance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!instance) {
    instance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { flowType: "pkce" } },
    );
  }
  return instance;
}
