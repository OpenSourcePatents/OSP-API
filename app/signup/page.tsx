"use client";

import { Suspense, useState, FormEvent, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/neon-auth-client";

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
    <div style={s.pwWrap}>
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        style={s.input}
      />
      <button type="button" onClick={() => setShow(!show)} style={s.eyeBtn} aria-label={show ? "Hide password" : "Show password"}>
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

// --- Main form ---

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
    const err = searchParams.get("error");
    if (err) setError("Sign-in failed. Please try again.");
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
        // Neon Auth sends the verification email. The key is only minted once the
        // address is verified, so we can't hand one out yet.
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

  return (
    <div style={s.card}>
      <h1 style={s.title}>OSP Civic Data API</h1>
      <p style={s.subtitle}>
        {mode === "signup"
          ? "Create an account to get your free API key. You'll need to verify your email first."
          : "Sign in to retrieve your API key."}
      </p>

      {message ? (
        <div style={s.successBox}>
          <p style={s.successLabel}>Almost there!</p>
          <p style={s.successText}>{message}</p>
          <button
            onClick={() => {
              setMessage("");
              setMode("signin");
              setPassword("");
              setConfirm("");
            }}
            style={s.ghost}
          >
            Go to sign in
          </button>
        </div>
      ) : (
        <>
          <div style={s.oauthGroup}>
            <button type="button" onClick={() => social("google")} style={s.oauthBtn}>
              <GoogleIcon /> Continue with Google
            </button>
            <button type="button" onClick={() => social("github")} style={s.oauthBtnDark}>
              <GitHubIcon /> Continue with GitHub
            </button>
          </div>

          <div style={s.orDivider}>
            <span style={s.orLine} />
            <span style={s.orText}>or continue with email</span>
            <span style={s.orLine} />
          </div>

          <form onSubmit={handleSubmit} style={s.form}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={s.input}
            />

            <PasswordInput value={password} onChange={setPassword} placeholder="Password" />

            {mode === "signup" && password.length > 0 && (
              <>
                <div style={s.strengthWrap}>
                  <div style={s.strengthTrack}>
                    <div style={{ ...s.strengthFill, width: `${strength.pct}%`, backgroundColor: strength.color }} />
                  </div>
                  <span style={{ ...s.strengthLabel, color: strength.color }}>{strength.label}</span>
                </div>

                <ul style={s.ruleList}>
                  {ruleResults.map((r) => (
                    <li key={r.key} style={{ ...s.ruleItem, color: r.met ? "#22c55e" : "#555" }}>
                      <span style={s.ruleIcon}>{r.met ? "✓" : "✗"}</span> {r.label}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {mode === "signup" && (
              <>
                <PasswordInput value={confirm} onChange={setConfirm} placeholder="Confirm password" />
                {confirm.length > 0 && !passwordsMatch && (
                  <p style={s.mismatch}>Passwords do not match</p>
                )}
              </>
            )}

            <button type="submit" disabled={!canSubmit} style={{ ...s.button, opacity: canSubmit ? 1 : 0.45 }}>
              {loading
                ? mode === "signup"
                  ? "Creating account..."
                  : "Signing in..."
                : mode === "signup"
                  ? "Sign Up"
                  : "Sign In"}
            </button>
            {error && <p style={s.error}>{error}</p>}
          </form>

          <p style={s.switchNote}>
            {mode === "signup" ? "Already have an account? " : "Need an account? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signup" ? "signin" : "signup");
                setError("");
                setPassword("");
                setConfirm("");
              }}
              style={s.linkBtn}
            >
              {mode === "signup" ? "Sign in" : "Sign up"}
            </button>
          </p>
        </>
      )}

      <div style={s.divider} />

      <p style={s.note}>
        Educators, nonprofits, and researchers can apply for discounted access
        (10,000 req/hr) &mdash; email{" "}
        <a href="mailto:opensourcepatents@gmail.com" style={s.link}>opensourcepatents@gmail.com</a>
      </p>
      <p style={s.note}>
        <a href="/pricing" style={s.link}>View all tiers &rarr;</a>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div style={s.page}>
      <Suspense fallback={<div style={s.card}><p style={s.subtitle}>Loading...</p></div>}>
        <AuthForm />
      </Suspense>
    </div>
  );
}

// --- Styles ---

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0a0a0f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  card: {
    maxWidth: 480,
    width: "100%",
    backgroundColor: "#12121a",
    borderRadius: 12,
    padding: "2.5rem",
    border: "1px solid #1e1e2e",
  },
  title: {
    color: "#ffffff",
    fontSize: "1.5rem",
    fontWeight: 700,
    margin: 0,
  },
  subtitle: {
    color: "#888",
    fontSize: "0.95rem",
    marginTop: "0.5rem",
    marginBottom: "1.5rem",
    lineHeight: 1.5,
  },

  oauthGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
    marginBottom: "1rem",
  },
  oauthBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.7rem 1rem",
    borderRadius: 8,
    border: "1px solid #2a2a3a",
    backgroundColor: "#fff",
    color: "#111",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  oauthBtnDark: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.7rem 1rem",
    borderRadius: 8,
    border: "1px solid #2a2a3a",
    backgroundColor: "#24292f",
    color: "#fff",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
  },

  orDivider: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    margin: "0.25rem 0 1rem",
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#1e1e2e",
  },
  orText: {
    color: "#555",
    fontSize: "0.75rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    whiteSpace: "nowrap" as const,
  },

  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.6rem",
  },
  input: {
    padding: "0.75rem 1rem",
    borderRadius: 8,
    border: "1px solid #2a2a3a",
    backgroundColor: "#0a0a0f",
    color: "#fff",
    fontSize: "1rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
  },
  pwWrap: {
    position: "relative" as const,
  },
  eyeBtn: {
    position: "absolute" as const,
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
  },

  strengthWrap: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  strengthTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "#1e1e2e",
    borderRadius: 2,
    overflow: "hidden" as const,
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
    transition: "width 0.2s, background-color 0.2s",
  },
  strengthLabel: {
    fontSize: "0.7rem",
    fontWeight: 600,
    minWidth: 42,
    textAlign: "right" as const,
  },

  ruleList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.15rem",
  },
  ruleItem: {
    fontSize: "0.75rem",
    transition: "color 0.15s",
  },
  ruleIcon: {
    display: "inline-block",
    width: 14,
    textAlign: "center" as const,
    marginRight: 2,
  },

  mismatch: {
    color: "#ef4444",
    fontSize: "0.75rem",
    margin: 0,
  },

  button: {
    padding: "0.75rem 1rem",
    borderRadius: 8,
    border: "none",
    backgroundColor: "#3b82f6",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.15s",
    marginTop: "0.25rem",
  },
  error: {
    color: "#ef4444",
    fontSize: "0.875rem",
    margin: 0,
  },
  successBox: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
  successLabel: {
    color: "#22c55e",
    fontWeight: 600,
    fontSize: "1rem",
    margin: 0,
  },
  successText: {
    color: "#aaa",
    fontSize: "0.9rem",
    lineHeight: 1.5,
    margin: 0,
  },
  ghost: {
    marginTop: "0.5rem",
    padding: "0.5rem 1rem",
    borderRadius: 8,
    border: "1px solid #2a2a3a",
    backgroundColor: "transparent",
    color: "#888",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  switchNote: {
    color: "#666",
    fontSize: "0.85rem",
    textAlign: "center" as const,
    marginTop: "1rem",
    marginBottom: 0,
  },
  linkBtn: {
    background: "none",
    border: "none",
    padding: 0,
    color: "#3b82f6",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  divider: {
    borderTop: "1px solid #1e1e2e",
    margin: "1.5rem 0",
  },
  note: {
    color: "#555",
    fontSize: "0.8rem",
    lineHeight: 1.5,
    margin: "0.4rem 0",
  },
  link: {
    color: "#3b82f6",
    textDecoration: "none",
  },
};
