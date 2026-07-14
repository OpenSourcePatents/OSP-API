import Link from "next/link";
import { C, F, accent } from "@/lib/theme";
import { Card, CardHeaderBar, TagPill, NeonTitle, Eyebrow } from "@/components/ui";

const STATS = [
  { value: "536", label: "MEMBERS" },
  { value: "6.8K", label: "TRADES" },
  { value: "13", label: "ENDPOINTS" },
  { value: "∞", label: "OPEN SOURCE" },
];

const NAV_CARDS = [
  {
    tag: "REFERENCE",
    title: "API DOCUMENTATION",
    body: "13 endpoints, full parameter tables, example responses.",
    cta: "EXPLORE DOCS →",
    href: "/docs",
  },
  {
    tag: "AUTH",
    title: "GET AN API KEY",
    body: "Free tier — 1,000 req/hr. No credit card required.",
    cta: "SIGN UP →",
    href: "/signup",
  },
  {
    tag: "TIERS",
    title: "PRICING",
    body: "Free, discounted, and paid tiers. Same endpoints, different limits.",
    cta: "VIEW TIERS →",
    href: "/pricing",
  },
];

const COVERAGE = [
  { title: "CAMPAIGN FINANCE", body: "FEC filings, donor records, fundraising totals, top industries, cash on hand." },
  { title: "STOCK TRADES", body: "STOCK Act disclosures with ticker, amount range, trade type, and timing." },
  { title: "VOTING RECORDS", body: "Roll call votes with bill context, position, and result." },
  { title: "TRAVEL DISCLOSURES", body: "Privately funded foreign travel with destination, sponsor, and cost." },
  { title: "LEGISLATION", body: "Bills with sponsorship, status tracking, and ALEC similarity scores." },
  { title: "ANOMALY SCORES", body: "Composite scores: trade timing, donor concentration, voting anomalies." },
];

const CODE = `const res = await fetch("https://api.opensourceforall.com/api/v1/members/P000197/trades", {
  headers: { "X-API-Key": "osp_your_key_here" }
});
const { data } = await res.json();`;

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ textAlign: "center", padding: "80px 24px 48px", maxWidth: 800, margin: "0 auto" }}>
        <p
          style={{
            fontFamily: F.mono,
            fontSize: 11,
            color: accent(0.7),
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          OPEN SOURCE · FREE FOREVER · AGPL-3.0
        </p>

        <div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
          <NeonTitle>
            CIVIC DATA
            <br />
            API
          </NeonTitle>
        </div>

        <p
          style={{
            fontFamily: F.body,
            fontSize: 18,
            color: C.muted,
            lineHeight: 1.6,
            maxWidth: 560,
            margin: "0 auto 32px",
          }}
        >
          Free, open congressional accountability data — finance, trades, votes, travel, bills.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/signup"
            className="dc-btn-primary"
            style={{
              fontFamily: F.display,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              padding: "14px 32px",
              background: C.accent,
              color: C.white,
              borderRadius: 5,
              textDecoration: "none",
              boxShadow: `0 0 15px ${accent(0.3)}`,
              transition: "opacity 0.15s ease",
            }}
          >
            GET API KEY →
          </Link>
          <Link
            href="/docs"
            className="dc-btn-ghost"
            style={{
              fontFamily: F.display,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              padding: "14px 32px",
              background: "transparent",
              color: C.accent,
              border: `1px solid ${accent(0.4)}`,
              borderRadius: 5,
              textDecoration: "none",
              transition: "background 0.15s ease",
            }}
          >
            VIEW DOCS
          </Link>
        </div>
      </section>

      {/* Stat strip */}
      <section style={{ maxWidth: 700, margin: "0 auto 48px", padding: "0 24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: `1px solid ${C.border}`,
            borderRadius: 7,
            background: C.surface,
            overflow: "hidden",
          }}
        >
          {STATS.map((s, i) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              {i > 0 && <div style={{ width: 1, height: 48, background: C.border }} />}
              <div style={{ flex: 1, textAlign: "center", padding: "20px 16px" }}>
                <div style={{ fontFamily: F.mono, fontSize: 28, fontWeight: 600, color: C.white }}>{s.value}</div>
                <div
                  style={{
                    fontFamily: F.display,
                    fontSize: 9,
                    letterSpacing: 2,
                    color: C.muted,
                    textTransform: "uppercase",
                    marginTop: 4,
                  }}
                >
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nav cards */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {NAV_CARDS.map((card) => (
            <Link key={card.href} href={card.href} style={{ textDecoration: "none" }}>
              <Card link header={<CardHeaderBar right={<TagPill>{card.tag}</TagPill>} />}>
                <div style={{ padding: "16px 14px" }}>
                  <h3
                    style={{
                      fontFamily: F.display,
                      fontSize: 16,
                      fontWeight: 700,
                      color: C.white,
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    {card.title}
                  </h3>
                  <p style={{ fontFamily: F.body, fontSize: 14, color: C.muted, lineHeight: 1.5, marginBottom: 12 }}>
                    {card.body}
                  </p>
                  <span
                    className="dc-arrow"
                    style={{
                      fontFamily: F.display,
                      fontSize: 11,
                      fontWeight: 600,
                      color: C.accent,
                      letterSpacing: 1,
                      transition: "opacity 0.15s ease",
                    }}
                  >
                    {card.cta}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Coverage */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 48px" }}>
        <Eyebrow align="center">WHAT THE API COVERS</Eyebrow>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
            marginTop: 20,
          }}
        >
          {COVERAGE.map((c) => (
            <div key={c.title} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, padding: 16 }}>
              <h4
                style={{
                  fontFamily: F.display,
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.white,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {c.title}
              </h4>
              <p style={{ fontFamily: F.body, fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Code example */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px 64px" }}>
        <Eyebrow align="center">THREE LINES OF CODE</Eyebrow>
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 7,
            padding: 20,
            overflowX: "auto",
            marginTop: 16,
          }}
        >
          <pre
            style={{
              fontFamily: F.mono,
              fontSize: 13,
              color: C.codeInk,
              lineHeight: 1.6,
              margin: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            {CODE}
          </pre>
        </div>
        <p
          style={{
            fontFamily: F.mono,
            fontSize: 11,
            color: C.faint,
            textAlign: "center",
            marginTop: 12,
            letterSpacing: 0.5,
          }}
        >
          1,000 REQUESTS/HOUR ON THE FREE TIER · NO CREDIT CARD · NO APPROVAL
        </p>
      </section>
    </>
  );
}
