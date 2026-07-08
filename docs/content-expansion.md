# Content Expansion Control

## Purpose

This document is the control panel for Milestone 6 content expansion.

Milestone 6 should add more launch-facing worksheet depth without opening new product surfaces or destabilizing the existing catalog/runtime. The guiding phrase is:

More fuel in the same airplane.

## Current Status

* Milestone 6 — Content Expansion / Resource Depth is underway.
* Ready resources: 96 / 96 working
* Ready worksheets: 84
* Ready Quick Checks: 9
* Ready Exit Tickets: 3
* Ready failures: 0
* Milestone 6 gain so far: +41 ready resources
* Milestone 6 completion estimate: around 66%
* Patterning & Algebra ready coverage: 9 worksheets
* Target direction: grow toward roughly 100 ready resources in quality-controlled batches
* Worksheet promotion is paused at 84 ready worksheets after the final micro-scan found no worthy 85th worksheet candidate
* Product decision: 84 strong worksheets is better than 85 with filler
* Resource count grew from 91 to 93 by adding 2 final Quick Checks, not by forcing worksheet filler
* Recommended target before external testing: keep 84 ready worksheets as the worksheet-depth checkpoint; Quick Check expansion is now paused at 9, and the Exit Ticket lane is in cautious continuation after the first proof-of-concept review and one tiny controlled batch
* Exit Ticket / Quick Check control doc: `docs/exit-tickets-quick-checks.md`

Expected untracked files remain visible and documented:

* `engine/catalog/`
* `engine/visuals/index`
* `engine/visuals/renderVisual.js`
* `public/styles/images/`

## Batch History

### Batch 1

* Result: +6 ready worksheets
* Backup branch: `backup/milestone-6-batch-1`
* Docs branch: `backup/milestone-6-batch-1-docs`
* Accepted minor issues:
  * Word-problem sheets are printable but somewhat repetitive
  * Missing-factor sheets have minor duplicate-style practice

### Batch 2

* Result: +8 ready worksheets
* Backup branch: `backup/milestone-6-batch-2`
* Accepted minor issues:
  * Equivalent-fraction prompts may be repetitive
  * Grade 5/6 equal-groups sheets may read as review practice

### Batch 3

* Result: +4 ready worksheets
* Backup branch: `backup/milestone-6-batch-3`
* Ready launch-facing worksheets increased from 60 to 64
* Ready result: 64 / 64 working, 0 failures
* Promoted:
  * `grade3_fraction_equivalence_match_equivalent_fractions`
  * `grade3_place_value_representation_base_ten_blocks`
  * `grade3_place_value_representation_expanded_form`
  * `grade3_place_value_representation_standard_form`
* Not promoted:
  * `grade4_place_value_representation_expanded_form`
  * `grade4_place_value_representation_standard_form`
* Accepted minor issue:
  * Equivalent-fraction prompts may be repetitive
* Quality decision:
  * Did not promote the Grade 4 stretch candidates because quality bar matters more than batch size

### Batch 4

* Result: +6 ready worksheets
* Backup branch: `backup/milestone-6-batch-4`
* Ready launch-facing worksheets increased from 64 to 70
* Ready result: 70 / 70 working, 0 failures
* Patterning & Algebra ready count: 6
* Promoted:
  * `grade3_patterning_and_algebra_extend_pattern`
  * `grade3_patterning_and_algebra_identify_pattern_rule`
  * `grade3_patterning_and_algebra_missing_value_pattern`
  * `grade4_patterning_and_algebra_extend_pattern`
  * `grade4_patterning_and_algebra_identify_pattern_rule`
  * `grade4_patterning_and_algebra_missing_value_pattern`
* Not promoted:
  * `grade3_patterning_and_algebra_function_table`
  * `grade4_patterning_and_algebra_function_table`
  * Grade 5/6 patterning candidates
  * `pattern_word_problems`
  * `g6_pattern_rules`
  * `g6_input_output_tables`
  * Grade 4 place-value stretch candidates
* Accepted minor issue:
  * Duplicate-style pattern prompts may appear
* Quality decision:
  * Promoted Grade 3-4 patterning only because it filled a true domain gap
  * Did not promote Grade 5/6 or function-table patterning candidates because they were too weak or mismatched

### Batch 5

