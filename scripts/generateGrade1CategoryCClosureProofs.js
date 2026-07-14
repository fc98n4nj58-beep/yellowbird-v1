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
  "grade-1-category-c-closure",
  "founder-review"
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
    filename: "g1_skip_counting_default.pdf",
    resourceId: "grade1_multiplication_facts_skip_counting",
    options: { worksheetSeed: "g1-category-c-skip-default" }
  },
  {
    filename: "g1_skip_counting_completed_question_1.pdf",
    resourceId: "grade1_multiplication_facts_skip_counting",
    options: { worksheetSeed: "g1-category-c-skip-completed-q1", includeExample: true }
  },
  {
    filename: "g1_expanded_form_default.pdf",
    resourceId: "grade1_place_value_representation_expanded_form",
    options: { worksheetSeed: "g1-category-c-expanded-default" }
  },
  {
    filename: "g1_expanded_form_completed_question_1.pdf",
    resourceId: "grade1_place_value_representation_expanded_form",
    options: { worksheetSeed: "g1-category-c-expanded-completed-q1-1", includeExample: true }
  }
];

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
      resourceId: caseDef.resourceId,
      questions: runtime.contentObject.content.items.length,
      completedQuestionOne: Boolean(runtime.contentObject.content.items[0]?.isExample),
      footer: runtime.contentObject.meta.curriculum.footerText
    });
  }

  if (proofs.length < 4 || proofs.length > 6) {
    throw new Error(`Founder packet must contain 4–6 PDFs; generated ${proofs.length}.`);
  }
  console.log(JSON.stringify({ outputDir: OUTPUT_DIR, proofs }, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
