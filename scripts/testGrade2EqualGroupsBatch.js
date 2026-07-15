"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { getMasterWorksheetCatalog } = require("../services/worksheetCatalogService");
const { MULTIPLICATION_SYMBOL } = require("../engine/problemGenerators/multiplicationModelConstants");
const { renderWorksheetPDF, buildAnswerKeyItems, __test: rendererTest } = require("../renderers/pdfRenderer");

const ROOT = path.join(__dirname, "..");
const ID = "grade2_multiplication_facts_equal_groups";
const TITLE = "Multiplication Equal Groups";
const INSTRUCTION = "Write a multiplication sentence for each model.";
const FOOTER = "Grade 2 • Math • Multiplication";

class BufferResponse extends Writable {
  constructor() {
    super();
    this.chunks = [];
  }
  setHeader() {}
  _write(chunk, encoding, callback) {
    this.chunks.push(Buffer.from(chunk));
    callback();
  }
  buffer() {
    return Buffer.concat(this.chunks);
  }
}

function signature(runtime) {
  return runtime.contentObject.content.items.map((item) => ({
    prompt: item.prompt,
    responseValues: item.responseValues,
    responseOperator: item.responseOperator,
    visual: item.visual,
    isExample: item.isExample
  }));
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function renderRuntime(runtime) {
  return new Promise((resolve, reject) => {
    const response = new BufferResponse();
    response.once("finish", () => resolve(response.buffer()));
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.contentObject,
      layoutObject: runtime.layout,
      options: { filename: `${ID}.pdf`, includeAnswerKey: true }
    });
  });
}

function assertCatalogAndReconciliation() {
  const master = getMasterWorksheetCatalog();
  const generated = JSON.parse(
    fs.readFileSync(path.join(ROOT, "data/worksheetCatalog.generated.json"), "utf8")
  ).items;
  const masterItem = master.find((item) => item.id === ID);
  const generatedItem = generated.find((item) => item.id === ID);
  assert(masterItem);
  assert(generatedItem);
  assert.strictEqual(masterItem.status, "generated");
  assert.strictEqual(generatedItem.status, "generated");
  ["title", "shortTitle", "description", "studentInstruction", "generatorOptions"]
    .forEach((field) => assert.deepStrictEqual(masterItem[field], generatedItem[field], `${field} parity`));

  const counts = Object.fromEntries(
    ["ready", "generated", "partial", "planned"].map((status) => [
      status,
      master.filter((item) => item.status === status).length
    ])
  );
  assert.deepStrictEqual(counts, { ready: 104, generated: 213, partial: 5, planned: 9 });
  assert.strictEqual(master.length, 331);

  const reconciliation = fs.readFileSync(
    path.join(ROOT, "docs/grade-2-architecture-reconciliation-preflight.md"),
    "utf8"
  );
  const categoryALine = reconciliation.split("\n").find((line) => line.startsWith("- **A (35):**"));
  const categoryDLine = reconciliation.split("\n").find((line) => line.startsWith("- **D (0):**"));
  const categoryGLine = reconciliation.split("\n").find((line) => line.startsWith("- **G (17):**"));
  assert(categoryALine && categoryDLine && categoryGLine);
  assert(categoryALine.includes(ID));
  assert(!categoryDLine.includes(ID));
}

function assertRuntimeContract(runtime) {
  const items = runtime.contentObject.content.items;
  assert.strictEqual(runtime.item.id, ID);
  assert.strictEqual(runtime.item.status, "generated");
  assert.strictEqual(runtime.item.title, TITLE);
  assert.strictEqual(runtime.layout.header.title, TITLE);
  assert.strictEqual(runtime.layout.header.subtitle, "");
  assert.strictEqual(runtime.layout.instruction, INSTRUCTION);
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, FOOTER);
  assert(!runtime.layout.header.title.includes("_"));
  assert(!runtime.layout.instruction.includes("_"));
  assert(!runtime.contentObject.meta.curriculum.footerText.includes("_"));
  assert.strictEqual(runtime.layout.template.columns, 2);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 8);
  assert.strictEqual(runtime.layout.display.visualColumns, 2);
  assert.strictEqual(runtime.layout.display.multiplicationModelEquation, true);
  assert.strictEqual(runtime.layout.display.multiplicationModelFamily, "equal_groups");
  assert.strictEqual(runtime.layout.display.multiplicationModelConvention, "groups_items");
  assert.strictEqual(runtime.layout.display.equalHeightItems, true);
  assert.strictEqual(items.length, 8);
  assert.strictEqual(items.some((item) => item.isExample), false);

  const orderedPairs = new Set();
  const groupCounts = new Map();
  const itemCounts = new Map();
  items.forEach((item, index) => {
    assert.strictEqual(item.id, index + 1);
    assert.strictEqual(item.prompt, "");
    assert.strictEqual(item.showQuestionSentence, false);
    assert.strictEqual(item.responseMode, "multiplication_sentence");
    assert.strictEqual(item.responseOperator, MULTIPLICATION_SYMBOL);
    assert.strictEqual(item.visual.kind, "equal_groups");
    assert.strictEqual(item.orientation, "groups_items");
    assert.strictEqual(item.visual.data.orientation, "groups_items");
    assert(Array.isArray(item.responseValues));
    assert.strictEqual(item.responseValues.length, 3);

    const [groups, itemsPerGroup, product] = item.responseValues;
    assert(groups >= 2 && groups <= 6);
    assert(itemsPerGroup >= 2 && itemsPerGroup <= 6);
    assert(product <= 36);
    assert.strictEqual(groups * itemsPerGroup, product);
    assert.strictEqual(item.answer, product);
    assert.strictEqual(item.visual.data.groups, groups);
    assert.strictEqual(item.visual.data.itemsPerGroup, itemsPerGroup);
    assert.strictEqual(item.visual.data.product, product);
    assert.strictEqual(item.visual.data.factorA, groups);
    assert.strictEqual(item.visual.data.factorB, itemsPerGroup);
    orderedPairs.add(`${groups}:${itemsPerGroup}`);
    groupCounts.set(groups, (groupCounts.get(groups) || 0) + 1);
    itemCounts.set(itemsPerGroup, (itemCounts.get(itemsPerGroup) || 0) + 1);
  });
  assert.strictEqual(orderedPairs.size, 8);
  assert(groupCounts.size >= 4);
  assert(itemCounts.size >= 4);
  assert(Math.max(...groupCounts.values()) <= 2);
  assert(Math.max(...itemCounts.values()) <= 2);

  const keyItems = buildAnswerKeyItems(items);
  assert.strictEqual(keyItems.length, 8);
  keyItems.forEach((keyItem, index) => {
    assert.deepStrictEqual(keyItem.responseValues, items[index].responseValues);
    assert.deepStrictEqual(keyItem.visual, items[index].visual);
    assert.strictEqual(keyItem.responseOperator, MULTIPLICATION_SYMBOL);
  });
}

