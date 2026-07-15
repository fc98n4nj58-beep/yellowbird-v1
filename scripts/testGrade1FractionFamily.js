const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { getAnyWorksheetCatalogById } = require("../services/worksheetCatalogService");
const { buildAnswerKeyItems, renderWorksheetPDF, __test: rendererTest } = require("../renderers/pdfRenderer");
const {
  RESOURCE_TASKS,
  TASK_COUNTS,
  FAIR_SHARE_OBJECTS,
  buildFairShareTruth,
  getDivisibleFairShareObject,
  generateGrade1FractionProblem,
  validateGrade1FractionWorksheet
} = require("../engine/problemGenerators/grade1Fractions");

const RESOURCES = Object.freeze([
  {
    id: "grade1_fraction_equivalence_shade_fraction_models",
    title: "Shade Equal Parts",
    instruction: "Shade the equal parts to show each fraction.",
    taskMode: "shade_equal_parts",
    count: 6,
    visualKind: "fraction_strip"
  },
  {
    id: "grade1_fraction_equivalence_match_equivalent_fractions",
    title: "One Half and Two Fourths",
    instruction: "Look at each pair. Circle Yes if the shaded parts show the same amount. Circle No if they do not.",
    taskMode: "half_two_fourths",
    count: 4,
    visualKind: "fraction_strip"
  },
  {
    id: "grade1_fraction_equivalence_compare_fractions",
    title: "Compare Fair Shares",
    instruction: "Look at each pair. Circle the share that is greater, or circle Same.",
    taskMode: "compare_fair_shares",
    count: 6,
    visualKind: "fraction_strip"
  },
  {
    id: "grade1_fraction_equivalence_fraction_word_problems",
    title: "Share Fairly",
    instruction: "Share the objects equally. You may split one object into equal halves. Draw whole objects and halves where needed.",
    taskMode: "share_fairly",
    count: 3,
    visualKind: "fair_share_set"
  }
]);

const NUMBER_LINE_ID = "grade1_fraction_equivalence_fraction_number_line";
const ALL_FIVE_IDS = [...RESOURCES.map(({ id }) => id), NUMBER_LINE_ID];
const ALLOWED_SYMBOLS = new Set(["1/2", "1/3", "1/4", "2/4", "3/4"]);
const APPROVED_DIVISIBLE_OBJECTS = new Set(["apple", "sandwich", "granola_bar", "paper_strip"]);
const INDIVISIBLE_CLASSROOM_OBJECTS = /counter|button|pencil|crayon|book|toy|block|marble|folder|eraser|glue stick/i;

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
    responseValues: item.responseValues,
    taskMode: item.taskMode,
    fractionModel: item.fractionModel,
    fractionWorkedModel: item.fractionWorkedModel,
    answerState: item.answerState,
    visual: item.visual,
    isExample: item.isExample,
    duplicateSignature: item.duplicateSignature
  }));
}

function validateStrip(model) {
  assert.strictEqual(model.kind, "fraction_strip");
  assert([2, 3, 4].includes(model.partitionCount));
  assert(Number.isInteger(model.shadedParts));
  assert(model.shadedParts >= 0 && model.shadedParts <= model.partitionCount);
  assert.strictEqual(model.wholeWidthUnits, 1);
  assert.strictEqual(model.wholeHeightUnits, 1);
  const geometry = rendererTest.buildFractionStripGeometry({
    x: 0,
    y: 0,
    width: 176,
    height: 62,
    partitionCount: model.partitionCount
  });
  assert.strictEqual(geometry.parts.length, model.partitionCount);
  geometry.parts.forEach((part) => assert(Math.abs(part.width - geometry.partWidth) < 1e-9));
  assert(Math.abs(geometry.parts.reduce((sum, part) => sum + part.width, 0) - geometry.width) < 1e-9);
}

