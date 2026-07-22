const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");
const PDFDocument = require("pdfkit");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { getAnyWorksheetCatalogById } = require("../services/worksheetCatalogService");
const { renderWorksheetPDF, buildAnswerKeyItems, __test: rendererTest } = require("../renderers/pdfRenderer");

const RESOURCE_ID = "grade2_data_display_graphing_match_data_to_graph";
const EXPECTED_FOOTER = "Grade 2 • Math • Data & Graphing";
const FINAL_INSTRUCTION = "Use the table. Circle A or B to show which pictograph matches the data.";
const OLD_INSTRUCTION = "Use the table. Circle the pictograph that shows the same data.";
const MARKER_CENTER_TOLERANCE = 0.01;

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
      options: { filename: "grade2-matching-pictograph.pdf", disposition: "inline", includeAnswerKey: true }
    });
  });
}

function runtimeSignature(runtime) {
  return JSON.stringify(runtime.normalizedContentObject.content.items.map((item) => ({
    graphData: item.graphData,
    graphTaskData: item.graphTaskData,
    answer: item.answer,
    duplicateSignature: item.duplicateSignature
  })));
}

function rowsSignature(rows) {
  return JSON.stringify(rows.map(({ id, label, value }) => ({ id, label, value })));
}

function validateItem(item) {
  const graph = item.graphData;
  const task = item.graphTaskData;
  assert.strictEqual(item.prompt, "");
  assert.strictEqual(item.taskMode, "match_graph");
  assert.strictEqual(item.responseMode, "graph_choice");
  assert.strictEqual(item.responseType, "choice");
  assert.strictEqual(item.isExample, false);
  assert(graph && task, "Structured graph and matching truth are required.");
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
  assert.strictEqual(task.kind, "match_graph");
  assert.strictEqual(task.tableRows.length, 4);
  assert.strictEqual(task.choices.length, 2);
  assert.deepStrictEqual(task.choices.map((choice) => choice.id), ["A", "B"]);
  assert.strictEqual(task.choices.filter((choice) => choice.isCorrect).length, 1);
  assert.strictEqual(item.answer, task.correctChoiceId);
  assert.strictEqual(task.answerState.correctChoiceId, task.correctChoiceId);
  assert.strictEqual(task.keyValue, 1);
  assert.strictEqual(task.scale, 1);
  assert.strictEqual(rowsSignature(task.tableRows), rowsSignature(task.correctGraph.categories));
  const correctChoice = task.choices.find((choice) => choice.isCorrect);
  const distractorChoice = task.choices.find((choice) => !choice.isCorrect);
  assert.strictEqual(rowsSignature(correctChoice.categories), rowsSignature(task.tableRows));
  assert.strictEqual(rowsSignature(distractorChoice.categories), rowsSignature(task.distractorGraph.categories));
  assert.notStrictEqual(rowsSignature(correctChoice.categories), rowsSignature(distractorChoice.categories));
  const differences = distractorChoice.categories.filter((category, index) => {
    const source = task.tableRows[index];
    assert.strictEqual(category.id, source.id);
    assert.strictEqual(category.label, source.label);
    assert(Number.isInteger(category.value) && category.value >= 2 && category.value <= 8);
    return category.value !== source.value;
  });
  assert.strictEqual(differences.length, 1);
  assert.strictEqual(differences[0].id, task.changedCategoryId);
  assert.strictEqual(Math.abs(task.delta), 1);
  assert.strictEqual(task.distractorValue - task.originalValue, task.delta);
  assert.strictEqual(task.distractor.categoryId, task.changedCategoryId);
  assert.strictEqual(task.distractor.originalValue, task.originalValue);
  assert.strictEqual(task.distractor.distractorValue, task.distractorValue);
  assert(["one_extra", "one_missing"].includes(task.distractor.kind));
  assert(item.duplicateSignature && !item.duplicateSignature.includes("Math.random"));
}

