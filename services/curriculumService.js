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
function normalizeGradeKey(value) {
  const v = String(value || "").trim().toLowerCase();
  if (!v) return "";
  if (v === "k" || v === "kindergarten") return "kindergarten";
  if (v.startsWith("grade")) return v;
  if (/^\d+$/.test(v)) return `grade${v}`;
  return v;
}

function getGradeNode(grade) {
  const raw = getCurriculumRaw();
  const grades = Array.isArray(raw?.grades) ? raw.grades : [];
  const target = normalizeGradeKey(grade);

  return grades.find((g) => String(g?.grade || "").toLowerCase() === target) || null;
}

function getStrandsByGrade(grade) {
  const gradeNode = getGradeNode(grade);
  const strands = Array.isArray(gradeNode?.strands) ? gradeNode.strands : [];

  return strands.map((s) => ({
    id: s.id,
    name: s.name,
  }));
}

function getTopicsByGradeAndStrand(grade, strandId) {
  const gradeNode = getGradeNode(grade);
  const strands = Array.isArray(gradeNode?.strands) ? gradeNode.strands : [];

  const strand = strands.find(
    (s) => String(s?.id || "").toUpperCase() === String(strandId || "").toUpperCase()
  );

  const topics = Array.isArray(strand?.topics) ? strand.topics : [];

  return topics.map((t) => ({
    id: t.id,
    name: t.name,
  }));
}

function getExpectationsByGradeStrandAndTopic(grade, strandId, topicId) {
  const gradeNode = getGradeNode(grade);
  const strands = Array.isArray(gradeNode?.strands) ? gradeNode.strands : [];

  const strand = strands.find(
    (s) => String(s?.id || "").toUpperCase() === String(strandId || "").toUpperCase()
  );

  const topics = Array.isArray(strand?.topics) ? strand.topics : [];

  const topic = topics.find(
    (t) => String(t?.id || "").toUpperCase() === String(topicId || "").toUpperCase()
  );

  const expectations = Array.isArray(topic?.expectations) ? topic.expectations : [];

  return expectations.map((e) => ({
    id: e.id,
    code: e.code || "",
    name: e.code ? `${e.code}` : (e.id || ""),
    text: e.text || "",
  }));
}

function getExpectationContextById(id) {
  const raw = getCurriculumRaw();
  const grades = Array.isArray(raw?.grades) ? raw.grades : [];

  for (const g of grades) {
    const strands = Array.isArray(g?.strands) ? g.strands : [];

    for (const s of strands) {
      const topics = Array.isArray(s?.topics) ? s.topics : [];

      for (const t of topics) {
        const expectations = Array.isArray(t?.expectations) ? t.expectations : [];

        for (const e of expectations) {
          if (String(e?.id) !== String(id)) continue;

          const expRecipe = e?.worksheet_recipe || t?.topic_recipe || null;

          return {
            ok: true,
            source: "curriculum dataset",
            loadedFrom: "data/curriculum/ontario/math_k6.json",
            version: raw.version || "",
            jurisdiction: raw.jurisdiction,
            subject: raw.subject,
            grade: g.grade,
            gradeLabel: g.gradeLabel || `Grade ${g.grade}`,
            strand: { id: s.id, name: s.name },
            topic: { id: t.id, name: t.name },
            expectation: {
              id: e.id,
              code: e.code || "",
              text: e.text || "",
              worksheet_recipe: expRecipe,
              learningGoal: e.learningGoal || "",
              successCriteria: Array.isArray(e.successCriteria) ? e.successCriteria : [],
            },
          };
        }
      }
    }
  }

  return null;
}

