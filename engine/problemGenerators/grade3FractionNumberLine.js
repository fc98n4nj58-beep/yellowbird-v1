const RESOURCE_ID = "grade3_fraction_equivalence_fraction_number_line";
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
        throw new Error("Selected Grade 3 number-line fractions must use integer numerator/denominator values.");
      }
      fractions.push({ numerator, denominator });
      return;
    }
    const match = String(value).trim().match(/^(\d+)\/(\d+)$/);
    if (!match) {
      throw new Error("Selected Grade 3 number-line fractions must use numerator/denominator format.");
    }
    fractions.push({ numerator: Number(match[1]), denominator: Number(match[2]) });
  });
  return fractions;
}

function gcd(a, b) {
  let left = Math.abs(a);
  let right = Math.abs(b);
  while (right) [left, right] = [right, left % right];
  return left || 1;
}

function simplifiedFraction(numerator, denominator) {
  if (numerator === 0) return "0";
  if (numerator === denominator) return "1";
  const divisor = gcd(numerator, denominator);
  return `${numerator / divisor}/${denominator / divisor}`;
}

function fractionLabels(denominator) {
  return Array.from({ length: denominator + 1 }, (_, index) => {
    if (index === 0) return "0";
    if (index === denominator) return "1";
    return `${index}/${denominator}`;
  });
}

function buildCandidates(options = {}) {
  const denominators = resolveDenominators(options);
  const allowEndpoints = Boolean(options.allowEndpointTargets);
  const selectedFractions = normalizeFractionList(options.selectedFractions, options.fractions);

  if (selectedFractions.length) {
    const signatures = new Set();
    return selectedFractions.map((fraction) => {
      if (!SAFE_DENOMINATORS.includes(fraction.denominator)) {
        throw new Error(DENOMINATOR_ERROR);
      }
      if (!denominators.includes(fraction.denominator)) {
        throw new Error("Selected Grade 3 number-line fractions must use an allowed denominator.");
      }
      const minimum = allowEndpoints ? 0 : 1;
      const maximum = allowEndpoints ? fraction.denominator : fraction.denominator - 1;
      if (fraction.numerator < minimum || fraction.numerator > maximum) {
        throw new Error("Selected Grade 3 number-line fractions violate the endpoint policy.");
      }
      const signature = `${fraction.numerator}/${fraction.denominator}`;
      if (signatures.has(signature)) {
        throw new Error("Selected Grade 3 number-line fractions must be unique.");
      }
      signatures.add(signature);
      return fraction;
    });
  }

  return denominators.flatMap((denominator) => {
    const start = allowEndpoints ? 0 : 1;
    const end = allowEndpoints ? denominator : denominator - 1;
    return Array.from({ length: end - start + 1 }, (_, offset) => ({ numerator: start + offset, denominator }));
  });
}

function buildPool(options = {}) {
  const random = options.random || Math.random;
  const count = Math.max(1, finiteInteger(options.questionCount, 6));
  const candidates = buildCandidates(options);
  const byDenominator = new Map();
  candidates.forEach((candidate) => {
    if (!byDenominator.has(candidate.denominator)) byDenominator.set(candidate.denominator, []);
    byDenominator.get(candidate.denominator).push(candidate);
  });
  const groups = shuffle([...byDenominator.entries()], random)
    .map(([denominator, values]) => [denominator, shuffle(values, random)]);
  const result = [];
  while (result.length < count && groups.some(([, values]) => values.length)) {
    for (const [, values] of groups) {
      if (values.length && result.length < count) result.push(values.shift());
    }
  }
  if (result.length !== count) {
    throw new Error("The selected Grade 3 fraction-number-line set does not provide enough unique targets.");
  }
  return result;
}

