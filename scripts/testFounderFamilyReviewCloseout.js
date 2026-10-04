"use strict";

const assert = require("assert");
const express = require("express");
const libraryRoutes = require("../routes/libraryRoutes");
const worksheetPreviewRoutes = require("../routes/worksheetPreviewRoutes");
const worksheetPdfRoutes = require("../routes/worksheetPdfRoutes");
const worksheetCatalogRoutes = require("../routes/worksheetCatalogRoutes");
const { filterWorksheetCatalog } = require("../services/worksheetCatalogService");

const REPRESENTATIVES = [
  ["worksheet", "g1_addition_facts_within_20"],
  ["quick_check", "g4_pattern_rule_quick_check"],
  ["exit_ticket", "g2_missing_addends_within_20_exit_ticket"]
];

function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.get("/browse", (req, res) => res.status(200).send("Browse Library"));
  app.use(worksheetPreviewRoutes);
  app.use(worksheetPdfRoutes);
  app.use(worksheetCatalogRoutes);
  app.use("/", libraryRoutes);
  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => {
      resolve({ server, baseUrl: `http://127.0.0.1:${server.address().port}` });
    });
  });
}

async function run() {
  const ready = filterWorksheetCatalog({ status: "ready" });
  assert.strictEqual(ready.length, 106);
  const counts = ready.reduce((result, item) => {
    const type = item.resourceType || "worksheet";
    result[type] = (result[type] || 0) + 1;
    return result;
  }, {});
  assert.deepStrictEqual(counts, { worksheet: 88, quick_check: 11, exit_ticket: 7 });

  const { server, baseUrl } = await startServer();
  try {
    const browse = await fetch(`${baseUrl}/browse`);
    assert.strictEqual(browse.status, 200);

    const catalogResponse = await fetch(`${baseUrl}/api/worksheet-catalog?status=ready`);
    const catalog = await catalogResponse.json();
    assert.strictEqual(catalogResponse.status, 200);
    assert.strictEqual(catalog.total, 106);

    for (const [type, id] of REPRESENTATIVES) {
      const detail = await fetch(`${baseUrl}/resource/worksheet/${id}`);
      assert.strictEqual(detail.status, 200, `${type} detail failed`);
      const detailHtml = await detail.text();
      assert(detailHtml.includes(`/api/catalog-pdf/${id}`));

      const preview = await fetch(`${baseUrl}/api/catalog-preview/${id}?worksheetSeed=founder-closeout`);
      assert.strictEqual(preview.status, 200, `${type} preview failed`);
      const previewJson = await preview.json();
      assert.strictEqual(previewJson.ok, true);

      const pdf = await fetch(`${baseUrl}/api/catalog-pdf/${id}?worksheetSeed=founder-closeout&disposition=inline`);
      assert.strictEqual(pdf.status, 200, `${type} PDF failed`);
      assert.strictEqual(pdf.headers.get("content-type"), "application/pdf");
      const bytes = Buffer.from(await pdf.arrayBuffer());
      assert.strictEqual(bytes.subarray(0, 4).toString(), "%PDF");
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log("Founder Family Review closeout smoke test passed.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
