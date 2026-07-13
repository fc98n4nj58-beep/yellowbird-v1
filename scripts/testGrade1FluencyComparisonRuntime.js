const assert = require("assert");

const {
  buildCatalogWorksheetRuntime
} = require("../services/catalogWorksheetRuntimeService");

const SUBTRACTION_ID = "g1_subtraction_facts_within_20";
const MISSING_ADDENDS_ID = "g1_missing_addends_within_20";
const COMPARE_NUMBERS_ID = "g1_compare_numbers_to_20";
const ADDITION_ID = "g1_addition_facts_within_20";
const FACT_FAMILIES_ID = "g1_fact_families_within_20";

function runtimeFor(resourceId, options = {}) {
  return buildCatalogWorksheetRuntime(resourceId, options);
}

function itemsFor(resourceId, options = {}) {
  return runtimeFor(resourceId, options).contentObject.content.items;
}

function studentItems(items) {
  return items.filter((item) => !item.isExample);
}

function requestedQuestionItems(runtime) {
  return runtime.contentObject.content.items;
}

function assertQuestion1CompletedExample(resourceId) {
  const oneQuestion = runtimeFor(resourceId, {
    questionCount: 1,
    includeExample: true,
    worksheetSeed: `${resourceId}-one-example`
  });
  const oneItems = requestedQuestionItems(oneQuestion);
  assert.strictEqual(oneItems.length, 1);
  assert.strictEqual(oneItems[0].id, 1);
  assert.strictEqual(oneItems[0].isExample, true);
  assert.strictEqual(oneQuestion.layout.display.exampleCountsAsQuestion, true);

  const twelveQuestions = runtimeFor(resourceId, {
    questionCount: 12,
    includeExample: true,
    worksheetSeed: `${resourceId}-twelve-example`
  });
  const twelveItems = requestedQuestionItems(twelveQuestions);
  assert.strictEqual(twelveItems.length, 12);
  assert.strictEqual(twelveItems[0].id, 1);
  assert.strictEqual(twelveItems[0].isExample, true);
  assert.strictEqual(twelveItems[1].id, 2);
  assert.strictEqual(twelveItems[1].isExample, false);
  assert.strictEqual(twelveQuestions.layout.display.exampleCountsAsQuestion, true);

  const sixtyQuestions = runtimeFor(resourceId, {
    questionCount: 60,
    includeExample: true,
    worksheetSeed: `${resourceId}-sixty-example`
  });
  const sixtyItems = requestedQuestionItems(sixtyQuestions);
  assert.strictEqual(sixtyItems.length, 60);
  assert.strictEqual(sixtyItems[0].id, 1);
  assert.strictEqual(sixtyItems[0].isExample, true);
  assert.strictEqual(sixtyItems[59].id, 60);
}

function studentInstruction(runtime) {
  return runtime.layout.instruction;
}

function assertDenseGrid(runtime) {
  assert.strictEqual(runtime.layout.template.columns, 4);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 60);
  assert.strictEqual(runtime.layout.display.standardShortAnswerTarget, true);
}

function assertUniqueSignatures(items) {
  const signatures = studentItems(items).map((item) => item.duplicateSignature);
  assert.strictEqual(signatures.length, new Set(signatures).size);
}

function assertSubtractionItems(items, { min = 0, max = 20 } = {}) {
  items.forEach((item) => {
    assert.strictEqual(item.type, "equation");
    assert.strictEqual(item.operation, "subtraction");
    assert.strictEqual(item.op, "-");
    assert(Number.isInteger(item.minuend), `minuend must be an integer: ${item.prompt}`);
    assert(Number.isInteger(item.subtrahend), `subtrahend must be an integer: ${item.prompt}`);
    assert(Number.isInteger(item.difference), `difference must be an integer: ${item.prompt}`);
    assert(item.minuend >= min && item.minuend <= max, `minuend outside range: ${item.prompt}`);
    assert(item.subtrahend >= min && item.subtrahend <= max, `subtrahend outside range: ${item.prompt}`);
    assert(item.difference >= min && item.difference <= max, `difference outside range: ${item.prompt}`);
    assert(item.minuend >= item.subtrahend, `negative subtraction fact: ${item.prompt}`);
    assert.strictEqual(item.minuend - item.subtrahend, item.difference);
    assert.strictEqual(item.answer, item.difference);
    assert.strictEqual(item.prompt, `${item.minuend} - ${item.subtrahend} = __`);
    assert.strictEqual(item.duplicateSignature, `subtraction:${item.minuend}:${item.subtrahend}:${item.difference}`);
  });
}

