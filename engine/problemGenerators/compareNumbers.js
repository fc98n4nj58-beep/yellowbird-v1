const {
  generateCompareNumbersFact
} = require("./grade1FluencyComparison");

const GRADE1_COMPARE_NUMBERS_ID = "g1_compare_numbers_to_20";
const GRADE2_THREE_DIGIT_COMPARISON_ID = "grade2_place_value_representation_compare_numbers";
const GRADE2_TO_100_COMPARISON_ID = "g2_compare_numbers_to_100";
const GRADE4_COMPARE_NUMBERS_ID = "grade4_place_value_representation_compare_numbers";
const GRADE5_COMPARE_NUMBERS_ID = "grade5_place_value_representation_compare_numbers";

function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function pickNumber(options, min, max) {
  const random = options.random || Math.random;
  const selected = Array.isArray(options.selectedNumbers)
    ? options.selectedNumbers
    : [];

  if (selected.length) {
    return selected[Math.floor(random() * selected.length)];
  }

  return randInt(min, max, random);
}

function shuffle(values, random = Math.random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function buildGrade4ComparisonPool(options = {}) {
  const random = options.random || Math.random;
  const min = Number(options.minA ?? options.minValue ?? 1000);
  const max = Number(options.maxA ?? options.maxValue ?? 10000);
  const selected = Array.isArray(options.selectedNumbers) ? options.selectedNumbers.map(Number) : [];
  const count = Number(options.questionCount || 12);
  const studentCount = Number(options.studentQuestionCount || count);
  const additionalExampleCount = Math.max(0, count - studentCount);
  const includeEqualPairs = options.includeEqualPairs !== false;
  const equalCount = includeEqualPairs ? studentCount / 3 : 0;
  const lessCount = includeEqualPairs ? studentCount / 3 : studentCount / 2;
  const greaterCount = studentCount - equalCount - lessCount;
  const values = selected.length ? selected : null;
  const pick = () => values
    ? values[Math.floor(random() * values.length)]
    : randInt(min, max, random);
  const usedValues = new Set();
  const usedPairs = new Set();
  const pool = [];
  const examples = [];

  for (let index = 0; index < additionalExampleCount; index += 1) {
    if (includeEqualPairs) {
      let value = pick();
      for (let attempt = 0; attempt < 1000 && usedValues.has(value); attempt += 1) value = pick();
      if (usedValues.has(value)) throw new Error("Grade 4 comparison example pool is too small.");
      usedValues.add(value);
      examples.push({ leftValue: value, rightValue: value, expectedSymbol: "=" });
    } else {
      let low;
      let high;
      let pairKey;
      for (let attempt = 0; attempt < 2000; attempt += 1) {
        const first = pick();
        const second = pick();
        if (first === second) continue;
        low = Math.min(first, second);
        high = Math.max(first, second);
        pairKey = `${low}:${high}`;
        if (!usedPairs.has(pairKey)) break;
      }
      if (!pairKey || usedPairs.has(pairKey)) throw new Error("Grade 4 comparison example pool is too small.");
      usedPairs.add(pairKey);
      examples.push({ leftValue: low, rightValue: high, expectedSymbol: "<" });
    }
  }

  for (let index = 0; index < equalCount; index += 1) {
    let value = pick();
    for (let attempt = 0; attempt < 1000 && usedValues.has(value); attempt += 1) value = pick();
    if (usedValues.has(value)) throw new Error("Grade 4 comparison equality pool is too small.");
    usedValues.add(value);
    pool.push({ leftValue: value, rightValue: value, expectedSymbol: "=" });
  }

  [["<", lessCount], [">", greaterCount]].forEach(([symbol, targetCount]) => {
    for (let index = 0; index < targetCount; index += 1) {
      let leftValue;
      let rightValue;
      let pairKey;
      for (let attempt = 0; attempt < 2000; attempt += 1) {
        const first = pick();
        const second = pick();
        if (first === second) continue;
        const low = Math.min(first, second);
        const high = Math.max(first, second);
        pairKey = `${low}:${high}`;
        if (usedPairs.has(pairKey)) continue;
        leftValue = symbol === "<" ? low : high;
        rightValue = symbol === "<" ? high : low;
        break;
      }
      if (!pairKey || leftValue === undefined) throw new Error("Grade 4 comparison pair pool is too small.");
      usedPairs.add(pairKey);
      pool.push({ leftValue, rightValue, expectedSymbol: symbol });
    }
  });
  return examples.concat(shuffle(pool, random));
}

function generateGrade4CompareNumbersProblem(options = {}) {
  const generatorState = options.generatorState || {};
  const key = JSON.stringify({
    min: options.minA ?? options.minValue ?? 1000,
    max: options.maxA ?? options.maxValue ?? 10000,
    selected: options.selectedNumbers || [],
    questionCount: options.questionCount || 12,
    includeEqualPairs: options.includeEqualPairs !== false
  });
  if (!generatorState.grade4ComparisonPools) generatorState.grade4ComparisonPools = {};
  if (!generatorState.grade4ComparisonPools[key]?.length) {
    generatorState.grade4ComparisonPools[key] = buildGrade4ComparisonPool(options);
  }
  const item = generatorState.grade4ComparisonPools[key].shift();
  if (!item) throw new Error("No Grade 4 comparison items are available.");
  const equalityState = item.expectedSymbol === "=";
  const leftNumeral = item.leftValue.toLocaleString("en-CA");
  const rightNumeral = item.rightValue.toLocaleString("en-CA");
  const low = Math.min(item.leftValue, item.rightValue);
  const high = Math.max(item.leftValue, item.rightValue);
  return {
    type: "equation",
    prompt: `${leftNumeral}   ___   ${rightNumeral}`,
    answer: item.expectedSymbol,
    leftValue: item.leftValue,
    rightValue: item.rightValue,
    expectedSymbol: item.expectedSymbol,
    comparisonResult: item.expectedSymbol,
    equalityState,
    responseMode: "comparison_symbol",
    responseType: "symbol",
    responseTarget: "comparison_symbol",
    responseValues: [item.expectedSymbol],
    answerState: { expectedSymbol: item.expectedSymbol, equalityState },
    duplicateSignature: equalityState
      ? `grade4_compare:${item.leftValue}=${item.rightValue}`
      : `grade4_compare:${low}:${high}`
  };
}

function buildGrade5ComparisonPool(options = {}) {
  const random = options.random || Math.random;
  const min = Number(options.minA ?? options.minValue ?? 10000);
  const max = Number(options.maxA ?? options.maxValue ?? 100000);
  const selected = Array.isArray(options.selectedNumbers) ? options.selectedNumbers.map(Number) : [];
  const studentCount = Number(options.studentQuestionCount ?? options.questionCount ?? 30);
  const totalCount = Number(options.questionCount ?? studentCount);
  const additionalExampleCount = Math.max(0, totalCount - studentCount);
  const includeEqualPairs = options.includeEqualPairs !== false;
  const equalCount = includeEqualPairs
    ? Number.isInteger(options.equalityCount) ? options.equalityCount : Math.floor(studentCount / 3)
    : 0;
  const unequalCount = studentCount - equalCount;
  const lessCount = Math.floor(unequalCount / 2);
  const greaterCount = unequalCount - lessCount;
  const values = selected.length ? selected : null;
  const pick = () => values
    ? values[Math.floor(random() * values.length)]
    : randInt(min, max, random);
  const usedEqualValues = new Set();
  const usedPairs = new Set();
  const examples = [];
  const pool = [];

  function takeEqual(target) {
    let value;
    for (let attempt = 0; attempt < 2000; attempt += 1) {
      value = pick();
      if (!usedEqualValues.has(value)) break;
    }
    if (usedEqualValues.has(value)) throw new Error("Grade 5 comparison equality pool is too small.");
    usedEqualValues.add(value);
    target.push({ leftValue: value, rightValue: value, expectedSymbol: "=" });
  }

  function takeUnequal(target, symbol) {
    let leftValue;
    let rightValue;
    let pairKey;
    for (let attempt = 0; attempt < 4000; attempt += 1) {
      const first = pick();
      const second = pick();
      if (first === second) continue;
      const low = Math.min(first, second);
      const high = Math.max(first, second);
      pairKey = `${low}:${high}`;
      if (usedPairs.has(pairKey)) continue;
      leftValue = symbol === "<" ? low : high;
      rightValue = symbol === "<" ? high : low;
      break;
    }
    if (!pairKey || leftValue === undefined) throw new Error("Grade 5 comparison pair pool is too small.");
    usedPairs.add(pairKey);
    target.push({ leftValue, rightValue, expectedSymbol: symbol });
  }

  for (let index = 0; index < additionalExampleCount; index += 1) {
    if (includeEqualPairs) takeEqual(examples);
    else takeUnequal(examples, "<");
  }
  for (let index = 0; index < equalCount; index += 1) takeEqual(pool);
  for (let index = 0; index < lessCount; index += 1) takeUnequal(pool, "<");
  for (let index = 0; index < greaterCount; index += 1) takeUnequal(pool, ">");
  return examples.concat(shuffle(pool, random));
}

function generateGrade5CompareNumbersProblem(options = {}) {
  const generatorState = options.generatorState || {};
  const key = JSON.stringify({
    min: options.minA ?? options.minValue ?? 10000,
    max: options.maxA ?? options.maxValue ?? 100000,
    selected: options.selectedNumbers || [],
    questionCount: options.questionCount ?? 30,
    studentQuestionCount: options.studentQuestionCount ?? options.questionCount ?? 30,
    includeEqualPairs: options.includeEqualPairs !== false,
    equalityCount: options.equalityCount
  });
  if (!generatorState.grade5ComparisonPools) generatorState.grade5ComparisonPools = {};
  if (!generatorState.grade5ComparisonPools[key]?.length) {
    generatorState.grade5ComparisonPools[key] = buildGrade5ComparisonPool(options);
  }
  const item = generatorState.grade5ComparisonPools[key].shift();
  if (!item) throw new Error("No Grade 5 comparison items are available.");
  const equalityState = item.expectedSymbol === "=";
  const leftNumeral = item.leftValue.toLocaleString("en-CA");
  const rightNumeral = item.rightValue.toLocaleString("en-CA");
  const low = Math.min(item.leftValue, item.rightValue);
  const high = Math.max(item.leftValue, item.rightValue);
  const duplicateSignature = equalityState
    ? `grade5_compare:${item.leftValue}=${item.rightValue}`
    : `grade5_compare:${low}:${high}`;
  return {
    type: "equation",
    prompt: `${leftNumeral}   ___   ${rightNumeral}`,
    answer: item.expectedSymbol,
    leftValue: item.leftValue,
    rightValue: item.rightValue,
    expectedSymbol: item.expectedSymbol,
    comparisonResult: item.expectedSymbol,
    equalityState,
    responseMode: "comparison_symbol",
    responseType: "symbol",
    responseTarget: "comparison_symbol",
    responseValues: [item.expectedSymbol],
    answerState: {
      leftValue: item.leftValue,
      rightValue: item.rightValue,
      expectedSymbol: item.expectedSymbol,
      equalityState
    },
    duplicateSignature
  };
}

function generateCompareNumbersProblem(options = {}) {
  if (options.worksheetId === GRADE1_COMPARE_NUMBERS_ID) {
    return generateCompareNumbersFact(options);
  }
  if (options.worksheetId === GRADE4_COMPARE_NUMBERS_ID) {
    return generateGrade4CompareNumbersProblem(options);
  }
  if (options.worksheetId === GRADE5_COMPARE_NUMBERS_ID) {
    return generateGrade5CompareNumbersProblem(options);
  }

  const random = options.random || Math.random;
  const isGrade2ThreeDigit = options.worksheetId === GRADE2_THREE_DIGIT_COMPARISON_ID;
  const isGrade2To100 = options.worksheetId === GRADE2_TO_100_COMPARISON_ID;
  const min = isGrade2ThreeDigit
    ? 100
    : isGrade2To100
      ? 0
      : Number.isFinite(options.minA) ? options.minA : 0;
  const max = isGrade2ThreeDigit
    ? 999
    : isGrade2To100
      ? 100
      : Number.isFinite(options.maxA) ? options.maxA : 999;
  const promptType = String(options.promptType || "").toLowerCase();
  const promptStyle = String(options.promptStyle || "").toLowerCase();

  const rangeOptions = isGrade2ThreeDigit || isGrade2To100
    ? { ...options, selectedNumbers: [] }
    : options;
  const a = pickNumber(rangeOptions, min, max);
  const b = pickNumber(rangeOptions, min, max);

  let answer = "=";
  if (a > b) answer = ">";
  if (a < b) answer = "<";

  const useBarePrompt = isGrade2ThreeDigit || isGrade2To100 || promptStyle === "bare";

  return {
    prompt: useBarePrompt
      ? `${a}   ___   ${b}`
      : promptType === "sets"
      ? `Compare the sets: ${a}   ___   ${b}`
      : `Compare the numbers: ${a}   ___   ${b}`,
    answer,
    leftValue: a,
    rightValue: b,
    expectedSymbol: answer,
    comparisonResult: answer
  };
}

module.exports = generateCompareNumbersProblem;
module.exports.buildGrade4ComparisonPool = buildGrade4ComparisonPool;
module.exports.buildGrade5ComparisonPool = buildGrade5ComparisonPool;
