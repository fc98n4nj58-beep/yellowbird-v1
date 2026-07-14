const RESOURCE_TASKS = Object.freeze({
  grade1_data_display_graphing_read_graph: "read",
  grade1_data_display_graphing_interpret_data: "interpret",
  grade1_data_display_graphing_graph_questions: "mixed",
  grade1_data_display_graphing_complete_graph: "complete_graph",
  grade1_data_display_graphing_match_data_to_graph: "match_graph",
  grade1_data_display_graphing_graph_word_problems: "graph_application"
});

const {
  GRADE1_GRAPH_TOPICS,
  graphTopicById
} = require("../content/grade1GraphTopics");

const BASE_VALUES = Object.freeze([3, 5, 5, 7]);
const GRAPH_APPLICATION_OPERATIONS = Object.freeze([
  Object.freeze({ operation: "+", amount: 1 }),
  Object.freeze({ operation: "+", amount: 2 }),
  Object.freeze({ operation: "-", amount: 1 }),
  Object.freeze({ operation: "-", amount: 2 })
]);
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
    supportsCategoryApplicationLanguage: topic.supportsCategoryApplicationLanguage,
    readingLevel: topic.readingLevel,
    keyLabel: topic.keyLabel,
    keyText: topic.keyText,
    symbol: "circle",
    symbolValue: 1,
    colorRequired: false,
    categories: topic.categories.map((label, index) => ({
      label,
      value: values[index],
      categoryLanguage: topic.categoryLanguage[index]
    }))
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

function buildCompleteGraphProblem(graphData, random = Math.random) {
  const incompleteIndexes = shuffle([0, 1, 2, 3], random).slice(0, 2);
  const missingByIndex = new Map([
    [incompleteIndexes[0], Math.min(1, graphData.categories[incompleteIndexes[0]].value)],
    [incompleteIndexes[1], Math.min(2, graphData.categories[incompleteIndexes[1]].value)]
  ]);
  const rows = graphData.categories.map((category, index) => {
    const missingCount = missingByIndex.get(index) || 0;
    return {
      label: category.label,
      targetValue: category.value,
      visibleCount: category.value - missingCount,
      missingCount,
      isIncomplete: missingCount > 0
    };
  });

  return {
    type: "equation",
    prompt: "",
    answer: "Completed graph",
    responseMode: "graph_drawing",
    responseType: "drawing",
    taskMode: "complete_graph",
    graphData,
    graphTaskData: {
      kind: "complete_pictograph",
      dataTable: graphData.categories.map(({ label, value }) => ({ label, value })),
      rows
    },
    duplicateSignature: `grade1_data:${graphData.topicId}:complete_graph:${rows.map((row) => row.visibleCount).join("-")}`
  };
}

function buildMatchGraphProblem(graphData, random = Math.random) {
  const changedIndex = Math.floor(random() * graphData.categories.length);
  const originalValue = graphData.categories[changedIndex].value;
  const delta = originalValue >= 7 ? -1 : originalValue <= 3 ? 1 : random() < 0.5 ? -1 : 1;
  const distractorCategories = graphData.categories.map((category, index) => ({
    ...category,
    value: index === changedIndex ? category.value + delta : category.value
  }));
  const correctFirst = random() < 0.5;
  const choices = [
    { id: "A", isCorrect: correctFirst, categories: correctFirst ? graphData.categories : distractorCategories },
    { id: "B", isCorrect: !correctFirst, categories: correctFirst ? distractorCategories : graphData.categories }
  ].map((choice) => ({
    ...choice,
    categories: choice.categories.map(({ label, value }) => ({ label, value }))
  }));

  return {
    type: "equation",
    prompt: "",
    answer: correctFirst ? "A" : "B",
    responseMode: "graph_choice",
    responseType: "choice",
    taskMode: "match_graph",
    graphData,
    graphTaskData: {
      kind: "match_graph",
      dataTable: graphData.categories.map(({ label, value }) => ({ label, value })),
      choices,
      correctChoiceId: correctFirst ? "A" : "B",
      distractor: {
        kind: delta > 0 ? "one_extra" : "one_missing",
        categoryIndex: changedIndex,
        delta
      }
    },
    duplicateSignature: `grade1_data:${graphData.topicId}:match_graph:${changedIndex}:${delta}:${correctFirst ? "A" : "B"}`
  };
}

function quantityWords(amount, unitSingular, unitPlural) {
  return {
    amountWord: amount === 1 ? "One" : "Two",
    unit: amount === 1 ? unitSingular : unitPlural,
    verb: amount === 1 ? "was" : "were"
  };
}

