"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { getMasterWorksheetCatalog } = require("../services/worksheetCatalogService");
const {
  renderWorksheetPDF,
  buildAnswerKeyItems,
  __test: rendererTest
} = require("../renderers/pdfRenderer");

const ROOT = path.join(__dirname, "..");
const IDS = Object.freeze({
  factFamily: "grade2_addition_subtraction_facts_fact_family",
  missingAddend: "grade2_addition_subtraction_facts_missing_addend",
  missingWord: "grade2_addition_subtraction_word_problems_missing_addend_word_problem",
  takeAwayWord: "grade2_addition_subtraction_word_problems_subtraction_word_problem"
});
const SPECS = Object.freeze({
  [IDS.factFamily]: { title: "Fact Families", instruction: "Complete each fact family.", pages: 2 },
  [IDS.missingAddend]: { title: "Missing Addends Within 20", instruction: "Write the missing number in each equation.", pages: 2 },
  [IDS.missingWord]: { title: "Missing Addend Word Problems", instruction: "Solve each problem. Show your thinking in the box.", pages: 6 },
  [IDS.takeAwayWord]: { title: "Take Away Word Problems", instruction: "Solve each problem. Show your thinking in the box.", pages: 6 }
});
const FOOTER = "Grade 2 • Math • Addition and Subtraction";

class BufferResponse extends Writable {
  constructor() {
    super();
    this.chunks = [];
  }
  setHeader() {}
  _write(chunk, encoding, callback) {
    this.chunks.push(Buffer.from(chunk));
    callback();
  }
  buffer() { return Buffer.concat(this.chunks); }
}

function signature(runtime) {
  return runtime.normalizedContentObject.content.items.map((item) => ({
    prompt: item.prompt,
    answer: item.answer,
    isExample: item.isExample
  }));
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function renderRuntime(runtime) {
  return new Promise((resolve, reject) => {
    const response = new BufferResponse();
    response.once("finish", () => resolve(response.buffer()));
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.contentObject,
      layoutObject: runtime.layout,
      options: { filename: `${runtime.item.id}.pdf`, includeAnswerKey: true }
    });
  });
}

function zeroRelatedCount(items) {
  return items.filter((item) => {
    const match = item.prompt.match(/^__ \+ (\d+) = (\d+)$/);
    assert(match, `Malformed missing-addend prompt: ${item.prompt}`);
    const known = Number(match[1]);
    const total = Number(match[2]);
    return known === 0 || Number(item.answer) === 0 || total === known;
  }).length;
}

function assertSharedContract(runtime, id) {
  const spec = SPECS[id];
  assert.strictEqual(runtime.item.id, id);
  assert.strictEqual(runtime.item.status, "ready");
  assert.strictEqual(runtime.item.title, spec.title);
  assert.strictEqual(runtime.layout.header.title, spec.title);
  assert.strictEqual(runtime.layout.header.subtitle, "");
  assert.strictEqual(runtime.layout.instruction, spec.instruction);
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, FOOTER);
  assert(!runtime.contentObject.meta.curriculum.footerText.includes("_"));
  assert(!runtime.layout.header.title.includes("Grade 2"));
  assert.strictEqual(runtime.layout.problems.length, 12);
  assert.strictEqual(runtime.layout.problems.some((item) => !item.prompt), false);
  assert.strictEqual(runtime.layout.problems.some((item) => item.answer == null), false);
  assert.strictEqual(runtime.layout.problems.some((item) => item.isExample), false);
  assert.strictEqual(runtime.layout.modeId, runtime.item.activityTypes[0]);
  assert.notStrictEqual(runtime.layout.worksheetType, "equation_practice");
  assert.deepStrictEqual(
    buildAnswerKeyItems(runtime.contentObject.content.items).map((item) => item.answer),
    runtime.contentObject.content.items.map((item) => item.answer)
  );
}

function assertFactFamilies(items) {
  assert.strictEqual(items.length, 12);
  const familyKeys = new Set();
  items.forEach((item) => {
    const lines = item.prompt.split("\n");
    assert.strictEqual(lines.length, 4);
    assert.strictEqual(new Set(lines).size, 4, `Duplicate equation in ${item.prompt}`);
    const add1 = lines[0].match(/^(\d+) \+ (\d+) = __$/);
    const add2 = lines[1].match(/^(\d+) \+ (\d+) = __$/);
    const sub1 = lines[2].match(/^(\d+) - (\d+) = __$/);
    const sub2 = lines[3].match(/^(\d+) - (\d+) = __$/);
    assert(add1 && add2 && sub1 && sub2);
    const a = Number(add1[1]);
    const b = Number(add1[2]);
    const total = a + b;
    assert.notStrictEqual(a, b);
    assert(total <= 20);
    assert.deepStrictEqual([Number(add2[1]), Number(add2[2])], [b, a]);
    assert.deepStrictEqual([Number(sub1[1]), Number(sub1[2])], [total, a]);
    assert.deepStrictEqual([Number(sub2[1]), Number(sub2[2])], [total, b]);
    assert.deepStrictEqual(String(item.answer).split(/,\s*/).map(Number), [total, total, b, a]);
    const key = `${Math.min(a, b)}:${Math.max(a, b)}`;
    assert(!familyKeys.has(key));
    familyKeys.add(key);
  });
}

