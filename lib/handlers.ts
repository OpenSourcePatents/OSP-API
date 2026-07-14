import { NextRequest } from "next/server";
import { getMemberDetail, paginate, type MemberDetail } from "./congress";
import { validateApiKey } from "./auth";
import { paginated, err } from "./response";

type RouteContext = { params: Promise<{ bioguide_id: string }> };

/**
 * Builds a GET handler for `/v1/members/{id}/<collection>`.
 *
 * All five collection routes (votes, bills, trades, travel, donors) do the same
 * thing: authenticate, load the member's detail file, page over one array in it.
 * `pick` is the only thing that differs.
 *
 * Note the missing-vs-empty distinction: a member with no detail file is a 404,
 * but a member whose file simply lacks the key is an empty page — trades exist in
 * only 124 of 542 files, and "this member made no trades" is a legitimate answer,
 * not an error.
 */
export function memberCollection<T>(
  pick: (detail: MemberDetail) => T[] | undefined,
) {
  return async function GET(request: NextRequest, ctx: RouteContext) {
    const auth = await validateApiKey(request);
    if (!auth.valid) return err(auth.error!, auth.status ?? 401);

    const { bioguide_id } = await ctx.params;
    const sp = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(sp.get("page") || "1"));
    const per_page = Math.min(
      100,
      Math.max(1, parseInt(sp.get("per_page") || "50")),
    );

    let detail: MemberDetail | null;
    try {
      detail = await getMemberDetail(bioguide_id);
    } catch {
      return err("Upstream data unavailable", 502);
    }

    if (!detail) return err("Member not found", 404);

    const { rows, total } = paginate(pick(detail) ?? [], page, per_page);
    return paginated(rows, page, per_page, total);
  };
}
