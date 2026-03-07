const RECIPES = {
  "B1.1": {
    mode: "number-representation",
    title: "Number Representation",
    description: "Represent numbers in different ways",
    suggestedQuestionCount: 12,
    suggestedDifficulty: "easy",
    tags: ["number-sense", "representation", "primary"],
  },

  "B2.4": {
    mode: "multiplication-arrays",
    title: "Multiplication Arrays",
    description: "Represent and solve multiplication using arrays",
    suggestedQuestionCount: 15,
    suggestedDifficulty: "medium",
    tags: ["multiplication", "arrays", "facts"],
  },

  "C1.1": {
    mode: "patterning",
    title: "Patterning",
    description: "Identify, extend, and create patterns",
    suggestedQuestionCount: 10,
    suggestedDifficulty: "easy",
    tags: ["patterns", "algebra"],
  },
};

function getWorksheetRecipe(expectationCode) {
  return RECIPES[String(expectationCode || "").toUpperCase()] || null;
}

module.exports = {
  RECIPES,
  getWorksheetRecipe,
};