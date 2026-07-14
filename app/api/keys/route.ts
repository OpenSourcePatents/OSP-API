import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { auth } from "@/lib/neon-auth";
import { db } from "@/lib/db";
import { apiKeys } from "@/lib/schema";

export const dynamic = "force-dynamic";

function generateApiKey(): string {
  return `osp_${randomUUID().replace(/-/g, "")}${randomUUID().replace(/-/g, "")}`;
}

async function sendKeyEmail(email: string, apiKey: string) {
  if (!process.env.RESEND_API_KEY) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "noreply@opensourceforall.com",
      to: email,
      subject: "Your OSP Civic Data API Key",
      html: `
        <h2>Welcome to the OSP Civic Data API</h2>
        <p>Here is your API key:</p>
        <pre style="background:#1a1a2e;color:#e0e0e0;padding:12px;border-radius:6px;font-size:14px">${apiKey}</pre>
        <p>Send it with every request:</p>
        <pre style="background:#1a1a2e;color:#e0e0e0;padding:12px;border-radius:6px;font-size:14px">X-API-Key: ${apiKey}</pre>
        <p>Example:</p>
        <pre style="background:#1a1a2e;color:#e0e0e0;padding:12px;border-radius:6px;font-size:14px">curl -H "X-API-Key: ${apiKey}" https://api.opensourceforall.com/api/v1/members/P000197/trades</pre>
        <p>Rate limit: 1,000 requests/hour (free tier).</p>
        <p>&mdash; OSP Team</p>
      `,
    }),
  });
}

/** The signed-in user's API key, if they have one. */
export async function GET() {
  const { data: session } = await auth.getSession();
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const [row] = await db
    .select({ key: apiKeys.key, tier: apiKeys.tier })
    .from(apiKeys)
    .where(eq(apiKeys.email, email))
    .limit(1);

  if (!row) return NextResponse.json({ data: null });

  return NextResponse.json({ data: { key: row.key, tier: row.tier, email } });
}

/**
 * Mints the signed-in user's API key.
 *
 * Idempotent: a user who already has a key gets that same key back rather than a
 * second one, so a double-submit or a re-visit can't orphan a live key.
 */
export async function POST() {
  const { data: session } = await auth.getSession();
  const user = session?.user;
  const email = user?.email;

  if (!email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // Email verification is the whole point of the gate — an unverified address
  // could belong to anyone.
  if (user?.emailVerified === false) {
    return NextResponse.json(
      { error: "Verify your email address before requesting an API key." },
      { status: 403 },
    );
  }

  const [existing] = await db
    .select({ key: apiKeys.key, tier: apiKeys.tier })
    .from(apiKeys)
    .where(eq(apiKeys.email, email))
    .limit(1);

  if (existing) {
    return NextResponse.json({
      data: { key: existing.key, tier: existing.tier, email, created: false },
    });
  }

  const key = generateApiKey();

  try {
    await db.insert(apiKeys).values({ key, email, tier: "free" });
  } catch {
    // Unique constraint on email — another request won the race. Return theirs.
    const [row] = await db
      .select({ key: apiKeys.key, tier: apiKeys.tier })
      .from(apiKeys)
      .where(eq(apiKeys.email, email))
      .limit(1);

    if (row) {
      return NextResponse.json({
        data: { key: row.key, tier: row.tier, email, created: false },
      });
    }
    return NextResponse.json(
      { error: "Could not create API key" },
      { status: 500 },
    );
  }

  // Delivery is best-effort: the key is already minted and is returned in this
  // response, so a Resend outage must not fail the request.
  try {
    await sendKeyEmail(email, key);
  } catch {
    /* ignore */
  }

  return NextResponse.json(
    { data: { key, tier: "free", email, created: true } },
    { status: 201 },
  );
}
