# Yellow Bird Status

## Current Status

Project Yellow Bird has closed Milestone 2 — Publishing Engine.

Milestone 2 created one stable publishing engine where a worksheet is generated once, transformed into multiple outputs, and rendered consistently.

The project has moved significantly away from duplicate worksheet creation paths. The catalog worksheet flow now uses a shared runtime, and preview/PDF parity has been established for the catalog workflow.

The launch-facing discovery/publishing flow passed final manual browser QA:

Browse
↓
Worksheet Detail
↓
Preview / PDF

Current public path:

* `/browse`
* `/api/worksheet-catalog?status=ready`
* `/resource/worksheet/:id`
* `/catalog-preview.html?id={id}`
* `/api/catalog-pdf/{id}?disposition=inline`

## Current Architecture Direction

The long-term worksheet flow is:

Catalog Item / Expectation
↓
Skill
↓
Activity Recipe
↓
Problem Generator
↓
Generated Worksheet
↓
Layout / Normalized Content
↓
Preview / PDF Renderer

Core principle:

Generate once. Transform many times.

The renderer is shared.
The normalizer is shared.
The catalog runtime is now shared by preview and PDF routes.
Routes should remain thin.
Renderers should render only.

---

## Previous Finding

Project Yellow Bird originally had two worksheet creation systems:

1. Older/simple flow:
   Query params → contentFactory → worksheetRuntimeService → normalizeWorksheetContent → pdfRenderer

2. Newer/curriculum flow:
   Expectation → Skill → Activity Recipe → Problem Generator → buildWorksheet → normalizeWorksheetContent → pdfRenderer

The renderer was shared.
The normalizer was shared.
Worksheet creation was not fully unified.

---

## Current Finding

The newer catalog/curriculum workflow is now the main production path for catalog worksheets.

Completed stabilization work:

* Shared catalog runtime created
* Catalog preview and PDF routes now use the shared runtime
* Catalog runtime generates the worksheet only once
* Layout is built from the generated worksheet instead of regenerating
* Preview and download now use identical generated worksheets
* Download button reuses preview PDF blob
* Preview/PDF parity established
* Dead renderer code removed
* First PDF design tokens connected

The older/simple worksheet flow still exists, but the current focus is stabilizing the catalog publishing engine rather than expanding or redesigning older systems.

---

## Main Risk

The project may drift back into multiple worksheet engines or renderer-based fixes.

Current prevention rules:

* Keep route files thin
* Keep renderer responsible only for rendering
* Fix generator/catalog problems before they reach the renderer
* Prefer shared runtime over duplicate logic
* Avoid broad refactors
* Make small, reversible changes

---

## Recent Progress

### Ten Frame Fix

Ten Frame worksheets now generate ten-frame visuals instead of falling back to number lines or arithmetic-only rows.

Completed:

* `early_number_sense` recipe now includes `ten_frame`
* Kindergarten ten-frame catalog items now match their requested activity
* `grade1_addition_subtraction_facts_ten_frame` now uses `addition_strategies`
* Master and generated catalog data were kept in sync
* No route changes
* No PDF renderer changes
* JSON syntax check passed
* Runtime generation confirmed ten-frame visuals

### Number Line Identify Fix

Grade 1 Number Line Identify to 20 now generates normalized visuals with `min: 0` and `max: 20`.

Completed:

* Catalog `generatorOptions` now pass through the catalog build flow
* `g1_number_line_identify_to_20` now declares `{ minA: 0, maxA: 20 }`
* `numberLineIdentify.js` respects explicit range options
* Default implicit number-line behavior remains conservative at 0–10
* No route changes
* No PDF renderer changes
* JSON syntax check passed
* JS syntax checks passed
* Runtime generation confirmed normalized number-line visuals with `min: 0`, `max: 20`

### Data/Graph Seeded Randomness

The four active data/graph generators now use injected seeded randomness.

Completed:

