# Grade 1 Closure Preflight

Date: 2026-07-14

Scope: planning and reconciliation analysis only. This pass changes no catalog state, generator, renderer, route, reconciliation category, proof artifact, or public surface.

## Executive recommendation

Close the active Grade 1 founder worksheet review with deferrals only. Do not implement another Grade 1 worksheet family.

- Move the four generic worksheet candidates in Category F to Category G: two are direct duplicates, one is an abstract later-grade task, and one would need a new drawing-led equal-groups contract to become Grade 1-safe even though that role is already covered.
- Remove `g1_compare_numbers_to_20_exit_ticket` from the active worksheet-review queue and track it in the already validated Exit Ticket lane. It is ready, deterministic, meaningful, and format-distinct, but the founder worksheet packet intentionally excluded Exit Tickets.
- Keep `g1_write_the_numeral_to_50` in Category B until a separate promotion decision. Its founder proof and implementation are complete; the remaining work is release metadata and public-route gating, not design or founder approval.
- Keep all 12 Category G decisions closed. Current runtime inspection strengthens rather than weakens their defer/legacy rationale.

Recommended reconciliation after an authorized closure update: **A31 / B1 / C0 / D0 / E0 / F0 / G17 = 49**. Grade 1 founder review can close while the single Category B promotion gate remains open because approval and public promotion are separate dimensions.

## Current state

Post-commit source of truth in `docs/grade-1-founder-review-reconciliation.md`:

| Category | Count | Closure meaning |
| --- | ---: | --- |
| A | 31 | Committed and founder approved |
| B | 1 | Founder approved and awaiting promotion |
| C | 0 | No founder proofs outstanding |
| D | 0 | No variable/runtime consolidation outstanding |
| E | 0 | No design corrections outstanding |
| F | 5 | Review disposition still required |
| G | 12 | Deliberately deferred, legacy, or superseded |
| **Total** | **49** | 48 worksheets and 1 Exit Ticket |

Catalog health remains **103 ready / 213 generated / 6 partial**, all working with **0 failures** in those three states. The audit also reports the seven known `planned` pattern-word-problem failures, including the intentionally deferred Grade 1 record. Grade 1 itself contains 13 ready, 2 partial, 33 generated/internal, and 1 planned records. Those catalog states do not equal founder-review categories.

The authoritative founder CSV contains 12 reviewed ready worksheets. It intentionally contains no Exit Tickets, partial resources, generated resources, or planned resources. Prior founder notes establish the accepted print rules used here: concise worksheet-level instructions, numbered questions, answer keys that mirror student layout, sufficient work space, and no crowding merely to meet a requested count.

## Resource architecture table

Preview and PDF normally share `buildCatalogWorksheetRuntime`; worksheet answer keys flow through the shared answer-key transform and PDF renderer. The one format exception below is deliberate: the Exit Ticket uses the same seeded content runtime but a dedicated cut-apart PDF renderer.

