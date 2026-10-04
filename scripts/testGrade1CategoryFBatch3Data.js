const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { getAnyWorksheetCatalogById } = require("../services/worksheetCatalogService");
const {
  GRADE1_GRAPH_TOPICS,
  graphTopicById,
  resolveCategoryNounLanguage
} = require("../engine/content/grade1GraphTopics");
const genericCompleteGraph = require("../engine/problemGenerators/completeGraph");
const genericMatchGraph = require("../engine/problemGenerators/matchDataToGraph");
const { getGenerator } = require("../engine/problemGenerators");
const {
  RESOURCE_TASKS,
  buildGraphData,
  buildGraphApplicationQuestions,
  supportsGraphApplicationTopic
} = require("../engine/problemGenerators/grade1DataGraph");
const { renderWorksheetPDF, buildAnswerKeyItems, __test: rendererTest } = require("../renderers/pdfRenderer");
const { DATA_DISPLAY_VISUAL_SPECS } = require("../config/layout/dataDisplayVisualSpecs");

const RESOURCES = Object.freeze([
  { id: "grade1_data_display_graphing_complete_graph", title: "Complete the Pictograph", instruction: "Use the data table. Draw circles to complete the pictograph.", task: "complete_graph", count: 2 },
  { id: "grade1_data_display_graphing_match_data_to_graph", title: "Choose the Matching Graph", instruction: "Look at each data set. Circle the graph that matches.", task: "match_graph", count: 2 },
  { id: "grade1_data_display_graphing_graph_word_problems", title: "Use the Graph to Solve", instruction: "Use the graph and the new information to answer each question.", task: "graph_application", count: 4 }
]);

class MemoryResponse extends Writable {
  constructor() { super(); this.chunks = []; }
  setHeader() {}
  _write(chunk, encoding, callback) { this.chunks.push(Buffer.from(chunk)); callback(); }
  buffer() { return Buffer.concat(this.chunks); }
}

function signature(runtime) {
  return runtime.contentObject.content.items.map((item) => ({
    prompt: item.prompt,
    answer: item.answer,
    taskMode: item.taskMode,
    graphData: item.graphData,
    graphTaskData: item.graphTaskData,
    isExample: item.isExample
  }));
}

function validateGraph(graph) {
  const topic = graphTopicById(graph.topicId);
  assert(topic);
  assert.strictEqual(graph.symbol, "circle");
  assert.strictEqual(graph.symbolValue, 1);
  assert.strictEqual(graph.categories.length, 4);
  assert.deepStrictEqual(graph.categories.map(({ label }) => label), topic.categories);
  assert.strictEqual(graph.scenario, topic.scenario);
  assert.strictEqual(graph.unitSingular, topic.unitSingular);
  assert.strictEqual(graph.unitPlural, topic.unitPlural);
  graph.categories.forEach(({ value }) => assert(Number.isInteger(value) && value >= 3 && value <= 7));
  assert(!JSON.stringify(graph).includes("½"));
}

function render(runtime) {
  return new Promise((resolve, reject) => {
    const response = new MemoryResponse();
    response.on("finish", () => resolve(response.buffer()));
    response.on("error", reject);
    renderWorksheetPDF({ res: response, contentObject: runtime.contentObject, layoutObject: runtime.layout, options: { includeAnswerKey: true } });
  });
}

