'use strict';

const layout = require("../config/layout/layoutSpec.json");
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const SVGtoPDF = require('svg-to-pdfkit');

// Charcoal only for ALL lesson worksheet PDFs
const INK = "#2B2B2B";

function safeText(s) { return (s ?? '').toString(); }

function tryRegisterFont(doc, name, filePath) {
  try { doc.registerFont(name, filePath); return true; } catch { return false; }
}

function setFont(doc, fontName, size) {
  try { doc.font(fontName).fontSize(size); } catch { doc.font('Helvetica').fontSize(size); }
}

function lineRule(doc, x1, x2, y, strokeWidth) {
  doc.save();
  doc.moveTo(x1, y).lineTo(x2, y).lineWidth(strokeWidth).strokeColor(INK).stroke();
  doc.restore();
}

function rectRule(doc, x, y, w, h, strokeWidth) {
  doc.save();
  doc.rect(x, y, w, h).lineWidth(strokeWidth).strokeColor(INK).stroke();
  doc.restore();
}

function headerDividerRule() {
  return layout.rules?.headerDivider ?? { strokeWidth: 0.25 };
}
function footerRule() {
  return layout.rules?.footerRule ?? { strokeWidth: 0.25 };
}
function nameDateRule() {
  return layout.rules?.nameDateLine ?? { strokeWidth: 0.25 };
}
function boxRule() {
  return layout.rules?.boxStroke ?? { strokeWidth: 0.75 };
}
function modelBoxRule() {
  return layout.rules?.modelBoxStroke ?? { strokeWidth: 0.75 };
}

function drawFooter(doc, fonts, pageNum) {
  const cb = layout.page.contentBox;
  const xLeft = cb.x;
  const xRight = cb.x + cb.width;

  const bottomMargin = layout.page.margins.bottom;
  const yRule = doc.page.height - bottomMargin;

  const fr = footerRule();
  lineRule(doc, xLeft, xRight, yRule, fr.strokeWidth);

  const offset = Math.max(6, Math.min(10, (layout.spacing?.sm ?? 12) - 2));
  const pageNumY = yRule + offset;

  setFont(doc, fonts.light || fonts.regular, layout.typography.headerLabels.size);
  doc.fillColor(INK);
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
  doc.fillColor(INK);

  doc.text(header.name.label, header.name.labelX, y, { lineBreak: false });
  lineRule(doc, header.name.lineStart, header.name.lineEnd, y + labelStyle.lineHeight, nr.strokeWidth);

  doc.text(header.date.label, header.date.labelX, y, { lineBreak: false });
  lineRule(doc, header.date.lineStart, header.date.lineEnd, y + labelStyle.lineHeight, nr.strokeWidth);
}

function renderHeader(doc, fonts, unitTitle, worksheetTitle, subheading, dailyFocus) {
  const cb = layout.page.contentBox;
  const xLeft = cb.x;
  const xRight = cb.x + cb.width;

  let y = cb.y;

  const lift = layout.spacing?.xs ?? 6;
  drawNameDateLine(doc, fonts, y - lift);

  y += layout.spacing.md;

  // Unit title
  const unitStyle = layout.typography.unitTitle;
  setFont(doc, fonts.bold, unitStyle.size);
  doc.fillColor(INK);
  doc.text(safeText(unitTitle).toUpperCase(), xLeft, y, { width: cb.width, align: 'left' });
  y += unitStyle.lineHeight;

  // Worksheet title (bold)
  const wt = safeText(worksheetTitle).trim();
  if (wt) {
    const wsStyle = layout.typography.worksheetTitle;
    setFont(doc, fonts.bold, wsStyle.size);
    doc.fillColor(INK);
    doc.text(wt, xLeft, y, { width: cb.width, align: 'left' });
    y += wsStyle.lineHeight;
  }

  // Subheading (light)
  const sh = safeText(subheading).trim();
  if (sh) {
    const s = layout.typography.labels;
    setFont(doc, fonts.light, s.size);
    doc.fillColor(INK);
    doc.text(sh, xLeft, y, { width: cb.width, align: 'left' });
    y += s.lineHeight;
  }

  // Focus (light italic)
  const df = safeText(dailyFocus).trim();
  if (df) {
    const focusStyle = layout.typography.focusAndSection;
    setFont(doc, fonts.lightItalic, focusStyle.size);
    doc.fillColor(INK);
    doc.text(df, xLeft, y, { width: cb.width, align: 'left' });
    y += focusStyle.lineHeight;
  }

  // ✅ RAISE THE DIVIDER LINE: use XS gap instead of SM
  y += (layout.spacing?.xs ?? 6);
  const hd = headerDividerRule();
  lineRule(doc, xLeft, xRight, y, hd.strokeWidth);

  y += layout.spacing.md;
  doc.y = y;
}

