# Grade 1 Founder Review Reconciliation

Date: 2026-07-14

Scope: founder-approval and implementation reconciliation; catalog readiness and promotion are tracked separately

## Verdict

The complete Grade 1 inventory contains **49 resource candidates**: 13 ready, 2 partial, 33 generated/internal, and 1 planned. Twenty-four resources meet the `COMMITTED + FOUNDER APPROVED` gate, one founder-approved partial resource is awaiting promotion, no resources remain in Category C awaiting Grade 1-specific founder proof, no resources remain in Category E awaiting design correction, thirteen generated or ready candidates have not received a controlled Grade 1 founder pass, and eleven are explicitly held, legacy, or deferred.

These totals revise the first reconciliation. That pass under-recorded current-sprint approvals by requiring a second explicit approval statement after already-approved proof packets had produced approved commits. The corrected scan accepts the Project Lead's sprint correction, approved reduced recheck packets, proof-review outcomes, and the approval-gated commits themselves as valid evidence. It does not require duplicate approval evidence.

There are no unresolved founder-note conflicts that prevent the next batch. Five older recommendations are superseded by later accepted decisions and are recorded below.

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

Approval, implementation, promotion, and public customization are separate dimensions. A resource can therefore be founder-approved and committed while still generated/internal or partial. `g1_write_the_numeral_to_50` is the controlling example: its proof is approved and its runtime is committed, but its catalog status remains partial and its public promotion gates remain open.

## Scope and counting rules

- Inventory source: all items whose `grades` includes `grade1` in `data/worksheetCatalog.master.json`, cross-checked with `config/worksheetCatalog/grade1.js` and the Grade 1 Exit Ticket declaration.
- Count: **49** (48 worksheets and 1 Exit Ticket).
- Catalog state: **13 ready, 2 partial, 33 generated/internal, 1 planned**.
- The 12 founder CSV rows cover ready worksheets only. They do not cover the Grade 1 Exit Ticket, partial resources, or generated/planned candidates.
- `data/worksheetCatalog.master.json` currently has 331 actual items, while its embedded `summary` is stale (`totalCount: 312`) and the prior project context says 330. The audit reads the actual array and reports 331. The extra current item is the committed partial `g1_write_the_numeral_to_50`. This metadata discrepancy does not change the 49-item Grade 1 count, but the summary should be rebuilt in a later authorized catalog-maintenance task.

## Classification totals

| Classification | Count | Meaning in this scan |
| --- | ---: | --- |
| A. Committed + Founder Approved | 24 | Founder proof is approved, implementation is committed, and no founder correction remains; catalog readiness is tracked separately. |
| B. Founder Approved + Awaiting Promotion | 1 | Founder proof and implementation are complete, but the resource remains partial and promotion gates are open. |
| C. Implemented + awaiting founder proof | 0 | No resources remain in this classification after the approved Category C closure packet. |
| D. Awaiting variable/runtime consolidation | 0 | The reviewed Grade 1 families are already consolidated; other gaps are proof, design, or untouched work. |
| E. Awaiting design correction | 0 | No resources remain in this classification after the approved Addition on a Number Line correction. |
| F. Untouched / not yet reviewed | 13 | Generic generation may work, but no controlled Grade 1 founder pass exists. |
| G. Intentionally deferred | 11 | A product decision explicitly holds, supersedes, or keeps the entry as legacy/internal. |
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

| Classification | Before closure | Before relational checkpoint | Current |
| --- | ---: | ---: | ---: |
| A | 15 | 20 | 24 |
| B | 1 | 1 | 1 |
| C | 4 | 0 | 0 |
| D | 0 | 0 | 0 |
| E | 1 | 0 | 0 |
| F | 19 | 19 | 13 |
| G | 9 | 9 | 11 |
| **Total** | **49** | **49** | **49** |

Category C is now empty. Arrays and Equal Groups were founder-approved and committed in `6b41015`; the approved Category C closure packet completes the Grade 1-specific proof for Skip Counting and Expanded Form without changing catalog status or promoting any resource.

Category E is now empty. Addition on a Number Line uses the founder-approved addition model and full-width 0–20 geometry while remaining `partial`; promotion is a separate decision.

The Grade 1 relational-equations resource is founder-approved with the final `Equal or Not Equal?` copy, deterministic two-response completed mode, and 12-question two-column layout while remaining `generated`. Missing Addend and Compare Numbers are now intentionally deferred in Category G as near duplicates of their approved canonical resources; they must not be implemented without a new distinct-use decision.

