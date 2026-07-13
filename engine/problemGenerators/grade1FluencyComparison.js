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

function parseSelectedNumbers(options = {}) {
  return parseNumberListValue(
    options.selectedValues ?? options.selectedNumbers ?? options.onlyNumbers
  );
}

function normalizeRangeOptions(options = {}) {
  const minimumValue = finiteInteger(
    options.minimumValue ?? options.minA ?? options.minimumNumber,
    0
  );
  const maximumValue = finiteInteger(
    options.maximumValue ?? options.maxA ?? options.maxTotal ?? options.maximumNumber,
    20
  );
  const min = Math.max(0, Math.min(minimumValue, maximumValue));
  const max = Math.max(min, maximumValue);

  return { min, max };
}

function normalizeMissingPosition(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["first", "first_addend", "a", "beginning"].includes(normalized)) {
    return "first_addend";
  }
  if (["second", "second_addend", "b", "middle"].includes(normalized)) {
    return "second_addend";
  }
  return "mixed";
}

function shuffleCopy(items, random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function selectedSetFor(options = {}) {
  return new Set(parseSelectedNumbers(options));
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

function buildWeightedSequence(kind, candidates, options = {}) {
  const random = options.random || Math.random;
  const requestedCount = Math.max(1, finiteInteger(options.questionCount ?? options.studentQuestionCount, 1));
  const selected = selectedSetFor(options);
  const preferred = selected.size
    ? candidates.filter((candidate) => candidate.selectedHit)
    : [];
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

function getSequenceState(options, key, kind, builder) {
  const generatorState = options.generatorState || {};
  if (!generatorState.grade1FluencyComparison) {
    generatorState.grade1FluencyComparison = {};
  }
  if (!generatorState.grade1FluencyComparison[key]) {
    generatorState.grade1FluencyComparison[key] = builder();
  }
  return generatorState.grade1FluencyComparison[key];
}

function buildSubtractionCandidates(options = {}) {
  const { min, max } = normalizeRangeOptions(options);
  const selected = selectedSetFor(options);
  const candidates = [];

  for (let minuend = min; minuend <= max; minuend += 1) {
    for (let subtrahend = min; subtrahend <= max; subtrahend += 1) {
      const difference = minuend - subtrahend;
      if (difference < min || difference > max) continue;
      candidates.push({
        minuend,
        subtrahend,
        difference,
        selectedHit: selected.has(minuend) || selected.has(subtrahend) || selected.has(difference),
        signature: `subtraction:${minuend}:${subtrahend}:${difference}`
      });
    }
  }

  return candidates;
}

function getSubtractionState(options = {}) {
  const { min, max } = normalizeRangeOptions(options);
  const key = JSON.stringify({
    kind: "subtraction",
    min,
    max,
    selectedValues: parseSelectedNumbers(options),
    questionCount: finiteInteger(options.questionCount ?? options.studentQuestionCount, 1)
  });

  return getSequenceState(options, key, "subtraction", () =>
    buildWeightedSequence("subtraction", buildSubtractionCandidates(options), options)
  );
}

function generateSubtractionFact(options = {}) {
  const state = getSubtractionState(options);
  const fact = state.items[state.index % state.items.length];
  state.index += 1;

  return {
    type: "equation",
    prompt: `${fact.minuend} - ${fact.subtrahend} = __`,
    answer: fact.difference,
    a: fact.minuend,
    b: fact.subtrahend,
    op: "-",
    minuend: fact.minuend,
    subtrahend: fact.subtrahend,
    difference: fact.difference,
    operation: "subtraction",
    responseValues: [fact.difference],
    duplicateSignature: fact.signature,
    diagnostics: state.diagnostics
  };
}

function buildMissingAddendCandidates(options = {}) {
  const { min, max } = normalizeRangeOptions(options);
  const selected = selectedSetFor(options);
  const mode = normalizeMissingPosition(options.missingPosition ?? options.missingAddendPosition);
  const positions = mode === "mixed" ? ["first_addend", "second_addend"] : [mode];
  const candidates = [];

  for (let firstAddend = min; firstAddend <= max; firstAddend += 1) {
    for (let secondAddend = min; secondAddend <= max; secondAddend += 1) {
      const total = firstAddend + secondAddend;
      if (total < min || total > max) continue;

      positions.forEach((missingPosition) => {
        const missingValue = missingPosition === "first_addend" ? firstAddend : secondAddend;
        candidates.push({
          firstAddend,
          secondAddend,
          total,
          missingPosition,
          missingValue,
          selectedHit: selected.has(missingValue) ||
            selected.has(firstAddend) ||
            selected.has(secondAddend) ||
            selected.has(total),
          signature: `missing_addend:${firstAddend}:${secondAddend}:${total}:${missingPosition}`
        });
      });
    }
  }

  return candidates;
}

function getMissingAddendState(options = {}) {
  const { min, max } = normalizeRangeOptions(options);
  const missingPosition = normalizeMissingPosition(options.missingPosition ?? options.missingAddendPosition);
  const key = JSON.stringify({
    kind: "missing_addend",
    min,
    max,
    missingPosition,
    selectedValues: parseSelectedNumbers(options),
    questionCount: finiteInteger(options.questionCount ?? options.studentQuestionCount, 1)
  });

  return getSequenceState(options, key, "missing_addend", () => {
    if (missingPosition === "mixed") {
      return buildBalancedMissingAddendSequence(options);
    }
    return buildWeightedSequence("missing_addend", buildMissingAddendCandidates(options), options);
  });
}

function buildBalancedMissingAddendSequence(options = {}) {
  const candidates = buildMissingAddendCandidates(options);
  const requestedCount = Math.max(1, finiteInteger(options.questionCount ?? options.studentQuestionCount, 1));
  const targetCounts = {
    first_addend: Math.ceil(requestedCount / 2),
    second_addend: Math.floor(requestedCount / 2)
  };
  const firstSequence = buildWeightedSequence(
    "missing_addend",
    candidates.filter((item) => item.missingPosition === "first_addend"),
    { ...options, questionCount: targetCounts.first_addend }
  );
  const secondSequence = buildWeightedSequence(
    "missing_addend",
    candidates.filter((item) => item.missingPosition === "second_addend"),
    { ...options, questionCount: targetCounts.second_addend || 1 }
  );
  const items = balanceMissingPositions([
    ...firstSequence.items.slice(0, targetCounts.first_addend),
    ...secondSequence.items.slice(0, targetCounts.second_addend)
  ]);

  return {
    index: 0,
    kind: "missing_addend",
    requestedCount,
    uniqueCount: candidates.length,
    preferredCount: candidates.filter((candidate) => candidate.selectedHit).length,
    selectedValues: parseSelectedNumbers(options),
    diagnostics: [
      ...(candidates.length < requestedCount
        ? [lowVarietyDiagnostic("missing_addend", candidates.length, requestedCount)]
        : []),
      ...firstSequence.diagnostics,
      ...secondSequence.diagnostics
    ],
    items
  };
}

function balanceMissingPositions(items) {
  const buckets = {
    first_addend: items.filter((item) => item.missingPosition === "first_addend"),
    second_addend: items.filter((item) => item.missingPosition === "second_addend")
  };
  const targetCounts = {
    first_addend: Math.ceil(items.length / 2),
    second_addend: Math.floor(items.length / 2)
  };
  const counts = {
    first_addend: 0,
    second_addend: 0
  };
  const balanced = [];
  let index = 0;

  while (balanced.length < items.length && (buckets.first_addend.length || buckets.second_addend.length)) {
    const order = index % 2 === 0
      ? ["first_addend", "second_addend"]
      : ["second_addend", "first_addend"];
    order.forEach((position) => {
      if (balanced.length >= items.length || !buckets[position].length) return;
      if (counts[position] >= targetCounts[position] && buckets[otherMissingPosition(position)].length) return;
      balanced.push(buckets[position].shift());
      counts[position] += 1;
    });
    index += 1;
  }

  return balanced;
}

function otherMissingPosition(position) {
  return position === "first_addend" ? "second_addend" : "first_addend";
}

function generateMissingAddendFact(options = {}) {
  const state = getMissingAddendState(options);
  const fact = state.items[state.index % state.items.length];
  state.index += 1;
  const prompt = fact.missingPosition === "first_addend"
    ? `__ + ${fact.secondAddend} = ${fact.total}`
    : `${fact.firstAddend} + __ = ${fact.total}`;

  return {
    type: "equation",
    prompt,
    answer: fact.missingValue,
    a: fact.firstAddend,
    b: fact.secondAddend,
    op: "+",
    firstAddend: fact.firstAddend,
    secondAddend: fact.secondAddend,
    total: fact.total,
    missingPosition: fact.missingPosition,
    missingValue: fact.missingValue,
    responseValues: [fact.missingValue],
    duplicateSignature: fact.signature,
    diagnostics: state.diagnostics
  };
}

function compareSymbol(leftValue, rightValue) {
  if (leftValue > rightValue) return ">";
  if (leftValue < rightValue) return "<";
  return "=";
}

function buildCompareCandidates(options = {}) {
  const { min, max } = normalizeRangeOptions(options);
  const selected = selectedSetFor(options);
  const includeEqualPairs = parseBoolean(options.includeEqualPairs, true);
  const candidates = [];

  for (let leftValue = min; leftValue <= max; leftValue += 1) {
    for (let rightValue = min; rightValue <= max; rightValue += 1) {
      const symbol = compareSymbol(leftValue, rightValue);
      if (!includeEqualPairs && symbol === "=") continue;
      candidates.push({
        leftValue,
        rightValue,
        symbol,
        comparisonResult: symbol === "=" ? "equal" : symbol === ">" ? "greater_than" : "less_than",
        selectedHit: selected.has(leftValue) || selected.has(rightValue),
        signature: `compare:${leftValue}:${rightValue}:${symbol}`,
        mirrorSignature: `compare:${rightValue}:${leftValue}:${compareSymbol(rightValue, leftValue)}`
      });
    }
  }

  return candidates;
}

function buildBalancedCompareSequence(options = {}) {
  const random = options.random || Math.random;
  const requestedCount = Math.max(1, finiteInteger(options.questionCount ?? options.studentQuestionCount, 1));
  const candidates = buildCompareCandidates(options);
  const selected = selectedSetFor(options);
  const symbols = [...new Set(candidates.map((candidate) => candidate.symbol))].sort();
  const used = new Set();
  const sequence = [];
  let selectedCoverage = 0;
  const targetSelectedCoverage = selected.size ? Math.ceil(requestedCount * 2 / 3) : 0;
  const diagnostics = candidates.length < requestedCount
    ? [lowVarietyDiagnostic("compare_numbers", candidates.length, requestedCount)]
    : [];
  const symbolBuckets = symbols.reduce((acc, symbol) => {
    const bucket = candidates.filter((candidate) => candidate.symbol === symbol);
    acc[symbol] = {
      all: shuffleCopy(bucket, random),
      preferred: shuffleCopy(bucket.filter((candidate) => candidate.selectedHit), random)
    };
    return acc;
  }, {});

  if (!candidates.length) {
    throw new Error("No comparison candidates are available for the selected range.");
  }

  function takeFrom(symbol, preferSelected) {
    const bucket = symbolBuckets[symbol];
    const sources = preferSelected && bucket.preferred.length
      ? [bucket.preferred, bucket.all]
      : [bucket.all, bucket.preferred];

    for (const source of sources) {
      while (source.length) {
        const candidate = source.shift();
        if (used.has(candidate.signature)) continue;
        const previous = sequence[sequence.length - 1];
        if (
          previous &&
          previous.mirrorSignature === candidate.signature &&
          source.some((next) => !used.has(next.signature) && next.signature !== previous.mirrorSignature)
        ) {
          source.push(candidate);
          continue;
        }
        used.add(candidate.signature);
        sequence.push(candidate);
        return candidate;
      }
    }

    return null;
  }

  let cursor = 0;
  while (sequence.length < requestedCount && used.size < candidates.length) {
    const symbol = symbols[cursor % symbols.length];
    const preferSelected = selected.size && selectedCoverage < targetSelectedCoverage;
    const candidate = takeFrom(symbol, preferSelected);
    if (candidate?.selectedHit) selectedCoverage += 1;
    cursor += 1;
  }

  while (sequence.length < requestedCount) {
    const symbol = symbols[cursor % symbols.length];
    const bucket = symbolBuckets[symbol];
    const source = bucket.all.length ? bucket.all : candidates.filter((candidate) => candidate.symbol === symbol);
    const candidate = source[Math.floor(random() * source.length)] || candidates[Math.floor(random() * candidates.length)];
    sequence.push(candidate);
    cursor += 1;
  }

  return {
    index: 0,
    kind: "compare_numbers",
    requestedCount,
    uniqueCount: candidates.length,
    preferredCount: candidates.filter((candidate) => candidate.selectedHit).length,
    selectedValues: [...selected].sort((a, b) => a - b),
    diagnostics,
    items: sequence
  };
}

function getCompareState(options = {}) {
  const { min, max } = normalizeRangeOptions(options);
  const key = JSON.stringify({
    kind: "compare_numbers",
    min,
    max,
    includeEqualPairs: parseBoolean(options.includeEqualPairs, true),
    selectedValues: parseSelectedNumbers(options),
    questionCount: finiteInteger(options.questionCount ?? options.studentQuestionCount, 1)
  });

  return getSequenceState(options, key, "compare_numbers", () => buildBalancedCompareSequence(options));
}

function generateCompareNumbersFact(options = {}) {
  const state = getCompareState(options);
  const fact = state.items[state.index % state.items.length];
  state.index += 1;

  return {
    type: "equation",
    prompt: `${fact.leftValue}   ___   ${fact.rightValue}`,
    answer: fact.symbol,
    leftValue: fact.leftValue,
    rightValue: fact.rightValue,
    expectedSymbol: fact.symbol,
    comparisonResult: fact.comparisonResult,
    responseValues: [fact.symbol],
    duplicateSignature: fact.signature,
    relatedDuplicateSignature: fact.mirrorSignature,
    diagnostics: state.diagnostics
  };
}

module.exports = {
  finiteInteger,
  parseBoolean,
  parseNumberListValue,
  parseSelectedNumbers,
  normalizeRangeOptions,
  normalizeMissingPosition,
  generateSubtractionFact,
  generateMissingAddendFact,
  generateCompareNumbersFact
};
