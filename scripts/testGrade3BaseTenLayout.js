const assert = require("assert");
const fontkit = require("fontkit");
const path = require("path");
const { HORIZONTAL_PADDING, buildGrade3BaseTenResponseLayout } = require("../config/layout/grade3BaseTenBlocksLayout");

const bold = fontkit.openSync(path.join(__dirname, "../public/fonts/SourceSans3/SourceSans3-Bold.ttf"));
const answerWidth = bold.layout("4").positions.reduce((sum, position) => sum + position.xAdvance, 0) * 16 / bold.unitsPerEm;
const expected = { 12: [70, 52], 14: [80, 56], 16: [89, 60] };
for (const size of [12, 14, 16]) {
  const profile = buildGrade3BaseTenResponseLayout(size, "hundreds_tens_ones");
  assert.deepStrictEqual([profile.columnWidth, profile.boxHeight], expected[size]);
  assert.strictEqual(profile.totalWidth, profile.columnWidth * 3);
  assert(profile.widest <= profile.columnWidth - HORIZONTAL_PADDING * 2);
  assert(answerWidth <= profile.columnWidth - HORIZONTAL_PADDING * 2);
  assert.deepStrictEqual(profile.responseKeys, ["hundreds", "tens", "ones"]);
  assert.strictEqual(profile.placement, "below_model");
  assert.strictEqual(profile.maxProblemsPerPage, 2);
}
assert.strictEqual(buildGrade3BaseTenResponseLayout(16).maxProblemsPerPage, 4);
console.log("Grade 3 Base Ten headings and answers fit the measured 12/14/16 pt response columns.");
