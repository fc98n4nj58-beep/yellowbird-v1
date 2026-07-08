# Exit Tickets / Quick Checks

## Purpose

This document records the planned Exit Ticket / Quick Check lane for Milestone 6.

Worksheet promotion is intentionally paused at 84 ready worksheets. The first Quick Check proof of concept is implemented, verified, and reviewed. The first controlled Quick Check batch is also implemented, verified, and reviewed. The second controlled Quick Check batch is implemented, verified, and reviewed. The final small Quick Check batch is implemented, verified, and reviewed, bringing ready resources to 93 / 93 working while keeping ready worksheets at 84. Quick Check expansion is now paused intentionally at 9. The next content goal is a read-only Exit Ticket layout feasibility scan.

Guiding phrase:

More fuel in the same airplane.

## Product Definition

Public family label:

Exit Ticket / Quick Check

Exit Ticket:

* 3-5 minute end-of-lesson formative check
* Short, print-and-go
* Best future format: two identical cut-apart tickets per letter page
* Typical question count: 3-4

Quick Check:

* 5-8 minute short independent skill check
* Useful as a warm-up, review, small-group check, or homeschool check
* First build-now format: compact single-page resource
* Typical question count: 5-6

Use formative language only. Do not call these assessments, tests, mastery checks, diagnostics, summative resources, or full expectation coverage.

## Feasibility Decision

Read-only architecture/catalog review found the lane is feasible with a small new resource lane.

Best framing:

* Same catalog engine
* New resource family
* Existing generators/runtime can supply much of the content
* Separate metadata and compact PDF template are needed
* Do not treat Exit Tickets / Quick Checks as just more worksheets
* Preserve the current Browse -> Detail -> Preview -> Download/Print PDF flow
* Preserve current worksheet PDFs

This should be done without destabilizing worksheet PDFs by keeping existing worksheet renderer behavior untouched.

Implementation should use either:

* a separate compact renderer, or
* a narrow `resourceType` branch

Do not alter `renderWorksheetPDF` behavior globally.

## Metadata To Consider

Minimal future fields:

* `resourceType`: `exit_ticket` or `quick_check`
* `formatLabel`
* `useCase`
* `teacherNote`
* `prepLevel`: `print-and-go`
* `formativeUse`: `true`
* `estimatedTimeMinutes`
* `hasAnswerKey`

## First Implementation Target

Start with Quick Check first, not a two-per-page Exit Ticket.

First proof-of-concept implemented:

* `g3_place_value_hundreds_tens_ones_quick_check`
* Title: Hundreds, Tens, and Ones Quick Check
* Grade: 3
* Resource type: `quick_check`
* Format label: Quick Check
* Skill: represent 3-digit numbers using hundreds, tens, and ones
* Use case: short formative skill check, review, small-group check, or homeschool check
* Commit: `5442440 feat: add first quick check resource`
* Backup branch: `backup/milestone-6-first-quick-check`

Reason:

* Compact single-page Quick Check is lower risk than cut-apart layout
* Place-value content is a stable existing generator area when ranges are controlled
* It can prove the metadata, compact renderer, detail/preview/PDF flow, and answer key path before scaling

Implementation notes:

* Added one ready Quick Check catalog item
* Added compact Quick Check PDF rendering through `renderers/quickCheckPdfRenderer.js`
* Existing `renderWorksheetPDF` behavior remains untouched for normal worksheets
* Added narrow route/runtime support for `resourceType: quick_check`
* Added minimal metadata support for `resourceType`, `formatLabel`, `teacherNote`, `useCase`, `prepLevel`, and `formativeUse`
* Lightly updated Browse, detail, and preview labels so the item presents as a Quick Check
* Added opt-in `expandedForm` answer style for hundreds/tens/ones prompts

Verification:

* JS syntax checks passed for changed JS files
* Catalog JSON parse passed
* `npm run audit:worksheets` passed
* Ready result: 85 / 85 working, 0 failures
* Quick Check runtime generates 6 real prompts
* Quick Check PDF route returned 200 `application/pdf` and a valid 2-page letter PDF
* Existing worksheet PDF regression check passed using `g1_addition_facts_within_20`
* Browse/detail/preview/PDF route checks passed

Review result:

* Teacher QA approved the first Quick Check as public-ready
* Curriculum Alignment approved it with minor wording/framing caution
* Teacher note now frames the resource for use after a place-value lesson
* Description now frames it as focused place-value review
* Final positioning: A Grade 3 quick formative check for representing 3-digit numbers using hundreds, tens, and ones. Best used after place-value instruction as a short review or progress check, not as a full assessment or mastery measure.
* Framing guardrail: do not describe it as a test, diagnostic, mastery check, summative assessment, or full expectation assessment

Two-per-page cut-apart Exit Ticket format should come later after the Quick Check path works.

## First Controlled Quick Check Batch

Implemented batch:

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

Implementation notes:

* Added `studentInstructions` support to the Quick Check PDF renderer
* Fallback instruction is "Complete each question."
* Existing Quick Check now uses metadata-driven student instructions: "Show each number as hundreds, tens, and ones."
* Added exactly 3 new ready Quick Checks
* Normal worksheet PDF rendering was not changed
* No two-per-page Exit Tickets were started
* No visual Quick Checks were added
* No mixed-activity Quick Checks were added

Verification:

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

Review result:

