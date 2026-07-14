# Grade 1 Founder Review Reconciliation

Date: 2026-07-14

Scope: founder-approval and implementation reconciliation; catalog readiness and promotion are tracked separately

## Verdict

The complete Grade 1 inventory contains **49 resource candidates**: 14 ready, 1 partial, 33 generated/internal, and 1 planned. Thirty-two resources meet the `COMMITTED + FOUNDER APPROVED` gate, Category B is empty after the final promotion gate, and seventeen are explicitly held, legacy, or deferred. Categories C, D, E, and F are also empty.

These totals revise the first reconciliation. That pass under-recorded current-sprint approvals by requiring a second explicit approval statement after already-approved proof packets had produced approved commits. The corrected scan accepts the Project Lead's sprint correction, approved reduced recheck packets, proof-review outcomes, and the approval-gated commits themselves as valid evidence. It does not require duplicate approval evidence.

Grade 1 founder review remains closed, and its final operational promotion gate is complete. There are no unresolved Grade 1 founder proofs, promotion gates, runtime consolidations, design corrections, untouched review items, or founder-note conflicts. The next founder-review grade is Grade 2.

## Founder review source

Authoritative source:

- `/Users/davidbirnie/Desktop/Project Yellowbird/G1 Review.csv`
- Modified 2026-07-10 07:01 local time; 12 Grade 1 rows; every row is marked `Reviewed`; recommendation text is populated.
- The repository checklist at `review/grade1-founder-notes-implemented/founder-note-checklist.md` names this exact CSV as its source.

Secondary, non-authoritative source:

- `review/worksheet-founder-review/worksheet-review-index.csv`
- Modified 2026-07-10 06:17 local time; its Grade 1 rows have blank founder-note fields and `not_reviewed` status. It is the generated packet index, not the completed acceptance sheet.

The populated external CSV is newer and fuller, so there is no source ambiguity. It was read but not modified.

## Corrected approval evidence rules

A resource is founder-approved when any one authoritative approval chain is present:

- the populated founder CSV explicitly approves the resource;
- source-of-truth docs explicitly record approval;
- a founder-reviewed proof packet or reduced recheck packet was followed by Project Lead approval;
- the implementation commit was created only after that founder approval; or
- the current correction directive records that the representative sprint PDFs were approved before the named commit.

Approval, implementation, promotion, and public customization are separate dimensions. A resource can therefore be founder-approved and committed while still generated/internal or partial. `g1_write_the_numeral_to_50` followed that sequence: founder approval and implementation preceded this separate promotion checkpoint.

## Scope and counting rules

- Inventory source: all items whose `grades` includes `grade1` in `data/worksheetCatalog.master.json`, cross-checked with `config/worksheetCatalog/grade1.js` and the Grade 1 Exit Ticket declaration.
- Count: **49** (48 worksheets and 1 Exit Ticket).
- Catalog state: **14 ready, 1 partial, 33 generated/internal, 1 planned**.
- The 12 founder CSV rows cover ready worksheets only. They do not cover the Grade 1 Exit Ticket, partial resources, or generated/planned candidates.
- `data/worksheetCatalog.master.json` currently has 331 actual items, while its embedded `summary` is stale (`totalCount: 312`) and the prior project context says 330. The audit reads the actual array and reports 331. The extra current item is the now-promoted `g1_write_the_numeral_to_50`. This metadata discrepancy does not change the 49-item Grade 1 count, but the summary should be rebuilt in a later authorized catalog-maintenance task.

## Classification totals

| Classification | Count | Meaning in this scan |
| --- | ---: | --- |
| A. Committed + Founder Approved | 32 | Founder proof is approved, implementation is committed, and no founder correction remains; catalog readiness is tracked separately. |
| B. Founder Approved + Awaiting Promotion | 0 | The final Grade 1 promotion gate is complete. |
| C. Implemented + awaiting founder proof | 0 | No resources remain in this classification after the founder-approved Grade 1 fraction checkpoint. |
| D. Awaiting variable/runtime consolidation | 0 | The reviewed Grade 1 families are already consolidated; other gaps are proof, design, or untouched work. |
| E. Awaiting design correction | 0 | No resources remain in this classification after the approved Addition on a Number Line correction. |
| F. Untouched / not yet reviewed | 0 | Every Grade 1 candidate now has an explicit approval, promotion-gate, or deferral disposition. |
| G. Intentionally deferred | 17 | A product decision explicitly holds, supersedes, or keeps the entry as legacy/internal or outside the active review scope. |
| **Total** | **49** |  |

### Correction summary

The earlier reconciliation correction changed ten rows:

- C -> A: `g1_subtraction_facts_within_20`, `g1_missing_addends_within_20`, `g1_compare_numbers_to_20`, `g1_number_word_match_to_50`, `grade1_place_value_representation_base_ten_blocks`, and `g1_ten_frame_addition_within_10`.
- C -> B: `g1_write_the_numeral_to_50`.
- C -> A: `grade1_patterning_and_algebra_extend_pattern`, `grade1_patterning_and_algebra_missing_value_pattern`, and `grade1_patterning_and_algebra_identify_pattern_rule`.

This approved closure checkpoint adds four C -> A corrections: `grade1_multiplication_facts_arrays`, `grade1_multiplication_facts_equal_groups`, `grade1_multiplication_facts_skip_counting`, and `grade1_place_value_representation_expanded_form`.

This approved Addition on a Number Line checkpoint adds one E -> A correction: `g1_addition_on_number_line_to_20`.

This approved relational-equations checkpoint adds one F -> A correction: `grade1_addition_subtraction_facts_equation_match`. Its distinct-use gate also moves two deliberate near-duplicate deferrals from F -> G: `grade1_addition_subtraction_facts_missing_addend` and `grade1_place_value_representation_compare_numbers`.

This approved Grade 1 data-reading checkpoint adds three F -> A corrections: `grade1_data_display_graphing_read_graph`, `grade1_data_display_graphing_interpret_data`, and `grade1_data_display_graphing_graph_questions`.

