const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { getAnyWorksheetCatalogById } = require("../services/worksheetCatalogService");
const { buildAnswerKeyItems, renderWorksheetPDF, __test: rendererTest } = require("../renderers/pdfRenderer");
const {
  RESOURCE_ID,
  QUESTION_COUNT,
  ALLOWED_DENOMINATORS,
  FRACTION_TARGETS
} = require("../engine/problemGenerators/grade2ShadeEqualParts");

const TITLE = "Shade Equal Parts";
const INSTRUCTION = "Shade the fraction shown for each model.";
const FOOTER = "Grade 2 • Math • Fractions";
const EXPECTED_FRACTIONS = new Set(FRACTION_TARGETS.map(({ numerator, denominator }) => `${numerator}/${denominator}`));

class MemoryResponse extends Writable {
  constructor() { super(); this.chunks = []; }
  setHeader() {}
  _write(chunk, encoding, callback) { this.chunks.push(Buffer.from(chunk)); callback(); }
  buffer() { return Buffer.concat(this.chunks); }
}

function signature(runtime) {
  return runtime.contentObject.content.items.map((item) => ({
    prompt: item.prompt,
    answer: item.answer,
    responseMode: item.responseMode,
    responseType: item.responseType,
    taskMode: item.taskMode,
    layoutVariant: item.layoutVariant,
    fractionModel: item.fractionModel,
    fractionWorkedModel: item.fractionWorkedModel,
    answerState: item.answerState,
    visual: item.visual,
    isExample: item.isExample,
    duplicateSignature: item.duplicateSignature
  }));
}

function render(runtime) {
  return new Promise((resolve, reject) => {
    const response = new MemoryResponse();
    response.on("finish", () => resolve(response.buffer()));
    response.on("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.contentObject,
      layoutObject: runtime.layout,
      options: { includeAnswerKey: true }
    });
  });
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function validateRuntime(runtime) {
  assert.strictEqual(runtime.item.id, RESOURCE_ID);
  assert.strictEqual(runtime.item.status, "generated");
  assert.strictEqual(runtime.item.title, TITLE);
  assert.strictEqual(runtime.item.studentInstruction, INSTRUCTION);
  assert.strictEqual(runtime.item.templateId, "visual_model");
  assert.strictEqual(runtime.layout.header.title, TITLE);
  assert.strictEqual(runtime.layout.instruction, INSTRUCTION);
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, FOOTER);
  assert.strictEqual(runtime.layout.worksheetType, "fraction_visual");
  assert.strictEqual(runtime.layout.template.columns, 2);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, QUESTION_COUNT);
  assert.strictEqual(runtime.layout.display.sharedFractionRenderer, true);
  assert.strictEqual(runtime.layout.display.grade1FractionRenderer, undefined);
  assert.strictEqual(runtime.layout.display.separateWorkedModel, false);
  assert.strictEqual(runtime.layout.display.completedQuestionOne, false);
  assert.deepStrictEqual(runtime.layout.display.fractionAllowedDenominators, ALLOWED_DENOMINATORS);

  const items = runtime.contentObject.content.items;
  assert.strictEqual(items.length, QUESTION_COUNT);
  assert.strictEqual(runtime.normalizedContentObject.content.items.length, QUESTION_COUNT);
  assert.deepStrictEqual(new Set(items.map(({ prompt }) => prompt)), EXPECTED_FRACTIONS);
  assert.strictEqual(new Set(items.map(({ duplicateSignature }) => duplicateSignature)).size, QUESTION_COUNT);
  assert(items.every((item) => !Array.isArray(item)));

  items.forEach((item) => {
    const truth = item.fractionModel;
    const model = truth.models[0];
    assert.strictEqual(item.prompt, `${truth.numerator}/${truth.denominator}`);
    assert.strictEqual(item.answer, item.prompt);
    assert.strictEqual(item.taskMode, "shade_equal_parts");
    assert.strictEqual(item.responseMode, "shade_model");
    assert.strictEqual(item.responseType, "drawing");
    assert.strictEqual(item.layoutVariant, "fraction_strip_grid");
    assert.strictEqual(item.visual.kind, "fraction_strip");
    assert.strictEqual(truth.kind, "fraction_strip");
    assert.strictEqual(truth.modelType, "strip");
    assert(ALLOWED_DENOMINATORS.includes(truth.denominator));
    assert(Number.isInteger(truth.numerator));
    assert(truth.numerator >= 1 && truth.numerator <= truth.denominator);
    assert.strictEqual(truth.partCount, truth.denominator);
    assert.strictEqual(truth.shadeCount, truth.numerator);
    assert.strictEqual(model.kind, "fraction_strip");
    assert.strictEqual(model.partitionCount, truth.denominator);
    assert.strictEqual(model.shadedParts, 0);
    assert.strictEqual(item.answerState.shadedParts, truth.numerator);
    assert.strictEqual(item.fractionWorkedModel, null);
    assert.strictEqual(item.isExample, false);

    const geometry = rendererTest.buildFractionStripGeometry({
      x: 0,
      y: 0,
      width: 176,
      height: 62,
      partitionCount: truth.denominator,
      allowedPartitionCounts: ALLOWED_DENOMINATORS
    });
    assert.strictEqual(geometry.parts.length, truth.denominator);
    assert(geometry.partWidth >= 176 / 6);
    geometry.parts.forEach((part) => assert(Math.abs(part.width - geometry.partWidth) < 1e-9));
    assert(Math.abs(geometry.parts.reduce((sum, part) => sum + part.width, 0) - 176) < 1e-9);
  });

  const answers = buildAnswerKeyItems(items);
  assert.deepStrictEqual(answers.map(({ fractionModel }) => fractionModel), items.map(({ fractionModel }) => fractionModel));
  assert.deepStrictEqual(answers.map(({ answerState }) => answerState), items.map(({ answerState }) => answerState));
}

