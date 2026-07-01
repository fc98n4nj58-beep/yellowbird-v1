function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function generateCompareFractions(options = {}) {
  const random = options.random || Math.random;
  const denominators = [3, 4, 5, 6, 8];

  const d = denominators[randInt(0, denominators.length - 1, random)];

  let a = randInt(1, d - 1, random);
  let b = randInt(1, d - 1, random);

  while (b === a) {
    b = randInt(1, d - 1, random);
  }

  const answer = a > b ? ">" : "<";

  return {
    type: "equation",
    prompt: `Compare: ${a}/${d} __ ${b}/${d}`,
    answer
  };
}

module.exports = generateCompareFractions;
