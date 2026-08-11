"use strict";

const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const OUTPUT_DIR = path.join(
  __dirname,
  "..",
  "review",
  "public-copy-family-alignment",
  "founder-review-2026-08-11"
);
const RESOURCE_IDS = Object.freeze([
  "g1_addition_facts_within_20",
  "g2_addition_fluency_within_100",
  "g1_fact_families_within_20",
  "grade2_addition_subtraction_facts_fact_family",
  "grade3_addition_subtraction_facts_fact_family",
  "g1_addition_word_problems",
  "g2_addition_word_problems_within_100",
  "grade3_addition_subtraction_word_problems_addition_word_problem",
  "grade4_addition_subtraction_word_problems_addition_word_problem",
  "grade5_addition_subtraction_word_problems_addition_word_problem",
  "grade1_multiplication_facts_arrays",
  "grade2_multiplication_facts_arrays",
  "g3_multiplication_arrays",
  "g4_array_interpretation"
]);

class FileResponse extends Writable {
  constructor(filePath) {
    super();
    this.file = fs.createWriteStream(filePath);
  }

  setHeader() {}

  _write(chunk, encoding, callback) {
    this.file.write(chunk, encoding, callback);
  }

  _final(callback) {
    this.file.end(callback);
  }
}

function render(resourceId, index) {
  return new Promise((resolve, reject) => {
    const filename = `${String(index + 1).padStart(2, "0")}_${resourceId}.pdf`;
    const outputPath = path.join(OUTPUT_DIR, filename);
    const runtime = buildCatalogWorksheetRuntime(resourceId, {
      worksheetSeed: `founder-review:${resourceId}:v1`
    });
    const response = new FileResponse(outputPath);
    response.once("finish", () => resolve({ outputPath, runtime }));
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: { filename, disposition: "inline", includeAnswerKey: true }
    });
  });
}

async function run() {
  if (fs.existsSync(OUTPUT_DIR)) {
    throw new Error(`Proof folder already exists; choose a new review checkpoint instead of overwriting ${OUTPUT_DIR}.`);
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const results = [];
  for (let index = 0; index < RESOURCE_IDS.length; index += 1) {
    results.push(await render(RESOURCE_IDS[index], index));
  }
  const pdfs = fs.readdirSync(OUTPUT_DIR).filter((name) => name.endsWith(".pdf"));
  if (pdfs.length !== RESOURCE_IDS.length) {
    throw new Error(`Expected ${RESOURCE_IDS.length} proof PDFs; found ${pdfs.length}.`);
  }
  results.forEach(({ outputPath, runtime }) => {
    console.log(JSON.stringify({
      resourceId: runtime.item.id,
      title: runtime.layout.header.title,
      instruction: runtime.layout.instruction,
      outputPath
    }));
  });
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
