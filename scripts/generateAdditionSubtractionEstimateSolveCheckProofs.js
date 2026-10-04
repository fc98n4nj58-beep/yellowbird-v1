"use strict";

const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const OUTPUT_DIR = path.join(
  __dirname,
  "..",
  "review",
  "pre-launch-addition-subtraction-progression",
  "internal-design-proof-founder-rules-v2"
);

class FileResponse extends Writable {
  constructor(filePath) { super(); this.file = fs.createWriteStream(filePath); }
  setHeader() {}
  _write(chunk, encoding, callback) { this.file.write(chunk, encoding, callback); }
  _final(callback) { this.file.end(callback); }
}

function runtimeFor(resourceId, compositionMode, worksheetSeed) {
  return buildCatalogWorksheetRuntime(resourceId, {
    worksheetSeed,
    _compositionMode: compositionMode
  });
}

function bestSeed(resourceId, compositionMode, score) {
  let best = null;
  for (let index = 0; index < 120; index += 1) {
    const worksheetSeed = `${resourceId}-${compositionMode}-boundary-${index}`;
    const runtime = runtimeFor(resourceId, compositionMode, worksheetSeed);
    const value = score(runtime);
    if (!best || value > best.value) best = { worksheetSeed, value };
  }
  return best.worksheetSeed;
}

function renderProof({ filename, resourceId, compositionMode, worksheetSeed }) {
  return new Promise((resolve, reject) => {
    const runtime = runtimeFor(resourceId, compositionMode, worksheetSeed);
    const outputPath = path.join(OUTPUT_DIR, filename);
    const response = new FileResponse(outputPath);
    response.once("finish", () => resolve({ outputPath, worksheetSeed, compositionMode }));
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
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const g4BoundarySeed = bestSeed(
    "g4_addition_subtraction_estimate_solve_check",
    "full_progression",
    (runtime) => runtime.normalizedContentObject.content.items.reduce((score, item) => (
      score +
      (item.numberDomain === "decimal_tenths" ? Number(item.answerState?.scaledAnswer || item.answerState?.exactScaledAnswer || 0) : 0) +
      String(item.prompt || "").length * 10 +
      String(item.answerState?.sampleExplanation || "").length * 20
    ), 0)
  );

  const definitions = [
    ["01_g3_full_progression_student_and_key.pdf", "g3_addition_subtraction_estimate_solve_check", "full_progression", "g3-modular-full-default"],
    ["02_g4_full_progression_student_and_key.pdf", "g4_addition_subtraction_estimate_solve_check", "full_progression", "g4-modular-full-default"],
    ["03_g3_compute_standalone.pdf", "g3_addition_subtraction_estimate_solve_check", "compute", "g3-modular-compute"],
    ["04_g4_compute_standalone.pdf", "g4_addition_subtraction_estimate_solve_check", "compute", "g4-modular-compute"],
    ["05_g3_estimate_standalone.pdf", "g3_addition_subtraction_estimate_solve_check", "estimate", "g3-modular-estimate"],
    ["06_g4_estimate_standalone.pdf", "g4_addition_subtraction_estimate_solve_check", "estimate", "g4-modular-estimate"],
    ["07_g3_apply_standalone.pdf", "g3_addition_subtraction_estimate_solve_check", "apply", "g3-modular-apply"],
    ["08_g4_apply_standalone.pdf", "g4_addition_subtraction_estimate_solve_check", "apply", "g4-modular-apply"],
    ["09_g3_reason_check_standalone.pdf", "g3_addition_subtraction_estimate_solve_check", "reason_check", "g3-modular-reason"],
    ["10_g4_reason_check_standalone.pdf", "g4_addition_subtraction_estimate_solve_check", "reason_check", "g4-modular-reason"],
    ["11_g3_integrated_mixed_standalone.pdf", "g3_addition_subtraction_estimate_solve_check", "integrated_mixed", "g3-modular-integrated"],
    ["12_g4_integrated_mixed_standalone.pdf", "g4_addition_subtraction_estimate_solve_check", "integrated_mixed", "g4-modular-integrated"],
    ["13_g4_longest_decimal_explanation_boundary.pdf", "g4_addition_subtraction_estimate_solve_check", "full_progression", g4BoundarySeed]
  ].map(([filename, resourceId, compositionMode, worksheetSeed]) => ({
    filename,
    resourceId,
    compositionMode,
    worksheetSeed
  }));

  for (const definition of definitions) {
    const result = await renderProof(definition);
    console.log(`${path.relative(process.cwd(), result.outputPath)} | mode=${result.compositionMode} | seed=${result.worksheetSeed}`);
  }
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
