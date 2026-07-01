const fs = require("fs");
const path = require("path");
const { generateWorksheetFromCatalogId } = require("../services/worksheetCatalogService");

const masterFile = path.join(__dirname, "../data/worksheetCatalog.master.json");

function bump(map, key) {
  map[key] = (map[key] || 0) + 1;
}

function extractQuotedValue(msg) {
  const match = msg.match(/'([^']+)'/);
  return match ? match[1] : msg;
}

function createStatusResult() {
  return {
    total: 0,
    success: [],
    missingSkill: [],
    generatorFailure: [],
    otherFailure: []
  };
}

function getStatusResult(resultsByStatus, status) {
  if (!resultsByStatus[status]) {
    resultsByStatus[status] = createStatusResult();
  }

  return resultsByStatus[status];
}

function countFailures(statusResult) {
  return (
    statusResult.missingSkill.length +
    statusResult.generatorFailure.length +
    statusResult.otherFailure.length
  );
}

function printStatusResult(label, statusResult) {
  const working = statusResult.success.length;
  const failures = countFailures(statusResult);

  console.log(`\n--- ${label} ---`);
  console.log(`Working worksheets: ${working} / ${statusResult.total}`);
  console.log("Missing skill definitions:", statusResult.missingSkill.length);
  console.log("Generator failures:", statusResult.generatorFailure.length);
  console.log("Other failures:", statusResult.otherFailure.length);

  if (failures > 0) {
    console.log("Failures:");
    console.log([
      ...statusResult.missingSkill,
      ...statusResult.generatorFailure,
      ...statusResult.otherFailure
    ]);
  }
}

async function audit() {
  const raw = fs.readFileSync(masterFile, "utf8");
  const data = JSON.parse(raw);
  const items = data.items || [];

  console.log(`\nAuditing ${items.length} worksheet catalog entries...\n`);

  const results = {
    success: [],
    missingSkill: [],
    missingSkillCounts: {},
    generatorFailure: [],
    missingRecipeCounts: {},
    missingGeneratorCounts: {},
    otherFailure: [],
    otherFailureCounts: {},
    byStatus: {}
  };

  for (const item of items) {
    const id = item.id;
    const status = item.status || "unknown";
    const statusResult = getStatusResult(results.byStatus, status);
    statusResult.total += 1;

    try {
      await generateWorksheetFromCatalogId(id);
      results.success.push(id);
      statusResult.success.push(id);
      process.stdout.write(".");
    } catch (err) {
      const msg = String(err.message || err);
      const failure = { id, status, msg };

      if (msg.includes("No skill definition found for")) {
        const key = extractQuotedValue(msg);
        results.missingSkill.push(failure);
        statusResult.missingSkill.push(failure);
        bump(results.missingSkillCounts, key);
      } else if (msg.includes("No activity recipe found for skill")) {
        const key = extractQuotedValue(msg);
        results.generatorFailure.push(failure);
        statusResult.generatorFailure.push(failure);
        bump(results.missingRecipeCounts, key);
      } else if (msg.includes("No problem generator found for activity")) {
        const key = extractQuotedValue(msg);
        results.generatorFailure.push(failure);
        statusResult.generatorFailure.push(failure);
        bump(results.missingGeneratorCounts, key);
      } else {
        results.otherFailure.push(failure);
        statusResult.otherFailure.push(failure);
        bump(results.otherFailureCounts, msg);
      }

      process.stdout.write("X");
    }
  }

  console.log("\n\nAUDIT COMPLETE\n");
  console.log("Working worksheets:", results.success.length);
  console.log("Missing skill definitions:", results.missingSkill.length);
  console.log("Generator failures:", results.generatorFailure.length);
  console.log("Other failures:", results.otherFailure.length);

  console.log("\n--- Missing Skill Keys ---");
  console.log(results.missingSkillCounts);

  console.log("\n--- Missing Recipe Skills ---");
  console.log(results.missingRecipeCounts);

  console.log("\n--- Missing Problem Generators ---");
  console.log(results.missingGeneratorCounts);

  console.log("\n--- Sample Missing Skills ---");
  console.log(results.missingSkill.slice(0, 10));

  console.log("\n--- Sample Generator Failures ---");
  console.log(results.generatorFailure.slice(0, 10));

  console.log("\n--- Sample Other Failures ---");
  console.log(results.otherFailure.slice(0, 10));

  console.log("\n--- Results By Catalog Status ---");
  for (const status of Object.keys(results.byStatus).sort()) {
    const statusResult = results.byStatus[status];
    console.log(
      `${status}: ${statusResult.success.length} / ${statusResult.total} working, ${countFailures(statusResult)} failures`
    );
  }

  if (results.byStatus.ready) {
    printStatusResult("Ready / Launch-Facing Result", results.byStatus.ready);
  }

  const plannedDeferred = createStatusResult();
  for (const status of ["planned", "deferred"]) {
    const statusResult = results.byStatus[status];
    if (!statusResult) continue;

    plannedDeferred.total += statusResult.total;
    plannedDeferred.success.push(...statusResult.success);
    plannedDeferred.missingSkill.push(...statusResult.missingSkill);
    plannedDeferred.generatorFailure.push(...statusResult.generatorFailure);
    plannedDeferred.otherFailure.push(...statusResult.otherFailure);
  }

  if (plannedDeferred.total > 0) {
    printStatusResult("Planned / Deferred Result", plannedDeferred);
  }

  console.log("\n--- Failures Grouped By Catalog Status ---");
  for (const status of Object.keys(results.byStatus).sort()) {
    const statusResult = results.byStatus[status];
    const failures = [
      ...statusResult.missingSkill,
      ...statusResult.generatorFailure,
      ...statusResult.otherFailure
    ];

    if (failures.length > 0) {
      console.log(`\n${status}:`);
      console.log(failures);
    }
  }
}

audit();
