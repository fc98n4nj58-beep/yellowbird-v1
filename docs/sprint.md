# Current Sprint

Goal:
Make the existing 46 ready worksheets feel trustworthy, findable, printable, and teacher-facing for September launch.

Current Milestone:
Milestone 4 — Launch Readiness / Final Public Site QA is closed

Milestone Goal:
Final public site QA and launch-readiness polish are complete without expanding the catalog, redesigning the homepage, or starting content excellence.

Active Tasks:

[x] Public route/navigation launch polish

[x] Mobile/responsive/accessibility spot QA and small polish

[x] Deployment/package readiness audit and deployment basics

[x] Final launch-facing smoke QA

[ ] Final launch packaging/checklist

[ ] Optional README/deployment notes

[ ] Final backup branch

[ ] Decide whether to push/private remote backup

[ ] Final manual walkthrough

Backlog / Deferred:

[ ] Add graph visual support with a focused `bar_graph` plan

[ ] Add a true addition-jump number-line generator

[ ] Plan visual fraction support

[ ] Implement planned/deferred `pattern_word_problems`

[ ] Future phase: Content Excellence / Product Differentiation Pass after core launch readiness reaches 100%

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
- Launch-facing Browse -> Detail -> Preview/PDF path is stable
- Milestone 2 is effectively at closeout stage, with deferred worksheet types still explicitly out of scope

[x] Closed Milestone 2 — Publishing Engine
- Final manual browser QA passed for `/browse`
- Final manual browser QA passed for `/resource/worksheet/:id`
- Final manual browser QA passed for `/catalog-preview.html?id={id}`
- Final manual browser QA passed for `/api/catalog-pdf/{id}?disposition=inline`
- Generator Completion is stable
- Public Browse -> Detail -> Preview -> PDF flow is stable
- Ready / launch-facing worksheets remain 46 / 46 working, 0 failures
- Remaining raw failures are only planned/deferred `pattern_word_problems` entries and are not launch-facing
- Milestone 2 — Publishing Engine is closed

Known Partials / Existing Issues:

[ ] `g1_addition_on_number_line_to_20` still maps to `number_line_identify`
- This is not true addition-on-number-line modeling
- Leave partial until a real addition-jump number-line generator is created

[ ] Data/graph worksheets remain text-only and need future structured `bar_graph` visual support

[ ] Visual fraction work remains deferred until focused visual support is planned

[ ] Planned/deferred `pattern_word_problems` entries remain out of launch-facing scope

[x] Stale `public/resource.html` cleanup complete

[x] Duplicate `app.listen` cleanup complete

Post-Close Follow-Ups:

[ ] Add graph visual support with a focused `bar_graph` plan
[ ] Add a true addition-jump number-line generator
[ ] Plan visual fraction support
[ ] Implement planned/deferred `pattern_word_problems`
[ ] Review Grade 6 pattern naming/remapping if needed
[ ] Configure git identity if needed

[x] Post-close cleanup checkpoint
- Duplicate `app.listen` / server startup cleanup is complete
- Stale `public/resource.html` cleanup is complete
- Current active public flow remains `/browse` -> `/resource/worksheet/:id` -> `/catalog-preview.html?id={id}` -> `/api/catalog-pdf/{id}?disposition=inline`
- Legacy static `/resource/:slug` still works
- `/resource.html` now intentionally returns 404

---

## Milestone 3 — Launch Catalog Experience

