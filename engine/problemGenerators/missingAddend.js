const generateArithmeticProblem = require("../engines/arithmeticEngine");
const {
  generateMissingAddendFact
} = require("./grade1FluencyComparison");

const GRADE1_MISSING_ADDENDS_ID = "g1_missing_addends_within_20";
const GRADE2_BALANCED_ASSESSMENT_IDS = new Set([
  "g2_missing_addends_within_20_quick_check",
  "g2_missing_addends_within_20_exit_ticket"
]);

function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function shuffleCopy(items, random) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function buildBalancedAssessmentSequence(options = {}) {
  const random = options.random || Math.random;
  const maxTotal = Math.max(1, Number(options.maxTotal || options.maxA || 20));
  const questionCount = Math.max(1, Number(options.questionCount || 1));
  const nonZero = [];
  const zeroRelated = [];

  for (let total = 1; total <= maxTotal; total += 1) {
    for (let known = 0; known <= total; known += 1) {
      const missing = total - known;
      const fact = { total, known, missing };
      if (known === 0 || missing === 0) zeroRelated.push(fact);
      else nonZero.push(fact);
    }
  }

  const zeroCount = questionCount >= 3 ? 1 : 0;
  const sequence = shuffleCopy(nonZero, random).slice(0, questionCount - zeroCount);
  if (zeroCount) sequence.push(shuffleCopy(zeroRelated, random)[0]);

  return shuffleCopy(sequence, random);
}

function getBalancedAssessmentFact(options = {}) {
  const state = options.generatorState || {};
  const key = `${options.worksheetId}:${options.questionCount || 1}:${options.maxTotal || options.maxA || 20}`;
  if (!state.grade2BalancedMissingAddendSequences) {
    state.grade2BalancedMissingAddendSequences = {};
  }
  if (!state.grade2BalancedMissingAddendSequences[key]) {
    state.grade2BalancedMissingAddendSequences[key] = {
      index: 0,
      facts: buildBalancedAssessmentSequence(options)
    };
  }
  const sequence = state.grade2BalancedMissingAddendSequences[key];
  const fact = sequence.facts[sequence.index % sequence.facts.length];
  sequence.index += 1;
  return fact;
}

function generateMissingAddendProblem(options = {}) {
  if (options.worksheetId === GRADE1_MISSING_ADDENDS_ID) {
    return generateMissingAddendFact(options);
  }

  if (GRADE2_BALANCED_ASSESSMENT_IDS.has(options.worksheetId)) {
    const fact = getBalancedAssessmentFact(options);
    return {
      type: "equation",
      prompt: `__ + ${fact.known} = ${fact.total}`,
      answer: fact.missing,
      firstAddend: null,
      secondAddend: fact.known,
      total: fact.total,
      missingPosition: "first_addend",
      missingValue: fact.missing,
      zeroRelated: fact.known === 0 || fact.missing === 0
    };
  }

  const random = options.random || Math.random;
  const maxTotal = Number(options.maxTotal || options.maxA);

  if (Number.isFinite(maxTotal) && maxTotal > 0) {
    const total = randInt(1, maxTotal, random);
    const known = randInt(0, total, random);

    return {
      prompt: `__ + ${known} = ${total}`,
      answer: total - known
    };
  }

  return generateArithmeticProblem({
    ...options,
    operation: "addition",
    minA: Number.isFinite(options.minA) ? options.minA : 0,
    maxA: Number.isFinite(options.maxA) ? options.maxA : 20,
    minB: Number.isFinite(options.minB) ? options.minB : 0,
    maxB: Number.isFinite(options.maxB) ? options.maxB : 20,
    missingPosition: "a",
    random
  });
}

module.exports = generateMissingAddendProblem;
