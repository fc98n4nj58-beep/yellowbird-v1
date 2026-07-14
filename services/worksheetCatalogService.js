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
const GRADE1_DATA_READING_IDS = new Set([
  "grade1_data_display_graphing_read_graph",
  "grade1_data_display_graphing_interpret_data",
  "grade1_data_display_graphing_graph_questions"
]);
const GRADE1_DATA_QUESTION_COUNTS = Object.freeze({
  grade1_data_display_graphing_read_graph: 6,
  grade1_data_display_graphing_interpret_data: 6,
  grade1_data_display_graphing_graph_questions: 8
});

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

function normalizeGrade1DataReadingOptions(item, options = {}) {
  if (!GRADE1_DATA_READING_IDS.has(item.id)) return options;
  return {
    ...options,
    questionCount: GRADE1_DATA_QUESTION_COUNTS[item.id]
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

  return normalizeGrade1DataReadingOptions(
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
              normalizeGrade1FluencyComparisonOptions(item, normalized)
            )
          )
        )
      )
    )
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
  const activityType = item.activityTypes?.[0] || generatorOptions.preferredActivityType || generatorOptions.activityType || null;
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
    return buildWorksheet(
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

 if (item.id === "grade1_multiplication_facts_arrays") {
  return "Count the rows and columns. Complete the number sentence for each array.";
 }

 if (item.id === "grade1_multiplication_facts_equal_groups") {
  return "Count the groups and the objects in each group. Complete the number sentence.";
 }

 if (item.id === GRADE1_ADDITION_NUMBER_LINE_ID) {
  return "Use the number line to solve each addition question.";
 }

 if (item.id === GRADE1_EQUATION_MATCH_ID) {
  return "Solve both sides. Write = if they have the same value. Write ≠ if they have different values.";
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

 if (item.id === "g1_number_word_match_to_50") {
  return "Write each number in words.";
 }

 if (item.id === "g1_write_the_numeral_to_50") {
  return "Write the numeral for each number word.";
 }

 if (item.id === "grade1_place_value_representation_base_ten_blocks") {
  return "Count the base ten blocks. Write the number.";
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

function patterningInstruction(activityType, normalizedOptions = {}) {
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
    return "Write the rule for each pattern.";
  }

  return "";
}

function resolvePatterningPageCapacity(activityType, normalizedOptions = {}) {
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

  const title = isReverseNumberWordMode
  ? "Write the Numeral to 50"
  : item.id === "grade1_multiplication_facts_arrays"
    ? "Arrays"
    : item.id === "grade1_multiplication_facts_equal_groups"
      ? "Equal Groups"
      : item.id === "grade1_multiplication_facts_skip_counting"
        ? "Skip Counting"
        : item.id === "grade1_place_value_representation_expanded_form"
          ? "Expanded Form"
          : item.id === GRADE1_ADDITION_NUMBER_LINE_ID
            ? "Addition on a Number Line"
            : item.id === GRADE1_EQUATION_MATCH_ID
              ? "Equal or Not Equal?"
              : item.id === "grade1_data_display_graphing_read_graph"
                ? "Read the Graph"
                : item.id === "grade1_data_display_graphing_interpret_data"
                  ? "Compare the Data"
                  : item.id === "grade1_data_display_graphing_graph_questions"
                    ? "Graph Questions"
      : item.title;

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

if (["math.addition.basic", "related_subtraction", "missing_addend"].includes(item.activityTypes?.[0])) {
  layout.display = {
    ...(layout.display || {}),
    answerTargetVariant: "shortNumeric",
    standardShortAnswerTarget: true
  };
}

if (item.activityTypes?.[0] === "compare_numbers") {
  layout.template = {
    ...(layout.template || {}),
    columns: 4,
    maxProblemsPerPage: finiteNumber(normalizedOptions.questionsPerPage) || 60
  };
  layout.display = {
    ...(layout.display || {}),
    answerTargetVariant: "comparisonSymbol",
    standardShortAnswerTarget: true,
    standardAnswerLineWidth: 34,
    standardAnswerBlankText: "___",
    hideItemSeparators: true,
    equalHeightItems: true,
    denseGridRows: 15
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
  const maxProblemsPerPage = resolvePatterningPageCapacity(activityType, normalizedOptions);
  const columns = activityType === "identify_pattern_rule" ? 1 : 2;

  layout.instruction = patterningInstruction(activityType, normalizedOptions);
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
    patterningTargetStrokeColor: "#8f98a8",
    patterningTargetStrokeWidth: 0.95,
    denseGridRows: Math.ceil(maxProblemsPerPage / columns),
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
    hideSubtitle: GRADE1_MULTIPLICATION_MODEL_IDS.has(item.id),
    suppressExampleLabel: GRADE1_MULTIPLICATION_MODEL_IDS.has(item.id),
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

if (isGrade1NumberWordMode) {
  const questionCount = Math.max(
    1,
    finiteNumber(normalizedOptions.questionCount) || worksheet.problems?.length || 20
  );
  const pageCount = Math.min(30, questionCount);
  const derivedColumns = pageCount > 20 ? 3 : 2;

  layout.template = {
    ...(layout.template || {}),
    columns: derivedColumns,
    maxProblemsPerPage: derivedColumns === 3 ? 30 : 20
  };
  layout.display = {
    ...(layout.display || {}),
    hideSubtitle: true,
    hideItemSeparators: true,
    writingLine: true,
    equalHeightItems: true,
    numberWordResponseTarget: isReverseNumberWordMode ? "shortNumeral" : "writtenWord",
    shortWritingLine: isReverseNumberWordMode,
    reverseNumberWordWriting: isReverseNumberWordMode,
    reverseNumberWordLineWidth: 46,
    reverseNumberWordPromptZoneWidth: 70,
    reverseNumberWordRowsPerColumn: 10,
    sequentialColumnFill: true
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
