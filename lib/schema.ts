import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

/**
 * API keys issued to verified users.
 *
 * Replaces the `api_keys` table from the retired Supabase project. `tier`
 * selects the rate limiter in lib/redis.ts; "admin" bypasses limiting.
 */
export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull().unique(),
    email: text("email").notNull().unique(),
    tier: text("tier").notNull().default("free"),
    requestsToday: integer("requests_today").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  },
  (t) => [index("api_keys_key_idx").on(t.key)],
);

export type ApiKey = typeof apiKeys.$inferSelect;
