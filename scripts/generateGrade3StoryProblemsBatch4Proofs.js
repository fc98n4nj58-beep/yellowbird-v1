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
  "grade-3-story-problems-batch-4",
  "founder-review"
);
const PROOFS = Object.freeze([
  {
    id: "grade3_addition_subtraction_word_problems_addition_word_problem",
    seed: "grade3-story-batch4-founder-addition",
    filename: "01_addition_word_problems.pdf"
  },
  {
    id: "grade3_addition_subtraction_word_problems_missing_addend_word_problem",
    seed: "grade3-story-batch4-founder-missing-addend",
    filename: "02_missing_addend_word_problems.pdf"
  },
  {
    id: "grade3_addition_subtraction_word_problems_subtraction_word_problem",
    seed: "grade3-story-batch4-founder-subtraction",
    filename: "03_subtraction_word_problems.pdf"
  }
]);

class FileResponse extends Writable {
  constructor(filePath) {
    super();
    this.file = fs.createWriteStream(filePath);
  }
  setHeader() {}
  _write(chunk, encoding, callback) { this.file.write(chunk, encoding, callback); }
  _final(callback) { this.file.end(callback); }
}

async function renderProof(spec) {
  const runtime = buildCatalogWorksheetRuntime(spec.id, { worksheetSeed: spec.seed });
  const filePath = path.join(OUTPUT_DIR, spec.filename);
  await new Promise((resolve, reject) => {
    const response = new FileResponse(filePath);
    response.once("finish", resolve);
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: {
        filename: spec.filename,
        disposition: "inline",
        includeAnswerKey: true
      }
    });
  });
  return {
    id: spec.id,
    filePath,
    title: runtime.layout.header.title,
    instruction: runtime.layout.instruction,
    footer: runtime.contentObject.meta.curriculum.footerText,
    questionCount: runtime.normalizedContentObject.content.items.length
  };
}

async function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const results = [];
  for (const spec of PROOFS) results.push(await renderProof(spec));
  const actual = fs.readdirSync(OUTPUT_DIR).filter((name) => name.endsWith(".pdf")).sort();
  const expected = PROOFS.map((spec) => spec.filename).sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected exactly ${expected.join(", ")}; found ${actual.join(", ")}.`);
  }
  console.log(JSON.stringify(results, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
