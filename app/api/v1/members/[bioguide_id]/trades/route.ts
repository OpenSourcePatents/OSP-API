import { NextRequest } from "next/server";
import { getMemberDetail, paginate, parseDateAny } from "@/lib/congress";
import { validateApiKey } from "@/lib/auth";
import { paginated, err, options } from "@/lib/response";

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ bioguide_id: string }> },
) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return err(auth.error!, auth.status ?? 401);

  const { bioguide_id } = await ctx.params;
  const sp = request.nextUrl.searchParams;
  const ticker = sp.get("ticker");
  // Native field is `type` ("Purchase" / "Sale"), not the old `trade_type`.
  const type = sp.get("type");
  const page = Math.max(1, parseInt(sp.get("page") || "1"));
  const per_page = Math.min(
    100,
    Math.max(1, parseInt(sp.get("per_page") || "50")),
  );

  let detail;
  try {
    detail = await getMemberDetail(bioguide_id);
  } catch {
    return err("Upstream data unavailable", 502);
  }
  if (!detail) return err("Member not found", 404);

  let trades = detail.trades ?? [];

  if (ticker) {
    const t = ticker.toLowerCase();
    trades = trades.filter((x) => x.ticker?.toLowerCase() === t);
  }
  if (type) {
    const t = type.toLowerCase();
    trades = trades.filter((x) => x.type?.toLowerCase() === t);
  }

  // Newest first. Dates are normalized because legacy rows use MM/DD/YYYY.
  trades = [...trades].sort((a, b) =>
    parseDateAny(b.transaction_date).localeCompare(
      parseDateAny(a.transaction_date),
    ),
  );

  const { rows, total } = paginate(trades, page, per_page);
  return paginated(rows, page, per_page, total);
}

export { options as OPTIONS };
