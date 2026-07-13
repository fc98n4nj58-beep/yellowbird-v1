const assert = require("assert");

const {
  buildCatalogWorksheetRuntime
} = require("../services/catalogWorksheetRuntimeService");
const {
  getAnyWorksheetCatalogById
} = require("../services/worksheetCatalogService");
const { numberToWords } = require("../engine/problemGenerators/grade1NumberRepresentation");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");
const { Writable } = require("stream");

const WORDS_ID = "g1_number_word_match_to_50";
const NUMERAL_ID = "g1_write_the_numeral_to_50";
const BASE_TEN_ID = "grade1_place_value_representation_base_ten_blocks";
const TEN_FRAME_ID = "g1_ten_frame_addition_within_10";
const INTERNAL_FOOTER_SLUGS = [
  "number_representation",
  "place_value_representation",
  "addition_strategies"
];

class MemoryResponse extends Writable {
  constructor() {
    super();
    this.headers = {};
    this.chunks = [];
  }

  setHeader(name, value) {
    this.headers[name] = value;
  }

  _write(chunk, encoding, callback) {
    this.chunks.push(Buffer.from(chunk));
    callback();
  }

  buffer() {
    return Buffer.concat(this.chunks);
  }
}

function runtimeFor(resourceId, options = {}) {
  return buildCatalogWorksheetRuntime(resourceId, options);
}

function itemsFor(resourceId, options = {}) {
  return runtimeFor(resourceId, options).contentObject.content.items;
}

function signatures(runtime) {
  return runtime.contentObject.content.items.map((item) =>
    `${item.prompt}|${item.answer}|${item.isExample}|${item.duplicateSignature}`
  );
}

function assertSameSeed(resourceId, options) {
  assert.deepStrictEqual(
    signatures(runtimeFor(resourceId, options)),
    signatures(runtimeFor(resourceId, options))
  );
}

function assertNoMutation(resourceId, options) {
  const before = JSON.stringify(options);
  runtimeFor(resourceId, options);
  assert.strictEqual(JSON.stringify(options), before);
}

function assertCompletedQuestionOne(resourceId) {
  const runtime = runtimeFor(resourceId, {
    includeExample: true,
    questionCount: 12,
    worksheetSeed: `${resourceId}-example`
  });
  const items = runtime.contentObject.content.items;
  assert.strictEqual(items.length, 12);
  assert.strictEqual(items[0].id, 1);
  assert.strictEqual(items[0].isExample, true);
  assert.strictEqual(items[1].id, 2);
  assert.strictEqual(items[1].isExample, false);
  assert.strictEqual(runtime.layout.display.exampleCountsAsQuestion, true);
  assert.notStrictEqual(runtime.layout.header.title, "Example");
}

function assertUnique(items) {
  const values = items.map((item) => item.duplicateSignature);
  assert.strictEqual(values.length, new Set(values).size);
}

function diagnosticsFor(items, code) {
  return items.flatMap((item) => Array.isArray(item.diagnostics) ? item.diagnostics : [])
    .filter((item) => item.code === code);
}

function countSelected(items, values) {
  const selected = new Set(values);
  return items.filter((item) => selected.has(item.value) || selected.has(item.representedValue)).length;
}

function assertFooter(runtime, expected) {
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, expected);
}

function renderRuntimePdf(runtime, includeAnswerKey = true) {
  return new Promise((resolve, reject) => {
    const res = new MemoryResponse();
    res.on("finish", () => resolve(res.buffer()));
    res.on("error", reject);
    renderWorksheetPDF({
      res,
      contentObject: runtime.contentObject,
      layoutObject: runtime.layout,
      options: {
        filename: `${runtime.item.id}.pdf`,
        disposition: "inline",
        includeAnswerKey
      }
    });
  });
}

function pdfPageCount(buffer) {
  const matches = buffer.toString("latin1").match(/\/Type\s*\/Page\b/g);
  return matches ? matches.length : 0;
}

async function assertPdfFooterClean(resourceId, options, expectedFooter) {
  const runtime = runtimeFor(resourceId, options);
  assertFooter(runtime, expectedFooter);
  const buffer = await renderRuntimePdf(runtime, true);
  const raw = buffer.toString("latin1");
  INTERNAL_FOOTER_SLUGS.forEach((slug) => {
    assert(!raw.includes(slug), `PDF footer/content should not expose internal slug: ${slug}`);
  });
  return { runtime, pageCount: pdfPageCount(buffer) };
}

