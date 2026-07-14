const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");
const PDFDocument = require("pdfkit");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { getAnyWorksheetCatalogById } = require("../services/worksheetCatalogService");
const { renderWorksheetPDF, buildAnswerKeyItems, __test: rendererTest } = require("../renderers/pdfRenderer");
const {
  GRADE1_GRAPH_TOPICS,
  TOPIC_FAMILIES,
  graphTopicById,
  validateGrade1GraphTopics
} = require("../engine/content/grade1GraphTopics");
const {
  selectGraphTopic
} = require("../engine/problemGenerators/grade1DataGraph");

const RESOURCES = Object.freeze([
  {
    id: "grade1_data_display_graphing_read_graph",
    title: "Read the Graph",
    instruction: "Use the graph to answer each question.",
    count: 6,
    task: "read"
  },
  {
    id: "grade1_data_display_graphing_interpret_data",
    title: "Compare the Data",
    instruction: "Use the graph to compare the categories and answer each question.",
    count: 6,
    task: "interpret"
  },
  {
    id: "grade1_data_display_graphing_graph_questions",
    title: "Graph Questions",
    instruction: "Use the graph to answer each question.",
    count: 8,
    task: "mixed"
  }
]);

const BATCH3_IDS = Object.freeze([
  "grade1_data_display_graphing_complete_graph",
  "grade1_data_display_graphing_match_data_to_graph",
  "grade1_data_display_graphing_graph_word_problems"
]);

const EXPECTED_FOOTER = "Grade 1 • Math • Data & Graphing";

class MemoryResponse extends Writable {
  constructor() {
    super();
    this.headers = {};
    this.chunks = [];
  }

  setHeader(name, value) {
    this.headers[name] = value;
  }

  _write(chunk, encoding, callback) {
    this.chunks.push(Buffer.from(chunk));
    callback();
  }

  buffer() {
    return Buffer.concat(this.chunks);
  }
}

function runtimeFor(resource, options = {}) {
  return buildCatalogWorksheetRuntime(resource.id, options);
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function graphSignature(runtime) {
  const graph = runtime.layout.display.sharedDataGraph;
  return {
    graph,
    questions: runtime.contentObject.content.items.map((item) => ({
      prompt: item.prompt,
      answer: item.answer,
      responseType: item.responseType,
      graphQuestionType: item.graphQuestionType,
      duplicateSignature: item.duplicateSignature,
      isExample: item.isExample
    }))
  };
}

function renderRuntime(runtime, includeAnswerKey) {
  return new Promise((resolve, reject) => {
    const response = new MemoryResponse();
    response.on("finish", () => resolve(response.buffer()));
    response.on("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.contentObject,
      layoutObject: runtime.layout,
      options: {
        filename: "grade1-category-f-batch-2-data.pdf",
        disposition: "inline",
        includeAnswerKey
      }
    });
  });
}

function validateGraph(graph) {
  assert(graph);
  assert.strictEqual(graph.kind, "one_to_one_pictograph");
  assert.strictEqual(graph.symbol, "circle");
  assert.strictEqual(graph.symbolValue, 1);
  assert.strictEqual(graph.colorRequired, false);
  const topic = graphTopicById(graph.topicId);
  assert(topic);
  assert.strictEqual(graph.title, topic.title);
  assert.strictEqual(graph.topicFamily, topic.topicFamily);
  assert.strictEqual(graph.unitSingular, topic.unitSingular);
  assert.strictEqual(graph.unitPlural, topic.unitPlural);
  assert.strictEqual(graph.questionNoun, topic.questionNoun);
  assert.strictEqual(graph.scenario, topic.scenario);
  assert.strictEqual(graph.scenarioType, topic.scenarioType);
  assert.strictEqual(graph.dataSource, topic.dataSource);
  assert.strictEqual(graph.collectionAction, topic.collectionAction);
  assert.strictEqual(graph.purpose, topic.purpose);
  assert.strictEqual(graph.readingLevel, "grade1_short");
  assert.strictEqual(graph.keyLabel, topic.keyLabel);
  assert.strictEqual(graph.keyText, topic.keyText);
  assert.strictEqual(graph.categories.length, 4);
  assert.strictEqual(new Set(graph.categories.map((category) => category.label)).size, 4);
  assert.deepStrictEqual(graph.categories.map((category) => category.label), [...topic.categories]);
  graph.categories.forEach((category) => {
    assert(Number.isInteger(category.value));
    assert(category.value >= 3 && category.value <= 7);
  });
  const values = graph.categories.map((category) => category.value);
  const counts = values.reduce((map, value) => map.set(value, (map.get(value) || 0) + 1), new Map());
  assert.strictEqual([...counts.values()].filter((count) => count === 2).length, 1);
  assert.strictEqual(values.filter((value) => value === Math.max(...values)).length, 1);
  assert.strictEqual(values.filter((value) => value === Math.min(...values)).length, 1);
}

