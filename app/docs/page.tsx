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
            A free, open REST API for congressional accountability data &mdash;
            campaign finance, stock trades, voting records, travel disclosures,
            and legislation. Data comes from{" "}
            <a href="https://congresswatch.vercel.app" style={s.link}>CongressWatch</a>,
            which rebuilds it daily from public government records.
          </p>
        </header>

        <section style={s.section}>
          <h2 style={s.sectionTitle}>Quick Start</h2>
          <Code>{`curl -H "X-API-Key: YOUR_KEY" \\
  https://api.opensourceforall.com/api/v1/members/P000197/trades`}</Code>
          <p style={s.text}>
            <a href="/signup" style={s.link}>Get a free API key &rarr;</a>
          </p>
        </section>

        <section style={s.section}>
          <h2 style={s.sectionTitle}>Authentication</h2>
          <p style={s.text}>
            Send your key in the <code style={s.inlineCode}>X-API-Key</code> header.
            Requests without a valid key return <code style={s.inlineCode}>401</code>.
            Two endpoints are public and need no key:{" "}
            <code style={s.inlineCode}>/v1/members</code> (the list) and{" "}
            <code style={s.inlineCode}>/v1/stats</code>.
          </p>
          <Code>{`X-API-Key: osp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`}</Code>
        </section>

        <section style={s.section}>
          <h2 style={s.sectionTitle}>Rate Limits</h2>
          <table style={s.paramTable}>
            <thead>
              <tr>
                <th style={s.th}>Tier</th>
                <th style={s.th}>Limit</th>
                <th style={s.th}>Who</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={s.paramName}><code style={s.inlineCode}>free</code></td>
                <td style={s.paramType}>1,000 req/hr</td>
                <td style={s.paramDesc}>Anyone</td>
              </tr>
              <tr>
                <td style={s.paramName}><code style={s.inlineCode}>discounted</code></td>
                <td style={s.paramType}>10,000 req/hr</td>
                <td style={s.paramDesc}>Educators, nonprofits, researchers &mdash; apply by email</td>
              </tr>
              <tr>
                <td style={s.paramName}><code style={s.inlineCode}>paid</code></td>
                <td style={s.paramType}>10,000 req/hr</td>
                <td style={s.paramDesc}>Commercial use</td>
              </tr>
            </tbody>
          </table>
          <p style={s.text}>
            Exceeding your limit returns <code style={s.inlineCode}>401</code> with a
            rate-limit message. <a href="/pricing" style={s.link}>View tiers &rarr;</a>
          </p>
        </section>

        <section style={s.section}>
          <h2 style={s.sectionTitle}>Response Format</h2>
          <p style={s.text}>
            Lists are paginated and wrapped with a <code style={s.inlineCode}>meta</code> block:
          </p>
          <Code>{`{
  "data": [ ... ],
  "meta": { "page": 1, "per_page": 50, "total": 536 }
}`}</Code>
          <p style={s.text}>
            Single objects return only <code style={s.inlineCode}>data</code>; errors return{" "}
            <code style={s.inlineCode}>error</code>:
          </p>
          <Code>{`{ "data": { ... } }
{ "error": "Member not found" }`}</Code>
        </section>

        <section style={s.section}>
          <h2 style={s.sectionTitle}>Pagination</h2>
          <p style={s.text}>
            Every list endpoint accepts <code style={s.inlineCode}>page</code> (default 1)
            and <code style={s.inlineCode}>per_page</code> (default 50, max 100).
          </p>
        </section>

        <section style={s.section}>
          <h2 style={s.sectionTitle}>Data Notes</h2>
          <p style={s.text}>
            Field names are CongressWatch&apos;s native ones, passed through unchanged.
            A few shapes will surprise you if you assume otherwise:
          </p>
          <table style={s.paramTable}>
            <thead>
              <tr>
                <th style={s.th}>Field</th>
                <th style={s.th}>Type</th>
                <th style={s.th}>Note</th>
              </tr>
            </thead>
            <tbody>
              <Param
                name="cash_on_hand"
                type="string"
                desc="Preformatted currency, e.g. $1,234,567 — not a number."
              />
              <Param
                name="amount (trades)"
                type="string | null"
                desc="A disclosure bracket, e.g. $15,001 - $50,000. Null on roughly 231 rows."
              />
              <Param
                name="district"
                type="string"
                desc="Empty string for senators. Always a string, never a number."
              />
              <Param
                name="total_raised"
                type="number | null"
                desc="Null for 69 of 536 members with no resolved FEC record."
              />
              <Param
                name="dates"
                type="string"
                desc="Mostly ISO (YYYY-MM-DD); some legacy trade and travel rows are MM/DD/YYYY. Normalize before comparing."
              />
            </tbody>
          </table>
          <p style={s.text}>
            Coverage is uneven by design &mdash; only members with disclosures have them.{" "}
            <code style={s.inlineCode}>trades</code> exists for 124 members,{" "}
            <code style={s.inlineCode}>travel</code> for 307. A member with no trades
            returns an empty list, not a 404.
          </p>
        </section>

        <section style={s.section}>
          <h2 style={s.sectionTitle}>Public Endpoints</h2>

          <Endpoint
            method="GET"
            path="/api/v1/members"
            auth={false}
            description="The leaderboard — every sitting member with their anomaly score. No API key required."
            params={[
              { name: "chamber", type: "string", desc: "House or Senate" },
              { name: "party", type: "string", desc: "e.g. Republican, Democratic, Independent" },
              { name: "state", type: "string", desc: "Full state name, e.g. California" },
              { name: "min_score", type: "int", desc: "Only members scoring at least this (0-100)" },
              { name: "search", type: "string", desc: "Case-insensitive substring match on name" },
              { name: "sort", type: "string", desc: "field.direction — score | name | state | total_raised, asc | desc. e.g. score.desc" },
              { name: "page", type: "int", desc: "Default 1" },
              { name: "per_page", type: "int", desc: "Default 50, max 100" },
            ]}
            example={`GET /api/v1/members?chamber=Senate&min_score=25&sort=score.desc

{
  "data": [
    {
      "id": "B001288",
      "name": "Cory A. Booker",
      "party": "Democratic",
      "state": "New Jersey",
      "district": "",
      "chamber": "Senate",
      "photo_url": "https://bioguide.congress.gov/bioguide/photo/B/B001288.jpg",
      "term_start": "2013-10-31",
      "score": 32,
      "flags": [],
      "total_raised": 5107416.85,
      "pac_contributions": 0,
      "individual_contributions": 0,
      "corporate_insider_signals": 0,
      "edgar_status": "unresolved",
      "edgar_cik": null,
      "data_updated": "2026-07-14T03:53:04.451119"
    }
  ],
  "meta": { "page": 1, "per_page": 50, "total": 9 }
}`}
          />

          <Endpoint
            method="GET"
            path="/api/v1/stats"
            auth={false}
            description="Corpus-wide totals and the last pipeline run. No API key required."
            example={`GET /api/v1/stats

{
  "data": {
    "total_members": 537,
    "members_with_scores": 509,
    "high_anomaly": 0,
    "total_insider_signals": 0,
    "last_updated": "2026-07-13T09:18:39.759170"
  }
}`}
          />
        </section>

        <section style={s.section}>
          <h2 style={s.sectionTitle}>Member Endpoints</h2>
          <p style={s.text}>
            Each takes a bioguide ID (e.g. <code style={s.inlineCode}>P000197</code>) and
            requires an API key.
          </p>

          <Endpoint
            method="GET"
            path="/api/v1/members/{bioguide_id}"
            auth={true}
            description="The full vault for one member — every block below, in a single object."
            example={`GET /api/v1/members/P000197

{
  "data": {
    "id": "P000197",
    "name": "Nancy Pelosi",
    "party": "Democratic",
    "state": "California",
    "chamber": "House",
    "score": 13,
    "flags": [],
    "votes": [ ... ],
    "bills": [ ... ],
    "trades": [ ... ],
    "travel": [ ... ],
    "top_donors_list": [ ... ],
    "top_donor_industries": [ ... ],
    "total_raised": 2433666.32,
    "cash_on_hand": "$558,234",
    "bills_count": 10,
    "trade_count": 19,
    "donor_alignment_score": 15.0
  }
}`}
          />

          <Endpoint
            method="GET"
            path="/api/v1/members/{bioguide_id}/score"
            auth={true}
            description="The anomaly score with its six weighted components. CongressWatch persists only the final integer, so the breakdown is recomputed here from the same inputs its pipeline uses."
            example={`GET /api/v1/members/P000197/score

{
  "data": {
    "bioguide_id": "P000197",
    "name": "Nancy Pelosi",
    "total": 13,
    "stored": 13,
    "drift": 0,
    "flags": [],
    "components": {
      "trade_timing":    { "score": 10, "max": 25, "detail": "0 EDGAR insider signal(s); 19 PTR trade(s) in the last 365 days" },
      "wealth_gap":      { "score": 0,  "max": 25, "detail": "..." },
      "donor_alignment": { "score": 3,  "max": 20, "detail": "Donor alignment score 15.0" },
      "alec_similarity": { "score": 0,  "max": 15, "detail": "Peak ALEC model-bill similarity 0.06 across 10 bill(s)" },
      "foreign_travel":  { "score": 0,  "max": 10, "detail": "0 sponsored trip(s) in the last 730 days" },
      "attendance":      { "score": 0,  "max": 5,  "detail": "Missed 0.0% of 20 recorded votes" }
    }
  }
}

# "stored" is the score CongressWatch persisted. "total" is recomputed now, and
# "drift" is total - stored. Drift is usually 0, but can be non-zero: the score is
# only recomputed by CongressWatch's finance job, while votes, trades, and travel
# refresh on their own schedules — so a stored score can lag its own inputs.`}
          />

          <Endpoint
            method="GET"
            path="/api/v1/members/{bioguide_id}/trades"
            auth={true}
            description="Disclosed stock trades (STOCK Act periodic transaction reports), newest first."
            params={[
              { name: "ticker", type: "string", desc: "Exact ticker match, case-insensitive" },
              { name: "type", type: "string", desc: "Purchase, Sale, Sale (Partial), Exchange" },
              { name: "page", type: "int", desc: "Default 1" },
              { name: "per_page", type: "int", desc: "Default 50, max 100" },
            ]}
            example={`GET /api/v1/members/P000197/trades?ticker=NVDA

{
  "data": [
    {
      "transaction_date": "2026-04-15",
      "owner": "Spouse",
      "ticker": "NVDA",
      "asset_description": "NVIDIA Corporation - Common Stock",
      "asset_type": "Stock",
      "type": "Purchase",
      "amount": "$1,000,001 - $5,000,000",
      "comment": "--",
      "ptr_link": "https://disclosures-clerk.house.gov/public_disc/ptr-pdfs/..."
    }
  ],
  "meta": { "page": 1, "per_page": 50, "total": 1 }
}`}
          />

          <Endpoint
            method="GET"
            path="/api/v1/members/{bioguide_id}/votes"
            auth={true}
            description="Recorded floor votes, via GovTrack."
            example={`GET /api/v1/members/P000197/votes

{
  "data": [
    {
      "bill": "H.Res. 1399: Directing the Committee on Ethics...",
      "question_text": "",
      "date": "2026-06-30",
      "position": "Yea",
      "result": "Passed",
      "chamber": "House",
      "url": "https://www.govtrack.us/congress/votes/119-2026/h233"
    }
  ],
  "meta": { "page": 1, "per_page": 50, "total": 20 }
}`}
          />

          <Endpoint
            method="GET"
            path="/api/v1/members/{bioguide_id}/bills"
            auth={true}
            description="Bills the member sponsored or cosponsored, with ALEC model-bill similarity and donor-interest analysis."
            example={`GET /api/v1/members/P000197/bills

{
  "data": [
    {
      "bill_id": "HR7895-119",
      "title": "PBM Kickback Prohibition Act",
      "type": "HR",
      "number": "7895",
      "congress": 119,
      "introduced_date": "2026-03-12",
      "latest_action": "Referred to the House Committee on Education and Workforce.",
      "url": "https://api.congress.gov/v3/bill/119/hr/7895?format=json",
      "keywords": ["covered", "employee", "retirement"],
      "has_text": true,
      "similarity_score": null,
      "alec_best_similarity": 0.1,
      "match_type": null,
      "alec_match": null,
      "similar_member_bills": [],
      "cosponsors": [],
      "donor_interest": {
        "match": true,
        "matched_industries": ["Healthcare"],
        "keyword_hits": {}
      }
    }
  ],
  "meta": { "page": 1, "per_page": 50, "total": 10 }
}`}
          />

          <Endpoint
            method="GET"
            path="/api/v1/members/{bioguide_id}/travel"
            auth={true}
            description="Privately sponsored foreign travel disclosures."
            example={`GET /api/v1/members/A000372/travel

{
  "data": [
    {
      "destination_country": "Israel",
      "departure_date": "2023-02-17",
      "return_date": "2023-02-26",
      "sponsor": "U.S. Israel Education Association (USIEA)",
      "traveler": "Rick Allen",
      "filer_type": "member",
      "total_cost": 0.0,
      "currency": "USD",
      "doc_id": "500025987",
      "source_doc": "https://disclosures-clerk.house.gov/gtimages/MT/..."
    }
  ],
  "meta": { "page": 1, "per_page": 50, "total": 1 }
}`}
          />

          <Endpoint
            method="GET"
            path="/api/v1/members/{bioguide_id}/donors"
            auth={true}
            description="Top individual donors from FEC filings, largest first. CongressWatch's native name for this list is top_donors_list."
            example={`GET /api/v1/members/P000197/donors

{
  "data": [
    {
      "name": "ALLEN, BETTY J",
      "employer": "VITA-RX",
      "occupation": "RETIRED/PART-TIME ACCTS PAYABLE",
      "amount": 2400.0,
      "date": "2010-04-19"
    }
  ],
  "meta": { "page": 1, "per_page": 50, "total": 20 }
}`}
          />

          <Endpoint
            method="GET"
            path="/api/v1/members/{bioguide_id}/finances"
            auth={true}
            description="Campaign finance summary. Note that cash_on_hand is a preformatted string, not a number."
            example={`GET /api/v1/members/P000197/finances

{
  "data": {
    "bioguide_id": "P000197",
    "fec_candidate_id": "H0CA05035",
    "fec_committee_ids": ["C00213512"],
    "fec_cycle": 2026,
    "total_raised": 2433666.32,
    "total_raised_display": "$2,433,666",
    "total_spent": 1875432.10,
    "cash_on_hand": "$558,234",
    "pac_contributions": 0,
    "individual_contributions": 2433666.32,
    "top_donor_industries": ["Healthcare"],
    "corporate_insider_signals": 0,
    "edgar_status": "unresolved",
    "edgar_signal_type": "corporate_insider",
    "edgar_cik": null
  }
}`}
          />
        </section>

        <section style={s.section}>
          <h2 style={s.sectionTitle}>Global Endpoints</h2>
          <p style={s.text}>
            Cross-member queries. Every row carries the member it belongs to
            (<code style={s.inlineCode}>bioguide_id</code>,{" "}
            <code style={s.inlineCode}>member_name</code>,{" "}
            <code style={s.inlineCode}>party</code>,{" "}
            <code style={s.inlineCode}>state</code>,{" "}
            <code style={s.inlineCode}>chamber</code>) alongside its own fields.
          </p>

          <Endpoint
            method="GET"
            path="/api/v1/trades"
            auth={true}
            description="Every disclosed trade across all members (6,800+), newest first."
            params={[
              { name: "ticker", type: "string", desc: "Exact ticker match, case-insensitive" },
              { name: "type", type: "string", desc: "Purchase, Sale, Sale (Partial), Exchange" },
              { name: "chamber", type: "string", desc: "House or Senate" },
              { name: "party", type: "string", desc: "Party of the trading member" },
              { name: "state", type: "string", desc: "Full state name" },
              { name: "start_date", type: "date", desc: "Transactions on or after (YYYY-MM-DD)" },
              { name: "end_date", type: "date", desc: "Transactions on or before (YYYY-MM-DD)" },
              { name: "page", type: "int", desc: "Default 1" },
              { name: "per_page", type: "int", desc: "Default 50, max 100" },
            ]}
            example={`GET /api/v1/trades?ticker=NVDA&type=Purchase

{
  "data": [
    {
      "transaction_date": "2026-04-15",
      "owner": "Self",
      "ticker": "NVDA",
      "asset_description": "NVIDIA Corporation - Common Stock",
      "asset_type": "Stock",
      "type": "Purchase",
      "amount": "$1,001 - $15,000",
      "comment": "--",
      "ptr_link": "https://disclosures-clerk.house.gov/...",
      "bioguide_id": "M001227",
      "member_name": "John J. McGuire",
      "party": "Republican",
      "state": "Virginia",
      "chamber": "House"
    }
  ],
  "meta": { "page": 1, "per_page": 50, "total": 36 }
}`}
          />

          <Endpoint
            method="GET"
            path="/api/v1/bills"
            auth={true}
            description="Every tracked bill across all members (5,200+), newest first."
            params={[
              { name: "congress", type: "int", desc: "Congress number, e.g. 119" },
              { name: "keyword", type: "string", desc: "Substring match on title or extracted keywords" },
              { name: "chamber", type: "string", desc: "House or Senate" },
              { name: "party", type: "string", desc: "Party of the sponsoring member" },
              { name: "min_alec_similarity", type: "float", desc: "Peak ALEC model-bill similarity, 0-1 (e.g. 0.3)" },
              { name: "page", type: "int", desc: "Default 1" },
              { name: "per_page", type: "int", desc: "Default 50, max 100" },
            ]}
            example={`GET /api/v1/bills?congress=119&min_alec_similarity=0.3

{
  "data": [
    {
      "bill_id": "HR9368-119",
      "title": "Voter ID Act",
      "type": "HR",
      "number": "9368",
      "congress": 119,
      "introduced_date": "2026-05-02",
      "alec_best_similarity": 0.313,
      "alec_match": null,
      "keywords": ["voter", "identification"],
      "bioguide_id": "S001234",
      "member_name": "Example Member",
      "party": "Republican",
      "state": "Texas",
      "chamber": "House"
    }
  ],
  "meta": { "page": 1, "per_page": 50, "total": 4 }
}`}
          />
        </section>

        <div style={s.divider} />

        <footer style={s.footer}>
          <p style={s.text}>
            Data from{" "}
            <a href="https://congresswatch.vercel.app" style={s.link}>CongressWatch</a>
            {" "}&mdash; 100% public records (Congress.gov, FEC, SEC EDGAR, House and
            Senate eFD, GovTrack, LegiScan). AGPL-3.0.{" "}
            <a href="/signup" style={s.link}>Get an API key</a>
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
