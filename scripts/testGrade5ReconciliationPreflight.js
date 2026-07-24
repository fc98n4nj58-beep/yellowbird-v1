"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const catalog = require("../data/worksheetCatalog.master.json").items;
const { getCustomizationFamilyForResource } = require("../config/worksheetCustomization");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");

const ROOT = path.join(__dirname, "..");
const PREFLIGHT_PATH = path.join(ROOT, "docs", "grade-5-architecture-reconciliation-preflight.md");
const PLAN_PATH = path.join(ROOT, "docs", "grade-5-founder-review-batch-plan.md");
const WORKFLOW_PATH = path.join(ROOT, "docs", "worksheet-design-preflight.md");

const CATEGORIES = Object.freeze({
  A: Object.freeze([
    "g5_compare_numbers_to_100000_exit_ticket",
    "g5_equivalent_fractions_exit_ticket",
    "g5_place_value_to_100000_quick_check",
    "g5_equivalent_fractions_quick_check",
    "g5_complete_graphs",
    "grade5_fraction_equivalence_compare_fractions",
    "grade5_multiplication_facts_missing_factor",
    "g5_multiplication_fact_review",
    "grade5_patterning_and_algebra_extend_pattern",
    "grade5_patterning_and_algebra_identify_pattern_rule",
    "grade5_patterning_and_algebra_missing_value_pattern",
    "grade5_addition_subtraction_facts_equation_match",
    "grade5_place_value_representation_compare_numbers",
    "g5_interpret_graphs",
    "grade5_place_value_representation_expanded_form",
    "grade5_place_value_representation_number_line_identify",
    "grade5_place_value_representation_number_word_match",
    "grade5_place_value_representation_standard_form"
  ]),
  D: Object.freeze([
    "grade5_addition_subtraction_word_problems_addition_word_problem",
    "grade5_addition_subtraction_word_problems_missing_addend_word_problem",
    "grade5_addition_subtraction_word_problems_subtraction_word_problem",
    "grade5_fraction_equivalence_fraction_number_line",
    "grade5_fraction_equivalence_match_equivalent_fractions",
    "grade5_fraction_equivalence_shade_fraction_models"
  ]),
  E: Object.freeze([
    "grade5_patterning_and_algebra_function_table"
  ]),
  G: Object.freeze([
    "grade5_addition_subtraction_facts_fact_family",
    "grade5_addition_subtraction_facts_fact_fluency",
    "grade5_addition_subtraction_facts_missing_addend",
    "grade5_addition_subtraction_facts_related_subtraction",
    "grade5_addition_subtraction_facts_ten_frame",
    "grade5_addition_subtraction_facts_word_problems",
    "grade5_data_display_graphing_complete_graph",
    "grade5_data_display_graphing_graph_questions",
    "grade5_data_display_graphing_graph_word_problems",
    "grade5_data_display_graphing_interpret_data",
    "grade5_data_display_graphing_match_data_to_graph",
    "grade5_data_display_graphing_read_graph",
    "g5_fraction_equivalence",
    "grade5_fraction_equivalence_fraction_word_problems",
    "g5_fraction_number_line",
    "grade5_multiplication_facts_arrays",
    "grade5_multiplication_facts_equal_groups",
    "grade5_multiplication_facts_skip_counting",
    "grade5_multiplication_facts_word_problems",
    "grade5_patterning_and_algebra_pattern_word_problems",
    "grade5_place_value_representation_base_ten_blocks"
  ])
});

const CLOSED_BATCH_ONE = Object.freeze([
  "grade5_patterning_and_algebra_extend_pattern",
  "grade5_patterning_and_algebra_identify_pattern_rule",
  "grade5_patterning_and_algebra_missing_value_pattern"
]);

const CLOSED_BATCH_TWO = Object.freeze([
  "grade5_addition_subtraction_facts_equation_match",
  "grade5_place_value_representation_compare_numbers"
]);

const CLOSED_BATCH_THREE = Object.freeze([
  "g5_interpret_graphs"
]);

const CLOSED_BATCH_FOUR = Object.freeze([
  "grade5_place_value_representation_expanded_form",
  "grade5_place_value_representation_number_line_identify",
  "grade5_place_value_representation_number_word_match",
  "grade5_place_value_representation_standard_form"
]);

