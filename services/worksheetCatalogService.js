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
const {
  validateGrade3ShadeFractionWorksheet
} = require("../engine/problemGenerators/grade3ShadeFractionModels");
const {
  validateGrade3CompareFractionsWorksheet
} = require("../engine/problemGenerators/grade3CompareFractions");
const {
  validateGrade3FractionNumberLineWorksheet
} = require("../engine/problemGenerators/grade3FractionNumberLine");
const {
  validateGrade3DataDisplayWorksheet
} = require("../engine/problemGenerators/grade3DataDisplays");
const {
  validateGrade5EquivalentFractionCompletionWorksheet
} = require("../engine/problemGenerators/grade5EquivalentFractionCompletion");
const {
  grade5NumberToWords
} = require("../engine/problemGenerators/numberWordMatch");
const {
  buildGrade5RepresentationTruth
} = require("../engine/problemGenerators/grade5PlaceValueTruth");
const {
  getWorksheetPublicCopy,
  applyWorksheetPublicCopy
} = require("../config/worksheetPublicCopy");
const {
  DATA_DISPLAY_VISUAL_SPECS
} = require("../config/layout/dataDisplayVisualSpecs");
const {
  DEFAULT_OUTPUT: FOUNDER_REVIEW_DEFAULT_OUTPUT,
  GRADE4_PATTERN_WORKSPACE_IDS,
  PATTERN_RULE_RESPONSE_MODES
} = require("../config/founderReviewCurrentOutput");

const MASTER_CATALOG_PATH = path.join(__dirname, "../data/worksheetCatalog.master.json");

function loadMasterCatalog() {
  const raw = fs.readFileSync(MASTER_CATALOG_PATH, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed.items)
    ? parsed.items.map(applyWorksheetPublicCopy)
    : [];
}

function getMasterWorksheetCatalog() {
  return loadMasterCatalog();
}

function hasExplicitOption(options, key) {
  return Object.prototype.hasOwnProperty.call(options || {}, key) &&
    options[key] !== undefined && options[key] !== null && options[key] !== "";
}

function applyFounderReviewDefaultOptions(item, normalizedOptions = {}, requestedOptions = {}) {
  const defaults = FOUNDER_REVIEW_DEFAULT_OUTPUT[item?.id];
  if (!defaults) return normalizedOptions;

  const normalized = { ...normalizedOptions };
  const hasQuestionCount = hasExplicitOption(requestedOptions, "questionCount");
  const hasQuestionsPerPage = hasExplicitOption(requestedOptions, "questionsPerPage");
  if (defaults.questionCount !== undefined && !hasQuestionCount) {
    normalized.questionCount = defaults.questionCount;
  }
  if (defaults.questionsPerPage !== undefined && !hasQuestionCount && !hasQuestionsPerPage) {
    normalized.questionsPerPage = defaults.questionsPerPage;
  }
  return normalized;
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

function strictGrade3BaseTenInteger(value, label) {
  const number = Number(value);
  if (!Number.isInteger(number)) {
    throw new Error(`Grade 3 Base Ten Blocks ${label} must be a whole number.`);
  }
  return number;
}

function strictGrade3BaseTenList(value, label) {
  const entries = Array.isArray(value)
    ? value
    : typeof value === "string" ? value.split(",").map((entry) => entry.trim()) : [value];
  if (!entries.length || entries.some((entry) => entry === "" || entry === null || entry === undefined)) {
    throw new Error(`Grade 3 Base Ten Blocks ${label} must contain whole numbers.`);
  }
  return entries.map((entry) => strictGrade3BaseTenInteger(entry, label));
}

function strictGrade3BaseTenBoolean(value, label) {
  if (typeof value === "boolean") return value;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  throw new Error(`Grade 3 Base Ten Blocks ${label} must be true or false.`);
}

function suppliedAliasValues(options, aliases) {
  return aliases
    .filter((alias) => options[alias] !== undefined && options[alias] !== null && options[alias] !== "")
    .map((alias) => ({ alias, value: options[alias] }));
}

function validateGrade3BaseTenRawOptions(options = {}) {
  const minInputs = suppliedAliasValues(options, ["minA", "minimumValue", "minimumNumber"]);
  const maxInputs = suppliedAliasValues(options, ["maxA", "maximumValue", "maximumNumber"]);
  const selectedInputs = suppliedAliasValues(options, ["selectedNumbers", "selectedValues", "onlyNumbers"]);

  const normalizedAliasNumber = (inputs, fallback, label) => {
    const values = inputs.map(({ value }) => strictGrade3BaseTenInteger(value, label));
    if (new Set(values).size > 1) {
      throw new Error(`Grade 3 Base Ten Blocks ${label} aliases must agree.`);
    }
    return values[0] ?? fallback;
  };

  const minimum = normalizedAliasNumber(minInputs, 100, "minimum value");
  const maximum = normalizedAliasNumber(maxInputs, 499, "maximum value");
  if (minimum < 100 || minimum > 499 || maximum < 100 || maximum > 499 || minimum > maximum) {
    throw new Error("Grade 3 Base Ten Blocks values must use a valid range from 100 through 499.");
  }

  const questionCount = options.questionCount === undefined || options.questionCount === ""
    ? 8
    : strictGrade3BaseTenInteger(options.questionCount, "question count");
  const questionsPerPage = options.questionsPerPage === undefined || options.questionsPerPage === ""
    ? 4
    : strictGrade3BaseTenInteger(options.questionsPerPage, "questions per page");
  if (questionCount < 1 || questionCount > 24) {
    throw new Error("Grade 3 Base Ten Blocks question count must be from 1 through 24.");
  }
  if (questionsPerPage < 1 || questionsPerPage > 4) {
    throw new Error("Grade 3 Base Ten Blocks supports at most 4 questions per page.");
  }

  const exampleInputs = suppliedAliasValues(options, ["includeExample", "completedExample", "example"]);
  const exampleValues = exampleInputs.map(({ value, alias }) => strictGrade3BaseTenBoolean(value, alias));
  if (new Set(exampleValues).size > 1) {
    throw new Error("Grade 3 Base Ten Blocks example aliases must agree.");
  }
  const includeExample = exampleValues[0] ?? false;

  if (selectedInputs.length) {
    const lists = selectedInputs.map(({ value, alias }) => strictGrade3BaseTenList(value, alias));
    const signatures = lists.map((list) => list.join(","));
    if (new Set(signatures).size > 1) {
      throw new Error("Grade 3 Base Ten Blocks selected-number aliases must agree.");
    }
    const selected = lists[0];
    if (new Set(selected).size !== selected.length) {
      throw new Error("Grade 3 Base Ten Blocks selected numbers must be unique.");
    }
    if (selected.some((value) => value < minimum || value > maximum)) {
      throw new Error("Grade 3 Base Ten Blocks selected numbers must stay inside the approved range.");
    }
    if (selected.length < questionCount + (includeExample ? 1 : 0)) {
      throw new Error("Grade 3 Base Ten Blocks selected numbers do not provide enough unique questions.");
    }
  } else if (maximum - minimum + 1 < questionCount + (includeExample ? 1 : 0)) {
    throw new Error("Grade 3 Base Ten Blocks range does not provide enough unique questions.");
  }

  const labelInputs = suppliedAliasValues(options, ["showPlaceValueLabels", "baseTenTensOnesBoxes"]);
  if (labelInputs.some(({ value, alias }) => strictGrade3BaseTenBoolean(value, alias))) {
    throw new Error("Grade 3 Base Ten Blocks does not support place-value response labels in read-model mode.");
  }
  if (options.labelMode !== undefined && !["", "none"].includes(String(options.labelMode).trim().toLowerCase())) {
    throw new Error("Grade 3 Base Ten Blocks label mode must be 'none'.");
  }
  if (
    options.responseMode !== undefined &&
    !["number", "standard_number"].includes(String(options.responseMode).trim().toLowerCase())
  ) {
    throw new Error("Grade 3 Base Ten Blocks response mode must be standard-number reading.");
  }
  if (["hundreds", "tens", "ones", "representedValue"].some((key) => options[key] !== undefined)) {
    throw new Error("Grade 3 Base Ten Blocks place-value truth is generator-owned and cannot be overridden.");
  }
}

function validateGrade3BaseTenWorksheet(id, problems = []) {
  if (id !== GRADE3_BASE_TEN_ID) return;
  const signatures = new Set();
  problems.forEach((problem) => {
    const value = Number(problem.representedValue);
    const hundreds = Number(problem.hundreds);
    const tens = Number(problem.tens);
    const ones = Number(problem.ones);
    if (!Number.isInteger(value) || value < 100 || value > 499) {
      throw new Error("Grade 3 Base Ten Blocks represented value must be from 100 through 499.");
    }
    if (hundreds * 100 + tens * 10 + ones !== value) {
      throw new Error("Grade 3 Base Ten Blocks place-value truth must equal the represented number.");
    }
    if (
      problem.answer !== value ||
      problem.visual?.data?.hundreds !== hundreds ||
      problem.visual?.data?.tens !== tens ||
      problem.visual?.data?.ones !== ones
    ) {
      throw new Error("Grade 3 Base Ten Blocks student, answer, and visual truth must agree.");
    }
    if (!problem.duplicateSignature || signatures.has(problem.duplicateSignature)) {
      throw new Error("Grade 3 Base Ten Blocks questions must have unique structured truth.");
    }
    signatures.add(problem.duplicateSignature);
  });
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
const GRADE3_BASE_TEN_ID = "grade3_place_value_representation_base_ten_blocks";
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
const GRADE4_ADDITION_STORY_ID = "grade4_addition_subtraction_word_problems_addition_word_problem";
const GRADE4_MISSING_ADDEND_STORY_ID = "grade4_addition_subtraction_word_problems_missing_addend_word_problem";
const GRADE4_SUBTRACTION_STORY_ID = "grade4_addition_subtraction_word_problems_subtraction_word_problem";
const GRADE4_STORY_PROBLEM_IDS = new Set([
  GRADE4_ADDITION_STORY_ID,
  GRADE4_MISSING_ADDEND_STORY_ID,
  GRADE4_SUBTRACTION_STORY_ID
]);
const GRADE5_ADDITION_STORY_ID = "grade5_addition_subtraction_word_problems_addition_word_problem";
const GRADE5_MISSING_ADDEND_STORY_ID = "grade5_addition_subtraction_word_problems_missing_addend_word_problem";
const GRADE5_SUBTRACTION_STORY_ID = "grade5_addition_subtraction_word_problems_subtraction_word_problem";
const GRADE5_STORY_PROBLEM_IDS = new Set([
  GRADE5_ADDITION_STORY_ID,
  GRADE5_MISSING_ADDEND_STORY_ID,
  GRADE5_SUBTRACTION_STORY_ID
]);
const SHARED_UPPER_STORY_PROBLEM_IDS = new Set([
  ...GRADE4_STORY_PROBLEM_IDS,
  ...GRADE5_STORY_PROBLEM_IDS
]);
const GRADE4_NUMBER_LINE_ID = "grade4_place_value_representation_number_line_identify";
const GRADE4_NUMBER_WORD_ID = "grade4_place_value_representation_number_word_match";
const GRADE4_COMPARE_NUMBERS_ID = "grade4_place_value_representation_compare_numbers";
const GRADE4_EQUATION_MATCH_ID = "grade4_addition_subtraction_facts_equation_match";
const GRADE5_COMPARE_NUMBERS_ID = "grade5_place_value_representation_compare_numbers";
const GRADE5_EXPANDED_FORM_ID = "grade5_place_value_representation_expanded_form";
const GRADE5_NUMBER_LINE_ID = "grade5_place_value_representation_number_line_identify";
const GRADE5_NUMBER_WORD_ID = "grade5_place_value_representation_number_word_match";
const GRADE5_STANDARD_FORM_ID = "grade5_place_value_representation_standard_form";
const GRADE5_PLACE_VALUE_BATCH4_IDS = new Set([
  GRADE5_EXPANDED_FORM_ID,
  GRADE5_NUMBER_LINE_ID,
  GRADE5_NUMBER_WORD_ID,
  GRADE5_STANDARD_FORM_ID
]);
const GRADE5_EQUATION_MATCH_ID = "grade5_addition_subtraction_facts_equation_match";
const GRADE5_TEXT_DATA_INTERPRETATION_ID = "g5_interpret_graphs";
const GRADE5_TEXT_DATA_MAXIMUM_QUESTION_COUNT = 17;
const GRADE5_TEXT_DATA_MODE_CAPACITIES = Object.freeze({
  default: GRADE5_TEXT_DATA_MAXIMUM_QUESTION_COUNT,
  all: GRADE5_TEXT_DATA_MAXIMUM_QUESTION_COUNT,
  difference: 4,
  combined_total: 4,
  ordering_true_false: 6
});
const GRADE4_PLACE_VALUE_BATCH4_IDS = new Set([
  GRADE4_NUMBER_LINE_ID,
  GRADE4_NUMBER_WORD_ID,
  GRADE4_COMPARE_NUMBERS_ID
]);
const GRADE4_BATCH5_TITLES = Object.freeze({
  [GRADE4_EQUATION_MATCH_ID]: "Compare Equations"
});
const GRADE5_COMPACT_RELATIONAL_TITLES = Object.freeze({
  [GRADE5_EQUATION_MATCH_ID]: "Compare Equations",
  [GRADE5_COMPARE_NUMBERS_ID]: "Compare Numbers"
});
const GRADE5_PLACE_VALUE_BATCH4_TITLES = Object.freeze({
  [GRADE5_EXPANDED_FORM_ID]: "Expanded Form",
  [GRADE5_NUMBER_LINE_ID]: "Identify Numbers on a Number Line",
  [GRADE5_NUMBER_WORD_ID]: "Write Numbers in Words",
  [GRADE5_STANDARD_FORM_ID]: "Standard Form"
});
const GRADE5_COMPACT_RELATIONAL_IDS = new Set(
  Object.keys(GRADE5_COMPACT_RELATIONAL_TITLES)
);
const GRADE3_EQUAL_SHARING_ID = "g3_equal_sharing_division";
const GRADE3_SHADE_FRACTION_ID = "grade3_fraction_equivalence_shade_fraction_models";
const GRADE3_NUMBER_LINE_IDENTIFY_ID = "grade3_place_value_representation_number_line_identify";
const GRADE3_COMPARE_FRACTIONS_ID = "grade3_fraction_equivalence_compare_fractions";
const GRADE3_FRACTION_NUMBER_LINE_ID = "grade3_fraction_equivalence_fraction_number_line";
const GRADE4_COMPARE_FRACTIONS_ID = "grade4_fraction_equivalence_compare_fractions";
const GRADE4_FRACTION_NUMBER_LINE_ID = "grade4_fraction_equivalence_fraction_number_line";
const GRADE4_SHADE_FRACTION_ID = "grade4_fraction_equivalence_shade_fraction_models";
const GRADE5_FRACTION_NUMBER_LINE_ID = "grade5_fraction_equivalence_fraction_number_line";
const GRADE5_EQUIVALENT_FRACTION_COMPLETION_ID = "grade5_fraction_equivalence_match_equivalent_fractions";
const GRADE5_SHADE_FRACTION_ID = "grade5_fraction_equivalence_shade_fraction_models";
const GRADE4_STRUCTURED_FRACTION_IDS = new Set([
  GRADE4_COMPARE_FRACTIONS_ID,
  GRADE4_FRACTION_NUMBER_LINE_ID,
  GRADE4_SHADE_FRACTION_ID
]);
const GRADE5_STRUCTURED_FRACTION_IDS = new Set([
  GRADE5_FRACTION_NUMBER_LINE_ID,
  GRADE5_EQUIVALENT_FRACTION_COMPLETION_ID,
  GRADE5_SHADE_FRACTION_ID
]);
const GRADE3_FRACTION_BATCH6_IMPLEMENTED_IDS = new Set([
  GRADE3_COMPARE_FRACTIONS_ID,
  GRADE3_FRACTION_NUMBER_LINE_ID
]);
const GRADE3_DATA_BATCH7_TASKS = Object.freeze({
  g3_complete_a_graph: "complete",
  g3_graph_questions: "questions",
  g3_interpret_data: "interpret",
  g3_match_data_to_graph: "match",
  g3_read_a_graph: "read"
});
const GRADE3_DATA_BATCH7_IDS = new Set(Object.keys(GRADE3_DATA_BATCH7_TASKS));
const GRADE3_DATA_BATCH7_DEFAULT_COUNTS = Object.freeze({
  complete: 2,
  questions: 6,
  interpret: 4,
  match: 2,
  read: 6
});
const GRADE3_DATA_BATCH7_MAX_COUNTS = Object.freeze({
  complete: 2,
  questions: 6,
  interpret: 4,
  match: 2,
  read: 8
});
const GRADE3_CONCRETE_VISUAL_IDS = new Set([
  GRADE3_EQUAL_SHARING_ID,
  GRADE3_SHADE_FRACTION_ID,
  GRADE3_NUMBER_LINE_IDENTIFY_ID
]);
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
  grade1_data_display_graphing_complete_graph: 2,
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
  grade1_fraction_equivalence_match_equivalent_fractions: 6,
  grade1_fraction_equivalence_compare_fractions: 8,
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

const GRADE4_NUMERIC_PATTERN_TITLES = Object.freeze({
  grade4_patterning_and_algebra_extend_pattern: "Extend the Pattern",
  grade4_patterning_and_algebra_identify_pattern_rule: "Identify the Pattern Rule",
  grade4_patterning_and_algebra_missing_value_pattern: "Find the Missing Values"
});

const GRADE4_NUMERIC_PATTERN_IDS = new Set(Object.keys(GRADE4_NUMERIC_PATTERN_TITLES));

const GRADE5_NUMERIC_PATTERN_TITLES = Object.freeze({
  grade5_patterning_and_algebra_extend_pattern: "Extend the Pattern",
  grade5_patterning_and_algebra_identify_pattern_rule: "Identify the Pattern Rule",
  grade5_patterning_and_algebra_missing_value_pattern: "Find the Missing Values"
});

const GRADE5_NUMERIC_PATTERN_IDS = new Set(Object.keys(GRADE5_NUMERIC_PATTERN_TITLES));

const GRADE3_PLACE_VALUE_TITLES = Object.freeze({
  [GRADE3_BASE_TEN_ID]: "Read Base Ten Blocks",
  [GRADE3_EXPANDED_FORM_ID]: "Expanded Form",
  [GRADE3_STANDARD_FORM_ID]: "Standard Form"
});

const GRADE3_PLACE_VALUE_BATCH2_IDS = new Set([
  GRADE3_BASE_TEN_ID,
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

const GRADE4_STORY_PROBLEM_TITLES = Object.freeze({
  [GRADE4_ADDITION_STORY_ID]: "Addition Story Problems",
  [GRADE4_MISSING_ADDEND_STORY_ID]: "Missing Addend Story Problems",
  [GRADE4_SUBTRACTION_STORY_ID]: "Subtraction Story Problems"
});
const GRADE5_STORY_PROBLEM_TITLES = Object.freeze({
  [GRADE5_ADDITION_STORY_ID]: "Addition Story Problems",
  [GRADE5_MISSING_ADDEND_STORY_ID]: "Missing Addend Story Problems",
  [GRADE5_SUBTRACTION_STORY_ID]: "Subtraction Story Problems"
});

const GRADE4_PLACE_VALUE_BATCH4_TITLES = Object.freeze({
  [GRADE4_NUMBER_LINE_ID]: "Identify Numbers on a Number Line",
  [GRADE4_NUMBER_WORD_ID]: "Write Numbers in Words",
  [GRADE4_COMPARE_NUMBERS_ID]: "Compare Numbers"
});

const GRADE3_CONCRETE_VISUAL_TITLES = Object.freeze({
  [GRADE3_EQUAL_SHARING_ID]: "Equal Sharing Division",
  [GRADE3_SHADE_FRACTION_ID]: "Shade the Fraction",
  [GRADE3_NUMBER_LINE_IDENTIFY_ID]: "Identify Numbers on a Number Line"
});

const GRADE3_FRACTION_BATCH6_TITLES = Object.freeze({
  [GRADE3_COMPARE_FRACTIONS_ID]: "Compare Fractions",
  [GRADE3_FRACTION_NUMBER_LINE_ID]: "Fractions on a Number Line"
});

const GRADE4_STRUCTURED_FRACTION_TITLES = Object.freeze({
  [GRADE4_COMPARE_FRACTIONS_ID]: "Compare Fractions",
  [GRADE4_FRACTION_NUMBER_LINE_ID]: "Fractions on a Number Line",
  [GRADE4_SHADE_FRACTION_ID]: "Shade the Fraction"
});
const GRADE5_STRUCTURED_FRACTION_TITLES = Object.freeze({
  [GRADE5_FRACTION_NUMBER_LINE_ID]: "Fractions on a Number Line",
  [GRADE5_EQUIVALENT_FRACTION_COMPLETION_ID]: "Complete Equivalent Fractions",
  [GRADE5_SHADE_FRACTION_ID]: "Shade the Fraction"
});

const GRADE3_DATA_BATCH7_TITLES = Object.freeze({
  g3_complete_a_graph: "Complete the Graph",
  g3_graph_questions: "Answer Questions About a Graph",
  g3_interpret_data: "Interpret the Data",
  g3_match_data_to_graph: "Choose the Matching Pictograph",
  g3_read_a_graph: "Read the Graph"
});

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
const CUT_APART_QUICK_CHECKS = new Map([
  ["g4_pattern_rule_quick_check", { copies: 1, items: 7 }],
  ["g4_compare_fractions_quick_check", { copies: 2, items: 6 }],
  ["g3_compare_3_digit_numbers_quick_check", { copies: 2, items: 6 }],
  ["g5_place_value_to_100000_quick_check", { copies: 2, items: 6 }],
  ["g5_equivalent_fractions_quick_check", { copies: 2, items: 6 }],
  ["g3_place_value_hundreds_tens_ones_quick_check", { copies: 2, items: 6 }],
  ["g2_subtraction_within_20_quick_check", { copies: 3, items: 6 }],
  ["g3_expanded_form_to_standard_form_quick_check", { copies: 3, items: 6 }],
  ["g2_missing_addends_within_20_quick_check", { copies: 4, items: 5 }]
]);

const GRADE2_COMPACT_EXIT_TICKET_ID = "g2_missing_addends_within_20_exit_ticket";
const FOUR_UP_EXIT_TICKET_IDS = new Set([
  "g4_compare_fractions_exit_ticket",
  "g3_compare_3_digit_numbers_exit_ticket",
  "g5_compare_numbers_to_100000_exit_ticket",
  "g5_equivalent_fractions_exit_ticket",
  GRADE2_COMPACT_EXIT_TICKET_ID,
  "g3_expanded_form_to_standard_form_exit_ticket"
]);

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
      ? 2
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
  if (item.id === GRADE3_BASE_TEN_ID) {
    const normalized = { ...options };
    const selectedSource = normalized.selectedNumbers ?? normalized.selectedValues ?? normalized.onlyNumbers;
    const selectedNumbers = selectedSource === undefined
      ? []
      : strictGrade3BaseTenList(selectedSource, "selected numbers");

    normalized.questionCount = finiteNumber(normalized.questionCount, 8);
    normalized.questionsPerPage = finiteNumber(normalized.questionsPerPage, 4);
    normalized.minA = finiteNumber(
      normalized.minA ?? normalized.minimumValue ?? normalized.minimumNumber,
      100
    );
    normalized.maxA = finiteNumber(
      normalized.maxA ?? normalized.maximumValue ?? normalized.maximumNumber,
      499
    );
    normalized.selectedNumbers = selectedNumbers;
    normalized.selectedValues = selectedNumbers;
    normalized.onlyNumbers = selectedNumbers.join(",");
    normalized.labelMode = "none";
    normalized.showPlaceValueLabels = false;
    normalized.baseTenTensOnesBoxes = false;
    normalized.responseMode = "standard_number";
    return normalized;
  }

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

const GRADE4_STORY_NAMES = new Set(["maya", "leo", "ava", "noah", "ivy", "sam", "emma", "liam"]);
const GRADE4_STORY_OBJECTS = new Set(["books", "tickets", "points", "notebooks", "pencils", "cans", "flyers", "badges", "seedlings", "bottles"]);

function isAdditionStoryId(id) {
  return [GRADE4_ADDITION_STORY_ID, GRADE5_ADDITION_STORY_ID].includes(id);
}

function isMissingAddendStoryId(id) {
  return [GRADE4_MISSING_ADDEND_STORY_ID, GRADE5_MISSING_ADDEND_STORY_ID].includes(id);
}

function isSubtractionStoryId(id) {
  return [GRADE4_SUBTRACTION_STORY_ID, GRADE5_SUBTRACTION_STORY_ID].includes(id);
}

function grade4StoryInteger(value, label, minimum, maximum) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < minimum || number > maximum) {
    throw new Error(`Grade 4 story-problem ${label} must be a whole number from ${minimum} through ${maximum}.`);
  }
  return number;
}

function grade4StoryBoolean(value, label) {
  if (typeof value === "boolean") return value;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  throw new Error(`Grade 4 story-problem ${label} must be true or false.`);
}

function grade4StoryEntries(options, aliases) {
  return aliases.filter((alias) => Object.prototype.hasOwnProperty.call(options, alias))
    .map((alias) => ({ alias, value: options[alias] }));
}

function grade4StoryScalarAlias(options, aliases, label, normalize) {
  const entries = grade4StoryEntries(options, aliases);
  if (!entries.length) return null;
  const values = entries.map(({ value }) => normalize(value));
  if (new Set(values.map((value) => JSON.stringify(value))).size !== 1) {
    throw new Error(`Grade 4 story-problem ${label} aliases must agree.`);
  }
  return values[0];
}

function grade4StoryList(value, label) {
  const list = Array.isArray(value)
    ? value
    : typeof value === "string" ? value.split(/[\s,|]+/) : value == null ? [] : [value];
  if (!list.length || list.some((entry) => entry === "" || entry === null || entry === undefined)) {
    throw new Error(`Grade 4 story-problem ${label} must not be empty.`);
  }
  return list;
}

function grade4StoryListAlias(options, aliases, label, normalize) {
  const entries = grade4StoryEntries(options, aliases);
  if (!entries.length) return null;
  const lists = entries.map(({ value }) => grade4StoryList(value, label).map(normalize));
  lists.forEach((list) => {
    if (new Set(list).size !== list.length) throw new Error(`Grade 4 story-problem ${label} values must be unique.`);
  });
  const signatures = lists.map((list) => [...list].sort().join(","));
  if (new Set(signatures).size !== 1) throw new Error(`Grade 4 story-problem ${label} aliases must agree.`);
  return lists[0];
}

function normalizeGrade4StoryType(id, value) {
  const token = String(value).trim().toLowerCase().replace(/[\s-]+/g, "_");
  const aliases = isAdditionStoryId(id)
    ? { join: "join_result", join_result: "join_result", combine: "combine_total", combine_total: "combine_total" }
    : isMissingAddendStoryId(id)
      ? { start: "first", start_unknown: "first", first: "first", change: "second", added_amount_unknown: "second", second: "second" }
      : { takeaway: "take_away", take_away: "take_away", compare: "compare" };
  if (!aliases[token]) throw new Error("Grade 4 story-problem selected story type is unsupported for this resource.");
  return aliases[token];
}

function normalizeGrade4MissingPosition(value) {
  const token = String(value).trim().toLowerCase().replace(/[\s-]+/g, "_");
  const aliases = {
    first: "first", first_addend: "first", start: "first", start_unknown: "first",
    second: "second", second_addend: "second", change: "second", added_amount_unknown: "second",
    mixed: "mixed", both: "mixed", random: "mixed"
  };
  if (!aliases[token]) throw new Error("Grade 4 missing-addend position must be first, second, or mixed.");
  return aliases[token];
}

function validateGrade4StoryRawOptions(item, options = {}) {
  if (!SHARED_UPPER_STORY_PROBLEM_IDS.has(item.id)) return;
  const isGrade5 = GRADE5_STORY_PROBLEM_IDS.has(item.id);
  const valueMaximum = isGrade5 ? 100000 : 10000;
  const questionCount = grade4StoryScalarAlias(options, ["questionCount"], "question count", (value) => grade4StoryInteger(value, "question count", 1, 16)) ?? 8;
  grade4StoryScalarAlias(options, ["questionsPerPage"], "questions per page", (value) => grade4StoryInteger(value, "questions per page", 1, 3));
  const includeExample = grade4StoryScalarAlias(
    options,
    ["includeExample", "completedExample", "example"],
    "completed-example",
    (value) => grade4StoryBoolean(value, "completed-example option")
  ) ?? false;

  const selectedNumbers = grade4StoryListAlias(
    options,
    ["selectedNumbers", "onlyNumbers"],
    "selected numbers",
    (value) => grade4StoryInteger(value, "selected number", 0, valueMaximum)
  );
  const isSubtraction = isSubtractionStoryId(item.id);
  const minA = grade4StoryScalarAlias(options, ["minA", "minimumFirstOperand", "minimumOperand"], "minimum first operand", (value) => grade4StoryInteger(value, "minimum first operand", 0, valueMaximum)) ?? (isGrade5 ? isSubtraction ? 10000 : 1000 : isSubtraction ? 500 : 100);
  const maxA = grade4StoryScalarAlias(options, ["maxA", "maximumFirstOperand", "maximumOperand"], "maximum first operand", (value) => grade4StoryInteger(value, "maximum first operand", 0, valueMaximum)) ?? (isGrade5 ? isSubtraction ? 100000 : 50000 : isSubtraction ? 5000 : 2500);
  const minB = grade4StoryScalarAlias(options, ["minB", "minimumSecondOperand"], "minimum second operand", (value) => grade4StoryInteger(value, "minimum second operand", 0, valueMaximum)) ?? (isGrade5 ? 1000 : 100);
  const maxB = grade4StoryScalarAlias(options, ["maxB", "maximumSecondOperand"], "maximum second operand", (value) => grade4StoryInteger(value, "maximum second operand", 0, valueMaximum)) ?? (isGrade5 ? isSubtraction ? 90000 : 50000 : isSubtraction ? 4000 : 2500);
  const minTotal = grade4StoryScalarAlias(options, ["minTotal", "minimumTotal"], "minimum total", (value) => grade4StoryInteger(value, "minimum total", 0, valueMaximum)) ?? (isGrade5 ? 10000 : 500);
  const maxTotal = grade4StoryScalarAlias(options, ["maxTotal", "maximumTotal"], "maximum total", (value) => grade4StoryInteger(value, "maximum total", 0, valueMaximum)) ?? (isGrade5 ? 100000 : isSubtraction ? 10000 : 5000);
  if (minA > maxA || minB > maxB || minTotal > maxTotal) {
    throw new Error("Grade 4 story-problem minimum values must not exceed maximum values.");
  }
  if (isSubtraction && minB > maxA) {
    throw new Error("Grade 4 subtraction stories require a possible non-negative difference.");
  }
  if (isSubtraction && ["minTotal", "minimumTotal", "maxTotal", "maximumTotal"].some((key) => Object.prototype.hasOwnProperty.call(options, key))) {
    throw new Error("Grade 4 subtraction stories do not support total controls.");
  }
  if (selectedNumbers && !selectedNumbers.some((value) => value >= minA && value <= maxA)) {
    throw new Error("Grade 4 story-problem selected numbers do not include a valid first operand.");
  }

  const selectedContexts = grade4StoryListAlias(options, ["selectedContexts", "contexts"], "selected contexts", (value) => String(value).trim().toLowerCase());
  const selectedObjects = grade4StoryListAlias(options, ["selectedObjects", "onlyObjects"], "selected objects", (value) => String(value).trim().toLowerCase());
  selectedContexts?.forEach((token) => {
    if (!GRADE4_STORY_NAMES.has(token) && !GRADE4_STORY_OBJECTS.has(token)) throw new Error(`Unsupported Grade 4 story context: ${token}.`);
  });
  selectedObjects?.forEach((token) => {
    if (!GRADE4_STORY_OBJECTS.has(token)) throw new Error(`Unsupported Grade 4 story object: ${token}.`);
  });
  const contextNames = selectedContexts?.filter((token) => GRADE4_STORY_NAMES.has(token)) || [...GRADE4_STORY_NAMES];
  const contextObjectsFromContexts = selectedContexts?.filter((token) => GRADE4_STORY_OBJECTS.has(token)) || [];
  const contextObjects = selectedObjects || (contextObjectsFromContexts.length ? contextObjectsFromContexts : [...GRADE4_STORY_OBJECTS]);
  const requiredContexts = questionCount + (includeExample ? 1 : 0);
  if (contextNames.length * 2 < requiredContexts || contextObjects.length * 2 < requiredContexts || contextNames.length * contextObjects.length < requiredContexts) {
    throw new Error("Grade 4 story-problem context selections cannot support the requested count without repetition.");
  }

  const storyTypes = grade4StoryListAlias(options, ["selectedStoryTypes", "storyTypes"], "selected story types", (value) => normalizeGrade4StoryType(item.id, value));
  const position = grade4StoryScalarAlias(
    options,
    ["missingPosition", "missingAddendPosition", "missingPartPosition", "unknownPosition"],
    "missing-addend position",
    normalizeGrade4MissingPosition
  );
  if (!isMissingAddendStoryId(item.id) && position !== null) {
    throw new Error("Grade 4 missing-addend position controls belong only to Missing Addend Story Problems.");
  }
  if (isMissingAddendStoryId(item.id) && storyTypes && position && position !== "mixed") {
    if (storyTypes.some((storyType) => storyType !== position)) throw new Error("Grade 4 missing-addend story type and missing-position controls conflict.");
  }

  const rejectedGroups = [
    [["operation", "operationMode", "selectedOperations", "operations", "mode"], "operation controls"],
    [["regrouping", "allowRegrouping", "requireRegrouping", "regroupingMode"], "regrouping controls"],
    [["workSpaceBox", "workspaceBox", "showWorkBox", "workBox"], "workspace controls"],
    [["template", "templateId", "selectedTemplates", "sentenceTemplates"], "template overrides"],
    [["answer", "answerState", "firstAddend", "secondAddend", "total", "minuend", "subtrahend", "difference", "knownAddend", "missingValue", "contextId", "duplicateSignature", "responseTarget", "isExample", "prompt"], "caller-owned structured truth"]
  ];
  rejectedGroups.forEach(([keys, label]) => {
    if (keys.some((key) => Object.prototype.hasOwnProperty.call(options, key))) {
      throw new Error(`Grade 4 story-problem ${label} are not supported.`);
    }
  });
}

function normalizeGrade4StoryProblemOptions(item, options = {}) {
  if (!SHARED_UPPER_STORY_PROBLEM_IDS.has(item.id)) return options;
  const isGrade5 = GRADE5_STORY_PROBLEM_IDS.has(item.id);
  const isSubtraction = isSubtractionStoryId(item.id);
  const normalized = {
    ...options,
    questionCount: grade4StoryScalarAlias(options, ["questionCount"], "question count", Number) ?? 8,
    questionsPerPage: grade4StoryScalarAlias(options, ["questionsPerPage"], "questions per page", Number) ?? 3,
    minA: grade4StoryScalarAlias(options, ["minA", "minimumFirstOperand", "minimumOperand"], "minimum first operand", Number) ?? (isGrade5 ? isSubtraction ? 10000 : 1000 : isSubtraction ? 500 : 100),
    maxA: grade4StoryScalarAlias(options, ["maxA", "maximumFirstOperand", "maximumOperand"], "maximum first operand", Number) ?? (isGrade5 ? isSubtraction ? 100000 : 50000 : isSubtraction ? 5000 : 2500),
    minB: grade4StoryScalarAlias(options, ["minB", "minimumSecondOperand"], "minimum second operand", Number) ?? (isGrade5 ? 1000 : 100),
    maxB: grade4StoryScalarAlias(options, ["maxB", "maximumSecondOperand"], "maximum second operand", Number) ?? (isGrade5 ? isSubtraction ? 90000 : 50000 : isSubtraction ? 4000 : 2500),
    includeExample: grade4StoryScalarAlias(options, ["includeExample", "completedExample", "example"], "completed-example", grade4StoryBoolean) ?? false
  };
  if (!isSubtraction) {
    normalized.minTotal = grade4StoryScalarAlias(options, ["minTotal", "minimumTotal"], "minimum total", Number) ?? (isGrade5 ? 10000 : 500);
    normalized.maxTotal = grade4StoryScalarAlias(options, ["maxTotal", "maximumTotal"], "maximum total", Number) ?? (isGrade5 ? 100000 : 5000);
  }
  const selectedNumbers = grade4StoryListAlias(options, ["selectedNumbers", "onlyNumbers"], "selected numbers", Number);
  const selectedContexts = grade4StoryListAlias(options, ["selectedContexts", "contexts"], "selected contexts", (value) => String(value).trim().toLowerCase());
  const selectedObjects = grade4StoryListAlias(options, ["selectedObjects", "onlyObjects"], "selected objects", (value) => String(value).trim().toLowerCase());
  if (selectedNumbers) normalized.selectedNumbers = selectedNumbers;
  if (selectedContexts) normalized.selectedContexts = selectedContexts;
  if (selectedObjects) normalized.selectedObjects = selectedObjects;
  const storyTypes = grade4StoryListAlias(options, ["selectedStoryTypes", "storyTypes"], "selected story types", (value) => normalizeGrade4StoryType(item.id, value));
  if (isMissingAddendStoryId(item.id)) {
    const position = grade4StoryScalarAlias(options, ["missingPosition", "missingAddendPosition", "missingPartPosition", "unknownPosition"], "missing-addend position", normalizeGrade4MissingPosition) || "mixed";
    normalized.allowedMissingPositions = storyTypes || (position === "mixed" ? ["first", "second"] : [position]);
    normalized.missingPosition = position;
  } else if (storyTypes) {
    normalized.selectedStoryTypes = storyTypes;
  }
  return normalized;
}

const GRADE4_PLACE_VALUE_SAFE_INTERVALS = Object.freeze([10, 25, 50, 100, 250, 500]);

function grade4PlaceValueEntries(options, aliases) {
  return aliases.filter((alias) => Object.prototype.hasOwnProperty.call(options, alias))
    .map((alias) => ({ alias, value: options[alias] }));
}

function grade4PlaceValueInteger(value, label, minimum, maximum) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < minimum || number > maximum) {
    throw new Error(`Grade 4 place-value ${label} must be a whole number from ${minimum} through ${maximum}.`);
  }
  return number;
}

