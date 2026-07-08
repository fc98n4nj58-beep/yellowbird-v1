# Exit Tickets / Quick Checks

## Purpose

This document records the planned Exit Ticket / Quick Check lane for Milestone 6.

Worksheet promotion is intentionally paused at 84 ready worksheets. The first Quick Check proof of concept is implemented, verified, and reviewed, bringing ready resources to 85 / 85 working while keeping ready worksheets at 84. The next content goal is to build a controlled batch of 3-5 more Quick Checks, not the full 10-15 yet.

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

## Recommended Implementation Sequence

1. Document the lane
2. Add minimal `resourceType` support
3. Add compact Quick Check renderer
4. Build one proof-of-concept Quick Check
5. Verify Browse/detail/preview/PDF
6. Teacher QA review
7. Curriculum Alignment review
8. Build a controlled first batch of 3-5 more Quick Checks
9. Then scale cautiously toward 10-15 Exit Tickets / Quick Checks

## Guardrails

* Quality over raw count
* Stable platform first
* No deployment or external testing yet
* No accounts, payments, memberships, AI features, lesson slides, graph visuals, `pattern_word_problems`, UI redesign, Morning Math, unit planning, games, or broad Content Excellence
* Avoid making these feel like tiny worksheets
* Keep the wording formative: check, review, warm-up, small-group, homeschool support
