# Exit Tickets / Quick Checks

## Purpose

This document records the planned Exit Ticket / Quick Check lane for Milestone 6.

Worksheet promotion is intentionally paused at 84 ready worksheets. The next content goal is to add short formative resources without turning them into tiny worksheets or destabilizing the stable worksheet catalog/runtime.

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

First preferred proof-of-concept:

* `g3_place_value_hundreds_tens_ones_quick_check`

Reason:

* Compact single-page Quick Check is lower risk than cut-apart layout
* Place-value content is a stable existing generator area when ranges are controlled
* It can prove the metadata, compact renderer, detail/preview/PDF flow, and answer key path before scaling

Two-per-page cut-apart Exit Ticket format should come later after the Quick Check path works.

## Recommended Implementation Sequence

1. Document the lane
2. Add minimal `resourceType` support
3. Add compact Quick Check renderer
4. Build one proof-of-concept Quick Check
5. Verify Browse/detail/preview/PDF
6. QA/alignment review
7. Then scale toward 10-15 Exit Tickets / Quick Checks

## Guardrails

* Quality over raw count
* Stable platform first
* No deployment or external testing yet
* No accounts, payments, memberships, AI features, lesson slides, graph visuals, `pattern_word_problems`, UI redesign, Morning Math, unit planning, games, or broad Content Excellence
* Avoid making these feel like tiny worksheets
* Keep the wording formative: check, review, warm-up, small-group, homeschool support
