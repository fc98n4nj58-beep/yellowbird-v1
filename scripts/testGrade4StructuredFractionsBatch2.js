"use strict";

const assert = require("assert");
const { Writable } = require("stream");

const { getCustomizationFamilyForResource } = require("../config/worksheetCustomization");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { buildAnswerKeyItems, renderWorksheetPDF, __test: rendererTest } = require("../renderers/pdfRenderer");

const IDS = Object.freeze({
  compare: "grade4_fraction_equivalence_compare_fractions",
  numberLine: "grade4_fraction_equivalence_fraction_number_line",
  shade: "grade4_fraction_equivalence_shade_fraction_models"
});
const SPECS = Object.freeze({
  [IDS.compare]: { title: "Compare Fractions", instruction: "Write >, <, or = to compare each pair of fractions.", status: "ready", count: 12 },
  [IDS.numberLine]: { title: "Fractions on a Number Line", instruction: "Write the fraction shown by the point on each number line.", status: "generated", count: 6 },
  [IDS.shade]: { title: "Shade the Fraction", instruction: "Shade each model to show the fraction.", status: "generated", count: 8 }
});
const COMPARE_DENOMINATORS = Object.freeze([2, 3, 4, 5, 6, 8, 10, 12]);
const LINE_DENOMINATORS = Object.freeze([2, 3, 4, 5, 6, 8, 10]);

class MemoryResponse extends Writable {
  constructor() { super(); this.chunks = []; }
  setHeader() {}
  _write(chunk, encoding, callback) { this.chunks.push(Buffer.from(chunk)); callback(); }
  buffer() { return Buffer.concat(this.chunks); }
}

function render(runtime, includeAnswerKey = true) {
  return new Promise((resolve, reject) => {
    const response = new MemoryResponse();
    response.once("finish", () => resolve(response.buffer()));
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: { filename: "grade4-structured-fractions-batch2-test.pdf", includeAnswerKey }
    });
  });
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function items(runtime) {
  return runtime.normalizedContentObject.content.items;
}

function signature(runtime) {
  return items(runtime).map((item) => ({
    prompt: item.prompt,
    answer: item.answer,
    responseValues: item.responseValues,
    expectedSymbol: item.expectedSymbol,
    numerator: item.numerator,
    denominator: item.denominator,
    targetIndex: item.targetIndex,
    visual: item.visual,
    answerState: item.answerState,
    duplicateSignature: item.duplicateSignature,
    isExample: item.isExample
  }));
}

function assertPublicContract(runtime) {
  const spec = SPECS[runtime.item.id];
  const publicText = JSON.stringify({
    title: runtime.layout.header.title,
    subtitle: runtime.layout.header.subtitle,
    instruction: runtime.layout.instruction,
    footer: runtime.contentObject.meta.curriculum.footerText
  });
  assert.strictEqual(runtime.item.status, spec.status);
  assert.strictEqual(runtime.layout.header.title, spec.title);
  assert.strictEqual(runtime.contentObject.meta.title, spec.title);
  assert.strictEqual(runtime.layout.header.subtitle, "");
  assert.strictEqual(runtime.layout.instruction, spec.instruction);
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, "Grade 4 • Math • Fractions");
  assert.strictEqual(items(runtime).length, spec.count);
  assert(!publicText.includes("— Grade 4"));
  assert(!publicText.includes(runtime.item.id));
  assert(!publicText.includes("fraction_equivalence"));
  assert.strictEqual(getCustomizationFamilyForResource(runtime.item.id), null);
}

function assertKeyParity(runtime, fields) {
  const student = items(runtime);
  const key = buildAnswerKeyItems(student);
  assert.strictEqual(key.length, student.length);
  fields.forEach((field) => {
    assert.deepStrictEqual(key.map((item) => item[field]), student.map((item) => item[field]), `${runtime.item.id} ${field} parity`);
  });
}

