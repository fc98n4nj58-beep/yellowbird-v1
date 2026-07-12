const assert = require("assert");

const {
  variables,
  getCustomizationFamilyForResource
} = require("../config/worksheetCustomization");
const {
  ADDITION_FACTS_RESOURCE_ID,
  adaptAdditionFactsOptions
} = require("../config/worksheetCustomization/families/additionFactsWithin20");
const {
  normalizeWorksheetCustomization,
  serializeCanonicalPayload,
  hashCanonicalPayload
} = require("../services/worksheetCustomizationService");

function test(name, fn) {
  try {
    fn();
    process.stdout.write(".");
  } catch (error) {
    process.stdout.write("F\n");
    console.error(`\n${name}`);
    throw error;
  }
}

test("registry schema includes required foundation variables", () => {
  [
    "questionCount",
    "questionsPerPage",
    "includeExample",
    "includeAnswerKey",
    "minimumValue",
    "maximumValue",
    "selectedValues",
    "worksheetSeed"
  ].forEach((id) => {
    assert.ok(variables[id], `Missing variable ${id}`);
    assert.strictEqual(variables[id].id, id);
    assert.ok(variables[id].type);
  });
});

test("family declaration lookup resolves Addition Facts", () => {
  const family = getCustomizationFamilyForResource(ADDITION_FACTS_RESOURCE_ID);
  assert.ok(family);
  assert.strictEqual(family.id, "additionFactsWithin20");
});

test("resource override precedence supplies defaults", () => {
  const result = normalizeWorksheetCustomization(ADDITION_FACTS_RESOURCE_ID, {});
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.normalizedOptions.questionCount, 60);
  assert.strictEqual(result.normalizedOptions.maximumValue, 20);
});

test("canonical value wins over alias", () => {
  const result = normalizeWorksheetCustomization(ADDITION_FACTS_RESOURCE_ID, {
    questionCount: 24,
    count: 12,
    maxA: 15,
    maximumValue: 20
  });
  assert.strictEqual(result.normalizedOptions.questionCount, 24);
  assert.strictEqual(result.normalizedOptions.maximumValue, 20);
  assert.ok(result.unsupportedOptions.includes("count"));
});

test("conflicting aliases create diagnostics", () => {
  const result = normalizeWorksheetCustomization(ADDITION_FACTS_RESOURCE_ID, {
    maxA: 20,
    maxTotal: 18
  });
  assert.ok(result.diagnostics.some((entry) => entry.type === "alias_conflict"));
  assert.strictEqual(result.normalizedOptions.maximumValue, 20);
});

test("unsupported options are rejected", () => {
  const result = normalizeWorksheetCustomization(ADDITION_FACTS_RESOURCE_ID, {
    dotSize: 10
  });
  assert.strictEqual(result.ok, false);
  assert.ok(result.unsupportedOptions.includes("dotSize"));
  assert.strictEqual(result.canonicalPayload.options.dotSize, undefined);
});

test("multiple validation errors are returned", () => {
  const result = normalizeWorksheetCustomization(ADDITION_FACTS_RESOURCE_ID, {
    questionCount: 0,
    minimumValue: 30,
    maximumValue: 20
  });
  assert.strictEqual(result.ok, false);
  assert.ok(result.errors.length >= 2);
});

test("custom ranges produce notices", () => {
  const result = normalizeWorksheetCustomization(ADDITION_FACTS_RESOURCE_ID, {
    maximumValue: 25
  });
  assert.strictEqual(result.ok, true);
  assert.ok(result.notices.some((entry) => entry.code === "custom_range"));
});

test("selected values are deduplicated and sorted", () => {
  const result = normalizeWorksheetCustomization(ADDITION_FACTS_RESOURCE_ID, {
    selectedNumbers: "8,7,8, 5"
  });
  assert.deepStrictEqual(result.normalizedOptions.selectedValues, [5, 7, 8]);
});

