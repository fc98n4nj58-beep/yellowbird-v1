'use strict';

const layout = require("../config/layout/layoutSpec.json");
const { pdfDesignTokens } = require("../config/layout/pdfDesignTokens");
const path = require("path");
const PDFDocument = require("pdfkit");

const MAX_PER_COLUMN = 30;

const VISUAL_LAYOUT = {
  paddingTop: 8,
  paddingBottom: 14,
  minTopGapAfterPrompt: 8,
  minBottomGapBeforeRule: 8,

  leftInset: 6,
  visualAnswerGap: 14,
  answerZoneRatio: 0.34,

  defaultMaxWidthRatio: 1.0,
  arrayMaxWidthRatio: 1.0,
  numberLineMaxWidthRatio: 1.0,
  tenFrameMaxWidthRatio: 1.0,
  baseTenMaxWidthRatio: 1.0,

  defaultTargetHeightRatio: 0.62,
  arrayTargetHeightRatio: 0.58,
  numberLineTargetHeightRatio: 0.42,
  tenFrameTargetHeightRatio: 0.52,
  baseTenTargetHeightRatio: 0.56,

  centerOffsetY: 0
};

function safeStr(v) { return (v ?? "").toString(); }
function isEquation(item) { return item && item.type === "equation"; }
function finiteOptionalNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function buildAnswerKeyItems(items) {
  return items.filter(isEquation).map((it) => ({
    id: it.id,
    prompt: safeStr(it.prompt),
    answer: it.answer,
    visual: it.visual || null,
    type: it.type || "equation",
    a: it.a,
    b: it.b,
    op: it.op,
    isExample: Boolean(it.isExample),
    value: finiteOptionalNumber(it.value),
    sequence: Array.isArray(it.sequence) ? it.sequence : null,
    missingIndex: finiteOptionalNumber(it.missingIndex),
    missingIndexes: Array.isArray(it.missingIndexes)
      ? it.missingIndexes.map(finiteOptionalNumber).filter((n) => n !== null)
      : null,
    step: finiteOptionalNumber(it.step),
  }));
}

function promptWithoutEquals(prompt) {
  return safeStr(prompt).replace(/\s*=\s*$/, "").trim();
}

function formatAnswerValue(answer) {
  if (Array.isArray(answer)) return answer.join(", ");
  return answer ?? "";
}

function filledAnswerText(prompt, answer) {
  const rawPrompt = promptWithoutEquals(prompt);
  const answerText = formatAnswerValue(answer);

  if (!rawPrompt.match(/_{2,}/)) {
    return `${rawPrompt} = ${answerText}`;
  }

  const parts = String(answerText).split(",").map((part) => part.trim());
  let fillIndex = 0;
  const filled = rawPrompt.replace(/_{2,}/g, () => {
    const value = parts[fillIndex] ?? answerText;
    fillIndex += 1;
    return value;
  });

  return filled;
}

function standardizeShortBlanks(prompt, display = {}) {
  if (!display.standardShortAnswerTarget) return prompt;
  const blankText = display.standardAnswerBlankText || "___";
  return safeStr(prompt).replace(/_{2,}/g, blankText);
}

function clampCols(n) {
  const v = parseInt(n ?? "", 10);
  const base = Number.isFinite(v) ? v : (layout.grid?.columns ?? 3);
  return Math.max(1, Math.min(4, base));
}

function tryRegisterFont(doc, name, filePath) {
  try { doc.registerFont(name, filePath); return true; } catch { return false; }
}

function setFont(doc, fontName, size) {
  try { doc.font(fontName).fontSize(size); } catch { doc.font("Helvetica").fontSize(size); }
}

function lineRule(doc, x1, x2, y, strokeWidth, color = "#000") {
  doc.save();
  doc.moveTo(x1, y).lineTo(x2, y).lineWidth(strokeWidth).strokeColor(color).stroke();
  doc.restore();
}

function headerDividerRule() {
  const r = layout.rules?.headerDivider || {};
  return { strokeWidth: (r.strokeWidth ?? 0.25), color: (r.color ?? "#000") };
}
function footerRule() {
  const r = layout.rules?.footerRule || layout.rules?.headerDivider || {};
  return { strokeWidth: (r.strokeWidth ?? 0.25), color: (r.color ?? "#000") };
}
function nameDateRule() {
  const r = layout.rules?.nameDateLine || layout.rules?.headerDivider || {};
  return { strokeWidth: (r.strokeWidth ?? 0.25), color: (r.color ?? "#000") };
}

function drawTenFramePrimitive(doc, x, y, opts = {}) {
  const filled = Number(opts.filled ?? 0);
  const cellSize = Number(opts.cellSize ?? 22);
  const cellGap = Number(opts.cellGap ?? 0);
  const frameGap = Number(opts.frameGap ?? 8);
  const frames = Math.max(1, Number(opts.frames ?? 1));

  const cols = 5;
  const rows = 2;
  const frameWidth = cols * cellSize + (cols - 1) * cellGap;
  const frameHeight = rows * cellSize + (rows - 1) * cellGap;
  const framesPerRow = Math.max(1, Math.ceil(frames / 2));

  doc.save();
  doc.lineWidth(1);
  doc.strokeColor("#6b7280");
  doc.fillColor("#6b7280");

  let remaining = filled;

  for (let f = 0; f < frames; f++) {
    const frameRow = Math.floor(f / framesPerRow);
    const frameCol = f % framesPerRow;
    const frameX = x + frameCol * (frameWidth + frameGap);
    const frameY = y + frameRow * (frameHeight + frameGap);

    for (let i = 0; i < 10; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;

      const cellX = frameX + col * (cellSize + cellGap);
      const cellY = frameY + row * (cellSize + cellGap);

      doc.rect(cellX, cellY, cellSize, cellSize).stroke();

      const cx = cellX + cellSize / 2;
      const cy = cellY + cellSize / 2;
      const r = cellSize * 0.28;

      doc.circle(cx, cy, r);

      if (remaining > 0) {
        doc.fillAndStroke("#6b7280", "#6b7280");
        remaining--;
      } else {
        doc.fillAndStroke("#ffffff", "#6b7280");
      }
    }
  }

  doc.restore();

  return Math.ceil(frames / framesPerRow) * frameHeight +
    Math.max(0, Math.ceil(frames / framesPerRow) - 1) * frameGap;
}

function drawNumberLinePrimitive(doc, x, y, opts = {}) {
  
  const min = Number(opts.min ?? opts.start ?? 0);
  const max = Number(opts.max ?? opts.end ?? 10);
  const value = Number(opts.value ?? opts.highlight ?? min);

  const width = Number(opts.width || 180);
  const height = Number(opts.height || 34);

  const lineY = y + height * 0.55;
  const startX = x;
  const endX = x + width;
  const steps = Math.max(1, max - min);
  const stepWidth = width / steps;

  doc.save();

doc.strokeColor("#111111");
doc.fillColor("#111111");
doc.lineWidth(1);

  doc.moveTo(startX, lineY);
  doc.lineTo(endX, lineY);
  doc.stroke();

  const labelEvery = steps > 20 ? 5 : steps > 10 ? 2 : 1;
  const hideValueLabel = Boolean(opts.hideValueLabel);

  for (let i = 0; i <= steps; i++) {
    const tickX = startX + i * stepWidth;
    const tickValue = min + i;

    doc.moveTo(tickX, lineY - 5);
    doc.lineTo(tickX, lineY + 5);
    doc.stroke();

    const isTargetValue = tickValue === value;
    const shouldLabel = i === 0 || i === steps || i % labelEvery === 0 || isTargetValue;

    if (shouldLabel && !(hideValueLabel && isTargetValue)) {
      doc.fontSize(8);
      doc.text(String(tickValue), tickX - 9, lineY + 8, {
        width: 18,
        align: "center"
      });
    }
  }

  const clamped = Math.max(min, Math.min(max, value));
  const dotX = startX + (clamped - min) * stepWidth;
  
  // fill (light grey)
doc.fillColor("#acacac");

// stroke (black border)
doc.strokeColor("#111111");

// draw both
doc.circle(dotX, lineY, 3.2).fillAndStroke();

  doc.restore();

  return {
    dotX,
    lineY
  };
}

