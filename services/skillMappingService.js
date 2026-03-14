const fs = require("fs");
const path = require("path");

const skillsDir = path.join(__dirname, "../engine/skills");
const expectationSkillMapPath = path.join(skillsDir, "expectationSkillMap.json");

function loadExpectationSkillMap() {
  const raw = fs.readFileSync(expectationSkillMapPath, "utf8");
  return JSON.parse(raw);
}

function normalizeExpectationCode(expectationCode) {
  if (!expectationCode) return "";
  const raw = String(expectationCode).trim().toUpperCase();

  // If full key comes in like ON-MATH-G2-C2.2, reduce to C2.2
  if (raw.startsWith("ON-MATH-")) {
    return raw.split("-").pop();
  }

  return raw;
}

function getSkillKeyForExpectation(expectationCode, grade) {
  const map = loadExpectationSkillMap();

  if (!expectationCode) return null;

  const shortCode = String(expectationCode).trim().toUpperCase();

  // grade can come in as "2", "grade2", or "Grade 2"
  let gradeToken = String(grade || "").trim().toUpperCase();

  if (/^\d+$/.test(gradeToken)) {
    gradeToken = `G${gradeToken}`;
  } else if (gradeToken.startsWith("GRADE")) {
    gradeToken = `G${gradeToken.replace("GRADE", "").trim()}`;
  } else if (!gradeToken.startsWith("G")) {
    gradeToken = `G${gradeToken}`;
  }

  const fullKey = `ON-MATH-${gradeToken}-${shortCode}`;

  return map[fullKey] || map[shortCode] || null;
}

function getSkillFilePath(skillKey) {
  return path.join(skillsDir, `${skillKey}.json`);
}

function getSkillDefinition(skillKey) {
  if (!skillKey) return null;

  const skillPath = getSkillFilePath(skillKey);

  if (!fs.existsSync(skillPath)) {
    return null;
  }

  const raw = fs.readFileSync(skillPath, "utf8");
  return JSON.parse(raw);
}

function getSkillContextForExpectation(expectationCode, grade) {
  const rawCode = String(expectationCode || "").trim().toUpperCase();
  const normalizedCode = normalizeExpectationCode(rawCode);

  const skillKey = getSkillKeyForExpectation(normalizedCode, grade);

  if (!skillKey) {
    return {
      expectationCode: rawCode,
      normalizedCode,
      skillKey: null,
      skill: null
    };
  }

  const skill = getSkillDefinition(skillKey);

  return {
    expectationCode: rawCode,
    normalizedCode,
    skillKey,
    skill
  };
}

module.exports = {
  normalizeExpectationCode,
  getSkillKeyForExpectation,
  getSkillDefinition,
  getSkillContextForExpectation
};