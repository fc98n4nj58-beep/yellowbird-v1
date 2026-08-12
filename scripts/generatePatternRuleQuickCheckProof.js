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
  "pattern-rule-quick-check-implementation",
  "founder-review-2026-08-11"
);
const ID = "g4_pattern_rule_quick_check";

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

(async () => {
  if (fs.existsSync(OUT)) throw new Error(`Refusing to overwrite ${OUT}`);
  fs.mkdirSync(OUT, { recursive: true });
  const runtime = buildCatalogWorksheetRuntime(ID, {
    worksheetSeed: "pattern-rule-quick-check-final-proof-v1"
  });
  const file = path.join(OUT, `${ID}_student_and_key.pdf`);
  await new Promise((resolve, reject) => {
    const res = new FileResponse(file);
    res.once("finish", resolve);
    res.once("error", reject);
    renderQuickCheckPDF({
      res,
      item: runtime.item,
      contentObject: runtime.normalizedContentObject,
      options: { includeAnswerKey: true, filename: path.basename(file) }
    });
  });
  fs.writeFileSync(
    path.join(OUT, "proof-manifest.json"),
    `${JSON.stringify({ id: ID, questionCount: 7, pageCount: 2, file }, null, 2)}\n`
  );
  console.log(JSON.stringify({ OUT, file }));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
