const express = require("express");
const router = express.Router();

const { createContent } = require("../engine/contentFactory");
const { toInt, str } = require("../utils/helpers");

const { normalizeWorksheetLayout } = require("../engine/layout/normalizeWorksheetLayout");

router.get("/api/worksheet-preview", (req, res) => {
  try {
    const modeId = str(req.query.mode || "math.addition.basic");

    let contentObject;

    if (modeId === "mixed") {
      const plan = [
        { p: "add", label: "Addition", mode: "math.addition.basic", count: Math.max(0, toInt(req.query.addCount, 0)) },
        { p: "sub", label: "Subtraction", mode: "math.subtraction.nonnegative", count: Math.max(0, toInt(req.query.subCount, 0)) },
        { p: "mul", label: "Multiplication", mode: "math.multiplication.basic", count: Math.max(0, toInt(req.query.mulCount, 0)) },
        { p: "div", label: "Division", mode: "math.division.integer", count: Math.max(0, toInt(req.query.divCount, 0)) },
      ].filter((x) => x.count > 0);

      if (!plan.length) {
        const err = new Error("Mixed mode: set at least one per-operation count above 0.");
        err.status = 400;
        throw err;
      }

      const mergedItems = [];
      let id = 1;

      for (const section of plan) {
        mergedItems.push({ type: "section", title: section.label });

        const params = {
          aMin: req.query[`${section.p}AMin`],
          aMax: req.query[`${section.p}AMax`],
          bMin: req.query[`${section.p}BMin`],
          bMax: req.query[`${section.p}BMax`],
          only: req.query[`${section.p}Only`],
          exclude: req.query[`${section.p}Exclude`],
          count: section.count,
          nonneg: req.query.nonneg,
          intdiv: req.query.intdiv,
        };

        const sectionContent = createContent({ modeId: section.mode, params });
        const items = sectionContent?.content?.items || [];

        for (const it of items) {
          mergedItems.push({ ...it, id });
          id++;
        }
      }

      contentObject = {
        meta: {
          modeId: "math.mixed.basic",
          subject: "math",
          title: "Mixed Practice",
        },
        content: { instructions: null, items: mergedItems },
      };
    } else {
      const params = {
        aMin: req.query.aMin,
        aMax: req.query.aMax,
        bMin: req.query.bMin,
        bMax: req.query.bMax,
        only: req.query.only,
        exclude: req.query.exclude,
        count: req.query.count,
        nonneg: req.query.nonneg,
        intdiv: req.query.intdiv,
      };

      contentObject = createContent({ modeId, params });

      const aMin2 = (req.query.aMin ?? "1").toString();
      const aMax2 = (req.query.aMax ?? "20").toString();
      const bMin2 = (req.query.bMin ?? "1").toString();
      const bMax2 = (req.query.bMax ?? "20").toString();
      const onlyTxt = (req.query.only ?? "").toString().trim();
      const exclTxt = (req.query.exclude ?? "").toString().trim();

      const parts = [
        `First Digit: ${aMin2}–${aMax2}`,
        `Second Digit: ${bMin2}–${bMax2}`,
      ];
      if (onlyTxt) parts.push(`Only: ${onlyTxt}`);
      if (exclTxt) parts.push(`Exclude: ${exclTxt}`);

      contentObject.meta = contentObject.meta || {};
      contentObject.meta.subheading = parts.join("  •  ");
    }

    const items = Array.isArray(contentObject?.content?.items)
      ? contentObject.content.items
      : [];

    const problems = items
      .filter((item) => item.type !== "section")
      .map((item) => ({
        prompt: item.prompt || item.question || item.text || "",
        answer: item.answer || "",
        visual: item.visual || "",
      }));

    const normalizedLayout = normalizeWorksheetLayout({
  title: contentObject?.meta?.title || "Math Practice",
  subtitle: "",
  meta: {
    gradeLabel: "",
    subjectLabel: "Math",
    strandLabel: "",
    skillLabel: contentObject?.meta?.title || "Math Practice"
  },
  instruction: "Solve each problem.",
  modeId,
  skillKey: modeId,
  problems
});

res.json({
  ok: true,
  worksheet: {
    title: contentObject?.meta?.title || "Math Practice",
    expectationCode: "",
    expectationKey: "",
    skillKey: modeId,
    skill: {
      title: contentObject?.meta?.title || "Math Practice"
    },
    problems
  },
  overview: {
    curriculum: {
      expectationTitle: contentObject?.meta?.title || "Math Practice",
      gradeLabel: "",
      subjectLabel: "Math",
      strandLabel: "",
      expectationCode: ""
    },
    focusSkill: {
      title: contentObject?.meta?.title || "Math Practice",
      summary: contentObject?.meta?.subheading || ""
    },
    activityTypes: [],
    classroomUse: []
  },
  layout: normalizedLayout
});

  } catch (error) {
    res.status(error.status || 500).json({
      ok: false,
      error: error.message || "Failed to generate worksheet preview.",
    });
  }
});

module.exports = router;