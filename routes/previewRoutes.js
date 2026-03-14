const express = require("express");
const router = express.Router();

const curriculumService = require("../services/curriculumService");
const { buildResourcePack } = require("../services/resourcePackService");
const { buildExitTicket } = require("../services/exitTicketService");

/* =========================
   PACK PREVIEW PAGE
   ========================= */
router.get("/pack-preview", (req, res) => {
  const expectationCode = String(req.query.expectation || "").toUpperCase();
  const expectationId = String(req.query.expectationId || "");

  let found = null;

  if (expectationId) {
    found = curriculumService.getExpectationContextById(expectationId);
  }

  if (!found && expectationCode) {
    const match = curriculumService.getExpectationByCode(expectationCode);
    if (match?.id) {
      found = curriculumService.getExpectationContextById(match.id);
    }
  }

  const pack = found ? buildResourcePack(found) : null;

  if (!found) {
    return res.status(404).send(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>Pack Preview Not Found</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet">
          <style>
            :root {
              --yb-bg: #f8fafc;
              --yb-surface: #ffffff;
              --yb-text: #2f3a45;
              --yb-text-soft: #5f6b76;
              --yb-border: #dbe3ea;
              --yb-sun: #f4d35e;
              --yb-max: 1120px;
              --yb-radius: 8px;
            }

            * { box-sizing: border-box; }
            html, body { margin: 0; padding: 0; }

            body {
              font-family: "Source Sans 3", Arial, sans-serif;
              background: linear-gradient(180deg, #f6faff 0%, #f8fafc 180px, #f8fafc 100%);
              color: var(--yb-text);
            }

            .sitebar {
              background: rgba(255,255,255,0.9);
              border-bottom: 1px solid var(--yb-border);
            }

            .sitebar-inner {
              max-width: var(--yb-max);
              margin: 0 auto;
              padding: 14px 24px;
            }

            .brand {
              display: inline-flex;
              align-items: center;
              gap: 10px;
              color: inherit;
              text-decoration: none;
              font-size: 18px;
              font-weight: 700;
            }

            .brand-mark {
              width: 12px;
              height: 12px;
              border-radius: 999px;
              background: var(--yb-sun);
            }

            .brand-sub {
              display: block;
              font-size: 12px;
              font-weight: 400;
              color: var(--yb-text-soft);
            }

            .wrap {
              max-width: 860px;
              margin: 0 auto;
              padding: 24px 24px 72px;
            }

            .card {
              background: #fff;
              border: 1px solid var(--yb-border);
              border-radius: var(--yb-radius);
              padding: 24px;
            }

            .eyebrow {
              display: inline-block;
              margin-bottom: 12px;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: var(--yb-text-soft);
            }

            h1 {
              margin: 0 0 10px;
              font-size: 34px;
              line-height: 1.1;
            }

            p {
              font-size: 18px;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>
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

          <main class="wrap">
            <section class="card">
              <div class="eyebrow">Lesson Pack</div>
              <h1>Pack preview not found</h1>
              <p>We couldn’t find that curriculum-aligned lesson pack.</p>
            </section>
          </main>
        </body>
      </html>
    `);
  }

  const normalizedPackGrade = String(found.grade || "")
    .trim()
    .toLowerCase()
    .replace(/^grade/, "");

  const expectationUrl =
    `/curriculum/on/${String(found.subject?.name || "Math")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9.-]/g, "")}` +
    `/grade${normalizedPackGrade}` +
    `/${String(found.strand?.name || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9.-]/g, "")}` +
    `/${String(found.expectation?.code || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9.-]/g, "")}`;

  const exitTicketUrl =
    `/exit-ticket?subject=${encodeURIComponent(found.subject?.name || "Math")}` +
    `&grade=${encodeURIComponent(found.grade || "")}` +
    `&strand=${encodeURIComponent(found.strand?.name || "")}` +
    `&expectation=${encodeURIComponent(found.expectation?.code || "")}` +
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

  const includesHtml = Object.entries(pack.includes || {})
    .filter(([, enabled]) => enabled)
    .map(([key]) => `<span class="pill">${key}</span>`)
    .join("");

  const successCriteria = Array.isArray(pack.teacherOverview?.successCriteria)
    ? pack.teacherOverview.successCriteria
    : [];

  const successCriteriaHtml = successCriteria.length
    ? `<ul class="bullet-list">${successCriteria.map((x) => `<li>${x}</li>`).join("")}</ul>`
    : `<p class="muted">Coming soon</p>`;

  res.send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${pack.meta.title}</title>
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

          .wrap {
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
            background: rgba(255,255,255,0.92);
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
            font-size: 21px;
            line-height: 1.45;
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
          }

          .muted {
            margin: 0;
            font-size: 16px;
            line-height: 1.5;
            color: var(--yb-text-soft);
          }

          .body-copy {
            font-size: 18px;
            line-height: 1.55;
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

          .bullet-list {
            margin: 0;
            padding-left: 20px;
          }

          .bullet-list li {
            margin-bottom: 10px;
            font-size: 18px;
            line-height: 1.5;
          }

          .meta-list {
            display: grid;
            gap: 12px;
          }

          .meta-row {
            display: grid;
            grid-template-columns: 130px 1fr;
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
          }

          .action-card {
            border: 1px solid var(--yb-border);
            border-radius: var(--yb-radius);
            background: #fff;
            padding: 18px;
          }

          .action-title {
            margin: 0 0 8px;
            font-size: 19px;
            font-weight: 700;
            line-height: 1.2;
          }

          .action-copy {
            margin: 0 0 14px;
            font-size: 16px;
            line-height: 1.45;
            color: #50606c;
          }

          .btn-row {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
          }

          .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 44px;
            padding: 10px 16px;
            border: 1px solid var(--yb-border);
            border-radius: 8px;
            background: #fff;
            color: var(--yb-text);
            font-size: 16px;
            font-weight: 600;
            transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
          }

          .btn:hover {
            background: var(--yb-surface-soft);
            border-color: var(--yb-border-strong);
            transform: translateY(-1px);
          }

          .btn-primary {
            background: var(--yb-text);
            color: #fff;
            border-color: var(--yb-text);
          }

          .btn-primary:hover {
            background: #3a4753;
            border-color: #3a4753;
          }

          @media (max-width: 900px) {
            .content-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 640px) {
            .sitebar-inner,
            .wrap {
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
              font-size: 19px;
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

        <main class="wrap">
          <nav class="breadcrumbs" aria-label="Breadcrumb">
            <a href="/curriculum">Curriculum</a>
            <span class="crumb-sep">/</span>
            <a href="${expectationUrl}">Expectation</a>
            <span class="crumb-sep">/</span>
            <span>Lesson Pack</span>
          </nav>

          <section class="hero">
            <div class="eyebrow">Lesson pack preview</div>

            <div class="hero-pills">
              <span class="pill">${pack.meta.gradeLabel}</span>
              <span class="pill">${pack.meta.subject}</span>
              <span class="pill">Strand: ${pack.meta.strand}</span>
              <span class="pill pill-soft">${pack.meta.expectationCode}</span>
            </div>

            <h1 class="hero-title">${pack.meta.title}</h1>
            <p class="hero-text">
              ${pack.meta.summary || "A resource pack aligned to this curriculum expectation."}
            </p>
          </section>

          <section class="content-grid">
            <div class="stack">
              <section class="card">
                <div class="card-pad">
                  <h2 class="card-title">Pack Includes</h2>
                  <div class="hero-pills" style="margin-bottom:0;">
                    ${includesHtml || `<span class="pill">Overview</span>`}
                  </div>
                </div>
              </section>

              ${
                pack.teacherOverview
                  ? `
                <section class="card">
                  <div class="card-pad">
                    <h2 class="card-title">Teacher Overview</h2>

                    <div class="section">
                      <span class="label">Learning Goal</span>
                      <div class="body-copy">${pack.teacherOverview.learningGoal || "Coming soon"}</div>
                    </div>

                    <div class="section">
                      <span class="label">Notes</span>
                      <div class="body-copy">${pack.teacherOverview.notes || "Coming soon"}</div>
                    </div>

                    <div class="section">
                      <span class="label">Success Criteria</span>
                      ${successCriteriaHtml}
                    </div>
                  </div>
                </section>
              `
                  : ""
              }

              <section class="card">
                <div class="card-pad">
                  <h2 class="card-title">Curriculum Alignment</h2>

                  <div class="meta-list">
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
                      <div class="meta-key">Expectation</div>
                      <div class="meta-value">${found.expectation?.code || ""} — ${found.expectation?.text || ""}</div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div class="stack">
              ${
                pack.worksheet
                  ? `
                <section class="card">
                  <div class="card-pad">
                    <h2 class="card-title">Worksheet</h2>

                    <div class="meta-list">
                      <div class="meta-row">
                        <div class="meta-key">Suggested Type</div>
                        <div class="meta-value">${pack.worksheet.recipe?.title || "Worksheet Practice"}</div>
                      </div>
                      <div class="meta-row">
                        <div class="meta-key">Summary</div>
                        <div class="meta-value">${pack.worksheet.summary || "Worksheet practice aligned to this expectation."}</div>
                      </div>
                      <div class="meta-row">
                        <div class="meta-key">Mode</div>
                        <div class="meta-value">${pack.worksheet.recipe?.mode || "standard"}</div>
                      </div>
                      <div class="meta-row">
                        <div class="meta-key">Questions</div>
                        <div class="meta-value">${pack.worksheet.recipe?.suggestedQuestionCount || "TBD"}</div>
                      </div>
                      <div class="meta-row">
                        <div class="meta-key">Difficulty</div>
                        <div class="meta-value">${pack.worksheet.recipe?.suggestedDifficulty || "grade-appropriate"}</div>
                      </div>
                    </div>

                    <div class="btn-row" style="margin-top:18px;">
                      <a class="btn btn-primary" href="${worksheetUrl}">Generate Worksheet</a>
                    </div>
                  </div>
                </section>
              `
                  : ""
              }

              ${
                pack.exitTicket
                  ? `
                <section class="card">
                  <div class="card-pad">
                    <h2 class="card-title">Exit Ticket</h2>

                    <div class="meta-list">
                      <div class="meta-row">
                        <div class="meta-key">Type</div>
                        <div class="meta-value">${pack.exitTicket.type}</div>
                      </div>
                      <div class="meta-row">
                        <div class="meta-key">Summary</div>
                        <div class="meta-value">${pack.exitTicket.summary || "Quick skill check aligned to this expectation."}</div>
                      </div>
                    </div>

                    <div class="btn-row" style="margin-top:18px;">
                      <a class="btn" href="${exitTicketUrl}">Generate Exit Ticket</a>
                    </div>
                  </div>
                </section>
              `
                  : ""
              }

              <section class="card">
                <div class="card-pad">
                  <h2 class="card-title">Next Step</h2>
                  <div class="action-card">
                    <h3 class="action-title">Continue building this resource set</h3>
                    <p class="action-copy">
                      Return to the curriculum expectation, or generate one of the included resources now.
                    </p>
                    <div class="btn-row">
                      <a class="btn" href="${expectationUrl}">Back to Expectation</a>
                      <a class="btn btn-primary" href="${worksheetUrl}">Worksheet</a>
                      <a class="btn" href="${exitTicketUrl}">Exit Ticket</a>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </section>
        </main>
      </body>
    </html>
  `);
});