| Cat. | Resource | Catalog / ownership path | Current seeded output | Preview, PDF, key, and coverage |
| --- | --- | --- | --- | --- |
| F | `grade1_addition_subtraction_facts_word_problems` | generated; `addition_subtraction_facts` recipe -> generic `wordProblems` -> shared builder; catalog declares equation practice, runtime resolves to word-problem layout | 12 one-column contextual items; current sample is addition-only within 20; 3 per page with work boxes; generic teacher-facing instruction | Same runtime object and seed across preview/PDF; shared text answer key. Audit coverage only; no resource-specific Grade 1 test or founder proof. |
| F | `grade1_multiplication_facts_missing_factor` | generated; `multiplication_facts` recipe -> `missingFactor` -> shared builder and fluency grid | 60 abstract equations such as `__ × 10 = 60`; factors 2-10 and products up to 100 | Deterministic preview/PDF and shared key. Generic audit only; approved arrays/equal-groups tests cover the nearest sibling family, not this contract. |
| F | `grade1_multiplication_facts_word_problems` | generated; `multiplication_facts` recipe -> generic `wordProblems` -> shared word-problem layout | 12 group stories; current factors 2-10 and totals commonly above 10; no model or drawing prompt | Deterministic preview/PDF and shared key. Generic audit only; no focused test or founder proof. |
| F | `grade1_place_value_representation_number_line_identify` | generated; `place_value_representation` recipe -> `numberLineIdentify` -> structured number-line visual -> shared visual layout | 10 marked number lines, values 0-10, 5 per page | Deterministic visual preview/PDF and shared visual key. Generic audit only; the focused Grade 1 number-line test belongs to the approved canonical duplicate. |
| F | `g1_compare_numbers_to_20_exit_ticket` | ready curated Grade 1 Exit Ticket -> `compareNumbers`; shared catalog runtime for truth; dedicated `exitTicketPdfRenderer` | 3 comparison questions within 20; two identical cut-apart tickets plus optional key page | Deterministic content parity; dedicated renderer owns format and key page. Covered by the ready-catalog audit and route checks, but deliberately excluded from the founder worksheet packet. |
| B | `g1_write_the_numeral_to_50` | partial; Grade 1 number-representation adapter -> `numberWordMatch` in `word_to_numeral` mode -> dedicated numeral-response layout in shared PDF | Default 20 number words with short numeral response lines; supports 0-50, selected values, 30-question three-column mode, multi-page mode, example, and mirrored key | Strong parity and focused coverage in `testGrade1NumberRepresentationRuntime.js`; founder recheck approved and runtime committed. Partial status blocks the public detail route. Description/teacher note still contain pre-approval deferral wording. |
| G | `grade1_addition_subtraction_word_problems_addition_word_problem` | generated; generic word-problem path | 12 addition stories | Deterministic shell, but duplicates approved `g1_addition_word_problems`; generic audit only. |
| G | `grade1_addition_subtraction_facts_fact_family` | generated; generic fact-family path | 12 fact families in a generic grid | Duplicates approved `g1_fact_families_within_20`; generic audit only. |
| G | `grade1_addition_subtraction_facts_fact_fluency` | generated; generic fact-fluency path | 12 mixed addition facts | Duplicates the approved addition/subtraction fluency family; generic audit only. |
| G | `grade1_addition_subtraction_facts_missing_addend` | generated; generic missing-addend path | 12 abstract missing-addend equations | Duplicates approved `g1_missing_addends_within_20`; generic audit only. |
| G | `grade1_addition_subtraction_facts_related_subtraction` | generated; generic related-subtraction path | 12 subtraction equations | Adds no distinct role beyond approved subtraction and relationship resources; generic audit only. |
| G | `grade1_addition_subtraction_facts_ten_frame` | generated; generic ten-frame path | 10 visual count/fact items | Duplicates the approved ten-frame family; generic audit only. |
| G | `grade1_fraction_equivalence_fraction_number_line` | generated legacy fraction shell | Blank/malformed generic rows; no number-line model; unseeded legacy generator contract | Fails the structured-visual quality gate despite catalog audit acceptance; intentionally excluded from the approved Grade 1 fraction family. |
| G | `grade1_place_value_representation_compare_numbers` | generated; generic comparison path | Current default can emit three-digit comparisons | Both duplicates `g1_compare_numbers_to_20` and violates Grade 1 range; generic audit only. |
| G | `grade1_place_value_representation_number_word_match` | generated; generic number-word path | Current default can emit three-digit values | Duplicates the approved number-word/numeral family and exceeds Grade 1 range; generic audit only. |
| G | `grade1_place_value_representation_standard_form` | generated; generic place-value form path | Current default can emit three-digit expanded-form prompts | Superseded by the controlled Grade 1 expanded-form and numeral-writing family; generic audit only. |
| G | `grade1_patterning_and_algebra_function_table` | generated; generic function-table path | Text-only input/rule table using arithmetic beyond the approved Grade 1 pattern family | No approved Grade 1 visual/public contract; generic audit only. |
| G | `grade1_patterning_and_algebra_pattern_word_problems` | planned; no owned generator/runtime | No worksheet output | Correctly planned/deferred; audit reports the expected non-runnable state rather than a usable resource. |

Architecture conclusion: no remaining F/B item requires a new cross-grade abstraction. The only mature unresolved implementation is the B resource, and it already uses the correct shared Grade 1 adapter. Building either multiplication candidate would require a new Grade 1 story/drawing contract while duplicating the approved arrays/equal-groups ownership boundary.

## Duplication and instructional-value findings