The three Grade 1 data-reading resources are founder-approved with distinct 6/6/8-question tasks, a shared one-to-one pictograph, a validated 100-topic and 100-scenario registry, aligned response lines, completed-Question-1 mode, and student/answer-key parity. They remain `generated`; promotion and public topic controls require separate decisions.

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
| — | `grade1_addition_subtraction_facts_word_problems` | Word Problems — Grade 1 | generated | No separate founder review | Generic candidate | No controlled distinct task contract | none | not eligible | **F** | Establish a distinct use case or defer as duplicate | master catalog; audit only |
| — | `grade1_data_display_graphing_complete_graph` | Complete a Graph — Grade 1 | generated | No founder review | Generic candidate | No controlled Grade 1 pass | none | not eligible | **F** | Founder/teacher-use and grade-fit review | master catalog; audit only |
| — | `grade1_data_display_graphing_graph_questions` | Graph Questions | generated | Founder approved the mixed direct-reading and comparison proof | Controlled shared Grade 1 pictograph runtime | Mature: 8 questions, 100 topics/scenarios, adaptive units, Q1 example, answer-key parity | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | `docs/grade-1-category-f-batch-2-data-preflight.md`; approved before `feat: add grade 1 data reading family` |
| — | `grade1_data_display_graphing_graph_word_problems` | Graph Word Problems — Grade 1 | generated | No founder review | Recipe fallback works; no controlled pass | No controlled Grade 1 contract | none | not eligible | **F** | Preflight and explicit generator ownership before promotion | master catalog; audit only |
| — | `grade1_data_display_graphing_interpret_data` | Compare the Data | generated | Founder approved the category-comparison proof | Controlled shared Grade 1 pictograph runtime | Mature: 6 comparison questions, 100 topics/scenarios, adaptive units, Q1 example, answer-key parity | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | `docs/grade-1-category-f-batch-2-data-preflight.md`; approved before `feat: add grade 1 data reading family` |
| — | `grade1_data_display_graphing_match_data_to_graph` | Match Data to Graph — Grade 1 | generated | No founder review | Generic candidate | No controlled Grade 1 pass | none | not eligible | **F** | Founder/teacher-use and grade-fit review | master catalog; audit only |
| — | `grade1_data_display_graphing_read_graph` | Read the Graph | generated | Founder approved the direct-reading proof | Controlled shared Grade 1 pictograph runtime | Mature: 6 direct-reading questions, 100 topics/scenarios, adaptive units, Q1 example, answer-key parity | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | `docs/grade-1-category-f-batch-2-data-preflight.md`; approved before `feat: add grade 1 data reading family` |
| — | `grade1_fraction_equivalence_compare_fractions` | Compare Fractions — Grade 1 | generated | No founder review | Generic candidate | No controlled Grade 1 pass | none | not eligible | **F** | Grade-fit/design preflight | master catalog; audit only |
| — | `grade1_fraction_equivalence_fraction_number_line` | Fraction Number Line — Grade 1 | generated | No founder review | Generic candidate | No controlled Grade 1 pass | none | not eligible | **F** | Grade-fit/design preflight | master catalog; audit only |
| — | `grade1_fraction_equivalence_fraction_word_problems` | Fraction Word Problems — Grade 1 | generated | No founder review | Recipe fallback works; no controlled pass | No controlled Grade 1 contract | none | not eligible | **F** | Preflight and explicit generator ownership | master catalog; audit only |
| — | `grade1_fraction_equivalence_match_equivalent_fractions` | Match Equivalent Fractions — Grade 1 | generated | No founder review | Generic candidate | No controlled Grade 1 pass | none | not eligible | **F** | Grade-fit/design preflight | master catalog; audit only |
| — | `grade1_fraction_equivalence_shade_fraction_models` | Shade Fraction Models — Grade 1 | generated | No founder review | Generic candidate | No controlled Grade 1 pass | none | not eligible | **F** | Grade-fit/design preflight | master catalog; audit only |
| — | `grade1_multiplication_facts_arrays` | Arrays — Grade 1 | generated | Founder approved Grade 1 representative proof | Committed controlled shared model runtime | Mature shared factors/count/example/answer-key support | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | `6b41015`; approved before commit |
| — | `grade1_multiplication_facts_equal_groups` | Equal Groups — Grade 1 | generated | Founder approved Grade 1 representative proof | Committed controlled shared model runtime | Mature shared factors/count/example/answer-key support | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | `6b41015`; approved before commit |
| — | `grade1_multiplication_facts_missing_factor` | Missing Factors — Grade 1 | generated | No founder review | Generic candidate | No controlled Grade 1 pass | none | not eligible | **F** | Grade-fit/design review | master catalog; audit only |
| — | `grade1_multiplication_facts_skip_counting` | Skip Counting — Grade 1 | generated | Founder approved default and completed-Question-1 proofs | Committed controlled shared sequence runtime with Grade 1 defaults | Mature: 8 six-term patterns, steps 1/2/5/10, values 0–50, Q1 example, answer-key parity | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | `ea17fb0`; Grade 1 Category C closure packet |
| — | `grade1_multiplication_facts_word_problems` | Word Problems — Grade 1 | generated | No founder review | Generic candidate | No controlled distinct Grade 1 pass | none | not eligible | **F** | Grade-fit/design review | master catalog; audit only |
| 3 | `grade1_place_value_representation_base_ten_blocks` | Base Ten Blocks to 50 — Grade 1 | ready | Founder approved current 0–50 output and reduced recheck | Committed controlled number-model runtime | Mature: 0–50, labels internal, selected values, Q1 example | runtime-only | none | **A** | No action | `ffc60c7`, `c3768af`; reduced recheck approved |
| — | `grade1_place_value_representation_compare_numbers` | Compare Numbers — Grade 1 | generated | Distinct-use gate: deferred as a near duplicate of `g1_compare_numbers_to_20` | Generic duplicate candidate; deliberately not implemented | Inherits comparison generator only; no separate controlled contract | none | intentionally held | **G** | Do not implement without a new distinct-use decision | `docs/grade-1-category-f-batch-1-preflight.md` |
| 4 | `g1_compare_numbers_to_20` | Compare Numbers to 20 | ready | Founder reviewed and approved current 60-question comparison proof | Committed controlled runtime | Mature: `> < =`, 60/page, range/selection, Q1 example | runtime-only | none | **A** | No action | `ffc60c7`, `b8972b8`; approved before commit |
| — | `grade1_place_value_representation_expanded_form` | Expanded Form — Grade 1 | generated | Founder approved default and completed-Question-1 proofs | Committed controlled shared place-value runtime with Grade 1 defaults | Mature: 18 unique values from 10–50, 3 × 6 layout, Q1 example, answer-key parity | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | `ea17fb0`; Grade 1 Category C closure packet |
| 6 | `g1_number_line_identify_to_20` | Identify Numbers on a Number Line to 20 | ready | Approved; later decision accepted lower density for readability | Committed controlled layout | Internal range/count/selection/example support; broader label modes deferred | runtime-only | none | **A** | No action; retain accepted readability exception | `ffc60c7` |
| — | `grade1_place_value_representation_number_line_identify` | Number Line — Grade 1 | generated | No separate founder review | Generic duplicate candidate | Inherits generic number-line runtime | none | not eligible | **F** | Distinct-use-case decision or explicit defer | master catalog; audit only |
| — | `grade1_place_value_representation_number_word_match` | Number Word Match — Grade 1 | generated | Explicit legacy sibling; not canonical | Generic legacy runtime | Internal only | none | intentionally held | **G** | Keep legacy/internal | number-representation preflight |
| 9 | `g1_number_word_match_to_50` | Write Number Words to 50 | ready | Founder approved current 20-question output and reduced recheck | Committed controlled number-word runtime | Mature: default 20/2 columns, 30/3 columns, range/selection, Q1 example | runtime-only | none | **A** | No action | `ffc60c7`, `c3768af`; reduced recheck approved |
| — | `g1_write_the_numeral_to_50` | Write the Numeral to 50 | partial | Founder reviewed and approved the representative PDFs | Committed controlled reverse number-word runtime | Mature: default 20, 30/3 columns, pagination, short target, Q1 example | runtime-only | awaiting metadata/copy correction, promotion decision, then public smoke verification | **B** | Update stale review-pending copy in a later authorized promotion change; decide promotion; verify public route/preview/download after status change | `c3768af`; reduced recheck approved |
| — | `grade1_place_value_representation_standard_form` | Standard Form — Grade 1 | generated | Explicitly not the canonical Write-the-Numeral resource; legacy/reference | Committed generic place-value runtime | Internal only for this legacy entry | none | intentionally held | **G** | Keep legacy/reference unless a distinct task is reopened | number-representation preflight |
| — | `grade1_patterning_and_algebra_extend_pattern` | Extend Pattern — Grade 1 | generated | Founder proof approved; earlier grade-fit caution resolved by controlled numeric scope | Committed controlled numeric-pattern runtime | Mature runtime-only arithmetic sequence variables | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | `feb3bc1`; proof approved before commit |
| — | `grade1_patterning_and_algebra_function_table` | Function Table — Grade 1 | generated | Explicitly deferred | Compatibility runtime only; public layout not approved | Internal compatibility only | none | do not promote | **G** | Keep deferred pending a future approved preflight | `docs/decisions.md`; `feb3bc1` guardrail |
| — | `grade1_patterning_and_algebra_identify_pattern_rule` | Identify Pattern Rule — Grade 1 | generated | Founder proof approved; earlier grade-fit caution resolved by controlled numeric scope | Committed controlled numeric-pattern runtime | Mature runtime-only arithmetic sequence variables | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | `feb3bc1`; proof approved before commit |
| — | `grade1_patterning_and_algebra_missing_value_pattern` | Missing Value Pattern — Grade 1 | generated | Founder proof approved; earlier grade-fit caution resolved by controlled numeric scope | Committed controlled numeric-pattern runtime | Mature runtime-only arithmetic sequence variables | runtime-only | generated/internal; no promotion decision | **A** | No implementation/proof action; promote only through a separate decision | `feb3bc1`; proof approved before commit |
| — | `grade1_patterning_and_algebra_pattern_word_problems` | Pattern Word Problems — Grade 1 | planned | Explicitly deferred | No generator | Not supported | none | do not promote | **G** | Keep deferred; current audit failure is expected | sprint/decisions; audit |
| — | `g1_compare_numbers_to_20_exit_ticket` | Compare Numbers to 20 Exit Ticket | ready | Founder worksheet CSV does not cover Exit Tickets | Committed and verified Exit Ticket runtime | Fixed Exit Ticket contract | N/A | already ready, but not founder-complete | **F** | Decide whether Grade 1 founder reconciliation should include non-worksheet proofs | `1edffe5`; 103/103 audit |

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
| `grade1_data_display_graphing_complete_graph` | worksheet / generated | `completeGraph` | `visual_model` / shared PDF | I | yes / generic |
| `grade1_data_display_graphing_graph_questions` | worksheet / generated | shared Grade 1 data runtime via `graphQuestions` | two-column shared pictograph / shared PDF | I | yes / Q1 runtime |
| `grade1_data_display_graphing_graph_word_problems` | worksheet / generated | recipe fallback | `equation_practice` / shared PDF | I | yes / generic |
| `grade1_data_display_graphing_interpret_data` | worksheet / generated | shared Grade 1 data runtime via `interpretData` | two-column shared pictograph / shared PDF | I | yes / Q1 runtime |
| `grade1_data_display_graphing_match_data_to_graph` | worksheet / generated | `matchDataToGraph` | `matching` / shared PDF | I | yes / generic |
| `grade1_data_display_graphing_read_graph` | worksheet / generated | shared Grade 1 data runtime via `readGraph` | two-column shared pictograph / shared PDF | I | yes / Q1 runtime |
| `grade1_fraction_equivalence_compare_fractions` | worksheet / generated | `compareFractions` | `equation_practice` / shared PDF | I | yes / generic |
| `grade1_fraction_equivalence_fraction_number_line` | worksheet / generated | `fractionNumberLine` | `equation_practice` / shared PDF | I | yes / generic |
| `grade1_fraction_equivalence_fraction_word_problems` | worksheet / generated | recipe fallback | `equation_practice` / shared PDF | I | yes / generic |
| `grade1_fraction_equivalence_match_equivalent_fractions` | worksheet / generated | `matchEquivalentFractions` | `equation_practice` / shared PDF | I | yes / generic |
| `grade1_fraction_equivalence_shade_fraction_models` | worksheet / generated | `shadeFractionModels` | `equation_practice` / shared PDF | I | yes / generic |
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
| `g1_write_the_numeral_to_50` | worksheet / curated | Grade 1 representation adapter + `numberWordMatch` reverse mode | numeral response / shared PDF | I | yes / Q1 |
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
- Write the Numeral: representative output approved and committed as a separate partial resource; only promotion work remains.
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
- **Runtime-supported but public-deferred:** the other controlled A/B/C worksheet families listed in the matrix.
- **Not yet supported:** generic F candidates and held legacy entries.
- **Intentionally not applicable:** the Grade 1 Exit Ticket.

