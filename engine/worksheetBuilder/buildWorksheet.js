const { getSkillDefinition } = require("../skills");
const { getRecipeForSkill } = require("../activityRecipes");
const { getGenerator } = require("../problemGenerators");
const { createSeededRandom } = require("../../utils/seededRandom");

function pickActivitiesFromRecipe(recipe, requestedCount = null, preferredActivity = null) {
  if (!recipe) return [];

  const aliasMap = {
    array: "arrays",
    arrays: "array"
  };

  function resolvePreferredMatch(activityList = []) {
    if (!preferredActivity) return null;

    return (
      activityList.find((a) => a === preferredActivity) ||
      activityList.find((a) => a === aliasMap[preferredActivity]) ||
      null
    );
  }

  if (Array.isArray(recipe.activities) && recipe.activities.length) {
    let baseActivities = recipe.activities;
    const matched = resolvePreferredMatch(recipe.activities);

    if (matched) {
      baseActivities = [matched];
    }

    if (!requestedCount || requestedCount <= 0) {
      return matched ? Array(8).fill(matched) : [baseActivities[0]];
    }

    return Array(requestedCount).fill(baseActivities[0]);
  }

  const selectedActivities = [];

  if (!recipe.variants) {
    return selectedActivities;
  }

  let mode = recipe.defaultMode || Object.keys(recipe.variants)[0];

  if (preferredActivity) {
    const preferred = String(preferredActivity).toLowerCase();

    if (
      preferred.includes("fact_fluency") ||
      preferred.includes("addition.basic") ||
      preferred.includes("subtraction.basic")
    ) {
      mode = "fact_fluency";
    } else if (preferred.includes("word")) {
      mode = "word_problem_focus";
    } else if (preferred.includes("exit")) {
      mode = "exit_ticket";
    } else if (preferred.includes("review") || preferred.includes("mixed")) {
      mode = "review_mixed";
    }
  }

  const variant = recipe.variants[mode];

  if (!variant || !variant.activityMix) {
    return selectedActivities;
  }

  Object.entries(variant.activityMix).forEach(([activityType, count]) => {
    for (let i = 0; i < count; i++) {
      selectedActivities.push(activityType);
    }
  });

  let baseActivities = selectedActivities;
  const matched = resolvePreferredMatch(selectedActivities);

  if (matched) {
    baseActivities = [matched];
  }

  if (!requestedCount || requestedCount <= 0) {
    return matched ? Array(8).fill(matched) : baseActivities;
  }

  if (matched) {
    return Array(requestedCount).fill(matched);
  }

  if (baseActivities.length >= requestedCount) {
    return baseActivities.slice(0, requestedCount);
  }

  const expanded = [...baseActivities];
  let index = 0;

  while (expanded.length < requestedCount && baseActivities.length > 0) {
    expanded.push(baseActivities[index % baseActivities.length]);
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

function resolveDefaultQuestionCount(options = {}, preferredActivity = null) {
  const questionCount = Number(options.questionCount);

  if (Number.isFinite(questionCount) && questionCount > 0) {
    return questionCount;
  }

  const visualActivities = new Set([
    "ten_frame",
    "number_line_identify",
    "base_ten_blocks",
    "array",
    "arrays"
  ]);

  if (preferredActivity && visualActivities.has(preferredActivity)) {
    return 10;
  }

  return 12;
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

  const preferredActivity =
    options.preferredActivityType ||
    options.activityType ||
    null;

  const questionCount = resolveDefaultQuestionCount(options, preferredActivity);

  const activityList = pickActivitiesFromRecipe(
    recipe,
    questionCount,
    preferredActivity
  );

  const usedProblemKeys = new Set();
  const random = createSeededRandom(options.worksheetSeed || "yellowbird-default");

  const problems = activityList.map((activityType) => {
    const generator = getGenerator(activityType);

    if (!generator) {
      throw new Error(
        `No problem generator found for activity '${activityType}'.`
      );
    }

    return generator({
      ...options,
      activityType,
      usedProblemKeys,
      random
    });
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