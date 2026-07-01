function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function generateFunctionTable(options = {}) {
  const random = options.random || Math.random;
  const rule = randInt(1, 5, random);
  const input = randInt(1, 12, random);
  const output = input + rule;

  return {
    type: "equation",
    prompt: `Function table: input ${input}, rule +${rule}, output = __`,
    answer: String(output)
  };
}

module.exports = generateFunctionTable;
