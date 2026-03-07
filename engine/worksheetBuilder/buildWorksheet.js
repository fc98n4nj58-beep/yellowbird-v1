const { getSkillKeyForExpectation, getSkillDefinition } = require("../skills");
const { getRecipeForSkill } = require("../activityRecipes");
const { getGenerator } = require("../problemGenerators");

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickActivitiesFromRecipe(recipe) {
  const selectedActivities = [];

  if (!recipe || !Array.isArray(recipe.recipeGroups)) {
    return selectedActivities;
  }

  recipe.recipeGroups.forEach((group) => {
    if (!group.activities || !Array.isArray(group.activities)) return;

    group.activities.forEach((activity) => {
      const count = randInt(activity.minQuestions || 1, activity.maxQuestions || 1);

      for (let i = 0; i < count; i++) {
        selectedActivities.push(activity.type);
      }
    });
  });

  return selectedActivities;
}

function buildWorksheet(expectationCode) {
  const skillKey = getSkillKeyForExpectation(expectationCode);

  if (!skillKey) {
    throw new Error(`No skill mapping found for expectation '${expectationCode}'.`);
  }

  const skillDefinition = getSkillDefinition(skillKey);
  if (!skillDefinition) {
    throw new Error(`No skill definition found for skill '${skillKey}'.`);
  }

  const recipe = getRecipeForSkill(skillKey);
  if (!recipe) {
    throw new Error(`No activity recipe found for skill '${skillKey}'.`);
  }

  const activityList = pickActivitiesFromRecipe(recipe);

  const problems = activityList.map((activityType) => {
    const generator = getGenerator(activityType);

    if (!generator) {
      throw new Error(`No problem generator found for activity '${activityType}'.`);
    }

    return generator();
  });

  return {
    expectationCode,
    skill: skillDefinition.skill,
    title: skillDefinition.title,
    description: skillDefinition.description,
    totalProblems: problems.length,
    problems
  };
}

module.exports = {
  buildWorksheet
};