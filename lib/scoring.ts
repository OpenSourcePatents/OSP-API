/**
 * Anomaly score — TypeScript port of `compute_score()` in CongressWatch's
 * fetch_finance.py (line 312).
 *
 * CongressWatch persists only the final integer `score` (0-100) and `flags[]`;
 * the six component sub-scores are thrown away. But every *input* to the formula
 * survives in the member + detail JSON, so we recompute the components here to
 * serve a breakdown. The components sum to the same total the pipeline stored.
 *
 * Verified faithful: running CongressWatch's own compute_score() against the same
 * live JSON produces identical totals to this function.
 *
 * `total` can still differ from `stored`, for two reasons — both upstream, neither
 * a porting error:
 *
 *   1. Pipeline lag. `score` is only recomputed by fetch_finance.py, but votes,
 *      trades, and travel are refreshed by their own separate cron jobs. When the
 *      votes job runs and the finance job hasn't yet, the stored score is stale
 *      with respect to the very data it was derived from. (Observed: Tim Scott,
 *      stored 28 vs 31 recomputed, after a GovTrack vote refresh.)
 *   2. Sliding windows. Two signals are relative to "now" (trades in the last 365
 *      days, travel in the last 730), so they shift even when no data changes.
 *
 * `stored` and `drift` are returned alongside `total` so consumers can see this
 * rather than silently getting a number that disagrees with the CongressWatch site.
 */

import type { MemberSummary, MemberDetail } from "./congress";
import { parseDateAny } from "./congress";

const ANNUAL_SALARY = 174_000; // Congressional salary baseline

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
  /** total - stored. Non-zero means a recency window has slid since the run. */
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

export function computeScore(
  member: MemberSummary,
  detail: MemberDetail | null,
): ScoreBreakdown {
  const d = detail ?? ({} as MemberDetail);

  // 1. Stock trade timing (25) — SEC EDGAR signals + PTR trade frequency
  const signals = member.corporate_insider_signals ?? 0;
  let tradeScore = 0;
  if (signals >= 3) tradeScore += 25;
  else if (signals === 2) tradeScore += 18;
  else if (signals === 1) tradeScore += 10;

  const trades = d.trades ?? [];
  let recentTrades = 0;
  if (trades.length) {
    const cutoff = daysAgoIso(365);
    recentTrades = trades.filter(
      (t) => parseDateAny(t.transaction_date) >= cutoff,
    ).length;
    if (recentTrades >= 20) tradeScore += 15;
    else if (recentTrades >= 10) tradeScore += 10;
    else if (recentTrades >= 5) tradeScore += 5;
  }
  tradeScore = Math.min(tradeScore, 25);

  // 2. Wealth gap (25) — estimated wealth vs cumulative congressional salary
  let wealthScore = 0;
  let gap = 0;
  const totalRaised = member.total_raised ?? 0;
  if (totalRaised > 0) {
    const estWealth = totalRaised * 0.45;
    const startYear = parseInt((member.term_start ?? "2010").slice(0, 4), 10);
    const years = Number.isNaN(startYear)
      ? 10
      : Math.max(1, new Date().getFullYear() - startYear);
    gap = estWealth - years * ANNUAL_SALARY;
    if (gap > 5_000_000) wealthScore = 25;
    else if (gap > 2_000_000) wealthScore = 20;
    else if (gap > 500_000) wealthScore = 15;
    else if (gap > 100_000) wealthScore = 10;
    else if (gap > 0) wealthScore = 5;
  }

  // 3. Donor-vote alignment (20) — from the bills pipeline
  const donorAlignment = d.donor_alignment_score ?? 0;
  const donorScore = Math.min(20, pyRound(donorAlignment * 0.2));

  // 4. Bill authorship / ALEC similarity (15)
  const bills = d.bills ?? [];
  let maxAlec = 0;
  for (const b of bills) {
    const matched = b.alec_match?.similarity_score ?? 0;
    if (matched > maxAlec) maxAlec = matched;
    const raw = b.alec_best_similarity ?? 0;
    if (raw > maxAlec) maxAlec = raw;
  }
  let alecScore = 0;
  if (maxAlec >= 0.8) alecScore = 15;
  else if (maxAlec >= 0.65) alecScore = 11;
  else if (maxAlec >= 0.5) alecScore = 8;
  else if (maxAlec >= 0.35) alecScore = 4;

  // 5. Foreign travel (10) — trips departing within the last two years
  const travel = d.travel ?? [];
  let travelScore = 0;
  let recentTrips = 0;
  if (travel.length) {
    const cutoff = daysAgoIso(730);
    recentTrips = travel.filter(
      (t) => parseDateAny(t.departure_date) >= cutoff,
    ).length;
    if (recentTrips >= 5) travelScore = 10;
    else if (recentTrips >= 3) travelScore = 7;
    else if (recentTrips >= 1) travelScore = 3;
  }

  // 6. Attendance (5) — missed-vote ratio
  const votes = d.votes ?? [];
  let attendanceScore = 0;
  let missRatio = 0;
  if (votes.length) {
    const missed = votes.filter((v) =>
      ["not voting", "absent", ""].includes((v.position ?? "").toLowerCase()),
    ).length;
    missRatio = missed / votes.length;
    attendanceScore = Math.min(5, pyRound(missRatio * 50));
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
    flags: member.flags ?? [],
    components: {
      trade_timing: {
        score: tradeScore,
        max: 25,
        detail: `${signals} EDGAR insider signal(s); ${recentTrades} PTR trade(s) in the last 365 days`,
      },
      wealth_gap: {
        score: wealthScore,
        max: 25,
        detail:
          totalRaised > 0
            ? `Estimated wealth (45% of $${Math.round(totalRaised).toLocaleString()} raised) exceeds cumulative salary by $${Math.round(gap).toLocaleString()}`
            : "No FEC total_raised on record",
      },
      donor_alignment: {
        score: donorScore,
        max: 20,
        detail: `Donor alignment score ${donorAlignment.toFixed(1)}`,
      },
      alec_similarity: {
        score: alecScore,
        max: 15,
        detail: `Peak ALEC model-bill similarity ${maxAlec.toFixed(2)} across ${bills.length} bill(s)`,
      },
      foreign_travel: {
        score: travelScore,
        max: 10,
        detail: `${recentTrips} sponsored trip(s) in the last 730 days`,
      },
      attendance: {
        score: attendanceScore,
        max: 5,
        detail: votes.length
          ? `Missed ${(missRatio * 100).toFixed(1)}% of ${votes.length} recorded votes`
          : "No recorded votes",
      },
    },
  };
}
