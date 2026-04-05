import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
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
  const offset = (page - 1) * per_page;

  const { data, count, error: dbError } = await supabase
    .from("travel")
    .select(
      "destination_country, departure_date, return_date, sponsor, total_cost, funding_source",
      { count: "exact" }
    )
    .eq("bioguide_id", bioguide_id)
    .range(offset, offset + per_page - 1);

  if (dbError) return err("Database error", 500);

  return paginated(data || [], page, per_page, count || 0);
}

export { options as OPTIONS };
