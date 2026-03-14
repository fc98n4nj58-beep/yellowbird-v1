const generateArithmeticProblem = require("../engines/arithmeticEngine");

function generateMissingFactorProblem() {
  return generateArithmeticProblem({
    operation: "multiplication",
    missingPosition: "a",
    minA: 2,
    maxA: 10,
    minB: 2,
    maxB: 10
  });
}

module.exports = generateMissingFactorProblem;