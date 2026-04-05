import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { paginated, err, options } from "@/lib/response";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const chamber = params.get("chamber");
  const party = params.get("party");
  const state = params.get("state");
  const page = Math.max(1, parseInt(params.get("page") || "1"));
  const per_page = Math.min(100, Math.max(1, parseInt(params.get("per_page") || "50")));
  const offset = (page - 1) * per_page;

  let query = supabase
    .from("members")
    .select(
      "id, bioguide_id, name, party, state, chamber, district, photo_url, start_date",
      { count: "exact" }
    );

  if (chamber) query = query.eq("chamber", chamber);
  if (party) query = query.eq("party", party);
  if (state) query = query.eq("state", state);

  const { data, count, error: dbError } = await query
    .range(offset, offset + per_page - 1);

  if (dbError) return err("Database error", 500);

  return paginated(data || [], page, per_page, count || 0);
}

export { options as OPTIONS };