test("canonical serialization is stable", () => {
  const a = normalizeWorksheetCustomization(ADDITION_FACTS_RESOURCE_ID, {
    maximumValue: 20,
    questionCount: 60,
    selectedValues: [8, 7]
  });
  const b = normalizeWorksheetCustomization(ADDITION_FACTS_RESOURCE_ID, {
    selectedValues: [7, 8],
    questionCount: 60,
    maximumValue: 20
  });
  assert.strictEqual(serializeCanonicalPayload(a.canonicalPayload), serializeCanonicalPayload(b.canonicalPayload));
});

test("option hash is stable", () => {
  const a = normalizeWorksheetCustomization(ADDITION_FACTS_RESOURCE_ID, {
    selectedValues: [8, 7]
  });
  const b = normalizeWorksheetCustomization(ADDITION_FACTS_RESOURCE_ID, {
    selectedNumbers: "7,8"
  });
  assert.strictEqual(a.optionHash, b.optionHash);
  assert.strictEqual(a.optionHash, hashCanonicalPayload(a.canonicalPayload));
});

test("answer-key changes alter hash", () => {
  const a = normalizeWorksheetCustomization(ADDITION_FACTS_RESOURCE_ID, {
    includeAnswerKey: true
  });
  const b = normalizeWorksheetCustomization(ADDITION_FACTS_RESOURCE_ID, {
    answers: "0"
  });
  assert.notStrictEqual(a.optionHash, b.optionHash);
});

test("seed changes alter hash", () => {
  const a = normalizeWorksheetCustomization(ADDITION_FACTS_RESOURCE_ID, {
    worksheetSeed: "alpha"
  });
  const b = normalizeWorksheetCustomization(ADDITION_FACTS_RESOURCE_ID, {
    worksheetSeed: "beta"
  });
  assert.notStrictEqual(a.optionHash, b.optionHash);
});

test("default omission produces equivalent hash", () => {
  const a = normalizeWorksheetCustomization(ADDITION_FACTS_RESOURCE_ID, {});
  const b = normalizeWorksheetCustomization(ADDITION_FACTS_RESOURCE_ID, {
    questionCount: 60,
    questionsPerPage: 60,
    includeExample: false,
    includeAnswerKey: true,
    minimumValue: 0,
    maximumValue: 20,
    selectedValues: [],
    worksheetSeed: "yellowbird-default"
  });
  assert.strictEqual(a.optionHash, b.optionHash);
});

test("Addition Facts adapter maps range to operand and total caps", () => {
  const mapped = adaptAdditionFactsOptions({
    questionCount: 60,
    questionsPerPage: 60,
    includeExample: false,
    minimumValue: 0,
    maximumValue: 20,
    selectedValues: [7, 8],
    worksheetSeed: "yellowbird-default"
  });
  assert.strictEqual(mapped.minA, 0);
  assert.strictEqual(mapped.maxA, 20);
  assert.strictEqual(mapped.minB, 0);
  assert.strictEqual(mapped.maxB, 20);
  assert.strictEqual(mapped.maxTotal, 20);
  assert.deepStrictEqual(mapped.selectedNumbers, [7, 8]);
});

test("existing option compatibility resolves active aliases", () => {
  const result = normalizeWorksheetCustomization(ADDITION_FACTS_RESOURCE_ID, {
    completedExample: "true",
    onlyNumbers: "3,4",
    maxA: "20",
    maxTotal: "20",
    answers: "1"
  });
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.normalizedOptions.includeExample, true);
  assert.deepStrictEqual(result.normalizedOptions.selectedValues, [3, 4]);
  assert.strictEqual(result.normalizedOptions.includeAnswerKey, true);
});

test("normalization does not mutate input objects", () => {
  const input = { selectedValues: [8, 7, 8] };
  const before = JSON.stringify(input);
  normalizeWorksheetCustomization(ADDITION_FACTS_RESOURCE_ID, input);
  assert.strictEqual(JSON.stringify(input), before);
});

console.log("\nWorksheet customization registry tests passed.");
