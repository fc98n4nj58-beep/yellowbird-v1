"use strict";

const assert = require("assert");
const path = require("path");
const { Writable } = require("stream");
const PDFDocument = require("pdfkit");

const { getCustomizationFamilyForResource } = require("../config/worksheetCustomization");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF, buildAnswerKeyItems } = require("../renderers/pdfRenderer");

const IDS = Object.freeze({
  equations: "grade5_addition_subtraction_facts_equation_match",
  numbers: "grade5_place_value_representation_compare_numbers"
});

const SPECS = Object.freeze({
  [IDS.equations]: {
    title: "Compare Equations",
    instruction: "Write = or ≠ to compare each pair of equations.",
    footer: "Grade 5 • Math • Addition & Subtraction",
    count: 30,
    maximum: 60,
    perPage: 30,
    columns: 2,
    rows: 15
  },
  [IDS.numbers]: {
    title: "Compare Numbers",
    instruction: "Write >, <, or = to compare each pair of numbers.",
    footer: "Grade 5 • Math • Place Value",
    count: 30,
    maximum: 60,
    perPage: 30,
    columns: 3,
    rows: 10
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
        filename: "grade5-compact-relational-batch2-test.pdf",
        includeAnswerKey
      }
    });
  });
}

function renderWithTextTrace(runtime) {
  const trace = [];
  const originalAddPage = PDFDocument.prototype.addPage;
  const originalText = PDFDocument.prototype.text;

  PDFDocument.prototype.addPage = function tracedAddPage(...args) {
    this.__grade5Batch2TracePage = (this.__grade5Batch2TracePage || 0) + 1;
    return originalAddPage.apply(this, args);
  };
  PDFDocument.prototype.text = function tracedText(text, x, y, options) {
    trace.push({
      page: this.__grade5Batch2TracePage || 1,
      text: String(text),
      x: Number(x),
      y: Number(y),
      width: Number(options?.width)
    });
    return originalText.call(this, text, x, y, options);
  };

  return render(runtime).then(
    (buffer) => ({ buffer, trace }),
    (error) => { throw error; }
  ).finally(() => {
    PDFDocument.prototype.addPage = originalAddPage;
    PDFDocument.prototype.text = originalText;
  });
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function assertPublicContract(id, runtime) {
  const spec = SPECS[id];
  assert.strictEqual(runtime.item.status, "generated");
  assert.strictEqual(getCustomizationFamilyForResource(id), null);
  assert.strictEqual(runtime.layout.header.title, spec.title);
  assert.strictEqual(runtime.contentObject.meta.title, spec.title);
  assert.strictEqual(runtime.layout.header.subtitle, "");
  assert.strictEqual(runtime.layout.instruction, spec.instruction);
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, spec.footer);
  assert.strictEqual(items(runtime).filter((item) => !item.isExample).length, spec.count);
  assert.strictEqual(runtime.layout.template.columns, spec.columns);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, spec.perPage);
  assert.strictEqual(runtime.layout.display.denseGridRows, spec.rows);
  assert.strictEqual(runtime.layout.display.equalHeightItems, true);
  assert.strictEqual(runtime.layout.display.sequentialColumnFill, true);
  assert.strictEqual(runtime.layout.display.hideItemSeparators, true);
  assert.strictEqual(runtime.layout.display.answerTargetVariant, "comparisonSymbol");
  const publicText = [
    runtime.layout.header.title,
    runtime.layout.instruction,
    runtime.contentObject.meta.curriculum.footerText,
    ...items(runtime).map((item) => item.prompt)
  ].join(" ");
  assert(!publicText.includes(id));
  assert(!publicText.includes(" — Grade 5"));
  assert(!publicText.includes("Students "));
  assert(!publicText.includes("addition_subtraction_facts"));
  assert(!publicText.includes("place_value_representation"));
}

