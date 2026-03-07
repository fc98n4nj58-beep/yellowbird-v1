const CURRICULUM_RECIPES = {
  exact: {
    "B1.1": {
      worksheet: {
        mode: "number-representation",
        title: "Number Representation",
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

    "B2.4": {
      worksheet: {
        mode: "multiplication-arrays",
        title: "Multiplication Arrays",
        suggestedQuestionCount: 15,
        suggestedDifficulty: "medium",
        config: {
          operation: "math.multiplication.basic",
          aMin: 1,
          aMax: 10,
          bMin: 1,
          bMax: 10,
        },
      },
      exitTicket: {
        type: "array-check",
        title: "Array Check",
      },
      pack: {
        type: "multiplication-pack",
        title: "Multiplication Lesson Pack",
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

  topic: {
    "B1": {
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

    "B2": {
      worksheet: {
        mode: "multiplication-arrays",
        title: "Multiplication Practice",
        suggestedQuestionCount: 15,
        suggestedDifficulty: "medium",
        config: {
          operation: "math.multiplication.basic",
          aMin: 1,
          aMax: 10,
          bMin: 1,
          bMax: 10,
        },
      },
      exitTicket: {
        type: "array-check",
        title: "Array Check",
      },
      pack: {
        type: "multiplication-pack",
        title: "Multiplication Lesson Pack",
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
    "B": {
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

function getTopicKey(expectationCode) {
  const code = String(expectationCode || "").toUpperCase().trim();
  const match = code.match(/^([A-Z]\d+)/);
  return match ? match[1] : "";
}

function getStrandKey(expectationCode) {
  const code = String(expectationCode || "").toUpperCase().trim();
  const match = code.match(/^([A-Z])/);
  return match ? match[1] : "";
}

function getCurriculumRecipe(expectationCode) {
  const code = String(expectationCode || "").toUpperCase().trim();
  const topicKey = getTopicKey(code);
  const strandKey = getStrandKey(code);

  return (
    CURRICULUM_RECIPES.exact[code] ||
    CURRICULUM_RECIPES.topic[topicKey] ||
    CURRICULUM_RECIPES.strand[strandKey] ||
    CURRICULUM_RECIPES.general
  );
}

module.exports = {
  CURRICULUM_RECIPES,
  getCurriculumRecipe,
};