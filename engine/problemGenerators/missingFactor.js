const generateArithmeticProblem = require("../engines/arithmeticEngine");

function finiteNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function buildProblemKey(problem) {
  return `${problem.prompt}|${problem.answer}`;
}

function generateMissingFactorProblem(options = {}) {
  const usedProblemKeys = options.usedProblemKeys || new Set();
  let fallbackProblem = null;

  for (let attempt = 0; attempt < 80; attempt += 1) {
    const problem = generateArithmeticProblem({
      operation: "multiplication",
      missingPosition: options.missingPosition || "a",
      minA: finiteNumber(options.minA, 2),
      maxA: finiteNumber(options.maxA, 10),
      minB: finiteNumber(options.minB, 2),
      maxB: finiteNumber(options.maxB, 10),
      onlyNumbers: options.onlyNumbers || "",
      excludeNumbers: options.excludeNumbers || "",
      random: options.random
    });

    fallbackProblem = problem;
    const key = buildProblemKey(problem);

    if (!usedProblemKeys.has(key)) {
      usedProblemKeys.add(key);
      return problem;
    }
  }

  return fallbackProblem;
}

module.exports = generateMissingFactorProblem;
