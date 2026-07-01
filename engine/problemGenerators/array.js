function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function generateArrayProblem(options = {}) {
const random = options.random || Math.random;
const minRows = Number.isFinite(options.minRows) ? options.minRows : 2;
const maxRows = Number.isFinite(options.maxRows) ? options.maxRows : 5;
const minCols = Number.isFinite(options.minCols) ? options.minCols : 2;
const maxCols = Number.isFinite(options.maxCols) ? options.maxCols : 5;

  const rows = randInt(minRows, maxRows, random);
  const cols = randInt(minCols, maxCols, random);
  const total = rows * cols;

  return {
    type: "equation",
    prompt: "How many dots are in the array?",
    answer: total,
    visual: {
      kind: "array",
      data: {
        rows,
        cols
      }
    }
  };
}

module.exports = generateArrayProblem;