function grade4PlaceValueBoolean(value, label) {
  if (typeof value === "boolean") return value;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  throw new Error(`Grade 4 place-value ${label} must be true or false.`);
}

function grade4PlaceValueScalarAlias(options, aliases, label, normalize) {
  const entries = grade4PlaceValueEntries(options, aliases);
  if (!entries.length) return null;
  const values = entries.map(({ value }) => normalize(value));
  if (new Set(values.map((value) => JSON.stringify(value))).size !== 1) {
    throw new Error(`Grade 4 place-value ${label} aliases must agree.`);
  }
  return values[0];
}

function grade4PlaceValueList(value, label) {
  const list = Array.isArray(value)
    ? value
    : typeof value === "string" ? value.split(/[\s,|]+/) : value == null ? [] : [value];
  if (!list.length || list.some((entry) => entry === "" || entry === null || entry === undefined)) {
    throw new Error(`Grade 4 place-value ${label} must not be empty.`);
  }
  return list;
}

function grade4PlaceValueListAlias(options, aliases, label, normalize) {
  const entries = grade4PlaceValueEntries(options, aliases);
  if (!entries.length) return null;
  const lists = entries.map(({ value }) => grade4PlaceValueList(value, label).map(normalize));
  lists.forEach((list) => {
    if (new Set(list).size !== list.length) {
      throw new Error(`Grade 4 place-value ${label} values must be unique.`);
    }
  });
  const signatures = lists.map((list) => [...list].sort((a, b) => a - b).join(","));
  if (new Set(signatures).size !== 1) {
    throw new Error(`Grade 4 place-value ${label} aliases must agree.`);
  }
  return lists[0];
}

function normalizeGrade4NumberWordMode(value) {
  const token = String(value).trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (["numeral_to_word", "number_to_word", "write_words"].includes(token)) return "numeral_to_word";
  if (["word_to_numeral", "word_to_number", "write_numeral"].includes(token)) return "word_to_numeral";
  throw new Error("Grade 4 number words support numeral_to_word or word_to_numeral only; matching is not supported.");
}

function normalizeGrade4EndpointPolicy(value) {
  const token = String(value).trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (["allowed", "endpoints_allowed", "include_endpoints"].includes(token)) return true;
  if (["interior", "interior_only", "exclude_endpoints"].includes(token)) return false;
  throw new Error("Grade 4 number-line endpoint policy must be endpoints_allowed or interior_only.");
}

function normalizeGrade4NumberLineTask(value) {
  const token = String(value).trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (["identify", "identify_marked_number", "read_number_line"].includes(token)) return "identify_marked_number";
  throw new Error("Grade 4 number lines support identify_marked_number mode only.");
}

function normalizeGrade4EquationOperationMode(value) {
  const token = String(value).trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (["mixed", "addition_subtraction", "add_subtract"].includes(token)) return "mixed";
  if (["addition", "add", "+"].includes(token)) return "addition";
  if (["subtraction", "subtract", "-"].includes(token)) return "subtraction";
  throw new Error("Grade 4 equation comparison supports addition, subtraction, or mixed operations only.");
}

function validateGrade4EquationMatchRawOptions(item, options = {}) {
  if (item.id !== GRADE4_EQUATION_MATCH_ID) return;
  const questionCount = grade4PlaceValueScalarAlias(
    options,
    ["questionCount"],
    "equation-comparison question count",
    (value) => grade4PlaceValueInteger(value, "equation-comparison question count", 1, 60)
  ) ?? 30;
  grade4PlaceValueScalarAlias(
    options,
    ["questionsPerPage"],
    "equation-comparison questions per page",
    (value) => grade4PlaceValueInteger(value, "equation-comparison questions per page", 1, 30)
  );
  const minimumResult = grade4PlaceValueScalarAlias(
    options,
    ["minimumResult", "minResult", "minimumValue"],
    "equation-comparison minimum result",
    (value) => grade4PlaceValueInteger(value, "equation-comparison minimum result", 0, 1999)
  ) ?? 100;
  const maximumResult = grade4PlaceValueScalarAlias(
    options,
    ["maximumResult", "maxResult", "maxTotal", "maximumTotal", "maximumValue"],
    "equation-comparison maximum result",
    (value) => grade4PlaceValueInteger(value, "equation-comparison maximum result", 1, 2000)
  ) ?? 1000;
  if (minimumResult >= maximumResult) {
    throw new Error("Grade 4 equation-comparison minimum result must be less than maximum result.");
  }
  const includeEqualPairs = grade4PlaceValueScalarAlias(
    options,
    ["includeEqualPairs"],
    "equation-comparison equality option",
    (value) => grade4PlaceValueBoolean(value, "equation-comparison equality option")
  ) ?? true;
  const equalPairs = grade4PlaceValueScalarAlias(
    options,
    ["equalPairs", "equalityCount"],
    "equation-comparison equality count",
    (value) => grade4PlaceValueInteger(value, "equation-comparison equality count", 0, questionCount)
  );
  if (!includeEqualPairs && equalPairs !== null && equalPairs !== 0) {
    throw new Error("Grade 4 equation-comparison equality controls must agree.");
  }
  const operationMode = grade4PlaceValueScalarAlias(
    options,
    ["operationMode", "mode"],
    "equation-comparison operation mode",
    normalizeGrade4EquationOperationMode
  );
  const selectedOperations = grade4PlaceValueListAlias(
    options,
    ["selectedOperations", "operations"],
    "equation-comparison operations",
    normalizeGrade4EquationOperationMode
  );
  if (selectedOperations?.includes("mixed")) {
    throw new Error("Grade 4 equation-comparison selected operations must list addition and/or subtraction.");
  }
  const selectedMode = selectedOperations
    ? selectedOperations.length === 2 ? "mixed" : selectedOperations[0]
    : null;
  if (operationMode && selectedMode && operationMode !== selectedMode) {
    throw new Error("Grade 4 equation-comparison operation aliases must agree.");
  }
  const includeExample = grade4PlaceValueScalarAlias(
    options,
    ["includeExample", "completedExample", "example"],
    "equation-comparison completed-example",
    (value) => grade4PlaceValueBoolean(value, "equation-comparison completed-example option")
  ) ?? false;
  const resolvedEqualPairs = includeEqualPairs ? (equalPairs ?? Math.floor(questionCount / 2)) : 0;
  const templateCount = (operationMode || selectedMode || "mixed") === "mixed" ? 3 : 1;
  const resultCount = maximumResult - minimumResult + 1;
  const exampleUsesEqual = includeExample && resolvedEqualPairs > 0 ? 1 : 0;
  const exampleUsesNotEqual = includeExample && resolvedEqualPairs === 0 ? 1 : 0;
  if (
    resolvedEqualPairs + exampleUsesEqual > resultCount * templateCount ||
    questionCount - resolvedEqualPairs + exampleUsesNotEqual > resultCount * templateCount
  ) {
    throw new Error("Grade 4 equation-comparison result range cannot support the requested unique pair contract.");
  }

  const unsupportedKeys = [
    "minA", "maxA", "minB", "maxB", "minimumOperand", "maximumOperand",
    "minimumFirstOperand", "maximumFirstOperand", "minimumSecondOperand", "maximumSecondOperand",
    "selectedNumbers", "selectedValues", "onlyNumbers", "relation", "relationSymbol",
    "selectedRelations", "expression", "leftExpression", "rightExpression",
    "leftOperands", "rightOperands", "leftValue", "rightValue", "expectedSymbol",
    "expectedRelation", "comparisonResult", "equalityState", "prompt", "answer",
    "answerState", "responseTarget", "duplicateSignature"
  ];
  if (unsupportedKeys.some((key) => Object.prototype.hasOwnProperty.call(options, key))) {
    throw new Error("Grade 4 equation comparison does not accept operand selectors or caller-owned expression/answer truth.");
  }
}

function normalizeGrade4EquationMatchOptions(item, options = {}, rawOptions = {}) {
  if (item.id !== GRADE4_EQUATION_MATCH_ID) return options;
  const normalized = { ...options };
  normalized.questionCount = Number(rawOptions.questionCount ?? 30);
  normalized.questionsPerPage = Number(rawOptions.questionsPerPage ?? 30);
  normalized.minimumResult = Number(
    rawOptions.minimumResult ?? rawOptions.minResult ?? rawOptions.minimumValue ?? 100
  );
  normalized.maximumResult = Number(
    rawOptions.maximumResult ?? rawOptions.maxResult ?? rawOptions.maxTotal ??
    rawOptions.maximumTotal ?? rawOptions.maximumValue ?? 1000
  );
  normalized.includeEqualPairs = grade4PlaceValueScalarAlias(
    rawOptions,
    ["includeEqualPairs"],
    "equation-comparison equality option",
    grade4PlaceValueBoolean
  ) ?? true;
  normalized.equalPairs = normalized.includeEqualPairs
    ? grade4PlaceValueScalarAlias(
        rawOptions,
        ["equalPairs", "equalityCount"],
        "equation-comparison equality count",
        Number
      ) ?? Math.floor(normalized.questionCount / 2)
    : 0;
  const explicitMode = grade4PlaceValueScalarAlias(
    rawOptions,
    ["operationMode", "mode"],
    "equation-comparison operation mode",
    normalizeGrade4EquationOperationMode
  );
  const selectedOperations = grade4PlaceValueListAlias(
    rawOptions,
    ["selectedOperations", "operations"],
    "equation-comparison operations",
    normalizeGrade4EquationOperationMode
  );
  normalized.operationMode = explicitMode || (
    selectedOperations
      ? selectedOperations.length === 2 ? "mixed" : selectedOperations[0]
      : "mixed"
  );
  normalized.includeExample = grade4PlaceValueScalarAlias(
    rawOptions,
    ["includeExample", "completedExample", "example"],
    "equation-comparison completed-example",
    grade4PlaceValueBoolean
  ) ?? false;
  return normalized;
}

function validateGrade4PlaceValueRawOptions(item, options = {}) {
  if (!GRADE4_PLACE_VALUE_BATCH4_IDS.has(item.id)) return;
  const isLine = item.id === GRADE4_NUMBER_LINE_ID;
  const isWords = item.id === GRADE4_NUMBER_WORD_ID;
  const defaultCount = isLine ? 6 : isWords ? 12 : 30;
  const maxCount = isLine ? 12 : isWords ? 20 : 30;
  const numberWordMode = isWords
    ? grade4PlaceValueScalarAlias(
      options,
      ["numberWordMode", "numberWordDirection", "mode"],
      "number-word direction",
      normalizeGrade4NumberWordMode
    ) || "numeral_to_word"
    : null;
  const defaultPerPage = isLine ? 6 : isWords ? 12 : 30;
  const questionCount = grade4PlaceValueScalarAlias(
    options,
    ["questionCount"],
    "question count",
    (value) => grade4PlaceValueInteger(value, "question count", 1, maxCount)
  ) ?? defaultCount;
  grade4PlaceValueScalarAlias(
    options,
    ["questionsPerPage"],
    "questions per page",
    (value) => grade4PlaceValueInteger(value, "questions per page", 1, defaultPerPage)
  );
  const includeExample = grade4PlaceValueScalarAlias(
    options,
    ["includeExample", "completedExample", "example"],
    "completed-example",
    (value) => grade4PlaceValueBoolean(value, "completed-example option")
  ) ?? false;
  const defaultMin = 1000;
  const defaultMax = isWords ? 9999 : 10000;
  const minimum = grade4PlaceValueScalarAlias(
    options,
    ["minValue", "minA", "minimumValue", "minimumNumber"],
    "minimum value",
    (value) => grade4PlaceValueInteger(value, "minimum value", 0, 10000)
  ) ?? defaultMin;
  const maximum = grade4PlaceValueScalarAlias(
    options,
    ["maxValue", "maxA", "maximumValue", "maximumNumber"],
    "maximum value",
    (value) => grade4PlaceValueInteger(value, "maximum value", 0, 10000)
  ) ?? defaultMax;
  if (minimum > maximum) throw new Error("Grade 4 place-value minimum value must not exceed maximum value.");
  const selected = grade4PlaceValueListAlias(
    options,
    ["selectedNumbers", "selectedValues", "onlyNumbers"],
    "selected numbers",
    (value) => grade4PlaceValueInteger(value, "selected number", 0, 10000)
  );
  if (selected?.some((value) => value < minimum || value > maximum)) {
    throw new Error("Grade 4 place-value selected numbers must remain inside the selected range.");
  }

  if (isLine) {
    const intervals = grade4PlaceValueListAlias(
      options,
      ["allowedIntervals", "intervals", "selectedIntervals", "numberLineIntervals"],
      "number-line intervals",
      (value) => grade4PlaceValueInteger(value, "number-line interval", 1, 500)
    ) || [...GRADE4_PLACE_VALUE_SAFE_INTERVALS];
    if (intervals.some((value) => !GRADE4_PLACE_VALUE_SAFE_INTERVALS.includes(value))) {
      throw new Error(`Grade 4 number lines support intervals ${GRADE4_PLACE_VALUE_SAFE_INTERVALS.join(", ")} only.`);
    }
    intervals.forEach((interval) => {
      if ((maximum - minimum) % interval !== 0 || maximum - minimum < interval * 10) {
        throw new Error("Grade 4 number-line intervals must divide the selected range and support ten intervals.");
      }
    });
    const tickCount = grade4PlaceValueScalarAlias(
      options,
      ["tickCount"],
      "tick count",
      (value) => grade4PlaceValueInteger(value, "tick count", 10, 10)
    );
    if (tickCount !== null && tickCount !== 10) throw new Error("Grade 4 number lines use exactly 10 intervals.");
    const endpointBoolean = grade4PlaceValueScalarAlias(
      options,
      ["allowEndpointTargets"],
      "endpoint option",
      (value) => grade4PlaceValueBoolean(value, "endpoint option")
    );
    const endpointPolicy = grade4PlaceValueScalarAlias(
      options,
      ["endpointPolicy"],
      "endpoint policy",
      normalizeGrade4EndpointPolicy
    );
    if (endpointBoolean !== null && endpointPolicy !== null && endpointBoolean !== endpointPolicy) {
      throw new Error("Grade 4 number-line endpoint aliases must agree.");
    }
    grade4PlaceValueScalarAlias(options, ["taskMode"], "task mode", normalizeGrade4NumberLineTask);
    if (selected && selected.length < questionCount + (includeExample ? 1 : 0)) {
      throw new Error("Grade 4 number-line selected values cannot support the requested unique targets.");
    }
  }

  if (isWords) {
    if ((selected?.length || maximum - minimum + 1) < questionCount + (includeExample ? 1 : 0)) {
      throw new Error("Grade 4 number words need enough unique values for the requested count.");
    }
  }

  if (item.id === GRADE4_COMPARE_NUMBERS_ID) {
    const includeEqualPairs = grade4PlaceValueScalarAlias(
      options,
      ["includeEqualPairs", "equalPairs"],
      "equality option",
      (value) => grade4PlaceValueBoolean(value, "equality option")
    ) ?? true;
    if ((includeEqualPairs && questionCount % 3 !== 0) || (!includeEqualPairs && questionCount % 2 !== 0)) {
      throw new Error("Grade 4 comparison question count must support exact symbol balance.");
    }
    const valueCount = selected?.length || maximum - minimum + 1;
    const equalCount = includeEqualPairs ? questionCount / 3 : 0;
    const unequalCount = questionCount - equalCount;
    const requiredUnequalPairs = unequalCount + (!includeEqualPairs && includeExample ? 1 : 0);
    if (valueCount < equalCount + (includeEqualPairs && includeExample ? 1 : 0) || valueCount * (valueCount - 1) / 2 < requiredUnequalPairs) {
      throw new Error("Grade 4 comparison value pool cannot support balanced unique pairs.");
    }
  }

  const truthKeys = [
    "answer", "answerState", "prompt", "responseTarget", "duplicateSignature",
    "targetValue", "targetIndex", "displayedLabels", "numberWord", "numeral",
    "leftValue", "rightValue", "expectedSymbol", "comparisonResult", "equalityState"
  ];
  if (truthKeys.some((key) => Object.prototype.hasOwnProperty.call(options, key))) {
    throw new Error("Grade 4 place-value caller-owned answer truth is not supported.");
  }
}

