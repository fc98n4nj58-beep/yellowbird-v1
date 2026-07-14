# Grade 2 Category D Shared-Family Preflight

Date: 2026-07-14

Status: Batch 1 founder-approved and reconciled; catalog statuses remain `generated`

## Batch 1 implementation record

Implemented on 2026-07-14 for exactly these three Category D resources:

- `grade2_addition_subtraction_facts_equation_match`
- `grade2_place_value_representation_number_line_identify`
- `grade2_place_value_representation_number_word_match`

The implementation adds the approved Grade 2 adapters over the shared relational-equation, number-line, and number-word families. Completed mode is forced off for all three. Preview and PDF continue to use the same catalog runtime and answer keys continue to reuse the generated item truth. No route, UI, reconciliation, curriculum-source, promotion, staging, or commit action was taken.

Verification completed:

- focused 30-seed same-seed/variation, mathematical-truth, uniqueness, balance, range, layout, footer, answer-key, and two-page PDF checks;
- Grade 1 relational-equation, Grade 1 addition-number-line, and Grade 1 number-representation regression suites;
- catalog audit: 213/213 generated and 104/104 ready resources working; only the seven pre-existing planned `pattern_word_problems` placeholders remain unavailable;
- three default student-plus-key PDFs rendered to PNG and visually inspected after correcting the number-line response target.

## Batch 1 founder recheck

Founder recheck is approved. Catalog statuses remain `generated`, all three resources are now reconciliation Category A, and no promotion has occurred.

`Equal or Not Equal?` now guarantees exactly 12 unique questions with six `=` and six `≠`. Each default contains four addition/addition, four subtraction/subtraction, and four addition/subtraction comparisons. Left-side totals are deliberately varied, right-side totals are varied, zero-related questions are capped at two, and no `50 - n` structure can dominate. The founder-recheck proof contains zero zero-related questions and zero `50 - n` expressions.

`Identify Numbers on a Number Line` retains the explicit six-line Grade 2 default. Each line has 10 equal intervals using steps 1, 2, 5, or 10. A default batch includes four internal targets, one left endpoint, and one right endpoint. Endpoint-safe symmetric insets keep the short response line centred beneath the missing tick and within printable margins without changing tick spacing. Its final footer is `Grade 2 • Math • Number Representation`.

The focused 30-seed suite passed same-seed stability, different-seed variation, mathematical truth, template variety, uniqueness, endpoint geometry, answer-key parity, Grade 1 and Grade 3+ isolation, and exact two-page PDF checks. Both regenerated affected proofs were rendered and visually inspected and are classified `FOUNDER RECHECK READY`. The already-approved Number Words implementation and proof were not regenerated or changed during this recheck.

## Current state

Grade 2 reconciliation is A21 / B0 / C0 / D8 / E9 / F0 / G14, total 52. The three approved Batch 1 records are Category A but retain catalog status `generated`; the remaining eight Category D records are also `generated`. None of those 11 generated records is public or promoted. The master catalog contains each exact ID once, contains no duplicate active ID, and agrees with the reconciliation. No Category E or G record is included here.

All records enter the shared path:

`master catalog -> worksheetCatalogService -> buildWorksheet -> recipe/generator -> normalizeWorksheetLayout -> buildCatalogWorksheetRuntime -> normalizeWorksheetContent -> shared preview/PDF route -> pdfRenderer -> answer key from the same normalized items`

Preview and PDF already call the same runtime. Routes contain no Category D mathematics. The renderer does not own the current mathematical truth; the failures are generator ownership, missing structured truth, unsafe defaults, and misleading presentation. Consolidation must remain gated by exact Grade 2 IDs or explicit family parameters so Grade 1 and Grade 3+ behavior stays unchanged.

## Pre-implementation Category D inventory

This table preserves the pre-implementation diagnostic used to plan the batch. At that point every record was a worksheet with catalog status `generated`, reconciliation Category D, and declared answer-key support. The three approved Batch 1 records are now Category A while retaining `generated` status. `Current pages` means the temporary diagnostic captured during preflight, not the approved runtime or a proposed proof.

