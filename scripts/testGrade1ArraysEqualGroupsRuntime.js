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
const {
  MULTIPLICATION_SYMBOL
} = require("../engine/problemGenerators/multiplicationModelConstants");

const ARRAYS_ID = "grade1_multiplication_facts_arrays";
const EQUAL_GROUPS_ID = "grade1_multiplication_facts_equal_groups";
const EXPECTED_FOOTER = "Grade 1 • Math • Early Multiplication Thinking";
const INTERNAL_FOOTER_SLUGS = ["multiplication_facts", "visual_models", "model_interpretation"];

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
    values: item.responseValues,
    visual: item.visual,
    isExample: item.isExample
  }));
}

function assertSameSeed(id, options) {
  assert.deepStrictEqual(signature(runtimeFor(id, options)), signature(runtimeFor(id, options)));
}

function renderRuntimePdf(runtime, includeAnswerKey = true) {
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

function pageCount(buffer) {
  const pages = buffer.toString("latin1").match(/\/Type\s*\/Page\b/g);
  return pages ? pages.length : 0;
}

function canonicalEquationText(item) {
  const [first, second, total] = item.responseValues;
  return `${first} ${item.responseOperator} ${second} = ${total}`;
}

function assertSharedGrade1Contract(id, expected) {
  const catalogItem = getAnyWorksheetCatalogById(id);
  assert(catalogItem, `${id} must exist in the master catalog.`);
  assert.strictEqual(catalogItem.status, "generated");
  assert.strictEqual(catalogItem.grades[0], "grade1");
  assert.strictEqual(catalogItem.hasAnswerKey, true);

  const runtime = runtimeFor(id, { worksheetSeed: `${id}-default` });
  const items = runtime.contentObject.content.items;
  assert.strictEqual(runtime.layout.header.title, expected.title);
  assert.strictEqual(runtime.layout.instruction, expected.instruction);
  assert.strictEqual(runtime.layout.header.subtitle || "", "");
  assert.strictEqual(runtime.layout.display.hideSubtitle, true);
  assert.strictEqual(runtime.layout.template.columns, 2);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 8);
  assert.strictEqual(items.length, 8);
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, EXPECTED_FOOTER);
  INTERNAL_FOOTER_SLUGS.forEach((slug) => {
    assert(!runtime.contentObject.meta.curriculum.footerText.includes(slug));
  });

  const signatures = items.map((item) => item.responseValues.join(":"));
  assert.strictEqual(new Set(signatures).size, 8);
  items.forEach((item, index) => {
    const [first, second, total] = item.responseValues;
    assert.strictEqual(item.id, index + 1);
    assert.strictEqual(item.prompt, "");
    assert.strictEqual(item.responseMode, "multiplication_sentence");
    assert.strictEqual(item.responseOperator, MULTIPLICATION_SYMBOL);
    assert(canonicalEquationText(item).includes(" × "));
    assert(!canonicalEquationText(item).includes(" x "));
    assert.strictEqual(item.showQuestionSentence, false);
    assert(first >= 2 && first <= 5);
    assert(second >= 2 && second <= 5);
    assert(total <= 10);
    assert.strictEqual(first * second, total);
    assert.strictEqual(item.answer, total);
    assert.strictEqual(item.visual.kind, expected.visualKind);
    assert.strictEqual(item.visual.data.orientation, expected.orientation);
    assert.strictEqual(item.orientation, expected.orientation);
  });

  return runtime;
}

function assertArrayMetadata() {
  const runtime = assertSharedGrade1Contract(ARRAYS_ID, {
    title: "Arrays",
    instruction: "Use each array to complete the number sentence.",
    visualKind: "array",
    orientation: "rows_columns"
  });

  runtime.contentObject.content.items.forEach((item) => {
    const [rows, cols, total] = item.responseValues;
    assert.strictEqual(item.visual.data.rows, rows);
    assert.strictEqual(item.visual.data.cols, cols);
    assert.strictEqual(item.visual.data.product, total);
  });

  assert.strictEqual(runtime.layout.display.multiplicationModelConvention, "rows_columns");
  assert.strictEqual(runtime.layout.display.arrayModelGutter, 18);
}

function assertEqualGroupsMetadata() {
  const runtime = assertSharedGrade1Contract(EQUAL_GROUPS_ID, {
    title: "Equal Groups",
    instruction: "Count the groups and the objects in each group. Complete the number sentence.",
    visualKind: "equal_groups",
    orientation: "groups_items"
  });

  runtime.contentObject.content.items.forEach((item) => {
    const [groups, itemsPerGroup, total] = item.responseValues;
    assert.strictEqual(item.visual.data.groups, groups);
    assert.strictEqual(item.visual.data.itemsPerGroup, itemsPerGroup);
    assert.strictEqual(item.visual.data.product, total);
  });

  assert.strictEqual(runtime.layout.display.multiplicationModelConvention, "groups_items");
}

