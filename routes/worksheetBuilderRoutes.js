const express = require("express");
const router = express.Router();

const { buildWorksheetOverview } = require("../services/worksheetOverviewService");
const { getSkillContextForExpectation } = require("../services/skillMappingService");
const { buildWorksheet } = require("../engine/worksheetBuilder/buildWorksheet");

/* =========================
   EXPERIMENTAL WORKSHEET BUILDER API
   ========================= */
router.get("/api/generateWorksheet", (req, res) => {
  try {
    const expectation = String(req.query.expectation || "").trim();
    const grade = String(req.query.grade || "").trim();

    if (!expectation) {
      return res.status(400).json({
        error: "Missing required query parameter: expectation"
      });
    }

    if (!grade) {
      return res.status(400).json({
        error: "Missing required query parameter: grade"
      });
    }

    const skillContext = getSkillContextForExpectation(expectation, grade);
    console.log("skillContext:", skillContext);

   const worksheetOptions = {
  minA: Number(req.query.aMin ?? req.query.minA ?? 0),
  maxA: Number(req.query.aMax ?? req.query.maxA ?? 10),
  minB: Number(req.query.bMin ?? req.query.minB ?? 0),
  maxB: Number(req.query.bMax ?? req.query.maxB ?? 10),
  questionCount: Number(req.query.count ?? req.query.questionCount ?? 12),
  onlyNumbers: String(req.query.onlyNumbers || "").trim(),
  excludeNumbers: String(req.query.excludeNumbers || "").trim(),
  includeAnswerKey: String(req.query.includeAnswerKey || "true") === "true",
  nonNegative: String(req.query.nonNegative || "true") === "true",
  integerOnly: String(req.query.integerOnly || "true") === "true"
};

const worksheet = buildWorksheet(grade, expectation, skillContext, worksheetOptions);

    const overview = buildWorksheetOverview({
      curriculum: {
        grade: req.query.grade,
        gradeLabel: null,
        subjectLabel: "Math",
        strandLabel: null
      },
      expectation,
      worksheet,
      skill: skillContext?.skill || null
    });

    res.json({
      ok: true,
      worksheet,
      overview
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

module.exports = router;