const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const {
  buildCatalogWorksheetRuntime
} = require("../services/catalogWorksheetRuntimeService");
const {
  getAnyWorksheetCatalogById
} = require("../services/worksheetCatalogService");
const {
  renderWorksheetPDF,
  buildAnswerKeyItems,
  __test: pdfRendererTest
} = require("../renderers/pdfRenderer");
const layoutSpec = require("../config/layout/layoutSpec.json");

const RESOURCE_ID = "g1_addition_on_number_line_to_20";
const EXPECTED_FOOTER = "Grade 1 • Math • Addition & Subtraction";

class MemoryResponse extends Writable {
  constructor() {
    super();
    this.headers = {};
    this.chunks = [];
  }

  setHeader(name, value) {
    this.headers[name] = value;
  }

  _write(chunk, encoding, callback) {
    this.chunks.push(Buffer.from(chunk));
    callback();
  }

  buffer() {
    return Buffer.concat(this.chunks);
  }
}

function runtimeFor(options = {}) {
  return buildCatalogWorksheetRuntime(RESOURCE_ID, options);
}

function signature(runtime) {
  return runtime.contentObject.content.items.map((item) => ({
    prompt: item.prompt,
    answer: item.answer,
    a: item.a,
    b: item.b,
    total: item.total,
    visual: item.visual,
    isExample: item.isExample
  }));
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function assertNearlyEqual(actual, expected, tolerance = 1e-9) {
  assert(Math.abs(actual - expected) <= tolerance, `${actual} should equal ${expected}`);
}

function renderRuntime(runtime, includeAnswerKey) {
  return new Promise((resolve, reject) => {
    const res = new MemoryResponse();
    res.on("finish", () => resolve(res.buffer()));
    res.on("error", reject);
    renderWorksheetPDF({
      res,
      contentObject: runtime.contentObject,
      layoutObject: runtime.layout,
      options: {
        filename: `${RESOURCE_ID}.pdf`,
        disposition: "inline",
        includeAnswerKey
      }
    });
  });
}

function numberLineGeometry(runtime, item, display = runtime.layout.display) {
  const contentBox = layoutSpec.page.contentBox;
  const region = pdfRendererTest.getVisualRegion({
    cellBottomY: 180,
    promptBottomY: 80,
    cellX: contentBox.x,
    cellWidth: contentBox.width,
    visualKind: "number_line",
    fullWidth: Boolean(display.numberLineFullContentWidth),
    flushToCellBounds: Boolean(display.numberLineFullContentWidth)
  });
  const measured = pdfRendererTest.measureNumberLineVisual(
    item.visual.data,
    region.maxWidth,
    region.targetHeight,
    { forceFullWidth: Boolean(display.numberLineFullContentWidth) }
  );
  const data = item.visual.data;
  const steps = data.max - data.min;
  const stepWidth = measured.width / steps;
  const mapValue = (value) => region.x + (value - data.min) * stepWidth;
  return {
    left: region.x,
    right: region.x + measured.width,
    width: measured.width,
    stepWidth,
    mapValue
  };
}

function assertFullWidthGeometry() {
  const contentBox = layoutSpec.page.contentBox;
  const rightBoundary = contentBox.x + contentBox.width;
  const defaultRuntime = runtimeFor({ worksheetSeed: "g1-addition-number-line-default-width" });
  const completedRuntime = runtimeFor({
    worksheetSeed: "g1-addition-number-line-completed-width",
    includeExample: true
  });

  assert.strictEqual(defaultRuntime.layout.display.numberLineFullContentWidth, true);
  const defaultGeometry = defaultRuntime.contentObject.content.items.map((item) =>
    numberLineGeometry(defaultRuntime, item)
  );
  const completedGeometry = completedRuntime.contentObject.content.items.map((item) =>
    numberLineGeometry(completedRuntime, item)
  );
  const answerKeyDisplay = { ...defaultRuntime.layout.display, answerKey: true };
  const answerKeyGeometry = buildAnswerKeyItems(defaultRuntime.contentObject.content.items).map((item) =>
    numberLineGeometry(defaultRuntime, item, answerKeyDisplay)
  );

  [...defaultGeometry, ...completedGeometry, ...answerKeyGeometry].forEach((geometry) => {
    assert.strictEqual(geometry.left, contentBox.x);
    assert.strictEqual(geometry.right, rightBoundary);
    assert.strictEqual(geometry.width, contentBox.width);
    assert.strictEqual(geometry.mapValue(0), contentBox.x);
    assert.strictEqual(geometry.mapValue(20), rightBoundary);
    assert.strictEqual(geometry.stepWidth, contentBox.width / 20);
  });
  assert.strictEqual(new Set(defaultGeometry.map((geometry) => geometry.width)).size, 1);
  assert.strictEqual(new Set(completedGeometry.map((geometry) => geometry.width)).size, 1);
  assert.deepStrictEqual(
    answerKeyGeometry.map((geometry) => geometry.width),
    defaultGeometry.map((geometry) => geometry.width)
  );
  assert.deepStrictEqual(
    completedGeometry.map((geometry) => geometry.width),
    defaultGeometry.map((geometry) => geometry.width)
  );

  [defaultRuntime, completedRuntime].forEach((runtime) => {
    runtime.contentObject.content.items.forEach((item) => {
      const geometry = numberLineGeometry(runtime, item);
      const startX = geometry.mapValue(item.visual.data.additionStart);
      const landingX = geometry.mapValue(item.visual.data.additionLanding);
      assert(startX >= geometry.left && startX < landingX);
      assert(landingX <= geometry.right);
      assertNearlyEqual(
        landingX - startX,
        item.visual.data.additionJump * geometry.stepWidth
      );
    });
  });

  const rightEdgeRuntime = runtimeFor({
    worksheetSeed: "g1-addition-number-line-right-edge",
    selectedStarts: [10],
    selectedJumps: [10],
    questionCount: 1
  });
  const rightEdgeItem = rightEdgeRuntime.contentObject.content.items[0];
  assert.strictEqual(rightEdgeItem.prompt, "10 + 10 = ___");
  assert.strictEqual(rightEdgeItem.total, 20);
  assert.strictEqual(numberLineGeometry(rightEdgeRuntime, rightEdgeItem).mapValue(20), rightBoundary);

  const shortJumpRuntime = runtimeFor({
    worksheetSeed: "g1-addition-number-line-short-jump",
    selectedStarts: [0],
    selectedJumps: [1],
    questionCount: 1
  });
  const shortJumpItem = shortJumpRuntime.contentObject.content.items[0];
  const shortGeometry = numberLineGeometry(shortJumpRuntime, shortJumpItem);
  assert.strictEqual(shortJumpItem.visual.data.additionJump, 1);
  assertNearlyEqual(
    shortGeometry.mapValue(shortJumpItem.total) - shortGeometry.mapValue(shortJumpItem.a),
    shortGeometry.stepWidth
  );
}

function assertDefaultContract() {
  const catalogItem = getAnyWorksheetCatalogById(RESOURCE_ID);
  assert(catalogItem);
  assert.strictEqual(catalogItem.id, RESOURCE_ID);
  assert.strictEqual(catalogItem.status, "partial");
  assert.deepStrictEqual(catalogItem.activityTypes, ["addition_number_line"]);

  const runtime = runtimeFor({ worksheetSeed: "g1-addition-number-line-default-test" });
  const items = runtime.contentObject.content.items;
  assert.strictEqual(runtime.layout.header.title, "Addition on a Number Line");
  assert.strictEqual(runtime.layout.instruction, "Use the number line to solve each addition question.");
  assert.strictEqual(runtime.layout.header.subtitle || "", "");
  assert.strictEqual(runtime.layout.display.hideSubtitle, true);
  assert.strictEqual(runtime.layout.display.numberLineAddition, true);
  assert.strictEqual(runtime.layout.display.numberLineFullContentWidth, true);
  assert.strictEqual(runtime.layout.display.hideItemPrompts, false);
  assert.strictEqual(runtime.layout.template.columns, 1);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 6);
  assert.strictEqual(items.length, 6);
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, EXPECTED_FOOTER);
  assert(!EXPECTED_FOOTER.includes("addition_strategies"));
  assert.strictEqual(new Set(items.map((item) => item.duplicateSignature)).size, 6);
  assert(!Object.prototype.hasOwnProperty.call(runtime.layout, "overflow"));

  items.forEach((item, index) => {
    const data = item.visual?.data;
    assert.strictEqual(item.id, index + 1);
    assert(/^\d+ \+ \d+ = ___$/.test(item.prompt));
    assert(!item.prompt.includes("Use the number line"));
    assert.strictEqual(item.responseMode, "addition_number_line");
    assert.strictEqual(item.op, "+");
    assert.strictEqual(item.operation, "addition");
    assert.strictEqual(item.a, item.firstAddend);
    assert.strictEqual(item.b, item.secondAddend);
    assert.strictEqual(item.a + item.b, item.total);
    assert.strictEqual(item.answer, item.total);
    assert(item.a >= 0 && item.a <= 10);
    assert(item.b >= 1 && item.b <= 10);
    assert(item.total >= 1 && item.total <= 20);
    assert.strictEqual(item.visual.kind, "number_line");
    assert.strictEqual(data.min, 0);
    assert.strictEqual(data.max, 20);
    assert.strictEqual(data.additionStart, item.a);
    assert.strictEqual(data.additionJump, item.b);
    assert.strictEqual(data.additionLanding, item.total);
    assert.strictEqual(data.additionDirection, "forward");
    assert(data.additionLanding > data.additionStart);
    assert.strictEqual(data.additionLanding - data.additionStart, data.additionJump);
    assert.strictEqual(data.hideValueLabel, true);
  });
}