* Result: +2 ready worksheets
* Commit: `5e1b4f7 content: promote fifth milestone 6 worksheet batch`
* Ready launch-facing worksheets increased from 70 to 72
* Ready result: 72 / 72 working, 0 failures
* Promoted:
  * `grade3_multiplication_facts_word_problems`
  * `grade4_multiplication_facts_word_problems`
* Not promoted:
  * `grade5_multiplication_facts_word_problems`
  * `grade6_multiplication_facts_word_problems`
* Routing fix:
  * Multiplication word-problem routing is fixed by `f2168f1 fix: route preferred word problem activities`
  * Old issue: `multiplication_facts` `word_problems` candidates rendered PDFs with 0 problems
  * Root cause: `pickActivitiesFromRecipe` switched preferred activity `word_problems` into heuristic mode `word_problem_focus`, but `multiplication_facts.json` did not include that variant, causing an empty activity list
  * New status: Grade 3-4 equal-groups multiplication word-problem resources are ready; upper-grade versions remain deferred for review/intervention framing or richer complexity
* Verification:
  * JSON parse passed for both catalog files
  * `npm run audit:worksheets` passed
  * `/api/worksheet-catalog?status=ready` returned 72 items
  * Grade 3 and Grade 4 resource detail, preview, and PDF routes returned 200
  * Both PDFs rendered valid 3-page PDFs with 12 problems and 12 answers
  * Answer keys were readable
  * No clipping or overlap observed
* Accepted minor issue:
  * One duplicate prompt appeared but does not block public readiness
* Quality decision:
  * Grade 3 is ready as equal-groups multiplication word-problem practice
  * Grade 4 is ready as multiplication word-problem review/practice
  * Grade 5-6 remain deferred/generated because the equal-groups problems are too basic for public-facing upper-grade depth unless later reframed as review/intervention or upgraded with richer complexity

### Batch 6

* Result: +5 ready worksheets
* Commit: `5f1eb4c content: promote sixth milestone 6 worksheet batch`
* Ready launch-facing worksheets increased from 72 to 77
* Ready result: 77 / 77 working, 0 failures
* Promoted:
  * `grade2_patterning_and_algebra_missing_value_pattern`
  * `grade2_patterning_and_algebra_extend_pattern`
  * `grade2_patterning_and_algebra_identify_pattern_rule`
  * `grade2_addition_subtraction_facts_missing_addend`
  * `grade2_addition_subtraction_facts_related_subtraction`
* Not promoted:
  * `grade2_addition_subtraction_facts_fact_fluency`
* Verification:
  * JSON parse passed for both catalog files
  * `npm run audit:worksheets` passed
  * Ready worksheets were 77 / 77 working, 0 failures
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
* Accepted minor issues:
  * Patterning sheets may contain minor duplicate-style prompts
* Quality decision:
  * Grade 2 Patterning & Algebra sheets are ready as practice/review resources with minor framing caution
  * Grade 2 Addition/Subtraction relationship sheets are ready as clean fact relationship practice
  * The Grade 2 fact fluency candidate remains backup-only because it may duplicate existing Grade 2 fluency-style resources and could feel like count-padding unless it fills a specific gap
* Framing:
  * Patterning resources should be described as pattern practice, not deep algebra or assessment
  * Addition/subtraction resources should be described as fact relationship practice, not full fluency mastery or assessment
  * All five should be framed as skill practice connected to curriculum, not full expectation coverage

### Batch 7

* Result: +2 ready worksheets
* Commit: `bb866a9 content: promote seventh milestone 6 worksheet batch`
* Ready launch-facing worksheets increased from 77 to 79
* Ready result: 79 / 79 working, 0 failures
* Promoted:
  * `grade3_place_value_representation_number_word_match`
  * `grade2_multiplication_facts_arrays`
* Not promoted:
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
* Verification:
  * JSON parse passed for both catalog files
  * `npm run audit:worksheets` passed
  * Ready worksheets were 79 / 79 working, 0 failures
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
* Accepted minor issues:
  * Grade 3 number-word match has one duplicate number
  * Grade 3 number-word wording omits "and" but remains readable
  * Grade 2 arrays repeat prompt text, but visuals vary
