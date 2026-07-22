const assert = require("assert");
const { Writable } = require("stream");

const {
  buildCatalogWorksheetRuntime
} = require("../services/catalogWorksheetRuntimeService");
const {
  renderWorksheetPDF,
  buildAnswerKeyItems
} = require("../renderers/pdfRenderer");

const FOOTER = "Grade 3 • Math • Place Value";
const SPECS = Object.freeze({
  grade3_place_value_representation_expanded_form: Object.freeze({
    title: "Expanded Form",
    instruction: "Write each numeral in expanded form.",
    count: 45,
    pages: 2
  }),
  grade3_place_value_representation_number_word_match: Object.freeze({
    title: "Write Number Words",
    instruction: "Write each number in words.",
    count: 12,
    pages: 2
  }),
  grade3_place_value_representation_standard_form: Object.freeze({
    title: "Standard Form",
    instruction: "Write each number in standard form.",
    count: 45,
    pages: 2
  })
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

function renderRuntime(runtime, includeAnswerKey = true) {
  return new Promise((resolve, reject) => {
    const response = new BufferResponse();
    response.once("finish", () => resolve(response.buffer()));
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: {
        filename: "grade3-place-value-batch2-test.pdf",
        includeAnswerKey
      }
    });
  });
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function truth(runtime) {
  return runtime.normalizedContentObject.content.items.map((item) => ({
    id: item.id,
    prompt: item.prompt,
    answer: item.answer,
    value: item.value,
    isExample: item.isExample
  }));
}

function assertPublicContract(resourceId, runtime, spec) {
  assert.strictEqual(runtime.item.status, "ready");
  assert.strictEqual(runtime.layout.header.title, spec.title);
  assert.strictEqual(runtime.contentObject.meta.title, spec.title);
  assert.strictEqual(runtime.layout.header.subtitle, "");
  assert.strictEqual(runtime.layout.instruction, spec.instruction);
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, FOOTER);
  assert.strictEqual(runtime.normalizedContentObject.content.items.length, spec.count);

  const publicText = [
    runtime.contentObject.meta.title,
    runtime.contentObject.meta.subheading,
    runtime.layout.instruction,
    runtime.contentObject.meta.curriculum.footerText,
    ...runtime.normalizedContentObject.content.items.map((item) => item.prompt)
  ].join(" ");

  assert(!publicText.includes("— Grade 3"));
  assert(!publicText.includes(resourceId));
  assert(!publicText.includes("place_value_representation"));
  assert(!publicText.includes("Students "));
  const promptText = runtime.normalizedContentObject.content.items.map((item) => item.prompt).join(" ");
  assert(!promptText.includes(spec.instruction), "item prompts must not repeat the worksheet instruction");
}

function assertParity(runtime) {
  const previewItems = runtime.layout.problems;
  const pdfItems = runtime.normalizedContentObject.content.items;
  const answerItems = buildAnswerKeyItems(pdfItems);
  assert.strictEqual(previewItems.length, pdfItems.length);
  assert.strictEqual(answerItems.length, pdfItems.length);

  pdfItems.forEach((item, index) => {
    assert.strictEqual(previewItems[index].prompt, item.prompt);
    assert.deepStrictEqual(previewItems[index].answer, item.answer);
    assert.strictEqual(answerItems[index].id, item.id);
    assert.deepStrictEqual(answerItems[index].answer, item.answer);
    assert.strictEqual(answerItems[index].prompt, item.prompt);
  });
}

function assertThreeDigitDefaults(resourceId, runtime) {
  runtime.normalizedContentObject.content.items.forEach((item) => {
    const value = resourceId.includes("number_word_match") ? Number(item.prompt) : item.value;
    assert(Number.isInteger(value) && value >= 100 && value <= 999, `${resourceId} value outside 100-999`);
  });
}

