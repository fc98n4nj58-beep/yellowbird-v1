const express = require("express");
const router = express.Router();

const curriculumService = require("../services/curriculumService");
const { getCurriculumRecipe } = require("../config/curriculumRecipes");

/* =========================
   EXPECTATION PAGE ROUTE
   ========================= */
router.get("/curriculum/on/:subject/:grade/:strand/:expectationCode", (req, res) => {
  const { subject, grade, strand, expectationCode } = req.params;

  const found = curriculumService.getExpectationContextByRoute({
    subject,
    grade,
    strand,
    expectationCode,
  });

  if (!found) {
    return res.status(404).send(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>Expectation Not Found</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet">
          <style>
            :root {
              --yb-bg: #f8fafc;
              --yb-surface: #ffffff;
              --yb-surface-soft: #f3f7fb;
              --yb-text: #2f3a45;
              --yb-text-soft: #5f6b76;
              --yb-border: #dbe3ea;
              --yb-border-strong: #c8d3dd;
              --yb-accent: #6fa8dc;
              --yb-accent-soft: #eef5fb;
              --yb-sun: #f4d35e;
              --yb-radius: 8px;
              --yb-shadow: 0 1px 0 rgba(47, 58, 69, 0.03);
              --yb-max: 1120px;
            }

            * {
              box-sizing: border-box;
            }

            html, body {
              margin: 0;
              padding: 0;
            }

            body {
              font-family: "Source Sans 3", Arial, sans-serif;
              background:
                linear-gradient(180deg, #f6faff 0%, #f8fafc 180px, #f8fafc 100%);
              color: var(--yb-text);
            }

            a {
              color: inherit;
              text-decoration: none;
            }

            .page {
              min-height: 100vh;
            }

            .sitebar {
              background: rgba(255,255,255,0.88);
              border-bottom: 1px solid var(--yb-border);
              backdrop-filter: blur(8px);
            }

            .sitebar-inner {
              max-width: var(--yb-max);
              margin: 0 auto;
              padding: 14px 24px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 18px;
            }

            .brand {
              display: inline-flex;
              align-items: center;
              gap: 10px;
              font-size: 18px;
              font-weight: 700;
              letter-spacing: 0.01em;
            }

            .brand-mark {
              width: 12px;
              height: 12px;
              border-radius: 999px;
              background: var(--yb-sun);
              box-shadow: inset 0 0 0 1px rgba(0,0,0,0.04);
            }

            .brand-sub {
              display: block;
              font-size: 12px;
              font-weight: 400;
              color: var(--yb-text-soft);
              letter-spacing: 0;
            }

            .site-actions {
              display: flex;
              align-items: center;
              gap: 10px;
              flex-wrap: wrap;
            }

            .site-link {
              font-size: 15px;
              color: var(--yb-text-soft);
              padding: 6px 0;
            }

            .site-link:hover {
              color: var(--yb-text);
            }

            .page-wrap {
              max-width: var(--yb-max);
              margin: 0 auto;
              padding: 24px 24px 72px;
            }

            .breadcrumbs {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              align-items: center;
              font-size: 14px;
              color: var(--yb-text-soft);
              margin-bottom: 24px;
            }

            .breadcrumbs a {
              color: var(--yb-text-soft);
              border-bottom: 1px solid transparent;
            }

            .breadcrumbs a:hover {
              color: var(--yb-text);
              border-bottom-color: var(--yb-border-strong);
            }

            .crumb-sep {
              color: #9aa6b2;
            }

            .hero {
              margin-bottom: 24px;
            }

            .eyebrow {
              display: inline-block;
              margin-bottom: 12px;
              font-size: 13px;
              line-height: 1;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              color: var(--yb-text-soft);
            }

            .hero-pills {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
              margin-bottom: 18px;
            }

            .pill {
              display: inline-flex;
              align-items: center;
              min-height: 34px;
              padding: 6px 12px;
              border: 1px solid var(--yb-border);
              border-radius: 999px;
              background: rgba(255,255,255,0.9);
              font-size: 14px;
              color: var(--yb-text);
            }

            .pill-soft {
              background: var(--yb-accent-soft);
              border-color: #d8e8f6;
            }

            .hero-title {
              margin: 0 0 10px;
              font-size: 38px;
              line-height: 1.08;
              font-weight: 700;
              letter-spacing: -0.02em;
            }

            .hero-text {
              margin: 0;
              max-width: 900px;
              font-size: 22px;
              line-height: 1.4;
              color: #41505c;
            }

            .content-grid {
              display: grid;
              grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
              gap: 24px;
              align-items: start;
            }

            .stack {
              display: grid;
              gap: 24px;
            }

            .card {
              background: var(--yb-surface);
              border: 1px solid var(--yb-border);
              border-radius: var(--yb-radius);
              box-shadow: var(--yb-shadow);
            }

            .card-pad {
              padding: 24px;
            }

            .card-title {
              margin: 0 0 18px;
              font-size: 24px;
              line-height: 1.2;
              font-weight: 700;
              color: var(--yb-text);
            }

            .section + .section {
              margin-top: 24px;
              padding-top: 24px;
              border-top: 1px solid #edf2f6;
            }

            .label {
              display: block;
              margin-bottom: 8px;
              font-size: 13px;
              line-height: 1.2;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              color: var(--yb-text-soft);
            }

            .body-copy {
              font-size: 18px;
              line-height: 1.55;
              color: var(--yb-text);
            }

            .muted {
              margin: 0;
              font-size: 17px;
              line-height: 1.5;
              color: var(--yb-text-soft);
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

            .resource-intro {
              margin: -4px 0 18px;
              font-size: 16px;
              line-height: 1.45;
              color: var(--yb-text-soft);
            }

            .generator-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
            }

            .resource-card,
            .resource-card-soon {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              min-height: 124px;
              padding: 18px;
              border: 1px solid var(--yb-border);
              border-radius: var(--yb-radius);
              background: #fff;
              transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
            }

            .resource-card:hover {
              background: var(--yb-surface-soft);
              border-color: var(--yb-border-strong);
              transform: translateY(-1px);
            }

            .resource-card-soon {
              background: #fbfcfd;
              color: var(--yb-text-soft);
            }

            .resource-card--wide {
              grid-column: 1 / -1;
            }

            .resource-title {
              margin: 0 0 8px;
              font-size: 19px;
              line-height: 1.2;
              font-weight: 700;
              color: var(--yb-text);
            }

            .resource-card-soon .resource-title {
              color: #65717c;
            }

            .resource-copy {
              margin: 0;
              font-size: 16px;
              line-height: 1.45;
              color: #50606c;
            }

            .status {
              margin-top: 14px;
              font-size: 12px;
              line-height: 1.2;
              letter-spacing: 0.06em;
              text-transform: uppercase;
              color: #6f7e8a;
            }

            .meta-list {
              display: grid;
              gap: 12px;
            }

            .meta-row {
              display: grid;
              grid-template-columns: 140px 1fr;
              gap: 12px;
              align-items: start;
              font-size: 16px;
              line-height: 1.45;
            }

            .meta-key {
              color: var(--yb-text-soft);
              font-weight: 600;
            }

            .meta-value {
              color: var(--yb-text);
              word-break: break-word;
            }

            @media (max-width: 900px) {
              .content-grid {
                grid-template-columns: 1fr;
              }

              .generator-grid {
                grid-template-columns: 1fr;
              }

              .resource-card--wide {
                grid-column: auto;
              }
            }

            @media (max-width: 640px) {
              .sitebar-inner,
              .page-wrap {
                padding-left: 18px;
                padding-right: 18px;
              }

              .sitebar-inner {
                align-items: flex-start;
                flex-direction: column;
              }

              .hero-title {
                font-size: 32px;
              }

              .hero-text {
                font-size: 20px;
              }

              .card-pad {
                padding: 20px;
              }

              .meta-row {
                grid-template-columns: 1fr;
                gap: 4px;
              }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <header class="sitebar">
              <div class="sitebar-inner">
                <a class="brand" href="/curriculum">
                  <span class="brand-mark" aria-hidden="true"></span>
                  <span>
                    Yellow Bird
                    <span class="brand-sub">Little Birds in the Blue Sky</span>
                  </span>
                </a>
              </div>
            </header>

            <main class="page-wrap">
              <div class="breadcrumbs">
                <a href="/curriculum">Curriculum</a>
                <span class="crumb-sep">/</span>
                <span>Expectation not found</span>
              </div>

              <section class="card">
                <div class="card-pad">
                  <div class="eyebrow">Curriculum</div>
                  <h1 class="hero-title">Expectation not found</h1>
                  <p class="hero-text">We couldn’t find that curriculum expectation.</p>
                </div>
              </section>
            </main>
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

  const curriculumRecipe = getCurriculumRecipe(found);

  const worksheetRecipe = curriculumRecipe?.worksheet || null;
  const packRecipe = curriculumRecipe?.pack || null;
  const exitTicketType = curriculumRecipe?.exitTicket?.type || "general-check";

  const gradeParam = String(found.grade || found.gradeLabel || "")
    .trim()
    .toLowerCase()
    .replace(/^grade\s*/i, "grade");

  const worksheetUrl =
    `/worksheet?subject=${encodeURIComponent(found.subject?.name || "Math")}` +
    `&grade=${encodeURIComponent(gradeParam)}` +
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
    `&grade=${encodeURIComponent(gradeParam)}` +
    `&strand=${encodeURIComponent(found.strand?.name || "")}` +
    `&topic=${encodeURIComponent(found.topic?.name || "")}` +
    `&expectation=${encodeURIComponent(found.expectation?.code || "")}` +
    `&expectationId=${encodeURIComponent(found.expectation?.id || "")}` +
    `&expectationText=${encodeURIComponent(found.expectation?.text || "")}`;

  res.send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${found.gradeLabel} Math – ${found.expectation.code}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
          :root {
            --yb-bg: #f8fafc;
            --yb-surface: #ffffff;
            --yb-surface-soft: #f3f7fb;
            --yb-text: #2f3a45;
            --yb-text-soft: #5f6b76;
            --yb-border: #dbe3ea;
            --yb-border-strong: #c8d3dd;
            --yb-accent: #6fa8dc;
            --yb-accent-soft: #eef5fb;
            --yb-sun: #f4d35e;
            --yb-radius: 8px;
            --yb-shadow: 0 1px 0 rgba(47, 58, 69, 0.03);
            --yb-max: 1120px;
          }

          * {
            box-sizing: border-box;
          }

          html, body {
            margin: 0;
            padding: 0;
          }

          body {
            font-family: "Source Sans 3", Arial, sans-serif;
            background:
              linear-gradient(180deg, #f6faff 0%, #f8fafc 180px, #f8fafc 100%);
            color: var(--yb-text);
          }

          a {
            color: inherit;
            text-decoration: none;
          }

          .page {
            min-height: 100vh;
          }

          .sitebar {
            background: rgba(255,255,255,0.88);
            border-bottom: 1px solid var(--yb-border);
            backdrop-filter: blur(8px);
          }

          .sitebar-inner {
            max-width: var(--yb-max);
            margin: 0 auto;
            padding: 14px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 18px;
          }

          .brand {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 0.01em;
          }

          .brand-mark {
            width: 12px;
            height: 12px;
            border-radius: 999px;
            background: var(--yb-sun);
            box-shadow: inset 0 0 0 1px rgba(0,0,0,0.04);
          }

          .brand-sub {
            display: block;
            font-size: 12px;
            font-weight: 400;
            color: var(--yb-text-soft);
            letter-spacing: 0;
          }

          .site-actions {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
          }

          .site-link {
            font-size: 15px;
            color: var(--yb-text-soft);
            padding: 6px 0;
          }

          .site-link:hover {
            color: var(--yb-text);
          }

          .page-wrap {
            max-width: var(--yb-max);
            margin: 0 auto;
            padding: 24px 24px 72px;
          }

          .breadcrumbs {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
            font-size: 14px;
            color: var(--yb-text-soft);
            margin-bottom: 24px;
          }

          .breadcrumbs a {
            color: var(--yb-text-soft);
            border-bottom: 1px solid transparent;
          }

          .breadcrumbs a:hover {
            color: var(--yb-text);
            border-bottom-color: var(--yb-border-strong);
          }

          .crumb-sep {
            color: #9aa6b2;
          }

          .hero {
            margin-bottom: 24px;
          }

          .eyebrow {
            display: inline-block;
            margin-bottom: 12px;
            font-size: 13px;
            line-height: 1;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--yb-text-soft);
          }

          .hero-pills {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 18px;
          }

          .pill {
            display: inline-flex;
            align-items: center;
            min-height: 34px;
            padding: 6px 12px;
            border: 1px solid var(--yb-border);
            border-radius: 999px;
            background: rgba(255,255,255,0.9);
            font-size: 14px;
            color: var(--yb-text);
          }

          .pill-soft {
            background: var(--yb-accent-soft);
            border-color: #d8e8f6;
          }

          .hero-title {
            margin: 0 0 10px;
            font-size: 38px;
            line-height: 1.08;
            font-weight: 700;
            letter-spacing: -0.02em;
          }

          .hero-text {
            margin: 0;
            max-width: 900px;
            font-size: 22px;
            line-height: 1.4;
            color: #41505c;
          }

          .content-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
            gap: 24px;
            align-items: start;
          }

          .stack {
            display: grid;
            gap: 24px;
          }

          .card {
            background: var(--yb-surface);
            border: 1px solid var(--yb-border);
            border-radius: var(--yb-radius);
            box-shadow: var(--yb-shadow);
          }

          .card-pad {
            padding: 24px;
          }

          .card-title {
            margin: 0 0 18px;
            font-size: 24px;
            line-height: 1.2;
            font-weight: 700;
            color: var(--yb-text);
          }

          .section + .section {
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid #edf2f6;
          }

          .label {
            display: block;
            margin-bottom: 8px;
            font-size: 13px;
            line-height: 1.2;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--yb-text-soft);
          }

          .body-copy {
            font-size: 18px;
            line-height: 1.55;
            color: var(--yb-text);
          }

          .muted {
            margin: 0;
            font-size: 17px;
            line-height: 1.5;
            color: var(--yb-text-soft);
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

          .resource-intro {
            margin: -4px 0 18px;
            font-size: 16px;
            line-height: 1.45;
            color: var(--yb-text-soft);
          }

          .generator-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .resource-card,
          .resource-card-soon {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: 124px;
            padding: 18px;
            border: 1px solid var(--yb-border);
            border-radius: var(--yb-radius);
            background: #fff;
            transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
          }

          .resource-card:hover {
            background: var(--yb-surface-soft);
            border-color: var(--yb-border-strong);
            transform: translateY(-1px);
          }

          .resource-card-soon {
            background: #fbfcfd;
            color: var(--yb-text-soft);
          }

          .resource-card--wide {
            grid-column: 1 / -1;
          }

          .resource-title {
            margin: 0 0 8px;
            font-size: 19px;
            line-height: 1.2;
            font-weight: 700;
            color: var(--yb-text);
          }

          .resource-card-soon .resource-title {
            color: #65717c;
          }

          .resource-copy {
            margin: 0;
            font-size: 16px;
            line-height: 1.45;
            color: #50606c;
          }

          .status {
            margin-top: 14px;
            font-size: 12px;
            line-height: 1.2;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: #6f7e8a;
          }

          .meta-list {
            display: grid;
            gap: 12px;
          }

          .meta-row {
            display: grid;
            grid-template-columns: 140px 1fr;
            gap: 12px;
            align-items: start;
            font-size: 16px;
            line-height: 1.45;
          }

          .meta-key {
            color: var(--yb-text-soft);
            font-weight: 600;
          }

          .meta-value {
            color: var(--yb-text);
            word-break: break-word;
          }

          @media (max-width: 900px) {
            .content-grid {
              grid-template-columns: 1fr;
            }

            .generator-grid {
              grid-template-columns: 1fr;
            }

            .resource-card--wide {
              grid-column: auto;
            }
          }

          @media (max-width: 640px) {
            .sitebar-inner,
            .page-wrap {
              padding-left: 18px;
              padding-right: 18px;
            }

            .sitebar-inner {
              align-items: flex-start;
              flex-direction: column;
            }

            .hero-title {
              font-size: 32px;
            }

            .hero-text {
              font-size: 20px;
            }

            .card-pad {
              padding: 20px;
            }

            .meta-row {
              grid-template-columns: 1fr;
              gap: 4px;
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <header class="sitebar">
            <div class="sitebar-inner">
              <a class="brand" href="/curriculum">
                <span class="brand-mark" aria-hidden="true"></span>
                <span>
                  Yellow Bird
                  <span class="brand-sub">Little Birds in the Blue Sky</span>
                </span>
              </a>

              <nav class="site-actions" aria-label="Primary">
                <a class="site-link" href="/curriculum">Browse Curriculum</a>
                <a class="site-link" href="/worksheet">Worksheet Generator</a>
              </nav>
            </div>
          </header>

          <main class="page-wrap">
            <nav class="breadcrumbs" aria-label="Breadcrumb">
              <a href="/curriculum">Curriculum</a>
              <span class="crumb-sep">/</span>
              <span>${found.gradeLabel}</span>
              <span class="crumb-sep">/</span>
              <span>${found.subject?.name || "Math"}</span>
              <span class="crumb-sep">/</span>
              <span>${found.strand?.name || ""}</span>
              <span class="crumb-sep">/</span>
              <span>${found.expectation?.code || ""}</span>
            </nav>

            <section class="hero">
              <div class="eyebrow">Curriculum expectation</div>

              <div class="hero-pills">
                <span class="pill">${found.gradeLabel}</span>
                <span class="pill">${found.subject?.name || "Math"}</span>
                <span class="pill">Strand: ${found.strand?.name || ""}</span>
                <span class="pill pill-soft">Expectation ${found.expectation?.code || ""}</span>
              </div>

              <h1 class="hero-title">${found.gradeLabel} ${found.subject?.name || "Math"}</h1>
              <p class="hero-text">${found.expectation?.text || found.expectation?.code || ""}</p>
            </section>

            <section class="content-grid">
              <div class="stack">
                <section class="card">
                  <div class="card-pad">
                    <h2 class="card-title">Teacher Context</h2>

                    <div class="section">
                      <span class="label">Learning Goal</span>
                      <div class="body-copy">${learningGoal}</div>
                    </div>

                    <div class="section">
                      <span class="label">Success Criteria</span>
                      ${successCriteriaHtml}
                    </div>
                  </div>
                </section>

                <section class="card">
                  <div class="card-pad">
                    <h2 class="card-title">Expectation Details</h2>

                    <div class="meta-list">
                      <div class="meta-row">
                        <div class="meta-key">Jurisdiction</div>
                        <div class="meta-value">${found.jurisdiction?.name || "Ontario"}</div>
                      </div>
                      <div class="meta-row">
                        <div class="meta-key">Subject</div>
                        <div class="meta-value">${found.subject?.name || "Math"}</div>
                      </div>
                      <div class="meta-row">
                        <div class="meta-key">Grade</div>
                        <div class="meta-value">${found.gradeLabel || ""}</div>
                      </div>
                      <div class="meta-row">
                        <div class="meta-key">Strand</div>
                        <div class="meta-value">${found.strand?.name || ""}</div>
                      </div>
                      <div class="meta-row">
                        <div class="meta-key">Topic</div>
                        <div class="meta-value">${found.topic?.name || ""}</div>
                      </div>
                      <div class="meta-row">
                        <div class="meta-key">Expectation Code</div>
                        <div class="meta-value">${found.expectation?.code || ""}</div>
                      </div>
                      <div class="meta-row">
                        <div class="meta-key">Expectation ID</div>
                        <div class="meta-value">${found.expectation?.id || ""}</div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div class="stack">
                <section class="card">
                  <div class="card-pad">
                    <h2 class="card-title">Generate Resources</h2>
                    <p class="resource-intro">
                      Choose a resource type to generate materials aligned to this expectation.
                    </p>

                    <div class="generator-grid">
                      <a class="resource-card" href="${worksheetUrl}">
                        <div>
                          <h3 class="resource-title">Generate Worksheet</h3>
                          <p class="resource-copy">
                            Create a printable worksheet aligned to this expectation.
                          </p>
                        </div>
                        <div class="status">
                          ${worksheetRecipe ? `Suggested: ${worksheetRecipe.title}` : `General worksheet`}
                        </div>
                      </a>

                      <div class="resource-card-soon" aria-disabled="true">
                        <div>
                          <h3 class="resource-title">Generate Lesson Slides</h3>
                          <p class="resource-copy">
                            Whole-class teaching slides for this curriculum expectation.
                          </p>
                        </div>
                        <div class="status">Coming soon</div>
                      </div>

                      <a class="resource-card" href="${exitTicketUrl}">
                        <div>
                          <h3 class="resource-title">Generate Exit Ticket</h3>
                          <p class="resource-copy">
                            Quick check-for-understanding aligned to this expectation.
                          </p>
                        </div>
                        <div class="status">
                          ${packRecipe?.exitTicketType ? `Suggested: ${packRecipe.exitTicketType}` : `General exit ticket`}
                        </div>
                      </a>

                      <div class="resource-card-soon" aria-disabled="true">
                        <div>
                          <h3 class="resource-title">Generate Assessment</h3>
                          <p class="resource-copy">
                            Build a simple assessment matched to this expectation.
                          </p>
                        </div>
                        <div class="status">Coming soon</div>
                      </div>

                      <a class="resource-card resource-card--wide" href="${packUrl}">
                        <div>
                          <h3 class="resource-title">Generate Lesson Pack</h3>
                          <p class="resource-copy">
                            Bundle lesson materials, worksheets, and support resources.
                          </p>
                        </div>
                        <div class="status">
                          ${packRecipe ? `Suggested: ${packRecipe.title}` : `General pack`}
                        </div>
                      </a>
                    </div>
                  </div>
                </section>
              </div>
            </section>
          </main>
        </div>
      </body>
    </html>
  `);
});

module.exports = router;