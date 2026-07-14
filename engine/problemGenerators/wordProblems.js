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

function pluralNoun(singular) {
  return pluralize(2, singular);
}

function capitalizeFirst(value) {
  const text = String(value || "");
  return text ? `${text[0].toUpperCase()}${text.slice(1)}` : text;
}

function pick(list, random) {
  return list[Math.floor(random() * list.length)];
}

function pickFreshContext(list, random, stateKey, options = {}) {
  const state = options.generatorState || {};
  const lastValue = state[stateKey];
  const candidates = list.filter((item) => {
    const signature = item.item || item.group || item.name || "";
    return signature !== lastValue;
  });
  const selected = pick(candidates.length ? candidates : list, random);
  state[stateKey] = selected.item || selected.group || selected.name || "";
  return selected;
}

function pickFreshTemplate(templates, random, stateKey, options = {}) {
  const state = options.generatorState || {};
  const lastValue = state[stateKey];
  const candidates = templates.filter((template) => template.id !== lastValue);
  const selected = pick(candidates.length ? candidates : templates, random);
  state[stateKey] = selected.id;
  return selected;
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
  const contexts = [
    { name: "Maya", pronoun: "she", item: "sticker", action: "gets", question: "does she have now" },
    { name: "Leo", pronoun: "he", item: "shell", action: "finds", question: "does he have now" },
    { name: "Ava", pronoun: "she", item: "crayon", action: "gets", question: "does she have now" },
    { name: "Noah", pronoun: "he", item: "block", action: "adds", question: "does he have now" },
    { name: "Ivy", pronoun: "she", item: "bead", action: "gets", question: "does she have now" },
    { name: "Sam", pronoun: "he", item: "card", action: "finds", question: "does he have now" }
  ];
  const templates = [
    {
      id: "start_then_more",
      build: ({ context, a, b, startItems, moreItems, totalItems }) =>
        `${context.name} has ${a} ${startItems}. ${context.name} ${context.action} ${b} more ${moreItems}. How many ${totalItems} ${context.question}?`
    },
    {
      id: "more_first",
      build: ({ context, a, b, startItems, moreItems, totalItems }) =>
        `${context.name} ${context.action} ${b} ${moreItems}. ${context.name} already had ${a} ${startItems}. How many ${totalItems} ${context.question}?`
    },
    {
      id: "after_joining",
      build: ({ context, a, b, startItems, moreItems, totalItems }) =>
        `There are ${a} ${startItems} on a table. ${context.name} puts ${b} more ${moreItems} with them. How many ${totalItems} are there now?`
    },
    {
      id: "two_groups",
      build: ({ context, a, b, startItems, moreItems, totalItems }) =>
        `${context.name} sees ${a} ${startItems} in one group and ${b} ${moreItems} in another group. How many ${totalItems} does ${context.pronoun} see altogether?`
    }
  ];

  return withDuplicateSuppression(options, () => {
    const a = randInt(1, maxPart, random);
    const b = randInt(1, Math.max(1, maxTotal - a), random);
    const answer = a + b;
    const context = pickFreshContext(contexts, random, "lastAdditionWordProblemContext", options);
    const template = pickFreshTemplate(templates, random, "lastAdditionWordProblemTemplate", options);
    const startItems = pluralize(a, context.item);
    const moreItems = pluralize(b, context.item);
    const totalItems = pluralNoun(context.item);

    return {
      prompt: template.build({ context, a, b, startItems, moreItems, totalItems }),
      answer,
      key: getProblemKey("addition_word_problem", a, b, answer)
    };
  });
}

