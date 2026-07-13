const {
  buildNumericPatternProblem
} = require("./numericPatternRules");

function generateMissingValuePattern(options = {}) {
  return buildNumericPatternProblem("missing_value_pattern", options);
}

module.exports = generateMissingValuePattern;
