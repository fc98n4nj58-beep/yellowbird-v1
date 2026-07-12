// services/worksheetCatalogService.js //

const fs = require("fs");
const path = require("path");

const { buildWorksheet } = require("../engine/worksheetBuilder/buildWorksheet");
const { getSkillDefinition } = require("../engine/skills");
const { normalizeWorksheetLayout } = require("../engine/layout/normalizeWorksheetLayout");

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
    "missingCount"
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

  return normalized;
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

  const generatorOptions = normalizeCatalogWorksheetOptions(item, options);
  const activityType = item.activityTypes?.[0] || generatorOptions.preferredActivityType || generatorOptions.activityType || null;
  const defaultQuestionCount =
    activityType === "standard_form" && item.grades?.[0] === "grade2"
      ? 60
      : ["expanded_form", "standard_form"].includes(activityType)
        ? 45
        : null;

  return buildWorksheet(
    grade,
    "CATALOG",
    {
      skillKey: item.skillKey,
      skill
    },
    {
      ...generatorOptions,
      questionCount: generatorOptions.questionCount || defaultQuestionCount || generatorOptions.questionCount,
      preferredActivityType: activityType,
      activityType,
      grade,
      worksheetId: item.id,
      worksheetTitle: item.title
    }
  );
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

 if (activityType === "expanded_form") {
  return "Write each numeral in expanded form.";
 }

 if (activityType === "standard_form") {
  return "Write each number in standard form.";
 }

 if (activityType === "skip_counting") {
  return "Write the missing numbers in each skip-counting pattern.";
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
 const normalizedOptions = normalizeCatalogWorksheetOptions(item, options);
 const subtitle = resolveWorksheetSubtitle(item, display, normalizedOptions);
 const rangeNotice = buildRangeNotice(item, normalizedOptions);
 let instructionText = buildStudentFacingInstruction(
  item,
  item.studentInstruction || item.description || ""
 );
 const isReverseNumberWordMode = item.activityTypes?.[0] === "number_word_match" &&
  String(normalizedOptions.numberWordMode || normalizedOptions.mode || "").toLowerCase() === "word_to_numeral";

 if (isReverseNumberWordMode) {
  instructionText = "Write each number word as a number.";
 }

 const title = isReverseNumberWordMode
  ? "Write the Numeral to 50"
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
    visualVerticalAlign: "center"
  };
}

if (normalizedOptions.includeExample && layout.problems?.length) {
  layout.display = {
    ...(layout.display || {}),
    includeExample: true
  };
  layout.problems[0] = {
    ...layout.problems[0],
    isExample: true
  };
}

if (Number.isFinite(normalizedOptions.questionsPerPage) && normalizedOptions.questionsPerPage > 0) {
  layout.template = {
    ...(layout.template || {}),
    maxProblemsPerPage: normalizedOptions.questionsPerPage
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
    hideItemSeparators: false
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
  layout.instruction = responseMode === "total_only"
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
    hideItemSeparators: false
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
    layout.template = {
      ...(layout.template || {}),
      columns: 3,
      maxProblemsPerPage: 45
    };
    layout.display = {
      ...(layout.display || {}),
      denseGridRows: 15,
      sequentialColumnFill: true,
      compactExpandedForm: true,
      writingLine: false,
      answerLineBelowPrompt: false
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
    showJumpVisuals: normalizedOptions.showJumpVisuals !== false
  };
}

if (item.activityTypes?.[0] === "ten_frame") {
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

if (isReverseNumberWordMode) {
  const questionCount = Math.max(
    1,
    finiteNumber(normalizedOptions.questionCount) || worksheet.problems?.length || 10
  );
  const pageCount = Math.min(30, questionCount);
  const derivedColumns = pageCount > 20 ? 3 : pageCount > 10 ? 2 : 1;

  layout.template = {
    ...(layout.template || {}),
    columns: derivedColumns,
    maxProblemsPerPage: 30
  };
  layout.display = {
    ...(layout.display || {}),
    shortWritingLine: true,
    reverseNumberWordWriting: true,
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