function drawBaseTenBlocksPrimitive(doc, x, y, opts = {}) {
  const hundreds = Math.max(0, Number(opts.hundreds ?? 0));
  const tens = Math.max(0, Number(opts.tens ?? 0));
  const ones = Math.max(0, Number(opts.ones ?? 0));

  const unit = Number(opts.unit ?? 6);
  const rodLength = Number(opts.rodLength ?? unit * 10);
  const flatSize = Number(opts.flatSize ?? unit * 10);
  const gap = Number(opts.gap ?? 4);
  const groupGap = Number(opts.groupGap ?? 10);

  doc.save();
  doc.lineWidth(1);
  doc.strokeColor("#6b7280");
  doc.fillColor("#f1f5f9");

  let cursorX = x;
  let maxHeight = 0;

  if (hundreds > 0) {
    const cols = Math.min(hundreds, 2);
    const rows = Math.ceil(hundreds / cols);

    for (let i = 0; i < hundreds; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const fx = cursorX + col * (flatSize + gap);
      const fy = y + row * (flatSize + gap);

      doc.rect(fx, fy, flatSize, flatSize).fillAndStroke();

      for (let gx = 1; gx < 10; gx++) {
        const xx = fx + gx * (flatSize / 10);
        doc.moveTo(xx, fy).lineTo(xx, fy + flatSize).stroke();
      }
      for (let gy = 1; gy < 10; gy++) {
        const yy = fy + gy * (flatSize / 10);
        doc.moveTo(fx, yy).lineTo(fx + flatSize, yy).stroke();
      }
    }

    const blockWidth = cols * flatSize + (cols - 1) * gap;
    const blockHeight = rows * flatSize + (rows - 1) * gap;
    cursorX += blockWidth + groupGap;
    maxHeight = Math.max(maxHeight, blockHeight);
  }

  if (tens > 0) {
    for (let i = 0; i < tens; i++) {
      const rx = cursorX + i * (unit + gap);
      const ry = y;

      doc.rect(rx, ry, unit, rodLength).fillAndStroke();

      for (let j = 1; j < 10; j++) {
        const yy = ry + j * (rodLength / 10);
        doc.moveTo(rx, yy).lineTo(rx + unit, yy).stroke();
      }
    }

    const rodsWidth = tens * unit + Math.max(0, tens - 1) * gap;
    maxHeight = Math.max(maxHeight, rodLength);
    cursorX += rodsWidth + (ones > 0 ? groupGap : 0);
  }

  if (ones > 0) {
    const maxRows = 5;
    const cols = Math.ceil(ones / maxRows);

    for (let i = 0; i < ones; i++) {
      const col = Math.floor(i / maxRows);
      const row = i % maxRows;
      const ox = cursorX + col * (unit + gap);
      const oy = y + row * (unit + gap);

      doc.rect(ox, oy, unit, unit).fillAndStroke();
    }

    const onesRows = Math.min(ones, maxRows);
    const onesHeight = onesRows * unit + Math.max(0, onesRows - 1) * gap;
    maxHeight = Math.max(maxHeight, onesHeight);
  }

  doc.restore();
  return maxHeight;
}

function drawArrayPrimitive(doc, x, y, opts = {}) {
  const rows = Math.max(1, Number(opts.rows || 1));
  const cols = Math.max(1, Number(opts.cols || 1));
  const cellSize = Number(opts.cellSize || 9);
  const gap = Number(opts.gap || 2);
  const r = Number(opts.r || 2.6);

  doc.save();
  doc.fillColor("#6b7280");

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = x + col * (cellSize + gap) + cellSize / 2;
      const cy = y + row * (cellSize + gap) + cellSize / 2;
      doc.circle(cx, cy, r).fill();
    }
  }

  doc.restore();
}

function measureArrayVisual(data = {}, maxWidth, targetHeight) {
  const rows = Math.max(1, Number(data.rows || 1));
  const cols = Math.max(1, Number(data.cols || 1));

  let cellSize = 9;
  let gap = 2;
  let dotRadius = 2.6;

  let width = cols * cellSize + (cols - 1) * gap;
  let height = rows * cellSize + (rows - 1) * gap;

  const widthScale = maxWidth > 0 ? Math.min(1, maxWidth / width) : 1;
  const heightScale = targetHeight > 0 ? Math.min(1, targetHeight / height) : 1;
  const scale = Math.min(widthScale, heightScale, 1);

  cellSize *= scale;
  gap *= scale;
  dotRadius *= scale;

  width = cols * cellSize + (cols - 1) * gap;
  height = rows * cellSize + (rows - 1) * gap;

  return {
    width,
    height,
    cellSize,
    gap,
    dotRadius
  };
}

function measureTenFrameVisual(data = {}, maxWidth, targetHeight) {
  const frameCount = Math.max(1, Number(data.frames || 1));
  const cellSizeBase = 10;
  const cellGapBase = 0;
  const frameGapBase = 8;

  const singleFrameWidth = cellSizeBase * 5 + cellGapBase * 4;
  const singleFrameHeight = cellSizeBase * 2 + cellGapBase;
  const framesPerRow = Math.max(1, Math.ceil(frameCount / 2));
  const frameRows = Math.ceil(frameCount / framesPerRow);
  const widthBase = framesPerRow * singleFrameWidth + (framesPerRow - 1) * frameGapBase;
  const heightBase = frameRows * singleFrameHeight + (frameRows - 1) * frameGapBase;

  return {
    width: widthBase,
    height: heightBase,
    cellSize: cellSizeBase,
    cellGap: cellGapBase,
    frameGap: frameGapBase
  };
}

function measureNumberLineVisual(data = {}, maxWidth, targetHeight) {
  const minVal = Number(data.min ?? 0);
  const maxVal = Number(data.max ?? 10);
  const steps = Math.max(1, maxVal - minVal);

  const desiredWidth = Math.min(maxWidth, Math.max(120, steps * 22));
  const height = Math.min(targetHeight, 34);

  return {
    width: desiredWidth,
    height
  };
}

function measureBaseTenVisual(data = {}, maxWidth, targetHeight) {
  const hundreds = Math.max(0, Number(data.hundreds || 0));
  const tens = Math.max(0, Number(data.tens || 0));
  const ones = Math.max(0, Number(data.ones || 0));

  const unit = 5;
  const rodLength = unit * 10;
  const flatSize = unit * 10;
  const gap = 4;
  const groupGap = 10;

  let width = 0;
  let height = 0;

  if (hundreds > 0) {
    const cols = Math.min(hundreds, 2);
    const rows = Math.ceil(hundreds / cols);
    const hundredsWidth = cols * flatSize + (cols - 1) * gap;
    const hundredsHeight = rows * flatSize + (rows - 1) * gap;

    width += hundredsWidth;
    height = Math.max(height, hundredsHeight);

    if (tens > 0 || ones > 0) width += groupGap;
  }

  if (tens > 0) {
    const tensWidth = tens * unit + Math.max(0, tens - 1) * gap;
    width += tensWidth;
    height = Math.max(height, rodLength);

    if (ones > 0) width += groupGap;
  }

  if (ones > 0) {
    const maxRows = 5;
    const cols = Math.ceil(ones / maxRows);
    const rows = Math.min(ones, maxRows);

    const onesWidth = cols * unit + Math.max(0, cols - 1) * gap;
    const onesHeight = rows * unit + Math.max(0, rows - 1) * gap;

    width += onesWidth;
    height = Math.max(height, onesHeight);
  }

  return {
    width,
    height,
    unit,
    rodLength,
    flatSize,
    gap,
    groupGap
  };
}

function measureVisual(visual, maxWidth, targetHeight) {
  if (!visual?.kind) return null;

 if (visual.kind === "array" || visual.kind === "arrays") {
    return measureArrayVisual(visual.data, maxWidth, targetHeight);
  }

  if (visual.kind === "ten_frame") {
    return measureTenFrameVisual(visual.data, maxWidth, targetHeight);
  }

  if (visual.kind === "number_line") {
    return measureNumberLineVisual(visual.data, maxWidth, targetHeight);
  }

  if (visual.kind === "base_ten_blocks") {
    return measureBaseTenVisual(visual.data, maxWidth, targetHeight);
  }

  return null;
}