function validateModelPair(item) {
  const models = item.fractionModel.models;
  assert.strictEqual(models.length, 2);
  models.forEach(validateStrip);
  assert.strictEqual(models[0].wholeSizeId, models[1].wholeSizeId);
  assert.strictEqual(models[0].wholeWidthUnits, models[1].wholeWidthUnits);
  assert.strictEqual(models[0].wholeHeightUnits, models[1].wholeHeightUnits);
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

async function run() {
  for (const resource of RESOURCES) {
    assert.strictEqual(RESOURCE_TASKS[resource.id], resource.taskMode);
    assert.strictEqual(TASK_COUNTS[resource.taskMode], resource.count);
    const catalogItem = getAnyWorksheetCatalogById(resource.id);
    assert.strictEqual(catalogItem.title, resource.title);
    assert.strictEqual(catalogItem.studentInstruction, resource.instruction);
    assert.strictEqual(catalogItem.status, "generated");
    assert.strictEqual(catalogItem.templateId, "visual_model");

    const first = buildCatalogWorksheetRuntime(resource.id, { worksheetSeed: "grade1-fraction-determinism" });
    const second = buildCatalogWorksheetRuntime(resource.id, { worksheetSeed: "grade1-fraction-determinism" });
    assert.deepStrictEqual(signature(first), signature(second));
    assert.strictEqual(first.layout.header.title, resource.title);
    assert.strictEqual(first.layout.instruction, resource.instruction);
    assert.strictEqual(first.layout.display.grade1FractionTaskMode, resource.taskMode);
    assert.strictEqual(first.layout.display.grade1FractionRenderer, true);
    assert.notStrictEqual(first.layout.worksheetType, "equation_practice");
    assert.strictEqual(first.contentObject.content.items.length, resource.count);
    assert.strictEqual(first.normalizedContentObject.content.items.length, resource.count);
    assert.deepStrictEqual(
      first.normalizedContentObject.content.items.map(({ fractionModel }) => fractionModel),
      first.contentObject.content.items.map(({ fractionModel }) => fractionModel)
    );

    first.contentObject.content.items.forEach((item) => {
      assert(item.visual && item.visual.kind === resource.visualKind);
      assert(item.fractionModel && item.fractionModel.kind === resource.visualKind);
      assert(item.answerState);
      assert.strictEqual(item.taskMode, resource.taskMode);
      assert(!JSON.stringify(item).includes("fraction_number_line"));
      assert(!/[<>]=?|\+\s*\d|\d\s*[×÷]\s*\d/.test(item.prompt));
      assert(!/numerator|denominator|cross.?multiply/i.test(item.prompt));
    });

    const answers = buildAnswerKeyItems(first.contentObject.content.items);
    assert.deepStrictEqual(answers.map(({ fractionModel }) => fractionModel), first.contentObject.content.items.map(({ fractionModel }) => fractionModel));
    assert.deepStrictEqual(answers.map(({ answerState }) => answerState), first.contentObject.content.items.map(({ answerState }) => answerState));
    const pdf = await render(first);
    assert(pdf.length > 5000);
    assert.strictEqual(pdf.subarray(0, 4).toString(), "%PDF");
  }

  const shade = buildCatalogWorksheetRuntime(RESOURCES[0].id, { worksheetSeed: "grade1-shade" });
  assert.strictEqual(shade.layout.template.columns, 2);
  assert.strictEqual(shade.layout.template.maxProblemsPerPage, 6);
  assert.strictEqual(shade.layout.display.separateWorkedModel, true);
  assert(shade.contentObject.content.items[0].fractionWorkedModel);
  assert.strictEqual(shade.contentObject.content.items.filter(({ fractionWorkedModel }) => fractionWorkedModel).length, 1);
  assert(shade.contentObject.content.items.every(({ isExample }) => !isExample));
  assert.strictEqual(shade.contentObject.content.items.filter(({ fractionModel }) => fractionModel.requestedFraction.denominator === 3).length, 1);
  shade.contentObject.content.items.forEach((item) => {
    const requested = item.fractionModel.requestedFraction;
    assert(ALLOWED_SYMBOLS.has(requested.symbol));
    const model = item.fractionModel.models[0];
    validateStrip(model);
    assert.strictEqual(model.partitionCount, requested.denominator);
    assert.strictEqual(item.answerState.shadedParts, requested.numerator);
    assert(item.answerState.shadedParts <= model.partitionCount);
  });

  const match = buildCatalogWorksheetRuntime(RESOURCES[1].id, { worksheetSeed: "grade1-match", includeExample: true });
  assert.strictEqual(match.layout.template.columns, 1);
  assert.strictEqual(match.layout.template.maxProblemsPerPage, 4);
  assert(match.contentObject.content.items.every(({ isExample }) => !isExample));
  assert(match.contentObject.content.items.every(({ fractionWorkedModel }) => !fractionWorkedModel));
  const matchAnswers = new Set(match.contentObject.content.items.map(({ answer }) => answer));
  assert.deepStrictEqual(matchAnswers, new Set(["Yes", "No"]));
  match.contentObject.content.items.forEach((item) => {
    validateModelPair(item);
    assert(["Yes", "No"].includes(item.answerState.choice));
    assert.strictEqual(item.responseValues.length, 2);
    const [left, right] = item.fractionModel.models;
    const equal = left.shadedParts / left.partitionCount === right.shadedParts / right.partitionCount;
    assert.strictEqual(item.answerState.choice, equal ? "Yes" : "No");
    assert(left.partitionCount === 2 || right.partitionCount === 2);
    assert(left.partitionCount === 4 || right.partitionCount === 4);
  });

  const compareDefault = buildCatalogWorksheetRuntime(RESOURCES[2].id, { worksheetSeed: "grade1-compare" });
  const compareCompleted = buildCatalogWorksheetRuntime(RESOURCES[2].id, { worksheetSeed: "grade1-compare", includeExample: true });
  assert.strictEqual(compareDefault.layout.template.columns, 2);
  assert.strictEqual(compareDefault.layout.template.maxProblemsPerPage, 6);
  assert(compareDefault.contentObject.content.items.every(({ isExample }) => !isExample));
  assert.strictEqual(compareCompleted.contentObject.content.items.length, 6);
  assert.strictEqual(compareCompleted.contentObject.content.items.filter(({ isExample }) => isExample).length, 1);
  assert.strictEqual(compareCompleted.contentObject.content.items[0].isExample, true);
  assert.deepStrictEqual(
    compareDefault.contentObject.content.items.map(({ fractionModel, answerState }) => ({ fractionModel, answerState })),
    compareCompleted.contentObject.content.items.map(({ fractionModel, answerState }) => ({ fractionModel, answerState }))
  );
  assert.strictEqual(new Set(compareDefault.contentObject.content.items.map(({ duplicateSignature }) => duplicateSignature)).size, 6);
  compareDefault.contentObject.content.items.forEach((item) => {
    validateModelPair(item);
    assert.deepStrictEqual(item.responseValues, ["left", "Same", "right"]);
    assert(["left", "Same", "right"].includes(item.answerState.choice));
    const [left, right] = item.fractionModel.models;
    const leftValue = left.shadedParts / left.partitionCount;
    const rightValue = right.shadedParts / right.partitionCount;
    const expected = leftValue === rightValue ? "Same" : leftValue > rightValue ? "left" : "right";
    assert.strictEqual(item.answerState.choice, expected);
  });

  const share = buildCatalogWorksheetRuntime(RESOURCES[3].id, { worksheetSeed: "grade1-share", includeExample: true });
  assert.strictEqual(share.layout.template.columns, 1);
  assert.strictEqual(share.layout.template.maxProblemsPerPage, 3);
  assert.strictEqual(share.layout.display.separateWorkedModel, true);
  assert.strictEqual(share.contentObject.content.items.filter(({ fractionWorkedModel }) => fractionWorkedModel).length, 1);
  assert(share.contentObject.content.items.every(({ isExample }) => !isExample));
  const shareWorked = share.contentObject.content.items.find(({ fractionWorkedModel }) => fractionWorkedModel).fractionWorkedModel;
  assert.strictEqual(shareWorked.model.objectType, "sandwich");
  assert.strictEqual(shareWorked.model.wholeShape, "sandwich_rectangle");
  assert.strictEqual(shareWorked.model.halfShape, "sandwich_triangle");
  assert.strictEqual(shareWorked.model.canSplitIntoHalves, true);
  assert(/may cut one sandwich into equal halves/i.test(shareWorked.prompt));
  assert.deepStrictEqual(shareWorked.answerState.trayWholeObjects, [1, 1]);
  assert.deepStrictEqual(shareWorked.answerState.trayHalfObjects, [1, 1]);
  assert.strictEqual(shareWorked.answerState.sourceWholeEquivalentUsed, 3);
  const shareObjectTypes = new Set();
  share.contentObject.content.items.forEach((item) => {
    const model = item.fractionModel;
    shareObjectTypes.add(model.objectType);
    assert.strictEqual(model.kind, "fair_share_set");
    assert(APPROVED_DIVISIBLE_OBJECTS.has(model.objectType));
    assert(!INDIVISIBLE_CLASSROOM_OBJECTS.test(JSON.stringify(model)));
    assert.strictEqual(model.canSplitIntoHalves, true);
    assert(model.wholeShape);
    assert(model.halfShape);
    assert(/You may (cut|split) one .+ into equal halves\./.test(model.splitInstruction));
    assert(item.prompt.includes(model.splitInstruction));
    assert([2, 4].includes(model.sharerCount));
    assert.strictEqual(model.remainderWholeEquivalent, model.sharerCount / 2);
    assert.strictEqual(model.wholeEquivalentTotal, model.wholeObjectsPerSharer * model.sharerCount + model.remainderWholeEquivalent);
    assert.strictEqual(model.halfObjectsPerSharer, 1);
    assert.strictEqual(item.answerState.trayWholeObjects.length, model.sharerCount);
    assert.strictEqual(item.answerState.trayHalfObjects.length, model.sharerCount);
    assert(item.answerState.trayWholeObjects.every((count) => count === model.wholeObjectsPerSharer));
    assert(item.answerState.trayHalfObjects.every((count) => count === 1));
    assert.strictEqual(item.answerState.sourceWholeEquivalentUsed, model.wholeEquivalentTotal);
    const distributed = item.answerState.trayWholeObjects.reduce((sum, count) => sum + count, 0)
      + item.answerState.trayHalfObjects.reduce((sum, count) => sum + count / 2, 0);
    assert.strictEqual(distributed, model.wholeEquivalentTotal);
  });
  assert.deepStrictEqual(shareObjectTypes, new Set(["apple", "granola_bar", "paper_strip"]));
  assert.strictEqual(Object.keys(FAIR_SHARE_OBJECTS).length, 4);
  Object.values(FAIR_SHARE_OBJECTS).forEach((object) => {
    assert(APPROVED_DIVISIBLE_OBJECTS.has(object.objectType));
    assert.strictEqual(object.canSplitIntoHalves, true);
  });
  assert.throws(() => getDivisibleFairShareObject("counter"), /Unsupported divisible fair-sharing object 'counter'/);
  assert.throws(
    () => buildFairShareTruth({ objectType: "apple", wholeEquivalentTotal: 5, sharerCount: 4 }),
    /cannot be shared using halves/
  );

  const shapeModels = [shareWorked.model, ...share.contentObject.content.items.map(({ fractionModel }) => fractionModel)];
  shapeModels.forEach((model) => {
    const whole = rendererTest.buildDivisibleObjectGeometry(model, 50, 50);
    const half = rendererTest.buildDivisibleObjectGeometry(model, 50, 50, { half: true });
    assert.strictEqual(whole.areaFraction, 1);
    assert.strictEqual(half.areaFraction, 0.5);
    assert.strictEqual(half.distinctHalfShape, true);
    assert.strictEqual(half.usesWholeShapeDivider, false);
    assert.notStrictEqual(whole.shape, half.shape);
    if (model.objectType === "apple") {
      assert.strictEqual(half.shape, "apple_semicircle");
      assert.strictEqual(half.width, whole.width / 2);
    }
    if (model.objectType === "sandwich") assert.strictEqual(half.shape, "sandwich_triangle");
    if (["granola_bar", "paper_strip"].includes(model.objectType)) assert.strictEqual(half.width, whole.width / 2);
  });

  assert.strictEqual(getAnyWorksheetCatalogById(NUMBER_LINE_ID).status, "generated");
  assert(!RESOURCE_TASKS[NUMBER_LINE_ID]);
  ALL_FIVE_IDS.forEach((id) => assert.strictEqual(getAnyWorksheetCatalogById(id).status, "generated"));
  assert.throws(() => generateGrade1FractionProblem({ worksheetId: NUMBER_LINE_ID }), /Unsupported Grade 1 fraction worksheet/);
  assert.throws(
    () => validateGrade1FractionWorksheet(RESOURCES[0].id, []),
    /requires exactly 6 items/
  );
  assert.throws(
    () => validateGrade1FractionWorksheet(RESOURCES[0].id, Array(6).fill({})),
    /missing its structured fraction_strip model/
  );

  [
    "grade2_fraction_equivalence_compare_fractions",
    "grade2_fraction_equivalence_fraction_number_line",
    "grade2_fraction_equivalence_fraction_word_problems",
    "grade2_fraction_equivalence_match_equivalent_fractions"
  ].forEach((id) => {
    const first = buildCatalogWorksheetRuntime(id, { worksheetSeed: "grade2-fraction-isolation" });
    const second = buildCatalogWorksheetRuntime(id, { worksheetSeed: "grade2-fraction-isolation" });
    assert.strictEqual(first.layout.display.grade1FractionRenderer, undefined);
    assert(first.contentObject.content.items.every(({ fractionModel }) => !fractionModel));
    assert.deepStrictEqual(signature(first), signature(second));
  });

  const grade2Shade = buildCatalogWorksheetRuntime(
    "grade2_fraction_equivalence_shade_fraction_models",
    { worksheetSeed: "grade2-fraction-isolation" }
  );
  assert.strictEqual(grade2Shade.layout.display.grade1FractionRenderer, undefined);
  assert.strictEqual(grade2Shade.layout.display.sharedFractionRenderer, true);
  assert.strictEqual(grade2Shade.contentObject.content.items.length, 8);
  assert(grade2Shade.contentObject.content.items.every(({ fractionModel }) => fractionModel?.kind === "fraction_strip"));

  const rendererSource = fs.readFileSync(path.join(__dirname, "..", "renderers", "pdfRenderer.js"), "utf8");
  assert(!/compareAnswer|cross.?multiply/i.test(rendererSource));
  assert(rendererSource.includes("grade1FractionRenderer"));
  assert(rendererSource.includes("fraction_strip"));
  assert(rendererSource.includes("fair_share_set"));
  assert.strictEqual(rendererTest.GRADE1_FRACTION_EXAMPLE_LABEL, "Try this one");
  assert(!rendererSource.includes("Worked model"));
  assert(!rendererSource.includes("drawObjectToken"));

  const reconciliation = fs.readFileSync(path.join(__dirname, "..", "docs", "grade-1-founder-review-reconciliation.md"), "utf8");
  assert(reconciliation.includes("| A. Committed + Founder Approved | 32 |"));
  assert(reconciliation.includes("| B. Founder Approved + Awaiting Promotion | 0 |"));
  assert(reconciliation.includes("| C. Implemented + awaiting founder proof | 0 |"));
  assert(reconciliation.includes("| F. Untouched / not yet reviewed | 0 |"));
  assert(reconciliation.includes("| G. Intentionally deferred | 17 |"));

  console.log("Grade 1 fraction family tests passed.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