[x] Task 1: Public label and catalog wording polish
- Launch catalog public labels were polished
- Graph/data wording no longer overpromises visual graph worksheets
- Internal/debug-style labels were replaced with teacher-facing labels
- Public labels now avoid `Relational Thinking`
- Public labels now avoid `Related Subtraction`
- Public labels now avoid `Number Line Identify`
- Public labels now avoid `Daily Review` for skip counting
- Public labels now avoid repeated `Representation / Representation`
- Graph/data worksheets are described as text-based/data interpretation until visual graph support is implemented
- Ready / launch-facing worksheets remain 46 / 46 working, 0 failures
- Manual browser QA passed for `/browse`
- Manual browser QA passed for `/resource/worksheet/g3_read_a_graph`
- Manual browser QA passed for `/resource/worksheet/g5_complete_graphs`
- Manual browser QA passed for `/resource/worksheet/g1_subtraction_facts_within_20`
- Manual browser QA passed for `/resource/worksheet/g2_skip_counting_by_2`
- Manual browser QA passed for `/resource/worksheet/g2_expanded_form_to_100`
- Manual browser QA passed for `/resource/worksheet/g3_fact_families_multiplication_division`
- Commit: `50fa561 feat: polish launch catalog labels`

[x] Task 2: Representative preview/PDF print-trust QA and fixes
- Representative worksheet print/preview QA found real print-trust blockers in text-heavy worksheets
- Main print blockers were long all-text prompts overlapping in rendered PDFs
- Text-heavy prompt overlap has been fixed
- Long all-text prompt worksheets now use safer layout behavior
- Visual-model worksheets remained healthy
- `g2_expanded_form_to_100` now matches its "to 100" title/range
- `g3_fact_families_multiplication_division` now generates multiplication/division fact families
- Ready / launch-facing worksheets remain 46 / 46 working, 0 failures
- Representative rendered PDF checks passed for:
  - `g1_addition_word_problems`
  - `g2_skip_counting_by_2`
  - `g3_read_a_graph`
  - `g5_interpret_graphs`
  - `g6_graph_interpretation`
  - `g3_fact_families_multiplication_division`
  - `g2_expanded_form_to_100`
  - `g3_multiplication_arrays`
  - `k_ten_frame_counting_to_10`
- Remaining follow-ups:
  - Graph visuals / `bar_graph` support remains deferred
  - Duplicate prompt variation can be improved later
  - Full 46-item manual print QA can happen after representative fixes
- Commit: `480dfb7 fix: prevent text-heavy worksheet prompt overlap`
- Commit: `ba55d90 fix: align catalog worksheet semantics`

[x] Task 3: Post-fix Browse -> Detail -> Preview/PDF trust QA
- Post-fix Browse -> Detail -> Preview/PDF trust QA passed with minor issues
- Checked representative flow:
  - `/browse`
  - `/resource/worksheet/g1_addition_word_problems`
  - `/resource/worksheet/g2_skip_counting_by_2`
  - `/resource/worksheet/g2_expanded_form_to_100`
  - `/resource/worksheet/g3_read_a_graph`
  - `/resource/worksheet/g3_fact_families_multiplication_division`
  - `/resource/worksheet/g5_interpret_graphs`
  - `/resource/worksheet/k_ten_frame_counting_to_10`
  - `/resource/worksheet/g3_multiplication_arrays`
- No prompt-overlap blockers remained in checked samples
- Public labels feel teacher-facing
- Graph/data wording remains honest/text-based until visual graph support ships
- Preview page now links back to `/browse` with "Back to Browse" instead of internal catalog wording
- Ready / launch-facing worksheets remain 46 / 46 working, 0 failures
- Remaining minor polish:
  - Duplicate prompt variation
  - Graph visuals / `bar_graph` support remains deferred
  - Full 46-item print QA later
- Commit: `e869f1b fix: point preview back link to browse`

[x] Task 4: Duplicate prompt audit and first suppression pass
- Duplicate prompt audit completed
- Duplicate prompt issue was confirmed as a minor teacher-trust issue, not a Milestone 3 blocker
- Skip counting duplicate suppression is complete
- Fact family duplicate suppression is complete
- Same-seed deterministic behavior was preserved
- Generator output shape was preserved
- Ready / launch-facing worksheets remain 46 / 46 working, 0 failures
- Multi-seed checks passed for:
  - `g2_skip_counting_by_2`
  - `g2_skip_counting_by_5`
  - `g2_skip_counting_by_10`
  - `g1_fact_families_within_20`
  - `g3_fact_families_multiplication_division`
