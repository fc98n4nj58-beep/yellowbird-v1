const { getSkillDefinition } = require("../skills");
const { getRecipeForSkill } = require("../activityRecipes");
const { getGenerator } = require("../problemGenerators");

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickActivitiesFromRecipe(recipe, requestedCount = null) {
  const selectedActivities = [];

  if (!recipe || !recipe.variants) {
    return selectedActivities;
  }

  const mode = recipe.defaultMode || Object.keys(recipe.variants)[0];
  const variant = recipe.variants[mode];

  if (!variant || !variant.activityMix) {
    return selectedActivities;
  }

  Object.entries(variant.activityMix).forEach(([activityType, count]) => {
    for (let i = 0; i < count; i++) {
      selectedActivities.push(activityType);
    }
  });

  if (!requestedCount || requestedCount <= 0) {
    return selectedActivities;
  }

  if (selectedActivities.length >= requestedCount) {
    return selectedActivities.slice(0, requestedCount);
  }

  const expanded = [...selectedActivities];
  let index = 0;

  while (expanded.length < requestedCount && selectedActivities.length > 0) {
    expanded.push(selectedActivities[index % selectedActivities.length]);
    index += 1;
  }

  return expanded;
}

function normalizeExpectationCode(expectationCode = "") {
  const code = String(expectationCode).trim().toUpperCase();

  if (code.includes("-")) {
    const parts = code.split("-");
    return parts[parts.length - 1];
  }

  return code;
}

function buildExpectationKey(grade, expectationCode) {
  const gradeNumber = String(grade).replace("grade", "");
  const normalizedCode = normalizeExpectationCode(expectationCode);
  return `ON-MATH-G${gradeNumber}-${normalizedCode}`;
}

function buildWorksheet(grade, expectationCode, skillContext = null, options = {}) {
  const normalizedExpectationCode = normalizeExpectationCode(expectationCode);
  const expectationKey = buildExpectationKey(grade, expectationCode);

  const resolvedSkillKey = skillContext?.skillKey || null;
  const resolvedSkillDefinition =
    skillContext?.skill ||
    (resolvedSkillKey ? getSkillDefinition(resolvedSkillKey) : null);

  if (!resolvedSkillKey) {
    throw new Error(`No skill mapping found for expectation '${expectationKey}'.`);
  }

  if (!resolvedSkillDefinition) {
    throw new Error(`No skill definition found for skill '${resolvedSkillKey}'.`);
  }

  const recipe = getRecipeForSkill(resolvedSkillKey);

  if (!recipe) {
    throw new Error(`No activity recipe found for skill '${resolvedSkillKey}'.`);
  }

 const activityList = pickActivitiesFromRecipe(recipe, options.questionCount);

  const problems = activityList.map((activityType) => {
  const generator = getGenerator(activityType);

  if (!generator) {
    throw new Error(`No problem generator found for activity '${activityType}'.`);
  }

  return generator(options);
});

  return {
  expectationCode: normalizedExpectationCode,
  expectationKey,
  skillKey: resolvedSkillKey,
  skill: resolvedSkillDefinition,
  problems
};
}

module.exports = {
  buildWorksheet
};