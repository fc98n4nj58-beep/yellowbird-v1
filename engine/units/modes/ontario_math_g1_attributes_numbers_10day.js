// engine/units/modes/ontario_math_g1_attributes_numbers_10day.js
'use strict';

const ASSETS = require('../assets/mathAssets');

const key = 'ontario_math_1_attributes_numbers_10day';
const label = 'Ontario Math · Grade 1 · Attributes & Numbers (10 Days)';

const supports = {
  jurisdiction: ['ontario'],
  subject: ['math'],
  grade: ['1'],
};

function lesson(day, focus, components = {}) {
  return {
    day,
    focus,
    bigIdeas: components.bigIdeas || [],
    learningGoals: components.learningGoals || [],
    successCriteria: components.successCriteria || [],
    materials: components.materials || [],
    assessment: components.assessment || [],
    differentiation: components.differentiation || [],
    mindsOn: components.mindsOn || '',
    action: components.action || '',
    consolidation: components.consolidation || '',
    culminatingLink: components.culminatingLink || '',
  };
}

async function generate(request) {
  const unitTitle = 'ATTRIBUTES AND NUMBERS';

  return {
    title: unitTitle,
    jurisdiction: 'Ontario',
    subject: 'Math',
    grade: '1',
    durationLessons: 10,

    overview: {
      description:
        'A 10-lesson launch sequence that builds classroom routines while establishing core structures: sorting/classifying, patterns, representing numbers, counting collections, calendar awareness, and early money recognition.',
      bigIdeas: [
        'Objects and numbers can be described, sorted, and represented in multiple ways.',
        'Patterns and structures help us predict and understand quantities.',
        'Numbers can be represented using models to support thinking and communication.',
      ],
      culminatingTask:
        'Math Showcase: Students create a “My Math Thinking” page showing a number in multiple representations, a simple attribute sort, and a pattern strip, then explain choices orally or in writing.',
    },

    assessment: {
      for: [
        'Anecdotal notes during sorting/pattern tasks',
        'Quick checks during number representation',
        'Observation checklist during counting collections',
      ],
      as: [
        'Student self-check: “I can…” success criteria reflection',
        'Partner explain-and-check routines',
      ],
      of: [
        'Culminating “My Math Thinking” page rubric (simple: meets/approaching/not yet)',
      ],
    },

    differentiation: {
      universal: [
        'Use visuals and manipulatives first; symbols second',
        'Offer oral response option; sentence frames for explanations',
        'Reduce quantity range (to 10/20) while preserving concept',
      ],
      extension: [
        'Represent numbers in 3+ ways including open number line',
        'Create two different sorting rules for the same set',
        'Design and describe a growing pattern',
      ],
    },

    materials: [
      'SVG math asset library (served from /public/assets/math)',
      'Pattern blocks or simple cut-outs',
      'Counters / linking cubes',
      'Whiteboards / markers',
      'Chart paper / sticky notes',
    ],

    lessons: [
      lesson(1, 'Sorting by One Attribute', {
        bigIdeas: ['We can sort objects using one rule (attribute).'],
        learningGoals: ['I can sort objects using one attribute.'],
        successCriteria: ['I can choose a rule.', 'I can sort correctly.', 'I can explain my rule.'],
        materials: [ASSETS.sorting.twoCol, ASSETS.shapes.circle, ASSETS.shapes.square],
        assessment: ['Observe: correct grouping and explanation'],
        differentiation: ['Provide fewer items', 'Provide picture word bank'],
        mindsOn: 'Mystery Sort: teacher models sorting classroom items by one attribute.',
        action: 'Students sort pictures/objects on a 2-column mat and state the rule.',
        consolidation: 'Share sorts; classmates guess the rule.',
        culminatingLink: 'Save best sort for the showcase.',
      }),

      lesson(2, 'Sorting and Explaining the Rule', {
        bigIdeas: ['A rule can be named and used consistently.'],
        learningGoals: ['I can sort and explain my sorting rule clearly.'],
        successCriteria: ['I can name the attribute.', 'I can sort accurately.', 'I can explain why items belong.'],
        materials: [ASSETS.sorting.threeCol],
        assessment: ['Quick conference: “Tell me your rule.”'],
        differentiation: ['Sentence frames: “I sorted by ___.“'],
        mindsOn: 'Sort-and-Switch: sort one way, then re-sort using a new attribute.',
        action: 'Students choose 3 groups and justify placement.',
        consolidation: 'Gallery walk with “guess the rule” sticky notes.',
        culminatingLink: 'Add an explanation sentence to the showcase.',
      }),

      lesson(3, '2D and 3D Shape Attributes', {
        bigIdeas: ['Shapes have attributes we can describe (sides/corners; faces/edges).'],
        learningGoals: ['I can describe and sort shapes by their attributes.'],
        successCriteria: ['I can name features.', 'I can sort by one feature.', 'I can explain my choice.'],
        materials: [
          ASSETS.shapes.circle,
          ASSETS.shapes.triangle,
          ASSETS.shapes.square,
          ASSETS.shapes.rectangle,
          ASSETS.shapes.cube,
          ASSETS.shapes.sphere,
          ASSETS.shapes.cylinder,
          ASSETS.shapes.cone,
        ],
        assessment: ['Checklist: identifies sides/corners; faces/edges'],
        differentiation: ['Use fewer shapes; allow matching cards'],
        mindsOn: 'Shape talk: compare two shapes using “same/different.”',
        action: 'Sort shape cards by one attribute (e.g., corners).',
        consolidation: 'Class chart: “Shapes we know + key attributes.”',
        culminatingLink: 'Include one shape sort in the showcase.',
      }),

      lesson(4, 'Repeating and Growing Patterns', {
        bigIdeas: ['Patterns repeat or grow using a rule.'],
        learningGoals: ['I can create and describe a pattern rule.'],
        successCriteria: ['I can copy a pattern.', 'I can extend it.', 'I can describe the rule.'],
        materials: [ASSETS.patterns.strip10],
        assessment: ['Observe: correct extension + verbal rule'],
        differentiation: ['Start with AB; reduce length'],
        mindsOn: 'Clap-stomp pattern; students predict what comes next.',
        action: 'Build and extend patterns on strips; write/voice the rule.',
        consolidation: 'Share one pattern; peers name the core.',
        culminatingLink: 'Include one repeating or growing pattern in the showcase.',
      }),

      lesson(5, 'Represent Numbers to 10', {
        bigIdeas: ['Numbers can be represented in different ways.'],
        learningGoals: ['I can show a number in more than one way.'],
        successCriteria: ['I can represent with ten frame.', 'I can show on a number line.', 'I can use drawings or objects.'],
        materials: [ASSETS.tenFrames.single(0), ASSETS.numberLines.to10],
        assessment: ['Quick check: student shows 7 in two ways'],
        differentiation: ['Limit to 0–5; provide scaffolded ten frames'],
        mindsOn: 'Number of the day: show in fingers, dots, and ten frame.',
        action: 'Students complete represent-a-number tasks (3 representations).',
        consolidation: 'Discuss: “Which representation helped you most?”',
        culminatingLink: 'Choose one number for the showcase.',
      }),

      lesson(6, 'Represent Numbers to 20', {
        bigIdeas: ['Teen numbers can be shown using tens and ones and frames.'],
        learningGoals: ['I can represent numbers to 20 using models.'],
        successCriteria: ['I can use double ten frames.', 'I can show on a number line.', 'I can explain tens and ones informally.'],
        materials: [ASSETS.tenFrames.double(0), ASSETS.numberLines.to20],
        assessment: ['Observe: accurate placement and representation'],
        differentiation: ['Focus 11–15 first'],
        mindsOn: 'Show 14: “Where is the ten hiding?”',
        action: 'Represent teen numbers with double ten frames and number line.',
        consolidation: 'Share strategies for “close to 10” numbers.',
        culminatingLink: 'Add one teen number to the showcase.',
      }),

      lesson(7, 'Represent Numbers to 50', {
        bigIdeas: ['Numbers can be grouped into tens and ones.'],
        learningGoals: ['I can represent numbers to 50 using tens and ones.'],
        successCriteria: ['I can show tens and ones.', 'I can match to numeral.', 'I can find on number line.'],
        materials: [ASSETS.baseTen.one, ASSETS.baseTen.ten, ASSETS.numberLines.to50],
        assessment: ['Quick check: show 37 as tens and ones'],
        differentiation: ['Limit to 0–30'],
        mindsOn: 'Build 23 with tens/ones; students guess.',
        action: 'Students represent numbers using base ten visuals and record tens/ones.',
        consolidation: 'Discuss: “How do tens help us count faster?”',
        culminatingLink: 'Include a tens/ones representation in the showcase.',
      }),

      lesson(8, 'Counting Collections', {
        bigIdeas: ['We can estimate and count using strategies.'],
        learningGoals: ['I can estimate and count a collection.'],
        successCriteria: ['I can estimate reasonably.', 'I can count accurately.', 'I can explain strategy.'],
        materials: [ASSETS.data.countingRecord, ASSETS.numberLines.open],
        assessment: ['Anecdotal: strategy used (1s/2s/5s/10s)'],
        differentiation: ['Smaller collections; pre-grouped by 10s'],
        mindsOn: 'Estimate jar (quick guess), then count together.',
        action: 'Students estimate and count a collection; record strategy.',
        consolidation: 'Compare estimates vs totals; discuss “close/far.”',
        culminatingLink: 'Show counting strategy in the showcase.',
      }),

      lesson(9, 'Calendar Math', {
        bigIdeas: ['Calendars help us organize and count days.'],
        learningGoals: ['I can read and use a calendar.'],
        successCriteria: ['I can identify day/month.', 'I can find a date.', 'I can count forward/back.'],
        materials: [ASSETS.calendar.monthBlank, ASSETS.calendar.daysOfWeekStrip],
        assessment: ['Quick prompts: “What is tomorrow?” “What is 3 days after?”'],
        differentiation: ['Use week strip; fewer jumps'],
        mindsOn: 'Calendar talk: today/yesterday/tomorrow.',
        action: 'Students fill and answer date questions using a blank calendar.',
        consolidation: 'Share strategies for counting on days.',
        culminatingLink: 'Add a calendar fact or mini-task to the showcase.',
      }),

      lesson(10, 'Canadian Money', {
        bigIdeas: ['Coins have names, values, and features that help us identify them.'],
        learningGoals: ['I can identify coins and compare values.'],
        successCriteria: ['I can name coins.', 'I can order by value.', 'I can match coin to value.'],
        materials: [],
        assessment: ['Match and order task'],
        differentiation: ['Use 3 coins only; add visuals'],
        mindsOn: 'Coin mystery: identify by features.',
        action: 'Match coins to names/values; order by value.',
        consolidation: 'Discuss: “Which coin is easiest to identify and why?”',
        culminatingLink: 'Final showcase assembly and sharing.',
      }),
    ],
  };
}

module.exports = { key, label, supports, generate };