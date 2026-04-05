import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
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

  let query = supabase
    .from("bills")
    .select("*", { count: "exact" });

  if (congress) query = query.eq("congress", congress);
  if (alec_min_score) query = query.gte("alec_similarity_score", parseFloat(alec_min_score));
  if (keyword) query = query.textSearch("title", keyword);

  const { data, count, error: dbError } = await query
    .range(offset, offset + per_page - 1);

  if (dbError) return err("Database error", 500);

  return paginated(data || [], page, per_page, count || 0);
}

export { options as OPTIONS };
