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
  buildAnswerKeyItems
} = require("../renderers/pdfRenderer");

const SKIP_ID = "grade1_multiplication_facts_skip_counting";
const EXPANDED_ID = "grade1_place_value_representation_expanded_form";

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

function runtimeFor(id, options = {}) {
  return buildCatalogWorksheetRuntime(id, options);
}

function signature(runtime) {
  return runtime.contentObject.content.items.map((item) => ({
    prompt: item.prompt,
    answer: item.answer,
    value: item.value,
    sequence: item.sequence,
    missingIndexes: item.missingIndexes,
    step: item.step,
    isExample: item.isExample
  }));
}

function assertSameSeed(id, options) {
  assert.deepStrictEqual(signature(runtimeFor(id, options)), signature(runtimeFor(id, options)));
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
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
        filename: `${runtime.item.id}.pdf`,
        disposition: "inline",
        includeAnswerKey
      }
    });
  });
}

function assertCatalogContract(id) {
  const item = getAnyWorksheetCatalogById(id);
  assert(item, `${id} must remain available through the catalog runtime.`);
  assert.strictEqual(item.id, id);
  assert.strictEqual(item.status, "generated");
  assert.strictEqual(item.grades[0], "grade1");
  assert.strictEqual(item.hasAnswerKey, true);
}

function assertSharedDisplay(runtime, expected) {
  assert.strictEqual(runtime.layout.header.title, expected.title);
  assert.strictEqual(runtime.layout.instruction, expected.instruction);
  assert.strictEqual(runtime.layout.header.subtitle || "", "");
  assert.strictEqual(runtime.layout.display.hideSubtitle, true);
  assert.strictEqual(runtime.layout.template.columns, expected.columns);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, expected.capacity);
  assert.strictEqual(runtime.contentObject.content.items.length, expected.count);
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, expected.footer);
  for (const slug of ["multiplication_facts", "place_value_representation"]) {
    assert(!runtime.contentObject.meta.curriculum.footerText.includes(slug));
  }
  assert(!Object.prototype.hasOwnProperty.call(runtime.layout, "overflow"));
}

function assertSkipCounting() {
  assertCatalogContract(SKIP_ID);
  const runtime = runtimeFor(SKIP_ID, { worksheetSeed: "g1-category-c-skip-default" });
  assertSharedDisplay(runtime, {
    title: "Skip Counting",
    instruction: "Write the missing numbers in each skip-counting pattern.",
    columns: 1,
    capacity: 10,
    count: 8,
    footer: "Grade 1 • Math • Number Patterns"
  });
  assert.strictEqual(runtime.layout.display.skipCountingRow, true);
  assert.strictEqual(runtime.layout.display.skipCountingArrows, true);

  const items = runtime.contentObject.content.items;
  const steps = items.map((item) => item.step);
  assert.deepStrictEqual([...new Set(steps)].sort((a, b) => a - b), [1, 2, 5, 10]);
  items.forEach((item, index) => {
    assert.strictEqual(item.id, index + 1);
    assert([1, 2, 5, 10].includes(item.step));
    assert.strictEqual(item.sequence.length, 6);
    assert.strictEqual(item.missingIndexes.length, 1);
    assert(item.sequence.filter(Number.isFinite).every((value) => value >= 0 && value <= 50));
    assert([item.answer].flat().every((value) => value >= 0 && value <= 50));
  });

  const completed = runtimeFor(SKIP_ID, {
    worksheetSeed: "g1-category-c-skip-completed-q1",
    includeExample: true
  });
  assert.strictEqual(completed.contentObject.content.items.length, 8);
  assert.strictEqual(completed.contentObject.content.items[0].id, 1);
  assert.strictEqual(completed.contentObject.content.items[0].isExample, true);
  assert.strictEqual(completed.contentObject.content.items[1].id, 2);
  assert.strictEqual(completed.layout.display.exampleCountsAsQuestion, true);
  assert.strictEqual(completed.layout.display.suppressExampleLabel, true);
  assert.strictEqual(completed.layout.display.skipCountingRow, true);
}

