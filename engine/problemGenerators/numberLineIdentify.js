function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function finiteNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

const GRADE2_NUMBER_LINE_IDENTIFY_ID = "grade2_place_value_representation_number_line_identify";
const GRADE3_NUMBER_LINE_IDENTIFY_ID = "grade3_place_value_representation_number_line_identify";
const GRADE4_NUMBER_LINE_IDENTIFY_ID = "grade4_place_value_representation_number_line_identify";
const GRADE5_NUMBER_LINE_IDENTIFY_ID = "grade5_place_value_representation_number_line_identify";
const GRADE3_SAFE_INTERVALS = Object.freeze([10, 25, 50, 100]);
const GRADE4_SAFE_INTERVALS = Object.freeze([10, 25, 50, 100, 250, 500]);
const GRADE5_SAFE_INTERVALS = Object.freeze([100, 250, 500, 1000, 2500, 5000]);

function shuffle(values, random = Math.random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function numberList(value) {
  const raw = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];
  return [...new Set(raw
    .map(Number)
    .filter(Number.isFinite)
    .map(Math.round)
  )];
}

function buildGrade2NumberLinePool(options = {}) {
  const random = options.random || Math.random;
  const minValue = Math.max(0, finiteNumber(options.minValue ?? options.minA, 0));
  const maxValue = Math.min(200, Math.max(minValue + 10, finiteNumber(options.maxValue ?? options.maxA, 200)));
  const tickCount = 10;
  const requestedIntervals = Array.isArray(options.allowedIntervals)
    ? options.allowedIntervals.map(Number).filter((value) => [1, 2, 5, 10].includes(value))
    : [1, 2, 5, 10];
  const allowedIntervals = requestedIntervals.filter(
    (interval) => minValue + tickCount * interval <= maxValue
  );
  const intervals = allowedIntervals.length ? allowedIntervals : [1];
  const allowEndpointTargets = options.allowEndpointTargets !== false;
  const pool = [];
  const used = new Set();

  for (let cycle = 0; cycle < 12; cycle += 1) {
    const intervalCycle = shuffle(intervals, random);
    for (let offset = 0; offset < intervalCycle.length; offset += 1) {
      const interval = intervalCycle[offset];
      const minimumStartIndex = Math.ceil(minValue / interval);
      const maximumStartIndex = Math.floor((maxValue - tickCount * interval) / interval);
      if (maximumStartIndex < minimumStartIndex) continue;

      let candidate = null;
      for (let attempt = 0; attempt < 40; attempt += 1) {
        const startIndex = randInt(minimumStartIndex, maximumStartIndex, random);
        const start = startIndex * interval;
        const batchPosition = pool.length % 6;
        const targetIndex = allowEndpointTargets && batchPosition === 4
          ? 0
          : allowEndpointTargets && batchPosition === 5
            ? tickCount
            : randInt(1, tickCount - 1, random);
        const signature = `${start}:${interval}:${targetIndex}`;
        if (!used.has(signature)) {
          used.add(signature);
          candidate = { start, interval, tickCount, targetIndex, signature };
          break;
        }
      }
      if (candidate) pool.push(candidate);
    }
  }

  return pool;
}

function generateGrade2NumberLineIdentifyProblem(options = {}) {
  const generatorState = options.generatorState || {};
  const key = JSON.stringify({
    minValue: options.minValue ?? options.minA ?? 0,
    maxValue: options.maxValue ?? options.maxA ?? 200,
    allowedIntervals: options.allowedIntervals || [1, 2, 5, 10],
    tickCount: 10,
    allowEndpointTargets: options.allowEndpointTargets !== false
  });

  if (!generatorState.grade2NumberLinePools) generatorState.grade2NumberLinePools = {};
  if (!generatorState.grade2NumberLinePools[key]?.length) {
    generatorState.grade2NumberLinePools[key] = buildGrade2NumberLinePool(options);
  }

  const item = generatorState.grade2NumberLinePools[key].shift();
  if (!item) throw new Error("No Grade 2 number-line identification items are available.");

  const end = item.start + item.tickCount * item.interval;
  const value = item.start + item.targetIndex * item.interval;
  return {
    type: "equation",
    prompt: "",
    answer: value,
    value,
    responseMode: "shortNumeral",
    responseValues: [value],
    duplicateSignature: `number_line_identify:${item.signature}`,
    visual: {
      kind: "number_line",
      data: {
        min: item.start,
        max: end,
        start: item.start,
        end,
        interval: item.interval,
        tickCount: item.tickCount,
        labelEvery: 1,
        targetIndex: item.targetIndex,
        highlight: value,
        value,
        hideValueLabel: true
      }
    }
  };
}

