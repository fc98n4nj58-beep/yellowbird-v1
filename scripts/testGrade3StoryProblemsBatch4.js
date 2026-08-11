"use strict";

const assert = require("assert");
const fs = require("fs");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { getMasterWorksheetCatalog } = require("../services/worksheetCatalogService");
const { renderWorksheetPDF, buildAnswerKeyItems } = require("../renderers/pdfRenderer");

const IDS = Object.freeze({
  addition: "grade3_addition_subtraction_word_problems_addition_word_problem",
  missing: "grade3_addition_subtraction_word_problems_missing_addend_word_problem",
  subtraction: "grade3_addition_subtraction_word_problems_subtraction_word_problem"
});
const FOOTER = "Grade 3 • Math • Addition and Subtraction";
const SPECS = Object.freeze({
  [IDS.addition]: {
    title: "Addition Story Problems Within 100",
    instruction: "Read each question. Show your thinking by writing and/or drawing your answer."
  },
  [IDS.missing]: {
    title: "Missing Addend Word Problems",
    instruction: "Solve each missing-addend word problem. Show your thinking in the box."
  },
  [IDS.subtraction]: {
    title: "Subtraction Word Problems",
    instruction: "Solve each subtraction word problem. Show your thinking in the box."
  }
});
const REJECTED_LANGUAGE = Object.freeze([
  /What number of/i,
  /remaining number of/i,
  /that are still there/i,
  /A collection should have/i,
  /should .* get to increase/i,
  /Find the number of/i
]);

class MemoryResponse extends Writable {
  constructor() { super(); this.chunks = []; }
  setHeader() {}
  _write(chunk, encoding, callback) { this.chunks.push(Buffer.from(chunk)); callback(); }
  buffer() { return Buffer.concat(this.chunks); }
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
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
      options: { filename: "grade3-story-problems-batch4-test.pdf", includeAnswerKey }
    });
  });
}

function signature(runtime) {
  return runtime.normalizedContentObject.content.items.map((item) => ({
    prompt: item.prompt,
    answer: item.answer,
    a: item.a,
    b: item.b,
    op: item.op,
    operation: item.operation,
    firstAddend: item.firstAddend,
    secondAddend: item.secondAddend,
    total: item.total,
    minuend: item.minuend,
    subtrahend: item.subtrahend,
    difference: item.difference,
    missingPosition: item.missingPosition,
    missingValue: item.missingValue,
    isExample: item.isExample
  }));
}

function assertPublicContract(runtime, id, expectedCount = 12) {
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
  assert.strictEqual(runtime.layout.display.hideSubtitle, true);
  assert(items.every((item) => item.prompt && Number.isFinite(Number(item.answer))));
  assert.deepStrictEqual(
    buildAnswerKeyItems(items).map((item) => item.answer),
    items.map((item) => item.answer)
  );
  const publicText = JSON.stringify({
    title: runtime.layout.header.title,
    instruction: runtime.layout.instruction,
    footer: runtime.contentObject.meta.curriculum.footerText,
    prompts: items.map((item) => item.prompt)
  });
  assert(!publicText.includes("— Grade 3"));
  assert(!publicText.includes(id));
  assert(!publicText.includes("addition_subtraction_word_problems"));
  assert(!runtime.layout.header.subtitle);
}

