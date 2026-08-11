const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const OUTPUT_DIR = path.join(__dirname, "..", "review", "fair-sharing-answer-box-correction", "founder-review");
const PROOFS = Object.freeze([
  Object.freeze({
    id: "grade1_fraction_equivalence_fraction_word_problems",
    filename: "grade1_share_fairly_default_student_and_key.pdf"
  }),
  Object.freeze({
    id: "grade2_fraction_equivalence_fraction_word_problems",
    filename: "grade2_share_fairly_to_10_default_student_and_key.pdf"
  })
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

function renderProof(definition) {
  const runtime = buildCatalogWorksheetRuntime(definition.id, {
    worksheetSeed: `founder-review:${definition.id}:v1`
  });
  const filePath = path.join(OUTPUT_DIR, definition.filename);
  return new Promise((resolve, reject) => {
    const response = new FileResponse(filePath);
    response.on("finish", () => resolve({ filePath, runtime }));
    response.on("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.contentObject,
      layoutObject: runtime.layout,
      options: { filename: definition.filename, disposition: "inline", includeAnswerKey: true }
    });
  });
}

async function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const results = [];
  for (const proof of PROOFS) results.push(await renderProof(proof));
  console.log(JSON.stringify({
    proofCount: results.length,
    proofs: results.map(({ filePath, runtime }) => ({
      filePath,
      resourceId: runtime.item.id,
      sharerCounts: runtime.contentObject.content.items.map(({ fractionModel }) => fractionModel.sharerCount),
      trayColumns: runtime.layout.display.fairShareTrayColumns,
      minimumTrayHeight: runtime.layout.display.fairShareMinimumTrayHeight
    }))
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
