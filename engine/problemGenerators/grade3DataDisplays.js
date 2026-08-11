const {
  shuffle,
  selectGraphTopic,
  buildPictographData
} = require("./grade1DataGraph");

const RESOURCE_TASKS = Object.freeze({
  g3_complete_a_graph: "complete",
  g3_graph_questions: "questions",
  g3_interpret_data: "interpret",
  g3_match_data_to_graph: "match",
  g3_read_a_graph: "read"
});

const SAFE_VALUES = Object.freeze([2, 3, 4, 5, 6, 7, 8]);
const CATEGORY_COUNT = 4;
const QUESTION_TYPES = Object.freeze({
  read: Object.freeze(["category_value"]),
  questions: Object.freeze(["category_value", "most", "least", "difference", "combined_total", "graph_total"]),
  interpret: Object.freeze(["supported_statement"])
});
const RAW_GEOMETRY_KEYS = Object.freeze([
  "graphWidth", "graphHeight", "symbolGap", "symbolInset", "axisOffset",
  "labelPosition", "categoryGeometry", "graphJson"
]);

function listInput(options, keys, { labels = false } = {}) {
  const supplied = keys.some((key) => Object.prototype.hasOwnProperty.call(options, key));
  const values = keys.flatMap((key) => {
    const value = options[key];
    if (Array.isArray(value)) return value;
    if (typeof value === "string") return labels ? value.split(/[|,]/) : value.split(/[\s,|]+/);
    return value == null ? [] : [value];
  }).map((value) => typeof value === "string" ? value.trim() : value);
  return { supplied, values };
}

function assertNoRawGeometry(options) {
  const supplied = RAW_GEOMETRY_KEYS.find((key) => options[key] != null && options[key] !== "");
  if (supplied) throw new Error(`Grade 3 data displays do not accept raw renderer geometry '${supplied}'.`);
}

function resolveGraphType(options) {
  const graphTypes = listInput(options, ["graphType", "graphTypes", "selectedGraphType"]).values
    .filter((value) => value !== "")
    .map((value) => String(value).trim().toLowerCase());
  if (graphTypes.some((value) => value !== "pictograph") || new Set(graphTypes).size > 1) {
    throw new Error("Grade 3 data displays support pictographs only.");
  }
  return "pictograph";
}

function resolveScale(options) {
  const requested = listInput(options, ["scale", "keyValue", "symbolValue"]).values
    .filter((value) => value !== "")
    .map(Number);
  if (requested.some((value) => !Number.isInteger(value) || value !== 1)) {
    throw new Error("Grade 3 pictographs support a scale of 1 only.");
  }
  if (options.allowPartialSymbols === true || options.partialSymbols === true) {
    throw new Error("Grade 3 pictographs support whole symbols only.");
  }
  return 1;
}

function resolveCategoryCount(options) {
  if (options.categoryCount == null || options.categoryCount === "") return CATEGORY_COUNT;
  const count = Number(options.categoryCount);
  if (!Number.isInteger(count) || count !== CATEGORY_COUNT) {
    throw new Error("Grade 3 pictographs support exactly 4 categories in this family.");
  }
  return count;
}

function resolveLabels(options, topic) {
  const input = listInput(options, ["selectedCategories", "categories", "categoryLabels"], { labels: true });
  if (!input.supplied) return { labels: [...topic.categories], isCustom: false };
  if (input.values.length !== CATEGORY_COUNT) {
    throw new Error("Grade 3 pictographs require exactly 4 category labels.");
  }
  const labels = input.values.map((value) => String(value));
  if (labels.some((label) => !label || label.length > 14)) {
    throw new Error("Grade 3 pictograph category labels must be non-blank and at most 14 characters.");
  }
  if (new Set(labels.map((label) => label.toLowerCase())).size !== labels.length) {
    throw new Error("Grade 3 pictograph category labels must be unique.");
  }
  return { labels, isCustom: true };
}

