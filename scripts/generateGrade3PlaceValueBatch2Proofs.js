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
  "grade-3-place-value-batch-2",
  "founder-review"
);

const PROOFS = Object.freeze([
  Object.freeze({
    filename: "01_expanded_form.pdf",
    resourceId: "grade3_place_value_representation_expanded_form",
    worksheetSeed: "grade3-batch2-expanded-form-default"
  }),
  Object.freeze({
    filename: "02_write_number_words.pdf",
    resourceId: "grade3_place_value_representation_number_word_match",
    worksheetSeed: "grade3-batch2-number-words-default"
  }),
  Object.freeze({
    filename: "03_standard_form.pdf",
    resourceId: "grade3_place_value_representation_standard_form",
    worksheetSeed: "grade3-batch2-standard-form-default"
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
      contentObject: runtime.normalizedContentObject,
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
