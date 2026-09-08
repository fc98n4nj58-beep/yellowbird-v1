const assert = require("assert");
const fontkit = require("fontkit");
const path = require("path");
const {
  BASE_TEN_RESPONSE_HORIZONTAL_PADDING,
  buildBaseTenResponseLayout
} = require("../config/layout/grade1BaseTenBlocksLayout");

const bold = fontkit.openSync(path.join(__dirname, "../public/fonts/SourceSans3/SourceSans3-Bold.ttf"));
const tensAnswerWidth = bold.layout("10").positions.reduce((sum, position) => sum + position.xAdvance, 0) * 16 / bold.unitsPerEm;
for (const size of [12, 14, 16]) {
  const profile = buildBaseTenResponseLayout(size);
  assert.strictEqual(profile.labelFontSize, size);
  assert.strictEqual(profile.totalWidth, profile.columnWidth * 2);
  assert(profile.widest <= profile.columnWidth - BASE_TEN_RESPONSE_HORIZONTAL_PADDING * 2);
  assert(tensAnswerWidth <= profile.columnWidth - BASE_TEN_RESPONSE_HORIZONTAL_PADDING * 2);
  assert.strictEqual(profile.labels.length, 2);
}
console.log("Grade 1 Base Ten response labels and the 16 pt TENS answer fit their padded size-aware columns.");
