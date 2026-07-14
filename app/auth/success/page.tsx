"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { C, F, accent, green } from "@/lib/theme";
import { StatusDot, TagPill } from "@/components/ui";

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
        setState({ status: "ok", key: d.key, email: d.email, tier: d.tier, created: d.created });
      } catch {
        if (!cancelled) setState({ status: "error", message: "Network error. Please try again." });
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
      /* clipboard unavailable — key is on screen anyway */
    }
  }

  const shell = (header: React.ReactNode, body: React.ReactNode) => (
    <div style={{ minHeight: "calc(100vh - 56px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ maxWidth: 460, width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, overflow: "hidden" }}>
        {header}
        <div style={{ padding: "24px 20px" }}>{body}</div>
      </div>
    </div>
  );

  const header = (dotColor: string, label: string, tag: string, tagColor: string) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <StatusDot color={dotColor} />
        <span style={{ fontFamily: F.mono, fontSize: 9, color: dotColor === C.success ? green(0.7) : accent(0.7), letterSpacing: 1.5 }}>
          {label}
        </span>
      </div>
      <TagPill color={tagColor} borderColor={tagColor === C.success ? green(0.3) : C.border}>
        {tag}
      </TagPill>
    </div>
  );

  const titleStyle: React.CSSProperties = {
    fontFamily: F.display,
    fontSize: 18,
    fontWeight: 800,
    color: C.white,
    letterSpacing: 2,
    textTransform: "uppercase",
  };

  if (state.status === "loading") {
    return shell(
      header(C.accent, "WORKING", "PENDING", C.muted),
      <>
        <h1 style={{ ...titleStyle, marginBottom: 12 }}>Issuing your API key…</h1>
        <p style={{ fontFamily: F.body, fontSize: 14, color: C.muted }}>One moment.</p>
      </>,
    );
  }

  if (state.status === "error") {
    return shell(
      header("#ef4444", "ERROR", "FAILED", "#ef4444"),
      <>
        <h1 style={{ ...titleStyle, marginBottom: 16 }}>{state.needsVerification ? "Verify your email" : "Something went wrong"}</h1>
        <p style={{ fontFamily: F.body, fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 8 }}>{state.message}</p>
        <p style={{ fontFamily: F.body, fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 20 }}>
          {state.needsVerification ? (
            "Check your inbox for the verification link, then reload this page."
          ) : (
            <>
              Please <Link href="/signup" style={link}>try again</Link> or contact support.
            </>
          )}
        </p>
        <Link href="/signup" className="dc-btn-ghost" style={ghostBtn}>
          BACK TO SIGN IN
        </Link>
      </>,
    );
  }

  // ok
  return shell(
    header(C.success, "KEY ISSUED", "SUCCESS", C.success),
    <>
      <h1 style={{ ...titleStyle, marginBottom: 16 }}>{state.created ? "You're all set" : "Welcome back"}</h1>

      <p style={{ fontFamily: F.display, fontSize: 9, fontWeight: 600, letterSpacing: 1.5, color: C.success, textTransform: "uppercase", marginBottom: 6 }}>
        YOUR API KEY
      </p>
      <div style={{ background: C.surfaceInk, border: `1px solid ${C.borderLight}`, borderRadius: 5, padding: 14, marginBottom: 8, overflowX: "auto" }}>
        <code style={{ fontFamily: F.mono, fontSize: 13, color: C.text, wordBreak: "break-all" }}>{state.key}</code>
      </div>
      <button onClick={() => copy(state.key)} className="dc-copy" style={copyBtn}>
        {copied ? "COPIED ✓" : "COPY KEY"}
      </button>

      <p style={{ fontFamily: F.display, fontSize: 9, fontWeight: 600, letterSpacing: 1.5, color: C.faint, textTransform: "uppercase", marginBottom: 6 }}>
        USAGE
      </p>
      <div style={{ background: C.surfaceInk, border: `1px solid ${C.borderLight}`, borderRadius: 5, padding: 14, marginBottom: 20, overflowX: "auto" }}>
        <pre style={{ fontFamily: F.mono, fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.5 }}>X-API-Key: {state.key}</pre>
      </div>

      {state.created && (
        <p style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, marginBottom: 16, letterSpacing: 0.3 }}>
          A copy has been emailed to <span style={{ color: C.muted }}>{state.email}</span>
        </p>
      )}
      <p style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, marginBottom: 20, letterSpacing: 0.3 }}>
        Tier: <span style={{ color: C.muted }}>{state.tier}</span> ·{" "}
        <Link href="/pricing" style={{ color: C.accent, borderBottom: `1px dotted ${C.accent}`, textDecoration: "none" }}>
          View all tiers
        </Link>
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/docs" className="dc-btn-primary" style={primaryBtn}>
          VIEW API DOCS →
        </Link>
        <Link href="/" className="dc-btn-ghost" style={ghostBtnInline}>
          HOME
        </Link>
      </div>
    </>,
  );
}

const link: React.CSSProperties = { color: C.accent, textDecoration: "none", borderBottom: `1px dotted ${C.accent}` };

const copyBtn: React.CSSProperties = {
  fontFamily: F.display,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 1,
  textTransform: "uppercase",
  padding: "8px 16px",
  borderRadius: 5,
  border: `1px solid ${C.borderLight}`,
  background: "transparent",
  color: C.muted,
  cursor: "pointer",
  marginBottom: 20,
  transition: "all 0.15s ease",
};

const primaryBtn: React.CSSProperties = {
  fontFamily: F.display,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  padding: "12px 24px",
  background: C.accent,
  color: C.white,
  border: "none",
  borderRadius: 5,
  textDecoration: "none",
  boxShadow: `0 0 10px ${accent(0.3)}`,
  transition: "opacity 0.15s ease",
};

const ghostBtnInline: React.CSSProperties = {
  fontFamily: F.display,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  padding: "12px 24px",
  background: "transparent",
  color: C.accent,
  border: `1px solid ${accent(0.4)}`,
  borderRadius: 5,
  textDecoration: "none",
  transition: "background 0.15s ease",
};

const ghostBtn: React.CSSProperties = { ...ghostBtnInline, display: "inline-block" };
