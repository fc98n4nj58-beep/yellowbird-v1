"use strict";

const assert = require("assert");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { getCustomizationFamilyForResource } = require("../config/worksheetCustomization");
const { DATA_DISPLAY_VISUAL_SPECS } = require("../config/layout/dataDisplayVisualSpecs");
const { buildAnswerKeyItems } = require("../renderers/pdfRenderer");
const { footerText } = require("../renderers/compactAssessmentPdfLayout");
const { __test: quickCheckTest } = require("../renderers/quickCheckPdfRenderer");

const QUICK_CHECK_IDS = Object.freeze([
  "g2_addition_within_20_quick_check",
  "g2_subtraction_within_20_quick_check",
  "g2_missing_addends_within_20_quick_check"
]);
const ARRAY_FOOTERS = Object.freeze({
  grade1_multiplication_facts_arrays: "Grade 1 • Math • Early Multiplication Thinking",
  grade2_multiplication_facts_arrays: "Grade 2 • Math • Multiplication & Division",
  g3_multiplication_arrays: "Grade 3 • Math • Multiplication & Division",
  g4_array_interpretation: "Grade 4 • Math • Multiplication & Division"
});
const STANDARD_IDS = Object.freeze([
  "grade1_data_display_graphing_read_graph",
  "grade2_data_display_graphing_read_graph",
  "g3_read_a_graph",
  "grade1_data_display_graphing_interpret_data",
  "grade1_data_display_graphing_graph_questions",
  "grade2_data_display_graphing_interpret_data",
  "g3_graph_questions",
  "g3_interpret_data",
  "grade1_data_display_graphing_graph_word_problems"
]);
const COMPLETE_IDS = Object.freeze([
  "grade1_data_display_graphing_complete_graph",
  "grade2_data_display_graphing_complete_graph",
  "g3_complete_a_graph"
]);
const MATCH_IDS = Object.freeze([
  "grade1_data_display_graphing_match_data_to_graph",
  "grade2_data_display_graphing_match_data_to_graph",
  "g3_match_data_to_graph"
]);

function assertParity(runtime) {
  const student = runtime.normalizedContentObject.content.items;
  const key = buildAnswerKeyItems(student);
  assert.strictEqual(key.length, student.length);
  assert.deepStrictEqual(key.map((item) => item.graphData), student.map((item) => item.graphData));
  assert.deepStrictEqual(key.map((item) => item.graphTaskData), student.map((item) => item.graphTaskData));
}

function run() {
  assert.deepStrictEqual(
    quickCheckTest.GRADE2_QUICK_CHECK_LAYOUT,
    {
      columns: 2,
      rowsPerColumn: 3,
      itemCount: 6,
      equationFontSize: 16,
      targetWidth: 58,
      metadataSubtitle: false,
      preciseTimeEstimate: false,
      teacherPanel: false,
      ratingStrip: false,
      usesSecondaryAnswerLines: false,
      dividerY: 120,
      nameDateY: 135,
      instructionY: 170,
      questionGridY: 206,
      footerResourceKind: "Quick Check"
    }
  );
  QUICK_CHECK_IDS.forEach((id) => {
    const runtime = buildCatalogWorksheetRuntime(id, { worksheetSeed: "founder-remaining-quick-check" });
    assert.strictEqual(footerText(runtime.item, { resourceKindLabel: "Quick Check" }), `${runtime.item.gradeLabels[0]} • Math • ${runtime.item.domain} • Quick Check`);
    assert.strictEqual(getCustomizationFamilyForResource(id), null);
  });

  Object.entries(ARRAY_FOOTERS).forEach(([id, expected]) => {
    const runtime = buildCatalogWorksheetRuntime(id, { worksheetSeed: "founder-remaining-array" });
    assert.strictEqual(runtime.normalizedContentObject.meta.curriculum.footerText, expected);
    assert(!expected.includes("multiplication_foundations"));
  });

  STANDARD_IDS.forEach((id) => {
    const runtime = buildCatalogWorksheetRuntime(id, { worksheetSeed: `founder-remaining:${id}` });
    assert.deepStrictEqual(runtime.layout.display.sharedDataVisualSpec, DATA_DISPLAY_VISUAL_SPECS.standard);
    assert.strictEqual(runtime.layout.display.sharedDataGraphHeight, DATA_DISPLAY_VISUAL_SPECS.standard.height);
    assertParity(runtime);
    assert.strictEqual(getCustomizationFamilyForResource(id), null);
  });

  COMPLETE_IDS.forEach((id) => {
    const runtime = buildCatalogWorksheetRuntime(id, { worksheetSeed: `founder-remaining:${id}` });
    const items = runtime.normalizedContentObject.content.items;
    assert.strictEqual(items.length, 2);
    assert.strictEqual(new Set(items.map((item) => item.graphData.topicId)).size, 2);
    assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 2);
    assert.strictEqual(runtime.layout.display.constructionPictograph.tasksPerPage, 2);
    assert.strictEqual(runtime.layout.display.constructionPictograph.symbolDiameter, DATA_DISPLAY_VISUAL_SPECS.standard.symbolDiameter);
    assert.strictEqual(runtime.layout.display.constructionPictograph.labelWidth, DATA_DISPLAY_VISUAL_SPECS.standard.labelWidth);
    assertParity(runtime);
    assert.strictEqual(getCustomizationFamilyForResource(id), null);
  });

  MATCH_IDS.forEach((id) => {
    const runtime = buildCatalogWorksheetRuntime(id, { worksheetSeed: `founder-remaining:${id}` });
    assert.deepStrictEqual(runtime.layout.display.matchDataVisualSpec, DATA_DISPLAY_VISUAL_SPECS.match);
    assert.strictEqual(runtime.normalizedContentObject.content.items.length, 2);
    assertParity(runtime);
    assert.strictEqual(getCustomizationFamilyForResource(id), null);
  });

  const grade4Deferred = buildCatalogWorksheetRuntime("g4_read_and_interpret_graphs", { worksheetSeed: "founder-remaining-deferred" });
  const grade5Deferred = buildCatalogWorksheetRuntime("g5_complete_graphs", { worksheetSeed: "founder-remaining-deferred" });
  const grade5Approved = buildCatalogWorksheetRuntime("g5_interpret_graphs", { worksheetSeed: "founder-remaining-approved" });
  assert.strictEqual(grade4Deferred.item.status, "planned");
  assert.strictEqual(grade5Deferred.item.status, "planned");
  assert.strictEqual(grade5Approved.item.status, "ready");
  assert.strictEqual(grade5Approved.layout.display.sharedTextDataPanel, true);
  assert.strictEqual(grade5Approved.layout.display.sharedDataPictograph, undefined);

  const statuses = require("../data/worksheetCatalog.master.json").items.reduce((counts, item) => {
    counts[item.status] = (counts[item.status] || 0) + 1;
    return counts;
  }, {});
  assert.deepStrictEqual(statuses, { ready: 106, partial: 4, generated: 213, planned: 11 });
  console.log("Founder Review remaining current-output correction checks passed.");
}

run();
