# Grade 4 Founder Review Batch Plan

Date: 2026-07-22

Status: Batch 1 founder-approved and closed; later batches remain proposed. Grade 4 remains open and lifecycle statuses remain unchanged.

## Planning rules

- Preserve small coherent batches despite deeper single-session verification.
- Reuse Grade 1-3 structured families; do not infer inheritance where adapters are exact-ID scoped.
- Generate mathematical truth before wording and before rendering. Student and key must share one structured record.
- Do not build a broad graph, matching or visual system merely to clear reconciliation counts.
- No Grade 4 public customization is a prerequisite. Candidate controls remain raw-runtime-only until a later registry review.
- A resources need no implementation batch. G resources require founder approval of deferral, not code.

## Proposed sequence

### B1 — Numeric Patterning Public-Copy and Default Closure

- Exact IDs: `grade4_patterning_and_algebra_extend_pattern`; `grade4_patterning_and_algebra_identify_pattern_rule`; `grade4_patterning_and_algebra_missing_value_pattern`.
- Disposition: founder-approved; all three moved E to A. Split, blocked or deferred: none.
- Completed-work finding: shared `numericPatternRules.js` already stores sequence, start, operation, step, missing indexes/values, continuation answers, rule text and duplicate signature. Current defaults render and key correctly.
- Implementation lane: resource-scoped public title/instruction/footer/default closure only; preserve raw variables and existing renderer/layout.
- Shared family: Grade 3 Batch 1 and commit `feb3bc1`/`53116fc` provide the closest proof.
- Variables: VP plus VQ. Verify operation modes, start/step/range aliases, sequence lengths, continuation count, missing count/placement, examples, pagination and seed.
- Tests: 30 seeds per ID; same-seed equality; different-seed variation; exact task truth; duplicate prevention; supported aliases; invalid pool/range cases; student/key parity; Grade 1-3 isolation.
- Proof packet: three default PDFs in one founder packet; add at most two stress PDFs for widest sequences and completed-example/multipage behavior.
- Founder complexity: LOW.
- Stop conditions: any generator/renderer redesign, changed mathematical contract, page overflow or public customization requirement.
- Closeout: complete. No Batch 2 work began during this closeout.

### B2 — Grade 4 Fraction Relationships and Models

- Exact IDs: `grade4_fraction_equivalence_compare_fractions`; `grade4_fraction_equivalence_fraction_number_line`; `grade4_fraction_equivalence_shade_fraction_models`.
- Proposed categories: D3.
- Completed-work finding: current full-practice compare is under-structured; number-line and shade generators use an incompatible array-returning signature and normalize to blank tasks. Grade 3 has approved structured implementations for all three roles.
- Implementation lane: extend the Grade 3 exact cross-product, fraction-strip and full-width number-line families with Grade 4-specific denominator/improper-fraction policy; no new primitive.
- Shared family: `grade3CompareFractions.js`, `grade3FractionNumberLine.js`, `grade3ShadeFractionModels.js`; equation, fraction-strip and number-line renderers.
- Variables: VQ plus explicit denominator/fraction selectors, endpoint policy and task mode. Reject all mixed valid/invalid lists rather than falling back.
- Tests: 30 seeds; exact integer comparison; balanced symbols; reversal-safe duplicates; numerator/partition/target parity; shading count; denominator policy; endpoint policy; student/key parity; Grade 1-3 fraction isolation.
- Proof packet: three default PDFs plus comparison-density, maximum-partition and endpoint/model stress proofs.
- Founder complexity: MODERATE.
- Stop conditions: floating-point truth, ambiguous equivalence, improper-fraction policy without founder approval, visual partition mismatch or need for a new fraction renderer.
- Recommended order: second.

### B3 — Grade 4 Addition/Subtraction Story Problems

