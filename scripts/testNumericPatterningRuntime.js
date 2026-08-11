const assert = require("assert");
const { Writable } = require("stream");

const {
  buildCandidatePool,
  buildNumericPatternProblem,
  normalizeNumericPatternOptions
} = require("../engine/problemGenerators/numericPatternRules");
const { createSeededRandom } = require("../utils/seededRandom");
const {
  buildCatalogWorksheetRuntime
} = require("../services/catalogWorksheetRuntimeService");
const {
  renderWorksheetPDF,
  buildAnswerKeyItems,
  __test: rendererTest
} = require("../renderers/pdfRenderer");

const GRADE2_NUMERIC_PATTERN_IDS = Object.freeze([
  "grade2_patterning_and_algebra_extend_pattern",
  "grade2_patterning_and_algebra_identify_pattern_rule",
  "grade2_patterning_and_algebra_missing_value_pattern"
]);

class SinkResponse extends Writable {
  setHeader() {}
  _write(chunk, encoding, callback) {
    callback();
  }
}

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

function renderRuntimeForPagination(runtime) {
  const res = new SinkResponse();
  renderWorksheetPDF({
    res,
    contentObject: runtime.contentObject,
    layoutObject: runtime.layout,
    options: {
      filename: "test.pdf",
      includeAnswerKey: true
    }
  });
  return runtime.layout.patterningPagination || null;
}

function renderRuntimePdf(runtime) {
  return new Promise((resolve, reject) => {
    const res = new BufferResponse();
    res.once("finish", () => resolve(res.toBuffer()));
    res.once("error", reject);
    renderWorksheetPDF({
      res,
      contentObject: runtime.contentObject,
      layoutObject: runtime.layout,
      options: {
        filename: "test.pdf",
        includeAnswerKey: true
      }
    });
  });
}

function pdfPageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function problemSignature(item) {
  return `${item.prompt}|${item.answer}`;
}

function runtimeSignatures(runtime) {
  return runtime.contentObject.content.items.map(problemSignature);
}

function assertArithmeticSequence(sequence, step, operation = "add") {
  for (let i = 1; i < sequence.length; i += 1) {
    if (sequence[i] === null || sequence[i - 1] === null) continue;
    const diff = sequence[i] - sequence[i - 1];
    assert.strictEqual(diff, operation === "subtract" ? -step : step);
  }
}

function assertReadyRuntime(resourceId, query = {}) {
  const runtime = buildCatalogWorksheetRuntime(resourceId, query);
  assert(runtime.contentObject.content.items.length > 0, `${resourceId} generated no items`);
  runtime.contentObject.content.items.forEach((item) => {
    assert.strictEqual(item.type, "equation", `${resourceId} item should be equation`);
    assert(item.prompt, `${resourceId} item should have prompt`);
    assert.notStrictEqual(item.answer, undefined, `${resourceId} item should have answer`);
  });
  return runtime;
}

function assertNoRepeatedPromptText(runtime) {
  const forbidden = [
    "Extend the pattern",
    "Fill in the missing value",
    "Fill in the missing values",
    "Identify the pattern rule"
  ];
  runtime.contentObject.content.items.forEach((item) => {
    forbidden.forEach((text) => {
      assert(!String(item.prompt).includes(text), `${runtime.item.id} repeated prompt text: ${text}`);
    });
  });
}

function assertNoUnsafeOrphan(distribution) {
  if (!distribution || distribution.pageItemCounts.length <= 1) return;
  const finalCount = distribution.pageItemCounts[distribution.pageItemCounts.length - 1];
  assert(finalCount > 2, `unsafe orphan final page: ${distribution.pageItemCounts.join("/")}`);
}

function assertContinuousSourceIds(runtime) {
  runtime.contentObject.content.items.forEach((item, index) => {
    assert.strictEqual(item.id, index + 1);
  });
}

function testOptionNormalization() {
  const normalized = normalizeNumericPatternOptions("missing_value_pattern", {
    operationMode: "subtraction",
    startingValue: 30,
    sequenceStep: 4,
    sequenceLength: 6,
    missingTermCount: 2,
    missingTermPlacement: "end",
    maxValue: 40
  });

  assert.strictEqual(normalized.operationMode, "subtract");
  assert.strictEqual(normalized.minStart, 30);
  assert.strictEqual(normalized.maxStart, 30);
  assert.strictEqual(normalized.minStep, 4);
  assert.strictEqual(normalized.maxStep, 4);
  assert.strictEqual(normalized.sequenceLength, 6);
  assert.strictEqual(normalized.missingTermCount, 2);
  assert.strictEqual(normalized.missingTermPlacement, "end");
}

