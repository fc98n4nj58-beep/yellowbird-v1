const generateArithmeticProblem = require("../engines/arithmeticEngine");
const {
  nextMultiplicationModelFactorPair,
  normalizeNumberList
} = require("./multiplicationModelFactors");

const GRADE2_ADDITION_WORD_PROBLEMS_ID = "g2_addition_word_problems_within_100";
const GRADE2_MULTIPLICATION_WORD_PROBLEMS_ID = "grade2_multiplication_facts_word_problems";

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

function selectedContextsFor(contexts, options = {}) {
  const selected = [
    options.selectedContexts,
    options.contexts,
    options.selectedObjects,
    options.onlyObjects
  ]
    .flatMap((value) => Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [])
    .map((value) => String(value).trim().toLowerCase())
    .filter(Boolean);

  if (!selected.length) return contexts;

  const filtered = contexts.filter((context) => {
    const keys = [context.id, context.item, context.name, context.group]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());
    return selected.some((value) => keys.includes(value));
  });

  if (!filtered.length) {
    throw new Error(`No word-problem contexts match: ${selected.join(", ")}.`);
  }

  return filtered;
}

function selectedContextValues(options = {}) {
  return [
    options.selectedContexts,
    options.contexts,
    options.selectedObjects,
    options.onlyObjects
  ]
    .flatMap((value) => Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [])
    .map((value) => String(value).trim().toLowerCase())
    .filter(Boolean);
}

function pickBalancedAdditionContext(names, objects, random, options = {}) {
  const generatorState = options.generatorState || {};
  const state = generatorState.grade2AdditionWordProblemContext || {
    nameCounts: new Map(),
    objectCounts: new Map(),
    usedPairs: new Set(),
    recentNames: [],
    recentObjects: []
  };
  generatorState.grade2AdditionWordProblemContext = state;
  const requestedCount = Math.max(1, Number(options.questionCount || 12));
  const maxNameUses = Math.max(2, Math.ceil(requestedCount / names.length));
  const maxObjectUses = Math.max(2, Math.ceil(requestedCount / objects.length));
  let candidates = [];

  names.forEach((name) => {
    objects.forEach((object) => {
      const pairKey = `${name.id}:${object.id}`;
      if (state.usedPairs.has(pairKey)) return;
      if ((state.nameCounts.get(name.id) || 0) >= maxNameUses) return;
      if ((state.objectCounts.get(object.id) || 0) >= maxObjectUses) return;
      candidates.push({ name, object, pairKey });
    });
  });

  if (!candidates.length) {
    throw new Error("No unique addition word-problem name/object pairs remain for the selected context contract.");
  }

  const outsideRecentWindow = candidates.filter(({ name, object }) => (
    !state.recentNames.includes(name.id) && !state.recentObjects.includes(object.id)
  ));
  if (outsideRecentWindow.length) candidates = outsideRecentWindow;
  const lowestScore = Math.min(...candidates.map(({ name, object }) => (
    (state.nameCounts.get(name.id) || 0) + (state.objectCounts.get(object.id) || 0)
  )));
  candidates = candidates.filter(({ name, object }) => (
    (state.nameCounts.get(name.id) || 0) + (state.objectCounts.get(object.id) || 0) === lowestScore
  ));
  const selected = pick(candidates, random);

  state.usedPairs.add(selected.pairKey);
  state.nameCounts.set(selected.name.id, (state.nameCounts.get(selected.name.id) || 0) + 1);
  state.objectCounts.set(selected.object.id, (state.objectCounts.get(selected.object.id) || 0) + 1);
  state.recentNames = [...state.recentNames, selected.name.id].slice(-2);
  state.recentObjects = [...state.recentObjects, selected.object.id].slice(-2);
  return { ...selected.name, ...selected.object, id: selected.pairKey };
}

function pickVariedTemplate(templates, random, stateKey, options = {}) {
  const generatorState = options.generatorState || {};
  if (!generatorState.variedWordProblemTemplates) {
    generatorState.variedWordProblemTemplates = {};
  }
  const state = generatorState.variedWordProblemTemplates[stateKey] || {
    counts: new Map(),
    recent: []
  };
  generatorState.variedWordProblemTemplates[stateKey] = state;
  let candidates = templates.filter((template) => !state.recent.includes(template.id));
  if (!candidates.length) candidates = templates;
  const lowestCount = Math.min(...candidates.map((template) => state.counts.get(template.id) || 0));
  candidates = candidates.filter((template) => (state.counts.get(template.id) || 0) === lowestCount);
  const selected = pick(candidates, random);
  state.counts.set(selected.id, (state.counts.get(selected.id) || 0) + 1);
  state.recent = [...state.recent, selected.id].slice(-2);
  return selected;
}

