// services/worksheetCatalogService.js //

const fs = require("fs");
const path = require("path");

const { buildWorksheet } = require("../engine/worksheetBuilder/buildWorksheet");
const { getSkillDefinition } = require("../engine/skills");
const { normalizeWorksheetLayout } = require("../engine/layout/normalizeWorksheetLayout");
const {
  normalizeWorksheetCustomization
} = require("./worksheetCustomizationService");
const {
  getCustomizationFamilyForResource
} = require("../config/worksheetCustomization");
const {
  validateGrade1FractionWorksheet
} = require("../engine/problemGenerators/grade1Fractions");
const {
  validateGrade2ShadeEqualPartsWorksheet
} = require("../engine/problemGenerators/grade2ShadeEqualParts");
const {
  validateGrade2ShareFairlyTo10Worksheet
} = require("../engine/problemGenerators/grade2ShareFairlyTo10");

const MASTER_CATALOG_PATH = path.join(__dirname, "../data/worksheetCatalog.master.json");

function loadMasterCatalog() {
  const raw = fs.readFileSync(MASTER_CATALOG_PATH, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed.items) ? parsed.items : [];
}

function getMasterWorksheetCatalog() {
  return loadMasterCatalog();
}

function listWorksheetCatalog() {
  return getMasterWorksheetCatalog();
}

function getWorksheetCatalogById(id) {
  return getMasterWorksheetCatalog().find((item) => item.id === id) || null;
}

function getAnyWorksheetCatalogById(id) {
  return getWorksheetCatalogById(id);
}

function listWorksheetCatalogByGrade(grade) {
  return getMasterWorksheetCatalog().filter(
    (item) => Array.isArray(item.grades) && item.grades.includes(grade)
  );
}

function listWorksheetCatalogByDomain(domain) {
  return getMasterWorksheetCatalog().filter((item) => item.domain === domain);
}

function listWorksheetCatalogByStatus(status) {
  return getMasterWorksheetCatalog().filter((item) => item.status === status);
}