* Quality decision:
  * Grade 3 number-word match is ready as number-word / standard-form matching review or independent practice
  * Grade 2 arrays is ready as early visual multiplication thinking using arrays as equal groups
  * Grade 1 patterning candidates remain deferred/revision-needed because Teacher QA found the number range and rule complexity may be too high for broad public-facing Grade 1 use
* Framing:
  * Avoid claims of assessment, mastery, full expectation coverage, deep problem-solving, or complete curriculum coverage
  * Grade 2 arrays should not be framed as multiplication fact fluency, word problems, or full multiplication mastery

### Batch 8

* Result: +2 ready worksheets
* Commit: `c86a9d8 content: promote eighth milestone 6 worksheet batch`
* Ready launch-facing worksheets increased from 79 to 81
* Ready result: 81 / 81 working, 0 failures
* Promoted:
  * `grade2_addition_subtraction_facts_fact_family`
  * `grade2_addition_subtraction_word_problems_missing_addend_word_problem`
* Not promoted:
  * `grade2_fraction_equivalence_compare_fractions`
  * `grade2_fraction_equivalence_match_equivalent_fractions`
* Verification:
  * JSON parse passed for both catalog files
  * `npm run audit:worksheets` passed
  * Generated worksheets were 217 / 217 working
  * Partial worksheets were 5 / 5 working
  * Planned failures remained known/deferred `pattern_word_problems`
* Accepted minor issue:
  * Missing-addend word problems repeat a "cans" scenario and may feel somewhat generated, but remain useful as short practice
* Quality decision:
  * Grade 2 fact families are ready as addition/subtraction relationship practice
  * Grade 2 missing-addend word problems are ready as missing-addend story problem practice
  * Grade 2 fraction candidates remain deferred/revision-needed because Curriculum Alignment found weak Grade 2 alignment unless revised or reframed
  * The compare-fractions resource may need visual, simple, guided, or enrichment framing
  * The match-equivalent-fractions resource is likely too advanced if symbolic and should be deferred or substantially reframed away from formal equivalent fractions
* Framing:
  * Fact families should be framed as related addition/subtraction facts for independent practice or review
  * Missing-addend word problems should be framed as story problem practice after students have learned to represent unknowns with equations, drawings, or counting strategies
  * Avoid claims of assessment, mastery, full expectation coverage, deep problem-solving, or complete curriculum coverage

### Batch 9

* Result: +2 ready worksheets
* Commit: `1b52562 content: promote ninth milestone 6 worksheet batch`
* Ready launch-facing worksheets increased from 81 to 83
* Ready result: 83 / 83 working, 0 failures
* Promoted:
  * `grade3_multiplication_facts_equal_groups`
  * `grade4_multiplication_facts_equal_groups`
* Not promoted:
  * Data/graphing candidates
  * Grade 5/6 place-value candidates
  * Title/content mismatch resources
  * 0-problem resources
* Verification:
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
* Accepted minor issue:
  * One exact duplicate prompt appears in each equal-groups worksheet and remains non-blocking
* Quality decision:
  * Grade 3 equal groups is ready as multiplication practice or review after concrete modelling with drawings, arrays, counters, or manipulatives
  * Grade 4 equal groups is ready only as foundational multiplication review/support, intervention, warm-up, or conceptual reinforcement
  * Grade 4 equal groups must not be framed as core Grade 4 multiplication depth or Grade 4 multiplication mastery
* Framing:
  * Avoid claims of assessment, mastery, full expectation coverage, deep problem-solving, multi-step multiplication, multi-digit multiplication, rich inquiry, or complete curriculum coverage

### Batch 10

* Result: +1 ready worksheet
* Commit: `eabb16a content: promote tenth milestone 6 worksheet batch`
* Ready launch-facing worksheets increased from 83 to 84
* Ready result: 84 / 84 working, 0 failures
* Promoted:
  * `grade1_addition_subtraction_word_problems_missing_addend_word_problem`
* Not promoted:
  * `grade1_addition_subtraction_facts_ten_frame`
  * `grade1_addition_subtraction_facts_fact_family`
  * `grade1_addition_subtraction_word_problems_addition_word_problem`
  * `grade1_addition_subtraction_facts_related_subtraction`
  * `grade2_addition_subtraction_word_problems_addition_word_problem`
  * `grade3_multiplication_facts_missing_factor`
  * `grade2_multiplication_facts_word_problems`
