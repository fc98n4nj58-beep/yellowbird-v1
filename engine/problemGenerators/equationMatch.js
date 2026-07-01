const generateArithmeticProblem = require("../engines/arithmeticEngine");

function generateEquationMatchProblem(options = {}) {
  const random = options.random || Math.random;
  const useAddition = random() < 0.5;

  return generateArithmeticProblem({
    operation: useAddition ? "addition" : "subtraction",
    minA: 0,
    maxA: 20,
    minB: 0,
    maxB: 20,
    allowNegative: false,
    missingPosition: "result",
    random: options.random
  });
}

module.exports = generateEquationMatchProblem;
