"use strict";

const assert = require("assert");
const { Writable } = require("stream");
const express = require("express");
const libraryRoutes = require("../routes/libraryRoutes");
const worksheetPreviewRoutes = require("../routes/worksheetPreviewRoutes");
const worksheetPdfRoutes = require("../routes/worksheetPdfRoutes");
const worksheetCatalogRoutes = require("../routes/worksheetCatalogRoutes");
const { getCustomizationFamilyForResource } = require("../config/worksheetCustomization");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF, buildAnswerKeyItems } = require("../renderers/pdfRenderer");
const {
  roundToPlace,
  COMPOSITION_MODES,
  STANDALONE_COUNTS,
  FULL_PROGRESSION_COUNTS
} = require("../engine/problemGenerators/additionSubtractionEstimateSolveCheck");

const IDS = Object.freeze([
  "g3_addition_subtraction_estimate_solve_check",
  "g4_addition_subtraction_estimate_solve_check"
]);
const MODULES = Object.freeze(["compute", "estimate", "apply", "reason_check"]);
const PAGE_COUNTS = Object.freeze({
  full_progression: [7, 14],
  compute: [1, 2],
  estimate: [1, 2],
  apply: [2, 4],
  reason_check: [1, 2],
  integrated_mixed: [2, 4]
});

class BufferResponse extends Writable {
  constructor() { super(); this.chunks = []; }
  setHeader() {}
  _write(chunk, encoding, callback) { this.chunks.push(Buffer.from(chunk)); callback(); }
  buffer() { return Buffer.concat(this.chunks); }
}

function render(runtime, includeAnswerKey) {
  return new Promise((resolve, reject) => {
    const response = new BufferResponse();
    response.once("finish", () => resolve(response.buffer()));
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: { filename: "estimate-solve-check-test.pdf", includeAnswerKey }
    });
  });
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function signature(runtime) {
  return runtime.normalizedContentObject.content.items.map((item) => ({
    prompt: item.prompt,
    answer: item.answer,
    taskMode: item.taskMode,
    taskAction: item.taskAction,
    operation: item.operation,
    moduleId: item.moduleId,
    recipeId: item.recipeId,
    sequenceSection: item.sequenceSection,
    numberDomain: item.numberDomain,
    isIntegrated: item.isIntegrated,
    answerState: item.answerState,
    duplicateSignature: item.duplicateSignature
  }));
}

function assertOperationTruth(item) {
  const state = item.answerState;
  const exact = state.operation === "add"
    ? state.scaledA + state.scaledB
    : state.scaledA - state.scaledB;
  assert.strictEqual(state.scaledAnswer, exact);
  assert(exact >= 0);
  assert.strictEqual(item.answer, state.displayAnswer);
}

function assertEstimateTruth(item) {
  const state = item.answerState;
  const roundedA = roundToPlace(state.scaledA, state.roundingPlace);
  const roundedB = roundToPlace(state.scaledB, state.roundingPlace);
  const estimate = state.operation === "add" ? roundedA + roundedB : roundedA - roundedB;
  assert.strictEqual(state.roundedA, roundedA);
  assert.strictEqual(state.roundedB, roundedB);
  assert.strictEqual(state.scaledAnswer, estimate);
  assert.strictEqual(item.responseType, "structured_numbers");
  assert.strictEqual(item.responseTarget, "rounded_numbers_and_estimate");
  assert.deepStrictEqual(state.responseTargets, {
    roundedA: state.displayRoundedA,
    roundedB: state.displayRoundedB,
    estimate: state.displayAnswer
  });
}

function assertReasonTruth(item) {
  const state = item.answerState;
  const exact = state.operation === "add"
    ? state.exactScaledAnswer
    : state.exactScaledAnswer;
  assert(["Yes", "No"].includes(state.expectedChoice));
  assert.strictEqual(item.answer, state.expectedChoice);
  if (state.expectedChoice === "Yes") assert.strictEqual(state.claimedScaledAnswer, exact);
  else assert.notStrictEqual(state.claimedScaledAnswer, exact);
  assert(state.sampleExplanation.length <= 115);
}

function assertMetadata(item, grade, recipeId) {
  assert.strictEqual(item.family, "addition_subtraction_estimate_solve_check");
  assert(MODULES.includes(item.moduleId));
  assert.strictEqual(item.recipeId, recipeId);
  assert(["whole_number", "decimal_tenths"].includes(item.numberDomain));
  assert(["number", "structured_numbers", "math_sentence_and_answer", "selection_and_explanation"].includes(item.responseType));
  assert(item.responseTarget);
  assert(item.taskAction);
  assert(item.progressionRole);
  assert.strictEqual(item.gradeBand, `grade${grade}`);
}