function resolveValues(options, random) {
  const input = listInput(options, ["selectedValues", "values", "categoryValues"]);
  if (!input.supplied) return shuffle(SAFE_VALUES, random).slice(0, CATEGORY_COUNT);
  if (input.values.length !== CATEGORY_COUNT) {
    throw new Error("Grade 3 pictographs require exactly 4 category values.");
  }
  const values = input.values.map(Number);
  if (values.some((value) => !Number.isInteger(value) || !SAFE_VALUES.includes(value))) {
    throw new Error("Grade 3 pictograph values must be unique whole numbers from 2 through 8.");
  }
  if (new Set(values).size !== values.length) {
    throw new Error("Grade 3 pictograph values must be unique so comparisons remain unambiguous.");
  }
  return values;
}

function resolveQuestionTypes(options, task) {
  const allowed = QUESTION_TYPES[task] || [];
  const input = listInput(options, ["selectedQuestionTypes", "questionTypes"]);
  if (!input.supplied) return allowed;
  if (!input.values.length || input.values.some((value) => !allowed.includes(String(value)))) {
    throw new Error(`Unsupported Grade 3 ${task} graph question type.`);
  }
  return [...new Set(input.values.map(String))];
}

function buildGraphData(options, random, state, suffix = "shared") {
  assertNoRawGeometry(options);
  resolveGraphType(options);
  resolveScale(options);
  resolveCategoryCount(options);
  state.topicSelection = state.topicSelection || {};
  const topic = selectGraphTopic({
    worksheetSeed: `${options.worksheetSeed || "yellowbird-default"}:${suffix}`,
    graphTopicId: options.graphTopicId,
    selectionState: state.topicSelection
  });
  const { labels, isCustom } = resolveLabels(options, topic);
  const values = resolveValues(options, random);
  const graphData = buildPictographData(topic, values, {
    includeStructuredAliases: true,
    datasetPrefix: `grade3_data:${suffix}`,
    readingLevel: "grade3_short"
  });
  if (isCustom) {
    Object.assign(graphData, {
      topicId: "custom-categories",
      title: "Class Data",
      scenario: "A class recorded data for four categories. The pictograph shows the results.",
      questionNoun: "items",
      unitSingular: "item",
      unitPlural: "items",
      keyText: "= 1 item",
      keyLabel: "= 1 item"
    });
  }
  graphData.categories = graphData.categories.map((category, index) => ({
    ...category,
    id: `${isCustom ? "custom-categories" : topic.id}:category-${index + 1}`,
    label: labels[index],
    value: values[index],
    symbolCount: values[index]
  }));
  graphData.values = [...values];
  graphData.datasetId = `grade3_data:${suffix}:${topic.id}:${labels.join("+")}:${values.join("-")}`;
  graphData.graphType = "pictograph";
  graphData.modelType = "one_to_one_pictograph";
  graphData.scale = 1;
  graphData.keyValue = 1;
  graphData.symbolValue = 1;
  graphData.partialSymbols = false;
  graphData.maximumValue = Math.max(...values);
  graphData.minimumValue = Math.min(...values);
  graphData.totalValue = values.reduce((sum, value) => sum + value, 0);
  graphData.maximumSymbolCount = graphData.maximumValue;
  graphData.displayState = {
    kind: "complete_pictograph",
    categoryOrder: graphData.categories.map((category) => category.id),
    symbolCounts: [...values]
  };
  return graphData;
}

function graphQuestion(graphData, definition) {
  const categoryIds = definition.categories.map((category) => category.id);
  return {
    type: "equation",
    prompt: definition.prompt,
    answer: definition.answer,
    responseMode: "graph_short_answer",
    responseType: definition.responseType,
    taskMode: definition.taskMode,
    taskAction: definition.taskAction,
    graphQuestionType: definition.questionType,
    graphCategory: definition.categories.map((category) => category.label).join(" / "),
    graphData,
    answerState: {
      kind: "grade3_graph_answer",
      questionType: definition.questionType,
      categoryIds,
      value: definition.answer,
      ...(definition.answerState || {})
    },
    duplicateSignature: [
      "grade3_data", graphData.datasetId, definition.taskAction,
      definition.questionType, categoryIds.join("+"), definition.variant || "default"
    ].join(":"),
    ...(definition.extra || {})
  };
}

