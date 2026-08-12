const PLACE_LABELS = Object.freeze({ 10: "ten", 100: "hundred", 1000: "thousand" });

function randInt(min, max, random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function shuffle(values, random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function roundToPlace(value, place) {
  return Math.floor((value + place / 2) / place) * place;
}

function buildPool(options = {}) {
  const random = options.random || Math.random;
  const min = Number(options.minValue ?? 0);
  const max = Number(options.maxValue ?? 1000);
  const places = (options.allowedPlaces || [10, 100]).map(Number);
  const count = Number(options.questionCount || 12);
  if (!places.length || places.some((place) => !PLACE_LABELS[place])) {
    throw new Error("Rounding places must be ten, hundred, or thousand.");
  }
  if (count % places.length !== 0) throw new Error("Rounding questions must balance target places.");

  const perPlace = count / places.length;
  const used = new Set();
  const items = [];
  for (const place of places) {
    const boundaryValue = Math.floor(max / place) * place - place / 2;
    const sectionItems = [];
    for (let index = 0; index < perPlace; index += 1) {
      let value;
      for (let attempt = 0; attempt < 4000; attempt += 1) {
        const isMidpoint = options.boundaryCasesOnly || index === perPlace - 2;
        const isBoundary = !options.boundaryCasesOnly && index === perPlace - 1;
        if (isBoundary) {
          value = boundaryValue;
        } else if (isMidpoint) {
          const midpointIndex = randInt(0, Math.max(0, Math.floor((max - place / 2) / place)), random);
          value = midpointIndex * place + place / 2;
          if (!options.boundaryCasesOnly && value === boundaryValue) continue;
        } else {
          value = randInt(min, max, random);
          if (value % place === place / 2) continue;
        }
        const signature = `${place}:${value}`;
        if (value >= min && value <= max && !used.has(signature)) {
          used.add(signature);
          break;
        }
        value = undefined;
      }
      if (value === undefined) throw new Error("Rounding candidate range is too small.");
      sectionItems.push({
        value,
        place,
        answer: roundToPlace(value, place),
        taskMode: `nearest_${PLACE_LABELS[place]}`,
        taskAction: options.boundaryCasesOnly
          ? "midpoint"
          : index === perPlace - 2
            ? "midpoint"
            : index === perPlace - 1
              ? "boundary"
              : "practice"
      });
    }
    items.push(...sectionItems);
  }
  return items;
}

function generateRoundWholeNumbersProblem(options = {}) {
  const state = options.generatorState || {};
  const key = JSON.stringify({
    min: options.minValue ?? 0,
    max: options.maxValue ?? 1000,
    places: options.allowedPlaces || [10, 100],
    count: options.questionCount || 12,
    boundaryCasesOnly: Boolean(options.boundaryCasesOnly)
  });
  if (!state.roundingPools) state.roundingPools = {};
  if (!state.roundingPools[key]?.length) state.roundingPools[key] = buildPool(options);
  const item = state.roundingPools[key].shift();
  return {
    type: "equation",
    prompt: item.value.toLocaleString("en-CA"),
    answer: item.answer,
    taskMode: item.taskMode,
    taskAction: item.taskAction,
    responseTarget: "numeric_line",
    value: item.value,
    targetValue: item.answer,
    interval: item.place,
    responseType: "number",
    duplicateSignature: `round:${item.place}:${item.value}`
  };
}

module.exports = generateRoundWholeNumbersProblem;
module.exports.buildRoundingPool = buildPool;
module.exports.roundToPlace = roundToPlace;
