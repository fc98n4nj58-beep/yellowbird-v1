const { getDivisibleFairShareObject } = require("./grade1Fractions");

const RESOURCE_ID = "grade2_fraction_equivalence_fraction_word_problems";
const TASK_MODE = "share_fairly";
const QUESTION_COUNT = 4;
const SHARER_COUNTS = Object.freeze([2, 3, 4, 6]);
const SCENARIOS = Object.freeze([
  Object.freeze({
    scenarioId: "apples_between_two",
    objectType: "apple",
    totalObjects: 8,
    sharerCount: 2,
    peopleNoun: "children",
    prompt: "Share 8 apples equally between 2 children. How many apples does each child get?"
  }),
  Object.freeze({
    scenarioId: "bars_among_three",
    objectType: "granola_bar",
    totalObjects: 9,
    sharerCount: 3,
    peopleNoun: "students",
    prompt: "Nine granola bars are shared equally among 3 students. How many bars does each student get?"
  }),
  Object.freeze({
    scenarioId: "sandwiches_among_four",
    objectType: "sandwich",
    totalObjects: 8,
    sharerCount: 4,
    peopleNoun: "children",
    prompt: "Eight sandwiches are shared equally among 4 children. How many sandwiches does each child get?"
  }),
  Object.freeze({
    scenarioId: "strips_among_six",
    objectType: "paper_strip",
    totalObjects: 6,
    sharerCount: 6,
    peopleNoun: "students",
    prompt: "Share 6 paper strips equally among 6 students. How many strips does each student get?"
  })
]);

