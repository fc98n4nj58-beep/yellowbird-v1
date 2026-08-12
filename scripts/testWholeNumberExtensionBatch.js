const assert = require("assert");
const { Writable } = require("stream");
const express = require("express");
const libraryRoutes = require("../routes/libraryRoutes");
const worksheetPreviewRoutes = require("../routes/worksheetPreviewRoutes");
const worksheetPdfRoutes = require("../routes/worksheetPdfRoutes");
const worksheetCatalogRoutes = require("../routes/worksheetCatalogRoutes");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF, buildAnswerKeyItems } = require("../renderers/pdfRenderer");
const { roundToPlace } = require("../engine/problemGenerators/roundWholeNumbers");

const SPECS = Object.freeze({
  g2_even_and_odd_numbers: { places: null, max: 200, footer: "Grade 2 • Math • Number Sense" },
  g3_round_whole_numbers: { places: [10, 100], max: 1000, footer: "Grade 3 • Math • Place Value" },
  g4_round_whole_numbers: { places: [10, 100, 1000], max: 10000, footer: "Grade 4 • Math • Place Value" }
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
      options: { filename: "whole-number-extension-test.pdf", includeAnswerKey }
    });
  });
}

function pages(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function truth(runtime) {
  return runtime.normalizedContentObject.content.items.map(({
    prompt, answer, value, interval, taskMode, taskAction, responseTarget,
    responseValues, leftValue, rightValue, duplicateSignature
  }) => ({
    prompt, answer, value, interval, taskMode, taskAction, responseTarget,
    responseValues, leftValue, rightValue, duplicateSignature
  }));
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
  for (const [id, spec] of Object.entries(SPECS)) {
    const first = buildCatalogWorksheetRuntime(id, { worksheetSeed: `${id}-same` });
    const repeat = buildCatalogWorksheetRuntime(id, { worksheetSeed: `${id}-same` });
    const different = buildCatalogWorksheetRuntime(id, { worksheetSeed: `${id}-different` });
    const items = first.normalizedContentObject.content.items;
    assert.strictEqual(first.item.status, "ready");
    assert.strictEqual(items.length, 12);
    assert.strictEqual(first.layout.template.columns, 2);
    assert.strictEqual(first.layout.template.maxProblemsPerPage, 12);
    assert.strictEqual(first.layout.header.subtitle, "");
    assert(["parity", "rounding"].includes(first.layout.display.wholeNumberFamilyLayout));
    assert.strictEqual(first.contentObject.meta.curriculum.footerText, spec.footer);
    assert.deepStrictEqual(truth(first), truth(repeat), `${id} same-seed mismatch`);
    assert.notDeepStrictEqual(truth(first), truth(different), `${id} different seed did not vary`);
    assert.strictEqual(new Set(items.map((item) => item.duplicateSignature)).size, 12);
    assert.strictEqual(buildAnswerKeyItems(items).length, 12);

    if (spec.places) {
      const counts = Object.fromEntries(spec.places.map((place) => [place, 0]));
      items.forEach((item) => {
        assert(item.value >= 0 && item.value <= spec.max);
        assert(spec.places.includes(item.interval));
        assert.strictEqual(item.answer, roundToPlace(item.value, item.interval));
        assert.strictEqual(item.responseTarget, "numeric_line");
        assert.strictEqual(item.taskMode, `nearest_${item.interval === 10 ? "ten" : item.interval === 100 ? "hundred" : "thousand"}`);
        counts[item.interval] += 1;
      });
      spec.places.forEach((place) => assert.strictEqual(counts[place], 12 / spec.places.length));
      assert(spec.places.every((place) => items.some((item) => item.interval === place && item.value % place === place / 2)));
    } else {
      assert.deepStrictEqual(items.map((item) => item.taskMode), [
        "classify", "classify", "classify", "classify", "classify", "classify",
        "select", "select", "select", "select", "rule", "rule"
      ]);
      items.forEach((item) => {
        if (item.taskMode === "classify") {
          assert.strictEqual(item.answer, item.value % 2 === 0 ? "even" : "odd");
          assert.deepStrictEqual(item.responseValues, ["Even", "Odd"]);
          assert.strictEqual(item.responseTarget, "parity_choice");
        }
        if (item.taskMode === "select") {
          const values = [item.leftValue, item.rightValue];
          const wantsEven = item.taskAction === "select_even";
          assert(values.includes(item.answer));
          assert.strictEqual(item.answer % 2 === 0, wantsEven);
          assert.strictEqual(item.responseTarget, "number_choice");
        }
        if (item.taskMode === "rule") {
          assert.strictEqual(item.responseTarget, "short_word");
        }
      });
    }

    assert.strictEqual(pages(await render(first, false)), 1, `${id} student pages`);
    assert.strictEqual(pages(await render(first, true)), 2, `${id} student + key pages`);
  }

  for (const [id, places] of [["g3_round_whole_numbers", [10, 100]], ["g4_round_whole_numbers", [10, 100, 1000]]]) {
    const boundary = buildCatalogWorksheetRuntime(id, { worksheetSeed: `${id}-boundary`, boundaryCasesOnly: true });
    boundary.normalizedContentObject.content.items.forEach((item) => {
      assert.strictEqual(item.value % item.interval, item.interval / 2);
      assert.strictEqual(item.answer, roundToPlace(item.value, item.interval));
      assert.strictEqual(item.taskAction, "midpoint");
    });
    assert.deepStrictEqual([...new Set(boundary.normalizedContentObject.content.items.map((item) => item.interval))].sort((a, b) => a - b), places);
  }

  const { server, baseUrl } = await startServer();
  try {
    for (const id of Object.keys(SPECS)) {
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

  console.log("Whole-number extension checks passed: structured sections, 3 resources, 12 questions each, exact truth, deterministic generation, balanced rounding, midpoint coverage, deliberate response targets, 1+1 PDFs, and live routes.");
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
