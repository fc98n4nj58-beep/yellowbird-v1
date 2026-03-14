const generateArithmeticProblem = require("../engines/arithmeticEngine");

function generateSkipCountingProblem() {
  return generateArithmeticProblem({
    operation: "multiplication",
    format: "skip_counting",
    minA: 2,
    maxA: 10
  });
}

module.exports = generateSkipCountingProblem;