No second public customization panel, new public control family, or accidental route redesign was found. Internal generator options and direct preview/PDF APIs are not public customization approval.

## Promotion status

`g1_write_the_numeral_to_50` is founder-approved and committed but remains `partial`. Gate status:

| Gate | Current result |
| --- | --- |
| Founder approval | **Complete** — reduced representative packet approved before `c3768af`. |
| Runtime/implementation | **Complete** — committed in `c3768af`. |
| Catalog metadata | **Structurally complete** — title, short title, subject, grade, domain, skill, family, activity, layout, tags, note, description, instruction, answer-key flag, and generator options exist. |
| Public copy | **Needs a small correction** — `teacherNote` and `description` still say founder review is pending, which is now stale. |
| Design issues | **None recorded** after the approved response-line and pagination correction passes. |
| Internal preview/PDF | **Working** through the direct catalog APIs and focused runtime tests. |
| Answer key | **Working** and covered by the runtime/proof packet. |
| Audit | **Passing** as one of 6/6 partial resources. |
| Public detail route | **Not live by design** — `/resource/worksheet/:id` returns 404 while status is `partial`. |
| Public preview/download | Direct APIs work, but user-facing verification must follow an authorized promotion because the public detail route is status-gated. |
| Promotion decision | **Open** — an explicit status/promotion checkpoint is still required. |

