const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");

const express = require("express");
const router = express.Router();

const { buildWorksheetRuntime } = require("../services/worksheetRuntimeService");

router.get("/api/worksheet-preview", (req, res) => {
  try {
    const { modeId, contentObject, problems, layout } = buildWorksheetRuntime(req.query);

    res.json({
      ok: true,
      worksheet: {
        title: contentObject?.meta?.title || "Math Practice",
        expectationCode: "",
        expectationKey: "",
        skillKey: modeId,
        skill: {
          title: contentObject?.meta?.title || "Math Practice",
        },
        problems,
      },
      overview: {
        curriculum: {
          expectationTitle: contentObject?.meta?.title || "Math Practice",
          gradeLabel: "",
          subjectLabel: "Math",
          strandLabel: "",
          expectationCode: "",
        },
        focusSkill: {
          title: contentObject?.meta?.title || "Math Practice",
          summary: contentObject?.meta?.subheading || "",
        },
        activityTypes: [],
        classroomUse: [],
      },
      layout,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      ok: false,
      error: error.message || "Failed to generate worksheet preview.",
    });
  }
});

router.get("/api/catalog-preview/:id", (req, res) => {
  try {
    const { item, worksheet, layout, contentObject } =
      buildCatalogWorksheetRuntime(req.params.id, req.query || {});

    res.json({
      ok: true,
      preview: {
        type: "catalog-layout-preview",
        id: req.params.id,
        item,
        worksheet,
        contentObject,
        layout
      }
    });
  } catch (error) {
    res.status(error.status || 500).json({
      ok: false,
      error: error.message || "Failed to generate catalog preview."
    });
  }
});

module.exports = router;
