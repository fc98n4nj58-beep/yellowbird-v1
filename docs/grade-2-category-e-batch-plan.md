# Grade 2 Category E Batch Plan

Date: 2026-07-15

Scope: Category E batch plan plus implementation checkpoints authorized by later founder briefs. Catalog-status changes, promotion, and reconciliation changes remain outside this document.

## Batch 2 founder-approved contract checkpoint, 2026-07-15

Commit `0a1db99` standardized adjacent Grade 2 Category C addition/subtraction resources, but did not implement any of the exact Batch 2 IDs. No later committed production change superseded the original catalog/runtime paths for `g2_addition_fluency_within_100`, `g2_missing_addends_within_100`, `g2_subtraction_fluency_within_100`, or `grade2_addition_subtraction_facts_related_subtraction` before the current unstaged work.

The authoritative committed defaults for the three within-100 resources are 12 questions, four columns, a 60-question page capacity, one student page plus one answer-key page, the shared short-numeric answer target, and no completed example. Twelve-question founder proofs therefore preserve the established density; they are not a diagnostic override or regression. The committed defect is narrower: default arithmetic remains in the easy recipe range instead of visibly exercising values beyond 20, and public presentation exposes stale catalog wording/internal footer labels.

None of the three exact Grade 2 IDs is registered in the teacher-customization family registry. The shared raw catalog runtime nevertheless accepts `questionCount`, `questionsPerPage`, range operands (`minA`, `maxA`, `minB`, `maxB`, and addition/missing-addend `maxTotal`), number selection (`selectedNumbers`/`onlyNumbers`), `worksheetSeed`, and the `includeExample` / `completedExample` / `example` aliases. Missing-addend position is not functional in committed HEAD; the current worktree adds `first`, `second`, and `mixed`. There is no exact-ID public contract for operation mode, text size, layout mode, or answer format. `includeAnswerKey` remains a PDF-render option rather than an exact-ID generator option.

The unstaged range adapters, structured missing-addend/subtraction routing, public titles/instructions/footers, seeded truth, pagination, and shared answer-target geometry are narrow fixes rather than duplicated completed work. Completed-example compatibility is restored without changing the default: each supported alias now produces one completed example plus the requested 12 student questions. Addition retains weighted selected-number emphasis; Missing Addends and Subtraction restore strict source-operand restriction for `selectedNumbers` / `onlyNumbers`, with explicit no-candidate errors for impossible selections. Focused checks cover counts 1, 12, 20, and 75, 30-question pagination, all example aliases, both selection aliases, missing-position modes, answer-key parity, and cross-grade isolation.

The 12-question default and within-100 corrections remain authoritative. Founder recheck is complete. Related Subtraction remains ordinary subtraction with no source fact or derived related response; its approved decision is **DEFER — DUPLICATES SUBTRACTION FLUENCY**, moving it from E to G without changing its catalog record or implementation. This committed Batch 2 checkpoint reconciles the three implemented resources from E to A and Related Subtraction from E to G. Reconciliation is A33 / D0 / E3 / G16 / Total52.

## Batch 2 implementation checkpoint, 2026-07-15

Batch 1 was committed in `8fba97067d79029ad3a13931201f9b33f8e8ce98`. Batch 2 implements three established fluency-family resources through narrow Grade 2 within-100 adapters:

- `g2_addition_fluency_within_100`: `Addition Facts Within 100`; `Solve each addition fact.`; sums capped at 100 through the shared addition-fact generator.
- `g2_missing_addends_within_100`: `Missing Addends Within 100`; `Write the missing number in each equation.`; totals capped at 100 with balanced first- and second-addend blanks through the established missing-addend family.
- `g2_subtraction_fluency_within_100`: `Subtraction Facts Within 100`; `Solve each subtraction fact.`; nonnegative differences with minuends capped at 100 through the established subtraction-fact family.

All three retain 12 default questions, the shared four-column fluency layout and short numeric answer target, one student page plus one answer-key page, catalog status `ready`, and the public footer `Grade 2 • Math • Addition and Subtraction`. The focused suite passes 30 deterministic seeds per resource, zero same-seed failures, meaningful different-seed variation, within-100 arithmetic truth, values beyond 20, missing-position balance, preview/PDF parity, student/key parity, exact two-page PDFs, and Grade 1/Grade 3+ isolation. Grade 1 fluency, Grade 2 addition/subtraction, shared answer-target/pagination, and addition-customization regressions pass; the worksheet audit remains Ready 104/104, Generated 213/213, Partial 5/5, Total331, with only the seven established planned gaps.

