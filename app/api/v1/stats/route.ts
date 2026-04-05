import { queryCongress } from "@/lib/supabase";
import { ok, err, options } from "@/lib/response";

export async function GET() {
  const [members, trades, bills, pipeline] = await Promise.all([
    queryCongress("members", { select: "id", count: true, head: true }),
    queryCongress("trades", { select: "id", count: true, head: true }),
    queryCongress("bills", { select: "id", count: true, head: true }),
    queryCongress<{ pipeline: string; last_run: string }[]>("pipeline_health", {
      select: "pipeline,last_run",
      order: "last_run",
      ascending: false,
    }),
  ]);

  if (members.error || trades.error || bills.error) {
    return err("Database error", 500);
  }

  const last_updated: Record<string, string> = {};
  if (Array.isArray(pipeline.data)) {
    for (const row of pipeline.data) {
      last_updated[row.pipeline] = row.last_run;
    }
  }

  return ok({
    member_count: members.count || 0,
    trade_count: trades.count || 0,
    bill_count: bills.count || 0,
    last_updated,
  });
}

export { options as OPTIONS };