This approved Grade 1 data-construction checkpoint adds three F -> A corrections: `grade1_data_display_graphing_complete_graph`, `grade1_data_display_graphing_match_data_to_graph`, and `grade1_data_display_graphing_graph_word_problems`.

This Grade 1 fraction implementation checkpoint moves four resources F -> C pending founder proof: `grade1_fraction_equivalence_shade_fraction_models`, `grade1_fraction_equivalence_match_equivalent_fractions`, `grade1_fraction_equivalence_compare_fractions`, and `grade1_fraction_equivalence_fraction_word_problems`. It moves `grade1_fraction_equivalence_fraction_number_line` F -> G as an explicit Grade 2+ deferral. No resource is promoted or founder-approved by this checkpoint.

This founder-approved Grade 1 fraction commit checkpoint adds four C -> A corrections: `grade1_fraction_equivalence_shade_fraction_models`, `grade1_fraction_equivalence_match_equivalent_fractions`, `grade1_fraction_equivalence_compare_fractions`, and `grade1_fraction_equivalence_fraction_word_problems`. Their catalog status remains `generated`; promotion remains a separate decision.

This Grade 1 founder-review closure checkpoint moves the final five F resources to G with specific dispositions:

- `grade1_addition_subtraction_facts_word_problems`: duplicate/weakly distinguished generic task; the approved controlled addition, subtraction, and missing-addend word-problem resources already own the Grade 1 use cases.
- `grade1_multiplication_facts_missing_factor`: later-grade abstract factor task; factors 2–10 and products to 100 conflict with Grade 1's drawing-led equal-groups boundary and total no greater than 10.
- `grade1_multiplication_facts_word_problems`: current model-free output exceeds Grade 1 equal-groups limits; any future viable story mode belongs inside the approved Equal Groups family rather than an isolated generic architecture.
- `grade1_place_value_representation_number_line_identify`: direct duplicate of the stronger approved `g1_number_line_identify_to_20` family, with no separate teacher use.
- `g1_compare_numbers_to_20_exit_ticket`: ready and format-distinct, but intentionally outside the founder worksheet packet; it remains in the validated Exit Ticket lane and is removed from active Grade 1 worksheet review.

That closure checkpoint made no catalog status changes. No deferred item is promised future implementation.

This final Grade 1 promotion checkpoint moves `g1_write_the_numeral_to_50` from B -> A after its shared runtime, current proofs, metadata, public detail/preview/PDF flow, deterministic output, answer key, and Grade 2+ isolation passed. Its catalog status changes from `partial` to `ready`; no Category G record changes.

| Classification | Before closure | Before relational checkpoint | Before final closure | Closed | Post-promotion |
| --- | ---: | ---: | ---: | ---: | ---: |
| A | 15 | 20 | 31 | 31 | 32 |
| B | 1 | 1 | 1 | 1 | 0 |
| C | 4 | 0 | 0 | 0 | 0 |
| D | 0 | 0 | 0 | 0 | 0 |
| E | 1 | 0 | 0 | 0 | 0 |
| F | 19 | 19 | 5 | 0 | 0 |
| G | 9 | 9 | 12 | 17 | 17 |
| **Total** | **49** | **49** | **49** | **49** | **49** |

Category C is now empty. The founder-approved Grade 1 fraction family joins the earlier Arrays, Equal Groups, Skip Counting, and Expanded Form work in Category A without changing catalog status.

Category E is now empty. Addition on a Number Line uses the founder-approved addition model and full-width 0–20 geometry while remaining `partial`; promotion is a separate decision.

The Grade 1 relational-equations resource is founder-approved with the final `Equal or Not Equal?` copy, deterministic two-response completed mode, and 12-question two-column layout while remaining `generated`. Missing Addend and Compare Numbers are now intentionally deferred in Category G as near duplicates of their approved canonical resources; they must not be implemented without a new distinct-use decision.

Category F is now empty. The final five candidates have explicit deferral or format-scope decisions recorded above. Category G is not a future build queue and does not delay launch.

The three Grade 1 data-reading resources are founder-approved with distinct 6/6/8-question tasks, a shared one-to-one pictograph, a validated 100-topic and 100-scenario registry, aligned response lines, completed-Question-1 mode, and student/answer-key parity. They remain `generated`; promotion and public topic controls require separate decisions.

The three Grade 1 data-construction resources are founder-approved with distinct construction, matching, and one-fact application tasks; shared full and compact pictograph rendering; category-specific application language; deterministic unsafe-context rejection; and student/answer-key parity. They remain `generated`; promotion and public controls require separate decisions.

The Grade 1 fraction family now has one founder-approved deterministic structured truth model and two shared renderer variants. Shade Equal Parts, One Half and Two Fourths, Compare Fair Shares, and Share Fairly remain `generated` and are Category A. Fraction Number Line remains `generated` but is Category G and does not route into the new Grade 1 fraction runtime.

## Grade 1 completion matrix

Abbreviations: `live` = Addition Facts public prototype; `runtime-only` = options work internally but no public controls; `none` = no approved customization contract; `N/A` = not applicable. Review numbers are from the populated founder CSV.

