// renderers/pdfRenderer.js
'use strict';

const layout = require("../config/layout/layoutSpec.json");
const path = require("path");
const PDFDocument = require("pdfkit");

/**
 * Yellowbird Worksheet PDF Renderer (LayoutSpec-driven)
 * UPGRADE:
 * - True "fill-to-bottom" column layout with clamped spacing.
 * - Columns distribute questions from startY to bottomContentY cleanly.
 * - Keeps baseline rhythm using typography.body.lineHeight as the min.
 */

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
  const v = parseInt(n || String(layout.grid?.columns || 3), 10);
  if (![1, 2, 3].includes(v)) return 3;
  return v;
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
  return {
    strokeWidth: (r.strokeWidth ?? 0.25),
    color: (r.color ?? "#000"),
  };
}

function footerRule() {
  const r = layout.rules?.footerRule || layout.rules?.headerDivider || {};
  return {
    strokeWidth: (r.strokeWidth ?? 0.25),
    color: (r.color ?? "#000"),
  };
}

function nameDateRule() {
  const r = layout.rules?.nameDateLine || layout.rules?.headerDivider || {};
  return {
    strokeWidth: (r.strokeWidth ?? 0.25),
    color: (r.color ?? "#000"),
  };
}

/**
 * Footer drawn AFTER content.
 */
function drawFooter(doc, fonts, pageNum) {
  const cb = layout.page.contentBox;
  const xLeft = cb.x;
  const xRight = cb.x + cb.width;

  const bottomMargin = layout.page.margins.bottom;
  const yRule = doc.page.height - bottomMargin;

  const fr = footerRule();
  lineRule(doc, xLeft, xRight, yRule, fr.strokeWidth, fr.color);

  const pageNumY = yRule + (bottomMargin / 2);
  setFont(doc, fonts.light || fonts.regular, layout.typography.headerLabels.size);
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

  drawNameDateLine(doc, fonts, y);
  y += layout.spacing.md;

  const unitTitle = safeStr(meta.unitTitle).trim();
  const worksheetTitle = safeStr(meta.title).trim();
  const dailyFocus = safeStr(meta.dailyFocus).trim() || safeStr(meta.focus).trim();

  if (unitTitle) {
    const s = layout.typography.unitTitle;
    setFont(doc, fonts.bold, s.size);
    doc.text(unitTitle.toUpperCase(), xLeft, y, { width: cb.width, align: "left" });
    y += s.lineHeight;
  }

  if (worksheetTitle) {
    const s = layout.typography.worksheetTitle;
    setFont(doc, fonts.light, s.size);
    doc.text(worksheetTitle, xLeft, y, { width: cb.width, align: "left" });
    y += s.lineHeight;
  }

  if (dailyFocus) {
    const s = layout.typography.focusAndSection;
    setFont(doc, fonts.lightItalic, s.size);
    doc.text(dailyFocus, xLeft, y, { width: cb.width, align: "left" });
    y += s.lineHeight;
  }

  y += layout.spacing.sm;

  const hd = headerDividerRule();
  lineRule(doc, xLeft, xRight, y, hd.strokeWidth, hd.color);

  y += layout.spacing.md;

  doc.y = y;
  return y;
}

function getColumns(cols) {
  const cb = layout.page.contentBox;
  const gutter = cols === 1 ? 0 : (layout.grid?.gutter ?? 24);

  const colW = cols === 1
    ? cb.width
    : (cb.width - gutter * (cols - 1)) / cols;

  const xForCol = (i) => cb.x + i * (colW + gutter);
  return { cb, gutter, colW, xForCol };
}

/**
 * We distribute items "column-first" to keep columns balanced:
 * - counts differ by at most 1
 */
function distributeBalanced(items, cols) {
  const buckets = Array.from({ length: cols }, () => []);
  items.forEach((it, idx) => buckets[idx % cols].push(it));
  return buckets;
}

/**
 * Compute positions that:
 * - start at startY
 * - end at bottomY - lineHeight (so last line fits)
 * - use even spacing
 * - clamp spacing so it doesn't get absurdly large on short columns
 */
function computeYPositions(startY, bottomY, n, lineHeight) {
  const top = startY;
  const bottom = Math.max(top, bottomY - lineHeight);

  if (n <= 0) return [];
  if (n === 1) return [top + (bottom - top) / 2];

  // ideal even step
  const span = bottom - top;
  let step = span / (n - 1);

  // Clamp step: keep it airy but not ridiculous.
  // Min step = lineHeight * 1.35 (readable)
  // Max step = lineHeight * 2.6 (still looks intentional)
  const minStep = lineHeight * 1.35;
  const maxStep = lineHeight * 2.6;
  step = Math.max(minStep, Math.min(maxStep, step));

  // If clamped step would exceed bottom, fall back to min-step stacking
  const neededSpan = step * (n - 1);
  const start = neededSpan <= span ? top : top;

  const ys = [];
  for (let i = 0; i < n; i++) ys.push(start + i * step);

  // If we overflow, stack with minStep and let bottom breathing room be smaller
  if (ys[ys.length - 1] > bottom) {
    const ys2 = [];
    const step2 = minStep;
    for (let i = 0; i < n; i++) ys2.push(top + i * step2);
    return ys2;
  }

  return ys;
}

