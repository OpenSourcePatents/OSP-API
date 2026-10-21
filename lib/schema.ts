import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
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
    /**
     * Supabase Auth user id (`auth.users.id`), as a string rather than a real FK
     * — Supabase Auth lives in a different database, so Postgres cannot enforce
     * the reference. Nullable because keys issued before Supabase Auth predate
     * any user id; POST /api/v1/keys/mine backfills those on first sign-in.
     */
    userId: text("user_id"),
    tier: text("tier").notNull().default("free"),
    requestsToday: integer("requests_today").notNull().default(0),
    /** Revoked keys are treated as absent — never returned, never adopted. */
    revoked: boolean("revoked").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  },
  (t) => [
    index("api_keys_key_idx").on(t.key),
    index("api_keys_user_id_idx").on(t.userId),
  ],
);

export type ApiKey = typeof apiKeys.$inferSelect;