function generateGrade3FractionNumberLineProblem(options = {}) {
  if (options.worksheetId !== RESOURCE_ID) {
    throw new Error("The Grade 3 Fraction Number Line adapter is resource-scoped.");
  }
  const requestedMode = String(options.taskMode || "identify").trim().toLowerCase();
  if (!["identify", "identify_marked_fraction"].includes(requestedMode)) {
    throw new Error("Grade 3 Fraction Number Line supports identify-the-marked-fraction mode only.");
  }
  const state = options.generatorState || {};
  if (!state.grade3FractionNumberLinePool) {
    state.grade3FractionNumberLinePool = buildPool(options);
    state.grade3FractionNumberLineIndex = 0;
  }
  const target = state.grade3FractionNumberLinePool[state.grade3FractionNumberLineIndex++];
  if (!target) throw new Error("Grade 3 Fraction Number Line exhausted its structured target pool.");

  const labels = fractionLabels(target.denominator);
  const answer = labels[target.numerator];
  return {
    type: "equation",
    prompt: "",
    answer,
    wholeStart: 0,
    wholeEnd: 1,
    numerator: target.numerator,
    denominator: target.denominator,
    targetNumerator: target.numerator,
    targetDenominator: target.denominator,
    partCount: target.denominator,
    intervalCount: target.denominator,
    tickCount: target.denominator,
    targetIndex: target.numerator,
    targetValue: target.numerator / target.denominator,
    interval: 1 / target.denominator,
    minValue: 0,
    maxValue: 1,
    endpointPolicy: options.allowEndpointTargets ? "allowed" : "interior_only",
    displayedFractionLabels: labels,
    simplifiedDisplayFraction: simplifiedFraction(target.numerator, target.denominator),
    responseTarget: "fraction_number_line_value",
    responseValues: [target.numerator, target.denominator],
    taskMode: "identify_marked_fraction",
    duplicateSignature: `grade3_fraction_number_line:${target.numerator}/${target.denominator}`,
    answerState: { numerator: target.numerator, denominator: target.denominator, answer },
    visual: {
      kind: "number_line",
      data: {
        min: 0,
        max: 1,
        value: target.numerator / target.denominator,
        interval: 1 / target.denominator,
        tickCount: target.denominator,
        targetIndex: target.numerator,
        hideValueLabel: true,
        fractionLabels: labels,
        fractionDenominator: target.denominator
      }
    }
  };
}

function validateGrade3FractionNumberLineWorksheet(resourceId, problems = []) {
  if (resourceId !== RESOURCE_ID) return;
  if (!problems.length) throw new Error("Grade 3 Fraction Number Line generated no problems.");
  const signatures = new Set();
  problems.forEach((problem) => {
    if (problem.wholeStart !== 0 || problem.wholeEnd !== 1 ||
        !SAFE_DENOMINATORS.includes(problem.denominator) ||
        problem.intervalCount !== problem.denominator || problem.tickCount !== problem.denominator ||
        problem.targetIndex !== problem.numerator || problem.targetNumerator !== problem.numerator ||
        problem.targetDenominator !== problem.denominator) {
      throw new Error("Grade 3 Fraction Number Line lost structured partition truth.");
    }
    if (Math.abs(problem.targetValue - problem.targetIndex * problem.interval) > 1e-12 ||
        Math.abs(problem.maxValue - problem.minValue - problem.interval * problem.tickCount) > 1e-12) {
      throw new Error("Grade 3 Fraction Number Line target arithmetic is inconsistent.");
    }
    if (!Array.isArray(problem.displayedFractionLabels) ||
        problem.displayedFractionLabels.length !== problem.denominator + 1 ||
        problem.answer !== problem.displayedFractionLabels[problem.targetIndex]) {
      throw new Error("Grade 3 Fraction Number Line label and answer truth is inconsistent.");
    }
    if (!problem.duplicateSignature || signatures.has(problem.duplicateSignature)) {
      throw new Error("Grade 3 Fraction Number Line contains a duplicate target.");
    }
    signatures.add(problem.duplicateSignature);
  });
}

module.exports = {
  RESOURCE_ID,
  SAFE_DENOMINATORS,
  generateGrade3FractionNumberLineProblem,
  validateGrade3FractionNumberLineWorksheet
};
