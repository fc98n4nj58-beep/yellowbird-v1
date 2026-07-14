# Grade 2 Comparison and Assessment Correction Record

Date: 2026-07-14

Status: founder-approved; final comparison footer correction verified; ready for commit

## Scope and architecture

This record covers these six founder-approved ready resources:

1. `grade2_place_value_representation_compare_numbers` — Compare 3-Digit Numbers — worksheet
2. `g2_compare_numbers_to_100` — Compare Numbers to 100 — worksheet
3. `g2_addition_within_20_quick_check` — Addition Within 20 — Quick Check
4. `g2_subtraction_within_20_quick_check` — Subtraction Within 20 — Quick Check
5. `g2_missing_addends_within_20_quick_check` — Missing Addends Within 20 — Quick Check
6. `g2_missing_addends_within_20_exit_ticket` — Missing Addends Within 20 — Exit Ticket

The shared catalog/runtime path remains authoritative for preview and PDF. Generators own mathematical truth; renderers own page geometry. No route, public UI, curriculum, Grade 1, Grade 3+, or catalog-status change is part of this pass.

## Corrected comparison contract

- Both resources now generate exactly 12 bare comparison rows in a 2-column × 6-row layout.
- Each row is presented as `325 ____ 418`; the instruction appears once in the header.
- The inline symbol target is 52 points wide and uses identical geometry on student and answer-key pages.
- `grade2_place_value_representation_compare_numbers` is strictly 100–999 across seeded output.
- `g2_compare_numbers_to_100` is strictly 0–100 across seeded output.
- Titles are concise and no longer claim an extension in the main student-facing title.
- Correct comparison symbols are generated with the operands and reused by the answer key; the renderer does not reconstruct mathematical truth.
- Both comparison PDFs now use the exact public footer `Grade 2 • Math • Place Value` on student and answer-key pages. Internal values `place_value_representation` and `number_relationships` are absent.

## Corrected compact assessment contract

The three Quick Checks use one shared compact Grade 2 layout: a quiet `Quick Check` label once, a concise content title, no repeated assessment phrase in the title, no metadata/time/teacher/rating panel, a 2-column × 3-row grid, exactly six items, and one 58-point inline answer target per equation. No secondary or full-width response line is drawn. The answer key reuses the same grid and targets. All pages use the standard grade/math/domain footer.

The missing-addend Exit Ticket uses two identical cut-apart tickets with exactly three items per ticket. Each ticket has one quiet `Exit Ticket` label, the concise title, name/date fields, the instruction once, inline answer targets only, and a compact footer. The second page is a concise three-item shared answer key.

For exact Grade 2 missing-addend assessment IDs, deterministic batching now limits zero-related items to one. A six-item Quick Check contains at least five nonzero items; a three-item Exit Ticket contains at least two. Other missing-addend resources keep their existing behavior.

## Verification

Dedicated coverage is checked in at:

- `scripts/testGrade2ComparisonFamily.js`
- `scripts/testGrade2AssessmentLayout.js`

The tests cover exact IDs, titles, instructions, counts, layout flags, seed stability, mathematical truth, 40-seed comparison ranges, 30-seed missing-addend balance, answer-key parity, two-page PDFs, and Grade 1/Grade 3 isolation. Both focused suites pass.

The full worksheet audit also passes its launch-facing gate: ready 104/104, generated 213/213, partial 5/5, total 331, with zero ready failures and only the seven established planned `pattern_word_problems` gaps.

The fixed-seed founder packet uses `grade2-comparison-assessment-founder-v1`. The complete six-PDF packet remains exactly 12 pages. For the final micro-correction, only the two comparison PDFs were regenerated; their four pages were rendered and visually rechecked. Both classify as **FOUNDER APPROVED**. There are no internal footer identifiers, overlaps, clipping defects, range regressions, repeated row prompts, or footer collisions. Student/key geometry and truth are aligned. The four approved assessment PDFs were not regenerated.

## Founder packet

Folder: `review/grade-2-comparison-assessment/founder-review/`

- `g2_compare_3_digit_numbers_extension_default_student_and_key.pdf`
- `g2_compare_numbers_to_100_default_student_and_key.pdf`
- `g2_addition_within_20_quick_check_default_student_and_key.pdf`
- `g2_subtraction_within_20_quick_check_default_student_and_key.pdf`
- `g2_missing_addends_within_20_quick_check_default_student_and_key.pdf`
- `g2_missing_addends_within_20_exit_ticket_default_student_and_key.pdf`

The legacy filename containing `extension` is retained only to preserve the established review-packet path. The PDF title is `Compare 3-Digit Numbers`.

## Reconciliation status

All six remain `ready` in the catalog. Founder approval moves the six reconciliation records from Category C to Category A: A8/C10 becomes A14/C4, while B0/D11/E9/F0/G14 and total 52 remain unchanged. No catalog promotion occurs.

## Founder result

The two comparison worksheets, three compact Quick Checks, and cut-apart Exit Ticket are founder-approved. The final footer micro-correction is complete and the production/test/documentation scope is ready for the controlled commit checkpoint.