function searchWorksheetCatalog(query = "") {
  const q = String(query).trim().toLowerCase();
  const items = getMasterWorksheetCatalog();

  if (!q) return items;

  return items.filter((item) => {
    const haystack = [
      item.id,
      item.title,
      item.shortTitle,
      item.subject,
      item.domain,
      item.skillKey,
      item.worksheetFamily,
      item.templateId,
      ...(item.grades || []),
      ...(item.gradeLabels || []),
      ...(item.activityTypes || []),
      ...(item.tags || []),
      ...(item.curriculumTags || []),
      item.description
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}

function finiteNumber(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  const normalized = String(value).trim().toLowerCase();
  return ["1", "true", "yes", "on"].includes(normalized);
}

function parseNumberList(value) {
  if (Array.isArray(value)) {
    return value.map((n) => finiteNumber(n)).filter((n) => n !== null);
  }

  if (typeof value !== "string") return [];

  return value
    .split(",")
    .map((part) => finiteNumber(part.trim()))
    .filter((n) => n !== null);
}

const GRADE1_FLUENCY_COMPARISON_IDS = new Set([
  "g1_subtraction_facts_within_20",
  "g1_missing_addends_within_20",
  "g1_compare_numbers_to_20"
]);

const GRADE1_NUMBER_REPRESENTATION_IDS = new Set([
  "g1_number_word_match_to_50",
  "g1_write_the_numeral_to_50",
  "grade1_place_value_representation_base_ten_blocks",
  "g1_ten_frame_addition_within_10"
]);

const GRADE1_NUMBER_WORD_RESOURCE_IDS = new Set([
  "g1_number_word_match_to_50",
  "g1_write_the_numeral_to_50"
]);

const GRADE1_MULTIPLICATION_MODEL_IDS = new Set([
  "grade1_multiplication_facts_arrays",
  "grade1_multiplication_facts_equal_groups"
]);

const GRADE1_CATEGORY_C_CLOSURE_IDS = new Set([
  "grade1_multiplication_facts_skip_counting",
  "grade1_place_value_representation_expanded_form"
]);

const GRADE1_ADDITION_NUMBER_LINE_ID = "g1_addition_on_number_line_to_20";
const GRADE1_EQUATION_MATCH_ID = "grade1_addition_subtraction_facts_equation_match";
const GRADE2_EQUATION_MATCH_ID = "grade2_addition_subtraction_facts_equation_match";
const GRADE2_NUMBER_LINE_IDENTIFY_ID = "grade2_place_value_representation_number_line_identify";
const GRADE2_NUMBER_WORD_WRITE_ID = "grade2_place_value_representation_number_word_match";
const GRADE2_EQUAL_GROUPS_ID = "grade2_multiplication_facts_equal_groups";
const GRADE2_SHADE_EQUAL_PARTS_ID = "grade2_fraction_equivalence_shade_fraction_models";
const GRADE2_SHARE_FAIRLY_TO_10_ID = "grade2_fraction_equivalence_fraction_word_problems";
const GRADE2_ARRAYS_ID = "grade2_multiplication_facts_arrays";
const GRADE2_BASE_TEN_BLOCKS_ID = "g2_base_ten_blocks_representation";
const GRADE3_EXPANDED_FORM_ID = "grade3_place_value_representation_expanded_form";
const GRADE3_NUMBER_WORD_ID = "grade3_place_value_representation_number_word_match";
const GRADE3_STANDARD_FORM_ID = "grade3_place_value_representation_standard_form";
const GRADE3_EQUATION_MATCH_ID = "grade3_addition_subtraction_facts_equation_match";
const GRADE3_FACT_FAMILY_ID = "grade3_addition_subtraction_facts_fact_family";
const GRADE3_FACT_FLUENCY_ID = "grade3_addition_subtraction_facts_fact_fluency";
const GRADE3_MISSING_ADDEND_ID = "grade3_addition_subtraction_facts_missing_addend";
const GRADE3_ADDITION_WORD_PROBLEMS_ID = "grade3_addition_subtraction_word_problems_addition_word_problem";
const GRADE3_MISSING_ADDEND_WORD_PROBLEMS_ID = "grade3_addition_subtraction_word_problems_missing_addend_word_problem";
const GRADE3_SUBTRACTION_WORD_PROBLEMS_ID = "grade3_addition_subtraction_word_problems_subtraction_word_problem";
const GRADE2_ADDITION_WITHIN_100_ID = "g2_addition_fluency_within_100";
const GRADE2_MISSING_ADDENDS_WITHIN_100_ID = "g2_missing_addends_within_100";
const GRADE2_SUBTRACTION_WITHIN_100_ID = "g2_subtraction_fluency_within_100";
const GRADE2_ADDITION_WORD_PROBLEMS_WITHIN_100_ID = "g2_addition_word_problems_within_100";
const GRADE2_MULTIPLICATION_WORD_PROBLEMS_ID = "grade2_multiplication_facts_word_problems";
const GRADE2_CATEGORY_E_BATCH3_IMPLEMENTED_IDS = new Set([
  GRADE2_ADDITION_WORD_PROBLEMS_WITHIN_100_ID,
  GRADE2_MULTIPLICATION_WORD_PROBLEMS_ID
]);
const GRADE2_CATEGORY_E_BATCH2_IDS = new Set([
  GRADE2_ADDITION_WITHIN_100_ID,
  GRADE2_MISSING_ADDENDS_WITHIN_100_ID,
  GRADE2_SUBTRACTION_WITHIN_100_ID
]);
const GRADE2_CATEGORY_D_LOW_RISK_IDS = new Set([
  GRADE2_EQUATION_MATCH_ID,
  GRADE2_NUMBER_LINE_IDENTIFY_ID,
  GRADE2_NUMBER_WORD_WRITE_ID,
  GRADE2_EQUAL_GROUPS_ID,
  GRADE2_SHADE_EQUAL_PARTS_ID,
  GRADE2_SHARE_FAIRLY_TO_10_ID
]);
const GRADE1_DATA_READING_IDS = new Set([
  "grade1_data_display_graphing_read_graph",
  "grade1_data_display_graphing_interpret_data",
  "grade1_data_display_graphing_graph_questions"
]);
const GRADE2_PICTOGRAPH_READING_IDS = new Set([
  "grade2_data_display_graphing_read_graph",
  "grade2_data_display_graphing_interpret_data"
]);
const GRADE2_COMPLETE_PICTOGRAPH_ID = "grade2_data_display_graphing_complete_graph";
const GRADE2_MATCHING_PICTOGRAPH_ID = "grade2_data_display_graphing_match_data_to_graph";
const GRADE1_DATA_BATCH3_IDS = new Set([
  "grade1_data_display_graphing_complete_graph",
  "grade1_data_display_graphing_match_data_to_graph",
  "grade1_data_display_graphing_graph_word_problems"
]);
const GRADE1_DATA_ACTIVITY_MODES = Object.freeze({
  grade1_data_display_graphing_complete_graph: "complete_graph",
  grade1_data_display_graphing_match_data_to_graph: "match_graph",
  grade1_data_display_graphing_graph_word_problems: "graph_application"
});
const GRADE1_DATA_QUESTION_COUNTS = Object.freeze({
  grade1_data_display_graphing_read_graph: 6,
  grade1_data_display_graphing_interpret_data: 6,
  grade1_data_display_graphing_graph_questions: 8,
  grade1_data_display_graphing_complete_graph: 1,
  grade1_data_display_graphing_match_data_to_graph: 2,
  grade1_data_display_graphing_graph_word_problems: 4
});
const GRADE1_FRACTION_ACTIVITY_MODES = Object.freeze({
  grade1_fraction_equivalence_shade_fraction_models: "shade_equal_parts",
  grade1_fraction_equivalence_match_equivalent_fractions: "half_two_fourths",
  grade1_fraction_equivalence_compare_fractions: "compare_fair_shares",
  grade1_fraction_equivalence_fraction_word_problems: "share_fairly"
});
const GRADE1_FRACTION_QUESTION_COUNTS = Object.freeze({
  grade1_fraction_equivalence_shade_fraction_models: 6,
  grade1_fraction_equivalence_match_equivalent_fractions: 4,
  grade1_fraction_equivalence_compare_fractions: 6,
  grade1_fraction_equivalence_fraction_word_problems: 3
});

const GRADE2_NUMERIC_PATTERN_TITLES = Object.freeze({
  grade2_patterning_and_algebra_extend_pattern: "Extend Pattern",
  grade2_patterning_and_algebra_identify_pattern_rule: "Identify Pattern Rule",
  grade2_patterning_and_algebra_missing_value_pattern: "Missing Value Pattern"
});

const GRADE3_NUMERIC_PATTERN_TITLES = Object.freeze({
  grade3_patterning_and_algebra_extend_pattern: "Extend the Pattern",
  grade3_patterning_and_algebra_identify_pattern_rule: "Identify the Pattern Rule",
  grade3_patterning_and_algebra_missing_value_pattern: "Find the Missing Number"
});

const GRADE3_PLACE_VALUE_TITLES = Object.freeze({
  [GRADE3_EXPANDED_FORM_ID]: "Expanded Form",
  [GRADE3_STANDARD_FORM_ID]: "Standard Form"
});

const GRADE3_PLACE_VALUE_BATCH2_IDS = new Set([
  GRADE3_EXPANDED_FORM_ID,
  GRADE3_NUMBER_WORD_ID,
  GRADE3_STANDARD_FORM_ID
]);

const GRADE3_ADDITION_SUBTRACTION_BATCH3_TITLES = Object.freeze({
  [GRADE3_EQUATION_MATCH_ID]: "Equal or Not Equal?",
  [GRADE3_FACT_FAMILY_ID]: "Addition and Subtraction Fact Families",
  [GRADE3_FACT_FLUENCY_ID]: "Addition and Subtraction Facts",
  [GRADE3_MISSING_ADDEND_ID]: "Missing Addends"
});

const GRADE3_ADDITION_SUBTRACTION_BATCH3_IDS = new Set(
  Object.keys(GRADE3_ADDITION_SUBTRACTION_BATCH3_TITLES)
);

const GRADE3_STORY_PROBLEM_TITLES = Object.freeze({
  [GRADE3_ADDITION_WORD_PROBLEMS_ID]: "Addition Word Problems",
  [GRADE3_MISSING_ADDEND_WORD_PROBLEMS_ID]: "Missing Addend Word Problems",
  [GRADE3_SUBTRACTION_WORD_PROBLEMS_ID]: "Subtraction Word Problems"
});

const GRADE3_STORY_PROBLEM_IDS = new Set(Object.keys(GRADE3_STORY_PROBLEM_TITLES));

const GRADE2_NUMERIC_PATTERN_IDS = new Set(
  Object.keys(GRADE2_NUMERIC_PATTERN_TITLES)
);

const GRADE2_COMPARISON_IDS = new Set([
  "grade2_place_value_representation_compare_numbers",
  "g2_compare_numbers_to_100"
]);

const GRADE2_COMPACT_QUICK_CHECK_IDS = new Set([
  "g2_addition_within_20_quick_check",
  "g2_subtraction_within_20_quick_check",
  "g2_missing_addends_within_20_quick_check"
]);

const GRADE2_COMPACT_EXIT_TICKET_ID = "g2_missing_addends_within_20_exit_ticket";

const GRADE2_ADDITION_SUBTRACTION_CATEGORY_C_IDS = new Set([
  "grade2_addition_subtraction_facts_fact_family",
  "grade2_addition_subtraction_facts_missing_addend",
  "grade2_addition_subtraction_word_problems_missing_addend_word_problem",
  "grade2_addition_subtraction_word_problems_subtraction_word_problem"
]);

const DENSE_GRADE1_QUESTION1_EXAMPLE_IDS = new Set([
  "g1_addition_facts_within_20",
  "g1_subtraction_facts_within_20",
  "g1_missing_addends_within_20",
  "g1_compare_numbers_to_20",
  "g1_number_word_match_to_50",
  "g1_write_the_numeral_to_50",
  "grade1_place_value_representation_base_ten_blocks",
  "g1_ten_frame_addition_within_10",
  ...GRADE1_MULTIPLICATION_MODEL_IDS,
  ...GRADE1_CATEGORY_C_CLOSURE_IDS,
  ...GRADE1_DATA_READING_IDS,
  "grade1_data_display_graphing_graph_word_problems",
  "grade1_fraction_equivalence_compare_fractions",
  GRADE1_ADDITION_NUMBER_LINE_ID,
  GRADE1_EQUATION_MATCH_ID
]);

function normalizeGrade1EquationMatchOptions(item, options = {}) {
  if (item.id !== GRADE1_EQUATION_MATCH_ID) return options;

  const normalized = { ...options };
  normalized.minimumResult = Math.max(0, finiteNumber(normalized.minimumResult, 0));
  normalized.maximumResult = Math.min(
    20,
    Math.max(normalized.minimumResult + 1, finiteNumber(normalized.maximumResult, 20))
  );
  normalized.questionCount = finiteNumber(normalized.questionCount, 12);
  return normalized;
}

function normalizeGrade2CategoryDLowRiskOptions(item, options = {}) {
  if (!GRADE2_CATEGORY_D_LOW_RISK_IDS.has(item.id)) return options;

  const normalized = { ...options, includeExample: false };

  if (item.id === GRADE2_EQUATION_MATCH_ID) {
    normalized.minimumResult = Math.min(49, Math.max(0, finiteNumber(normalized.minimumResult, 0)));
    normalized.maximumResult = Math.min(
      50,
      Math.max(normalized.minimumResult + 1, finiteNumber(normalized.maximumResult, 50))
    );
    normalized.questionCount = 12;
  }

  if (item.id === GRADE2_NUMBER_LINE_IDENTIFY_ID) {
    normalized.minValue = Math.min(
      190,
      Math.max(0, finiteNumber(normalized.minValue ?? normalized.minA, 0))
    );
    normalized.maxValue = Math.min(
      200,
      Math.max(normalized.minValue + 10, finiteNumber(normalized.maxValue ?? normalized.maxA, 200))
    );
    normalized.tickCount = 10;
    normalized.allowedIntervals = parseNumberList(
      normalized.allowedIntervals || normalized.intervals || normalized.selectedIntervals
    ).filter((value) => [1, 2, 5, 10].includes(value));
    if (!normalized.allowedIntervals.length) normalized.allowedIntervals = [1, 2, 5, 10];
    normalized.allowEndpointTargets = parseBoolean(normalized.allowEndpointTargets, true);
    normalized.questionCount = 6;
  }

  if (item.id === GRADE2_NUMBER_WORD_WRITE_ID) {
    normalized.minA = Math.min(200, Math.max(0, finiteNumber(normalized.minA, 0)));
    normalized.maxA = Math.min(200, Math.max(normalized.minA, finiteNumber(normalized.maxA, 200)));
    normalized.numberWordMode = "numeral_to_word";
    normalized.promptStyle = "number_only";
    normalized.questionCount = 12;
  }

  if (item.id === GRADE2_EQUAL_GROUPS_ID) {
    normalized.minGroups = 2;
    normalized.maxGroups = 6;
    normalized.minItemsPerGroup = 2;
    normalized.maxItemsPerGroup = 6;
    normalized.maxProduct = 36;
    normalized.balanceFactorValues = true;
    normalized.responseMode = "multiplication_sentence";
    normalized.showQuestionSentence = false;
    normalized.questionCount = 8;
  }

  if (item.id === GRADE2_SHADE_EQUAL_PARTS_ID) {
    normalized.questionCount = 8;
    normalized.includeExample = false;
  }

  if (item.id === GRADE2_SHARE_FAIRLY_TO_10_ID) {
    normalized.questionCount = 4;
    normalized.includeExample = false;
  }

  return normalized;
}

function normalizeGrade1DataReadingOptions(item, options = {}) {
  if (!GRADE1_DATA_READING_IDS.has(item.id) && !GRADE1_DATA_BATCH3_IDS.has(item.id)) return options;
  return {
    ...options,
    questionCount: GRADE1_DATA_QUESTION_COUNTS[item.id],
    includeExample: GRADE1_DATA_BATCH3_IDS.has(item.id) &&
      item.id !== "grade1_data_display_graphing_graph_word_problems"
      ? false
      : options.includeExample
  };
}

function normalizeGrade2PictographReadingOptions(item, options = {}) {
  if (
    !GRADE2_PICTOGRAPH_READING_IDS.has(item.id) &&
    item.id !== GRADE2_COMPLETE_PICTOGRAPH_ID &&
    item.id !== GRADE2_MATCHING_PICTOGRAPH_ID
  ) return options;
  return {
    ...options,
    questionCount: item.id === GRADE2_COMPLETE_PICTOGRAPH_ID
      ? 1
      : item.id === GRADE2_MATCHING_PICTOGRAPH_ID ? 2 : 6,
    includeExample: false
  };
}

function normalizeGrade2CategoryEBatch1Options(item, options = {}) {
  if (![GRADE2_ARRAYS_ID, GRADE2_BASE_TEN_BLOCKS_ID].includes(item.id)) return options;

  const normalized = { ...options, includeExample: false };
  normalized.questionCount = finiteNumber(
    normalized.questionCount,
    item.id === GRADE2_ARRAYS_ID ? 8 : 10
  );
  return normalized;
}

function normalizeGrade3PlaceValueBatch2Options(item, options = {}) {
  if (item.id !== GRADE3_NUMBER_WORD_ID) return options;

  const normalized = { ...options };
  const mode = String(normalized.numberWordMode || normalized.mode || "numeral_to_word")
    .trim()
    .toLowerCase();

  normalized.questionCount = finiteNumber(normalized.questionCount, 12);
  normalized.minA = finiteNumber(normalized.minA, 100);
  normalized.maxA = Math.max(normalized.minA, finiteNumber(normalized.maxA, 999));
  normalized.numberWordMode = mode === "word_to_numeral" ? "word_to_numeral" : "numeral_to_word";
  normalized.promptStyle = normalized.promptStyle || normalized.promptType || "number_only";

  return normalized;
}

function normalizeGrade3AdditionSubtractionBatch3Options(item, options = {}) {
  if (!GRADE3_ADDITION_SUBTRACTION_BATCH3_IDS.has(item.id)) return options;

  const normalized = { ...options };
  normalized.includeExample = parseBoolean(
    options.includeExample ?? options.completedExample ?? options.example,
    false
  );

  if (item.id === GRADE3_EQUATION_MATCH_ID) {
    normalized.questionCount = finiteNumber(options.questionCount, 12);
    normalized.minimumResult = Math.max(0, finiteNumber(options.minimumResult, 0));
    normalized.maximumResult = Math.min(
      100,
      Math.max(normalized.minimumResult + 1, finiteNumber(options.maximumResult ?? options.maxTotal, 100))
    );
    if (Number.isFinite(Number(options.equalPairs)) && Number(options.equalPairs) > 1) {
      normalized.includeEqualPairs = true;
    }
  }

  if (item.id === GRADE3_FACT_FAMILY_ID) {
    normalized.questionCount = finiteNumber(options.questionCount, 12);
    normalized.minA = finiteNumber(options.minA, 1);
    normalized.maxA = Math.max(normalized.minA, finiteNumber(options.maxA, 50));
    normalized.minB = finiteNumber(options.minB, 1);
    normalized.maxB = Math.max(normalized.minB, finiteNumber(options.maxB, 50));
    normalized.maxTotal = finiteNumber(options.maxTotal, 100);
    normalized.requireDistinctAddends = parseBoolean(options.requireDistinctAddends, true);
  }

  if (item.id === GRADE3_FACT_FLUENCY_ID) {
    normalized.questionCount = finiteNumber(options.questionCount, 24);
    normalized.minA = finiteNumber(options.minA, 0);
    normalized.maxA = Math.max(normalized.minA, finiteNumber(options.maxA, 100));
    normalized.minB = finiteNumber(options.minB, 0);
    normalized.maxB = Math.max(normalized.minB, finiteNumber(options.maxB, 100));
    normalized.maxTotal = finiteNumber(options.maxTotal, 100);
    normalized.operation = options.operation || options.mode || "mixed";
  }

  if (item.id === GRADE3_MISSING_ADDEND_ID) {
    normalized.questionCount = finiteNumber(options.questionCount, 24);
    normalized.minA = finiteNumber(options.minA, 0);
    normalized.maxA = Math.max(normalized.minA, finiteNumber(options.maxA, 100));
    normalized.minB = finiteNumber(options.minB, 0);
    normalized.maxB = Math.max(normalized.minB, finiteNumber(options.maxB, 100));
    normalized.maxTotal = finiteNumber(options.maxTotal, 100);
    normalized.missingPosition = options.missingPosition || options.missingAddendPosition || "mixed";
  }

  return normalized;
}

function normalizeGrade3StoryProblemOptions(item, options = {}) {
  if (!GRADE3_STORY_PROBLEM_IDS.has(item.id)) return options;

  const normalized = {
    ...options,
    questionCount: finiteNumber(options.questionCount, 12),
    maxTotal: Math.min(100, finiteNumber(options.maxTotal, 100))
  };

  if (item.id === GRADE3_SUBTRACTION_WORD_PROBLEMS_ID) {
    normalized.minA = finiteNumber(options.minA, 20);
    normalized.maxA = Math.min(100, Math.max(normalized.minA, finiteNumber(options.maxA, 100)));
    normalized.minB = finiteNumber(options.minB, 1);
    normalized.maxB = Math.min(99, Math.max(normalized.minB, finiteNumber(options.maxB, 90)));
    normalized.naturalTakeAwayLanguage = parseBoolean(options.naturalTakeAwayLanguage, true);
  } else {
    normalized.minA = finiteNumber(options.minA, 10);
    normalized.maxA = Math.min(90, Math.max(normalized.minA, finiteNumber(options.maxA, 90)));
    normalized.minB = finiteNumber(options.minB, 10);
    normalized.maxB = Math.min(90, Math.max(normalized.minB, finiteNumber(options.maxB, 90)));
  }

  if (item.id === GRADE3_MISSING_ADDEND_WORD_PROBLEMS_ID) {
    normalized.missingPosition =
      options.missingPosition ||
      options.missingAddendPosition ||
      options.missingPartPosition ||
      options.unknownPosition ||
      "mixed";
  }

  return normalized;
}

function normalizeGrade2CategoryEBatch2Options(item, options = {}) {
  if (!GRADE2_CATEGORY_E_BATCH2_IDS.has(item.id)) return options;

  const normalized = {
    ...options,
    questionCount: finiteNumber(options.questionCount, 12),
    minA: finiteNumber(options.minA, 0),
    maxA: finiteNumber(options.maxA, 100),
    minB: finiteNumber(options.minB, 0),
    maxB: finiteNumber(options.maxB, 100)
  };

  if (item.id === GRADE2_ADDITION_WITHIN_100_ID || item.id === GRADE2_MISSING_ADDENDS_WITHIN_100_ID) {
    normalized.maxTotal = finiteNumber(options.maxTotal, 100);
  }
  if (item.id === GRADE2_MISSING_ADDENDS_WITHIN_100_ID) {
    normalized.missingPosition = options.missingPosition || "mixed";
  }

  return normalized;
}

function normalizeGrade2CategoryEBatch3Options(item, options = {}) {
  if (!GRADE2_CATEGORY_E_BATCH3_IMPLEMENTED_IDS.has(item.id)) return options;

  const normalized = {
    ...options,
    questionCount: finiteNumber(options.questionCount, 12)
  };

  if (item.id === GRADE2_ADDITION_WORD_PROBLEMS_WITHIN_100_ID) {
    normalized.minA = finiteNumber(options.minA, 1);
    normalized.maxA = finiteNumber(options.maxA, 50);
    normalized.minB = finiteNumber(options.minB, 1);
    normalized.maxB = finiteNumber(options.maxB, 100);
    normalized.maxTotal = finiteNumber(
      options.maxTotal,
      finiteNumber(options.maxA, 100)
    );
  }

  if (item.id === GRADE2_MULTIPLICATION_WORD_PROBLEMS_ID) {
    normalized.minFactorA = finiteNumber(options.minFactorA ?? options.minA, 2);
    normalized.maxFactorA = finiteNumber(options.maxFactorA ?? options.maxA, 6);
    normalized.minFactorB = finiteNumber(options.minFactorB ?? options.minB, 2);
    normalized.maxFactorB = finiteNumber(options.maxFactorB ?? options.maxB, 6);
    normalized.maxProduct = finiteNumber(options.maxProduct ?? options.maxTotal, 36);
    normalized.balanceFactorValues = true;
  }

  return normalized;
}

function normalizeGrade1FractionOptions(item, options = {}) {
  const taskMode = GRADE1_FRACTION_ACTIVITY_MODES[item.id];
  if (!taskMode) return options;
  return {
    ...options,
    questionCount: GRADE1_FRACTION_QUESTION_COUNTS[item.id],
    includeExample: taskMode === "compare_fair_shares" ? Boolean(options.includeExample) : false
  };
}

function completedExampleCountInsideQuestionTotal(item) {
  if (item.id === GRADE1_EQUATION_MATCH_ID) return 2;
  return DENSE_GRADE1_QUESTION1_EXAMPLE_IDS.has(item.id) ? 1 : 0;
}

function normalizeGrade1FluencyComparisonOptions(item, options = {}) {
  if (!GRADE1_FLUENCY_COMPARISON_IDS.has(item.id)) return options;

  const normalized = { ...options };
  const minimumValue = finiteNumber(normalized.minimumValue);
  const maximumValue = finiteNumber(normalized.maximumValue);
  const selectedValues = parseNumberList(
    normalized.selectedValues || normalized.selectedNumbers || normalized.onlyNumbers
  );

  if (minimumValue !== null) {
    normalized.minA = minimumValue;
    normalized.minB = minimumValue;
  }

  if (maximumValue !== null) {
    normalized.maxA = maximumValue;
    normalized.maxB = maximumValue;
    if (item.activityTypes?.[0] === "missing_addend") {
      normalized.maxTotal = maximumValue;
    }
  }

  if (selectedValues.length) {
    normalized.selectedValues = selectedValues;
    normalized.selectedNumbers = selectedValues;
    normalized.onlyNumbers = selectedValues.join(",");
  }

  return normalized;
}

function normalizeGrade1NumberRepresentationOptions(item, options = {}) {
  if (!GRADE1_NUMBER_REPRESENTATION_IDS.has(item.id)) return options;

  const normalized = { ...options };
  const selectedValues = parseNumberList(
    normalized.selectedValues || normalized.selectedNumbers || normalized.onlyNumbers
  );
  const minimumValue = finiteNumber(normalized.minimumValue ?? normalized.minimumNumber);
  const maximumValue = finiteNumber(normalized.maximumValue ?? normalized.maximumNumber);
  const activityType = item.activityTypes?.[0] || "";

  if (minimumValue !== null) {
    normalized.minA = minimumValue;
  }

  if (maximumValue !== null) {
    normalized.maxA = maximumValue;
  }

  if (selectedValues.length) {
    normalized.selectedValues = selectedValues;
    normalized.selectedNumbers = selectedValues;
    normalized.onlyNumbers = selectedValues.join(",");
  }

  if (GRADE1_NUMBER_WORD_RESOURCE_IDS.has(item.id)) {
    normalized.minA = finiteNumber(normalized.minA, 0);
    normalized.maxA = finiteNumber(normalized.maxA, 50);
    normalized.questionCount = finiteNumber(normalized.questionCount, 20);
    normalized.promptStyle = "number_only";
    normalized.numberWordMode = item.id === "g1_write_the_numeral_to_50"
      ? "word_to_numeral"
      : "numeral_to_word";
  }

  if (item.id === "grade1_place_value_representation_base_ten_blocks") {
    normalized.minA = finiteNumber(normalized.minA, 0);
    normalized.maxA = finiteNumber(normalized.maxA, 50);
    normalized.questionCount = finiteNumber(normalized.questionCount, 10);
    if (parseBoolean(normalized.showPlaceValueLabels ?? normalized.baseTenTensOnesBoxes, false)) {
      normalized.showPlaceValueLabels = true;
      normalized.baseTenTensOnesBoxes = true;
      normalized.responseMode = "tens_ones";
    }
  }

  if (activityType === "ten_frame") {
    const hasExplicitZeroMinimum = String(normalized.minimumValue ?? normalized.minA ?? "").trim() === "0";
    const selectedIncludesZero = selectedValues.includes(0);
    normalized.minA = finiteNumber(normalized.minA, hasExplicitZeroMinimum || selectedIncludesZero ? 0 : 1);
    normalized.maxA = finiteNumber(normalized.maxA, 10);
    normalized.questionCount = finiteNumber(normalized.questionCount, 10);
    normalized.tenFramesPerQuestion = finiteNumber(normalized.tenFramesPerQuestion, 1);
    if (selectedValues.length) {
      normalized.frameSelectionMode = "exact";
    }
  }

  return normalized;
}

function normalizeGrade1MultiplicationModelOptions(item, options = {}) {
  if (!GRADE1_MULTIPLICATION_MODEL_IDS.has(item.id)) return options;

  const normalized = { ...options };
  const activityType = item.activityTypes?.[0] || "";
  const firstMinimum = finiteNumber(
    normalized.minFactorA ?? normalized.minA,
    2
  );
  const firstMaximum = finiteNumber(
    normalized.maxFactorA ?? normalized.maxA,
    5
  );
  const secondMinimum = finiteNumber(
    normalized.minFactorB ?? normalized.minB,
    2
  );
  const secondMaximum = finiteNumber(
    normalized.maxFactorB ?? normalized.maxB,
    5
  );

  normalized.questionCount = finiteNumber(normalized.questionCount, 8);
  normalized.maxProduct = finiteNumber(
    normalized.maxProduct ?? normalized.maxTotal,
    10
  );
  normalized.responseMode = "multiplication_sentence";
  normalized.showQuestionSentence = false;

  if (["array", "arrays"].includes(activityType)) {
    normalized.minRows = finiteNumber(normalized.minRows, firstMinimum);
    normalized.maxRows = finiteNumber(normalized.maxRows, firstMaximum);
    normalized.minCols = finiteNumber(
      normalized.minCols ?? normalized.minColumns,
      secondMinimum
    );
    normalized.maxCols = finiteNumber(
      normalized.maxCols ?? normalized.maxColumns,
      secondMaximum
    );
  } else {
    normalized.minGroups = finiteNumber(normalized.minGroups, firstMinimum);
    normalized.maxGroups = finiteNumber(normalized.maxGroups, firstMaximum);
    normalized.minItemsPerGroup = finiteNumber(
      normalized.minItemsPerGroup,
      secondMinimum
    );
    normalized.maxItemsPerGroup = finiteNumber(
      normalized.maxItemsPerGroup,
      secondMaximum
    );
  }

  return normalized;
}

function normalizeGrade1CategoryCClosureOptions(item, options = {}) {
  if (!GRADE1_CATEGORY_C_CLOSURE_IDS.has(item.id)) return options;

  const normalized = { ...options };
  if (item.id === "grade1_multiplication_facts_skip_counting") {
    normalized.questionCount = finiteNumber(normalized.questionCount, 8);
    normalized.termCount = finiteNumber(normalized.termCount ?? normalized.sequenceLength, 6);
    normalized.missingCount = finiteNumber(normalized.missingCount, 1);
    normalized.missingPlacement = normalized.missingPlacement || "random";
    normalized.selectedSteps = parseNumberList(
      normalized.selectedSteps || normalized.steps || normalized.onlySteps
    );
    if (!normalized.selectedSteps.length) normalized.selectedSteps = [1, 2, 5, 10];
    normalized.maxValue = finiteNumber(normalized.maxValue, 50);
    normalized.allowZeroStart = true;
    normalized.showJumpVisuals = normalized.showJumpVisuals !== false;
  }

  if (item.id === "grade1_place_value_representation_expanded_form") {
    normalized.minA = finiteNumber(normalized.minA, 10);
    normalized.maxA = finiteNumber(normalized.maxA, 50);
    normalized.questionCount = finiteNumber(normalized.questionCount, 18);
  }

  return normalized;
}

function normalizeGrade1AdditionNumberLineOptions(item, options = {}) {
  if (item.id !== GRADE1_ADDITION_NUMBER_LINE_ID) return options;

  const normalized = { ...options };
  normalized.minStart = finiteNumber(normalized.minStart ?? normalized.minA, 0);
  normalized.maxStart = finiteNumber(normalized.maxStart ?? normalized.maxA, 10);
  normalized.minJump = finiteNumber(normalized.minJump ?? normalized.minB, 1);
  normalized.maxJump = finiteNumber(normalized.maxJump ?? normalized.maxB, 10);
  normalized.maxTotal = finiteNumber(normalized.maxTotal, 20);
  normalized.numberLineMaximum = finiteNumber(normalized.numberLineMaximum, 20);
  normalized.questionCount = finiteNumber(normalized.questionCount, 6);
  return normalized;
}

function normalizeCatalogWorksheetOptions(item, options = {}) {
  const normalized = {
    ...(item.generatorOptions || {}),
    ...options
  };

  [
    "questionCount",
    "questionsPerPage",
    "minA",
    "maxA",
    "minB",
    "maxB",
    "maxTotal",
    "maxProduct",
    "minFactorA",
    "maxFactorA",
    "minFactorB",
    "maxFactorB",
    "minRows",
    "maxRows",
    "minCols",
    "maxCols",
    "minColumns",
    "maxColumns",
    "minGroups",
    "maxGroups",
    "minItemsPerGroup",
    "maxItemsPerGroup",
    "tenFramesPerQuestion",
    "minTenFrames",
    "maxTenFrames",
    "numberLineIntervals",
    "step",
    "startNumber",
    "sequenceLength",
    "termCount",
    "missingCount",
    "minStart",
    "maxStart",
    "minJump",
    "maxJump",
    "numberLineMaximum"
  ].forEach((key) => {
    const value = finiteNumber(normalized[key]);
    if (value !== null) normalized[key] = value;
  });

  const missingPlacement = String(normalized.missingPlacement || "").trim().toLowerCase();
  if (["beginning", "end", "random"].includes(missingPlacement)) {
    normalized.missingPlacement = missingPlacement;
  }

  const selectedNumbers = parseNumberList(
    normalized.selectedNumbers || normalized.onlyNumbers
  );

  if (selectedNumbers.length) {
    normalized.selectedNumbers = selectedNumbers;
    normalized.onlyNumbers = selectedNumbers.join(",");
  }

  [
    ["selectedFactors", "onlyFactors"],
    ["selectedFactorA", "onlyFactorA"],
    ["selectedFactorB", "onlyFactorB"],
    ["selectedRows", "onlyRows"],
    ["selectedCols", "onlyCols"],
    ["selectedColumns", "onlyColumns"],
    ["selectedGroups", "onlyGroups"],
    ["selectedItemsPerGroup", "onlyItemsPerGroup"]
  ].forEach(([primary, alias]) => {
    const values = parseNumberList(normalized[primary] || normalized[alias]);
    if (values.length) {
      normalized[primary] = values;
      normalized[alias] = values.join(",");
    }
  });

  const isMultiplicationModel =
    ["array", "arrays"].includes(item.activityTypes?.[0]) ||
    (item.activityTypes?.[0] === "equal_groups" && item.skillKey !== "division_foundations");

  if (isMultiplicationModel) {
    [
      "maxA",
      "maxB",
      "maxFactorA",
      "maxFactorB",
      "maxRows",
      "maxCols",
      "maxColumns",
      "maxGroups",
      "maxItemsPerGroup"
    ].forEach((key) => {
      if (finiteNumber(normalized[key]) !== null && normalized[key] > 10) {
        normalized[key] = 10;
        normalized.modelRangeCappedWarning = true;
      }
    });

    [
      "selectedFactors",
      "selectedFactorA",
      "selectedFactorB",
      "selectedRows",
      "selectedCols",
      "selectedColumns",
      "selectedGroups",
      "selectedItemsPerGroup"
    ].forEach((key) => {
      if (Array.isArray(normalized[key]) && normalized[key].some((value) => value > 10)) {
        normalized[key] = [...new Set(normalized[key].map((value) => Math.min(value, 10)))];
        normalized.modelRangeCappedWarning = true;
      }
    });
  }

  normalized.includeExample = parseBoolean(
    normalized.includeExample ?? normalized.completedExample ?? normalized.example,
    false
  );

  if (GRADE2_ADDITION_SUBTRACTION_CATEGORY_C_IDS.has(item.id)) {
    normalized.includeExample = false;
  }

  normalized.includeEqualPairs = parseBoolean(
    normalized.includeEqualPairs ?? normalized.equalPairs,
    true
  );

  normalized.showJumpVisuals = parseBoolean(
    normalized.showJumpVisuals,
    true
  );

  normalized.showQuestionSentence = parseBoolean(
    normalized.showQuestionSentence,
    false
  );

  const responseMode = String(normalized.responseMode || "").trim().toLowerCase();
  if (["total_only", "multiplication_sentence"].includes(responseMode)) {
    normalized.responseMode = responseMode;
  }

  const taskMode = String(normalized.taskMode || "").trim().toLowerCase();
  if (["distribute", "circle_groups", "both"].includes(taskMode)) {
    normalized.taskMode = taskMode;
  }

  const equationSupport = String(normalized.equationSupport || "").trim().toLowerCase();
  if (["blanks", "independent"].includes(equationSupport)) {
    normalized.equationSupport = equationSupport;
  }

  if (
    item.activityTypes?.[0] === "number_word_match" &&
    String(normalized.numberWordMode || normalized.mode || "").toLowerCase() === "word_to_numeral"
  ) {
    const questionCount = finiteNumber(normalized.questionCount);
    if (questionCount !== null) {
      normalized.questionCount = Math.max(1, questionCount);
    }
  }

  return normalizeGrade3StoryProblemOptions(
    item,
  normalizeGrade2CategoryEBatch3Options(
    item,
  normalizeGrade2CategoryEBatch2Options(
    item,
  normalizeGrade2CategoryEBatch1Options(
    item,
  normalizeGrade2PictographReadingOptions(
    item,
  normalizeGrade2CategoryDLowRiskOptions(
    item,
    normalizeGrade1FractionOptions(
    item,
    normalizeGrade1DataReadingOptions(
      item,
      normalizeGrade1EquationMatchOptions(
      item,
      normalizeGrade1AdditionNumberLineOptions(
        item,
        normalizeGrade1CategoryCClosureOptions(
          item,
          normalizeGrade1MultiplicationModelOptions(
            item,
            normalizeGrade1NumberRepresentationOptions(
              item,
              normalizeGrade1FluencyComparisonOptions(
                item,
                normalizeGrade3PlaceValueBatch2Options(
                  item,
                  normalizeGrade3AdditionSubtractionBatch3Options(item, normalized)
                )
              )
            )
          )
        )
      )
      )
    )
    )
  ))))));
}

const NON_CUSTOMIZATION_QUERY_KEYS = new Set([
  "disposition",
  "filename",
  "source",
  "font",
  "cols"
]);

function filterCustomizationInput(options = {}) {
  return Object.keys(options).reduce((acc, key) => {
    if (!NON_CUSTOMIZATION_QUERY_KEYS.has(key)) {
      acc[key] = options[key];
    }
    return acc;
  }, {});
}

function resolveCatalogWorksheetOptions(item, options = {}) {
  const legacyOptions = normalizeCatalogWorksheetOptions(item, options);
  const family = getCustomizationFamilyForResource(item.id);

  if (!family) return legacyOptions;

  const customization = normalizeWorksheetCustomization(
    item.id,
    filterCustomizationInput(options)
  );

  if (!customization.ok) {
    const err = new Error(
      customization.errors[0]?.message || "Worksheet customization options are invalid."
    );
    err.status = 400;
    err.details = customization;
    throw err;
  }

  return normalizeCatalogWorksheetOptions(item, {
    ...legacyOptions,
    ...customization.generatorOptions,
    includeAnswerKey: customization.normalizedOptions.includeAnswerKey,
    _customization: customization
  });
}

function filterWorksheetCatalog({
  grade,
  domain,
  status,
  worksheetFamily,
  templateId,
  subject,
  query
} = {}) {
  let items = [...getMasterWorksheetCatalog()];

  if (grade) {
    items = items.filter((item) => Array.isArray(item.grades) && item.grades.includes(grade));
  }

  if (domain) {
    items = items.filter((item) => item.domain === domain);
  }

  if (status) {
    items = items.filter((item) => item.status === status);
  }

  if (worksheetFamily) {
    items = items.filter((item) => item.worksheetFamily === worksheetFamily);
  }

  if (templateId) {
    items = items.filter((item) => item.templateId === templateId);
  }

  if (subject) {
    items = items.filter((item) => item.subject === subject);
  }

  if (query) {
    const q = String(query).trim().toLowerCase();

    items = items.filter((item) => {
      const haystack = [
        item.id,
        item.title,
        item.shortTitle,
        item.subject,
        item.domain,
        item.skillKey,
        item.worksheetFamily,
        item.templateId,
        ...(item.grades || []),
        ...(item.gradeLabels || []),
        ...(item.activityTypes || []),
        ...(item.tags || []),
        ...(item.curriculumTags || []),
        item.description
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }

  return items;
}

function getWorksheetCatalogFilters() {
  const items = getMasterWorksheetCatalog();

  const grades = [...new Set(items.flatMap((item) => item.grades || []))].sort();
  const gradeLabels = [...new Set(items.flatMap((item) => item.gradeLabels || []))].sort();
  const domains = [...new Set(items.map((item) => item.domain).filter(Boolean))].sort();
  const statuses = [...new Set(items.map((item) => item.status).filter(Boolean))].sort();
  const worksheetFamilies = [...new Set(items.map((item) => item.worksheetFamily).filter(Boolean))].sort();
  const templateIds = [...new Set(items.map((item) => item.templateId).filter(Boolean))].sort();
  const subjects = [...new Set(items.map((item) => item.subject).filter(Boolean))].sort();

  return {
    grades,
    gradeLabels,
    domains,
    statuses,
    worksheetFamilies,
    templateIds,
    subjects
  };
}

function generateWorksheetFromCatalogId(id, options = {}) {
  const item = getAnyWorksheetCatalogById(id);

  if (!item) {
    throw new Error(`Worksheet catalog item not found: ${id}`);
  }

  if (!item.skillKey) {
    throw new Error(`Worksheet catalog item '${id}' is missing a skillKey.`);
  }

  const skill = getSkillDefinition(item.skillKey);

  if (!skill) {
    throw new Error(`No skill definition found for '${item.skillKey}'.`);
  }

  const grade = Array.isArray(item.grades) && item.grades.length ? item.grades[0] : null;

  if (!grade) {
    throw new Error(`Worksheet catalog item '${id}' is missing a grade.`);
  }

  const generatorOptions = resolveCatalogWorksheetOptions(item, options);
  const activityType = item.id === GRADE2_SHADE_EQUAL_PARTS_ID
    ? "grade2_shade_equal_parts"
    : item.id === GRADE2_SHARE_FAIRLY_TO_10_ID
      ? "grade2_share_fairly_to_10"
    : GRADE1_FRACTION_ACTIVITY_MODES[item.id]
      ? "grade1_fraction"
      : GRADE1_DATA_ACTIVITY_MODES[item.id] || item.activityTypes?.[0] || generatorOptions.preferredActivityType || generatorOptions.activityType || null;
  const defaultQuestionCount =
    activityType === "standard_form" && item.grades?.[0] === "grade2"
      ? 60
      : ["expanded_form", "standard_form"].includes(activityType)
        ? 45
        : null;

  const requestedQuestionCount = generatorOptions.questionCount || defaultQuestionCount || generatorOptions.questionCount;
  const generationQuestionCount =
    generatorOptions.includeExample &&
    Number.isFinite(requestedQuestionCount) &&
    completedExampleCountInsideQuestionTotal(item) === 0
      ? requestedQuestionCount + 1
      : requestedQuestionCount;

  try {
    const worksheet = buildWorksheet(
      grade,
      "CATALOG",
      {
        skillKey: item.skillKey,
        skill
      },
      {
        ...generatorOptions,
        questionCount: generationQuestionCount,
        studentQuestionCount: requestedQuestionCount,
        preferredActivityType: activityType,
        activityType,
        grade,
        worksheetId: item.id,
        worksheetTitle: item.title
      }
    );
    validateGrade1FractionWorksheet(item.id, worksheet.problems);
    validateGrade2ShadeEqualPartsWorksheet(item.id, worksheet.problems);
    validateGrade2ShareFairlyTo10Worksheet(item.id, worksheet.problems);
    return worksheet;
  } catch (err) {
    if (/No addition facts are available/.test(err.message)) {
      err.status = 400;
    }
    throw err;
  }
}

function buildRangeNotice(item, options = {}) {
 if (options.modelRangeCappedWarning) {
  return "Custom multiplication model range capped at 10 by 10 so the model remains printable in the fixed worksheet grid.";
 }

 const grade = Array.isArray(item.grades) ? item.grades[0] : "";
 if (grade !== "grade1") return "";

 const maxA = finiteNumber(options.maxA);
 const maxTotal = finiteNumber(options.maxTotal);
 const tenFramesPerQuestion = finiteNumber(options.tenFramesPerQuestion);
 const maxTenFrames = finiteNumber(options.maxTenFrames);
 const activityType = item.activityTypes?.[0] || "";

 if (
  ["math.addition.basic", "related_subtraction", "missing_addend", "compare_numbers", "fact_family", "word_problems", "addition_word_problem", "subtraction_word_problem", "missing_addend_word_problem"].includes(activityType) &&
  Math.max(maxA || 0, maxTotal || 0) > 20
 ) {
  return "Custom range selected: this goes beyond the Grade 1 default of facts within 20. Use for teacher-selected extension, review, intervention, or Grade 2 readiness.";
 }

 if (activityType === "number_word_match" && maxA !== null && maxA > 50) {
  return "Custom range selected: this goes beyond the Grade 1 default of numbers to 50. Use for teacher-selected extension, review, intervention, or Grade 2 readiness.";
 }

 if (
  activityType === "ten_frame" &&
  (maxA > 10 || tenFramesPerQuestion > 1 || maxTenFrames > 1)
 ) {
  return "Custom ten-frame range selected: totals may go beyond counting within 10. Use for teacher-selected extension or review.";
 }

 if (activityType === "number_line_identify" && maxA !== null && maxA > 20) {
  return "Custom range selected: this goes beyond the Grade 1 default of facts within 20. Use for teacher-selected extension, review, intervention, or Grade 2 readiness.";
 }

 return "";
}

function buildStudentFacingInstruction(item, fallback = "") {
 const activityType = item.activityTypes?.[0] || "";

 if (item.id === GRADE3_ADDITION_WORD_PROBLEMS_ID) {
  return "Solve each addition word problem. Show your thinking in the box.";
 }

 if (item.id === GRADE3_MISSING_ADDEND_WORD_PROBLEMS_ID) {
  return "Solve each missing-addend word problem. Show your thinking in the box.";
 }

 if (item.id === GRADE3_SUBTRACTION_WORD_PROBLEMS_ID) {
  return "Solve each subtraction word problem. Show your thinking in the box.";
 }

 if (item.id === GRADE2_ADDITION_WORD_PROBLEMS_WITHIN_100_ID) {
  return "Solve each addition word problem. Show your thinking in the box.";
 }

 if (item.id === GRADE2_MULTIPLICATION_WORD_PROBLEMS_ID) {
  return "Solve each equal-groups word problem. Show your thinking in the box.";
 }

 if (item.id === "grade1_multiplication_facts_arrays") {
  return "Count the rows and columns. Complete the number sentence for each array.";
 }

 if (item.id === "grade1_multiplication_facts_equal_groups") {
  return "Count the groups and the objects in each group. Complete the number sentence.";
 }

 if (item.id === GRADE2_EQUAL_GROUPS_ID) {
  return "Write a multiplication sentence for each model.";
 }

 if (item.id === GRADE1_ADDITION_NUMBER_LINE_ID) {
  return "Use the number line to solve each addition question.";
 }

 if (item.id === GRADE1_EQUATION_MATCH_ID) {
  return "Solve both sides. Write = if they have the same value. Write ≠ if they have different values.";
 }

 if (item.id === GRADE2_EQUATION_MATCH_ID) {
  return "Solve both sides. Write = if they have the same value. Write ≠ if they have different values.";
 }

 if (item.id === GRADE3_EQUATION_MATCH_ID) {
  return "Solve both sides. Write = if they have the same value. Write ≠ if they have different values.";
 }

 if (item.id === GRADE3_FACT_FAMILY_ID) {
  return "Use the numbers in each group to complete the related addition and subtraction facts.";
 }

 if (item.id === GRADE3_FACT_FLUENCY_ID) {
  return "Solve each addition or subtraction fact.";
 }

 if (item.id === GRADE3_MISSING_ADDEND_ID) {
  return "Write the missing number in each equation.";
 }

 if (item.id === GRADE2_NUMBER_LINE_IDENTIFY_ID) {
  return "Write the number marked on each number line.";
 }

 if (item.id === GRADE2_NUMBER_WORD_WRITE_ID) {
  return "Write each number in words.";
 }

 if (item.id === "grade1_data_display_graphing_read_graph") {
  return "Use the graph to answer each question.";
 }

 if (item.id === "grade1_data_display_graphing_interpret_data") {
  return "Use the graph to compare the categories and answer each question.";
 }

 if (item.id === "grade1_data_display_graphing_graph_questions") {
  return "Use the graph to answer each question.";
 }

 if (GRADE2_PICTOGRAPH_READING_IDS.has(item.id)) {
  return "Use the pictograph to answer each question.";
 }

 if (item.id === GRADE2_COMPLETE_PICTOGRAPH_ID) {
  return "Use the table to draw the missing circles in the pictograph.";
 }

 if (item.id === GRADE2_MATCHING_PICTOGRAPH_ID) {
  return "Use the table. Circle A or B to show which pictograph matches the data.";
 }

 if (item.id === "grade1_fraction_equivalence_shade_fraction_models") {
  return "Shade the equal parts to show each fraction.";
 }

 if (item.id === GRADE2_SHADE_EQUAL_PARTS_ID) {
  return "Shade the fraction shown for each model.";
 }

 if (item.id === GRADE2_SHARE_FAIRLY_TO_10_ID) {
  return "Share the objects equally. Write how many each person gets.";
 }

 if (item.id === "grade1_fraction_equivalence_match_equivalent_fractions") {
  return "Look at each pair. Circle Yes if the shaded parts show the same amount. Circle No if they do not.";
 }

 if (item.id === "grade1_fraction_equivalence_compare_fractions") {
  return "Look at each pair. Circle the share that is greater, or circle Same.";
 }

 if (item.id === "grade1_fraction_equivalence_fraction_word_problems") {
  return "Share the objects equally. You may split one object into equal halves. Draw whole objects and halves where needed.";
 }

 if (item.id === "g1_number_word_match_to_50") {
  return "Write each number in words.";
 }

 if (item.id === "g1_write_the_numeral_to_50") {
  return "Write the numeral for each number word.";
 }

 if (item.id === "grade1_place_value_representation_base_ten_blocks") {
  return "Count the base ten blocks. Write the number.";
 }

 if (item.id === GRADE2_BASE_TEN_BLOCKS_ID) {
  return "Count the base ten blocks. Write the number.";
 }

 if (item.id === GRADE3_NUMBER_WORD_ID) {
  return "Write each number in words.";
 }

 if (item.id === GRADE2_ADDITION_WITHIN_100_ID) {
  return "Solve each addition fact.";
 }

 if (item.id === GRADE2_MISSING_ADDENDS_WITHIN_100_ID) {
  return "Write the missing number in each equation.";
 }

 if (item.id === GRADE2_SUBTRACTION_WITHIN_100_ID) {
  return "Solve each subtraction fact.";
 }

 if (item.id === "g1_ten_frame_addition_within_10") {
  return "Count the dots. Write the number.";
 }

 if (activityType === "expanded_form") {
  return "Write each numeral in expanded form.";
 }

 if (activityType === "standard_form") {
  return "Write each number in standard form.";
 }

 if (activityType === "skip_counting") {
  return "Write the missing numbers in each skip-counting pattern.";
 }

 if (activityType === "related_subtraction") {
  return "Solve each subtraction fact.";
 }

 if (activityType === "missing_addend") {
  return "Write the missing number in each equation.";
 }

 if (activityType === "compare_numbers") {
  return "Write >, <, or = to compare each pair of numbers.";
 }

 if (activityType === "extend_pattern") {
  return "Extend each pattern. Write the next number.";
 }

 if (activityType === "missing_value_pattern") {
  return "Write the missing number in each pattern.";
 }

 if (activityType === "identify_pattern_rule") {
  return "Write the rule for each pattern.";
 }

  if (["array", "arrays"].includes(activityType)) {
    return "Use each array to write a multiplication equation.";
 }

 if (activityType === "equal_groups" && item.skillKey !== "division_foundations") {
  return "Write the total number of objects in each set of equal groups.";
 }

 if (activityType === "equal_groups" && item.skillKey === "division_foundations") {
  return "Share the dots equally and write a division equation.";
 }

 return fallback;
}

function patterningInstruction(item, activityType, normalizedOptions = {}) {
  if (activityType === "extend_pattern") {
    const continuationCount = Math.max(
      1,
      finiteNumber(normalizedOptions.continuationCount ?? normalizedOptions.extensionCount ?? normalizedOptions.answerCount) || 1
    );
    return continuationCount > 1
      ? "Extend each pattern. Write the next numbers."
      : "Extend each pattern. Write the next number.";
  }

  if (activityType === "missing_value_pattern") {
    const missingCount = Math.max(
      1,
      finiteNumber(normalizedOptions.missingTermCount ?? normalizedOptions.missingCount) || 1
    );
    return missingCount > 1
      ? "Write the missing numbers in each pattern."
      : "Write the missing number in each pattern.";
  }

  if (activityType === "identify_pattern_rule") {
    if (GRADE2_NUMERIC_PATTERN_IDS.has(item.id)) {
      return "Write the number that is added each time.";
    }
    return "Write the rule for each pattern.";
  }

  return "";
}

function resolvePatterningPageCapacity(item, activityType, normalizedOptions = {}) {
  const continuationCount = Math.max(
    1,
    finiteNumber(normalizedOptions.continuationCount ?? normalizedOptions.extensionCount ?? normalizedOptions.answerCount) || 1
  );
  const missingCount = Math.max(
    1,
    finiteNumber(normalizedOptions.missingTermCount ?? normalizedOptions.missingCount) || 1
  );
  const includeExample = Boolean(normalizedOptions.includeExample);
  const requestedPerPage = finiteNumber(normalizedOptions.questionsPerPage);

  if (requestedPerPage) return requestedPerPage;

  if (activityType === "identify_pattern_rule") {
    if (GRADE2_NUMERIC_PATTERN_IDS.has(item.id) && !includeExample) return 12;
    return includeExample ? 9 : 8;
  }

  if (activityType === "missing_value_pattern") {
    if (missingCount > 1) return includeExample ? 13 : 12;
    return includeExample ? 13 : 12;
  }

  if (activityType === "extend_pattern") {
    if (continuationCount >= 3) return includeExample ? 11 : 10;
    if (continuationCount === 2) return includeExample ? 13 : 12;
    return includeExample ? 13 : 16;
  }

  return 12;
}

function patterningSequenceFontSize(item, activityType, normalizedOptions = {}) {
  const grade = item.grades?.[0] || "";
  const continuationCount = Math.max(
    1,
    finiteNumber(normalizedOptions.continuationCount ?? normalizedOptions.extensionCount ?? normalizedOptions.answerCount) || 1
  );
  const missingCount = Math.max(
    1,
    finiteNumber(normalizedOptions.missingTermCount ?? normalizedOptions.missingCount) || 1
  );

  if (GRADE2_NUMERIC_PATTERN_IDS.has(item.id)) return 16;
  if (activityType === "extend_pattern" && continuationCount >= 3) return 12;
  if (activityType === "missing_value_pattern" && missingCount > 1) return grade === "grade2" ? 13 : 12.5;
  if (activityType === "identify_pattern_rule") return 13;
  return grade === "grade2" ? 13.5 : 13;
}

function resolveWorksheetSubtitle(item, display = {}, options = {}) {
 const explicitOptionSubtitle = typeof options.subtitle === "string"
  ? options.subtitle.trim()
  : "";
 const explicitDisplaySubtitle = typeof display.subtitle === "string"
  ? display.subtitle.trim()
  : "";

 if (explicitOptionSubtitle) return explicitOptionSubtitle;
 if (explicitDisplaySubtitle) return explicitDisplaySubtitle;
 if (display.showSubtitle === true) return item.shortTitle || "";

 return "";
}

function buildLayoutFromWorksheet(item, worksheet, options = {}) {
 const display = item.pdfDisplay && typeof item.pdfDisplay === "object"
  ? item.pdfDisplay
  : {};
 const normalizedOptions = resolveCatalogWorksheetOptions(item, options);
 const subtitle = resolveWorksheetSubtitle(item, display, normalizedOptions);
 const rangeNotice = buildRangeNotice(item, normalizedOptions);
 let instructionText = buildStudentFacingInstruction(
  item,
  item.studentInstruction || item.description || ""
 );
 const isReverseNumberWordMode = item.activityTypes?.[0] === "number_word_match" &&
  String(normalizedOptions.numberWordMode || normalizedOptions.mode || "").toLowerCase() === "word_to_numeral";
 const isGrade1NumberWordMode = GRADE1_NUMBER_WORD_RESOURCE_IDS.has(item.id);

 if (isReverseNumberWordMode) {
  instructionText = "Write the numeral for each number word.";
 }

  const title = GRADE2_NUMERIC_PATTERN_TITLES[item.id] ||
  GRADE3_NUMERIC_PATTERN_TITLES[item.id] ||
  GRADE3_PLACE_VALUE_TITLES[item.id] ||
  GRADE3_ADDITION_SUBTRACTION_BATCH3_TITLES[item.id] ||
  GRADE3_STORY_PROBLEM_TITLES[item.id] ||
  (item.id === GRADE3_NUMBER_WORD_ID
    ? isReverseNumberWordMode ? "Write the Numeral" : "Write Number Words"
    : isReverseNumberWordMode
  ? "Write the Numeral to 50"
  : item.id === "grade1_multiplication_facts_arrays"
    ? "Arrays"
    : item.id === "grade1_multiplication_facts_equal_groups"
      ? "Equal Groups"
      : item.id === GRADE2_EQUAL_GROUPS_ID
        ? "Multiplication Equal Groups"
      : item.id === "grade1_multiplication_facts_skip_counting"
        ? "Skip Counting"
        : item.id === "grade1_place_value_representation_expanded_form"
          ? "Expanded Form"
          : item.id === GRADE1_ADDITION_NUMBER_LINE_ID
            ? "Addition on a Number Line"
            : item.id === GRADE1_EQUATION_MATCH_ID || item.id === GRADE2_EQUATION_MATCH_ID
              ? "Equal or Not Equal?"
              : item.id === GRADE2_NUMBER_LINE_IDENTIFY_ID
                ? "Identify Numbers on a Number Line"
                  : item.id === GRADE2_NUMBER_WORD_WRITE_ID
                  ? "Write Number Words to 200"
                  : item.id === GRADE2_ARRAYS_ID
                    ? "Arrays"
                  : item.id === GRADE2_BASE_TEN_BLOCKS_ID
                    ? "Base Ten Blocks"
                  : item.id === GRADE2_ADDITION_WITHIN_100_ID
                    ? "Addition Facts Within 100"
                  : item.id === GRADE2_MISSING_ADDENDS_WITHIN_100_ID
                    ? "Missing Addends Within 100"
                  : item.id === GRADE2_SUBTRACTION_WITHIN_100_ID
                    ? "Subtraction Facts Within 100"
                  : item.id === GRADE2_ADDITION_WORD_PROBLEMS_WITHIN_100_ID
                    ? "Addition Word Problems Within 100"
                  : item.id === GRADE2_MULTIPLICATION_WORD_PROBLEMS_ID
                    ? "Equal Groups Word Problems"
                  : item.id === GRADE2_SHADE_EQUAL_PARTS_ID
                    ? "Shade Equal Parts"
                    : item.id === GRADE2_SHARE_FAIRLY_TO_10_ID
                      ? "Share Fairly to 10"
              : item.id === "grade1_data_display_graphing_read_graph"
                ? "Read the Graph"
                : item.id === "grade1_data_display_graphing_interpret_data"
                  ? "Compare the Data"
                  : item.id === "grade1_data_display_graphing_graph_questions"
                    ? "Graph Questions"
                    : item.id === "grade2_data_display_graphing_read_graph"
                      ? "Read the Pictograph"
                    : item.id === "grade2_data_display_graphing_interpret_data"
                      ? "Interpret the Pictograph"
                      : item.id === GRADE2_COMPLETE_PICTOGRAPH_ID
                        ? "Finish the Pictograph"
                        : item.id === GRADE2_MATCHING_PICTOGRAPH_ID
                          ? "Choose the Matching Pictograph"
      : item.title);

 const layout = normalizeWorksheetLayout({
  title,
  subtitle,
  meta: {
    grade: item.grades?.[0] || "",
    gradeLabel: item.gradeLabels?.[0] || "",
    subject: item.subject || "Math",
    subjectLabel: item.subject || "Math",
    strand: item.domain || "",
    strandLabel: item.domain || "",
    skillLabel: worksheet.skill?.title || item.skillKey || ""
  },
  instruction: [instructionText, rangeNotice]
    .filter(Boolean)
    .join(" "),
  modeId: item.activityTypes?.[0] || "",
  skillKey: item.skillKey || "",
  problems: worksheet.problems || [],
  sections: []
});

if (item.pdfLayout && typeof item.pdfLayout === "object") {
  layout.template = {
    ...(layout.template || {}),
    ...item.pdfLayout
  };
}

if (item.pdfDisplay && typeof item.pdfDisplay === "object") {
  layout.display = {
    ...(layout.display || {}),
    ...item.pdfDisplay
  };
}

if (
  item.activityTypes?.[0] === "base_ten_blocks" &&
  ["tens_ones", "tens-ones", "place_value_boxes"].includes(
    String(normalizedOptions.responseMode || normalizedOptions.baseTenResponseMode || "").toLowerCase()
  )
) {
  layout.display = {
    ...(layout.display || {}),
    baseTenTensOnesBoxes: true
  };
}

if (item.activityTypes?.[0] === "base_ten_blocks" && layout.display?.baseTenAlignedResponse) {
  layout.display = {
    ...(layout.display || {}),
    visualVerticalAlign: item.id === "grade1_place_value_representation_base_ten_blocks"
      ? "topThird"
      : "center"
  };
}

if (item.id === GRADE2_BASE_TEN_BLOCKS_ID) {
  layout.template = {
    ...(layout.template || {}),
    columns: 1,
    maxProblemsPerPage: 10
  };
  layout.display = {
    ...(layout.display || {}),
    hideItemPrompts: true,
    hideSubtitle: true,
    visualVerticalAlign: "center"
  };
}

if (normalizedOptions.includeExample && layout.problems?.length) {
  const completedExampleCount = completedExampleCountInsideQuestionTotal(item);
  layout.display = {
    ...(layout.display || {}),
    includeExample: true,
    exampleCountsAsQuestion: completedExampleCount > 0
  };
  layout.problems = layout.problems.map((problem, index) => ({
    ...problem,
    isExample: index < Math.max(1, completedExampleCount)
  }));
}

if (Number.isFinite(normalizedOptions.questionsPerPage) && normalizedOptions.questionsPerPage > 0) {
  layout.template = {
    ...(layout.template || {}),
    maxProblemsPerPage: normalizedOptions.questionsPerPage
  };
}

if (GRADE2_CATEGORY_E_BATCH3_IMPLEMENTED_IDS.has(item.id)) {
  layout.template = {
    ...(layout.template || {}),
    columns: 1,
    maxProblemsPerPage: finiteNumber(normalizedOptions.questionsPerPage) || 3
  };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    compactWordProblemAnswerKey: true,
    workSpaceBox: true,
    equalHeightItems: true,
    hideItemSeparators: true
  };
}

if (GRADE3_STORY_PROBLEM_IDS.has(item.id)) {
  layout.template = {
    ...(layout.template || {}),
    columns: 1,
    maxProblemsPerPage: finiteNumber(normalizedOptions.questionsPerPage) || 3
  };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    compactWordProblemAnswerKey: true,
    workSpaceBox: true,
    equalHeightItems: true,
    hideItemSeparators: true
  };
}

if (["math.addition.basic", "related_subtraction", "missing_addend"].includes(item.activityTypes?.[0])) {
  layout.display = {
    ...(layout.display || {}),
    answerTargetVariant: "shortNumeric",
    standardShortAnswerTarget: true
  };
}

if (item.activityTypes?.[0] === "compare_numbers") {
  const isGrade2Comparison = GRADE2_COMPARISON_IDS.has(item.id);
  layout.template = {
    ...(layout.template || {}),
    columns: isGrade2Comparison ? 2 : 4,
    maxProblemsPerPage: finiteNumber(normalizedOptions.questionsPerPage) || (isGrade2Comparison ? 12 : 60)
  };
  layout.display = {
    ...(layout.display || {}),
    answerTargetVariant: "comparisonSymbol",
    standardShortAnswerTarget: true,
    standardAnswerLineWidth: isGrade2Comparison ? 52 : 34,
    standardAnswerBlankText: "___",
    hideItemSeparators: true,
    equalHeightItems: true,
    denseGridRows: isGrade2Comparison ? 6 : 15,
    sequentialColumnFill: isGrade2Comparison,
    grade2ComparisonLayout: isGrade2Comparison,
    comparisonTargetWidth: isGrade2Comparison ? 52 : 34,
    comparisonFontSize: isGrade2Comparison ? 16 : 12
  };
}

if (GRADE2_COMPACT_QUICK_CHECK_IDS.has(item.id)) {
  layout.instruction = item.studentInstructions || layout.instruction;
  layout.template = {
    ...(layout.template || {}),
    columns: 2,
    maxProblemsPerPage: 6
  };
  layout.display = {
    ...(layout.display || {}),
    compactAssessmentLayout: true,
    resourceKindLabel: "Quick Check",
    assessmentColumns: 2,
    assessmentRowsPerColumn: 3,
    inlineTargetsOnly: true,
    showMetadataSubtitle: false,
    showTimeEstimate: false,
    showTeacherPanel: false,
    showRatingStrip: false,
    denseGridRows: 3,
    sequentialColumnFill: true
  };
}

if (item.id === GRADE2_COMPACT_EXIT_TICKET_ID) {
  layout.instruction = item.studentInstructions || layout.instruction;
  layout.template = {
    ...(layout.template || {}),
    columns: 1,
    maxProblemsPerPage: 3
  };
  layout.display = {
    ...(layout.display || {}),
    compactAssessmentLayout: true,
    resourceKindLabel: "Exit Ticket",
    cutApartTicketCount: 2,
    assessmentItemsPerTicket: 3,
    inlineTargetsOnly: true,
    showMetadataSubtitle: false,
    showTimeEstimate: false,
    denseGridRows: 3,
    sequentialColumnFill: true
  };
}

if (
  ["extend_pattern", "missing_value_pattern", "identify_pattern_rule"].includes(item.activityTypes?.[0]) &&
  (item.resourceType || "worksheet") === "worksheet"
) {
  const activityType = item.activityTypes[0];
  const continuationCount = Math.max(
    1,
    finiteNumber(normalizedOptions.continuationCount ?? normalizedOptions.extensionCount ?? normalizedOptions.answerCount) || 1
  );
  const missingCount = Math.max(
    1,
    finiteNumber(normalizedOptions.missingTermCount ?? normalizedOptions.missingCount) || 1
  );
  const isGrade2NumericPattern = GRADE2_NUMERIC_PATTERN_IDS.has(item.id);
  const maxProblemsPerPage = resolvePatterningPageCapacity(item, activityType, normalizedOptions);
  const columns = isGrade2NumericPattern
    ? 2
    : activityType === "identify_pattern_rule" ? 1 : 2;

  layout.instruction = patterningInstruction(item, activityType, normalizedOptions);
  layout.template = {
    ...(layout.template || {}),
    columns,
    maxProblemsPerPage
  };
  layout.display = {
    ...(layout.display || {}),
    patterningLayout: activityType,
    patterningContinuationCount: continuationCount,
    patterningMissingCount: missingCount,
    patterningPageCapacity: maxProblemsPerPage,
    patterningSequenceFontSize: patterningSequenceFontSize(item, activityType, normalizedOptions),
    patterningTargetStrokeColor: isGrade2NumericPattern ? "#68788f" : "#8f98a8",
    patterningTargetStrokeWidth: isGrade2NumericPattern ? 1.15 : 0.95,
    patterningCommaGap: isGrade2NumericPattern ? 8 : 5,
    patterningExtendTargetWidth: isGrade2NumericPattern ? 68 : 56,
    patterningMissingTargetWidth: isGrade2NumericPattern ? 64 : 58,
    patterningRuleTargetWidth: isGrade2NumericPattern ? 64 : 120,
    patterningResponseFontSize: isGrade2NumericPattern ? 15 : patterningSequenceFontSize(item, activityType, normalizedOptions),
    patterningRuleResponseMode: isGrade2NumericPattern && activityType === "identify_pattern_rule"
      ? "add_step"
      : "written_rule",
    denseGridRows: isGrade2NumericPattern ? 6 : Math.ceil(maxProblemsPerPage / columns),
    sequentialColumnFill: true,
    equalHeightItems: true,
    hideItemSeparators: false,
    patterningPublicReady: true
  };
}

if (["array", "arrays"].includes(item.activityTypes?.[0]) && (item.resourceType || "worksheet") === "worksheet") {
  const questionsPerPage = finiteNumber(normalizedOptions.questionsPerPage);
  layout.template = {
    ...(layout.template || {}),
    columns: 2,
    maxProblemsPerPage: questionsPerPage || 8
  };
  layout.display = {
    ...(layout.display || {}),
    visualColumns: 2,
    multiplicationModelEquation: true,
    multiplicationModelFamily: "array",
    multiplicationModelConvention: "rows_columns",
    arrayModelAlign: "left",
    arrayModelGutter: 18,
    equalHeightItems: true,
    hideItemSeparators: false,
    hideSubtitle: GRADE1_MULTIPLICATION_MODEL_IDS.has(item.id),
    suppressExampleLabel: GRADE1_MULTIPLICATION_MODEL_IDS.has(item.id),
    completedExampleAnswerOnlyEmphasis: GRADE1_MULTIPLICATION_MODEL_IDS.has(item.id)
  };
}

if (
  item.activityTypes?.[0] === "equal_groups" &&
  item.skillKey !== "division_foundations" &&
  (item.resourceType || "worksheet") === "worksheet"
) {
  const questionsPerPage = finiteNumber(normalizedOptions.questionsPerPage);
  const responseMode = normalizedOptions.responseMode || "multiplication_sentence";
  const showQuestionSentence = Boolean(normalizedOptions.showQuestionSentence);
  layout.instruction = item.id === "grade1_multiplication_facts_equal_groups"
    ? "Count the groups and the objects in each group. Complete the number sentence."
    : item.id === GRADE2_EQUAL_GROUPS_ID
      ? "Write a multiplication sentence for each model."
    : responseMode === "total_only"
      ? showQuestionSentence
        ? "Read each description and write the total number of dots."
        : "Write the total number of dots in each model."
      : showQuestionSentence
        ? "Read each description and use the model to write a multiplication equation."
        : "Use each model to write a multiplication equation.";
  if (rangeNotice) {
    layout.instruction = [layout.instruction, rangeNotice].join(" ");
  }
  layout.template = {
    ...(layout.template || {}),
    columns: 2,
    maxProblemsPerPage: questionsPerPage || 8
  };
  layout.display = {
    ...(layout.display || {}),
    visualColumns: 2,
    multiplicationModelEquation: responseMode !== "total_only",
    multiplicationModelTotalOnly: responseMode === "total_only",
    multiplicationModelFamily: "equal_groups",
    multiplicationModelConvention: "groups_items",
    equalHeightItems: true,
    hideItemSeparators: false,
    hideSubtitle: GRADE1_MULTIPLICATION_MODEL_IDS.has(item.id) || item.id === GRADE2_EQUAL_GROUPS_ID,
    suppressExampleLabel: GRADE1_MULTIPLICATION_MODEL_IDS.has(item.id) || item.id === GRADE2_EQUAL_GROUPS_ID,
    completedExampleAnswerOnlyEmphasis: GRADE1_MULTIPLICATION_MODEL_IDS.has(item.id)
  };
}

if (
  item.activityTypes?.[0] === "equal_groups" &&
  item.skillKey === "division_foundations" &&
  (item.resourceType || "worksheet") === "worksheet"
) {
  const questionsPerPage = finiteNumber(normalizedOptions.questionsPerPage);
  const taskMode = normalizedOptions.taskMode || "distribute";
  const equationSupport = normalizedOptions.equationSupport || "blanks";
  const showQuestionSentence = Boolean(normalizedOptions.showQuestionSentence);
  const action = taskMode === "circle_groups"
    ? "Circle equal groups"
    : taskMode === "both"
      ? "Share or circle the dots equally"
      : "Share the dots equally";
  const response = equationSupport === "independent"
    ? "write the division equation"
    : "complete the division equation";

  layout.instruction = showQuestionSentence
    ? `Read each description. ${action} and ${response}.`
    : `${action} and ${response}.`;
  layout.template = {
    ...(layout.template || {}),
    columns: 1,
    maxProblemsPerPage: questionsPerPage || 3
  };
  layout.display = {
    ...(layout.display || {}),
    visualColumns: 1,
    divisionModel: true,
    divisionEquationBlanks: equationSupport !== "independent",
    divisionEquationIndependent: equationSupport === "independent",
    equalSharingTaskMode: taskMode,
    equalHeightItems: true,
    hideItemSeparators: false
  };
}

if (item.activityTypes?.[0] === "standard_form" && (item.resourceType || "worksheet") === "worksheet") {
  const grade = item.grades?.[0] || "";
  const isGrade2 = grade === "grade2";
  const standardAnswerLineWidth = isGrade2
    ? 46
    : grade === "grade3"
      ? 52
      : 58;
  layout.template = {
    ...(layout.template || {}),
    columns: isGrade2 ? 4 : 3,
    maxProblemsPerPage: isGrade2 ? 60 : 45
  };
  layout.display = {
    ...(layout.display || {}),
    denseGridRows: 15,
    sequentialColumnFill: true,
    standardShortAnswerTarget: true,
    standardFormCompact: true,
    standardAnswerLineWidth,
    standardAnswerLineVisible: false
  };
}

if (item.activityTypes?.[0] === "expanded_form" && (item.resourceType || "worksheet") === "worksheet") {
  if (String(normalizedOptions.answerStyle || "") === "hundreds_tens_ones") {
    layout.display = {
      ...(layout.display || {}),
      compactExpandedForm: false,
      writingLine: false,
      answerLineBelowPrompt: false
    };
  } else {
    const isGrade1Closure = item.id === "grade1_place_value_representation_expanded_form";
    layout.template = {
      ...(layout.template || {}),
      columns: 3,
      maxProblemsPerPage: isGrade1Closure ? 18 : 45
    };
    layout.display = {
      ...(layout.display || {}),
      denseGridRows: isGrade1Closure ? 6 : 15,
      sequentialColumnFill: true,
      compactExpandedForm: true,
      writingLine: false,
      answerLineBelowPrompt: false,
      hideSubtitle: isGrade1Closure,
      suppressExampleLabel: isGrade1Closure
    };
  }
}

if (
  ["expanded_form", "standard_form"].includes(item.activityTypes?.[0]) &&
  (item.resourceType || "worksheet") !== "worksheet"
) {
  const compactCount = Math.max(
    1,
    finiteNumber(normalizedOptions.questionCount) || worksheet.problems?.length || 6
  );
  layout.template = {
    ...(layout.template || {}),
    columns: 1,
    maxProblemsPerPage: compactCount
  };
  layout.display = {
    ...(layout.display || {}),
    compactExpandedForm: false,
    denseGridRows: compactCount,
    sequentialColumnFill: true,
    standardShortAnswerTarget: item.activityTypes?.[0] === "standard_form"
  };
}

if (item.activityTypes?.[0] === "skip_counting") {
  const termCount = Math.max(
    3,
    Math.min(15, finiteNumber(normalizedOptions.termCount ?? normalizedOptions.sequenceLength, 8) || 8)
  );
  const maxProblemsPerPage = termCount >= 13 ? 6 : termCount >= 9 ? 8 : 10;

  layout.template = {
    ...(layout.template || {}),
    columns: 1,
    maxProblemsPerPage
  };
  layout.display = {
    ...(layout.display || {}),
    denseGridRows: maxProblemsPerPage,
    sequentialColumnFill: true,
    skipCountingRow: true,
    skipCountingArrows: normalizedOptions.showJumpVisuals !== false,
    showJumpVisuals: normalizedOptions.showJumpVisuals !== false,
    hideSubtitle: item.id === "grade1_multiplication_facts_skip_counting",
    suppressExampleLabel: item.id === "grade1_multiplication_facts_skip_counting"
  };
}

if (item.id === GRADE1_ADDITION_NUMBER_LINE_ID) {
  layout.template = {
    ...(layout.template || {}),
    columns: 1,
    maxProblemsPerPage: 6
  };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    suppressExampleLabel: true,
    numberLineAddition: true,
    numberLineFullContentWidth: true,
    numberLineRowGeometry: true,
    numberLineAnswerUnderTarget: false,
    hideItemPrompts: false,
    equalHeightItems: true,
    denseGridRows: 6,
    hideItemSeparators: true,
    sequentialColumnFill: true,
    standardAnswerLineWidth: 42
  };
}

if (item.id === GRADE1_EQUATION_MATCH_ID) {
  layout.template = {
    ...(layout.template || {}),
    columns: 2,
    maxProblemsPerPage: 12
  };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    suppressExampleLabel: true,
    hideItemSeparators: true,
    standardShortAnswerTarget: true,
    answerTargetVariant: "comparisonSymbol",
    standardAnswerLineWidth: 34,
    equalHeightItems: true,
    denseGridRows: 6,
    sequentialColumnFill: true
  };
}

if (item.id === GRADE2_EQUATION_MATCH_ID) {
  layout.template = {
    ...(layout.template || {}),
    columns: 2,
    maxProblemsPerPage: 12
  };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    suppressExampleLabel: true,
    hideItemSeparators: true,
    standardShortAnswerTarget: true,
    answerTargetVariant: "comparisonSymbol",
    standardAnswerLineWidth: 34,
    equalHeightItems: true,
    denseGridRows: 6,
    sequentialColumnFill: true
  };
}

if (item.id === GRADE3_EQUATION_MATCH_ID) {
  layout.template = {
    ...(layout.template || {}),
    columns: 2,
    maxProblemsPerPage: finiteNumber(normalizedOptions.questionsPerPage) || 12
  };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    suppressExampleLabel: true,
    hideItemSeparators: true,
    standardShortAnswerTarget: true,
    answerTargetVariant: "comparisonSymbol",
    standardAnswerLineWidth: 34,
    equalHeightItems: true,
    denseGridRows: 6,
    sequentialColumnFill: true
  };
}

if (item.id === GRADE3_FACT_FAMILY_ID) {
  layout.template = {
    ...(layout.template || {}),
    columns: 2,
    maxProblemsPerPage: finiteNumber(normalizedOptions.questionsPerPage) || 12
  };
  layout.display = {
    ...(layout.display || {}),
    factFamilyGrid: true,
    hideSubtitle: true,
    hideItemSeparators: true,
    equalHeightItems: true,
    denseGridRows: 6,
    sequentialColumnFill: true
  };
}

if ([GRADE3_FACT_FLUENCY_ID, GRADE3_MISSING_ADDEND_ID].includes(item.id)) {
  layout.template = {
    ...(layout.template || {}),
    columns: 3,
    maxProblemsPerPage: finiteNumber(normalizedOptions.questionsPerPage) || 24
  };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    hideItemSeparators: true,
    answerTargetVariant: "shortNumeric",
    standardShortAnswerTarget: true,
    standardAnswerLineWidth: 42,
    equalHeightItems: true,
    denseGridRows: 8,
    sequentialColumnFill: true
  };
}

