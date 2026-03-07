// renderers/unitPdfRenderer.js
'use strict';

const layout = require("../config/layout/layoutSpec.json");
const path = require('path');
const PDFDocument = require('pdfkit');

function safeText(s) {
  return (s ?? '').toString();
}

function asLines(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(safeText).filter(Boolean);
  return [safeText(v)].filter(Boolean);
}

function tryRegisterFont(doc, name, relPath) {
  try { doc.registerFont(name, relPath); return true; } catch { return false; }
}

function setFont(doc, families, size, which = "regular") {
  const fontName = families[which] || families.regular;
  try { doc.font(fontName).fontSize(size); } catch { doc.font('Helvetica').fontSize(size); }
}

function hr(doc, x1, x2, y) {
  const r = layout.rules?.headerDivider || {};
  const strokeWidth = (r.strokeWidth ?? 0.25);
  const color = (r.color ?? '#000');

  doc.save();
  doc.moveTo(x1, y).lineTo(x2, y).lineWidth(strokeWidth).strokeColor(color).stroke();
  doc.restore();
}

function sectionTitle(doc, families, title) {
  setFont(doc, families, 14, "bold");
  doc.text(title, { continued: false });
  doc.moveDown(0.35);
}

function bulletList(doc, families, items) {
  const lines = asLines(items);
  if (!lines.length) return;

  setFont(doc, families, 11, "regular");
  for (const line of lines) {
    doc.text(`• ${line}`, { indent: 0 });
  }
  doc.moveDown(0.35);
}

function paragraph(doc, families, text) {
  const t = safeText(text);
  if (!t) return;
  setFont(doc, families, 11, "regular");
  doc.text(t);
  doc.moveDown(0.35);
}

/**
 * Unit PDF header placement (matches your example):
 * Name/Date
 * TITLE
 * SUBHEADING (Light)
 * divider line under subheading with a small space
 */
