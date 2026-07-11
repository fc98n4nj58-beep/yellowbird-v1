function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function pickUniqueValue(min, max, options = {}) {
  const random = options.random || Math.random;
  const usedProblemKeys = options.usedProblemKeys || new Set();
  const available = [];

  for (let value = min; value <= max; value += 1) {
    if (!usedProblemKeys.has(`ten_frame:${value}`)) {
      available.push(value);
    }
  }

  if (available.length) {
    const value = available[Math.floor(random() * available.length)];
    usedProblemKeys.add(`ten_frame:${value}`);
    return value;
  }

  return randInt(min, max, random);
}

function generateTenFrameProblem(options = {}) {
  const random = options.random || Math.random;
  const min = Number.isFinite(options.minA) ? options.minA : 0;
  const max = Number.isFinite(options.maxA) ? options.maxA : 10;
  const fixedFrames = Number(options.tenFramesPerQuestion);
  const minFrames = Number(options.minTenFrames);
  const maxFrames = Number(options.maxTenFrames);
  const frames = Number.isFinite(fixedFrames) && fixedFrames > 0
    ? Math.min(10, Math.max(1, Math.floor(fixedFrames)))
    : Number.isFinite(minFrames) || Number.isFinite(maxFrames)
    ? randInt(
        Math.max(1, Math.floor(Number.isFinite(minFrames) ? minFrames : 1)),
        Math.min(10, Math.max(1, Math.floor(Number.isFinite(maxFrames) ? maxFrames : minFrames || 1))),
        random
      )
    : 1;

  const minValue = Math.max(0, min);
  const maxValue = Math.max(minValue, Math.min(frames * 10, max));
  const value = pickUniqueValue(minValue, maxValue, options);

  return {
    type: "equation",
    prompt: frames === 1
      ? "How many dots are shown in the ten frame?"
      : "How many dots are shown in the ten frames?",
    answer: value,
    visual: {
      kind: "ten_frame",
      data: {
        filled: value,
        frames
      }
    }
  };
}

module.exports = generateTenFrameProblem;
