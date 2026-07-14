const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const OUTPUT_DIR = path.join(
  __dirname,
  "..",
  "review",
  "grade-1-category-f-batch-2-data",
  "founder-context-recheck"
);

const RESOURCES = [
  {
    id: "grade1_data_display_graphing_read_graph",
    filename: "grade1_read_the_graph_context_recheck.pdf",
    seed: "grade1-data-read-founder-recheck",
    graphTopicId: "favourite-fruits"
  },
  {
    id: "grade1_data_display_graphing_interpret_data",
    filename: "grade1_compare_the_data_context_recheck.pdf",
    seed: "grade1-data-compare-founder-recheck",
    graphTopicId: "playground-activities"
  },
  {
    id: "grade1_data_display_graphing_graph_questions",
    filename: "grade1_graph_questions_context_recheck.pdf",
    seed: "grade1-data-mixed-founder-recheck",
    graphTopicId: "animals-seen-at-a-pond"
  }
];

class FileResponse extends Writable {
  constructor(filePath) {
    super();
    this.headers = {};
    this.file = fs.createWriteStream(filePath);
  }

  setHeader(name, value) {
    this.headers[name] = value;
  }

  _write(chunk, encoding, callback) {
    this.file.write(chunk, encoding, callback);
  }

  _final(callback) {
    this.file.end(callback);
  }
}

function renderProof(definition) {
  return new Promise((resolve, reject) => {
    const runtime = buildCatalogWorksheetRuntime(definition.id, definition.options);
    const filePath = path.join(OUTPUT_DIR, definition.filename);
    const response = new FileResponse(filePath);
    response.on("finish", () => resolve({ filePath, runtime }));
    response.on("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.contentObject,
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
  fs.readdirSync(OUTPUT_DIR)
    .filter((entry) => entry.toLowerCase().endsWith(".pdf"))
    .forEach((entry) => fs.unlinkSync(path.join(OUTPUT_DIR, entry)));

  const cases = RESOURCES.map((resource) => ({
    ...resource,
    options: {
      worksheetSeed: resource.seed,
      graphTopicId: resource.graphTopicId,
      includeExample: true
    }
  }));

  const proofs = [];
  for (const definition of cases) {
    const { filePath, runtime } = await renderProof(definition);
    const items = runtime.contentObject.content.items;
    proofs.push({
      filePath,
      title: runtime.layout.header.title,
      questions: items.length,
      completedQuestionOne: Boolean(items[0]?.isExample),
      graph: runtime.layout.display.sharedDataGraph,
      scenario: runtime.layout.display.sharedDataScenario,
      footer: runtime.contentObject.meta.curriculum.footerText
    });
  }

  if (proofs.length !== 3) throw new Error(`Expected 3 founder recheck proofs; generated ${proofs.length}.`);
  if (new Set(proofs.map((proof) => proof.graph.topicId)).size !== 3) {
    throw new Error("Founder recheck proofs must use three different graph topics.");
  }
  if (new Set(proofs.map((proof) => proof.scenario)).size !== 3) {
    throw new Error("Founder recheck proofs must use three different context scenarios.");
  }
  proofs.forEach((proof) => {
    if (!proof.scenario || proof.scenario !== proof.graph.scenario) {
      throw new Error(`Scenario parity failed for ${proof.filePath}.`);
    }
  });
  console.log(JSON.stringify({ outputDir: OUTPUT_DIR, proofs }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
