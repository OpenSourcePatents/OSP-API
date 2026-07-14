import type { Metadata } from "next";
import Link from "next/link";
import { C, F, accent } from "@/lib/theme";
import { Card, CardHeaderBar, TagPill, NeonTitle, StatusDot } from "@/components/ui";

export const metadata: Metadata = {
  title: "Pricing - OSP Civic Data API",
};

interface Tier {
  name: string;
  rate: string;
  price: string;
  who: string;
  tag: string;
  recommended?: boolean;
  cta: { label: string; href?: string; disabled?: boolean };
}

const TIERS: Tier[] = [
  {
    name: "FREE",
    rate: "1,000",
    price: "Free forever",
    who: "Everyone — sign up with an email and start building.",
    tag: "RECOMMENDED",
    recommended: true,
    cta: { label: "GET FREE KEY →", href: "/signup" },
  },
  {
    name: "DISCOUNTED",
    rate: "10,000",
    price: "Free or reduced",
    who: "Educators (.edu), 501(c)(3) nonprofits, and researchers. Apply by email.",
    tag: "EDU / NPO",
    cta: {
      label: "APPLY →",
      href: "mailto:opensourcepatents@gmail.com?subject=Discounted%20Tier%20Request",
    },
  },
  {
    name: "PAID",
    rate: "10,000",
    price: "Coming soon",
    who: "Commercial applications and high-volume users.",
    tag: "COMMERCIAL",
    cta: { label: "COMING SOON", disabled: true },
  },
];

export default function PricingPage() {
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
          ACCESS TIERS
        </p>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <NeonTitle size={40} letterSpacing={4} strokeWidth={1.5}>
            PRICING
          </NeonTitle>
        </div>
        <p style={{ fontFamily: F.body, fontSize: 16, color: C.muted }}>
          All tiers get full access to every endpoint. The only difference is rate limits.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 40,
        }}
      >
        {TIERS.map((t) => (
          <Card
            key={t.name}
            borderColor={t.recommended ? C.accent : C.border}
            header={
              <CardHeaderBar
                borderColor={t.recommended ? accent(0.2) : C.border}
                right={
                  <TagPill color={t.recommended ? C.accent : C.muted} borderColor={t.recommended ? accent(0.3) : C.border}>
                    {t.tag}
                  </TagPill>
                }
              />
            }
          >
            <div style={{ padding: "20px 14px" }}>
              <h3
                style={{
                  fontFamily: F.display,
                  fontSize: 20,
                  fontWeight: 800,
                  color: C.white,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {t.name}
              </h3>
              <p style={{ fontFamily: F.mono, fontSize: 22, fontWeight: 600, color: C.accent, marginBottom: 4 }}>
                {t.rate} <span style={{ fontSize: 12, color: C.muted }}>req/hr</span>
              </p>
              <p style={{ fontFamily: F.body, fontSize: 14, color: C.muted, marginBottom: 4 }}>{t.price}</p>
              <p style={{ fontFamily: F.body, fontSize: 13, color: C.faint, lineHeight: 1.5, marginBottom: 16 }}>
                {t.who}
              </p>

              {t.cta.disabled ? (
                <div
                  style={{
                    width: "100%",
                    textAlign: "center",
                    fontFamily: F.display,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    padding: 12,
                    color: C.faint,
                    border: `1px solid ${C.border}`,
                    borderRadius: 5,
                  }}
                >
                  {t.cta.label}
                </div>
              ) : t.recommended ? (
                <Link
                  href={t.cta.href!}
                  className="dc-btn-primary"
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "center",
                    fontFamily: F.display,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    padding: 12,
                    background: C.accent,
                    color: C.white,
                    borderRadius: 5,
                    textDecoration: "none",
                    boxShadow: `0 0 10px ${accent(0.3)}`,
                    transition: "opacity 0.15s ease",
                  }}
                >
                  {t.cta.label}
                </Link>
              ) : (
                <a
                  href={t.cta.href!}
                  className="dc-btn-ghost"
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "center",
                    fontFamily: F.display,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    padding: 12,
                    background: "transparent",
                    color: C.accent,
                    border: `1px solid ${accent(0.4)}`,
                    borderRadius: 5,
                    textDecoration: "none",
                    transition: "background 0.15s ease",
                  }}
                >
                  {t.cta.label}
                </a>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, padding: 20, marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <StatusDot size={5} />
          <span
            style={{
              fontFamily: F.display,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 2,
              color: C.muted,
              textTransform: "uppercase",
            }}
          >
            HOW TIERS WORK
          </span>
        </div>
        <p style={{ fontFamily: F.body, fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 10 }}>
          Every new signup gets the <strong style={{ color: C.text }}>free</strong> tier automatically. Rate limits
          are enforced per API key using a sliding 1-hour window. If you exceed the limit, you&apos;ll get a{" "}
          <code style={codeInline}>429</code> response — back off and retry.
        </p>
        <p style={{ fontFamily: F.body, fontSize: 14, color: C.muted, lineHeight: 1.7 }}>
          To request <strong style={{ color: C.text }}>discounted</strong> access, email{" "}
          <a href="mailto:opensourcepatents@gmail.com" style={link}>
            opensourcepatents@gmail.com
          </a>{" "}
          with your name, organization, and use case.
        </p>
      </div>
    </div>
  );
}

const codeInline: React.CSSProperties = {
  fontFamily: F.mono,
  fontSize: 12,
  background: "#1a1a2a",
  padding: "2px 6px",
  borderRadius: 3,
  color: C.codeInk,
};

const link: React.CSSProperties = {
  color: C.accent,
  borderBottom: `1px dotted ${C.accent}`,
  textDecoration: "none",
};
