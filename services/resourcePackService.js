const { getCurriculumRecipe } = require("../config/curriculumRecipes");

function buildTeacherOverview(found, curriculumRecipe) {
  return {
    title: `${found.gradeLabel} ${found.subject?.name || "Math"} – ${found.expectation?.code}`,
    learningGoal: found.expectation?.learningGoal || "Coming soon",
    successCriteria: Array.isArray(found.expectation?.successCriteria)
      ? found.expectation.successCriteria
      : [],
    notes: `This pack is aligned to ${found.expectation?.code} in ${found.strand?.name}.`,
    template: curriculumRecipe?.pack?.teacherOverviewTemplate || "standard",
  };
}

function buildExitTicketPreview(found, curriculumRecipe) {
  return {
    type: curriculumRecipe?.exitTicket?.type || "general-check",
    title: `Exit Ticket – ${found.expectation?.code}`,
    prompt: found.expectation?.text || "",
  };
}

function buildResourcePack(found) {
  const expectationCode = found?.expectation?.code || "";
  const curriculumRecipe = getCurriculumRecipe(expectationCode);

  const packRecipe = curriculumRecipe?.pack || null;
  const worksheetRecipe = curriculumRecipe?.worksheet || null;

  return {
    meta: {
      title: packRecipe?.title || `${expectationCode} Lesson Pack`,
      expectationCode,
      expectationId: found?.expectation?.id || "",
      grade: found?.grade || "",
      gradeLabel: found?.gradeLabel || "",
      subject: found?.subject?.name || "",
      strand: found?.strand?.name || "",
      topic: found?.topic?.name || "",
      type: packRecipe?.type || "general-pack",
    },
    includes: packRecipe?.includes || {
      worksheet: true,
      exitTicket: false,
      teacherOverview: false,
      miniAssessment: false,
      slides: false,
    },
    worksheet: worksheetRecipe
      ? {
          recipe: worksheetRecipe,
          expectationCode,
        }
      : null,
    teacherOverview: packRecipe?.includes?.teacherOverview
      ? buildTeacherOverview(found, curriculumRecipe)
      : null,
    exitTicket: packRecipe?.includes?.exitTicket
      ? buildExitTicketPreview(found, curriculumRecipe)
      : null,
  };
}

module.exports = {
  buildResourcePack,
};