if (item.id === GRADE2_NUMBER_LINE_IDENTIFY_ID) {
  layout.template = {
    ...(layout.template || {}),
    columns: 1,
    maxProblemsPerPage: 6
  };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    suppressExampleLabel: true,
    numberLineFullContentWidth: true,
    numberLineRowGeometry: true,
    numberLineAnswerUnderTarget: true,
    numberLineEndpointSafeInset: true,
    hideItemPrompts: true,
    equalHeightItems: true,
    denseGridRows: 6,
    hideItemSeparators: true,
    sequentialColumnFill: true,
    standardAnswerLineWidth: 64
  };
}

if (GRADE1_DATA_READING_IDS.has(item.id)) {
  const questionCount = GRADE1_DATA_QUESTION_COUNTS[item.id];
  const graphData = layout.problems?.[0]?.graphData || null;
  layout.template = {
    ...(layout.template || {}),
    columns: 2,
    maxProblemsPerPage: questionCount
  };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    suppressExampleLabel: true,
    hideItemSeparators: true,
    writingLine: true,
    answerLineBelowPrompt: true,
    grade1DataResponseLines: true,
    dataResponseLineInset: 44,
    dataResponsePromptGap: 28,
    dataResponseLineWidths: {
      number: 64,
      category: 136,
      yes_no: 84
    },
    equalHeightItems: true,
    denseGridRows: Math.ceil(questionCount / 2),
    sequentialColumnFill: true,
    sharedDataPictograph: true,
    sharedDataGraph: graphData,
    sharedDataGraphHeight: 218,
    sharedDataScenario: graphData?.scenario || "",
    sharedDataScenarioPlacement: "between_instruction_and_graph",
    sharedDataScenarioAlign: "left",
    sharedDataScenarioFullWidth: true,
    sharedDataScenarioMaxLines: 2
  };
}