function assertCompare(runtime) {
  const problems = items(runtime);
  assert.strictEqual(runtime.layout.template.columns, 2);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 12);
  assert.deepStrictEqual(
    problems.reduce((counts, item) => ({ ...counts, [item.expectedSymbol]: (counts[item.expectedSymbol] || 0) + 1 }), {}),
    { "<": 4, ">": 4, "=": 4 }
  );
  assert.strictEqual(new Set(problems.map((item) => item.duplicateSignature)).size, problems.length);
  problems.forEach((item) => {
    assert(COMPARE_DENOMINATORS.includes(item.leftDenominator));
    assert(COMPARE_DENOMINATORS.includes(item.rightDenominator));
    assert(item.leftNumerator >= 1 && item.leftNumerator < item.leftDenominator);
    assert(item.rightNumerator >= 1 && item.rightNumerator < item.rightDenominator);
    const left = item.leftNumerator * item.rightDenominator;
    const right = item.rightNumerator * item.leftDenominator;
    const symbol = left < right ? "<" : left > right ? ">" : "=";
    assert.strictEqual(item.leftCrossProduct, left);
    assert.strictEqual(item.rightCrossProduct, right);
    assert.strictEqual(item.expectedSymbol, symbol);
    assert.strictEqual(item.answer, symbol);
    assert.strictEqual(item.equalityState, symbol === "=");
    assert.strictEqual(item.answerState.symbol, symbol);
    assert.strictEqual(item.answerState.equalityState, symbol === "=");
  });
  assertKeyParity(runtime, [
    "answer", "leftNumerator", "leftDenominator", "rightNumerator", "rightDenominator",
    "leftCrossProduct", "rightCrossProduct", "normalizedLeftFraction", "normalizedRightFraction",
    "expectedSymbol", "equalityState", "duplicateSignature", "answerState"
  ]);
}

function assertNumberLine(runtime) {
  const problems = items(runtime);
  assert.strictEqual(runtime.layout.template.columns, 1);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 6);
  assert.strictEqual(runtime.layout.display.numberLineFullContentWidth, true);
  assert.strictEqual(runtime.layout.display.numberLineAnswerUnderTarget, true);
  assert.strictEqual(new Set(problems.map((item) => item.duplicateSignature)).size, problems.length);
  problems.forEach((item) => {
    assert(LINE_DENOMINATORS.includes(item.denominator));
    assert(item.numerator >= 1 && item.numerator < item.denominator);
    assert.strictEqual(item.wholeStart, 0);
    assert.strictEqual(item.wholeEnd, 1);
    assert.strictEqual(item.partCount, item.denominator);
    assert.strictEqual(item.intervalCount, item.denominator);
    assert.strictEqual(item.tickCount, item.denominator);
    assert.strictEqual(item.targetIndex, item.numerator);
    assert.strictEqual(item.targetNumerator, item.numerator);
    assert.strictEqual(item.targetDenominator, item.denominator);
    assert.strictEqual(item.answer, `${item.numerator}/${item.denominator}`);
    assert.strictEqual(item.displayedFractionLabels[item.targetIndex], item.answer);
    assert.deepStrictEqual(item.displayedFractionLabels, item.visual.data.fractionLabels);
    assert.strictEqual(item.answerState.partitionCount, item.denominator);
    assert.strictEqual(item.answerState.targetIndex, item.numerator);
  });
  assertKeyParity(runtime, [
    "answer", "numerator", "denominator", "partCount", "intervalCount", "tickCount", "targetIndex",
    "targetNumerator", "targetDenominator", "displayedFractionLabels", "endpointPolicy", "visual",
    "duplicateSignature", "answerState"
  ]);
  const geometry = rendererTest.measureNumberLineVisual(
    { min: 0, max: 1, interval: 0.1, tickCount: 10 },
    500,
    64,
    { forceFullWidth: true }
  );
  assert.strictEqual(geometry.width, 500);
  assert(geometry.height <= 64);
}

function assertShade(runtime) {
  const problems = items(runtime);
  assert.strictEqual(runtime.layout.worksheetType, "fraction_visual");
  assert.strictEqual(runtime.layout.template.columns, 2);
  assert.deepStrictEqual(runtime.layout.display.fractionAllowedDenominators, COMPARE_DENOMINATORS);
  assert.strictEqual(new Set(problems.map((item) => item.duplicateSignature)).size, problems.length);
  problems.forEach((item) => {
    const model = item.fractionModel.models[0];
    assert(COMPARE_DENOMINATORS.includes(item.denominator));
    assert(item.numerator >= 1 && item.numerator < item.denominator);
    assert.strictEqual(item.partCount, item.denominator);
    assert.strictEqual(item.shadeCount, item.numerator);
    assert.strictEqual(item.modelType, "strip");
    assert.strictEqual(model.partitionCount, item.denominator);
    assert.strictEqual(model.shadedParts, 0);
    assert.strictEqual(item.answerState.studentShadedParts, 0);
    assert.strictEqual(item.answerState.answerKeyShadedParts, item.numerator);
    assert.strictEqual(item.answerState.shadedParts, item.numerator);
    const geometry = rendererTest.buildFractionStripGeometry({
      x: 0,
      y: 0,
      width: 176,
      height: 62,
      partitionCount: item.denominator,
      allowedPartitionCounts: COMPARE_DENOMINATORS
    });
    assert.strictEqual(geometry.parts.length, item.denominator);
    assert(geometry.partWidth >= 14);
  });
  assertKeyParity(runtime, [
    "answer", "numerator", "denominator", "partCount", "shadeCount", "modelType",
    "fractionModel", "visual", "duplicateSignature", "answerState"
  ]);
}