function pickBalancedContext(contexts, random, stateKey, options = {}) {
  const generatorState = options.generatorState || {};
  if (!generatorState.balancedWordProblemContexts) {
    generatorState.balancedWordProblemContexts = {};
  }
  const state = generatorState.balancedWordProblemContexts[stateKey] || {
    counts: new Map(),
    recent: []
  };
  generatorState.balancedWordProblemContexts[stateKey] = state;
  let candidates = contexts.filter((context) => !state.recent.includes(context.id));
  if (!candidates.length) candidates = contexts;
  const lowestCount = Math.min(...candidates.map((context) => state.counts.get(context.id) || 0));
  candidates = candidates.filter((context) => (state.counts.get(context.id) || 0) === lowestCount);
  const selected = pick(candidates, random);
  state.counts.set(selected.id, (state.counts.get(selected.id) || 0) + 1);
  state.recent = [...state.recent, selected.id].slice(-2);
  return selected;
}

function additionCandidates(options = {}) {
  const selected = normalizeNumberList(options.selectedNumbers || options.onlyNumbers);
  const explicitMaxTotal = finiteNumber(options.maxTotal, null);
  const legacyMaxTotal = explicitMaxTotal === null
    ? finiteNumber(options.maxA, getMaxTotal(options))
    : explicitMaxTotal;
  const maxTotal = Math.max(2, Math.min(100, Math.round(legacyMaxTotal)));
  const minA = Math.max(1, Math.round(finiteNumber(options.minA, 1)));
  const maxA = Math.max(minA, Math.round(finiteNumber(
    options.maxA,
    Math.max(5, Math.floor(maxTotal / 2))
  )));
  const minB = Math.max(1, Math.round(finiteNumber(options.minB, 1)));
  const maxB = Math.max(minB, Math.round(finiteNumber(options.maxB, maxTotal)));
  const aValues = selected.length
    ? selected
    : Array.from({ length: maxA - minA + 1 }, (_, index) => minA + index);
  const bValues = selected.length
    ? selected
    : Array.from({ length: maxB - minB + 1 }, (_, index) => minB + index);
  const candidates = [];

  aValues.forEach((a) => {
    bValues.forEach((b) => {
      if (a + b <= maxTotal) candidates.push({ a, b, answer: a + b });
    });
  });

  if (!candidates.length) {
    throw new Error("No addition word problems are available for the selected number contract.");
  }

  return candidates;
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

function pickUniqueProblem(options, buildProblem) {
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

  if (fallbackProblem) delete fallbackProblem.key;
  return fallbackProblem;
}

function generateAdditionWordProblem(options = {}) {
  const random = options.random || Math.random;
  const candidates = additionCandidates(options);
  const baseContexts = [
    { id: "stickers", name: "Maya", pronoun: "she", item: "sticker", action: "gets", question: "does she have now" },
    { id: "shells", name: "Leo", pronoun: "he", item: "shell", action: "finds", question: "does he have now" },
    { id: "crayons", name: "Ava", pronoun: "she", item: "crayon", action: "gets", question: "does she have now" },
    { id: "blocks", name: "Noah", pronoun: "he", item: "block", action: "adds", question: "does he have now" },
    { id: "beads", name: "Ivy", pronoun: "she", item: "bead", action: "gets", question: "does she have now" },
    { id: "cards", name: "Sam", pronoun: "he", item: "card", action: "finds", question: "does he have now" }
  ];
  const isGrade2Batch3 = options.worksheetId === GRADE2_ADDITION_WORD_PROBLEMS_ID;
  const selectedValues = selectedContextValues(options);
  const grade2Names = [
    { id: "maya", name: "Maya", pronoun: "she", action: "gets", question: "does she have now" },
    { id: "leo", name: "Leo", pronoun: "he", action: "finds", question: "does he have now" },
    { id: "ava", name: "Ava", pronoun: "she", action: "gets", question: "does she have now" },
    { id: "noah", name: "Noah", pronoun: "he", action: "adds", question: "does he have now" },
    { id: "ivy", name: "Ivy", pronoun: "she", action: "gets", question: "does she have now" },
    { id: "sam", name: "Sam", pronoun: "he", action: "finds", question: "does he have now" },
    { id: "emma", name: "Emma", pronoun: "she", action: "collects", question: "does she have now" },
    { id: "liam", name: "Liam", pronoun: "he", action: "brings", question: "does he have now" }
  ];
  const grade2Objects = [
    { id: "stickers", item: "sticker" },
    { id: "shells", item: "shell" },
    { id: "crayons", item: "crayon" },
    { id: "blocks", item: "block" },
    { id: "beads", item: "bead" },
    { id: "cards", item: "card" },
    { id: "pencils", item: "pencil" },
    { id: "buttons", item: "button" }
  ];
  const matchesSelection = (entry) => selectedValues.some((value) => (
    [entry.id, entry.name, entry.item].filter(Boolean).map((part) => String(part).toLowerCase()).includes(value)
  ));
  const selectedNames = selectedValues.length && grade2Names.some(matchesSelection)
    ? grade2Names.filter(matchesSelection)
    : grade2Names;
  const selectedObjects = selectedValues.length && grade2Objects.some(matchesSelection)
    ? grade2Objects.filter(matchesSelection)
    : grade2Objects;
  if (selectedValues.length && selectedNames === grade2Names && selectedObjects === grade2Objects) {
    throw new Error(`No word-problem contexts match: ${selectedValues.join(", ")}.`);
  }
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
        `There ${a === 1 ? "is" : "are"} ${a} ${startItems} on a table. ${context.name} puts ${b} more ${moreItems} with them. How many ${totalItems} are there now?`
    },
    {
      id: "two_groups",
      build: ({ context, a, b, startItems, moreItems, totalItems }) =>
        `${context.name} sees ${a} ${startItems} in one group and ${b} ${moreItems} in another group. How many ${totalItems} does ${context.pronoun} see altogether?`
    },
    {
      id: "question_first",
      build: ({ context, a, b, startItems, moreItems, totalItems }) =>
        `How many ${totalItems} does ${context.name} have altogether if ${context.pronoun} has ${a} ${startItems} and gets ${b} more ${moreItems}?`
    },
    {
      id: "collection_grows",
      build: ({ context, a, b, startItems, moreItems, totalItems }) =>
        `${context.name} starts a collection with ${a} ${startItems}. ${capitalizeFirst(context.pronoun)} adds ${b} ${moreItems}. How many ${totalItems} are in the collection now?`
    },
    {
      id: "counting_both_sets",
      build: ({ context, a, b, startItems, moreItems, totalItems }) =>
        `${context.name} counts ${a} ${startItems} and then ${b} more ${moreItems}. How many ${totalItems} does ${context.pronoun} count in all?`
    },
    {
      id: "brought_together",
      build: ({ context, a, b, startItems, moreItems, totalItems }) =>
        `${context.name} has two sets of ${totalItems}: one set has ${a} ${startItems}, and the other has ${b} ${moreItems}. How many ${totalItems} does ${context.pronoun} have altogether?`
    }
  ];
  const activeTemplates = isGrade2Batch3 ? templates : templates.slice(0, 4);

  const finishProblem = ({ a, b, answer }, context, template) => {
    const startItems = pluralize(a, context.item);
    const moreItems = pluralize(b, context.item);
    const totalItems = pluralNoun(context.item);
    return {
      prompt: template.build({ context, a, b, startItems, moreItems, totalItems }),
      answer,
      a,
      b,
      op: "+",
      total: answer,
      contextId: context.id,
      templateId: template.id
    };
  };

  if (isGrade2Batch3) {
    const values = pickUniqueProblem(options, () => {
      const candidate = pick(candidates, random);
      return {
        ...candidate,
        key: getProblemKey("addition_word_problem", candidate.a, candidate.b, candidate.answer)
      };
    });
    const context = pickBalancedAdditionContext(selectedNames, selectedObjects, random, options);
    const template = pickVariedTemplate(activeTemplates, random, "grade2Addition", options);
    return finishProblem(values, context, template);
  }

  return withDuplicateSuppression(options, () => {
    const { a, b, answer } = pick(candidates, random);
    const context = pickFreshContext(selectedContextsFor(baseContexts, options), random, "lastAdditionWordProblemContext", options);
    const template = pickFreshTemplate(activeTemplates, random, "lastAdditionWordProblemTemplate", options);
    return {
      ...finishProblem({ a, b, answer }, context, template),
      key: getProblemKey("addition_word_problem", a, b, answer)
    };
  });
}

