"use strict";

const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const ROOT = path.join(__dirname, "..", "review", "grade-4-place-value-batch-4");
const IDS = Object.freeze({
  line: "grade4_place_value_representation_number_line_identify",
  words: "grade4_place_value_representation_number_word_match",
  compare: "grade4_place_value_representation_compare_numbers"
});
const PROOFS = Object.freeze([
  { folder: "founder-review", id: IDS.line, filename: "01_identify_numbers_on_a_number_line.pdf", seed: "g4-b4-founder-line", options: {} },
  { folder: "founder-review", id: IDS.words, filename: "02_write_numbers_in_words.pdf", seed: "g4-b4-founder-words", options: {} },
  { folder: "founder-review", id: IDS.compare, filename: "03_compare_numbers.pdf", seed: "g4-b4-founder-compare", options: {} },
  {
    folder: "stress", id: IDS.line, filename: "01_number_line_largest_values_interval_500.pdf", seed: "g4-b4-stress-line-large",
    options: { minValue: 5000, maxValue: 10000, allowedIntervals: [500] }
  },
  {
    folder: "stress", id: IDS.line, filename: "02_number_line_smallest_interval_10.pdf", seed: "g4-b4-stress-line-small",
    options: { minValue: 9000, maxValue: 10000, allowedIntervals: [10], endpointPolicy: "interior_only" }
  },
  {
    folder: "stress", id: IDS.line, filename: "03_number_line_endpoints_completed_example.pdf", seed: "g4-b4-stress-line-example",
    options: { minValue: 1000, maxValue: 3000, allowedIntervals: [50], selectedValues: [1000, 1250, 1500, 1750, 2000, 2250, 2500], includeExample: true }
  },
  {
    folder: "stress", id: IDS.words, filename: "04_number_words_zero_placeholders_and_10000.pdf", seed: "g4-b4-stress-words-zero",
    options: { questionCount: 12, questionsPerPage: 12, minValue: 1000, maxValue: 10000, selectedNumbers: [1000, 1005, 1040, 4008, 7788, 8867, 9678, 9786, 9876, 9998, 9999, 10000] }
  },
  {
    folder: "stress", id: IDS.words, filename: "05_number_words_long_responses.pdf", seed: "g4-b4-stress-words-long",
    options: { questionCount: 12, questionsPerPage: 12, selectedNumbers: [6789, 6879, 7689, 7788, 7869, 8679, 8768, 8867, 9678, 9768, 9876, 9999] }
  },
  {
    folder: "stress", id: IDS.words, filename: "06_number_words_reverse_direction.pdf", seed: "g4-b4-stress-words-reverse",
    options: { questionCount: 12, questionsPerPage: 12, numberWordDirection: "word_to_numeral", includeExample: true }
  },
  {
    folder: "stress", id: IDS.compare, filename: "07_compare_equality_and_zero_placeholders.pdf", seed: "g4-b4-stress-compare-equality",
    options: { selectedNumbers: [1000, 1005, 1050, 1500, 2002, 4008, 5000, 5050, 7007, 9009, 9999, 10000] }
  },
  {
    folder: "stress", id: IDS.compare, filename: "08_compare_maximum_safe_count.pdf", seed: "g4-b4-stress-compare-max",
    options: { questionCount: 30, questionsPerPage: 30 }
  },
  {
    folder: "stress", id: IDS.compare, filename: "09_compare_completed_example.pdf", seed: "g4-b4-stress-compare-example",
    options: { includeExample: true }
  }
]);

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
  const directory = path.join(ROOT, spec.folder);
  fs.mkdirSync(directory, { recursive: true });
  const runtime = buildCatalogWorksheetRuntime(spec.id, { worksheetSeed: spec.seed, ...spec.options });
  const output = path.join(directory, spec.filename);
  await new Promise((resolve, reject) => {
    const response = new FileResponse(output);
    response.once("finish", resolve);
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: { filename: spec.filename, disposition: "inline", includeAnswerKey: true }
    });
  });
  return output;
}

async function run() {
  const generated = [];
  for (const proof of PROOFS) generated.push(await renderProof(proof));
  for (const folder of ["founder-review", "stress"]) {
    const expected = PROOFS.filter((proof) => proof.folder === folder).map((proof) => proof.filename).sort();
    const actual = fs.readdirSync(path.join(ROOT, folder)).filter((name) => name.endsWith(".pdf")).sort();
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
