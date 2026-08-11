"use strict";

const assert = require("assert");
const { Writable } = require("stream");

const { getCustomizationFamilyForResource } = require("../config/worksheetCustomization");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF, buildAnswerKeyItems, __test: rendererTest } = require("../renderers/pdfRenderer");
const { grade4NumberToWords } = require("../engine/problemGenerators/numberWordMatch");

const IDS = Object.freeze({
  line: "grade4_place_value_representation_number_line_identify",
  words: "grade4_place_value_representation_number_word_match",
  compare: "grade4_place_value_representation_compare_numbers"
});
const FOOTER = "Grade 4 • Math • Place Value";
const SPECS = Object.freeze({
  [IDS.line]: { title: "Identify Numbers on a Number Line", instruction: "Write the number shown by the point on each number line.", count: 6, perPage: 6, pdfPages: 2 },
  [IDS.words]: { title: "Write Numbers in Words", instruction: "Write each number in words.", count: 12, perPage: 12, pdfPages: 2 },
  [IDS.compare]: { title: "Compare Numbers", instruction: "Write >, <, or = to compare each pair of numbers.", count: 30, perPage: 30, pdfPages: 2 }
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

function items(runtime) {
  return runtime.normalizedContentObject.content.items;
}

function truth(runtime) {
  return items(runtime).map((item) => ({
    prompt: item.prompt,
    answer: item.answer,
    isExample: item.isExample,
    minValue: item.minValue,
    maxValue: item.maxValue,
    interval: item.interval,
    tickCount: item.tickCount,
    targetIndex: item.targetIndex,
    targetValue: item.targetValue,
    displayedLabels: item.displayedLabels,
    representedValue: item.representedValue,
    numeral: item.numeral,
    numberWord: item.numberWord,
    taskDirection: item.taskDirection,
    leftValue: item.leftValue,
    rightValue: item.rightValue,
    expectedSymbol: item.expectedSymbol,
    equalityState: item.equalityState,
    answerState: item.answerState,
    duplicateSignature: item.duplicateSignature
  }));
}

function render(runtime) {
  return new Promise((resolve, reject) => {
    const response = new BufferResponse();
    response.once("finish", () => resolve(response.buffer()));
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: { filename: "grade4-place-value-batch4-test.pdf", includeAnswerKey: true }
    });
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
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, FOOTER);
  assert.strictEqual(items(runtime).length, spec.count);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, spec.perPage);
  const publicText = [
    runtime.layout.header.title,
    runtime.layout.header.subtitle,
    runtime.layout.instruction,
    runtime.contentObject.meta.curriculum.footerText,
    ...items(runtime).map((item) => item.prompt)
  ].join(" ");
  assert(!publicText.includes(id));
  assert(!publicText.includes("place_value_representation"));
  assert(!publicText.includes("Students "));
}

function assertParity(runtime) {
  const source = items(runtime);
  const key = buildAnswerKeyItems(source);
  assert.strictEqual(runtime.layout.problems.length, source.length);
  assert.strictEqual(key.length, source.length);
  source.forEach((item, index) => {
    assert.deepStrictEqual(runtime.layout.problems[index].answer, item.answer);
    assert.deepStrictEqual(key[index].answer, item.answer);
    assert.deepStrictEqual(key[index].answerState, item.answerState);
    assert.strictEqual(key[index].duplicateSignature, item.duplicateSignature);
  });
}

function assertNumberLine(runtime) {
  const source = items(runtime);
  assert.strictEqual(runtime.layout.template.columns, 1);
  assert.strictEqual(runtime.layout.display.numberLineFullContentWidth, true);
  assert.strictEqual(runtime.layout.display.numberLineAnswerUnderTarget, true);
  assert.strictEqual(new Set(source.map((item) => item.targetValue)).size, source.length);
  source.forEach((item) => {
    assert([10, 25, 50, 100, 250, 500].includes(item.interval));
    assert.strictEqual(item.tickCount, 10);
    assert.strictEqual(item.targetValue, item.minValue + item.targetIndex * item.interval);
    assert.strictEqual(item.maxValue, item.minValue + item.tickCount * item.interval);
    assert.deepStrictEqual(item.displayedLabels, Array.from({ length: 11 }, (_, index) => item.minValue + index * item.interval));
    assert.strictEqual(item.answer, item.targetValue);
    assert.strictEqual(item.responseTarget, "number_line_value");
    assert.strictEqual(item.answerState.targetValue, item.targetValue);
    assert.strictEqual(item.visual.data.targetIndex, item.targetIndex);
    assert.strictEqual(item.visual.data.value, item.targetValue);
    assert.strictEqual(item.visual.data.labelWidth, 38);
    assert.strictEqual(item.visual.data.formatThousands, true);
    assert.strictEqual(typeof item.targetValue, "number");
    item.displayedLabels.forEach((label) => {
      assert.strictEqual(typeof label, "number");
      assert.strictEqual(
        rendererTest.formatNumberLineDisplayValue(label, true),
        label >= 1000 ? label.toLocaleString("en-CA") : String(label)
      );
    });
    assert.strictEqual(
      rendererTest.formatNumberLineDisplayValue(item.answer, true),
      item.answer.toLocaleString("en-CA")
    );
  });
  assertParity(runtime);
}

