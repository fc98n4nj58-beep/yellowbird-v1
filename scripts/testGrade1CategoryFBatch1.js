const assert = require("assert");
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

const EQUATION_MATCH_ID = "grade1_addition_subtraction_facts_equation_match";
const DEFERRED_IDS = [
  "grade1_addition_subtraction_facts_missing_addend",
  "grade1_place_value_representation_compare_numbers"
];
const EXPECTED_TITLE = "Equal or Not Equal?";
const EXPECTED_INSTRUCTION = "Solve both sides. Write = if they have the same value. Write ≠ if they have different values.";
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
  return buildCatalogWorksheetRuntime(EQUATION_MATCH_ID, options);
}

function signature(runtime) {
  return runtime.contentObject.content.items.map((item) => ({
    prompt: item.prompt,
    answer: item.answer,
    leftValue: item.leftValue,
    rightValue: item.rightValue,
    expectedSymbol: item.expectedSymbol,
    comparisonResult: item.comparisonResult,
    isExample: item.isExample
  }));
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
        filename: "grade1-category-f-batch-1.pdf",
        disposition: "inline",
        includeAnswerKey
      }
    });
  });
}

function assertDistinctUseAndDefaultContract() {
  const catalogItem = getAnyWorksheetCatalogById(EQUATION_MATCH_ID);
  assert(catalogItem);
  assert.strictEqual(catalogItem.status, "generated");
  assert.deepStrictEqual(catalogItem.activityTypes, ["equation_match"]);
  assert.strictEqual(catalogItem.shortTitle, EXPECTED_TITLE);
  assert.strictEqual(catalogItem.studentInstruction, EXPECTED_INSTRUCTION);

  const runtime = runtimeFor({ worksheetSeed: "grade1-equation-match-default" });
  const items = runtime.contentObject.content.items;
  assert.strictEqual(runtime.layout.header.title, EXPECTED_TITLE);
  assert.strictEqual(runtime.layout.instruction, EXPECTED_INSTRUCTION);
  assert.strictEqual(runtime.layout.header.subtitle || "", "");
  assert.strictEqual(runtime.layout.display.hideSubtitle, true);
  assert.strictEqual(runtime.layout.display.standardShortAnswerTarget, true);
  assert.strictEqual(runtime.layout.display.answerTargetVariant, "comparisonSymbol");
  assert.strictEqual(runtime.layout.display.hideItemSeparators, true);
  assert.strictEqual(runtime.layout.template.columns, 2);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 20);
  assert.strictEqual(items.length, 20);
  assert(items.every((item) => !item.isExample));
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, EXPECTED_FOOTER);
  assert(!EXPECTED_FOOTER.includes("addition_subtraction_facts"));
  assert(!Object.prototype.hasOwnProperty.call(runtime.layout, "overflow"));

  const symbols = items.map((item) => item.expectedSymbol);
  assert.strictEqual(symbols.filter((symbol) => symbol === "=").length, 10);
  assert.strictEqual(symbols.filter((symbol) => symbol === "≠").length, 10);
  assert.strictEqual(new Set(items.map((item) => item.duplicateSignature)).size, 20);

  items.forEach((item, index) => {
    assert.strictEqual(item.id, index + 1);
    assert(/^\d+ \+ \d+\s+___\s+\d+ - \d+$/.test(item.prompt));
    assert(!item.prompt.includes("Write ="));
    assert.strictEqual(item.responseMode, "equation_equivalence");
    assert.deepStrictEqual(item.responseValues, [item.expectedSymbol]);
    assert(["=", "≠"].includes(item.answer));
    assert(item.leftValue >= 0 && item.leftValue <= 20);
    assert(item.rightValue >= 0 && item.rightValue <= 20);
    const subtraction = item.prompt.match(/___\s+(\d+) - (\d+)$/);
    assert(subtraction);
    assert(Number(subtraction[1]) >= Number(subtraction[2]));
    assert.strictEqual(item.answer, item.leftValue === item.rightValue ? "=" : "≠");
    assert.strictEqual(
      item.comparisonResult,
      item.leftValue === item.rightValue ? "equivalent" : "not_equivalent"
    );
  });
}

