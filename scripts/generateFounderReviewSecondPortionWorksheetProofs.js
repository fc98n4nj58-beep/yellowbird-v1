"use strict";

const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { DEFAULT_OUTPUT } = require("../config/founderReviewCurrentOutput");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const OUTPUT_DIR = path.join(
  __dirname,
  "..",
  "review",
  "founder-review-second-portion-worksheet-corrections",
  "founder-review-2026-08-11"
);

class FileResponse extends Writable {
  constructor(filePath) {
    super();
    this.file = fs.createWriteStream(filePath);
  }
  setHeader() {}
  _write(chunk, encoding, callback) { this.file.write(chunk, encoding, callback); }
  _final(callback) { this.file.end(callback); }
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function renderProof(resourceId, index) {
  return new Promise((resolve, reject) => {
    const filename = `${String(index + 1).padStart(2, "0")}_${resourceId}.pdf`;
    const outputPath = path.join(OUTPUT_DIR, filename);
    const runtime = buildCatalogWorksheetRuntime(resourceId, {
      worksheetSeed: `founder-review-second-portion:${resourceId}:v1`
    });
    const response = new FileResponse(outputPath);
    response.once("finish", () => {
      const buffer = fs.readFileSync(outputPath);
      resolve({
        resourceId,
        title: runtime.layout.header?.title || runtime.item.title,
        instruction: runtime.layout.instruction || runtime.item.studentInstruction || "",
        questionCount: runtime.normalizedContentObject.content.items.length,
        columns: runtime.layout.template?.columns,
        maxProblemsPerPage: runtime.layout.template?.maxProblemsPerPage,
        outputPath,
        bytes: buffer.length,
        pages: pageCount(buffer)
      });
    });
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: { filename, disposition: "inline", includeAnswerKey: true }
    });
  });
}

async function run() {
  if (fs.existsSync(OUTPUT_DIR)) {
    throw new Error(`Proof folder already exists; use a new checkpoint instead of overwriting ${OUTPUT_DIR}.`);
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const resourceIds = Object.keys(DEFAULT_OUTPUT);
  const proofs = [];
  for (let index = 0; index < resourceIds.length; index += 1) {
    proofs.push(await renderProof(resourceIds[index], index));
  }
  const manifest = {
    generatedAt: new Date().toISOString(),
    proofCount: proofs.length,
    proofs
  };
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "proof-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8"
  );
  console.log(JSON.stringify({ outputDirectory: OUTPUT_DIR, ...manifest }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
