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
  "grade-2-category-e-batch-3",
  "founder-review"
);
const PROOFS = Object.freeze([
  {
    id: "g2_addition_word_problems_within_100",
    seed: "grade2-category-e-batch3-founder-addition",
    filename: "g2_addition_word_problems_within_100_default_student_and_key.pdf"
  },
  {
    id: "grade2_multiplication_facts_word_problems",
    seed: "grade2-category-e-batch3-founder-multiplication",
    filename: "g2_multiplication_word_problems_default_student_and_key.pdf"
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

  const proofFiles = fs.readdirSync(OUTPUT_DIR).filter((name) => name.endsWith(".pdf")).sort();
  const expectedFiles = PROOFS.map((spec) => spec.filename).sort();
  if (JSON.stringify(proofFiles) !== JSON.stringify(expectedFiles)) {
    throw new Error(`Expected exactly ${expectedFiles.join(", ")}; found ${proofFiles.join(", ")}.`);
  }

  console.log(JSON.stringify(results, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