function evaluate(operation, operands) {
  assert(Array.isArray(operands) && operands.length === 2);
  assert(operands.every(Number.isInteger));
  if (operation === "addition") return operands[0] + operands[1];
  if (operation === "subtraction") return operands[0] - operands[1];
  assert.fail(`Unsupported operation: ${operation}`);
}

function assertEquationTruth(runtime, expectedEqualCount) {
  const source = items(runtime).filter((item) => !item.isExample);
  const signatures = new Set();
  source.forEach((item) => {
    const leftValue = evaluate(item.leftOperation, item.leftOperands);
    const rightValue = evaluate(item.rightOperation, item.rightOperands);
    const expected = leftValue === rightValue ? "=" : "≠";
    assert.strictEqual(item.leftValue, leftValue);
    assert.strictEqual(item.rightValue, rightValue);
    assert.strictEqual(item.expectedSymbol, expected);
    assert.strictEqual(item.answer, expected);
    assert.strictEqual(item.equalityState, expected === "=");
    assert.strictEqual(item.responseTarget, "equation_relation");
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
  assert.strictEqual(source.filter((item) => item.answer === "=").length, expectedEqualCount);
}

function assertNumberTruth(runtime, expectedCounts) {
  const source = items(runtime).filter((item) => !item.isExample);
  const counts = { "<": 0, ">": 0, "=": 0 };
  const signatures = new Set();
  source.forEach((item) => {
    const expected = item.leftValue < item.rightValue ? "<" : item.leftValue > item.rightValue ? ">" : "=";
    counts[expected] += 1;
    assert.strictEqual(item.expectedSymbol, expected);
    assert.strictEqual(item.comparisonResult, expected);
    assert.strictEqual(item.answer, expected);
    assert.strictEqual(item.equalityState, expected === "=");
    assert.strictEqual(item.responseTarget, "comparison_symbol");
    assert.deepStrictEqual(item.answerState, {
      leftValue: item.leftValue,
      rightValue: item.rightValue,
      expectedSymbol: expected,
      equalityState: expected === "="
    });
    assert(item.prompt.includes(item.leftValue.toLocaleString("en-CA")));
    assert(item.prompt.includes(item.rightValue.toLocaleString("en-CA")));
    assert(!signatures.has(item.duplicateSignature), `Duplicate or reversed number pair: ${item.duplicateSignature}`);
    signatures.add(item.duplicateSignature);
  });
  assert.deepStrictEqual(counts, expectedCounts);
}

function assertParity(runtime) {
  const source = items(runtime);
  const preview = runtime.layout.problems;
  const key = buildAnswerKeyItems(source);
  assert.strictEqual(preview.length, source.length);
  assert.strictEqual(key.length, source.length);
  source.forEach((item, index) => {
    assert.strictEqual(preview[index].prompt, item.prompt);
    assert.strictEqual(preview[index].answer, item.answer);
    assert.strictEqual(key[index].prompt, item.prompt);
    assert.strictEqual(key[index].answer, item.answer);
    assert.deepStrictEqual(key[index].answerState, item.answerState);
    assert.strictEqual(key[index].duplicateSignature, item.duplicateSignature);
  });
}

async function assertGeometry() {
  const equation = buildCatalogWorksheetRuntime(IDS.equations, {
    worksheetSeed: "grade5-batch2-equation-width",
    questionCount: 60,
    questionsPerPage: 30,
    minimumResult: 9000,
    maximumResult: 10000,
    equalPairs: 30
  });
  const equationDisplay = equation.layout.display;
  const equationColumnWidth = (504 - 24) / 2;
  const equationZones =
    equationDisplay.equationComparisonExpressionWidth * 2 +
    equationDisplay.equationComparisonTargetWidth +
    equationDisplay.equationComparisonGap * 2;
  assert(equationZones <= equationColumnWidth - equationDisplay.equationComparisonNumberGutter);
  assert.strictEqual(equationDisplay.equationComparisonFontSize, 12);
  assert.strictEqual(equationDisplay.equationComparisonMinimumFontSize, 12);

  const comparison = buildCatalogWorksheetRuntime(IDS.numbers, {
    worksheetSeed: "grade5-batch2-number-width",
    selectedNumbers: Array.from({ length: 31 }, (_, index) => 99970 + index),
    questionCount: 30,
    equalPairs: 10
  });
  const comparisonDisplay = comparison.layout.display;
  const comparisonColumnWidth = (504 - 48) / 3;
  const comparisonZones =
    comparisonDisplay.comparisonOperandWidth * 2 +
    comparisonDisplay.comparisonTargetWidth +
    comparisonDisplay.comparisonGap * 2;
  assert(comparisonZones <= comparisonColumnWidth - comparisonDisplay.comparisonNumberGutter);

  const document = new PDFDocument({ autoFirstPage: false });
  document.registerFont(
    "Grade5Batch2Width",
    path.join(__dirname, "..", "public", "fonts", "SourceSans3", "SourceSans3-Regular.ttf")
  );
  document.font("Grade5Batch2Width").fontSize(equationDisplay.equationComparisonFontSize);
  let longestExpressionWidth = 0;
  items(equation).forEach((item) => {
    [item.leftExpression, item.rightExpression].forEach((expression) => {
      const expressionWidth = document.widthOfString(expression);
      longestExpressionWidth = Math.max(longestExpressionWidth, expressionWidth);
      assert(
        expressionWidth <= equationDisplay.equationComparisonExpressionWidth + 0.01,
        `${expression} exceeds the Grade 5 equation zone.`
      );
    });
  });
  assert(longestExpressionWidth <= 64.5);
  assert(equationDisplay.equationComparisonExpressionWidth - longestExpressionWidth >= 27.5);
  document.fontSize(comparisonDisplay.comparisonFontSize);
  assert(
    document.widthOfString("100,000") <= comparisonDisplay.comparisonOperandWidth,
    "Six-digit comma-formatted numerals must fit the fixed comparison zone."
  );

  const tenRowBaseline = buildCatalogWorksheetRuntime(IDS.equations, {
    worksheetSeed: "grade5-batch2-equation-ten-row-baseline",
    questionCount: 20,
    questionsPerPage: 20,
    equalPairs: 10
  });
  tenRowBaseline.layout.display = {
    ...tenRowBaseline.layout.display,
    denseGridRows: 10
  };
  const tenRowTrace = await renderWithTextTrace(tenRowBaseline);
  const tenRowStudentNumbers = [...new Set(
    tenRowTrace.trace
      .filter((entry) => entry.page === 1 && /^\d+\)$/.test(entry.text))
      .map((entry) => entry.y)
  )].sort((a, b) => a - b);
  assert.strictEqual(tenRowStudentNumbers.length, 10);
  assert(Math.abs(tenRowStudentNumbers[1] - tenRowStudentNumbers[0] - 54.8) < 0.01);

  const defaultTrace = await renderWithTextTrace(equation);
  const defaultStudentNumbers = defaultTrace.trace
    .filter((entry) => entry.page === 1 && /^\d+\)$/.test(entry.text))
    .map((entry) => entry.y);
  const defaultKeyNumbers = defaultTrace.trace
    .filter((entry) => entry.page === 3 && /^\d+\)$/.test(entry.text))
    .map((entry) => entry.y);
  const uniqueStudentRows = [...new Set(defaultStudentNumbers)].sort((a, b) => a - b);
  const uniqueKeyRows = [...new Set(defaultKeyNumbers)].sort((a, b) => a - b);
  assert.strictEqual(uniqueStudentRows.length, 15);
  assert.strictEqual(uniqueKeyRows.length, 15);

  const studentRowHeight = uniqueStudentRows[1] - uniqueStudentRows[0];
  const keyRowHeight = uniqueKeyRows[1] - uniqueKeyRows[0];
  const studentContentTop = uniqueStudentRows[0] - 5;
  const keyContentTop = uniqueKeyRows[0] - 5;
  const bottomContentY = 714;
  const minimumSafeRowHeight = 30;
  assert(Math.abs(studentRowHeight - 36.5333333333) < 0.01);
  assert(Math.abs(keyRowHeight - 36.5333333333) < 0.01);
  assert(Math.abs(bottomContentY - studentContentTop - 548) < 0.01);
  assert(Math.abs(bottomContentY - keyContentTop - 548) < 0.01);
  assert(studentRowHeight >= minimumSafeRowHeight);
  assert(keyRowHeight >= minimumSafeRowHeight);

  const exampleRuntime = buildCatalogWorksheetRuntime(IDS.equations, {
    worksheetSeed: "grade5-batch2-equation-example-geometry",
    includeExample: true,
    minimumResult: 9000,
    maximumResult: 10000
  });
  const exampleTrace = await renderWithTextTrace(exampleRuntime);
  const exampleStudentRows = [...new Set(
    exampleTrace.trace
      .filter((entry) => entry.page === 1 && /^\d+\)$/.test(entry.text))
      .map((entry) => entry.y)
  )].sort((a, b) => a - b);
  assert.strictEqual(exampleStudentRows.length, 15);
  const exampleRowHeight = exampleStudentRows[1] - exampleStudentRows[0];
  const exampleDisplacement = exampleStudentRows[0] - uniqueStudentRows[0];
  const lastExampleResponseLineY =
    (exampleStudentRows[0] - 5) + 14 * exampleRowHeight + 20;
  assert(Math.abs(exampleRowHeight - 32.2666666667) < 0.01);
  assert(Math.abs(exampleDisplacement - 64) < 0.01);
  assert(exampleRowHeight >= minimumSafeRowHeight);
  assert(bottomContentY - lastExampleResponseLineY >= 11.7);
  assert.strictEqual(pageCount(exampleTrace.buffer), 2);
}

