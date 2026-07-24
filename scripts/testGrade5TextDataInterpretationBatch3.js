"use strict";

const assert = require("assert");
const crypto = require("crypto");
const { Writable } = require("stream");

const { getCustomizationFamilyForResource } = require("../config/worksheetCustomization");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF, buildAnswerKeyItems } = require("../renderers/pdfRenderer");

const ID = "g5_interpret_graphs";
const DEFAULT_COUNT = 12;
const MAXIMUM_UNIQUE_COUNT = 17;
const QUESTIONS_PER_PAGE = 6;
const LOWER_GRADE_SIGNATURES = Object.freeze({
  grade1_data_display_graphing_interpret_data:
    "5fc52fe1dce57d9cda0971cc775bef9ceaf6dc8b00239b195efcb0bfceedf9ea",
  grade2_data_display_graphing_interpret_data:
    "7fc082251757a437fa653456eae394a0264d068017c08f8c8e3b380bfbd2fed3",
  g3_interpret_data:
    "90b58654f9fbc38c774e1e492631021efaab323d9a505cb139ddc9481ec3a9d1"
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

function signature(runtime) {
  return JSON.stringify({
    content: runtime.normalizedContentObject,
    layoutProblems: runtime.layout.problems,
    template: runtime.layout.template,
    display: runtime.layout.display
  });
}

function itemSignature(runtime) {
  return JSON.stringify(items(runtime).map((item) => ({
    prompt: item.prompt,
    answer: item.answer,
    acceptedAnswerVariants: item.acceptedAnswerVariants,
    graphData: item.graphData,
    graphQuestionType: item.graphQuestionType,
    graphCategory: item.graphCategory,
    responseType: item.responseType,
    responseTarget: item.responseTarget,
    answerState: item.answerState,
    duplicateSignature: item.duplicateSignature,
    isExample: item.isExample
  })));
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizePdfMetadata(buffer) {
  return Buffer.from(
    buffer.toString("latin1")
      .replace(
        /\/ID \[<[^>]+> <[^>]+>\]/g,
        "/ID [<00000000000000000000000000000000> <00000000000000000000000000000000>]"
      )
      .replace(/\(D:\d{14}Z\)/g, "(D:20000101000000Z)"),
    "latin1"
  );
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
        filename: "grade5-text-data-interpretation-batch3-test.pdf",
        includeAnswerKey
      }
    });
  });
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function questionGroup(questionType) {
  if (["maximum_category", "minimum_category", "middle_value_category"].includes(questionType)) {
    return "category_identification";
  }
  if (questionType.startsWith("difference_")) return "difference";
  if (questionType === "total_responses" || questionType.startsWith("combined_")) {
    return "combined_total";
  }
  if (questionType.startsWith("order_")) return "ordering";
  if (questionType.startsWith("true_false_")) return "true_false";
  throw new Error(`Unknown Grade 5 text-data question type '${questionType}'.`);
}

function assertCommonStructuredTruth(item) {
  assert.strictEqual(item.graphData.datasetId, "grade5_text_data:sport_choices");
  assert.strictEqual(item.graphData.title, "Student Sport Choices");
  assert.strictEqual(item.graphData.graphType, "text_data");
  assert.strictEqual(item.graphData.modelType, "text_described_quantities");
  assert.deepStrictEqual(
    item.graphData.categories.map(({ id, label, value }) => ({ id, label, value })),
    [
      { id: "soccer", label: "Soccer", value: 12 },
      { id: "basketball", label: "Basketball", value: 9 },
      { id: "baseball", label: "Baseball", value: 6 }
    ]
  );
  assert.strictEqual(item.graphData.totalValue, 27);
  assert.strictEqual(item.answerState.kind, "grade5_text_data_answer");
  assert.strictEqual(item.answerState.datasetId, item.graphData.datasetId);
  assert.strictEqual(item.answerState.datasetTitle, item.graphData.title);
  assert.strictEqual(item.answerState.questionType, item.graphQuestionType);
  assert.strictEqual(item.answerState.expectedAnswer, item.answer);
  assert.deepStrictEqual(item.answerState.acceptedAnswerVariants, item.acceptedAnswerVariants);
  assert(item.acceptedAnswerVariants.some((variant) => variant === item.answer));
  assert.strictEqual(
    item.duplicateSignature,
    [
      "grade5_text_data",
      item.graphData.datasetId,
      item.graphQuestionType,
      item.answerState.categoryIds.join("+"),
      item.answerState.proposition || "",
      item.responseTarget
    ].join(":")
  );
}