function assertNumberWords(runtime, expectedMode = "numeral_to_word") {
  const source = items(runtime);
  assert.strictEqual(new Set(source.map((item) => item.representedValue)).size, source.length);
  if (expectedMode === "numeral_to_word") {
    assert.strictEqual(runtime.layout.template.columns, 1);
    assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 12);
    assert.strictEqual(runtime.layout.display.denseGridRows, 12);
    assert.strictEqual(runtime.layout.display.equalHeightItems, true);
    assert.strictEqual(runtime.layout.display.sequentialColumnFill, true);
    const alignedColumns = rendererTest.distributeSequential(source, 1);
    assert.deepStrictEqual(alignedColumns.map((column) => column.map((item) => item.id)), [
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    ]);
    assert.strictEqual(runtime.layout.display.numberWordPromptZoneWidth, null);
    assert.strictEqual(runtime.layout.display.answerLineBelowPrompt, true);
    assert.strictEqual(runtime.layout.display.shortWritingLine, false);
    assert.strictEqual(runtime.layout.display.grade5FullWidthNumberWordRows, true);
    assert.deepStrictEqual(
      rendererTest.paginateEven(source, 12).map((page) => page.map((item) => item.id)),
      [Array.from({ length: 12 }, (_, index) => index + 1)],
      "default numeral-to-word pagination must retain all 12 questions on one aligned page"
    );
  } else {
    assert.strictEqual(runtime.layout.template.columns, 2);
    assert.strictEqual(runtime.layout.display.reverseNumberWordRowsPerColumn, 6);
    assert.strictEqual(runtime.layout.display.reverseNumberWordRespectPageCapacity, true);
  }
  source.forEach((item) => {
    assert.strictEqual(item.numberWord, grade4NumberToWords(item.representedValue));
    assert.strictEqual(item.numeral, item.representedValue.toLocaleString("en-CA"));
    assert.strictEqual(item.taskDirection, expectedMode);
    assert.strictEqual(item.numberWordMode, expectedMode);
    if (expectedMode === "numeral_to_word") {
      assert.strictEqual(item.prompt, item.numeral);
      assert.strictEqual(item.answer, item.numberWord);
      assert.strictEqual(item.responseType, "number_word");
    } else {
      assert.strictEqual(item.prompt, item.numberWord);
      assert.strictEqual(item.answer, item.representedValue);
      assert.strictEqual(item.responseType, "numeral");
    }
    assert.deepStrictEqual(item.answerState, {
      representedValue: item.representedValue,
      numeral: item.numeral,
      numberWord: item.numberWord,
      taskDirection: expectedMode
    });
  });
  assertParity(runtime);
}