| Resource | Current title; strand/topic | Current default | Current instruction | Current path | Seed / answer key / output | Current pages |
| --- | --- | --- | --- | --- | --- | ---: |
| `grade2_addition_subtraction_facts_equation_match` | Equation Match - Grade 2; Addition & Subtraction / facts | 12 ordinary equations; operands 0-20, addition totals can reach 40 | `Students match related equations.` | `addition_subtraction_facts.json -> equationMatch.js -> equation_match/matching -> pdfRenderer` | Injected seed stable and varied; key matches generated answers; no relational pair or `=`/`≠` target | 2 |
| `grade2_data_display_graphing_complete_graph` | Complete a Graph - Grade 2; Data & Graphing / graph construction | 12 prose items; fixed values 4, 7, 5 | `Students complete graph displays from data.` | `data_display_graphing.json -> completeGraph.js -> generic equation_practice -> pdfRenderer` | Seed chooses only the missing label; key matches text answers; no graph or construction model | 4 |
| `grade2_data_display_graphing_graph_questions` | Graph Questions - Grade 2; Data & Graphing / mixed questions | 12 prose items; fixed values 5, 8, 3 | `Students answer questions about graph data.` | `data_display_graphing.json -> graphQuestions.js -> generic equation_practice -> pdfRenderer` | Seeded question selection, fixed dataset; key matches; no graph | 4 |
| `grade2_data_display_graphing_interpret_data` | Interpret Data - Grade 2; Data & Graphing / comparison | 12 prose items; fixed values 12, 9, 6 | `Students interpret data and answer questions in context.` | `data_display_graphing.json -> interpretData.js -> generic equation_practice -> pdfRenderer` | **Injected seed bypassed by `Math.random`**; key matches only within one runtime; no graph | 4 |
| `grade2_data_display_graphing_match_data_to_graph` | Match Data to Graph - Grade 2; Data & Graphing / representation matching | 12 prose lookups; fixed values 3, 6, 4 | `Students match data sets to graph displays.` | `data_display_graphing.json -> matchDataToGraph.js -> generic equation_practice -> pdfRenderer` | Seeded target selection, fixed dataset; key matches; no graph choices or matching interaction | 4 |
| `grade2_data_display_graphing_read_graph` | Read a Graph - Grade 2; Data & Graphing / direct reading | 12 prose items; fixed values 6, 4, 8 | `Students read graphs and answer questions.` | `data_display_graphing.json -> readGraph.js -> generic equation_practice -> pdfRenderer` | Seeded target selection, fixed dataset; key matches; no graph | 4 |
| `grade2_fraction_equivalence_fraction_word_problems` | Fraction Word Problems - Grade 2; Fractions / fair sharing | 0 items; no range | `Generated worksheet for fraction word problems.` | `fraction_equivalence.json -> no owner for fraction_word_problems -> generic equation_practice -> pdfRenderer` | Empty and seed-invariant; declared key has no truth to display | 1 |
| `grade2_fraction_equivalence_shade_fraction_models` | Shade Fraction Models - Grade 2; Fractions / shading | 12 blank rows; legacy generator internally chooses denominators 2, 3, 4, 5, 6, 8 | `Generated worksheet for shade fraction models.` | `fraction_equivalence.json -> shadeFractionModels.js array return -> generic normalization -> pdfRenderer` | Generator bypasses injected seed and returns the wrong shape; prompts, models, and meaningful keys are blank | 2 |
| `grade2_multiplication_facts_equal_groups` | Equal Groups - Grade 2; Multiplication & Division / equal groups | 12 models; 2-6 groups by 2-6 objects, products 4-36 | `Use each model to write a multiplication equation.` | `multiplication_facts.json -> equalGroups.js -> multiplicationModelFactors.js -> equal_groups/model_interpretation -> pdfRenderer` | Deterministic structured model and matching key; 12 items spill to two student and two key pages | 4 |
| `grade2_place_value_representation_number_line_identify` | Number Line - Grade 2; Place Value / number representation | 10 point-identification items on 0-10 unit lines | `Students use a number line to identify or model values.` | `place_value_representation.json -> numberLineIdentify.js -> number_line_identify/visual_model -> pdfRenderer` | Deterministic structured line and matching key; no interval parameter, Grade 2 range, or student-facing direction | 4 |
| `grade2_place_value_representation_number_word_match` | Number Word Match - Grade 2; Place Value / number words | 12 numeral-to-word items from 0-999 | `Students match numerals and number words.` | `place_value_representation.json -> numberWordMatch.js -> number_word_match/matching -> pdfRenderer` | Deterministic and varied; key matches; actual task is writing words, not matching, and default exceeds Grade 2's 0-200 number scope | 2 |

