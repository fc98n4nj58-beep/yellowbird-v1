const fs = require("fs");
const path = require("path");

const kindergarten = require("../config/worksheetCatalog/kindergarten");
const grade1 = require("../config/worksheetCatalog/grade1");
const grade2 = require("../config/worksheetCatalog/grade2");
const grade3 = require("../config/worksheetCatalog/grade3");
const grade4 = require("../config/worksheetCatalog/grade4");
const grade5 = require("../config/worksheetCatalog/grade5");
const grade6 = require("../config/worksheetCatalog/grade6");

const generatedPath = path.join(__dirname, "..", "data", "worksheetCatalog.generated.json");
const outputPath = path.join(__dirname, "..", "data", "worksheetCatalog.master.json");

const curated = [
  ...kindergarten,
  ...grade1,
  ...grade2,
  ...grade3,
  ...grade4,
  ...grade5,
  ...grade6
].map((item) => ({
  ...item,
  sourceType: "curated"
}));

function loadGenerated() {
  const raw = JSON.parse(fs.readFileSync(generatedPath, "utf8"));
  return (raw.items || []).map((item) => ({
    ...item,
    sourceType: "generated",
    status: item.status || "generated"
  }));
}

function buildMaster() {
  const generated = loadGenerated();
  const byId = new Map();

  for (const item of generated) {
    byId.set(item.id, item);
  }

  for (const item of curated) {
    byId.set(item.id, item);
  }

  const items = [...byId.values()].sort((a, b) => {
    const gradeA = a.gradeLabels?.[0] || "";
    const gradeB = b.gradeLabels?.[0] || "";
    const gradeCompare = gradeA.localeCompare(gradeB);
    if (gradeCompare !== 0) return gradeCompare;

    const domainCompare = (a.domain || "").localeCompare(b.domain || "");
    if (domainCompare !== 0) return domainCompare;

    return (a.title || "").localeCompare(b.title || "");
  });

  const summary = {
    generatedAt: new Date().toISOString(),
    curatedCount: items.filter((i) => i.sourceType === "curated").length,
    generatedCount: items.filter((i) => i.sourceType === "generated").length,
    totalCount: items.length,
    readyCount: items.filter((i) => i.status === "ready").length,
    partialCount: items.filter((i) => i.status === "partial").length,
    plannedCount: items.filter((i) => i.status === "planned").length,
    generatedStatusCount: items.filter((i) => i.status === "generated").length
  };

  return { summary, items };
}

function main() {
  const master = buildMaster();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(master, null, 2), "utf8");

  console.log(`Master worksheet catalog written to: ${outputPath}`);
  console.log(master.summary);
}

main();