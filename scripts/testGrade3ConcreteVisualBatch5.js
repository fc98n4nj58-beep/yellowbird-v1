"use strict";

const assert = require("assert");
const { Writable } = require("stream");

const { getCustomizationFamilyForResource } = require("../config/worksheetCustomization");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { getAnyWorksheetCatalogById } = require("../services/worksheetCatalogService");
const { buildAnswerKeyItems, renderWorksheetPDF, __test: rendererTest } = require("../renderers/pdfRenderer");

const IDS = Object.freeze({
  sharing: "g3_equal_sharing_division",
  fraction: "grade3_fraction_equivalence_shade_fraction_models",
  numberLine: "grade3_place_value_representation_number_line_identify"
});
const SPECS = Object.freeze({
  [IDS.sharing]: {
    title: "Equal Sharing Division",
    instruction: "Share the dots equally. Complete the division equation.",
    footer: "Grade 3 • Math • Multiplication and Division",
    status: "partial",
    questionCount: 8,
    pageCount: 6
  },
  [IDS.fraction]: {
    title: "Shade the Fraction",
    instruction: "Shade each model to show the fraction.",
    footer: "Grade 3 • Math • Fractions",
    status: "generated",
    questionCount: 8,
    pageCount: 2
  },
  [IDS.numberLine]: {
    title: "Identify Numbers on a Number Line",
    instruction: "Write the number shown by the point on each number line.",
    footer: "Grade 3 • Math • Place Value",
    status: "generated",
    questionCount: 6,
    pageCount: 2
  }
});

class MemoryResponse extends Writable {
  constructor() { super(); this.chunks = []; }
  setHeader() {}
  _write(chunk, encoding, callback) { this.chunks.push(Buffer.from(chunk)); callback(); }
  buffer() { return Buffer.concat(this.chunks); }
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
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
      options: { filename: "grade3-concrete-visual-batch5-test.pdf", includeAnswerKey }
    });
  });
}

function signature(runtime) {
  return runtime.normalizedContentObject.content.items.map((item) => ({
    prompt: item.prompt,
    answer: item.answer,
    responseMode: item.responseMode,
    responseTarget: item.responseTarget,
    responseValues: item.responseValues,
    taskMode: item.taskMode,
    visual: item.visual,
    groups: item.groups,
    itemsPerGroup: item.itemsPerGroup,
    quotient: item.quotient,
    modelGrouping: item.modelGrouping,
    numerator: item.numerator,
    denominator: item.denominator,
    partCount: item.partCount,
    shadeCount: item.shadeCount,
    fractionModel: item.fractionModel,
    answerState: item.answerState,
    minValue: item.minValue,
    maxValue: item.maxValue,
    interval: item.interval,
    tickCount: item.tickCount,
    targetValue: item.targetValue,
    targetIndex: item.targetIndex,
    displayedLabels: item.displayedLabels,
    duplicateSignature: item.duplicateSignature,
    isExample: item.isExample
  }));
}

function assertPublicContract(runtime, id) {
  const spec = SPECS[id];
  const publicText = JSON.stringify({
    title: runtime.layout.header.title,
    instruction: runtime.layout.instruction,
    footer: runtime.contentObject.meta.curriculum.footerText
  });
  assert.strictEqual(runtime.item.status, spec.status);
  assert.strictEqual(runtime.layout.header.title, spec.title);
  assert.strictEqual(runtime.contentObject.meta.title, spec.title);
  assert.strictEqual(runtime.layout.header.subtitle, "");
  assert.strictEqual(runtime.layout.instruction, spec.instruction);
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, spec.footer);
  assert.strictEqual(runtime.normalizedContentObject.content.items.length, spec.questionCount);
  assert(!publicText.includes("— Grade 3"));
  assert(!publicText.includes(id));
  assert(!publicText.includes("_"));
  assert.strictEqual(getCustomizationFamilyForResource(id), null);
}

function assertKeyParity(items, fields) {
  const keyItems = buildAnswerKeyItems(items);
  assert.strictEqual(keyItems.length, items.length);
  fields.forEach((field) => {
    assert.deepStrictEqual(
      keyItems.map((item) => item[field]),
      items.map((item) => item[field]),
      `${field} student/key parity`
    );
  });
}