function getVisualKindConfig(kind) {
  if (kind === "array" || kind === "arrays") {
    return {
      maxWidthRatio: VISUAL_LAYOUT.arrayMaxWidthRatio,
      targetHeightRatio: VISUAL_LAYOUT.arrayTargetHeightRatio
    };
  }

  if (kind === "number_line") {
    return {
      maxWidthRatio: VISUAL_LAYOUT.numberLineMaxWidthRatio,
      targetHeightRatio: VISUAL_LAYOUT.numberLineTargetHeightRatio
    };
  }

  if (kind === "ten_frame") {
    return {
      maxWidthRatio: VISUAL_LAYOUT.tenFrameMaxWidthRatio,
      targetHeightRatio: VISUAL_LAYOUT.tenFrameTargetHeightRatio
    };
  }

  if (kind === "base_ten_blocks") {
    return {
      maxWidthRatio: VISUAL_LAYOUT.baseTenMaxWidthRatio,
      targetHeightRatio: VISUAL_LAYOUT.baseTenTargetHeightRatio
    };
  }

  return {
    maxWidthRatio: VISUAL_LAYOUT.defaultMaxWidthRatio,
    targetHeightRatio: VISUAL_LAYOUT.defaultTargetHeightRatio
  };
}

function getVisualRegion({
  cellBottomY,
  promptBottomY,
  cellX,
  cellWidth,
  visualKind,
  fullWidth = false
}) {
  const kindConfig = getVisualKindConfig(visualKind);

  const topY =
    promptBottomY +
    VISUAL_LAYOUT.minTopGapAfterPrompt +
    VISUAL_LAYOUT.paddingTop;

  const bottomY =
    cellBottomY -
    VISUAL_LAYOUT.minBottomGapBeforeRule -
    VISUAL_LAYOUT.paddingBottom;

  const height = Math.max(0, bottomY - topY);

  const answerZoneWidth = fullWidth ? 0 : cellWidth * VISUAL_LAYOUT.answerZoneRatio;
  const visualZoneWidth =
    cellWidth -
    answerZoneWidth -
    (fullWidth ? 0 : VISUAL_LAYOUT.visualAnswerGap) -
    VISUAL_LAYOUT.leftInset;

  const visualX = cellX + VISUAL_LAYOUT.leftInset;

  const maxWidth = Math.max(0, visualZoneWidth) * kindConfig.maxWidthRatio;
  const targetHeight = height * kindConfig.targetHeightRatio;

  return {
    x: visualX,
    width: Math.max(0, visualZoneWidth),
    topY,
    bottomY,
    height,
    maxWidth,
    targetHeight,
    centerY: topY + height / 2,

    answerX: visualX + visualZoneWidth + VISUAL_LAYOUT.visualAnswerGap,
    answerWidth: Math.max(0, answerZoneWidth - VISUAL_LAYOUT.leftInset)
  };
}

function placeVisualInRegion(region, measured) {
  if (!region || !measured) return null;

  const x = region.x;
  const y =
    region.topY +
    (region.height - measured.height) / 2 +
    VISUAL_LAYOUT.centerOffsetY;

  return { x, y };
}

function placeVisualInRegionWithDisplay(region, measured, display = {}) {
  if (!region || !measured) return null;

  const x = region.x;
  let y =
    region.topY +
    (region.height - measured.height) / 2 +
    VISUAL_LAYOUT.centerOffsetY;

  if (display.visualVerticalAlign === "topThird") {
    y = region.topY + Math.max(4, region.height * 0.18);
  }

  if (display.numberLineRowGeometry) {
    y = region.topY + Math.max(4, region.height * 0.34 - measured.height * 0.55);
  }

  return { x, y };
}

function drawAnswerLine(doc, region, options = {}) {
  if (!region || region.answerWidth <= 20) return null;

  const lineY = region.topY + region.height * 0.95;
  const lineStartX = region.answerX;
  const lineWidth = options.short ? region.answerWidth * 0.5 : region.answerWidth;
  const lineEndX = region.answerX + lineWidth;

  doc.save();
  doc.strokeColor(pdfDesignTokens.colors.answerRule);
  doc.lineWidth(0.8);
  doc.moveTo(lineStartX, lineY);
  doc.lineTo(lineEndX, lineY);
  doc.stroke();
  doc.restore();

  return {
    x: lineStartX,
    y: lineY,
    width: lineWidth
  };
}

function drawShortAnswerLine(doc, x, y, width = 42) {
  doc.save();
  doc.strokeColor(pdfDesignTokens.colors.answerRule);
  doc.lineWidth(0.8);
  doc.moveTo(x, y).lineTo(x + width, y).stroke();
  doc.restore();
}

function drawTextOnLine(doc, text, x, y, width, fonts = {}, options = {}) {
  doc.save();
  const fontSize = Number(options.fontSize || 12);
  setFont(doc, fonts.bold || fonts.regular || "Helvetica", fontSize);
  doc.fillColor(pdfDesignTokens.colors.text);
  const align = options.align || "center";
  const inset = align === "left" ? 4 : 0;
  doc.text(formatAnswerValue(text), x + inset, y - fontSize - 2, {
    width: Math.max(20, width - inset * 2),
    align,
    lineBreak: false
  });
  doc.restore();
}

function drawTextInSequenceCell(doc, text, x, y, width, fonts = {}, options = {}) {
  doc.save();
  const fontSize = Number(options.fontSize || 12);
  setFont(doc, fonts.bold || fonts.regular || "Helvetica", fontSize);
  doc.fillColor(pdfDesignTokens.colors.text);
  doc.text(formatAnswerValue(text), x, y, {
    width: Math.max(20, width),
    align: "center",
    lineBreak: false
  });
  doc.restore();
}

function drawFittedAnswerOnLine(doc, text, x, y, width, fonts = {}, options = {}) {
  let answerText = formatAnswerValue(text);
  const align = options.align || "left";
  const minFontSize = Number(options.minFontSize || 8.5);
  let fontSize = Number(options.fontSize || 12);

  setFont(doc, fonts.bold || fonts.regular || "Helvetica", fontSize);
  if (
    options.compactOperators &&
    doc.widthOfString(answerText) > width - 8
  ) {
    const compactText = String(answerText).replace(/\s*\+\s*/g, "+");
    if (doc.widthOfString(compactText) <= doc.widthOfString(answerText)) {
      answerText = compactText;
    }
  }

  while (fontSize > minFontSize && doc.widthOfString(answerText) > width - 8) {
    fontSize -= 0.5;
    setFont(doc, fonts.bold || fonts.regular || "Helvetica", fontSize);
  }

  drawTextOnLine(doc, answerText, x, y, width, fonts, {
    align,
    fontSize
  });
}

function restoreAnswerSurroundingTextStyle(doc, fonts = {}, size = 12) {
  setFont(doc, fonts.regular || "Helvetica", size);
  doc.fillColor(pdfDesignTokens.colors.text);
}

function splitAnswerParts(answer) {
  return String(formatAnswerValue(answer))
    .split(",")
    .map((part) => part.trim());
}

function drawInlineAnswerPrompt(doc, promptText, answers, x, y, width, fonts = {}, display = {}) {
  const parts = String(promptText || "").split(/_{2,}/);
  const answerParts = Array.isArray(answers) ? answers : splitAnswerParts(answers);
  const requestedBlankWidth = Number(display.standardAnswerLineWidth || 0);
  const defaultBlankWidth = Math.max(24, doc.widthOfString(display.standardAnswerBlankText || "___") + 8);
  const blankWidth = Math.max(defaultBlankWidth, requestedBlankWidth || 0);
  const shouldDrawAnswers = display.inlineAnswerValues !== false;
  const shouldDrawAnswerLine = display.standardAnswerLineVisible !== false;
  let cursorX = x;

  setFont(doc, fonts.regular || "Helvetica", 12);
  doc.fillColor(pdfDesignTokens.colors.text);

  parts.forEach((part, index) => {
    if (part) {
      const remainingWidth = Math.max(12, x + width - cursorX);
      doc.text(part, cursorX, y, {
        width: remainingWidth,
        align: "left",
        lineBreak: false
      });
      cursorX += doc.widthOfString(part);
    }

    if (index < parts.length - 1) {
      const answerText = answerParts[index] ?? answerParts[0] ?? "";
      const lineY = y + (layout.typography.body?.lineHeight || 14);
      const safeBlankWidth = Math.max(24, Math.min(blankWidth, x + width - cursorX - 2));

      if (shouldDrawAnswerLine) {
        drawShortAnswerLine(doc, cursorX, lineY, safeBlankWidth);
      }
      if (shouldDrawAnswers && answerText !== "") {
        if (shouldDrawAnswerLine) {
          drawTextOnLine(doc, answerText, cursorX, lineY, safeBlankWidth, fonts);
        } else {
          doc.save();
          setFont(doc, fonts.bold || fonts.regular || "Helvetica", 12);
          doc.fillColor(pdfDesignTokens.colors.text);
          doc.text(answerText, cursorX, y, {
            width: safeBlankWidth,
            align: "center",
            lineBreak: false
          });
          doc.restore();
        }
        restoreAnswerSurroundingTextStyle(doc, fonts, 12);
      }
      cursorX += safeBlankWidth;
    }
  });
}

