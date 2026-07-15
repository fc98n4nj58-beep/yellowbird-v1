'use strict';

const layout = require("../config/layout/layoutSpec.json");
const { pdfDesignTokens } = require("../config/layout/pdfDesignTokens");
const path = require("path");
const PDFDocument = require("pdfkit");
const {
  MULTIPLICATION_SYMBOL
} = require("../engine/problemGenerators/multiplicationModelConstants");

const MAX_PER_COLUMN = 30;
const GRADE1_DATA_RESPONSE_LINE_WIDTHS = Object.freeze({
  number: 64,
  category: 136,
  yes_no: 84
});
const GRADE1_DATA_MATCH_SELECTION_TARGET_DIAMETER = 18;
const GRADE1_FRACTION_SELECTION_TARGET_DIAMETER = 24;
const GRADE1_FRACTION_EXAMPLE_LABEL = "Try this one";
const GRADE1_FRACTION_ALLOWED_DENOMINATORS = Object.freeze([2, 3, 4]);
const GRADE1_FRACTION_RENDERER_VARIANTS = Object.freeze({
  fraction_strip: "fraction_strip",
  fair_share_set: "fair_share_set"
});

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

const MULTIPLICATION_MODEL_DOT = {
  radius: 2.4,
  diameter: 4.8,
  cellSize: 9,
  gap: 3,
  standardEdgeGap: 7.2,
  minEdgeGap: 2.4,
  minGroupGap: 2.5,
  minGroupPad: 2.5,
  minItemGap: 1.5,
  groupPad: 6,
  groupGap: 14,
  strokeWidth: 0.5,
  color: "#6b7280"
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
    responseMode: it.responseMode || null,
    responseType: it.responseType || null,
    responseValues: Array.isArray(it.responseValues) ? it.responseValues : null,
    responseOperator: it.responseOperator || null,
    showQuestionSentence: Boolean(it.showQuestionSentence),
    taskMode: it.taskMode || null,
    equationSupport: it.equationSupport || null,
    visual: it.visual || null,
    type: it.type || "equation",
    a: it.a,
    b: it.b,
    op: it.op,
    quotient: finiteOptionalNumber(it.quotient),
    isExample: Boolean(it.isExample),
    value: finiteOptionalNumber(it.value),
    numberWord: it.numberWord || null,
    numberWordMode: it.numberWordMode || null,
    representedValue: finiteOptionalNumber(it.representedValue),
    frameCount: finiteOptionalNumber(it.frameCount),
    dotArrangement: it.dotArrangement || null,
    selectionMode: it.selectionMode || null,
    tens: finiteOptionalNumber(it.tens),
    ones: finiteOptionalNumber(it.ones),
    labelMode: it.labelMode || null,
    sequence: Array.isArray(it.sequence) ? it.sequence : null,
    missingIndex: finiteOptionalNumber(it.missingIndex),
    missingIndexes: Array.isArray(it.missingIndexes)
      ? it.missingIndexes.map(finiteOptionalNumber).filter((n) => n !== null)
      : null,
    step: finiteOptionalNumber(it.step),
    patternKind: it.patternKind || null,
    patternRule: it.patternRule || null,
    patternOperation: it.patternOperation || null,
    continuationCount: finiteOptionalNumber(it.continuationCount),
    continuationAnswers: Array.isArray(it.continuationAnswers) ? it.continuationAnswers : null,
    missingTermPlacement: it.missingTermPlacement || null,
    operation: it.operation || null,
    minuend: finiteOptionalNumber(it.minuend),
    subtrahend: finiteOptionalNumber(it.subtrahend),
    difference: finiteOptionalNumber(it.difference),
    firstAddend: finiteOptionalNumber(it.firstAddend),
    secondAddend: finiteOptionalNumber(it.secondAddend),
    total: finiteOptionalNumber(it.total),
    missingPosition: it.missingPosition || null,
    missingValue: finiteOptionalNumber(it.missingValue),
    leftValue: finiteOptionalNumber(it.leftValue),
    rightValue: finiteOptionalNumber(it.rightValue),
    expectedSymbol: it.expectedSymbol || null,
    comparisonResult: it.comparisonResult || null,
    graphData: it.graphData || null,
    graphQuestionType: it.graphQuestionType || null,
    graphCategory: it.graphCategory || null,
    graphTaskData: it.graphTaskData || null,
    fractionModel: it.fractionModel || null,
    fractionWorkedModel: it.fractionWorkedModel || null,
    answerState: it.answerState || null,
    layoutVariant: it.layoutVariant || null,
    duplicateSignature: it.duplicateSignature || null,
    relatedDuplicateSignature: it.relatedDuplicateSignature || null,
    diagnostics: Array.isArray(it.diagnostics) ? it.diagnostics : null,
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

function answerTargetDefaults(display = {}) {
  const variant = display.answerTargetVariant || "";
  if (variant === "comparisonSymbol") {
    return {
      width: 34,
      align: "center"
    };
  }
  return {
    width: null,
    align: display.standardAnswerNoLineAlign || "center"
  };
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
  const additionStart = Number(opts.additionStart);
  const additionJump = Number(opts.additionJump);
  const additionLanding = Number(opts.additionLanding);
  const isAdditionModel = [additionStart, additionJump, additionLanding].every(Number.isFinite) &&
    additionJump > 0 && additionLanding > additionStart;

  const width = Number(opts.width || 180);
  const height = Number(opts.height || 34);
  const interval = Math.max(1, Number(opts.interval || 1));

  const lineY = y + height * (isAdditionModel ? 0.7 : 0.55);
  const startX = x;
  const endX = x + width;
  const steps = Math.max(1, Number.isFinite(Number(opts.tickCount))
    ? Math.floor(Number(opts.tickCount))
    : Math.round((max - min) / interval));
  const stepWidth = width / steps;

  doc.save();

doc.strokeColor("#111111");
doc.fillColor("#111111");
doc.lineWidth(1);

  doc.moveTo(startX, lineY);
  doc.lineTo(endX, lineY);
  doc.stroke();

  const labelEvery = Math.max(1, Number.isFinite(Number(opts.labelEvery))
    ? Math.floor(Number(opts.labelEvery))
    : steps > 20 ? 5 : steps > 10 ? 2 : 1);
  const hideValueLabel = Boolean(opts.hideValueLabel);

  for (let i = 0; i <= steps; i++) {
    const tickX = startX + i * stepWidth;
    const tickValue = min + i * interval;

    doc.moveTo(tickX, lineY - 5);
    doc.lineTo(tickX, lineY + 5);
    doc.stroke();

    const isTargetValue = tickValue === value;
    const isAdditionStart = isAdditionModel && tickValue === additionStart;
    const shouldLabel = i === 0 || i === steps || i % labelEvery === 0 || isTargetValue || isAdditionStart;

    if (shouldLabel && !(hideValueLabel && isTargetValue)) {
      const insetEndpointLabel = isAdditionModel && (i === 0 || i === steps);
      const labelX = insetEndpointLabel
        ? (i === 0 ? tickX : tickX - 18)
        : tickX - 9;
      const labelAlign = insetEndpointLabel
        ? (i === 0 ? "left" : "right")
        : "center";
      doc.fontSize(8);
      doc.text(String(tickValue), labelX, lineY + 8, {
        width: 18,
        align: labelAlign
      });
    }
  }

  const clamped = Math.max(min, Math.min(max, value));
  const targetIndex = Number.isFinite(Number(opts.targetIndex))
    ? Math.max(0, Math.min(steps, Number(opts.targetIndex)))
    : (clamped - min) / interval;
  const dotX = startX + targetIndex * stepWidth;

  if (isAdditionModel) {
    const additionStartX = startX + ((additionStart - min) / interval) * stepWidth;
    const additionLandingX = startX + ((additionLanding - min) / interval) * stepWidth;
    drawJumpArrow(doc, additionStartX, additionLandingX, lineY - 6, 0, 1);
    doc.save();
    doc.fontSize(9);
    doc.fillColor("#374151");
    doc.text(`+${additionJump}`, additionStartX, lineY - 29, {
      width: Math.max(24, additionLandingX - additionStartX),
      align: "center",
      lineBreak: false
    });
    doc.fillColor("#111111");
    doc.circle(additionStartX, lineY, 3).fill();
    doc.restore();
  }
  
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

function buildNumberLineAnswerTargetGeometry({
  dotX,
  lineY,
  cellBottomY,
  measuredHeight,
  pageBox,
  answerWidth = 42
}) {
  const minX = pageBox.x + 4;
  const maxX = pageBox.x + pageBox.width - answerWidth - 4;
  const centeredX = dotX - answerWidth / 2;
  const targetX = Math.max(minX, Math.min(maxX, centeredX));
  return {
    x: targetX,
    y: Math.min(cellBottomY - 22, lineY + Math.max(42, measuredHeight * 1.05)),
    width: answerWidth,
    centerX: targetX + answerWidth / 2,
    clamped: targetX !== centeredX
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
  const cellSize = Number(opts.cellSize || MULTIPLICATION_MODEL_DOT.cellSize);
  const gap = Number(opts.gap || MULTIPLICATION_MODEL_DOT.gap);
  const r = Number(opts.r || MULTIPLICATION_MODEL_DOT.radius);

  doc.save();
  doc.fillColor(MULTIPLICATION_MODEL_DOT.color);
  doc.strokeColor(MULTIPLICATION_MODEL_DOT.color);
  doc.lineWidth(MULTIPLICATION_MODEL_DOT.strokeWidth);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = x + col * (cellSize + gap) + cellSize / 2;
      const cy = y + row * (cellSize + gap) + cellSize / 2;
      doc.circle(cx, cy, r).fillAndStroke();
    }
  }

  doc.restore();
}

function drawEqualGroupsPrimitive(doc, x, y, opts = {}) {
  const groups = Math.max(1, Number(opts.groups || 1));
  const itemsPerGroup = Math.max(1, Number(opts.itemsPerGroup || 1));
  const groupCols = Math.max(1, Number(opts.groupCols || 1));
  const itemCols = Math.max(1, Number(opts.itemCols || 1));
  const cellSize = Number(opts.cellSize || MULTIPLICATION_MODEL_DOT.cellSize);
  const itemGap = Number(opts.itemGap || MULTIPLICATION_MODEL_DOT.gap);
  const groupGap = Number(opts.groupGap || 8);
  const groupPad = Number(opts.groupPad || 4);
  const dotRadius = Number(opts.dotRadius || MULTIPLICATION_MODEL_DOT.radius);
  const itemRows = Math.ceil(itemsPerGroup / itemCols);
  const groupWidth = groupPad * 2 + itemCols * cellSize + Math.max(0, itemCols - 1) * itemGap;
  const groupHeight = groupPad * 2 + itemRows * cellSize + Math.max(0, itemRows - 1) * itemGap;

  doc.save();
  doc.strokeColor("#9ca3af");
  doc.fillColor(MULTIPLICATION_MODEL_DOT.color);
  doc.lineWidth(0.7);

  for (let group = 0; group < groups; group += 1) {
    const groupCol = group % groupCols;
    const groupRow = Math.floor(group / groupCols);
    const groupX = x + groupCol * (groupWidth + groupGap);
    const groupY = y + groupRow * (groupHeight + groupGap);

    doc.roundedRect(groupX, groupY, groupWidth, groupHeight, 6).stroke();

    for (let item = 0; item < itemsPerGroup; item += 1) {
      const itemCol = item % itemCols;
      const itemRow = Math.floor(item / itemCols);
      const cx = groupX + groupPad + itemCol * (cellSize + itemGap) + cellSize / 2;
      const cy = groupY + groupPad + itemRow * (cellSize + itemGap) + cellSize / 2;
      doc.save();
      doc.strokeColor(MULTIPLICATION_MODEL_DOT.color);
      doc.lineWidth(MULTIPLICATION_MODEL_DOT.strokeWidth);
      doc.circle(cx, cy, dotRadius).fillAndStroke();
      doc.restore();
    }
  }

  doc.restore();
}

function drawEqualSharingPrimitive(doc, x, y, opts = {}) {
  const total = Math.max(1, Number(opts.total || 1));
  const groups = Math.max(1, Number(opts.groups || 1));
  const itemsPerGroup = Math.max(1, Number(opts.itemsPerGroup || opts.quotient || 1));
  const taskMode = String(opts.taskMode || "distribute");
  const groupCols = Math.max(1, Number(opts.groupCols || groups));
  const sourceCols = Math.max(1, Number(opts.sourceCols || Math.ceil(Math.sqrt(total))));
  const itemCols = Math.max(1, Number(opts.itemCols || Math.ceil(Math.sqrt(itemsPerGroup))));
  const cellSize = Number(opts.cellSize || MULTIPLICATION_MODEL_DOT.cellSize);
  const gap = Number(opts.gap || MULTIPLICATION_MODEL_DOT.gap);
  const groupPad = Number(opts.groupPad || MULTIPLICATION_MODEL_DOT.groupPad);
  const groupGap = Number(opts.groupGap || MULTIPLICATION_MODEL_DOT.groupGap);
  const sourceGroupGap = Number(opts.sourceGroupGap || 18);
  const dotRadius = Number(opts.dotRadius || MULTIPLICATION_MODEL_DOT.radius);
  const sourceRows = Math.ceil(total / sourceCols);
  const groupWidth = Number(opts.groupWidth || 52);
  const groupHeight = Number(opts.groupHeight || 50);
  const groupRows = Math.ceil(groups / groupCols);
  const sourceWidth = sourceCols * cellSize + Math.max(0, sourceCols - 1) * gap;
  const sourceHeight = sourceRows * cellSize + Math.max(0, sourceRows - 1) * gap;
  const groupsX = x + sourceWidth + sourceGroupGap;
  const groupsTop = y;

  function drawDot(cx, cy) {
    doc.circle(cx, cy, dotRadius).fillAndStroke();
  }

  doc.save();
  doc.strokeColor("#9ca3af");
  doc.fillColor(MULTIPLICATION_MODEL_DOT.color);
  doc.lineWidth(0.7);

  if (taskMode === "circle_groups") {
    for (let index = 0; index < total; index += 1) {
      const col = index % sourceCols;
      const row = Math.floor(index / sourceCols);
      drawDot(x + col * (cellSize + gap) + cellSize / 2, y + row * (cellSize + gap) + cellSize / 2);
    }
    doc.restore();
    return;
  }

  for (let index = 0; index < total; index += 1) {
    const col = index % sourceCols;
    const row = Math.floor(index / sourceCols);
    drawDot(x + col * (cellSize + gap) + cellSize / 2, y + row * (cellSize + gap) + cellSize / 2);
  }

  for (let group = 0; group < groups; group += 1) {
    const col = group % groupCols;
    const row = Math.floor(group / groupCols);
    const groupX = groupsX + col * (groupWidth + groupGap);
    const groupY = groupsTop + row * (groupHeight + groupGap);
    doc.roundedRect(groupX, groupY, groupWidth, groupHeight, 6).stroke();
  }

  doc.restore();
}

function measureArrayVisual(data = {}, maxWidth, targetHeight) {
  const rows = Math.max(1, Number(data.rows || 1));
  const cols = Math.max(1, Number(data.cols || 1));

  const cellSize = MULTIPLICATION_MODEL_DOT.diameter;
  const standardGap = MULTIPLICATION_MODEL_DOT.standardEdgeGap;
  const minGap = MULTIPLICATION_MODEL_DOT.minEdgeGap;
  const horizontalGapLimit = cols > 1
    ? (maxWidth - cols * cellSize) / (cols - 1)
    : standardGap;
  const verticalGapLimit = rows > 1
    ? (targetHeight - rows * cellSize) / (rows - 1)
    : standardGap;
  const gap = Math.max(
    minGap,
    Math.min(standardGap, horizontalGapLimit, verticalGapLimit)
  );
  const dotRadius = MULTIPLICATION_MODEL_DOT.radius;
  const width = cols * cellSize + (cols - 1) * gap;
  const height = rows * cellSize + (rows - 1) * gap;

  return {
    width,
    height,
    cellSize,
    gap,
    dotRadius
  };
}

function measureEqualGroupsVisual(data = {}, maxWidth, targetHeight) {
  const groups = Math.max(1, Number(data.groups || 1));
  const itemsPerGroup = Math.max(1, Number(data.itemsPerGroup || 1));
  const itemCols = itemsPerGroup >= 7
    ? Math.min(5, itemsPerGroup)
    : Math.max(1, Math.ceil(Math.sqrt(itemsPerGroup)));
  const itemRows = Math.ceil(itemsPerGroup / itemCols);
  const cellSize = MULTIPLICATION_MODEL_DOT.diameter;
  const dotRadius = MULTIPLICATION_MODEL_DOT.radius;
  const groupCols = Math.min(groups, 5);
  const groupRows = Math.ceil(groups / groupCols);
  const standardItemGap = MULTIPLICATION_MODEL_DOT.standardEdgeGap;
  const minItemGap = MULTIPLICATION_MODEL_DOT.minItemGap;
  const standardGroupGap = 8;
  const minGroupGap = MULTIPLICATION_MODEL_DOT.minGroupGap;
  const standardGroupPad = 4;
  const minGroupPad = MULTIPLICATION_MODEL_DOT.minGroupPad;

  function dimensions(itemGap, groupGap, groupPad) {
    const groupWidth = groupPad * 2 + itemCols * cellSize + Math.max(0, itemCols - 1) * itemGap;
    const groupHeight = groupPad * 2 + itemRows * cellSize + Math.max(0, itemRows - 1) * itemGap;

    return {
      groupWidth,
      groupHeight,
      width: groupCols * groupWidth + Math.max(0, groupCols - 1) * groupGap,
      height: groupRows * groupHeight + Math.max(0, groupRows - 1) * groupGap
    };
  }

  let itemGap = standardItemGap;
  let groupGap = standardGroupGap;
  let groupPad = standardGroupPad;
  let measured = dimensions(itemGap, groupGap, groupPad);

  if (measured.width > maxWidth || measured.height > targetHeight) {
    itemGap = Math.max(
      minItemGap,
      Math.min(
        standardItemGap,
        itemCols > 1 ? (maxWidth / groupCols - standardGroupPad * 2 - itemCols * cellSize) / (itemCols - 1) : standardItemGap,
        itemRows > 1 ? (targetHeight / groupRows - standardGroupPad * 2 - itemRows * cellSize) / (itemRows - 1) : standardItemGap
      )
    );
    groupGap = Math.max(minGroupGap, Math.min(standardGroupGap, (maxWidth - groupCols * (itemCols * cellSize + 2 * minGroupPad + Math.max(0, itemCols - 1) * itemGap)) / Math.max(1, groupCols - 1)));
    groupPad = Math.max(
      minGroupPad,
      Math.min(
        standardGroupPad,
        (maxWidth / groupCols - itemCols * cellSize - Math.max(0, itemCols - 1) * itemGap) / 2,
        (targetHeight / groupRows - itemRows * cellSize - Math.max(0, itemRows - 1) * itemGap) / 2
      )
    );
    measured = dimensions(itemGap, groupGap, groupPad);
  }

  return {
    groupRows,
    groupWidth: measured.groupWidth,
    groupHeight: measured.groupHeight,
    width: measured.width,
    height: measured.height,
    groups,
    itemsPerGroup,
    groupCols,
    itemCols,
    cellSize,
    itemGap,
    groupGap,
    groupPad,
    dotRadius
  };
}

function measureEqualSharingVisual(data = {}, maxWidth, targetHeight) {
  const total = Math.max(1, Number(data.total || 1));
  const groups = Math.max(1, Number(data.groups || 1));
  const itemsPerGroup = Math.max(1, Number(data.itemsPerGroup || data.quotient || 1));
  const taskMode = String(data.taskMode || "distribute");
  const cellSize = MULTIPLICATION_MODEL_DOT.cellSize;
  const gap = MULTIPLICATION_MODEL_DOT.gap;
  const groupPad = Math.max(6, MULTIPLICATION_MODEL_DOT.groupPad || 4);
  const groupGap = Math.max(10, MULTIPLICATION_MODEL_DOT.groupGap || 8);
  const sourceGroupGap = 18;
  const dotRadius = MULTIPLICATION_MODEL_DOT.radius;
  const itemCols = Math.max(2, Math.min(4, Math.ceil(Math.sqrt(itemsPerGroup))));
  const groupWidth = 52;
  const groupHeight = 50;
  const groupCols = Math.min(groups, 5);
  const groupRows = Math.ceil(groups / groupCols);
  const groupsWidth = groupCols * groupWidth + Math.max(0, groupCols - 1) * groupGap;
  const groupsHeight = groupRows * groupHeight + Math.max(0, groupRows - 1) * groupGap;
  const availableSourceWidth = taskMode === "circle_groups"
    ? maxWidth
    : Math.max(cellSize, maxWidth - groupsWidth - sourceGroupGap);
  let sourceCols = Math.max(1, Math.ceil(Math.sqrt(total)));
  while (sourceCols > 1 && sourceCols * cellSize + (sourceCols - 1) * gap > availableSourceWidth) {
    sourceCols -= 1;
  }
  const sourceRows = Math.ceil(total / sourceCols);
  const sourceWidth = sourceCols * cellSize + Math.max(0, sourceCols - 1) * gap;
  const sourceHeight = sourceRows * cellSize + Math.max(0, sourceRows - 1) * gap;
  const width = taskMode === "circle_groups" ? sourceWidth : sourceWidth + sourceGroupGap + groupsWidth;
  const height = taskMode === "circle_groups" ? sourceHeight : Math.max(sourceHeight, groupsHeight);

  return {
    width,
    height,
    total,
    groups,
    itemsPerGroup,
    taskMode,
    sourceCols,
    groupCols,
    itemCols,
    groupWidth,
    groupHeight,
    cellSize,
    gap,
    groupPad,
    groupGap,
    sourceGroupGap,
    dotRadius
  };
}

function measureTenFrameVisual(data = {}, maxWidth, targetHeight) {
  const frameCount = Math.max(1, Number(data.frames || 1));
  const requestedScale = Math.max(1, Math.min(1.6, Number(data.scale || 1)));
  const cellSizeBase = 10 * requestedScale;
  const cellGapBase = 0;
  const frameGapBase = 8 * requestedScale;

  const singleFrameWidth = cellSizeBase * 5 + cellGapBase * 4;
  const singleFrameHeight = cellSizeBase * 2 + cellGapBase;
  const framesPerRow = Math.max(1, Math.ceil(frameCount / 2));
  const frameRows = Math.ceil(frameCount / framesPerRow);
  const widthBase = framesPerRow * singleFrameWidth + (framesPerRow - 1) * frameGapBase;
  const heightBase = frameRows * singleFrameHeight + (frameRows - 1) * frameGapBase;

  const fitScale = Math.min(
    1,
    maxWidth > 0 ? maxWidth / widthBase : 1,
    targetHeight > 0 ? targetHeight / heightBase : 1
  );

  return {
    width: widthBase * fitScale,
    height: heightBase * fitScale,
    cellSize: cellSizeBase * fitScale,
    cellGap: cellGapBase * fitScale,
    frameGap: frameGapBase * fitScale
  };
}

function measureNumberLineVisual(data = {}, maxWidth, targetHeight, options = {}) {
  const minVal = Number(data.min ?? 0);
  const maxVal = Number(data.max ?? 10);
  const interval = Math.max(1, Number(data.interval || 1));
  const steps = Math.max(1, Number.isFinite(Number(data.tickCount))
    ? Math.floor(Number(data.tickCount))
    : Math.round((maxVal - minVal) / interval));

  const desiredWidth = options.forceFullWidth
    ? maxWidth
    : Math.min(maxWidth, Math.max(120, steps * 22));
  const isAdditionModel = [data.additionStart, data.additionJump, data.additionLanding]
    .every((value) => Number.isFinite(Number(value)));
  const height = Math.min(targetHeight, isAdditionModel ? 52 : 34);

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

function measureVisual(visual, maxWidth, targetHeight, options = {}) {
  if (!visual?.kind) return null;

 if (visual.kind === "array" || visual.kind === "arrays") {
    return measureArrayVisual(visual.data, maxWidth, targetHeight);
  }

  if (visual.kind === "equal_groups") {
    return measureEqualGroupsVisual(visual.data, maxWidth, targetHeight);
  }

  if (visual.kind === "equal_sharing") {
    return measureEqualSharingVisual(visual.data, maxWidth, targetHeight);
  }

  if (visual.kind === "ten_frame") {
    return measureTenFrameVisual(visual.data, maxWidth, targetHeight);
  }

  if (visual.kind === "number_line") {
    return measureNumberLineVisual(visual.data, maxWidth, targetHeight, options);
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

  if (kind === "equal_groups") {
    return {
      maxWidthRatio: VISUAL_LAYOUT.arrayMaxWidthRatio,
      targetHeightRatio: 0.7
    };
  }

  if (kind === "equal_sharing") {
    return {
      maxWidthRatio: VISUAL_LAYOUT.arrayMaxWidthRatio,
      targetHeightRatio: 0.74
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
  fullWidth = false,
  flushToCellBounds = false
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
  const leftInset = flushToCellBounds ? 0 : VISUAL_LAYOUT.leftInset;
  const visualZoneWidth =
    cellWidth -
    answerZoneWidth -
    (fullWidth ? 0 : VISUAL_LAYOUT.visualAnswerGap) -
    leftInset;

  const visualX = cellX + leftInset;

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

  const x = display.visualHorizontalAlign === "center"
    ? region.x + Math.max(0, (region.width - measured.width) / 2)
    : region.x;
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

  const lineYRatio = Math.max(0.5, Math.min(0.97, Number(options.yRatio || 0.95)));
  const lineY = region.topY + region.height * lineYRatio;
  const shortRatio = Math.max(0.45, Math.min(0.85, Number(options.shortRatio || 0.5)));
  const lineWidth = options.short ? region.answerWidth * shortRatio : region.answerWidth;
  const lineStartX = options.align === "center"
    ? region.answerX + Math.max(0, (region.answerWidth - lineWidth) / 2)
    : region.answerX;
  const lineEndX = lineStartX + lineWidth;

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
  doc.text(String(formatAnswerValue(text)), x + inset, y - fontSize - 2, {
    width: Math.max(20, width - inset * 2),
    align,
    lineBreak: false
  });
  doc.restore();
}

function drawMultiplicationModelEquation(doc, values, x, y, fonts = {}, options = {}) {
  const blankWidth = Number(options.blankWidth || 42);
  const fontSize = Number(options.fontSize || 12);
  const parts = Array.isArray(values) ? values : [];
  const showAnswers = Boolean(options.answerKey || options.isExample);
  const symbolY = y - fontSize - 2;
  const symbols = [options.operator || MULTIPLICATION_SYMBOL, "="];
  let cursorX = x;

  doc.save();
  restoreAnswerSurroundingTextStyle(doc, fonts, fontSize);

  for (let index = 0; index < 3; index += 1) {
    drawShortAnswerLine(doc, cursorX, y, blankWidth);

    if (showAnswers && parts[index] !== undefined && parts[index] !== null) {
      drawTextOnLine(doc, parts[index], cursorX, y, blankWidth, fonts, { fontSize });
      restoreAnswerSurroundingTextStyle(doc, fonts, fontSize);
    }

    cursorX += blankWidth;

    if (index < 2) {
      const symbol = symbols[index];
      const symbolWidth = index === 0 ? 20 : 18;
      doc.text(symbol, cursorX, symbolY, {
        width: symbolWidth,
        align: "center",
        lineBreak: false
      });
      cursorX += symbolWidth;
    }
  }

  doc.restore();
}

function drawMultiplicationModelTotalTarget(doc, value, x, y, fonts = {}, options = {}) {
  const blankWidth = Number(options.blankWidth || 52);
  const fontSize = Number(options.fontSize || 12);

  drawShortAnswerLine(doc, x, y, blankWidth);

  if (options.answerKey || options.isExample) {
    drawTextOnLine(doc, value, x, y, blankWidth, fonts, { fontSize });
    restoreAnswerSurroundingTextStyle(doc, fonts, fontSize);
  }
}

function drawDivisionModelEquation(doc, values, x, y, fonts = {}, options = {}) {
  const blankWidth = Number(options.blankWidth || 46);
  const fontSize = Number(options.fontSize || 12);
  const parts = Array.isArray(values) ? values : [];
  const showAnswers = Boolean(options.answerKey || options.isExample);
  const symbolY = y - fontSize - 2;
  const symbols = ["÷", "="];
  let cursorX = x;

  doc.save();
  restoreAnswerSurroundingTextStyle(doc, fonts, fontSize);

  for (let index = 0; index < 3; index += 1) {
    drawShortAnswerLine(doc, cursorX, y, blankWidth);

    if (showAnswers && parts[index] !== undefined && parts[index] !== null) {
      drawTextOnLine(doc, parts[index], cursorX, y, blankWidth, fonts, { fontSize });
      restoreAnswerSurroundingTextStyle(doc, fonts, fontSize);
    }

    cursorX += blankWidth;

    if (index < 2) {
      const symbol = symbols[index];
      const symbolWidth = index === 0 ? 22 : 18;
      doc.text(symbol, cursorX, symbolY, {
        width: symbolWidth,
        align: "center",
        lineBreak: false
      });
      cursorX += symbolWidth;
    }
  }

  doc.restore();
}

function drawIndependentEquationLine(doc, values, x, y, width, fonts = {}, options = {}) {
  drawShortAnswerLine(doc, x, y, width);

  if (options.answerKey || options.isExample) {
    const text = Array.isArray(values) && values.length >= 3
      ? `${values[0]} ÷ ${values[1]} = ${values[2]}`
      : "";
    drawFittedAnswerOnLine(doc, text, x, y, width, fonts, {
      align: "left",
      fontSize: 12,
      minFontSize: 8.5
    });
    restoreAnswerSurroundingTextStyle(doc, fonts, 12);
  }
}

function renderMultiplicationModelCell(doc, question, layoutBox, fonts = {}, display = {}) {
  const { x, y, width, height } = layoutBox;
  const visual = question.visual || null;
  if (!visual?.kind) return false;

  const isEquationMode = Boolean(display.multiplicationModelEquation);
  const isTotalOnly = Boolean(display.multiplicationModelTotalOnly);
  if (!isEquationMode && !isTotalOnly) return false;

  const isExample = Boolean(display.includeExample && question.isExample && !display.answerKey);
  const numberPrefix = question.id != null ? `${question.id})` : "";
  const sentence = safeStr(question.prompt || question.text || "").trim();
  const lineHeight = layout.typography.body?.lineHeight || 16;
  const promptY = y;
  const labelWidth = 34;

  doc.save();
  doc.fillColor("#111827");
  setFont(doc, fonts.regular || "Helvetica", 12);

  if (isExample && !display.suppressExampleLabel) {
    setFont(doc, fonts.lightItalic || fonts.regular || "Helvetica", 9);
    doc.fillColor(pdfDesignTokens.colors.muted);
    doc.text("Example", x, y - 11, {
      width,
      align: "left",
      lineBreak: false
    });
    setFont(doc, fonts.regular || "Helvetica", 12);
    doc.fillColor("#111827");
  }

  doc.text(numberPrefix, x, promptY, {
    width: labelWidth - 4,
    align: "left",
    lineBreak: false
  });

  let promptHeight = lineHeight;
  if (sentence) {
    doc.text(sentence, x + labelWidth, promptY, {
      width: Math.max(20, width - labelWidth),
      align: "left"
    });
    promptHeight = Math.max(
      lineHeight,
      doc.heightOfString(sentence, {
        width: Math.max(20, width - labelWidth),
        align: "left"
      })
    );
  }

  const responseHeight = 24;
  const bottomPad = 16;
  const topGap = sentence ? 8 : 6;
  const responseY = y + height - bottomPad - 8;
  const modelTop = promptY + promptHeight + topGap;
  const modelBottom = Math.max(modelTop + 10, responseY - 16);
  const modelHeight = Math.max(10, modelBottom - modelTop);
  const isArrayModel = visual.kind === "array" || visual.kind === "arrays";
  const modelGutter = isArrayModel
    ? Number(display.arrayModelGutter || 18)
    : labelWidth;
  const modelX = x + modelGutter;
  const availableWidth = Math.max(40, width - modelGutter);
  const rightPad = 14;
  const modelWidth = Math.max(40, availableWidth - rightPad);
  const measured = measureVisual(visual, modelWidth, modelHeight);

  if (measured) {
    const alignLeft = display.arrayModelAlign === "left" || visual.kind === "equal_groups";
    const verticalBias = visual.kind === "equal_groups" ? 0.34 : 0.5;
    const placed = {
      x: modelX + (alignLeft ? 0 : Math.max(0, (modelWidth - measured.width) / 2)),
      y: modelTop + Math.max(0, (modelHeight - measured.height) * verticalBias)
    };
    renderVisualByKind(doc, visual, placed, measured);
  }

  if (isEquationMode) {
    const values = Array.isArray(question.responseValues) && question.responseValues.length >= 3
      ? question.responseValues
      : [question.a, question.b, question.product ?? question.answer];
    const blankWidth = Number(display.multiplicationModelBlankWidth || 32);
    const totalWidth = blankWidth * 3 + 38;
    const equationX = x + width - rightPad - totalWidth;
    drawMultiplicationModelEquation(doc, values, equationX, responseY, fonts, {
      answerKey: Boolean(display.answerKey),
      isExample,
      operator: question.responseOperator || MULTIPLICATION_SYMBOL,
      blankWidth
    });
  } else {
    const values = Array.isArray(question.responseValues) && question.responseValues.length
      ? question.responseValues
      : [question.answer];
    const blankWidth = Number(display.multiplicationModelTotalLineWidth || 52);
    const lineX = x + width - rightPad - blankWidth;
    drawMultiplicationModelTotalTarget(doc, values[0], lineX, responseY, fonts, {
      answerKey: Boolean(display.answerKey),
      isExample,
      blankWidth
    });
  }

  doc.restore();
  return true;
}

function renderDivisionModelCell(doc, question, layoutBox, fonts = {}, display = {}) {
  const { x, y, width, height } = layoutBox;
  const visual = question.visual || null;
  if (visual?.kind !== "equal_sharing" || !display.divisionModel) return false;

  const isExample = Boolean(display.includeExample && question.isExample && !display.answerKey);
  const numberPrefix = question.id != null ? `${question.id})` : "";
  const sentence = safeStr(question.prompt || question.text || "").trim();
  const labelWidth = 34;
  const lineHeight = layout.typography.body?.lineHeight || 16;

  doc.save();
  doc.fillColor("#111827");
  setFont(doc, fonts.regular || "Helvetica", 12);

  if (isExample) {
    setFont(doc, fonts.lightItalic || fonts.regular || "Helvetica", 9);
    doc.fillColor(pdfDesignTokens.colors.muted);
    doc.text("Example", x, y - 11, {
      width,
      align: "left",
      lineBreak: false
    });
    setFont(doc, fonts.regular || "Helvetica", 12);
    doc.fillColor("#111827");
  }

  doc.text(numberPrefix, x, y, {
    width: labelWidth - 4,
    align: "left",
    lineBreak: false
  });

  let promptHeight = lineHeight;
  if (sentence) {
    doc.text(sentence, x + labelWidth, y, {
      width: Math.max(20, width - labelWidth),
      align: "left"
    });
    promptHeight = Math.max(
      lineHeight,
      doc.heightOfString(sentence, {
        width: Math.max(20, width - labelWidth),
        align: "left"
      })
    );
  }

  const rightPad = Number(display.divisionModelRightPad || 22);
  const responseY = y + height - 16;
  const modelTop = y + promptHeight + (sentence ? 12 : 6);
  const modelHeight = Math.max(16, responseY - modelTop - 14);
  const modelX = x + labelWidth;
  const modelWidth = Math.max(80, width - labelWidth);
  const measured = measureVisual(visual, modelWidth, modelHeight);

  if (measured) {
    renderVisualByKind(doc, visual, {
      x: modelX,
      y: modelTop
    }, measured);
  }

  const values = Array.isArray(question.responseValues) && question.responseValues.length >= 3
    ? question.responseValues
    : [question.product ?? question.a, question.b, question.quotient ?? question.answer];

  if (display.divisionEquationIndependent) {
    const lineWidth = Math.min(
      Number(display.divisionModelIndependentLineWidth || 220),
      Math.max(92, width - labelWidth - rightPad)
    );
    const lineX = x + width - rightPad - lineWidth;
    drawIndependentEquationLine(doc, values, lineX, responseY, lineWidth, fonts, {
      answerKey: Boolean(display.answerKey),
      isExample
    });
  } else {
    const blankWidth = Number(display.divisionModelBlankWidth || 46);
    const totalWidth = blankWidth * 3 + 40;
    const equationX = x + width - rightPad - totalWidth;
    drawDivisionModelEquation(doc, values, equationX, responseY, fonts, {
      answerKey: Boolean(display.answerKey),
      isExample,
      blankWidth
    });
  }

  doc.restore();
  return true;
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
  const fontSize = Number(display.inlineEquationFontSize || 12);
  const requestedBlankWidth = Number(display.standardAnswerLineWidth || 0);
  const targetDefaults = answerTargetDefaults(display);
  const defaultBlankWidth = Math.max(24, doc.widthOfString(display.standardAnswerBlankText || "___") + 8);
  const blankWidth = Math.max(defaultBlankWidth, requestedBlankWidth || targetDefaults.width || 0);
  const shouldDrawAnswers = display.inlineAnswerValues !== false;
  const shouldDrawAnswerLine = display.standardAnswerLineVisible !== false;
  let cursorX = x;

  setFont(doc, fonts.regular || "Helvetica", fontSize);
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
      const lineY = y + Math.max(layout.typography.body?.lineHeight || 14, fontSize + 3);
      const safeBlankWidth = Math.max(24, Math.min(blankWidth, x + width - cursorX - 2));

      if (shouldDrawAnswerLine) {
        drawShortAnswerLine(doc, cursorX, lineY, safeBlankWidth);
      }
      if (shouldDrawAnswers && answerText !== "") {
        if (shouldDrawAnswerLine) {
          drawTextOnLine(doc, answerText, cursorX, lineY, safeBlankWidth, fonts, { fontSize });
        } else {
          doc.save();
          setFont(doc, fonts.bold || fonts.regular || "Helvetica", fontSize);
          doc.fillColor(pdfDesignTokens.colors.text);
          doc.text(answerText, cursorX, y, {
            width: safeBlankWidth,
            align: targetDefaults.align,
            lineBreak: false
          });
          doc.restore();
        }
        restoreAnswerSurroundingTextStyle(doc, fonts, fontSize);
      }
      cursorX += safeBlankWidth;
    }
  });
}

function buildCompactWordProblemAnswerKeyGeometry({ y, height, promptHeight }) {
  const topPadding = 4;
  const answerGap = 8;
  const bottomPadding = 10;
  const promptY = y + topPadding;
  const answerY = promptY + promptHeight + answerGap;
  return {
    promptY,
    answerY,
    separatorY: y + height - bottomPadding,
    requiredHeight: topPadding + promptHeight + answerGap + 18 + bottomPadding
  };
}

function renderCompactWordProblemAnswerKeyItem(doc, question, layoutBox, fonts = {}) {
  const { x, y, width, height } = layoutBox;
  const prompt = `${question.id != null ? `${question.id})  ` : ""}${question.prompt || question.text || ""}`.trim();
  const promptFontSize = 11.5;
  setFont(doc, fonts.regular || "Helvetica", promptFontSize);
  doc.fillColor(pdfDesignTokens.colors.text);
  const promptHeight = doc.heightOfString(prompt, { width, align: "left", lineGap: 1 });
  const geometry = buildCompactWordProblemAnswerKeyGeometry({ y, height, promptHeight });

  doc.text(prompt, x, geometry.promptY, { width, align: "left", lineGap: 1 });

  const label = "Answer: ";
  setFont(doc, fonts.regular || "Helvetica", 11.5);
  doc.text(label, x, geometry.answerY, { width, align: "left", lineBreak: false });
  const answerX = x + doc.widthOfString(label);
  setFont(doc, fonts.bold || fonts.regular || "Helvetica", 11.5);
  doc.text(formatAnswerValue(question.answer), answerX, geometry.answerY, {
    width: Math.max(24, width - (answerX - x)),
    align: "left",
    lineBreak: false
  });

  if (geometry.separatorY > geometry.answerY + 16) {
    doc.save();
    doc.strokeColor(pdfDesignTokens.colors.lightRule);
    doc.lineWidth(pdfDesignTokens.rules.thin);
    doc.moveTo(x, geometry.separatorY).lineTo(x + width, geometry.separatorY).stroke();
    doc.restore();
  }

  return Math.max(height, geometry.requiredHeight);
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

function patternDisplayNumber(question, display = {}) {
  if (question.isExample) return "";
  const n = Number(question.id);
  if (!Number.isFinite(n)) return "";
  return display.includeExample ? Math.max(1, n - 1) : n;
}

function drawPatternAnswerTarget(doc, value, x, y, width, fonts = {}, options = {}) {
  doc.save();
  doc.strokeColor(options.strokeColor || "#8f98a8");
  doc.lineWidth(Number(options.strokeWidth || 0.95));
  doc.moveTo(x, y).lineTo(x + width, y).stroke();
  doc.restore();

  if (options.showAnswer && value !== undefined && value !== null && value !== "") {
    drawTextOnLine(doc, value, x, y, width, fonts, {
      align: "center",
      fontSize: Number(options.fontSize || 12)
    });
    restoreAnswerSurroundingTextStyle(doc, fonts, Number(options.fontSize || 12));
  }
}

function drawPatternSequenceParts(doc, parts, x, y, width, fonts = {}, options = {}) {
  const fontSize = Number(options.fontSize || 13);
  const targetWidth = Number(options.targetWidth || 48);
  let cursorX = x;
  const commaGap = Number(options.commaGap || 5);
  const baselineY = y + fontSize + 4;

  setFont(doc, fonts.regular || "Helvetica", fontSize);
  doc.fillColor(pdfDesignTokens.colors.text);

  parts.forEach((part, index) => {
    if (index > 0) {
      const comma = ",";
      doc.text(comma, cursorX, y, {
        width: Math.max(10, width - (cursorX - x)),
        align: "left",
        lineBreak: false
      });
      cursorX += doc.widthOfString(comma) + commaGap;
    }

    if (part.target) {
      drawPatternAnswerTarget(doc, part.answer, cursorX, baselineY, targetWidth, fonts, {
        showAnswer: Boolean(options.showAnswers),
        fontSize,
        strokeColor: options.targetStrokeColor,
        strokeWidth: options.targetStrokeWidth
      });
      cursorX += targetWidth;
      return;
    }

    doc.save();
    setFont(doc, part.bold ? fonts.bold || fonts.regular || "Helvetica" : fonts.regular || "Helvetica", fontSize);
    doc.fillColor(pdfDesignTokens.colors.text);
    const text = String(formatAnswerValue(part.value));
    doc.text(text, cursorX, y, {
      width: Math.max(12, width - (cursorX - x)),
      align: "left",
      lineBreak: false
    });
    cursorX += doc.widthOfString(text);
    doc.restore();
    restoreAnswerSurroundingTextStyle(doc, fonts, fontSize);
  });

  return baselineY - y + 4;
}

function patterningRuleResponseParts(question, display = {}) {
  if (display.patterningRuleResponseMode === "add_step") {
    return {
      prefix: "Add",
      answer: question.step,
      suffix: "each time."
    };
  }

  return {
    prefix: "Rule:",
    answer: question.patternRule || question.answer,
    suffix: ""
  };
}

function renderPatterningRow(doc, question, layoutBox, fonts = {}, display = {}) {
  const { x, y, width, height } = layoutBox;
  const mode = display.patterningLayout || question.patternKind || "";
  if (!mode || !Array.isArray(question.sequence)) return 0;

  const isExample = Boolean(display.includeExample && question.isExample && !display.answerKey);
  const showAnswers = Boolean(display.answerKey || isExample);
  const lineHeight = layout.typography.body?.lineHeight || 16;
  const fontSize = Number(display.patterningSequenceFontSize || 13);
  const labelWidth = question.isExample ? 0 : 30;
  const sequenceX = x + labelWidth;
  const sequenceWidth = Math.max(40, width - labelWidth);
  const exampleLabelGap = Number(display.patterningExampleLabelGap || 6);
  const cursorY = question.isExample ? y + exampleLabelGap : y;

  doc.save();
  doc.fillColor(pdfDesignTokens.colors.text);
  setFont(doc, fonts.regular || "Helvetica", fontSize);

  if (question.isExample) {
    setFont(doc, fonts.lightItalic || fonts.regular || "Helvetica", 9);
    doc.fillColor(pdfDesignTokens.colors.muted);
    doc.text("Example", x, y - 3, {
      width,
      align: "left",
      lineBreak: false
    });
    doc.fillColor(pdfDesignTokens.colors.text);
    setFont(doc, fonts.regular || "Helvetica", fontSize);
  } else {
    const n = patternDisplayNumber(question, display);
    doc.text(`${n})`, x, cursorY, {
      width: labelWidth - 4,
      align: "left",
      lineBreak: false
    });
  }

  if (mode === "extend_pattern") {
    const answers = Array.isArray(question.continuationAnswers) && question.continuationAnswers.length
      ? question.continuationAnswers
      : Array.isArray(question.responseValues)
        ? question.responseValues
        : splitAnswerParts(question.answer);
    const continuationCount = Math.max(1, Number(question.continuationCount || answers.length || display.patterningContinuationCount || 1));
    const visibleCount = Math.max(1, question.sequence.length - continuationCount);
    const visible = question.sequence.slice(0, visibleCount);
    const parts = visible.map((value) => ({ value }));
    for (let index = 0; index < continuationCount; index += 1) {
      parts.push({ target: true, answer: answers[index] ?? answers[0] ?? "" });
    }

    drawPatternSequenceParts(doc, parts, sequenceX, cursorY, sequenceWidth, fonts, {
      showAnswers,
      targetWidth: Number(display.patterningExtendTargetWidth || (continuationCount > 1 ? 46 : 56)),
      fontSize,
      commaGap: display.patterningCommaGap,
      targetStrokeColor: display.patterningTargetStrokeColor,
      targetStrokeWidth: display.patterningTargetStrokeWidth
    });
    doc.restore();
    return Math.max(height || 0, question.isExample ? lineHeight + 24 : lineHeight + 12);
  }

  if (mode === "missing_value_pattern") {
    const missingIndexes = Array.isArray(question.missingIndexes) ? question.missingIndexes : [];
    const answers = Array.isArray(question.responseValues) && question.responseValues.length
      ? question.responseValues
      : splitAnswerParts(question.answer);
    const parts = question.sequence.map((value, index) => {
      if (value !== null && value !== undefined) return { value };
      const answerIndex = missingIndexes.indexOf(index);
      const answer = answers[answerIndex >= 0 ? answerIndex : 0] ?? "";
      return showAnswers && isExample
        ? { value: answer, bold: true }
        : { target: true, answer };
    });
    const missingCount = Math.max(1, missingIndexes.length || answers.length || display.patterningMissingCount || 1);
    drawPatternSequenceParts(doc, parts, sequenceX, cursorY, sequenceWidth, fonts, {
      showAnswers: showAnswers && !isExample,
      targetWidth: Number(display.patterningMissingTargetWidth || (missingCount > 1 ? 48 : 58)),
      fontSize,
      commaGap: display.patterningCommaGap,
      targetStrokeColor: display.patterningTargetStrokeColor,
      targetStrokeWidth: display.patterningTargetStrokeWidth
    });
    doc.restore();
    return Math.max(height || 0, question.isExample ? lineHeight + 24 : lineHeight + 14);
  }

  if (mode === "identify_pattern_rule") {
    doc.text(question.sequence.join(", "), sequenceX, cursorY, {
      width: sequenceWidth,
      align: "left",
      lineBreak: false
    });

    const ruleY = cursorY + fontSize + 12;
    const responseFontSize = Number(display.patterningResponseFontSize || fontSize);
    setFont(doc, fonts.regular || "Helvetica", responseFontSize);
    doc.fillColor(pdfDesignTokens.colors.text);

    if (display.patterningRuleResponseMode === "add_step") {
      const response = patterningRuleResponseParts(question, display);
      doc.text(response.prefix, sequenceX, ruleY, {
        width: 26,
        align: "left",
        lineBreak: false
      });
      const lineX = sequenceX + 30;
      const lineWidth = Number(display.patterningRuleTargetWidth || 64);
      drawPatternAnswerTarget(doc, response.answer, lineX, ruleY + responseFontSize + 3, lineWidth, fonts, {
        showAnswer: showAnswers,
        fontSize: responseFontSize,
        strokeColor: display.patterningTargetStrokeColor,
        strokeWidth: display.patterningTargetStrokeWidth
      });
      restoreAnswerSurroundingTextStyle(doc, fonts, responseFontSize);
      doc.text(response.suffix, lineX + lineWidth + 8, ruleY, {
        width: Math.max(54, sequenceWidth - lineWidth - 46),
        align: "left",
        lineBreak: false
      });
      doc.restore();
      return Math.max(height || 0, question.isExample ? 64 : 56);
    }

    doc.text("Rule:", sequenceX, ruleY, {
      width: 34,
      align: "left",
      lineBreak: false
    });
    const lineX = sequenceX + 38;
    const lineWidth = Math.min(260, Math.max(120, sequenceWidth - 42));
    drawShortAnswerLine(doc, lineX, ruleY + 14, lineWidth);

    if (showAnswers) {
      drawFittedAnswerOnLine(doc, question.patternRule || question.answer, lineX, ruleY + 14, lineWidth, fonts, {
        align: "left",
      fontSize,
      minFontSize: 9
    });
      restoreAnswerSurroundingTextStyle(doc, fonts, fontSize);
    }

    doc.restore();
    return Math.max(height || 0, question.isExample ? 58 : 50);
  }

  doc.restore();
  return 0;
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

function buildGrade1DataResponseGeometry({
  x,
  y,
  width,
  promptHeight,
  responseType,
  numberGutter = 44,
  promptGap = 28,
  lineWidths = GRADE1_DATA_RESPONSE_LINE_WIDTHS
}) {
  const preferredWidth = Number(lineWidths?.[responseType]);
  if (!Number.isFinite(preferredWidth)) {
    throw new Error(`Unsupported Grade 1 data response type '${responseType || ""}'.`);
  }

  const localStartX = Number(numberGutter);
  const availableWidth = Math.max(0, Number(width) - localStartX);
  const lineWidth = Math.min(preferredWidth, availableWidth);
  const lineX = Number(x) + localStartX;
  const lineY = Number(y) + Number(promptHeight) + Number(promptGap);

  return Object.freeze({
    responseType,
    localStartX,
    lineX,
    lineY,
    lineWidth,
    lineEndX: lineX + lineWidth,
    promptX: Number(x) + localStartX,
    promptWidth: availableWidth,
    promptBottomY: Number(y) + Number(promptHeight),
    requiredHeight: Number(promptHeight) + Number(promptGap)
  });
}

function comparisonRowParts(question = {}) {
  const promptNumbers = safeStr(question.prompt).match(/\d+/g) || [];
  const left = finiteOptionalNumber(question.leftValue) ?? finiteOptionalNumber(promptNumbers[0]);
  const right = finiteOptionalNumber(question.rightValue) ?? finiteOptionalNumber(promptNumbers[1]);
  return {
    left,
    right,
    answer: question.expectedSymbol || question.comparisonResult || question.answer
  };
}

function renderGrade2ComparisonRow(doc, question, layoutBox, fonts = {}, display = {}) {
  const { x, y, width } = layoutBox;
  const parts = comparisonRowParts(question);
  if (parts.left === null || parts.right === null) return 0;

  const fontSize = Number(display.comparisonFontSize || 16);
  const targetWidth = Number(display.comparisonTargetWidth || 52);
  const numberWidth = 30;
  const operandWidth = 58;
  const gap = 12;
  const equationWidth = operandWidth * 2 + targetWidth + gap * 2;
  const availableWidth = Math.max(equationWidth, width - numberWidth);
  const equationX = x + numberWidth + Math.max(0, (availableWidth - equationWidth) / 2);
  const targetX = equationX + operandWidth + gap;
  const rightX = targetX + targetWidth + gap;
  const textY = y + 3;
  const lineY = textY + fontSize + 5;

  doc.save();
  setFont(doc, fonts.regular || "Helvetica", 12);
  doc.fillColor(pdfDesignTokens.colors.text);
  doc.text(`${question.id ?? ""})`, x, textY + 2, {
    width: numberWidth - 4,
    align: "left",
    lineBreak: false
  });

  setFont(doc, fonts.regular || "Helvetica", fontSize);
  doc.text(String(parts.left), equationX, textY, {
    width: operandWidth,
    align: "center",
    lineBreak: false
  });
  drawShortAnswerLine(doc, targetX, lineY, targetWidth);
  if (display.answerKey && parts.answer != null) {
    drawTextOnLine(doc, parts.answer, targetX, lineY, targetWidth, fonts, {
      align: "center",
      fontSize
    });
  }
  restoreAnswerSurroundingTextStyle(doc, fonts, fontSize);
  doc.text(String(parts.right), rightX, textY, {
    width: operandWidth,
    align: "center",
    lineBreak: false
  });
  doc.restore();

  return fontSize + 12;
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

  const isExampleItem = Boolean(display.includeExample && question.isExample);
  const isExample = Boolean(isExampleItem && !display.answerKey);
  const exampleCountsAsQuestion = Boolean(display.exampleCountsAsQuestion);
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
  const displayNumber = question.id != null && (!question.isExample || exampleCountsAsQuestion)
    ? display.includeExample && !exampleCountsAsQuestion
      ? Math.max(1, Number(question.id) - 1)
      : question.id
    : null;
  const numberPrefix = displayNumber != null ? `${displayNumber})  ` : "";
  const hidePrompt = Boolean(display.hideItemPrompts && question.visual);
  const promptText = `${numberPrefix}${hidePrompt ? "" : rawPrompt}`.trim();
  const hasInlineAnswerBlank = Boolean(promptText.match(/_{2,}/));
  const visual = question.visual || null;

  if (!visual?.kind && display.patterningLayout) {
    const rendered = renderPatterningRow(doc, question, layoutBox, fonts, display);
    if (rendered) return rendered;
  }

  if (!visual?.kind && display.grade2ComparisonLayout) {
    const rendered = renderGrade2ComparisonRow(doc, question, layoutBox, fonts, display);
    if (rendered) return rendered;
  }

  if (visual?.kind && (display.multiplicationModelEquation || display.multiplicationModelTotalOnly)) {
    const rendered = renderMultiplicationModelCell(doc, question, layoutBox, fonts, display);
    if (rendered) return height;
  }

  if (visual?.kind === "equal_sharing" && display.divisionModel) {
    const rendered = renderDivisionModelCell(doc, question, layoutBox, fonts, display);
    if (rendered) return height;
  }

  const promptX = x;
  const promptY = y;
  const promptWidth = width;

  doc.fillColor("#111827");
  doc.font(fonts.regular || "Helvetica");
  doc.fontSize(12);

  if (isExampleItem && !exampleCountsAsQuestion) {
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

  if (!visual?.kind && display.compactWordProblemAnswerKey && display.answerKey) {
    return renderCompactWordProblemAnswerKeyItem(doc, question, layoutBox, fonts);
  }

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
    const isGrade1DataResponseLine = Boolean(
      display.grade1DataResponseLines &&
      question.responseMode === "graph_short_answer"
    );
    const lineWidth = display.shortWritingLine
      ? Number(display.reverseNumberWordLineWidth || 46)
      : null;
    const numberWidth = display.reverseNumberWordWriting ? 24 : 44;
    const measuredPromptHeight = isGrade1DataResponseLine
      ? doc.heightOfString(rawPrompt, {
          width: Math.max(20, width - numberWidth),
          align: "left"
        })
      : promptHeight;
    const dataResponseGeometry = isGrade1DataResponseLine
      ? buildGrade1DataResponseGeometry({
          x,
          y: promptY,
          width,
          promptHeight: measuredPromptHeight,
          responseType: question.responseType,
          numberGutter: Number(display.dataResponseLineInset || numberWidth),
          promptGap: Number(display.dataResponsePromptGap || 28),
          lineWidths: display.dataResponseLineWidths || GRADE1_DATA_RESPONSE_LINE_WIDTHS
        })
      : null;
    const lineY = dataResponseGeometry
      ? dataResponseGeometry.lineY
      : display.answerLineBelowPrompt
        ? promptY + promptHeight + 18 + Number(display.answerLineExtraGap || 0)
        : promptY + lineHeight;
    const promptZoneWidth = display.reverseNumberWordWriting
      ? Math.min(
        Math.max(48, Number(display.reverseNumberWordPromptZoneWidth || 56)),
        Math.max(48, width - numberWidth - lineWidth - 10)
      )
      : null;
    const writtenNumberWordPromptWidth = display.numberWordResponseTarget === "writtenWord"
      ? Math.min(
        Math.max(18, doc.widthOfString(rawPrompt) + 12),
        Math.max(18, width * 0.28)
      )
      : null;
    const lineStartX = dataResponseGeometry
      ? dataResponseGeometry.lineX
      : display.reverseNumberWordWriting
        ? x + numberWidth + promptZoneWidth + 6
        : display.shortWritingLine
          ? x + width - lineWidth
          : display.answerLineBelowPrompt
            ? x + numberWidth
            : display.numberWordResponseTarget === "writtenWord"
              ? x + numberWidth + writtenNumberWordPromptWidth
              : x + Math.min(88, width * 0.18);
    const lineEndX = dataResponseGeometry
      ? dataResponseGeometry.lineEndX
      : display.shortWritingLine
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
      dataResponseGeometry
        ? dataResponseGeometry.requiredHeight
        : display.answerLineBelowPrompt
          ? promptHeight + 28
          : promptHeight,
      lineHeight
    );
  }

  if (display.numberLineAddition && hasInlineAnswerBlank) {
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
  } else if (!visual?.kind && display.directFactAnswerSpace && hasInlineAnswerBlank) {
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
        inlineAnswerValues: Boolean(display.answerKey || isExample),
        standardAnswerLineVisible: false,
        standardAnswerNoLineAlign: display.standardAnswerNoLineAlign || "left"
      }
    );
  } else if (!visual?.kind && display.standardShortAnswerTarget && hasInlineAnswerBlank) {
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
    const endpointSafeNumberLine = Boolean(
      hidePrompt &&
      visual.kind === "number_line" &&
      display.numberLineEndpointSafeInset
    );
    const visualCellX = hidePrompt ? x + 34 : x;
    const visualCellWidth = hidePrompt
      ? Math.max(40, width - 34 - (endpointSafeNumberLine ? 34 : 0))
      : width;
    const visualForRender = visual.kind === "ten_frame" && Number(display.tenFrameScale) > 1
      ? {
          ...visual,
          data: {
            ...(visual.data || {}),
            scale: Number(display.tenFrameScale)
          }
        }
      : visual;
    const isNumberLine = visualForRender.kind === "number_line";
    const fullContentWidthNumberLine = Boolean(display.numberLineFullContentWidth && isNumberLine);
    const fullWidthVisual = Boolean(
      isNumberLine && (display.numberLineAnswerUnderTarget || fullContentWidthNumberLine)
    );
    const region = getVisualRegion({
      cellBottomY,
      promptBottomY,
      cellX: visualCellX,
      cellWidth: visualCellWidth,
      visualKind: visualForRender.kind,
      fullWidth: fullWidthVisual,
      flushToCellBounds: fullContentWidthNumberLine
    });

    const measured = measureVisual(
      visualForRender,
      region.maxWidth,
      region.targetHeight,
      { forceFullWidth: fullContentWidthNumberLine }
    );

    const placed = placeVisualInRegionWithDisplay(region, measured, display);

    if (measured && placed) {
      try {
        const renderMeta = renderVisualByKind(doc, visualForRender, placed, measured);

        if (visualForRender.kind === "number_line" && display.numberLineAnswerUnderTarget && renderMeta?.dotX) {
          const answerTarget = buildNumberLineAnswerTargetGeometry({
            dotX: renderMeta.dotX,
            lineY: renderMeta.lineY,
            cellBottomY,
            measuredHeight: measured.height,
            pageBox: layout.page.contentBox
          });

          if ((display.answerKey || isExample) && question.answer != null) {
            drawShortAnswerLine(doc, answerTarget.x, answerTarget.y, answerTarget.width);
            drawTextOnLine(doc, question.answer, answerTarget.x, answerTarget.y, answerTarget.width, fonts);
          } else {
            drawShortAnswerLine(doc, answerTarget.x, answerTarget.y, answerTarget.width);
          }

          return height;
        }

        if (visualForRender.kind === "base_ten_blocks" && display.baseTenAlignedResponse) {
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
            short: Boolean(display.shortVisualAnswerLine),
            shortRatio: display.shortVisualAnswerLineRatio,
            yRatio: display.visualAnswerLineYRatio,
            align: display.visualAnswerLineAlign
          });
          if (line) {
            drawTextOnLine(doc, question.answer, line.x, line.y, line.width, fonts);
          }
        } else if (!hasInlineAnswerBlank) {
          drawAnswerLine(doc, region, {
            short: Boolean(display.shortVisualAnswerLine),
            shortRatio: display.shortVisualAnswerLineRatio,
            yRatio: display.visualAnswerLineYRatio,
            align: display.visualAnswerLineAlign
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

  if (visual.kind === "equal_groups") {
    return drawEqualGroupsPrimitive(doc, placed.x, placed.y, {
      ...(visual.data || {}),
      groupCols: measured.groupCols,
      itemCols: measured.itemCols,
      cellSize: measured.cellSize,
      itemGap: measured.itemGap,
      groupGap: measured.groupGap,
      groupPad: measured.groupPad,
      dotRadius: measured.dotRadius
    });
  }

  if (visual.kind === "equal_sharing") {
    return drawEqualSharingPrimitive(doc, placed.x, placed.y, {
      ...(visual.data || {}),
      sourceCols: measured.sourceCols,
      groupCols: measured.groupCols,
      itemCols: measured.itemCols,
      groupWidth: measured.groupWidth,
      groupHeight: measured.groupHeight,
      cellSize: measured.cellSize,
      gap: measured.gap,
      groupGap: measured.groupGap,
      groupPad: measured.groupPad,
      sourceGroupGap: measured.sourceGroupGap,
      dotRadius: measured.dotRadius
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

function paginateBalancedWithinCapacity(items, maxPerPage, options = {}) {
  const pageSize = Math.max(1, Math.floor(Number(maxPerPage) || 1));
  const n = items.length;
  if (n <= pageSize) return [items];

  const pageCount = Math.ceil(n / pageSize);
  const base = Math.floor(n / pageCount);
  const remainder = n % pageCount;
  const pages = [];
  let cursor = 0;

  for (let index = 0; index < pageCount; index += 1) {
    const take = base + (index < remainder ? 1 : 0);
    pages.push(items.slice(cursor, cursor + take));
    cursor += take;
  }

  const minimumFinal = Math.max(1, Math.ceil(pageSize / 3));
  const finalPage = pages[pages.length - 1] || [];
  if (
    finalPage.length < minimumFinal &&
    pages.length > 1 &&
    pages[0].length < pageSize
  ) {
    return paginateBalancedWithinCapacity(items, Math.max(1, pageSize - 1), options);
  }

  return pages;
}

function patterningDistributionMetadata(pages, capacity, cols) {
  return {
    capacity,
    columns: cols,
    pageItemCounts: pages.map((page) => page.length),
    pageStudentCounts: pages.map((page) => page.filter((item) => !item.isExample).length),
    orphanFinalPageAvoided: pages.length <= 1
      ? true
      : pages[pages.length - 1].length > 2,
    pageCount: pages.length
  };
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

function modelCellMeasurementBounds(cellWidth, rowHeight, display = {}) {
  const labelWidth = 34;
  const lineHeight = layout.typography.body?.lineHeight || 16;
  const responseHeight = 30;
  const bottomPad = 12;
  const topGap = 6;
  const modelWidth = Math.max(40, cellWidth - labelWidth);
  const modelHeight = Math.max(10, rowHeight - lineHeight - topGap - responseHeight - bottomPad - 8);

  return {
    modelWidth,
    modelHeight,
    labelWidth,
    display
  };
}

function classifyModelCellWidth(item, halfCellWidth, fullCellWidth, rowHeight, rowsPerPage, display = {}) {
  const visual = item?.visual || null;
  if (!visual?.kind) return { full: false, span: 1 };

  const bounds = modelCellMeasurementBounds(halfCellWidth, rowHeight, display);
  const measured = measureVisual(visual, bounds.modelWidth, bounds.modelHeight);
  if (!measured) return { full: false, span: 1 };

  if (visual.kind === "array" || visual.kind === "arrays") {
    const rows = Number(visual.data?.rows || 0);
    if (rows <= Number(display.arrayFullWidthRowsOver || 5)) return { full: false, span: 1 };

    return {
      full:
      measured.width > bounds.modelWidth ||
      measured.height > bounds.modelHeight * 0.72,
      span: 1
    };
  }

  if (visual.kind === "equal_groups") {
    const full = (
      measured.width > bounds.modelWidth ||
      measured.height > bounds.modelHeight
    );

    if (!full) return { full: false, span: 1 };

    const fullBounds = modelCellMeasurementBounds(fullCellWidth, rowHeight, display);
    const fullMeasured = measureVisual(visual, fullBounds.modelWidth, fullBounds.modelHeight);
    const span = fullMeasured && fullMeasured.height > fullBounds.modelHeight
      ? Math.min(Math.max(1, rowsPerPage), 2)
      : 1;

    return { full: true, span };
  }

  return { full: false, span: 1 };
}

function buildMixedModelRows(items, rowsPerPage, classifyItem) {
  const pages = [];
  let pageRows = [];
  let usedRows = 0;
  let pending = null;

  function pushRow(row) {
    const rowSpan = Math.max(1, Number(row.span || 1));
    if (usedRows + rowSpan > rowsPerPage) {
      pages.push(pageRows);
      pageRows = [];
      usedRows = 0;
    }
    pageRows.push(row);
    usedRows += rowSpan;
  }

  items.forEach((item) => {
    const classification = classifyItem(item);
    const isFull = Boolean(classification.full);

    if (isFull) {
      if (pending) {
        pushRow({ type: "half", items: [pending] });
        pending = null;
      }
      pushRow({ type: "full", items: [item], span: classification.span || 1 });
      return;
    }

    if (!pending) {
      pending = item;
      return;
    }

    pushRow({ type: "half", items: [pending, item] });
    pending = null;
  });

  if (pending) pushRow({ type: "half", items: [pending] });
  if (pageRows.length) pages.push(pageRows);

  return pages;
}

function renderMixedModelPages(doc, fonts, contentObject, options, pageState, layoutObject = null) {
  const meta = contentObject?.meta || {};
  const allItems = (
    contentObject?.content?.items && contentObject.content.items.length
      ? contentObject.content.items
      : contentObject?.problems || []
  );
  const instruction = layoutObject?.instruction || "";
  const display = layoutObject?.display || {};
  const footerRuleY = doc.page.height - layout.page.margins.bottom;
  const footerBufferH = layout.zones?.footerBuffer?.height ?? 24;
  const bottomContentY = footerRuleY - footerBufferH;
  const rowsPerPage = Math.max(
    1,
    Number(display.arrayRowsPerPage || 0) ||
      Number(display.multiplicationModelRowsPerPage || 0) ||
      Math.ceil(Number(layoutObject?.template?.maxProblemsPerPage || 8) / 2)
  );
  const { cb, colW, xForCol } = getColumns(2);
  const preInstructionStartY = renderHeader(doc, fonts, meta);
  const measuredStartY = preInstructionStartY + (instruction ? 28 : 0);
  const rowHeightForClassification = (bottomContentY - measuredStartY) / rowsPerPage;
  const pages = buildMixedModelRows(
    allItems,
    rowsPerPage,
    (item) => classifyModelCellWidth(item, colW, cb.width, rowHeightForClassification, rowsPerPage, display)
  );

  pages.forEach((pageRows, pageIndex) => {
    if (pageIndex > 0) {
      doc.addPage();
      pageState.pageNum += 1;
    }

    let startY = pageIndex === 0 ? preInstructionStartY : renderHeader(doc, fonts, meta);

    if (instruction) {
      setFont(doc, fonts.light || fonts.regular, 11);
      doc.fillColor(pdfDesignTokens.colors.muted);
      doc.text(instruction, layout.page.contentBox.x, startY - 12, {
        width: layout.page.contentBox.width,
        align: "left"
      });
      startY += 28;
    }

    const rowHeight = (bottomContentY - startY) / rowsPerPage;
    let rowCursor = 0;

    pageRows.forEach((row, rowIndex) => {
      const span = Math.max(1, Number(row.span || 1));
      const rowY = startY + rowCursor * rowHeight;
      const effectiveRowHeight = rowHeight * span;
      const isFull = row.type === "full";

      if (isFull) {
        renderQuestionItem(doc, row.items[0], {
          x: cb.x,
          y: rowY,
          width: cb.width,
          height: effectiveRowHeight,
          dividerY: null
        }, fonts, display);
      } else {
        row.items.forEach((item, colIndex) => {
          renderQuestionItem(doc, item, {
            x: xForCol(colIndex),
            y: rowY,
            width: colW,
            height: effectiveRowHeight,
            dividerY: null
          }, fonts, display);
        });

        if (row.items.length > 1) {
          const centerX = cb.x + cb.width / 2;
          doc.save();
          doc.strokeColor(pdfDesignTokens.colors.lightRule);
          doc.lineWidth(pdfDesignTokens.rules.thin);
          doc.moveTo(centerX, rowY + 4)
            .lineTo(centerX, rowY + effectiveRowHeight - 8)
            .stroke();
          doc.restore();
        }
      }

      const separatorY = rowY + effectiveRowHeight - 8;
      if (separatorY < bottomContentY - 4) {
        doc.save();
        doc.strokeColor(pdfDesignTokens.colors.lightRule);
        doc.lineWidth(pdfDesignTokens.rules.thin);
        doc.moveTo(cb.x, separatorY)
          .lineTo(cb.x + cb.width, separatorY)
          .stroke();
        doc.restore();
      }

      rowCursor += span;
    });

    drawFooter(doc, fonts, pageState.pageNum, meta);
  });
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

function buildSharedDataPictographGeometry({ x, y, width, height, categoryCount, headerHeight = 42, minimumCategoryHeight = 37 }) {
  const count = Math.max(1, Number(categoryCount) || 1);
  const numericHeaderHeight = Number(headerHeight);
  const resolvedHeaderHeight = numericHeaderHeight === 0 ? 0 : Math.max(24, numericHeaderHeight || 42);
  const resolvedHeight = Math.max(resolvedHeaderHeight + count * minimumCategoryHeight, Number(height || 218));
  const headerTop = y;
  const headerBottom = y + resolvedHeaderHeight;
  const headerCenterY = (headerTop + headerBottom) / 2;
  const header = Object.freeze({
    top: headerTop,
    bottom: headerBottom,
    centerY: headerCenterY,
    titleCell: Object.freeze({ top: headerTop, bottom: headerBottom, centerY: headerCenterY }),
    keyCell: Object.freeze({ top: headerTop, bottom: headerBottom, centerY: headerCenterY }),
    keySymbolCenterY: headerCenterY
  });
  const body = Object.freeze({
    top: header.bottom,
    bottom: y + resolvedHeight,
    height: resolvedHeight - resolvedHeaderHeight
  });
  const categoryHeight = body.height / count;
  const categoryBands = Object.freeze(Array.from({ length: count }, (_, index) => {
    const top = body.top + index * categoryHeight;
    const bottom = index === count - 1 ? body.bottom : top + categoryHeight;
    const centerY = (top + bottom) / 2;
    return Object.freeze({
      top,
      bottom,
      height: bottom - top,
      containerTop: body.top,
      containerBottom: body.bottom,
      centerY,
      labelBaselineY: centerY,
      labelArea: Object.freeze({ top, bottom, height: bottom - top }),
      symbolArea: Object.freeze({ top, bottom, height: bottom - top }),
      bottomPadding: (bottom - top - 16) / 2
    });
  }));

  return Object.freeze({
    x,
    y,
    width,
    height: resolvedHeight,
    header,
    body,
    categoryHeight,
    categoryBands
  });
}

function buildSharedDataScenarioGeometry({
  x,
  y,
  width,
  measuredHeight,
  lineHeight = 13,
  maxLines = 2,
  gapAfter = 14
}) {
  const height = Number(measuredHeight) || 0;
  const resolvedLineHeight = Math.max(1, Number(lineHeight) || 13);
  const lineCount = Math.max(1, Math.ceil(height / resolvedLineHeight));
  return Object.freeze({
    x: Number(x),
    y: Number(y),
    width: Number(width),
    height,
    lineHeight: resolvedLineHeight,
    lineCount,
    maxLines: Number(maxLines) || 2,
    bottom: Number(y) + height,
    nextY: Number(y) + height + Number(gapAfter || 0),
    align: "left"
  });
}

function buildConstructionGraphCategories(task, answerKey = false) {
  return (task?.rows || []).map((row) => ({
    label: row.label,
    value: answerKey ? row.targetValue : row.visibleCount
  }));
}

function matchChoiceStrokeWidth(choice, answerKey = false) {
  return answerKey && choice?.isCorrect ? 2 : 0.8;
}

function buildFractionStripGeometry({
  x,
  y,
  width,
  height,
  partitionCount,
  allowedPartitionCounts = GRADE1_FRACTION_ALLOWED_DENOMINATORS
}) {
  const parts = Math.max(1, Number(partitionCount) || 1);
  if (!allowedPartitionCounts.includes(parts)) {
    throw new Error(`Unsupported fraction partition count '${parts}'.`);
  }
  const partWidth = width / parts;
  return Object.freeze({
    x,
    y,
    width,
    height,
    partitionCount: parts,
    partWidth,
    parts: Object.freeze(Array.from({ length: parts }, (_, index) => Object.freeze({
      x: x + index * partWidth,
      y,
      width: index === parts - 1 ? x + width - (x + index * partWidth) : partWidth,
      height
    })))
  });
}

function drawFractionStripPrimitive(doc, model, box, shadedParts = model?.shadedParts || 0, options = {}) {
  const geometry = buildFractionStripGeometry({
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
    partitionCount: model.partitionCount,
    allowedPartitionCounts: options.allowedPartitionCounts
  });
  const shadeCount = Math.max(0, Math.min(geometry.partitionCount, Number(shadedParts) || 0));
  doc.save();
  for (let index = 0; index < shadeCount; index += 1) {
    const part = geometry.parts[index];
    doc.fillColor("#d1d5db").rect(part.x, part.y, part.width, part.height).fill();
    doc.save();
    doc.rect(part.x, part.y, part.width, part.height).clip();
    doc.strokeColor("#9ca3af").lineWidth(0.45);
    for (let startX = part.x - part.height; startX < part.x + part.width; startX += 9) {
      doc.moveTo(startX, part.y + part.height).lineTo(startX + part.height, part.y).stroke();
    }
    doc.restore();
  }
  doc.strokeColor(pdfDesignTokens.colors.text).lineWidth(0.95).rect(box.x, box.y, box.width, box.height).stroke();
  for (let index = 1; index < geometry.partitionCount; index += 1) {
    const dividerX = box.x + index * geometry.partWidth;
    doc.moveTo(dividerX, box.y).lineTo(dividerX, box.y + box.height).stroke();
  }
  doc.restore();
  return geometry;
}

function drawChoiceTarget(doc, fonts, { x, y, label, selected = false, diameter = GRADE1_FRACTION_SELECTION_TARGET_DIAMETER }) {
  const radius = diameter / 2;
  doc.save();
  doc.strokeColor(pdfDesignTokens.colors.text).lineWidth(selected ? 2.2 : 0.85);
  doc.circle(x, y, radius).stroke();
  if (selected) {
    doc.moveTo(x - 5, y).lineTo(x - 1, y + 5).lineTo(x + 7, y - 6).stroke();
  }
  setFont(doc, selected ? fonts.bold : fonts.regular, 10.5);
  doc.fillColor(pdfDesignTokens.colors.text);
  doc.text(label, x - 30, y + radius + 4, { width: 60, align: "center", lineBreak: false });
  doc.restore();
}

function buildDivisibleObjectGeometry(model, x, y, { half = false, compact = false } = {}) {
  const shape = half ? model.halfShape : model.wholeShape;
  const scale = compact ? 0.82 : 1;
  const dimensions = {
    apple_whole: [15, 14],
    apple_semicircle: [7.5, 14],
    sandwich_rectangle: [15, 14],
    sandwich_triangle: [15, 14],
    granola_bar_rectangle: [24, 10],
    granola_bar_half_width_rectangle: [12, 10],
    paper_strip_rectangle: [28, 7],
    paper_strip_half_width_rectangle: [14, 7]
  }[shape];
  if (!dimensions) throw new Error(`Unsupported divisible-object shape '${shape || ""}'.`);
  const width = dimensions[0] * scale;
  const height = dimensions[1] * scale;
  return {
    shape,
    objectType: model.objectType,
    x,
    y,
    width,
    height,
    left: x - width / 2,
    top: y - height / 2,
    areaFraction: half ? 0.5 : 1,
    distinctHalfShape: half,
    usesWholeShapeDivider: false
  };
}

function drawDivisibleObjectShape(doc, model, x, y, { half = false, compact = false, muted = false } = {}) {
  const geometry = buildDivisibleObjectGeometry(model, x, y, { half, compact });
  doc.save();
  doc.strokeColor(muted ? pdfDesignTokens.colors.lightRule : pdfDesignTokens.colors.text).lineWidth(0.8);
  if (geometry.shape === "apple_whole") {
    doc.ellipse(x, y, geometry.width / 2, geometry.height / 2).stroke();
    doc.moveTo(x, geometry.top).lineTo(x + 1.5, geometry.top - 3).stroke();
  } else if (geometry.shape === "apple_semicircle") {
    const flatX = geometry.left;
    const rightX = geometry.left + geometry.width;
    doc.moveTo(flatX, geometry.top)
      .bezierCurveTo(rightX, geometry.top + 1, rightX, geometry.top + geometry.height - 1, flatX, geometry.top + geometry.height)
      .lineTo(flatX, geometry.top)
      .stroke();
    doc.moveTo(flatX + 1.5, geometry.top + geometry.height * 0.38)
      .lineTo(flatX + 3, geometry.top + geometry.height * 0.38).stroke();
    doc.moveTo(flatX + 1.5, geometry.top + geometry.height * 0.62)
      .lineTo(flatX + 3, geometry.top + geometry.height * 0.62).stroke();
  } else if (geometry.shape === "sandwich_triangle") {
    doc.moveTo(geometry.left, geometry.top + geometry.height)
      .lineTo(geometry.left, geometry.top)
      .lineTo(geometry.left + geometry.width, geometry.top + geometry.height)
      .closePath().stroke();
  } else {
    doc.rect(geometry.left, geometry.top, geometry.width, geometry.height).stroke();
  }
  doc.restore();
  return geometry;
}

function drawDivisibleObjectSet(doc, model, { x, y, width, count, compact = false, muted = false }) {
  const wholeGeometry = buildDivisibleObjectGeometry(model, 0, 0, { compact });
  const maxColumnsForWidth = Math.max(1, Math.floor(width / (wholeGeometry.width + 5)));
  const columns = Math.min(5, Math.max(1, count), maxColumnsForWidth);
  const gapX = columns === 1
    ? 0
    : Math.min(36, (width - wholeGeometry.width) / (columns - 1));
  const startX = x + (width - (columns - 1) * gapX) / 2;
  for (let index = 0; index < count; index += 1) {
    const row = Math.floor(index / columns);
    const column = index % columns;
    drawDivisibleObjectShape(doc, model, startX + column * gapX, y + row * 22, { compact, muted });
  }
}

function drawFairShareModel(doc, fonts, model, answerState, box, { showAnswer = false, compact = false } = {}) {
  const sourceWidth = compact ? 92 : 132;
  const gap = compact ? 12 : 18;
  const trayAreaX = box.x + sourceWidth + gap;
  const trayAreaWidth = box.width - sourceWidth - gap;
  const trayColumns = model.sharerCount === 4 ? 2 : model.sharerCount;
  const trayRows = Math.ceil(model.sharerCount / trayColumns);
  const trayGap = compact ? 7 : 10;
  const trayWidth = (trayAreaWidth - (trayColumns - 1) * trayGap) / trayColumns;
  const trayHeight = (box.height - (trayRows - 1) * trayGap) / trayRows;

  setFont(doc, fonts.regular, compact ? 8 : 9.5);
  doc.fillColor(pdfDesignTokens.colors.muted);
  doc.text(compact ? `Start: ${model.pluralNoun}` : `Starting ${model.pluralNoun}`, box.x, box.y - 15, { width: sourceWidth, align: "center", lineBreak: false });
  drawDivisibleObjectSet(doc, model, {
    x: box.x,
    y: box.y + 12,
    width: sourceWidth,
    count: model.wholeEquivalentTotal,
    compact,
    muted: showAnswer
  });

  const trays = [];
  for (let index = 0; index < model.sharerCount; index += 1) {
    const row = Math.floor(index / trayColumns);
    const column = index % trayColumns;
    const trayX = trayAreaX + column * (trayWidth + trayGap);
    const trayY = box.y + row * (trayHeight + trayGap);
    doc.save();
    doc.strokeColor(pdfDesignTokens.colors.lightRule).lineWidth(0.85);
    doc.roundedRect(trayX, trayY, trayWidth, trayHeight, 4).stroke();
    setFont(doc, fonts.regular, compact ? 8 : 9);
    doc.fillColor(pdfDesignTokens.colors.muted);
    doc.text(`Child ${index + 1}`, trayX + 5, trayY + 5, { width: trayWidth - 10, align: "left", lineBreak: false });
    doc.restore();
    if (showAnswer) {
      const wholeCount = answerState.trayWholeObjects[index];
      const tokensPerRow = Math.min(4, Math.max(1, wholeCount));
      const wholeGeometry = buildDivisibleObjectGeometry(model, 0, 0, { compact });
      const tokenGap = wholeGeometry.width + (compact ? 4 : 6);
      const wholeAreaWidth = trayWidth - (compact ? 30 : 42);
      const tokenStartX = trayX + 8 + wholeAreaWidth / 2 - ((tokensPerRow - 1) * tokenGap) / 2;
      for (let tokenIndex = 0; tokenIndex < wholeCount; tokenIndex += 1) {
        drawDivisibleObjectShape(
          doc,
          model,
          tokenStartX + (tokenIndex % tokensPerRow) * tokenGap,
          trayY + (compact ? 28 : 31) + Math.floor(tokenIndex / tokensPerRow) * 17,
          { compact }
        );
      }
      const halfCount = answerState.trayHalfObjects[index];
      for (let halfIndex = 0; halfIndex < halfCount; halfIndex += 1) {
        drawDivisibleObjectShape(doc, model, trayX + trayWidth - 14 - halfIndex * 16, trayY + trayHeight - 14, {
          half: true,
          compact
        });
      }
    }
    trays.push({ x: trayX, y: trayY, width: trayWidth, height: trayHeight });
  }
  return { sourceWidth, trayAreaX, trayAreaWidth, trays };
}

function renderSharedFractionPages(doc, fonts, contentObject, pageState, layoutObject) {
  const meta = contentObject.meta || {};
  const items = contentObject.content?.items || [];
  const display = layoutObject.display || {};
  const taskMode = display.fractionTaskMode || display.grade1FractionTaskMode;
  const answerKey = Boolean(display.answerKey);
  const instruction = layoutObject.instruction || "";
  const expectedModelKind = taskMode === "share_fairly"
    ? GRADE1_FRACTION_RENDERER_VARIANTS.fair_share_set
    : GRADE1_FRACTION_RENDERER_VARIANTS.fraction_strip;
  if (!items.length || items.some((item) => item.fractionModel?.kind !== expectedModelKind)) {
    throw new Error(`Fraction task '${taskMode || ""}' is missing its '${expectedModelKind}' visual model.`);
  }
  const cb = layout.page.contentBox;
  const footerRuleY = doc.page.height - layout.page.margins.bottom;
  const bottomContentY = footerRuleY - (layout.zones?.footerBuffer?.height ?? 24);
  let startY = renderHeader(doc, fonts, meta);

  setFont(doc, fonts.regular, 12);
  doc.fillColor(pdfDesignTokens.colors.text);
  doc.text(instruction, cb.x, startY - 12, { width: cb.width, align: "left" });
  startY += 30;

  const worked = items.find((item) => item.fractionWorkedModel)?.fractionWorkedModel || null;
  if (worked && display.separateWorkedModel) {
    const workedHeight = taskMode === "share_fairly" ? 104 : 76;
    doc.save();
    doc.fillColor("#f7f7f7").strokeColor(pdfDesignTokens.colors.lightRule).lineWidth(0.8);
    doc.roundedRect(cb.x, startY, cb.width, workedHeight, 5).fillAndStroke();
    setFont(doc, fonts.bold, 10.5);
    doc.fillColor(pdfDesignTokens.colors.text);
    doc.text(GRADE1_FRACTION_EXAMPLE_LABEL, cb.x + 12, startY + 9, { width: 90, lineBreak: false });
    if (taskMode === "shade_equal_parts") {
      setFont(doc, fonts.regular, 11);
      doc.text(worked.prompt, cb.x + 112, startY + 9, { width: 90, lineBreak: false });
      drawFractionStripPrimitive(
        doc,
        worked.model,
        { x: cb.x + 230, y: startY + 15, width: 210, height: 44 },
        worked.answerState.shadedParts
      );
    } else {
      setFont(doc, fonts.regular, 9.5);
      doc.text(worked.prompt, cb.x + 12, startY + 28, { width: 180, lineBreak: false });
      drawFairShareModel(
        doc,
        fonts,
        worked.model,
        worked.answerState,
        { x: cb.x + 194, y: startY + 24, width: cb.width - 206, height: 68 },
        { showAnswer: true, compact: true }
      );
    }
    doc.restore();
    startY += workedHeight + 14;
  }

  if (taskMode === "shade_equal_parts") {
    const gap = 18;
    const cellWidth = (cb.width - gap) / 2;
    const rowCount = Math.ceil(items.length / 2);
    const rowHeight = (bottomContentY - startY) / rowCount;
    items.forEach((item, index) => {
      const row = Math.floor(index / 2);
      const column = index % 2;
      const x = cb.x + column * (cellWidth + gap);
      const y = startY + row * rowHeight;
      setFont(doc, fonts.bold, 11);
      doc.fillColor(pdfDesignTokens.colors.text);
      doc.text(`${index + 1}.`, x, y + 4, { width: 24, lineBreak: false });
      setFont(doc, fonts.regular, 13);
      doc.text(item.prompt, x + 26, y + 2, { width: cellWidth - 32, lineBreak: false });
      const model = item.fractionModel.models[0];
      drawFractionStripPrimitive(
        doc,
        model,
        { x: x + (cellWidth - 176) / 2, y: y + 40, width: 176, height: 62 },
        answerKey ? item.answerState.shadedParts : 0,
        { allowedPartitionCounts: display.fractionAllowedDenominators }
      );
    });
  } else if (taskMode === "half_two_fourths") {
    const rowHeight = (bottomContentY - startY) / 4;
    items.forEach((item, index) => {
      const y = startY + index * rowHeight;
      const models = item.fractionModel.models;
      setFont(doc, fonts.bold, 11);
      doc.fillColor(pdfDesignTokens.colors.text);
      doc.text(`${index + 1}.`, cb.x, y + 7, { width: 22, lineBreak: false });
      const modelWidth = 168;
      const modelHeight = 42;
      const leftX = cb.x + 36;
      const rightX = cb.x + 244;
      item.fractionModel.labels.forEach((label, labelIndex) => {
        const x = labelIndex === 0 ? leftX : rightX;
        setFont(doc, fonts.regular, 10.5);
        doc.text(label, x, y + 2, { width: modelWidth, align: "center", lineBreak: false });
      });
      drawFractionStripPrimitive(doc, models[0], { x: leftX, y: y + 23, width: modelWidth, height: modelHeight });
      drawFractionStripPrimitive(doc, models[1], { x: rightX, y: y + 23, width: modelWidth, height: modelHeight });
      const selected = answerKey ? item.answerState.choice : null;
      drawChoiceTarget(doc, fonts, { x: cb.x + 444, y: y + 34, label: "Yes", selected: selected === "Yes" });
      drawChoiceTarget(doc, fonts, { x: cb.x + 492, y: y + 34, label: "No", selected: selected === "No" });
      if (index < items.length - 1) {
        doc.save().strokeColor(pdfDesignTokens.colors.lightRule).lineWidth(0.5)
          .moveTo(cb.x, y + rowHeight - 8).lineTo(cb.x + cb.width, y + rowHeight - 8).stroke().restore();
      }
    });
  } else if (taskMode === "compare_fair_shares") {
    const gap = 18;
    const cellWidth = (cb.width - gap) / 2;
    const rowHeight = (bottomContentY - startY) / 3;
    items.forEach((item, index) => {
      const row = Math.floor(index / 2);
      const column = index % 2;
      const x = cb.x + column * (cellWidth + gap);
      const y = startY + row * rowHeight;
      setFont(doc, fonts.bold, 11);
      doc.fillColor(pdfDesignTokens.colors.text);
      doc.text(`${index + 1}.`, x, y + 3, { width: 22, lineBreak: false });
      const models = item.fractionModel.models;
      const modelWidth = 94;
      const leftX = x + 25;
      const rightX = x + cellWidth - modelWidth - 8;
      item.fractionModel.labels.forEach((label, labelIndex) => {
        const labelX = labelIndex === 0 ? leftX : rightX;
        setFont(doc, fonts.regular, 9.5);
        doc.text(label, labelX, y + 2, { width: modelWidth, align: "center", lineBreak: false });
      });
      drawFractionStripPrimitive(doc, models[0], { x: leftX, y: y + 22, width: modelWidth, height: 38 });
      drawFractionStripPrimitive(doc, models[1], { x: rightX, y: y + 22, width: modelWidth, height: 38 });
      const selected = answerKey || item.isExample ? item.answerState.choice : null;
      const choiceY = y + 82;
      drawChoiceTarget(doc, fonts, { x: x + 47, y: choiceY, label: "Left", selected: selected === "left" });
      drawChoiceTarget(doc, fonts, { x: x + cellWidth / 2, y: choiceY, label: "Same", selected: selected === "Same" });
      drawChoiceTarget(doc, fonts, { x: x + cellWidth - 47, y: choiceY, label: "Right", selected: selected === "right" });
    });
  } else if (taskMode === "share_fairly") {
    const rowHeight = (bottomContentY - startY) / 3;
    items.forEach((item, index) => {
      const y = startY + index * rowHeight;
      setFont(doc, fonts.bold, 11);
      doc.fillColor(pdfDesignTokens.colors.text);
      doc.text(`${index + 1}.`, cb.x, y + 3, { width: 22, lineBreak: false });
      setFont(doc, fonts.regular, 11.5);
      doc.text(item.prompt, cb.x + 24, y + 1, { width: cb.width - 24, lineBreak: false });
      drawFairShareModel(
        doc,
        fonts,
        item.fractionModel,
        item.answerState,
        { x: cb.x + 4, y: y + 35, width: cb.width - 8, height: rowHeight - 45 },
        { showAnswer: answerKey }
      );
    });
  } else {
    throw new Error(`Unsupported fraction renderer task '${taskMode || ""}'.`);
  }

  drawFooter(doc, fonts, pageState.pageNum, meta);
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

  if (display.grade1FractionRenderer || display.sharedFractionRenderer) {
    renderSharedFractionPages(doc, fonts, contentObject, pageState, layoutObject);
    return;
  }

  function renderSharedDataScenario(startAtY) {
    if (!display.sharedDataPictograph || !display.sharedDataGraph) return startAtY;
    const scenario = String(display.sharedDataScenario || display.sharedDataGraph.scenario || "").trim();
    if (!scenario) return startAtY;

    const x = layout.page.contentBox.x;
    const width = layout.page.contentBox.width;
    const fontSize = 10;
    const lineHeight = 13;
    setFont(doc, fonts.regular || "Helvetica", fontSize);
    doc.fillColor(pdfDesignTokens.colors.muted);
    const measuredHeight = doc.heightOfString(scenario, {
      width,
      align: "left",
      lineGap: 0
    });
    const geometry = buildSharedDataScenarioGeometry({
      x,
      y: startAtY - 4,
      width,
      measuredHeight,
      lineHeight,
      maxLines: 2,
      gapAfter: 14
    });
    doc.text(scenario, geometry.x, geometry.y, {
      width: geometry.width,
      align: geometry.align,
      lineGap: 0
    });
    return geometry.nextY;
  }

  function renderSharedDataGraph(startAtY, config = {}) {
    const graph = config.graph || display.sharedDataGraph;
    if ((!display.sharedDataPictograph && !config.graph) || !graph) return startAtY;
    const categories = Array.isArray(graph.categories) ? graph.categories : [];
    if (!categories.length) return startAtY;

    const x = config.x ?? layout.page.contentBox.x;
    const width = config.width ?? layout.page.contentBox.width;
    const geometry = buildSharedDataPictographGeometry({
      x,
      y: startAtY,
      width,
      height: config.height || display.sharedDataGraphHeight || 218,
      categoryCount: categories.length,
      headerHeight: config.headerHeight ?? 42,
      minimumCategoryHeight: config.minimumCategoryHeight ?? 37
    });
    const height = geometry.height;
    const rowTop = geometry.body.top;
    const labelWidth = config.labelWidth || 104;

    doc.save();
    doc.lineWidth(0.8);
    doc.strokeColor(pdfDesignTokens.colors.lightRule);
    doc.roundedRect(x, startAtY, width, height, 4).stroke();

    if (config.showHeader !== false) {
      setFont(doc, fonts.bold || fonts.regular, config.titleSize || 12);
      doc.fillColor(pdfDesignTokens.colors.text);
      const title = config.title || graph.title || "Pictograph";
      const titleWidth = config.showKey === false ? width - 24 : width * 0.58;
      const titleHeight = doc.heightOfString(title, { width: titleWidth, lineBreak: false });
      const titleY = geometry.header.centerY - titleHeight / 2;
      doc.text(title, x + 12, titleY, {
        width: titleWidth,
        align: "left",
        lineBreak: false
      });

      if (config.showKey !== false) {
        const keyX = x + width - 126;
        const keyY = geometry.header.centerY;
        doc.circle(keyX, keyY, config.compact ? 5 : 7).stroke();
        setFont(doc, fonts.regular, config.compact ? 8.5 : 10);
        const keyText = String(graph.keyText || "= 1 unit");
        const keyTextHeight = doc.heightOfString(keyText, { width: 94, lineBreak: false });
        doc.text(keyText, keyX + 13, geometry.header.centerY - keyTextHeight / 2, {
          width: 94,
          align: "left",
          lineBreak: false
        });
      }
    }

    if (config.showHeader !== false) doc.moveTo(x, rowTop).lineTo(x + width, rowTop).stroke();
    doc.moveTo(x + labelWidth, rowTop).lineTo(x + labelWidth, startAtY + height).stroke();

    categories.forEach((category, index) => {
      const band = geometry.categoryBands[index];
      const rowY = band.top;
      const centerY = band.centerY;
      if (index > 0) {
        doc.moveTo(x, rowY).lineTo(x + width, rowY).stroke();
      }

      setFont(doc, fonts.regular, config.compact ? 8.5 : 11);
      doc.fillColor(pdfDesignTokens.colors.text);
      doc.text(String(category.label || ""), x + 10, centerY - 7, {
        width: labelWidth - 18,
        align: "left",
        lineBreak: false
      });

      const count = Math.max(0, Math.min(8, Number(category.value) || 0));
      const symbolStartX = x + labelWidth + (config.symbolInset ?? (config.compact ? 14 : 24));
      const symbolGap = config.symbolGap ?? (config.compact ? 18 : 31);
      const symbolRadius = (config.symbolDiameter ?? (config.compact ? 10 : 16)) / 2;
      for (let symbolIndex = 0; symbolIndex < count; symbolIndex += 1) {
        doc.circle(symbolStartX + symbolIndex * symbolGap, centerY, symbolRadius).stroke();
      }
    });

    doc.restore();
    return startAtY + height + 14;
  }

  function renderDataTable(rows, y, { compact = false } = {}) {
    const x = layout.page.contentBox.x;
    const width = layout.page.contentBox.width;
    const height = compact ? 34 : 52;
    const cellWidth = width / rows.length;
    doc.save();
    doc.strokeColor(pdfDesignTokens.colors.lightRule).lineWidth(0.7);
    doc.roundedRect(x, y, width, height, 3).stroke();
    rows.forEach((row, index) => {
      const cellX = x + index * cellWidth;
      if (index) doc.moveTo(cellX, y).lineTo(cellX, y + height).stroke();
      setFont(doc, fonts.regular, compact ? 8.5 : 10);
      doc.fillColor(pdfDesignTokens.colors.muted);
      doc.text(String(row.label), cellX + 4, y + (compact ? 5 : 8), { width: cellWidth - 8, align: "center", lineBreak: false });
      setFont(doc, fonts.bold || fonts.regular, compact ? 11 : 14);
      doc.fillColor(pdfDesignTokens.colors.text);
      doc.text(String(row.value), cellX + 4, y + (compact ? 18 : 28), { width: cellWidth - 8, align: "center", lineBreak: false });
    });
    doc.restore();
    return y + height + (compact ? 8 : 14);
  }

  function renderMatchItem(item, number, y) {
    const graph = item.graphData;
    const task = item.graphTaskData;
    const x = layout.page.contentBox.x;
    const width = layout.page.contentBox.width;
    setFont(doc, fonts.bold || fonts.regular, 11);
    doc.fillColor(pdfDesignTokens.colors.text);
    doc.text(`${number}. ${graph.title}`, x, y, { width, lineBreak: false });
    setFont(doc, fonts.regular, 9.5);
    doc.fillColor(pdfDesignTokens.colors.muted);
    doc.text(graph.scenario, x, y + 17, { width, lineBreak: false });
    let nextY = renderDataTable(task.dataTable, y + 34, { compact: true });
    doc.save();
    doc.strokeColor(pdfDesignTokens.colors.text).lineWidth(0.8);
    doc.circle(x + 8, nextY + 5, 5).stroke();
    setFont(doc, fonts.regular, 8.5);
    doc.fillColor(pdfDesignTokens.colors.text);
    doc.text(String(graph.keyText), x + 18, nextY, { width: width - 18, lineBreak: false });
    doc.restore();
    nextY += 18;
    const gap = 18;
    const choiceWidth = (width - gap) / 2;
    task.choices.forEach((choice, index) => {
      const choiceX = x + index * (choiceWidth + gap);
      const targetX = choiceX + 10;
      const targetY = nextY + 10;
      doc.save();
      doc.strokeColor(pdfDesignTokens.colors.text).lineWidth(matchChoiceStrokeWidth(choice, display.answerKey));
      doc.circle(targetX, targetY, GRADE1_DATA_MATCH_SELECTION_TARGET_DIAMETER / 2).stroke();
      setFont(doc, fonts.bold || fonts.regular, 10);
      doc.fillColor(pdfDesignTokens.colors.text);
      doc.text(choice.id, targetX - 5, targetY - 5.5, { width: 10, align: "center", lineBreak: false });
      doc.restore();
      renderSharedDataGraph(nextY + 22, {
        graph: { ...graph, categories: choice.categories },
        x: choiceX,
        width: choiceWidth,
        height: 138,
        headerHeight: 0,
        minimumCategoryHeight: 34.5,
        labelWidth: 70,
        showHeader: false,
        showKey: false,
        compact: true
      });
    });
    return nextY + 176;
  }

  const hasVisuals = allItems.some((item) => item.visual);
  const isReverseNumberWordLayout = Boolean(display.reverseNumberWordWriting);

  if (
    Boolean(display.enableMeasuredMixedModelGrid) &&
    hasVisuals &&
    (
      allItems.some((item) => item.visual?.kind === "array" || item.visual?.kind === "arrays") ||
      allItems.some((item) => item.visual?.kind === "equal_groups" && display.multiplicationModelFamily === "equal_groups")
    )
  ) {
    renderMixedModelPages(doc, fonts, contentObject, options, pageState, layoutObject);
    return;
  }

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
    startY += display.sharedDataScenario ? 18 : 28;
  }

  if (display.grade1DataTaskMode === "complete_graph") {
    startY = renderSharedDataScenario(startY);
    const task = allItems[0]?.graphTaskData;
    startY = renderDataTable(task.dataTable, startY);
    const rows = buildConstructionGraphCategories(task, display.answerKey);
    const construction = display.constructionPictograph || {};
    renderSharedDataGraph(startY, {
      graph: { ...allItems[0].graphData, categories: rows },
      width: construction.width,
      height: construction.height,
      headerHeight: construction.headerHeight,
      minimumCategoryHeight: construction.categoryHeight,
      labelWidth: construction.labelWidth,
      symbolDiameter: construction.symbolDiameter,
      symbolGap: construction.symbolGap,
      symbolInset: construction.symbolInset
    });
    drawFooter(doc, fonts, pageState.pageNum, meta);
    return;
  }

  if (display.grade1DataTaskMode === "match_graph") {
    allItems.forEach((item, index) => {
      startY = renderMatchItem(item, index + 1, startY) + (index < allItems.length - 1 ? 14 : 0);
    });
    drawFooter(doc, fonts, pageState.pageNum, meta);
    return;
  }

  startY = renderSharedDataScenario(startY);
  startY = renderSharedDataGraph(startY);

  setFont(doc, fonts.regular, bodyStyle.size);
  doc.fillColor(pdfDesignTokens.colors.text);

  const maxPerPage = isReverseNumberWordLayout
    ? 30
    : hasVisuals
    ? cols * questionsPerColumn
    : Math.max(1, layoutMaxProblemsPerPage || cols * questionsPerColumn);
  const pages = display.patterningLayout
    ? paginateBalancedWithinCapacity(allItems, maxPerPage)
    : isReverseNumberWordLayout
      ? paginateSequential(allItems, maxPerPage)
      : paginateEven(allItems, maxPerPage);

  if (display.patterningLayout && layoutObject) {
    layoutObject.patterningPagination = patterningDistributionMetadata(pages, maxPerPage, cols);
  }

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
        startY += display.sharedDataScenario ? 18 : 28;
      }

      startY = renderSharedDataScenario(startY);
      startY = renderSharedDataGraph(startY);

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
    const pageDisplay = display.patterningLayout
      ? {
          ...display,
          denseGridRows: Math.max(
            1,
            Math.ceil(pageItems.length / Math.max(1, pageCols))
          )
        }
      : display;
    const columns = pageDisplay.sequentialColumnFill
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
      pageDisplay
    );
  },
	  itemGap,
	  pageQuestionsPerColumn,
	  pageDisplay
	);

    drawFooter(doc, fonts, pageState.pageNum, meta);
  });
}

function renderAnswerKey(doc, fonts, contentObject, options, pageState, layoutObject = null) {
  const meta = contentObject?.meta || {};
  const answers = buildAnswerKeyItems(contentObject?.content?.items || []);
  if (!answers.length) return;
  const worksheetType = layoutObject?.worksheetType || "";
  const compactWordProblemAnswerKey = Boolean(
    worksheetType === "word_problem" && layoutObject?.display?.compactWordProblemAnswerKey
  );

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
        layoutObject?.display?.skipCountingRow ||
        layoutObject?.display?.patterningLayout
        ? it.prompt
        : filledAnswerText(it.prompt, ans)
    };
  });

  const answerKeyMeta = compactWordProblemAnswerKey
    ? {
        ...meta,
        title: safeStr(meta.title).trim() || "Worksheet",
        subheading: "Answer Key"
      }
    : {
        ...meta,
        title: `${safeStr(meta.title).trim() || "Worksheet"} ANSWER KEY`,
        subheading: ""
      };

  renderQuestionsPages(
    doc,
    fonts,
    {
      meta: {
        ...answerKeyMeta
      },
      content: {
        items: answerItems
      }
    },
    options,
    pageState,
    {
      ...(layoutObject || {}),
      instruction: compactWordProblemAnswerKey ? "" : layoutObject?.instruction,
      template: compactWordProblemAnswerKey
        ? {
            ...(layoutObject?.template || {}),
            columns: 1,
            maxProblemsPerPage: 6
          }
        : layoutObject?.template,
      display: {
        ...(layoutObject?.display || {}),
        answerKey: true,
        ...(compactWordProblemAnswerKey
          ? {
              workSpaceBox: false,
              compactWordProblemAnswerKey: true,
              equalHeightItems: true,
              denseGridRows: 6,
              sequentialColumnFill: true,
              hideItemSeparators: true
            }
          : {})
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

module.exports = {
  renderWorksheetPDF,
  buildAnswerKeyItems,
  __test: {
    getVisualRegion,
    measureEqualGroupsVisual,
    measureNumberLineVisual,
    buildNumberLineAnswerTargetGeometry,
    buildSharedDataPictographGeometry,
    buildSharedDataScenarioGeometry,
    buildConstructionGraphCategories,
    matchChoiceStrokeWidth,
    buildFractionStripGeometry,
    drawFractionStripPrimitive,
    buildCompactWordProblemAnswerKeyGeometry,
    buildDivisibleObjectGeometry,
    drawDivisibleObjectShape,
    drawFairShareModel,
    buildGrade1DataResponseGeometry,
    GRADE1_DATA_RESPONSE_LINE_WIDTHS,
    GRADE1_DATA_MATCH_SELECTION_TARGET_DIAMETER,
    GRADE1_FRACTION_SELECTION_TARGET_DIAMETER,
    GRADE1_FRACTION_EXAMPLE_LABEL,
    GRADE1_FRACTION_RENDERER_VARIANTS,
    patterningRuleResponseParts,
    comparisonRowParts
  }
};
