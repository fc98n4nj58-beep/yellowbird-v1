"use strict";

const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderExitTicketPDF } = require("../renderers/exitTicketPdfRenderer");

const OUTPUT_DIR = path.join(
  __dirname,
  "..",
  "review",
  "exit-ticket-four-up-implementation",
  "founder-review-2026-08-11"
);
const IDS = Object.freeze([
  "g4_compare_fractions_exit_ticket",
  "g3_compare_3_digit_numbers_exit_ticket",
  "g5_compare_numbers_to_100000_exit_ticket",
  "g5_equivalent_fractions_exit_ticket",
  "g2_missing_addends_within_20_exit_ticket",
  "g3_expanded_form_to_standard_form_exit_ticket"
]);

class FileResponse extends Writable {
  constructor(filePath) { super(); this.stream = fs.createWriteStream(filePath); }
  setHeader() {}
  _write(chunk, encoding, callback) { this.stream.write(chunk, encoding, callback); }
  _final(callback) { this.stream.end(callback); }
}

function renderProof(id, index) {
  return new Promise((resolve, reject) => {
    const runtime = buildCatalogWorksheetRuntime(id, { worksheetSeed: `exit-ticket-four-up-proof:${id}:v2` });
    const outputPath = path.join(OUTPUT_DIR, `${String(index + 1).padStart(2, "0")}_${id}.pdf`);
    const res = new FileResponse(outputPath);
    res.once("finish", () => resolve({ id, outputPath }));
    res.once("error", reject);
    renderExitTicketPDF({
      res,
      item: runtime.item,
      contentObject: runtime.normalizedContentObject,
      options: { includeAnswerKey: true, filename: path.basename(outputPath) }
    });
  });
}

async function run() {
  if (fs.existsSync(OUTPUT_DIR)) throw new Error(`Refusing to overwrite existing proof folder: ${OUTPUT_DIR}`);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const proofs = [];
  for (let index = 0; index < IDS.length; index += 1) proofs.push(await renderProof(IDS[index], index));
  fs.writeFileSync(path.join(OUTPUT_DIR, "proof-manifest.json"), `${JSON.stringify({ proofCount: proofs.length, proofs }, null, 2)}\n`);
  console.log(JSON.stringify({ outputDirectory: OUTPUT_DIR, proofCount: proofs.length }, null, 2));
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
