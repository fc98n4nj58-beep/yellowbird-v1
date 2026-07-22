const generateArithmeticProblem = require("../engines/arithmeticEngine");
const {
  nextMultiplicationModelFactorPair,
  normalizeNumberList
} = require("./multiplicationModelFactors");

const GRADE2_ADDITION_WORD_PROBLEMS_ID = "g2_addition_word_problems_within_100";
const GRADE2_MULTIPLICATION_WORD_PROBLEMS_ID = "grade2_multiplication_facts_word_problems";
const GRADE3_ADDITION_WORD_PROBLEMS_ID = "grade3_addition_subtraction_word_problems_addition_word_problem";
const GRADE3_MISSING_ADDEND_WORD_PROBLEMS_ID = "grade3_addition_subtraction_word_problems_missing_addend_word_problem";
const GRADE3_SUBTRACTION_WORD_PROBLEMS_ID = "grade3_addition_subtraction_word_problems_subtraction_word_problem";
const GRADE3_STORY_PROBLEM_IDS = new Set([
  GRADE3_ADDITION_WORD_PROBLEMS_ID,
  GRADE3_MISSING_ADDEND_WORD_PROBLEMS_ID,
  GRADE3_SUBTRACTION_WORD_PROBLEMS_ID
]);
const GRADE4_ADDITION_STORY_ID = "grade4_addition_subtraction_word_problems_addition_word_problem";
const GRADE4_MISSING_ADDEND_STORY_ID = "grade4_addition_subtraction_word_problems_missing_addend_word_problem";
const GRADE4_SUBTRACTION_STORY_ID = "grade4_addition_subtraction_word_problems_subtraction_word_problem";
const GRADE4_STORY_PROBLEM_IDS = new Set([
  GRADE4_ADDITION_STORY_ID,
  GRADE4_MISSING_ADDEND_STORY_ID,
  GRADE4_SUBTRACTION_STORY_ID
]);

const GRADE3_STORY_NAMES = Object.freeze([
  { id: "maya", name: "Maya", pronoun: "she" },
  { id: "leo", name: "Leo", pronoun: "he" },
  { id: "ava", name: "Ava", pronoun: "she" },
  { id: "noah", name: "Noah", pronoun: "he" },
  { id: "ivy", name: "Ivy", pronoun: "she" },
  { id: "sam", name: "Sam", pronoun: "they" },
  { id: "emma", name: "Emma", pronoun: "she" },
  { id: "liam", name: "Liam", pronoun: "he" }
]);

const GRADE3_STORY_OBJECTS = Object.freeze([
  { id: "books", item: "book" },
  { id: "pencils", item: "pencil" },
  { id: "beads", item: "bead" },
  { id: "stickers", item: "sticker" },
  { id: "cards", item: "card" },
  { id: "shells", item: "shell" },
  { id: "markers", item: "marker" },
  { id: "buttons", item: "button" }
]);

const GRADE4_STORY_NAMES = GRADE3_STORY_NAMES;
const GRADE4_STORY_OBJECTS = Object.freeze([
  { id: "books", item: "book" },
  { id: "tickets", item: "ticket" },
  { id: "points", item: "point" },
  { id: "notebooks", item: "notebook" },
  { id: "pencils", item: "pencil" },
  { id: "cans", item: "can" },
  { id: "flyers", item: "flyer" },
  { id: "badges", item: "badge" },
  { id: "seedlings", item: "seedling" },
  { id: "bottles", item: "bottle" }
]);

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

function normalizedTextList(...values) {
  return values
    .flatMap((value) => Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [])
    .map((value) => String(value).trim().toLowerCase())
    .filter(Boolean);
}

function filterGrade3StoryEntries(entries, selected, keys, label) {
  if (!selected.length) return entries;
  const filtered = entries.filter((entry) => selected.some((value) => (
    keys.some((key) => String(entry[key] || "").toLowerCase() === value)
  )));
  if (!filtered.length) {
    throw new Error(`No Grade 3 word-problem ${label} match: ${selected.join(", ")}.`);
  }
  return filtered;
}

function grade3StoryPools(options = {}) {
  const selectedContexts = normalizedTextList(options.selectedContexts, options.contexts);
  const selectedObjects = normalizedTextList(options.selectedObjects, options.onlyObjects);
  let names = GRADE3_STORY_NAMES;
  let objects = GRADE3_STORY_OBJECTS;
  if (selectedContexts.length) {
    const matchingNames = names.filter((entry) => selectedContexts.some((value) => (
      [entry.id, entry.name].some((part) => String(part || "").toLowerCase() === value)
    )));
    const matchingObjects = objects.filter((entry) => selectedContexts.some((value) => (
      [entry.id, entry.item].some((part) => String(part || "").toLowerCase() === value)
    )));
    if (!matchingNames.length && !matchingObjects.length) {
      throw new Error(`No Grade 3 word-problem contexts match: ${selectedContexts.join(", ")}.`);
    }
    if (matchingNames.length) names = matchingNames;
    if (matchingObjects.length) objects = matchingObjects;
  }
  return {
    names,
    objects: filterGrade3StoryEntries(
      objects,
      selectedObjects,
      ["id", "item"],
      "objects"
    )
  };
}