const BATCHES = Object.freeze({
  B4: Object.freeze([
    "grade5_fraction_equivalence_fraction_number_line",
    "grade5_fraction_equivalence_match_equivalent_fractions",
    "grade5_fraction_equivalence_shade_fraction_models"
  ]),
  B5: Object.freeze([
    "grade5_addition_subtraction_word_problems_addition_word_problem",
    "grade5_addition_subtraction_word_problems_missing_addend_word_problem",
    "grade5_addition_subtraction_word_problems_subtraction_word_problem"
  ])
});

function parseInventory(markdown) {
  return markdown
    .split("\n")
    .filter((line) => /^\| \d+ \| `(g5_|grade5_)/.test(line))
    .map((line) => {
      const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
      return {
        number: Number(cells[0]),
        id: cells[1].replaceAll("`", ""),
        proposed: cells[6].split("/")[0]
      };
    });
}

function runtimeSignature(runtime) {
  return runtime.normalizedContentObject.content.items.map((item) => ({
    prompt: item.prompt,
    answer: item.answer,
    visual: item.visual,
    answerState: item.answerState,
    duplicateSignature: item.duplicateSignature
  }));
}

function run() {
  const preflight = fs.readFileSync(PREFLIGHT_PATH, "utf8");
  const plan = fs.readFileSync(PLAN_PATH, "utf8");
  const workflow = fs.readFileSync(WORKFLOW_PATH, "utf8");
  const grade5 = catalog.filter((item) => item.grades?.includes("grade5"));
  const grade5Ids = grade5.map((item) => item.id);
  const grade5Set = new Set(grade5Ids);
  const rows = parseInventory(preflight);

  assert.strictEqual(grade5.length, 46);
  assert.strictEqual(grade5Set.size, 46);
  assert.strictEqual(rows.length, 46);
  assert.strictEqual(new Set(rows.map((row) => row.id)).size, 46);
  assert.deepStrictEqual(new Set(rows.map((row) => row.id)), grade5Set);
  assert.deepStrictEqual(rows.map((row) => row.number), Array.from({ length: 46 }, (_, index) => index + 1));
  assert(grade5.every((item) => item.subject === "Math"));
  assert(grade5.every((item) => item.gradeLabels?.includes("Grade 5")));

  const categoryById = new Map();
  Object.entries(CATEGORIES).forEach(([category, ids]) => {
    ids.forEach((id) => {
      assert(grade5Set.has(id), `Unknown ${category} resource: ${id}`);
      assert(!categoryById.has(id), `Resource has multiple categories: ${id}`);
      categoryById.set(id, category);
    });
  });
  assert.strictEqual(categoryById.size, 46);
  assert.deepStrictEqual(
    Object.fromEntries(Object.entries(CATEGORIES).map(([category, ids]) => [category, ids.length])),
    { A: 18, D: 6, E: 1, G: 21 }
  );
  rows.forEach((row) => {
    assert.strictEqual(row.proposed, categoryById.get(row.id), `Inventory category mismatch: ${row.id}`);
  });

  const batchById = new Map();
  Object.entries(BATCHES).forEach(([batch, ids]) => {
    const heading = `## Batch ${Number(batch.slice(1))} —`;
    const section = plan.split(heading)[1]?.split("\n## ")[0] || "";
    ids.forEach((id) => {
      assert(CATEGORIES.D.includes(id), `${batch} contains a non-D resource: ${id}`);
      assert(!batchById.has(id), `Resource appears in multiple batches: ${id}`);
      assert(section.includes(`\`${id}\``), `${batch} documentation omits ${id}`);
      batchById.set(id, batch);
    });
  });
  assert.deepStrictEqual(new Set(batchById.keys()), new Set(CATEGORIES.D));
  CLOSED_BATCH_ONE.forEach((id) => {
    assert(CATEGORIES.A.includes(id), `Closed Batch 1 resource is not A: ${id}`);
    assert(plan.includes(`\`${id}\``), `Batch 1 closeout documentation omits ${id}`);
  });
  assert(plan.includes("Batch 1 is founder-approved and closed"));
  assert(plan.includes("There are no split or deferred Batch 1 resources"));
  CLOSED_BATCH_TWO.forEach((id) => {
    assert(CATEGORIES.A.includes(id), `Closed Batch 2 resource is not A: ${id}`);
    assert(plan.includes(`\`${id}\``), `Batch 2 closeout documentation omits ${id}`);
  });
  assert(plan.includes("Both resources moved D → A"));
  assert(plan.includes("Split, blocked, or deferred Batch 2 resources: **none**"));
  CLOSED_BATCH_THREE.forEach((id) => {
    assert(CATEGORIES.A.includes(id), `Closed Batch 3 resource is not A: ${id}`);
    assert(plan.includes(`\`${id}\``), `Batch 3 closeout documentation omits ${id}`);
  });
  assert(plan.includes("there are no split, blocked, or deferred Batch 3 resources"));
  assert(plan.includes("`g5_interpret_graphs` moved D → A"));
  assert(plan.includes("`grade5_patterning_and_algebra_function_table` remains E"));
  CLOSED_BATCH_FOUR.forEach((id) => {
    assert(CATEGORIES.A.includes(id), `Closed Batch 4 resource is not A: ${id}`);
    assert(plan.includes(`\`${id}\``), `Batch 4 closeout documentation omits ${id}`);
  });
  assert(plan.includes("Founder approval covers all four resources"));
  assert(plan.includes("no split, blocked, or deferred resource"));

  const grade5Statuses = grade5.reduce((counts, item) => {
    counts[item.status] = (counts[item.status] || 0) + 1;
    return counts;
  }, {});
  assert.deepStrictEqual(grade5Statuses, { ready: 11, generated: 32, partial: 1, planned: 2 });

  const allStatuses = catalog.reduce((counts, item) => {
    counts[item.status] = (counts[item.status] || 0) + 1;
    return counts;
  }, {});
  assert.deepStrictEqual(
    {
      ready: allStatuses.ready,
      generated: allStatuses.generated,
      partial: allStatuses.partial,
      total: catalog.length
    },
    { ready: 104, generated: 213, partial: 5, total: 331 }
  );

  grade5.forEach((item) => {
    assert.strictEqual(getCustomizationFamilyForResource(item.id), null, `Unexpected public customization: ${item.id}`);
  });

  const expectedGap = "grade5_patterning_and_algebra_pattern_word_problems";
  const runtimeFailures = [];
  const nonDeterministic = [];
  const originalLog = console.log;
  console.log = () => {};
  try {
    grade5.forEach((item) => {
      try {
        const first = buildCatalogWorksheetRuntime(item.id, { worksheetSeed: "grade5-preflight" });
        const second = buildCatalogWorksheetRuntime(item.id, { worksheetSeed: "grade5-preflight" });
        if (JSON.stringify(runtimeSignature(first)) !== JSON.stringify(runtimeSignature(second))) {
          nonDeterministic.push(item.id);
        }
      } catch (error) {
        runtimeFailures.push({ id: item.id, message: error.message });
      }
    });
  } finally {
    console.log = originalLog;
  }
  assert.deepStrictEqual(runtimeFailures.map((failure) => failure.id), [expectedGap]);
  assert(/no problem generator/i.test(runtimeFailures[0].message));
  assert.deepStrictEqual(nonDeterministic, [
    "grade5_data_display_graphing_interpret_data"
  ]);

  assert(preflight.includes("A18 / D6 / E1 / G21 / Total46"));
  assert(preflight.includes("CONFIRMED GRADE 4 DRIFT"));
  assert(preflight.includes("Grade 2–4 reconciliations"));
  assert(workflow.includes(
    "Before implementing any Grade 4–6 resource, compare the full approved family history across every lower grade, not only the most recent grade."
  ));
  assert(workflow.includes("record any lower-grade drift for later correction rather than inheriting it forward"));

  console.log(JSON.stringify({
    grade5Records: grade5.length,
    uniqueGrade5Ids: grade5Set.size,
    grade5Lifecycle: grade5Statuses,
    proposedReconciliation: { A: 18, D: 6, E: 1, G: 21, Total: 46 },
    batches: Object.fromEntries(Object.entries(BATCHES).map(([batch, ids]) => [batch, ids.length])),
    expectedRuntimeGaps: runtimeFailures,
    documentedSameSeedDefects: nonDeterministic,
    publicCustomizationFamilies: 0
  }, null, 2));
}

run();
