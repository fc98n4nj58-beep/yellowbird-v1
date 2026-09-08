const assert = require("assert");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { normalizeWorksheetCustomization } = require("../services/worksheetCustomizationService");

const ID = "grade1_place_value_representation_base_ten_blocks";
function runtime(options) { return buildCatalogWorksheetRuntime(ID, options, { publicCustomization: true }); }
function assertTruth(items, min, max, mode) {
  assert(items.length >= 1);
  items.forEach(item => {
    assert(item.value >= min && item.value <= max);
    assert.strictEqual(item.tens * 10 + item.ones, item.value);
    assert.strictEqual(item.answer, item.value);
    assert.strictEqual(item.visual.kind, "base_ten_blocks");
    assert.deepStrictEqual(item.responseValues, mode === "tens_ones" ? [item.tens, item.ones] : [item.value]);
  });
}
for (const count of [1, 3, 5, 10]) {
  for (const size of [12, 14, 16]) {
    for (const mode of ["standard_number", "tens_ones"]) {
      const result = runtime({ questionCount: count, questionTextSize: size, baseTenResponseMode: mode, includeExample: true, worksheetSeed: `base-${count}-${size}-${mode}` });
      const items = result.contentObject.content.items;
      assert.strictEqual(items.length, count, "Base Ten retains its completed-Q1-inside-total contract");
      assert.strictEqual(items[0].isExample, true);
      assertTruth(items, 0, 50, mode);
      assert.strictEqual(result.layout.template.maxProblemsPerPage, count);
      assert.strictEqual(result.layout.display.baseTenQuestionTextSize, size);
      assert.strictEqual(result.layout.display.baseTenTensOnesBoxes, mode === "tens_ones");
      if (mode === "tens_ones") {
        assert.strictEqual(result.layout.display.baseTenResponseLayout.labelFontSize, size);
      }
    }
  }
}
assertTruth(runtime({ minimumValue: 90, maximumValue: 100, questionCount: 5, worksheetSeed: "narrow" }).contentObject.content.items, 90, 100, "standard_number");
assertTruth(runtime({ minimumValue: 0, maximumValue: 0, questionCount: 1, worksheetSeed: "zero" }).contentObject.content.items, 0, 0, "standard_number");
for (const value of [0, 9, 10, 50, 90, 99, 100]) {
  for (const mode of ["standard_number", "tens_ones"]) {
    const result = runtime({ minimumValue: value, maximumValue: value, questionCount: 1, includeExample: true, includeAnswerKey: true, baseTenResponseMode: mode, worksheetSeed: `boundary-${value}-${mode}` });
    const item = result.contentObject.content.items[0];
    assert.strictEqual(item.value, value);
    assert.strictEqual(item.tens * 10 + item.ones, value);
    assert.strictEqual(item.isExample, true);
    assert.deepStrictEqual(item.responseValues, mode === "tens_ones" ? [item.tens, item.ones] : [value]);
  }
}
const hundred = runtime({ minimumValue: 100, maximumValue: 100, questionCount: 1, baseTenResponseMode: "tens_ones", worksheetSeed: "hundred" });
const hundredItem = hundred.contentObject.content.items[0];
assert.strictEqual(hundredItem.value, 100);
assert.strictEqual(hundredItem.tens, 10);
assert.strictEqual(hundredItem.ones, 0);
assert.strictEqual(hundredItem.answer, 100);
assert.deepStrictEqual(hundredItem.responseValues, [10, 0]);
assert.strictEqual(hundredItem.visual.data.hundreds, undefined);
assert.strictEqual(hundred.layout.header.title, "Base Ten Blocks Between 100 and 100");
assert.strictEqual(runtime({ minimumValue: 0, maximumValue: 100, questionCount: 2, worksheetSeed: "to-hundred" }).layout.header.title, "Base Ten Blocks to 100");
assert.strictEqual(runtime({ minimumValue: 90, maximumValue: 100, questionCount: 2, worksheetSeed: "between" }).layout.header.title, "Base Ten Blocks Between 90 and 100");
assert.strictEqual(runtime({ worksheetSeed: "default-title" }).layout.header.title, "Base Ten Blocks to 50 — Grade 1");
for (const options of [{ minimumValue: 101 }, { maximumValue: 101 }, { minimumValue: 40, maximumValue: 30 }, { baseTenResponseMode: "boxes" }, { questionCount: 11 }]) {
  const normalized = normalizeWorksheetCustomization(ID, options);
  assert.strictEqual(normalized.ok, false);
}
const seeded = { minimumValue: 0, maximumValue: 50, questionCount: 10, worksheetSeed: "same", baseTenResponseMode: "standard_number" };
assert.deepStrictEqual(runtime(seeded).contentObject.content.items.map(i => i.value), runtime(seeded).contentObject.content.items.map(i => i.value));
console.log("Grade 1 Base Ten customization runtime tests passed.");
