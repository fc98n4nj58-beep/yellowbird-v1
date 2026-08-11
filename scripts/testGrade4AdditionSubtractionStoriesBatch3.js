"use strict";

const assert = require("assert");
const crypto = require("crypto");
const path = require("path");
const { Writable } = require("stream");
const PDFDocument = require("pdfkit");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { getCustomizationFamilyForResource } = require("../config/worksheetCustomization");
const { renderWorksheetPDF, buildAnswerKeyItems, __test: rendererTest } = require("../renderers/pdfRenderer");

const IDS = Object.freeze({
  addition: "grade4_addition_subtraction_word_problems_addition_word_problem",
  missing: "grade4_addition_subtraction_word_problems_missing_addend_word_problem",
  subtraction: "grade4_addition_subtraction_word_problems_subtraction_word_problem"
});
const FOOTER = "Grade 4 • Math • Addition & Subtraction";
const SPECS = Object.freeze({
  [IDS.addition]: { title: "Addition Story Problems Within 5,000", instruction: "Read each question. Show your thinking by writing and/or drawing your answer." },
  [IDS.missing]: { title: "Missing Addend Story Problems", instruction: "Find the missing amount in each story problem. Show your work." },
  [IDS.subtraction]: { title: "Subtraction Story Problems", instruction: "Solve each subtraction story problem. Show your work." }
});
const FOUNDER_PROOF_SEEDS = Object.freeze({
  [IDS.addition]: "g4-b3-founder-addition",
  [IDS.missing]: "g4-b3-founder-missing",
  [IDS.subtraction]: "g4-b3-founder-subtraction"
});
const PRE_DENSITY_TRUTH_HASHES = Object.freeze({
  [IDS.addition]: "706c4a3832683c42328a5a02402d2a7e861034c8214721b41d8b56a2a4a2972d",
  [IDS.missing]: "ed74fd9a775018273e47a92c8289df1296bf02a2d326ed235cf5275d44253eb2",
  [IDS.subtraction]: "161ba3f0a32c381053895f6ff063f60804a3e388241f4eb1ee4ca98253afa81d"
});

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
      options: { filename: "grade4-story-batch3-test.pdf", includeAnswerKey }
    });
  });
}

function pdfPageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function signature(runtime) {
  return runtime.normalizedContentObject.content.items.map((item) => ({
    prompt: item.prompt,
    answer: item.answer,
    operation: item.operation,
    operationFamily: item.operationFamily,
    firstAddend: item.firstAddend,
    secondAddend: item.secondAddend,
    knownAddend: item.knownAddend,
    total: item.total,
    minuend: item.minuend,
    subtrahend: item.subtrahend,
    difference: item.difference,
    missingPosition: item.missingPosition,
    unknownPosition: item.unknownPosition,
    contextId: item.contextId,
    templateId: item.templateId,
    storyType: item.storyType,
    answerState: item.answerState,
    duplicateSignature: item.duplicateSignature,
    isExample: item.isExample
  }));
}

function founderTruthHash(runtime) {
  const truth = runtime.worksheet.problems.map((problem) => ({
    prompt: problem.prompt,
    answer: problem.answer,
    a: problem.a,
    b: problem.b,
    operation: problem.operation,
    firstAddend: problem.firstAddend,
    secondAddend: problem.secondAddend,
    total: problem.total,
    minuend: problem.minuend,
    subtrahend: problem.subtrahend,
    difference: problem.difference,
    missingPosition: problem.missingPosition,
    missingValue: problem.missingValue,
    contextId: problem.contextId,
    templateId: problem.templateId,
    storyType: problem.storyType,
    answerState: problem.answerState,
    duplicateSignature: problem.duplicateSignature
  }));
  return crypto.createHash("sha256").update(JSON.stringify(truth)).digest("hex");
}

