const generateArithmeticProblem = require("../engines/arithmeticEngine");

function generateEqualGroupsProblem() {
  return generateArithmeticProblem({
    operation: "multiplication",
    format: "equal_groups",
    minA: 2,
    maxA: 10,
    minB: 2,
    maxB: 10
  });
}

module.exports = generateEqualGroupsProblem;