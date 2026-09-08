const express = require("express");
const router = express.Router();

const {
  listResources,
  getResourceBySlug,
  getRelatedResources,
  getAvailableFilters
} = require("../services/resourceLibraryService");
const { getWorksheetCatalogById } = require("../services/worksheetCatalogService");
const {
  variables,
  getCustomizationFamilyForResource
} = require("../config/worksheetCustomization");
const {
  normalizeWorksheetCustomization
} = require("../services/worksheetCustomizationService");

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function renderBadge(text) {
  return `<span class="badge">${escapeHtml(text)}</span>`;
}

const friendlyWorksheetLabels = {
  addition_subtraction_facts: "Addition & subtraction facts",
  addition_strategies: "Addition strategies",
  subtraction_strategies: "Subtraction strategies",
  multiplication_facts: "Multiplication facts",
  division_facts: "Division facts",
  skip_counting: "Skip counting",
  place_value: "Place value",
  base_ten_blocks: "Base ten blocks",
  number_lines: "Number lines",
  ten_frames: "Ten frames",
  fractions: "Fractions",
  data_graphing: "Data interpretation",
  graphing: "Data interpretation",
  word_problems: "Word problems",
  fact_fluency: "Fact fluency",
  problem_solving: "Word problems",
  relational_thinking: "Number relationships",
  daily_review: "Skip counting",
  visual_models: "Visual models",
  visual_model: "Visual model",
  representation: "Number forms",
  place_value_representation: "Place value practice",
  fluency_grid: "Fluency practice",
  equation_practice: "Equation practice",
  matching: "Matching",
  model_interpretation: "Model interpretation",
  quick_check: "Quick Check",
  exit_ticket: "Exit Ticket",
  related_subtraction: "Subtraction facts",
  missing_addend: "Missing addends",
  missing_factor: "Missing factors",
  fact_family: "Fact relationships",
  compare_numbers: "Compare numbers",
  number_line_identify: "Number line practice",
  number_word_match: "Number word match",
  expanded_form: "Expanded form",
  standard_form: "Standard form",
  skip_counting: "Skip counting",
  complete_graph: "Text-based graph questions",
  read_graph: "Text-based graph questions",
  graph_questions: "Text-based graph questions",
  interpret_data: "Data interpretation",
  match_data_to_graph: "Text-based graph questions",
  equal_groups: "Equal groups",
  array: "Arrays",
  math_addition_basic: "Addition facts",
  "math.addition.basic": "Addition facts",
  math_subtraction_nonnegative: "Subtraction facts",
  "math.subtraction.nonnegative": "Subtraction facts",
  math_multiplication_basic: "Multiplication facts",
  "math.multiplication.basic": "Multiplication facts",
  math_division_integer: "Division facts",
  "math.division.integer": "Division facts",
  graph_reading: "Text-based graph questions",
  "math.data.graph_reading": "Text-based graph questions"
};

