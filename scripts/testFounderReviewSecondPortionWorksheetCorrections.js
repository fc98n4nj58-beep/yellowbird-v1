"use strict";

const assert = require("assert");

const {
  DEFAULT_OUTPUT,
  GRADE4_PATTERN_WORKSPACE_IDS,
  PATTERN_RULE_RESPONSE_MODES
} = require("../config/founderReviewCurrentOutput");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");

const FOOTER_CORRECTION_IDS = Object.freeze([
  "grade3_multiplication_facts_equal_groups",
  "g3_equal_groups_multiplication",
  "g4_equal_groups_interpretation",
  "g2_expanded_form_to_100",
  "g4_expanded_form_large_numbers",
  "grade1_addition_subtraction_word_problems_missing_addend_word_problem",
  "g1_missing_addends_within_20",
  "g3_fact_families_multiplication_division",
  "g3_multiplication_facts",
  "g4_multiplication_fact_fluency",
  "g5_multiplication_fact_review",
  "g1_number_line_identify_to_20",
  "g2_skip_counting_by_10",
  "g2_skip_counting_by_2",
  "g2_skip_counting_by_5",
  "g2_standard_form_to_100",
  "g4_standard_form_large_numbers",
  "g1_subtraction_facts_within_20",
  "grade1_addition_subtraction_word_problems_subtraction_word_problem"
]);

function runtime(id, seed = "founder-review-second-portion") {
  return buildCatalogWorksheetRuntime(id, { worksheetSeed: `${seed}:${id}` });
}

Object.entries(DEFAULT_OUTPUT).forEach(([id, expected]) => {
  const result = runtime(id);
  if (expected.questionCount !== undefined) {
    assert.strictEqual(result.worksheet.problems.length, expected.questionCount, `${id} question count`);
    assert.strictEqual(result.layout.problems.length, expected.questionCount, `${id} layout parity`);
  }
  assert.strictEqual(result.layout.template.columns, expected.columns, `${id} columns`);
  assert.strictEqual(
    result.layout.template.maxProblemsPerPage,
    expected.maxProblemsPerPage,
    `${id} page capacity`
  );
});

GRADE4_PATTERN_WORKSPACE_IDS.forEach((id) => {
  const display = runtime(id, "workspace").layout.display;
  assert.strictEqual(display.sideWorkspace?.enabled, true, `${id} workspace enabled`);
  assert.strictEqual(display.sideWorkspace?.heading, "Work It Out", `${id} workspace heading`);
  assert.strictEqual(display.sideWorkspace?.studentOnly, true, `${id} student-only workspace`);
});

Object.entries(PATTERN_RULE_RESPONSE_MODES).forEach(([id, responseMode]) => {
  const display = runtime(id, "rule-response").layout.display;
  assert.strictEqual(display.patterningRuleResponseMode, responseMode, `${id} response mode`);
});

["grade2_patterning_and_algebra_identify_pattern_rule", "grade3_patterning_and_algebra_identify_pattern_rule"]
  .forEach((id) => {
    const result = runtime(id, "rule-line");
    assert.strictEqual(result.layout.template.columns, 1, `${id} full-width column`);
    assert.strictEqual(result.layout.template.maxProblemsPerPage, 10, `${id} ten questions per page`);
    assert.strictEqual(result.layout.display.patterningRuleFullWidth, true, `${id} full-width rule line`);
  });

FOOTER_CORRECTION_IDS.forEach((id) => {
  const footer = runtime(id, "footer").normalizedContentObject.meta.curriculum.footerText;
  assert(!footer.includes("_"), `${id} footer must not expose an internal slug: ${footer}`);
});

const grade1Pattern = runtime("grade1_patterning_and_algebra_extend_pattern", "title");
assert.strictEqual(grade1Pattern.item.title, "Extend Pattern");
assert.strictEqual(grade1Pattern.layout.header.title, "Extend Pattern");

const grade5CompareFractions = runtime("grade5_fraction_equivalence_compare_fractions", "copy");
assert.strictEqual(grade5CompareFractions.layout.header.title, "Compare Fractions");
assert.strictEqual(
  grade5CompareFractions.layout.instruction,
  "Write >, <, or = to compare each pair of fractions."
);

const equalGroupsContinuation = runtime("grade3_multiplication_facts_equal_groups", "continuation");
assert.strictEqual(equalGroupsContinuation.worksheet.problems.length, 12);
assert.strictEqual(equalGroupsContinuation.layout.template.maxProblemsPerPage, 8);

const customizedComparison = buildCatalogWorksheetRuntime("g1_compare_numbers_to_20", {
  worksheetSeed: "explicit-count-preserved",
  questionCount: 7,
  questionsPerPage: 7
});
assert.strictEqual(customizedComparison.worksheet.problems.length, 7);
assert.strictEqual(customizedComparison.layout.template.maxProblemsPerPage, 7);

console.log(JSON.stringify({
  defaultOutputResources: Object.keys(DEFAULT_OUTPUT).length,
  footerCorrections: FOOTER_CORRECTION_IDS.length,
  grade4WorkspaceResources: GRADE4_PATTERN_WORKSPACE_IDS.size,
  patternRuleResponseResources: Object.keys(PATTERN_RULE_RESPONSE_MODES).length,
  unexpectedFailures: 0
}, null, 2));
