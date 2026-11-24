/**
 * Compatibility-preserving port of CongressWatch compute_score_components().
 * The six legacy component keys/maxima remain stable. wealth_gap is suspended:
 * campaign receipts are not personal wealth. Stored scores can differ because
 * upstream data, methodology, and rolling date windows change between refreshes.
 */
import type { MemberSummary, MemberDetail, Bill } from "./congress";
import { parseDateAny } from "./congress";

const NON_VOTING_STATES = new Set([
  "District of Columbia", "American Samoa", "Guam",
  "Northern Mariana Islands", "Puerto Rico", "Virgin Islands",
]);
const MIN_VOTES_FOR_ATTENDANCE = 20;

export interface ScoreComponent {
  score: number;
  max: number;
  detail: string;
}

export interface ScoreBreakdown {
  /** Sum of the six components below, capped at 100. */
  total: number;
  /** The value CongressWatch's pipeline computed and persisted. */
  stored: number;
  /** total - stored. Non-zero can reflect refresh lag, methodology changes or sliding windows. */
  drift: number;
  flags: string[];
  components: {
    trade_timing: ScoreComponent;
    wealth_gap: ScoreComponent;
    donor_alignment: ScoreComponent;
    alec_similarity: ScoreComponent;
    foreign_travel: ScoreComponent;
    attendance: ScoreComponent;
  };
}

/**
 * Python's round() is banker's rounding (half-to-even); JS Math.round is
 * half-up. round(2.5) is 2 in Python and 3 in JS. Match Python so our totals
 * agree with the pipeline's.
 */
function pyRound(n: number): number {
  const floor = Math.floor(n);
  const diff = n - floor;
  if (diff > 0.5) return floor + 1;
  if (diff < 0.5) return floor;
  return floor % 2 === 0 ? floor : floor + 1;
}

function daysAgoIso(days: number): string {
  const d = new Date(Date.now() - days * 86_400_000);
  return d.toISOString().slice(0, 10);
}

/**
 * Name-only/automatic SEC matches are not identity evidence. Fail closed for
 * legacy data and failed refreshes; preserve the original counts in the source.
 * Keep this predicate aligned with CongressWatch's verified-SEC-only policy.
 */
export function hasVerifiedSecSignals(member: MemberSummary): boolean {
  const cik = member.edgar_cik;
  const evidence = member.edgar_identity_evidence;
  const checks = member.edgar_identity_evidence_checks;
  // Match the site receipt validator, including original URL order and CIK.
  const httpsUrl = (value: unknown): boolean => {
    if (typeof value !== "string") return false;
    try {
      const url = new URL(value);
      return url.protocol === "https:" && !!url.hostname && !url.username && !url.password;
    } catch { return false; }
  };
  return member.edgar_identity_status === "verified"
    && typeof cik === "string" && cik.trim().length > 0
    && typeof member.edgar_identity_cik === "string"
    && member.edgar_identity_cik === cik
    && Array.isArray(evidence) && evidence.length > 0
    && evidence.every(httpsUrl)
    && Array.isArray(checks) && checks.length === evidence.length
    && checks.every((check, i) => check && check.url === evidence[i]
      && check.cik === member.edgar_identity_cik && check.status === "available"
      && httpsUrl(check.resolved_url)
      && typeof check.checked_at === "string" && !!check.checked_at
      && typeof check.sha256 === "string" && /^[a-f0-9]{64}$/.test(check.sha256))
    && member.edgar_data_status === "available"
    && member.edgar_status !== "query_failed"
    && typeof member.corporate_insider_signals === "number"
    && Number.isFinite(member.corporate_insider_signals)
    && member.corporate_insider_signals >= 0;
}

const BILL_ANALYSIS_VERSION = "official-prose-overlap-v2";
const SHA256 = /^[a-f0-9]{64}$/;

function isSha256(value: unknown): value is string {
  return typeof value === "string" && value.length === 64 && SHA256.test(value);
}

function finiteInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

export function eligibleBillText(bill: Bill): boolean {
  const source = bill.text_source;
  return bill.analysis_version === BILL_ANALYSIS_VERSION
    && bill.analysis_status === "analyzed"
    && source?.source_format === "govinfo_official_bill_xml"
    && source.extraction_version === "govinfo-legislative-body-v2"
    && typeof source.source_url === "string"
    && source.source_url.startsWith("https://www.govinfo.gov/")
    && isSha256(source.source_sha256)
    && isSha256(source.text_sha256);
}

export function validatedModelSimilarity(bill: Bill): number | null {
  if (!eligibleBillText(bill) || bill.model_analysis_status !== "analyzed") return null;
  const match = bill.alec_match;
  const evidence = match?.evidence;
  if (!finiteInRange(match?.similarity_score, 0, 1)
      || !evidence
      || evidence.target_text_sha256 !== bill.text_source?.text_sha256
      || !isSha256(evidence.matched_source_sha256)
      || !isSha256(evidence.matched_text_sha256)
      || !finiteInRange(evidence.longest_passage_words, 32, Number.MAX_VALUE)
      || !finiteInRange(evidence.target_shingle_coverage, 0, 1)
      || !finiteInRange(evidence.matched_shingle_coverage, 0, 1)) return null;
  return Math.max(evidence.target_shingle_coverage, evidence.matched_shingle_coverage) >= 0.2
    ? match.similarity_score : null;
}