function validateRuntime(runtime) {
  assert.strictEqual(runtime.item.id, RESOURCE_ID);
  assert.strictEqual(runtime.item.status, "generated");
  assert.strictEqual(runtime.layout.header.title, "Choose the Matching Pictograph");
  assert.strictEqual(runtime.layout.header.subtitle, "");
  assert.strictEqual(runtime.layout.instruction, FINAL_INSTRUCTION);
  assert(!JSON.stringify(runtime.normalizedContentObject).includes(OLD_INSTRUCTION));
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, EXPECTED_FOOTER);
  assert.strictEqual(runtime.normalizedContentObject.content.items.length, 2);
  assert.deepStrictEqual(runtime.normalizedContentObject.content.items.map((item) => item.answer).sort(), ["A", "B"]);
  assert.strictEqual(new Set(runtime.normalizedContentObject.content.items.map((item) => item.graphData.topicId)).size, 2);
  runtime.normalizedContentObject.content.items.forEach(validateItem);
  assert.strictEqual(runtime.layout.template.columns, 1);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 2);
  assert.strictEqual(runtime.layout.display.sharedDataTaskMode, "match_graph");
  assert.strictEqual(runtime.layout.display.sharedDataSymbolStrokeColor, "#4b5563");
  assert.strictEqual(runtime.layout.display.sharedDataSymbolStrokeWidth, 1.15);
  assert.strictEqual(runtime.layout.display.grade1DataTaskMode, undefined);
  const keyItems = buildAnswerKeyItems(runtime.normalizedContentObject.content.items);
  keyItems.forEach((item, index) => {
    assert.deepStrictEqual(item.graphData, runtime.normalizedContentObject.content.items[index].graphData);
    assert.deepStrictEqual(item.graphTaskData, runtime.normalizedContentObject.content.items[index].graphTaskData);
    assert.deepStrictEqual(item.answerState, runtime.normalizedContentObject.content.items[index].answerState);
  });
}

function assertMarkerGeometry() {
  const doc = new PDFDocument({ autoFirstPage: false });
  const fontPath = path.join(__dirname, "..", "public", "fonts", "SourceSans3", "SourceSans3-Bold.ttf");
  doc.registerFont("matching-marker-test", fontPath);
  doc.font("matching-marker-test").fontSize(10);
  assert.strictEqual(rendererTest.GRADE1_DATA_MATCH_SELECTION_TARGET_DIAMETER, 18);
  for (const label of ["A", "B"]) {
    const geometry = rendererTest.measureCircularLabelGeometry(doc, label, 100, 80);
    assert(geometry.measuredTextWidth > 0);
    assert(Math.abs(geometry.inkCenterX - 100) <= MARKER_CENTER_TOLERANCE);
    assert(Math.abs(geometry.inkCenterY - 80) <= MARKER_CENTER_TOLERANCE);
    assert(geometry.inkBounds.left > 90 && geometry.inkBounds.right < 110);
    assert(geometry.inkBounds.top > 70 && geometry.inkBounds.bottom < 90);
    for (const answerKey of [false, true]) {
      const choice = { isCorrect: true };
      const strokeWidth = rendererTest.matchChoiceStrokeWidth(choice, answerKey);
      assert.strictEqual(strokeWidth, answerKey ? 2 : 0.8);
      assert(Math.abs(geometry.inkCenterX - 100) <= MARKER_CENTER_TOLERANCE);
      assert(Math.abs(geometry.inkCenterY - 80) <= MARKER_CENTER_TOLERANCE);
    }
  }
  doc.end();
}

