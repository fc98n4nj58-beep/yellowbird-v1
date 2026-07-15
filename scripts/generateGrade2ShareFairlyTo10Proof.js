const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const RESOURCE_ID = "grade2_fraction_equivalence_fraction_word_problems";
const OUTPUT_DIR = path.join(__dirname, "..", "review", "grade-2-share-fairly-to-10", "founder-review");
const FILENAME = "g2_share_fairly_to_10_default_student_and_key.pdf";

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
    worksheetSeed: "grade2-share-founder"
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
    studentScenarios: runtime.contentObject.content.items.length,
    sharerCounts: runtime.contentObject.content.items.map(({ fractionModel }) => fractionModel.sharerCount),
    scenariosPerPage: runtime.layout.display.fairShareItemsPerPage,
    completedExample: runtime.contentObject.content.items.some(({ isExample, fractionWorkedModel }) => isExample || fractionWorkedModel),
    pageContract: "two student pages plus two answer-key pages"
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
