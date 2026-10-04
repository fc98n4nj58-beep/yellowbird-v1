"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { applyFounderReviewCurrentOutput } = require("../config/founderReviewCurrentOutput");
const { getMasterWorksheetCatalog } = require("../services/worksheetCatalogService");
const { renderWorksheetPDF, buildAnswerKeyItems, __test: rendererTest } = require("../renderers/pdfRenderer");
const layoutSpec = require("../config/layout/layoutSpec.json");

const ROOT = path.join(__dirname, "..");
const IDS = Object.freeze({
  equation: "grade2_addition_subtraction_facts_equation_match",
  numberLine: "grade2_place_value_representation_number_line_identify",
  numberWords: "grade2_place_value_representation_number_word_match"
});
const SPECS = Object.freeze({
  [IDS.equation]: {
    title: "Equal or Not Equal?",
    instruction: "Solve both sides. Write = if they have the same value. Write ≠ if they have different values.",
    footer: "Grade 2 • Math • Addition and Subtraction",
    count: 20
  },
  [IDS.numberLine]: {
    title: "Identify Numbers on a Number Line",
    instruction: "Write the number marked on each number line.",
    footer: "Grade 2 • Math • Number Representation",
    count: 6
  },
  [IDS.numberWords]: {
    title: "Write Number Words to 200",
    instruction: "Write each number in words.",
    footer: "Grade 2 • Math • Number Representation",
    count: 10
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
  return runtime.normalizedContentObject.content.items.map((item) => ({
    prompt: item.prompt,
    answer: item.answer,
    visual: item.visual,
    responseMode: item.responseMode,
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

function assertSharedContract(runtime, id) {
  const spec = SPECS[id];
  const items = runtime.normalizedContentObject.content.items;
  assert.strictEqual(runtime.item.status, "generated");
  assert.strictEqual(runtime.item.title, spec.title);
  assert.strictEqual(runtime.layout.header.title, spec.title);
  assert.strictEqual(runtime.layout.header.subtitle, "");
  assert.strictEqual(runtime.layout.instruction, spec.instruction);
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, spec.footer);
  assert(!runtime.contentObject.meta.curriculum.footerText.includes("_"));
  assert(!runtime.layout.header.title.includes("_"));
  assert(!runtime.layout.instruction.includes("_"));
  assert.strictEqual(items.length, spec.count);
  assert.strictEqual(items.some((item) => item.answer == null), false);
  assert.strictEqual(items.some((item) => item.isExample), false);
  assert.strictEqual(new Set(items.map((item) => item.duplicateSignature).filter(Boolean)).size, spec.count);
  assert.deepStrictEqual(
    buildAnswerKeyItems(runtime.contentObject.content.items).map((item) => item.answer),
    runtime.contentObject.content.items.map((item) => item.answer)
  );
}

function assertEquationContract(runtime) {
  const items = runtime.normalizedContentObject.content.items;
  assert.strictEqual(runtime.layout.template.columns, 2);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 20);
  assert.strictEqual(runtime.layout.display.denseGridRows, 10);
  assert.strictEqual(runtime.layout.display.answerTargetVariant, "comparisonSymbol");
  assert.strictEqual(items.filter((item) => item.answer === "=").length, 10);
  assert.strictEqual(items.filter((item) => item.answer === "≠").length, 10);
  const templateCounts = {
    addition_addition: 0,
    subtraction_subtraction: 0,
    addition_subtraction: 0
  };
  let zeroRelated = 0;
  let fiftyMinus = 0;
  const leftValues = new Set();
  const rightValues = new Set();
  items.forEach((item) => {
    const match = item.prompt.match(/^(\d+) ([+-]) (\d+)\s+___\s+(\d+) ([+-]) (\d+)$/);
    assert(match, `Malformed relational prompt: ${item.prompt}`);
    const [, leftA, leftOp, leftB, rightA, rightOp, rightB] = match;
    const template = leftOp === "+" && rightOp === "+"
      ? "addition_addition"
      : leftOp === "-" && rightOp === "-"
        ? "subtraction_subtraction"
        : "addition_subtraction";
    templateCounts[template] += 1;
    if ([leftA, leftB, rightA, rightB].some((value) => Number(value) === 0)) zeroRelated += 1;
    if ((leftOp === "-" && Number(leftA) === 50) || (rightOp === "-" && Number(rightA) === 50)) fiftyMinus += 1;
    leftValues.add(item.leftValue);
    rightValues.add(item.rightValue);
    assert(item.leftValue >= 0 && item.leftValue <= 50);
    assert(item.rightValue >= 0 && item.rightValue <= 50);
    assert.strictEqual(item.answer, item.leftValue === item.rightValue ? "=" : "≠");
    assert.strictEqual(item.responseMode, "equation_equivalence");
  });
  assert.strictEqual(Object.values(templateCounts).reduce((sum, count) => sum + count, 0), 20);
  assert(Object.values(templateCounts).every((count) => count >= 5 && count <= 8));
  assert(zeroRelated <= 2, `Zero-related question count was ${zeroRelated}.`);
  assert(fiftyMinus <= 2, `50 - n question count was ${fiftyMinus}.`);
  assert(leftValues.size >= 10, `Only ${leftValues.size} left-side totals were observed.`);
  assert(rightValues.size >= 8, `Only ${rightValues.size} right-side totals were observed.`);
}

function assertNumberLineContract(runtime) {
  const items = runtime.normalizedContentObject.content.items;
  assert.strictEqual(runtime.layout.template.columns, 1);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 6);
  assert.strictEqual(runtime.layout.display.numberLineFullContentWidth, true);
  assert.strictEqual(runtime.layout.display.numberLineAnswerUnderTarget, true);
  assert.strictEqual(runtime.layout.display.numberLineEndpointSafeInset, true);
  assert.strictEqual(runtime.layout.display.hideItemPrompts, true);
  let leftEndpointCount = 0;
  let rightEndpointCount = 0;
  const observedIntervals = new Set();
  items.forEach((item) => {
    const data = item.visual.data;
    observedIntervals.add(data.interval);
    assert.strictEqual(item.visual.kind, "number_line");
    assert([1, 2, 5, 10].includes(data.interval));
    assert.strictEqual(data.tickCount, 10);
    assert.strictEqual(data.labelEvery, 1);
    assert.strictEqual(data.end - data.start, data.interval * data.tickCount);
    assert.strictEqual(item.answer, data.start + data.targetIndex * data.interval);
    assert(item.answer >= 0 && item.answer <= 200);
    assert(data.start >= 0 && data.end <= 200);
    if (data.targetIndex === 0) leftEndpointCount += 1;
    if (data.targetIndex === data.tickCount) rightEndpointCount += 1;

    const pageBox = layoutSpec.page.contentBox;
    const lineInset = 34;
    const lineWidth = pageBox.width - lineInset * 2;
    const measured = rendererTest.measureNumberLineVisual(data, lineWidth, 80, { forceFullWidth: true });
    const dotX = pageBox.x + lineInset + data.targetIndex * (measured.width / data.tickCount);
    const answerTarget = rendererTest.buildNumberLineAnswerTargetGeometry({
      dotX,
      lineY: 100,
      cellBottomY: 190,
      measuredHeight: measured.height,
      pageBox
    });
    assert.strictEqual(measured.width, lineWidth);
    assert.strictEqual(answerTarget.centerX, dotX);
    assert.strictEqual(answerTarget.clamped, false);
    assert(answerTarget.x >= pageBox.x);
    assert(answerTarget.x + answerTarget.width <= pageBox.x + pageBox.width);
    assert(answerTarget.y - 100 >= 42);
  });
  assert(observedIntervals.size >= 3);
  assert.strictEqual(leftEndpointCount, 1);
  assert.strictEqual(rightEndpointCount, 1);
}

function assertNumberWordContract(runtime) {
  const items = runtime.normalizedContentObject.content.items;
  assert.strictEqual(runtime.layout.template.columns, 1);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 10);
  assert.strictEqual(runtime.layout.display.denseGridRows, 10);
  assert.strictEqual(runtime.layout.display.numberWordResponseTarget, "writtenWord");
  assert.strictEqual(runtime.layout.display.writingLine, true);
  assert(runtime.layout.display.standardAnswerLineWidth >= 150);
  assert.strictEqual(new Set(items.map((item) => item.value)).size, 10);
  items.forEach((item) => {
    assert(/^\d+$/.test(item.prompt));
    assert(item.value >= 0 && item.value <= 200);
    assert.strictEqual(item.prompt, String(item.value));
    assert.strictEqual(item.answer, item.numberWord);
    assert.strictEqual(item.numberWordMode, "numeral_to_word");
    assert.strictEqual(item.responseMode, "writtenNumberWord");
  });
}

function assertCatalogParityAndCounts() {
  const master = getMasterWorksheetCatalog();
  const generated = JSON.parse(fs.readFileSync(path.join(ROOT, "data/worksheetCatalog.generated.json"), "utf8")).items;
  const count = (status) => master.filter((item) => item.status === status).length;
  assert.strictEqual(master.length, 334);
  assert.strictEqual(count("ready"), 106);
  assert.strictEqual(count("generated"), 213);
  assert.strictEqual(count("partial"), 4);
  Object.values(IDS).forEach((id) => {
    const masterItem = master.find((item) => item.id === id);
    const generatedItem = applyFounderReviewCurrentOutput(generated.find((item) => item.id === id));
    assert.strictEqual(masterItem.status, "generated");
    assert.strictEqual(generatedItem.status, "generated");
    ["title", "shortTitle", "description", "studentInstruction", "generatorOptions"]
      .forEach((field) => assert.deepStrictEqual(generatedItem[field], masterItem[field], `${id} ${field} parity`));
  });

  const reconciliation = fs.readFileSync(
    path.join(ROOT, "docs/grade-2-architecture-reconciliation-preflight.md"),
    "utf8"
  );
  const categoryALine = reconciliation.split("\n").find((line) => line.startsWith("- **A (35):**"));
  const categoryDLine = reconciliation.split("\n").find((line) => line.startsWith("- **D (0):**"));
  assert(categoryALine);
  assert(categoryDLine);
  assert(categoryDLine.includes("none"));
  Object.values(IDS).forEach((id) => {
    assert(categoryALine.includes(id), `${id} must be reconciled in Category A.`);
    assert(!categoryDLine.includes(id), `${id} must no longer remain in Category D.`);
  });
}

function assertEquationUniquenessSweep() {
  const metrics = {
    seedsChecked: 500,
    questionsPerSeed: SPECS[IDS.equation].count,
    duplicateFailures: 0,
    generationFailures: 0
  };
  const failures = [];
  const originalLog = console.log;
  console.log = () => {};
  try {
    for (let seedIndex = 0; seedIndex < metrics.seedsChecked; seedIndex += 1) {
      try {
        const runtime = buildCatalogWorksheetRuntime(IDS.equation, {
          worksheetSeed: `g2-equation-uniqueness-${seedIndex}`
        });
        const items = runtime.normalizedContentObject.content.items;
        const signatures = items.map((item) => item.duplicateSignature).filter(Boolean);
        if (items.length !== metrics.questionsPerSeed || new Set(signatures).size !== items.length) {
          metrics.duplicateFailures += 1;
          failures.push(`seed ${seedIndex}: ${items.length} questions, ${new Set(signatures).size} unique`);
        }
      } catch (error) {
        metrics.generationFailures += 1;
        failures.push(`seed ${seedIndex}: ${error.message}`);
      }
    }
  } finally {
    console.log = originalLog;
  }
  assert.deepStrictEqual(failures, []);
  return metrics;
}

function assertRouteAndGradeIsolation() {
  const previewRoute = fs.readFileSync(path.join(ROOT, "routes/worksheetPreviewRoutes.js"), "utf8");
  const pdfRoute = fs.readFileSync(path.join(ROOT, "routes/worksheetPdfRoutes.js"), "utf8");
  assert(previewRoute.includes("buildCatalogWorksheetRuntime"));
  assert(pdfRoute.includes("buildCatalogWorksheetRuntime"));

  const grade1Equation = buildCatalogWorksheetRuntime(
    "grade1_addition_subtraction_facts_equation_match",
    { worksheetSeed: "g1-relational-isolation", includeExample: true }
  );
  assert.strictEqual(grade1Equation.layout.header.title, "Equal or Not Equal?");
  assert.strictEqual(grade1Equation.normalizedContentObject.content.items.length, 20);
  assert.strictEqual(grade1Equation.normalizedContentObject.content.items[0].isExample, true);
  assert(grade1Equation.normalizedContentObject.content.items.every((item) => item.leftValue <= 20 && item.rightValue <= 20));

  const grade3Line = buildCatalogWorksheetRuntime(
    "grade3_place_value_representation_number_line_identify",
    { worksheetSeed: "g3-number-line-isolation", questionCount: 4 }
  );
  assert.strictEqual(Boolean(grade3Line.layout.display.numberLineFullContentWidth), true);
  assert(grade3Line.normalizedContentObject.content.items.every((item) => item.prompt === ""));
  assert(grade3Line.normalizedContentObject.content.items.every((item) => item.responseTarget === "number_line_value"));
  assert(grade3Line.normalizedContentObject.content.items.every((item) => item.targetValue >= 100 && item.targetValue <= 1000));

  const grade3Equation = buildCatalogWorksheetRuntime(
    "grade3_addition_subtraction_facts_equation_match",
    { worksheetSeed: "g3-relational-isolation", questionCount: 4 }
  );
  assert(grade3Equation.normalizedContentObject.content.items.every((item) => item.responseMode === "equation_equivalence"));
  assert(grade3Equation.normalizedContentObject.content.items.every((item) => /^\d+ [+-] \d+\s+___\s+\d+ [+-] \d+$/.test(item.prompt)));

  const grade1Words = buildCatalogWorksheetRuntime(
    "g1_number_word_match_to_50",
    { worksheetSeed: "g1-number-word-isolation" }
  );
  assert(grade1Words.normalizedContentObject.content.items.every((item) => item.value <= 50));
}

async function run() {
  assertCatalogParityAndCounts();
  assertRouteAndGradeIsolation();
  const uniquenessSweep = assertEquationUniquenessSweep();

  const observedSignatures = new Map(Object.values(IDS).map((id) => [id, new Set()]));
  for (let seedIndex = 0; seedIndex < 30; seedIndex += 1) {
    for (const id of Object.values(IDS)) {
      const query = { worksheetSeed: `g2-category-d-low-risk-${seedIndex}` };
      const runtime = buildCatalogWorksheetRuntime(id, query);
      const repeat = buildCatalogWorksheetRuntime(id, query);
      assertSharedContract(runtime, id);
      assert.deepStrictEqual(signature(runtime), signature(repeat));
      observedSignatures.get(id).add(JSON.stringify(signature(runtime)));
      if (id === IDS.equation) assertEquationContract(runtime);
      if (id === IDS.numberLine) assertNumberLineContract(runtime);
      if (id === IDS.numberWords) assertNumberWordContract(runtime);
    }
  }
  Object.values(IDS).forEach((id) => {
    assert(observedSignatures.get(id).size > 1, `${id} must vary across different seeds.`);
  });

  for (const id of Object.values(IDS)) {
    const runtime = buildCatalogWorksheetRuntime(id, {
      worksheetSeed: "g2-category-d-low-risk-no-example",
      includeExample: true
    });
    assert.strictEqual(runtime.normalizedContentObject.content.items.some((item) => item.isExample), false);
    const pdf = await renderRuntime(runtime);
    assert(pdf.length > 1000);
    assert.strictEqual(pageCount(pdf), 2, `${id} student + answer-key page count`);
  }

  console.log("Grade 2 equation-match uniqueness sweep:", uniquenessSweep);
  console.log("Grade 2 Category D low-risk shared-family checks passed.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
