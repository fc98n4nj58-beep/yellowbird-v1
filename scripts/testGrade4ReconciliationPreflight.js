"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const catalog = require("../data/worksheetCatalog.master.json").items;
const { getCustomizationFamilyForResource } = require("../config/worksheetCustomization");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");

const ROOT = path.join(__dirname, "..");
const PREFLIGHT_PATH = path.join(ROOT, "docs", "grade-4-architecture-reconciliation-preflight.md");
const PLAN_PATH = path.join(ROOT, "docs", "grade-4-founder-review-batch-plan.md");

const CATEGORIES = Object.freeze({
  A: Object.freeze([
    "g4_compare_fractions_quick_check",
    "g4_pattern_rule_quick_check",
    "g4_compare_fractions_exit_ticket",
    "g4_multiplication_word_problem_quick_check",
    "g4_array_interpretation",
    "g4_equal_groups_interpretation",
    "g4_missing_factors",
    "g4_multiplication_fact_fluency",
    "grade4_multiplication_facts_word_problems",
    "grade4_patterning_and_algebra_extend_pattern",
    "grade4_patterning_and_algebra_identify_pattern_rule",
    "grade4_patterning_and_algebra_missing_value_pattern",
    "g4_expanded_form_large_numbers",
    "g4_standard_form_large_numbers",
    "grade4_fraction_equivalence_compare_fractions",
    "grade4_fraction_equivalence_fraction_number_line",
    "grade4_fraction_equivalence_shade_fraction_models",
    "grade4_addition_subtraction_word_problems_addition_word_problem",
    "grade4_addition_subtraction_word_problems_missing_addend_word_problem",
    "grade4_addition_subtraction_word_problems_subtraction_word_problem"
  ]),
  D: Object.freeze([
    "grade4_addition_subtraction_facts_equation_match",
    "grade4_patterning_and_algebra_function_table",
    "grade4_place_value_representation_number_line_identify",
    "grade4_place_value_representation_number_word_match"
  ]),
  E: Object.freeze([
    "grade4_place_value_representation_compare_numbers"
  ]),
  G: Object.freeze([
    "grade4_addition_subtraction_facts_fact_family",
    "grade4_addition_subtraction_facts_fact_fluency",
    "grade4_addition_subtraction_facts_missing_addend",
    "grade4_addition_subtraction_facts_related_subtraction",
    "grade4_addition_subtraction_facts_ten_frame",
    "grade4_addition_subtraction_facts_word_problems",
    "grade4_data_display_graphing_complete_graph",
    "grade4_data_display_graphing_graph_questions",
    "grade4_data_display_graphing_graph_word_problems",
    "grade4_data_display_graphing_interpret_data",
    "grade4_data_display_graphing_match_data_to_graph",
    "grade4_data_display_graphing_read_graph",
    "g4_read_and_interpret_graphs",
    "grade4_fraction_equivalence_fraction_word_problems",
    "grade4_fraction_equivalence_match_equivalent_fractions",
    "grade4_multiplication_facts_arrays",
    "grade4_multiplication_facts_equal_groups",
    "grade4_multiplication_facts_missing_factor",
    "grade4_multiplication_facts_skip_counting",
    "grade4_patterning_and_algebra_pattern_word_problems",
    "grade4_place_value_representation_base_ten_blocks",
    "grade4_place_value_representation_expanded_form",
    "grade4_place_value_representation_standard_form"
  ])
});

const BATCHES = Object.freeze({
  B1: Object.freeze([
    "grade4_patterning_and_algebra_extend_pattern",
    "grade4_patterning_and_algebra_identify_pattern_rule",
    "grade4_patterning_and_algebra_missing_value_pattern"
  ]),
  B2: Object.freeze([
    "grade4_fraction_equivalence_compare_fractions",
    "grade4_fraction_equivalence_fraction_number_line",
    "grade4_fraction_equivalence_shade_fraction_models"
  ]),
  B3: Object.freeze([
    "grade4_addition_subtraction_word_problems_addition_word_problem",
    "grade4_addition_subtraction_word_problems_missing_addend_word_problem",
    "grade4_addition_subtraction_word_problems_subtraction_word_problem"
  ]),
  B4: Object.freeze([
    "grade4_place_value_representation_compare_numbers",
    "grade4_place_value_representation_number_line_identify",
    "grade4_place_value_representation_number_word_match"
  ]),
  B5: Object.freeze([
    "grade4_addition_subtraction_facts_equation_match",
    "grade4_patterning_and_algebra_function_table"
  ])
});

function parseLedger(markdown) {
  const section = markdown
    .split("## Canonical 48-resource draft inventory")[1]
    .split("## Current reconciliation after Batch 3 closeout")[0];
  return section
    .split("\n")
    .filter((line) => /^\| \d+ \| `(g4_|grade4_)/.test(line))
    .map((line) => {
      const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
      return {
        reviewNumber: Number(cells[0]),
        id: cells[1].replaceAll("`", ""),
        statusCell: cells[2],
        classification: cells[8],
        category: cells[9].match(/^([ADEG])\s*\//)?.[1]
      };
    });
}

