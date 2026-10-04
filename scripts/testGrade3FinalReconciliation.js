"use strict";

const assert = require("assert");
const { Writable } = require("stream");

const { getCustomizationFamilyForResource } = require("../config/worksheetCustomization");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { buildAnswerKeyItems, renderWorksheetPDF, __test: rendererTest } = require("../renderers/pdfRenderer");

const BASE_TEN_ID = "grade3_place_value_representation_base_ten_blocks";
const MATCH_ID = "grade3_fraction_equivalence_match_equivalent_fractions";

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
      options: { filename: "grade3-final-reconciliation-test.pdf", includeAnswerKey }
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
    representedValue: item.representedValue,
    hundreds: item.hundreds,
    tens: item.tens,
    ones: item.ones,
    duplicateSignature: item.duplicateSignature,
    answerState: item.answerState,
    visual: item.visual,
    isExample: item.isExample
  }));
}

function assertBaseTenTruth(runtime) {
  const problems = items(runtime);
  assert.strictEqual(new Set(problems.map((item) => item.duplicateSignature)).size, problems.length);
  problems.forEach((item) => {
    assert(Number.isInteger(item.representedValue));
    assert(item.representedValue >= 100 && item.representedValue <= 499);
    assert.strictEqual(item.hundreds * 100 + item.tens * 10 + item.ones, item.representedValue);
    assert.strictEqual(item.answer, item.representedValue);
    assert.strictEqual(item.visual.kind, "base_ten_blocks");
    assert.strictEqual(item.visual.data.value, item.representedValue);
    assert.strictEqual(item.visual.data.representedValue, item.representedValue);
    assert.strictEqual(item.visual.data.hundreds, item.hundreds);
    assert.strictEqual(item.visual.data.tens, item.tens);
    assert.strictEqual(item.visual.data.ones, item.ones);
    assert.deepStrictEqual(item.answerState, {
      representedValue: item.representedValue,
      hundreds: item.hundreds,
      tens: item.tens,
      ones: item.ones
    });
  });
  const key = buildAnswerKeyItems(problems);
  ["answer", "representedValue", "hundreds", "tens", "ones", "visual", "duplicateSignature", "answerState"]
    .forEach((field) => assert.deepStrictEqual(key.map((item) => item[field]), problems.map((item) => item[field])));
}

function assertThrows(options, pattern) {
  assert.throws(() => buildCatalogWorksheetRuntime(BASE_TEN_ID, options), pattern);
}

function assertBaseTenVerticalGeometry() {
  const representatives = [109, 274, 363, 399, 409, 413, 475, 490, 498, 499]
    .map((value) => ({
      value,
      hundreds: Math.floor(value / 100),
      tens: Math.floor((value % 100) / 10),
      ones: value % 10
    }));

  representatives.forEach((sample) => {
    const measured = rendererTest.measureBaseTenVisual(sample, 500, 130, {
      baseTenHundredsGap: 9
    });
    const hundredsGeometry = rendererTest.buildBaseTenHundredsGeometry({
      hundreds: sample.hundreds,
      flatSize: measured.flatSize,
      hundredsGap: measured.hundredsGap
    });
    const geometry = rendererTest.buildBaseTenCellGeometry({
      cellTopY: 0,
      cellBottomY: 150,
      measuredHeight: measured.height,
      rodLength: measured.rodLength
    });

    assert.strictEqual(measured.flatSize, 50);
    assert.strictEqual(measured.gap, 4);
    assert.strictEqual(measured.groupGap, 10);
    assert(measured.hundredsGap >= 8 && measured.hundredsGap <= 10);
    assert(measured.width <= 500);
    assert(measured.height <= 130);
    assert(hundredsGeometry.width <= 110);
    assert.strictEqual(hundredsGeometry.flats.length, sample.hundreds);
    hundredsGeometry.flats.forEach((flat) => {
      assert(flat.x >= 0 && flat.y >= 0);
      assert(flat.x + flat.width <= hundredsGeometry.width);
      assert(flat.y + flat.height <= hundredsGeometry.height);
    });
    for (let first = 0; first < hundredsGeometry.flats.length; first += 1) {
      for (let second = first + 1; second < hundredsGeometry.flats.length; second += 1) {
        const a = hundredsGeometry.flats[first];
        const b = hundredsGeometry.flats[second];
        const separated =
          a.x + a.width <= b.x || b.x + b.width <= a.x ||
          a.y + a.height <= b.y || b.y + b.height <= a.y;
        assert(separated, `hundreds flats overlap for ${sample.value}`);
        if (a.row === b.row) {
          assert(Math.abs(b.x - a.x) - measured.flatSize >= 8);
        }
        if (a.col === b.col) {
          assert(Math.abs(b.y - a.y) - measured.flatSize >= 8);
        }
      }
    }
    assert(geometry.visualTop >= geometry.cellTopY);
    assert(geometry.visualBottom <= geometry.separatorY);
    assert(geometry.topBreathingRoom >= 14);
    assert(geometry.bottomBreathingRoom >= 14);
    assert(geometry.answerLineY >= geometry.visualTop);
    assert(geometry.answerLineY <= geometry.visualBottom);
    assert(geometry.answerLineY < geometry.separatorY);
    assert(Math.abs(geometry.topBreathingRoom - geometry.bottomBreathingRoom) <= 1);
    if (sample.hundreds >= 3) assert(Math.abs(geometry.answerLineY - geometry.visualCenterY) <= 5);
  });
}

