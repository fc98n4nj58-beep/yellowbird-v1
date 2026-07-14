const generateArithmeticProblem = require("../engines/arithmeticEngine");

const GRADE1_EQUATION_MATCH_ID = "grade1_addition_subtraction_facts_equation_match";

function finiteInteger(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.floor(number) : fallback;
}

function shuffle(values, random = Math.random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function expressionGroups(minimumResult, maximumResult) {
  const additions = new Map();
  const subtractions = new Map();

  for (let result = minimumResult; result <= maximumResult; result += 1) {
    additions.set(result, []);
    subtractions.set(result, []);
  }

  for (let a = 0; a <= 10; a += 1) {
    for (let b = 0; b <= 10; b += 1) {
      const result = a + b;
      if (additions.has(result)) {
        additions.get(result).push({ text: `${a} + ${b}`, value: result, operation: "addition", a, b });
      }
    }
  }

  for (let a = 0; a <= 20; a += 1) {
    for (let b = 0; b <= Math.min(10, a); b += 1) {
      const result = a - b;
      if (subtractions.has(result)) {
        subtractions.get(result).push({ text: `${a} - ${b}`, value: result, operation: "subtraction", a, b });
      }
    }
  }

  return { additions, subtractions };
}

function buildGrade1Candidates(options = {}) {
  const minimumResult = Math.max(0, finiteInteger(options.minimumResult, 0));
  const maximumResult = Math.min(
    20,
    Math.max(minimumResult + 1, finiteInteger(options.maximumResult ?? options.maxTotal, 20))
  );
  const { additions, subtractions } = expressionGroups(minimumResult, maximumResult);
  const equal = [];
  const notEqual = [];

  for (let result = minimumResult; result <= maximumResult; result += 1) {
    const add = additions.get(result) || [];
    const subtract = subtractions.get(result) || [];
    const pairCount = Math.min(3, add.length, subtract.length);

    for (let index = 0; index < pairCount; index += 1) {
      equal.push({ left: add[index], right: subtract[subtract.length - 1 - index], equivalent: true });
    }

    const differentResult = result < maximumResult ? result + 1 : result - 1;
    const differentSubtract = subtractions.get(differentResult) || [];
    const notEqualCount = Math.min(3, add.length, differentSubtract.length);

    for (let index = 0; index < notEqualCount; index += 1) {
      notEqual.push({
        left: add[add.length - 1 - index],
        right: differentSubtract[index],
        equivalent: false
      });
    }
  }

  return { equal, notEqual, minimumResult, maximumResult };
}

function buildBalancedPool(options = {}) {
  const random = options.random || Math.random;
  const candidates = buildGrade1Candidates(options);
  const equal = shuffle(candidates.equal, random);
  const notEqual = shuffle(candidates.notEqual, random);
  const pool = [];

  // Completed-example mode demonstrates both response states in a fixed order.
  // Reserve one candidate from each shuffled group so Q1 is equal and Q2 is not equal.
  if (options.includeExample && equal.length && notEqual.length) {
    pool.push(equal.shift(), notEqual.shift());
  }

  const count = Math.min(equal.length, notEqual.length);

  for (let index = 0; index < count; index += 1) {
    pool.push(index % 2 === 0 ? equal[index] : notEqual[index]);
    pool.push(index % 2 === 0 ? notEqual[index] : equal[index]);
  }

  return { ...candidates, pool };
}

function generateGrade1EquationMatch(options = {}) {
  const generatorState = options.generatorState || {};
  const built = buildGrade1Candidates(options);
  const poolKey = `grade1-equation-match:${built.minimumResult}:${built.maximumResult}`;

  if (!generatorState.equationMatchPools) generatorState.equationMatchPools = {};
  if (!generatorState.equationMatchPools[poolKey]?.length) {
    generatorState.equationMatchPools[poolKey] = buildBalancedPool(options).pool;
  }

  const candidate = generatorState.equationMatchPools[poolKey].shift();
  if (!candidate) throw new Error("No Grade 1 equation-match pairs are available.");

  const expectedSymbol = candidate.equivalent ? "=" : "≠";
  const left = candidate.left;
  const right = candidate.right;

  return {
    type: "equation",
    prompt: `${left.text}   ___   ${right.text}`,
    answer: expectedSymbol,
    responseMode: "equation_equivalence",
    responseValues: [expectedSymbol],
    expectedSymbol,
    comparisonResult: candidate.equivalent ? "equivalent" : "not_equivalent",
    leftExpression: left.text,
    rightExpression: right.text,
    leftValue: left.value,
    rightValue: right.value,
    equivalent: candidate.equivalent,
    duplicateSignature: `equation_match:${left.text}:${expectedSymbol}:${right.text}`
  };
}

function generateEquationMatchProblem(options = {}) {
  if (options.worksheetId === GRADE1_EQUATION_MATCH_ID) {
    return generateGrade1EquationMatch(options);
  }

  const random = options.random || Math.random;
  const useAddition = random() < 0.5;

  return generateArithmeticProblem({
    operation: useAddition ? "addition" : "subtraction",
    minA: 0,
    maxA: 20,
    minB: 0,
    maxB: 20,
    allowNegative: false,
    missingPosition: "result",
    random: options.random
  });
}

module.exports = generateEquationMatchProblem;
module.exports.buildGrade1Candidates = buildGrade1Candidates;