function assertAlignmentContract() {
  const geometry = rendererTest.buildSharedDataPictographGeometry({
    x: 54,
    y: 180,
    width: 504,
    height: 218,
    categoryCount: 4
  });
  const tolerance = 0.001;
  const near = (left, right) => assert(Math.abs(left - right) <= tolerance, `${left} != ${right}`);

  assert.strictEqual(geometry.header.titleCell.top, geometry.header.top);
  assert.strictEqual(geometry.header.titleCell.bottom, geometry.header.bottom);
  assert.strictEqual(geometry.header.keyCell.top, geometry.header.top);
  assert.strictEqual(geometry.header.keyCell.bottom, geometry.header.bottom);
  near(geometry.header.titleCell.centerY, geometry.header.centerY);
  near(geometry.header.keyCell.centerY, geometry.header.centerY);
  near(geometry.header.titleCell.centerY, geometry.header.keyCell.centerY);
  near(geometry.header.keySymbolCenterY, geometry.header.centerY);

  assert.strictEqual(geometry.categoryBands.length, 4);
  geometry.categoryBands.forEach((band) => {
    near(band.containerTop, geometry.body.top);
    near(band.containerBottom, geometry.body.bottom);
    near(band.height, geometry.categoryHeight);
    near(band.labelArea.height, geometry.categoryHeight);
    near(band.symbolArea.height, geometry.categoryHeight);
    near(band.labelBaselineY, band.centerY);
  });
  near(geometry.categoryBands[0].top, geometry.body.top);
  near(geometry.categoryBands[3].bottom, geometry.body.bottom);
  near(geometry.categoryBands[3].height, geometry.categoryBands[0].height);
  near(geometry.categoryBands[3].bottomPadding, geometry.categoryBands[0].bottomPadding);
}

function assertScenarioLayoutContract() {
  const scenario = rendererTest.buildSharedDataScenarioGeometry({
    x: 54,
    y: 150,
    width: 504,
    measuredHeight: 24,
    lineHeight: 13,
    maxLines: 2,
    gapAfter: 14
  });
  const graph = rendererTest.buildSharedDataPictographGeometry({
    x: 54,
    y: scenario.nextY,
    width: 504,
    height: 218,
    categoryCount: 4
  });

  assert.strictEqual(scenario.x, 54);
  assert.strictEqual(scenario.width, 504);
  assert.strictEqual(scenario.align, "left");
  assert.strictEqual(scenario.lineCount, 2);
  assert.strictEqual(scenario.maxLines, 2);
  assert(scenario.bottom < graph.y);
  assert.strictEqual(graph.header.bottom - graph.header.top, 42);
  assert.strictEqual(graph.body.height, 176);
  assert.strictEqual(graph.categoryHeight, 44);
}