| Review # | Resource ID | Resource title | Catalog status | Founder review status | Implementation status | Variable/runtime status | Public customization status | Promotion status | Primary classification | Outstanding action | Evidence / commit |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `g1_addition_facts_within_20` | Addition Facts Within 20 | ready | Approved; later customization controls recorded as approved prototype | Committed controlled family and public prototype | Mature: 1–60, 0–20 default/override, selected values, multi-page, Q1 example | live | none | **A** | Keep as sole prototype; no new UI | `ffc60c7`, `776fcb7`, `8777856` |
| — | `g1_addition_on_number_line_to_20` | Addition on a Number Line to 20 | partial | Founder approved the corrected addition model and full-width recheck | Committed controlled addition-number-line runtime and Grade 1-specific full-width layout | Mature: 6 questions, 0–20 line, start/jump/landing model, range selection, Q1 example, answer-key parity | runtime-only | partial/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | `docs/grade-1-addition-number-line-preflight.md`; approved before `feat: fix grade 1 addition number line` |
| — | `grade1_addition_subtraction_word_problems_addition_word_problem` | Addition Word Problem — Grade 1 | generated | Explicitly not promoted; overlaps reviewed canonical resource | Generic runtime only | Generic, no separate controlled contract | none | intentionally held | **G** | Retain as legacy/internal unless a distinct use case is approved | Milestone 6 Batch 10 hold |
| 2 | `g1_addition_word_problems` | Addition Word Problems | ready | Approved after founder correction passes | Committed shared word-problem layout | Mature internal range/count/multi-page support | runtime-only | none | **A** | No action | `ffc60c7` |
| — | `grade1_addition_subtraction_facts_equation_match` | Equal or Not Equal? | generated | Founder approved relational `=` / `≠` task and final two-example recheck | Committed controlled Grade 1 relational-equations runtime | Mature: 12 unique pairs, 0–20 results, balanced responses, deterministic Q1 `=` and Q2 `≠` completed mode, answer-key parity | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | `docs/grade-1-category-f-batch-1-preflight.md`; approved before `feat: add grade 1 relational equations` |
| — | `grade1_addition_subtraction_facts_fact_family` | Fact Families — Grade 1 | generated | Explicitly not promoted; duplicate of canonical task | Generic runtime only | Generic, no distinct contract | none | intentionally held | **G** | Keep internal; avoid duplicate work | Milestone 6 Batch 10 hold |
| 5 | `g1_fact_families_within_20` | Fact Families Within 20 | ready | Approved after 12-family/24-operation correction proofs | Committed controlled family | Mature internal count, operation mode, wrap, Q1 example | runtime-only | none | **A** | No action | `ffc60c7` |
| — | `grade1_addition_subtraction_facts_fact_fluency` | Fact Fluency — Grade 1 | generated | Explicitly held as duplicate/count-padding risk | Generic runtime only | Generic, no distinct Grade 1 contract | none | intentionally held | **G** | Keep internal unless a unique use case is approved | Milestone 6 Batch 7 decision |
| 7 | `grade1_addition_subtraction_word_problems_missing_addend_word_problem` | Missing Addend Word Problem — Grade 1 | ready | Approved after founder correction passes | Committed shared word-problem layout | Mature internal range/count/multi-page support | runtime-only | none | **A** | No action | `eabb16a`, `ffc60c7` |
| — | `grade1_addition_subtraction_facts_missing_addend` | Missing Addends — Grade 1 | generated | Distinct-use gate: deferred as a near duplicate of `g1_missing_addends_within_20` | Generic duplicate candidate; deliberately not implemented | Inherits generic generator only; no separate controlled contract | none | intentionally held | **G** | Do not implement without a new distinct-use decision | `docs/grade-1-category-f-batch-1-preflight.md` |
| 8 | `g1_missing_addends_within_20` | Missing Addends Within 20 | ready | Founder reviewed and approved current runtime proof | Committed controlled runtime | Mature: 60/page, mixed positions, range/selection, Q1 example | runtime-only | none | **A** | No action | `ffc60c7`, `b8972b8`; approved before commit |
| — | `grade1_addition_subtraction_facts_related_subtraction` | Related Subtraction — Grade 1 | generated | Explicitly not promoted; overlaps canonical subtraction | Generic runtime only | Generic, no distinct contract | none | intentionally held | **G** | Keep internal; avoid duplicate work | Milestone 6 Batches 7/10 |
| 10 | `g1_subtraction_facts_within_20` | Subtraction Facts Within 20 | ready | Founder reviewed and approved current runtime proof | Committed controlled runtime | Mature: 60/page, range/selection, multi-page, Q1 example | runtime-only | none | **A** | No action | `ffc60c7`, `b8972b8`; approved before commit |
| 11 | `grade1_addition_subtraction_word_problems_subtraction_word_problem` | Subtraction Word Problem — Grade 1 | ready | Approved after founder correction passes | Committed shared word-problem layout | Mature internal range/count/multi-page support | runtime-only | none | **A** | No action | `ffc60c7` |
| 12 | `g1_ten_frame_addition_within_10` | Counting With Ten Frames | ready | Founder approved the responsive correction and reduced recheck | Committed controlled number-model runtime | Mature: 1–10 default, selected/random, zero internal, responsive pages, Q1 example | runtime-only | none | **A** | No action | `ffc60c7`, `c3768af`; reduced recheck approved |
| — | `grade1_addition_subtraction_facts_ten_frame` | Ten Frame Practice — Grade 1 | generated | Explicit legacy sibling; not canonical | Generic legacy runtime | Internal only | none | intentionally held | **G** | Keep legacy/internal | number-representation preflight; Batch 10 hold |
| — | `grade1_addition_subtraction_facts_word_problems` | Word Problems — Grade 1 | generated | Closure decision: defer as duplicate/weakly distinguished generic task | Generic candidate; deliberately not implemented | No controlled distinct task contract; approved operation-specific word-problem families already own the use cases | none | intentionally held | **G** | Keep deferred unless a genuinely distinct teacher use is approved | `docs/grade-1-closure-preflight.md` |
| — | `grade1_data_display_graphing_complete_graph` | Complete the Pictograph | generated | Founder approved the enlarged construction proof | Controlled shared Grade 1 construction runtime | Mature: one graph, four categories, two incomplete rows, 504 × 298 geometry, complete answer key | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | `docs/grade-1-category-f-batch-3-data-preflight.md`; approved before current checkpoint |
| — | `grade1_data_display_graphing_graph_questions` | Graph Questions | generated | Founder approved the mixed direct-reading and comparison proof | Controlled shared Grade 1 pictograph runtime | Mature: 8 questions, 100 topics/scenarios, adaptive units, Q1 example, answer-key parity | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | `docs/grade-1-category-f-batch-2-data-preflight.md`; approved before `feat: add grade 1 data reading family` |
| — | `grade1_data_display_graphing_graph_word_problems` | Use the Graph to Solve | generated | Founder approved structure, pond wording, and category-noun correction | Controlled shared Grade 1 graph-application runtime | Mature: four independent `+1`, `+2`, `-1`, `-2` questions, category nouns, deterministic context safety, optional Q1 example | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | `docs/grade-1-category-f-batch-3-data-preflight.md`; approved before current checkpoint |
| — | `grade1_data_display_graphing_interpret_data` | Compare the Data | generated | Founder approved the category-comparison proof | Controlled shared Grade 1 pictograph runtime | Mature: 6 comparison questions, 100 topics/scenarios, adaptive units, Q1 example, answer-key parity | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | `docs/grade-1-category-f-batch-2-data-preflight.md`; approved before `feat: add grade 1 data reading family` |
| — | `grade1_data_display_graphing_match_data_to_graph` | Choose the Matching Graph | generated | Founder approved the headerless two-item matching proof | Controlled shared Grade 1 matching runtime | Mature: two items, two A/B choices, deterministic one-value distractor, answer-key marking | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | `docs/grade-1-category-f-batch-3-data-preflight.md`; approved before current checkpoint |
| — | `grade1_data_display_graphing_read_graph` | Read the Graph | generated | Founder approved the direct-reading proof | Controlled shared Grade 1 pictograph runtime | Mature: 6 direct-reading questions, 100 topics/scenarios, adaptive units, Q1 example, answer-key parity | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | `docs/grade-1-category-f-batch-2-data-preflight.md`; approved before `feat: add grade 1 data reading family` |
| — | `grade1_fraction_equivalence_compare_fractions` | Compare Fair Shares | generated | Founder approved default and completed-Q1 proofs | Committed controlled shared Grade 1 fraction runtime | Mature implementation: 6 visual comparisons, equal-sized wholes, left/Same/right choices, optional Q1 example | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | fraction-family preflight; founder-approved commit checkpoint |
| — | `grade1_fraction_equivalence_fraction_number_line` | Fraction Number Line — Grade 1 | generated | Explicitly deferred | Legacy generic candidate; deliberately excluded from Grade 1 fraction runtime | Blank/malformed legacy path; Grade 1 role not approved | none | intentionally held | **G** | Revisit only in a Grade 2+ magnitude preflight | fraction-family preflight and implementation checkpoint |
| — | `grade1_fraction_equivalence_fraction_word_problems` | Share Fairly | generated | Founder approved divisible-object correction proof | Committed controlled shared Grade 1 fraction runtime | Mature implementation: 3 fair-share drawings, 2/4 sharers, divisible-object halves, shared set/tray renderer | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | fraction-family preflight; founder-approved commit checkpoint |
| — | `grade1_fraction_equivalence_match_equivalent_fractions` | One Half and Two Fourths | generated | Founder approved proof | Committed controlled shared Grade 1 fraction runtime | Mature implementation: 4 same-whole Yes/No pairs limited to the approved relationship | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | fraction-family preflight; founder-approved commit checkpoint |
| — | `grade1_fraction_equivalence_shade_fraction_models` | Shade Equal Parts | generated | Founder approved corrected example-label proof | Committed controlled shared Grade 1 fraction runtime | Mature implementation: 6 exact strips, separate `Try this one` example, deterministic answer-key shading | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | fraction-family preflight; founder-approved commit checkpoint |
| — | `grade1_multiplication_facts_arrays` | Arrays — Grade 1 | generated | Founder approved Grade 1 representative proof | Committed controlled shared model runtime | Mature shared factors/count/example/answer-key support | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | `6b41015`; approved before commit |
| — | `grade1_multiplication_facts_equal_groups` | Equal Groups — Grade 1 | generated | Founder approved Grade 1 representative proof | Committed controlled shared model runtime | Mature shared factors/count/example/answer-key support | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | `6b41015`; approved before commit |
| — | `grade1_multiplication_facts_missing_factor` | Missing Factors — Grade 1 | generated | Closure decision: defer to Grade 2+ | Generic abstract candidate; deliberately not implemented for Grade 1 | Factors 2–10/products to 100 conflict with drawing-led equal groups and total no greater than 10 | none | intentionally held | **G** | Reconsider only in the relevant later-grade family review | `docs/grade-1-closure-preflight.md` |
| — | `grade1_multiplication_facts_skip_counting` | Skip Counting — Grade 1 | generated | Founder approved default and completed-Question-1 proofs | Committed controlled shared sequence runtime with Grade 1 defaults | Mature: 8 six-term patterns, steps 1/2/5/10, values 0–50, Q1 example, answer-key parity | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | `ea17fb0`; Grade 1 Category C closure packet |
| — | `grade1_multiplication_facts_word_problems` | Word Problems — Grade 1 | generated | Closure decision: defer current output | Generic model-free candidate; deliberately not implemented | Current totals exceed Grade 1 limits; any future story mode belongs in the approved Equal Groups family | none | intentionally held | **G** | Do not create an isolated family; reopen only with a distinct drawing-led need | `docs/grade-1-closure-preflight.md` |
| 3 | `grade1_place_value_representation_base_ten_blocks` | Base Ten Blocks to 50 — Grade 1 | ready | Founder approved current 0–50 output and reduced recheck | Committed controlled number-model runtime | Mature: 0–50, labels internal, selected values, Q1 example | runtime-only | none | **A** | No action | `ffc60c7`, `c3768af`; reduced recheck approved |
| — | `grade1_place_value_representation_compare_numbers` | Compare Numbers — Grade 1 | generated | Distinct-use gate: deferred as a near duplicate of `g1_compare_numbers_to_20` | Generic duplicate candidate; deliberately not implemented | Inherits comparison generator only; no separate controlled contract | none | intentionally held | **G** | Do not implement without a new distinct-use decision | `docs/grade-1-category-f-batch-1-preflight.md` |
| 4 | `g1_compare_numbers_to_20` | Compare Numbers to 20 | ready | Founder reviewed and approved current 60-question comparison proof | Committed controlled runtime | Mature: `> < =`, 60/page, range/selection, Q1 example | runtime-only | none | **A** | No action | `ffc60c7`, `b8972b8`; approved before commit |
| — | `grade1_place_value_representation_expanded_form` | Expanded Form — Grade 1 | generated | Founder approved default and completed-Question-1 proofs | Committed controlled shared place-value runtime with Grade 1 defaults | Mature: 18 unique values from 10–50, 3 × 6 layout, Q1 example, answer-key parity | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | `ea17fb0`; Grade 1 Category C closure packet |
| 6 | `g1_number_line_identify_to_20` | Identify Numbers on a Number Line to 20 | ready | Approved; later decision accepted lower density for readability | Committed controlled layout | Internal range/count/selection/example support; broader label modes deferred | runtime-only | none | **A** | No action; retain accepted readability exception | `ffc60c7` |
| — | `grade1_place_value_representation_number_line_identify` | Number Line — Grade 1 | generated | Closure decision: defer as direct duplicate of `g1_number_line_identify_to_20` | Generic duplicate candidate; deliberately not implemented | Inherits generic number-line runtime; no separate teacher use | none | intentionally held | **G** | Keep deferred unless a distinct task is approved | `docs/grade-1-closure-preflight.md` |
| — | `grade1_place_value_representation_number_word_match` | Number Word Match — Grade 1 | generated | Explicit legacy sibling; not canonical | Generic legacy runtime | Internal only | none | intentionally held | **G** | Keep legacy/internal | number-representation preflight |
| 9 | `g1_number_word_match_to_50` | Write Number Words to 50 | ready | Founder approved current 20-question output and reduced recheck | Committed controlled number-word runtime | Mature: default 20/2 columns, 30/3 columns, range/selection, Q1 example | runtime-only | none | **A** | No action | `ffc60c7`, `c3768af`; reduced recheck approved |
| — | `g1_write_the_numeral_to_50` | Write the Numeral to 50 | ready | Founder reviewed and approved the representative PDFs | Committed controlled reverse number-word runtime | Mature: default 20, 30/3 columns, pagination, short target, Q1 example | runtime-only | promoted after metadata, runtime, visual, and public-flow checks | **A** | No Grade 1 action | `c3768af`; reduced recheck approved; final promotion checkpoint |
| — | `grade1_place_value_representation_standard_form` | Standard Form — Grade 1 | generated | Explicitly not the canonical Write-the-Numeral resource; legacy/reference | Committed generic place-value runtime | Internal only for this legacy entry | none | intentionally held | **G** | Keep legacy/reference unless a distinct task is reopened | number-representation preflight |
| — | `grade1_patterning_and_algebra_extend_pattern` | Extend Pattern — Grade 1 | generated | Founder proof approved; earlier grade-fit caution resolved by controlled numeric scope | Committed controlled numeric-pattern runtime | Mature runtime-only arithmetic sequence variables | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | `feb3bc1`; proof approved before commit |
| — | `grade1_patterning_and_algebra_function_table` | Function Table — Grade 1 | generated | Explicitly deferred | Compatibility runtime only; public layout not approved | Internal compatibility only | none | do not promote | **G** | Keep deferred pending a future approved preflight | `docs/decisions.md`; `feb3bc1` guardrail |
| — | `grade1_patterning_and_algebra_identify_pattern_rule` | Identify Pattern Rule — Grade 1 | generated | Founder proof approved; earlier grade-fit caution resolved by controlled numeric scope | Committed controlled numeric-pattern runtime | Mature runtime-only arithmetic sequence variables | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | `feb3bc1`; proof approved before commit |
| — | `grade1_patterning_and_algebra_missing_value_pattern` | Missing Value Pattern — Grade 1 | generated | Founder proof approved; earlier grade-fit caution resolved by controlled numeric scope | Committed controlled numeric-pattern runtime | Mature runtime-only arithmetic sequence variables | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | `feb3bc1`; proof approved before commit |
| — | `grade1_patterning_and_algebra_pattern_word_problems` | Pattern Word Problems — Grade 1 | planned | Explicitly deferred | No generator | Not supported | none | do not promote | **G** | Keep deferred; current audit failure is expected | sprint/decisions; audit |
| — | `g1_compare_numbers_to_20_exit_ticket` | Compare Numbers to 20 Exit Ticket | ready | Closure decision: remove from active worksheet review; the founder worksheet CSV intentionally excludes Exit Tickets | Committed and verified Exit Ticket runtime | Fixed, format-distinct Exit Ticket contract | N/A | already ready; tracked in the validated Exit Ticket lane | **G** | No implementation or worksheet-style founder proof; reopen only through format policy | `docs/grade-1-closure-preflight.md`; `1edffe5`; 103/103 audit |