function assertComparison(runtime, expectedCounts = null) {
  const source = items(runtime).filter((item) => !item.isExample);
  const balancedCount = source.length / 3;
  const expectedDistribution = expectedCounts || { "<": balancedCount, ">": balancedCount, "=": balancedCount };
  const counts = { "<": 0, ">": 0, "=": 0 };
  const pairKeys = new Set();
  source.forEach((item) => {
    const expected = item.leftValue < item.rightValue ? "<" : item.leftValue > item.rightValue ? ">" : "=";
    assert.strictEqual(item.expectedSymbol, expected);
    assert.strictEqual(item.comparisonResult, expected);
    assert.strictEqual(item.answer, expected);
    assert.strictEqual(item.equalityState, expected === "=");
    assert.deepStrictEqual(item.answerState, { expectedSymbol: expected, equalityState: expected === "=" });
    counts[expected] += 1;
    const key = expected === "="
      ? `=${item.leftValue}`
      : `${Math.min(item.leftValue, item.rightValue)}:${Math.max(item.leftValue, item.rightValue)}`;
    assert(!pairKeys.has(key), `duplicate or reversed comparison pair ${key}`);
    pairKeys.add(key);
  });
  assert.deepStrictEqual(counts, expectedDistribution);
  if (source.length === 30) {
    assert.strictEqual(runtime.layout.template.columns, 3);
    assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 30);
    assert.strictEqual(runtime.layout.display.denseGridRows, 10);
    assert.strictEqual(runtime.layout.display.structuredComparisonLayout, true);
    const contentWidth = 468;
    const columnWidth = (contentWidth - 48) / 3;
    const usedWidth = runtime.layout.display.comparisonNumberGutter +
      runtime.layout.display.comparisonOperandWidth * 2 +
      runtime.layout.display.comparisonTargetWidth +
      runtime.layout.display.comparisonGap * 2;
    assert(usedWidth <= columnWidth, "Grade 4 comparison row must fit a print-safe three-column cell");
    assert(runtime.layout.display.comparisonTargetWidth >= 24);
    assert(runtime.layout.display.comparisonFontSize >= 10.5);
    assert.strictEqual(runtime.layout.display.comparisonThousandsSeparators, true);
    assert.strictEqual(rendererTest.formatComparisonDisplayValue(10000, true), "10,000");
    assert.strictEqual(rendererTest.formatComparisonDisplayValue(1000, true), "1,000");
  }
  assertParity(runtime);
}

async function assertDefaultsAndSeeds() {
  const variation = Object.fromEntries(Object.values(IDS).map((id) => [id, new Set()]));
  let sameSeedFailures = 0;
  for (let seed = 1; seed <= 30; seed += 1) {
    for (const id of Object.values(IDS)) {
      const query = { worksheetSeed: `grade4-batch4-${seed}` };
      const first = buildCatalogWorksheetRuntime(id, query);
      const second = buildCatalogWorksheetRuntime(id, query);
      if (JSON.stringify(truth(first)) !== JSON.stringify(truth(second))) sameSeedFailures += 1;
      assertPublicContract(id, first);
      if (id === IDS.line) assertNumberLine(first);
      if (id === IDS.words) assertNumberWords(first);
      if (id === IDS.compare) assertComparison(first);
      variation[id].add(JSON.stringify(truth(first)));
    }
  }
  assert.strictEqual(sameSeedFailures, 0);
  Object.values(IDS).forEach((id) => assert(variation[id].size > 1, `${id} must vary across seeds`));

  for (const id of Object.values(IDS)) {
    const runtime = buildCatalogWorksheetRuntime(id, { worksheetSeed: `grade4-batch4-pdf-${id}` });
    assert.strictEqual(pageCount(await render(runtime)), SPECS[id].pdfPages);
  }
}