function generateSubtractionWordProblem(options = {}) {
  const random = options.random || Math.random;
  const maxTotal = getMaxTotal(options);
  const naturalTakeAwayLanguage = Boolean(options.naturalTakeAwayLanguage);
  const contexts = [
    { name: "Noah", pronoun: "he", item: "pencil", action: "gives away", question: "does he have left" },
    { name: "Mia", pronoun: "she", item: "apple", action: "eats", question: "does she have left" },
    { name: "Owen", pronoun: "he", item: "card", action: naturalTakeAwayLanguage ? "gives away" : "shares", question: "does he have left" },
    { name: "Lily", pronoun: "she", item: "button", action: "uses", question: "does she have left" },
    { name: "Ben", pronoun: "he", item: "shell", action: "loses", question: "does he have left" },
    { name: "Zoe", pronoun: "she", item: "sticker", action: "uses", question: "does she have left" }
  ];
  const templates = [
    {
      id: "start_take",
      build: ({ context, start, taken, startItems, takenItems, leftItems }) =>
        `${context.name} has ${start} ${startItems}. ${naturalTakeAwayLanguage ? capitalizeFirst(context.pronoun) : context.name} ${context.action} ${taken} ${takenItems}. How many ${leftItems} ${context.question}?`
    },
    {
      id: "left_after",
      build: ({ context, start, taken, startItems, takenItems, leftItems }) =>
        `${context.name} starts with ${start} ${startItems}. After ${context.pronoun} ${context.action} ${taken} ${takenItems}, how many ${leftItems} are left?`
    },
    {
      id: "some_removed",
      build: ({ context, start, taken, startItems, takenItems, leftItems }) =>
        `There are ${start} ${startItems}. ${context.name} takes away ${taken} ${takenItems}. How many ${leftItems} are still there?`
    },
    {
      id: "question_first_context",
      build: ({ context, start, taken, startItems, takenItems, leftItems }) =>
        `How many ${leftItems} are left if ${context.name} has ${start} ${startItems} and ${context.action} ${taken} ${takenItems}?`
    }
  ];

  return withDuplicateSuppression(options, () => {
    const start = randInt(2, maxTotal, random);
    const taken = randInt(1, start - 1, random);
    const answer = start - taken;
    const context = pickFreshContext(contexts, random, "lastSubtractionWordProblemContext", options);
    const template = pickFreshTemplate(templates, random, "lastSubtractionWordProblemTemplate", options);
    const startItems = pluralize(start, context.item);
    const takenItems = pluralize(taken, context.item);
    const leftItems = pluralNoun(context.item);

    return {
      prompt: template.build({ context, start, taken, startItems, takenItems, leftItems }),
      answer,
      key: getProblemKey("subtraction_word_problem", start, taken, answer)
    };
  });
}

function generateMissingAddendWordProblem(options = {}) {
  const random = options.random || Math.random;
  const maxTotal = getMaxTotal(options);
  const contexts = [
    { group: "A class", action: "collect", item: "can", purpose: "for a food drive" },
    { group: "A team", action: "bring", item: "ball", purpose: "to practice" },
    { group: "A club", action: "make", item: "card", purpose: "for a display" },
    { group: "A group", action: "pack", item: "book", purpose: "for the library" },
    { group: "A family", action: "paint", item: "rock", purpose: "for a garden" },
    { group: "A table group", action: "build", item: "cube tower", purpose: "for math" }
  ];
  const templates = [
    {
      id: "wants_has",
      build: ({ context, total, have, totalItems, haveItems, moreItems }) =>
        `${context.group} wants to ${context.action} ${total} ${totalItems} ${context.purpose}. They have ${have} ${haveItems} so far. How many more ${moreItems} do they need?`
    },
    {
      id: "need_total",
      build: ({ context, total, have, totalItems, haveItems, moreItems }) =>
        `${context.group} needs ${total} ${totalItems} ${context.purpose}. They already have ${have} ${haveItems}. How many more ${moreItems} should they get?`
    },
    {
      id: "have_then_goal",
      build: ({ context, total, have, haveItems, moreItems }) =>
        `${context.group} has ${have} ${haveItems}. They want ${total} in all. How many more ${moreItems} do they need?`
    },
    {
      id: "question_first",
      build: ({ context, total, have, haveItems, moreItems }) =>
        `How many more ${moreItems} are needed if ${context.group.toLowerCase()} has ${have} ${haveItems} and wants ${total} in all?`
    }
  ];

  return withDuplicateSuppression(options, () => {
    const total = randInt(3, maxTotal, random);
    const have = randInt(1, total - 1, random);
    const answer = total - have;
    const context = pickFreshContext(contexts, random, "lastMissingAddendWordProblemContext", options);
    const template = pickFreshTemplate(templates, random, "lastMissingAddendWordProblemTemplate", options);
    const totalItems = pluralize(total, context.item);
    const haveItems = pluralize(have, context.item);
    const moreItems = pluralNoun(context.item);

    return {
      prompt: template.build({ context, total, have, totalItems, haveItems, moreItems }),
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