## Technical delivery inventory

Every entry above is declared in `data/worksheetCatalog.master.json`. Curated entries also originate in a grade/resource-type config; generated entries originate in `data/worksheetCatalog.generated.json`. The active path is:

`catalog item -> worksheetCatalogService -> buildWorksheet -> activity generator -> normalizeWorksheetLayout -> catalogWorksheetRuntimeService -> normalizeWorksheetContent -> renderer`

Delivery codes below: `P` = public detail route plus preview/PDF APIs; `I` = no public detail route, but direct internal preview/PDF APIs work; `N` = no working preview/PDF because the planned generator is absent. All 49 entries declare answer-key support. `Q1` means a controlled completed-example contract; `generic` means the shared mechanism may exist but has not been Grade 1 founder-proofed; `N/A` is an Exit Ticket.

| Resource ID | Kind / source | Active generator or runtime | Layout / renderer | Delivery | Answer key / completed example |
| --- | --- | --- | --- | --- | --- |
| `g1_addition_facts_within_20` | worksheet / curated | `factFluency` + Addition Facts adapter | `fluency_grid` / shared PDF | P | yes / Q1 |
| `g1_addition_on_number_line_to_20` | worksheet / curated | controlled `additionNumberLine` runtime | Grade 1 full-width `visual_model` / shared PDF | I | yes / Q1 runtime |
| `grade1_addition_subtraction_word_problems_addition_word_problem` | worksheet / generated | `wordProblems.addition` | `equation_practice` / shared PDF | I | yes / generic |
| `g1_addition_word_problems` | worksheet / curated | `wordProblems` | approved work-box layout / shared PDF | P | yes / Q1 |
| `grade1_addition_subtraction_facts_equation_match` | worksheet / generated | controlled Grade 1 `equationMatch` relational pool | two-column comparison-symbol layout / shared PDF | I | yes / Q1 `=`, Q2 `≠` runtime |
| `grade1_addition_subtraction_facts_fact_family` | worksheet / generated | `factFamily` | `matching` / shared PDF | I | yes / generic |
| `g1_fact_families_within_20` | worksheet / curated | `factFamily` | approved fact-family layout / shared PDF | P | yes / Q1 |
| `grade1_addition_subtraction_facts_fact_fluency` | worksheet / generated | `factFluency` | `fluency_grid` / shared PDF | I | yes / generic |
| `grade1_addition_subtraction_word_problems_missing_addend_word_problem` | worksheet / generated-ready | `wordProblems.missingAddend` | approved work-box layout / shared PDF | P | yes / Q1 |
| `grade1_addition_subtraction_facts_missing_addend` | worksheet / generated | `missingAddend` | `fluency_grid` / shared PDF | I | yes / generic |
| `g1_missing_addends_within_20` | worksheet / curated | Grade 1 fluency adapter + `missingAddend` | dense fluency layout / shared PDF | P | yes / Q1 |
| `grade1_addition_subtraction_facts_related_subtraction` | worksheet / generated | `relatedSubtraction` | `fluency_grid` / shared PDF | I | yes / generic |
| `g1_subtraction_facts_within_20` | worksheet / curated | Grade 1 fluency adapter + `relatedSubtraction` | dense fluency layout / shared PDF | P | yes / Q1 |
| `grade1_addition_subtraction_word_problems_subtraction_word_problem` | worksheet / generated-ready | `wordProblems.subtraction` | approved work-box layout / shared PDF | P | yes / Q1 |
| `g1_ten_frame_addition_within_10` | worksheet / curated | Grade 1 representation adapter + `tenFrame` | responsive `visual_model` / shared PDF | P | yes / Q1 |
| `grade1_addition_subtraction_facts_ten_frame` | worksheet / generated | `tenFrame` | `visual_model` / shared PDF | I | yes / generic |
| `grade1_addition_subtraction_facts_word_problems` | worksheet / generated | `wordProblems` | `equation_practice` / shared PDF | I | yes / generic |
| `grade1_data_display_graphing_complete_graph` | worksheet / generated | shared Grade 1 data runtime via `completeGraph` | full construction pictograph / shared PDF | I | no |
| `grade1_data_display_graphing_graph_questions` | worksheet / generated | shared Grade 1 data runtime via `graphQuestions` | two-column shared pictograph / shared PDF | I | yes / Q1 runtime |
| `grade1_data_display_graphing_graph_word_problems` | worksheet / generated | shared Grade 1 data runtime via `graph_application` | two-column shared pictograph application / shared PDF | I | yes / Q1 runtime |
| `grade1_data_display_graphing_interpret_data` | worksheet / generated | shared Grade 1 data runtime via `interpretData` | two-column shared pictograph / shared PDF | I | yes / Q1 runtime |
| `grade1_data_display_graphing_match_data_to_graph` | worksheet / generated | shared Grade 1 data runtime via `match_graph` | two-item compact A/B pictographs / shared PDF | I | no |
| `grade1_data_display_graphing_read_graph` | worksheet / generated | shared Grade 1 data runtime via `readGraph` | two-column shared pictograph / shared PDF | I | yes / Q1 runtime |
| `grade1_fraction_equivalence_compare_fractions` | worksheet / generated | shared `grade1Fractions` / `compare_fair_shares` | `fraction_strip_grid` / shared fraction PDF | I | yes / Q1 runtime |
| `grade1_fraction_equivalence_fraction_number_line` | worksheet / generated | deferred legacy `fractionNumberLine` | deferred generic path; not routed to Grade 1 fraction renderer | I | no approved mode |
| `grade1_fraction_equivalence_fraction_word_problems` | worksheet / generated | shared `grade1Fractions` / `share_fairly` | `fair_share_rows` / shared fraction PDF | I | separate worked model |
| `grade1_fraction_equivalence_match_equivalent_fractions` | worksheet / generated | shared `grade1Fractions` / `half_two_fourths` | `fraction_strip_pairs` / shared fraction PDF | I | no |
| `grade1_fraction_equivalence_shade_fraction_models` | worksheet / generated | shared `grade1Fractions` / `shade_equal_parts` | `fraction_strip_grid` / shared fraction PDF | I | separate worked model |
| `grade1_multiplication_facts_arrays` | worksheet / generated | shared `array` model runtime | `model_interpretation` / shared PDF | I | yes / Q1 runtime |
| `grade1_multiplication_facts_equal_groups` | worksheet / generated | shared `equalGroups` model runtime | `model_interpretation` / shared PDF | I | yes / Q1 runtime |
| `grade1_multiplication_facts_missing_factor` | worksheet / generated | `missingFactor` | `fluency_grid` / shared PDF | I | yes / generic |
| `grade1_multiplication_facts_skip_counting` | worksheet / generated | shared `skipCounting` runtime | sequence layout / shared PDF | I | yes / Q1 runtime |
| `grade1_multiplication_facts_word_problems` | worksheet / generated | `wordProblems` | `equation_practice` / shared PDF | I | yes / generic |
| `grade1_place_value_representation_base_ten_blocks` | worksheet / generated-ready | Grade 1 representation adapter + `baseTenBlocks` | `visual_model` / shared PDF | P | yes / Q1 |
| `grade1_place_value_representation_compare_numbers` | worksheet / generated | `compareNumbers` | `equation_practice` / shared PDF | I | yes / generic |
| `g1_compare_numbers_to_20` | worksheet / curated | Grade 1 comparison adapter + `compareNumbers` | four-column comparison / shared PDF | P | yes / Q1 |
| `grade1_place_value_representation_expanded_form` | worksheet / generated | shared `expandedForm` runtime | `representation` / shared PDF | I | yes / Q1 runtime |
| `g1_number_line_identify_to_20` | worksheet / curated | `numberLineIdentify` | approved `visual_model` / shared PDF | P | yes / Q1 |
| `grade1_place_value_representation_number_line_identify` | worksheet / generated | `numberLineIdentify` | `visual_model` / shared PDF | I | yes / generic |
| `grade1_place_value_representation_number_word_match` | worksheet / generated | `numberWordMatch` | `matching` / shared PDF | I | yes / generic |
| `g1_number_word_match_to_50` | worksheet / curated | Grade 1 representation adapter + `numberWordMatch` | number-word response / shared PDF | P | yes / Q1 |
| `g1_write_the_numeral_to_50` | worksheet / curated | Grade 1 representation adapter + `numberWordMatch` reverse mode | numeral response / shared PDF | P | yes / Q1 |
| `grade1_place_value_representation_standard_form` | worksheet / generated | shared `standardForm` runtime | `representation` / shared PDF | I | yes / generic |
| `grade1_patterning_and_algebra_extend_pattern` | worksheet / generated | shared numeric rules + `extendPattern` | patterning layout / shared PDF | I | yes / controlled example |
| `grade1_patterning_and_algebra_function_table` | worksheet / generated | compatibility `functionTable` | unapproved generic layout / shared PDF | I | yes / generic |
| `grade1_patterning_and_algebra_identify_pattern_rule` | worksheet / generated | shared numeric rules + `identifyPatternRule` | patterning layout / shared PDF | I | yes / controlled example |
| `grade1_patterning_and_algebra_missing_value_pattern` | worksheet / generated | shared numeric rules + `missingValuePattern` | patterning layout / shared PDF | I | yes / controlled example |
| `grade1_patterning_and_algebra_pattern_word_problems` | worksheet / generated-planned | **no generator** | none | N | declared / unavailable |
| `g1_compare_numbers_to_20_exit_ticket` | Exit Ticket / curated | `compareNumbers` | `exit_ticket` / Exit Ticket PDF | P | yes / N/A |

