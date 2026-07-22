"use strict";

const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const ROOT_DIR = path.join(__dirname, "..", "review", "grade-4-structured-fractions-batch-2");
const PROOFS = Object.freeze([
  {
    folder: "founder-review",
    id: "grade4_fraction_equivalence_compare_fractions",
    seed: "grade4-batch2-founder-compare",
    filename: "01_compare_fractions.pdf",
    options: {}
  },
  {
    folder: "founder-review",
    id: "grade4_fraction_equivalence_fraction_number_line",
    seed: "grade4-batch2-founder-number-line",
    filename: "02_fractions_on_a_number_line.pdf",
    options: {}
  },
  {
    folder: "founder-review",
    id: "grade4_fraction_equivalence_shade_fraction_models",
    seed: "grade4-batch2-founder-shade",
    filename: "03_shade_the_fraction.pdf",
    options: {}
  },
  {
    folder: "stress",
    id: "grade4_fraction_equivalence_compare_fractions",
    seed: "grade4-batch2-stress-compare-density",
    filename: "01_compare_denominator_12_equal_density.pdf",
    options: { selectedDenominators: [6, 10, 12], equalPairs: 4 }
  },
  {
    folder: "stress",
    id: "grade4_fraction_equivalence_compare_fractions",
    seed: "grade4-batch2-stress-compare-multipage",
    filename: "02_compare_maximum_safe_count.pdf",
    options: { questionCount: 24, questionsPerPage: 12, equalPairs: 8 }
  },
  {
    folder: "stress",
    id: "grade4_fraction_equivalence_fraction_number_line",
    seed: "grade4-batch2-stress-line-tenths",
    filename: "03_number_line_denominator_10.pdf",
    options: { selectedDenominators: [10] }
  },
  {
    folder: "stress",
    id: "grade4_fraction_equivalence_fraction_number_line",
    seed: "grade4-batch2-stress-line-endpoints-example",
    filename: "04_number_line_endpoints_and_example.pdf",
    options: {
      selectedDenominators: [10],
      selectedFractions: ["0/10", "1/10", "2/10", "5/10", "7/10", "9/10", "10/10"],
      endpointPolicy: "allowed",
      includeExample: true
    }
  },
  {
    folder: "stress",
    id: "grade4_fraction_equivalence_shade_fraction_models",
    seed: "grade4-batch2-stress-shade-twelfths",
    filename: "05_shade_denominator_12.pdf",
    options: { selectedDenominators: [12] }
  },
  {
    folder: "stress",
    id: "grade4_fraction_equivalence_shade_fraction_models",
    seed: "grade4-batch2-stress-shade-example",
    filename: "06_shade_completed_example.pdf",
    options: { selectedDenominators: [10, 12], includeExample: true }
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
  const outputDirectory = path.join(ROOT_DIR, spec.folder);
  fs.mkdirSync(outputDirectory, { recursive: true });
  const runtime = buildCatalogWorksheetRuntime(spec.id, {
    worksheetSeed: spec.seed,
    ...spec.options
  });
  const filePath = path.join(outputDirectory, spec.filename);
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
  return filePath;
}

async function run() {
  const generated = [];
  for (const spec of PROOFS) generated.push(await renderProof(spec));
  for (const folder of ["founder-review", "stress"]) {
    const expected = PROOFS.filter((spec) => spec.folder === folder).map((spec) => spec.filename).sort();
    const actual = fs.readdirSync(path.join(ROOT_DIR, folder)).filter((name) => name.endsWith(".pdf")).sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${folder}: ${expected.join(", ")}; found ${actual.join(", ")}.`);
    }
  }
  generated.forEach((filePath) => console.log(path.relative(process.cwd(), filePath)));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
