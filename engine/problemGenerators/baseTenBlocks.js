const {
  generateBaseTenProblem
} = require("./grade1NumberRepresentation");

function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function generateBaseTenBlocksProblem(options = {}) {
  if (options.worksheetId === "grade1_place_value_representation_base_ten_blocks") {
    return generateBaseTenProblem(options);
  }

  const random = options.random || Math.random;
  const min = Number.isFinite(options.minA) ? options.minA : 10;
  const max = Number.isFinite(options.maxA) ? options.maxA : 99;

  const value = randInt(Math.max(0, min), Math.max(min, max), random);
  const tens = Math.floor(value / 10);
  const ones = value % 10;

  return {
    type: "equation",
    prompt: "What number is shown by the base ten blocks?",
    answer: value,
    visual: {
      kind: "base_ten_blocks",
      data: {
        value,
        tens,
        ones
      }
    }
  };
}

module.exports = generateBaseTenBlocksProblem;
