const assert = require("assert");
const fs = require("fs");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { getAnyWorksheetCatalogById } = require("../services/worksheetCatalogService");
const { renderWorksheetPDF, buildAnswerKeyItems, __test: rendererTest } = require("../renderers/pdfRenderer");

const ARRAYS_ID = "grade2_multiplication_facts_arrays";
const BASE_TEN_ID = "g2_base_ten_blocks_representation";
const MULTIPLICATION_SYMBOL = "×";
const ARRAYS_TITLE = "Arrays";
const ARRAYS_INSTRUCTION = "Use each array to write a multiplication equation.";
const ARRAYS_FOOTER = "Grade 2 • Math • Multiplication & Division";
const BASE_TEN_TITLE = "Base Ten Blocks";
const BASE_TEN_INSTRUCTION = "Count the base ten blocks. Write the number.";
const BASE_TEN_FOOTER = "Grade 2 • Math • Place Value";

class MemoryResponse extends Writable {
  constructor() { super(); this.chunks = []; }
  setHeader() {}
  _write(chunk, encoding, callback) { this.chunks.push(Buffer.from(chunk)); callback(); }
  buffer() { return Buffer.concat(this.chunks); }
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function renderRuntime(runtime, filename) {
  return new Promise((resolve, reject) => {
    const response = new MemoryResponse();
    response.on("finish", () => resolve(response.buffer()));
    response.on("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: { filename, disposition: "inline", includeAnswerKey: true }
    });
  });
}

function runtimeSignature(runtime) {
  return JSON.stringify({
    title: runtime.layout.header.title,
    instruction: runtime.layout.instruction,
    template: runtime.layout.template,
    display: runtime.layout.display,
    items: runtime.normalizedContentObject.content.items
  });
}

function assertKeyParity(runtime) {
  const studentItems = runtime.normalizedContentObject.content.items;
  const keyItems = buildAnswerKeyItems(studentItems);
  assert.strictEqual(keyItems.length, studentItems.length);
  keyItems.forEach((item, index) => {
    assert.strictEqual(item.answer, studentItems[index].answer);
    assert.deepStrictEqual(item.visual, studentItems[index].visual);
    assert.deepStrictEqual(item.responseValues, studentItems[index].responseValues);
  });
}

function assertPreviewParity(runtime) {
  const previewItems = runtime.layout.problems;
  const pdfItems = runtime.normalizedContentObject.content.items;
  assert.strictEqual(previewItems.length, pdfItems.length);
  previewItems.forEach((item, index) => {
    assert.strictEqual(item.answer, pdfItems[index].answer);
    assert.strictEqual(item.visual.kind, pdfItems[index].visual.kind);
    assert.strictEqual(Number(item.visual.data.rows || 0), Number(pdfItems[index].visual.data.rows || 0));
    assert.strictEqual(Number(item.visual.data.cols || 0), Number(pdfItems[index].visual.data.cols || 0));
    assert.strictEqual(Number(item.visual.data.tens || 0), Number(pdfItems[index].visual.data.tens || 0));
    assert.strictEqual(Number(item.visual.data.ones || 0), Number(pdfItems[index].visual.data.ones || 0));
  });
}

function validateArrays(runtime) {
  assert.strictEqual(runtime.item.id, ARRAYS_ID);
  assert.strictEqual(runtime.item.status, "ready");
  assert.strictEqual(runtime.layout.header.title, ARRAYS_TITLE);
  assert.strictEqual(runtime.contentObject.meta.title, ARRAYS_TITLE);
  assert.strictEqual(`${runtime.contentObject.meta.title} ANSWER KEY`, "Arrays ANSWER KEY");
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, ARRAYS_FOOTER);
  assert(!runtime.contentObject.meta.curriculum.footerText.includes("multiplication_facts"));
  assert.strictEqual(runtime.layout.instruction, ARRAYS_INSTRUCTION);
  assert.strictEqual(runtime.normalizedContentObject.content.items.length, 8);
  assert.strictEqual(runtime.layout.template.columns, 2);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 8);
  assert.strictEqual(runtime.layout.display.multiplicationModelEquation, true);
  assert.strictEqual(runtime.layout.display.multiplicationModelFamily, "array");

  const radii = new Set();
  runtime.normalizedContentObject.content.items.forEach((item) => {
    const data = item.visual?.data;
    assert(data && item.visual.kind === "array");
    assert.strictEqual(item.prompt, "");
    assert.strictEqual(item.responseMode, "multiplication_sentence");
    assert.strictEqual(item.responseOperator, MULTIPLICATION_SYMBOL);
    assert(Number.isInteger(data.rows) && data.rows > 0);
    assert(Number.isInteger(data.cols) && data.cols > 0);
    assert.strictEqual(data.factorA, data.rows);
    assert.strictEqual(data.factorB, data.cols);
    assert.strictEqual(data.product, data.rows * data.cols);
    assert.strictEqual(item.answer, data.product);
    assert.strictEqual(item.product, data.product);
    assert.deepStrictEqual(item.responseValues, [data.rows, data.cols, data.product]);
    const measured = rendererTest.measureArrayVisual(data, 220, 120);
    radii.add(measured.dotRadius);
  });
  assert.deepStrictEqual([...radii], [2.4]);
  assertKeyParity(runtime);
  assertPreviewParity(runtime);
}