function drawJumpArrow(doc, startX, endX, y, index, count) {
  const ratio = count <= 1 ? 0 : index / (count - 1);
  const gray = Math.round(35 + ratio * 95);
  const hex = gray.toString(16).padStart(2, "0");
  const color = `#${hex}${hex}${hex}`;
  const jumpWidth = Math.max(1, endX - startX);
  const gap = Math.min(8, jumpWidth * 0.18);
  const arrowStartX = startX + gap;
  const arrowEndX = endX - gap;
  const peakY = y - 12;
  const endY = y;
  const control2X = arrowStartX + (arrowEndX - arrowStartX) * 0.75;
  const control2Y = peakY;
  const tangentX = arrowEndX - control2X;
  const tangentY = endY - control2Y;
  const angle = Math.atan2(tangentY, tangentX);
  const head = 6;
  const spread = Math.PI / 7;
  const leftX = arrowEndX - head * Math.cos(angle - spread);
  const leftY = endY - head * Math.sin(angle - spread);
  const rightX = arrowEndX - head * Math.cos(angle + spread);
  const rightY = endY - head * Math.sin(angle + spread);

  doc.save();
  doc.strokeColor(color);
  doc.fillColor(color);
  doc.lineWidth(Math.max(0.7, 1.15 - ratio * 0.25));
  doc.moveTo(arrowStartX, endY)
    .bezierCurveTo(
      arrowStartX + (arrowEndX - arrowStartX) * 0.25,
      peakY,
      control2X,
      control2Y,
      arrowEndX,
      endY
    )
    .stroke();
  doc.moveTo(arrowEndX, endY)
    .lineTo(leftX, leftY)
    .lineTo(rightX, rightY)
    .fill();
  doc.restore();
}

function renderCompactExpandedFormRow(doc, question, x, y, width, fonts = {}, options = {}) {
  const safeX = Number.isFinite(Number(x)) ? Number(x) : layout.page.contentBox.x;
  const safeY = Number.isFinite(Number(y)) ? Number(y) : layout.page.contentBox.y;
  const safeWidth = Number.isFinite(Number(width)) && Number(width) > 0
    ? Number(width)
    : layout.page.contentBox.width;
  const numberWidth = 24;
  const gutterWidth = 36;
  const numeral = formatAnswerValue(question.value ?? question.prompt ?? "");
  const measuredNumeralWidth = Number(doc.widthOfString(numeral));
  const numeralWidth = Math.min(44, Math.max(28, (Number.isFinite(measuredNumeralWidth) ? measuredNumeralWidth : 28) + 6));
  const lineX = safeX + gutterWidth + numeralWidth + 6;
  const lineWidth = Math.max(44, safeWidth - gutterWidth - numeralWidth - 8);
  const lineY = safeY + 15;

  doc.text(`${question.id ?? ""})`.trim(), safeX, safeY + 2, {
    width: numberWidth,
    align: "left",
    lineBreak: false
  });
  doc.text(numeral, safeX + gutterWidth, safeY + 2, {
    width: numeralWidth,
    align: "left",
    lineBreak: false
  });

  drawShortAnswerLine(doc, lineX, lineY, lineWidth);

  if ((options.answerKey || options.isExample) && question.answer != null) {
    drawFittedAnswerOnLine(doc, question.answer, lineX, lineY, lineWidth, fonts, {
      align: "left",
      fontSize: 11,
      minFontSize: 8.5,
      compactOperators: true
    });
    restoreAnswerSurroundingTextStyle(doc, fonts, 12);
  }

  return Math.max(18, layout.typography.body?.lineHeight || 16);
}

function renderSkipCountingRow(doc, question, x, y, width, fonts = {}, options = {}) {
  const sequence = Array.isArray(question.sequence) ? question.sequence : [];
  if (!sequence.length) return 0;

  const numberWidth = 28;
  const labelWidth = 42;
  const rowX = x + numberWidth + labelWidth;
  const rowWidth = Math.max(120, width - numberWidth - labelWidth);
  const itemCount = sequence.length;
  const gap = itemCount >= 13 ? 2 : 4;
  const cellWidth = Math.max(24, Math.min(58, (rowWidth - gap * (itemCount - 1)) / itemCount));
  const cellHeight = options.skipCountingArrows ? 36 : 24;
  const textY = y + (options.skipCountingArrows ? 15 : 3);
  const arrowY = y + 10;
  const lineY = textY + 19;
  const missingIndexes = Array.isArray(question.missingIndexes) && question.missingIndexes.length
    ? question.missingIndexes
    : [
        Number.isFinite(Number(question.missingIndex))
          ? Number(question.missingIndex)
          : itemCount - 1
      ];
  const missingSet = new Set(missingIndexes);
  const answers = Array.isArray(question.answer) ? question.answer : [question.answer];

  doc.text(`${question.id ?? ""})`.trim(), x, textY, {
    width: numberWidth - 4,
    align: "left",
    lineBreak: false
  });
  doc.text(`By ${question.step || ""}:`, x + numberWidth, textY, {
    width: labelWidth - 6,
    align: "left",
    lineBreak: false
  });

  if (options.skipCountingArrows) {
    for (let index = 0; index < itemCount - 1; index += 1) {
      const startX = rowX + index * (cellWidth + gap) + cellWidth / 2;
      const endX = rowX + (index + 1) * (cellWidth + gap) + cellWidth / 2;
      drawJumpArrow(doc, startX, endX, arrowY, index, itemCount - 1);
    }
  }

  sequence.forEach((value, index) => {
    const cellX = rowX + index * (cellWidth + gap);

    if (missingSet.has(index)) {
      drawShortAnswerLine(doc, cellX, lineY, cellWidth);
      if ((options.answerKey || options.isExample) && answers.length) {
        const answerIndex = missingIndexes.indexOf(index);
        drawTextInSequenceCell(doc, answers[answerIndex] ?? answers[0], cellX, textY, cellWidth, fonts, {
          fontSize: cellWidth < 30 ? 10 : 12
        });
        restoreAnswerSurroundingTextStyle(doc, fonts, 12);
      }
      return;
    }

    doc.text(formatAnswerValue(value), cellX, textY, {
      width: cellWidth,
      align: "center",
      lineBreak: false
    });
  });

  return cellHeight;
}

function drawWorkSpace(doc, x, y, width, lineCount = 2) {
  const lines = Math.max(0, Number(lineCount) || 0);
  if (!lines) return 0;

  const gap = 22;
  doc.save();
  doc.strokeColor(pdfDesignTokens.colors.answerRule);
  doc.lineWidth(0.8);
  for (let i = 0; i < lines; i += 1) {
    const lineY = y + i * gap;
    doc.moveTo(x, lineY).lineTo(x + width, lineY).stroke();
  }
  doc.restore();

  return lines * gap;
}

function drawWorkBox(doc, x, y, width, height) {
  const boxHeight = Math.max(36, height);

  doc.save();
  doc.strokeColor(pdfDesignTokens.colors.answerRule);
  doc.lineWidth(0.8);
  doc.rect(x, y, width, boxHeight).stroke();
  doc.restore();

  return boxHeight;
}

