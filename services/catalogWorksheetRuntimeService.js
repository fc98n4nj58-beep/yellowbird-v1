const worksheetCatalogService = require("./worksheetCatalogService");
const { normalizeWorksheetContent } = require("../engine/worksheetBuilder/normalizeWorksheetContent");

const PUBLIC_SKILL_LABEL_HIDDEN_IDS = new Set([
  "g1_number_word_match_to_50",
  "g1_write_the_numeral_to_50",
  "grade1_place_value_representation_base_ten_blocks",
  "g1_ten_frame_addition_within_10",
  "grade1_multiplication_facts_arrays",
  "grade1_multiplication_facts_equal_groups",
  "grade1_multiplication_facts_skip_counting",
  "grade1_place_value_representation_expanded_form",
  "g1_addition_on_number_line_to_20",
  "grade1_addition_subtraction_facts_equation_match",
  "grade1_data_display_graphing_read_graph",
  "grade1_data_display_graphing_interpret_data",
  "grade1_data_display_graphing_graph_questions",
  "grade1_data_display_graphing_complete_graph",
  "grade1_data_display_graphing_match_data_to_graph",
  "grade1_data_display_graphing_graph_word_problems",
  "grade1_fraction_equivalence_shade_fraction_models",
  "grade1_fraction_equivalence_match_equivalent_fractions",
  "grade1_fraction_equivalence_compare_fractions",
  "grade1_fraction_equivalence_fraction_word_problems",
  "grade2_addition_subtraction_facts_equation_match",
  "grade2_place_value_representation_number_line_identify",
  "grade2_place_value_representation_number_word_match",
  "grade2_multiplication_facts_equal_groups",
  "grade2_multiplication_facts_arrays",
  "g2_base_ten_blocks_representation",
  "g2_addition_fluency_within_100",
  "g2_missing_addends_within_100",
  "g2_subtraction_fluency_within_100",
  "g2_addition_word_problems_within_100",
  "grade2_multiplication_facts_word_problems",
  "grade2_fraction_equivalence_shade_fraction_models",
  "grade2_fraction_equivalence_fraction_word_problems",
  "grade2_data_display_graphing_read_graph",
  "grade2_data_display_graphing_interpret_data",
  "grade2_data_display_graphing_complete_graph",
  "grade2_data_display_graphing_match_data_to_graph"
]);

const GRADE2_CATEGORY_D_FOOTER_LABELS = Object.freeze({
  grade2_addition_subtraction_facts_equation_match: "Addition and Subtraction",
  grade2_place_value_representation_number_line_identify: "Number Representation",
  grade2_place_value_representation_number_word_match: "Number Representation",
  grade2_multiplication_facts_equal_groups: "Multiplication",
  grade2_fraction_equivalence_shade_fraction_models: "Fractions",
  grade2_fraction_equivalence_fraction_word_problems: "Fractions",
  grade2_data_display_graphing_read_graph: "Data & Graphing",
  grade2_data_display_graphing_interpret_data: "Data & Graphing",
  grade2_data_display_graphing_complete_graph: "Data & Graphing",
  grade2_data_display_graphing_match_data_to_graph: "Data & Graphing",
  g2_addition_word_problems_within_100: "Addition and Subtraction",
  grade2_multiplication_facts_word_problems: "Multiplication"
});

const EARLY_MULTIPLICATION_FOOTER_IDS = new Set([
  "grade1_multiplication_facts_arrays",
  "grade1_multiplication_facts_equal_groups"
]);

const NUMBER_PATTERN_FOOTER_IDS = new Set([
  "grade1_multiplication_facts_skip_counting"
]);

const GRADE2_COMPARISON_FOOTER_IDS = new Set([
  "grade2_place_value_representation_compare_numbers",
  "g2_compare_numbers_to_100"
]);

const GRADE2_ADDITION_SUBTRACTION_CATEGORY_C_IDS = new Set([
  "grade2_addition_subtraction_facts_fact_family",
  "grade2_addition_subtraction_facts_missing_addend",
  "grade2_addition_subtraction_word_problems_missing_addend_word_problem",
  "grade2_addition_subtraction_word_problems_subtraction_word_problem"
]);