Public route rule: `/resource/worksheet/:id` returns a public detail page only when `status === "ready"`. The preview and PDF API handlers do not impose that status gate, which is why partial/generated entries can be internally audited without being public library resources.

## Founder recommendation reconciliation

The 12 populated CSV recommendations were implemented through the Grade 1 correction passes and closed in `ffc60c7`. The current sprint then used approved representative or reduced recheck packets before the follow-on commits. All 12 reviewed ready worksheets remain founder-approved on their current committed output.

Recommendation results:

- Addition Facts: implemented, including no extra response line, 60/page, selected numbers, bounded range, exact count, multi-page output, public prototype, and Q1 example.
- Subtraction Facts: implemented and approved as the Addition Facts sibling; public UI intentionally deferred.
- Missing Addends: implemented and approved with 60/page, mixed positions, and Q1 example.
- Compare Numbers: implemented and approved with `>`, `<`, `=`, four columns, 60/page, centered target, and Q1 example.
- Fact Families: implemented and approved, including 12 four-fact or 24 single-operation modes and subtraction wrapping.
- Three word-problem resources: implemented and approved with varied sentences, work space, separation, range/count, and multi-page support.
- Number Line Identify: implemented and approved with the raised line, blank target, centered answer, endpoints, selection modes, and multi-page support; density exception noted below.
- Write Number Words: current 20-question/two-column and 30-question/three-column runtime implemented and approved.
- Write the Numeral: representative output approved, committed, and promoted after the separate operational gate.
- Base Ten Blocks: current 0–50 model/line/labels/example runtime implemented and approved.
- Counting With Ten Frames: title and responsive count bands implemented and approved.
- Numeric Patterning trio: founder proof approved and controlled shared runtime committed; each remains generated/internal rather than public-ready.
- Function Tables: intentionally deferred.

