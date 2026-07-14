const layoutTemplates = require("./layoutTemplates.json");
const worksheetStyles = require("./worksheetStyles.json");
const gradeSpacingRules = require("./gradeSpacingRules.json");
const visualPlacementRules = require("./visualPlacementRules.json");
const worksheetTypeMap = require("./worksheetTypeMap.json");

function safeStr(v) {
  return (v ?? "").toString().trim();
}

function finiteOptionalNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function detectGradeBand(gradeLabel = "") {
  const raw = safeStr(gradeLabel).toLowerCase();

  if (!raw) return "G4_6";
  if (raw.includes("kindergarten") || raw === "k" || raw === "grade 1" || raw === "1") return "K1";
  if (raw === "grade 2" || raw === "2" || raw === "grade 3" || raw === "3") return "G2_3";
  return "G4_6";
}

function resolveModeMapping({ modeId, skillKey }) {
  if (skillKey && worksheetTypeMap[skillKey]) return worksheetTypeMap[skillKey];
  if (modeId && worksheetTypeMap[modeId]) return worksheetTypeMap[modeId];

  return {
    worksheetType: "equation_practice",
    templateId: "equation_practice",
    interactionType: "write_answer",
    instruction: "Solve each problem."
  };
}

function isLongPromptTextLayout(problems = [], template) {
  if (!Array.isArray(problems) || !problems.length) return false;
  if (template?.visualSupport === false && template?.id !== "matching") return false;

  const textOnlyProblems = problems.filter((problem) => !problem.visual);
  if (!textOnlyProblems.length || textOnlyProblems.length !== problems.length) return false;

  return textOnlyProblems.some((problem) => {
    const prompt = safeStr(problem.prompt || problem.question || problem.text || "");
    return prompt.length >= 58 || prompt.split(/\s+/).length >= 10;
  });
}

function normalizeProblem(problem, index, context) {
  const prompt = safeStr(problem.prompt || problem.question || problem.text || "");
  const interactionType = context.interactionType || "write_answer";
  const templateType = context.templateId;
  const answerSpaceType = context.template.answerSpaceType || "line";

  const visual = problem.visual || null;
  const visualRule =
    visualPlacementRules[problem.visual?.kind] ||
    visualPlacementRules[context.skillKey] ||
    null;

  return {
    problemNumber: index + 1,
    prompt,
    visual,
    interactionType,
    templateType,
    answerSpace: {
      type: answerSpaceType,
      answerHeightIn: context.gradeSpacing.answerHeightIn
    },
    gradeSpacingRule: context.gradeBand,
    visualPlacement: visualRule?.position || (visual ? "above_prompt" : "none"),
    answer: problem.answer,
    responseMode: problem.responseMode || null,
    responseType: problem.responseType || null,
    responseValues: Array.isArray(problem.responseValues) ? problem.responseValues : null,
    responseOperator: problem.responseOperator || null,
    showQuestionSentence: Boolean(problem.showQuestionSentence),
    taskMode: problem.taskMode || null,
    equationSupport: problem.equationSupport || null,
    a: finiteOptionalNumber(problem.a),
    b: finiteOptionalNumber(problem.b),
    op: problem.op || null,
    product: finiteOptionalNumber(problem.product),
    quotient: finiteOptionalNumber(problem.quotient),
    modelKey: problem.modelKey || null,
    orientation: problem.orientation || null,
    value: finiteOptionalNumber(problem.value),
    numberWord: problem.numberWord || null,
    numberWordMode: problem.numberWordMode || null,
    representedValue: finiteOptionalNumber(problem.representedValue),
    frameCount: finiteOptionalNumber(problem.frameCount),
    dotArrangement: problem.dotArrangement || null,
    selectionMode: problem.selectionMode || null,
    tens: finiteOptionalNumber(problem.tens),
    ones: finiteOptionalNumber(problem.ones),
    labelMode: problem.labelMode || null,
    type: problem.type || "equation",
    id: problem.id ?? index + 1,
    sequence: Array.isArray(problem.sequence) ? problem.sequence : null,
    missingIndex: finiteOptionalNumber(problem.missingIndex),
    missingIndexes: Array.isArray(problem.missingIndexes)
      ? problem.missingIndexes.map(finiteOptionalNumber).filter((n) => n !== null)
      : null,
    step: finiteOptionalNumber(problem.step),
    patternKind: problem.patternKind || null,
    patternRule: problem.patternRule || null,
    patternOperation: problem.patternOperation || null,
    continuationCount: finiteOptionalNumber(problem.continuationCount),
    continuationAnswers: Array.isArray(problem.continuationAnswers) ? problem.continuationAnswers : null,
    missingTermPlacement: problem.missingTermPlacement || null,
    operation: problem.operation || null,
    minuend: finiteOptionalNumber(problem.minuend),
    subtrahend: finiteOptionalNumber(problem.subtrahend),
    difference: finiteOptionalNumber(problem.difference),
    firstAddend: finiteOptionalNumber(problem.firstAddend),
    secondAddend: finiteOptionalNumber(problem.secondAddend),
    total: finiteOptionalNumber(problem.total),
    missingPosition: problem.missingPosition || null,
    missingValue: finiteOptionalNumber(problem.missingValue),
    leftValue: finiteOptionalNumber(problem.leftValue),
    rightValue: finiteOptionalNumber(problem.rightValue),
    expectedSymbol: problem.expectedSymbol || null,
    comparisonResult: problem.comparisonResult || null,
    graphData: problem.graphData || null,
    graphTaskData: problem.graphTaskData || null,
    graphQuestionType: problem.graphQuestionType || null,
    graphCategory: problem.graphCategory || null,
    duplicateSignature: problem.duplicateSignature || null,
    relatedDuplicateSignature: problem.relatedDuplicateSignature || null,
    diagnostics: Array.isArray(problem.diagnostics) ? problem.diagnostics : null
  };
}

