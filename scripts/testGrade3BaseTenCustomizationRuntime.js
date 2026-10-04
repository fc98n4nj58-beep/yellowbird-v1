"use strict";

const assert = require("assert");
const { Writable } = require("stream");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { normalizeWorksheetCustomization } = require("../services/worksheetCustomizationService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const ID = "grade3_place_value_representation_base_ten_blocks";
const runtime = options => buildCatalogWorksheetRuntime(ID, options, { publicCustomization: true });
const items = result => result.contentObject.content.items;
const signature = result => items(result).map(item => ({ value: item.representedValue, hundreds: item.hundreds, tens: item.tens, ones: item.ones, visual: item.visual, isExample: item.isExample }));

class MemoryResponse extends Writable {
  constructor() { super(); this.chunks = []; }
  setHeader() {}
  _write(chunk, encoding, callback) { this.chunks.push(Buffer.from(chunk)); callback(); }
  buffer() { return Buffer.concat(this.chunks); }
}

function render(result) {
  return new Promise((resolve, reject) => {
    const response = new MemoryResponse();
    response.once("finish", () => resolve(response.buffer()));
    response.once("error", reject);
    renderWorksheetPDF({ res: response, contentObject: result.normalizedContentObject, layoutObject: result.layout, options: { includeAnswerKey: true } });
  });
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function assertTruth(result, minimum, maximum) {
  items(result).forEach(item => {
    assert(item.representedValue >= minimum && item.representedValue <= maximum);
    assert.strictEqual(item.hundreds * 100 + item.tens * 10 + item.ones, item.representedValue);
    assert.strictEqual(item.answer, item.representedValue);
    assert.strictEqual(item.visual.data.hundreds, item.hundreds);
    assert.strictEqual(item.visual.data.tens, item.tens);
    assert.strictEqual(item.visual.data.ones, item.ones);
  });
}

async function run() {
  const rawDefault = buildCatalogWorksheetRuntime(ID, { worksheetSeed: "grade3-custom-default" });
  const publicDefault = runtime({ worksheetSeed: "grade3-custom-default" });
  assert.deepStrictEqual(signature(publicDefault), signature(rawDefault));
  assert.strictEqual(publicDefault.layout.header.title, "Read Base Ten Blocks");
  assert.strictEqual(publicDefault.layout.instruction, "Count the hundreds, tens, and ones. Write the number.");
  assert.strictEqual(pageCount(await render(publicDefault)), 4);

  for (const count of [1, 3, 5, 8]) {
    for (const size of [12, 14, 16]) {
      const seed = `grade3-custom-${count}-${size}`;
      const line = runtime({ questionCount: count, questionTextSize: size, baseTenResponseMode: "standard_number", worksheetSeed: seed });
      const boxes = runtime({ questionCount: count, questionTextSize: size, baseTenResponseMode: "hundreds_tens_ones", worksheetSeed: seed });
      assert.strictEqual(items(line).length, count);
      assert.deepStrictEqual(signature(boxes), signature(line));
      assert.strictEqual(boxes.layout.display.baseTenResponseLayout.labelFontSize, size);
      assert.strictEqual(boxes.layout.display.baseTenPlaceValueBoxes, true);
      assert.strictEqual(boxes.layout.template.maxProblemsPerPage, 2);
      assertTruth(boxes, 100, 499);
      if (count === 8 && size === 16) assert.strictEqual(pageCount(await render(boxes)), 8);
    }
  }

  const selectedValues = [100, 101, 105, 110, 200, 305, 390, 499];
  const exact = runtime({ questionCount: 8, selectedValues, worksheetSeed: "grade3-custom-exact" });
  assert.deepStrictEqual(new Set(items(exact).map(item => item.representedValue)), new Set(selectedValues));
  assert.strictEqual(exact.layout.header.title, "Read Base Ten Blocks");

  const example = runtime({ questionCount: 3, minimumValue: 303, maximumValue: 306, includeExample: true, baseTenResponseMode: "hundreds_tens_ones", questionTextSize: 16, worksheetSeed: "grade3-custom-example" });
  assert.strictEqual(items(example).length, 4);
  assert.strictEqual(items(example).filter(item => item.isExample).length, 1);
  assert.strictEqual(items(example)[0].isExample, true);
  assert.strictEqual(example.layout.header.title, "Read Base Ten Blocks — 303 to 306");
  assert.strictEqual(pageCount(await render(example)), 4);

  const value305 = runtime({ questionCount: 1, minimumValue: 305, maximumValue: 305, baseTenResponseMode: "hundreds_tens_ones", worksheetSeed: "grade3-custom-305" });
  assert.deepStrictEqual(items(value305).map(item => [item.hundreds, item.tens, item.ones]), [[3, 0, 5]]);

  for (const options of [
    { minimumValue: 99 }, { maximumValue: 500 }, { minimumValue: 100.5 },
    { minimumValue: 300, maximumValue: 200 }, { questionCount: 9 },
    { baseTenResponseMode: "tens_ones" },
    { questionCount: 3, selectedValues: [100, 101] }
  ]) assert.strictEqual(normalizeWorksheetCustomization(ID, options).ok, false);

  console.log("Grade 3 Base Ten customization runtime tests passed.");
}

run().catch(error => { console.error(error); process.exitCode = 1; });
