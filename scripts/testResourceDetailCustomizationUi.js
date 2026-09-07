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

let passedTests = 0;
async function test(name, fn) {
  try {
    await fn();
    passedTests += 1;
    process.stdout.write(".");
  } catch (error) {
    console.error(`\nFAIL: ${name}`);
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

// Execute the actual rendered script with a small DOM/event harness. This keeps
// regression coverage dependency-free; real browser focus/layout checks remain separate.
function mountCustomization(fetchPreview) {
  const vm = require("vm");
  const html = additionHtml();
  const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1]).find((text) => text.includes("YELLOW_BIRD_CUSTOMIZATION"));
  let document;
  class Element {
    constructor(tagName) {
      this.tagName = tagName.toLowerCase();
      this.attributes = {};
      this.children = [];
      this.listeners = {};
      this.dataset = {};
      this.textContent = "";
      this.classList = { toggle: (name, force) => {
        const names = new Set((this.className || "").split(/\s+/).filter(Boolean));
        if (force) names.add(name); else names.delete(name);
        this.className = [...names].join(" ");
      } };
    }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    getAttribute(name) { return this.attributes[name] ?? null; }
    hasAttribute(name) { return name in this.attributes; }
    removeAttribute(name) { delete this.attributes[name]; }
    toggleAttribute(name, force) {
      if (force ?? !this.hasAttribute(name)) this.setAttribute(name, "");
      else this.removeAttribute(name);
    }
    appendChild(child) { child.remove(); child.parentElement = this; this.children.push(child); return child; }
    prepend(child) { child.remove(); child.parentElement = this; this.children.unshift(child); }
    remove() {
      if (this.parentElement) this.parentElement.children = this.parentElement.children.filter((node) => node !== this);
      this.parentElement = null;
    }
    contains(node) { return node === this || this.children.some((child) => child.contains(node)); }
    get isConnected() { return document.body.contains(this); }
    set innerHTML(value) { this.children.forEach((child) => { child.parentElement = null; }); this.children = []; this.textContent = value; }
    get innerHTML() { return this.textContent; }
    matches(selector) {
      if (selector.startsWith("#")) return this.id === selector.slice(1);
      const attr = selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
      if (attr) return this.hasAttribute(attr[1]) && (attr[2] === undefined || this.getAttribute(attr[1]) === attr[2]);
      return this.tagName === selector;
    }
    querySelectorAll(selector) {
      return this.children.flatMap((child) => [
        ...(selector.split(",").some((part) => child.matches(part.trim())) ? [child] : []),
        ...child.querySelectorAll(selector)
      ]);
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    addEventListener(type, listener) { (this.listeners[type] ||= []).push(listener); }
    focus() { document.activeElement = this; }
    async emit(type, details = {}) {
      const event = { target: this, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...details };
      const pending = [];
      for (let node = this; node; node = node.parentElement) {
        (node.listeners[type] || []).forEach((listener) => pending.push(listener(event)));
      }
      await Promise.all(pending);
      return event;
    }
  }
  for (const name of ["id", "href", "src", "data", "type", "name", "value", "className"]) {
    const attr = name === "className" ? "class" : name;
    Object.defineProperty(Element.prototype, name, {
      get() { return this.getAttribute(attr) || ""; },
      set(value) { this.setAttribute(attr, value); }
    });
  }
  for (const name of ["hidden", "disabled", "checked"]) {
    Object.defineProperty(Element.prototype, name, {
      get() { return this.hasAttribute(name); },
      set(value) {
        this.toggleAttribute(name, value);
        if (name === "disabled" && value && document.activeElement === this) document.activeElement = document.body;
      }
    });
  }
  document = {
    body: new Element("body"), activeElement: null,
    createElement: (tag) => new Element(tag),
    getElementById: (id) => document.body.querySelector("#" + id),
    querySelectorAll: (selector) => document.body.querySelectorAll(selector),
    addEventListener: () => {}
  };
  const markup = html.match(/<body>([\s\S]*?)<\/body>/)[1].replace(/<script>[\s\S]*?<\/script>/g, "");
  const stack = [document.body];
  for (const match of markup.matchAll(/<\/?([\w-]+)([^>]*?)>/g)) {
    const [token, tag, attrs] = match;
    if (token.startsWith("</")) { if (stack.at(-1).tagName === tag) stack.pop(); continue; }
    const element = new Element(tag);
    for (const attribute of attrs.matchAll(/([\w-]+)(?:="([^"]*)")?/g)) {
      element.setAttribute(attribute[1], (attribute[2] || "").replace(/&amp;/g, "&"));
    }
    stack.at(-1).appendChild(element);
    if (!["input", "br", "hr", "img", "meta", "link"].includes(tag)) stack.push(element);
  }
  const form = document.getElementById("ybCustomizationForm");
  form.elements = {};
  for (const element of form.querySelectorAll("input, select")) {
    if (element.type === "radio") (form.elements[element.name] ||= []).push(element);
    else form.elements[element.name] = element;
  }
  Object.defineProperty(form.elements.rangeMode, "value", { get() { return this.find((radio) => radio.checked)?.value; } });
  // Native radio groups uncheck their peers when checked programmatically.
  for (const radio of form.elements.rangeMode) {
    Object.defineProperty(radio, "checked", {
      get() { return this.hasAttribute("checked"); },
      set(value) {
        if (value) form.elements.rangeMode.forEach((peer) => peer.removeAttribute("checked"));
        this.toggleAttribute("checked", value);
      }
    });
  }
  vm.runInNewContext(script, { window: {}, document, URLSearchParams, fetch: fetchPreview });
  return {
    document, form,
    get: (id) => document.getElementById(id),
    downloads: () => document.querySelectorAll("a").filter((link) => link.id === "ybDownloadBtn" ||
      (link.className.includes("primary") && (link.href.includes("/api/catalog-pdf/") || link.id === "ybTopDownloadBtn"))),
    async edit(values) {
      for (const [name, value] of Object.entries(values)) {
        if (name === "selectedValues") continue;
        if (name === "rangeMode") {
          const radio = form.elements.rangeMode.find((node) => node.value === value);
          radio.checked = true;
          await radio.emit("change");
        } else {
          const input = form.elements[name];
          if (input.type === "checkbox") input.checked = value; else input.value = String(value);
          await input.emit("input");
        }
      }
      if (values.selectedValues) {
        for (const input of document.getElementById("ybSelectedValuesList").querySelectorAll("input")) {
          input.checked = values.selectedValues.includes(Number(input.value));
          await input.emit("change");
        }
      }
    },
    submit: () => form.emit("submit")
  };
}

async function assertAppliedRequests(ui, baseUrl, expected, expectedItems) {
  const object = ui.get("ybPdfObject");
  assert(object?.isConnected, "matching PDF viewer must be attached");
  const previewUrl = new URL(object.data, baseUrl);
  assert.strictEqual(previewUrl.pathname, `/api/catalog-pdf/${RESOURCE_ID}`);
  assert.strictEqual(ui.downloads().length, 2, "both primary downloads must exist");
  for (const link of ui.downloads()) {
    const downloadUrl = new URL(link.href, baseUrl);
    assert.strictEqual(downloadUrl.origin, previewUrl.origin);
    assert.strictEqual(downloadUrl.pathname, previewUrl.pathname, "download must target the same resource endpoint");
    const downloadOptions = Object.fromEntries(downloadUrl.searchParams);
    const previewOptions = Object.fromEntries(previewUrl.searchParams);
    delete downloadOptions.disposition;
    delete previewOptions.disposition;
    assert.deepStrictEqual(downloadOptions, previewOptions, "top and lower downloads must use the applied preview request");
    const response = await fetch(`${baseUrl}/api/catalog-preview/${RESOURCE_ID}?${downloadUrl.searchParams}`);
    const data = await response.json();
    assert.strictEqual(response.status, 200);
    for (const [key, value] of Object.entries(expected)) assert.deepStrictEqual(data.customization.normalizedOptions[key], value, key);
    const items = data.preview.contentObject.content.items;
    if (expectedItems) assert.deepStrictEqual(items, expectedItems, "download question identity differs from preview");
  }
}

async function assertUnavailable(ui) {
  assert.strictEqual(ui.document.querySelectorAll("object, iframe").length, 0, "no embedded stale PDF may remain actionable");
  assert.strictEqual(ui.get("ybPdfUnavailable").hidden, false);
  assert(ui.get("ybPdfUnavailable").textContent.length > 0);
  for (const id of ["ybTopDownloadBtn", "ybDownloadBtn", "ybTopPreviewBtn"]) {
    const link = ui.get(id);
    assert.strictEqual(link.getAttribute("href"), null, `${id} retains a destination`);
    assert.strictEqual(link.getAttribute("aria-disabled"), "true");
    assert.strictEqual(link.getAttribute("tabindex"), "-1");
    for (const type of ["click", "auxclick"]) assert((await link.emit(type)).defaultPrevented, `${id} ${type} must be blocked`);
    for (const key of ["Enter", " "]) assert((await link.emit("keydown", { key })).defaultPrevented, `${id} ${key} must be blocked`);
  }
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
      "Show the first question completed",
      "Included in the question total.",
      "Include answer key",
      "Update preview",
      "Restore recommended settings"
    ].forEach((text) => assert(html.includes(text), `missing ${text}`));
    assert(!html.includes("A completed example is additional"));
    assert(!html.includes("Added before the student questions"));
    assert(!html.includes("Questions per page"));
    assert.strictEqual((html.match(/<select\b/g) || []).length, 1);
    assert(html.includes('id="ybQuestionTextSize"'));
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
      "Selected numbers outside the active range"
    ].forEach((text) => assert(html.includes(text), `missing selector logic ${text}`));
  });

  const { server, baseUrl } = await startTestServer();

  try {
    await test("text sizes follow applied preview/download state and preserve the question set", async () => {
      let failure = false;
      const ui = mountCustomization(url => failure
        ? Promise.resolve({ok:false,status:500,json:async()=>({ok:false,error:"Test failure"})})
        : fetch(new URL(url,baseUrl)));
      const original = await (await fetch(`${baseUrl}/api/catalog-preview/${RESOURCE_ID}?questionCount=12`)).json();
      await ui.edit({questionCount:12});
      for (const size of [12,14,16]) {
        await ui.edit({questionTextSize:size});
        await assertUnavailable(ui);
        await ui.submit();
        await assertAppliedRequests(ui,baseUrl,{questionCount:12,questionTextSize:size},original.preview.contentObject.content.items);
        assert(ui.get("ybCustomizationSummary").textContent.includes(`Question text: ${size} pt`));
      }
      failure=true;
      await ui.edit({questionTextSize:14,includeAnswerKey:false});
      await ui.submit();
      await assertUnavailable(ui);
      assert.strictEqual(ui.form.elements.questionTextSize.value,"14");
      failure=false;
      await ui.submit();
      await assertAppliedRequests(ui,baseUrl,{questionTextSize:14,includeAnswerKey:false});
      for (const endpoint of ["catalog-preview","catalog-pdf"]) {
        const response=await fetch(`${baseUrl}/api/${endpoint}/${RESOURCE_ID}?questionTextSize=13`);
        assert.strictEqual(response.status,400);
        assert.strictEqual((await response.json()).ok,false);
      }
      await ui.edit({questionTextSize:13});
      await ui.submit();
      await assertUnavailable(ui);
      assert(ui.get("ybQuestionTextSizeError").textContent.includes("Question text size"));
      await ui.get("ybRestoreBtn").emit("click");
      await ui.submit();
      await assertAppliedRequests(ui,baseUrl,{questionTextSize:12,includeAnswerKey:true,questionCount:60});
    });

    await test("impossible selections are rejected by shared validation in preview and PDF", async () => {
      for (const [query, code, field, message] of [
        ["minimumValue=10&maximumValue=20&selectedValues=15", "selected_values_infeasible", "selectedValues", "15 cannot be used"],
        ["minimumValue=10&maximumValue=20&selectedValues=10,15", "selected_values_infeasible", "selectedValues", "15 cannot be used"],
        ["minA=10&maxTotal=20&onlyNumbers=15,18", "selected_values_infeasible", "selectedValues", "15, 18 cannot be used"],
        ["minimumValue=12&maximumValue=20", "empty_addition_fact_pool", "minimumValue", "Lower the lowest number or raise the highest number"],
        ["minimumValue=10&maximumValue=20&selectedValues=9", "selected_values_outside_range", "selectedValues", "inside the selected range"]
      ]) {
        let expectedErrors;
        for (const endpoint of ["catalog-preview", "catalog-pdf"]) {
          const response = await fetch(`${baseUrl}/api/${endpoint}/${RESOURCE_ID}?${query}`);
          assert.strictEqual(response.status, 400);
          assert(response.headers.get("content-type").includes("application/json"));
          const data = await response.json();
          assert.strictEqual(data.ok, false);
          assert.strictEqual(data.preview, undefined, "invalid request must not return default or partial content");
          if (endpoint === "catalog-preview") {
            expectedErrors = data.customization.errors;
            assert(expectedErrors.some(error => error.code === code && error.field === field && error.message.includes(message)));
          } else {
            // The existing PDF error envelope exposes the first message;
            // preview exposes structured field errors for the website form.
            assert.strictEqual(data.error, expectedErrors[0].message);
          }
        }
      }
    });

    await test("impossible emphasis preserves drafts and recovers with truthful applied wording", async () => {
      const ui = mountCustomization(url => fetch(new URL(url, baseUrl)));
      await ui.edit({ questionCount: 1, selectedValues: [7, 8] });
      await ui.submit();
      await assertAppliedRequests(ui, baseUrl, { questionCount: 1, selectedValues: [7, 8] });
      assert(ui.get("ybCustomizationSummary").textContent.includes("Requested emphasis: 7, 8"));
      assert(!additionHtml().includes('"Practising "'));
      assert(additionHtml().includes("individual selections are not guaranteed to appear"));
      await ui.edit({ selectedValues: [10, 15], rangeMode: "custom", minimumValue: 10, questionCount: 12 });
      await ui.submit();
      await assertUnavailable(ui);
      assert.strictEqual(ui.document.activeElement, ui.get("ybErrorSummary"));
      assert.strictEqual(ui.get("ybSelectedValuesButton").getAttribute("aria-invalid"), "true");
      assert(ui.get("ybSelectedValuesError").textContent.includes("15 cannot be used"));
      assert.strictEqual(ui.get("ybSelectedValuesSummary").textContent, "10, 15");
      assert(ui.get("ybCustomizationSummary").textContent.startsWith("Last applied worksheet (preview unavailable):"));
      assert(ui.get("ybCustomizationSummary").textContent.includes("Requested emphasis: 7, 8"));
      await ui.edit({ selectedValues: [10] });
      await ui.submit();
      await assertAppliedRequests(ui, baseUrl, { questionCount: 12, minimumValue: 10, maximumValue: 20, selectedValues: [10] });
      assert(ui.get("ybCustomizationSummary").textContent.includes("Requested emphasis: 10"));
    });

    await test("range edits retain selected numbers for explicit teacher correction", async () => {
      const ui = mountCustomization(url => fetch(new URL(url, baseUrl)));
      await ui.edit({ selectedValues: [7, 15] });
      await ui.edit({ rangeMode: "custom", maximumValue: 10 });
      assert.strictEqual(ui.get("ybSelectedValuesSummary").textContent, "7, 15");
      const fifteen = ui.get("ybSelectedValuesList").querySelectorAll("input").find(input => input.value === "15");
      assert.strictEqual(fifteen.checked, true);
      assert.strictEqual(ui.get("ybSelectionNotice").hidden, false);
      await ui.submit();
      await assertUnavailable(ui);
      assert(ui.get("ybSelectedValuesError").textContent.includes("inside the selected range"));
      await ui.edit({ selectedValues: [7] });
      assert.strictEqual(ui.get("ybSelectionNotice").hidden, true);
      await ui.submit();
      await assertAppliedRequests(ui, baseUrl, { maximumValue: 10, selectedValues: [7] });
    });

    await test("applied customization updates both primary download destinations", async () => {
      let applied;
      const ui = mountCustomization(async (url) => {
        const response = await fetch(new URL(url, baseUrl));
        applied = await response.clone().json();
        return response;
      });
      await ui.edit({ questionCount: 24, rangeMode: "custom", maximumValue: 10, includeAnswerKey: false });
      await ui.submit();
      await assertAppliedRequests(ui, baseUrl, { questionCount: 24, maximumValue: 10, includeAnswerKey: false }, applied.preview.contentObject.content.items);
    });

    await test("default actions and summary retain approved default content", async () => {
      const ui = mountCustomization((url) => fetch(new URL(url, baseUrl)));
      const baseline = await (await fetch(`${baseUrl}/api/catalog-preview/${RESOURCE_ID}`)).json();
      await assertAppliedRequests(ui, baseUrl, { questionCount: 60, includeExample: false, includeAnswerKey: true }, baseline.preview.contentObject.content.items);
      assert(ui.get("ybCustomizationSummary").textContent.includes("60 numbered questions; 0 completed; 60 left to solve."));
    });

    await test("completed Q1 summary and both downloads use generated multipage truth", async () => {
      let applied;
      const ui = mountCustomization(async (url) => {
        const response = await fetch(new URL(url, baseUrl));
        applied = await response.clone().json();
        return response;
      });
      await ui.edit({ questionCount: 75, selectedValues: [7, 8], includeExample: true });
      await ui.submit();
      const items = applied.preview.contentObject.content.items;
      assert.strictEqual(items.length, 75);
      assert.strictEqual(items.filter((item) => item.isExample).length, 1);
      assert.strictEqual(items[0].id, 1);
      assert(ui.get("ybCustomizationSummary").textContent.includes("75 numbered questions; 1 completed; 74 left to solve."));
      await assertAppliedRequests(ui, baseUrl, { questionCount: 75, selectedValues: [7, 8], includeExample: true, includeAnswerKey: true }, items);
      const inline = new URL(ui.get("ybPdfObject").data, baseUrl);
      assert.strictEqual(new URL(ui.get("ybTopPreviewBtn").href, baseUrl).search, inline.search);
      assert.strictEqual(new URL(ui.get("ybPdfFrame").src, baseUrl).search, inline.search);
      assert.strictEqual(new URL(ui.get("ybPdfObject").querySelector("a").href, baseUrl).search, inline.search);
    });

    await test("stale and updating states remove PDF actions and preserve input focus", async () => {
      let release;
      const ui = mountCustomization((url) => new Promise((resolve) => {
        release = async () => resolve(await fetch(new URL(url, baseUrl)));
      }));
      ui.form.elements.questionCount.focus();
      await ui.edit({ questionCount: 24 });
      assert.strictEqual(ui.document.activeElement, ui.form.elements.questionCount);
      await assertUnavailable(ui);
      assert(ui.get("ybCustomizationSummary").textContent.startsWith("Last applied worksheet (preview unavailable): 60"));
      ui.get("ybUpdatePreviewBtn").focus();
      const updating = ui.submit();
      assert.strictEqual(ui.get("ybPreviewStateLabel").dataset.state, "updating");
      assert.strictEqual(ui.get("ybUpdatePreviewBtn").disabled, true);
      await assertUnavailable(ui);
      await release();
      await updating;
      assert.strictEqual(ui.document.activeElement, ui.get("ybUpdatePreviewBtn"), "successful keyboard update must retain a useful focus target");
      await assertAppliedRequests(ui, baseUrl, { questionCount: 24 });
      ui.get("ybPdfFrame").focus();
      await ui.edit({ questionCount: 25 });
      assert.strictEqual(ui.document.activeElement, ui.get("ybPdfUnavailable"), "detached viewer focus must move to its state message");
    });

    await test("invalid settings and an empty fact pool stay blocked until corrected", async () => {
      const ui = mountCustomization((url) => fetch(new URL(url, baseUrl)));
      await ui.edit({ questionCount: 0 });
      await ui.submit();
      await assertUnavailable(ui);
      assert.strictEqual(ui.form.elements.questionCount.value, "0");
      assert.strictEqual(ui.get("ybErrorSummary").hidden, false);
      assert.strictEqual(ui.document.activeElement, ui.get("ybErrorSummary"));
      await ui.edit({ questionCount: 2, rangeMode: "custom", minimumValue: 30, maximumValue: 30 });
      await ui.submit();
      await assertUnavailable(ui);
      assert.strictEqual(ui.form.elements.minimumValue.value, "30");
      assert.strictEqual(ui.form.elements.maximumValue.value, "30");
      assert.strictEqual(ui.get("ybErrorSummary").hidden, false);
      assert(ui.get("ybMinimumValueError").textContent.includes("Lower the lowest number or raise the highest number"));
      assert.strictEqual(ui.form.elements.minimumValue.getAttribute("aria-invalid"), "true");
      await ui.get("ybRestoreBtn").emit("click");
      await assertAppliedRequests(ui, baseUrl, { questionCount: 60, minimumValue: 0, maximumValue: 20 });
      assert.strictEqual(ui.get("ybErrorSummary").hidden, true);
    });

    await test("generation and transport failures retain edits and allow retry/reset", async () => {
      let failure = "server";
      const ui = mountCustomization((url) => {
        if (failure === "server") return Promise.resolve({ ok: false, status: 500, json: async () => ({ ok: false, error: "Test generation failure" }) });
        if (failure === "network") return Promise.reject(new Error("Test transport failure"));
        return fetch(new URL(url, baseUrl));
      });
      await ui.edit({ questionCount: 24, includeAnswerKey: false });
      await ui.submit();
      assert.strictEqual(ui.get("ybPreviewStateLabel").dataset.state, "generationError");
      await assertUnavailable(ui);
      assert.strictEqual(ui.form.elements.questionCount.value, "24");
      failure = "network";
      await ui.submit();
      await assertUnavailable(ui);
      assert.strictEqual(ui.get("ybUpdatePreviewBtn").disabled, false);
      failure = null;
      await ui.submit();
      await assertAppliedRequests(ui, baseUrl, { questionCount: 24, includeAnswerKey: false });
      await ui.get("ybRestoreBtn").emit("click");
      await assertUnavailable(ui); // Recommended settings differ from last applied custom worksheet.
      await ui.submit();
      await assertAppliedRequests(ui, baseUrl, { questionCount: 60, includeAnswerKey: true });
    });

    await test("responses after edits cannot restore stale content or controls", async () => {
      const pending = [];
      const ui = mountCustomization((url) => new Promise((resolve, reject) => pending.push({ url, resolve, reject })));
      await ui.edit({ questionCount: 24 });
      const older = ui.submit();
      await ui.edit({ questionCount: 75, includeExample: true });
      await assertUnavailable(ui);
      const newer = ui.submit();
      pending[1].resolve(await fetch(new URL(pending[1].url, baseUrl)));
      await newer;
      const appliedUrl = ui.get("ybPdfObject").data;
      pending[0].resolve(await fetch(new URL(pending[0].url, baseUrl)));
      await older;
      assert.strictEqual(ui.get("ybPdfObject").data, appliedUrl);
      await assertAppliedRequests(ui, baseUrl, { questionCount: 75, includeExample: true });

      await ui.edit({ questionCount: 30 });
      const outdated = ui.submit();
      await ui.edit({ questionCount: 31 });
      pending[2].resolve(await fetch(new URL(pending[2].url, baseUrl)));
      await outdated;
      await assertUnavailable(ui);
      assert.strictEqual(ui.form.elements.questionCount.value, "31");
      assert.strictEqual(ui.get("ybPreviewStateLabel").dataset.state, "stale");

      const failing = ui.submit();
      await ui.edit({ questionCount: 75 }); // Return to the last successful settings while a request is pending.
      pending[3].reject(new Error("Obsolete failure"));
      await failing;
      await assertAppliedRequests(ui, baseUrl, { questionCount: 75, includeExample: true });
      assert.strictEqual(ui.get("ybErrorSummary").hidden, true);
    });

    await test("an older response cannot enable controls while a newer update is pending", async () => {
      const pending = [];
      const ui = mountCustomization((url) => new Promise((resolve) => pending.push({ url, resolve })));
      await ui.edit({ questionCount: 24 });
      const older = ui.submit();
      await ui.edit({ questionCount: 75 });
      const newer = ui.submit();
      pending[0].resolve(await fetch(new URL(pending[0].url, baseUrl)));
      await older;
      await assertUnavailable(ui);
      assert.strictEqual(ui.get("ybUpdatePreviewBtn").disabled, true);
      assert.strictEqual(ui.get("ybPreviewStateLabel").dataset.state, "updating");
      pending[1].resolve(await fetch(new URL(pending[1].url, baseUrl)));
      await newer;
      await assertAppliedRequests(ui, baseUrl, { questionCount: 75 });
    });

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

  console.log(`\nResource Detail customization UI tests passed: ${passedTests} cases.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
