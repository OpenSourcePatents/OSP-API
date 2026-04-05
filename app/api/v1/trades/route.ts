import { NextRequest } from "next/server";
import { queryCongress } from "@/lib/supabase";
import { validateApiKey } from "@/lib/auth";
import { paginated, err, options } from "@/lib/response";

export async function GET(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return err(auth.error!, 401);

  const sp = request.nextUrl.searchParams;
  const ticker = sp.get("ticker");
  const chamber = sp.get("chamber");
  const party = sp.get("party");
  const start_date = sp.get("start_date");
  const end_date = sp.get("end_date");
  const page = Math.max(1, parseInt(sp.get("page") || "1"));
  const per_page = Math.min(100, Math.max(1, parseInt(sp.get("per_page") || "50")));
  const offset = (page - 1) * per_page;

  const eq: Record<string, string> = {};
  if (chamber) eq.chamber = chamber;
  if (party) eq.party = party;

  const { data, count, error: dbError } = await queryCongress("trades", {
    select: "bioguide_id,member_name,chamber,party,state,transaction_date,ticker,asset_description,trade_type,amount_range,owner,source",
    eq,
    ilike: ticker ? { ticker } : undefined,
    gte: start_date ? { transaction_date: start_date } : undefined,
    lte: end_date ? { transaction_date: end_date } : undefined,
    order: "transaction_date",
    ascending: false,
    limit: per_page,
    offset,
    count: true,
  });

  if (dbError) return err("Database error", 500);

  return paginated((data as Record<string, unknown>[]) || [], page, per_page, count || 0);
}

export { options as OPTIONS };
