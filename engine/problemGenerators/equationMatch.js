const generateArithmeticProblem = require("../engines/arithmeticEngine");

const GRADE1_EQUATION_MATCH_ID = "grade1_addition_subtraction_facts_equation_match";
const GRADE2_EQUATION_MATCH_ID = "grade2_addition_subtraction_facts_equation_match";
const GRADE3_EQUATION_MATCH_ID = "grade3_addition_subtraction_facts_equation_match";
const GRADE4_EQUATION_MATCH_ID = "grade4_addition_subtraction_facts_equation_match";
const GRADE5_EQUATION_MATCH_ID = "grade5_addition_subtraction_facts_equation_match";

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

function formatWholeNumber(value) {
  return Number(value).toLocaleString("en-CA");
}

function grade4ExpressionsForValue(value) {
  const additionSplits = [
    Math.floor(value * 0.28),
    Math.floor(value * 0.43),
    Math.floor(value * 0.61),
    Math.floor(value * 0.76)
  ];
  const additions = [];
  const additionSignatures = new Set();
  additionSplits.forEach((a) => {
    const b = value - a;
    const signature = `${a}:${b}`;
    if (a < 0 || b < 0 || additionSignatures.has(signature)) return;
    additionSignatures.add(signature);
    additions.push({
      text: `${formatWholeNumber(a)} + ${formatWholeNumber(b)}`,
      value,
      operation: "addition",
      operands: [a, b],
      a,
      b
    });
  });

  const subtractionOffsets = [25, 50, 75, 125];
  const subtractions = subtractionOffsets.map((offset) => ({
    text: `${formatWholeNumber(value + offset)} - ${formatWholeNumber(offset)}`,
    value,
    operation: "subtraction",
    operands: [value + offset, offset],
    a: value + offset,
    b: offset
  }));

  return { additions, subtractions };
}

function buildGrade4Candidates(options = {}) {
  const minimumResult = Math.max(0, finiteInteger(options.minimumResult, 100));
  const resultCap = finiteInteger(options.resultCap, 2000);
  const maximumResult = Math.min(
    resultCap,
    Math.max(minimumResult + 1, finiteInteger(options.maximumResult ?? options.maxTotal, 1000))
  );
  const operationMode = ["addition", "subtraction", "mixed"].includes(options.operationMode)
    ? options.operationMode
    : "mixed";
  const templates = operationMode === "addition"
    ? ["addition_addition"]
    : operationMode === "subtraction"
      ? ["subtraction_subtraction"]
      : ["addition_addition", "subtraction_subtraction", "addition_subtraction"];
  const expressions = new Map();
  for (let value = minimumResult; value <= maximumResult; value += 1) {
    expressions.set(value, grade4ExpressionsForValue(value));
  }

  const equal = [];
  const notEqual = [];
  for (let value = minimumResult; value <= maximumResult; value += 1) {
    const current = expressions.get(value);
    const differentValue = value < maximumResult ? value + 1 : value - 1;
    const different = expressions.get(differentValue);
    if (!different) continue;

    if (templates.includes("addition_addition") && current.additions.length >= 2) {
      equal.push({
        left: current.additions[0],
        right: current.additions[1],
        equivalent: true,
        template: "addition_addition"
      });
      notEqual.push({
        left: current.additions[2] || current.additions[0],
        right: different.additions[3] || different.additions[1],
        equivalent: false,
        template: "addition_addition"
      });
    }
    if (templates.includes("subtraction_subtraction")) {
      equal.push({
        left: current.subtractions[0],
        right: current.subtractions[1],
        equivalent: true,
        template: "subtraction_subtraction"
      });
      notEqual.push({
        left: current.subtractions[2],
        right: different.subtractions[3],
        equivalent: false,
        template: "subtraction_subtraction"
      });
    }
    if (templates.includes("addition_subtraction") && current.additions.length) {
      equal.push({
        left: current.additions[3] || current.additions[0],
        right: current.subtractions[3],
        equivalent: true,
        template: "addition_subtraction"
      });
      notEqual.push({
        left: current.additions[1] || current.additions[0],
        right: different.subtractions[1],
        equivalent: false,
        template: "addition_subtraction"
      });
    }
  }
  return { equal, notEqual, minimumResult, maximumResult, templates };
}

function grade4PairSignature(candidate) {
  return [candidate.left.text, candidate.right.text].sort().join(" :: ");
}

function selectGrade4Candidates(source, templates, count, random, usedSignatures) {
  const byTemplate = Object.fromEntries(templates.map((template) => [
    template,
    shuffle(source.filter((candidate) => candidate.template === template), random)
  ]));
  const selected = [];
  let cursor = 0;
  let attempts = 0;
  const maximumAttempts = Math.max(1, source.length * 3);
  while (selected.length < count && attempts < maximumAttempts) {
    const template = templates[cursor % templates.length];
    const candidates = byTemplate[template];
    let candidate = candidates.shift();
    while (candidate && usedSignatures.has(grade4PairSignature(candidate))) {
      candidate = candidates.shift();
    }
    if (candidate) {
      usedSignatures.add(grade4PairSignature(candidate));
      selected.push(candidate);
    }
    cursor += 1;
    attempts += 1;
  }
  if (selected.length !== count) {
    throw new Error("Insufficient Grade 4 equation-comparison variety for the requested contract.");
  }
  return selected;
}

