function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function generateFactFamilyProblem(options = {}) {
  const random = options.random || Math.random;
  const {
    minA = 0,
    maxA = 10,
    minB = 0,
    maxB = 10
  } = options;

  let a = randInt(minA, maxA, random);
  let b = randInt(minB, maxB, random);
  const sum = a + b;

  return {
    prompt: `Fact family: ${a} + ${b} = __, ${b} + ${a} = __, ${sum} - ${a} = __, ${sum} - ${b} = __`,
    answer: `${sum}, ${sum}, ${b}, ${a}`
  };
}

module.exports = generateFactFamilyProblem;
