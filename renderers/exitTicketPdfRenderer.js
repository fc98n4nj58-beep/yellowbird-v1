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
  footerText,
  inlineEquationParts
} = require("./compactAssessmentPdfLayout");

const GRADE2_COMPACT_EXIT_TICKET_ID = "g2_missing_addends_within_20_exit_ticket";
const FOUR_UP_EXIT_TICKET_IDS = new Set([
  "g4_compare_fractions_exit_ticket",
  "g3_compare_3_digit_numbers_exit_ticket",
  "g5_compare_numbers_to_100000_exit_ticket",
  "g5_equivalent_fractions_exit_ticket",
  GRADE2_COMPACT_EXIT_TICKET_ID,
  "g3_expanded_form_to_standard_form_exit_ticket"
]);
const FOUR_UP_EXIT_TICKET_LAYOUT = Object.freeze({
  ticketsPerPage: 4,
  itemsPerTicket: 3,
  titleFontSize: 13,
  promptFontSize: 11.5,
  omitsDate: true
});
const GRADE2_EXIT_TICKET_LAYOUT = Object.freeze({
  ticketsPerPage: 4,
  itemsPerTicket: 3,
  equationFontSize: 14,
  targetWidth: 58,
  usesSecondaryAnswerLines: false,
  conciseTitle: true
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

function drawRule(doc, x1, x2, y, options = {}) {
  doc.save();
  doc.strokeColor(options.color || "#222222");
  doc.lineWidth(options.width || 0.8);
  if (options.dash) {
    doc.dash(options.dash, { space: options.space || 4 });
  }
  doc.moveTo(x1, y).lineTo(x2, y).stroke();
  doc.undash();
  doc.restore();
}

function drawTicket(doc, fonts, item, items, frame) {
  const { x, y, width, height } = frame;
  const pad = 18;
  const innerX = x + pad;
  const innerWidth = width - pad * 2;
  let cursor = y + pad;

  doc.save();
  doc.strokeColor("#222222").lineWidth(0.9).rect(x, y, width, height).stroke();
  doc.restore();

  setFont(doc, fonts.bold, 10);
  doc.fillColor("#111111").text("Exit Ticket", innerX, cursor, {
    width: innerWidth,
    characterSpacing: 0.2
  });

  setFont(doc, fonts.bold, 17);
  doc.fillColor("#111111").text(safeStr(item.title), innerX, cursor + 16, {
    width: innerWidth,
    lineGap: 0
  });
  cursor += 48;

  setFont(doc, fonts.regular, 9.5);
  doc.fillColor("#111111").text("Name:", innerX, cursor, { width: 34, lineBreak: false });
  drawRule(doc, innerX + 38, innerX + 205, cursor + 11, { color: "#444444", width: 0.7 });
  doc.text("Date:", innerX + 224, cursor, { width: 32, lineBreak: false });
  drawRule(doc, innerX + 258, innerX + innerWidth, cursor + 11, { color: "#444444", width: 0.7 });
  cursor += 27;

  const instructions = safeStr(item.studentInstructions || "Complete each question.");
  setFont(doc, fonts.regular, 10.5);
  doc.fillColor("#111111").text(instructions, innerX, cursor, {
    width: innerWidth,
    lineGap: 1
  });
  cursor += Math.max(22, doc.heightOfString(instructions, { width: innerWidth, lineGap: 1 }) + 10);

  setFont(doc, fonts.regular, 10.5);
  items.forEach((problem, index) => {
    const label = `${index + 1}. `;
    const prompt = label + safeStr(problem.prompt);
    const promptHeight = doc.heightOfString(prompt, {
      width: innerWidth,
      lineGap: 1
    });

    doc.fillColor("#111111").text(prompt, innerX, cursor, {
      width: innerWidth,
      lineGap: 1
    });

    const answerY = cursor + Math.max(promptHeight, 14) + 16;
    drawRule(doc, innerX + 22, innerX + innerWidth, answerY, {
      color: "#333333",
      width: 0.75
    });
    cursor = answerY + 22;
  });
}

function drawAnswerKey(doc, fonts, item, items) {
  const left = 54;
  const width = 504;
  let y = 54;

  setFont(doc, fonts.bold, 18);
  doc.fillColor("#111111").text(`${safeStr(item.title)} Answer Key`, left, y, { width });
  y += 36;

  drawRule(doc, left, left + width, y, { color: "#222222", width: 0.8 });
  y += 24;

  setFont(doc, fonts.regular, 11);
  items.forEach((problem, index) => {
    doc.fillColor("#111111").text(`${index + 1}. ${safeStr(problem.answer)}`, left, y, {
      width,
      lineGap: 1
    });
    y += 26;
  });

  y += 8;
  setFont(doc, fonts.regular, 10);
  doc.fillColor("#333333").text("Both cut-apart tickets use the same answer key.", left, y, {
    width
  });
}

function isGrade2CompactExitTicket(item) {
  return item?.id === GRADE2_COMPACT_EXIT_TICKET_ID;
}

function isFourUpExitTicket(item) {
  return FOUR_UP_EXIT_TICKET_IDS.has(item?.id);
}

function concisePrompt(prompt) {
  return safeStr(prompt)
    .replace(/^Compare(?: the numbers)?:\s*/i, "")
    .replace(/^Match the equivalent fractions:\s*/i, "");
}

function drawFourUpTicket(doc, fonts, item, items, frame) {
  const pad = 14;
  const innerX = frame.x + pad;
  const innerWidth = frame.width - pad * 2;
  const title = safeStr(item.shortTitle || item.title).replace(/ Exit Ticket$/, "");

  doc.save();
  doc.strokeColor("#302d29").lineWidth(0.8).rect(frame.x, frame.y, frame.width, frame.height).stroke();
  doc.restore();

  setFont(doc, fonts.regular, 7.5);
  doc.fillColor("#5d574f").text("EXIT TICKET", innerX, frame.y + 12, {
    width: innerWidth,
    characterSpacing: 0.45,
    lineBreak: false
  });
  setFont(doc, fonts.bold, FOUR_UP_EXIT_TICKET_LAYOUT.titleFontSize);
  doc.fillColor("#1f1d1a").text(title, innerX, frame.y + 24, {
    width: innerWidth,
    lineBreak: false
  });
  setFont(doc, fonts.regular, 8.5);
  doc.fillColor("#2f2b27").text("Name:", innerX, frame.y + 46, { width: 30, lineBreak: false });
  drawRule(doc, innerX + 34, innerX + innerWidth, frame.y + 56, { width: 0.55, color: "#4f4942" });
  drawRule(doc, innerX, innerX + innerWidth, frame.y + 68, { width: 0.45, color: "#c9c1b8" });

  setFont(doc, fonts.regular, 8.5);
  doc.fillColor("#2f2b27").text(
    safeStr(item.studentInstructions || "Complete each question."),
    innerX,
    frame.y + 78,
    { width: innerWidth, lineBreak: false }
  );

  items.slice(0, FOUR_UP_EXIT_TICKET_LAYOUT.itemsPerTicket).forEach((problem, index) => {
    const y = frame.y + 112 + index * 65;
    setFont(doc, fonts.bold, 10.5);
    doc.fillColor("#1f1d1a").text(`${index + 1}.`, innerX, y, { width: 18, lineBreak: false });
    setFont(doc, fonts.regular, FOUR_UP_EXIT_TICKET_LAYOUT.promptFontSize);
    doc.fillColor("#1f1d1a").text(concisePrompt(problem.prompt), innerX + 22, y - 1, {
      width: innerWidth - 22,
      lineBreak: false
    });
    if (index < items.length - 1) {
      drawRule(doc, innerX, innerX + innerWidth, y + 47, { width: 0.4, color: "#ddd7d0" });
    }
  });

  drawRule(doc, innerX, innerX + innerWidth, frame.y + frame.height - 22, { width: 0.4, color: "#c9c1b8" });
  setFont(doc, fonts.regular, 7.2);
  doc.fillColor("#655e56").text(`${item.gradeLabels?.[0] || ""} • Math`, innerX, frame.y + frame.height - 17, {
    width: innerWidth,
    align: "center",
    lineBreak: false
  });
}

function drawFourUpAnswerKey(doc, fonts, item, items) {
  const left = 54;
  const width = 504;
  const title = safeStr(item.shortTitle || item.title).replace(/ Exit Ticket$/, "");

  setFont(doc, fonts.regular, 10);
  doc.fillColor("#5d574f").text("ANSWER KEY", left, 54, { width, characterSpacing: 0.45, lineBreak: false });
  setFont(doc, fonts.bold, 20);
  doc.fillColor("#1f1d1a").text(title, left, 72, { width, lineBreak: false });
  drawRule(doc, left, left + width, 108, { width: 0.7, color: "#7c7368" });
  setFont(doc, fonts.regular, 11);
  doc.fillColor("#2f2b27").text(safeStr(item.studentInstructions || "Complete each question."), left, 126, {
    width,
    lineBreak: false
  });
  setFont(doc, fonts.regular, 11.5);
  items.slice(0, FOUR_UP_EXIT_TICKET_LAYOUT.itemsPerTicket).forEach((problem, index) => {
    const y = 176 + index * 52;
    doc.fillColor("#1f1d1a").text(`${index + 1}. ${concisePrompt(problem.prompt)}  ${safeStr(problem.answer)}`, left, y, {
      width,
      lineBreak: false
    });
    drawRule(doc, left, left + width, y + 30, { width: 0.4, color: "#ddd7d0" });
  });
  setFont(doc, fonts.regular, 10);
  doc.fillColor("#655e56").text("All four cut-apart tickets use the same generated questions and answer key.", left, 360, {
    width,
    lineBreak: false
  });
}

function renderFourUpExitTicketPDF({ res, item, contentObject, options = {} }) {
  const doc = new PDFDocument({
    size: "LETTER",
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    bufferPages: false
  });
  const fonts = assessmentFonts(doc);
  const filename = safeStr(options.filename || `${item.id}.pdf`);
  const disposition = safeStr(options.disposition || "attachment") === "inline" ? "inline" : "attachment";
  const items = (Array.isArray(contentObject?.content?.items) ? contentObject.content.items : [])
    .slice(0, FOUR_UP_EXIT_TICKET_LAYOUT.itemsPerTicket);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `${disposition}; filename="${filename}"`);
  doc.pipe(res);

  const frames = [
    { x: 24, y: 24, width: 276, height: 354 },
    { x: 312, y: 24, width: 276, height: 354 },
    { x: 24, y: 414, width: 276, height: 354 },
    { x: 312, y: 414, width: 276, height: 354 }
  ];
  frames.forEach((frame) => drawFourUpTicket(doc, fonts, item, items, frame));
  doc.save().strokeColor("#514b44").lineWidth(0.8).dash(7, { space: 4 }).moveTo(306, 24).lineTo(306, 768).stroke().undash().restore();
  drawRule(doc, 24, 588, 396, { color: "#514b44", width: 0.8, dash: 7, space: 4 });

  if (options.includeAnswerKey !== false && item.hasAnswerKey !== false) {
    doc.addPage();
    drawFourUpAnswerKey(doc, fonts, item, items);
  }
  doc.end();
}

function drawCompactTicketFooter(doc, fonts, item, frame) {
  const x = frame.x + 18;
  const width = frame.width - 36;
  const y = frame.y + frame.height - 22;
  drawAssessmentRule(doc, x, x + width, y, { color: COLORS.rule, width: 0.5 });
  setAssessmentFont(doc, fonts.regular, 8.5);
  doc.fillColor(COLORS.muted).text(footerText(item), x, y + 5, {
    width,
    align: "center",
    lineBreak: false
  });
}

function drawCompactTicket(doc, fonts, item, contentObject, items, frame) {
  const pad = 18;
  const innerX = frame.x + pad;
  const innerWidth = frame.width - pad * 2;
  const title = safeStr(contentObject?.meta?.title || item.title);

  doc.save();
  doc.strokeColor("#222222").lineWidth(0.9).rect(frame.x, frame.y, frame.width, frame.height).stroke();
  doc.restore();

  setAssessmentFont(doc, fonts.regular, 9);
  doc.fillColor(COLORS.muted).text("Exit Ticket", innerX, frame.y + 16, {
    width: innerWidth,
    characterSpacing: 0.2,
    lineBreak: false
  });
  setAssessmentFont(doc, fonts.bold, 16);
  doc.fillColor(COLORS.text).text(title, innerX, frame.y + 33, {
    width: innerWidth,
    lineBreak: false
  });

  setAssessmentFont(doc, fonts.regular, 9.5);
  doc.fillColor(COLORS.text).text("Name:", innerX, frame.y + 64, { width: 34, lineBreak: false });
  drawAssessmentRule(doc, innerX + 38, innerX + 205, frame.y + 75, { color: "#444444", width: 0.7 });
  doc.text("Date:", innerX + 224, frame.y + 64, { width: 32, lineBreak: false });
  drawAssessmentRule(doc, innerX + 258, innerX + innerWidth, frame.y + 75, { color: "#444444", width: 0.7 });
  drawAssessmentRule(doc, innerX, innerX + innerWidth, frame.y + 91, { color: COLORS.rule, width: 0.6 });

  setAssessmentFont(doc, fonts.regular, 10.5);
  doc.fillColor(COLORS.text).text(
    safeStr(item.studentInstructions || "Complete each question."),
    innerX,
    frame.y + 105,
    { width: innerWidth, lineBreak: false }
  );

  items.slice(0, GRADE2_EXIT_TICKET_LAYOUT.itemsPerTicket).forEach((problem, index) => {
    drawInlineEquation(doc, fonts, problem, {
      x: innerX,
      y: frame.y + 143 + index * 46,
      width: innerWidth,
      height: 42
    }, {
      number: index + 1,
      fontSize: GRADE2_EXIT_TICKET_LAYOUT.equationFontSize,
      targetWidth: GRADE2_EXIT_TICKET_LAYOUT.targetWidth
    });
  });

  drawCompactTicketFooter(doc, fonts, item, frame);
}

function drawCompactExitAnswerKey(doc, fonts, item, contentObject, items) {
  const left = 54;
  const width = 504;
  const top = 54;
  const title = safeStr(contentObject?.meta?.title || item.title);

  setAssessmentFont(doc, fonts.regular, 9.5);
  doc.fillColor(COLORS.muted).text("Answer Key", left, top, { width, lineBreak: false });
  setAssessmentFont(doc, fonts.bold, 20);
  doc.fillColor(COLORS.text).text(title, left, top + 18, { width, lineBreak: false });
  drawAssessmentRule(doc, left, left + width, top + 52, { color: COLORS.rule, width: 0.7 });
  setAssessmentFont(doc, fonts.regular, 11.5);
  doc.fillColor(COLORS.text).text(
    safeStr(item.studentInstructions || "Complete each question."),
    left,
    top + 70,
    { width, lineBreak: false }
  );

  items.slice(0, GRADE2_EXIT_TICKET_LAYOUT.itemsPerTicket).forEach((problem, index) => {
    drawInlineEquation(doc, fonts, problem, {
      x: left,
      y: top + 122 + index * 72,
      width: 300,
      height: 60
    }, {
      number: index + 1,
      showAnswer: true,
      fontSize: GRADE2_EXIT_TICKET_LAYOUT.equationFontSize,
      targetWidth: GRADE2_EXIT_TICKET_LAYOUT.targetWidth
    });
  });

  drawStandardFooter(doc, fonts, item);
}

function renderGrade2CompactExitTicketPDF({ res, item, contentObject, options = {} }) {
  const doc = new PDFDocument({
    size: "LETTER",
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    bufferPages: false
  });
  const fonts = assessmentFonts(doc);
  const filename = safeStr(options.filename || `${item.id}.pdf`);
  const disposition = safeStr(options.disposition || "attachment") === "inline" ? "inline" : "attachment";
  const items = (Array.isArray(contentObject?.content?.items) ? contentObject.content.items : [])
    .slice(0, GRADE2_EXIT_TICKET_LAYOUT.itemsPerTicket);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `${disposition}; filename="${filename}"`);
  doc.pipe(res);

  const frame = { x: 42, y: 42, width: 528, height: 318 };
  drawCompactTicket(doc, fonts, item, contentObject, items, frame);
  drawAssessmentRule(doc, 42, 570, 396, { color: "#222222", width: 0.8, dash: 8, space: 5 });
  setAssessmentFont(doc, fonts.regular, 9);
  doc.fillColor(COLORS.muted).text("Cut here", 518, 384, { width: 52, align: "right", lineBreak: false });
  drawCompactTicket(doc, fonts, item, contentObject, items, { ...frame, y: 432 });

  if (options.includeAnswerKey !== false && item.hasAnswerKey !== false) {
    doc.addPage();
    drawCompactExitAnswerKey(doc, fonts, item, contentObject, items);
  }
  doc.end();
}

