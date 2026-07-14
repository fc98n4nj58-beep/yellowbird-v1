# Grade 2 Concrete Fractions Preflight

## Current state

This planning pass covers exactly `grade2_fraction_equivalence_shade_fraction_models` and `grade2_fraction_equivalence_fraction_word_problems`. Both records are `generated`, both are reconciliation Category D, and neither is promoted. The catalog remains Ready 104/104, Generated 213/213, Partial 5/5, Total 331, with the seven established `pattern_word_problems` gaps only. Grade 2 reconciliation remains A22 / B0 / C0 / D7 / E9 / F0 / G14, Total 52.

The protected untracked paths present before this pass are `engine/catalog/`, `engine/visuals/index`, `engine/visuals/renderVisual.js`, `public/styles/images/`, and `review/`. They are unrelated and must remain untouched.

## Resource inventory

| Resource | Current public metadata | Kind and status | Current runtime result | Reconciliation |
| --- | --- | --- | --- | --- |
| `grade2_fraction_equivalence_shade_fraction_models` | `Shade Fraction Models — Grade 2`; `Generated worksheet for shade fraction models.` | Math / Grade 2 / Fractions; worksheet; `generated`; `hasAnswerKey: true` | Builder requests 12 items, but each activity call returns an array. Normalization converts the 12 arrays into 12 empty generic rows. No prompt, answer, `fractionModel`, or meaningful key survives. | D |
| `grade2_fraction_equivalence_fraction_word_problems` | `Fraction Word Problems — Grade 2`; `Generated worksheet for fraction word problems.` | Math / Grade 2 / Fractions; worksheet; `generated`; `hasAnswerKey: true` | Preferred activity has no registered generator. The worksheet contains zero items and the key is empty. | D |

Both records use `skillKey: fraction_equivalence`, `worksheetFamily: generated`, and the legacy `equation_practice` template. The nearest approved families are Grade 1 `fraction_strip` for shading and Grade 1 `fair_share_set` for fair sharing. The other active Grade 2 fraction records are Category G symbolic or representation deferrals: Compare Fractions, Match Equivalent Fractions, and Fraction Number Line. They are not part of this preflight. No second active Grade 2 record duplicates either concrete task.

## Runtime traces

Both records currently follow the same outer route:

`worksheet catalog` → `worksheetCatalogService.generateWorksheetFromCatalogId` → `buildWorksheet` → `fraction_equivalence` activity recipe → activity generator registry → layout normalization → catalog runtime content normalization → shared preview/PDF runtime → `pdfRenderer` → answer-key transformation.

Preview and PDF therefore share the same generated content path. Routes do not own fraction mathematics. The defects occur before rendering.

### Shade Fraction Models

The recipe selects `shade_fraction_models`. `shadeFractionModels.js` returns an array from every activity invocation even though the builder contract expects one item. It also calls global `Math.random` instead of the injected seeded random source. The builder's 12 results are therefore arrays, and generic normalization produces 12 blank items. Apparent same-seed equality is not evidence of determinism: the underlying generator bypasses the seed, while all surviving normalized output is empty.

The output does not use `fraction_strip`; it has no structured equal-part geometry or answer state. The generic two-column `equation_practice` layout is selected, and the current footer exposes `fraction_equivalence`. The declared answer-key support has no trustworthy truth to render.

Architecture classification: **MALFORMED NORMALIZATION**, **MISSING STRUCTURED MODEL**, **LEGACY FALLBACK REPLACEMENT REQUIRED**, **SHARED FAMILY WITH GRADE 2 PARAMETER ADAPTER**, and **TITLE/TASK MISMATCH**.

### Fraction Word Problems

The recipe selects `fraction_word_problems`, but no indexed generator implements that activity. The builder consequently creates zero items. The output does not use `fair_share_set`, contains no sharing truth, has no illustration or response model, and yields no meaningful answer-key content. Its empty output is trivially same-seed stable but cannot demonstrate variation or correctness. The generic footer also exposes `fraction_equivalence`.

Architecture classification: **MISSING STRUCTURED MODEL**, **LEGACY FALLBACK REPLACEMENT REQUIRED**, **SHARED FAMILY EXTENSION REQUIRED**, and **TITLE/TASK MISMATCH**.

