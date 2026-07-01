const generateArithmeticProblem = require("../engines/arithmeticEngine");

function generateSkipCountingProblem(options = {}) {
  const step = Number(options.step);
  const hasStep = Number.isFinite(step) && step > 0;

  return generateArithmeticProblem({
    operation: "multiplication",
    format: "skip_counting",
    minA: hasStep ? step : 2,
    maxA: hasStep ? step : 10,
    random: options.random
  });
}

module.exports = generateSkipCountingProblem;
