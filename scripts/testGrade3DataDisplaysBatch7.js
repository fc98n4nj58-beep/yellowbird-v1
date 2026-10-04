"use strict";

const assert = require("assert");
const { Writable } = require("stream");

const { getCustomizationFamilyForResource } = require("../config/worksheetCustomization");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const {
  SAFE_VALUES,
  validateGrade3DataDisplayWorksheet
} = require("../engine/problemGenerators/grade3DataDisplays");
const { buildAnswerKeyItems, renderWorksheetPDF, __test: rendererTest } = require("../renderers/pdfRenderer");

const IDS = Object.freeze({
  complete: "g3_complete_a_graph",
  questions: "g3_graph_questions",
  interpret: "g3_interpret_data",
  match: "g3_match_data_to_graph",
  read: "g3_read_a_graph"
});
const CONTRACTS = Object.freeze({
  [IDS.complete]: ["Complete the Graph", "Use the data table to complete the pictograph.", 2],
  [IDS.questions]: ["Answer Questions About a Graph", "Use the graph to answer each question.", 6],
  [IDS.interpret]: ["Interpret the Data", "Read each statement. Write Yes if the graph supports it or No if it does not.", 4],
  [IDS.match]: ["Choose the Matching Pictograph", "Use the table. Circle A or B to show which pictograph matches the data.", 2],
  [IDS.read]: ["Read the Graph", "Use the graph to answer each question.", 6]
});
const SHARED_PICTOGRAPH_SYMBOL_CAPACITY = 8;

class MemoryResponse extends Writable {
  constructor() { super(); this.chunks = []; }
  setHeader() {}
  _write(chunk, encoding, callback) { this.chunks.push(Buffer.from(chunk)); callback(); }
  buffer() { return Buffer.concat(this.chunks); }
}

function render(runtime) {
  return new Promise((resolve, reject) => {
    const response = new MemoryResponse();
    response.once("finish", () => resolve(response.buffer()));
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: { filename: "grade3-data-batch7-test.pdf", includeAnswerKey: true }
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
    prompt: item.prompt,
    answer: item.answer,
    responseType: item.responseType,
    graphQuestionType: item.graphQuestionType,
    duplicateSignature: item.duplicateSignature,
    graphData: item.graphData,
    graphTaskData: item.graphTaskData,
    answerState: item.answerState,
    isExample: item.isExample
  }));
}

function assertGraph(graph) {
  assert.strictEqual(graph.graphType, "pictograph");
  assert.strictEqual(graph.scale, 1);
  assert.strictEqual(graph.keyValue, 1);
  assert.strictEqual(graph.symbolValue, 1);
  assert.strictEqual(graph.partialSymbols, false);
  assert.strictEqual(graph.categories.length, 4);
  assert.strictEqual(new Set(graph.categories.map((category) => category.id)).size, 4);
  assert.strictEqual(new Set(graph.categories.map((category) => category.label.toLowerCase())).size, 4);
  assert.strictEqual(new Set(graph.categories.map((category) => category.value)).size, 4);
  assert.deepStrictEqual(graph.values, graph.categories.map((category) => category.value));
  assert(graph.categories.every((category) => Number.isInteger(category.value) && category.value >= 2 && category.value <= 8));
  assert(graph.categories.every((category) => category.symbolCount === category.value));
  assert(graph.categories.every((category) => category.value <= SHARED_PICTOGRAPH_SYMBOL_CAPACITY));
  assert(graph.categories.every((category) => rendererTest.sharedDataSymbolCount(category.value) === category.value));
  assert.strictEqual(graph.totalValue, graph.values.reduce((sum, value) => sum + value, 0));
}

function assertPublicContract(runtime) {
  const [title, instruction, count] = CONTRACTS[runtime.item.id];
  assert.strictEqual(runtime.item.status, "ready");
  assert.strictEqual(runtime.layout.header.title, title);
  assert.strictEqual(runtime.contentObject.meta.title, title);
  assert.strictEqual(runtime.layout.header.subtitle, "");
  assert.strictEqual(runtime.layout.instruction, instruction);
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, "Grade 3 • Math • Data & Graphing");
  assert.strictEqual(items(runtime).length, count);
  assert.strictEqual(getCustomizationFamilyForResource(runtime.item.id), null);
  const publicText = JSON.stringify({ title, instruction, footer: runtime.contentObject.meta.curriculum.footerText });
  assert(!publicText.includes(runtime.item.id));
  assert(!publicText.includes("data_display_graphing"));
  items(runtime).forEach((item) => assertGraph(item.graphData));
}

