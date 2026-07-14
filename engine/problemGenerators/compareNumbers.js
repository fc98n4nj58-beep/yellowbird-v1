const {
  generateCompareNumbersFact
} = require("./grade1FluencyComparison");

const GRADE1_COMPARE_NUMBERS_ID = "g1_compare_numbers_to_20";
const GRADE2_THREE_DIGIT_COMPARISON_ID = "grade2_place_value_representation_compare_numbers";
const GRADE2_TO_100_COMPARISON_ID = "g2_compare_numbers_to_100";

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

function generateCompareNumbersProblem(options = {}) {
  if (options.worksheetId === GRADE1_COMPARE_NUMBERS_ID) {
    return generateCompareNumbersFact(options);
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
