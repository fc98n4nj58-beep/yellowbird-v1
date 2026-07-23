# Grade 4 Founder Review Batch Plan

Date: 2026-07-22

Status: Batches 1, 2 and 3 are founder-approved and closed; later batches remain proposed. Grade 4 remains open and lifecycle statuses remain unchanged.

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
- Disposition: founder-approved; all three moved D to A. Split, blocked or deferred: none.
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

## Batch 2 founder-review checkpoint

Status: founder-approved and closed. Catalog lifecycle statuses remain unchanged.

Approved: `grade4_fraction_equivalence_compare_fractions`, `grade4_fraction_equivalence_fraction_number_line`, and `grade4_fraction_equivalence_shade_fraction_models`. Split, blocked or deferred: none.

### Completed-work and shared-family findings

- All three resources were classified **SHARED-FAMILY EXTENSION NEEDED**. Compare Fractions previously had only lower-structure same-denominator practice. The number-line and shade records used incompatible legacy array-returning generators and normalized into blank tasks. None was complete, reconciliation-only, duplicated, or dependent on new architecture.
- Grade 3 Batch 6 supplied the approved exact-integer comparison and full-width 0-to-1 number-line contracts. Grade 3 Batch 5 supplied the approved fraction-strip model and answer-key shading contract. Grade 1 and Grade 2 supplied the established fraction-family isolation and equal-parts regressions.
- The shared Grade 3 generator modules now select an exact resource profile. Grade 3 defaults remain unchanged; Grade 4 adds only resource-scoped denominator pools, duplicate namespaces, answer-state fields, copy, defaults and strict runtime validation. Existing fraction equation, number-line and fraction-strip renderers remain display-only. No new renderer, primitive, visual system, lifecycle movement or public customization family was introduced.

### Review contracts and public copy

| Resource | Title | Instruction | Default | Safe boundary verified |
| --- | --- | --- | --- | --- |
| `grade4_fraction_equivalence_compare_fractions` | Compare Fractions | Write >, <, or = to compare each pair of fractions. | 12 questions; denominators 2, 3, 4, 5, 6, 8, 10, 12; four `<`, four `>`, four `=` | 24 questions over two student pages; 12 per page; eight equal pairs |
| `grade4_fraction_equivalence_fraction_number_line` | Fractions on a Number Line | Write the fraction shown by the point on each number line. | 6 questions; 0-to-1 lines; denominators 2, 3, 4, 5, 6, 8, 10; interior targets | 12 questions over two student pages; tenths, endpoints and an additional completed example |
| `grade4_fraction_equivalence_shade_fraction_models` | Shade the Fraction | Shade each model to show the fraction. | 8 questions; fraction strips; denominators 2, 3, 4, 5, 6, 8, 10, 12; proper fractions | 8 questions plus an additional completed example; readable twelfth partitions |

All three use `Grade 4 • Math • Fractions`, include one student answer-key counterpart, and produce two-page default PDFs. Compare Fractions uses exact integer cross-products and reversal-safe duplicate prevention. Number-line truth stores the partition count, target index, displayed labels and endpoint policy; interior answers retain the partition denominator. Shade truth stores the requested numerator/denominator and separate student/key shaded-part counts.

### Variables and adversarial validation

- **Shared controls preserved:** deterministic worksheet seed; `questionCount`; `questionsPerPage`; `selectedDenominators`/`denominators`/`allowedDenominators`; `selectedFractions`/`fractions`; `includeExample`/`completedExample`/`example`; and PDF answer-key inclusion.
- **Compare and shade controls:** `selectedNumerators`/`numerators`; `minNumerator`/`minimumNumerator`; `maxNumerator`/`maximumNumerator`. Compare additionally supports `includeEqualPairs` and `equalPairs`. Shade supports strip-only `modelType`/`modelSet` and shade-task aliases.
- **Number-line controls:** `allowEndpointTargets`/`allowEndpoints`/`endpointPolicy`; identify-marked-fraction task aliases. Whole-number interval and independent numerator controls are deliberately unsupported for this 0-to-1 contract.
- Empty, duplicate, unsupported, mixed-valid/invalid or conflicting denominator, fraction, numerator, equality, endpoint and example aliases throw. Decimal or non-integer values, zero or negative denominators, improper/default endpoint fractions, insufficient comparison pools, reversed numerator ranges, unsupported modes/models, caller-supplied shading state, irrelevant family controls and unsafe page density also throw. Explicit selections never silently fall back to a safe default.

