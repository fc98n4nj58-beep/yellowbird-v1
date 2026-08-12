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
const CUT_APART_QUICK_CHECKS = new Map([
  ["g4_compare_fractions_quick_check", { copies: 2, items: 6 }],
  ["g3_compare_3_digit_numbers_quick_check", { copies: 2, items: 6 }],
  ["g5_place_value_to_100000_quick_check", { copies: 2, items: 6 }],
  ["g5_equivalent_fractions_quick_check", { copies: 2, items: 6 }],
  ["g3_place_value_hundreds_tens_ones_quick_check", { copies: 2, items: 6 }],
  ["g2_subtraction_within_20_quick_check", { copies: 3, items: 6 }],
  ["g3_expanded_form_to_standard_form_quick_check", { copies: 3, items: 6 }],
  ["g2_missing_addends_within_20_quick_check", { copies: 4, items: 5 }]
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
  usesSecondaryAnswerLines: false,
  dividerY: 120,
  nameDateY: 135,
  instructionY: 170,
  questionGridY: 206,
  footerResourceKind: "Quick Check"
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

function concisePrompt(prompt) {
  return safeStr(prompt).replace(/^Compare(?: the numbers)?:\s*/i, "").replace(/^Match the equivalent fractions:\s*/i, "").replace(/^Complete:\s*/i, "");
}

function conciseTeacherNote(note) {
  return safeStr(note)
    .replace(/^Use this quick check after .*? to see whether students can /i, "Check whether students can ")
    .replace(/^Use this quick check to see whether students can /i, "Check whether students can ");
}

function renderCutApartQuickCheckPDF({ res, item, contentObject, options = {} }) {
  const spec = CUT_APART_QUICK_CHECKS.get(item.id);
  const doc = new PDFDocument({ size: "LETTER", margins: { top: 0, bottom: 0, left: 0, right: 0 } });
  const fonts = assessmentFonts(doc);
  const items = (contentObject?.content?.items || []).slice(0, spec.items);
  const filename = safeStr(options.filename || `${item.id}.pdf`);
  const disposition = safeStr(options.disposition || "attachment") === "inline" ? "inline" : "attachment";
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `${disposition}; filename="${filename}"`);
  doc.pipe(res);

  const boxes = spec.copies === 2
    ? [{ x: 42, y: 42, w: 528, h: 318 }, { x: 42, y: 432, w: 528, h: 318 }]
    : spec.copies === 3
      ? [{ x: 42, y: 24, w: 528, h: 230 }, { x: 42, y: 281, w: 528, h: 230 }, { x: 42, y: 538, w: 528, h: 230 }]
      : [{ x: 24, y: 24, w: 276, h: 354 }, { x: 312, y: 24, w: 276, h: 354 }, { x: 24, y: 414, w: 276, h: 354 }, { x: 312, y: 414, w: 276, h: 354 }];

  const drawTicket = (box) => {
    const padding = 12;
    const x = box.x + padding;
    const width = box.w - padding * 2;
    const columns = spec.copies === 4 ? 1 : spec.copies === 2 ? 2 : 3;
    const rows = Math.ceil(items.length / columns);
    const columnGap = 10;
    const columnWidth = (width - columnGap * (columns - 1)) / columns;
    const questionTop = box.y + 96;
    const rowHeight = (box.h - 150) / rows;

    doc.save().strokeColor("#302d29").lineWidth(0.75).rect(box.x, box.y, box.w, box.h).stroke().restore();
    setAssessmentFont(doc, fonts.regular, 7.2);
    doc.fillColor(COLORS.muted).text("QUICK CHECK", x, box.y + 10, { width, lineBreak: false });
    setAssessmentFont(doc, fonts.bold, 12.5);
    doc.fillColor(COLORS.text).text(item.shortTitle || item.title.replace(/ Quick Check$/, ""), x, box.y + 21, { width, lineBreak: false });
    setAssessmentFont(doc, fonts.regular, 7.7);
    doc.text("Name:", x, box.y + 43, { width: 28, lineBreak: false });
    drawAssessmentRule(doc, x + 32, x + width, box.y + 52, { color: "#4f4942", width: 0.55 });
    drawAssessmentRule(doc, x, x + width, box.y + 62, { color: COLORS.rule, width: 0.45 });
    setAssessmentFont(doc, fonts.regular, columns === 1 ? 8.5 : 7.6);
    doc.text(item.studentInstructions || "Complete each question.", x, box.y + 70, { width, lineBreak: false });

    items.forEach((question, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const questionX = x + column * (columnWidth + columnGap);
      const questionY = questionTop + row * rowHeight;
      setAssessmentFont(doc, fonts.bold, 8.5);
      doc.text(`${index + 1}.`, questionX, questionY, { width: 16, lineBreak: false });
      setAssessmentFont(doc, fonts.regular, columns === 1 ? 10.5 : 8.7);
      doc.text(concisePrompt(question.prompt), questionX + 16, questionY - 1, { width: columnWidth - 16, lineBreak: false });
      if (row < rows - 1) {
        drawAssessmentRule(doc, questionX, questionX + columnWidth, questionY + rowHeight - 10, { color: "#ddd7d0", width: 0.4 });
      }
    });

    setAssessmentFont(doc, fonts.regular, 6.2);
    doc.fillColor(COLORS.muted).text(
      conciseTeacherNote(item.teacherNote || item.description),
      x,
      box.y + box.h - 36,
      { width, height: 17, ellipsis: true, lineGap: 0, lineBreak: true }
    );
    drawAssessmentRule(doc, x, x + width, box.y + box.h - 18, { color: COLORS.rule, width: 0.4 });
    setAssessmentFont(doc, fonts.regular, 6.8);
    doc.fillColor(COLORS.muted).text(
      `${item.gradeLabels?.[0] || ""} • Math • Quick Check`,
      x,
      box.y + box.h - 14,
      { width, align: "center", lineBreak: false }
    );
  };

  boxes.forEach(drawTicket);
  if (spec.copies === 2) {
    drawAssessmentRule(doc, 42, 570, 396, { color: "#514b44", width: 0.8, dash: 7, space: 4 });
  }
  if (spec.copies === 3) {
    drawAssessmentRule(doc, 42, 570, 267, { color: "#514b44", width: 0.8, dash: 7, space: 4 });
    drawAssessmentRule(doc, 42, 570, 524, { color: "#514b44", width: 0.8, dash: 7, space: 4 });
  }
  if (spec.copies === 4) {
    doc.save()
      .dash(7, { space: 4 })
      .moveTo(306, 24).lineTo(306, 768).stroke()
      .moveTo(24, 396).lineTo(588, 396).stroke()
      .undash().restore();
  }

  if (options.includeAnswerKey !== false && item.hasAnswerKey !== false) {
    doc.addPage();
    setAssessmentFont(doc, fonts.bold, 18);
    doc.text(`${item.shortTitle || item.title} Answer Key`, 54, 54, { width: 504 });
    items.forEach((question, index) => {
      setAssessmentFont(doc, fonts.regular, 11);
      doc.text(`${index + 1}. ${concisePrompt(question.prompt)}  ${question.answer}`, 54, 115 + index * 42, { width: 504 });
    });
  }
  doc.end();
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

  drawAssessmentRule(doc, left, left + width, GRADE2_QUICK_CHECK_LAYOUT.dividerY, { color: COLORS.rule, width: 0.7 });

  if (!options.answerKey) {
    setAssessmentFont(doc, fonts.regular, 10);
    doc.fillColor(COLORS.text).text("Name:", left, GRADE2_QUICK_CHECK_LAYOUT.nameDateY, { width: 36, lineBreak: false });
    drawAssessmentRule(doc, left + 40, left + 250, GRADE2_QUICK_CHECK_LAYOUT.nameDateY + 12, { color: "#a8a29e", width: 0.7 });
    doc.text("Date:", left + 286, GRADE2_QUICK_CHECK_LAYOUT.nameDateY, { width: 34, lineBreak: false });
    drawAssessmentRule(doc, left + 322, left + width, GRADE2_QUICK_CHECK_LAYOUT.nameDateY + 12, { color: "#a8a29e", width: 0.7 });
  }

  setAssessmentFont(doc, fonts.regular, 11.5);
  doc.fillColor(COLORS.text).text(instruction, left, GRADE2_QUICK_CHECK_LAYOUT.instructionY, {
    width,
    lineBreak: false
  });

  return GRADE2_QUICK_CHECK_LAYOUT.questionGridY;
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
  drawStandardFooter(doc, fonts, item, { resourceKindLabel: GRADE2_QUICK_CHECK_LAYOUT.footerResourceKind });

  if (options.includeAnswerKey !== false && item.hasAnswerKey !== false) {
    doc.addPage();
    startY = drawCompactHeader(doc, fonts, item, contentObject, { answerKey: true });
    drawCompactQuestionGrid(doc, fonts, items, startY, { answerKey: true });
    drawStandardFooter(doc, fonts, item, { resourceKindLabel: GRADE2_QUICK_CHECK_LAYOUT.footerResourceKind });
  }

  doc.end();
}

function renderQuickCheckPDF({ res, item, contentObject, options = {} }) {
  if (CUT_APART_QUICK_CHECKS.has(item?.id)) return renderCutApartQuickCheckPDF({ res, item, contentObject, options });
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
    CUT_APART_QUICK_CHECKS,
    isGrade2CompactQuickCheck,
    concisePrompt,
    inlineEquationParts
  }
};
