const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const {
  buildCatalogWorksheetRuntime
} = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const OUTPUT_DIR = path.join(
  __dirname,
  "..",
  "review",
  "grade-1-arrays-equal-groups",
  "founder-recheck"
);

class FileResponse extends Writable {
  constructor(filePath) {
    super();
    this.headers = {};
    this.file = fs.createWriteStream(filePath);
  }

  setHeader(name, value) {
    this.headers[name] = value;
  }

  _write(chunk, encoding, callback) {
    this.file.write(chunk, encoding, callback);
  }

  _final(callback) {
    this.file.end(callback);
  }
}

function renderProof(caseDef) {
  return new Promise((resolve, reject) => {
    const runtime = buildCatalogWorksheetRuntime(caseDef.resourceId, caseDef.options);
    const filePath = path.join(OUTPUT_DIR, caseDef.filename);
    const res = new FileResponse(filePath);
    res.on("finish", () => resolve({ filePath, runtime }));
    res.on("error", reject);
    renderWorksheetPDF({
      res,
      contentObject: runtime.contentObject,
      layoutObject: runtime.layout,
      options: {
        filename: caseDef.filename,
        disposition: "inline",
        includeAnswerKey: true
      }
    });
  });
}

const cases = [
  {
    filename: "g1_arrays_completed_question_1_multiplication_symbol.pdf",
    resourceId: "grade1_multiplication_facts_arrays",
    options: { worksheetSeed: "g1-arrays-symbol-recheck", includeExample: true }
  },
  {
    filename: "g1_equal_groups_completed_question_1_multiplication_symbol.pdf",
    resourceId: "grade1_multiplication_facts_equal_groups",
    options: { worksheetSeed: "g1-equal-groups-symbol-recheck", includeExample: true }
  }
];

async function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.readdirSync(OUTPUT_DIR)
    .filter((entry) => entry.toLowerCase().endsWith(".pdf"))
    .forEach((entry) => fs.unlinkSync(path.join(OUTPUT_DIR, entry)));

  const results = [];
  for (const caseDef of cases) {
    const result = await renderProof(caseDef);
    const items = result.runtime.contentObject.content.items;
    results.push({
      filename: caseDef.filename,
      questions: items.length,
      completedQuestionOne: Boolean(items[0]?.isExample),
      footer: result.runtime.contentObject.meta.curriculum.footerText
    });
  }

  if (results.length !== 2) {
    throw new Error(`Expected exactly 2 founder recheck proofs; generated ${results.length}.`);
  }

  console.log(JSON.stringify({ outputDir: OUTPUT_DIR, proofs: results }, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
