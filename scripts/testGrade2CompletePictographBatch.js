const assert = require("assert");
const fs = require("fs");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { getAnyWorksheetCatalogById } = require("../services/worksheetCatalogService");
const { renderWorksheetPDF, buildAnswerKeyItems, __test: rendererTest } = require("../renderers/pdfRenderer");

const RESOURCE_ID = "grade2_data_display_graphing_complete_graph";
const EXPECTED_FOOTER = "Grade 2 • Math • Data & Graphing";

class MemoryResponse extends Writable {
  constructor() { super(); this.chunks = []; }
  setHeader() {}
  _write(chunk, encoding, callback) { this.chunks.push(Buffer.from(chunk)); callback(); }
  buffer() { return Buffer.concat(this.chunks); }
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function renderRuntime(runtime) {
  return new Promise((resolve, reject) => {
    const response = new MemoryResponse();
    response.on("finish", () => resolve(response.buffer()));
    response.on("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: { filename: "grade2-complete-pictograph.pdf", disposition: "inline", includeAnswerKey: true }
    });
  });
}

function signature(runtime) {
  return JSON.stringify(runtime.normalizedContentObject.content.items.map((item) => ({
    graphData: item.graphData,
    graphTaskData: item.graphTaskData,
    duplicateSignature: item.duplicateSignature
  })));
}