/* =========================
   EXIT TICKET PAGE
   ========================= */
router.get("/exit-ticket", (req, res) => {
  const expectationCode = String(req.query.expectation || "").toUpperCase();
  const expectationId = String(req.query.expectationId || "");
  const exitTicketType = String(req.query.exitTicketType || "general-check");

  const normalizedExitGrade = String(req.query.grade || "")
    .trim()
    .toLowerCase()
    .replace(/^grade/, "");

  const expectationUrl =
    `/curriculum/on/${String(req.query.subject || "math")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9.-]/g, "")}` +
    `/grade${normalizedExitGrade}` +
    `/${String(req.query.strand || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9.-]/g, "")}` +
    `/${String(req.query.expectation || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9.-]/g, "")}`;

  let found = null;

  if (expectationId) {
    found = curriculumService.getExpectationContextById(expectationId);
  }

  if (!found && expectationCode) {
    const match = curriculumService.getExpectationByCode(expectationCode);
    if (match?.id) {
      found = curriculumService.getExpectationContextById(match.id);
    }
  }

  if (!found) {
    return res.status(404).send(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>Exit Ticket Not Found</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet">
          <style>
            body {
              margin: 0;
              font-family: "Source Sans 3", Arial, sans-serif;
              background: #f8fafc;
              color: #2f3a45;
            }
            .wrap {
              max-width: 860px;
              margin: 0 auto;
              padding: 48px 24px;
            }
            .card {
              background: #fff;
              border: 1px solid #dbe3ea;
              border-radius: 8px;
              padding: 24px;
            }
            h1 {
              margin: 0 0 12px;
              font-size: 34px;
            }
            p {
              font-size: 18px;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>
          <main class="wrap">
            <section class="card">
              <h1>Exit ticket not found</h1>
              <p>We couldn’t find that exit ticket.</p>
            </section>
          </main>
        </body>
      </html>
    `);
  }

  const ticket = buildExitTicket(found, exitTicketType);

  res.send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${ticket.title}</title>
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
            --yb-sun: #f4d35e;
            --yb-radius: 8px;
            --yb-shadow: 0 1px 0 rgba(47, 58, 69, 0.03);
            --yb-max: 980px;
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
          }

          .wrap {
            max-width: var(--yb-max);
            margin: 0 auto;
            padding: 24px 24px 72px;
          }

          .actions {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            align-items: center;
            margin-bottom: 24px;
          }

          .btn,
          .print-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 44px;
            padding: 10px 16px;
            border: 1px solid var(--yb-border);
            border-radius: 8px;
            background: #fff;
            color: var(--yb-text);
            font: inherit;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
          }

          .btn:hover,
          .print-btn:hover {
            background: var(--yb-surface-soft);
            border-color: var(--yb-border-strong);
            transform: translateY(-1px);
          }

          .sheet {
            background: #fff;
            border: 1px solid var(--yb-border);
            border-radius: var(--yb-radius);
            box-shadow: var(--yb-shadow);
            padding: 32px;
          }

          .eyebrow {
            font-size: 13px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--yb-text-soft);
            margin-bottom: 12px;
          }

          h1 {
            margin: 0 0 12px;
            font-size: 32px;
            line-height: 1.1;
          }

          .meta {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 24px;
            line-height: 1.5;
          }

          .instructions {
            font-size: 18px;
            line-height: 1.5;
            margin-bottom: 28px;
          }

          .question {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }

          .question-title {
            font-size: 18px;
            font-weight: 700;
            line-height: 1.45;
            margin-bottom: 12px;
          }

          .line {
            border-bottom: 1px solid #cfd8e1;
            height: 28px;
            margin-bottom: 10px;
          }

          @media (max-width: 640px) {
            .sitebar-inner,
            .wrap {
              padding-left: 18px;
              padding-right: 18px;
            }

            .sitebar-inner {
              flex-direction: column;
              align-items: flex-start;
            }

            .sheet {
              padding: 22px;
            }

            h1 {
              font-size: 28px;
            }
          }

          @media print {
            body {
              background: #fff;
            }

            .sitebar,
            .actions {
              display: none;
            }

            .wrap {
              max-width: none;
              padding: 0;
            }

            .sheet {
              border: none;
              border-radius: 0;
              box-shadow: none;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
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

        <main class="wrap">
          <div class="actions">
            <a class="btn" href="${expectationUrl}">Back to Expectation</a>
            <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
          </div>

          <section class="sheet">
            <div class="eyebrow">Exit Ticket</div>
            <h1>${ticket.title}</h1>

            <div class="meta">
              ${found.gradeLabel} • ${found.subject?.name || "Math"} • ${found.strand.name} • ${found.expectation.code}
            </div>

            <div class="instructions">${ticket.instructions}</div>

            ${ticket.questions
              .map(
                (q, i) => `
              <div class="question">
                <div class="question-title">${i + 1}. ${q}</div>
                <div class="line"></div>
                <div class="line"></div>
              </div>
            `
              )
              .join("")}
          </section>
        </main>
      </body>
    </html>
  `);
});

module.exports = router;