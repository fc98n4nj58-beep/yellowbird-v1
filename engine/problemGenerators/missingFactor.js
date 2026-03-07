function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMissingFactorProblem() {
  const a = randInt(2, 10);
  const b = randInt(2, 10);
  const product = a * b;

  const hideFirst = Math.random() < 0.5;

  return {
    type: "missing_factor",
    prompt: hideFirst
      ? `___ × ${b} = ${product}`
      : `${a} × ___ = ${product}`,
    equation: hideFirst
      ? `___ × ${b} = ${product}`
      : `${a} × ___ = ${product}`,
    answer: hideFirst ? a : b,
    meta: {
      a,
      b,
      product,
      hideFirst
    }
  };
}

module.exports = generateMissingFactorProblem;