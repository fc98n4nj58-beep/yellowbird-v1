const assert = require("assert/strict");
const { Writable } = require("stream");
const { buildCatalogWorksheetRuntime: build } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");
const { normalizeWorksheetCustomization: normalize } = require("../services/worksheetCustomizationService");
const ID = "g1_addition_on_number_line_to_20";
function publicRuntime(options = {}) { return build(ID, options, { publicCustomization: true }); }
function render(runtime, includeAnswerKey) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const res = new Writable({ write(chunk, encoding, done) { chunks.push(Buffer.from(chunk)); done(); } });
    res.setHeader = () => {};
    res.on("finish", () => resolve(Buffer.concat(chunks)));
    res.on("error", reject);
    renderWorksheetPDF({ res, contentObject: runtime.normalizedContentObject, layoutObject: runtime.layout, options: { includeAnswerKey } });
  });
}
async function run() {
  let cases = 0;
  for (const count of [1, 3, 5, 6]) for (const example of [false, true]) for (const key of [false, true]) {
    let expected;
    for (const size of [12, 14, 16]) {
      const options = { questionCount: count, questionTextSize: size, includeExample: example, includeAnswerKey: key, worksheetSeed: "number-line-matrix" };
      const runtime = publicRuntime(options), items = runtime.contentObject.content.items;
      assert.equal(items.length, count);
      assert.equal(items.filter(x => x.isExample).length, Number(example));
      assert.equal(Boolean(items[0].isExample), example);
      assert.deepEqual(items.map(x => x.id), Array.from({ length: count }, (_, i) => i + 1));
      for (const item of items) {
        assert.equal(item.a + item.b, item.answer);
        assert.equal(item.visual.data.additionLanding, item.answer);
        assert.equal(item.visual.data.additionStart, item.a);
        assert.equal(item.visual.data.additionJump, item.b);
        assert(item.b > 0 && item.answer <= 20);
        assert.equal(item.visual.data.hideValueLabel, true);
      }
      if (expected) assert.deepEqual(items, expected, "text size/key must not change mathematical truth");
      expected = items;
      assert.deepEqual(items, publicRuntime(options).contentObject.content.items);
      assert(!Object.hasOwn(normalize(ID, options).generatorOptions, "questionTextSize"));
      const capacity = { 12: 6, 14: 5, 16: 4 }[size];
      assert.equal(runtime.layout.template.maxProblemsPerPage, capacity);
      const pdf = await render(runtime, key);
      assert.equal((pdf.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length, Math.ceil(count / capacity) * (key ? 2 : 1));
      cases++;
    }
  }
  for (const input of [{ questionCount: 0 }, { questionCount: 7 }, { questionCount: 1.5 }, { questionCount: "bad" }, { questionCount: "" }, { questionTextSize: 15 }, { questionTextSize: "Largest" }, { includeExample: "maybe" }, { includeAnswerKey: "maybe" }, { minimumValue: 0 }, { selectedStarts: [0] }, { font: 16 }, { cols: 2 }, { unknown: true }]) {
    assert.throws(() => publicRuntime(input), error => error.status === 400 && error.details.errors.length > 0, JSON.stringify(input));
  }
  assert.deepEqual(publicRuntime({ completedExample: true, answers: "0" }).contentObject.content.items, publicRuntime({ includeExample: true, includeAnswerKey: false }).contentObject.content.items);
  // Public limits must not narrow the previously accepted internal runtime.
  const raw = build(ID, { questionCount: 9, minA: 2, maxA: 4, minB: 1, maxB: 3, maxTotal: 30, numberLineMaximum: 30, onlyStarts: "2,4", onlyJumps: "1,3", completedExample: true });
  assert.equal(raw.contentObject.content.items.length, 9);
  raw.contentObject.content.items.forEach(item => { assert([2,4].includes(item.a)); assert([1,3].includes(item.b)); assert.equal(item.visual.data.max, 30); });
  assert.deepEqual(publicRuntime().contentObject.content.items, build(ID).contentObject.content.items);
  console.log(`Addition number-line customization: ${cases} matrix cases, 14 invalid cases, alias/internal/default checks passed.`);
}
if (require.main === module) run().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { publicRuntime, render };