### Structured truth, tests and proofs

- `scripts/testGrade4StructuredFractionsBatch2.js`: 30 deterministic seeds per resource; same-seed failures 0; different-seed variation; exact 4/4/4 comparison balance; integer cross-products; reversal-safe uniqueness; partition/index/label truth; student/key shading parity; raw variable aliases; completed examples; maximum safe counts; adversarial rejection; Grade 3 default isolation; and default PDFs 2/2/2 all pass.
- Related regressions pass: Grade 3 Fraction Batch 6; Grade 3 Concrete Visual Batch 5; Grade 1 Fraction Family; Grade 2 Shade Equal Parts; Grade 4 Numeric Patterning Batch 1; Grade 4 reconciliation preflight; and the worksheet customization registry. Syntax checks and `git diff --check` pass.
- Catalog audit remains Ready 104/104, Generated 213/213, Partial 5/5, Total331, with the seven established planned `pattern_word_problems` gaps only. Lifecycle statuses remain Compare Fractions `ready`, Fractions on a Number Line `generated`, and Shade the Fraction `generated`.
- Founder defaults: `review/grade-4-structured-fractions-batch-2/founder-review/01_compare_fractions.pdf`, `02_fractions_on_a_number_line.pdf`, `03_shade_the_fraction.pdf`.
- Stress proofs: `review/grade-4-structured-fractions-batch-2/stress/01_compare_denominator_12_equal_density.pdf`, `02_compare_maximum_safe_count.pdf`, `03_number_line_denominator_10.pdf`, `04_number_line_endpoints_and_example.pdf`, `05_shade_denominator_12.pdf`, `06_shade_completed_example.pdf`.
- All 22 proof pages were rendered and visually inspected. Fractions, symbols, answer lines, labels, endpoint markers, tenths, twelfths, example panels and key shading remain readable, aligned and unclipped; student/key truth and pagination are intact.

Applied founder-approved movement: exactly these three resources moved D to A, producing A17 / D7 / E1 / G23 / Total48. Grade 4 remains open; no lifecycle status changed.

## Batch 3 founder-review checkpoint

Status: founder-approved and closed. Exactly the three Batch 3 resources moved D to A; reconciliation is A20 / D4 / E1 / G23 / Total48. All three catalog lifecycle statuses remain `generated`.

Review packet: `grade4_addition_subtraction_word_problems_addition_word_problem`, `grade4_addition_subtraction_word_problems_missing_addend_word_problem`, and `grade4_addition_subtraction_word_problems_subtraction_word_problem`. Split, blocked or deferred: none.

### Completed-work and shared-family findings

- All three exact IDs were classified **SHARED-FAMILY EXTENSION NEEDED**. They still used generic lower-grade number and copy defaults, produced eight-page default PDFs at three questions per student page, lacked a Grade 4 exact-ID truth adapter, and did not expose complete context/template/unknown-position state. None was already complete, reconciliation-only, duplicated, or dependent on a new renderer.
- Grade 3 Batch 4 supplied the reusable arithmetic-first story family, deterministic context/template scheduling, repetition controls, one-column work boxes, compact answer keys and additional completed examples. Batch 3 adds one shared Grade 4 adapter with exact resource roles, Grade 4 ranges, strict raw validation and conditional structured-field preservation. The renderer only receives supplied truth and never parses prose.
- The three roles remain distinct: Addition is total-unknown only; Missing Addend always solves a first or second addend from `known + missing = total`; Subtraction is non-negative difference/result unknown with balanced take-away and compare structures.

### Public copy, defaults and safe boundaries

