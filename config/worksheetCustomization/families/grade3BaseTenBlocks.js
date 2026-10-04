const RESOURCE_ID = "grade3_place_value_representation_base_ten_blocks";
const QUESTION_TEXT_SIZES = Object.freeze([12, 14, 16]);

function resolveGrade3BaseTenTitle(options = {}) {
  const minimumValue = Number(options.minimumValue);
  const maximumValue = Number(options.maximumValue);
  if (minimumValue === 100 && maximumValue === 499) return "Read Base Ten Blocks";
  return `Read Base Ten Blocks — ${minimumValue} to ${maximumValue}`;
}

function adaptGrade3BaseTenOptions(options = {}) {
  const selectedValues = Array.isArray(options.selectedValues) ? options.selectedValues : [];
  const placeValueBoxes = options.baseTenResponseMode === "hundreds_tens_ones";
  return {
    questionCount: options.questionCount,
    questionTextSize: options.questionTextSize,
    includeExample: options.includeExample,
    includeAnswerKey: options.includeAnswerKey,
    worksheetSeed: options.worksheetSeed,
    minA: options.minimumValue,
    maxA: options.maximumValue,
    ...(selectedValues.length ? {
      selectedNumbers: selectedValues,
      selectedValues,
      onlyNumbers: selectedValues.join(",")
    } : {}),
    baseTenResponseMode: options.baseTenResponseMode,
    responseMode: placeValueBoxes ? "hundreds_tens_ones" : "standard_number",
    showPlaceValueLabels: placeValueBoxes,
    baseTenPlaceValueBoxes: placeValueBoxes
  };
}

const grade3BaseTenBlocks = Object.freeze({
  id: "grade3BaseTenBlocks",
  label: "Read Base Ten Blocks",
  resourceIds: [RESOURCE_ID],
  activityTypes: ["base_ten_blocks"],
  status: "pilot",
  preserveLegacyRuntime: true,
  defaults: Object.freeze({ questionCount: 8, questionTextSize: 12, minimumValue: 100, maximumValue: 499, selectedValues: [], baseTenResponseMode: "standard_number", includeExample: false, includeAnswerKey: true, worksheetSeed: "yellowbird-default" }),
  controls: Object.freeze({
    questionCount: { min: 1, max: 8, integer: true, publicStatus: "public_prototype" },
    questionTextSize: { allowedValues: QUESTION_TEXT_SIZES, integer: true, publicStatus: "public_prototype" },
    minimumValue: { min: 100, max: 499, integer: true, strictInput: true, rejectAliasConflicts: true, publicStatus: "public_prototype" },
    maximumValue: { min: 100, max: 499, integer: true, strictInput: true, rejectAliasConflicts: true, publicStatus: "public_prototype" },
    selectedValues: { min: 100, max: 499, publicStatus: "public_prototype", semantics: "exact" },
    baseTenResponseMode: { strictInput: true, allowedValues: ["standard_number", "hundreds_tens_ones"], publicStatus: "public_prototype" },
    includeExample: { publicStatus: "public_prototype" },
    includeAnswerKey: { publicStatus: "public_prototype" },
    worksheetSeed: { publicStatus: "internal" }
  }),
  aliases: Object.freeze({ legacy: {
    minimumValue: ["minA", "minimumNumber"], maximumValue: ["maxA", "maximumNumber"], selectedValues: ["selectedNumbers", "onlyNumbers"],
    baseTenResponseMode: ["responseMode"], includeExample: ["completedExample", "example"], includeAnswerKey: ["answers"]
  } }),
  resources: Object.freeze({ [RESOURCE_ID]: Object.freeze({
    id: RESOURCE_ID,
    suggestedRange: Object.freeze({ minimumValue: 100, maximumValue: 499 }),
    safeRange: Object.freeze({ minimumValue: 100, maximumValue: 499 }),
    notices: Object.freeze({ customRange: "Custom Grade 3 Base Ten range selected." })
  }) }),
  adapter: adaptGrade3BaseTenOptions
});

module.exports = { RESOURCE_ID, grade3BaseTenBlocks, adaptGrade3BaseTenOptions, resolveGrade3BaseTenTitle };