function pickGrade3StoryContext(names, objects, random, stateKey, options = {}) {
  const generatorState = options.generatorState || {};
  if (!generatorState.grade3StoryContexts) generatorState.grade3StoryContexts = {};
  const state = generatorState.grade3StoryContexts[stateKey] || {
    nameCounts: new Map(),
    objectCounts: new Map(),
    usedPairs: new Set(),
    recentNames: [],
    recentObjects: []
  };
  generatorState.grade3StoryContexts[stateKey] = state;
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
    throw new Error("No unique Grade 3 word-problem name/object pairs remain for the selected context contract.");
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

function grade3AddendCandidates(options = {}) {
  const selected = normalizeNumberList(options.selectedNumbers || options.onlyNumbers);
  const minA = Math.max(0, Math.round(finiteNumber(options.minA, 10)));
  const maxA = Math.max(minA, Math.round(finiteNumber(options.maxA, 90)));
  const minB = Math.max(0, Math.round(finiteNumber(options.minB, 10)));
  const maxB = Math.max(minB, Math.round(finiteNumber(options.maxB, 90)));
  const maxTotal = Math.max(2, Math.min(100, Math.round(finiteNumber(options.maxTotal, 100))));
  const aValues = selected.length ? selected : Array.from({ length: maxA - minA + 1 }, (_, i) => minA + i);
  const bValues = selected.length ? selected : Array.from({ length: maxB - minB + 1 }, (_, i) => minB + i);
  const candidates = [];
  aValues.forEach((a) => bValues.forEach((b) => {
    if (a >= 0 && b >= 0 && a + b <= maxTotal) candidates.push({ a, b, total: a + b });
  }));
  if (!candidates.length) {
    throw new Error("No Grade 3 word-problem addition relationships are available for the selected number contract.");
  }
  return candidates;
}

function grade3SubtractionCandidates(options = {}) {
  const selected = normalizeNumberList(options.selectedNumbers || options.onlyNumbers);
  const minA = Math.max(1, Math.round(finiteNumber(options.minA, 20)));
  const maxTotal = Math.max(minA, Math.min(100, Math.round(finiteNumber(options.maxTotal, 100))));
  const maxA = Math.min(maxTotal, Math.max(minA, Math.round(finiteNumber(options.maxA, 100))));
  const minB = Math.max(0, Math.round(finiteNumber(options.minB, 1)));
  const maxB = Math.max(minB, Math.round(finiteNumber(options.maxB, 90)));
  const starts = selected.length ? selected : Array.from({ length: maxA - minA + 1 }, (_, i) => minA + i);
  const takenValues = selected.length ? selected : Array.from({ length: maxB - minB + 1 }, (_, i) => minB + i);
  const candidates = [];
  starts.forEach((minuend) => takenValues.forEach((subtrahend) => {
    if (minuend >= minA && minuend <= maxA && subtrahend >= 0 && subtrahend < minuend) {
      candidates.push({ minuend, subtrahend, difference: minuend - subtrahend });
    }
  }));
  if (!candidates.length) {
    throw new Error("No Grade 3 subtraction word-problem relationships are available for the selected number contract.");
  }
  return candidates;
}

function grade4StoryPools(options = {}) {
  const selectedContexts = normalizedTextList(options.selectedContexts, options.contexts);
  const selectedObjects = normalizedTextList(options.selectedObjects, options.onlyObjects);
  let names = GRADE4_STORY_NAMES;
  let objects = GRADE4_STORY_OBJECTS;
  if (selectedContexts.length) {
    const matchingNames = names.filter((entry) => selectedContexts.some((value) => (
      [entry.id, entry.name].some((part) => String(part).toLowerCase() === value)
    )));
    const matchingObjects = objects.filter((entry) => selectedContexts.some((value) => (
      [entry.id, entry.item].some((part) => String(part).toLowerCase() === value)
    )));
    if (matchingNames.length) names = matchingNames;
    if (matchingObjects.length) objects = matchingObjects;
  }
  if (selectedObjects.length) {
    objects = objects.filter((entry) => selectedObjects.some((value) => (
      [entry.id, entry.item].some((part) => String(part).toLowerCase() === value)
    )));
  }
  return { names, objects };
}

function pickGrade4StoryContext(names, objects, random, stateKey, options = {}) {
  const generatorState = options.generatorState || {};
  if (!generatorState.grade4StoryContexts) generatorState.grade4StoryContexts = {};
  const state = generatorState.grade4StoryContexts[stateKey] || {
    nameCounts: new Map(),
    objectCounts: new Map(),
    usedPairs: new Set(),
    recentNames: [],
    recentObjects: []
  };
  generatorState.grade4StoryContexts[stateKey] = state;
  let candidates = [];
  names.forEach((name) => {
    objects.forEach((object) => {
      const pairKey = `${name.id}:${object.id}`;
      if (state.usedPairs.has(pairKey)) return;
      if ((state.nameCounts.get(name.id) || 0) >= 2) return;
      if ((state.objectCounts.get(object.id) || 0) >= 2) return;
      candidates.push({ name, object, pairKey });
    });
  });
  const outsideRecentWindow = candidates.filter(({ name, object }) => (
    !state.recentNames.includes(name.id) && !state.recentObjects.includes(object.id)
  ));
  if (outsideRecentWindow.length) candidates = outsideRecentWindow;
  if (!candidates.length) {
    throw new Error("No unique Grade 4 story-problem contexts remain for the selected context contract.");
  }
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

function nextGrade4StoryType(allowedTypes, random, stateKey, options = {}) {
  return pickBalancedContext(
    allowedTypes.map((id) => ({ id })),
    random,
    `grade4StoryType:${stateKey}`,
    options
  ).id;
}

function pickGrade4UniqueTruth(options, keyPrefix, buildTruth) {
  const usedProblemKeys = options.usedProblemKeys || new Set();
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const truth = buildTruth();
    const key = `${keyPrefix}:${truth.key}`;
    if (usedProblemKeys.has(key)) continue;
    usedProblemKeys.add(key);
    delete truth.key;
    return truth;
  }
  throw new Error("No unique Grade 4 story-problem arithmetic relationships remain for the selected number contract.");
}

function pickGrade4Value(values, minimum, maximum, random) {
  const candidates = values.length
    ? values.filter((value) => value >= minimum && value <= maximum)
    : null;
  if (candidates && !candidates.length) return null;
  return candidates ? pick(candidates, random) : randInt(minimum, maximum, random);
}

function sampleGrade4AdditionTruth(options = {}) {
  const random = options.random || Math.random;
  const selected = normalizeNumberList(options.selectedNumbers || options.onlyNumbers);
  const minA = Number(options.minA);
  const maxA = Number(options.maxA);
  const minB = Number(options.minB);
  const maxB = Number(options.maxB);
  const minTotal = Number(options.minTotal);
  const maxTotal = Number(options.maxTotal);
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const a = pickGrade4Value(selected, minA, maxA, random);
    if (a === null) break;
    const minimumB = Math.max(minB, minTotal - a);
    const maximumB = Math.min(maxB, maxTotal - a);
    if (minimumB > maximumB) continue;
    const b = pickGrade4Value(selected, minimumB, maximumB, random);
    if (b === null) continue;
    return { a, b, total: a + b, key: `${Math.min(a, b)}:${Math.max(a, b)}` };
  }
  throw new Error("No Grade 4 addition story relationships are available for the selected number contract.");
}

