const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const OUTPUT_DIR = path.join(__dirname, "..", "review", "pre-launch-whole-number-extension", "internal-design-proof");
const PROOFS = Object.freeze([
  { filename: "01_g2_even_and_odd_numbers_default.pdf", resourceId: "g2_even_and_odd_numbers", worksheetSeed: "g2-even-odd-default" },
  { filename: "02_g3_round_whole_numbers_default.pdf", resourceId: "g3_round_whole_numbers", worksheetSeed: "g3-round-default" },
  { filename: "03_g4_round_whole_numbers_default.pdf", resourceId: "g4_round_whole_numbers", worksheetSeed: "g4-round-default" },
  { filename: "04_g3_round_whole_numbers_midpoints.pdf", resourceId: "g3_round_whole_numbers", worksheetSeed: "g3-round-midpoints", boundaryCasesOnly: true },
  { filename: "05_g4_round_whole_numbers_midpoints.pdf", resourceId: "g4_round_whole_numbers", worksheetSeed: "g4-round-midpoints", boundaryCasesOnly: true }
]);

class FileResponse extends Writable {
  constructor(filePath) { super(); this.file = fs.createWriteStream(filePath); }
  setHeader() {}
  _write(chunk, encoding, callback) { this.file.write(chunk, encoding, callback); }
  _final(callback) { this.file.end(callback); }
}

function renderProof(proof) {
  return new Promise((resolve, reject) => {
    const runtime = buildCatalogWorksheetRuntime(proof.resourceId, proof);
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
  for (const proof of PROOFS) console.log(path.relative(process.cwd(), await renderProof(proof)));
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
