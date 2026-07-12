function finiteNumber(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toInt(value, fallback) {
  const n = finiteNumber(value, fallback);
  return Math.round(n);
}

function normalizeNumberList(value) {
  const raw = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];

  return [...new Set(
    raw
      .map((entry) => finiteNumber(entry))
      .filter((entry) => entry !== null)
      .map((entry) => Math.round(entry))
      .filter((entry) => entry > 0)
  )].sort((a, b) => a - b);
}

function rangeValues(min, max) {
  const start = Math.min(min, max);
  const end = Math.max(min, max);
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
}

function gradeDefaults(options = {}, family = "array") {
  const grade = String(options.grade || options.worksheetGrade || "").toLowerCase();

  if (family === "array") {
    if (grade === "grade2") return { minA: 2, maxA: 5, minB: 2, maxB: 5 };
    if (grade === "grade3" || grade === "grade4") return { minA: 2, maxA: 6, minB: 2, maxB: 6 };
    return { minA: 2, maxA: 6, minB: 2, maxB: 6 };
  }

  if (grade === "grade5" || grade === "grade6") {
    return { minA: 2, maxA: 6, minB: 2, maxB: 10 };
  }

  return { minA: 2, maxA: 6, minB: 2, maxB: 6 };
}

function selectedValuesFor(options = {}, keys = []) {
  for (const key of keys) {
    const values = normalizeNumberList(options[key]);
    if (values.length) return values;
  }

  return [];
}

function resolveFactorValues(options = {}, family = "array") {
  const defaults = gradeDefaults(options, family);
  const selectedFactors = normalizeNumberList(options.selectedFactors || options.onlyFactors);
  const selectedA = selectedValuesFor(options, [
    "selectedFactorA",
    "selectedRows",
    "selectedGroups",
    "onlyRows",
    "onlyGroups"
  ]);
  const selectedB = selectedValuesFor(options, [
    "selectedFactorB",
    "selectedCols",
    "selectedColumns",
    "selectedItemsPerGroup",
    "onlyCols",
    "onlyColumns",
    "onlyItemsPerGroup"
  ]);

  const minA = toInt(
    options.minFactorA ?? options.minRows ?? options.minGroups ?? options.minA,
    defaults.minA
  );
  const maxA = toInt(
    options.maxFactorA ?? options.maxRows ?? options.maxGroups ?? options.maxA,
    defaults.maxA
  );
  const minB = toInt(
    options.minFactorB ?? options.minCols ?? options.minColumns ?? options.minItemsPerGroup ?? options.minB,
    defaults.minB
  );
  const maxB = toInt(
    options.maxFactorB ?? options.maxCols ?? options.maxColumns ?? options.maxItemsPerGroup ?? options.maxB,
    defaults.maxB
  );

  return {
    factorAValues: selectedA.length ? selectedA : selectedFactors.length ? selectedFactors : rangeValues(minA, maxA),
    factorBValues: selectedB.length ? selectedB : selectedFactors.length ? selectedFactors : rangeValues(minB, maxB)
  };
}

function shuffle(values, random = Math.random) {
  const result = [...values];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function buildPairPool(options = {}, family = "array") {
  const { factorAValues, factorBValues } = resolveFactorValues(options, family);
  const maxProduct = finiteNumber(options.maxProduct ?? options.maxTotal);
  const pairs = [];

  factorAValues.forEach((factorA) => {
    factorBValues.forEach((factorB) => {
      const product = factorA * factorB;
      if (maxProduct !== null && product > maxProduct) return;

      pairs.push({
        factorA,
        factorB,
        product,
        orientation: family === "array" ? "rows_columns" : "groups_items",
        key: `${family}:${factorA}x${factorB}`
      });
    });
  });

  return pairs;
}

function nextMultiplicationModelFactorPair(options = {}, family = "array") {
  const random = options.random || Math.random;
  const generatorState = options.generatorState || {};
  const stateKey = `multiplicationModel:${family}`;

  if (!generatorState.multiplicationModelPools) {
    generatorState.multiplicationModelPools = {};
  }

  if (!generatorState.multiplicationModelPools[stateKey]) {
    generatorState.multiplicationModelPools[stateKey] = {
      pool: [],
      sourceSize: 0
    };
  }

  const state = generatorState.multiplicationModelPools[stateKey];

  if (!state.pool.length) {
    const source = buildPairPool(options, family);
    state.sourceSize = source.length;
    state.pool = shuffle(source.length ? source : buildPairPool({}, family), random);
  }

  const pair = state.pool.shift();

  return {
    ...pair,
    duplicateKey: pair.key,
    uniqueAvailable: state.sourceSize
  };
}

module.exports = {
  buildPairPool,
  nextMultiplicationModelFactorPair,
  normalizeNumberList
};
