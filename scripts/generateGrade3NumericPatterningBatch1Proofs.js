const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const {
  buildCatalogWorksheetRuntime
} = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const OUTPUT_DIR = path.join(
  __dirname,
  "..",
  "review",
  "grade-3-numeric-patterning-batch-1",
  "founder-review"
);

const PROOFS = Object.freeze([
  Object.freeze({
    filename: "01_extend_the_pattern.pdf",
    resourceId: "grade3_patterning_and_algebra_extend_pattern",
    worksheetSeed: "grade3-batch1-extend-default"
  }),
  Object.freeze({
    filename: "02_identify_the_pattern_rule.pdf",
    resourceId: "grade3_patterning_and_algebra_identify_pattern_rule",
    worksheetSeed: "grade3-batch1-identify-default"
  }),
  Object.freeze({
    filename: "03_find_the_missing_number.pdf",
    resourceId: "grade3_patterning_and_algebra_missing_value_pattern",
    worksheetSeed: "grade3-batch1-missing-default"
  })
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

function renderProof(proof) {
  return new Promise((resolve, reject) => {
    const runtime = buildCatalogWorksheetRuntime(proof.resourceId, {
      worksheetSeed: proof.worksheetSeed
    });
    const outputPath = path.join(OUTPUT_DIR, proof.filename);
    const response = new FileResponse(outputPath);

    response.once("finish", () => resolve(outputPath));
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.contentObject,
      layoutObject: runtime.layout,
      options: {
        filename: proof.filename,
        disposition: "inline",
        includeAnswerKey: true
      }
    });
  });
}

async function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const generated = [];
  for (const proof of PROOFS) {
    generated.push(await renderProof(proof));
  }
  generated.forEach((filePath) => console.log(path.relative(process.cwd(), filePath)));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
