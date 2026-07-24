"use strict";

const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const ROOT_DIR = path.join(__dirname, "..", "review", "grade-5-structured-fractions-batch-5");
const PROOFS = Object.freeze([
  {
    folder: "founder-review",
    id: "grade5_fraction_equivalence_fraction_number_line",
    seed: "grade5-batch5-founder-number-line",
    filename: "01_fractions_on_a_number_line.pdf",
    options: {}
  },
  {
    folder: "founder-review",
    id: "grade5_fraction_equivalence_match_equivalent_fractions",
    seed: "grade5-batch5-founder-equivalent-completion",
    filename: "02_complete_equivalent_fractions.pdf",
    options: {}
  },
  {
    folder: "founder-review",
    id: "grade5_fraction_equivalence_shade_fraction_models",
    seed: "grade5-batch5-founder-shade",
    filename: "03_shade_the_fraction.pdf",
    options: {}
  },
  {
    folder: "stress",
    id: "grade5_fraction_equivalence_fraction_number_line",
    seed: "grade5-batch5-stress-line-boundaries",
    filename: "01_number_line_smallest_and_largest_denominators.pdf",
    options: {
      selectedDenominators: [2, 11, 12],
      selectedFractions: ["1/2", "4/11", "7/11", "1/12", "5/12", "11/12"]
    }
  },
  {
    folder: "stress",
    id: "grade5_fraction_equivalence_fraction_number_line",
    seed: "grade5-batch5-stress-line-maximum",
    filename: "02_number_line_maximum_safe_count.pdf",
    options: { questionCount: 12, questionsPerPage: 6 }
  },
  {
    folder: "stress",
    id: "grade5_fraction_equivalence_match_equivalent_fractions",
    seed: "grade5-batch5-stress-equivalent-extremes",
    filename: "03_equivalent_fraction_extremes.pdf",
    options: {
      selectedDenominators: [9, 11, 12],
      selectedFractions: ["4/9", "5/9", "7/9", "5/11", "7/11", "10/11", "5/12", "7/12", "11/12"],
      selectedMultipliers: [4, 5]
    }
  },
  {
    folder: "stress",
    id: "grade5_fraction_equivalence_match_equivalent_fractions",
    seed: "grade5-batch5-stress-equivalent-example",
    filename: "04_equivalent_fraction_completed_example.pdf",
    options: { completedExample: true }
  },
  {
    folder: "stress",
    id: "grade5_fraction_equivalence_match_equivalent_fractions",
    seed: "grade5-batch5-stress-equivalent-maximum",
    filename: "05_equivalent_fraction_maximum_safe_count.pdf",
    options: {
      questionCount: 36,
      questionsPerPage: 36,
      selectedDenominators: [2, 9, 11, 12],
      selectedMultipliers: [2, 3, 4, 5],
      missingPosition: "mixed"
    }
  },
  {
    folder: "stress",
    id: "grade5_fraction_equivalence_shade_fraction_models",
    seed: "grade5-batch5-stress-shade-boundaries",
    filename: "06_shade_model_boundaries.pdf",
    options: {
      selectedDenominators: [2, 9, 11, 12],
      selectedFractions: ["1/2", "1/9", "8/9", "1/11", "10/11", "1/12", "6/12", "11/12"]
    }
  },
  {
    folder: "stress",
    id: "grade5_fraction_equivalence_shade_fraction_models",
    seed: "grade5-batch5-stress-shade-example",
    filename: "07_shade_completed_example.pdf",
    options: { selectedDenominators: [9, 11, 12], completedExample: true }
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
      options: {
        filename: spec.filename,
        disposition: "inline",
        includeAnswerKey: true
      }
    });
  });
  return filePath;
}

async function run() {
  const selectedProofs = process.argv.includes("--equivalent-only")
    ? PROOFS.filter((spec) => spec.id === "grade5_fraction_equivalence_match_equivalent_fractions")
    : PROOFS;
  const generated = [];
  for (const spec of selectedProofs) generated.push(await renderProof(spec));
  for (const folder of ["founder-review", "stress"]) {
    const expected = PROOFS
      .filter((spec) => spec.folder === folder)
      .map((spec) => spec.filename)
      .sort();
    const actual = fs.readdirSync(path.join(ROOT_DIR, folder))
      .filter((name) => name.endsWith(".pdf"))
      .sort();
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
