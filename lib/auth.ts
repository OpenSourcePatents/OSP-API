import { eq, sql } from "drizzle-orm";
import { db } from "./db";
import { apiKeys } from "./schema";
import { limitRequest, getTierLimitLabel } from "./redis";

interface AuthResult {
  valid: boolean;
  key_id?: string;
  tier?: string;
  error?: string;
  /** HTTP status to return when invalid. 401 for auth failures, 429 when limited. */
  status?: number;
}

export async function validateApiKey(request: Request): Promise<AuthResult> {
  const key = request.headers.get("X-API-Key");

  if (!key) {
    return { valid: false, error: "Missing X-API-Key header", status: 401 };
  }

  const [row] = await db
    .select({ id: apiKeys.id, tier: apiKeys.tier })
    .from(apiKeys)
    .where(eq(apiKeys.key, key))
    .limit(1);

  if (!row) {
    return { valid: false, error: "Invalid API key", status: 401 };
  }

  const tier = row.tier || "free";

  // Admin tier bypasses rate limiting.
  if (tier !== "admin") {
    const { allowed } = await limitRequest(tier, row.id);
    if (!allowed) {
      // 429, not 401 — the key is valid, the caller just needs to back off.
      return {
        valid: false,
        error: `Rate limit exceeded (${getTierLimitLabel(tier)})`,
        status: 429,
      };
    }
  }

  // Replaces the `increment_requests_today` Supabase RPC. Not awaited: usage
  // accounting must not add a round-trip to every API response, and a lost
  // increment is cheaper than a slower request.
  void db
    .update(apiKeys)
    .set({
      requestsToday: sql`${apiKeys.requestsToday} + 1`,
      lastUsedAt: new Date(),
    })
    .where(eq(apiKeys.id, row.id))
    .catch(() => {});

  return { valid: true, key_id: row.id, tier };
}
