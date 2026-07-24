"use strict";

const assert = require("assert");
const { Writable } = require("stream");

const { getCustomizationFamilyForResource } = require("../config/worksheetCustomization");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const {
  buildAnswerKeyItems,
  renderWorksheetPDF
} = require("../renderers/pdfRenderer");

const IDS = Object.freeze({
  numberLine: "grade5_fraction_equivalence_fraction_number_line",
  completion: "grade5_fraction_equivalence_match_equivalent_fractions",
  shade: "grade5_fraction_equivalence_shade_fraction_models"
});
const SPECS = Object.freeze({
  [IDS.numberLine]: {
    title: "Fractions on a Number Line",
    instruction: "Write the fraction shown by the point on each number line.",
    status: "generated",
    count: 6
  },
  [IDS.completion]: {
    title: "Complete Equivalent Fractions",
    instruction: "Write the missing numerator or denominator to complete each equivalent fraction.",
    status: "ready",
    count: 36
  },
  [IDS.shade]: {
    title: "Shade the Fraction",
    instruction: "Shade each model to show the fraction.",
    status: "generated",
    count: 8
  }
});
const DENOMINATORS = Object.freeze([2, 3, 4, 5, 6, 8, 9, 10, 11, 12]);
const MULTIPLIERS = Object.freeze([2, 3, 4, 5]);

class MemoryResponse extends Writable {
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

function render(runtime, includeAnswerKey = true) {
  return new Promise((resolve, reject) => {
    const response = new MemoryResponse();
    response.once("finish", () => resolve(response.buffer()));
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: {
        filename: "grade5-structured-fractions-batch5-test.pdf",
        includeAnswerKey
      }
    });
  });
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function items(runtime) {
  return runtime.normalizedContentObject.content.items;
}

function signature(runtime) {
  return items(runtime).map((item) => ({
    prompt: item.prompt,
    answer: item.answer,
    numerator: item.numerator,
    denominator: item.denominator,
    targetIndex: item.targetIndex,
    leftNumerator: item.leftNumerator,
    leftDenominator: item.leftDenominator,
    rightNumerator: item.rightNumerator,
    rightDenominator: item.rightDenominator,
    missingPosition: item.missingPosition,
    missingValue: item.missingValue,
    multiplier: item.multiplier,
    visual: item.visual,
    duplicateSignature: item.duplicateSignature
  }));
}

function assertPublicContract(runtime) {
  const spec = SPECS[runtime.item.id];
  const publicText = JSON.stringify({
    title: runtime.layout.header.title,
    subtitle: runtime.layout.header.subtitle,
    instruction: runtime.layout.instruction,
    footer: runtime.contentObject.meta.curriculum.footerText
  });
  assert.strictEqual(runtime.item.status, spec.status);
  assert.strictEqual(runtime.layout.header.title, spec.title);
  assert.strictEqual(runtime.contentObject.meta.title, spec.title);
  assert.strictEqual(runtime.layout.header.subtitle, "");
  assert.strictEqual(runtime.layout.instruction, spec.instruction);
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, "Grade 5 • Math • Fractions");
  assert.strictEqual(items(runtime).length, spec.count);
  assert.strictEqual(getCustomizationFamilyForResource(runtime.item.id), null);
  assert(!publicText.includes("— Grade 5"));
  assert(!publicText.includes(runtime.item.id));
  assert(!publicText.includes("fraction_equivalence"));
}

function assertKeyParity(runtime, fields) {
  const student = items(runtime);
  const key = buildAnswerKeyItems(student);
  assert.strictEqual(key.length, student.length);
  fields.forEach((field) => {
    assert.deepStrictEqual(
      key.map((item) => item[field]),
      student.map((item) => item[field]),
      `${runtime.item.id} ${field} parity`
    );
  });
}

