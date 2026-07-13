const {
  buildNumericPatternProblem
} = require("./numericPatternRules");

function generateExtendPattern(options = {}) {
  return buildNumericPatternProblem("extend_pattern", options);
}

module.exports = generateExtendPattern;
