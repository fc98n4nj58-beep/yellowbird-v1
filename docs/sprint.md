# Current Sprint

Goal:
Stabilize the worksheet publishing engine and complete the transition toward one production-ready workflow.

Current Milestone:
Milestone 2 — Publishing Engine

Milestone Goal:
Create one stable publishing engine where a worksheet is generated once, transformed into multiple outputs, and rendered consistently.

Active Tasks:

[ ] Decide whether to defer visual fraction generators or create a focused visual-support plan

[ ] Decide whether to defer graph visual support or create a focused `bar_graph` implementation plan

[ ] Continue migrating renderer constants into design tokens

[ ] Document known partial generator mappings

[ ] Continue worksheet quality improvements

Rules:

Maximum 5 active tasks.

No homepage redesign.
No accounts.
No subscriptions.
No payments.
No AI worksheet generation.
No lesson slides.

Engineering Principles:

* One airplane flying.
* Generate once. Transform many times.
* Prefer shared runtime over duplicate logic.
* Routes stay thin.
* Renderers render only.
* Design decisions belong in design tokens and layout specs.
* Make the smallest safe change.
* Prefer cleanup over new features.
* Every change should be reversible.

---

## May 25, 2026

[x] Create docs system
[x] Audit runtime architecture
[x] Identify duplicate worksheet systems
[x] Create shared catalog runtime
[x] Complete one catalog → worksheet → PDF path
[x] Fix fact fluency within-20 generation
[x] Allow teacher question count selection

Next:

[x] Reduce duplicate questions
[x] Improve generator variation
[x] Continue preview/PDF parity

---

## May 26, 2026

[x] Reduce duplicate questions
[x] Improve generator variation
[x] Continue preview/PDF parity

---

## May 27, 2026

[x] Continue preview/PDF parity

---

## Completed Since Restart

[x] Shared catalog runtime powers preview and PDF
[x] Catalog runtime generates the worksheet only once
[x] Layout is built from the generated worksheet instead of regenerating
[x] Preview and download now use identical generated worksheets
[x] Download button reuses preview PDF blob
[x] Preview/PDF parity established
[x] Duplicate suppression improved
[x] createSeededRandom() restored
[x] Seeded random active again
[x] Seeded random converted for tenFrame
[x] Seeded random converted for baseTenBlocks
[x] Seeded random converted for compareNumbers
[x] Seeded random converted for expandedForm
[x] Seeded random converted for factFamily
[x] Seeded random converted for numberLineIdentify
[x] Seeded random converted for numberWordMatch
[x] Seeded random converted for standardForm
[x] Seeded random converted for array
[x] Dead renderer code removed
[x] First PDF design tokens connected
[x] PDF Design Audit completed
[x] Dead Code Audit completed
[x] Architecture Audit completed
[x] Unused imports, dead helpers, unused CSS, and stale JS removed

---

## June 30, 2026

[x] Fixed Ten Frame catalog/recipe mismatch
- Kindergarten ten-frame catalog items now resolve to `ten_frame`
- `early_number_sense` recipe now includes `ten_frame`
- `grade1_addition_subtraction_facts_ten_frame` now uses `addition_strategies`
- Master and generated catalog data kept in sync
- No route changes
- No PDF renderer changes

[x] Fixed Number Line Identify range handling
- Catalog `generatorOptions` now pass through the catalog build flow
- `g1_number_line_identify_to_20` now declares `{ minA: 0, maxA: 20 }`
- `numberLineIdentify.js` respects explicit range options
- Default implicit number-line behavior remains conservative at 0–10
- No route changes
- No PDF renderer changes

[x] Converted data/graph generators to seeded randomness
- `readGraph.js`
- `completeGraph.js`
- `matchDataToGraph.js`
- `graphQuestions.js`
- Each now accepts `options = {}`
- Each now uses `options.random || Math.random`
- No recipe, catalog, route, or renderer changes
- JS syntax checks passed

[x] Completed data/graph worksheet output/layout audit
- Graph generators currently return `{ prompt, answer }` only
- No graph visual object is generated
- Graph worksheet types are missing from `worksheetTypeMap.json`
- Layout falls back to generic two-column equation practice
- Manual previews show overlapping prompts and no graph visuals
- Future fix should add structured `bar_graph` visual support

[x] Converted arithmetic-engine-based generators to seeded randomness
- `arithmeticEngine.js` now accepts injected `random`
- `equalGroups.js`, `missingAddend.js`, `missingFactor.js`, `relatedSubtraction.js`, `skipCounting.js`, and `wordProblems.js` pass `options.random`
- `equationMatch.js` uses injected random for its local operation choice
- Wrappers pass only `{ random: options.random }`
- Full generator options are intentionally not passed into `arithmeticEngine.js`
- No recipe, catalog, route, layout, or renderer changes
- JS syntax checks passed
- Deterministic runtime checks passed for same-seed and different-seed behavior

