"use client";

import { useSearchParams } from "next/navigation";

export default function AuthSuccessPage() {
  const searchParams = useSearchParams();
  const apiKey = searchParams.get("key") || "";
  const email = searchParams.get("email") || "";

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>Email Verified</h1>

        {apiKey ? (
          <>
            <p style={s.successLabel}>Your API key:</p>
            <pre style={s.keyBox}>{apiKey}</pre>
            <p style={s.hint}>Pass it as a header with every request:</p>
            <pre style={s.codeBox}>X-API-Key: {apiKey}</pre>
            <p style={s.hint}>
              A copy has been emailed to <strong>{email}</strong>.
            </p>
            <p style={s.hint}>
              Rate limit: 1,000 requests/hour (free tier).{" "}
              <a href="/pricing" style={s.link}>View all tiers</a>
            </p>
          </>
        ) : (
          <p style={s.hint}>
            Something went wrong. Please <a href="/signup" style={s.link}>try again</a> or
            contact support.
          </p>
        )}

        <div style={s.ctas}>
          <a href="/docs" style={s.ctaPrimary}>View API Docs</a>
          <a href="/" style={s.ctaSecondary}>Home</a>
        </div>
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