| Resource | Title | Instruction | Default truth and range | Verified layout |
| --- | --- | --- | --- | --- |
| Addition | Addition Story Problems | Solve each addition story problem. Show your work. | 8 questions; addends 100-2500; totals 500-5000; four join-result and four combine-total | One column; 3/3/2 student pagination; three student pages plus two compact key pages |
| Missing Addend | Missing Addend Story Problems | Find the missing amount in each story problem. Show your work. | 8 questions; addends 100-2500; totals 500-5000; four first-addend and four second-addend unknowns | One column; 3/3/2 student pagination; three student pages plus two compact key pages |
| Subtraction | Subtraction Story Problems | Solve each subtraction story problem. Show your work. | 8 questions; minuends 500-5000; subtrahends 100-4000; non-negative differences; four take-away and four compare | One column; 3/3/2 student pagination; three student pages plus two compact key pages |

All three use `Grade 4 • Math • Addition & Subtraction`, a quiet full-width work box per question, no subtitle, concise one- or two-sentence stories, deterministic seeds, and exact student/key parity. Whole-number inputs are bounded at 0-10,000; defaults remain concentrated below the technical maximum. The founder-directed density correction caps student pages at three questions so four-digit computation, regrouping, checking and corrections have materially more room. Default student pagination is exactly 3/3/2, followed by two unchanged compact answer-key pages, for five pages total. The final student page retains the same calm three-slot geometry with its unused third slot left open rather than stretching two work areas. The safe boundary remains 16 questions, now distributed 3/3/3/3/2/2 across six student pages, followed by three compact answer-key pages, without shrinking type or workspace.

### Structured truth and language contract

- Every item stores operation, operands, total or difference, unknown position, exact answer, operation family, story type, context ID, template ID, prompt, answer state and duplicate signature. Addition stores `firstAddend + secondAddend = total`; Missing Addend additionally stores `knownAddend`, `missingValue` and the exact first/second hidden role; Subtraction stores `minuend - subtrahend = difference`.
- Eight Grade 4 templates per resource provide join/combine, start/change unknown, and take-away/compare variation. Eight names and ten classroom-safe objects rotate with a hard maximum of two appearances each, no repeated name/object pair, and no name, object or template reuse within the preceding two questions.
- Pronoun and noun agreement, punctuation, direct-question framing and prompt lengths were checked across 30 deterministic seeds. No multi-step, mixed-operation, negative, decimal, fraction, estimation or prose-reconstruction behavior is present.

### Variable and adversarial checkpoint

- **Preserved, raw-runtime-only:** `questionCount` (1-16); `questionsPerPage` (1-3, with 4 rejected); seed; PDF answer-key inclusion; `includeExample`/`completedExample`/`example` (additional, aliases must agree); `selectedNumbers`/`onlyNumbers`; `selectedContexts`/`contexts`; and `selectedObjects`/`onlyObjects`.
- **Operand and total aliases:** `minA`/`minimumFirstOperand`/`minimumOperand`; `maxA`/`maximumFirstOperand`/`maximumOperand`; `minB`/`minimumSecondOperand`; `maxB`/`maximumSecondOperand`; `minTotal`/`minimumTotal`; `maxTotal`/`maximumTotal`. Addition and Missing Addend consume total controls; Subtraction rejects both total controls because its exact role has no total target.
- **Task-scoped controls:** `selectedStoryTypes`/`storyTypes` accepts join/combine for Addition, start/change for Missing Addend, and take-away/compare for Subtraction. Missing Addend also accepts `missingPosition`/`missingAddendPosition`/`missingPartPosition`/`unknownPosition`; mixed remains the default and conflicting role aliases throw.
- **Not supported:** caller-selected operation, regrouping mode, workspace/layout overrides, sentence-template overrides, or caller-owned prompt/answer/truth fields. No Grade 4 public customization family was registered.
- Decimal or negative values, values above 10,000, empty or duplicate explicit lists, mixed valid/invalid or conflicting aliases, reversed/impossible ranges, excessive counts/density, invalid context/object/type IDs, insufficient context capacity, conflicting missing positions, invalid example modes, impossible non-negative subtraction and supplied answer-state overrides all throw. Explicit invalid input never falls back silently.

### Tests and proofs