function promptHeight(prompt) {
  const doc = new PDFDocument({ autoFirstPage: false });
  const fontPath = path.join(__dirname, "..", "public", "fonts", "SourceSans3", "SourceSans3-Regular.ttf");
  doc.registerFont("SS3-Regular-Test", fontPath);
  doc.font("SS3-Regular-Test").fontSize(12);
  return doc.heightOfString(`1)  ${prompt}`, { width: 504, align: "left" });
}

function workBoxGeometry(prompt, slots, slotIndex = 0) {
  const startY = 166;
  const bottomContentY = 714;
  const cellHeight = (bottomContentY - startY) / slots;
  const cellTopY = startY + slotIndex * cellHeight;
  return rendererTest.buildWordProblemWorkBoxGeometry({
    cellTopY,
    cellBottomY: cellTopY + cellHeight,
    promptHeight: promptHeight(prompt)
  });
}

function assertStudentPageGeometry(defaults) {
  const additionPrompt = [...defaults[IDS.addition].worksheet.problems]
    .sort((a, b) => a.prompt.length - b.prompt.length)[0].prompt;
  const missingPrompt = [...defaults[IDS.missing].worksheet.problems]
    .sort((a, b) => b.prompt.length - a.prompt.length)[0].prompt;
  const subtractionPrompt = [...defaults[IDS.subtraction].worksheet.problems]
    .filter((problem) => problem.storyType === "compare")
    .sort((a, b) => b.prompt.length - a.prompt.length)[0].prompt;

  [additionPrompt, missingPrompt, subtractionPrompt].forEach((prompt) => {
    const revised = workBoxGeometry(prompt, 3);
    const prior = workBoxGeometry(prompt, 4);
    assert(revised.boxHeight > prior.boxHeight + 40, "three-slot work boxes must be materially taller");
    assert(revised.boxHeight >= 100, "Grade 4 work boxes must support vertical computation");
    assert.strictEqual(revised.promptToBoxGap, 8);
    assert(revised.promptBottomY < revised.boxTop);
    assert(revised.boxBottom <= revised.cellBottomY - 23);
    assert(revised.bottomBreathing >= 23);
  });

  const finalPageSecondSlot = workBoxGeometry(subtractionPrompt, 3, 1);
  assert(finalPageSecondSlot.boxBottom < 714);
  assert.strictEqual(defaults[IDS.addition].layout.display.denseGridRows, 3);

  const compact = rendererTest.buildCompactWordProblemAnswerKeyGeometry({ y: 0, height: 88, promptHeight: 38 });
  assert(compact.requiredHeight <= 88);
  assert(compact.answerY > compact.promptY);
  assert(compact.separatorY > compact.answerY);
}

function assertPublicAndLayout(runtime, id, expectedCount = 8) {
  const spec = SPECS[id];
  const items = runtime.normalizedContentObject.content.items;
  assert.strictEqual(runtime.item.status, "generated");
  assert.strictEqual(runtime.layout.header.title, spec.title);
  assert.strictEqual(runtime.contentObject.meta.title, spec.title);
  assert.strictEqual(runtime.layout.header.subtitle, "");
  assert.strictEqual(runtime.layout.instruction, spec.instruction);
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, FOOTER);
  assert.strictEqual(items.length, expectedCount);
  assert.strictEqual(runtime.layout.template.columns, 1);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 3);
  assert.strictEqual(runtime.layout.display.workSpaceBox, true);
  assert.strictEqual(runtime.layout.display.compactWordProblemAnswerKey, true);
  assert.strictEqual(runtime.layout.display.equalHeightItems, true);
  assert.strictEqual(runtime.layout.display.denseGridRows, 3);
  assert.strictEqual(runtime.layout.display.hideSubtitle, true);
  assert.deepStrictEqual(buildAnswerKeyItems(items).map((item) => item.answer), items.map((item) => item.answer));
  const publicText = JSON.stringify({ title: runtime.layout.header.title, instruction: runtime.layout.instruction, footer: FOOTER });
  assert(!publicText.includes(id));
  assert(!publicText.includes("addition_subtraction_word_problems"));
}

