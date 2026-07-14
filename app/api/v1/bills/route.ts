import { NextRequest } from "next/server";
import { getIndex } from "@/lib/aggregate";
import { paginate } from "@/lib/congress";
import { validateApiKey } from "@/lib/auth";
import { paginated, err, options } from "@/lib/response";

/** All tracked bills across every member. */
export async function GET(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return err(auth.error!, auth.status ?? 401);

  const sp = request.nextUrl.searchParams;
  const congress = sp.get("congress");
  const keyword = sp.get("keyword");
  const chamber = sp.get("chamber");
  const party = sp.get("party");
  // Peak ALEC model-bill similarity, 0-1. The old param took the same name but a
  // 0-100 scale; the native field is a fraction, so this one does too.
  const minAlec = sp.get("min_alec_similarity");

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

  const minAlecNum = minAlec != null ? parseFloat(minAlec) : null;
  const congressNum = congress != null ? parseInt(congress) : null;

  let rows = index.bills.filter((b) => {
    if (congressNum != null && !Number.isNaN(congressNum)) {
      if (b.congress !== congressNum) return false;
    }
    if (chamber && !eq(b.chamber, chamber)) return false;
    if (party && !eq(b.party, party)) return false;

    if (keyword) {
      const k = keyword.toLowerCase();
      const inTitle = b.title?.toLowerCase().includes(k);
      const inKeywords = (b.keywords ?? []).some((w) =>
        w.toLowerCase().includes(k),
      );
      if (!inTitle && !inKeywords) return false;
    }

    if (minAlecNum != null && !Number.isNaN(minAlecNum)) {
      const best = Math.max(
        b.alec_best_similarity ?? 0,
        b.alec_match?.similarity_score ?? 0,
      );
      if (best < minAlecNum) return false;
    }
    return true;
  });

  rows = [...rows].sort((a, b) =>
    (b.introduced_date ?? "").localeCompare(a.introduced_date ?? ""),
  );

  const { rows: pageRows, total } = paginate(rows, page, per_page);
  return paginated(pageRows, page, per_page, total);
}

export { options as OPTIONS };
