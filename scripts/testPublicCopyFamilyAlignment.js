"use strict";

const assert = require("assert");
const crypto = require("crypto");

const { WORKSHEET_PUBLIC_COPY } = require("../config/worksheetPublicCopy");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { getMasterWorksheetCatalog } = require("../services/worksheetCatalogService");
const { buildAnswerKeyItems } = require("../renderers/pdfRenderer");

const STORY_CEILINGS = Object.freeze({
  g1_addition_word_problems: 20,
  g2_addition_word_problems_within_100: 100,
  grade3_addition_subtraction_word_problems_addition_word_problem: 100,
  grade4_addition_subtraction_word_problems_addition_word_problem: 5000,
  grade5_addition_subtraction_word_problems_addition_word_problem: 100000
});

const BASELINE_NON_COPY_HASHES = Object.freeze({
  g1_addition_facts_within_20: "57ff31bb8e88f4f15b5a2c2f09e75d8f56bc45de8784115cab3122c474c0be38",
  g2_addition_fluency_within_100: "2627c97bedbf2fb2de98756478011b50238ce07810a3e4a65e0d52909d4871cd",
  g1_fact_families_within_20: "ca06eee251e77e477f5c564459e5c326f80a5bec16c750f95aaf916a2f148189",
  grade2_addition_subtraction_facts_fact_family: "e2847779941f84929cca4a09f2faab544762bc8edb8c877cd4e22da1f817639d",
  grade3_addition_subtraction_facts_fact_family: "28ea3031cabdea672404bc6227e2bab62b20589fda692e582fcd9ac4b49e4ce4",
  g1_addition_word_problems: "381b932dcf2ea34b9492d17e88b368af48462378576bd00db56f164bb2d1a01c",
  g2_addition_word_problems_within_100: "3f95dd588e25ea47866ba67e2e045a39d1ebefcd016caa2350dafbbcbeaa94b2",
  grade3_addition_subtraction_word_problems_addition_word_problem: "ac37a031f21725846034c948d32ccd6f71946e1ed211f0ab7f9c70f85a5d1ada",
  grade4_addition_subtraction_word_problems_addition_word_problem: "6076ea569c93639fb98cba4f08fddd8737fd1971ff07f313937c8c71a7f9eb9f",
  grade5_addition_subtraction_word_problems_addition_word_problem: "aca1b7e85257beecfbdbc4ecc33365020be45b152b780518044bc54cf67a0566",
  grade1_multiplication_facts_arrays: "80955bf3bbb6f617ad83e8bdd24f9a0e30c5152e9e59b65e3efe476573a62451",
  grade2_multiplication_facts_arrays: "b92becb183e64dc7d34355a8532784424a895c19ec2970f210827f65de41bf34",
  g3_multiplication_arrays: "84dc5b346d15d1ad837ea9420337d36acc08c469990e83b064725142f6d6e4ce",
  g4_array_interpretation: "1479f357971b776f5f5f4934115283b9cf98ff491b94bd56cddd13aa430fe2d7"
});

const ARRAY_IDS = Object.freeze([
  "grade1_multiplication_facts_arrays",
  "grade2_multiplication_facts_arrays",
  "g3_multiplication_arrays",
  "g4_array_interpretation"
]);

function withoutPublicCopy(value) {
  if (Array.isArray(value)) return value.map(withoutPublicCopy);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !["title", "instruction", "studentInstruction", "description"].includes(key))
    .map(([key, nested]) => [key, withoutPublicCopy(nested)]));
}

function sha(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function assertCopyAndBaselineContracts() {
  const ids = Object.keys(WORKSHEET_PUBLIC_COPY);
  assert.strictEqual(ids.length, 14);
  const catalog = getMasterWorksheetCatalog();

  ids.forEach((id) => {
    const copy = WORKSHEET_PUBLIC_COPY[id];
    const item = catalog.find((entry) => entry.id === id);
    const query = { worksheetSeed: `founder-review:${id}:v1` };
    const runtime = buildCatalogWorksheetRuntime(id, query);

    assert(item, `Missing catalog item ${id}`);
    assert.strictEqual(item.title, copy.title);
    assert.strictEqual(item.studentInstruction, copy.instruction);
    assert.strictEqual(runtime.layout.header.title, copy.title);
    assert.strictEqual(runtime.layout.instruction, copy.instruction);
    assert.strictEqual(runtime.contentObject.meta.title, copy.title);
    assert.strictEqual(runtime.normalizedContentObject.meta.title, copy.title);
    assert.deepStrictEqual(
      buildAnswerKeyItems(runtime.normalizedContentObject.content.items).map((entry) => entry.answer),
      runtime.normalizedContentObject.content.items.map((entry) => entry.answer)
    );
    assert.strictEqual(
      sha(withoutPublicCopy({ worksheet: runtime.worksheet, layout: runtime.layout })),
      BASELINE_NON_COPY_HASHES[id],
      `${id} changed outside approved copy fields`
    );
  });
}

function assertStoryCeilings() {
  for (const [id, ceiling] of Object.entries(STORY_CEILINGS)) {
    for (let seed = 0; seed < 40; seed += 1) {
      const runtime = buildCatalogWorksheetRuntime(id, { worksheetSeed: `copy-range-${id}-${seed}` });
      runtime.normalizedContentObject.content.items.forEach((item) => {
        assert.strictEqual(Number(item.answer), Number(item.a) + Number(item.b));
        assert(Number(item.total) <= ceiling, `${id} exceeded ${ceiling}`);
      });
    }
  }
}

function assertArrayTruthAndOrder() {
  ARRAY_IDS.forEach((id) => {
    for (let seed = 0; seed < 20; seed += 1) {
      const runtime = buildCatalogWorksheetRuntime(id, { worksheetSeed: `copy-array-${id}-${seed}` });
      runtime.normalizedContentObject.content.items.forEach((item) => {
        const visual = item.visual?.data;
        assert(visual);
        assert.strictEqual(item.responseOperator, "×");
        assert.deepStrictEqual(item.responseValues, [visual.rows, visual.cols, visual.product]);
        assert.strictEqual(visual.rows * visual.cols, visual.product);
        assert.strictEqual(item.answer, visual.product);
        assert.strictEqual(visual.orientation, "rows_columns");
      });
    }
  });
}

function run() {
  assertCopyAndBaselineContracts();
  assertStoryCeilings();
  assertArrayTruthAndOrder();
  console.log("Public copy family alignment passed: 14 exact copy contracts, 14 non-copy baseline signatures, 200 story-range seeds, and 80 array-order seeds.");
}

run();
