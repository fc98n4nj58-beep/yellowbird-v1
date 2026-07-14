const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const {
  buildCatalogWorksheetRuntime
} = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const RESOURCE_ID = "grade1_addition_subtraction_facts_equation_match";
const OUTPUT_DIR = path.join(
  __dirname,
  "..",
  "review",
  "grade-1-category-f-batch-1",
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
    filename: "grade1_equal_or_not_equal_default.pdf",
    options: { worksheetSeed: "grade1-equation-match-founder-default" }
  },
  {
    filename: "grade1_equal_or_not_equal_completed_questions_1_and_2.pdf",
    options: {
      worksheetSeed: "grade1-equation-match-founder-completed-q1-q2",
      includeExample: true
    }
  }
];

function renderProof(caseDefinition) {
  return new Promise((resolve, reject) => {
    const runtime = buildCatalogWorksheetRuntime(RESOURCE_ID, caseDefinition.options);
    const filePath = path.join(OUTPUT_DIR, caseDefinition.filename);
    const response = new FileResponse(filePath);
    response.on("finish", () => resolve({ filePath, runtime }));
    response.on("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.contentObject,
      layoutObject: runtime.layout,
      options: {
        filename: caseDefinition.filename,
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
  for (const caseDefinition of cases) {
    const { filePath, runtime } = await renderProof(caseDefinition);
    proofs.push({
      filePath,
      questions: runtime.contentObject.content.items.length,
      completedQuestionOne: Boolean(runtime.contentObject.content.items[0]?.isExample),
      completedQuestionTwo: Boolean(runtime.contentObject.content.items[1]?.isExample),
      questionOneAnswer: runtime.contentObject.content.items[0]?.answer,
      questionTwoAnswer: runtime.contentObject.content.items[1]?.answer,
      footer: runtime.contentObject.meta.curriculum.footerText
    });
  }

  if (proofs.length !== 2) throw new Error(`Expected 2 founder proofs; generated ${proofs.length}.`);
  console.log(JSON.stringify({ outputDir: OUTPUT_DIR, proofs }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