if (GRADE2_PICTOGRAPH_READING_IDS.has(item.id)) {
  const questionCount = 6;
  const graphData = layout.problems?.[0]?.graphData || null;
  layout.template = {
    ...(layout.template || {}),
    columns: 2,
    maxProblemsPerPage: questionCount
  };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    suppressExampleLabel: true,
    hideItemSeparators: true,
    writingLine: true,
    answerLineBelowPrompt: true,
    sharedDataResponseLines: true,
    dataResponseLineInset: 44,
    dataResponsePromptGap: 28,
    dataResponseLineWidths: {
      number: 64,
      category: 136,
      yes_no: 84
    },
    equalHeightItems: true,
    denseGridRows: 3,
    sequentialColumnFill: true,
    sharedDataPictograph: true,
    sharedDataGraph: graphData,
    sharedDataGraphHeight: 218,
    sharedDataSymbolStrokeColor: "#4b5563",
    sharedDataSymbolStrokeWidth: 1.15,
    sharedDataScenario: graphData?.scenario || "",
    sharedDataScenarioPlacement: "between_instruction_and_graph",
    sharedDataScenarioAlign: "left",
    sharedDataScenarioFullWidth: true,
    sharedDataScenarioMaxLines: 2
  };
}

if (item.id === GRADE2_COMPLETE_PICTOGRAPH_ID) {
  const graphData = layout.problems?.[0]?.graphData || null;
  const constructionPictograph = {
    width: 504,
    height: 298,
    headerHeight: 42,
    bodyHeight: 256,
    categoryHeight: 64,
    labelWidth: 112,
    symbolDiameter: 22,
    symbolGap: 38,
    symbolInset: 28,
    placement: "after_scenario_and_data_table"
  };
  layout.template = { ...(layout.template || {}), columns: 1, maxProblemsPerPage: 1 };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    suppressExampleLabel: true,
    hideItemSeparators: true,
    sharedDataTaskMode: "complete_graph",
    sharedDataPictograph: true,
    sharedDataGraph: graphData,
    sharedDataGraphHeight: constructionPictograph.height,
    constructionPictograph,
    sharedDataSymbolStrokeColor: "#4b5563",
    sharedDataSymbolStrokeWidth: 1.15,
    sharedDataScenario: graphData?.scenario || "",
    sharedDataScenarioPlacement: "between_instruction_and_graph",
    sharedDataScenarioAlign: "left",
    sharedDataScenarioFullWidth: true,
    sharedDataScenarioMaxLines: 2,
    sequentialColumnFill: true
  };
}

