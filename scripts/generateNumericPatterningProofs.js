const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const {
  buildCatalogWorksheetRuntime
} = require("../services/catalogWorksheetRuntimeService");
const {
  normalizeNumericPatternOptions
} = require("../engine/problemGenerators/numericPatternRules");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const OUTPUT_DIR = path.join(__dirname, "..", "review", "numeric-patterning-family");

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

function pageCount(filePath) {
  const raw = fs.readFileSync(filePath);
  const matches = raw.toString("latin1").match(/\/Type\s*\/Page\b/g);
  return matches ? matches.length : 0;
}

function itemSignature(item) {
  return `${item.prompt}|${item.answer}`;
}

function buildMetrics(items) {
  const studentItems = items.filter((item) => !item.isExample);
  const signatures = studentItems.map(itemSignature);
  const diagnostics = items.flatMap((item) => Array.isArray(item.diagnostics) ? item.diagnostics : []);

  return {
    itemCount: items.length,
    studentQuestionCount: studentItems.length,
    exampleCount: items.length - studentItems.length,
    duplicateCount: signatures.length - new Set(signatures).size,
    hasAnswerMetadata: items.every((item) => item.answer !== undefined && item.answer !== null),
    hasCompletedExample: items.some((item) => item.isExample),
    sequenceMetadataCount: items.filter((item) => Array.isArray(item.sequence)).length,
    missingMetadataCount: items.filter((item) => Array.isArray(item.missingIndexes)).length,
    diagnostics
  };
}

function sameRuntimeContent(a, b) {
  const left = a.contentObject.content.items.map((item) => `${item.prompt}|${item.answer}|${item.isExample}`);
  const right = b.contentObject.content.items.map((item) => `${item.prompt}|${item.answer}|${item.isExample}`);
  return JSON.stringify(left) === JSON.stringify(right);
}

function renderProof(caseDef, runtime) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(OUTPUT_DIR, `${caseDef.slug}.pdf`);
    const res = new FileResponse(filePath);

    res.on("finish", () => resolve(filePath));
    res.on("error", reject);

    renderWorksheetPDF({
      res,
      contentObject: runtime.contentObject,
      layoutObject: runtime.layout,
      options: {
        filename: `${caseDef.slug}.pdf`,
        disposition: "inline",
        includeAnswerKey: caseDef.options.includeAnswerKey !== false
      }
    });
  });
}