function sampleGrade4SubtractionTruth(options = {}) {
  const random = options.random || Math.random;
  const selected = normalizeNumberList(options.selectedNumbers || options.onlyNumbers);
  const minA = Number(options.minA);
  const maxA = Number(options.maxA);
  const minB = Number(options.minB);
  const maxB = Number(options.maxB);
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const minuend = pickGrade4Value(selected, minA, maxA, random);
    if (minuend === null) break;
    const maximumSubtrahend = Math.min(maxB, minuend);
    if (minB > maximumSubtrahend) continue;
    const subtrahend = pickGrade4Value(selected, minB, maximumSubtrahend, random);
    if (subtrahend === null) continue;
    return {
      minuend,
      subtrahend,
      difference: minuend - subtrahend,
      key: `${minuend}:${subtrahend}`
    };
  }
  throw new Error("No Grade 4 subtraction story relationships are available for the selected number contract.");
}

function activeGrade4StoryTemplates(templates, options = {}) {
  const selected = Array.isArray(options.selectedStoryTypes) ? options.selectedStoryTypes : [];
  return selected.length ? templates.filter((template) => selected.includes(template.storyType)) : templates;
}

function generateGrade4AdditionStory(options = {}) {
  const random = options.random || Math.random;
  const truth = pickGrade4UniqueTruth(options, "grade4_addition_story", () => sampleGrade4AdditionTruth(options));
  const { names, objects } = grade4StoryPools(options);
  const context = pickGrade4StoryContext(names, objects, random, "addition", options);
  const templates = activeGrade4StoryTemplates([
    {
      id: "g4_add_join_delivery",
      storyType: "join_result",
      build: ({ context, a, b, aItems, bItems, items }) =>
        `${context.name} organized ${a} ${aItems}. A delivery brought ${b} more ${bItems}. How many ${items} are there altogether?`
    },
    {
      id: "g4_add_join_collection",
      storyType: "join_result",
      build: ({ context, a, b, aItems, bItems, items, addVerb }) =>
        `${context.name} starts with ${a} ${aItems}. ${capitalizeFirst(context.pronoun)} ${addVerb} ${b} more ${bItems}. How many ${items} does ${context.name} have now?`
    },
    {
      id: "g4_add_join_two_days",
      storyType: "join_result",
      build: ({ context, a, b, aItems, bItems, items }) =>
        `${context.name} records ${a} ${aItems} on Monday and ${b} ${bItems} on Tuesday. What is the total number of ${items}?`
    },
    {
      id: "g4_add_join_goal_progress",
      storyType: "join_result",
      build: ({ context, a, b, aItems, bItems, items }) =>
        `A project already has ${a} ${aItems}. ${context.name} contributes ${b} more ${bItems}. How many ${items} does the project have now?`
    },
    {
      id: "g4_add_combine_groups",
      storyType: "combine_total",
      build: ({ context, a, b, aItems, bItems, items }) =>
        `One group has ${a} ${aItems}, and another has ${b} ${bItems}. How many ${items} do the groups have in all?`
    },
    {
      id: "g4_add_combine_locations",
      storyType: "combine_total",
      build: ({ context, a, b, aItems, bItems, items }) =>
        `${context.name} counts ${a} ${aItems} in one room and ${b} ${bItems} in another. How many ${items} are in both rooms?`
    },
    {
      id: "g4_add_combine_teams",
      storyType: "combine_total",
      build: ({ context, a, b, aItems, bItems, items }) =>
        `Two teams collect ${items}. One team collects ${a} ${aItems}, and the other collects ${b} ${bItems}. What is their combined total?`
    },
    {
      id: "g4_add_combine_shelves",
      storyType: "combine_total",
      build: ({ context, a, b, aItems, bItems, items }) =>
        `A storage area has ${a} ${aItems} on one shelf and ${b} ${bItems} on another. How many ${items} are stored altogether?`
    }
  ], options);
  if (!templates.length) throw new Error("No Grade 4 addition story templates match the selected story types.");
  const template = pickVariedTemplate(templates, random, "grade4Addition", options);
  const aItems = pluralize(truth.a, context.item);
  const bItems = pluralize(truth.b, context.item);
  const items = pluralNoun(context.item);
  const addVerb = context.pronoun === "they" ? "add" : "adds";
  const duplicateSignature = `grade4_story:add:${Math.min(truth.a, truth.b)}:${Math.max(truth.a, truth.b)}:${context.id}:${template.id}`;
  return {
    prompt: template.build({ context, ...truth, aItems, bItems, items, addVerb }),
    answer: truth.total,
    a: truth.a,
    b: truth.b,
    op: "+",
    operation: "add",
    operationFamily: "addition",
    firstAddend: truth.a,
    secondAddend: truth.b,
    total: truth.total,
    unknownPosition: "total",
    storyType: template.storyType,
    contextId: context.id,
    templateId: template.id,
    duplicateSignature,
    answerState: {
      operation: "add",
      firstAddend: truth.a,
      secondAddend: truth.b,
      total: truth.total,
      unknownPosition: "total",
      answer: truth.total
    }
  };
}

