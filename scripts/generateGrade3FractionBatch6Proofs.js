"use strict";

const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const ROOT_DIR = path.join(__dirname, "..", "review", "grade-3-fraction-batch-6");
const PROOFS = Object.freeze([
  {
    folder: "founder-review",
    id: "grade3_fraction_equivalence_compare_fractions",
    seed: "grade3-batch6-founder-compare",
    filename: "01_compare_fractions.pdf",
    options: {}
  },
  {
    folder: "founder-review",
    id: "grade3_fraction_equivalence_fraction_number_line",
    seed: "grade3-batch6-founder-number-line",
    filename: "02_fractions_on_a_number_line.pdf",
    options: {}
  },
  {
    folder: "stress",
    id: "grade3_fraction_equivalence_compare_fractions",
    seed: "grade3-batch6-stress-compare",
    filename: "01_compare_fractions_completed_example.pdf",
    options: { includeExample: true }
  },
  {
    folder: "stress",
    id: "grade3_fraction_equivalence_fraction_number_line",
    seed: "grade3-batch6-stress-endpoints",
    filename: "02_fraction_number_line_endpoints_completed_example.pdf",
    options: {
      questionCount: 3,
      includeExample: true,
      allowEndpointTargets: true,
      selectedDenominators: [8],
      selectedFractions: ["0/8", "8/8", "7/8", "1/8"]
    }
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
  const outputDir = path.join(ROOT_DIR, spec.folder);
  fs.mkdirSync(outputDir, { recursive: true });
  const runtime = buildCatalogWorksheetRuntime(spec.id, {
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
  const results = [];
  for (const spec of PROOFS) results.push(await renderProof(spec));
  for (const folder of ["founder-review", "stress"]) {
    const expected = PROOFS.filter((spec) => spec.folder === folder).map((spec) => spec.filename).sort();
    const actual = fs.readdirSync(path.join(ROOT_DIR, folder)).filter((name) => name.endsWith(".pdf")).sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${folder}: ${expected.join(", ")}; found ${actual.join(", ")}.`);
    }
  }
  console.log(JSON.stringify(results, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
