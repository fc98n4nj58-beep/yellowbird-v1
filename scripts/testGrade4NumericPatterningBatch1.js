const assert = require("assert");
const { Writable } = require("stream");

const { getCustomizationFamilyForResource } = require("../config/worksheetCustomization");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF, buildAnswerKeyItems } = require("../renderers/pdfRenderer");

const FOOTER = "Grade 4 • Math • Patterning & Algebra";
const SPECS = Object.freeze({
  grade4_patterning_and_algebra_extend_pattern: Object.freeze({
    title: "Extend the Pattern",
    instruction: "Find the rule. Then write the next numbers in each pattern.",
    count: 12,
    perPage: 12,
    maxCount: 12,
    pdfPages: 2,
    mode: "extend_pattern"
  }),
  grade4_patterning_and_algebra_identify_pattern_rule: Object.freeze({
    title: "Identify the Pattern Rule",
    instruction: "Write the rule for each number pattern.",
    count: 10,
    perPage: 10,
    maxCount: 18,
    pdfPages: 2,
    mode: "identify_pattern_rule"
  }),
  grade4_patterning_and_algebra_missing_value_pattern: Object.freeze({
    title: "Find the Missing Values",
    instruction: "Find the rule. Then write the missing numbers in each pattern.",
    count: 12,
    perPage: 12,
    maxCount: 20,
    pdfPages: 2,
    mode: "missing_value_pattern"
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

function renderPdf(runtime) {
  return new Promise((resolve, reject) => {
    const response = new BufferResponse();
    response.once("finish", () => resolve(response.toBuffer()));
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.contentObject,
      layoutObject: runtime.layout,
      options: { filename: "grade4-numeric-patterning-batch1-test.pdf", includeAnswerKey: true }
    });
  });
}

function pdfPageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function truth(runtime) {
  return runtime.contentObject.content.items.map((item) => ({
    prompt: item.prompt,
    answer: item.answer,
    sequence: item.sequence,
    responseValues: item.responseValues,
    missingIndexes: item.missingIndexes,
    continuationAnswers: item.continuationAnswers,
    patternOperation: item.patternOperation,
    step: item.step,
    answerState: item.answerState,
    duplicateSignature: item.duplicateSignature,
    isExample: item.isExample
  }));
}

function assertArithmetic(item) {
  const state = item.answerState;
  assert(state && Array.isArray(state.completeSequence));
  assert(Number.isInteger(state.startingValue));
  assert(Number.isInteger(state.step) && state.step > 0);
  assert(["add", "subtract"].includes(state.operation));
  assert.strictEqual(state.ruleText, `${state.operation === "add" ? "Add" : "Subtract"} ${state.step} each time.`);
  state.completeSequence.forEach((value, index) => {
    assert(Number.isInteger(value) && value >= 0 && value <= 1000);
    if (index) {
      const expected = state.completeSequence[index - 1] + (state.operation === "add" ? state.step : -state.step);
      assert.strictEqual(value, expected);
    }
  });
  assert.strictEqual(item.answerState.operation, item.patternOperation);
  assert.strictEqual(item.answerState.step, item.step);
  assert(item.duplicateSignature);
}

function assertModeTruth(item, mode) {
  assertArithmetic(item);
  const state = item.answerState;
  if (mode === "extend_pattern") {
    assert.deepStrictEqual(state.visibleSequence, state.completeSequence.slice(0, state.visibleTermCount));
    assert.deepStrictEqual(state.continuationAnswers, state.completeSequence.slice(state.visibleTermCount));
    assert.deepStrictEqual(item.continuationAnswers, state.continuationAnswers);
    assert.deepStrictEqual(item.responseValues, state.responseValues);
    assert.strictEqual(item.answer, state.continuationAnswers.join(", "));
  } else if (mode === "identify_pattern_rule") {
    assert.deepStrictEqual(item.sequence, state.completeSequence);
    assert.strictEqual(item.answer, state.acceptedAnswerText);
    assert.strictEqual(state.responseTarget, "rule");
  } else {
    assert.deepStrictEqual(item.missingIndexes, state.missingIndexes);
    assert.deepStrictEqual(item.responseValues, state.missingAnswers);
    assert.strictEqual(item.answer, state.missingAnswers.join(", "));
    state.displayedSequence.forEach((value, index) => {
      assert.strictEqual(value, state.missingIndexes.includes(index) ? null : state.completeSequence[index]);
    });
    assert(state.completeSequence.length - state.missingIndexes.length >= 3);
  }
}

function assertParity(runtime) {
  const answerItems = buildAnswerKeyItems(runtime.contentObject.content.items);
  assert.strictEqual(answerItems.length, runtime.contentObject.content.items.length);
  answerItems.forEach((answerItem, index) => {
    const studentItem = runtime.contentObject.content.items[index];
    assert.deepStrictEqual(answerItem.answer, studentItem.answer);
    assert.deepStrictEqual(answerItem.sequence, studentItem.sequence);
    assert.deepStrictEqual(answerItem.responseValues, studentItem.responseValues);
    assert.deepStrictEqual(answerItem.answerState, studentItem.answerState);
    assert.strictEqual(answerItem.duplicateSignature, studentItem.duplicateSignature);
  });
}

async function testDefaultsAndSeeds() {
  for (const [resourceId, spec] of Object.entries(SPECS)) {
    let sawDifferentSeedVariation = false;
    for (let seed = 0; seed < 30; seed += 1) {
      const query = { worksheetSeed: `grade4-batch1-seed-${seed}` };
      const runtime = buildCatalogWorksheetRuntime(resourceId, query);
      const repeat = buildCatalogWorksheetRuntime(resourceId, query);
      const alternate = buildCatalogWorksheetRuntime(resourceId, { worksheetSeed: `grade4-batch1-alt-${seed}` });
      const items = runtime.contentObject.content.items;

      assert.strictEqual(runtime.item.status, "ready");
      assert.strictEqual(getCustomizationFamilyForResource(resourceId), null);
      assert.strictEqual(runtime.layout.header.title, spec.title);
      assert.strictEqual(runtime.layout.header.subtitle, "");
      assert.strictEqual(runtime.layout.instruction, spec.instruction);
      assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, FOOTER);
      assert.strictEqual(items.length, spec.count);
      assert.strictEqual(runtime.layout.template.maxProblemsPerPage, spec.perPage);
      assert.strictEqual(runtime.layout.display.patterningLayout, spec.mode);
      assert.deepStrictEqual(truth(runtime), truth(repeat));
      sawDifferentSeedVariation ||= JSON.stringify(truth(runtime)) !== JSON.stringify(truth(alternate));

      const signatures = new Set(items.map((item) => item.duplicateSignature));
      assert.strictEqual(signatures.size, items.length);
      assert.strictEqual(items.filter((item) => item.patternOperation === "add").length, Math.ceil(items.length / 2));
      assert.strictEqual(items.filter((item) => item.patternOperation === "subtract").length, Math.floor(items.length / 2));
      items.forEach((item) => assertModeTruth(item, spec.mode));
      assertParity(runtime);
      if (spec.mode === "missing_value_pattern") {
        assert(new Set(items.map((item) => item.missingIndexes.join(","))).size > 1);
      }
    }
    assert(sawDifferentSeedVariation, `${resourceId} did not vary across different seeds`);

    const runtime = buildCatalogWorksheetRuntime(resourceId, { worksheetSeed: "grade4-batch1-default-pdf" });
    const beforeRender = truth(runtime);
    const pdf = await renderPdf(runtime);
    assert.strictEqual(pdfPageCount(pdf), spec.pdfPages);
    assert.strictEqual(runtime.layout.patterningPagination.pageCount, 1);
    assert.deepStrictEqual(truth(runtime), beforeRender);
  }
}

async function testVariablesAndDensity() {
  const extend = buildCatalogWorksheetRuntime("grade4_patterning_and_algebra_extend_pattern", {
    worksheetSeed: "grade4-batch1-extend-contract",
    questionCount: 6,
    questionsPerPage: 6,
    selectedOperations: ["subtract"],
    selectedSteps: [10, 25],
    minimumStart: 300,
    maximumStart: 500,
    shownTermCount: 4,
    extensionCount: 3
  });
  extend.contentObject.content.items.forEach((item) => {
    assert.strictEqual(item.patternOperation, "subtract");
    assert([10, 25].includes(item.step));
    assert.strictEqual(item.answerState.visibleTermCount, 4);
    assert.strictEqual(item.answerState.continuationCount, 3);
  });

  const identify = buildCatalogWorksheetRuntime("grade4_patterning_and_algebra_identify_pattern_rule", {
    worksheetSeed: "grade4-batch1-identify-contract",
    questionCount: 4,
    operation: "subtraction",
    startingValue: 800,
    step: 25,
    termCount: 7
  });
  identify.contentObject.content.items.forEach((item) => {
    assert.strictEqual(item.patternOperation, "subtract");
    assert.strictEqual(item.step, 25);
    assert.strictEqual(item.answerState.startingValue, 800);
    assert.strictEqual(item.answerState.completeSequence.length, 7);
  });

  const missing = buildCatalogWorksheetRuntime("grade4_patterning_and_algebra_missing_value_pattern", {
    worksheetSeed: "grade4-batch1-missing-contract",
    questionCount: 5,
    selectedOperations: "add,subtract",
    selectedSteps: "5,20",
    sequenceLength: 7,
    missingPositions: "1,4",
    missingCount: 2
  });
  missing.contentObject.content.items.forEach((item) => {
    assert.deepStrictEqual(item.missingIndexes, [1, 4]);
    assert([5, 20].includes(item.step));
  });

  for (const [resourceId, spec] of Object.entries(SPECS)) {
    const runtime = buildCatalogWorksheetRuntime(resourceId, {
      worksheetSeed: "grade4-batch1-density",
      questionCount: spec.maxCount,
      questionsPerPage: spec.perPage
    });
    const pdf = await renderPdf(runtime);
    const studentPages = Math.ceil(spec.maxCount / spec.perPage);
    assert.strictEqual(pdfPageCount(pdf), studentPages * 2);
    assert.strictEqual(runtime.layout.patterningPagination.pageCount, studentPages);
  }

  for (const alias of ["includeExample", "completedExample", "example"]) {
    const runtime = buildCatalogWorksheetRuntime("grade4_patterning_and_algebra_extend_pattern", {
      worksheetSeed: `grade4-batch1-example-${alias}`,
      questionCount: 12,
      [alias]: true
    });
    assert.strictEqual(runtime.contentObject.content.items.length, 13);
    assert.strictEqual(runtime.contentObject.content.items.filter((item) => item.isExample).length, 1);
    assert.strictEqual(runtime.contentObject.content.items.filter((item) => !item.isExample).length, 12);
    assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 13);
    assert.strictEqual(pdfPageCount(await renderPdf(runtime)), 2);
  }
}

