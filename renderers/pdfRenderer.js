'use strict';

const layout = require("../config/layout/layoutSpec.json");
const path = require("path");
const PDFDocument = require("pdfkit");

const MAX_PER_COLUMN = 30;

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
    doc.fillColor("#222222");
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
  doc.fillColor("#222222");
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
  doc.fillColor("#222222");

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
  const lift = layout.spacing?.xs ?? 6;
  drawNameDateLine(doc, fonts, y - lift);

  // header block "thirds" feel: title in middle third, subheading in bottom third
  y += layout.spacing.md;

  const unitTitle = safeStr(meta.unitTitle).trim();
  const worksheetTitle = safeStr(meta.title).trim();
  const subheading = safeStr(meta.subheading).trim();
  const dailyFocus = safeStr(meta.dailyFocus).trim() || safeStr(meta.focus).trim();

  if (unitTitle) {
    const s = layout.typography.unitTitle;
    setFont(doc, fonts.bold, s.size);
    doc.fillColor("#222222");
    doc.text(unitTitle.toUpperCase(), xLeft, y, { width: cb.width, align: "left" });
    y += s.lineHeight;
  }

  if (worksheetTitle) {
    const s = layout.typography.worksheetTitle;
    // Title should be Bold per your rule
    setFont(doc, fonts.bold, s.size);
    doc.fillColor("#222222");
    doc.text(worksheetTitle, xLeft, y, { width: cb.width, align: "left" });
    y += s.lineHeight;
  }

  if (subheading) {
    const s = layout.typography.headerLabels;
    setFont(doc, fonts.light, s.size);
    doc.fillColor("#222222");
    doc.text(subheading, xLeft, y, { width: cb.width, align: "left" });
    y += s.lineHeight;
  } else if (dailyFocus) {
    const s = layout.typography.focusAndSection;
    setFont(doc, fonts.lightItalic, s.size);
    doc.fillColor("#222222");
    doc.text(dailyFocus, xLeft, y, { width: cb.width, align: "left" });
    y += s.lineHeight;
  }

  // divider line should sit BELOW subheading with a small nice space
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

function renderPageColumns(doc, cols, columns, startY, bottomContentY, xForCol, colW, step, renderLineFn, lineHeight) {
  for (let c = 0; c < cols; c++) {
    const colItems = columns[c];
    if (!colItems.length) continue;

    for (let i = 0; i < colItems.length; i++) {
      const y = startY + i * step;
      if (y > bottomContentY - lineHeight) break;
      renderLineFn(colItems[i], xForCol(c), y, colW);
    }
  }
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
  doc.fillColor("#222222");

  const maxPerPage = cols * MAX_PER_COLUMN;
  const pages = paginateEven(allItems, maxPerPage);

  pages.forEach((pageItems, pageIndex) => {
    if (pageIndex > 0) {
      doc.addPage();
      pageState.pageNum += 1;
      startY = renderHeader(doc, fonts, meta);
      setFont(doc, fonts.regular, bodyStyle.size);
      doc.fillColor("#222222");
    }

    const columns = distributeBalanced(pageItems, cols);
    const maxColCount = Math.max(1, ...columns.map(c => c.length));
    const step = computeFillStep(startY, bottomContentY, bodyStyle.lineHeight, maxColCount);

    const usable = Math.max(0, (bottomContentY - startY) - bodyStyle.lineHeight);
    const span = Math.max(0, step * (maxColCount - 1));
    const topForCenter = startY + Math.max(0, (usable - span) / 2);

    renderPageColumns(
      doc,
      cols,
      columns,
      topForCenter,
      bottomContentY,
      xForCol,
      colW,
      step,
      (item, x, y, w) => {
        const label = item.id != null ? `${item.id})  ` : "";
        doc.text(`${label}${safeStr(item.prompt)}`, x, y, { width: w, align: "left" });
      },
      bodyStyle.lineHeight
    );

    drawFooter(doc, fonts, pageState.pageNum, meta);
  });
}

function renderAnswerKey(doc, fonts, contentObject, options, pageState) {
  const meta = contentObject?.meta || {};
  const answers = buildAnswerKeyItems(contentObject?.content?.items || []);
  if (!answers.length) return;

  const cols = clampCols(options.cols);
  const bodyStyle = layout.typography.body;
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
  doc.fillColor("#222222");

  pages.forEach((pageItems, pageIndex) => {
    if (pageIndex > 0) {
      doc.addPage();
      pageState.pageNum += 1;
      startY = renderHeader(doc, fonts, { ...meta, title: "ANSWER KEY", subheading: "" });
      setFont(doc, fonts.regular, bodyStyle.size);
      doc.fillColor("#222222");
    }

    const columns = distributeBalanced(pageItems, cols);
    const maxColCount = Math.max(1, ...columns.map(c => c.length));
    const step = computeFillStep(startY, bottomContentY, bodyStyle.lineHeight, maxColCount);

    const usable = Math.max(0, (bottomContentY - startY) - bodyStyle.lineHeight);
    const span = Math.max(0, step * (maxColCount - 1));
    const topForCenter = startY + Math.max(0, (usable - span) / 2);

    renderPageColumns(
      doc,
      cols,
      columns,
      topForCenter,
      bottomContentY,
      xForCol,
      colW,
      step,
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

        doc.text(`${id}${left} = ${ans ?? ""}`, x, y, { width: w, align: "left", lineBreak: false });
      },
      bodyStyle.lineHeight
    );

    drawFooter(doc, fonts, pageState.pageNum, meta);
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

  const filename = (options && options.filename) ? safeStr(options.filename) : "yellowbird-worksheet.pdf";

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  doc.pipe(res);

  const normalized = {
    cols: clampCols(options.cols ?? layout.grid?.columns ?? 3),
    includeAnswerKey: options.includeAnswerKey !== false,
  };

  const pageState = { pageNum: 1 };

  renderQuestionsPages(doc, fonts, contentObject, normalized, pageState);

  if (normalized.includeAnswerKey) {
    renderAnswerKey(doc, fonts, contentObject, normalized, pageState);
  }

  doc.end();
}

module.exports = { renderWorksheetPDF };