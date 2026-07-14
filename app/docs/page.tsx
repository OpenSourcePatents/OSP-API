import type { Metadata } from "next";
import Link from "next/link";
import { C, F, accent, green } from "@/lib/theme";
import { StatusDot, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "API Reference - OSP Civic Data API",
};

// ── shared bits ──────────────────────────────────────────────

const codeBlock: React.CSSProperties = {
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 7,
  padding: 16,
  overflowX: "auto",
};
const pre: React.CSSProperties = {
  fontFamily: F.mono,
  fontSize: 13,
  color: C.codeInk,
  lineHeight: 1.5,
  margin: 0,
};
const inlineCode: React.CSSProperties = {
  fontFamily: F.mono,
  fontSize: 12,
  background: "#1a1a2a",
  padding: "2px 6px",
  borderRadius: 3,
  color: C.codeInk,
};
const body: React.CSSProperties = { fontFamily: F.body, fontSize: 14, color: "#aaa", lineHeight: 1.6 };
const linkStyle: React.CSSProperties = { color: C.accent, borderBottom: `1px dotted ${C.accent}`, textDecoration: "none" };

function Code({ children }: { children: string }) {
  return (
    <div style={codeBlock}>
      <pre style={pre}>{children}</pre>
    </div>
  );
}

interface Param {
  name: string;
  type: string;
  desc: string;
}

const label: React.CSSProperties = {
  fontFamily: F.display,
  fontSize: 9,
  fontWeight: 600,
  letterSpacing: 1.5,
  color: C.faint,
  textTransform: "uppercase",
  marginBottom: 8,
};
const th: React.CSSProperties = {
  textAlign: "left",
  padding: "6px 10px 6px 0",
  fontFamily: F.display,
  fontSize: 8,
  fontWeight: 600,
  letterSpacing: 1,
  color: C.faint,
  textTransform: "uppercase",
  borderBottom: `1px solid ${C.border}`,
};
const tdMono: React.CSSProperties = {
  padding: "5px 10px 5px 0",
  fontFamily: F.mono,
  fontSize: 12,
  color: C.text,
  borderBottom: "1px solid rgba(30,30,46,0.3)",
  verticalAlign: "top",
};
const tdDesc: React.CSSProperties = {
  padding: "5px 0",
  fontFamily: F.body,
  fontSize: 13,
  color: C.muted,
  borderBottom: "1px solid rgba(30,30,46,0.3)",
  verticalAlign: "top",
};

