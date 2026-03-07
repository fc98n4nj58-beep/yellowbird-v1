const PACK_RECIPES = {
  "B1.1": {
    type: "number-sense-pack",
    title: "Number Sense Lesson Pack",
    includes: {
      worksheet: true,
      exitTicket: true,
      teacherOverview: true,
      miniAssessment: false,
      slides: false,
    },
    worksheetRecipe: "B1.1",
    exitTicketType: "quick-number-check",
    teacherOverviewTemplate: "standard",
  },

  "B2.4": {
    type: "multiplication-pack",
    title: "Multiplication Lesson Pack",
    includes: {
      worksheet: true,
      exitTicket: true,
      teacherOverview: true,
      miniAssessment: false,
      slides: false,
    },
    worksheetRecipe: "B2.4",
    exitTicketType: "array-check",
    teacherOverviewTemplate: "standard",
  },
};

function getPackRecipe(expectationCode) {
  return PACK_RECIPES[String(expectationCode || "").toUpperCase()] || null;
}

module.exports = {
  PACK_RECIPES,
  getPackRecipe,
};