- `scripts/testGrade4AdditionSubtractionStoriesBatch3.js`: 30 deterministic seeds per resource; same-seed failures 0; different-seed variation; exact 8-question defaults; role boundaries; arithmetic-before-prose truth; answer-state and compact-key parity; balanced story modes; repetition caps; pair/template uniqueness; pronoun agreement; selectors/aliases; additional examples; exact 3/3/2 defaults; 16-question 3/3/3/3/2/2 pagination; materially larger work boxes with prompt/box/footer clearance; calm final-page geometry; explicit four-per-page rejection; adversarial rejection; Grade 2/3 isolation; lifecycle stability; and absence of public customization all pass.
- Founder defaults: `review/grade-4-addition-subtraction-stories-batch-3/founder-review/01_addition_story_problems.pdf`, `02_missing_addend_story_problems.pdf`, and `03_subtraction_story_problems.pdf`.
- Stress proofs: `review/grade-4-addition-subtraction-stories-batch-3/stress/01_addition_largest_safe_values.pdf`, `02_addition_maximum_count_and_density.pdf`, `03_missing_addend_positions_and_example.pdf`, `04_subtraction_compare_largest_values.pdf`, and `05_subtraction_maximum_count_compact_key.pdf`.
- After the density correction, all 48 proof pages were rendered and visually inspected. The three default PDFs are five pages each; work boxes are materially taller; 3/3/2 student pagination, calm final pages and compact two-page keys remain consistent; story wrapping, example treatment and footers remain readable and unclipped; contexts vary; compare direction is unambiguous; and no overlap, tiny text or footer pressure is present. Arithmetic truth, public copy, ranges, variables, lifecycle statuses and reconciliation remain unchanged.

Applied founder-approved movement: each of these three exact IDs moved D to A, producing A20 / D4 / E1 / G23 / Total48. No other Grade 4 row changed category, and Grade 4 remains open.

## Batch 4 closeout

Status: founder-approved and closed. Reconciliation is A23 / D2 / E0 / G23 / Total48. All three catalog lifecycle statuses remain `generated`; no public Grade 4 customization family was registered. Grade 4 remains open for Batch 5.

Review packet: `grade4_place_value_representation_number_line_identify`, `grade4_place_value_representation_number_word_match`, and `grade4_place_value_representation_compare_numbers`. Split, blocked or deferred: none.

### Completed-work, inheritance and role findings

- Number Line Identification was classified **SHARED-FAMILY EXTENSION NEEDED**. Its inherited output still used the stale `Number Line — Grade 4` title, instructional prose, an internal-skill footer, ten generic 0-to-10 models spread over four PDF pages, and incomplete bounds/interval/target truth. The Grade 2/3 whole-number number-line generator, full-width layout and answer-under-marker renderer were sound and are now selected through an exact-ID Grade 4 adapter.
- Number Word Match was classified **SHARED-FAMILY EXTENSION NEEDED**. The current generator was a writing task rather than matching, formatted only values below 1,000, returned digits for thousands, exposed stale copy/internal footer text and did not retain numeral/word/direction answer state. The honest default role is now numeral-to-word writing under the public title `Write Numbers in Words`; the catalog ID remains unchanged. Supported reverse writing uses `Write the Numeral`. No matching mode or renderer was added.
- Compare Numbers was classified **NARROW CORRECTION NEEDED**. It already stored left/right values and the symbol, but inherited 0-to-999 values, stale copy/internal footer text, high-density generic layout, unbalanced random results, and no reversal-safe duplicate or complete equality state. The shared comparison generator now selects an exact-ID Grade 4 balanced pool and the existing comparison-symbol renderer.
- Grade 1-3 generator defaults remain unchanged. The extensions are exact-ID scoped; the renderer displays supplied number-line, number-word or comparison truth and does not reconstruct arithmetic or wording.

### Public copy, Grade 4 defaults and safe boundaries

