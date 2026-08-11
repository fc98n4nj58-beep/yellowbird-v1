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
  SHARER_COUNTS,
  SCENARIOS
} = require("../engine/problemGenerators/grade2ShareFairlyTo10");

const TITLE = "Share Fairly to 10";
const INSTRUCTION = "Share the objects equally. Write how many each person gets.";
const FOOTER = "Grade 2 • Math • Fractions";
const SCENARIO_IDS = new Set(SCENARIOS.map(({ scenarioId }) => scenarioId));

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

function permutations(values) {
  if (values.length <= 1) return [values];
  return values.flatMap((value, index) => permutations([
    ...values.slice(0, index),
    ...values.slice(index + 1)
  ]).map((rest) => [value, ...rest]));
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
  assert.strictEqual(runtime.layout.template.columns, 1);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 2);
  assert.strictEqual(runtime.layout.display.sharedFractionRenderer, true);
  assert.strictEqual(runtime.layout.display.grade1FractionRenderer, undefined);
  assert.strictEqual(runtime.layout.display.fairShareItemsPerPage, 2);
  assert.strictEqual(runtime.layout.display.fairShareMaxItemsPerPage, 2);
  assert.strictEqual(runtime.layout.display.fairShareTrayColumns, 3);
  assert.strictEqual(runtime.layout.display.fairShareMinimumTrayHeight, 190);
  assert.strictEqual(runtime.layout.display.fairShareMaxTrayRowsPerPage, 2);
  assert.strictEqual(runtime.layout.display.fairShareSlotGap, 18);
  assert.strictEqual(runtime.layout.display.fairShareResponseTarget, true);
  assert.strictEqual(runtime.layout.display.fairShareResponseTargetHeight, 29);
  assert.strictEqual(runtime.layout.display.fairShareAnswerKeySlotGap, 18);
  assert.strictEqual(runtime.layout.display.separateWorkedModel, false);
  assert.strictEqual(runtime.layout.display.completedQuestionOne, false);

  const items = runtime.contentObject.content.items;
  assert.strictEqual(items.length, QUESTION_COUNT);
  assert.strictEqual(runtime.normalizedContentObject.content.items.length, QUESTION_COUNT);
  assert.deepStrictEqual(new Set(items.map(({ fractionModel }) => fractionModel.sharerCount)), new Set(SHARER_COUNTS));
  assert.deepStrictEqual(new Set(items.map(({ fractionModel }) => fractionModel.context.scenarioId)), SCENARIO_IDS);
  assert.strictEqual(new Set(items.map(({ fractionModel }) => fractionModel.objectType)).size, QUESTION_COUNT);
  assert.strictEqual(new Set(items.map(({ duplicateSignature }) => duplicateSignature)).size, QUESTION_COUNT);
  assert(items.every((item) => !Array.isArray(item)));

  items.forEach((item, index) => {
    const model = item.fractionModel;
    const answer = item.answerState;
    assert.strictEqual(item.taskMode, "share_fairly");
    assert.strictEqual(item.responseMode, "fair_share_number");
    assert.strictEqual(item.responseType, "number");
    assert.strictEqual(item.layoutVariant, "fair_share_rows");
    assert.strictEqual(item.visual.kind, "fair_share_set");
    assert.strictEqual(model.kind, "fair_share_set");
    assert.strictEqual(model.modelType, "fair_share_set");
    assert(SHARER_COUNTS.includes(model.sharerCount));
    assert(Number.isInteger(model.totalObjects));
    assert(model.totalObjects > 0 && model.totalObjects <= 10);
    assert.strictEqual(model.totalObjects % model.sharerCount, 0);
    assert.strictEqual(model.remainderObjects, 0);
    assert.strictEqual(model.remainderWholeEquivalent, 0);
    assert(Number.isInteger(model.objectsPerPerson));
    assert(model.objectsPerPerson > 0);
    assert.strictEqual(model.objectsPerPerson, model.totalObjects / model.sharerCount);
    assert.strictEqual(item.answer, model.objectsPerPerson);
    assert.strictEqual(answer.objectsPerPerson, model.objectsPerPerson);
    assert.strictEqual(answer.trayWholeObjects.length, model.sharerCount);
    assert(answer.trayWholeObjects.every((count) => count === model.objectsPerPerson));
    assert(answer.trayHalfObjects.every((count) => count === 0));
    assert.strictEqual(answer.trayWholeObjects.reduce((sum, count) => sum + count, 0), model.totalObjects);
    assert.strictEqual(answer.totalObjectsDistributed, model.totalObjects);
    assert(model.objectType && model.wholeShape && model.context?.scenarioId);
    assert(item.prompt.length > 20 && item.prompt.length < 130);
    assert(/equally/i.test(item.prompt));
    assert(!/left over|leftover|remainder/i.test(item.prompt));
    assert(!/[+×÷=]|\bmixed\b|\bdecimal\b|\bimproper\b/i.test(item.prompt));
    assert(!/fraction_equivalence|grade2_|snake_case/i.test(item.prompt));
    assert.strictEqual(item.fractionWorkedModel, null);
    assert.strictEqual(item.isExample, false);
    if (index > 0) {
      assert.notStrictEqual(model.objectType, items[index - 1].fractionModel.objectType);
    }
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
    const worksheetSeed = `grade2-share-seed-${index}`;
    const first = buildCatalogWorksheetRuntime(RESOURCE_ID, { worksheetSeed, includeExample: true });
    const second = buildCatalogWorksheetRuntime(RESOURCE_ID, { worksheetSeed, includeExample: true });
    validateRuntime(first);
    try {
      assert.deepStrictEqual(signature(first), signature(second));
    } catch (error) {
      sameSeedFailures += 1;
    }
    differentSeedOrders.add(first.contentObject.content.items.map(({ fractionModel }) => fractionModel.context.scenarioId).join(","));
  }
  assert.strictEqual(sameSeedFailures, 0);
  assert(differentSeedOrders.size > 1, "different worksheet seeds must vary the scenario order");

  const proofRuntime = buildCatalogWorksheetRuntime(RESOURCE_ID, { worksheetSeed: "grade2-share-founder" });
  const pdf = await render(proofRuntime);
  assert(pdf.length > 5000);
  assert.strictEqual(pdf.subarray(0, 4).toString(), "%PDF");
  assert.strictEqual(pageCount(pdf), 8);

  const display = proofRuntime.layout.display;
  const pages = rendererTest.paginateFairShareItems(proofRuntime.contentObject.content.items, {
    trayColumns: display.fairShareTrayColumns,
    maxTrayRowsPerPage: display.fairShareMaxTrayRowsPerPage,
    maxItemsPerPage: display.fairShareMaxItemsPerPage
  });
  assert.strictEqual(pages.length, 4);
  permutations(proofRuntime.contentObject.content.items).forEach((orderedItems) => {
    const orderedPages = rendererTest.paginateFairShareItems(orderedItems, {
      trayColumns: display.fairShareTrayColumns,
      maxTrayRowsPerPage: display.fairShareMaxTrayRowsPerPage,
      maxItemsPerPage: display.fairShareMaxItemsPerPage
    });
    assert.deepStrictEqual(orderedPages.flat(), orderedItems);
    orderedPages.forEach((page) => {
      assert(page.length <= 2);
      const rowCount = page.reduce((sum, item) => sum + rendererTest.fairShareTrayRowCount(
        item.fractionModel,
        display.fairShareTrayColumns
      ), 0);
      assert(rowCount <= 2);
      if (page.some((item) => item.fractionModel.sharerCount >= 4)) assert.strictEqual(page.length, 1);
    });
  });
  const pageStartY = 168;
  const pageBottomY = 714;
  pages.forEach((page) => {
    const slots = rendererTest.buildFairSharePageSlots(pageStartY, pageBottomY, page.length, {
      slotGap: display.fairShareSlotGap,
      responseTarget: true,
      responseTargetHeight: display.fairShareResponseTargetHeight,
      items: page,
      minimumTrayHeight: display.fairShareMinimumTrayHeight,
      trayColumns: display.fairShareTrayColumns
    });
    slots.forEach((slot, slotIndex) => {
      assert(slot.modelBox.y >= slot.y);
      assert(slot.modelBox.y + slot.modelBox.height < slot.responseY);
      assert(slot.responseY < slot.bottom);
      assert(slot.bottom <= pageBottomY);
      if (slotIndex > 0) assert.strictEqual(slot.y - slots[slotIndex - 1].bottom, 18);
      const item = page[slotIndex];
      const modelBox = { x: 58, y: slot.modelBox.y, width: 496, height: slot.modelBox.height };
      const geometry = rendererTest.buildFairShareModelGeometry(item.fractionModel, modelBox, {
        trayColumns: display.fairShareTrayColumns
      });
      assert.strictEqual(geometry.trayColumns, 3);
      assert(Math.abs(geometry.trayWidth - (326 / 3)) < 0.001);
      geometry.trays.forEach((tray) => assert(Math.abs(tray.height - 190) < 0.001));
      geometry.trays.forEach((tray) => {
        assert(tray.x >= modelBox.x);
        assert(tray.y >= modelBox.y);
        assert(tray.x + tray.width <= modelBox.x + modelBox.width);
        assert(tray.y + tray.height <= modelBox.y + modelBox.height);
        const objectRows = rendererTest.buildFairShareObjectRowsGeometry(
          item.fractionModel,
          tray,
          item.answerState.objectsPerPerson
        );
        assert(objectRows.innerPadding >= 6);
        objectRows.rows.forEach((row) => {
          assert.strictEqual(
            row.rowWidth,
            row.objectCount * row.objectWidth + (row.objectCount - 1) * row.objectGap
          );
          assert(Math.abs(row.startX - (objectRows.innerX + (objectRows.innerWidth - row.rowWidth) / 2)) < 0.001);
          assert(Math.abs((row.startX + row.rowWidth / 2) - (tray.x + tray.width / 2)) < 0.001);
          row.objects.forEach((object, objectIndex) => {
            assert(object.left >= objectRows.innerX - 0.001);
            assert(object.right <= objectRows.innerX + objectRows.innerWidth + 0.001);
            if (objectIndex > 0) {
              assert(row.objects[objectIndex - 1].right <= object.left + 0.001);
            }
          });
        });
      });
      if (item.fractionModel.sharerCount === 6) {
        assert.strictEqual(geometry.trayColumns, 3);
        assert.strictEqual(geometry.trayRows, 2);
      }
    });
  });
  assert.deepStrictEqual(
    new Set(proofRuntime.contentObject.content.items.map((item) => item.answerState.objectsPerPerson)),
    new Set([1, 2, 3, 4])
  );
  const granolaScenario = proofRuntime.contentObject.content.items.find(
    (item) => item.fractionModel.objectType === "granola_bar"
  );
  assert(granolaScenario);
  assert.strictEqual(granolaScenario.answerState.objectsPerPerson, 3);
  [1, 2, 3, 4].forEach((answer) => {
    const response = rendererTest.formatFairShareAnswerResponse(answer);
    assert.strictEqual(response, `Each person gets ${answer}.`);
    assert(!/\d\s+\./.test(response), "answer-key responses must not contain a space before the period");
  });

  const grade1 = buildCatalogWorksheetRuntime("grade1_fraction_equivalence_fraction_word_problems", {
    worksheetSeed: "grade1-share-isolation"
  });
  assert.strictEqual(grade1.contentObject.content.items.length, 3);
  assert.strictEqual(grade1.layout.display.grade1FractionRenderer, true);
  assert.strictEqual(grade1.layout.display.sharedFractionRenderer, undefined);
  assert.strictEqual(grade1.layout.display.separateWorkedModel, true);
  assert(grade1.contentObject.content.items.every(({ fractionModel }) => [2, 4].includes(fractionModel.sharerCount)));
  assert(grade1.contentObject.content.items.every(({ fractionModel }) => fractionModel.halfObjectsPerSharer === 1));

  const grade3 = buildCatalogWorksheetRuntime("grade3_fraction_equivalence_fraction_word_problems", {
    worksheetSeed: "grade3-share-isolation"
  });
  assert.strictEqual(grade3.layout.display.sharedFractionRenderer, undefined);
  assert.strictEqual(grade3.layout.display.grade1FractionRenderer, undefined);
  assert.strictEqual(grade3.contentObject.content.items.length, 0);

  const reconciliation = fs.readFileSync(
    path.join(__dirname, "..", "docs", "grade-2-architecture-reconciliation-preflight.md"),
    "utf8"
  );
  assert(reconciliation.includes("**A (35):**"));
  assert(reconciliation.includes("**D (0):**"));
  const categoryALine = reconciliation.split("\n").find((line) => line.startsWith("- **A (35):**"));
  const categoryDLine = reconciliation.split("\n").find((line) => line.startsWith("- **D (0):**"));
  assert(categoryALine && categoryALine.includes(`\`${RESOURCE_ID}\``));
  assert(categoryDLine && !categoryDLine.includes(`\`${RESOURCE_ID}\``));

  const generatorSource = fs.readFileSync(
    path.join(__dirname, "..", "engine", "problemGenerators", "grade2ShareFairlyTo10.js"),
    "utf8"
  );
  assert(!generatorSource.includes("Math.random"));

  console.log(JSON.stringify({
    resourceId: RESOURCE_ID,
    seedsChecked: 30,
    sameSeedFailures,
    differentSeedOrders: differentSeedOrders.size,
    scenarioCount: QUESTION_COUNT,
    sharerCounts: SHARER_COUNTS,
    pageCount: 8,
    answerKeySlotGap: 18,
    answerKeyGeometry: true,
    trayRowCentering: true,
    trayObjectCountsChecked: [1, 2, 3, 4],
    answerKeyPunctuation: true,
    answerKeyParity: true,
    grade1Isolation: true,
    grade3Isolation: true,
    reconciliationCategory: "A"
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
