function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function generateFactFamilyProblem(options = {}) {
  const random = options.random || Math.random;
  const usedProblemKeys = options.usedProblemKeys || new Set();
  const operation = options.operation || options.factFamilyOperation || "addition_subtraction";
  const factFamilyMode = String(options.factFamilyMode || options.mode || "all").toLowerCase();
  const {
    minA = 0,
    maxA = 10,
    minB = 0,
    maxB = 10
  } = options;
  let fallbackProblem = null;

  for (let attempt = 0; attempt < 80; attempt++) {
    let a = randInt(minA, maxA, random);
    let b = randInt(minB, maxB, random);

    if (operation === "multiplication_division") {
      a = Math.max(1, a);
      b = Math.max(1, b);
      const product = a * b;
      const low = Math.min(a, b);
      const high = Math.max(a, b);
      const key = `${operation}:${low}:${high}`;
      const problem = {
        prompt: `${a} x ${b} = __\n${b} x ${a} = __\n${product} / ${a} = __\n${product} / ${b} = __`,
        answer: `${product}, ${product}, ${b}, ${a}`
      };

      fallbackProblem = problem;

      if (!usedProblemKeys.has(key)) {
        usedProblemKeys.add(key);
        return problem;
      }

      continue;
    }

    const sum = a + b;
    const low = Math.min(a, b);
    const high = Math.max(a, b);
    const key = `${operation}:${factFamilyMode}:${low}:${high}`;
    let problem;

    if (factFamilyMode === "addition_only" || factFamilyMode === "addition-only") {
      problem = {
        prompt: `${a} + ${b} = __\n${b} + ${a} = __`,
        answer: `${sum}, ${sum}`
      };
    } else if (factFamilyMode === "subtraction_only" || factFamilyMode === "subtraction-only") {
      problem = {
        prompt: `${sum} - ${a} = __\n${sum} - ${b} = __`,
        answer: `${b}, ${a}`
      };
    } else {
      problem = {
        prompt: `${a} + ${b} = __\n${b} + ${a} = __\n${sum} - ${a} = __\n${sum} - ${b} = __`,
        answer: `${sum}, ${sum}, ${b}, ${a}`
      };
    }

    fallbackProblem = problem;

    if (!usedProblemKeys.has(key)) {
      usedProblemKeys.add(key);
      return problem;
    }
  }

  return fallbackProblem;
}

module.exports = generateFactFamilyProblem;