## Runtime and architecture findings

- **Shared runtime:** all 11 already share catalog generation, preview/PDF entry, normalization, rendering, and key construction. No route change is needed.
- **Directly structured today:** Equal Groups and Number Line carry valid `visual` truth. Their problems are default adapters and public copy, not missing renderer ownership.
- **Misrouted task:** Equation Match falls through to generic arithmetic because `equationMatch.js` enables relational truth only for the Grade 1 ID.
- **Legacy data fallbacks:** all five data generators describe graphs in prose. None emits `graphData` or `graphTaskData`; `interpretData.js` alone also breaks same-seed stability.
- **Broken fraction ownership:** Fraction Word Problems has no matching generator owner. Shade Fraction Models returns an unseeded array where `buildWorksheet` expects one problem, producing blank rows.
- **Misnamed number-word task:** the generator performs numeral-to-written-word conversion. Literal matching is not present.
- **Answer-key boundary:** meaningful current keys reuse generated truth, but blank/absent fraction truth makes declared answer-key support illusory. New keys must transform the same structured item state; renderers must not recompute values, graph answers, shading, or shares.
- **Isolation boundary:** existing Grade 1 generators explicitly branch by Grade 1 IDs. Grade 2 consolidation should generalize the family behind an exact Grade 2 adapter, with frozen Grade 1 defaults and explicit Grade 3+ isolation tests.

Architecture classifications:

| Resource group | Classification |
| --- | --- |
| Equation Match | SHARED FAMILY WITH GRADE 2 PARAMETER ADAPTER; current TITLE/TASK MISMATCH |
| Number Line | SHARED FAMILY EXTENSION REQUIRED for interval-aware lines; current range mismatch |
| Number Word Match | DIRECT SHARED-FAMILY REUSE with Grade 2 range/title adapter; current TITLE/TASK MISMATCH |
| Equal Groups | DIRECT SHARED-FAMILY REUSE with Grade 2 count/range adapter |
| Shade Fraction Models | LEGACY FALLBACK REPLACEMENT REQUIRED through `fraction_strip` |
| Fraction Word Problems | MISSING STRUCTURED MODEL ownership; extend `fair_share_set` |
| Five data records | LEGACY FALLBACK REPLACEMENT REQUIRED through one shared structured-data family; `interpret_data` is also DUPLICATE LOGIC - CONSOLIDATE |

## Relational equations

Exact resource: `grade2_addition_subtraction_facts_equation_match`.

The approved Grade 1 family compares one addition expression with one subtraction expression and inserts a centered `=` or `≠`. It uses 12 unique, balanced questions, two columns by six rows, no repeated prose, identical student/key geometry, and an optional two-question completed demonstration because the family has two response states.

The Grade 2 record currently solves one ordinary open equation, so it is neither matching nor relational reasoning. Ontario Grade 2 C2.2-C2.3 supports equivalent addition/subtraction expressions and equivalent relationships through 100. The smallest safe default is expression results from 0-50, where calculation demand remains compatible with Grade 2 mental addition/subtraction, while a later internal override may extend equivalent values to 100 after proof.

Recommendation: **GRADE 2 PARAMETER ADAPTER**. Generalize the Grade 1 relational candidate pool rather than add another generator. Preserve addition-versus-subtraction pairs, six `=` and six `≠`, 12 questions, one centered symbol target, seeded uniqueness, and key parity. Final title should be `Equal or Not Equal?`; instruction should be `Solve both sides. Write = if they have the same value. Write ≠ if they have different values.` Default completed mode should remain off until the founder explicitly approves the shared two-response-state Q1/Q2 exception for Grade 2.

## Number line

Exact resource: `grade2_place_value_representation_number_line_identify`.

The task is point identification, not placement, interval counting, or an operation. The current generator and renderer draw a correct marked line but assume every tick increases by one. A full 0-200 line would therefore create 201 ticks and is not a safe parameter-only extension.

Recommendation: **REUSE WITH RANGE/INTERVAL PARAMETERS** and a narrow family extension. Use 10 equal intervals per line; support steps 1, 2, 5, and 10; choose starts and endpoints that keep every value within 0-200; hide only the marked target label; allow endpoints but avoid an endpoint-heavy batch. No new visual primitive is required, but `number_line` truth needs explicit `interval`, `tickCount`, and label-cadence fields rather than inferring ticks from `max - min`.

