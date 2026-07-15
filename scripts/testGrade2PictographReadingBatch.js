const assert = require("assert");
const fs = require("fs");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { getAnyWorksheetCatalogById } = require("../services/worksheetCatalogService");
const {
  renderWorksheetPDF,
  buildAnswerKeyItems,
  __test: rendererTest
} = require("../renderers/pdfRenderer");

const RESOURCES = Object.freeze([
  {
    id: "grade2_data_display_graphing_read_graph",
    title: "Read the Pictograph",
    instruction: "Use the pictograph to answer each question.",
    task: "read"
  },
  {
    id: "grade2_data_display_graphing_interpret_data",
    title: "Interpret the Pictograph",
    instruction: "Use the pictograph to answer each question.",
    task: "interpret"
  }
]);

const OUT_OF_SCOPE_IDS = Object.freeze([
  "grade2_data_display_graphing_graph_questions"
]);
const EXPECTED_FOOTER = "Grade 2 • Math • Data & Graphing";

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

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function renderRuntime(runtime) {
  return new Promise((resolve, reject) => {
    const response = new MemoryResponse();
    response.on("finish", () => resolve(response.buffer()));
    response.on("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: {
        filename: `${runtime.item.id}.pdf`,
        disposition: "inline",
        includeAnswerKey: true
      }
    });
  });
}

function runtimeSignature(runtime) {
  return JSON.stringify({
    graph: runtime.layout.display.sharedDataGraph,
    questions: runtime.normalizedContentObject.content.items.map((item) => ({
      prompt: item.prompt,
      answer: item.answer,
      responseType: item.responseType,
      graphQuestionType: item.graphQuestionType,
      answerState: item.answerState,
      duplicateSignature: item.duplicateSignature
    }))
  });
}

function categoryById(graph, id) {
  return graph.categories.find((category) => category.id === id);
}

function validateGraph(graph) {
  assert(graph, "Structured graph truth is required.");
  assert.strictEqual(graph.kind, "one_to_one_pictograph");
  assert.strictEqual(graph.graphType, "pictograph");
  assert.strictEqual(graph.modelType, "one_to_one_pictograph");
  assert.strictEqual(graph.symbol, "circle");
  assert.strictEqual(graph.symbolValue, 1);
  assert.strictEqual(graph.keyValue, 1);
  assert.strictEqual(graph.scale, 1);
  assert.strictEqual(graph.partialSymbols, false);
  assert.strictEqual(graph.colorRequired, false);
  assert.strictEqual(graph.readingLevel, "grade2_short");
  assert(graph.title && graph.title.trim());
  assert(graph.topicId && graph.datasetId.includes(graph.topicId));
  assert(graph.scenario && graph.dataSource && graph.sourceText);
  assert.strictEqual(graph.categories.length, 4);
  assert.strictEqual(graph.values.length, 4);
  assert.strictEqual(new Set(graph.categories.map((category) => category.id)).size, 4);
  assert.strictEqual(new Set(graph.categories.map((category) => category.label)).size, 4);
  assert.deepStrictEqual(graph.values, graph.categories.map((category) => category.value));
  assert.strictEqual(new Set(graph.values).size, 4, "Most and least must be unambiguous.");
  graph.categories.forEach((category) => {
    assert(Number.isInteger(category.value));
    assert(category.value >= 2 && category.value <= 8);
    assert.strictEqual(rendererTest.sharedDataSymbolCount(category.value), category.value);
  });
  assert.strictEqual(graph.minimumValue, Math.min(...graph.values));
  assert.strictEqual(graph.maximumValue, Math.max(...graph.values));
  assert.strictEqual(graph.totalValue, graph.values.reduce((sum, value) => sum + value, 0));
  assert.strictEqual(graph.questions.length, 6);
  assert.strictEqual(graph.answers.length, 6);
  assert.strictEqual(graph.answerState.length, 6);
}

