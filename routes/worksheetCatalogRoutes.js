const express = require("express");
const router = express.Router();

const worksheetCatalogService = require("../services/worksheetCatalogService");
const {
  getWorksheetCatalogById,
  filterWorksheetCatalog,
  getWorksheetCatalogFilters
} = worksheetCatalogService;

router.get("/api/worksheet-catalog", (req, res) => {
  try {
    const {
      grade = "",
      domain = "",
      status = "",
      worksheetFamily = "",
      templateId = "",
      subject = "",
      q = ""
    } = req.query;

    const items = filterWorksheetCatalog({
      grade,
      domain,
      status,
      worksheetFamily,
      templateId,
      subject,
      query: q
    });

    res.json({
      ok: true,
      total: items.length,
      items
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message || "Failed to load worksheet catalog."
    });
  }
});

router.get("/api/worksheet-catalog/filters", (req, res) => {
  try {
    const filters = getWorksheetCatalogFilters();

    res.json({
      ok: true,
      filters
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message || "Failed to load worksheet catalog filters."
    });
  }
});

router.get("/api/worksheet-catalog/:id/generate", (req, res) => {
  try {
    const worksheet = worksheetCatalogService.generateWorksheetFromCatalogId(
      req.params.id,
      req.query || {}
    );

    res.json({
      ok: true,
      worksheet
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message || "Failed to generate worksheet from catalog item."
    });
  }
});

router.get("/api/worksheet-catalog/:id/layout", (req, res) => {
  try {
    const layout = worksheetCatalogService.generateWorksheetLayoutFromCatalogId(
      req.params.id,
      req.query || {}
    );

    res.json({
      ok: true,
      layout
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message || "Failed to generate worksheet layout from catalog item."
    });
  }
});

router.get("/api/worksheet-catalog/:id", (req, res) => {
  try {
    const item = getWorksheetCatalogById(req.params.id);

    if (!item) {
      return res.status(404).json({
        ok: false,
        error: "Worksheet catalog item not found."
      });
    }

    return res.json({
      ok: true,
      item
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || "Failed to load worksheet catalog item."
    });
  }
});

module.exports = router;