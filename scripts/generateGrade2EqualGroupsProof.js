"use strict";

const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const ID = "grade2_multiplication_facts_equal_groups";
const OUTPUT_DIR = path.join(__dirname, "..", "review", "grade-2-equal-groups", "founder-review");
const FILENAME = "g2_multiplication_equal_groups_default_student_and_key.pdf";

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

async function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const runtime = buildCatalogWorksheetRuntime(ID, {
    worksheetSeed: "g2-equal-groups-founder-default"
  });
  const filePath = path.join(OUTPUT_DIR, FILENAME);
  await new Promise((resolve, reject) => {
    const response = new FileResponse(filePath);
    response.once("finish", resolve);
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.contentObject,
      layoutObject: runtime.layout,
      options: { filename: FILENAME, disposition: "inline", includeAnswerKey: true }
    });
  });

  console.log(JSON.stringify({
    filePath,
    title: runtime.layout.header.title,
    instruction: runtime.layout.instruction,
    footer: runtime.contentObject.meta.curriculum.footerText,
    questions: runtime.contentObject.content.items.length,
    completedExample: runtime.contentObject.content.items.some((item) => item.isExample)
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