function validateBaseTen(runtime) {
  assert.strictEqual(runtime.item.id, BASE_TEN_ID);
  assert.strictEqual(runtime.item.status, "ready");
  assert.strictEqual(runtime.layout.header.title, BASE_TEN_TITLE);
  assert.strictEqual(runtime.contentObject.meta.title, BASE_TEN_TITLE);
  assert.strictEqual(`${runtime.contentObject.meta.title} ANSWER KEY`, "Base Ten Blocks ANSWER KEY");
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, BASE_TEN_FOOTER);
  assert(!runtime.contentObject.meta.curriculum.footerText.includes("place_value_representation"));
  assert.strictEqual(runtime.layout.instruction, BASE_TEN_INSTRUCTION);
  assert.strictEqual(runtime.normalizedContentObject.content.items.length, 10);
  assert.strictEqual(runtime.layout.template.columns, 1);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 10);
  assert.strictEqual(runtime.layout.display.hideItemPrompts, true);
  assert.strictEqual(runtime.layout.display.baseTenAlignedResponse, undefined);
  assert.strictEqual(runtime.layout.display.shortVisualAnswerLine, true);
  assert(!runtime.layout.instruction.includes("Students interpret"));

  runtime.normalizedContentObject.content.items.forEach((item) => {
    const data = item.visual?.data;
    assert(data && item.visual.kind === "base_ten_blocks");
    assert.strictEqual(item.prompt, "What number is shown by the base ten blocks?");
    assert.strictEqual(data.hundreds, 0);
    assert(Number.isInteger(data.tens) && data.tens >= 1 && data.tens <= 9);
    assert(Number.isInteger(data.ones) && data.ones >= 0 && data.ones <= 9);
    assert.strictEqual(item.answer, data.tens * 10 + data.ones);
  });
  assertKeyParity(runtime);
  assertPreviewParity(runtime);
}

