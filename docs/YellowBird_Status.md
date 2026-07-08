# Yellow Bird Status

## Current Status

Project Yellow Bird has closed Milestone 2 — Publishing Engine, Milestone 3 — Launch Catalog Experience, and Milestone 4 — Launch Readiness / Final Public Site QA.

Milestone 2 created one stable publishing engine where a worksheet is generated once, transformed into multiple outputs, and rendered consistently.

Milestone 3 — Launch Catalog Experience is closed.

Milestone 4 — Launch Readiness / Final Public Site QA is closed.

The project is now approximately 95% launch-ready.

Milestone 3 completed goal:

Make the existing 46 ready worksheets feel trustworthy, findable, printable, and teacher-facing for September launch.

Ready / launch-facing worksheets remain 46 / 46 working, 0 failures.

Future phase after launch readiness:

Content Excellence / Product Differentiation Pass.

This phase begins only after core launch readiness reaches 100%, or if it is explicitly chosen. It should not distract from current launch-readiness work. Its purpose is to shift from stability/QA mode into a deeper quality and differentiation pass so Yellow Bird feels meaningfully better than a basic worksheet generator or generic resource catalog.

Recommended next phase before Content Excellence:

* Final launch packaging/checklist
* Optional README/deployment notes
* Final backup branch
* Decide whether to push/private remote backup
* Final manual walkthrough

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

Current primary launch navigation:

* Browse Library
* FAQ
* About
* Contact

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

### Post-Close Cleanup Checkpoint

Completed:

* Duplicate `app.listen` / server startup cleanup is complete
* Stale `public/resource.html` cleanup is complete
* Current active public flow remains `/browse` -> `/resource/worksheet/:id` -> `/catalog-preview.html?id={id}` -> `/api/catalog-pdf/{id}?disposition=inline`
* Legacy static `/resource/:slug` still works
* `/resource.html` now intentionally returns 404

Remaining follow-ups:

* Graph visual / `bar_graph` support
* True addition-jump number-line generator
* Visual fractions
* Pattern word problems
* Grade 6 pattern rename/remap review if needed
* Optional git identity configuration

### Milestone 3 — Launch Catalog Experience

Status:

* Milestone 3 is closed
* Scope is the launch-facing catalog experience for the existing 46 ready worksheets
* Do not expand the catalog in this milestone unless explicitly planned
* Do not work on generator follow-ups inside catalog polish tasks
* Do not redesign the homepage

Task 1 completed:

* Launch catalog public labels were polished
* Graph/data wording no longer overpromises visual graph worksheets
* Internal/debug-style labels were replaced with teacher-facing labels
* Public labels now avoid `Relational Thinking`
* Public labels now avoid `Related Subtraction`
* Public labels now avoid `Number Line Identify`
* Public labels now avoid `Daily Review` for skip counting
* Public labels now avoid repeated `Representation / Representation`
* Graph/data worksheets are described as text-based/data interpretation until visual graph support is implemented
* Ready / launch-facing worksheets remain 46 / 46 working, 0 failures
* Manual browser QA passed for `/browse`
* Manual browser QA passed for `/resource/worksheet/g3_read_a_graph`
* Manual browser QA passed for `/resource/worksheet/g5_complete_graphs`
* Manual browser QA passed for `/resource/worksheet/g1_subtraction_facts_within_20`
* Manual browser QA passed for `/resource/worksheet/g2_skip_counting_by_2`
* Manual browser QA passed for `/resource/worksheet/g2_expanded_form_to_100`
* Manual browser QA passed for `/resource/worksheet/g3_fact_families_multiplication_division`
* Commit: `50fa561 feat: polish launch catalog labels`

Task 2 completed:

* Representative worksheet print/preview QA found real print-trust blockers in text-heavy worksheets
* Main print blockers were long all-text prompts overlapping in rendered PDFs
* Text-heavy prompt overlap has been fixed
* Long all-text prompt worksheets now use safer layout behavior
* Visual-model worksheets remained healthy
* `g2_expanded_form_to_100` now matches its "to 100" title/range
* `g3_fact_families_multiplication_division` now generates multiplication/division fact families
* Ready / launch-facing worksheets remain 46 / 46 working, 0 failures
* Representative rendered PDF checks passed for:
  * `g1_addition_word_problems`
  * `g2_skip_counting_by_2`
  * `g3_read_a_graph`
  * `g5_interpret_graphs`
  * `g6_graph_interpretation`
  * `g3_fact_families_multiplication_division`
  * `g2_expanded_form_to_100`
  * `g3_multiplication_arrays`
  * `k_ten_frame_counting_to_10`
* Remaining follow-ups:
  * Graph visuals / `bar_graph` support remains deferred
  * Duplicate prompt variation can be improved later
  * Full 46-item manual print QA can happen after representative fixes
* Commit: `480dfb7 fix: prevent text-heavy worksheet prompt overlap`
* Commit: `ba55d90 fix: align catalog worksheet semantics`

Task 3 completed:

* Post-fix Browse -> Detail -> Preview/PDF trust QA passed with minor issues
* Checked representative flow:
  * `/browse`
  * `/resource/worksheet/g1_addition_word_problems`
  * `/resource/worksheet/g2_skip_counting_by_2`
  * `/resource/worksheet/g2_expanded_form_to_100`
  * `/resource/worksheet/g3_read_a_graph`
  * `/resource/worksheet/g3_fact_families_multiplication_division`
  * `/resource/worksheet/g5_interpret_graphs`
  * `/resource/worksheet/k_ten_frame_counting_to_10`
  * `/resource/worksheet/g3_multiplication_arrays`
* No prompt-overlap blockers remained in checked samples
* Public labels feel teacher-facing
* Graph/data wording remains honest/text-based until visual graph support ships
* Preview page now links back to `/browse` with "Back to Browse" instead of internal catalog wording
* Ready / launch-facing worksheets remain 46 / 46 working, 0 failures
* Remaining minor polish:
  * Duplicate prompt variation
  * Graph visuals / `bar_graph` support remains deferred
  * Full 46-item print QA later
* Commit: `e869f1b fix: point preview back link to browse`

Task 4 completed:

