function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function finiteNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

const GRADE2_NUMBER_LINE_IDENTIFY_ID = "grade2_place_value_representation_number_line_identify";

function shuffle(values, random = Math.random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
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

function generateNumberLineIdentifyProblem(options = {}) {
  if (options.worksheetId === GRADE2_NUMBER_LINE_IDENTIFY_ID) {
    return generateGrade2NumberLineIdentifyProblem(options);
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