function buildGrade3NumberLinePool(options = {}) {
  const random = options.random || Math.random;
  const minValue = Math.max(0, Math.round(finiteNumber(options.minValue ?? options.minA, 100)));
  const maxValue = Math.min(1000, Math.max(minValue + 100, Math.round(finiteNumber(options.maxValue ?? options.maxA, 1000))));
  const tickCount = 10;
  const requestedIntervals = numberList(
    options.allowedIntervals || options.intervals || options.selectedIntervals
  );
  const intervals = (requestedIntervals.length ? requestedIntervals : GRADE3_SAFE_INTERVALS)
    .filter((interval) => GRADE3_SAFE_INTERVALS.includes(interval));
  if (!intervals.length || (requestedIntervals.length && intervals.length !== requestedIntervals.length)) {
    throw new Error(`Grade 3 number lines support intervals ${GRADE3_SAFE_INTERVALS.join(", ")} only.`);
  }
  const selectedTargets = numberList(options.selectedNumbers || options.onlyNumbers);
  const allowEndpointTargets = options.allowEndpointTargets !== false;
  const targetIndexes = Array.from(
    { length: allowEndpointTargets ? tickCount + 1 : tickCount - 1 },
    (_, index) => index + (allowEndpointTargets ? 0 : 1)
  );
  const candidates = [];

  intervals.forEach((interval) => {
    const firstStart = Math.ceil(minValue / interval) * interval;
    const lastStart = Math.floor((maxValue - tickCount * interval) / interval) * interval;
    for (let start = firstStart; start <= lastStart; start += interval) {
      targetIndexes.forEach((targetIndex) => {
        const targetValue = start + targetIndex * interval;
        if (selectedTargets.length && !selectedTargets.includes(targetValue)) return;
        candidates.push({
          start,
          end: start + tickCount * interval,
          interval,
          tickCount,
          targetIndex,
          targetValue,
          signature: `${start}:${interval}:${targetIndex}`
        });
      });
    }
  });
  if (!candidates.length) {
    throw new Error("No Grade 3 number-line items match the selected range, interval, endpoint, and target contract.");
  }

  const requestedCount = Math.max(1, Math.round(finiteNumber(options.questionCount, 6)));
  if (candidates.length < requestedCount) {
    throw new Error(
      `Grade 3 number lines need ${requestedCount} unique models; the selected contract provides ${candidates.length}.`
    );
  }
  const remaining = shuffle(candidates, random);
  const result = [];
  const intervalCounts = new Map();
  const targetCounts = new Map();
  for (let position = 0; position < requestedCount; position += 1) {
    const preferredIndex = allowEndpointTargets && position === 0
      ? 0
      : allowEndpointTargets && position === 1
        ? tickCount
        : null;
    let eligible = preferredIndex === null
      ? remaining.filter((candidate) => candidate.targetIndex > 0 && candidate.targetIndex < tickCount)
      : remaining.filter((candidate) => candidate.targetIndex === preferredIndex);
    if (!eligible.length) eligible = remaining;
    let bestScore = Infinity;
    eligible.forEach((candidate) => {
      const score =
        (intervalCounts.get(candidate.interval) || 0) * 3 +
        (targetCounts.get(candidate.targetValue) || 0);
      if (score < bestScore) bestScore = score;
    });
    const best = eligible.filter((candidate) => (
      (intervalCounts.get(candidate.interval) || 0) * 3 +
      (targetCounts.get(candidate.targetValue) || 0) === bestScore
    ));
    const selected = best[Math.floor(random() * best.length)];
    result.push(selected);
    remaining.splice(remaining.findIndex(({ signature }) => signature === selected.signature), 1);
    intervalCounts.set(selected.interval, (intervalCounts.get(selected.interval) || 0) + 1);
    targetCounts.set(selected.targetValue, (targetCounts.get(selected.targetValue) || 0) + 1);
  }
  return result;
}

