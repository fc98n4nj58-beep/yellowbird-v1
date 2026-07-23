"use strict";

const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const ROOT = path.join(__dirname, "..", "review", "grade-5-numeric-patterning-batch-1");
const PROOFS = Object.freeze([
  Object.freeze({
    folder: "founder-review",
    filename: "01_extend_the_pattern.pdf",
    resourceId: "grade5_patterning_and_algebra_extend_pattern",
    options: { worksheetSeed: "grade5-batch1-extend-default" }
  }),
  Object.freeze({
    folder: "founder-review",
    filename: "02_identify_the_pattern_rule.pdf",
    resourceId: "grade5_patterning_and_algebra_identify_pattern_rule",
    options: { worksheetSeed: "grade5-batch1-identify-default" }
  }),
  Object.freeze({
    folder: "founder-review",
    filename: "03_find_the_missing_values.pdf",
    resourceId: "grade5_patterning_and_algebra_missing_value_pattern",
    options: { worksheetSeed: "grade5-batch1-missing-default" }
  }),
  Object.freeze({
    folder: "stress",
    filename: "01_extend_largest_default_starts_and_addition.pdf",
    resourceId: "grade5_patterning_and_algebra_extend_pattern",
    options: {
      worksheetSeed: "grade5-batch1-extend-large-add",
      selectedOperations: ["add"],
      selectedRuleAmounts: [50],
      minStart: 650,
      maxStart: 700
    }
  }),
  Object.freeze({
    folder: "stress",
    filename: "02_extend_maximum_continuation_and_zero.pdf",
    resourceId: "grade5_patterning_and_algebra_extend_pattern",
    options: {
      worksheetSeed: "grade5-batch1-extend-zero",
      questionCount: 1,
      questionsPerPage: 1,
      operationMode: "subtract",
      startingValue: 300,
      sequenceStep: 50,
      visibleLength: 4,
      continuationCount: 3
    }
  }),
  Object.freeze({
    folder: "stress",
    filename: "03_identify_maximum_count_and_longest_rule.pdf",
    resourceId: "grade5_patterning_and_algebra_identify_pattern_rule",
    options: {
      worksheetSeed: "grade5-batch1-identify-maximum",
      questionCount: 18,
      questionsPerPage: 10,
      selectedOperations: ["add", "subtract"],
      selectedRuleAmounts: [75, 100],
      minStart: 600,
      maxStart: 1000,
      sequenceLength: 7,
      includeExample: true
    }
  }),
  Object.freeze({
    folder: "stress",
    filename: "04_missing_maximum_count_and_varied_positions.pdf",
    resourceId: "grade5_patterning_and_algebra_missing_value_pattern",
    options: {
      worksheetSeed: "grade5-batch1-missing-maximum",
      questionCount: 20,
      questionsPerPage: 12,
      selectedOperations: ["add", "subtract"],
      selectedRuleAmounts: [25, 50],
      minStart: 400,
      maxStart: 700,
      sequenceLength: 7,
      missingCount: 2,
      missingPlacement: "random",
      includeExample: true
    }
  }),
  Object.freeze({
    folder: "stress",
    filename: "05_missing_subtraction_and_zero_target.pdf",
    resourceId: "grade5_patterning_and_algebra_missing_value_pattern",
    options: {
      worksheetSeed: "grade5-batch1-missing-zero",
      questionCount: 1,
      questionsPerPage: 1,
      operationMode: "subtract",
      startingValue: 300,
      sequenceStep: 50,
      sequenceLength: 7,
      missingIndexes: [1, 6],
      missingCount: 2
    }
  }),
  Object.freeze({
    folder: "stress",
    filename: "06_extend_completed_example.pdf",
    resourceId: "grade5_patterning_and_algebra_extend_pattern",
    options: {
      worksheetSeed: "grade5-batch1-extend-example",
      selectedOperations: ["add", "subtract"],
      selectedRuleAmounts: [25, 50],
      minStart: 300,
      maxStart: 700,
      visibleLength: 4,
      continuationCount: 3,
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
      options: {
        filename: definition.filename,
        disposition: "inline",
        includeAnswerKey: true
      }
    });
  });
}

async function run() {
  const generated = [];
  for (const definition of PROOFS) {
    generated.push(await renderProof(definition));
  }
  generated.forEach((filePath) => console.log(path.relative(process.cwd(), filePath)));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
