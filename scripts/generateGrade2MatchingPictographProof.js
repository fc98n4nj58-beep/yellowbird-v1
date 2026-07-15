const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const RESOURCE_ID = "grade2_data_display_graphing_match_data_to_graph";
const OUTPUT_DIR = path.join(__dirname, "..", "review", "grade-2-matching-pictograph", "founder-review");
const FILENAME = "g2_choose_the_matching_pictograph_default_student_and_key.pdf";

class FileResponse extends Writable {
  constructor(filePath) { super(); this.file = fs.createWriteStream(filePath); }
  setHeader() {}
  _write(chunk, encoding, callback) { this.file.write(chunk, encoding, callback); }
  _final(callback) { this.file.end(callback); }
}

async function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const runtime = buildCatalogWorksheetRuntime(RESOURCE_ID, {
    worksheetSeed: "grade2-matching-pictograph-founder-default",
    graphTopicId: "favourite-fruits"
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
  console.log(JSON.stringify({
    filePath,
    topics: runtime.normalizedContentObject.content.items.map((item) => item.graphData.topicId),
    answers: runtime.normalizedContentObject.content.items.map((item) => item.answer)
  }, null, 2));
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
