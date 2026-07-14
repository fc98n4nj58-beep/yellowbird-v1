const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const OUTPUT_DIR = path.join(__dirname, "..", "review", "grade-1-category-f-batch-3-data", "founder-review");
const PROOFS = Object.freeze([
  {
    id: "grade1_data_display_graphing_complete_graph",
    filename: "grade1_complete_the_pictograph_founder_default.pdf",
    worksheetSeed: "batch3-complete-founder",
    graphTopicId: "things-in-a-backpack"
  },
  {
    id: "grade1_data_display_graphing_match_data_to_graph",
    filename: "grade1_choose_the_matching_graph_founder_default.pdf",
    worksheetSeed: "batch3-match-founder",
    graphTopicId: "favourite-fruits"
  },
  {
    id: "grade1_data_display_graphing_graph_word_problems",
    filename: "grade1_use_the_graph_to_solve_founder_default.pdf",
    worksheetSeed: "batch3-application-founder",
    graphTopicId: "animals-seen-at-a-pond"
  },
  {
    id: "grade1_data_display_graphing_graph_word_problems",
    filename: "grade1_use_the_graph_to_solve_founder_completed_q1.pdf",
    worksheetSeed: "batch3-application-completed-founder",
    graphTopicId: "classroom-materials",
    includeExample: true
  }
]);

class FileResponse extends Writable {
  constructor(filePath) {
    super();
    this.headers = {};
    this.file = fs.createWriteStream(filePath);
  }
  setHeader(name, value) { this.headers[name] = value; }
  _write(chunk, encoding, callback) { this.file.write(chunk, encoding, callback); }
  _final(callback) { this.file.end(callback); }
}

function renderProof(definition) {
  return new Promise((resolve, reject) => {
    const runtime = buildCatalogWorksheetRuntime(definition.id, definition);
    const filePath = path.join(OUTPUT_DIR, definition.filename);
    const response = new FileResponse(filePath);
    response.on("finish", () => resolve({ filePath, runtime }));
    response.on("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.contentObject,
      layoutObject: runtime.layout,
      options: { filename: definition.filename, disposition: "inline", includeAnswerKey: true }
    });
  });
}

async function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const applicationsOnly = process.argv.includes("--applications-only");
  const selectedProofs = applicationsOnly
    ? PROOFS.filter((definition) => definition.id === "grade1_data_display_graphing_graph_word_problems")
    : PROOFS;
  if (!applicationsOnly) {
    fs.readdirSync(OUTPUT_DIR).filter((name) => name.endsWith(".pdf")).forEach((name) => fs.unlinkSync(path.join(OUTPUT_DIR, name)));
  }
  const results = [];
  for (const definition of selectedProofs) results.push(await renderProof(definition));
  const files = fs.readdirSync(OUTPUT_DIR).filter((name) => name.endsWith(".pdf"));
  if (files.length !== 4) throw new Error(`Expected exactly four founder PDFs; found ${files.length}.`);
  console.log(JSON.stringify({
    outputDir: OUTPUT_DIR,
    regeneratedProofCount: results.length,
    proofs: results.map(({ filePath, runtime }) => ({
      filePath,
      title: runtime.layout.header.title,
      topicId: runtime.contentObject.content.items[0].graphData.topicId,
      questions: runtime.contentObject.content.items.length,
      completedQuestionOne: Boolean(runtime.contentObject.content.items[0].isExample)
    }))
  }, null, 2));
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
