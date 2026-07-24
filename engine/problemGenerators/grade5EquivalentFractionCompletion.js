const RESOURCE_ID = "grade5_fraction_equivalence_match_equivalent_fractions";
const DEFAULT_QUESTION_COUNT = 36;
const MAXIMUM_QUESTION_COUNT = 36;
const SAFE_DENOMINATORS = Object.freeze([2, 3, 4, 5, 6, 8, 9, 10, 11, 12]);
const SAFE_MULTIPLIERS = Object.freeze([2, 3, 4, 5]);
const MISSING_POSITIONS = Object.freeze(["right_numerator", "right_denominator"]);

function finiteInteger(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number) : fallback;
}

function shuffle(values, random = Math.random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function rawList(...values) {
  return values.flatMap((value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") return value.split(/[\s,|]+/).filter(Boolean);
    return value == null ? [] : [value];
  });
}

function numberList(...values) {
  return [...new Set(rawList(...values).map(Number).filter(Number.isFinite).map(Math.round))];
}

function fractionList(...values) {
  return rawList(...values).map((value) => {
    if (value && typeof value === "object") {
      return {
        numerator: Number(value.numerator),
        denominator: Number(value.denominator)
      };
    }
    const match = String(value).trim().match(/^(\d+)\s*\/\s*(\d+)$/);
    if (!match) throw new Error("Grade 5 equivalent-fraction selections must use numerator/denominator format.");
    return { numerator: Number(match[1]), denominator: Number(match[2]) };
  });
}

function gcd(a, b) {
  let left = Math.abs(a);
  let right = Math.abs(b);
  while (right) [left, right] = [right, left % right];
  return left || 1;
}

function reducedFraction(numerator, denominator) {
  const divisor = gcd(numerator, denominator);
  return `${numerator / divisor}/${denominator / divisor}`;
}

function resolveMissingPositions(options = {}) {
  const requested = rawList(options.missingPositions, options.missingPosition)
    .map((value) => String(value).trim().toLowerCase());
  if (!requested.length || requested.includes("mixed")) return [...MISSING_POSITIONS];
  const aliases = {
    numerator: "right_numerator",
    denominator: "right_denominator",
    right_numerator: "right_numerator",
    right_denominator: "right_denominator"
  };
  const normalized = requested.map((value) => aliases[value]);
  if (normalized.some((value) => !value)) {
    throw new Error("Grade 5 equivalent-fraction missing positions must be numerator, denominator, or mixed.");
  }
  return [...new Set(normalized)];
}

function buildCandidates(options = {}) {
  const requestedDenominators = numberList(
    options.selectedDenominators,
    options.denominators,
    options.allowedDenominators
  );
  const denominators = requestedDenominators.length ? requestedDenominators : [...SAFE_DENOMINATORS];
  if (denominators.some((value) => !SAFE_DENOMINATORS.includes(value))) {
    throw new Error(`Grade 5 equivalent fractions support base denominators ${SAFE_DENOMINATORS.join(", ")} only.`);
  }

  const requestedMultipliers = numberList(
    options.selectedMultipliers,
    options.multipliers,
    options.factors
  );
  const multipliers = requestedMultipliers.length ? requestedMultipliers : [...SAFE_MULTIPLIERS];
  if (multipliers.some((value) => !SAFE_MULTIPLIERS.includes(value))) {
    throw new Error(`Grade 5 equivalent fractions support multipliers ${SAFE_MULTIPLIERS.join(", ")} only.`);
  }

  const selectedFractions = fractionList(options.selectedFractions, options.fractions);
  const selectedNumerators = numberList(options.selectedNumerators, options.numerators);
  const minNumerator = Math.max(1, finiteInteger(options.minNumerator, 1));
  const maxNumerator = Math.max(minNumerator, finiteInteger(options.maxNumerator, 11));
  const fractions = selectedFractions.length
    ? selectedFractions
    : denominators.flatMap((denominator) => (
      Array.from({ length: denominator - 1 }, (_, index) => index + 1)
        .filter((numerator) => (
          numerator >= minNumerator &&
          numerator <= maxNumerator &&
          (!selectedNumerators.length || selectedNumerators.includes(numerator))
        ))
        .map((numerator) => ({ numerator, denominator }))
    ));
  const uniqueFractions = new Map();
  fractions.forEach((fraction) => {
    if (
      !Number.isInteger(fraction.numerator) ||
      !Number.isInteger(fraction.denominator) ||
      !denominators.includes(fraction.denominator) ||
      fraction.numerator < 1 ||
      fraction.numerator >= fraction.denominator
    ) {
      throw new Error("Grade 5 equivalent-fraction selections must be valid proper fractions with an allowed denominator.");
    }
    uniqueFractions.set(`${fraction.numerator}/${fraction.denominator}`, fraction);
  });

  const positions = resolveMissingPositions(options);
  return [...uniqueFractions.values()].flatMap((fraction) => (
    multipliers.flatMap((multiplier) => (
      positions.map((missingPosition) => ({
        ...fraction,
        multiplier,
        missingPosition
      }))
    ))
  ));
}

function buildPool(options = {}) {
  const random = options.random || Math.random;
  const count = Math.max(1, finiteInteger(options.questionCount, DEFAULT_QUESTION_COUNT));
  const candidates = buildCandidates(options);
  if (candidates.length < count) {
    throw new Error(`Grade 5 equivalent fractions need ${count} unique equations; the selected contract provides ${candidates.length}.`);
  }

  const byPosition = new Map(MISSING_POSITIONS.map((position) => [position, []]));
  shuffle(candidates, random).forEach((candidate) => byPosition.get(candidate.missingPosition).push(candidate));
  const activePositions = MISSING_POSITIONS.filter((position) => byPosition.get(position).length);
  const result = [];
  while (result.length < count) {
    let added = false;
    for (const position of activePositions) {
      const candidate = byPosition.get(position).shift();
      if (candidate && result.length < count) {
        result.push(candidate);
        added = true;
      }
    }
    if (!added) break;
  }
  if (result.length !== count) {
    throw new Error("Grade 5 equivalent fractions exhausted the structured equation pool.");
  }
  return result;
}

function generateGrade5EquivalentFractionCompletionProblem(options = {}) {
  if (options.worksheetId !== RESOURCE_ID) {
    throw new Error("The Grade 5 equivalent-fraction completion adapter is resource-scoped.");
  }
  const state = options.generatorState || {};
  if (!state.grade5EquivalentFractionCompletionPool) {
    state.grade5EquivalentFractionCompletionPool = buildPool(options);
    state.grade5EquivalentFractionCompletionIndex = 0;
  }
  const candidate = state.grade5EquivalentFractionCompletionPool[
    state.grade5EquivalentFractionCompletionIndex++
  ];
  if (!candidate) throw new Error("Grade 5 equivalent fractions exhausted the structured equation pool.");

  const leftNumerator = candidate.numerator;
  const leftDenominator = candidate.denominator;
  const rightNumerator = leftNumerator * candidate.multiplier;
  const rightDenominator = leftDenominator * candidate.multiplier;
  const missingValue = candidate.missingPosition === "right_numerator"
    ? rightNumerator
    : rightDenominator;
  const rightDisplay = candidate.missingPosition === "right_numerator"
    ? `___/${rightDenominator}`
    : `${rightNumerator}/___`;
  const normalized = reducedFraction(leftNumerator, leftDenominator);

  return {
    type: "equation",
    prompt: `${leftNumerator}/${leftDenominator} = ${rightDisplay}`,
    answer: missingValue,
    acceptedAnswerVariants: [String(missingValue)],
    leftNumerator,
    leftDenominator,
    rightNumerator,
    rightDenominator,
    leftCrossProduct: leftNumerator * rightDenominator,
    rightCrossProduct: rightNumerator * leftDenominator,
    normalizedLeftFraction: normalized,
    normalizedRightFraction: normalized,
    multiplier: candidate.multiplier,
    missingPosition: candidate.missingPosition,
    missingValue,
    equalityState: true,
    responseTarget: "equivalent_fraction_missing_value",
    responseValues: [missingValue],
    duplicateSignature: [
      "grade5_equivalent_fraction_completion",
      `${leftNumerator}/${leftDenominator}`,
      candidate.multiplier,
      candidate.missingPosition
    ].join(":"),
    answerState: {
      leftNumerator,
      leftDenominator,
      rightNumerator,
      rightDenominator,
      leftCrossProduct: leftNumerator * rightDenominator,
      rightCrossProduct: rightNumerator * leftDenominator,
      multiplier: candidate.multiplier,
      missingPosition: candidate.missingPosition,
      missingValue,
      normalizedFraction: normalized,
      equalityState: true
    }
  };
}

function validateGrade5EquivalentFractionCompletionWorksheet(resourceId, problems = []) {
  if (resourceId !== RESOURCE_ID) return;
  if (!problems.length) throw new Error("Grade 5 equivalent fractions generated no problems.");
  const signatures = new Set();
  problems.forEach((problem, index) => {
    const integerFields = [
      problem.leftNumerator,
      problem.leftDenominator,
      problem.rightNumerator,
      problem.rightDenominator,
      problem.multiplier,
      problem.missingValue
    ];
    const expectedMissingValue = problem.missingPosition === "right_numerator"
      ? problem.rightNumerator
      : problem.missingPosition === "right_denominator"
        ? problem.rightDenominator
        : null;
    const leftProduct = problem.leftNumerator * problem.rightDenominator;
    const rightProduct = problem.rightNumerator * problem.leftDenominator;
    if (
      !integerFields.every(Number.isInteger) ||
      !SAFE_DENOMINATORS.includes(problem.leftDenominator) ||
      !SAFE_MULTIPLIERS.includes(problem.multiplier) ||
      problem.leftNumerator < 1 ||
      problem.leftNumerator >= problem.leftDenominator ||
      problem.rightNumerator !== problem.leftNumerator * problem.multiplier ||
      problem.rightDenominator !== problem.leftDenominator * problem.multiplier ||
      leftProduct !== rightProduct ||
      problem.leftCrossProduct !== leftProduct ||
      problem.rightCrossProduct !== rightProduct ||
      expectedMissingValue !== problem.missingValue ||
      problem.answer !== problem.missingValue ||
      problem.answerState?.missingValue !== problem.missingValue ||
      problem.answerState?.leftCrossProduct !== leftProduct ||
      problem.answerState?.rightCrossProduct !== rightProduct ||
      problem.equalityState !== true ||
      problem.answerState?.equalityState !== true ||
      problem.responseTarget !== "equivalent_fraction_missing_value" ||
      signatures.has(problem.duplicateSignature)
    ) {
      throw new Error(`Grade 5 equivalent-fraction item ${index + 1} has inconsistent structured truth.`);
    }
    signatures.add(problem.duplicateSignature);
  });
}

module.exports = {
  RESOURCE_ID,
  DEFAULT_QUESTION_COUNT,
  MAXIMUM_QUESTION_COUNT,
  SAFE_DENOMINATORS,
  SAFE_MULTIPLIERS,
  MISSING_POSITIONS,
  buildCandidates,
  generateGrade5EquivalentFractionCompletionProblem,
  validateGrade5EquivalentFractionCompletionWorksheet
};