Proposed title: `Identify Numbers on a Number Line`. Instruction: `Write the number marked on each number line.` Default: six full-width lines, one column, one student page and one key page, short target line below the marked point. Mixed placement, open number lines, operation jumps, and public controls remain out of scope.

## Number Word Match

Exact resource: `grade2_place_value_representation_number_word_match`.

The current task is numeral -> written number word, not pair matching. Ontario Grade 2 B1.1 supports reading and representing numbers through 200; the generic 0-999 default is too broad. The approved number-word family already owns deterministic unique values, numeral-to-word and word-to-numeral metadata, aligned response targets, completed-Q1 behavior, and answer-key geometry.

Recommendation: **GRADE 2 PARAMETER ADAPTER** as a distinct worksheet, with title `Write Number Words to 200`, instruction `Write each number in words.`, range 0-200, 12 unique values, two columns by six rows, and long left-aligned handwriting targets. Optional completed Question 1 may be reused only after founder approval and must count inside 12.

A literal cut-and-match numeral/word activity is **BETTER AS FUTURE CARD SET**. That variant is not activated, promised, or added to this milestone. If the founder requires literal matching instead of writing, defer this record rather than build a new matching worksheet layout now.

## Equal Groups

Exact resource: `grade2_multiplication_facts_equal_groups`.

This record already uses the approved `equal_groups` visual, ordered `groups x objects per group = total` truth, deterministic factor pool, canonical dot geometry, shared equation targets, and matching key. It is distinct from Arrays because containers, not rows and columns, carry the grouping structure.

Recommendation: **GRADE 2 ADAPTER REQUIRED**. Keep the current generator and renderer. Set exactly eight items, two columns by four rows, group and object factors 2-5, product no greater than 25, one student page and one key page. Use the true `×` symbol, no repeated per-item sentence, title `Equal Groups`, and instruction `Count the groups and the objects in each group. Complete the number sentence.`

Ontario Grade 2 B2.5 explicitly supports repeated equal groups. This concrete whole-object default is safe without adding half/fourth groups in the initial worksheet. Completed Question 1 is architecturally available but should remain unsupported for this exact Grade 2 record until the founder decides whether the shared family example adds value.

## Concrete fractions

Exact resources:

- `grade2_fraction_equivalence_shade_fraction_models`
- `grade2_fraction_equivalence_fraction_word_problems`

Symbolic Compare Fractions, Match Equivalent Fractions, and Fraction Number Line remain Category G and are outside this plan.

### Shade Equal Parts

Recommendation: **GRADE 2 PARAMETER EXTENSION** through the existing `fraction_strip` model. Replace the array-return fallback with item-level structured truth: requested fraction, partition count, shaded answer state, same-whole identity, and deterministic duplicate signature. Use only halves, thirds, fourths, and sixths; initial targets may include 1/2, 1/3, 2/3, 1/4, 2/4, 3/4, 1/6, and 2/6 without asking for symbolic equivalence.

Proposed title: `Shade Equal Parts`. Instruction: `Shade the equal parts to show each fraction.` Default: eight strips, two columns by four rows, one student page and one key page. No completed example is recommended for the initial drawing task.

### Share Fairly to 10

Recommendation: **NEW CONCRETE VARIANT REQUIRED** inside the approved `fair_share_set` family, not a new standalone renderer. Ontario Grade 2 B1.6 supports sharing up to 10 items among 2, 3, 4, and 6 sharers, including fractional results; B1.7 supports one third/two sixths in fair-sharing contexts.

The current Grade 1 model owns whole and half pieces only. A Grade 2 extension must add deterministic thirds, fourths, and sixths for allow-listed naturally divisible objects, explicit source totals, sharer count, whole pieces per sharer, fractional pieces per sharer, tray assignment, and conservation checks. The renderer consumes those pieces but never decides the partition or quotient.

Proposed title: `Share Fairly to 10`. Instruction: `Share the objects equally. Draw the share each child gets.` Default: four problems covering 2, 3, 4, and 6 sharers, two per student page, two student pages plus two key pages. No completed example initially. Formal symbolic equivalence remains deferred.

## Structured data

Exact resources and intended roles:

