import { NextRequest } from "next/server";
import { getMemberDetail } from "@/lib/congress";
import { validateApiKey } from "@/lib/auth";
import { ok, err, options } from "@/lib/response";

/**
 * Campaign finance for one member.
 *
 * CongressWatch's detail files are flat — there is no `finance` object to read —
 * so this projects the finance-related fields into one. `cash_on_hand` is a
 * preformatted STRING (e.g. "$1,234,567"), not a number; it is passed through
 * as-is rather than silently coerced.
 */
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ bioguide_id: string }> },
) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return err(auth.error!, auth.status ?? 401);

  const { bioguide_id } = await ctx.params;

  let d;
  try {
    d = await getMemberDetail(bioguide_id);
  } catch {
    return err("Upstream data unavailable", 502);
  }
  if (!d) return err("Member not found", 404);

  return ok({
    bioguide_id,
    fec_candidate_id: d.fec_candidate_id ?? null,
    fec_committee_ids: d.fec_committee_ids ?? [],
    fec_cycle: d.fec_cycle ?? null,
    total_raised: d.total_raised ?? null,
    total_raised_display: d.total_raised_display ?? null,
    total_spent: d.total_spent ?? null,
    cash_on_hand: d.cash_on_hand ?? null,
    pac_contributions: d.pac_contributions ?? null,
    individual_contributions: d.individual_contributions ?? null,
    top_donor_industries: d.top_donor_industries ?? [],
    corporate_insider_signals: d.corporate_insider_signals ?? 0,
    edgar_status: d.edgar_status ?? null,
    edgar_signal_type: d.edgar_signal_type ?? null,
    edgar_cik: d.edgar_cik ?? null,
  });
}

export { options as OPTIONS };
