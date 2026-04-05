import { NextRequest } from "next/server";
import { queryCongress } from "@/lib/supabase";
import { validateApiKey } from "@/lib/auth";
import { paginated, err, options } from "@/lib/response";

export async function GET(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return err(auth.error!, 401);

  const sp = request.nextUrl.searchParams;
  const congress = sp.get("congress");
  const alec_min_score = sp.get("alec_min_score");
  const keyword = sp.get("keyword");
  const page = Math.max(1, parseInt(sp.get("page") || "1"));
  const per_page = Math.min(100, Math.max(1, parseInt(sp.get("per_page") || "50")));
  const offset = (page - 1) * per_page;

  const eq: Record<string, string> = {};
  if (congress) eq.congress = congress;

  const { data, count, error: dbError } = await queryCongress("bills", {
    select: "*",
    eq,
    gte: alec_min_score ? { alec_similarity_score: alec_min_score } : undefined,
    textSearch: keyword ? { title: keyword } : undefined,
    limit: per_page,
    offset,
    count: true,
  });

  if (dbError) return err("Database error", 500);

  return paginated((data as Record<string, unknown>[]) || [], page, per_page, count || 0);
}

export { options as OPTIONS };