The approved Grade 1 renderer renders generator-owned `fractionModel` and `answerState`; it does not decide the numerator, denominator, partition, quotient, or assignment. That ownership boundary must remain. Existing Grade 1 handling is exact-ID gated, so the Grade 2 adapters can be added without changing Grade 1 or Grade 3+ defaults. The current Grade 1 isolation assertion for these targets will eventually require a deliberate test update, but no test changes belong in this planning pass.

## Shade Fraction Models findings

The defensible task is: **shade a named fraction of a pre-partitioned strip**. It is not identification, matching, comparison, student-created partitioning, or symbolic equivalence. One strip per question is sufficient. The fraction label is the prompt; the student shades inside an already partitioned same-whole rectangle. The answer key repeats the identical strip with the exact generator-owned parts shaded.

Launch should use rectangles only. Mixed circles and rectangles add equal-sector and perceptual-area risk without improving the task. All strips must use the same external dimensions, with exactly equal internal cells. The launch pool is exactly `1/2`, `1/3`, `2/3`, `1/4`, `2/4`, `3/4`, `1/6`, and `2/6`, once each. These values provide halves, thirds, fourths, and sixths without asking students to prove equivalence. The same-whole rule applies even where equal values are visible.

The shared `fraction_strip` truth model is appropriate, but Grade 2 sixths require an explicit safe denominator extension. The existing Grade 1 renderer gate and `[2, 3, 4]` geometry guard must not simply be opened globally. Use an exact Grade 2 adapter with an allow-list that preserves Grade 1 behavior.

Product direction: **GRADE 2 FRACTION-STRIP ADAPTER** and **TITLE/TASK CORRECTION**. Curriculum classification: **SAFE WITH NARROWED DEFAULT** and **SAFE WITH TITLE OR INSTRUCTION CHANGE**. Design classification: **PRINT-READY AFTER SHARED-FAMILY REUSE**.

## Fraction Word Problems findings

The defensible task is: **use drawings to solve a fair-share situation and show the amount each child receives**. It is not general fraction arithmetic, a fairness yes/no task, or a broad collection of unrelated word problems. A narrower public title is required.

The default should cover 2, 3, 4, and 6 sharers exactly once. Use naturally partitionable, grayscale-safe rectangular objects only at launch: sandwich, paper strip, and granola bar. Avoid apples for thirds, fourths, or sixths until those piece silhouettes receive separate visual approval. Each scenario begins with at most 3 wholes and ends with no unassigned fractional pieces:

| Item | Source | Sharers | Exact share per child |
| ---: | --- | ---: | --- |
| 1 | 1 sandwich | 2 | `1/2` sandwich |
| 2 | 2 paper strips | 3 | `2/3` strip |
| 3 | 3 granola bars | 4 | `3/4` bar |
| 4 | 2 sandwiches | 6 | `2/6`, recognized as `1/3`, sandwich |

“No remainders” means the generator partitions each whole into the required equal pieces and assigns every piece; it does not require the original whole-object count to divide evenly. For every item, `sourceWholeCount × partitionCount` must be divisible by `sharerCount`, conservation must hold, and no unassigned piece may remain. Mixed-number outcomes, whole-number outcomes, totals above 10, symbolic operations, and comparisons between scenarios are deferred. Halves remain included as the low-complexity bridge to Grade 1.

The existing `fair_share_set` family is the correct ownership boundary, but the Grade 1 model supports whole and half-piece outcomes for 2 or 4 sharers only. Grade 2 needs a reviewed variant for thirds, fourths, and sixths, explicit piece assignments, denominator-aware shapes, conservation truth, and readable tray arrangements for 3, 4, and 6 children. The renderer must consume these fields rather than calculate the share.

Product direction: **SHARED FAMILY EXTENSION REQUIRED** and **NARROW TITLE/TASK REQUIRED**. Curriculum classification: **SAFE WITH NARROWED DEFAULT** and **SAFE WITH TITLE OR INSTRUCTION CHANGE**. Design classification: **FAMILY-LEVEL DESIGN CORRECTION**.

## Grade 1 family reuse map

| Grade 2 resource | Approved Grade 1 family | Reused contract | Grade 2 boundary |
| --- | --- | --- | --- |
| Shade Equal Parts | `fraction_strip` | Same-whole outer boundary, equal cells, named fraction, shaded answer state, shared student/key model | Exact Grade 2 ID adapter; add denominator 6 without changing Grade 1's 2/3/4 allow-list |
| Share Fairly to 10 | `fair_share_set` | Source objects, sharer trays, piece assignments, conservation, completed key visual | Exact Grade 2 variant; add 3/4/6-way pieces and layouts while freezing Grade 1 remainder-halves behavior |

