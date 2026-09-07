const assert = require("assert");

const worksheetCatalogService = require("../services/worksheetCatalogService");
const {
  buildCatalogWorksheetRuntime
} = require("../services/catalogWorksheetRuntimeService");
const {
  normalizeWorksheetCustomization,
  hashCanonicalPayload
} = require("../services/worksheetCustomizationService");

const RESOURCE_ID = "g1_addition_facts_within_20";

function itemsFor(options = {}) {
  return buildCatalogWorksheetRuntime(RESOURCE_ID, options).contentObject.content.items;
}

function studentItems(items) {
  return items.filter((item) => !item.isExample);
}

function requestedQuestionItems(items) {
  return items;
}

function signature(item) {
  return `${Math.min(item.a, item.b)}:${Math.max(item.a, item.b)}`;
}

function assertValidAdditionFacts(items, { min = 0, max = 20 } = {}) {
  items.forEach((item) => {
    assert.strictEqual(item.type, "equation");
    assert.strictEqual(item.op, "+");
    assert(Number.isInteger(item.a), `a must be an integer: ${item.prompt}`);
    assert(Number.isInteger(item.b), `b must be an integer: ${item.prompt}`);
    assert(item.a >= min && item.a <= max, `a outside range: ${item.prompt}`);
    assert(item.b >= min && item.b <= max, `b outside range: ${item.prompt}`);
    assert(item.a + item.b <= max, `sum outside range: ${item.prompt}`);
    assert.strictEqual(item.answer, item.a + item.b);
    assert.strictEqual(item.prompt, `${item.a} + ${item.b} = __`);
  });
}

function assertThrowsCustomization(options, code) {
  assert.throws(
    () => buildCatalogWorksheetRuntime(RESOURCE_ID, options),
    (err) => {
      const errors = err.details?.errors || [];
      return err.status === 400 && errors.some((item) => item.code === code);
    }
  );
}

