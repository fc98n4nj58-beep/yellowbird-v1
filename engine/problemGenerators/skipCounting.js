function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSkipCountingProblem() {
  const step = randInt(2, 10);
  const count = randInt(3, 10);
  const total = step * count;

  return {
    type: "skip_counting",
    prompt: `Skip count by ${step}: ${step}, ${step * 2}, ${step * 3} ... What is the ${count}th number?`,
    equation: `${step} × ${count} = ___`,
    answer: total,
    meta: {
      step,
      count
    }
  };
}

module.exports = generateSkipCountingProblem;