function titleCaseLabel(value = "") {
  return String(value || "")
    .replace(/[_\.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function friendlyWorksheetLabel(value = "") {
  const key = String(value || "").trim();
  return friendlyWorksheetLabels[key] || friendlyWorksheetLabels[key.toLowerCase()] || titleCaseLabel(key);
}

function worksheetDomainLabel(item) {
  const domain = String(item.domain || "");
  if (/data|graph/i.test(domain)) return "Data interpretation";
  return domain;
}

function worksheetPracticeFocus(item) {
  if (item.resourceType === "quick_check" || item.resourceType === "exit_ticket") {
    return item.teacherNote || item.description || "Short formative skill check";
  }

  return friendlyWorksheetLabel(item.skillKey || item.worksheetFamily || "");
}

function worksheetQuestionStyle(item) {
  const activityTypes = Array.isArray(item.activityTypes) ? item.activityTypes : [];
  return activityTypes.map(friendlyWorksheetLabel).filter(Boolean).join(", ") || "—";
}

function worksheetTypeLabel(item) {
  if (item.resourceType === "quick_check") {
    return "Quick Check";
  }

  if (item.resourceType === "exit_ticket") {
    return "Exit Ticket";
  }

  const activityTypes = Array.isArray(item.activityTypes) ? item.activityTypes : [];
  if (item.worksheetFamily === "relational_thinking") {
    if (activityTypes.includes("fact_family") || String(item.skillKey || "").includes("multiplication")) {
      return "Fact relationships";
    }
    return "Number relationships";
  }

  if (item.worksheetFamily === "representation" && item.domain === "Place Value") {
    return "Number forms";
  }

  if (item.worksheetFamily === "daily_review" && activityTypes.includes("skip_counting")) {
    return "Skip counting";
  }

  return friendlyWorksheetLabel(item.worksheetFamily || "");
}

function worksheetResourceTypeNote(item) {
  if (item.resourceType === "quick_check") {
    return "Short focused check for review, warm-up, small-group, or homeschool use.";
  }

  if (item.resourceType === "exit_ticket") {
    return "Cut-apart lesson-close formative check for a quick instructional signal.";
  }

  return "Printable worksheet for focused classroom practice.";
}

function worksheetFormatLabel(item) {
  if (item.formatLabel) {
    return item.formatLabel;
  }

  if (item.templateId === "representation" && item.domain === "Place Value") {
    return "Place value practice";
  }

  return friendlyWorksheetLabel(item.templateId || "");
}

function getPrimaryAction(resource) {
  const type = String(resource.resourceType || "").toLowerCase();
  const url = resource.downloadUrl || "#";

  if (url.endsWith(".pdf")) {
    return {
      label: "Download PDF",
      href: url
    };
  }

  if (type === "worksheet" || url === "/worksheet") {
    return {
      label: "Open Worksheet Generator",
      href: url
    };
  }

  if (type === "unit" || url === "/units") {
    return {
      label: "Open Unit Builder",
      href: url
    };
  }

  if (type === "lesson") {
    return {
      label: "Open Lesson Resource",
      href: url
    };
  }

  return {
    label: "Open Resource",
    href: url
  };
}

function renderPreviewSection(resource) {
  const previews = Array.isArray(resource.previewImages) ? resource.previewImages : [];

  if (previews.length) {
    const items = previews
      .map(
        (src, index) => `
          <div class="preview-thumb">
            <img src="${escapeHtml(src)}" alt="${escapeHtml(resource.title)} preview ${index + 1}" />
          </div>
        `
      )
      .join("");

    return `
      <div class="resource-preview-gallery">
        ${items}
      </div>
    `;
  }

  return `
    <div class="resource-preview-empty">
      <div class="preview-empty-title">Preview coming soon</div>
      <div class="preview-empty-copy">
        This resource is in the library and ready to open, but image previews have not been added yet.
      </div>
    </div>
  `;
}

function renderResourceDetailPage(resource, relatedResources = []) {
  const primaryAction = getPrimaryAction(resource);
  const alignment = resource.curriculumAlignment || {};

  const badges = [
    resource.gradeLabel,
    resource.subject,
    resource.strand,
    resource.topic,
    resource.resourceType,
    ...(Array.isArray(resource.fileTypes) ? resource.fileTypes : []),
    resource.prepTime,
    "Ontario Aligned",
    resource.isFree ? "Free" : "Premium",
    resource.hasAnswerKey ? "Answer Key Included" : ""
  ]
    .filter(Boolean)
    .map(renderBadge)
    .join("");

  const whatYouGet = (resource.whatYouGet || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  const related = relatedResources.length
    ? relatedResources
        .map(
          (item) => `
            <a class="related-card" href="/resource/${encodeURIComponent(item.slug)}">
              <div class="resource-title-small">${escapeHtml(item.title)}</div>
              <div class="resource-meta">
                ${escapeHtml(item.gradeLabel || "")}
                ${item.subject ? ` • ${escapeHtml(item.subject)}` : ""}
                ${item.resourceType ? ` • ${escapeHtml(item.resourceType)}` : ""}
              </div>
            </a>
          `
        )
        .join("")
    : `<div class="resource-meta">No related resources yet.</div>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${escapeHtml(resource.title)} — Project Yellow Bird</title>
  <link rel="stylesheet" href="/styles/site.css"/>
</head>
<body>
  <div class="topbar">
    <div class="topbar-inner">
      <a class="brand" href="/"><span class="dot"></span> Project Yellow Bird</a>
      <nav class="nav">
        <a href="/browse">Browse Library</a>
        <a href="/faq">FAQ</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </nav>
    </div>
  </div>

  <div class="container resource-detail-page">
    <div class="detail-back">
      <a class="btn mini" href="/browse">← Back to Browse</a>
    </div>

    <div class="resource-detail-layout">
      <section class="resource-main-panel card">
        <div class="resource-meta">
          <span>${escapeHtml(resource.gradeLabel || "")}</span>
          <span>•</span>
          <span>${escapeHtml(resource.subject || "")}</span>
          <span>•</span>
          <span>${escapeHtml(resource.resourceType || "")}</span>
        </div>

        <h1 class="h1" style="margin-bottom:12px;">${escapeHtml(resource.title)}</h1>
        <div class="badges" style="margin-bottom:18px;">${badges}</div>

        <p class="lede">${escapeHtml(resource.description || "")}</p>

        <div class="card" style="margin-top:18px; background:#fafaf9;">
          <div class="section-title">Preview</div>
          ${renderPreviewSection(resource)}
        </div>

        <div class="resource-actions" style="margin-top:18px;">
          <a class="btn primary" href="${escapeHtml(primaryAction.href)}">${escapeHtml(primaryAction.label)}</a>
          <a class="btn" href="/browse">Browse More</a>
        </div>
      </section>

      <aside class="resource-side-panel">
        <div class="card">
          <div class="section-title">What you get</div>
          <ul class="resource-list">
            ${whatYouGet || "<li>Resource contents will appear here.</li>"}
          </ul>
        </div>

        <div class="card">
          <div class="section-title">Curriculum alignment</div>
          <div class="resource-meta-stack">
            <div><strong>Jurisdiction:</strong> ${escapeHtml(alignment.jurisdiction || "Ontario")}</div>
            <div><strong>Subject:</strong> ${escapeHtml(alignment.subject || resource.subject || "—")}</div>
            <div><strong>Grade:</strong> ${escapeHtml(alignment.grade || resource.gradeLabel || "—")}</div>
            <div><strong>Strand:</strong> ${escapeHtml(alignment.strand || resource.strand || "—")}</div>
            <div><strong>Expectation:</strong> ${escapeHtml(
              alignment.expectationCode || resource.expectationCode || "—"
            )}</div>
          </div>
        </div>

        <div class="card">
          <div class="section-title">Resource details</div>
          <div class="resource-meta-stack">
            <div><strong>Prep:</strong> ${escapeHtml(resource.prepTime || "—")}</div>
            <div><strong>Difficulty:</strong> ${escapeHtml(resource.difficulty || "—")}</div>
            <div><strong>Answer key:</strong> ${resource.hasAnswerKey ? "Included" : "Not included"}</div>
            <div><strong>File types:</strong> ${escapeHtml(
              Array.isArray(resource.fileTypes) && resource.fileTypes.length
                ? resource.fileTypes.join(", ")
                : "—"
            )}</div>
            <div><strong>Price:</strong> ${resource.isFree ? "Free" : "Subscription / Premium"}</div>
            <div><strong>Downloads:</strong> ${Number(resource.downloads || 0)}</div>
            <div><strong>Rating:</strong> ${resource.rating ? `${resource.rating} / 5` : "Not rated yet"}</div>
          </div>
        </div>
      </aside>
    </div>

    <section class="card" style="margin-top:24px;">
      <div class="section-title">About this resource</div>
      <p>${escapeHtml(resource.longDescription || resource.description || "")}</p>
    </section>

    <section class="card" style="margin-top:24px;">
      <div class="section-title">Related resources</div>
      <div class="related-grid">
        ${related}
      </div>
    </section>
  </div>

  <div class="footer">© Project Yellow Bird — calm, print-first resources.</div>
</body>
</html>`;
}

function worksheetPreviewUrl(id) {
  return `/catalog-preview.html?id=${encodeURIComponent(id)}`;
}

function worksheetPdfUrl(id) {
  return `/api/catalog-pdf/${encodeURIComponent(id)}?disposition=inline`;
}

const PUBLIC_CONTROL_STATUSES = new Set([
  "public",
  "public_prototype",
  "approved",
  "approved_public"
]);

const CUSTOMIZATION_CONTROL_ORDER = [
  "questionCount",
  "questionTextSize",
  "minimumValue",
  "maximumValue",
  "selectedValues",
  "baseTenResponseMode",
  "numberLineArrows",
  "includeExample",
  "includeAnswerKey",
  "questionsPerPage"
];

function isPublicCustomizationControl(control = {}, variable = {}) {
  return PUBLIC_CONTROL_STATUSES.has(control.publicStatus) &&
    variable.publicClassification !== "internal";
}

function buildWorksheetCustomizationModel(item) {
  const family = getCustomizationFamilyForResource(item.id);
  if (!family) return null;

  const defaults = normalizeWorksheetCustomization(item.id, {});
  if (!defaults.ok) return null;

  const resourceDeclaration = family.resources?.[item.id] || {};
  const controls = CUSTOMIZATION_CONTROL_ORDER
    .filter((id) => family.controls?.[id] && variables[id])
    .filter((id) => isPublicCustomizationControl(family.controls[id], variables[id]))
    .map((id) => ({
      id,
      label: variables[id].label,
      type: variables[id].type,
      group: variables[id].group,
      min: family.controls[id].min,
      max: family.controls[id].max,
      allowedValues: family.controls[id].allowedValues || null,
      semantics: family.controls[id].semantics || null
    }));

  if (!controls.length) return null;

  return {
    resourceId: item.id,
    familyId: family.id,
    exampleWithinQuestionTotal: family.exampleWithinQuestionTotal === true || family.id === "additionFactsWithin20",
    label: family.label,
    defaults: defaults.normalizedOptions,
    optionHash: defaults.optionHash,
    suggestedRange: resourceDeclaration.suggestedRange || null,
    safeRange: resourceDeclaration.safeRange || null,
    range: family.range || null,
    controls,
    notices: {
      customRange: resourceDeclaration.notices?.customRange ||
        "You are using numbers beyond this worksheet's suggested range."
    },
    endpoints: {
      preview: `/api/catalog-preview/${encodeURIComponent(item.id)}`,
      pdf: `/api/catalog-pdf/${encodeURIComponent(item.id)}`
    }
  };
}

function renderWorksheetPreviewObject(id, customizable = false) {
  const pdfUrl = worksheetPdfUrl(id);

  return `
    <div class="detail-pdf-shell" id="ybPdfShell">
      <object
        id="ybPdfObject"
        class="detail-pdf-viewer"
        data="${escapeHtml(pdfUrl)}#toolbar=1&navpanes=0&view=FitH"
        type="application/pdf"
        aria-label="Worksheet PDF preview"
      >
        <iframe
          id="ybPdfFrame"
          class="detail-pdf-viewer"
          src="${escapeHtml(pdfUrl)}#toolbar=1&navpanes=0&view=FitH"
          title="Worksheet PDF preview"
        ></iframe>
        <div class="resource-preview-empty">
          <div class="preview-empty-title">Preview could not load inline</div>
          <div class="preview-empty-copy">
            <a href="${escapeHtml(pdfUrl)}" target="_blank" rel="noopener noreferrer">Open the worksheet PDF preview</a>.
          </div>
        </div>
      </object>
      ${customizable ? '<div class="resource-preview-empty" id="ybPdfUnavailable" role="status" tabindex="-1" hidden></div>' : ""}
    </div>
  `;
}

function renderCustomizationPanel(model) {
  if (!model) return "";

  const defaults = model.defaults;
  const hasRangeControls = model.controls.some((control) => control.id === "minimumValue");
  const linkedRange = model.range?.kind === "linkedNumberLine";
  const hasSelectedValues = model.controls.some(control => control.id === "selectedValues");
  const hasArrowControl = model.controls.some(control => control.id === "numberLineArrows");
  const hasBaseTenResponseMode = model.controls.some(control => control.id === "baseTenResponseMode");
  const questionControl = model.controls.find((control) => control.id === "questionCount") || {};
  const minControl = model.controls.find((control) => control.id === "minimumValue") || {};
  const maxControl = model.controls.find((control) => control.id === "maximumValue") || {};
  const suggested = model.suggestedRange || { minimumValue: 0, maximumValue: 20 };
  const safe = model.safeRange || suggested;

  return `
    <section class="customization-card card" id="ybCustomizationPanel" hidden aria-labelledby="ybCustomizationTitle">
      <div class="customization-card-header">
        <div>
          <div class="section-title" id="ybCustomizationTitle">Customize this worksheet</div>
          <p class="customization-help">Choose a few teacher settings, then update the preview before downloading.</p>
        </div>
      </div>

      <div class="customization-error-summary" id="ybErrorSummary" role="alert" tabindex="-1" hidden></div>
      <div class="customization-notice" id="ybRangeNotice" hidden>
        ${linkedRange ? escapeHtml(model.notices.customRange) : "You are using numbers beyond this worksheet’s suggested range."}
      </div>
      <div class="customization-notice" id="ybSelectionNotice" hidden></div>

      <form id="ybCustomizationForm" novalidate>
        <fieldset class="customization-fieldset">
          <legend>Practice settings</legend>
          <div class="control-row">
            <label class="field-label" for="ybQuestionCount">Number of questions</label>
            <div class="control-cell">
              <input
                id="ybQuestionCount"
                name="questionCount"
                type="number"
                min="${escapeHtml(questionControl.min ?? 1)}"
                max="${escapeHtml(questionControl.max ?? 180)}"
                step="1"
                value="${escapeHtml(defaults.questionCount)}"
                aria-describedby="ybQuestionCountHelp ybQuestionCountError"
              />
              <div class="field-help" id="ybQuestionCountHelp">${model.exampleWithinQuestionTotal ? "Total numbered questions, including the first question when completed." : "Number of practice questions."}</div>
              <div class="field-error" id="ybQuestionCountError"></div>
            </div>
          </div>

          ${hasRangeControls && !linkedRange ? `<fieldset class="inline-choice-fieldset" aria-describedby="ybRangeHelp">
            <legend>Number range</legend>
            <div class="field-help" id="ybRangeHelp">Suggested for this worksheet: ${escapeHtml(suggested.minimumValue)}–${escapeHtml(suggested.maximumValue)}</div>
            <label class="radio-row">
              <input type="radio" name="rangeMode" value="suggested" checked />
              <span>Use suggested range</span>
            </label>
            <label class="radio-row">
              <input type="radio" name="rangeMode" value="custom" />
              <span>Choose a custom range</span>
            </label>
          </fieldset>` : ""}

          <div class="control-row">
            <label class="field-label" for="ybQuestionTextSize">Question text size</label>
            <div class="control-cell">
              <select id="ybQuestionTextSize" name="questionTextSize" aria-describedby="ybQuestionTextSizeHelp ybQuestionTextSizeError">
                <option value="12">Standard — 12 pt</option>
                <option value="14">Larger — 14 pt</option>
                <option value="16">Largest — 16 pt</option>
              </select>
              <div class="field-help" id="ybQuestionTextSizeHelp">Larger text may use more pages.</div>
              <div class="field-error" id="ybQuestionTextSizeError"></div>
            </div>
          </div>

          ${hasRangeControls ? `${linkedRange ? `<fieldset class="inline-choice-fieldset" aria-describedby="ybRangeHelp">
            <legend>Number-line range</legend>
            <div class="field-help" id="ybRangeHelp">Starting numbers and answers stay within this range. Use whole numbers from 0 to ${escapeHtml(safe.maximumValue)}, with To minus From at most ${escapeHtml(model.range.maximumSpan)}.</div>` : ""}<div id="ybCustomRangeFields">
            <div class="control-row">
              <label class="field-label" for="ybMinimumValue">${linkedRange ? "From" : "Lowest number"}</label>
              <div class="control-cell">
                <input
                  id="ybMinimumValue"
                  name="minimumValue"
                  type="number"
                  min="${escapeHtml(minControl.min ?? safe.minimumValue)}"
                  max="${escapeHtml(minControl.max ?? safe.maximumValue)}"
                  step="1"
                  value="${escapeHtml(defaults.minimumValue)}"
                  aria-describedby="ybMinimumValueError"
                />
                <div class="field-error" id="ybMinimumValueError"></div>
              </div>
            </div>
            <div class="control-row">
              <label class="field-label" for="ybMaximumValue">${linkedRange ? "To" : "Highest number"}</label>
              <div class="control-cell">
                <input
                  id="ybMaximumValue"
                  name="maximumValue"
                  type="number"
                  min="${escapeHtml(maxControl.min ?? safe.minimumValue)}"
                  max="${escapeHtml(maxControl.max ?? safe.maximumValue)}"
                  step="1"
                  value="${escapeHtml(defaults.maximumValue)}"
                  aria-describedby="ybMaximumValueError"
                />
                <div class="field-error" id="ybMaximumValueError"></div>
              </div>
            </div>
          </div>${linkedRange ? "</fieldset>" : ""}` : ""}

          ${hasSelectedValues ? `<div class="control-row">
            <label class="field-label" id="ybSelectedValuesLabel" for="ybSelectedValuesButton">Numbers to practise</label>
            <div class="control-cell">
              <div class="number-selector" id="ybSelectedValues">
                <button
                  class="number-selector-button"
                  id="ybSelectedValuesButton"
                  type="button"
                  aria-haspopup="true"
                  aria-expanded="false"
                  aria-controls="ybSelectedValuesPanel"
                  aria-labelledby="ybSelectedValuesLabel ybSelectedValuesSummary"
                  aria-describedby="ybSelectedValuesHelp ybSelectedValuesError"
                >
                  <span id="ybSelectedValuesSummary">Choose numbers…</span>
                </button>
                <div class="number-selector-panel" id="ybSelectedValuesPanel" hidden>
                  <div class="number-selector-list" id="ybSelectedValuesList" role="group" aria-labelledby="ybSelectedValuesLabel"></div>
                </div>
              </div>
              <div class="field-help" id="ybSelectedValuesHelp">Request more practice with these numbers. Other numbers may appear, and individual selections are not guaranteed to appear.</div>
              <div class="field-error" id="ybSelectedValuesError"></div>
            </div>
          </div>` : ""}
        </fieldset>

        <fieldset class="customization-fieldset">
          <legend>Student support</legend>
          ${hasArrowControl ? `<div class="control-row">
            <label class="field-label" for="ybNumberLineArrows">Number-line arrows</label>
            <div class="control-cell">
              <select id="ybNumberLineArrows" name="numberLineArrows" aria-describedby="ybNumberLineArrowsHelp ybNumberLineArrowsError">
                <option value="shown">Show arrows</option>
                <option value="student_drawn">Students draw arrows</option>
              </select>
              <div class="field-help" id="ybNumberLineArrowsHelp">Completed questions and the answer key always show the jumps.</div>
              <div class="field-error" id="ybNumberLineArrowsError"></div>
            </div>
          </div>` : ""}
          ${hasBaseTenResponseMode ? `<div class="control-row">
            <label class="field-label" for="ybBaseTenResponseMode">Answer format</label>
            <div class="control-cell">
              <select id="ybBaseTenResponseMode" name="baseTenResponseMode" aria-describedby="ybBaseTenResponseModeHelp ybBaseTenResponseModeError">
                <option value="standard_number">Write the number</option>
                <option value="tens_ones">Tens and ones boxes</option>
              </select>
              <div class="field-help" id="ybBaseTenResponseModeHelp">Choose one answer line or separate tens and ones boxes.</div>
              <div class="field-error" id="ybBaseTenResponseModeError"></div>
            </div>
          </div>` : ""}
          <label class="checkbox-row" for="ybIncludeExample">
            <input id="ybIncludeExample" name="includeExample" type="checkbox" />
            <span>
              <strong>${model.exampleWithinQuestionTotal ? "Show the first question completed" : "Show one completed example"}</strong>
              <small>${model.exampleWithinQuestionTotal ? "Included in the question total." : "Show a completed example for support."}</small>
            </span>
          </label>
          <div class="field-error" id="ybIncludeExampleError"></div>
        </fieldset>

        <fieldset class="customization-fieldset">
          <legend>Answer key and download</legend>
          <label class="checkbox-row" for="ybIncludeAnswerKey">
            <input id="ybIncludeAnswerKey" name="includeAnswerKey" type="checkbox" checked />
            <span><strong>Include answer key</strong></span>
          </label>
          <div class="field-error" id="ybIncludeAnswerKeyError"></div>
        </fieldset>

        <div class="customization-actions">
          <button class="btn primary" id="ybUpdatePreviewBtn" type="submit">Update preview</button>
          <button class="btn" id="ybRestoreBtn" type="button">Restore recommended settings</button>
        </div>
      </form>
    </section>
  `;
}

function renderCustomizationScript(model) {
  return `
    <script>
      window.YELLOW_BIRD_CUSTOMIZATION = ${safeJson(model)};

      (function () {
        const model = window.YELLOW_BIRD_CUSTOMIZATION;
        const form = document.getElementById("ybCustomizationForm");
        const panel = document.getElementById("ybCustomizationPanel");
        const toggle = document.getElementById("ybCustomizeToggle");
        const updateBtn = document.getElementById("ybUpdatePreviewBtn");
        const restoreBtn = document.getElementById("ybRestoreBtn");
        const downloadBtn = document.getElementById("ybDownloadBtn");
        const downloadNote = document.getElementById("ybDownloadNote");
        const downloadButtons = [downloadBtn, document.getElementById("ybTopDownloadBtn")];
        const previewLink = document.getElementById("ybTopPreviewBtn");
        const worksheetActions = [...downloadButtons, previewLink];
        const previewState = document.getElementById("ybPreviewStateLabel");
        const previewCopy = document.getElementById("ybPreviewCopy");
        const summary = document.getElementById("ybCustomizationSummary");
        const errorSummary = document.getElementById("ybErrorSummary");
        const rangeNotice = document.getElementById("ybRangeNotice");
        const selectionNotice = document.getElementById("ybSelectionNotice");
        const pdfObject = document.getElementById("ybPdfObject");
        const pdfFrame = document.getElementById("ybPdfFrame");
        const pdfShell = document.getElementById("ybPdfShell");
        const pdfUnavailable = document.getElementById("ybPdfUnavailable");
        const pdfFallbackLink = pdfObject.querySelector("a");
        const selectedValues = document.getElementById("ybSelectedValues");
        const selectedButton = document.getElementById("ybSelectedValuesButton");
        const selectedPanel = document.getElementById("ybSelectedValuesPanel");
        const selectedList = document.getElementById("ybSelectedValuesList");
        const selectedSummary = document.getElementById("ybSelectedValuesSummary");
        const live = document.createElement("div");

        if (!model || !form || !panel || !toggle) return;

        live.className = "sr-only";
        live.setAttribute("aria-live", "polite");
        live.setAttribute("aria-atomic", "true");
        document.body.appendChild(live);

        const hasRangeControls = model.controls.some((control) => control.id === "minimumValue");
        const linkedRange = model.range?.kind === "linkedNumberLine";
        const hasSelectedValues = model.controls.some(control => control.id === "selectedValues");
        const hasArrowControl = model.controls.some(control => control.id === "numberLineArrows");
        const hasBaseTenResponseMode = model.controls.some(control => control.id === "baseTenResponseMode");
        const defaults = normalizeSettings(model.defaults);
        let selectedValueSet = new Set(defaults.selectedValues);
        let lastCustomRange = {
          minimumValue: defaults.minimumValue,
          maximumValue: defaults.maximumValue
        };
        let requestVersion = 0;
        let downloadsEnabled = false;
        let lastSuccessful = {
          settings: { ...defaults },
          summary: summarize(defaults),
          optionHash: model.optionHash,
          mode: "ready",
          downloadUrl: buildPdfUrl(defaults, "attachment"),
          previewUrl: buildPdfUrl(defaults, "inline")
        };

        function normalizeSettings(settings) {
          return {
            questionCount: Number(settings.questionCount),
            questionTextSize: Number(settings.questionTextSize ?? 12),
            numberLineArrows: settings.numberLineArrows ?? "shown",
            baseTenResponseMode: settings.baseTenResponseMode ?? "standard_number",
            minimumValue: Number(settings.minimumValue ?? 0),
            maximumValue: Number(settings.maximumValue ?? 20),
            selectedValues: Array.isArray(settings.selectedValues)
              ? settings.selectedValues.map(Number).filter(Number.isFinite).sort((a, b) => a - b)
              : [],
            includeExample: Boolean(settings.includeExample),
            includeAnswerKey: settings.includeAnswerKey !== false,
            worksheetSeed: settings.worksheetSeed || "yellowbird-default"
          };
        }

        function stableSettings(settings) {
          const normalized = normalizeSettings(settings);
          return JSON.stringify({
            questionCount: normalized.questionCount,
            questionTextSize: normalized.questionTextSize,
            numberLineArrows: normalized.numberLineArrows,
            baseTenResponseMode: normalized.baseTenResponseMode,
            minimumValue: normalized.minimumValue,
            maximumValue: normalized.maximumValue,
            selectedValues: normalized.selectedValues,
            includeExample: normalized.includeExample,
            includeAnswerKey: normalized.includeAnswerKey,
            worksheetSeed: normalized.worksheetSeed
          });
        }

        function settingsEqual(a, b) {
          return stableSettings(a) === stableSettings(b);
        }

        function buildParams(settings, disposition) {
          const params = new URLSearchParams();
          params.set("questionCount", String(settings.questionCount));
          params.set("questionTextSize", String(settings.questionTextSize));
          if (hasArrowControl) params.set("numberLineArrows", settings.numberLineArrows);
          if (hasBaseTenResponseMode) params.set("baseTenResponseMode", settings.baseTenResponseMode);
          if (hasRangeControls) {
            params.set("minimumValue", String(settings.minimumValue));
            params.set("maximumValue", String(settings.maximumValue));
          }
          params.set("includeExample", settings.includeExample ? "true" : "false");
          params.set("includeAnswerKey", settings.includeAnswerKey ? "true" : "false");
          params.set("answers", settings.includeAnswerKey ? "1" : "0");
          params.set("worksheetSeed", settings.worksheetSeed || "yellowbird-default");
          if (settings.selectedValues.length) {
            params.set("selectedValues", settings.selectedValues.join(","));
          }
          if (disposition) params.set("disposition", disposition);
          return params;
        }

        function buildPreviewJsonUrl(settings) {
          return model.endpoints.preview + "?" + buildParams(settings).toString();
        }

        function buildPdfUrl(settings, disposition) {
          return model.endpoints.pdf + "?" + buildParams(settings, disposition).toString();
        }

        function currentRangeMode() {
          return linkedRange ? "custom" : form.elements.rangeMode.value;
        }

        function suggestedRange() {
          return {
            minimumValue: Number(model.suggestedRange.minimumValue),
            maximumValue: Number(model.suggestedRange.maximumValue)
          };
        }

        function visibleRangeValues() {
          return {
            minimumValue: Number(form.elements.minimumValue.value),
            maximumValue: Number(form.elements.maximumValue.value)
          };
        }

        function storeCustomRangeIfValid() {
          const values = visibleRangeValues();
          if (
            Number.isFinite(values.minimumValue) &&
            Number.isFinite(values.maximumValue) &&
            values.minimumValue <= values.maximumValue
          ) {
            lastCustomRange = values;
          }
        }

        function readRangeValue(input) {
          return linkedRange && input.value.trim() === "" ? NaN : Number(input.value);
        }

        function readSettings() {
          const rangeMode = hasRangeControls ? currentRangeMode() : "fixed";
          const min = !hasRangeControls ? 0 : rangeMode === "suggested"
            ? model.suggestedRange.minimumValue
            : readRangeValue(form.elements.minimumValue);
          const max = !hasRangeControls ? 20 : rangeMode === "suggested"
            ? model.suggestedRange.maximumValue
            : readRangeValue(form.elements.maximumValue);

          return normalizeSettings({
            questionCount: Number(form.elements.questionCount.value),
            questionTextSize: Number(form.elements.questionTextSize.value),
            numberLineArrows: hasArrowControl ? form.elements.numberLineArrows.value : "shown",
            baseTenResponseMode: hasBaseTenResponseMode ? form.elements.baseTenResponseMode.value : "standard_number",
            minimumValue: min,
            maximumValue: max,
            selectedValues: Array.from(selectedValueSet),
            includeExample: form.elements.includeExample.checked,
            includeAnswerKey: form.elements.includeAnswerKey.checked,
            worksheetSeed: defaults.worksheetSeed
          });
        }

        function setRangeMode(mode, options = {}) {
          if (!hasRangeControls || linkedRange) return;
          const radio = Array.from(form.elements.rangeMode).find((item) => item.value === mode);
          if (radio) radio.checked = true;
          const suggested = suggestedRange();

          if (mode === "suggested") {
            if (options.storeCustom !== false) storeCustomRangeIfValid();
            form.elements.minimumValue.value = String(suggested.minimumValue);
            form.elements.maximumValue.value = String(suggested.maximumValue);
            form.elements.minimumValue.disabled = true;
            form.elements.maximumValue.disabled = true;
          } else {
            form.elements.minimumValue.disabled = false;
            form.elements.maximumValue.disabled = false;
            form.elements.minimumValue.value = String(lastCustomRange.minimumValue);
            form.elements.maximumValue.value = String(lastCustomRange.maximumValue);
          }
        }

        function writeSettings(settings) {
          const normalized = normalizeSettings(settings);
          form.elements.questionCount.value = String(normalized.questionCount);
          form.elements.questionTextSize.value = String(normalized.questionTextSize);
          if (hasArrowControl) form.elements.numberLineArrows.value = normalized.numberLineArrows;
          if (hasBaseTenResponseMode) form.elements.baseTenResponseMode.value = normalized.baseTenResponseMode;
          form.elements.includeExample.checked = normalized.includeExample;
          form.elements.includeAnswerKey.checked = normalized.includeAnswerKey;
          if (!hasRangeControls) return;
          form.elements.minimumValue.value = String(normalized.minimumValue);
          form.elements.maximumValue.value = String(normalized.maximumValue);
          if (linkedRange) return;

          const isSuggested =
            normalized.minimumValue === model.suggestedRange.minimumValue &&
            normalized.maximumValue === model.suggestedRange.maximumValue;
          if (!isSuggested) {
            lastCustomRange = {
              minimumValue: normalized.minimumValue,
              maximumValue: normalized.maximumValue
            };
          }
          selectedValueSet = new Set(normalized.selectedValues);
          setRangeMode(isSuggested ? "suggested" : "custom", { storeCustom: false });
          refreshSelectedOptions(normalized.selectedValues);
        }

        function refreshSelectedOptions(valuesToKeep) {
          if (!hasSelectedValues) return;
          const settings = readSettingsWithoutSelected();
          const min = Number(settings.minimumValue);
          const max = Number(settings.maximumValue);
          const keep = valuesToKeep ? new Set(valuesToKeep.map(Number)) : null;
          const selected = keep || selectedValueSet;

          selectedList.innerHTML = "";
          const choices = new Set(selected);
          for (let value = min; value <= max; value += 1) {
            choices.add(value);
          }
          Array.from(choices).sort((a, b) => a - b).forEach((value) => {
            const label = document.createElement("label");
            label.className = "number-selector-option";
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = String(value);
            checkbox.checked = selected.has(value);
            const text = document.createElement("span");
            text.textContent = String(value);
            label.appendChild(checkbox);
            label.appendChild(text);
            selectedList.appendChild(label);
          });

          selectedValueSet = new Set(selected);
          updateSelectedSummary();
        }

        function readSettingsWithoutSelected() {
          const rangeMode = currentRangeMode();
          return {
            minimumValue: rangeMode === "suggested"
              ? model.suggestedRange.minimumValue
              : Number(form.elements.minimumValue.value),
            maximumValue: rangeMode === "suggested"
              ? model.suggestedRange.maximumValue
              : Number(form.elements.maximumValue.value)
          };
        }

        function updateSelectedSummary() {
          const values = Array.from(selectedValueSet).sort((a, b) => a - b);
          const range = readSettingsWithoutSelected();
          const outside = values.filter(value => value < range.minimumValue || value > range.maximumValue);
          selectionNotice.hidden = !outside.length;
          selectionNotice.textContent = outside.length
            ? "Selected numbers outside the active range: " + outside.join(", ") + ". Remove them or change the number range."
            : "";
          if (!values.length) {
            selectedSummary.textContent = "Choose numbers…";
            return;
          }
          selectedSummary.textContent = values.length <= 4
            ? values.join(", ")
            : values.slice(0, 4).join(", ") + " +" + (values.length - 4) + " more";
        }

        function setSelectorOpen(open) {
          if (!selectedPanel) return;
          selectedPanel.hidden = !open;
          selectedButton.setAttribute("aria-expanded", String(open));
        }

        function clearErrors() {
          errorSummary.hidden = true;
          errorSummary.innerHTML = "";
          ["questionCount", "questionTextSize", "minimumValue", "maximumValue", "selectedValues", "includeExample", "includeAnswerKey"].forEach((field) => {
            const error = document.getElementById("yb" + field.charAt(0).toUpperCase() + field.slice(1) + "Error");
            if (error) error.textContent = "";
          });
          Array.from(form.querySelectorAll("[aria-invalid='true']")).forEach((input) => {
            input.removeAttribute("aria-invalid");
          });
        }

        function fieldElementFor(field) {
          const map = {
            questionCount: form.elements.questionCount,
            questionTextSize: form.elements.questionTextSize,
            minimumValue: form.elements.minimumValue,
            maximumValue: form.elements.maximumValue,
            selectedValues: selectedButton,
            includeExample: form.elements.includeExample,
            includeAnswerKey: form.elements.includeAnswerKey,
            unsupportedOptions: form
          };
          return map[field] || form.elements[field] || form;
        }

        function errorElementFor(field) {
          const map = {
            unsupportedOptions: "ybErrorSummary"
          };
          return document.getElementById(map[field] || ("yb" + field.charAt(0).toUpperCase() + field.slice(1) + "Error"));
        }

        function showErrors(errors) {
          clearErrors();
          const safeErrors = (errors || []).filter(Boolean);
          if (!safeErrors.length) return;

          errorSummary.hidden = false;
          errorSummary.innerHTML = "<strong>Check these settings:</strong><ul>" +
            safeErrors.map((error) => "<li>" + escapeHtml(error.message || "This setting needs attention.") + "</li>").join("") +
            "</ul>";

          safeErrors.forEach((error) => {
            const field = error.field || "unsupportedOptions";
            const input = fieldElementFor(field);
            const target = errorElementFor(field);
            if (target && target !== errorSummary) target.textContent = error.message || "This setting needs attention.";
            if (input && input.setAttribute) input.setAttribute("aria-invalid", "true");
          });
        }

        function escapeHtml(value) {
          return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
        }

        function updateRangeNotice(settings) {
          if (!hasRangeControls) return;
          const suggestedMax = Number(model.suggestedRange.maximumValue);
          rangeNotice.hidden = linkedRange
            ? settings.minimumValue === model.suggestedRange.minimumValue && settings.maximumValue === suggestedMax
            : !(Number(settings.maximumValue) > suggestedMax);
        }

        function setPreviewState(state, message) {
          const labels = {
            ready: "Ready-to-use worksheet",
            stale: "Preview not updated",
            updating: "Updating preview…",
            customized: "Customized preview",
            validation: "Preview not updated",
            generationError: "We could not update this preview"
          };
          const copy = {
            ready: "The approved worksheet is ready to preview, download, and print.",
            stale: "Your selections have changed. Update the preview before downloading.",
            updating: "The preview and downloads will return when the update succeeds.",
            customized: "Preview updated to match your selections.",
            validation: "Your selections need attention. Update the preview before downloading.",
            generationError: "Your selections are still here. Try updating the preview again."
          };
          previewState.textContent = labels[state] || labels.ready;
          previewCopy.textContent = message || copy[state] || copy.ready;
          previewState.dataset.state = state;
          live.textContent = labels[state] || "";
          setDownloadEnabled(state === "ready" || state === "customized");
        }

        function setDownloadEnabled(enabled) {
          downloadsEnabled = enabled;
          worksheetActions.forEach((link) => {
            link.setAttribute("aria-disabled", String(!enabled));
            link.classList.toggle("disabled", !enabled);
            if (enabled) {
              link.href = link === previewLink ? lastSuccessful.previewUrl : lastSuccessful.downloadUrl;
              link.removeAttribute("tabindex");
            } else {
              link.removeAttribute("href");
              link.setAttribute("tabindex", "-1");
            }
          });
          downloadButtons.forEach((link) => {
            link.textContent = lastSuccessful.mode === "customized" ? "Download customized PDF" : "Download worksheet PDF";
          });
          downloadNote.hidden = enabled;
          downloadNote.textContent = previewCopy.textContent;
          summary.hidden = false;
          summary.textContent = (enabled ? "Applied worksheet: " : "Last applied worksheet (preview unavailable): ") + lastSuccessful.summary;
          pdfUnavailable.hidden = enabled;
          if (enabled) {
            const viewerUrl = lastSuccessful.previewUrl + "#toolbar=1&navpanes=0&view=FitH";
            if (pdfObject.getAttribute("data") !== viewerUrl) pdfObject.data = viewerUrl;
            if (pdfFrame.getAttribute("src") !== viewerUrl) pdfFrame.src = viewerUrl;
            pdfFallbackLink.href = lastSuccessful.previewUrl;
            if (!pdfObject.isConnected) pdfShell.prepend(pdfObject);
          } else {
            const moveFocus = pdfShell.contains(document.activeElement) || worksheetActions.includes(document.activeElement);
            pdfObject.remove();
            pdfObject.removeAttribute("data");
            pdfFrame.removeAttribute("src");
            pdfFallbackLink.removeAttribute("href");
            pdfUnavailable.textContent = previewCopy.textContent;
            if (moveFocus) pdfUnavailable.focus();
          }
        }

        function summarize(settings, items) {
          // This prototype's approved Q1 contract supplies the initial summary;
          // successful updates use the generated items without rebuilding truth.
          const numbered = items ? items.length : settings.questionCount;
          const completed = items ? items.filter((item) => item.isExample).length : (settings.includeExample ? 1 : 0);
          const countSummary = model.exampleWithinQuestionTotal
            ? numbered + " numbered questions; " + completed + " completed; " + (numbered - completed) + " left to solve."
            : settings.questionCount + " questions";
          const parts = [
            countSummary,
            "Question text: " + settings.questionTextSize + " pt",
            hasArrowControl ? (settings.numberLineArrows === "student_drawn" ? "Students draw arrows" : "Show arrows") : "",
            linkedRange ? "Number line " + settings.minimumValue + "–" + settings.maximumValue : !hasRangeControls ? "Forward addition on 0–20" : settings.minimumValue === model.suggestedRange.minimumValue && settings.maximumValue === model.suggestedRange.maximumValue
              ? "Numbers " + settings.minimumValue + "–" + settings.maximumValue
              : "Custom range " + settings.minimumValue + "–" + settings.maximumValue,
            settings.selectedValues.length
              ? "Requested emphasis: " + settings.selectedValues.join(", ")
              : "",
            settings.includeAnswerKey ? "Answer key included" : "Answer key off"
          ].filter(Boolean);
          return parts.join(" · ");
        }

        function applyStaleState() {
          // Invalidate in-flight work on every edit/reset, including edits back
          // to the previous settings. An older response cannot apply afterward.
          requestVersion += 1;
          updateBtn.disabled = false;
          const settings = readSettings();
          updateRangeNotice(settings);
          setPreviewState(settingsEqual(settings, lastSuccessful.settings) ? lastSuccessful.mode : "stale");
        }

        async function updatePreview(event) {
          event.preventDefault();
          clearErrors();
          const settings = readSettings();
          const restoreUpdateFocus = document.activeElement === updateBtn;
          const version = ++requestVersion;
          const isCurrent = () => version === requestVersion && settingsEqual(settings, readSettings());
          updateRangeNotice(settings);
          setPreviewState("updating");
          updateBtn.disabled = true;

          try {
            const response = await fetch(buildPreviewJsonUrl(settings), {
              headers: { "Accept": "application/json" }
            });
            const data = await response.json();
            if (!isCurrent()) return;

            if (!response.ok || !data.ok) {
              const errors = data.customization?.errors || [{ message: data.error || "We could not update this preview." }];
              showErrors(errors);
              setPreviewState(response.status === 400 ? "validation" : "generationError");
              errorSummary.focus();
              return;
            }

            const normalized = normalizeSettings(data.customization?.normalizedOptions || settings);
            lastSuccessful = {
              settings: normalized,
              summary: summarize(normalized, data.preview?.contentObject?.content?.items),
              optionHash: data.customization?.optionHash || "",
              mode: settingsEqual(normalized, defaults) ? "ready" : "customized",
              downloadUrl: buildPdfUrl(normalized, "attachment"),
              previewUrl: buildPdfUrl(normalized, "inline")
            };

            writeSettings(normalized);
            setPreviewState(lastSuccessful.mode);
          } catch (error) {
            if (!isCurrent()) return;
            setPreviewState("generationError");
            showErrors([{ message: "We could not update this preview." }]);
            errorSummary.focus();
          } finally {
            if (version === requestVersion) {
              updateBtn.disabled = false;
              if (restoreUpdateFocus && document.activeElement === document.body) updateBtn.focus();
            }
          }
        }

        function restoreDefaults() {
          writeSettings(defaults);
          setSelectorOpen(false);
          clearErrors();
          applyStaleState();
        }

        toggle.addEventListener("click", () => {
          const willOpen = panel.hidden;
          panel.hidden = !willOpen;
          toggle.setAttribute("aria-expanded", String(willOpen));
          toggle.textContent = willOpen ? "Hide customization options" : "Customize this worksheet";
        });

        form.addEventListener("submit", updatePreview);
        restoreBtn.addEventListener("click", restoreDefaults);
        form.addEventListener("input", (event) => {
          if (event.target.name === "minimumValue" || event.target.name === "maximumValue") {
            storeCustomRangeIfValid();
            refreshSelectedOptions();
          }
          clearErrors();
          applyStaleState();
        });
        form.addEventListener("change", (event) => {
          if (event.target.name === "rangeMode") {
            setRangeMode(currentRangeMode());
            refreshSelectedOptions();
          }
          clearErrors();
          applyStaleState();
        });

        selectedButton?.addEventListener("click", () => {
          setSelectorOpen(selectedPanel.hidden);
        });

        selectedButton?.addEventListener("keydown", (event) => {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setSelectorOpen(true);
            const first = selectedList.querySelector("input");
            if (first) first.focus();
          }
          if (event.key === "Escape") {
            setSelectorOpen(false);
          }
        });

        selectedList?.addEventListener("change", (event) => {
          if (event.target.type !== "checkbox") return;
          const value = Number(event.target.value);
          if (event.target.checked) {
            selectedValueSet.add(value);
          } else {
            selectedValueSet.delete(value);
          }
          updateSelectedSummary();
          clearErrors();
          applyStaleState();
        });

        selectedList?.addEventListener("keydown", (event) => {
          if (event.key === "Escape") {
            setSelectorOpen(false);
            selectedButton.focus();
          }
        });

        document.addEventListener("click", (event) => {
          if (selectedValues && !selectedValues.contains(event.target)) {
            setSelectorOpen(false);
          }
        });

        worksheetActions.forEach((link) => {
          const blockUnavailableAction = (event) => {
            if (!downloadsEnabled) event.preventDefault();
          };
          link.addEventListener("click", blockUnavailableAction);
          link.addEventListener("auxclick", blockUnavailableAction);
          link.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") blockUnavailableAction(event);
          });
        });

        writeSettings(defaults);
        setPreviewState("ready");
      })();
    </script>
  `;
}

function renderWorksheetDetailPage(item) {
  const id = item.id;
  const customizationModel = buildWorksheetCustomizationModel(item);
  const worksheetType = worksheetTypeLabel(item);
  const worksheetFormat = worksheetFormatLabel(item);
  const domain = worksheetDomainLabel(item);
  const resourceType = item.resourceType === "quick_check"
    ? "Quick Check"
    : item.resourceType === "exit_ticket"
      ? "Exit Ticket"
      : "Worksheet";
  const detailsTitle = item.resourceType === "quick_check"
    ? "Quick Check details"
    : item.resourceType === "exit_ticket"
      ? "Exit Ticket details"
      : "Worksheet details";
  const badges = [
    ...(item.gradeLabels || []),
    domain,
    worksheetType,
    worksheetFormat,
    item.difficulty ? friendlyWorksheetLabel(item.difficulty) : "",
    item.estimatedTimeMinutes ? `${item.estimatedTimeMinutes} min` : "",
    item.hasAnswerKey ? "Answer Key Included" : "",
    ...(item.curriculumTags || [])
  ]
    .filter(Boolean)
    .map(renderBadge)
    .join("");

  const defaultPdfUrl = worksheetPdfUrl(id);
  const defaultPreviewUrl = worksheetPreviewUrl(id);
  const customizationMarkup = customizationModel
    ? `
        <section class="card detail-preview-card" aria-labelledby="ybPreviewHeading">
          <div class="preview-status-row">
            <div>
              <div class="section-title" id="ybPreviewHeading">Ready-to-use worksheet</div>
              <p class="preview-status-copy" id="ybPreviewCopy">The approved worksheet is ready to preview, download, and print.</p>
            </div>
            <div class="preview-state-pill" id="ybPreviewStateLabel">Ready-to-use worksheet</div>
          </div>
          <div class="customization-summary" id="ybCustomizationSummary" hidden></div>
          ${renderWorksheetPreviewObject(id, true)}
          <div class="resource-actions preview-download-row">
            <a class="btn primary" id="ybDownloadBtn" role="link" href="${escapeHtml(defaultPdfUrl)}">Download worksheet PDF</a>
            <span class="download-disabled-note" id="ybDownloadNote" hidden>Your selections have changed. Update the preview before downloading.</span>
          </div>
        </section>
      `
    : "";
  const customizationToggle = customizationModel
    ? `<button class="btn" id="ybCustomizeToggle" type="button" aria-expanded="false" aria-controls="ybCustomizationPanel">Customize this worksheet</button>`
    : "";
  const customizationScript = customizationModel
    ? renderCustomizationScript(customizationModel)
    : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${escapeHtml(item.title)} — Project Yellow Bird</title>
  <link rel="stylesheet" href="/styles/site.css"/>
</head>
<body>
  <div class="topbar">
    <div class="topbar-inner">
      <a class="brand" href="/"><span class="dot"></span> Project Yellow Bird</a>
      <nav class="nav">
        <a href="/browse">Browse Library</a>
        <a href="/faq">FAQ</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </nav>
    </div>
  </div>

  <div class="container resource-detail-page">
    <div class="detail-back">
      <a class="btn mini" href="/browse">Back to Browse</a>
    </div>

    <div class="resource-detail-layout">
      <section class="resource-main-panel card">
        <div class="resource-meta">
          <span>${escapeHtml((item.gradeLabels || []).join(", "))}</span>
          <span>•</span>
          <span>${escapeHtml(domain || "Math")}</span>
          <span>•</span>
          <span>${escapeHtml(resourceType)}</span>
          ${item.difficulty ? `<span>•</span><span>${escapeHtml(friendlyWorksheetLabel(item.difficulty))}</span>` : ""}
        </div>

        <h1 class="h1" style="margin-bottom:12px;">${escapeHtml(item.title)}</h1>
        <div class="badges" style="margin-bottom:18px;">${badges}</div>

        <p class="resource-desc">${escapeHtml(worksheetResourceTypeNote(item))}</p>
        <p class="lede">${escapeHtml(item.description || "")}</p>

        <div class="resource-actions" style="margin-top:18px;">
          <a class="btn"${customizationModel ? ' id="ybTopPreviewBtn" role="link"' : ""} href="${escapeHtml(defaultPreviewUrl)}">Preview PDF</a>
          <a class="btn primary"${customizationModel ? ' id="ybTopDownloadBtn" role="link"' : ""} href="${escapeHtml(defaultPdfUrl)}">${customizationModel ? "Download worksheet PDF" : "Download PDF"}</a>
          ${customizationToggle}
          <a class="btn" href="/browse">Browse More</a>
        </div>

        ${customizationMarkup}
      </section>

      <aside class="resource-side-panel">
        ${renderCustomizationPanel(customizationModel)}

        <div class="card">
          <div class="section-title">${escapeHtml(detailsTitle)}</div>
          <div class="resource-meta-stack">
            <div><strong>Resource type:</strong> ${escapeHtml(resourceType)}</div>
            <div><strong>Format:</strong> ${escapeHtml(worksheetFormat || "—")}</div>
            <div><strong>Difficulty:</strong> ${escapeHtml(item.difficulty ? friendlyWorksheetLabel(item.difficulty) : "—")}</div>
            <div><strong>Estimated time:</strong> ${escapeHtml(item.estimatedTimeMinutes ? `${item.estimatedTimeMinutes} min` : "—")}</div>
            <div><strong>Answer key:</strong> ${item.hasAnswerKey ? "Included" : "Not included"}</div>
            <div><strong>Practice focus:</strong> ${escapeHtml(worksheetPracticeFocus(item) || "—")}</div>
            <div><strong>Question style:</strong> ${escapeHtml(worksheetQuestionStyle(item))}</div>
          </div>
        </div>

        <div class="card">
          <div class="section-title">Curriculum</div>
          <div class="resource-meta-stack">
            <div><strong>Subject:</strong> ${escapeHtml(item.subject || "Math")}</div>
            <div><strong>Grade:</strong> ${escapeHtml((item.gradeLabels || []).join(", ") || "—")}</div>
            <div><strong>Domain:</strong> ${escapeHtml(domain || "—")}</div>
            <div><strong>Tags:</strong> ${escapeHtml((item.curriculumTags || []).join(", ") || "—")}</div>
          </div>
        </div>
      </aside>
    </div>
  </div>

  <div class="footer">© Project Yellow Bird — calm, print-first resources.</div>
  ${customizationScript}
</body>
</html>`;
}

/* =========================
   LIBRARY API
   ========================= */
router.get("/api/library/resources", (req, res) => {
  try {
    const resources = listResources({
      q: req.query.q,
      grade: req.query.grade,
      subject: req.query.subject,
      strand: req.query.strand,
      topic: req.query.topic,
      skill: req.query.skill,
      resourceType: req.query.resourceType,
      format: req.query.format,
      isFree: req.query.isFree,
      hasAnswerKey: req.query.hasAnswerKey,
      sort: req.query.sort || "newest"
    });

    return res.json({
      ok: true,
      total: resources.length,
      resources,
      filters: getAvailableFilters()
    });
  } catch (error) {
    console.error("LIBRARY API ERROR:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Failed to load library resources"
    });
  }
});

router.get("/resource/worksheet/:id", (req, res) => {
  try {
    const item = getWorksheetCatalogById(req.params.id);

    if (!item || item.status !== "ready") {
      return res.status(404).send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Worksheet Not Found — Project Yellow Bird</title>
  <link rel="stylesheet" href="/styles/site.css"/>
</head>
<body>
  <div class="container" style="padding-top:48px; padding-bottom:48px;">
    <h1 class="h1">Worksheet not found</h1>
    <p class="lede">That worksheet is not available in the public library.</p>
    <a class="btn primary" href="/browse">Back to Browse</a>
  </div>
</body>
</html>`);
    }

    return res.send(renderWorksheetDetailPage(item));
  } catch (error) {
    console.error("WORKSHEET DETAIL ERROR:", error);
    return res.status(500).send("Failed to load worksheet.");
  }
});

router.get("/resource/:slug", (req, res) => {
  try {
    const resource = getResourceBySlug(req.params.slug);

    if (!resource) {
      return res.status(404).send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Resource Not Found — Project Yellow Bird</title>
  <link rel="stylesheet" href="/styles/site.css"/>
</head>
<body>
  <div class="container" style="padding-top:48px; padding-bottom:48px;">
    <h1 class="h1">Resource not found</h1>
    <p class="lede">That resource could not be found.</p>
    <a class="btn primary" href="/browse">Back to Browse</a>
  </div>
</body>
</html>`);
    }

    const relatedResources = getRelatedResources(resource, 4);
    return res.send(renderResourceDetailPage(resource, relatedResources));
  } catch (error) {
    console.error("RESOURCE DETAIL ERROR:", error);
    return res.status(500).send("Failed to load resource.");
  }
});

router._test = {
  buildWorksheetCustomizationModel,
  renderWorksheetDetailPage
};

module.exports = router;
