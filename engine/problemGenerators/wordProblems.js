function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const scenarios = [
  { singularContainer: "bag", pluralContainer: "bags", noun: "apples" },
  { singularContainer: "box", pluralContainer: "boxes", noun: "stickers" },
  { singularContainer: "table", pluralContainer: "tables", noun: "pencils" },
  { singularContainer: "shelf", pluralContainer: "shelves", noun: "books" },
  { singularContainer: "basket", pluralContainer: "baskets", noun: "cookies" },
  { singularContainer: "tray", pluralContainer: "trays", noun: "flowers" }
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateWordProblem() {
  const groups = randInt(2, 10);
  const perGroup = randInt(2, 10);
  const scenario = pickRandom(scenarios);

  return {
    type: "word_problems",
    prompt: `There are ${groups} ${scenario.pluralContainer}. Each ${scenario.singularContainer} has ${perGroup} ${scenario.noun}. How many ${scenario.noun} are there altogether?`,
    equation: `${groups} × ${perGroup} = ___`,
    answer: groups * perGroup,
    meta: {
      groups,
      perGroup,
      noun: scenario.noun,
      singularContainer: scenario.singularContainer,
      pluralContainer: scenario.pluralContainer
    }
  };
}

module.exports = generateWordProblem;