async function testDefaultContracts() {
  for (const [resourceId, spec] of Object.entries(SPECS)) {
    const query = { worksheetSeed: "grade3-place-value-batch2-default" };
    const runtime = buildCatalogWorksheetRuntime(resourceId, query);
    const repeat = buildCatalogWorksheetRuntime(resourceId, query);
    const beforeRender = truth(runtime);

    assertPublicContract(resourceId, runtime, spec);
    assertThreeDigitDefaults(resourceId, runtime);
    assert.deepStrictEqual(truth(runtime), truth(repeat));
    assertParity(runtime);

    if (resourceId.includes("number_word_match")) {
      const pairs = runtime.normalizedContentObject.content.items.map((item) => `${item.prompt}|${item.answer}`);
      assert.strictEqual(new Set(pairs).size, pairs.length);
      assert(runtime.layout.display.writingLine);
      assert.strictEqual(runtime.layout.display.numberWordResponseTarget, "writtenWord");
      assert(runtime.normalizedContentObject.content.items.every((item) => /^\d{3}$/.test(item.prompt)));
    } else {
      assert.strictEqual(runtime.layout.template.columns, 3);
      assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 45);
    }

    const pdf = await renderRuntime(runtime, true);
    assert.strictEqual(pageCount(pdf), spec.pages);
    assert.deepStrictEqual(truth(runtime), beforeRender, "PDF rendering must not mutate preview truth");
  }
}

function testRangeCountAndSelectionVariables() {
  const expanded = buildCatalogWorksheetRuntime("grade3_place_value_representation_expanded_form", {
    worksheetSeed: "grade3-b2-expanded-range",
    questionCount: 7,
    minA: 320,
    maxA: 329,
    questionsPerPage: 4
  });
  assert.strictEqual(expanded.normalizedContentObject.content.items.length, 7);
  assert.strictEqual(expanded.layout.template.maxProblemsPerPage, 4);
  expanded.normalizedContentObject.content.items.forEach((item) => {
    assert(item.value >= 320 && item.value <= 329);
  });

  for (const alias of ["selectedNumbers", "onlyNumbers"]) {
    const selectedExpanded = buildCatalogWorksheetRuntime("grade3_place_value_representation_expanded_form", {
      worksheetSeed: `grade3-b2-expanded-${alias}`,
      questionCount: 6,
      [alias]: "123,456"
    });
    selectedExpanded.normalizedContentObject.content.items.forEach((item) => {
      assert([123, 456].includes(item.value));
    });

    const selectedStandard = buildCatalogWorksheetRuntime("grade3_place_value_representation_standard_form", {
      worksheetSeed: `grade3-b2-standard-${alias}`,
      questionCount: 6,
      [alias]: [234, 567]
    });
    selectedStandard.normalizedContentObject.content.items.forEach((item) => {
      assert([234, 567].includes(item.value));
      assert.strictEqual(item.answer, item.value);
    });
  }

  const fixedWords = buildCatalogWorksheetRuntime("grade3_place_value_representation_number_word_match", {
    worksheetSeed: "grade3-b2-fixed-words",
    questionCount: 1,
    minA: 342,
    maxA: 342,
    promptType: "number_only"
  });
  assert.strictEqual(fixedWords.normalizedContentObject.content.items[0].prompt, "342");
  assert.strictEqual(fixedWords.normalizedContentObject.content.items[0].answer, "three hundred forty-two");
}

