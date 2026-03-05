// engine/units/unitFactory.js
'use strict';

const { getMode, listModes } = require('./modes');

function asInt(v, fallback) {
  const n = Number.parseInt(String(v), 10);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeRequest(input) {
  const payload = input && typeof input === 'object' ? input : {};
  const grade = String(payload.grade || '').trim();            // "1", "2", ...
  const subject = String(payload.subject || '').trim();        // "math", "language", ...
  const jurisdiction = String(payload.jurisdiction || 'ontario').trim().toLowerCase();

  const lessonsRequested = asInt(payload.numLessons, 10);
  const numLessons = Math.min(Math.max(lessonsRequested, 1), 40);

  const modeKey = String(payload.modeKey || '').trim();

  // Optional knobs for future expansion
  const theme = String(payload.theme || '').trim();
  const constraints = Array.isArray(payload.constraints) ? payload.constraints.slice(0, 20) : [];

  return {
    grade,
    subject,
    jurisdiction,
    numLessons,
    modeKey,
    theme,
    constraints,
  };
}

function validateRequest(req) {
  const errors = [];
  if (!req.grade) errors.push('grade is required');
  if (!req.subject) errors.push('subject is required');
  if (!req.modeKey) errors.push('modeKey is required');
  if (req.numLessons < 1) errors.push('numLessons must be >= 1');
  return errors;
}

/**
 * Renderer-agnostic: returns JSON unit object only.
 * Mirrors the worksheet system's "mode registry" concept.
 */
async function generateUnit(input) {
  const request = normalizeRequest(input);
  const errors = validateRequest(request);
  if (errors.length) {
    const err = new Error('Invalid unit request');
    err.statusCode = 400;
    err.details = errors;
    throw err;
  }

  const mode = getMode(request.modeKey);
  if (!mode) {
    const err = new Error(`Unknown modeKey: ${request.modeKey}`);
    err.statusCode = 400;
    err.details = ['modeKey not found'];
    throw err;
  }

  // Mode-level support check
  if (mode.supports) {
    const okJur = !mode.supports.jurisdiction || mode.supports.jurisdiction.includes(request.jurisdiction);
    const okSub = !mode.supports.subject || mode.supports.subject.includes(request.subject);
    const okGrade = !mode.supports.grade || mode.supports.grade.includes(request.grade);
    if (!okJur || !okSub || !okGrade) {
      const err = new Error('modeKey does not support this selection');
      err.statusCode = 400;
      err.details = ['unsupported jurisdiction/subject/grade for this modeKey'];
      throw err;
    }
  }

  const unit = await mode.generate(request);

  // Minimum contract (stable for renderers)
  const now = new Date().toISOString();
  return {
    meta: {
      engine: 'yellowbird-units',
      version: 'v1',
      generatedAt: now,
      modeKey: mode.key,
    },
    request,
    unit,
  };
}

module.exports = {
  generateUnit,
  listModes,
};