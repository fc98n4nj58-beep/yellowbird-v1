"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { getMasterWorksheetCatalog } = require("../services/worksheetCatalogService");
const { getGenerator } = require("../engine/problemGenerators");
const { renderWorksheetPDF, buildAnswerKeyItems } = require("../renderers/pdfRenderer");

const ROOT = path.join(__dirname, "..");
const IDS = Object.freeze({
  addition: "g2_addition_word_problems_within_100",
  multiplication: "grade2_multiplication_facts_word_problems",
  graph: "grade2_data_display_graphing_graph_word_problems"
});
const SPECS = Object.freeze({
  [IDS.addition]: {
    status: "ready",
    title: "Addition Story Problems Within 100",
    instruction: "Read each question. Show your thinking by writing and/or drawing your answer.",
    footer: "Grade 2 • Math • Addition and Subtraction"
  },
  [IDS.multiplication]: {
    status: "generated",
    title: "Equal Groups Word Problems",
    instruction: "Solve each equal-groups word problem. Show your thinking in the box.",
    footer: "Grade 2 • Math • Multiplication"
  }
});

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
  return runtime.contentObject.content.items.map((item) => ({
    prompt: item.prompt,
    answer: item.answer,
    a: item.a,
    b: item.b,
    op: item.op,
    product: item.product,
    total: item.total,
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
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: { filename: `${runtime.item.id}.pdf`, includeAnswerKey: true }
    });
  });
}

function wordContext(prompt, id) {
  const patterns = id === IDS.addition
    ? ["sticker", "shell", "crayon", "block", "bead", "card", "pencil", "button"]
    : ["bag", "plate", "box", "basket", "team", "shelf", "shelves"];
  return patterns.find((pattern) => prompt.toLowerCase().includes(pattern)) || "";
}

function sentenceFrame(prompt, id) {
  if (id === IDS.addition) {
    if (prompt.startsWith("How many")) return "question_first";
    if (prompt.startsWith("There is") || prompt.startsWith("There are")) return "after_joining";
    if (prompt.includes("starts a collection")) return "collection_grows";
    if (prompt.includes(" counts ") && prompt.includes(" and then ")) return "counting_both_sets";
    if (prompt.includes("two sets of")) return "brought_together";
    if (prompt.includes("already had")) return "more_first";
    if (prompt.includes("one group")) return "two_groups";
    return "start_then_more";
  }

  if (prompt.startsWith("How many")) return "question_first";
  if (prompt.startsWith("A class puts")) return "preparing_groups";
  if (prompt.startsWith("A class counts")) return "count_all_groups";
  if (prompt.startsWith("Each of") || prompt.startsWith("The ")) return "each_of_groups";
  if (prompt.includes("same number of")) return "same_number";
  if (prompt.includes("in every")) return "total_from_equal_groups";
  if (/^\d+ /.test(prompt)) return "each_group";
  return "groups_first";
}

function personName(prompt) {
  return ["Maya", "Leo", "Ava", "Noah", "Ivy", "Sam", "Emma", "Liam"]
    .find((name) => prompt.includes(name)) || "";
}

function increment(counts, key) {
  counts.set(key, (counts.get(key) || 0) + 1);
}

function assertCatalogAndDisposition() {
  const master = getMasterWorksheetCatalog();
  const generated = JSON.parse(
    fs.readFileSync(path.join(ROOT, "data/worksheetCatalog.generated.json"), "utf8")
  ).items;
  const expectedStatuses = {
    [IDS.addition]: "ready",
    [IDS.multiplication]: "generated",
    [IDS.graph]: "generated"
  };

  Object.entries(expectedStatuses).forEach(([id, status]) => {
    assert.strictEqual(master.find((item) => item.id === id)?.status, status);
    if (id !== IDS.addition) {
      assert.strictEqual(generated.find((item) => item.id === id)?.status, status);
    }
  });

  const counts = Object.fromEntries(
    ["ready", "generated", "partial", "planned"].map((status) => [
      status,
      master.filter((item) => item.status === status).length
    ])
  );
  assert.deepStrictEqual(counts, { ready: 104, generated: 213, partial: 5, planned: 9 });
  assert.strictEqual(master.length, 331);

  const reconciliation = fs.readFileSync(
    path.join(ROOT, "docs/grade-2-architecture-reconciliation-preflight.md"),
    "utf8"
  );
  assert(reconciliation.includes("- **A (35):**"));
  assert(reconciliation.includes("- **D (0):**"));
  assert(reconciliation.includes("- **E (0):** none."));
  assert(reconciliation.includes("- **G (17):**"));
  const aLine = reconciliation.split("\n").find((line) => line.startsWith("- **A (35):**"));
  const gLine = reconciliation.split("\n").find((line) => line.startsWith("- **G (17):**"));
  assert(aLine.includes(IDS.addition));
  assert(aLine.includes(IDS.multiplication));
  assert(gLine.includes(IDS.graph));

  assert.strictEqual(getGenerator("graph_word_problems"), null);
  const graph = buildCatalogWorksheetRuntime(IDS.graph, { worksheetSeed: "batch3-graph-disposition" });
  assert.strictEqual(graph.contentObject.content.items.length, 0);
  assert.strictEqual(graph.item.status, "generated");
}

