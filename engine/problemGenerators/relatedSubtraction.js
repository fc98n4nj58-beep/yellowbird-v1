const generateArithmeticProblem = require("../engines/arithmeticEngine");
const {
  generateSubtractionFact
} = require("./grade1FluencyComparison");

const GRADE1_SUBTRACTION_FACTS_ID = "g1_subtraction_facts_within_20";

function generateRelatedSubtractionProblem(options = {}) {
  if (options.worksheetId === GRADE1_SUBTRACTION_FACTS_ID) {
    return generateSubtractionFact(options);
  }

  return generateArithmeticProblem({
    ...options,
    operation: "subtraction",
    minA: Number.isFinite(options.minA) ? options.minA : 0,
    maxA: Number.isFinite(options.maxA) ? options.maxA : 20,
    minB: Number.isFinite(options.minB) ? options.minB : 0,
    maxB: Number.isFinite(options.maxB) ? options.maxB : 20,
    allowNegative: false,
    missingPosition: "result",
    random: options.random
  });
}

module.exports = generateRelatedSubtractionProblem;
