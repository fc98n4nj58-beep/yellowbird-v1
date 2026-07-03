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
