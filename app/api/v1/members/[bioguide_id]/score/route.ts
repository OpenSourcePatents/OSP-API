import { NextRequest } from "next/server";
import { getMembers, getMemberDetail } from "@/lib/congress";
import { computeScore } from "@/lib/scoring";
import { validateApiKey } from "@/lib/auth";
import { ok, err, options } from "@/lib/response";

/**
 * Anomaly score with its six-component breakdown.
 *
 * CongressWatch stores only the final integer, so the components are recomputed
 * here from the same inputs its pipeline used. See lib/scoring.ts.
 */
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ bioguide_id: string }> },
) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return err(auth.error!, auth.status ?? 401);

  const { bioguide_id } = await ctx.params;

  let members, detail;
  try {
    [members, detail] = await Promise.all([
      getMembers(),
      getMemberDetail(bioguide_id),
    ]);
  } catch {
    return err("Upstream data unavailable", 502);
  }

  const member = members.find((m) => m.id === bioguide_id);
  if (!member) return err("Member not found", 404);

  return ok({ bioguide_id, name: member.name, ...computeScore(member, detail) });
}

export { options as OPTIONS };
