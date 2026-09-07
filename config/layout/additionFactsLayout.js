const path = require("path");
const fontkit = require("fontkit");
const layout = require("./layoutSpec.json");

const QUESTION_TEXT_SIZES = Object.freeze([12, 14, 16]);
const BASELINE_ROWS = 15;
let fonts;

function textWidth(text, size, bold = false) {
  if (!fonts) {
    const folder = path.join(__dirname, "../../public/fonts/SourceSans3");
    fonts = {
      regular: fontkit.openSync(path.join(folder, "SourceSans3-Regular.ttf")),
      bold: fontkit.openSync(path.join(folder, "SourceSans3-Bold.ttf"))
    };
  }
  const font = bold ? fonts.bold : fonts.regular;
  return font.layout(String(text)).positions.reduce((sum, p) => sum + p.xAdvance, 0) * size / font.unitsPerEm;
}

function buildAdditionFactsLayout(items, questionTextSize = 12) {
  if (!QUESTION_TEXT_SIZES.includes(questionTextSize)) throw new Error("Unsupported Addition Facts question text size.");
  const answerSpace = Math.max(24, textWidth("___", questionTextSize) + 8);
  const measuredWidth = Math.max(0, ...items.map(item => {
    const prefix = `${item.id ?? item.problemNumber})  ${String(item.prompt).split(/_{2,}/)[0]}`;
    return textWidth(prefix, questionTextSize) + Math.max(answerSpace, textWidth(item.answer, questionTextSize, true)) + 2;
  }));
  let columns = Math.min(4, Math.max(1, items.length));
  const columnWidth = count => (layout.page.contentBox.width - layout.grid.gutter * (count - 1)) / count;
  while (columns > 1 && columnWidth(columns) < measuredWidth) columns -= 1;
  if (columnWidth(columns) < measuredWidth) throw new Error("Addition Facts content exceeds the safe question width.");
  const maxRows = Math.floor(BASELINE_ROWS * 12 / questionTextSize);
  return { questionTextSize, columns, maxRows, capacity: columns * maxRows, measuredWidth, columnWidth: columnWidth(columns) };
}

function additionFactsPageGeometry(itemCount, profile, startY, bottomY) {
  const rows = Math.max(1, Math.ceil(itemCount / profile.columns));
  if (rows > profile.maxRows || bottomY <= startY) throw new Error("Addition Facts page exceeds its safe capacity.");
  const rowHeight = (bottomY - startY) / rows;
  const minimumRowHeight = (bottomY - startY) / BASELINE_ROWS * profile.questionTextSize / 12;
  // Center sparse rows within their cells. A full 60/12 page has offset zero,
  // preserving every approved baseline coordinate.
  return { rows, rowHeight, topOffset: Math.max(0, (rowHeight - minimumRowHeight) / 2) };
}

module.exports = { QUESTION_TEXT_SIZES, buildAdditionFactsLayout, additionFactsPageGeometry };