| Resource | Title and instruction | Default | Verified safe boundary and Grade 3 distinction |
| --- | --- | --- | --- |
| Number Line Identification | `Identify Numbers on a Number Line`; `Write the number shown by the point on each number line.` | 6 questions; 6 per page; values 1,000-10,000; ten intervals; safe intervals 10, 25, 50, 100, 250, 500; endpoints allowed | 12 questions over two student pages; interval 500 at 10,000 and interval 10 with five-digit labels remain readable. All labels and key answers at 1,000+ display thousands separators while raw truth remains numeric. Grade 3 retains its smaller interval/range profile. |
| Number Words | `Write Numbers in Words`; `Write each number in words.` | 12 questions; 12 per page; numeral-to-word; values 1,000-9,999; two aligned columns of six | 20 questions over two student pages at the standardized 12-item page capacity; formatter supports 0-10,000, commas, project-standard hyphens and no “and”. Reverse direction uses the same two-column capacity with exact row alignment. Grade 3 remains capped at 999. |
| Compare Numbers | `Compare Numbers`; `Write >, <, or = to compare each pair of numbers.` | 30 questions; 30 per page; values 1,000-10,000; three aligned columns of ten; exact 10/10/10 `<`/`>`/`=` balance | The 30-item standardized capacity is the maximum; incompatible balanced counts and densities above 30 throw. Grade 3/lower shared outputs retain their former ranges and layouts. |

All three use `Grade 4 • Math • Place Value`, no subtitle, deterministic seeded generation, stored truth, duplicate prevention and student/key parity. Each default is exactly one student page plus one answer-key page. Number Words uses two equal-height columns of six with long response rules and measured prompt-to-line alignment; its compact answer key remains readable. Compare Numbers uses three equal-height columns of ten with a print-safe symbol target. Completed examples supplement rather than replace the requested student questions and may therefore add pages. Number Line remains unchanged by this restoration.

### Structured truth and variable contract

- Number lines store minimum/maximum, interval, tick count, target index/value, endpoint policy, displayed labels, represented value, response target, answer state and duplicate signature. Every answer satisfies `targetValue = minValue + targetIndex × interval`; the visual consumes the same target index and value.
- Number words store represented value, comma-formatted numeral, exact project-style number word, task direction, response type/target, answer state and duplicate signature. Zero placeholders were directly verified at 1,000, 1,005, 1,040, 4,008 and 10,000.
- Comparisons store exact left/right integers, expected symbol, comparison result, equality state, response target, answer state and a reversal-safe signature. Default non-example items are exactly ten `<`, ten `>` and ten `=`; reversed unequal pairs cannot recur.
- **Preserved, raw-runtime-only:** `questionCount`; `questionsPerPage`; minimum aliases `minValue`/`minA`/`minimumValue`/`minimumNumber`; maximum aliases `maxValue`/`maxA`/`maximumValue`/`maximumNumber`; selected-value aliases `selectedNumbers`/`selectedValues`/`onlyNumbers`; `includeExample`/`completedExample`/`example`; deterministic worksheet seed; and PDF answer-key inclusion.
- **Number-line controls:** `allowedIntervals`/`intervals`/`selectedIntervals`/`numberLineIntervals`; fixed `tickCount: 10`; `allowEndpointTargets`/`endpointPolicy`; and identify-only `taskMode`. **Number-word controls:** `numberWordMode`/`numberWordDirection`/`mode` for `numeral_to_word` or `word_to_numeral`. **Comparison controls:** `includeEqualPairs`/`equalPairs`, with exact three-way balance when enabled and exact two-way balance when disabled.
- **Capacity contract:** maximum counts are 12/20/30 and maximum per-page densities are 6/12/30 for line/word/compare. Number Words uses the same 12-item page capacity in both directions; Compare Numbers requires a count compatible with its balanced comparison contract and rejects counts or per-page density above 30 rather than clamping. The whole-number range remains 0-10,000, with Grade 4 defaults beginning at 1,000; number-line intervals remain limited to the six print-safe values; number-line task remains identification-only; and no genuine matching mode is supported. None is publicly registered as customization.

### Adversarial, test and proof checkpoint

