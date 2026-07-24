"use strict";

const assert = require("assert");
const crypto = require("crypto");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { getCustomizationFamilyForResource } = require("../config/worksheetCustomization");
const { renderWorksheetPDF, buildAnswerKeyItems, __test: rendererTest } = require("../renderers/pdfRenderer");

const IDS = Object.freeze({
  addition: "grade5_addition_subtraction_word_problems_addition_word_problem",
  missing: "grade5_addition_subtraction_word_problems_missing_addend_word_problem",
  subtraction: "grade5_addition_subtraction_word_problems_subtraction_word_problem"
});
const SPECS = Object.freeze({
  [IDS.addition]: {
    title: "Addition Story Problems",
    instruction: "Solve each addition story problem. Show your work."
  },
  [IDS.missing]: {
    title: "Missing Addend Story Problems",
    instruction: "Find the missing amount in each story problem. Show your work."
  },
  [IDS.subtraction]: {
    title: "Subtraction Story Problems",
    instruction: "Solve each subtraction story problem. Show your work."
  }
});
const FOOTER = "Grade 5 • Math • Addition & Subtraction";
const GRADE4_TRUTH_HASHES = Object.freeze({
  grade4_addition_subtraction_word_problems_addition_word_problem:
    "706c4a3832683c42328a5a02402d2a7e861034c8214721b41d8b56a2a4a2972d",
  grade4_addition_subtraction_word_problems_missing_addend_word_problem:
    "ed74fd9a775018273e47a92c8289df1296bf02a2d326ed235cf5275d44253eb2",
  grade4_addition_subtraction_word_problems_subtraction_word_problem:
    "161ba3f0a32c381053895f6ff063f60804a3e388241f4eb1ee4ca98253afa81d"
});
const GRADE4_SEEDS = Object.freeze({
  grade4_addition_subtraction_word_problems_addition_word_problem: "g4-b3-founder-addition",
  grade4_addition_subtraction_word_problems_missing_addend_word_problem: "g4-b3-founder-missing",
  grade4_addition_subtraction_word_problems_subtraction_word_problem: "g4-b3-founder-subtraction"
});

class MemoryResponse extends Writable {
  constructor() {
    super();
    this.chunks = [];
  }
  setHeader() {}
  _write(chunk, encoding, callback) {
    this.chunks.push(Buffer.from(chunk));
    callback();
  }
  buffer() {
    return Buffer.concat(this.chunks);
  }
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
      options: {
        filename: "grade5-addition-subtraction-stories-batch6-test.pdf",
        includeAnswerKey
      }
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
    responseTarget: item.responseTarget,
    contextId: item.contextId,
    templateId: item.templateId,
    storyType: item.storyType,
    answerState: item.answerState,
    duplicateSignature: item.duplicateSignature,
    isExample: item.isExample
  }));
}

function grade4TruthHash(runtime) {
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

function assertPublicContract(runtime, id, count = 8) {
  const spec = SPECS[id];
  const items = runtime.normalizedContentObject.content.items;
  assert.strictEqual(runtime.item.status, "generated");
  assert.strictEqual(runtime.layout.header.title, spec.title);
  assert.strictEqual(runtime.contentObject.meta.title, spec.title);
  assert.strictEqual(runtime.layout.header.subtitle, "");
  assert.strictEqual(runtime.layout.instruction, spec.instruction);
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, FOOTER);
  assert.strictEqual(items.length, count);
  assert.strictEqual(runtime.layout.template.columns, 1);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 3);
  assert.strictEqual(runtime.layout.display.workSpaceBox, true);
  assert.strictEqual(runtime.layout.display.compactWordProblemAnswerKey, true);
  assert.strictEqual(runtime.layout.display.equalHeightItems, true);
  assert.strictEqual(runtime.layout.display.denseGridRows, 3);
  assert.strictEqual(runtime.layout.display.hideSubtitle, true);
  assert.deepStrictEqual(
    buildAnswerKeyItems(items).map((item) => item.answer),
    items.map((item) => item.answer)
  );
  assert.strictEqual(getCustomizationFamilyForResource(id), null);
}