function assertCompletedQuestionOne() {
  const runtime = runtimeFor({
    worksheetSeed: "g1-addition-number-line-completed-test",
    includeExample: true
  });
  const items = runtime.contentObject.content.items;
  assert.strictEqual(items.length, 6);
  assert.strictEqual(items[0].id, 1);
  assert.strictEqual(items[0].isExample, true);
  assert.strictEqual(items[1].id, 2);
  assert.strictEqual(items[1].isExample, false);
  assert.strictEqual(runtime.layout.display.exampleCountsAsQuestion, true);
  assert.strictEqual(runtime.layout.display.suppressExampleLabel, true);
  assert.notStrictEqual(runtime.layout.header.title, "Example");
}

function assertDeterminismAndNoMutation() {
  const options = {
    worksheetSeed: "g1-addition-number-line-same-seed",
    selectedStarts: [2, 4, 6],
    selectedJumps: [1, 3],
    includeExample: true
  };
  const before = JSON.stringify(options);
  assert.deepStrictEqual(signature(runtimeFor(options)), signature(runtimeFor(options)));
  assert.strictEqual(JSON.stringify(options), before);
}

function assertGrade2PlusRegression() {
  const runtime = buildCatalogWorksheetRuntime(
    "grade2_place_value_representation_number_line_identify",
    { worksheetSeed: "grade2-number-line-regression", questionCount: 4 }
  );
  assert.strictEqual(runtime.item.activityTypes[0], "number_line_identify");
  assert.strictEqual(Boolean(runtime.layout.display.numberLineAddition), false);
  assert.strictEqual(Boolean(runtime.layout.display.numberLineFullContentWidth), true);
  assert.strictEqual(runtime.contentObject.content.items.length, 6);
  runtime.contentObject.content.items.forEach((item) => {
    assert.strictEqual(item.prompt, "");
    assert.strictEqual(item.visual.kind, "number_line");
    assert([1, 2, 5, 10].includes(item.visual.data.interval));
    assert.strictEqual(item.visual.data.tickCount, 10);
    assert.strictEqual(item.visual.data.additionDirection, undefined);
  });
}