Founder proofs:

- `review/grade-2-category-e-batch-2/founder-review/g2_addition_facts_within_100_default_student_and_key.pdf`
- `review/grade-2-category-e-batch-2/founder-review/g2_missing_addends_within_100_default_student_and_key.pdf`
- `review/grade-2-category-e-batch-2/founder-review/g2_subtraction_facts_within_100_default_student_and_key.pdf`

Founder review is complete. `grade2_addition_subtraction_facts_related_subtraction` remains technically unchanged and receives the approved decision **DEFER — DUPLICATES SUBTRACTION FLUENCY**: its current page is a set of ordinary subtraction equations with no source addition equation, derived related fact, or visible relationship mechanism. Reconsider only when a distinct source-fact and related-response contract is founder-approved.

Batch 2 is founder-approved and committed through this checkpoint. Reconciliation moves from A30 / D0 / E7 / G15 / Total52 to A33 / D0 / E3 / G16 / Total52. Catalog statuses remain unchanged.

## Batch 1 implementation checkpoint, 2026-07-15

Batch 1 is implemented and founder-approved. `grade2_multiplication_facts_arrays` now defaults to exactly eight structured array questions in the existing two-column multiplication-sentence family. Its final public title is `Arrays`, its instruction remains `Use each array to write a multiplication equation.`, and its footer is `Grade 2 • Math • Multiplication & Division`. Standard 2.4-point dot radii, row-by-column truth, `a × b = c` response targets, seeded determinism, and student/key parity are unchanged. The resulting proof is one student page plus one answer-key page.

`g2_base_ten_blocks_representation` now uses the concise established-family public contract `Base Ten Blocks` with `Count the base ten blocks. Write the number.` Its final footer is `Grade 2 • Math • Place Value`. Repeated item-level task prose is suppressed through the existing layout flag while the structured prompt remains available before rendering. The existing base-ten primitives, tens/ones truth, standard short response line, seeded determinism, and student/key parity are unchanged. Its proof is one student page plus one answer-key page.

Internal skill identifiers have been removed from both public footers. Founder recheck is complete; catalog statuses remain `ready`, and the approved reconciliation move is A30 / D0 / E7 / G15 / Total52.

The focused two-resource suite passes 30 deterministic seeds per resource, same-seed stability, meaningful different-seed variation, preview/PDF truth parity, answer-key parity, exact two-page PDFs, standard array dot geometry, and Grade 1/Grade 3+ isolation. Both proofs were inspected page by page and classified **FOUNDER REVIEW READY**:

- `review/grade-2-category-e-batch-1/founder-review/g2_arrays_default_student_and_key.pdf`
- `review/grade-2-category-e-batch-1/founder-review/g2_base_ten_blocks_default_student_and_key.pdf`

Catalog lifecycle status remains independent of reconciliation. Both Batch 1 records remain `ready`; only their architecture classification moves from E to A. The seven remaining Category E records comprise five `ready` and two `generated` resources. Reconciliation is A30 / D0 / E7 / G15 / Total52.

## Inventory result and source conflict

The authoritative reconciliation contains exactly nine Category E IDs, each once, at A28 / D0 / E9 / G15 / Total52. The master catalog does **not** support the requested statement that all nine are `generated`: seven are `ready` and two are `generated`. This lifecycle-status conflict must be carried into founder planning; this scan does not change it.