| Resource | Intended structured role | Recommendation |
| --- | --- | --- |
| `grade2_data_display_graphing_read_graph` | Direct pictograph reading | REUSE GRADE 1 DATA READING FAMILY with Grade 2 parameters |
| `grade2_data_display_graphing_interpret_data` | Compare categories, identify mode, and make a modest conclusion | REUSE GRADE 1 DATA READING FAMILY; remove `Math.random` path |
| `grade2_data_display_graphing_graph_questions` | Mixed direct, comparison, mode, and conclusion questions | GRADE 2 PARAMETER EXTENSION of the approved mixed-question family |
| `grade2_data_display_graphing_complete_graph` | Complete missing pictograph rows from a table | REUSE GRADE 1 DATA CONSTRUCTION FAMILY |
| `grade2_data_display_graphing_match_data_to_graph` | Choose the pictograph that matches a table | REUSE GRADE 1 DATA CONSTRUCTION FAMILY |

The initial Grade 2 implementation should stay with one-to-one pictographs. That directly satisfies Ontario Grade 2 D1.3, avoids inventing a bar/line-plot system in this consolidation, and allows the existing graph geometry to be reused. Values should remain 2-9 initially so four readable rows fit with one symbol per unit. Grade 2 distinction should come from question demand (mode, comparison, conclusion), not from shrinking twelve symbols into a Grade 1-sized graph.

Minimum common truth model:

- `graphData.kind`, stable dataset/topic ID, graph title, source, scenario and reading-level metadata;
- four stable category IDs/labels and values, unit singular/plural, question noun;
- `symbol: circle`, `symbolValue: 1`, grayscale-safe rendering, one repeated modal value where a mode question is used, and deterministic unique maximum/minimum where required;
- seeded topic/context selection and injected randomness only;
- item-level question type, response type, prompt fields, answer, and duplicate signature;
- construction `graphTaskData`: data table, missing rows, visible/target counts;
- matching `graphTaskData`: two structured choices, deterministic distractor, stable choice IDs, and correct choice ID;
- identical graph truth and question order in student, completed, preview, PDF, and key modes.

Proposed public contracts:

| Resource | Final title | Instruction | Exact default | Completed mode | Pages with key |
| --- | --- | --- | --- | --- | ---: |
| Read Graph | `Read the Pictograph` | `Use the pictograph to answer each question.` | 1 graph + 6 direct questions | Optional Q1, pending founder | 2 |
| Interpret Data | `Compare the Data` | `Use the pictograph to compare the categories and answer each question.` | 1 graph + 6 comparison/mode questions | Optional Q1, pending founder | 2 |
| Graph Questions | `Pictograph Questions` | `Use the pictograph to answer each question.` | 1 graph + 8 mixed questions | Optional Q1, pending founder | 2 |
| Complete Graph | `Complete the Pictograph` | `Use the data table to complete the pictograph.` | 1 graph task; exactly 2 incomplete rows | none | 2 |
| Match Data to Graph | `Choose the Matching Pictograph` | `Circle the pictograph that matches each data table.` | 2 items with 2 graph choices each | none | 2 |

All five use `Grade 2 • Math • Data & Graphing`. No internal skill key, topic registry key, or snake_case may print. Bar graphs, line plots, two-way tally tables, scaled keys, written explanations, and public topic controls require later family preflights; none is silently added here.

## Grade 1 family reuse map

| Grade 2 resource(s) | Approved family reused | Boundary |
| --- | --- | --- |
| Equation Match | Grade 1 Equal or Not Equal relational pool and symbol target | Generalize range and exact ID; freeze Grade 1 0-20 behavior |
| Number Line | Shared `number_line` visual and answer-under-target geometry | Add explicit interval truth; do not alter Grade 1 addition-line behavior |
| Number Word Match | Grade 1 two-direction number-word generator and response lines | Use numeral-to-word only, 0-200; literal matching stays deferred |
| Equal Groups | Shared multiplication factor pool, equal-groups model, and equation geometry | Grade 2 exact eight-item/friendly-factor adapter only |
| Shade Fraction Models | `fraction_strip` truth, partitions, shading, and key state | Add safe Grade 2 sixths without symbolic equivalence |
| Fraction Word Problems | `fair_share_set`, divisible-object registry, conservation truth | Add thirds/fourths/sixths as a reviewed concrete variant |
| Five data records | Grade 1 topic/context registry, `graphData`, `graphTaskData`, pictograph geometry, response types | Add Grade 2 values/question demand behind exact Grade 2 adapter |