function assertNumberWordResource() {
  const runtime = runtimeFor(WORDS_ID, { worksheetSeed: "words-default" });
  const items = runtime.contentObject.content.items;
  assert.strictEqual(runtime.item.status, "ready");
  assert.strictEqual(runtime.layout.header.title, "Write Number Words to 50");
  assertFooter(runtime, "Grade 1 • Math • Number Representation: Number Words to 50");
  assert.strictEqual(runtime.layout.instruction, "Write each number in words.");
  assert.strictEqual(runtime.layout.template.columns, 2);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 20);
  assert.strictEqual(runtime.layout.display.hideSubtitle, true);
  assert.strictEqual(runtime.layout.display.numberWordResponseTarget, "writtenWord");
  assert.strictEqual(items.length, 20);
  assertUnique(items);
  items.forEach((item) => {
    assert.strictEqual(item.numberWordMode, "numeral_to_word");
    assert.strictEqual(item.prompt, String(item.value));
    assert.strictEqual(item.answer, numberToWords(item.value));
    assert.strictEqual(item.responseMode, "writtenNumberWord");
    assert(item.value >= 0 && item.value <= 50);
    assert(!String(item.prompt).includes("Write this number"));
  });

  const thirty = runtimeFor(WORDS_ID, {
    questionCount: 30,
    worksheetSeed: "words-thirty"
  });
  assert.strictEqual(thirty.layout.template.columns, 3);
  assert.strictEqual(thirty.layout.template.maxProblemsPerPage, 30);
  assert.strictEqual(thirty.contentObject.content.items.length, 30);

  const selected = itemsFor(WORDS_ID, {
    selectedValues: "7,8",
    questionCount: 20,
    worksheetSeed: "words-selected"
  });
  assert(countSelected(selected, [7, 8]) >= 13);

  const zero = itemsFor(WORDS_ID, {
    selectedValues: [0],
    questionCount: 3,
    worksheetSeed: "words-zero"
  });
  assert(zero.some((item) => item.value === 0 && item.answer === "zero"));
}

function assertNumeralResource() {
  const catalogItem = getAnyWorksheetCatalogById(NUMERAL_ID);
  assert(catalogItem, "Write the Numeral resource must exist.");
  assert.strictEqual(catalogItem.status, "partial");

  const runtime = runtimeFor(NUMERAL_ID, { worksheetSeed: "numeral-default" });
  const items = runtime.contentObject.content.items;
  assert.strictEqual(runtime.layout.header.title, "Write the Numeral to 50");
  assert.strictEqual(runtime.layout.instruction, "Write the numeral for each number word.");
  assertFooter(runtime, "Grade 1 • Math • Number Representation: Write the Numeral to 50");
  assert.strictEqual(runtime.layout.template.columns, 2);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 20);
  assert.strictEqual(runtime.layout.display.numberWordResponseTarget, "shortNumeral");
  assert.strictEqual(runtime.layout.display.reverseNumberWordWriting, true);
  assert.strictEqual(items.length, 20);
  assertUnique(items);
  items.forEach((item) => {
    assert.strictEqual(item.numberWordMode, "word_to_numeral");
    assert.strictEqual(item.prompt, item.numberWord);
    assert.strictEqual(item.answer, item.value);
    assert.strictEqual(item.responseMode, "shortNumeral");
    assert(item.value >= 0 && item.value <= 50);
  });

  const thirty = runtimeFor(NUMERAL_ID, {
    questionCount: 30,
    worksheetSeed: "numeral-thirty"
  });
  assert.strictEqual(thirty.layout.template.columns, 3);
  assert.strictEqual(thirty.layout.template.maxProblemsPerPage, 30);
}

