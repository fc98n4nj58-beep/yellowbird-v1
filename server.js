require("dotenv").config();
const { getCurriculumRecipe } = require("./config/curriculumRecipes");
const express = require("express");
const path = require("path");
const fs = require("fs");
const { buildWorksheet } = require("./engine/worksheetBuilder/buildWorksheet");

const { getPackRecipe } = require("./config/packRecipes");
const { buildResourcePack } = require("./services/resourcePackService");

const { getWorksheetRecipe } = require("./config/worksheetRecipes");

const { buildExitTicket } = require("./services/exitTicketService");
const curriculumService = require("./services/curriculumService");

const { createContent } = require("./engine/contentFactory");
const { renderWorksheetPDF } = require("./renderers/pdfRenderer");

const { generateUnit } = require("./engine/units/unitFactory");
const { renderUnitPDF } = require("./renderers/unitPdfRenderer");

const { renderLessonWorksheetPDF, generateLessonWorksheetPDFBuffer } = require("./renderers/lessonWorksheetRenderer");

const archiver = require("archiver");
const unitFactory = require("./engine/units/unitFactory");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* =========================
   Helpers
   ========================= */
function toInt(v, fallback = 0) {
  const n = parseInt(v ?? "", 10);
  return Number.isFinite(n) ? n : fallback;
}

function str(v) {
  return (v ?? "").toString();
}

function normLower(v) {
  return (v ?? "").toString().trim().toLowerCase();
}

function sanitizeFilenamePart(s) {
  return (s ?? "")
    .toString()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[\/\\:*?"<>|]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "");
}

function prettyTopicForFilename(s) {
  return (s ?? "")
    .toString()
    .trim()
    .replace(/[\/\\:*?"<>|]/g, "")
    .replace(/\s+/g, "")
    .replace(/[^a-zA-Z0-9]/g, "");
}

/* =========================
   PAGES (UI)
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
function listStrands({ jurisdictionId, grade, subjectId }) {
  const d = curriculumService.getCurriculumRaw();
  const grades = Array.isArray(d.grades) ? d.grades : [];
  const normalizedGrade = normalizeGrade(grade);
  const g = grades.find((x) => String(x.grade || "").toLowerCase() === normalizedGrade);
  const strands = Array.isArray(g?.strands) ? g.strands : [];

  return strands.map((s) => ({
    id: s.id,
    name: s.name
  }));
}

function listTopics({ jurisdictionId, grade, subjectId, strandId }) {
  const d = curriculumService.getCurriculumRaw();
  const grades = Array.isArray(d.grades) ? d.grades : [];
  const normalizedGrade = normalizeGrade(grade);
  const g = grades.find((x) => String(x.grade || "").toLowerCase() === normalizedGrade);
  const strands = Array.isArray(g?.strands) ? g.strands : [];
  const s = strands.find(
    (x) => String(x.id || "").toUpperCase() === String(strandId || "").toUpperCase()
  );
  const topics = Array.isArray(s?.topics) ? s.topics : [];

  return topics.map((t) => ({
    id: t.id,
    name: t.name
  }));
}

function listExpectations({ jurisdictionId, grade, subjectId, strandId, topicId }) {
  const d = curriculumService.getCurriculumRaw();
  const grades = Array.isArray(d.grades) ? d.grades : [];
  const normalizedGrade = normalizeGrade(grade);
  const g = grades.find((x) => String(x.grade || "").toLowerCase() === normalizedGrade);
  const strands = Array.isArray(g?.strands) ? g.strands : [];
  const s = strands.find(
    (x) => String(x.id || "").toUpperCase() === String(strandId || "").toUpperCase()
  );
  const topics = Array.isArray(s?.topics) ? s.topics : [];
  const t = topics.find(
    (x) => String(x.id || "").toUpperCase() === String(topicId || "").toUpperCase()
  );
  const exps = Array.isArray(t?.expectations) ? t.expectations : [];

  return exps.map((e) => ({
    id: e.id,
    code: e.code || "",
    name: e.code ? `${e.code}` : (e.id || ""),
    text: e.text || ""
  }));
}

function getExpectationById(id) {
  const d = curriculumService.getCurriculumRaw();
  const grades = Array.isArray(d.grades) ? d.grades : [];

  for (const g of grades) {
    const strands = Array.isArray(g.strands) ? g.strands : [];

    for (const s of strands) {
      const topics = Array.isArray(s.topics) ? s.topics : [];

      for (const t of topics) {
        const expectations = Array.isArray(t.expectations) ? t.expectations : [];

        for (const e of expectations) {
  if (String(e.id) !== String(id)) continue;

  const expRecipe = e.worksheet_recipe || t.topic_recipe || null;

  return {
    ok: true,
    source: "curriculum dataset",
    loadedFrom: "data/curriculum/ontario/math_k6.json",
    version: d.version || "",
    jurisdiction: d.jurisdiction,
    subject: d.subject,
    grade: g.grade,
    strand: { id: s.id, name: s.name },
    topic: { id: t.id, name: t.name },
    expectation: {
      id: e.id,
      code: e.code || "",
      text: e.text || "",
      worksheet_recipe: expRecipe,
      learningGoal: e.learningGoal || "",
      successCriteria: Array.isArray(e.successCriteria) ? e.successCriteria : [],
    },
  };
}
      }
    }
  }

  return null;
}

/* =========================
   CURRICULUM API (read-only)
   ========================= */
app.get("/api/curriculum/jurisdictions", (req, res) => {
  try {
    const items = listJurisdictions().map((j) => ({ id: j.id, name: j.name }));
    return res.json({ ok: true, jurisdictions: items });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || "Failed to list jurisdictions" });
  }
});

app.get("/api/curriculum/grades", (req, res) => {
  try {
    const jurisdictionId = str(req.query.jurisdiction || "ON");
    const subjectId = str(req.query.subject || "MATH");
    const grades = listGrades({ jurisdictionId, subjectId });
    return res.json({ ok: true, grades });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || "Failed to list grades" });
  }
});

