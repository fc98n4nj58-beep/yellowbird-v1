function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function buildSkipSequence(step, startMultiplier, count) {
  const nums = [];

  for (let i = 0; i < count; i++) {
    nums.push(step * (startMultiplier + i));
  }

  return nums.join(", ");
}

function generateSkipCountingProblem(options = {}) {
  const random = options.random || Math.random;
  const usedProblemKeys = options.usedProblemKeys || new Set();
  const step = Number(options.step);
  const hasStep = Number.isFinite(step) && step > 0;
  let fallbackProblem = null;

  for (let attempt = 0; attempt < 80; attempt++) {
    const resolvedStep = hasStep ? step : randInt(2, 10, random);
    const startMultiplier = randInt(1, 5, random);
    const targetPosition = randInt(3, 10, random);
    const key = `skip_counting:${resolvedStep}:${startMultiplier}:${targetPosition}`;
    const answer = resolvedStep * (startMultiplier + targetPosition - 1);
    const problem = {
      prompt: `Skip count by ${resolvedStep}: ${buildSkipSequence(resolvedStep, startMultiplier, targetPosition - 1)}, ... What is the ${targetPosition}th number?`,
      answer
    };

    fallbackProblem = problem;

    if (!usedProblemKeys.has(key)) {
      usedProblemKeys.add(key);
      return problem;
    }
  }

  return fallbackProblem;
}

module.exports = generateSkipCountingProblem;