async function assertDefaultsAndSeeds() {
  const variations = { equations: new Set(), numbers: new Set() };
  let sameSeedFailures = 0;
  for (let seed = 1; seed <= 30; seed += 1) {
    for (const [key, id] of Object.entries(IDS)) {
      const options = { worksheetSeed: `grade5-batch2-${key}-${seed}` };
      const first = buildCatalogWorksheetRuntime(id, options);
      const second = buildCatalogWorksheetRuntime(id, options);
      if (JSON.stringify(truth(first)) !== JSON.stringify(truth(second))) sameSeedFailures += 1;
      assertPublicContract(id, first);
      if (id === IDS.equations) assertEquationTruth(first, 15);
      else assertNumberTruth(first, { "<": 10, ">": 10, "=": 10 });
      assertParity(first);
      variations[key].add(JSON.stringify(truth(first)));
    }
  }
  assert.strictEqual(sameSeedFailures, 0);
  assert(variations.equations.size > 1);
  assert(variations.numbers.size > 1);
  assert.strictEqual(pageCount(await render(buildCatalogWorksheetRuntime(IDS.equations, { worksheetSeed: "g5-b2-eq-pdf" }))), 2);
  assert.strictEqual(pageCount(await render(buildCatalogWorksheetRuntime(IDS.numbers, { worksheetSeed: "g5-b2-num-pdf" }))), 2);
}