function assertEveryQuestionType(runtime) {
  const source = items(runtime);
  assert.strictEqual(source.length, MAXIMUM_UNIQUE_COUNT);
  assert.strictEqual(new Set(source.map((item) => item.prompt)).size, MAXIMUM_UNIQUE_COUNT);
  assert.strictEqual(
    new Set(source.map((item) => item.duplicateSignature)).size,
    MAXIMUM_UNIQUE_COUNT
  );
  const correctedCopy = {
    total_responses: {
      prompt: "How many student choices are recorded altogether?",
      answer: 27,
      signature:
        "grade5_text_data:grade5_text_data:sport_choices:total_responses:soccer+basketball+baseball::number"
    },
    combined_soccer_basketball: {
      prompt: "How many students chose Soccer and Basketball altogether?",
      answer: 21,
      signature:
        "grade5_text_data:grade5_text_data:sport_choices:combined_soccer_basketball:soccer+basketball::number"
    },
    combined_soccer_baseball: {
      prompt: "How many students chose Soccer and Baseball altogether?",
      answer: 18,
      signature:
        "grade5_text_data:grade5_text_data:sport_choices:combined_soccer_baseball:soccer+baseball::number"
    },
    combined_basketball_baseball: {
      prompt: "How many students chose Basketball and Baseball altogether?",
      answer: 15,
      signature:
        "grade5_text_data:grade5_text_data:sport_choices:combined_basketball_baseball:basketball+baseball::number"
    }
  };
  Object.entries(correctedCopy).forEach(([questionType, expected]) => {
    const item = source.find((candidate) => candidate.graphQuestionType === questionType);
    assert(item, `Missing ${questionType}.`);
    assert.strictEqual(item.prompt, expected.prompt);
    assert.strictEqual(item.answer, expected.answer);
    assert.strictEqual(item.duplicateSignature, expected.signature);
  });
  assert(source
    .filter((item) => item.graphQuestionType.startsWith("combined_"))
    .every((item) => !item.prompt.includes(" or ")));
  assert(source.every((item) => !item.prompt.includes("recorded in all")));
  assert.strictEqual(
    source.filter((item) => item.graphQuestionType.startsWith("combined_") &&
      item.prompt.includes(" and ")).length,
    3
  );

  source.forEach((item) => {
    assertCommonStructuredTruth(item);
    const state = item.answerState;
    const group = questionGroup(item.graphQuestionType);
    if (group === "category_identification") {
      assert.strictEqual(state.selectedCategoryLabel, item.answer);
      assert.strictEqual(state.selectedCategoryId, state.categoryIds[0]);
      assert(Number.isInteger(state.selectedValue));
    } else if (group === "difference") {
      assert.strictEqual(
        state.minuendCategory.value - state.subtrahendCategory.value,
        item.answer
      );
      assert.strictEqual(state.difference, item.answer);
    } else if (group === "combined_total") {
      assert.strictEqual(
        state.componentValues.reduce((sum, value) => sum + value, 0),
        item.answer
      );
      assert.strictEqual(state.total, item.answer);
    } else if (group === "ordering") {
      assert.strictEqual(state.orderedCategoryLabels.join(", "), item.answer);
      assert.strictEqual(state.orderedCategoryIds.length, 3);
    } else {
      assert.strictEqual(typeof state.propositionTruth, "boolean");
      assert.strictEqual(state.expectedBoolean, state.propositionTruth);
      assert.strictEqual(state.displayAnswer, item.answer);
      assert.strictEqual(state.expectedBoolean ? "True" : "False", item.answer);
    }
  });
}

