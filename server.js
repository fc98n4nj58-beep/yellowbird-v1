/* =========================
   PROJECT YELLOW BIRD
   SERVER ENTRY POINT
========================= */

/*
ROLE
Boot Express server
Mount route modules
Serve static frontend

DO NOT put generation logic here.
That belongs in services / routes.
*/

require("dotenv").config();

const express = require("express");
const path = require("path");

const curriculumService = require("./services/curriculumService");
const { getCurriculumRecipe } = require("./config/curriculumRecipes");

// Route modules
const previewRoutes = require("./routes/previewRoutes");
const worksheetBuilderRoutes = require("./routes/worksheetBuilderRoutes");
const worksheetPdfRoutes = require("./routes/worksheetPdfRoutes");
const curriculumRoutes = require("./routes/curriculumRoutes");
const expectationRoutes = require("./routes/expectationRoutes");
const worksheetPreviewRoutes = require("./routes/worksheetPreviewRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// Route mounting
app.use(previewRoutes);
app.use(worksheetBuilderRoutes);
app.use(worksheetPdfRoutes);
app.use(curriculumRoutes);
app.use(expectationRoutes);
app.use(worksheetPreviewRoutes);

/* =========================
   PAGES ROUTES
   ========================= */
app.get("/", (req, res) => res.sendFile(__dirname + "/public/index.html"));
app.get("/worksheet", (req, res) => res.sendFile(__dirname + "/public/worksheet.html"));
app.get("/units", (req, res) => res.sendFile(__dirname + "/public/units.html"));

// Browse Library
app.get("/browse", (req, res) => res.sendFile(__dirname + "/public/browse.html"));

// Curriculum page (NEW)
app.get("/curriculum", (req, res) => res.sendFile(__dirname + "/public/curriculum.html"));

// QA smoke page (NEW)
app.get("/qa/smoke", (req, res) => res.sendFile(__dirname + "/public/qa_smoke.html"));

// FAQ placeholder (safe)
app.get("/faq", (req, res) => {
  res.status(200).send(`
    <html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>FAQ — Project Yellow Bird</title></head>
    <body style="font-family: system-ui,-apple-system,Segoe UI,Arial;padding:40px;max-width:900px;margin:0 auto;">
      <h1>FAQ</h1>
      <p>This page is a placeholder. Add <code>public/faq.html</code> when ready.</p>
      <p><a href="/browse">Back to Browse</a></p>
    </body></html>
  `);
});

/* =========================
   LIBRARY API (Phase 1 scaffolding)
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
  const fs2 = Array.isArray(resource.formats) ? resource.formats : [];
  return fs2.map((x) => (x ?? "").toString().toLowerCase()).includes(format.toLowerCase());
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
app.get("/api/library/resources", (req, res) => {
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

    return res.json({ ok: true, total: items.length, resources: items });
  } catch (e) {
    return res.status(500).json({ ok: false, error: "Failed to load library resources" });
  }
});

app.get("/resource/:slug", (req, res) => res.redirect("/browse"));

function listJurisdictions() {
  const d = curriculumService.getCurriculumRaw();
  return [d.jurisdiction || { id: "ON", name: "Ontario" }];
}

function listGrades({ jurisdictionId, subjectId }) {
  const d = curriculumService.getCurriculumRaw();
  const grades = Array.isArray(d.grades) ? d.grades : [];
  return grades.map((g) => ({ id: String(g.grade), name: g.gradeLabel || `Grade ${g.grade}` }));
}

function listSubjects({ jurisdictionId, grade }) {
  const d = curriculumService.getCurriculumRaw();
  return [d.subject || { id: "MATH", name: "Math" }];
}

function normalizeGrade(value) {
  const v = String(value || "").trim().toLowerCase();
  if (v.startsWith("grade")) return v;
  if (v === "k" || v === "kindergarten") return "kindergarten";
  if (/^\d+$/.test(v)) return `grade${v}`;
  return v;
}

app.listen(PORT, () => {
  console.log(`Yellow Bird running at http://localhost:${PORT}`);
});
