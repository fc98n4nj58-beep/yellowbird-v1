const generateTenFrameSvg = require("../visuals/tenFrameSvg");

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTenFrameProblem(options = {}) {
  const min = Number.isFinite(options.minA) ? options.minA : 0;
  const max = Number.isFinite(options.maxA) ? options.maxA : 10;

  const value = randInt(Math.max(0, min), Math.min(10, max));
  const visual = generateTenFrameSvg({ filled: value });

  return {
    prompt: "How many dots are shown in the ten frame?",
    answer: value,
    visual
  };
}

module.exports = generateTenFrameProblem;