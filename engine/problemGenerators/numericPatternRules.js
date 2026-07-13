const { createSeededRandom } = require("../../utils/seededRandom");

const DEFAULTS_BY_PURPOSE = Object.freeze({
  extend_pattern: Object.freeze({
    minStart: 0,
    maxStart: 20,
    minStep: 1,
    maxStep: 5,
    minValue: 0,
    maxValue: 100,
    operationMode: "add",
    visibleLength: 4,
    continuationCount: 1
  }),
  missing_value_pattern: Object.freeze({
    minStart: 0,
    maxStart: 20,
    minStep: 1,
    maxStep: 5,
    minValue: 0,
    maxValue: 100,
    operationMode: "add",
    sequenceLength: 5,
    missingTermCount: 1,
    missingTermPlacement: "middle"
  }),
  identify_pattern_rule: Object.freeze({
    minStart: 0,
    maxStart: 20,
    minStep: 1,
    maxStep: 5,
    minValue: 0,
    maxValue: 100,
    operationMode: "add",
    sequenceLength: 5
  }),
  function_table: Object.freeze({
    minStart: 0,
    maxStart: 20,
    minStep: 1,
    maxStep: 5,
    minValue: 0,
    maxValue: 100,
    operationMode: "add",
    sequenceLength: 4
  })
});

function finiteNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clampInt(value, min, max, fallback) {
  const n = Math.floor(finiteNumber(value, fallback));
  return Math.max(min, Math.min(max, n));
}

function firstDefined(source, keys, fallback) {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null && source[key] !== "") {
      return source[key];
    }
  }
  return fallback;
}

function normalizeOperationMode(value, fallback = "add") {
  const normalized = String(value || fallback).trim().toLowerCase();
  if (["subtract", "subtraction", "minus", "-"].includes(normalized)) return "subtract";
  if (["mixed", "add_subtract", "addition_subtraction"].includes(normalized)) return "mixed";
  return "add";
}

function publicPlacement(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "random") return "mixed";
  if (["beginning", "middle", "end", "mixed"].includes(normalized)) return normalized;
  return "middle";
}

function operationsForMode(mode) {
  if (mode === "mixed") return ["add", "subtract"];
  return [mode === "subtract" ? "subtract" : "add"];
}

function gradeDefaultMaxValue(grade, fallback) {
  if (grade === "kindergarten" || grade === "grade1" || grade === "grade2") return Math.min(fallback, 100);
  if (grade === "grade3" || grade === "grade4") return Math.max(fallback, 120);
  return Math.max(fallback, 200);
}

function buildSequence({ operation, start, step, length }) {
  const direction = operation === "subtract" ? -1 : 1;
  return Array.from({ length }, (_, index) => start + direction * step * index);
}

function ruleText(operation, step) {
  const verb = operation === "subtract" ? "Subtract" : "Add";
  return `${verb} ${step} each time.`;
}

function shuffle(values, random) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function normalizeNumericPatternOptions(purpose, options = {}) {
  const defaults = DEFAULTS_BY_PURPOSE[purpose] || DEFAULTS_BY_PURPOSE.extend_pattern;
  const sequenceLength = clampInt(
    firstDefined(options, ["sequenceLength", "termCount"], defaults.sequenceLength || defaults.visibleLength),
    3,
    12,
    defaults.sequenceLength || defaults.visibleLength
  );
  const visibleLength = clampInt(
    firstDefined(options, ["visibleLength", "shownTermCount"], defaults.visibleLength || sequenceLength),
    2,
    12,
    defaults.visibleLength || sequenceLength
  );
  const continuationCount = clampInt(
    firstDefined(options, ["continuationCount", "extensionCount", "answerCount"], defaults.continuationCount || 1),
    1,
    4,
    defaults.continuationCount || 1
  );
  const missingTermCount = clampInt(
    firstDefined(options, ["missingTermCount", "missingCount"], defaults.missingTermCount || 1),
    1,
    Math.max(1, sequenceLength - 2),
    defaults.missingTermCount || 1
  );
  const requestedStart = firstDefined(options, ["startingValue", "startNumber"], null);
  const minStart = clampInt(
    requestedStart !== null
      ? requestedStart
      : firstDefined(options, ["minStart", "minimumStart", "minimumValue"], defaults.minStart),
    0,
    1000,
    defaults.minStart
  );
  const maxStartFallback = requestedStart !== null ? requestedStart : defaults.maxStart;
  const maxStart = clampInt(
    firstDefined(options, ["maxStart", "maximumStart", "maximumValue"], maxStartFallback),
    minStart,
    1000,
    maxStartFallback
  );
  const fixedStep = firstDefined(options, ["sequenceStep", "step"], null);
  const minStep = clampInt(
    fixedStep !== null ? fixedStep : firstDefined(options, ["minStep", "minimumStep"], defaults.minStep),
    1,
    100,
    defaults.minStep
  );
  const maxStep = clampInt(
    fixedStep !== null ? fixedStep : firstDefined(options, ["maxStep", "maximumStep"], defaults.maxStep),
    minStep,
    100,
    defaults.maxStep
  );
  const maxValue = clampInt(
    firstDefined(options, ["maxValue", "maximumSequenceValue"], gradeDefaultMaxValue(options.grade, defaults.maxValue)),
    0,
    5000,
    gradeDefaultMaxValue(options.grade, defaults.maxValue)
  );
  const missingTermPlacement = String(
    firstDefined(options, ["missingTermPlacement", "missingPlacement"], defaults.missingTermPlacement || "middle")
  ).toLowerCase();

  return Object.freeze({
    purpose,
    operationMode: normalizeOperationMode(firstDefined(options, ["operationMode", "operation", "ruleType"], defaults.operationMode)),
    minStart,
    maxStart,
    minStep,
    maxStep,
    minValue: clampInt(firstDefined(options, ["minValue", "minimumSequenceValue"], defaults.minValue), 0, maxValue, defaults.minValue),
    maxValue,
    sequenceLength,
    visibleLength,
    continuationCount,
    missingTermCount,
    missingTermPlacement: ["beginning", "middle", "end", "random"].includes(missingTermPlacement)
      ? missingTermPlacement
      : defaults.missingTermPlacement || "middle"
  });
}

