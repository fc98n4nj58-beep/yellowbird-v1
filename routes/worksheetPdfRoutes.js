const express = require("express");
const router = express.Router();

const { renderWorksheetPDF } = require("../renderers/pdfRenderer");
const { str, sanitizeFilenamePart, prettyTopicForFilename } = require("../utils/helpers");
const { buildWorksheetRuntime } = require("../services/worksheetRuntimeService");

/* =========================
   WORKSHEET PDF API
   ========================= */
/*
ROLE:
Main worksheet PDF generation endpoint.

USES:
- buildWorksheetRuntime()
- renderWorksheetPDF()

SUPPORTS:
- single mode
- mixed mode
- curriculum metadata footer
- curriculum-based filenames
*/
router.get("/api/worksheet.pdf", (req, res) => {
  try {
    const { modeId, contentObject, layout } = buildWorksheetRuntime(req.query);

    const includeAnswerKey = str(req.query.answers ?? "1") !== "0";

    const options = {
      includeAnswerKey,
      fontSize: parseInt(req.query.font || "11", 10),
      cols: parseInt(req.query.cols || "2", 10),
      source: str(req.query.source || ""),
      filename: "",
    };

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
        strandName || "",
        topicName || "",
        expectationCode || "",
      ]
        .filter(Boolean)
        .join(" • ");

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

      const fn =
        [
          sanitizeFilenamePart(jurisdictionId),
          grade ? `G${sanitizeFilenamePart(grade)}` : "",
          sanitizeFilenamePart(subjectName),
          sanitizeFilenamePart(strandName),
          prettyTopicForFilename(topicName),
          sanitizeFilenamePart(expectationCode),
          "Worksheet",
        ]
          .filter(Boolean)
          .join("_") + ".pdf";

      options.filename = fn;
    }

    renderWorksheetPDF({
      res,
      contentObject,
      options,
      layoutObject: layout,
    });
  } catch (err) {
    res.status(err.status || 500).send(err.message || "Server error");
  }
});

module.exports = router;