function validateRead(items, graph) {
  assert.strictEqual(items.length, 6);
  const categoryCounts = new Map(graph.categories.map((category) => [category.id, 0]));

  items.forEach((item) => {
    assert.strictEqual(item.taskMode, "read_pictograph");
    assert.strictEqual(item.graphQuestionType, "category_value");
    assert.strictEqual(item.responseMode, "graph_short_answer");
    assert.strictEqual(item.responseType, "number");
    assert.strictEqual(item.answerState.categoryIds.length, 1);
    const category = categoryById(graph, item.answerState.categoryIds[0]);
    assert(category);
    assert.strictEqual(item.answer, category.value);
    assert.strictEqual(item.answerState.value, category.value);
    categoryCounts.set(category.id, categoryCounts.get(category.id) + 1);
    assert(!/(most|least|more|fewer|combined|total)/i.test(item.prompt));
  });

  assert.deepStrictEqual([...categoryCounts.values()].sort(), [1, 1, 2, 2]);
}

function validateInterpret(items, graph) {
  assert.strictEqual(items.length, 6);
  const expectedTypes = [
    "most",
    "least",
    "more_difference",
    "fewer_difference",
    "combined_total",
    "graph_total"
  ];
  assert.deepStrictEqual(items.map((item) => item.graphQuestionType), expectedTypes);

  items.forEach((item) => {
    const categories = item.answerState.categoryIds.map((id) => categoryById(graph, id));
    assert(categories.every(Boolean));
    let expected;
    switch (item.graphQuestionType) {
      case "most":
        expected = categories[0].label;
        assert.strictEqual(categories[0].value, graph.maximumValue);
        assert.strictEqual(item.responseType, "category");
        break;
      case "least":
        expected = categories[0].label;
        assert.strictEqual(categories[0].value, graph.minimumValue);
        assert.strictEqual(item.responseType, "category");
        break;
      case "more_difference":
        expected = categories[0].value - categories[1].value;
        assert(expected >= 0);
        assert(categories[0].value > categories[1].value);
        assert.strictEqual(item.responseType, "number");
        break;
      case "fewer_difference":
        expected = categories[1].value - categories[0].value;
        assert(expected >= 0);
        assert(categories[1].value > categories[0].value);
        assert.strictEqual(item.responseType, "number");
        break;
      case "combined_total":
        expected = categories[0].value + categories[1].value;
        assert.strictEqual(item.responseType, "number");
        break;
      case "graph_total":
        expected = graph.totalValue;
        assert.strictEqual(categories.length, 4);
        assert.strictEqual(item.responseType, "number");
        break;
      default:
        throw new Error(`Unexpected interpretation question '${item.graphQuestionType}'.`);
    }
    assert.strictEqual(item.answer, expected);
    assert.strictEqual(item.answerState.value, expected);
    assert(!/mode|modal/i.test(item.prompt));
  });
}