function normalizeGrade4PlaceValueOptions(item, options = {}, rawOptions = {}) {
  if (!GRADE4_PLACE_VALUE_BATCH4_IDS.has(item.id)) return options;
  const isLine = item.id === GRADE4_NUMBER_LINE_ID;
  const isWords = item.id === GRADE4_NUMBER_WORD_ID;
  const numberWordMode = isWords
    ? grade4PlaceValueScalarAlias(
      rawOptions,
      ["numberWordMode", "numberWordDirection", "mode"],
      "number-word direction",
      normalizeGrade4NumberWordMode
    ) || "numeral_to_word"
    : null;
  const normalized = { ...options };
  normalized.questionCount = Number(rawOptions.questionCount ?? (isLine ? 6 : isWords ? 12 : 30));
  normalized.questionsPerPage = Number(rawOptions.questionsPerPage ?? (isLine ? 6 : isWords ? 12 : 30));
  normalized.minA = Number(rawOptions.minValue ?? rawOptions.minA ?? rawOptions.minimumValue ?? rawOptions.minimumNumber ?? 1000);
  normalized.maxA = Number(rawOptions.maxValue ?? rawOptions.maxA ?? rawOptions.maximumValue ?? rawOptions.maximumNumber ?? (isWords ? 9999 : 10000));
  normalized.minValue = normalized.minA;
  normalized.maxValue = normalized.maxA;
  const selected = grade4PlaceValueListAlias(
    rawOptions,
    ["selectedNumbers", "selectedValues", "onlyNumbers"],
    "selected numbers",
    Number
  );
  if (selected) {
    normalized.selectedNumbers = selected;
    normalized.selectedValues = selected;
    normalized.onlyNumbers = selected.join(",");
  }
  normalized.includeExample = grade4PlaceValueScalarAlias(
    rawOptions,
    ["includeExample", "completedExample", "example"],
    "completed-example",
    grade4PlaceValueBoolean
  ) ?? false;

  if (isLine) {
    const intervals = grade4PlaceValueListAlias(
      rawOptions,
      ["allowedIntervals", "intervals", "selectedIntervals", "numberLineIntervals"],
      "number-line intervals",
      Number
    ) || [...GRADE4_PLACE_VALUE_SAFE_INTERVALS];
    const endpointBoolean = grade4PlaceValueScalarAlias(
      rawOptions,
      ["allowEndpointTargets"],
      "endpoint option",
      grade4PlaceValueBoolean
    );
    const endpointPolicy = grade4PlaceValueScalarAlias(
      rawOptions,
      ["endpointPolicy"],
      "endpoint policy",
      normalizeGrade4EndpointPolicy
    );
    normalized.allowedIntervals = intervals;
    normalized.intervals = intervals;
    normalized.selectedIntervals = intervals;
    normalized.tickCount = 10;
    normalized.allowEndpointTargets = endpointBoolean ?? endpointPolicy ?? true;
    normalized.endpointPolicy = normalized.allowEndpointTargets ? "endpoints_allowed" : "interior_only";
    normalized.taskMode = "identify_marked_number";
  } else if (isWords) {
    normalized.numberWordMode = numberWordMode;
    normalized.numberWordDirection = normalized.numberWordMode;
    normalized.promptStyle = "number_only";
  } else {
    normalized.includeEqualPairs = grade4PlaceValueScalarAlias(
      rawOptions,
      ["includeEqualPairs", "equalPairs"],
      "equality option",
      grade4PlaceValueBoolean
    ) ?? true;
  }
  return normalized;
}

const GRADE5_PLACE_VALUE_SAFE_INTERVALS = Object.freeze([100, 250, 500, 1000, 2500, 5000]);

function validateGrade5PlaceValueRawOptions(item, options = {}) {
  if (!GRADE5_PLACE_VALUE_BATCH4_IDS.has(item.id)) return;
  const isLine = item.id === GRADE5_NUMBER_LINE_ID;
  const isWords = item.id === GRADE5_NUMBER_WORD_ID;
  const isForm = item.id === GRADE5_EXPANDED_FORM_ID || item.id === GRADE5_STANDARD_FORM_ID;
  const defaultCount = isLine ? 6 : isWords ? 12 : 30;
  const maximumCount = isLine ? 12 : isWords ? 20 : 60;
  const perPageMaximum = isLine ? 6 : isWords ? 12 : 30;
  const questionCount = grade4PlaceValueScalarAlias(
    options, ["questionCount"], "question count",
    (value) => grade4PlaceValueInteger(value, "question count", 1, maximumCount)
  ) ?? defaultCount;
  grade4PlaceValueScalarAlias(
    options, ["questionsPerPage"], "questions per page",
    (value) => grade4PlaceValueInteger(value, "questions per page", 1, perPageMaximum)
  );
  const includeExample = grade4PlaceValueScalarAlias(
    options, ["includeExample", "completedExample", "example"], "completed-example",
    (value) => grade4PlaceValueBoolean(value, "completed-example option")
  ) ?? false;
  const minimum = grade4PlaceValueScalarAlias(
    options, ["minValue", "minA", "minimumValue", "minimumNumber"], "minimum value",
    (value) => grade4PlaceValueInteger(value, "minimum value", 0, 100000)
  ) ?? 10000;
  const maximum = grade4PlaceValueScalarAlias(
    options, ["maxValue", "maxA", "maximumValue", "maximumNumber"], "maximum value",
    (value) => grade4PlaceValueInteger(value, "maximum value", 0, 100000)
  ) ?? 100000;
  if (minimum > maximum) throw new Error("Grade 5 place-value minimum value must not exceed maximum value.");
  const selected = grade4PlaceValueListAlias(
    options, ["selectedNumbers", "selectedValues", "onlyNumbers"], "selected numbers",
    (value) => grade4PlaceValueInteger(value, "selected number", 0, 100000)
  );
  if (selected?.some((value) => value < minimum || value > maximum)) {
    throw new Error("Grade 5 place-value selected numbers must remain inside the selected range.");
  }
  if ((selected?.length || maximum - minimum + 1) < questionCount + (includeExample ? 1 : 0)) {
    throw new Error("Grade 5 place-value range must provide enough unique values.");
  }

  if (isLine) {
    const intervals = grade4PlaceValueListAlias(
      options, ["allowedIntervals", "intervals", "selectedIntervals", "numberLineIntervals"],
      "number-line intervals",
      (value) => grade4PlaceValueInteger(value, "number-line interval", 1, 5000)
    ) || [...GRADE5_PLACE_VALUE_SAFE_INTERVALS];
    if (intervals.some((value) => !GRADE5_PLACE_VALUE_SAFE_INTERVALS.includes(value))) {
      throw new Error(`Grade 5 number lines support intervals ${GRADE5_PLACE_VALUE_SAFE_INTERVALS.join(", ")} only.`);
    }
    intervals.forEach((interval) => {
      if (maximum - minimum < interval * 10) {
        throw new Error("Grade 5 number-line range must support ten intervals.");
      }
    });
    grade4PlaceValueScalarAlias(
      options, ["tickCount"], "tick count",
      (value) => grade4PlaceValueInteger(value, "tick count", 10, 10)
    );
    const endpointBoolean = grade4PlaceValueScalarAlias(
      options, ["allowEndpointTargets"], "endpoint option",
      (value) => grade4PlaceValueBoolean(value, "endpoint option")
    );
    const endpointPolicy = grade4PlaceValueScalarAlias(
      options, ["endpointPolicy"], "endpoint policy", normalizeGrade4EndpointPolicy
    );
    if (endpointBoolean !== null && endpointPolicy !== null && endpointBoolean !== endpointPolicy) {
      throw new Error("Grade 5 number-line endpoint aliases must agree.");
    }
    grade4PlaceValueScalarAlias(options, ["taskMode"], "task mode", normalizeGrade4NumberLineTask);
  }

  if (isWords) {
    grade4PlaceValueScalarAlias(
      options, ["numberWordMode", "numberWordDirection", "mode"],
      "number-word direction", normalizeGrade4NumberWordMode
    );
    if (Object.prototype.hasOwnProperty.call(options, "locale") && options.locale !== "en-CA") {
      throw new Error("Grade 5 number words use Canadian English (en-CA) only.");
    }
    if (["includeAnd", "useAnd"].some((key) => grade4PlaceValueEntries(options, [key]).length &&
      grade4PlaceValueBoolean(options[key], key))) {
      throw new Error("Grade 5 number words use the approved no-and convention.");
    }
  }
  if (isForm && Object.prototype.hasOwnProperty.call(options, "answerStyle")) {
    const style = String(options.answerStyle).trim().toLowerCase().replace(/[\s-]+/g, "_");
    if (!["canonical", "expanded_sum", "place_value_sum"].includes(style)) {
      throw new Error("Grade 5 forms support canonical place-value sums only.");
    }
  }
  const truthKeys = [
    "answer", "answerState", "prompt", "responseTarget", "duplicateSignature",
    "targetValue", "targetIndex", "displayedLabels", "numberWord", "numeral",
    "expandedForm", "expandedTerms", "placeValueDigits", "pageCount", "interval"
  ];
  if (truthKeys.some((key) => Object.prototype.hasOwnProperty.call(options, key))) {
    throw new Error("Grade 5 place-value caller-owned answer truth is not supported.");
  }
}

function normalizeGrade5PlaceValueOptions(item, options = {}, rawOptions = {}) {
  if (!GRADE5_PLACE_VALUE_BATCH4_IDS.has(item.id)) return options;
  const isLine = item.id === GRADE5_NUMBER_LINE_ID;
  const isWords = item.id === GRADE5_NUMBER_WORD_ID;
  const normalized = { ...options };
  normalized.questionCount = Number(rawOptions.questionCount ?? (isLine ? 6 : isWords ? 12 : 30));
  normalized.questionsPerPage = Number(rawOptions.questionsPerPage ?? (isLine ? 6 : isWords ? 12 : 30));
  normalized.minA = Number(rawOptions.minValue ?? rawOptions.minA ?? rawOptions.minimumValue ?? rawOptions.minimumNumber ?? 10000);
  normalized.maxA = Number(rawOptions.maxValue ?? rawOptions.maxA ?? rawOptions.maximumValue ?? rawOptions.maximumNumber ?? 100000);
  normalized.minValue = normalized.minA;
  normalized.maxValue = normalized.maxA;
  const selected = grade4PlaceValueListAlias(
    rawOptions, ["selectedNumbers", "selectedValues", "onlyNumbers"], "selected numbers", Number
  );
  if (selected) {
    normalized.selectedNumbers = selected;
    normalized.selectedValues = selected;
    normalized.onlyNumbers = selected.join(",");
  }
  normalized.includeExample = grade4PlaceValueScalarAlias(
    rawOptions, ["includeExample", "completedExample", "example"],
    "completed-example", grade4PlaceValueBoolean
  ) ?? false;
  if (isLine) {
    normalized.allowedIntervals = grade4PlaceValueListAlias(
      rawOptions, ["allowedIntervals", "intervals", "selectedIntervals", "numberLineIntervals"],
      "number-line intervals", Number
    ) || [...GRADE5_PLACE_VALUE_SAFE_INTERVALS];
    normalized.intervals = normalized.allowedIntervals;
    normalized.selectedIntervals = normalized.allowedIntervals;
    const endpointBoolean = grade4PlaceValueScalarAlias(
      rawOptions, ["allowEndpointTargets"], "endpoint option", grade4PlaceValueBoolean
    );
    const endpointPolicy = grade4PlaceValueScalarAlias(
      rawOptions, ["endpointPolicy"], "endpoint policy", normalizeGrade4EndpointPolicy
    );
    normalized.tickCount = 10;
    normalized.allowEndpointTargets = endpointBoolean ?? endpointPolicy ?? true;
    normalized.endpointPolicy = normalized.allowEndpointTargets ? "endpoints_allowed" : "interior_only";
    normalized.taskMode = "identify_marked_number";
  } else if (isWords) {
    normalized.numberWordMode = grade4PlaceValueScalarAlias(
      rawOptions, ["numberWordMode", "numberWordDirection", "mode"],
      "number-word direction", normalizeGrade4NumberWordMode
    ) || "numeral_to_word";
    normalized.numberWordDirection = normalized.numberWordMode;
    normalized.locale = "en-CA";
    normalized.promptStyle = "number_only";
  } else {
    normalized.answerStyle = "canonical";
  }
  return normalized;
}

function validateGrade5CompactRelationalRawOptions(item, options = {}) {
  if (!GRADE5_COMPACT_RELATIONAL_IDS.has(item.id)) return;
  const isEquation = item.id === GRADE5_EQUATION_MATCH_ID;
  const defaultCount = 30;
  const maximumCount = 60;
  const perPageMaximum = 30;
  const questionCount = grade4PlaceValueScalarAlias(
    options,
    ["questionCount"],
    "Grade 5 compact-relational question count",
    (value) => grade4PlaceValueInteger(value, "Grade 5 compact-relational question count", 1, maximumCount)
  ) ?? defaultCount;
  grade4PlaceValueScalarAlias(
    options,
    ["questionsPerPage"],
    "Grade 5 compact-relational questions per page",
    (value) => grade4PlaceValueInteger(value, "Grade 5 compact-relational questions per page", 1, perPageMaximum)
  );
  const includeExample = grade4PlaceValueScalarAlias(
    options,
    ["includeExample", "completedExample", "example"],
    "Grade 5 compact-relational completed-example option",
    (value) => grade4PlaceValueBoolean(value, "Grade 5 compact-relational completed-example option")
  ) ?? false;

  if (isEquation) {
    const minimumResult = grade4PlaceValueScalarAlias(
      options,
      ["minimumResult", "minResult", "minimumValue"],
      "Grade 5 equation-comparison minimum result",
      (value) => grade4PlaceValueInteger(value, "Grade 5 equation-comparison minimum result", 0, 9999)
    ) ?? 1000;
    const maximumResult = grade4PlaceValueScalarAlias(
      options,
      ["maximumResult", "maxResult", "maxTotal", "maximumTotal", "maximumValue"],
      "Grade 5 equation-comparison maximum result",
      (value) => grade4PlaceValueInteger(value, "Grade 5 equation-comparison maximum result", 1, 10000)
    ) ?? 10000;
    if (minimumResult >= maximumResult) {
      throw new Error("Grade 5 equation-comparison minimum result must be less than maximum result.");
    }
    const includeEqualPairs = grade4PlaceValueScalarAlias(
      options,
      ["includeEqualPairs"],
      "Grade 5 equation-comparison equality option",
      (value) => grade4PlaceValueBoolean(value, "Grade 5 equation-comparison equality option")
    ) ?? true;
    const equalPairs = grade4PlaceValueScalarAlias(
      options,
      ["equalPairs", "equalityCount"],
      "Grade 5 equation-comparison equality count",
      (value) => grade4PlaceValueInteger(value, "Grade 5 equation-comparison equality count", 0, questionCount)
    );
    if (!includeEqualPairs && equalPairs !== null && equalPairs !== 0) {
      throw new Error("Grade 5 equation-comparison equality controls must agree.");
    }
    const operationMode = grade4PlaceValueScalarAlias(
      options,
      ["operationMode", "mode"],
      "Grade 5 equation-comparison operation mode",
      normalizeGrade4EquationOperationMode
    );
    const selectedOperations = grade4PlaceValueListAlias(
      options,
      ["selectedOperations", "operations"],
      "Grade 5 equation-comparison operations",
      normalizeGrade4EquationOperationMode
    );
    if (selectedOperations?.includes("mixed")) {
      throw new Error("Grade 5 equation-comparison selected operations must list addition and/or subtraction.");
    }
    const selectedMode = selectedOperations
      ? selectedOperations.length === 2 ? "mixed" : selectedOperations[0]
      : null;
    if (operationMode && selectedMode && operationMode !== selectedMode) {
      throw new Error("Grade 5 equation-comparison operation aliases must agree.");
    }
    const resolvedEqualPairs = includeEqualPairs ? (equalPairs ?? Math.floor(questionCount / 2)) : 0;
    const templateCount = (operationMode || selectedMode || "mixed") === "mixed" ? 3 : 1;
    const resultCount = maximumResult - minimumResult + 1;
    const exampleUsesEqual = includeExample && resolvedEqualPairs > 0 ? 1 : 0;
    const exampleUsesNotEqual = includeExample && resolvedEqualPairs === 0 ? 1 : 0;
    if (
      resolvedEqualPairs + exampleUsesEqual > resultCount * templateCount ||
      questionCount - resolvedEqualPairs + exampleUsesNotEqual > resultCount * templateCount
    ) {
      throw new Error("Grade 5 equation-comparison result range cannot support the requested unique pair contract.");
    }
    const unsupported = [
      "minA", "maxA", "minB", "maxB", "minimumOperand", "maximumOperand",
      "selectedNumbers", "selectedValues", "onlyNumbers", "relation", "relationSymbol",
      "selectedRelations", "expression", "leftExpression", "rightExpression",
      "leftOperands", "rightOperands", "leftValue", "rightValue", "expectedSymbol",
      "expectedRelation", "comparisonResult", "equalityState", "prompt", "answer",
      "answerState", "responseTarget", "duplicateSignature"
    ];
    if (unsupported.some((key) => Object.prototype.hasOwnProperty.call(options, key))) {
      throw new Error("Grade 5 equation comparison does not accept operand selectors or caller-owned expression/answer truth.");
    }
    return;
  }

  const minimum = grade4PlaceValueScalarAlias(
    options,
    ["minValue", "minA", "minimumValue", "minimumNumber"],
    "Grade 5 comparison minimum value",
    (value) => grade4PlaceValueInteger(value, "Grade 5 comparison minimum value", 0, 100000)
  ) ?? 10000;
  const maximum = grade4PlaceValueScalarAlias(
    options,
    ["maxValue", "maxA", "maximumValue", "maximumNumber"],
    "Grade 5 comparison maximum value",
    (value) => grade4PlaceValueInteger(value, "Grade 5 comparison maximum value", 0, 100000)
  ) ?? 100000;
  if (minimum >= maximum) {
    throw new Error("Grade 5 comparison minimum value must be less than maximum value.");
  }
  const selected = grade4PlaceValueListAlias(
    options,
    ["selectedNumbers", "selectedValues", "onlyNumbers"],
    "Grade 5 comparison selected numbers",
    (value) => grade4PlaceValueInteger(value, "Grade 5 comparison selected number", 0, 100000)
  );
  if (selected?.some((value) => value < minimum || value > maximum)) {
    throw new Error("Grade 5 comparison selected numbers must remain inside the selected range.");
  }
  const includeEqualPairs = grade4PlaceValueScalarAlias(
    options,
    ["includeEqualPairs"],
    "Grade 5 comparison equality option",
    (value) => grade4PlaceValueBoolean(value, "Grade 5 comparison equality option")
  ) ?? true;
  const explicitEqualCount = grade4PlaceValueScalarAlias(
    options,
    ["equalPairs", "equalityCount"],
    "Grade 5 comparison equality count",
    (value) => grade4PlaceValueInteger(value, "Grade 5 comparison equality count", 0, questionCount)
  );
  if (!includeEqualPairs && explicitEqualCount !== null && explicitEqualCount !== 0) {
    throw new Error("Grade 5 comparison equality controls must agree.");
  }
  const equalCount = includeEqualPairs
    ? explicitEqualCount ?? Math.floor(questionCount / 3)
    : 0;
  if ((questionCount - equalCount) % 2 !== 0) {
    throw new Error("Grade 5 comparison equality count must leave an even number of unequal pairs.");
  }
  const valueCount = selected?.length || maximum - minimum + 1;
  const exampleEqualCount = includeExample && includeEqualPairs ? 1 : 0;
  const exampleUnequalCount = includeExample && !includeEqualPairs ? 1 : 0;
  if (
    valueCount < equalCount + exampleEqualCount ||
    valueCount * (valueCount - 1) / 2 < questionCount - equalCount + exampleUnequalCount
  ) {
    throw new Error("Grade 5 comparison value pool cannot support the requested unique pair contract.");
  }
  const unsupported = [
    "operationMode", "selectedOperations", "relation", "relationSymbol", "selectedRelations",
    "leftValue", "rightValue", "expectedSymbol", "comparisonResult", "equalityState",
    "prompt", "answer", "answerState", "responseTarget", "duplicateSignature"
  ];
  if (unsupported.some((key) => Object.prototype.hasOwnProperty.call(options, key))) {
    throw new Error("Grade 5 number comparison does not accept operation controls or caller-owned comparison truth.");
  }
}

function validateGrade5TextDataInterpretationRawOptions(item, options = {}) {
  if (item.id !== GRADE5_TEXT_DATA_INTERPRETATION_ID) return;
  const questionCount = grade4PlaceValueScalarAlias(
    options,
    ["questionCount"],
    "Grade 5 text-data question count",
    (value) => grade4PlaceValueInteger(
      value,
      "Grade 5 text-data question count",
      1,
      GRADE5_TEXT_DATA_MAXIMUM_QUESTION_COUNT
    )
  ) ?? 12;
  grade4PlaceValueScalarAlias(
    options,
    ["questionsPerPage"],
    "Grade 5 text-data questions per page",
    (value) => grade4PlaceValueInteger(value, "Grade 5 text-data questions per page", 1, 6)
  );
  const includeExample = grade4PlaceValueScalarAlias(
    options,
    ["includeExample", "completedExample", "example"],
    "Grade 5 text-data completed-example option",
    (value) => grade4PlaceValueBoolean(value, "Grade 5 text-data completed-example option")
  ) ?? false;
  const mode = grade4PlaceValueScalarAlias(
    options,
    ["textDataQuestionMode", "questionMode"],
    "Grade 5 text-data question mode",
    (value) => {
      const normalized = String(value).trim().toLowerCase().replaceAll("-", "_");
      if (!GRADE5_TEXT_DATA_MODE_CAPACITIES[normalized]) {
        throw new Error(
          "Grade 5 text-data question mode must be default, all, difference, combined_total, or ordering_true_false."
        );
      }
      return normalized;
    }
  ) ?? "default";
  const reservedExampleCount = includeExample && ["default", "all"].includes(mode) ? 1 : 0;
  const availableStudentQuestions =
    GRADE5_TEXT_DATA_MODE_CAPACITIES[mode] - reservedExampleCount;
  if (questionCount > availableStudentQuestions) {
    throw new Error(
      `Grade 5 text-data mode '${mode}' provides ${availableStudentQuestions} unique student questions` +
      `${includeExample ? " after reserving the completed example" : ""}.`
    );
  }
  const unsupported = [
    "data", "dataSet", "dataSets", "sourceData", "selectedDataSets",
    "categories", "categoryLabels", "selectedCategories", "values", "categoryValues",
    "selectedValues", "questionType", "questionTypes", "selectedQuestionTypes",
    "prompt", "answer", "answerState", "responseTarget", "duplicateSignature",
    "graphData", "graphQuestionType", "graphCategory"
  ];
  if (unsupported.some((key) => Object.prototype.hasOwnProperty.call(options, key))) {
    throw new Error("Grade 5 text-data interpretation does not accept caller-owned data, question selection, or answer truth.");
  }
}

function normalizeGrade5TextDataInterpretationOptions(item, options = {}, rawOptions = {}) {
  if (item.id !== GRADE5_TEXT_DATA_INTERPRETATION_ID) return options;
  const mode = grade4PlaceValueScalarAlias(
    rawOptions,
    ["textDataQuestionMode", "questionMode"],
    "Grade 5 text-data question mode",
    (value) => String(value).trim().toLowerCase().replaceAll("-", "_")
  ) ?? "default";
  return {
    ...options,
    questionCount: Number(rawOptions.questionCount ?? 12),
    questionsPerPage: Number(rawOptions.questionsPerPage ?? 6),
    textDataQuestionMode: mode
  };
}

