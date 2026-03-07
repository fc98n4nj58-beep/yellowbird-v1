const fs = require("fs");
const path = require("path");

const INPUT_PATH = path.join(
  __dirname,
  "..",
  "data",
  "curriculum",
  "ontario",
  "math_k6.json"
);

const OUTPUT_PATH = path.join(
  __dirname,
  "..",
  "data",
  "curriculum",
  "ontario",
  "math_k6.normalized.json"
);

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function toGradeKey(value) {
  if (typeof value === "string" && /^grade\d+$/i.test(value.trim())) {
    return value.trim().toLowerCase();
  }

  const num = String(value || "").replace(/[^0-9]/g, "");
  return num ? `grade${num}` : "";
}

function toGradeLabel(value, fallbackKey = "") {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  const num = String(fallbackKey || "").replace(/[^0-9]/g, "");
  return num ? `Grade ${num}` : "";
}

function normalizeExpectation(exp) {
  return {
    id:
      exp?.id ||
      exp?.expectation_id ||
      exp?.code ||
      exp?.expectation_code ||
      "",
    code:
      exp?.code ||
      exp?.expectation_code ||
      exp?.id ||
      exp?.expectation_id ||
      "",
    text:
      exp?.text ||
      exp?.expectation_text ||
      "",
    learningGoal:
      exp?.learningGoal ||
      exp?.learning_goal ||
      "",
    successCriteria:
      Array.isArray(exp?.successCriteria)
        ? exp.successCriteria
        : Array.isArray(exp?.success_criteria)
        ? exp.success_criteria
        : [],
    worksheet_recipe:
      exp?.worksheet_recipe || null
  };
}

function normalizeTopic(topic) {
  const expectations = Array.isArray(topic?.expectations)
    ? topic.expectations.map(normalizeExpectation)
    : [];

  return {
    id:
      topic?.id ||
      topic?.topic_id ||
      "",
    name:
      topic?.name ||
      topic?.topic_name ||
      "",
    expectations
  };
}

function normalizeStrand(strand) {
  const topics = Array.isArray(strand?.topics)
    ? strand.topics.map(normalizeTopic)
    : [];

  return {
    id:
      strand?.id ||
      strand?.strand_id ||
      "",
    name:
      strand?.name ||
      strand?.strand_name ||
      "",
    topics
  };
}

function normalizeGrade(gradeObj) {
  const gradeKey = toGradeKey(gradeObj?.grade);
  const gradeLabel = toGradeLabel(gradeObj?.gradeLabel, gradeKey);

  const strands = Array.isArray(gradeObj?.strands)
    ? gradeObj.strands.map(normalizeStrand)
    : [];

  return {
    grade: gradeKey,
    gradeLabel,
    strands
  };
}

function normalizeCurriculum(raw) {
  const grades = Array.isArray(raw?.grades)
    ? raw.grades.map(normalizeGrade)
    : [];

  return {
    version: raw?.version || "",
    jurisdiction:
      raw?.jurisdiction || { id: "ON", name: "Ontario" },
    subject:
      raw?.subject || { id: "MATH", name: "Math" },
    grades
  };
}

function main() {
  if (!fs.existsSync(INPUT_PATH)) {
    console.error(`Input file not found: ${INPUT_PATH}`);
    process.exit(1);
  }

  const raw = loadJson(INPUT_PATH);
  const normalized = normalizeCurriculum(raw);

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(normalized, null, 2), "utf8");

  console.log(`Normalized curriculum written to: ${OUTPUT_PATH}`);
}

main();