function assertMissingAddendItems(items, { min = 0, max = 20 } = {}) {
  items.forEach((item) => {
    assert.strictEqual(item.type, "equation");
    assert.strictEqual(item.op, "+");
    assert(["first_addend", "second_addend"].includes(item.missingPosition));
    assert(Number.isInteger(item.firstAddend), `firstAddend must be an integer: ${item.prompt}`);
    assert(Number.isInteger(item.secondAddend), `secondAddend must be an integer: ${item.prompt}`);
    assert(Number.isInteger(item.total), `total must be an integer: ${item.prompt}`);
    assert(Number.isInteger(item.missingValue), `missingValue must be an integer: ${item.prompt}`);
    assert(item.firstAddend >= min && item.firstAddend <= max, `firstAddend outside range: ${item.prompt}`);
    assert(item.secondAddend >= min && item.secondAddend <= max, `secondAddend outside range: ${item.prompt}`);
    assert(item.total >= min && item.total <= max, `total outside range: ${item.prompt}`);
    assert.strictEqual(item.firstAddend + item.secondAddend, item.total);
    assert.strictEqual(item.answer, item.missingValue);

    if (item.missingPosition === "first_addend") {
      assert.strictEqual(item.missingValue, item.firstAddend);
      assert.strictEqual(item.prompt, `__ + ${item.secondAddend} = ${item.total}`);
    } else {
      assert.strictEqual(item.missingValue, item.secondAddend);
      assert.strictEqual(item.prompt, `${item.firstAddend} + __ = ${item.total}`);
    }
  });
}

function assertCompareItems(items, { min = 0, max = 20, allowEquals = true } = {}) {
  items.forEach((item) => {
    assert.strictEqual(item.type, "equation");
    assert(Number.isInteger(item.leftValue), `leftValue must be an integer: ${item.prompt}`);
    assert(Number.isInteger(item.rightValue), `rightValue must be an integer: ${item.prompt}`);
    assert(item.leftValue >= min && item.leftValue <= max, `leftValue outside range: ${item.prompt}`);
    assert(item.rightValue >= min && item.rightValue <= max, `rightValue outside range: ${item.prompt}`);

    const expected = item.leftValue > item.rightValue
      ? ">"
      : item.leftValue < item.rightValue
      ? "<"
      : "=";
    const expectedResult = expected === ">"
      ? "greater_than"
      : expected === "<"
      ? "less_than"
      : "equal";
    assert.strictEqual(item.expectedSymbol, expected);
    assert.strictEqual(item.answer, expected);
    assert.strictEqual(item.comparisonResult, expectedResult);
    assert.strictEqual(item.prompt, `${item.leftValue}   ___   ${item.rightValue}`);
    assert.strictEqual(item.duplicateSignature, `compare:${item.leftValue}:${item.rightValue}:${expected}`);
    if (!allowEquals) {
      assert.notStrictEqual(item.answer, "=");
    }
  });
}

