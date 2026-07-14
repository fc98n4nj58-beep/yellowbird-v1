const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const OUTPUT_DIR = path.join(__dirname, "..", "review", "grade-1-fraction-family", "founder-review");
const PROOFS = Object.freeze([
  {
    id: "grade1_fraction_equivalence_shade_fraction_models",
    filename: "grade1_shade_equal_parts_founder_default.pdf",
    worksheetSeed: "grade1-fraction-shade-founder"
  },
  {
    id: "grade1_fraction_equivalence_match_equivalent_fractions",
    filename: "grade1_one_half_two_fourths_founder_default.pdf",
    worksheetSeed: "grade1-fraction-match-founder"
  },
  {
    id: "grade1_fraction_equivalence_compare_fractions",
    filename: "grade1_compare_fair_shares_founder_default.pdf",
    worksheetSeed: "grade1-fraction-compare-founder"
  },
  {
    id: "grade1_fraction_equivalence_compare_fractions",
    filename: "grade1_compare_fair_shares_founder_completed_q1.pdf",
    worksheetSeed: "grade1-fraction-compare-completed-founder",
    includeExample: true
  },
  {
    id: "grade1_fraction_equivalence_fraction_word_problems",
    filename: "grade1_share_fairly_founder_default.pdf",
    worksheetSeed: "grade1-fraction-share-founder"
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

function renderProof(definition) {
  return new Promise((resolve, reject) => {
    const runtime = buildCatalogWorksheetRuntime(definition.id, definition);
    const filePath = path.join(OUTPUT_DIR, definition.filename);
    const response = new FileResponse(filePath);
    response.on("finish", () => resolve({ filePath, runtime }));
    response.on("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.contentObject,
      layoutObject: runtime.layout,
      options: { filename: definition.filename, disposition: "inline", includeAnswerKey: true }
    });
  });
}

async function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.readdirSync(OUTPUT_DIR)
    .filter((name) => name.endsWith(".pdf"))
    .forEach((name) => fs.unlinkSync(path.join(OUTPUT_DIR, name)));

  const results = [];
  for (const definition of PROOFS) results.push(await renderProof(definition));
  const files = fs.readdirSync(OUTPUT_DIR).filter((name) => name.endsWith(".pdf")).sort();
  if (files.length !== 5) throw new Error(`Expected exactly five founder PDFs; found ${files.length}.`);

  console.log(JSON.stringify({
    outputDir: OUTPUT_DIR,
    proofCount: files.length,
    proofs: results.map(({ filePath, runtime }) => ({
      filePath,
      title: runtime.layout.header.title,
      taskMode: runtime.layout.display.grade1FractionTaskMode,
      studentItems: runtime.contentObject.content.items.length,
      completedQuestionOne: Boolean(runtime.contentObject.content.items[0]?.isExample),
      pageContract: "one student page plus one answer-key page"
    }))
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
