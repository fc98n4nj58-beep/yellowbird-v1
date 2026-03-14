const fs = require("fs");
const path = require("path");

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function getRecipeForSkill(skillKey) {
  if (!skillKey) return null;

  const filePath = path.join(__dirname, `${skillKey}.json`);
  console.log("recipe lookup:", filePath);

  if (!fs.existsSync(filePath)) {
    console.log("recipe missing for skill:", skillKey);
    return null;
  }

  return loadJson(filePath);
}

module.exports = {
  getRecipeForSkill
};