function assertParity(runtime) {
  const source = items(runtime);
  const preview = runtime.layout.problems;
  const key = buildAnswerKeyItems(source);
  assert.strictEqual(preview.length, source.length);
  assert.strictEqual(key.length, source.length);
  source.forEach((item, index) => {
    for (const peer of [preview[index], key[index]]) {
      assert.strictEqual(peer.prompt, item.prompt);
      assert.strictEqual(peer.answer, item.answer);
      assert.deepStrictEqual(peer.acceptedAnswerVariants, item.acceptedAnswerVariants);
      assert.deepStrictEqual(peer.graphData, item.graphData);
      assert.deepStrictEqual(peer.answerState, item.answerState);
      assert.strictEqual(peer.duplicateSignature, item.duplicateSignature);
    }
  });
}

async function assertPublicAndDefaultContract() {
  const runtime = buildCatalogWorksheetRuntime(ID, { worksheetSeed: "g5-b3-contract" });
  const source = items(runtime);
  assert.strictEqual(runtime.item.status, "ready");
  assert.strictEqual(getCustomizationFamilyForResource(ID), null);
  assert.strictEqual(runtime.layout.header.title, "Interpret the Data");
  assert.strictEqual(runtime.layout.instruction, "Use the data to answer each question.");
  assert.strictEqual(
    runtime.contentObject.meta.curriculum.footerText,
    "Grade 5 • Math • Data & Graphing"
  );
  assert.strictEqual(runtime.layout.header.subtitle, "");
  assert.strictEqual(source.length, DEFAULT_COUNT);
  assert.strictEqual(new Set(source.map((item) => item.prompt)).size, DEFAULT_COUNT);
  assert.strictEqual(new Set(source.map((item) => item.duplicateSignature)).size, DEFAULT_COUNT);
  assert(source.every((item) => !/A graph shows|Soccer\\s*=|Basketball\\s*=|Baseball\\s*=/.test(item.prompt)));
  assert(!runtime.layout.instruction.includes("Students use"));
  assert(!runtime.contentObject.meta.curriculum.footerText.includes("data_display_graphing"));

  assert.strictEqual(runtime.layout.template.columns, 1);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, QUESTIONS_PER_PAGE);
  assert.strictEqual(runtime.layout.display.sharedTextDataPanel, true);
  assert.strictEqual(runtime.layout.display.sharedDataPictograph, undefined);
  assert.deepStrictEqual(runtime.layout.display.sharedTextDataSummary, {
    datasetId: "grade5_text_data:sport_choices",
    title: "Student Sport Choices",
    categories: [
      { id: "soccer", label: "Soccer", value: 12 },
      { id: "basketball", label: "Basketball", value: 9 },
      { id: "baseball", label: "Baseball", value: 6 }
    ]
  });
  assert.deepStrictEqual(runtime.layout.display.dataResponseLineWidths, {
    number: 72,
    category: 138,
    ordering: 286,
    true_false: 84
  });
  assert(source.every((item) => !item.visual));

  const distribution = source.reduce((counts, item) => {
    const group = questionGroup(item.graphQuestionType);
    counts[group] = (counts[group] || 0) + 1;
    return counts;
  }, {});
  assert.deepStrictEqual(distribution, {
    category_identification: 2,
    ordering: 2,
    combined_total: 3,
    true_false: 2,
    difference: 3
  });
  source.forEach(assertCommonStructuredTruth);
  assertParity(runtime);

  const withKey = await render(runtime, true);
  const withoutKey = await render(runtime, false);
  assert.strictEqual(pageCount(withKey), 4);
  assert.strictEqual(pageCount(withoutKey), 2);
}

