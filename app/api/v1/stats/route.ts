import { supabase } from "@/lib/supabase";
import { ok, err, options } from "@/lib/response";

export async function GET() {
  const [members, trades, bills, pipeline] = await Promise.all([
    supabase.from("members").select("*", { count: "exact", head: true }),
    supabase.from("trades").select("*", { count: "exact", head: true }),
    supabase.from("bills").select("*", { count: "exact", head: true }),
    supabase.from("pipeline_health").select("pipeline, last_run").order("last_run", { ascending: false }),
  ]);

  if (members.error || trades.error || bills.error) {
    return err("Database error", 500);
  }

  const last_updated: Record<string, string> = {};
  if (pipeline.data) {
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