* Verification:
  * JSON parse passed for both catalog files
  * `npm run audit:worksheets` passed
  * Ready worksheets were 84 / 84 working, 0 failures
  * Generated worksheets were 214 / 214 working
  * Partial worksheets were 5 / 5 working
  * Planned failures remained known/deferred `pattern_word_problems`
  * `/api/worksheet-catalog?status=ready` returned 84 items
  * Detail, preview, and PDF routes returned 200
  * PDF route returned 200 `application/pdf`
  * The worksheet rendered a valid 3-page PDF with 12 problems and 12 answers
  * Answer key was readable
  * No clipping or overlap observed
* Accepted minor issues:
  * Repeated food-drive/cans scenario
  * Generic subtitle text
* Quality decision:
  * Grade 1 missing-addend story problems within 20 are ready as meaningful addition/subtraction relationship practice
  * Best used after concrete modelling with drawings, counters, ten frames, or number lines
  * Best framed as supported practice, review, small-group work, intervention, or homework with adult support
  * Do not frame as first-introduction work for all Grade 1 students
* Framing:
  * Avoid claims of assessment, mastery, independent equation solving, full expectation coverage, deep algebraic reasoning, advanced problem-solving, or complete curriculum coverage

### Final Worksheet Micro-Scan

* Result: no worksheet promoted
* Ready launch-facing worksheets remain 84 / 84 working, 0 failures
* Audit passed:
  * Ready worksheets were 84 / 84 working, 0 failures
  * Generated worksheets were 214 / 214 working, 0 failures
  * Partial worksheets were 5 / 5 working, 0 failures
  * Planned worksheets were 2 / 9 working, with 7 known/deferred `pattern_word_problems` failures
* Decision:
  * Do not force an 85th worksheet
  * Pause worksheet promotion at 84 ready worksheets because the remaining generated pool is thinning
  * The best technical near-candidates felt like count-padding or needed fixes/reframing
  * 84 strong worksheets is better than 85 with filler
* Near-candidates reviewed but not promoted:
  * `grade3_multiplication_facts_arrays`: valid 2-page PDF with 10 visual problems and answer key, but deferred because it duplicates existing ready Grade 3 array/multiplication coverage too closely
  * `grade2_multiplication_facts_equal_groups`: valid 3-page PDF with 12 problems and 12 answers, but deferred because it lacks visual support, includes products like 90/60, has one exact duplicate, and feels too abstract/advanced for broad Grade 2 public use without stronger framing or visual support
  * `grade3_addition_subtraction_word_problems_subtraction_word_problem`: generates real problems, but within-20 subtraction is too shallow for Grade 3 public-facing depth
  * `grade4_patterning_and_algebra_function_table`: generates, but function-table patterning remains weak/mismatched compared with the promoted Grade 3-4 patterning set

## Future / Fix-Needed Lanes

These remain promising only after focused fixes, reframing, or richer content support:

* Grade 2 equal groups: needs visual support or smaller friendlier factors
* Grade 3 arrays: only useful if differentiated from existing array worksheet coverage
* Grade 3-4 addition/subtraction word problems: need richer grade-level numbers or review/intervention framing
* Grade 5-6 multiplication word problems: remain too basic unless reframed as review/intervention or upgraded
* `pattern_word_problems`: still deferred until generator support exists
* `fraction_word_problems`: remain fix-needed if still producing 0 problems
* Data/graphing: needs larger prompt pools and/or stronger visual support
* Title/content mismatch families should be fixed before promotion

## Quality Bar

A worksheet can be promoted only if:

* Catalog entry exists
* Current status is non-ready
* Generates successfully
* Renders a valid PDF
* Has real problems, not blank output
* Has an answer key that is present and readable
* Title/content semantics match grade, strand, and activity
* No obvious clipping or overlap appears
* Grade level is appropriate enough for public library use
* Any repetition is acceptable as practice, not confusing
* No known blocker pattern appears

## Known Blocker Patterns / Avoid List

Avoid these unless explicitly doing a focused fix:

