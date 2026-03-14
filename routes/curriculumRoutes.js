const express = require("express");
const router = express.Router();

const curriculumService = require("../services/curriculumService");

function str(v) {
  return (v ?? "").toString();
}
/* =========================
   CURRICULUM API
   ========================= */
router.get("/api/curriculum/jurisdictions", (req, res) => {
  try {
    const raw = curriculumService.getCurriculumRaw();
    const jurisdiction = raw?.jurisdiction || { id: "ON", name: "Ontario" };
    return res.json({
      ok: true,
      jurisdictions: [{ id: jurisdiction.id, name: jurisdiction.name }],
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || "Failed to list jurisdictions" });
  }
});

router.get("/api/curriculum/grades", (req, res) => {
  try {
    const raw = curriculumService.getCurriculumRaw();
    const grades = Array.isArray(raw?.grades) ? raw.grades : [];

    return res.json({
      ok: true,
      grades: grades.map((g) => ({
        id: String(g.grade),
        name: g.gradeLabel || `Grade ${g.grade}`,
      })),
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || "Failed to list grades" });
  }
});

router.get("/api/curriculum/subjects", (req, res) => {
  try {
    const raw = curriculumService.getCurriculumRaw();
    const subject = raw?.subject || { id: "MATH", name: "Math" };

    return res.json({
      ok: true,
      subjects: [{ id: subject.id, name: subject.name }],
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || "Failed to list subjects" });
  }
});

router.get("/api/curriculum/strands", (req, res) => {
  try {
    const jurisdictionId = str(req.query.jurisdiction || "ON");
    const grade = str(req.query.grade || "3");
    const subjectId = str(req.query.subject || "MATH");
    const strands = curriculumService.getStrandsByGrade(grade);
    return res.json({ ok: true, strands });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || "Failed to list strands" });
  }
});

router.get("/api/curriculum/topics", (req, res) => {
  try {
    const jurisdictionId = str(req.query.jurisdiction || "ON");
    const grade = str(req.query.grade || "3");
    const subjectId = str(req.query.subject || "MATH");
    const strandId = str(req.query.strandId || "");
   const topics = curriculumService.getTopicsByGradeAndStrand(grade, strandId);
    return res.json({ ok: true, topics });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || "Failed to list topics" });
  }
});

router.get("/api/curriculum/expectations", (req, res) => {
  try {
    const jurisdictionId = str(req.query.jurisdiction || "ON");
    const grade = str(req.query.grade || "3");
    const subjectId = str(req.query.subject || "MATH");
    const strandId = str(req.query.strandId || "");
    const topicId = str(req.query.topicId || "");
    const expectations = curriculumService.getExpectationsByGradeStrandAndTopic(grade, strandId, topicId);
    return res.json({ ok: true, expectations });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || "Failed to list expectations" });
  }
});

router.get("/api/curriculum/expectation", (req, res) => {
  try {
    const id = str(req.query.id || "");
    const jurisdiction = str(req.query.jurisdiction || "ON");
    const grade = str(req.query.grade || "");
    const subject = str(req.query.subject || "MATH");
    const strandId = str(req.query.strandId || "");
    const topicId = str(req.query.topicId || "");

    if (!id) {
      return res.status(400).json({ ok: false, error: "id is required" });
    }

    let obj = null;

    if (grade && subject && strandId && topicId) {
      obj = curriculumService.getExpectationContext({
        jurisdiction,
        grade,
        subject,
        strandId,
        topicId,
        expectationId: id,
      });
    }

    if (!obj) {
      obj = curriculumService.getExpectationContextById(id);
    }

    if (!obj) {
      return res.status(404).json({ ok: false, error: "Expectation not found" });
    }

    return res.json(obj);
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || "Failed to load expectation" });
  }
});
module.exports = router;