function countBy(items, field) {
  return studentItems(items).reduce((counts, item) => {
    const value = item[field];
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function countSelectedCoverage(items, numbers, fields) {
  const selected = new Set(numbers);
  return studentItems(items).filter((item) =>
    fields.some((field) => selected.has(item[field]))
  ).length;
}

function diagnosticsFor(items, code) {
  return items.flatMap((item) => Array.isArray(item.diagnostics) ? item.diagnostics : [])
    .filter((item) => item.code === code);
}

function assertSameSeed(resourceId, options) {
  const first = itemsFor(resourceId, options);
  const second = itemsFor(resourceId, options);
  assert.deepStrictEqual(
    first.map((item) => `${item.prompt}|${item.answer}|${item.isExample}`),
    second.map((item) => `${item.prompt}|${item.answer}|${item.isExample}`)
  );
}

function run() {
  const subtractionRuntime = runtimeFor(SUBTRACTION_ID, { worksheetSeed: "sub-default" });
  assertDenseGrid(subtractionRuntime);
  assert.strictEqual(studentInstruction(subtractionRuntime), "Solve each subtraction fact.");
  const subtractionItems = subtractionRuntime.contentObject.content.items;
  assert.strictEqual(subtractionItems.length, 60);
  assertSubtractionItems(subtractionItems);
  assertUniqueSignatures(subtractionItems);

  const subtractionCustom = itemsFor(SUBTRACTION_ID, {
    minimumValue: 5,
    maximumValue: 15,
    selectedValues: "7,8",
    questionCount: 30,
    worksheetSeed: "sub-selected"
  });
  assertSubtractionItems(subtractionCustom, { min: 5, max: 15 });
  assert(countSelectedCoverage(subtractionCustom, [7, 8], ["minuend", "subtrahend", "difference"]) >= 20);
  assertSameSeed(SUBTRACTION_ID, {
    minimumValue: 2,
    maximumValue: 18,
    questionCount: 25,
    worksheetSeed: "sub-same-seed"
  });

  assertQuestion1CompletedExample(SUBTRACTION_ID);

  const missingRuntime = runtimeFor(MISSING_ADDENDS_ID, { worksheetSeed: "missing-default" });
  assertDenseGrid(missingRuntime);
  assert.strictEqual(studentInstruction(missingRuntime), "Write the missing number in each equation.");
  const missingItems = missingRuntime.contentObject.content.items;
  assert.strictEqual(missingItems.length, 60);
  assertMissingAddendItems(missingItems);
  assertUniqueSignatures(missingItems);
  const missingPositionCounts = countBy(missingItems, "missingPosition");
  assert(Math.abs(missingPositionCounts.first_addend - missingPositionCounts.second_addend) <= 1);

  const firstMissing = itemsFor(MISSING_ADDENDS_ID, {
    missingPosition: "first_addend",
    questionCount: 20,
    worksheetSeed: "missing-first"
  });
  assert(firstMissing.every((item) => item.missingPosition === "first_addend"));
  assertMissingAddendItems(firstMissing);

  const secondMissing = itemsFor(MISSING_ADDENDS_ID, {
    missingPosition: "second_addend",
    questionCount: 20,
    worksheetSeed: "missing-second"
  });
  assert(secondMissing.every((item) => item.missingPosition === "second_addend"));
  assertMissingAddendItems(secondMissing);

  const selectedMissing = itemsFor(MISSING_ADDENDS_ID, {
    selectedValues: [7, 8],
    questionCount: 30,
    worksheetSeed: "missing-selected"
  });
  assert(countSelectedCoverage(selectedMissing, [7, 8], ["firstAddend", "secondAddend", "total", "missingValue"]) >= 20);
  assertSameSeed(MISSING_ADDENDS_ID, {
    missingPosition: "mixed",
    questionCount: 24,
    worksheetSeed: "missing-same-seed"
  });

  const compareRuntime = runtimeFor(COMPARE_NUMBERS_ID, { worksheetSeed: "compare-default" });
  assertDenseGrid(compareRuntime);
  assert.strictEqual(studentInstruction(compareRuntime), "Write >, <, or = to compare each pair of numbers.");
  assert.strictEqual(compareRuntime.layout.display.answerTargetVariant, "comparisonSymbol");
  const compareItems = compareRuntime.contentObject.content.items;
  assert.strictEqual(compareItems.length, 60);
  assertCompareItems(compareItems);
  assertUniqueSignatures(compareItems);
  const symbolCounts = countBy(compareItems, "expectedSymbol");
  assert(symbolCounts[">"] >= 15, `too few greater-than comparisons: ${symbolCounts[">"]}`);
  assert(symbolCounts["<"] >= 15, `too few less-than comparisons: ${symbolCounts["<"]}`);
  assert(symbolCounts["="] >= 15, `too few equality comparisons: ${symbolCounts["="]}`);

  const noEquals = itemsFor(COMPARE_NUMBERS_ID, {
    includeEqualPairs: false,
    questionCount: 40,
    worksheetSeed: "compare-no-equals"
  });
  assertCompareItems(noEquals, { allowEquals: false });

  const selectedCompare = itemsFor(COMPARE_NUMBERS_ID, {
    selectedValues: "7,8",
    questionCount: 30,
    worksheetSeed: "compare-selected"
  });
  assert(countSelectedCoverage(selectedCompare, [7, 8], ["leftValue", "rightValue"]) >= 20);
  assertSameSeed(COMPARE_NUMBERS_ID, {
    minimumValue: 3,
    maximumValue: 13,
    includeEqualPairs: true,
    questionCount: 25,
    worksheetSeed: "compare-same-seed"
  });

  const lowVariety = itemsFor(COMPARE_NUMBERS_ID, {
    minimumValue: 0,
    maximumValue: 0,
    questionCount: 3,
    worksheetSeed: "compare-low-variety"
  });
  assert(diagnosticsFor(lowVariety, "low_variety_candidate_pool").length > 0);

  const additionItems = itemsFor(ADDITION_ID, {
    questionCount: 20,
    worksheetSeed: "addition-regression"
  });
  assert.strictEqual(additionItems.length, 20);
  assert(additionItems.every((item) => item.op === "+"));
  assertQuestion1CompletedExample(ADDITION_ID);
  assertQuestion1CompletedExample(MISSING_ADDENDS_ID);
  assertQuestion1CompletedExample(COMPARE_NUMBERS_ID);

  const factFamiliesRuntime = runtimeFor(FACT_FAMILIES_ID, {
    questionCount: 8,
    worksheetSeed: "fact-family-compat"
  });
  assert.strictEqual(factFamiliesRuntime.contentObject.content.items.length, 8);

  console.log("Grade 1 fluency + comparison runtime tests passed.");
}

run();
