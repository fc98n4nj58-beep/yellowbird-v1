const { QUESTION_TEXT_SIZES } = require("../../layout/additionNumberLineLayout");
const ADDITION_NUMBER_LINE_RESOURCE_ID = "g1_addition_on_number_line_to_20";

const additionNumberLine = Object.freeze({
  id: "additionNumberLine",
  label: "Addition on a Number Line",
  resourceIds: [ADDITION_NUMBER_LINE_RESOURCE_ID],
  activityTypes: ["addition_number_line"],
  status: "pilot",
  exampleWithinQuestionTotal: true,
  preserveLegacyRuntime: true,
  defaults: Object.freeze({ questionCount: 6, questionTextSize: 12, includeExample: false, includeAnswerKey: true, worksheetSeed: "yellowbird-default" }),
  controls: Object.freeze({
    questionCount: { min: 1, max: 6, integer: true, publicStatus: "public_prototype" },
    questionTextSize: { allowedValues: QUESTION_TEXT_SIZES, integer: true, publicStatus: "public_prototype" },
    includeExample: { publicStatus: "public_prototype" },
    includeAnswerKey: { publicStatus: "public_prototype" },
    worksheetSeed: { publicStatus: "internal" }
  }),
  aliases: Object.freeze({ legacy: { includeExample: ["completedExample", "example"], includeAnswerKey: ["answers"] } }),
  resources: Object.freeze({ [ADDITION_NUMBER_LINE_RESOURCE_ID]: { id: ADDITION_NUMBER_LINE_RESOURCE_ID } }),
  adapter(options) {
    // Presentation never enters the generator or its random stream.
    return { questionCount: options.questionCount, includeExample: options.includeExample, worksheetSeed: options.worksheetSeed };
  }
});
module.exports = { ADDITION_NUMBER_LINE_RESOURCE_ID, additionNumberLine };
