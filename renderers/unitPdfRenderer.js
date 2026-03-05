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
  try {
    doc.registerFont(name, relPath);
    return true;
  } catch (_) {
    return false;
  }
}

function setFont(doc, families, size, bold = false) {
  // families: { regular: 'Name', bold: 'NameBold' } OR fallback
  const fontName = bold ? families.bold : families.regular;
  try {
    doc.font(fontName).fontSize(size);
  } catch (_) {
    // fallback
    doc.font('Helvetica').fontSize(size);
  }
}

function hr(doc, x1, x2, y) {
  doc.save();
  doc.moveTo(x1, y).lineTo(x2, y).lineWidth(1).strokeColor('#000').stroke();
  doc.restore();
}

function sectionTitle(doc, families, title) {
  setFont(doc, families, 14, true);
  doc.text(title, { continued: false });
  doc.moveDown(0.35);
}

function bulletList(doc, families, items) {
  const lines = asLines(items);
  if (!lines.length) return;

  setFont(doc, families, 11, false);
  const indent = 14;
  for (const line of lines) {
    doc.text(`• ${line}`, { indent: 0 });
  }
  doc.moveDown(0.35);
}

function paragraph(doc, families, text) {
  const t = safeText(text);
  if (!t) return;
  setFont(doc, families, 11, false);
  doc.text(t);
  doc.moveDown(0.35);
}

/**
 * Renders a unit JSON object to PDF and streams to res.
 * Contract: expects `unitEnvelope.unit` as produced by engine/units/unitFactory
 */
function renderUnitPDF({ res, unitEnvelope }) {
  const unit = unitEnvelope?.unit;
  if (!unit) {
    res.status(400).send('Missing unit content');
    return;
  }

  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 54, bottom: 54, left: 54, right: 54 }, // 0.75"
    autoFirstPage: true,
  });

  // Attempt Source Sans 3 local fonts (optional)
  const regularPath = path.join(__dirname, '..', 'public', 'fonts', 'SourceSans3', 'SourceSans3-Regular.ttf');
  const semiboldPath = path.join(__dirname, '..', 'public', 'fonts', 'SourceSans3', 'SourceSans3-Semibold.ttf');
  const boldPath = path.join(__dirname, '..', 'public', 'fonts', 'SourceSans3', 'SourceSans3-Bold.ttf');

  const families = {
    regular: 'SS3-Regular',
    bold: 'SS3-Bold',
  };

  const okReg = tryRegisterFont(doc, families.regular, regularPath);
  const okBold = tryRegisterFont(doc, families.bold, boldPath);

  // If Source Sans 3 missing, Helvetica will be used automatically by setFont

  const fileNameBase = (unit.title || 'unit').toString().trim().replace(/\s+/g, '_');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileNameBase}.pdf"`);

  doc.pipe(res);

  const pageWidth = doc.page.width;
  const xLeft = doc.page.margins.left;
  const xRight = pageWidth - doc.page.margins.right;

  // ===== Cover-ish header (matches your worksheet vibe) =====
  setFont(doc, families, 11, false);
  doc.text('Name: ____________________________        Date: ______________');

  doc.moveDown(0.7);

  setFont(doc, families, 18, true);
  doc.text((unit.title || '').toString().toUpperCase());

  setFont(doc, families, 12, false);
  const subj = safeText(unit.subject);
  const grd = safeText(unit.grade);
  const jur = safeText(unit.jurisdiction);
  doc.text([jur, subj ? `• ${subj}` : '', grd ? `• Grade ${grd}` : ''].filter(Boolean).join(' '));

  doc.moveDown(0.4);
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
  setFont(doc, families, 12, true);
  doc.text('For');
  bulletList(doc, families, unit?.assessment?.for);

  setFont(doc, families, 12, true);
  doc.text('As');
  bulletList(doc, families, unit?.assessment?.as);

  setFont(doc, families, 12, true);
  doc.text('Of');
  bulletList(doc, families, unit?.assessment?.of);

  // ===== Differentiation =====
  sectionTitle(doc, families, 'DIFFERENTIATION');
  setFont(doc, families, 12, true);
  doc.text('Universal Supports');
  bulletList(doc, families, unit?.differentiation?.universal);

  setFont(doc, families, 12, true);
  doc.text('Extensions');
  bulletList(doc, families, unit?.differentiation?.extension);

  // ===== Materials =====
  sectionTitle(doc, families, 'MATERIALS');
  bulletList(doc, families, unit?.materials);

  // ===== Lessons =====
  doc.addPage();

  setFont(doc, families, 18, true);
  doc.text((unit.title || '').toString().toUpperCase());

  setFont(doc, families, 12, false);
  doc.text(`Lesson Sequence (${unit.durationLessons || (unit.lessons?.length || 0)} lessons)`);
  doc.moveDown(0.4);
  hr(doc, xLeft, xRight, doc.y);
  doc.moveDown(0.6);

  const lessons = Array.isArray(unit.lessons) ? unit.lessons : [];
  for (const L of lessons) {
    // Page break safety
    if (doc.y > doc.page.height - doc.page.margins.bottom - 220) {
      doc.addPage();
    }

    setFont(doc, families, 14, true);
    doc.text(`Day ${L.day}: ${safeText(L.focus)}`);

    setFont(doc, families, 11, false);
    doc.moveDown(0.25);

    if (asLines(L.bigIdeas).length) {
      setFont(doc, families, 11, true);
      doc.text('Big Ideas: ', { continued: true });
      setFont(doc, families, 11, false);
      doc.text(asLines(L.bigIdeas).join('  •  '));
    }

    if (asLines(L.learningGoals).length) {
      setFont(doc, families, 11, true);
      doc.text('Learning Goals: ', { continued: true });
      setFont(doc, families, 11, false);
      doc.text(asLines(L.learningGoals).join('  •  '));
    }

    if (asLines(L.successCriteria).length) {
      setFont(doc, families, 11, true);
      doc.text('Success Criteria:');
      bulletList(doc, families, L.successCriteria);
    }

    if (safeText(L.mindsOn)) {
      setFont(doc, families, 11, true);
      doc.text('Minds On: ', { continued: true });
      setFont(doc, families, 11, false);
      doc.text(safeText(L.mindsOn));
    }

    if (safeText(L.action)) {
      setFont(doc, families, 11, true);
      doc.text('Action: ', { continued: true });
      setFont(doc, families, 11, false);
      doc.text(safeText(L.action));
    }

    if (safeText(L.consolidation)) {
      setFont(doc, families, 11, true);
      doc.text('Consolidation: ', { continued: true });
      setFont(doc, families, 11, false);
      doc.text(safeText(L.consolidation));
    }

    if (asLines(L.materials).length) {
      setFont(doc, families, 11, true);
      doc.text('Materials/Assets:');
      // Print asset paths as text (renderer-agnostic; future: embed icons)
      bulletList(doc, families, L.materials);
    }

    doc.moveDown(0.6);
    hr(doc, xLeft, xRight, doc.y);
    doc.moveDown(0.6);
  }

  doc.end();
}

module.exports = { renderUnitPDF };