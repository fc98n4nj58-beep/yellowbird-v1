const RESOURCE_ID = "grade3_fraction_equivalence_compare_fractions";
const SAFE_DENOMINATORS = Object.freeze([2, 3, 4, 5, 6, 8]);
const DENOMINATOR_ERROR = "Grade 3 fractions support denominators 2, 3, 4, 5, 6, and 8 only.";

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

function gcd(a, b) {
  let left = Math.abs(a);
  let right = Math.abs(b);
  while (right) [left, right] = [right, left % right];
  return left || 1;
}

function normalizeNumberList(...values) {
  return [...new Set(values.flatMap((value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") return value.split(/[\s,|]+/);
    return value == null ? [] : [value];
  }).map(Number).filter(Number.isFinite).map(Math.round))];
}

function rawList(...values) {
  return values.flatMap((value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") return value.split(/[\s,|]+/).filter(Boolean);
    return value == null ? [] : [value];
  });
}

function resolveDenominators(options = {}) {
  const requested = rawList(options.selectedDenominators, options.denominators, options.allowedDenominators);
  if (!requested.length) return [...SAFE_DENOMINATORS];
  const denominators = requested.map((value) => Number(value));
  if (denominators.some((value) => !Number.isInteger(value) || !SAFE_DENOMINATORS.includes(value))) {
    throw new Error(DENOMINATOR_ERROR);
  }
  return [...new Set(denominators)];
}

function normalizeFractionList(...values) {
  const fractions = [];
  rawList(...values).forEach((value) => {
    if (value && typeof value === "object") {
      const numerator = Number(value.numerator);
      const denominator = Number(value.denominator);
      if (!Number.isInteger(numerator) || !Number.isInteger(denominator)) {
        throw new Error("Selected Grade 3 comparison fractions must use integer numerator/denominator values.");
      }
      fractions.push({ numerator, denominator });
      return;
    }
    const match = String(value).trim().match(/^(\d+)\/(\d+)$/);
    if (!match) {
      throw new Error("Selected Grade 3 comparison fractions must use numerator/denominator format.");
    }
    fractions.push({ numerator: Number(match[1]), denominator: Number(match[2]) });
  });
  return fractions;
}

function fractionKey(fraction) {
  return `${fraction.numerator}/${fraction.denominator}`;
}

function reducedFraction(fraction) {
  const divisor = gcd(fraction.numerator, fraction.denominator);
  return `${fraction.numerator / divisor}/${fraction.denominator / divisor}`;
}

function buildFractions(options = {}) {
  const selectedFractions = normalizeFractionList(options.selectedFractions, options.fractions);
  if (selectedFractions.length) {
    const unique = new Map();
    selectedFractions.forEach((fraction) => {
      if (!SAFE_DENOMINATORS.includes(fraction.denominator)) {
        throw new Error(DENOMINATOR_ERROR);
      }
      if (fraction.denominator < 2 || fraction.numerator < 1 || fraction.numerator >= fraction.denominator) {
        throw new Error("Grade 3 Compare Fractions supports proper fractions only.");
      }
      unique.set(fractionKey(fraction), fraction);
    });
    return [...unique.values()];
  }

  const denominators = resolveDenominators(options);
  const selectedNumerators = normalizeNumberList(options.selectedNumerators, options.numerators);
  const minNumerator = Math.max(1, finiteInteger(options.minNumerator, 1));
  const maxNumerator = Math.max(minNumerator, finiteInteger(options.maxNumerator, 7));
  const fractions = [];

  denominators.forEach((denominator) => {
    for (let numerator = 1; numerator < denominator; numerator += 1) {
      if (numerator < minNumerator || numerator > maxNumerator) continue;
      if (selectedNumerators.length && !selectedNumerators.includes(numerator)) continue;
      fractions.push({ numerator, denominator });
    }
  });

  if (fractions.length < 2) {
    throw new Error("Grade 3 Compare Fractions needs at least two valid proper fractions.");
  }
  return fractions;
}

function buildPairPools(options = {}) {
  const fractions = buildFractions(options);
  const equal = [];
  const unequal = [];

  for (let leftIndex = 0; leftIndex < fractions.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < fractions.length; rightIndex += 1) {
      const left = fractions[leftIndex];
      const right = fractions[rightIndex];
      const leftProduct = left.numerator * right.denominator;
      const rightProduct = right.numerator * left.denominator;
      const candidate = { left, right, leftProduct, rightProduct };
      (leftProduct === rightProduct ? equal : unequal).push(candidate);
    }
  }
  return { equal, unequal };
}

function orient(candidate, symbol) {
  const naturalSymbol = candidate.leftProduct < candidate.rightProduct ? "<" : candidate.leftProduct > candidate.rightProduct ? ">" : "=";
  if (symbol === "=" || naturalSymbol === symbol) return { ...candidate, symbol: naturalSymbol };
  return {
    left: candidate.right,
    right: candidate.left,
    leftProduct: candidate.rightProduct,
    rightProduct: candidate.leftProduct,
    symbol
  };
}