* `readGraph.js` accepts `options = {}` and uses `options.random || Math.random`
* `completeGraph.js` accepts `options = {}` and uses `options.random || Math.random`
* `matchDataToGraph.js` accepts `options = {}` and uses `options.random || Math.random`
* `graphQuestions.js` accepts `options = {}` and uses `options.random || Math.random`
* No recipe changes
* No catalog changes
* No route changes
* No renderer changes
* JS syntax checks passed

### Data/Graph Output and Layout Audit

The data/graph worksheet flow was audited after seeded-randomness conversion.

Findings:

* Graph generators currently return `{ prompt, answer }` only
* No graph visual object is generated
* Graph worksheet types are missing from `worksheetTypeMap.json`
* Layout falls back to generic two-column equation practice
* Manual previews show overlapping prompts and no graph visuals

Recommended future fix:

* Add structured `bar_graph` visual support through generator output, normalizer support, layout mapping, and renderer primitive work
* Treat this as a focused future implementation plan, not a renderer-only patch

### Arithmetic Engine Seeded Randomness

Arithmetic-engine-based generators now use injected seeded randomness from `buildWorksheet()`.

Completed:

* `arithmeticEngine.js` now accepts injected `random`
* `equalGroups.js` passes `options.random`
* `missingAddend.js` passes `options.random`
* `missingFactor.js` passes `options.random`
* `relatedSubtraction.js` passes `options.random`
* `skipCounting.js` passes `options.random`
* `wordProblems.js` passes `options.random`
* `equationMatch.js` uses injected random for its local addition/subtraction choice
* Wrappers pass only `{ random: options.random }`
* Full generator options are intentionally not passed into `arithmeticEngine.js`
* No recipe changes
* No catalog changes
* No route changes
* No layout changes
* No renderer changes
* JS syntax checks passed
* Deterministic runtime checks passed for same-seed and different-seed behavior

### Pattern Generator Output Shape

Pattern generators now match the `buildWorksheet()` contract of one problem object per generator call.

Completed:

* `extendPattern.js` now returns one problem object per call
* `identifyPatternRule.js` now returns one problem object per call
* `missingValuePattern.js` now returns one problem object per call
* `functionTable.js` now returns one problem object per call
* Each now accepts `options = {}`
* Each now uses `options.random || Math.random`
* No recipe changes
* No catalog changes
* No route changes
* No layout changes
* No renderer changes
* Runtime checks passed for object shape, no blank prompts, same-seed, and different-seed behavior

### Text-Only Fraction Generator Output Shape

Text-only fraction generators now match the `buildWorksheet()` contract of one problem object per generator call.

Completed:

* `matchEquivalentFractions.js` now returns one problem object per call
* `compareFractions.js` now returns one problem object per call
* Each now accepts `options = {}`
* Each now uses `options.random || Math.random`
* `compareFractions.js` denominator choices were adjusted to avoid an infinite loop with denominator 2
* No recipe changes
* No catalog changes
* No route changes
* No layout changes
* No renderer changes
* Runtime checks passed for object shape, no blank prompts, same-seed, and different-seed behavior

### Grade 2 Skip-Counting Step Mapping

Grade 2 skip-counting catalog entries now force the advertised step.

Completed:

* `skipCounting.js` now respects `generatorOptions.step`
* `g2_skip_counting_by_2` now forces step 2
* `g2_skip_counting_by_5` now forces step 5
* `g2_skip_counting_by_10` now forces step 10
* `grade2.js` and `worksheetCatalog.master.json` were updated
* `node --check` passed for edited JS files
* Master catalog JSON parse passed
* Manual runtime generation confirmed correct steps for all three catalog IDs
* Existing catalog audit remains 282 / 312 working, with 30 known unrelated generator failures

### Text-Only Addition/Subtraction Word Problems

The missing addition/subtraction word-problem activity generators are now implemented as text-only generators.

Completed:

