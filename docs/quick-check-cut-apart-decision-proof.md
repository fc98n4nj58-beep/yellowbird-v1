# Quick Check Cut-Apart Decision Proof

Date: 2026-08-11
Decision-proof baseline: `e65baea`
Implementation baseline: `c0f69dd`
Scope: bounded shared Quick Check cut-apart layout for the eight approved resources below

## Result

The following cut-apart formats are visually feasible and may proceed together only through a bounded shared Quick Check implementation:

- Two identical tickets per letter page, each with six questions in a three-column by two-row grid: `g4_compare_fractions_quick_check`, `g3_compare_3_digit_numbers_quick_check`, `g5_place_value_to_100000_quick_check`, `g5_equivalent_fractions_quick_check`, and `g3_place_value_hundreds_tens_ones_quick_check`.
- Three identical tickets per letter page, each with six questions in a three-column by two-row grid: `g2_subtraction_within_20_quick_check` and `g3_expanded_form_to_standard_form_quick_check`.
- Four identical tickets per letter page, each with five vertically spaced questions: `g2_missing_addends_within_20_quick_check`.

Each ticket repeats the Name line, concise title, direct instruction, teacher note, and Grade/Math/Quick Check footer. Repeated per-item lead-ins are removed when the ticket instruction supplies the action.

## Separate decision - resolved

`g4_pattern_rule_quick_check` required a seven-question default and the approved instruction `Read each pattern. Write the rule to answer each question.` Its dedicated truth and layout proof passed, and the bounded correction is now implemented separately from the eight-resource cut-apart batch.

## Evidence

- Nine student/key proof PDFs were generated and student pages were rasterized and visually inspected.
- Two-up proofs kept fraction notation, five-digit comparisons, and the three-response hundreds/tens/ones prompts readable.
- Three-up proofs retained clear left-aligned equations and answer blanks.
- Four-up Grade 2 Missing Addends retained five readable rows and left-aligned prompt geometry.
- No production behavior was changed.

## Protected scope

Preserve deterministic generator truth, student/key parity, catalog lifecycle, public customization, existing Quick Checks outside these IDs, Exit Tickets, standard worksheets, and historical review PDFs.

## Implementation checkpoint

The eight approved resources now use the shared cut-apart Quick Check renderer. The catalog and runtime layout metadata agree on copy count and items per ticket. Grade 2 Missing Addends now has the approved five-question default and direct instruction. The comparison and equivalent-fraction instructions were tightened so the action appears once per ticket rather than repeating in every prompt.

Verification completed:

- 30 deterministic seeds per resource, 240 seeded generations total, with same-seed equality, exact item counts, answer presence, copy-count metadata, and student/key pagination checks.
- All eight final student/key PDFs, 16 pages total, rasterized and visually inspected; no clipping, overlap, footer pressure, truncated teacher notes, or weakened answer space was found.
- Grade 2 compact assessment, Grade 4 reconciliation, Grade 5 reconciliation, founder-review remaining-corrections, and four-up Exit Ticket isolation suites passed.
- Catalog audit: 102/102 ready resources working; the only failures are the seven established planned `pattern_word_problems` gaps.
- Syntax checks, catalog JSON parsing, and diff hygiene passed.

`g4_pattern_rule_quick_check` was excluded from this eight-resource batch and subsequently closed through its separate seven-question decision proof and bounded implementation.
