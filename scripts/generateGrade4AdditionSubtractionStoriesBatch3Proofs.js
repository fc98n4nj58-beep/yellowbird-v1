"use strict";

const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const ROOT = path.join(__dirname, "..", "review", "grade-4-addition-subtraction-stories-batch-3");
const IDS = Object.freeze({
  addition: "grade4_addition_subtraction_word_problems_addition_word_problem",
  missing: "grade4_addition_subtraction_word_problems_missing_addend_word_problem",
  subtraction: "grade4_addition_subtraction_word_problems_subtraction_word_problem"
});
const PROOFS = Object.freeze([
  { folder: "founder-review", filename: "01_addition_story_problems.pdf", id: IDS.addition, options: { worksheetSeed: "g4-b3-founder-addition" } },
  { folder: "founder-review", filename: "02_missing_addend_story_problems.pdf", id: IDS.missing, options: { worksheetSeed: "g4-b3-founder-missing" } },
  { folder: "founder-review", filename: "03_subtraction_story_problems.pdf", id: IDS.subtraction, options: { worksheetSeed: "g4-b3-founder-subtraction" } },
  {
    folder: "stress", filename: "01_addition_largest_safe_values.pdf", id: IDS.addition,
    options: { worksheetSeed: "g4-b3-stress-addition-values", minA: 4000, maxA: 5000, minB: 4000, maxB: 5000, minTotal: 8000, maxTotal: 10000 }
  },
  {
    folder: "stress", filename: "02_addition_maximum_count_and_density.pdf", id: IDS.addition,
    options: { worksheetSeed: "g4-b3-stress-addition-count", questionCount: 16, questionsPerPage: 3 }
  },
  {
    folder: "stress", filename: "03_missing_addend_positions_and_example.pdf", id: IDS.missing,
    options: { worksheetSeed: "g4-b3-stress-missing-example", questionCount: 8, questionsPerPage: 3, includeExample: true, missingPosition: "mixed" }
  },
  {
    folder: "stress", filename: "04_subtraction_compare_largest_values.pdf", id: IDS.subtraction,
    options: { worksheetSeed: "g4-b3-stress-subtraction-compare", minA: 9000, maxA: 10000, minB: 100, maxB: 1000, selectedStoryTypes: ["compare"] }
  },
  {
    folder: "stress", filename: "05_subtraction_maximum_count_compact_key.pdf", id: IDS.subtraction,
    options: { worksheetSeed: "g4-b3-stress-subtraction-count", questionCount: 16, questionsPerPage: 3 }
  }
]);

class FileResponse extends Writable {
  constructor(filePath) { super(); this.file = fs.createWriteStream(filePath); }
  setHeader() {}
  _write(chunk, encoding, callback) { this.file.write(chunk, encoding, callback); }
  _final(callback) { this.file.end(callback); }
}

async function renderProof(spec) {
  const runtime = buildCatalogWorksheetRuntime(spec.id, spec.options);
  const outputDir = path.join(ROOT, spec.folder);
  fs.mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, spec.filename);
  await new Promise((resolve, reject) => {
    const response = new FileResponse(filePath);
    response.once("finish", resolve);
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: { filename: spec.filename, disposition: "inline", includeAnswerKey: true }
    });
  });
  return { filePath, questions: runtime.worksheet.problems.length };
}

async function run() {
  const results = [];
  for (const spec of PROOFS) results.push(await renderProof(spec));
  for (const folder of ["founder-review", "stress"]) {
    const actual = fs.readdirSync(path.join(ROOT, folder)).filter((name) => name.endsWith(".pdf")).sort();
    const expected = PROOFS.filter((spec) => spec.folder === folder).map((spec) => spec.filename).sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`${folder} must contain exactly: ${expected.join(", ")}. Found: ${actual.join(", ")}.`);
    }
  }
  console.log(JSON.stringify(results, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
