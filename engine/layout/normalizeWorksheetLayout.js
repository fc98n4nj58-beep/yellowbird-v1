const layoutTemplates = require("./layoutTemplates.json");
const worksheetStyles = require("./worksheetStyles.json");
const gradeSpacingRules = require("./gradeSpacingRules.json");
const visualPlacementRules = require("./visualPlacementRules.json");
const worksheetTypeMap = require("./worksheetTypeMap.json");

function safeStr(v) {
  return (v ?? "").toString().trim();
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
    type: problem.type || "equation",
    id: problem.id ?? index + 1
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
    skillKey,
    modeId,
    problems: normalizedProblems,
    sections: Array.isArray(sections) ? sections : []
  };
}

module.exports = { normalizeWorksheetLayout };
