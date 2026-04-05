"use client";

import { useState, FormEvent, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function SignupPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "missing_token") setError("Invalid confirmation link.");
    else if (err === "invalid_token") setError("Confirmation link expired or invalid. Please sign up again.");
    else if (err === "no_email") setError("Could not verify email. Please try again.");
    else if (err === "key_generation_failed") setError("Failed to generate API key. Please contact support.");
  }, [searchParams]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setMessage(data.message);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>OSP Civic Data API</h1>
        <p style={s.subtitle}>
          Create an account to get your free API key. You&apos;ll need to verify
          your email before the key is generated.
        </p>

        {message ? (
          <div style={s.successBox}>
            <p style={s.successLabel}>Almost there!</p>
            <p style={s.successText}>{message}</p>
            <button onClick={() => { setMessage(""); setEmail(""); setPassword(""); }} style={s.ghost}>
              Start over
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={s.form}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={s.input}
            />
            <input
              type="password"
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              style={s.input}
            />
            <button type="submit" disabled={loading} style={s.button}>
              {loading ? "Creating account..." : "Sign Up"}
            </button>
            {error && <p style={s.error}>{error}</p>}
          </form>
        )}

        <div style={s.divider} />

        <p style={s.note}>
          Educators, nonprofits, and researchers can apply for discounted access
          (10,000 req/hr) &mdash; email{" "}
          <a href="mailto:opensourcepatents@gmail.com" style={s.link}>
            opensourcepatents@gmail.com
          </a>
        </p>
        <p style={s.note}>
          <a href="/pricing" style={s.link}>View all tiers &rarr;</a>
        </p>
      </div>
    </div>
  );
}

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
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
  },
  input: {
    padding: "0.75rem 1rem",
    borderRadius: 8,
    border: "1px solid #2a2a3a",
    backgroundColor: "#0a0a0f",
    color: "#fff",
    fontSize: "1rem",
    outline: "none",
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