function renderFactFamilyGrid(doc, promptText, x, y, width, fonts = {}, options = {}) {
  const lines = safeStr(promptText)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const answerParts = splitAnswerParts(options.answer);

  if (lines.length < 2) return 0;

  const isSubtractionOnly = lines.length === 2 && lines.every((line) => line.includes(" - "));
  const isStackedAnswerKey = Boolean(options.answerKey);
  const rowHeight = isSubtractionOnly || isStackedAnswerKey ? 22 : 30;
  const gridTop = y;
  const colWidth = width / 2;
  const rowCount = isStackedAnswerKey
    ? lines.length
    : lines.length >= 4 || isSubtractionOnly
      ? 2
      : 1;
  const gridHeight = rowHeight * rowCount;

  setFont(doc, fonts.regular || "Helvetica", lines.length < 4 ? 11 : 10.5);
  doc.fillColor(pdfDesignTokens.colors.text);

  lines.slice(0, 4).forEach((line, index) => {
    const col = isSubtractionOnly || isStackedAnswerKey ? 0 : index % 2;
    const row = isSubtractionOnly || isStackedAnswerKey ? index : Math.floor(index / 2);
    const lineX = x + col * colWidth + 2;
    const lineWidth = isSubtractionOnly || isStackedAnswerKey ? width - 4 : colWidth - 4;

    if (options.answerKey && line.match(/_{2,}/)) {
      drawInlineAnswerPrompt(
        doc,
        standardizeShortBlanks(line, { standardShortAnswerTarget: true }),
        [answerParts[index] ?? answerParts[0] ?? ""],
        lineX,
        gridTop + row * rowHeight + 5,
        lineWidth,
        fonts
      );
    } else {
      doc.text(line, lineX, gridTop + row * rowHeight + 5, {
        width: lineWidth,
        align: "left",
        lineBreak: false
      });
    }
  });

  return gridHeight;
}

function renderQuestionItem(doc, question, layoutBox, fonts = {}, display = {}) {
  if (doc._ended) return 0;

  const {
    x,
    y,
    width,
    height,
    dividerY
  } = layoutBox;

  const isExample = Boolean(display.includeExample && question.isExample && !display.answerKey);
  const rawPromptBase = isExample &&
    question.answer != null &&
    !question.visual &&
    !display.workSpaceBox &&
    !display.writingLine &&
    !display.standardShortAnswerTarget &&
    !display.factFamilyGrid &&
    !display.skipCountingRow
    ? filledAnswerText(question.prompt || question.text || "", question.answer)
    : question.prompt || question.text || "";
  const rawPrompt = standardizeShortBlanks(rawPromptBase, display);
  const numberPrefix = question.id != null ? `${question.id})  ` : "";
  const hidePrompt = Boolean(display.hideItemPrompts && question.visual);
  const promptText = `${numberPrefix}${hidePrompt ? "" : rawPrompt}`.trim();
  const hasInlineAnswerBlank = Boolean(promptText.match(/_{2,}/));
  const visual = question.visual || null;

  const promptX = x;
  const promptY = y;
  const promptWidth = width;

  doc.fillColor("#111827");
  doc.font(fonts.regular || "Helvetica");
  doc.fontSize(12);

  if (isExample) {
    setFont(doc, fonts.lightItalic || fonts.regular || "Helvetica", 9);
    doc.fillColor(pdfDesignTokens.colors.muted);
    doc.text(display.workSpaceBox ? "Worked Example" : "Example", x, y - 11, {
      width,
      align: "left",
      lineBreak: false
    });
    setFont(doc, fonts.regular || "Helvetica", 12);
    doc.fillColor("#111827");
  }

  const promptHeight = doc.heightOfString(promptText, {
    width: promptWidth,
    align: "left"
  });

  if (display.factFamilyGrid && !visual?.kind) {
    doc.text(numberPrefix.trim(), promptX, promptY, {
      width: 34,
      align: "left",
      lineBreak: false
    });

    const gridHeight = renderFactFamilyGrid(
      doc,
      rawPrompt,
      promptX + 34,
      promptY,
      promptWidth - 34,
      fonts,
      {
        answerKey: Boolean(display.answerKey || isExample),
        answer: question.answer
      }
    );

    return Math.max(gridHeight, layout.typography.body?.lineHeight || 16);
  }

  if (display.skipCountingRow && !visual?.kind && Array.isArray(question.sequence)) {
    const rowHeight = renderSkipCountingRow(
      doc,
      question,
      promptX,
      promptY,
      promptWidth,
      fonts,
      {
        answerKey: Boolean(display.answerKey),
        isExample,
        skipCountingArrows: Boolean(display.skipCountingArrows)
      }
    );

    return Math.max(rowHeight, layout.typography.body?.lineHeight || 16);
  }

  if (display.compactExpandedForm && !visual?.kind) {
    const rowHeight = renderCompactExpandedFormRow(
      doc,
      question,
      promptX,
      promptY,
      promptWidth,
      fonts,
      {
        answerKey: Boolean(display.answerKey),
        isExample
      }
    );

    return Math.max(rowHeight, layout.typography.body?.lineHeight || 16);
  }

  if (!visual?.kind && display.writingLine) {
    const lineHeight = layout.typography.body?.lineHeight || 16;
    const lineY = display.answerLineBelowPrompt
      ? promptY + promptHeight + 18
      : promptY + lineHeight;
    const lineWidth = display.shortWritingLine
      ? Number(display.reverseNumberWordLineWidth || 46)
      : null;
    const numberWidth = display.reverseNumberWordWriting ? 24 : 44;
    const promptZoneWidth = display.reverseNumberWordWriting
      ? Math.min(
        Math.max(48, Number(display.reverseNumberWordPromptZoneWidth || 56)),
        Math.max(48, width - numberWidth - lineWidth - 10)
      )
      : null;
    const lineStartX = display.reverseNumberWordWriting
      ? x + numberWidth + promptZoneWidth + 6
      : display.shortWritingLine
        ? x + width - lineWidth
        : display.answerLineBelowPrompt
          ? x + numberWidth
          : x + Math.min(88, width * 0.18);
    const lineEndX = display.shortWritingLine
      ? lineStartX + lineWidth
      : x + width;

    if (display.reverseNumberWordWriting) {
      const wordX = x + numberWidth;
      const wordWidth = Math.max(24, promptZoneWidth);

      doc.text(numberPrefix.trim(), x, promptY, {
        width: numberWidth - 2,
        align: "left",
        lineBreak: false
      });
      doc.text(rawPrompt, wordX, promptY, {
        width: wordWidth,
        align: "left",
        lineBreak: false,
        ellipsis: false
      });
    } else {
      const numberWidth = 44;
      doc.text(numberPrefix.trim(), x, promptY, {
        width: numberWidth - 4,
        align: "left",
        lineBreak: false
      });
      doc.text(rawPrompt, x + numberWidth, promptY, {
        width: Math.max(20, width - numberWidth),
        align: "left",
        lineBreak: false
      });
    }

    doc.save();
    doc.strokeColor(pdfDesignTokens.colors.answerRule);
    doc.lineWidth(0.8);
    doc.moveTo(lineStartX, lineY).lineTo(lineEndX, lineY).stroke();

    if ((display.answerKey || isExample) && question.answer != null) {
      drawTextOnLine(
        doc,
        question.answer,
        lineStartX,
        lineY,
        lineEndX - lineStartX,
        fonts,
        {
          align: display.reverseNumberWordWriting ? "center" : "left"
        }
      );
    }
    doc.restore();

    return Math.max(
      display.answerLineBelowPrompt ? promptHeight + 28 : promptHeight,
      lineHeight
    );
  }

  if (!visual?.kind && display.standardShortAnswerTarget && hasInlineAnswerBlank) {
    drawInlineAnswerPrompt(
      doc,
      promptText,
      question.answer,
      promptX,
      promptY,
      promptWidth,
      fonts,
      {
        ...display,
        inlineAnswerValues: Boolean(display.answerKey || isExample)
      }
    );
  } else if ((display.answerKey || isExample) && question.answer != null && hasInlineAnswerBlank) {
    drawInlineAnswerPrompt(
      doc,
      promptText,
      question.answer,
      promptX,
      promptY,
      promptWidth,
      fonts,
      display
    );
  } else {
    doc.text(promptText, promptX, promptY, {
      width: promptWidth,
      align: "left"
    });
  }

  const promptBottomY = promptY + promptHeight;
  const cellBottomY = y + height;

  if (visual?.kind && !doc._ended) {
    const visualCellX = hidePrompt ? x + 34 : x;
    const visualCellWidth = hidePrompt ? Math.max(40, width - 34) : width;
    const fullWidthVisual = Boolean(display.numberLineAnswerUnderTarget && visual.kind === "number_line");
    const region = getVisualRegion({
      cellBottomY,
      promptBottomY,
      cellX: visualCellX,
      cellWidth: visualCellWidth,
      visualKind: visual.kind,
      fullWidth: fullWidthVisual
    });

    const measured = measureVisual(
      visual,
      region.maxWidth,
      region.targetHeight
    );

    const placed = placeVisualInRegionWithDisplay(region, measured, display);

    if (measured && placed) {
      try {
        const renderMeta = renderVisualByKind(doc, visual, placed, measured);

        if (visual.kind === "number_line" && display.numberLineAnswerUnderTarget && renderMeta?.dotX) {
          const answerWidth = 42;
          const pageBox = layout.page.contentBox;
          const minX = pageBox.x + 4;
          const maxX = pageBox.x + pageBox.width - answerWidth - 4;
          const lineX = Math.max(minX, Math.min(maxX, renderMeta.dotX - answerWidth / 2));
          const lineY = Math.min(
            cellBottomY - 22,
            renderMeta.lineY + Math.max(42, measured.height * 1.05)
          );

          if ((display.answerKey || isExample) && question.answer != null) {
            drawShortAnswerLine(doc, lineX, lineY, answerWidth);
            drawTextOnLine(doc, question.answer, lineX, lineY, answerWidth, fonts);
          } else {
            drawShortAnswerLine(doc, lineX, lineY, answerWidth);
          }

          return height;
        }

        if (visual.kind === "base_ten_blocks" && display.baseTenAlignedResponse) {
          const modelBottomY = placed.y + (measured.rodLength || measured.height);

          if (display.baseTenTensOnesBoxes) {
          const totalWidth = 52;
          const boxW = totalWidth / 2;
          const boxH = totalWidth;
          const startX = x + Math.max(0, width - totalWidth - 6);
          const boxY = modelBottomY - boxH;
          const tensValue = visual.data?.tens ?? Math.floor(Number(question.answer || 0) / 10);
          const onesValue = visual.data?.ones ?? Number(question.answer || 0) % 10;

          doc.save();
          setFont(doc, fonts.light || fonts.regular || "Helvetica", 8);
          doc.fillColor(pdfDesignTokens.colors.muted);
          doc.text("TENS", startX, boxY - 12, { width: boxW, align: "center", lineBreak: false });
          doc.text("ONES", startX + boxW, boxY - 12, { width: boxW, align: "center", lineBreak: false });
          doc.strokeColor(pdfDesignTokens.colors.answerRule);
          doc.lineWidth(0.8);
          doc.rect(startX, boxY, totalWidth, boxH).stroke();
          doc.moveTo(startX + boxW, boxY).lineTo(startX + boxW, boxY + boxH).stroke();
          if ((display.answerKey || isExample) && question.answer != null) {
            setFont(doc, fonts.bold || fonts.regular || "Helvetica", 12);
            doc.fillColor(pdfDesignTokens.colors.text);
            const digitY = boxY + boxH / 2 - 7;
            doc.text(formatAnswerValue(tensValue), startX, digitY, { width: boxW, align: "center", lineBreak: false });
            doc.text(formatAnswerValue(onesValue), startX + boxW, digitY, { width: boxW, align: "center", lineBreak: false });
            restoreAnswerSurroundingTextStyle(doc, fonts, 12);
          }
          doc.restore();

          return height;
        }

          const lineWidth = Math.max(42, Math.min(region.answerWidth * 0.5, 70));
          const lineX = region.answerX;
          const lineY = modelBottomY;

          if ((display.answerKey || isExample) && question.answer != null) {
            drawShortAnswerLine(doc, lineX, lineY, lineWidth);
            drawTextOnLine(doc, question.answer, lineX, lineY, lineWidth, fonts);
          } else {
            drawShortAnswerLine(doc, lineX, lineY, lineWidth);
          }

          return height;
        }

        if ((display.answerKey || isExample) && question.answer != null && !hasInlineAnswerBlank) {
          const line = drawAnswerLine(doc, region, {
            short: Boolean(display.shortVisualAnswerLine)
          });
          if (line) {
            drawTextOnLine(doc, question.answer, line.x, line.y, line.width, fonts);
          }
        } else if (!hasInlineAnswerBlank) {
          drawAnswerLine(doc, region, {
            short: Boolean(display.shortVisualAnswerLine)
          });
        }
      } catch (err) {
        console.error("VISUAL RENDER FAIL:", err);
      }
    }
  }

  if (!visual?.kind && display.workSpaceBox) {
    const boxTop = promptBottomY + 8;
    const bottomBreathing = Number(display.workBoxBottomBreathing || 24);
    const availableHeight = Math.max(42, cellBottomY - boxTop - bottomBreathing);
    const boxHeight = drawWorkBox(doc, x, boxTop, width, availableHeight);

    if ((display.answerKey || isExample) && question.answer != null) {
      doc.save();
      restoreAnswerSurroundingTextStyle(doc, fonts, 12);
      doc.fillColor(pdfDesignTokens.colors.text);
      const label = "Answer: ";
      const answerText = formatAnswerValue(question.answer);
      const answerX = x + 10 + doc.widthOfString(label);
      doc.text(label, x + 10, boxTop + 10, {
        width: width - 20,
        align: "left",
        lineBreak: false
      });
      setFont(doc, fonts.bold || fonts.regular || "Helvetica", 12);
      doc.text(answerText, answerX, boxTop + 10, {
        width: Math.max(20, width - 20 - doc.widthOfString(label)),
        align: "left"
      });
      restoreAnswerSurroundingTextStyle(doc, fonts, 12);
      doc.restore();
    }

    return Math.max(
      promptHeight + boxHeight + 20,
      layout.typography.body?.lineHeight || 16
    );
  }

  if (!visual?.kind && display.workSpaceLines) {
    const workTop = promptBottomY + 14;
    const workHeight = drawWorkSpace(
      doc,
      x,
      workTop,
      width,
      display.workSpaceLines
    );

    return Math.max(
      promptHeight + workHeight + 18,
      layout.typography.body?.lineHeight || 16
    );
  }

  if (dividerY && !display.hideItemSeparators) {
    doc.save();
    doc.strokeColor("#d1d5db");
    doc.lineWidth(1);
    doc.moveTo(x, dividerY);
    doc.lineTo(x + width, dividerY);
    doc.stroke();
    doc.restore();
  }

  return visual?.kind
    ? height
    : Math.max(promptHeight, layout.typography.body?.lineHeight || 16);
}