function assertBaseTenResource() {
  const runtime = runtimeFor(BASE_TEN_ID, { worksheetSeed: "base-default" });
  const items = runtime.contentObject.content.items;
  assert.strictEqual(runtime.item.status, "ready");
  assert.strictEqual(runtime.layout.instruction, "Count the base ten blocks. Write the number.");
  assertFooter(runtime, "Grade 1 • Math • Number Representation: Base-Ten Blocks to 50");
  assert.strictEqual(runtime.layout.display.visualVerticalAlign, "topThird");
  assert.strictEqual(runtime.layout.display.shortVisualAnswerLine, true);
  assert.strictEqual(items.length, 10);
  assertUnique(items);
  items.forEach((item) => {
    assert.strictEqual(item.visual.kind, "base_ten_blocks");
    assert.strictEqual(item.tens, Math.floor(item.value / 10));
    assert.strictEqual(item.ones, item.value % 10);
    assert.deepStrictEqual(item.responseValues, [item.value]);
    assert.strictEqual(item.labelMode, "answer_line");
    assert(item.value >= 0 && item.value <= 50);
  });

  const labelled = runtimeFor(BASE_TEN_ID, {
    showPlaceValueLabels: true,
    questionCount: 6,
    worksheetSeed: "base-labelled"
  });
  assert.strictEqual(labelled.layout.display.baseTenTensOnesBoxes, true);
  labelled.contentObject.content.items.forEach((item) => {
    assert.strictEqual(item.labelMode, "tens_ones");
    assert.deepStrictEqual(item.responseValues, [item.tens, item.ones]);
  });

  const selected = itemsFor(BASE_TEN_ID, {
    selectedValues: [12, 34],
    questionCount: 10,
    worksheetSeed: "base-selected"
  });
  assert(countSelected(selected, [12, 34]) >= 6);

  assert.throws(
    () => runtimeFor(BASE_TEN_ID, { maximumValue: 51 }),
    /supports values from 0 to 50/
  );
}

function assertTenFrameResource() {
  const runtime = runtimeFor(TEN_FRAME_ID, { worksheetSeed: "frame-default" });
  const items = runtime.contentObject.content.items;
  assert.strictEqual(runtime.item.status, "ready");
  assert.strictEqual(runtime.layout.header.title, "Counting With Ten Frames");
  assert.strictEqual(runtime.layout.instruction, "Count the dots. Write the number.");
  assertFooter(runtime, "Grade 1 • Math • Number Representation: Ten Frames Within 10");
  assert.strictEqual(runtime.layout.template.columns, 1);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 10);
  assert.strictEqual(runtime.layout.display.tenFrameQuestionLayout, "full_width");
  assert.strictEqual(runtime.layout.display.tenFrameResponsiveBand, "standard_full_width");
  assert.strictEqual(runtime.layout.display.tenFrameScale, 1);
  assert.strictEqual(items.length, 10);
  assertUnique(items);
  items.forEach((item) => {
    assert.strictEqual(item.visual.kind, "ten_frame");
    assert.strictEqual(item.frameCount, 1);
    assert.strictEqual(item.dotArrangement, "standard_left_to_right");
    assert.strictEqual(item.selectionMode, "range");
    assert(item.representedValue >= 1 && item.representedValue <= 10);
    assert.notStrictEqual(item.representedValue, 0);
  });

  const compact = runtimeFor(TEN_FRAME_ID, {
    questionCount: 5,
    worksheetSeed: "frame-five"
  });
  assert.strictEqual(compact.layout.template.columns, 2);
  assert.strictEqual(compact.layout.template.maxProblemsPerPage, 5);
  assert.strictEqual(compact.layout.display.tenFrameQuestionLayout, "two_column");
  assert.strictEqual(compact.layout.display.tenFrameResponsiveBand, "low_count_two_column");
  assert(compact.layout.display.tenFrameScale > 1);

  const six = runtimeFor(TEN_FRAME_ID, {
    questionCount: 6,
    worksheetSeed: "frame-six"
  });
  assert.strictEqual(six.layout.template.columns, 1);
  assert.strictEqual(six.layout.template.maxProblemsPerPage, 6);
  assert.strictEqual(six.layout.display.tenFrameResponsiveBand, "medium_count_full_width");
  assert(six.layout.display.tenFrameScale > 1);

  const eight = runtimeFor(TEN_FRAME_ID, {
    questionCount: 8,
    worksheetSeed: "frame-eight"
  });
  assert.strictEqual(eight.layout.template.columns, 1);
  assert.strictEqual(eight.layout.template.maxProblemsPerPage, 8);
  assert.strictEqual(eight.layout.display.tenFrameResponsiveBand, "medium_count_full_width");

  const eighteen = runtimeFor(TEN_FRAME_ID, {
    questionCount: 18,
    includeExample: true,
    worksheetSeed: "frame-eighteen"
  });
  assert.strictEqual(eighteen.layout.template.maxProblemsPerPage, 10);
  assert.strictEqual(eighteen.layout.display.tenFrameResponsiveBand, "standard_full_width");
  assert.strictEqual(eighteen.contentObject.content.items.length, 18);

  const exact = itemsFor(TEN_FRAME_ID, {
    selectedValues: "2,5",
    questionCount: 6,
    worksheetSeed: "frame-selected"
  });
  assert(exact.every((item) => [2, 5].includes(item.representedValue)));
  assert(exact.every((item) => item.selectionMode === "exact"));

  const zero = itemsFor(TEN_FRAME_ID, {
    minimumValue: 0,
    maximumValue: 0,
    questionCount: 1,
    worksheetSeed: "frame-zero"
  });
  assert.strictEqual(zero[0].representedValue, 0);
  assert.strictEqual(zero[0].visual.data.zeroIntentional, true);

  assert.throws(
    () => runtimeFor(TEN_FRAME_ID, { maximumValue: 11 }),
    /supports values from 0 to 10/
  );
}