function assertCompletedQuestionOne(id) {
  const runtime = runtimeFor(id, {
    worksheetSeed: `${id}-completed-q1`,
    includeExample: true
  });
  const items = runtime.contentObject.content.items;
  assert.strictEqual(items.length, 8);
  assert.strictEqual(items[0].id, 1);
  assert.strictEqual(items[0].isExample, true);
  assert.strictEqual(items[0].responseOperator, MULTIPLICATION_SYMBOL);
  assert(canonicalEquationText(items[0]).includes(" × "));
  assert(!canonicalEquationText(items[0]).includes(" x "));
  assert.strictEqual(items[1].id, 2);
  assert.strictEqual(items[1].isExample, false);
  assert.strictEqual(runtime.layout.display.exampleCountsAsQuestion, true);
  assert.strictEqual(runtime.layout.display.suppressExampleLabel, true);
  assert.strictEqual(runtime.layout.display.completedExampleAnswerOnlyEmphasis, true);
  assert.notStrictEqual(runtime.layout.header.title, "Example");
}

function assertOverridesAndRepetition(id) {
  const kind = id === ARRAYS_ID ? "array" : "equal_groups";
  const optionNames = id === ARRAYS_ID
    ? { minRows: 1, maxRows: 2, minCols: 1, maxCols: 2 }
    : { minGroups: 1, maxGroups: 2, minItemsPerGroup: 1, maxItemsPerGroup: 2 };
  const extended = runtimeFor(id, {
    ...optionNames,
    maxTotal: 4,
    questionCount: 6,
    worksheetSeed: `${id}-factor-one`
  });
  const pairs = extended.contentObject.content.items.map((item) => item.responseValues.slice(0, 2).join(":"));
  assert(pairs.some((pair) => pair.startsWith("1:") || pair.endsWith(":1")));
  assert.strictEqual(new Set(pairs.slice(0, 4)).size, 4);
  assert.strictEqual(new Set(pairs).size, 4);
  extended.contentObject.content.items.forEach((item) => {
    assert.strictEqual(item.visual.kind, kind);
    assert(item.responseValues[2] <= 4);
  });
}

function assertSharedGrade2PlusSymbol() {
  for (const id of [
    "grade2_multiplication_facts_arrays",
    "grade3_multiplication_facts_equal_groups"
  ]) {
    const runtime = runtimeFor(id, {
      questionCount: 3,
      worksheetSeed: `${id}-multiplication-symbol`
    });
    runtime.contentObject.content.items.forEach((item) => {
      assert.strictEqual(item.responseOperator, MULTIPLICATION_SYMBOL);
      assert(canonicalEquationText(item).includes(" × "));
      assert(!canonicalEquationText(item).includes(" x "));
    });
  }
}

function assertGrade1TaskModeIsStable(id) {
  const runtime = runtimeFor(id, {
    responseMode: "total_only",
    showQuestionSentence: true,
    worksheetSeed: `${id}-stable-task-mode`
  });
  assert.strictEqual(runtime.layout.display.multiplicationModelEquation, true);
  assert.strictEqual(Boolean(runtime.layout.display.multiplicationModelTotalOnly), false);
  runtime.contentObject.content.items.forEach((item) => {
    assert.strictEqual(item.responseMode, "multiplication_sentence");
    assert.strictEqual(item.showQuestionSentence, false);
    assert.strictEqual(item.prompt, "");
  });
}

async function run() {
  assertArrayMetadata();
  assertEqualGroupsMetadata();
  assertCompletedQuestionOne(ARRAYS_ID);
  assertCompletedQuestionOne(EQUAL_GROUPS_ID);
  assertSameSeed(ARRAYS_ID, { worksheetSeed: "arrays-deterministic", includeExample: true });
  assertSameSeed(EQUAL_GROUPS_ID, { worksheetSeed: "groups-deterministic", includeExample: true });
  assertOverridesAndRepetition(ARRAYS_ID);
  assertOverridesAndRepetition(EQUAL_GROUPS_ID);
  assertGrade1TaskModeIsStable(ARRAYS_ID);
  assertGrade1TaskModeIsStable(EQUAL_GROUPS_ID);
  assertSharedGrade2PlusSymbol();

  const rendererSource = fs.readFileSync(
    path.join(__dirname, "..", "renderers", "pdfRenderer.js"),
    "utf8"
  );
  assert(rendererSource.includes("isExample && !display.suppressExampleLabel"));
  assert(rendererSource.includes("options.operator || MULTIPLICATION_SYMBOL"));
  assert(!rendererSource.includes('const symbols = ["x", "="]'));

  for (const id of [ARRAYS_ID, EQUAL_GROUPS_ID]) {
    const runtime = runtimeFor(id, {
      worksheetSeed: `${id}-pdf`,
      includeExample: true
    });
    const answerKeyItems = buildAnswerKeyItems(runtime.contentObject.content.items);
    assert.strictEqual(answerKeyItems.length, 8);
    answerKeyItems.forEach((item) => {
      assert.strictEqual(item.responseOperator, MULTIPLICATION_SYMBOL);
      assert(canonicalEquationText(item).includes(" × "));
      assert(!canonicalEquationText(item).includes(" x "));
    });
    assert.strictEqual(runtime.normalizedContentObject.content.items[0].responseOperator, MULTIPLICATION_SYMBOL);
    const studentOnly = await renderRuntimePdf(runtime, false);
    const withAnswerKey = await renderRuntimePdf(runtime, true);
    assert(studentOnly.length > 1000);
    assert(withAnswerKey.length > studentOnly.length);
    assert.strictEqual(pageCount(studentOnly), 1);
    assert.strictEqual(pageCount(withAnswerKey), 2);
  }

  console.log("Grade 1 Arrays/Equal Groups runtime checks passed.");
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
