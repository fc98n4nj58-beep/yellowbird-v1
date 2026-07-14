function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function finiteNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clampInt(value, min, max, fallback) {
  const n = Math.floor(finiteNumber(value, fallback));
  return Math.max(min, Math.min(max, n));
}

function shuffle(values, random = Math.random) {
  const result = [...values];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function buildMissingIndexes(count, missingCount, placement, random = Math.random) {
  const maxMissing = Math.max(1, count - 2);
  const resolvedMissingCount = Math.max(1, Math.min(missingCount, maxMissing));
  const indexes = [...Array(count).keys()];

  if (placement === "beginning") {
    return indexes.slice(0, resolvedMissingCount);
  }

  if (placement === "random") {
    const randomPool = count > 4 ? indexes.slice(1, count - 1) : indexes;
    const selected = shuffle(randomPool, random).slice(0, resolvedMissingCount).sort((a, b) => a - b);
    const earlyLimit = Math.floor(count / 2);

    if (
      resolvedMissingCount > 1 &&
      selected.every((index) => index < earlyLimit)
    ) {
      const later = shuffle(randomPool.filter((index) => index >= earlyLimit), random)[0];
      if (later !== undefined) {
        selected[selected.length - 1] = later;
      }
    }

    return [...new Set(selected)].sort((a, b) => a - b);
  }

  return indexes.slice(count - resolvedMissingCount);
}

function buildSkipSequence(step, startMultiplier, count, missingIndexes = []) {
  const hidden = new Set(missingIndexes);
  const nums = [];

  for (let i = 0; i < count; i++) {
    nums.push(hidden.has(i) ? null : step * (startMultiplier + i));
  }

  return nums;
}

function normalizeSelectedSteps(options = {}) {
  const raw = options.selectedSteps || options.steps || options.onlySteps;
  const values = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
      ? raw.split(",")
      : [];

  return [...new Set(values
    .map((value) => Math.floor(Number(value)))
    .filter((value) => Number.isFinite(value) && value > 0))];
}

function nextSelectedStep(options, random) {
  const selectedSteps = normalizeSelectedSteps(options);
  if (!selectedSteps.length) return null;

  const generatorState = options.generatorState || {};
  const key = selectedSteps.join("|");
  if (!generatorState.skipCountingStepPools) generatorState.skipCountingStepPools = {};
  if (!generatorState.skipCountingStepPools[key]?.length) {
    generatorState.skipCountingStepPools[key] = shuffle(selectedSteps, random);
  }
  return generatorState.skipCountingStepPools[key].shift();
}

function generateSkipCountingProblem(options = {}) {
  const random = options.random || Math.random;
  const usedProblemKeys = options.usedProblemKeys || new Set();
  const step = Number(options.step);
  const hasStep = Number.isFinite(step) && step > 0;
  const termCount = clampInt(
    options.termCount ?? options.sequenceLength,
    3,
    15,
    8
  );
  const missingCount = clampInt(options.missingCount, 1, Math.max(1, termCount - 2), 1);
  const missingPlacement = ["beginning", "end", "random"].includes(
    String(options.missingPlacement || "").toLowerCase()
  )
    ? String(options.missingPlacement).toLowerCase()
    : "end";
  let fallbackProblem = null;

  for (let attempt = 0; attempt < 80; attempt++) {
    const resolvedStep = hasStep ? step : nextSelectedStep(options, random) || randInt(2, 10, random);
    const startNumber = finiteNumber(options.startNumber, null);
    const allowZeroStart = Boolean(options.allowZeroStart);
    const minimumMultiplier = allowZeroStart ? 0 : 1;
    const maxValue = finiteNumber(options.maxValue, null);
    const maximumMultiplier = maxValue === null
      ? 12
      : Math.max(
          minimumMultiplier,
          Math.floor(maxValue / resolvedStep) - (termCount - 1)
        );
    const startMultiplier = startNumber !== null
      ? Math.max(minimumMultiplier, Math.floor(startNumber / resolvedStep))
      : randInt(minimumMultiplier, maximumMultiplier, random);
    const missingIndexes = buildMissingIndexes(termCount, missingCount, missingPlacement, random);
    const key = `skip_counting:${resolvedStep}:${startMultiplier}:${termCount}:${missingIndexes.join("-")}`;
    const answer = missingIndexes.map((index) => resolvedStep * (startMultiplier + index));
    const problem = {
      type: "equation",
      prompt: `Skip count by ${resolvedStep}.`,
      answer: answer.length === 1 ? answer[0] : answer,
      sequence: buildSkipSequence(resolvedStep, startMultiplier, termCount, missingIndexes),
      missingIndex: missingIndexes[0],
      missingIndexes,
      step: resolvedStep
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
module.exports.normalizeSelectedSteps = normalizeSelectedSteps;
