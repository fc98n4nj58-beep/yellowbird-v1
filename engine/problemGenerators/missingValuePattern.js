function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function generateMissingValuePattern(options = {}) {
  const random = options.random || Math.random;
  const start = randInt(1, 20, random);
  const step = randInt(1, 5, random);

  const seq = [
    start,
    start + step,
    "",
    start + step * 3,
    start + step * 4
  ];

  const answer = start + step * 2;

  return {
    type: "equation",
    prompt: `Fill in the missing value: ${seq.map(v => v === "" ? "__" : v).join(", ")}`,
    answer: String(answer)
  };
}

module.exports = generateMissingValuePattern;