function renderVisualByKind(doc, visual, placed, measured) {
  if (!visual?.kind) return;

  if (visual.kind === "array") {
    return drawArrayPrimitive(doc, placed.x, placed.y, {
      ...(visual.data || {}),
      cellSize: measured.cellSize,
      gap: measured.gap,
      r: measured.dotRadius
    });
  }

  if (visual.kind === "ten_frame") {
    return drawTenFramePrimitive(doc, placed.x, placed.y, {
      ...(visual.data || {}),
      cellSize: measured.cellSize,
      cellGap: measured.cellGap,
      frameGap: measured.frameGap
    });
  }

  if (visual.kind === "number_line") {
    return drawNumberLinePrimitive(doc, placed.x, placed.y, {
      ...(visual.data || {}),
      width: measured.width,
      height: measured.height
    });
  }

  if (visual.kind === "base_ten_blocks") {
    return drawBaseTenBlocksPrimitive(doc, placed.x, placed.y, {
      ...(visual.data || {}),
      unit: measured.unit,
      rodLength: measured.rodLength,
      flatSize: measured.flatSize,
      gap: measured.gap,
      groupGap: measured.groupGap
    });
  }
}

function drawFooter(doc, fonts, pageNum, meta = {}) {
  const cb = layout.page.contentBox;
  const xLeft = cb.x;
  const xRight = cb.x + cb.width;

  const bottomMargin = layout.page.margins.bottom;
  const yRule = doc.page.height - bottomMargin;

  const fr = footerRule();
  lineRule(doc, xLeft, xRight, yRule, fr.strokeWidth, fr.color);

  // Curriculum footer text ONLY when present
  const footerText = meta?.curriculum?.footerText ? safeStr(meta.curriculum.footerText).trim() : "";
  if (footerText) {
    doc.save();
    setFont(doc, fonts.light || fonts.regular, 9);
    doc.fillColor(pdfDesignTokens.colors.text);
    // Put it just above the rule (inside the footer buffer area)
    doc.text(footerText, xLeft, yRule - 11, {
      width: cb.width,
      align: "left",
      lineBreak: false,
    });
    doc.restore();
  }

  // Page number below the rule
  const offset = Math.max(6, Math.min(10, (layout.spacing?.sm ?? 12) - 2));
  const pageNumY = yRule + offset;

  setFont(doc, fonts.light || fonts.regular, layout.typography.headerLabels.size);
  doc.fillColor(pdfDesignTokens.colors.text);
  doc.text(String(pageNum), xLeft, pageNumY, {
    width: cb.width,
    align: "center",
    lineBreak: false,
  });
}