function normalizeGrade5CompactRelationalOptions(item, options = {}, rawOptions = {}) {
  if (!GRADE5_COMPACT_RELATIONAL_IDS.has(item.id)) return options;
  const isEquation = item.id === GRADE5_EQUATION_MATCH_ID;
  const normalized = { ...options };
  normalized.questionCount = Number(rawOptions.questionCount ?? 30);
  normalized.questionsPerPage = Number(rawOptions.questionsPerPage ?? 30);
  normalized.includeExample = grade4PlaceValueScalarAlias(
    rawOptions,
    ["includeExample", "completedExample", "example"],
    "Grade 5 compact-relational completed-example option",
    grade4PlaceValueBoolean
  ) ?? false;

  if (isEquation) {
    normalized.minimumResult = Number(
      rawOptions.minimumResult ?? rawOptions.minResult ?? rawOptions.minimumValue ?? 1000
    );
    normalized.maximumResult = Number(
      rawOptions.maximumResult ?? rawOptions.maxResult ?? rawOptions.maxTotal ??
      rawOptions.maximumTotal ?? rawOptions.maximumValue ?? 10000
    );
    normalized.includeEqualPairs = grade4PlaceValueScalarAlias(
      rawOptions,
      ["includeEqualPairs"],
      "Grade 5 equation-comparison equality option",
      grade4PlaceValueBoolean
    ) ?? true;
    normalized.equalPairs = normalized.includeEqualPairs
      ? grade4PlaceValueScalarAlias(
        rawOptions,
        ["equalPairs", "equalityCount"],
        "Grade 5 equation-comparison equality count",
        Number
      ) ?? Math.floor(normalized.questionCount / 2)
      : 0;
    const explicitMode = grade4PlaceValueScalarAlias(
      rawOptions,
      ["operationMode", "mode"],
      "Grade 5 equation-comparison operation mode",
      normalizeGrade4EquationOperationMode
    );
    const selectedOperations = grade4PlaceValueListAlias(
      rawOptions,
      ["selectedOperations", "operations"],
      "Grade 5 equation-comparison operations",
      normalizeGrade4EquationOperationMode
    );
    normalized.operationMode = explicitMode || (
      selectedOperations
        ? selectedOperations.length === 2 ? "mixed" : selectedOperations[0]
        : "mixed"
    );
    return normalized;
  }

  normalized.minA = Number(
    rawOptions.minValue ?? rawOptions.minA ?? rawOptions.minimumValue ??
    rawOptions.minimumNumber ?? 10000
  );
  normalized.maxA = Number(
    rawOptions.maxValue ?? rawOptions.maxA ?? rawOptions.maximumValue ??
    rawOptions.maximumNumber ?? 100000
  );
  normalized.minValue = normalized.minA;
  normalized.maxValue = normalized.maxA;
  const selected = grade4PlaceValueListAlias(
    rawOptions,
    ["selectedNumbers", "selectedValues", "onlyNumbers"],
    "Grade 5 comparison selected numbers",
    Number
  );
  if (selected) {
    normalized.selectedNumbers = selected;
    normalized.selectedValues = selected;
    normalized.onlyNumbers = selected.join(",");
  }
  normalized.includeEqualPairs = grade4PlaceValueScalarAlias(
    rawOptions,
    ["includeEqualPairs"],
    "Grade 5 comparison equality option",
    grade4PlaceValueBoolean
  ) ?? true;
  normalized.equalityCount = normalized.includeEqualPairs
    ? grade4PlaceValueScalarAlias(
      rawOptions,
      ["equalPairs", "equalityCount"],
      "Grade 5 comparison equality count",
      Number
    ) ?? Math.floor(normalized.questionCount / 3)
    : 0;
  return normalized;
}

function normalizeGrade3ConcreteVisualOptions(item, options = {}) {
  if (!GRADE3_CONCRETE_VISUAL_IDS.has(item.id)) return options;
  const normalized = { ...options };

  if (item.id === GRADE3_EQUAL_SHARING_ID) {
    const requestedTaskMode = String(options.taskMode || "distribute").trim().toLowerCase();
    if (requestedTaskMode !== "distribute") {
      throw new Error("Grade 3 Equal Sharing Division supports share-into-groups mode only.");
    }
    normalized.questionCount = Math.max(1, Math.round(finiteNumber(options.questionCount, 8)));
    normalized.questionsPerPage = Math.max(1, Math.min(3, Math.round(finiteNumber(options.questionsPerPage, 3))));
    normalized.minGroups = Math.max(2, Math.round(finiteNumber(options.minGroups ?? options.minFactorA ?? options.minA, 2)));
    normalized.maxGroups = Math.min(6, Math.max(normalized.minGroups, Math.round(finiteNumber(options.maxGroups ?? options.maxFactorA ?? options.maxA, 6))));
    normalized.minItemsPerGroup = Math.max(2, Math.round(finiteNumber(options.minItemsPerGroup ?? options.minFactorB ?? options.minB, 2)));
    normalized.maxItemsPerGroup = Math.min(6, Math.max(normalized.minItemsPerGroup, Math.round(finiteNumber(options.maxItemsPerGroup ?? options.maxFactorB ?? options.maxB, 6))));
    normalized.maxProduct = Math.min(36, Math.max(4, finiteNumber(options.maxProduct ?? options.maxTotal, 36)));
    normalized.maxTotal = normalized.maxProduct;
    normalized.taskMode = "distribute";
    normalized.responseMode = "division_sentence";
    normalized.equationSupport = String(options.equationSupport || "blanks").trim().toLowerCase() === "independent"
      ? "independent"
      : "blanks";
    normalized.showQuestionSentence = parseBoolean(options.showQuestionSentence, true);
    normalized.balanceFactorValues = true;
  }

  if (item.id === GRADE3_SHADE_FRACTION_ID) {
    normalized.questionCount = Math.max(1, Math.min(8, Math.round(finiteNumber(options.questionCount, 8))));
    if (Number.isFinite(Number(options.questionCount)) && Number(options.questionCount) > 8) {
      throw new Error("Grade 3 Shade the Fraction supports at most 8 student questions per worksheet.");
    }
    normalized.questionsPerPage = normalized.questionCount;
    normalized.modelType = options.modelType || "strip";
  }

  if (item.id === GRADE3_NUMBER_LINE_IDENTIFY_ID) {
    normalized.questionCount = Math.max(1, Math.round(finiteNumber(options.questionCount, 6)));
    normalized.questionsPerPage = Math.max(1, Math.min(6, Math.round(finiteNumber(options.questionsPerPage, 6))));
    normalized.minValue = Math.max(0, Math.round(finiteNumber(options.minValue ?? options.minA, 100)));
    normalized.maxValue = Math.min(1000, Math.max(normalized.minValue + 100, Math.round(finiteNumber(options.maxValue ?? options.maxA, 1000))));
    normalized.allowedIntervals = parseNumberList(
      options.allowedIntervals || options.intervals || options.selectedIntervals
    ).map(Math.round);
    if (!normalized.allowedIntervals.length) normalized.allowedIntervals = [10, 25, 50, 100];
    normalized.allowEndpointTargets = parseBoolean(options.allowEndpointTargets, true);
    normalized.selectedNumbers = parseNumberList(options.selectedNumbers || options.onlyNumbers).map(Math.round);
  }

  return normalized;
}

function normalizeGrade3FractionBatch6Options(item, options = {}) {
  if (!GRADE3_FRACTION_BATCH6_IMPLEMENTED_IDS.has(item.id)) return options;
  const normalized = { ...options };
  normalized.includeExample = parseBoolean(
    options.includeExample ?? options.completedExample ?? options.example,
    false
  );

  const safeDenominators = [2, 3, 4, 5, 6, 8];
  const requestedDenominators = [
    options.selectedDenominators,
    options.denominators,
    options.allowedDenominators
  ].flatMap((value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") return value.split(/[\s,|]+/).filter(Boolean);
    return value == null ? [] : [value];
  }).map(Number);
  if (requestedDenominators.some((value) => !Number.isInteger(value) || !safeDenominators.includes(value))) {
    throw new Error("Grade 3 fractions support denominators 2, 3, 4, 5, 6, and 8 only.");
  }
  const denominators = [...new Set(requestedDenominators)];
  normalized.selectedDenominators = denominators.length ? denominators : safeDenominators;
  normalized.allowedDenominators = normalized.selectedDenominators;

  if (item.id === GRADE3_COMPARE_FRACTIONS_ID) {
    normalized.questionCount = Math.max(1, Math.round(finiteNumber(options.questionCount, 12)));
    normalized.questionsPerPage = Math.max(1, Math.min(12, Math.round(finiteNumber(options.questionsPerPage, 12))));
    normalized.selectedNumerators = parseNumberList(options.selectedNumerators || options.numerators);
    normalized.minNumerator = Math.max(1, Math.round(finiteNumber(options.minNumerator, 1)));
    normalized.maxNumerator = Math.max(normalized.minNumerator, Math.round(finiteNumber(options.maxNumerator, 7)));
    normalized.equalPairs = Number.isFinite(Number(options.equalPairs))
      ? Math.max(0, Math.round(Number(options.equalPairs)))
      : Math.round(normalized.questionCount / 3);
  }

  if (item.id === GRADE3_FRACTION_NUMBER_LINE_ID) {
    normalized.questionCount = Math.max(1, Math.round(finiteNumber(options.questionCount, 6)));
    normalized.questionsPerPage = Math.max(1, Math.min(6, Math.round(finiteNumber(options.questionsPerPage, 6))));
    normalized.allowEndpointTargets = parseBoolean(options.allowEndpointTargets, false);
    normalized.taskMode = String(options.taskMode || "identify").trim().toLowerCase();
  }
  return normalized;
}

function grade4FractionExplicitEntries(options, aliases) {
  return aliases
    .filter((alias) => Object.prototype.hasOwnProperty.call(options, alias))
    .map((alias) => ({ alias, value: options[alias] }));
}

function grade4FractionInteger(value, label, minimum, maximum) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < minimum || number > maximum) {
    throw new Error(`Grade 4 structured fractions ${label} must be a whole number from ${minimum} through ${maximum}.`);
  }
  return number;
}

function grade4FractionBoolean(value, label) {
  if (typeof value === "boolean") return value;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  throw new Error(`Grade 4 structured fractions ${label} must be true or false.`);
}

function grade4FractionRawList(value, label) {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string" ? value.split(/[\s,|]+/) : value == null ? [] : [value];
  if (!values.length || values.some((entry) => entry === "" || entry === null || entry === undefined)) {
    throw new Error(`Grade 4 structured fractions ${label} must not be empty.`);
  }
  return values;
}

function grade4FractionIntegerAliasList(options, aliases, label, minimum, maximum) {
  const entries = grade4FractionExplicitEntries(options, aliases);
  if (!entries.length) return null;
  const lists = entries.map(({ value }) => grade4FractionRawList(value, label)
    .map((entry) => grade4FractionInteger(entry, label, minimum, maximum)));
  lists.forEach((list) => {
    if (new Set(list).size !== list.length) throw new Error(`Grade 4 structured fractions ${label} values must be unique.`);
  });
  const signatures = lists.map((list) => [...list].sort((a, b) => a - b).join(","));
  if (new Set(signatures).size !== 1) throw new Error(`Grade 4 structured fractions ${label} aliases must agree.`);
  return lists[0];
}

function grade4FractionParse(value, label) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return {
      numerator: grade4FractionInteger(value.numerator, `${label} numerator`, 0, 12),
      denominator: grade4FractionInteger(value.denominator, `${label} denominator`, 1, 12)
    };
  }
  const match = String(value).trim().match(/^(\d+)\s*\/\s*(\d+)$/);
  if (!match) throw new Error(`Grade 4 structured fractions ${label} must use numerator/denominator format.`);
  return {
    numerator: grade4FractionInteger(match[1], `${label} numerator`, 0, 12),
    denominator: grade4FractionInteger(match[2], `${label} denominator`, 1, 12)
  };
}

function grade4FractionAliasFractions(options) {
  const entries = grade4FractionExplicitEntries(options, ["selectedFractions", "fractions"]);
  if (!entries.length) return null;
  const lists = entries.map(({ value }) => {
    const raw = Array.isArray(value)
      ? value
      : typeof value === "string" ? value.split(/[,|]+/).map((entry) => entry.trim()) : value == null ? [] : [value];
    if (!raw.length || raw.some((entry) => entry === "" || entry === null || entry === undefined)) {
      throw new Error("Grade 4 structured fractions selected fractions must not be empty.");
    }
    return raw.map((entry) => grade4FractionParse(entry, "selected fraction"));
  });
  lists.forEach((list) => {
    const signatures = list.map(({ numerator, denominator }) => `${numerator}/${denominator}`);
    if (new Set(signatures).size !== signatures.length) {
      throw new Error("Grade 4 structured fractions selected fractions must be unique.");
    }
  });
  const signatures = lists.map((list) => list.map(({ numerator, denominator }) => `${numerator}/${denominator}`).sort().join(","));
  if (new Set(signatures).size !== 1) throw new Error("Grade 4 structured fractions selected-fraction aliases must agree.");
  return lists[0];
}

function grade4FractionAliasScalar(options, aliases, label, normalize) {
  const entries = grade4FractionExplicitEntries(options, aliases);
  if (!entries.length) return null;
  const values = entries.map(({ value }) => normalize(value));
  if (new Set(values.map((value) => JSON.stringify(value))).size !== 1) {
    throw new Error(`Grade 4 structured fractions ${label} aliases must agree.`);
  }
  return values[0];
}

function validateGrade4StructuredFractionRawOptions(item, options = {}) {
  if (!GRADE4_STRUCTURED_FRACTION_IDS.has(item.id)) return;
  const isCompare = item.id === GRADE4_COMPARE_FRACTIONS_ID;
  const isLine = item.id === GRADE4_FRACTION_NUMBER_LINE_ID;
  const isShade = item.id === GRADE4_SHADE_FRACTION_ID;
  const safeDenominators = isLine ? [2, 3, 4, 5, 6, 8, 10] : [2, 3, 4, 5, 6, 8, 10, 12];
  const defaultCount = isCompare ? 12 : isLine ? 6 : 8;
  const maxCount = isCompare ? 30 : isLine ? 12 : 8;
  const maxPerPage = isCompare ? 30 : defaultCount;

  const questionCount = grade4FractionAliasScalar(options, ["questionCount"], "question count", (value) => grade4FractionInteger(value, "question count", 1, maxCount)) ?? defaultCount;
  const questionsPerPage = grade4FractionAliasScalar(options, ["questionsPerPage"], "questions per page", (value) => grade4FractionInteger(value, "questions per page", 1, maxPerPage)) ?? defaultCount;
  const includeExample = grade4FractionAliasScalar(
    options,
    ["includeExample", "completedExample", "example"],
    "completed-example",
    (value) => grade4FractionBoolean(value, "completed-example option")
  ) ?? false;
  if (questionCount + (includeExample ? 1 : 0) > questionsPerPage * 2) {
    throw new Error("Grade 4 structured fraction density must fit within two student pages.");
  }

  const denominators = grade4FractionIntegerAliasList(
    options,
    ["selectedDenominators", "denominators", "allowedDenominators"],
    "selected denominator",
    2,
    12
  );
  if (denominators?.some((denominator) => !safeDenominators.includes(denominator))) {
    throw new Error(`Grade 4 structured fractions support denominators ${safeDenominators.join(", ")} for this resource.`);
  }

  const endpointAliasValue = isLine
    ? grade4FractionAliasScalar(options, ["allowEndpointTargets", "allowEndpoints"], "endpoint policy", (value) => grade4FractionBoolean(value, "endpoint policy"))
    : null;
  const endpointsAllowed = isLine && (endpointAliasValue ?? String(options.endpointPolicy || "").trim().toLowerCase() === "allowed");
  const fractions = grade4FractionAliasFractions(options);
  fractions?.forEach(({ numerator, denominator }) => {
    if (!safeDenominators.includes(denominator) || (denominators && !denominators.includes(denominator))) {
      throw new Error("Grade 4 structured fraction selections must use an allowed denominator.");
    }
    const minimumNumerator = endpointsAllowed ? 0 : 1;
    const maximumNumerator = endpointsAllowed ? denominator : denominator - 1;
    if (numerator < minimumNumerator || numerator > maximumNumerator) {
      throw new Error("Grade 4 structured fraction selections must satisfy the proper-fraction and endpoint contract.");
    }
  });

  const numeratorKeys = ["selectedNumerators", "numerators", "minNumerator", "minimumNumerator", "maxNumerator", "maximumNumerator"];
  if (isLine && numeratorKeys.some((key) => Object.prototype.hasOwnProperty.call(options, key))) {
    throw new Error("Grade 4 fraction-number-line numerator ranges are unsupported; use selected fractions.");
  }
  const selectedNumerators = isLine ? null : grade4FractionIntegerAliasList(options, ["selectedNumerators", "numerators"], "selected numerator", 1, 11);
  const minNumerator = isLine ? 1 : grade4FractionAliasScalar(options, ["minNumerator", "minimumNumerator"], "minimum numerator", (value) => grade4FractionInteger(value, "minimum numerator", 1, 11)) ?? 1;
  const maxNumerator = isLine ? 11 : grade4FractionAliasScalar(options, ["maxNumerator", "maximumNumerator"], "maximum numerator", (value) => grade4FractionInteger(value, "maximum numerator", 1, 11)) ?? 11;
  if (!isLine && minNumerator > maxNumerator) throw new Error("Grade 4 structured fraction minimum numerator must not exceed maximum numerator.");
  if (selectedNumerators?.some((numerator) => numerator < minNumerator || numerator > maxNumerator)) {
    throw new Error("Grade 4 structured fraction selected numerators must stay inside the numerator range.");
  }

  const equalityKeys = ["includeEqualPairs", "equalPairs"];
  if (!isCompare && equalityKeys.some((key) => Object.prototype.hasOwnProperty.call(options, key))) {
    throw new Error("Grade 4 equal-pair controls are supported only by Compare Fractions.");
  }
  if (isCompare) {
    const includeEqualPairs = grade4FractionAliasScalar(options, ["includeEqualPairs"], "equal-pair option", (value) => grade4FractionBoolean(value, "equal-pair option"));
    const equalPairs = grade4FractionAliasScalar(options, ["equalPairs"], "equal-pair count", (value) => grade4FractionInteger(value, "equal-pair count", 0, questionCount));
    if (includeEqualPairs === false && equalPairs > 0) throw new Error("Grade 4 Compare Fractions equal-pair controls conflict.");
  }

  const endpointKeys = ["allowEndpointTargets", "allowEndpoints", "endpointPolicy"];
  if (!isLine && endpointKeys.some((key) => Object.prototype.hasOwnProperty.call(options, key))) {
    throw new Error("Grade 4 endpoint controls are supported only by Fractions on a Number Line.");
  }
  if (isLine) {
    grade4FractionAliasScalar(options, ["allowEndpointTargets", "allowEndpoints"], "endpoint policy", (value) => grade4FractionBoolean(value, "endpoint policy"));
    if (options.endpointPolicy !== undefined && !["interior_only", "allowed"].includes(String(options.endpointPolicy).trim().toLowerCase())) {
      throw new Error("Grade 4 fraction-number-line endpoint policy must be interior_only or allowed.");
    }
    if (options.endpointPolicy !== undefined && endpointAliasValue !== null) {
      const policyAllowsEndpoints = String(options.endpointPolicy).trim().toLowerCase() === "allowed";
      if (policyAllowsEndpoints !== endpointAliasValue) {
        throw new Error("Grade 4 fraction-number-line endpoint aliases conflict.");
      }
    }
    const mode = String(options.taskMode || "identify_marked_fraction").trim().toLowerCase();
    if (!["identify", "identify_marked_fraction"].includes(mode)) {
      throw new Error("Grade 4 Fractions on a Number Line supports identify-marked-fraction mode only.");
    }
    if (["wholeStart", "wholeEnd", "minimumWhole", "maximumWhole", "minValue", "maxValue", "interval"].some((key) => Object.prototype.hasOwnProperty.call(options, key))) {
      throw new Error("Grade 4 Fractions on a Number Line does not support whole-number interval controls.");
    }
  } else if (Object.prototype.hasOwnProperty.call(options, "taskMode")) {
    const allowed = isShade ? ["shade", "shade_equal_parts"] : [];
    if (!allowed.includes(String(options.taskMode).trim().toLowerCase())) {
      throw new Error("Grade 4 structured fraction task mode is unsupported for this resource.");
    }
  }

  const modelKeys = ["modelType", "modelSet"];
  if (!isShade && modelKeys.some((key) => Object.prototype.hasOwnProperty.call(options, key))) {
    throw new Error("Grade 4 model controls are supported only by Shade the Fraction.");
  }
  if (isShade) {
    grade4FractionAliasScalar(options, modelKeys, "model type", (value) => {
      const model = String(value).trim().toLowerCase();
      if (!["strip", "fraction_strip"].includes(model)) throw new Error("Grade 4 Shade the Fraction supports fraction strips only.");
      return "strip";
    });
    if (["shadedParts", "shadeCount", "studentShadedParts", "answerKeyShadedParts"].some((key) => Object.prototype.hasOwnProperty.call(options, key))) {
      throw new Error("Grade 4 Shade the Fraction derives student and answer-key shading from structured fraction truth.");
    }
  }
}

function normalizeGrade4StructuredFractionOptions(item, options = {}) {
  if (!GRADE4_STRUCTURED_FRACTION_IDS.has(item.id)) return options;
  const isCompare = item.id === GRADE4_COMPARE_FRACTIONS_ID;
  const isLine = item.id === GRADE4_FRACTION_NUMBER_LINE_ID;
  const defaultCount = isCompare ? 12 : isLine ? 6 : 8;
  const safeDenominators = isLine ? [2, 3, 4, 5, 6, 8, 10] : [2, 3, 4, 5, 6, 8, 10, 12];
  const denominators = grade4FractionIntegerAliasList(options, ["selectedDenominators", "denominators", "allowedDenominators"], "selected denominator", 2, 12);
  const includeExample = grade4FractionAliasScalar(options, ["includeExample", "completedExample", "example"], "completed-example", (value) => grade4FractionBoolean(value, "completed-example option")) ?? false;
  const normalized = {
    ...options,
    questionCount: options.questionCount === undefined ? defaultCount : Number(options.questionCount),
    questionsPerPage: options.questionsPerPage === undefined ? defaultCount : Number(options.questionsPerPage),
    selectedDenominators: denominators || safeDenominators,
    allowedDenominators: denominators || safeDenominators,
    includeExample
  };
  if (isCompare) {
    normalized.selectedNumerators = grade4FractionIntegerAliasList(options, ["selectedNumerators", "numerators"], "selected numerator", 1, 11) || [];
    normalized.minNumerator = grade4FractionAliasScalar(options, ["minNumerator", "minimumNumerator"], "minimum numerator", (value) => Number(value)) ?? 1;
    normalized.maxNumerator = grade4FractionAliasScalar(options, ["maxNumerator", "maximumNumerator"], "maximum numerator", (value) => Number(value)) ?? 11;
    normalized.includeEqualPairs = options.equalPairs !== undefined
      ? true
      : options.includeEqualPairs === undefined ? true : grade4FractionBoolean(options.includeEqualPairs, "equal-pair option");
    normalized.equalPairs = options.equalPairs === undefined ? 4 : Number(options.equalPairs);
  } else if (isLine) {
    const endpointAlias = options.allowEndpointTargets ?? options.allowEndpoints;
    const endpointPolicy = String(options.endpointPolicy || "").trim().toLowerCase();
    normalized.allowEndpointTargets = endpointAlias === undefined ? endpointPolicy === "allowed" : grade4FractionBoolean(endpointAlias, "endpoint policy");
    normalized.taskMode = "identify_marked_fraction";
  } else {
    normalized.selectedNumerators = grade4FractionIntegerAliasList(options, ["selectedNumerators", "numerators"], "selected numerator", 1, 11) || [];
    normalized.minNumerator = grade4FractionAliasScalar(options, ["minNumerator", "minimumNumerator"], "minimum numerator", (value) => Number(value)) ?? 1;
    normalized.maxNumerator = grade4FractionAliasScalar(options, ["maxNumerator", "maximumNumerator"], "maximum numerator", (value) => Number(value)) ?? 11;
    normalized.modelType = "strip";
    normalized.taskMode = "shade_equal_parts";
  }
  return normalized;
}

