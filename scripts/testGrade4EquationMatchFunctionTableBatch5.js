"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");
const PDFDocument = require("pdfkit");

const { getCustomizationFamilyForResource } = require("../config/worksheetCustomization");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF, buildAnswerKeyItems } = require("../renderers/pdfRenderer");

const EQUATION_ID = "grade4_addition_subtraction_facts_equation_match";
const FUNCTION_ID = "grade4_patterning_and_algebra_function_table";
const BATCH1_MISSING_ID = "grade4_patterning_and_algebra_missing_value_pattern";
const COMPARE_NUMBERS_ID = "grade4_place_value_representation_compare_numbers";
const TITLE = "Compare Equations";
const INSTRUCTION = "Write = or ≠ to compare each pair of equations.";
const FOOTER = "Grade 4 • Math • Addition & Subtraction";

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
  buffer() {
    return Buffer.concat(this.chunks);
  }
}

function items(runtime) {
  return runtime.normalizedContentObject.content.items;
}

function truth(runtime) {
  return items(runtime).map((item) => ({
    prompt: item.prompt,
    answer: item.answer,
    leftExpression: item.leftExpression,
    rightExpression: item.rightExpression,
    leftOperation: item.leftOperation,
    rightOperation: item.rightOperation,
    leftOperands: item.leftOperands,
    rightOperands: item.rightOperands,
    leftValue: item.leftValue,
    rightValue: item.rightValue,
    expectedSymbol: item.expectedSymbol,
    equalityState: item.equalityState,
    responseTarget: item.responseTarget,
    answerState: item.answerState,
    duplicateSignature: item.duplicateSignature,
    relatedDuplicateSignature: item.relatedDuplicateSignature,
    isExample: item.isExample
  }));
}

function render(runtime, includeAnswerKey = true) {
  return new Promise((resolve, reject) => {
    const response = new BufferResponse();
    response.once("finish", () => resolve(response.buffer()));
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: {
        filename: "grade4-equation-match-function-table-batch5-test.pdf",
        includeAnswerKey
      }
    });
  });
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function evaluate(operation, operands) {
  assert(Array.isArray(operands) && operands.length === 2);
  assert(operands.every(Number.isInteger));
  if (operation === "addition") return operands[0] + operands[1];
  if (operation === "subtraction") return operands[0] - operands[1];
  assert.fail(`Unsupported operation ${operation}`);
}

function assertEquationTruth(runtime, expectedEqualCount) {
  const source = items(runtime);
  const studentItems = source.filter((item) => !item.isExample);
  const signatures = new Set();
  studentItems.forEach((item) => {
    const leftValue = evaluate(item.leftOperation, item.leftOperands);
    const rightValue = evaluate(item.rightOperation, item.rightOperands);
    const expected = leftValue === rightValue ? "=" : "≠";
    assert.strictEqual(item.leftValue, leftValue);
    assert.strictEqual(item.rightValue, rightValue);
    assert.strictEqual(item.expectedSymbol, expected);
    assert.strictEqual(item.answer, expected);
    assert.strictEqual(item.equalityState, expected === "=");
    assert.strictEqual(item.comparisonResult, expected === "=" ? "equivalent" : "not_equivalent");
    assert.strictEqual(item.responseTarget, "equation_relation");
    assert.strictEqual(item.responseMode, "equation_equivalence");
    assert.deepStrictEqual(item.responseValues, [expected]);
    assert(item.prompt.includes(item.leftExpression));
    assert(item.prompt.includes(item.rightExpression));
    assert(item.prompt.includes("___"));
    assert.deepStrictEqual(item.answerState, {
      leftExpression: item.leftExpression,
      rightExpression: item.rightExpression,
      leftValue,
      rightValue,
      expectedRelation: expected,
      equalityState: expected === "="
    });
    const canonical = `equation_match:${[item.leftExpression, item.rightExpression].sort().join(" :: ")}`;
    assert.strictEqual(item.duplicateSignature, canonical);
    assert.strictEqual(item.relatedDuplicateSignature, canonical);
    assert(!signatures.has(canonical), `Duplicate or reversed equation pair: ${canonical}`);
    signatures.add(canonical);
  });
  assert.strictEqual(studentItems.filter((item) => item.answer === "=").length, expectedEqualCount);
  const preview = runtime.layout.problems;
  const key = buildAnswerKeyItems(source);
  assert.strictEqual(preview.length, source.length);
  assert.strictEqual(key.length, source.length);
  source.forEach((item, index) => {
    assert.strictEqual(preview[index].prompt, item.prompt);
    assert.strictEqual(preview[index].answer, item.answer);
    assert.strictEqual(key[index].prompt, item.prompt);
    assert.strictEqual(key[index].answer, item.answer);
    assert.strictEqual(key[index].leftExpression, item.leftExpression);
    assert.strictEqual(key[index].rightExpression, item.rightExpression);
    assert.strictEqual(key[index].leftOperation, item.leftOperation);
    assert.strictEqual(key[index].rightOperation, item.rightOperation);
    assert.deepStrictEqual(key[index].leftOperands, item.leftOperands);
    assert.deepStrictEqual(key[index].rightOperands, item.rightOperands);
    assert.deepStrictEqual(key[index].answerState, item.answerState);
  });
}