- Empty/duplicate selections, decimals, negatives, values above 10,000, reversed ranges, conflicting aliases, mixed valid/invalid values, unsafe counts/densities, insufficient unique pools, invalid examples and caller-owned prompt/answer/truth fields throw. Number lines additionally reject zero/negative/decimal/unsupported or non-dividing intervals, non-10 tick counts, conflicting endpoint controls and unsupported task modes. Number words reject malformed lists and matching/unknown directions. Comparisons reject unsupported equality controls, unbalanced counts and pools unable to supply balanced unique pairs. Explicit invalid input never falls back silently.
- `scripts/testGrade4PlaceValueRepresentationsBatch4.js`: 30 deterministic seeds per resource; same-seed failures 0; different-seed variation; exact public copy and defaults; numeric number-line truth with comma-formatted display; all six intervals and 10,000 endpoints; fixed number-word alignment geometry; exact two-column 6/6 default pagination; long writing rules; exact 10/10/10 comparison balance in three columns of ten; student/key parity; variables; aliases; safe reverse direction; additional examples; default PDFs 2/2/2; maximum PDFs 4/4/2; explicit Number Words density 13 and Compare Numbers density/count 31 rejection; adversarial rejection; Grade 2/3 isolation; lifecycle stability; and no public customization all pass.
- Related regressions pass: Grade 3 Place Value Batch 2; Grade 3 Final Reconciliation Base Ten; Grade 1 Number Representation; Grade 2 Category D low-risk place-value family; Grade 2 Comparison; Grade 4 Numeric Patterning Batch 1; Grade 4 Structured Fractions Batch 2; Grade 4 Story Problems Batch 3; Grade 4 reconciliation preflight; and the worksheet customization registry. Changed-JavaScript syntax checks and `git diff --check` pass.
- Catalog audit remains Ready 104/104, Generated 213/213, Partial 5/5, Total331, Ready failures 0, with only the seven established planned `pattern_word_problems` gaps. No lifecycle status changed.
- Founder defaults: `review/grade-4-place-value-batch-4/founder-review/01_identify_numbers_on_a_number_line.pdf`, `02_write_numbers_in_words.pdf`, and `03_compare_numbers.pdf`. Nine stress PDFs cover largest/smallest intervals, endpoints and an example, zero placeholders and 10,000, long words, reverse direction, equality/zero-placeholder comparisons, standardized 30-item density and a comparison example.
- The same 12 proof PDFs were regenerated for this restoration and all 30 pages were rendered and visually inspected. All four Number Line PDFs remained render-identical to the approved proofs. Number Words shows exact two-column 6/6 alignment, equal long response rules, safe wrapped reverse prompts and readable one-page default keys. Compare Numbers shows exact three-column 10/10/10 geometry, centered symbol targets and readable comma-formatted values through `10,000` on both student and key pages. Examples remain additional and create extra pages without reducing the 12 or 30 requested questions. No clipping, overlap, baseline drift, tiny type or footer pressure was found.

Applied founder-approved movement: Number Line Identification moved D to A, Number Words moved D to A, and Compare Numbers moved E to A. The result is A23 / D2 / E0 / G23 / Total48. No other Grade 4 row changed category.

## Batch 5 closeout

Status: founder-approved and closed. Compare Equations moved D to A; Function Table moved D to G. Reconciliation is A24 / D0 / E0 / G24 / Total48. Both catalog lifecycle statuses remain `generated`; no Grade 4 public customization family was registered. Grade 4 final closeout remains separate.

Exact IDs resolved:

- `grade4_addition_subtraction_facts_equation_match`
- `grade4_patterning_and_algebra_function_table`

### Completed-work and role decisions

- **Equation Match — SHARED-FAMILY EXTENSION NEEDED and implemented.** The inherited Grade 4 output was not a matching or relational task: it displayed isolated equations such as `7 + 7 = __` under stale internal copy. The founder-approved Grade 3 equality-comparison generator, comparison target, fixed-row layout, answer-key path and deterministic pool supplied a safe shared base. The exact-ID Grade 4 adapter now uses the honest title `Compare Equations` and asks students to write `=` or `≠` between two stored expressions. It is distinct from Compare Numbers because students reason about expression values, distinct from fluency because neither side is an isolated answer target, and distinct from missing-addend work because no operand is unknown.
- **Function Table — NEW ARCHITECTURE NEEDED and deferred.** The current generator produces sentence prompts such as `Function table: input 5, rule Add 4 each time, output = __`; it has no input/output headers, table rows, missing-cell state, answer state, unique signature or table renderer. Grade 3 explicitly deferred the same family. Batch 1 `Find the Missing Values` is not a duplicate: it shows one number sequence per rule and students restore missing terms. A genuine Function Table would instead show multiple input/output rows under a visible rule and could naturally vary missing inputs and outputs. That role is instructionally distinct, but the repository has no approved input-output table renderer to inherit. No sentence-only pseudo-table, second renderer or invented complexity was added.

