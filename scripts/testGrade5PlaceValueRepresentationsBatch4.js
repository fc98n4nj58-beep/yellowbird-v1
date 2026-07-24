"use strict";

const assert = require("assert");
const { Writable } = require("stream");
const { getCustomizationFamilyForResource } = require("../config/worksheetCustomization");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF, buildAnswerKeyItems, __test: rendererTest } = require("../renderers/pdfRenderer");
const { grade5NumberToWords } = require("../engine/problemGenerators/numberWordMatch");
const { buildGrade5RepresentationTruth } = require("../engine/problemGenerators/grade5PlaceValueTruth");

const IDS = Object.freeze({
  expanded: "grade5_place_value_representation_expanded_form",
  line: "grade5_place_value_representation_number_line_identify",
  words: "grade5_place_value_representation_number_word_match",
  standard: "grade5_place_value_representation_standard_form"
});
const SPECS = Object.freeze({
  [IDS.expanded]: ["Expanded Form", "Write each numeral in expanded form.", 30, 60, 30, 2, 15, 2],
  [IDS.line]: ["Identify Numbers on a Number Line", "Write the number shown by the point on each number line.", 6, 12, 6, 1, 6, 2],
  [IDS.words]: ["Write Numbers in Words", "Write each number in words.", 12, 20, 12, 1, 12, 2],
  [IDS.standard]: ["Standard Form", "Write each number in standard form.", 30, 60, 30, 2, 15, 2]
});
const FOOTER = "Grade 5 • Math • Place Value";
const NUMBER_WORD_ZERO_BOUNDARIES = [
  40005, 50505, 88008, 30003, 77770, 70040,
  60006, 88080, 100000, 80808, 90900, 20202
];

class BufferResponse extends Writable {
  constructor() { super(); this.chunks = []; }
  setHeader() {}
  _write(chunk, encoding, callback) { this.chunks.push(Buffer.from(chunk)); callback(); }
  buffer() { return Buffer.concat(this.chunks); }
}

function items(runtime) { return runtime.normalizedContentObject.content.items; }
function snapshot(runtime) {
  return items(runtime).map((item) => ({
    prompt: item.prompt, answer: item.answer, representedValue: item.representedValue,
    targetValue: item.targetValue, minValue: item.minValue, maxValue: item.maxValue,
    interval: item.interval, targetIndex: item.targetIndex, displayedLabels: item.displayedLabels,
    numeral: item.numeral, numberWord: item.numberWord, taskDirection: item.taskDirection,
    answerState: item.answerState, duplicateSignature: item.duplicateSignature
  }));
}
function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
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
      options: { filename: "grade5-place-value-batch4-test.pdf", includeAnswerKey: true }
    });
  });
}
function runtime(id, options = {}) {
  return buildCatalogWorksheetRuntime(id, { worksheetSeed: "grade5-place-value-batch4", ...options });
}
function assertThrows(id, options, pattern) {
  assert.throws(() => runtime(id, options), pattern);
}
function assertParity(value) {
  const source = items(value);
  const key = buildAnswerKeyItems(source);
  assert.strictEqual(value.layout.problems.length, source.length);
  assert.strictEqual(key.length, source.length);
  source.forEach((item, index) => {
    assert.deepStrictEqual(value.layout.problems[index].answer, item.answer);
    assert.deepStrictEqual(key[index].answer, item.answer);
    assert.deepStrictEqual(key[index].answerState, item.answerState);
  });
}
function assertPublic(id, value) {
  const [title, instruction, count, , perPage, columns, rows] = SPECS[id];
  assert.strictEqual(value.item.status, "generated");
  assert.strictEqual(getCustomizationFamilyForResource(id), null);
  assert.strictEqual(value.layout.header.title, title);
  assert.strictEqual(value.layout.header.subtitle, "");
  assert.strictEqual(value.layout.instruction, instruction);
  assert.strictEqual(value.contentObject.meta.curriculum.footerText, FOOTER);
  assert.strictEqual(items(value).length, count);
  assert.strictEqual(value.layout.template.maxProblemsPerPage, perPage);
  assert.strictEqual(value.layout.template.columns, columns);
  assert.strictEqual(value.layout.display.denseGridRows, rows);
  const publicText = [
    value.layout.header.title,
    value.layout.header.subtitle,
    value.layout.instruction,
    value.contentObject.meta.curriculum.footerText,
    ...items(value).map((item) => item.prompt)
  ].join(" ");
  assert(!publicText.includes("place_value_representation"));
  assert(!publicText.includes(id));
  assertParity(value);
}
function assertTruth(id, value) {
  const source = items(value);
  assert.strictEqual(new Set(source.map((item) => item.duplicateSignature)).size, source.length);
  assert.strictEqual(new Set(source.map((item) => item.representedValue)).size, source.length);
  source.forEach((item) => {
    assert(Number.isInteger(item.representedValue));
    assert(item.representedValue >= 10000 && item.representedValue <= 100000);
    if (id === IDS.line) {
      const labels = Array.from({ length: 11 }, (_, index) => item.minValue + index * item.interval);
      assert([100, 250, 500, 1000, 2500, 5000].includes(item.interval));
      assert.strictEqual(item.tickCount, 10);
      assert.deepStrictEqual(item.displayedLabels, labels);
      assert.strictEqual(item.targetValue, labels[item.targetIndex]);
      assert.strictEqual(item.answer, item.targetValue);
      assert.deepStrictEqual(item.answerState.displayedLabels, labels);
    } else if (id === IDS.words) {
      assert.strictEqual(item.numberWord, grade5NumberToWords(item.representedValue));
      assert.strictEqual(item.numeral, item.representedValue.toLocaleString("en-CA"));
      assert.deepStrictEqual(item.answerState.canonicalWordTokens, item.numberWord.split(/[\s-]+/));
      assert.strictEqual(item.answerState.expectedResponse, item.answer);
    } else {
      const truth = buildGrade5RepresentationTruth(item.representedValue);
      assert.strictEqual(item.answerState.expandedForm, truth.expandedForm);
      assert.deepStrictEqual(item.answerState.expandedTerms, truth.expandedTerms);
      assert.deepStrictEqual(item.answerState.placeValueDigits, truth.placeValueDigits);
      assert.strictEqual(item.numeral, truth.numeral);
      assert.strictEqual(
        item.answer,
        id === IDS.expanded ? truth.expandedForm : item.representedValue
      );
    }
  });
}