function assertPublicContract(runtime) {
  assert.strictEqual(runtime.item.status, "generated");
  assert.strictEqual(runtime.layout.header.title, TITLE);
  assert.strictEqual(runtime.contentObject.meta.title, TITLE);
  assert.strictEqual(runtime.layout.header.subtitle, "");
  assert.strictEqual(runtime.layout.instruction, INSTRUCTION);
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, FOOTER);
  assert.strictEqual(items(runtime).length, 30);
  assert.strictEqual(runtime.layout.template.columns, 2);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 30);
  assert.strictEqual(runtime.layout.display.denseGridRows, 15);
  assert.strictEqual(runtime.layout.display.equalHeightItems, true);
  assert.strictEqual(runtime.layout.display.sequentialColumnFill, true);
  assert.strictEqual(runtime.layout.display.hideItemSeparators, true);
  assert.strictEqual(runtime.layout.display.equationComparisonLayout, true);
  assert.strictEqual(runtime.layout.display.equationComparisonExampleStrip, true);
  assert.strictEqual(runtime.layout.display.equationComparisonFixedZones, true);
  assert.strictEqual(runtime.layout.display.equationComparisonCenteredTarget, true);
  assert.strictEqual(runtime.layout.display.equationComparisonFontSize, 12);
  assert.strictEqual(runtime.layout.display.equationComparisonMinimumFontSize, 12);
  assert.strictEqual(runtime.layout.display.equationComparisonNumberFontSize, 11);
  assert.strictEqual(runtime.layout.display.answerTargetVariant, "comparisonSymbol");
  const publicText = JSON.stringify({
    title: runtime.layout.header.title,
    instruction: runtime.layout.instruction,
    footer: runtime.contentObject.meta.curriculum.footerText,
    prompts: items(runtime).map((item) => item.prompt)
  });
  assert(!publicText.includes(EQUATION_ID));
  assert(!publicText.includes("Equation Match — Grade 4"));
  assert(!publicText.includes("Students "));
  assert(!publicText.includes("addition_subtraction_facts"));
}