## Duplication and product-fit findings

| Resource | Nearest existing resource | Product-fit decision |
| --- | --- | --- |
| Equation Match | Grade 1 Equal or Not Equal; Grade 2 fact families | DISTINCT WITH SHARED-FAMILY REUSE: expression equivalence is not fact recall |
| Number Line | Grade 1 identify/addition lines | DISTINCT WITH SHARED-FAMILY REUSE: interval-aware Grade 2 identification |
| Number Word Match | Grade 1 Write Number Words to 50 | DISTINCT WITH SHARED-FAMILY REUSE as writing to 200; literal matching is BETTER AS FUTURE CARD SET |
| Equal Groups | Grade 1 Equal Groups; Grade 2 Arrays | DISTINCT WITH SHARED-FAMILY REUSE: container grouping differs from rows/columns |
| Shade Fraction Models | Grade 1 Shade Equal Parts | DISTINCT WITH SHARED-FAMILY REUSE through Grade 2 sixths |
| Fraction Word Problems | Grade 1 Share Fairly | DISTINCT WITH SHARED-FAMILY REUSE through 2/3/4/6 sharers and fractional results |
| Read Graph | Grade 1 Read the Graph | DISTINCT WITH SHARED-FAMILY REUSE through Grade 2 question demand |
| Interpret Data | Grade 1 Compare the Data | DISTINCT WITH SHARED-FAMILY REUSE: comparison and mode focus |
| Graph Questions | Grade 1 Graph Questions | DISTINCT WITH SHARED-FAMILY REUSE: mixed review; do not pad with duplicate prompts |
| Complete Graph | Grade 1 Complete the Pictograph | DISTINCT WITH SHARED-FAMILY REUSE: graph construction action |
| Match Data to Graph | Grade 1 Choose the Matching Graph | DISTINCT WITH SHARED-FAMILY REUSE: representation selection |

No Category D record is recommended for immediate deferral. The literal numeral/word matching variant is a future-card-set candidate, but the existing record remains useful if retitled to its actual writing task. If the founder rejects that worksheet role, move only that record to G later; do not activate card-set implementation.

## Curriculum findings

| Resource group | Classification | Grade 2 boundary |
| --- | --- | --- |
| Equation Match | SAFE WITH NARROWED DEFAULT | Results 0-50 initially; optional 0-100 only after proof |
| Number Line | SAFE WITH TITLE OR INSTRUCTION CHANGE | Values 0-200 in readable 10-interval windows |
| Number Words | SAFE WITH NARROWED DEFAULT | 0-200, not generic 0-999 |
| Equal Groups | SAFE AS WRITTEN after adapter | Concrete repeated equal groups; no mastery claim |
| Shade Equal Parts | SAFE WITH NARROWED DEFAULT | Concrete halves, thirds, fourths, sixths; no symbolic equivalence |
| Share Fairly | SAFE WITH NARROWED DEFAULT | Up to 10 objects among 2, 3, 4, 6 sharers; concrete pieces only |
| Five data records | SAFE WITH TITLE OR INSTRUCTION CHANGE | One-to-one pictographs, proper source/title/labels, mode and modest conclusions |

No genuine curriculum conflict or Grade 3+ deferral is present under these defaults. Teacher overrides may exceed a default only after a separate range/layout proof and honest public notice. No public alignment claim should be added merely because the task is plausible.

## Design and print-risk findings

Representative current first pages and all diagnostic page counts were inspected.

| Resource group | Classification | Current print finding |
| --- | --- | --- |
| Equation Match | PRINT-READY AFTER ARCHITECTURE REUSE | Calm two-column page, but wrong arithmetic task, teacher-facing copy, suffix, and internal footer slug |
| Number Line | RESOURCE-SPECIFIC CORRECTION | Legible model but narrow 0-10 task, teacher-facing instruction, excess pagination, internal slug |
| Number Words | RESOURCE-SPECIFIC CORRECTION | Readable but top-heavy; repeated prose, false matching title, 0-999 range, internal slug |
| Equal Groups | MINOR FAMILY POLISH | Strong models and targets; 12 items create four pages, title suffix/instruction/footer need correction |
| Shade Equal Parts | FAMILY-LEVEL DESIGN CORRECTION | Twelve numbered blank rows; no fraction model or meaningful key |
| Share Fairly | NEW VISUAL CONTRACT REQUIRED inside `fair_share_set` | Empty worksheet shell; Grade 2 thirds/sixths need reviewed piece geometry |
| Five data records | FAMILY-LEVEL DESIGN CORRECTION | Four-page prose worksheets with no graph, repeated fixed data, large whitespace, and internal slugs |

