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
  "grade2_data_display_graphing_match_data_to_graph",
  "grade4_addition_subtraction_facts_equation_match",
  "grade5_addition_subtraction_facts_equation_match",
  "grade5_place_value_representation_compare_numbers",
  "g5_interpret_graphs"
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

const ARRAY_FAMILY_FOOTER_LABELS = Object.freeze({
  grade1_multiplication_facts_arrays: "Early Multiplication Thinking",
  grade2_multiplication_facts_arrays: "Multiplication & Division",
  g3_multiplication_arrays: "Multiplication & Division",
  g4_array_interpretation: "Multiplication & Division"
});

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

const GRADE4_STORY_PROBLEM_IDS = new Set([
  "grade4_addition_subtraction_word_problems_addition_word_problem",
  "grade4_addition_subtraction_word_problems_missing_addend_word_problem",
  "grade4_addition_subtraction_word_problems_subtraction_word_problem"
]);
const GRADE5_STORY_PROBLEM_IDS = new Set([
  "grade5_addition_subtraction_word_problems_addition_word_problem",
  "grade5_addition_subtraction_word_problems_missing_addend_word_problem",
  "grade5_addition_subtraction_word_problems_subtraction_word_problem"
]);
const SHARED_UPPER_STORY_PROBLEM_IDS = new Set([
  ...GRADE4_STORY_PROBLEM_IDS,
  ...GRADE5_STORY_PROBLEM_IDS
]);

const GRADE4_PLACE_VALUE_BATCH4_IDS = new Set([
  "grade4_place_value_representation_number_line_identify",
  "grade4_place_value_representation_number_word_match",
  "grade4_place_value_representation_compare_numbers"
]);

const GRADE5_NUMERIC_PATTERN_IDS = new Set([
  "grade5_patterning_and_algebra_extend_pattern",
  "grade5_patterning_and_algebra_identify_pattern_rule",
  "grade5_patterning_and_algebra_missing_value_pattern"
]);

const GRADE5_PLACE_VALUE_BATCH4_IDS = new Set([
  "grade5_place_value_representation_expanded_form",
  "grade5_place_value_representation_number_line_identify",
  "grade5_place_value_representation_number_word_match",
  "grade5_place_value_representation_standard_form"
]);

const GRADE3_CONCRETE_VISUAL_FOOTERS = Object.freeze({
  g3_equal_sharing_division: "Multiplication and Division",
  grade3_fraction_equivalence_shade_fraction_models: "Fractions",
  grade3_place_value_representation_number_line_identify: "Place Value",
  grade3_fraction_equivalence_compare_fractions: "Fractions",
  grade3_fraction_equivalence_fraction_number_line: "Fractions",
  grade4_fraction_equivalence_compare_fractions: "Fractions",
  grade4_fraction_equivalence_fraction_number_line: "Fractions",
  grade4_fraction_equivalence_shade_fraction_models: "Fractions",
  grade5_fraction_equivalence_fraction_number_line: "Fractions",
  grade5_fraction_equivalence_match_equivalent_fractions: "Fractions",
  grade5_fraction_equivalence_shade_fraction_models: "Fractions",
  g3_complete_a_graph: "Data & Graphing",
  g3_graph_questions: "Data & Graphing",
  g3_interpret_data: "Data & Graphing",
  g3_match_data_to_graph: "Data & Graphing",
  g3_read_a_graph: "Data & Graphing",
  grade3_place_value_representation_base_ten_blocks: "Place Value"
});

function finiteOptionalNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function publicSkillLabel(item) {
  if (ARRAY_FAMILY_FOOTER_LABELS[item?.id]) return "";
  if (GRADE3_CONCRETE_VISUAL_FOOTERS[item?.id]) return "";
  if (GRADE2_COMPARISON_FOOTER_IDS.has(item?.id)) return "";
  if (GRADE2_ADDITION_SUBTRACTION_CATEGORY_C_IDS.has(item?.id)) return "";
  if (GRADE2_WITHIN_100_FLUENCY_IDS.has(item?.id)) return "";
  if (GRADE3_PLACE_VALUE_BATCH2_IDS.has(item?.id)) return "";
  if (GRADE3_ADDITION_SUBTRACTION_BATCH3_IDS.has(item?.id)) return "";
  if (GRADE3_STORY_PROBLEM_IDS.has(item?.id)) return "";
  if (SHARED_UPPER_STORY_PROBLEM_IDS.has(item?.id)) return "";
  if (GRADE4_PLACE_VALUE_BATCH4_IDS.has(item?.id)) return "";
  if (GRADE5_PLACE_VALUE_BATCH4_IDS.has(item?.id)) return "";
  if (PUBLIC_SKILL_LABEL_HIDDEN_IDS.has(item?.id)) return "";
  if (item?.skillKey === "patterning_and_algebra") return "";
  return item?.skillKey || "";
}

