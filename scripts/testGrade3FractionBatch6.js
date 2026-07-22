"use strict";

const assert = require("assert");
const { Writable } = require("stream");

const { getCustomizationFamilyForResource } = require("../config/worksheetCustomization");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { buildAnswerKeyItems, renderWorksheetPDF, __test: rendererTest } = require("../renderers/pdfRenderer");

const IDS = Object.freeze({
  compare: "grade3_fraction_equivalence_compare_fractions",
  match: "grade3_fraction_equivalence_match_equivalent_fractions",
  numberLine: "grade3_fraction_equivalence_fraction_number_line",
  wordProblems: "grade3_fraction_equivalence_fraction_word_problems",
  batch5Shade: "grade3_fraction_equivalence_shade_fraction_models",
  batch5WholeNumberLine: "grade3_place_value_representation_number_line_identify"
});
const SAFE_DENOMINATORS = Object.freeze([2, 3, 4, 5, 6, 8]);

class MemoryResponse extends Writable {
  constructor() { super(); this.chunks = []; }
  setHeader() {}
  _write(chunk, encoding, callback) { this.chunks.push(Buffer.from(chunk)); callback(); }
  buffer() { return Buffer.concat(this.chunks); }
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function render(runtime, includeAnswerKey = true) {
  return new Promise((resolve, reject) => {
    const response = new MemoryResponse();
    response.once("finish", () => resolve(response.buffer()));
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: { filename: "grade3-fraction-batch6-test.pdf", includeAnswerKey }
    });
  });
}

function items(runtime) {
  return runtime.normalizedContentObject.content.items;
}

function signature(runtime) {
  return items(runtime).map((item) => ({
    prompt: item.prompt,
    answer: item.answer,
    responseValues: item.responseValues,
    responseTarget: item.responseTarget,
    numerator: item.numerator,
    denominator: item.denominator,
    targetIndex: item.targetIndex,
    expectedSymbol: item.expectedSymbol,
    leftCrossProduct: item.leftCrossProduct,
    rightCrossProduct: item.rightCrossProduct,
    displayedFractionLabels: item.displayedFractionLabels,
    visual: item.visual,
    duplicateSignature: item.duplicateSignature,
    isExample: item.isExample
  }));
}

function assertPublicContract(runtime, expected) {
  const publicText = JSON.stringify({
    title: runtime.layout.header.title,
    subtitle: runtime.layout.header.subtitle,
    instruction: runtime.layout.instruction,
    footer: runtime.contentObject.meta.curriculum.footerText
  });
  assert.strictEqual(runtime.item.status, expected.status);
  assert.strictEqual(runtime.layout.header.title, expected.title);
  assert.strictEqual(runtime.contentObject.meta.title, expected.title);
  assert.strictEqual(runtime.layout.header.subtitle, "");
  assert.strictEqual(runtime.layout.instruction, expected.instruction);
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, "Grade 3 • Math • Fractions");
  assert.strictEqual(items(runtime).length, expected.questionCount);
  assert(!publicText.includes("— Grade 3"));
  assert(!publicText.includes(runtime.item.id));
  assert(!publicText.includes("fraction_equivalence"));
  assert.strictEqual(getCustomizationFamilyForResource(runtime.item.id), null);
}

function assertKeyParity(runtime, fields) {
  const student = items(runtime);
  const key = buildAnswerKeyItems(student);
  assert.strictEqual(key.length, student.length);
  fields.forEach((field) => {
    assert.deepStrictEqual(key.map((item) => item[field]), student.map((item) => item[field]), `${field} parity`);
  });
}

