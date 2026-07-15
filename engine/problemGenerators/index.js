// engine/problemGenerators/index.js //

const generateArrayProblem = require("./array");
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
const generateMultiplicationBasicProblem = require("./multiplicationBasic");
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
const generateAdditionNumberLineProblem = require("./additionNumberLine");

const generateShadeFractionModels = require("./shadeFractionModels");
const generateExtendPattern = require("./extendPattern");

const generateMatchEquivalentFractions = require("./matchEquivalentFractions");
const generateIdentifyPatternRule = require("./identifyPatternRule");

const generateFractionNumberLine = require("./fractionNumberLine");
const generateMissingValuePattern = require("./missingValuePattern");

const generateCompareFractions = require("./compareFractions");
const generateFunctionTable = require("./functionTable");
const { generateGrade1DataGraphProblem } = require("./grade1DataGraph");
const { generateGrade1FractionProblem } = require("./grade1Fractions");
const { generateGrade2ShadeEqualPartsProblem } = require("./grade2ShadeEqualParts");

function getGenerator(activityType) {
  const generators = {
    array: generateArrayProblem,
    arrays: generateArrayProblem,
    equal_groups: generateEqualGroupsProblem,
    skip_counting: generateSkipCountingProblem,
    missing_factor: generateMissingFactorProblem,
    word_problems: generateWordProblem,
    addition_word_problem: generateWordProblem.generateAdditionWordProblem,
    subtraction_word_problem: generateWordProblem.generateSubtractionWordProblem,
    missing_addend_word_problem: generateWordProblem.generateMissingAddendWordProblem,

    read_graph: generateReadGraphProblem,
    complete_graph: generateCompleteGraphProblem,
    match_graph: generateGrade1DataGraphProblem,
    graph_application: generateGrade1DataGraphProblem,
    grade1_fraction: generateGrade1FractionProblem,
    grade2_shade_equal_parts: generateGrade2ShadeEqualPartsProblem,
    match_data_to_graph: generateMatchDataToGraphProblem,
    graph_questions: generateGraphQuestionsProblem,
    interpret_data: generateInterpretDataProblem,

    fact_fluency: generateFactFluencyProblem,
    "math.multiplication.basic": generateMultiplicationBasicProblem,
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
    number_line_identify: generateNumberLineIdentifyProblem,
    addition_number_line: generateAdditionNumberLineProblem,
    shade_fraction_models: generateShadeFractionModels,
    extend_pattern: generateExtendPattern,
    match_equivalent_fractions: generateMatchEquivalentFractions,
    identify_pattern_rule: generateIdentifyPatternRule,
    fraction_number_line: generateFractionNumberLine,
    missing_value_pattern: generateMissingValuePattern,
    compare_fractions: generateCompareFractions,
    function_table: generateFunctionTable,

    extend_pattern: generateExtendPattern
  };

  return generators[activityType] || null;
}

module.exports = {
  getGenerator
};
