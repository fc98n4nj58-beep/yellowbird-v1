const generateArithmeticProblem = require("../engines/arithmeticEngine");

const GRADE1_EQUATION_MATCH_ID = "grade1_addition_subtraction_facts_equation_match";
const GRADE2_EQUATION_MATCH_ID = "grade2_addition_subtraction_facts_equation_match";
const GRADE3_EQUATION_MATCH_ID = "grade3_addition_subtraction_facts_equation_match";

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

function expressionGroups(minimumResult, maximumResult, limits = {}) {
  const additions = new Map();
  const subtractions = new Map();
  const minimumOperand = finiteInteger(limits.minimumOperand, 0);
  const maximumAddend = finiteInteger(limits.maximumAddend, 10);
  const maximumMinuend = finiteInteger(limits.maximumMinuend, 20);
  const maximumSubtrahend = finiteInteger(limits.maximumSubtrahend, 10);
  const canonicalAddition = Boolean(limits.canonicalAddition);

  for (let result = minimumResult; result <= maximumResult; result += 1) {
    additions.set(result, []);
    subtractions.set(result, []);
  }

  for (let a = minimumOperand; a <= maximumAddend; a += 1) {
    for (let b = minimumOperand; b <= maximumAddend; b += 1) {
      if (canonicalAddition && a > b) continue;
      const result = a + b;
      if (additions.has(result)) {
        additions.get(result).push({ text: `${a} + ${b}`, value: result, operation: "addition", a, b });
      }
    }
  }

  for (let a = minimumOperand; a <= maximumMinuend; a += 1) {
    for (let b = minimumOperand; b <= Math.min(maximumSubtrahend, a); b += 1) {
      const result = a - b;
      if (subtractions.has(result)) {
        subtractions.get(result).push({ text: `${a} - ${b}`, value: result, operation: "subtraction", a, b });
      }
    }
  }

  return { additions, subtractions };
}