function drawNameDateLine(doc, fonts, y) {
  const header = layout.components.nameDateLine;
  const labelStyle = layout.typography.headerLabels;
  const nr = nameDateRule();

  setFont(doc, fonts.light, labelStyle.size);
  doc.fillColor(pdfDesignTokens.colors.text);

  doc.text(header.name.label, header.name.labelX, y, { lineBreak: false });
  lineRule(doc, header.name.lineStart, header.name.lineEnd, y + labelStyle.lineHeight, nr.strokeWidth, nr.color);

  doc.text(header.date.label, header.date.labelX, y, { lineBreak: false });
  lineRule(doc, header.date.lineStart, header.date.lineEnd, y + labelStyle.lineHeight, nr.strokeWidth, nr.color);
}

function renderHeader(doc, fonts, meta = {}) {
  const cb = layout.page.contentBox;
  const xLeft = cb.x;
  const xRight = cb.x + cb.width;

  let y = cb.y;

  // name/date line
  const lift = layout.spacing?.xs ?? 10;
  drawNameDateLine(doc, fonts, y - lift);

  // header block "thirds" feel: title in middle third, subheading in bottom third
  y += layout.spacing.lg ?? 24;

  const unitTitle = safeStr(meta.unitTitle).trim();
  const worksheetTitle = safeStr(meta.title).trim();
  const subheading = safeStr(meta.subheading).trim();
  const dailyFocus = safeStr(meta.dailyFocus).trim() || safeStr(meta.focus).trim();

  if (unitTitle) {
    const s = layout.typography.unitTitle;
    setFont(doc, fonts.bold, s.size);
    doc.fillColor(pdfDesignTokens.colors.text);
    doc.text(unitTitle.toUpperCase(), xLeft, y, { width: cb.width, align: "left" });
    y += s.lineHeight;
  }

  if (worksheetTitle) {
    const s = layout.typography.worksheetTitle;
    // Title should be Bold per your rule
    setFont(doc, fonts.bold, s.size);
    doc.fillColor(pdfDesignTokens.colors.text);
    doc.text(worksheetTitle, xLeft, y, { width: cb.width, align: "left" });
    y += s.lineHeight;
  }

  if (subheading) {
    const s = layout.typography.headerLabels;
    setFont(doc, fonts.light, s.size);
    doc.fillColor(pdfDesignTokens.colors.text);
    doc.text(subheading, xLeft, y, { width: cb.width, align: "left" });
    y += s.lineHeight;
  } else if (dailyFocus) {
    const s = layout.typography.focusAndSection;
    setFont(doc, fonts.lightItalic, s.size);
    doc.fillColor(pdfDesignTokens.colors.text);
    doc.text(dailyFocus, xLeft, y, { width: cb.width, align: "left" });
    y += s.lineHeight;
  }

  // divider line should sit BELOW subheading with a small nice space
  y += layout.spacing.sm;
  const hd = headerDividerRule();
  lineRule(doc, xLeft, xRight, y, hd.strokeWidth, hd.color);

  y += layout.spacing.lg ?? 24;
  doc.y = y;
  return y;
}

function getColumns(cols) {
  const cb = layout.page.contentBox;
  const gutter = cols === 1 ? 0 : (layout.grid?.gutter ?? 24);
  const colW = cols === 1 ? cb.width : (cb.width - gutter * (cols - 1)) / cols;
  const xForCol = (i) => cb.x + i * (colW + gutter);
  return { cb, gutter, colW, xForCol };
}

function distributeBalanced(items, cols) {
  const buckets = Array.from({ length: cols }, () => []);
  items.forEach((it, idx) => buckets[idx % cols].push(it));
  return buckets;
}

function distributeSequential(items, cols) {
  const buckets = Array.from({ length: cols }, () => []);
  const perColumn = Math.ceil(items.length / Math.max(1, cols));
  items.forEach((it, idx) => {
    const bucketIndex = Math.min(cols - 1, Math.floor(idx / perColumn));
    buckets[bucketIndex].push(it);
  });
  return buckets;
}

function paginateEven(items, maxPerPage) {
  const n = items.length;
  if (n <= maxPerPage) return [items];

  const pagesNeeded = Math.ceil(n / maxPerPage);
  const pages = [];
  let i = 0;
  let remaining = n;

  for (let p = pagesNeeded; p > 0; p--) {
    const ideal = Math.ceil(remaining / p);
    const take = Math.min(maxPerPage, ideal);
    pages.push(items.slice(i, i + take));
    i += take;
    remaining -= take;
  }
  return pages;
}

function paginateSequential(items, maxPerPage) {
  const pageSize = Math.max(1, maxPerPage);
  const pages = [];

  for (let i = 0; i < items.length; i += pageSize) {
    pages.push(items.slice(i, i + pageSize));
  }

  return pages;
}

function computeFillStep(startY, bottomContentY, lineHeight, maxCountInAnyColumn) {
  const usable = Math.max(0, (bottomContentY - startY) - lineHeight);

  if (maxCountInAnyColumn <= 1) {
    return lineHeight * 1.6;
  }

  let step = usable / (maxCountInAnyColumn - 1);
 const minStep = lineHeight * 1.35;
const maxStep = lineHeight * 2.6;
  step = Math.max(minStep, Math.min(maxStep, step));
  return step;
}
function renderPageColumns(
  doc,
  cols,
  columns,
  startY,
  bottomContentY,
  xForCol,
  colW,
  arg8,
  arg9,
  arg10,
  arg11
) {
  const usingOldStyle = typeof arg8 === "number" && typeof arg9 === "function";

  if (usingOldStyle) {
    const step = arg8;
    const renderLineFn = arg9;
    const lineHeight = arg10 || 18;

    for (let c = 0; c < cols; c++) {
      const colItems = columns[c];
      if (!colItems.length) continue;

      for (let i = 0; i < colItems.length; i++) {
        const y = startY + i * step;
        if (y > bottomContentY - lineHeight) break;
        renderLineFn(colItems[i], xForCol(c), y, colW);
      }
    }

    return;
  }

  const renderLineFn = arg8;
  const itemGap = arg9 ?? 18;
  const display = arg11 || {};

  const isVisualLayout = itemGap === 0;
  const rowCount = isVisualLayout ? (arg10 || 5) : null;
  const denseGridRows = Number(display.denseGridRows || 0);
  const fixedRowCount = isVisualLayout ? rowCount : denseGridRows || null;
  const visualCellHeight = fixedRowCount
    ? (bottomContentY - startY) / fixedRowCount
    : 0;

  for (let c = 0; c < cols; c++) {
    const colItems = columns[c];
    if (!colItems.length) continue;

    let currentY = startY;

    for (let i = 0; i < colItems.length; i++) {
      const item = colItems[i];

      if (isVisualLayout) {
        renderLineFn(item, xForCol(c), currentY, colW);

        const separatorY = currentY + visualCellHeight - 8;

        if (!display.hideItemSeparators && i < rowCount - 1 && separatorY < bottomContentY - 4) {
          doc.save();
          doc.strokeColor(pdfDesignTokens.colors.lightRule);
          doc.lineWidth(pdfDesignTokens.rules.thin);
          doc.moveTo(xForCol(c), separatorY)
            .lineTo(xForCol(c) + colW, separatorY)
            .stroke();
          doc.restore();
        }

        currentY += visualCellHeight;
      } else if (display.equalHeightItems || denseGridRows) {
        const equalCellHeight = Math.max(
          layout.typography.body?.lineHeight || 16,
          (bottomContentY - startY) / Math.max(1, denseGridRows || colItems.length)
        );
        renderLineFn(item, xForCol(c), currentY, colW, equalCellHeight);
        currentY += equalCellHeight;
      } else {
        const usedHeight = renderLineFn(item, xForCol(c), currentY, colW);

        const separatorY = currentY + usedHeight + Math.max(8, itemGap / 2);

        if (!display.hideItemSeparators && separatorY < bottomContentY - 4) {
          doc.save();
          doc.strokeColor(pdfDesignTokens.colors.lightRule);
          doc.lineWidth(pdfDesignTokens.rules.thin);
          doc.moveTo(xForCol(c), separatorY)
            .lineTo(xForCol(c) + colW, separatorY)
            .stroke();
          doc.restore();
        }

        currentY += usedHeight + itemGap;

        if (currentY > bottomContentY) {
          break;
        }
      }
    }
  }
}

