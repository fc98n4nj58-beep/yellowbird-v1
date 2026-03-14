const generateArrayProblem = require("./arrays");
const generateEqualGroupsProblem = require("./equalGroups");
const generateSkipCountingProblem = require("./skipCounting");
const generateMissingFactorProblem = require("./missingFactor");
const generateWordProblem = require("./wordProblems");

const generateReadGraphProblem = require("./readGraph");
const generateCompleteGraphProblem = require("./completeGraph");
const generateMatchDataToGraphProblem = require("./matchDataToGraph");
const generateGraphQuestionsProblem = require("./graphQuestions");
const generateInterpretDataProblem = require("./interpretData");
const generateFactFluencyProblem = require("./factFluency");
const generateMissingAddendProblem = require("./missingAddend");
const generateRelatedSubtractionProblem = require("./relatedSubtraction");
const generateEquationMatchProblem = require("./equationMatch");
const generateFactFamilyProblem = require("./factFamily");
const generateBaseTenBlocksProblem = require("./baseTenBlocks");
const generateExpandedFormProblem = require("./expandedForm");
const generateStandardFormProblem = require("./standardForm");
const generateCompareNumbersProblem = require("./compareNumbers");
const generateNumberWordMatchProblem = require("./numberWordMatch");
const generateTenFrameProblem = require("./tenFrame");
const generateNumberLineIdentifyProblem = require("./numberLineIdentify");

function getGenerator(activityType) {
 const generators = {
  arrays: generateArrayProblem,
  equal_groups: generateEqualGroupsProblem,
  skip_counting: generateSkipCountingProblem,
  missing_factor: generateMissingFactorProblem,
  word_problems: generateWordProblem,
  read_graph: generateReadGraphProblem,
  complete_graph: generateCompleteGraphProblem,
  match_data_to_graph: generateMatchDataToGraphProblem,
  graph_questions: generateGraphQuestionsProblem,
  interpret_data: generateInterpretDataProblem,
  fact_fluency: generateFactFluencyProblem,
  missing_addend: generateMissingAddendProblem,
  related_subtraction: generateRelatedSubtractionProblem,
  equation_match: generateEquationMatchProblem,
  fact_family: generateFactFamilyProblem,
  base_ten_blocks: generateBaseTenBlocksProblem,
  expanded_form: generateExpandedFormProblem,
  standard_form: generateStandardFormProblem,
  compare_numbers: generateCompareNumbersProblem,
  number_word_match: generateNumberWordMatchProblem,
  ten_frame: generateTenFrameProblem,
  number_line_identify: generateNumberLineIdentifyProblem
};

  return generators[activityType] || null;
}

module.exports = {
  getGenerator
};