function publicDomainLabel(item) {
  if (ARRAY_FAMILY_FOOTER_LABELS[item?.id]) {
    return ARRAY_FAMILY_FOOTER_LABELS[item.id];
  }
  if (GRADE3_CONCRETE_VISUAL_FOOTERS[item?.id]) {
    return GRADE3_CONCRETE_VISUAL_FOOTERS[item.id];
  }
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
  if (SHARED_UPPER_STORY_PROBLEM_IDS.has(item?.id)) {
    return "Addition & Subtraction";
  }
  if (item?.id === "grade4_addition_subtraction_facts_equation_match") {
    return "Addition & Subtraction";
  }
  if (GRADE4_PLACE_VALUE_BATCH4_IDS.has(item?.id)) return "Place Value";
  if (GRADE5_PLACE_VALUE_BATCH4_IDS.has(item?.id)) return "Place Value";
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
        ...(Array.isArray(p.acceptedAnswerVariants)
          ? { acceptedAnswerVariants: [...p.acceptedAnswerVariants] }
          : {}),
        responseValues: Array.isArray(p.responseValues) ? p.responseValues : null,
        responseOperator: p.responseOperator || null,
        showQuestionSentence: Boolean(p.showQuestionSentence),
        taskMode: p.taskMode || null,
        taskAction: p.taskAction || null,
        equationSupport: p.equationSupport || null,
        a: finiteOptionalNumber(p.a),
        b: finiteOptionalNumber(p.b),
        op: p.op || null,
        operation: p.operation || null,
        product: finiteOptionalNumber(p.product),
        quotient: finiteOptionalNumber(p.quotient),
        groups: finiteOptionalNumber(p.groups),
        itemsPerGroup: finiteOptionalNumber(p.itemsPerGroup),
        responseTarget: p.responseTarget || null,
        modelGrouping: Array.isArray(p.modelGrouping) ? p.modelGrouping.map(Number) : null,
        numerator: finiteOptionalNumber(p.numerator),
        denominator: finiteOptionalNumber(p.denominator),
        partCount: finiteOptionalNumber(p.partCount),
        shadeCount: finiteOptionalNumber(p.shadeCount),
        modelType: p.modelType || null,
        minValue: finiteOptionalNumber(p.minValue),
        maxValue: finiteOptionalNumber(p.maxValue),
        interval: finiteOptionalNumber(p.interval),
        tickCount: finiteOptionalNumber(p.tickCount),
        targetValue: finiteOptionalNumber(p.targetValue),
        targetIndex: finiteOptionalNumber(p.targetIndex),
        endpointPolicy: p.endpointPolicy || null,
        displayedLabels: Array.isArray(p.displayedLabels) ? p.displayedLabels.map(Number) : null,
        displayedFractionLabels: Array.isArray(p.displayedFractionLabels) ? p.displayedFractionLabels.map(String) : null,
        wholeStart: finiteOptionalNumber(p.wholeStart),
        wholeEnd: finiteOptionalNumber(p.wholeEnd),
        intervalCount: finiteOptionalNumber(p.intervalCount),
        targetNumerator: finiteOptionalNumber(p.targetNumerator),
        targetDenominator: finiteOptionalNumber(p.targetDenominator),
        simplifiedDisplayFraction: p.simplifiedDisplayFraction || null,
        leftNumerator: finiteOptionalNumber(p.leftNumerator),
        leftDenominator: finiteOptionalNumber(p.leftDenominator),
        rightNumerator: finiteOptionalNumber(p.rightNumerator),
        rightDenominator: finiteOptionalNumber(p.rightDenominator),
        leftCrossProduct: finiteOptionalNumber(p.leftCrossProduct),
        rightCrossProduct: finiteOptionalNumber(p.rightCrossProduct),
        normalizedLeftFraction: p.normalizedLeftFraction || null,
        normalizedRightFraction: p.normalizedRightFraction || null,
        equalityState: typeof p.equalityState === "boolean" ? p.equalityState : null,
        modelKey: p.modelKey || null,
        orientation: p.orientation || null,
        value: finiteOptionalNumber(p.value),
        numberWord: p.numberWord || null,
        numberWordMode: p.numberWordMode || null,
        numeral: p.numeral || null,
        taskDirection: p.taskDirection || null,
        representedValue: finiteOptionalNumber(p.representedValue),
        frameCount: finiteOptionalNumber(p.frameCount),
        dotArrangement: p.dotArrangement || null,
        selectionMode: p.selectionMode || null,
        hundreds: finiteOptionalNumber(p.hundreds),
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
        ...(p.multiplier !== undefined
          ? { multiplier: finiteOptionalNumber(p.multiplier) }
          : {}),
        leftValue: finiteOptionalNumber(p.leftValue),
        rightValue: finiteOptionalNumber(p.rightValue),
        leftExpression: p.leftExpression || null,
        rightExpression: p.rightExpression || null,
        leftOperation: p.leftOperation || null,
        rightOperation: p.rightOperation || null,
        leftOperands: Array.isArray(p.leftOperands) ? p.leftOperands.map(Number) : null,
        rightOperands: Array.isArray(p.rightOperands) ? p.rightOperands.map(Number) : null,
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
        diagnostics: Array.isArray(p.diagnostics) ? p.diagnostics : null,
        ...(GRADE5_NUMERIC_PATTERN_IDS.has(item.id) ? {
          startingValue: finiteOptionalNumber(p.startingValue),
          ruleAmount: finiteOptionalNumber(p.ruleAmount),
          fullSequence: Array.isArray(p.fullSequence) ? p.fullSequence.map(Number) : null,
          visiblePrefix: Array.isArray(p.visiblePrefix) ? p.visiblePrefix.map(Number) : null,
          fullVisibleSequence: Array.isArray(p.fullVisibleSequence) ? p.fullVisibleSequence.map(Number) : null,
          displayedSequence: Array.isArray(p.displayedSequence)
            ? p.displayedSequence.map((value) => value === null ? null : Number(value))
            : null,
          continuationValues: Array.isArray(p.continuationValues) ? p.continuationValues.map(Number) : null,
          missingValues: Array.isArray(p.missingValues) ? p.missingValues.map(Number) : null,
          responseTargets: Array.isArray(p.responseTargets)
            ? p.responseTargets.map((target) => ({ ...target }))
            : null,
          answerList: Array.isArray(p.answerList) ? [...p.answerList] : null,
          studentFacingRule: p.studentFacingRule || null,
          acceptedNormalizedRule: p.acceptedNormalizedRule
            ? { ...p.acceptedNormalizedRule }
            : null
        } : {}),
        ...(SHARED_UPPER_STORY_PROBLEM_IDS.has(item.id) ? {
          contextId: p.contextId || null,
          templateId: p.templateId || null,
          storyType: p.storyType || null,
          unknownPosition: p.unknownPosition || null,
          operationFamily: p.operationFamily || null,
          knownAddend: finiteOptionalNumber(p.knownAddend)
        } : {})
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
