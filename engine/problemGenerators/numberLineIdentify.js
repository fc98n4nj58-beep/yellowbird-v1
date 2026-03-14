const generateNumberLineSvg = require("../visuals/numberLineSvg");

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateNumberLineIdentifyProblem(options = {}) {
  const min = Number.isFinite(options.minA) ? options.minA : 0;
  const max = Number.isFinite(options.maxA) ? options.maxA : 10;

  const start = Math.max(0, min);
  const end = Math.max(start + 5, Math.min(max, start + 10));
  const value = randInt(start, end);

  const visual = generateNumberLineSvg({
    start,
    end,
    highlight: value
  });

  return {
    prompt: "What number is marked on the number line?",
    answer: value,
    visual
  };
}

module.exports = generateNumberLineIdentifyProblem;