function assertModeComposition(items, grade, mode) {
  const expectedCount = mode === "full_progression"
    ? FULL_PROGRESSION_COUNTS[grade]
    : STANDALONE_COUNTS[grade][mode];
  assert.strictEqual(items.length, expectedCount);
  items.forEach((item) => assertMetadata(item, grade, mode));
  assert.strictEqual(new Set(items.map((item) => item.duplicateSignature)).size, expectedCount);
  assert.strictEqual(buildAnswerKeyItems(items).length, expectedCount);

  if (mode === "full_progression") {
    const counts = STANDALONE_COUNTS[grade];
    assert.strictEqual(items.filter((item) => item.sequenceSection === "compute").length, counts.compute);
    assert.strictEqual(items.filter((item) => item.sequenceSection === "estimate").length, counts.estimate);
    assert.strictEqual(items.filter((item) => item.sequenceSection === "apply").length, counts.apply);
    assert.strictEqual(items.filter((item) => item.sequenceSection === "reason_check").length, counts.reason_check);
    assert.strictEqual(items.filter((item) => item.sequenceSection === "integrated_mixed").length, 12);
    assert.strictEqual(items.filter((item) => item.isIntegrated).length, 12);
  } else if (mode === "integrated_mixed") {
    assert.deepStrictEqual(
      MODULES.map((moduleId) => items.filter((item) => item.moduleId === moduleId).length),
      [4, 3, 3, 2]
    );
    assert(items.every((item) => item.isIntegrated));
  } else {
    assert(items.every((item) => item.moduleId === mode));
    assert(items.every((item) => !item.isIntegrated));
  }
}

function assertGradeContract(items, grade) {
  items.filter((item) => item.taskMode === "compute").forEach(assertOperationTruth);
  items.filter((item) => item.taskMode === "estimate").forEach(assertEstimateTruth);
  items.filter((item) => item.taskMode === "apply").forEach((item) => {
    assert(Number.isFinite(Number(String(item.answer).replace(/,/g, ""))));
    assert(item.answerState.contextId);
    assert.strictEqual(item.responseType, "math_sentence_and_answer");
    assert.strictEqual(item.responseTarget, "math_sentence_and_answer");
    assert.strictEqual(item.answerState.responseTargets.mathSentence, item.answerState.displayMathSentence);
    assert.strictEqual(item.answerState.responseTargets.finalAnswer, item.answer);
    assert(item.answerState.displayMathSentence.endsWith(`= ${item.answer}`));
  });
  items.filter((item) => item.taskMode === "reason_check").forEach(assertReasonTruth);

  if (grade === 3) {
    assert(items.every((item) => item.answerState.decimalPlaces === undefined || item.answerState.decimalPlaces === 0));
    items.filter((item) => ["compute", "apply"].includes(item.taskMode)).forEach((item) => {
      assert(Number(String(item.answer).replace(/,/g, "")) <= 1000);
    });
  } else {
    const compute = items.filter((item) => item.taskMode === "compute");
    const estimate = items.filter((item) => item.taskMode === "estimate");
    const reason = items.filter((item) => item.taskMode === "reason_check");
    if (compute.length >= 4) {
      assert(compute.some((item) => item.numberDomain === "whole_number"));
      assert(compute.some((item) => item.numberDomain === "decimal_tenths"));
    }
    if (estimate.length >= 3) {
      assert(estimate.some((item) => item.numberDomain === "whole_number"));
      assert(estimate.some((item) => item.numberDomain === "decimal_tenths"));
    }
    if (reason.length >= 2) {
      assert(reason.some((item) => item.numberDomain === "whole_number"));
      assert(reason.some((item) => item.numberDomain === "decimal_tenths"));
    }
    items.filter((item) => item.numberDomain === "decimal_tenths" && item.taskMode === "compute").forEach((item) => {
      assert(/^\d+\.\d$/.test(item.answer));
      assert.strictEqual(item.responseTarget, "place_aligned_decimal");
    });
  }
}

function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(worksheetPreviewRoutes);
  app.use(worksheetPdfRoutes);
  app.use(worksheetCatalogRoutes);
  app.use("/", libraryRoutes);
  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => resolve({
      server,
      baseUrl: `http://127.0.0.1:${server.address().port}`
    }));
  });
}

