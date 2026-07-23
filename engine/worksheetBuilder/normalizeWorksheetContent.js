// engine/worksheetBuilder/normalizeWorksheetContent.js

function normalizeVisual(visual = {}) {
  if (!visual || !visual.kind) return null;

  let kind = visual.kind;
  const data = { ...(visual.data || {}) };

  if (kind === "arrays") kind = "array";
  if (kind === "tenframe") kind = "ten_frame";
  if (kind === "base_ten") kind = "base_ten_blocks";

  if (kind === "number_line") {
    return {
      kind,
      data: {
        min: Number(data.min ?? data.start ?? 0),
        max: Number(data.max ?? data.end ?? 10),
        value: Number(data.value ?? data.highlight ?? data.min ?? data.start ?? 0),
        hideValueLabel: Boolean(data.hideValueLabel),
        ...(data.start == null ? {} : { start: Number(data.start) }),
        ...(data.end == null ? {} : { end: Number(data.end) }),
        ...(data.interval == null ? {} : { interval: Number(data.interval) }),
        ...(data.tickCount == null ? {} : { tickCount: Number(data.tickCount) }),
        ...(data.labelEvery == null ? {} : { labelEvery: Number(data.labelEvery) }),
        ...(data.labelWidth == null ? {} : { labelWidth: Number(data.labelWidth) }),
        ...(data.formatThousands == null ? {} : { formatThousands: Boolean(data.formatThousands) }),
        ...(data.targetIndex == null ? {} : { targetIndex: Number(data.targetIndex) }),
        fractionLabels: Array.isArray(data.fractionLabels) ? data.fractionLabels.map(String) : null,
        fractionDenominator: finiteOptionalNumber(data.fractionDenominator),
        additionStart: data.additionStart == null ? null : Number(data.additionStart),
        additionJump: data.additionJump == null ? null : Number(data.additionJump),
        additionLanding: data.additionLanding == null ? null : Number(data.additionLanding),
        additionDirection: data.additionDirection || null
      }
    };
  }

  if (kind === "ten_frame") {
    return {
      kind,
      data: {
        filled: Number(data.filled ?? 0),
        frames: Number(data.frames ?? 1)
      }
    };
  }

  if (kind === "array") {
    return {
      kind,
      data: {
        rows: Number(data.rows ?? 1),
        cols: Number(data.cols ?? 1),
        factorA: Number(data.factorA ?? data.rows ?? 1),
        factorB: Number(data.factorB ?? data.cols ?? 1),
        product: Number(data.product ?? Number(data.rows ?? 1) * Number(data.cols ?? 1)),
        orientation: data.orientation || "rows_columns"
      }
    };
  }

  if (kind === "equal_groups") {
    return {
      kind,
      data: {
        groups: Number(data.groups ?? 1),
        itemsPerGroup: Number(data.itemsPerGroup ?? 1),
        factorA: Number(data.factorA ?? data.groups ?? 1),
        factorB: Number(data.factorB ?? data.itemsPerGroup ?? 1),
        product: Number(data.product ?? Number(data.groups ?? 1) * Number(data.itemsPerGroup ?? 1)),
        orientation: data.orientation || "groups_items"
      }
    };
  }

  if (kind === "equal_sharing") {
    return {
      kind,
      data: {
        total: Number(data.total ?? 1),
        groups: Number(data.groups ?? 1),
        itemsPerGroup: Number(data.itemsPerGroup ?? data.quotient ?? 1),
        quotient: Number(data.quotient ?? data.itemsPerGroup ?? 1),
        taskMode: data.taskMode || "distribute",
        equationSupport: data.equationSupport || "blanks",
        orientation: data.orientation || "total_groups"
      }
    };
  }

  if (kind === "base_ten_blocks") {
    return {
      kind,
      data: {
        value: Number(data.value ?? data.representedValue ?? 0),
        representedValue: Number(data.representedValue ?? data.value ?? 0),
        hundreds: Number(data.hundreds ?? 0),
        tens: Number(data.tens ?? 0),
        ones: Number(data.ones ?? 0),
        labelMode: data.labelMode || "none"
      }
    };
  }

  return { kind, data };
}

function finiteOptionalNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeItem(item = {}, index = 0, meta = {}) {
  return {
    id: item.id ?? index + 1,
    type: item.type ?? "question",
    prompt: item.prompt ?? item.text ?? item.question ?? "",
    answer: item.answer ?? "",
    responseMode: item.responseMode || null,
    responseType: item.responseType || null,
    responseValues: Array.isArray(item.responseValues) ? item.responseValues : null,
    responseOperator: item.responseOperator || null,
    showQuestionSentence: Boolean(item.showQuestionSentence),
    taskMode: item.taskMode || null,
    taskAction: item.taskAction || null,
    equationSupport: item.equationSupport || null,
    product: finiteOptionalNumber(item.product),
    quotient: finiteOptionalNumber(item.quotient),
    groups: finiteOptionalNumber(item.groups),
    itemsPerGroup: finiteOptionalNumber(item.itemsPerGroup),
    responseTarget: item.responseTarget || null,
    modelGrouping: Array.isArray(item.modelGrouping) ? item.modelGrouping.map(Number) : null,
    numerator: finiteOptionalNumber(item.numerator),
    denominator: finiteOptionalNumber(item.denominator),
    partCount: finiteOptionalNumber(item.partCount),
    shadeCount: finiteOptionalNumber(item.shadeCount),
    modelType: item.modelType || null,
    minValue: finiteOptionalNumber(item.minValue),
    maxValue: finiteOptionalNumber(item.maxValue),
    interval: finiteOptionalNumber(item.interval),
    tickCount: finiteOptionalNumber(item.tickCount),
    targetValue: finiteOptionalNumber(item.targetValue),
    targetIndex: finiteOptionalNumber(item.targetIndex),
    endpointPolicy: item.endpointPolicy || null,
    displayedLabels: Array.isArray(item.displayedLabels) ? item.displayedLabels.map(Number) : null,
    displayedFractionLabels: Array.isArray(item.displayedFractionLabels) ? item.displayedFractionLabels.map(String) : null,
    wholeStart: finiteOptionalNumber(item.wholeStart),
    wholeEnd: finiteOptionalNumber(item.wholeEnd),
    intervalCount: finiteOptionalNumber(item.intervalCount),
    targetNumerator: finiteOptionalNumber(item.targetNumerator),
    targetDenominator: finiteOptionalNumber(item.targetDenominator),
    simplifiedDisplayFraction: item.simplifiedDisplayFraction || null,
    leftNumerator: finiteOptionalNumber(item.leftNumerator),
    leftDenominator: finiteOptionalNumber(item.leftDenominator),
    rightNumerator: finiteOptionalNumber(item.rightNumerator),
    rightDenominator: finiteOptionalNumber(item.rightDenominator),
    leftCrossProduct: finiteOptionalNumber(item.leftCrossProduct),
    rightCrossProduct: finiteOptionalNumber(item.rightCrossProduct),
    normalizedLeftFraction: item.normalizedLeftFraction || null,
    normalizedRightFraction: item.normalizedRightFraction || null,
    equalityState: typeof item.equalityState === "boolean" ? item.equalityState : null,
    modelKey: item.modelKey || null,
    orientation: item.orientation || null,
    value: finiteOptionalNumber(item.value),
    numberWord: item.numberWord || null,
    numberWordMode: item.numberWordMode || null,
    numeral: item.numeral || null,
    taskDirection: item.taskDirection || null,
    representedValue: finiteOptionalNumber(item.representedValue),
    frameCount: finiteOptionalNumber(item.frameCount),
    dotArrangement: item.dotArrangement || null,
    selectionMode: item.selectionMode || null,
    hundreds: finiteOptionalNumber(item.hundreds),
    tens: finiteOptionalNumber(item.tens),
    ones: finiteOptionalNumber(item.ones),
    labelMode: item.labelMode || null,
    a: item.a,
    b: item.b,
    op: item.op,
    isExample: Boolean(item.isExample),
    sequence: Array.isArray(item.sequence) ? item.sequence : null,
    missingIndex: finiteOptionalNumber(item.missingIndex),
    missingIndexes: Array.isArray(item.missingIndexes)
      ? item.missingIndexes.map(finiteOptionalNumber).filter((n) => n !== null)
      : null,
    step: finiteOptionalNumber(item.step),
    patternKind: item.patternKind || null,
    patternRule: item.patternRule || null,
    patternOperation: item.patternOperation || null,
    continuationCount: finiteOptionalNumber(item.continuationCount),
    continuationAnswers: Array.isArray(item.continuationAnswers) ? item.continuationAnswers : null,
    missingTermPlacement: item.missingTermPlacement || null,
    operation: item.operation || null,
    minuend: finiteOptionalNumber(item.minuend),
    subtrahend: finiteOptionalNumber(item.subtrahend),
    difference: finiteOptionalNumber(item.difference),
    firstAddend: finiteOptionalNumber(item.firstAddend),
    secondAddend: finiteOptionalNumber(item.secondAddend),
    total: finiteOptionalNumber(item.total),
    missingPosition: item.missingPosition || null,
    missingValue: finiteOptionalNumber(item.missingValue),
    leftValue: finiteOptionalNumber(item.leftValue),
    rightValue: finiteOptionalNumber(item.rightValue),
    expectedSymbol: item.expectedSymbol || null,
    comparisonResult: item.comparisonResult || null,
    graphData: item.graphData || null,
    graphTaskData: item.graphTaskData || null,
    graphQuestionType: item.graphQuestionType || null,
    graphCategory: item.graphCategory || null,
    fractionModel: item.fractionModel || null,
    fractionWorkedModel: item.fractionWorkedModel || null,
    answerState: item.answerState || null,
    layoutVariant: item.layoutVariant || null,
    duplicateSignature: item.duplicateSignature || null,
    relatedDuplicateSignature: item.relatedDuplicateSignature || null,
    diagnostics: Array.isArray(item.diagnostics) ? item.diagnostics : null,
    ...(item.contextId !== undefined ? {
      contextId: item.contextId || null,
      templateId: item.templateId || null,
      storyType: item.storyType || null,
      unknownPosition: item.unknownPosition || null,
      operationFamily: item.operationFamily || null,
      knownAddend: finiteOptionalNumber(item.knownAddend)
    } : {}),
    visual: normalizeVisual(item.visual),
    meta: {
      grade: meta.grade ?? item.grade ?? null,
      strand: meta.strand ?? item.strand ?? null,
      expectation: meta.expectation ?? item.expectation ?? null,
      skill: meta.skill ?? item.skill ?? null
    }
  };
}

function normalizeWorksheetContent(contentObject = {}) {
  const meta = contentObject.meta || {};
  const rawItems =
    contentObject?.content?.items?.length
      ? contentObject.content.items
      : contentObject?.problems || [];

  const normalizedItems = rawItems.map((item, index) =>
    normalizeItem(item, index, meta)
  );

  return {
    ...contentObject,
    content: {
      ...(contentObject.content || {}),
      items: normalizedItems
    }
  };
}

module.exports = {
  normalizeWorksheetContent
};