function assertCompare(runtime) {
  const problems = items(runtime);
  assert.strictEqual(runtime.layout.template.columns, 2);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 12);
  assert.strictEqual(runtime.layout.display.standardShortAnswerTarget, true);
  assert.deepStrictEqual(
    problems.reduce((counts, item) => ({ ...counts, [item.answer]: (counts[item.answer] || 0) + 1 }), {}),
    { "<": 4, ">": 4, "=": 4 }
  );
  assert.strictEqual(new Set(problems.map((item) => item.duplicateSignature)).size, problems.length);
  problems.forEach((item) => {
    assert(item.leftNumerator >= 1 && item.leftNumerator < item.leftDenominator);
    assert(item.rightNumerator >= 1 && item.rightNumerator < item.rightDenominator);
    assert(SAFE_DENOMINATORS.includes(item.leftDenominator));
    assert(SAFE_DENOMINATORS.includes(item.rightDenominator));
    const leftProduct = item.leftNumerator * item.rightDenominator;
    const rightProduct = item.rightNumerator * item.leftDenominator;
    const expected = leftProduct < rightProduct ? "<" : leftProduct > rightProduct ? ">" : "=";
    assert.strictEqual(item.leftCrossProduct, leftProduct);
    assert.strictEqual(item.rightCrossProduct, rightProduct);
    assert.strictEqual(item.expectedSymbol, expected);
    assert.strictEqual(item.answer, expected);
    assert.strictEqual(item.equalityState, expected === "=");
    assert.strictEqual(item.responseTarget, "comparison_symbol");
    assert(!item.prompt.includes("Compare:"));
  });
  assertKeyParity(runtime, [
    "answer", "responseValues", "responseTarget", "leftNumerator", "leftDenominator",
    "rightNumerator", "rightDenominator", "leftCrossProduct", "rightCrossProduct",
    "expectedSymbol", "equalityState", "duplicateSignature", "answerState"
  ]);
}

function assertNumberLine(runtime) {
  const problems = items(runtime);
  assert.strictEqual(runtime.layout.template.columns, 1);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 6);
  assert.strictEqual(runtime.layout.display.numberLineFullContentWidth, true);
  assert.strictEqual(runtime.layout.display.numberLineAnswerUnderTarget, true);
  assert.strictEqual(new Set(problems.map((item) => item.denominator)).size, 6);
  assert.strictEqual(new Set(problems.map((item) => item.duplicateSignature)).size, problems.length);
  problems.forEach((item) => {
    assert(SAFE_DENOMINATORS.includes(item.denominator));
    assert(item.numerator >= 1 && item.numerator < item.denominator);
    assert.strictEqual(item.wholeStart, 0);
    assert.strictEqual(item.wholeEnd, 1);
    assert.strictEqual(item.intervalCount, item.denominator);
    assert.strictEqual(item.tickCount, item.denominator);
    assert.strictEqual(item.targetIndex, item.numerator);
    assert.strictEqual(item.targetNumerator, item.numerator);
    assert.strictEqual(item.targetDenominator, item.denominator);
    assert.strictEqual(item.answer, `${item.numerator}/${item.denominator}`);
    assert.strictEqual(item.endpointPolicy, "interior_only");
    assert.strictEqual(item.responseTarget, "fraction_number_line_value");
    assert(Math.abs(item.maxValue - item.minValue - item.interval * item.tickCount) < 1e-12);
    assert(Math.abs(item.targetValue - item.minValue - item.targetIndex * item.interval) < 1e-12);
    assert.deepStrictEqual(item.displayedFractionLabels, item.visual.data.fractionLabels);
    assert.strictEqual(item.displayedFractionLabels[item.targetIndex], item.answer);
    assert.strictEqual(item.visual.kind, "number_line");
    assert.strictEqual(item.visual.data.hideValueLabel, true);
  });
  assertKeyParity(runtime, [
    "answer", "responseValues", "responseTarget", "visual", "numerator", "denominator",
    "partCount", "interval", "intervalCount", "tickCount", "targetIndex", "targetValue",
    "targetNumerator", "targetDenominator", "wholeStart", "wholeEnd", "endpointPolicy",
    "displayedFractionLabels", "simplifiedDisplayFraction", "duplicateSignature", "answerState"
  ]);
  const measured = rendererTest.measureNumberLineVisual(
    { min: 0, max: 1, interval: 1 / 8, tickCount: 8 },
    500,
    60,
    { forceFullWidth: true }
  );
  assert.strictEqual(measured.width, 500);
  assert(measured.height <= 60);
}

