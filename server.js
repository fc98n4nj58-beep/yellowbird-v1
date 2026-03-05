require("dotenv").config();

const express = require("express");
const path = require("path");

const { createContent } = require("./engine/contentFactory");
const { renderWorksheetPDF } = require("./renderers/pdfRenderer");

const { generateUnit } = require("./engine/units/unitFactory");
const { renderUnitPDF } = require("./renderers/unitPdfRenderer");

const { renderLessonWorksheetPDF } = require("./renderers/lessonWorksheetRenderer");

const archiver = require("archiver");
const { generateLessonWorksheetPDFBuffer } = require("./renderers/lessonWorksheetRenderer");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

function toInt(v, fallback = 0) {
  const n = parseInt(v ?? "", 10);
  return Number.isFinite(n) ? n : fallback;
}

function str(v) {
  return (v ?? "").toString();
}
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/worksheet", (req, res) => {
  res.sendFile(__dirname + "/public/worksheet.html");
});

app.get("/units", (req, res) => {
  res.sendFile(__dirname + "/public/units.html");
});
app.get("/api/worksheet.pdf", (req, res) => {
  try {
    const modeId = str(req.query.mode || "math.addition.basic");
    const includeAnswerKey = str(req.query.answers ?? "1") !== "0";

    const options = {
      includeAnswerKey,
      fontSize: parseInt(req.query.font || "11", 10), // default 11
      cols: parseInt(req.query.cols || "2", 10),
    };

    let contentObject;

    if (modeId === "mixed") {
      const plan = [
        {
          p: "add",
          label: "Addition",
          mode: "math.addition.basic",
          count: Math.max(0, toInt(req.query.addCount, 0)),
        },
        {
          p: "sub",
          label: "Subtraction",
          mode: "math.subtraction.nonnegative",
          count: Math.max(0, toInt(req.query.subCount, 0)),
        },
        {
          p: "mul",
          label: "Multiplication",
          mode: "math.multiplication.basic",
          count: Math.max(0, toInt(req.query.mulCount, 0)),
        },
        {
          p: "div",
          label: "Division",
          mode: "math.division.integer",
          count: Math.max(0, toInt(req.query.divCount, 0)),
        },
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
          // per-op teacher controls
          aMin: req.query[`${section.p}AMin`],
          aMax: req.query[`${section.p}AMax`],
          bMin: req.query[`${section.p}BMin`],
          bMax: req.query[`${section.p}BMax`],
          only: req.query[`${section.p}Only`],
          exclude: req.query[`${section.p}Exclude`],
          count: section.count,

          // global toggles (still apply)
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
          subtitle: "Name: ____________________    Date: ____________________",
        },
        content: { instructions: null, items: mergedItems },
      };
    } else {
      // single mode uses global controls
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
    }

    renderWorksheetPDF({ res, contentObject, options });
  } catch (err) {
    res.status(err.status || 500).send(err.message || "Server error");
  }
});
// --- Unit Generator API (NEW) ---
const unitFactory = require('./engine/units/unitFactory');

app.get('/api/generate-unit/modes', (req, res) => {
  try {
    const modes = unitFactory.listModes();
    return res.json({ ok: true, modes });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Failed to list unit modes' });
  }
});

app.post('/api/generate-unit', async (req, res) => {
  try {
    const result = await unitFactory.generateUnit(req.body);
    return res.json({ ok: true, ...result });
  } catch (e) {
    const status = e.statusCode || 500;
    return res.status(status).json({
      ok: false,
      error: e.message || 'Unit generation failed',
      details: e.details || [],
    });
  }
});
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

    const envelope = await generateUnit(payload);
    renderUnitPDF({ res, unitEnvelope: envelope });
  } catch (err) {
    res.status(err.statusCode || 500).send(err.message || "Unit PDF error");
  }
});
app.get("/api/lesson-worksheet.pdf", async (req, res) => {
  try {
    const modeKey = (req.query.modeKey || "").toString();
    const day = parseInt((req.query.day || "1").toString(), 10);

    if (!modeKey) {
      return res.status(400).send("modeKey is required");
    }
    if (!Number.isFinite(day) || day < 1) {
      return res.status(400).send("day must be a positive integer");
    }

    // Use same engine so worksheets always match the generated unit
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

      const safeFocus = (L.focus || `Day_${dayNum}`).toString()
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
app.listen(PORT, () => {
  console.log(`Yellowbird v1 running → http://localhost:${PORT}`);
});