async function assertVariablesAndMaximums() {
  const mixedAliases = buildCatalogWorksheetRuntime(IDS.equations, {
    worksheetSeed: "g5-b2-equation-alias",
    selectedOperations: ["addition", "subtraction"],
    equalityCount: "8"
  });
  const mixedCanonical = buildCatalogWorksheetRuntime(IDS.equations, {
    worksheetSeed: "g5-b2-equation-alias",
    operationMode: "mixed",
    equalPairs: 8
  });
  assert.deepStrictEqual(truth(mixedAliases), truth(mixedCanonical));
  assertEquationTruth(mixedAliases, 8);

  for (const operationMode of ["addition", "subtraction"]) {
    const runtime = buildCatalogWorksheetRuntime(IDS.equations, {
      worksheetSeed: `g5-b2-${operationMode}`,
      questionCount: 12,
      questionsPerPage: 12,
      minimumResult: 2000,
      maximumResult: 4000,
      operationMode,
      includeEqualPairs: false
    });
    assertEquationTruth(runtime, 0);
    items(runtime).forEach((item) => {
      assert.strictEqual(item.leftOperation, operationMode);
      assert.strictEqual(item.rightOperation, operationMode);
    });
  }

  const selectedNumbers = Array.from({ length: 31 }, (_, index) => 70000 + index * 1000);
  const selected = buildCatalogWorksheetRuntime(IDS.numbers, {
    worksheetSeed: "g5-b2-selected-numbers",
    selectedValues: selectedNumbers,
    equalPairs: "10"
  });
  assertNumberTruth(selected, { "<": 10, ">": 10, "=": 10 });
  items(selected).forEach((item) => {
    assert(selectedNumbers.includes(item.leftValue));
    assert(selectedNumbers.includes(item.rightValue));
  });

  const noEquals = buildCatalogWorksheetRuntime(IDS.numbers, {
    worksheetSeed: "g5-b2-no-equals",
    includeEqualPairs: false
  });
  assertNumberTruth(noEquals, { "<": 15, ">": 15, "=": 0 });

  for (const id of Object.values(IDS)) {
    for (const [index, alias] of ["includeExample", "completedExample", "example"].entries()) {
      const runtime = buildCatalogWorksheetRuntime(id, {
        worksheetSeed: `g5-b2-example-${id}-${index}`,
        [alias]: true
      });
      assert.strictEqual(items(runtime).filter((item) => item.isExample).length, 1);
      assert.strictEqual(items(runtime).filter((item) => !item.isExample).length, SPECS[id].count);
      assertParity(runtime);
      if (index === 0) {
        assert.strictEqual(
          pageCount(await render(runtime)),
          2,
          `${id} completed example must remain additional without adding a sparse page.`
        );
      }
    }
  }

  const equationMaximum = buildCatalogWorksheetRuntime(IDS.equations, {
    worksheetSeed: "g5-b2-equation-maximum",
    questionCount: 60,
    questionsPerPage: 30,
    equalPairs: 30
  });
  assertEquationTruth(equationMaximum, 30);
  assert.strictEqual(pageCount(await render(equationMaximum)), 4);

  const numberMaximum = buildCatalogWorksheetRuntime(IDS.numbers, {
    worksheetSeed: "g5-b2-number-maximum",
    questionCount: 60,
    questionsPerPage: 30,
    equalPairs: 20
  });
  assertNumberTruth(numberMaximum, { "<": 20, ">": 20, "=": 20 });
  assert.strictEqual(pageCount(await render(numberMaximum)), 4);
}