### Family-consistency correction

- The initial Grade 4 one-column layout was rejected because it left excessive unused space and deviated from the approved Grade 1-3 Equation Match family.
- The subsequent 12-question three-column by four-row correction was also rejected as under-dense. Exact-family comparison alone was insufficient: Grade 1-3 Equation Match establishes the relational visual language, while the closest approved Grade 4 task/layout class is Compare Numbers at 30 questions in three columns of ten.
- Grade 4 now inherits the exact family's sequential fill, equal-height aligned rows, centred comparison-symbol target, fixed expression spacing and mirrored key while adopting the denser safe Grade 4 comparison-class capacity. The Grade 4-specific geometry uses measured fixed 56.5-point expression zones, a 19-point number gutter with 11-point number labels, and a compact centred target. Expression text remains Source Sans 3 at 12 points; supplied and generated boundary expressions fit without wrapping, clipping or type reduction, and two-digit numbers remain on one line.
- Before implementing or approving a worksheet, compare both the nearest exact family and the nearest approved task/layout class. Preserve the densest safe established contract unless a documented instructional or print-safety reason requires otherwise.
- Arithmetic truth, variables, deterministic generation, public copy and both lifecycle statuses remain unchanged. Function Table remains deferred.

### Grade 4 Equation Match contract

- Public copy: `Compare Equations`; `Write = or ≠ to compare each pair of equations.`; footer `Grade 4 • Math • Addition & Subtraction`.
- Default: 30 questions, one fixed-row student page and one mirrored answer-key page; three sequential columns of ten aligned rows; exact 15 `=` and 15 `≠`; exactly ten addition/addition, ten subtraction/subtraction and ten addition/subtraction expression pairs. Each template contains five equal and five unequal pairs.
- Difficulty: default expression values 100-1,000, compared with Grade 3 values 0-100. Whole-number results may be selected through 2,000. Addition and subtraction only; no multiplication, division, negative default result, decimal or multi-step rule.
- Maximum: 60 questions with 30 per page, producing two 3-by-10 student pages and two mirrored key pages. Completed examples are additional; a dedicated full-width strip sits above the unchanged 3-by-10 question grid, so the 30-question example PDF remains one student page plus one key page.
- Structured truth: each item stores both expression strings, both operations, both operand arrays, both calculated values, expected relation, equality state, response target, reversal-safe canonical signature and complete answer state. The generator owns arithmetic and equality; the renderer displays supplied truth only.
- Uniqueness: equality pairs are genuinely equal, inequality pairs differ, and the canonical sorted-expression signature prevents duplicate or reversed pair leakage.

### Variable contract and adversarial checkpoint

- **Preserved, raw-runtime-only:** `questionCount` (1-60); `questionsPerPage` (1-30); `minimumResult`/`minResult`/`minimumValue` (0-1,999); `maximumResult`/`maxResult`/`maxTotal`/`maximumTotal`/`maximumValue` (1-2,000); `includeEqualPairs`; `equalPairs`/`equalityCount`; `operationMode`/`mode`; `selectedOperations`/`operations`; `includeExample`/`completedExample`/`example`; deterministic seed; and render-time answer-key inclusion.
- Operations normalize only to addition, subtraction or mixed. Equality aliases must agree. Mixed valid/invalid aliases, reversed or decimal ranges, unsupported operations, unsafe counts or densities, impossible uniqueness pools, invalid example controls, operand selectors, selected-number selectors, relation overrides, expression strings and caller-owned prompt/answer/answer-state/signature truth throw. No invalid value silently clamps or falls back.
- Public customization: none. Operand selection is intentionally not supported because the previous generic inputs bypassed relational structured truth.

### Duplicate and distinction findings

- `grade4_patterning_and_algebra_extend_pattern`: students extend a visible sequence; known rule structure is implicit in the sequence.
- `grade4_patterning_and_algebra_identify_pattern_rule`: students name the operation and amount shown by a complete sequence.
- `grade4_patterning_and_algebra_missing_value_pattern`: students restore missing terms in one visible sequence; no table is shown.
- Proposed Function Table role: students use a visible rule across several input/output rows and complete missing cells. This is naturally distinct from all three Batch 1 resources, but it cannot be honestly delivered through the current sentence renderer. Deferral is safer than forcing a duplicate-looking pseudo-table or introducing unapproved table architecture.