function normalizeWorksheetLayout({
  title = "",
  subtitle = "",
  meta = {},
  instruction = "",
  modeId = "",
  skillKey = "",
  problems = [],
  sections = []
}) {
  const gradeLabel = safeStr(meta.gradeLabel || meta.grade || "");
  const subjectLabel = safeStr(meta.subjectLabel || meta.subject || "Math");
  const strandLabel = safeStr(meta.strandLabel || meta.strand || "");
  const skillLabel = safeStr(meta.skillLabel || meta.skillTitle || title);

  const gradeBand = detectGradeBand(gradeLabel);
  const gradeSpacing = gradeSpacingRules[gradeBand] || gradeSpacingRules.G4_6;

  const mapping = resolveModeMapping({ modeId, skillKey });
  const template = layoutTemplates[mapping.templateId] || layoutTemplates.equation_practice;
  const useLongPromptLayout = isLongPromptTextLayout(problems, template);
  const normalizedTemplate = useLongPromptLayout
    ? {
        ...template,
        columns: 1,
        maxProblemsPerPage: Math.min(template.maxProblemsPerPage || 8, 6),
        spacingDensity: "spacious"
      }
    : {
        ...template,
        columns: template.defaultColumns
      };

  if (mapping.template && typeof mapping.template === "object") {
    Object.assign(normalizedTemplate, mapping.template);
  }

  const normalizedProblems = problems.map((problem, index) =>
    normalizeProblem(problem, index, {
      interactionType: mapping.interactionType,
      templateId: mapping.templateId,
      template: normalizedTemplate,
      gradeBand,
      gradeSpacing,
      skillKey
    })
  );

  return {
    header: {
      title: safeStr(title) || skillLabel || "Math Practice",
      subtitle: safeStr(subtitle),
      meta: {
        gradeLabel,
        subjectLabel,
        strandLabel,
        skillLabel
      },
      showCurriculumMeta: Boolean(gradeLabel || strandLabel || skillLabel),
      nameDate: true
    },
    instruction: safeStr(instruction) || mapping.instruction,
    template: normalizedTemplate,
    styles: worksheetStyles,
    gradeBand,
    gradeSpacing,
    worksheetType: mapping.worksheetType,
    display: mapping.display && typeof mapping.display === "object"
      ? { ...mapping.display }
      : {},
    skillKey,
    modeId,
    problems: normalizedProblems,
    sections: Array.isArray(sections) ? sections : []
  };
}

module.exports = { normalizeWorksheetLayout };
