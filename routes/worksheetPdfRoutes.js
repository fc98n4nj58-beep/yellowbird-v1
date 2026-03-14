const express = require("express");
const router = express.Router();

const { createContent } = require("../engine/contentFactory");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");
const { toInt, str, sanitizeFilenamePart, prettyTopicForFilename } = require("../utils/helpers");

const { normalizeWorksheetLayout } = require("../engine/layout/normalizeWorksheetLayout");

/* =========================
   WORKSHEET PDF API
   ========================= */
   /*
ROLE:
Main worksheet PDF generation endpoint.

USES:
- createContent()
- renderWorksheetPDF()

SUPPORTS:
- single mode
- mixed mode
- curriculum metadata footer
- curriculum-based filenames

DO NOT REWRITE LIGHTLY:
This route contains working generation behavior used by the worksheet page.
*/
router.get("/api/worksheet.pdf", (req, res) => {
  try {
    const modeId = str(req.query.mode || "math.addition.basic");
    const includeAnswerKey = str(req.query.answers ?? "1") !== "0";

    const options = {
      includeAnswerKey,
      fontSize: parseInt(req.query.font || "11", 10),
      cols: parseInt(req.query.cols || "2", 10),

      // curriculum-only knobs
      source: str(req.query.source || ""),
      filename: "",
    };

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

      // Worksheet subheading (manual generator)
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

    // Curriculum metadata (ONLY when source=curriculum)
    if (str(req.query.source) === "curriculum") {
      const jurisdictionId = str(req.query.jurisdictionId || "ON");
      const grade = str(req.query.grade || "");
      const subjectName = str(req.query.subjectName || "Math");
      const strandName = str(req.query.strandName || "");
      const topicName = str(req.query.topicName || "");
      const expectationCode = str(req.query.expectationCode || "");
      const expectationId = str(req.query.expectationId || "");

      const footer = [
        jurisdictionId === "ON" ? "Ontario" : jurisdictionId,
        grade ? `Grade ${grade} ${subjectName}` : subjectName,
        strandName ? strandName : "",
        topicName ? topicName : "",
        expectationCode ? expectationCode : "",
      ].filter(Boolean).join(" • ");

      contentObject.meta = contentObject.meta || {};
      contentObject.meta.curriculum = {
        source: "curriculum",
        jurisdictionId,
        grade,
        subjectName,
        strandName,
        topicName,
        expectationCode,
        expectationId,
        footerText: footer,
      };

      // Filename rule
      const fn = [
        sanitizeFilenamePart(jurisdictionId),
        grade ? `G${sanitizeFilenamePart(grade)}` : "",
        sanitizeFilenamePart(subjectName),
        sanitizeFilenamePart(strandName),
        prettyTopicForFilename(topicName),
        sanitizeFilenamePart(expectationCode),
        "Worksheet",
      ].filter(Boolean).join("_") + ".pdf";

      options.filename = fn;
    }
const items = Array.isArray(contentObject?.content?.items)
  ? contentObject.content.items
  : [];

const problems = items
  .filter((item) => item.type !== "section")
  .map((item) => ({
    prompt: item.prompt || item.question || item.text || "",
    answer: item.answer || "",
    visual: item.visual || ""
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

    renderWorksheetPDF({ res, contentObject, options, layoutObject: normalizedLayout });
  } catch (err) {
    res.status(err.status || 500).send(err.message || "Server error");
  }
});
module.exports = router;