async function run() {
  const compare = buildCatalogWorksheetRuntime(IDS.compare, { worksheetSeed: "grade3-batch6-default-compare" });
  const numberLine = buildCatalogWorksheetRuntime(IDS.numberLine, { worksheetSeed: "grade3-batch6-default-line" });
  assertPublicContract(compare, {
    title: "Compare Fractions",
    instruction: "Write >, <, or = to compare each pair of fractions.",
    status: "ready",
    questionCount: 12
  });
  assertPublicContract(numberLine, {
    title: "Fractions on a Number Line",
    instruction: "Write the fraction shown by the point on each number line.",
    status: "generated",
    questionCount: 6
  });
  assertCompare(compare);
  assertNumberLine(numberLine);

  let sameSeedFailures = 0;
  const compareVariations = new Set();
  const lineVariations = new Set();
  for (let seed = 1; seed <= 30; seed += 1) {
    for (const id of [IDS.compare, IDS.numberLine]) {
      const first = buildCatalogWorksheetRuntime(id, { worksheetSeed: `grade3-batch6-${seed}` });
      const second = buildCatalogWorksheetRuntime(id, { worksheetSeed: `grade3-batch6-${seed}` });
      if (JSON.stringify(signature(first)) !== JSON.stringify(signature(second))) sameSeedFailures += 1;
      if (id === IDS.compare) {
        assertCompare(first);
        compareVariations.add(JSON.stringify(signature(first)));
      } else {
        assertNumberLine(first);
        lineVariations.add(JSON.stringify(signature(first)));
      }
    }
  }
  assert.strictEqual(sameSeedFailures, 0);
  assert(compareVariations.size > 1);
  assert(lineVariations.size > 1);

  const denominatorError = /support denominators 2, 3, 4, 5, 6, and 8 only/;
  for (const options of [
    { selectedDenominators: [7] },
    { denominators: "3,7" },
    { allowedDenominators: [2, 4, 9] },
    { selectedFractions: ["1/7", "2/7"] },
    { fractions: ["3/9", "1/2"] },
    { selectedFractions: [{ numerator: 1, denominator: 7 }] }
  ]) {
    assert.throws(
      () => buildCatalogWorksheetRuntime(IDS.compare, { worksheetSeed: "grade3-batch6-invalid-compare", ...options }),
      denominatorError
    );
  }

  for (const options of [
    { selectedDenominators: [7] },
    { denominators: "2,7" },
    { selectedFractions: ["1/7"] }
  ]) {
    assert.throws(
      () => buildCatalogWorksheetRuntime(IDS.numberLine, { worksheetSeed: "grade3-batch6-invalid-line", ...options }),
      denominatorError
    );
  }
  assert.throws(
    () => buildCatalogWorksheetRuntime(IDS.numberLine, {
      worksheetSeed: "grade3-batch6-disabled-endpoint",
      allowEndpointTargets: false,
      selectedFractions: ["0/4"]
    }),
    /violate the endpoint policy/
  );
  assert.throws(
    () => buildCatalogWorksheetRuntime(IDS.numberLine, {
      worksheetSeed: "grade3-batch6-duplicate-line",
      questionCount: 2,
      selectedFractions: ["1/4", "1/4"]
    }),
    /must be unique/
  );

  const validDenominatorCompare = buildCatalogWorksheetRuntime(IDS.compare, {
    worksheetSeed: "grade3-batch6-valid-denominators-compare",
    questionCount: 6,
    equalPairs: 0,
    selectedDenominators: [3, 5]
  });
  assert(items(validDenominatorCompare).every((item) =>
    [3, 5].includes(item.leftDenominator) && [3, 5].includes(item.rightDenominator)
  ));

  const validFractions = new Set(["1/3", "2/3", "1/5", "4/5"]);
  const validExplicitCompare = buildCatalogWorksheetRuntime(IDS.compare, {
    worksheetSeed: "grade3-batch6-valid-explicit-compare",
    questionCount: 4,
    equalPairs: 0,
    selectedFractions: [...validFractions]
  });
  assert(items(validExplicitCompare).every((item) =>
    validFractions.has(`${item.leftNumerator}/${item.leftDenominator}`) &&
    validFractions.has(`${item.rightNumerator}/${item.rightDenominator}`)
  ));

  const validDenominatorLine = buildCatalogWorksheetRuntime(IDS.numberLine, {
    worksheetSeed: "grade3-batch6-valid-denominators-line",
    selectedDenominators: [4, 8]
  });
  assert(items(validDenominatorLine).every((item) => [4, 8].includes(item.denominator)));

  const noEqual = buildCatalogWorksheetRuntime(IDS.compare, {
    worksheetSeed: "grade3-batch6-no-equal",
    questionCount: 7,
    equalPairs: 0,
    selectedDenominators: [3, 4, 6]
  });
  assert.strictEqual(items(noEqual).length, 7);
  assert(items(noEqual).every((item) => item.answer !== "="));
  assert(items(noEqual).every((item) => [3, 4, 6].includes(item.leftDenominator) && [3, 4, 6].includes(item.rightDenominator)));

  const selectedCompare = buildCatalogWorksheetRuntime(IDS.compare, {
    worksheetSeed: "grade3-batch6-selected-compare",
    questionCount: 3,
    equalPairs: 1,
    selectedFractions: ["1/2", "2/4", "1/3", "3/4"]
  });
  assert.strictEqual(items(selectedCompare).length, 3);
  assert.strictEqual(items(selectedCompare).filter((item) => item.answer === "=").length, 1);

  const endpoints = buildCatalogWorksheetRuntime(IDS.numberLine, {
    worksheetSeed: "grade3-batch6-endpoints",
    questionCount: 4,
    selectedDenominators: [4],
    selectedFractions: ["0/4", "4/4", "1/4", "3/4"],
    allowEndpointTargets: true
  });
  assert.deepStrictEqual(items(endpoints).map((item) => item.targetIndex).sort((a, b) => a - b), [0, 1, 3, 4]);
  assert(items(endpoints).every((item) => item.endpointPolicy === "allowed"));
  assert.deepStrictEqual(items(endpoints).map((item) => item.answer).sort(), ["0", "1", "1/4", "3/4"]);

  const selectedLine = buildCatalogWorksheetRuntime(IDS.numberLine, {
    worksheetSeed: "grade3-batch6-selected-line",
    questionCount: 2,
    selectedDenominators: [3]
  });
  assert(items(selectedLine).every((item) => item.denominator === 3));

  for (const id of [IDS.compare, IDS.numberLine]) {
    const example = buildCatalogWorksheetRuntime(id, {
      worksheetSeed: `grade3-batch6-example-${id}`,
      includeExample: true
    });
    const expected = id === IDS.compare ? 13 : 7;
    assert.strictEqual(items(example).length, expected);
    assert.strictEqual(items(example)[0].isExample, true);
    assert.strictEqual(items(example).filter((item) => item.isExample).length, 1);
  }

  const comparePdf = await render(compare);
  const linePdf = await render(numberLine);
  assert.strictEqual(pageCount(comparePdf), 2);
  assert.strictEqual(pageCount(linePdf), 2);

  const compareMultipage = buildCatalogWorksheetRuntime(IDS.compare, {
    worksheetSeed: "grade3-batch6-compare-multipage",
    questionCount: 15,
    questionsPerPage: 8,
    equalPairs: 5
  });
  const lineMultipage = buildCatalogWorksheetRuntime(IDS.numberLine, {
    worksheetSeed: "grade3-batch6-line-multipage",
    questionCount: 8,
    questionsPerPage: 4
  });
  assert((await render(compareMultipage)).length > 0);
  assert((await render(lineMultipage)).length > 0);

  const blockedMatch = buildCatalogWorksheetRuntime(IDS.match, { worksheetSeed: "grade3-batch6-blocked-match" });
  const blockedWordProblems = buildCatalogWorksheetRuntime(IDS.wordProblems, { worksheetSeed: "grade3-batch6-blocked-word" });
  assert.strictEqual(blockedMatch.item.status, "ready");
  assert.strictEqual(blockedMatch.layout.worksheetType, "equation_practice");
  assert(items(blockedMatch).every((item) => item.prompt.startsWith("Match the equivalent fractions:")));
  assert.strictEqual(blockedWordProblems.item.status, "generated");
  assert.strictEqual(items(blockedWordProblems).length, 0);
  assert.strictEqual(getCustomizationFamilyForResource(IDS.match), null);
  assert.strictEqual(getCustomizationFamilyForResource(IDS.wordProblems), null);

  const batch5Shade = buildCatalogWorksheetRuntime(IDS.batch5Shade, { worksheetSeed: "grade3-batch6-batch5-shade" });
  const batch5WholeLine = buildCatalogWorksheetRuntime(IDS.batch5WholeNumberLine, { worksheetSeed: "grade3-batch6-batch5-line" });
  assert.strictEqual(batch5Shade.layout.header.title, "Shade the Fraction");
  assert.strictEqual(items(batch5Shade).length, 8);
  assert.strictEqual(batch5WholeLine.layout.header.title, "Identify Numbers on a Number Line");
  assert.strictEqual(items(batch5WholeLine).length, 6);
  assert(items(batch5WholeLine).every((item) => item.displayedFractionLabels === null));

  console.log(`Grade 3 Fraction Batch 6 checks passed; 30 seeds per implemented resource; defaults 12/6; PDFs 2/2; same-seed failures: ${sameSeedFailures}; blocked 2.`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