function assertLanguageAndVariety(runtime) {
  const names = new Map();
  const objects = new Map();
  const pairs = new Set();
  const prompts = new Set();
  const templates = new Set();
  const recentNames = [];
  const recentObjects = [];
  const recentTemplates = [];
  runtime.worksheet.problems.forEach((problem) => {
    assert(problem.prompt.length <= 210, problem.prompt);
    assert(/[?]$/.test(problem.prompt), problem.prompt);
    assert(/\b\d{1,3}(,\d{3})+\b/.test(problem.prompt), `Missing Grade 5 comma formatting: ${problem.prompt}`);
    assert(!/[{}]|\$\{|undefined|null|What number of/i.test(problem.prompt), problem.prompt);
    assert(!/\bthey (has|needs|adds|uses)\b|\bdoes they\b|\bdo (he|she)\b/i.test(problem.prompt), problem.prompt);
    const [name, object] = problem.contextId.split(":");
    assert(name && object);
    assert(!pairs.has(problem.contextId), `Repeated context pair ${problem.contextId}`);
    assert(!prompts.has(problem.prompt), `Repeated prompt ${problem.prompt}`);
    assert(!recentNames.includes(name), `Near-adjacent name ${name}`);
    assert(!recentObjects.includes(object), `Near-adjacent object ${object}`);
    assert(!recentTemplates.includes(problem.templateId), `Near-adjacent template ${problem.templateId}`);
    pairs.add(problem.contextId);
    prompts.add(problem.prompt);
    templates.add(problem.templateId);
    names.set(name, (names.get(name) || 0) + 1);
    objects.set(object, (objects.get(object) || 0) + 1);
    recentNames.push(name);
    recentObjects.push(object);
    recentTemplates.push(problem.templateId);
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
  const signatures = new Set();
  const typeCounts = new Map();
  runtime.normalizedContentObject.content.items.forEach((item) => {
    assert(item.contextId && item.templateId && item.storyType && item.answerState);
    assert(item.duplicateSignature.startsWith("grade5_story:"));
    assert(!signatures.has(item.duplicateSignature));
    signatures.add(item.duplicateSignature);
    assert.strictEqual(item.responseTarget, "whole_number");
    assert.strictEqual(item.answerState.responseTarget, "whole_number");
    assert.strictEqual(item.answerState.answer, item.answer);
    typeCounts.set(item.storyType, (typeCounts.get(item.storyType) || 0) + 1);
    if (id === IDS.addition) {
      assert.strictEqual(item.operation, "add");
      assert.strictEqual(item.operationFamily, "addition");
      assert.strictEqual(item.unknownPosition, "total");
      assert.strictEqual(item.firstAddend + item.secondAddend, item.total);
      assert.strictEqual(item.answer, item.total);
      assert(item.total >= 10000 && item.total <= 100000);
    } else if (id === IDS.missing) {
      const missing = item.missingPosition === "first" ? item.firstAddend : item.secondAddend;
      const known = item.missingPosition === "first" ? item.secondAddend : item.firstAddend;
      assert.strictEqual(item.operation, "add");
      assert.strictEqual(item.operationFamily, "addition");
      assert.strictEqual(item.firstAddend + item.secondAddend, item.total);
      assert.strictEqual(item.answer, missing);
      assert.strictEqual(item.missingValue, missing);
      assert.strictEqual(item.knownAddend, known);
      assert.strictEqual(item.unknownPosition, item.missingPosition === "first" ? "first_addend" : "second_addend");
    } else {
      assert.strictEqual(item.operation, "subtract");
      assert.strictEqual(item.operationFamily, "subtraction");
      assert.strictEqual(item.unknownPosition, "difference");
      assert(item.minuend >= item.subtrahend);
      assert(item.difference >= 0);
      assert.strictEqual(item.minuend - item.subtrahend, item.difference);
      assert.strictEqual(item.answer, item.difference);
      assert(item.minuend >= 10000 && item.minuend <= 100000);
    }
  });
  if (runtime.worksheet.problems.length === 8) {
    if (id === IDS.addition) assert.deepStrictEqual(Object.fromEntries(typeCounts), { combine_total: 4, join_result: 4 });
    if (id === IDS.missing) {
      assert.strictEqual(runtime.worksheet.problems.filter((item) => item.missingPosition === "first").length, 4);
      assert.strictEqual(runtime.worksheet.problems.filter((item) => item.missingPosition === "second").length, 4);
    }
    if (id === IDS.subtraction) assert.deepStrictEqual(Object.fromEntries(typeCounts), { compare: 4, take_away: 4 });
  }
}

function assertThrowsFor(id, options) {
  assert.throws(
    () => buildCatalogWorksheetRuntime(id, { worksheetSeed: "g5-b6-invalid", ...options }),
    /stor|word problem/i
  );
}

async function run() {
  const defaults = {};
  for (const id of Object.values(IDS)) {
    defaults[id] = buildCatalogWorksheetRuntime(id, { worksheetSeed: `g5-b6-default-${id}` });
    assertPublicContract(defaults[id], id);
    assertLanguageAndVariety(defaults[id]);
    assertTruth(defaults[id], id);
    assert.strictEqual(pdfPageCount(await render(defaults[id], false)), 3);
    assert.strictEqual(pdfPageCount(await render(defaults[id], true)), 5);
    assert.deepStrictEqual(
      rendererTest.paginateEven(defaults[id].worksheet.problems, 3).map((page) => page.length),
      [3, 3, 2]
    );
  }

  let sameSeedFailures = 0;
  for (let seed = 0; seed < 30; seed += 1) {
    for (const id of Object.values(IDS)) {
      const first = buildCatalogWorksheetRuntime(id, { worksheetSeed: `g5-b6-seed-${seed}` });
      const repeat = buildCatalogWorksheetRuntime(id, { worksheetSeed: `g5-b6-seed-${seed}` });
      if (JSON.stringify(signature(first)) !== JSON.stringify(signature(repeat))) sameSeedFailures += 1;
      assertTruth(first, id);
      assertLanguageAndVariety(first);
    }
  }
  assert.strictEqual(sameSeedFailures, 0);
  for (const id of Object.values(IDS)) {
    assert.notDeepStrictEqual(
      signature(buildCatalogWorksheetRuntime(id, { worksheetSeed: "g5-b6-variation-a" })),
      signature(buildCatalogWorksheetRuntime(id, { worksheetSeed: "g5-b6-variation-b" }))
    );
  }

  const shared = {
    worksheetSeed: "g5-b6-variable-contract",
    questionCount: 4,
    questionsPerPage: 2,
    selectedNumbers: [12000, 15000, 20000, 25000],
    selectedContexts: ["maya", "leo"],
    selectedObjects: ["books", "tickets"]
  };
  const selectedAddition = buildCatalogWorksheetRuntime(IDS.addition, {
    ...shared,
    minimumTotal: 25000,
    maximumTotal: 50000,
    storyTypes: ["join"]
  });
  assert(selectedAddition.worksheet.problems.every((item) => (
    item.storyType === "join_result" &&
    [12000, 15000, 20000, 25000].includes(item.firstAddend) &&
    [12000, 15000, 20000, 25000].includes(item.secondAddend) &&
    item.total >= 25000 &&
    item.total <= 50000
  )));
  const selectedMissing = buildCatalogWorksheetRuntime(IDS.missing, {
    ...shared,
    missingAddendPosition: "first",
    storyTypes: ["start_unknown"]
  });
  assert(selectedMissing.worksheet.problems.every((item) => item.missingPosition === "first"));
  const selectedSubtraction = buildCatalogWorksheetRuntime(IDS.subtraction, {
    ...shared,
    minimumFirstOperand: 15000,
    maximumFirstOperand: 25000,
    minimumSecondOperand: 12000,
    maximumSecondOperand: 20000,
    storyTypes: ["compare"]
  });
  assert(selectedSubtraction.worksheet.problems.every((item) => (
    item.storyType === "compare" &&
    item.minuend >= item.subtrahend &&
    item.difference >= 0
  )));

  for (const alias of ["includeExample", "completedExample", "example"]) {
    for (const id of Object.values(IDS)) {
      const runtime = buildCatalogWorksheetRuntime(id, {
        worksheetSeed: `g5-b6-example-${alias}-${id}`,
        questionCount: 8,
        [alias]: true
      });
      assert.strictEqual(runtime.layout.problems.filter((item) => item.isExample).length, 1);
      assert.strictEqual(runtime.layout.problems.filter((item) => !item.isExample).length, 8);
      assert.strictEqual(pdfPageCount(await render(runtime, false)), 3);
      assert.strictEqual(pdfPageCount(await render(runtime, true)), 5);
    }
  }

  const maximum = buildCatalogWorksheetRuntime(IDS.addition, {
    worksheetSeed: "g5-b6-maximum",
    questionCount: 16,
    questionsPerPage: 3
  });
  assert.strictEqual(maximum.worksheet.problems.length, 16);
  assertLanguageAndVariety(maximum);
  assertTruth(maximum, IDS.addition);
  assert.deepStrictEqual(
    rendererTest.paginateEven(maximum.worksheet.problems, 3).map((page) => page.length),
    [3, 3, 3, 3, 2, 2]
  );
  assert.strictEqual(pdfPageCount(await render(maximum, false)), 6);
  assert.strictEqual(pdfPageCount(await render(maximum, true)), 9);

  [
    { minA: 1.5 },
    { minA: -1 },
    { maxA: 100001 },
    { selectedNumbers: [] },
    { selectedNumbers: [12000, 12000] },
    { minA: 20000, minimumFirstOperand: 19000 },
    { minA: 30000, maxA: 20000 },
    { questionCount: 17 },
    { questionsPerPage: 4 },
    { operation: "mixed" },
    { selectedOperations: ["addition", "subtraction"] },
    { selectedStoryTypes: ["multi_step"] },
    { selectedContexts: ["unknown"] },
    { includeExample: "sometimes" },
    { includeExample: true, completedExample: false },
    { selectedContexts: ["maya"], selectedObjects: ["books"], questionCount: 3 },
    { regroupingMode: "required" },
    { showWorkBox: false },
    { templateId: "override" },
    { responseTarget: "caller_owned" },
    { answerState: { answer: 1 } }
  ].forEach((options) => assertThrowsFor(IDS.addition, options));
  assertThrowsFor(IDS.addition, { missingPosition: "first" });
  assertThrowsFor(IDS.missing, { missingPosition: "first", missingAddendPosition: "second" });
  assertThrowsFor(IDS.missing, { missingPosition: "first", storyTypes: ["change"] });
  assertThrowsFor(IDS.subtraction, { minTotal: 0 });
  assertThrowsFor(IDS.subtraction, { minA: 10000, maxA: 10000, minB: 20000, maxB: 20000 });

  for (const [id, expectedHash] of Object.entries(GRADE4_TRUTH_HASHES)) {
    const runtime = buildCatalogWorksheetRuntime(id, { worksheetSeed: GRADE4_SEEDS[id] });
    assert.strictEqual(grade4TruthHash(runtime), expectedHash, `${id} output changed`);
  }
  const grade1 = buildCatalogWorksheetRuntime("g1_addition_word_problems", { worksheetSeed: "g5-b6-grade1" });
  const grade2 = buildCatalogWorksheetRuntime("g2_addition_word_problems_within_100", { worksheetSeed: "g5-b6-grade2" });
  const grade3 = buildCatalogWorksheetRuntime(
    "grade3_addition_subtraction_word_problems_addition_word_problem",
    { worksheetSeed: "g5-b6-grade3" }
  );
  assert.strictEqual(grade1.normalizedContentObject.content.items.length, 6);
  assert.strictEqual(grade2.normalizedContentObject.content.items.length, 12);
  assert.strictEqual(grade3.normalizedContentObject.content.items.length, 12);
  assert.strictEqual(grade3.layout.header.title, "Addition Word Problems");

  console.log("Grade 5 Addition/Subtraction Stories Batch 6 tests passed.");
  console.log("Resources: 3; deterministic seeds: 30; same-seed failures: 0; different-seed variation: passed.");
  console.log("Defaults: 8 questions, maximum: 16, questions per page: 3.");
  console.log("Default PDFs: 5 pages each; maximum PDF: 9 pages including compact key.");
  console.log("Structured truth, aliases, context variety, pagination, examples, and Grade 1-4 isolation: passed.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