| Resource | Nearest approved resource/family | Distinct teacher use? | Finding |
| --- | --- | --- | --- |
| Generic addition/subtraction word problems | `g1_addition_word_problems`, approved subtraction word problems, approved missing-addend word problems | No | The generic title does not identify a stable operation or problem structure. The current seed collapses to addition, which is already better served by a controlled full-width family. **Duplicate—defer.** |
| Missing Factors | Arrays and Equal Groups | Not at Grade 1 | Abstract inverse multiplication practice is a different task, but not a launch-safe Grade 1 task. Its products to 100 and blank-factor notation move beyond the approved drawing-led scope. **Grade 2+—defer.** |
| Generic multiplication word problems | Equal Groups | Only after a major narrowing | A viable Grade 1 version would be an Equal Groups story mode with totals no greater than 10, tools/drawings, and adequate workspace. That is not the current resource and does not justify a second public family. **Consolidate only if revived later; defer now.** |
| Generic number-line identify | `g1_number_line_identify_to_20` | No | Same student action, same visual model, narrower current range, and a less mature layout. **Duplicate—defer.** |
| Compare Numbers Exit Ticket | `g1_compare_numbers_to_20` worksheet | Yes, by format | A three-question lesson-close signal is distinct from a practice worksheet. The distinction belongs to the Exit Ticket lane, not the founder worksheet queue. **Remove from active worksheet review.** |
| Write the Numeral to 50 | `g1_number_word_match_to_50` | Yes | Reverse response direction: students read words and write numerals. The dedicated response geometry and controls are already implemented and approved. **Promotion gate next.** |

The existing approved Grade 1 collection already provides addition and subtraction practice, three word-problem structures, fact relationships, number-line identification and addition, compare-to-20 practice, number-word writing in both directions, arrays/equal groups, and skip counting. None of the four generated F worksheets closes a launch-critical instructional gap.

## Curriculum fit

The versioned local Ontario source (`data/curriculum/ontario/math_k6.json`, version 2026-03-06) is the curriculum source of truth for this decision. Yellow Bird applies it conservatively: print clarity, concrete representations, and stable task ownership matter alongside expectation coverage.

| Candidate | Classification | Grade 1 boundary |
| --- | --- | --- |
| Generic addition/subtraction word problems | **SAFE FOR GRADE 1**, but duplicate | B2.1/B2.4 support contextual addition/subtraction. The current output stays within 20, but it has no distinct role beyond the approved controlled word-problem family. |
| Missing Factors | **BETTER FOR GRADE 2+** | B2.5 asks for equal-group problems with totals no greater than 10 using tools and drawings. Abstract factors 2-10 and products to 100 conflict with that interpretation. |
| Multiplication word problems | **SAFE WITH NARROWED SCOPE**; current output is a **CURRICULUM CONFLICT** | A Grade 1 version must be equal-group reasoning, total <= 10, drawing/tool-led, and free of a facts-fluency frame. Current stories exceed those limits and provide no model. |
| Number-line identify | **SAFE FOR GRADE 1**, but duplicate | Number magnitude on 0-20 is already owned by the approved full-width number-line resource. |
| Compare Numbers Exit Ticket | **SAFE FOR GRADE 1** | B1.3 permits compare/order to 50; this resource conservatively stays within 20 and uses it as a brief formative check. |
| Write the Numeral to 50 | **SAFE FOR GRADE 1** | B1.1 explicitly covers reading and representing whole numbers to 50. The word-to-numeral direction is direct, bounded, and distinct. |

Grade 1 closure should not be used to introduce formal multiplication-fact fluency, missing-factor notation, products to 100, model-free equal-groups stories, or a second implementation of an already-approved number-line task.

## Closure scenarios

These scenarios keep the 49-resource inventory invariant and describe reconciliation categories, not catalog promotion.

| Scenario | Disposition | Resulting A/B/F/G | Cost and risk |
| --- | --- | --- | --- |
| A. Build/approve all five F items | Implement or accept all five as founder-approved | **A36 / B1 / F0 / G12** | Highest cost; creates two direct duplicates, approves one later-grade abstraction, duplicates equal-groups ownership, and mixes Exit Ticket review into the worksheet gate. Not recommended. |
| B. Recommended closure with deferrals | Defer four generated worksheets; remove the ready Exit Ticket from active worksheet review into the format lane | **A31 / B1 / F0 / G17** | No implementation or proof cost. Preserves distinct ownership, curriculum boundaries, and review-scope integrity. |
| C. Approve only the existing Exit Ticket | Defer four generated worksheets; conduct a format-specific founder decision for the already-ready Exit Ticket | **A32 / B1 / F0 / G16** | Low implementation cost but adds an unnecessary founder gate for a format already validated outside the worksheet packet. Reasonable only if policy requires every Grade 1 format to enter Category A. |

Under Scenario B, a later authorized promotion/reconciliation of the B resource would produce **A32 / B0 / F0 / G17**. That release decision is not required to close founder review.

## Recommended implementation scope

**No Grade 1 implementation is recommended.**

