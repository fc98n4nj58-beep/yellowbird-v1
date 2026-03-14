const generateBaseTenSvg = require("../visuals/baseTenSvg");

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateBaseTenBlocksProblem(options = {}) {
  const min = Number.isFinite(options.minA) ? options.minA : 10;
  const max = Number.isFinite(options.maxA) ? options.maxA : 999;

  const value = randInt(Math.max(0, min), Math.max(min, max));

  const hundreds = Math.floor(value / 100);
  const tens = Math.floor((value % 100) / 10);
  const ones = value % 10;

  const visual = generateBaseTenSvg({ hundreds, tens, ones });

  return {
    prompt: `Write the number shown by the base ten blocks.`,
    answer: value,
    visual
  };
}

module.exports = generateBaseTenBlocksProblem;