function assertKeyParity(runtime) {
  const student = items(runtime);
  const key = buildAnswerKeyItems(student);
  assert.strictEqual(key.length, student.length);
  for (const field of ["answer", "responseType", "graphQuestionType", "graphData", "graphTaskData", "answerState", "duplicateSignature"]) {
    assert.deepStrictEqual(key.map((item) => item[field]), student.map((item) => item[field]), `${runtime.item.id} ${field} parity`);
  }
}

function categoryById(graph, id) {
  return graph.categories.find((category) => category.id === id);
}

function assertQuestionTruth(item) {
  const graph = item.graphData;
  const categories = item.answerState.categoryIds.map((id) => categoryById(graph, id));
  assert(categories.every(Boolean));
  let expected;
  switch (item.graphQuestionType) {
    case "category_value": expected = categories[0].value; break;
    case "most": expected = graph.categories.find((category) => category.value === graph.maximumValue).label; break;
    case "least": expected = graph.categories.find((category) => category.value === graph.minimumValue).label; break;
    case "difference": expected = categories[0].value - categories[1].value; break;
    case "combined_total": expected = categories[0].value + categories[1].value; break;
    case "graph_total": expected = graph.totalValue; break;
    case "supported_statement": expected = item.answerState.isSupported ? "Yes" : "No"; break;
    default: assert.fail(`Unsupported question type ${item.graphQuestionType}`);
  }
  assert.strictEqual(item.answer, expected);
  assert.strictEqual(item.answerState.value, expected);
}

function assertComplete(runtime) {
  assert.strictEqual(runtime.layout.display.sharedDataTaskMode, "complete_graph");
  assert.strictEqual(items(runtime).length, 2);
  assert.strictEqual(new Set(items(runtime).map((item) => item.graphData.topicId)).size, 2);
  items(runtime).forEach((item) => {
    assert.strictEqual(item.taskAction, "complete");
    assert.deepStrictEqual(
      item.graphTaskData.dataTable.map(({ label, value }) => ({ label, value })),
      item.graphData.categories.map(({ label, value }) => ({ label, value }))
    );
    const incomplete = item.graphTaskData.graphRows.filter((row) => row.isIncomplete);
    assert.strictEqual(incomplete.length, 2);
    assert.deepStrictEqual(incomplete.map((row) => row.missingCount).sort(), [1, 2]);
    item.graphTaskData.graphRows.forEach((row) => {
      assert.strictEqual(row.visibleSymbolCount + row.missingCount, row.requiredSymbolCount);
    });
    for (const answerKey of [false, true]) {
      rendererTest.buildConstructionGraphCategories(item.graphTaskData, answerKey).forEach((category) => {
        assert.strictEqual(rendererTest.sharedDataSymbolCount(category.value), category.value);
      });
    }
  });
}

function assertMatch(runtime) {
  assert.strictEqual(runtime.layout.display.sharedDataTaskMode, "match_graph");
  assert.strictEqual(items(runtime).length, 2);
  assert.deepStrictEqual(new Set(items(runtime).map((item) => item.answer)), new Set(["A", "B"]));
  items(runtime).forEach((item) => {
    assert.strictEqual(item.taskAction, "match");
    const task = item.graphTaskData;
    const matches = task.choices.filter((choice) => choice.categories.every((row, index) =>
      row.label === task.dataTable[index].label && row.value === task.dataTable[index].value
    ));
    assert.strictEqual(matches.length, 1);
    assert.strictEqual(matches[0].id, task.correctChoiceId);
    const distractor = task.choices.find((choice) => choice.id !== task.correctChoiceId);
    const differences = distractor.categories.filter((row, index) => row.value !== task.dataTable[index].value);
    assert.strictEqual(differences.length, 1);
    const index = distractor.categories.indexOf(differences[0]);
    assert.strictEqual(Math.abs(differences[0].value - task.dataTable[index].value), 1);
    task.choices.flatMap((choice) => choice.categories).forEach((category) => {
      assert(category.value >= 2 && category.value <= SHARED_PICTOGRAPH_SYMBOL_CAPACITY);
      assert.strictEqual(rendererTest.sharedDataSymbolCount(category.value), category.value);
    });
  });
}