function assertNumberLine(runtime) {
  assert.strictEqual(runtime.layout.template.columns, 1);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 6);
  assert.strictEqual(runtime.layout.display.fractionNumberLine, true);
  const signatures = new Set();
  items(runtime).forEach((problem) => {
    assert(DENOMINATORS.includes(problem.denominator));
    assert.strictEqual(problem.wholeStart, 0);
    assert.strictEqual(problem.wholeEnd, 1);
    assert.strictEqual(problem.intervalCount, problem.denominator);
    assert.strictEqual(problem.targetIndex, problem.numerator);
    assert.strictEqual(problem.answer, problem.displayedFractionLabels[problem.targetIndex]);
    assert.strictEqual(problem.answerState.partitionCount, problem.denominator);
    assert.strictEqual(problem.answerState.answer, problem.answer);
    assert.strictEqual(problem.visual.kind, "number_line");
    assert.strictEqual(problem.visual.data.tickCount, problem.denominator);
    assert(!signatures.has(problem.duplicateSignature));
    signatures.add(problem.duplicateSignature);
  });
  assertKeyParity(runtime, [
    "answer",
    "denominator",
    "targetIndex",
    "displayedFractionLabels",
    "answerState",
    "visual"
  ]);
}

function assertCompletion(runtime) {
  assert.strictEqual(runtime.layout.template.columns, 3);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 36);
  assert.strictEqual(runtime.layout.display.denseGridRows, 12);
  assert.strictEqual(runtime.layout.display.standardAnswerLineWidth, 42);
  const signatures = new Set();
  const positions = new Set();
  items(runtime).forEach((problem) => {
    assert(DENOMINATORS.includes(problem.leftDenominator));
    assert(MULTIPLIERS.includes(problem.multiplier));
    assert(problem.leftNumerator > 0 && problem.leftNumerator < problem.leftDenominator);
    assert.strictEqual(problem.rightNumerator, problem.leftNumerator * problem.multiplier);
    assert.strictEqual(problem.rightDenominator, problem.leftDenominator * problem.multiplier);
    assert.strictEqual(
      problem.leftNumerator * problem.rightDenominator,
      problem.rightNumerator * problem.leftDenominator
    );
    assert.strictEqual(problem.leftCrossProduct, problem.rightCrossProduct);
    assert.strictEqual(problem.equalityState, true);
    assert.strictEqual(problem.responseTarget, "equivalent_fraction_missing_value");
    assert(["right_numerator", "right_denominator"].includes(problem.missingPosition));
    assert.strictEqual(
      problem.missingValue,
      problem.missingPosition === "right_numerator"
        ? problem.rightNumerator
        : problem.rightDenominator
    );
    assert.strictEqual(problem.answer, problem.missingValue);
    assert.strictEqual(problem.answerState.missingValue, problem.missingValue);
    assert(!problem.prompt.toLowerCase().includes("match"));
    assert(!signatures.has(problem.duplicateSignature));
    signatures.add(problem.duplicateSignature);
    positions.add(problem.missingPosition);
  });
  assert.deepStrictEqual([...positions].sort(), ["right_denominator", "right_numerator"]);
  if (items(runtime).filter((item) => !item.isExample).length === 36) {
    assert.strictEqual(
      items(runtime).filter((item) => !item.isExample && item.missingPosition === "right_numerator").length,
      18
    );
    assert.strictEqual(
      items(runtime).filter((item) => !item.isExample && item.missingPosition === "right_denominator").length,
      18
    );
  }
  assertKeyParity(runtime, [
    "prompt",
    "answer",
    "leftNumerator",
    "leftDenominator",
    "rightNumerator",
    "rightDenominator",
    "missingPosition",
    "missingValue",
    "multiplier",
    "answerState"
  ]);
}