| Resource ID | Current title | Status | Category E defect | Generator / family | Renderer / layout | Nearest approved family | Size | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `g2_addition_fluency_within_100` | Addition Fluency Within 100 | `ready` | Title promises 100; default truth remains within 20. | `factFluency.js`; addition facts | shared `fluency_grid` | Grade 1 Addition Facts and Grade 2 addition quick-check lane | MODERATE | IMPLEMENT |
| `g2_addition_word_problems_within_100` | Addition Word Problems Within 100 | `ready` | Arithmetic range is usable, but context/instruction ownership is stale and repetitive. | `wordProblems.js`; addition application | shared `equation_practice` work-space layout | approved Grade 2 subtraction/missing-addend word-problem family | MODERATE | IMPLEMENT |
| `g2_missing_addends_within_100` | Missing Addends Within 100 | `ready` | No exact-ID Grade 2 maximum-total adapter; output remains within 20. | `missingAddend.js`; relational thinking | shared `fluency_grid` | approved `grade2_addition_subtraction_facts_missing_addend` within-20 family | MODERATE | IMPLEMENT |
| `g2_subtraction_fluency_within_100` | Subtraction Fluency Within 100 | `ready` | Title promises 100; `relatedSubtraction.js` defaults remain within 20. | `relatedSubtraction.js`; subtraction facts | shared `fluency_grid` | Grade 1 Subtraction Facts and Grade 2 subtraction quick-check lane | MODERATE | IMPLEMENT |
| `grade2_addition_subtraction_facts_related_subtraction` | Related Subtraction — Grade 2 | `ready` | Runtime is ordinary subtraction and is currently indistinguishable from subtraction fluency; no visible related-facts task. | `relatedSubtraction.js`; fact fluency | shared `fluency_grid` | approved Grade 2 fact-family/relational-equation families | LARGE | NEEDS FOUNDER DECISION |
| `grade2_data_display_graphing_graph_word_problems` | Graph Word Problems — Grade 2 | `generated` | Recipe activity has no registered generator, so the worksheet produces zero problems and lacks structured graph truth. | missing `graph_word_problems` generator; data application | nominal `equation_practice`; no valid graph-task layout | approved Grade 2 Read/Interpret Pictograph family | LARGE | DEFER |
| `grade2_multiplication_facts_arrays` | Arrays — Grade 2 | `ready` | Healthy array truth, but 10 default items conflict with the founder-approved fixed eight-item model-family contract. | `array.js` + `multiplicationModelFactors.js`; arrays | shared `model_interpretation` / multiplication-model renderer | approved Grade 1 Arrays and Grade 2 Equal Groups | SMALL | IMPLEMENT |
| `grade2_multiplication_facts_word_problems` | Word Problems — Grade 2 | `generated` | Usable arithmetic shell lacks Grade 2 factor/context caps and an explicit equal-groups title/instruction. | `wordProblems.js`; multiplication application | shared `equation_practice` work-space layout | approved Grade 2 Equal Groups | MODERATE | IMPLEMENT |
| `g2_base_ten_blocks_representation` | Base Ten Blocks Representation | `ready` | Structured model is sound; repeated per-item prose and catalog-style instruction need a task-specific Grade 2 presentation. | `baseTenBlocks.js`; place-value visual model | shared `visual_model` / base-ten renderer | approved Grade 1 Base Ten Blocks and Grade 2 number-representation families | SMALL | IMPLEMENT |

Inventory checks: nine IDs, nine unique master-catalog records, seven `ready`, two `generated`; reconciliation unchanged at A28 / D0 / E9 / G15 / Total52.

## Proposed batches

### 1. Visual Model Contract Corrections

- IDs: `grade2_multiplication_facts_arrays`; `g2_base_ten_blocks_representation`.
- Shared family: mature structured visual models using existing array/base-ten renderers.
- Common defect: resource-specific count, instruction, and repeated-prompt defaults rather than mathematical truth.
- Approach: add exact-ID runtime/layout parameters; set Arrays to the approved eight-item capacity; give Base Ten Blocks one clear page instruction and suppress redundant item prose using existing layout capabilities. No new renderer or visual system.
- Likely files: `services/worksheetCatalogService.js`; existing generator only if an exact parameter cannot be passed safely; one focused batch test; one proof-generator script; this plan or a later implementation checkpoint.
- Tests: deterministic seeds, eight-item array contract, factor/product truth, base-ten value/tens/ones parity, student/key parity, Grade 1 and sibling Grade 2 isolation, page-count and overflow checks.
- Proof packet: one combined founder packet containing two student/key PDFs.
- Risk: LOW.
- Recommended order: first.

### 2. Within-100 Fluency and Relationship Decision