function assertTopicRegistry() {
  const result = validateGrade1GraphTopics(GRADE1_GRAPH_TOPICS);
  assert.strictEqual(result.topicCount, 100);
  assert.strictEqual(result.scenarioCount, 100);
  assert.deepStrictEqual(result.scenarioTypeCounts, {
    vote: 19,
    survey: 11,
    observation: 22,
    count: 18,
    sorting: 22,
    record_over_time: 3,
    experiment: 5
  });
  assert.strictEqual(GRADE1_GRAPH_TOPICS.length, 100);
  assert.strictEqual(new Set(GRADE1_GRAPH_TOPICS.map((topic) => topic.id)).size, 100);
  assert.strictEqual(new Set(GRADE1_GRAPH_TOPICS.map((topic) => topic.title)).size, 100);
  assert.deepStrictEqual(result.familyCounts, {
    classroom_school: 9,
    animals_nature: 9,
    food_gardens: 9,
    sports_movement: 9,
    books_stories: 8,
    weather_seasons: 8,
    transportation: 8,
    toys_play: 8,
    community_places: 8,
    science_observations: 8,
    arts_music: 8,
    everyday_objects: 8
  });
  assert.deepStrictEqual(new Set(GRADE1_GRAPH_TOPICS.map((topic) => topic.topicFamily)), new Set(TOPIC_FAMILIES));
  const scenarioMeasureDoc = new PDFDocument({ autoFirstPage: false });
  scenarioMeasureDoc.font("Helvetica").fontSize(10);
  const scenarioLineHeight = scenarioMeasureDoc.currentLineHeight(true);
  GRADE1_GRAPH_TOPICS.forEach((topic) => {
    assert.strictEqual(topic.categories.length, 4);
    assert.strictEqual(new Set(topic.categories.map((category) => category.toLowerCase())).size, 4);
    assert(topic.categories.every((category) => category.length <= 18));
    assert.strictEqual(topic.blackAndWhiteSafe, true);
    assert.strictEqual(topic.supportsDirectReading, true);
    assert.strictEqual(topic.supportsComparison, true);
    assert.strictEqual(topic.supportsMixedQuestions, true);
    assert.strictEqual(topic.coherenceReviewed, true);
    assert.strictEqual(topic.colorOnlyInterpretation, false);
    assert.deepStrictEqual(topic.sensitiveTags, []);
    assert.strictEqual(topic.readingLevel, "grade1_short");
    assert(topic.scenario.length > 0 && topic.scenario.length <= 160);
    assert(topic.scenario.toLowerCase().includes(topic.unitPlural.toLowerCase()));
    assert(!/\d|\b(?:most|least|same|equal|more|fewer|highest|lowest)\b/i.test(topic.scenario));
    assert(!/\{\{?|\}\}?|\$\{/.test(topic.scenario));
    assert(!/\b(?:health|medical|religion|religious|income|identity|vacation|owned|household|family car)\b/i.test(topic.scenario));
    const measuredHeight = scenarioMeasureDoc.heightOfString(topic.scenario, { width: 504, align: "left", lineGap: 0 });
    const scenarioGeometry = rendererTest.buildSharedDataScenarioGeometry({
      x: 54,
      y: 160,
      width: 504,
      measuredHeight,
      lineHeight: scenarioLineHeight,
      maxLines: 2,
      gapAfter: 14
    });
    assert(scenarioGeometry.lineCount <= 2, `${topic.id} scenario exceeds two rendered lines.`);
    assert.strictEqual(scenarioGeometry.align, "left");
    assert.strictEqual(scenarioGeometry.width, 504);
    assert(!/\b(?:Favorite|Color)\b/.test([topic.title, ...topic.categories, topic.keyLabel].join(" ")));
  });
  scenarioMeasureDoc.end();
  assert.strictEqual(graphTopicById("favourite-classroom-activities").title, "Favourite Classroom Activities");

  const rendererSource = fs.readFileSync(path.join(__dirname, "../renderers/pdfRenderer.js"), "utf8");
  [
    "Favourite Classroom Activities",
    "Favorite Classroom Activities",
    "Reading",
    "Drawing",
    "Building",
    "Puzzles",
    "= 1 vote",
    "A class voted for their favourite fruit",
    "A class visited a pond",
    "Students recorded the weather"
  ].forEach((hardCodedCopy) => {
    assert(!rendererSource.includes(hardCodedCopy), `Renderer must remain topic-agnostic; found '${hardCodedCopy}'.`);
  });
}

function assertTopicSelectionAndGrammar() {
  RESOURCES.forEach((resource) => {
    const seed = `batch2-topic-${resource.task}`;
    const first = runtimeFor(resource, { worksheetSeed: seed });
    const second = runtimeFor(resource, { worksheetSeed: seed });
    assert.strictEqual(first.layout.display.sharedDataGraph.topicId, second.layout.display.sharedDataGraph.topicId);
    assert.strictEqual(first.layout.display.sharedDataGraph.scenario, second.layout.display.sharedDataGraph.scenario);
    assert.deepStrictEqual(first.layout.display.sharedDataGraph, second.layout.display.sharedDataGraph);
  });

  const selectionState = {};
  const firstTopic = selectGraphTopic({ worksheetSeed: "multi-page-seed", selectionState });
  const secondTopic = selectGraphTopic({ worksheetSeed: "multi-page-seed", selectionState });
  assert.notStrictEqual(firstTopic.id, secondTopic.id);
  assert.notStrictEqual(firstTopic.scenario, secondTopic.scenario);
  assert.strictEqual(firstTopic.scenario, graphTopicById(firstTopic.id).scenario);
  assert.strictEqual(secondTopic.scenario, graphTopicById(secondTopic.id).scenario);

  const weather = runtimeFor(RESOURCES[0], {
    worksheetSeed: "unit-grammar-weather",
    graphTopicId: "types-of-weather"
  });
  const weatherGraph = weather.layout.display.sharedDataGraph;
  assert.strictEqual(weatherGraph.keyLabel, "1 circle = 1 day");
  assert.strictEqual(weatherGraph.keyText, "= 1 day");
  assert.strictEqual(weatherGraph.scenario, graphTopicById("types-of-weather").scenario);
  assert(!weatherGraph.scenario.includes("vote"));
  assert(weather.contentObject.content.items.some((item) => item.prompt.includes("days")));
  assert(weather.contentObject.content.items.every((item) => !item.prompt.includes("vote")));
  ["Reading", "Drawing", "Building", "Puzzles"].forEach((label) => {
    assert(weather.contentObject.content.items.every((item) => !item.prompt.includes(label)));
  });

  const fruits = runtimeFor(RESOURCES[2], {
    worksheetSeed: "unit-grammar-fruits",
    graphTopicId: "favourite-fruits"
  });
  assert.strictEqual(fruits.layout.display.sharedDataGraph.title, "Favourite Fruits");
  assert.strictEqual(fruits.layout.display.sharedDataScenario, fruits.layout.display.sharedDataGraph.scenario);
  assert(fruits.contentObject.content.items.some((item) => item.prompt.includes("Apples")));
  assert(fruits.contentObject.content.items.every((item) => !item.prompt.includes("Reading")));
}

function validateAnswers(runtime) {
  const graph = runtime.layout.display.sharedDataGraph;
  const values = new Map(graph.categories.map((category) => [category.label, category.value]));
  const maximum = Math.max(...values.values());
  const minimum = Math.min(...values.values());
  const items = runtime.contentObject.content.items;

  items.forEach((item) => {
    const expectedResponseTypes = {
      category_count: "number",
      category_total: "number",
      key_value: "number",
      difference: "number",
      most: "category",
      least: "category",
      more: "category",
      fewer: "category",
      same: "yes_no"
    };
    assert.strictEqual(item.responseType, expectedResponseTypes[item.graphQuestionType]);
    switch (item.graphQuestionType) {
      case "category_count":
        assert.strictEqual(item.answer, values.get(item.graphCategory));
        break;
      case "category_total":
        assert.strictEqual(item.answer, graph.categories.length);
        break;
      case "key_value":
        assert.strictEqual(item.answer, 1);
        break;
      case "most":
        assert.strictEqual(values.get(item.answer), maximum);
        break;
      case "least":
        assert.strictEqual(values.get(item.answer), minimum);
        break;
      case "more":
      case "fewer": {
        const named = graph.categories.filter((category) => item.prompt.includes(category.label));
        assert.strictEqual(named.length, 2);
        const expected = item.graphQuestionType === "more"
          ? named.reduce((a, b) => a.value > b.value ? a : b)
          : named.reduce((a, b) => a.value < b.value ? a : b);
        assert.strictEqual(item.answer, expected.label);
        break;
      }
      case "difference":
        assert.strictEqual(item.answer, maximum - minimum);
        assert(item.answer >= 1 && item.answer <= 4);
        break;
      case "same": {
        const named = graph.categories.filter((category) => item.prompt.includes(category.label));
        assert.strictEqual(named.length, 2);
        assert.strictEqual(named[0].value, named[1].value);
        assert.strictEqual(item.answer, "Yes");
        break;
      }
      default:
        assert.fail(`Unexpected graph question type '${item.graphQuestionType}'.`);
    }
  });
}

function assertResponseLineContract() {
  const widths = rendererTest.GRADE1_DATA_RESPONSE_LINE_WIDTHS;
  assert.deepStrictEqual(widths, { number: 64, category: 136, yes_no: 84 });
  assert(widths.category > widths.yes_no);
  assert(widths.yes_no > widths.number);

  const columnWidth = 230;
  const leftX = 90;
  const rightX = 372;
  const geometry = (x, responseType, promptHeight = 28) => rendererTest.buildGrade1DataResponseGeometry({
    x,
    y: 680,
    width: columnWidth,
    promptHeight,
    responseType,
    numberGutter: 44,
    promptGap: 28,
    lineWidths: widths
  });

  const left = ["number", "category", "yes_no"].map((type) => geometry(leftX, type));
  const right = ["number", "category", "yes_no"].map((type) => geometry(rightX, type));
  left.forEach((entry) => assert.strictEqual(entry.localStartX, 44));
  right.forEach((entry) => assert.strictEqual(entry.localStartX, 44));
  assert.strictEqual(new Set(left.map((entry) => entry.lineX)).size, 1);
  assert.strictEqual(new Set(right.map((entry) => entry.lineX)).size, 1);
  assert.strictEqual(right[0].lineX - left[0].lineX, rightX - leftX);
  left.forEach((entry, index) => {
    assert.strictEqual(entry.lineWidth, widths[entry.responseType]);
    assert.strictEqual(right[index].lineWidth, entry.lineWidth);
    assert.strictEqual(entry.lineY, entry.promptBottomY + 28);
  });

  const oneLine = geometry(leftX, "category", 14);
  const wrapped = geometry(leftX, "category", 42);
  assert.strictEqual(oneLine.lineX, wrapped.lineX);
  assert.strictEqual(oneLine.lineWidth, wrapped.lineWidth);
  assert(wrapped.lineY > oneLine.lineY);
  assert(oneLine.lineY > oneLine.promptBottomY);
  assert(wrapped.lineY > wrapped.promptBottomY);

  const completed = geometry(leftX, "number", 28);
  const unanswered = geometry(leftX, "number", 28);
  const answerKey = geometry(leftX, "number", 28);
  assert.deepStrictEqual(completed, unanswered);
  assert.deepStrictEqual(answerKey, unanswered);

  const measureDoc = new PDFDocument({ autoFirstPage: false });
  measureDoc.font("Helvetica-Bold").fontSize(12);
  GRADE1_GRAPH_TOPICS.flatMap((topic) => topic.categories).forEach((label) => {
    assert(
      measureDoc.widthOfString(label) <= widths.category - 8,
      `Category response '${label}' exceeds the ${widths.category}-point response line.`
    );
  });
  assert(measureDoc.widthOfString("Yes") <= widths.yes_no - 8);
  assert(measureDoc.widthOfString("7") <= widths.number - 8);
  measureDoc.end();
}

function assertTopicVarietyResponseLines() {
  const topicIds = [
    "favourite-fruits",
    "playground-activities",
    "animals-seen-at-a-pond",
    "favourite-classroom-activities",
    "community-places",
    "shapes-found-in-class"
  ];

  topicIds.forEach((graphTopicId) => {
    const runtime = runtimeFor(RESOURCES[2], {
      worksheetSeed: `response-lines-${graphTopicId}`,
      graphTopicId,
      includeExample: true
    });
    const graph = runtime.layout.display.sharedDataGraph;
    assert.strictEqual(graph.topicId, graphTopicId);
    assert.strictEqual(runtime.layout.display.grade1DataResponseLines, true);
    assert.deepStrictEqual(runtime.layout.display.dataResponseLineWidths, {
      number: 64,
      category: 136,
      yes_no: 84
    });
    runtime.contentObject.content.items.forEach((item) => {
      assert(["number", "category", "yes_no"].includes(item.responseType));
      if (item.responseType === "category") assert(graph.categories.some((category) => category.label === item.answer));
    });
  });
}

function assertResourceContracts() {
  RESOURCES.forEach((resource) => {
    const item = getAnyWorksheetCatalogById(resource.id);
    assert(item);
    assert.strictEqual(item.status, "generated");
    assert.strictEqual(item.shortTitle, resource.title);
    assert.strictEqual(item.studentInstruction, resource.instruction);

    const runtime = runtimeFor(resource, { worksheetSeed: `batch2-${resource.task}-default` });
    const questions = runtime.contentObject.content.items;
    assert.strictEqual(runtime.layout.header.title, resource.title);
    assert.strictEqual(runtime.layout.instruction, resource.instruction);
    assert.strictEqual(runtime.layout.header.subtitle || "", "");
    assert.strictEqual(runtime.layout.display.hideSubtitle, true);
    assert.strictEqual(runtime.layout.display.sharedDataPictograph, true);
    assert.strictEqual(
      runtime.layout.display.sharedDataScenario,
      runtime.layout.display.sharedDataGraph.scenario
    );
    assert.strictEqual(runtime.layout.display.sharedDataScenarioPlacement, "between_instruction_and_graph");
    assert.strictEqual(runtime.layout.display.sharedDataScenarioAlign, "left");
    assert.strictEqual(runtime.layout.display.sharedDataScenarioFullWidth, true);
    assert.strictEqual(runtime.layout.display.sharedDataScenarioMaxLines, 2);
    assert.strictEqual(runtime.layout.display.suppressExampleLabel, true);
    assert.strictEqual(runtime.layout.display.grade1DataResponseLines, true);
    assert.strictEqual(runtime.layout.display.dataResponseLineInset, 44);
    assert.strictEqual(runtime.layout.display.dataResponsePromptGap, 28);
    assert.deepStrictEqual(runtime.layout.display.dataResponseLineWidths, {
      number: 64,
      category: 136,
      yes_no: 84
    });
    assert.strictEqual(runtime.layout.template.columns, 2);
    assert.strictEqual(runtime.layout.template.maxProblemsPerPage, resource.count);
    assert.strictEqual(questions.length, resource.count);
    assert(questions.every((question) => !question.isExample));
    assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, EXPECTED_FOOTER);
    assert(!EXPECTED_FOOTER.includes("data_display_graphing"));
    assert(!Object.prototype.hasOwnProperty.call(runtime.layout, "overflow"));
    validateGraph(runtime.layout.display.sharedDataGraph);
    validateAnswers(runtime);
    assert.strictEqual(new Set(questions.map((question) => question.prompt)).size, resource.count);
    assert.strictEqual(new Set(questions.map((question) => question.duplicateSignature)).size, resource.count);

    const types = new Set(questions.map((question) => question.graphQuestionType));
    if (resource.task === "read") {
      assert([...types].every((type) => ["category_count", "category_total", "key_value"].includes(type)));
    } else if (resource.task === "interpret") {
      assert(!types.has("category_count"));
      ["most", "least", "more", "fewer", "difference", "same"].forEach((type) => assert(types.has(type)));
    } else {
      assert(types.has("category_count"));
      assert(types.has("most"));
      assert(types.has("difference"));
      assert(types.has("same"));
    }
  });
}

