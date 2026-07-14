function finiteNumber(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeSelectedValues(value) {
  const raw = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];

  return [...new Set(raw
    .map((item) => Math.floor(Number(item)))
    .filter(Number.isFinite))];
}

function shuffle(values, random = Math.random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function buildCandidates(options = {}) {
  const minimumStart = Math.max(0, Math.floor(finiteNumber(options.minStart ?? options.minA, 0)));
  const maximumStart = Math.max(minimumStart, Math.floor(finiteNumber(options.maxStart ?? options.maxA, 10)));
  const minimumJump = Math.max(1, Math.floor(finiteNumber(options.minJump ?? options.minB, 1)));
  const maximumJump = Math.max(minimumJump, Math.floor(finiteNumber(options.maxJump ?? options.maxB, 10)));
  const maximumTotal = Math.max(1, Math.floor(finiteNumber(options.maxTotal, 20)));
  const selectedStarts = normalizeSelectedValues(options.selectedStarts || options.onlyStarts);
  const selectedJumps = normalizeSelectedValues(options.selectedJumps || options.onlyJumps);
  const starts = selectedStarts.length
    ? selectedStarts
    : Array.from({ length: maximumStart - minimumStart + 1 }, (_, index) => minimumStart + index);
  const jumps = selectedJumps.length
    ? selectedJumps
    : Array.from({ length: maximumJump - minimumJump + 1 }, (_, index) => minimumJump + index);

  return starts.flatMap((start) => jumps
    .filter((jump) => start >= 0 && jump > 0 && start + jump <= maximumTotal)
    .map((jump) => ({ start, jump, landing: start + jump })));
}

function generateAdditionNumberLineProblem(options = {}) {
  const random = options.random || Math.random;
  const generatorState = options.generatorState || {};
  const candidates = buildCandidates(options);
  if (!candidates.length) {
    throw new Error("No Grade 1 addition number-line problems are available for the selected range.");
  }

  const poolKey = [
    "addition_number_line",
    options.minStart ?? options.minA ?? 0,
    options.maxStart ?? options.maxA ?? 10,
    options.minJump ?? options.minB ?? 1,
    options.maxJump ?? options.maxB ?? 10,
    options.maxTotal ?? 20,
    normalizeSelectedValues(options.selectedStarts || options.onlyStarts).join("|"),
    normalizeSelectedValues(options.selectedJumps || options.onlyJumps).join("|")
  ].join(":");

  if (!generatorState.additionNumberLinePools) generatorState.additionNumberLinePools = {};
  if (!generatorState.additionNumberLinePools[poolKey]?.length) {
    generatorState.additionNumberLinePools[poolKey] = shuffle(candidates, random);
  }

  const fact = generatorState.additionNumberLinePools[poolKey].shift();
  const lineMaximum = Math.max(20, Math.floor(finiteNumber(options.numberLineMaximum, 20)));

  return {
    type: "equation",
    prompt: `${fact.start} + ${fact.jump} = ___`,
    answer: fact.landing,
    a: fact.start,
    b: fact.jump,
    op: "+",
    operation: "addition",
    firstAddend: fact.start,
    secondAddend: fact.jump,
    total: fact.landing,
    responseMode: "addition_number_line",
    duplicateSignature: `addition_number_line:${fact.start}:${fact.jump}:${fact.landing}`,
    visual: {
      kind: "number_line",
      data: {
        min: 0,
        max: lineMaximum,
        value: fact.landing,
        hideValueLabel: true,
        additionStart: fact.start,
        additionJump: fact.jump,
        additionLanding: fact.landing,
        additionDirection: "forward"
      }
    }
  };
}

module.exports = generateAdditionNumberLineProblem;
module.exports.buildCandidates = buildCandidates;
