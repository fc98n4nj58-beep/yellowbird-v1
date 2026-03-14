const { getCurriculumRecipe } = require("../config/curriculumRecipes");

function buildTeacherOverview(found, curriculumRecipe) {
  return {
    title: `${found.gradeLabel} ${found.subject?.name || "Math"} – ${found.expectation?.code}`,
    learningGoal: found.expectation?.learningGoal || "Coming soon",
    successCriteria: Array.isArray(found.expectation?.successCriteria)
      ? found.expectation.successCriteria
      : [],
    notes:
      curriculumRecipe?.pack?.teacherOverview ||
      `This pack is aligned to ${found.expectation?.code} in ${found.strand?.name}.`,
    template: curriculumRecipe?.pack?.teacherOverviewTemplate || "standard",
  };
}

function buildExitTicketPreview(found, curriculumRecipe) {
  return {
    type: curriculumRecipe?.exitTicket?.type || "general-check",
    title: `Exit Ticket – ${found.expectation?.code}`,
    summary:
      curriculumRecipe?.exitTicket?.summary ||
      curriculumRecipe?.exitTicket?.title ||
      "Quick skill check aligned to this expectation.",
  };
}

function buildWorksheetPreview(found, curriculumRecipe) {
  if (!curriculumRecipe?.worksheet) return null;

  return {
    expectationCode: found?.expectation?.code || "",
    summary:
      curriculumRecipe?.worksheet?.summary ||
      "Worksheet practice aligned to this expectation.",
    recipe: curriculumRecipe.worksheet,
  };
}

function buildResourcePack(found) {
  const curriculumRecipe = getCurriculumRecipe(found);
  const pack = curriculumRecipe?.pack || {};

  const includedAssets = Array.isArray(pack.includedAssets)
    ? pack.includedAssets
    : ["worksheet", "exit-ticket"];

  const includes = {
    worksheet: includedAssets.includes("worksheet"),
    exitTicket: includedAssets.includes("exit-ticket"),
    teacherOverview: includedAssets.includes("teacher-overview"),
    miniAssessment: includedAssets.includes("mini-assessment"),
    slides: includedAssets.includes("slides"),
  };

  return {
    meta: {
      title: pack.title || `${found?.expectation?.code || ""} Lesson Pack`,
      expectationCode: found?.expectation?.code || "",
      expectationId: found?.expectation?.id || "",
      grade: found?.grade || "",
      gradeLabel: found?.gradeLabel || "",
      subject: found?.subject?.name || "",
      strand: found?.strand?.name || "",
      topic: found?.topic?.name || "",
      type: pack.type || "general-pack",
      summary:
        pack.summary || "A resource pack aligned to this curriculum expectation.",
    },
    includes,
    includedAssets,
    worksheet: includes.worksheet
      ? buildWorksheetPreview(found, curriculumRecipe)
      : null,
    teacherOverview: includes.teacherOverview
      ? buildTeacherOverview(found, curriculumRecipe)
      : null,
    exitTicket: includes.exitTicket
      ? buildExitTicketPreview(found, curriculumRecipe)
      : null,
  };
}

module.exports = {
  buildResourcePack,
};