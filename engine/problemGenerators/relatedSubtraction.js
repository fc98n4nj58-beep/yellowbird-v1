const generateArithmeticProblem = require("../engines/arithmeticEngine");

function generateRelatedSubtractionProblem(options = {}) {
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
