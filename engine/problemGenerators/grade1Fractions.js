const RESOURCE_TASKS = Object.freeze({
  grade1_fraction_equivalence_shade_fraction_models: "shade_equal_parts",
  grade1_fraction_equivalence_match_equivalent_fractions: "half_two_fourths",
  grade1_fraction_equivalence_compare_fractions: "compare_fair_shares",
  grade1_fraction_equivalence_fraction_word_problems: "share_fairly"
});

const TASK_COUNTS = Object.freeze({
  shade_equal_parts: 6,
  half_two_fourths: 6,
  compare_fair_shares: 8,
  share_fairly: 3
});

const SAFE_FRACTIONS = Object.freeze([
  Object.freeze({ numerator: 1, denominator: 2, words: "one half" }),
  Object.freeze({ numerator: 1, denominator: 3, words: "one third" }),
  Object.freeze({ numerator: 1, denominator: 4, words: "one fourth" }),
  Object.freeze({ numerator: 2, denominator: 4, words: "two fourths" }),
  Object.freeze({ numerator: 3, denominator: 4, words: "three fourths" })
]);

const FAIR_SHARE_OBJECTS = Object.freeze({
  apple: Object.freeze({
    objectType: "apple",
    wholeShape: "apple_whole",
    halfShape: "apple_semicircle",
    singularNoun: "apple",
    pluralNoun: "apples",
    canSplitIntoHalves: true,
    splitVerb: "cut"
  }),
  sandwich: Object.freeze({
    objectType: "sandwich",
    wholeShape: "sandwich_rectangle",
    halfShape: "sandwich_triangle",
    singularNoun: "sandwich",
    pluralNoun: "sandwiches",
    canSplitIntoHalves: true,
    splitVerb: "cut"
  }),
  granola_bar: Object.freeze({
    objectType: "granola_bar",
    wholeShape: "granola_bar_rectangle",
    halfShape: "granola_bar_half_width_rectangle",
    singularNoun: "granola bar",
    pluralNoun: "granola bars",
    canSplitIntoHalves: true,
    splitVerb: "split"
  }),
  paper_strip: Object.freeze({
    objectType: "paper_strip",
    wholeShape: "paper_strip_rectangle",
    halfShape: "paper_strip_half_width_rectangle",
    singularNoun: "paper strip",
    pluralNoun: "paper strips",
    canSplitIntoHalves: true,
    splitVerb: "cut"
  })
});

function fraction(numerator, denominator) {
  const found = SAFE_FRACTIONS.find((entry) => (
    entry.numerator === numerator && entry.denominator === denominator
  ));
  if (found) return { ...found, symbol: `${numerator}/${denominator}` };
  return { numerator, denominator, words: `${numerator}/${denominator}`, symbol: `${numerator}/${denominator}` };
}