function run() {
  const defaultItems = itemsFor({ worksheetSeed: "runtime-default" });
  assert.strictEqual(defaultItems.length, 60);
  assertValidAdditionFacts(defaultItems);
  assert.strictEqual(studentItems(defaultItems).length, 60);

  const explicitDefaults = itemsFor({
    minimumValue: 0,
    maximumValue: 20,
    questionCount: 60,
    includeExample: false,
    worksheetSeed: "runtime-default"
  });
  assert.deepStrictEqual(
    explicitDefaults.map((item) => item.prompt),
    defaultItems.map((item) => item.prompt)
  );

  const twentyCount = itemsFor({ questionCount: 20, worksheetSeed: "count-20" });
  assert.strictEqual(twentyCount.length, 20);
  assert.strictEqual(studentItems(twentyCount).length, 20);

  const includeExample = itemsFor({
    questionCount: 20,
    includeExample: true,
    worksheetSeed: "with-example"
  });
  assert.strictEqual(includeExample.length, 20);
  assert.strictEqual(includeExample[0].isExample, true);
  assert.strictEqual(includeExample[0].id, 1);
  assert.strictEqual(includeExample[1].id, 2);
  assert.strictEqual(studentItems(includeExample).length, 19);
  assert.strictEqual(requestedQuestionItems(includeExample).length, 20);
  assertValidAdditionFacts(includeExample);

  const selected = itemsFor({
    questionCount: 30,
    selectedValues: "7,8",
    worksheetSeed: "selected-values"
  });
  const selectedStudentItems = studentItems(selected);
  const selectedCoverage = selectedStudentItems.filter((item) =>
    item.a === 7 || item.b === 7 || item.a === 8 || item.b === 8
  ).length;
  assert(selectedCoverage >= 20, `selected coverage too low: ${selectedCoverage}`);
  assertValidAdditionFacts(selected);

  assertThrowsCustomization({
    minimumValue: 5,
    maximumValue: 10,
    selectedValues: "4,8"
  }, "selected_values_outside_range");

  assertThrowsCustomization({
    minimumValue: 12,
    maximumValue: 8
  }, "minimum_exceeds_maximum");

  assertThrowsCustomization({
    questionCount: 5,
    unknownControl: 1
  }, "unsupported_options");

  assert.doesNotThrow(() => buildCatalogWorksheetRuntime(RESOURCE_ID, {
    questionCount: 5,
    disposition: "inline",
    filename: "ignored-by-customization.pdf"
  }));

  for (const selectedValues of [[15], [10, 15], [10, 15, 18]]) {
    assertThrowsCustomization({ minimumValue: 10, maximumValue: 20, selectedValues, questionCount: 12 }, "selected_values_infeasible");
  }
  for (const minimumValue of [12, 20]) {
    assertThrowsCustomization({ minimumValue, maximumValue: 20 }, "empty_addition_fact_pool");
  }
  assertThrowsCustomization({ minimumValue: 30, maximumValue: 30, questionCount: 2 }, "empty_addition_fact_pool");

  const feasibleRepeat = itemsFor({ minimumValue: 10, maximumValue: 20, selectedValues: [10], questionCount: 12 });
  assert.strictEqual(feasibleRepeat.length, 12);
  assert(feasibleRepeat.every(item => item.a === 10 && item.b === 10 && item.answer === 20));
  const shortEmphasis = itemsFor({ questionCount: 1, selectedValues: [7, 8] });
  assert.strictEqual(shortEmphasis.length, 1);
  assertValidAdditionFacts(shortEmphasis);
  assertValidAdditionFacts(itemsFor({ maximumValue: 30, selectedValues: [25] }), { max: 30 });

  const tightRange = itemsFor({
    minimumValue: 10,
    maximumValue: 20,
    questionCount: 15,
    worksheetSeed: "tight-range"
  });
  assertValidAdditionFacts(tightRange, { min: 10, max: 20 });
  assert(tightRange.every((item) => item.a === 10 && item.b === 10));

  const extendedRange = itemsFor({
    minimumValue: 0,
    maximumValue: 30,
    selectedValues: "18,20",
    questionCount: 40,
    worksheetSeed: "wide-print"
  });
  assertValidAdditionFacts(extendedRange, { min: 0, max: 30 });
  assert(extendedRange.some((item) => item.a >= 10 || item.b >= 10));
  assert(extendedRange.every((item) => item.prompt.length <= "30 + 30 = __".length));

  const uniqueTwenty = itemsFor({
    questionCount: 20,
    worksheetSeed: "unique-twenty"
  });
  assert.strictEqual(new Set(uniqueTwenty.map(signature)).size, 20);

  const repeatedSmallPool = itemsFor({
    minimumValue: 10,
    maximumValue: 20,
    questionCount: 20,
    worksheetSeed: "repeat-small-pool"
  });
  assert.strictEqual(new Set(repeatedSmallPool.map(signature)).size, 1);
  assert.strictEqual(repeatedSmallPool.length, 20);

  const seededA = itemsFor({
    questionCount: 25,
    selectedValues: [3, 9],
    worksheetSeed: "same-seed"
  });
  const seededB = itemsFor({
    questionCount: 25,
    selectedValues: "3,9",
    worksheetSeed: "same-seed"
  });
  assert.deepStrictEqual(
    seededA.map((item) => `${item.prompt}|${item.answer}`),
    seededB.map((item) => `${item.prompt}|${item.answer}`)
  );

  const seededC = itemsFor({
    questionCount: 25,
    selectedValues: [3, 9],
    worksheetSeed: "different-seed"
  });
  assert.notDeepStrictEqual(
    seededA.map((item) => item.prompt),
    seededC.map((item) => item.prompt)
  );

  const aliasRuntime = itemsFor({
    minA: 2,
    maxA: 12,
    maxTotal: 12,
    selectedNumbers: "4,6",
    questionCount: 18,
    worksheetSeed: "aliases"
  });
  assertValidAdditionFacts(aliasRuntime, { min: 2, max: 12 });

  const normalized = normalizeWorksheetCustomization(RESOURCE_ID, {
    minimumValue: 0,
    maximumValue: 30,
    questionCount: 10,
    includeAnswerKey: false
  });
  assert.strictEqual(normalized.ok, true);
  assert(normalized.notices.some((item) => item.code === "custom_range"));
  assert.strictEqual(normalized.generatorOptions.maxTotal, 30);
  assert.strictEqual(normalized.canonicalPayload.includeAnswerKey, false);
  assert.strictEqual(hashCanonicalPayload(normalized.canonicalPayload), normalized.optionHash);

  const includeAnswers = normalizeWorksheetCustomization(RESOURCE_ID, {
    questionCount: 10,
    includeAnswerKey: true
  });
  const omitAnswers = normalizeWorksheetCustomization(RESOURCE_ID, {
    questionCount: 10,
    includeAnswerKey: false
  });
  assert.notStrictEqual(includeAnswers.optionHash, omitAnswers.optionHash);

  const multiPage = buildCatalogWorksheetRuntime(RESOURCE_ID, {
    questionCount: 75,
    questionsPerPage: 60,
    includeExample: true,
    worksheetSeed: "multi-page"
  });
  assert.strictEqual(multiPage.contentObject.content.items.length, 75);
  assert.strictEqual(studentItems(multiPage.contentObject.content.items).length, 74);
  assert.strictEqual(multiPage.layout.template.maxProblemsPerPage, 60);

  const worksheet = worksheetCatalogService.generateWorksheetFromCatalogId(RESOURCE_ID, {
    questionCount: 12,
    includeExample: true,
    worksheetSeed: "worksheet-count"
  });
  assert.strictEqual(worksheet.problems.length, 12);

  const noMutationInput = {
    questionCount: 8,
    selectedValues: [5, 6],
    worksheetSeed: "no-mutation"
  };
  const before = JSON.stringify(noMutationInput);
  normalizeWorksheetCustomization(RESOURCE_ID, noMutationInput);
  assert.strictEqual(JSON.stringify(noMutationInput), before);

  console.log("Addition Facts customization runtime tests passed.");
}

run();