function generateGrade4MissingAddendStory(options = {}) {
  const random = options.random || Math.random;
  const allowedPositions = Array.isArray(options.allowedMissingPositions) && options.allowedMissingPositions.length
    ? options.allowedMissingPositions
    : ["first", "second"];
  const missingPosition = nextGrade4StoryType(allowedPositions, random, "missingPosition", options);
  const truth = pickGrade4UniqueTruth(options, `grade4_missing_story:${missingPosition}`, () => sampleGrade4AdditionTruth(options));
  const { names, objects } = grade4StoryPools(options);
  const context = pickGrade4StoryContext(names, objects, random, "missingAddend", options);
  const templates = [
    {
      id: "g4_missing_first_arrival",
      missingPosition: "first",
      storyType: "start_unknown",
      build: ({ context, b, total, bItems, items }) =>
        `${context.name} had some ${items}. After ${b} more ${bItems} arrived, there were ${total} altogether. How many ${items} were there at first?`
    },
    {
      id: "g4_missing_first_added",
      missingPosition: "first",
      storyType: "start_unknown",
      build: ({ context, b, total, bItems, items }) =>
        `${context.name} added ${b} ${bItems} to a collection. The collection then had ${total} ${items}. How many ${items} were in it before?`
    },
    {
      id: "g4_missing_first_before",
      missingPosition: "first",
      storyType: "start_unknown",
      build: ({ context, b, total, bItems, items }) =>
        `A supply grew by ${b} ${bItems} and reached ${total} ${items}. How many ${items} were in the supply before it grew?`
    },
    {
      id: "g4_missing_first_received",
      missingPosition: "first",
      storyType: "start_unknown",
      build: ({ context, b, total, bItems, items }) =>
        `After receiving ${b} ${bItems}, ${context.name} counted ${total} ${items} in all. What was the starting amount?`
    },
    {
      id: "g4_missing_second_goal",
      missingPosition: "second",
      storyType: "added_amount_unknown",
      build: ({ context, a, total, aItems, items }) =>
        `${context.name} has ${a} ${aItems} and needs ${total} ${items} altogether. How many more ${items} are needed?`
    },
    {
      id: "g4_missing_second_target",
      missingPosition: "second",
      storyType: "added_amount_unknown",
      build: ({ context, a, total, aItems, items }) =>
        `A project has collected ${a} ${aItems} toward a target of ${total} ${items}. How many more ${items} must be collected?`
    },
    {
      id: "g4_missing_second_question",
      missingPosition: "second",
      storyType: "added_amount_unknown",
      build: ({ context, a, total, aItems, items, questionAux }) =>
        `${context.name} has ${a} ${aItems}. How many more ${items} ${questionAux} ${context.pronoun} need to reach ${total}?`
    },
    {
      id: "g4_missing_second_complete",
      missingPosition: "second",
      storyType: "added_amount_unknown",
      build: ({ context, a, total, aItems, items }) =>
        `${context.name} counted ${a} ${aItems} so far. The final total must be ${total}. How many more ${items} should be added?`
    }
  ].filter((template) => template.missingPosition === missingPosition);
  const template = pickVariedTemplate(templates, random, `grade4Missing:${missingPosition}`, options);
  const aItems = pluralize(truth.a, context.item);
  const bItems = pluralize(truth.b, context.item);
  const items = pluralNoun(context.item);
  const answer = missingPosition === "first" ? truth.a : truth.b;
  const unknownPosition = missingPosition === "first" ? "first_addend" : "second_addend";
  const questionAux = context.pronoun === "they" ? "do" : "does";
  const duplicateSignature = `grade4_story:missing:${truth.a}:${truth.b}:${missingPosition}:${context.id}:${template.id}`;
  return {
    prompt: template.build({ context, ...truth, aItems, bItems, items, questionAux }),
    answer,
    a: truth.a,
    b: truth.b,
    op: "+",
    operation: "add",
    operationFamily: "addition",
    firstAddend: truth.a,
    secondAddend: truth.b,
    knownAddend: missingPosition === "first" ? truth.b : truth.a,
    total: truth.total,
    missingPosition,
    missingValue: answer,
    unknownPosition,
    storyType: template.storyType,
    contextId: context.id,
    templateId: template.id,
    duplicateSignature,
    answerState: {
      operation: "add",
      firstAddend: truth.a,
      secondAddend: truth.b,
      knownAddend: missingPosition === "first" ? truth.b : truth.a,
      missingAddend: answer,
      total: truth.total,
      unknownPosition,
      answer
    }
  };
}