const cases = [
  {
    slug: "grade2_extend_default",
    resourceId: "grade2_patterning_and_algebra_extend_pattern",
    options: { worksheetSeed: "g2-extend-default", questionCount: 12 }
  },
  {
    slug: "grade2_extend_subtract",
    resourceId: "grade2_patterning_and_algebra_extend_pattern",
    options: { worksheetSeed: "g2-extend-subtract", questionCount: 12, operationMode: "subtract", minStart: 30, maxStart: 50, maxValue: 50 }
  },
  {
    slug: "grade3_extend_custom_step",
    resourceId: "grade3_patterning_and_algebra_extend_pattern",
    options: { worksheetSeed: "g3-extend-step", questionCount: 12, sequenceStep: 6, maxValue: 120 }
  },
  {
    slug: "grade4_extend_mixed",
    resourceId: "grade4_patterning_and_algebra_extend_pattern",
    options: { worksheetSeed: "g4-extend-mixed", questionCount: 12, operationMode: "mixed", minStart: 30, maxStart: 90, maxValue: 150 }
  },
  {
    slug: "extend_two_continuation_terms",
    resourceId: "grade4_patterning_and_algebra_extend_pattern",
    options: { worksheetSeed: "extend-two", questionCount: 12, continuationCount: 2, maxValue: 150 }
  },
  {
    slug: "extend_completed_example",
    resourceId: "grade3_patterning_and_algebra_extend_pattern",
    options: { worksheetSeed: "extend-example", questionCount: 12, includeExample: true, continuationCount: 2, maxValue: 150 }
  },
  {
    slug: "grade2_missing_beginning",
    resourceId: "grade2_patterning_and_algebra_missing_value_pattern",
    options: { worksheetSeed: "g2-missing-beginning", questionCount: 12, missingTermPlacement: "beginning" }
  },
  {
    slug: "grade2_missing_middle",
    resourceId: "grade2_patterning_and_algebra_missing_value_pattern",
    options: { worksheetSeed: "g2-missing-middle", questionCount: 12, missingTermPlacement: "middle" }
  },
  {
    slug: "grade3_missing_end_two_terms",
    resourceId: "grade3_patterning_and_algebra_missing_value_pattern",
    options: { worksheetSeed: "g3-missing-end", questionCount: 12, missingTermPlacement: "end", missingTermCount: 2, maxValue: 120 }
  },
  {
    slug: "grade4_missing_mixed_two_terms",
    resourceId: "grade4_patterning_and_algebra_missing_value_pattern",
    options: { worksheetSeed: "g4-missing-mixed", questionCount: 12, missingTermPlacement: "random", missingTermCount: 2, maxValue: 150 }
  },
  {
    slug: "missing_completed_example",
    resourceId: "grade4_patterning_and_algebra_missing_value_pattern",
    options: { worksheetSeed: "missing-example", questionCount: 12, includeExample: true, missingTermPlacement: "middle" }
  },
  {
    slug: "grade2_identify_pattern_rule",
    resourceId: "grade2_patterning_and_algebra_identify_pattern_rule",
    options: { worksheetSeed: "g2-rule", questionCount: 8, sequenceStep: 2 }
  },
  {
    slug: "grade3_rule_mixed",
    resourceId: "grade3_patterning_and_algebra_identify_pattern_rule",
    options: { worksheetSeed: "g3-rule-mixed", questionCount: 8, operationMode: "mixed", minStart: 20, maxStart: 60, maxValue: 120 }
  },
  {
    slug: "grade4_rule_subtract",
    resourceId: "grade4_patterning_and_algebra_identify_pattern_rule",
    options: { worksheetSeed: "g4-rule-subtract", questionCount: 8, operationMode: "subtract", minStart: 40, maxStart: 120, maxValue: 150 }
  },
  {
    slug: "identify_rule_completed_example",
    resourceId: "grade3_patterning_and_algebra_identify_pattern_rule",
    options: { worksheetSeed: "rule-example", questionCount: 8, includeExample: true, operationMode: "mixed", maxValue: 120 }
  },
  {
    slug: "multi_page_32_questions",
    resourceId: "grade4_patterning_and_algebra_extend_pattern",
    options: { worksheetSeed: "multi-page", questionCount: 32, questionsPerPage: 10, maxValue: 180 }
  },
  {
    slug: "same_seed_parity",
    resourceId: "grade3_patterning_and_algebra_extend_pattern",
    options: { worksheetSeed: "same-seed", questionCount: 12, operationMode: "mixed", minStart: 20, maxStart: 80, maxValue: 140 }
  },
  {
    slug: "duplicate_repeat_small_pool",
    resourceId: "grade2_patterning_and_algebra_extend_pattern",
    options: { worksheetSeed: "small-pool", questionCount: 6, minStart: 1, maxStart: 1, sequenceStep: 1, maxValue: 10 }
  },
  {
    slug: "skip_counting_regression_by_2",
    resourceId: "g2_skip_counting_by_2",
    options: { worksheetSeed: "skip-counting-proof", questionCount: 10 }
  }
];

const deferredNotes = [
  {
    slug: "function_table_deferred_state",
    resourceId: "grade3_patterning_and_algebra_function_table",
    publicReadyStatus: "deferred",
    note: "Function Tables keep internal arithmetic-rule runtime compatibility, but public-ready Patterning layout is deferred until a true table worksheet layout is approved.",
    futureDesign: {
      rule: "One rule per table",
      columns: ["Input", "Output"],
      rows: 4
    }
  }
];