## Superseded notes and conflicts

No unresolved acceptance conflict remains among the 12 reviewed resources, but the following older CSV/checklist statements were superseded and must not be silently treated as current:

1. **Number-line density:** CSV requested 10 questions per page. Print QA found that density crowded; the later approved Grade 1 closeout permits fewer prompts when readability requires it. Current accepted behavior is the later readability exception.
2. **Base-ten range:** CSV suggested 0–20. Later accepted framing is `Base Ten Blocks to 50`, and `c3768af` sets the runtime default to 0–50. The later title/task decision controls.
3. **Ten-frame scope:** CSV suggested values above 10 and two frames. Later accepted public framing is `Counting With Ten Frames`, default 1–10; zero and broader values remain internal overrides. The later framing controls.
4. **Number-word count/direction:** CSV suggested 1–15 and a mixed direction choice. Later decisions keep two distinct public resources, default Write Number Words to 20 questions, proof 30-question modes, and keep direction switching out of public UI.
5. **Fact-family capacity:** CSV requested up to 12 four-fact groups. Later accepted runtime also permits 24 addition-only or subtraction-only groups with corrected wrapping.

The former Addition on a Number Line title/runtime mismatch is resolved. The resource remains partial only because this checkpoint does not authorize promotion.

## Public customization status