/**
 * Paginate based on minimum line step (minStep) so we never overflow.
 */
function paginateByMinStep(items, cols, startY, bottomY, lineHeight) {
  const minStep = lineHeight * 1.35;
  const usableH = Math.max(1, bottomY - startY);
  const linesPerCol = Math.max(1, Math.floor(usableH / minStep));
  const perPage = cols * linesPerCol;

  const pages = [];
  for (let i = 0; i < items.length; i += perPage) {
    pages.push(items.slice(i, i + perPage));
  }
  return pages;
}

function renderQuestionsPages(doc, fonts, contentObject, options, pageState) {
  const meta = contentObject?.meta || {};
  const allItems = (contentObject?.content?.items || []).filter(isEquation);

  const cols = clampCols(options.cols);
  const bodyStyle = layout.typography.body;
  const { colW, xForCol } = getColumns(cols);

  const footerRuleY = doc.page.height - layout.page.margins.bottom;
  const footerBufferH = layout.zones?.footerBuffer?.height ?? 24;
  const bottomContentY = footerRuleY - footerBufferH;

  let startY = renderHeader(doc, fonts, meta);
  setFont(doc, fonts.regular, bodyStyle.size);

  const pages = paginateByMinStep(allItems, cols, startY, bottomContentY, bodyStyle.lineHeight);

  pages.forEach((pageItems, pageIndex) => {
    if (pageIndex > 0) {
      doc.addPage();
      pageState.pageNum += 1;

      startY = renderHeader(doc, fonts, meta);
      setFont(doc, fonts.regular, bodyStyle.size);
    }

    const columns = distributeBalanced(pageItems, cols);

    for (let c = 0; c < cols; c++) {
      const colItems = columns[c];
      if (!colItems.length) continue;

      const x = xForCol(c);
      const ys = computeYPositions(startY, bottomContentY, colItems.length, bodyStyle.lineHeight);

      for (let i = 0; i < colItems.length; i++) {
        const item = colItems[i];
        const y = ys[i];

        const label = item.id != null ? `${item.id})  ` : "";
        const prompt = safeStr(item.prompt);

        doc.text(`${label}${prompt}`, x, y, { width: colW, align: "left" });
      }
    }

    drawFooter(doc, fonts, pageState.pageNum);
  });
}

function renderAnswerKey(doc, fonts, contentObject, pageState) {
  const meta = contentObject?.meta || {};
  const answers = buildAnswerKeyItems(contentObject?.content?.items || []);
  if (!answers.length) return;

  doc.addPage();
  pageState.pageNum += 1;

  const keyMeta = { ...meta, title: "ANSWER KEY" };

  const cols = 2;
  const bodyStyle = layout.typography.body;
  const { colW, xForCol } = getColumns(cols);

  const footerRuleY = doc.page.height - layout.page.margins.bottom;
  const footerBufferH = layout.zones?.footerBuffer?.height ?? 24;
  const bottomContentY = footerRuleY - footerBufferH;

  let startY = renderHeader(doc, fonts, keyMeta);
  setFont(doc, fonts.regular, bodyStyle.size);

  const pages = paginateByMinStep(answers, cols, startY, bottomContentY, bodyStyle.lineHeight);

  pages.forEach((pageItems, pageIndex) => {
    if (pageIndex > 0) {
      doc.addPage();
      pageState.pageNum += 1;

      startY = renderHeader(doc, fonts, keyMeta);
      setFont(doc, fonts.regular, bodyStyle.size);
    }

    const columns = distributeBalanced(pageItems, cols);

    for (let c = 0; c < cols; c++) {
      const colItems = columns[c];
      if (!colItems.length) continue;

      const x = xForCol(c);
      const ys = computeYPositions(startY, bottomContentY, colItems.length, bodyStyle.lineHeight);

      for (let i = 0; i < colItems.length; i++) {
        const it = colItems[i];
        const y = ys[i];

        const id = it.id != null ? `${it.id})  ` : "";
        const left = promptWithoutEquals(it.prompt);

        let ans = it.answer;
        if (ans == null && typeof it.a === "number" && typeof it.b === "number" && it.op) {
          if (it.op === "+") ans = it.a + it.b;
          if (it.op === "-") ans = it.a - it.b;
          if (it.op === "*") ans = it.a * it.b;
          if (it.op === "/") ans = it.b !== 0 ? it.a / it.b : "";
        }

        doc.text(`${id}${left} = ${ans ?? ""}`, x, y, { width: colW, align: "left", lineBreak: false });
      }
    }

    drawFooter(doc, fonts, pageState.pageNum);
  });
}

function renderWorksheetPDF({ res, contentObject, options = {} }) {
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

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="yellowbird-worksheet.pdf"`);

  doc.pipe(res);

  const pageState = { pageNum: 1 };

  const normalized = {
    cols: clampCols(options.cols ?? layout.grid?.columns ?? 3),
    includeAnswerKey: options.includeAnswerKey !== false,
  };

  renderQuestionsPages(doc, fonts, contentObject, normalized, pageState);

  if (normalized.includeAnswerKey) {
    renderAnswerKey(doc, fonts, contentObject, pageState);
  }

  doc.end();
}

module.exports = { renderWorksheetPDF };