function assertFamilyLayoutInheritance() {
  const lowerGradeIds = [
    "grade1_addition_subtraction_facts_equation_match",
    "grade2_addition_subtraction_facts_equation_match",
    "grade3_addition_subtraction_facts_equation_match"
  ];
  const lowerLayouts = lowerGradeIds.map((id) => buildCatalogWorksheetRuntime(id, {
    worksheetSeed: "grade4-batch5-family-inheritance"
  }).layout);
  lowerLayouts.forEach((layout) => {
    assert.strictEqual(layout.template.columns, 2);
    assert.strictEqual(layout.template.maxProblemsPerPage, 20);
    assert.strictEqual(layout.display.denseGridRows, 10);
    assert.strictEqual(layout.display.answerTargetVariant, "comparisonSymbol");
    assert.strictEqual(layout.display.standardShortAnswerTarget, true);
    assert.strictEqual(layout.display.equalHeightItems, true);
    assert.strictEqual(layout.display.sequentialColumnFill, true);
    assert.strictEqual(layout.display.hideItemSeparators, true);
  });

  const grade4 = buildCatalogWorksheetRuntime(EQUATION_ID, {
    worksheetSeed: "grade4-batch5-family-inheritance"
  }).layout;
  assert.strictEqual(grade4.template.columns, 2);
  assert.strictEqual(grade4.template.maxProblemsPerPage, 30);
  assert.strictEqual(grade4.display.denseGridRows, 15);
  for (const property of [
    "answerTargetVariant",
    "standardShortAnswerTarget",
    "equalHeightItems",
    "sequentialColumnFill",
    "hideItemSeparators"
  ]) {
    assert.strictEqual(
      grade4.display[property],
      lowerLayouts[2].display[property],
      `Grade 4 must inherit the Grade 3 Equation Match ${property} contract.`
    );
  }

  const compareNumbers = buildCatalogWorksheetRuntime(COMPARE_NUMBERS_ID, {
    worksheetSeed: "grade4-batch5-layout-class"
  });
  assert.strictEqual(items(compareNumbers).length, 30);
  assert.strictEqual(compareNumbers.layout.template.columns, 3);
  assert.strictEqual(compareNumbers.layout.template.maxProblemsPerPage, 30);
  assert.strictEqual(compareNumbers.layout.display.denseGridRows, 10);
  assert.strictEqual(compareNumbers.layout.display.sequentialColumnFill, true);
  assert.strictEqual(grade4.template.maxProblemsPerPage, compareNumbers.layout.template.maxProblemsPerPage);
}

function assertExpressionWidthSafety() {
  const runtime = buildCatalogWorksheetRuntime(EQUATION_ID, {
    worksheetSeed: "grade4-batch5-expression-width"
  });
  const display = runtime.layout.display;
  const columnWidth = (504 - 24 * 2) / 3;
  const equationWidth =
    display.equationComparisonExpressionWidth * 2 +
    display.equationComparisonTargetWidth +
    display.equationComparisonGap * 2;
  assert(equationWidth <= columnWidth - display.equationComparisonNumberGutter + 0.01);
  assert(display.equationComparisonFontSize >= display.equationComparisonMinimumFontSize);
  assert(columnWidth - display.equationComparisonNumberGutter - equationWidth >= -0.01);

  const document = new PDFDocument({ autoFirstPage: false });
  document.registerFont(
    "Grade4EquationWidth",
    path.join(__dirname, "..", "public", "fonts", "SourceSans3", "SourceSans3-Regular.ttf")
  );
  document.font("Grade4EquationWidth").fontSize(display.equationComparisonFontSize);
  [
    "557 + 1,434",
    "1,116 + 715",
    "1,901 - 25",
    "2,049 - 75",
    "1,406 + 445",
    "2,000 - 50"
  ].forEach((expression) => {
    assert(
      document.widthOfString(expression) <= display.equationComparisonExpressionWidth + 0.01,
      `${expression} exceeds the fixed Grade 4 expression zone.`
    );
  });

  const boundary = buildCatalogWorksheetRuntime(EQUATION_ID, {
    worksheetSeed: "grade4-batch5-expression-boundary",
    questionCount: 60,
    questionsPerPage: 30,
    minimumResult: 1800,
    maximumResult: 2000,
    equalPairs: 30
  });
  items(boundary).forEach((item) => {
    [item.leftExpression, item.rightExpression].forEach((expression) => {
      assert(
        document.widthOfString(expression) <= display.equationComparisonExpressionWidth + 0.01,
        `${expression} exceeds the fixed Grade 4 expression zone.`
      );
    });
  });
  document.fontSize(display.equationComparisonNumberFontSize);
  assert(
    document.widthOfString("30)") <= display.equationComparisonNumberGutter - 4,
    "Two-digit question numbers must remain on one line."
  );

  const letterHeight = 792;
  const headerAndInstructionAllowance = 150;
  const footerAllowance = 62;
  const availableGridHeight = letterHeight - headerAndInstructionAllowance - footerAllowance;
  const rowHeight = availableGridHeight / display.denseGridRows;
  assert(rowHeight >= 38, "The 2×15 grid must retain at least 38 points per row.");
  assert(rowHeight > display.equationComparisonFontSize * 3);
}