function validateGrade5StructuredFractionRawOptions(item, options = {}) {
  if (!GRADE5_STRUCTURED_FRACTION_IDS.has(item.id)) return;
  const isLine = item.id === GRADE5_FRACTION_NUMBER_LINE_ID;
  const isCompletion = item.id === GRADE5_EQUIVALENT_FRACTION_COMPLETION_ID;
  const isShade = item.id === GRADE5_SHADE_FRACTION_ID;
  const safeDenominators = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12];
  const defaultCount = isLine ? 6 : isCompletion ? 36 : 8;
  const maxCount = isLine ? 12 : isCompletion ? 36 : 8;
  const maxPerPage = isCompletion ? 36 : defaultCount;
  const callerOwnedTruthKeys = [
    "prompt",
    "answer",
    "answerState",
    "responseTarget",
    "duplicateSignature",
    "visual",
    "fractionModel",
    "fractionWorkedModel",
    "leftNumerator",
    "leftDenominator",
    "rightNumerator",
    "rightDenominator",
    "leftCrossProduct",
    "rightCrossProduct",
    "missingValue",
    "partCount",
    "partitionCount"
  ];
  if (callerOwnedTruthKeys.some((key) => Object.prototype.hasOwnProperty.call(options, key))) {
    throw new Error("Grade 5 structured fraction truth is generator-owned and cannot be supplied by the caller.");
  }
  const unsupportedSharedKeys = [
    "pageCount",
    "fractionType",
    "properImproperMode",
    "properFractionMode",
    "improperMode",
    "mixedNumberMode",
    "includeMixedNumbers",
    "simplifyMode",
    "simplificationMode",
    "commonDenominatorMode",
    "relationCounts",
    "selectedRelations",
    "includeEqualPairs",
    "equalPairs"
  ];
  if (unsupportedSharedKeys.some((key) => Object.prototype.hasOwnProperty.call(options, key))) {
    throw new Error("The requested Grade 5 structured fraction control is not supported by this exact task role.");
  }

  const questionCount = grade4FractionAliasScalar(
    options,
    ["questionCount"],
    "question count",
    (value) => grade4FractionInteger(value, "question count", 1, maxCount)
  ) ?? defaultCount;
  const questionsPerPage = grade4FractionAliasScalar(
    options,
    ["questionsPerPage"],
    "questions per page",
    (value) => grade4FractionInteger(value, "questions per page", 1, maxPerPage)
  ) ?? maxPerPage;
  const includeExample = grade4FractionAliasScalar(
    options,
    ["includeExample", "completedExample", "example"],
    "completed-example",
    (value) => grade4FractionBoolean(value, "completed-example option")
  ) ?? false;
  const densityCount = questionCount + (!isCompletion && includeExample ? 1 : 0);
  if (densityCount > questionsPerPage * 2) {
    throw new Error("Grade 5 structured fraction density must fit within two student pages.");
  }

  const denominators = grade4FractionIntegerAliasList(
    options,
    ["selectedDenominators", "denominators", "allowedDenominators"],
    "selected denominator",
    2,
    12
  );
  if (denominators?.some((denominator) => !safeDenominators.includes(denominator))) {
    throw new Error(`Grade 5 structured fractions support denominators ${safeDenominators.join(", ")} only.`);
  }

  const endpointAliasValue = isLine
    ? grade4FractionAliasScalar(
      options,
      ["allowEndpointTargets", "allowEndpoints"],
      "endpoint policy",
      (value) => grade4FractionBoolean(value, "endpoint policy")
    )
    : null;
  const endpointsAllowed = isLine && (
    endpointAliasValue ??
    String(options.endpointPolicy || "").trim().toLowerCase() === "allowed"
  );
  const fractions = grade4FractionAliasFractions(options);
  fractions?.forEach(({ numerator, denominator }) => {
    if (!safeDenominators.includes(denominator) || (denominators && !denominators.includes(denominator))) {
      throw new Error("Grade 5 structured fraction selections must use an allowed denominator.");
    }
    const minimumNumerator = endpointsAllowed ? 0 : 1;
    const maximumNumerator = endpointsAllowed ? denominator : denominator - 1;
    if (numerator < minimumNumerator || numerator > maximumNumerator) {
      throw new Error("Grade 5 structured fraction selections must satisfy the proper-fraction and endpoint contract.");
    }
  });

  const numeratorKeys = [
    "selectedNumerators",
    "numerators",
    "minNumerator",
    "minimumNumerator",
    "maxNumerator",
    "maximumNumerator"
  ];
  if (isLine && numeratorKeys.some((key) => Object.prototype.hasOwnProperty.call(options, key))) {
    throw new Error("Grade 5 fraction-number-line numerator ranges are unsupported; use selected fractions.");
  }
  if (!isLine) {
    const selectedNumerators = grade4FractionIntegerAliasList(
      options,
      ["selectedNumerators", "numerators"],
      "selected numerator",
      1,
      11
    );
    const minNumerator = grade4FractionAliasScalar(
      options,
      ["minNumerator", "minimumNumerator"],
      "minimum numerator",
      (value) => grade4FractionInteger(value, "minimum numerator", 1, 11)
    ) ?? 1;
    const maxNumerator = grade4FractionAliasScalar(
      options,
      ["maxNumerator", "maximumNumerator"],
      "maximum numerator",
      (value) => grade4FractionInteger(value, "maximum numerator", 1, 11)
    ) ?? 11;
    if (minNumerator > maxNumerator) {
      throw new Error("Grade 5 structured fraction minimum numerator must not exceed maximum numerator.");
    }
    if (selectedNumerators?.some((numerator) => numerator < minNumerator || numerator > maxNumerator)) {
      throw new Error("Grade 5 structured fraction selected numerators must stay inside the numerator range.");
    }
  }

  const endpointKeys = ["allowEndpointTargets", "allowEndpoints", "endpointPolicy"];
  if (!isLine && endpointKeys.some((key) => Object.prototype.hasOwnProperty.call(options, key))) {
    throw new Error("Grade 5 endpoint controls are supported only by Fractions on a Number Line.");
  }
  if (isLine) {
    if (options.endpointPolicy !== undefined &&
        !["interior_only", "allowed"].includes(String(options.endpointPolicy).trim().toLowerCase())) {
      throw new Error("Grade 5 fraction-number-line endpoint policy must be interior_only or allowed.");
    }
    if (options.endpointPolicy !== undefined && endpointAliasValue !== null) {
      const policyAllowsEndpoints = String(options.endpointPolicy).trim().toLowerCase() === "allowed";
      if (policyAllowsEndpoints !== endpointAliasValue) {
        throw new Error("Grade 5 fraction-number-line endpoint aliases conflict.");
      }
    }
    const mode = String(options.taskMode || "identify_marked_fraction").trim().toLowerCase();
    if (!["identify", "identify_marked_fraction"].includes(mode)) {
      throw new Error("Grade 5 Fractions on a Number Line supports identify-marked-fraction mode only.");
    }
    if (["wholeStart", "wholeEnd", "minimumWhole", "maximumWhole", "minValue", "maxValue", "interval"]
      .some((key) => Object.prototype.hasOwnProperty.call(options, key))) {
      throw new Error("Grade 5 Fractions on a Number Line does not support whole-number interval controls.");
    }
  }

  const modelKeys = ["modelType", "modelSet"];
  if (!isShade && modelKeys.some((key) => Object.prototype.hasOwnProperty.call(options, key))) {
    throw new Error("Grade 5 model controls are supported only by Shade the Fraction.");
  }
  if (isShade) {
    grade4FractionAliasScalar(options, modelKeys, "model type", (value) => {
      const model = String(value).trim().toLowerCase();
      if (!["strip", "fraction_strip"].includes(model)) {
        throw new Error("Grade 5 Shade the Fraction supports fraction strips only.");
      }
      return "strip";
    });
    const taskMode = String(options.taskMode || "shade_equal_parts").trim().toLowerCase();
    if (!["shade", "shade_equal_parts"].includes(taskMode)) {
      throw new Error("Grade 5 Shade the Fraction supports shade-equal-parts mode only.");
    }
    if (["shadedParts", "shadeCount", "studentShadedParts", "answerKeyShadedParts"]
      .some((key) => Object.prototype.hasOwnProperty.call(options, key))) {
      throw new Error("Grade 5 Shade the Fraction derives shading from structured fraction truth.");
    }
  }

  const multiplierKeys = ["selectedMultipliers", "multipliers", "factors"];
  if (!isCompletion && multiplierKeys.some((key) => Object.prototype.hasOwnProperty.call(options, key))) {
    throw new Error("Grade 5 multiplier controls are supported only by Complete Equivalent Fractions.");
  }
  if (isCompletion) {
    const multipliers = grade4FractionIntegerAliasList(
      options,
      multiplierKeys,
      "multiplier",
      2,
      5
    );
    if (multipliers?.some((multiplier) => ![2, 3, 4, 5].includes(multiplier))) {
      throw new Error("Grade 5 equivalent fractions support multipliers 2, 3, 4, and 5 only.");
    }
    const missingEntries = grade4FractionExplicitEntries(options, ["missingPosition", "missingPositions"]);
    missingEntries.forEach(({ value }) => {
      const values = Array.isArray(value)
        ? value
        : typeof value === "string" ? value.split(/[\s,|]+/).filter(Boolean) : [value];
      const normalized = values.map((entry) => String(entry).trim().toLowerCase());
      if (!normalized.length || normalized.some((entry) => (
        !["mixed", "numerator", "denominator", "right_numerator", "right_denominator"].includes(entry)
      ))) {
        throw new Error("Grade 5 equivalent-fraction missing positions must be numerator, denominator, or mixed.");
      }
    });
    if (Object.prototype.hasOwnProperty.call(options, "taskMode") &&
        !["complete", "complete_equivalent_fraction"].includes(String(options.taskMode).trim().toLowerCase())) {
      throw new Error("Grade 5 Complete Equivalent Fractions supports equation-completion mode only.");
    }
  }
}

function normalizeGrade5StructuredFractionOptions(item, options = {}) {
  if (!GRADE5_STRUCTURED_FRACTION_IDS.has(item.id)) return options;
  const isLine = item.id === GRADE5_FRACTION_NUMBER_LINE_ID;
  const isCompletion = item.id === GRADE5_EQUIVALENT_FRACTION_COMPLETION_ID;
  const defaultCount = isLine ? 6 : isCompletion ? 36 : 8;
  const defaultQuestionsPerPage = isCompletion ? 36 : defaultCount;
  const safeDenominators = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12];
  const denominators = grade4FractionIntegerAliasList(
    options,
    ["selectedDenominators", "denominators", "allowedDenominators"],
    "selected denominator",
    2,
    12
  );
  const includeExample = grade4FractionAliasScalar(
    options,
    ["includeExample", "completedExample", "example"],
    "completed-example",
    (value) => grade4FractionBoolean(value, "completed-example option")
  ) ?? false;
  const normalized = {
    ...options,
    questionCount: options.questionCount === undefined ? defaultCount : Number(options.questionCount),
    questionsPerPage: options.questionsPerPage === undefined ? defaultQuestionsPerPage : Number(options.questionsPerPage),
    selectedDenominators: denominators || safeDenominators,
    allowedDenominators: denominators || safeDenominators,
    includeExample
  };
  if (isLine) {
    const endpointAlias = options.allowEndpointTargets ?? options.allowEndpoints;
    const endpointPolicy = String(options.endpointPolicy || "").trim().toLowerCase();
    normalized.allowEndpointTargets = endpointAlias === undefined
      ? endpointPolicy === "allowed"
      : grade4FractionBoolean(endpointAlias, "endpoint policy");
    normalized.taskMode = "identify_marked_fraction";
  } else {
    normalized.selectedNumerators = grade4FractionIntegerAliasList(
      options,
      ["selectedNumerators", "numerators"],
      "selected numerator",
      1,
      11
    ) || [];
    normalized.minNumerator = grade4FractionAliasScalar(
      options,
      ["minNumerator", "minimumNumerator"],
      "minimum numerator",
      (value) => Number(value)
    ) ?? 1;
    normalized.maxNumerator = grade4FractionAliasScalar(
      options,
      ["maxNumerator", "maximumNumerator"],
      "maximum numerator",
      (value) => Number(value)
    ) ?? 11;
    if (isCompletion) {
      normalized.selectedMultipliers = grade4FractionIntegerAliasList(
        options,
        ["selectedMultipliers", "multipliers", "factors"],
        "multiplier",
        2,
        5
      ) || [2, 3, 4, 5];
      normalized.missingPosition = options.missingPosition ?? options.missingPositions ?? "mixed";
      normalized.taskMode = "complete_equivalent_fraction";
    } else {
      normalized.modelType = "strip";
      normalized.taskMode = "shade_equal_parts";
    }
  }
  return normalized;
}

function normalizeGrade3DataBatch7Options(item, options = {}) {
  const task = GRADE3_DATA_BATCH7_TASKS[item.id];
  if (!task) return options;
  const normalized = { ...options };
  const defaultCount = GRADE3_DATA_BATCH7_DEFAULT_COUNTS[task];
  const maximumCount = GRADE3_DATA_BATCH7_MAX_COUNTS[task];
  const requestedCount = finiteNumber(options.questionCount, defaultCount);
  if (!Number.isInteger(requestedCount) || requestedCount < 1 || requestedCount > maximumCount) {
    throw new Error(`Grade 3 ${task} data displays support 1 to ${maximumCount} items.`);
  }
  normalized.questionCount = requestedCount;
  normalized.questionsPerPage = Math.max(
    1,
    Math.min(requestedCount, Math.round(finiteNumber(options.questionsPerPage, defaultCount)))
  );
  normalized.includeExample = parseBoolean(
    options.includeExample ?? options.completedExample ?? options.example,
    false
  );
  if (["complete", "match"].includes(task) && normalized.includeExample) {
    throw new Error(`Grade 3 ${task} data displays do not support completed examples.`);
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

function grade4PatternOptionEntries(value, label) {
  const entries = Array.isArray(value)
    ? value
    : typeof value === "string" ? value.split(",").map((entry) => entry.trim()) : [value];
  if (!entries.length || entries.some((entry) => entry === "" || entry === null || entry === undefined)) {
    throw new Error(`Grade 4 numeric pattern ${label} must not be empty.`);
  }
  return entries;
}

function grade4PatternInteger(value, label, min, max) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new Error(`Grade 4 numeric pattern ${label} must be a whole number from ${min} to ${max}.`);
  }
  return number;
}

function grade4PatternOperation(value) {
  const normalized = String(value).trim().toLowerCase();
  if (["add", "addition", "+"].includes(normalized)) return "add";
  if (["subtract", "subtraction", "minus", "-"].includes(normalized)) return "subtract";
  if (["mixed", "add_subtract", "addition_subtraction"].includes(normalized)) return "mixed";
  throw new Error(`Unsupported Grade 4 numeric pattern operation: ${value}.`);
}

function explicitGrade4PatternValue(options, keys) {
  const entries = keys
    .filter((key) => options[key] !== undefined && options[key] !== null && options[key] !== "")
    .map((key) => ({ key, value: options[key] }));
  return entries.length ? entries : null;
}

function explicitGrade4PatternListValue(options, keys) {
  const entries = keys
    .filter((key) => Object.prototype.hasOwnProperty.call(options, key) && options[key] !== null && options[key] !== undefined)
    .map((key) => ({ key, value: options[key] }));
  return entries.length ? entries : null;
}

function validateGrade4PatternAliasGroup(options, keys, label, normalize) {
  const entries = explicitGrade4PatternValue(options, keys);
  if (!entries) return;
  const values = entries.map(({ value }) => normalize(value));
  if (values.some((value) => JSON.stringify(value) !== JSON.stringify(values[0]))) {
    throw new Error(`Conflicting Grade 4 numeric pattern ${label} aliases.`);
  }
}

function validateGrade4NumericPatternRawOptions(item, options = {}) {
  if (!GRADE4_NUMERIC_PATTERN_IDS.has(item.id)) return;
  const activity = item.activityTypes?.[0];

  const integerGroups = [
    [["questionCount"], "question count", 1, activity === "extend_pattern" ? 12 : activity === "identify_pattern_rule" ? 18 : 20],
    [["questionsPerPage"], "questions per page", 1, activity === "extend_pattern" ? 13 : activity === "identify_pattern_rule" ? 10 : 12],
    [["startingValue", "startNumber"], "starting value", 0, 1000],
    [["minStart", "minimumStart", "minimumValue"], "minimum start", 0, 1000],
    [["maxStart", "maximumStart", "maximumValue"], "maximum start", 0, 1000],
    [["sequenceStep", "step"], "fixed step", 1, 100],
    [["minStep", "minimumStep"], "minimum step", 1, 100],
    [["maxStep", "maximumStep"], "maximum step", 1, 100],
    [["minValue", "minimumSequenceValue"], "minimum sequence value", 0, 1000],
    [["maxValue", "maximumSequenceValue"], "maximum sequence value", 1, 1000]
  ];
  integerGroups.forEach(([keys, label, min, max]) => {
    validateGrade4PatternAliasGroup(options, keys, label, (value) => grade4PatternInteger(value, label, min, max));
  });

  const minStart = explicitGrade4PatternValue(options, ["minStart", "minimumStart", "minimumValue"]);
  const maxStart = explicitGrade4PatternValue(options, ["maxStart", "maximumStart", "maximumValue"]);
  if (minStart && maxStart && Number(minStart[0].value) > Number(maxStart[0].value)) {
    throw new Error("Grade 4 numeric pattern minimum start must not exceed maximum start.");
  }
  const minStep = explicitGrade4PatternValue(options, ["minStep", "minimumStep"]);
  const maxStep = explicitGrade4PatternValue(options, ["maxStep", "maximumStep"]);
  if (minStep && maxStep && Number(minStep[0].value) > Number(maxStep[0].value)) {
    throw new Error("Grade 4 numeric pattern minimum step must not exceed maximum step.");
  }

  validateGrade4PatternAliasGroup(options, ["operationMode", "operation", "ruleType"], "operation", grade4PatternOperation);
  const selectedOperationEntries = explicitGrade4PatternListValue(options, ["selectedOperations", "onlyOperations"]);
  if (selectedOperationEntries) {
    const lists = selectedOperationEntries.map(({ value }) => grade4PatternOptionEntries(value, "selected operations").map(grade4PatternOperation));
    lists.forEach((list) => {
      if (list.includes("mixed") || new Set(list).size !== list.length || list.length > 2) {
        throw new Error("Grade 4 numeric pattern selected operations must contain unique add/subtract values.");
      }
    });
    if (lists.some((list) => JSON.stringify(list) !== JSON.stringify(lists[0]))) {
      throw new Error("Conflicting Grade 4 numeric pattern selected-operation aliases.");
    }
    const operationEntries = explicitGrade4PatternValue(options, ["operationMode", "operation", "ruleType"]);
    const selectedMode = lists[0].length === 2 ? "mixed" : lists[0][0];
    if (operationEntries && grade4PatternOperation(operationEntries[0].value) !== selectedMode) {
      throw new Error("Conflicting Grade 4 numeric pattern operation selections.");
    }
  }

  const selectedStepEntries = explicitGrade4PatternListValue(options, ["selectedSteps", "onlySteps"]);
  if (selectedStepEntries) {
    const lists = selectedStepEntries.map(({ value }) => grade4PatternOptionEntries(value, "selected steps")
      .map((entry) => grade4PatternInteger(entry, "selected step", 1, 100)));
    lists.forEach((list) => {
      if (new Set(list).size !== list.length) {
        throw new Error("Grade 4 numeric pattern selected steps must be unique.");
      }
    });
    if (lists.some((list) => JSON.stringify(list) !== JSON.stringify(lists[0]))) {
      throw new Error("Conflicting Grade 4 numeric pattern selected-step aliases.");
    }
    const fixedStepEntries = explicitGrade4PatternValue(options, ["sequenceStep", "step"]);
    if (fixedStepEntries && (lists[0].length !== 1 || lists[0][0] !== Number(fixedStepEntries[0].value))) {
      throw new Error("Conflicting Grade 4 numeric pattern fixed and selected steps.");
    }
    if (minStep && lists[0].some((step) => step < Number(minStep[0].value))) {
      throw new Error("Grade 4 numeric pattern selected steps must respect the minimum step.");
    }
    if (maxStep && lists[0].some((step) => step > Number(maxStep[0].value))) {
      throw new Error("Grade 4 numeric pattern selected steps must respect the maximum step.");
    }
  }

  if (activity === "extend_pattern") {
    validateGrade4PatternAliasGroup(options, ["visibleLength", "shownTermCount"], "visible-term count", (value) => grade4PatternInteger(value, "visible-term count", 4, 6));
    validateGrade4PatternAliasGroup(options, ["continuationCount", "extensionCount", "answerCount"], "continuation count", (value) => grade4PatternInteger(value, "continuation count", 1, 3));
  } else {
    validateGrade4PatternAliasGroup(options, ["sequenceLength", "termCount"], "sequence length", (value) => grade4PatternInteger(value, "sequence length", 5, 7));
  }

  if (activity === "missing_value_pattern") {
    validateGrade4PatternAliasGroup(options, ["missingTermCount", "missingCount"], "missing-value count", (value) => grade4PatternInteger(value, "missing-value count", 1, 2));
    const placementEntries = explicitGrade4PatternValue(options, ["missingTermPlacement", "missingPlacement"]);
    if (placementEntries) {
      const placements = placementEntries.map(({ value }) => String(value).trim().toLowerCase() === "mixed" ? "random" : String(value).trim().toLowerCase());
      if (placements.some((value) => !["beginning", "middle", "end", "random"].includes(value)) || new Set(placements).size !== 1) {
        throw new Error("Grade 4 numeric pattern missing placement must be beginning, middle, end, random, or mixed.");
      }
    }
    const indexEntries = explicitGrade4PatternListValue(options, ["missingIndexes", "missingPositions"]);
    if (indexEntries) {
      const sequenceLengthEntries = explicitGrade4PatternValue(options, ["sequenceLength", "termCount"]);
      const sequenceLength = sequenceLengthEntries ? Number(sequenceLengthEntries[0].value) : 7;
      const indexes = grade4PatternOptionEntries(indexEntries[0].value, "missing indexes")
        .map((entry) => grade4PatternInteger(entry, "missing index", 0, sequenceLength - 1));
      if (new Set(indexes).size !== indexes.length || indexes.length > 2 || sequenceLength - indexes.length < 3) {
        throw new Error("Grade 4 numeric pattern missing indexes must be unique and leave at least three visible terms.");
      }
      const missingCountEntries = explicitGrade4PatternValue(options, ["missingTermCount", "missingCount"]);
      if (missingCountEntries && Number(missingCountEntries[0].value) !== indexes.length) {
        throw new Error("Grade 4 numeric pattern missing-value count must match the explicit missing indexes.");
      }
      if (placementEntries) {
        throw new Error("Use either Grade 4 numeric pattern missing indexes or missing placement, not both.");
      }
    }
  } else if (explicitGrade4PatternValue(options, ["missingIndexes", "missingPositions", "missingTermCount", "missingCount", "missingTermPlacement", "missingPlacement"])) {
    throw new Error("Missing-value controls are supported only by Find the Missing Values.");
  }

  let includesExample = false;
  const exampleEntries = explicitGrade4PatternValue(options, ["includeExample", "completedExample", "example"]);
  if (exampleEntries) {
    const normalizeBoolean = (value) => {
      if (typeof value === "boolean") return value;
      const normalized = String(value).trim().toLowerCase();
      if (["1", "true", "yes", "on"].includes(normalized)) return true;
      if (["0", "false", "no", "off"].includes(normalized)) return false;
      throw new Error("Grade 4 numeric pattern completed-example options must be boolean.");
    };
    const values = exampleEntries.map(({ value }) => normalizeBoolean(value));
    if (new Set(values).size !== 1) throw new Error("Conflicting Grade 4 numeric pattern completed-example aliases.");
    includesExample = values[0];
  }

  const questionCountEntries = explicitGrade4PatternValue(options, ["questionCount"]);
  const perPageEntries = explicitGrade4PatternValue(options, ["questionsPerPage"]);
  const questionCount = questionCountEntries
    ? Number(questionCountEntries[0].value)
    : activity === "identify_pattern_rule" ? 10 : 12;
  const questionsPerPage = perPageEntries
    ? Number(perPageEntries[0].value)
    : activity === "extend_pattern" && includesExample ? 13 : activity === "identify_pattern_rule" ? 10 : 12;
  if (questionCount + (includesExample ? 1 : 0) > questionsPerPage * 2) {
    throw new Error("Grade 4 numeric pattern question count, page density, and completed example must fit within two student pages.");
  }
  if (activity === "extend_pattern") {
    const visibleEntries = explicitGrade4PatternValue(options, ["visibleLength", "shownTermCount"]);
    const continuationEntries = explicitGrade4PatternValue(options, ["continuationCount", "extensionCount", "answerCount"]);
    const visibleLength = visibleEntries ? Number(visibleEntries[0].value) : 5;
    const continuationCount = continuationEntries ? Number(continuationEntries[0].value) : 2;
    if (visibleLength + continuationCount > 7) {
      throw new Error("Grade 4 numeric pattern extension rows support at most seven total terms.");
    }
    if (questionCount + (includesExample ? 1 : 0) > questionsPerPage) {
      throw new Error("Grade 4 numeric pattern extension rows must fit on one student page.");
    }
  }
}

function grade5PatternOptionEntries(value, label) {
  const entries = Array.isArray(value)
    ? value
    : typeof value === "string" ? value.split(",").map((entry) => entry.trim()) : [value];
  if (!entries.length || entries.some((entry) => entry === "" || entry === null || entry === undefined)) {
    throw new Error(`Grade 5 numeric pattern ${label} must not be empty.`);
  }
  return entries;
}

function grade5PatternInteger(value, label, min, max) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new Error(`Grade 5 numeric pattern ${label} must be a whole number from ${min} to ${max}.`);
  }
  return number;
}

function grade5PatternOperation(value) {
  const normalized = String(value).trim().toLowerCase();
  if (["add", "addition", "+"].includes(normalized)) return "add";
  if (["subtract", "subtraction", "minus", "-"].includes(normalized)) return "subtract";
  if (["mixed", "add_subtract", "addition_subtraction"].includes(normalized)) return "mixed";
  throw new Error(`Unsupported Grade 5 numeric pattern operation: ${value}.`);
}

function validateGrade5PatternAliasGroup(options, keys, label, normalize) {
  const entries = explicitGrade4PatternValue(options, keys);
  if (!entries) return;
  const values = entries.map(({ value }) => normalize(value));
  if (values.some((value) => JSON.stringify(value) !== JSON.stringify(values[0]))) {
    throw new Error(`Conflicting Grade 5 numeric pattern ${label} aliases.`);
  }
}

