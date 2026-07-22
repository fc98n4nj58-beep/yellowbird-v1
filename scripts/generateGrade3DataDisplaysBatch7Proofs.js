"use strict";

const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const ROOT_DIR = path.join(__dirname, "..", "review", "grade-3-data-displays-batch-7");
const PROOFS = Object.freeze([
  ["founder-review", "g3_complete_a_graph", "grade3-b7-founder-complete", "01_complete_the_graph.pdf", {}],
  ["founder-review", "g3_graph_questions", "grade3-b7-founder-questions", "02_graph_questions.pdf", {}],
  ["founder-review", "g3_interpret_data", "grade3-b7-founder-interpret", "03_interpret_the_data.pdf", {}],
  ["founder-review", "g3_match_data_to_graph", "grade3-b7-founder-match", "04_match_data_to_graph.pdf", {}],
  ["founder-review", "g3_read_a_graph", "grade3-b7-founder-read", "05_read_the_graph.pdf", {}],
  ["stress", "g3_complete_a_graph", "grade3-b7-stress-complete", "01_complete_long_labels_max_values.pdf", {
    selectedCategories: ["Hide-and-Seek", "Space Station", "Plant Helper", "Animal Tales"],
    selectedValues: [8, 7, 6, 5]
  }],
  ["stress", "g3_graph_questions", "grade3-b7-stress-questions", "02_questions_completed_example_pagination.pdf", {
    questionCount: 5,
    questionsPerPage: 3,
    includeExample: true,
    selectedCategories: ["Basketball", "Rain Gauge", "Fire Truck", "Helicopter"],
    selectedValues: [8, 7, 5, 2]
  }],
  ["stress", "g3_match_data_to_graph", "grade3-b7-stress-match", "03_match_choice_density.pdf", {
    selectedCategories: ["Hide-and-Seek", "Space Station", "Plant Helper", "Animal Tales"],
    selectedValues: [8, 7, 6, 5]
  }]
].map(([folder, id, seed, filename, options]) => ({ folder, id, seed, filename, options })));

class FileResponse extends Writable {
  constructor(filePath) {
    super();
    this.file = fs.createWriteStream(filePath);
  }
  setHeader() {}
  _write(chunk, encoding, callback) { this.file.write(chunk, encoding, callback); }
  _final(callback) { this.file.end(callback); }
}

async function renderProof(spec) {
  const outputDir = path.join(ROOT_DIR, spec.folder);
  fs.mkdirSync(outputDir, { recursive: true });
  const runtime = buildCatalogWorksheetRuntime(spec.id, {
    worksheetSeed: spec.seed,
    ...spec.options
  });
  const filePath = path.join(outputDir, spec.filename);
  await new Promise((resolve, reject) => {
    const response = new FileResponse(filePath);
    response.once("finish", resolve);
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: { filename: spec.filename, disposition: "inline", includeAnswerKey: true }
    });
  });
  return {
    id: spec.id,
    filePath,
    title: runtime.layout.header.title,
    instruction: runtime.layout.instruction,
    footer: runtime.contentObject.meta.curriculum.footerText,
    questionCount: runtime.normalizedContentObject.content.items.length
  };
}

async function run() {
  const results = [];
  for (const spec of PROOFS) results.push(await renderProof(spec));
  for (const folder of ["founder-review", "stress"]) {
    const expected = PROOFS.filter((spec) => spec.folder === folder).map((spec) => spec.filename).sort();
    const actual = fs.readdirSync(path.join(ROOT_DIR, folder)).filter((name) => name.endsWith(".pdf")).sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${folder}: ${expected.join(", ")}; found ${actual.join(", ")}.`);
    }
  }
  console.log(JSON.stringify(results, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
