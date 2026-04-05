import { supabase } from "./supabase";
import { ratelimit } from "./redis";

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

  const { data: keyRow, error: dbError } = await supabase
    .from("api_keys")
    .select("id, tier")
    .eq("key", apiKey)
    .single();

  if (dbError || !keyRow) {
    return { valid: false, error: "Invalid API key" };
  }

  const { success } = await ratelimit.limit(keyRow.id);
  if (!success) {
    return { valid: false, error: "Rate limit exceeded (1000 requests/hour)" };
  }

  await supabase.rpc("increment_requests_today", { key_id: keyRow.id });

  return { valid: true, key_id: keyRow.id, tier: keyRow.tier };
}
