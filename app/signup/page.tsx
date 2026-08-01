"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase-client";
import { C, F, accent, green } from "@/lib/theme";
import { CardHeaderBar, TagPill } from "@/components/ui";

/**
 * Sign-in + API key issuance, on Supabase Auth (Google / GitHub OAuth).
 *
 * Replaces the Neon Auth UI that lived here. The Neon Auth path —
 * /api/auth/[...path], /api/keys, and /auth/success — is deliberately still
 * live until this page is verified in production; only this page moved.
 *
 * Flow: sign in with Supabase → POST /api/v1/keys/mine with the access token
 * as a Bearer header → show the key. A visitor with a persisted session skips
 * straight to the key. The email/password form is gone: OAuth providers hand
 * us a verified email, which is what key issuance requires.
 */

// --- SVG icons ---

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

function errMessage(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) {
    return String((e as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

type State =
  | { status: "checking" } // is there a persisted session?
  | { status: "signedOut" }
  | { status: "fetching" } // signed in, key request in flight
  | { status: "ok"; key: string; tier: string; created: boolean }
  | { status: "error"; message: string };

/** How long to wait on an OAuth code exchange before assuming it failed. */
const OAUTH_EXCHANGE_TIMEOUT_MS = 8000;

export default function SignupPage() {
  const [state, setState] = useState<State>({ status: "checking" });
  // Sign-in failures shown inline on the signed-out card, distinct from the
  // fatal error state — the user can simply try the buttons again.
  const [oauthError, setOauthError] = useState("");
  const [copied, setCopied] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Read by timer callbacks that must not act on a stale status. The check
  // lives in the callbacks, not in setState updaters — updaters must stay pure
  // (strict mode double-invokes them).
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    // Deduped per effect run, not per component: the only way to sign in again
    // after signing out is the OAuth redirect, which remounts the page.
    let started = false;
    const supabase = getSupabase();

    setState({ status: "checking" });

    // An OAuth failure bounces back with error params rather than a code.
    // Show a generic message — the param text is attacker-influenceable
    // (anyone can craft a link to this page), so it is never rendered — and
    // clean the URL so a reload doesn't re-show it.
    const search = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const failed = ["error", "error_description"].some(
      (p) => search.has(p) || hash.has(p),
    );
    const returningFromOAuth = search.has("code");
    if (failed) {
      setOauthError("Sign-in failed. Please try again.");
      window.history.replaceState(null, "", window.location.pathname);
    }

    async function fetchKey(token: string) {
      if (started) return;
      started = true;
      setState({ status: "fetching" });
      try {
        const res = await fetch("/api/v1/keys/mine", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setState({
            status: "error",
            message: body.error ?? "Could not issue an API key.",
          });
          return;
        }
        setState({
          status: "ok",
          key: body.data.key,
          tier: body.data.tier,
          created: res.status === 201,
        });
      } catch {
        if (!cancelled) {
          setState({ status: "error", message: "Network error. Please try again." });
        }
      }
    }

    // getSession waits for client init — including the ?code= exchange on an
    // OAuth return — so a session here covers both the returning visitor and
    // the fresh login. The subscription below is the backstop for a session
    // that lands after this resolves.
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) {
        void fetchKey(data.session.access_token);
      } else if (!returningFromOAuth) {
        setState((s) => (s.status === "checking" ? { status: "signedOut" } : s));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        void fetchKey(session.access_token);
      } else if (event === "SIGNED_OUT") {
        // A failed ?code= exchange surfaces as SIGNED_OUT, not as error params:
        // auth-js discards the dead session and fires this event. Before the
        // key fetch has started, that means the sign-in itself failed — say so,
        // and drop the spent code from the URL (auth-js strips it only on
        // success).
        if (returningFromOAuth && !started) {
          setOauthError("Could not complete sign-in. Please try again.");
          window.history.replaceState(null, "", window.location.pathname);
        }
        setState({ status: "signedOut" });
      }
    });

    // A ?code= that never becomes a session and never fires an event (e.g.
    // opened in a browser without the PKCE verifier, or a hung exchange) would
    // otherwise spin forever. Status is read via stateRef out here, keeping the
    // setState updater pure.
    const timer = returningFromOAuth
      ? setTimeout(() => {
          if (cancelled || stateRef.current.status !== "checking") return;
          setOauthError("Could not complete sign-in. Please try again.");
          window.history.replaceState(null, "", window.location.pathname);
          setState({ status: "signedOut" });
        }, OAUTH_EXCHANGE_TIMEOUT_MS)
      : null;

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, [attempt]);

  async function social(provider: "google" | "github") {
    setOauthError("");
    try {
      const { error } = await getSupabase().auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/signup` },
      });
      // On success the browser navigates away; an error means it didn't start.
      if (error) setOauthError(error.message);
    } catch (e) {
      setOauthError(errMessage(e));
    }
  }

  async function signOut() {
    const supabase = getSupabase();
    let error: unknown = null;
    try {
      // signOut resolves with { error } rather than throwing, and on failure
      // (offline, 5xx) auth-js keeps the localStorage session. Global revoke
      // first; if the server rejects it, retry revoking just this session.
      ({ error } = await supabase.auth.signOut());
      if (error) ({ error } = await supabase.auth.signOut({ scope: "local" }));
    } catch (e) {
      error = e;
    }
    if (error) {
      // The session survived — claiming "signed out" would be false: the next
      // load of this page would silently sign the user straight back in.
      setState({
        status: "error",
        message: "Could not sign out. Check your connection and try again.",
      });
      return;
    }
    setState({ status: "signedOut" });
  }

  async function copy(key: string) {
    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      // Reset any previous timer so a rapid re-copy doesn't flip the label
      // back moments after it re-appears; cleared on unmount above.
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — key is on screen anyway */
    }
  }

  const shell = (headerBar: React.ReactNode, body: React.ReactNode) => (
    <div style={{ minHeight: "calc(100vh - 56px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ maxWidth: 460, width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, overflow: "hidden" }}>
        {headerBar}
        <div style={{ padding: "24px 20px" }}>{body}</div>
      </div>
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

  if (state.status === "checking" || state.status === "fetching") {
    return shell(
      <CardHeaderBar label="WORKING" right={<TagPill>PENDING</TagPill>} />,
      <>
        <h1 style={{ ...titleStyle, marginBottom: 12 }}>
          {state.status === "checking" ? "Checking session…" : "Issuing your API key…"}
        </h1>
        <p style={{ fontFamily: F.body, fontSize: 14, color: C.muted }}>One moment.</p>
      </>,
    );
  }

  if (state.status === "error") {
    return shell(
      <CardHeaderBar dotColor="#ef4444" label="ERROR" labelColor="#ef4444" right={<TagPill color="#ef4444">FAILED</TagPill>} />,
      <>
        <h1 style={{ ...titleStyle, marginBottom: 16 }}>Something went wrong</h1>
        <p style={{ fontFamily: F.body, fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 20 }}>{state.message}</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => setAttempt((a) => a + 1)} className="dc-btn-primary" style={{ ...primaryBtn, cursor: "pointer" }}>
            TRY AGAIN
          </button>
          <button onClick={signOut} className="dc-btn-ghost" style={{ ...ghostBtn, cursor: "pointer" }}>
            SIGN OUT
          </button>
        </div>
      </>,
    );
  }

  if (state.status === "ok") {
    return shell(
      <CardHeaderBar
        dotColor={C.success}
        label="KEY ISSUED"
        labelColor={green(0.7)}
        right={<TagPill color={C.success} borderColor={green(0.3)}>SUCCESS</TagPill>}
      />,
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

        <p style={{ fontFamily: F.body, fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 6 }}>
          Send it in the <code style={{ fontFamily: F.mono, fontSize: 13, color: C.text }}>X-API-Key</code> header with every request:
        </p>
        <div style={{ background: C.surfaceInk, border: `1px solid ${C.borderLight}`, borderRadius: 5, padding: 14, marginBottom: 20, overflowX: "auto" }}>
          <pre style={{ fontFamily: F.mono, fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.5 }}>X-API-Key: {state.key}</pre>
        </div>

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
          <button onClick={signOut} className="dc-btn-ghost" style={{ ...ghostBtn, cursor: "pointer" }}>
            SIGN OUT
          </button>
        </div>
      </>,
    );
  }

  // signedOut
  return shell(
    <CardHeaderBar right={<TagPill>AUTH</TagPill>} />,
    <>
      <h1 style={{ ...titleStyle, marginBottom: 6 }}>SIGN IN</h1>
      <p style={{ fontFamily: F.body, fontSize: 14, color: C.muted, lineHeight: 1.5, marginBottom: 20 }}>
        Sign in to get your free API key. New accounts are created automatically.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button type="button" onClick={() => social("google")} className="dc-oauth" style={oauthLight}>
          <GoogleIcon /> Continue with Google
        </button>
        <button type="button" onClick={() => social("github")} className="dc-oauth" style={oauthDark}>
          <GitHubIcon /> Continue with GitHub
        </button>
      </div>

      {oauthError && (
        <p style={{ color: "#ef4444", fontFamily: F.body, fontSize: 13, marginTop: 12, marginBottom: 0 }}>{oauthError}</p>
      )}

      <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 20, paddingTop: 14 }}>
        <p style={{ fontFamily: F.mono, fontSize: 11, color: C.muted, lineHeight: 1.6, letterSpacing: 0.3 }}>
          Educators, nonprofits, and researchers can apply for discounted access (10,000 req/hr) — email{" "}
          <a href="mailto:opensourcepatents@gmail.com" style={{ color: C.accent, borderBottom: `1px dotted ${C.accent}`, textDecoration: "none" }}>
            opensourcepatents@gmail.com
          </a>
        </p>
      </div>
    </>,
  );
}

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

const ghostBtn: React.CSSProperties = {
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