* Duplicate prompt audit completed
* Duplicate prompt issue was confirmed as a minor teacher-trust issue, not a Milestone 3 blocker
* Skip counting duplicate suppression is complete
* Fact family duplicate suppression is complete
* Same-seed deterministic behavior was preserved
* Generator output shape was preserved
* Ready / launch-facing worksheets remain 46 / 46 working, 0 failures
* Multi-seed checks passed for:
  * `g2_skip_counting_by_2`
  * `g2_skip_counting_by_5`
  * `g2_skip_counting_by_10`
  * `g1_fact_families_within_20`
  * `g3_fact_families_multiplication_division`
* Graph/data duplicate prompts remain intentionally deferred with graph / `bar_graph` support because those generators have tiny fixed prompt pools
* Commit: `a691316 fix: reduce duplicate skip counting and fact family prompts`

Task 5 completed:

* Full 46-item ready worksheet QA re-audit completed
* All 46 ready worksheets generate successfully
* All 46 PDFs render successfully
* Prior seven semantic range/content blockers are resolved
* Prior three answer-key overlap blockers are resolved
* Remaining blockers: none
* Milestone 3 is closeable from this QA pass
* Ready / launch-facing worksheets remain 46 / 46 working, 0 failures
* Safe deferrals:
  * Graph/data duplicate prompt pools remain deferred until graph / `bar_graph` support
  * Minor duplicate practice items in small-pool worksheets can be improved later
  * Text-only Kindergarten compare sets can be improved later with true visual set support
  * Graph/data worksheets remain intentionally text-based/data interpretation until visual graph support ships
* Recommended next step: final manual browser spot QA, then formally close Milestone 3 if it passes
* Commit: `3e7f320 fix: align catalog ranges for ready worksheets`
* Commit: `57715f6 fix: prevent answer key overlap`

Milestone 3 closeout:

* Milestone 3 — Launch Catalog Experience is closed
* Final manual browser spot QA passed
* Checked:
  * `/browse`
  * `/resource/worksheet/g1_missing_addends_within_20`
  * `/resource/worksheet/g2_standard_form_to_100`
  * `/resource/worksheet/k_compare_sets`
  * `/resource/worksheet/g3_multiplication_facts`
  * `/resource/worksheet/g5_multiplication_fact_review`
  * `/resource/worksheet/g3_read_a_graph`
  * `/resource/worksheet/k_ten_frame_counting_to_10`
* Pages work
* Details load
* Preview opens
* PDF opens
* No obvious overlap/clipping
* Answer keys are readable
* Labels feel teacher-facing
* Graph/data wording does not overpromise visuals
* Preview back link returns to Browse
* Browse -> Detail -> Preview -> PDF flow remains stable
* Ready / launch-facing worksheets remain 46 / 46 working, 0 failures
* Task 1 label/catalog polish complete
* Task 2 print-trust fixes complete
* Task 3 post-fix trust QA complete
* Task 4 duplicate prompt polish complete
* Task 5 full ready worksheet QA complete
* Remaining safe deferrals:
  * Graph / `bar_graph` visual support
  * Graph/data duplicate prompt pools
  * Minor duplicate practice items in small-pool worksheets
  * True visual Kindergarten compare sets
  * Future content excellence review after launch readiness reaches 100%
* Future direction: after core launch readiness reaches 100%, do a deeper content review / product excellence pass to push worksheet quality, pedagogy, display, and content presentation beyond basic launch stability
* Future phase name: Content Excellence / Product Differentiation Pass

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

Milestone 4 launch readiness and final public site QA.

Known issues / next targets:

1. Continue final public site QA around Home, Browse, Detail, Preview, PDF, FAQ, About, and Contact.
2. Keep `/curriculum`, `/worksheet`, and `/units` reachable by direct URL but out of primary launch navigation.
3. Resolve only launch-readiness blockers before moving into Content Excellence / Product Differentiation.
4. Keep graph visual support deferred until a focused `bar_graph` implementation plan is created.
5. Keep true addition-jump number-line work deferred until a focused generator plan is created.
6. Keep visual fraction work deferred until focused visual support is planned.
7. Keep planned/deferred `pattern_word_problems` entries out of launch-facing scope until implemented.
8. Review Grade 6 pattern naming/remapping if needed.
9. Configure git identity if needed.

Future mode after launch readiness:

Content Excellence / Product Differentiation Pass should focus on worksheet quality, pedagogy/scaffolding, differentiation, visual and print presentation, teacher-facing value, catalog/display improvements, content voice/brand, and product differentiation. This is a future direction, not a current blocker.

---

## Milestone 4 — Launch Readiness / Final Public Site QA

Status:

* Milestone 4 is closed
* Task 1 public route/navigation launch polish is complete
* Task 2 internal/debug surface audit and treatment is complete
* Task 3 mobile/responsive/accessibility spot QA and small polish is complete
* Task 4 deployment/package readiness audit and basics is complete
* Task 5 final launch-facing smoke QA is complete
* No launch blockers remain from final smoke QA
* Project is now approximately 95% launch-ready

Task 1A completed:

* Public info route polish complete
* `/faq` serves the real FAQ page
* `/about` serves the About page
* `/contact` serves the Contact page
* Commit: `6e6551c feat: add public info routes`

Task 1B completed:

* Launch nav QA complete
* `/browse` confirmed as the safest launch-facing primary destination
* `/faq`, `/about`, and `/contact` confirmed route-safe after Task 1A
* `/curriculum`, `/worksheet`, and `/units` identified as direct-URL surfaces that should not be primary launch nav yet

Task 1C completed:

* Public nav launch polish complete
* Primary launch nav now promotes:
  * Browse Library
  * FAQ
  * About
  * Contact
* `/curriculum`, `/worksheet`, and `/units` remain reachable by direct URL but are no longer primary launch nav
* Browse quick links to `/curriculum` and `/worksheet` were removed
* Browse -> Detail -> Preview -> PDF remains stable
* Ready / launch-facing worksheets remain 46 / 46 working, 0 failures
* Remaining launch-nav concern:
  * `/units` still has an internal secondary "Try Curriculum" link, but it is not in primary nav
* Commit: `a838a9a feat: simplify public launch navigation`

Task 2 completed:

* Internal/debug surface audit completed
* Task 2A internal/beta/noindex treatment completed
* Direct-only/internal pages now show internal/beta/QA treatment:
  * `/worksheet-catalog.html`
  * `/generated-worksheets.html`
  * `/curriculum`
  * `/worksheet`
  * `/units`
  * `/qa/smoke`
  * `/expectation.html`