function testBoundedCandidatePool() {
  const random = createSeededRandom("pool");
  const options = normalizeNumericPatternOptions("extend_pattern", {
    minStart: 0,
    maxStart: 3,
    minStep: 2,
    maxStep: 2,
    visibleLength: 4,
    continuationCount: 1,
    maxValue: 9
  });
  const pool = buildCandidatePool("extend_pattern", options, random);

  assert(pool.length > 0, "candidate pool should be non-empty");
  pool.forEach((candidate) => {
    assert(candidate.sequence.every((value) => value >= 0 && value <= 9));
    assert.strictEqual(candidate.step, 2);
  });
}

function testDuplicateAvoidanceAndControlledRepeat() {
  const random = createSeededRandom("repeat");
  const usedProblemKeys = new Set();
  const generatorState = {};
  const options = {
    random,
    usedProblemKeys,
    generatorState,
    minStart: 1,
    maxStart: 1,
    sequenceStep: 1,
    visibleLength: 4,
    continuationCount: 1,
    maxValue: 10,
    questionCount: 2
  };

  const first = buildNumericPatternProblem("extend_pattern", options);
  const second = buildNumericPatternProblem("extend_pattern", options);

  assert.strictEqual(first.prompt, second.prompt, "tight pool should repeat after unique candidates are exhausted");
  assert.strictEqual(usedProblemKeys.size, 2, "repeated candidate should be tracked with a repeat key");
  assert.strictEqual(second.diagnostics[0].code, "low_variety_candidate_pool");
}

function testGenerators() {
  const random = createSeededRandom("generators");
  const shared = { random, usedProblemKeys: new Set(), generatorState: {} };

  const extended = buildNumericPatternProblem("extend_pattern", {
    ...shared,
    sequenceStep: 3,
    minStart: 2,
    maxStart: 2
  });
  assert(!extended.prompt.includes("Extend the pattern"));
  assert(extended.prompt.endsWith("__"));
  assert.strictEqual(extended.answer, "14");
  assert.strictEqual(extended.patternKind, "extend_pattern");
  assert.strictEqual(extended.continuationCount, 1);
  assertArithmeticSequence(extended.sequence, 3);

  const missing = buildNumericPatternProblem("missing_value_pattern", {
    ...shared,
    operationMode: "subtract",
    startingValue: 20,
    sequenceStep: 4,
    sequenceLength: 5,
    missingTermPlacement: "middle"
  });
  assert(missing.prompt.includes("__"));
  assert.strictEqual(missing.answer, "12");
  assert.strictEqual(missing.patternKind, "missing_value_pattern");
  assert.strictEqual(missing.patternRule, "Subtract 4 each time.");
  assert.deepStrictEqual(missing.responseValues, [12]);
  assertArithmeticSequence(missing.sequence, 4, "subtract");

  const rule = buildNumericPatternProblem("identify_pattern_rule", {
    ...shared,
    operationMode: "subtract",
    startingValue: 15,
    sequenceStep: 3
  });
  assert.strictEqual(rule.answer, "Subtract 3 each time.");
  assert.strictEqual(rule.prompt, "15, 12, 9, 6, 3");
  assert.strictEqual(rule.patternRule, "Subtract 3 each time.");

  const table = buildNumericPatternProblem("function_table", {
    ...shared,
    startingValue: 6,
    sequenceStep: 5
  });
  assert(table.prompt.includes("Function table"));
  assert.strictEqual(table.answer, "11");
  assert.deepStrictEqual(table.responseValues, [11]);
}