function generateGrade3NumberLineIdentifyProblem(options = {}) {
  const generatorState = options.generatorState || {};
  const key = JSON.stringify({
    minValue: options.minValue ?? options.minA ?? 100,
    maxValue: options.maxValue ?? options.maxA ?? 1000,
    allowedIntervals: options.allowedIntervals || options.intervals || options.selectedIntervals || GRADE3_SAFE_INTERVALS,
    allowEndpointTargets: options.allowEndpointTargets !== false,
    selectedNumbers: options.selectedNumbers || options.onlyNumbers || [],
    questionCount: options.questionCount || 6
  });
  if (!generatorState.grade3NumberLinePools) generatorState.grade3NumberLinePools = {};
  if (!generatorState.grade3NumberLinePools[key]?.length) {
    generatorState.grade3NumberLinePools[key] = buildGrade3NumberLinePool(options);
  }
  const item = generatorState.grade3NumberLinePools[key].shift();
  if (!item) throw new Error("No Grade 3 number-line identification items are available.");
  const displayedLabels = Array.from(
    { length: item.tickCount + 1 },
    (_, index) => item.start + index * item.interval
  );
  return {
    type: "equation",
    prompt: "",
    answer: item.targetValue,
    value: item.targetValue,
    targetValue: item.targetValue,
    responseMode: "shortNumeral",
    responseTarget: "number_line_value",
    responseValues: [item.targetValue],
    minValue: item.start,
    maxValue: item.end,
    interval: item.interval,
    tickCount: item.tickCount,
    targetIndex: item.targetIndex,
    endpointPolicy: options.allowEndpointTargets === false ? "interior_only" : "endpoints_allowed",
    displayedLabels,
    duplicateSignature: `grade3_number_line_identify:${item.signature}`,
    visual: {
      kind: "number_line",
      data: {
        min: item.start,
        max: item.end,
        start: item.start,
        end: item.end,
        interval: item.interval,
        tickCount: item.tickCount,
        labelEvery: 1,
        targetIndex: item.targetIndex,
        highlight: item.targetValue,
        value: item.targetValue,
        hideValueLabel: true
      }
    }
  };
}

function buildGrade4NumberLinePool(options = {}) {
  const random = options.random || Math.random;
  const minValue = Math.round(finiteNumber(options.minValue ?? options.minA, 1000));
  const maxValue = Math.round(finiteNumber(options.maxValue ?? options.maxA, 10000));
  const tickCount = 10;
  const requestedIntervals = numberList(
    options.allowedIntervals || options.intervals || options.selectedIntervals
  );
  const intervals = requestedIntervals.length ? requestedIntervals : GRADE4_SAFE_INTERVALS;
  const selectedTargets = numberList(options.selectedNumbers || options.onlyNumbers);
  const allowEndpointTargets = options.allowEndpointTargets !== false;
  const targetIndexes = Array.from(
    { length: allowEndpointTargets ? tickCount + 1 : tickCount - 1 },
    (_, index) => index + (allowEndpointTargets ? 0 : 1)
  );
  const candidates = [];

  intervals.forEach((interval) => {
    const firstStart = Math.ceil(minValue / interval) * interval;
    const lastStart = Math.floor((maxValue - tickCount * interval) / interval) * interval;
    for (let start = firstStart; start <= lastStart; start += interval) {
      targetIndexes.forEach((targetIndex) => {
        const targetValue = start + targetIndex * interval;
        if (selectedTargets.length && !selectedTargets.includes(targetValue)) return;
        candidates.push({
          start,
          end: start + tickCount * interval,
          interval,
          tickCount,
          targetIndex,
          targetValue,
          signature: `${start}:${interval}:${targetIndex}`
        });
      });
    }
  });

  const requestedCount = Math.max(1, Math.round(finiteNumber(options.questionCount, 6)));
  if (candidates.length < requestedCount) {
    throw new Error(
      `Grade 4 number lines need ${requestedCount} unique models; the selected contract provides ${candidates.length}.`
    );
  }

  const remaining = shuffle(candidates, random);
  const result = [];
  const intervalCounts = new Map();
  const targetCounts = new Map();
  for (let position = 0; position < requestedCount; position += 1) {
    const preferredIndex = allowEndpointTargets && position === 0
      ? 0
      : allowEndpointTargets && position === 1
        ? tickCount
        : null;
    let eligible = preferredIndex === null
      ? remaining.filter((candidate) => (
        candidate.targetIndex > 0 && candidate.targetIndex < tickCount && !targetCounts.has(candidate.targetValue)
      ))
      : remaining.filter((candidate) => (
        candidate.targetIndex === preferredIndex && !targetCounts.has(candidate.targetValue)
      ));
    if (!eligible.length) eligible = remaining.filter((candidate) => !targetCounts.has(candidate.targetValue));
    if (!eligible.length) throw new Error("Grade 4 number-line target pool cannot provide unique marked values.");
    let bestScore = Infinity;
    eligible.forEach((candidate) => {
      const score =
        (intervalCounts.get(candidate.interval) || 0) * 4 +
        (targetCounts.get(candidate.targetValue) || 0);
      if (score < bestScore) bestScore = score;
    });
    const best = eligible.filter((candidate) => (
      (intervalCounts.get(candidate.interval) || 0) * 4 +
      (targetCounts.get(candidate.targetValue) || 0) === bestScore
    ));
    const selected = best[Math.floor(random() * best.length)];
    result.push(selected);
    remaining.splice(remaining.findIndex(({ signature }) => signature === selected.signature), 1);
    intervalCounts.set(selected.interval, (intervalCounts.get(selected.interval) || 0) + 1);
    targetCounts.set(selected.targetValue, (targetCounts.get(selected.targetValue) || 0) + 1);
  }
  return result;
}