## Curriculum findings

Ontario Grade 2 B1.6 calls for drawings that represent and solve fair-share problems involving up to 10 items and 2, 3, 4, or 6 sharers, including fractional amounts. B1.7 identifies one third and two sixths of the same whole as equal in fair-sharing contexts. The two proposed defaults stay concrete, use drawings, and avoid symbolic fraction operations.

The shade worksheet supports equal partitioning and numerator/denominator meaning through a named fraction and equal-part model. It does not claim that shading alone fully assesses B1.6 or B1.7. The fair-share worksheet directly addresses B1.6 and includes the B1.7 relationship in one concrete scenario, while avoiding a general equivalence claim. Same-whole identity is explicit in all model truth. Reading demand is limited to one short sharing sentence per item.

Fifths, eighths, tenths, circles, mixed numbers, comparisons, ordering, and free-response explanations are outside the launch defaults. They may be future reviewed overrides; they must not enter through unbounded random generation.

## Product-fit and duplication findings

| Resource | Nearest resource | Exact distinction | Fit |
| --- | --- | --- | --- |
| Shade Equal Parts | Grade 1 Shade Equal Parts; deferred Grade 2 matching/comparison records | Grade 2 includes thirds and sixths and requires students to construct shading, not select or compare a representation | **DISTINCT WITH SHARED-FAMILY REUSE**; retain as a distinct worksheet |
| Share Fairly to 10 | Grade 1 Share Fairly; Grade 2 Equal Groups | Students partition wholes and receive fractional shares; Equal Groups distributes countable whole objects and writes multiplication sentences | **DISTINCT WITH SHARED-FAMILY REUSE**; retain as a distinct worksheet |

Neither task is better as a card set, Quick Check, or Exit Ticket at launch. Both need drawable worksheet space and completed answer visuals. Teacher-selectable fraction pools, object types, and sharer counts are future customization controls, not separate catalog records.

## Design and print findings

Both worksheets use the established title → divider → instruction hierarchy, Grade 2 typography, and footer `Grade 2 • Math • Fractions`. No subtitle or internal skill identifier prints.

Shade Equal Parts uses eight cards in two columns by four rows on one student page. Each card reserves at least 190 × 42 pt for a same-size strip plus its fraction label and keeps a minimum practical cell width for sixths. No work box or full-width answer line is needed. The matching key page repeats the same eight strips and order with answer shading.

Share Fairly to 10 uses two full-width cards per student page across two student pages. Each card reserves approximately 500 × 225 pt for the source, child trays, drawing space, and one short `Each child gets ___` target. The two corresponding key pages repeat the exact models with every piece assigned and the fraction label completed. Six-child layouts should use a reviewed two-row arrangement rather than six narrow columns.

Completed-example mode stays off for both defaults. A worked example would either reduce model size or add pages, and neither task requires it before founder review.

## Proposed founder contracts

### Shade Equal Parts

- Title: `Shade Equal Parts`
- Instruction: `Shade the equal parts to show each fraction.`
- Footer: `Grade 2 • Math • Fractions`
- Fractions: exactly `1/2`, `1/3`, `2/3`, `1/4`, `2/4`, `3/4`, `1/6`, `2/6`, once each; seeded order may vary
- Items and layout: 8 items; 2 columns × 4 rows; one fixed-size rectangular strip per item
- Pages: 1 student page + 1 answer-key page
- Student response: shade cells in the pre-partitioned strip; no writing line
- Key: identical item order and strip truth with the requested numerator shaded
- Completed example: disabled
- Deferred controls: fraction pool, denominator, item count, order, and shape type
- Founder proof packet: 1 two-page default PDF

### Share Fairly to 10

- Title: `Share Fairly to 10`
- Instruction: `Share the objects equally. Draw the share each child gets.`
- Footer: `Grade 2 • Math • Fractions`
- Scope: the four exact source/sharer/share scenarios in the findings table; sharer counts 2, 3, 4, and 6 once each; every fractional piece assigned; no mixed-number or whole-number outcomes
- Items and layout: 4 full-width items; 1 column × 2 rows per student page; reviewed two-row tray layout for 6 sharers
- Pages: 2 student pages + 2 answer-key pages
- Student response: draw or mark each child's assigned pieces and complete the short `Each child gets ___` fraction target
- Key: identical source objects and tray order, completed piece assignments, plus the exact fraction per child; item 4 may display `2/6 = 1/3`
- Completed example: disabled
- Deferred controls: source count, object type, sharer pool, mixed-number/whole outcomes, task comparison, and optional worked example
- Founder proof packet: 1 four-page default PDF

