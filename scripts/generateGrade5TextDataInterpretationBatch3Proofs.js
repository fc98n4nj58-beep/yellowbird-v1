"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const ID = "g5_interpret_graphs";
const ROOT = path.join(
  __dirname,
  "..",
  "review",
  "grade-5-text-data-interpretation-batch-3"
);
const SAME_SEED = "g5-b3-proof-same-seed";
const OBSOLETE_PROOFS = Object.freeze([
  "founder-review/01_grade_5_data_interpretation.pdf",
  "stress/04_maximum_question_count.pdf",
  "stress/06_largest_safe_values.pdf",
  "stress/07_smallest_safe_values.pdf",
  "stress/08_narrowest_valid_candidate_pool.pdf"
]);
const AFFECTED_COPY_PROOFS = new Set([
  "01_interpret_the_data.pdf",
  "01_same_seed_a.pdf",
  "02_same_seed_b.pdf",
  "03_different_seed.pdf",
  "04_maximum_unique_question_count.pdf",
  "05_completed_example.pdf",
  "07_all_combined_total_questions.pdf",
  "09_answer_key_included.pdf",
  "10_answer_key_excluded.pdf"
]);
const PROOFS = Object.freeze([
  {
    folder: "founder-review",
    filename: "01_interpret_the_data.pdf",
    seed: "g5-b3-founder-default",
    options: {}
  },
  {
    folder: "stress",
    filename: "01_same_seed_a.pdf",
    seed: SAME_SEED,
    options: {}
  },
  {
    folder: "stress",
    filename: "02_same_seed_b.pdf",
    seed: SAME_SEED,
    options: {}
  },
  {
    folder: "stress",
    filename: "03_different_seed.pdf",
    seed: "g5-b3-proof-different-seed",
    options: {}
  },
  {
    folder: "stress",
    filename: "04_maximum_unique_question_count.pdf",
    seed: "g5-b3-proof-maximum",
    options: { questionCount: 17, textDataQuestionMode: "all" }
  },
  {
    folder: "stress",
    filename: "05_completed_example.pdf",
    seed: "g5-b3-proof-example",
    options: { includeExample: true }
  },
  {
    folder: "stress",
    filename: "06_all_difference_questions.pdf",
    seed: "g5-b3-proof-differences",
    options: { questionCount: 4, textDataQuestionMode: "difference" }
  },
  {
    folder: "stress",
    filename: "07_all_combined_total_questions.pdf",
    seed: "g5-b3-proof-combined-totals",
    options: { questionCount: 4, textDataQuestionMode: "combined_total" }
  },
  {
    folder: "stress",
    filename: "08_ordering_and_true_false_questions.pdf",
    seed: "g5-b3-proof-ordering-true-false",
    options: { questionCount: 6, textDataQuestionMode: "ordering_true_false" }
  },
  {
    folder: "stress",
    filename: "09_answer_key_included.pdf",
    seed: "g5-b3-proof-key-mode",
    options: {},
    includeAnswerKey: true
  },
  {
    folder: "stress",
    filename: "10_answer_key_excluded.pdf",
    seed: "g5-b3-proof-key-mode",
    options: {},
    includeAnswerKey: false
  }
]);

class BufferResponse extends Writable {
  constructor() {
    super();
    this.chunks = [];
  }

  setHeader() {}

  _write(chunk, encoding, callback) {
    this.chunks.push(Buffer.from(chunk));
    callback();
  }

  buffer() {
    return Buffer.concat(this.chunks);
  }
}

function normalizePdfMetadata(buffer) {
  return Buffer.from(
    buffer.toString("latin1")
      .replace(
        /\/ID \[<[^>]+> <[^>]+>\]/g,
        "/ID [<00000000000000000000000000000000> <00000000000000000000000000000000>]"
      )
      .replace(
        /\(D:\d{14}Z\)/g,
        "(D:20000101000000Z)"
      ),
    "latin1"
  );
}

function render(runtime, filename, includeAnswerKey) {
  return new Promise((resolve, reject) => {
    const response = new BufferResponse();
    response.once("finish", () => resolve(response.buffer()));
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: {
        filename,
        disposition: "inline",
        includeAnswerKey
      }
    });
  });
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

async function renderProof(spec) {
  const outputDirectory = path.join(ROOT, spec.folder);
  fs.mkdirSync(outputDirectory, { recursive: true });
  const runtime = buildCatalogWorksheetRuntime(ID, {
    worksheetSeed: spec.seed,
    ...spec.options
  });
  const buffer = normalizePdfMetadata(await render(
    runtime,
    spec.filename,
    spec.includeAnswerKey !== false
  ));
  const outputPath = path.join(outputDirectory, spec.filename);
  fs.writeFileSync(outputPath, buffer);
  return {
    outputPath,
    hash: sha256(buffer),
    content: JSON.stringify(runtime.normalizedContentObject),
    layout: JSON.stringify(runtime.layout)
  };
}

async function run() {
  OBSOLETE_PROOFS.forEach((relativePath) => {
    const obsoletePath = path.join(ROOT, relativePath);
    if (fs.existsSync(obsoletePath)) fs.rmSync(obsoletePath);
  });
  const results = [];
  const selectedProofs = process.argv.includes("--affected")
    ? PROOFS.filter((proof) => AFFECTED_COPY_PROOFS.has(proof.filename))
    : PROOFS;
  for (const proof of selectedProofs) {
    results.push(await renderProof(proof));
  }

  const sameSeedA = results.find((result) => result.outputPath.endsWith("01_same_seed_a.pdf"));
  const sameSeedB = results.find((result) => result.outputPath.endsWith("02_same_seed_b.pdf"));
  if (
    !sameSeedA ||
    !sameSeedB ||
    sameSeedA.hash !== sameSeedB.hash ||
    sameSeedA.content !== sameSeedB.content ||
    sameSeedA.layout !== sameSeedB.layout
  ) {
    throw new Error("Same-seed proof pair is not identical.");
  }

  results.forEach(({ outputPath, hash }) => {
    console.log(`${path.relative(process.cwd(), outputPath)} ${hash}`);
  });
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
