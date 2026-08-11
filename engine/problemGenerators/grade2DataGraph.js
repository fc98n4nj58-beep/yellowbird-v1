const {
  shuffle,
  selectGraphTopic,
  buildPictographData
} = require("./grade1DataGraph");

const RESOURCE_TASKS = Object.freeze({
  grade2_data_display_graphing_read_graph: "read",
  grade2_data_display_graphing_interpret_data: "interpret",
  grade2_data_display_graphing_complete_graph: "complete",
  grade2_data_display_graphing_match_data_to_graph: "match"
});

const READING_TASKS = new Set(["read", "interpret"]);

const VALUE_POOL = Object.freeze([2, 3, 4, 5, 6, 7, 8]);

function isGrade2PictographReadingWorksheet(options = {}) {
  return READING_TASKS.has(RESOURCE_TASKS[options.worksheetId]);
}

function isGrade2CompletePictographWorksheet(options = {}) {
  return RESOURCE_TASKS[options.worksheetId] === "complete";
}

function isGrade2MatchingPictographWorksheet(options = {}) {
  return RESOURCE_TASKS[options.worksheetId] === "match";
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

function buildCompletePictographProblem(graphData, random) {
  const missingThreeCandidates = shuffle(
    graphData.categories.filter((category) => category.value >= 4),
    random
  );
  const missingThree = missingThreeCandidates[0];
  const missingTwo = shuffle(
    graphData.categories.filter((category) => category.id !== missingThree.id && category.value >= 3),
    random
  )[0];
  if (!missingThree || !missingTwo) {
    throw new Error("Grade 2 complete pictograph requires safe rows for two and three omitted symbols.");
  }

  const missingByCategoryId = new Map([
    [missingThree.id, 3],
    [missingTwo.id, 2]
  ]);
  const tableRows = graphData.categories.map(({ id, label, value }) => ({ id, label, value }));
  const graphRows = graphData.categories.map((category) => {
    const missingCount = missingByCategoryId.get(category.id) || 0;
    return {
      categoryId: category.id,
      label: category.label,
      targetValue: category.value,
      requiredSymbolCount: category.value,
      visibleCount: category.value - missingCount,
      visibleSymbolCount: category.value - missingCount,
      missingCount,
      omissionPlacement: missingCount > 0 ? "row_end" : null,
      isIncomplete: missingCount > 0
    };
  });
  const completionRows = graphRows.filter((row) => row.isIncomplete).map((row) => ({
    categoryId: row.categoryId,
    missingCount: row.missingCount,
    omissionPlacement: row.omissionPlacement,
    visibleSymbolCount: row.visibleSymbolCount,
    requiredSymbolCount: row.requiredSymbolCount
  }));
  const missingCategoryIds = completionRows.map((row) => row.categoryId);
  const missingCounts = completionRows.map((row) => row.missingCount);
  const visibleSymbolCounts = graphRows.map((row) => row.visibleSymbolCount);
  const requiredSymbolCounts = graphRows.map((row) => row.requiredSymbolCount);
  const answerState = {
    kind: "completed_pictograph",
    categoryIds: graphRows.map((row) => row.categoryId),
    symbolCounts: requiredSymbolCounts
  };
  const constructionSignature = [
    "grade2_complete_pictograph",
    graphData.datasetId,
    ...graphRows.map((row) => `${row.categoryId}:${row.visibleSymbolCount}+${row.missingCount}`)
  ].join(":");

  Object.assign(graphData, {
    tableRows,
    graphRows,
    completionRows,
    missingCategoryIds,
    missingCounts,
    visibleSymbolCounts,
    requiredSymbolCounts,
    total: graphData.totalValue,
    answerState,
    constructionSignature
  });

  return {
    type: "equation",
    prompt: "",
    answer: "Completed pictograph",
    responseMode: "graph_drawing",
    responseType: "drawing",
    taskMode: "complete_graph",
    graphData,
    graphTaskData: {
      kind: "complete_pictograph",
      tableRows,
      dataTable: tableRows,
      graphRows,
      rows: graphRows,
      completionRows,
      missingCategoryIds,
      missingCounts,
      visibleSymbolCounts,
      requiredSymbolCounts,
      answerState,
      constructionSignature
    },
    answerState,
    duplicateSignature: constructionSignature
  };
}

function buildMatchingPictographProblem(graphData, random, correctChoiceId) {
  const changedIndex = Math.floor(random() * graphData.categories.length);
  const changedCategory = graphData.categories[changedIndex];
  const delta = changedCategory.value === 2
    ? 1
    : changedCategory.value === 8
      ? -1
      : random() < 0.5 ? -1 : 1;
  const distractorValue = changedCategory.value + delta;
  const tableRows = graphData.categories.map(({ id, label, value }) => ({ id, label, value }));
  const distractorRows = tableRows.map((row, index) => ({
    ...row,
    value: index === changedIndex ? distractorValue : row.value
  }));
  const correctFirst = correctChoiceId === "A";
  const choices = [
    { id: "A", isCorrect: correctFirst, categories: correctFirst ? tableRows : distractorRows },
    { id: "B", isCorrect: !correctFirst, categories: correctFirst ? distractorRows : tableRows }
  ];
  const answerState = {
    kind: "pictograph_choice",
    correctChoiceId,
    changedCategoryId: changedCategory.id,
    originalValue: changedCategory.value,
    distractorValue
  };
  const matchingSignature = [
    "grade2_matching_pictograph",
    graphData.datasetId,
    changedCategory.id,
    `${changedCategory.value}${delta > 0 ? "+1" : "-1"}`,
    correctChoiceId
  ].join(":");

  Object.assign(graphData, {
    tableRows,
    correctGraphRows: tableRows,
    distractorGraphRows: distractorRows,
    answerState,
    matchingSignature
  });

  return {
    type: "equation",
    prompt: "",
    answer: correctChoiceId,
    responseMode: "graph_choice",
    responseType: "choice",
    taskMode: "match_graph",
    graphData,
    graphTaskData: {
      kind: "match_graph",
      tableRows,
      dataTable: tableRows,
      correctGraph: { categories: tableRows },
      distractorGraph: { categories: distractorRows },
      choices,
      changedCategoryId: changedCategory.id,
      originalValue: changedCategory.value,
      distractorValue,
      delta,
      correctChoiceId,
      keyValue: graphData.keyValue,
      scale: graphData.scale,
      answerState,
      matchingSignature,
      distractor: {
        kind: delta > 0 ? "one_extra" : "one_missing",
        categoryId: changedCategory.id,
        categoryIndex: changedIndex,
        originalValue: changedCategory.value,
        distractorValue,
        delta
      }
    },
    answerState,
    duplicateSignature: matchingSignature
  };
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

  if (task === "complete") {
    const completeIndex = generatorState.grade2GraphCompleteIndex || 0;
    if (completeIndex >= 2) throw new Error("No unused Grade 2 complete-pictograph tasks remain.");
    const topic = selectGraphTopic({
      worksheetSeed: `${options.worksheetSeed || "yellowbird-default"}:complete:${completeIndex}`,
      graphTopicId: completeIndex === 0 ? options.graphTopicId : null,
      selectionState: generatorState.grade2GraphTopicSelection
    });
    generatorState.grade2GraphCompleteIndex = completeIndex + 1;
    return buildCompletePictographProblem(buildGrade2GraphData(topic, random), random);
  }

  if (task === "match") {
    const matchIndex = generatorState.grade2GraphMatchIndex || 0;
    if (matchIndex >= 2) throw new Error("No unused Grade 2 matching pictograph items remain.");
    const topic = selectGraphTopic({
      worksheetSeed: `${options.worksheetSeed || "yellowbird-default"}:match:${matchIndex}`,
      graphTopicId: matchIndex === 0 ? options.graphTopicId : null,
      selectionState: generatorState.grade2GraphTopicSelection
    });
    const graphData = buildGrade2GraphData(topic, random);
    if (!generatorState.grade2MatchFirstCorrectChoiceId) {
      generatorState.grade2MatchFirstCorrectChoiceId = random() < 0.5 ? "A" : "B";
    }
    const correctChoiceId = matchIndex === 0
      ? generatorState.grade2MatchFirstCorrectChoiceId
      : generatorState.grade2MatchFirstCorrectChoiceId === "A" ? "B" : "A";
    generatorState.grade2GraphMatchIndex = matchIndex + 1;
    return buildMatchingPictographProblem(graphData, random, correctChoiceId);
  }

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
    if (READING_TASKS.has(task)) attachQuestionTruth(graphData, questions);
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
  isGrade2CompletePictographWorksheet,
  isGrade2MatchingPictographWorksheet,
  buildGrade2GraphData,
  buildReadQuestions,
  buildInterpretQuestions,
  buildCompletePictographProblem,
  buildMatchingPictographProblem,
  generateGrade2DataGraphProblem
};