function validateGrade5NumericPatternRawOptions(item, options = {}) {
  if (!GRADE5_NUMERIC_PATTERN_IDS.has(item.id)) return;
  const activity = item.activityTypes?.[0];

  const forbiddenTruthKeys = [
    "sequence",
    "fullSequence",
    "visiblePrefix",
    "displayedSequence",
    "continuationValues",
    "missingValues",
    "responseTargets",
    "answer",
    "answerList",
    "answerState",
    "ruleText",
    "studentFacingRule",
    "acceptedNormalizedRule",
    "duplicateSignature"
  ];
  const forbidden = forbiddenTruthKeys.filter((key) => Object.prototype.hasOwnProperty.call(options, key));
  if (forbidden.length) {
    throw new Error(`Grade 5 numeric pattern truth is generator-owned; remove: ${forbidden.join(", ")}.`);
  }
  if (explicitGrade4PatternListValue(options, ["selectedStarts", "onlyStarts"])) {
    throw new Error("Grade 5 numeric pattern selected starts are not supported; use a fixed start or start range.");
  }

  const integerGroups = [
    [["questionCount"], "question count", 1, activity === "extend_pattern" ? 12 : activity === "identify_pattern_rule" ? 18 : 20],
    [["questionsPerPage"], "questions per page", 1, activity === "extend_pattern" ? 13 : activity === "identify_pattern_rule" ? 10 : 12],
    [["startingValue", "startNumber"], "starting value", 0, 1000],
    [["minStart", "minimumStart", "minimumValue"], "minimum start", 0, 1000],
    [["maxStart", "maximumStart", "maximumValue"], "maximum start", 0, 1000],
    [["sequenceStep", "step"], "fixed rule amount", 1, 100],
    [["minStep", "minimumStep", "minimumRuleAmount"], "minimum rule amount", 1, 100],
    [["maxStep", "maximumStep", "maximumRuleAmount"], "maximum rule amount", 1, 100],
    [["minValue", "minimumSequenceValue"], "minimum sequence value", 0, 1000],
    [["maxValue", "maximumSequenceValue"], "maximum sequence value", 1, 1000]
  ];
  integerGroups.forEach(([keys, label, min, max]) => {
    validateGrade5PatternAliasGroup(options, keys, label, (value) => grade5PatternInteger(value, label, min, max));
  });

  const minStart = explicitGrade4PatternValue(options, ["minStart", "minimumStart", "minimumValue"]);
  const maxStart = explicitGrade4PatternValue(options, ["maxStart", "maximumStart", "maximumValue"]);
  if (minStart && maxStart && Number(minStart[0].value) > Number(maxStart[0].value)) {
    throw new Error("Grade 5 numeric pattern minimum start must not exceed maximum start.");
  }
  const fixedStart = explicitGrade4PatternValue(options, ["startingValue", "startNumber"]);
  if (
    fixedStart &&
    ((minStart && Number(minStart[0].value) !== Number(fixedStart[0].value)) ||
      (maxStart && Number(maxStart[0].value) !== Number(fixedStart[0].value)))
  ) {
    throw new Error("Conflicting Grade 5 numeric pattern fixed start and start range.");
  }
  const minStep = explicitGrade4PatternValue(options, ["minStep", "minimumStep", "minimumRuleAmount"]);
  const maxStep = explicitGrade4PatternValue(options, ["maxStep", "maximumStep", "maximumRuleAmount"]);
  if (minStep && maxStep && Number(minStep[0].value) > Number(maxStep[0].value)) {
    throw new Error("Grade 5 numeric pattern minimum rule amount must not exceed maximum rule amount.");
  }
  const fixedStep = explicitGrade4PatternValue(options, ["sequenceStep", "step"]);
  if (
    fixedStep &&
    ((minStep && Number(minStep[0].value) !== Number(fixedStep[0].value)) ||
      (maxStep && Number(maxStep[0].value) !== Number(fixedStep[0].value)))
  ) {
    throw new Error("Conflicting Grade 5 numeric pattern fixed rule amount and rule-amount range.");
  }

  validateGrade5PatternAliasGroup(options, ["operationMode", "operation", "ruleType"], "operation", grade5PatternOperation);
  const selectedOperationEntries = explicitGrade4PatternListValue(options, ["selectedOperations", "onlyOperations"]);
  if (selectedOperationEntries) {
    const lists = selectedOperationEntries.map(({ value }) =>
      grade5PatternOptionEntries(value, "selected operations").map(grade5PatternOperation)
    );
    lists.forEach((list) => {
      if (list.includes("mixed") || new Set(list).size !== list.length || list.length > 2) {
        throw new Error("Grade 5 numeric pattern selected operations must contain unique add/subtract values.");
      }
    });
    if (lists.some((list) => JSON.stringify(list) !== JSON.stringify(lists[0]))) {
      throw new Error("Conflicting Grade 5 numeric pattern selected-operation aliases.");
    }
    const operationEntries = explicitGrade4PatternValue(options, ["operationMode", "operation", "ruleType"]);
    const selectedMode = lists[0].length === 2 ? "mixed" : lists[0][0];
    if (operationEntries && grade5PatternOperation(operationEntries[0].value) !== selectedMode) {
      throw new Error("Conflicting Grade 5 numeric pattern operation selections.");
    }
  }

  const selectedStepEntries = explicitGrade4PatternListValue(
    options,
    ["selectedSteps", "onlySteps", "selectedRuleAmounts", "ruleAmounts"]
  );
  if (selectedStepEntries) {
    const lists = selectedStepEntries.map(({ value }) =>
      grade5PatternOptionEntries(value, "selected rule amounts")
        .map((entry) => grade5PatternInteger(entry, "selected rule amount", 1, 100))
    );
    lists.forEach((list) => {
      if (new Set(list).size !== list.length) {
        throw new Error("Grade 5 numeric pattern selected rule amounts must be unique.");
      }
    });
    if (lists.some((list) => JSON.stringify(list) !== JSON.stringify(lists[0]))) {
      throw new Error("Conflicting Grade 5 numeric pattern selected-rule-amount aliases.");
    }
    const fixedStepEntries = explicitGrade4PatternValue(options, ["sequenceStep", "step"]);
    if (fixedStepEntries && (lists[0].length !== 1 || lists[0][0] !== Number(fixedStepEntries[0].value))) {
      throw new Error("Conflicting Grade 5 numeric pattern fixed and selected rule amounts.");
    }
    if (minStep && lists[0].some((step) => step < Number(minStep[0].value))) {
      throw new Error("Grade 5 numeric pattern selected rule amounts must respect the minimum.");
    }
    if (maxStep && lists[0].some((step) => step > Number(maxStep[0].value))) {
      throw new Error("Grade 5 numeric pattern selected rule amounts must respect the maximum.");
    }
  }

  if (activity === "extend_pattern") {
    validateGrade5PatternAliasGroup(options, ["visibleLength", "shownTermCount"], "visible-term count", (value) =>
      grade5PatternInteger(value, "visible-term count", 4, 6)
    );
    validateGrade5PatternAliasGroup(
      options,
      ["continuationCount", "extensionCount", "answerCount"],
      "continuation count",
      (value) => grade5PatternInteger(value, "continuation count", 1, 3)
    );
  } else {
    validateGrade5PatternAliasGroup(options, ["sequenceLength", "termCount"], "sequence length", (value) =>
      grade5PatternInteger(value, "sequence length", 5, 7)
    );
  }

  if (activity === "missing_value_pattern") {
    validateGrade5PatternAliasGroup(options, ["missingTermCount", "missingCount"], "missing-value count", (value) =>
      grade5PatternInteger(value, "missing-value count", 1, 2)
    );
    const placementEntries = explicitGrade4PatternValue(options, ["missingTermPlacement", "missingPlacement"]);
    if (placementEntries) {
      const placements = placementEntries.map(({ value }) =>
        String(value).trim().toLowerCase() === "mixed" ? "random" : String(value).trim().toLowerCase()
      );
      if (placements.some((value) => !["beginning", "middle", "end", "random"].includes(value)) || new Set(placements).size !== 1) {
        throw new Error("Grade 5 numeric pattern missing placement must be beginning, middle, end, random, or mixed.");
      }
    }
    const indexEntries = explicitGrade4PatternListValue(options, ["missingIndexes", "missingPositions"]);
    if (indexEntries) {
      const sequenceLengthEntries = explicitGrade4PatternValue(options, ["sequenceLength", "termCount"]);
      const sequenceLength = sequenceLengthEntries ? Number(sequenceLengthEntries[0].value) : 7;
      const lists = indexEntries.map(({ value }) =>
        grade5PatternOptionEntries(value, "missing indexes")
          .map((entry) => grade5PatternInteger(entry, "missing index", 0, sequenceLength - 1))
      );
      if (lists.some((list) => JSON.stringify(list) !== JSON.stringify(lists[0]))) {
        throw new Error("Conflicting Grade 5 numeric pattern missing-index aliases.");
      }
      const indexes = lists[0];
      if (new Set(indexes).size !== indexes.length || indexes.length > 2 || sequenceLength - indexes.length < 3) {
        throw new Error("Grade 5 numeric pattern missing indexes must be unique and leave at least three visible terms.");
      }
      const missingCountEntries = explicitGrade4PatternValue(options, ["missingTermCount", "missingCount"]);
      if (missingCountEntries && Number(missingCountEntries[0].value) !== indexes.length) {
        throw new Error("Grade 5 numeric pattern missing-value count must match the explicit missing indexes.");
      }
      if (placementEntries) {
        throw new Error("Use either Grade 5 numeric pattern missing indexes or missing placement, not both.");
      }
    }
  } else if (explicitGrade4PatternValue(
    options,
    ["missingIndexes", "missingPositions", "missingTermCount", "missingCount", "missingTermPlacement", "missingPlacement"]
  )) {
    throw new Error("Missing-value controls are supported only by Grade 5 Find the Missing Values.");
  }

  let includesExample = false;
  const exampleEntries = explicitGrade4PatternValue(options, ["includeExample", "completedExample", "example"]);
  if (exampleEntries) {
    const normalizeBoolean = (value) => {
      if (typeof value === "boolean") return value;
      const normalized = String(value).trim().toLowerCase();
      if (["1", "true", "yes", "on"].includes(normalized)) return true;
      if (["0", "false", "no", "off"].includes(normalized)) return false;
      throw new Error("Grade 5 numeric pattern completed-example options must be boolean.");
    };
    const values = exampleEntries.map(({ value }) => normalizeBoolean(value));
    if (new Set(values).size !== 1) {
      throw new Error("Conflicting Grade 5 numeric pattern completed-example aliases.");
    }
    includesExample = values[0];
  }

  const questionCountEntries = explicitGrade4PatternValue(options, ["questionCount"]);
  const perPageEntries = explicitGrade4PatternValue(options, ["questionsPerPage"]);
  const questionCount = questionCountEntries
    ? Number(questionCountEntries[0].value)
    : activity === "identify_pattern_rule" ? 10 : 12;
  const questionsPerPage = perPageEntries
    ? Number(perPageEntries[0].value)
    : activity === "extend_pattern" && includesExample ? 13 : activity === "identify_pattern_rule" ? 10 : 12;
  if (questionCount + (includesExample ? 1 : 0) > questionsPerPage * 2) {
    throw new Error("Grade 5 numeric pattern question count, page density, and completed example must fit within two student pages.");
  }
  if (activity === "extend_pattern") {
    const visibleEntries = explicitGrade4PatternValue(options, ["visibleLength", "shownTermCount"]);
    const continuationEntries = explicitGrade4PatternValue(options, ["continuationCount", "extensionCount", "answerCount"]);
    const visibleLength = visibleEntries ? Number(visibleEntries[0].value) : 5;
    const continuationCount = continuationEntries ? Number(continuationEntries[0].value) : 2;
    if (visibleLength + continuationCount > 7) {
      throw new Error("Grade 5 numeric pattern extension rows support at most seven total terms.");
    }
    if (questionCount + (includesExample ? 1 : 0) > questionsPerPage) {
      throw new Error("Grade 5 numeric pattern extension rows must fit on one student page.");
    }
  }
}

function normalizeGrade4NumericPatterningOptions(item, options = {}) {
  if (!GRADE4_NUMERIC_PATTERN_IDS.has(item.id)) return options;
  const activity = item.activityTypes?.[0];
  const first = (keys, fallback) => {
    const entry = explicitGrade4PatternValue(options, keys);
    return entry ? entry[0].value : fallback;
  };
  const includeExample = parseBoolean(
    first(["includeExample", "completedExample", "example"], false),
    false
  );
  const normalized = {
    ...options,
    includeExample,
    questionCount: Number(first(["questionCount"], activity === "identify_pattern_rule" ? 10 : 12)),
    questionsPerPage: Number(first(
      ["questionsPerPage"],
      activity === "extend_pattern" && includeExample ? 13 : activity === "identify_pattern_rule" ? 10 : 12
    )),
    minStart: Number(first(["minStart", "minimumStart", "minimumValue"], 50)),
    maxStart: Number(first(["maxStart", "maximumStart", "maximumValue"], 400)),
    minStep: Number(first(["minStep", "minimumStep"], 5)),
    maxStep: Number(first(["maxStep", "maximumStep"], 25)),
    minValue: Number(first(["minValue", "minimumSequenceValue"], 0)),
    maxValue: Number(first(["maxValue", "maximumSequenceValue"], 1000)),
    operationMode: grade4PatternOperation(first(["operationMode", "operation", "ruleType"], "mixed")),
    balanceOperations: true
  };

  const selectedOperationsEntry = explicitGrade4PatternListValue(options, ["selectedOperations", "onlyOperations"]);
  const selectedOperations = selectedOperationsEntry ? selectedOperationsEntry[0].value : null;
  if (selectedOperations !== null) {
    const values = grade4PatternOptionEntries(selectedOperations, "selected operations").map(grade4PatternOperation);
    normalized.operationMode = values.length === 2 ? "mixed" : values[0];
  }
  const selectedStepsEntry = explicitGrade4PatternListValue(options, ["selectedSteps", "onlySteps"]);
  const selectedSteps = selectedStepsEntry ? selectedStepsEntry[0].value : null;
  if (selectedSteps !== null) {
    normalized.selectedSteps = grade4PatternOptionEntries(selectedSteps, "selected steps").map(Number);
    normalized.minStep = Math.min(...normalized.selectedSteps);
    normalized.maxStep = Math.max(...normalized.selectedSteps);
  }

  if (activity === "extend_pattern") {
    normalized.visibleLength = Number(first(["visibleLength", "shownTermCount"], 5));
    normalized.continuationCount = Number(first(["continuationCount", "extensionCount", "answerCount"], 2));
  } else {
    normalized.sequenceLength = Number(first(["sequenceLength", "termCount"], activity === "identify_pattern_rule" ? 6 : 7));
  }

  if (activity === "missing_value_pattern") {
    normalized.missingTermCount = Number(first(["missingTermCount", "missingCount"], 2));
    const placement = String(first(["missingTermPlacement", "missingPlacement"], "random")).trim().toLowerCase();
    normalized.missingTermPlacement = placement === "mixed" ? "random" : placement;
    const indexEntry = explicitGrade4PatternListValue(options, ["missingIndexes", "missingPositions"]);
    const indexes = indexEntry ? indexEntry[0].value : null;
    if (indexes !== null) {
      normalized.missingIndexes = grade4PatternOptionEntries(indexes, "missing indexes").map(Number);
      normalized.missingTermCount = normalized.missingIndexes.length;
    }
  }

  return normalized;
}

function normalizeGrade5NumericPatterningOptions(item, options = {}) {
  if (!GRADE5_NUMERIC_PATTERN_IDS.has(item.id)) return options;
  const activity = item.activityTypes?.[0];
  const first = (keys, fallback) => {
    const entry = explicitGrade4PatternValue(options, keys);
    return entry ? entry[0].value : fallback;
  };
  const includeExample = parseBoolean(
    first(["includeExample", "completedExample", "example"], false),
    false
  );
  const fixedStartEntry = explicitGrade4PatternValue(options, ["startingValue", "startNumber"]);
  const fixedStart = fixedStartEntry ? Number(fixedStartEntry[0].value) : null;
  const fixedStepEntry = explicitGrade4PatternValue(options, ["sequenceStep", "step"]);
  const fixedStep = fixedStepEntry ? Number(fixedStepEntry[0].value) : null;
  const normalized = {
    ...options,
    includeExample,
    structuredPatternTruth: true,
    questionCount: Number(first(["questionCount"], activity === "identify_pattern_rule" ? 10 : 12)),
    questionsPerPage: Number(first(
      ["questionsPerPage"],
      activity === "extend_pattern" && includeExample ? 13 : activity === "identify_pattern_rule" ? 10 : 12
    )),
    minStart: fixedStart ?? Number(first(["minStart", "minimumStart", "minimumValue"], 100)),
    maxStart: fixedStart ?? Number(first(["maxStart", "maximumStart", "maximumValue"], 700)),
    minStep: fixedStep ?? Number(first(["minStep", "minimumStep", "minimumRuleAmount"], 10)),
    maxStep: fixedStep ?? Number(first(["maxStep", "maximumStep", "maximumRuleAmount"], 50)),
    minValue: Number(first(["minValue", "minimumSequenceValue"], 0)),
    maxValue: Number(first(["maxValue", "maximumSequenceValue"], 1000)),
    operationMode: grade5PatternOperation(first(["operationMode", "operation", "ruleType"], "mixed")),
    balanceOperations: true
  };

  const selectedOperationsEntry = explicitGrade4PatternListValue(options, ["selectedOperations", "onlyOperations"]);
  if (selectedOperationsEntry) {
    const values = grade5PatternOptionEntries(
      selectedOperationsEntry[0].value,
      "selected operations"
    ).map(grade5PatternOperation);
    normalized.operationMode = values.length === 2 ? "mixed" : values[0];
  }

  const selectedStepsEntry = explicitGrade4PatternListValue(
    options,
    ["selectedSteps", "onlySteps", "selectedRuleAmounts", "ruleAmounts"]
  );
  if (selectedStepsEntry) {
    normalized.selectedSteps = grade5PatternOptionEntries(
      selectedStepsEntry[0].value,
      "selected rule amounts"
    ).map(Number);
    normalized.minStep = Math.min(...normalized.selectedSteps);
    normalized.maxStep = Math.max(...normalized.selectedSteps);
  }

  if (activity === "extend_pattern") {
    normalized.visibleLength = Number(first(["visibleLength", "shownTermCount"], 5));
    normalized.continuationCount = Number(first(
      ["continuationCount", "extensionCount", "answerCount"],
      2
    ));
  } else {
    normalized.sequenceLength = Number(first(
      ["sequenceLength", "termCount"],
      activity === "identify_pattern_rule" ? 6 : 7
    ));
  }

  if (activity === "missing_value_pattern") {
    normalized.missingTermCount = Number(first(["missingTermCount", "missingCount"], 2));
    const placement = String(
      first(["missingTermPlacement", "missingPlacement"], "random")
    ).trim().toLowerCase();
    normalized.missingTermPlacement = placement === "mixed" ? "random" : placement;
    const indexEntry = explicitGrade4PatternListValue(options, ["missingIndexes", "missingPositions"]);
    if (indexEntry) {
      normalized.missingIndexes = grade5PatternOptionEntries(
        indexEntry[0].value,
        "missing indexes"
      ).map(Number);
      normalized.missingTermCount = normalized.missingIndexes.length;
    }
  }

  return normalized;
}

function normalizeCatalogWorksheetOptions(item, options = {}) {
  validateGrade4NumericPatternRawOptions(item, options);
  validateGrade5NumericPatternRawOptions(item, options);
  validateGrade4StructuredFractionRawOptions(item, options);
  validateGrade5StructuredFractionRawOptions(item, options);
  validateGrade4StoryRawOptions(item, options);
  validateGrade4PlaceValueRawOptions(item, options);
  validateGrade5PlaceValueRawOptions(item, options);
  validateGrade4EquationMatchRawOptions(item, options);
  validateGrade5CompactRelationalRawOptions(item, options);
  validateGrade5TextDataInterpretationRawOptions(item, options);
  if (item.id === GRADE3_BASE_TEN_ID) {
    validateGrade3BaseTenRawOptions(options);
  }

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
    "minTotal",
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
    item.id === GRADE3_EQUAL_SHARING_ID
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

  const lowerFamilyNormalized = normalizeGrade4PlaceValueOptions(item, normalizeGrade4StoryProblemOptions(item, normalizeGrade5StructuredFractionOptions(item, normalizeGrade4StructuredFractionOptions(item, normalizeGrade5NumericPatterningOptions(item, normalizeGrade4NumericPatterningOptions(item, normalizeGrade3DataBatch7Options(
    item,
  normalizeGrade3FractionBatch6Options(
    item,
  normalizeGrade3ConcreteVisualOptions(
    item,
  normalizeGrade3StoryProblemOptions(
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
  )))))))))))))), options);
  const familyNormalized = normalizeGrade5CompactRelationalOptions(
    item,
    lowerFamilyNormalized,
    options
  );
  const grade5TextDataNormalized = normalizeGrade5TextDataInterpretationOptions(
    item,
    familyNormalized,
    options
  );
  const grade5PlaceValueNormalized = normalizeGrade5PlaceValueOptions(
    item,
    grade5TextDataNormalized,
    options
  );
  return applyFounderReviewDefaultOptions(
    item,
    normalizeGrade4EquationMatchOptions(item, grade5PlaceValueNormalized, options),
    options
  );
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
  // Existing raw number-line contracts (including wider counts/ranges/aliases)
  // remain internal. Public entry points normalize first and always supply the
  // canonical text setting; raw legacy calls retain their accepted behavior.
  if (family.preserveLegacyRuntime && ["questionTextSize", "minimumValue", "maximumValue", "numberLineArrows"].every(key => options[key] === undefined)) return legacyOptions;

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

function validateGrade4StoryWorksheet(id, problems = []) {
  if (!SHARED_UPPER_STORY_PROBLEM_IDS.has(id)) return;
  const signatures = new Set();
  problems.forEach((problem) => {
    if (!problem.prompt || !problem.contextId || !problem.templateId || !problem.storyType || !problem.answerState) {
      throw new Error("Grade 4 story problems require complete structured context, template, and answer truth.");
    }
    if (GRADE5_STORY_PROBLEM_IDS.has(id) && (
      problem.responseTarget !== "whole_number" ||
      problem.answerState.responseTarget !== "whole_number" ||
      problem.answerState.answer !== problem.answer
    )) {
      throw new Error("Grade 4 story problems require a complete whole-number response contract.");
    }
    if (!problem.duplicateSignature || signatures.has(problem.duplicateSignature)) {
      throw new Error("Grade 4 story problems require unique structured signatures.");
    }
    signatures.add(problem.duplicateSignature);
    if (isAdditionStoryId(id)) {
      if (
        problem.operation !== "add" || problem.operationFamily !== "addition" ||
        problem.unknownPosition !== "total" ||
        problem.firstAddend + problem.secondAddend !== problem.total ||
        problem.answer !== problem.total
      ) throw new Error("Grade 4 addition-story structured truth is inconsistent.");
    } else if (isMissingAddendStoryId(id)) {
      const expected = problem.missingPosition === "first" ? problem.firstAddend : problem.secondAddend;
      const known = problem.missingPosition === "first" ? problem.secondAddend : problem.firstAddend;
      if (
        !["first", "second"].includes(problem.missingPosition) ||
        problem.operation !== "add" || problem.operationFamily !== "addition" ||
        problem.firstAddend + problem.secondAddend !== problem.total ||
        problem.answer !== expected || problem.missingValue !== expected || problem.knownAddend !== known
      ) throw new Error("Grade 4 missing-addend-story structured truth is inconsistent.");
    } else if (
      problem.operation !== "subtract" || problem.operationFamily !== "subtraction" ||
      problem.unknownPosition !== "difference" || problem.minuend < problem.subtrahend ||
      problem.minuend - problem.subtrahend !== problem.difference || problem.answer !== problem.difference
    ) {
      throw new Error("Grade 4 subtraction-story structured truth is inconsistent.");
    }
  });
}

function validateGrade4PlaceValueWorksheet(id, problems = []) {
  if (!GRADE4_PLACE_VALUE_BATCH4_IDS.has(id)) return;
  const signatures = new Set();
  const targets = new Set();
  problems.forEach((problem) => {
    if (!problem.duplicateSignature || signatures.has(problem.duplicateSignature)) {
      throw new Error("Grade 4 place-value questions require unique structured signatures.");
    }
    signatures.add(problem.duplicateSignature);
    if (id === GRADE4_NUMBER_LINE_ID) {
      if (
        problem.taskMode !== "identify_marked_number" ||
        problem.tickCount !== 10 ||
        problem.targetValue !== problem.minValue + problem.targetIndex * problem.interval ||
        problem.maxValue - problem.minValue !== problem.tickCount * problem.interval ||
        problem.answer !== problem.targetValue ||
        problem.answerState?.targetValue !== problem.targetValue ||
        targets.has(problem.targetValue)
      ) throw new Error("Grade 4 number-line structured truth is inconsistent or duplicated.");
      targets.add(problem.targetValue);
    } else if (id === GRADE4_NUMBER_WORD_ID) {
      if (
        !Number.isInteger(problem.representedValue) ||
        !problem.numeral || !problem.numberWord ||
        !["numeral_to_word", "word_to_numeral"].includes(problem.numberWordMode) ||
        (problem.numberWordMode === "numeral_to_word" && (problem.prompt !== problem.numeral || problem.answer !== problem.numberWord)) ||
        (problem.numberWordMode === "word_to_numeral" && (problem.prompt !== problem.numberWord || problem.answer !== problem.representedValue)) ||
        problem.answerState?.representedValue !== problem.representedValue
      ) throw new Error("Grade 4 number-word structured truth is inconsistent.");
    } else {
      const expected = problem.leftValue < problem.rightValue ? "<" : problem.leftValue > problem.rightValue ? ">" : "=";
      if (
        problem.expectedSymbol !== expected || problem.comparisonResult !== expected || problem.answer !== expected ||
        problem.equalityState !== (expected === "=") ||
        problem.answerState?.expectedSymbol !== expected ||
        problem.responseTarget !== "comparison_symbol"
      ) throw new Error("Grade 4 comparison structured truth is inconsistent.");
    }
  });
}

function validateGrade5PlaceValueWorksheet(id, problems = []) {
  if (!GRADE5_PLACE_VALUE_BATCH4_IDS.has(id)) return;
  const signatures = new Set();
  const values = new Set();
  problems.forEach((problem) => {
    if (!problem.duplicateSignature || signatures.has(problem.duplicateSignature)) {
      throw new Error("Grade 5 place-value questions require unique structured signatures.");
    }
    signatures.add(problem.duplicateSignature);
    if (!Number.isInteger(problem.representedValue) || values.has(problem.representedValue)) {
      throw new Error("Grade 5 place-value represented values must be unique whole numbers.");
    }
    values.add(problem.representedValue);
    if (id === GRADE5_NUMBER_LINE_ID) {
      const labels = Array.from(
        { length: problem.tickCount + 1 },
        (_, index) => problem.minValue + index * problem.interval
      );
      if (
        problem.taskMode !== "identify_marked_number" ||
        problem.tickCount !== 10 ||
        problem.targetValue !== labels[problem.targetIndex] ||
        problem.maxValue !== labels[labels.length - 1] ||
        problem.answer !== problem.targetValue ||
        JSON.stringify(problem.displayedLabels) !== JSON.stringify(labels) ||
        JSON.stringify(problem.answerState?.displayedLabels) !== JSON.stringify(labels)
      ) throw new Error("Grade 5 number-line structured truth is inconsistent.");
    } else if (id === GRADE5_NUMBER_WORD_ID) {
      const expectedWord = grade5NumberToWords(problem.representedValue);
      const isReverse = problem.numberWordMode === "word_to_numeral";
      if (
        !["numeral_to_word", "word_to_numeral"].includes(problem.numberWordMode) ||
        problem.numberWord !== expectedWord ||
        problem.numeral !== problem.representedValue.toLocaleString("en-CA") ||
        problem.prompt !== (isReverse ? expectedWord : problem.numeral) ||
        problem.answer !== (isReverse ? problem.representedValue : expectedWord) ||
        problem.answerState?.expectedResponse !== problem.answer
      ) throw new Error("Grade 5 number-word structured truth is inconsistent.");
    } else {
      const truth = buildGrade5RepresentationTruth(problem.representedValue);
      const isExpanded = id === GRADE5_EXPANDED_FORM_ID;
      if (
        problem.numeral !== truth.numeral ||
        problem.answerState?.expandedForm !== truth.expandedForm ||
        JSON.stringify(problem.answerState?.expandedTerms) !== JSON.stringify(truth.expandedTerms) ||
        JSON.stringify(problem.answerState?.placeValueDigits) !== JSON.stringify(truth.placeValueDigits) ||
        problem.prompt !== (isExpanded ? truth.numeral : `${truth.expandedForm} = ___`) ||
        problem.answer !== (isExpanded ? truth.expandedForm : problem.representedValue)
      ) throw new Error("Grade 5 expanded/standard-form structured truth is inconsistent.");
    }
  });
}

