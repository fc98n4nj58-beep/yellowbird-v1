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
  for (const [min,max] of [[0,10],[0,20],[10,20],[20,40],[7,17],[0,1],[60,100],[99,100]])
  for (const count of [1, 3, 6]) for (const example of [false, true]) for (const key of [false, true]) {
    let expected;
    for (const size of [12, 14, 16]) for (const mode of ["shown","student_drawn"]) {
      const options = { minimumValue: min, maximumValue: max, numberLineArrows: mode, questionCount: count, questionTextSize: size, includeExample: example, includeAnswerKey: key, worksheetSeed: "number-line-matrix" };
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
        assert(item.b > 0 && item.b <= 10 && min <= item.a && item.a < item.answer && item.answer <= max);
        assert.equal(item.visual.data.min,min); assert.equal(item.visual.data.max,max);
        assert.equal(item.visual.data.hideValueLabel, true);
      }
      if (expected) assert.deepEqual(items, expected, "text size/arrow mode/key must not change mathematical truth");
      expected = items;
      assert.deepEqual(items, publicRuntime(options).contentObject.content.items);
      const normalized=normalize(ID,options);
      assert(!Object.hasOwn(normalized.generatorOptions, "questionTextSize"));
      assert(!Object.hasOwn(normalized.generatorOptions, "numberLineArrows"));
      assert.equal(normalized.canonicalPayload.effectiveSeed,"number-line-matrix");
      assert.equal(runtime.contentObject.meta.title,min===0&&max===20?"Addition on a Number Line":`Addition on a Number Line — ${min} to ${max}`);
      const poolSize=(max-min)<=10 ? (max-min)*(max-min+1)/2 : Infinity;
      if(count<=poolSize) assert.equal(new Set(items.map(i=>`${i.a}:${i.b}`)).size,count);
      if(max-min===1) assert(items.every(i=>i.a===min && i.b===1 && i.answer===max));
      const capacity = { 12: 6, 14: 5, 16: 4 }[size];
      assert.equal(runtime.layout.template.maxProblemsPerPage, capacity);
      const pdf = await render(runtime, key);
      assert.equal((pdf.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length, Math.ceil(count / capacity) * (key ? 2 : 1));
      cases++;
    }
  }
  for (const input of [{ questionCount: 0 }, { questionCount: 7 }, { questionCount: 1.5 }, { questionCount: "bad" }, { questionCount: "" }, { questionTextSize: 15 }, { questionTextSize: "Largest" }, { includeExample: "maybe" }, { includeAnswerKey: "maybe" }, { minimumValue: -1 }, { minimumValue: "" }, { minimumValue: null }, { minimumValue: true }, { minimumValue: [] }, { minimumValue: 1.5 }, { minimumValue: Infinity }, { maximumValue: "NaN" }, { maximumValue: 101 }, { maximumValue: 41 }, { minimumValue: 20, maximumValue: 20 }, { minimumValue: 30, maximumValue: 20 }, { minimumValue: 10, minA: 11 }, { maximumValue: 20, maxTotal: 30 }, { maxTotal: 20, numberLineMaximum: 30 }, { numberLineArrows: "bad" }, { numberLineArrows: "" }, { numberLineArrows: false }, { numberLineArrows: ["shown"] }, { numberLineArrows: null }, { selectedStarts: [0] }, { font: 16 }, { cols: 2 }, { unknown: true }]) {
    assert.throws(() => publicRuntime(input), error => error.status === 400 && error.details.errors.length > 0, JSON.stringify(input));
  }
  assert.deepEqual(publicRuntime({minStart:"10",minA:10,maxTotal:"20",numberLineMaximum:20}).contentObject.content.items,publicRuntime({minimumValue:10,maximumValue:20}).contentObject.content.items);
  const candidates=require("../engine/problemGenerators/additionNumberLine").buildCandidates(normalize(ID,{minimumValue:10,maximumValue:20}).generatorOptions);
  assert(candidates.some(f=>f.start===13&&f.jump===4&&f.landing===17));
  assert(candidates.some(f=>f.start===19&&f.jump===1&&f.landing===20));
  assert.deepEqual(publicRuntime({ completedExample: true, answers: "0" }).contentObject.content.items, publicRuntime({ includeExample: true, includeAnswerKey: false }).contentObject.content.items);
  // Public limits must not narrow the previously accepted internal runtime.
  const raw = build(ID, { questionCount: 9, minA: 2, maxA: 4, minB: 1, maxB: 3, maxTotal: 30, numberLineMaximum: 30, onlyStarts: "2,4", onlyJumps: "1,3", completedExample: true });
  assert.equal(raw.contentObject.content.items.length, 9);
  raw.contentObject.content.items.forEach(item => { assert([2,4].includes(item.a)); assert([1,3].includes(item.b)); assert.equal(item.visual.data.max, 30); });
  assert.deepEqual(publicRuntime().contentObject.content.items, build(ID).contentObject.content.items);
  console.log(`Addition number-line customization: ${cases} matrix cases, invalid endpoint/mode/alias cases, candidate/repetition/internal/default checks passed.`);
}
if (require.main === module) run().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { publicRuntime, render };