function buildPool(options = {}) {
  const random = options.random || Math.random;
  const count = Math.max(1, finiteInteger(options.questionCount, 12));
  const pools = buildPairPools(options);
  const numericEqualPairs = Number(options.equalPairs);
  const equalTarget = options.includeEqualPairs === false
    ? 0
    : Number.isFinite(numericEqualPairs)
      ? Math.max(0, Math.min(count, Math.round(numericEqualPairs)))
      : Math.round(count / 3);
  const unequalTarget = count - equalTarget;
  const lessTarget = Math.floor(unequalTarget / 2);
  const greaterTarget = unequalTarget - lessTarget;

  if (pools.equal.length < equalTarget || pools.unequal.length < unequalTarget) {
    throw new Error("The selected Grade 3 fraction set does not provide enough unique comparison pairs.");
  }

  const equal = shuffle(pools.equal, random).slice(0, equalTarget).map((candidate) => orient(candidate, "="));
  const unequal = shuffle(pools.unequal, random).slice(0, unequalTarget);
  const less = unequal.slice(0, lessTarget).map((candidate) => orient(candidate, "<"));
  const greater = unequal.slice(lessTarget, lessTarget + greaterTarget).map((candidate) => orient(candidate, ">"));
  const buckets = { "<": less, ">": greater, "=": equal };
  const result = [];

  while (result.length < count) {
    for (const symbol of ["<", ">", "="]) {
      if (buckets[symbol].length) result.push(buckets[symbol].shift());
    }
  }
  return result;
}

function generateGrade3CompareFractionsProblem(options = {}) {
  if (options.worksheetId !== RESOURCE_ID) {
    throw new Error("The Grade 3 Compare Fractions adapter is resource-scoped.");
  }
  const state = options.generatorState || {};
  if (!state.grade3CompareFractionsPool) {
    state.grade3CompareFractionsPool = buildPool(options);
    state.grade3CompareFractionsIndex = 0;
  }
  const candidate = state.grade3CompareFractionsPool[state.grade3CompareFractionsIndex++];
  if (!candidate) throw new Error("Grade 3 Compare Fractions exhausted its structured pair pool.");

  const left = candidate.left;
  const right = candidate.right;
  const canonicalPair = [fractionKey(left), fractionKey(right)].sort().join("|");
  return {
    type: "equation",
    prompt: `${fractionKey(left)}   ___   ${fractionKey(right)}`,
    answer: candidate.symbol,
    leftNumerator: left.numerator,
    leftDenominator: left.denominator,
    rightNumerator: right.numerator,
    rightDenominator: right.denominator,
    leftCrossProduct: candidate.leftProduct,
    rightCrossProduct: candidate.rightProduct,
    normalizedLeftFraction: reducedFraction(left),
    normalizedRightFraction: reducedFraction(right),
    expectedSymbol: candidate.symbol,
    equalityState: candidate.symbol === "=",
    responseTarget: "comparison_symbol",
    responseValues: [left.numerator, left.denominator, right.numerator, right.denominator],
    duplicateSignature: `grade3_fraction_compare:${canonicalPair}`,
    answerState: { symbol: candidate.symbol, leftCrossProduct: candidate.leftProduct, rightCrossProduct: candidate.rightProduct }
  };
}

function validateGrade3CompareFractionsWorksheet(resourceId, problems = []) {
  if (resourceId !== RESOURCE_ID) return;
  if (!problems.length) throw new Error("Grade 3 Compare Fractions generated no problems.");
  const signatures = new Set();
  problems.forEach((problem) => {
    const required = [problem.leftNumerator, problem.leftDenominator, problem.rightNumerator, problem.rightDenominator];
    if (!required.every(Number.isInteger)) throw new Error("Grade 3 Compare Fractions lost structured fraction truth.");
    if (problem.leftNumerator < 1 || problem.leftNumerator >= problem.leftDenominator ||
        problem.rightNumerator < 1 || problem.rightNumerator >= problem.rightDenominator) {
      throw new Error("Grade 3 Compare Fractions requires proper fractions.");
    }
    const leftProduct = problem.leftNumerator * problem.rightDenominator;
    const rightProduct = problem.rightNumerator * problem.leftDenominator;
    const symbol = leftProduct < rightProduct ? "<" : leftProduct > rightProduct ? ">" : "=";
    if (problem.leftCrossProduct !== leftProduct || problem.rightCrossProduct !== rightProduct ||
        problem.expectedSymbol !== symbol || problem.answer !== symbol) {
      throw new Error("Grade 3 Compare Fractions comparison truth is inconsistent.");
    }
    if (!problem.duplicateSignature || signatures.has(problem.duplicateSignature)) {
      throw new Error("Grade 3 Compare Fractions contains a duplicate pair.");
    }
    signatures.add(problem.duplicateSignature);
  });
}

module.exports = {
  RESOURCE_ID,
  SAFE_DENOMINATORS,
  generateGrade3CompareFractionsProblem,
  validateGrade3CompareFractionsWorksheet
};
