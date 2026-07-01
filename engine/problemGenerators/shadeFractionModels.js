function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateShadeFractionModels(count = 8) {
  const items = [];
  const denominators = [2, 3, 4, 5, 6, 8];

  for (let i = 0; i < count; i++) {
    const denominator = denominators[randInt(0, denominators.length - 1)];
    const numerator = randInt(1, denominator - 1);

    items.push({
      id: `shade-fraction-${i + 1}`,
      type: "equation",
      prompt: `Shade ${numerator}/${denominator} of the model.`,
      answer: `${numerator}/${denominator}`
    });
  }

  return items;
}

module.exports = generateShadeFractionModels;