function generateGrade4NumberLineIdentifyProblem(options = {}) {
  const generatorState = options.generatorState || {};
  const key = JSON.stringify({
    minValue: options.minValue ?? options.minA ?? 1000,
    maxValue: options.maxValue ?? options.maxA ?? 10000,
    allowedIntervals: options.allowedIntervals || options.intervals || options.selectedIntervals || GRADE4_SAFE_INTERVALS,
    allowEndpointTargets: options.allowEndpointTargets !== false,
    selectedNumbers: options.selectedNumbers || options.onlyNumbers || [],
    questionCount: options.questionCount || 6
  });
  if (!generatorState.grade4NumberLinePools) generatorState.grade4NumberLinePools = {};
  if (!generatorState.grade4NumberLinePools[key]?.length) {
    generatorState.grade4NumberLinePools[key] = buildGrade4NumberLinePool(options);
  }
  const item = generatorState.grade4NumberLinePools[key].shift();
  if (!item) throw new Error("No Grade 4 number-line identification items are available.");
  const displayedLabels = Array.from(
    { length: item.tickCount + 1 },
    (_, index) => item.start + index * item.interval
  );
  const endpointPolicy = options.allowEndpointTargets === false ? "interior_only" : "endpoints_allowed";
  return {
    type: "equation",
    prompt: "",
    answer: item.targetValue,
    value: item.targetValue,
    representedValue: item.targetValue,
    targetValue: item.targetValue,
    responseMode: "shortNumeral",
    responseTarget: "number_line_value",
    responseValues: [item.targetValue],
    taskMode: "identify_marked_number",
    minValue: item.start,
    maxValue: item.end,
    interval: item.interval,
    tickCount: item.tickCount,
    targetIndex: item.targetIndex,
    endpointPolicy,
    displayedLabels,
    answerState: { targetValue: item.targetValue },
    duplicateSignature: `grade4_number_line_identify:${item.signature}`,
    visual: {
      kind: "number_line",
      data: {
        min: item.start,
        max: item.end,
        start: item.start,
        end: item.end,
        interval: item.interval,
        tickCount: item.tickCount,
        labelEvery: 1,
        labelWidth: 38,
        formatThousands: true,
        targetIndex: item.targetIndex,
        highlight: item.targetValue,
        value: item.targetValue,
        hideValueLabel: true
      }
    }
  };
}

function buildGrade5NumberLinePool(options = {}) {
  const grade5Options = {
    ...options,
    minValue: options.minValue ?? options.minA ?? 10000,
    maxValue: options.maxValue ?? options.maxA ?? 100000,
    allowedIntervals:
      options.allowedIntervals || options.intervals || options.selectedIntervals || GRADE5_SAFE_INTERVALS
  };
  return buildGrade4NumberLinePool(grade5Options);
}