function testDirectionAndAnswerStyleVariables() {
  for (const [alias, value] of [["numberWordMode", "word_to_numeral"], ["mode", "word_to_numeral"]]) {
    const reverse = buildCatalogWorksheetRuntime("grade3_place_value_representation_number_word_match", {
      worksheetSeed: `grade3-b2-reverse-${alias}`,
      questionCount: 1,
      minA: 342,
      maxA: 342,
      [alias]: value
    });
    assert.strictEqual(reverse.layout.header.title, "Write the Numeral");
    assert.strictEqual(reverse.layout.instruction, "Write the numeral for each number word.");
    assert.strictEqual(reverse.normalizedContentObject.content.items[0].prompt, "three hundred forty-two");
    assert.strictEqual(reverse.normalizedContentObject.content.items[0].answer, 342);
    assert.strictEqual(reverse.layout.display.numberWordResponseTarget, "shortNumeral");
  }

  const placeLabels = buildCatalogWorksheetRuntime("grade3_place_value_representation_expanded_form", {
    worksheetSeed: "grade3-b2-answer-style",
    questionCount: 1,
    minA: 342,
    maxA: 342,
    answerStyle: "hundreds_tens_ones"
  });
  assert.strictEqual(placeLabels.normalizedContentObject.content.items[0].prompt, "Complete: 342 = __ hundreds + __ tens + __ ones");
  assert.strictEqual(placeLabels.normalizedContentObject.content.items[0].answer, "3 hundreds, 4 tens, 2 ones");
  assert.strictEqual(placeLabels.layout.display.compactExpandedForm, false);
}

function testCompletedExampleAliases() {
  for (const [index, option] of [
    { includeExample: true },
    { completedExample: true },
    { example: true }
  ].entries()) {
    const runtime = buildCatalogWorksheetRuntime("grade3_place_value_representation_standard_form", {
      worksheetSeed: `grade3-b2-example-${index}`,
      questionCount: 8,
      ...option
    });
    assert.strictEqual(runtime.normalizedContentObject.content.items.length, 9);
    assert.strictEqual(runtime.normalizedContentObject.content.items.filter((item) => item.isExample).length, 1);
    assert.strictEqual(runtime.normalizedContentObject.content.items.slice(1).length, 8);
  }
}

async function testAnswerKeyOption() {
  const runtime = buildCatalogWorksheetRuntime("grade3_place_value_representation_number_word_match", {
    worksheetSeed: "grade3-b2-answer-key-option",
    includeAnswerKey: false
  });
  const studentOnly = await renderRuntime(runtime, false);
  const withKey = await renderRuntime(runtime, true);
  assert.strictEqual(pageCount(studentOnly), 1);
  assert.strictEqual(pageCount(withKey), 2);
}

function testCrossGradeAndSplitIsolation() {
  const grade1Expanded = buildCatalogWorksheetRuntime("grade1_place_value_representation_expanded_form", {
    worksheetSeed: "grade3-b2-grade1-isolation"
  });
  assert.strictEqual(grade1Expanded.layout.header.title, "Expanded Form");
  assert.strictEqual(grade1Expanded.normalizedContentObject.content.items.length, 18);

  const grade2Words = buildCatalogWorksheetRuntime("grade2_place_value_representation_number_word_match", {
    worksheetSeed: "grade3-b2-grade2-isolation"
  });
  assert.strictEqual(grade2Words.layout.header.title, "Write Number Words to 200");
  assert.strictEqual(grade2Words.layout.instruction, "Write each number in words.");
  assert.strictEqual(grade2Words.normalizedContentObject.content.items.length, 12);

  const finalizedBaseTen = buildCatalogWorksheetRuntime("grade3_place_value_representation_base_ten_blocks", {
    worksheetSeed: "grade3-b2-final-isolation"
  });
  assert.strictEqual(finalizedBaseTen.layout.header.title, "Read Base Ten Blocks");
  assert.strictEqual(finalizedBaseTen.layout.instruction, "Count the hundreds, tens, and ones. Write the number.");
  assert.strictEqual(finalizedBaseTen.contentObject.meta.curriculum.footerText, "Grade 3 • Math • Place Value");
  assert.strictEqual(finalizedBaseTen.normalizedContentObject.content.items.length, 8);
}

async function run() {
  await testDefaultContracts();
  testRangeCountAndSelectionVariables();
  testDirectionAndAnswerStyleVariables();
  testCompletedExampleAliases();
  await testAnswerKeyOption();
  testCrossGradeAndSplitIsolation();
  console.log("Grade 3 Place-Value Batch 2 tests passed; default PDF pages: 2/2/2; finalized Base Ten isolation passes.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