- Graph/data duplicate prompts remain intentionally deferred with graph / `bar_graph` support because those generators have tiny fixed prompt pools
- Commit: `a691316 fix: reduce duplicate skip counting and fact family prompts`

[x] Task 5: Full ready worksheet QA re-audit and closeout readiness
- Full 46-item ready worksheet QA re-audit completed
- All 46 ready worksheets generate successfully
- All 46 PDFs render successfully
- Prior seven semantic range/content blockers are resolved
- Prior three answer-key overlap blockers are resolved
- Remaining blockers: none
- Milestone 3 is closeable from this QA pass
- Ready / launch-facing worksheets remain 46 / 46 working, 0 failures
- Safe deferrals:
  - Graph/data duplicate prompt pools remain deferred until graph / `bar_graph` support
  - Minor duplicate practice items in small-pool worksheets can be improved later
  - Text-only Kindergarten compare sets can be improved later with true visual set support
  - Graph/data worksheets remain intentionally text-based/data interpretation until visual graph support ships
- Recommended next step: final manual browser spot QA, then formally close Milestone 3 if it passes
- Commit: `3e7f320 fix: align catalog ranges for ready worksheets`
- Commit: `57715f6 fix: prevent answer key overlap`

[x] Close Milestone 3 — Launch Catalog Experience
- Milestone 3 — Launch Catalog Experience is closed
- Final manual browser spot QA passed
- Checked:
  - `/browse`
  - `/resource/worksheet/g1_missing_addends_within_20`
  - `/resource/worksheet/g2_standard_form_to_100`
  - `/resource/worksheet/k_compare_sets`
  - `/resource/worksheet/g3_multiplication_facts`
  - `/resource/worksheet/g5_multiplication_fact_review`
  - `/resource/worksheet/g3_read_a_graph`
  - `/resource/worksheet/k_ten_frame_counting_to_10`
- Pages work
- Details load
- Preview opens
- PDF opens
- No obvious overlap/clipping
- Answer keys are readable
- Labels feel teacher-facing
- Graph/data wording does not overpromise visuals
- Preview back link returns to Browse
- Browse -> Detail -> Preview -> PDF flow remains stable
- Ready / launch-facing worksheets remain 46 / 46 working, 0 failures
- Task 1 label/catalog polish complete
- Task 2 print-trust fixes complete
- Task 3 post-fix trust QA complete
- Task 4 duplicate prompt polish complete
- Task 5 full ready worksheet QA complete
- Remaining safe deferrals:
  - Graph / `bar_graph` visual support
  - Graph/data duplicate prompt pools
  - Minor duplicate practice items in small-pool worksheets
  - True visual Kindergarten compare sets
  - Future content excellence review after launch readiness reaches 100%
- Future direction: after core launch readiness reaches 100%, do a deeper content review / product excellence pass to push worksheet quality, pedagogy, display, and content presentation beyond basic launch stability

Future Phase:

[ ] Content Excellence / Product Differentiation Pass
- Begins only after core launch readiness reaches 100%, or if explicitly chosen
- Should not distract from current launch-readiness work
- Purpose: shift from stability/QA mode into deeper quality and differentiation work
- Goal: make Yellow Bird feel meaningfully better than a basic worksheet generator or generic resource catalog
- Task areas:
  - Worksheet quality review
  - Pedagogy and scaffolding
  - Differentiation
  - Visual and print presentation
  - Teacher-facing value
  - Catalog/display improvements
  - Content voice and brand
  - Product differentiation

---

## Milestone 4 — Launch Readiness / Final Public Site QA

[x] Task 1A: Public info route polish
- `/faq` serves the real FAQ page
- `/about` serves the About page
- `/contact` serves the Contact page
- Commit: `6e6551c feat: add public info routes`

