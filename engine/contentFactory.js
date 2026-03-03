const additionBasic = require("./modes/math-addition-basic");
const subtractionNonnegative = require("./modes/math-subtraction-nonnegative");
const multiplicationBasic = require("./modes/math-multiplication-basic");
const divisionInteger = require("./modes/math-division-integer");

const MODE_REGISTRY = {
  "math.addition.basic": additionBasic,
  "math.subtraction.nonnegative": subtractionNonnegative,
  "math.multiplication.basic": multiplicationBasic,
  "math.division.integer": divisionInteger,
};

function getMode(modeId) {
  const mode = MODE_REGISTRY[modeId];
  if (!mode) {
    const available = Object.keys(MODE_REGISTRY);
    const err = new Error(`Unknown mode: ${modeId}. Available: ${available.join(", ")}`);
    err.status = 400;
    throw err;
  }
  return mode;
}

/**
 * Returns a subject-agnostic CONTENT OBJECT.
 * Renderers (PDF/web/etc.) consume this object.
 */
function createContent({ modeId, params }) {
  const mode = getMode(modeId);

  // Allow either:
  // 1) module.exports = { generate }
  // 2) module.exports = generate
  if (typeof mode === "function") {
    return mode(params);
  }
  if (mode && typeof mode.generate === "function") {
    return mode.generate(params);
  }

  const err = new Error(`Mode "${modeId}" is loaded but has no generate() function.`);
  err.status = 500;
  throw err;
}

module.exports = { createContent, MODE_REGISTRY };