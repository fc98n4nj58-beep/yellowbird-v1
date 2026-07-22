"use strict";

const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const ROOT_DIR = path.join(__dirname, "..", "review", "grade-3-final-reconciliation");
const RESOURCE_ID = "grade3_place_value_representation_base_ten_blocks";
const PROOFS = Object.freeze([
  ["founder-review", "01_base_ten_blocks.pdf", "grade3-final-founder", {}],
  ["stress", "01_base_ten_blocks_largest_safe_density.pdf", "grade3-final-stress-density", {
    selectedNumbers: [399, 409, 490, 491, 492, 493, 498, 499]
  }],
  ["stress", "02_base_ten_blocks_completed_example.pdf", "grade3-final-stress-example", {
    questionCount: 7,
    includeExample: true
  }]
].map(([folder, filename, seed, options]) => ({ folder, filename, seed, options })));

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
  const outputDir = path.join(ROOT_DIR, spec.folder);
  fs.mkdirSync(outputDir, { recursive: true });
  const runtime = buildCatalogWorksheetRuntime(RESOURCE_ID, {
    worksheetSeed: spec.seed,
    ...spec.options
  });
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
  return filePath;
}

async function run() {
  const results = [];
  for (const spec of PROOFS) results.push(await renderProof(spec));
  console.log(JSON.stringify(results, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
