"use strict";

const DEFAULT_OUTPUT = Object.freeze({
  grade1_addition_subtraction_facts_equation_match: Object.freeze({ questionCount: 20, columns: 2, maxProblemsPerPage: 20, denseGridRows: 10 }),
  grade2_addition_subtraction_facts_equation_match: Object.freeze({ questionCount: 20, columns: 2, maxProblemsPerPage: 20, denseGridRows: 10 }),
  grade3_addition_subtraction_facts_equation_match: Object.freeze({ questionCount: 20, columns: 2, maxProblemsPerPage: 20, denseGridRows: 10 }),
  grade4_addition_subtraction_facts_equation_match: Object.freeze({ questionCount: 30, columns: 2, maxProblemsPerPage: 30, denseGridRows: 15 }),
  grade5_addition_subtraction_facts_equation_match: Object.freeze({ questionCount: 30, columns: 2, maxProblemsPerPage: 30, denseGridRows: 15 }),

  grade1_fraction_equivalence_compare_fractions: Object.freeze({ questionCount: 8, columns: 2, maxProblemsPerPage: 8, denseGridRows: 4 }),
  grade3_fraction_equivalence_compare_fractions: Object.freeze({ questionCount: 20, questionsPerPage: 20, columns: 2, maxProblemsPerPage: 20, denseGridRows: 10 }),
  grade4_fraction_equivalence_compare_fractions: Object.freeze({ questionCount: 30, questionsPerPage: 30, columns: 3, maxProblemsPerPage: 30, denseGridRows: 10 }),
  grade5_fraction_equivalence_compare_fractions: Object.freeze({ questionCount: 30, questionsPerPage: 30, columns: 3, maxProblemsPerPage: 30, denseGridRows: 10 }),

  g1_compare_numbers_to_20: Object.freeze({ questionCount: 20, columns: 2, maxProblemsPerPage: 20, denseGridRows: 10 }),
  grade2_place_value_representation_compare_numbers: Object.freeze({ questionCount: 20, columns: 2, maxProblemsPerPage: 20, denseGridRows: 10 }),
  g2_compare_numbers_to_100: Object.freeze({ questionCount: 20, columns: 2, maxProblemsPerPage: 20, denseGridRows: 10 }),
  grade5_place_value_representation_compare_numbers: Object.freeze({ questionCount: 30, columns: 3, maxProblemsPerPage: 30, denseGridRows: 10 }),

  grade1_fraction_equivalence_match_equivalent_fractions: Object.freeze({ questionCount: 6, columns: 1, maxProblemsPerPage: 6, denseGridRows: 6 }),

  grade1_patterning_and_algebra_extend_pattern: Object.freeze({ questionCount: 30, columns: 2, maxProblemsPerPage: 30, denseGridRows: 15 }),
  grade2_patterning_and_algebra_extend_pattern: Object.freeze({ questionCount: 30, columns: 2, maxProblemsPerPage: 30, denseGridRows: 15 }),
  grade3_patterning_and_algebra_extend_pattern: Object.freeze({ questionCount: 30, columns: 2, maxProblemsPerPage: 30, denseGridRows: 15 }),
  grade2_patterning_and_algebra_identify_pattern_rule: Object.freeze({ questionsPerPage: 10, columns: 1, maxProblemsPerPage: 10, denseGridRows: 10 }),
  grade3_patterning_and_algebra_identify_pattern_rule: Object.freeze({ questionsPerPage: 10, columns: 1, maxProblemsPerPage: 10, denseGridRows: 10 }),

  g1_missing_addends_within_20: Object.freeze({ questionCount: 30, columns: 3, maxProblemsPerPage: 30, denseGridRows: 10 }),
  g2_missing_addends_within_100: Object.freeze({ questionCount: 30, columns: 3, maxProblemsPerPage: 30, denseGridRows: 10 }),
  grade2_addition_subtraction_facts_missing_addend: Object.freeze({ questionCount: 30, columns: 3, maxProblemsPerPage: 30, denseGridRows: 10 }),
  grade3_addition_subtraction_facts_missing_addend: Object.freeze({ questionCount: 30, columns: 3, maxProblemsPerPage: 30, denseGridRows: 10 }),

  grade1_patterning_and_algebra_missing_value_pattern: Object.freeze({ questionCount: 20, columns: 2, maxProblemsPerPage: 20, denseGridRows: 10 }),
  grade2_patterning_and_algebra_missing_value_pattern: Object.freeze({ questionCount: 20, columns: 2, maxProblemsPerPage: 20, denseGridRows: 10 }),
  grade3_patterning_and_algebra_missing_value_pattern: Object.freeze({ questionCount: 20, columns: 2, maxProblemsPerPage: 20, denseGridRows: 10 }),

  grade3_addition_subtraction_facts_fact_fluency: Object.freeze({ questionCount: 30, columns: 3, maxProblemsPerPage: 30, denseGridRows: 10 }),
  g3_fact_families_multiplication_division: Object.freeze({ questionCount: 24, columns: 3, maxProblemsPerPage: 24, denseGridRows: 8 }),

  g1_subtraction_facts_within_20: Object.freeze({ questionCount: 30, columns: 3, maxProblemsPerPage: 30, denseGridRows: 10 }),
  g2_subtraction_fluency_within_100: Object.freeze({ questionCount: 30, columns: 3, maxProblemsPerPage: 30, denseGridRows: 10 }),

  g1_number_word_match_to_50: Object.freeze({ questionCount: 10, questionsPerPage: 10, columns: 1, maxProblemsPerPage: 10, denseGridRows: 10, fullWidthNumberWordRows: true }),
  grade2_place_value_representation_number_word_match: Object.freeze({ questionCount: 10, questionsPerPage: 10, columns: 1, maxProblemsPerPage: 10, denseGridRows: 10, fullWidthNumberWordRows: true }),
  grade3_place_value_representation_number_word_match: Object.freeze({ questionCount: 10, questionsPerPage: 10, columns: 1, maxProblemsPerPage: 10, denseGridRows: 10, fullWidthNumberWordRows: true }),
  grade4_place_value_representation_number_word_match: Object.freeze({ questionCount: 12, questionsPerPage: 12, columns: 1, maxProblemsPerPage: 12, denseGridRows: 12, fullWidthNumberWordRows: true })
});

const GRADE4_PATTERN_WORKSPACE_IDS = new Set([
  "grade4_patterning_and_algebra_extend_pattern",
  "grade4_patterning_and_algebra_identify_pattern_rule",
  "grade4_patterning_and_algebra_missing_value_pattern"
]);

const PATTERN_RULE_RESPONSE_MODES = Object.freeze({
  grade1_patterning_and_algebra_identify_pattern_rule: "add_step",
  grade2_patterning_and_algebra_identify_pattern_rule: "written_rule",
  grade3_patterning_and_algebra_identify_pattern_rule: "written_rule"
});

function applyFounderReviewCurrentOutput(item) {
  const defaults = DEFAULT_OUTPUT[item?.id];
  if (!defaults) return item;
  const generatorOptions = { ...(item.generatorOptions || {}) };
  if (defaults.questionCount !== undefined) generatorOptions.questionCount = defaults.questionCount;
  if (defaults.questionsPerPage !== undefined) generatorOptions.questionsPerPage = defaults.questionsPerPage;
  return {
    ...item,
    generatorOptions
  };
}

module.exports = {
  DEFAULT_OUTPUT,
  GRADE4_PATTERN_WORKSPACE_IDS,
  PATTERN_RULE_RESPONSE_MODES,
  applyFounderReviewCurrentOutput
};