function testInvalidInputs() {
  const extend = "grade4_patterning_and_algebra_extend_pattern";
  const missing = "grade4_patterning_and_algebra_missing_value_pattern";
  const identify = "grade4_patterning_and_algebra_identify_pattern_rule";
  const invalid = [
    [extend, { selectedOperations: [] }],
    [extend, { selectedOperations: ["add", "multiply"] }],
    [extend, { selectedOperations: ["add", "add"] }],
    [extend, { operationMode: "add", selectedOperations: ["subtract"] }],
    [extend, { startingValue: 10.5 }],
    [extend, { sequenceStep: 2.5 }],
    [extend, { sequenceStep: 0 }],
    [extend, { sequenceStep: -2 }],
    [extend, { minStart: 200, maxStart: 100 }],
    [extend, { minStep: 20, maxStep: 10 }],
    [extend, { minStart: 995, maxStart: 1000, minStep: 100, maxStep: 100, operationMode: "add" }],
    [extend, { questionCount: 0 }],
    [extend, { questionCount: 13 }],
    [extend, { visibleLength: 3 }],
    [extend, { continuationCount: 4 }],
    [extend, { visibleLength: 6, continuationCount: 2 }],
    [extend, { questionCount: 12, questionsPerPage: 10 }],
    [extend, { selectedSteps: [5, 5] }],
    [extend, { sequenceStep: 5, selectedSteps: [5, 10] }],
    [extend, { includeExample: "sometimes" }],
    [identify, { sequenceLength: 4 }],
    [identify, { questionCount: 19 }],
    [identify, { operationMode: "multiply" }],
    [missing, { missingIndexes: [] }],
    [missing, { missingIndexes: [1, 1] }],
    [missing, { sequenceLength: 7, missingIndexes: [1, 7] }],
    [missing, { sequenceLength: 7, missingIndexes: [0, 1, 2, 3, 4] }],
    [missing, { missingIndexes: [1, 4], missingTermCount: 1 }],
    [missing, { missingIndexes: [1, 4], missingTermPlacement: "middle" }],
    [missing, { missingTermCount: 0 }],
    [missing, { missingTermPlacement: "outside" }]
  ];
  invalid.forEach(([resourceId, options]) => {
    assert.throws(() => buildCatalogWorksheetRuntime(resourceId, options), /Grade 4 numeric pattern|No numeric pattern candidates/);
  });
}