function sentenceCategoryLabel(label) {
  return String(label || "").trim().toLowerCase();
}

function supportsCategoryNounApplication(topic) {
  return topic?.supportsCategoryApplicationLanguage === true
    && Array.isArray(topic.categoryLanguage || topic.categories)
    && (topic.categoryLanguage || topic.categories.map((category) => category.categoryLanguage)).every(Boolean);
}

function categoryNounApplicationPrompt(category, amount, operation) {
  const language = category.categoryLanguage;
  if (!language) throw new Error(`Category '${category.label}' has no safe Grade 1 application noun.`);
  const quantity = amount === 1 ? "One" : "Two";
  const noun = amount === 1 ? language.singularNoun : language.pluralNoun;
  const phrase = operation === "+" ? language.addPhrase : language.removePhrase;
  const verbPhrase = amount === 1 ? phrase.singular : phrase.plural;
  if (operation === "+") {
    return `${quantity} more ${noun} ${verbPhrase}. How many ${language.pluralNoun} are there now?`;
  }
  return `${quantity} ${noun} ${verbPhrase}. How many ${language.pluralNoun} are left?`;
}

function singularCategoryLabel(label) {
  const value = String(label || "").trim();
  if (/^(fish|deer)$/i.test(value)) return value.toLowerCase();
  if (/ies$/i.test(value)) return `${value.slice(0, -3)}y`.toLowerCase();
  if (/(ches|shes|xes|ses)$/i.test(value)) return value.slice(0, -2).toLowerCase();
  if (/s$/i.test(value) && !/^(bus|moss)$/i.test(value)) return value.slice(0, -1).toLowerCase();
  return value.toLowerCase();
}

function pluralCategoryLabel(label) {
  const value = String(label || "").trim();
  if (/^(fish|deer)$/i.test(value)) return value.toLowerCase();
  if (/s$/i.test(value) && !/^bus$/i.test(value)) return value.toLowerCase();
  if (/[^aeiou]y$/i.test(value)) return `${value.slice(0, -1)}ies`.toLowerCase();
  if (/(s|x|ch|sh)$/i.test(value)) return `${value}es`.toLowerCase();
  return `${value}s`.toLowerCase();
}

const GRAPH_APPLICATION_LANGUAGE = Object.freeze({
  vote: Object.freeze({
    supports: () => true,
    add: ({ category, amount }) => `${amount === 1 ? "One more student" : "Two more students"} chose ${sentenceCategoryLabel(category.label)}. How many students chose ${sentenceCategoryLabel(category.label)} now?`,
    subtract: ({ category, amount }) => `${amount === 1 ? "One student changed" : "Two students changed"} from ${sentenceCategoryLabel(category.label)}. How many students still chose ${sentenceCategoryLabel(category.label)}?`
  }),
  survey: Object.freeze({
    supports: () => true,
    add: ({ category, amount }) => `${amount === 1 ? "One more student" : "Two more students"} chose ${sentenceCategoryLabel(category.label)}. How many students chose ${sentenceCategoryLabel(category.label)} now?`,
    subtract: ({ category, amount }) => `${amount === 1 ? "One student changed" : "Two students changed"} from ${sentenceCategoryLabel(category.label)}. How many students still chose ${sentenceCategoryLabel(category.label)}?`
  }),
  count: Object.freeze({
    supports: supportsCategoryNounApplication,
    add: ({ category, amount }) => categoryNounApplicationPrompt(category, amount, "+"),
    subtract: ({ category, amount }) => categoryNounApplicationPrompt(category, amount, "-")
  }),
  sorting: Object.freeze({
    supports: supportsCategoryNounApplication,
    add: ({ category, amount }) => categoryNounApplicationPrompt(category, amount, "+"),
    subtract: ({ category, amount }) => categoryNounApplicationPrompt(category, amount, "-")
  }),
  observation: Object.freeze({
    supports: (topic) => ["sighting", "bug", "vehicle"].includes(topic.unitSingular),
    add: ({ category, amount }) => {
      const subject = amount === 1 ? singularCategoryLabel(category.label) : pluralCategoryLabel(category.label);
      return `${amount === 1 ? "One more" : "Two more"} ${subject} ${amount === 1 ? "was" : "were"} seen. How many ${pluralCategoryLabel(category.label)} were there now?`;
    },
    subtract: ({ category, amount }) => {
      const subject = amount === 1 ? singularCategoryLabel(category.label) : pluralCategoryLabel(category.label);
      return `${amount === 1 ? "One" : "Two"} ${subject} left. How many ${pluralCategoryLabel(category.label)} were still there?`;
    }
  }),
  experiment: Object.freeze({
    supports: () => true,
    add: ({ graphData, category, amount }) => {
      const words = quantityWords(amount, graphData.unitSingular, graphData.unitPlural);
      return `${words.amountWord} more ${words.unit} from the ${sentenceCategoryLabel(category.label)} group ${words.verb} tested. How many ${graphData.unitPlural} are there now?`;
    },
    subtract: ({ graphData, category, amount }) => {
      const words = quantityWords(amount, graphData.unitSingular, graphData.unitPlural);
      return `${words.amountWord} ${words.unit} ${words.verb} set aside from the ${sentenceCategoryLabel(category.label)} group. How many ${graphData.unitPlural} are left?`;
    }
  })
});