* `noindex,nofollow` added to appropriate internal/beta static pages
* `/qa/smoke` no longer links to `/curriculum`, `/worksheet`, or `/units`
* `/units` no longer promotes the secondary "Try Curriculum" link
* Empty `/expectation.html` was replaced with an intentional internal placeholder
* Launch-facing pages were left untouched:
  * `/`
  * `/browse`
  * `/faq`
  * `/about`
  * `/contact`
  * Resource detail pages
  * Catalog preview
  * PDFs
* Launch nav remains Browse Library, FAQ, About, Contact
* Ready / launch-facing worksheets remain 46 / 46 working, 0 failures
* Remaining future production decision:
  * Decide later whether any direct-only internal/beta URLs should be guarded or 404'd in production
* Commit: `68ec8f2 chore: mark internal surfaces as beta`

Task 3 completed:

* Mobile/responsive/accessibility spot QA completed
* No mobile/accessibility launch blockers found
* Launch-facing pages checked:
  * `/`
  * `/browse`
  * `/resource/worksheet/g1_addition_facts_within_20`
  * `/catalog-preview.html?id=g1_addition_facts_within_20`
  * `/faq`
  * `/about`
  * `/contact`
* Task 3A small accessibility polish complete:
  * Semantic headings improved on FAQ/About/Contact
  * Browse now has a keyboard skip link to results
  * Browse results target is valid and keyboard reachable
  * Catalog preview action buttons have explicit focus-visible styling
* Launch nav remains Browse Library, FAQ, About, Contact
* Ready / launch-facing worksheets remain 46 / 46 working, 0 failures
* Safe deferrals:
  * Compact mobile nav treatment later
  * Deeper Browse keyboard ergonomics later
  * Preview JSON button polish later if desired
  * Contact copy polish later
* Commit: `34f995f feat: improve launch accessibility basics`

Task 4 completed:

* Deployment/package readiness audit completed
* Task 4A deployment basics completed
* `package.json` now has explicit:
  * `"main": "server.js"`
  * `"start": "node server.js"`
* `.env` is ignored
* `.env.example` exists with optional `PORT=3000` guidance and no secrets
* `/health` endpoint added and returns 200 JSON
* `/qa/smoke` now checks launch-facing routes only
* Stale unit/curriculum smoke calls were removed
* `npm start` verified using the explicit start script
* Final smoke checks passed for:
  * `/`
  * `/browse`
  * `/faq`
  * `/about`
  * `/contact`
  * `/health`
  * `/qa/smoke`
  * `/api/worksheet-catalog?status=ready`
  * `/resource/worksheet/g1_addition_facts_within_20`
  * `/catalog-preview.html?id=g1_addition_facts_within_20`
  * `/api/catalog-pdf/g1_addition_facts_within_20?disposition=inline`
* Catalog API returned 46 ready items
* Catalog PDF returned `application/pdf` and a valid 2-page PDF
* Ready / launch-facing worksheets remain 46 / 46 working, 0 failures
* Commit: `c488b47 chore: add launch deployment basics`

Task 5 completed:

* Final launch-facing smoke QA passed with no blockers
* `git status --short` showed only expected untracked future/internal files:
  * `engine/catalog/`
  * `engine/visuals/index`
  * `engine/visuals/renderVisual.js`
  * `public/styles/images/`
* `npm start` works with the explicit package script
* `npm run audit:worksheets` passed
* Ready / launch-facing worksheets remain 46 / 46 working, 0 failures
* Launch-facing routes passed:
  * `/`
  * `/browse`
  * `/faq`
  * `/about`
  * `/contact`
  * `/health`
  * `/qa/smoke`
  * `/api/worksheet-catalog?status=ready`
  * `/resource/worksheet/g1_addition_facts_within_20`
  * `/catalog-preview.html?id=g1_addition_facts_within_20`
  * `/api/catalog-pdf/g1_addition_facts_within_20?disposition=inline`
* Catalog API returned 46 ready items
* Catalog PDF returned valid `application/pdf`
* Public launch nav remains:
  * Browse Library
  * FAQ
  * About
  * Contact
* Direct-only internal/beta pages are marked `noindex,nofollow` and show internal/beta/QA messaging
* `/qa/smoke` checks launch-facing routes only

Milestone 4 closeout:

* Milestone 4 — Launch Readiness / Final Public Site QA is closed
* No launch blockers remain from final smoke QA
* Completed Milestone 4 work:
  * Task 1 public route/navigation launch polish
  * Task 2 internal/debug surface treatment
  * Task 3 mobile/accessibility QA and polish
  * Task 4 deployment/package readiness
  * Task 5 final launch-facing smoke QA
* Safe deferrals:
  * Future decision on guarding or 404'ing direct-only internal/beta URLs in production
  * Graph visuals / `bar_graph` support
  * Visual Kindergarten compare sets
  * Graph/data prompt pools
  * Minor duplicate practice polish
  * Content Excellence / Product Differentiation Pass after core launch readiness reaches 100%
* Recommended next phase before Content Excellence:
  * Final launch packaging/checklist
  * Optional README/deployment notes
  * Final backup branch
  * Decide whether to push/private remote backup
  * Final manual walkthrough

## Next Fix Targets

1. Focused `bar_graph` support plan for graph visuals.
2. Focused generator plan for true addition-jump number-line worksheets.
3. Focused visual support plan for visual fractions.
4. Planned/deferred `pattern_word_problems` implementation.
5. Grade 6 pattern rename/remap review if needed.
6. Optional git identity configuration.
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

## Milestone 6 — Content Expansion / Resource Depth

Milestone 6 is underway. Milestones 2–5 remain closed.

Control document: `docs/content-expansion.md`

Guiding phrase:

More fuel in the same airplane.

Batch 1 completed:

* Promoted 6 generated worksheets to ready:
  * `grade1_addition_subtraction_word_problems_subtraction_word_problem`
  * `grade1_place_value_representation_base_ten_blocks`
  * `grade2_addition_subtraction_word_problems_subtraction_word_problem`
  * `grade4_fraction_equivalence_compare_fractions`
  * `grade5_multiplication_facts_missing_factor`
  * `grade6_multiplication_facts_missing_factor`