function assertMissingAddends(runtime) {
  const items = runtime.normalizedContentObject.content.items;
  assert.strictEqual(items.length, 12);
  assert.strictEqual(zeroRelatedCount(items), 1);
  items.forEach((item) => {
    const match = item.prompt.match(/^__ \+ (\d+) = (\d+)$/);
    assert(match);
    const known = Number(match[1]);
    const total = Number(match[2]);
    const missing = Number(item.answer);
    assert(total >= 1 && total <= 20);
    assert(known >= 0 && known <= 20);
    assert(missing >= 0 && missing <= 20);
    assert.strictEqual(known + missing, total);
  });
  assert.strictEqual(runtime.layout.template.columns, 2);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 12);
  assert.strictEqual(runtime.layout.display.denseGridRows, 6);
  assert.strictEqual(runtime.layout.display.sequentialColumnFill, true);
  assert.strictEqual(runtime.layout.display.standardShortAnswerTarget, true);
  assert.strictEqual(runtime.layout.display.inlineEquationFontSize, 16);
  assert.strictEqual(runtime.layout.display.standardAnswerLineWidth, 58);
}

function contextNoun(prompt, nouns) {
  return nouns.find((noun) => prompt.includes(noun)) || "";
}

function frame(prompt) {
  if (prompt.startsWith("How many")) return "question_first";
  if (prompt.includes("starts with")) return "starts_with";
  if (prompt.startsWith("There are")) return "there_are";
  if (prompt.includes("already have")) return "already_have";
  if (prompt.includes("want") || prompt.includes("needs")) return "goal";
  return "start_action";
}

function assertWordVariety(items, nouns) {
  const observedFrames = new Set();
  let priorNoun = "";
  items.forEach((item) => {
    const noun = contextNoun(item.prompt, nouns);
    assert(noun, `No recognized context noun in: ${item.prompt}`);
    assert.notStrictEqual(noun, priorNoun, `Consecutive noun repetition: ${noun}`);
    priorNoun = noun;
    observedFrames.add(frame(item.prompt));
  });
  assert(observedFrames.size >= 2, "Expected at least two sentence frames.");
}

function assertMissingWordProblems(runtime) {
  const items = runtime.normalizedContentObject.content.items;
  assertWordVariety(items, ["cans", "balls", "cards", "books", "rocks", "cube towers"]);
  items.forEach((item) => {
    const numbers = item.prompt.match(/\d+/g).map(Number);
    assert.strictEqual(Math.abs(numbers[1] - numbers[0]), Number(item.answer));
    assert(Math.max(...numbers) <= 100);
    assert(Math.min(...numbers) >= 1);
  });
  assert.strictEqual(runtime.layout.template.columns, 1);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 3);
  assert.strictEqual(runtime.layout.display.workSpaceBox, true);
  assert.strictEqual(runtime.layout.display.compactWordProblemAnswerKey, true);
}

function assertTakeAwayWordProblems(runtime) {
  const items = runtime.normalizedContentObject.content.items;
  assertWordVariety(items, ["pencils", "apples", "cards", "buttons", "shells", "stickers"]);
  items.forEach((item) => {
    assert(!/\bshares?\b/i.test(item.prompt), `Ambiguous sharing language: ${item.prompt}`);
    const numbers = item.prompt.match(/\d+/g).map(Number);
    assert(numbers[0] >= 2 && numbers[0] <= 100);
    assert(numbers[1] >= 1 && numbers[1] < numbers[0]);
    assert.strictEqual(numbers[0] - numbers[1], Number(item.answer));
    assert(Number(item.answer) > 0);
  });
  assert.strictEqual(runtime.layout.template.columns, 1);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 3);
  assert.strictEqual(runtime.layout.display.workSpaceBox, true);
  assert.strictEqual(runtime.layout.display.compactWordProblemAnswerKey, true);
}

function assertRouteParity() {
  const previewRoute = fs.readFileSync(path.join(ROOT, "routes/worksheetPreviewRoutes.js"), "utf8");
  const pdfRoute = fs.readFileSync(path.join(ROOT, "routes/worksheetPdfRoutes.js"), "utf8");
  assert(previewRoute.includes("buildCatalogWorksheetRuntime"));
  assert(pdfRoute.includes("buildCatalogWorksheetRuntime"));
}