function generateGrade4SubtractionStory(options = {}) {
  const random = options.random || Math.random;
  const truth = pickGrade4UniqueTruth(options, "grade4_subtraction_story", () => sampleGrade4SubtractionTruth(options));
  const { names, objects } = grade4StoryPools(options);
  const context = pickGrade4StoryContext(names, objects, random, "subtraction", options);
  const allowedTypes = Array.isArray(options.selectedStoryTypes) && options.selectedStoryTypes.length
    ? options.selectedStoryTypes
    : ["take_away", "compare"];
  const storyType = nextGrade4StoryType(allowedTypes, random, "subtraction", options);
  const templates = [
    {
      id: "g4_sub_take_used",
      storyType: "take_away",
      build: ({ context, minuend, subtrahend, startItems, removedItems, items, useVerb }) =>
        `${context.name} has ${minuend} ${startItems}. ${capitalizeFirst(context.pronoun)} ${useVerb} ${subtrahend} ${removedItems}. How many ${items} remain?`
    },
    {
      id: "g4_sub_take_distributed",
      storyType: "take_away",
      build: ({ context, minuend, subtrahend, startItems, removedItems, items }) =>
        `A school has ${minuend} ${startItems}. It distributes ${subtrahend} ${removedItems}. How many ${items} are left?`
    },
    {
      id: "g4_sub_take_removed",
      storyType: "take_away",
      build: ({ context, minuend, subtrahend, startItems, removedItems, items }) =>
        `${context.name} counts ${minuend} ${startItems}. After ${subtrahend} ${removedItems} are removed, how many ${items} remain?`
    },
    {
      id: "g4_sub_take_sent",
      storyType: "take_away",
      build: ({ context, minuend, subtrahend, startItems, removedItems, items }) =>
        `A collection begins with ${minuend} ${startItems}. ${context.name} sends away ${subtrahend} ${removedItems}. How many ${items} are left?`
    },
    {
      id: "g4_sub_compare_more",
      storyType: "compare",
      build: ({ context, minuend, subtrahend, startItems, removedItems, items }) =>
        `${context.name} records ${minuend} ${startItems}. Another group records ${subtrahend} ${removedItems}. How many more ${items} does ${context.name} record?`
    },
    {
      id: "g4_sub_compare_difference",
      storyType: "compare",
      build: ({ context, minuend, subtrahend, startItems, removedItems, items }) =>
        `One class collects ${minuend} ${startItems}, while another collects ${subtrahend} ${removedItems}. What is the difference between the two amounts?`
    },
    {
      id: "g4_sub_compare_lead",
      storyType: "compare",
      build: ({ context, minuend, subtrahend, startItems, removedItems, items }) =>
        `${context.name}'s team earns ${minuend} ${startItems}. The other team earns ${subtrahend} ${removedItems}. By how many ${items} does ${context.name}'s team lead?`
    },
    {
      id: "g4_sub_compare_gap",
      storyType: "compare",
      build: ({ context, minuend, subtrahend, startItems, removedItems, items }) =>
        `A larger group has ${minuend} ${startItems}, and a smaller group has ${subtrahend} ${removedItems}. How many more ${items} are in the larger group?`
    }
  ].filter((template) => template.storyType === storyType);
  const template = pickVariedTemplate(templates, random, `grade4Subtraction:${storyType}`, options);
  const startItems = pluralize(truth.minuend, context.item);
  const removedItems = pluralize(truth.subtrahend, context.item);
  const items = pluralNoun(context.item);
  const useVerb = context.pronoun === "they" ? "use" : "uses";
  const duplicateSignature = `grade4_story:subtract:${truth.minuend}:${truth.subtrahend}:${storyType}:${context.id}:${template.id}`;
  return {
    prompt: template.build({ context, ...truth, startItems, removedItems, items, useVerb }),
    answer: truth.difference,
    a: truth.minuend,
    b: truth.subtrahend,
    op: "-",
    operation: "subtract",
    operationFamily: "subtraction",
    minuend: truth.minuend,
    subtrahend: truth.subtrahend,
    difference: truth.difference,
    unknownPosition: "difference",
    storyType,
    contextId: context.id,
    templateId: template.id,
    duplicateSignature,
    answerState: {
      operation: "subtract",
      minuend: truth.minuend,
      subtrahend: truth.subtrahend,
      difference: truth.difference,
      unknownPosition: "difference",
      answer: truth.difference
    }
  };
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

function generateGrade3AdditionWordProblem(options = {}) {
  const random = options.random || Math.random;
  const candidates = grade3AddendCandidates(options);
  const { names, objects } = grade3StoryPools(options);
  const templates = [
    {
      id: "g3_add_start_more",
      build: ({ context, a, b, aItems, bItems, items }) =>
        `${context.name} has ${a} ${aItems}. Later, ${context.name} gets ${b} more ${bItems}. How many ${items} does ${context.name} have altogether?`
    },
    {
      id: "g3_add_two_times",
      build: ({ context, a, b, aItems, bItems, items }) =>
        `${context.name} collects ${a} ${aItems} in the morning and ${b} more ${bItems} in the afternoon. How many ${items} does ${context.name} collect in all?`
    },
    {
      id: "g3_add_join_sets",
      build: ({ context, a, b, aItems, bItems, items }) =>
        `${context.name} has one set with ${a} ${aItems} and another set with ${b} ${bItems}. How many ${items} are in the two sets altogether?`
    },
    {
      id: "g3_add_added_to_table",
      build: ({ context, a, b, aItems, bItems, items }) =>
        `A table holds ${a} ${aItems}. ${context.name} adds ${b} more ${bItems}. How many ${items} are on the table now?`
    },
    {
      id: "g3_add_question_first",
      build: ({ context, a, b, aItems, items, questionAux }) =>
        `${context.name} combines ${a} ${aItems} with ${b} more. How many ${items} ${questionAux} ${context.pronoun} have altogether?`
    },
    {
      id: "g3_add_collection_grows",
      build: ({ context, a, b, aItems, bItems, items, addVerb }) =>
        `${context.name} starts a collection with ${a} ${aItems}. ${capitalizeFirst(context.pronoun)} ${addVerb} ${b} ${bItems}. How many ${items} are in the collection now?`
    },
    {
      id: "g3_add_count_both",
      build: ({ context, a, b, aItems, bItems, items }) =>
        `${context.name} counts ${a} ${aItems} in one container and ${b} ${bItems} in another. What is the total number of ${items}?`
    },
    {
      id: "g3_add_new_total",
      build: ({ context, a, b, aItems, bItems, items }) =>
        `${context.name} already has ${a} ${aItems} and receives ${b} more ${bItems}. What is ${context.name}'s new total of ${items}?`
    }
  ];
  const values = pickUniqueProblem(options, () => {
    const candidate = pick(candidates, random);
    return {
      ...candidate,
      key: getProblemKey("grade3_addition_word_problem", candidate.a, candidate.b, candidate.total)
    };
  });
  const context = pickGrade3StoryContext(names, objects, random, "addition", options);
  const template = pickVariedTemplate(templates, random, "grade3Addition", options);
  const aItems = pluralize(values.a, context.item);
  const bItems = pluralize(values.b, context.item);
  const items = pluralNoun(context.item);
  const addVerb = context.pronoun === "they" ? "add" : "adds";
  const questionAux = context.pronoun === "they" ? "do" : "does";
  return {
    prompt: template.build({ context, ...values, aItems, bItems, items, addVerb, questionAux }),
    answer: values.total,
    a: values.a,
    b: values.b,
    op: "+",
    operation: "addition",
    firstAddend: values.a,
    secondAddend: values.b,
    total: values.total,
    contextId: context.id,
    templateId: template.id
  };
}

function normalizeGrade3MissingPosition(options = {}) {
  const raw = String(
    options.missingPosition ||
    options.missingAddendPosition ||
    options.missingPartPosition ||
    options.unknownPosition ||
    "mixed"
  ).trim().toLowerCase().replace(/[ -]+/g, "_");
  if (["first", "first_addend", "start", "starting_amount"].includes(raw)) return "first";
  if (["second", "second_addend", "change", "missing_part"].includes(raw)) return "second";
  return "mixed";
}

function nextGrade3MissingPosition(options = {}) {
  const requested = normalizeGrade3MissingPosition(options);
  if (requested !== "mixed") return requested;
  const state = options.generatorState || {};
  const index = Number(state.grade3MissingAddendPositionIndex || 0);
  state.grade3MissingAddendPositionIndex = index + 1;
  return index % 2 === 0 ? "first" : "second";
}

function generateGrade3MissingAddendWordProblem(options = {}) {
  const random = options.random || Math.random;
  const candidates = grade3AddendCandidates(options);
  const { names, objects } = grade3StoryPools(options);
  const missingPosition = nextGrade3MissingPosition(options);
  const firstTemplates = [
    {
      id: "g3_missing_first_then_more",
      build: ({ context, b, total, bItems, items }) =>
        `${context.name} had some ${items}. After getting ${b} more ${bItems}, ${context.name} had ${total} ${items}. How many ${items} did ${context.name} have at first?`
    },
    {
      id: "g3_missing_first_added",
      build: ({ context, b, total, bItems, items }) =>
        `${context.name} added ${b} ${bItems} to a collection. The collection now has ${total} ${items}. How many ${items} were in the collection before?`
    },
    {
      id: "g3_missing_first_question",
      build: ({ context, b, total, bItems, items }) =>
        `How many ${items} did ${context.name} start with if ${b} more ${bItems} made a total of ${total}?`
    },
    {
      id: "g3_missing_first_received",
      build: ({ context, b, total, bItems, items }) =>
        `${context.name} received ${b} ${bItems} and then had ${total} ${items} altogether. What was the starting number of ${items}?`
    }
  ];
  const secondTemplates = [
    {
      id: "g3_missing_second_goal",
      build: ({ context, a, total, aItems, items }) =>
        `${context.name} has ${a} ${aItems} and wants ${total} ${items} in all. How many more ${items} does ${context.name} need?`
    },
    {
      id: "g3_missing_second_needed",
      build: ({ context, a, total, aItems, items }) =>
        `${context.name} needs ${total} ${items} for a project. ${context.name} already has ${a} ${aItems}. How many more ${items} are needed?`
    },
    {
      id: "g3_missing_second_question",
      build: ({ context, a, total, aItems, items, questionAux }) =>
        `${context.name} has ${a} ${aItems}. How many more ${items} ${questionAux} ${context.pronoun} need to have ${total} altogether?`
    },
    {
      id: "g3_missing_second_complete",
      build: ({ context, a, total, aItems, items }) =>
        `The collection needs ${total} ${items} altogether. ${context.name} has put in ${a} ${aItems} so far. How many more ${items} are needed?`
    }
  ];
  const values = pickUniqueProblem(options, () => {
    const candidate = pick(candidates, random);
    const answer = missingPosition === "first" ? candidate.a : candidate.b;
    return {
      ...candidate,
      answer,
      key: getProblemKey(`grade3_missing_${missingPosition}`, candidate.a, candidate.b, answer)
    };
  });
  const context = pickGrade3StoryContext(names, objects, random, "missingAddend", options);
  const templates = missingPosition === "first" ? firstTemplates : secondTemplates;
  const template = pickVariedTemplate(templates, random, "grade3MissingAddend", options);
  const aItems = pluralize(values.a, context.item);
  const bItems = pluralize(values.b, context.item);
  const items = pluralNoun(context.item);
  const questionAux = context.pronoun === "they" ? "do" : "does";
  return {
    prompt: template.build({ context, ...values, aItems, bItems, items, questionAux }),
    answer: values.answer,
    a: values.a,
    b: values.b,
    op: "+",
    operation: "missing_addend",
    firstAddend: values.a,
    secondAddend: values.b,
    total: values.total,
    missingPosition,
    missingValue: values.answer,
    contextId: context.id,
    templateId: template.id
  };
}

function generateGrade3SubtractionWordProblem(options = {}) {
  const random = options.random || Math.random;
  const candidates = grade3SubtractionCandidates(options);
  const { names, objects } = grade3StoryPools(options);
  const naturalTakeAwayLanguage = Boolean(options.naturalTakeAwayLanguage);
  const templates = [
    {
      id: "g3_sub_start_take",
      build: ({ context, minuend, subtrahend, startItems, takenItems, items, takeVerb }) =>
        `${context.name} has ${minuend} ${startItems}. ${capitalizeFirst(context.pronoun)} ${takeVerb} ${subtrahend} ${takenItems}. How many ${items} are left?`
    },
    {
      id: "g3_sub_after",
      build: ({ context, minuend, subtrahend, startItems, takenItems, items }) =>
        `${context.name} starts with ${minuend} ${startItems}. After giving away ${subtrahend} ${takenItems}, how many ${items} does ${context.name} have left?`
    },
    {
      id: "g3_sub_removed",
      build: ({ context, minuend, subtrahend, startItems, takenItems, items }) =>
        `A collection holds ${minuend} ${startItems}. ${context.name} removes ${subtrahend} ${takenItems}. How many ${items} remain?`
    },
    {
      id: "g3_sub_question_first",
      build: ({ context, minuend, subtrahend, startItems, takenItems, items }) =>
        `How many ${items} are left when ${context.name} takes ${subtrahend} ${takenItems} from ${minuend} ${startItems}?`
    },
    {
      id: "g3_sub_checked_out",
      build: ({ context, minuend, subtrahend, startItems, takenItems, items }) =>
        `${context.name} counts ${minuend} ${startItems}. Then ${subtrahend} ${takenItems} are taken away. How many ${items} remain?`
    },
    {
      id: "g3_sub_used",
      build: ({ context, minuend, subtrahend, startItems, takenItems, items }) =>
        `A project begins with ${minuend} ${startItems}. ${context.name} uses ${subtrahend} ${takenItems}. How many ${items} have not been used?`
    },
    {
      id: "g3_sub_difference",
      build: ({ context, minuend, subtrahend, startItems, takenItems, items }) =>
        `${context.name} had ${minuend} ${startItems} and gave away ${subtrahend} ${takenItems}. How many ${items} are left?`
    },
    {
      id: "g3_sub_remaining",
      build: ({ context, minuend, subtrahend, startItems, takenItems, items }) =>
        `${context.name} takes ${subtrahend} ${takenItems} from a set of ${minuend}. How many ${items} remain?`
    }
  ];
  const values = pickUniqueProblem(options, () => {
    const candidate = pick(candidates, random);
    return {
      ...candidate,
      key: getProblemKey("grade3_subtraction_word_problem", candidate.minuend, candidate.subtrahend, candidate.difference)
    };
  });
  const context = pickGrade3StoryContext(names, objects, random, "subtraction", options);
  const template = pickVariedTemplate(templates, random, "grade3Subtraction", options);
  const startItems = pluralize(values.minuend, context.item);
  const takenItems = pluralize(values.subtrahend, context.item);
  const items = pluralNoun(context.item);
  const takeVerb = naturalTakeAwayLanguage
    ? context.pronoun === "they" ? "give away" : "gives away"
    : context.pronoun === "they" ? "use" : "uses";
  return {
    prompt: template.build({ context, ...values, startItems, takenItems, items, takeVerb }),
    answer: values.difference,
    a: values.minuend,
    b: values.subtrahend,
    op: "-",
    operation: "subtraction",
    minuend: values.minuend,
    subtrahend: values.subtrahend,
    difference: values.difference,
    contextId: context.id,
    templateId: template.id
  };
}

function generateAdditionWordProblem(options = {}) {
  if (options.worksheetId === GRADE4_ADDITION_STORY_ID) {
    return generateGrade4AdditionStory(options);
  }
  if (options.worksheetId === GRADE3_ADDITION_WORD_PROBLEMS_ID) {
    return generateGrade3AdditionWordProblem(options);
  }
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
  if (options.worksheetId === GRADE4_SUBTRACTION_STORY_ID) {
    return generateGrade4SubtractionStory(options);
  }
  if (options.worksheetId === GRADE3_SUBTRACTION_WORD_PROBLEMS_ID) {
    return generateGrade3SubtractionWordProblem(options);
  }
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
  if (options.worksheetId === GRADE4_MISSING_ADDEND_STORY_ID) {
    return generateGrade4MissingAddendStory(options);
  }
  if (options.worksheetId === GRADE3_MISSING_ADDEND_WORD_PROBLEMS_ID) {
    return generateGrade3MissingAddendWordProblem(options);
  }
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

  if (GRADE4_STORY_PROBLEM_IDS.has(options.worksheetId)) {
    if (options.worksheetId === GRADE4_ADDITION_STORY_ID) return generateGrade4AdditionStory(options);
    if (options.worksheetId === GRADE4_MISSING_ADDEND_STORY_ID) return generateGrade4MissingAddendStory(options);
    return generateGrade4SubtractionStory(options);
  }

  if (GRADE3_STORY_PROBLEM_IDS.has(options.worksheetId)) {
    if (options.worksheetId === GRADE3_ADDITION_WORD_PROBLEMS_ID) {
      return generateGrade3AdditionWordProblem(options);
    }
    if (options.worksheetId === GRADE3_MISSING_ADDEND_WORD_PROBLEMS_ID) {
      return generateGrade3MissingAddendWordProblem(options);
    }
    return generateGrade3SubtractionWordProblem(options);
  }

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
