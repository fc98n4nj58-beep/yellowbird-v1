"use strict";

const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");
const { renderQuickCheckPDF } = require("../renderers/quickCheckPdfRenderer");

const OUTPUT_DIR = path.join(
  __dirname,
  "..",
  "review",
  "founder-review-remaining-corrections",
  "founder-review-2026-08-11"
);

const PROOFS = Object.freeze([
  ["g2_addition_within_20_quick_check", "quick_check"],
  ["g2_subtraction_within_20_quick_check", "quick_check"],
  ["g2_missing_addends_within_20_quick_check", "quick_check"],
  ["grade1_multiplication_facts_arrays", "worksheet"],
  ["grade2_multiplication_facts_arrays", "worksheet"],
  ["g3_multiplication_arrays", "worksheet"],
  ["g4_array_interpretation", "worksheet"],
  ["grade1_data_display_graphing_read_graph", "worksheet"],
  ["grade2_data_display_graphing_read_graph", "worksheet"],
  ["g3_read_a_graph", "worksheet"],
  ["grade1_data_display_graphing_interpret_data", "worksheet"],
  ["grade1_data_display_graphing_graph_questions", "worksheet"],
  ["grade2_data_display_graphing_interpret_data", "worksheet"],
  ["g3_graph_questions", "worksheet"],
  ["g3_interpret_data", "worksheet"],
  ["grade1_data_display_graphing_complete_graph", "worksheet"],
  ["grade2_data_display_graphing_complete_graph", "worksheet"],
  ["g3_complete_a_graph", "worksheet"],
  ["grade1_data_display_graphing_match_data_to_graph", "worksheet"],
  ["grade2_data_display_graphing_match_data_to_graph", "worksheet"],
  ["g3_match_data_to_graph", "worksheet"],
  ["grade1_data_display_graphing_graph_word_problems", "worksheet"]
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

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function renderProof(resourceId, kind, index) {
  return new Promise((resolve, reject) => {
    const filename = `${String(index + 1).padStart(2, "0")}_${resourceId}.pdf`;
    const outputPath = path.join(OUTPUT_DIR, filename);
    const runtime = buildCatalogWorksheetRuntime(resourceId, {
      worksheetSeed: `founder-review-remaining:${resourceId}:v1`
    });
    const response = new FileResponse(outputPath);
    response.once("finish", () => {
      const buffer = fs.readFileSync(outputPath);
      resolve({
        resourceId,
        kind,
        title: runtime.layout.header?.title || runtime.item.title,
        instruction: runtime.layout.instruction || runtime.item.studentInstructions || "",
        outputPath,
        bytes: buffer.length,
        pages: pageCount(buffer)
      });
    });
    response.once("error", reject);
    if (kind === "quick_check") {
      renderQuickCheckPDF({
        res: response,
        item: runtime.item,
        contentObject: runtime.normalizedContentObject,
        options: { filename, disposition: "inline", includeAnswerKey: true }
      });
      return;
    }
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
  const results = [];
  for (let index = 0; index < PROOFS.length; index += 1) {
    results.push(await renderProof(PROOFS[index][0], PROOFS[index][1], index));
  }
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "proof-manifest.json"),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), proofs: results }, null, 2)}\n`,
    "utf8"
  );
  console.log(JSON.stringify({ outputDirectory: OUTPUT_DIR, proofCount: results.length, proofs: results }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
