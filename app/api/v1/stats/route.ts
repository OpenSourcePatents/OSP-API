import { getStats } from "@/lib/congress";
import { ok, err, options } from "@/lib/response";

/** Public — dashboard totals. No API key required. */
export async function GET() {
  try {
    return ok(await getStats());
  } catch {
    return err("Upstream data unavailable", 502);
  }
}

export { options as OPTIONS };