function validateGrade5NumericPatternWorksheet(id, problems = []) {
  if (!GRADE5_NUMERIC_PATTERN_IDS.has(id)) return;
  const activity = id.includes("extend_pattern")
    ? "extend_pattern"
    : id.includes("identify_pattern_rule")
      ? "identify_pattern_rule"
      : "missing_value_pattern";
  const signatures = new Set();

  problems.forEach((problem) => {
    const state = problem.answerState;
    if (
      !state ||
      !Array.isArray(state.completeSequence) ||
      !Number.isInteger(problem.startingValue) ||
      !Number.isInteger(problem.ruleAmount) ||
      !["add", "subtract"].includes(problem.operation) ||
      !problem.duplicateSignature ||
      signatures.has(problem.duplicateSignature)
    ) {
      throw new Error("Grade 5 numeric pattern structured truth is incomplete or duplicated.");
    }
    signatures.add(problem.duplicateSignature);
    if (
      problem.startingValue !== state.startingValue ||
      problem.ruleAmount !== state.step ||
      problem.operation !== state.operation ||
      JSON.stringify(problem.fullSequence) !== JSON.stringify(state.completeSequence)
    ) {
      throw new Error("Grade 5 numeric pattern top-level and answer-state truth must agree.");
    }
    state.completeSequence.forEach((value, index) => {
      if (!Number.isInteger(value) || value < 0 || value > 1000) {
        throw new Error("Grade 5 numeric pattern sequence values must be whole numbers from 0 to 1000.");
      }
      if (index) {
        const expected = state.completeSequence[index - 1] +
          (state.operation === "add" ? state.step : -state.step);
        if (value !== expected) {
          throw new Error("Grade 5 numeric pattern sequence arithmetic is inconsistent.");
        }
      }
    });

    if (activity === "extend_pattern") {
      if (
        !Array.isArray(problem.visiblePrefix) ||
        !Array.isArray(problem.continuationValues) ||
        !Array.isArray(problem.responseTargets) ||
        !Array.isArray(problem.answerList) ||
        JSON.stringify(problem.visiblePrefix) !== JSON.stringify(state.visiblePrefix) ||
        JSON.stringify(problem.continuationValues) !== JSON.stringify(state.continuationValues) ||
        JSON.stringify(problem.answerList) !== JSON.stringify(state.answerList) ||
        problem.continuationValues.length !== state.continuationCount
      ) {
        throw new Error("Grade 5 Extend the Pattern truth is inconsistent.");
      }
    } else if (activity === "identify_pattern_rule") {
      if (
        !Array.isArray(problem.fullVisibleSequence) ||
        problem.studentFacingRule !== state.ruleText ||
        problem.answer !== state.ruleText ||
        problem.acceptedNormalizedRule?.operation !== state.operation ||
        problem.acceptedNormalizedRule?.amount !== state.step
      ) {
        throw new Error("Grade 5 Identify the Pattern Rule truth is inconsistent.");
      }
    } else if (
      !Array.isArray(problem.displayedSequence) ||
      !Array.isArray(problem.missingIndexes) ||
      !Array.isArray(problem.missingValues) ||
      !Array.isArray(problem.responseTargets) ||
      !Array.isArray(problem.answerList) ||
      JSON.stringify(problem.displayedSequence) !== JSON.stringify(state.displayedSequence) ||
      JSON.stringify(problem.missingIndexes) !== JSON.stringify(state.missingIndexes) ||
      JSON.stringify(problem.missingValues) !== JSON.stringify(state.missingValues) ||
      JSON.stringify(problem.answerList) !== JSON.stringify(state.answerList)
    ) {
      throw new Error("Grade 5 Find the Missing Values truth is inconsistent.");
    }
  });
}

function validateGrade4EquationMatchWorksheet(id, problems = []) {
  if (id !== GRADE4_EQUATION_MATCH_ID) return;
  const signatures = new Set();
  problems.forEach((problem) => {
    const evaluate = (operation, operands) => {
      if (!Array.isArray(operands) || operands.length !== 2 || operands.some((value) => !Number.isInteger(value))) {
        throw new Error("Grade 4 equation comparison requires two whole-number operands per expression.");
      }
      if (operation === "addition") return operands[0] + operands[1];
      if (operation === "subtraction") return operands[0] - operands[1];
      throw new Error("Grade 4 equation comparison contains an unsupported operation.");
    };
    const leftValue = evaluate(problem.leftOperation, problem.leftOperands);
    const rightValue = evaluate(problem.rightOperation, problem.rightOperands);
    const expected = leftValue === rightValue ? "=" : "≠";
    const canonicalSignature = `equation_match:${[problem.leftExpression, problem.rightExpression].sort().join(" :: ")}`;
    if (
      leftValue !== problem.leftValue ||
      rightValue !== problem.rightValue ||
      expected !== problem.expectedSymbol ||
      expected !== problem.answer ||
      problem.equalityState !== (expected === "=") ||
      problem.responseTarget !== "equation_relation" ||
      problem.answerState?.leftValue !== leftValue ||
      problem.answerState?.rightValue !== rightValue ||
      problem.answerState?.expectedRelation !== expected ||
      problem.answerState?.equalityState !== (expected === "=") ||
      problem.duplicateSignature !== canonicalSignature ||
      problem.relatedDuplicateSignature !== canonicalSignature ||
      signatures.has(canonicalSignature)
    ) {
      throw new Error("Grade 4 equation-comparison structured truth is inconsistent or duplicated.");
    }
    signatures.add(canonicalSignature);
  });
}

function validateGrade5CompactRelationalWorksheet(id, problems = []) {
  if (!GRADE5_COMPACT_RELATIONAL_IDS.has(id)) return;
  const signatures = new Set();
  problems.forEach((problem) => {
    if (id === GRADE5_EQUATION_MATCH_ID) {
      const evaluate = (operation, operands) => {
        if (!Array.isArray(operands) || operands.length !== 2 || operands.some((value) => !Number.isInteger(value))) {
          throw new Error("Grade 5 equation comparison requires two whole-number operands per expression.");
        }
        if (operation === "addition") return operands[0] + operands[1];
        if (operation === "subtraction") return operands[0] - operands[1];
        throw new Error("Grade 5 equation comparison contains an unsupported operation.");
      };
      const leftValue = evaluate(problem.leftOperation, problem.leftOperands);
      const rightValue = evaluate(problem.rightOperation, problem.rightOperands);
      const expected = leftValue === rightValue ? "=" : "≠";
      const canonical = `equation_match:${[problem.leftExpression, problem.rightExpression].sort().join(" :: ")}`;
      if (
        problem.leftValue !== leftValue ||
        problem.rightValue !== rightValue ||
        problem.expectedSymbol !== expected ||
        problem.answer !== expected ||
        problem.equalityState !== (expected === "=") ||
        problem.responseTarget !== "equation_relation" ||
        problem.answerState?.leftValue !== leftValue ||
        problem.answerState?.rightValue !== rightValue ||
        problem.answerState?.expectedRelation !== expected ||
        problem.answerState?.equalityState !== (expected === "=") ||
        problem.duplicateSignature !== canonical ||
        problem.relatedDuplicateSignature !== canonical ||
        signatures.has(canonical)
      ) {
        throw new Error("Grade 5 equation-comparison structured truth is inconsistent or duplicated.");
      }
      signatures.add(canonical);
      return;
    }

    const expected = problem.leftValue < problem.rightValue
      ? "<"
      : problem.leftValue > problem.rightValue ? ">" : "=";
    const low = Math.min(problem.leftValue, problem.rightValue);
    const high = Math.max(problem.leftValue, problem.rightValue);
    const canonical = expected === "="
      ? `grade5_compare:${problem.leftValue}=${problem.rightValue}`
      : `grade5_compare:${low}:${high}`;
    if (
      !Number.isInteger(problem.leftValue) ||
      !Number.isInteger(problem.rightValue) ||
      problem.expectedSymbol !== expected ||
      problem.comparisonResult !== expected ||
      problem.answer !== expected ||
      problem.equalityState !== (expected === "=") ||
      problem.responseTarget !== "comparison_symbol" ||
      problem.answerState?.leftValue !== problem.leftValue ||
      problem.answerState?.rightValue !== problem.rightValue ||
      problem.answerState?.expectedSymbol !== expected ||
      problem.answerState?.equalityState !== (expected === "=") ||
      problem.duplicateSignature !== canonical ||
      signatures.has(canonical)
    ) {
      throw new Error("Grade 5 number-comparison structured truth is inconsistent or duplicated.");
    }
    signatures.add(canonical);
  });
}

function validateGrade5TextDataInterpretationWorksheet(id, problems = []) {
  if (id !== GRADE5_TEXT_DATA_INTERPRETATION_ID) return;
  const prompts = new Set();
  const signatures = new Set();
  problems.forEach((problem) => {
    const graphData = problem.graphData;
    const categories = graphData?.categories;
    const values = Array.isArray(categories) ? categories.map((category) => category.value) : [];
    const answerState = problem.answerState;
    const expectedSignature = [
      "grade5_text_data",
      "grade5_text_data:sport_choices",
      problem.graphQuestionType,
      answerState?.categoryIds?.join("+") || "",
      answerState?.proposition || "",
      problem.responseTarget
    ].join(":");
    const commonTruthIsValid = (
      graphData?.datasetId !== "grade5_text_data:sport_choices" ||
      graphData?.title !== "Student Sport Choices" ||
      graphData?.graphType !== "text_data" ||
      graphData?.modelType !== "text_described_quantities" ||
      !Array.isArray(categories) ||
      categories.map((category) => category.label).join("|") !== "Soccer|Basketball|Baseball" ||
      values.join("|") !== "12|9|6" ||
      graphData.totalValue !== 27 ||
      answerState?.kind !== "grade5_text_data_answer" ||
      answerState?.datasetId !== graphData.datasetId ||
      answerState?.datasetTitle !== graphData.title ||
      answerState?.questionType !== problem.graphQuestionType ||
      answerState?.expectedAnswer !== problem.answer ||
      !Array.isArray(problem.acceptedAnswerVariants) ||
      !problem.acceptedAnswerVariants.some((variant) => variant === problem.answer) ||
      JSON.stringify(answerState?.acceptedAnswerVariants) !==
        JSON.stringify(problem.acceptedAnswerVariants) ||
      problem.duplicateSignature !== expectedSignature ||
      prompts.has(problem.prompt) ||
      signatures.has(problem.duplicateSignature)
    );
    if (commonTruthIsValid) {
      throw new Error("Grade 5 text-data interpretation structured truth is inconsistent.");
    }

    if (problem.responseTarget === "category_name") {
      if (
        answerState.selectedCategoryLabel !== problem.answer ||
        answerState.selectedCategoryId !== answerState.categoryIds[0] ||
        !Number.isInteger(answerState.selectedValue)
      ) {
        throw new Error("Grade 5 text-data category truth is inconsistent.");
      }
    } else if (problem.graphQuestionType.startsWith("difference_")) {
      if (
        answerState.minuendCategory?.value - answerState.subtrahendCategory?.value !==
          problem.answer ||
        answerState.difference !== problem.answer
      ) {
        throw new Error("Grade 5 text-data difference truth is inconsistent.");
      }
    } else if (
      problem.graphQuestionType === "total_responses" ||
      problem.graphQuestionType.startsWith("combined_")
    ) {
      if (
        !Array.isArray(answerState.componentValues) ||
        answerState.componentValues.reduce((sum, value) => sum + value, 0) !== problem.answer ||
        answerState.total !== problem.answer
      ) {
        throw new Error("Grade 5 text-data combined-total truth is inconsistent.");
      }
    } else if (problem.graphQuestionType.startsWith("order_")) {
      if (
        problem.responseTarget !== "ordered_categories" ||
        !Array.isArray(answerState.orderedCategoryIds) ||
        !Array.isArray(answerState.orderedCategoryLabels) ||
        answerState.orderedCategoryLabels.join(", ") !== problem.answer
      ) {
        throw new Error("Grade 5 text-data ordering truth is inconsistent.");
      }
    } else if (problem.graphQuestionType.startsWith("true_false_")) {
      if (
        problem.responseTarget !== "true_false" ||
        typeof answerState.propositionTruth !== "boolean" ||
        answerState.expectedBoolean !== answerState.propositionTruth ||
        answerState.displayAnswer !== problem.answer ||
        (answerState.expectedBoolean ? "True" : "False") !== problem.answer
      ) {
        throw new Error("Grade 5 text-data true/false truth is inconsistent.");
      }
    } else {
      throw new Error(`Unsupported Grade 5 text-data question '${problem.graphQuestionType}'.`);
    }

    prompts.add(problem.prompt);
    signatures.add(problem.duplicateSignature);
  });
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
  const activityType = GRADE3_DATA_BATCH7_IDS.has(item.id)
    ? "grade3_data_displays"
    : item.id === GRADE5_EQUIVALENT_FRACTION_COMPLETION_ID
      ? "grade5_equivalent_fraction_completion"
    : [GRADE3_COMPARE_FRACTIONS_ID, GRADE4_COMPARE_FRACTIONS_ID].includes(item.id)
    ? "grade3_compare_fractions"
    : [GRADE3_FRACTION_NUMBER_LINE_ID, GRADE4_FRACTION_NUMBER_LINE_ID, GRADE5_FRACTION_NUMBER_LINE_ID].includes(item.id)
      ? "grade3_fraction_number_line"
    : [GRADE3_SHADE_FRACTION_ID, GRADE4_SHADE_FRACTION_ID, GRADE5_SHADE_FRACTION_ID].includes(item.id)
    ? "grade3_shade_fraction_models"
    : item.id === GRADE2_SHADE_EQUAL_PARTS_ID
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
    validateGrade3ShadeFractionWorksheet(item.id, worksheet.problems);
    validateGrade3CompareFractionsWorksheet(item.id, worksheet.problems);
    validateGrade3FractionNumberLineWorksheet(item.id, worksheet.problems);
    validateGrade3DataDisplayWorksheet(item.id, worksheet.problems);
    validateGrade5EquivalentFractionCompletionWorksheet(item.id, worksheet.problems);
    validateGrade3BaseTenWorksheet(item.id, worksheet.problems);
    validateGrade4StoryWorksheet(item.id, worksheet.problems);
    validateGrade4PlaceValueWorksheet(item.id, worksheet.problems);
    validateGrade5PlaceValueWorksheet(item.id, worksheet.problems);
    validateGrade4EquationMatchWorksheet(item.id, worksheet.problems);
    validateGrade5NumericPatternWorksheet(item.id, worksheet.problems);
    validateGrade5CompactRelationalWorksheet(item.id, worksheet.problems);
    validateGrade5TextDataInterpretationWorksheet(item.id, worksheet.problems);
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
 const approvedCopy = getWorksheetPublicCopy(item.id);

 if (approvedCopy) return approvedCopy.instruction;

 if (item.id === GRADE3_EQUAL_SHARING_ID) {
  return "Share the dots equally. Complete the division equation.";
 }

 if ([GRADE3_SHADE_FRACTION_ID, GRADE4_SHADE_FRACTION_ID, GRADE5_SHADE_FRACTION_ID].includes(item.id)) {
  return "Shade each model to show the fraction.";
 }

 if (item.id === GRADE3_NUMBER_LINE_IDENTIFY_ID) {
  return "Write the number shown by the point on each number line.";
 }

 if (item.id === GRADE4_NUMBER_LINE_ID) {
  return "Write the number shown by the point on each number line.";
 }

 if (item.id === GRADE4_NUMBER_WORD_ID) {
  return "Write each number in words.";
 }

 if (item.id === GRADE4_COMPARE_NUMBERS_ID) {
  return "Write >, <, or = to compare each pair of numbers.";
 }

 if (item.id === GRADE4_EQUATION_MATCH_ID) {
  return "Write = or ≠ to compare each pair of equations.";
 }

 if (item.id === GRADE5_COMPARE_NUMBERS_ID) {
  return "Write >, <, or = to compare each pair of numbers.";
 }

 if (item.id === GRADE5_EQUATION_MATCH_ID) {
  return "Write = or ≠ to compare each pair of equations.";
 }

 if (item.id === GRADE5_EXPANDED_FORM_ID) {
  return "Write each numeral in expanded form.";
 }

 if (item.id === GRADE5_STANDARD_FORM_ID) {
  return "Write each number in standard form.";
 }

 if (item.id === GRADE5_NUMBER_LINE_ID) {
  return "Write the number shown by the point on each number line.";
 }

 if (item.id === GRADE5_NUMBER_WORD_ID) {
  return "Write each number in words.";
 }

 if ([GRADE3_COMPARE_FRACTIONS_ID, GRADE4_COMPARE_FRACTIONS_ID].includes(item.id)) {
  return "Write >, <, or = to compare each pair of fractions.";
 }

 if ([GRADE3_FRACTION_NUMBER_LINE_ID, GRADE4_FRACTION_NUMBER_LINE_ID, GRADE5_FRACTION_NUMBER_LINE_ID].includes(item.id)) {
  return "Write the fraction shown by the point on each number line.";
 }

 if (item.id === GRADE5_EQUIVALENT_FRACTION_COMPLETION_ID) {
  return "Write the missing numerator or denominator to complete each equivalent fraction.";
 }

 if (item.id === GRADE3_ADDITION_WORD_PROBLEMS_ID) {
  return "Solve each addition word problem. Show your thinking in the box.";
 }

 if (item.id === GRADE3_MISSING_ADDEND_WORD_PROBLEMS_ID) {
  return "Solve each missing-addend word problem. Show your thinking in the box.";
 }

 if (item.id === GRADE3_SUBTRACTION_WORD_PROBLEMS_ID) {
  return "Solve each subtraction word problem. Show your thinking in the box.";
 }

 if (item.id === GRADE4_ADDITION_STORY_ID) {
  return "Solve each addition story problem. Show your work.";
 }

 if (item.id === GRADE4_MISSING_ADDEND_STORY_ID) {
  return "Find the missing amount in each story problem. Show your work.";
 }

 if (item.id === GRADE4_SUBTRACTION_STORY_ID) {
  return "Solve each subtraction story problem. Show your work.";
 }

 if (item.id === GRADE5_ADDITION_STORY_ID) {
  return "Solve each addition story problem. Show your work.";
 }

 if (item.id === GRADE5_MISSING_ADDEND_STORY_ID) {
  return "Find the missing amount in each story problem. Show your work.";
 }

 if (item.id === GRADE5_SUBTRACTION_STORY_ID) {
  return "Solve each subtraction story problem. Show your work.";
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

 if (item.id === "g3_complete_a_graph") {
  return "Use the data table to complete the pictograph.";
 }

 if (item.id === "g3_graph_questions") {
  return "Use the graph to answer each question.";
 }

 if (item.id === "g3_interpret_data") {
  return "Read each statement. Write Yes if the graph supports it or No if it does not.";
 }

 if (item.id === "g3_match_data_to_graph") {
  return "Use the table. Circle A or B to show which pictograph matches the data.";
 }

 if (item.id === "g3_read_a_graph") {
  return "Use the graph to answer each question.";
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

 if (item.id === GRADE3_BASE_TEN_ID) {
  return "Count the hundreds, tens, and ones. Write the number.";
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
  if (GRADE5_NUMERIC_PATTERN_IDS.has(item.id)) {
    if (activityType === "extend_pattern") {
      return "Continue each pattern by writing the next numbers.";
    }
    if (activityType === "missing_value_pattern") {
      return "Write the missing numbers in each pattern.";
    }
    if (activityType === "identify_pattern_rule") {
      return "Write the rule for each pattern.";
    }
  }

  if (GRADE4_NUMERIC_PATTERN_IDS.has(item.id)) {
    if (activityType === "extend_pattern") {
      return "Find the rule. Then write the next numbers in each pattern.";
    }
    if (activityType === "missing_value_pattern") {
      return "Find the rule. Then write the missing numbers in each pattern.";
    }
    if (activityType === "identify_pattern_rule") {
      return "Write the rule for each number pattern.";
    }
  }

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
      return "Write the rule for each pattern.";
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

  const title = getWorksheetPublicCopy(item.id)?.title ||
  GRADE2_NUMERIC_PATTERN_TITLES[item.id] ||
  GRADE3_NUMERIC_PATTERN_TITLES[item.id] ||
  GRADE4_NUMERIC_PATTERN_TITLES[item.id] ||
  GRADE5_NUMERIC_PATTERN_TITLES[item.id] ||
  GRADE3_PLACE_VALUE_TITLES[item.id] ||
  GRADE3_ADDITION_SUBTRACTION_BATCH3_TITLES[item.id] ||
  GRADE3_STORY_PROBLEM_TITLES[item.id] ||
  GRADE4_STORY_PROBLEM_TITLES[item.id] ||
  GRADE5_STORY_PROBLEM_TITLES[item.id] ||
  GRADE4_BATCH5_TITLES[item.id] ||
  (item.id === GRADE5_TEXT_DATA_INTERPRETATION_ID ? "Interpret the Data" : "") ||
  GRADE5_COMPACT_RELATIONAL_TITLES[item.id] ||
  (item.id === GRADE5_NUMBER_WORD_ID
    ? isReverseNumberWordMode ? "Write the Numeral" : "Write Numbers in Words"
    : GRADE5_PLACE_VALUE_BATCH4_TITLES[item.id]) ||
  (item.id === GRADE4_NUMBER_WORD_ID
    ? isReverseNumberWordMode ? "Write the Numeral" : "Write Numbers in Words"
    : GRADE4_PLACE_VALUE_BATCH4_TITLES[item.id]) ||
  GRADE3_CONCRETE_VISUAL_TITLES[item.id] ||
  GRADE3_FRACTION_BATCH6_TITLES[item.id] ||
  GRADE4_STRUCTURED_FRACTION_TITLES[item.id] ||
  GRADE5_STRUCTURED_FRACTION_TITLES[item.id] ||
  GRADE3_DATA_BATCH7_TITLES[item.id] ||
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

if (item.id === GRADE3_BASE_TEN_ID) {
  layout.template = {
    ...(layout.template || {}),
    columns: 1,
    maxProblemsPerPage: finiteNumber(normalizedOptions.questionsPerPage) || 4
  };
  layout.grid = {
    ...(layout.grid || {}),
    columns: 1
  };
  layout.display = {
    ...(layout.display || {}),
    hideItemPrompts: true,
    hideSubtitle: true,
    visualColumns: 1,
    baseTenAlignedResponse: true,
    baseTenMeasuredCellCenter: true,
    baseTenHundredsGap: 9,
    baseTenTensOnesBoxes: false,
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

if (item.id === GRADE5_TEXT_DATA_INTERPRETATION_ID) {
  const textData = layout.problems?.[0]?.graphData || null;
  layout.instruction = "Use the data to answer each question.";
  layout.template = {
    ...(layout.template || {}),
    columns: 1,
    maxProblemsPerPage: finiteNumber(normalizedOptions.questionsPerPage) || 6
  };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    suppressExampleLabel: false,
    hideItemSeparators: true,
    writingLine: true,
    answerLineBelowPrompt: true,
    sharedTextDataResponseLines: true,
    dataResponseLineInset: 44,
    dataResponsePromptGap: 20,
    dataResponseLineWidths: {
      number: 72,
      category: 138,
      ordering: 286,
      true_false: 84
    },
    equalHeightItems: true,
    denseGridRows: 6,
    sequentialColumnFill: true,
    sharedTextDataPanel: true,
    sharedTextDataSummary: textData
      ? {
          datasetId: textData.datasetId,
          title: textData.title,
          categories: textData.categories.map(({ id, label, value }) => ({
            id,
            label,
            value
          }))
        }
      : null,
    textDataExampleStrip: true
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

if (SHARED_UPPER_STORY_PROBLEM_IDS.has(item.id)) {
  layout.problems = layout.problems.map((problem, index) => {
    const truth = worksheet.problems?.[index] || {};
    return {
      ...problem,
      contextId: truth.contextId || null,
      templateId: truth.templateId || null,
      storyType: truth.storyType || null,
      unknownPosition: truth.unknownPosition || null,
      operationFamily: truth.operationFamily || null,
      knownAddend: finiteNumber(truth.knownAddend)
    };
  });
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
    denseGridRows: 3,
    equalHeightItems: true,
    hideItemSeparators: true
  };
}

if (GRADE4_PLACE_VALUE_BATCH4_IDS.has(item.id)) {
  layout.problems = layout.problems.map((problem, index) => {
    const truth = worksheet.problems?.[index] || {};
    return {
      ...problem,
      numeral: truth.numeral || null,
      taskDirection: truth.taskDirection || null
    };
  });
}

if (GRADE5_PLACE_VALUE_BATCH4_IDS.has(item.id)) {
  layout.problems = layout.problems.map((problem, index) => {
    const truth = worksheet.problems?.[index] || {};
    return {
      ...problem,
      representedValue: finiteNumber(truth.representedValue),
      numeral: truth.numeral || null,
      taskDirection: truth.taskDirection || null,
      answerState: truth.answerState || null,
      duplicateSignature: truth.duplicateSignature || null
    };
  });
}

if ([GRADE4_EQUATION_MATCH_ID, GRADE5_EQUATION_MATCH_ID].includes(item.id)) {
  const isGrade5Equation = item.id === GRADE5_EQUATION_MATCH_ID;
  layout.problems = layout.problems.map((problem, index) => {
    const truth = worksheet.problems?.[index] || {};
    return {
      ...problem,
      leftExpression: truth.leftExpression || null,
      rightExpression: truth.rightExpression || null,
      leftOperation: truth.leftOperation || null,
      rightOperation: truth.rightOperation || null,
      leftOperands: Array.isArray(truth.leftOperands) ? [...truth.leftOperands] : null,
      rightOperands: Array.isArray(truth.rightOperands) ? [...truth.rightOperands] : null,
      leftValue: finiteNumber(truth.leftValue),
      rightValue: finiteNumber(truth.rightValue),
      expectedSymbol: truth.expectedSymbol || null,
      equalityState: Boolean(truth.equalityState),
      responseTarget: truth.responseTarget || null,
      answerState: truth.answerState || null,
      duplicateSignature: truth.duplicateSignature || null,
      relatedDuplicateSignature: truth.relatedDuplicateSignature || null
    };
  });
  layout.template = {
    ...(layout.template || {}),
    columns: isGrade5Equation ? 2 : 3,
    maxProblemsPerPage: finiteNumber(normalizedOptions.questionsPerPage) || 30
  };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    hideItemSeparators: true,
    standardShortAnswerTarget: true,
    answerTargetVariant: "comparisonSymbol",
    standardAnswerLineWidth: 18,
    equalHeightItems: true,
    denseGridRows: isGrade5Equation ? 15 : 10,
    sequentialColumnFill: true,
    equationComparisonLayout: true,
    equationComparisonExampleStrip: true,
    equationComparisonFixedZones: true,
    equationComparisonFontSize: 12,
    equationComparisonMinimumFontSize: 12,
    equationComparisonNumberGutter: 19,
    equationComparisonNumberFontSize: 11,
    equationComparisonExpressionWidth: isGrade5Equation ? 92 : 56.5,
    equationComparisonTargetWidth: 18,
    equationComparisonGap: 1,
    equationComparisonCenteredTarget: true
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
  const isGrade4Comparison = item.id === GRADE4_COMPARE_NUMBERS_ID;
  const isGrade5Comparison = item.id === GRADE5_COMPARE_NUMBERS_ID;
  const isUpperGradeComparison = isGrade4Comparison || isGrade5Comparison;
  const isStructuredComparison = isGrade2Comparison || isUpperGradeComparison;
  layout.template = {
    ...(layout.template || {}),
    columns: isUpperGradeComparison ? 3 : isStructuredComparison ? 2 : 4,
    maxProblemsPerPage: finiteNumber(normalizedOptions.questionsPerPage) || (isUpperGradeComparison ? 30 : isStructuredComparison ? 12 : 60)
  };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: isUpperGradeComparison || layout.display?.hideSubtitle,
    answerTargetVariant: "comparisonSymbol",
    standardShortAnswerTarget: true,
    standardAnswerLineWidth: isUpperGradeComparison ? 24 : isStructuredComparison ? 52 : 34,
    standardAnswerBlankText: "___",
    hideItemSeparators: true,
    equalHeightItems: true,
    denseGridRows: isUpperGradeComparison ? 10 : isStructuredComparison ? 6 : 15,
    sequentialColumnFill: isStructuredComparison,
    grade2ComparisonLayout: isGrade2Comparison,
    structuredComparisonLayout: isStructuredComparison,
    equationComparisonExampleStrip: isGrade5Comparison,
    comparisonTargetWidth: isUpperGradeComparison ? 24 : isStructuredComparison ? 52 : 34,
    comparisonFontSize: isUpperGradeComparison ? 10.5 : isStructuredComparison ? 16 : 12,
    comparisonNumberGutter: isUpperGradeComparison ? 20 : 30,
    comparisonOperandWidth: isGrade5Comparison ? 46 : isGrade4Comparison ? 42 : 58,
    comparisonGap: isUpperGradeComparison ? 4 : 12,
    comparisonThousandsSeparators: isUpperGradeComparison
  };
}

if (GRADE2_COMPACT_QUICK_CHECK_IDS.has(item.id)) {
  const cutApart = CUT_APART_QUICK_CHECKS.get(item.id);
  layout.instruction = item.studentInstructions || layout.instruction;
  layout.template = {
    ...(layout.template || {}),
    columns: 2,
    maxProblemsPerPage: cutApart?.items || 6
  };
  layout.display = {
    ...(layout.display || {}),
    compactAssessmentLayout: true,
    resourceKindLabel: "Quick Check",
    assessmentColumns: 2,
    assessmentRowsPerColumn: cutApart?.copies === 4 ? cutApart.items : 2,
    cutApartQuickCheckCount: cutApart?.copies || 1,
    inlineTargetsOnly: true,
    showMetadataSubtitle: false,
    showTimeEstimate: false,
    showTeacherPanel: false,
    showRatingStrip: false,
    denseGridRows: 3,
    sequentialColumnFill: true
  };
}

if (CUT_APART_QUICK_CHECKS.has(item.id) && !GRADE2_COMPACT_QUICK_CHECK_IDS.has(item.id)) {
  const cutApart = CUT_APART_QUICK_CHECKS.get(item.id);
  layout.instruction = item.studentInstructions || layout.instruction;
  layout.template = { ...(layout.template || {}), columns: cutApart.copies === 4 ? 1 : cutApart.copies, maxProblemsPerPage: cutApart.items };
  layout.display = { ...(layout.display || {}), compactAssessmentLayout: true, resourceKindLabel: "Quick Check", cutApartQuickCheckCount: cutApart.copies, assessmentItemsPerTicket: cutApart.items };
}

if (FOUR_UP_EXIT_TICKET_IDS.has(item.id)) {
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
    cutApartTicketCount: 4,
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
  const isGrade4NumericPattern = GRADE4_NUMERIC_PATTERN_IDS.has(item.id);
  const isGrade5NumericPattern = GRADE5_NUMERIC_PATTERN_IDS.has(item.id);
  const hasSideWorkspace = GRADE4_PATTERN_WORKSPACE_IDS.has(item.id) || isGrade5NumericPattern;
  const maxProblemsPerPage = resolvePatterningPageCapacity(item, activityType, normalizedOptions);
  const columns = isGrade2NumericPattern
    ? 2
    : isGrade4NumericPattern || isGrade5NumericPattern || activityType === "identify_pattern_rule" ? 1 : 2;

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
    patterningCommaGap: isGrade2NumericPattern ? 8 : isGrade4NumericPattern || isGrade5NumericPattern ? 7 : 5,
    patterningExtendTargetWidth: isGrade2NumericPattern ? 68 : isGrade4NumericPattern || isGrade5NumericPattern ? 62 : 56,
    patterningMissingTargetWidth: isGrade2NumericPattern ? 64 : isGrade4NumericPattern || isGrade5NumericPattern ? 62 : 58,
    patterningRuleTargetWidth: isGrade2NumericPattern ? 64 : 120,
    patterningResponseFontSize: isGrade2NumericPattern ? 15 : patterningSequenceFontSize(item, activityType, normalizedOptions),
    patterningRuleResponseMode: PATTERN_RULE_RESPONSE_MODES[item.id] ||
      (isGrade2NumericPattern && activityType === "identify_pattern_rule" ? "add_step" : "written_rule"),
    patterningRuleFullWidth: [
      "grade2_patterning_and_algebra_identify_pattern_rule",
      "grade3_patterning_and_algebra_identify_pattern_rule"
    ].includes(item.id),
    denseGridRows: isGrade2NumericPattern ? 6 : Math.ceil(maxProblemsPerPage / columns),
    sequentialColumnFill: true,
    equalHeightItems: true,
    hideItemSeparators: false,
    patterningPublicReady: true,
    ...(hasSideWorkspace
      ? {
          sideWorkspace: {
            enabled: true,
            studentOnly: true,
            heading: "Work It Out",
            widthRatio: 0.35,
            minimumWidthRatio: 0.3,
            dividerGap: 4,
            workspacePadding: 12,
            minimumTaskWidth: activityType === "extend_pattern" && continuationCount >= 3
              ? 346
              : 320,
            taskLabelWidth: 24,
            ruleLineRightPadding: 38,
            dividerWidth: 0.8,
            dividerColor: "#c4cad1"
          }
        }
      : {})
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

  layout.instruction = item.id === GRADE3_EQUAL_SHARING_ID
    ? "Share the dots equally. Complete the division equation."
    : showQuestionSentence
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
    hideItemSeparators: false,
    hideSubtitle: item.id === GRADE3_EQUAL_SHARING_ID,
    suppressExampleLabel: item.id === GRADE3_EQUAL_SHARING_ID
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
  if (item.id === GRADE5_STANDARD_FORM_ID) {
    layout.template.columns = 2;
    layout.template.maxProblemsPerPage = 30;
    layout.display.denseGridRows = 15;
    layout.display.standardAnswerLineWidth = 70;
    layout.display.hideSubtitle = true;
    layout.display.atomicWholeNumberAnswers = true;
  }
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
    if (item.id === GRADE5_EXPANDED_FORM_ID) {
      layout.template.columns = 2;
      layout.template.maxProblemsPerPage = 30;
      layout.display.denseGridRows = 15;
      layout.display.hideSubtitle = true;
      layout.display.atomicNumeralFormatting = true;
    }
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
  const settings = normalizedOptions._customization?.normalizedOptions;
  const { buildAdditionNumberLineLayout, additionNumberLineScaleLabels } = require("../config/layout/additionNumberLineLayout");
  const profile = settings ? buildAdditionNumberLineLayout(settings.questionTextSize) : null;
  if (settings) {
    profile.scaleLabels = additionNumberLineScaleLabels(settings.minimumValue, settings.maximumValue, profile);
    if (settings.minimumValue !== 0 || settings.maximumValue !== 20) {
      layout.header.title = `Addition on a Number Line — ${settings.minimumValue} to ${settings.maximumValue}`;
    }
    if (settings.numberLineArrows === "student_drawn") {
      layout.instruction = "Start at the first number. Draw a forward jump to add the second number. Write the answer.";
    }
  }
  layout.template = {
    ...(layout.template || {}),
    columns: 1,
    maxProblemsPerPage: profile?.capacity || 6
  };
  layout.display = {
    ...(layout.display || {}),
    ...(profile ? { additionNumberLineLayout: profile, inlineEquationFontSize: profile.questionTextSize, numberLineArrows: settings.numberLineArrows } : {}),
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

if ([GRADE2_NUMBER_LINE_IDENTIFY_ID, GRADE3_NUMBER_LINE_IDENTIFY_ID, GRADE4_NUMBER_LINE_ID, GRADE5_NUMBER_LINE_ID].includes(item.id)) {
  layout.template = {
    ...(layout.template || {}),
    columns: 1,
    maxProblemsPerPage: finiteNumber(normalizedOptions.questionsPerPage) || 6
  };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    suppressExampleLabel: true,
    visualColumns: 1,
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

if ([GRADE3_COMPARE_FRACTIONS_ID, GRADE4_COMPARE_FRACTIONS_ID].includes(item.id)) {
  layout.template = {
    ...(layout.template || {}),
    columns: 2,
    maxProblemsPerPage: finiteNumber(normalizedOptions.questionsPerPage) || 12
  };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    suppressExampleLabel: false,
    answerTargetVariant: "comparisonSymbol",
    standardShortAnswerTarget: true,
    standardAnswerLineWidth: 44,
    standardAnswerBlankText: "___",
    hideItemSeparators: true,
    equalHeightItems: true,
    denseGridRows: 6,
    sequentialColumnFill: true
  };
}

if ([GRADE3_FRACTION_NUMBER_LINE_ID, GRADE4_FRACTION_NUMBER_LINE_ID, GRADE5_FRACTION_NUMBER_LINE_ID].includes(item.id)) {
  layout.template = {
    ...(layout.template || {}),
    columns: 1,
    maxProblemsPerPage: finiteNumber(normalizedOptions.questionsPerPage) || 6
  };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    suppressExampleLabel: true,
    visualColumns: 1,
    numberLineFullContentWidth: true,
    numberLineRowGeometry: true,
    numberLineAnswerUnderTarget: true,
    numberLineEndpointSafeInset: true,
    hideItemPrompts: true,
    equalHeightItems: true,
    denseGridRows: 6,
    hideItemSeparators: true,
    sequentialColumnFill: true,
    standardAnswerLineWidth: 64,
    fractionNumberLine: true
  };
}

if (item.id === GRADE5_EQUIVALENT_FRACTION_COMPLETION_ID) {
  layout.template = {
    ...(layout.template || {}),
    columns: 3,
    maxProblemsPerPage: finiteNumber(normalizedOptions.questionsPerPage) || 36
  };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    suppressExampleLabel: false,
    standardShortAnswerTarget: true,
    standardAnswerLineWidth: 42,
    standardAnswerBlankText: "___",
    hideItemSeparators: true,
    equalHeightItems: true,
    denseGridRows: 12,
    sequentialColumnFill: true,
    structuredFractionExampleStrip: true
  };
}

if (["g3_read_a_graph", "g3_graph_questions", "g3_interpret_data"].includes(item.id)) {
  const graphData = layout.problems?.[0]?.graphData || null;
  const visualSpec = DATA_DISPLAY_VISUAL_SPECS.standard;
  const questionCount = finiteNumber(normalizedOptions.questionCount) || GRADE3_DATA_BATCH7_DEFAULT_COUNTS[GRADE3_DATA_BATCH7_TASKS[item.id]];
  layout.template = {
    ...(layout.template || {}),
    columns: 2,
    maxProblemsPerPage: finiteNumber(normalizedOptions.questionsPerPage) || questionCount
  };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    suppressExampleLabel: false,
    hideItemSeparators: true,
    writingLine: true,
    answerLineBelowPrompt: true,
    sharedDataResponseLines: true,
    dataResponseLineInset: 44,
    dataResponsePromptGap: 28,
    dataResponseLineWidths: { number: 64, category: 136, yes_no: 84 },
    equalHeightItems: true,
    denseGridRows: Math.ceil((finiteNumber(normalizedOptions.questionsPerPage) || questionCount) / 2),
    sequentialColumnFill: false,
    sharedDataPictograph: true,
    sharedDataGraph: graphData,
    sharedDataGraphHeight: visualSpec.height,
    sharedDataVisualSpec: visualSpec,
    sharedDataSymbolStrokeColor: visualSpec.symbolStrokeColor,
    sharedDataSymbolStrokeWidth: visualSpec.symbolStrokeWidth,
    sharedDataScenario: graphData?.scenario || "",
    sharedDataScenarioPlacement: "between_instruction_and_graph",
    sharedDataScenarioAlign: "left",
    sharedDataScenarioFullWidth: true,
    sharedDataScenarioMaxLines: 2
  };
}

if (item.id === "g3_complete_a_graph") {
  const graphData = layout.problems?.[0]?.graphData || null;
  const constructionPictograph = {
    ...DATA_DISPLAY_VISUAL_SPECS.construction,
    bodyHeight: DATA_DISPLAY_VISUAL_SPECS.construction.height - DATA_DISPLAY_VISUAL_SPECS.construction.headerHeight,
    categoryHeight: DATA_DISPLAY_VISUAL_SPECS.construction.minimumCategoryHeight,
    placement: "after_scenario_and_data_table"
  };
  layout.template = { ...(layout.template || {}), columns: 1, maxProblemsPerPage: constructionPictograph.tasksPerPage };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    suppressExampleLabel: true,
    hideItemSeparators: true,
    sharedDataTaskMode: "complete_graph",
    sharedDataPictograph: true,
    sharedDataGraph: graphData,
    sharedDataGraphHeight: constructionPictograph.height,
    sharedDataVisualSpec: DATA_DISPLAY_VISUAL_SPECS.standard,
    constructionPictograph,
    sharedDataSymbolStrokeColor: constructionPictograph.symbolStrokeColor,
    sharedDataSymbolStrokeWidth: constructionPictograph.symbolStrokeWidth,
    sharedDataScenario: graphData?.scenario || "",
    sharedDataScenarioPlacement: "between_instruction_and_graph",
    sharedDataScenarioAlign: "left",
    sharedDataScenarioFullWidth: true,
    sharedDataScenarioMaxLines: 2,
    sequentialColumnFill: true
  };
}

if (item.id === "g3_match_data_to_graph") {
  layout.template = { ...(layout.template || {}), columns: 1, maxProblemsPerPage: 2 };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    suppressExampleLabel: true,
    hideItemSeparators: false,
    sharedDataTaskMode: "match_graph",
    sharedDataPictograph: true,
    sharedDataVisualSpec: DATA_DISPLAY_VISUAL_SPECS.standard,
    matchDataVisualSpec: DATA_DISPLAY_VISUAL_SPECS.match,
    sharedDataSymbolStrokeColor: DATA_DISPLAY_VISUAL_SPECS.standard.symbolStrokeColor,
    sharedDataSymbolStrokeWidth: DATA_DISPLAY_VISUAL_SPECS.standard.symbolStrokeWidth,
    sequentialColumnFill: true
  };
}

if (GRADE1_DATA_READING_IDS.has(item.id)) {
  const questionCount = GRADE1_DATA_QUESTION_COUNTS[item.id];
  const graphData = layout.problems?.[0]?.graphData || null;
  const visualSpec = DATA_DISPLAY_VISUAL_SPECS.standard;
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
    sharedDataGraphHeight: visualSpec.height,
    sharedDataVisualSpec: visualSpec,
    sharedDataSymbolStrokeColor: visualSpec.symbolStrokeColor,
    sharedDataSymbolStrokeWidth: visualSpec.symbolStrokeWidth,
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
  const visualSpec = DATA_DISPLAY_VISUAL_SPECS.standard;
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
    sharedDataGraphHeight: visualSpec.height,
    sharedDataVisualSpec: visualSpec,
    sharedDataSymbolStrokeColor: visualSpec.symbolStrokeColor,
    sharedDataSymbolStrokeWidth: visualSpec.symbolStrokeWidth,
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
    ...DATA_DISPLAY_VISUAL_SPECS.construction,
    bodyHeight: DATA_DISPLAY_VISUAL_SPECS.construction.height - DATA_DISPLAY_VISUAL_SPECS.construction.headerHeight,
    categoryHeight: DATA_DISPLAY_VISUAL_SPECS.construction.minimumCategoryHeight,
    placement: "after_scenario_and_data_table"
  };
  layout.template = { ...(layout.template || {}), columns: 1, maxProblemsPerPage: constructionPictograph.tasksPerPage };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    suppressExampleLabel: true,
    hideItemSeparators: true,
    sharedDataTaskMode: "complete_graph",
    sharedDataPictograph: true,
    sharedDataGraph: graphData,
    sharedDataGraphHeight: constructionPictograph.height,
    sharedDataVisualSpec: DATA_DISPLAY_VISUAL_SPECS.standard,
    constructionPictograph,
    sharedDataSymbolStrokeColor: constructionPictograph.symbolStrokeColor,
    sharedDataSymbolStrokeWidth: constructionPictograph.symbolStrokeWidth,
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
    sharedDataVisualSpec: DATA_DISPLAY_VISUAL_SPECS.standard,
    matchDataVisualSpec: DATA_DISPLAY_VISUAL_SPECS.match,
    sharedDataSymbolStrokeColor: DATA_DISPLAY_VISUAL_SPECS.standard.symbolStrokeColor,
    sharedDataSymbolStrokeWidth: DATA_DISPLAY_VISUAL_SPECS.standard.symbolStrokeWidth,
    sequentialColumnFill: true
  };
}

