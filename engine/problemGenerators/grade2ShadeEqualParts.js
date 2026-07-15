const RESOURCE_ID = "grade2_fraction_equivalence_shade_fraction_models";
const TASK_MODE = "shade_equal_parts";
const QUESTION_COUNT = 8;
const ALLOWED_DENOMINATORS = Object.freeze([2, 3, 4, 6]);
const FRACTION_TARGETS = Object.freeze([
  Object.freeze({ numerator: 1, denominator: 2 }),
  Object.freeze({ numerator: 1, denominator: 3 }),
  Object.freeze({ numerator: 2, denominator: 3 }),
  Object.freeze({ numerator: 1, denominator: 4 }),
  Object.freeze({ numerator: 2, denominator: 4 }),
  Object.freeze({ numerator: 3, denominator: 4 }),
  Object.freeze({ numerator: 1, denominator: 6 }),
  Object.freeze({ numerator: 2, denominator: 6 })
]);

function shuffle(values, random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function buildFraction(numerator, denominator) {
  return {
    numerator,
    denominator,
    symbol: `${numerator}/${denominator}`
  };
}

function buildStrip(partitionCount, wholeId) {
  return {
    kind: "fraction_strip",
    wholeId,
    wholeSizeId: "grade2-standard-strip",
    wholeWidthUnits: 1,
    wholeHeightUnits: 1,
    partitionCount,
    shadedParts: 0
  };
}

function buildItems(random) {
  return shuffle(FRACTION_TARGETS, random).map((target, index) => {
    const requestedFraction = buildFraction(target.numerator, target.denominator);
    const model = buildStrip(target.denominator, `grade2-shade-${index + 1}`);
    const fractionModel = {
      kind: "fraction_strip",
      modelType: "strip",
      taskMode: TASK_MODE,
      numerator: target.numerator,
      denominator: target.denominator,
      partCount: target.denominator,
      shadeCount: target.numerator,
      requestedFraction,
      models: [model]
    };

    return {
      type: "equation",
      prompt: requestedFraction.symbol,
      answer: requestedFraction.symbol,
      responseMode: "shade_model",
      responseType: "drawing",
      taskMode: TASK_MODE,
      layoutVariant: "fraction_strip_grid",
      fractionModel,
      fractionWorkedModel: null,
      answerState: { shadedParts: target.numerator },
      visual: { kind: "fraction_strip", data: fractionModel },
      duplicateSignature: `grade2_fraction:shade:${requestedFraction.symbol}`
    };
  });
}

function generateGrade2ShadeEqualPartsProblem(options = {}) {
  if (options.worksheetId !== RESOURCE_ID) {
    throw new Error(`Unsupported Grade 2 shade worksheet '${options.worksheetId || ""}'.`);
  }
  if (Number(options.studentQuestionCount || options.questionCount) !== QUESTION_COUNT) {
    throw new Error(`Grade 2 Shade Equal Parts requires exactly ${QUESTION_COUNT} student items.`);
  }

  const generatorState = options.generatorState || {};
  if (!generatorState.grade2ShadeEqualParts) {
    const random = typeof options.random === "function" ? options.random : () => 0.5;
    generatorState.grade2ShadeEqualParts = buildItems(random);
  }
  const next = generatorState.grade2ShadeEqualParts.shift();
  if (!next) throw new Error("No unused Grade 2 Shade Equal Parts items remain.");
  return next;
}

function validateGrade2ShadeEqualPartsWorksheet(worksheetId, problems = []) {
  if (worksheetId !== RESOURCE_ID) return true;
  if (!Array.isArray(problems) || problems.length !== QUESTION_COUNT) {
    throw new Error(`Grade 2 Shade Equal Parts requires exactly ${QUESTION_COUNT} items.`);
  }

  const fractions = new Set();
  const denominators = new Set();
  problems.forEach((problem, index) => {
    if (Array.isArray(problem)) {
      throw new Error(`Grade 2 Shade Equal Parts item ${index + 1} has an unsupported array shape.`);
    }
    const truth = problem.fractionModel;
    const model = truth?.models?.[0];
    if (
      truth?.kind !== "fraction_strip" ||
      truth.modelType !== "strip" ||
      problem.visual?.kind !== "fraction_strip" ||
      problem.taskMode !== TASK_MODE ||
      problem.layoutVariant !== "fraction_strip_grid"
    ) {
      throw new Error(`Grade 2 Shade Equal Parts item ${index + 1} is missing structured fraction-strip truth.`);
    }
    if (!ALLOWED_DENOMINATORS.includes(truth.denominator)) {
      throw new Error(`Grade 2 Shade Equal Parts item ${index + 1} has an unsupported denominator.`);
    }
    if (!Number.isInteger(truth.numerator) || truth.numerator < 1 || truth.numerator > truth.denominator) {
      throw new Error(`Grade 2 Shade Equal Parts item ${index + 1} has an invalid numerator.`);
    }
    if (
      truth.partCount !== truth.denominator ||
      truth.shadeCount !== truth.numerator ||
      model?.partitionCount !== truth.denominator ||
      model?.shadedParts !== 0 ||
      problem.answerState?.shadedParts !== truth.numerator ||
      problem.prompt !== `${truth.numerator}/${truth.denominator}`
    ) {
      throw new Error(`Grade 2 Shade Equal Parts item ${index + 1} has inconsistent model or answer truth.`);
    }
    if (problem.fractionWorkedModel || problem.isExample) {
      throw new Error(`Grade 2 Shade Equal Parts item ${index + 1} must not be a completed example.`);
    }
    fractions.add(problem.prompt);
    denominators.add(truth.denominator);
  });

  if (fractions.size !== QUESTION_COUNT || denominators.size !== ALLOWED_DENOMINATORS.length) {
    throw new Error("Grade 2 Shade Equal Parts requires eight unique fractions across denominators 2, 3, 4, and 6.");
  }
  return true;
}

module.exports = {
  RESOURCE_ID,
  TASK_MODE,
  QUESTION_COUNT,
  ALLOWED_DENOMINATORS,
  FRACTION_TARGETS,
  buildItems,
  generateGrade2ShadeEqualPartsProblem,
  validateGrade2ShadeEqualPartsWorksheet
};