- **Live public prototype:** `g1_addition_facts_within_20` only.
- **Runtime-supported but public-deferred:** controlled A worksheet families that retain generated/partial status in the matrix.
- **Not yet supported:** deferred generic candidates and held legacy entries.
- **Intentionally not applicable:** the Grade 1 Exit Ticket.

No second public customization panel, new public control family, or accidental route redesign was found. Internal generator options and direct preview/PDF APIs are not public customization approval.

## Promotion status

`g1_write_the_numeral_to_50` is founder-approved, committed, and now promoted to `ready`. Gate status:

| Gate | Current result |
| --- | --- |
| Founder approval | **Complete** — reduced representative packet approved before `c3768af`. |
| Runtime/implementation | **Complete** — committed in `c3768af`. |
| Catalog metadata | **Structurally complete** — title, short title, subject, grade, domain, skill, family, activity, layout, tags, note, description, instruction, answer-key flag, and generator options exist. |
| Public copy | **Complete** — stale founder-review-pending wording was removed without changing the approved title or instruction. |
| Design issues | **None recorded** after the approved response-line and pagination correction passes. |
| Internal preview/PDF | **Working** through the shared catalog runtime and focused runtime tests. |
| Answer key | **Working** — the current two-page student/key proof and public PDF endpoint use the same seeded truth. |
| Audit | **Passing** as one of 104/104 ready resources. |
| Public detail route | **Working** — `/resource/worksheet/g1_write_the_numeral_to_50` returned 200 after promotion. |
| Public preview/download | **Working** — browse, ready-catalog listing, detail, preview, student PDF, and answer-key PDF passed the exact-resource route smoke. |
| Promotion decision | **Complete** — `partial` -> `ready`; B -> A. |