function increment(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function assertLanguageAndVariety(runtime) {
  const rawItems = runtime.worksheet.problems;
  const names = new Map();
  const objects = new Map();
  const pairs = new Set();
  const frames = new Set();
  const recentFrames = [];
  const recentNames = [];
  const recentObjects = [];
  const prompts = new Set();

  rawItems.forEach((item) => {
    assert(item.contextId, `Missing structured context for: ${item.prompt}`);
    assert(item.templateId, `Missing template identifier for: ${item.prompt}`);
    const [name, object] = item.contextId.split(":");
    assert(name && object);
    increment(names, name);
    increment(objects, object);
    assert(!pairs.has(item.contextId), `Repeated name/object pair: ${item.contextId}`);
    pairs.add(item.contextId);
    assert(!recentNames.includes(name), `Near-adjacent name reuse: ${name}`);
    assert(!recentObjects.includes(object), `Near-adjacent object reuse: ${object}`);
    recentNames.push(name);
    recentObjects.push(object);
    if (recentNames.length > 2) recentNames.shift();
    if (recentObjects.length > 2) recentObjects.shift();
    assert(!recentFrames.includes(item.templateId), `Near-adjacent template reuse: ${item.templateId}`);
    recentFrames.push(item.templateId);
    if (recentFrames.length > 2) recentFrames.shift();
    frames.add(item.templateId);
    assert(!prompts.has(item.prompt), `Repeated prompt: ${item.prompt}`);
    prompts.add(item.prompt);
    assert(!/[{}]|\$\{|undefined|null/i.test(item.prompt));
    assert(!/\s{2,}/.test(item.prompt));
    assert(!/\s[?.!,]/.test(item.prompt));
    assert(/[?.]$/.test(item.prompt));
    REJECTED_LANGUAGE.forEach((pattern) => {
      assert(!pattern.test(item.prompt), `Rejected wording '${pattern}' in: ${item.prompt}`);
    });
  });

  assert(frames.size >= 8);
  assert.strictEqual(pairs.size, 12);
  names.forEach((count, name) => assert(count <= 2, `${name} appears ${count} times.`));
  objects.forEach((count, object) => assert(count <= 2, `${object} appears ${count} times.`));
}

function assertRevisedPronounTemplates() {
  const cases = [
    { context: "leo", name: "Leo", phrase: "does he" },
    { context: "maya", name: "Maya", phrase: "does she" },
    { context: "sam", name: "Sam", phrase: "do they" }
  ];

  for (const testCase of cases) {
    const addition = buildCatalogWorksheetRuntime(IDS.addition, {
      worksheetSeed: `grade3-story-revised-addition-${testCase.context}`,
      questionCount: 8,
      selectedContexts: [testCase.context]
    });
    const additionPrompt = addition.worksheet.problems.find(
      (item) => item.templateId === "g3_add_question_first"
    )?.prompt || "";
    assert(additionPrompt.startsWith(`${testCase.name} combines `), additionPrompt);
    assert(additionPrompt.includes(` ${testCase.phrase} have altogether?`), additionPrompt);

    const missing = buildCatalogWorksheetRuntime(IDS.missing, {
      worksheetSeed: `grade3-story-revised-missing-${testCase.context}`,
      questionCount: 8,
      selectedContexts: [testCase.context]
    });
    const missingPrompt = missing.worksheet.problems.find(
      (item) => item.templateId === "g3_missing_second_question"
    )?.prompt || "";
    assert(missingPrompt.startsWith(`${testCase.name} has `), missingPrompt);
    assert(missingPrompt.includes(` ${testCase.phrase} need to have `), missingPrompt);
  }

  const prompts = cases.flatMap((testCase) => [
    buildCatalogWorksheetRuntime(IDS.addition, {
      worksheetSeed: `grade3-story-pronoun-scan-add-${testCase.context}`,
      questionCount: 8,
      selectedContexts: [testCase.context]
    }),
    buildCatalogWorksheetRuntime(IDS.missing, {
      worksheetSeed: `grade3-story-pronoun-scan-missing-${testCase.context}`,
      questionCount: 8,
      selectedContexts: [testCase.context]
    })
  ]).flatMap((runtime) => runtime.normalizedContentObject.content.items.map((item) => item.prompt));
  prompts.forEach((prompt) => {
    assert(!/\bthey (has|needs)\b/i.test(prompt), prompt);
    assert(!/(?:^|[.!?]\s+)(?:He|She) need\b/.test(prompt), prompt);
    assert(!/\bdoes they\b|\bdo (?:he|she)\b/i.test(prompt), prompt);
    assert(!/\{pronoun\}|\$\{[^}]*pronoun[^}]*\}/i.test(prompt), prompt);
  });
}