function assertCompletedExamples() {
  RESOURCES.forEach((resource) => {
    const seed = `batch2-${resource.task}-paired`;
    const defaultRuntime = runtimeFor(resource, { worksheetSeed: seed });
    const completedRuntime = runtimeFor(resource, { worksheetSeed: seed, includeExample: true });
    const items = completedRuntime.contentObject.content.items;
    assert.strictEqual(items.length, resource.count);
    assert.strictEqual(items[0].isExample, true);
    items.slice(1).forEach((item) => assert.strictEqual(item.isExample, false));
    assert.strictEqual(completedRuntime.layout.display.exampleCountsAsQuestion, true);
    assert.strictEqual(completedRuntime.layout.display.suppressExampleLabel, true);
    assert.deepStrictEqual(
      completedRuntime.layout.display.sharedDataGraph,
      defaultRuntime.layout.display.sharedDataGraph
    );
    assert.strictEqual(
      completedRuntime.layout.display.sharedDataScenario,
      defaultRuntime.layout.display.sharedDataScenario
    );
    assert.deepStrictEqual(
      items.map(({ prompt, answer }) => ({ prompt, answer })),
      defaultRuntime.contentObject.content.items.map(({ prompt, answer }) => ({ prompt, answer }))
    );
  });
}

function assertDeterminismAndNoMutation() {
  RESOURCES.forEach((resource) => {
    const options = { worksheetSeed: `batch2-${resource.task}-same-seed`, includeExample: true };
    const before = JSON.stringify(options);
    assert.deepStrictEqual(graphSignature(runtimeFor(resource, options)), graphSignature(runtimeFor(resource, options)));
    assert.strictEqual(JSON.stringify(options), before);
  });
}

