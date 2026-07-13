const worksheetCatalogService = require("./worksheetCatalogService");
const { normalizeWorksheetContent } = require("../engine/worksheetBuilder/normalizeWorksheetContent");

function finiteOptionalNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function publicSkillLabel(item) {
  if (item?.skillKey === "patterning_and_algebra") return "";
  return item?.skillKey || "";
}

function buildCatalogWorksheetRuntime(id, query = {}) {
  const item = worksheetCatalogService.getWorksheetCatalogById(id);

  if (!item) {
    const err = new Error("Worksheet catalog item not found.");
    err.status = 404;
    throw err;
  }

  const worksheet = worksheetCatalogService.generateWorksheetFromCatalogId(id, query);
  const layout = worksheetCatalogService.buildLayoutFromWorksheet(item, worksheet, query);
  const subheading = layout.header?.subtitle || "";
  const title = layout.header?.title || item.title;

  const contentObject = {
    meta: {
      title,
      subheading,
      resourceType: item.resourceType || "worksheet",
      formatLabel: item.formatLabel || "",
      teacherNote: item.teacherNote || "",
      curriculum: {
        footerText: [
          item.gradeLabels?.[0] || "",
          item.subject || "Math",
          item.domain || "",
          publicSkillLabel(item)
        ].filter(Boolean).join(" • ")
      }
    },
    content: {
      items: (layout.problems || []).map((p, i) => ({
        id: p.id ?? i + 1,
        type: p.type || "equation",
        prompt: p.prompt || "",
        answer: p.answer,
        responseMode: p.responseMode || null,
        responseValues: Array.isArray(p.responseValues) ? p.responseValues : null,
        showQuestionSentence: Boolean(p.showQuestionSentence),
        taskMode: p.taskMode || null,
        equationSupport: p.equationSupport || null,
        a: finiteOptionalNumber(p.a),
        b: finiteOptionalNumber(p.b),
        op: p.op || null,
        operation: p.operation || null,
        product: finiteOptionalNumber(p.product),
        quotient: finiteOptionalNumber(p.quotient),
        modelKey: p.modelKey || null,
        orientation: p.orientation || null,
        value: finiteOptionalNumber(p.value),
        visual: p.visual || null,
        isExample: Boolean(p.isExample),
        sequence: Array.isArray(p.sequence) ? p.sequence : null,
        missingIndex: finiteOptionalNumber(p.missingIndex),
        missingIndexes: Array.isArray(p.missingIndexes)
          ? p.missingIndexes.map(finiteOptionalNumber).filter((n) => n !== null)
          : null,
        step: finiteOptionalNumber(p.step),
        patternKind: p.patternKind || null,
        patternRule: p.patternRule || null,
        patternOperation: p.patternOperation || null,
        continuationCount: finiteOptionalNumber(p.continuationCount),
        continuationAnswers: Array.isArray(p.continuationAnswers) ? p.continuationAnswers : null,
        missingTermPlacement: p.missingTermPlacement || null,
        minuend: finiteOptionalNumber(p.minuend),
        subtrahend: finiteOptionalNumber(p.subtrahend),
        difference: finiteOptionalNumber(p.difference),
        firstAddend: finiteOptionalNumber(p.firstAddend),
        secondAddend: finiteOptionalNumber(p.secondAddend),
        total: finiteOptionalNumber(p.total),
        missingPosition: p.missingPosition || null,
        missingValue: finiteOptionalNumber(p.missingValue),
        leftValue: finiteOptionalNumber(p.leftValue),
        rightValue: finiteOptionalNumber(p.rightValue),
        expectedSymbol: p.expectedSymbol || null,
        comparisonResult: p.comparisonResult || null,
        duplicateSignature: p.duplicateSignature || null,
        relatedDuplicateSignature: p.relatedDuplicateSignature || null,
        diagnostics: Array.isArray(p.diagnostics) ? p.diagnostics : null
      }))
    }
  };

  const normalizedContentObject = normalizeWorksheetContent(contentObject);

  return {
    item,
    worksheet,
    layout,
    contentObject,
    normalizedContentObject
  };
}

module.exports = {
  buildCatalogWorksheetRuntime
};