- Exact IDs: `grade4_addition_subtraction_word_problems_addition_word_problem`; `grade4_addition_subtraction_word_problems_missing_addend_word_problem`; `grade4_addition_subtraction_word_problems_subtraction_word_problem`.
- Proposed categories: D3.
- Completed-work finding: shared work-box and compact-key layout exists, and Grade 2/3 context language has been corrected. Grade 4 IDs still use the generic within-20 path and lack exact Grade 4 operation/missing-position adapters.
- Implementation lane: Grade 4 arithmetic-first adapters on the current shared word-problem renderer; preserve clear one-step roles.
- Shared family: Grade 3 Batch 4 story generators/context scheduling and current `wordProblems.js` work-box layout.
- Variables: VQ and VO; define Grade 4 ranges, selected numbers, operation-specific constraints, contexts/objects, example aliases and page density.
- Tests: 30 seeds; range truth; non-negative subtraction; missing-position balance; arithmetic-before-prose; repetition limits; pair/template uniqueness; pronoun agreement; context selectors; student/key parity; multipage behavior; Grade 2/3 isolation.
- Proof packet: three default PDFs plus one maximum-reading-load/range stress PDF per resource if needed.
- Founder complexity: MODERATE.
- Stop conditions: multi-step ambiguity, reconstructed key truth, unsafe reading load, context exhaustion or new renderer requirement.
- Recommended order: third.

### B4 — Grade 4 Place-Value Range and Number-Line Closure

- Exact IDs: `grade4_place_value_representation_compare_numbers`; `grade4_place_value_representation_number_line_identify`; `grade4_place_value_representation_number_word_match`.
- Proposed categories: E1 (`compare_numbers`) and D2 (number line, number words).
- Completed-work finding: compare already stores left/right/symbol truth but defaults to three digits. Generic number line defaults to 0-10 without structured interval/index state. Number Words is really a writing task and cannot spell values >=1000.
- Implementation lane: resource-scoped Grade 4 range/copy correction for comparison; extend Grade 3 full-width number-line structure; extend number-to-words through the approved Grade 4 range. Keep the existing horizontal origins and representation layouts.
- Shared family: Grade 2 comparison, Grade 3 number line, Grade 3 Number Words, and complete Grade 4 expanded/standard-form anchors.
- Variables: VQ and VV. Validate 1000/9999 boundaries, selected values, alias conflicts, intervals, endpoints, word direction and prompt style.
- Tests: 30 seeds; zero placeholders; equality balance; selected-number truth; invalid/mixed lists; exact interval/index answers; endpoint policy; four-digit spelling/hyphenation; long-answer layout; key parity; cross-grade isolation.
- Proof packet: three default PDFs plus widest 9999/zero-placeholder, endpoint/dense-label and longest-number-word stress proofs.
- Founder complexity: MODERATE.
- Stop conditions: label/word overflow, unsupported range semantics, renderer-owned rounding/math or need for a new visual system.
- Recommended order: fourth.

### B5 — Algebraic Relationship Structures

- Exact IDs: `grade4_addition_subtraction_facts_equation_match`; `grade4_patterning_and_algebra_function_table`.
- Proposed categories: D2.
- Completed-work finding: Equation Match is currently equation completion, not comparison. Function Table has generator-owned input/output pairs but renders one prose sentence rather than a table.
- Implementation lane: extend Grade 3 relational-equation truth to Grade 4 ranges; create only the smallest approved input/output table response layout, with generator-owned rows/rule/answers.
- Shared family: Grade 3 relational equations and shared numeric-patterning candidate pools. No broad matching architecture.
- Variables: VQ, VO and VP. Define result/range selectors, equality balance, operation modes, input rows and one missing-output policy.
- Tests: 30 seeds; exactly balanced true/false relations; exact expression values; one unambiguous target per table; input/output/rule parity; duplicate prevention; density; key restoration; cross-grade isolation.
- Proof packet: two default PDFs plus one mixed-operation relation stress and one widest-table stress.
- Founder complexity: MODERATE to HIGH.
- Stop conditions: arbitrary matching UI, renderer-owned arithmetic, multi-rule ambiguity, table overflow or a broader visual system than one bounded input/output table.
- Recommended order: fifth.

### S6 — A-Resource Confirmation Sweep

- Exact IDs: the 11 resources listed under **A resources held as complete** below.
- Review lane: confirmation only; compare current default output, structured truth, answer-key parity, lifecycle status and teacher role with the evidence recorded in the preflight inventory.
- Shared architecture: existing compact assessment, multiplication-model/fluency, multiplication-story and place-value-form families; no generator or renderer work is planned.
- Tests: rerun the focused Grade 4 preflight verifier, catalog audit and directly relevant established family regressions only if founder review identifies a concrete discrepancy.
- Proof expectation: one compact confirmation packet may reuse newly generated default proofs for the 11 records; proofs remain untracked and no proof is required merely to apply the proposed reconciliation.
- Stop conditions: any arithmetic, copy, layout, duplication or variable-contract defect that invalidates proposed A. Move that exact resource back to a correction lane rather than broadening the sweep.
- Recommended order: sixth, after B1-B5 founder closeout.