function assertBatch3AndGrade2Isolation() {
  BATCH3_IDS.forEach((id) => {
    const item = getAnyWorksheetCatalogById(id);
    assert(item);
    assert.strictEqual(item.status, "generated");
    assert(!item.studentInstruction);
  });

  RESOURCES.forEach((resource) => {
    const grade2Id = resource.id.replace("grade1_", "grade2_");
    const runtime = buildCatalogWorksheetRuntime(grade2Id, {
      worksheetSeed: `batch2-grade2-${resource.task}`,
      questionCount: 2
    });
    assert.strictEqual(runtime.layout.display?.sharedDataPictograph, undefined);
    assert.strictEqual(runtime.layout.display?.sharedDataGraph, undefined);
    runtime.contentObject.content.items.forEach((item) => {
      assert.strictEqual(item.graphData, null);
      assert.strictEqual(item.graphQuestionType, null);
    });
  });
}

async function assertPdfAndAnswerKeyParity() {
  for (const resource of RESOURCES) {
    const runtime = runtimeFor(resource, {
      worksheetSeed: `batch2-${resource.task}-pdf`,
      includeExample: true
    });
    const source = runtime.contentObject.content.items;
    assert.strictEqual(
      runtime.layout.display.sharedDataScenario,
      runtime.layout.display.sharedDataGraph.scenario
    );
    const answerKey = buildAnswerKeyItems(source);
    assert.strictEqual(answerKey.length, resource.count);
    answerKey.forEach((item, index) => {
      assert.strictEqual(item.id, source[index].id);
      assert.strictEqual(item.prompt, source[index].prompt);
      assert.strictEqual(item.answer, source[index].answer);
      assert.strictEqual(item.responseType, source[index].responseType);
      assert.strictEqual(item.graphQuestionType, source[index].graphQuestionType);
      assert.deepStrictEqual(item.graphData, source[index].graphData);
    });

    const student = await renderRuntime(runtime, false);
    const withKey = await renderRuntime(runtime, true);
    assert(student.length > 1000);
    assert(withKey.length > student.length);
    assert.strictEqual(pageCount(student), 1);
    assert.strictEqual(pageCount(withKey), 2);
  }
}

async function run() {
  assertAlignmentContract();
  assertScenarioLayoutContract();
  assertResponseLineContract();
  assertTopicRegistry();
  assertTopicSelectionAndGrammar();
  assertTopicVarietyResponseLines();
  assertResourceContracts();
  assertCompletedExamples();
  assertDeterminismAndNoMutation();
  assertBatch3AndGrade2Isolation();
  await assertPdfAndAnswerKeyParity();
  console.log("Grade 1 Category F Batch 2 data checks passed; same-seed failures: 0.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