function buildReadQuestions(graphData) {
  const noun = graphData.questionNoun;
  const promptDefinitions = graphData.categories.map((category, index) => {
    const countFirst = index % 2 === 0;
    return [
      {
        prompt: countFirst
          ? `How many ${noun} are shown for ${category.label}?`
          : `What value does the pictograph show for ${category.label}?`,
        variant: countFirst ? "count" : "value"
      },
      {
        prompt: countFirst
          ? `What value does the pictograph show for ${category.label}?`
          : `How many ${noun} are shown for ${category.label}?`,
        variant: countFirst ? "value" : "count"
      }
    ];
  });
  return [0, 1].flatMap((round) => graphData.categories.map((category, index) => {
    const definition = promptDefinitions[index][round];
    return graphQuestion(graphData, {
      taskMode: "read_pictograph",
      taskAction: "read",
      questionType: "category_value",
      responseType: "number",
      categories: [category],
      prompt: definition.prompt,
      answer: category.value,
      variant: `${definition.variant}-${index}`,
      answerState: { promptVariant: definition.variant }
    });
  }));
}

function buildGraphQuestions(graphData) {
  const categories = graphData.categories;
  const most = categories.find((category) => category.value === graphData.maximumValue);
  const least = categories.find((category) => category.value === graphData.minimumValue);
  const middle = categories.filter((category) => category !== most && category !== least);
  return [
    graphQuestion(graphData, {
      taskMode: "graph_questions", taskAction: "questions", questionType: "category_value",
      responseType: "number", categories: [middle[0]],
      prompt: `How many ${graphData.questionNoun} are shown for ${middle[0].label}?`, answer: middle[0].value
    }),
    graphQuestion(graphData, {
      taskMode: "graph_questions", taskAction: "questions", questionType: "most",
      responseType: "category", categories: [most],
      prompt: `Which category has the most ${graphData.questionNoun}?`, answer: most.label
    }),
    graphQuestion(graphData, {
      taskMode: "graph_questions", taskAction: "questions", questionType: "least",
      responseType: "category", categories: [least],
      prompt: `Which category has the least ${graphData.questionNoun}?`, answer: least.label
    }),
    graphQuestion(graphData, {
      taskMode: "graph_questions", taskAction: "questions", questionType: "difference",
      responseType: "number", categories: [most, least],
      prompt: `How many more ${graphData.questionNoun} are shown for ${most.label} than for ${least.label}?`,
      answer: most.value - least.value
    }),
    graphQuestion(graphData, {
      taskMode: "graph_questions", taskAction: "questions", questionType: "combined_total",
      responseType: "number", categories: middle,
      prompt: `What is the combined total for ${middle[0].label} and ${middle[1].label}?`,
      answer: middle[0].value + middle[1].value
    }),
    graphQuestion(graphData, {
      taskMode: "graph_questions", taskAction: "questions", questionType: "graph_total",
      responseType: "number", categories,
      prompt: "What is the total across all four categories?", answer: graphData.totalValue
    })
  ];
}

function claimText(categoryA, categoryB, claimedDifference) {
  return `The value for ${categoryA.label} is ${claimedDifference} greater than the value for ${categoryB.label}.`;
}

function buildInterpretQuestions(graphData) {
  const ordered = [...graphData.categories].sort((left, right) => right.value - left.value);
  const most = ordered[0];
  const least = ordered[ordered.length - 1];
  const pair = [ordered[1], ordered[2]];
  const difference = pair[0].value - pair[1].value;
  const definitions = [
    { categories: [most], conclusion: `The value for ${most.label} is the greatest.`, supported: true, kind: "greatest", actual: most.id, claimed: most.id },
    { categories: [ordered[1]], conclusion: `The value for ${ordered[1].label} is the greatest.`, supported: false, kind: "greatest", actual: most.id, claimed: ordered[1].id },
    { categories: pair, conclusion: claimText(pair[0], pair[1], difference), supported: true, kind: "difference", actual: difference, claimed: difference },
    { categories: pair, conclusion: claimText(pair[0], pair[1], difference + 1), supported: false, kind: "difference", actual: difference, claimed: difference + 1 }
  ];
  return definitions.map((definition, index) => graphQuestion(graphData, {
    taskMode: "interpret_pictograph",
    taskAction: "interpret",
    questionType: "supported_statement",
    responseType: "yes_no",
    categories: definition.categories,
    prompt: `Statement: ${definition.conclusion} Write Yes or No.`,
    answer: definition.supported ? "Yes" : "No",
    variant: `statement-${index}`,
    answerState: {
      conclusion: definition.conclusion,
      isSupported: definition.supported,
      claimKind: definition.kind,
      actualValue: definition.actual,
      claimedValue: definition.claimed
    }
  }));
}