| Resource | Final recommendation |
| --- | --- |
| `grade1_addition_subtraction_facts_word_problems` | **DEFER TO G** |
| `grade1_multiplication_facts_missing_factor` | **DEFER TO GRADE 2+** |
| `grade1_multiplication_facts_word_problems` | **DEFER TO G** |
| `grade1_place_value_representation_number_line_identify` | **DEFER TO G** |
| `g1_compare_numbers_to_20_exit_ticket` | **REMOVE FROM ACTIVE GRADE 1 REVIEW** |
| `g1_write_the_numeral_to_50` | **PROMOTION GATE NEXT** |

The next authorized work should be administrative and release-scoped:

1. Update reconciliation categories only after the founder accepts this closure plan: four generated F worksheets to G and the Exit Ticket out of active worksheet review to G/format-lane deferral.
2. Run a separate promotion gate for `g1_write_the_numeral_to_50` when public release is desired.
3. Do not change the approved arrays/equal-groups, word-problem, number-line, comparison, or number-representation runtimes as part of closure.

If multiplication word problems are ever revived, they must become an explicit mode of the owned Grade 1 Equal Groups truth model—not another generic `wordProblems` resource—and must enforce total <= 10, drawing space, concrete group language, deterministic uniqueness, and mirrored answer-key truth.

## Proof and founder-review plan

No founder PDF packet is needed for the recommended plan because no implementation is proposed.

- Category F closure is a disposition decision supported by this source/runtime/curriculum scan.
- The Exit Ticket already renders through its validated two-up cut-apart format; approving or deferring its founder category is a format-policy decision, not a new proof requirement.
- `g1_write_the_numeral_to_50` already has approved default and reduced founder-recheck evidence. Do not regenerate that packet for closure.

If the founder chooses Scenario C, inspect one existing seeded Exit Ticket PDF plus its answer-key page; do not create a new batch or a worksheet-style packet. If the B promotion gate is authorized later, use the existing numeral proofs for regression comparison and perform route/download smoke checks after the status change.

## Promotion and launch-readiness gate

`g1_write_the_numeral_to_50` can remain in Category B while founder review closes. Category B means founder approval is complete and public promotion is deliberately separate.

Future promotion checklist:

1. Record explicit promotion authorization.
2. Remove stale pre-approval wording from its catalog description and teacher note; preserve its approved title and Grade 1 bounds.
3. Change only the authoritative catalog/status surfaces required by the promotion contract and rebuild generated catalog metadata if that workflow requires it.
4. Run `testGrade1NumberRepresentationRuntime.js` and the full worksheet audit.
5. Compare preview, PDF, completed example, multi-page layout, and answer key against the committed approved behavior.
6. After promotion, verify the public detail route, preview, and PDF download; partial status correctly prevents that public smoke test today.
7. Update reconciliation B -> A only in the same authorized checkpoint or a later explicit reconciliation pass.

The five F dispositions do not require promotion. The Exit Ticket is already ready/public and should remain unchanged; this preflight changes only how founder-review scope should classify it.

## AI-readiness notes

The recommended plan improves AI readiness by reducing ambiguous duplicate ownership rather than adding more templates.

- **Structured item schema:** the B numeral resource, canonical number line, approved equal-groups family, and Exit Ticket carry stable item truth. Generic word-problem candidates carry usable text/answers but lack a Grade 1-specific problem-structure contract. The legacy fraction number-line G item fails this criterion and remains closed.
- **Deterministic seed behavior:** all five F items and the B item reproduced under the same seed in this scan. Determinism does not make an output curriculum-safe or instructionally distinct.
- **Explicit model ownership:** approved word problems, number-line work, equal groups, and numeral writing already have owners. Deferring generic siblings prevents two templates from claiming the same concept with different quality rules.
- **Narrow renderer responsibility:** mathematics and answer truth stay upstream; the shared worksheet renderer owns layout, the number-line primitive owns geometry, and the dedicated Exit Ticket renderer owns only the cut-apart format.
- **Answer-key truth:** the F/B seeded worksheets resolve through the same answer objects used for PDF keys; the Exit Ticket's dedicated key page uses the same comparison truth. Any future story-mode work must preserve this single truth source.
- **Stable naming:** the generic `Word Problems — Grade 1` titles are too ambiguous for durable retrieval or template selection. Deferral avoids teaching an AI authoring layer to choose between indistinguishable resources.
- **Validation:** the B resource has focused tests. The F items rely mostly on the broad audit, which proves runtime completion but not instructional quality. Closure therefore relies on explicit curriculum, distinct-use, range, and visual-model gates rather than audit status alone.

## Final verdict

**READY TO CLOSE GRADE 1 WITH DEFERRALS ONLY**

Minimum authorized closure batch: no production implementation and no new proof packet; accept the five F dispositions, keep the single B resource for a separate promotion gate, then update reconciliation in a dedicated checkpoint.