async function assertPdfAndAnswerKeyParity() {
  const runtime = runtimeFor({
    worksheetSeed: "g1-addition-number-line-pdf",
    includeExample: true
  });
  const answerKeyItems = buildAnswerKeyItems(runtime.contentObject.content.items);
  assert.strictEqual(answerKeyItems.length, 6);
  answerKeyItems.forEach((item, index) => {
    const source = runtime.contentObject.content.items[index];
    assert.strictEqual(item.id, source.id);
    assert.strictEqual(item.answer, source.answer);
    assert.deepStrictEqual(item.visual, source.visual);
  });

  const normalized = runtime.normalizedContentObject.content.items[0];
  assert.strictEqual(normalized.visual.data.additionDirection, "forward");
  assert.strictEqual(normalized.visual.data.additionLanding, normalized.total);

  const student = await renderRuntime(runtime, false);
  const withKey = await renderRuntime(runtime, true);
  assert(student.length > 1000);
  assert(withKey.length > student.length);
  assert.strictEqual(pageCount(student), 1);
  assert.strictEqual(pageCount(withKey), 2);
}

async function run() {
  assertDefaultContract();
  assertFullWidthGeometry();
  assertCompletedQuestionOne();
  assertDeterminismAndNoMutation();
  assertGrade2PlusRegression();
  await assertPdfAndAnswerKeyParity();
  console.log("Grade 1 Addition on a Number Line checks passed.");
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
