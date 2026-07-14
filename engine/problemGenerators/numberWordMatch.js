const {
  generateNumberWordProblem
} = require("./grade1NumberRepresentation");

const GRADE1_NUMBER_WORD_RESOURCE_IDS = new Set([
  "g1_number_word_match_to_50",
  "g1_write_the_numeral_to_50",
  "grade2_place_value_representation_number_word_match"
]);

function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function numberToWords(n) {
  const ones = [
    "zero","one","two","three","four","five","six","seven","eight","nine",
    "ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen",
    "seventeen","eighteen","nineteen"
  ];

  const tens = [
    "", "", "twenty", "thirty", "forty", "fifty",
    "sixty", "seventy", "eighty", "ninety"
  ];

  if (n < 20) return ones[n];

  if (n < 100) {
    const ten = Math.floor(n / 10);
    const one = n % 10;
    return one === 0 ? tens[ten] : `${tens[ten]}-${ones[one]}`;
  }

  if (n < 1000) {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    if (rest === 0) return `${ones[hundred]} hundred`;
    return `${ones[hundred]} hundred ${numberToWords(rest)}`;
  }

  return String(n);
}

function generateNumberWordMatchProblem(options = {}) {
  if (GRADE1_NUMBER_WORD_RESOURCE_IDS.has(options.worksheetId)) {
    return generateNumberWordProblem(options);
  }

  const random = options.random || Math.random;
  const min = Number.isFinite(options.minA) ? options.minA : 0;
  const max = Number.isFinite(options.maxA) ? options.maxA : 999;
  const promptStyle = String(options.promptStyle || "").toLowerCase();
  const mode = String(options.numberWordMode || options.mode || "").toLowerCase();

  const usedProblemKeys = options.usedProblemKeys;
  let value = randInt(min, max, random);

  if (usedProblemKeys && max >= min) {
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const candidate = randInt(min, max, random);
      const key = `number_word_match:${candidate}`;
      if (!usedProblemKeys.has(key)) {
        value = candidate;
        usedProblemKeys.add(key);
        break;
      }
    }
  }

  return {
    prompt: mode === "word_to_numeral"
      ? numberToWords(value)
      : promptStyle === "number_only"
      ? String(value)
      : `Write this number in words: ${value}`,
    answer: mode === "word_to_numeral" ? value : numberToWords(value)
  };
}

module.exports = generateNumberWordMatchProblem;