export function eligibleModelSimilarity(bill: Bill): number {
  return validatedModelSimilarity(bill) ?? 0;
}

export function eligibleDonorAlignment(detail: MemberDetail): number {
  return detail.bills_analysis_version === BILL_ANALYSIS_VERSION
    && detail.donor_alignment_analysis_version === BILL_ANALYSIS_VERSION
    && detail.donor_alignment_status === "available"
    && finiteInRange(detail.donor_alignment_score, 0, 100)
    ? detail.donor_alignment_score : 0;
}

export function computeScore(
  member: MemberSummary,
  detail: MemberDetail | null,
): ScoreBreakdown {
  const d = detail ?? ({} as MemberDetail);

  const today = daysAgoIso(0);

  // 1. Activity, not demonstrated trade timing or wrongdoing.
  const verifiedSec = hasVerifiedSecSignals(member);
  const signals = verifiedSec ? member.corporate_insider_signals : 0;
  let tradeScore = 0;
  if (signals >= 3) tradeScore += 25;
  else if (signals === 2) tradeScore += 18;
  else if (signals === 1) tradeScore += 10;

  const trades = d.trades ?? [];
  let recentTrades = 0;
  if (trades.length) {
    const cutoff = daysAgoIso(365);
    recentTrades = trades.filter(
      (t) => {
        const date = parseDateAny(t.transaction_date);
        return date >= cutoff && date <= today;
      },
    ).length;
    if (recentTrades >= 20) tradeScore += 15;
    else if (recentTrades >= 10) tradeScore += 10;
    else if (recentTrades >= 5) tradeScore += 5;
  }
  tradeScore = Math.min(tradeScore, 25);

  // Keep the legacy key/max for API compatibility, but never infer personal
  // wealth from campaign fundraising.
  const wealthScore = 0;

  // The current site methodology suspends both components, even if legacy
  // or hypothetical fields claim validated donor/model results. No reweighting.
  const donorScore = 0;
  const alecScore = 0;

  // 5. Foreign travel (10) — trips departing within the last two years
  const travel = d.travel ?? [];
  let travelScore = 0;
  let recentTrips = 0;
  if (travel.length) {
    const cutoff = daysAgoIso(730);
    recentTrips = travel.filter(
      (t) => {
        const date = parseDateAny(t.departure_date);
        return t.filer_type !== "staff" && t.filer_type !== "unverified"
          && date >= cutoff && date <= today;
      },
    ).length;
    if (recentTrips >= 5) travelScore = 10;
    else if (recentTrips >= 3) travelScore = 7;
    else if (recentTrips >= 1) travelScore = 3;
  }

  // 6. Attendance (5) — missed-vote ratio
  const votes = d.votes ?? [];
  let attendanceScore = 0;
  let missRatio = 0;
  const delegate = member.chamber === "House" && NON_VOTING_STATES.has(member.state);
  if (!delegate && votes.length >= MIN_VOTES_FOR_ATTENDANCE) {
    const missed = votes.filter((v) =>
      ["not voting", "absent", ""].includes((v.position ?? "").toLowerCase()),
    ).length;
    missRatio = missed / votes.length;
    attendanceScore = Math.min(5, pyRound(missRatio * 20));
  }

  const total = Math.min(
    tradeScore +
      wealthScore +
      donorScore +
      alecScore +
      travelScore +
      attendanceScore,
    100,
  );

  const stored = member.score ?? 0;

  return {
    total,
    stored,
    drift: total - stored,
    flags: [
      ...(member.flags ?? []).filter((flag) => flag !== "trade"),
      ...(signals > 5 ? ["trade"] : []),
    ],
    components: {
      trade_timing: {
        score: tradeScore,
        max: 25,
        detail: verifiedSec
          ? `${signals} identity-verified EDGAR signal(s); ${recentTrades} PTR trade(s) in the last 365 days`
          : `SEC signals excluded: identity evidence or available retrieval not verified; ${recentTrades} PTR trade(s) in the last 365 days`,
      },
      wealth_gap: {
        score: wealthScore,
        max: 25,
        detail: "Unavailable: campaign receipts are not personal wealth; this component is suspended",
      },
      donor_alignment: {
        score: donorScore,
        max: 20,
        detail: "Unavailable: donor alignment methodology is suspended",
      },
      alec_similarity: {
        score: alecScore,
        max: 15,
        detail: "Unavailable: no verified primary model corpus; this component is suspended",
      },
      foreign_travel: {
        score: travelScore,
        max: 10,
        detail: `${recentTrips} member trip(s) in the last 730 days; explicit staff and unverified rows excluded`,
      },
      attendance: {
        score: attendanceScore,
        max: 5,
        detail: delegate
          ? "Not scored: non-voting delegate or Resident Commissioner"
          : votes.length < MIN_VOTES_FOR_ATTENDANCE
            ? `Not scored: fewer than ${MIN_VOTES_FOR_ATTENDANCE} recorded votes`
          : `Missed ${(missRatio * 100).toFixed(1)}% of ${votes.length} recorded votes`,
      },
    },
  };
}
