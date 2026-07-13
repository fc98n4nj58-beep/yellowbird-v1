const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const {
  buildCatalogWorksheetRuntime
} = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF } = require("../renderers/pdfRenderer");

const OUTPUT_DIR = path.join(__dirname, "..", "review", "grade-1-fluency-comparison");

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

function studentItems(items) {
  return items.filter((item) => !item.isExample);
}

function questionItems(runtime, items) {
  return runtime.layout.display.exampleCountsAsQuestion
    ? items
    : studentItems(items);
}

function parseSelectedValues(values) {
  const raw = Array.isArray(values)
    ? values
    : typeof values === "string"
    ? values.split(",")
    : values === undefined || values === null
    ? []
    : [values];
  return raw.map((value) => Number(value)).filter((value) => Number.isFinite(value));
}

function countBy(runtime, items, field) {
  return questionItems(runtime, items).reduce((counts, item) => {
    const value = item[field] ?? "none";
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function itemSignature(item) {
  return item.duplicateSignature || `${item.prompt}|${item.answer}`;
}

function selectedCoverage(runtime, items, values, fields) {
  const selected = new Set(parseSelectedValues(values));
  if (!selected.size) return null;
  return questionItems(runtime, items).filter((item) =>
    fields.some((field) => selected.has(item[field]))
  ).length;
}

function diagnosticsFor(items) {
  return items.flatMap((item) => Array.isArray(item.diagnostics) ? item.diagnostics : []);
}

function pageDistribution(runtime, items) {
  const maxPerPage = runtime.layout.template.maxProblemsPerPage || questionItems(runtime, items).length;
  const count = questionItems(runtime, items).length;
  const pages = Math.max(1, Math.ceil(count / maxPerPage));
  const base = Math.floor(count / pages);
  const extra = count % pages;
  return Array.from({ length: pages }, (_, index) => base + (index < extra ? 1 : 0));
}

function proofFields(resourceId) {
  if (resourceId === "g1_addition_facts_within_20") {
    return {
      selectedFields: ["a", "b"],
      distributionField: "op"
    };
  }
  if (resourceId === "g1_subtraction_facts_within_20") {
    return {
      selectedFields: ["minuend", "subtrahend", "difference"],
      distributionField: "operation"
    };
  }
  if (resourceId === "g1_missing_addends_within_20") {
    return {
      selectedFields: ["firstAddend", "secondAddend", "total", "missingValue"],
      distributionField: "missingPosition"
    };
  }
  return {
    selectedFields: ["leftValue", "rightValue"],
    distributionField: "expectedSymbol"
  };
}

function sameRuntimeContent(left, right) {
  const leftItems = left.contentObject.content.items.map((item) => `${item.prompt}|${item.answer}|${item.isExample}`);
  const rightItems = right.contentObject.content.items.map((item) => `${item.prompt}|${item.answer}|${item.isExample}`);
  return JSON.stringify(leftItems) === JSON.stringify(rightItems);
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
    slug: "comparison_01_addition_default",
    resourceId: "g1_addition_facts_within_20",
    options: { worksheetSeed: "addition-default" }
  },
  {
    slug: "comparison_02_subtraction_default",
    resourceId: "g1_subtraction_facts_within_20",
    options: { worksheetSeed: "sub-default" }
  },
  {
    slug: "comparison_03_missing_default",
    resourceId: "g1_missing_addends_within_20",
    options: { worksheetSeed: "missing-default" }
  },
  {
    slug: "comparison_04_compare_default",
    resourceId: "g1_compare_numbers_to_20",
    options: { worksheetSeed: "compare-default" }
  },
  {
    slug: "comparison_05_addition_completed_q1",
    resourceId: "g1_addition_facts_within_20",
    options: { worksheetSeed: "addition-example", questionCount: 20, includeExample: true }
  },
  {
    slug: "comparison_06_subtraction_completed_q1",
    resourceId: "g1_subtraction_facts_within_20",
    options: { worksheetSeed: "sub-example", questionCount: 20, includeExample: true }
  },
  {
    slug: "comparison_07_missing_completed_q1",
    resourceId: "g1_missing_addends_within_20",
    options: { worksheetSeed: "missing-example", questionCount: 20, includeExample: true }
  },
  {
    slug: "comparison_08_compare_completed_q1",
    resourceId: "g1_compare_numbers_to_20",
    options: { worksheetSeed: "compare-example", questionCount: 20, includeExample: true }
  },
  {
    slug: "comparison_09_answer_targets",
    resourceId: "g1_compare_numbers_to_20",
    options: { worksheetSeed: "compare-target", questionCount: 20, includeExample: true }
  },
  {
    slug: "comparison_10_answer_key",
    resourceId: "g1_addition_facts_within_20",
    options: { worksheetSeed: "addition-key", questionCount: 20, includeExample: true, includeAnswerKey: true }
  },
  {
    slug: "comparison_11_60_question_page",
    resourceId: "g1_subtraction_facts_within_20",
    options: { worksheetSeed: "sub-60", questionCount: 60, includeExample: true }
  },
  {
    slug: "comparison_12_multi_page",
    resourceId: "g1_missing_addends_within_20",
    options: { worksheetSeed: "missing-multi-compare", questionCount: 75, questionsPerPage: 60, includeExample: true }
  },
  {
    slug: "comparison_13_widest_values",
    resourceId: "g1_compare_numbers_to_20",
    options: { worksheetSeed: "compare-wide", minimumValue: 0, maximumValue: 20, questionCount: 60, includeExample: true }
  },
  {
    slug: "comparison_14_footer_header",
    resourceId: "g1_addition_facts_within_20",
    options: { worksheetSeed: "addition-header-footer", questionCount: 60 }
  },
  {
    slug: "subtraction_default",
    resourceId: "g1_subtraction_facts_within_20",
    options: { worksheetSeed: "sub-default" }
  },
  {
    slug: "subtraction_custom_range",
    resourceId: "g1_subtraction_facts_within_20",
    options: { worksheetSeed: "sub-range", minimumValue: 5, maximumValue: 15, questionCount: 30 }
  },
  {
    slug: "subtraction_selected_values",
    resourceId: "g1_subtraction_facts_within_20",
    options: { worksheetSeed: "sub-selected", selectedValues: "7,8", questionCount: 30 }
  },
  {
    slug: "subtraction_completed_example",
    resourceId: "g1_subtraction_facts_within_20",
    options: { worksheetSeed: "sub-example", questionCount: 20, includeExample: true }
  },
  {
    slug: "subtraction_multi_page",
    resourceId: "g1_subtraction_facts_within_20",
    options: { worksheetSeed: "sub-multi", questionCount: 75, questionsPerPage: 60, includeExample: true }
  },
  {
    slug: "subtraction_low_variety",
    resourceId: "g1_subtraction_facts_within_20",
    options: { worksheetSeed: "sub-low-variety", minimumValue: 0, maximumValue: 1, questionCount: 6 }
  },
  {
    slug: "subtraction_no_answer_key",
    resourceId: "g1_subtraction_facts_within_20",
    options: { worksheetSeed: "sub-no-key", questionCount: 20, includeAnswerKey: false }
  },
  {
    slug: "subtraction_same_seed_parity",
    resourceId: "g1_subtraction_facts_within_20",
    options: { worksheetSeed: "sub-same-seed", minimumValue: 2, maximumValue: 18, questionCount: 25 }
  },
  {
    slug: "missing_default",
    resourceId: "g1_missing_addends_within_20",
    options: { worksheetSeed: "missing-default" }
  },
  {
    slug: "missing_first_addend",
    resourceId: "g1_missing_addends_within_20",
    options: { worksheetSeed: "missing-first", missingPosition: "first_addend", questionCount: 30 }
  },
  {
    slug: "missing_second_addend",
    resourceId: "g1_missing_addends_within_20",
    options: { worksheetSeed: "missing-second", missingPosition: "second_addend", questionCount: 30 }
  },
  {
    slug: "missing_mixed_selected",
    resourceId: "g1_missing_addends_within_20",
    options: { worksheetSeed: "missing-selected", selectedValues: [7, 8], questionCount: 30 }
  },
  {
    slug: "missing_completed_example",
    resourceId: "g1_missing_addends_within_20",
    options: { worksheetSeed: "missing-example", questionCount: 20, includeExample: true }
  },
  {
    slug: "missing_multi_page",
    resourceId: "g1_missing_addends_within_20",
    options: { worksheetSeed: "missing-multi", questionCount: 75, questionsPerPage: 60, includeExample: true }
  },
  {
    slug: "missing_low_variety",
    resourceId: "g1_missing_addends_within_20",
    options: { worksheetSeed: "missing-low-variety", minimumValue: 0, maximumValue: 0, questionCount: 6 }
  },
  {
    slug: "missing_same_seed_parity",
    resourceId: "g1_missing_addends_within_20",
    options: { worksheetSeed: "missing-same-seed", missingPosition: "mixed", questionCount: 24 }
  },
  {
    slug: "compare_default",
    resourceId: "g1_compare_numbers_to_20",
    options: { worksheetSeed: "compare-default" }
  },
  {
    slug: "compare_custom_range",
    resourceId: "g1_compare_numbers_to_20",
    options: { worksheetSeed: "compare-range", minimumValue: 4, maximumValue: 14, questionCount: 30 }
  },
  {
    slug: "compare_selected_values",
    resourceId: "g1_compare_numbers_to_20",
    options: { worksheetSeed: "compare-selected", selectedValues: "7,8", questionCount: 30 }
  },
  {
    slug: "compare_no_equal_pairs",
    resourceId: "g1_compare_numbers_to_20",
    options: { worksheetSeed: "compare-no-equals", includeEqualPairs: false, questionCount: 40 }
  },
  {
    slug: "compare_completed_example",
    resourceId: "g1_compare_numbers_to_20",
    options: { worksheetSeed: "compare-example", questionCount: 20, includeExample: true }
  },
  {
    slug: "compare_multi_page",
    resourceId: "g1_compare_numbers_to_20",
    options: { worksheetSeed: "compare-multi", questionCount: 75, questionsPerPage: 60, includeExample: true }
  },
  {
    slug: "compare_low_variety",
    resourceId: "g1_compare_numbers_to_20",
    options: { worksheetSeed: "compare-low-variety", minimumValue: 0, maximumValue: 0, questionCount: 6 }
  },
  {
    slug: "compare_same_seed_parity",
    resourceId: "g1_compare_numbers_to_20",
    options: { worksheetSeed: "compare-same-seed", minimumValue: 3, maximumValue: 13, questionCount: 25 }
  }
];

async function run() {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const results = [];
  let sameSeedParityFailures = 0;

  for (const caseDef of cases) {
    const runtime = buildCatalogWorksheetRuntime(caseDef.resourceId, caseDef.options);
    const repeatRuntime = buildCatalogWorksheetRuntime(caseDef.resourceId, caseDef.options);
    const parityMatches = sameRuntimeContent(runtime, repeatRuntime);
    if (!parityMatches) sameSeedParityFailures += 1;

    const filePath = await renderProof(caseDef, runtime);
    const items = runtime.contentObject.content.items;
    const fields = proofFields(caseDef.resourceId);
    const requestedItems = questionItems(runtime, items);
    const signatures = requestedItems.map(itemSignature);

    results.push({
      slug: caseDef.slug,
      resourceId: caseDef.resourceId,
      options: caseDef.options,
      pdf: path.relative(path.join(__dirname, ".."), filePath),
      pageCount: pageCount(filePath),
      studentQuestionCount: requestedItems.length,
      itemCount: items.length,
      separateExampleCount: runtime.layout.display.exampleCountsAsQuestion
        ? 0
        : items.length - studentItems(items).length,
      completedQuestion1: Boolean(runtime.layout.display.exampleCountsAsQuestion && items[0]?.isExample),
      duplicateCount: signatures.length - new Set(signatures).size,
      pageDistribution: pageDistribution(runtime, items),
      instruction: runtime.layout.instruction,
      answerTargetVariant: runtime.layout.display.answerTargetVariant || null,
      standardShortAnswerTarget: Boolean(runtime.layout.display.standardShortAnswerTarget),
      questionFontSize: 12,
      rowSpacing: runtime.layout.display.denseGridRows ? "denseGridRows:15" : null,
      columnCount: runtime.layout.template.columns || null,
      footerLabel: runtime.contentObject.meta.curriculum.footerText,
      distribution: countBy(runtime, items, fields.distributionField),
      selectedCoverage: selectedCoverage(runtime, items, caseDef.options.selectedValues, fields.selectedFields),
      diagnostics: diagnosticsFor(items),
      sameSeedParity: parityMatches
    });
  }

  const summary = {
    status: sameSeedParityFailures === 0 ? "ok" : "failed",
    generatedAt: new Date().toISOString(),
    outputDir: path.relative(path.join(__dirname, ".."), OUTPUT_DIR),
    proofCount: results.length,
    sameSeedParityFailures,
    resources: [
      "g1_addition_facts_within_20",
      "g1_subtraction_facts_within_20",
      "g1_missing_addends_within_20",
      "g1_compare_numbers_to_20"
    ],
    publicCustomizationUi: "not implemented in this packet",
    resourcePromotion: "none",
    results
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "summary.json"),
    `${JSON.stringify(summary, null, 2)}\n`
  );

  console.log(`Generated ${results.length} Grade 1 fluency + comparison proof PDFs.`);
  console.log(`Same-seed parity failures: ${sameSeedParityFailures}`);
  console.log(`Output: ${path.relative(process.cwd(), OUTPUT_DIR)}`);

  if (sameSeedParityFailures > 0) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