app.get("/api/curriculum/subjects", (req, res) => {
  try {
    const jurisdictionId = str(req.query.jurisdiction || "ON");
    const grade = str(req.query.grade || "3");
    const subjects = listSubjects({ jurisdictionId, grade });
    return res.json({ ok: true, subjects: subjects.map((s) => ({ id: s.id, name: s.name })) });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || "Failed to list subjects" });
  }
});

app.get("/api/curriculum/strands", (req, res) => {
  try {
    const jurisdictionId = str(req.query.jurisdiction || "ON");
    const grade = str(req.query.grade || "3");
    const subjectId = str(req.query.subject || "MATH");
    const strands = listStrands({ jurisdictionId, grade, subjectId });
    return res.json({ ok: true, strands });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || "Failed to list strands" });
  }
});

app.get("/api/curriculum/topics", (req, res) => {
  try {
    const jurisdictionId = str(req.query.jurisdiction || "ON");
    const grade = str(req.query.grade || "3");
    const subjectId = str(req.query.subject || "MATH");
    const strandId = str(req.query.strandId || "");
    const topics = listTopics({ jurisdictionId, grade, subjectId, strandId });
    return res.json({ ok: true, topics });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || "Failed to list topics" });
  }
});

app.get("/api/curriculum/expectations", (req, res) => {
  try {
    const jurisdictionId = str(req.query.jurisdiction || "ON");
    const grade = str(req.query.grade || "3");
    const subjectId = str(req.query.subject || "MATH");
    const strandId = str(req.query.strandId || "");
    const topicId = str(req.query.topicId || "");
    const expectations = listExpectations({ jurisdictionId, grade, subjectId, strandId, topicId });
    return res.json({ ok: true, expectations });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || "Failed to list expectations" });
  }
});

app.get("/api/curriculum/expectation", (req, res) => {
  try {
    const id = str(req.query.id || "");
    if (!id) return res.status(400).json({ ok: false, error: "id is required" });

    const obj = getExpectationById(id);
    if (!obj) return res.status(404).json({ ok: false, error: "Expectation not found" });

    return res.json(obj);
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || "Failed to load expectation" });
  }
});