* Ready launch-facing worksheets increased from 46 to 52
* Ready result: 52 / 52 working, 0 failures
* Backup branch: `backup/milestone-6-batch-1`
* Accepted minor issues:
  * Word-problem sheets are printable but somewhat repetitive
  * Missing-factor sheets have minor duplicate-style practice
* Next recommended task: QA another small candidate batch or replace deferred candidates with safer generated entries

Batch 2 completed:

* Promoted 8 generated worksheets to ready
* Ready launch-facing worksheets increased from 52 to 60
* Ready result: 60 / 60 working, 0 failures
* Backup branch: `backup/milestone-6-batch-2`
* Accepted minor issues:
  * Equivalent-fraction prompts may be repetitive
  * Grade 5/6 equal-groups sheets may read as review practice
* Milestone 6 gain so far: +14 ready worksheets
* Next recommended task: Run Batch 3 candidate search using `docs/content-expansion.md`

Batch 3 completed:

* Promoted 4 generated worksheets to ready:
  * `grade3_fraction_equivalence_match_equivalent_fractions`
  * `grade3_place_value_representation_base_ten_blocks`
  * `grade3_place_value_representation_expanded_form`
  * `grade3_place_value_representation_standard_form`
* Ready launch-facing worksheets increased from 60 to 64
* Ready result: 64 / 64 working, 0 failures
* Backup branch: `backup/milestone-6-batch-3`
* Confirmed not promoted:
  * `grade4_place_value_representation_expanded_form`
  * `grade4_place_value_representation_standard_form`
* Accepted minor issue:
  * Equivalent-fraction prompts may be repetitive
* Quality decision: Did not promote the Grade 4 stretch candidates because quality bar matters more than batch size
* Milestone 6 gain so far: +18 ready worksheets
* Next recommended task: Batch 4 candidate search using `docs/content-expansion.md`, avoiding weak filler

Batch 4 completed:

* Promoted 6 generated Patterning & Algebra worksheets to ready:
  * `grade3_patterning_and_algebra_extend_pattern`
  * `grade3_patterning_and_algebra_identify_pattern_rule`
  * `grade3_patterning_and_algebra_missing_value_pattern`
  * `grade4_patterning_and_algebra_extend_pattern`
  * `grade4_patterning_and_algebra_identify_pattern_rule`
  * `grade4_patterning_and_algebra_missing_value_pattern`
* Ready launch-facing worksheets increased from 64 to 70
* Ready result: 70 / 70 working, 0 failures
* Patterning & Algebra ready count: 6
* Backup branch: `backup/milestone-6-batch-4`
* Confirmed not promoted:
  * `grade3_patterning_and_algebra_function_table`
  * `grade4_patterning_and_algebra_function_table`
  * Grade 5/6 patterning candidates
  * `pattern_word_problems`
  * `g6_pattern_rules`
  * `g6_input_output_tables`
  * Grade 4 place-value stretch candidates
* Accepted minor issue:
  * Duplicate-style pattern prompts may appear
* Quality decision: Promoted Grade 3-4 patterning only because it filled a true domain gap; did not promote Grade 5/6 or function-table patterning candidates because they were too weak or mismatched
* Milestone 6 gain so far: +24 ready worksheets
* Next recommended task: Batch 5 candidate search using `docs/content-expansion.md`, with special attention to quality because the easiest clean candidates are becoming thinner

Batch 5 completed:

* Promoted 2 generated multiplication word-problem worksheets to ready:
  * `grade3_multiplication_facts_word_problems`
  * `grade4_multiplication_facts_word_problems`
* Ready launch-facing worksheets increased from 70 to 72
* Ready result: 72 / 72 working, 0 failures
* Commit: `5e1b4f7 content: promote fifth milestone 6 worksheet batch`
* Multiplication word-problem routing is fixed by `f2168f1 fix: route preferred word problem activities`
* Old issue: `multiplication_facts` `word_problems` candidates rendered PDFs with 0 problems
* Root cause: `pickActivitiesFromRecipe` switched preferred activity `word_problems` into heuristic mode `word_problem_focus`, but `multiplication_facts.json` did not include that variant, causing an empty activity list
* New status: Grade 3-4 equal-groups multiplication word-problem resources are ready; upper-grade versions remain deferred for review/intervention framing or richer complexity
* Verification passed:
  * JSON parse passed for both catalog files
  * `npm run audit:worksheets` passed
  * `/api/worksheet-catalog?status=ready` returned 72 items
  * Grade 3 and Grade 4 resource detail, preview, and PDF routes returned 200
  * Both PDFs rendered valid 3-page PDFs with 12 problems and 12 answers
  * Answer keys were readable
  * No clipping or overlap observed
  * Known planned failures remain limited to `pattern_word_problems`
* Confirmed not promoted:
  * `grade5_multiplication_facts_word_problems`
  * `grade6_multiplication_facts_word_problems`
* Accepted minor issue:
  * One duplicate prompt appeared but does not block public readiness
* Quality decision: Grade 3 is ready as equal-groups multiplication word-problem practice; Grade 4 is ready as multiplication word-problem review/practice; Grade 5-6 remain deferred/generated because the equal-groups problems are too basic for public-facing upper-grade depth unless later reframed as review/intervention or upgraded with richer complexity
* Milestone 6 gain so far: +26 ready worksheets
* Milestone 6 is around 52% complete
* Recommended target before external testing: 85-90 ready worksheets, 10-15 exit tickets / quick checks, and 5-10 review or mini-quiz resources
* Strategic sequence: 70 ready worksheets -> 85 stronger worksheets -> add exit tickets and quick checks -> reach 100+ ready resources -> test with teachers -> then decide on Morning Math, differentiation packs, small-group lessons, or unit plans
* Next recommended task: Batch 6 candidate search using `docs/content-expansion.md`, preserving quality over raw count and the stable-platform guardrails

Batch 6 completed:

* Promoted 5 generated Grade 2 worksheets to ready:
  * `grade2_patterning_and_algebra_missing_value_pattern`
  * `grade2_patterning_and_algebra_extend_pattern`
  * `grade2_patterning_and_algebra_identify_pattern_rule`
  * `grade2_addition_subtraction_facts_missing_addend`
  * `grade2_addition_subtraction_facts_related_subtraction`
