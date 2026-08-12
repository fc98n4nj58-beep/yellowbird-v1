# Quick Check Cut-Apart Decision Proof

Date: 2026-08-11
Baseline: `e65baea`
Scope: feasibility only; no production renderer, catalog, lifecycle, generator, or route changes

## Result

The following cut-apart formats are visually feasible and may proceed together only through a bounded shared Quick Check implementation:

- Two identical tickets per letter page, each with six questions in a three-column by two-row grid: `g4_compare_fractions_quick_check`, `g3_compare_3_digit_numbers_quick_check`, `g5_place_value_to_100000_quick_check`, `g5_equivalent_fractions_quick_check`, and `g3_place_value_hundreds_tens_ones_quick_check`.
- Three identical tickets per letter page, each with six questions in a three-column by two-row grid: `g2_subtraction_within_20_quick_check` and `g3_expanded_form_to_standard_form_quick_check`.
- Four identical tickets per letter page, each with five vertically spaced questions: `g2_missing_addends_within_20_quick_check`.

Each ticket repeats the Name line, concise title, direct instruction, teacher note, and Grade/Math/Quick Check footer. Repeated per-item lead-ins are removed when the ticket instruction supplies the action.

## Separate decision

`g4_pattern_rule_quick_check` requires a seven-question default and the approved instruction `Read each pattern. Write the rule to answer each question.` Its existing default generates six questions, so a dedicated seven-question truth and layout proof is still required before it joins an implementation batch.

## Evidence

- Nine student/key proof PDFs were generated and student pages were rasterized and visually inspected.
- Two-up proofs kept fraction notation, five-digit comparisons, and the three-response hundreds/tens/ones prompts readable.
- Three-up proofs retained clear left-aligned equations and answer blanks.
- Four-up Grade 2 Missing Addends retained five readable rows and left-aligned prompt geometry.
- No production behavior was changed.

## Protected scope

Preserve deterministic generator truth, student/key parity, catalog lifecycle, public customization, existing Quick Checks outside these IDs, Exit Tickets, standard worksheets, and historical review PDFs.
