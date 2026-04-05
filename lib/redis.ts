import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const rateLimiters = {
  free: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, "1 h"),
    prefix: "osp-free",
  }),
  discounted: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10000, "1 h"),
    prefix: "osp-disc",
  }),
  paid: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10000, "1 h"),
    prefix: "osp-paid",
  }),
};

export type Tier = keyof typeof rateLimiters | "admin";

const TIER_LABELS: Record<string, string> = {
  free: "1,000 requests/hour",
  discounted: "10,000 requests/hour",
  paid: "10,000 requests/hour",
};

export function getTierLimitLabel(tier: string): string {
  return TIER_LABELS[tier] || TIER_LABELS.free;
}