function generateMultiplicationWordProblem(options = {}) {
  const random = options.random || Math.random;
  const contexts = selectedContextsFor([
    { id: "bags", item: "counter", container: "bag" },
    { id: "plates", item: "cookie", container: "plate" },
    { id: "boxes", item: "crayon", container: "box", containersPlural: "boxes" },
    { id: "baskets", item: "apple", container: "basket" },
    { id: "teams", item: "player", container: "team" },
    { id: "shelves", item: "book", container: "shelf", containersPlural: "shelves", preposition: "on" }
  ], options);
  const templates = [
    {
      id: "groups_first",
      build: ({ groups, itemsPerGroup, context, groupNoun, itemNoun }) =>
        `There ${groups === 1 ? "is" : "are"} ${groups} ${groupNoun}. Each ${context.container} has ${itemsPerGroup} ${itemNoun}. How many ${pluralNoun(context.item)} are there altogether?`
    },
    {
      id: "each_group",
      build: ({ groups, itemsPerGroup, context, groupNoun, itemNoun }) =>
        `${itemsPerGroup} ${itemNoun} ${itemsPerGroup === 1 ? "is" : "are"} ${context.preposition || "in"} each ${context.container}. There ${groups === 1 ? "is" : "are"} ${groups} ${groupNoun}. How many ${pluralNoun(context.item)} are there in all?`
    },
    {
      id: "preparing_groups",
      build: ({ groups, itemsPerGroup, context, groupNoun, itemNoun }) =>
        `A class puts ${itemsPerGroup} ${itemNoun} ${context.preposition || "in"} each of ${groups} ${groupNoun}. How many ${pluralNoun(context.item)} does the class use?`
    },
    {
      id: "question_first",
      build: ({ groups, itemsPerGroup, context, groupNoun, itemNoun }) =>
        `How many ${pluralNoun(context.item)} are ${context.preposition || "in"} ${groups} ${groupNoun} if each ${context.container} has ${itemsPerGroup} ${itemNoun}?`
    },
    {
      id: "each_of_groups",
      build: ({ groups, itemsPerGroup, context, groupNoun, itemNoun }) =>
        `${groups === 1 ? "The" : `Each of ${groups}`} ${groupNoun} holds ${itemsPerGroup} ${itemNoun}. How many ${pluralNoun(context.item)} ${groups === 1 ? "does it" : `do the ${groupNoun}`} hold in all?`
    },
    {
      id: "same_number",
      build: ({ groups, itemsPerGroup, context, groupNoun, itemNoun }) =>
        `${groups} ${groupNoun} have the same number of ${pluralNoun(context.item)}. There are ${itemsPerGroup} ${itemNoun} in each one. How many ${pluralNoun(context.item)} are there altogether?`
    },
    {
      id: "count_all_groups",
      build: ({ groups, itemsPerGroup, context, groupNoun, itemNoun }) =>
        `A class counts ${itemsPerGroup} ${itemNoun} in each of ${groups} ${groupNoun}. How many ${pluralNoun(context.item)} does the class count in all?`
    },
    {
      id: "total_from_equal_groups",
      build: ({ groups, itemsPerGroup, context, groupNoun, itemNoun }) =>
        `There are ${itemsPerGroup} ${itemNoun} in every ${context.container}. If there are ${groups} ${groupNoun}, what is the total number of ${pluralNoun(context.item)}?`
    }
  ];

  const values = pickUniqueProblem(options, () => {
    const pair = nextMultiplicationModelFactorPair(options, "equal_groups");
    const groups = pair.factorA;
    const itemsPerGroup = pair.factorB;
    const answer = pair.product;
    return {
      answer,
      a: groups,
      b: itemsPerGroup,
      op: "*",
      product: answer,
      key: getProblemKey("multiplication_word_problem", groups, itemsPerGroup, answer)
    };
  });
  const groups = values.a;
  const itemsPerGroup = values.b;
  const context = pickBalancedContext(contexts, random, "grade2Multiplication", options);
  const template = pickVariedTemplate(templates, random, "grade2Multiplication", options);
  const groupNoun = groups === 1
    ? context.container
    : context.containersPlural || pluralNoun(context.container);
  const itemNoun = pluralize(itemsPerGroup, context.item);
  return {
    ...values,
    prompt: template.build({ groups, itemsPerGroup, context, groupNoun, itemNoun }),
    contextId: context.id,
    templateId: template.id
  };
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

  if (options.worksheetId === GRADE2_MULTIPLICATION_WORD_PROBLEMS_ID) {
    return generateMultiplicationWordProblem(options);
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
generateWordProblem.generateMultiplicationWordProblem = generateMultiplicationWordProblem;

module.exports = generateWordProblem;