function assertResource(runtime) {
  assertPublicContract(runtime);
  if (runtime.item.id === IDS.compare) assertCompare(runtime);
  if (runtime.item.id === IDS.numberLine) assertNumberLine(runtime);
  if (runtime.item.id === IDS.shade) assertShade(runtime);
}

async function assertVariablesAndAdversarialInputs() {
  const compare = buildCatalogWorksheetRuntime(IDS.compare, {
    worksheetSeed: "g4-b2-compare-selected",
    questionCount: 6,
    selectedDenominators: "6,10,12",
    selectedNumerators: "1,2,3,4,5,6,7,8,9,10,11",
    minNumerator: 1,
    maxNumerator: 11,
    equalPairs: 2
  });
  assert.strictEqual(items(compare).filter((item) => item.answer === "=").length, 2);
  assert(items(compare).every((item) => [6, 10, 12].includes(item.leftDenominator) && [6, 10, 12].includes(item.rightDenominator)));

  const selectedCompare = buildCatalogWorksheetRuntime(IDS.compare, {
    worksheetSeed: "g4-b2-compare-fractions",
    questionCount: 3,
    equalPairs: 1,
    selectedFractions: ["1/2", "2/4", "3/5", "5/10"]
  });
  assert.strictEqual(items(selectedCompare).filter((item) => item.answer === "=").length, 1);

  const line = buildCatalogWorksheetRuntime(IDS.numberLine, {
    worksheetSeed: "g4-b2-line-selected",
    questionCount: 2,
    selectedDenominators: [10],
    selectedFractions: ["3/10", "5/10"]
  });
  assert.deepStrictEqual(new Set(items(line).map((item) => item.answer)), new Set(["3/10", "5/10"]));

  const endpoints = buildCatalogWorksheetRuntime(IDS.numberLine, {
    worksheetSeed: "g4-b2-line-endpoints",
    questionCount: 4,
    selectedDenominators: [10],
    selectedFractions: ["0/10", "1/10", "9/10", "10/10"],
    endpointPolicy: "allowed"
  });
  assert.deepStrictEqual(items(endpoints).map((item) => item.targetIndex).sort((a, b) => a - b), [0, 1, 9, 10]);
  assert.deepStrictEqual(items(endpoints).map((item) => item.answer).sort(), ["0", "1", "1/10", "9/10"]);

  const shade = buildCatalogWorksheetRuntime(IDS.shade, {
    worksheetSeed: "g4-b2-shade-selected",
    questionCount: 4,
    selectedDenominators: [10, 12],
    selectedFractions: ["1/10", "9/10", "1/12", "11/12"],
    modelType: "fraction_strip"
  });
  assert.deepStrictEqual(new Set(items(shade).map((item) => item.answer)), new Set(["1/10", "9/10", "1/12", "11/12"]));

  for (const id of Object.values(IDS)) {
    for (const alias of ["includeExample", "completedExample", "example"]) {
      const runtime = buildCatalogWorksheetRuntime(id, { worksheetSeed: `g4-b2-${id}-${alias}`, [alias]: true });
      assert.strictEqual(items(runtime).filter((item) => item.isExample).length, 1);
      assert.strictEqual(items(runtime).filter((item) => !item.isExample).length, SPECS[id].count);
    }
  }

  const invalid = [
    [IDS.compare, { selectedDenominators: [] }],
    [IDS.compare, { selectedDenominators: [2, 2] }],
    [IDS.compare, { selectedDenominators: [2, 7] }],
    [IDS.compare, { selectedFractions: ["1/-2", "1/2"] }],
    [IDS.compare, { selectedDenominators: [2, 4], allowedDenominators: [2, 6] }],
    [IDS.compare, { selectedFractions: ["1/2", "1/2"] }],
    [IDS.compare, { selectedFractions: ["1/2", "2/0"] }],
    [IDS.compare, { selectedFractions: ["1/2", "3/2"] }],
    [IDS.compare, { selectedNumerators: [1, 1] }],
    [IDS.compare, { selectedNumerators: [1, 2.5] }],
    [IDS.compare, { minNumerator: 6, maxNumerator: 2 }],
    [IDS.compare, { includeEqualPairs: false, equalPairs: 1 }],
    [IDS.compare, { questionCount: 12, selectedFractions: ["1/2", "2/4"] }],
    [IDS.compare, { questionCount: 25 }],
    [IDS.compare, { questionCount: 24, questionsPerPage: 11 }],
    [IDS.compare, { example: "sometimes" }],
    [IDS.numberLine, { selectedDenominators: [12] }],
    [IDS.numberLine, { selectedFractions: ["0/10"] }],
    [IDS.numberLine, { selectedFractions: ["1/10", "1/10"] }],
    [IDS.numberLine, { allowEndpointTargets: false, endpointPolicy: "allowed" }],
    [IDS.numberLine, { taskMode: "locate_fraction" }],
    [IDS.numberLine, { wholeStart: 0, wholeEnd: 2 }],
    [IDS.numberLine, { selectedNumerators: [1, 2] }],
    [IDS.shade, { selectedFractions: ["0/4"] }],
    [IDS.shade, { selectedFractions: ["4/4"] }],
    [IDS.shade, { selectedFractions: ["1/7"] }],
    [IDS.shade, { modelType: "circle" }],
    [IDS.shade, { shadedParts: 2 }],
    [IDS.shade, { questionCount: 9 }],
    [IDS.shade, { allowEndpointTargets: true }]
  ];
  invalid.forEach(([id, options]) => {
    assert.throws(() => buildCatalogWorksheetRuntime(id, { worksheetSeed: "g4-b2-invalid", ...options }));
  });

  const compareMulti = buildCatalogWorksheetRuntime(IDS.compare, { worksheetSeed: "g4-b2-compare-multi", questionCount: 24, questionsPerPage: 12, equalPairs: 8 });
  const lineMulti = buildCatalogWorksheetRuntime(IDS.numberLine, { worksheetSeed: "g4-b2-line-multi", questionCount: 12, questionsPerPage: 6 });
  assert.strictEqual(pageCount(await render(compareMulti)), 4);
  assert.strictEqual(pageCount(await render(lineMulti)), 4);
}