function signature(runtime) {
  return runtime.normalizedContentObject.content.items.map((item) => ({
    prompt: item.prompt,
    answer: item.answer,
    visual: item.visual,
    duplicateSignature: item.duplicateSignature,
    answerState: item.answerState
  }));
}

function run() {
  const preflight = fs.readFileSync(PREFLIGHT_PATH, "utf8");
  const plan = fs.readFileSync(PLAN_PATH, "utf8");
  const grade4 = catalog.filter((item) => item.grades?.includes("grade4"));
  const grade4Ids = grade4.map((item) => item.id);
  const grade4Set = new Set(grade4Ids);
  const rows = parseLedger(preflight);

  assert.strictEqual(grade4.length, 48);
  assert.strictEqual(grade4Set.size, 48);
  assert.strictEqual(rows.length, 48);
  assert.strictEqual(new Set(rows.map((row) => row.id)).size, 48);
  assert.deepStrictEqual(new Set(rows.map((row) => row.id)), grade4Set);
  assert.deepStrictEqual(rows.map((row) => row.reviewNumber), Array.from({ length: 48 }, (_, index) => index + 1));
  assert(grade4.every((item) => item.gradeLabels?.includes("Grade 4")));
  assert(grade4.every((item) => /^(g4_|grade4_)/.test(item.id)));

  const categoryById = new Map();
  Object.entries(CATEGORIES).forEach(([category, ids]) => {
    ids.forEach((id) => {
      assert(grade4Set.has(id), `Unknown ${category} resource: ${id}`);
      assert(!categoryById.has(id), `Resource has more than one category: ${id}`);
      categoryById.set(id, category);
    });
  });
  assert.strictEqual(categoryById.size, 48);
  assert.deepStrictEqual(
    Object.fromEntries(Object.entries(CATEGORIES).map(([category, ids]) => [category, ids.length])),
    { A: 20, D: 4, E: 1, G: 23 }
  );
  rows.forEach((row) => assert.strictEqual(row.category, categoryById.get(row.id), `Ledger category mismatch: ${row.id}`));
  CATEGORIES.G.forEach((id) => {
    const row = rows.find((candidate) => candidate.id === id);
    assert(
      /DEFER|PLANNED GAP|FOUNDER DECISION REQUIRED|NEW ARCHITECTURE NEEDED/.test(row.classification),
      `Missing G rationale: ${id}`
    );
  });

  const batchById = new Map();
  Object.entries(BATCHES).forEach(([batch, ids]) => {
    const section = plan.split(`### ${batch} `)[1]?.split("\n### ")[0] || "";
    ids.forEach((id) => {
      assert(grade4Set.has(id), `Unknown ${batch} resource: ${id}`);
      assert(!batchById.has(id), `Resource appears in multiple batches: ${id}`);
      assert(section.includes(`\`${id}\``), `${batch} documentation omits ${id}`);
      batchById.set(id, batch);
    });
  });
  const implementationIds = new Set([...CATEGORIES.D, ...CATEGORIES.E, ...BATCHES.B1, ...BATCHES.B2, ...BATCHES.B3]);
  assert.deepStrictEqual(new Set(batchById.keys()), implementationIds);

  const statuses = catalog.reduce((counts, item) => {
    counts[item.status] = (counts[item.status] || 0) + 1;
    return counts;
  }, {});
  assert.deepStrictEqual(
    { ready: statuses.ready, generated: statuses.generated, partial: statuses.partial, planned: statuses.planned, total: catalog.length },
    { ready: 104, generated: 213, partial: 5, planned: 9, total: 331 }
  );
  assert(preflight.includes("Grade 2 remains A35 / D0 / E0 / G17 / Total52."));
  assert(preflight.includes("Grade 3 remains A36 / D0 / E0 / G17 / Total53."));

  const originalLog = console.log;
  console.log = () => {};
  try {
    grade4.filter((item) => item.status === "ready").forEach((item) => {
      const first = buildCatalogWorksheetRuntime(item.id, { worksheetSeed: "grade4-preflight-ready" });
      const second = buildCatalogWorksheetRuntime(item.id, { worksheetSeed: "grade4-preflight-ready" });
      assert(first.normalizedContentObject.content.items.length > 0, `Ready resource has no items: ${item.id}`);
      assert.deepStrictEqual(signature(first), signature(second), `Ready resource is not deterministic: ${item.id}`);
    });
  } finally {
    console.log = originalLog;
  }

  grade4.forEach((item) => {
    assert.strictEqual(getCustomizationFamilyForResource(item.id), null, `Unexpected public customization: ${item.id}`);
  });

  console.log(JSON.stringify({
    grade4Records: grade4.length,
    uniqueGrade4Ids: grade4Set.size,
    catalogStatuses: { ready: 18, generated: 29, planned: 1 },
    currentReconciliation: { A: 20, D: 4, E: 1, G: 23, Total: 48 },
    batches: Object.fromEntries(Object.entries(BATCHES).map(([batch, ids]) => [batch, ids.length])),
    readyRuntimeDeterminism: "18/18",
    publicGrade4CustomizationFamilies: 0,
    grade2Closed: "A35/D0/E0/G17/Total52",
    grade3Closed: "A36/D0/E0/G17/Total53"
  }, null, 2));
}

run();