function getExpectationContextByRoute({ subject, grade, strand, expectationCode }) {
  const raw = getCurriculumRaw();
  const grades = Array.isArray(raw?.grades) ? raw.grades : [];

  const normalizeRoutePart = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9.-]/g, "");

  const gradeTarget = String(grade || "").trim().toLowerCase();
  const strandTarget = normalizeRoutePart(strand);
  const codeTarget = String(expectationCode || "").trim().toUpperCase();
  const subjectTarget = normalizeRoutePart(subject);

  for (const g of grades) {
    if (String(g?.grade || "").toLowerCase() !== gradeTarget) continue;

    const strands = Array.isArray(g?.strands) ? g.strands : [];

    for (const s of strands) {
      const strandSlug = normalizeRoutePart(s?.name || s?.id);
      if (strandSlug !== strandTarget) continue;

      const topics = Array.isArray(s?.topics) ? s.topics : [];

      for (const t of topics) {
        const expectations = Array.isArray(t?.expectations) ? t.expectations : [];

        for (const e of expectations) {
          if (String(e?.code || "").toUpperCase() !== codeTarget) continue;

          const subjectSlug = normalizeRoutePart(raw?.subject?.name || raw?.subject?.id || "");
          if (subjectTarget && subjectSlug && subjectTarget !== subjectSlug) continue;

          return {
            jurisdiction: raw.jurisdiction,
            subject: raw.subject,
            grade: g.grade,
            gradeLabel: g.gradeLabel || `Grade ${g.grade}`,
            strand: { id: s.id, name: s.name },
            topic: { id: t.id, name: t.name },
            expectation: {
              id: e.id,
              code: e.code || "",
              text: e.text || "",
              worksheet_recipe: e.worksheet_recipe || null,
              learningGoal: e.learningGoal || "",
              successCriteria: Array.isArray(e.successCriteria) ? e.successCriteria : [],
            },
          };
        }
      }
    }
  }

  return null;
}

function getExpectationContext({ jurisdiction, grade, subject, strandId, topicId, expectationId }) {
  const raw = getCurriculumRaw();
  const grades = Array.isArray(raw?.grades) ? raw.grades : [];

  const gradeObj = grades.find(
    (g) => String(g?.grade || "").toLowerCase() === String(grade || "").toLowerCase()
  );
  if (!gradeObj) return null;

  const subjectObj = raw?.subject || {};
  if (
    subject &&
    String(subjectObj.id || "").toLowerCase() !== String(subject || "").toLowerCase()
  ) {
    return null;
  }

  const strandObj = (gradeObj.strands || []).find(
    (s) => String(s?.id || "").toLowerCase() === String(strandId || "").toLowerCase()
  );
  if (!strandObj) return null;

  const topicObj = (strandObj.topics || []).find(
    (t) => String(t?.id || "").toLowerCase() === String(topicId || "").toLowerCase()
  );
  if (!topicObj) return null;

  const expectationObj = (topicObj.expectations || []).find(
    (e) => String(e?.id || "").toLowerCase() === String(expectationId || "").toLowerCase()
  );
  if (!expectationObj) return null;

  const expRecipe = expectationObj?.worksheet_recipe || topicObj?.topic_recipe || null;

  return {
    ok: true,
    source: "curriculum dataset",
    loadedFrom: "data/curriculum/ontario/math_k6.json",
    version: raw.version || "",
    jurisdiction: raw.jurisdiction,
    subject: raw.subject,
    grade: gradeObj.grade,
    gradeLabel: gradeObj.gradeLabel || `Grade ${gradeObj.grade}`,
    strand: {
      id: strandObj.id,
      name: strandObj.name
    },
    topic: {
      id: topicObj.id,
      name: topicObj.name
    },
    expectation: {
      id: expectationObj.id,
      code: expectationObj.code || "",
      text: expectationObj.text || "",
      worksheet_recipe: expRecipe,
      learningGoal: expectationObj.learningGoal || "",
      successCriteria: Array.isArray(expectationObj.successCriteria)
        ? expectationObj.successCriteria
        : []
    }
  };
}

module.exports = {
  loadCurriculum,
  getCurriculumRaw,
  getAllExpectations,
  getExpectationByCode,
  getExpectationByRoute,
  getExpectationContext,
  getExpectationsByFilters,
  normalizeGradeKey,
  getGradeNode,
  getStrandsByGrade,
  getTopicsByGradeAndStrand,
  getExpectationsByGradeStrandAndTopic,
  getExpectationContextById,
  getExpectationContextByRoute,
};