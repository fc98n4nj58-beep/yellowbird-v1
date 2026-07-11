function finiteNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseNumberList(value) {
  if (Array.isArray(value)) {
    return value.map((n) => finiteNumber(n, null)).filter((n) => n !== null);
  }

  if (typeof value !== "string") return [];

  return value
    .split(",")
    .map((part) => finiteNumber(part.trim(), null))
    .filter((n) => n !== null);
}

function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function pick(values, random = Math.random) {
  return values[Math.floor(random() * values.length)];
}

function buildRange(min, max) {
  const values = [];
  for (let n = min; n <= max; n += 1) values.push(n);
  return values;
}

function buildPool(options = {}) {
  const selectedNumbers = parseNumberList(
    options.selectedNumbers || options.onlyNumbers
  );
  const excludedNumbers = new Set(parseNumberList(options.excludeNumbers));

  const minA = finiteNumber(options.minA, 2);
  const maxA = finiteNumber(options.maxA, 10);
  const minB = finiteNumber(options.minB, 2);
  const maxB = finiteNumber(options.maxB, 10);

  const aPool = (selectedNumbers.length
    ? selectedNumbers
    : buildRange(Math.min(minA, maxA), Math.max(minA, maxA))
  ).filter((n) => !excludedNumbers.has(n));
  const bPool = (selectedNumbers.length
    ? selectedNumbers
    : buildRange(Math.min(minB, maxB), Math.max(minB, maxB))
  ).filter((n) => !excludedNumbers.has(n));

  if (!aPool.length || !bPool.length) {
    throw new Error("No multiplication facts available for the selected range.");
  }

  return { aPool, bPool };
}

function buildProblem(a, b) {
  return {
    type: "equation",
    prompt: `${a} × ${b} = __`,
    answer: a * b,
    a,
    b,
    op: "×"
  };
}

function generateMultiplicationBasicProblem(options = {}) {
  const random = options.random || Math.random;
  const usedProblemKeys = options.usedProblemKeys || new Set();
  const { aPool, bPool } = buildPool(options);
  let fallbackProblem = null;

  for (let attempt = 0; attempt < 120; attempt += 1) {
    const a = pick(aPool, random);
    const b = pick(bPool, random);
    const problem = buildProblem(a, b);
    fallbackProblem = problem;

    const key = `×:${a}:${b}`;
    if (!usedProblemKeys.has(key)) {
      usedProblemKeys.add(key);
      return problem;
    }
  }

  return fallbackProblem || buildProblem(randInt(1, 12, random), randInt(1, 12, random));
}

module.exports = generateMultiplicationBasicProblem;
