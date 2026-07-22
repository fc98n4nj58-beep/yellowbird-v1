const {
  generateBaseTenProblem
} = require("./grade1NumberRepresentation");

function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

const GRADE3_BASE_TEN_ID = "grade3_place_value_representation_base_ten_blocks";
const GRADE3_SAFE_MIN = 100;
const GRADE3_SAFE_MAX = 499;

function grade3ValuePool(options = {}) {
  const min = Number(options.minA ?? GRADE3_SAFE_MIN);
  const max = Number(options.maxA ?? GRADE3_SAFE_MAX);
  const selected = Array.isArray(options.selectedNumbers)
    ? options.selectedNumbers.map(Number)
    : [];

  if (selected.length) return selected;
  return Array.from({ length: max - min + 1 }, (_, index) => min + index);
}

function generateGrade3BaseTenProblem(options = {}) {
  const random = options.random || Math.random;
  const state = options.generatorState || {};
  const pool = grade3ValuePool(options);
  const used = state.grade3BaseTenValues || new Set();
  const available = pool.filter((value) => !used.has(value));

  if (!available.length) {
    throw new Error("No unused Grade 3 base-ten values remain for the requested worksheet.");
  }

  const value = available[randInt(0, available.length - 1, random)];
  const hundreds = Math.floor(value / 100);
  const tens = Math.floor((value % 100) / 10);
  const ones = value % 10;
  const duplicateSignature = `grade3_base_ten:${value}`;

  used.add(value);
  state.grade3BaseTenValues = used;

  return {
    type: "equation",
    prompt: "",
    answer: value,
    responseMode: "standard_number",
    responseType: "number",
    responseTarget: "represented_number",
    value,
    representedValue: value,
    hundreds,
    tens,
    ones,
    labelMode: "none",
    duplicateSignature,
    answerState: {
      representedValue: value,
      hundreds,
      tens,
      ones
    },
    visual: {
      kind: "base_ten_blocks",
      data: {
        value,
        representedValue: value,
        hundreds,
        tens,
        ones,
        labelMode: "none"
      }
    }
  };
}

function generateBaseTenBlocksProblem(options = {}) {
  if (options.worksheetId === "grade1_place_value_representation_base_ten_blocks") {
    return generateBaseTenProblem(options);
  }

  if (options.worksheetId === GRADE3_BASE_TEN_ID) {
    return generateGrade3BaseTenProblem(options);
  }

  const random = options.random || Math.random;
  const min = Number.isFinite(options.minA) ? options.minA : 10;
  const max = Number.isFinite(options.maxA) ? options.maxA : 99;

  const value = randInt(Math.max(0, min), Math.max(min, max), random);
  const tens = Math.floor(value / 10);
  const ones = value % 10;

  return {
    type: "equation",
    prompt: "What number is shown by the base ten blocks?",
    answer: value,
    visual: {
      kind: "base_ten_blocks",
      data: {
        value,
        tens,
        ones
      }
    }
  };
}

module.exports = generateBaseTenBlocksProblem;
