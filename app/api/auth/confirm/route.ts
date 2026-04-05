import { NextRequest, NextResponse } from "next/server";
import { authVerifyOtp, insertOSPDB, queryOSPDB } from "@/lib/supabase";

function generateApiKey(): string {
  return `osp_${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "")}`;
}

async function sendKeyEmail(email: string, apiKey: string) {
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
        <p>Your email has been verified. Here is your API key:</p>
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
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") || "signup";
  const baseUrl = process.env.API_BASE_URL || "http://localhost:3000";

  if (!tokenHash) {
    return NextResponse.redirect(`${baseUrl}/signup?error=missing_token`);
  }

  // Verify the OTP token with Supabase Auth
  const { data: session, error: verifyError } = await authVerifyOtp(tokenHash, type);

  if (verifyError || !session) {
    return NextResponse.redirect(`${baseUrl}/signup?error=invalid_token`);
  }

  // Extract email from the verified session
  const user = (session as { user?: { email?: string } }).user;
  const email = user?.email;

  if (!email) {
    return NextResponse.redirect(`${baseUrl}/signup?error=no_email`);
  }

  // Check if key already exists for this email (idempotent)
  const { data: existing } = await queryOSPDB<{ key: string }>("api_keys", {
    select: "key",
    eq: { email },
    single: true,
  });

  let apiKey: string;

  if (existing) {
    apiKey = (existing as { key: string }).key;
  } else {
    // Generate and insert new API key
    apiKey = generateApiKey();
    const { error: insertError } = await insertOSPDB("api_keys", {
      key: apiKey,
      email,
      tier: "free",
      requests_today: 0,
    });

    if (insertError) {
      return NextResponse.redirect(`${baseUrl}/signup?error=key_generation_failed`);
    }

    // Send API key via email
    try {
      await sendKeyEmail(email, apiKey);
    } catch {
      // Non-fatal: key was created, redirect will show it
    }
  }

  // Redirect to success page with key
  return NextResponse.redirect(
    `${baseUrl}/auth/success?key=${encodeURIComponent(apiKey)}&email=${encodeURIComponent(email)}`
  );
}
