import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
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

  let query = supabase
    .from("trades")
    .select(
      "bioguide_id, member_name, chamber, party, state, transaction_date, ticker, asset_description, trade_type, amount_range, owner, source",
      { count: "exact" }
    );

  if (ticker) query = query.ilike("ticker", ticker);
  if (chamber) query = query.eq("chamber", chamber);
  if (party) query = query.eq("party", party);
  if (start_date) query = query.gte("transaction_date", start_date);
  if (end_date) query = query.lte("transaction_date", end_date);

  const { data, count, error: dbError } = await query
    .order("transaction_date", { ascending: false })
    .range(offset, offset + per_page - 1);

  if (dbError) return err("Database error", 500);

  return paginated(data || [], page, per_page, count || 0);
}

export { options as OPTIONS };
