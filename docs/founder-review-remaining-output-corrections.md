# Founder Review Remaining Current-Output Corrections

Date: 2026-08-11
Baseline: `3875e01`
Scope: current default worksheets only

This checkpoint completes the remaining active corrections from Founder Review 1 after the committed Fair Sharing and public-copy batches. It does not create missing grades, add public customization, adopt variable requests, overwrite historical founder-review PDFs, or expand curriculum scope.

## Correction inventory

| Classification | Exact resources | Current decision |
|---|---|---|
| Approved output retained | Fair Sharing 0133–0134; Addition Facts 0001/0003; Addition Story Problems 0096–0100; Fact Families 0020–0022; array titles/instructions 0066–0069 | Already completed in the two earlier committed batches; no reimplementation. |
| Narrow correction | 0002 `g2_addition_within_20_quick_check`; 0005 `g2_subtraction_within_20_quick_check`; 0013 `g2_missing_addends_within_20_quick_check` | Move Name/Date and instruction into the current Quick Check positions while retaining the approved compact six-item design. Footer now identifies `Quick Check`. |
| Shared-family correction | 0066 `grade1_multiplication_facts_arrays`; 0067 `grade2_multiplication_facts_arrays`; 0068 `g3_multiplication_arrays`; 0069 `g4_array_interpretation` | Use public family footer labels. Grade 3/4 no longer expose the internal `multiplication_foundations` slug. |
| Shared-family correction | 0135–0142, 0144–0146, 0148–0151 | One shared standard pictograph specification now owns dimensions, label column, symbol size, spacing, legend, and stroke. Match Data uses an explicitly derived compact specification because each item displays two choices. |
| Shared-family correction | 0144 `grade1_data_display_graphing_complete_graph`; 0145 `grade2_data_display_graphing_complete_graph`; 0146 `g3_complete_a_graph` | Each default now contains two complete, distinct graph-construction tasks on one student page and the mirrored key page. Symbols remain the standard 16-point family size; type and marks were not reduced below the standard family specification. |
| Architecture issue / defer | 0147 `g5_complete_graphs` | Moved A → G and `ready` → `planned`. Its questions have no displayed graph and no structured graph truth. Reconsider only with approved graph-generation truth and a real renderer. |
| Missing-grade reconciliation / defer | `g4_read_and_interpret_graphs` | Remains G and moved `ready` → `planned`. The candidate is text-only, duplicates interpretation work, and supplies no structured visual graph role. |
| Approved role retained | 0143 `g5_interpret_graphs` | Remains ready as the approved Grade 5 text-data interpretation resource. It is intentionally excluded from visual-graph geometry because it does not claim the structured pictograph role. |
| Deferred | Fair Sharing Grades 3–5; Construct Data Grade 4; Graph Application Grades 2–5; Interpret Data Grade 4; Match Data Grades 4–5; Read Data Grades 4–5; Addition Facts Grades 3–5; Addition Number Lines Grades 2–5; Base-Ten Blocks Grades 4–5 | These are intentional launch-scope, duplication, or architecture decisions. No missing grade is created in this checkpoint. |
| Deferred | All Founder Review 1 variable requests | Preserved for a separate future variable/customization inventory; none are implemented or used here. |

## Shared graph specifications

| Role | Width × height | Header | Label column | Symbols | Purpose |
|---|---:|---:|---:|---:|---|
| Standard read/interpret/application | 504 × 218 pt | 42 pt | 104 pt | 16 pt diameter; 31 pt gap | One visible graph shared by the page questions. |
| Construction | 504 × 160 pt | 32 pt | 104 pt | Same 16 pt diameter; same 31 pt gap | Two complete table-and-pictograph tasks per page without shrinking graph marks. |
| Match compact | derived choice width × 138 pt | none | 70 pt | 10 pt diameter; 18 pt gap | Two A/B choices per task, with the existing 18 pt selection target retained. |

Student and answer-key pages consume the same generated graph and task truth. The key changes only the visible completion state or correct-choice emphasis.

## Lifecycle result

- Catalog total remains 331.
- Current statuses: 102 `ready`, 213 `generated`, 5 `partial`, 11 `planned`.
- Grade 4 remains A24 / D0 / E0 / G24 / Total48; only the already-deferred graph candidate changes lifecycle status.
- Grade 5 is A23 / D0 / E0 / G23 / Total46 after the unfinished construction record moves A → G.
- The seven established planned `pattern_word_problems` generator gaps remain unchanged.

## Protected contracts

Preserved: deterministic generation, generator-owned mathematical truth, one-to-one pictograph scale, whole symbols, four categories, readable public copy, student/key parity, answer truth, margins, footer geometry, compact Quick Check question count, approved Grade 5 text-data interpretation, historical review artifacts, and all existing missing-grade decisions.

## Verification result

- Focused Quick Check, array, Grade 1–3 graph, Grade 4 reconciliation, Grade 5 reconciliation, public-copy, adjacent family, and worksheet-builder suites passed.
- All three construction resources passed 30 deterministic seeds and 90 measured student/key PDF renders; every default remained two tasks on one student page plus one key page.
- Catalog audit: 102/102 ready, 213/213 generated, and 5/5 partial records build successfully. The only failures are the seven established planned `pattern_word_problems` gaps.
- Fresh proof set: 22 PDFs / 48 pages in `review/founder-review-remaining-corrections/founder-review-2026-08-11/`.
- Every proof page was rasterized and visually inspected. No clipping, overlap, footer pressure, tiny graph marks, broken legends, or student/key geometry mismatch was found.
- Syntax, JSON parsing, and `git diff --check` passed.