function assertResourceTruth(runtime) {
  const resourceItems = items(runtime);
  assert.strictEqual(new Set(resourceItems.map((item) => item.duplicateSignature)).size, resourceItems.length);
  assertKeyParity(runtime);
  if (runtime.item.id === IDS.complete) return assertComplete(runtime);
  if (runtime.item.id === IDS.match) return assertMatch(runtime);
  resourceItems.forEach(assertQuestionTruth);
  if (runtime.item.id === IDS.read) {
    assert(resourceItems.every((item) => item.taskAction === "read" && item.graphQuestionType === "category_value"));
    assert(resourceItems.every((item) => ["number", "category"].includes(item.responseType)));
    assert.strictEqual(new Set(resourceItems.map((item) => item.prompt)).size, resourceItems.length);
    assert.strictEqual(new Set(resourceItems.slice(0, 4).map((item) => item.answerState.categoryIds[0])).size, 4);
    assert.strictEqual(new Set(resourceItems.map((item) => item.answerState.categoryIds[0])).size, 4);
    assert.strictEqual(new Set(resourceItems.map((item) => `${item.answerState.categoryIds[0]}:${item.answerState.promptVariant}`)).size, resourceItems.length);
    assert(resourceItems.every((item) => !["graph_total", "combined_total", "difference", "most", "least", "supported_statement"].includes(item.graphQuestionType)));
  }
  if (runtime.item.id === IDS.questions) {
    assert.deepStrictEqual(new Set(resourceItems.map((item) => item.graphQuestionType)), new Set([
      "category_value", "most", "least", "difference", "combined_total", "graph_total"
    ]));
  }
  if (runtime.item.id === IDS.interpret) {
    assert(resourceItems.every((item) => item.taskAction === "interpret" && item.graphQuestionType === "supported_statement"));
    assert.deepStrictEqual(resourceItems.map((item) => item.answer).sort(), ["No", "No", "Yes", "Yes"]);
    assert(resourceItems.every((item) => !/has the greatest value|has \d+ more than/i.test(item.prompt)));
  }
}

function expectRuntimeThrow(id, options, pattern) {
  assert.throws(() => buildCatalogWorksheetRuntime(id, { worksheetSeed: "grade3-b7-invalid", ...options }), pattern);
}