[x] Fixed pattern generator output shape
- `extendPattern.js` now returns one problem object per call
- `identifyPatternRule.js` now returns one problem object per call
- `missingValuePattern.js` now returns one problem object per call
- `functionTable.js` now returns one problem object per call
- Each now accepts `options = {}`
- Each now uses `options.random || Math.random`
- No recipe, catalog, route, layout, or renderer changes
- Runtime checks passed for object shape, no blank prompts, same-seed, and different-seed behavior

[x] Fixed text-only fraction generator output shape
- `matchEquivalentFractions.js` now returns one problem object per call
- `compareFractions.js` now returns one problem object per call
- Each now accepts `options = {}`
- Each now uses `options.random || Math.random`
- `compareFractions.js` denominator choices were adjusted to avoid an infinite loop with denominator 2
- No recipe, catalog, route, layout, or renderer changes
- Runtime checks passed for object shape, no blank prompts, same-seed, and different-seed behavior

[x] Fixed Grade 2 skip-counting step mappings
- `skipCounting.js` now respects `generatorOptions.step`
- `g2_skip_counting_by_2` now forces step 2
- `g2_skip_counting_by_5` now forces step 5
- `g2_skip_counting_by_10` now forces step 10
- `grade2.js` and `worksheetCatalog.master.json` were updated
- `node --check` passed for edited JS files
- Master catalog JSON parse passed
- Manual runtime generation confirmed correct steps for all three catalog IDs
- Existing catalog audit remains 282 / 312 working, with 30 known unrelated generator failures

[x] Completed text-only addition/subtraction word-problem generator family
- `addition_word_problem` generator added
- `subtraction_word_problem` generator added
- `missing_addend_word_problem` generator added
- `wordProblems.js` now provides seeded text-only generators for those activity types
- `engine/problemGenerators/index.js` registers the three activity types
- Output shape is `{ prompt, answer }`
- Wording avoids multiplication/equal-groups language
- Answers are non-negative
- Seeded same-seed check passed
- `node --check` passed for edited JS files
- Manual runtime tests passed for `g1_addition_word_problems`
- Manual runtime tests passed for `g2_addition_word_problems_within_100`
- Manual runtime tests passed for `grade1_addition_subtraction_word_problems_addition_word_problem`
- Manual runtime tests passed for `grade1_addition_subtraction_word_problems_subtraction_word_problem`
- Manual runtime tests passed for `grade1_addition_subtraction_word_problems_missing_addend_word_problem`
- Catalog audit improved from 282 / 312 working to 305 / 312 working
- 7 hard generator failures remain, all `pattern_word_problems`

[x] Deferred generated pattern word-problem catalog entries from launch-ready status
- `grade1_patterning_and_algebra_pattern_word_problems` marked `planned`
- `grade2_patterning_and_algebra_pattern_word_problems` marked `planned`
- `grade3_patterning_and_algebra_pattern_word_problems` marked `planned`
- `grade4_patterning_and_algebra_pattern_word_problems` marked `planned`
- `grade5_patterning_and_algebra_pattern_word_problems` marked `planned`
- `grade6_patterning_and_algebra_pattern_word_problems` marked `planned`
- `kindergarten_patterning_and_algebra_pattern_word_problems` marked `planned`
- Generated and master catalog JSON were kept in sync
- `generateWorksheetCatalog.js` now preserves this planned/deferred status on regeneration
- Ready-status launch surface has 46 entries and 0 runtime generation failures
- Raw full catalog audit still reports 7 known `pattern_word_problems` generator failures

[x] Improved catalog audit reporting by catalog status
- `scripts/auditWorksheetCatalog.js` now preserves the full raw audit across all 312 catalog entries
- Audit now reports by catalog status
- Added `Ready / Launch-Facing Result` section
- Added `Planned / Deferred Result` section
- Failures now include catalog status
- Current full raw audit is 305 / 312 working
- Ready / launch-facing result is 46 / 46 working with 0 failures
- Planned / deferred result is 2 / 9 working with 7 failures
- All 7 remaining failures are planned `pattern_word_problems` entries
- `node --check scripts/auditWorksheetCatalog.js` passed
- Catalog audit ran successfully
- Note: `scripts/auditWorksheetCatalog.js` should be tracked in git if it is intended as a project tool

