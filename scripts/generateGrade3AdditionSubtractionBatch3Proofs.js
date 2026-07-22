const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const OUTPUT_DIR = path.join(__dirname, "..", "review", "grade-3-addition-subtraction-batch-3", "founder-review");
const PROOFS = Object.freeze([
  { filename: "01_equal_or_not_equal.pdf", resourceId: "grade3_addition_subtraction_facts_equation_match", worksheetSeed: "grade3-b3-equation-default" },
  { filename: "02_fact_families.pdf", resourceId: "grade3_addition_subtraction_facts_fact_family", worksheetSeed: "grade3-b3-family-default" },
  { filename: "03_addition_subtraction_facts.pdf", resourceId: "grade3_addition_subtraction_facts_fact_fluency", worksheetSeed: "grade3-b3-fluency-default" },
  { filename: "04_missing_addends.pdf", resourceId: "grade3_addition_subtraction_facts_missing_addend", worksheetSeed: "grade3-b3-missing-default" }
]);

class FileResponse extends Writable {
  constructor(filePath) { super(); this.file = fs.createWriteStream(filePath); }
  setHeader() {}
  _write(chunk, encoding, callback) { this.file.write(chunk, encoding, callback); }
  _final(callback) { this.file.end(callback); }
}

function renderProof(proof) {
  return new Promise((resolve, reject) => {
    const runtime = buildCatalogWorksheetRuntime(proof.resourceId, { worksheetSeed: proof.worksheetSeed });
    const outputPath = path.join(OUTPUT_DIR, proof.filename);
    const response = new FileResponse(outputPath);
    response.once("finish", () => resolve(outputPath));
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: { filename: proof.filename, disposition: "inline", includeAnswerKey: true }
    });
  });
}

async function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const generated = [];
  for (const proof of PROOFS) generated.push(await renderProof(proof));
  generated.forEach((filePath) => console.log(path.relative(process.cwd(), filePath)));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