function testCatalogRuntime() {
  [
    "grade2_patterning_and_algebra_extend_pattern",
    "grade2_patterning_and_algebra_missing_value_pattern",
    "grade2_patterning_and_algebra_identify_pattern_rule",
    "grade3_patterning_and_algebra_extend_pattern",
    "grade3_patterning_and_algebra_missing_value_pattern",
    "grade3_patterning_and_algebra_identify_pattern_rule",
    "grade4_patterning_and_algebra_extend_pattern",
    "grade4_patterning_and_algebra_missing_value_pattern",
    "grade4_patterning_and_algebra_identify_pattern_rule",
    "grade3_patterning_and_algebra_function_table",
    "grade4_patterning_and_algebra_function_table"
  ].forEach((resourceId) => {
    const runtime = assertReadyRuntime(resourceId, {
      worksheetSeed: `${resourceId}-seed`,
      questionCount: 12
    });
    assert.strictEqual(runtime.contentObject.content.items.length, 12);
    if (!resourceId.includes("function_table")) {
      assertNoRepeatedPromptText(runtime);
    }
  });
}

async function testGrade2ControlledCorrection() {
  const expected = Object.freeze({
    grade2_patterning_and_algebra_extend_pattern: {
      title: "Extend Pattern",
      instruction: "Extend each pattern. Write the next number.",
      mode: "extend_pattern"
    },
    grade2_patterning_and_algebra_identify_pattern_rule: {
      title: "Identify Pattern Rule",
      instruction: "Write the rule for each pattern.",
      mode: "identify_pattern_rule"
    },
    grade2_patterning_and_algebra_missing_value_pattern: {
      title: "Missing Value Pattern",
      instruction: "Write the missing number in each pattern.",
      mode: "missing_value_pattern"
    }
  });

  assert.deepStrictEqual(Object.keys(expected), [...GRADE2_NUMERIC_PATTERN_IDS]);

  for (const resourceId of GRADE2_NUMERIC_PATTERN_IDS) {
    const query = { worksheetSeed: "grade2-controlled-correction", questionCount: 12 };
    const runtime = buildCatalogWorksheetRuntime(resourceId, query);
    const repeat = buildCatalogWorksheetRuntime(resourceId, query);
    const spec = expected[resourceId];
    const items = runtime.contentObject.content.items;
    const answerItems = buildAnswerKeyItems(items);

    assert.strictEqual(runtime.item.status, "ready");
    assert.strictEqual(runtime.layout.header.title, spec.title);
    assert.strictEqual(runtime.contentObject.meta.title, spec.title);
    assert(!runtime.layout.header.title.includes("— Grade 2"));
    assert.strictEqual(runtime.layout.header.subtitle, "");
    assert.strictEqual(runtime.layout.instruction, spec.instruction);
    assert.strictEqual(runtime.layout.display.patterningLayout, spec.mode);
    assert.strictEqual(runtime.layout.template.columns, 2);
    assert.strictEqual(runtime.layout.template.maxProblemsPerPage, resourceId.includes("extend_pattern") ? 16 : 12);
    assert.strictEqual(runtime.layout.display.denseGridRows, 6);
    assert(runtime.layout.display.patterningSequenceFontSize >= 16);
    assert(runtime.layout.display.patterningTargetStrokeWidth >= 1.1);
    assert.strictEqual(items.length, 12);
    assert(items.every((item) => !item.isExample), `${resourceId} default should be fully unanswered`);
    assert.strictEqual(runtime.layout.display.includeExample, undefined);
    assert.deepStrictEqual(runtimeSignatures(runtime), runtimeSignatures(repeat));
    assert.strictEqual(answerItems.length, items.length);
    answerItems.forEach((answerItem, index) => {
      assert.strictEqual(answerItem.id, items[index].id);
      assert.strictEqual(answerItem.answer, items[index].answer);
    });

    if (spec.mode === "extend_pattern") {
      items.forEach((item) => {
        assert.strictEqual(item.continuationCount, 1);
        assert.strictEqual(item.continuationAnswers.length, 1);
        assert.strictEqual(item.continuationAnswers[0], item.sequence[item.sequence.length - 1]);
        assert.strictEqual(String(item.continuationAnswers[0]), String(item.answer));
      });
      assert(runtime.layout.display.patterningExtendTargetWidth >= 68);
    }

    if (spec.mode === "missing_value_pattern") {
      items.forEach((item) => {
        assert.strictEqual(item.missingIndexes.length, 1);
        assert(item.missingIndexes[0] > 0);
        assert(item.missingIndexes[0] < item.sequence.length - 1);
        assert.strictEqual(item.sequence[item.missingIndexes[0]], null);
        assert.strictEqual(String(item.responseValues[0]), String(item.answer));
      });
      assert(runtime.layout.display.patterningMissingTargetWidth >= 64);
    }

    if (spec.mode === "identify_pattern_rule") {
      assert.strictEqual(runtime.layout.display.patterningRuleResponseMode, "written_rule");
      items.forEach((item) => {
        assert.strictEqual(item.patternOperation, "add");
        assert.strictEqual(item.sequence[1] - item.sequence[0], item.step);
        const response = rendererTest.patterningRuleResponseParts(item, runtime.layout.display);
        assert.deepStrictEqual(response, { prefix: "Rule:", answer: item.patternRule, suffix: "" });
      });
    }

    const pdf = await renderRuntimePdf(runtime);
    assert.strictEqual(pdfPageCount(pdf), 2, `${resourceId} should render one student page and one answer-key page`);
    assert.strictEqual(runtime.layout.patterningPagination.pageCount, 1);
    assert.deepStrictEqual(runtime.layout.patterningPagination.pageItemCounts, [12]);
  }

  const grade1 = buildCatalogWorksheetRuntime("grade1_patterning_and_algebra_extend_pattern", {
    worksheetSeed: "grade1-isolation",
    questionCount: 12
  });
  assert.strictEqual(grade1.layout.header.title, "Extend Pattern");
  assert.notStrictEqual(grade1.layout.display.patterningSequenceFontSize, 16);

  const grade3 = buildCatalogWorksheetRuntime("grade3_patterning_and_algebra_identify_pattern_rule", {
    worksheetSeed: "grade3-isolation",
    questionCount: 12
  });
  assert.strictEqual(grade3.layout.instruction, "Write the rule for each pattern.");
  assert.strictEqual(grade3.layout.template.columns, 1);
  assert.strictEqual(grade3.layout.template.maxProblemsPerPage, 8);
  assert.strictEqual(grade3.layout.display.patterningRuleResponseMode, "written_rule");
}

