const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const RESOURCE_ID = "grade2_fraction_equivalence_shade_fraction_models";
const OUTPUT_DIR = path.join(__dirname, "..", "review", "grade-2-shade-equal-parts", "founder-review");
const FILENAME = "g2_shade_equal_parts_default_student_and_key.pdf";

class FileResponse extends Writable {
  constructor(filePath) {
    super();
    this.file = fs.createWriteStream(filePath);
  }
  setHeader() {}
  _write(chunk, encoding, callback) { this.file.write(chunk, encoding, callback); }
  _final(callback) { this.file.end(callback); }
}

async function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const runtime = buildCatalogWorksheetRuntime(RESOURCE_ID, {
    worksheetSeed: "grade2-shade-founder"
  });
  const filePath = path.join(OUTPUT_DIR, FILENAME);

  await new Promise((resolve, reject) => {
    const response = new FileResponse(filePath);
    response.on("finish", resolve);
    response.on("error", reject);
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
    studentItems: runtime.contentObject.content.items.length,
    columns: runtime.layout.template.columns,
    completedExample: runtime.contentObject.content.items.some(({ isExample, fractionWorkedModel }) => isExample || fractionWorkedModel),
    pageContract: "one student page plus one answer-key page"
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