* Kindergarten age/range mismatch
* Grade 1 patterning candidates with number ranges or rule complexity that may be too high for broad public-facing Grade 1 use
* `number_line_identify` title/content mismatch
* `equation_match` title/content mismatch
* Upper-grade multiplication word-problem sheets that are too basic unless framed as review/intervention or upgraded with richer complexity
* `compare_numbers` showing unrelated place-value tasks
* `shade_fraction_models` blank/unsupported output
* `fraction_number_line` blank/unsupported output
* `pattern_word_problems` missing generator
* Graph visuals / `bar_graph`
* Weak upper-grade skip-counting or array sheets
* Generated worksheets that are technically working but pedagogically too weak

## Preferred Next Candidate Pools

Prioritize:

* Grade 5 and Grade 6 depth
* Fractions that are printable and semantically aligned
* Multiplication/division practice that generates real problems
* Grade 3–4 content if stronger than upper-grade options
* Place value only if age-appropriate and semantically aligned

Avoid Kindergarten unless the content is clearly age-appropriate.

## Standard Batch Workflow

1. Candidate search
2. Read-only QA
3. Promote approved IDs only
4. JSON parse check
5. Run `npm run audit:worksheets`
6. Render PDFs for all promoted candidates
7. Spot check Browse/detail/preview/PDF for 2–3 promoted items
8. Commit
9. Push
10. Create backup branch
11. Update docs

## Next Recommended Task

Decide whether to build another controlled Quick Check batch of 3-5 or run a read-only feasibility check for the first cut-apart Exit Ticket layout.

Read-only feasibility decision: feasible with a small new lane. Best framing is same catalog engine, new resource family. Do not treat these as just more worksheets.

First Quick Check proof of concept implemented:

* Commit: `5442440 feat: add first quick check resource`
* Backup branch: `backup/milestone-6-first-quick-check`
* ID: `g3_place_value_hundreds_tens_ones_quick_check`
* Title: Hundreds, Tens, and Ones Quick Check
* Grade: 3
* Resource type: `quick_check`
* Format label: Quick Check
* Skill: represent 3-digit numbers using hundreds, tens, and ones
* Use case: short formative skill check, review, small-group check, or homeschool check
* Implementation:
  * Added one ready Quick Check catalog item
  * Added compact Quick Check PDF rendering through `renderers/quickCheckPdfRenderer.js`
  * Kept existing `renderWorksheetPDF` behavior untouched for normal worksheets
  * Added narrow route/runtime support for `resourceType: quick_check`
  * Added minimal metadata support for `resourceType`, `formatLabel`, `teacherNote`, `useCase`, `prepLevel`, and `formativeUse`
  * Lightly updated Browse, detail, and preview labels so the item presents as a Quick Check
  * Added opt-in `expandedForm` answer style for hundreds/tens/ones prompts
* Verification:
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
* Review:
  * Teacher QA approved the first Quick Check as public-ready
  * Curriculum Alignment approved it with minor wording/framing caution
  * Teacher note now frames the resource for use after a place-value lesson
  * Description now frames it as focused place-value review
  * Final positioning: A Grade 3 quick formative check for representing 3-digit numbers using hundreds, tens, and ones. Best used after place-value instruction as a short review or progress check, not as a full assessment or mastery measure.
  * Framing guardrail: do not describe it as a test, diagnostic, mastery check, summative assessment, or full expectation assessment

First controlled Quick Check batch implemented:

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
* Implementation:
  * Added `studentInstructions` support to the Quick Check PDF renderer
  * Fallback instruction is "Complete each question."
  * Existing Quick Check now uses metadata-driven student instructions: "Show each number as hundreds, tens, and ones."
  * Added exactly 3 new ready Quick Checks
  * Normal worksheet PDF rendering was not changed
  * No two-per-page Exit Tickets were started
  * No visual Quick Checks were added
  * No mixed-activity Quick Checks were added
* Verification:
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
* Review:
  * Teacher QA approved all 3 new Quick Checks as public-ready
  * Teacher QA found the batch strengthens the lane because it adds focused, printable, teacher-obvious resources with clear student instructions, teacher notes, and answer keys
  * Curriculum Alignment approved all 3 as public-ready
  * Grade 2 fact checks were approved with minor wording/framing caution
  * Grade 3 compare numbers was approved as public-ready
  * Catalog wording was tightened for Grade 2 fact-check notes/descriptions and Grade 3 comparison symbols
  * Lane-level caution: do not over-scale simple fact checks; future Quick Checks should gradually include representation, place value, word problems, and strategy-based skills where safe

