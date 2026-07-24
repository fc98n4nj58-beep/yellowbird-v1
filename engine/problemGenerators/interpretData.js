const {
  isGrade1DataGraphWorksheet,
  generateGrade1DataGraphProblem
} = require("./grade1DataGraph");
const {
  isGrade2PictographReadingWorksheet,
  generateGrade2DataGraphProblem
} = require("./grade2DataGraph");

const GRADE5_TEXT_DATA_INTERPRETATION_ID = "g5_interpret_graphs";
const GRADE5_TEXT_DATASET = Object.freeze({
  datasetId: "grade5_text_data:sport_choices",
  title: "Student Sport Choices",
  context: "A data set records how many students chose each sport.",
  categories: Object.freeze([
    Object.freeze({ id: "soccer", label: "Soccer", value: 12 }),
    Object.freeze({ id: "basketball", label: "Basketball", value: 9 }),
    Object.freeze({ id: "baseball", label: "Baseball", value: 6 })
  ])
});
const GRADE5_TEXT_DATA_MAXIMUM_QUESTION_COUNT = 17;
const GRADE5_TEXT_DATA_DEFAULT_DISTRIBUTION = Object.freeze({
  category_identification: 2,
  difference: 3,
  combined_total: 3,
  ordering: 2,
  true_false: 2
});

function grade5TextDataGraphData() {
  const categories = GRADE5_TEXT_DATASET.categories.map((category) => ({ ...category }));
  return {
    datasetId: GRADE5_TEXT_DATASET.datasetId,
    title: GRADE5_TEXT_DATASET.title,
    context: GRADE5_TEXT_DATASET.context,
    graphType: "text_data",
    modelType: "text_described_quantities",
    categories,
    values: categories.map((category) => category.value),
    totalValue: categories.reduce((sum, category) => sum + category.value, 0),
    maximumCategory: "Soccer",
    minimumCategory: "Baseball"
  };
}

function question({
  id,
  group,
  prompt,
  answer,
  responseType,
  responseTarget,
  categoryIds = [],
  acceptedAnswerVariants = [],
  truth = {}
}) {
  return Object.freeze({
    id,
    group,
    prompt,
    answer,
    responseType,
    responseTarget,
    categoryIds: Object.freeze([...categoryIds]),
    acceptedAnswerVariants: Object.freeze([...acceptedAnswerVariants]),
    truth: Object.freeze(JSON.parse(JSON.stringify(truth)))
  });
}