if (GRADE1_DATA_BATCH3_IDS.has(item.id)) {
  const taskMode = GRADE1_DATA_ACTIVITY_MODES[item.id];
  const questionCount = GRADE1_DATA_QUESTION_COUNTS[item.id];
  const graphData = layout.problems?.[0]?.graphData || null;
  const constructionPictograph = taskMode === "complete_graph"
    ? {
        ...DATA_DISPLAY_VISUAL_SPECS.construction,
        bodyHeight: DATA_DISPLAY_VISUAL_SPECS.construction.height - DATA_DISPLAY_VISUAL_SPECS.construction.headerHeight,
        categoryHeight: DATA_DISPLAY_VISUAL_SPECS.construction.minimumCategoryHeight,
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
    sharedDataGraphHeight: constructionPictograph?.height || DATA_DISPLAY_VISUAL_SPECS.standard.height,
    sharedDataVisualSpec: DATA_DISPLAY_VISUAL_SPECS.standard,
    matchDataVisualSpec: DATA_DISPLAY_VISUAL_SPECS.match,
    constructionPictograph,
    sharedDataSymbolStrokeColor: DATA_DISPLAY_VISUAL_SPECS.standard.symbolStrokeColor,
    sharedDataSymbolStrokeWidth: DATA_DISPLAY_VISUAL_SPECS.standard.symbolStrokeWidth,
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
    completedQuestionOne: taskMode === "compare_fair_shares" && Boolean(normalizedOptions.includeExample),
    ...(taskMode === "share_fairly"
      ? {
          fairShareTrayColumns: 2,
          fairShareMinimumTrayHeight: 98,
          fairShareSlotGap: 14,
          fairShareMaxTrayRowsPerPage: 3,
          fairShareMaxItemsPerPage: 2
        }
      : {})
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

if ([GRADE3_SHADE_FRACTION_ID, GRADE4_SHADE_FRACTION_ID, GRADE5_SHADE_FRACTION_ID].includes(item.id)) {
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
    fractionAllowedDenominators: item.id === GRADE5_SHADE_FRACTION_ID
      ? [2, 3, 4, 5, 6, 8, 9, 10, 11, 12]
      : item.id === GRADE4_SHADE_FRACTION_ID
        ? [2, 3, 4, 5, 6, 8, 10, 12]
      : [2, 3, 4, 5, 6, 8],
    layoutVariant: "fraction_strip_grid",
    visualColumns: 2,
    equalHeightItems: true,
    hideItemSeparators: true,
    separateWorkedModel: Boolean(normalizedOptions.includeExample),
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
    fairShareMaxItemsPerPage: 2,
    fairShareTrayColumns: 3,
    fairShareMinimumTrayHeight: 190,
    fairShareMaxTrayRowsPerPage: 2,
    fairShareSlotGap: 18,
    fairShareResponseTarget: true,
    fairShareResponseTargetHeight: 29,
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

if (isGrade1NumberWordMode || item.id === GRADE2_NUMBER_WORD_WRITE_ID || item.id === GRADE3_NUMBER_WORD_ID || item.id === GRADE4_NUMBER_WORD_ID || item.id === GRADE5_NUMBER_WORD_ID) {
  const isUpperGradeNumberWord = [GRADE4_NUMBER_WORD_ID, GRADE5_NUMBER_WORD_ID].includes(item.id);
  const questionCount = Math.max(
    1,
    finiteNumber(normalizedOptions.questionCount) || worksheet.problems?.length || 20
  );
  const pageCount = Math.min(30, questionCount);
  const derivedColumns = pageCount > 20 ? 3 : 2;

  layout.template = {
    ...(layout.template || {}),
    columns: isUpperGradeNumberWord ? 2 : derivedColumns,
    maxProblemsPerPage: isUpperGradeNumberWord
      ? finiteNumber(normalizedOptions.questionsPerPage) || 10
      : [GRADE2_NUMBER_WORD_WRITE_ID, GRADE3_NUMBER_WORD_ID].includes(item.id)
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
    numberWordPromptZoneWidth: isUpperGradeNumberWord && !isReverseNumberWordMode ? (item.id === GRADE5_NUMBER_WORD_ID ? 66 : 52) : null,
    answerLineBelowPrompt: isUpperGradeNumberWord && !isReverseNumberWordMode,
    standardAnswerLineWidth: isUpperGradeNumberWord
      ? 190
      : [GRADE2_NUMBER_WORD_WRITE_ID, GRADE3_NUMBER_WORD_ID].includes(item.id)
      ? 150
      : layout.display?.standardAnswerLineWidth,
    shortWritingLine: isReverseNumberWordMode,
    reverseNumberWordWriting: isReverseNumberWordMode,
    reverseNumberWordRespectPageCapacity: isUpperGradeNumberWord,
    reverseNumberWordLineWidth: 46,
    reverseNumberWordPromptZoneWidth: isUpperGradeNumberWord ? (item.id === GRADE5_NUMBER_WORD_ID ? 174 : 142) : 70,
    reverseNumberWordWrapPrompts: isUpperGradeNumberWord,
    numberWordAnswerKeySingleColumn: isUpperGradeNumberWord,
    reverseNumberWordRowsPerColumn: isUpperGradeNumberWord
      ? Math.ceil((finiteNumber(normalizedOptions.questionsPerPage) || 12) / 2)
      : 10,
    denseGridRows: isUpperGradeNumberWord ? 6 : layout.display?.denseGridRows,
    sequentialColumnFill: true
  };
  if (item.id === GRADE5_NUMBER_WORD_ID) {
    const baseCapacity = finiteNumber(normalizedOptions.questionsPerPage) || 12;
    layout.template.columns = 1;
    layout.template.maxProblemsPerPage = baseCapacity + (normalizedOptions.includeExample ? 1 : 0);
    layout.display.denseGridRows = layout.template.maxProblemsPerPage;
    layout.display.numberWordPromptZoneWidth = null;
    layout.display.answerLineBelowPrompt = !isReverseNumberWordMode;
    layout.display.shortWritingLine = isReverseNumberWordMode;
    layout.display.reverseNumberWordWriting = isReverseNumberWordMode;
    layout.display.reverseNumberWordPromptZoneWidth = 999;
    layout.display.reverseNumberWordRowsPerColumn = layout.template.maxProblemsPerPage;
    layout.display.atomicNumeralFormatting = true;
    layout.display.atomicWholeNumberAnswers = true;
    layout.display.grade5FullWidthNumberWordRows = !isReverseNumberWordMode;
    layout.display.grade5FullWidthReverseNumberWordRows = isReverseNumberWordMode;
  }
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

const founderReviewOutput = FOUNDER_REVIEW_DEFAULT_OUTPUT[item.id];
const useFounderReviewDefaultLayout = founderReviewOutput &&
  !hasExplicitOption(options, "questionCount") &&
  !hasExplicitOption(options, "questionsPerPage");
if (useFounderReviewDefaultLayout) {
  const columns = founderReviewOutput.columns || layout.template?.columns || 1;
  const maxProblemsPerPage = finiteNumber(normalizedOptions.questionsPerPage) ||
    founderReviewOutput.maxProblemsPerPage ||
    layout.template?.maxProblemsPerPage;
  layout.template = {
    ...(layout.template || {}),
    columns,
    maxProblemsPerPage
  };
  layout.display = {
    ...(layout.display || {}),
    denseGridRows: maxProblemsPerPage
      ? Math.ceil(maxProblemsPerPage / Math.max(1, columns))
      : founderReviewOutput.denseGridRows,
    sequentialColumnFill: true
  };

  if (founderReviewOutput.fullWidthNumberWordRows) {
    layout.display = {
      ...layout.display,
      numberWordPromptZoneWidth: null,
      answerLineBelowPrompt: !isReverseNumberWordMode,
      standardAnswerLineWidth: 190,
      shortWritingLine: isReverseNumberWordMode,
      reverseNumberWordWriting: isReverseNumberWordMode,
      reverseNumberWordRespectPageCapacity: true,
      reverseNumberWordPromptZoneWidth: 999,
      reverseNumberWordRowsPerColumn: maxProblemsPerPage,
      numberWordAnswerKeySingleColumn: true,
      atomicNumeralFormatting: true,
      atomicWholeNumberAnswers: true,
      grade5FullWidthNumberWordRows: !isReverseNumberWordMode,
      grade5FullWidthReverseNumberWordRows: isReverseNumberWordMode
    };
  }
}

if (item.id === "g1_addition_facts_within_20") {
  const { buildAdditionFactsLayout } = require("../config/layout/additionFactsLayout");
  const profile = buildAdditionFactsLayout(
    layout.problems,
    normalizedOptions._customization.normalizedOptions.questionTextSize
  );
  layout.template = { ...layout.template, columns: profile.columns, maxProblemsPerPage: profile.capacity };
  layout.display = {
    ...layout.display,
    additionFactsLayout: profile,
    inlineEquationFontSize: profile.questionTextSize
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
