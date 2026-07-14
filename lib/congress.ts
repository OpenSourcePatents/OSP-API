/**
 * CongressWatch data client.
 *
 * Replaces the retired Congress Supabase project. CongressWatch's daily pipeline
 * commits its output as static JSON, which Vercel serves from its CDN with
 * `s-maxage=3600, stale-while-revalidate=86400`. We read that directly — there is
 * no database in this path.
 *
 * Field names below are CongressWatch's native ones and are served through to API
 * consumers unchanged. Two shapes to be aware of:
 *   - Detail files are FLAT. There is no `finance` or `donors` sub-object; fields
 *     like `total_raised` and `top_donors_list` sit at the top level.
 *   - Coverage is uneven. `trades` appears in 124/542 files, `travel` in 307,
 *     `cash_on_hand` in 401. Everything optional is genuinely optional.
 */

const BASE =
  process.env.CONGRESS_DATA_URL ?? "https://congresswatch.vercel.app/data";

// Matches CongressWatch's own CDN s-maxage. The pipeline runs daily, so an hour
// of staleness is well within tolerance and keeps us off the origin.
const REVALIDATE = 3600;

export interface MemberSummary {
  id: string;
  name: string;
  party: string;
  state: string;
  /** "" for senators. Always a string, never a number. */
  district: string;
  chamber: string;
  photo_url: string;
  term_start: string;
  data_updated: string;
  edgar_status: string;
  edgar_cik: string | null;
  corporate_insider_signals: number;
  score: number;
  flags: string[];
  /** null for 69 of 536 members — no FEC record resolved. */
  total_raised: number | null;
  pac_contributions: number | null;
  individual_contributions: number | null;
}

export interface Vote {
  bill: string;
  question_text: string;
  date: string;
  position: string;
  result: string;
  chamber: string;
  url: string;
}

export interface AlecMatch {
  similarity_score?: number;
  [k: string]: unknown;
}

export interface Bill {
  bill_id: string;
  title: string;
  type: string;
  number: string;
  congress: number;
  introduced_date: string;
  latest_action: string;
  url: string;
  keywords: string[];
  has_text: boolean;
  similarity_score: number | null;
  alec_best_similarity: number | null;
  match_type: string | null;
  alec_match: AlecMatch | null;
  similar_member_bills: unknown[];
  cosponsors: string[];
  donor_interest: {
    match: boolean;
    matched_industries: string[];
    keyword_hits: Record<string, unknown>;
  } | null;
}

export interface Trade {
  transaction_date: string;
  owner: string;
  ticker: string;
  asset_description: string;
  asset_type: string;
  /** Disclosed as a bracket string, e.g. "$15,001 - $50,000". Null in ~231 rows. */
  type: string;
  amount: string | null;
  comment: string;
  ptr_link: string;
}

export interface Travel {
  destination_country: string;
  departure_date: string;
  return_date: string;
  sponsor: string;
  traveler: string;
  filer_type: string;
  total_cost: number;
  currency: string;
  doc_id: string;
  source_doc: string;
}

export interface Donor {
  name: string;
  employer: string;
  occupation: string;
  amount: number;
  date: string;
}

export interface MemberDetail extends MemberSummary {
  last_updated?: string;

  votes?: Vote[];
  govtrack_id?: string | number;
  votes_updated?: string;
  votes_status?: string;
  votes_fail_count?: number;

  bills?: Bill[];
  bills_updated?: string;
  bills_count?: number;
  donor_alignment_score?: number;
  alec_match_count?: number;
  donor_match_count?: number;

  trades?: Trade[];
  trades_updated?: string;
  trade_count?: number;
  latest_trade_date?: string;

  travel?: Travel[];
  travel_updated?: string;
  travel_count?: number;

  fec_candidate_id?: string;
  fec_committee_ids?: string[];
  fec_cycle?: number;
  total_spent?: number | null;
  /** Disclosed as a formatted string, e.g. "$1,234,567". Not a number. */
  cash_on_hand?: string | null;
  total_raised_display?: string;
  edgar_signal_type?: string;