function assertGradeIsolation() {
  const grade1Fact = buildCatalogWorksheetRuntime("grade1_addition_subtraction_facts_fact_family", { worksheetSeed: "g1-category-c-isolation" });
  const grade1Word = buildCatalogWorksheetRuntime("grade1_addition_subtraction_word_problems_subtraction_word_problem", { worksheetSeed: "g1-word-isolation" });
  const grade3Fact = buildCatalogWorksheetRuntime("grade3_addition_subtraction_facts_fact_family", { worksheetSeed: "g3-category-c-isolation" });
  const grade3Word = buildCatalogWorksheetRuntime("grade3_addition_subtraction_word_problems_subtraction_word_problem", { worksheetSeed: "g3-word-isolation" });
  assert.strictEqual(grade1Fact.item.title, "Fact Families — Grade 1");
  assert.strictEqual(grade3Fact.item.title, "Fact Families — Grade 3");
  assert.strictEqual(Boolean(grade1Fact.item.generatorOptions?.requireDistinctAddends), false);
  assert.strictEqual(Boolean(grade3Fact.item.generatorOptions?.requireDistinctAddends), false);
  assert.strictEqual(Boolean(grade1Word.layout.display.compactWordProblemAnswerKey), false);
  assert.strictEqual(Boolean(grade3Word.layout.display.compactWordProblemAnswerKey), false);
  assert.strictEqual(Boolean(grade1Word.item.generatorOptions?.naturalTakeAwayLanguage), false);
  assert.strictEqual(Boolean(grade3Word.item.generatorOptions?.naturalTakeAwayLanguage), false);
}

function assertCatalogCounts() {
  const catalog = getMasterWorksheetCatalog();
  const generatedCatalog = JSON.parse(
    fs.readFileSync(path.join(ROOT, "data/worksheetCatalog.generated.json"), "utf8")
  ).items;
  const count = (status) => catalog.filter((item) => item.status === status).length;
  assert.strictEqual(catalog.length, 331);
  assert.strictEqual(count("ready"), 104);
  assert.strictEqual(count("generated"), 213);
  assert.strictEqual(count("partial"), 5);
  Object.values(IDS).forEach((id) => {
    const masterItem = catalog.find((item) => item.id === id);
    const generatedItem = generatedCatalog.find((item) => item.id === id);
    assert.strictEqual(masterItem?.status, "ready");
    assert.strictEqual(generatedItem?.status, "ready");
    ["title", "shortTitle", "description", "studentInstruction", "generatorOptions", "pdfDisplay", "pdfLayout"]
      .forEach((field) => assert.deepStrictEqual(generatedItem?.[field], masterItem?.[field], `${id} ${field} catalog parity`));
  });
}

async function run() {
  assertRouteParity();
  assertGradeIsolation();
  assertCatalogCounts();

  for (let seedIndex = 0; seedIndex < 30; seedIndex += 1) {
    for (const id of Object.values(IDS)) {
      const query = { worksheetSeed: `g2-category-c-${seedIndex}` };
      const runtime = buildCatalogWorksheetRuntime(id, query);
      const repeat = buildCatalogWorksheetRuntime(id, query);
      assertSharedContract(runtime, id);
      assert.deepStrictEqual(signature(runtime), signature(repeat));
      if (id === IDS.factFamily) assertFactFamilies(runtime.normalizedContentObject.content.items);
      if (id === IDS.missingAddend) assertMissingAddends(runtime);
      if (id === IDS.missingWord) assertMissingWordProblems(runtime);
      if (id === IDS.takeAwayWord) assertTakeAwayWordProblems(runtime);
    }
  }

  for (const id of Object.values(IDS)) {
    const withExampleRequested = buildCatalogWorksheetRuntime(id, {
      worksheetSeed: "g2-category-c-no-example",
      includeExample: true
    });
    assert.strictEqual(withExampleRequested.normalizedContentObject.content.items.length, 12);
    assert.strictEqual(withExampleRequested.normalizedContentObject.content.items.some((item) => item.isExample), false);

    const pdf = await renderRuntime(withExampleRequested);
    assert.strictEqual(pageCount(pdf), SPECS[id].pages, `${id} PDF page count`);
  }

  const compactGeometry = rendererTest.buildCompactWordProblemAnswerKeyGeometry({
    y: 0,
    height: 88,
    promptHeight: 38
  });
  assert(compactGeometry.requiredHeight <= 88);
  assert(compactGeometry.answerY > compactGeometry.promptY);
  assert(compactGeometry.separatorY > compactGeometry.answerY);

  console.log("Grade 2 Addition/Subtraction Category C checks passed.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
