const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");

const express = require("express");
const router = express.Router();

const { buildWorksheetRuntime } = require("../services/worksheetRuntimeService");
const {
  getCustomizationFamilyForResource
} = require("../config/worksheetCustomization");
const {
  normalizeWorksheetCustomization
} = require("../services/worksheetCustomizationService");

const NON_CUSTOMIZATION_QUERY_KEYS = new Set([
  "disposition",
  "filename",
  "source",
  "font",
  "cols"
]);

function filterCustomizationInput(query = {}) {
  return Object.keys(query).reduce((acc, key) => {
    if (!NON_CUSTOMIZATION_QUERY_KEYS.has(key)) {
      acc[key] = query[key];
    }
    return acc;
  }, {});
}

function publicCustomizationPayload(resourceId, query = {}) {
  if (!getCustomizationFamilyForResource(resourceId)) return null;

  const result = normalizeWorksheetCustomization(
    resourceId,
    filterCustomizationInput(query)
  );

  return {
    ok: result.ok,
    normalizedOptions: result.normalizedOptions,
    canonicalPayload: result.canonicalPayload,
    optionHash: result.optionHash,
    warnings: result.warnings,
    notices: result.notices,
    errors: result.errors.map((error) => ({
      field: error.field,
      code: error.code,
      message: error.message
    }))
  };
}

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
      buildCatalogWorksheetRuntime(req.params.id, req.query || {}, { publicCustomization: true });
    const customization = publicCustomizationPayload(req.params.id, req.query || {});

    res.json({
      ok: true,
      preview: {
        type: "catalog-layout-preview",
        id: req.params.id,
        item,
        worksheet,
        contentObject,
        layout
      },
      customization
    });
  } catch (error) {
    const customization = error.details
      ? {
          ok: false,
          errors: (error.details.errors || []).map((entry) => ({
            field: entry.field,
            code: entry.code,
            message: entry.message
          })),
          warnings: error.details.warnings || [],
          notices: error.details.notices || []
        }
      : null;

    res.status(error.status || 500).json({
      ok: false,
      error: error.status === 400
        ? "Some customization settings need attention."
        : "Failed to generate catalog preview.",
      customization
    });
  }
});

module.exports = router;
