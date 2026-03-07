const fs = require("fs");
const path = require("path");

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function getRecipeForSkill(skillKey) {
  if (!skillKey) return null;

  const fileNameMap = {
    multiplication_facts: "multiplicationFacts.json"
  };

  const fileName = fileNameMap[skillKey];
  if (!fileName) return null;

  const filePath = path.join(__dirname, fileName);
  return loadJson(filePath);
}

module.exports = {
  getRecipeForSkill
};