async function assertVariables() {
  const line = buildCatalogWorksheetRuntime(IDS.line, {
    worksheetSeed: "g4-b4-line-vars",
    questionCount: 5,
    questionsPerPage: 5,
    minimumNumber: 1000,
    maximumNumber: 6000,
    selectedIntervals: [500],
    endpointPolicy: "interior_only"
  });
  assert.strictEqual(items(line).length, 5);
  items(line).forEach((item) => {
    assert.strictEqual(item.interval, 500);
    assert(item.targetIndex > 0 && item.targetIndex < 10);
    assert.strictEqual(item.endpointPolicy, "interior_only");
  });

  const selectedLine = buildCatalogWorksheetRuntime(IDS.line, {
    worksheetSeed: "g4-b4-line-selected",
    questionCount: 3,
    selectedValues: [1000, 2000, 3000],
    allowedIntervals: [100],
    minValue: 0,
    maxValue: 5000
  });
  assert.deepStrictEqual(new Set(items(selectedLine).map((item) => item.targetValue)), new Set([1000, 2000, 3000]));

  for (const interval of [10, 25, 50, 100, 250, 500]) {
    const endpoint = buildCatalogWorksheetRuntime(IDS.line, {
      worksheetSeed: `g4-b4-line-format-${interval}`,
      questionCount: 1,
      minValue: 5000,
      maxValue: 10000,
      selectedValues: [10000],
      selectedIntervals: [interval]
    });
    const [item] = items(endpoint);
    assert.strictEqual(item.targetValue, 10000);
    assert.strictEqual(item.interval, interval);
    assert.strictEqual(item.targetIndex, 10);
    assert.strictEqual(rendererTest.formatNumberLineDisplayValue(item.targetValue, true), "10,000");
  }

  const zeroWords = buildCatalogWorksheetRuntime(IDS.words, {
    worksheetSeed: "g4-b4-word-zero-placeholders",
    questionCount: 5,
    selectedNumbers: [1000, 1005, 1040, 4008, 10000],
    minValue: 1000,
    maxValue: 10000
  });
  assert.deepStrictEqual(new Set(items(zeroWords).map((item) => item.numberWord)), new Set([
    "one thousand", "one thousand five", "one thousand forty", "four thousand eight", "ten thousand"
  ]));

  const reverseWords = buildCatalogWorksheetRuntime(IDS.words, {
    worksheetSeed: "g4-b4-word-reverse",
    questionCount: 12,
    questionsPerPage: 12,
    selectedValues: [1005, 1040, 1204, 2002, 3050, 4008, 5070, 7007, 7788, 8867, 9678, 9999],
    numberWordDirection: "word_to_numeral"
  });
  assert.strictEqual(reverseWords.layout.header.title, "Write the Numeral");
  assert.strictEqual(reverseWords.layout.instruction, "Write the numeral for each number word.");
  assert.strictEqual(reverseWords.layout.template.columns, 2);
  assert.strictEqual(reverseWords.layout.display.reverseNumberWordRowsPerColumn, 6);
  assert.strictEqual(reverseWords.layout.display.reverseNumberWordRespectPageCapacity, true);
  assertNumberWords(reverseWords, "word_to_numeral");
  assert.strictEqual(pageCount(await render(reverseWords)), 2);

  const compare = buildCatalogWorksheetRuntime(IDS.compare, {
    worksheetSeed: "g4-b4-compare-selected",
    questionCount: 12,
    questionsPerPage: 12,
    selectedNumbers: [1000, 1005, 1050, 1500, 2002, 4008, 5000, 5050, 7007, 9009, 9999, 10000],
    includeEqualPairs: true
  });
  assertComparison(compare);
  items(compare).forEach((item) => {
    assert([1000, 1005, 1050, 1500, 2002, 4008, 5000, 5050, 7007, 9009, 9999, 10000].includes(item.leftValue));
    assert([1000, 1005, 1050, 1500, 2002, 4008, 5000, 5050, 7007, 9009, 9999, 10000].includes(item.rightValue));
  });

  const noEquals = buildCatalogWorksheetRuntime(IDS.compare, {
    worksheetSeed: "g4-b4-compare-no-equals",
    questionCount: 30,
    includeEqualPairs: false
  });
  assertComparison(noEquals, { "<": 15, ">": 15, "=": 0 });

  for (const id of Object.values(IDS)) {
    for (const alias of ["includeExample", "completedExample", "example"]) {
      const runtime = buildCatalogWorksheetRuntime(id, {
        worksheetSeed: `g4-b4-${id}-${alias}`,
        [alias]: true
      });
      assert.strictEqual(items(runtime).length, SPECS[id].count + 1);
      assert.strictEqual(items(runtime).filter((item) => item.isExample).length, 1);
      assert.strictEqual(items(runtime).filter((item) => !item.isExample).length, SPECS[id].count);
      if (id === IDS.compare) assertComparison(runtime);
      assert.strictEqual(pageCount(await render(runtime)), 4);
    }
  }

  const lineMulti = buildCatalogWorksheetRuntime(IDS.line, { worksheetSeed: "g4-b4-line-multi", questionCount: 12, questionsPerPage: 6 });
  const wordMulti = buildCatalogWorksheetRuntime(IDS.words, { worksheetSeed: "g4-b4-word-multi", questionCount: 20, questionsPerPage: 12 });
  const reverseMulti = buildCatalogWorksheetRuntime(IDS.words, { worksheetSeed: "g4-b4-word-reverse-multi", questionCount: 20, questionsPerPage: 12, numberWordMode: "word_to_numeral" });
  const compareMulti = buildCatalogWorksheetRuntime(IDS.compare, { worksheetSeed: "g4-b4-compare-multi", questionCount: 30, questionsPerPage: 30 });
  assert.strictEqual(pageCount(await render(lineMulti)), 4);
  assert.strictEqual(pageCount(await render(wordMulti)), 4);
  assert.strictEqual(pageCount(await render(reverseMulti)), 4);
  assert.strictEqual(pageCount(await render(compareMulti)), 2);
}