### S7 — Final Grade 4 Reconciliation and Closeout

- Scope: apply only founder-approved movements from the 48-row ledger after B1-B5 and the A-resource confirmation sweep are complete.
- Expected scenario if all proposals are approved: A25 / D0 / E0 / G23 / Total48; lifecycle statuses remain independent and unchanged unless separately authorized.
- Verification: 48 rows, 48 unique IDs, exact category totals, every G rationale retained, Grade 2/3 closure guards, catalog audit, staged-path guard and diff check.
- Proof expectation: no new resource proof packet; closeout evidence is the approved batch packets and final reconciliation report.
- Stop conditions: unresolved D/E row, missing G rationale, unapproved lifecycle movement, catalog drift, protected-path change or any total other than 48.
- Recommended order: seventh and final.

## Grade 4 Batch 1 closeout

Batch 1 comprised the three numeric-pattern resources and is founder-approved.

Why this is the safest high-leverage move:

- all three exact IDs are already `ready` and have sound structured truth;
- one proven shared generator and existing equation layouts cover the family;
- Grade 3 completed essentially the same public-copy/default closure;
- no new renderer, visual system, arithmetic rule or customization is needed;
- three default proofs fit one founder packet and one post-approval commit;
- closing the family produces meaningful Grade 4 progress while preserving room for the higher-risk fraction and story batches.

Closeout action: record exactly the three approved E-to-A movements, preserve the reviewed implementation and proofs, and leave all later batches untouched.

## Batch 1 founder-review checkpoint

Status: founder-approved and closed. Catalog lifecycle statuses remain unchanged.

Approved: Extend the Pattern; Identify the Pattern Rule; Find the Missing Values. Split, blocked or deferred: none.

### Completed-work and inheritance findings

- `grade4_patterning_and_algebra_extend_pattern`, `grade4_patterning_and_algebra_identify_pattern_rule`, and `grade4_patterning_and_algebra_missing_value_pattern` were each classified **NARROW CORRECTION NEEDED / SHARED-FAMILY EXTENSION NEEDED**. None was already complete, stale-reconciliation-only, or dependent on new architecture.
- Grade 3 Batch 1 already supplied the reusable sequence engine, deterministic candidate pools, add/subtract modes, continuation/missing/rule truth, completed examples, task layouts, rendering, pagination and answer-key reconstruction.
- The remaining Grade 4 defects were stale public copy, elementary inherited defaults (starts 0-20 and steps 1-5), weak operation/range adaptation, two-column density, incomplete exposed answer state/duplicate signatures, bypassed selected step/operation and explicit missing-position inputs, and permissive invalid-input fallback.
- The shared generator now exposes complete sequence truth, operation, step, rule, response values, activity-specific answers, answer state and duplicate signature. The renderer remains display-only. Additive truth fields and selected-pool consumption preserve Grade 2/3 output; Grade 4 public defaults and validation remain exact-ID scoped.

### Approved-for-review Grade 4 contract

| Resource | Title | Instruction | Default | Tested safe boundary |
| --- | --- | --- | --- | --- |
| `grade4_patterning_and_algebra_extend_pattern` | Extend the Pattern | Find the rule. Then write the next numbers in each pattern. | 12 questions; 12 per page; 5 visible terms; 2 continuation targets | 12 questions on one student page; 4-6 visible terms; 1-3 targets; at most 7 total terms |
| `grade4_patterning_and_algebra_identify_pattern_rule` | Identify the Pattern Rule | Write the rule for each number pattern. | 10 questions; 10 per page; 6 terms | 18 questions over at most 2 student pages; 5-7 terms |
| `grade4_patterning_and_algebra_missing_value_pattern` | Find the Missing Values | Find the rule. Then write the missing numbers in each pattern. | 12 questions; 12 per page; 7 terms; 2 varied missing positions | 20 questions over at most 2 student pages; 5-7 terms; 1-2 missing values |