if (item.id === GRADE2_MATCHING_PICTOGRAPH_ID) {
  layout.template = { ...(layout.template || {}), columns: 1, maxProblemsPerPage: 2 };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    suppressExampleLabel: true,
    hideItemSeparators: false,
    sharedDataTaskMode: "match_graph",
    sharedDataPictograph: true,
    sharedDataSymbolStrokeColor: "#4b5563",
    sharedDataSymbolStrokeWidth: 1.15,
    sequentialColumnFill: true
  };
}

if (GRADE1_DATA_BATCH3_IDS.has(item.id)) {
  const taskMode = GRADE1_DATA_ACTIVITY_MODES[item.id];
  const questionCount = GRADE1_DATA_QUESTION_COUNTS[item.id];
  const graphData = layout.problems?.[0]?.graphData || null;
  const constructionPictograph = taskMode === "complete_graph"
    ? {
        width: 504,
        height: 298,
        headerHeight: 42,
        bodyHeight: 256,
        categoryHeight: 64,
        labelWidth: 112,
        symbolDiameter: 22,
        symbolGap: 38,
        symbolInset: 28,
        placement: "after_scenario_and_data_table"
      }
    : null;
  layout.template = {
    ...(layout.template || {}),
    columns: taskMode === "graph_application" ? 2 : 1,
    maxProblemsPerPage: questionCount
  };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    suppressExampleLabel: true,
    hideItemSeparators: taskMode !== "match_graph",
    grade1DataTaskMode: taskMode,
    sharedDataPictograph: taskMode !== "match_graph",
    sharedDataGraph: graphData,
    sharedDataGraphHeight: constructionPictograph?.height || 218,
    constructionPictograph,
    sharedDataScenario: graphData?.scenario || "",
    sharedDataScenarioPlacement: "between_instruction_and_graph",
    sharedDataScenarioAlign: "left",
    sharedDataScenarioFullWidth: true,
    sharedDataScenarioMaxLines: 2,
    writingLine: taskMode === "graph_application",
    answerLineBelowPrompt: taskMode === "graph_application",
    grade1DataResponseLines: taskMode === "graph_application",
    dataResponseLineInset: 44,
    dataResponsePromptGap: 28,
    dataResponseLineWidths: { number: 64, category: 136, yes_no: 84 },
    equalHeightItems: taskMode === "graph_application",
    denseGridRows: taskMode === "graph_application" ? 2 : questionCount,
    sequentialColumnFill: true
  };
}