function Endpoint({
  path,
  auth,
  description,
  params,
  example,
}: {
  path: string;
  auth: boolean;
  description: string;
  params?: Param[];
  example?: string;
}) {
  const tagColor = auth ? C.amber : C.success;
  const tagBorder = auth ? "rgba(245,158,11,0.3)" : green(0.3);
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, overflow: "hidden", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <StatusDot size={5} />
          <span style={{ fontFamily: F.mono, fontSize: 8, color: accent(0.6), letterSpacing: 1 }}>LIVE</span>
        </div>
        <span
          style={{
            fontFamily: F.display,
            fontSize: 11,
            fontWeight: 700,
            color: C.success,
            letterSpacing: 0.5,
            background: green(0.1),
            padding: "2px 8px",
            borderRadius: 3,
          }}
        >
          GET
        </span>
        <code style={{ fontFamily: F.mono, fontSize: 13, color: C.text, fontWeight: 500 }}>{path}</code>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: F.display,
            fontSize: 9,
            color: tagColor,
            border: `1px solid ${tagBorder}`,
            borderRadius: 3,
            padding: "2px 8px",
            letterSpacing: 1,
          }}
        >
          {auth ? "AUTH" : "PUBLIC"}
        </span>
      </div>
      <div style={{ padding: 14 }}>
        <p style={{ ...body, marginBottom: params || example ? 12 : 0 }}>{description}</p>

        {params && params.length > 0 && (
          <>
            <p style={label}>QUERY PARAMETERS</p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 400 }}>
                <thead>
                  <tr>
                    <th style={th}>Name</th>
                    <th style={th}>Type</th>
                    <th style={{ ...th, paddingRight: 0 }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {params.map((p) => (
                    <tr key={p.name}>
                      <td style={tdMono}>{p.name}</td>
                      <td style={{ ...tdMono, color: C.faint }}>{p.type}</td>
                      <td style={tdDesc}>{p.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {example && (
          <>
            <p style={{ ...label, marginTop: params ? 14 : 0 }}>EXAMPLE RESPONSE</p>
            <div style={{ background: C.surfaceInk, border: `1px solid ${C.border}`, borderRadius: 5, padding: 12, overflowX: "auto" }}>
              <pre style={{ ...pre, fontSize: 11 }}>{example}</pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const MEMBER_ENDPOINTS: { path: string; desc: string }[] = [
  { path: "/api/v1/members/{bioguide_id}", desc: "The full vault for one member — every data block in a single object." },
  { path: "/api/v1/members/{bioguide_id}/score", desc: "Anomaly score with six weighted components, recomputed from live inputs. Returns stored, total, and drift." },
  { path: "/api/v1/members/{bioguide_id}/trades", desc: "Disclosed stock trades (STOCK Act periodic transaction reports), newest first. Filter by ticker, type." },
  { path: "/api/v1/members/{bioguide_id}/votes", desc: "Recorded floor votes via GovTrack." },
  { path: "/api/v1/members/{bioguide_id}/bills", desc: "Bills sponsored or cosponsored, with ALEC similarity and donor-interest analysis." },
  { path: "/api/v1/members/{bioguide_id}/travel", desc: "Privately sponsored foreign travel disclosures." },
  { path: "/api/v1/members/{bioguide_id}/donors", desc: "Top individual donors from FEC filings, largest first (native field: top_donors_list)." },
  { path: "/api/v1/members/{bioguide_id}/finances", desc: "Campaign finance summary. cash_on_hand is a preformatted string, not a number." },
];

const DATA_NOTES: Param[] = [
  { name: "cash_on_hand", type: "string", desc: "Preformatted currency, e.g. $1,234,567 — not a number." },
  { name: "amount (trades)", type: "string | null", desc: "A disclosure bracket, e.g. $15,001 - $50,000. Null on ~231 rows." },
  { name: "district", type: "string", desc: "Empty string for senators. Always a string, never a number." },
  { name: "total_raised", type: "number | null", desc: "Null for 69 of 536 members with no resolved FEC record." },
  { name: "dates", type: "string", desc: "Mostly ISO (YYYY-MM-DD); some legacy trade/travel rows are MM/DD/YYYY." },
];

const SECTION_CHIPS = ["Quick Start", "Authentication", "Rate Limits", "Response Format", "Data Notes", "Public", "Members", "Global"];

export default function DocsPage() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 64px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: F.display, fontSize: 32, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: C.white, marginBottom: 8 }}>
          API REFERENCE
        </h1>
        <p style={{ ...body, fontSize: 15 }}>
          Free, open REST API for congressional accountability data — campaign finance, stock trades, voting records,
          travel disclosures, and legislation. Data from{" "}
          <a href="https://congresswatch.vercel.app" style={linkStyle}>CongressWatch</a>, rebuilt daily from public records.
        </p>
      </div>

      {/* Section chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
        {SECTION_CHIPS.map((s) => (
          <span
            key={s}
            className="dc-chip"
            style={{
              fontFamily: F.display,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 1.2,
              color: C.muted,
              border: `1px solid ${C.border}`,
              borderRadius: 3,
              padding: "4px 10px",
              textTransform: "uppercase",
              cursor: "default",
              transition: "color 0.15s ease",
            }}
          >
            {s}
          </span>
        ))}
      </div>

      {/* Quick Start */}
      <div style={{ marginBottom: 32 }}>
        <Eyebrow>QUICK START</Eyebrow>
        <div style={{ marginTop: 12 }}>
          <Code>{`curl -H "X-API-Key: YOUR_KEY" \\
  https://api.opensourceforall.com/api/v1/members/P000197/trades`}</Code>
        </div>
        <p style={{ ...body, marginTop: 10 }}>
          <Link href="/signup" style={linkStyle}>Get a free API key →</Link>
        </p>
      </div>

      {/* Authentication */}
      <div style={{ marginBottom: 32 }}>
        <Eyebrow>AUTHENTICATION</Eyebrow>
        <p style={{ ...body, margin: "12px 0" }}>
          Send your key in the <code style={inlineCode}>X-API-Key</code> header. Two endpoints are public:{" "}
          <code style={inlineCode}>/v1/members</code> and <code style={inlineCode}>/v1/stats</code>. Invalid keys return{" "}
          <code style={inlineCode}>401</code>; exceeding your rate limit returns <code style={inlineCode}>429</code>.
        </p>
        <Code>X-API-Key: osp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</Code>
      </div>

      {/* Rate Limits */}
      <div style={{ marginBottom: 32 }}>
        <Eyebrow>RATE LIMITS</Eyebrow>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, overflow: "hidden", marginTop: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ ...th, padding: "10px 14px" }}>Tier</th>
                <th style={{ ...th, padding: "10px 14px" }}>Limit</th>
                <th style={{ ...th, padding: "10px 14px" }}>Who</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["free", "1,000 req/hr", "Anyone"],
                ["discounted", "10,000 req/hr", "Educators, nonprofits, researchers"],
                ["paid", "10,000 req/hr", "Commercial use"],
              ].map(([tier, limit, who], i, arr) => {
                const bb = i < arr.length - 1 ? "1px solid rgba(30,30,46,0.5)" : "none";
                return (
                  <tr key={tier}>
                    <td style={{ padding: "8px 14px", fontFamily: F.mono, color: C.text, borderBottom: bb }}>{tier}</td>
                    <td style={{ padding: "8px 14px", fontFamily: F.mono, color: C.muted, borderBottom: bb }}>{limit}</td>
                    <td style={{ padding: "8px 14px", fontFamily: F.body, color: C.muted, borderBottom: bb }}>{who}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Response Format */}
      <div style={{ marginBottom: 32 }}>
        <Eyebrow>RESPONSE FORMAT</Eyebrow>
        <p style={{ ...body, margin: "12px 0" }}>
          Lists are paginated and wrapped with a <code style={inlineCode}>meta</code> block; single objects return only{" "}
          <code style={inlineCode}>data</code>. Pagination: <code style={inlineCode}>page</code> (default 1),{" "}
          <code style={inlineCode}>per_page</code> (default 50, max 100).
        </p>
        <Code>{`{
  "data": [ ... ],
  "meta": { "page": 1, "per_page": 50, "total": 536 }
}`}</Code>
      </div>

      {/* Data Notes */}
      <div style={{ marginBottom: 32 }}>
        <Eyebrow>DATA NOTES</Eyebrow>
        <p style={{ ...body, margin: "12px 0" }}>
          Field names are CongressWatch&apos;s native ones, passed through unchanged. A few shapes will surprise you:
        </p>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, padding: "12px 14px", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}>
            <thead>
              <tr>
                <th style={th}>Field</th>
                <th style={th}>Type</th>
                <th style={{ ...th, paddingRight: 0 }}>Note</th>
              </tr>
            </thead>
            <tbody>
              {DATA_NOTES.map((p) => (
                <tr key={p.name}>
                  <td style={tdMono}>{p.name}</td>
                  <td style={{ ...tdMono, color: C.faint }}>{p.type}</td>
                  <td style={tdDesc}>{p.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ ...body, marginTop: 12 }}>
          Coverage is uneven by design — <code style={inlineCode}>trades</code> exists for 124 members,{" "}
          <code style={inlineCode}>travel</code> for 307. A member with no trades returns an empty list, not a 404.
        </p>
      </div>

      {/* Public endpoints */}
      <Eyebrow>PUBLIC ENDPOINTS</Eyebrow>
      <div style={{ marginTop: 16 }}>
        <Endpoint
          path="/api/v1/members"
          auth={false}
          description="The leaderboard — every sitting member with their anomaly score. No API key required."
          params={[
            { name: "chamber", type: "string", desc: "House or Senate" },
            { name: "party", type: "string", desc: "Republican, Democratic, Independent" },
            { name: "state", type: "string", desc: "Full state name" },
            { name: "min_score", type: "int", desc: "Minimum anomaly score (0–100)" },
            { name: "search", type: "string", desc: "Case-insensitive name substring" },
            { name: "sort", type: "string", desc: "field.direction, e.g. score.desc (score|name|state|total_raised)" },
          ]}
          example={`{
  "data": [{
    "id": "B001288",
    "name": "Cory A. Booker",
    "party": "Democratic",
    "state": "New Jersey",
    "chamber": "Senate",
    "score": 32,
    "total_raised": 5107416.85
  }],
  "meta": { "page": 1, "per_page": 50, "total": 9 }
}`}
        />
        <Endpoint
          path="/api/v1/stats"
          auth={false}
          description="Corpus-wide totals and the last pipeline run. No API key required."
          example={`{
  "data": {
    "total_members": 537,
    "members_with_scores": 509,
    "last_updated": "2026-07-13T09:18:39.759170"
  }
}`}
        />
      </div>

      {/* Member endpoints */}
      <div style={{ marginTop: 32 }}>
        <Eyebrow>MEMBER ENDPOINTS</Eyebrow>
        <p style={{ ...body, margin: "12px 0 16px" }}>
          Each takes a bioguide ID (e.g. <code style={inlineCode}>P000197</code>) and requires an API key.
        </p>
        {MEMBER_ENDPOINTS.map((ep) => (
          <Endpoint key={ep.path} path={ep.path} auth description={ep.desc} />
        ))}
      </div>

      {/* Global endpoints */}
      <div style={{ marginTop: 32 }}>
        <Eyebrow>GLOBAL ENDPOINTS</Eyebrow>
        <p style={{ ...body, margin: "12px 0 16px" }}>
          Cross-member queries. Each row carries the member it belongs to (bioguide_id, member_name, party, state, chamber).
        </p>
        <Endpoint
          path="/api/v1/trades"
          auth
          description="Every disclosed trade across all members (6,800+), newest first. Filter by ticker, type, chamber, party, state, start_date, end_date."
        />
        <Endpoint
          path="/api/v1/bills"
          auth
          description="Every tracked bill across all members (5,200+), newest first. Filter by congress, keyword, chamber, party, min_alec_similarity (0–1)."
        />
      </div>
    </div>
  );
}
