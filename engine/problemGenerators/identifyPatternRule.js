const {
  buildNumericPatternProblem
} = require("./numericPatternRules");

function generateIdentifyPatternRule(options = {}) {
  return buildNumericPatternProblem("identify_pattern_rule", options);
}

module.exports = generateIdentifyPatternRule;