function validateRuntime(runtime) {
  const item = runtime.normalizedContentObject.content.items[0];
  const graph = item.graphData;
  const task = item.graphTaskData;
  assert.strictEqual(runtime.item.id, RESOURCE_ID);
  assert.strictEqual(runtime.item.status, "generated");
  assert.strictEqual(runtime.layout.header.title, "Finish the Pictograph");
  assert.strictEqual(runtime.layout.header.subtitle, "");
  assert.strictEqual(runtime.layout.instruction, "Use the table to draw the missing circles in the pictograph.");
  assert.strictEqual(runtime.normalizedContentObject.meta.title, "Finish the Pictograph");
  assert.strictEqual(`${runtime.normalizedContentObject.meta.title} ANSWER KEY`, "Finish the Pictograph ANSWER KEY");
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, EXPECTED_FOOTER);
  assert(!runtime.layout.header.title.includes("_") && !runtime.layout.instruction.includes("_"));
  assert.strictEqual(runtime.normalizedContentObject.content.items.length, 2);
  assert.strictEqual(new Set(runtime.normalizedContentObject.content.items.map((problem) => problem.graphData.topicId)).size, 2);
  assert.strictEqual(item.prompt, "");
  assert.strictEqual(item.taskMode, "complete_graph");
  assert.strictEqual(item.responseMode, "graph_drawing");
  assert.strictEqual(item.isExample, false);
  assert(graph && task, "Structured graph and construction truth are required.");
  assert.strictEqual(graph.graphType, "pictograph");
  assert.strictEqual(graph.modelType, "one_to_one_pictograph");
  assert.strictEqual(graph.symbol, "circle");
  assert.strictEqual(graph.keyValue, 1);
  assert.strictEqual(graph.scale, 1);
  assert.strictEqual(graph.partialSymbols, false);
  assert.strictEqual(graph.categories.length, 4);
  assert.strictEqual(new Set(graph.categories.map((category) => category.id)).size, 4);
  assert.strictEqual(new Set(graph.categories.map((category) => category.label)).size, 4);
  assert.deepStrictEqual(graph.values, graph.categories.map((category) => category.value));
  graph.values.forEach((value) => assert(Number.isInteger(value) && value >= 2 && value <= 8));
  assert.strictEqual(graph.total, graph.values.reduce((sum, value) => sum + value, 0));
  assert.deepStrictEqual(task.tableRows.map((row) => row.value), graph.values);
  assert.deepStrictEqual(task.graphRows.map((row) => row.categoryId), graph.categories.map((category) => category.id));
  assert.deepStrictEqual(task.requiredSymbolCounts, graph.values);
  assert.deepStrictEqual(task.visibleSymbolCounts, task.rows.map((row) => row.visibleCount));
  assert.deepStrictEqual(task.missingCategoryIds, task.completionRows.map((row) => row.categoryId));
  assert.deepStrictEqual(task.missingCounts.slice().sort(), [2, 3]);
  assert.strictEqual(task.rows.filter((row) => row.isIncomplete).length, 2);
  assert.strictEqual(task.rows.filter((row) => !row.isIncomplete).length, 2);
  task.rows.forEach((row) => {
    assert(row.visibleCount >= 0);
    assert.strictEqual(row.visibleCount, row.visibleSymbolCount);
    assert.strictEqual(row.targetValue, row.requiredSymbolCount);
    assert.strictEqual(row.visibleCount + row.missingCount, row.targetValue);
    if (row.isIncomplete) assert(row.visibleCount >= 1);
    assert.strictEqual(row.omissionPlacement, row.isIncomplete ? "row_end" : null);
  });
  assert.deepStrictEqual(
    rendererTest.buildConstructionGraphCategories(task, false).map((row) => row.value),
    task.visibleSymbolCounts
  );
  assert.deepStrictEqual(
    rendererTest.buildConstructionGraphCategories(task, true).map((row) => row.value),
    task.requiredSymbolCounts
  );
  assert.strictEqual(runtime.layout.template.columns, 1);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 2);
  assert.strictEqual(runtime.layout.display.sharedDataTaskMode, "complete_graph");
  assert.strictEqual(runtime.layout.display.sharedDataSymbolStrokeColor, "#4b5563");
  assert.strictEqual(runtime.layout.display.sharedDataSymbolStrokeWidth, 1.15);
  assert.strictEqual(runtime.layout.display.constructionPictograph.width, 504);
  assert.strictEqual(runtime.layout.display.constructionPictograph.height, 160);
  assert.strictEqual(runtime.layout.display.constructionPictograph.symbolDiameter, 16);
  assert.strictEqual(runtime.layout.display.constructionPictograph.tasksPerPage, 2);
  assert(!runtime.layout.display.grade1DataTaskMode);
  const keyItems = buildAnswerKeyItems(runtime.normalizedContentObject.content.items);
  assert.strictEqual(keyItems.length, 2);
  assert.deepStrictEqual(
    keyItems.map((keyItem) => keyItem.graphData),
    runtime.normalizedContentObject.content.items.map((problem) => problem.graphData)
  );
  assert.deepStrictEqual(
    keyItems.map((keyItem) => keyItem.graphTaskData),
    runtime.normalizedContentObject.content.items.map((problem) => problem.graphTaskData)
  );
  runtime.normalizedContentObject.content.items.slice(1).forEach((problem) => {
    assert.strictEqual(problem.taskMode, "complete_graph");
    assert.strictEqual(problem.responseMode, "graph_drawing");
    assert.strictEqual(problem.graphTaskData.rows.length, 4);
    assert.strictEqual(problem.graphTaskData.rows.filter((row) => row.isIncomplete).length, 2);
    assert.deepStrictEqual(problem.graphTaskData.missingCounts.slice().sort(), [2, 3]);
  });
  assert.deepStrictEqual(runtime.contentObject.content.items[0].graphTaskData, task, "Preview and PDF normalize the same truth.");
}

