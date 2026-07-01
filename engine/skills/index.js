const fs = require("fs");
const path = require("path");

const skillMapPath = path.join(__dirname, "expectationSkillMap.json");

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function getSkillKeyForExpectation(expectationCode) {
  const map = loadJson(skillMapPath);
  return map[expectationCode] || null;
}

function getSkillDefinition(skillKey) {
  if (!skillKey) return null;

  const fileNameMap = {
  // canonical
  addition_subtraction_facts: "addition_subtraction_facts.json",
  addition_subtraction_word_problems: "additionSubtractionWordProblems.json",
  data_display_graphing: "data_display_graphing.json",
  fraction_equivalence: "fraction_equivalence.json",
  multiplication_facts: "multiplication_facts.json",
  patterning_and_algebra: "patterning_and_algebra.json",
  place_value_representation: "place_value_representation.json",

  // pragmatic aliases
  addition_strategies: "addition_subtraction_facts.json",
  addition_subtraction_application: "additionSubtractionWordProblems.json",
  addition_subtraction_relationships: "addition_subtraction_facts.json",
  number_relationships: "place_value_representation.json",
  number_magnitude: "place_value_representation.json",
  number_representation: "place_value_representation.json",
  counting_patterns: "patterning_and_algebra.json",

  multiplication_foundations: "multiplication_facts.json",
  division_foundations: "multiplication_facts.json",
  multiplication_relationships: "multiplication_facts.json",
  fraction_magnitude: "fraction_equivalence.json",
  early_number_sense: "place_value_representation.json"
};

  const fileName = fileNameMap[skillKey];
  if (!fileName) return null;

  const filePath = path.join(__dirname, fileName);
  if (!fs.existsSync(filePath)) return null;

  return loadJson(filePath);
}

module.exports = {
  getSkillKeyForExpectation,
  getSkillDefinition
};