[x] Task 1B: Launch nav QA
- Launch nav QA complete
- `/browse` confirmed as the safest launch-facing primary destination
- `/faq`, `/about`, and `/contact` confirmed route-safe after Task 1A
- `/curriculum`, `/worksheet`, and `/units` identified as direct-URL surfaces that should not be primary launch nav yet

[x] Task 1C: Public nav launch polish
- Public nav launch polish complete
- Primary launch nav now promotes:
  - Browse Library
  - FAQ
  - About
  - Contact
- `/curriculum`, `/worksheet`, and `/units` remain reachable by direct URL but are no longer primary launch nav
- Browse quick links to `/curriculum` and `/worksheet` were removed
- Browse -> Detail -> Preview -> PDF remains stable
- Ready / launch-facing worksheets remain 46 / 46 working, 0 failures
- Remaining launch-nav concern:
  - `/units` still has an internal secondary "Try Curriculum" link, but it is not in primary nav
- Commit: `a838a9a feat: simplify public launch navigation`

[x] Task 2: Internal/debug surface audit and treatment
- Internal/debug surface audit completed
- Task 2A internal/beta/noindex treatment completed
- Direct-only/internal pages now show internal/beta/QA treatment:
  - `/worksheet-catalog.html`
  - `/generated-worksheets.html`
  - `/curriculum`
  - `/worksheet`
  - `/units`
  - `/qa/smoke`
  - `/expectation.html`
- `noindex,nofollow` added to appropriate internal/beta static pages
- `/qa/smoke` no longer links to `/curriculum`, `/worksheet`, or `/units`
- `/units` no longer promotes the secondary "Try Curriculum" link
- Empty `/expectation.html` was replaced with an intentional internal placeholder
- Launch-facing pages were left untouched:
  - `/`
  - `/browse`
  - `/faq`
  - `/about`
  - `/contact`
  - Resource detail pages
  - Catalog preview
  - PDFs
- Launch nav remains Browse Library, FAQ, About, Contact
- Ready / launch-facing worksheets remain 46 / 46 working, 0 failures
- Remaining future production decision:
  - Decide later whether any direct-only internal/beta URLs should be guarded or 404'd in production
- Commit: `68ec8f2 chore: mark internal surfaces as beta`

[x] Task 3: Mobile/responsive/accessibility spot QA and polish
- Mobile/responsive/accessibility spot QA completed
- No mobile/accessibility launch blockers found
- Launch-facing pages checked:
  - `/`
  - `/browse`
  - `/resource/worksheet/g1_addition_facts_within_20`
  - `/catalog-preview.html?id=g1_addition_facts_within_20`
  - `/faq`
  - `/about`
  - `/contact`
- Task 3A small accessibility polish complete:
  - Semantic headings improved on FAQ/About/Contact
  - Browse now has a keyboard skip link to results
  - Browse results target is valid and keyboard reachable
  - Catalog preview action buttons have explicit focus-visible styling
- Launch nav remains Browse Library, FAQ, About, Contact
- Ready / launch-facing worksheets remain 46 / 46 working, 0 failures
- Safe deferrals:
  - Compact mobile nav treatment later
  - Deeper Browse keyboard ergonomics later
  - Preview JSON button polish later if desired
  - Contact copy polish later
- Commit: `34f995f feat: improve launch accessibility basics`

[x] Task 4: Deployment/package readiness audit and basics
- Deployment/package readiness audit completed
- Task 4A deployment basics completed
- `package.json` now has explicit:
  - `"main": "server.js"`
  - `"start": "node server.js"`
- `.env` is ignored
- `.env.example` exists with optional `PORT=3000` guidance and no secrets
- `/health` endpoint added and returns 200 JSON
- `/qa/smoke` now checks launch-facing routes only
- Stale unit/curriculum smoke calls were removed
- `npm start` verified using the explicit start script
- Final smoke checks passed for:
  - `/`
  - `/browse`
  - `/faq`
  - `/about`
  - `/contact`
  - `/health`
  - `/qa/smoke`
  - `/api/worksheet-catalog?status=ready`
  - `/resource/worksheet/g1_addition_facts_within_20`
  - `/catalog-preview.html?id=g1_addition_facts_within_20`
  - `/api/catalog-pdf/g1_addition_facts_within_20?disposition=inline`