* `addition_word_problem` generator added
* `subtraction_word_problem` generator added
* `missing_addend_word_problem` generator added
* `wordProblems.js` now provides seeded text-only generators for those activity types
* `engine/problemGenerators/index.js` registers the three activity types
* Output shape is `{ prompt, answer }`
* Wording avoids multiplication/equal-groups language
* Answers are non-negative
* Seeded same-seed check passed
* `node --check` passed for edited JS files
* Manual runtime tests passed for `g1_addition_word_problems`
* Manual runtime tests passed for `g2_addition_word_problems_within_100`
* Manual runtime tests passed for `grade1_addition_subtraction_word_problems_addition_word_problem`
* Manual runtime tests passed for `grade1_addition_subtraction_word_problems_subtraction_word_problem`
* Manual runtime tests passed for `grade1_addition_subtraction_word_problems_missing_addend_word_problem`
* Catalog audit improved from 282 / 312 working to 305 / 312 working
* 7 hard generator failures remain, all `pattern_word_problems`

### Pattern Word-Problem Catalog Safety Pass

Generated pattern word-problem catalog entries are now explicitly deferred from launch-ready status.

Completed:

* `grade1_patterning_and_algebra_pattern_word_problems` marked `planned`
* `grade2_patterning_and_algebra_pattern_word_problems` marked `planned`
* `grade3_patterning_and_algebra_pattern_word_problems` marked `planned`
* `grade4_patterning_and_algebra_pattern_word_problems` marked `planned`
* `grade5_patterning_and_algebra_pattern_word_problems` marked `planned`
* `grade6_patterning_and_algebra_pattern_word_problems` marked `planned`
* `kindergarten_patterning_and_algebra_pattern_word_problems` marked `planned`
* Generated and master catalog JSON were kept in sync
* `generateWorksheetCatalog.js` now preserves this planned/deferred status on regeneration
* Ready-status launch surface has 46 entries and 0 runtime generation failures
* Raw full catalog audit still reports 7 known `pattern_word_problems` generator failures

### Catalog Audit Reporting

The catalog audit now reports launch-readiness by catalog status while preserving the full raw audit.

Completed:

* `scripts/auditWorksheetCatalog.js` now preserves the full raw audit across all 312 catalog entries
* Audit now reports by catalog status
* Added `Ready / Launch-Facing Result` section
* Added `Planned / Deferred Result` section
* Failures now include catalog status
* Current full raw audit is 305 / 312 working
* Ready / launch-facing result is 46 / 46 working with 0 failures
* Planned / deferred result is 2 / 9 working with 7 failures
* All 7 remaining failures are planned `pattern_word_problems` entries
* `node --check scripts/auditWorksheetCatalog.js` passed
* Catalog audit ran successfully
* Note: `scripts/auditWorksheetCatalog.js` should be tracked in git if it is intended as a project tool

### Final Milestone 2 Catalog Audit Health Check

The catalog audit is stable for launch-facing worksheet generation.

Completed:

* `node --check scripts/auditWorksheetCatalog.js` passed
* `node scripts/auditWorksheetCatalog.js` ran successfully
* Full raw catalog audit: 305 / 312 working
* Ready / launch-facing result: 46 / 46 working, 0 failures
* Generated: 252 / 252 working, 0 failures
* Partial: 5 / 5 working, 0 failures
* Planned / deferred: 2 / 9 working, 7 failures
* All 7 remaining failures are planned `pattern_word_problems` entries
* Ready launch-facing worksheet runtime has 0 missing skill definitions
* Ready launch-facing worksheet runtime has 0 generator failures
* Ready launch-facing worksheet runtime has 0 other failures
* Milestone 2 Generator Completion was functionally stable pending manual preview/PDF spot checks
* Remaining untracked files are future/unused/placeholder material: `engine/catalog/`, `engine/visuals/index`, `engine/visuals/renderVisual.js`, `public/styles/images/`

### Milestone 2 Generator Completion Closeout

Generator Completion is stable after manual / targeted QA.

Completed:

