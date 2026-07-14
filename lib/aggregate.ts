/**
 * Cross-member indexes for the global /trades and /bills endpoints.
 *
 * CongressWatch publishes trades and bills only *inside* per-member detail files,
 * so there is no single document to page over. We build one by fanning out across
 * all 536 detail files (~15 MB, ~3s cold) and cache the flattened result in module
 * scope for an hour.
 *
 * This is the one place the bridge is doing real work to paper over a missing
 * upstream file. If CongressWatch's pipeline ever emits data/trades.json and
 * data/bills.json, delete this module and read them directly — see the
 * "Requested from CongressWatch" section of the README.
 */

import {
  getMembers,
  getMemberDetail,
  type Trade,
  type Bill,
  type MemberSummary,
} from "./congress";

/** Member identity stamped onto each flattened row. */
interface MemberRef {
  bioguide_id: string;
  member_name: string;
  party: string;
  state: string;
  chamber: string;
}

export type TradeRow = Trade & MemberRef;
export type BillRow = Bill & MemberRef;

interface Index {
  trades: TradeRow[];
  bills: BillRow[];
  built_at: string;
}

const TTL_MS = 3_600_000; // 1h, matching the CDN's s-maxage
const FANOUT = 25;

let cached: Index | null = null;
let cachedAt = 0;
// Concurrent cold requests must share one build, not each kick off their own.
let inFlight: Promise<Index> | null = null;

function ref(m: MemberSummary): MemberRef {
  return {
    bioguide_id: m.id,
    member_name: m.name,
    party: m.party,
    state: m.state,
    chamber: m.chamber,
  };
}

async function build(): Promise<Index> {
  const members = await getMembers();
  const trades: TradeRow[] = [];
  const bills: BillRow[] = [];

  const queue = [...members];
  async function worker() {
    for (;;) {
      const m = queue.pop();
      if (!m) return;
      const detail = await getMemberDetail(m.id);
      if (!detail) continue;
      const r = ref(m);
      for (const t of detail.trades ?? []) trades.push({ ...t, ...r });
      for (const b of detail.bills ?? []) bills.push({ ...b, ...r });
    }
  }
  await Promise.all(Array.from({ length: FANOUT }, worker));

  return { trades, bills, built_at: new Date().toISOString() };
}

export async function getIndex(): Promise<Index> {
  if (cached && Date.now() - cachedAt < TTL_MS) return cached;
  if (inFlight) return inFlight;

  inFlight = build()
    .then((idx) => {
      cached = idx;
      cachedAt = Date.now();
      return idx;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}
