const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const {
  buildCatalogWorksheetRuntime
} = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const OUTPUT_DIR = path.join(__dirname, "..", "review", "grade-1-number-representation");
const FOUNDER_RECHECK_DIR = path.join(OUTPUT_DIR, "founder-recheck");

class FileResponse extends Writable {
  constructor(filePath) {
    super();
    this.headers = {};
    this.file = fs.createWriteStream(filePath);
  }

  setHeader(name, value) {
    this.headers[name] = value;
  }

  _write(chunk, encoding, callback) {
    this.file.write(chunk, encoding, callback);
  }

  _final(callback) {
    this.file.end(callback);
  }
}

function pageCount(filePath) {
  const raw = fs.readFileSync(filePath);
  const matches = raw.toString("latin1").match(/\/Type\s*\/Page\b/g);
  return matches ? matches.length : 0;
}

function runtimeSignature(runtime) {
  return runtime.contentObject.content.items.map((item) =>
    `${item.prompt}|${item.answer}|${item.isExample}|${item.duplicateSignature}`
  );
}

function sameRuntimeContent(a, b) {
  return JSON.stringify(runtimeSignature(a)) === JSON.stringify(runtimeSignature(b));
}

function metricsFor(runtime) {
  const items = runtime.contentObject.content.items;
  const signatures = items.map((item) => item.duplicateSignature).filter(Boolean);
  const diagnostics = items.flatMap((item) => Array.isArray(item.diagnostics) ? item.diagnostics : []);

  return {
    itemCount: items.length,
    exampleCount: items.filter((item) => item.isExample).length,
    hasCompletedQuestionOne: Boolean(items[0]?.isExample && items[0]?.id === 1),
    secondQuestionNumber: items[1]?.id || null,
    duplicateCount: signatures.length - new Set(signatures).size,
    answerMetadataCount: items.filter((item) => item.answer !== undefined && item.answer !== null).length,
    visualCount: items.filter((item) => item.visual?.kind).length,
    numberWordMetadataCount: items.filter((item) => item.numberWord).length,
    baseTenMetadataCount: items.filter((item) => Number.isFinite(item.tens) && Number.isFinite(item.ones)).length,
    tenFrameMetadataCount: items.filter((item) => Number.isFinite(item.representedValue)).length,
    diagnostics
  };
}

function renderProof(caseDef, runtime, outputDir = OUTPUT_DIR) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(outputDir, `${caseDef.slug}.pdf`);
    const res = new FileResponse(filePath);

    res.on("finish", () => resolve(filePath));
    res.on("error", reject);

    renderWorksheetPDF({
      res,
      contentObject: runtime.contentObject,
      layoutObject: runtime.layout,
      options: {
        filename: `${caseDef.slug}.pdf`,
        disposition: "inline",
        includeAnswerKey: caseDef.options.includeAnswerKey !== false
      }
    });
  });
}