function buildCompleteProblem(graphData, random) {
  const selected = shuffle([...graphData.categories], random).slice(0, 2);
  const missingById = new Map([[selected[0].id, 2], [selected[1].id, 1]]);
  const tableRows = graphData.categories.map(({ id, label, value }) => ({ id, label, value }));
  const graphRows = graphData.categories.map((category) => {
    const missingCount = missingById.get(category.id) || 0;
    return {
      categoryId: category.id,
      label: category.label,
      targetValue: category.value,
      requiredSymbolCount: category.value,
      visibleCount: category.value - missingCount,
      visibleSymbolCount: category.value - missingCount,
      missingCount,
      omissionPlacement: missingCount ? "row_end" : null,
      isIncomplete: missingCount > 0
    };
  });
  const completionRows = graphRows.filter((row) => row.isIncomplete);
  const answerState = {
    kind: "completed_pictograph",
    categoryIds: graphRows.map((row) => row.categoryId),
    symbolCounts: graphRows.map((row) => row.requiredSymbolCount)
  };
  const signature = `grade3_data:${graphData.datasetId}:complete:${completionRows.map((row) => `${row.categoryId}+${row.missingCount}`).join("|")}`;
  Object.assign(graphData, {
    taskAction: "complete",
    tableRows,
    graphRows,
    completionRows,
    answerState,
    duplicateSignature: signature
  });
  return {
    type: "equation", prompt: "", answer: "Completed pictograph",
    responseMode: "graph_drawing", responseType: "drawing", taskMode: "complete_graph", taskAction: "complete",
    graphData,
    graphTaskData: {
      kind: "complete_pictograph", dataTable: tableRows, tableRows, graphRows, rows: graphRows,
      completionRows, missingCategoryIds: completionRows.map((row) => row.categoryId),
      missingCounts: completionRows.map((row) => row.missingCount), answerState
    },
    answerState,
    duplicateSignature: signature
  };
}

function rowsEqual(left, right) {
  return left.length === right.length && left.every((row, index) =>
    row.label === right[index].label && row.value === right[index].value
  );
}

function buildMatchProblem(graphData, random, correctChoiceId) {
  const tableRows = graphData.categories.map(({ id, label, value }) => ({ id, label, value }));
  const changedIndex = Math.floor(random() * tableRows.length);
  const originalValue = tableRows[changedIndex].value;
  const delta = originalValue >= 8 ? -1 : originalValue <= 2 ? 1 : random() < 0.5 ? -1 : 1;
  const distractorRows = tableRows.map((row, index) => ({
    ...row,
    value: index === changedIndex ? row.value + delta : row.value
  }));
  const choices = ["A", "B"].map((id) => ({
    id,
    isCorrect: id === correctChoiceId,
    categories: (id === correctChoiceId ? tableRows : distractorRows).map((row) => ({ ...row }))
  }));
  const answerState = {
    kind: "pictograph_choice", correctChoiceId,
    changedCategoryId: tableRows[changedIndex].id, originalValue,
    distractorValue: originalValue + delta
  };
  const signature = `grade3_data:${graphData.datasetId}:match:${changedIndex}:${delta}:${correctChoiceId}`;
  Object.assign(graphData, { taskAction: "match", tableRows, answerState, duplicateSignature: signature });
  return {
    type: "equation", prompt: "", answer: correctChoiceId,
    responseMode: "graph_choice", responseType: "choice", taskMode: "match_graph", taskAction: "match",
    graphData,
    graphTaskData: {
      kind: "match_graph", dataTable: tableRows, tableRows, choices, correctChoiceId,
      changedCategoryId: tableRows[changedIndex].id, originalValue,
      distractorValue: originalValue + delta, delta, scale: 1, keyValue: 1, answerState,
      distractor: { kind: delta > 0 ? "one_extra" : "one_missing", categoryIndex: changedIndex, delta }
    },
    answerState,
    duplicateSignature: signature
  };
}