* Ready launch-facing worksheets increased from 72 to 77
* Ready result: 77 / 77 working, 0 failures
* Commit: `5f1eb4c content: promote sixth milestone 6 worksheet batch`
* Verification passed:
  * JSON parse passed for both catalog files
  * `npm run audit:worksheets` passed
  * Generated worksheets were 221 / 221 working
  * Partial worksheets were 5 / 5 working
  * Planned failures remained known/deferred `pattern_word_problems`
  * `/api/worksheet-catalog?status=ready` returned 77 items
  * All five promoted detail routes returned 200
  * All five promoted preview routes returned 200
  * All five promoted PDF routes returned 200 `application/pdf`
  * Each promoted PDF generated real content with 12 problems and 12 answers
  * Answer keys were readable
  * No clipping, overlap, empty sections, or unrelated catalog changes were observed
* Confirmed not promoted:
  * `grade2_addition_subtraction_facts_fact_fluency`
* Accepted minor issue:
  * Patterning sheets may contain minor duplicate-style prompts
* Quality decision: Grade 2 Patterning & Algebra sheets are ready as practice/review resources with minor framing caution; Grade 2 Addition/Subtraction relationship sheets are ready as clean fact relationship practice; the Grade 2 fact fluency candidate remains backup-only because it may duplicate existing Grade 2 fluency-style resources and could feel like count-padding unless it fills a specific gap
* Framing guardrail: Patterning resources are pattern practice, not deep algebra or assessment; addition/subtraction resources are fact relationship practice, not full fluency mastery or assessment; all five are skill practice connected to curriculum, not full expectation coverage
* Official Ontario wording was not verified, so plain-language alignment summaries remain the standard
* Milestone 6 gain so far: +31 ready worksheets
* Milestone 6 is around 58% complete
* Recommended target before external testing: 85-90 ready worksheets, 10-15 exit tickets / quick checks, and 5-10 review or mini-quiz resources
* Strategic sequence: 70 ready worksheets -> 85 stronger worksheets -> add exit tickets and quick checks -> reach 100+ ready resources -> test with teachers -> then decide on Morning Math, differentiation packs, small-group lessons, or unit plans
* Next recommended task: Batch 7 candidate search using `docs/content-expansion.md`, preserving quality over raw count and the stable-platform guardrails

Batch 7 completed:

* Promoted 2 generated worksheets to ready:
  * `grade3_place_value_representation_number_word_match`
  * `grade2_multiplication_facts_arrays`
* Ready launch-facing worksheets increased from 77 to 79
* Ready result: 79 / 79 working, 0 failures
* Commit: `bb866a9 content: promote seventh milestone 6 worksheet batch`
* Verification passed:
  * JSON parse passed for both catalog files
  * `npm run audit:worksheets` passed
  * Generated worksheets were 219 / 219 working
  * Partial worksheets were 5 / 5 working
  * Planned failures remained known/deferred `pattern_word_problems`
  * `/api/worksheet-catalog?status=ready` returned 79 items
  * Both promoted detail routes returned 200
  * Both promoted preview routes returned 200
  * Both promoted PDF routes returned 200 `application/pdf`
  * Grade 3 number-word match rendered a valid 2-page PDF with 12 problems and 12 answers
  * Grade 2 arrays rendered a valid 2-page PDF with 10 visual problems and 10 answers
  * Answer keys were readable
  * No clipping or overlap was observed
* Confirmed not promoted:
  * `grade1_patterning_and_algebra_extend_pattern`
  * `grade1_patterning_and_algebra_identify_pattern_rule`
  * `grade1_patterning_and_algebra_missing_value_pattern`
  * `grade2_place_value_representation_number_word_match`
  * `grade1_addition_subtraction_facts_related_subtraction`
  * `grade1_addition_subtraction_facts_fact_fluency`
  * `grade2_addition_subtraction_facts_fact_fluency`
  * `grade2_multiplication_facts_equal_groups`
  * `grade2_multiplication_facts_skip_counting`
  * `grade4_place_value_representation_expanded_form`
* Accepted minor issues:
  * Grade 3 number-word match has one duplicate number
  * Grade 3 number-word wording omits "and" but remains readable
  * Grade 2 arrays repeat prompt text, but visuals vary
* Quality decision: Grade 3 number-word match is ready as number-word / standard-form matching review or independent practice; Grade 2 arrays is ready as early visual multiplication thinking using arrays as equal groups; Grade 1 patterning candidates remain deferred/revision-needed because Teacher QA found the number range and rule complexity may be too high for broad public-facing Grade 1 use
* Framing guardrail: Avoid claims of assessment, mastery, full expectation coverage, deep problem-solving, or complete curriculum coverage; Grade 2 arrays should not be framed as multiplication fact fluency, word problems, or full multiplication mastery
* Milestone 6 gain so far: +33 ready worksheets
* Milestone 6 is around 60% complete
* Recommended target before external testing: 85-90 ready worksheets, 10-15 exit tickets / quick checks, and 5-10 review or mini-quiz resources
* Strategic sequence: 79 ready worksheets -> 85 stronger worksheets -> add exit tickets and quick checks -> reach 100+ ready resources -> test with teachers -> then decide on Morning Math, differentiation packs, small-group lessons, or unit plans
* Next recommended task: Batch 8 candidate search using `docs/content-expansion.md`, preserving quality over raw count and the stable-platform guardrails

Batch 8 completed:

* Promoted 2 generated Grade 2 worksheets to ready:
  * `grade2_addition_subtraction_facts_fact_family`
  * `grade2_addition_subtraction_word_problems_missing_addend_word_problem`
* Ready launch-facing worksheets increased from 79 to 81
* Ready result: 81 / 81 working, 0 failures
* Commit: `c86a9d8 content: promote eighth milestone 6 worksheet batch`
* Verification passed:
  * JSON parse passed for both catalog files
  * `npm run audit:worksheets` passed
  * Generated worksheets were 217 / 217 working
  * Partial worksheets were 5 / 5 working
  * Planned failures remained known/deferred `pattern_word_problems`
* Confirmed not promoted:
  * `grade2_fraction_equivalence_compare_fractions`
  * `grade2_fraction_equivalence_match_equivalent_fractions`
* Accepted minor issue:
  * Missing-addend word problems repeat a "cans" scenario and may feel somewhat generated, but remain useful as short practice
