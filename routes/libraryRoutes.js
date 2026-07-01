const express = require("express");
const router = express.Router();

const {
  listResources,
  getResourceBySlug,
  getRelatedResources,
  getAvailableFilters
} = require("../services/resourceLibraryService");

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
        <a href="/curriculum">Curriculum</a>
        <a href="/worksheet">Worksheet Generator</a>
        <a href="/units">Unit Generator</a>
        <a href="/faq">FAQ</a>
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