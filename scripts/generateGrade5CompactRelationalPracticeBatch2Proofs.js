"use strict";

const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const ROOT = path.join(__dirname, "..", "review", "grade-5-compact-relational-batch-2");
const IDS = Object.freeze({
  equations: "grade5_addition_subtraction_facts_equation_match",
  numbers: "grade5_place_value_representation_compare_numbers"
});
const PROOFS = Object.freeze([
  { folder: "founder-review", id: IDS.equations, filename: "01_compare_equations.pdf", seed: "g5-b2-founder-equations", options: {} },
  {
    folder: "stress", id: IDS.equations, filename: "01_equations_largest_values_and_longest_expressions.pdf", seed: "g5-b2-stress-equation-largest",
    options: { minimumResult: 9000, maximumResult: 10000 }
  },
  {
    folder: "stress", id: IDS.equations, filename: "02_equations_addition_only.pdf", seed: "g5-b2-stress-equation-addition",
    options: { operationMode: "addition", equalPairs: 15 }
  },
  {
    folder: "stress", id: IDS.equations, filename: "03_equations_subtraction_only_without_equals.pdf", seed: "g5-b2-stress-equation-subtraction",
    options: { selectedOperations: ["subtraction"], includeEqualPairs: false }
  },
  {
    folder: "stress", id: IDS.equations, filename: "04_equations_completed_example.pdf", seed: "g5-b2-stress-equation-example",
    options: { includeExample: true }
  },
  {
    folder: "stress", id: IDS.equations, filename: "05_equations_maximum_safe_count.pdf", seed: "g5-b2-stress-equation-maximum",
    options: { questionCount: 60, questionsPerPage: 30, equalPairs: 30 }
  },
  {
    folder: "density-review", id: IDS.equations, filename: "01_compare_equations_default_30.pdf", seed: "g5-b2-density-default",
    options: {}
  },
  {
    folder: "density-review", id: IDS.equations, filename: "02_compare_equations_longest_expressions_30.pdf", seed: "g5-b2-density-longest",
    options: { minimumResult: 9000, maximumResult: 10000 }
  },
  {
    folder: "density-review", id: IDS.equations, filename: "03_compare_equations_completed_example_30.pdf", seed: "g5-b2-density-example",
    options: { includeExample: true }
  },
  {
    folder: "density-review", id: IDS.equations, filename: "04_compare_equations_subtraction_only_30.pdf", seed: "g5-b2-density-subtraction",
    options: { operationMode: "subtraction", includeEqualPairs: false }
  },
  {
    folder: "density-review", id: IDS.equations, filename: "05_compare_equations_maximum_candidate.pdf", seed: "g5-b2-density-maximum",
    options: { questionCount: 60, questionsPerPage: 30, equalPairs: 30 }
  }
]);
const PRESERVED_NUMBER_PROOFS = Object.freeze([
  "founder-review/02_compare_numbers.pdf",
  "stress/06_numbers_largest_values_and_commas.pdf",
  "stress/07_numbers_smallest_values_without_equals.pdf",
  "stress/08_numbers_completed_example.pdf",
  "stress/09_numbers_maximum_safe_count.pdf"
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
  const runtime = buildCatalogWorksheetRuntime(spec.id, {
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
  for (const folder of ["founder-review", "stress", "density-review"]) {
    const expected = PROOFS
      .filter((proof) => proof.folder === folder)
      .map((proof) => proof.filename)
      .sort();
    const actual = fs.readdirSync(path.join(ROOT, folder))
      .filter((name) => name.endsWith(".pdf"))
      .sort();
    if (expected.some((filename) => !actual.includes(filename))) {
      throw new Error(`Missing ${folder} proof. Expected: ${expected.join(", ")}; found: ${actual.join(", ")}.`);
    }
  }
  PRESERVED_NUMBER_PROOFS.forEach((relativePath) => {
    if (!fs.existsSync(path.join(ROOT, relativePath))) {
      throw new Error(`Approved Compare Numbers proof is missing: ${relativePath}.`);
    }
  });
  generated.forEach((file) => console.log(path.relative(process.cwd(), file)));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