async function defaultsAndSeeds() {
  const variation = Object.fromEntries(Object.values(IDS).map((id) => [id, new Set()]));
  let sameSeedFailures = 0;
  for (let seed = 1; seed <= 30; seed += 1) {
    for (const id of Object.values(IDS)) {
      const options = { worksheetSeed: `grade5-place-value-${seed}` };
      const first = buildCatalogWorksheetRuntime(id, options);
      const second = buildCatalogWorksheetRuntime(id, options);
      if (JSON.stringify(snapshot(first)) !== JSON.stringify(snapshot(second))) sameSeedFailures += 1;
      variation[id].add(JSON.stringify(snapshot(first)));
      assertPublic(id, first);
      assertTruth(id, first);
      if (seed === 1) assert.strictEqual(pageCount(await render(first)), SPECS[id][7]);
    }
  }
  assert.strictEqual(sameSeedFailures, 0);
  Object.values(variation).forEach((values) => assert(values.size > 1));
  console.log("30 deterministic seeds pass");
  console.log("same-seed failures 0");
  console.log("different-seed variation passes");
}

async function maximumsExamplesAndVariables() {
  for (const id of Object.values(IDS)) {
    const spec = SPECS[id];
    const max = runtime(id, { questionCount: spec[3], questionsPerPage: spec[4] });
    assert.strictEqual(items(max).length, spec[3]);
    assert.strictEqual(pageCount(await render(max)), Math.ceil(spec[3] / spec[4]) * 2);
    const example = runtime(id, { includeExample: true });
    assert.strictEqual(items(example).length, spec[2] + 1);
    assert.strictEqual(items(example).filter((item) => item.isExample).length, 1);
  }
  for (const id of [IDS.expanded, IDS.standard]) {
    const explicit45 = runtime(id, { questionCount: 45, questionsPerPage: 30 });
    assert.strictEqual(items(explicit45).length, 45);
    assert.strictEqual(pageCount(await render(explicit45)), 4);
  }
  const selected = [40005, 70040, 90900, 100000, 50505, 80808, 99000, 60006, 77770, 30003, 20202, 88008];
  const words = runtime(IDS.words, { selectedValues: selected });
  assert.deepStrictEqual(new Set(items(words).map((item) => item.representedValue)), new Set(selected));
  items(words).forEach((item) => {
    assert(!item.numberWord.includes(" and "));
    assert(!item.numberWord.includes("  "));
  });
  const reverse = runtime(IDS.words, { selectedNumbers: selected, numberWordDirection: "word_to_numeral" });
  assert.strictEqual(reverse.layout.header.title, "Write the Numeral");
  assert.strictEqual(reverse.layout.instruction, "Write the numeral for each number word.");
  items(reverse).forEach((item) => {
    assert.strictEqual(item.prompt, item.numberWord);
    assert.strictEqual(item.answer, item.representedValue);
  });
  assert.strictEqual(reverse.layout.template.columns, 1);
  assert.strictEqual(reverse.layout.display.grade5FullWidthReverseNumberWordRows, true);
  assert.strictEqual(reverse.layout.display.atomicWholeNumberAnswers, true);
  const forwardGeometry = rendererTest.buildGrade5NumberWordRowGeometry({ x: 54, width: 504, reverse: false });
  assert.strictEqual(forwardGeometry.lineStartX, 98);
  assert.strictEqual(forwardGeometry.lineEndX, 558);
  assert.strictEqual(forwardGeometry.lineWidth, 460);
  assert(forwardGeometry.lineEndX >= 557 && forwardGeometry.lineEndX <= 559);
  const reverseGeometry = rendererTest.buildGrade5NumberWordRowGeometry({ x: 54, width: 504, reverse: true });
  assert.strictEqual(reverseGeometry.lineWidth, 46);
  assert(reverseGeometry.promptWidth >= 420);
  assert.strictEqual(rendererTest.formatAtomicWholeNumber(100000, true), "100,000");
  assert.strictEqual(rendererTest.formatAtomicWholeNumber(61984, true), "61,984");
  const forwardExample = runtime(IDS.words, { includeExample: true });
  assert.strictEqual(items(forwardExample).length, 13);
  assert.strictEqual(pageCount(await render(forwardExample)), 2);
  const reverseMaximumExample = runtime(IDS.words, {
    questionCount: 20,
    questionsPerPage: 12,
    numberWordMode: "word_to_numeral",
    includeExample: true
  });
  assert.strictEqual(items(reverseMaximumExample).length, 21);
  assert.strictEqual(pageCount(await render(reverseMaximumExample)), 4);
  const zeroForms = [40005, 70040, 90900, 100000, 50505, 80808, 99000, 60006, 77770, 30003, 20202, 88008];
  for (const id of [IDS.expanded, IDS.standard]) {
    const form = runtime(id, { questionCount: zeroForms.length, selectedNumbers: zeroForms });
    items(form).forEach((item) => {
      const terms = item.answerState.expandedTerms;
      assert(terms.every((term) => term.placeValue > 0));
      assert(terms.every((term, index) => index === 0 || terms[index - 1].placeValue > term.placeValue));
      assert.strictEqual(terms.reduce((sum, term) => sum + term.placeValue, 0), item.representedValue);
      assert(!item.answerState.expandedForm.includes(" × "));
      assert(!item.answerState.expandedForm.includes("^"));
    });
  }
  const atomicBoundary = [100000, 40005, 70040, 90900, 50505, 80808, 99000, 60006, 77770, 30003, 20202, 88008];
  const expandedBoundary = runtime(IDS.expanded, {
    questionCount: atomicBoundary.length,
    selectedNumbers: atomicBoundary
  });
  assert(items(expandedBoundary).every((item) => item.prompt === item.numeral && item.prompt.includes(",")));
  assert.strictEqual(expandedBoundary.layout.display.atomicNumeralFormatting, true);
  const standardBoundary = runtime(IDS.standard, {
    questionCount: atomicBoundary.length,
    selectedNumbers: atomicBoundary
  });
  assert.strictEqual(standardBoundary.layout.display.atomicWholeNumberAnswers, true);
  const line = runtime(IDS.line, {
    selectedNumbers: [10000, 20000, 30000, 40000, 50000, 60000],
    allowedIntervals: [1000],
    endpointPolicy: "endpoints_allowed"
  });
  assert.strictEqual(new Set(items(line).map((item) => item.targetValue)).size, 6);
  console.log("maximum counts, examples, aliases, reverse mode, and boundary values pass");
}

