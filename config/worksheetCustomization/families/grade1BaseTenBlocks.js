const BASE_TEN_RESOURCE_ID = "grade1_place_value_representation_base_ten_blocks";
const QUESTION_TEXT_SIZES = Object.freeze([12, 14, 16]);

function resolveGrade1BaseTenTitle(options = {}) {
  const minimumValue = Number(options.minimumValue);
  const maximumValue = Number(options.maximumValue);
  if (minimumValue === 0 && maximumValue === 50) return "Base Ten Blocks to 50 — Grade 1";
  return minimumValue === 0
    ? `Base Ten Blocks to ${maximumValue}`
    : `Base Ten Blocks Between ${minimumValue} and ${maximumValue}`;
}

function adaptGrade1BaseTenOptions(options = {}) {
  const selectedValues = Array.isArray(options.selectedValues) ? options.selectedValues : [];
  return {
    questionCount: options.questionCount,
    includeExample: options.includeExample,
    worksheetSeed: options.worksheetSeed,
    minA: options.minimumValue,
    maxA: options.maximumValue,
    selectedValues,
    selectedNumbers: selectedValues,
    onlyNumbers: selectedValues.join(","),
    responseMode: options.baseTenResponseMode,
    showPlaceValueLabels: options.baseTenResponseMode === "tens_ones",
    baseTenTensOnesBoxes: options.baseTenResponseMode === "tens_ones"
  };
}

const grade1BaseTenBlocks = Object.freeze({
  id: "grade1BaseTenBlocks",
  label: "Base Ten Blocks to 50",
  resourceIds: [BASE_TEN_RESOURCE_ID],
  activityTypes: ["base_ten_blocks"],
  status: "pilot",
  preserveLegacyRuntime: true,
  defaults: Object.freeze({ questionCount: 10, questionTextSize: 12, minimumValue: 0, maximumValue: 50, selectedValues: [], baseTenResponseMode: "standard_number", includeExample: false, includeAnswerKey: true, worksheetSeed: "yellowbird-default" }),
  controls: Object.freeze({
    questionCount: { min: 1, max: 10, integer: true, publicStatus: "public_prototype" },
    questionTextSize: { allowedValues: QUESTION_TEXT_SIZES, integer: true, publicStatus: "public_prototype" },
    minimumValue: { min: 0, max: 100, integer: true, strictInput: true, rejectAliasConflicts: true, publicStatus: "public_prototype" },
    maximumValue: { min: 0, max: 100, integer: true, strictInput: true, rejectAliasConflicts: true, publicStatus: "public_prototype" },
    selectedValues: { min: 0, max: 100, publicStatus: "public_prototype", semantics: "emphasis" },
    baseTenResponseMode: { strictInput: true, allowedValues: ["standard_number", "tens_ones"], publicStatus: "public_prototype" },
    includeExample: { publicStatus: "public_prototype" },
    includeAnswerKey: { publicStatus: "public_prototype" },
    worksheetSeed: { publicStatus: "internal" }
  }),
  aliases: Object.freeze({ legacy: {
    minimumValue: ["minA", "minimumNumber"], maximumValue: ["maxA", "maximumNumber"], selectedValues: ["selectedNumbers", "onlyNumbers"],
    baseTenResponseMode: ["responseMode"], includeExample: ["completedExample", "example"], includeAnswerKey: ["answers"]
  } }),
  resources: Object.freeze({ [BASE_TEN_RESOURCE_ID]: Object.freeze({
    id: BASE_TEN_RESOURCE_ID, suggestedRange: Object.freeze({ minimumValue: 0, maximumValue: 50 }), safeRange: Object.freeze({ minimumValue: 0, maximumValue: 100 }),
    notices: Object.freeze({ customRange: "Custom range selected. Check that this range suits your students; the default framing is Base Ten Blocks to 50." })
  }) }),
  adapter: adaptGrade1BaseTenOptions
});

module.exports = { BASE_TEN_RESOURCE_ID, grade1BaseTenBlocks, adaptGrade1BaseTenOptions, resolveGrade1BaseTenTitle };
