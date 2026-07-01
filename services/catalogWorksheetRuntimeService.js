const worksheetCatalogService = require("./worksheetCatalogService");
const { normalizeWorksheetContent } = require("../engine/worksheetBuilder/normalizeWorksheetContent");

function buildCatalogWorksheetRuntime(id, query = {}) {
  const item = worksheetCatalogService.getWorksheetCatalogById(id);

  if (!item) {
    const err = new Error("Worksheet catalog item not found.");
    err.status = 404;
    throw err;
  }

  const worksheet = worksheetCatalogService.generateWorksheetFromCatalogId(id, query);
  const layout = worksheetCatalogService.buildLayoutFromWorksheet(item, worksheet);

  const contentObject = {
    meta: {
      title: item.title,
      subheading: item.shortTitle || "",
      curriculum: {
        footerText: [
          item.gradeLabels?.[0] || "",
          item.subject || "Math",
          item.domain || "",
          item.skillKey || ""
        ].filter(Boolean).join(" • ")
      }
    },
    content: {
      items: (layout.problems || []).map((p, i) => ({
        id: p.id ?? i + 1,
        type: p.type || "equation",
        prompt: p.prompt || "",
        answer: p.answer,
        visual: p.visual || null
      }))
    }
  };

  const normalizedContentObject = normalizeWorksheetContent(contentObject);

  return {
    item,
    worksheet,
    layout,
    contentObject,
    normalizedContentObject
  };
}

module.exports = {
  buildCatalogWorksheetRuntime
};