app.get("/curriculum/on/:subject/:grade/:strand/:expectationCode", (req, res) => {
  const { subject, grade, strand, expectationCode } = req.params;

  const all = curriculumService.getCurriculumRaw();
  const grades = Array.isArray(all.grades) ? all.grades : [];

  const normalize = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9.-]/g, "");

  const gradeMatch = String(grade).toLowerCase();
  const subjectMatch = String(subject).toLowerCase();
  const strandMatch = normalize(strand);
  const codeMatch = String(expectationCode).trim().toUpperCase();

  let found = null;

  for (const g of grades) {
    const gKey = `grade${g.grade}`;
    if (gKey !== gradeMatch) continue;

    const strands = Array.isArray(g.strands) ? g.strands : [];

    for (const s of strands) {
      const strandSlug = normalize(s.name || s.id);
      if (strandSlug !== strandMatch) continue;

      const topics = Array.isArray(s.topics) ? s.topics : [];

      for (const t of topics) {
        const expectations = Array.isArray(t.expectations) ? t.expectations : [];

               for (const e of expectations) {
          if (String(e.code || "").toUpperCase() !== codeMatch) continue;

          found = {
            jurisdiction: all.jurisdiction,
            subject: all.subject,
            grade: g.grade,
            gradeLabel: g.gradeLabel || `Grade ${g.grade}`,
            strand: {
              id: s.id,
              name: s.name,
            },
            topic: {
              id: t.id,
              name: t.name,
            },
            expectation: {
              id: e.id,
              code: e.code,
              text: e.text,
              worksheet_recipe: e.worksheet_recipe || null,
              learningGoal: e.learningGoal || "",
              successCriteria: Array.isArray(e.successCriteria) ? e.successCriteria : [],
            },
          };
          break;
        }

        if (found) break;
      }

      if (found) break;
    }

    if (found) break;
  }

  if (!found) {
    return res.status(404).send(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Expectation Not Found</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            body {
              font-family: "Source Sans 3", Arial, sans-serif;
              background: #fcfbf8;
              color: #1f2937;
              margin: 0;
              padding: 48px 24px;
            }
            .wrap {
              max-width: 900px;
              margin: 0 auto;
            }
            h1 {
              font-size: 36px;
              margin-bottom: 12px;
            }
            p {
              font-size: 18px;
              line-height: 1.5;
            }
            a {
              color: #111827;
            }
          </style>
        </head>
        <body>
          <div class="wrap">
            <h1>Expectation not found</h1>
            <p>We couldn’t find that curriculum expectation.</p>
            <p><a href="/curriculum">Back to Curriculum</a></p>
          </div>
        </body>
      </html>
    `);
  }

   const learningGoal = found.expectation.learningGoal || "Coming soon";
  const successCriteria = Array.isArray(found.expectation.successCriteria)
    ? found.expectation.successCriteria
    : [];

  const successCriteriaHtml = successCriteria.length
    ? `<ul class="criteria-list">
        ${successCriteria.map((item) => `<li>${item}</li>`).join("")}
      </ul>`
    : `<p class="muted">Coming soon</p>`;

    const curriculumRecipe = getCurriculumRecipe(found.expectation?.code);

const worksheetRecipe = curriculumRecipe?.worksheet || null;
const packRecipe = curriculumRecipe?.pack || null;
const exitTicketType = curriculumRecipe?.exitTicket?.type || "general-check";

const worksheetUrl =
  `/worksheet?subject=${encodeURIComponent(found.subject?.name || "Math")}` +
  `&grade=${encodeURIComponent(found.grade || "")}` +
  `&strand=${encodeURIComponent(found.strand?.name || "")}` +
  `&topic=${encodeURIComponent(found.topic?.name || "")}` +
  `&expectation=${encodeURIComponent(found.expectation?.code || "")}` +
  `&expectationId=${encodeURIComponent(found.expectation?.id || "")}` +
  `&expectationText=${encodeURIComponent(found.expectation?.text || "")}` +
  `&recipeMode=${encodeURIComponent(worksheetRecipe?.mode || "")}` +
  `&recipeTitle=${encodeURIComponent(worksheetRecipe?.title || "")}` +
  `&recipeQuestionCount=${encodeURIComponent(worksheetRecipe?.suggestedQuestionCount || "")}` +
  `&recipeDifficulty=${encodeURIComponent(worksheetRecipe?.suggestedDifficulty || "")}` +
  `&operation=${encodeURIComponent(worksheetRecipe?.config?.operation || "")}` +
  `&aMin=${encodeURIComponent(worksheetRecipe?.config?.aMin ?? "")}` +
  `&aMax=${encodeURIComponent(worksheetRecipe?.config?.aMax ?? "")}` +
  `&bMin=${encodeURIComponent(worksheetRecipe?.config?.bMin ?? "")}` +
  `&bMax=${encodeURIComponent(worksheetRecipe?.config?.bMax ?? "")}`;

  const exitTicketUrl =
  `/exit-ticket?expectation=${encodeURIComponent(found.expectation?.code || "")}` +
  `&expectationId=${encodeURIComponent(found.expectation?.id || "")}` +
  `&exitTicketType=${encodeURIComponent(exitTicketType)}`;

const packUrl =
  `/pack-preview?subject=${encodeURIComponent(found.subject?.name || "Math")}` +
  `&grade=${encodeURIComponent(found.grade || "")}` +
  `&strand=${encodeURIComponent(found.strand?.name || "")}` +
  `&topic=${encodeURIComponent(found.topic?.name || "")}` +
  `&expectation=${encodeURIComponent(found.expectation?.code || "")}` +
  `&expectationId=${encodeURIComponent(found.expectation?.id || "")}` +
  `&expectationText=${encodeURIComponent(found.expectation?.text || "")}`;

  res.send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${found.gradeLabel} Math – ${found.expectation.code}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;700&display=swap" rel="stylesheet">
        <style>
          :root {
            --bg: #fcfbf8;
            --surface: #ffffff;
            --text: #1f2937;
            --muted: #6b7280;
            --border: #d6d3d1;
            --accent: #111827;
            --soft: #f5f5f4;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            font-family: "Source Sans 3", Arial, sans-serif;
            background: var(--bg);
            color: var(--text);
          }

          a {
            color: inherit;
            text-decoration: none;
          }

          .wrap {
            max-width: 1080px;
            margin: 0 auto;
            padding: 36px 24px 72px;
          }

          .topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 36px;
          }

          .crumb {
            font-size: 15px;
            color: var(--muted);
          }

          .crumb a {
            border-bottom: 1px solid var(--border);
          }

          .eyebrow {
            font-size: 13px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--muted);
            margin-bottom: 12px;
          }

          .hero {
            margin-bottom: 36px;
          }

          .hero h1 {
            font-size: 42px;
            line-height: 1.08;
            font-weight: 700;
            margin: 0 0 12px;
          }

          .hero-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 18px;
          }

          .tag {
            display: inline-flex;
            align-items: center;
            min-height: 34px;
            padding: 6px 12px;
            border: 1px solid var(--border);
            border-radius: 999px;
            background: var(--surface);
            font-size: 15px;
            color: var(--text);
          }

          .hero-text {
            font-size: 22px;
            line-height: 1.4;
            color: #374151;
            max-width: 900px;
          }

          .grid {
            display: grid;
            grid-template-columns: 1.05fr 1fr;
            gap: 24px;
            align-items: start;
          }

          .card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 24px;
          }

          .card h2 {
            margin: 0 0 18px;
            font-size: 24px;
            line-height: 1.2;
          }

          .section-block + .section-block {
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid #ece7e2;
          }

          .label {
            display: block;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--muted);
            margin-bottom: 8px;
          }

          .body-text {
            font-size: 18px;
            line-height: 1.55;
          }

          .muted {
            font-size: 17px;
            line-height: 1.5;
            color: var(--muted);
            margin: 0;
          }

          .criteria-list {
            margin: 0;
            padding-left: 20px;
          }

          .criteria-list li {
            margin-bottom: 10px;
            font-size: 18px;
            line-height: 1.5;
          }

          .generator-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .generator-btn,
          .generator-soon {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: space-between;
            min-height: 112px;
            padding: 18px;
            border-radius: 8px;
            border: 1px solid var(--border);
            background: var(--surface);
            transition: background 0.15s ease, border-color 0.15s ease;
          }

          .generator-btn:hover {
            background: var(--soft);
            border-color: #c9c4bc;
          }

          .generator-btn-title,
          .generator-soon-title {
            font-size: 19px;
            font-weight: 700;
            margin-bottom: 8px;
          }

          .generator-btn-copy,
          .generator-soon-copy {
            font-size: 16px;
            line-height: 1.45;
            color: #4b5563;
          }

          .generator-soon {
            background: #fafaf9;
            color: #6b7280;
          }

          .status {
            margin-top: 12px;
            font-size: 13px;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: #78716c;
          }

          .meta-list {
            display: grid;
            gap: 12px;
          }

          .meta-row {
            font-size: 17px;
            line-height: 1.45;
          }

          .meta-row strong {
            display: inline-block;
            min-width: 110px;
          }

          @media (max-width: 860px) {
            .grid {
              grid-template-columns: 1fr;
            }

            .generator-grid {
              grid-template-columns: 1fr;
            }

            .hero h1 {
              font-size: 34px;
            }

            .hero-text {
              font-size: 20px;
            }
          }
        </style>
      </head>
      <body>
        <main class="wrap">
          <div class="topbar">
            <div class="crumb">
              <a href="/curriculum">Curriculum</a>
            </div>
          </div>

          <section class="hero">
            <div class="eyebrow">Curriculum Expectation</div>

            <div class="hero-meta">
              <span class="tag">${found.gradeLabel}</span>
              <span class="tag">${found.subject?.name || "Math"}</span>
              <span class="tag">Strand: ${found.strand.name}</span>
              <span class="tag">Expectation ${found.expectation.code}</span>
            </div>

            <h1>${found.gradeLabel} ${found.subject?.name || "Math"}</h1>

            <div class="hero-text">
              ${found.expectation.text || found.expectation.code}
            </div>
          </section>

          <section class="grid">
            <div class="card">
              <h2>Teacher Context</h2>

              <div class="section-block">
                <span class="label">Learning Goal</span>
                <div class="body-text">${learningGoal}</div>
              </div>

              <div class="section-block">
                <span class="label">Success Criteria</span>
                ${successCriteriaHtml}
              </div>
            </div>

            <div class="card">
              <h2>Generate Resources</h2>

              <div class="generator-grid">
                <a class="generator-btn" href="${worksheetUrl}">
  <div>
    <div class="generator-btn-title">Generate Worksheet</div>
    <div class="generator-btn-copy">
      Create a printable worksheet aligned to this expectation.
    </div>
    <div class="status">
      ${worksheetRecipe ? `Suggested: ${worksheetRecipe.title}` : `General worksheet`}
    </div>
  </div>
</a>

                <div class="generator-soon">
                  <div>
                    <div class="generator-soon-title">Generate Lesson Slides</div>
                    <div class="generator-soon-copy">
                      Whole-class teaching slides for this curriculum expectation.
                    </div>
                  </div>
                  <div class="status">Coming soon</div>
                </div>

                <a class="generator-btn" href="${exitTicketUrl}">
  <div>
    <div class="generator-btn-title">Generate Exit Ticket</div>
    <div class="generator-btn-copy">
      Quick check-for-understanding aligned to this expectation.
    </div>
    <div class="status">
      ${packRecipe?.exitTicketType ? `Suggested: ${packRecipe.exitTicketType}` : `General exit ticket`}
    </div>
  </div>
</a>

                <div class="generator-soon">
                  <div>
                    <div class="generator-soon-title">Generate Assessment</div>
                    <div class="generator-soon-copy">
                      Build a simple assessment matched to this expectation.
                    </div>
                  </div>
                  <div class="status">Coming soon</div>
                </div>

               <a class="generator-btn" href="${packUrl}" style="grid-column: 1 / -1;">
  <div>
    <div class="generator-btn-title">Generate Lesson Pack</div>
    <div class="generator-btn-copy">
      Bundle lesson materials, worksheets, and support resources.
    </div>
    <div class="status">
      ${packRecipe ? `Suggested: ${packRecipe.title}` : `General pack`}
    </div>
  </div>
</a>
          </section>

          <section class="card" style="margin-top: 24px;">
            <h2>Expectation Details</h2>
            <div class="meta-list">
              <div class="meta-row"><strong>Jurisdiction:</strong> ${found.jurisdiction?.name || "Ontario"}</div>
              <div class="meta-row"><strong>Subject:</strong> ${found.subject?.name || "Math"}</div>
              <div class="meta-row"><strong>Grade:</strong> ${found.gradeLabel}</div>
              <div class="meta-row"><strong>Strand:</strong> ${found.strand.name}</div>
              <div class="meta-row"><strong>Topic:</strong> ${found.topic.name}</div>
              <div class="meta-row"><strong>Expectation Code:</strong> ${found.expectation.code}</div>
              <div class="meta-row"><strong>Expectation ID:</strong> ${found.expectation.id}</div>
            </div>
          </section>
        </main>
      </body>
    </html>
  `);
});

