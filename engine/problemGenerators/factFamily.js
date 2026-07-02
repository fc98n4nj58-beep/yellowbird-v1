function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function generateFactFamilyProblem(options = {}) {
  const random = options.random || Math.random;
  const operation = options.operation || options.factFamilyOperation || "addition_subtraction";
  const {
    minA = 0,
    maxA = 10,
    minB = 0,
    maxB = 10
  } = options;

  let a = randInt(minA, maxA, random);
  let b = randInt(minB, maxB, random);

  if (operation === "multiplication_division") {
    a = Math.max(1, a);
    b = Math.max(1, b);
    const product = a * b;

    return {
      prompt: `Fact family: ${a} x ${b} = __, ${b} x ${a} = __, ${product} / ${a} = __, ${product} / ${b} = __`,
      answer: `${product}, ${product}, ${b}, ${a}`
    };
  }

  const sum = a + b;

  return {
    prompt: `Fact family: ${a} + ${b} = __, ${b} + ${a} = __, ${sum} - ${a} = __, ${sum} - ${b} = __`,
    answer: `${sum}, ${sum}, ${b}, ${a}`
  };
}

module.exports = generateFactFamilyProblem;
