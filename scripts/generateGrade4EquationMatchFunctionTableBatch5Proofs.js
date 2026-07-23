"use strict";

const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const ROOT = path.join(__dirname, "..", "review", "grade-4-equation-function-batch-5");
const EQUATION_ID = "grade4_addition_subtraction_facts_equation_match";
const PROOFS = Object.freeze([
  {
    folder: "founder-review",
    filename: "01_compare_equations.pdf",
    seed: "g4-b5-founder-compare-equations",
    options: {}
  },
  {
    folder: "stress",
    filename: "01_largest_safe_values_and_longest_expressions.pdf",
    seed: "g4-b5-stress-largest",
    options: { minimumResult: 1800, maximumResult: 2000 }
  },
  {
    folder: "stress",
    filename: "02_mixed_operations_and_equality_balance.pdf",
    seed: "g4-b5-stress-mixed",
    options: { questionCount: 30, equalPairs: 15, operationMode: "mixed" }
  },
  {
    folder: "stress",
    filename: "03_addition_and_subtraction_modes.pdf",
    seed: "g4-b5-stress-operation-modes",
    options: { questionCount: 30, selectedOperations: ["subtraction"], equalPairs: 15 }
  },
  {
    folder: "stress",
    filename: "04_completed_example.pdf",
    seed: "g4-b5-stress-example",
    options: { includeExample: true }
  },
  {
    folder: "stress",
    filename: "05_maximum_safe_count.pdf",
    seed: "g4-b5-stress-maximum",
    options: { questionCount: 60, questionsPerPage: 30, equalPairs: 30 }
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

async function renderProof(spec) {
  const directory = path.join(ROOT, spec.folder);
  fs.mkdirSync(directory, { recursive: true });
  const runtime = buildCatalogWorksheetRuntime(EQUATION_ID, {
    worksheetSeed: spec.seed,
    ...spec.options
  });
  const output = path.join(directory, spec.filename);
  await new Promise((resolve, reject) => {
    const response = new FileResponse(output);
    response.once("finish", resolve);
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: {
        filename: spec.filename,
        disposition: "inline",
        includeAnswerKey: true
      }
    });
  });
  return output;
}

async function run() {
  const generated = [];
  for (const proof of PROOFS) generated.push(await renderProof(proof));
  for (const folder of ["founder-review", "stress"]) {
    const expected = PROOFS
      .filter((proof) => proof.folder === folder)
      .map((proof) => proof.filename)
      .sort();
    const actual = fs.readdirSync(path.join(ROOT, folder))
      .filter((name) => name.endsWith(".pdf"))
      .sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${folder}: ${expected.join(", ")}; found ${actual.join(", ")}.`);
    }
  }
  generated.forEach((file) => console.log(path.relative(process.cwd(), file)));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
