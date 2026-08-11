"use strict";

const path = require("path");

const COLORS = Object.freeze({
  text: "#1f2937",
  muted: "#57534e",
  rule: "#d6d3d1",
  answerRule: "#68788f"
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

function assessmentFonts(doc) {
  const fontsDir = path.join(__dirname, "..", "public", "fonts", "SourceSans3");
  const fonts = { regular: "SS3-Regular", bold: "SS3-Bold" };
  tryRegisterFont(doc, fonts.regular, path.join(fontsDir, "SourceSans3-Regular.ttf"));
  tryRegisterFont(doc, fonts.bold, path.join(fontsDir, "SourceSans3-Bold.ttf"));
  return fonts;
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
  doc.strokeColor(options.color || COLORS.rule);
  doc.lineWidth(Number(options.width || 0.7));
  if (options.dash) doc.dash(options.dash, { space: options.space || 4 });
  doc.moveTo(x1, y).lineTo(x2, y).stroke();
  doc.undash();
  doc.restore();
}

function inlineEquationParts(prompt) {
  const parts = safeStr(prompt).split(/_{2,}/);
  return {
    prefix: parts[0] || "",
    suffix: parts.slice(1).join("____") || ""
  };
}

function drawInlineEquation(doc, fonts, problem, box, options = {}) {
  const fontSize = Number(options.fontSize || 16);
  const targetWidth = Number(options.targetWidth || 58);
  const numberWidth = Number(options.numberWidth || 28);
  const { prefix, suffix } = inlineEquationParts(problem.prompt);
  const equationX = box.x + numberWidth;
  const equationWidth = Math.max(40, box.width - numberWidth);

  doc.save();
  setFont(doc, fonts.regular, 11);
  doc.fillColor(COLORS.text).text(`${options.number ?? problem.id ?? ""}.`, box.x, box.y + 3, {
    width: numberWidth - 4,
    align: "left",
    lineBreak: false
  });

  setFont(doc, fonts.regular, fontSize);
  const prefixWidth = doc.widthOfString(prefix);
  const suffixWidth = doc.widthOfString(suffix);
  const totalWidth = prefixWidth + targetWidth + suffixWidth;
  let cursorX = equationX + Math.max(0, (equationWidth - totalWidth) / 2);
  doc.text(prefix, cursorX, box.y, {
    width: Math.max(12, equationWidth),
    lineBreak: false
  });
  cursorX += prefixWidth;

  const lineY = box.y + fontSize + 5;
  drawRule(doc, cursorX, cursorX + targetWidth, lineY, {
    color: COLORS.answerRule,
    width: 1.05
  });
  if (options.showAnswer && problem.answer !== undefined && problem.answer !== null) {
    setFont(doc, fonts.bold, fontSize);
    doc.fillColor(COLORS.text).text(safeStr(problem.answer), cursorX, box.y - 1, {
      width: targetWidth,
      align: "center",
      lineBreak: false
    });
  }
  cursorX += targetWidth;
  setFont(doc, fonts.regular, fontSize);
  doc.fillColor(COLORS.text).text(suffix, cursorX, box.y, {
    width: Math.max(12, equationX + equationWidth - cursorX),
    lineBreak: false
  });
  doc.restore();

  return Object.freeze({
    prefix,
    suffix,
    targetWidth,
    usesSecondaryAnswerLine: false
  });
}

function footerText(item, options = {}) {
  return [
    item.gradeLabels?.[0] || "",
    item.subject || "Math",
    item.domain || "",
    options.resourceKindLabel || ""
  ]
    .filter(Boolean)
    .join(" • ");
}

function drawStandardFooter(doc, fonts, item, options = {}) {
  const left = 54;
  const width = 504;
  const y = 742;
  drawRule(doc, left, left + width, y, { color: COLORS.rule, width: 0.6 });
  setFont(doc, fonts.regular, 9);
  doc.fillColor(COLORS.muted).text(footerText(item, options), left, y + 8, {
    width,
    align: "center",
    lineBreak: false
  });
}

module.exports = {
  COLORS,
  assessmentFonts,
  setFont,
  drawRule,
  drawInlineEquation,
  drawStandardFooter,
  footerText,
  inlineEquationParts,
  safeStr
};
