import type { Metadata } from "next";
import Link from "next/link";
import { C, F, accent } from "@/lib/theme";
import { Card, CardHeaderBar, TagPill, NeonTitle, StatusDot } from "@/components/ui";

export const metadata: Metadata = {
  title: "Contact - OSP Civic Data API",
  description:
    "Get in touch with Open Source Patents about the Civic Data API — discounted tier applications, bug reports, and data questions.",
};

const EMAIL = "opensourcepatents@gmail.com";

/**
 * Contact page, ported from opensourceforall.com/contact into this site's
 * arcade-terminal styling.
 *
 * The source page's stance is preserved deliberately: plain email, no form, no
 * sales funnel. That is also why there is no POST handler behind this page —
 * there is nothing to submit. The three "what to include" prompts are the
 * source's, reworded for API callers rather than consulting enquiries.
 */

const INCLUDE = [
  {
    label: "WHAT YOU'RE BUILDING",
    body: "What you're trying to accomplish — the app, the research, the story.",
  },
  {
    label: "WHAT YOU'RE USING NOW",
    body: "Your current tools or systems: spreadsheets, paper, scrapers, legacy databases.",
  },
  {
    label: "TIMELINE & BUDGET",
    body: "Any timeline or budget parameters you already know, if they apply.",
  },
];

export default function ContactPage() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 64px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <p
          style={{
            fontFamily: F.mono,
            fontSize: 9,
            color: accent(0.6),
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          GET IN TOUCH
        </p>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <NeonTitle size={40} letterSpacing={4} strokeWidth={1.5}>
            CONTACT
          </NeonTitle>
        </div>
        <p style={{ fontFamily: F.body, fontSize: 16, color: C.muted }}>
          Plain email, no forms, no sales funnel.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <Card
          borderColor={C.accent}
          header={
            <CardHeaderBar
              borderColor={accent(0.2)}
              right={
                <TagPill color={C.accent} borderColor={accent(0.3)}>
                  EMAIL
                </TagPill>
              }
            />
          }
        >
          <div style={{ padding: "20px 14px" }}>
            <h2 style={cardTitle}>WRITE TO US</h2>
            <p style={{ fontFamily: F.body, fontSize: 13, color: C.faint, lineHeight: 1.5, marginBottom: 16 }}>
              One address, read by a human. Discounted tier applications, bug reports, and data
              questions all land in the same inbox.
            </p>
            <a href={`mailto:${EMAIL}`} className="dc-btn-primary" style={primaryBtn}>
              {EMAIL}
            </a>
          </div>
        </Card>

        <Card
          header={
            <CardHeaderBar
              label="SOURCE"
              labelColor={C.muted}
              dotColor={C.muted}
              right={<TagPill>GITHUB</TagPill>}
            />
          }
        >
          <div style={{ padding: "20px 14px" }}>
            <h2 style={cardTitle}>READ THE CODE FIRST</h2>
            <p style={{ fontFamily: F.body, fontSize: 13, color: C.faint, lineHeight: 1.5, marginBottom: 16 }}>
              Everything is open source, AGPL-3.0. The answer to a data question is often already in
              the pipeline or the API source.
            </p>
            <a
              href="https://github.com/OpenSourcePatents"
              target="_blank"
              rel="noopener noreferrer"
              className="dc-btn-ghost"
              style={ghostBtn}
            >
              GITHUB.COM/OPENSOURCEPATENTS →
            </a>
          </div>
        </Card>
      </div>

      {/* What to include */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, padding: 20, marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
          <StatusDot size={5} />
          <span style={sectionLabel}>WHAT TO INCLUDE</span>
        </div>
        <p style={{ fontFamily: F.body, fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 16 }}>
          Not required — but the more of this you send, the faster the reply is useful.
        </p>
        <div style={{ display: "grid", gap: 12 }}>
          {INCLUDE.map((item) => (
            <div key={item.label} style={{ borderLeft: `2px solid ${accent(0.4)}`, paddingLeft: 12 }}>
              <p
                style={{
                  fontFamily: F.display,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  color: C.accent,
                  textTransform: "uppercase",
                  marginBottom: 3,
                }}
              >
                {item.label}
              </p>
              <p style={{ fontFamily: F.body, fontSize: 14, color: C.muted, lineHeight: 1.6 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Discounted tier — the reason most people arrive here */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <StatusDot size={5} />
          <span style={sectionLabel}>APPLYING FOR DISCOUNTED ACCESS</span>
        </div>
        <p style={{ fontFamily: F.body, fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 10 }}>
          Educators (.edu), 501(c)(3) nonprofits, and researchers qualify for the{" "}
          <Link href="/pricing" style={link}>
            discounted tier
          </Link>{" "}
          — 10,000 requests/hour, free or reduced. Email us with your name, organization, and use
          case.
        </p>
        <p style={{ fontFamily: F.body, fontSize: 14, color: C.muted, lineHeight: 1.7 }}>
          You don&apos;t have to wait for a reply to start building.{" "}
          <Link href="/signup" style={link}>
            Grab a free key
          </Link>{" "}
          now — same endpoints, lower rate limit — and we&apos;ll raise the limit on that key.
        </p>
      </div>
    </div>
  );
}

const cardTitle: React.CSSProperties = {
  fontFamily: F.display,
  fontSize: 18,
  fontWeight: 800,
  color: C.white,
  letterSpacing: 2,
  textTransform: "uppercase",
  marginBottom: 8,
};

const sectionLabel: React.CSSProperties = {
  fontFamily: F.display,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 2,
  color: C.muted,
  textTransform: "uppercase",
};

const btnBase: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "center",
  fontFamily: F.display,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  padding: 12,
  borderRadius: 5,
  textDecoration: "none",
  wordBreak: "break-all",
};

const primaryBtn: React.CSSProperties = {
  ...btnBase,
  background: C.accent,
  color: C.white,
  boxShadow: `0 0 10px ${accent(0.3)}`,
  transition: "opacity 0.15s ease",
};

const ghostBtn: React.CSSProperties = {
  ...btnBase,
  background: "transparent",
  color: C.accent,
  border: `1px solid ${accent(0.4)}`,
  transition: "background 0.15s ease",
};

const link: React.CSSProperties = {
  color: C.accent,
  borderBottom: `1px dotted ${C.accent}`,
  textDecoration: "none",
};