  top_donors_list?: Donor[];
  top_donor_industries?: string[];
  donors_updated?: string;
}

export interface Stats {
  total_members: number;
  members_with_scores: number;
  high_anomaly: number;
  total_insider_signals: number;
  last_updated: string;
}

class NotFound extends Error {}
export { NotFound };

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/${path}`, {
    next: { revalidate: REVALIDATE },
  });

  if (res.status === 404) throw new NotFound(path);
  if (!res.ok) {
    throw new Error(`CongressWatch fetch failed: ${path} (${res.status})`);
  }
  return (await res.json()) as T;
}

export function getMembers(): Promise<MemberSummary[]> {
  return getJson<MemberSummary[]>("members.json");
}

/** Returns null when the member has no detail file. */
export async function getMemberDetail(
  bioguideId: string,
): Promise<MemberDetail | null> {
  // Guard against path traversal — the id is interpolated into a URL path.
  if (!/^[A-Za-z0-9]+$/.test(bioguideId)) return null;
  try {
    return await getJson<MemberDetail>(`details/${bioguideId}.json`);
  } catch (e) {
    if (e instanceof NotFound) return null;
    throw e;
  }
}

export function getStats(): Promise<Stats> {
  return getJson<Stats>("stats.json");
}

// ── query helpers ────────────────────────────────────────────────────────────

export interface Page<T> {
  rows: T[];
  total: number;
}

/** Slices an in-memory array the way the old Supabase .range() did. */
export function paginate<T>(rows: T[], page: number, perPage: number): Page<T> {
  const offset = (page - 1) * perPage;
  return { rows: rows.slice(offset, offset + perPage), total: rows.length };
}

export const MEMBER_SORT_FIELDS = [
  "score",
  "name",
  "state",
  "total_raised",
] as const;

/**
 * Sorts by `field.direction`, e.g. "score.desc". Members with a null value for
 * the sort field always sort last, regardless of direction — a member with no
 * FEC record shouldn't top a "lowest total_raised" query.
 */
export function sortMembers(
  rows: MemberSummary[],
  sort: string | null,
): MemberSummary[] {
  if (!sort) return rows;

  const [field, dir = "asc"] = sort.split(".");
  if (!(MEMBER_SORT_FIELDS as readonly string[]).includes(field)) return rows;

  const desc = dir.toLowerCase() === "desc";
  const key = field as keyof MemberSummary;

  return [...rows].sort((a, b) => {
    const av = a[key];
    const bv = b[key];

    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;

    let cmp: number;
    if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
    else cmp = String(av).localeCompare(String(bv));

    return desc ? -cmp : cmp;
  });
}

export interface MemberFilters {
  chamber?: string | null;
  party?: string | null;
  state?: string | null;
  minScore?: number | null;
  search?: string | null;
}

export function filterMembers(
  rows: MemberSummary[],
  f: MemberFilters,
): MemberSummary[] {
  return rows.filter((m) => {
    if (f.chamber && m.chamber?.toLowerCase() !== f.chamber.toLowerCase())
      return false;
    if (f.party && m.party?.toLowerCase() !== f.party.toLowerCase())
      return false;
    if (f.state && m.state?.toLowerCase() !== f.state.toLowerCase())
      return false;
    if (f.minScore != null && (m.score ?? 0) < f.minScore) return false;
    if (f.search && !m.name?.toLowerCase().includes(f.search.toLowerCase()))
      return false;
    return true;
  });
}

/**
 * CongressWatch dates are mostly ISO (YYYY-MM-DD) but legacy trade and travel
 * rows can be MM/DD/YYYY. Normalize to ISO before any comparison.
 */
export function parseDateAny(value: string | null | undefined): string {
  if (!value) return "";
  const s = value.trim();
  const slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    const [, mm, dd, yyyy] = slash;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  return s.slice(0, 10);
}
