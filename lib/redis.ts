import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

/**
 * Rate limiting, backed by a Redis provisioned through the Vercel marketplace.
 *
 * Env vars are read from either naming convention, because the marketplace
 * integrations differ: Vercel KV injects KV_REST_API_URL / KV_REST_API_TOKEN,
 * while a direct Upstash integration injects UPSTASH_REDIS_REST_*. Both speak the
 * same REST protocol, so either works.
 *
 * If neither pair is set, or Redis is unreachable, requests are allowed through
 * (see limitRequest). The previous Redis instance was deleted out from under this
 * API and every authenticated request began returning 500 — a rate limiter must
 * never be a single point of failure for the whole service.
 */
const url =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "";
const token =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

export const isRedisConfigured = Boolean(url && token);

const redis = isRedisConfigured ? new Redis({ url, token }) : null;

function makeLimiter(tokens: number, prefix: string) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, "1 h"),
    prefix,
  });
}

export const rateLimiters = {
  free: makeLimiter(1000, "osp-free"),
  discounted: makeLimiter(10000, "osp-disc"),
  paid: makeLimiter(10000, "osp-paid"),
};

export type Tier = keyof typeof rateLimiters | "admin";

const TIER_LABELS: Record<string, string> = {
  free: "1,000 requests/hour",
  discounted: "10,000 requests/hour",
  paid: "10,000 requests/hour",
};

export function getTierLimitLabel(tier: string): string {
  return TIER_LABELS[tier] ?? TIER_LABELS.free;
}

/** Don't let a hung Redis hold every API request open. */
const TIMEOUT_MS = 2000;

export interface LimitResult {
  /** False only when Redis answered and said the caller is over their limit. */
  allowed: boolean;
  /** True when the limit could not be evaluated (unconfigured/unreachable). */
  degraded: boolean;
}

/**
 * Checks the caller against their tier's limit.
 *
 * Fails OPEN: if Redis is missing, erroring, or slow, the request is allowed and
 * `degraded` is set. Availability of a free public API matters more than exact
 * enforcement, and usage is still recorded in Postgres either way. The only way
 * to get `allowed: false` is for Redis to affirmatively report the limit exceeded.
 */
export async function limitRequest(
  tier: string,
  keyId: string,
): Promise<LimitResult> {
  const limiter =
    rateLimiters[tier as keyof typeof rateLimiters] ?? rateLimiters.free;

  if (!limiter) return { allowed: true, degraded: true };

  try {
    const result = await Promise.race([
      limiter.limit(keyId),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("ratelimit timeout")), TIMEOUT_MS),
      ),
    ]);
    return { allowed: result.success, degraded: false };
  } catch (e) {
    console.warn(
      `[ratelimit] degraded, allowing request: ${(e as Error).message}`,
    );
    return { allowed: true, degraded: true };
  }
}