function testCrossGradeIsolation() {
  const grade2 = buildCatalogWorksheetRuntime("grade2_patterning_and_algebra_identify_pattern_rule", {
    worksheetSeed: "grade4-batch1-grade2-isolation"
  });
  const grade3 = buildCatalogWorksheetRuntime("grade3_patterning_and_algebra_extend_pattern", {
    worksheetSeed: "grade4-batch1-grade3-isolation"
  });
  assert.strictEqual(grade2.layout.header.title, "Identify Pattern Rule");
  assert.strictEqual(grade2.layout.instruction, "Write the number that is added each time.");
  assert.strictEqual(grade2.contentObject.content.items.length, 12);
  assert.strictEqual(grade3.layout.header.title, "Extend the Pattern");
  assert.strictEqual(grade3.layout.instruction, "Extend each pattern. Write the next number.");
  assert.strictEqual(grade3.contentObject.content.items.length, 12);
  assert.strictEqual(grade3.contentObject.content.items[0].answerState.visibleTermCount, 4);
}

async function run() {
  await testDefaultsAndSeeds();
  await testVariablesAndDensity();
  testInvalidInputs();
  testCrossGradeIsolation();
  console.log("Grade 4 Numeric Patterning Batch 1 tests passed: 30 seeds per resource; same-seed failures 0.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
