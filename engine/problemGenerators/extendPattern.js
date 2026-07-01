function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function generateExtendPattern(options = {}) {
  const random = options.random || Math.random;
  const start = randInt(1, 20, random);
  const step = randInt(1, 5, random);

  const seq = [start, start + step, start + step * 2, start + step * 3];
  const next = start + step * 4;

  return {
    type: "equation",
    prompt: `Extend the pattern: ${seq.join(", ")}, __`,
    answer: String(next)
  };
}

module.exports = generateExtendPattern;
