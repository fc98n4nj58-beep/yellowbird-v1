const fs = require('fs');
const path = require('path');

const CURRICULUM_PATH = path.join(
  __dirname,
  '..',
  'data',
  'curriculum',
  'ontario',
  'math_k6.json'
);

let curriculumCache = null;

/**
 * Normalize strings for route-safe matching.
 * Example:
 * "Grade 3" -> "grade3"
 * "B2.4" -> "b2.4"
 * "Number" -> "number"
 */
function normalize(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9.\-_]/g, '');
}

/**
 * Convert labels like "Grade 3" to route key "grade3"
 */
function normalizeGrade(value) {
  return normalize(value).replace(/^grade(?=\d|k)/, 'grade');
}

/**
 * Try to flatten several possible curriculum JSON shapes
 * into one consistent expectations array.
 */
function flattenCurriculum(raw) {
  if (!raw) return [];

  // Already flat
  if (Array.isArray(raw)) {
    return raw.map(normalizeExpectationRecord).filter(Boolean);
  }

  // Common structured shape:
  // { grades: [ { id, label, strands: [...] } ] }
  if (Array.isArray(raw.grades)) {
    const flattened = [];

    for (const gradeEntry of raw.grades) {
      const gradeId =
        gradeEntry.id ||
        gradeEntry.grade ||
        gradeEntry.gradeId ||
        gradeEntry.slug ||
        '';
      const gradeLabel =
        gradeEntry.label ||
        gradeEntry.name ||
        gradeEntry.title ||
        gradeId;

      const strands = gradeEntry.strands || gradeEntry.categories || [];

      for (const strandEntry of strands) {
        const strandId =
          strandEntry.id ||
          strandEntry.slug ||
          strandEntry.code ||
          strandEntry.name ||
          '';
        const strandLabel =
          strandEntry.label ||
          strandEntry.name ||
          strandEntry.title ||
          strandId;

        const expectations =
          strandEntry.expectations ||
          strandEntry.items ||
          strandEntry.outcomes ||
          [];

        for (const exp of expectations) {
          flattened.push(
            normalizeExpectationRecord({
              ...exp,
              grade: exp.grade || gradeId,
              gradeLabel: exp.gradeLabel || gradeLabel,
              strand: exp.strand || strandId,
              strandLabel: exp.strandLabel || strandLabel,
              subject:
                exp.subject ||
                raw.subject ||
                raw.subjectName ||
                'Math',
            })
          );
        }
      }
    }

    return flattened.filter(Boolean);
  }

  return [];
}

/**
 * Force each expectation into a predictable shape.
 */
function normalizeExpectationRecord(item) {
  if (!item) return null;

  const subjectRaw = item.subject;
  const subjectId =
    typeof subjectRaw === 'object'
      ? subjectRaw.id || subjectRaw.slug || subjectRaw.name || 'MATH'
      : subjectRaw || 'MATH';

  const subjectName =
    typeof subjectRaw === 'object'
      ? subjectRaw.name || subjectRaw.label || subjectRaw.id || 'Math'
      : subjectRaw || 'Math';

  const grade = item.grade || item.gradeId || '';
  const gradeLabel = item.gradeLabel || item.grade_name || item.gradeName || grade;

  const strand = item.strand || item.strandId || '';
  const strandLabel =
    item.strandLabel || item.strand_name || item.strandName || strand;

  const code = item.code || item.expectationCode || item.id || '';
  const title =
    item.title ||
    item.name ||
    item.shortDescription ||
    item.expectation ||
    item.description ||
    '';

  return {
    ...item,
    subject: {
      id: String(subjectId),
      name: String(subjectName),
    },
    grade: String(grade),
    gradeLabel: String(gradeLabel),
    strand: String(strand),
    strandLabel: String(strandLabel),
    code: String(code),
    title: String(title),
    description: String(item.description || ''),
    learningGoal: item.learningGoal || '',
    successCriteria: Array.isArray(item.successCriteria)
      ? item.successCriteria
      : [],
  };
}

function loadCurriculum() {
  if (curriculumCache) return curriculumCache;

  const rawText = fs.readFileSync(CURRICULUM_PATH, 'utf8');
  const rawJson = JSON.parse(rawText);

  const expectations = flattenCurriculum(rawJson);

  curriculumCache = {
    raw: rawJson,
    expectations,
  };

  return curriculumCache;
}

function getAllExpectations() {
  return loadCurriculum().expectations;
}

function getCurriculumRaw() {
  return loadCurriculum().raw;
}

function getExpectationByCode(code) {
  const expectations = getAllExpectations();
  const target = normalize(code);

  return expectations.find((item) => normalize(item.code) === target) || null;
}

function getExpectationByRoute({ subject, grade, strand, expectationCode }) {
  const expectations = getAllExpectations();

  const subjectTarget = normalize(subject);
  const gradeTarget = normalizeGrade(grade);
  const strandTarget = normalize(strand);
  const codeTarget = normalize(expectationCode);

  return (
    expectations.find((item) => {
      const itemSubject =
        normalize(item.subject?.name) || normalize(item.subject?.id);
      const itemSubjectAlt =
        normalize(item.subject?.id) || normalize(item.subject?.name);

      return (
        (itemSubject === subjectTarget || itemSubjectAlt === subjectTarget) &&
        normalizeGrade(item.grade) === gradeTarget &&
        normalize(item.strand) === strandTarget &&
        normalize(item.code) === codeTarget
      );
    }) || null
  );
}

function getExpectationsByFilters(filters = {}) {
  const expectations = getAllExpectations();

  return expectations.filter((item) => {
    if (filters.subject) {
      const subjectTarget = normalize(filters.subject);
      const itemSubject =
        normalize(item.subject?.name) || normalize(item.subject?.id);
      const itemSubjectAlt =
        normalize(item.subject?.id) || normalize(item.subject?.name);

      if (itemSubject !== subjectTarget && itemSubjectAlt !== subjectTarget) {
        return false;
      }
    }

    if (filters.grade && normalizeGrade(item.grade) !== normalizeGrade(filters.grade)) {
      return false;
    }

    if (filters.strand && normalize(item.strand) !== normalize(filters.strand)) {
      return false;
    }

    if (
      filters.expectationCode &&
      normalize(item.code) !== normalize(filters.expectationCode)
    ) {
      return false;
    }

    return true;
  });
}

module.exports = {
  loadCurriculum,
  getCurriculumRaw,
  getAllExpectations,
  getExpectationByCode,
  getExpectationByRoute,
  getExpectationsByFilters,
};