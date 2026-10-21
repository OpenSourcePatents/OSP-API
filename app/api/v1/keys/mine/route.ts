import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { apiKeys } from "@/lib/schema";
import { verifyBearerToken } from "@/lib/supabase-auth";

export const dynamic = "force-dynamic";

/**
 * CORS is declared here rather than reused from lib/response.ts because this
 * route's surface differs from the read-only v1 collections: it is POST, and it
 * authenticates with `Authorization` instead of `X-API-Key`. Every response
 * below carries these same headers so the preflight and the real request agree.
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

function json(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: corsHeaders });
}

/** `osp_` + 32 hex chars (16 random bytes). */
function generateApiKey(): string {
  return `osp_${randomBytes(16).toString("hex")}`;
}

/**
 * The columns a caller gets back, wrapped as `{ data: ... }` per the repo's
 * single-object envelope. Never exposes id, email, or user_id.
 */
const returned = {
  key: apiKeys.key,
  tier: apiKeys.tier,
  created_at: apiKeys.createdAt,
};

/**
 * Returns the signed-in user's API key, minting one if they have none.
 *
 * Identity comes exclusively from the verified Supabase access token. The
 * request body is never read: accepting an email or user_id from the caller
 * would let anyone claim anyone else's key.
 *
 * Idempotent — a user who already has a live key gets that same key back rather
 * than a second one.
 */
export async function POST(request: Request) {
  const user = await verifyBearerToken(request);
  if (!user) {
    return json({ error: "Missing or invalid access token" }, 401);
  }

  // 1. Already claimed by this Supabase user.
  const [owned] = await db
    .select(returned)
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, user.id), eq(apiKeys.revoked, false)))
    .limit(1);

  if (owned) return json({ data: owned }, 200);

  // 2. Adopt a pre-Supabase key: same email, never claimed. Matching on email
  //    is safe because Supabase only issues sessions for addresses it has
  //    verified — an OAuth login whose provider reports the email unverified
  //    gets a confirmation email instead of a session.
  if (user.email) {
    const [adopted] = await db
      .update(apiKeys)
      .set({ userId: user.id })
      .where(
        and(
          eq(apiKeys.email, user.email),
          isNull(apiKeys.userId),
          eq(apiKeys.revoked, false),
        ),
      )
      .returning(returned);

    if (adopted) return json({ data: adopted }, 200);
  }

  // 3. Nothing to return — mint a new key. An email is required from here on,
  //    since api_keys.email is NOT NULL.
  if (!user.email) {
    return json(
      { error: "This account has no email address; cannot issue an API key." },
      400,
    );
  }

  try {
    const [created] = await db
      .insert(apiKeys)
      .values({
        key: generateApiKey(),
        email: user.email,
        userId: user.id,
        // Hardcoded, never read from the request — tier is a privilege level.
        tier: "free",
        requestsToday: 0,
      })
      .returning(returned);

    return json({ data: created }, 201);
  } catch {
    // api_keys.email is UNIQUE. Two ways to land here:
    //  - a concurrent request for the same user won the race, or
    //  - a revoked row already holds this email.
    // Re-read to tell them apart: a live row means the race, so return it.
    const [row] = await db
      .select(returned)
      .from(apiKeys)
      .where(and(eq(apiKeys.userId, user.id), eq(apiKeys.revoked, false)))
      .limit(1);

    if (row) return json({ data: row }, 200);

    return json({ error: "Could not create API key" }, 500);
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
