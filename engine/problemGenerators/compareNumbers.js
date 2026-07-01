function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function generateCompareNumbersProblem(options = {}) {
  const random = options.random || Math.random;
  const min = Number.isFinite(options.minA) ? options.minA : 0;
  const max = Number.isFinite(options.maxA) ? options.maxA : 999;

  const a = randInt(min, max, random);
  const b = randInt(min, max, random);

  let answer = "=";
  if (a > b) answer = ">";
  if (a < b) answer = "<";

  return {
    prompt: `Compare the numbers: ${a} __ ${b}`,
    answer
  };
}

module.exports = generateCompareNumbersProblem;
