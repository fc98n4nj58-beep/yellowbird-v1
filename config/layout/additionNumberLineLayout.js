const QUESTION_TEXT_SIZES = Object.freeze([12, 14, 16]);
// Existing safe question area: y=166..714. Standard's six occupied blocks
// retain their exact historic row height and the shared primitive's geometry.
const STANDARD_AREA_HEIGHT = 548;
const profiles = Object.freeze({
  12: { tickTextSize: 8, jumpTextSize: 9, minimumBlockHeight: STANDARD_AREA_HEIGHT / 6, capacity: 6 },
  14: { tickTextSize: 10, jumpTextSize: 11, minimumBlockHeight: 96, capacity: 5, lineOffset: 54, jumpLabelOffset: 33 },
  16: { tickTextSize: 12, jumpTextSize: 13, minimumBlockHeight: 110, capacity: 4, lineOffset: 62, jumpLabelOffset: 36 }
});

function buildAdditionNumberLineLayout(questionTextSize = 12) {
  if (!QUESTION_TEXT_SIZES.includes(questionTextSize)) throw new Error("Unsupported addition number-line text size.");
  return { questionTextSize, ...profiles[questionTextSize], modelWidth: 504, modelHeight: 52, tickLabelWidth: 18, answerWidth: 42 };
}

function additionNumberLinePageGeometry(itemCount, profile, startY, bottomY) {
  const available = bottomY - startY;
  const blockHeight = profile.questionTextSize === 12 ? available / 6 : profile.minimumBlockHeight;
  if (!Number.isInteger(itemCount) || itemCount < 1 || itemCount > profile.capacity || available < itemCount * blockHeight - 1e-7) {
    throw new Error("Addition number-line page exceeds its safe capacity.");
  }
  const rowHeight = available / itemCount;
  return { rows: itemCount, rowHeight, blockHeight, topOffset: (rowHeight - blockHeight) / 2 };
}

module.exports = { QUESTION_TEXT_SIZES, buildAdditionNumberLineLayout, additionNumberLinePageGeometry };