function promptsForFocus(focus) {
  const f = safeText(focus).toLowerCase();

  if (f.includes('sorting')) {
    return [
      'Circle the rule you used: color  /  size  /  shape  /  other: __________',
      'Sort the items into groups. Label each group.',
      'Explain your rule: I sorted by ____________________________.'
    ];
  }

  if (f.includes('pattern')) {
    return [
      'Copy the pattern.',
      'Extend the pattern.',
      'Describe the rule: The pattern is ____________________________.',
      'Create your own pattern and label the core.'
    ];
  }

  if (f.includes('calendar')) {
    return [
      'Write today’s date: ____________________',
      'What is tomorrow? ____________________',
      'What is 3 days after today? ____________________',
      'Count forward 7 days from today: ____________________'
    ];
  }

  if (f.includes('represent') || f.includes('ten')) {
    return [
      'Show the number in at least 2 ways.',
      'Write the number: ________',
      'Draw counters / dots.',
      'Show on a number line.'
    ];
  }

  if (f.includes('counting')) {
    return [
      'Estimate: ________',
      'Count: ________',
      'Strategy (circle): 1s / 2s / 5s / 10s / groups',
      'Explain: I counted by ____________________________.'
    ];
  }

  if (f.includes('money') || f.includes('coin')) {
    return [
      'Name the coin: ____________________',
      'Write its value: ____________________',
      'Order the coins from least to greatest.',
      'Make 30¢ using coins (draw or write): ____________________'
    ];
  }

  return [
    'Complete the tasks below.',
    'Show your thinking using pictures, numbers, or words.',
    'Explain your strategy: ____________________________.'
  ];
}

function renderPrompts(doc, fonts, focus) {
  const prompts = promptsForFocus(focus);
  const cb = layout.page.contentBox;
  const sectionStyle = layout.typography.focusAndSection;
  const bodyStyle = layout.typography.body;

  setFont(doc, fonts.lightItalic, sectionStyle.size);
  doc.fillColor(INK);
  doc.text('Tasks', cb.x, doc.y, { width: cb.width, align: 'left' });
  doc.y += layout.spacing.sm;

  setFont(doc, fonts.regular, bodyStyle.size);
  doc.fillColor(INK);
  for (const p of prompts) {
    doc.text(`• ${p}`, cb.x, doc.y, { width: cb.width, align: 'left' });
  }

  doc.y += layout.spacing.lg;

  setFont(doc, fonts.lightItalic, sectionStyle.size);
  doc.fillColor(INK);
  doc.text('SHOW YOUR THINKING', cb.x, doc.y, { width: cb.width, align: 'left' });
  doc.y += layout.spacing.sm;

  const xLeft = cb.x;
  const width = cb.width;
  const h = 220;
  const y = doc.y;

  const br = boxRule();
  rectRule(doc, xLeft, y, width, h, br.strokeWidth);

  doc.y = y + h + layout.spacing.md;
}

function resolvePublicAssetFile(webPath) {
  const p = safeText(webPath);
  if (!p.startsWith('/')) return null;

  const publicRoot = path.join(__dirname, '..', 'public');
  const abs = path.normalize(path.join(publicRoot, p));
  if (!abs.startsWith(publicRoot)) return null;

  return abs;
}

function drawFallbackBox(doc, label, x, y, w, h) {
  const br = boxRule();
  rectRule(doc, x, y, w, h, br.strokeWidth);

  doc.save();
  doc.fontSize(9).fillColor(INK);
  doc.text(label, x + 8, y + 8, { width: w - 16 });
  doc.restore();
}

function embedSvg(doc, svgWebPath, x, y, w, h) {
  const filePath = resolvePublicAssetFile(svgWebPath);
  if (!filePath || !fs.existsSync(filePath)) {
    drawFallbackBox(doc, `Missing SVG:\n${safeText(svgWebPath)}`, x, y, w, h);
    return;
  }

  let svg;
  try {
    svg = fs.readFileSync(filePath, 'utf8');
  } catch {
    drawFallbackBox(doc, `Unreadable SVG:\n${safeText(svgWebPath)}`, x, y, w, h);
    return;
  }

  const mr = modelBoxRule();
  rectRule(doc, x, y, w, h, mr.strokeWidth);

  const pad = 10;
  const ix = x + pad;
  const iy = y + pad;
  const iw = Math.max(10, w - pad * 2);
  const ih = Math.max(10, h - pad * 2);

  try {
    SVGtoPDF(doc, svg, ix, iy, { width: iw, height: ih, preserveAspectRatio: 'xMidYMid meet' });
  } catch {
    drawFallbackBox(doc, `SVG render error:\n${safeText(svgWebPath)}`, x, y, w, h);
  }
}

