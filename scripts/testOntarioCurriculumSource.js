const assert = require("assert");
const curriculum = require("../services/curriculumService");

const raw = curriculum.getCurriculumRaw();
const specific = curriculum.getAllExpectations();
const overalls = raw.grades.flatMap((grade) =>
  grade.strands.flatMap((strand) => strand.overallExpectations || [])
);
const structural = raw.grades.flatMap((grade) =>
  grade.strands.flatMap((strand) => strand.structuralElements || [])
);

assert.strictEqual(specific.length, 273);
assert.strictEqual(overalls.length, 72);
assert.strictEqual(structural.length, 42);
assert.strictEqual(specific.length + overalls.length + structural.length, 387);
assert.strictEqual(curriculum.getExpectationContextByRoute({
  subject: "math",
  grade: "grade1",
  strand: "number",
  expectationCode: "B1.1",
}).expectation.code, "B1.1");
assert.strictEqual(curriculum.getOverallExpectationsByGradeAndStrand("grade3", "B").length > 0, true);
assert.strictEqual(curriculum.getStrandStructuralElementsByGrade("grade6").length, 7);
assert.strictEqual(structural.every((item) => !item.code && !item.officialCode), true);
console.log("Ontario curriculum source integrity passed: 72 overall, 273 specific, 42 Strand A structural.");