function assertInvalidInputs() {
  const equationInvalid = [
    { questionCount: 0 },
    { questionCount: 61 },
    { questionCount: 2.5 },
    { questionsPerPage: 31 },
    { minimumResult: -1 },
    { maximumResult: 10001 },
    { minimumResult: 5000, maximumResult: 5000 },
    { minimumResult: 6000, maximumResult: 5000 },
    { includeEqualPairs: "sometimes" },
    { includeEqualPairs: false, equalPairs: 1 },
    { questionCount: 8, equalPairs: 9 },
    { operationMode: "multiplication" },
    { selectedOperations: [] },
    { selectedOperations: ["division"] },
    { selectedOperations: ["addition", "addition"] },
    { operationMode: "addition", selectedOperations: ["subtraction"] },
    { includeExample: "sometimes" },
    { includeExample: true, completedExample: false },
    { selectedNumbers: [1000, 2000] },
    { leftExpression: "1000 + 2000" },
    { expectedSymbol: "=" },
    { answer: "=" },
    { answerState: { expectedRelation: "=" } },
    { duplicateSignature: "caller-owned" },
    { questionCount: 60, minimumResult: 1000, maximumResult: 1002 }
  ];
  equationInvalid.forEach((options) => {
    assert.throws(() => buildCatalogWorksheetRuntime(IDS.equations, {
      worksheetSeed: "g5-b2-invalid-equation",
      ...options
    }), `Equation comparison should reject ${JSON.stringify(options)}`);
  });

  const numberInvalid = [
    { questionCount: 0 },
    { questionCount: 61 },
    { questionCount: 12.5 },
    { questionsPerPage: 31 },
    { minValue: -1 },
    { maxValue: 100001 },
    { minValue: 50000, maxValue: 50000 },
    { selectedNumbers: [] },
    { selectedNumbers: [10000, 10000] },
    { selectedNumbers: [9999, 10000] },
    { selectedNumbers: [10000, 20000], selectedValues: [10000, 30000] },
    { includeEqualPairs: "sometimes" },
    { includeEqualPairs: false, equalPairs: 1 },
    { questionCount: 10, equalPairs: 3 },
    { questionCount: 30, selectedNumbers: [10000, 20000] },
    { operationMode: "addition" },
    { relation: "<" },
    { leftValue: 10000 },
    { expectedSymbol: "=" },
    { answer: "=" },
    { answerState: { expectedSymbol: "=" } },
    { includeExample: "sometimes" }
  ];
  numberInvalid.forEach((options) => {
    assert.throws(() => buildCatalogWorksheetRuntime(IDS.numbers, {
      worksheetSeed: "g5-b2-invalid-number",
      ...options
    }), `Number comparison should reject ${JSON.stringify(options)}`);
  });
}

