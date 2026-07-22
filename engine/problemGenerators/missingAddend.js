const generateArithmeticProblem = require("../engines/arithmeticEngine");
const {
  generateMissingAddendFact
} = require("./grade1FluencyComparison");

const GRADE1_MISSING_ADDENDS_ID = "g1_missing_addends_within_20";
const GRADE2_MISSING_ADDENDS_WITHIN_100_ID = "g2_missing_addends_within_100";
const GRADE3_MISSING_ADDENDS_ID = "grade3_addition_subtraction_facts_missing_addend";
const GRADE2_BALANCED_ASSESSMENT_IDS = new Set([
  "grade2_addition_subtraction_facts_missing_addend",
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

function normalizeMissingPosition(value) {
  const normalized = String(value || "mixed").trim().toLowerCase();
  if (["first", "first_addend", "a", "beginning"].includes(normalized)) return "first_addend";
  if (["second", "second_addend", "b", "middle"].includes(normalized)) return "second_addend";
  return "mixed";
}

function parseSelectedNumbers(options = {}) {
  const raw = Array.isArray(options.selectedNumbers)
    ? options.selectedNumbers
    : typeof options.onlyNumbers === "string"
      ? options.onlyNumbers.split(",")
      : [];
  return [...new Set(raw.map(Number).filter(Number.isFinite))];
}

function buildGrade3MissingAddendSequence(options = {}) {
  const random = options.random || Math.random;
  const minA = Number.isFinite(Number(options.minA)) ? Number(options.minA) : 0;
  const maxA = Number.isFinite(Number(options.maxA)) ? Number(options.maxA) : 100;
  const minB = Number.isFinite(Number(options.minB)) ? Number(options.minB) : 0;
  const maxB = Number.isFinite(Number(options.maxB)) ? Number(options.maxB) : 100;
  const maxTotal = Number.isFinite(Number(options.maxTotal)) ? Number(options.maxTotal) : 100;
  const selected = parseSelectedNumbers(options);
  const selectedSet = new Set(selected);
  const strictSelected = selected.length > 0;
  const mode = normalizeMissingPosition(options.missingPosition ?? options.missingAddendPosition);
  const positions = mode === "mixed" ? ["first_addend", "second_addend"] : [mode];
  const count = Math.max(1, Number(options.questionCount || 24));
  const pools = { first_addend: [], second_addend: [] };

  for (let firstAddend = minA; firstAddend <= maxA; firstAddend += 1) {
    for (let secondAddend = minB; secondAddend <= maxB; secondAddend += 1) {
      if (strictSelected && (!selectedSet.has(firstAddend) || !selectedSet.has(secondAddend))) continue;
      const total = firstAddend + secondAddend;
      if (total > maxTotal) continue;
      positions.forEach((missingPosition) => {
        pools[missingPosition].push({
          firstAddend,
          secondAddend,
          total,
          missingPosition,
          missingValue: missingPosition === "first_addend" ? firstAddend : secondAddend
        });
      });
    }
  }

  positions.forEach((position) => {
    pools[position] = shuffleCopy(pools[position], random);
    if (!pools[position].length) {
      throw new Error("No Grade 3 missing-addend facts are available for the selected range.");
    }
  });

  const facts = [];
  const indexes = { first_addend: 0, second_addend: 0 };
  for (let index = 0; index < count; index += 1) {
    const position = positions[index % positions.length];
    facts.push(pools[position][indexes[position] % pools[position].length]);
    indexes[position] += 1;
  }
  return { index: 0, facts };
}

function getGrade3MissingAddendFact(options = {}) {
  const state = options.generatorState || {};
  const key = JSON.stringify({
    minA: options.minA,
    maxA: options.maxA,
    minB: options.minB,
    maxB: options.maxB,
    maxTotal: options.maxTotal,
    selectedNumbers: parseSelectedNumbers(options),
    missingPosition: normalizeMissingPosition(options.missingPosition ?? options.missingAddendPosition),
    questionCount: options.questionCount
  });
  if (!state.grade3MissingAddendSequences) state.grade3MissingAddendSequences = {};
  if (!state.grade3MissingAddendSequences[key]) {
    state.grade3MissingAddendSequences[key] = buildGrade3MissingAddendSequence(options);
  }
  const sequence = state.grade3MissingAddendSequences[key];
  const fact = sequence.facts[sequence.index % sequence.facts.length];
  sequence.index += 1;
  return fact;
}

function generateMissingAddendProblem(options = {}) {
  if ([GRADE1_MISSING_ADDENDS_ID, GRADE2_MISSING_ADDENDS_WITHIN_100_ID].includes(options.worksheetId)) {
    return generateMissingAddendFact({
      ...options,
      strictSelectedOperands: options.worksheetId === GRADE2_MISSING_ADDENDS_WITHIN_100_ID
    });
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

  if (options.worksheetId === GRADE3_MISSING_ADDENDS_ID) {
    const fact = getGrade3MissingAddendFact(options);
    return {
      type: "equation",
      prompt: fact.missingPosition === "first_addend"
        ? `__ + ${fact.secondAddend} = ${fact.total}`
        : `${fact.firstAddend} + __ = ${fact.total}`,
      answer: fact.missingValue,
      a: fact.firstAddend,
      b: fact.secondAddend,
      op: "+",
      firstAddend: fact.firstAddend,
      secondAddend: fact.secondAddend,
      total: fact.total,
      missingPosition: fact.missingPosition,
      missingValue: fact.missingValue,
      responseValues: [fact.missingValue],
      duplicateSignature: `grade3_missing_addend:${fact.firstAddend}:${fact.secondAddend}:${fact.missingPosition}`
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
