function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function generateTenFrameProblem(options = {}) {
  const random = options.random || Math.random;
  const min = Number.isFinite(options.minA) ? options.minA : 0;
  const max = Number.isFinite(options.maxA) ? options.maxA : 10;

  const value = randInt(Math.max(0, min), Math.min(10, max), random);

  return {
    type: "equation",
    prompt: "How many dots are shown in the ten frame?",
    answer: value,
    visual: {
      kind: "ten_frame",
      data: {
        filled: value
      }
    }
  };
}

module.exports = generateTenFrameProblem;