async function assertForwardResponseLineGeometry() {
  const cases = [
    {
      label: "default",
      options: {},
      expectedItems: 12,
      expectedPages: 2,
      expectedStudentDistribution: [12]
    },
    {
      label: "zeroes-and-boundary",
      options: {
        questionCount: 12,
        selectedNumbers: NUMBER_WORD_ZERO_BOUNDARIES
      },
      expectedItems: 12,
      expectedPages: 2,
      expectedStudentDistribution: [12],
      expectedValues: NUMBER_WORD_ZERO_BOUNDARIES
    },
    {
      label: "maximum-20",
      options: {
        questionCount: 20,
        questionsPerPage: 12
      },
      expectedItems: 20,
      expectedPages: 4,
      expectedStudentDistribution: [10, 10]
    }
  ];

  for (const testCase of cases) {
    const value = runtime(IDS.words, testCase.options);
    const records = [];
    value.layout.display.grade5ForwardResponseLineGeometryRecords = records;
    const pdf = await render(value);
    assert.strictEqual(items(value).length, testCase.expectedItems, `${testCase.label} item count`);
    assert.strictEqual(pageCount(pdf), testCase.expectedPages, `${testCase.label} PDF pages`);
    assert.strictEqual(records.length, testCase.expectedItems, `${testCase.label} geometry records`);
    if (testCase.expectedValues) {
      assert.deepStrictEqual(
        new Set(items(value).map((item) => item.representedValue)),
        new Set(testCase.expectedValues),
        `${testCase.label} selected-number set`
      );
    }

    records.forEach((record) => {
      assert.strictEqual(record.lineStartX, 98, `${testCase.label} rule start`);
      assert.strictEqual(record.lineEndX, 558, `${testCase.label} rule end`);
      assert.strictEqual(record.lineWidth, 460, `${testCase.label} rule width`);
      assert(record.lineY > record.promptBottom, `${testCase.label} rule follows numeral`);
      assert(record.lineY > record.rowTop, `${testCase.label} rule begins inside row`);
      assert(record.lineY < record.rowBottom, `${testCase.label} rule ends inside row`);
      assert(record.footerRuleY - record.lineY >= 30, `${testCase.label} footer clearance`);
    });

    const distribution = [...new Set(records.map((record) => record.pageIndex))]
      .sort((a, b) => a - b)
      .map((pageIndex) => records.filter((record) => record.pageIndex === pageIndex).length);
    assert.deepStrictEqual(
      distribution,
      testCase.expectedStudentDistribution,
      `${testCase.label} student-page distribution`
    );
  }
  console.log("forward response-line geometry records pass for default, selected 12, and maximum 20");
}