The remaining work is therefore: correct stale metadata/public copy in a later authorized promotion change, make the explicit promotion decision, change status only if approved, then smoke-test the public detail, preview, PDF download, and answer-key package. Founder proof, runtime, audit, and design are not blockers. No promotion was performed.

## Category C closure result

All four former Category C resources are now committed and founder-approved. No Category C resource remains. Selecting another Grade 1 family, correcting the separate Number Line Addition design issue, or promoting any generated/internal resource requires a separate authorized task.

## Percentage estimates

These are planning estimates, not release claims.

### Grade 1 founder-review completion: 67%

Weighted by resource state rather than raw CSV rows:

- A and B receive 100% founder credit.
- C would receive 60% for an approved shared-family foundation and committed proofable output without Grade 1-specific final PDF approval; no current resource remains in C.
- G receives 100% decision credit because the defer/legacy decision is explicit.
- F receives 0% because no controlled founder pass exists.

Calculation: `(21×1.0 + 1×1.0 + 0×0.6 + 0×0.5 + 11×1.0 + 16×0) / 49 = 67.3%`.

### Grade 1 runtime/family completion: 58%

There are 38 non-deferred candidates. Twenty-two (A+B+C) have a controlled committed runtime. Generic audit success is not counted as controlled family maturity.

Calculation: `22 / 38 = 57.9%`.