async function run() {
  const catalogItem = getAnyWorksheetCatalogById(RESOURCE_ID);
  assert(catalogItem);
  assert.strictEqual(catalogItem.status, "generated");

  let sameSeedFailures = 0;
  const differentSeedOrders = new Set();
  for (let index = 0; index < 30; index += 1) {
    const worksheetSeed = `grade2-shade-seed-${index}`;
    const first = buildCatalogWorksheetRuntime(RESOURCE_ID, { worksheetSeed, includeExample: true });
    const second = buildCatalogWorksheetRuntime(RESOURCE_ID, { worksheetSeed, includeExample: true });
    validateRuntime(first);
    try {
      assert.deepStrictEqual(signature(first), signature(second));
    } catch (error) {
      sameSeedFailures += 1;
    }
    differentSeedOrders.add(first.contentObject.content.items.map(({ prompt }) => prompt).join(","));
  }
  assert.strictEqual(sameSeedFailures, 0);
  assert(differentSeedOrders.size > 1, "different worksheet seeds must vary the item order");

  const proofRuntime = buildCatalogWorksheetRuntime(RESOURCE_ID, { worksheetSeed: "grade2-shade-founder" });
  const pdf = await render(proofRuntime);
  assert(pdf.length > 5000);
  assert.strictEqual(pdf.subarray(0, 4).toString(), "%PDF");
  assert.strictEqual(pageCount(pdf), 2);

  const grade1 = buildCatalogWorksheetRuntime("grade1_fraction_equivalence_shade_fraction_models", {
    worksheetSeed: "grade1-shade-isolation"
  });
  assert.strictEqual(grade1.contentObject.content.items.length, 6);
  assert.strictEqual(grade1.layout.display.grade1FractionRenderer, true);
  assert.strictEqual(grade1.layout.display.sharedFractionRenderer, undefined);
  assert.strictEqual(grade1.layout.display.separateWorkedModel, true);
  assert(grade1.contentObject.content.items.every(({ fractionModel }) => [2, 3, 4].includes(fractionModel.models[0].partitionCount)));

  const grade3 = buildCatalogWorksheetRuntime("grade3_fraction_equivalence_shade_fraction_models", {
    worksheetSeed: "grade3-shade-isolation"
  });
  assert.strictEqual(grade3.layout.display.sharedFractionRenderer, undefined);
  assert.strictEqual(grade3.layout.display.grade1FractionRenderer, undefined);
  assert(grade3.contentObject.content.items.every(({ fractionModel }) => !fractionModel));

  const shareFairly = getAnyWorksheetCatalogById("grade2_fraction_equivalence_fraction_word_problems");
  assert.strictEqual(shareFairly.title, "Fraction Word Problems — Grade 2");
  assert.strictEqual(shareFairly.status, "generated");
  const shareRuntime = buildCatalogWorksheetRuntime(shareFairly.id, { worksheetSeed: "share-remains-untouched" });
  assert.strictEqual(shareRuntime.contentObject.content.items.length, 0);

  const reconciliation = fs.readFileSync(
    path.join(__dirname, "..", "docs", "grade-2-architecture-reconciliation-preflight.md"),
    "utf8"
  );
  assert(reconciliation.includes(`\`${RESOURCE_ID}\``));
  assert(reconciliation.includes("**A (23):**"));
  assert(reconciliation.includes("**D (6):**"));

  const generatorSource = fs.readFileSync(
    path.join(__dirname, "..", "engine", "problemGenerators", "grade2ShadeEqualParts.js"),
    "utf8"
  );
  assert(!generatorSource.includes("Math.random"));

  console.log(JSON.stringify({
    resourceId: RESOURCE_ID,
    seedsChecked: 30,
    sameSeedFailures,
    differentSeedOrders: differentSeedOrders.size,
    questionCount: QUESTION_COUNT,
    denominators: ALLOWED_DENOMINATORS,
    pageCount: 2,
    answerKeyParity: true,
    grade1Isolation: true,
    grade3Isolation: true,
    shareFairlyUntouched: true
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
