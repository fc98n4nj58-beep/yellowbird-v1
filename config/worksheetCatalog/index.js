const kindergarten = require("./kindergarten");
const grade1 = require("./grade1");
const grade2 = require("./grade2");
const grade3 = require("./grade3");
const grade4 = require("./grade4");
const grade5 = require("./grade5");
const grade6 = require("./grade6");

const worksheetCatalog = [
  ...kindergarten,
  ...grade1,
  ...grade2,
  ...grade3,
  ...grade4,
  ...grade5,
  ...grade6
];

function listWorksheetCatalog() {
  return worksheetCatalog;
}

function getWorksheetCatalogById(id) {
  return worksheetCatalog.find((item) => item.id === id) || null;
}

function listWorksheetCatalogByGrade(grade) {
  return worksheetCatalog.filter((item) => item.grades.includes(grade));
}

function listWorksheetCatalogByDomain(domain) {
  return worksheetCatalog.filter((item) => item.domain === domain);
}

function listWorksheetCatalogByStatus(status) {
  return worksheetCatalog.filter((item) => item.status === status);
}

module.exports = {
  worksheetCatalog,
  listWorksheetCatalog,
  getWorksheetCatalogById,
  listWorksheetCatalogByGrade,
  listWorksheetCatalogByDomain,
  listWorksheetCatalogByStatus
};