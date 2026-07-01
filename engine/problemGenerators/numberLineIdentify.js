function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function finiteNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function generateNumberLineIdentifyProblem(options = {}) {
  const random = options.random || Math.random;
  const hasExplicitMax =
    options.maxA !== undefined &&
    options.maxA !== "" &&
    Number.isFinite(Number(options.maxA));
  const min = finiteNumber(options.minA, 0);
  const max = finiteNumber(options.maxA, 10);

  const start = Math.max(0, min);
  const end = hasExplicitMax
    ? Math.max(start + 1, max)
    : Math.max(start + 5, Math.min(max, start + 10));
  const value = randInt(start, end, random);

  return {
    type: "equation",
    prompt: "What number is marked on the number line?",
    answer: value,
    visual: {
      kind: "number_line",
      data: {
        start,
        end,
        highlight: value
      }
    }
  };
}

module.exports = generateNumberLineIdentifyProblem;