function activityForResource(resourceId) {
  if (resourceId.includes("extend_pattern")) return "extend_pattern";
  if (resourceId.includes("missing_value_pattern")) return "missing_value_pattern";
  if (resourceId.includes("identify_pattern_rule")) return "identify_pattern_rule";
  if (resourceId.includes("function_table")) return "function_table";
  if (resourceId.includes("skip_counting")) return "skip_counting";
  return "";
}

function gradeForRuntime(runtime) {
  return runtime.item.gradeLabels?.[0] || runtime.item.grades?.[0] || "";
}

function normalizedPatternOptions(caseDef) {
  const purpose = activityForResource(caseDef.resourceId);
  if (!["extend_pattern", "missing_value_pattern", "identify_pattern_rule", "function_table"].includes(purpose)) {
    return null;
  }
  return normalizeNumericPatternOptions(purpose, caseDef.options);
}

async function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.readdirSync(OUTPUT_DIR).forEach((entry) => {
    if (entry.endsWith(".pdf") || entry.endsWith(".json")) {
      fs.unlinkSync(path.join(OUTPUT_DIR, entry));
    }
  });

  const summary = [];

  for (const caseDef of cases) {
    const metadata = {
      slug: caseDef.slug,
      resourceId: caseDef.resourceId,
      inputOptions: caseDef.options,
      activity: activityForResource(caseDef.resourceId),
      grade: "",
      seed: caseDef.options.worksheetSeed || "yellowbird-default",
      normalizedOptions: normalizedPatternOptions(caseDef),
      taskVariant: null,
      pageCapacity: null,
      pageDistribution: null,
      publicReadyStatus: ["extend_pattern", "missing_value_pattern", "identify_pattern_rule"].includes(activityForResource(caseDef.resourceId))
        ? "awaiting_founder_pdf_re_review"
        : "regression_or_internal_only",
      pdfPath: null,
      pageCount: 0,
      runtimeParity: false,
      metrics: null,
      error: null
    };

    try {
      const runtime = buildCatalogWorksheetRuntime(caseDef.resourceId, caseDef.options);
      const parityRuntime = buildCatalogWorksheetRuntime(caseDef.resourceId, caseDef.options);
      const pdfPath = await renderProof(caseDef, runtime);

      metadata.grade = gradeForRuntime(runtime);
      metadata.taskVariant = runtime.layout?.display?.patterningLayout || activityForResource(caseDef.resourceId);
      metadata.pageCapacity = runtime.layout?.patterningPagination?.capacity || runtime.layout?.template?.maxProblemsPerPage || null;
      metadata.pageDistribution = runtime.layout?.patterningPagination || null;
      metadata.pdfPath = pdfPath;
      metadata.pageCount = pageCount(pdfPath);
      metadata.runtimeParity = sameRuntimeContent(runtime, parityRuntime);
      metadata.metrics = buildMetrics(runtime.contentObject.content.items);
    } catch (err) {
      metadata.error = {
        stage: "runtime_or_pdf",
        message: err.message
      };
    }

    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${caseDef.slug}.json`),
      JSON.stringify(metadata, null, 2)
    );
    summary.push(metadata);
  }

  deferredNotes.forEach((note) => {
    const metadata = {
      ...note,
      activity: activityForResource(note.resourceId),
      grade: "Grade 3",
      pageCount: 0,
      pdfPath: null,
      metrics: null,
      error: null
    };
    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${note.slug}.json`),
      JSON.stringify(metadata, null, 2)
    );
    summary.push(metadata);
  });

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "summary.json"),
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      outputDir: OUTPUT_DIR,
      cases: summary
    }, null, 2)
  );

  const validPdfs = summary.filter((item) => item.pdfPath).length;
  const runtimeErrors = summary.filter((item) => item.error).length;
  const parityFailures = summary.filter((item) => item.pdfPath && !item.runtimeParity).length;
  console.log(`Numeric Patterning proof artifacts written to ${OUTPUT_DIR}`);
  console.log(`Valid PDFs: ${validPdfs}`);
  console.log(`Runtime errors: ${runtimeErrors}`);
  console.log(`Same-seed parity failures: ${parityFailures}`);

  if (runtimeErrors || parityFailures) {
    process.exitCode = 1;
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
