function finiteInteger(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

function parseBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (value === undefined || value === null || value === "") return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function parseNumberListValue(value) {
  const raw = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : value === undefined || value === null || value === ""
        ? []
        : [value];

  return [...new Set(
    raw
      .map((entry) => finiteInteger(String(entry).trim()))
      .filter((entry) => entry !== null)
  )].sort((a, b) => a - b);
}

function parseSelectedValues(options = {}) {
  return parseNumberListValue(
    options.selectedValues ?? options.selectedNumbers ?? options.onlyNumbers
  );
}

function numberToWords(n) {
  const value = finiteInteger(n, 0);
  const ones = [
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
    "seventeen", "eighteen", "nineteen"
  ];
  const tens = [
    "", "", "twenty", "thirty", "forty", "fifty",
    "sixty", "seventy", "eighty", "ninety"
  ];

  if (value < 0) return String(value);
  if (value < 20) return ones[value];
  if (value < 100) {
    const ten = Math.floor(value / 10);
    const one = value % 10;
    return one === 0 ? tens[ten] : `${tens[ten]}-${ones[one]}`;
  }
  if (value < 1000) {
    const hundred = Math.floor(value / 100);
    const rest = value % 100;
    return rest === 0 ? `${ones[hundred]} hundred` : `${ones[hundred]} hundred ${numberToWords(rest)}`;
  }
  return String(value);
}

function normalizeMode(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["word_to_numeral", "word-to-numeral", "numeral", "reverse"].includes(normalized)) {
    return "word_to_numeral";
  }
  return "numeral_to_word";
}

function normalizeRange(options = {}, defaults = {}) {
  const minimum = finiteInteger(
    options.minimumValue ?? options.minA ?? options.minimumNumber,
    defaults.min ?? 0
  );
  const maximum = finiteInteger(
    options.maximumValue ?? options.maxA ?? options.maximumNumber,
    defaults.max ?? 50
  );
  return {
    min: Math.min(minimum, maximum),
    max: Math.max(minimum, maximum)
  };
}

function lowVarietyDiagnostic(kind, uniqueCount, requestedCount) {
  return {
    code: "low_variety_candidate_pool",
    message: "Requested question count exceeds the unique candidate pool; controlled repetition is enabled.",
    kind,
    uniqueCount,
    requestedCount
  };
}