function assertRuntimeContract(runtime, id, expectedCount = 12) {
  const spec = SPECS[id];
  const items = runtime.contentObject.content.items;
  assert.strictEqual(runtime.item.id, id);
  assert.strictEqual(runtime.item.status, spec.status);
  assert.strictEqual(runtime.layout.header.title, spec.title);
  assert.strictEqual(runtime.layout.header.subtitle, "");
  assert.strictEqual(runtime.layout.instruction, spec.instruction);
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, spec.footer);
  assert.strictEqual(items.length, expectedCount);
  assert.strictEqual(runtime.layout.template.columns, 1);
  assert.strictEqual(runtime.layout.display.workSpaceBox, true);
  assert.strictEqual(runtime.layout.display.compactWordProblemAnswerKey, true);
  assert.strictEqual(runtime.layout.display.hideSubtitle, true);
  assert(!runtime.layout.header.title.includes("_"));
  assert(!runtime.layout.instruction.includes("_"));
  assert(!runtime.contentObject.meta.curriculum.footerText.includes("_"));
  assert(items.every((item) => item.prompt && Number.isFinite(Number(item.answer))));
  assert.deepStrictEqual(
    buildAnswerKeyItems(items).map((item) => item.answer),
    items.map((item) => item.answer)
  );
}

function assertTruthAndVariety(runtime, id) {
  const items = runtime.contentObject.content.items;
  const frames = new Set();
  const recentFrames = [];
  const nameCounts = new Map();
  const objectCounts = new Map();
  const pairs = new Set();
  const pronouns = new Map([
    ["Maya", "she"], ["Leo", "he"], ["Ava", "she"], ["Noah", "he"],
    ["Ivy", "she"], ["Sam", "he"], ["Emma", "she"], ["Liam", "he"]
  ]);

  items.forEach((item) => {
    const context = wordContext(item.prompt, id);
    assert(context, `Missing approved context in: ${item.prompt}`);
    increment(objectCounts, context);
    const frame = sentenceFrame(item.prompt, id);
    assert(!recentFrames.includes(frame), `Near-adjacent sentence-template repeat: ${frame}`);
    recentFrames.push(frame);
    if (recentFrames.length > 2) recentFrames.shift();
    frames.add(frame);

    if (id === IDS.addition) {
      const name = personName(item.prompt);
      assert(name, `Missing approved name in: ${item.prompt}`);
      increment(nameCounts, name);
      const pair = `${name}:${context}`;
      assert(!pairs.has(pair), `Repeated name/object pair: ${pair}`);
      pairs.add(pair);
      const observedPronoun = /\b(she|he)\b/i.exec(item.prompt)?.[1]?.toLowerCase();
      if (observedPronoun) {
        assert.strictEqual(observedPronoun, pronouns.get(name), `Pronoun mismatch for ${name}.`);
      }
      assert.strictEqual(item.op, "+");
      assert.strictEqual(item.a + item.b, item.answer);
      assert.strictEqual(item.total, item.answer);
      assert(item.a >= 1 && item.b >= 1 && item.answer <= 100);
    } else {
      assert.strictEqual(item.op, "*");
      assert.strictEqual(item.a * item.b, item.answer);
      assert.strictEqual(item.product, item.answer);
      assert(item.a >= 2 && item.a <= 6);
      assert(item.b >= 2 && item.b <= 6);
      assert(item.answer <= 36);
      assert(!/\barray|rows?|columns?\b/i.test(item.prompt));
    }
  });

  assert(frames.size >= 6, `Expected at least six sentence frames for ${id}.`);
  if (items.length === 12) {
    objectCounts.forEach((count, object) => assert(count <= 2, `${object} appears ${count} times.`));
    if (id === IDS.addition) {
      nameCounts.forEach((count, name) => assert(count <= 2, `${name} appears ${count} times.`));
      assert.strictEqual(pairs.size, 12);
    }
  }
}

async function assertCountsAndPagination() {
  for (const id of Object.keys(SPECS)) {
    for (const count of [1, 12, 20]) {
      const runtime = buildCatalogWorksheetRuntime(id, {
        worksheetSeed: `batch3-${id}-${count}`,
        questionCount: count
      });
      assertRuntimeContract(runtime, id, count);
      assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 3);
      const pdf = await renderRuntime(runtime);
      assert.strictEqual(pageCount(pdf), Math.ceil(count / 3) + Math.ceil(count / 6));
    }

    const multiPage = buildCatalogWorksheetRuntime(id, {
      worksheetSeed: `batch3-${id}-custom-pages`,
      questionCount: 12,
      questionsPerPage: 2
    });
    assert.strictEqual(multiPage.layout.template.maxProblemsPerPage, 2);
    assert.strictEqual(pageCount(await renderRuntime(multiPage)), 8);
  }
}