function assertCatalogReconciliationAndIsolation() {
  for (const id of [ARRAYS_ID, BASE_TEN_ID]) {
    const item = getAnyWorksheetCatalogById(id);
    assert(item);
    assert.strictEqual(item.status, "ready");
  }

  const master = JSON.parse(fs.readFileSync("data/worksheetCatalog.master.json", "utf8")).items;
  const counts = master.reduce((result, item) => {
    result[item.status] = (result[item.status] || 0) + 1;
    return result;
  }, {});
  assert.deepStrictEqual(counts, { ready: 104, partial: 5, generated: 213, planned: 9 });
  assert.strictEqual(master.length, 331);

  const reconciliation = fs.readFileSync("docs/grade-2-architecture-reconciliation-preflight.md", "utf8");
  const categoryA = reconciliation.match(/\*\*A \(30\):\*\*[^\n]+/)?.[0] || "";
  const categoryD = reconciliation.match(/\*\*D \(0\):\*\*[^\n]+/)?.[0] || "";
  const categoryE = reconciliation.match(/\*\*E \(7\):\*\*[^\n]+/)?.[0] || "";
  const categoryG = reconciliation.match(/\*\*G \(15\):\*\*[^\n]+/)?.[0] || "";
  assert(categoryA && categoryD.includes("none") && categoryG);
  assert(categoryA.includes(ARRAYS_ID));
  assert(categoryA.includes(BASE_TEN_ID));
  assert(!categoryE.includes(ARRAYS_ID));
  assert(!categoryE.includes(BASE_TEN_ID));

  const grade1Arrays = buildCatalogWorksheetRuntime("grade1_multiplication_facts_arrays", { worksheetSeed: "g2-e1-isolation" });
  assert.strictEqual(grade1Arrays.normalizedContentObject.content.items.length, 8);
  assert.strictEqual(grade1Arrays.layout.instruction, "Count the rows and columns. Complete the number sentence for each array.");
  const grade3Arrays = buildCatalogWorksheetRuntime("grade3_multiplication_facts_arrays", { worksheetSeed: "g2-e1-isolation" });
  assert.strictEqual(grade3Arrays.normalizedContentObject.content.items.length, 10);
  assert.strictEqual(grade3Arrays.layout.header.title, "Arrays — Grade 3");

  const grade1BaseTen = buildCatalogWorksheetRuntime("grade1_place_value_representation_base_ten_blocks", { worksheetSeed: "g2-e1-isolation" });
  assert.strictEqual(grade1BaseTen.normalizedContentObject.content.items.length, 10);
  assert.strictEqual(grade1BaseTen.layout.header.title, "Base Ten Blocks to 50 — Grade 1");
  assert.strictEqual(grade1BaseTen.layout.instruction, BASE_TEN_INSTRUCTION);
  const grade3BaseTen = buildCatalogWorksheetRuntime("grade3_place_value_representation_base_ten_blocks", { worksheetSeed: "g2-e1-isolation" });
  assert.strictEqual(grade3BaseTen.normalizedContentObject.content.items.length, 10);
  assert.strictEqual(grade3BaseTen.layout.header.title, "Base Ten Blocks — Grade 3");
  assert.strictEqual(grade3BaseTen.layout.display.hideItemPrompts, undefined);
}

async function run() {
  assertCatalogReconciliationAndIsolation();
  const arrayVariations = new Set();
  const baseTenVariations = new Set();

  for (let index = 0; index < 30; index += 1) {
    const arrayOptions = { worksheetSeed: `grade2-category-e-batch1-arrays-${index}` };
    const firstArrays = buildCatalogWorksheetRuntime(ARRAYS_ID, arrayOptions);
    const secondArrays = buildCatalogWorksheetRuntime(ARRAYS_ID, arrayOptions);
    validateArrays(firstArrays);
    assert.strictEqual(runtimeSignature(firstArrays), runtimeSignature(secondArrays));
    arrayVariations.add(runtimeSignature(firstArrays));

    const baseTenOptions = { worksheetSeed: `grade2-category-e-batch1-base-ten-${index}` };
    const firstBaseTen = buildCatalogWorksheetRuntime(BASE_TEN_ID, baseTenOptions);
    const secondBaseTen = buildCatalogWorksheetRuntime(BASE_TEN_ID, baseTenOptions);
    validateBaseTen(firstBaseTen);
    assert.strictEqual(runtimeSignature(firstBaseTen), runtimeSignature(secondBaseTen));
    baseTenVariations.add(runtimeSignature(firstBaseTen));
  }

  assert(arrayVariations.size >= 20, "Arrays must vary meaningfully across seeds.");
  assert(baseTenVariations.size >= 20, "Base Ten Blocks must vary meaningfully across seeds.");

  const arraysPdf = await renderRuntime(
    buildCatalogWorksheetRuntime(ARRAYS_ID, { worksheetSeed: "grade2-category-e-batch1-founder-arrays" }),
    "g2-arrays.pdf"
  );
  const baseTenPdf = await renderRuntime(
    buildCatalogWorksheetRuntime(BASE_TEN_ID, { worksheetSeed: "grade2-category-e-batch1-founder-base-ten" }),
    "g2-base-ten.pdf"
  );
  assert(arraysPdf.length > 1000 && baseTenPdf.length > 1000);
  assert.strictEqual(pageCount(arraysPdf), 2);
  assert.strictEqual(pageCount(baseTenPdf), 2);
  assert.strictEqual((arraysPdf.toString("latin1").match(/\/MediaBox \[0 0 612 792\]/g) || []).length, 2);
  assert.strictEqual((baseTenPdf.toString("latin1").match(/\/MediaBox \[0 0 612 792\]/g) || []).length, 2);

  console.log("Grade 2 Category E Batch 1 checks passed; arrays pages: 2; base-ten pages: 2; same-seed failures: 0.");
}

run().catch((error) => { console.error(error); process.exit(1); });