function assertArithmeticTruth(runtime, id) {
  const items = runtime.normalizedContentObject.content.items;
  if (id === IDS.addition) {
    items.forEach((item) => {
      assert.strictEqual(item.operation, "addition");
      assert.strictEqual(item.op, "+");
      assert.strictEqual(item.firstAddend, item.a);
      assert.strictEqual(item.secondAddend, item.b);
      assert.strictEqual(item.total, item.a + item.b);
      assert.strictEqual(item.answer, item.total);
      assert(item.a >= 10 && item.b >= 10 && item.total <= 100);
    });
  }
  if (id === IDS.missing) {
    const positions = { first: 0, second: 0 };
    items.forEach((item) => {
      assert.strictEqual(item.operation, "missing_addend");
      assert.strictEqual(item.op, "+");
      assert.strictEqual(item.total, item.firstAddend + item.secondAddend);
      assert.strictEqual(
        item.answer,
        item.missingPosition === "first" ? item.firstAddend : item.secondAddend
      );
      assert.strictEqual(item.missingValue, item.answer);
      assert(item.total <= 100);
      positions[item.missingPosition] += 1;
    });
    assert.deepStrictEqual(positions, { first: 6, second: 6 });
  }
  if (id === IDS.subtraction) {
    items.forEach((item) => {
      assert.strictEqual(item.operation, "subtraction");
      assert.strictEqual(item.op, "-");
      assert.strictEqual(item.a, item.minuend);
      assert.strictEqual(item.b, item.subtrahend);
      assert.strictEqual(item.difference, item.minuend - item.subtrahend);
      assert.strictEqual(item.answer, item.difference);
      assert(item.minuend <= 100 && item.subtrahend >= 1 && item.difference >= 0);
    });
  }
}

async function testDefaultsAndDeterminism() {
  for (const id of Object.values(IDS)) {
    const observed = new Set();
    for (let seedIndex = 0; seedIndex < 30; seedIndex += 1) {
      const options = { worksheetSeed: `grade3-story-batch4-${id}-${seedIndex}` };
      const runtime = buildCatalogWorksheetRuntime(id, options);
      const repeat = buildCatalogWorksheetRuntime(id, options);
      assertPublicContract(runtime, id);
      assertArithmeticTruth(runtime, id);
      assertLanguageAndVariety(runtime);
      assert.deepStrictEqual(signature(runtime), signature(repeat));
      observed.add(JSON.stringify(signature(runtime)));
    }
    assert(observed.size > 1, `Expected different-seed variation for ${id}.`);
    const defaultRuntime = buildCatalogWorksheetRuntime(id, { worksheetSeed: `grade3-story-default-${id}` });
    assert.strictEqual(pageCount(await render(defaultRuntime)), 6);
    assert.strictEqual(pageCount(await render(defaultRuntime, false)), 4);
  }
}

