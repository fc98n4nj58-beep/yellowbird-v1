const path = require("path");
const fontkit = require("fontkit");

const QUESTION_TEXT_SIZES = Object.freeze([12, 14, 16]);
const HORIZONTAL_PADDING = 6;
const MIN_COLUMN_WIDTH = 64;
let regularFont;

function textWidth(text, size) {
  if (!regularFont) {
    regularFont = fontkit.openSync(path.join(
      __dirname,
      "../../public/fonts/SourceSans3/SourceSans3-Regular.ttf"
    ));
  }
  return regularFont.layout(String(text)).positions
    .reduce((sum, position) => sum + position.xAdvance, 0) * size / regularFont.unitsPerEm;
}

function buildGrade3BaseTenResponseLayout(questionTextSize, responseMode = "standard_number") {
  if (!QUESTION_TEXT_SIZES.includes(questionTextSize)) {
    throw new Error("Unsupported Grade 3 Base Ten question text size.");
  }
  const responseKeys = ["hundreds", "tens", "ones"];
  const labels = ["HUNDREDS", "TENS", "ONES"].map((label, index) => ({
    label,
    responseKey: responseKeys[index],
    width: textWidth(label, questionTextSize)
  }));
  const widest = Math.max(...labels.map(label => label.width));
  const columnWidth = Math.ceil(Math.max(MIN_COLUMN_WIDTH, widest + HORIZONTAL_PADDING * 2));
  const boxHeight = Math.max(52, questionTextSize * 2 + 28);
  if (widest > columnWidth - HORIZONTAL_PADDING * 2) {
    throw new Error("Grade 3 Base Ten response heading exceeds its padded column.");
  }
  return {
    labelFontSize: questionTextSize,
    columnWidth,
    totalWidth: columnWidth * labels.length,
    boxHeight,
    headingGap: 3,
    horizontalPadding: HORIZONTAL_PADDING,
    labels,
    responseKeys,
    placement: responseMode === "hundreds_tens_ones" ? "below_model" : "beside_model",
    maxProblemsPerPage: responseMode === "hundreds_tens_ones" ? 2 : 4,
    widest
  };
}

module.exports = {
  QUESTION_TEXT_SIZES,
  HORIZONTAL_PADDING,
  buildGrade3BaseTenResponseLayout
};
