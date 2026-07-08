'use strict';

const path = require("path");
const PDFDocument = require("pdfkit");

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

function renderExitTicketPDF({ res, item, contentObject, options = {} }) {
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
  renderExitTicketPDF
};
