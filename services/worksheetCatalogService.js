// services/worksheetCatalogService.js //

const fs = require("fs");
const path = require("path");

const { buildWorksheet } = require("../engine/worksheetBuilder/buildWorksheet");
const { getSkillDefinition } = require("../engine/skills");
const { normalizeWorksheetLayout } = require("../engine/layout/normalizeWorksheetLayout");

const MASTER_CATALOG_PATH = path.join(__dirname, "../data/worksheetCatalog.master.json");

function loadMasterCatalog() {
  const raw = fs.readFileSync(MASTER_CATALOG_PATH, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed.items) ? parsed.items : [];
}

function getMasterWorksheetCatalog() {
  return loadMasterCatalog();
}

function listWorksheetCatalog() {
  return getMasterWorksheetCatalog();
}

function getWorksheetCatalogById(id) {
  return getMasterWorksheetCatalog().find((item) => item.id === id) || null;
}

function getAnyWorksheetCatalogById(id) {
  return getWorksheetCatalogById(id);
}

function listWorksheetCatalogByGrade(grade) {
  return getMasterWorksheetCatalog().filter(
    (item) => Array.isArray(item.grades) && item.grades.includes(grade)
  );
}

function listWorksheetCatalogByDomain(domain) {
  return getMasterWorksheetCatalog().filter((item) => item.domain === domain);
}

function listWorksheetCatalogByStatus(status) {
  return getMasterWorksheetCatalog().filter((item) => item.status === status);
}

function searchWorksheetCatalog(query = "") {
  const q = String(query).trim().toLowerCase();
  const items = getMasterWorksheetCatalog();

  if (!q) return items;

  return items.filter((item) => {
    const haystack = [
      item.id,
      item.title,
      item.shortTitle,
      item.subject,
      item.domain,
      item.skillKey,
      item.worksheetFamily,
      item.templateId,
      ...(item.grades || []),
      ...(item.gradeLabels || []),
      ...(item.activityTypes || []),
      ...(item.tags || []),
      ...(item.curriculumTags || []),
      item.description
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}

function filterWorksheetCatalog({
  grade,
  domain,
  status,
  worksheetFamily,
  templateId,
  subject,
  query
} = {}) {
  let items = [...getMasterWorksheetCatalog()];

  if (grade) {
    items = items.filter((item) => Array.isArray(item.grades) && item.grades.includes(grade));
  }

  if (domain) {
    items = items.filter((item) => item.domain === domain);
  }

  if (status) {
    items = items.filter((item) => item.status === status);
  }

  if (worksheetFamily) {
    items = items.filter((item) => item.worksheetFamily === worksheetFamily);
  }

  if (templateId) {
    items = items.filter((item) => item.templateId === templateId);
  }

  if (subject) {
    items = items.filter((item) => item.subject === subject);
  }

  if (query) {
    const q = String(query).trim().toLowerCase();

    items = items.filter((item) => {
      const haystack = [
        item.id,
        item.title,
        item.shortTitle,
        item.subject,
        item.domain,
        item.skillKey,
        item.worksheetFamily,
        item.templateId,
        ...(item.grades || []),
        ...(item.gradeLabels || []),
        ...(item.activityTypes || []),
        ...(item.tags || []),
        ...(item.curriculumTags || []),
        item.description
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }

  return items;
}

function getWorksheetCatalogFilters() {
  const items = getMasterWorksheetCatalog();

  const grades = [...new Set(items.flatMap((item) => item.grades || []))].sort();
  const gradeLabels = [...new Set(items.flatMap((item) => item.gradeLabels || []))].sort();
  const domains = [...new Set(items.map((item) => item.domain).filter(Boolean))].sort();
  const statuses = [...new Set(items.map((item) => item.status).filter(Boolean))].sort();
  const worksheetFamilies = [...new Set(items.map((item) => item.worksheetFamily).filter(Boolean))].sort();
  const templateIds = [...new Set(items.map((item) => item.templateId).filter(Boolean))].sort();
  const subjects = [...new Set(items.map((item) => item.subject).filter(Boolean))].sort();

  return {
    grades,
    gradeLabels,
    domains,
    statuses,
    worksheetFamilies,
    templateIds,
    subjects
  };
}

function generateWorksheetFromCatalogId(id, options = {}) {
  const item = getAnyWorksheetCatalogById(id);

  if (!item) {
    throw new Error(`Worksheet catalog item not found: ${id}`);
  }

  if (!item.skillKey) {
    throw new Error(`Worksheet catalog item '${id}' is missing a skillKey.`);
  }

  const skill = getSkillDefinition(item.skillKey);

  if (!skill) {
    throw new Error(`No skill definition found for '${item.skillKey}'.`);
  }

  const grade = Array.isArray(item.grades) && item.grades.length ? item.grades[0] : null;

  if (!grade) {
    throw new Error(`Worksheet catalog item '${id}' is missing a grade.`);
  }

  return buildWorksheet(
    grade,
    "CATALOG",
    {
      skillKey: item.skillKey,
      skill
    },
    {
      ...(item.generatorOptions || {}),
      ...options,
      preferredActivityType: item.activityTypes?.[0] || options.preferredActivityType || null,
      activityType: item.activityTypes?.[0] || options.activityType || null,
      worksheetId: item.id,
      worksheetTitle: item.title
    }
  );
}

function buildLayoutFromWorksheet(item, worksheet) {
 const layout = normalizeWorksheetLayout({
  title: item.title,
  subtitle: item.shortTitle || "",
  meta: {
    grade: item.grades?.[0] || "",
    gradeLabel: item.gradeLabels?.[0] || "",
    subject: item.subject || "Math",
    subjectLabel: item.subject || "Math",
    strand: item.domain || "",
    strandLabel: item.domain || "",
    skillLabel: worksheet.skill?.title || item.skillKey || ""
  },
  instruction: item.description || "",
  modeId: item.activityTypes?.[0] || "",
  skillKey: item.skillKey || "",
  problems: worksheet.problems || [],
  sections: []
});

return layout;
}

function generateWorksheetLayoutFromCatalogId(id, options = {}) {
  const item = getAnyWorksheetCatalogById(id);

  if (!item) {
    throw new Error(`Worksheet catalog item not found: ${id}`);
  }

  const worksheet = generateWorksheetFromCatalogId(id, options);

  console.log("WORKSHEET FIRST PROBLEM:", worksheet.problems?.[0]);

return buildLayoutFromWorksheet(item, worksheet);
}

module.exports = {
  worksheetCatalog: getMasterWorksheetCatalog(),
  getMasterWorksheetCatalog,
  getAnyWorksheetCatalogById,
  listWorksheetCatalog,
  getWorksheetCatalogById,
  listWorksheetCatalogByGrade,
  listWorksheetCatalogByDomain,
  listWorksheetCatalogByStatus,
  searchWorksheetCatalog,
  filterWorksheetCatalog,
  getWorksheetCatalogFilters,
  generateWorksheetFromCatalogId,
  buildLayoutFromWorksheet,
  generateWorksheetLayoutFromCatalogId
};
