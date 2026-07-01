function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function simplifyPair(numerator, denominator, factor) {
  return {
    left: `${numerator}/${denominator}`,
    right: `${numerator * factor}/${denominator * factor}`
  };
}

function generateMatchEquivalentFractions(options = {}) {
  const random = options.random || Math.random;
  const bases = [
    [1, 2],
    [1, 3],
    [2, 3],
    [1, 4],
    [3, 4],
    [2, 5],
    [3, 5],
    [1, 6],
    [5, 6]
  ];

  const [n, d] = bases[randInt(0, bases.length - 1, random)];
  const factor = randInt(2, 4, random);
  const pair = simplifyPair(n, d, factor);

  return {
    type: "equation",
    prompt: `Match the equivalent fractions: ${pair.left} = ____`,
    answer: pair.right
  };
}

module.exports = generateMatchEquivalentFractions;