function assertEqualSharing(runtime) {
  const items = runtime.normalizedContentObject.content.items;
  assert.strictEqual(runtime.layout.template.columns, 1);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 3);
  assert.strictEqual(runtime.layout.display.divisionModel, true);
  assert.strictEqual(runtime.layout.display.equalSharingTaskMode, "distribute");
  assert.strictEqual(runtime.layout.display.divisionEquationBlanks, true);
  assert.strictEqual(new Set(items.map((item) => item.modelKey)).size, items.length);
  assert.strictEqual(new Set(items.map((item) => item.prompt)).size, items.length);
  items.forEach((item) => {
    assert.strictEqual(item.visual.kind, "equal_sharing");
    assert.strictEqual(item.taskMode, "distribute");
    assert.strictEqual(item.responseMode, "division_sentence");
    assert.strictEqual(item.responseTarget, "items_per_group");
    assert(item.groups >= 2 && item.groups <= 6);
    assert(item.itemsPerGroup >= 2 && item.itemsPerGroup <= 6);
    assert.strictEqual(item.total, item.groups * item.itemsPerGroup);
    assert(item.total <= 36);
    assert.strictEqual(item.total % item.groups, 0);
    assert.strictEqual(item.quotient, item.itemsPerGroup);
    assert.strictEqual(item.answer, item.itemsPerGroup);
    assert.deepStrictEqual(item.responseValues, [item.total, item.groups, item.itemsPerGroup]);
    assert.deepStrictEqual(item.modelGrouping, Array(item.groups).fill(item.itemsPerGroup));
    assert.strictEqual(item.visual.data.total, item.total);
    assert.strictEqual(item.visual.data.groups, item.groups);
    assert.strictEqual(item.visual.data.itemsPerGroup, item.itemsPerGroup);
    assert(item.prompt.includes(`Share ${item.total} dots equally among ${item.groups} groups.`));
  });
  assertKeyParity(items, ["answer", "responseValues", "responseTarget", "visual", "groups", "itemsPerGroup", "quotient", "modelGrouping", "total"]);
  const measured = rendererTest.measureEqualSharingVisual(
    { total: 36, groups: 6, itemsPerGroup: 6, taskMode: "distribute" },
    500,
    120
  );
  assert(measured.width <= 500);
  assert(measured.height <= 120);
}

function assertFraction(runtime) {
  const items = runtime.normalizedContentObject.content.items;
  assert.strictEqual(runtime.layout.worksheetType, "fraction_visual");
  assert.strictEqual(runtime.layout.template.columns, 2);
  assert.strictEqual(runtime.layout.display.sharedFractionRenderer, true);
  assert.deepStrictEqual(runtime.layout.display.fractionAllowedDenominators, [2, 3, 4, 5, 6, 8]);
  assert.strictEqual(new Set(items.map((item) => item.duplicateSignature)).size, items.length);
  assert(new Set(items.map((item) => item.denominator)).size >= 6);
  items.forEach((item) => {
    const truth = item.fractionModel;
    const model = truth.models[0];
    assert.strictEqual(item.visual.kind, "fraction_strip");
    assert.strictEqual(item.responseMode, "shade_model");
    assert.strictEqual(item.responseTarget, "shaded_parts");
    assert.strictEqual(item.modelType, "strip");
    assert(item.numerator >= 1 && item.numerator < item.denominator);
    assert([2, 3, 4, 5, 6, 8].includes(item.denominator));
    assert.strictEqual(item.partCount, item.denominator);
    assert.strictEqual(item.shadeCount, item.numerator);
    assert.strictEqual(item.answer, `${item.numerator}/${item.denominator}`);
    assert.strictEqual(model.partitionCount, item.denominator);
    assert.strictEqual(model.shadedParts, 0);
    assert.strictEqual(item.answerState.shadedParts, item.numerator);
    const geometry = rendererTest.buildFractionStripGeometry({
      x: 0,
      y: 0,
      width: 176,
      height: 62,
      partitionCount: item.denominator,
      allowedPartitionCounts: [2, 3, 4, 5, 6, 8]
    });
    assert.strictEqual(geometry.parts.length, item.denominator);
    geometry.parts.forEach((part) => assert(Math.abs(part.width - geometry.partWidth) < 1e-9));
  });
  assertKeyParity(items, ["answer", "responseTarget", "numerator", "denominator", "partCount", "shadeCount", "fractionModel", "answerState", "visual"]);
}

