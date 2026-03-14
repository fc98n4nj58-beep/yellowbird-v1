function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCompareNumbersProblem(options = {}) {
  const min = Number.isFinite(options.minA) ? options.minA : 0;
  const max = Number.isFinite(options.maxA) ? options.maxA : 999;

  const a = randInt(min, max);
  const b = randInt(min, max);

  let answer = "=";
  if (a > b) answer = ">";
  if (a < b) answer = "<";

  return {
    prompt: `Compare the numbers: ${a} __ ${b}`,
    answer
  };
}

module.exports = generateCompareNumbersProblem;