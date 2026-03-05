// engine/units/modes/generic_unit.js
'use strict';

const key = 'generic_unit_v1';
const label = 'Generic Unit Builder (All Subjects)';

const supports = {
  jurisdiction: ['ontario', 'any'],
  subject: ['math', 'language', 'science', 'social', 'art', 'music', 'any'],
  grade: ['k', '1', '2', '3', '4', '5', '6'],
};

function makeLesson(i) {
  return {
    day: i,
    focus: `Lesson ${i}`,
    bigIdeas: [],
    learningGoals: [],
    successCriteria: [],
    materials: [],
    assessment: [],
    differentiation: [],
    mindsOn: '',
    action: '',
    consolidation: '',
    culminatingLink: '',
  };
}

async function generate(request) {
  const title = String(request.theme || 'UNIT PLAN').trim() || 'UNIT PLAN';
  const n = request.numLessons;

  return {
    title: title.toUpperCase(),
    jurisdiction: request.jurisdiction,
    subject: request.subject,
    grade: request.grade,
    durationLessons: n,
    overview: {
      description: 'Generic unit shell. Populate via future UI/AI authoring.',
      bigIdeas: [],
      culminatingTask: '',
    },
    assessment: { for: [], as: [], of: [] },
    differentiation: { universal: [], extension: [] },
    materials: [],
    lessons: Array.from({ length: n }, (_, idx) => makeLesson(idx + 1)),
  };
}

module.exports = { key, label, supports, generate };