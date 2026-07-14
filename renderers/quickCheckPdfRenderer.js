'use strict';

const path = require("path");
const PDFDocument = require("pdfkit");
const {
  COLORS,
  assessmentFonts,
  setFont: setAssessmentFont,
  drawRule: drawAssessmentRule,
  drawInlineEquation,
  drawStandardFooter,
  inlineEquationParts
} = require("./compactAssessmentPdfLayout");

const GRADE2_COMPACT_QUICK_CHECK_IDS = new Set([
  "g2_addition_within_20_quick_check",
  "g2_subtraction_within_20_quick_check",
  "g2_missing_addends_within_20_quick_check"
]);

const GRADE2_QUICK_CHECK_LAYOUT = Object.freeze({
  columns: 2,
  rowsPerColumn: 3,
  itemCount: 6,
  equationFontSize: 16,
  targetWidth: 58,
  metadataSubtitle: false,
  preciseTimeEstimate: false,
  teacherPanel: false,
  ratingStrip: false,
  usesSecondaryAnswerLines: false
});

function safeStr(value) {
  return (value ?? "").toString();
}

function tryRegisterFont(doc, name, filePath) {
  try {
    doc.registerFont(name, filePath);
    return true;
  } catch {
    return false;
  }
}

function setFont(doc, fontName, size) {
  try {
    doc.font(fontName).fontSize(size);
  } catch {
    doc.font("Helvetica").fontSize(size);
  }
}

function drawRule(doc, x1, x2, y, color = "#d6d3d1") {
  doc.save();
  doc.strokeColor(color).lineWidth(0.6).moveTo(x1, y).lineTo(x2, y).stroke();
  doc.restore();
}

function drawHeader(doc, fonts, item) {
  const left = 54;
  const top = 48;
  const width = 504;

  setFont(doc, fonts.regular, 10);
  doc.fillColor("#57534e").text("Quick Check", left, top, {
    width,
    characterSpacing: 0.2
  });

  setFont(doc, fonts.bold, 20);
  doc.fillColor("#1f2937").text(safeStr(item.title), left, top + 18, {
    width,
    lineGap: 1
  });

  const meta = [
    item.gradeLabels?.[0] || "",
    item.subject || "Math",
    item.domain || "",
    item.estimatedTimeMinutes ? `${item.estimatedTimeMinutes} min` : ""
  ].filter(Boolean).join(" / ");

  setFont(doc, fonts.regular, 10);
  doc.fillColor("#57534e").text(meta, left, top + 48, { width });

  drawRule(doc, left, left + width, top + 72);

  setFont(doc, fonts.regular, 10);
  doc.fillColor("#1f2937").text("Name:", left, top + 87, { width: 36, lineBreak: false });
  drawRule(doc, left + 40, left + 250, top + 99, "#a8a29e");
  doc.text("Date:", left + 286, top + 87, { width: 34, lineBreak: false });
  drawRule(doc, left + 322, left + width, top + 99, "#a8a29e");

  return top + 124;
}

function drawTeacherNote(doc, fonts, item, y) {
  const left = 54;
  const width = 504;
  const note = safeStr(item.teacherNote || item.description || "");

  setFont(doc, fonts.bold, 10);
  doc.fillColor("#1f2937").text("Teacher note", left, y, { width });

  setFont(doc, fonts.regular, 10);
  doc.fillColor("#44403c").text(note, left, y + 15, {
    width,
    lineGap: 1
  });

  return y + 46;
}

function drawCheckBoxes(doc, fonts, y) {
  const left = 54;
  const labels = ["Got it", "Almost", "Needs support"];
  const gap = 150;

  setFont(doc, fonts.regular, 10);
  doc.fillColor("#1f2937");

  labels.forEach((label, index) => {
    const x = left + index * gap;
    doc.rect(x, y, 10, 10).strokeColor("#78716c").lineWidth(0.8).stroke();
    doc.text(label, x + 16, y - 2, { width: 110 });
  });

  return y + 28;
}

