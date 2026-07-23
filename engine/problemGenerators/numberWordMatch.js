const {
  generateNumberWordProblem
} = require("./grade1NumberRepresentation");

const GRADE1_NUMBER_WORD_RESOURCE_IDS = new Set([
  "g1_number_word_match_to_50",
  "g1_write_the_numeral_to_50",
  "grade2_place_value_representation_number_word_match"
]);
const GRADE4_NUMBER_WORD_ID = "grade4_place_value_representation_number_word_match";

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

function grade4NumberToWords(n) {
  if (n < 1000) return numberToWords(n);
  if (n > 10000) return String(n);
  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;
  const prefix = thousands === 10 ? "ten thousand" : `${numberToWords(thousands)} thousand`;
  return rest === 0 ? prefix : `${prefix} ${numberToWords(rest)}`;
}

function shuffle(values, random = Math.random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function generateGrade4NumberWordProblem(options = {}) {
  const random = options.random || Math.random;
  const generatorState = options.generatorState || {};
  const min = Number(options.minA ?? options.minValue ?? 1000);
  const max = Number(options.maxA ?? options.maxValue ?? 9999);
  const selected = Array.isArray(options.selectedNumbers) ? options.selectedNumbers.map(Number) : [];
  const mode = String(options.numberWordMode || options.numberWordDirection || options.mode || "numeral_to_word");
  const requestedCount = Number(options.questionCount || 10);
  const key = JSON.stringify({ min, max, selected, mode, requestedCount });
  if (!generatorState.grade4NumberWordPools) generatorState.grade4NumberWordPools = {};
  if (!generatorState.grade4NumberWordPools[key]?.length) {
    const candidates = selected.length
      ? selected
      : Array.from({ length: max - min + 1 }, (_, index) => min + index);
    if (candidates.length < requestedCount) {
      throw new Error(`Grade 4 number words need ${requestedCount} unique values; the selected contract provides ${candidates.length}.`);
    }
    generatorState.grade4NumberWordPools[key] = shuffle(candidates, random).slice(0, requestedCount);
  }
  const value = generatorState.grade4NumberWordPools[key].shift();
  const word = grade4NumberToWords(value);
  const isReverse = mode === "word_to_numeral";
  const numeral = value.toLocaleString("en-CA");
  return {
    type: "equation",
    prompt: isReverse ? word : numeral,
    answer: isReverse ? value : word,
    value,
    representedValue: value,
    numeral,
    numberWord: word,
    numberWordMode: mode,
    taskDirection: mode,
    responseMode: isReverse ? "shortNumeral" : "writtenNumberWord",
    responseType: isReverse ? "numeral" : "number_word",
    responseTarget: isReverse ? "numeral" : "number_word",
    responseValues: [isReverse ? value : word],
    answerState: { representedValue: value, numeral, numberWord: word, taskDirection: mode },
    duplicateSignature: `grade4_number_word:${mode}:${value}`
  };
}

function generateNumberWordMatchProblem(options = {}) {
  if (GRADE1_NUMBER_WORD_RESOURCE_IDS.has(options.worksheetId)) {
    return generateNumberWordProblem(options);
  }
  if (options.worksheetId === GRADE4_NUMBER_WORD_ID) {
    return generateGrade4NumberWordProblem(options);
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
module.exports.grade4NumberToWords = grade4NumberToWords;
