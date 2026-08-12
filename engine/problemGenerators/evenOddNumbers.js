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

function takeUniqueNumber({ min, max, parity, used, random }) {
  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const value = randInt(min, max, random);
    if (value % 2 !== parity || used.has(value)) continue;
    used.add(value);
    return value;
  }
  throw new Error("Even-and-odd candidate range is too small.");
}

function buildPool(options = {}) {
  const random = options.random || Math.random;
  const min = Number(options.minValue ?? options.minA ?? 0);
  const max = Number(options.maxValue ?? options.maxA ?? 200);
  const count = Number(options.questionCount || 12);
  if (count !== 12) throw new Error("Even-and-odd worksheets require exactly 12 questions.");

  const used = new Set();
  const classifyItems = [];
  for (let index = 0; index < 6; index += 1) {
    const value = takeUniqueNumber({ min, max, parity: index % 2, used, random });
    classifyItems.push({
      prompt: String(value),
      answer: value % 2 === 0 ? "even" : "odd",
      taskMode: "classify",
      value,
      responseValues: ["Even", "Odd"],
      responseTarget: "parity_choice"
    });
  }
  const selectItems = [];
  for (let index = 0; index < 4; index += 1) {
    const requestedParity = index % 2;
    const answer = takeUniqueNumber({ min, max, parity: requestedParity, used, random });
    const other = takeUniqueNumber({ min, max, parity: 1 - requestedParity, used, random });
    const pair = random() < 0.5 ? [answer, other] : [other, answer];
    const label = requestedParity === 0 ? "even" : "odd";
    selectItems.push({
      prompt: `Circle the ${label} number.`,
      answer,
      taskMode: "select",
      taskAction: `select_${label}`,
      leftValue: pair[0],
      rightValue: pair[1],
      responseValues: pair,
      responseTarget: "number_choice"
    });
  }
  const ruleItems = [{
    prompt: "An even number can be split into two ______ groups.",
    answer: "equal",
    taskMode: "rule",
    taskAction: "complete_even_rule",
    responseTarget: "short_word"
  }, {
    prompt: "When you make pairs with an odd number, ______ is left over.",
    answer: "one",
    taskMode: "rule",
    taskAction: "complete_odd_rule",
    responseTarget: "short_word"
  }];
  return [
    ...shuffle(classifyItems, random),
    ...shuffle(selectItems, random),
    ...ruleItems
  ];
}

function generateEvenOddNumbersProblem(options = {}) {
  const state = options.generatorState || {};
  const key = JSON.stringify({
    min: options.minValue ?? options.minA ?? 0,
    max: options.maxValue ?? options.maxA ?? 200,
    count: options.questionCount || 12
  });
  if (!state.evenOddPools) state.evenOddPools = {};
  if (!state.evenOddPools[key]?.length) state.evenOddPools[key] = buildPool(options);
  const item = state.evenOddPools[key].shift();
  return {
    type: "equation",
    prompt: item.prompt,
    answer: item.answer,
    taskMode: item.taskMode,
    taskAction: item.taskAction || null,
    value: item.value,
    leftValue: item.leftValue,
    rightValue: item.rightValue,
    responseValues: item.responseValues || null,
    responseTarget: item.responseTarget,
    responseType: typeof item.answer === "number" ? "number" : "word",
    duplicateSignature: `even_odd:${item.taskMode}:${item.prompt}:${[
      item.value,
      item.leftValue,
      item.rightValue,
      item.taskAction
    ].filter((value) => value !== undefined && value !== null).join(":")}`
  };
}

module.exports = generateEvenOddNumbersProblem;
module.exports.buildEvenOddPool = buildPool;