function testPatterningLayoutContract() {
  const extend = buildCatalogWorksheetRuntime("grade2_patterning_and_algebra_extend_pattern", {
    worksheetSeed: "layout-extend",
    questionCount: 16
  });
  assert.strictEqual(extend.layout.header.subtitle, "");
  assert.strictEqual(extend.layout.instruction, "Extend each pattern. Write the next number.");
  assert.strictEqual(extend.layout.template.columns, 2);
  assert.strictEqual(extend.layout.template.maxProblemsPerPage, 16);
  assert.strictEqual(extend.layout.display.patterningLayout, "extend_pattern");
  assert(extend.layout.display.patterningSequenceFontSize >= 13);
  assert.strictEqual(extend.layout.display.patterningTargetStrokeColor, "#68788f");
  assert.strictEqual(extend.layout.display.patterningTargetStrokeWidth, 1.15);
  assert.strictEqual(extend.contentObject.meta.curriculum.footerText, "Grade 2 • Math • Patterning & Algebra");
  assert(!extend.contentObject.meta.curriculum.footerText.includes("patterning_and_algebra"));
  assertNoRepeatedPromptText(extend);

  [1, 2, 3].forEach((continuationCount) => {
    const runtime = buildCatalogWorksheetRuntime("grade3_patterning_and_algebra_extend_pattern", {
      worksheetSeed: `cont-${continuationCount}`,
      questionCount: 4,
      continuationCount
    });
    assert.strictEqual(runtime.contentObject.content.items[0].continuationCount, continuationCount);
    assert.strictEqual(runtime.contentObject.content.items[0].continuationAnswers.length, continuationCount);
    assert(runtime.layout.template.maxProblemsPerPage >= (continuationCount === 3 ? 10 : 12));
    assert.strictEqual(
      runtime.layout.instruction,
      continuationCount > 1
        ? "Extend each pattern. Write the next numbers."
        : "Extend each pattern. Write the next number."
    );
  });

  const missingOne = buildCatalogWorksheetRuntime("grade2_patterning_and_algebra_missing_value_pattern", {
    worksheetSeed: "missing-one",
    questionCount: 12,
    missingTermPlacement: "beginning"
  });
  assert.strictEqual(missingOne.layout.instruction, "Write the missing number in each pattern.");
  assert.strictEqual(missingOne.layout.template.columns, 2);
  assert.strictEqual(missingOne.layout.template.maxProblemsPerPage, 12);
  assert.strictEqual(missingOne.layout.display.patterningTargetStrokeColor, "#68788f");
  assert.strictEqual(missingOne.layout.display.patterningTargetStrokeWidth, 1.15);
  assert.strictEqual(missingOne.contentObject.content.items[0].missingIndexes[0], 0);

  const missingTwo = buildCatalogWorksheetRuntime("grade4_patterning_and_algebra_missing_value_pattern", {
    worksheetSeed: "missing-two",
    questionCount: 10,
    missingTermCount: 2,
    missingTermPlacement: "end"
  });
  assert.strictEqual(
    missingTwo.layout.instruction,
    "Find the rule. Then write the missing numbers in each pattern."
  );
  assert.strictEqual(missingTwo.layout.template.maxProblemsPerPage, 12);
  assert.strictEqual(missingTwo.contentObject.content.items[0].missingIndexes.length, 2);

  const missingMiddle = buildCatalogWorksheetRuntime("grade2_patterning_and_algebra_missing_value_pattern", {
    worksheetSeed: "missing-middle",
    questionCount: 4,
    missingTermPlacement: "middle"
  });
  assert(missingMiddle.contentObject.content.items[0].missingIndexes[0] > 0);

  const missingMixed = buildCatalogWorksheetRuntime("grade4_patterning_and_algebra_missing_value_pattern", {
    worksheetSeed: "missing-mixed",
    questionCount: 4,
    missingTermCount: 2,
    missingTermPlacement: "random"
  });
  assert.strictEqual(missingMixed.contentObject.content.items[0].missingTermPlacement, "mixed");

  const identify = buildCatalogWorksheetRuntime("grade4_patterning_and_algebra_identify_pattern_rule", {
    worksheetSeed: "layout-rule",
    questionCount: 8
  });
  assert.strictEqual(identify.layout.instruction, "Write the rule for each number pattern.");
  assert.strictEqual(identify.layout.template.columns, 1);
  assert.strictEqual(identify.layout.template.maxProblemsPerPage, 10);
  assert.strictEqual(identify.layout.display.patterningSequenceFontSize, 13);
  assert.strictEqual(identify.layout.display.patterningLayout, "identify_pattern_rule");
  assert(identify.contentObject.content.items.every((item) => item.patternRule === item.answer));
}