function buildRelationalCandidates(options = {}, profile = {}) {
  const resultCap = finiteInteger(profile.resultCap, 20);
  const minimumResult = Math.max(0, finiteInteger(options.minimumResult, 0));
  const maximumResult = Math.min(
    resultCap,
    Math.max(minimumResult + 1, finiteInteger(options.maximumResult ?? options.maxTotal, resultCap))
  );
  const { additions, subtractions } = expressionGroups(minimumResult, maximumResult, profile);
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

function buildGrade1Candidates(options = {}) {
  return buildRelationalCandidates(options, {
    resultCap: 20,
    maximumAddend: 10,
    maximumMinuend: 20,
    maximumSubtrahend: 10
  });
}

function buildGrade2Candidates(options = {}) {
  const minimumResult = Math.max(0, finiteInteger(options.minimumResult, 0));
  const maximumResult = Math.min(
    50,
    Math.max(minimumResult + 1, finiteInteger(options.maximumResult ?? options.maxTotal, 50))
  );
  const { additions, subtractions } = expressionGroups(minimumResult, maximumResult, {
    minimumOperand: 1,
    maximumAddend: 49,
    maximumMinuend: 49,
    maximumSubtrahend: 20,
    canonicalAddition: true
  });
  const equal = [];
  const notEqual = [];

  function addPairs(target, template, leftGroup, rightGroup, equivalent) {
    if (!leftGroup.length || !rightGroup.length) return;
    let added = 0;
    const usedPairs = new Set();
    const preferredFractions = [[0.2, 0.8], [0.5, 0.9], [0.75, 0.25]];

    function addPair(leftIndex, rightIndex) {
      const left = leftGroup[Math.max(0, Math.min(leftGroup.length - 1, leftIndex))];
      const right = rightGroup[Math.max(0, Math.min(rightGroup.length - 1, rightIndex))];
      const signature = `${left.text}:${right.text}`;
      if (left.text === right.text || usedPairs.has(signature)) return;
      usedPairs.add(signature);
      target.push({ left, right, equivalent, template });
      added += 1;
    }

    preferredFractions.forEach(([leftFraction, rightFraction]) => {
      if (added >= 3) return;
      addPair(
        Math.floor((leftGroup.length - 1) * leftFraction),
        Math.floor((rightGroup.length - 1) * rightFraction)
      );
    });

    for (let leftIndex = 0; leftIndex < leftGroup.length && added < 3; leftIndex += 1) {
      for (let rightIndex = rightGroup.length - 1; rightIndex >= 0 && added < 3; rightIndex -= 1) {
        const left = leftGroup[leftIndex];
        const right = rightGroup[rightIndex];
        if (left.text === right.text) continue;
        addPair(leftIndex, rightIndex);
      }
    }
  }

  for (let result = minimumResult; result <= maximumResult; result += 1) {
    const differentResult = result < maximumResult ? result + 1 : result - 1;
    const add = additions.get(result) || [];
    const subtract = subtractions.get(result) || [];
    const differentAdd = additions.get(differentResult) || [];
    const differentSubtract = subtractions.get(differentResult) || [];

    addPairs(equal, "addition_addition", add, add, true);
    addPairs(equal, "subtraction_subtraction", subtract, subtract, true);
    addPairs(equal, "addition_subtraction", add, subtract, true);
    addPairs(notEqual, "addition_addition", add, differentAdd, false);
    addPairs(notEqual, "subtraction_subtraction", subtract, differentSubtract, false);
    addPairs(notEqual, "addition_subtraction", add, differentSubtract, false);
  }

  return { equal, notEqual, minimumResult, maximumResult };
}

function buildGrade3Candidates(options = {}) {
  return buildRelationalCandidates(options, {
    resultCap: 100,
    minimumOperand: 1,
    maximumAddend: 99,
    maximumMinuend: 100,
    maximumSubtrahend: 99,
    canonicalAddition: true
  });
}

function buildGrade3BalancedPool(options = {}) {
  const random = options.random || Math.random;
  const candidates = buildGrade3Candidates(options);
  const count = Math.max(1, finiteInteger(options.questionCount, 12));
  const requestedEqualPairs = typeof options.equalPairs === "number" ||
    (typeof options.equalPairs === "string" && /^\d+$/.test(options.equalPairs.trim()))
    ? Number(options.equalPairs)
    : NaN;
  const equalTarget = options.includeEqualPairs === false
    ? 0
    : Number.isFinite(requestedEqualPairs)
      ? Math.max(0, Math.min(count, Math.round(requestedEqualPairs)))
      : Math.ceil(count / 2);
  const notEqualTarget = count - equalTarget;
  const equal = shuffle(candidates.equal, random).slice(0, equalTarget);
  const notEqual = shuffle(candidates.notEqual, random).slice(0, notEqualTarget);

  if (equal.length !== equalTarget || notEqual.length !== notEqualTarget) {
    throw new Error("Insufficient Grade 3 equation-match variety for the requested range.");
  }

  const pool = [];
  while (equal.length || notEqual.length) {
    const preferred = pool.length % 2 === 0 ? equal : notEqual;
    const alternate = preferred === equal ? notEqual : equal;
    pool.push((preferred.length ? preferred : alternate).shift());
  }
  return { ...candidates, pool };
}

function buildGrade2BalancedPool(options = {}) {
  const random = options.random || Math.random;
  const candidates = buildGrade2Candidates(options);
  const templates = ["addition_addition", "subtraction_subtraction", "addition_subtraction"];
  const usedSignatures = new Set();
  const usedLeftValues = new Set();

  function select(source, template, count) {
    const candidatesForTemplate = shuffle(
      source.filter((candidate) => candidate.template === template),
      random
    );
    const selected = [];

    function take(requireNewLeftValue) {
      for (const candidate of candidatesForTemplate) {
        const signature = `${candidate.left.text}:${candidate.right.text}`;
        if (usedSignatures.has(signature)) continue;
        if (requireNewLeftValue && usedLeftValues.has(candidate.left.value)) continue;
        usedSignatures.add(signature);
        usedLeftValues.add(candidate.left.value);
        selected.push(candidate);
        if (selected.length === count) return;
      }
    }

    take(true);
    if (selected.length < count) take(false);
    if (selected.length !== count) {
      throw new Error(`Insufficient Grade 2 relational variety for ${template}.`);
    }
    return selected;
  }

  const equal = shuffle(templates.flatMap((template) => select(candidates.equal, template, 2)), random);
  const notEqual = shuffle(templates.flatMap((template) => select(candidates.notEqual, template, 2)), random);
  const pool = [];
  for (let index = 0; index < 6; index += 1) {
    pool.push(index % 2 === 0 ? equal[index] : notEqual[index]);
    pool.push(index % 2 === 0 ? notEqual[index] : equal[index]);
  }
  return { ...candidates, pool };
}

function buildBalancedPool(options = {}, candidateBuilder = buildGrade1Candidates) {
  const random = options.random || Math.random;
  const candidates = candidateBuilder(options);
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

function generateRelationalEquationMatch(options = {}, config = {}) {
  const generatorState = options.generatorState || {};
  const candidateBuilder = config.candidateBuilder || buildGrade1Candidates;
  const built = candidateBuilder(options);
  const poolKey = `${config.poolPrefix}:${built.minimumResult}:${built.maximumResult}`;

  if (!generatorState.equationMatchPools) generatorState.equationMatchPools = {};
  if (!generatorState.equationMatchPools[poolKey]?.length) {
    const builtPool = config.poolBuilder
      ? config.poolBuilder(options)
      : buildBalancedPool(options, candidateBuilder);
    generatorState.equationMatchPools[poolKey] = builtPool.pool;
  }

  const candidate = generatorState.equationMatchPools[poolKey].shift();
  if (!candidate) throw new Error(`No ${config.gradeLabel} equation-match pairs are available.`);

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

function generateGrade1EquationMatch(options = {}) {
  return generateRelationalEquationMatch(options, {
    candidateBuilder: buildGrade1Candidates,
    poolPrefix: "grade1-equation-match",
    gradeLabel: "Grade 1"
  });
}

function generateGrade2EquationMatch(options = {}) {
  return generateRelationalEquationMatch(options, {
    candidateBuilder: buildGrade2Candidates,
    poolBuilder: buildGrade2BalancedPool,
    poolPrefix: "grade2-equation-match",
    gradeLabel: "Grade 2"
  });
}

function generateGrade3EquationMatch(options = {}) {
  return generateRelationalEquationMatch(options, {
    candidateBuilder: buildGrade3Candidates,
    poolBuilder: buildGrade3BalancedPool,
    poolPrefix: "grade3-equation-match",
    gradeLabel: "Grade 3"
  });
}

function generateEquationMatchProblem(options = {}) {
  if (options.worksheetId === GRADE1_EQUATION_MATCH_ID) {
    return generateGrade1EquationMatch(options);
  }
  if (options.worksheetId === GRADE2_EQUATION_MATCH_ID) {
    return generateGrade2EquationMatch(options);
  }
  if (options.worksheetId === GRADE3_EQUATION_MATCH_ID) {
    return generateGrade3EquationMatch(options);
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
module.exports.buildGrade2Candidates = buildGrade2Candidates;
module.exports.buildGrade2BalancedPool = buildGrade2BalancedPool;
module.exports.buildGrade3Candidates = buildGrade3Candidates;
module.exports.buildGrade3BalancedPool = buildGrade3BalancedPool;
