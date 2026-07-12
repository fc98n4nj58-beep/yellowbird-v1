function finiteNumber(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeSelectedValues(options = {}) {
  const raw = options.selectedNumbers || options.onlyNumbers;
  const values = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
      ? raw.split(",")
      : [];

  return [...new Set(
    values
      .map((value) => finiteNumber(value))
      .filter((value) => value !== null)
      .map((value) => Math.round(value))
  )].sort((a, b) => a - b);
}

function inferPlaceValueRange(options = {}) {
  const selectedValues = normalizeSelectedValues(options);
  if (selectedValues.length) {
    return {
      min: selectedValues[0],
      max: selectedValues[selectedValues.length - 1],
      selectedValues
    };
  }

  const title = String(options.worksheetTitle || "").toLowerCase();
  const worksheetId = String(options.worksheetId || "").toLowerCase();
  const grade = String(options.grade || options.worksheetGrade || "").toLowerCase();
  const isLargeNumberResource =
    title.includes("large number") ||
    worksheetId.includes("large_numbers") ||
    ["grade4", "grade5", "grade6"].includes(grade);
  const defaultMin = isLargeNumberResource ? 1000 : 100;
  const defaultMax = isLargeNumberResource ? 9999 : 999;
  const min = finiteNumber(options.minA, defaultMin);
  const max = finiteNumber(options.maxA, defaultMax);

  return {
    min: Math.round(Math.min(min, max)),
    max: Math.round(Math.max(min, max)),
    selectedValues: []
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

function buildValuePool(range, random = Math.random) {
  const values = range.selectedValues.length
    ? range.selectedValues
    : Array.from(
        { length: Math.max(0, range.max - range.min + 1) },
        (_, index) => range.min + index
      );

  return shuffle(values, random);
}

function nextPlaceValueFormValue(options = {}, family = "place_value_form") {
  const random = options.random || Math.random;
  const generatorState = options.generatorState || {};
  const range = inferPlaceValueRange(options);
  const key = [
    family,
    range.min,
    range.max,
    range.selectedValues.join("|")
  ].join(":");

  if (!generatorState.placeValueFormPools) {
    generatorState.placeValueFormPools = {};
  }

  if (!generatorState.placeValueFormPools[key] || !generatorState.placeValueFormPools[key].length) {
    generatorState.placeValueFormPools[key] = buildValuePool(range, random);
  }

  const pool = generatorState.placeValueFormPools[key];
  const value = pool.shift();

  return {
    value,
    range,
    uniqueAvailable: range.selectedValues.length || Math.max(0, range.max - range.min + 1)
  };
}

module.exports = {
  inferPlaceValueRange,
  nextPlaceValueFormValue,
  normalizeSelectedValues
};