function buildQueue(options, task, random, state) {
  const count = Number(options.questionCount);
  if (task === "match") {
    const firstChoice = random() < 0.5 ? "A" : "B";
    return Array.from({ length: count }, (_, index) => {
      const graph = buildGraphData(options, random, state, `match-${index + 1}`);
      const correctChoice = index % 2 === 0 ? firstChoice : firstChoice === "A" ? "B" : "A";
      return buildMatchProblem(graph, random, correctChoice);
    });
  }
  if (task === "complete") {
    return Array.from({ length: count }, (_, index) =>
      buildCompleteProblem(buildGraphData(options, random, state, `complete-${index + 1}`), random)
    );
  }
  const graph = buildGraphData(options, random, state, task);
  const allowedTypes = resolveQuestionTypes(options, task);
  const pool = task === "read"
    ? buildReadQuestions(graph)
    : task === "questions"
      ? buildGraphQuestions(graph)
      : buildInterpretQuestions(graph);
  const filtered = pool.filter((question) => allowedTypes.includes(question.graphQuestionType));
  if (filtered.length < count) throw new Error(`Grade 3 ${task} graph task does not have enough unique supported questions.`);
  const questions = filtered.slice(0, count);
  graph.taskAction = task;
  graph.questions = questions.map((question) => ({
    questionType: question.graphQuestionType,
    prompt: question.prompt,
    categoryIds: [...question.answerState.categoryIds]
  }));
  graph.answers = questions.map((question) => question.answer);
  graph.answerState = questions.map((question) => ({ ...question.answerState }));
  return questions;
}

function isGrade3DataDisplayWorksheet(options = {}) {
  return Boolean(RESOURCE_TASKS[options.worksheetId]);
}

function generateGrade3DataDisplayProblem(options = {}) {
  const task = RESOURCE_TASKS[options.worksheetId];
  if (!task) throw new Error(`Unsupported Grade 3 data-display worksheet '${options.worksheetId || ""}'.`);
  if (typeof options.random !== "function") throw new Error("Grade 3 data-display generation requires injected seeded randomness.");
  const state = options.generatorState || {};
  state.grade3DataDisplayQueues = state.grade3DataDisplayQueues || {};
  if (!state.grade3DataDisplayQueues[task]) {
    state.grade3DataDisplayQueues[task] = buildQueue(options, task, options.random, state);
  }
  const next = state.grade3DataDisplayQueues[task].shift();
  if (!next) throw new Error(`No unused Grade 3 ${task} graph items remain.`);
  return next;
}

function validateGraph(graph) {
  if (!graph || graph.graphType !== "pictograph" || graph.scale !== 1 || graph.keyValue !== 1 || graph.partialSymbols !== false) {
    throw new Error("Grade 3 data-display graph contract is invalid.");
  }
  if (!Array.isArray(graph.categories) || graph.categories.length !== CATEGORY_COUNT) {
    throw new Error("Grade 3 data displays require exactly 4 categories.");
  }
  const labels = graph.categories.map((category) => category.label);
  const values = graph.categories.map((category) => category.value);
  if (labels.some((label) => !label) || new Set(labels.map((label) => label.toLowerCase())).size !== labels.length) {
    throw new Error("Grade 3 data-display categories must be non-blank and unique.");
  }
  if (values.some((value) => !Number.isInteger(value) || !SAFE_VALUES.includes(value)) || new Set(values).size !== values.length) {
    throw new Error("Grade 3 data-display values must be unique whole numbers from 2 through 8.");
  }
  if (graph.categories.some((category) => category.symbolCount !== category.value) ||
      JSON.stringify(graph.values) !== JSON.stringify(values) ||
      graph.totalValue !== values.reduce((sum, value) => sum + value, 0)) {
    throw new Error("Grade 3 data-display symbol/value truth is inconsistent.");
  }
}