function renderQuestionsPages(doc, fonts, contentObject, options, pageState, layoutObject = null) {
  const meta = contentObject?.meta || {};
  const allItems = (
    contentObject?.content?.items && contentObject.content.items.length
      ? contentObject.content.items
      : contentObject?.problems || []
  );

  const instruction = layoutObject?.instruction || "";
  const display = layoutObject?.display || {};
  const bodyStyle = layout.typography.body;

  const footerRuleY = doc.page.height - layout.page.margins.bottom;
  const footerBufferH = layout.zones?.footerBuffer?.height ?? 24;
  const bottomContentY = footerRuleY - footerBufferH;

  const hasVisuals = allItems.some((item) => item.visual);
  const isReverseNumberWordLayout = Boolean(display.reverseNumberWordWriting);
  const cols = hasVisuals
    ? clampCols(display.visualColumns || 2)
    : clampCols(layoutObject?.template?.columns || options.cols);
  const layoutMaxProblemsPerPage = Number(layoutObject?.template?.maxProblemsPerPage || 0);
  const questionsPerColumn = hasVisuals
    ? Math.max(1, Math.ceil((layoutMaxProblemsPerPage || cols * 5) / cols))
    : isReverseNumberWordLayout
      ? Number(display.reverseNumberWordRowsPerColumn || 10)
      : Math.max(1, Math.ceil((layoutMaxProblemsPerPage || MAX_PER_COLUMN) / cols));
  const itemGap = hasVisuals ? 0 : 18;

  const { colW, xForCol } = getColumns(cols);

  let startY = renderHeader(doc, fonts, meta);

  if (instruction) {
    setFont(doc, fonts.light || fonts.regular, 11);
    doc.fillColor(pdfDesignTokens.colors.muted);
    doc.text(instruction, layout.page.contentBox.x, startY - 12, {
      width: layout.page.contentBox.width,
      align: "left"
    });
    startY += 28;
  }

  setFont(doc, fonts.regular, bodyStyle.size);
  doc.fillColor(pdfDesignTokens.colors.text);

  const maxPerPage = isReverseNumberWordLayout
    ? 30
    : hasVisuals
    ? cols * questionsPerColumn
    : Math.max(1, layoutMaxProblemsPerPage || cols * questionsPerColumn);
  const pages = isReverseNumberWordLayout
    ? paginateSequential(allItems, maxPerPage)
    : paginateEven(allItems, maxPerPage);

  pages.forEach((pageItems, pageIndex) => {
    if (pageIndex > 0) {
      doc.addPage();
      pageState.pageNum += 1;
      startY = renderHeader(doc, fonts, meta);

      if (instruction) {
        setFont(doc, fonts.light || fonts.regular, 11);
        doc.fillColor(pdfDesignTokens.colors.muted);
        doc.text(instruction, layout.page.contentBox.x, startY - 12, {
          width: layout.page.contentBox.width,
          align: "left"
        });
        startY += 28;
      }

      setFont(doc, fonts.regular, bodyStyle.size);
      doc.fillColor(pdfDesignTokens.colors.text);
    }

    const pageCols = isReverseNumberWordLayout
      ? clampCols(pageItems.length > 20 ? 3 : pageItems.length > 10 ? 2 : 1)
      : cols;
    const pageQuestionsPerColumn = isReverseNumberWordLayout
      ? Number(display.reverseNumberWordRowsPerColumn || 10)
      : questionsPerColumn;
    const { colW: pageColW, xForCol: pageXForCol } = pageCols === cols
      ? { colW, xForCol }
      : getColumns(pageCols);
    const columns = display.sequentialColumnFill
      ? distributeSequential(pageItems, pageCols)
      : distributeBalanced(pageItems, pageCols);

    if (hasVisuals && pageCols === 2) {
      const cb = layout.page.contentBox;
      const centerX = cb.x + cb.width / 2;
      const topLineY = startY - 6;
      const bottomLineY = bottomContentY - 6;

      doc.save();
      doc.strokeColor(pdfDesignTokens.colors.lightRule);
      doc.lineWidth(pdfDesignTokens.rules.thin);
      doc.moveTo(centerX, topLineY)
        .lineTo(centerX, bottomLineY)
        .stroke();
      doc.restore();
    }

    renderPageColumns(
	  doc,
	  pageCols,
	  columns,
	  startY,
	  bottomContentY,
	  pageXForCol,
	  pageColW,
  (item, x, y, w, itemHeight = 0) => {
    const cellHeight = hasVisuals
      ? (bottomContentY - startY) / questionsPerColumn
      : itemHeight;

    return renderQuestionItem(
      doc,
      item,
      {
        x,
        y,
        width: w,
        height: cellHeight,
        dividerY: null
      },
      fonts,
      display
    );
  },
	  itemGap,
	  pageQuestionsPerColumn,
	  display
	);

    drawFooter(doc, fonts, pageState.pageNum, meta);
  });
}

function renderAnswerKey(doc, fonts, contentObject, options, pageState, layoutObject = null) {
  const meta = contentObject?.meta || {};
  const answers = buildAnswerKeyItems(contentObject?.content?.items || []);
  if (!answers.length) return;
  const worksheetType = layoutObject?.worksheetType || "";

  doc.addPage();
  pageState.pageNum += 1;

  const answerItems = answers.map((it) => {
    let ans = it.answer;
    if (ans == null && typeof it.a === "number" && typeof it.b === "number" && it.op) {
      if (it.op === "+") ans = it.a + it.b;
      if (it.op === "-") ans = it.a - it.b;
      if (it.op === "*") ans = it.a * it.b;
      if (it.op === "/") ans = it.b !== 0 ? it.a / it.b : "";
    }

    return {
      ...it,
      answer: ans,
      prompt: it.visual ||
        worksheetType === "word_problem" ||
        layoutObject?.display?.writingLine ||
        layoutObject?.display?.standardShortAnswerTarget ||
        layoutObject?.display?.factFamilyGrid ||
        layoutObject?.display?.compactExpandedForm ||
        layoutObject?.display?.skipCountingRow
        ? it.prompt
        : filledAnswerText(it.prompt, ans)
    };
  });

  renderQuestionsPages(
    doc,
    fonts,
    {
      meta: {
        ...meta,
        title: `${safeStr(meta.title).trim() || "Worksheet"} ANSWER KEY`,
        subheading: ""
      },
      content: {
        items: answerItems
      }
    },
    options,
    pageState,
    {
      ...(layoutObject || {}),
      display: {
        ...(layoutObject?.display || {}),
        answerKey: true
      }
    }
  );
}

function renderWorksheetPDF({ res, contentObject, options = {}, layoutObject = null }) {
  const doc = new PDFDocument({
    size: "LETTER",
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    bufferPages: false,
  });

  const fontsDir = path.join(__dirname, "..", "public", "fonts", "SourceSans3");
  const fonts = {
    regular: "SS3-Regular",
    bold: "SS3-Bold",
    light: "SS3-Light",
    lightItalic: "SS3-LightItalic",
  };

  tryRegisterFont(doc, fonts.regular, path.join(fontsDir, "SourceSans3-Regular.ttf"));
  tryRegisterFont(doc, fonts.bold, path.join(fontsDir, "SourceSans3-Bold.ttf"));
  tryRegisterFont(doc, fonts.light, path.join(fontsDir, "SourceSans3-Light.ttf"));
  tryRegisterFont(doc, fonts.lightItalic, path.join(fontsDir, "SourceSans3-LightItalic.ttf"));

  const filename = options && options.filename
    ? safeStr(options.filename)
    : "yellowbird-worksheet.pdf";

  const disposition =
    safeStr(options?.disposition || "attachment") === "inline" ? "inline" : "attachment";

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `${disposition}; filename="${filename}"`);

  doc.pipe(res);

  const normalized = {
    cols: clampCols(options.cols ?? layout.grid?.columns ?? 3),
    includeAnswerKey: options.includeAnswerKey !== false,
  };

  const pageState = { pageNum: 1 };

  renderQuestionsPages(doc, fonts, contentObject, normalized, pageState, layoutObject);

  if (normalized.includeAnswerKey) {
    renderAnswerKey(doc, fonts, contentObject, normalized, pageState, layoutObject);
  }

  doc.end();
}

module.exports = { renderWorksheetPDF };
