const generateArithmeticProblem = require("../engines/arithmeticEngine");

function generateMissingAddendProblem() {
  return generateArithmeticProblem({
    operation: "addition",
    minA: 0,
    maxA: 20,
    minB: 0,
    maxB: 20,
    missingPosition: "a"
  });
}

module.exports = generateMissingAddendProblem;