function assertCompletedExampleAliases() {
  for (const id of Object.keys(SPECS)) {
    for (const alias of ["includeExample", "completedExample", "example"]) {
      const runtime = buildCatalogWorksheetRuntime(id, {
        worksheetSeed: `batch3-${id}-${alias}`,
        questionCount: 4,
        [alias]: true
      });
      assertRuntimeContract(runtime, id, 5);
      assert.strictEqual(runtime.contentObject.content.items.filter((item) => item.isExample).length, 1);
      assert.strictEqual(runtime.contentObject.content.items[0].isExample, true);
    }
  }
}

function assertVariableContracts() {
  const rangedAddition = buildCatalogWorksheetRuntime(IDS.addition, {
    worksheetSeed: "batch3-addition-range",
    questionCount: 20,
    minA: 10,
    maxA: 15,
    minB: 20,
    maxB: 25,
    maxTotal: 40
  });
  rangedAddition.contentObject.content.items.forEach((item) => {
    assert(item.a >= 10 && item.a <= 15);
    assert(item.b >= 20 && item.b <= 25);
    assert(item.answer <= 40);
  });

  for (const selection of [{ onlyNumbers: "7,23" }, { selectedNumbers: [7, 23] }]) {
    const runtime = buildCatalogWorksheetRuntime(IDS.addition, {
      worksheetSeed: `batch3-addition-selected-${Object.keys(selection)[0]}`,
      questionCount: 8,
      maxTotal: 50,
      ...selection
    });
    runtime.contentObject.content.items.forEach((item) => {
      assert([7, 23].includes(item.a));
      assert([7, 23].includes(item.b));
      assert.strictEqual(item.answer, item.a + item.b);
    });
  }

  const rangedMultiplication = buildCatalogWorksheetRuntime(IDS.multiplication, {
    worksheetSeed: "batch3-multiplication-range",
    questionCount: 8,
    minFactorA: 3,
    maxFactorA: 4,
    minFactorB: 2,
    maxFactorB: 5,
    maxProduct: 20
  });
  rangedMultiplication.contentObject.content.items.forEach((item) => {
    assert(item.a >= 3 && item.a <= 4);
    assert(item.b >= 2 && item.b <= 5);
    assert(item.answer <= 20);
  });

  const selectedMultiplication = buildCatalogWorksheetRuntime(IDS.multiplication, {
    worksheetSeed: "batch3-multiplication-selected",
    questionCount: 4,
    selectedFactorA: [2],
    selectedFactorB: [5]
  });
  selectedMultiplication.contentObject.content.items.forEach((item) => {
    assert.strictEqual(item.a, 2);
    assert.strictEqual(item.b, 5);
    assert.strictEqual(item.answer, 10);
  });

  const selectedContext = buildCatalogWorksheetRuntime(IDS.multiplication, {
    worksheetSeed: "batch3-multiplication-context",
    questionCount: 4,
    onlyObjects: "boxes"
  });
  selectedContext.contentObject.content.items.forEach((item) => {
    assert(/\bbox(?:es)?\b/i.test(item.prompt));
  });
}

function assertRouteAndGradeIsolation() {
  const previewRoute = fs.readFileSync(path.join(ROOT, "routes/worksheetPreviewRoutes.js"), "utf8");
  const pdfRoute = fs.readFileSync(path.join(ROOT, "routes/worksheetPdfRoutes.js"), "utf8");
  assert(previewRoute.includes("buildCatalogWorksheetRuntime"));
  assert(pdfRoute.includes("buildCatalogWorksheetRuntime"));

  const grade1 = buildCatalogWorksheetRuntime("g1_addition_word_problems", {
    worksheetSeed: "batch3-grade1-isolation"
  });
  const grade3 = buildCatalogWorksheetRuntime("grade3_multiplication_facts_word_problems", {
    worksheetSeed: "batch3-grade3-isolation"
  });
  assert.notStrictEqual(grade1.layout.header.title, SPECS[IDS.addition].title);
  assert.notStrictEqual(grade3.layout.header.title, SPECS[IDS.multiplication].title);
  assert.strictEqual(Boolean(grade1.layout.display.compactWordProblemAnswerKey), false);
  assert.strictEqual(Boolean(grade3.layout.display.compactWordProblemAnswerKey), false);
}

async function run() {
  assertCatalogAndDisposition();
  assertRouteAndGradeIsolation();
  assertCompletedExampleAliases();
  assertVariableContracts();

  for (const id of Object.keys(SPECS)) {
    const observed = new Set();
    for (let seedIndex = 0; seedIndex < 30; seedIndex += 1) {
      const options = { worksheetSeed: `grade2-category-e-batch3-${id}-${seedIndex}` };
      const runtime = buildCatalogWorksheetRuntime(id, options);
      const repeat = buildCatalogWorksheetRuntime(id, options);
      assertRuntimeContract(runtime, id);
      assertTruthAndVariety(runtime, id);
      assert.deepStrictEqual(signature(runtime), signature(repeat));
      observed.add(JSON.stringify(signature(runtime)));
    }
    assert(observed.size > 1, `Expected different-seed variation for ${id}.`);
  }

  await assertCountsAndPagination();
  console.log("Grade 2 Category E Batch 3 checks passed; 30 seeds per resource; same-seed failures: 0.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