const cases = [
  { slug: "words_default_20", resourceId: "g1_number_word_match_to_50", options: { worksheetSeed: "words-default", includeExample: true } },
  { slug: "words_30_three_columns", resourceId: "g1_number_word_match_to_50", options: { worksheetSeed: "words-30", questionCount: 30, includeExample: true } },
  { slug: "words_selected_7_8", resourceId: "g1_number_word_match_to_50", options: { worksheetSeed: "words-selected", questionCount: 20, selectedValues: "7,8", includeExample: true } },
  { slug: "words_zero_supported", resourceId: "g1_number_word_match_to_50", options: { worksheetSeed: "words-zero", questionCount: 8, minimumValue: 0, maximumValue: 8, includeExample: true } },
  { slug: "words_small_pool_repetition", resourceId: "g1_number_word_match_to_50", options: { worksheetSeed: "words-small", questionCount: 12, minimumValue: 1, maximumValue: 3, includeExample: true } },
  { slug: "words_multi_page_45", resourceId: "g1_number_word_match_to_50", options: { worksheetSeed: "words-45", questionCount: 45, includeExample: true } },
  { slug: "words_no_answer_key", resourceId: "g1_number_word_match_to_50", options: { worksheetSeed: "words-no-key", questionCount: 20, includeExample: true, includeAnswerKey: false } },
  { slug: "words_answer_key", resourceId: "g1_number_word_match_to_50", options: { worksheetSeed: "words-key", questionCount: 20, includeExample: true, includeAnswerKey: true } },
  { slug: "words_range_20_50", resourceId: "g1_number_word_match_to_50", options: { worksheetSeed: "words-20-50", questionCount: 20, minimumValue: 20, maximumValue: 50, includeExample: true } },

  { slug: "numeral_default_20", resourceId: "g1_write_the_numeral_to_50", options: { worksheetSeed: "numeral-default", includeExample: true } },
  { slug: "numeral_30_three_columns", resourceId: "g1_write_the_numeral_to_50", options: { worksheetSeed: "numeral-30", questionCount: 30, includeExample: true } },
  { slug: "numeral_selected_12_15", resourceId: "g1_write_the_numeral_to_50", options: { worksheetSeed: "numeral-selected", questionCount: 20, selectedValues: "12,15", includeExample: true } },
  { slug: "numeral_zero_supported", resourceId: "g1_write_the_numeral_to_50", options: { worksheetSeed: "numeral-zero", questionCount: 8, minimumValue: 0, maximumValue: 8, includeExample: true } },
  { slug: "numeral_small_pool_repetition", resourceId: "g1_write_the_numeral_to_50", options: { worksheetSeed: "numeral-small", questionCount: 12, minimumValue: 1, maximumValue: 3, includeExample: true } },
  { slug: "numeral_multi_page_45", resourceId: "g1_write_the_numeral_to_50", options: { worksheetSeed: "numeral-45", questionCount: 45, includeExample: true } },
  { slug: "numeral_answer_key", resourceId: "g1_write_the_numeral_to_50", options: { worksheetSeed: "numeral-key", questionCount: 20, includeExample: true, includeAnswerKey: true } },
  { slug: "numeral_range_25_50", resourceId: "g1_write_the_numeral_to_50", options: { worksheetSeed: "numeral-25-50", questionCount: 20, minimumValue: 25, maximumValue: 50, includeExample: true } },

  { slug: "base_ten_default", resourceId: "grade1_place_value_representation_base_ten_blocks", options: { worksheetSeed: "base-default", includeExample: true } },
  { slug: "base_ten_zero_to_10", resourceId: "grade1_place_value_representation_base_ten_blocks", options: { worksheetSeed: "base-zero", questionCount: 10, minimumValue: 0, maximumValue: 10, includeExample: true } },
  { slug: "base_ten_selected", resourceId: "grade1_place_value_representation_base_ten_blocks", options: { worksheetSeed: "base-selected", questionCount: 10, selectedValues: "12,34", includeExample: true } },
  { slug: "base_ten_labels_on", resourceId: "grade1_place_value_representation_base_ten_blocks", options: { worksheetSeed: "base-labels", questionCount: 10, showPlaceValueLabels: true, includeExample: true } },
  { slug: "base_ten_50", resourceId: "grade1_place_value_representation_base_ten_blocks", options: { worksheetSeed: "base-50", questionCount: 6, selectedValues: "50", includeExample: true } },
  { slug: "base_ten_small_pool", resourceId: "grade1_place_value_representation_base_ten_blocks", options: { worksheetSeed: "base-small", questionCount: 12, minimumValue: 2, maximumValue: 4, includeExample: true } },
  { slug: "base_ten_answer_key", resourceId: "grade1_place_value_representation_base_ten_blocks", options: { worksheetSeed: "base-key", questionCount: 10, includeExample: true, includeAnswerKey: true } },
  { slug: "base_ten_multi_page_22", resourceId: "grade1_place_value_representation_base_ten_blocks", options: { worksheetSeed: "base-22", questionCount: 22, includeExample: true } },
  { slug: "base_ten_labels_answer_key", resourceId: "grade1_place_value_representation_base_ten_blocks", options: { worksheetSeed: "base-labels-key", questionCount: 10, showPlaceValueLabels: true, includeExample: true, includeAnswerKey: true } },

  { slug: "ten_frame_default", resourceId: "g1_ten_frame_addition_within_10", options: { worksheetSeed: "frame-default", includeExample: true } },
  { slug: "ten_frame_five_two_column", resourceId: "g1_ten_frame_addition_within_10", options: { worksheetSeed: "frame-five", questionCount: 5, includeExample: true } },
  { slug: "ten_frame_six_full_width", resourceId: "g1_ten_frame_addition_within_10", options: { worksheetSeed: "frame-six", questionCount: 6, includeExample: true } },
  { slug: "ten_frame_selected_exact", resourceId: "g1_ten_frame_addition_within_10", options: { worksheetSeed: "frame-selected", questionCount: 8, selectedValues: "2,5", includeExample: true } },
  { slug: "ten_frame_zero_internal", resourceId: "g1_ten_frame_addition_within_10", options: { worksheetSeed: "frame-zero", questionCount: 4, minimumValue: 0, maximumValue: 3, includeExample: true } },
  { slug: "ten_frame_small_pool", resourceId: "g1_ten_frame_addition_within_10", options: { worksheetSeed: "frame-small", questionCount: 12, minimumValue: 1, maximumValue: 3, includeExample: true } },
  { slug: "ten_frame_answer_key", resourceId: "g1_ten_frame_addition_within_10", options: { worksheetSeed: "frame-key", questionCount: 10, includeExample: true, includeAnswerKey: true } },
  { slug: "ten_frame_multi_page_18", resourceId: "g1_ten_frame_addition_within_10", options: { worksheetSeed: "frame-18", questionCount: 18, includeExample: true } },
  { slug: "ten_frame_value_10", resourceId: "g1_ten_frame_addition_within_10", options: { worksheetSeed: "frame-10", questionCount: 4, selectedValues: "10", includeExample: true } },

  { slug: "cross_family_default_mix", resourceId: "g1_number_word_match_to_50", options: { worksheetSeed: "cross-words", questionCount: 20, includeExample: true } }
];

