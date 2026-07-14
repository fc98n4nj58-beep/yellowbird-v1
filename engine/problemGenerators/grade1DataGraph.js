const RESOURCE_TASKS = Object.freeze({
  grade1_data_display_graphing_read_graph: "read",
  grade1_data_display_graphing_interpret_data: "interpret",
  grade1_data_display_graphing_graph_questions: "mixed"
});

const {
  GRADE1_GRAPH_TOPICS,
  graphTopicById
} = require("../content/grade1GraphTopics");

const BASE_VALUES = Object.freeze([3, 5, 5, 7]);
const RESPONSE_TYPES = Object.freeze({
  category_count: "number",
  category_total: "number",
  key_value: "number",
  difference: "number",
  most: "category",
  least: "category",
  more: "category",
  fewer: "category",
  same: "yes_no"
});

function shuffle(values, random = Math.random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function stableHash(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function rankGraphTopics(worksheetSeed, topics = GRADE1_GRAPH_TOPICS) {
  const seed = String(worksheetSeed || "yellowbird-default");
  return [...topics].sort((left, right) => {
    const scoreDifference = stableHash(`${seed}\u0000${right.id}`) - stableHash(`${seed}\u0000${left.id}`);
    return scoreDifference || left.id.localeCompare(right.id);
  });
}

function selectGraphTopic(options = {}) {
  const explicitId = String(options.graphTopicId || "").trim();
  if (explicitId) {
    const selected = graphTopicById(explicitId);
    if (!selected) throw new Error(`Unknown Grade 1 graph topic '${explicitId}'.`);
    if (options.selectionState) options.selectionState.lastTopicId = selected.id;
    return selected;
  }

  const ranked = rankGraphTopics(options.worksheetSeed, options.topics);
  const previousId = options.selectionState?.lastTopicId || null;
  const selected = ranked.find((entry) => entry.id !== previousId) || ranked[0];
  if (!selected) throw new Error("No Grade 1 graph topics are available.");
  if (options.selectionState) options.selectionState.lastTopicId = selected.id;
  return selected;
}

function buildGraphData(topic, random = Math.random) {
  const values = shuffle(BASE_VALUES, random);
  return {
    kind: "one_to_one_pictograph",
    topicId: topic.id,
    topicFamily: topic.topicFamily,
    title: topic.title,
    unitSingular: topic.unitSingular,
    unitPlural: topic.unitPlural,
    questionNoun: topic.questionNoun,
    scenario: topic.scenario,
    scenarioType: topic.scenarioType,
    dataSource: topic.dataSource,
    collectionAction: topic.collectionAction,
    purpose: topic.purpose,
    readingLevel: topic.readingLevel,
    keyLabel: topic.keyLabel,
    keyText: topic.keyText,
    symbol: "circle",
    symbolValue: 1,
    colorRequired: false,
    categories: topic.categories.map((label, index) => ({ label, value: values[index] }))
  };
}

function categoryWithValue(graphData, value) {
  return graphData.categories.find((category) => category.value === value);
}

function equalPair(graphData) {
  for (let first = 0; first < graphData.categories.length; first += 1) {
    for (let second = first + 1; second < graphData.categories.length; second += 1) {
      if (graphData.categories[first].value === graphData.categories[second].value) {
        return [graphData.categories[first], graphData.categories[second]];
      }
    }
  }
  throw new Error("Grade 1 graph data requires one equal-value category pair.");
}

function question(prompt, answer, graphQuestionType, graphData, extra = {}) {
  const responseType = RESPONSE_TYPES[graphQuestionType];
  if (!responseType) throw new Error(`Unsupported Grade 1 graph response type for '${graphQuestionType}'.`);
  return {
    type: "equation",
    prompt,
    answer,
    responseMode: "graph_short_answer",
    responseType,
    graphQuestionType,
    graphData,
    duplicateSignature: `grade1_data:${graphData.topicId}:${graphQuestionType}:${prompt}`,
    ...extra
  };
}

function buildReadQuestions(graphData) {
  const noun = graphData.questionNoun;
  const countQuestions = graphData.categories.map((category) => question(
    `How many ${noun} are shown for ${category.label}?`,
    category.value,
    "category_count",
    graphData,
    { graphCategory: category.label }
  ));

  return [
    ...countQuestions,
    question("How many categories are shown?", graphData.categories.length, "category_total", graphData),
    question(`How many ${graphData.unitPlural} does one circle stand for?`, 1, "key_value", graphData)
  ];
}

function buildInterpretQuestions(graphData) {
  const noun = graphData.questionNoun;
  const values = graphData.categories.map((category) => category.value);
  const most = categoryWithValue(graphData, Math.max(...values));
  const least = categoryWithValue(graphData, Math.min(...values));
  const [sameA, sameB] = equalPair(graphData);

  return [
    question(`Which category has the most ${noun}?`, most.label, "most", graphData),
    question(`Which category has the least ${noun}?`, least.label, "least", graphData),
    question(`Which has more ${noun}, ${most.label} or ${sameA.label}?`, most.label, "more", graphData),
    question(`Which has fewer ${noun}, ${sameB.label} or ${most.label}?`, sameB.label, "fewer", graphData),
    question(
      `How many more ${noun} does ${most.label} have than ${least.label}?`,
      most.value - least.value,
      "difference",
      graphData
    ),
    question(
      `Do ${sameA.label} and ${sameB.label} have the same number of ${noun}?`,
      "Yes",
      "same",
      graphData
    )
  ];
}

function buildMixedQuestions(graphData) {
  const noun = graphData.questionNoun;
  const values = graphData.categories.map((category) => category.value);
  const most = categoryWithValue(graphData, Math.max(...values));
  const least = categoryWithValue(graphData, Math.min(...values));
  const [sameA, sameB] = equalPair(graphData);
  const direct = graphData.categories.slice(0, 2);

  return [
    ...direct.map((category) => question(
      `How many ${noun} are shown for ${category.label}?`,
      category.value,
      "category_count",
      graphData,
      { graphCategory: category.label }
    )),
    question(`Which category has the most ${noun}?`, most.label, "most", graphData),
    question(`Which category has the least ${noun}?`, least.label, "least", graphData),
    question(`Which has more ${noun}, ${most.label} or ${sameA.label}?`, most.label, "more", graphData),
    question(`Which has fewer ${noun}, ${least.label} or ${sameB.label}?`, least.label, "fewer", graphData),
    question(
      `How many more ${noun} does ${most.label} have than ${least.label}?`,
      most.value - least.value,
      "difference",
      graphData
    ),
    question(
      `Do ${sameA.label} and ${sameB.label} have the same number of ${noun}?`,
      "Yes",
      "same",
      graphData
    )
  ];
}

function isGrade1DataGraphWorksheet(options = {}) {
  return Boolean(RESOURCE_TASKS[options.worksheetId]);
}

function generateGrade1DataGraphProblem(options = {}) {
  const task = RESOURCE_TASKS[options.worksheetId];
  if (!task) throw new Error(`Unsupported Grade 1 data worksheet '${options.worksheetId || ""}'.`);

  const generatorState = options.generatorState || {};
  generatorState.grade1DataGraphs = generatorState.grade1DataGraphs || {};
  generatorState.grade1GraphTopicSelection = generatorState.grade1GraphTopicSelection || {};
  if (!generatorState.grade1DataGraphs[task]) {
    const topic = selectGraphTopic({
      worksheetSeed: options.worksheetSeed,
      graphTopicId: options.graphTopicId,
      selectionState: generatorState.grade1GraphTopicSelection
    });
    const graphData = buildGraphData(topic, options.random || Math.random);
    const questions = task === "read"
      ? buildReadQuestions(graphData)
      : task === "interpret"
        ? buildInterpretQuestions(graphData)
        : buildMixedQuestions(graphData);
    generatorState.grade1DataGraphs[task] = { graphData, questions };
  }

  const state = generatorState.grade1DataGraphs[task];
  const next = state.questions.shift();
  if (!next) throw new Error(`No unused Grade 1 ${task} graph questions remain.`);
  return next;
}

module.exports = {
  RESOURCE_TASKS,
  RESPONSE_TYPES,
  stableHash,
  rankGraphTopics,
  selectGraphTopic,
  buildGraphData,
  buildReadQuestions,
  buildInterpretQuestions,
  buildMixedQuestions,
  isGrade1DataGraphWorksheet,
  generateGrade1DataGraphProblem
};