function drawQuestions(doc, fonts, items, startY) {
  const left = 54;
  const width = 504;
  let y = startY;

  setFont(doc, fonts.regular, 11);
  doc.fillColor("#1f2937");

  items.forEach((item, index) => {
    const prompt = safeStr(item.prompt);
    const label = `${index + 1}. `;
    const promptHeight = doc.heightOfString(label + prompt, {
      width,
      lineGap: 1
    });

    doc.text(label + prompt, left, y, {
      width,
      lineGap: 1
    });

    const lineY = y + Math.max(promptHeight, 16) + 20;
    drawRule(doc, left + 22, left + width, lineY, "#a8a29e");

    y = lineY + 24;
  });

  return y;
}

function drawFooter(doc, fonts, pageLabel) {
  const left = 54;
  const y = 742;
  drawRule(doc, left, left + 504, y, "#d6d3d1");
  setFont(doc, fonts.regular, 9);
  doc.fillColor("#78716c").text(pageLabel, left, y + 8, {
    width: 504,
    align: "center"
  });
}

function drawAnswerKey(doc, fonts, item, items) {
  const left = 54;
  const width = 504;
  let y = 54;

  setFont(doc, fonts.bold, 18);
  doc.fillColor("#1f2937").text(`${safeStr(item.title)} Answer Key`, left, y, { width });
  y += 36;
  drawRule(doc, left, left + width, y);
  y += 24;

  setFont(doc, fonts.regular, 11);
  doc.fillColor("#1f2937");

  items.forEach((item, index) => {
    const answer = safeStr(item.answer);
    doc.text(`${index + 1}. ${answer}`, left, y, {
      width,
      lineGap: 1
    });
    y += 24;
  });

  drawFooter(doc, fonts, "Answer key");
}

function isGrade2CompactQuickCheck(item) {
  return GRADE2_COMPACT_QUICK_CHECK_IDS.has(item?.id);
}

function drawCompactHeader(doc, fonts, item, contentObject, options = {}) {
  const left = 54;
  const width = 504;
  const top = 48;
  const title = safeStr(contentObject?.meta?.title || item.title);
  const instruction = safeStr(item.studentInstructions || "Complete each question.");

  setAssessmentFont(doc, fonts.regular, 9.5);
  doc.fillColor(COLORS.muted).text(options.answerKey ? "Answer Key" : "Quick Check", left, top, {
    width,
    characterSpacing: 0.2,
    lineBreak: false
  });

  setAssessmentFont(doc, fonts.bold, 20);
  doc.fillColor(COLORS.text).text(title, left, top + 18, {
    width,
    lineGap: 1,
    lineBreak: false
  });

  drawAssessmentRule(doc, left, left + width, top + 52, { color: COLORS.rule, width: 0.7 });
  setAssessmentFont(doc, fonts.regular, 11.5);
  doc.fillColor(COLORS.text).text(instruction, left, top + 70, {
    width,
    lineBreak: false
  });

  if (!options.answerKey) {
    setAssessmentFont(doc, fonts.regular, 10);
    doc.fillColor(COLORS.text).text("Name:", left, top + 104, { width: 36, lineBreak: false });
    drawAssessmentRule(doc, left + 40, left + 250, top + 116, { color: "#a8a29e", width: 0.7 });
    doc.text("Date:", left + 286, top + 104, { width: 34, lineBreak: false });
    drawAssessmentRule(doc, left + 322, left + width, top + 116, { color: "#a8a29e", width: 0.7 });
  }

  return top + 150;
}