- Catalog API returned 46 ready items
- Catalog PDF returned `application/pdf` and a valid 2-page PDF
- Ready / launch-facing worksheets remain 46 / 46 working, 0 failures
- Commit: `c488b47 chore: add launch deployment basics`

[x] Task 5: Final launch-facing smoke QA
- Final launch-facing smoke QA passed with no blockers
- `git status --short` showed only expected untracked future/internal files:
  - `engine/catalog/`
  - `engine/visuals/index`
  - `engine/visuals/renderVisual.js`
  - `public/styles/images/`
- `npm start` works with the explicit package script
- `npm run audit:worksheets` passed
- Ready / launch-facing worksheets remain 46 / 46 working, 0 failures
- Launch-facing routes passed:
  - `/`
  - `/browse`
  - `/faq`
  - `/about`
  - `/contact`
  - `/health`
  - `/qa/smoke`
  - `/api/worksheet-catalog?status=ready`
  - `/resource/worksheet/g1_addition_facts_within_20`
  - `/catalog-preview.html?id=g1_addition_facts_within_20`
  - `/api/catalog-pdf/g1_addition_facts_within_20?disposition=inline`
- Catalog API returned 46 ready items
- Catalog PDF returned valid `application/pdf`
- Public launch nav remains:
  - Browse Library
  - FAQ
  - About
  - Contact
- Direct-only internal/beta pages are marked `noindex,nofollow` and show internal/beta/QA messaging
- `/qa/smoke` checks launch-facing routes only

[x] Close Milestone 4 — Launch Readiness / Final Public Site QA
- Milestone 4 — Launch Readiness / Final Public Site QA is closed
- No launch blockers remain from final smoke QA
- Project is now approximately 95% launch-ready
- Completed Milestone 4 work:
  - Task 1 public route/navigation launch polish
  - Task 2 internal/debug surface treatment
  - Task 3 mobile/accessibility QA and polish
  - Task 4 deployment/package readiness
  - Task 5 final launch-facing smoke QA
- Safe deferrals:
  - Future decision on guarding or 404'ing direct-only internal/beta URLs in production
  - Graph visuals / `bar_graph` support
  - Visual Kindergarten compare sets
  - Graph/data prompt pools
  - Minor duplicate practice polish
  - Content Excellence / Product Differentiation Pass after core launch readiness reaches 100%
- Recommended next phase before Content Excellence:
  - Final launch packaging/checklist
  - Optional README/deployment notes
  - Final backup branch
  - Decide whether to push/private remote backup
  - Final manual walkthrough

## Milestone 6 — Content Expansion / Resource Depth

Guiding phrase: More fuel in the same airplane.

Status:

Milestone 6 is underway. Milestones 2–5 remain closed.

[x] Batch 1: Promote first clean content-expansion worksheet batch
- Promoted 6 generated worksheets to ready:
  - `grade1_addition_subtraction_word_problems_subtraction_word_problem`
  - `grade1_place_value_representation_base_ten_blocks`
  - `grade2_addition_subtraction_word_problems_subtraction_word_problem`
  - `grade4_fraction_equivalence_compare_fractions`
  - `grade5_multiplication_facts_missing_factor`
  - `grade6_multiplication_facts_missing_factor`
- Ready launch-facing worksheets increased from 46 to 52
- Ready result: 52 / 52 working, 0 failures
- Backup branch: `backup/milestone-6-batch-1`
- Accepted minor issues:
  - Word-problem sheets are printable but somewhat repetitive
  - Missing-factor sheets have minor duplicate-style practice
- Next recommended task: QA another small candidate batch or replace deferred candidates with safer generated entries
