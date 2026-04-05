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
    .from("scores")
    .select(
      "overall_score, voting_anomaly_score, financial_anomaly_score, trade_timing_score, donor_concentration_score, bill_similarity_score, travel_pattern_score"
    )
    .eq("bioguide_id", bioguide_id)
    .single();

  if (dbError || !data) return err("Score data not found", 404);

  return ok(data);
}

export { options as OPTIONS };
