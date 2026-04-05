import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { validateApiKey } from "@/lib/auth";
import { ok, err, options } from "@/lib/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bioguide_id: string }> }
) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return err(auth.error!, 401);

  const { bioguide_id } = await params;

  const { data, error: dbError } = await supabase
    .from("finances")
    .select(
      "total_raised, total_spent, cash_on_hand, fec_candidate_id, cycle, top_industries"
    )
    .eq("bioguide_id", bioguide_id)
    .single();

  if (dbError || !data) return err("Financial data not found", 404);

  return ok(data);
}

export { options as OPTIONS };