All three use `Grade 4 • Math • Patterning & Algebra`, full-width rows, mixed and exactly balanced addition/subtraction by default, starts 50-400, steps 5-25, and a safe whole-number result range of 0-1000. Default PDFs are one student page plus one answer-key page. The extension boundary is deliberately seven total terms because wider rows failed print-safe proof inspection; no negative, decimal, fraction, division, alternating-rule or multiplication-pattern contract was introduced.

### Variable and validation checkpoint

- **Preserved, raw-runtime-only:** `questionCount`; `questionsPerPage`; `startingValue`/`startNumber`; `minStart`/`minimumStart`/`minimumValue`; `maxStart`/`maximumStart`/`maximumValue`; `sequenceStep`/`step`; `minStep`/`minimumStep`; `maxStep`/`maximumStep`; `minValue`/`minimumSequenceValue`; `maxValue`/`maximumSequenceValue`; `operationMode`/`operation`/`ruleType`; `selectedOperations`/`onlyOperations`; `selectedSteps`/`onlySteps`; seed; and PDF answer-key inclusion.
- **Task-scoped and consumed:** `visibleLength`/`shownTermCount`, `continuationCount`/`extensionCount`/`answerCount`; `sequenceLength`/`termCount`; `missingTermCount`/`missingCount`, `missingTermPlacement`/`missingPlacement`, `missingIndexes`/`missingPositions`; `includeExample`/`completedExample`/`example`. Examples remain additional, and every example alias uses the same safe page capacity.
- **Narrowed to demonstrated safe limits:** integer starts/results 0-1000; integer steps 1-100; add/subtract only; extension count 1-12 and one student page; rule count 1-18; missing-value count 1-20; task capacities 13/10/12 respectively; extension visible length 4-6 and total row length no more than 7; other sequences 5-7; one or two missing positions leaving at least three visible terms.
- Empty, duplicate, unsupported, mixed-valid/invalid or conflicting operation/step selections now throw. Decimal/zero/negative steps, decimal values, reversed ranges, unsafe density/width, unsupported counts, conflicting aliases, invalid example modes, and irrelevant missing-value controls also throw. Explicit missing indexes reject empty, duplicate, out-of-range, overlarge, insufficient-evidence and count/placement-conflict cases. No public Grade 4 customization family was registered.

### Verification and proof packet

- `scripts/testGrade4NumericPatterningBatch1.js`: 30 deterministic seeds per resource; same-seed failures 0; different-seed variation, exact balanced operations, duplicate prevention, structured truth, student/key parity, examples, pagination, variables and adversarial rejection pass.
- Related regressions pass: Grade 3 Numeric Patterning Batch 1; shared Numeric Patterning runtime (including Grade 2/3 isolation, task pagination and example behavior); Grade 3 Place Value Batch 2; Grade 3 Fraction Batch 6; Grade 3 Data Displays Batch 7; Grade 4 reconciliation preflight.
- Catalog audit remains Ready 104/104, Generated 213/213, Partial 5/5, Total331, with the seven established planned `pattern_word_problems` gaps only. No lifecycle status changed.
- Founder defaults: `review/grade-4-numeric-patterning-batch-1/founder-review/01_extend_the_pattern.pdf`, `02_identify_the_pattern_rule.pdf`, `03_find_the_missing_values.pdf`.
- Stress proofs: `review/grade-4-numeric-patterning-batch-1/stress/01_extend_maximum_density_and_width.pdf`, `02_extend_maximum_sequence_width.pdf`, `02_identify_largest_safe_terms.pdf`, `03_missing_multiple_positions.pdf`.
- Every proof page was rendered and visually inspected. Sequences fit on one line; targets and rule lines remain readable; examples are additional; student/key truth matches; and no clipping, overlap, footer pressure or unsafe density remains.

Applied founder-approved movement: each of the three exact IDs moved E to A, producing A14 / D10 / E1 / G23 / Total48. No other Grade 4 category changed.

## A resources held as complete