function assertExpandedForm() {
  assertCatalogContract(EXPANDED_ID);
  const runtime = runtimeFor(EXPANDED_ID, { worksheetSeed: "g1-category-c-expanded-default" });
  assertSharedDisplay(runtime, {
    title: "Expanded Form",
    instruction: "Write each numeral in expanded form.",
    columns: 3,
    capacity: 18,
    count: 18,
    footer: "Grade 1 • Math • Number Sense"
  });
  assert.strictEqual(runtime.layout.display.compactExpandedForm, true);
  assert.strictEqual(runtime.layout.display.denseGridRows, 6);

  const items = runtime.contentObject.content.items;
  assert.strictEqual(new Set(items.map((item) => item.value)).size, 18);
  items.forEach((item, index) => {
    assert.strictEqual(item.id, index + 1);
    assert(item.value >= 10 && item.value <= 50);
    assert.strictEqual(item.prompt, String(item.value));
    const tens = Math.floor(item.value / 10) * 10;
    const ones = item.value % 10;
    assert.strictEqual(item.answer, ones ? `${tens} + ${ones}` : String(tens));
  });

  const completed = runtimeFor(EXPANDED_ID, {
    worksheetSeed: "g1-category-c-expanded-completed-q1-1",
    includeExample: true
  });
  assert.strictEqual(completed.contentObject.content.items.length, 18);
  assert.strictEqual(completed.contentObject.content.items[0].id, 1);
  assert.strictEqual(completed.contentObject.content.items[0].isExample, true);
  assert(String(completed.contentObject.content.items[0].answer).includes(" + "));
  assert.strictEqual(completed.contentObject.content.items[1].id, 2);
  assert.strictEqual(completed.layout.display.exampleCountsAsQuestion, true);
  assert.strictEqual(completed.layout.display.suppressExampleLabel, true);
}

function assertNoInputMutation() {
  for (const [id, options] of [
    [SKIP_ID, { selectedSteps: [2, 5], termCount: 5, includeExample: true }],
    [EXPANDED_ID, { minA: 20, maxA: 30, questionCount: 8, includeExample: true }]
  ]) {
    const before = JSON.stringify(options);
    runtimeFor(id, options);
    assert.strictEqual(JSON.stringify(options), before);
  }
}

function assertSharedFamiliesUnchanged() {
  const skip = runtimeFor("g2_skip_counting_by_2", {
    worksheetSeed: "g2-skip-family-regression",
    questionCount: 4
  });
  skip.contentObject.content.items.forEach((item) => assert.strictEqual(item.step, 2));

  const expanded = runtimeFor("grade3_place_value_representation_expanded_form", {
    worksheetSeed: "g3-expanded-family-regression"
  });
  assert.strictEqual(expanded.contentObject.content.items.length, 45);
  expanded.contentObject.content.items.forEach((item) => {
    assert(item.value >= 100 && item.value <= 999);
  });
}

async function assertPdfParity(id, count) {
  const runtime = runtimeFor(id, {
    worksheetSeed: `${id}-pdf-parity`,
    includeExample: true
  });
  const keyItems = buildAnswerKeyItems(runtime.contentObject.content.items);
  assert.strictEqual(keyItems.length, count);
  keyItems.forEach((item, index) => {
    assert.strictEqual(item.id, runtime.contentObject.content.items[index].id);
    assert.deepStrictEqual(item.answer, runtime.contentObject.content.items[index].answer);
  });
  const student = await renderRuntime(runtime, false);
  const answerKey = await renderRuntime(runtime, true);
  assert(student.length > 1000);
  assert(answerKey.length > student.length);
  assert.strictEqual(pageCount(student), 1);
  assert.strictEqual(pageCount(answerKey), 2);
}

async function run() {
  assertSkipCounting();
  assertExpandedForm();
  assertSameSeed(SKIP_ID, { worksheetSeed: "g1-skip-same-seed", includeExample: true });
  assertSameSeed(EXPANDED_ID, { worksheetSeed: "g1-expanded-same-seed", includeExample: true });
  assertNoInputMutation();
  assertSharedFamiliesUnchanged();

  const previewRoutes = fs.readFileSync(
    path.join(__dirname, "..", "routes", "worksheetPreviewRoutes.js"),
    "utf8"
  );
  const pdfRoutes = fs.readFileSync(
    path.join(__dirname, "..", "routes", "worksheetPdfRoutes.js"),
    "utf8"
  );
  assert(previewRoutes.includes('/api/catalog-preview/:id'));
  assert(pdfRoutes.includes('/api/catalog-pdf/:id'));

  await assertPdfParity(SKIP_ID, 8);
  await assertPdfParity(EXPANDED_ID, 18);
  console.log("Grade 1 Category C closure checks passed.");
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