* Teacher QA approved all 3 new Quick Checks as public-ready
* Teacher QA found the batch strengthens the lane because it adds focused, printable, teacher-obvious resources with clear student instructions, teacher notes, and answer keys
* Curriculum Alignment approved all 3 as public-ready
* `g2_subtraction_within_20_quick_check`: public-ready with minor wording/framing caution
* `g2_addition_within_20_quick_check`: public-ready with minor wording/framing caution
* `g3_compare_3_digit_numbers_quick_check`: public-ready
* Catalog wording was tightened for Grade 2 fact-check notes/descriptions and Grade 3 comparison symbols
* The first controlled Quick Check batch has passed both review gates
* Lane-level caution: do not over-scale simple fact checks; future Quick Checks should gradually include representation, place value, word problems, and strategy-based skills where safe

Next decision:

* Decide whether to build another controlled Quick Check batch of 3-5 or run a read-only feasibility check for the first cut-apart Exit Ticket layout
* Continue deferring two-per-page Exit Tickets until compact Quick Checks prove stable through QA/alignment

## Second Controlled Quick Check Batch

Implemented batch:

* Commit: `db6bfa0 feat: add second quick check batch`
* Backup branch: `backup/milestone-6-second-quick-check-batch`
* New Quick Checks:
  * `g4_compare_fractions_quick_check`
  * `g2_missing_addends_within_20_quick_check`
  * `g4_pattern_rule_quick_check`
* Ready resources: 91 / 91 working, 0 failures
* Ready worksheets: 84
* Ready Quick Checks: 7

Implementation notes:

* Added exactly 3 new ready Quick Checks
* Added entries to both catalog files only:
  * `data/worksheetCatalog.master.json`
  * `data/worksheetCatalog.generated.json`
* Normal worksheet PDF rendering was not changed
* No route changes were made
* No two-per-page Exit Tickets were started
* No visual Quick Checks were added
* No mixed-activity Quick Checks were added

Verification:

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

Minor risk:

* `g4_compare_fractions_quick_check` may occasionally repeat an exact comparison with the current generator seed
* This does not block implementation, but Teacher QA should review it

Review result:

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

Next decision:

* Decide whether to build one final small Quick Check batch of 2-3 resources or run a feasibility check for the first cut-apart Exit Ticket layout
* Continue deferring two-per-page Exit Tickets until compact Quick Checks prove stable through QA/alignment

## Final Small Quick Check Batch

Implemented batch:

* Commit: `6b08ca2 feat: add final quick check batch`
* Backup branch: `backup/milestone-6-final-quick-check-batch`
* New Quick Checks:
  * `g3_expanded_form_to_standard_form_quick_check`
  * `g4_multiplication_word_problem_quick_check`
* Ready resources: 93 / 93 working, 0 failures
* Ready worksheets: 84
* Ready Quick Checks: 9

Implementation notes:

* Added exactly 2 new ready Quick Checks
* Added entries to both catalog files only:
  * `data/worksheetCatalog.master.json`
  * `data/worksheetCatalog.generated.json`
* Normal worksheet PDF rendering was not changed
* No route changes were made
* No generator changes were made
* No worksheet behavior changed
* No docs were changed during implementation
* No Exit Ticket work was started

Verification:

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

Minor limitation:

* `g4_multiplication_word_problem_quick_check` is best framed as Grade 4 review/practice
* Sampled prompts were real and distinct, though some answers repeated
* Do not frame it as deep problem-solving, mastery, assessment, diagnostic, or full Grade 4 multiplication coverage

Review result:

* Teacher QA approved the final small Quick Check batch
* Curriculum Alignment approved the final small Quick Check batch
* `g3_expanded_form_to_standard_form_quick_check` is public-ready
* `g4_multiplication_word_problem_quick_check` is public-ready as equal-groups review/practice with wording/framing caution
* Catalog wording for `g4_multiplication_word_problem_quick_check` now frames it as equal-groups multiplication review or warm-up practice
* Quick Check expansion is now paused intentionally at 9

Next decision:

* Run a read-only Exit Ticket layout feasibility scan
* Do not build more Quick Checks right now
* Future Quick Checks can resume later after Exit Ticket feasibility and/or teacher testing

## Recommended Implementation Sequence

1. Document the lane
2. Add minimal `resourceType` support
3. Add compact Quick Check renderer
4. Build one proof-of-concept Quick Check
5. Verify Browse/detail/preview/PDF
6. Teacher QA review
7. Curriculum Alignment review
8. Build a controlled first batch of 3 Quick Checks
9. Teacher QA and Curriculum Alignment review for the 3 new Quick Checks
10. Build a second controlled batch of 3 Quick Checks
11. Teacher QA and Curriculum Alignment review for the second controlled batch
12. Build one final small Quick Check batch of 2 resources
13. Teacher QA and Curriculum Alignment review for the final small Quick Check batch
14. Pause Quick Check expansion at 9
15. Run a read-only feasibility check for the first cut-apart Exit Ticket

## Guardrails

* Quality over raw count
* Stable platform first
* No deployment or external testing yet
* No accounts, payments, memberships, AI features, lesson slides, graph visuals, `pattern_word_problems`, UI redesign, Morning Math, unit planning, games, or broad Content Excellence
* Avoid making these feel like tiny worksheets
* Keep the wording formative: check, review, warm-up, small-group, homeschool support
