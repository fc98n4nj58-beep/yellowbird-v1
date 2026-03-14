const generateArithmeticProblem = require("../engines/arithmeticEngine");

function generateRelatedSubtractionProblem() {
  return generateArithmeticProblem({
    operation: "subtraction",
    minA: 0,
    maxA: 20,
    minB: 0,
    maxB: 20,
    allowNegative: false,
    missingPosition: "result"
  });
}

module.exports = generateRelatedSubtractionProblem;