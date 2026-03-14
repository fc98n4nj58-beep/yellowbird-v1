const generateArithmeticProblem = require("../engines/arithmeticEngine");

function generateFactFluencyProblem() {
  const useAddition = Math.random() < 0.5;

  return generateArithmeticProblem({
    operation: useAddition ? "addition" : "subtraction",
    minA: 0,
    maxA: 20,
    minB: 0,
    maxB: 20,
    allowNegative: false,
    missingPosition: "result"
  });
}

module.exports = generateFactFluencyProblem;