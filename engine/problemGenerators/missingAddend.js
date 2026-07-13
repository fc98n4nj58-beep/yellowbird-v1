const generateArithmeticProblem = require("../engines/arithmeticEngine");
const {
  generateMissingAddendFact
} = require("./grade1FluencyComparison");

const GRADE1_MISSING_ADDENDS_ID = "g1_missing_addends_within_20";

function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function generateMissingAddendProblem(options = {}) {
  if (options.worksheetId === GRADE1_MISSING_ADDENDS_ID) {
    return generateMissingAddendFact(options);
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
