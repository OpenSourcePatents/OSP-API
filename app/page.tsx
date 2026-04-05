import { Metadata } from "next";

export const metadata: Metadata = {
  title: "OSP Civic Data API - Free Congressional Accountability Data",
};

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={s.feature}>
      <h3 style={s.featureTitle}>{title}</h3>
      <p style={s.featureDesc}>{desc}</p>
    </div>
  );
}

export default function Home() {
  return (
    <div style={s.page}>
      {/* Hero */}
      <section style={s.hero}>
        <p style={s.badge}>Open Source &middot; Free Forever &middot; AGPL-3.0</p>
        <h1 style={s.heroTitle}>The Free Congressional Accountability API</h1>
        <p style={s.heroSub}>
          Replaces ProPublica Congress API, OpenSecrets API, and GovTrack bulk data.
          One unified REST endpoint for all congressional accountability data.
        </p>
        <div style={s.ctas}>
          <a href="/signup" style={s.ctaPrimary}>Get API Key</a>
          <a href="/docs" style={s.ctaSecondary}>View Docs</a>
        </div>
      </section>

      {/* What it covers */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>What the API Covers</h2>
        <div style={s.grid}>
          <Feature
            title="Campaign Finance"
            desc="FEC filings, donor records, fundraising totals, top industries, and cash on hand for every member."
          />
          <Feature
            title="Stock Trades"
            desc="STOCK Act disclosures with ticker, amount range, trade type, and timing for all congressional trades."
          />
          <Feature
            title="Voting Records"
            desc="Roll call votes with bill context, position, and result across the full congressional record."
          />
          <Feature
            title="Travel Disclosures"
            desc="Privately funded foreign travel with destination, sponsor, cost, and funding source."
          />
          <Feature
            title="Legislation"
            desc="Bills with sponsorship, cosponsor counts, status tracking, and ALEC model bill similarity scores."
          />
          <Feature
            title="Anomaly Scores"
            desc="Composite accountability scores: trade timing, donor concentration, voting anomalies, and more."
          />
        </div>
      </section>

      {/* How it works */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Three Lines of Code</h2>
        <pre style={s.code}>{`const res = await fetch("https://api.opensourceforall.com/api/v1/members/P000197/trades", {
  headers: { "X-API-Key": "osp_your_key_here" }
});
const { data } = await res.json();`}</pre>
        <p style={s.sectionSub}>
          1,000 requests/hour on the free tier. No credit card. No approval process.
        </p>
      </section>

      {/* See it in action */}
      <section style={s.section}>
        <div style={s.showcase}>
          <h2 style={s.showcaseTitle}>See It in Action</h2>
          <p style={s.showcaseDesc}>
            CongressWatch is the first app built on this API &mdash; a civic dashboard
            that tracks stock trades, voting records, campaign finance, and anomaly scores
            for every member of Congress.
          </p>
          <a
            href="https://congresswatch.vercel.app"
            style={s.showcaseLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            congresswatch.vercel.app
          </a>
        </div>
      </section>

      {/* Endpoints overview */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>13 Endpoints, Zero Paywall</h2>
        <div style={s.endpointGrid}>
          <div style={s.endpointCol}>
            <p style={s.endpointLabel}>Public</p>
            <p style={s.endpointItem}><span style={s.get}>GET</span> /v1/members</p>
            <p style={s.endpointItem}><span style={s.get}>GET</span> /v1/stats</p>
          </div>
          <div style={s.endpointCol}>
            <p style={s.endpointLabel}>Authenticated</p>
            <p style={s.endpointItem}><span style={s.get}>GET</span> /v1/members/:id</p>
            <p style={s.endpointItem}><span style={s.get}>GET</span> /v1/members/:id/votes</p>
            <p style={s.endpointItem}><span style={s.get}>GET</span> /v1/members/:id/bills</p>
            <p style={s.endpointItem}><span style={s.get}>GET</span> /v1/members/:id/trades</p>
            <p style={s.endpointItem}><span style={s.get}>GET</span> /v1/members/:id/travel</p>
            <p style={s.endpointItem}><span style={s.get}>GET</span> /v1/members/:id/donors</p>
            <p style={s.endpointItem}><span style={s.get}>GET</span> /v1/members/:id/finances</p>
            <p style={s.endpointItem}><span style={s.get}>GET</span> /v1/members/:id/score</p>
            <p style={s.endpointItem}><span style={s.get}>GET</span> /v1/trades</p>
            <p style={s.endpointItem}><span style={s.get}>GET</span> /v1/bills</p>
          </div>
        </div>
        <div style={s.docsLink}>
          <a href="/docs" style={s.ctaSecondary}>Full API Reference</a>
        </div>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <p>
          Built by{" "}
          <a href="https://github.com/OpenSourcePatents" style={s.link} target="_blank" rel="noopener noreferrer">
            Open Source Patents
          </a>
          {" \u00b7 "}
          <a href="https://github.com/OpenSourcePatents/OSP-API" style={s.link} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          {" \u00b7 "}
          <a href="/docs" style={s.link}>Docs</a>
          {" \u00b7 "}
          <a href="/signup" style={s.link}>Get API Key</a>
        </p>
      </footer>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0a0a0f",
    color: "#e0e0e0",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  hero: {
    textAlign: "center" as const,
    padding: "5rem 1.5rem 4rem",
    maxWidth: 720,
    margin: "0 auto",
  },
  badge: {
    color: "#3b82f6",
    fontSize: "0.8rem",
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    marginBottom: "1rem",
  },
  heroTitle: {
    color: "#fff",
    fontSize: "2.75rem",
    fontWeight: 800,
    lineHeight: 1.15,
    margin: "0 0 1rem",
  },
  heroSub: {
    color: "#888",
    fontSize: "1.1rem",
    lineHeight: 1.6,
    maxWidth: 560,
    margin: "0 auto 2rem",
  },
  ctas: {
    display: "flex",
    gap: "0.75rem",
    justifyContent: "center",
    flexWrap: "wrap" as const,
  },
  ctaPrimary: {
    display: "inline-block",
    padding: "0.75rem 2rem",
    backgroundColor: "#3b82f6",
    color: "#fff",
    borderRadius: 8,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "1rem",
  },
  ctaSecondary: {
    display: "inline-block",
    padding: "0.75rem 2rem",
    backgroundColor: "transparent",
    color: "#3b82f6",
    border: "1px solid #3b82f6",
    borderRadius: 8,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "1rem",
  },
  section: {
    maxWidth: 820,
    margin: "0 auto",
    padding: "2.5rem 1.5rem",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: "1.5rem",
    fontWeight: 700,
    textAlign: "center" as const,
    marginBottom: "1.5rem",
  },
  sectionSub: {
    color: "#666",
    fontSize: "0.9rem",
    textAlign: "center" as const,
    marginTop: "1rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1rem",
  },
  feature: {
    backgroundColor: "#12121a",
    border: "1px solid #1e1e2e",
    borderRadius: 10,
    padding: "1.25rem",
  },
  featureTitle: {
    color: "#fff",
    fontSize: "1rem",
    fontWeight: 600,
    margin: "0 0 0.4rem",
  },
  featureDesc: {
    color: "#888",
    fontSize: "0.875rem",
    lineHeight: 1.55,
    margin: 0,
  },
  code: {
    backgroundColor: "#12121a",
    border: "1px solid #1e1e2e",
    borderRadius: 8,
    padding: "1.25rem",
    fontSize: "0.82rem",
    color: "#c8c8d0",
    overflowX: "auto" as const,
    lineHeight: 1.55,
  },
  showcase: {
    backgroundColor: "#12121a",
    border: "1px solid #1e1e2e",
    borderRadius: 12,
    padding: "2rem",
    textAlign: "center" as const,
  },
  showcaseTitle: {
    color: "#fff",
    fontSize: "1.35rem",
    fontWeight: 700,
    margin: "0 0 0.75rem",
  },
  showcaseDesc: {
    color: "#888",
    fontSize: "0.95rem",
    lineHeight: 1.6,
    maxWidth: 520,
    margin: "0 auto 1rem",
  },
  showcaseLink: {
    color: "#3b82f6",
    fontSize: "1rem",
    fontWeight: 600,
    textDecoration: "none",
  },
  endpointGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem",
  },
  endpointCol: {
    backgroundColor: "#12121a",
    border: "1px solid #1e1e2e",
    borderRadius: 10,
    padding: "1.25rem",
  },
  endpointLabel: {
    color: "#666",
    fontSize: "0.7rem",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    marginBottom: "0.5rem",
    marginTop: 0,
  },
  endpointItem: {
    color: "#aaa",
    fontSize: "0.82rem",
    margin: "0.3rem 0",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  },
  get: {
    color: "#22c55e",
    fontWeight: 700,
    fontSize: "0.7rem",
    marginRight: "0.4rem",
  },
  docsLink: {
    textAlign: "center" as const,
    marginTop: "1.5rem",
  },
  footer: {
    textAlign: "center" as const,
    color: "#555",
    fontSize: "0.85rem",
    padding: "2rem 1.5rem 3rem",
    borderTop: "1px solid #1e1e2e",
    maxWidth: 820,
    margin: "2rem auto 0",
  },
  link: {
    color: "#3b82f6",
    textDecoration: "none",
  },
};
