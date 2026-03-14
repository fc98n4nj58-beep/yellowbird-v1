function titleCase(str = "") {
  return String(str)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function buildFocusSummary({ skill, expectationTitle, activityTypes = [] }) {
  if (skill?.description) {
    return skill.description;
  }

  const niceActivities = activityTypes.map(titleCase).join(", ");

  if (expectationTitle && niceActivities) {
    return `Students practise ${expectationTitle.toLowerCase()} using ${niceActivities.toLowerCase()}.`;
  }

  if (expectationTitle) {
    return `Students practise ${expectationTitle.toLowerCase()}.`;
  }

  return "Students practise curriculum-aligned skills with printable question sets.";
}

function buildClassroomUseTags({ activityTypes = [] }) {
  const tags = ["Print and go"];

  if (activityTypes.length >= 1) tags.push("Independent practice");
  if (activityTypes.length >= 2) tags.push("Review");
  if (activityTypes.length >= 4) tags.push("Small group");

  return [...new Set(tags)];
}

function buildWorksheetOverview({
  curriculum = {},
  expectation = {},
  worksheet = {},
  skill = null
}) {
  const activityTypes =
    worksheet.activityTypes ||
    skill?.activities ||
    [];

  return {
    curriculum: {
      gradeLabel:
        curriculum.gradeLabel ||
        expectation.gradeLabel ||
        `Grade ${curriculum.grade || expectation.grade || ""}`.trim(),
      subjectLabel:
        curriculum.subjectLabel ||
        expectation.subjectLabel ||
        "Math",
      strandLabel:
        curriculum.strandLabel ||
        expectation.strandName ||
        expectation.strand ||
        "",
      expectationCode:
        worksheet.expectationCode ||
        expectation.code ||
        "",
      expectationKey:
        worksheet.expectationKey ||
        expectation.expectationKey ||
        "",
      expectationTitle:
        expectation.title ||
        expectation.description ||
        worksheet.expectationTitle ||
        ""
    },
    focusSkill: {
      title: skill?.title || titleCase(worksheet.skillKey || ""),
      summary: buildFocusSummary({
        skill,
        expectationTitle:
          expectation.title ||
          expectation.description ||
          worksheet.expectationTitle ||
          "",
        activityTypes
      })
    },
    activityTypes,
    classroomUse: buildClassroomUseTags({ activityTypes })
  };
}

module.exports = {
  buildWorksheetOverview
};