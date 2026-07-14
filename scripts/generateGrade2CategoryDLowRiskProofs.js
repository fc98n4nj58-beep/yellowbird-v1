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
  "grade-2-category-d-low-risk",
  "founder-review"
);

const CASES = Object.freeze([
  {
    id: "grade2_addition_subtraction_facts_equation_match",
    filename: "g2_equal_or_not_equal_default_student_and_key.pdf",
    seed: "g2-category-d-equal-or-not-equal-founder"
  },
  {
    id: "grade2_place_value_representation_number_line_identify",
    filename: "g2_identify_numbers_number_line_default_student_and_key.pdf",
    seed: "g2-category-d-number-line-founder"
  }
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

function renderProof(caseDef) {
  return new Promise((resolve, reject) => {
    const runtime = buildCatalogWorksheetRuntime(caseDef.id, {
      worksheetSeed: caseDef.seed
    });
    const filePath = path.join(OUTPUT_DIR, caseDef.filename);
    const response = new FileResponse(filePath);
    response.once("finish", () => resolve({ filePath, runtime }));
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.contentObject,
      layoutObject: runtime.layout,
      options: {
        filename: caseDef.filename,
        disposition: "inline",
        includeAnswerKey: true
      }
    });
  });
}

async function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const proofs = [];
  for (const caseDef of CASES) {
    const { filePath, runtime } = await renderProof(caseDef);
    proofs.push({
      filePath,
      title: runtime.layout.header.title,
      questions: runtime.contentObject.content.items.length,
      footer: runtime.contentObject.meta.curriculum.footerText,
      completedExample: runtime.contentObject.content.items.some((item) => item.isExample)
    });
  }
  console.log(JSON.stringify({ outputDir: OUTPUT_DIR, proofs }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
