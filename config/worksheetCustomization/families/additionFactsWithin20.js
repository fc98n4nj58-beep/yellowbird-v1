const ADDITION_FACTS_RESOURCE_ID = "g1_addition_facts_within_20";

function adaptAdditionFactsOptions(normalizedOptions = {}) {
  const minimumValue = normalizedOptions.minimumValue;
  const maximumValue = normalizedOptions.maximumValue;
  const selectedValues = Array.isArray(normalizedOptions.selectedValues)
    ? normalizedOptions.selectedValues
    : [];

  const generatorOptions = {
    questionCount: normalizedOptions.questionCount,
    questionsPerPage: normalizedOptions.questionsPerPage,
    includeExample: normalizedOptions.includeExample,
    worksheetSeed: normalizedOptions.worksheetSeed,
    minA: minimumValue,
    minB: minimumValue,
    maxA: maximumValue,
    maxB: maximumValue,
    maxTotal: maximumValue
  };

  if (selectedValues.length) {
    generatorOptions.selectedNumbers = selectedValues;
    generatorOptions.onlyNumbers = selectedValues.join(",");
  }

  return generatorOptions;
}

const additionFactsWithin20 = Object.freeze({
  id: "additionFactsWithin20",
  label: "Addition Facts Within 20",
  resourceIds: [ADDITION_FACTS_RESOURCE_ID],
  activityTypes: ["math.addition.basic"],
  status: "foundation",
  defaults: Object.freeze({
    questionCount: 60,
    questionsPerPage: 60,
    includeExample: false,
    includeAnswerKey: true,
    minimumValue: 0,
    maximumValue: 20,
    selectedValues: [],
    worksheetSeed: "yellowbird-default"
  }),
  controls: Object.freeze({
    questionCount: {
      min: 1,
      max: 180,
      integer: true,
      layoutRisk: "medium",
      publicStatus: "foundation_only"
    },
    questionsPerPage: {
      allowedValues: [60],
      integer: true,
      layoutRisk: "medium",
      publicStatus: "awaiting_pdf_proof"
    },
    includeExample: {
      layoutRisk: "medium",
      publicStatus: "foundation_only"
    },
    includeAnswerKey: {
      layoutRisk: "none",
      publicStatus: "foundation_only"
    },
    minimumValue: {
      min: 0,
      max: 50,
      integer: true,
      layoutRisk: "medium",
      publicStatus: "foundation_only"
    },
    maximumValue: {
      min: 0,
      max: 50,
      integer: true,
      layoutRisk: "medium",
      publicStatus: "foundation_only"
    },
    selectedValues: {
      min: 0,
      max: 50,
      layoutRisk: "low",
      publicStatus: "foundation_only",
      semantics: "emphasis"
    },
    worksheetSeed: {
      layoutRisk: "none",
      publicStatus: "internal"
    }
  }),
  aliases: Object.freeze({
    resource: Object.freeze({
      questionCount: ["questionCount"],
      questionsPerPage: ["questionsPerPage"],
      includeExample: ["includeExample"],
      includeAnswerKey: ["includeAnswerKey", "answers"],
      minimumValue: ["minimumValue"],
      maximumValue: ["maximumValue"],
      selectedValues: ["selectedValues"],
      worksheetSeed: ["worksheetSeed"]
    }),
    legacy: Object.freeze({
      includeExample: ["completedExample", "example"],
      minimumValue: ["minA"],
      maximumValue: ["maxA", "maxTotal"],
      selectedValues: ["selectedNumbers", "onlyNumbers"]
    })
  }),
  resources: Object.freeze({
    [ADDITION_FACTS_RESOURCE_ID]: Object.freeze({
      id: ADDITION_FACTS_RESOURCE_ID,
      title: "Addition Facts Within 20",
      suggestedRange: Object.freeze({ minimumValue: 0, maximumValue: 20 }),
      safeRange: Object.freeze({ minimumValue: 0, maximumValue: 50 }),
      defaults: Object.freeze({
        questionCount: 60,
        questionsPerPage: 60,
        includeExample: false,
        includeAnswerKey: true,
        minimumValue: 0,
        maximumValue: 20,
        selectedValues: [],
        worksheetSeed: "yellowbird-default"
      }),
      notices: Object.freeze({
        customRange: "Custom range selected"
      })
    })
  }),
  adapter: adaptAdditionFactsOptions,
  runtimeGaps: Object.freeze([
    "selectedValues is declared as emphasis groundwork; the active catalog fact-fluency generator does not yet prioritize selected values.",
    "The active catalog fact-fluency generator does not currently consume minA, maxA, minB, maxB, or maxTotal."
  ])
});

module.exports = {
  ADDITION_FACTS_RESOURCE_ID,
  additionFactsWithin20,
  adaptAdditionFactsOptions
};