## Recommended implementation sequence

Recommendation: **TWO SEQUENTIAL BATCHES**, with Shade Equal Parts first.

1. Implement the exact-ID Grade 2 `fraction_strip` adapter, denominator-6 geometry, structured shading truth, public copy, parity, focused regression, and one two-page proof.
2. After that family boundary is stable, extend `fair_share_set` for third/fourth/sixth pieces, 3/4/6-sharer layouts, conservation, structured fraction responses, focused regression, and one four-page proof.

The batches share fraction-model normalization, renderer access, public footer cleanup, seeded selection conventions, and student/key parity. They do not share enough generator truth or page geometry to justify one coupled implementation. Overall risk is **MODERATE**: the shade adapter is low-to-moderate; fair sharing is moderate because it adds piece shapes, tray layouts, and conservation cases. Founder burden is two review decisions and six proof pages total, not one blended packet.

## Test plan

Shared checks for the eventual implementation:

- exact two IDs only; both remain `generated` and Category D until founder approval;
- exact title, instruction, and public footer; no snake_case or internal IDs;
- same seed yields identical structured content and PDF truth; different seeds vary permitted order/context without changing the fixed contract;
- nonempty output, no generic fallback, no malformed array item, no completed example;
- preview, student PDF, and key derive from the same item truth;
- exact page counts, no clipping or footer collision;
- Grade 1 exact output and Grade 3+ behavior remain isolated.

Shade-specific checks:

- exactly 8 items and the exact fraction multiset;
- denominators only 2, 3, 4, and 6; `0 < numerator ≤ denominator`;
- every strip has equal cells, fixed same-whole dimensions, a nonempty `fractionModel`, and matching `answerState`;
- key shades exactly the numerator count; sixth cells stay print-safe.

Fair-share-specific checks:

- exactly 4 items with sharer counts 2, 3, 4, and 6 and the exact default scenario multiset;
- all partition pieces are equal within a whole; total piece count is divisible by sharer count; no piece is duplicated, omitted, or left unassigned;
- every child receives an equal share and the computed fraction matches the prompt, response target, completed model, and key;
- no addition, subtraction, multiplication, or division-expression prompt; no mixed-number drift;
- all source objects and child trays remain readable, including the 6-sharer layout.

Existing `scripts/testGrade1FractionFamily.js` remains the isolation baseline. The eventual implementation should add a focused Grade 2 concrete-fractions regression rather than weakening Grade 1 assertions broadly.

## Reconciliation scenarios

No reconciliation change is authorized in this pass.

| Scenario | A | B | C | D | E | F | G | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Current | 22 | 0 | 0 | 7 | 9 | 0 | 14 | 52 |
| A — both implemented and founder-approved | 24 | 0 | 0 | 5 | 9 | 0 | 14 | 52 |
| B — one approved, one deferred | 23 | 0 | 0 | 5 | 9 | 0 | 15 | 52 |
| C — both deferred | 22 | 0 | 0 | 5 | 9 | 0 | 16 | 52 |

Scenario B moves one record D→A and the other D→G. Scenario C moves both D→G.

## Risks

- Opening the Grade 1 denominator or renderer gate globally could change approved Grade 1 output; exact Grade 2 adapters are required.
- Treating arrays as items or allowing a missing activity to normalize silently would recreate blank-but-apparently-successful worksheets.
- Using global randomness would break real seed reproducibility even when empty output appears stable.
- A renderer-calculated partition, quotient, simplification, or assignment would split mathematical truth between layers.
- Sixth partitions and six child trays can become unreadable if model dimensions are inherited without a print-fit test.
- `2/6 = 1/3` is safe only for the same whole and the exact fair-sharing context; the batch must not expand into a general equivalence worksheet.
- Broad “Fraction Word Problems” copy would overpromise symbolic operations and unrelated fraction contexts.

## Recommended next action

Keep both resources active, generated, Category D, and unpromoted. Implement only Shade Equal Parts in the next controlled batch. Require its focused regression and two-page founder proof before beginning the separate Share Fairly to 10 extension. Do not reconcile either record to A until its own founder approval is recorded.
