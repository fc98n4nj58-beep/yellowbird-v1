const { nextMultiplicationModelFactorPair } = require("./multiplicationModelFactors");

function generateArrayProblem(options = {}) {
  const pair = nextMultiplicationModelFactorPair(options, "array");
  const rows = pair.factorA;
  const cols = pair.factorB;
  const total = pair.product;

  return {
    type: "equation",
    prompt: "",
    answer: total,
    responseMode: "multiplication_sentence",
    responseValues: [rows, cols, total],
    a: rows,
    b: cols,
    op: "*",
    product: total,
    modelKey: pair.duplicateKey,
    orientation: pair.orientation,
    visual: {
      kind: "array",
      data: {
        rows,
        cols,
        factorA: rows,
        factorB: cols,
        product: total,
        orientation: pair.orientation
      }
    }
  };
}

module.exports = generateArrayProblem;