### Test and proof checkpoint

- `scripts/testGrade4EquationMatchFunctionTableBatch5.js` passes 30 deterministic Equation Match seeds with same-seed failures 0, cross-seed variation, exact 15/15 default truth, exact 10/10/10 operation-pair distribution, complete structured truth, canonical reversal suppression, student/key parity, variable aliases, examples, 60-item maximum pagination, adversarial rejection, Grade 1-3 exact-family isolation, Grade 4 Compare Numbers layout-class consistency, Batch 1 isolation, lifecycle stability, no public customization and the Function Table architecture-deferral evidence.
- Related regressions pass: Grade 1 Equation Match; Grade 2 Equation Match; Grade 3 Equation Match and Addition/Subtraction Batch 3; Grade 4 Numeric Patterning Batch 1; Grade 4 Structured Fractions Batch 2; Grade 4 Story Problems Batch 3; Grade 4 Place Value Batch 4; Grade 4 reconciliation preflight; and the worksheet customization registry. Changed-JavaScript syntax checks and `git diff --check` pass.
- Catalog audit remains Ready 104/104, Generated 213/213, Partial 5/5, Total331, Ready failures 0, with only the seven established planned `pattern_word_problems` gaps. Both Batch 5 lifecycle statuses remain `generated`.
- Proof generator: `scripts/generateGrade4EquationMatchFunctionTableBatch5Proofs.js`. Proof location: `review/grade-4-equation-function-batch-5/`. One founder-default PDF and five stress PDFs cover largest safe values/expressions, mixed operation/equality balance, addition-only and subtraction-only modes, a completed example, and the 60-question maximum. The six PDFs contain 14 pages total.
- All 14 corrected proof pages were rendered and visually inspected. Every normal-capacity student and key page uses three aligned columns with ten equal-height rows. Fixed expression zones keep comma-formatted four-digit values on one line at 12 points; centred relation targets, completed-example strip, continuous numbering and footers remain readable and unclipped. The 60-question proof repeats the same 3-by-10 geometry across two student and two key pages. No overlap, staggered rows, tiny type, footer pressure or excessive default-page whitespace remains. Only Equation Match receives proofs; no Function Table placeholder is generated.

Founder-approved movement applied: Compare Equations alone moved D to A and Function Table alone moved D to G. Reconciliation is A24 / D0 / E0 / G24 / Total48. Grade 4 is not yet marked closed.

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
- After Batch 1 closeout: A14 / D10 / E1 / G23 / Total48.
- After Batch 2 closeout: A17 / D7 / E1 / G23 / Total48.
- After Batch 3 closeout: A20 / D4 / E1 / G23 / Total48.
- Current after Batch 4 closeout: A23 / D2 / E0 / G23 / Total48.
- After Batch 5 closeout: A24 / D0 / E0 / G24 / Total48.

Batch 1-5 movements are applied. Grade 4 final closeout remains a separate task.

## Founder decisions required

- Approve or revise the proposed A11/D10/E4/G23 baseline.
- Confirm the five duplicate anchor choices, especially which Equal Groups ID should survive.
- Confirm that Grade 4 data displays are deferred rather than forcing a new bar-graph system.
- Revisit Function Table only after approving a shared input/output-table contract with visible rule labels, structured rows and missing cells, deterministic truth, safe pagination, and mirrored answer keys.
- Confirm no Grade 4 Base Ten thousands model is required for launch.

## Verification and proof policy

- Preflight verification must check all 48 IDs exactly once, unique IDs, proposed counts, batch membership, D/E coverage, G rationales, Grade 2/3 closed totals, catalog totals, ready runtime health and absence of Grade 4 public customization.
- Future proof PDFs remain under batch-specific untracked `review/` folders and are never committed.
- Each implementation batch ends at founder review; reconciliation movement and commit occur only after approval.
- The original preflight created no proofs or production changes. Batch 5 now has the bounded Equation Match implementation and untracked founder-review proofs recorded above; no catalog record, route, UI, renderer or public customization was changed.
