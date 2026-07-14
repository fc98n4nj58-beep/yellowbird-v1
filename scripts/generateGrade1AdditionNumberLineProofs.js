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
  "grade-1-addition-number-line",
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

const cases = [
  {
    filename: "g1_addition_number_line_default_full_width.pdf",
    options: { worksheetSeed: "g1-addition-number-line-default" }
  },
  {
    filename: "g1_addition_number_line_completed_question_1_full_width.pdf",
    options: { worksheetSeed: "g1-addition-number-line-completed-q1", includeExample: true }
  }
];

function renderProof(caseDef) {
  return new Promise((resolve, reject) => {
    const runtime = buildCatalogWorksheetRuntime(
      "g1_addition_on_number_line_to_20",
      caseDef.options
    );
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

async function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.readdirSync(OUTPUT_DIR)
    .filter((entry) => entry.toLowerCase().endsWith(".pdf"))
    .forEach((entry) => fs.unlinkSync(path.join(OUTPUT_DIR, entry)));

  const proofs = [];
  for (const caseDef of cases) {
    const { filePath, runtime } = await renderProof(caseDef);
    proofs.push({
      filePath,
      questions: runtime.contentObject.content.items.length,
      completedQuestionOne: Boolean(runtime.contentObject.content.items[0]?.isExample),
      footer: runtime.contentObject.meta.curriculum.footerText
    });
  }

  if (proofs.length !== 2) throw new Error(`Expected 2 founder proofs; generated ${proofs.length}.`);
  console.log(JSON.stringify({ outputDir: OUTPUT_DIR, proofs }, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