- Compact assessment/review: `g4_compare_fractions_quick_check`, `g4_compare_fractions_exit_ticket`, `g4_pattern_rule_quick_check`, `g4_multiplication_word_problem_quick_check`.
- Multiplication models/fluency: `g4_array_interpretation`, `g4_equal_groups_interpretation`, `g4_missing_factors`, `g4_multiplication_fact_fluency`, `grade4_multiplication_facts_word_problems`.
- Place-value forms: `g4_expanded_form_large_numbers`, `g4_standard_form_large_numbers`.

These 11 IDs require no implementation batch. Founder may approve proposed A after reviewing the preflight evidence; lifecycle status remains independent.

## G deferral lanes

### Exact duplicates

- `grade4_multiplication_facts_arrays` duplicates `g4_array_interpretation`.
- `grade4_multiplication_facts_equal_groups` duplicates `g4_equal_groups_interpretation`.
- `grade4_multiplication_facts_missing_factor` duplicates `g4_missing_factors`.
- `grade4_place_value_representation_expanded_form` duplicates `g4_expanded_form_large_numbers`.
- `grade4_place_value_representation_standard_form` duplicates `g4_standard_form_large_numbers`.
- `grade4_data_display_graphing_read_graph` and `g4_read_and_interpret_graphs` are byte-identical despite the latter title claiming interpretation; neither shows a graph. Both remain deferred pending a distinct display role.

### Low-value or overlapping review

- `grade4_addition_subtraction_facts_fact_family`, `grade4_addition_subtraction_facts_fact_fluency`, `grade4_addition_subtraction_facts_missing_addend`, `grade4_addition_subtraction_facts_related_subtraction`, `grade4_addition_subtraction_facts_ten_frame`, `grade4_addition_subtraction_facts_word_problems`.
- `grade4_multiplication_facts_skip_counting`.
- `grade4_place_value_representation_base_ten_blocks`.

Reconsider only if a distinct Grade 4 intervention, relationship or thousands-model lane is approved.

### Missing/disproportionate architecture

- Data: `grade4_data_display_graphing_complete_graph`, `grade4_data_display_graphing_graph_questions`, `grade4_data_display_graphing_graph_word_problems`, `grade4_data_display_graphing_interpret_data`, `grade4_data_display_graphing_match_data_to_graph`, plus the two read IDs above. Reconsider after a bounded Grade 4 display type and teacher role are approved; do not create a general graph engine.
- Fractions: `grade4_fraction_equivalence_fraction_word_problems` lacks a distinct role; `grade4_fraction_equivalence_match_equivalent_fractions` needs genuine candidate/match architecture.
- Planned gap: `grade4_patterning_and_algebra_pattern_word_problems` remains one of the seven established planned generator gaps.

Every proposed G ID has a documented reconsideration trigger. Founder approval of the preflight would move these rows into a documented defer lane only; it would not delete catalog records or change lifecycle status.

## Reconciliation scenarios

- Pre-Batch 1 baseline: A11 / D10 / E4 / G23 / Total48.
- Current after Batch 1 closeout: A14 / D10 / E1 / G23 / Total48.
- After B2 approval: A17 / D7 / E1 / G23 / Total48.
- After B3 approval: A20 / D4 / E1 / G23 / Total48.
- After B4 approval: A23 / D2 / E0 / G23 / Total48.
- After B5 approval: A25 / D0 / E0 / G23 / Total48.

These are planning scenarios, not applied movements. A final Grade 4 reconciliation ledger should be created only after founder approval of the inventory and initial categories.

## Founder decisions required

- Approve or revise the proposed A11/D10/E4/G23 baseline.
- Confirm the five duplicate anchor choices, especially which Equal Groups ID should survive.
- Confirm that Grade 4 data displays are deferred rather than forcing a new bar-graph system.
- Confirm full-practice Compare Fractions remains distinct from Quick Check/Exit Ticket.
- Approve the B5 bounded function-table layout before implementation.
- Confirm no Grade 4 Base Ten thousands model is required for launch.

## Verification and proof policy

- Preflight verification must check all 48 IDs exactly once, unique IDs, proposed counts, batch membership, D/E coverage, G rationales, Grade 2/3 closed totals, catalog totals, ready runtime health and absence of Grade 4 public customization.
- Future proof PDFs remain under batch-specific untracked `review/` folders and are never committed.
- Each implementation batch ends at founder review; reconciliation movement and commit occur only after approval.
- Current preflight creates no proof PDF and modifies no production, catalog, route, UI or renderer file.