/* =========================
   WORKSHEET PDF (existing endpoint)
   - Adds curriculum metadata ONLY when source=curriculum
   ========================= */
app.get("/api/worksheet.pdf", (req, res) => {
  try {
    const modeId = str(req.query.mode || "math.addition.basic");
    const includeAnswerKey = str(req.query.answers ?? "1") !== "0";

    const options = {
      includeAnswerKey,
      fontSize: parseInt(req.query.font || "11", 10),
      cols: parseInt(req.query.cols || "2", 10),

      // curriculum-only knobs
      source: str(req.query.source || ""),
      filename: "",
    };

    let contentObject;

    if (modeId === "mixed") {
      const plan = [
        { p: "add", label: "Addition", mode: "math.addition.basic", count: Math.max(0, toInt(req.query.addCount, 0)) },
        { p: "sub", label: "Subtraction", mode: "math.subtraction.nonnegative", count: Math.max(0, toInt(req.query.subCount, 0)) },
        { p: "mul", label: "Multiplication", mode: "math.multiplication.basic", count: Math.max(0, toInt(req.query.mulCount, 0)) },
        { p: "div", label: "Division", mode: "math.division.integer", count: Math.max(0, toInt(req.query.divCount, 0)) },
      ].filter((x) => x.count > 0);

      if (!plan.length) {
        const err = new Error("Mixed mode: set at least one per-operation count above 0.");
        err.status = 400;
        throw err;
      }

      const mergedItems = [];
      let id = 1;

      for (const section of plan) {
        mergedItems.push({ type: "section", title: section.label });

        const params = {
          aMin: req.query[`${section.p}AMin`],
          aMax: req.query[`${section.p}AMax`],
          bMin: req.query[`${section.p}BMin`],
          bMax: req.query[`${section.p}BMax`],
          only: req.query[`${section.p}Only`],
          exclude: req.query[`${section.p}Exclude`],
          count: section.count,
          nonneg: req.query.nonneg,
          intdiv: req.query.intdiv,
        };

        const sectionContent = createContent({ modeId: section.mode, params });
        const items = sectionContent?.content?.items || [];
        for (const it of items) {
          mergedItems.push({ ...it, id });
          id++;
        }
      }

      contentObject = {
        meta: {
          modeId: "math.mixed.basic",
          subject: "math",
          title: "Mixed Practice",
        },
        content: { instructions: null, items: mergedItems },
      };
    } else {
      const params = {
        aMin: req.query.aMin,
        aMax: req.query.aMax,
        bMin: req.query.bMin,
        bMax: req.query.bMax,
        only: req.query.only,
        exclude: req.query.exclude,
        count: req.query.count,
        nonneg: req.query.nonneg,
        intdiv: req.query.intdiv,
      };

      contentObject = createContent({ modeId, params });

      // Worksheet subheading (manual generator)
      const aMin2 = (req.query.aMin ?? "1").toString();
      const aMax2 = (req.query.aMax ?? "20").toString();
      const bMin2 = (req.query.bMin ?? "1").toString();
      const bMax2 = (req.query.bMax ?? "20").toString();
      const onlyTxt = (req.query.only ?? "").toString().trim();
      const exclTxt = (req.query.exclude ?? "").toString().trim();

      const parts = [
        `First Digit: ${aMin2}–${aMax2}`,
        `Second Digit: ${bMin2}–${bMax2}`,
      ];
      if (onlyTxt) parts.push(`Only: ${onlyTxt}`);
      if (exclTxt) parts.push(`Exclude: ${exclTxt}`);

      contentObject.meta = contentObject.meta || {};
      contentObject.meta.subheading = parts.join("  •  ");
    }

    // Curriculum metadata (ONLY when source=curriculum)
    if (str(req.query.source) === "curriculum") {
      const jurisdictionId = str(req.query.jurisdictionId || "ON");
      const grade = str(req.query.grade || "");
      const subjectName = str(req.query.subjectName || "Math");
      const strandName = str(req.query.strandName || "");
      const topicName = str(req.query.topicName || "");
      const expectationCode = str(req.query.expectationCode || "");
      const expectationId = str(req.query.expectationId || "");

      const footer = [
        jurisdictionId === "ON" ? "Ontario" : jurisdictionId,
        grade ? `Grade ${grade} ${subjectName}` : subjectName,
        strandName ? strandName : "",
        topicName ? topicName : "",
        expectationCode ? expectationCode : "",
      ].filter(Boolean).join(" • ");

      contentObject.meta = contentObject.meta || {};
      contentObject.meta.curriculum = {
        source: "curriculum",
        jurisdictionId,
        grade,
        subjectName,
        strandName,
        topicName,
        expectationCode,
        expectationId,
        footerText: footer,
      };

      // Filename rule
      const fn = [
        sanitizeFilenamePart(jurisdictionId),
        grade ? `G${sanitizeFilenamePart(grade)}` : "",
        sanitizeFilenamePart(subjectName),
        sanitizeFilenamePart(strandName),
        prettyTopicForFilename(topicName),
        sanitizeFilenamePart(expectationCode),
        "Worksheet",
      ].filter(Boolean).join("_") + ".pdf";

      options.filename = fn;
    }

    renderWorksheetPDF({ res, contentObject, options });
  } catch (err) {
    res.status(err.status || 500).send(err.message || "Server error");
  }
});