function assertShade(runtime) {
  assert.strictEqual(runtime.layout.template.columns, 2);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 8);
  assert.strictEqual(runtime.layout.display.sharedFractionRenderer, true);
  const signatures = new Set();
  items(runtime).forEach((problem) => {
    const truth = problem.fractionModel;
    const model = truth.models[0];
    assert(DENOMINATORS.includes(problem.denominator));
    assert(problem.numerator > 0 && problem.numerator < problem.denominator);
    assert.strictEqual(truth.partCount, problem.denominator);
    assert.strictEqual(truth.shadeCount, problem.numerator);
    assert.strictEqual(model.partitionCount, problem.denominator);
    assert.strictEqual(model.shadedParts, 0);
    assert.strictEqual(problem.answerState.studentShadedParts, 0);
    assert.strictEqual(problem.answerState.answerKeyShadedParts, problem.numerator);
    assert(!signatures.has(problem.duplicateSignature));
    signatures.add(problem.duplicateSignature);
  });
  assertKeyParity(runtime, [
    "answer",
    "numerator",
    "denominator",
    "fractionModel",
    "answerState",
    "visual"
  ]);
}

function assertThrows(id, options, pattern) {
  assert.throws(() => buildCatalogWorksheetRuntime(id, options), pattern);
}

async function main() {
  const defaultRuntimes = Object.values(IDS).map((id) => (
    buildCatalogWorksheetRuntime(id, { worksheetSeed: "grade5-fraction-batch5-default" })
  ));
  defaultRuntimes.forEach(assertPublicContract);
  assertNumberLine(defaultRuntimes.find((runtime) => runtime.item.id === IDS.numberLine));
  assertCompletion(defaultRuntimes.find((runtime) => runtime.item.id === IDS.completion));
  assertShade(defaultRuntimes.find((runtime) => runtime.item.id === IDS.shade));

  const defaultNumberLine = defaultRuntimes.find((runtime) => runtime.item.id === IDS.numberLine);
  const defaultCompletion = defaultRuntimes.find((runtime) => runtime.item.id === IDS.completion);
  const defaultShade = defaultRuntimes.find((runtime) => runtime.item.id === IDS.shade);
  assert.strictEqual(pageCount(await render(defaultNumberLine, true)), 2, `${IDS.numberLine} default PDF`);
  assert.strictEqual(pageCount(await render(defaultCompletion, false)), 1, `${IDS.completion} default student PDF`);
  assert.strictEqual(pageCount(await render(defaultCompletion, true)), 2, `${IDS.completion} default PDF`);
  assert.strictEqual(pageCount(await render(defaultShade, true)), 2, `${IDS.shade} default PDF`);

  let sameSeedFailures = 0;
  for (let seed = 1; seed <= 30; seed += 1) {
    for (const id of Object.values(IDS)) {
      const first = buildCatalogWorksheetRuntime(id, { worksheetSeed: `grade5-fraction-batch5-${seed}` });
      const second = buildCatalogWorksheetRuntime(id, { worksheetSeed: `grade5-fraction-batch5-${seed}` });
      if (JSON.stringify(signature(first)) !== JSON.stringify(signature(second))) sameSeedFailures += 1;
      if (id === IDS.numberLine) assertNumberLine(first);
      if (id === IDS.completion) assertCompletion(first);
      if (id === IDS.shade) assertShade(first);
    }
  }
  assert.strictEqual(sameSeedFailures, 0);

  for (const id of Object.values(IDS)) {
    const first = signature(buildCatalogWorksheetRuntime(id, { worksheetSeed: "grade5-fraction-variation-a" }));
    const second = signature(buildCatalogWorksheetRuntime(id, { worksheetSeed: "grade5-fraction-variation-b" }));
    assert.notDeepStrictEqual(first, second, `${id} different-seed variation`);
  }

  const selectedLine = buildCatalogWorksheetRuntime(IDS.numberLine, {
    worksheetSeed: "grade5-fraction-line-selected",
    selectedDenominators: "9,11,12",
    selectedFractions: ["4/9", "5/9", "6/11", "7/11", "5/12", "7/12"]
  });
  assert.deepStrictEqual(items(selectedLine).map((item) => item.denominator).sort((a, b) => a - b), [9, 9, 11, 11, 12, 12]);

  const selectedCompletion = buildCatalogWorksheetRuntime(IDS.completion, {
    worksheetSeed: "grade5-fraction-completion-selected",
    questionCount: "4",
    questionsPerPage: "4",
    selectedDenominators: [9, 11],
    selectedFractions: ["4/9", "5/11"],
    selectedMultipliers: "2,3",
    missingPosition: "mixed"
  });
  assert.strictEqual(items(selectedCompletion).length, 4);
  assert(items(selectedCompletion).every((item) => [9, 11].includes(item.leftDenominator)));
  assert(items(selectedCompletion).every((item) => [2, 3].includes(item.multiplier)));

  const selectedNumerators = buildCatalogWorksheetRuntime(IDS.completion, {
    worksheetSeed: "grade5-fraction-completion-numerators",
    questionCount: 4,
    selectedDenominators: [8, 9],
    selectedNumerators: [3, 5],
    minNumerator: 3,
    maxNumerator: 5,
    selectedMultipliers: [2]
  });
  assert(items(selectedNumerators).every((item) => [3, 5].includes(item.leftNumerator)));

  const numeratorOnly = buildCatalogWorksheetRuntime(IDS.completion, {
    worksheetSeed: "grade5-fraction-completion-numerator",
    questionCount: 4,
    selectedFractions: ["1/2", "2/3"],
    factors: [2, 3],
    missingPositions: "numerator"
  });
  assert(items(numeratorOnly).every((item) => item.missingPosition === "right_numerator"));

  const selectedShade = buildCatalogWorksheetRuntime(IDS.shade, {
    worksheetSeed: "grade5-fraction-shade-selected",
    questionCount: 4,
    questionsPerPage: 4,
    selectedDenominators: [9, 11],
    selectedFractions: ["2/9", "4/9", "3/11", "7/11"],
    modelType: "fraction_strip"
  });
  assert.deepStrictEqual([...new Set(items(selectedShade).map((item) => item.denominator))].sort((a, b) => a - b), [9, 11]);

  const endpointLine = buildCatalogWorksheetRuntime(IDS.numberLine, {
    worksheetSeed: "grade5-fraction-line-endpoints",
    questionCount: 2,
    selectedDenominators: [5],
    selectedFractions: ["0/5", "5/5"],
    allowEndpoints: true,
    endpointPolicy: "allowed"
  });
  assert.deepStrictEqual(items(endpointLine).map((item) => item.answer).sort(), ["0", "1"]);

  const exampleCompletion = buildCatalogWorksheetRuntime(IDS.completion, {
    worksheetSeed: "grade5-fraction-completion-example",
    completedExample: true
  });
  assert.strictEqual(items(exampleCompletion).length, 37);
  assert.strictEqual(items(exampleCompletion).filter((item) => item.isExample).length, 1);
  assert.strictEqual(items(exampleCompletion).filter((item) => !item.isExample).length, 36);
  assert.strictEqual(pageCount(await render(exampleCompletion, false)), 1);
  assert.strictEqual(pageCount(await render(exampleCompletion, true)), 2);

  const maxLine = buildCatalogWorksheetRuntime(IDS.numberLine, {
    worksheetSeed: "grade5-fraction-line-max",
    questionCount: 12,
    questionsPerPage: 6
  });
  const maxCompletion = buildCatalogWorksheetRuntime(IDS.completion, {
    worksheetSeed: "grade5-fraction-completion-max",
    questionCount: 36,
    questionsPerPage: 36
  });
  assert.strictEqual(pageCount(await render(maxLine, true)), 4);
  assert.strictEqual(pageCount(await render(maxCompletion, true)), 2);

  const longestCompletion = buildCatalogWorksheetRuntime(IDS.completion, {
    worksheetSeed: "grade5-fraction-completion-longest",
    questionCount: 36,
    questionsPerPage: 36,
    selectedDenominators: [9, 11, 12],
    selectedFractions: ["4/9", "5/9", "7/9", "5/11", "7/11", "10/11", "5/12", "7/12", "11/12"],
    selectedMultipliers: [4, 5],
    missingPosition: "mixed"
  });
  assert.strictEqual(items(longestCompletion).length, 36);
  assert(items(longestCompletion).some((item) => item.rightDenominator === 60));
  assert(items(longestCompletion).some((item) => item.missingValue >= 55));
  assert.strictEqual(pageCount(await render(longestCompletion, true)), 2);

  assertThrows(IDS.numberLine, { selectedDenominators: [7] }, /support denominators/i);
  assertThrows(IDS.numberLine, { selectedFractions: ["1/2", "bad"] }, /numerator\/denominator/i);
  assertThrows(IDS.numberLine, { selectedFractions: ["1/2", "2/2"] }, /proper-fraction|endpoint/i);
  assertThrows(IDS.numberLine, { selectedFractions: ["1/2"], fractions: ["1/3"] }, /aliases must agree/i);
  assertThrows(IDS.numberLine, { allowEndpoints: true, endpointPolicy: "interior_only" }, /conflict/i);
  assertThrows(IDS.numberLine, { minNumerator: 1 }, /unsupported/i);
  assertThrows(IDS.completion, { selectedMultipliers: [6] }, /multiplier/i);
  assertThrows(IDS.completion, { selectedFractions: ["4/3"] }, /proper-fraction/i);
  assertThrows(IDS.completion, { missingPosition: "left_numerator" }, /missing positions/i);
  assertThrows(IDS.completion, { taskMode: "match" }, /equation-completion/i);
  assertThrows(IDS.completion, { questionCount: 37 }, /question count/i);
  assertThrows(IDS.completion, { selectedMultipliers: [2], factors: [3] }, /aliases must agree/i);
  assertThrows(IDS.completion, { selectedNumerators: [] }, /must not be empty/i);
  assertThrows(IDS.completion, { minNumerator: 6, maxNumerator: 5 }, /must not exceed/i);
  assertThrows(IDS.completion, { answerState: { missingValue: 4 } }, /generator-owned/i);
  assertThrows(IDS.completion, { pageCount: 2 }, /not supported/i);
  assertThrows(IDS.numberLine, { leftNumerator: 1 }, /generator-owned/i);
  assertThrows(IDS.shade, { fractionModel: {} }, /generator-owned/i);
  assertThrows(IDS.shade, { fractionType: "improper" }, /not supported/i);
  assertThrows(IDS.shade, { modelType: "circle" }, /fraction strips/i);
  assertThrows(IDS.shade, { selectedFractions: ["3/3"] }, /proper-fraction/i);
  assertThrows(IDS.shade, { shadedParts: 2 }, /derives shading/i);
  assertThrows(IDS.shade, { questionCount: 9 }, /question count/i);

  const grade3Line = buildCatalogWorksheetRuntime(
    "grade3_fraction_equivalence_fraction_number_line",
    { worksheetSeed: "grade5-fraction-grade3-line-isolation" }
  );
  const grade4Shade = buildCatalogWorksheetRuntime(
    "grade4_fraction_equivalence_shade_fraction_models",
    { worksheetSeed: "grade5-fraction-grade4-shade-isolation" }
  );
  assert.strictEqual(grade3Line.layout.header.title, "Fractions on a Number Line");
  assert.strictEqual(grade4Shade.layout.header.title, "Shade the Fraction");
  assert(items(grade3Line).every((item) => [2, 3, 4, 5, 6, 8].includes(item.denominator)));
  assert(items(grade4Shade).every((item) => [2, 3, 4, 5, 6, 8, 10, 12].includes(item.denominator)));

  console.log("Grade 5 structured fractions Batch 5 tests passed.");
  console.log("Resources: 3");
  console.log("Deterministic seeds: 30");
  console.log(`Same-seed failures: ${sameSeedFailures}`);
  console.log("Different-seed variation: passed");
  console.log("Default counts: 6 / 36 / 8");
  console.log("Default PDFs: 2 / 2 / 2 pages including keys");
  console.log("Equivalent completion geometry: 3 columns × 12 rows");
  console.log("Equivalent completion balance: 18 missing numerators / 18 missing denominators");
  console.log("Structured truth, student/key parity, aliases, adversarial inputs: passed");
  console.log("Lifecycle statuses and public customization: unchanged");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
