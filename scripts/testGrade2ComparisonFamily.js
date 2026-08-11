"use strict";

const assert = require("assert");
const { Writable } = require("stream");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const {
  renderWorksheetPDF,
  buildAnswerKeyItems,
  __test: rendererTest
} = require("../renderers/pdfRenderer");

const COMPARISON_IDS = Object.freeze([
  "grade2_place_value_representation_compare_numbers",
  "g2_compare_numbers_to_100"
]);

const EXPECTED = Object.freeze({
  grade2_place_value_representation_compare_numbers: {
    title: "Compare 3-Digit Numbers",
    min: 100,
    max: 999
  },
  g2_compare_numbers_to_100: {
    title: "Compare Numbers to 100",
    min: 0,
    max: 100
  }
});

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
  toBuffer() {
    return Buffer.concat(this.chunks);
  }
}

function signatures(runtime) {
  return runtime.normalizedContentObject.content.items.map((item) => `${item.prompt}|${item.answer}`);
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function renderPdf(runtime) {
  return new Promise((resolve, reject) => {
    const res = new BufferResponse();
    res.once("finish", () => resolve(res.toBuffer()));
    res.once("error", reject);
    renderWorksheetPDF({
      res,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: { includeAnswerKey: true, cols: 2, filename: "comparison-test.pdf" }
    });
  });
}

function assertComparisonTruth(item, spec) {
  assert.match(item.prompt, /^\d+\s+___\s+\d+$/);
  assert(Number.isInteger(item.leftValue));
  assert(Number.isInteger(item.rightValue));
  assert(item.leftValue >= spec.min && item.leftValue <= spec.max);
  assert(item.rightValue >= spec.min && item.rightValue <= spec.max);
  const expected = item.leftValue > item.rightValue ? ">" : item.leftValue < item.rightValue ? "<" : "=";
  assert.strictEqual(item.answer, expected);
  assert.strictEqual(item.expectedSymbol, expected);
  assert.deepStrictEqual(rendererTest.comparisonRowParts(item), {
    left: item.leftValue,
    right: item.rightValue,
    answer: expected
  });
}

async function testGrade2ComparisonFamily() {
  assert.deepStrictEqual(Object.keys(EXPECTED), [...COMPARISON_IDS]);

  for (const id of COMPARISON_IDS) {
    const spec = EXPECTED[id];
    for (let seedIndex = 0; seedIndex < 40; seedIndex += 1) {
      const query = { worksheetSeed: `g2-comparison-${seedIndex}` };
      const runtime = buildCatalogWorksheetRuntime(id, query);
      const repeat = buildCatalogWorksheetRuntime(id, query);
      const items = runtime.normalizedContentObject.content.items;

      assert.strictEqual(runtime.item.status, "ready");
      assert.strictEqual(runtime.item.title, spec.title);
      assert.strictEqual(runtime.contentObject.meta.title, spec.title);
      assert(!runtime.contentObject.meta.title.includes("Grade 2 Extension"));
      assert.strictEqual(runtime.layout.instruction, "Write >, <, or = to compare each pair of numbers.");
      assert.strictEqual(runtime.layout.template.columns, 2);
      assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 20);
      assert.strictEqual(runtime.layout.display.grade2ComparisonLayout, true);
      assert.strictEqual(runtime.layout.display.denseGridRows, 10);
      assert.strictEqual(runtime.layout.display.sequentialColumnFill, true);
      assert.strictEqual(runtime.layout.display.comparisonTargetWidth, 52);
      assert.strictEqual(
        runtime.contentObject.meta.curriculum.footerText,
        "Grade 2 • Math • Place Value"
      );
      assert(!runtime.contentObject.meta.curriculum.footerText.includes("place_value_representation"));
      assert(!runtime.contentObject.meta.curriculum.footerText.includes("number_relationships"));
      assert(!/[a-z]+_[a-z_]+/.test(runtime.contentObject.meta.curriculum.footerText));
      assert.strictEqual(items.length, 20);
      assert(items.every((item) => !item.isExample));
      assert.deepStrictEqual(signatures(runtime), signatures(repeat));
      items.forEach((item) => assertComparisonTruth(item, spec));

      const answerItems = buildAnswerKeyItems(items);
      assert.strictEqual(answerItems.length, items.length);
      answerItems.forEach((answerItem, index) => {
        assert.strictEqual(answerItem.id, items[index].id);
        assert.strictEqual(answerItem.answer, items[index].answer);
        assert.strictEqual(answerItem.leftValue, items[index].leftValue);
        assert.strictEqual(answerItem.rightValue, items[index].rightValue);
      });

      if (seedIndex === 0) {
        const pdf = await renderPdf(runtime);
        assert.strictEqual(pageCount(pdf), 2);
      }
    }
  }
}

function testGradeIsolation() {
  const grade1 = buildCatalogWorksheetRuntime("g1_compare_numbers_to_20", {
    worksheetSeed: "g1-comparison-isolation"
  });
  const grade3 = buildCatalogWorksheetRuntime("grade3_place_value_representation_compare_numbers", {
    worksheetSeed: "g3-comparison-isolation"
  });
  assert.notStrictEqual(grade1.layout.display.grade2ComparisonLayout, true);
  assert.notStrictEqual(grade3.layout.display.grade2ComparisonLayout, true);
  assert(!grade1.contentObject.meta.title.includes("3-Digit Numbers"));
  assert(grade3.contentObject.meta.title.includes("Grade 3"));
}

async function run() {
  await testGrade2ComparisonFamily();
  testGradeIsolation();
  console.log("Grade 2 comparison family tests passed.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
