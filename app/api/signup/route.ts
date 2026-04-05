import { NextRequest, NextResponse } from "next/server";
import { queryOSPDB, insertOSPDB } from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateApiKey(): string {
  return `osp_${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "")}`;
}

async function sendConfirmationEmail(email: string, apiKey: string) {
  const res = await fetch("https://api.resend.com/emails", {
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
        <p>Your API key:</p>
        <pre style="background:#1a1a2e;color:#e0e0e0;padding:12px;border-radius:6px;font-size:14px">${apiKey}</pre>
        <p>Include it in every request as a header:</p>
        <pre style="background:#1a1a2e;color:#e0e0e0;padding:12px;border-radius:6px;font-size:14px">X-API-Key: ${apiKey}</pre>
        <p>Example:</p>
        <pre style="background:#1a1a2e;color:#e0e0e0;padding:12px;border-radius:6px;font-size:14px">curl -H "X-API-Key: ${apiKey}" https://api.opensourceforall.com/api/v1/members</pre>
        <p>Rate limit: 1,000 requests/hour (free tier).</p>
        <p>&mdash; OSP Team</p>
      `,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error: ${body}`);
  }
}

export async function POST(request: NextRequest) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  // Check for existing key
  const { data: existing } = await queryOSPDB<{ key: string }>("api_keys", {
    select: "key",
    eq: { email },
    single: true,
  });

  if (existing) {
    const row = existing as { key: string };
    try {
      await sendConfirmationEmail(email, row.key);
    } catch {
      // Non-fatal: key still returned
    }
    return NextResponse.json({ success: true, key: row.key });
  }

  const apiKey = generateApiKey();

  const { error: insertError } = await insertOSPDB("api_keys", {
    key: apiKey,
    email,
    tier: "free",
    requests_today: 0,
  });

  if (insertError) {
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }

  try {
    await sendConfirmationEmail(email, apiKey);
  } catch {
    // Non-fatal: key was created, email delivery failed
  }

  return NextResponse.json({ success: true, key: apiKey }, { status: 201 });
}