function operationTemplateCounts(runtime) {
  const counts = {
    addition_addition: 0,
    subtraction_subtraction: 0,
    addition_subtraction: 0
  };
  items(runtime).filter((item) => !item.isExample).forEach((item) => {
    const template = `${item.leftOperation}_${item.rightOperation}`;
    assert(Object.prototype.hasOwnProperty.call(counts, template), `Unexpected operation template ${template}`);
    counts[template] += 1;
  });
  return counts;
}

async function assertDefaultsAndSeeds() {
  const variation = new Set();
  let sameSeedFailures = 0;
  for (let seed = 1; seed <= 30; seed += 1) {
    const options = { worksheetSeed: `grade4-batch5-equation-${seed}` };
    const first = buildCatalogWorksheetRuntime(EQUATION_ID, options);
    const second = buildCatalogWorksheetRuntime(EQUATION_ID, options);
    if (JSON.stringify(truth(first)) !== JSON.stringify(truth(second))) sameSeedFailures += 1;
    assertPublicContract(first);
    assertEquationTruth(first, 15);
    assert.deepStrictEqual(operationTemplateCounts(first), {
      addition_addition: 10,
      subtraction_subtraction: 10,
      addition_subtraction: 10
    });
    for (const template of Object.keys(operationTemplateCounts(first))) {
      const templateItems = items(first).filter(
        (item) => `${item.leftOperation}_${item.rightOperation}` === template
      );
      assert.strictEqual(templateItems.filter((item) => item.answer === "=").length, 5);
      assert.strictEqual(templateItems.filter((item) => item.answer === "≠").length, 5);
    }
    variation.add(JSON.stringify(truth(first)));
  }
  assert.strictEqual(sameSeedFailures, 0);
  assert(variation.size > 1, "Different Grade 4 equation-comparison seeds must vary.");

  const runtime = buildCatalogWorksheetRuntime(EQUATION_ID, { worksheetSeed: "grade4-batch5-default-pdf" });
  assert.strictEqual(pageCount(await render(runtime)), 2);
  assert.strictEqual(pageCount(await render(runtime, false)), 1);
}

