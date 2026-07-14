"use client";

import { Suspense, useState, FormEvent, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/neon-auth-client";
import { C, F, accent } from "@/lib/theme";
import { CardHeaderBar, TagPill } from "@/components/ui";

// --- SVG icons ---

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

// --- Password helpers ---

const PW_RULES = [
  { key: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { key: "upper", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { key: "number", label: "One number", test: (p: string) => /\d/.test(p) },
  { key: "special", label: "One special character (!@#$%^&*)", test: (p: string) => /[!@#$%^&*]/.test(p) },
] as const;

function getStrength(password: string): { label: string; color: string; pct: number } {
  const passed = PW_RULES.filter((r) => r.test(password)).length;
  if (passed <= 1) return { label: "Weak", color: "#ef4444", pct: 25 };
  if (passed <= 2) return { label: "Fair", color: "#f59e0b", pct: 50 };
  if (passed <= 3) return { label: "Good", color: "#eab308", pct: 75 };
  return { label: "Strong", color: "#22c55e", pct: 100 };
}

const inputStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 5,
  border: `1px solid ${C.borderLight}`,
  background: C.surfaceInk,
  color: C.white,
  fontFamily: F.mono,
  fontSize: 14,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        className="dc-input"
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        style={inputStyle}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? "Hide password" : "Show password"}
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 4,
          display: "flex",
          alignItems: "center",
        }}
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

function errMessage(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) {
    return String((e as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

type Mode = "signup" | "signin";

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("error")) setError("Sign-in failed. Please try again.");
  }, [searchParams]);

  const ruleResults = useMemo(() => PW_RULES.map((r) => ({ ...r, met: r.test(password) })), [password]);
  const allRulesMet = ruleResults.every((r) => r.met);
  const passwordsMatch = password.length > 0 && password === confirm;
  const strength = useMemo(() => getStrength(password), [password]);

  const canSubmit =
    mode === "signup"
      ? email.length > 0 && allRulesMet && passwordsMatch && !loading
      : email.length > 0 && password.length > 0 && !loading;

  async function social(provider: "google" | "github") {
    setError("");
    try {
      await authClient.signIn.social({ provider, callbackURL: "/auth/success" });
    } catch (e) {
      setError(errMessage(e));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setMessage("");
    setLoading(true);
    try {
      if (mode === "signup") {
        await authClient.signUp.email({ email, password, name: email });
        setMessage(
          "Check your email to verify your address. Once verified, sign in and your API key will be issued.",
        );
      } else {
        await authClient.signIn.email({ email, password });
        router.push("/auth/success");
      }
    } catch (err) {
      setError(errMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const title = mode === "signup" ? "CREATE ACCOUNT" : "SIGN IN";
  const subtitle =
    mode === "signup"
      ? "Create an account to get your free API key. You'll need to verify your email first."
      : "Sign in to retrieve your API key.";

  return (
    <div style={{ maxWidth: 460, width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, overflow: "hidden" }}>
      <CardHeaderBar right={<TagPill>AUTH</TagPill>} />

      <div style={{ padding: "24px 20px" }}>
        <h1
          style={{
            fontFamily: F.display,
            fontSize: 18,
            fontWeight: 800,
            color: C.white,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {title}
        </h1>
        <p style={{ fontFamily: F.body, fontSize: 14, color: C.muted, lineHeight: 1.5, marginBottom: 20 }}>{subtitle}</p>

        {message ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontFamily: F.display, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: C.success, textTransform: "uppercase" }}>
              Almost there
            </p>
            <p style={{ fontFamily: F.body, fontSize: 14, color: "#aaa", lineHeight: 1.5 }}>{message}</p>
            <button
              onClick={() => {
                setMessage("");
                setMode("signin");
                setPassword("");
                setConfirm("");
              }}
              className="dc-copy"
              style={{
                marginTop: 4,
                padding: "10px 16px",
                borderRadius: 5,
                border: `1px solid ${C.borderLight}`,
                background: "transparent",
                color: C.muted,
                fontFamily: F.display,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 1,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Go to sign in
            </button>
          </div>
        ) : (
          <>
            {/* OAuth */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              <button type="button" onClick={() => social("google")} className="dc-oauth" style={oauthLight}>
                <GoogleIcon /> Continue with Google
              </button>
              <button type="button" onClick={() => social("github")} className="dc-oauth" style={oauthDark}>
                <GitHubIcon /> Continue with GitHub
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span
                style={{
                  fontFamily: F.display,
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.muted,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                OR CONTINUE WITH EMAIL
              </span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                className="dc-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
              />

              <PasswordInput value={password} onChange={setPassword} placeholder="Password" />

              {mode === "signup" && password.length > 0 && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${strength.pct}%`, height: "100%", background: strength.color, borderRadius: 2, transition: "width 0.2s" }} />
                    </div>
                    <span style={{ fontFamily: F.mono, fontSize: 10, fontWeight: 600, color: strength.color, minWidth: 42, textAlign: "right" }}>
                      {strength.label}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {ruleResults.map((r) => (
                      <span key={r.key} style={{ fontFamily: F.mono, fontSize: 12, color: r.met ? C.success : "#aaa" }}>
                        {r.met ? "✓" : "✗"} {r.label}
                      </span>
                    ))}
                  </div>
                  <PasswordInput value={confirm} onChange={setConfirm} placeholder="Confirm password" />
                  {confirm.length > 0 && !passwordsMatch && (
                    <p style={{ color: "#ef4444", fontFamily: F.mono, fontSize: 12, margin: 0 }}>Passwords do not match</p>
                  )}
                </>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="dc-btn-primary"
                style={{
                  padding: 12,
                  borderRadius: 5,
                  border: "none",
                  background: C.accent,
                  color: C.white,
                  fontFamily: F.display,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  boxShadow: `0 0 10px ${accent(0.3)}`,
                  marginTop: 4,
                  opacity: canSubmit ? 1 : 0.45,
                  transition: "opacity 0.15s ease",
                }}
              >
                {loading ? (mode === "signup" ? "Creating account..." : "Signing in...") : mode === "signup" ? "Sign Up" : "Sign In"}
              </button>
              {error && <p style={{ color: "#ef4444", fontFamily: F.body, fontSize: 13, margin: 0 }}>{error}</p>}
            </form>

            <p style={{ fontFamily: F.body, fontSize: 14, color: "#aaa", textAlign: "center", marginTop: 16 }}>
              {mode === "signup" ? "Already have an account? " : "Need an account? "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signup" ? "signin" : "signup");
                  setError("");
                  setPassword("");
                  setConfirm("");
                }}
                style={{ background: "none", border: "none", color: C.accent, fontFamily: F.body, fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 0 }}
              >
                {mode === "signup" ? "Sign in" : "Sign up"}
              </button>
            </p>
          </>
        )}

        <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 16, paddingTop: 14 }}>
          <p style={{ fontFamily: F.mono, fontSize: 11, color: C.muted, lineHeight: 1.6, letterSpacing: 0.3 }}>
            Educators, nonprofits, and researchers can apply for discounted access (10,000 req/hr) — email{" "}
            <a href="mailto:opensourcepatents@gmail.com" style={{ color: C.accent, borderBottom: `1px dotted ${C.accent}`, textDecoration: "none" }}>
              opensourcepatents@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div style={{ minHeight: "calc(100vh - 56px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <Suspense fallback={<p style={{ fontFamily: F.body, color: C.muted }}>Loading...</p>}>
        <AuthForm />
      </Suspense>
    </div>
  );
}

const oauthLight: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "12px 16px",
  borderRadius: 5,
  border: `1px solid ${C.borderLight}`,
  background: "#fff",
  color: "#111",
  fontFamily: F.body,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  transition: "opacity 0.15s ease",
};

const oauthDark: React.CSSProperties = {
  ...oauthLight,
  background: "#24292f",
  color: "#fff",
};