function assertInvalidInputs() {
  const invalid = [
    [IDS.line, { questionCount: 13 }],
    [IDS.line, { questionsPerPage: 7 }],
    [IDS.line, { minValue: -1 }],
    [IDS.line, { maxValue: 10001 }],
    [IDS.line, { minValue: 2000, maxValue: 1000 }],
    [IDS.line, { minValue: 1000.5 }],
    [IDS.line, { selectedValues: [] }],
    [IDS.line, { selectedValues: [1000, 1000] }],
    [IDS.line, { selectedValues: [1000, 2000], selectedNumbers: [1000, 3000] }],
    [IDS.line, { selectedValues: [999], minValue: 1000 }],
    [IDS.line, { allowedIntervals: [0] }],
    [IDS.line, { allowedIntervals: [-10] }],
    [IDS.line, { allowedIntervals: [12.5] }],
    [IDS.line, { allowedIntervals: [20] }],
    [IDS.line, { minValue: 1000, maxValue: 9999, allowedIntervals: [25] }],
    [IDS.line, { tickCount: 11 }],
    [IDS.line, { endpointPolicy: "sometimes" }],
    [IDS.line, { allowEndpointTargets: true, endpointPolicy: "interior_only" }],
    [IDS.line, { taskMode: "locate_number" }],
    [IDS.words, { questionCount: 21 }],
    [IDS.words, { questionsPerPage: 13 }],
    [IDS.words, { selectedNumbers: [1000, "oops"] }],
    [IDS.words, { selectedNumbers: [1000, 1000] }],
    [IDS.words, { numberWordMode: "matching" }],
    [IDS.words, { mode: "numeral_to_word", numberWordDirection: "word_to_numeral" }],
    [IDS.words, { questionCount: 3, selectedNumbers: [1000, 1001] }],
    [IDS.compare, { questionCount: 13 }],
    [IDS.compare, { questionCount: 25 }],
    [IDS.compare, { questionCount: 31 }],
    [IDS.compare, { questionsPerPage: 31 }],
    [IDS.compare, { includeEqualPairs: "sometimes" }],
    [IDS.compare, { includeEqualPairs: true, equalPairs: false }],
    [IDS.compare, { selectedNumbers: [1000, 1001], questionCount: 12 }],
    [IDS.compare, { minA: 1000, minValue: 2000 }],
    [IDS.compare, { answer: "<" }],
    [IDS.line, { targetValue: 2000 }],
    [IDS.words, { numberWord: "one thousand" }],
    [IDS.compare, { expectedSymbol: "=" }],
    [IDS.line, { includeExample: "sometimes" }]
  ];
  invalid.forEach(([id, options]) => {
    assert.throws(() => buildCatalogWorksheetRuntime(id, { worksheetSeed: "g4-b4-invalid", ...options }), `${id} should reject ${JSON.stringify(options)}`);
  });
}

function assertCrossGradeIsolation() {
  const grade2Line = buildCatalogWorksheetRuntime("grade2_place_value_representation_number_line_identify", { worksheetSeed: "g4-b4-g2-line" });
  const grade3Words = buildCatalogWorksheetRuntime("grade3_place_value_representation_number_word_match", { worksheetSeed: "g4-b4-g3-words" });
  const grade2Compare = buildCatalogWorksheetRuntime("grade2_place_value_representation_compare_numbers", { worksheetSeed: "g4-b4-g2-compare" });
  assert(items(grade2Line).every((item) => item.maxValue <= 1000));
  assert(items(grade3Words).every((item) => item.value <= 999));
  assert(items(grade2Compare).every((item) => item.leftValue <= 999 && item.rightValue <= 999));
}

async function run() {
  await assertDefaultsAndSeeds();
  await assertVariables();
  assertInvalidInputs();
  assertCrossGradeIsolation();
  console.log("Grade 4 Place-Value Representations Batch 4 tests passed: 30 seeds per resource; same-seed failures 0; default PDFs 2/2/2; maximum PDFs 4/4/2.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