function missingIndexesForPattern(options, sequence, random) {
  const count = options.sequenceLength;
  const maxMissing = Math.max(1, count - 2);
  const missingCount = Math.min(options.missingTermCount, maxMissing);
  const indexes = Array.from({ length: count }, (_, index) => index);

  if (options.missingTermPlacement === "beginning") {
    return indexes.slice(0, missingCount);
  }

  if (options.missingTermPlacement === "end") {
    return indexes.slice(count - missingCount);
  }

  const interior = count > 3 ? indexes.slice(1, count - 1) : indexes;
  if (options.missingTermPlacement === "random") {
    return shuffle(interior, random).slice(0, missingCount).sort((a, b) => a - b);
  }

  const middle = Math.floor((count - missingCount) / 2);
  return indexes.slice(middle, middle + missingCount);
}

function candidateSignature(candidate) {
  const missing = candidate.missingIndexes?.join("-") || "";
  return [
    candidate.purpose,
    candidate.operation,
    candidate.start,
    candidate.step,
    candidate.sequence.length,
    candidate.visibleLength || "",
    candidate.continuationAnswers?.length || "",
    missing
  ].join(":");
}

function buildCandidatePool(purpose, normalizedOptions, random) {
  const length = purpose === "extend_pattern"
    ? normalizedOptions.visibleLength + normalizedOptions.continuationCount
    : normalizedOptions.sequenceLength;
  const pool = [];

  operationsForMode(normalizedOptions.operationMode).forEach((operation) => {
    for (let step = normalizedOptions.minStep; step <= normalizedOptions.maxStep; step += 1) {
      for (let start = normalizedOptions.minStart; start <= normalizedOptions.maxStart; start += 1) {
        const sequence = buildSequence({ operation, start, step, length });
        if (sequence.some((value) => value < normalizedOptions.minValue || value > normalizedOptions.maxValue)) {
          continue;
        }

        const candidate = {
          purpose,
          operation,
          step,
          start,
          sequence,
          fullSequence: sequence,
          visibleLength: purpose === "extend_pattern" ? normalizedOptions.visibleLength : sequence.length,
          continuationAnswers: purpose === "extend_pattern"
            ? sequence.slice(normalizedOptions.visibleLength)
            : [],
          missingIndexes: purpose === "missing_value_pattern"
            ? missingIndexesForPattern(normalizedOptions, sequence, random)
            : [],
          ruleText: ruleText(operation, step)
        };

        candidate.missingValues = candidate.missingIndexes.map((index) => sequence[index]);
        candidate.functionTablePairs = sequence.map((input, index) => ({
          input,
          output: operation === "subtract" ? input - step : input + step,
          isPromptRow: index === 0
        }));
        candidate.signature = candidateSignature(candidate);
        pool.push(Object.freeze(candidate));
      }
    }
  });

  return shuffle(pool, random);
}

function stateKey(purpose, normalizedOptions) {
  return JSON.stringify({
    purpose,
    operationMode: normalizedOptions.operationMode,
    minStart: normalizedOptions.minStart,
    maxStart: normalizedOptions.maxStart,
    minStep: normalizedOptions.minStep,
    maxStep: normalizedOptions.maxStep,
    minValue: normalizedOptions.minValue,
    maxValue: normalizedOptions.maxValue,
    sequenceLength: normalizedOptions.sequenceLength,
    visibleLength: normalizedOptions.visibleLength,
    continuationCount: normalizedOptions.continuationCount,
    missingTermCount: normalizedOptions.missingTermCount,
    missingTermPlacement: normalizedOptions.missingTermPlacement
  });
}

