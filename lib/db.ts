import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";
import * as schema from "./schema";

// Vercel's Fluid compute keeps the module alive across requests, so the pool is
// created once here and reused. attachDatabasePool lets the runtime drain idle
// connections before an instance suspends.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
attachDatabasePool(pool);

export const db = drizzle({ client: pool, schema });
export { schema };
