const {
  buildNumericPatternProblem
} = require("./numericPatternRules");

function generateFunctionTable(options = {}) {
  return buildNumericPatternProblem("function_table", options);
}

module.exports = generateFunctionTable;
