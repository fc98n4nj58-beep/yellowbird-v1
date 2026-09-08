const path = require("path");
const fontkit = require("fontkit");

const QUESTION_TEXT_SIZES = Object.freeze([12, 14, 16]);
const BASE_TEN_RESPONSE_HORIZONTAL_PADDING = 6;
const BASE_TEN_RESPONSE_MIN_COLUMN_WIDTH = 42;
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

function buildBaseTenResponseLayout(questionTextSize) {
  if (!QUESTION_TEXT_SIZES.includes(questionTextSize)) {
    throw new Error("Unsupported Grade 1 Base Ten question text size.");
  }
  const labels = ["TENS", "ONES"].map(label => ({ label, width: textWidth(label, questionTextSize) }));
  const widest = Math.max(...labels.map(label => label.width));
  const columnWidth = Math.ceil(Math.max(
    BASE_TEN_RESPONSE_MIN_COLUMN_WIDTH,
    widest + BASE_TEN_RESPONSE_HORIZONTAL_PADDING * 2
  ));
  const boxHeight = Math.max(52, questionTextSize * 2 + 28);
  if (widest > columnWidth - BASE_TEN_RESPONSE_HORIZONTAL_PADDING * 2) {
    throw new Error("Grade 1 Base Ten response label exceeds its padded column.");
  }
  return {
    labelFontSize: questionTextSize,
    columnWidth,
    totalWidth: columnWidth * 2,
    boxHeight,
    headingGap: 3,
    horizontalPadding: BASE_TEN_RESPONSE_HORIZONTAL_PADDING,
    labels,
    widest
  };
}

module.exports = {
  QUESTION_TEXT_SIZES,
  BASE_TEN_RESPONSE_HORIZONTAL_PADDING,
  BASE_TEN_RESPONSE_MIN_COLUMN_WIDTH,
  buildBaseTenResponseLayout
};