* Quality decision: Grade 2 fact families are ready as addition/subtraction relationship practice; Grade 2 missing-addend word problems are ready as missing-addend story problem practice; Grade 2 fraction candidates remain deferred/revision-needed because Curriculum Alignment found weak Grade 2 alignment unless revised or reframed
* Fraction deferral note: The compare-fractions resource may need visual, simple, guided, or enrichment framing; the match-equivalent-fractions resource is likely too advanced if symbolic and should be deferred or substantially reframed away from formal equivalent fractions
* Framing guardrail: Fact families are related addition/subtraction fact practice; missing-addend word problems are story problem practice after students have learned to represent unknowns; avoid claims of assessment, mastery, full expectation coverage, deep problem-solving, or complete curriculum coverage
* Milestone 6 gain so far: +35 ready worksheets
* Milestone 6 is around 62% complete
* Recommended target before external testing: 85-90 ready worksheets, 10-15 exit tickets / quick checks, and 5-10 review or mini-quiz resources
* Strategic sequence: 81 ready worksheets -> 85 stronger worksheets -> add exit tickets and quick checks -> reach 100+ ready resources -> test with teachers -> then decide on Morning Math, differentiation packs, small-group lessons, or unit plans
* Next recommended task: Batch 9 candidate search using `docs/content-expansion.md`, preserving quality over raw count and the stable-platform guardrails

Batch 9 completed:

* Promoted 2 generated multiplication/equal-groups worksheets to ready:
  * `grade3_multiplication_facts_equal_groups`
  * `grade4_multiplication_facts_equal_groups`
* Ready launch-facing worksheets increased from 81 to 83
* Ready result: 83 / 83 working, 0 failures
* Commit: `1b52562 content: promote ninth milestone 6 worksheet batch`
* Verification passed:
  * JSON parse passed for both catalog files
  * `npm run audit:worksheets` passed
  * Generated worksheets were 215 / 215 working
  * Partial worksheets were 5 / 5 working
  * Planned failures remained known/deferred `pattern_word_problems`
  * `/api/worksheet-catalog?status=ready` returned 83 items
  * Both promoted detail routes returned 200
  * Both promoted preview routes returned 200
  * Both promoted PDF routes returned 200 `application/pdf` with `%PDF-` header
  * Both rendered valid 3-page PDFs with 12 problems and 12 answers
  * Answer keys were readable
  * No clipping or overlap observed
* Confirmed not promoted:
  * Data/graphing candidates
  * Grade 5/6 place-value candidates
  * Title/content mismatch resources
  * 0-problem resources
* Accepted minor issue:
  * One exact duplicate prompt appears in each equal-groups worksheet and remains non-blocking
* Quality decision: Grade 3 equal groups is ready as multiplication practice or review after concrete modelling with drawings, arrays, counters, or manipulatives; Grade 4 equal groups is ready only as foundational multiplication review/support, intervention, warm-up, or conceptual reinforcement
* Framing guardrail: Grade 4 equal groups must not be framed as core Grade 4 multiplication depth or Grade 4 multiplication mastery; avoid claims of assessment, mastery, full expectation coverage, deep problem-solving, multi-step multiplication, multi-digit multiplication, or complete curriculum coverage
* Milestone 6 gain so far: +37 ready worksheets
* Milestone 6 is around 64% complete
* Recommended target before external testing: 85-90 ready worksheets, 10-15 exit tickets / quick checks, and 5-10 review or mini-quiz resources
* Strategic sequence: 83 ready worksheets -> 85 stronger worksheets -> add exit tickets and quick checks -> reach 100+ ready resources -> test with teachers -> then decide on Morning Math, differentiation packs, small-group lessons, or unit plans
* Next recommended task: Batch 10 candidate search using `docs/content-expansion.md`, preserving quality over raw count and the stable-platform guardrails

Batch 10 completed:

* Promoted 1 generated Grade 1 worksheet to ready:
  * `grade1_addition_subtraction_word_problems_missing_addend_word_problem`
* Ready launch-facing worksheets increased from 83 to 84
* Ready result: 84 / 84 working, 0 failures
* Commit: `eabb16a content: promote tenth milestone 6 worksheet batch`
* Verification passed:
  * JSON parse passed for both catalog files
  * `npm run audit:worksheets` passed
  * Generated worksheets were 214 / 214 working
  * Partial worksheets were 5 / 5 working
  * Planned failures remained known/deferred `pattern_word_problems`
  * `/api/worksheet-catalog?status=ready` returned 84 items
  * Detail, preview, and PDF routes returned 200
  * PDF route returned 200 `application/pdf`
  * The worksheet rendered a valid 3-page PDF with 12 problems and 12 answers
  * Answer key was readable
  * No clipping or overlap observed
* Confirmed not promoted:
  * `grade1_addition_subtraction_facts_ten_frame`
  * `grade1_addition_subtraction_facts_fact_family`
  * `grade1_addition_subtraction_word_problems_addition_word_problem`
  * `grade1_addition_subtraction_facts_related_subtraction`
  * `grade2_addition_subtraction_word_problems_addition_word_problem`
  * `grade3_multiplication_facts_missing_factor`
  * `grade2_multiplication_facts_word_problems`
* Accepted minor issues:
  * Repeated food-drive/cans scenario
  * Generic subtitle text
* Quality decision: Grade 1 missing-addend story problems within 20 are ready as meaningful addition/subtraction relationship practice after concrete modelling with drawings, counters, ten frames, or number lines
* Framing guardrail: Best framed as supported practice, review, small-group work, intervention, or homework with adult support; avoid claims of assessment, mastery, independent first exposure, independent equation solving, full expectation coverage, deep algebraic reasoning, or advanced problem-solving
* Milestone 6 gain so far: +38 ready worksheets
* Milestone 6 is around 66% complete
* Recommended target before external testing: keep 84 ready worksheets as the worksheet-depth checkpoint, add 10-15 exit tickets / quick checks, then add 5-10 review or mini-quiz resources

Final worksheet micro-scan completed:

* Result: no worksheet promoted
* Ready launch-facing worksheets remain 84 / 84 working, 0 failures
* Audit passed:
  * Ready worksheets were 84 / 84 working, 0 failures
  * Generated worksheets were 214 / 214 working, 0 failures
  * Partial worksheets were 5 / 5 working, 0 failures
  * Planned worksheets were 2 / 9 working, with 7 known/deferred `pattern_word_problems` failures
