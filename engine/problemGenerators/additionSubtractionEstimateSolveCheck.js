"use strict";

const wordProblems = require("./wordProblems");

const FAMILY_ID = "addition_subtraction_estimate_solve_check";
const COMPOSITION_MODES = Object.freeze([
  "full_progression",
  "compute",
  "estimate",
  "apply",
  "reason_check",
  "integrated_mixed"
]);
const STANDALONE_COUNTS = Object.freeze({
  3: Object.freeze({ compute: 20, estimate: 12, apply: 6, reason_check: 8, integrated_mixed: 12 }),
  4: Object.freeze({ compute: 20, estimate: 12, apply: 6, reason_check: 8, integrated_mixed: 12 })
});
const FULL_PROGRESSION_COUNTS = Object.freeze({
  3: 58,
  4: 58
});

function randInt(min, max, random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function pick(values, random) {
  return values[Math.floor(random() * values.length)];
}

function roundToPlace(value, place) {
  return Math.floor((value + place / 2) / place) * place;
}

function formatScaled(value, decimalPlaces = 0) {
  if (!decimalPlaces) return Number(value).toLocaleString("en-CA");
  return (Number(value) / (10 ** decimalPlaces)).toFixed(decimalPlaces);
}

function hasRegrouping(a, b, operation) {
  if (operation === "add") {
    while (a > 0 || b > 0) {
      if ((a % 10) + (b % 10) >= 10) return true;
      a = Math.floor(a / 10);
      b = Math.floor(b / 10);
    }
    return false;
  }
  while (a > 0 || b > 0) {
    if (a % 10 < b % 10) return true;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return false;
}

function buildWholeOperation({ operation, minimum, maximum, resultCeiling, random, used }) {
  for (let attempt = 0; attempt < 5000; attempt += 1) {
    let a = randInt(minimum, maximum, random);
    let b = randInt(minimum, maximum, random);
    if (operation === "subtract" && b > a) [a, b] = [b, a];
    const answer = operation === "add" ? a + b : a - b;
    const signature = `whole:${operation}:${a}:${b}`;
    if (
      answer >= 0 && answer <= resultCeiling && a !== b &&
      hasRegrouping(a, b, operation) && !used.has(signature)
    ) {
      used.add(signature);
      return { a, b, answer, operation, decimalPlaces: 0 };
    }
  }
  throw new Error("Addition/subtraction progression could not build a unique regrouping task.");
}

function buildDecimalOperation({ operation, random, used }) {
  for (let attempt = 0; attempt < 5000; attempt += 1) {
    let a = randInt(120, 899, random);
    let b = randInt(21, 499, random);
    if (operation === "subtract" && b > a) [a, b] = [b, a];
    const answer = operation === "add" ? a + b : a - b;
    const signature = `decimal:${operation}:${a}:${b}`;
    if (answer >= 0 && answer <= 9999 && a % 10 !== 0 && b % 10 !== 0 && !used.has(signature)) {
      used.add(signature);
      return { a, b, answer, operation, decimalPlaces: 1 };
    }
  }
  throw new Error("Addition/subtraction progression could not build a unique decimal-tenths task.");
}

function operationSymbol(operation) {
  return operation === "add" ? "+" : "−";
}

function metadataFor({ grade, moduleId, decimalPlaces = 0, isIntegrated = false, progressionRole }) {
  return {
    family: FAMILY_ID,
    moduleId,
    numberDomain: decimalPlaces ? "decimal_tenths" : "whole_number",
    representation: decimalPlaces ? "place_aligned_decimal" : "whole_number",
    progressionRole,
    isIntegrated,
    gradeBand: `grade${grade}`
  };
}

function buildComputeItem(grade, operation, values, metadata = {}) {
  const decimalPlaces = values.decimalPlaces || 0;
  return {
    type: "equation",
    prompt: `${formatScaled(values.a, decimalPlaces)} ${operationSymbol(operation)} ${formatScaled(values.b, decimalPlaces)}`,
    answer: formatScaled(values.answer, decimalPlaces),
    taskMode: "compute",
    taskAction: decimalPlaces ? "decimal_tenths_computation" : "whole_number_computation",
    operation,
    a: decimalPlaces ? values.a / 10 : values.a,
    b: decimalPlaces ? values.b / 10 : values.b,
    responseTarget: decimalPlaces ? "place_aligned_decimal" : "numeric_line",
    responseType: "number",
    ...metadataFor({ grade, moduleId: "compute", decimalPlaces, ...metadata }),
    answerState: {
      activityModes: ["compute"],
      scaledA: values.a,
      scaledB: values.b,
      scaledAnswer: values.answer,
      decimalPlaces,
      operation,
      displayA: formatScaled(values.a, decimalPlaces),
      displayB: formatScaled(values.b, decimalPlaces),
      displayAnswer: formatScaled(values.answer, decimalPlaces)
    },
    duplicateSignature: `progression:compute:${decimalPlaces}:${operation}:${values.a}:${values.b}`
  };
}

function buildEstimateItem(grade, values, place, taskAction, metadata = {}) {
  const roundedA = roundToPlace(values.a, place);
  const roundedB = roundToPlace(values.b, place);
  const estimated = values.operation === "add" ? roundedA + roundedB : roundedA - roundedB;
  const decimalPlaces = values.decimalPlaces || 0;
  return {
    type: "equation",
    prompt: `${formatScaled(values.a, decimalPlaces)} ${operationSymbol(values.operation)} ${formatScaled(values.b, decimalPlaces)}`,
    answer: formatScaled(estimated, decimalPlaces),
    taskMode: "estimate",
    taskAction,
    operation: values.operation,
    a: decimalPlaces ? values.a / 10 : values.a,
    b: decimalPlaces ? values.b / 10 : values.b,
    interval: decimalPlaces ? place / 10 : place,
    responseTarget: "rounded_numbers_and_estimate",
    responseType: "structured_numbers",
    ...metadataFor({ grade, moduleId: "estimate", decimalPlaces, ...metadata }),
    answerState: {
      activityModes: ["estimate"],
      scaledA: values.a,
      scaledB: values.b,
      scaledAnswer: estimated,
      exactScaledAnswer: values.answer,
      roundedA,
      roundedB,
      roundingPlace: place,
      decimalPlaces,
      operation: values.operation,
      displayA: formatScaled(values.a, decimalPlaces),
      displayB: formatScaled(values.b, decimalPlaces),
      displayRoundedA: formatScaled(roundedA, decimalPlaces),
      displayRoundedB: formatScaled(roundedB, decimalPlaces),
      displayAnswer: formatScaled(estimated, decimalPlaces),
      displayExactAnswer: formatScaled(values.answer, decimalPlaces),
      responseTargets: {
        roundedA: formatScaled(roundedA, decimalPlaces),
        roundedB: formatScaled(roundedB, decimalPlaces),
        estimate: formatScaled(estimated, decimalPlaces)
      }
    },
    duplicateSignature: `progression:estimate:${decimalPlaces}:${values.operation}:${values.a}:${values.b}:${place}`
  };
}

function buildApplicationItem(grade, values, options, metadata = {}) {
  const context = wordProblems.pickAdditionSubtractionApplicationContext({ ...options, grade });
  const first = formatScaled(values.a);
  const second = formatScaled(values.b);
  const answer = formatScaled(values.answer);
  const plural = `${context.item}s`;
  const prompt = values.operation === "add"
    ? `${context.name} organized ${first} ${plural}, then ${second} more. How many ${plural} altogether?`
    : `${context.name} had ${first} ${plural} and used ${second}. How many ${plural} are left?`;
  return {
    type: "equation",
    prompt,
    answer,
    taskMode: "apply",
    taskAction: values.operation === "add" ? "choose_addition" : "choose_subtraction",
    operation: values.operation,
    a: values.a,
    b: values.b,
    responseTarget: "math_sentence_and_answer",
    responseType: "math_sentence_and_answer",
    ...metadataFor({ grade, moduleId: "apply", ...metadata }),
    answerState: {
      activityModes: ["apply"],
      exactAnswer: values.answer,
      displayAnswer: answer,
      contextId: context.id,
      operation: values.operation,
      displayMathSentence: `${first} ${operationSymbol(values.operation)} ${second} = ${answer}`,
      responseTargets: {
        mathSentence: `${first} ${operationSymbol(values.operation)} ${second} = ${answer}`,
        finalAnswer: answer
      }
    },
    duplicateSignature: `progression:apply:${context.id}:${values.operation}:${values.a}:${values.b}`
  };
}

function buildReasonItem(grade, values, random, expectedChoice, metadata = {}) {
  const decimalPlaces = values.decimalPlaces || 0;
  const exact = values.answer;
  const wrongOffset = decimalPlaces ? pick([90, 110, 150], random) : pick([90, 100, 110], random);
  const claimed = expectedChoice === "Yes" ? exact : exact + wrongOffset;
  const estimatePlace = decimalPlaces ? 10 : grade === 3 ? 100 : 1000;
  const roundedA = roundToPlace(values.a, estimatePlace);
  const roundedB = roundToPlace(values.b, estimatePlace);
  const estimate = values.operation === "add" ? roundedA + roundedB : roundedA - roundedB;
  const displayExact = formatScaled(exact, decimalPlaces);
  const sampleExplanation = expectedChoice === "Yes"
    ? `Yes. The exact answer is ${displayExact}, which is close to the estimate ${formatScaled(estimate, decimalPlaces)}.`
    : `No. The estimate is about ${formatScaled(estimate, decimalPlaces)}, and the exact answer is ${displayExact}.`;
  return {
    type: "equation",
    prompt: `A student says ${formatScaled(values.a, decimalPlaces)} ${operationSymbol(values.operation)} ${formatScaled(values.b, decimalPlaces)} = ${formatScaled(claimed, decimalPlaces)}. Is the answer reasonable?`,
    answer: expectedChoice,
    responseValues: ["Yes", "No"],
    taskMode: "reason_check",
    taskAction: expectedChoice === "Yes" ? "verify_correct_result" : decimalPlaces ? "identify_decimal_error" : "identify_whole_number_error",
    operation: values.operation,
    responseTarget: "reason_choice_and_line",
    responseType: "selection_and_explanation",
    ...metadataFor({ grade, moduleId: "reason_check", decimalPlaces, ...metadata }),
    answerState: {
      activityModes: ["reason_check", "explain"],
      expectedChoice,
      exactScaledAnswer: exact,
      claimedScaledAnswer: claimed,
      estimateScaledAnswer: estimate,
      decimalPlaces,
      displayExactAnswer: displayExact,
      displayClaimedAnswer: formatScaled(claimed, decimalPlaces),
      displayEstimate: formatScaled(estimate, decimalPlaces),
      sampleExplanation
    },
    duplicateSignature: `progression:reason:${decimalPlaces}:${values.operation}:${values.a}:${values.b}:${claimed}`
  };
}

function conceptModel(grade, moduleId) {
  const models = grade === 4
    ? {
        compute: { expression: "246.7 + 138.5", result: "385.2", cue: "Line up ones with ones and tenths with tenths." },
        estimate: { expression: "3,467 + 2,286", rounded: "3,000 + 2,000", result: "5,000", cue: "Round both numbers to the named place." },
        apply: { context: "A garden has 246.7 m of path and adds 138.5 m.", mathSentence: "246.7 + 138.5 = 385.2", result: "385.2 m" },
        reason_check: { claim: "246.7 + 138.5 = 485.2", estimate: "247 + 139 ≈ 386", decision: "No — 485.2 is not close to 386." },
        integrated_mixed: { cue: "Compute exactly, estimate, apply the operation, then check the result." }
      }
    : {
        compute: { expression: "398 + 247", result: "645", cue: "Line up each place and regroup when needed." },
        estimate: { expression: "347 + 286", rounded: "300 + 300", result: "600", cue: "Round both numbers to the named place." },
        apply: { context: "A class collected 398 cans, then 247 more.", mathSentence: "398 + 247 = 645", result: "645 cans" },
        reason_check: { claim: "398 + 247 = 745", estimate: "400 + 200 ≈ 600", decision: "No — 745 is not close to 600." },
        integrated_mixed: { cue: "Compute exactly, estimate, apply the operation, then check the result." }
      };
  return models[moduleId];
}

function wholeConfig(grade, operation) {
  if (grade === 3) {
    return operation === "add"
      ? { operation, minimum: 120, maximum: 470, resultCeiling: 1000 }
      : { operation, minimum: 180, maximum: 990, resultCeiling: 1000 };
  }
  return operation === "add"
    ? { operation, minimum: 1200, maximum: 4800, resultCeiling: 10000 }
    : { operation, minimum: 1800, maximum: 9800, resultCeiling: 10000 };
}

function buildComputeModule(grade, count, context, metadata = {}) {
  const items = [];
  for (let index = 0; index < count; index += 1) {
    const operation = index % 2 === 0 ? "add" : "subtract";
    const decimal = grade === 4 && index >= count / 2;
    const values = decimal
      ? buildDecimalOperation({ operation, random: context.random, used: context.used })
      : buildWholeOperation({ ...wholeConfig(grade, operation), random: context.random, used: context.used });
    items.push(buildComputeItem(grade, operation, values, metadata));
  }
  return items;
}

function buildEstimateModule(grade, count, context, metadata = {}) {
  const items = [];
  for (let index = 0; index < count; index += 1) {
    const operation = index % 2 === 0 ? "add" : "subtract";
    const decimal = grade === 4 && index >= count / 2;
    const values = decimal
      ? buildDecimalOperation({ operation, random: context.random, used: context.used })
      : buildWholeOperation({ ...wholeConfig(grade, operation), random: context.random, used: context.used });
    const place = decimal ? 10 : grade === 4 ? 1000 : index < count / 2 ? 100 : 10;
    const action = decimal
      ? "round_decimal_operands_to_nearest_whole_and_estimate"
      : grade === 4
        ? "round_operands_to_nearest_thousand_and_estimate"
        : place === 100 ? "round_operands_to_nearest_hundred_and_estimate" : "round_operands_to_nearest_ten_and_estimate";
    items.push(buildEstimateItem(grade, values, place, action, metadata));
  }
  return items;
}

function buildApplyModule(grade, count, context, options, metadata = {}) {
  return Array.from({ length: count }, (_, index) => {
    const operation = index % 2 === 0 ? "add" : "subtract";
    const values = buildWholeOperation({ ...wholeConfig(grade, operation), random: context.random, used: context.used });
    return buildApplicationItem(grade, values, options, metadata);
  });
}

function buildReasonModule(grade, count, context, metadata = {}) {
  return Array.from({ length: count }, (_, index) => {
    const operation = index % 2 === 0 ? "add" : "subtract";
    const decimal = grade === 4 && index >= count / 2;
    const values = decimal
      ? buildDecimalOperation({ operation, random: context.random, used: context.used })
      : buildWholeOperation({ ...wholeConfig(grade, operation), random: context.random, used: context.used });
    return buildReasonItem(grade, values, context.random, index % 3 === 0 ? "Yes" : "No", metadata);
  });
}

function buildIntegratedModule(grade, context, options, metadata = {}) {
  const integrated = { ...metadata, isIntegrated: true, progressionRole: "integrated_review", sequenceSection: "integrated_mixed" };
  return [
    ...buildComputeModule(grade, 4, context, integrated),
    ...buildEstimateModule(grade, 3, context, integrated),
    ...buildApplyModule(grade, 3, context, options, integrated),
    ...buildReasonModule(grade, 2, context, integrated)
  ];
}

function applySequenceMetadata(items, recipeId, sequenceSection) {
  return items.map((item) => ({
    ...item,
    recipeId,
    sequenceSection: sequenceSection || item.sequenceSection || item.moduleId
  }));
}

function expectedQuestionCount(grade, compositionMode) {
  if (compositionMode === "full_progression") return FULL_PROGRESSION_COUNTS[grade];
  return STANDALONE_COUNTS[grade][compositionMode];
}

function buildPool(options = {}) {
  const grade = Number(String(options.grade || "").replace(/\D/g, ""));
  const compositionMode = String(options.compositionMode || "full_progression").trim().toLowerCase();
  if (![3, 4].includes(grade)) throw new Error("Estimate, Solve, and Check supports Grades 3 and 4 only.");
  if (!COMPOSITION_MODES.includes(compositionMode)) throw new Error(`Unsupported Estimate, Solve, and Check composition mode '${compositionMode}'.`);
  const expectedCount = expectedQuestionCount(grade, compositionMode);
  if (Number(options.questionCount || expectedCount) !== expectedCount) {
    throw new Error(`Estimate, Solve, and Check mode '${compositionMode}' requires exactly ${expectedCount} tasks.`);
  }

  const context = { random: options.random || Math.random, used: new Set() };
  const counts = STANDALONE_COUNTS[grade];
  const baseMetadata = { isIntegrated: false };
  let pool;
  if (compositionMode === "compute") {
    pool = buildComputeModule(grade, counts.compute, context, { ...baseMetadata, progressionRole: "foundation" });
  } else if (compositionMode === "estimate") {
    pool = buildEstimateModule(grade, counts.estimate, context, { ...baseMetadata, progressionRole: "connection" });
  } else if (compositionMode === "apply") {
    pool = buildApplyModule(grade, counts.apply, context, options, { ...baseMetadata, progressionRole: "transfer" });
  } else if (compositionMode === "reason_check") {
    pool = buildReasonModule(grade, counts.reason_check, context, { ...baseMetadata, progressionRole: "verification" });
  } else if (compositionMode === "integrated_mixed") {
    pool = buildIntegratedModule(grade, context, options);
  } else {
    pool = [
      ...applySequenceMetadata(buildComputeModule(grade, counts.compute, context, { ...baseMetadata, progressionRole: "foundation" }), compositionMode, "compute"),
      ...applySequenceMetadata(buildEstimateModule(grade, counts.estimate, context, { ...baseMetadata, progressionRole: "connection" }), compositionMode, "estimate"),
      ...applySequenceMetadata(buildApplyModule(grade, counts.apply, context, options, { ...baseMetadata, progressionRole: "transfer" }), compositionMode, "apply"),
      ...applySequenceMetadata(buildReasonModule(grade, counts.reason_check, context, { ...baseMetadata, progressionRole: "verification" }), compositionMode, "reason_check"),
      ...applySequenceMetadata(buildIntegratedModule(grade, context, options), compositionMode, "integrated_mixed")
    ];
  }

  pool = applySequenceMetadata(pool, compositionMode);
  const sections = compositionMode === "full_progression"
    ? ["compute", "estimate", "apply", "reason_check", "integrated_mixed"]
    : [compositionMode];
  sections.forEach((section) => {
    const first = pool.find((item) => (
      compositionMode === "full_progression" ? item.sequenceSection === section : true
    ));
    if (first?.answerState) first.answerState.conceptModel = conceptModel(grade, section);
  });
  if (pool.length !== expectedCount) throw new Error("Estimate, Solve, and Check composition count is invalid.");
  if (new Set(pool.map((item) => item.duplicateSignature)).size !== pool.length) {
    throw new Error("Estimate, Solve, and Check generated duplicate tasks.");
  }
  return pool;
}

function generateAdditionSubtractionEstimateSolveCheck(options = {}) {
  const state = options.generatorState || {};
  if (!state.estimateSolveCheckPool?.length) state.estimateSolveCheckPool = buildPool(options);
  return state.estimateSolveCheckPool.shift();
}

module.exports = generateAdditionSubtractionEstimateSolveCheck;
module.exports.buildPool = buildPool;
module.exports.expectedQuestionCount = expectedQuestionCount;
module.exports.COMPOSITION_MODES = COMPOSITION_MODES;
module.exports.STANDALONE_COUNTS = STANDALONE_COUNTS;
module.exports.FULL_PROGRESSION_COUNTS = FULL_PROGRESSION_COUNTS;
module.exports.formatScaled = formatScaled;
module.exports.roundToPlace = roundToPlace;