* Manual / targeted QA found a semantic mismatch in `g1_addition_facts_within_20`
* Before: the master catalog used `skillKey: "addition_strategies"` and generated ten-frame prompts
* After: the master catalog uses `skillKey: "addition_subtraction_facts"` and generates actual addition facts within 20
* The fix was catalog-only in `data/worksheetCatalog.master.json`
* No route changes
* No renderer changes
* Preview/PDF parity remains preserved through the shared catalog runtime
* Seeded deterministic behavior remains intact: same seed output is identical, different seed changes output
* `node --check scripts/auditWorksheetCatalog.js` passed
* `npm run audit:worksheets` passed
* Ready / launch-facing result remains 46 / 46 working, 0 failures
* Missing skill definitions: 0
* Generator failures: 0
* Other failures: 0
* Remaining raw failures are only planned/deferred `pattern_word_problems` entries and are not launch-facing

### Public Browse and Worksheet Detail Launch Flow

The public Browse -> Detail -> Preview/PDF path is stable and passed final manual browser QA.

Completed:

* `/browse` loads 46 ready worksheet catalog items from `/api/worksheet-catalog?status=ready`
* Public Browse cards are catalog-backed and teacher-facing
* Details action routes to `/resource/worksheet/:id`
* Preview action routes to `/catalog-preview.html?id={id}`
* PDF action routes to `/api/catalog-pdf/{id}?disposition=inline`
* `/resource/worksheet/:id` renders public detail pages for ready worksheet items
* Missing worksheet IDs return 404
* Non-ready worksheet IDs return 404
* Detail page labels now use public-facing language instead of raw catalog keys
* Internal `/worksheet-catalog.html` remains available as an internal/debug surface but is no longer linked from public Browse
* Browse filters have proper label associations
* Light focus-visible accessibility polish was added
* No renderer changes
* No catalog runtime changes
* No PDF route changes
* `node --check routes/libraryRoutes.js` passed
* `npm run audit:worksheets` passed
* Ready / launch-facing result remains 46 / 46 working, 0 failures
* Missing skill definitions: 0
* Generator failures for ready items: 0
* Other failures: 0
* Remaining raw failures are only planned/deferred `pattern_word_problems` entries and are not launch-facing
* Final manual browser QA passed for `/browse`
* Final manual browser QA passed for `/resource/worksheet/:id`
* Final manual browser QA passed for `/catalog-preview.html?id={id}`
* Final manual browser QA passed for `/api/catalog-pdf/{id}?disposition=inline`

Status:

* Milestone 2 — Publishing Engine is closed
* Generator Completion is stable
* Launch-facing discovery and publishing routes are stable
* Deferred worksheet types are not complete and should not be described as complete

Known partial:

* `g1_addition_on_number_line_to_20` still maps to `number_line_identify`
* This is not true addition modeling
* It should remain partial until a real addition-jump number-line generator is created

Additional known partials / existing issues:

* Data/graph worksheets remain text-only and need future structured `bar_graph` visual support
* `shadeFractionModels.js` and `fractionNumberLine.js` still have the array-return issue and imply visual models that are not implemented yet
* Planned/deferred `pattern_word_problems` entries remain out of launch-facing scope
* Broader `patterning_and_algebra` catalog/recipe entries that use skill-like activity types may still be mapping concerns
* Stale `public/resource.html` remains a cleanup target
* `server.js` appears to contain duplicate `app.listen` startup calls and should be reviewed in a focused cleanup

---

## Files Reviewed

### services/worksheetRuntimeService.js

Purpose:
Builds simple arithmetic worksheets from query params.

Notes:
Uses `createContent()` from `contentFactory`.

Status:
Likely older/simple worksheet pipeline. Do not expand unless needed.

Concern:
Does not appear to use the newer Expectation → Skill → Recipe architecture.

---

### routes/worksheetPdfRoutes.js

Purpose:
Defines worksheet PDF download routes.

Routes:

* `/api/worksheet.pdf`
* `/api/catalog-pdf/:id`

Current direction:
Routes should stay thin and call shared runtime services.

Status:
Catalog PDF now uses the shared catalog runtime.

---

### routes/worksheetPreviewRoutes.js

