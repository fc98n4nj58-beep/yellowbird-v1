const assert = require("assert");
const { Writable } = require("stream");

const {
  buildCatalogWorksheetRuntime
} = require("../services/catalogWorksheetRuntimeService");
const {
  renderWorksheetPDF,
  buildAnswerKeyItems
} = require("../renderers/pdfRenderer");

const FOOTER = "Grade 3 • Math • Patterning & Algebra";
const SPECS = Object.freeze({
  grade3_patterning_and_algebra_extend_pattern: Object.freeze({
    title: "Extend the Pattern",
    instruction: "Extend each pattern. Write the next number.",
    layout: "extend_pattern",
    studentPages: 1,
    totalPdfPages: 2
  }),
  grade3_patterning_and_algebra_identify_pattern_rule: Object.freeze({
    title: "Identify the Pattern Rule",
    instruction: "Write the rule for each pattern.",
    layout: "identify_pattern_rule",
    studentPages: 2,
    totalPdfPages: 4
  }),
  grade3_patterning_and_algebra_missing_value_pattern: Object.freeze({
    title: "Find the Missing Number",
    instruction: "Write the missing number in each pattern.",
    layout: "missing_value_pattern",
    studentPages: 1,
    totalPdfPages: 2
  })
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

function itemTruth(runtime) {
  return runtime.contentObject.content.items.map((item) => ({
    id: item.id,
    prompt: item.prompt,
    answer: item.answer,
    sequence: item.sequence,
    responseValues: item.responseValues,
    missingIndexes: item.missingIndexes,
    continuationAnswers: item.continuationAnswers,
    patternOperation: item.patternOperation,
    step: item.step,
    isExample: item.isExample
  }));
}

function renderPdf(runtime) {
  return new Promise((resolve, reject) => {
    const res = new BufferResponse();
    res.once("finish", () => resolve(res.toBuffer()));
    res.once("error", reject);
    renderWorksheetPDF({
      res,
      contentObject: runtime.contentObject,
      layoutObject: runtime.layout,
      options: {
        filename: "grade3-numeric-patterning-batch1-test.pdf",
        includeAnswerKey: true
      }
    });
  });
}

function pdfPageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function assertPublicCopy(runtime, resourceId, spec) {
  assert.strictEqual(runtime.layout.header.title, spec.title);
  assert.strictEqual(runtime.contentObject.meta.title, spec.title);
  assert.strictEqual(runtime.layout.header.subtitle, "");
  assert.strictEqual(runtime.layout.instruction, spec.instruction);
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, FOOTER);
  assert(!spec.title.includes("— Grade 3"));

  const publicText = [
    runtime.contentObject.meta.title,
    runtime.contentObject.meta.subheading,
    runtime.contentObject.meta.curriculum.footerText,
    runtime.layout.instruction,
    ...runtime.contentObject.content.items.map((item) => item.prompt)
  ].join(" ");

  assert(!publicText.includes(resourceId), `${resourceId} leaked its internal ID`);
  assert(!publicText.includes("patterning_and_algebra"), `${resourceId} leaked its skill slug`);
  assert(!publicText.includes("— Grade 3"), `${resourceId} retained its grade suffix`);
  runtime.contentObject.content.items.forEach((item) => {
    assert(!item.prompt.includes(spec.instruction), `${resourceId} repeats the worksheet instruction`);
    assert(!/Extend each pattern|Write the rule for each pattern|Write the missing number in each pattern/.test(item.prompt));
  });
}

function assertAnswerKeyParity(runtime) {
  const studentItems = runtime.contentObject.content.items;
  const answerItems = buildAnswerKeyItems(studentItems);
  assert.strictEqual(answerItems.length, studentItems.length);
  answerItems.forEach((answerItem, index) => {
    const studentItem = studentItems[index];
    assert.strictEqual(answerItem.id, studentItem.id);
    assert.deepStrictEqual(answerItem.answer, studentItem.answer);
    assert.deepStrictEqual(answerItem.sequence, studentItem.sequence);
    assert.deepStrictEqual(answerItem.responseValues, studentItem.responseValues);
    assert.deepStrictEqual(answerItem.missingIndexes, studentItem.missingIndexes);
    assert.deepStrictEqual(answerItem.continuationAnswers, studentItem.continuationAnswers);
  });
}

async function testDefaultContracts() {
  for (const [resourceId, spec] of Object.entries(SPECS)) {
    const query = { worksheetSeed: "grade3-batch1-default" };
    const runtime = buildCatalogWorksheetRuntime(resourceId, query);
    const repeat = buildCatalogWorksheetRuntime(resourceId, query);
    const beforeRender = itemTruth(runtime);

    assert.strictEqual(runtime.item.status, "ready");
    assertPublicCopy(runtime, resourceId, spec);
    assert.strictEqual(runtime.layout.display.patterningLayout, spec.layout);
    assert.strictEqual(runtime.contentObject.content.items.length, 12);
    assert(runtime.contentObject.content.items.every((item) => !item.isExample));
    assert.deepStrictEqual(itemTruth(runtime), itemTruth(repeat));
    assertAnswerKeyParity(runtime);

    const pdf = await renderPdf(runtime);
    assert.strictEqual(pdfPageCount(pdf), spec.totalPdfPages);
    assert.strictEqual(runtime.layout.patterningPagination.pageCount, spec.studentPages);
    assert.deepStrictEqual(itemTruth(runtime), beforeRender, "PDF rendering must not change preview truth");
  }
}

function assertFixedArithmetic(runtime, { operation, start, step, length }) {
  runtime.contentObject.content.items.forEach((item) => {
    assert.strictEqual(item.patternOperation, operation);
    assert.strictEqual(item.step, step);
    assert.strictEqual(item.sequence.length, length);
    const visibleValues = item.sequence.filter((value) => value !== null);
    assert.strictEqual(visibleValues[0], start);
  });
}

function testVariableContracts() {
  const fixedExtend = buildCatalogWorksheetRuntime("grade3_patterning_and_algebra_extend_pattern", {
    worksheetSeed: "grade3-batch1-fixed-extend",
    questionCount: 4,
    operationMode: "subtract",
    startingValue: 60,
    sequenceStep: 4
  });
  assert.strictEqual(fixedExtend.contentObject.content.items.length, 4);
  assertFixedArithmetic(fixedExtend, { operation: "subtract", start: 60, step: 4, length: 5 });

  const rangedRule = buildCatalogWorksheetRuntime("grade3_patterning_and_algebra_identify_pattern_rule", {
    worksheetSeed: "grade3-batch1-ranged-rule",
    questionCount: 10,
    operationMode: "add",
    minStart: 12,
    maxStart: 16,
    minStep: 2,
    maxStep: 3,
    sequenceLength: 6
  });
  rangedRule.contentObject.content.items.forEach((item) => {
    assert.strictEqual(item.patternOperation, "add");
    assert(item.sequence[0] >= 12 && item.sequence[0] <= 16);
    assert(item.step >= 2 && item.step <= 3);
    assert.strictEqual(item.sequence.length, 6);
  });

  const missing = buildCatalogWorksheetRuntime("grade3_patterning_and_algebra_missing_value_pattern", {
    worksheetSeed: "grade3-batch1-missing",
    questionCount: 7,
    sequenceLength: 7,
    missingTermCount: 2,
    missingTermPlacement: "end"
  });
  assert.strictEqual(missing.contentObject.content.items.length, 7);
  missing.contentObject.content.items.forEach((item) => {
    assert.strictEqual(item.sequence.length, 7);
    assert.deepStrictEqual(item.missingIndexes, [5, 6]);
    assert.strictEqual(item.missingTermPlacement, "end");
  });

  const placementAlias = buildCatalogWorksheetRuntime("grade3_patterning_and_algebra_missing_value_pattern", {
    worksheetSeed: "grade3-batch1-placement-alias",
    questionCount: 3,
    missingPlacement: "beginning"
  });
  placementAlias.contentObject.content.items.forEach((item) => {
    assert.deepStrictEqual(item.missingIndexes, [0]);
    assert.strictEqual(item.missingTermPlacement, "beginning");
  });

  [
    { includeExample: true },
    { completedExample: true },
    { example: true }
  ].forEach((exampleOption, index) => {
    const runtime = buildCatalogWorksheetRuntime("grade3_patterning_and_algebra_extend_pattern", {
      worksheetSeed: `grade3-batch1-example-${index}`,
      questionCount: 12,
      ...exampleOption
    });
    assert.strictEqual(runtime.contentObject.content.items.length, 13);
    assert.strictEqual(runtime.contentObject.content.items.filter((item) => item.isExample).length, 1);
    assert.strictEqual(runtime.contentObject.content.items.slice(1).filter((item) => !item.isExample).length, 12);
  });
}

function testGradeIsolation() {
  const grade1 = buildCatalogWorksheetRuntime("grade1_patterning_and_algebra_extend_pattern", {
    worksheetSeed: "grade3-batch1-grade1-isolation"
  });
  const grade2 = buildCatalogWorksheetRuntime("grade2_patterning_and_algebra_identify_pattern_rule", {
    worksheetSeed: "grade3-batch1-grade2-isolation"
  });

  assert.strictEqual(grade1.layout.header.title, "Extend Pattern — Grade 1");
  assert.strictEqual(grade1.layout.instruction, "Extend each pattern. Write the next number.");
  assert.strictEqual(grade2.layout.header.title, "Identify Pattern Rule");
  assert.strictEqual(grade2.layout.instruction, "Write the number that is added each time.");
  assert.strictEqual(grade2.contentObject.meta.curriculum.footerText, "Grade 2 • Math • Patterning & Algebra");
}

async function run() {
  await testDefaultContracts();
  testVariableContracts();
  testGradeIsolation();
  console.log("Grade 3 Numeric Patterning Batch 1 tests passed.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