Second controlled Quick Check batch implemented:

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
* Implementation:
  * Added exactly 3 new ready Quick Checks
  * Added entries to both `data/worksheetCatalog.master.json` and `data/worksheetCatalog.generated.json`
  * Normal worksheet PDF rendering was not changed
  * No route changes were made
  * No two-per-page Exit Tickets were started
  * No visual Quick Checks were added
  * No mixed-activity Quick Checks were added
* Verification:
  * Catalog JSON parse passed
  * `npm run audit:worksheets` passed
  * Ready result: 91 / 91 working, 0 failures
  * Generated result: 214 / 214 working, 0 failures
  * Partial result: 5 / 5 working, 0 failures
  * Planned result: 2 / 9 working, with known/deferred `pattern_word_problems` failures only
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
* Review:
  * Teacher QA approved the second controlled Quick Check batch with caution
  * `g2_missing_addends_within_20_quick_check`: public-ready
  * `g4_compare_fractions_quick_check`: public-ready with minor caution
  * `g4_pattern_rule_quick_check`: public-ready with minor wording/framing caution
  * Curriculum Alignment approved all 3 as public-ready
  * Curriculum Alignment noted wording/framing cautions for Grade 4 fractions and Grade 4 pattern rules
  * Catalog wording was tightened for Grade 4 fraction labels/instructions, Grade 2 missing-addend unknown-part framing, and Grade 4 pattern-rule labels/instructions
  * The second controlled Quick Check batch has passed both review gates
  * Lane-level caution: upper-grade Quick Checks need sharper topic labels and clear student instructions
  * The duplicate/repeated item caution for fraction comparisons remains a future cleanup risk
* Next recommended step:
  * Decide whether to build one final small Quick Check batch of 2-3 resources or run a feasibility check for the first cut-apart Exit Ticket layout

Final small Quick Check batch implemented:

* Commit: `6b08ca2 feat: add final quick check batch`
* Backup branch: `backup/milestone-6-final-quick-check-batch`
* New Quick Checks:
  * `g3_expanded_form_to_standard_form_quick_check`
  * `g4_multiplication_word_problem_quick_check`
* Ready resources: 93 / 93 working, 0 failures
* Ready worksheets: 84
* Ready Quick Checks: 9
* Product decision: this was the final small Quick Check batch before pausing Quick Check expansion and moving to Exit Ticket layout feasibility after review gates
* Implementation:
  * Added exactly 2 new ready Quick Checks
  * Added entries to both `data/worksheetCatalog.master.json` and `data/worksheetCatalog.generated.json`
  * Normal worksheet PDF rendering was not changed
  * No route changes were made
  * No generator changes were made
  * No worksheet behavior changed
  * No docs were changed during implementation
  * No Exit Ticket work was started
* Verification:
  * Catalog JSON parse passed
  * `npm run audit:worksheets` passed
  * Ready result: 93 / 93 working, 0 failures
  * Generated result: 214 / 214 working, 0 failures
  * Partial result: 5 / 5 working, 0 failures
  * Planned result: known/deferred `pattern_word_problems` failures only
  * `/browse` route passed
  * `/api/worksheet-catalog?status=ready` returned 93 ready items and 9 Quick Checks
  * Detail and preview routes for both new Quick Checks passed
  * PDF routes for all 9 Quick Checks passed as 200 `application/pdf`
  * All 9 Quick Checks rendered valid 2-page letter PDFs
  * Existing worksheet PDF regression check passed using `g1_addition_facts_within_20`
* Minor limitation:
  * `g4_multiplication_word_problem_quick_check` is best framed as Grade 4 review/practice
  * Sampled prompts were real and distinct, though some answers repeated
  * Do not frame it as deep problem-solving, mastery, assessment, diagnostic, or full Grade 4 multiplication coverage
* Review result:
  * Teacher QA approved the final small Quick Check batch
  * Curriculum Alignment approved the final small Quick Check batch
  * `g3_expanded_form_to_standard_form_quick_check` is public-ready
  * `g4_multiplication_word_problem_quick_check` is public-ready as equal-groups review/practice with wording/framing caution
  * Catalog wording for `g4_multiplication_word_problem_quick_check` now frames it as equal-groups multiplication review or warm-up practice
