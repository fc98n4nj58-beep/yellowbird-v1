const CURRICULUM_RECIPES = {
  exact: {
    "grade1:B:B1:B1.1": {
      worksheet: {
        template: "standard-practice",
        mode: "number-representation",
        title: "Number Representation",
        suggestedQuestionCount: 12,
        suggestedDifficulty: "easy",
        summary:
          "Practise representing numbers in different ways using pictures, objects, and numerals.",
        config: {
          operation: "math.addition.basic",
          aMin: 0,
          aMax: 50,
        },
      },
      exitTicket: {
        type: "quick-number-check",
        title: "Number Check",
        summary:
          "A quick check of number recognition, comparison, and representation.",
      },
      pack: {
        type: "number-sense-pack",
        title: "Number Sense Lesson Pack",
        summary:
          "A short practice pack focused on early number understanding and representation.",
        teacherOverview:
          "Students practise reading, representing, and comparing numbers using tools, pictures, and discussion.",
        includedAssets: ["worksheet", "exit-ticket", "teacher-overview"],
      },
    },

    "grade1:B:B2:B2.4": {
      worksheet: {
        template: "standard-practice",
        mode: "addition-subtraction-within-50",
        title: "Addition and Subtraction Within 50",
        suggestedQuestionCount: 12,
        suggestedDifficulty: "grade-appropriate",
        summary:
          "Practise representing and solving addition and subtraction situations within 50 using objects, drawings, and equations.",
        config: {
          operation: "addition-subtraction",
          aMin: 0,
          aMax: 50,
          bMin: 0,
          bMax: 50,
          subtractionNonNegative: true,
        },
      },
      exitTicket: {
        type: "addition-subtraction-check",
        title: "Quick Addition and Subtraction Check",
        summary:
          "Three short questions to check addition and subtraction understanding within 50.",
      },
      pack: {
        title: "B2.4 Lesson Pack",
        type: "general-pack",
        summary:
          "A practice pack for solving addition and subtraction problems within 50.",
        teacherOverview:
          "Students represent and solve addition and subtraction situations within 50 using tools, drawings, equations, and discussion.",
        includedAssets: ["worksheet", "exit-ticket", "teacher-overview"],
      },
    },

    "grade3:B:B2:B2.4": {
      worksheet: {
        template: "standard-practice",
        mode: "addition-strategies",
        title: "Addition and Subtraction Strategies",
        suggestedQuestionCount: 12,
        suggestedDifficulty: "medium",
        summary:
          "Practise representing and solving addition and subtraction problems using efficient strategies and clear mathematical thinking.",
        config: {
          operation: "addition-subtraction",
          aMin: 0,
          aMax: 100,
          bMin: 0,
          bMax: 100,
          subtractionNonNegative: true,
        },
      },
      exitTicket: {
        type: "addition-subtraction-check",
        title: "Addition and Subtraction Check",
        summary:
          "A short check of addition and subtraction strategy use and accuracy.",
      },
      pack: {
        type: "addition-subtraction-pack",
        title: "Addition and Subtraction Lesson Pack",
        summary:
          "A focused practice pack for addition and subtraction strategy work.",
        teacherOverview:
          "Students solve addition and subtraction problems using tools, mental strategies, equations, and discussion.",
        includedAssets: ["worksheet", "exit-ticket", "teacher-overview"],
      },
    },
  },

  topic: {
    "grade1:B:B1": {
      worksheet: {
        mode: "number-representation",
        title: "Number Sense Practice",
        suggestedQuestionCount: 12,
        suggestedDifficulty: "easy",
        config: {
          operation: "math.addition.basic",
          aMin: 0,
          aMax: 50,
        },
      },
      exitTicket: {
        type: "quick-number-check",
        title: "Number Check",
      },
      pack: {
        type: "number-sense-pack",
        title: "Number Sense Lesson Pack",
        includes: {
          worksheet: true,
          exitTicket: true,
          teacherOverview: true,
          miniAssessment: false,
          slides: false,
        },
      },
    },

    "grade3:B:B2": {
      worksheet: {
        mode: "addition-strategies",
        title: "Addition and Subtraction Practice",
        suggestedQuestionCount: 12,
        suggestedDifficulty: "medium",
        config: {
          operation: "math.addition.basic",
          aMin: 0,
          aMax: 100,
          bMin: 0,
          bMax: 100,
        },
      },
      exitTicket: {
        type: "general-check",
        title: "Addition and Subtraction Check",
      },
      pack: {
        type: "addition-subtraction-pack",
        title: "Addition and Subtraction Lesson Pack",
        includes: {
          worksheet: true,
          exitTicket: true,
          teacherOverview: true,
          miniAssessment: false,
          slides: false,
        },
      },
    },
  },

  strand: {
    "grade3:B": {
      worksheet: {
        mode: "number-representation",
        title: "Number Strand Practice",
        suggestedQuestionCount: 10,
        suggestedDifficulty: "easy",
        config: {
          operation: "math.addition.basic",
          aMin: 0,
          aMax: 20,
        },
      },
      exitTicket: {
        type: "general-check",
        title: "Number Exit Ticket",
      },
      pack: {
        type: "number-strand-pack",
        title: "Number Lesson Pack",
        includes: {
          worksheet: true,
          exitTicket: true,
          teacherOverview: true,
          miniAssessment: false,
          slides: false,
        },
      },
    },
  },

  general: {
    worksheet: {
      mode: "number-representation",
      title: "Math Practice",
      suggestedQuestionCount: 10,
      suggestedDifficulty: "easy",
      config: {
        operation: "math.addition.basic",
        aMin: 0,
        aMax: 10,
      },
    },
    exitTicket: {
      type: "general-check",
      title: "Math Exit Ticket",
    },
    pack: {
      type: "general-pack",
      title: "Math Lesson Pack",
      includes: {
        worksheet: true,
        exitTicket: true,
        teacherOverview: true,
        miniAssessment: false,
        slides: false,
      },
    },
  },
};

function buildCurriculumRecipeKey(found) {
  const grade = found?.grade?.id || found?.grade;
  const strandId = found?.strand?.id;
  const topicId = found?.topic?.id;
  const expectationId = found?.expectation?.id || found?.expectation?.code;

  if (!grade || !strandId || !topicId || !expectationId) {
    return null;
  }

  return `${grade}:${strandId}:${topicId}:${expectationId}`;
}

function getCurriculumRecipe(found) {
  if (typeof found === "string") {
    throw new Error(
      "getCurriculumRecipe requires full curriculum context, not a plain expectation code."
    );
  }

  const key = buildCurriculumRecipeKey(found);
  if (!key) return null;

  return CURRICULUM_RECIPES.exact[key] || null;
}

module.exports = {
  CURRICULUM_RECIPES,
  buildCurriculumRecipeKey,
  getCurriculumRecipe,
};