function testPatterningPaginationBalance() {
  const cases = [
    ["grade3_patterning_and_algebra_extend_pattern", { worksheetSeed: "extend-example", questionCount: 12, includeExample: true, continuationCount: 2 }],
    ["grade4_patterning_and_algebra_missing_value_pattern", { worksheetSeed: "missing-two", questionCount: 12, missingTermCount: 2, missingTermPlacement: "end" }],
    ["grade4_patterning_and_algebra_missing_value_pattern", { worksheetSeed: "missing-example", questionCount: 12, includeExample: true }],
    ["grade3_patterning_and_algebra_identify_pattern_rule", { worksheetSeed: "rule-example", questionCount: 8, includeExample: true, operationMode: "mixed" }],
    ["grade4_patterning_and_algebra_extend_pattern", { worksheetSeed: "extend-default", questionCount: 12, questionsPerPage: 12 }],
    ["grade4_patterning_and_algebra_identify_pattern_rule", { worksheetSeed: "multi", questionCount: 18, questionsPerPage: 10 }]
  ];

  cases.forEach(([resourceId, query]) => {
    const runtime = buildCatalogWorksheetRuntime(resourceId, query);
    const distribution = renderRuntimeForPagination(runtime);
    assert(distribution, `${resourceId} should record Patterning pagination`);
    assertNoUnsafeOrphan(distribution);
    assert(distribution.pageItemCounts.every((count) => count <= distribution.capacity));
    assertContinuousSourceIds(runtime);
  });

  const multi = buildCatalogWorksheetRuntime("grade4_patterning_and_algebra_identify_pattern_rule", {
    worksheetSeed: "multi",
    questionCount: 18,
    questionsPerPage: 10
  });
  const multiDistribution = renderRuntimeForPagination(multi);
  assert.deepStrictEqual(multiDistribution.pageItemCounts, [9, 9]);

  const identifyExample = buildCatalogWorksheetRuntime("grade3_patterning_and_algebra_identify_pattern_rule", {
    worksheetSeed: "rule-example",
    questionCount: 8,
    includeExample: true,
    operationMode: "mixed"
  });
  const identifyDistribution = renderRuntimeForPagination(identifyExample);
  assert.deepStrictEqual(identifyDistribution.pageItemCounts, [9]);
}

