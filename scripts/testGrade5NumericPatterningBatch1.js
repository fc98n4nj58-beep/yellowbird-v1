"use strict";

const assert = require("assert");
const { Writable } = require("stream");

const { getCustomizationFamilyForResource } = require("../config/worksheetCustomization");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const {
  renderWorksheetPDF,
  buildAnswerKeyItems,
  __test: rendererTest
} = require("../renderers/pdfRenderer");

const FOOTER = "Grade 5 • Math • Patterning & Algebra";
const SPECS = Object.freeze({
  grade5_patterning_and_algebra_extend_pattern: Object.freeze({
    title: "Extend the Pattern",
    instruction: "Continue each pattern by writing the next numbers.",
    count: 12,
    perPage: 12,
    maxCount: 12,
    columns: 1,
    rows: 12,
    mode: "extend_pattern"
  }),
  grade5_patterning_and_algebra_identify_pattern_rule: Object.freeze({
    title: "Identify the Pattern Rule",
    instruction: "Write the rule for each pattern.",
    count: 10,
    perPage: 10,
    maxCount: 18,
    columns: 1,
    rows: 10,
    mode: "identify_pattern_rule"
  }),
  grade5_patterning_and_algebra_missing_value_pattern: Object.freeze({
    title: "Find the Missing Values",
    instruction: "Write the missing numbers in each pattern.",
    count: 12,
    perPage: 12,
    maxCount: 20,
    columns: 1,
    rows: 12,
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

function renderPdf(runtime, includeAnswerKey = true) {
  return new Promise((resolve, reject) => {
    const response = new BufferResponse();
    response.once("finish", () => resolve(response.toBuffer()));
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.contentObject,
      layoutObject: runtime.layout,
      options: {
        filename: "grade5-numeric-patterning-batch1-test.pdf",
        includeAnswerKey
      }
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
    isExample: item.isExample,
    startingValue: item.startingValue,
    ruleAmount: item.ruleAmount,
    fullSequence: item.fullSequence,
    visiblePrefix: item.visiblePrefix,
    fullVisibleSequence: item.fullVisibleSequence,
    displayedSequence: item.displayedSequence,
    continuationValues: item.continuationValues,
    missingValues: item.missingValues,
    responseTargets: item.responseTargets,
    answerList: item.answerList,
    studentFacingRule: item.studentFacingRule,
    acceptedNormalizedRule: item.acceptedNormalizedRule
  }));
}

function assertPublicContract(runtime, resourceId, spec) {
  assert.strictEqual(runtime.item.status, "generated");
  assert.strictEqual(getCustomizationFamilyForResource(resourceId), null);
  assert.strictEqual(runtime.layout.header.title, spec.title);
  assert.strictEqual(runtime.contentObject.meta.title, spec.title);
  assert.strictEqual(runtime.layout.header.subtitle, "");
  assert.strictEqual(runtime.layout.instruction, spec.instruction);
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, FOOTER);
  assert.strictEqual(runtime.layout.template.columns, spec.columns);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, spec.perPage);
  assert.strictEqual(runtime.layout.display.denseGridRows, spec.rows);
  assert.strictEqual(runtime.layout.display.patterningLayout, spec.mode);
  assert.strictEqual(runtime.contentObject.content.items.length, spec.count);
  assert.deepStrictEqual(runtime.layout.display.sideWorkspace, {
    enabled: true,
    studentOnly: true,
    heading: "Work It Out",
    widthRatio: 0.35,
    minimumWidthRatio: 0.3,
    dividerGap: 4,
    workspacePadding: 12,
    minimumTaskWidth: 320,
    taskLabelWidth: 24,
    ruleLineRightPadding: 38,
    dividerWidth: 0.8,
    dividerColor: "#c4cad1"
  });
  assert.strictEqual(runtime.layout.display.patterningExtendTargetWidth, 62);
  assert.strictEqual(runtime.layout.display.patterningMissingTargetWidth, 62);
  assert.strictEqual(runtime.layout.display.patterningRuleTargetWidth, 120);

  const publicText = [
    runtime.contentObject.meta.title,
    runtime.contentObject.meta.subheading,
    runtime.contentObject.meta.curriculum.footerText,
    runtime.layout.instruction,
    ...runtime.contentObject.content.items.map((item) => item.prompt)
  ].join(" ");
  assert(!publicText.includes(resourceId));
  assert(!publicText.includes("patterning_and_algebra"));
  assert(!publicText.includes("— Grade 5"));
  assert(!/Students\s/.test(runtime.layout.instruction));
  assert(runtime.contentObject.content.items.every((item) => !item.isExample));
}

function assertWorkspaceGeometry(runtime) {
  const contentBox = { x: 36, y: 36, width: 540, height: 720 };
  const startY = 142;
  const bottomContentY = 732;
  const geometry = rendererTest.buildSideWorkspaceGeometry({
    contentBox,
    startY,
    bottomContentY,
    config: runtime.layout.display.sideWorkspace,
    answerKey: false
  });
  assert.strictEqual(geometry.enabled, true);
  assert.strictEqual(geometry.heading, "Work It Out");
  assert.strictEqual(geometry.requestedWidthRatio, 0.35);
  assert(geometry.widthRatio >= 0.35 && geometry.widthRatio <= 0.4);
  assert(geometry.workspaceWidth >= contentBox.width * 0.35);
  assert(geometry.workspaceWidth <= contentBox.width * 0.4);
  assert(geometry.taskWidth >= 320);
  const sequenceWidth = geometry.taskWidth - runtime.layout.display.sideWorkspace.taskLabelWidth;
  assert(sequenceWidth >= 299, "Sequence region must retain safe width after its number label.");
  assert.strictEqual(
    Math.min(
      260,
      Math.max(
        120,
        sequenceWidth - runtime.layout.display.sideWorkspace.ruleLineRightPadding
      )
    ),
    260,
    "Identify-the-rule response line must retain its approved 260-point width."
  );
  assert(geometry.dividerTop >= startY);
  assert(geometry.dividerBottom <= bottomContentY);
  assert(geometry.dividerBottom > geometry.dividerTop);
  assert(geometry.workspaceX > geometry.dividerX);
  assert(geometry.workspaceContentWidth > 150);

  const answerKeyGeometry = rendererTest.buildSideWorkspaceGeometry({
    contentBox,
    startY,
    bottomContentY,
    config: runtime.layout.display.sideWorkspace,
    answerKey: true
  });
  assert.deepStrictEqual(answerKeyGeometry, { enabled: false });
}

function assertArithmetic(item) {
  const state = item.answerState;
  assert(state && Array.isArray(state.completeSequence));
  assert(Number.isInteger(state.startingValue));
  assert(Number.isInteger(state.step) && state.step >= 10 && state.step <= 50);
  assert(["add", "subtract"].includes(state.operation));
  assert.strictEqual(state.ruleAmount, state.step);
  assert.strictEqual(state.ruleText, `${state.operation === "add" ? "Add" : "Subtract"} ${state.step} each time.`);
  state.completeSequence.forEach((value, index) => {
    assert(Number.isInteger(value) && value >= 0 && value <= 1000);
    if (index) {
      const expected = state.completeSequence[index - 1] + (state.operation === "add" ? state.step : -state.step);
      assert.strictEqual(value, expected);
    }
  });
  assert.strictEqual(item.startingValue, state.startingValue);
  assert.strictEqual(item.ruleAmount, state.step);
  assert.strictEqual(item.operation, state.operation);
  assert.strictEqual(item.patternOperation, state.operation);
  assert.strictEqual(item.step, state.step);
  assert.deepStrictEqual(item.fullSequence, state.completeSequence);
  assert(item.duplicateSignature);
}

function assertModeTruth(item, mode) {
  assertArithmetic(item);
  const state = item.answerState;
  if (mode === "extend_pattern") {
    assert.deepStrictEqual(state.visibleSequence, state.completeSequence.slice(0, state.visibleTermCount));
    assert.deepStrictEqual(state.visiblePrefix, state.visibleSequence);
    assert.deepStrictEqual(state.continuationValues, state.completeSequence.slice(state.visibleTermCount));
    assert.deepStrictEqual(item.visiblePrefix, state.visiblePrefix);
    assert.deepStrictEqual(item.continuationValues, state.continuationValues);
    assert.deepStrictEqual(item.continuationAnswers, state.continuationValues);
    assert.deepStrictEqual(item.responseValues, state.responseValues);
    assert.deepStrictEqual(item.responseTargets, state.responseTargets);
    assert.deepStrictEqual(item.answerList, state.answerList);
    assert.strictEqual(item.answer, state.continuationValues.join(", "));
    assert.strictEqual(state.visibleTermCount, 5);
    assert.strictEqual(state.continuationCount, 2);
    assert.strictEqual(item.missingIndexes, null);
  } else if (mode === "identify_pattern_rule") {
    assert.deepStrictEqual(item.sequence, state.completeSequence);
    assert.deepStrictEqual(item.fullVisibleSequence, state.completeSequence);
    assert.strictEqual(item.studentFacingRule, state.ruleText);
    assert.deepStrictEqual(item.acceptedNormalizedRule, {
      operation: state.operation,
      amount: state.step
    });
    assert.deepStrictEqual(item.answerList, [state.ruleText]);
    assert.strictEqual(item.answer, state.acceptedAnswerText);
    assert.strictEqual(state.responseTarget, "rule");
    assert.strictEqual(item.continuationAnswers, null);
    assert.strictEqual(item.missingIndexes, null);
  } else {
    assert.deepStrictEqual(item.missingIndexes, state.missingIndexes);
    assert.deepStrictEqual(item.missingValues, state.missingValues);
    assert.deepStrictEqual(item.responseValues, state.missingAnswers);
    assert.deepStrictEqual(item.responseTargets, state.responseTargets);
    assert.deepStrictEqual(item.answerList, state.answerList);
    assert.deepStrictEqual(item.displayedSequence, state.displayedSequence);
    assert.strictEqual(item.answer, state.missingAnswers.join(", "));
    state.displayedSequence.forEach((value, index) => {
      assert.strictEqual(value, state.missingIndexes.includes(index) ? null : state.completeSequence[index]);
    });
    assert.strictEqual(state.completeSequence.length, 7);
    assert.strictEqual(state.missingIndexes.length, 2);
    assert(state.missingIndexes.every((index) => index > 0 && index < state.completeSequence.length - 1));
    assert.strictEqual(item.continuationAnswers, null);
  }
}

function assertParity(runtime) {
  const answerItems = buildAnswerKeyItems(runtime.contentObject.content.items);
  assert.strictEqual(answerItems.length, runtime.contentObject.content.items.length);
  answerItems.forEach((answerItem, index) => {
    const studentItem = runtime.contentObject.content.items[index];
    [
      "answer",
      "sequence",
      "responseValues",
      "missingIndexes",
      "continuationAnswers",
      "answerState",
      "duplicateSignature",
      "startingValue",
      "ruleAmount",
      "fullSequence",
      "visiblePrefix",
      "fullVisibleSequence",
      "displayedSequence",
      "continuationValues",
      "missingValues",
      "responseTargets",
      "answerList",
      "studentFacingRule",
      "acceptedNormalizedRule"
    ].forEach((key) => assert.deepStrictEqual(answerItem[key], studentItem[key], `Key parity failed for ${key}`));
  });
}

async function testDefaultsAndSeeds() {
  for (const [resourceId, spec] of Object.entries(SPECS)) {
    let sawDifferentSeedVariation = false;
    for (let seed = 0; seed < 30; seed += 1) {
      const query = { worksheetSeed: `grade5-batch1-seed-${seed}` };
      const runtime = buildCatalogWorksheetRuntime(resourceId, query);
      const repeat = buildCatalogWorksheetRuntime(resourceId, query);
      const alternate = buildCatalogWorksheetRuntime(resourceId, {
        worksheetSeed: `grade5-batch1-alternate-${seed}`
      });
      assertPublicContract(runtime, resourceId, spec);
      assertWorkspaceGeometry(runtime);
      assert.deepStrictEqual(truth(runtime), truth(repeat));
      sawDifferentSeedVariation ||= JSON.stringify(truth(runtime)) !== JSON.stringify(truth(alternate));

      const items = runtime.contentObject.content.items;
      assert.strictEqual(new Set(items.map((item) => item.duplicateSignature)).size, items.length);
      assert.strictEqual(items.filter((item) => item.patternOperation === "add").length, Math.ceil(items.length / 2));
      assert.strictEqual(items.filter((item) => item.patternOperation === "subtract").length, Math.floor(items.length / 2));
      items.forEach((item) => assertModeTruth(item, spec.mode));
      assertParity(runtime);
      if (spec.mode === "missing_value_pattern") {
        assert(new Set(items.map((item) => item.missingIndexes.join(","))).size > 1);
      }
    }
    assert(sawDifferentSeedVariation, `${resourceId} did not vary across different seeds`);

    const runtime = buildCatalogWorksheetRuntime(resourceId, {
      worksheetSeed: `grade5-batch1-${spec.mode}-pdf`
    });
    const beforeRender = truth(runtime);
    assert.strictEqual(pdfPageCount(await renderPdf(runtime)), 2);
    assert.strictEqual(pdfPageCount(await renderPdf(runtime, false)), 1);
    assert.strictEqual(runtime.layout.patterningPagination.pageCount, 1);
    assert.deepStrictEqual(truth(runtime), beforeRender);
  }
}

async function testVariablesAndDensity() {
  const extend = buildCatalogWorksheetRuntime("grade5_patterning_and_algebra_extend_pattern", {
    worksheetSeed: "grade5-batch1-extend-variables",
    questionCount: 6,
    questionsPerPage: 6,
    selectedOperations: ["subtract"],
    selectedRuleAmounts: [25, 50],
    minimumStart: 700,
    maximumStart: 900,
    shownTermCount: 4,
    extensionCount: 3
  });
  extend.contentObject.content.items.forEach((item) => {
    assert.strictEqual(item.operation, "subtract");
    assert([25, 50].includes(item.ruleAmount));
    assert(item.startingValue >= 700 && item.startingValue <= 900);
    assert.strictEqual(item.answerState.visibleTermCount, 4);
    assert.strictEqual(item.answerState.continuationCount, 3);
  });
  assert.strictEqual(extend.layout.display.sideWorkspace.minimumTaskWidth, 346);
  const maximumContinuationGeometry = rendererTest.buildSideWorkspaceGeometry({
    contentBox: { x: 54, y: 36, width: 504, height: 720 },
    startY: 142,
    bottomContentY: 732,
    config: extend.layout.display.sideWorkspace,
    answerKey: false
  });
  assert(maximumContinuationGeometry.widthRatio >= 0.3);
  assert(maximumContinuationGeometry.widthRatio < 0.35);
  assert(maximumContinuationGeometry.taskWidth >= 346);
  assert(
    maximumContinuationGeometry.taskWidth -
      extend.layout.display.sideWorkspace.taskLabelWidth >= 322
  );

  const identify = buildCatalogWorksheetRuntime("grade5_patterning_and_algebra_identify_pattern_rule", {
    worksheetSeed: "grade5-batch1-identify-variables",
    questionCount: 1,
    operation: "subtraction",
    startingValue: 900,
    step: 50,
    termCount: 7
  });
  identify.contentObject.content.items.forEach((item) => {
    assert.strictEqual(item.operation, "subtract");
    assert.strictEqual(item.ruleAmount, 50);
    assert.strictEqual(item.startingValue, 900);
    assert.strictEqual(item.fullVisibleSequence.length, 7);
  });

  const missing = buildCatalogWorksheetRuntime("grade5_patterning_and_algebra_missing_value_pattern", {
    worksheetSeed: "grade5-batch1-missing-variables",
    questionCount: 5,
    selectedOperations: "add,subtract",
    ruleAmounts: "20,40",
    sequenceLength: 7,
    missingPositions: "1,4",
    missingCount: 2
  });
  missing.contentObject.content.items.forEach((item) => {
    assert.deepStrictEqual(item.missingIndexes, [1, 4]);
    assert([20, 40].includes(item.ruleAmount));
  });

  for (const [resourceId, spec] of Object.entries(SPECS)) {
    const runtime = buildCatalogWorksheetRuntime(resourceId, {
      worksheetSeed: "grade5-batch1-maximum-density",
      questionCount: spec.maxCount,
      questionsPerPage: spec.perPage
    });
    const studentPages = Math.ceil(spec.maxCount / spec.perPage);
    assert.strictEqual(pdfPageCount(await renderPdf(runtime)), studentPages * 2);
    assert.strictEqual(runtime.layout.patterningPagination.pageCount, studentPages);
  }

  for (const alias of ["includeExample", "completedExample", "example"]) {
    for (const resourceId of Object.keys(SPECS)) {
      const runtime = buildCatalogWorksheetRuntime(resourceId, {
        worksheetSeed: `grade5-batch1-example-${alias}-${resourceId}`,
        [alias]: true
      });
      assert.strictEqual(runtime.contentObject.content.items.filter((item) => item.isExample).length, 1);
      assert.strictEqual(
        runtime.contentObject.content.items.filter((item) => !item.isExample).length,
        SPECS[resourceId].count
      );
      const expectedPages = resourceId.includes("extend_pattern") ? 2 : 4;
      assert.strictEqual(pdfPageCount(await renderPdf(runtime)), expectedPages);
    }
  }
}

function testInvalidInputs() {
  const extend = "grade5_patterning_and_algebra_extend_pattern";
  const identify = "grade5_patterning_and_algebra_identify_pattern_rule";
  const missing = "grade5_patterning_and_algebra_missing_value_pattern";
  const invalid = [
    [extend, { selectedOperations: [] }],
    [extend, { selectedOperations: ["add", "multiply"] }],
    [extend, { selectedOperations: ["add", "add"] }],
    [extend, { selectedOperations: ["divide"] }],
    [extend, { operationMode: "alternating" }],
    [extend, { operationMode: "add", selectedOperations: ["subtract"] }],
    [extend, { startingValue: 10.5 }],
    [extend, { startingValue: -1 }],
    [extend, { sequenceStep: 2.5 }],
    [extend, { sequenceStep: 0 }],
    [extend, { sequenceStep: -2 }],
    [extend, { minStart: 200, maxStart: 100 }],
    [extend, { minStep: 20, maxStep: 10 }],
    [extend, { startingValue: 300, minStart: 200 }],
    [extend, { sequenceStep: 25, maxStep: 50 }],
    [extend, { minStart: 995, maxStart: 1000, minStep: 100, maxStep: 100, operationMode: "add" }],
    [extend, { questionCount: 0 }],
    [extend, { questionCount: 13 }],
    [extend, { questionCount: 12, questionsPerPage: 10 }],
    [extend, { visibleLength: 3 }],
    [extend, { continuationCount: 0 }],
    [extend, { continuationCount: 4 }],
    [extend, { visibleLength: 6, continuationCount: 2 }],
    [extend, { selectedSteps: [] }],
    [extend, { selectedRuleAmounts: [5, 5] }],
    [extend, { sequenceStep: 5, selectedRuleAmounts: [5, 10] }],
    [extend, { selectedStarts: [100, 200] }],
    [extend, { includeExample: "sometimes" }],
    [extend, { includeExample: true, example: false }],
    [extend, { answer: "caller-owned" }],
    [extend, { answerState: {} }],
    [extend, { sequence: [1, 2, 3] }],
    [extend, { continuationValues: [1, 2] }],
    [identify, { questionCount: 2, startingValue: 900, sequenceStep: 50, operationMode: "subtract" }],
    [identify, { sequenceLength: 4 }],
    [identify, { questionCount: 19 }],
    [identify, { operationMode: "multiply" }],
    [identify, { ruleText: "Add 5." }],
    [identify, { acceptedNormalizedRule: { operation: "add", amount: 5 } }],
    [missing, { missingIndexes: [] }],
    [missing, { missingIndexes: [1, 1] }],
    [missing, { sequenceLength: 7, missingIndexes: [1, 7] }],
    [missing, { sequenceLength: 5, missingIndexes: [0, 1, 2, 3, 4] }],
    [missing, { missingIndexes: [1, 4], missingTermCount: 1 }],
    [missing, { missingIndexes: [1, 4], missingTermPlacement: "middle" }],
    [missing, { missingIndexes: [1, 4], missingPositions: [2, 5] }],
    [missing, { missingTermCount: 0 }],
    [missing, { missingTermPlacement: "outside" }],
    [missing, { displayedSequence: [1, null, 3] }],
    [missing, { missingValues: [2] }]
  ];

  invalid.forEach(([resourceId, options]) => {
    assert.throws(
      () => buildCatalogWorksheetRuntime(resourceId, options),
      /Grade 5 numeric pattern|No numeric pattern candidates|Unsupported Grade 5/
    );
  });
}

function testCrossGradeIsolation() {
  const expectations = [
    ["grade1_patterning_and_algebra_extend_pattern", "Extend Pattern", "Extend each pattern. Write the next number.", 30],
    ["grade2_patterning_and_algebra_identify_pattern_rule", "Identify Pattern Rule", "Write the rule for each pattern.", 12],
    ["grade3_patterning_and_algebra_extend_pattern", "Extend the Pattern", "Extend each pattern. Write the next number.", 30],
    ["grade4_patterning_and_algebra_extend_pattern", "Extend the Pattern", "Find the rule. Then write the next numbers in each pattern.", 12]
  ];
  expectations.forEach(([resourceId, title, instruction, count]) => {
    const runtime = buildCatalogWorksheetRuntime(resourceId, {
      worksheetSeed: "grade5-batch1-cross-grade-isolation"
    });
    assert.strictEqual(runtime.layout.header.title, title);
    assert.strictEqual(runtime.layout.instruction, instruction);
    assert.strictEqual(runtime.contentObject.content.items.length, count);
    assert.strictEqual(runtime.contentObject.content.items[0].startingValue, undefined);
    if (resourceId.startsWith("grade4_")) {
      assert.strictEqual(runtime.layout.display.sideWorkspace?.enabled, true);
    } else {
      assert.strictEqual(runtime.layout.display.sideWorkspace, undefined);
    }
  });
}

async function run() {
  await testDefaultsAndSeeds();
  await testVariablesAndDensity();
  testInvalidInputs();
  testCrossGradeIsolation();
  console.log("Grade 5 Numeric Patterning Batch 1 tests passed: 30 seeds per resource; same-seed failures 0.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