const GRADE5_TEXT_DATA_QUESTION_BANK = Object.freeze([
  question({
    id: "maximum_category",
    group: "category_identification",
    prompt: "Which sport was chosen by the most students?",
    answer: "Soccer",
    responseType: "category",
    responseTarget: "category_name",
    categoryIds: ["soccer"],
    acceptedAnswerVariants: ["Soccer", "soccer"],
    truth: { selectedCategoryId: "soccer", selectedCategoryLabel: "Soccer", selectedValue: 12 }
  }),
  question({
    id: "minimum_category",
    group: "category_identification",
    prompt: "Which sport was chosen by the fewest students?",
    answer: "Baseball",
    responseType: "category",
    responseTarget: "category_name",
    categoryIds: ["baseball"],
    acceptedAnswerVariants: ["Baseball", "baseball"],
    truth: { selectedCategoryId: "baseball", selectedCategoryLabel: "Baseball", selectedValue: 6 }
  }),
  question({
    id: "middle_value_category",
    group: "category_identification",
    prompt: "Which sport has the middle number of student choices?",
    answer: "Basketball",
    responseType: "category",
    responseTarget: "category_name",
    categoryIds: ["basketball"],
    acceptedAnswerVariants: ["Basketball", "basketball"],
    truth: { selectedCategoryId: "basketball", selectedCategoryLabel: "Basketball", selectedValue: 9 }
  }),
  question({
    id: "difference_soccer_basketball",
    group: "difference",
    prompt: "How many more students chose Soccer than Basketball?",
    answer: 3,
    responseType: "number",
    responseTarget: "number",
    categoryIds: ["soccer", "basketball"],
    acceptedAnswerVariants: [3, "3"],
    truth: {
      minuendCategory: { id: "soccer", label: "Soccer", value: 12 },
      subtrahendCategory: { id: "basketball", label: "Basketball", value: 9 },
      difference: 3
    }
  }),
  question({
    id: "difference_soccer_baseball",
    group: "difference",
    prompt: "How many more students chose Soccer than Baseball?",
    answer: 6,
    responseType: "number",
    responseTarget: "number",
    categoryIds: ["soccer", "baseball"],
    acceptedAnswerVariants: [6, "6"],
    truth: {
      minuendCategory: { id: "soccer", label: "Soccer", value: 12 },
      subtrahendCategory: { id: "baseball", label: "Baseball", value: 6 },
      difference: 6
    }
  }),
  question({
    id: "difference_basketball_baseball",
    group: "difference",
    prompt: "How many more students chose Basketball than Baseball?",
    answer: 3,
    responseType: "number",
    responseTarget: "number",
    categoryIds: ["basketball", "baseball"],
    acceptedAnswerVariants: [3, "3"],
    truth: {
      minuendCategory: { id: "basketball", label: "Basketball", value: 9 },
      subtrahendCategory: { id: "baseball", label: "Baseball", value: 6 },
      difference: 3
    }
  }),
  question({
    id: "difference_greatest_least",
    group: "difference",
    prompt: "What is the difference between the greatest and least numbers of choices?",
    answer: 6,
    responseType: "number",
    responseTarget: "number",
    categoryIds: ["soccer", "baseball"],
    acceptedAnswerVariants: [6, "6"],
    truth: {
      minuendCategory: { id: "soccer", label: "Soccer", value: 12 },
      subtrahendCategory: { id: "baseball", label: "Baseball", value: 6 },
      difference: 6,
      interpretation: "greatest_minus_least"
    }
  }),
  question({
    id: "total_responses",
    group: "combined_total",
    prompt: "How many student choices are recorded altogether?",
    answer: 27,
    responseType: "number",
    responseTarget: "number",
    categoryIds: ["soccer", "basketball", "baseball"],
    acceptedAnswerVariants: [27, "27"],
    truth: { componentValues: [12, 9, 6], total: 27 }
  }),
  question({
    id: "combined_soccer_basketball",
    group: "combined_total",
    prompt: "How many students chose Soccer and Basketball altogether?",
    answer: 21,
    responseType: "number",
    responseTarget: "number",
    categoryIds: ["soccer", "basketball"],
    acceptedAnswerVariants: [21, "21"],
    truth: { selectedCategoryIds: ["soccer", "basketball"], componentValues: [12, 9], total: 21 }
  }),
  question({
    id: "combined_soccer_baseball",
    group: "combined_total",
    prompt: "How many students chose Soccer and Baseball altogether?",
    answer: 18,
    responseType: "number",
    responseTarget: "number",
    categoryIds: ["soccer", "baseball"],
    acceptedAnswerVariants: [18, "18"],
    truth: { selectedCategoryIds: ["soccer", "baseball"], componentValues: [12, 6], total: 18 }
  }),
  question({
    id: "combined_basketball_baseball",
    group: "combined_total",
    prompt: "How many students chose Basketball and Baseball altogether?",
    answer: 15,
    responseType: "number",
    responseTarget: "number",
    categoryIds: ["basketball", "baseball"],
    acceptedAnswerVariants: [15, "15"],
    truth: { selectedCategoryIds: ["basketball", "baseball"], componentValues: [9, 6], total: 15 }
  }),
  question({
    id: "order_greatest_to_least",
    group: "ordering",
    prompt: "Write the sports in order from greatest to least.",
    answer: "Soccer, Basketball, Baseball",
    responseType: "ordering",
    responseTarget: "ordered_categories",
    categoryIds: ["soccer", "basketball", "baseball"],
    acceptedAnswerVariants: ["Soccer, Basketball, Baseball", "Soccer > Basketball > Baseball"],
    truth: {
      orderedCategoryIds: ["soccer", "basketball", "baseball"],
      orderedCategoryLabels: ["Soccer", "Basketball", "Baseball"],
      direction: "greatest_to_least"
    }
  }),
  question({
    id: "order_least_to_greatest",
    group: "ordering",
    prompt: "Write the sports in order from least to greatest.",
    answer: "Baseball, Basketball, Soccer",
    responseType: "ordering",
    responseTarget: "ordered_categories",
    categoryIds: ["baseball", "basketball", "soccer"],
    acceptedAnswerVariants: ["Baseball, Basketball, Soccer", "Baseball < Basketball < Soccer"],
    truth: {
      orderedCategoryIds: ["baseball", "basketball", "soccer"],
      orderedCategoryLabels: ["Baseball", "Basketball", "Soccer"],
      direction: "least_to_greatest"
    }
  }),
  question({
    id: "true_false_soccer_more_basketball",
    group: "true_false",
    prompt: "True or false: More students chose Soccer than Basketball.",
    answer: "True",
    responseType: "true_false",
    responseTarget: "true_false",
    categoryIds: ["soccer", "basketball"],
    acceptedAnswerVariants: ["True", "true", "T"],
    truth: {
      proposition: "soccer_more_than_basketball",
      propositionTruth: true,
      expectedBoolean: true,
      displayAnswer: "True"
    }
  }),
  question({
    id: "true_false_baseball_more_basketball",
    group: "true_false",
    prompt: "True or false: More students chose Baseball than Basketball.",
    answer: "False",
    responseType: "true_false",
    responseTarget: "true_false",
    categoryIds: ["baseball", "basketball"],
    acceptedAnswerVariants: ["False", "false", "F"],
    truth: {
      proposition: "baseball_more_than_basketball",
      propositionTruth: false,
      expectedBoolean: false,
      displayAnswer: "False"
    }
  }),
  question({
    id: "true_false_basketball_baseball_exceed_soccer",
    group: "true_false",
    prompt: "True or false: Basketball and Baseball together exceed Soccer.",
    answer: "True",
    responseType: "true_false",
    responseTarget: "true_false",
    categoryIds: ["basketball", "baseball", "soccer"],
    acceptedAnswerVariants: ["True", "true", "T"],
    truth: {
      proposition: "basketball_plus_baseball_exceeds_soccer",
      propositionTruth: true,
      expectedBoolean: true,
      displayAnswer: "True"
    }
  }),
  question({
    id: "true_false_soccer_equals_basketball_baseball",
    group: "true_false",
    prompt: "True or false: Soccer equals Basketball and Baseball combined.",
    answer: "False",
    responseType: "true_false",
    responseTarget: "true_false",
    categoryIds: ["soccer", "basketball", "baseball"],
    acceptedAnswerVariants: ["False", "false", "F"],
    truth: {
      proposition: "soccer_equals_basketball_plus_baseball",
      propositionTruth: false,
      expectedBoolean: false,
      displayAnswer: "False"
    }
  })
]);

