import { queryOSPDB, rpcOSPDB } from "./supabase";
import { rateLimiters, getTierLimitLabel } from "./redis";

interface AuthResult {
  valid: boolean;
  key_id?: string;
  tier?: string;
  error?: string;
}

export async function validateApiKey(request: Request): Promise<AuthResult> {
  const apiKey = request.headers.get("X-API-Key");

  if (!apiKey) {
    return { valid: false, error: "Missing X-API-Key header" };
  }

  const { data: keyRow, error: dbError } = await queryOSPDB<{ id: string; tier: string }>(
    "api_keys",
    {
      select: "id,tier",
      eq: { key: apiKey },
      single: true,
    }
  );

  if (dbError || !keyRow) {
    return { valid: false, error: "Invalid API key" };
  }

  const row = keyRow as { id: string; tier: string };
  const tier = row.tier || "free";

  // Admin tier bypasses rate limiting
  if (tier !== "admin") {
    const limiter = rateLimiters[tier as keyof typeof rateLimiters] || rateLimiters.free;
    const { success } = await limiter.limit(row.id);
    if (!success) {
      return { valid: false, error: `Rate limit exceeded (${getTierLimitLabel(tier)})` };
    }
  }

  await rpcOSPDB("increment_requests_today", { key_id: row.id });

  return { valid: true, key_id: row.id, tier };
}
