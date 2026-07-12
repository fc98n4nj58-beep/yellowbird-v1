const assert = require("assert");
const express = require("express");

const libraryRoutes = require("../routes/libraryRoutes");
const worksheetPreviewRoutes = require("../routes/worksheetPreviewRoutes");
const worksheetPdfRoutes = require("../routes/worksheetPdfRoutes");
const worksheetCatalogRoutes = require("../routes/worksheetCatalogRoutes");
const {
  getWorksheetCatalogById
} = require("../services/worksheetCatalogService");

const RESOURCE_ID = "g1_addition_facts_within_20";
const UNSUPPORTED_RESOURCE_ID = "g1_subtraction_facts_within_20";

function test(name, fn) {
  try {
    const result = fn();
    if (result && typeof result.then === "function") {
      return result.then(() => process.stdout.write("."));
    }
    process.stdout.write(".");
    return Promise.resolve();
  } catch (error) {
    process.stdout.write("F\n");
    console.error(`\n${name}`);
    throw error;
  }
}

function startTestServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(worksheetPreviewRoutes);
  app.use(worksheetPdfRoutes);
  app.use(worksheetCatalogRoutes);
  app.use("/", libraryRoutes);

  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${port}`
      });
    });
  });
}

function additionHtml() {
  return libraryRoutes._test.renderWorksheetDetailPage(
    getWorksheetCatalogById(RESOURCE_ID)
  );
}

function unsupportedHtml() {
  return libraryRoutes._test.renderWorksheetDetailPage(
    getWorksheetCatalogById(UNSUPPORTED_RESOURCE_ID)
  );
}

async function run() {
  await test("only Addition Facts receives customization metadata", () => {
    assert(libraryRoutes._test.buildWorksheetCustomizationModel(getWorksheetCatalogById(RESOURCE_ID)));
    assert.strictEqual(
      libraryRoutes._test.buildWorksheetCustomizationModel(getWorksheetCatalogById(UNSUPPORTED_RESOURCE_ID)),
      null
    );
  });

  await test("Addition Facts detail page renders public controls", () => {
    const html = additionHtml();
    [
      "Customize this worksheet",
      "Ready-to-use worksheet",
      "Download worksheet PDF",
      "Number of questions",
      "Number range",
      "Numbers to practise",
      "Choose numbers…",
      "Show one completed example",
      "Include answer key",
      "Update preview",
      "Restore recommended settings"
    ].forEach((text) => assert(html.includes(text), `missing ${text}`));
    assert(!html.includes("Questions per page"));
    assert(!html.includes("<select"));
  });

  await test("unsupported family detail page shows no customization UI", () => {
    const html = unsupportedHtml();
    assert(!html.includes("Customize this worksheet"));
    assert(!html.includes("ybCustomizationPanel"));
    assert(html.includes("Download PDF"));
  });

  await test("panel starts closed without stale preview copy", () => {
    const html = additionHtml();
    assert(html.includes('id="ybCustomizationPanel" hidden'));
    assert(html.includes('aria-expanded="false"'));
    assert(html.includes("The approved worksheet is ready to preview, download, and print."));
  });

  await test("stale, updating, customized, validation, and generation states are present", () => {
    const html = additionHtml();
    [
      "Preview not updated",
      "Updating preview…",
      "Customized preview",
      "We could not update this preview",
      "Your selections have changed. Update the preview before downloading.",
      "Your selections are still here. Try updating the preview again."
    ].forEach((text) => assert(html.includes(text), `missing state copy ${text}`));
  });

  await test("accessibility structure is present", () => {
    const html = additionHtml();
    [
      "fieldset",
      "legend",
      "aria-controls=\"ybCustomizationPanel\"",
      "aria-controls=\"ybSelectedValuesPanel\"",
      "aria-expanded=\"false\"",
      "aria-live",
      "aria-describedby=\"ybQuestionCountHelp ybQuestionCountError\"",
      "role=\"alert\"",
      "aria-disabled",
      "disabled = true",
      "selectedPanel.hidden"
    ].forEach((text) => assert(html.includes(text), `missing accessibility marker ${text}`));
  });

  await test("mobile layout smoke styles are present", () => {
    const fs = require("fs");
    const css = fs.readFileSync("public/styles/site.css", "utf8");
    assert(css.includes("@media (max-width: 900px)"));
    assert(css.includes(".detail-pdf-shell"));
    assert(css.includes(".customization-actions .btn"));
    assert(css.includes(".control-row"));
    assert(css.includes("text-align: right"));
    assert(css.includes("grid-template-columns: 1fr"));
  });

  await test("range locking and custom range restoration logic is present", () => {
    const html = additionHtml();
    [
      "function suggestedRange()",
      "let lastCustomRange",
      "storeCustomRangeIfValid",
      "form.elements.minimumValue.disabled = true",
      "form.elements.maximumValue.disabled = true",
      "form.elements.minimumValue.disabled = false",
      "form.elements.maximumValue.disabled = false",
      "form.elements.minimumValue.value = String(suggested.minimumValue)",
      "form.elements.maximumValue.value = String(suggested.maximumValue)"
    ].forEach((text) => assert(html.includes(text), `missing range state logic ${text}`));
  });

  await test("numbers selector opens, closes, and summarizes accessibly", () => {
    const html = additionHtml();
    [
      "ybSelectedValuesButton",
      "ybSelectedValuesPanel",
      "ybSelectedValuesList",
      "setSelectorOpen",
      "updateSelectedSummary",
      "selectedButton.addEventListener(\"keydown\"",
      "selectedList.addEventListener(\"change\"",
      "Numbers outside the active range were removed"
    ].forEach((text) => assert(html.includes(text), `missing selector logic ${text}`));
  });

  const { server, baseUrl } = await startTestServer();

  try {
    await test("ready-to-use detail route renders default download", async () => {
      const res = await fetch(`${baseUrl}/resource/worksheet/${RESOURCE_ID}`);
      const html = await res.text();
      assert.strictEqual(res.status, 200);
      assert(html.includes(`/api/catalog-pdf/${RESOURCE_ID}?disposition=inline`));
      assert(html.includes("Download worksheet PDF"));
    });

    await test("update preview endpoint returns normalized options and option hash", async () => {
      const params = new URLSearchParams({
        questionCount: "40",
        minimumValue: "0",
        maximumValue: "30",
        selectedValues: "7,8",
        includeExample: "true",
        includeAnswerKey: "false",
        answers: "0",
        worksheetSeed: "ui-test"
      });
      const res = await fetch(`${baseUrl}/api/catalog-preview/${RESOURCE_ID}?${params}`);
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.ok, true);
      assert.strictEqual(data.customization.ok, true);
      assert.strictEqual(data.customization.normalizedOptions.questionCount, 40);
      assert.strictEqual(data.customization.normalizedOptions.maximumValue, 30);
      assert.deepStrictEqual(data.customization.normalizedOptions.selectedValues, [7, 8]);
      assert.strictEqual(data.customization.normalizedOptions.includeAnswerKey, false);
      assert(data.customization.optionHash);
      assert(!data.customization.diagnostics);
    });

    await test("invalid range and selected values return public field errors", async () => {
      const params = new URLSearchParams({
        questionCount: "0",
        minimumValue: "10",
        maximumValue: "5",
        selectedValues: "4,8"
      });
      const res = await fetch(`${baseUrl}/api/catalog-preview/${RESOURCE_ID}?${params}`);
      const data = await res.json();
      assert.strictEqual(res.status, 400);
      assert.strictEqual(data.ok, false);
      assert(data.customization.errors.length >= 2);
      assert(data.customization.errors.some((error) => error.field === "questionCount"));
      assert(data.customization.errors.some((error) => error.code === "minimum_exceeds_maximum"));
      assert(!JSON.stringify(data).includes("diagnostics"));
      assert(!JSON.stringify(data).includes("stack"));
    });

    await test("selected values outside active range are rejected", async () => {
      const params = new URLSearchParams({
        minimumValue: "5",
        maximumValue: "10",
        selectedValues: "4,8"
      });
      const res = await fetch(`${baseUrl}/api/catalog-preview/${RESOURCE_ID}?${params}`);
      const data = await res.json();
      assert.strictEqual(res.status, 400);
      assert(data.customization.errors.some((error) => error.code === "selected_values_outside_range"));
    });

    await test("customized PDF endpoint accepts the same successful payload", async () => {
      const params = new URLSearchParams({
        questionCount: "12",
        minimumValue: "0",
        maximumValue: "30",
        selectedValues: "7,8",
        includeExample: "true",
        includeAnswerKey: "false",
        answers: "0",
        worksheetSeed: "ui-pdf",
        disposition: "inline"
      });
      const res = await fetch(`${baseUrl}/api/catalog-pdf/${RESOURCE_ID}?${params}`);
      assert.strictEqual(res.status, 200);
      assert(String(res.headers.get("content-type") || "").includes("application/pdf"));
      const bytes = await res.arrayBuffer();
      assert(bytes.byteLength > 1000);
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log("\nResource Detail customization UI tests passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