async function run() {
  const defaults = Object.fromEntries(Object.values(IDS).map((id) => [id, buildCatalogWorksheetRuntime(id, { worksheetSeed: `g4-b2-default-${id}` })]));
  for (const runtime of Object.values(defaults)) assertResource(runtime);

  let sameSeedFailures = 0;
  const variations = Object.fromEntries(Object.values(IDS).map((id) => [id, new Set()]));
  for (let seed = 1; seed <= 30; seed += 1) {
    for (const id of Object.values(IDS)) {
      const first = buildCatalogWorksheetRuntime(id, { worksheetSeed: `g4-b2-${seed}` });
      const second = buildCatalogWorksheetRuntime(id, { worksheetSeed: `g4-b2-${seed}` });
      if (JSON.stringify(signature(first)) !== JSON.stringify(signature(second))) sameSeedFailures += 1;
      assertResource(first);
      variations[id].add(JSON.stringify(signature(first)));
    }
  }
  assert.strictEqual(sameSeedFailures, 0);
  Object.values(IDS).forEach((id) => assert(variations[id].size > 1));

  assert.strictEqual(pageCount(await render(defaults[IDS.compare])), 2);
  assert.strictEqual(pageCount(await render(defaults[IDS.numberLine])), 2);
  assert.strictEqual(pageCount(await render(defaults[IDS.shade])), 2);
  await assertVariablesAndAdversarialInputs();

  const grade3Compare = buildCatalogWorksheetRuntime("grade3_fraction_equivalence_compare_fractions", { worksheetSeed: "g4-b2-grade3-isolation" });
  const grade3Line = buildCatalogWorksheetRuntime("grade3_fraction_equivalence_fraction_number_line", { worksheetSeed: "g4-b2-grade3-line-isolation" });
  const grade3Shade = buildCatalogWorksheetRuntime("grade3_fraction_equivalence_shade_fraction_models", { worksheetSeed: "g4-b2-grade3-shade-isolation" });
  const grade2Shade = buildCatalogWorksheetRuntime("grade2_fraction_equivalence_shade_fraction_models", { worksheetSeed: "g4-b2-grade2-shade-isolation" });
  assert(items(grade3Compare).every((item) => [2, 3, 4, 5, 6, 8].includes(item.leftDenominator) && item.duplicateSignature.startsWith("grade3_fraction_compare:")));
  assert(items(grade3Line).every((item) => [2, 3, 4, 5, 6, 8].includes(item.denominator) && item.duplicateSignature.startsWith("grade3_fraction_number_line:")));
  assert(items(grade3Shade).every((item) => [2, 3, 4, 5, 6, 8].includes(item.denominator) && item.answerState.shadedParts === item.numerator));
  assert(items(grade2Shade).every((item) => [2, 3, 4, 6].includes(item.fractionModel.denominator) && item.fractionModel.models[0].shadedParts === 0));

  console.log("Grade 4 Structured Fractions Batch 2 tests passed: 30 seeds per resource; same-seed failures 0; default PDFs 2/2/2.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