async function assertVariablesAndExamples() {
  const selectedMixed = buildCatalogWorksheetRuntime(EQUATION_ID, {
    worksheetSeed: "grade4-batch5-alias-consumption",
    questionCount: 30,
    selectedOperations: ["addition", "subtraction"],
    equalPairs: "15"
  });
  const explicitMixed = buildCatalogWorksheetRuntime(EQUATION_ID, {
    worksheetSeed: "grade4-batch5-alias-consumption",
    questionCount: 30,
    operationMode: "mixed",
    equalPairs: 15
  });
  const equalityCountString = buildCatalogWorksheetRuntime(EQUATION_ID, {
    worksheetSeed: "grade4-batch5-alias-consumption",
    questionCount: 30,
    operationMode: "mixed",
    equalityCount: "15"
  });
  assert.deepStrictEqual(
    truth(selectedMixed),
    truth(explicitMixed),
    "Selecting addition and subtraction must normalize to the explicit mixed-operation contract."
  );
  assert.deepStrictEqual(
    truth(equalityCountString),
    truth(explicitMixed),
    "String and numeric equality-count aliases must normalize to the same integer contract."
  );
  assertEquationTruth(selectedMixed, 15);
  assert.deepStrictEqual(
    new Set(items(selectedMixed).map((item) => `${item.leftOperation}:${item.rightOperation}`)),
    new Set(["addition:addition", "subtraction:subtraction", "addition:subtraction"])
  );

  const ranged = buildCatalogWorksheetRuntime(EQUATION_ID, {
    worksheetSeed: "grade4-batch5-ranged",
    questionCount: 8,
    questionsPerPage: 8,
    minimumResult: 300,
    maximumResult: 600,
    equalityCount: 3,
    selectedOperations: ["addition"]
  });
  assert.strictEqual(items(ranged).length, 8);
  assertEquationTruth(ranged, 3);
  items(ranged).forEach((item) => {
    assert(item.leftValue >= 300 && item.leftValue <= 600);
    assert(item.rightValue >= 300 && item.rightValue <= 600);
    assert.strictEqual(item.leftOperation, "addition");
    assert.strictEqual(item.rightOperation, "addition");
  });

  const subtraction = buildCatalogWorksheetRuntime(EQUATION_ID, {
    worksheetSeed: "grade4-batch5-subtraction",
    questionCount: 8,
    minResult: 1000,
    maxResult: 2000,
    operationMode: "subtraction",
    includeEqualPairs: false
  });
  assertEquationTruth(subtraction, 0);
  items(subtraction).forEach((item) => {
    assert.strictEqual(item.leftOperation, "subtraction");
    assert.strictEqual(item.rightOperation, "subtraction");
    assert(item.prompt.includes(","));
  });

  for (const [index, alias] of ["includeExample", "completedExample", "example"].entries()) {
    const runtime = buildCatalogWorksheetRuntime(EQUATION_ID, {
      worksheetSeed: `grade4-batch5-example-${index}`,
      [alias]: true
    });
    assert.strictEqual(items(runtime).length, 31);
    assert.strictEqual(items(runtime).filter((item) => item.isExample).length, 1);
    assert.strictEqual(items(runtime).filter((item) => !item.isExample).length, 30);
    assert.strictEqual(runtime.layout.template.columns, 2);
    assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 30);
    assert.strictEqual(runtime.layout.display.denseGridRows, 15);
    assertEquationTruth(runtime, 15);
    assert.strictEqual(pageCount(await render(runtime)), 2);
  }

  const maximum = buildCatalogWorksheetRuntime(EQUATION_ID, {
    worksheetSeed: "grade4-batch5-maximum",
    questionCount: 60,
    questionsPerPage: 30,
    equalPairs: 30
  });
  assert.strictEqual(items(maximum).length, 60);
  assert.strictEqual(maximum.layout.template.columns, 3);
  assert.strictEqual(maximum.layout.template.maxProblemsPerPage, 30);
  assert.strictEqual(maximum.layout.display.denseGridRows, 10);
  assertEquationTruth(maximum, 30);
  assert.deepStrictEqual(operationTemplateCounts(maximum), {
    addition_addition: 20,
    subtraction_subtraction: 20,
    addition_subtraction: 20
  });
  assert.strictEqual(pageCount(await render(maximum)), 4);
}

function assertInvalidInputs() {
  const invalid = [
    { questionCount: 0 },
    { questionCount: 61 },
    { questionCount: 12.5 },
    { questionsPerPage: 0 },
    { questionsPerPage: 31 },
    { minimumResult: -1 },
    { maximumResult: 2001 },
    { minimumResult: 500, maximumResult: 500 },
    { minimumResult: 600, maximumResult: 500 },
    { minimumResult: 100.5 },
    { includeEqualPairs: "sometimes" },
    { includeEqualPairs: false, equalPairs: 1 },
    { questionCount: 6, equalPairs: 7 },
    { operationMode: "multiplication" },
    { selectedOperations: ["division"] },
    { selectedOperations: [] },
    { selectedOperations: ["addition", "addition"] },
    { operationMode: "addition", selectedOperations: ["subtraction"] },
    { operationMode: "addition", selectedOperations: ["addition", "subtraction"] },
    { includeExample: "sometimes" },
    { includeExample: true, completedExample: false },
    { minA: 10 },
    { maximumOperand: 500 },
    { selectedNumbers: [100, 200] },
    { onlyNumbers: "" },
    { relation: "=" },
    { selectedRelations: ["=", "≠"] },
    { expression: "100 + 200" },
    { leftExpression: "100 + 200" },
    { rightOperands: [100, 200] },
    { leftValue: 300 },
    { expectedSymbol: "=" },
    { answer: "=" },
    { answerState: { expectedRelation: "=" } },
    { responseTarget: "equation_relation" },
    { duplicateSignature: "caller-owned" },
    {
      questionCount: 60,
      minimumResult: 100,
      maximumResult: 102,
      operationMode: "addition",
      equalPairs: 30
    }
  ];
  invalid.forEach((options) => {
    assert.throws(
      () => buildCatalogWorksheetRuntime(EQUATION_ID, {
        worksheetSeed: "grade4-batch5-invalid",
        ...options
      }),
      `Expected rejection for ${JSON.stringify(options)}`
    );
  });
}