function testRangesSelectionsAndAliases() {
  for (const id of [IDS.addition, IDS.missing]) {
    const runtime = buildCatalogWorksheetRuntime(id, {
      worksheetSeed: `grade3-story-ranges-${id}`,
      questionCount: 12,
      minA: 20,
      maxA: 25,
      minB: 30,
      maxB: 35,
      maxTotal: 60
    });
    runtime.normalizedContentObject.content.items.forEach((item) => {
      assert(item.a >= 20 && item.a <= 25);
      assert(item.b >= 30 && item.b <= 35);
      assert(item.total <= 60);
    });
  }

  const subtraction = buildCatalogWorksheetRuntime(IDS.subtraction, {
    worksheetSeed: "grade3-story-subtraction-ranges",
    questionCount: 12,
    minA: 50,
    maxA: 60,
    minB: 10,
    maxB: 20,
    maxTotal: 60
  });
  subtraction.normalizedContentObject.content.items.forEach((item) => {
    assert(item.minuend >= 50 && item.minuend <= 60);
    assert(item.subtrahend >= 10 && item.subtrahend <= 20);
    assert(item.difference >= 0);
  });

  for (const alias of ["selectedNumbers", "onlyNumbers"]) {
    for (const id of [IDS.addition, IDS.missing]) {
      const runtime = buildCatalogWorksheetRuntime(id, {
        worksheetSeed: `grade3-story-selected-${id}-${alias}`,
        questionCount: 4,
        maxTotal: 60,
        [alias]: alias === "selectedNumbers" ? [12, 28] : "12,28"
      });
      runtime.normalizedContentObject.content.items.forEach((item) => {
        assert([12, 28].includes(item.a));
        assert([12, 28].includes(item.b));
      });
    }
  }

  const selectedSubtraction = buildCatalogWorksheetRuntime(IDS.subtraction, {
    worksheetSeed: "grade3-story-selected-subtraction",
    questionCount: 1,
    selectedNumbers: [12, 28]
  });
  assert.strictEqual(selectedSubtraction.normalizedContentObject.content.items[0].minuend, 28);
  assert.strictEqual(selectedSubtraction.normalizedContentObject.content.items[0].subtrahend, 12);

  for (const [key, value, expected] of [
    ["missingPosition", "first", "first"],
    ["missingAddendPosition", "second_addend", "second"],
    ["missingPartPosition", "start", "first"],
    ["unknownPosition", "missing_part", "second"]
  ]) {
    const runtime = buildCatalogWorksheetRuntime(IDS.missing, {
      worksheetSeed: `grade3-story-missing-alias-${key}`,
      questionCount: 4,
      [key]: value
    });
    assert(runtime.normalizedContentObject.content.items.every((item) => item.missingPosition === expected));
  }
}

function testContextControlsGrammarAndTakeAway() {
  assertRevisedPronounTemplates();
  for (const id of Object.values(IDS)) {
    const objectRuntime = buildCatalogWorksheetRuntime(id, {
      worksheetSeed: `grade3-story-object-${id}`,
      questionCount: 4,
      onlyObjects: "books"
    });
    assert(objectRuntime.normalizedContentObject.content.items.every((item) => /\bbooks?\b/i.test(item.prompt)));

    const contextRuntime = buildCatalogWorksheetRuntime(id, {
      worksheetSeed: `grade3-story-context-${id}`,
      questionCount: 4,
      selectedContexts: ["sam"]
    });
    assert(contextRuntime.normalizedContentObject.content.items.every((item) => item.prompt.includes("Sam")));

    const legacyObjectContext = buildCatalogWorksheetRuntime(id, {
      worksheetSeed: `grade3-story-legacy-context-${id}`,
      questionCount: 4,
      contexts: "books"
    });
    assert(legacyObjectContext.normalizedContentObject.content.items.every((item) => /\bbooks?\b/i.test(item.prompt)));
  }

  for (const id of Object.values(IDS)) {
    for (let seed = 0; seed < 20; seed += 1) {
      const runtime = buildCatalogWorksheetRuntime(id, {
        worksheetSeed: `grade3-story-singular-${id}-${seed}`,
        questionCount: 1,
        minA: id === IDS.subtraction ? 2 : 1,
        maxA: id === IDS.subtraction ? 2 : 1,
        minB: 1,
        maxB: 1,
        maxTotal: 2,
        onlyObjects: "books"
      });
      const prompt = runtime.normalizedContentObject.content.items[0].prompt;
      assert(!/\b1 books\b/i.test(prompt), prompt);
      assert(!/\b2 book\b/i.test(prompt), prompt);
      assert(!/\bthey (adds|uses|gives)\b/i.test(prompt), prompt);
      assert(!/\b(he|she) (add|use|give away)\b/i.test(prompt), prompt);
    }
  }

  const natural = buildCatalogWorksheetRuntime(IDS.subtraction, {
    worksheetSeed: "grade3-story-natural-language",
    naturalTakeAwayLanguage: true
  });
  const neutral = buildCatalogWorksheetRuntime(IDS.subtraction, {
    worksheetSeed: "grade3-story-natural-language",
    naturalTakeAwayLanguage: false
  });
  assert.notDeepStrictEqual(signature(natural), signature(neutral));
  assert(natural.normalizedContentObject.content.items.some((item) => /\bgive(?:s)? away\b/i.test(item.prompt)));
  assert(neutral.normalizedContentObject.content.items.some((item) => /\buse(?:s)?\b/i.test(item.prompt)));
}