function assertCatalogAndIsolation() {
  const item = getAnyWorksheetCatalogById(RESOURCE_ID);
  assert.strictEqual(item.status, "generated");
  const master = JSON.parse(fs.readFileSync("data/worksheetCatalog.master.json", "utf8")).items;
  assert.strictEqual(master.filter((record) => record.id === RESOURCE_ID).length, 1);
  assert.strictEqual(master.filter((record) => record.status === "ready").length, 104);
  const reconciliation = fs.readFileSync("docs/grade-2-architecture-reconciliation-preflight.md", "utf8");
  const categoryA = reconciliation.match(/\*\*A \(35\):\*\*[^\n]+/)?.[0] || "";
  const categoryD = reconciliation.match(/\*\*D \(0\):\*\*[^\n]+/)?.[0] || "";
  assert(categoryA.includes(RESOURCE_ID));
  assert(categoryD.includes("none"));

  const grade1 = buildCatalogWorksheetRuntime("grade1_data_display_graphing_match_data_to_graph", { worksheetSeed: "g2-match-isolation" });
  assert.strictEqual(grade1.normalizedContentObject.content.items.length, 2);
  assert.strictEqual(grade1.layout.display.grade1DataTaskMode, "match_graph");
  assert.strictEqual(grade1.layout.display.sharedDataTaskMode, undefined);
  assert.strictEqual(grade1.layout.display.sharedDataSymbolStrokeColor, undefined);
  const grade3 = buildCatalogWorksheetRuntime("grade3_data_display_graphing_match_data_to_graph", { worksheetSeed: "g2-match-isolation" });
  assert.strictEqual(grade3.normalizedContentObject.content.items.length, 12);
  assert(grade3.normalizedContentObject.content.items.every((problem) => problem.graphData === null));
  for (const [id, count, taskMode] of [
    ["grade2_data_display_graphing_read_graph", 6, "read_pictograph"],
    ["grade2_data_display_graphing_interpret_data", 6, "interpret_pictograph"],
    ["grade2_data_display_graphing_complete_graph", 1, "complete_graph"]
  ]) {
    const runtime = buildCatalogWorksheetRuntime(id, { worksheetSeed: "g2-match-isolation" });
    assert.strictEqual(runtime.normalizedContentObject.content.items.length, count);
    assert(runtime.normalizedContentObject.content.items.every((problem) => problem.taskMode === taskMode));
  }
  assert(!fs.readFileSync("engine/problemGenerators/grade2DataGraph.js", "utf8").includes("Math.random"));
}

async function run() {
  assertMarkerGeometry();
  assertCatalogAndIsolation();
  const varied = new Set();
  const topics = new Set();
  const distractors = new Set();
  const firstAnswers = new Set();
  for (let index = 0; index < 30; index += 1) {
    const options = { worksheetSeed: `grade2-matching-pictograph-${index}` };
    const first = buildCatalogWorksheetRuntime(RESOURCE_ID, options);
    const second = buildCatalogWorksheetRuntime(RESOURCE_ID, options);
    validateRuntime(first);
    assert.strictEqual(runtimeSignature(first), runtimeSignature(second));
    varied.add(runtimeSignature(first));
    firstAnswers.add(first.normalizedContentObject.content.items[0].answer);
    first.normalizedContentObject.content.items.forEach((item) => {
      topics.add(item.graphData.topicId);
      distractors.add(`${item.graphData.topicId}:${item.graphTaskData.changedCategoryId}:${item.graphTaskData.delta}`);
    });
  }
  assert(varied.size >= 20, "Matching datasets and choices must vary meaningfully across seeds.");
  assert(topics.size >= 20, "Matching topics must vary across seeds.");
  assert(distractors.size >= 30, "Distractor categories and directions must vary across seeds.");
  assert.deepStrictEqual([...firstAnswers].sort(), ["A", "B"]);
  const runtime = buildCatalogWorksheetRuntime(RESOURCE_ID, { worksheetSeed: "grade2-matching-pictograph-founder-default" });
  const pdf = await renderRuntime(runtime);
  assert(pdf.length > 1000);
  assert.strictEqual(pageCount(pdf), 2);
  assert.strictEqual((pdf.toString("latin1").match(/\/MediaBox \[0 0 612 792\]/g) || []).length, 2);
  console.log("Grade 2 matching pictograph checks passed; same-seed failures: 0.");
}

run().catch((error) => { console.error(error); process.exit(1); });
