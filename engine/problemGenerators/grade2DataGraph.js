const {
  shuffle,
  selectGraphTopic,
  buildPictographData
} = require("./grade1DataGraph");

const RESOURCE_TASKS = Object.freeze({
  grade2_data_display_graphing_read_graph: "read",
  grade2_data_display_graphing_interpret_data: "interpret"
});

const VALUE_POOL = Object.freeze([2, 3, 4, 5, 6, 7, 8]);

function isGrade2PictographReadingWorksheet(options = {}) {
  return Boolean(RESOURCE_TASKS[options.worksheetId]);
}

function injectedRandom(options = {}) {
  if (typeof options.random !== "function") {
    throw new Error("Grade 2 pictograph generation requires injected seeded randomness.");
  }
  return options.random;
}

function buildGrade2GraphData(topic, random) {
  const values = shuffle(VALUE_POOL, random).slice(0, 4);
  return buildPictographData(topic, values, {
    includeStructuredAliases: true,
    datasetPrefix: "grade2_pictograph",
    readingLevel: "grade2_short"
  });
}

function graphQuestion(graphData, definition) {
  const categoryIds = definition.categories.map((category) => category.id);
  return {
    type: "equation",
    taskMode: definition.taskMode,
    prompt: definition.prompt,
    answer: definition.answer,
    responseMode: "graph_short_answer",
    responseType: definition.responseType,
    graphQuestionType: definition.questionType,
    graphCategory: definition.categories.map((category) => category.label).join(" / "),
    graphData,
    answerState: {
      kind: "graph_answer",
      questionType: definition.questionType,
      categoryIds,
      value: definition.answer
    },
    duplicateSignature: [
      "grade2_pictograph",
      graphData.datasetId,
      definition.questionType,
      categoryIds.join("+"),
      definition.prompt
    ].join(":")
  };
}

function readPrompt(graphData, category, variant) {
  if (variant === 1) {
    return `What value does the pictograph show for ${category.label}?`;
  }
  return `How many ${graphData.questionNoun} are shown for ${category.label}?`;
}

function buildReadQuestions(graphData, random) {
  const categories = shuffle(graphData.categories, random);
  const repeated = shuffle(categories, random).slice(0, 2);
  const questionDefinitions = shuffle([
    ...categories.map((category) => ({ category, variant: 0 })),
    ...repeated.map((category) => ({ category, variant: 1 }))
  ], random);

  return questionDefinitions.map(({ category, variant }) => graphQuestion(graphData, {
    taskMode: "read_pictograph",
    questionType: "category_value",
    responseType: "number",
    categories: [category],
    prompt: readPrompt(graphData, category, variant),
    answer: category.value
  }));
}

function orderedPair(first, second) {
  return first.value > second.value
    ? { higher: first, lower: second }
    : { higher: second, lower: first };
}

function buildInterpretQuestions(graphData, random) {
  const categories = graphData.categories;
  const most = categories.find((category) => category.value === graphData.maximumValue);
  const least = categories.find((category) => category.value === graphData.minimumValue);
  const comparisonOrder = shuffle(categories, random);
  const morePair = orderedPair(comparisonOrder[0], comparisonOrder[1]);
  const fewerPair = orderedPair(comparisonOrder[2], comparisonOrder[3]);
  const combinedCategories = shuffle(categories, random).slice(0, 2);
  const noun = graphData.questionNoun;

  return [
    graphQuestion(graphData, {
      taskMode: "interpret_pictograph",
      questionType: "most",
      responseType: "category",
      categories: [most],
      prompt: `Which category has the most ${noun}?`,
      answer: most.label
    }),
    graphQuestion(graphData, {
      taskMode: "interpret_pictograph",
      questionType: "least",
      responseType: "category",
      categories: [least],
      prompt: `Which category has the least ${noun}?`,
      answer: least.label
    }),
    graphQuestion(graphData, {
      taskMode: "interpret_pictograph",
      questionType: "more_difference",
      responseType: "number",
      categories: [morePair.higher, morePair.lower],
      prompt: `How many more ${noun} are shown for ${morePair.higher.label} than for ${morePair.lower.label}?`,
      answer: morePair.higher.value - morePair.lower.value
    }),
    graphQuestion(graphData, {
      taskMode: "interpret_pictograph",
      questionType: "fewer_difference",
      responseType: "number",
      categories: [fewerPair.lower, fewerPair.higher],
      prompt: `How many fewer ${noun} are shown for ${fewerPair.lower.label} than for ${fewerPair.higher.label}?`,
      answer: fewerPair.higher.value - fewerPair.lower.value
    }),
    graphQuestion(graphData, {
      taskMode: "interpret_pictograph",
      questionType: "combined_total",
      responseType: "number",
      categories: combinedCategories,
      prompt: `What is the combined total for ${combinedCategories[0].label} and ${combinedCategories[1].label}?`,
      answer: combinedCategories[0].value + combinedCategories[1].value
    }),
    graphQuestion(graphData, {
      taskMode: "interpret_pictograph",
      questionType: "graph_total",
      responseType: "number",
      categories,
      prompt: "What is the total across all four categories?",
      answer: graphData.totalValue
    })
  ];
}

function attachQuestionTruth(graphData, questions) {
  graphData.questions = questions.map((question) => ({
    questionType: question.graphQuestionType,
    prompt: question.prompt,
    categoryIds: [...question.answerState.categoryIds]
  }));
  graphData.answers = questions.map((question) => question.answer);
  graphData.answerState = questions.map((question) => ({ ...question.answerState }));
}

function generateGrade2DataGraphProblem(options = {}) {
  const task = RESOURCE_TASKS[options.worksheetId];
  if (!task) {
    throw new Error(`Unsupported Grade 2 pictograph worksheet '${options.worksheetId || ""}'.`);
  }

  const random = injectedRandom(options);
  const generatorState = options.generatorState || {};
  generatorState.grade2DataGraphs = generatorState.grade2DataGraphs || {};
  generatorState.grade2GraphTopicSelection = generatorState.grade2GraphTopicSelection || {};

  if (!generatorState.grade2DataGraphs[task]) {
    const topic = selectGraphTopic({
      worksheetSeed: options.worksheetSeed,
      graphTopicId: options.graphTopicId,
      selectionState: generatorState.grade2GraphTopicSelection
    });
    const graphData = buildGrade2GraphData(topic, random);
    const questions = task === "read"
      ? buildReadQuestions(graphData, random)
      : buildInterpretQuestions(graphData, random);
    attachQuestionTruth(graphData, questions);
    generatorState.grade2DataGraphs[task] = { graphData, questions };
  }

  const next = generatorState.grade2DataGraphs[task].questions.shift();
  if (!next) throw new Error(`No unused Grade 2 ${task} pictograph questions remain.`);
  return next;
}

module.exports = {
  RESOURCE_TASKS,
  VALUE_POOL,
  isGrade2PictographReadingWorksheet,
  buildGrade2GraphData,
  buildReadQuestions,
  buildInterpretQuestions,
  generateGrade2DataGraphProblem
};
