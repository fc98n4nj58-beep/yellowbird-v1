require("dotenv").config();

const express = require("express");
const path = require("path");

const { createContent } = require("./engine/contentFactory");
const { renderWorksheetPDF } = require("./renderers/pdfRenderer");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/worksheet.pdf", (req, res) => {
  try {
    const modeId = (req.query.mode || "math.addition.basic").toString();
    const includeAnswerKey = (req.query.answers ?? "1").toString() !== "0";

    const params = {
      // teacher controls
      aMin: req.query.aMin,
      aMax: req.query.aMax,
      bMin: req.query.bMin,
      bMax: req.query.bMax,
      only: req.query.only,
      exclude: req.query.exclude,
      count: req.query.count,

      // op-specific toggles
      nonneg: req.query.nonneg,
      intdiv: req.query.intdiv,
    };

    const contentObject = createContent({ modeId, params });

    const options = {
      includeAnswerKey,
      fontSize: parseInt(req.query.font || "16", 10),
      cols: parseInt(req.query.cols || "2", 10),
    };

    renderWorksheetPDF({ res, contentObject, options });
  } catch (err) {
    res.status(err.status || 500).send(err.message || "Server error");
  }
});

app.listen(PORT, () => {
  console.log(`Yellowbird v1 running → http://localhost:${PORT}`);
});