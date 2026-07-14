import { NextRequest } from "next/server";
import {
  getMembers,
  filterMembers,
  sortMembers,
  paginate,
} from "@/lib/congress";
import { paginated, err, options } from "@/lib/response";

/** Public — the leaderboard. No API key required. */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1"));
  const per_page = Math.min(
    100,
    Math.max(1, parseInt(sp.get("per_page") || "50")),
  );

  const minScoreRaw = sp.get("min_score");
  const minScore = minScoreRaw != null ? parseInt(minScoreRaw) : null;

  try {
    const all = await getMembers();

    const matched = filterMembers(all, {
      chamber: sp.get("chamber"),
      party: sp.get("party"),
      state: sp.get("state"),
      minScore: Number.isNaN(minScore) ? null : minScore,
      search: sp.get("search"),
    });

    const sorted = sortMembers(matched, sp.get("sort"));
    const { rows, total } = paginate(sorted, page, per_page);

    return paginated(rows, page, per_page, total);
  } catch {
    return err("Upstream data unavailable", 502);
  }
}

export { options as OPTIONS };
