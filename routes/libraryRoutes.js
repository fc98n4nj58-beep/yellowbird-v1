const express = require("express");
const router = express.Router();

const {
  listResources,
  getResourceBySlug,
  getRelatedResources,
  getAvailableFilters
} = require("../services/resourceLibraryService");
const { getWorksheetCatalogById } = require("../services/worksheetCatalogService");

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

        <div class="card" style="margin-top:18px;">
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

        <div class="card" style="margin-top:18px;">
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

function renderWorksheetDetailPage(item) {
  const id = item.id;
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
          <a class="btn" href="${worksheetPreviewUrl(id)}">Preview</a>
          <a class="btn primary" href="${worksheetPdfUrl(id)}">PDF</a>
          <a class="btn" href="/browse">Browse More</a>
        </div>
      </section>

      <aside class="resource-side-panel">
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

        <div class="card" style="margin-top:18px;">
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

module.exports = router;
