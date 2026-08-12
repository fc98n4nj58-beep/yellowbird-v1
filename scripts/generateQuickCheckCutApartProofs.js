"use strict";

const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderQuickCheckPDF } = require("../renderers/quickCheckPdfRenderer");

const OUT = path.join(
  __dirname,
  "..",
  "review",
  "quick-check-cut-apart-implementation",
  "founder-review-2026-08-11"
);

const IDS = [
  "g4_compare_fractions_quick_check",
  "g3_compare_3_digit_numbers_quick_check",
  "g5_place_value_to_100000_quick_check",
  "g5_equivalent_fractions_quick_check",
  "g3_place_value_hundreds_tens_ones_quick_check",
  "g2_subtraction_within_20_quick_check",
  "g3_expanded_form_to_standard_form_quick_check",
  "g2_missing_addends_within_20_quick_check"
];

class FileResponse extends Writable {
  constructor(file) {
    super();
    this.stream = fs.createWriteStream(file);
  }

  setHeader() {}

  _write(chunk, encoding, callback) {
    this.stream.write(chunk, encoding, callback);
  }

  _final(callback) {
    this.stream.end(callback);
  }
}

function generateProof(id, index) {
  return new Promise((resolve, reject) => {
    const runtime = buildCatalogWorksheetRuntime(id, {
      worksheetSeed: `quick-check-cut-apart-proof:${id}:v2`
    });
    const file = path.join(OUT, `${String(index + 1).padStart(2, "0")}_${id}.pdf`);
    const res = new FileResponse(file);
    res.once("finish", () => resolve({ id, file }));
    res.once("error", reject);
    renderQuickCheckPDF({
      res,
      item: runtime.item,
      contentObject: runtime.normalizedContentObject,
      options: { includeAnswerKey: true, filename: path.basename(file) }
    });
  });
}

(async () => {
  if (fs.existsSync(OUT)) throw new Error(`Refusing to overwrite ${OUT}`);
  fs.mkdirSync(OUT, { recursive: true });
  const proofs = [];
  for (let index = 0; index < IDS.length; index += 1) {
    proofs.push(await generateProof(IDS[index], index));
  }
  fs.writeFileSync(
    path.join(OUT, "proof-manifest.json"),
    `${JSON.stringify({ proofCount: proofs.length, proofs }, null, 2)}\n`
  );
  console.log(JSON.stringify({ OUT, proofCount: proofs.length }));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
