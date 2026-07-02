const generateArithmeticProblem = require("../engines/arithmeticEngine");

function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function generateMissingAddendProblem(options = {}) {
  const random = options.random || Math.random;
  const maxTotal = Number(options.maxTotal);

  if (Number.isFinite(maxTotal) && maxTotal > 0) {
    const total = randInt(1, maxTotal, random);
    const known = randInt(0, total, random);

    return {
      prompt: `__ + ${known} = ${total}`,
      answer: total - known
    };
  }

  return generateArithmeticProblem({
    operation: "addition",
    minA: 0,
    maxA: 20,
    minB: 0,
    maxB: 20,
    missingPosition: "a",
    random
  });
}

module.exports = generateMissingAddendProblem;
