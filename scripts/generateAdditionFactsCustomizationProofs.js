const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const {
  buildCatalogWorksheetRuntime
} = require("../services/catalogWorksheetRuntimeService");
const {
  normalizeWorksheetCustomization
} = require("../services/worksheetCustomizationService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const RESOURCE_ID = "g1_addition_facts_within_20";
const OUTPUT_DIR = path.join(__dirname, "..", "review", "addition-facts-customization-runtime");

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

function signature(item) {
  return `${Math.min(item.a, item.b)}:${Math.max(item.a, item.b)}`;
}

function buildMetrics(items, selectedValues = []) {
  const selected = new Set(selectedValues);
  const studentItems = items.filter((item) => !item.isExample);
  const selectedHits = studentItems.filter((item) =>
    selected.has(item.a) || selected.has(item.b)
  ).length;
  const signatures = studentItems.map(signature);

  return {
    itemCount: items.length,
    studentQuestionCount: studentItems.length,
    exampleCount: items.length - studentItems.length,
    selectedCoverageCount: selectedHits,
    duplicateCount: signatures.length - new Set(signatures).size,
    maxPromptLength: Math.max(...items.map((item) => String(item.prompt).length)),
    answerCheck: items.every((item) => item.answer === item.a + item.b)
  };
}

function sameRuntimeContent(a, b) {
  const left = a.contentObject.content.items.map((item) => `${item.prompt}|${item.answer}|${item.isExample}`);
  const right = b.contentObject.content.items.map((item) => `${item.prompt}|${item.answer}|${item.isExample}`);
  return JSON.stringify(left) === JSON.stringify(right);
}

function renderProof(caseDef, runtime, normalized) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(OUTPUT_DIR, `${caseDef.slug}.pdf`);
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
        includeAnswerKey: normalized.normalizedOptions.includeAnswerKey !== false
      }
    });
  });
}

async function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const cases = [
    ["default_with_answer_key", { worksheetSeed: "proof-default" }],
    ["default_without_answer_key", { worksheetSeed: "proof-default-no-key", includeAnswerKey: false }],
    ["range_0_to_10", { minimumValue: 0, maximumValue: 10, questionCount: 30, worksheetSeed: "proof-0-10" }],
    ["range_0_to_30_wide_facts", { minimumValue: 0, maximumValue: 30, questionCount: 60, worksheetSeed: "proof-0-30" }],
    ["range_10_to_20_small_pool", { minimumValue: 10, maximumValue: 20, questionCount: 24, worksheetSeed: "proof-10-20" }],
    ["selected_7_and_8", { selectedValues: "7,8", questionCount: 60, worksheetSeed: "proof-selected-7-8" }],
    ["selected_0_10_20", { selectedValues: "0,10,20", questionCount: 60, worksheetSeed: "proof-selected-0-10-20" }],
    ["include_completed_example", { includeExample: true, questionCount: 60, worksheetSeed: "proof-example" }],
    ["multi_page_75_with_example", { includeExample: true, questionCount: 75, questionsPerPage: 60, worksheetSeed: "proof-multi" }],
    ["short_12_questions", { questionCount: 12, worksheetSeed: "proof-short" }],
    ["one_question", { questionCount: 1, worksheetSeed: "proof-one" }],
    ["custom_seed_repeatability", { questionCount: 40, worksheetSeed: "proof-seed-repeat" }],
    ["alias_input_min_max_selected", { minA: 2, maxA: 12, maxTotal: 12, selectedNumbers: "4,6", questionCount: 30, worksheetSeed: "proof-alias" }],
    ["invalid_selected_outside_range", { minimumValue: 5, maximumValue: 10, selectedValues: "4,8", questionCount: 20 }],
    ["invalid_no_valid_pool", { minimumValue: 30, maximumValue: 30, questionCount: 4 }]
  ].map(([slug, options]) => ({ slug, options }));

  const summary = [];

  for (const caseDef of cases) {
    const normalized = normalizeWorksheetCustomization(RESOURCE_ID, caseDef.options);
    const metadata = {
      slug: caseDef.slug,
      resourceId: RESOURCE_ID,
      inputOptions: caseDef.options,
      normalized,
      pdfPath: null,
      pageCount: 0,
      runtimeParity: false,
      metrics: null,
      error: null
    };

    if (!normalized.ok) {
      metadata.error = {
        stage: "normalization",
        errors: normalized.errors
      };
    } else {
      try {
        const runtime = buildCatalogWorksheetRuntime(RESOURCE_ID, caseDef.options);
        const parityRuntime = buildCatalogWorksheetRuntime(RESOURCE_ID, caseDef.options);
        const pdfPath = await renderProof(caseDef, runtime, normalized);

        metadata.pdfPath = pdfPath;
        metadata.pageCount = pageCount(pdfPath);
        metadata.runtimeParity = sameRuntimeContent(runtime, parityRuntime);
        metadata.metrics = buildMetrics(
          runtime.contentObject.content.items,
          normalized.normalizedOptions.selectedValues
        );
      } catch (err) {
        metadata.error = {
          stage: "runtime_or_pdf",
          message: err.message
        };
      }
    }

    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${caseDef.slug}.json`),
      JSON.stringify(metadata, null, 2)
    );
    summary.push(metadata);
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "summary.json"),
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      resourceId: RESOURCE_ID,
      outputDir: OUTPUT_DIR,
      cases: summary
    }, null, 2)
  );

  const validPdfs = summary.filter((item) => item.pdfPath).length;
  const invalidCases = summary.filter((item) => item.error).length;
  console.log(`Addition Facts proof artifacts written to ${OUTPUT_DIR}`);
  console.log(`Valid PDFs: ${validPdfs}`);
  console.log(`Cases with expected errors or runtime errors: ${invalidCases}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