function supportsGraphApplicationTopic(topic) {
  const contract = GRAPH_APPLICATION_LANGUAGE[topic?.scenarioType];
  return Boolean(contract && contract.supports(topic));
}

function applicationPrompt(graphData, category, amount, operation) {
  const contract = GRAPH_APPLICATION_LANGUAGE[graphData.scenarioType];
  if (!contract || !contract.supports(graphData)) {
    throw new Error(`Grade 1 graph topic '${graphData.topicId}' does not support graph application questions.`);
  }
  const builder = operation === "+" ? contract.add : contract.subtract;
  return builder({ graphData, category, amount });
}

function buildGraphApplicationQuestions(graphData, random = Math.random) {
  const operations = shuffle(GRAPH_APPLICATION_OPERATIONS, random);
  const categories = shuffle(graphData.categories, random);

  return operations.map(({ operation, amount }, index) => {
    const category = categories[index];
    const answer = operation === "+" ? category.value + amount : category.value - amount;
    return {
      type: "equation",
      prompt: applicationPrompt(graphData, category, amount, operation),
      answer,
      responseMode: "graph_short_answer",
      responseType: "number",
      taskMode: "graph_application",
      operation,
      graphCategory: category.label,
      graphData,
      graphTaskData: {
        kind: "graph_application",
        eventType: graphData.scenarioType,
        baseValue: category.value,
        newFactAmount: amount,
        operation,
        result: answer
      },
      duplicateSignature: `grade1_data:${graphData.topicId}:graph_application:${category.label}:${operation}${amount}`
    };
  });
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
  if (task === "match_graph") {
    const matchIndex = generatorState.grade1GraphMatchIndex || 0;
    const topic = selectGraphTopic({
      worksheetSeed: `${options.worksheetSeed || "yellowbird-default"}:match:${matchIndex}`,
      graphTopicId: matchIndex === 0 ? options.graphTopicId : null,
      selectionState: generatorState.grade1GraphTopicSelection
    });
    generatorState.grade1GraphMatchIndex = matchIndex + 1;
    return buildMatchGraphProblem(buildGraphData(topic, options.random || Math.random), options.random || Math.random);
  }

  if (!generatorState.grade1DataGraphs[task]) {
    const topic = selectGraphTopic({
      worksheetSeed: options.worksheetSeed,
      graphTopicId: options.graphTopicId,
      topics: task === "graph_application"
        ? GRADE1_GRAPH_TOPICS.filter(supportsGraphApplicationTopic)
        : undefined,
      selectionState: generatorState.grade1GraphTopicSelection
    });
    if (task === "graph_application" && !supportsGraphApplicationTopic(topic)) {
      throw new Error(`Grade 1 graph topic '${topic.id}' does not support graph application questions.`);
    }
    const graphData = buildGraphData(topic, options.random || Math.random);
    const questions = task === "read"
      ? buildReadQuestions(graphData)
      : task === "interpret"
        ? buildInterpretQuestions(graphData)
        : task === "mixed"
          ? buildMixedQuestions(graphData)
          : task === "complete_graph"
            ? [buildCompleteGraphProblem(graphData, options.random || Math.random)]
            : buildGraphApplicationQuestions(graphData, options.random || Math.random);
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
  GRAPH_APPLICATION_OPERATIONS,
  GRAPH_APPLICATION_LANGUAGE,
  categoryNounApplicationPrompt,
  stableHash,
  rankGraphTopics,
  selectGraphTopic,
  buildGraphData,
  buildReadQuestions,
  buildInterpretQuestions,
  buildMixedQuestions,
  buildCompleteGraphProblem,
  buildMatchGraphProblem,
  buildGraphApplicationQuestions,
  supportsGraphApplicationTopic,
  isGrade1DataGraphWorksheet,
  generateGrade1DataGraphProblem
};