function renderExitTicketPDF({ res, item, contentObject, options = {} }) {
  if (isFourUpExitTicket(item)) {
    return renderFourUpExitTicketPDF({ res, item, contentObject, options });
  }
  if (isGrade2CompactExitTicket(item)) {
    return renderGrade2CompactExitTicketPDF({ res, item, contentObject, options });
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

  const questionCount = Number(item.generatorOptions?.questionCount || 3);
  const items = (Array.isArray(contentObject?.content?.items)
    ? contentObject.content.items
    : []
  ).slice(0, Number.isFinite(questionCount) ? questionCount : 3);

  const pageWidth = 612;
  const pageHeight = 792;
  const marginX = 42;
  const ticketWidth = pageWidth - marginX * 2;
  const ticketHeight = 318;
  const topY = 42;
  const bottomY = 432;
  const cutY = pageHeight / 2;

  drawTicket(doc, fonts, item, items, {
    x: marginX,
    y: topY,
    width: ticketWidth,
    height: ticketHeight
  });

  drawRule(doc, marginX, pageWidth - marginX, cutY, {
    color: "#222222",
    width: 0.8,
    dash: 8,
    space: 5
  });

  setFont(doc, fonts.regular, 9);
  doc.fillColor("#333333").text("Cut here", pageWidth - marginX - 52, cutY - 12, {
    width: 52,
    align: "right"
  });

  drawTicket(doc, fonts, item, items, {
    x: marginX,
    y: bottomY,
    width: ticketWidth,
    height: ticketHeight
  });

  if (options.includeAnswerKey !== false && item.hasAnswerKey !== false) {
    doc.addPage();
    drawAnswerKey(doc, fonts, item, items);
  }

  doc.end();
}

module.exports = {
  renderExitTicketPDF,
  __test: {
    GRADE2_EXIT_TICKET_LAYOUT,
    FOUR_UP_EXIT_TICKET_LAYOUT,
    isGrade2CompactExitTicket,
    isFourUpExitTicket,
    concisePrompt,
    inlineEquationParts
  }
};