function adversarialInputChecks() {
  for (const categories of [[], ["Only"], ["A", "B", "C"], ["A", "B", "C", "D", "E"]]) {
    expectRuntimeThrow(IDS.read, { selectedCategories: categories }, /exactly 4 category labels/);
  }
  expectRuntimeThrow(IDS.read, { selectedCategories: ["A", "A", "C", "D"] }, /must be unique/);
  expectRuntimeThrow(IDS.read, { selectedCategories: ["A", "B", "", "D"] }, /non-blank/);
  for (const values of [[2, 3.5, 4, 5], [-1, 3, 4, 5], [2, 3, 4, 10], [2, 2, 4, 5]]) {
    expectRuntimeThrow(IDS.read, { selectedValues: values }, /values must be|must be unique/);
  }
  expectRuntimeThrow(IDS.read, { selectedValues: [2, 3, 4, 9] }, /2 through 8/);
  expectRuntimeThrow(IDS.read, { values: [5, 6, 7, 9] }, /2 through 8/);
  expectRuntimeThrow(IDS.read, { categoryValues: "2,4,6,9" }, /2 through 8/);
  expectRuntimeThrow(IDS.read, { selectedValues: [2, 3, 8, 9], values: [2, 3, 4, 5] }, /exactly 4 category values|2 through 8/);
  expectRuntimeThrow(IDS.read, { graphType: "bar" }, /pictographs only/);
  expectRuntimeThrow(IDS.read, { scale: 0 }, /scale of 1 only/);
  expectRuntimeThrow(IDS.read, { scale: 2, selectedValues: [2, 3, 4, 5] }, /scale of 1 only/);
  expectRuntimeThrow(IDS.read, { categoryCount: 3 }, /exactly 4 categories/);
  expectRuntimeThrow(IDS.read, { categoryCount: 5 }, /exactly 4 categories/);
  expectRuntimeThrow(IDS.questions, { selectedQuestionTypes: ["median"] }, /Unsupported/);
  expectRuntimeThrow(IDS.questions, { selectedQuestionTypes: [] }, /Unsupported/);
  expectRuntimeThrow(IDS.read, { selectedValues: [2, 3, 4, 5], values: [2, 3, 4, 10] }, /exactly 4 category values/);
  expectRuntimeThrow(IDS.read, { graphWidth: 400 }, /raw renderer geometry/);
  expectRuntimeThrow(IDS.complete, { includeExample: true }, /do not support completed examples/);
  expectRuntimeThrow(IDS.match, { includeExample: true }, /do not support completed examples/);

  const complete = items(buildCatalogWorksheetRuntime(IDS.complete, { worksheetSeed: "grade3-b7-corrupt-complete" }))[0];
  const badComplete = structuredClone(complete);
  badComplete.graphTaskData.graphRows[0].visibleSymbolCount += 1;
  assert.throws(() => validateGrade3DataDisplayWorksheet(IDS.complete, [badComplete]), /omission truth/);

  const match = items(buildCatalogWorksheetRuntime(IDS.match, { worksheetSeed: "grade3-b7-corrupt-match" }))[0];
  const multipleCorrect = structuredClone(match);
  multipleCorrect.graphTaskData.choices.forEach((choice) => {
    choice.categories = structuredClone(multipleCorrect.graphTaskData.dataTable);
  });
  assert.throws(() => validateGrade3DataDisplayWorksheet(IDS.match, [multipleCorrect]), /exactly one correct/);
  const noCorrect = structuredClone(match);
  noCorrect.graphTaskData.choices.forEach((choice) => {
    choice.categories[0].value += 1;
  });
  assert.throws(() => validateGrade3DataDisplayWorksheet(IDS.match, [noCorrect]), /exactly one correct/);
  assert.throws(() => validateGrade3DataDisplayWorksheet(IDS.read, []), /generated no items/);
  const read = items(buildCatalogWorksheetRuntime(IDS.read, { worksheetSeed: "grade3-b7-corrupt-question" }))[0];
  const unsupported = structuredClone(read);
  unsupported.graphQuestionType = "median";
  assert.throws(() => validateGrade3DataDisplayWorksheet(IDS.read, [unsupported]), /Unsupported Grade 3 graph question/);
  assert.throws(() => validateGrade3DataDisplayWorksheet(IDS.read, [read, read]), /duplicate item/);

  const invalidNine = structuredClone(read);
  invalidNine.graphData.categories[0].value = 9;
  invalidNine.graphData.categories[0].symbolCount = 9;
  invalidNine.graphData.values[0] = 9;
  assert.throws(() => validateGrade3DataDisplayWorksheet(IDS.read, [invalidNine]), /2 through 8/);
}

