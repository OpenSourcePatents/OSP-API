import { NextRequest, NextResponse } from "next/server";
import { authSignUp, queryOSPDB } from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  // Check if this email already has an API key
  const { data: existing } = await queryOSPDB<{ key: string }>("api_keys", {
    select: "key",
    eq: { email },
    single: true,
  });

  if (existing) {
    return NextResponse.json({
      error: "An API key already exists for this email. Check your inbox or contact support.",
    }, { status: 409 });
  }

  // Create Supabase Auth user (triggers confirmation email)
  const { error: authError } = await authSignUp(email, password);

  if (authError) {
    // Handle "user already registered" from GoTrue
    if (authError.toLowerCase().includes("already registered") || authError.toLowerCase().includes("already been registered")) {
      return NextResponse.json({
        error: "This email is already registered. Check your inbox for the confirmation link.",
      }, { status: 409 });
    }
    return NextResponse.json({ error: authError }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: "Check your email to confirm your account. Your API key will be generated after confirmation.",
  }, { status: 201 });
}
