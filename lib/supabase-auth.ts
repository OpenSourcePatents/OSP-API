import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase Auth — verifies the access token a signed-in user presents.
 *
 * This is identity only. Congressional data still comes from CongressWatch JSON
 * and accounts still live in Neon/Drizzle; Supabase is the signup provider,
 * nothing else.
 *
 * Constructed lazily on first use: createClient throws on a missing URL/key,
 * and building it at module top level
 * makes `next build` fail while collecting page data, because the build
 * environment has no runtime secrets. Deferring to the first request keeps the
 * build clean and turns a genuinely missing secret into a request-time error.
 *
 * The anon key is the right credential here — getUser() authenticates as the
 * bearer of the caller's token, so no service-role privilege is needed.
 */
let instance: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!instance) {
    instance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      // No session persistence: this client is per-request and server-side, and
      // must never pick up ambient state from a previous caller.
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return instance;
}

export interface VerifiedUser {
  id: string;
  email: string | null;
}

/**
 * Extracts and verifies the `Authorization: Bearer <token>` access token.
 *
 * Verification is delegated to Supabase (`auth.getUser`), which checks the
 * token's signature and expiry server-side. The JWT is never decoded locally
 * and no identity claim from the request body is consulted — a caller can only
 * ever act as whoever their token actually belongs to.
 *
 * Returns null when the header is absent/malformed or the token does not
 * verify; callers turn that into a 401 without distinguishing the two, since
 * the difference is not useful to a client and only aids probing.
 */
export async function verifyBearerToken(
  request: Request,
): Promise<VerifiedUser | null> {
  const header = request.headers.get("Authorization");
  if (!header) return null;

  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  const token = match?.[1]?.trim();
  if (!token) return null;

  let result;
  try {
    result = await getClient().auth.getUser(token);
  } catch {
    // Network/config failure reaching Supabase. Treated as unverified rather
    // than fail-open: this gate decides who owns an API key.
    return null;
  }

  const user = result.data?.user;
  if (result.error || !user) return null;

  return { id: user.id, email: user.email ?? null };
}