if (GRADE1_FRACTION_ACTIVITY_MODES[item.id]) {
  const taskMode = GRADE1_FRACTION_ACTIVITY_MODES[item.id];
  const questionCount = GRADE1_FRACTION_QUESTION_COUNTS[item.id];
  const columns = taskMode === "half_two_fourths" || taskMode === "share_fairly" ? 1 : 2;
  layout.template = {
    ...(layout.template || {}),
    columns,
    maxProblemsPerPage: questionCount
  };
  layout.worksheetType = "fraction_visual";
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    suppressExampleLabel: true,
    grade1FractionTaskMode: taskMode,
    grade1FractionRenderer: true,
    layoutVariant: taskMode === "share_fairly"
      ? "fair_share_rows"
      : taskMode === "half_two_fourths"
        ? "fraction_strip_pairs"
        : "fraction_strip_grid",
    visualColumns: columns,
    equalHeightItems: true,
    hideItemSeparators: taskMode !== "half_two_fourths",
    separateWorkedModel: ["shade_equal_parts", "share_fairly"].includes(taskMode),
    completedQuestionOne: taskMode === "compare_fair_shares" && Boolean(normalizedOptions.includeExample)
  };
}

if (item.id === GRADE2_SHADE_EQUAL_PARTS_ID) {
  layout.template = {
    ...(layout.template || {}),
    columns: 2,
    maxProblemsPerPage: 8
  };
  layout.worksheetType = "fraction_visual";
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    suppressExampleLabel: true,
    fractionTaskMode: "shade_equal_parts",
    sharedFractionRenderer: true,
    fractionAllowedDenominators: [2, 3, 4, 6],
    layoutVariant: "fraction_strip_grid",
    visualColumns: 2,
    equalHeightItems: true,
    hideItemSeparators: true,
    separateWorkedModel: false,
    completedQuestionOne: false
  };
}