Every active family must use title -> divider -> student instruction, hidden subtitle unless justified, Grade 2-readable type, response-type-aware targets, public-only footers, no clipping, and identical student/key truth. Density must be reduced before typography or models are shrunk.

## Recommended implementation batches

| Order | Exact IDs | Shared family and scope | Tests / proofs / founder decision | Risk |
| ---: | --- | --- | --- | --- |
| 1 | `grade2_addition_subtraction_facts_equation_match`; `grade2_place_value_representation_number_line_identify`; `grade2_place_value_representation_number_word_match` | Relational pool, interval-aware number line, number-word response family; exact Grade 2 adapters only | One focused suite plus Grade 1/3 isolation. Three default PDFs; add relational Q1/Q2 and number-word Q1 proofs only if founder approves completed modes. Founder must approve titles, 0-50/0-200 ranges, six-line number-line density, and worksheet-vs-card role. | LOW-MODERATE |
| 2 | `grade2_multiplication_facts_equal_groups` | Existing multiplication model; eight-item/friendly-factor adapter, public copy/footer | Extend multiplication-model focused tests; one default PDF, plus one completed-Q1 PDF only if approved. Founder decides completed mode and product cap 25. | LOW |
| 3 | `grade2_fraction_equivalence_shade_fraction_models`; `grade2_fraction_equivalence_fraction_word_problems` | `fraction_strip` direct extension plus `fair_share_set` thirds/fourths/sixths variant | Exact model/conservation/isolation validators. Two default PDFs covering every supported denominator/sharer; no completed proofs initially. Founder approves object pieces, counts, four-page sharing contract, and language. | MODERATE-HIGH |
| 4 | `grade2_data_display_graphing_read_graph`; `grade2_data_display_graphing_interpret_data`; `grade2_data_display_graphing_graph_questions`; `grade2_data_display_graphing_complete_graph`; `grade2_data_display_graphing_match_data_to_graph` | One Grade 2 adapter over shared topic registry, graph truth, reading, construction, and matching modes | Dedicated five-resource structured-data validator. Five default PDFs; up to three additional completed-Q1 proofs only if approved. Founder approves pictograph-only initial scope, titles, question mix, values, counts, and completed modes. | HIGH |

Batch 1 should implement Equation Match and Number Words before the interval-aware Number Line if the line geometry decision is still open. Batch 4 may be coded internally as reading/interpretation first and construction/matching second, but it remains one founder family decision and one canonical graph schema.

## Recommended deferrals

No whole Category D record is recommended for deferral on current evidence.

Conditional deferral:

- If `grade2_place_value_representation_number_word_match` must remain literal matching, classify it later as BETTER AS FUTURE CARD SET and move it to G. It may remain deferred permanently. Reconsider only after launch stability and controlled teacher testing demonstrate demand for Printable Curriculum Card Sets.
- Bar graphs, line plots, two-way tally tables, symbolic fraction equivalence, fraction number lines, mixed operation number lines, and public controls are variants outside this preflight, not implicit promises.

## Founder preflight requirements

Before each implementation batch, the founder must sign off on the final titles/instructions above, exact ranges and counts, response target, completed-example decision, page count, and footer. Teacher controls remain deferred in every batch.

| Batch | Default student/key pages | Public footer | Required founder proof packet after implementation |
| --- | --- | --- | --- |
| 1 | Each resource 1 + 1 pages | Equation: `Grade 2 • Math • Addition & Subtraction`; line: `Grade 2 • Math • Number Sense`; words: `Grade 2 • Math • Number Representation` | 3 defaults; up to 2 completed variants only if approved |
| 2 | 1 + 1 pages | `Grade 2 • Math • Early Multiplication Thinking` | 1 default; optional completed variant after decision |
| 3 | Shade 1 + 1; Share 2 + 2 | `Grade 2 • Math • Fractions` | 2 defaults containing all supported partitions/sharers |
| 4 | Each resource 1 + 1 pages | `Grade 2 • Math • Data & Graphing` | 5 defaults; optional completed variants for three reading resources |

