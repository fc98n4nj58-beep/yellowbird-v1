const generateArithmeticProblem = require("../engines/arithmeticEngine");

function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function finiteNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getContext(options = {}) {
  return [
    options.activityType,
    options.preferredActivityType,
    options.worksheetId,
    options.worksheetTitle,
    options.skillKey
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getMaxTotal(options = {}) {
  const explicitMax = finiteNumber(options.maxA, null);
  if (explicitMax !== null) return Math.max(10, explicitMax);

  const context = getContext(options);

  if (context.includes("within_100") || context.includes("to_100")) {
    return 100;
  }

  if (context.includes("grade2") || context.includes("grade 2")) {
    return 100;
  }

  return 20;
}

function getProblemKey(activityType, a, b, answer) {
  return `${activityType}:${a}:${b}:${answer}`;
}

function pluralize(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

function withDuplicateSuppression(options, buildProblem) {
  const usedProblemKeys = options.usedProblemKeys || new Set();
  let fallbackProblem = null;

  for (let attempt = 0; attempt < 60; attempt++) {
    const problem = buildProblem();
    fallbackProblem = problem;

    if (!usedProblemKeys.has(problem.key)) {
      usedProblemKeys.add(problem.key);
      delete problem.key;
      return problem;
    }
  }

  if (fallbackProblem) {
    delete fallbackProblem.key;
  }

  return fallbackProblem;
}

function generateAdditionWordProblem(options = {}) {
  const random = options.random || Math.random;
  const maxTotal = getMaxTotal(options);
  const maxPart = Math.max(5, Math.floor(maxTotal / 2));

  return withDuplicateSuppression(options, () => {
    const a = randInt(1, maxPart, random);
    const b = randInt(1, Math.max(1, maxTotal - a), random);
    const answer = a + b;

    return {
      prompt: `Maya has ${a} stickers. She gets ${b} more stickers. How many stickers does she have now?`,
      answer,
      key: getProblemKey("addition_word_problem", a, b, answer)
    };
  });
}

function generateSubtractionWordProblem(options = {}) {
  const random = options.random || Math.random;
  const maxTotal = getMaxTotal(options);

  return withDuplicateSuppression(options, () => {
    const start = randInt(2, maxTotal, random);
    const taken = randInt(1, start - 1, random);
    const answer = start - taken;

    return {
      prompt: `Noah has ${start} ${pluralize(start, "pencil")}. He gives away ${taken} ${pluralize(taken, "pencil")}. How many pencils does he have left?`,
      answer,
      key: getProblemKey("subtraction_word_problem", start, taken, answer)
    };
  });
}

function generateMissingAddendWordProblem(options = {}) {
  const random = options.random || Math.random;
  const maxTotal = getMaxTotal(options);

  return withDuplicateSuppression(options, () => {
    const total = randInt(3, maxTotal, random);
    const have = randInt(1, total - 1, random);
    const answer = total - have;

    return {
      prompt: `A class wants to collect ${total} ${pluralize(total, "can")} for a food drive. They have ${have} ${pluralize(have, "can")} so far. How many more cans do they need?`,
      answer,
      key: getProblemKey("missing_addend_word_problem", have, total, answer)
    };
  });
}

function generateWordProblem(options = {}) {
  const context = getContext(options);

  if (context.includes("subtraction_word_problem")) {
    return generateSubtractionWordProblem(options);
  }

  if (context.includes("missing_addend_word_problem")) {
    return generateMissingAddendWordProblem(options);
  }

  if (
    context.includes("addition_word_problem") ||
    context.includes("addition_subtraction")
  ) {
    return generateAdditionWordProblem(options);
  }

  return generateArithmeticProblem({
    operation: "multiplication",
    format: "equal_groups",
    minA: 2,
    maxA: 10,
    minB: 2,
    maxB: 10,
    random: options.random
  });
}

generateWordProblem.generateAdditionWordProblem = generateAdditionWordProblem;
generateWordProblem.generateSubtractionWordProblem = generateSubtractionWordProblem;
generateWordProblem.generateMissingAddendWordProblem = generateMissingAddendWordProblem;

module.exports = generateWordProblem;