function assertIsolation() {
  const grade1 = buildCatalogWorksheetRuntime("grade1_data_display_graphing_complete_graph", { worksheetSeed: "g2-complete-isolation" });
  assert.strictEqual(grade1.layout.display.grade1DataTaskMode, "complete_graph");
  assert.strictEqual(grade1.layout.display.sharedDataTaskMode, undefined);
  assert.strictEqual(grade1.layout.display.sharedDataSymbolStrokeColor, "#4b5563");
  assert.strictEqual(grade1.normalizedContentObject.content.items.length, 2);
  assert.deepStrictEqual(grade1.normalizedContentObject.content.items[0].graphTaskData.rows.map((row) => row.missingCount).filter(Boolean).sort(), [1, 2]);

  const grade3 = buildCatalogWorksheetRuntime("grade3_data_display_graphing_complete_graph", { worksheetSeed: "g2-complete-isolation" });
  assert.strictEqual(grade3.normalizedContentObject.content.items.length, 12);
  assert(grade3.normalizedContentObject.content.items.every((problem) => problem.graphData === null));

  for (const id of ["grade2_data_display_graphing_graph_questions"]) {
    const runtime = buildCatalogWorksheetRuntime(id, { worksheetSeed: "g2-complete-isolation" });
    assert.strictEqual(runtime.normalizedContentObject.content.items.length, 12);
    assert(runtime.normalizedContentObject.content.items.every((problem) => problem.graphData === null));
  }
  const match = buildCatalogWorksheetRuntime("grade2_data_display_graphing_match_data_to_graph", { worksheetSeed: "g2-complete-isolation" });
  assert.strictEqual(match.normalizedContentObject.content.items.length, 2);
  assert(match.normalizedContentObject.content.items.every((problem) => problem.taskMode === "match_graph"));
  const read = buildCatalogWorksheetRuntime("grade2_data_display_graphing_read_graph", { worksheetSeed: "g2-complete-isolation" });
  assert.strictEqual(read.normalizedContentObject.content.items.length, 6);
  assert(read.normalizedContentObject.content.items.every((problem) => problem.taskMode === "read_pictograph"));
  assert(!fs.readFileSync("engine/problemGenerators/grade2DataGraph.js", "utf8").includes("Math.random"));
}

function assertCatalogBoundary() {
  const item = getAnyWorksheetCatalogById(RESOURCE_ID);
  assert.strictEqual(item.status, "generated");
  const master = JSON.parse(fs.readFileSync("data/worksheetCatalog.master.json", "utf8")).items;
  assert.strictEqual(master.filter((record) => record.id === RESOURCE_ID).length, 1);
  assert.strictEqual(master.filter((record) => record.status === "ready").length, 106);
  const reconciliation = fs.readFileSync("docs/grade-2-architecture-reconciliation-preflight.md", "utf8");
  const categoryA = reconciliation.match(/\*\*A \(35\):\*\*[^\n]+/)?.[0] || "";
  const categoryD = reconciliation.match(/\*\*D \(0\):\*\*[^\n]+/)?.[0] || "";
  assert(categoryA.includes(RESOURCE_ID));
  assert(!categoryD.includes(RESOURCE_ID));
  assert(categoryA.includes("grade2_data_display_graphing_match_data_to_graph"));
  assert(categoryD.includes("none"));
}

async function run() {
  assertCatalogBoundary();
  assertIsolation();
  const varied = new Set();
  const topics = new Set();
  const missingSelections = new Set();
  for (let index = 0; index < 30; index += 1) {
    const options = { worksheetSeed: `grade2-complete-pictograph-${index}` };
    const first = buildCatalogWorksheetRuntime(RESOURCE_ID, options);
    const second = buildCatalogWorksheetRuntime(RESOURCE_ID, options);
    validateRuntime(first);
    assert.strictEqual(signature(first), signature(second));
    varied.add(signature(first));
    topics.add(first.layout.display.sharedDataGraph.topicId);
    missingSelections.add(first.normalizedContentObject.content.items[0].graphTaskData.completionRows.map((row) => `${row.categoryId}:${row.missingCount}`).join("|"));
  }
  assert(varied.size >= 20, "Topic, values, and missing rows must vary meaningfully across seeds.");
  assert(topics.size >= 10, "Topics must vary across seeds.");
  assert(missingSelections.size >= 20, "Incomplete rows and missing-count assignments must vary across seeds.");
  const runtime = buildCatalogWorksheetRuntime(RESOURCE_ID, { worksheetSeed: "grade2-complete-pictograph-founder-default" });
  const pdf = await renderRuntime(runtime);
  assert(pdf.length > 1000, "PDF output must not be blank.");
  assert.strictEqual(pageCount(pdf), 2);
  assert.strictEqual((pdf.toString("latin1").match(/\/MediaBox \[0 0 612 792\]/g) || []).length, 2);
  console.log("Grade 2 Finish the Pictograph checks passed; same-seed failures: 0.");
}

run().catch((error) => { console.error(error); process.exit(1); });
