const generateArrayProblem = require("./arrays");
const generateEqualGroupsProblem = require("./equalGroups");
const generateSkipCountingProblem = require("./skipCounting");
const generateMissingFactorProblem = require("./missingFactor");
const generateWordProblem = require("./wordProblems");

function getGenerator(activityType) {
  const generators = {
    arrays: generateArrayProblem,
    equal_groups: generateEqualGroupsProblem,
    skip_counting: generateSkipCountingProblem,
    missing_factor: generateMissingFactorProblem,
    word_problems: generateWordProblem
  };

  return generators[activityType] || null;
}

module.exports = {
  getGenerator
};