function drawCompactQuestionGrid(doc, fonts, items, startY, options = {}) {
  const left = 54;
  const width = 504;
  const gap = 36;
  const colWidth = (width - gap) / 2;
  const rowHeight = 118;

  items.slice(0, GRADE2_QUICK_CHECK_LAYOUT.itemCount).forEach((problem, index) => {
    const column = Math.floor(index / GRADE2_QUICK_CHECK_LAYOUT.rowsPerColumn);
    const row = index % GRADE2_QUICK_CHECK_LAYOUT.rowsPerColumn;
    drawInlineEquation(doc, fonts, problem, {
      x: left + column * (colWidth + gap),
      y: startY + row * rowHeight,
      width: colWidth,
      height: rowHeight
    }, {
      number: index + 1,
      showAnswer: Boolean(options.answerKey),
      fontSize: GRADE2_QUICK_CHECK_LAYOUT.equationFontSize,
      targetWidth: GRADE2_QUICK_CHECK_LAYOUT.targetWidth
    });
  });
}

function renderGrade2CompactQuickCheckPDF({ res, item, contentObject, options = {} }) {
  const doc = new PDFDocument({
    size: "LETTER",
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    bufferPages: false
  });
  const fonts = assessmentFonts(doc);
  const filename = safeStr(options.filename || `${item.id}.pdf`);
  const disposition = safeStr(options.disposition || "attachment") === "inline" ? "inline" : "attachment";
  const items = Array.isArray(contentObject?.content?.items)
    ? contentObject.content.items.slice(0, GRADE2_QUICK_CHECK_LAYOUT.itemCount)
    : [];

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `${disposition}; filename="${filename}"`);
  doc.pipe(res);

  let startY = drawCompactHeader(doc, fonts, item, contentObject);
  drawCompactQuestionGrid(doc, fonts, items, startY);
  drawStandardFooter(doc, fonts, item);

  if (options.includeAnswerKey !== false && item.hasAnswerKey !== false) {
    doc.addPage();
    startY = drawCompactHeader(doc, fonts, item, contentObject, { answerKey: true });
    drawCompactQuestionGrid(doc, fonts, items, startY, { answerKey: true });
    drawStandardFooter(doc, fonts, item);
  }

  doc.end();
}

function renderQuickCheckPDF({ res, item, contentObject, options = {} }) {
  if (isGrade2CompactQuickCheck(item)) {
    return renderGrade2CompactQuickCheckPDF({ res, item, contentObject, options });
  }

  const doc = new PDFDocument({
    size: "LETTER",
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    bufferPages: false
  });

  const fontsDir = path.join(__dirname, "..", "public", "fonts", "SourceSans3");
  const fonts = {
    regular: "SS3-Regular",
    bold: "SS3-Bold"
  };

  tryRegisterFont(doc, fonts.regular, path.join(fontsDir, "SourceSans3-Regular.ttf"));
  tryRegisterFont(doc, fonts.bold, path.join(fontsDir, "SourceSans3-Bold.ttf"));

  const filename = safeStr(options.filename || `${item.id}.pdf`);
  const disposition = safeStr(options.disposition || "attachment") === "inline" ? "inline" : "attachment";

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `${disposition}; filename="${filename}"`);

  doc.pipe(res);

  const items = Array.isArray(contentObject?.content?.items)
    ? contentObject.content.items
    : [];

  let y = drawHeader(doc, fonts, item);
  const studentInstructions = safeStr(
    item.studentInstructions || "Complete each question."
  );

  setFont(doc, fonts.regular, 11);
  doc.fillColor("#1f2937").text(
    studentInstructions,
    54,
    y,
    { width: 504 }
  );
  y += 34;

  y = drawQuestions(doc, fonts, items, y);
  y = Math.max(y + 8, 632);
  y = drawTeacherNote(doc, fonts, item, y);
  drawCheckBoxes(doc, fonts, y);
  drawFooter(doc, fonts, "Quick Check");

  if (options.includeAnswerKey !== false && item.hasAnswerKey !== false) {
    doc.addPage();
    drawAnswerKey(doc, fonts, item, items);
  }

  doc.end();
}

module.exports = {
  renderQuickCheckPDF,
  __test: {
    GRADE2_QUICK_CHECK_LAYOUT,
    isGrade2CompactQuickCheck,
    inlineEquationParts
  }
};