[x] Final Milestone 2 catalog audit health check
- `node --check scripts/auditWorksheetCatalog.js` passed
- `node scripts/auditWorksheetCatalog.js` ran successfully
- Full raw catalog audit: 305 / 312 working
- Ready / launch-facing result: 46 / 46 working, 0 failures
- Generated: 252 / 252 working, 0 failures
- Partial: 5 / 5 working, 0 failures
- Planned / deferred: 2 / 9 working, 7 failures
- All 7 remaining failures are planned `pattern_word_problems` entries
- Ready launch-facing worksheet runtime has 0 missing skill definitions
- Ready launch-facing worksheet runtime has 0 generator failures
- Ready launch-facing worksheet runtime has 0 other failures
- Milestone 2 Generator Completion was functionally stable pending manual preview/PDF spot checks
- Remaining untracked files are future/unused/placeholder material: `engine/catalog/`, `engine/visuals/index`, `engine/visuals/renderVisual.js`, `public/styles/images/`

[x] Closed Milestone 2 Generator Completion after targeted QA cleanup
- Manual / targeted QA found a semantic mismatch in `g1_addition_facts_within_20`
- Before: master catalog used `skillKey: "addition_strategies"` and generated ten-frame prompts
- After: master catalog uses `skillKey: "addition_subtraction_facts"` and generates actual addition facts within 20
- Fix was catalog-only in `data/worksheetCatalog.master.json`
- No route changes
- No renderer changes
- Preview/PDF parity remains preserved through the shared catalog runtime
- Seeded deterministic behavior remains intact: same seed output is identical, different seed changes output
- `node --check scripts/auditWorksheetCatalog.js` passed
- `npm run audit:worksheets` passed
- Ready / launch-facing result remains 46 / 46 working, 0 failures
- Missing skill definitions: 0
- Generator failures: 0
- Other failures: 0
- Remaining raw failures are only planned/deferred `pattern_word_problems` entries and are not launch-facing
- Milestone 2 Generator Completion is stable after manual / targeted QA

Known Partials / Existing Issues:

[ ] `g1_addition_on_number_line_to_20` still maps to `number_line_identify`
- This is not true addition-on-number-line modeling
- Leave partial until a real addition-jump number-line generator is created

[ ] Data/graph worksheets remain text-only and need future structured `bar_graph` visual support

[ ] `shadeFractionModels.js` and `fractionNumberLine.js` still have the array-return issue and imply visual models that are not implemented yet

[ ] Planned/deferred `pattern_word_problems` entries remain out of launch-facing scope

[ ] Broader `patterning_and_algebra` catalog/recipe entries that use skill-like activity types may still be mapping concerns

---

## July 1, 2026

[x] Stabilized public Browse -> Detail -> Preview/PDF launch flow at the code/service level
- `/browse` now loads 46 ready worksheet catalog items from `/api/worksheet-catalog?status=ready`
- Browse cards use simplified, teacher-facing worksheet metadata
- Public Browse links to worksheet detail pages at `/resource/worksheet/:id`
- Detail pages link to stable preview routes at `/catalog-preview.html?id={id}`
- Detail pages link to stable PDF routes at `/api/catalog-pdf/{id}?disposition=inline`
- Missing or non-ready worksheet IDs return 404 from the public worksheet detail route
- Internal `/worksheet-catalog.html` remains available as an internal/debug page but is no longer promoted from public Browse
- Browse filters now have proper label associations
- Light focus-visible accessibility polish was added
- No renderer changes
- No catalog runtime changes
- No PDF route changes
- `node --check routes/libraryRoutes.js` passed
- `npm run audit:worksheets` passed
- Ready / launch-facing result remains 46 / 46 working, 0 failures
- Missing skill definitions: 0
- Generator failures for ready items: 0
- Other failures: 0
- Remaining raw failures are only planned/deferred `pattern_word_problems` entries and are not launch-facing
- Launch-facing Browse -> Detail -> Preview/PDF path is stable pending final manual browser QA
- Milestone 2 is effectively at closeout stage, with deferred worksheet types still explicitly out of scope

Known Partials / Existing Issues:

[ ] `g1_addition_on_number_line_to_20` still maps to `number_line_identify`
- This is not true addition-on-number-line modeling
- Leave partial until a real addition-jump number-line generator is created

[ ] Data/graph worksheets remain text-only and need future structured `bar_graph` visual support

[ ] Visual fraction work remains deferred until focused visual support is planned

[ ] Planned/deferred `pattern_word_problems` entries remain out of launch-facing scope

[ ] Stale `public/resource.html` remains a cleanup target

[ ] `server.js` appears to contain duplicate `app.listen` startup calls and should be reviewed in a focused cleanup

Next:

[ ] Decide whether to defer visual fraction generators or create a focused visual-support plan
[ ] Decide whether to defer graph visual support or create a focused `bar_graph` implementation plan
[ ] Continue migrating renderer constants into design tokens
[ ] Document known partial generator mappings
[ ] Continue worksheet quality improvements
