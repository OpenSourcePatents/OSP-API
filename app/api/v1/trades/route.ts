import { NextRequest } from "next/server";
import { getIndex } from "@/lib/aggregate";
import { paginate, parseDateAny } from "@/lib/congress";
import { validateApiKey } from "@/lib/auth";
import { paginated, err, options } from "@/lib/response";

/** All disclosed trades across every member. */
export async function GET(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return err(auth.error!, auth.status ?? 401);

  const sp = request.nextUrl.searchParams;
  const ticker = sp.get("ticker");
  const type = sp.get("type");
  const chamber = sp.get("chamber");
  const party = sp.get("party");
  const state = sp.get("state");
  const start_date = sp.get("start_date");
  const end_date = sp.get("end_date");
  const page = Math.max(1, parseInt(sp.get("page") || "1"));
  const per_page = Math.min(
    100,
    Math.max(1, parseInt(sp.get("per_page") || "50")),
  );

  let index;
  try {
    index = await getIndex();
  } catch {
    return err("Upstream data unavailable", 502);
  }

  const eq = (a: string | undefined, b: string) =>
    (a ?? "").toLowerCase() === b.toLowerCase();

  let rows = index.trades.filter((t) => {
    if (ticker && !eq(t.ticker, ticker)) return false;
    if (type && !eq(t.type, type)) return false;
    if (chamber && !eq(t.chamber, chamber)) return false;
    if (party && !eq(t.party, party)) return false;
    if (state && !eq(t.state, state)) return false;

    if (start_date || end_date) {
      const d = parseDateAny(t.transaction_date);
      if (!d) return false;
      if (start_date && d < parseDateAny(start_date)) return false;
      if (end_date && d > parseDateAny(end_date)) return false;
    }
    return true;
  });

  rows = [...rows].sort((a, b) =>
    parseDateAny(b.transaction_date).localeCompare(
      parseDateAny(a.transaction_date),
    ),
  );

  const { rows: pageRows, total } = paginate(rows, page, per_page);
  return paginated(pageRows, page, per_page, total);
}

export { options as OPTIONS };