function assertMaximumModelFits() {
  const measured = rendererTest.measureEqualGroupsVisual(
    { groups: 6, itemsPerGroup: 6, product: 36 },
    218,
    80
  );
  assert.strictEqual(measured.groups, 6);
  assert.strictEqual(measured.itemsPerGroup, 6);
  assert.strictEqual(measured.groupCols, 5);
  assert.strictEqual(measured.groupRows, 2);
  assert.strictEqual(measured.dotRadius, 2.4);
  assert(measured.width <= 218);
  assert(measured.height <= 80);
  assert(measured.groupGap >= 2.5);
  assert(measured.groupPad >= 2.5);
}

function assertGradeIsolation() {
  const grade1 = buildCatalogWorksheetRuntime(
    "grade1_multiplication_facts_equal_groups",
    { worksheetSeed: "g1-equal-groups-isolation", includeExample: true }
  );
  assert.strictEqual(grade1.layout.header.title, "Equal Groups");
  assert.strictEqual(grade1.contentObject.content.items.length, 8);
  assert.strictEqual(grade1.contentObject.content.items[0].isExample, true);
  assert(grade1.contentObject.content.items.every((item) => item.responseValues[2] <= 10));

  const grade3 = buildCatalogWorksheetRuntime(
    "grade3_multiplication_facts_equal_groups",
    { worksheetSeed: "g3-equal-groups-isolation", questionCount: 4, includeExample: true }
  );
  assert.strictEqual(grade3.item.title, "Equal Groups — Grade 3");
  assert.strictEqual(grade3.contentObject.content.items.length, 5);
  assert.strictEqual(grade3.contentObject.content.items[0].isExample, true);
  assert.strictEqual(grade3.layout.display.hideSubtitle, false);

  const equalSharing = buildCatalogWorksheetRuntime(
    "g3_equal_sharing_division",
    { worksheetSeed: "g3-equal-sharing-isolation" }
  );
  assert.strictEqual(equalSharing.layout.header.title, "Equal Sharing Division");
  assert.strictEqual(equalSharing.layout.display.divisionModel, true);
  assert.strictEqual(equalSharing.layout.display.equalSharingTaskMode, "distribute");
  assert.strictEqual(equalSharing.contentObject.content.items.length, 12);
  equalSharing.contentObject.content.items.forEach((item) => {
    assert.strictEqual(item.visual.kind, "equal_sharing");
    assert.strictEqual(item.responseMode, "division_sentence");
    assert.strictEqual(item.responseValues[0] / item.responseValues[1], item.responseValues[2]);
  });
}

async function run() {
  assertCatalogAndReconciliation();
  assertMaximumModelFits();
  assertGradeIsolation();

  const observed = new Set();
  for (let seedIndex = 0; seedIndex < 30; seedIndex += 1) {
    const query = {
      worksheetSeed: `g2-equal-groups-${seedIndex}`,
      includeExample: true,
      questionCount: 12,
      responseMode: "total_only",
      showQuestionSentence: true
    };
    const runtime = buildCatalogWorksheetRuntime(ID, query);
    const repeat = buildCatalogWorksheetRuntime(ID, query);
    assertRuntimeContract(runtime);
    assert.deepStrictEqual(signature(runtime), signature(repeat));
    observed.add(JSON.stringify(signature(runtime)));
  }
  assert(observed.size > 1);

  const runtime = buildCatalogWorksheetRuntime(ID, { worksheetSeed: "g2-equal-groups-pdf" });
  const pdf = await renderRuntime(runtime);
  assert(pdf.length > 1000);
  assert.strictEqual(pageCount(pdf), 2);

  console.log("Grade 2 Equal Groups batch checks passed; same-seed failures: 0.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