/* =========================
   UNIT GENERATOR API
   ========================= */
app.get("/api/generate-unit/modes", (req, res) => {
  try {
    const modes = unitFactory.listModes();
    return res.json({ ok: true, modes });
  } catch (e) {
    return res.status(500).json({ ok: false, error: "Failed to list unit modes" });
  }
});

app.post("/api/generate-unit", async (req, res) => {
  try {
    const result = await unitFactory.generateUnit(req.body);
    return res.json({ ok: true, ...result });
  } catch (e) {
    const status = e.statusCode || 500;
    return res.status(status).json({
      ok: false,
      error: e.message || "Unit generation failed",
      details: e.details || [],
    });
  }
});

/* =========================
   UNIT PDF
   ========================= */
function pickDefaultModeKeySafe() {
  try {
    const modes = (typeof unitFactory.listModes === "function") ? unitFactory.listModes() : [];
    if (!Array.isArray(modes) || !modes.length) return "";
    const m0 = modes[0];

    // Try common shapes: {modeKey}, {key}, {id}, {value}
    return (
      (m0 && (m0.modeKey || m0.key || m0.id || m0.value)) ?
        String(m0.modeKey || m0.key || m0.id || m0.value) :
        ""
    );
  } catch {
    return "";
  }
}

app.get("/api/unit.pdf", async (req, res) => {
  try {
    const payload = {
      jurisdiction: (req.query.jurisdiction || "ontario").toString(),
      grade: (req.query.grade || "1").toString(),
      subject: (req.query.subject || "math").toString(),
      numLessons: parseInt((req.query.numLessons || "10").toString(), 10),
      modeKey: (req.query.modeKey || "").toString(),
      theme: (req.query.theme || "").toString(),
    };

    // NEW: if modeKey not provided, pick the first available mode from unitFactory.listModes()
    if (!payload.modeKey) {
      const fallback = pickDefaultModeKeySafe();
      if (!fallback) {
        return res.status(400).send("modeKey is required (and no default modeKey could be found).");
      }
      payload.modeKey = fallback;
    }

    const envelope = await generateUnit(payload);
    renderUnitPDF({ res, unitEnvelope: envelope });
  } catch (err) {
    res.status(err.statusCode || 500).send(err.message || "Unit PDF error");
  }
});

