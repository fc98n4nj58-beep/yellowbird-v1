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

function buildAnswerKeyItems(items) {
  return items.filter(isEquation).map((it) => ({
    id: it.id,
    prompt: safeStr(it.prompt),
    answer: it.answer,
    a: it.a,
    b: it.b,
    op: it.op,
  }));
}

function promptWithoutEquals(prompt) {
  return safeStr(prompt).replace(/\s*=\s*$/, "").trim();
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

  doc.save();
  doc.lineWidth(1);
  doc.strokeColor("#6b7280");
  doc.fillColor("#6b7280");

  let remaining = filled;

  for (let f = 0; f < frames; f++) {
    const frameX = x + f * (frameWidth + frameGap);

    for (let i = 0; i < 10; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;

      const cellX = frameX + col * (cellSize + cellGap);
      const cellY = y + row * (cellSize + cellGap);

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

  return rows * cellSize + (rows - 1) * cellGap;
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

  for (let i = 0; i <= steps; i++) {
    const tickX = startX + i * stepWidth;
    const tickValue = min + i;

    doc.moveTo(tickX, lineY - 5);
    doc.lineTo(tickX, lineY + 5);
    doc.stroke();

    doc.fontSize(9);
    doc.text(String(tickValue), tickX - 8, lineY + 8, {
      width: 16,
      align: "center"
    });
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
  const widthBase = frameCount * singleFrameWidth + (frameCount - 1) * frameGapBase;
  const heightBase = singleFrameHeight;

  const widthScale = maxWidth > 0 ? Math.min(1, maxWidth / widthBase) : 1;
  const heightScale = targetHeight > 0 ? Math.min(1, targetHeight / heightBase) : 1;
  const scale = Math.min(widthScale, heightScale, 1);

  return {
    width: widthBase * scale,
    height: heightBase * scale,
    cellSize: cellSizeBase * scale,
    cellGap: cellGapBase * scale,
    frameGap: frameGapBase * scale
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
  visualKind
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

  const answerZoneWidth = cellWidth * VISUAL_LAYOUT.answerZoneRatio;
  const visualZoneWidth =
    cellWidth -
    answerZoneWidth -
    VISUAL_LAYOUT.visualAnswerGap -
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

function drawAnswerLine(doc, region) {
  if (!region || region.answerWidth <= 20) return;

  const lineY = region.topY + region.height * 0.95;
  const lineStartX = region.answerX;
  const lineEndX = region.answerX + region.answerWidth;

  doc.save();
  doc.strokeColor(pdfDesignTokens.colors.answerRule);
  doc.lineWidth(0.8);
  doc.moveTo(lineStartX, lineY);
  doc.lineTo(lineEndX, lineY);
  doc.stroke();
  doc.restore();
}

function renderQuestionItem(doc, question, layoutBox, fonts = {}) {
  if (doc._ended) return 0;

  const {
    x,
    y,
    width,
    height,
    dividerY
  } = layoutBox;

const promptText = question.prompt || question.text || "";
const hasInlineAnswerBlank = promptText.includes("__");
  const visual = question.visual || null;

  const promptX = x;
  const promptY = y;
  const promptWidth = width;

  doc.fillColor("#111827");
  doc.font(fonts.regular || "Helvetica");
  doc.fontSize(12);

  const promptHeight = doc.heightOfString(promptText, {
    width: promptWidth,
    align: "left"
  });

  doc.text(promptText, promptX, promptY, {
    width: promptWidth,
    align: "left"
  });

  const promptBottomY = promptY + promptHeight;
  const cellBottomY = y + height;

  if (visual?.kind && !doc._ended) {
    const region = getVisualRegion({
      cellBottomY,
      promptBottomY,
      cellX: x,
      cellWidth: width,
      visualKind: visual.kind
    });

    const measured = measureVisual(
      visual,
      region.maxWidth,
      region.targetHeight
    );

    const placed = placeVisualInRegion(region, measured);

    if (measured && placed) {
      try {
        renderVisualByKind(doc, visual, placed, measured);

if (!hasInlineAnswerBlank) {
  drawAnswerLine(doc, region);
}
      } catch (err) {
        console.error("VISUAL RENDER FAIL:", err);
      }
    }
  }

  if (dividerY) {
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
  arg10
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

  const isVisualLayout = itemGap === 0;
  const rowCount = isVisualLayout ? 5 : null;
  const visualCellHeight = isVisualLayout
    ? (bottomContentY - startY) / rowCount
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

        if (i < rowCount - 1 && separatorY < bottomContentY - 4) {
          doc.save();
          doc.strokeColor(pdfDesignTokens.colors.lightRule);
          doc.lineWidth(pdfDesignTokens.rules.thin);
          doc.moveTo(xForCol(c), separatorY)
            .lineTo(xForCol(c) + colW, separatorY)
            .stroke();
          doc.restore();
        }

        currentY += visualCellHeight;
      } else {
        const usedHeight = renderLineFn(item, xForCol(c), currentY, colW);

        const separatorY = currentY + usedHeight + Math.max(8, itemGap / 2);

        if (separatorY < bottomContentY - 4) {
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
  const bodyStyle = layout.typography.body;

  const footerRuleY = doc.page.height - layout.page.margins.bottom;
  const footerBufferH = layout.zones?.footerBuffer?.height ?? 24;
  const bottomContentY = footerRuleY - footerBufferH;

  const hasVisuals = allItems.some((item) => item.visual);
  const cols = hasVisuals ? 2 : clampCols(layoutObject?.template?.columns || options.cols);
  const layoutMaxProblemsPerPage = Number(layoutObject?.template?.maxProblemsPerPage || 0);
  const questionsPerColumn = hasVisuals
    ? 5
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

  const maxPerPage = hasVisuals
    ? cols * questionsPerColumn
    : Math.max(1, layoutMaxProblemsPerPage || cols * questionsPerColumn);
  const pages = paginateEven(allItems, maxPerPage);

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

    const columns = distributeBalanced(pageItems, cols);

    if (hasVisuals && cols === 2) {
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
  cols,
  columns,
  startY,
  bottomContentY,
  xForCol,
  colW,
  (item, x, y, w) => {
    const cellHeight = hasVisuals ? (bottomContentY - startY) / 5 : 0;

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
      fonts
    );
  },
  itemGap
);

    drawFooter(doc, fonts, pageState.pageNum, meta);
  });
}

function renderAnswerKey(doc, fonts, contentObject, options, pageState) {
  const meta = contentObject?.meta || {};
  const answers = buildAnswerKeyItems(contentObject?.content?.items || []);
  if (!answers.length) return;

  const bodyStyle = layout.typography.body;
  const hasLongAnswerPrompts = answers.some((it) => promptWithoutEquals(it.prompt).length > 55);
  const cols = hasLongAnswerPrompts
    ? Math.min(2, clampCols(options.cols))
    : clampCols(options.cols);
  const { colW, xForCol } = getColumns(cols);

  const footerRuleY = doc.page.height - layout.page.margins.bottom;
  const footerBufferH = layout.zones?.footerBuffer?.height ?? 24;
  const bottomContentY = footerRuleY - footerBufferH;

  const maxPerPage = cols * MAX_PER_COLUMN;
  const pages = paginateEven(answers, maxPerPage);

  doc.addPage();
  pageState.pageNum += 1;

  let startY = renderHeader(doc, fonts, { ...meta, title: "ANSWER KEY", subheading: "" });
  setFont(doc, fonts.regular, bodyStyle.size);
  doc.fillColor(pdfDesignTokens.colors.text);

  pages.forEach((pageItems, pageIndex) => {
    if (pageIndex > 0) {
      doc.addPage();
      pageState.pageNum += 1;
      startY = renderHeader(doc, fonts, { ...meta, title: "ANSWER KEY", subheading: "" });
      setFont(doc, fonts.regular, bodyStyle.size);
      doc.fillColor(pdfDesignTokens.colors.text);
    }

    const columns = distributeBalanced(pageItems, cols);

    renderPageColumns(
      doc,
      cols,
      columns,
      startY,
      bottomContentY,
      xForCol,
      colW,
      (it, x, y, w) => {
        const id = it.id != null ? `${it.id})  ` : "";
        const left = promptWithoutEquals(it.prompt);

        let ans = it.answer;
        if (ans == null && typeof it.a === "number" && typeof it.b === "number" && it.op) {
          if (it.op === "+") ans = it.a + it.b;
          if (it.op === "-") ans = it.a - it.b;
          if (it.op === "*") ans = it.a * it.b;
          if (it.op === "/") ans = it.b !== 0 ? it.a / it.b : "";
        }

        const answerText = `${id}${left} = ${ans ?? ""}`;
        const answerHeight = doc.heightOfString(answerText, {
          width: w,
          align: "left"
        });

        doc.text(answerText, x, y, {
          width: w,
          align: "left"
        });

        return Math.max(bodyStyle.lineHeight, answerHeight);
      },
      12
    );

    drawFooter(doc, fonts, pageState.pageNum, meta);
  });
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
    renderAnswerKey(doc, fonts, contentObject, normalized, pageState);
  }

  doc.end();
}

module.exports = { renderWorksheetPDF };