function assertCompletedQuestionsOneAndTwo() {
  const runtime = runtimeFor({
    worksheetSeed: "grade1-equation-match-completed-q1-q2",
    includeExample: true
  });
  const items = runtime.contentObject.content.items;
  assert.strictEqual(items.length, 20);
  assert.strictEqual(runtime.layout.header.title, EXPECTED_TITLE);
  assert.strictEqual(runtime.layout.instruction, EXPECTED_INSTRUCTION);
  assert.strictEqual(runtime.layout.template.columns, 2);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 20);
  assert.strictEqual(items[0].id, 1);
  assert.strictEqual(items[0].isExample, true);
  assert.strictEqual(items[0].leftValue, items[0].rightValue);
  assert.strictEqual(items[0].expectedSymbol, "=");
  assert.strictEqual(items[0].answer, "=");
  assert.strictEqual(items[1].id, 2);
  assert.strictEqual(items[1].isExample, true);
  assert.notStrictEqual(items[1].leftValue, items[1].rightValue);
  assert.strictEqual(items[1].expectedSymbol, "≠");
  assert.strictEqual(items[1].answer, "≠");
  items.slice(2).forEach((item) => assert.strictEqual(item.isExample, false));
  assert.strictEqual(runtime.layout.display.exampleCountsAsQuestion, true);
  assert.strictEqual(runtime.layout.display.suppressExampleLabel, true);
  assert.notStrictEqual(runtime.layout.header.title, "Example");
  assert(!runtime.layout.instruction.includes("Equation Match"));
}

function assertDeterminismAndNoMutation() {
  const options = {
    worksheetSeed: "grade1-equation-match-same-seed",
    minimumResult: 2,
    maximumResult: 15,
    includeExample: true
  };
  const before = JSON.stringify(options);
  assert.deepStrictEqual(signature(runtimeFor(options)), signature(runtimeFor(options)));
  assert.strictEqual(JSON.stringify(options), before);
}

function assertDeferredCandidatesUnchanged() {
  DEFERRED_IDS.forEach((id) => {
    const item = getAnyWorksheetCatalogById(id);
    assert(item);
    assert.strictEqual(item.status, "generated");
  });
  assert.deepStrictEqual(
    getAnyWorksheetCatalogById(DEFERRED_IDS[0]).activityTypes,
    ["missing_addend"]
  );
  assert.deepStrictEqual(
    getAnyWorksheetCatalogById(DEFERRED_IDS[1]).activityTypes,
    ["compare_numbers"]
  );
}

function assertGrade2PlusIsolation() {
  const runtime = buildCatalogWorksheetRuntime(
    "grade2_addition_subtraction_facts_equation_match",
    { worksheetSeed: "grade2-equation-match-regression", questionCount: 4 }
  );
  assert.strictEqual(runtime.contentObject.content.items.length, 12);
  runtime.contentObject.content.items.forEach((item) => {
    assert.strictEqual(item.responseMode, "equation_equivalence");
    assert(["=", "≠"].includes(item.expectedSymbol));
    assert(/^\d+ [+-] \d+\s+___\s+\d+ [+-] \d+$/.test(item.prompt));
    assert.strictEqual(item.answer, item.expectedSymbol);
    assert(item.leftValue <= 50 && item.rightValue <= 50);
  });
}

async function assertPdfAndAnswerKeyParity() {
  const runtime = runtimeFor({
    worksheetSeed: "grade1-equation-match-pdf",
    includeExample: true
  });
  const answerKeyItems = buildAnswerKeyItems(runtime.contentObject.content.items);
  assert.strictEqual(answerKeyItems.length, 20);
  answerKeyItems.forEach((item, index) => {
    const source = runtime.contentObject.content.items[index];
    assert.strictEqual(item.id, source.id);
    assert.strictEqual(item.answer, source.answer);
    assert.strictEqual(item.expectedSymbol, source.expectedSymbol);
    assert.strictEqual(item.leftValue, source.leftValue);
    assert.strictEqual(item.rightValue, source.rightValue);
  });
  assert.strictEqual(answerKeyItems[0].answer, "=");
  assert.strictEqual(answerKeyItems[1].answer, "≠");

  const student = await renderRuntime(runtime, false);
  const withKey = await renderRuntime(runtime, true);
  assert(student.length > 1000);
  assert(withKey.length > student.length);
  assert.strictEqual(pageCount(student), 1);
  assert.strictEqual(pageCount(withKey), 2);
}

async function run() {
  assertDistinctUseAndDefaultContract();
  assertCompletedQuestionsOneAndTwo();
  assertDeterminismAndNoMutation();
  assertDeferredCandidatesUnchanged();
  assertGrade2PlusIsolation();
  await assertPdfAndAnswerKeyParity();
  console.log("Grade 1 Category F Batch 1 checks passed; same-seed failures: 0.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
