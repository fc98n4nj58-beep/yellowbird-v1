"use strict";

const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const ROOT = path.join(__dirname, "..", "review", "grade-5-place-value-representations-batch-4");
const IDS = Object.freeze({
  expanded: "grade5_place_value_representation_expanded_form",
  line: "grade5_place_value_representation_number_line_identify",
  words: "grade5_place_value_representation_number_word_match",
  standard: "grade5_place_value_representation_standard_form"
});
const ZERO_BOUNDARIES = [40005, 70040, 90900, 100000, 50505, 80808, 99000, 60006, 77770, 30003, 20202, 88008, 88080];
const NUMBER_WORD_ZERO_BOUNDARIES = [40005, 50505, 88008, 30003, 77770, 70040, 60006, 88080, 100000, 80808, 90900, 20202];
const LONG_WORD_VALUES = [61984, 67984, 68974, 71984, 76984, 78964, 81984, 86974, 87964, 91684, 96784, 98764];
const PROOFS = Object.freeze([
  { folder: "founder-review", id: IDS.expanded, filename: "01_expanded_form.pdf", options: {} },
  { folder: "founder-review", id: IDS.words, filename: "03_write_numbers_in_words.pdf", options: {} },
  { folder: "founder-review", id: IDS.standard, filename: "04_standard_form.pdf", options: {} },
  {
    folder: "stress", id: IDS.expanded, filename: "01_expanded_form_zeroes_boundary_and_example.pdf",
    options: { questionCount: 12, selectedNumbers: ZERO_BOUNDARIES, includeExample: true }
  },
  {
    folder: "stress", id: IDS.expanded, filename: "02_expanded_form_explicit_45.pdf",
    options: { questionCount: 45, questionsPerPage: 30 }
  },
  {
    folder: "stress", id: IDS.expanded, filename: "03_expanded_form_maximum_60.pdf",
    options: { questionCount: 60, questionsPerPage: 30 }
  },
  {
    folder: "stress", id: IDS.standard, filename: "04_standard_form_explicit_45.pdf",
    options: { questionCount: 45, questionsPerPage: 30 }
  },
  {
    folder: "stress", id: IDS.standard, filename: "05_standard_form_maximum_60.pdf",
    options: { questionCount: 60, questionsPerPage: 30 }
  },
  {
    folder: "stress", id: IDS.standard, filename: "06_standard_form_100000_boundary.pdf",
    options: { questionCount: 12, selectedNumbers: ZERO_BOUNDARIES }
  },
  {
    folder: "stress", id: IDS.words, filename: "07_number_words_forward_zeroes_and_boundary.pdf",
    options: { questionCount: 12, selectedNumbers: NUMBER_WORD_ZERO_BOUNDARIES }
  },
  {
    folder: "stress", id: IDS.words, filename: "08_number_words_forward_maximum_20.pdf",
    options: { questionCount: 20, questionsPerPage: 12 }
  },
  {
    folder: "stress", id: IDS.words, filename: "09_number_words_completed_example.pdf",
    options: { includeExample: true }
  },
  {
    folder: "stress", id: IDS.words, filename: "10_number_words_reverse_maximum_with_example.pdf",
    options: { questionCount: 20, questionsPerPage: 12, numberWordMode: "word_to_numeral", includeExample: true }
  },
  {
    folder: "stress", id: IDS.words, filename: "11_number_words_reverse_longest_word_forms.pdf",
    options: { questionCount: 12, selectedNumbers: LONG_WORD_VALUES, numberWordMode: "word_to_numeral" }
  }
]);

class FileResponse extends Writable {
  constructor(filePath) { super(); this.file = fs.createWriteStream(filePath); }
  setHeader() {}
  _write(chunk, encoding, callback) { this.file.write(chunk, encoding, callback); }
  _final(callback) { this.file.end(callback); }
}

function renderProof(spec, index) {
  const directory = path.join(ROOT, spec.folder);
  fs.mkdirSync(directory, { recursive: true });
  const output = path.join(directory, spec.filename);
  const runtime = buildCatalogWorksheetRuntime(spec.id, {
    worksheetSeed: `grade5-place-value-proof-${index + 1}`,
    ...spec.options
  });
  return new Promise((resolve, reject) => {
    const response = new FileResponse(output);
    response.once("finish", () => resolve(output));
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: { filename: spec.filename, disposition: "inline", includeAnswerKey: true }
    });
  });
}

async function run() {
  const requested = new Set(process.argv.slice(2));
  const selected = PROOFS
    .map((spec, index) => ({ spec, index }))
    .filter(({ spec }) => (
      requested.size === 0 ||
      requested.has(spec.filename) ||
      requested.has(`${spec.folder}/${spec.filename}`)
    ));
  if (requested.size > 0 && selected.length !== requested.size) {
    const known = PROOFS.map((spec) => `${spec.folder}/${spec.filename}`).join(", ");
    throw new Error(`Unknown or ambiguous proof selection. Known proofs: ${known}`);
  }
  const generated = [];
  for (const { spec, index } of selected) {
    generated.push(await renderProof(spec, index));
  }
  generated.forEach((file) => console.log(path.relative(process.cwd(), file)));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