/* =========================
   LESSON WORKSHEET PDF
   ========================= */
app.get("/api/lesson-worksheet.pdf", async (req, res) => {
  try {
    const modeKey = (req.query.modeKey || "").toString();
    const day = parseInt((req.query.day || "1").toString(), 10);

    if (!modeKey) return res.status(400).send("modeKey is required");
    if (!Number.isFinite(day) || day < 1) return res.status(400).send("day must be a positive integer");

    const envelope = await unitFactory.generateUnit({
      jurisdiction: (req.query.jurisdiction || "ontario").toString(),
      grade: (req.query.grade || "1").toString(),
      subject: (req.query.subject || "math").toString(),
      numLessons: parseInt((req.query.numLessons || "10").toString(), 10),
      modeKey,
      theme: (req.query.theme || "").toString(),
    });

    renderLessonWorksheetPDF({ res, unitEnvelope: envelope, day });
  } catch (err) {
    res.status(err.statusCode || 500).send(err.message || "Lesson worksheet PDF error");
  }
});

/* =========================
   UNIT PACK ZIP
   ========================= */
app.get("/api/unit-pack.zip", async (req, res) => {
  try {
    const modeKey = (req.query.modeKey || "").toString();
    if (!modeKey) return res.status(400).send("modeKey is required");

    const envelope = await unitFactory.generateUnit({
      jurisdiction: (req.query.jurisdiction || "ontario").toString(),
      grade: (req.query.grade || "1").toString(),
      subject: (req.query.subject || "math").toString(),
      numLessons: parseInt((req.query.numLessons || "10").toString(), 10),
      modeKey,
      theme: (req.query.theme || "").toString(),
    });

    const unit = envelope.unit;
    const lessons = Array.isArray(unit?.lessons) ? unit.lessons : [];
    if (!lessons.length) return res.status(400).send("Unit has no lessons");

    const baseName = (unit.title || "unit").toString().trim().replace(/\s+/g, "_");
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${baseName}_Worksheets.zip"`);

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (err) => { throw err; });
    archive.pipe(res);

    for (const L of lessons) {
      const dayNum = Number(L.day);
      const buf = await generateLessonWorksheetPDFBuffer({ unitEnvelope: envelope, day: dayNum });

      const safeFocus = (L.focus || `Day_${dayNum}`)
        .toString()
        .replace(/[\/\\:*?"<>|]/g, "")
        .replace(/\s+/g, "_")
        .slice(0, 60);

      const filename = `Day_${String(dayNum).padStart(2, "0")}_${safeFocus}.pdf`;
      archive.append(buf, { name: filename });
    }

    await archive.finalize();
  } catch (err) {
    res.status(err.statusCode || 500).send(err.message || "Unit pack ZIP error");
  }
});
app.get("/pack-preview", (req, res) => {
  const expectationCode = String(req.query.expectation || "").toUpperCase();
  const expectationId = String(req.query.expectationId || "");

  const raw = curriculumService.getCurriculumRaw();
  const grades = Array.isArray(raw.grades) ? raw.grades : [];

  let found = null;

  for (const g of grades) {
    const strands = Array.isArray(g.strands) ? g.strands : [];

    for (const s of strands) {
      const topics = Array.isArray(s.topics) ? s.topics : [];

      for (const t of topics) {
        const expectations = Array.isArray(t.expectations) ? t.expectations : [];

        for (const e of expectations) {
          const matchesId =
           expectationId && String(e.id) === expectationId;

          const matchesCode =
            expectationCode &&
           String(e.code || "").toUpperCase() === expectationCode;
          if (!matchesId && !matchesCode) continue;

          found = {
            jurisdiction: raw.jurisdiction,
            subject: raw.subject,
            grade: g.grade,
            gradeLabel: g.gradeLabel || `Grade ${g.grade}`,
           strand: {
  id: s.id,
  name: s.name,
},
topic: {
  id: t.id,
  name: t.name,
}, 
            expectation: {
              id: e.id,
code: e.code,
text: e.text,
              worksheet_recipe: e.worksheet_recipe || null,
              learningGoal: e.learning_goal || "",
              successCriteria: Array.isArray(e.success_criteria)
                ? e.success_criteria
                : [],
            },
          };
          break;
        }

        if (found) break;
      }

      if (found) break;
    }

    if (found) break;
  }

  if (!found) {
    return res.status(404).send("Pack preview not found.");
  }

  const pack = buildResourcePack(found);
  const expectationUrl =
  `/curriculum/on/${String(found.subject?.name || "Math").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9.-]/g, "")}` +
  `/grade${encodeURIComponent(found.grade || "")}` +
  `/${String(found.strand?.name || "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9.-]/g, "")}` +
  `/${String(found.expectation?.code || "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9.-]/g, "")}`;
const exitTicketUrl =
  `/exit-ticket?expectation=${encodeURIComponent(found.expectation?.code || "")}` +
  `&expectationId=${encodeURIComponent(found.expectation?.id || "")}` +
  `&exitTicketType=${encodeURIComponent(pack.exitTicket?.type || "general-check")}`;
  const worksheetUrl =
  `/worksheet?subject=${encodeURIComponent(found.subject?.name || "Math")}` +
  `&grade=${encodeURIComponent(found.grade || "")}` +
  `&strand=${encodeURIComponent(found.strand?.name || "")}` +
  `&topic=${encodeURIComponent(found.topic?.name || "")}` +
  `&expectation=${encodeURIComponent(found.expectation?.code || "")}` +
  `&expectationId=${encodeURIComponent(found.expectation?.id || "")}` +
  `&expectationText=${encodeURIComponent(found.expectation?.text || "")}` +
  `&recipeMode=${encodeURIComponent(pack.worksheet?.recipe?.mode || "")}` +
  `&recipeTitle=${encodeURIComponent(pack.worksheet?.recipe?.title || "")}` +
  `&recipeQuestionCount=${encodeURIComponent(pack.worksheet?.recipe?.suggestedQuestionCount || "")}` +
  `&recipeDifficulty=${encodeURIComponent(pack.worksheet?.recipe?.suggestedDifficulty || "")}` +
  `&operation=${encodeURIComponent(pack.worksheet?.recipe?.config?.operation || "")}` +
  `&aMin=${encodeURIComponent(pack.worksheet?.recipe?.config?.aMin ?? "")}` +
  `&aMax=${encodeURIComponent(pack.worksheet?.recipe?.config?.aMax ?? "")}` +
  `&bMin=${encodeURIComponent(pack.worksheet?.recipe?.config?.bMin ?? "")}` +
  `&bMax=${encodeURIComponent(pack.worksheet?.recipe?.config?.bMax ?? "")}`;
  res.send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${pack.meta.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: "Source Sans 3", Arial, sans-serif;
            background: #fcfbf8;
            color: #1f2937;
            margin: 0;
          }
          .wrap {
            max-width: 960px;
            margin: 0 auto;
            padding: 36px 24px 72px;
          }
          .card {
            background: #fff;
            border: 1px solid #d6d3d1;
            border-radius: 8px;
            padding: 24px;
            margin-bottom: 24px;
          }
          h1 {
            margin: 0 0 12px;
            font-size: 36px;
          }
          h2 {
            margin: 0 0 12px;
            font-size: 24px;
          }
          .muted {
            color: #6b7280;
          }
          ul {
            margin: 0;
            padding-left: 20px;
          }
          .pill {
            display: inline-block;
            padding: 6px 12px;
            border: 1px solid #d6d3d1;
            border-radius: 999px;
            margin-right: 8px;
            margin-bottom: 8px;
          }
          a {
            color: inherit;
            text-decoration: none;
          }
          .back {
            display: inline-block;
            margin-bottom: 18px;
            color: #6b7280;
            border-bottom: 1px solid #d6d3d1;
          }
        </style>
      </head>
      <body>
        <main class="wrap">
          <a class="back" href="${expectationUrl}">Back to Expectation</a>

          <div class="card">
            <h1>${pack.meta.title}</h1>
            <div class="muted">
              ${pack.meta.gradeLabel} • ${pack.meta.subject} • ${pack.meta.strand} • ${pack.meta.expectationCode}
            </div>
          </div>

          <div class="card">
            <h2>Pack Includes</h2>
            ${Object.entries(pack.includes)
              .filter(([, enabled]) => enabled)
              .map(([key]) => `<span class="pill">${key}</span>`)
              .join("")}
          </div>

          ${
            pack.teacherOverview
              ? `
            <div class="card">
              <h2>Teacher Overview</h2>
              <p><strong>Learning Goal:</strong> ${pack.teacherOverview.learningGoal || "Coming soon"}</p>
              <p><strong>Notes:</strong> ${pack.teacherOverview.notes}</p>
              <p><strong>Success Criteria:</strong></p>
              ${
                pack.teacherOverview.successCriteria.length
                  ? `<ul>${pack.teacherOverview.successCriteria.map((x) => `<li>${x}</li>`).join("")}</ul>`
                  : `<p class="muted">Coming soon</p>`
              }
            </div>
          `
              : ""
          }

          ${
  pack.worksheet
    ? `
  <div class="card">
    <h2>Worksheet</h2>
    <p><strong>Suggested Type:</strong> ${pack.worksheet.recipe.title}</p>
    <p><strong>Mode:</strong> ${pack.worksheet.recipe.mode}</p>
    <p><strong>Questions:</strong> ${pack.worksheet.recipe.suggestedQuestionCount}</p>
    <p><strong>Difficulty:</strong> ${pack.worksheet.recipe.suggestedDifficulty}</p>
    <p style="margin-top:18px;">
      <a href="${worksheetUrl}" style="display:inline-block;padding:10px 14px;border:1px solid #d6d3d1;border-radius:8px;text-decoration:none;color:#1f2937;">
        Generate Worksheet
      </a>
    </p>
  </div>
`
    : ""
}

          ${
  pack.exitTicket
    ? `
      <div class="card">
        <h2>Exit Ticket</h2>
        <p><strong>Type:</strong> ${pack.exitTicket.type}</p>
        <p><strong>Prompt:</strong> ${pack.exitTicket.prompt}</p>
        <p style="margin-top:18px;">
          <a href="${exitTicketUrl}" style="display:inline-block;padding:10px 14px;border:1px solid #d6d3d1;border-radius:8px;text-decoration:none;color:#1f2937;">
            Generate Exit Ticket
          </a>
        </p>
      </div>
    `
    : ""
}
        </main>
      </body>
    </html>
  `);
});

app.get("/exit-ticket", (req, res) => {
  const expectationCode = String(req.query.expectation || "").toUpperCase();
  const expectationId = String(req.query.expectationId || "");
  const exitTicketType = String(req.query.exitTicketType || "general-check");
  const expectationUrl =
  `/curriculum/on/${String(req.query.subject || "math").trim().toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9.-]/g,"")}` +
  `/grade${encodeURIComponent(req.query.grade || "")}` +
  `/${String(req.query.strand || "").trim().toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9.-]/g,"")}` +
  `/${String(req.query.expectation || "").trim().toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9.-]/g,"")}`;

  const raw = curriculumService.getCurriculumRaw();
  const grades = Array.isArray(raw.grades) ? raw.grades : [];

  let found = null;

  for (const g of grades) {
    const strands = Array.isArray(g.strands) ? g.strands : [];

    for (const s of strands) {
      const topics = Array.isArray(s.topics) ? s.topics : [];

      for (const t of topics) {
        const expectations = Array.isArray(t.expectations) ? t.expectations : [];

        for (const e of expectations) {
          const matchesId = expectationId && String(e.id) === expectationId;
          const matchesCode = expectationCode && String(e.code || "").toUpperCase() === expectationCode;
          if (!matchesId && !matchesCode) continue;

          found = {
            jurisdiction: raw.jurisdiction,
            subject: raw.subject,
            grade: g.grade,
            gradeLabel: g.gradeLabel || `Grade ${g.grade}`,
           strand: { id: s.id, name: s.name },
topic: { id: t.id, name: t.name },
expectation: {
  id: e.id,
  code: e.code,
  text: e.text,
              learningGoal: e.learning_goal || "",
              successCriteria: Array.isArray(e.success_criteria) ? e.success_criteria : [],
            },
          };
          break;
        }

        if (found) break;
      }

      if (found) break;
    }

    if (found) break;
  }

  if (!found) {
    return res.status(404).send("Exit ticket not found.");
  }

  const ticket = buildExitTicket(found, exitTicketType);

  res.send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${ticket.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: "Source Sans 3", Arial, sans-serif;
            background: #fcfbf8;
            color: #1f2937;
            margin: 0;
          }
          .wrap {
            max-width: 900px;
            margin: 0 auto;
            padding: 36px 24px 72px;
          }
          .sheet {
            background: #fff;
            border: 1px solid #d6d3d1;
            border-radius: 8px;
            padding: 32px;
          }
          .eyebrow {
            font-size: 13px;
            letter-spacing: .08em;
            text-transform: uppercase;
            color: #6b7280;
            margin-bottom: 12px;
          }
          h1 {
            margin: 0 0 12px;
            font-size: 32px;
          }
          .meta {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 24px;
          }
          .instructions {
            font-size: 18px;
            margin-bottom: 24px;
          }
          .question {
            margin-bottom: 28px;
          }
          .question-title {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 10px;
          }
          .line {
            border-bottom: 1px solid #d6d3d1;
            height: 28px;
            margin-bottom: 10px;
          }
          .back {
            display: inline-block;
            margin-bottom: 18px;
            color: #6b7280;
            border-bottom: 1px solid #d6d3d1;
            text-decoration: none;
          }
            .actions {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
}

.print-btn {
  appearance: none;
  border: 1px solid #d6d3d1;
  background: #ffffff;
  color: #1f2937;
  border-radius: 8px;
  padding: 10px 14px;
  font: inherit;
  cursor: pointer;
}

.print-btn:hover {
  background: #f5f5f4;
}

.back {
  display: inline-block;
  margin-bottom: 18px;
  color: #6b7280;
  text-decoration: none;
  border-bottom: 1px solid #d6d3d1;
}

@media print {
  body {
    background: #fff;
  }
  .back,
  .actions {
    display: none;
  }
  .sheet {
    border: none;
    padding: 0;
  }
}
        </style>
      </head>
      <body>
        <main class="wrap">
  <div class="actions">
    <a class="back" href="${expectationUrl}">Back to Expectation</a>
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <section class="sheet">
            <div class="eyebrow">Exit Ticket</div>
            <h1>${ticket.title}</h1>
            <div class="meta">
              ${found.gradeLabel} • ${found.subject?.name || "Math"} • ${found.strand.name} • ${found.expectation.code}
            </div>
            <div class="instructions">${ticket.instructions}</div>

            ${ticket.questions.map((q, i) => `
              <div class="question">
                <div class="question-title">${i + 1}. ${q}</div>
                <div class="line"></div>
                <div class="line"></div>
              </div>
            `).join("")}
          </section>
        </main>
      </body>
    </html>
  `);
});
// Generate worksheet from expectation
app.get("/api/generateWorksheet", (req, res) => {
  try {
    const expectation = String(req.query.expectation || "").trim();

    if (!expectation) {
      return res.status(400).json({
        error: "Missing required query parameter: expectation"
      });
    }

    const worksheet = buildWorksheet(expectation);

    res.json({
      ok: true,
      worksheet
    });

  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});
app.listen(PORT, () => {
  console.log(`Yellowbird v1 running → http://localhost:${PORT}`);
});