function validateRuntime(resource, runtime) {
  assert.strictEqual(runtime.item.id, resource.id);
  assert.strictEqual(runtime.item.status, "generated");
  assert.strictEqual(runtime.layout.header.title, resource.title);
  assert.strictEqual(runtime.layout.header.subtitle, "");
  assert.strictEqual(runtime.layout.instruction, resource.instruction);
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, EXPECTED_FOOTER);
  assert(!runtime.contentObject.meta.curriculum.footerText.includes("_"));
  assert.strictEqual(runtime.layout.template.columns, 2);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 6);
  assert.strictEqual(runtime.layout.display.sharedDataPictograph, true);
  assert.strictEqual(runtime.layout.display.sharedDataGraphHeight, 218);
  assert.strictEqual(runtime.layout.display.sharedDataResponseLines, true);
  assert.strictEqual(runtime.layout.display.sharedDataSymbolStrokeColor, "#4b5563");
  assert.strictEqual(runtime.layout.display.sharedDataSymbolStrokeWidth, 1.15);

  const items = runtime.normalizedContentObject.content.items;
  assert.strictEqual(items.length, 6);
  assert(items.every((item) => item.prompt && item.graphData && item.answer !== undefined));
  assert(items.every((item) => !item.isExample));
  assert(items.every((item) => item.diagnostics === null || !item.diagnostics.includes("overflow")));
  const graph = runtime.layout.display.sharedDataGraph;
  validateGraph(graph);
  items.forEach((item, index) => {
    assert.deepStrictEqual(item.graphData, graph);
    assert.strictEqual(item.answer, graph.answers[index]);
    assert.strictEqual(item.graphQuestionType, graph.questions[index].questionType);
  });
  assert.strictEqual(new Set(items.map((item) => item.duplicateSignature)).size, 6);

  if (resource.task === "read") validateRead(items, graph);
  else validateInterpret(items, graph);

  const answerKey = buildAnswerKeyItems(items);
  assert.strictEqual(answerKey.length, 6);
  answerKey.forEach((item, index) => {
    assert.strictEqual(item.prompt, items[index].prompt);
    assert.strictEqual(item.answer, items[index].answer);
    assert.strictEqual(item.graphQuestionType, items[index].graphQuestionType);
    assert.deepStrictEqual(item.graphData, items[index].graphData);
    assert.deepStrictEqual(item.answerState, items[index].answerState);
  });

  const geometry = rendererTest.buildSharedDataPictographGeometry({
    x: 54,
    y: 180,
    width: 504,
    height: runtime.layout.display.sharedDataGraphHeight,
    categoryCount: graph.categories.length
  });
  assert.strictEqual(geometry.height, 218);
  assert.strictEqual(geometry.categoryBands.length, 4);
  geometry.categoryBands.forEach((band) => assert.strictEqual(band.height, 44));
}

function assertCatalogAndReconciliationState() {
  const master = JSON.parse(fs.readFileSync("data/worksheetCatalog.master.json", "utf8")).items;
  const counts = master.reduce((result, item) => {
    result[item.status] = (result[item.status] || 0) + 1;
    return result;
  }, {});
  assert.deepStrictEqual(counts, { ready: 104, partial: 5, generated: 213, planned: 9 });
  assert.strictEqual(master.length, 331);

  RESOURCES.forEach((resource) => {
    const records = master.filter((item) => item.id === resource.id);
    assert.strictEqual(records.length, 1);
    assert.strictEqual(records[0].status, "generated");
  });

  const reconciliation = fs.readFileSync("docs/grade-2-architecture-reconciliation-preflight.md", "utf8");
  const categoryA = reconciliation.match(/\*\*A \(28\):\*\*[^\n]+/)?.[0] || "";
  const categoryD = reconciliation.match(/\*\*D \(0\):\*\*[^\n]+/)?.[0] || "";
  const categoryG = reconciliation.match(/\*\*G \(15\):\*\*[^\n]+/)?.[0] || "";
  RESOURCES.forEach((resource) => {
    assert(categoryA.includes(resource.id));
    assert(!categoryD.includes(resource.id));
  });
  assert(categoryA.includes("grade2_data_display_graphing_complete_graph"));
  assert(!categoryD.includes("grade2_data_display_graphing_complete_graph"));
  assert(categoryA.includes("grade2_data_display_graphing_match_data_to_graph"));
  assert(categoryD.includes("none"));
  assert(!categoryD.includes("grade2_data_display_graphing_graph_questions"));
  assert(categoryG.includes("grade2_data_display_graphing_graph_questions"));
}