* Product decision: 84 strong worksheets is better than 85 with filler
* Worksheet promotion is paused at 84 because the remaining generated pool is thinning and the best technical near-candidates felt like count-padding or needed fixes/reframing
* Near-candidates reviewed but not promoted:
  * `grade3_multiplication_facts_arrays`: valid PDF and visual problems, but too close to existing ready Grade 3 array/multiplication coverage
  * `grade2_multiplication_facts_equal_groups`: valid PDF, but lacks visual support, includes products like 90/60, has one exact duplicate, and feels too abstract/advanced for broad Grade 2 public use without stronger framing or visual support
  * `grade3_addition_subtraction_word_problems_subtraction_word_problem`: real problems, but within-20 subtraction is too shallow for Grade 3 public-facing depth
  * `grade4_patterning_and_algebra_function_table`: generates, but function-table patterning remains weak/mismatched compared with the promoted Grade 3-4 patterning set
* Future/fix-needed lanes: Grade 2 equal groups with visuals/smaller factors, differentiated Grade 3 arrays, richer Grade 3-4 addition/subtraction word problems, upgraded or reframed Grade 5-6 multiplication word problems, `pattern_word_problems`, `fraction_word_problems`, data/graphing prompt pools/visuals, and title/content mismatch families
* Strategic sequence: 84 ready worksheets -> pause worksheet promotion -> plan exit tickets / quick checks -> build 10-15 quick resources -> reach about 95-100 resources -> add review/mini-quiz resources if useful -> reach 100-115 ready resources -> test with teachers -> then decide on Morning Math, differentiation packs, small-group lessons, or unit plans
* Next recommended task: Begin exit tickets / quick checks planning

Exit Ticket / Quick Check feasibility decision:

* Control doc: `docs/exit-tickets-quick-checks.md`
* Read-only architecture/catalog review found the lane is feasible with a small new resource lane
* Best framing: same catalog engine, new resource family
* Do not treat Exit Tickets / Quick Checks as just more worksheets
* Current generators/runtime can supply much of the content, but the product needs separate metadata and a compact PDF template
* This can be done without destabilizing worksheet PDFs if existing worksheet renderer behavior remains untouched
* Implementation should use a separate compact renderer or a narrow `resourceType` branch
* Do not alter `renderWorksheetPDF` behavior globally
* Start with Quick Check first, not two-per-page Exit Ticket
* First implementation target: one compact single-page Quick Check proof of concept
* Preferred first candidate: `g3_place_value_hundreds_tens_ones_quick_check`
* Add two-per-page cut-apart Exit Ticket format later after the Quick Check path works
* Guardrail: use formative check / review / warm-up / small-group language; do not call these assessments, tests, mastery checks, diagnostics, or summative resources
* Next recommended task: Add minimal `resourceType` support, compact Quick Check renderer, and one proof-of-concept Quick Check, then verify Browse/detail/preview/PDF

First Quick Check proof of concept completed:

* Commit: `5442440 feat: add first quick check resource`
* Backup branch: `backup/milestone-6-first-quick-check`
* Implemented Quick Check:
  * `g3_place_value_hundreds_tens_ones_quick_check`
  * Title: Hundreds, Tens, and Ones Quick Check
  * Grade: 3
  * Resource type: `quick_check`
  * Format label: Quick Check
  * Skill: represent 3-digit numbers using hundreds, tens, and ones
  * Use case: short formative skill check, review, small-group check, or homeschool check
* Ready resources: 85 / 85 working, 0 failures
* Ready worksheets: 84
* Ready Quick Checks: 1
* Product decision: worksheet promotion remains paused at 84; the resource count reached 85 by adding the first Quick Check, not by forcing a filler worksheet
* Implementation summary:
  * Added one ready Quick Check catalog item
  * Added compact Quick Check PDF rendering through `renderers/quickCheckPdfRenderer.js`
  * Existing `renderWorksheetPDF` behavior remains untouched for normal worksheets
  * Added narrow route/runtime support for `resourceType: quick_check`
  * Added minimal metadata support for `resourceType`, `formatLabel`, `teacherNote`, `useCase`, `prepLevel`, and `formativeUse`
  * Lightly updated Browse, detail, and preview labels so the item presents as a Quick Check
  * Added opt-in `expandedForm` answer style for hundreds/tens/ones prompts
* Verification passed:
  * JS syntax checks passed for changed JS files
  * Catalog JSON parse passed
  * `npm run audit:worksheets` passed
  * Ready result: 85 / 85 working, 0 failures
  * Generated result: 214 / 214 working, 0 failures
  * Partial result: 5 / 5 working, 0 failures
  * Planned result: 2 / 9 working, with 7 known/deferred `pattern_word_problems` failures
  * Quick Check runtime generates 6 real prompts
  * Quick Check PDF route returned 200 `application/pdf` and a valid 2-page letter PDF
  * Existing worksheet PDF regression check passed using `g1_addition_facts_within_20`
  * Browse/detail/preview/PDF route checks passed
* Teacher QA result: public-ready as the first Quick Check
* Curriculum Alignment result: approved with minor wording/framing caution
* Wording update:
  * Teacher note now frames the resource for use after a place-value lesson
  * Description now frames it as focused place-value review
* Final positioning: A Grade 3 quick formative check for representing 3-digit numbers using hundreds, tens, and ones. Best used after place-value instruction as a short review or progress check, not as a full assessment or mastery measure.
* Framing guardrail: This should be described as a quick formative check, review, small-group check, or homeschool check, not a test, diagnostic, mastery check, summative assessment, or full expectation assessment
* Next recommended task: build a controlled first batch of 3-5 more Quick Checks, not the full 10-15 yet
* Defer two-per-page Exit Tickets until the compact Quick Check lane proves stable

First controlled Quick Check batch completed:

* Commit: `527e3b3 feat: add first quick check batch`
* Backup branch: `backup/milestone-6-first-quick-check-batch`
* Existing approved Quick Check:
  * `g3_place_value_hundreds_tens_ones_quick_check`
* New Quick Checks:
  * `g2_subtraction_within_20_quick_check`
  * `g2_addition_within_20_quick_check`
  * `g3_compare_3_digit_numbers_quick_check`