function nextNumericPattern(purpose, options = {}) {
  const random = typeof options.random === "function"
    ? options.random
    : createSeededRandom(options.worksheetSeed || "yellowbird-default");
  const generatorState = options.generatorState || {};
  const usedProblemKeys = options.usedProblemKeys || new Set();
  const normalizedOptions = normalizeNumericPatternOptions(purpose, options);
  const key = stateKey(purpose, normalizedOptions);

  generatorState.numericPatternPools = generatorState.numericPatternPools || {};
  if (!generatorState.numericPatternPools[key]) {
    const pool = buildCandidatePool(purpose, normalizedOptions, random);
    generatorState.numericPatternPools[key] = {
      pool,
      index: 0,
      cycle: 0,
      uniqueCount: pool.length,
      requestedCount: Number(options.studentQuestionCount || options.questionCount || 0) || 0
    };
  }

  const state = generatorState.numericPatternPools[key];
  if (!state.pool.length) {
    throw new Error(`No numeric pattern candidates available for ${purpose}.`);
  }

  for (let attempts = 0; attempts < state.pool.length; attempts += 1) {
    const candidate = state.pool[state.index % state.pool.length];
    state.index += 1;
    const signature = candidate.signature;

    if (!usedProblemKeys.has(signature)) {
      usedProblemKeys.add(signature);
      return candidate;
    }
  }

  state.cycle += 1;
  const repeated = state.pool[state.index % state.pool.length];
  state.index += 1;
  usedProblemKeys.add(`${repeated.signature}:repeat:${state.cycle}`);
  return repeated;
}

function blankedSequenceText(sequence, missingIndexes = []) {
  const missing = new Set(missingIndexes);
  return sequence.map((value, index) => missing.has(index) ? "__" : value).join(", ");
}

function valuesAnswer(values) {
  return values.length === 1 ? String(values[0]) : values.join(", ");
}

function buildNumericPatternProblem(purpose, options = {}) {
  const pattern = nextNumericPattern(purpose, options);
  const poolState = options.generatorState?.numericPatternPools
    ? Object.values(options.generatorState.numericPatternPools).find((state) =>
      Array.isArray(state.pool) && state.pool.some((candidate) => candidate.signature === pattern.signature)
    )
    : null;
  const diagnostics = poolState && poolState.requestedCount > poolState.uniqueCount
    ? [{
        code: "low_variety_candidate_pool",
        message: "Requested question count exceeds the unique numeric pattern candidate pool; controlled repetition is enabled.",
        uniqueCount: poolState.uniqueCount,
        requestedCount: poolState.requestedCount
      }]
    : [];

  if (purpose === "missing_value_pattern") {
    return {
      type: "equation",
      prompt: blankedSequenceText(pattern.sequence, pattern.missingIndexes),
      answer: valuesAnswer(pattern.missingValues),
      responseValues: pattern.missingValues,
      sequence: pattern.sequence.map((value, index) => pattern.missingIndexes.includes(index) ? null : value),
      missingIndex: pattern.missingIndexes[0],
      missingIndexes: pattern.missingIndexes,
      step: pattern.step,
      patternKind: purpose,
      patternRule: pattern.ruleText,
      patternOperation: pattern.operation,
      missingTermPlacement: publicPlacement(options.missingTermPlacement || options.missingPlacement),
      diagnostics,
      pattern
    };
  }

  if (purpose === "identify_pattern_rule") {
    return {
      type: "equation",
      prompt: pattern.sequence.join(", "),
      answer: pattern.ruleText,
      sequence: pattern.sequence,
      step: pattern.step,
      patternKind: purpose,
      patternRule: pattern.ruleText,
      patternOperation: pattern.operation,
      diagnostics,
      pattern
    };
  }

  if (purpose === "function_table") {
    const row = pattern.functionTablePairs[0];
    return {
      type: "equation",
      prompt: `Function table: input ${row.input}, rule ${pattern.ruleText.replace(".", "")}, output = __`,
      answer: String(row.output),
      responseValues: [row.output],
      sequence: pattern.sequence,
      step: pattern.step,
      patternKind: purpose,
      patternRule: pattern.ruleText,
      patternOperation: pattern.operation,
      diagnostics,
      pattern
    };
  }

  const visible = pattern.sequence.slice(0, pattern.visibleLength);
  return {
    type: "equation",
    prompt: `${visible.join(", ")}, ${Array(pattern.continuationAnswers.length).fill("__").join(", ")}`,
    answer: valuesAnswer(pattern.continuationAnswers),
    responseValues: pattern.continuationAnswers,
    sequence: pattern.sequence,
    step: pattern.step,
    patternKind: purpose,
    patternRule: pattern.ruleText,
    patternOperation: pattern.operation,
    continuationCount: pattern.continuationAnswers.length,
    continuationAnswers: pattern.continuationAnswers,
    diagnostics,
    pattern
  };
}

module.exports = {
  buildNumericPatternProblem,
  buildCandidatePool,
  candidateSignature,
  normalizeNumericPatternOptions,
  nextNumericPattern,
  ruleText
};
