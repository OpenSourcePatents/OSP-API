import { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation - OSP Civic Data API",
};

function Code({ children }: { children: string }) {
  return (
    <pre style={s.code}>{children}</pre>
  );
}

function Param({ name, type, desc }: { name: string; type: string; desc: string }) {
  return (
    <tr>
      <td style={s.paramName}><code style={s.inlineCode}>{name}</code></td>
      <td style={s.paramType}>{type}</td>
      <td style={s.paramDesc}>{desc}</td>
    </tr>
  );
}

function Endpoint({
  method,
  path,
  auth,
  description,
  params,
  example,
}: {
  method: string;
  path: string;
  auth: boolean;
  description: string;
  params?: { name: string; type: string; desc: string }[];
  example: string;
}) {
  return (
    <div style={s.endpoint}>
      <div style={s.endpointHeader}>
        <span style={s.method}>{method}</span>
        <code style={s.path}>{path}</code>
        {auth && <span style={s.authBadge}>Auth required</span>}
        {!auth && <span style={s.publicBadge}>Public</span>}
      </div>
      <p style={s.endpointDesc}>{description}</p>
      {params && params.length > 0 && (
        <div>
          <p style={s.paramHeader}>Query Parameters</p>
          <table style={s.paramTable}>
            <thead>
              <tr>
                <th style={s.th}>Name</th>
                <th style={s.th}>Type</th>
                <th style={s.th}>Description</th>
              </tr>
            </thead>
            <tbody>
              {params.map((p) => (
                <Param key={p.name} {...p} />
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p style={s.paramHeader}>Example Response</p>
      <Code>{example}</Code>
    </div>
  );
}

export default function DocsPage() {
  return (
    <div style={s.page}>
      <div style={s.container}>
        <header style={s.header}>
          <h1 style={s.title}>OSP Civic Data API</h1>
          <p style={s.subtitle}>
            Free, open-source REST API for congressional accountability data &mdash;
            campaign finance, stock trades, voting records, travel disclosures, and legislation.
          </p>
        </header>

        {/* Quick start */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Quick Start</h2>
          <p style={s.text}>
            1. <a href="/signup" style={s.link}>Get your free API key</a>
          </p>
          <p style={s.text}>2. Include it in every authenticated request:</p>
          <Code>{`curl -H "X-API-Key: osp_your_key_here" \\
  https://api.opensourceforall.com/api/v1/members/B000944/trades`}</Code>
        </section>

        {/* Auth */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Authentication</h2>
          <p style={s.text}>
            Pass your API key via the <code style={s.inlineCode}>X-API-Key</code> header.
            Public endpoints do not require a key. All other endpoints return{" "}
            <code style={s.inlineCode}>401</code> without a valid key.
          </p>
          <Code>{`// Authenticated request
fetch("/api/v1/members/B000944/trades", {
  headers: { "X-API-Key": "osp_your_key_here" }
})`}</Code>
        </section>

        {/* Rate limits */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Rate Limits</h2>
          <table style={s.paramTable}>
            <thead>
              <tr>
                <th style={s.th}>Tier</th>
                <th style={s.th}>Limit</th>
                <th style={s.th}>Window</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={s.paramName}>Free</td>
                <td style={s.paramType}>1,000 requests</td>
                <td style={s.paramDesc}>Sliding 1-hour window</td>
              </tr>
            </tbody>
          </table>
          <p style={s.text}>
            Exceeding the limit returns <code style={s.inlineCode}>401</code> with{" "}
            <code style={s.inlineCode}>{`{"error": "Rate limit exceeded (1000 requests/hour)"}`}</code>.
          </p>
        </section>

        {/* Response format */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Response Format</h2>
          <p style={s.text}>All responses are JSON. Lists include pagination metadata:</p>
          <Code>{`{
  "data": [...],
  "meta": { "page": 1, "per_page": 50, "total": 542 }
}`}</Code>
          <p style={s.text}>Single records:</p>
          <Code>{`{
  "data": { ... }
}`}</Code>
          <p style={s.text}>Errors:</p>
          <Code>{`{
  "error": "Missing X-API-Key header"
}`}</Code>
        </section>

        {/* Pagination */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Pagination</h2>
          <p style={s.text}>
            List endpoints accept <code style={s.inlineCode}>page</code> (default 1) and{" "}
            <code style={s.inlineCode}>per_page</code> (default 50, max 100).
          </p>
        </section>

        <hr style={s.divider} />

        {/* PUBLIC ENDPOINTS */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Public Endpoints</h2>

          <Endpoint
            method="GET"
            path="/api/v1/members"
            auth={false}
            description="List all members of Congress with optional filters."
            params={[
              { name: "chamber", type: "string", desc: '"senate" or "house"' },
              { name: "party", type: "string", desc: '"D", "R", or "I"' },
              { name: "state", type: "string", desc: "Two-letter state code (e.g. OH, CA)" },
              { name: "page", type: "integer", desc: "Page number (default: 1)" },
              { name: "per_page", type: "integer", desc: "Results per page (default: 50, max: 100)" },
            ]}
            example={`{
  "data": [
    {
      "id": "...",
      "bioguide_id": "B000944",
      "name": "Sherrod Brown",
      "party": "D",
      "state": "OH",
      "chamber": "senate",
      "district": null,
      "photo_url": "https://...",
      "start_date": "2007-01-04"
    }
  ],
  "meta": { "page": 1, "per_page": 50, "total": 542 }
}`}
          />

          <Endpoint
            method="GET"
            path="/api/v1/stats"
            auth={false}
            description="Aggregate counts and pipeline health timestamps."
            example={`{
  "data": {
    "member_count": 542,
    "trade_count": 18430,
    "bill_count": 52100,
    "last_updated": {
      "trades": "2026-04-05T02:00:00Z",
      "votes": "2026-04-05T03:00:00Z",
      "members": "2026-04-04T12:00:00Z"
    }
  }
}`}
          />
        </section>

        <hr style={s.divider} />

        {/* AUTHENTICATED: Member endpoints */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Member Endpoints</h2>
          <p style={s.text}>All member endpoints require authentication.</p>

          <Endpoint
            method="GET"
            path="/api/v1/members/:bioguide_id"
            auth={true}
            description="Full profile for a single member, including aggregate counts."
            example={`{
  "data": {
    "id": "...",
    "bioguide_id": "B000944",
    "name": "Sherrod Brown",
    "party": "D",
    "state": "OH",
    "chamber": "senate",
    "district": null,
    "photo_url": "https://...",
    "start_date": "2007-01-04",
    "trade_count": 12,
    "travel_count": 5,
    "donor_count": 3800,
    "vote_count": 4210
  }
}`}
          />

          <Endpoint
            method="GET"
            path="/api/v1/members/:bioguide_id/votes"
            auth={true}
            description="Voting record for a member."
            params={[
              { name: "page", type: "integer", desc: "Page number (default: 1)" },
              { name: "per_page", type: "integer", desc: "Results per page (default: 50, max: 100)" },
            ]}
            example={`{
  "data": [
    {
      "vote_id": "s123-2026",
      "date": "2026-03-15",
      "bill_id": "hr-1234",
      "bill_title": "Infrastructure Investment Act",
      "position": "Yes",
      "result": "Passed"
    }
  ],
  "meta": { "page": 1, "per_page": 50, "total": 4210 }
}`}
          />

          <Endpoint
            method="GET"
            path="/api/v1/members/:bioguide_id/bills"
            auth={true}
            description="Legislation sponsored or cosponsored by a member."
            params={[
              { name: "page", type: "integer", desc: "Page number (default: 1)" },
              { name: "per_page", type: "integer", desc: "Results per page (default: 50, max: 100)" },
              { name: "sponsored_only", type: "boolean", desc: '"true" to show only primary-sponsored bills' },
            ]}
            example={`{
  "data": [
    {
      "bill_id": "hr-1234",
      "title": "Infrastructure Investment Act",
      "introduced_date": "2026-01-15",
      "status": "introduced",
      "sponsor_type": "sponsor",
      "alec_similarity_score": 0.12,
      "cosponsor_count": 34
    }
  ],
  "meta": { "page": 1, "per_page": 50, "total": 87 }
}`}
          />

          <Endpoint
            method="GET"
            path="/api/v1/members/:bioguide_id/trades"
            auth={true}
            description="Stock trades disclosed by a member. Sorted by transaction date descending."
            params={[
              { name: "page", type: "integer", desc: "Page number (default: 1)" },
              { name: "per_page", type: "integer", desc: "Results per page (default: 50, max: 100)" },
              { name: "ticker", type: "string", desc: "Filter by stock ticker (case-insensitive)" },
              { name: "trade_type", type: "string", desc: '"purchase" or "sale"' },
            ]}
            example={`{
  "data": [
    {
      "transaction_date": "2026-03-01",
      "ticker": "NVDA",
      "asset_description": "NVIDIA Corp",
      "trade_type": "purchase",
      "amount_range": "$15,001 - $50,000",
      "owner": "spouse",
      "source": "periodic_transaction_report"
    }
  ],
  "meta": { "page": 1, "per_page": 50, "total": 12 }
}`}
          />

          <Endpoint
            method="GET"
            path="/api/v1/members/:bioguide_id/travel"
            auth={true}
            description="Privately funded foreign travel disclosures."
            params={[
              { name: "page", type: "integer", desc: "Page number (default: 1)" },
              { name: "per_page", type: "integer", desc: "Results per page (default: 50, max: 100)" },
            ]}
            example={`{
  "data": [
    {
      "destination_country": "Taiwan",
      "departure_date": "2026-01-10",
      "return_date": "2026-01-14",
      "sponsor": "Heritage Foundation",
      "total_cost": 12500.00,
      "funding_source": "Heritage Foundation"
    }
  ],
  "meta": { "page": 1, "per_page": 50, "total": 5 }
}`}
          />

          <Endpoint
            method="GET"
            path="/api/v1/members/:bioguide_id/donors"
            auth={true}
            description="Campaign donors for a member. Sorted by amount descending."
            params={[
              { name: "page", type: "integer", desc: "Page number (default: 1)" },
              { name: "per_page", type: "integer", desc: "Results per page (default: 50, max: 100)" },
            ]}
            example={`{
  "data": [
    {
      "contributor_name": "Jane Smith",
      "employer": "Acme Corp",
      "occupation": "CEO",
      "amount": 5800.00,
      "date": "2026-02-14"
    }
  ],
  "meta": { "page": 1, "per_page": 50, "total": 3800 }
}`}
          />

          <Endpoint
            method="GET"
            path="/api/v1/members/:bioguide_id/finances"
            auth={true}
            description="FEC campaign finance summary for a member."
            example={`{
  "data": {
    "total_raised": 14250000,
    "total_spent": 12800000,
    "cash_on_hand": 1450000,
    "fec_candidate_id": "S4OH00082",
    "cycle": "2026",
    "top_industries": [
      "Lawyers/Law Firms",
      "Securities & Investment",
      "Health Professionals"
    ]
  }
}`}
          />

          <Endpoint
            method="GET"
            path="/api/v1/members/:bioguide_id/score"
            auth={true}
            description="Anomaly and accountability scores for a member. Each score ranges from 0 to 1."
            example={`{
  "data": {
    "overall_score": 0.42,
    "voting_anomaly_score": 0.35,
    "financial_anomaly_score": 0.55,
    "trade_timing_score": 0.61,
    "donor_concentration_score": 0.28,
    "bill_similarity_score": 0.39,
    "travel_pattern_score": 0.31
  }
}`}
          />
        </section>

        <hr style={s.divider} />

        {/* AUTHENTICATED: Global endpoints */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Global Endpoints</h2>
          <p style={s.text}>Cross-member queries. Authentication required.</p>

          <Endpoint
            method="GET"
            path="/api/v1/trades"
            auth={true}
            description="All stock trades across all members. Sorted by transaction date descending."
            params={[
              { name: "ticker", type: "string", desc: "Filter by stock ticker (case-insensitive)" },
              { name: "chamber", type: "string", desc: '"senate" or "house"' },
              { name: "party", type: "string", desc: '"D", "R", or "I"' },
              { name: "start_date", type: "string", desc: "ISO date lower bound (YYYY-MM-DD)" },
              { name: "end_date", type: "string", desc: "ISO date upper bound (YYYY-MM-DD)" },
              { name: "page", type: "integer", desc: "Page number (default: 1)" },
              { name: "per_page", type: "integer", desc: "Results per page (default: 50, max: 100)" },
            ]}
            example={`{
  "data": [
    {
      "bioguide_id": "P000197",
      "member_name": "Nancy Pelosi",
      "chamber": "house",
      "party": "D",
      "state": "CA",
      "transaction_date": "2026-03-01",
      "ticker": "NVDA",
      "asset_description": "NVIDIA Corp",
      "trade_type": "purchase",
      "amount_range": "$1,000,001 - $5,000,000",
      "owner": "spouse",
      "source": "periodic_transaction_report"
    }
  ],
  "meta": { "page": 1, "per_page": 50, "total": 18430 }
}`}
          />

          <Endpoint
            method="GET"
            path="/api/v1/bills"
            auth={true}
            description="All legislation with optional filters. Supports full-text search on title."
            params={[
              { name: "congress", type: "string", desc: "Congress number (e.g. 119)" },
              { name: "alec_min_score", type: "float", desc: "Minimum ALEC similarity score (0-1)" },
              { name: "keyword", type: "string", desc: "Full-text search on bill title" },
              { name: "page", type: "integer", desc: "Page number (default: 1)" },
              { name: "per_page", type: "integer", desc: "Results per page (default: 50, max: 100)" },
            ]}
            example={`{
  "data": [
    {
      "bill_id": "hr-1234",
      "title": "Infrastructure Investment Act",
      "introduced_date": "2026-01-15",
      "status": "introduced",
      "bioguide_id": "B000944",
      "sponsor_type": "sponsor",
      "alec_similarity_score": 0.12,
      "cosponsor_count": 34,
      "congress": "119"
    }
  ],
  "meta": { "page": 1, "per_page": 50, "total": 52100 }
}`}
          />
        </section>

        <footer style={s.footer}>
          <p>
            <a href="/signup" style={s.link}>Get your API key</a>
            {" \u00b7 "}
            <a href="https://github.com/OpenSourcePatents/OSP-API" style={s.link}>GitHub</a>
          </p>
        </footer>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0a0a0f",
    color: "#e0e0e0",
    fontFamily: "system-ui, -apple-system, sans-serif",
    lineHeight: 1.6,
  },
  container: {
    maxWidth: 820,
    margin: "0 auto",
    padding: "3rem 1.5rem",
  },
  header: {
    marginBottom: "2rem",
  },
  title: {
    color: "#fff",
    fontSize: "2rem",
    fontWeight: 700,
    margin: 0,
  },
  subtitle: {
    color: "#888",
    fontSize: "1rem",
    marginTop: "0.5rem",
  },
  section: {
    marginBottom: "2.5rem",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: "1.35rem",
    fontWeight: 600,
    marginBottom: "0.75rem",
  },
  text: {
    color: "#aaa",
    fontSize: "0.95rem",
    marginBottom: "0.75rem",
  },
  link: {
    color: "#3b82f6",
    textDecoration: "none",
  },
  code: {
    backgroundColor: "#12121a",
    border: "1px solid #1e1e2e",
    borderRadius: 8,
    padding: "1rem",
    fontSize: "0.82rem",
    overflowX: "auto" as const,
    color: "#c8c8d0",
    lineHeight: 1.5,
    margin: "0.5rem 0 1rem",
  },
  inlineCode: {
    backgroundColor: "#1a1a2a",
    padding: "2px 6px",
    borderRadius: 4,
    fontSize: "0.85em",
    color: "#c8c8d0",
  },
  divider: {
    border: "none",
    borderTop: "1px solid #1e1e2e",
    margin: "2.5rem 0",
  },
  endpoint: {
    backgroundColor: "#12121a",
    border: "1px solid #1e1e2e",
    borderRadius: 10,
    padding: "1.25rem",
    marginBottom: "1.25rem",
  },
  endpointHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    flexWrap: "wrap" as const,
    marginBottom: "0.5rem",
  },
  method: {
    backgroundColor: "#22c55e",
    color: "#000",
    fontWeight: 700,
    fontSize: "0.75rem",
    padding: "2px 8px",
    borderRadius: 4,
    letterSpacing: "0.025em",
  },
  path: {
    color: "#e0e0e0",
    fontSize: "0.95rem",
    fontWeight: 500,
  },
  authBadge: {
    fontSize: "0.7rem",
    color: "#f59e0b",
    border: "1px solid #f59e0b",
    borderRadius: 4,
    padding: "1px 6px",
    marginLeft: "auto",
  },
  publicBadge: {
    fontSize: "0.7rem",
    color: "#22c55e",
    border: "1px solid #22c55e",
    borderRadius: 4,
    padding: "1px 6px",
    marginLeft: "auto",
  },
  endpointDesc: {
    color: "#aaa",
    fontSize: "0.9rem",
    margin: "0.25rem 0 0.75rem",
  },
  paramHeader: {
    color: "#888",
    fontSize: "0.8rem",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    marginBottom: "0.25rem",
    marginTop: "0.75rem",
  },
  paramTable: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "0.85rem",
  },
  th: {
    textAlign: "left" as const,
    color: "#666",
    fontWeight: 500,
    fontSize: "0.75rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    padding: "4px 8px 4px 0",
    borderBottom: "1px solid #1e1e2e",
  },
  paramName: {
    color: "#e0e0e0",
    padding: "4px 8px 4px 0",
    borderBottom: "1px solid #111118",
  },
  paramType: {
    color: "#666",
    padding: "4px 8px 4px 0",
    borderBottom: "1px solid #111118",
  },
  paramDesc: {
    color: "#888",
    padding: "4px 0",
    borderBottom: "1px solid #111118",
  },
  footer: {
    textAlign: "center" as const,
    color: "#555",
    fontSize: "0.85rem",
    marginTop: "3rem",
    paddingTop: "1.5rem",
    borderTop: "1px solid #1e1e2e",
  },
};
