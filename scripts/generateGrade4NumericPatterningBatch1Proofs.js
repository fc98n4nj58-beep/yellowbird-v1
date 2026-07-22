const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const ROOT = path.join(__dirname, "..", "review", "grade-4-numeric-patterning-batch-1");
const PROOFS = Object.freeze([
  Object.freeze({
    folder: "founder-review",
    filename: "01_extend_the_pattern.pdf",
    resourceId: "grade4_patterning_and_algebra_extend_pattern",
    options: { worksheetSeed: "grade4-batch1-extend-default" }
  }),
  Object.freeze({
    folder: "founder-review",
    filename: "02_identify_the_pattern_rule.pdf",
    resourceId: "grade4_patterning_and_algebra_identify_pattern_rule",
    options: { worksheetSeed: "grade4-batch1-identify-default" }
  }),
  Object.freeze({
    folder: "founder-review",
    filename: "03_find_the_missing_values.pdf",
    resourceId: "grade4_patterning_and_algebra_missing_value_pattern",
    options: { worksheetSeed: "grade4-batch1-missing-default" }
  }),
  Object.freeze({
    folder: "stress",
    filename: "01_extend_maximum_density_and_width.pdf",
    resourceId: "grade4_patterning_and_algebra_extend_pattern",
    options: {
      worksheetSeed: "grade4-batch1-extend-stress",
      questionCount: 12,
      questionsPerPage: 12,
      operationMode: "subtract",
      minStart: 300,
      maxStart: 500,
      selectedSteps: [25]
    }
  }),
  Object.freeze({
    folder: "stress",
    filename: "02_extend_maximum_sequence_width.pdf",
    resourceId: "grade4_patterning_and_algebra_extend_pattern",
    options: {
      worksheetSeed: "grade4-batch1-extend-width-stress",
      questionCount: 12,
      questionsPerPage: 12,
      operationMode: "subtract",
      minStart: 300,
      maxStart: 500,
      selectedSteps: [25],
      visibleLength: 4,
      continuationCount: 3
    }
  }),
  Object.freeze({
    folder: "stress",
    filename: "02_identify_largest_safe_terms.pdf",
    resourceId: "grade4_patterning_and_algebra_identify_pattern_rule",
    options: {
      worksheetSeed: "grade4-batch1-identify-stress",
      questionCount: 10,
      selectedOperations: ["add", "subtract"],
      selectedSteps: [20, 25],
      minStart: 500,
      maxStart: 800,
      sequenceLength: 7,
      includeExample: true
    }
  }),
  Object.freeze({
    folder: "stress",
    filename: "03_missing_multiple_positions.pdf",
    resourceId: "grade4_patterning_and_algebra_missing_value_pattern",
    options: {
      worksheetSeed: "grade4-batch1-missing-stress",
      questionCount: 12,
      selectedOperations: ["add", "subtract"],
      selectedSteps: [20, 25],
      minStart: 300,
      maxStart: 700,
      sequenceLength: 7,
      missingIndexes: [1, 5],
      missingTermCount: 2,
      includeExample: true
    }
  })
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
    const outputDirectory = path.join(ROOT, definition.folder);
    fs.mkdirSync(outputDirectory, { recursive: true });
    const outputPath = path.join(outputDirectory, definition.filename);
    const runtime = buildCatalogWorksheetRuntime(definition.resourceId, definition.options);
    const response = new FileResponse(outputPath);
    response.once("finish", () => resolve(outputPath));
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.contentObject,
      layoutObject: runtime.layout,
      options: { filename: definition.filename, disposition: "inline", includeAnswerKey: true }
    });
  });
}

async function run() {
  const generated = [];
  for (const definition of PROOFS) generated.push(await renderProof(definition));
  generated.forEach((filePath) => console.log(path.relative(process.cwd(), filePath)));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