function renderUnitPDF({ res, unitEnvelope }) {
  const unit = unitEnvelope?.unit;
  if (!unit) {
    res.status(400).send('Missing unit content');
    return;
  }

  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 54, bottom: 54, left: 54, right: 54 },
    autoFirstPage: true,
  });

  const regularPath = path.join(__dirname, '..', 'public', 'fonts', 'SourceSans3', 'SourceSans3-Regular.ttf');
  const boldPath = path.join(__dirname, '..', 'public', 'fonts', 'SourceSans3', 'SourceSans3-Bold.ttf');
  const lightPath = path.join(__dirname, '..', 'public', 'fonts', 'SourceSans3', 'SourceSans3-Light.ttf');

  const families = { regular: 'SS3-Regular', bold: 'SS3-Bold', light: 'SS3-Light' };

  tryRegisterFont(doc, families.regular, regularPath);
  tryRegisterFont(doc, families.bold, boldPath);
  tryRegisterFont(doc, families.light, lightPath);

  const fileNameBase = (unit.title || 'unit').toString().trim().replace(/\s+/g, '_');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileNameBase}.pdf"`);

  doc.pipe(res);

  const xLeft = doc.page.margins.left;
  const xRight = doc.page.width - doc.page.margins.right;

  // Name/Date
  setFont(doc, families, 11, "light");
  doc.text('Name: ____________________________        Date: ______________');
  doc.moveDown(0.6);

  // TITLE
  setFont(doc, families, 18, "bold");
  doc.text((unit.title || '').toString().toUpperCase());

  // SUBHEADING (Light)
  setFont(doc, families, 12, "light");
  const subj = safeText(unit.subject);
  const grd = safeText(unit.grade);
  const jur = safeText(unit.jurisdiction);
  doc.text([jur, subj ? `• ${subj}` : '', grd ? `• Grade ${grd}` : ''].filter(Boolean).join(' '));

  // Divider line under subheading (small nice space)
  doc.moveDown(0.35);
  hr(doc, xLeft, xRight, doc.y);
  doc.moveDown(0.7);

  // ===== Overview =====
  sectionTitle(doc, families, 'OVERVIEW');
  paragraph(doc, families, unit?.overview?.description);

  sectionTitle(doc, families, 'BIG IDEAS');
  bulletList(doc, families, unit?.overview?.bigIdeas);

  sectionTitle(doc, families, 'CULMINATING TASK');
  paragraph(doc, families, unit?.overview?.culminatingTask);

  // ===== Assessment =====
  sectionTitle(doc, families, 'ASSESSMENT');

  setFont(doc, families, 12, "bold");
  doc.text('For');
  bulletList(doc, families, unit?.assessment?.for);

  setFont(doc, families, 12, "bold");
  doc.text('As');
  bulletList(doc, families, unit?.assessment?.as);

  setFont(doc, families, 12, "bold");
  doc.text('Of');
  bulletList(doc, families, unit?.assessment?.of);

  // ===== Differentiation =====
  sectionTitle(doc, families, 'DIFFERENTIATION');

  setFont(doc, families, 12, "bold");
  doc.text('Universal Supports');
  bulletList(doc, families, unit?.differentiation?.universal);

  setFont(doc, families, 12, "bold");
  doc.text('Extensions');
  bulletList(doc, families, unit?.differentiation?.extension);

  // ===== Materials =====
  sectionTitle(doc, families, 'MATERIALS');
  bulletList(doc, families, unit?.materials);

  // ===== Lessons =====
  doc.addPage();

  setFont(doc, families, 18, "bold");
  doc.text((unit.title || '').toString().toUpperCase());

  setFont(doc, families, 12, "light");
  doc.text(`Lesson Sequence (${unit.durationLessons || (unit.lessons?.length || 0)} lessons)`);
  doc.moveDown(0.35);
  hr(doc, xLeft, xRight, doc.y);
  doc.moveDown(0.6);

  const lessons = Array.isArray(unit.lessons) ? unit.lessons : [];
  for (const L of lessons) {
    if (doc.y > doc.page.height - doc.page.margins.bottom - 220) {
      doc.addPage();
    }

    setFont(doc, families, 14, "bold");
    doc.text(`Day ${L.day}: ${safeText(L.focus)}`);

    setFont(doc, families, 11, "regular");
    doc.moveDown(0.25);

    if (asLines(L.bigIdeas).length) {
      setFont(doc, families, 11, "bold");
      doc.text('Big Ideas: ', { continued: true });
      setFont(doc, families, 11, "regular");
      doc.text(asLines(L.bigIdeas).join('  •  '));
    }

    if (asLines(L.learningGoals).length) {
      setFont(doc, families, 11, "bold");
      doc.text('Learning Goals: ', { continued: true });
      setFont(doc, families, 11, "regular");
      doc.text(asLines(L.learningGoals).join('  •  '));
    }

    if (asLines(L.successCriteria).length) {
      setFont(doc, families, 11, "bold");
      doc.text('Success Criteria:');
      bulletList(doc, families, L.successCriteria);
    }

    if (safeText(L.mindsOn)) {
      setFont(doc, families, 11, "bold");
      doc.text('Minds On: ', { continued: true });
      setFont(doc, families, 11, "regular");
      doc.text(safeText(L.mindsOn));
    }

    if (safeText(L.action)) {
      setFont(doc, families, 11, "bold");
      doc.text('Action: ', { continued: true });
      setFont(doc, families, 11, "regular");
      doc.text(safeText(L.action));
    }

    if (safeText(L.consolidation)) {
      setFont(doc, families, 11, "bold");
      doc.text('Consolidation: ', { continued: true });
      setFont(doc, families, 11, "regular");
      doc.text(safeText(L.consolidation));
    }

    if (asLines(L.materials).length) {
      setFont(doc, families, 11, "bold");
      doc.text('Materials/Assets:');
      bulletList(doc, families, L.materials);
    }

    doc.moveDown(0.6);
    hr(doc, xLeft, xRight, doc.y);
    doc.moveDown(0.6);
  }

  doc.end();
}

module.exports = { renderUnitPDF };