function renderModels(doc, fonts, lesson) {
  const assets = Array.isArray(lesson.materials) ? lesson.materials.filter(Boolean) : [];
  const cb = layout.page.contentBox;

  setFont(doc, fonts.lightItalic, layout.typography.focusAndSection.size);
  doc.fillColor(INK);
  doc.text('Models for Today', cb.x, doc.y, { width: cb.width, align: 'left' });
  doc.y += layout.spacing.sm;

  const xLeft = cb.x;
  const usableW = cb.width;
  const gap = layout.spacing.sm;
  const boxH = 150;

  const maxModels = Math.min(4, assets.length);
  const cols = maxModels <= 1 ? 1 : 2;
  const boxW = cols === 1 ? usableW : (usableW - gap) / 2;

  if (maxModels === 0) {
    const y = doc.y;
    drawFallbackBox(doc, 'Model Space', xLeft, y, usableW, boxH);
    doc.y = y + boxH + layout.spacing.md;
    return;
  }

  const y0 = doc.y;
  for (let i = 0; i < maxModels; i++) {
    const col = cols === 1 ? 0 : (i % 2);
    const row = cols === 1 ? i : Math.floor(i / 2);
    const x = xLeft + col * (boxW + gap);
    const yy = y0 + row * (boxH + gap);
    embedSvg(doc, assets[i], x, yy, boxW, boxH);
  }

  const rowsUsed = cols === 1 ? maxModels : Math.ceil(maxModels / 2);
  doc.y = y0 + rowsUsed * boxH + (rowsUsed - 1) * gap + layout.spacing.md;
}

function buildLessonWorksheetDoc({ unit, lesson, pipeTarget }) {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    autoFirstPage: true,
    bufferPages: false,
  });

  const fontsDir = path.join(__dirname, '..', 'public', 'fonts', 'SourceSans3');
  const fonts = {
    regular: 'SS3-Regular',
    bold: 'SS3-Bold',
    light: 'SS3-Light',
    lightItalic: 'SS3-LightItalic',
  };

  tryRegisterFont(doc, fonts.regular, path.join(fontsDir, 'SourceSans3-Regular.ttf'));
  tryRegisterFont(doc, fonts.bold, path.join(fontsDir, 'SourceSans3-Bold.ttf'));
  tryRegisterFont(doc, fonts.light, path.join(fontsDir, 'SourceSans3-Light.ttf'));
  tryRegisterFont(doc, fonts.lightItalic, path.join(fontsDir, 'SourceSans3-LightItalic.ttf'));

  doc.pipe(pipeTarget);

  const worksheetTitle =
    safeText(lesson.worksheetTitle).trim() ||
    safeText(lesson.topic).trim() ||
    safeText(lesson.title).trim();

  // Keep blank unless you decide a rule later
  const subheading = "";

  renderHeader(doc, fonts, unit.title, worksheetTitle, subheading, lesson.focus);
  renderModels(doc, fonts, lesson);
  renderPrompts(doc, fonts, lesson.focus);

  drawFooter(doc, fonts, 1);

  doc.end();
}

function renderLessonWorksheetPDF({ res, unitEnvelope, day }) {
  const unit = unitEnvelope?.unit;
  if (!unit || !Array.isArray(unit.lessons)) {
    res.status(400).send('Missing unit lessons');
    return;
  }

  const lesson = unit.lessons.find(l => Number(l.day) === Number(day));
  if (!lesson) {
    res.status(404).send('Lesson not found');
    return;
  }

  const fileNameBase =
    `${safeText(unit.title).replace(/\s+/g, '_')}_Day_${String(lesson.day).padStart(2, '0')}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileNameBase}"`);

  buildLessonWorksheetDoc({ unit, lesson, pipeTarget: res });
}

async function generateLessonWorksheetPDFBuffer({ unitEnvelope, day }) {
  const unit = unitEnvelope?.unit;
  if (!unit || !Array.isArray(unit.lessons)) throw new Error('Missing unit lessons');

  const lesson = unit.lessons.find(l => Number(l.day) === Number(day));
  if (!lesson) throw new Error('Lesson not found');

  const { PassThrough } = require('stream');
  const stream = new PassThrough();
  const chunks = [];
  stream.on('data', (c) => chunks.push(c));

  buildLessonWorksheetDoc({ unit, lesson, pipeTarget: stream });

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('end', resolve);
    stream.on('error', reject);
  });

  return Buffer.concat(chunks);
}

module.exports = {
  renderLessonWorksheetPDF,
  generateLessonWorksheetPDFBuffer,
};