* Current lane decision:
  * Quick Check expansion is now paused intentionally at 9
  * Next step is a read-only Exit Ticket layout feasibility scan
  * Do not build more Quick Checks right now
  * Future Quick Checks can resume later after Exit Ticket feasibility and/or teacher testing

First Exit Ticket proof of concept implemented:

* Commit: `7b568be feat: add first exit ticket resource`
* Backup branch: `backup/milestone-6-first-exit-ticket`
* New resource: `g3_expanded_form_to_standard_form_exit_ticket`
* Ready resources: 94 / 94 working, 0 failures
* Ready worksheets: 84
* Ready Quick Checks: 9
* Ready Exit Tickets: 1
* Product decision:
  * Worksheet promotion remains paused at 84
  * Quick Check expansion remains paused at 9
  * Exit Tickets have started with exactly one proof of concept
  * Do not build more Exit Tickets until this proof of concept passes Teacher QA and Curriculum Alignment
* Implementation:
  * Added exactly one ready Exit Ticket to both catalog files
  * Added separate renderer: `renderers/exitTicketPdfRenderer.js`
  * Added a narrow `resourceType === "exit_ticket"` route branch
  * Reused existing catalog generation/runtime
  * Added small `exit_ticket` label handling in Browse, detail, and preview
  * Normal worksheet rendering was not changed
  * Quick Check rendering was not changed
  * No batch of Exit Tickets was started
* Architecture note:
  * Exit Tickets use a separate renderer rather than extending the worksheet renderer or folding into the Quick Check renderer
  * This protects the stable worksheet/Quick Check flow and keeps the implementation reversible
* Layout:
  * Letter portrait PDF
  * Page 1 has two identical cut-apart tickets stacked vertically
  * Visible cut line between tickets
  * Each ticket includes label, title, name/date line, directions, and 3 prompts
  * Page 2 has a readable answer key
  * Layout is black-and-white friendly and print-ready
* Verification:
  * JS syntax checks passed for the new renderer and touched routes
  * Catalog JSON parse passed
  * `npm run audit:worksheets` passed
  * Ready result: 94 / 94 working, 0 failures
  * Generated result: 214 / 214 working, 0 failures
  * Partial result: 5 / 5 working, 0 failures
  * Planned result: known/deferred `pattern_word_problems` failures only
  * `/browse` route passed
  * `/api/worksheet-catalog?status=ready` returned 94 ready items, 1 Exit Ticket, and 9 Quick Checks
  * Detail, preview, and PDF routes passed for the new Exit Ticket
  * New Exit Ticket PDF is valid, 2 pages, and letter size
  * Existing worksheet PDF regression passed using `g1_addition_facts_within_20`
  * Existing Quick Check PDF regression passed using `g3_expanded_form_to_standard_form_quick_check`
* Minor limitations:
  * First Exit Ticket uses two identical tickets, which is safest for proof of concept
  * One shared answer key is used because the tickets are identical
  * Future Exit Tickets should go through Teacher QA and Curriculum Alignment before scaling
  * Exit Tickets should remain lesson-close formative checks, not assessments or mastery checks
* Review result:
  * Teacher QA approved the first Exit Ticket proof of concept as public-ready with minor wording/framing caution
  * Curriculum Alignment approved the first Exit Ticket proof of concept as public-ready
  * Strong Grade 3 place-value / Number fit
  * Skill focus is honest and specific
  * Three prompts are enough for a lesson-close formative signal, not mastery
  * Current title, student instructions, teacher note, description, estimated time, and answer key framing are safe
  * No wording change is required
  * Approved public framing: A Grade 3 cut-apart Exit Ticket for writing 3-digit numbers in standard form from expanded form. Best used as a 3-5 minute formative lesson-close check after place-value instruction, not as a test, diagnostic, mastery check, or full place-value assessment.
* Lane decision:
  * Exit Ticket lane is approved for cautious continuation
  * Next recommended step is a tiny controlled Exit Ticket batch of 2-3 narrow, low-risk skills
  * Do not build a broad Exit Ticket expansion yet
  * Worksheet promotion remains paused at 84
  * Quick Check expansion remains paused at 9