The Grade 1 promotion gate is complete. Public customization remains runtime-only and no new teacher controls were added.

## Category C closure result

Category C is empty. The four Grade 1 fraction resources are founder-approved and committed while retaining `generated` catalog status. The number-line candidate remains deferred in G. Promotion requires a separate decision.

## Percentage estimates

These are planning estimates, not release claims.

### Grade 1 founder-review completion: 100%

Weighted by resource state rather than raw CSV rows:

- A and B receive 100% founder credit.
- C would receive 60% for a controlled proofable output without Grade 1-specific final PDF approval; no current resource remains in C.
- G receives 100% decision credit because each defer/legacy decision is explicit.
- F is empty.

Calculation: `(31×1.0 + 1×1.0 + 17×1.0) / 49 = 100%`. This is review-disposition completion, not a claim that all 49 resources are approved or launch-ready.

### Grade 1 runtime/family completion: 100%

There are 32 non-deferred candidates. All 32 (A+B) have a controlled or proofable family runtime. Generic audit success is not counted as controlled family maturity, and deferred resources are outside this denominator.

Calculation: `32 / 32 = 100%`.

### Grade 1 promotion/readiness: 29%

Fourteen of 49 Grade 1 candidates are catalog-ready and launch-facing: 13 worksheets and 1 Exit Ticket. This is catalog readiness only. Thirteen of 49 (27%) are both founder-approved and launch-facing; other approved resources may remain generated/internal or partial pending separate decisions.

### Weighted Grade 1 completion: 86%

Planning weights follow the correction directive: founder review/disposition 35%, implementation/runtime maturity for non-deferred candidates 35%, promotion/public readiness 20%, and correction/defer resolution 10%. The component estimates are 100%, 100%, 29%, and 100%, respectively. The composite is `0.35×100 + 0.35×100 + 0.20×29 + 0.10×100 = 85.8%`, rounded to 86%. Separate promotion decisions prevent founder-approved implementation and explicit deferral from being mistaken for full launch readiness.

### Milestone 8 completion estimate: 42%

The raw target ratio is `103 / 250 = 41.2%`. Corrected approval evidence removes the earlier artificial proof backlog, so the planning estimate is 42%: essentially the raw library ratio with modest credit for approved, committed unpromoted work. Broad promotion remains controlled.

### Overall project completion estimate: 68%

Core publishing, catalog, launch-readiness, content-expansion, and controlled-testing foundations are substantially complete; the historical status document describes the core launch surface as approximately 95% launch-ready. The full-library objective is approximately 42% complete and is now the dominant remaining body of work. Weighting the mature platform/launch foundation at 55% of total project effort and full-library/content closeout at 45% gives `0.55×0.90 + 0.45×0.42 = 68.4%`, rounded to 68%.

## Verification and working-tree safety

Passed:

- JSON parse/inventory: 331 catalog items, 49 Grade 1 items.
- `node scripts/testAdditionFactsCustomizationRuntime.js`
- `node scripts/testGrade1FluencyComparisonRuntime.js`
- `node scripts/testGrade1NumberRepresentationRuntime.js`
- `node scripts/testNumericPatterningRuntime.js`
- `node scripts/testGrade1ArraysEqualGroupsRuntime.js`
- `node scripts/testGrade1CategoryCClosure.js`
- `node scripts/testGrade1AdditionNumberLine.js`
- `node scripts/testGrade1CategoryFBatch1.js`
- `node scripts/testGrade1CategoryFBatch2Data.js`
- `node scripts/testGrade1CategoryFBatch3Data.js`
- `node scripts/testGrade1FractionFamily.js`: four structured visual modes, exact 6/4/6/3 totals, same-seed parity, Grade 2+ isolation, and current A32/B0/F0/G17 reconciliation assertions passed.
- `npm run audit:worksheets`: 104/104 ready, 213/213 generated, 5/5 partial; only seven known planned Pattern Word Problems failures.

Final checks passed after this document was saved:

- `git diff --check`
- `git status --short`
- `git log --oneline -15`

Pre-existing excluded untracked paths observed and not altered:

- `engine/catalog/`
- `engine/visuals/index`
- `engine/visuals/renderVisual.js`
- `public/styles/images/`
- `review/`

This final gate changed only `g1_write_the_numeral_to_50` from `partial` to `ready`, removed its stale review-pending copy, refreshed the focused assertions and current documentation, and verified the existing public flow. No public UI, route, generator, renderer, curriculum source, founder CSV, Grade 2+ behavior, or Category G record changed. No push occurred.

FINAL GRADE 1 PROMOTION COMPLETE — A32 / B0 / C0 / D0 / E0 / F0 / G17 / TOTAL 49
