import { NextRequest } from "next/server";
import { getMemberDetail } from "@/lib/congress";
import { validateApiKey } from "@/lib/auth";
import { ok, err, options } from "@/lib/response";

/** The full member vault, served as CongressWatch stores it. */
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ bioguide_id: string }> },
) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return err(auth.error!, auth.status ?? 401);

  const { bioguide_id } = await ctx.params;

  let detail;
  try {
    detail = await getMemberDetail(bioguide_id);
  } catch {
    return err("Upstream data unavailable", 502);
  }

  if (!detail) return err("Member not found", 404);

  return ok(detail);
}

export { options as OPTIONS };