function deriveQuestionAnswer(item) {
  const graph = item.graphData;
  const byId = new Map(graph.categories.map((category) => [category.id, category]));
  const categories = item.answerState.categoryIds.map((id) => byId.get(id));
  switch (item.graphQuestionType) {
    case "category_value": return categories[0].value;
    case "most": return graph.categories.find((category) => category.value === graph.maximumValue).label;
    case "least": return graph.categories.find((category) => category.value === graph.minimumValue).label;
    case "difference": return categories[0].value - categories[1].value;
    case "combined_total": return categories[0].value + categories[1].value;
    case "graph_total": return graph.totalValue;
    case "supported_statement": return item.answerState.isSupported ? "Yes" : "No";
    default: throw new Error(`Unsupported Grade 3 graph question '${item.graphQuestionType}'.`);
  }
}

function validateComplete(item) {
  const task = item.graphTaskData;
  const table = task.dataTable;
  if (!Array.isArray(table) || !rowsEqual(table, item.graphData.categories) || !Array.isArray(task.graphRows)) {
    throw new Error("Grade 3 complete-graph table does not match graph truth.");
  }
  const incomplete = task.graphRows.filter((row) => row.isIncomplete);
  if (incomplete.length !== 2 || task.graphRows.some((row) =>
    row.visibleSymbolCount + row.missingCount !== row.requiredSymbolCount ||
    row.requiredSymbolCount !== table.find((entry) => entry.id === row.categoryId)?.value
  )) {
    throw new Error("Grade 3 complete-graph omission truth is invalid.");
  }
}

function validateMatch(item) {
  const task = item.graphTaskData;
  if (!Array.isArray(task.choices) || task.choices.length !== 2) throw new Error("Grade 3 matching requires exactly two graph choices.");
  const correct = task.choices.filter((choice) => rowsEqual(task.dataTable, choice.categories));
  if (correct.length !== 1 || correct[0].id !== task.correctChoiceId || item.answer !== task.correctChoiceId) {
    throw new Error("Grade 3 matching requires exactly one correct graph choice.");
  }
  const distractor = task.choices.find((choice) => !choice.isCorrect);
  const differences = distractor.categories.filter((row, index) => row.value !== task.dataTable[index].value);
  if (differences.length !== 1 || Math.abs(differences[0].value - task.dataTable[distractor.categories.indexOf(differences[0])].value) !== 1) {
    throw new Error("Grade 3 matching distractor must differ in exactly one category by 1.");
  }
}

function validateGrade3DataDisplayWorksheet(resourceId, problems = []) {
  const task = RESOURCE_TASKS[resourceId];
  if (!task) return;
  if (!problems.length) throw new Error("Grade 3 data display generated no items.");
  const signatures = new Set();
  problems.forEach((item) => {
    validateGraph(item.graphData);
    if (!item.duplicateSignature || signatures.has(item.duplicateSignature)) {
      throw new Error("Grade 3 data display contains a duplicate item.");
    }
    signatures.add(item.duplicateSignature);
    if (task === "complete") validateComplete(item);
    else if (task === "match") validateMatch(item);
    else if (deriveQuestionAnswer(item) !== item.answer || item.answerState.value !== item.answer) {
      throw new Error("Grade 3 graph-question answer truth is inconsistent.");
    }
  });
}

module.exports = {
  RESOURCE_TASKS,
  SAFE_VALUES,
  QUESTION_TYPES,
  isGrade3DataDisplayWorksheet,
  buildGraphData,
  buildReadQuestions,
  buildGraphQuestions,
  buildInterpretQuestions,
  buildCompleteProblem,
  buildMatchProblem,
  generateGrade3DataDisplayProblem,
  validateGrade3DataDisplayWorksheet
};