async function run() {
  const defaultRuntime = buildCatalogWorksheetRuntime(BASE_TEN_ID, { worksheetSeed: "grade3-final-default" });
  assert.strictEqual(defaultRuntime.item.status, "ready");
  assert.strictEqual(defaultRuntime.layout.header.title, "Read Base Ten Blocks");
  assert.strictEqual(defaultRuntime.layout.header.subtitle, "");
  assert.strictEqual(defaultRuntime.layout.instruction, "Count the hundreds, tens, and ones. Write the number.");
  assert.strictEqual(defaultRuntime.contentObject.meta.curriculum.footerText, "Grade 3 • Math • Place Value");
  assert.strictEqual(items(defaultRuntime).length, 8);
  assert.strictEqual(defaultRuntime.layout.template.columns, 1);
  assert.strictEqual(defaultRuntime.layout.template.maxProblemsPerPage, 4);
  assert.strictEqual(defaultRuntime.layout.grid.columns, 1);
  assert.strictEqual(defaultRuntime.layout.display.baseTenAlignedResponse, true);
  assert.strictEqual(defaultRuntime.layout.display.baseTenMeasuredCellCenter, true);
  assert.strictEqual(defaultRuntime.layout.display.baseTenHundredsGap, 9);
  assert.strictEqual(defaultRuntime.layout.display.baseTenTensOnesBoxes, false);
  assert.strictEqual(getCustomizationFamilyForResource(BASE_TEN_ID)?.id, "grade3BaseTenBlocks");
  assertBaseTenTruth(defaultRuntime);
  assertBaseTenVerticalGeometry();
  assert.strictEqual(pageCount(await render(defaultRuntime)), 4);

  for (let index = 0; index < 30; index += 1) {
    const options = { worksheetSeed: `grade3-final-${index}` };
    const first = buildCatalogWorksheetRuntime(BASE_TEN_ID, options);
    const second = buildCatalogWorksheetRuntime(BASE_TEN_ID, options);
    assert.deepStrictEqual(signature(first), signature(second));
    assertBaseTenTruth(first);
  }
  const variations = new Set(Array.from({ length: 10 }, (_, index) => JSON.stringify(signature(
    buildCatalogWorksheetRuntime(BASE_TEN_ID, { worksheetSeed: `grade3-final-variation-${index}` })
  ))));
  assert(variations.size > 1);

  const selected = [100, 111, 125, 240, 366, 408, 450, 499];
  for (const alias of ["selectedNumbers", "selectedValues", "onlyNumbers"]) {
    const runtime = buildCatalogWorksheetRuntime(BASE_TEN_ID, {
      worksheetSeed: `grade3-final-${alias}`,
      [alias]: selected
    });
    assert.deepStrictEqual(new Set(items(runtime).map((item) => item.representedValue)), new Set(selected));
  }

  const ranged = buildCatalogWorksheetRuntime(BASE_TEN_ID, {
    worksheetSeed: "grade3-final-range",
    minimumValue: 100,
    maximumNumber: 107
  });
  assert.deepStrictEqual(new Set(items(ranged).map((item) => item.representedValue)), new Set([100,101,102,103,104,105,106,107]));

  const paginated = buildCatalogWorksheetRuntime(BASE_TEN_ID, {
    worksheetSeed: "grade3-final-pagination",
    questionCount: 10,
    questionsPerPage: 4
  });
  assert.strictEqual(items(paginated).length, 10);
  assert.strictEqual(pageCount(await render(paginated)), 6);

  for (const alias of ["includeExample", "completedExample", "example"]) {
    const runtime = buildCatalogWorksheetRuntime(BASE_TEN_ID, {
      worksheetSeed: `grade3-final-example-${alias}`,
      questionCount: 4,
      [alias]: true
    });
    assert.strictEqual(items(runtime).length, 5);
    assert.strictEqual(items(runtime).filter((item) => item.isExample).length, 1);
    assertBaseTenTruth(runtime);
  }

  const maxDensity = buildCatalogWorksheetRuntime(BASE_TEN_ID, {
    worksheetSeed: "grade3-final-max-density",
    selectedNumbers: [492, 493, 494, 495, 496, 497, 498, 499]
  });
  assertBaseTenTruth(maxDensity);
  assert.strictEqual(pageCount(await render(maxDensity)), 4);
  const measured = rendererTest.measureBaseTenVisual({ hundreds: 4, tens: 9, ones: 9 }, 500, 130);
  assert(measured.width <= 500);
  assert(measured.height <= 130);

  [
    [{ minimumValue: -1 }, /100 through 499/],
    [{ minimumValue: 99 }, /100 through 499/],
    [{ maximumValue: 500 }, /100 through 499/],
    [{ minimumValue: 100.5 }, /whole number/],
    [{ questionCount: 0 }, /question count/],
    [{ questionCount: 2.5 }, /whole number/],
    [{ questionsPerPage: 5 }, /at most 4/],
    [{ selectedNumbers: "100,bad,102" }, /whole number/],
    [{ selectedNumbers: [100, 101, 101, 102, 103, 104, 105, 106] }, /unique/],
    [{ selectedNumbers: [100, 101, 102, 103, 104, 105, 106, 500] }, /approved range/],
    [{ selectedNumbers: [100, 101] }, /enough unique/],
    [{ minA: 100, minimumValue: 101 }, /aliases must agree/],
    [{ selectedNumbers: selected, selectedValues: [...selected].reverse() }, /aliases must agree/],
    [{ showPlaceValueLabels: true }, /does not support place-value response labels/],
    [{ labelMode: "hundreds_tens_ones" }, /label mode/],
    [{ responseMode: "draw" }, /response mode/],
    [{ example: "worked_model" }, /must be true or false/],
    [{ hundreds: 1, tens: 2, ones: 3, representedValue: 999 }, /generator-owned/]
  ].forEach(([options, pattern]) => assertThrows(options, pattern));

  const match = buildCatalogWorksheetRuntime(MATCH_ID, { worksheetSeed: "grade3-final-match-gate" });
  assert.strictEqual(match.item.status, "ready");
  assert.strictEqual(items(match).length, 12);
  assert(items(match).every((item) => item.visual === null));
  assert(items(match).every((item) => / = ____$/.test(item.prompt)));
  assert(items(match).every((item) => item.responseMode === null));
  assert.strictEqual(getCustomizationFamilyForResource(MATCH_ID), null);

  console.log("Grade 3 final reconciliation checks passed: Base Ten 30 seeds, same-seed failures 0, 4-page default; fraction matching remains split.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
