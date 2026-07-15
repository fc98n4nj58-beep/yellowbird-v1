const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const RESOURCE_ID = "grade2_data_display_graphing_complete_graph";
const OUTPUT_DIR = path.join(__dirname, "..", "review", "grade-2-complete-pictograph", "founder-review");
const FILENAME = "g2_complete_the_pictograph_default_student_and_key.pdf";

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
    worksheetSeed: "grade2-complete-pictograph-founder-default",
    graphTopicId: "classroom-materials"
  });
  const filePath = path.join(OUTPUT_DIR, FILENAME);
  await new Promise((resolve, reject) => {
    const response = new FileResponse(filePath);
    response.on("finish", resolve);
    response.on("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: { filename: FILENAME, disposition: "inline", includeAnswerKey: true }
    });
  });
  const proofFiles = fs.readdirSync(OUTPUT_DIR).filter((name) => name.endsWith(".pdf"));
  if (proofFiles.length !== 1 || proofFiles[0] !== FILENAME) {
    throw new Error(`Expected exactly one founder PDF named '${FILENAME}'; found ${proofFiles.join(", ")}.`);
  }
  console.log(JSON.stringify({ filePath, topicId: runtime.layout.display.sharedDataGraph.topicId }, null, 2));
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
