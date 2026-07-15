const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const OUTPUT_DIR = path.join(
  __dirname,
  "..",
  "review",
  "grade-2-pictograph-reading",
  "founder-review"
);

const PROOFS = Object.freeze([
  {
    id: "grade2_data_display_graphing_read_graph",
    filename: "g2_read_the_pictograph_default_student_and_key.pdf",
    worksheetSeed: "grade2-pictograph-read-founder-default",
    graphTopicId: "favourite-fruits"
  },
  {
    id: "grade2_data_display_graphing_interpret_data",
    filename: "g2_interpret_the_pictograph_default_student_and_key.pdf",
    worksheetSeed: "grade2-pictograph-interpret-founder-default",
    graphTopicId: "playground-activities"
  }
]);

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

function renderProof(definition) {
  return new Promise((resolve, reject) => {
    const runtime = buildCatalogWorksheetRuntime(definition.id, {
      worksheetSeed: definition.worksheetSeed,
      graphTopicId: definition.graphTopicId,
      includeExample: false
    });
    const filePath = path.join(OUTPUT_DIR, definition.filename);
    const response = new FileResponse(filePath);
    response.on("finish", () => resolve({ filePath, runtime }));
    response.on("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: {
        filename: definition.filename,
        disposition: "inline",
        includeAnswerKey: true
      }
    });
  });
}

async function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const results = [];

  for (const proof of PROOFS) {
    const result = await renderProof(proof);
    results.push({
      filePath: result.filePath,
      title: result.runtime.layout.header.title,
      topicId: result.runtime.layout.display.sharedDataGraph.topicId,
      values: result.runtime.layout.display.sharedDataGraph.values,
      questionTypes: result.runtime.normalizedContentObject.content.items.map(
        (item) => item.graphQuestionType
      ),
      pagesExpected: 2
    });
  }

  if (results.length !== 2) throw new Error(`Expected two proofs; generated ${results.length}.`);
  console.log(JSON.stringify(results, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