- IDs: `g2_addition_fluency_within_100`; `g2_missing_addends_within_100`; `g2_subtraction_fluency_within_100`; `grade2_addition_subtraction_facts_related_subtraction`.
- Shared family: arithmetic generators feeding the shared `fluency_grid` renderer.
- Common defect: title/truth range mismatch; the fourth record also lacks a distinct related-facts model.
- Approach: implement exact-ID Grade 2 range adapters for the three genuinely distinct within-100 resources. Treat Related Subtraction as a founder decision: define a visible fact relationship before implementation or defer it as a duplicate of subtraction fluency.
- Likely files: `services/worksheetCatalogService.js`; `engine/problemGenerators/factFluency.js`, `missingAddend.js`, and `relatedSubtraction.js` only where shared option handling is insufficient; one focused test and proof-generator script.
- Tests: 30 deterministic seeds per retained ID, range/operation/missing-position truth, uniqueness and variation, fluency-grid capacity, student/key parity, within-20 and assessment isolation. The decision-only record receives no proof unless a distinct contract is approved.
- Proof packet: one combined packet with three PDFs plus one decision sheet; no proof for a deferred duplicate.
- Risk: MODERATE; HIGH if a new Related Subtraction model is required.
- Recommended order: second.

### 3. Contextual Application and Data Deferral

- IDs: `g2_addition_word_problems_within_100`; `grade2_multiplication_facts_word_problems`; `grade2_data_display_graphing_graph_word_problems`.
- Shared family: contextual application tasks, currently assigned to `equation_practice`-style work space.
- Common defect: weak task ownership and public wording; the graph record additionally has no structured generator.
- Approach: retain and correct the addition and equal-groups word-problem resources through existing context, factor, instruction, and work-space controls. Defer Graph Word Problems rather than create a new graph application model during launch closure.
- Likely files: `services/worksheetCatalogService.js`; `engine/problemGenerators/wordProblems.js`; one focused test and proof-generator script. No graph generator or renderer work under the recommended deferral.
- Tests: deterministic context/template variation, Grade 2 range/factor caps, semantic answer truth, duplicate suppression, work-space and answer-key parity, sibling word-problem isolation.
- Proof packet: one combined packet with two PDFs and a one-page deferral rationale; no graph proof.
- Risk: MODERATE under the recommended split; HIGH if Graph Word Problems is implemented.
- Recommended order: third.

## Duplicate and deferral decisions

- `grade2_addition_subtraction_facts_related_subtraction`: current output duplicates `g2_subtraction_fluency_within_100`. Recommended launch disposition is deferral unless the founder approves a visibly distinct related-facts contract. Reconsider when a fact-family source equation, related subtraction pair, and response mechanism are approved. With founder approval to defer, move E to G.
- `grade2_data_display_graphing_graph_word_problems`: not launch-ready and not a small extension; it has no generator and overlaps the mathematical purpose of approved Read/Interpret Pictograph resources and the already-deferred mixed Graph Questions preset. Reconsider only when a distinct multi-step graph-application objective and structured truth model are approved. With founder approval to defer, move E to G.
- The other seven records are genuinely distinct after narrow correction. Arrays and Base Ten Blocks are not duplicates of their retired generic shells; their curated/precise records are the stronger launch candidates. The addition, missing-addend, subtraction, addition-story, and equal-groups-story records each retain a distinct task role.

## Recommended first action

Run a narrow preflight for Batch 1 only: confirm the existing eight-item array capacity and Base Ten Blocks prompt-suppression/layout flags, define one combined two-resource founder packet, then implement both through exact-ID runtime/layout adapters with one focused test and one commit after approval.

## Reconciliation scenarios

No move occurs during this planning scan: A28 / D0 / E9 / G15 / Total52.

- After founder approval and commit of Batch 1: A30 / D0 / E7 / G15 / Total52.
- Recommended outcome after Batch 2 (three implementations; Related Subtraction deferred): A33 / D0 / E3 / G16 / Total52.
- Recommended final outcome after Batch 3 (two implementations; Graph Word Problems deferred): A35 / D0 / E0 / G17 / Total52.
- If the founder instead approves distinct implementations for all nine: A37 / D0 / E0 / G15 / Total52.

Catalog lifecycle status is independent of reconciliation. Because the current master catalog is seven `ready` and two `generated`, any instruction that assumes all nine are `generated` must be corrected before a future status-sensitive checkpoint.