function assertIsolation() {
  const lowerEquationIds = [
    "grade1_addition_subtraction_facts_equation_match",
    "grade2_addition_subtraction_facts_equation_match",
    "grade3_addition_subtraction_facts_equation_match",
    "grade4_addition_subtraction_facts_equation_match"
  ];
  const lowerEquationCounts = [12, 12, 12, 30];
  lowerEquationIds.forEach((id, index) => {
    const runtime = buildCatalogWorksheetRuntime(id, { worksheetSeed: "g5-b2-equation-isolation" });
    assert.strictEqual(items(runtime).filter((item) => !item.isExample).length, lowerEquationCounts[index]);
  });

  const grade2Numbers = buildCatalogWorksheetRuntime(
    "grade2_place_value_representation_compare_numbers",
    { worksheetSeed: "g5-b2-number-isolation" }
  );
  const grade4Numbers = buildCatalogWorksheetRuntime(
    "grade4_place_value_representation_compare_numbers",
    { worksheetSeed: "g5-b2-number-isolation" }
  );
  assert(items(grade2Numbers).every((item) => item.leftValue <= 999 && item.rightValue <= 999));
  assert.strictEqual(grade4Numbers.layout.template.columns, 3);
  assert.strictEqual(grade4Numbers.layout.template.maxProblemsPerPage, 30);
  assert(items(grade4Numbers).every((item) => item.leftValue <= 10000 && item.rightValue <= 10000));

  for (const id of [
    "grade5_patterning_and_algebra_extend_pattern",
    "grade5_patterning_and_algebra_identify_pattern_rule",
    "grade5_patterning_and_algebra_missing_value_pattern"
  ]) {
    const runtime = buildCatalogWorksheetRuntime(id, { worksheetSeed: "g5-b2-batch1-isolation" });
    assert(runtime.layout.display.sideWorkspace?.enabled);
    assert.strictEqual(runtime.layout.display.sideWorkspace.heading, "Work It Out");
  }
}

async function run() {
  await assertGeometry();
  await assertDefaultsAndSeeds();
  await assertVariablesAndMaximums();
  assertInvalidInputs();
  assertIsolation();
  console.log(
    "Grade 5 Compact Relational Practice Batch 2 tests passed: 30 seeds per resource; same-seed failures 0; defaults 30 in 2×15 and 30 in 3×10; maximums 60 and 60."
  );
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