function assertLanguageAndVariety(runtime) {
  const names = new Map();
  const objects = new Map();
  const pairs = new Set();
  const templates = new Set();
  const recentNames = [];
  const recentObjects = [];
  const recentTemplates = [];
  runtime.worksheet.problems.forEach((problem) => {
    assert(problem.prompt.length <= 190, problem.prompt);
    assert(!/[{}]|\$\{|undefined|null|What number of/i.test(problem.prompt), problem.prompt);
    assert(!/\bthey (has|needs|adds|uses)\b|\bdoes they\b|\bdo (he|she)\b/i.test(problem.prompt), problem.prompt);
    assert(/[?]$/.test(problem.prompt), problem.prompt);
    const [name, object] = problem.contextId.split(":");
    assert(name && object);
    assert(!pairs.has(problem.contextId), `Repeated context pair ${problem.contextId}`);
    assert(!recentNames.includes(name), `Near-adjacent name ${name}`);
    assert(!recentObjects.includes(object), `Near-adjacent object ${object}`);
    assert(!recentTemplates.includes(problem.templateId), `Near-adjacent template ${problem.templateId}`);
    pairs.add(problem.contextId);
    templates.add(problem.templateId);
    names.set(name, (names.get(name) || 0) + 1);
    objects.set(object, (objects.get(object) || 0) + 1);
    recentNames.push(name); recentObjects.push(object); recentTemplates.push(problem.templateId);
    if (recentNames.length > 2) recentNames.shift();
    if (recentObjects.length > 2) recentObjects.shift();
    if (recentTemplates.length > 2) recentTemplates.shift();
  });
  names.forEach((count) => assert(count <= 2));
  objects.forEach((count) => assert(count <= 2));
  assert.strictEqual(pairs.size, runtime.worksheet.problems.length);
  assert(templates.size >= Math.min(8, runtime.worksheet.problems.length));
}

function assertTruth(runtime, id) {
  const items = runtime.normalizedContentObject.content.items;
  const typeCounts = new Map();
  items.forEach((item) => {
    assert(item.contextId && item.templateId && item.storyType && item.duplicateSignature && item.answerState);
    typeCounts.set(item.storyType, (typeCounts.get(item.storyType) || 0) + 1);
    if (id === IDS.addition) {
      assert.strictEqual(item.operation, "add");
      assert.strictEqual(item.operationFamily, "addition");
      assert.strictEqual(item.unknownPosition, "total");
      assert.strictEqual(item.firstAddend + item.secondAddend, item.total);
      assert.strictEqual(item.answer, item.total);
      assert(["join_result", "combine_total"].includes(item.storyType));
    } else if (id === IDS.missing) {
      assert.strictEqual(item.operation, "add");
      assert.strictEqual(item.operationFamily, "addition");
      assert.strictEqual(item.firstAddend + item.secondAddend, item.total);
      const missing = item.missingPosition === "first" ? item.firstAddend : item.secondAddend;
      const known = item.missingPosition === "first" ? item.secondAddend : item.firstAddend;
      assert.strictEqual(item.answer, missing);
      assert.strictEqual(item.missingValue, missing);
      assert.strictEqual(item.knownAddend, known);
      assert.strictEqual(item.unknownPosition, item.missingPosition === "first" ? "first_addend" : "second_addend");
    } else {
      assert.strictEqual(item.operation, "subtract");
      assert.strictEqual(item.operationFamily, "subtraction");
      assert.strictEqual(item.unknownPosition, "difference");
      assert(item.minuend >= item.subtrahend);
      assert.strictEqual(item.minuend - item.subtrahend, item.difference);
      assert.strictEqual(item.answer, item.difference);
      assert(["take_away", "compare"].includes(item.storyType));
    }
    assert.strictEqual(item.answerState.answer, item.answer);
  });
  if (id === IDS.addition) assert.deepStrictEqual(Object.fromEntries(typeCounts), { combine_total: 4, join_result: 4 });
  if (id === IDS.missing) {
    assert.strictEqual(items.filter((item) => item.missingPosition === "first").length, 4);
    assert.strictEqual(items.filter((item) => item.missingPosition === "second").length, 4);
  }
  if (id === IDS.subtraction) assert.deepStrictEqual(Object.fromEntries(typeCounts), { compare: 4, take_away: 4 });
}

function assertThrowsFor(id, options, pattern = /Grade 4/) {
  assert.throws(() => buildCatalogWorksheetRuntime(id, { worksheetSeed: "g4-b3-invalid", ...options }), pattern);
}

async function run() {
  const defaults = {};
  for (const id of Object.values(IDS)) {
    defaults[id] = buildCatalogWorksheetRuntime(id, { worksheetSeed: `g4-b3-default-${id}` });
    assertPublicAndLayout(defaults[id], id);
    assertLanguageAndVariety(defaults[id]);
    assertTruth(defaults[id], id);
    assert.strictEqual(pdfPageCount(await render(defaults[id], false)), 3);
    assert.strictEqual(pdfPageCount(await render(defaults[id])), 5);
    assert.deepStrictEqual(rendererTest.paginateEven(defaults[id].worksheet.problems, 3).map((page) => page.length), [3, 3, 2]);
    assert.strictEqual(getCustomizationFamilyForResource(id), null);
  }
  assertStudentPageGeometry(defaults);

  for (const id of Object.values(IDS)) {
    const founderRuntime = buildCatalogWorksheetRuntime(id, { worksheetSeed: FOUNDER_PROOF_SEEDS[id] });
    assert.strictEqual(founderTruthHash(founderRuntime), PRE_DENSITY_TRUTH_HASHES[id], `${id} arithmetic and prompts changed`);
  }

  let sameSeedFailures = 0;
  for (let seed = 0; seed < 30; seed += 1) {
    for (const id of Object.values(IDS)) {
      const first = buildCatalogWorksheetRuntime(id, { worksheetSeed: `g4-b3-seed-${seed}` });
      const repeat = buildCatalogWorksheetRuntime(id, { worksheetSeed: `g4-b3-seed-${seed}` });
      if (JSON.stringify(signature(first)) !== JSON.stringify(signature(repeat))) sameSeedFailures += 1;
      assertTruth(first, id);
      assertLanguageAndVariety(first);
    }
  }
  assert.strictEqual(sameSeedFailures, 0);
  for (const id of Object.values(IDS)) {
    assert.notDeepStrictEqual(
      signature(buildCatalogWorksheetRuntime(id, { worksheetSeed: "g4-b3-variation-a" })),
      signature(buildCatalogWorksheetRuntime(id, { worksheetSeed: "g4-b3-variation-b" }))
    );
  }

  const shared = {
    worksheetSeed: "g4-b3-variable-contract",
    questionCount: 4,
    questionsPerPage: 2,
    selectedNumbers: [500, 700, 900, 1200],
    selectedContexts: ["maya", "leo"],
    selectedObjects: ["books", "tickets"]
  };
  const selectedAddition = buildCatalogWorksheetRuntime(IDS.addition, { ...shared, minimumTotal: 1000, maximumTotal: 2100, storyTypes: ["join"] });
  assert(selectedAddition.worksheet.problems.every((item) => item.storyType === "join_result" && item.total >= 1000 && item.total <= 2100));
  const selectedMissing = buildCatalogWorksheetRuntime(IDS.missing, { ...shared, missingAddendPosition: "first", storyTypes: ["start_unknown"] });
  assert(selectedMissing.worksheet.problems.every((item) => item.missingPosition === "first"));
  const selectedSubtraction = buildCatalogWorksheetRuntime(IDS.subtraction, { ...shared, minimumFirstOperand: 700, maximumFirstOperand: 1200, storyTypes: ["compare"] });
  assert(selectedSubtraction.worksheet.problems.every((item) => item.storyType === "compare" && item.minuend >= item.subtrahend));

  for (const alias of ["includeExample", "completedExample", "example"]) {
    for (const id of Object.values(IDS)) {
      const runtime = buildCatalogWorksheetRuntime(id, { worksheetSeed: `g4-b3-example-${alias}-${id}`, questionCount: 8, [alias]: true });
      assert.strictEqual(runtime.normalizedContentObject.content.items.length, 9);
      assert.strictEqual(runtime.layout.problems.filter((item) => item.isExample).length, 1);
      assert.strictEqual(runtime.layout.problems.filter((item) => !item.isExample).length, 8);
      assert.deepStrictEqual(rendererTest.paginateEven(runtime.layout.problems, 3).map((page) => page.length), [3, 3, 3]);
      assert.strictEqual(pdfPageCount(await render(runtime, false)), 3);
      assert.strictEqual(pdfPageCount(await render(runtime)), 5);
    }
  }
  const maximum = buildCatalogWorksheetRuntime(IDS.addition, { worksheetSeed: "g4-b3-max-count", questionCount: 16, questionsPerPage: 3 });
  assert.strictEqual(maximum.worksheet.problems.length, 16);
  assertLanguageAndVariety(maximum);
  assert.deepStrictEqual(rendererTest.paginateEven(maximum.worksheet.problems, 3).map((page) => page.length), [3, 3, 3, 3, 2, 2]);
  assert.strictEqual(pdfPageCount(await render(maximum, false)), 6);
  assert.strictEqual(pdfPageCount(await render(maximum)), 9);

  const invalidShared = [
    { minA: 1.5 }, { minA: -1 }, { selectedNumbers: [] }, { selectedNumbers: [500, 500] },
    { minA: 900, minimumFirstOperand: 800 }, { minA: 1000, maxA: 500 },
    { questionCount: 17 }, { questionsPerPage: 5 }, { operation: "mixed" },
    { selectedStoryTypes: ["multi_step"] }, { selectedContexts: ["unknown"] },
    { includeExample: "sometimes" }, { includeExample: true, completedExample: false },
    { selectedContexts: ["maya"], selectedObjects: ["books"], questionCount: 3 },
    { regroupingMode: "required" }, { showWorkBox: false }, { templateId: "override" },
    { answerState: { answer: 1 } }
  ];
  invalidShared.forEach((options) => assertThrowsFor(IDS.addition, options));
  assertThrowsFor(IDS.addition, { missingPosition: "first" });
  assertThrowsFor(IDS.missing, { missingPosition: "first", missingAddendPosition: "second" });
  assertThrowsFor(IDS.missing, { missingPosition: "first", storyTypes: ["change"] });
  assertThrowsFor(IDS.subtraction, { minTotal: 0 });
  assertThrowsFor(IDS.subtraction, { maxTotal: 5000 });
  assertThrowsFor(IDS.subtraction, { minA: 100, maxA: 100, minB: 200, maxB: 200 });
  Object.values(IDS).forEach((id) => assertThrowsFor(id, { questionsPerPage: 4 }));

  const grade2 = buildCatalogWorksheetRuntime("g2_addition_word_problems_within_100", { worksheetSeed: "g4-b3-grade2-isolation" });
  const grade3 = buildCatalogWorksheetRuntime("grade3_addition_subtraction_word_problems_addition_word_problem", { worksheetSeed: "g4-b3-grade3-isolation" });
  assert.strictEqual(grade2.normalizedContentObject.content.items.length, 12);
  assert.strictEqual(grade2.layout.header.title, "Addition Story Problems Within 100");
  assert.strictEqual(grade3.normalizedContentObject.content.items.length, 12);
  assert.strictEqual(grade3.layout.header.title, "Addition Story Problems Within 100");
  assert.strictEqual(Object.prototype.hasOwnProperty.call(grade2.normalizedContentObject.content.items[0], "contextId"), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(grade3.normalizedContentObject.content.items[0], "operationFamily"), false);

  console.log("Grade 4 Batch 3 story-problem tests passed.");
  console.log("30 deterministic seeds passed; same-seed failures 0; different-seed variation passed.");
  console.log("Default PDFs: 5 pages each (3 student + 2 compact answer-key pages); student pagination 3/3/2.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