function buildGrade4BalancedPool(options = {}) {
  const random = options.random || Math.random;
  const candidates = (options.candidateBuilder || buildGrade4Candidates)(options);
  const studentCount = Math.max(
    1,
    finiteInteger(options.studentQuestionCount ?? options.questionCount, 30)
  );
  const equalTarget = options.includeEqualPairs === false
    ? 0
    : Number.isInteger(options.equalPairs)
      ? options.equalPairs
      : Math.floor(studentCount / 2);
  const notEqualTarget = studentCount - equalTarget;
  const usedSignatures = new Set();
  const pool = [];

  if (options.includeExample) {
    const exampleSource = equalTarget > 0 ? candidates.equal : candidates.notEqual;
    const [example] = selectGrade4Candidates(
      exampleSource,
      candidates.templates,
      1,
      random,
      usedSignatures
    );
    pool.push(example);
  }

  const equal = selectGrade4Candidates(
    candidates.equal,
    candidates.templates,
    equalTarget,
    random,
    usedSignatures
  );
  const notEqual = selectGrade4Candidates(
    candidates.notEqual,
    candidates.templates,
    notEqualTarget,
    random,
    usedSignatures
  );
  while (equal.length || notEqual.length) {
    const preferred = pool.length % 2 === 0 ? equal : notEqual;
    const alternate = preferred === equal ? notEqual : equal;
    pool.push((preferred.length ? preferred : alternate).shift());
  }
  return { ...candidates, pool };
}

function buildGrade5Candidates(options = {}) {
  const minimumResult = Math.max(0, finiteInteger(options.minimumResult, 1000));
  const maximumResult = Math.min(
    10000,
    Math.max(minimumResult + 1, finiteInteger(options.maximumResult ?? options.maxTotal, 10000))
  );
  return buildGrade4Candidates({
    ...options,
    minimumResult,
    maximumResult,
    resultCap: 10000
  });
}

function buildGrade5BalancedPool(options = {}) {
  return buildGrade4BalancedPool({
    ...options,
    candidateBuilder: buildGrade5Candidates,
    studentQuestionCount: options.studentQuestionCount ?? options.questionCount ?? 20
  });
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
  const poolKey = [
    config.poolPrefix,
    built.minimumResult,
    built.maximumResult,
    options.operationMode || "",
    options.studentQuestionCount || options.questionCount || "",
    options.equalPairs ?? "",
    options.includeEqualPairs === false ? "no-equals" : "equals",
    options.includeExample ? "example" : "no-example"
  ].join(":");

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

  const canonicalPairSignature = [left.text, right.text].sort().join(" :: ");
  const structuredTruth = config.fullStructuredTruth
    ? {
        leftOperation: left.operation,
        rightOperation: right.operation,
        leftOperands: [...(left.operands || [left.a, left.b])],
        rightOperands: [...(right.operands || [right.a, right.b])],
        equalityState: candidate.equivalent,
        responseTarget: "equation_relation",
        answerState: {
          leftExpression: left.text,
          rightExpression: right.text,
          leftValue: left.value,
          rightValue: right.value,
          expectedRelation: expectedSymbol,
          equalityState: candidate.equivalent
        },
        relatedDuplicateSignature: `equation_match:${canonicalPairSignature}`
      }
    : {};

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
    duplicateSignature: config.fullStructuredTruth
      ? `equation_match:${canonicalPairSignature}`
      : `equation_match:${left.text}:${expectedSymbol}:${right.text}`,
    ...structuredTruth
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

function generateGrade4EquationMatch(options = {}) {
  return generateRelationalEquationMatch(options, {
    candidateBuilder: buildGrade4Candidates,
    poolBuilder: buildGrade4BalancedPool,
    poolPrefix: "grade4-equation-match",
    gradeLabel: "Grade 4",
    fullStructuredTruth: true
  });
}

function generateGrade5EquationMatch(options = {}) {
  return generateRelationalEquationMatch(options, {
    candidateBuilder: buildGrade5Candidates,
    poolBuilder: buildGrade5BalancedPool,
    poolPrefix: "grade5-equation-match",
    gradeLabel: "Grade 5",
    fullStructuredTruth: true
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
  if (options.worksheetId === GRADE4_EQUATION_MATCH_ID) {
    return generateGrade4EquationMatch(options);
  }
  if (options.worksheetId === GRADE5_EQUATION_MATCH_ID) {
    return generateGrade5EquationMatch(options);
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
module.exports.buildGrade4Candidates = buildGrade4Candidates;
module.exports.buildGrade4BalancedPool = buildGrade4BalancedPool;
module.exports.buildGrade5Candidates = buildGrade5Candidates;
module.exports.buildGrade5BalancedPool = buildGrade5BalancedPool;
