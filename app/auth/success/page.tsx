"use client";

import { useEffect, useState } from "react";

type State =
  | { status: "loading" }
  | { status: "ok"; key: string; email: string; tier: string; created: boolean }
  | { status: "error"; message: string; needsVerification?: boolean };

export default function AuthSuccessPage() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // The key is fetched over the session cookie rather than passed in the URL.
    // A key in a query string leaks into browser history, referrers, and logs.
    (async () => {
      try {
        const res = await fetch("/api/keys", { method: "POST" });
        const body = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setState({
            status: "error",
            message: body.error ?? "Could not issue an API key.",
            needsVerification: res.status === 403,
          });
          return;
        }

        const d = body.data;
        setState({
          status: "ok",
          key: d.key,
          email: d.email,
          tier: d.tier,
          created: d.created,
        });
      } catch {
        if (!cancelled) {
          setState({ status: "error", message: "Network error. Please try again." });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function copy(key: string) {
    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the key is on screen anyway */
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        {state.status === "loading" && (
          <>
            <h1 style={s.title}>Issuing your API key…</h1>
            <p style={s.hint}>One moment.</p>
          </>
        )}

        {state.status === "error" && (
          <>
            <h1 style={s.title}>
              {state.needsVerification ? "Verify your email" : "Something went wrong"}
            </h1>
            <p style={s.hint}>{state.message}</p>
            <p style={s.hint}>
              {state.needsVerification ? (
                <>Check your inbox for the verification link, then reload this page.</>
              ) : (
                <>
                  Please <a href="/signup" style={s.link}>try again</a> or contact support.
                </>
              )}
            </p>
            <div style={s.ctas}>
              <a href="/signup" style={s.ctaSecondary}>Back to sign in</a>
            </div>
          </>
        )}

        {state.status === "ok" && (
          <>
            <h1 style={s.title}>
              {state.created ? "You're all set" : "Welcome back"}
            </h1>

            <p style={s.successLabel}>Your API key:</p>
            <pre style={s.keyBox}>{state.key}</pre>

            <button onClick={() => copy(state.key)} style={s.copyBtn}>
              {copied ? "Copied" : "Copy key"}
            </button>

            <p style={s.hint}>Pass it as a header with every request:</p>
            <pre style={s.codeBox}>X-API-Key: {state.key}</pre>

            {state.created && (
              <p style={s.hint}>
                A copy has been emailed to <strong>{state.email}</strong>.
              </p>
            )}

            <p style={s.hint}>
              Tier: <strong>{state.tier}</strong>.{" "}
              <a href="/pricing" style={s.link}>View all tiers</a>
            </p>

            <div style={s.ctas}>
              <a href="/docs" style={s.ctaPrimary}>View API Docs</a>
              <a href="/" style={s.ctaSecondary}>Home</a>
            </div>
          </>
        )}
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
    color: "#fff",
    fontSize: "1.5rem",
    fontWeight: 700,
    margin: "0 0 1rem",
  },
  successLabel: {
    color: "#22c55e",
    fontWeight: 600,
    fontSize: "0.95rem",
    margin: "0 0 0.25rem",
  },
  keyBox: {
    backgroundColor: "#0a0a0f",
    border: "1px solid #2a2a3a",
    borderRadius: 8,
    padding: "0.75rem 1rem",
    color: "#e0e0e0",
    fontSize: "0.8rem",
    overflowX: "auto" as const,
    margin: "0 0 0.5rem",
    wordBreak: "break-all" as const,
    whiteSpace: "pre-wrap" as const,
  },
  copyBtn: {
    padding: "0.45rem 0.9rem",
    borderRadius: 8,
    border: "1px solid #2a2a3a",
    backgroundColor: "transparent",
    color: "#888",
    fontSize: "0.8rem",
    cursor: "pointer",
    marginBottom: "1rem",
  },
  codeBox: {
    backgroundColor: "#0a0a0f",
    border: "1px solid #2a2a3a",
    borderRadius: 8,
    padding: "0.75rem 1rem",
    color: "#888",
    fontSize: "0.8rem",
    overflowX: "auto" as const,
    margin: "0 0 0.5rem",
    wordBreak: "break-all" as const,
    whiteSpace: "pre-wrap" as const,
  },
  hint: {
    color: "#666",
    fontSize: "0.85rem",
    margin: "0 0 0.4rem",
    lineHeight: 1.5,
  },
  link: {
    color: "#3b82f6",
    textDecoration: "none",
  },
  ctas: {
    display: "flex",
    gap: "0.75rem",
    marginTop: "1.25rem",
  },
  ctaPrimary: {
    display: "inline-block",
    padding: "0.65rem 1.5rem",
    backgroundColor: "#3b82f6",
    color: "#fff",
    borderRadius: 8,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "0.9rem",
  },
  ctaSecondary: {
    display: "inline-block",
    padding: "0.65rem 1.5rem",
    backgroundColor: "transparent",
    color: "#3b82f6",
    border: "1px solid #3b82f6",
    borderRadius: 8,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "0.9rem",
  },
};