* Scaling cautions:
  * Exit Tickets should be lesson-close tools, not mini worksheets
  * Keep teacher notes tied to instruction: "after a lesson on..." or "after practice with..."
  * Avoid mastery, diagnostic, test, assessment, summative, and full-coverage language
  * Use precise skill titles
  * Be careful with word problems and explanations because they need more workspace
  * Identical cut-apart tickets and shared answer keys are acceptable for now
  * A/B versions can be considered later, but are not required

Controlled Exit Ticket batch implemented:

* Commit: `9d8e5ea feat: add controlled exit ticket batch`
* Backup branch: `backup/milestone-6-controlled-exit-ticket-batch`
* New resources:
  * `g2_missing_addends_within_20_exit_ticket`
  * `g3_compare_3_digit_numbers_exit_ticket`
* Ready resources: 96 / 96 working, 0 failures
* Ready worksheets: 84
* Ready Quick Checks: 9
* Ready Exit Tickets: 3
* Product decision:
  * Worksheet promotion remains paused at 84
  * Quick Check expansion remains paused at 9
  * Added exactly 2 new ready Exit Tickets, not a broader Exit Ticket expansion
  * Do not build more Exit Tickets before Teacher QA and Curriculum Alignment review the controlled batch
* Implementation:
  * Added the 2 new Exit Tickets to both catalog files only
  * No renderer changes
  * No route changes
  * No public page changes
  * No worksheet behavior changed
  * No Quick Check behavior changed
* Verification:
  * Catalog JSON parse passed
  * `npm run audit:worksheets` passed
  * Ready result: 96 / 96 working, 0 failures
  * Generated result: 214 / 214 working, 0 failures
  * Partial result: 5 / 5 working, 0 failures
  * Planned result: known/deferred `pattern_word_problems` failures only
  * `/browse` route passed
  * `/api/worksheet-catalog?status=ready` returned 96 ready items, 3 Exit Tickets, and 9 Quick Checks
  * Detail and preview routes passed for both new Exit Tickets
  * PDF routes for both new Exit Tickets passed as 200 `application/pdf`
  * Both new PDFs are valid 2-page letter PDFs
  * Existing Exit Ticket still renders
  * Existing worksheet PDF regression passed using `g1_addition_facts_within_20`
  * Existing Quick Check PDF regression passed using `g3_expanded_form_to_standard_form_quick_check`
  * Visual PDF check passed: two cut-apart tickets visible, cut line visible, prompts readable, answer keys readable, and no clipping/overlap observed
* Minor risks:
  * `g2_missing_addends_within_20_exit_ticket` may occasionally produce a zero-addend style item
  * `g3_compare_3_digit_numbers_exit_ticket` may repeat answer symbols, but prompts are distinct
  * These are not implementation blockers, but Teacher QA should review them
* Next recommended step:
  * Teacher QA / Resource Review Agent should review the 2 new Exit Tickets as a controlled batch
  * Curriculum Alignment Agent should review the 2 new Exit Tickets after Teacher QA
  * After both pass, decide whether to pause Exit Tickets at 3 and move to a broader Milestone 6 quality sweep, or add one final stretch Exit Ticket only if review feedback strongly supports it

Preserve the strategic sequence: 84 ready worksheets -> pause worksheet promotion -> implement one Quick Check proof of concept -> Teacher QA review -> Curriculum Alignment review -> build a small first batch of 3 Quick Checks -> Teacher QA review for the new batch -> Curriculum Alignment review for the new batch -> build a second controlled batch of 3 Quick Checks -> Teacher QA review for the second batch -> Curriculum Alignment review for the second batch -> build one final small Quick Check batch of 2 resources -> Teacher QA review for the final batch -> Curriculum Alignment review for the final batch -> pause Quick Check expansion at 9 -> run a read-only feasibility check for the first cut-apart Exit Ticket -> build exactly one Exit Ticket proof of concept -> Teacher QA review -> Curriculum Alignment review -> build a tiny controlled Exit Ticket batch of 2 resources -> Teacher QA review -> Curriculum Alignment review -> decide whether to pause Exit Tickets at 3 or add one final stretch Exit Ticket.

Quality remains more important than raw count. Keep using the stable catalog/runtime, preserve current worksheet PDFs, and do not start deployment, external testing, graph visuals, `pattern_word_problems`, Morning Math, unit planning, games, or broad Content Excellence yet.