async function testCountsExamplesAndPagination() {
  for (const id of Object.values(IDS)) {
    const twenty = buildCatalogWorksheetRuntime(id, {
      worksheetSeed: `grade3-story-twenty-${id}`,
      questionCount: 20
    });
    assertPublicContract(twenty, id, 20);
    assert.strictEqual(pageCount(await render(twenty)), 11);

    const customPages = buildCatalogWorksheetRuntime(id, {
      worksheetSeed: `grade3-story-pages-${id}`,
      questionCount: 12,
      questionsPerPage: 2
    });
    assert.strictEqual(customPages.layout.template.maxProblemsPerPage, 2);
    assert.strictEqual(pageCount(await render(customPages)), 8);

    for (const alias of ["includeExample", "completedExample", "example"]) {
      const example = buildCatalogWorksheetRuntime(id, {
        worksheetSeed: `grade3-story-example-${id}-${alias}`,
        questionCount: 4,
        [alias]: true
      });
      assert.strictEqual(example.normalizedContentObject.content.items.length, 5);
      assert.strictEqual(example.normalizedContentObject.content.items.filter((item) => item.isExample).length, 1);
      assert.strictEqual(example.normalizedContentObject.content.items[0].isExample, true);
    }
  }
}

function testCatalogIsolationAndRegistration() {
  const master = getMasterWorksheetCatalog();
  assert.strictEqual(master.length, 331);
  Object.values(IDS).forEach((id) => assert.strictEqual(master.find((item) => item.id === id)?.status, "generated"));
  const counts = Object.fromEntries(["ready", "generated", "partial", "planned"].map((status) => [
    status,
    master.filter((item) => item.status === status).length
  ]));
  assert.deepStrictEqual(counts, { ready: 104, generated: 213, partial: 5, planned: 9 });

  const grade1 = buildCatalogWorksheetRuntime("g1_addition_word_problems", { worksheetSeed: "grade3-story-grade1-isolation" });
  assert.strictEqual(Boolean(grade1.layout.display.compactWordProblemAnswerKey), false);
  assert.strictEqual(grade1.normalizedContentObject.content.items.length, 6);
  const grade2 = buildCatalogWorksheetRuntime("g2_addition_word_problems_within_100", { worksheetSeed: "grade3-story-grade2-isolation" });
  assert.strictEqual(grade2.layout.header.title, "Addition Story Problems Within 100");
  assert.strictEqual(grade2.layout.display.compactWordProblemAnswerKey, true);
  assert.strictEqual(grade2.normalizedContentObject.content.items.length, 12);

  const registrationText = fs.readdirSync("config/worksheetCustomization/families")
    .filter((name) => name.endsWith(".js") || name.endsWith(".json"))
    .map((name) => fs.readFileSync(`config/worksheetCustomization/families/${name}`, "utf8"))
    .join("\n");
  Object.values(IDS).forEach((id) => assert(!registrationText.includes(id)));
}

async function run() {
  testCatalogIsolationAndRegistration();
  await testDefaultsAndDeterminism();
  testRangesSelectionsAndAliases();
  testContextControlsGrammarAndTakeAway();
  await testCountsExamplesAndPagination();
  console.log("Grade 3 Story Problems Batch 4 checks passed; 30 seeds per resource; defaults 12/12/12; PDFs 6/6/6; same-seed failures: 0.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