* Ready resources: 88 / 88 working, 0 failures
* Ready worksheets: 84
* Ready Quick Checks: 4
* Product decision: worksheet promotion remains paused at 84; the resource count grew from 85 to 88 by adding 3 controlled Quick Checks, not by forcing worksheet filler
* Implementation summary:
  * Added `studentInstructions` support to the Quick Check PDF renderer
  * Fallback instruction is "Complete each question."
  * Existing Quick Check now uses metadata-driven student instructions: "Show each number as hundreds, tens, and ones."
  * Added exactly 3 new ready Quick Checks
  * Normal worksheet PDF rendering was not changed
  * No two-per-page Exit Tickets were started
  * No visual Quick Checks were added
  * No mixed-activity Quick Checks were added
* Verification passed:
  * Catalog JSON parse passed
  * `node --check renderers/quickCheckPdfRenderer.js` passed
  * `npm run audit:worksheets` passed
  * Ready result: 88 / 88 working, 0 failures
  * Generated result: 214 / 214 working, 0 failures
  * Partial result: 5 / 5 working, 0 failures
  * Planned result: 2 / 9 working, with 7 known/deferred `pattern_word_problems` failures
  * `/browse` route passed
  * `/api/worksheet-catalog?status=ready` returned 88 items and 4 Quick Checks
  * Detail and preview routes for all 3 new Quick Checks passed
  * PDF routes for all 4 Quick Checks passed as 200 `application/pdf`
  * All 4 Quick Checks rendered valid 2-page letter PDFs
  * Student instructions were correct and metadata-driven
  * Six real prompts appeared on each
  * Answer keys were readable
  * No clipping/overlap observed
  * Existing worksheet PDF regression check passed using `g1_addition_facts_within_20`
* Teacher QA result: all 3 new Quick Checks approved as public-ready
* Teacher QA batch-level judgment: the batch strengthens the Quick Check lane because it adds focused, printable, teacher-obvious resources with clear student instructions, teacher notes, and answer keys
* Curriculum Alignment result:
  * `g2_subtraction_within_20_quick_check`: public-ready with minor wording/framing caution
  * `g2_addition_within_20_quick_check`: public-ready with minor wording/framing caution
  * `g3_compare_3_digit_numbers_quick_check`: public-ready
* Wording update:
  * Grade 2 fact-check teacher notes now say add/subtract facts within 20
  * Grade 2 fact-check descriptions now say focused review after addition/subtraction practice
  * Grade 3 comparison teacher note now names comparing 3-digit numbers using >, <, or =
* Review outcome: the first controlled Quick Check batch has passed both review gates
* Lane-level caution: do not over-scale simple fact checks; future Quick Checks should gradually include representation, place value, word problems, and strategy-based skills where safe
* Next recommended task: decide whether to build another controlled Quick Check batch of 3-5 or run a read-only feasibility check for the first cut-apart Exit Ticket layout
* Continue deferring two-per-page Exit Tickets until compact Quick Checks prove stable through QA/alignment

Second controlled Quick Check batch completed:

* Commit: `db6bfa0 feat: add second quick check batch`
* Backup branch: `backup/milestone-6-second-quick-check-batch`
* New Quick Checks:
  * `g4_compare_fractions_quick_check`
  * `g2_missing_addends_within_20_quick_check`
  * `g4_pattern_rule_quick_check`
* Ready resources: 91 / 91 working, 0 failures
* Ready worksheets: 84
* Ready Quick Checks: 7
* Product decision: worksheet promotion remains paused at 84; the resource count grew from 88 to 91 by adding 3 controlled Quick Checks, not by forcing worksheet filler
* Implementation summary:
  * Added exactly 3 new ready Quick Checks
  * Added entries to both `data/worksheetCatalog.master.json` and `data/worksheetCatalog.generated.json`
  * Normal worksheet PDF rendering was not changed
  * No route changes were made
  * No docs were changed during implementation
  * No two-per-page Exit Tickets were started
  * No visual Quick Checks were added
  * No mixed-activity Quick Checks were added
* Verification passed:
  * Catalog JSON parse passed
  * `npm run audit:worksheets` passed
  * Ready result: 91 / 91 working, 0 failures
  * Generated result: 214 / 214 working, 0 failures
  * Partial result: 5 / 5 working, 0 failures
  * Planned result: 2 / 9 working, with known `pattern_word_problems` failures only
  * `/browse` route passed
  * `/api/worksheet-catalog?status=ready` returned 91 ready items and 7 Quick Checks
  * Detail routes for all 3 new Quick Checks passed
  * Preview routes for all 3 new Quick Checks passed
  * PDF routes for all 7 Quick Checks passed as 200 `application/pdf`
  * All 7 Quick Checks rendered valid 2-page letter PDFs
  * Existing worksheet PDF regression check passed using `g1_addition_facts_within_20`
* Minor risk:
  * `g4_compare_fractions_quick_check` may occasionally repeat an exact comparison with the current generator seed
  * This does not block implementation, but Teacher QA should review it
* Teacher QA result: approved the second controlled Quick Check batch with caution
* Teacher QA resource notes:
  * `g2_missing_addends_within_20_quick_check`: public-ready
  * `g4_compare_fractions_quick_check`: public-ready with minor caution
  * `g4_pattern_rule_quick_check`: public-ready with minor wording/framing caution
* Curriculum Alignment result: approved all 3 as public-ready, with wording/framing cautions for Grade 4 fractions and Grade 4 pattern rules
* Wording update:
  * Grade 4 fraction title, short title, domain, instructions, teacher note, and description now name comparing simple fractions using >, <, or =
  * Grade 2 missing-addend domain and teacher note now frame unknown parts in addition facts within 20
  * Grade 4 pattern-rule title, short title, domain, instructions, teacher note, and description now clarify identifying or using rules to continue or complete patterns
* Review outcome: the second controlled Quick Check batch has passed both review gates
* Lane-level caution: upper-grade Quick Checks need sharper topic labels and clear student instructions
* Duplicate/repeated item caution for fraction comparisons remains a future cleanup risk
* Next recommended task: decide whether to build one final small Quick Check batch of 2-3 resources or run a feasibility check for the first cut-apart Exit Ticket layout
* Continue deferring two-per-page Exit Tickets until compact Quick Checks prove stable through QA/alignment