function assertNumberLine(runtime) {
  const items = runtime.normalizedContentObject.content.items;
  assert.strictEqual(runtime.layout.template.columns, 1);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 6);
  assert.strictEqual(runtime.layout.display.numberLineFullContentWidth, true);
  assert.strictEqual(runtime.layout.display.numberLineAnswerUnderTarget, true);
  assert.strictEqual(runtime.layout.display.numberLineEndpointSafeInset, true);
  assert.strictEqual(runtime.layout.display.hideItemPrompts, true);
  assert.strictEqual(new Set(items.map((item) => item.duplicateSignature)).size, items.length);
  assert(items.some((item) => item.targetIndex === 0));
  assert(items.some((item) => item.targetIndex === item.tickCount));
  items.forEach((item) => {
    const data = item.visual.data;
    assert.strictEqual(item.visual.kind, "number_line");
    assert.strictEqual(item.responseMode, "shortNumeral");
    assert.strictEqual(item.responseTarget, "number_line_value");
    assert([10, 25, 50, 100].includes(item.interval));
    assert.strictEqual(item.tickCount, 10);
    assert.strictEqual(item.maxValue - item.minValue, item.interval * item.tickCount);
    assert.strictEqual(item.targetValue, item.minValue + item.targetIndex * item.interval);
    assert.strictEqual(item.answer, item.targetValue);
    assert.deepStrictEqual(item.displayedLabels, Array.from(
      { length: item.tickCount + 1 },
      (_, index) => item.minValue + index * item.interval
    ));
    assert.strictEqual(data.start, item.minValue);
    assert.strictEqual(data.end, item.maxValue);
    assert.strictEqual(data.targetIndex, item.targetIndex);
    assert.strictEqual(data.value, item.targetValue);
    const measured = rendererTest.measureNumberLineVisual(data, 500, 80, { forceFullWidth: true });
    assert.strictEqual(measured.width, 500);
  });
  assertKeyParity(items, ["answer", "responseTarget", "responseValues", "minValue", "maxValue", "interval", "tickCount", "targetValue", "targetIndex", "endpointPolicy", "displayedLabels", "visual"]);
}

function assertVariableContracts() {
  const sharing = buildCatalogWorksheetRuntime(IDS.sharing, {
    worksheetSeed: "g3-b5-sharing-selectors",
    questionCount: 4,
    selectedGroups: "2,3",
    onlyItemsPerGroup: "4,5",
    maxTotal: 15,
    equationSupport: "independent",
    showQuestionSentence: false
  });
  sharing.normalizedContentObject.content.items.forEach((item) => {
    assert([2, 3].includes(item.groups));
    assert([4, 5].includes(item.itemsPerGroup));
    assert(item.total <= 15);
    assert.strictEqual(item.prompt, "");
  });
  assert.strictEqual(sharing.layout.display.divisionEquationIndependent, true);
  assert.throws(
    () => buildCatalogWorksheetRuntime(IDS.sharing, { taskMode: "circle_groups" }),
    /share-into-groups mode only/
  );

  const selectedFractions = buildCatalogWorksheetRuntime(IDS.fraction, {
    worksheetSeed: "g3-b5-fraction-selected",
    questionCount: 4,
    selectedFractions: ["1/3", "2/3", "1/5", "4/5"]
  });
  assert.deepStrictEqual(
    new Set(selectedFractions.normalizedContentObject.content.items.map((item) => item.answer)),
    new Set(["1/3", "2/3", "1/5", "4/5"])
  );
  const denominatorControl = buildCatalogWorksheetRuntime(IDS.fraction, {
    worksheetSeed: "g3-b5-fraction-denominators",
    questionCount: 4,
    selectedDenominators: "3,5"
  });
  assert(denominatorControl.normalizedContentObject.content.items.every((item) => [3, 5].includes(item.denominator)));
  assert.throws(
    () => buildCatalogWorksheetRuntime(IDS.fraction, { selectedDenominators: [7] }),
    /supports denominators/
  );

  for (const intervalKey of ["allowedIntervals", "intervals", "selectedIntervals"]) {
    const runtime = buildCatalogWorksheetRuntime(IDS.numberLine, {
      worksheetSeed: `g3-b5-number-line-${intervalKey}`,
      questionCount: 3,
      [intervalKey]: "25"
    });
    assert(runtime.normalizedContentObject.content.items.every((item) => item.interval === 25));
  }
  const selectedTarget = buildCatalogWorksheetRuntime(IDS.numberLine, {
    worksheetSeed: "g3-b5-number-line-target",
    questionCount: 4,
    minA: 100,
    maxA: 1000,
    onlyNumbers: "500"
  });
  assert(selectedTarget.normalizedContentObject.content.items.every((item) => item.targetValue === 500));
  const interior = buildCatalogWorksheetRuntime(IDS.numberLine, {
    worksheetSeed: "g3-b5-number-line-interior",
    allowEndpointTargets: false
  });
  assert(interior.normalizedContentObject.content.items.every((item) => item.targetIndex > 0 && item.targetIndex < 10));
}