Purpose:
Defines worksheet preview routes.

Routes:

* `/api/worksheet-preview`
* `/api/catalog-preview/:id`

Current direction:
Catalog preview should use the same generated worksheet object as catalog PDF.

Status:
Preview/PDF parity has been established for the catalog workflow.

---

### services/catalogWorksheetRuntimeService.js

Purpose:
Shared runtime for catalog worksheet generation.

Current role:
Creates one shared catalog worksheet runtime package that can support preview and PDF output without regenerating different worksheet content.

Status:
This is now a key part of the publishing engine.

---

### services/worksheetCatalogService.js

Purpose:
Acts as the catalog engine and worksheet generator bridge.

Flow:

Catalog Item
↓
skillKey
↓
buildWorksheet()
↓
Problems
↓
normalizeWorksheetLayout()

Current role:
Connects catalog items to the newer Skill → Recipe → Generator architecture.

Recent update:
Catalog `generatorOptions` now pass through the catalog build flow, allowing catalog items to provide explicit generator ranges such as `{ minA: 0, maxA: 20 }`.

---

### engine/worksheetBuilder/buildWorksheet.js

Purpose:
Builds curriculum-aligned worksheets using the newer architecture.

Flow:
Expectation → Skill → Recipe → Generator → Problems

Notes:
This appears to be the long-term engine.

Current priority:
Keep stabilizing active generators and recipe mappings.

---

### engine/worksheetBuilder/normalizeWorksheetContent.js

Purpose:
Standardizes worksheet content and visual data before rendering.

Notes:
This is a useful bridge between generated worksheet objects and rendering.

Visuals normalized include:

* arrays → array
* tenframe → ten_frame
* base_ten → base_ten_blocks
* number_line values normalized to renderer-friendly data

---

### engine/problemGenerators/tenFrame.js

Purpose:
Generates ten-frame visual worksheet problems.

Status:
Now reachable from the fixed Kindergarten and Grade 1 catalog/recipe paths.

---

### engine/problemGenerators/numberLineIdentify.js

Purpose:
Generates number-line identify problems.

Recent update:
Now respects explicit catalog range options such as `{ minA: 0, maxA: 20 }`.

Known boundary:
This generator identifies numbers on a number line. It should not be used as a substitute for true addition-on-number-line modeling.

---

### renderers/pdfRenderer.js

Purpose:
Final PDF rendering engine.

Notes:
Uses primitive visual rendering for:

* arrays
* ten frames
* number lines
* base ten blocks

Status:
Dead renderer code has been removed. First PDF design tokens have been connected.

Current rule:
Do not change `pdfRenderer` to compensate for incorrect generator or catalog output. Renderers render only.

---

## Current High Priority

Post-close cleanup and follow-up planning.

Known issues / next targets:

1. Clean up duplicate `app.listen` startup calls in `server.js`.
2. Clean up stale `public/resource.html`.
3. Keep graph visual support deferred until a focused `bar_graph` implementation plan is created.
4. Keep true addition-jump number-line work deferred until a focused generator plan is created.
5. Keep visual fraction work deferred until focused visual support is planned.
6. Keep planned/deferred `pattern_word_problems` entries out of launch-facing scope until implemented.

---

## Next Fix Targets

1. Focused cleanup review for duplicate `app.listen` calls in `server.js`.
2. Focused cleanup of stale `public/resource.html` when safe.
3. Focused `bar_graph` support plan for graph visuals.
4. Focused generator plan for true addition-jump number-line worksheets.
5. Focused visual support plan for visual fractions.
6. Planned/deferred `pattern_word_problems` implementation.
7. Verify future changes with syntax checks, deterministic runtime checks, and manual catalog preview tests.

Do not work on:

* homepage redesign
* accounts
* subscriptions
* payments
* AI worksheet generation
* lesson slides

Guardrails:

* Routes stay thin
* Renderers render only
* Generate once, transform many times
* Prefer shared runtime over duplicate logic
* Make the smallest safe reversible change