function testSameSeedParityAndQuestionCount() {
  const query = {
    worksheetSeed: "same-seed",
    questionCount: 18,
    includeExample: true
  };
  const first = buildCatalogWorksheetRuntime("grade4_patterning_and_algebra_missing_value_pattern", query);
  const second = buildCatalogWorksheetRuntime("grade4_patterning_and_algebra_missing_value_pattern", query);

  assert.deepStrictEqual(runtimeSignatures(first), runtimeSignatures(second));
  assert.strictEqual(first.contentObject.content.items.length, 19);
  assert.strictEqual(first.contentObject.content.items.filter((item) => item.isExample).length, 1);
  assert(first.contentObject.content.items[0].isExample, "first item should be completed example");
  assert.strictEqual(first.contentObject.content.items[1].id, 2, "stored id preserves source ordering");
  assert.strictEqual(first.contentObject.content.items.slice(1).length, 18, "example remains additional");
  assertContinuousSourceIds(first);
}

function testAnswerMetadata() {
  const runtime = buildCatalogWorksheetRuntime("grade3_patterning_and_algebra_missing_value_pattern", {
    worksheetSeed: "answer-metadata",
    questionCount: 12,
    sequenceStep: 2,
    missingTermPlacement: "beginning"
  });

  runtime.contentObject.content.items.forEach((item) => {
    assert(Array.isArray(item.sequence), "missing-value item should expose a sequence");
    assert(Array.isArray(item.missingIndexes), "missing-value item should expose missingIndexes");
    assert.strictEqual(item.missingIndexes[0], 0);
    assert.deepStrictEqual(item.responseValues.map(String).join(", "), String(item.answer));
  });
}

function testMultiPageAndSkipCountingRegression() {
  const multi = buildCatalogWorksheetRuntime("grade4_patterning_and_algebra_identify_pattern_rule", {
    worksheetSeed: "multi",
    questionCount: 18,
    questionsPerPage: 10
  });
  assert.strictEqual(multi.contentObject.content.items.length, 18);
  assert.strictEqual(multi.layout.template.maxProblemsPerPage, 10);
  assert.strictEqual(multi.layout.display.patterningLayout, "identify_pattern_rule");

  const skip = buildCatalogWorksheetRuntime("g2_skip_counting_by_2", {
    worksheetSeed: "skip-regression",
    questionCount: 10
  });
  assert.strictEqual(skip.contentObject.content.items.length, 10);
  assert.strictEqual(skip.layout.display.skipCountingRow, true);
  assert.strictEqual(skip.layout.display.patterningLayout, undefined);
  assert(!skip.contentObject.meta.curriculum.footerText.includes("counting_patterns"));
  assert(!skip.contentObject.meta.curriculum.footerText.includes("_"));
  skip.contentObject.content.items.forEach((item) => {
    assert.strictEqual(item.step, 2);
    assert(Array.isArray(item.sequence));
    assert(item.sequence.includes(null), "skip-counting sequence should keep missing term marker");
  });
}

function testFunctionTableDeferred() {
  const runtime = buildCatalogWorksheetRuntime("grade3_patterning_and_algebra_function_table", {
    worksheetSeed: "function-deferred",
    questionCount: 4
  });
  assert.notStrictEqual(runtime.layout.display.patterningPublicReady, true);
  assert.notStrictEqual(runtime.layout.display.patterningLayout, "function_table");
}

async function run() {
  testOptionNormalization();
  testBoundedCandidatePool();
  testDuplicateAvoidanceAndControlledRepeat();
  testGenerators();
  testCatalogRuntime();
  await testGrade2ControlledCorrection();
  testPatterningLayoutContract();
  testPatterningPaginationBalance();
  testSameSeedParityAndQuestionCount();
  testAnswerMetadata();
  testMultiPageAndSkipCountingRegression();
  testFunctionTableDeferred();
  console.log("Numeric Patterning runtime tests passed.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