async function run() {
  assert.deepStrictEqual(SAFE_VALUES, [2, 3, 4, 5, 6, 7, 8]);
  assert.strictEqual(Math.max(...SAFE_VALUES), SHARED_PICTOGRAPH_SYMBOL_CAPACITY);
  const defaults = Object.values(IDS).map((id) => buildCatalogWorksheetRuntime(id, { worksheetSeed: `grade3-b7-default-${id}` }));
  defaults.forEach((runtime) => {
    assertPublicContract(runtime);
    assertResourceTruth(runtime);
  });

  let sameSeedFailures = 0;
  const variations = Object.fromEntries(Object.values(IDS).map((id) => [id, new Set()]));
  for (let seed = 1; seed <= 30; seed += 1) {
    for (const id of Object.values(IDS)) {
      const first = buildCatalogWorksheetRuntime(id, { worksheetSeed: `grade3-b7-${seed}` });
      const second = buildCatalogWorksheetRuntime(id, { worksheetSeed: `grade3-b7-${seed}` });
      if (JSON.stringify(signature(first)) !== JSON.stringify(signature(second))) sameSeedFailures += 1;
      assertResourceTruth(first);
      variations[id].add(JSON.stringify(signature(first)));
    }
  }
  assert.strictEqual(sameSeedFailures, 0);
  Object.values(variations).forEach((values) => assert(values.size > 1));

  const validMaximum = buildCatalogWorksheetRuntime(IDS.read, {
    worksheetSeed: "grade3-b7-valid-maximum",
    selectedValues: [5, 6, 7, 8]
  });
  assert.deepStrictEqual(items(validMaximum)[0].graphData.values, [5, 6, 7, 8]);
  assertResourceTruth(validMaximum);

  const selected = buildCatalogWorksheetRuntime(IDS.questions, {
    worksheetSeed: "grade3-b7-selected",
    questionCount: 3,
    questionsPerPage: 2,
    selectedCategories: ["North", "South", "East", "West"],
    selectedValues: [2, 4, 6, 8],
    graphType: "pictograph",
    scale: 1
  });
  assert.strictEqual(items(selected).length, 3);
  assert.deepStrictEqual(items(selected)[0].graphData.categories.map((category) => category.label), ["North", "South", "East", "West"]);
  assert.deepStrictEqual(items(selected)[0].graphData.values, [2, 4, 6, 8]);
  assert(pageCount(await render(selected)) > 2);

  for (const id of [IDS.read, IDS.questions, IDS.interpret]) {
    const example = buildCatalogWorksheetRuntime(id, {
      worksheetSeed: `grade3-b7-example-${id}`,
      questionCount: 2,
      includeExample: true
    });
    assert.strictEqual(items(example).length, 3);
    assert.strictEqual(items(example)[0].isExample, true);
  }

  const pageCounts = {};
  for (const runtime of defaults) {
    pageCounts[runtime.item.id] = pageCount(await render(runtime));
    assert.strictEqual(pageCounts[runtime.item.id], 2);
  }

  adversarialInputChecks();

  const grade1 = buildCatalogWorksheetRuntime("grade1_data_display_graphing_read_graph", { worksheetSeed: "grade3-b7-grade1" });
  const grade2 = buildCatalogWorksheetRuntime("grade2_data_display_graphing_read_graph", { worksheetSeed: "grade3-b7-grade2" });
  assert.strictEqual(grade1.layout.header.title, "Read the Graph");
  assert.strictEqual(grade2.layout.header.title, "Read the Pictograph");
  assert.strictEqual(items(grade1).length, 6);
  assert.strictEqual(items(grade2).length, 6);
  assert(!String(items(grade1)[0].graphData.datasetId || "").startsWith("grade3_data"));
  assert(!String(items(grade2)[0].graphData.datasetId || "").startsWith("grade3_data"));

  const batch6Compare = buildCatalogWorksheetRuntime("grade3_fraction_equivalence_compare_fractions", { worksheetSeed: "grade3-b7-batch6" });
  const batch6Line = buildCatalogWorksheetRuntime("grade3_fraction_equivalence_fraction_number_line", { worksheetSeed: "grade3-b7-batch6-line" });
  assert.strictEqual(batch6Compare.layout.header.title, "Compare Fractions");
  assert.strictEqual(batch6Line.layout.header.title, "Fractions on a Number Line");
  assert.strictEqual(items(batch6Compare).length, 20);
  assert.strictEqual(items(batch6Line).length, 6);

  const fullGeometry = rendererTest.buildSharedDataPictographGeometry({
    x: 0, y: 0, width: 504, height: 218, categoryCount: 4, headerHeight: 42
  });
  const compactGeometry = rendererTest.buildSharedDataPictographGeometry({
    x: 0, y: 0, width: 243, height: 138, categoryCount: 4, headerHeight: 0, minimumCategoryHeight: 34.5
  });
  assert(fullGeometry.height >= 218);
  assert(compactGeometry.height >= 138);

  console.log(JSON.stringify({
    resources: Object.values(IDS),
    seedsPerResource: 30,
    sameSeedFailures,
    defaultCounts: Object.fromEntries(defaults.map((runtime) => [runtime.item.id, items(runtime).length])),
    defaultPdfPages: pageCounts,
    graphType: "pictograph",
    scale: 1,
    adversarialInputs: "passed",
    grade1Isolation: true,
    grade2Isolation: true,
    batch6Isolation: true
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
