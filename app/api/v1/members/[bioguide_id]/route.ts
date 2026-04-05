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

  const { data: member, error: dbError } = await supabase
    .from("members")
    .select("*, trade_count, travel_count, donor_count, vote_count")
    .eq("bioguide_id", bioguide_id)
    .single();

  if (dbError || !member) return err("Member not found", 404);

  return ok(member);
}

export { options as OPTIONS };