if (item.id === GRADE2_SHARE_FAIRLY_TO_10_ID) {
  layout.template = {
    ...(layout.template || {}),
    columns: 1,
    maxProblemsPerPage: 2
  };
  layout.worksheetType = "fraction_visual";
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    suppressExampleLabel: true,
    fractionTaskMode: "share_fairly",
    sharedFractionRenderer: true,
    layoutVariant: "fair_share_rows",
    visualColumns: 1,
    equalHeightItems: true,
    hideItemSeparators: true,
    separateWorkedModel: false,
    completedQuestionOne: false,
    fairShareItemsPerPage: 2,
    fairShareResponseTarget: true,
    fairShareAnswerKeySlotGap: 18
  };
}

if (item.activityTypes?.[0] === "ten_frame") {
  if (item.id === "g1_ten_frame_addition_within_10") {
    const questionCount = Math.max(
      1,
      finiteNumber(normalizedOptions.questionCount) || worksheet.problems?.length || 10
    );
    const compact = questionCount <= 5;
    const medium = questionCount >= 6 && questionCount <= 8;
    const tenFrameBand = compact
      ? "low_count_two_column"
      : medium
        ? "medium_count_full_width"
        : "standard_full_width";

    layout.template = {
      ...(layout.template || {}),
      columns: compact ? 2 : 1,
      maxProblemsPerPage: compact ? 5 : medium ? questionCount : 10
    };
    layout.display = {
      ...(layout.display || {}),
      visualColumns: compact ? 2 : 1,
      visualVerticalAlign: "topThird",
      shortVisualAnswerLine: true,
      hideItemPrompts: true,
      tenFrameQuestionLayout: compact ? "two_column" : "full_width",
      tenFrameResponsiveBand: tenFrameBand,
      tenFrameScale: compact ? 1.42 : medium ? 1.24 : 1,
      visualHorizontalAlign: compact || medium ? "center" : null,
      visualAnswerLineAlign: compact || medium ? "center" : null,
      shortVisualAnswerLineRatio: compact ? 0.68 : medium ? 0.6 : null,
      visualAnswerLineYRatio: compact ? 0.84 : medium ? 0.9 : null
    };
  } else {
  const fixedFrames = finiteNumber(normalizedOptions.tenFramesPerQuestion);
  const maxFrames = finiteNumber(normalizedOptions.maxTenFrames);
  const framesPerQuestion = Math.max(1, fixedFrames || maxFrames || 1);
  const frameCapacity = framesPerQuestion >= 6 ? 5 : layout.template?.maxProblemsPerPage || 10;
  const visualColumns = framesPerQuestion >= 6 ? 1 : 2;

  layout.template = {
    ...(layout.template || {}),
    maxProblemsPerPage: Math.min(layout.template?.maxProblemsPerPage || frameCapacity, frameCapacity)
  };
  layout.display = {
    ...(layout.display || {}),
    visualColumns
  };
  }
}

