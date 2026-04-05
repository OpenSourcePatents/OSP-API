"use client";

import { useState, FormEvent } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setApiKey("");
    setLoading(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setApiKey(data.key);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>OSP Civic Data API</h1>
        <p style={styles.subtitle}>
          Get a free API key to access congressional accountability data.
        </p>

        {!apiKey ? (
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Generating..." : "Get API Key"}
            </button>
            {error && <p style={styles.error}>{error}</p>}
          </form>
        ) : (
          <div style={styles.success}>
            <p style={styles.successLabel}>Your API key:</p>
            <pre style={styles.keyBox}>{apiKey}</pre>
            <p style={styles.hint}>
              Pass it as a header with every request:
            </p>
            <pre style={styles.codeBox}>X-API-Key: {apiKey}</pre>
            <p style={styles.hint}>
              A confirmation email has been sent to <strong>{email}</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
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
  success: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
  successLabel: {
    color: "#22c55e",
    fontWeight: 600,
    fontSize: "0.95rem",
    margin: 0,
  },
  keyBox: {
    backgroundColor: "#0a0a0f",
    border: "1px solid #2a2a3a",
    borderRadius: 8,
    padding: "0.75rem 1rem",
    color: "#e0e0e0",
    fontSize: "0.8rem",
    overflowX: "auto" as const,
    margin: 0,
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
    margin: 0,
    wordBreak: "break-all" as const,
    whiteSpace: "pre-wrap" as const,
  },
  hint: {
    color: "#666",
    fontSize: "0.85rem",
    margin: 0,
    lineHeight: 1.5,
  },
};