function assertExamplesAndIsolation() {
  for (const id of Object.values(IDS)) {
    const runtime = buildCatalogWorksheetRuntime(id, {
      worksheetSeed: `g3-b5-example-${id}`,
      completedExample: true
    });
    assert.strictEqual(runtime.normalizedContentObject.content.items[0].isExample, true);
    assert.strictEqual(runtime.normalizedContentObject.content.items.length, SPECS[id].questionCount + 1);
  }
  const fraction = buildCatalogWorksheetRuntime(IDS.fraction, {
    worksheetSeed: "g3-b5-fraction-example",
    example: true
  });
  assert(fraction.normalizedContentObject.content.items[0].fractionWorkedModel);
  assert.strictEqual(fraction.layout.display.separateWorkedModel, true);

  const grade2Groups = buildCatalogWorksheetRuntime("grade2_multiplication_facts_equal_groups", {
    worksheetSeed: "g3-b5-grade2-groups"
  });
  assert.strictEqual(grade2Groups.normalizedContentObject.content.items.length, 8);
  assert(grade2Groups.normalizedContentObject.content.items.every((item) => item.visual.kind === "equal_groups"));
  const grade2Fraction = buildCatalogWorksheetRuntime("grade2_fraction_equivalence_shade_fraction_models", {
    worksheetSeed: "g3-b5-grade2-fraction"
  });
  assert.strictEqual(grade2Fraction.normalizedContentObject.content.items.length, 8);
  assert.deepStrictEqual(grade2Fraction.layout.display.fractionAllowedDenominators, [2, 3, 4, 6]);
  const grade2Line = buildCatalogWorksheetRuntime("grade2_place_value_representation_number_line_identify", {
    worksheetSeed: "g3-b5-grade2-line"
  });
  assert.strictEqual(grade2Line.normalizedContentObject.content.items.length, 6);
  assert(grade2Line.normalizedContentObject.content.items.every((item) => item.answer <= 200));
}

async function run() {
  Object.values(IDS).forEach((id) => {
    const item = getAnyWorksheetCatalogById(id);
    assert(item);
    assert.strictEqual(item.status, SPECS[id].status);
  });

  let sameSeedFailures = 0;
  for (const id of Object.values(IDS)) {
    const observed = new Set();
    for (let seedIndex = 0; seedIndex < 30; seedIndex += 1) {
      const options = { worksheetSeed: `g3-concrete-b5-${id}-${seedIndex}` };
      const runtime = buildCatalogWorksheetRuntime(id, options);
      const repeat = buildCatalogWorksheetRuntime(id, options);
      assertPublicContract(runtime, id);
      if (id === IDS.sharing) assertEqualSharing(runtime);
      if (id === IDS.fraction) assertFraction(runtime);
      if (id === IDS.numberLine) assertNumberLine(runtime);
      try {
        assert.deepStrictEqual(signature(runtime), signature(repeat));
      } catch (error) {
        sameSeedFailures += 1;
      }
      observed.add(JSON.stringify(signature(runtime)));
    }
    assert(observed.size > 1, `Expected different-seed variation for ${id}.`);
    const runtime = buildCatalogWorksheetRuntime(id, { worksheetSeed: `g3-concrete-b5-pdf-${id}` });
    const pdf = await render(runtime);
    assert(pdf.length > 5000);
    assert.strictEqual(pageCount(pdf), SPECS[id].pageCount);
  }
  assert.strictEqual(sameSeedFailures, 0);
  assertVariableContracts();
  assertExamplesAndIsolation();

  console.log(
    "Grade 3 Concrete Visual Batch 5 checks passed; 30 seeds per resource; " +
    "defaults 8/8/6; PDFs 6/2/2; same-seed failures: 0."
  );
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