if (isGrade1NumberWordMode || item.id === GRADE2_NUMBER_WORD_WRITE_ID || item.id === GRADE3_NUMBER_WORD_ID) {
  const questionCount = Math.max(
    1,
    finiteNumber(normalizedOptions.questionCount) || worksheet.problems?.length || 20
  );
  const pageCount = Math.min(30, questionCount);
  const derivedColumns = pageCount > 20 ? 3 : 2;

  layout.template = {
    ...(layout.template || {}),
    columns: derivedColumns,
    maxProblemsPerPage: [GRADE2_NUMBER_WORD_WRITE_ID, GRADE3_NUMBER_WORD_ID].includes(item.id)
      ? 12
      : derivedColumns === 3 ? 30 : 20
  };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    hideItemSeparators: true,
    writingLine: true,
    equalHeightItems: true,
    numberWordResponseTarget: isReverseNumberWordMode ? "shortNumeral" : "writtenWord",
    standardAnswerLineWidth: [GRADE2_NUMBER_WORD_WRITE_ID, GRADE3_NUMBER_WORD_ID].includes(item.id)
      ? 150
      : layout.display?.standardAnswerLineWidth,
    shortWritingLine: isReverseNumberWordMode,
    reverseNumberWordWriting: isReverseNumberWordMode,
    reverseNumberWordLineWidth: 46,
    reverseNumberWordPromptZoneWidth: 70,
    reverseNumberWordRowsPerColumn: 10,
    sequentialColumnFill: true
  };
}

if (
  GRADE3_PLACE_VALUE_BATCH2_IDS.has(item.id) &&
  Number.isFinite(normalizedOptions.questionsPerPage) &&
  normalizedOptions.questionsPerPage > 0
) {
  layout.template = {
    ...(layout.template || {}),
    maxProblemsPerPage: normalizedOptions.questionsPerPage
  };
}

return layout;
}

function generateWorksheetLayoutFromCatalogId(id, options = {}) {
  const item = getAnyWorksheetCatalogById(id);

  if (!item) {
    throw new Error(`Worksheet catalog item not found: ${id}`);
  }

  const worksheet = generateWorksheetFromCatalogId(id, options);

return buildLayoutFromWorksheet(item, worksheet, options);
}

module.exports = {
  worksheetCatalog: getMasterWorksheetCatalog(),
  getMasterWorksheetCatalog,
  getAnyWorksheetCatalogById,
  listWorksheetCatalog,
  getWorksheetCatalogById,
  listWorksheetCatalogByGrade,
  listWorksheetCatalogByDomain,
  listWorksheetCatalogByStatus,
  searchWorksheetCatalog,
  filterWorksheetCatalog,
  getWorksheetCatalogFilters,
  generateWorksheetFromCatalogId,
  buildLayoutFromWorksheet,
  generateWorksheetLayoutFromCatalogId
};