function shuffle(values, random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function buildScenario(definition) {
  const object = getDivisibleFairShareObject(definition.objectType);
  const objectsPerPerson = definition.totalObjects / definition.sharerCount;
  const context = {
    scenarioId: definition.scenarioId,
    peopleNoun: definition.peopleNoun,
    objectNoun: object.pluralNoun
  };
  const fractionModel = {
    kind: "fair_share_set",
    modelType: "fair_share_set",
    taskMode: TASK_MODE,
    wholeId: `grade2-${definition.scenarioId}`,
    ...object,
    context,
    totalObjects: definition.totalObjects,
    wholeEquivalentTotal: definition.totalObjects,
    objectTotal: definition.totalObjects,
    sharerCount: definition.sharerCount,
    objectsPerPerson,
    wholeObjectsPerSharer: objectsPerPerson,
    halfObjectsPerSharer: 0,
    remainderObjects: 0,
    remainderWholeEquivalent: 0
  };
  const answerState = {
    objectsPerPerson,
    trayWholeObjects: Array(definition.sharerCount).fill(objectsPerPerson),
    trayHalfObjects: Array(definition.sharerCount).fill(0),
    totalObjectsDistributed: definition.totalObjects,
    sourceWholeEquivalentUsed: definition.totalObjects
  };

  return {
    type: "equation",
    prompt: definition.prompt,
    answer: objectsPerPerson,
    responseMode: "fair_share_number",
    responseType: "number",
    taskMode: TASK_MODE,
    layoutVariant: "fair_share_rows",
    fractionModel,
    fractionWorkedModel: null,
    answerState,
    visual: { kind: "fair_share_set", data: fractionModel },
    duplicateSignature: `grade2_fraction:share:${definition.scenarioId}`
  };
}

function buildItems(random) {
  return shuffle(SCENARIOS, random).map(buildScenario);
}

function generateGrade2ShareFairlyTo10Problem(options = {}) {
  if (options.worksheetId !== RESOURCE_ID) {
    throw new Error(`Unsupported Grade 2 fair-sharing worksheet '${options.worksheetId || ""}'.`);
  }
  if (Number(options.studentQuestionCount || options.questionCount) !== QUESTION_COUNT) {
    throw new Error(`Grade 2 Share Fairly to 10 requires exactly ${QUESTION_COUNT} scenarios.`);
  }

  const generatorState = options.generatorState || {};
  if (!generatorState.grade2ShareFairlyTo10) {
    const random = typeof options.random === "function" ? options.random : () => 0.5;
    generatorState.grade2ShareFairlyTo10 = buildItems(random);
  }
  const next = generatorState.grade2ShareFairlyTo10.shift();
  if (!next) throw new Error("No unused Grade 2 Share Fairly to 10 scenarios remain.");
  return next;
}

function validateGrade2ShareFairlyTo10Worksheet(worksheetId, problems = []) {
  if (worksheetId !== RESOURCE_ID) return true;
  if (!Array.isArray(problems) || problems.length !== QUESTION_COUNT) {
    throw new Error(`Grade 2 Share Fairly to 10 requires exactly ${QUESTION_COUNT} scenarios.`);
  }

  const sharers = new Set();
  const scenarios = new Set();
  problems.forEach((problem, index) => {
    if (Array.isArray(problem)) {
      throw new Error(`Grade 2 Share Fairly to 10 scenario ${index + 1} has an unsupported array shape.`);
    }
    const model = problem.fractionModel;
    const answer = problem.answerState;
    if (
      model?.kind !== "fair_share_set" ||
      model.modelType !== "fair_share_set" ||
      problem.visual?.kind !== "fair_share_set" ||
      problem.taskMode !== TASK_MODE ||
      problem.layoutVariant !== "fair_share_rows"
    ) {
      throw new Error(`Grade 2 Share Fairly to 10 scenario ${index + 1} is missing structured fair-share truth.`);
    }
    if (
      !SHARER_COUNTS.includes(model.sharerCount) ||
      !Number.isInteger(model.totalObjects) ||
      model.totalObjects < 1 ||
      model.totalObjects > 10 ||
      model.totalObjects % model.sharerCount !== 0
    ) {
      throw new Error(`Grade 2 Share Fairly to 10 scenario ${index + 1} has an invalid divisible total.`);
    }
    if (
      model.objectsPerPerson !== model.totalObjects / model.sharerCount ||
      model.objectsPerPerson < 1 ||
      model.remainderObjects !== 0 ||
      model.remainderWholeEquivalent !== 0 ||
      problem.answer !== model.objectsPerPerson ||
      answer?.objectsPerPerson !== model.objectsPerPerson
    ) {
      throw new Error(`Grade 2 Share Fairly to 10 scenario ${index + 1} has inconsistent share or answer truth.`);
    }
    if (
      !Array.isArray(answer.trayWholeObjects) ||
      answer.trayWholeObjects.length !== model.sharerCount ||
      !answer.trayWholeObjects.every((count) => count === model.objectsPerPerson) ||
      !Array.isArray(answer.trayHalfObjects) ||
      !answer.trayHalfObjects.every((count) => count === 0) ||
      answer.trayWholeObjects.reduce((sum, count) => sum + count, 0) !== model.totalObjects
    ) {
      throw new Error(`Grade 2 Share Fairly to 10 scenario ${index + 1} does not conserve its object set.`);
    }
    if (!model.context?.scenarioId || !model.objectType || !problem.prompt || problem.fractionWorkedModel || problem.isExample) {
      throw new Error(`Grade 2 Share Fairly to 10 scenario ${index + 1} is missing context or contains a completed example.`);
    }
    sharers.add(model.sharerCount);
    scenarios.add(model.context.scenarioId);
  });

  if (sharers.size !== SHARER_COUNTS.length || scenarios.size !== QUESTION_COUNT) {
    throw new Error("Grade 2 Share Fairly to 10 requires four unique contexts for 2, 3, 4, and 6 sharers.");
  }
  return true;
}

module.exports = {
  RESOURCE_ID,
  TASK_MODE,
  QUESTION_COUNT,
  SHARER_COUNTS,
  SCENARIOS,
  buildItems,
  generateGrade2ShareFairlyTo10Problem,
  validateGrade2ShareFairlyTo10Worksheet
};
