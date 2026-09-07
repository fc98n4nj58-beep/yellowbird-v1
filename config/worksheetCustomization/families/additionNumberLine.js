const { QUESTION_TEXT_SIZES } = require("../../layout/additionNumberLineLayout");
const RANGE_LIMITS = Object.freeze({ minimumValue: 0, maximumValue: 100, minimumSpan: 1, maximumSpan: 40 });
const ADDITION_NUMBER_LINE_RESOURCE_ID = "g1_addition_on_number_line_to_20";

const additionNumberLine = Object.freeze({
  id: "additionNumberLine",
  label: "Addition on a Number Line",
  resourceIds: [ADDITION_NUMBER_LINE_RESOURCE_ID],
  activityTypes: ["addition_number_line"],
  status: "pilot",
  exampleWithinQuestionTotal: true,
  preserveLegacyRuntime: true,
  range: Object.freeze({ kind: "linkedNumberLine", ...RANGE_LIMITS }),
  defaults: Object.freeze({ questionCount: 6, questionTextSize: 12, minimumValue: 0, maximumValue: 20, numberLineArrows: "shown", includeExample: false, includeAnswerKey: true, worksheetSeed: "yellowbird-default" }),
  controls: Object.freeze({
    questionCount: { min: 1, max: 6, integer: true, publicStatus: "public_prototype" },
    questionTextSize: { allowedValues: QUESTION_TEXT_SIZES, integer: true, publicStatus: "public_prototype" },
    minimumValue: { label: "From", min: 0, max: RANGE_LIMITS.maximumValue, strictInput: true, rejectAliasConflicts: true, publicStatus: "public_prototype" },
    maximumValue: { label: "To", min: 0, max: RANGE_LIMITS.maximumValue, strictInput: true, rejectAliasConflicts: true, publicStatus: "public_prototype" },
    numberLineArrows: { strictInput: true, allowedValues: ["shown", "student_drawn"], publicStatus: "public_prototype" },
    includeExample: { publicStatus: "public_prototype" },
    includeAnswerKey: { publicStatus: "public_prototype" },
    worksheetSeed: { publicStatus: "internal" }
  }),
  aliases: Object.freeze({ legacy: { minimumValue: ["minStart", "minA"], maximumValue: ["maxTotal", "numberLineMaximum"], includeExample: ["completedExample", "example"], includeAnswerKey: ["answers"] } }),
  resources: Object.freeze({ [ADDITION_NUMBER_LINE_RESOURCE_ID]: { id: ADDITION_NUMBER_LINE_RESOURCE_ID, suggestedRange: { minimumValue: 0, maximumValue: 20 }, safeRange: RANGE_LIMITS, notices: { customRange: "Custom number-line range. Check that this range suits your students; the default curriculum alignment is for 0–20." } } }),
  adapter(options) {
    // Keep the accepted default pool/order exactly. Custom bounds use this same
    // pool builder with eligible starts and the established positive jumps 1–10.
    const min = options.minimumValue, max = options.maximumValue;
    return {
      questionCount: options.questionCount, includeExample: options.includeExample, worksheetSeed: options.worksheetSeed,
      minStart: min, maxStart: min === 0 && max === 20 ? 10 : max - 1,
      minJump: 1, maxJump: 10, maxTotal: max,
      numberLineMinimum: min, numberLineMaximum: max
    };
  }
});
module.exports = { ADDITION_NUMBER_LINE_RESOURCE_ID, additionNumberLine };