const GRADE2_WITHIN_100_FLUENCY_IDS = new Set([
  "g2_addition_fluency_within_100",
  "g2_missing_addends_within_100",
  "g2_subtraction_fluency_within_100"
]);

const GRADE3_PLACE_VALUE_BATCH2_IDS = new Set([
  "grade3_place_value_representation_expanded_form",
  "grade3_place_value_representation_number_word_match",
  "grade3_place_value_representation_standard_form"
]);

const GRADE3_ADDITION_SUBTRACTION_BATCH3_IDS = new Set([
  "grade3_addition_subtraction_facts_equation_match",
  "grade3_addition_subtraction_facts_fact_family",
  "grade3_addition_subtraction_facts_fact_fluency",
  "grade3_addition_subtraction_facts_missing_addend"
]);

const GRADE3_STORY_PROBLEM_IDS = new Set([
  "grade3_addition_subtraction_word_problems_addition_word_problem",
  "grade3_addition_subtraction_word_problems_missing_addend_word_problem",
  "grade3_addition_subtraction_word_problems_subtraction_word_problem"
]);

function finiteOptionalNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function publicSkillLabel(item) {
  if (GRADE2_COMPARISON_FOOTER_IDS.has(item?.id)) return "";
  if (GRADE2_ADDITION_SUBTRACTION_CATEGORY_C_IDS.has(item?.id)) return "";
  if (GRADE2_WITHIN_100_FLUENCY_IDS.has(item?.id)) return "";
  if (GRADE3_PLACE_VALUE_BATCH2_IDS.has(item?.id)) return "";
  if (GRADE3_ADDITION_SUBTRACTION_BATCH3_IDS.has(item?.id)) return "";
  if (GRADE3_STORY_PROBLEM_IDS.has(item?.id)) return "";
  if (PUBLIC_SKILL_LABEL_HIDDEN_IDS.has(item?.id)) return "";
  if (item?.skillKey === "patterning_and_algebra") return "";
  return item?.skillKey || "";
}

function publicDomainLabel(item) {
  if (GRADE2_CATEGORY_D_FOOTER_LABELS[item?.id]) {
    return GRADE2_CATEGORY_D_FOOTER_LABELS[item.id];
  }
  if (GRADE2_COMPARISON_FOOTER_IDS.has(item?.id)) return "Place Value";
  if (GRADE2_ADDITION_SUBTRACTION_CATEGORY_C_IDS.has(item?.id)) {
    return "Addition and Subtraction";
  }
  if (GRADE2_WITHIN_100_FLUENCY_IDS.has(item?.id)) {
    return "Addition and Subtraction";
  }
  if (GRADE3_ADDITION_SUBTRACTION_BATCH3_IDS.has(item?.id)) {
    return "Addition and Subtraction";
  }
  if (GRADE3_STORY_PROBLEM_IDS.has(item?.id)) {
    return "Addition and Subtraction";
  }
  if (EARLY_MULTIPLICATION_FOOTER_IDS.has(item?.id)) {
    return "Early Multiplication Thinking";
  }
  if (NUMBER_PATTERN_FOOTER_IDS.has(item?.id)) return "Number Patterns";
  return item?.domain || "";
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
          publicDomainLabel(item),
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
        responseType: p.responseType || null,
        responseValues: Array.isArray(p.responseValues) ? p.responseValues : null,
        responseOperator: p.responseOperator || null,
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
        numberWord: p.numberWord || null,
        numberWordMode: p.numberWordMode || null,
        representedValue: finiteOptionalNumber(p.representedValue),
        frameCount: finiteOptionalNumber(p.frameCount),
        dotArrangement: p.dotArrangement || null,
        selectionMode: p.selectionMode || null,
        tens: finiteOptionalNumber(p.tens),
        ones: finiteOptionalNumber(p.ones),
        labelMode: p.labelMode || null,
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
        graphData: p.graphData || null,
        graphTaskData: p.graphTaskData || null,
        graphQuestionType: p.graphQuestionType || null,
        graphCategory: p.graphCategory || null,
        fractionModel: p.fractionModel || null,
        fractionWorkedModel: p.fractionWorkedModel || null,
        answerState: p.answerState || null,
        layoutVariant: p.layoutVariant || null,
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
