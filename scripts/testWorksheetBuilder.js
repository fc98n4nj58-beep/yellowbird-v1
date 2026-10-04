"use strict";

const assert = require("assert");
const { buildWorksheet } = require("../engine/worksheetBuilder/buildWorksheet");
const { getSkillContextForExpectation } = require("../services/skillMappingService");

try {
  const grade = "grade1";
  const expectation = "B2.4";
  const skillContext = getSkillContextForExpectation(expectation, grade);
  const worksheet = buildWorksheet(grade, expectation, skillContext, {
    questionCount: 4,
    worksheetSeed: "worksheet-builder-test"
  });

  assert.strictEqual(skillContext.skillKey, "addition_subtraction_facts");
  assert.strictEqual(worksheet.expectationCode, expectation);
  assert.strictEqual(worksheet.expectationKey, "ON-MATH-G1-B2.4");
  assert.strictEqual(worksheet.skillKey, skillContext.skillKey);
  assert.strictEqual(worksheet.problems.length, 4);
  assert(worksheet.problems.every((problem) => problem && problem.answer !== undefined));

  console.log("Worksheet Builder current four-argument contract passed.");
} catch (error) {
  console.error("Worksheet generation failed:");
  console.error(error.message);
  process.exit(1);
}