function shuffleCopy(items, random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildCandidateSequence(kind, candidates, options = {}) {
  const random = options.random || Math.random;
  const requestedCount = Math.max(1, finiteInteger(options.questionCount ?? options.studentQuestionCount, 1));
  const selected = new Set(parseSelectedValues(options));
  const preferred = selected.size ? candidates.filter((candidate) => candidate.selectedHit) : [];
  const sequence = [];
  const used = new Set();
  const targetPreferred = preferred.length
    ? Math.min(requestedCount, Math.ceil(requestedCount * 2 / 3))
    : 0;

  function addUnique(candidate) {
    if (!candidate || used.has(candidate.signature)) return false;
    used.add(candidate.signature);
    sequence.push(candidate);
    return true;
  }

  shuffleCopy(preferred, random).forEach((candidate) => {
    if (sequence.length < targetPreferred) addUnique(candidate);
  });

  while (sequence.length < targetPreferred && preferred.length) {
    shuffleCopy(preferred, random).forEach((candidate) => {
      if (sequence.length < targetPreferred) sequence.push(candidate);
    });
  }

  shuffleCopy(candidates, random).forEach((candidate) => {
    if (sequence.length < requestedCount) addUnique(candidate);
  });

  while (sequence.length < requestedCount && candidates.length) {
    shuffleCopy(candidates, random).forEach((candidate) => {
      if (sequence.length < requestedCount) sequence.push(candidate);
    });
  }

  if (!sequence.length) {
    throw new Error(`No ${kind} candidates are available for the selected range.`);
  }

  return {
    index: 0,
    kind,
    requestedCount,
    uniqueCount: candidates.length,
    preferredCount: preferred.length,
    selectedValues: [...selected].sort((a, b) => a - b),
    diagnostics: candidates.length < requestedCount
      ? [lowVarietyDiagnostic(kind, candidates.length, requestedCount)]
      : [],
    items: sequence
  };
}

function getSequenceState(options, key, builder) {
  const generatorState = options.generatorState || {};
  if (!generatorState.grade1NumberRepresentation) {
    generatorState.grade1NumberRepresentation = {};
  }
  if (!generatorState.grade1NumberRepresentation[key]) {
    generatorState.grade1NumberRepresentation[key] = builder();
  }
  return generatorState.grade1NumberRepresentation[key];
}

function valueCandidates(kind, options = {}, defaults = {}) {
  const { min, max } = normalizeRange(options, defaults);
  const selected = new Set(parseSelectedValues(options));
  const candidates = [];

  for (let value = min; value <= max; value += 1) {
    candidates.push({
      value,
      selectedHit: selected.has(value),
      signature: `${kind}:${value}`
    });
  }

  return candidates;
}

function generateNumberWordProblem(options = {}) {
  const mode = normalizeMode(options.numberWordDirection ?? options.numberWordMode ?? options.mode);
  const { min, max } = normalizeRange(options, { min: 0, max: 50 });
  const key = JSON.stringify({
    kind: "number_words",
    mode,
    min,
    max,
    selectedValues: parseSelectedValues(options),
    questionCount: finiteInteger(options.questionCount ?? options.studentQuestionCount, 1)
  });
  const state = getSequenceState(options, key, () =>
    buildCandidateSequence(
      "number_words",
      valueCandidates(`number_word:${mode}`, options, { min: 0, max: 50 }),
      options
    )
  );
  const item = state.items[state.index % state.items.length];
  state.index += 1;

  const word = numberToWords(item.value);
  const isWordToNumeral = mode === "word_to_numeral";

  return {
    type: "equation",
    prompt: isWordToNumeral ? word : String(item.value),
    answer: isWordToNumeral ? item.value : word,
    value: item.value,
    numberWord: word,
    numberWordMode: mode,
    responseMode: isWordToNumeral ? "shortNumeral" : "writtenNumberWord",
    responseValues: [isWordToNumeral ? item.value : word],
    duplicateSignature: `number_word:${mode}:${item.value}`,
    diagnostics: state.diagnostics
  };
}

function generateBaseTenProblem(options = {}) {
  const { min, max } = normalizeRange(options, { min: 0, max: 50 });
  if (min < 0 || max > 50) {
    throw new Error("Base Ten Blocks to 50 supports values from 0 to 50.");
  }

  const labelMode = parseBoolean(
    options.showPlaceValueLabels ?? options.baseTenTensOnesBoxes,
    String(options.responseMode || "").toLowerCase() === "tens_ones"
  );
  const key = JSON.stringify({
    kind: "base_ten",
    min,
    max,
    labelMode,
    selectedValues: parseSelectedValues(options),
    questionCount: finiteInteger(options.questionCount ?? options.studentQuestionCount, 1)
  });
  const state = getSequenceState(options, key, () =>
    buildCandidateSequence(
      "base_ten",
      valueCandidates(`base_ten:${labelMode ? "labels" : "line"}`, options, { min: 0, max: 50 }),
      options
    )
  );
  const item = state.items[state.index % state.items.length];
  state.index += 1;
  const tens = Math.floor(item.value / 10);
  const ones = item.value % 10;

  return {
    type: "equation",
    prompt: "What number is shown by the base ten blocks?",
    answer: item.value,
    value: item.value,
    tens,
    ones,
    labelMode: labelMode ? "tens_ones" : "answer_line",
    responseValues: labelMode ? [tens, ones] : [item.value],
    duplicateSignature: `base_ten:${labelMode ? "labels" : "line"}:${item.value}`,
    diagnostics: state.diagnostics,
    visual: {
      kind: "base_ten_blocks",
      data: {
        value: item.value,
        tens,
        ones
      }
    }
  };
}

function generateTenFrameProblem(options = {}) {
  const explicitMinimum = options.minimumValue ?? options.minA ?? options.minimumNumber;
  const defaults = { min: explicitMinimum === undefined ? 1 : 0, max: 10 };
  const { min, max } = normalizeRange(options, defaults);
  if (min < 0 || max > 10) {
    throw new Error("Counting With Ten Frames supports values from 0 to 10.");
  }

  const selectedValues = parseSelectedValues(options).filter((value) => value >= min && value <= max);
  const selectionMode = selectedValues.length ? "exact" : "range";
  const frameCount = Math.max(1, Math.min(10, finiteInteger(options.tenFramesPerQuestion, 1)));
  const candidateOptions = selectedValues.length
    ? { ...options, selectedValues, minA: selectedValues[0], maxA: selectedValues[selectedValues.length - 1] }
    : options;
  const candidates = selectedValues.length
    ? selectedValues.map((value) => ({
        value,
        selectedHit: true,
        signature: `ten_frame:${frameCount}:${value}`
      }))
    : valueCandidates(`ten_frame:${frameCount}`, candidateOptions, { min, max });
  const key = JSON.stringify({
    kind: "ten_frame",
    min,
    max,
    frameCount,
    selectedValues,
    questionCount: finiteInteger(options.questionCount ?? options.studentQuestionCount, 1)
  });
  const state = getSequenceState(options, key, () =>
    buildCandidateSequence("ten_frame", candidates, candidateOptions)
  );
  const item = state.items[state.index % state.items.length];
  state.index += 1;

  return {
    type: "equation",
    prompt: frameCount === 1
      ? "How many dots are shown in the ten frame?"
      : "How many dots are shown in the ten frames?",
    answer: item.value,
    value: item.value,
    representedValue: item.value,
    frameCount,
    dotArrangement: "standard_left_to_right",
    selectionMode,
    responseValues: [item.value],
    duplicateSignature: `ten_frame:${frameCount}:${item.value}`,
    diagnostics: state.diagnostics,
    visual: {
      kind: "ten_frame",
      data: {
        filled: item.value,
        frames: frameCount,
        zeroIntentional: item.value === 0
      }
    }
  };
}

module.exports = {
  finiteInteger,
  parseBoolean,
  parseNumberListValue,
  parseSelectedValues,
  numberToWords,
  normalizeMode,
  generateNumberWordProblem,
  generateBaseTenProblem,
  generateTenFrameProblem
};
