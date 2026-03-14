const express = require("express");
const router = express.Router();
const { normLower } = require("../utils/helpers");

/* =========================
   DEMO LIBRARY API (Phase 1 scaffolding)
   ========================= */
const DEMO_LIBRARY = [
  {
    slug: "worksheet-generator-addition",
    title: "Worksheet Generator: Addition (Basic)",
    grades: ["1"],
    subject: "Math",
    strand: "number",
    formats: ["PDF"],
    prepTime: "Quick prep",
    isFree: true,
    downloads: 0,
    createdAt: "Demo",
  },
  {
    slug: "unit-generator-g1-attributes-numbers",
    title: "Unit Generator: Grade 1 — Attributes & Numbers",
    grades: ["1"],
    subject: "Math",
    strand: "number",
    formats: ["PDF"],
    prepTime: "Quick prep",
    isFree: true,
    downloads: 0,
    createdAt: "Demo",
  },
  {
    slug: "ten-frames-pack-demo",
    title: "Ten Frames Visuals (Demo Listing)",
    grades: ["K", "1"],
    subject: "Math",
    strand: "number",
    formats: ["PDF"],
    prepTime: "Quick prep",
    isFree: true,
    downloads: 0,
    createdAt: "Demo",
  },
];

function includesGrade(resource, grade) {
  if (!grade) return true;
  const gs = Array.isArray(resource.grades) ? resource.grades : [];
  return gs.map((x) => (x ?? "").toString()).includes(grade);
}

function includesFormat(resource, format) {
  if (!format) return true;
  const fs = Array.isArray(resource.formats) ? resource.formats : [];
  return fs.map((x) => (x ?? "").toString().toLowerCase()).includes(format.toLowerCase());
}

function matchesQuery(resource, q) {
  if (!q) return true;
  const t = normLower(resource.title);
  const s = normLower(resource.subject);
  const st = normLower(resource.strand);
  return t.includes(q) || s.includes(q) || st.includes(q);
}

/* =========================
   LIBRARY API
   ========================= */
router.get("/api/library/resources", (req, res) => {
  try {
    const q = normLower(req.query.q);
    const grade = (req.query.grade ?? "").toString().trim();
    const subject = normLower(req.query.subject);
    const strand = normLower(req.query.strand);
    const format = normLower(req.query.format);
    const sort = normLower(req.query.sort || "newest");

    let items = DEMO_LIBRARY.slice();
    items = items.filter((r) => matchesQuery(r, q));
    items = items.filter((r) => includesGrade(r, grade));
    if (subject) items = items.filter((r) => normLower(r.subject) === subject);
    if (strand) items = items.filter((r) => normLower(r.strand) === strand);
    if (format) items = items.filter((r) => includesFormat(r, format));

    if (sort === "downloads") {
      items.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    }

    return res.json({
      ok: true,
      total: items.length,
      resources: items,
    });
  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: "Failed to load library resources",
    });
  }
});

router.get("/resource/:slug", (req, res) => {
  return res.redirect("/browse");
});

module.exports = router;