async function run() {
  RESOURCES.forEach((resource) => {
    assert.strictEqual(RESOURCE_TASKS[resource.id], resource.task);
    const item = getAnyWorksheetCatalogById(resource.id);
    assert.strictEqual(item.title, resource.title);
    assert.strictEqual(item.studentInstruction, resource.instruction);
    assert.strictEqual(item.status, "generated");
    const first = buildCatalogWorksheetRuntime(resource.id, { worksheetSeed: "batch3-determinism" });
    const second = buildCatalogWorksheetRuntime(resource.id, { worksheetSeed: "batch3-determinism" });
    assert.deepStrictEqual(signature(first), signature(second));
    assert.strictEqual(first.layout.instruction, resource.instruction);
    assert.strictEqual(first.contentObject.content.items.length, resource.count);
    first.contentObject.content.items.forEach((problem) => {
      assert.strictEqual(problem.taskMode, resource.task);
      validateGraph(problem.graphData);
      if (!["match_graph", "complete_graph"].includes(resource.task)) {
        assert.strictEqual(problem.graphData.scenario, first.layout.display.sharedDataScenario);
      }
    });
    if (resource.task === "complete_graph") {
      assert.strictEqual(new Set(first.contentObject.content.items.map((problem) => problem.graphData.topicId)).size, 2);
    }
    const answers = buildAnswerKeyItems(first.contentObject.content.items);
    assert.deepStrictEqual(answers.map((answer) => answer.graphData), first.contentObject.content.items.map((problem) => problem.graphData));
    assert.deepStrictEqual(answers.map((answer) => answer.graphTaskData), first.contentObject.content.items.map((problem) => problem.graphTaskData));
  });

  const complete = buildCatalogWorksheetRuntime(RESOURCES[0].id, { worksheetSeed: "batch3-complete", includeExample: true });
  const completeProblem = complete.contentObject.content.items[0];
  assert.strictEqual(complete.contentObject.content.items.length, 2);
  assert.strictEqual(completeProblem.isExample, false);
  assert.strictEqual(completeProblem.prompt, "");
  assert.strictEqual(completeProblem.graphTaskData.dataTable.length, 4);
  assert.deepStrictEqual(completeProblem.graphTaskData.dataTable.map(({ value }) => value), completeProblem.graphData.categories.map(({ value }) => value));
  const incomplete = completeProblem.graphTaskData.rows.filter((row) => row.isIncomplete);
  assert.strictEqual(incomplete.length, 2);
  incomplete.forEach((row) => {
    assert(row.missingCount >= 1 && row.missingCount <= 3);
    assert(row.visibleCount >= 0 && row.visibleCount + row.missingCount === row.targetValue);
  });
  assert.strictEqual(new Set(incomplete.map((row) => row.missingCount)).size, 2);
  const construction = complete.layout.display.constructionPictograph;
  assert.strictEqual(construction.width, DATA_DISPLAY_VISUAL_SPECS.standard.width);
  assert.strictEqual(construction.height, 160);
  assert.strictEqual(construction.headerHeight, 32);
  assert.strictEqual(construction.bodyHeight, 128);
  assert.strictEqual(construction.categoryHeight, 32);
  assert.strictEqual(construction.labelWidth, DATA_DISPLAY_VISUAL_SPECS.standard.labelWidth);
  assert.strictEqual(construction.symbolDiameter, DATA_DISPLAY_VISUAL_SPECS.standard.symbolDiameter);
  assert.strictEqual(construction.symbolGap, DATA_DISPLAY_VISUAL_SPECS.standard.symbolGap);
  assert.strictEqual(construction.symbolInset, DATA_DISPLAY_VISUAL_SPECS.standard.symbolInset);
  assert.strictEqual(construction.tasksPerPage, 2);
  assert.strictEqual(construction.placement, "after_scenario_and_data_table");
  assert(construction.symbolGap > construction.symbolDiameter);
  const constructionGeometry = rendererTest.buildSharedDataPictographGeometry({
    x: 54,
    y: 246,
    width: construction.width,
    height: construction.height,
    categoryCount: 4,
    headerHeight: construction.headerHeight,
    minimumCategoryHeight: construction.categoryHeight
  });
  assert.strictEqual(constructionGeometry.body.height, construction.bodyHeight);
  assert.strictEqual(constructionGeometry.categoryHeight, construction.categoryHeight);
  assert.strictEqual(constructionGeometry.y + constructionGeometry.height, 406);
  const lastCircleRight = construction.labelWidth + construction.symbolInset + 6 * construction.symbolGap + construction.symbolDiameter / 2;
  assert(lastCircleRight < construction.width);
  assert.deepStrictEqual(
    rendererTest.buildConstructionGraphCategories(completeProblem.graphTaskData, false).map(({ value }) => value),
    completeProblem.graphTaskData.rows.map(({ visibleCount }) => visibleCount)
  );
  assert.deepStrictEqual(
    rendererTest.buildConstructionGraphCategories(completeProblem.graphTaskData, true).map(({ value }) => value),
    completeProblem.graphTaskData.rows.map(({ targetValue }) => targetValue)
  );

  const match = buildCatalogWorksheetRuntime(RESOURCES[1].id, { worksheetSeed: "batch3-match", includeExample: true });
  assert(match.contentObject.content.items.every((item) => !item.isExample));
  assert.strictEqual(new Set(match.contentObject.content.items.map((item) => item.graphData.topicId)).size, 2);
  match.contentObject.content.items.forEach((problem) => {
    const task = problem.graphTaskData;
    assert.deepStrictEqual(task.choices.map(({ id }) => id), ["A", "B"]);
    assert.strictEqual(task.choices.filter((choice) => choice.isCorrect).length, 1);
    assert.strictEqual(task.correctChoiceId, problem.answer);
    const matching = task.choices.filter((choice) => JSON.stringify(choice.categories) === JSON.stringify(task.dataTable));
    assert.strictEqual(matching.length, 1);
    const wrong = task.choices.find((choice) => !choice.isCorrect);
    assert.deepStrictEqual(wrong.categories.map(({ label }) => label), task.dataTable.map(({ label }) => label));
    assert.strictEqual(wrong.categories.filter((category, index) => category.value !== task.dataTable[index].value).length, 1);
    assert(["one_extra", "one_missing"].includes(task.distractor.kind));
  });
  const compact = rendererTest.buildSharedDataPictographGeometry({ x: 0, y: 0, width: 243, height: 138, categoryCount: 4, headerHeight: 26, minimumCategoryHeight: 28 });
  const headerlessCompact = rendererTest.buildSharedDataPictographGeometry({ x: 0, y: 0, width: 243, height: 138, categoryCount: 4, headerHeight: 0, minimumCategoryHeight: 34.5 });
  assert.strictEqual(compact.header.bottom - compact.header.top, 26);
  assert.strictEqual(headerlessCompact.header.bottom - headerlessCompact.header.top, 0);
  assert.strictEqual(headerlessCompact.categoryHeight, 34.5);
  assert(rendererTest.GRADE1_DATA_MATCH_SELECTION_TARGET_DIAMETER >= 18);
  assert.strictEqual(rendererTest.matchChoiceStrokeWidth({ isCorrect: true }, false), 0.8);
  assert.strictEqual(rendererTest.matchChoiceStrokeWidth({ isCorrect: true }, true), 2);
  assert.strictEqual(rendererTest.matchChoiceStrokeWidth({ isCorrect: false }, true), 0.8);

  const application = buildCatalogWorksheetRuntime(RESOURCES[2].id, { worksheetSeed: "batch3-application" });
  assert(application.contentObject.content.items.every((item) => !item.isExample));
  assert.deepStrictEqual(new Set(application.contentObject.content.items.map((item) => `${item.operation}${item.graphTaskData.newFactAmount}`)), new Set(["+1", "+2", "-1", "-2"]));
  application.contentObject.content.items.forEach((problem) => {
    const task = problem.graphTaskData;
    assert.strictEqual(typeof problem.answer, "number");
    assert(problem.answer >= 0 && problem.answer <= 9);
    assert.strictEqual(task.result, problem.answer);
    assert.strictEqual(problem.answer, problem.operation === "+" ? task.baseValue + task.newFactAmount : task.baseValue - task.newFactAmount);
    assert(!/most|least|how many more|same number|which has/i.test(problem.prompt));
    assert(!/counted by mistake|record was checked|count was checked/i.test(problem.prompt));
    assert(!/\b(?:paper|crayons|pencils|glue) group\b/i.test(problem.prompt));
    assert(/One|Two/.test(problem.prompt));
    assert(problem.graphTaskData.eventType);
  });
  assert.strictEqual(application.layout.display.dataResponseLineWidths.number, 64);
  const completed = buildCatalogWorksheetRuntime(RESOURCES[2].id, { worksheetSeed: "batch3-application", includeExample: true });
  assert.strictEqual(completed.contentObject.content.items.length, 4);
  assert.strictEqual(completed.contentObject.content.items.filter((item) => item.isExample).length, 1);
  assert.strictEqual(completed.contentObject.content.items[0].isExample, true);
  assert.deepStrictEqual(signature(completed).map((item) => ({ ...item, isExample: false })), signature(application));
  assert.deepStrictEqual(
    buildAnswerKeyItems(application.contentObject.content.items).map((item) => item.prompt),
    application.contentObject.content.items.map((item) => item.prompt)
  );

  const expectedIrregularNouns = {
    Paper: ["sheet of paper", "sheets of paper", "was used", "were used"],
    Glue: ["glue stick", "glue sticks", "was used", "were used"],
    Scissors: ["pair of scissors", "pairs of scissors", "was used", "were used"],
    Chalk: ["piece of chalk", "pieces of chalk", "was used", "were used"]
  };
  Object.entries(expectedIrregularNouns).forEach(([label, expected]) => {
    const language = resolveCategoryNounLanguage(label);
    assert.deepStrictEqual([
      language.singularNoun,
      language.pluralNoun,
      language.removePhrase.singular,
      language.removePhrase.plural
    ], expected);
  });
  assert.deepStrictEqual(
    [resolveCategoryNounLanguage("Pencils").singularNoun, resolveCategoryNounLanguage("Pencils").pluralNoun],
    ["pencil", "pencils"]
  );
  assert.deepStrictEqual(
    [resolveCategoryNounLanguage("Box").singularNoun, resolveCategoryNounLanguage("Box").pluralNoun],
    ["box", "boxes"]
  );
  assert.strictEqual(resolveCategoryNounLanguage("Equipment"), null);

  const countQuestions = buildGraphApplicationQuestions(buildGraphData(graphTopicById("classroom-materials"), () => 0.45), () => 0.45);
  assert.deepStrictEqual(countQuestions.map((problem) => problem.prompt), [
    "One sheet of paper was used. How many sheets of paper are left?",
    "One more pencil was added. How many pencils are there now?",
    "Two glue sticks were used. How many glue sticks are left?",
    "Two more crayons were added. How many crayons are there now?"
  ]);
  const sortingQuestions = buildGraphApplicationQuestions(buildGraphData(graphTopicById("things-in-a-backpack"), () => 0.45), () => 0.45);
  assert.deepStrictEqual(sortingQuestions.map((problem) => problem.prompt), [
    "One pencil was taken away. How many pencils are left?",
    "One more book was added. How many books are there now?",
    "Two erasers were taken away. How many erasers are left?",
    "Two more folders were added. How many folders are there now?"
  ]);
  GRADE1_GRAPH_TOPICS.filter((topic) => ["count", "sorting"].includes(topic.scenarioType) && supportsGraphApplicationTopic(topic)).forEach((topic) => {
    const questions = buildGraphApplicationQuestions(buildGraphData(topic, () => 0.45), () => 0.45);
    questions.forEach((problem) => {
      const language = resolveCategoryNounLanguage(problem.graphCategory);
      const amount = problem.graphTaskData.newFactAmount;
      const noun = amount === 1 ? language.singularNoun : language.pluralNoun;
      const phrase = problem.operation === "+" ? language.addPhrase : language.removePhrase;
      const verb = amount === 1 ? phrase.singular : phrase.plural;
      assert(problem.prompt.includes(noun));
      assert(problem.prompt.includes(verb));
      assert(!/\bitems?\b/i.test(problem.prompt));
      assert(!/\bgroup\b/i.test(problem.prompt));
    });
  });

  const applicationTypeExamples = {
    vote: "favourite-fruits",
    survey: "playground-activities",
    count: "classroom-materials",
    sorting: "things-in-a-backpack",
    observation: "animals-seen-at-a-pond",
    experiment: "objects-that-roll"
  };
  const languageKeywords = {
    vote: { add: /chose/, subtract: /changed/ },
    survey: { add: /chose/, subtract: /changed/ },
    count: { add: /added/, subtract: /used|taken away/ },
    sorting: { add: /added/, subtract: /taken away/ },
    observation: { add: /seen/, subtract: /left/ },
    experiment: { add: /tested/, subtract: /set aside/ }
  };
  Object.entries(applicationTypeExamples).forEach(([scenarioType, topicId]) => {
    const topic = graphTopicById(topicId);
    assert(supportsGraphApplicationTopic(topic));
    const questions = buildGraphApplicationQuestions(buildGraphData(topic, () => 0.45), () => 0.45);
    const additions = questions.filter((problem) => problem.operation === "+");
    const subtractions = questions.filter((problem) => problem.operation === "-");
    assert.strictEqual(additions.length, 2);
    assert.strictEqual(subtractions.length, 2);
    additions.forEach((problem) => assert(languageKeywords[scenarioType].add.test(problem.prompt)));
    subtractions.forEach((problem) => assert(languageKeywords[scenarioType].subtract.test(problem.prompt)));
    questions.forEach((problem) => {
      assert(!/counted by mistake|record was checked|count was checked/i.test(problem.prompt));
      assert(problem.answer >= 0);
    });
  });
  assert.deepStrictEqual(
    buildGraphApplicationQuestions(buildGraphData(graphTopicById("animals-seen-at-a-pond"), () => 0.45), () => 0.45)
      .map((problem) => problem.prompt),
    [
      "One fish left. How many fish were still there?",
      "One more duck was seen. How many ducks were there now?",
      "Two turtles left. How many turtles were still there?",
      "Two more frogs were seen. How many frogs were there now?"
    ]
  );
  assert.strictEqual(supportsGraphApplicationTopic(graphTopicById("types-of-weather")), false);
  assert.strictEqual(supportsGraphApplicationTopic(graphTopicById("shapes-found-in-class")), false);
  assert.strictEqual(supportsGraphApplicationTopic(graphTopicById("places-at-school")), false);
  assert.throws(
    () => buildCatalogWorksheetRuntime(RESOURCES[2].id, {
      worksheetSeed: "batch3-unsupported-topic",
      graphTopicId: "types-of-weather"
    }),
    /does not support graph application questions/
  );
  assert.throws(
    () => buildCatalogWorksheetRuntime(RESOURCES[2].id, {
      worksheetSeed: "batch3-unsafe-category-noun",
      graphTopicId: "places-at-school"
    }),
    /does not support graph application questions/
  );
  const fallbackA = buildCatalogWorksheetRuntime(RESOURCES[2].id, { worksheetSeed: "batch3-category-fallback" });
  const fallbackB = buildCatalogWorksheetRuntime(RESOURCES[2].id, { worksheetSeed: "batch3-category-fallback" });
  assert(supportsGraphApplicationTopic(graphTopicById(fallbackA.contentObject.content.items[0].graphData.topicId)));
  assert.deepStrictEqual(signature(fallbackA), signature(fallbackB));
  assert(GRADE1_GRAPH_TOPICS.filter(supportsGraphApplicationTopic).length > 0);

  const batch2 = buildCatalogWorksheetRuntime("grade1_data_display_graphing_read_graph", { worksheetSeed: "batch2-regression" });
  assert.strictEqual(batch2.contentObject.content.items.length, 6);
  assert.strictEqual(batch2.layout.display.sharedDataGraphHeight, 218);
  const applicationGeometry = application.layout.display.sharedDataGraphHeight;
  assert.strictEqual(applicationGeometry, 218);
  const full = rendererTest.buildSharedDataPictographGeometry({ x: 0, y: 0, width: 504, height: 218, categoryCount: 4 });
  assert.strictEqual(full.header.bottom - full.header.top, 42);
  assert.strictEqual(full.body.height, 176);
  assert.strictEqual(full.categoryHeight, 44);
  const generic = genericCompleteGraph({ random: () => 0 });
  assert.strictEqual(generic.answer, 4);
  assert(/bar graph/.test(generic.prompt));
  const genericMatch = genericMatchGraph({ random: () => 0 });
  assert.deepStrictEqual(genericMatch, {
    prompt: "A graph shows Apples = 3, Bananas = 6, Oranges = 4. Which category matches the value 3?",
    answer: "Apples"
  });
  assert.strictEqual(getGenerator("graph_word_problems"), null);
  const rendererSource = fs.readFileSync(path.join(__dirname, "..", "renderers", "pdfRenderer.js"), "utf8");
  assert(!/favourite fruit|class voted|animals seen at a pond/i.test(rendererSource));
  assert(!/Graph \$\{choice\.id\}/.test(rendererSource));
  assert(/matchDataVisualSpec/.test(rendererSource));

  const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "worksheetCatalog.master.json"), "utf8"));
  const statusCounts = catalog.items.reduce((counts, item) => ({ ...counts, [item.status]: (counts[item.status] || 0) + 1 }), {});
  assert.strictEqual(statusCounts.ready, 106);
  assert.strictEqual(statusCounts.generated, 213);
  assert.strictEqual(statusCounts.partial, 4);
  assert.strictEqual(catalog.items.filter((item) => item.activityTypes?.includes("pattern_word_problems")).length, 7);

  for (const resource of RESOURCES) {
    const pdf = await render(buildCatalogWorksheetRuntime(resource.id, { worksheetSeed: `pdf-${resource.task}` }));
    assert(pdf.length > 10000);
    assert.strictEqual((pdf.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length, 2);
  }
  console.log("Grade 1 Category F Batch 3 data tests passed.");
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