function assertFunctionTableDecisionAndIsolation() {
  const functionTable = buildCatalogWorksheetRuntime(FUNCTION_ID, {
    worksheetSeed: "grade4-batch5-function-audit"
  });
  const missingPattern = buildCatalogWorksheetRuntime(BATCH1_MISSING_ID, {
    worksheetSeed: "grade4-batch5-function-audit"
  });
  assert.strictEqual(functionTable.item.status, "generated");
  assert.strictEqual(functionTable.layout.header.title, "Function Table — Grade 4");
  assert.strictEqual(items(functionTable).length, 12);
  assert(items(functionTable).every((item) => item.prompt.startsWith("Function table: input ")));
  assert(items(functionTable).every((item) => item.answerState === null));
  assert(items(functionTable).every((item) => item.duplicateSignature === null));
  assert.strictEqual(Boolean(functionTable.layout.display.functionTableLayout), false);
  assert.strictEqual(missingPattern.layout.header.title, "Find the Missing Values");
  assert.strictEqual(missingPattern.layout.display.patterningLayout, "missing_value_pattern");
  assert(items(missingPattern).every((item) => Array.isArray(item.sequence)));
  assert(items(missingPattern).every((item) => !item.prompt.startsWith("Function table:")));
  assert.notDeepStrictEqual(
    items(functionTable).map((item) => item.prompt),
    items(missingPattern).map((item) => item.prompt),
    "Function Table is distinct from Batch 1 sequence completion, but lacks approved table architecture."
  );

  const grade3Equation = buildCatalogWorksheetRuntime(
    "grade3_addition_subtraction_facts_equation_match",
    { worksheetSeed: "grade4-batch5-isolation" }
  );
  assert.strictEqual(grade3Equation.layout.header.title, "Equal or Not Equal?");
  assert.strictEqual(grade3Equation.layout.template.columns, 2);
  assert.strictEqual(items(grade3Equation).length, 20);
  items(grade3Equation).forEach((item) => {
    assert(item.leftValue >= 0 && item.leftValue <= 100);
    assert(item.rightValue >= 0 && item.rightValue <= 100);
  });
  assert.strictEqual(getCustomizationFamilyForResource(EQUATION_ID), null);
  assert.strictEqual(getCustomizationFamilyForResource(FUNCTION_ID), null);
  assert.strictEqual(getCustomizationFamilyForResource(BATCH1_MISSING_ID), null);
}

function assertDocumentationDecision() {
  const plan = fs.readFileSync("docs/grade-4-founder-review-batch-plan.md", "utf8");
  assert(plan.includes("Function Table"));
}

async function run() {
  assertFamilyLayoutInheritance();
  assertExpressionWidthSafety();
  await assertDefaultsAndSeeds();
  await assertVariablesAndExamples();
  assertInvalidInputs();
  assertFunctionTableDecisionAndIsolation();
  assertDocumentationDecision();
  console.log("Grade 4 Batch 5 focused checks passed: Equation Match 30 seeds, same-seed failures 0, defaults 30 questions in a 2×15 grid and 2 PDF pages, maximum 60 questions; Function Table remains an architecture deferral.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