async function run() {
  for (const id of IDS) {
    const grade = id.startsWith("g3_") ? 3 : 4;
    assert.strictEqual(getCustomizationFamilyForResource(id), null);
    const publicOverride = buildCatalogWorksheetRuntime(id, { compositionMode: "compute", worksheetSeed: "public-mode-ignored" });
    assert.strictEqual(publicOverride.layout.display.progressionMode, "full_progression");
    assert.throws(() => buildCatalogWorksheetRuntime(id, { _compositionMode: "unsupported" }), /Unsupported internal/);

    for (const mode of COMPOSITION_MODES) {
      const seed = `${id}-${mode}-same`;
      const first = buildCatalogWorksheetRuntime(id, { worksheetSeed: seed, _compositionMode: mode });
      const repeat = buildCatalogWorksheetRuntime(id, { worksheetSeed: seed, _compositionMode: mode });
      const different = buildCatalogWorksheetRuntime(id, { worksheetSeed: `${id}-${mode}-different`, _compositionMode: mode });
      const items = first.normalizedContentObject.content.items;
      assert.strictEqual(first.item.status, "ready");
      assert.strictEqual(first.layout.header.subtitle, "");
      assert.strictEqual(first.layout.display.wholeNumberFamilyLayout, "additionSubtractionProgression");
      assert.strictEqual(first.layout.display.progressionMode, mode);
      assertModeComposition(items, grade, mode);
      assertGradeContract(items, grade);
      const expectedModelSections = mode === "full_progression"
        ? ["compute", "estimate", "apply", "reason_check", "integrated_mixed"]
        : [mode];
      expectedModelSections.forEach((section) => {
        const first = items.find((item) => mode === "full_progression" ? item.sequenceSection === section : true);
        assert(first?.answerState?.conceptModel, `${id} ${mode} ${section} concept model`);
      });
      if (["full_progression", "compute"].includes(mode)) {
        const computeItems = items.filter((item) => mode === "full_progression" ? item.sequenceSection === "compute" : true);
        assert.strictEqual(computeItems.length, 20);
        assert.deepStrictEqual(computeItems.map((item) => item.id), Array.from({ length: 20 }, (_, index) => index + 1));
      }
      assert.deepStrictEqual(signature(first), signature(repeat));
      assert.notDeepStrictEqual(signature(first), signature(different));
      const [studentPages, studentAndKeyPages] = PAGE_COUNTS[mode];
      assert.strictEqual(pageCount(await render(first, false)), studentPages, `${id} ${mode} student pages`);
      assert.strictEqual(pageCount(await render(first, true)), studentAndKeyPages, `${id} ${mode} student/key pages`);
    }
  }

  for (const id of IDS) {
    const grade = id.startsWith("g3_") ? 3 : 4;
    for (const mode of COMPOSITION_MODES) {
      for (let index = 0; index < 20; index += 1) {
        const runtime = buildCatalogWorksheetRuntime(id, {
          worksheetSeed: `${id}-${mode}-seed-${index}`,
          _compositionMode: mode
        });
        const items = runtime.normalizedContentObject.content.items;
        assertModeComposition(items, grade, mode);
        assertGradeContract(items, grade);
      }
    }
  }

  const roundingIsolation = buildCatalogWorksheetRuntime("g3_round_whole_numbers", {
    worksheetSeed: "isolation",
    _compositionMode: "compute"
  });
  assert.strictEqual(roundingIsolation.normalizedContentObject.content.items.length, 12);
  assert.strictEqual(roundingIsolation.layout.display.wholeNumberFamilyLayout, "rounding");

  const { server, baseUrl } = await startServer();
  try {
    for (const id of IDS) {
      const detail = await fetch(`${baseUrl}/resource/worksheet/${id}`);
      assert.strictEqual(detail.status, 200, `${id} detail route`);
      const preview = await fetch(`${baseUrl}/api/catalog-preview/${id}?worksheetSeed=route-smoke`);
      assert.strictEqual(preview.status, 200, `${id} preview route`);
      assert.strictEqual((await preview.json()).ok, true);
      const pdf = await fetch(`${baseUrl}/api/catalog-pdf/${id}?worksheetSeed=route-smoke&disposition=inline`);
      assert.strictEqual(pdf.status, 200, `${id} PDF route`);
      assert.strictEqual(pdf.headers.get("content-type"), "application/pdf");
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log("Modular Estimate, Solve, and Check checks passed: 2 grades, 6 internal modes, exact module counts and metadata, 240 seeded worksheets, deterministic variation, duplicate control, mirrored PDFs, isolation, and live default routes.");
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