async function assertMaximumAndModes() {
  const maximum = buildCatalogWorksheetRuntime(ID, {
    worksheetSeed: "g5-b3-maximum",
    questionCount: MAXIMUM_UNIQUE_COUNT,
    textDataQuestionMode: "all"
  });
  assertEveryQuestionType(maximum);
  assertParity(maximum);
  assert.strictEqual(pageCount(await render(maximum)), 6);

  assert.throws(() => buildCatalogWorksheetRuntime(ID, {
    worksheetSeed: "g5-b3-over-maximum",
    questionCount: MAXIMUM_UNIQUE_COUNT + 1
  }), /17|question count/i);
  assert.throws(() => buildCatalogWorksheetRuntime(ID, {
    worksheetSeed: "g5-b3-example-over-maximum",
    questionCount: MAXIMUM_UNIQUE_COUNT,
    includeExample: true
  }), /16 unique student questions/i);

  const modes = [
    ["difference", 4, new Set(["difference"])],
    ["combined_total", 4, new Set(["combined_total"])],
    ["ordering_true_false", 6, new Set(["ordering", "true_false"])]
  ];
  modes.forEach(([mode, count, groups]) => {
    const runtime = buildCatalogWorksheetRuntime(ID, {
      worksheetSeed: `g5-b3-mode-${mode}`,
      questionCount: count,
      questionMode: mode
    });
    assert.strictEqual(items(runtime).length, count);
    assert.strictEqual(new Set(items(runtime).map((item) => item.prompt)).size, count);
    assert(items(runtime).every((item) => groups.has(questionGroup(item.graphQuestionType))));
    items(runtime).forEach(assertCommonStructuredTruth);
    assertParity(runtime);
  });
}

async function assertCompletedExample() {
  for (const [index, alias] of ["includeExample", "completedExample", "example"].entries()) {
    const runtime = buildCatalogWorksheetRuntime(ID, {
      worksheetSeed: `g5-b3-example-${index}`,
      [alias]: true
    });
    const exampleItems = items(runtime).filter((item) => item.isExample);
    const practiceItems = items(runtime).filter((item) => !item.isExample);
    assert.strictEqual(exampleItems.length, 1);
    assert.strictEqual(practiceItems.length, DEFAULT_COUNT);
    assert.strictEqual(exampleItems[0].prompt, "Which sport was chosen by the most students?");
    assert.strictEqual(exampleItems[0].answer, "Soccer");
    assert(!practiceItems.some(
      (item) => item.duplicateSignature === exampleItems[0].duplicateSignature
    ));
    assert.strictEqual(pageCount(await render(runtime)), 4);
    assertParity(runtime);
  }
}

async function assertSameSeedReliability() {
  const fixedOptions = { worksheetSeed: "g5-b3-fixed-seed" };
  const baseline = buildCatalogWorksheetRuntime(ID, fixedOptions);
  const baselineSignature = signature(baseline);
  let sameSeedFailures = 0;
  for (let build = 0; build < 100; build += 1) {
    if (signature(buildCatalogWorksheetRuntime(ID, fixedOptions)) !== baselineSignature) {
      sameSeedFailures += 1;
    }
  }
  assert.strictEqual(sameSeedFailures, 0);

  for (let seed = 1; seed <= 30; seed += 1) {
    const options = { worksheetSeed: `g5-b3-paired-${seed}` };
    assert.strictEqual(
      signature(buildCatalogWorksheetRuntime(ID, options)),
      signature(buildCatalogWorksheetRuntime(ID, options))
    );
  }

  const firstPdf = normalizePdfMetadata(await render(
    buildCatalogWorksheetRuntime(ID, fixedOptions)
  ));
  const secondPdf = normalizePdfMetadata(await render(
    buildCatalogWorksheetRuntime(ID, fixedOptions)
  ));
  assert.deepStrictEqual(firstPdf, secondPdf);
  return { sameSeedFailures, pdfHash: sha256(firstPdf) };
}

function assertDifferentSeedVariation() {
  const variants = new Set();
  for (let seed = 1; seed <= 30; seed += 1) {
    variants.add(itemSignature(buildCatalogWorksheetRuntime(ID, {
      worksheetSeed: `g5-b3-variation-${seed}`
    })));
  }
  assert(variants.size > 1);
  return variants.size;
}

