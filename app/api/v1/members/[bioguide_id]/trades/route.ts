import { NextRequest } from "next/server";
import { queryCongress } from "@/lib/supabase";
import { validateApiKey } from "@/lib/auth";
import { paginated, err, options } from "@/lib/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bioguide_id: string }> }
) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return err(auth.error!, 401);

  const { bioguide_id } = await params;
  const sp = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1"));
  const per_page = Math.min(100, Math.max(1, parseInt(sp.get("per_page") || "50")));
  const ticker = sp.get("ticker");
  const trade_type = sp.get("trade_type");
  const offset = (page - 1) * per_page;

  const eq: Record<string, string> = { bioguide_id };
  if (trade_type) eq.trade_type = trade_type;

  const { data, count, error: dbError } = await queryCongress("trades", {
    select: "transaction_date,ticker,asset_description,trade_type,amount_range,owner,source",
    eq,
    ilike: ticker ? { ticker } : undefined,
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
