# Project Yellow Bird — Rules for Next Chat

1. Do not put generator logic in `server.js`.
2. Do not recreate deleted legacy files:
   - routes/unitRoutes.js
   - routes/worksheetRoutes.js
   - config/packRecipes.js
3. Preserve the distinction between:
   - mode-based worksheet runtime
   - skill-based curriculum worksheet engine
4. Reuse:
   - `services/worksheetRuntimeService.js`
   - `services/curriculumPageService.js`
5. Before adding new route logic, check whether an existing service already owns that concern.
6. Prefer extracting shared helpers over copying logic between routes.
7. Treat `pdfRenderer.js`, `curriculumService.js`, and `buildWorksheet.js` as high-risk files.