function assertIsolation() {
  const grade1 = buildCatalogWorksheetRuntime(
    "grade1_data_display_graphing_read_graph",
    { worksheetSeed: "grade2-pictograph-isolation" }
  );
  const grade1Graph = grade1.layout.display.sharedDataGraph;
  assert.deepStrictEqual([...grade1Graph.categories.map((category) => category.value)].sort(), [3, 5, 5, 7]);
  assert.strictEqual(grade1Graph.graphType, undefined);
  assert.strictEqual(grade1.layout.header.title, "Read the Graph");
  assert.strictEqual(grade1.contentObject.meta.curriculum.footerText, "Grade 1 • Math • Data & Graphing");
  assert.strictEqual(grade1.layout.display.sharedDataSymbolStrokeColor, undefined);
  assert.strictEqual(grade1.layout.display.sharedDataSymbolStrokeWidth, undefined);

  for (const id of [
    "grade3_data_display_graphing_read_graph",
    "grade3_data_display_graphing_interpret_data"
  ]) {
    const runtime = buildCatalogWorksheetRuntime(id, { worksheetSeed: "grade2-pictograph-isolation" });
    assert.strictEqual(runtime.normalizedContentObject.content.items.length, 12);
    assert(runtime.normalizedContentObject.content.items.every((item) => item.graphData === null));
  }

  OUT_OF_SCOPE_IDS.forEach((id) => {
    const item = getAnyWorksheetCatalogById(id);
    const runtime = buildCatalogWorksheetRuntime(id, { worksheetSeed: "grade2-pictograph-out-of-scope" });
    assert.strictEqual(item.status, "generated");
    assert.strictEqual(runtime.normalizedContentObject.content.items.length, 12);
    assert(runtime.normalizedContentObject.content.items.every((problem) => problem.graphData === null));
  });

  const complete = buildCatalogWorksheetRuntime(
    "grade2_data_display_graphing_complete_graph",
    { worksheetSeed: "grade2-pictograph-reading-isolation" }
  );
  assert.strictEqual(complete.normalizedContentObject.content.items.length, 1);
  assert.strictEqual(complete.normalizedContentObject.content.items[0].taskMode, "complete_graph");
  assert(complete.normalizedContentObject.content.items[0].graphTaskData);

  const match = buildCatalogWorksheetRuntime(
    "grade2_data_display_graphing_match_data_to_graph",
    { worksheetSeed: "grade2-pictograph-reading-isolation" }
  );
  assert.strictEqual(match.normalizedContentObject.content.items.length, 2);
  assert(match.normalizedContentObject.content.items.every((problem) => problem.taskMode === "match_graph"));
  assert(match.normalizedContentObject.content.items.every((problem) => problem.graphTaskData?.choices?.length === 2));

  const activeAdapter = fs.readFileSync("engine/problemGenerators/grade2DataGraph.js", "utf8");
  assert(!activeAdapter.includes("Math.random"));
}

async function run() {
  assert.deepStrictEqual(RESOURCES.map((resource) => resource.id), [
    "grade2_data_display_graphing_read_graph",
    "grade2_data_display_graphing_interpret_data"
  ]);
  assertCatalogAndReconciliationState();
  assertIsolation();

  for (const resource of RESOURCES) {
    const variedSignatures = new Set();
    for (let index = 0; index < 30; index += 1) {
      const options = { worksheetSeed: `grade2-pictograph-${resource.task}-${index}` };
      const first = buildCatalogWorksheetRuntime(resource.id, options);
      const second = buildCatalogWorksheetRuntime(resource.id, options);
      validateRuntime(resource, first);
      assert.strictEqual(runtimeSignature(first), runtimeSignature(second));
      variedSignatures.add(runtimeSignature(first));
    }
    assert(variedSignatures.size >= 20, `${resource.id} did not vary meaningfully across seeds.`);

    const defaultRuntime = buildCatalogWorksheetRuntime(resource.id, {
      worksheetSeed: `grade2-pictograph-${resource.task}-founder-default`
    });
    const pdf = await renderRuntime(defaultRuntime);
    assert(pdf.length > 1000);
    assert.strictEqual(pageCount(pdf), 2);
  }

  console.log("Grade 2 pictograph reading batch checks passed; same-seed failures: 0.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