async function assertStateIsolation() {
  const seedA = { worksheetSeed: "g5-b3-state-a" };
  const before = signature(buildCatalogWorksheetRuntime(ID, seedA));
  buildCatalogWorksheetRuntime(ID, { worksheetSeed: "g5-b3-state-b" });
  const after = signature(buildCatalogWorksheetRuntime(ID, seedA));
  assert.strictEqual(after, before);

  const withKeyRuntime = buildCatalogWorksheetRuntime(ID, { worksheetSeed: "g5-b3-key-state" });
  const studentBefore = itemSignature(withKeyRuntime);
  await render(withKeyRuntime, false);
  await render(withKeyRuntime, true);
  assert.strictEqual(itemSignature(withKeyRuntime), studentBefore);
}

function assertInvalidInputs() {
  const invalidOptions = [
    { questionCount: 0 },
    { questionCount: 18 },
    { questionCount: 2.5 },
    { questionsPerPage: 0 },
    { questionsPerPage: 7 },
    { questionsPerPage: 2.5 },
    { includeExample: "sometimes" },
    { includeExample: true, completedExample: false },
    { questionMode: "unsupported" },
    { questionMode: "difference", textDataQuestionMode: "combined_total" },
    { questionMode: "difference", questionCount: 5 },
    { dataSets: [] },
    { selectedDataSets: ["sports"] },
    { categories: ["Soccer", "Basketball", "Baseball"] },
    { categoryValues: [12, 9, 6] },
    { selectedQuestionTypes: ["difference"] },
    { prompt: "Caller-owned prompt" },
    { answer: 3 },
    { answerState: { value: 3 } },
    { responseTarget: "number" },
    { duplicateSignature: "caller-owned" },
    { graphData: { categories: [] } }
  ];
  invalidOptions.forEach((options) => {
    assert.throws(
      () => buildCatalogWorksheetRuntime(ID, {
        worksheetSeed: "g5-b3-invalid",
        ...options
      }),
      `Expected invalid input rejection for ${JSON.stringify(options)}`
    );
  });
}

function assertLowerGradeAndClosedBatchIsolation() {
  Object.entries(LOWER_GRADE_SIGNATURES).forEach(([id, expectedHash]) => {
    const runtime = buildCatalogWorksheetRuntime(id, {
      worksheetSeed: "g5-b3-lower-grade-guard"
    });
    assert.strictEqual(sha256(JSON.stringify(items(runtime))), expectedHash, `${id} changed.`);
  });

  for (const id of [
    "grade5_patterning_and_algebra_extend_pattern",
    "grade5_patterning_and_algebra_identify_pattern_rule",
    "grade5_patterning_and_algebra_missing_value_pattern",
    "grade5_addition_subtraction_facts_equation_match",
    "grade5_place_value_representation_compare_numbers"
  ]) {
    const first = buildCatalogWorksheetRuntime(id, { worksheetSeed: "g5-b3-closed-batch" });
    const second = buildCatalogWorksheetRuntime(id, { worksheetSeed: "g5-b3-closed-batch" });
    assert.strictEqual(itemSignature(first), itemSignature(second), `${id} lost determinism.`);
  }
}

async function run() {
  await assertPublicAndDefaultContract();
  await assertMaximumAndModes();
  await assertCompletedExample();
  const sameSeed = await assertSameSeedReliability();
  const variationCount = assertDifferentSeedVariation();
  await assertStateIsolation();
  assertInvalidInputs();
  assertLowerGradeAndClosedBatchIsolation();
  console.log(JSON.stringify({
    resource: ID,
    fixedSeedBuilds: 100,
    pairedSeeds: 30,
    sameSeedFailures: sameSeed.sameSeedFailures,
    fixedSeedPdfHash: sameSeed.pdfHash,
    differentSeedVariants: variationCount,
    defaultQuestions: DEFAULT_COUNT,
    maximumUniqueQuestions: MAXIMUM_UNIQUE_COUNT,
    defaultPdfPages: 4,
    maximumPdfPages: 6,
    completedExamplePdfPages: 4,
    publicCustomizationFamilies: 0
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
