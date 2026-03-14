function safeStr(value) {
  return (value ?? "").toString().trim();
}

function slugify(value) {
  return safeStr(value)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");
}

function normalizeGradeSegment(grade) {
  const raw = safeStr(grade).toLowerCase();
  return raw.replace(/^grade/, "");
}

function buildExpectationUrl(found) {
  const subjectSlug = slugify(found?.subject?.name || "Math");
  const gradeSegment = normalizeGradeSegment(found?.grade || "");
  const strandSlug = slugify(found?.strand?.name || "");
  const expectationSlug = slugify(found?.expectation?.code || "");

  return `/curriculum/on/${subjectSlug}/grade${gradeSegment}/${strandSlug}/${expectationSlug}`;
}

function buildWorksheetUrl(found, worksheetRecipe = null) {
  const gradeParam = safeStr(found?.grade || found?.gradeLabel || "")
    .toLowerCase()
    .replace(/^grade\s*/i, "grade");

  return (
    `/worksheet?subject=${encodeURIComponent(found?.subject?.name || "Math")}` +
    `&grade=${encodeURIComponent(gradeParam)}` +
    `&strand=${encodeURIComponent(found?.strand?.name || "")}` +
    `&topic=${encodeURIComponent(found?.topic?.name || "")}` +
    `&expectation=${encodeURIComponent(found?.expectation?.code || "")}` +
    `&expectationId=${encodeURIComponent(found?.expectation?.id || "")}` +
    `&expectationText=${encodeURIComponent(found?.expectation?.text || "")}` +
    `&recipeMode=${encodeURIComponent(worksheetRecipe?.mode || "")}` +
    `&recipeTitle=${encodeURIComponent(worksheetRecipe?.title || "")}` +
    `&recipeQuestionCount=${encodeURIComponent(worksheetRecipe?.suggestedQuestionCount || "")}` +
    `&recipeDifficulty=${encodeURIComponent(worksheetRecipe?.suggestedDifficulty || "")}` +
    `&operation=${encodeURIComponent(worksheetRecipe?.config?.operation || "")}` +
    `&aMin=${encodeURIComponent(worksheetRecipe?.config?.aMin ?? "")}` +
    `&aMax=${encodeURIComponent(worksheetRecipe?.config?.aMax ?? "")}` +
    `&bMin=${encodeURIComponent(worksheetRecipe?.config?.bMin ?? "")}` +
    `&bMax=${encodeURIComponent(worksheetRecipe?.config?.bMax ?? "")}`
  );
}

function buildExitTicketUrl(found, exitTicketType = "general-check") {
  return (
    `/exit-ticket?subject=${encodeURIComponent(found?.subject?.name || "Math")}` +
    `&grade=${encodeURIComponent(found?.grade || "")}` +
    `&strand=${encodeURIComponent(found?.strand?.name || "")}` +
    `&expectation=${encodeURIComponent(found?.expectation?.code || "")}` +
    `&expectationId=${encodeURIComponent(found?.expectation?.id || "")}` +
    `&exitTicketType=${encodeURIComponent(exitTicketType)}`
  );
}

function buildPackUrl(found) {
  const gradeParam = safeStr(found?.grade || found?.gradeLabel || "")
    .toLowerCase()
    .replace(/^grade\s*/i, "grade");

  return (
    `/pack-preview?subject=${encodeURIComponent(found?.subject?.name || "Math")}` +
    `&grade=${encodeURIComponent(gradeParam)}` +
    `&strand=${encodeURIComponent(found?.strand?.name || "")}` +
    `&topic=${encodeURIComponent(found?.topic?.name || "")}` +
    `&expectation=${encodeURIComponent(found?.expectation?.code || "")}` +
    `&expectationId=${encodeURIComponent(found?.expectation?.id || "")}` +
    `&expectationText=${encodeURIComponent(found?.expectation?.text || "")}`
  );
}

module.exports = {
  safeStr,
  slugify,
  normalizeGradeSegment,
  buildExpectationUrl,
  buildWorksheetUrl,
  buildExitTicketUrl,
  buildPackUrl,
};
