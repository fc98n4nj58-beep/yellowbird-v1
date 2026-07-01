const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const express = require("express");
const router = express.Router();

const { renderWorksheetPDF } = require("../renderers/pdfRenderer");
const { str, sanitizeFilenamePart, prettyTopicForFilename } = require("../utils/helpers");
const { buildWorksheetRuntime } = require("../services/worksheetRuntimeService");

const { normalizeWorksheetContent } = require("../engine/worksheetBuilder/normalizeWorksheetContent");

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
    const { contentObject, layout } = buildWorksheetRuntime(req.query);

    const includeAnswerKey = str(req.query.answers ?? "1") !== "0";

   const options = {
  includeAnswerKey,
  fontSize: parseInt(req.query.font || "11", 10),
  cols: parseInt(req.query.cols || "2", 10),
  source: str(req.query.source || ""),
  filename: "",
  disposition: str(req.query.disposition || "attachment"),
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

    const normalizedContentObject = normalizeWorksheetContent(contentObject);

    renderWorksheetPDF({
      res,
      contentObject: normalizedContentObject,
      options,
      layoutObject: layout,
    });
  } catch (err) {
    res.status(err.status || 500).send(err.message || "Server error");
  }
});

router.get("/api/catalog-pdf/:id", (req, res) => {
  try {
    const {
      item,
      layout,
      normalizedContentObject
    } = buildCatalogWorksheetRuntime(
      req.params.id,
      req.query || {}
    );

    renderWorksheetPDF({
      res,
      contentObject: normalizedContentObject,
      options: {
        includeAnswerKey: String(req.query.answers ?? "1") !== "0",
        fontSize: parseInt(req.query.font || "11", 10),
        cols: parseInt(
          req.query.cols ||
          String(layout.template?.columns || 2),
          10
        ),
        source: "catalog",
        filename: `${item.id}.pdf`,
        disposition: String(
          req.query.disposition || "attachment"
        )
      },
      layoutObject: layout
    });

  } catch (error) {
    res.status(error.status || 500).json({
      ok: false,
      error: error.message || "Failed to generate catalog PDF."
    });
  }
});

module.exports = router;