function generateGrade5NumberLineIdentifyProblem(options = {}) {
  const generatorState = options.generatorState || {};
  const key = JSON.stringify({
    minValue: options.minValue ?? options.minA ?? 10000,
    maxValue: options.maxValue ?? options.maxA ?? 100000,
    allowedIntervals:
      options.allowedIntervals || options.intervals || options.selectedIntervals || GRADE5_SAFE_INTERVALS,
    allowEndpointTargets: options.allowEndpointTargets !== false,
    selectedNumbers: options.selectedNumbers || options.onlyNumbers || [],
    questionCount: options.questionCount || 6
  });
  if (!generatorState.grade5NumberLinePools) generatorState.grade5NumberLinePools = {};
  if (!generatorState.grade5NumberLinePools[key]?.length) {
    generatorState.grade5NumberLinePools[key] = buildGrade5NumberLinePool(options);
  }
  const item = generatorState.grade5NumberLinePools[key].shift();
  if (!item) throw new Error("No Grade 5 number-line identification items are available.");
  const displayedLabels = Array.from(
    { length: item.tickCount + 1 },
    (_, index) => item.start + index * item.interval
  );
  const endpointPolicy = options.allowEndpointTargets === false ? "interior_only" : "endpoints_allowed";
  return {
    type: "equation",
    prompt: "",
    answer: item.targetValue,
    value: item.targetValue,
    representedValue: item.targetValue,
    targetValue: item.targetValue,
    responseMode: "shortNumeral",
    responseTarget: "number_line_value",
    responseValues: [item.targetValue],
    taskMode: "identify_marked_number",
    minValue: item.start,
    maxValue: item.end,
    interval: item.interval,
    tickCount: item.tickCount,
    targetIndex: item.targetIndex,
    endpointPolicy,
    displayedLabels,
    answerState: {
      kind: "grade5_place_value_representation",
      targetValue: item.targetValue,
      start: item.start,
      end: item.end,
      interval: item.interval,
      tickCount: item.tickCount,
      targetIndex: item.targetIndex,
      displayedLabels
    },
    duplicateSignature: `grade5_number_line_identify:${item.signature}`,
    visual: {
      kind: "number_line",
      data: {
        min: item.start,
        max: item.end,
        start: item.start,
        end: item.end,
        interval: item.interval,
        tickCount: item.tickCount,
        labelEvery: 1,
        labelWidth: 48,
        formatThousands: true,
        targetIndex: item.targetIndex,
        highlight: item.targetValue,
        value: item.targetValue,
        hideValueLabel: true
      }
    }
  };
}

function generateNumberLineIdentifyProblem(options = {}) {
  if (options.worksheetId === GRADE2_NUMBER_LINE_IDENTIFY_ID) {
    return generateGrade2NumberLineIdentifyProblem(options);
  }
  if (options.worksheetId === GRADE3_NUMBER_LINE_IDENTIFY_ID) {
    return generateGrade3NumberLineIdentifyProblem(options);
  }
  if (options.worksheetId === GRADE4_NUMBER_LINE_IDENTIFY_ID) {
    return generateGrade4NumberLineIdentifyProblem(options);
  }
  if (options.worksheetId === GRADE5_NUMBER_LINE_IDENTIFY_ID) {
    return generateGrade5NumberLineIdentifyProblem(options);
  }
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
  const selected = Array.isArray(options.selectedNumbers)
    ? options.selectedNumbers.filter((n) => n >= start && n <= end)
    : [];
  const value = selected.length
    ? selected[Math.floor(random() * selected.length)]
    : randInt(start, end, random);

  return {
    type: "equation",
    prompt: "What number is marked on the number line?",
    answer: value,
    visual: {
      kind: "number_line",
      data: {
        min: start,
        max: end,
        start,
        end,
        highlight: value,
        value,
        hideValueLabel: true
      }
    }
  };
}

module.exports = generateNumberLineIdentifyProblem;
module.exports.buildGrade2NumberLinePool = buildGrade2NumberLinePool;
module.exports.buildGrade3NumberLinePool = buildGrade3NumberLinePool;
module.exports.buildGrade4NumberLinePool = buildGrade4NumberLinePool;
module.exports.buildGrade5NumberLinePool = buildGrade5NumberLinePool;
module.exports.GRADE3_SAFE_INTERVALS = GRADE3_SAFE_INTERVALS;
module.exports.GRADE4_SAFE_INTERVALS = GRADE4_SAFE_INTERVALS;
module.exports.GRADE5_SAFE_INTERVALS = GRADE5_SAFE_INTERVALS;