function shuffle(values, random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function strip(partitionCount, shadedParts, wholeId, wholeSizeId = "grade1-standard-strip") {
  return {
    kind: "fraction_strip",
    wholeId,
    wholeSizeId,
    wholeWidthUnits: 1,
    wholeHeightUnits: 1,
    partitionCount,
    shadedParts
  };
}

function visualFor(model) {
  return { kind: model.kind, data: model };
}

function shadeWorkedModel() {
  const requestedFraction = fraction(1, 2);
  return {
    taskMode: "shade_equal_parts",
    prompt: requestedFraction.words,
    requestedFraction,
    model: strip(2, 0, "shade-worked"),
    answerState: { shadedParts: 1 }
  };
}

function shareWorkedModel() {
  const truth = buildFairShareTruth({ objectType: "sandwich", wholeEquivalentTotal: 3, sharerCount: 2 });
  const model = { kind: "fair_share_set", wholeId: "share-worked", ...truth };
  return {
    taskMode: "share_fairly",
    prompt: buildFairSharePrompt(truth),
    model,
    answerState: buildFairShareAnswerState(truth)
  };
}

function buildShadeItems(random) {
  const targets = shuffle([
    fraction(1, 2),
    fraction(1, 4),
    fraction(2, 4),
    fraction(1, 3),
    fraction(1, 2),
    fraction(1, 4)
  ], random);

  return targets.map((requestedFraction, index) => {
    const fractionModel = {
      kind: "fraction_strip",
      taskMode: "shade_equal_parts",
      requestedFraction,
      models: [strip(requestedFraction.denominator, 0, `shade-${index + 1}`)]
    };
    return {
      type: "equation",
      prompt: requestedFraction.words,
      answer: requestedFraction.symbol,
      responseMode: "shade_model",
      responseType: "drawing",
      taskMode: "shade_equal_parts",
      layoutVariant: "fraction_strip_grid",
      fractionModel,
      fractionWorkedModel: index === 0 ? shadeWorkedModel() : null,
      answerState: { shadedParts: requestedFraction.numerator },
      visual: visualFor(fractionModel),
      duplicateSignature: `grade1_fraction:shade:${requestedFraction.symbol}:${index + 1}`
    };
  });
}

function buildMatchItems(random) {
  const definitions = shuffle([
    { left: fraction(1, 2), right: fraction(2, 4), answer: "Yes" },
    { left: fraction(1, 2), right: fraction(1, 4), answer: "No" },
    { left: fraction(1, 2), right: fraction(3, 4), answer: "No" },
    { left: fraction(2, 4), right: fraction(1, 2), answer: "Yes" },
    { left: fraction(1, 4), right: fraction(1, 2), answer: "No" },
    { left: fraction(3, 4), right: fraction(1, 2), answer: "No" }
  ], random);

  return definitions.map((definition, index) => {
    const wholeSizeId = `match-size-${index + 1}`;
    const fractionModel = {
      kind: "fraction_strip",
      taskMode: "half_two_fourths",
      models: [
        strip(definition.left.denominator, definition.left.numerator, `match-${index + 1}-left`, wholeSizeId),
        strip(definition.right.denominator, definition.right.numerator, `match-${index + 1}-right`, wholeSizeId)
      ],
      labels: [definition.left.words, definition.right.words]
    };
    return {
      type: "equation",
      prompt: "",
      answer: definition.answer,
      responseMode: "yes_no_choice",
      responseType: "choice",
      responseValues: ["Yes", "No"],
      taskMode: "half_two_fourths",
      layoutVariant: "fraction_strip_pairs",
      fractionModel,
      answerState: { choice: definition.answer },
      visual: visualFor(fractionModel),
      duplicateSignature: `grade1_fraction:match:${definition.left.symbol}:${definition.right.symbol}`
    };
  });
}

function compareAnswer(left, right) {
  const leftValue = left.numerator / left.denominator;
  const rightValue = right.numerator / right.denominator;
  if (leftValue === rightValue) return "Same";
  return leftValue > rightValue ? "left" : "right";
}

function buildCompareItems(random) {
  const definitions = shuffle([
    [fraction(1, 2), fraction(1, 4)],
    [fraction(1, 4), fraction(1, 2)],
    [fraction(1, 4), fraction(1, 4)],
    [fraction(2, 4), fraction(1, 2)],
    [fraction(1, 3), fraction(1, 4)],
    [fraction(1, 4), fraction(1, 3)],
    [fraction(2, 4), fraction(1, 4)],
    [fraction(1, 4), fraction(2, 4)]
  ], random);

  return definitions.map(([left, right], index) => {
    const answer = compareAnswer(left, right);
    const wholeSizeId = `compare-size-${index + 1}`;
    const fractionModel = {
      kind: "fraction_strip",
      taskMode: "compare_fair_shares",
      models: [
        strip(left.denominator, left.numerator, `compare-${index + 1}-left`, wholeSizeId),
        strip(right.denominator, right.numerator, `compare-${index + 1}-right`, wholeSizeId)
      ],
      labels: [left.words, right.words]
    };
    return {
      type: "equation",
      prompt: "",
      answer,
      responseMode: "three_way_choice",
      responseType: "choice",
      responseValues: ["left", "Same", "right"],
      taskMode: "compare_fair_shares",
      layoutVariant: "fraction_strip_grid",
      fractionModel,
      answerState: { choice: answer },
      visual: visualFor(fractionModel),
      duplicateSignature: `grade1_fraction:compare:${left.symbol}:${right.symbol}`
    };
  });
}

function getDivisibleFairShareObject(objectType) {
  const object = FAIR_SHARE_OBJECTS[objectType];
  if (!object || object.canSplitIntoHalves !== true) {
    throw new Error(`Unsupported divisible fair-sharing object '${objectType || ""}'.`);
  }
  return object;
}

function buildFairShareTruth({ objectType, wholeEquivalentTotal, sharerCount }) {
  const object = getDivisibleFairShareObject(objectType);
  if (![2, 4].includes(sharerCount)) {
    throw new Error(`Unsupported Grade 1 fair-sharing sharer count '${sharerCount}'.`);
  }
  const wholeObjectsPerSharer = Math.floor(wholeEquivalentTotal / sharerCount);
  const remainderWholeEquivalent = wholeEquivalentTotal % sharerCount;
  if (remainderWholeEquivalent !== sharerCount / 2) {
    throw new Error(`Fair-sharing total '${wholeEquivalentTotal}' cannot be shared using halves among ${sharerCount} children.`);
  }
  return {
    ...object,
    splitInstruction: `You may ${object.splitVerb} one ${object.singularNoun} into equal halves.`,
    wholeEquivalentTotal,
    objectTotal: wholeEquivalentTotal,
    sharerCount,
    wholeObjectsPerSharer,
    halfObjectsPerSharer: 1,
    remainderWholeEquivalent
  };
}

function buildFairSharePrompt(truth) {
  const preposition = truth.sharerCount === 2 ? "between" : "among";
  return `Share ${truth.wholeEquivalentTotal} ${truth.pluralNoun} equally ${preposition} ${truth.sharerCount} children. ${truth.splitInstruction}`;
}

function buildFairShareAnswerState(truth) {
  return {
    trayWholeObjects: Array(truth.sharerCount).fill(truth.wholeObjectsPerSharer),
    trayHalfObjects: Array(truth.sharerCount).fill(truth.halfObjectsPerSharer),
    sourceWholeEquivalentUsed: truth.wholeEquivalentTotal
  };
}

function buildShareItems(random) {
  const definitions = shuffle([
    { objectType: "apple", wholeEquivalentTotal: 5, sharerCount: 2 },
    { objectType: "granola_bar", wholeEquivalentTotal: 10, sharerCount: 4 },
    { objectType: "paper_strip", wholeEquivalentTotal: 7, sharerCount: 2 }
  ], random);

  return definitions.map((definition, index) => {
    const truth = buildFairShareTruth(definition);
    const fractionModel = {
      kind: "fair_share_set",
      taskMode: "share_fairly",
      wholeId: `share-${index + 1}`,
      ...truth
    };
    const prompt = buildFairSharePrompt(truth);
    return {
      type: "equation",
      prompt,
      answer: `${truth.wholeObjectsPerSharer} whole ${truth.wholeObjectsPerSharer === 1 ? truth.singularNoun : truth.pluralNoun} and 1 half ${truth.singularNoun} each`,
      responseMode: "fair_share_drawing",
      responseType: "drawing",
      taskMode: "share_fairly",
      layoutVariant: "fair_share_rows",
      fractionModel,
      fractionWorkedModel: index === 0 ? shareWorkedModel() : null,
      answerState: buildFairShareAnswerState(truth),
      visual: visualFor(fractionModel),
      duplicateSignature: `grade1_fraction:share:${truth.wholeEquivalentTotal}:${truth.sharerCount}:${truth.objectType}`
    };
  });
}

function buildTaskItems(taskMode, random) {
  if (taskMode === "shade_equal_parts") return buildShadeItems(random);
  if (taskMode === "half_two_fourths") return buildMatchItems(random);
  if (taskMode === "compare_fair_shares") return buildCompareItems(random);
  if (taskMode === "share_fairly") return buildShareItems(random);
  throw new Error(`Unsupported Grade 1 fraction task '${taskMode || ""}'.`);
}

function isGrade1FractionWorksheet(options = {}) {
  return Boolean(RESOURCE_TASKS[options.worksheetId]);
}

function generateGrade1FractionProblem(options = {}) {
  const taskMode = RESOURCE_TASKS[options.worksheetId];
  if (!taskMode) throw new Error(`Unsupported Grade 1 fraction worksheet '${options.worksheetId || ""}'.`);
  const expectedCount = TASK_COUNTS[taskMode];
  if (Number(options.studentQuestionCount || options.questionCount) !== expectedCount) {
    throw new Error(`Grade 1 fraction task '${taskMode}' requires exactly ${expectedCount} student items.`);
  }

  const generatorState = options.generatorState || {};
  generatorState.grade1Fractions = generatorState.grade1Fractions || {};
  if (!generatorState.grade1Fractions[taskMode]) {
    generatorState.grade1Fractions[taskMode] = buildTaskItems(taskMode, options.random || Math.random);
  }
  const next = generatorState.grade1Fractions[taskMode].shift();
  if (!next) throw new Error(`No unused Grade 1 fraction items remain for '${taskMode}'.`);
  return next;
}

function validateGrade1FractionWorksheet(worksheetId, problems = []) {
  const taskMode = RESOURCE_TASKS[worksheetId];
  if (!taskMode) return true;
  const expectedCount = TASK_COUNTS[taskMode];
  if (!Array.isArray(problems) || problems.length !== expectedCount) {
    throw new Error(`Grade 1 fraction validation failed: '${worksheetId}' requires exactly ${expectedCount} items.`);
  }
  const expectedKind = taskMode === "share_fairly" ? "fair_share_set" : "fraction_strip";
  problems.forEach((problem, index) => {
    if (Array.isArray(problem)) {
      throw new Error(`Grade 1 fraction validation failed: item ${index + 1} has an unsupported array shape.`);
    }
    if (problem.taskMode !== taskMode || problem.fractionModel?.kind !== expectedKind || problem.visual?.kind !== expectedKind) {
      throw new Error(`Grade 1 fraction validation failed: item ${index + 1} is missing its structured ${expectedKind} model.`);
    }
    if (!problem.answerState || !problem.layoutVariant) {
      throw new Error(`Grade 1 fraction validation failed: item ${index + 1} is missing answer or layout state.`);
    }
    if (taskMode === "share_fairly") {
      const model = problem.fractionModel;
      getDivisibleFairShareObject(model.objectType);
      if (!model.splitInstruction || model.halfObjectsPerSharer !== 1 || model.remainderWholeEquivalent !== model.sharerCount / 2) {
        throw new Error(`Grade 1 fraction validation failed: item ${index + 1} is missing valid divisible-object half-sharing truth.`);
      }
      const distributed = problem.answerState.trayWholeObjects.reduce((sum, count) => sum + count, 0)
        + problem.answerState.trayHalfObjects.reduce((sum, count) => sum + count / 2, 0);
      if (distributed !== model.wholeEquivalentTotal) {
        throw new Error(`Grade 1 fraction validation failed: item ${index + 1} does not conserve whole-equivalent area.`);
      }
    }
  });
  return true;
}

module.exports = {
  RESOURCE_TASKS,
  TASK_COUNTS,
  SAFE_FRACTIONS,
  FAIR_SHARE_OBJECTS,
  fraction,
  strip,
  compareAnswer,
  buildShadeItems,
  buildMatchItems,
  buildCompareItems,
  buildShareItems,
  getDivisibleFairShareObject,
  buildFairShareTruth,
  isGrade1FractionWorksheet,
  generateGrade1FractionProblem,
  validateGrade1FractionWorksheet
};