function shuffle(items, random) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const selected = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[selected]] = [shuffled[selected], shuffled[index]];
  }
  return shuffled;
}

function buildDefaultQuestionSet(random, excludedIds = new Set()) {
  const available = GRADE5_TEXT_DATA_QUESTION_BANK.filter(
    (candidate) => !excludedIds.has(candidate.id)
  );
  const selected = [];
  Object.entries(GRADE5_TEXT_DATA_DEFAULT_DISTRIBUTION).forEach(([group, count]) => {
    const groupItems = available.filter((candidate) => candidate.group === group);
    if (group === "true_false") {
      const truthy = shuffle(
        groupItems.filter((candidate) => candidate.truth.expectedBoolean === true),
        random
      )[0];
      const falsy = shuffle(
        groupItems.filter((candidate) => candidate.truth.expectedBoolean === false),
        random
      )[0];
      selected.push(truthy, falsy);
      return;
    }
    selected.push(...shuffle(groupItems, random).slice(0, count));
  });
  return shuffle(selected, random);
}

function modeQuestionPool(mode) {
  if (mode === "difference") {
    return GRADE5_TEXT_DATA_QUESTION_BANK.filter((candidate) => candidate.group === "difference");
  }
  if (mode === "combined_total") {
    return GRADE5_TEXT_DATA_QUESTION_BANK.filter((candidate) => candidate.group === "combined_total");
  }
  if (mode === "ordering_true_false") {
    return GRADE5_TEXT_DATA_QUESTION_BANK.filter(
      (candidate) => ["ordering", "true_false"].includes(candidate.group)
    );
  }
  return [...GRADE5_TEXT_DATA_QUESTION_BANK];
}

function buildGrade5TextDataQueue(options, random) {
  const state = options.generatorState;
  if (!state || typeof state !== "object") {
    throw new Error("Grade 5 text-data interpretation requires isolated generator state.");
  }
  if (Array.isArray(state.grade5TextDataQueue)) return state.grade5TextDataQueue;

  const mode = options.textDataQuestionMode || "default";
  const studentQuestionCount = Number(options.studentQuestionCount ?? options.questionCount ?? 12);
  const includeExample = Boolean(options.includeExample);
  const example = GRADE5_TEXT_DATA_QUESTION_BANK.find(
    (candidate) => candidate.id === "maximum_category"
  );
  const excludedIds = new Set(includeExample ? [example.id] : []);
  let studentQuestions;

  if (mode === "default" && studentQuestionCount === 12) {
    studentQuestions = buildDefaultQuestionSet(random, excludedIds);
  } else {
    studentQuestions = shuffle(
      modeQuestionPool(mode).filter((candidate) => !excludedIds.has(candidate.id)),
      random
    ).slice(0, studentQuestionCount);
  }

  state.grade5TextDataQueue = includeExample
    ? [{ ...example, isExample: true }, ...studentQuestions]
    : studentQuestions.map((candidate) => ({ ...candidate, isExample: false }));
  return state.grade5TextDataQueue;
}

