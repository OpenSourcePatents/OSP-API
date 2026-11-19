const { readFileSync } = require("node:fs");
const { runInNewContext } = require("node:vm");
const { test } = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");

function load(path, mocked = {}) {
  const mod = { exports: {} };
  const { outputText } = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  runInNewContext(outputText, {
    module: mod, exports: mod.exports, require: (key) => mocked[key] ?? require(key),
    process,
  }, { filename: path });
  return mod.exports;
}

const congress = load("lib/congress.ts");
const scoring = load("lib/scoring.ts", { "./congress": congress });
const version = "official-prose-overlap-v2";
const hash = "a".repeat(64);
const bill = {
  analysis_version: version,
  analysis_status: "analyzed",
  model_analysis_status: "analyzed",
  text_source: {
    source_format: "govinfo_official_bill_xml",
    extraction_version: "govinfo-legislative-body-v2",
    source_url: "https://www.govinfo.gov/content/pkg/example",
    source_sha256: hash, text_sha256: hash,
  },
  alec_best_similarity: 1,
  alec_match: { similarity_score: 0.8, evidence: {
    target_text_sha256: hash, matched_source_sha256: hash, matched_text_sha256: hash,
    longest_passage_words: 32, target_shingle_coverage: 0.2, matched_shingle_coverage: 0.1,
  } },
};

test("model similarity requires matching primary evidence, not a raw legacy score", () => {
  const { validatedModelSimilarity: check } = scoring;
  assert.equal(check(bill), 0.8);
  for (const change of [
    { analysis_version: "legacy" }, { analysis_status: "pending" },
    { model_analysis_status: "primary_model_corpus_unavailable" }, { alec_match: null },
    { text_source: { ...bill.text_source, source_url: "https://evil.govinfo.gov/" } },
    { text_source: { ...bill.text_source, source_sha256: hash + "\n" } },
  ]) assert.equal(check({ ...bill, ...change }), null);
  for (const change of [
    { target_text_sha256: "b".repeat(64) }, { matched_source_sha256: "bad" },
    { longest_passage_words: 31 }, { longest_passage_words: Infinity },
    { target_shingle_coverage: 0.199 }, { matched_shingle_coverage: true },
  ]) assert.equal(check({
    ...bill, alec_match: { ...bill.alec_match, evidence: { ...bill.alec_match.evidence, ...change } },
  }), null);
});

test("global bills filter does not return unavailable or unverified rows even at minimum zero", async () => {
  const route = load("app/api/v1/bills/route.ts", {
    "@/lib/aggregate": { getIndex: async () => ({ bills: [bill, { ...bill, alec_match: null }] }) },
    "@/lib/congress": congress,
    "@/lib/auth": { validateApiKey: async () => ({ valid: true }) },
    "@/lib/response": { paginated: (rows) => rows, err: (message) => { throw Error(message); } },
    "@/lib/scoring": scoring,
  });
  for (const [query, count] of [["", 2], ["?min_alec_similarity=0", 1], ["?min_alec_similarity=0.8", 1], ["?min_alec_similarity=0.9", 0]]) {
    const result = await route.GET({ nextUrl: new URL("https://example.test/api/v1/bills" + query) });
    assert.equal(result.length, count);
  }
});

test("donor alignment requires current versions, known availability, and finite bounds", () => {
  const detail = {
    bills_analysis_version: version, donor_alignment_analysis_version: version,
    donor_alignment_status: "available", donor_alignment_score: 100,
  };
  assert.equal(scoring.eligibleDonorAlignment(detail), 100);
  for (const change of [
    { bills_analysis_version: "legacy" }, { donor_alignment_analysis_version: undefined },
    { donor_alignment_status: "pending" }, { donor_alignment_score: NaN },
    { donor_alignment_score: 101 }, { donor_alignment_score: true },
  ]) assert.equal(scoring.eligibleDonorAlignment({ ...detail, ...change }), 0);
});