const founderCases = [
  { slug: "numeral_default_20_footer_fixed", resourceId: "g1_write_the_numeral_to_50", options: { worksheetSeed: "founder-numeral-default", includeExample: true } },
  { slug: "words_default_20_clean_footer", resourceId: "g1_number_word_match_to_50", options: { worksheetSeed: "founder-words-default", includeExample: true } },
  { slug: "base_ten_default_clean_footer", resourceId: "grade1_place_value_representation_base_ten_blocks", options: { worksheetSeed: "founder-base-default", includeExample: true } },
  { slug: "ten_frame_five_responsive", resourceId: "g1_ten_frame_addition_within_10", options: { worksheetSeed: "founder-frame-five", questionCount: 5, includeExample: true } },
  { slug: "ten_frame_six_responsive", resourceId: "g1_ten_frame_addition_within_10", options: { worksheetSeed: "founder-frame-six", questionCount: 6, includeExample: true } },
  { slug: "ten_frame_ten_regression", resourceId: "g1_ten_frame_addition_within_10", options: { worksheetSeed: "founder-frame-ten", questionCount: 10, includeExample: true } }
];

async function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(FOUNDER_RECHECK_DIR, { recursive: true });
  fs.readdirSync(OUTPUT_DIR).forEach((entry) => {
    if (entry.endsWith(".pdf") || entry.endsWith(".json")) {
      fs.unlinkSync(path.join(OUTPUT_DIR, entry));
    }
  });
  fs.readdirSync(FOUNDER_RECHECK_DIR).forEach((entry) => {
    if (entry.endsWith(".pdf") || entry.endsWith(".json")) {
      fs.unlinkSync(path.join(FOUNDER_RECHECK_DIR, entry));
    }
  });

  const summary = [];

  for (const caseDef of cases) {
    const metadata = {
      slug: caseDef.slug,
      resourceId: caseDef.resourceId,
      inputOptions: caseDef.options,
      title: "",
      instruction: "",
      resourceStatus: "",
      publicReadyStatus: caseDef.resourceId === "g1_write_the_numeral_to_50"
        ? "partial_founder_pdf_review"
        : "ready_resource_regression_or_founder_review",
      layout: null,
      display: null,
      pdfPath: null,
      pageCount: 0,
      runtimeParity: false,
      metrics: null,
      error: null
    };

    try {
      const runtime = buildCatalogWorksheetRuntime(caseDef.resourceId, caseDef.options);
      const parityRuntime = buildCatalogWorksheetRuntime(caseDef.resourceId, caseDef.options);
      const pdfPath = await renderProof(caseDef, runtime);

      metadata.title = runtime.layout.header.title;
      metadata.instruction = runtime.layout.instruction;
      metadata.resourceStatus = runtime.item.status;
      metadata.layout = runtime.layout.template;
      metadata.display = runtime.layout.display;
      metadata.pdfPath = pdfPath;
      metadata.pageCount = pageCount(pdfPath);
      metadata.runtimeParity = sameRuntimeContent(runtime, parityRuntime);
      metadata.metrics = metricsFor(runtime);
    } catch (err) {
      metadata.error = {
        stage: "runtime_or_pdf",
        message: err.message
      };
    }

    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${caseDef.slug}.json`),
      JSON.stringify(metadata, null, 2)
    );
    summary.push(metadata);
  }

  const founderSummary = [];
  for (const caseDef of founderCases) {
    const metadata = {
      slug: caseDef.slug,
      resourceId: caseDef.resourceId,
      inputOptions: caseDef.options,
      title: "",
      footerText: "",
      pdfPath: null,
      pageCount: 0,
      runtimeParity: false,
      error: null
    };

    try {
      const runtime = buildCatalogWorksheetRuntime(caseDef.resourceId, caseDef.options);
      const parityRuntime = buildCatalogWorksheetRuntime(caseDef.resourceId, caseDef.options);
      const pdfPath = await renderProof(caseDef, runtime, FOUNDER_RECHECK_DIR);
      metadata.title = runtime.layout.header.title;
      metadata.footerText = runtime.contentObject.meta.curriculum.footerText;
      metadata.pdfPath = pdfPath;
      metadata.pageCount = pageCount(pdfPath);
      metadata.runtimeParity = sameRuntimeContent(runtime, parityRuntime);
    } catch (err) {
      metadata.error = {
        stage: "runtime_or_pdf",
        message: err.message
      };
    }

    founderSummary.push(metadata);
  }

  const validPdfs = summary.filter((item) => item.pdfPath).length;
  const runtimeErrors = summary.filter((item) => item.error).length;
  const parityFailures = summary.filter((item) => item.pdfPath && !item.runtimeParity).length;

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "summary.json"),
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      outputDir: OUTPUT_DIR,
      founderRecheckDir: FOUNDER_RECHECK_DIR,
      proofCount: validPdfs,
      runtimeErrors,
      sameSeedParityFailures: parityFailures,
      publicReadyNotes: {
        writeTheNumeralTo50: "Separate public resource exists as partial for founder PDF review; no direction toggle is exposed.",
        tenFrameZero: "Zero is supported internally by explicit minimum/selected values, not by public default.",
        baseTenLabels: "Place-value labels are runtime-supported and public-customization-deferred."
      },
      cases: summary
    }, null, 2)
  );

  const founderValidPdfs = founderSummary.filter((item) => item.pdfPath).length;
  const founderErrors = founderSummary.filter((item) => item.error).length;
  const founderParityFailures = founderSummary.filter((item) => item.pdfPath && !item.runtimeParity).length;
  fs.writeFileSync(
    path.join(FOUNDER_RECHECK_DIR, "summary.json"),
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      outputDir: FOUNDER_RECHECK_DIR,
      proofCount: founderValidPdfs,
      runtimeErrors: founderErrors,
      sameSeedParityFailures: founderParityFailures,
      cases: founderSummary
    }, null, 2)
  );

  console.log(`Grade 1 Number Representation proof artifacts written to ${OUTPUT_DIR}`);
  console.log(`Valid PDFs: ${validPdfs}`);
  console.log(`Runtime errors: ${runtimeErrors}`);
  console.log(`Same-seed parity failures: ${parityFailures}`);
  console.log(`Founder recheck PDFs: ${founderValidPdfs}`);
  console.log(`Founder recheck runtime errors: ${founderErrors}`);
  console.log(`Founder recheck same-seed parity failures: ${founderParityFailures}`);

  if (runtimeErrors || parityFailures || validPdfs < 36 || founderErrors || founderParityFailures || founderValidPdfs !== 6) {
    process.exitCode = 1;
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
