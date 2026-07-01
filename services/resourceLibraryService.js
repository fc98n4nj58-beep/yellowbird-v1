const fs = require("fs");
const path = require("path");

const resourcesPath = path.join(__dirname, "../data/resources/resources.json");

function readResources() {
  const raw = fs.readFileSync(resourcesPath, "utf8");
  const data = JSON.parse(raw);
  return Array.isArray(data) ? data : [];
}

function norm(value) {
  return String(value || "").trim().toLowerCase();
}

function matchesText(resource, query) {
  if (!query) return true;

  const haystack = [
    resource.title,
    resource.description,
    resource.longDescription,
    resource.gradeLabel,
    resource.subject,
    resource.strand,
    resource.topic,
    resource.skill,
    resource.resourceType,
    resource.expectationCode,
    ...(Array.isArray(resource.keywords) ? resource.keywords : [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(norm(query));
}

function matchesExact(resourceValue, filterValue) {
  if (!filterValue) return true;
  return norm(resourceValue) === norm(filterValue);
}

function matchesArray(resourceValues, filterValue) {
  if (!filterValue) return true;
  const list = Array.isArray(resourceValues) ? resourceValues : [];
  return list.some((item) => norm(item) === norm(filterValue));
}

function matchesBoolean(resourceValue, filterValue) {
  if (filterValue === undefined || filterValue === null || filterValue === "") {
    return true;
  }
  const wanted = String(filterValue).toLowerCase() === "true";
  return Boolean(resourceValue) === wanted;
}

function sortResources(items, sort = "newest") {
  const copy = [...items];

  switch (norm(sort)) {
    case "title":
      return copy.sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));

    case "downloads":
    case "most-downloaded":
      return copy.sort((a, b) => Number(b.downloads || 0) - Number(a.downloads || 0));

    case "free":
      return copy.sort((a, b) => Number(Boolean(b.isFree)) - Number(Boolean(a.isFree)));

    case "quick-prep":
      return copy.sort((a, b) => {
        const aScore = norm(a.prepTime) === "quick prep" ? 1 : 0;
        const bScore = norm(b.prepTime) === "quick prep" ? 1 : 0;
        return bScore - aScore;
      });

    case "rating":
      return copy.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));

    case "newest":
    default:
      return copy.sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });
  }
}

function getAllResources() {
  return readResources();
}

function getResourceBySlug(slug) {
  return readResources().find((item) => item.slug === slug) || null;
}

function listResources(filters = {}) {
  const {
    q,
    grade,
    subject,
    strand,
    topic,
    skill,
    resourceType,
    format,
    isFree,
    hasAnswerKey,
    sort = "newest"
  } = filters;

  const filtered = readResources().filter((resource) => {
    return (
      matchesText(resource, q) &&
      matchesExact(resource.grade, grade) &&
      matchesExact(resource.subject, subject) &&
      matchesExact(resource.strand, strand) &&
      matchesExact(resource.topic, topic) &&
      matchesExact(resource.skill, skill) &&
      matchesExact(resource.resourceType, resourceType) &&
      matchesArray(resource.fileTypes, format) &&
      matchesBoolean(resource.isFree, isFree) &&
      matchesBoolean(resource.hasAnswerKey, hasAnswerKey)
    );
  });

  return sortResources(filtered, sort);
}

function getRelatedResources(resource, limit = 4) {
  if (!resource) return [];

  return readResources()
    .filter((item) => item.slug !== resource.slug)
    .filter((item) => {
      return (
        norm(item.grade) === norm(resource.grade) ||
        norm(item.topic) === norm(resource.topic) ||
        norm(item.skill) === norm(resource.skill) ||
        norm(item.strand) === norm(resource.strand)
      );
    })
    .slice(0, limit);
}

function getAvailableFilters() {
  const resources = readResources();

  const uniq = (values) =>
    [...new Set(values.filter(Boolean).map((v) => String(v).trim()))].sort((a, b) =>
      a.localeCompare(b)
    );

  return {
    grades: uniq(resources.map((r) => r.grade)),
    subjects: uniq(resources.map((r) => r.subject)),
    strands: uniq(resources.map((r) => r.strand)),
    topics: uniq(resources.map((r) => r.topic)),
    skills: uniq(resources.map((r) => r.skill)),
    resourceTypes: uniq(resources.map((r) => r.resourceType)),
    fileTypes: uniq(resources.flatMap((r) => (Array.isArray(r.fileTypes) ? r.fileTypes : [])))
  };
}

module.exports = {
  getAllResources,
  getResourceBySlug,
  listResources,
  getRelatedResources,
  getAvailableFilters
};