"use strict";

const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const ROOT = path.join(__dirname, "..", "review", "grade-5-addition-subtraction-stories-batch-6");
const IDS = Object.freeze({
  addition: "grade5_addition_subtraction_word_problems_addition_word_problem",
  missing: "grade5_addition_subtraction_word_problems_missing_addend_word_problem",
  subtraction: "grade5_addition_subtraction_word_problems_subtraction_word_problem"
});
const PROOFS = Object.freeze([
  {
    folder: "founder-review",
    filename: "01_addition_story_problems.pdf",
    id: IDS.addition,
    options: { worksheetSeed: "g5-b6-founder-addition" }
  },
  {
    folder: "founder-review",
    filename: "02_missing_addend_story_problems.pdf",
    id: IDS.missing,
    options: { worksheetSeed: "g5-b6-founder-missing" }
  },
  {
    folder: "founder-review",
    filename: "03_subtraction_story_problems.pdf",
    id: IDS.subtraction,
    options: { worksheetSeed: "g5-b6-founder-subtraction" }
  },
  {
    folder: "stress",
    filename: "01_shared_maximum_count.pdf",
    id: IDS.addition,
    options: {
      worksheetSeed: "g5-b6-stress-maximum",
      questionCount: 16,
      questionsPerPage: 3
    }
  },
  {
    folder: "stress",
    filename: "02_mixed_story_types_and_boundaries.pdf",
    id: IDS.subtraction,
    options: {
      worksheetSeed: "g5-b6-stress-boundaries",
      minA: 90000,
      maxA: 100000,
      minB: 1000,
      maxB: 90000,
      selectedStoryTypes: ["take_away", "compare"]
    }
  },
  {
    folder: "stress",
    filename: "03_completed_example_and_missing_positions.pdf",
    id: IDS.missing,
    options: {
      worksheetSeed: "g5-b6-stress-example",
      includeExample: true,
      missingPosition: "mixed"
    }
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
  const runtime = buildCatalogWorksheetRuntime(spec.id, spec.options);
  const outputDir = path.join(ROOT, spec.folder);
  fs.mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, spec.filename);
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
  return {
    filePath,
    questions: runtime.layout.problems.filter((problem) => !problem.isExample).length,
    examples: runtime.layout.problems.filter((problem) => problem.isExample).length
  };
}

async function run() {
  const results = [];
  for (const spec of PROOFS) results.push(await renderProof(spec));
  for (const folder of ["founder-review", "stress"]) {
    const actual = fs.readdirSync(path.join(ROOT, folder))
      .filter((name) => name.endsWith(".pdf"))
      .sort();
    const expected = PROOFS
      .filter((spec) => spec.folder === folder)
      .map((spec) => spec.filename)
      .sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`${folder} must contain exactly: ${expected.join(", ")}. Found: ${actual.join(", ")}.`);
    }
  }
  console.log(JSON.stringify(results, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
