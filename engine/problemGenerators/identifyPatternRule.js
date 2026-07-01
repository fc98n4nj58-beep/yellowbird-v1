function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function generateIdentifyPatternRule(options = {}) {
  const random = options.random || Math.random;
  const start = randInt(1, 20, random);
  const step = randInt(1, 5, random);

  const seq = [
    start,
    start + step,
    start + step * 2,
    start + step * 3
  ];

  return {
    type: "equation",
    prompt: `Identify the pattern rule: ${seq.join(", ")}`,
    answer: `Add ${step}`
  };
}

module.exports = generateIdentifyPatternRule;