async function run() {
  assertNumberWordResource();
  assertNumeralResource();
  assertBaseTenResource();
  assertTenFrameResource();

  [WORDS_ID, NUMERAL_ID, BASE_TEN_ID, TEN_FRAME_ID].forEach((resourceId) => {
    assertCompletedQuestionOne(resourceId);
    assertSameSeed(resourceId, {
      questionCount: 12,
      includeExample: true,
      worksheetSeed: `${resourceId}-same-seed`
    });
    assertNoMutation(resourceId, {
      minimumValue: 1,
      maximumValue: 10,
      selectedValues: [2, 4],
      questionCount: 6,
      worksheetSeed: `${resourceId}-mutation`
    });
  });

  assert(diagnosticsFor(itemsFor(WORDS_ID, {
    minimumValue: 1,
    maximumValue: 2,
    questionCount: 6,
    worksheetSeed: "words-low-variety"
  }), "low_variety_candidate_pool").length > 0);

  assert.strictEqual(numberToWords(21), "twenty-one");
  assert.strictEqual(numberToWords(50), "fifty");
  assert.strictEqual(numberToWords(0), "zero");

  const standardForm = runtimeFor("grade1_place_value_representation_standard_form", {
    worksheetSeed: "standard-regression"
  });
  assert.strictEqual(standardForm.item.status, "generated");
  assert.notStrictEqual(standardForm.layout.header.title, "Write the Numeral to 50");

  await assertPdfFooterClean(
    WORDS_ID,
    { worksheetSeed: "words-footer", includeExample: true },
    "Grade 1 • Math • Number Representation: Number Words to 50"
  );
  await assertPdfFooterClean(
    NUMERAL_ID,
    { worksheetSeed: "numeral-footer", includeExample: true },
    "Grade 1 • Math • Number Representation: Write the Numeral to 50"
  );
  await assertPdfFooterClean(
    BASE_TEN_ID,
    { worksheetSeed: "base-footer", includeExample: true },
    "Grade 1 • Math • Number Representation: Base-Ten Blocks to 50"
  );
  const tenFramePdf = await assertPdfFooterClean(
    TEN_FRAME_ID,
    { worksheetSeed: "frame-footer", includeExample: true },
    "Grade 1 • Math • Number Representation: Ten Frames Within 10"
  );
  assert.strictEqual(tenFramePdf.pageCount, 2);

  const eighteenPdf = await renderRuntimePdf(runtimeFor(TEN_FRAME_ID, {
    questionCount: 18,
    includeExample: true,
    worksheetSeed: "frame-eighteen-pages"
  }), true);
  assert.strictEqual(pdfPageCount(eighteenPdf), 4);

  console.log("Grade 1 number representation runtime tests passed.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