### Grade 1 promotion/readiness: 27%

Thirteen of 49 Grade 1 candidates are catalog-ready and launch-facing: 12 worksheets and 1 Exit Ticket. This is catalog readiness only. Twelve of 49 (24%) are both founder-approved and launch-facing; the three approved Patterning resources remain generated/internal, and Write the Numeral remains partial.

### Weighted Grade 1 completion: 56%

Planning weights follow the correction directive: founder review/approval 35%, committed implementation/runtime maturity 35%, promotion/public readiness 20%, and correction/defer resolution 10%. The component estimates are 67%, 58%, 27%, and 67%, respectively. Correction/defer resolution gives full credit to A+B+G: `(21 + 1 + 11) / 49 = 67.3%`. The composite is `0.35×67 + 0.35×58 + 0.20×27 + 0.10×67 = 55.9%`, rounded to 56%. The generic/generated inventory still prevents approved sprint work from being mistaken for full Grade 1 library completion.

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
- `npm run audit:worksheets`: 103/103 ready, 213/213 generated, 6/6 partial; only seven known planned Pattern Word Problems failures.

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

No resource status, public UI, route, or founder CSV was changed. The relational-equations changes are limited to the approved Grade 1 runtime, catalog copy, tests, proof generator, preflight, and reconciliation. The two deferred near-duplicate resources were not modified. No resource was promoted and no push occurred.

GRADE 1 RELATIONAL EQUATIONS RECONCILIATION CLOSED