function buildGrade5TextDataProblem(options, random) {
  const queue = buildGrade5TextDataQueue(options, random);
  const questionDefinition = queue.shift();
  if (!questionDefinition) {
    throw new Error(
      `Grade 5 text-data interpretation exhausted its ${GRADE5_TEXT_DATA_MAXIMUM_QUESTION_COUNT}-question unique bank.`
    );
  }
  const graphData = grade5TextDataGraphData();
  const answerState = {
    kind: "grade5_text_data_answer",
    datasetId: graphData.datasetId,
    datasetTitle: graphData.title,
    questionType: questionDefinition.id,
    categoryIds: [...questionDefinition.categoryIds],
    categoryLabels: graphData.categories
      .filter((category) => questionDefinition.categoryIds.includes(category.id))
      .map((category) => category.label),
    categoryValues: graphData.categories
      .filter((category) => questionDefinition.categoryIds.includes(category.id))
      .map((category) => category.value),
    expectedAnswer: questionDefinition.answer,
    acceptedAnswerVariants: [...questionDefinition.acceptedAnswerVariants],
    ...JSON.parse(JSON.stringify(questionDefinition.truth))
  };
  const duplicateSignature = [
    "grade5_text_data",
    graphData.datasetId,
    questionDefinition.id,
    questionDefinition.categoryIds.join("+"),
    questionDefinition.truth.proposition || "",
    questionDefinition.responseTarget
  ].join(":");

  if (options.usedProblemKeys?.has(duplicateSignature)) {
    throw new Error(`Duplicate Grade 5 text-data task '${questionDefinition.id}'.`);
  }
  options.usedProblemKeys?.add(duplicateSignature);

  return {
    type: "equation",
    prompt: questionDefinition.prompt,
    answer: questionDefinition.answer,
    acceptedAnswerVariants: [...questionDefinition.acceptedAnswerVariants],
    responseMode: "data_short_answer",
    responseType: questionDefinition.responseType,
    responseTarget: questionDefinition.responseTarget,
    graphQuestionType: questionDefinition.id,
    graphCategory: questionDefinition.categoryIds.join(" / "),
    graphData,
    answerState,
    duplicateSignature,
    isExample: Boolean(questionDefinition.isExample)
  };
}

function generateInterpretDataProblem(options = {}) {
  if (isGrade1DataGraphWorksheet(options)) {
    return generateGrade1DataGraphProblem(options);
  }

  if (isGrade2PictographReadingWorksheet(options)) {
    return generateGrade2DataGraphProblem(options);
  }

  const legacyQuestions = [
    {
      prompt: "A graph shows Soccer = 12, Basketball = 9, Baseball = 6. Which sport is the most popular?",
      answer: "Soccer",
      questionType: "maximum_category",
      responseType: "category",
      categoryIds: ["soccer"]
    },
    {
      prompt: "A graph shows Soccer = 12, Basketball = 9, Baseball = 6. Which sport is the least popular?",
      answer: "Baseball",
      questionType: "minimum_category",
      responseType: "category",
      categoryIds: ["baseball"]
    },
    {
      prompt: "A graph shows Soccer = 12, Basketball = 9, Baseball = 6. How many more students chose Soccer than Basketball?",
      answer: 3,
      questionType: "difference",
      responseType: "number",
      categoryIds: ["soccer", "basketball"]
    }
  ];

  const isGrade5TextData = options.worksheetId === GRADE5_TEXT_DATA_INTERPRETATION_ID;
  const random = isGrade5TextData ? options.random : Math.random;
  if (isGrade5TextData && typeof random !== "function") {
    throw new Error("Grade 5 text-data interpretation requires injected seeded randomness.");
  }

  if (!isGrade5TextData) {
    const legacyQuestion = legacyQuestions[Math.floor(random() * legacyQuestions.length)];
    return {
      prompt: legacyQuestion.prompt,
      answer: legacyQuestion.answer
    };
  }
  return buildGrade5TextDataProblem(options, random);
}

module.exports = generateInterpretDataProblem;
module.exports.GRADE5_TEXT_DATA_MAXIMUM_QUESTION_COUNT =
  GRADE5_TEXT_DATA_MAXIMUM_QUESTION_COUNT;