## Test and validator plan

Every focused suite must assert exact IDs, `generated` status, unchanged reconciliation, exact title/instruction/range/count, same-seed stability, different-seed variation where a pool exists, answer-key parity, preview/PDF shared runtime, exact pages, no blank item, no generic fallback, public footer safety, and Grade 1/Grade 3+ isolation.

Additional batch gates:

- **Relational:** balanced six/six response states, two complete expressions, correct values/symbol, no duplicate pair, centered target, optional Q1/Q2 behavior inside 12.
- **Number Line:** exactly 10 intervals, allowed step, arithmetic consistency of start/end/target, label-cadence fit, endpoint balance, target-line alignment.
- **Number Words:** 0-200, unique values while possible, correct spelling/hyphenation, written response metadata, widest prompt/answer fit.
- **Equal Groups:** exactly eight unique ordered pairs, factors 2-5, product <=25, true `×`, structured response values, identical model geometry in key.
- **Fractions:** nonempty `fraction_strip`/`fair_share_set`, equal partition geometry, safe denominator pool, same-whole identity, conservation of source quantity, divisible-object allow-list, exact answer state, no symbolic legacy fallback.
- **Data:** nonempty `graphData`/`graphTaskData`; exact labels, values, units, key, scale, mode, answers, and distractors; injected randomness only; deterministic topic selection; no text-only fallback; student/key graph identity. The general audit is insufficient and must not be treated as this validator.

Existing regressions to retain include `testGrade1CategoryFBatch1.js`, `testGrade1AdditionNumberLine.js`, `testGrade1NumberRepresentationRuntime.js`, `testGrade1ArraysEqualGroupsRuntime.js`, `testGrade1FractionFamily.js`, `testGrade1CategoryFBatch2Data.js`, and `testGrade1CategoryFBatch3Data.js`.

Preflight verification result: the relational, number-line, number-representation, multiplication-model, fraction, and Grade 1 data-reading suites passed. `testGrade1CategoryFBatch3Data.js` reached its catalog-count assertion and failed because it still expects the historical ready count 103; the current authoritative count is 104. This is a stale test baseline, not a Category D runtime failure. It must be updated in a later authorized test-maintenance or implementation task; this planning preflight does not modify it. The full worksheet audit passed with ready 104/104, generated 213/213, partial 5/5, and only the seven established planned `pattern_word_problems` gaps.

## Reconciliation scenarios

No reconciliation is changed by this preflight.

| Scenario | A | B | C | D | E | F | G | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Current | 18 | 0 | 0 | 11 | 9 | 0 | 14 | 52 |
| A - all 11 implemented and founder-approved | 29 | 0 | 0 | 0 | 9 | 0 | 14 | 52 |
| B - recommended active work plus deferrals | 29 | 0 | 0 | 0 | 9 | 0 | 14 | 52 |
| C - low-risk Batches 1 and 2 complete first | 22 | 0 | 0 | 7 | 9 | 0 | 14 | 52 |

Scenario B equals Scenario A because no whole Category D record is currently recommended for deferral. If the founder rejects the Number Words worksheet role and defers that one record, Scenario B becomes A28 / D0 / G15, with Total52 unchanged.

## Risks

- Generalizing Grade 1-only branches could silently alter approved Grade 1 behavior without exact-ID adapters and isolation tests.
- Interval-aware number lines can become unreadable if value range is confused with tick count.
- Fair-sharing thirds and sixths need real piece geometry; drawing dividers on whole objects would violate the approved object contract.
- A data adapter that merely wraps legacy prose in a box would still fail the structured-visual working gate.
- Five data titles overlap unless question pools are purpose-specific and never padded with repeated prompts.
- Literal number-word matching can pull the deferred card-set idea into the launch milestone; the writing worksheet and future card format must stay separate.
- The catalog audit currently accepts blank arrays, zero-item fraction output, and text-only graph fallbacks. Focused validators are release gates.

## Recommended next action

Run a founder design preflight for Batch 1, resolving the number-line interval contract and confirming that Number Word Match should become `Write Number Words to 200`. Then implement only Batch 1 behind exact Grade 2 adapters. Keep Equal Groups as the next low-risk batch; do not begin concrete fractions or structured data until their model-specific founder decisions are signed.
