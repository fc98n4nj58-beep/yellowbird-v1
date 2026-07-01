const generateArithmeticProblem = require("../engines/arithmeticEngine");

function generateMissingAddendProblem(options = {}) {
  return generateArithmeticProblem({
    operation: "addition",
    minA: 0,
    maxA: 20,
    minB: 0,
    maxB: 20,
    missingPosition: "a",
    random: options.random
  });
}

module.exports = generateMissingAddendProblem;