function adversarialInputs() {
  const all = Object.values(IDS);
  all.forEach((id) => {
    assertThrows(id, { minValue: 100000, maxValue: 10000 }, /minimum value/);
    assertThrows(id, { minValue: -1 }, /whole number/);
    assertThrows(id, { maxValue: 100000.5 }, /whole number/);
    assertThrows(id, { selectedNumbers: [40005, 40005] }, /unique/);
    assertThrows(id, { selectedNumbers: [] }, /must not be empty/);
    assertThrows(id, { answer: "forged" }, /caller-owned answer truth/);
    assertThrows(id, { answerState: {} }, /caller-owned answer truth/);
    assertThrows(id, { pageCount: 2 }, /caller-owned answer truth/);
    assertThrows(id, { includeExample: true, completedExample: false }, /aliases must agree/);
    assertThrows(id, { questionCount: SPECS[id][3] + 1 }, /question count/);
    assertThrows(id, { questionsPerPage: SPECS[id][4] + 1 }, /questions per page/);
  });
  assertThrows(IDS.line, { interval: 7 }, /caller-owned answer truth|not supported/);
  assertThrows(IDS.line, { allowedIntervals: [7] }, /support intervals/);
  assertThrows(IDS.line, { tickCount: 9 }, /tick count/);
  assertThrows(IDS.line, { taskMode: "plot_number" }, /identify_marked_number/);
  assertThrows(IDS.words, { locale: "en-US" }, /Canadian English/);
  assertThrows(IDS.words, { includeAnd: true }, /no-and/);
  assertThrows(IDS.words, { mode: "matching" }, /matching is not supported/);
  assertThrows(IDS.expanded, { answerStyle: "powers_of_ten" }, /canonical/);
  assertThrows(IDS.standard, { prompt: "forged" }, /caller-owned answer truth/);
  console.log("adversarial invalid inputs reject without fallback");
}

async function run() {
  await defaultsAndSeeds();
  await maximumsExamplesAndVariables();
  await assertForwardResponseLineGeometry();
  adversarialInputs();
  console.log("student/key parity passes");
  console.log("Grade 5 Batch 4 place-value representations: PASS");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
