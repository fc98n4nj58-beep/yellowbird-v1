# Grade 2 Structured Data Preflight

Date: 2026-07-15

Status: core pictograph reading batch founder-approved and reconciled; catalog status remains `generated`

## Current state

This preflight covers exactly five Grade 2 records that entered planning in Category D:

- `grade2_data_display_graphing_complete_graph`
- `grade2_data_display_graphing_graph_questions`
- `grade2_data_display_graphing_interpret_data`
- `grade2_data_display_graphing_match_data_to_graph`
- `grade2_data_display_graphing_read_graph`

All five remain catalog status `generated` and unpromoted. Read the Pictograph and Interpret the Pictograph are founder-approved and reconciled in Category A; Complete a Graph, Match Data to Graph, and Graph Questions remain Category D. The catalog remains Ready 104/104, Generated 213/213, Partial 5/5, Total 331. The seven established `pattern_word_problems` gaps are the only audit gaps. Grade 2 reconciliation is A26 / B0 / C0 / D3 / E9 / F0 / G14, Total 52.

The planning decision is to launch one-to-one pictographs only, retain four distinct student actions, and recommend `Graph Questions` for later-phase deferral because it merely mixes the direct-reading and interpretation actions already owned by two stronger worksheets. The Graph Questions deferral remains a separate reconciliation action; no catalog promotion is authorized here.

### Core pictograph reading implementation checkpoint, 2026-07-15

The approved planning checkpoint was committed as `54b893464035965eeaaff5d7128bc8d08f5a12ad` (`docs: add grade 2 structured data preflight`) before implementation began.

Only these two retained Batch 1 resources are implemented:

- `grade2_data_display_graphing_read_graph`
- `grade2_data_display_graphing_interpret_data`

The active path is:

`catalog -> worksheetCatalogService -> readGraph.js / interpretData.js exact-ID gate -> grade2DataGraph.js -> shared Grade 1 topic selection and pictograph-data builder -> existing normalization -> shared pictograph renderer -> preview/PDF -> answer key from the same item truth`

`grade2DataGraph.js` requires injected seeded randomness and owns the selected topic, four unique category values, graph metadata, exact question types, referenced category IDs, answers, answer state, and duplicate signatures before rendering. It wraps the approved Grade 1 topic-selection and pictograph-data helpers. The Grade 1 builder keeps its established defaults; the shared renderer gains only a grade-neutral response-line flag and a testable symbol-count helper. No route, UI, curriculum source, new renderer, or renderer-side arithmetic was added.

Both resources now use exactly four categories, four unique integer values from 2 through 8, one outlined circle per item, key value and scale 1, no partial symbols, one full pictograph, six questions, one student page, one matching key page, the footer `Grade 2 • Math • Data & Graphing`, and no completed example.

`Read the Pictograph` uses six direct category-value questions only. All four categories appear; two categories repeat once with alternate direct-reading wording, so the distribution is 2/2/1/1 and no category dominates. Every response is numeric and equals the referenced category value.

`Interpret the Pictograph` uses exactly one most, one least, one more-difference, one fewer-difference, one two-category combined-total, and one all-category total question. Values are unique so most and least are unambiguous; named pairs are ordered so differences are non-negative; every arithmetic answer is stored before rendering.

The active Grade 2 path no longer reaches the direct `Math.random` call in the legacy `interpretData.js` fallback. Thirty deterministic seeds per resource pass same-seed stability with zero failures and meaningful different-seed variation. Structured graph truth, exact question truth, answer-key identity, preview/PDF shared runtime, Grade 1 isolation, Grade 3+ isolation, and exact two-page output pass the focused suite at `scripts/testGrade2PictographReadingBatch.js`.

Founder proofs:

- `review/grade-2-pictograph-reading/founder-review/g2_read_the_pictograph_default_student_and_key.pdf`
- `review/grade-2-pictograph-reading/founder-review/g2_interpret_the_pictograph_default_student_and_key.pdf`

Both US Letter proofs contain one student page and one answer-key page. All four pages were visually inspected: titles, instructions, graph titles, scenarios, labels, outlined symbols, visible one-unit keys, six question rows, response targets, answers, public footers, and page boundaries are clean and aligned. Both proofs are founder-approved.

Founder legibility correction, 2026-07-15: the Grade 2 pictograph data circles and key circle now use the approved `#4b5563` 1.15-point outline instead of inheriting the pale graph-rule stroke. The opt-in is isolated to these two Grade 2 resources; Grade 1 styling remains unchanged. Symbols remain unfilled and retain their exact size, spacing, counts, and geometry. The two proof PDFs were regenerated without changing graph truth, questions, answers, layout, or pagination, then re-rendered for print-legibility inspection and approved.

Founder approval is complete. Both catalog statuses remain `generated`, both records move from reconciliation Category D to Category A, and neither is promoted. Complete a Graph and Match Data to Graph remain untouched in Category D. Graph Questions remains an unimplemented proposed deferral in Category D pending a separate reconciliation decision.

## Pre-implementation resource inventory

At the planning scan, all five outputs contained 12 generic prose items, six items on each of two student pages followed by two answer-key pages. Every dataset was fixed; a seed changed only prompt order for four resources and did not change their data. `Interpret Data` bypassed the injected random function and was not same-seed stable. The implementation checkpoint above supersedes those baseline findings for Read and Interpret only.

| Exact ID | Baseline title | Status | Baseline fixed dataset | Baseline count | Baseline output state | Baseline runtime owner |
| --- | --- | --- | --- | ---: | --- | --- |
| `grade2_data_display_graphing_read_graph` | `Read a Graph - Grade 2` | `generated` | Apples 6, Bananas 4, Oranges 8 | 12 prompts; 3 unique | Four-page prose worksheet; no graph; repeated direct lookups | `readGraph.js` legacy fallback |
| `grade2_data_display_graphing_interpret_data` | `Interpret Data - Grade 2` | `generated` | Soccer 12, Basketball 9, Baseball 6 | 12 prompts; 3 unique | Four-page prose worksheet; no graph; most/least/difference only | `interpretData.js` legacy fallback |
| `grade2_data_display_graphing_graph_questions` | `Graph Questions - Grade 2` | `generated` | Red 5, Blue 8, Green 3 | 12 prompts; 3 unique | Four-page prose worksheet; no graph; mixed prompts repeat | `graphQuestions.js` legacy fallback |
| `grade2_data_display_graphing_complete_graph` | `Complete a Graph - Grade 2` | `generated` | Cats 4, Dogs 7, Birds 5 | 12 prompts; 3 unique | Four-page number-in-a-sentence task; no graph construction | `completeGraph.js` legacy fallback |
| `grade2_data_display_graphing_match_data_to_graph` | `Match Data to Graph - Grade 2` | `generated` | Apples 3, Bananas 6, Oranges 4 | 12 prompts; 3 unique | Four-page category lookup; no graph choices or matching action | `matchDataToGraph.js` legacy fallback |

The master and generated catalogs contain each exact ID once, with the same title, family, activity type, status, and answer-key declaration.

## Runtime traces

The five records share this live path:

`worksheetCatalog.master.json -> worksheetCatalogService.generateWorksheetFromCatalogId() -> buildWorksheet() -> data_display_graphing.json -> activity generator -> normalizeWorksheetLayout() -> buildCatalogWorksheetRuntime() -> normalizeWorksheetContent() -> shared preview/PDF route -> pdfRenderer -> answer key from normalized item answers`

Exact generator traces:

| Activity | Recipe activity | Generator | Current structured fields |
| --- | --- | --- | --- |
| Read | `read_graph` | `readGraph.js` | none |
| Interpret | `interpret_data` | `interpretData.js` | none |
| Mixed | `graph_questions` | `graphQuestions.js` | none |
| Construct | `complete_graph` | `completeGraph.js` | none |
| Select | `match_data_to_graph` | `matchDataToGraph.js` | none |

The normalizers and catalog runtime already preserve `graphData`, `graphTaskData`, `graphQuestionType`, `graphCategory`, response metadata, duplicate signatures, and answer state. The shared PDF renderer already draws full one-to-one pictographs, large construction pictographs, compact A/B pictograph choices, response-type-aware lines, completed answers, and keys. The missing ownership is the Grade 2 adapter and its explicit layout dispatch, not a new route or a standalone renderer.

## Current output findings

Temporary diagnostic PDFs were generated outside the repository and rendered to PNG. They were not retained as proofs.

- Every PDF is four pages: two sparse student pages and two matching key pages.
- No PDF renders a graph, key, category row, data table, axis, bar, symbol, source, or structured choice.
- The public instruction is teacher-facing catalog description copy beginning with `Students`.
- Titles repeat `Grade 2` even though the footer already carries the grade.
- The footer prints the internal `data_display_graphing` slug.
- Read, Graph Questions, Complete, and Match use injected randomness for prompt selection and are same-seed stable, but all repeat one fixed dataset. Different seeds only reorder three possible prompts.
- Interpret uses `Math.random` directly. Two calls with the same worksheet seed produce different item orders, so preview/PDF parity is not guaranteed if generation occurs twice.
- Current answer keys reproduce the prompt-level answer from the same runtime, but there is no graph truth against which to validate the answer.
- Twelve draws from a three-prompt pool guarantee repeated tasks. None of the five carries a duplicate signature.

Current classification for all five: **LEGACY TEXT-ONLY FALLBACK** and **FAMILY-LEVEL DESIGN CORRECTION**. `Interpret Data` is additionally **DUPLICATE LOGIC - CONSOLIDATE** and **UNSEEDED**.

## Launch-safe graph direction

Choose exactly one launch direction: **one-to-one pictographs only**.

This is the smallest safe direction because Ontario Grade 2 D1.3 explicitly includes one-to-one pictographs, and Yellow Bird already has a founder-approved pictograph truth model, a validated 100-topic context registry, full and compact pictograph geometry, construction state, matching choice state, and student/key parity. Pictographs keep every value directly countable and grayscale-safe.

Launch defaults:

- four categories;
- whole-number values 2-8;
- one outlined circle equals one topic-appropriate unit;
- exactly one repeated value when a mode question is required;
- unique minimum and maximum;
- proper title, source-bearing scenario, category labels, and key;
- no partial symbols and no scale above one;
- no colour dependency;
- no tally table, line plot, bar graph, axis scale, two-way table, or teacher-facing graph control.

Bar graphs and line plots are valid Grade 2 representations, but neither has a reviewed structured-data renderer contract in the current worksheet system. Adding either now would create a second visual contract, a scale/axis decision, and a larger proof burden. They require a separate family preflight after the pictograph family is stable.

## Minimum structured-data model

One immutable dataset must own every displayed value and every derived answer. The Grade 2 adapter may reuse the curated Grade 1 topic registry, but Grade 1 defaults must remain frozen.

Minimum `graphData`:

- `kind: "one_to_one_pictograph"`;
- stable `datasetId` and curated `topicId`;
- `title`, `scenario`, `scenarioType`, `dataSource`, `sourceText`, `collectionAction`, `purpose`, and `readingLevel`;
- `unitSingular`, `unitPlural`, and `questionNoun`;
- `symbol: "circle"`, `symbolValue: 1`, `keyLabel`, and `keyText`;
- `colorRequired: false`;
- exactly four `categories`, each with stable `id`, printable `label`, integer `value`, and optional category-language metadata;
- explicit derived facts owned before rendering: `minimumValue`, `maximumValue`, `modalValue`, `modalCategoryIds`, and `totalValue`;
- a deterministic dataset signature.

Minimum question item:

- `taskMode`, `graphQuestionType`, `prompt`, `responseMode`, and `responseType`;
- referenced category IDs in stable order;
- generator-owned `answer` and, where useful, structured `answerState`;
- a duplicate signature that includes dataset, task type, and referenced categories;
- no prompt parsing and no arithmetic in the renderer.

Minimum construction `graphTaskData`:

- `kind: "complete_pictograph"`;
- a four-row numeral `dataTable` derived from `graphData`;
- four graph rows with `targetValue`, `visibleCount`, `missingCount`, and `isIncomplete`;
- exactly two incomplete rows;
- an answer state that completes those same rows, not a separately regenerated graph.

Minimum selection `graphTaskData`:

- `kind: "match_graph"`;
- data table derived from the target dataset;
- exactly two choices with stable A/B IDs and complete structured category arrays;
- exactly one `correctChoiceId`;
- one controlled distractor changing exactly one category by 1 or 2 while remaining within 2-8;
- explicit distractor metadata and deterministic choice order.

The shared generator receives only injected randomness. Dataset selection, values, questions, missing rows, distractors, and choice order must all be stable for the same worksheet seed and vary across an adequate seed sample.

## Read a Graph

Exact ID: `grade2_data_display_graphing_read_graph`.

Role: direct retrieval from one visible pictograph. It should not ask comparisons, differences, totals, conclusions, or written explanations.

Decision: **ACTIVE - DIRECT SHARED-FAMILY REUSE WITH A GRADE 2 ADAPTER**.

The current prose fallback is unusable, but the product role is clear and teacher-useful. Grade 2 differentiation comes from an independently seeded 2-8 dataset, a source-bearing scenario, and accurate graph conventions, not from symbolic arithmetic.

## Interpret Data

Exact ID: `grade2_data_display_graphing_interpret_data`.

Role: compare and summarize one visible pictograph using most, least, mode, a small difference, and one two-category total. It must not duplicate direct category lookups except where a prompt needs named evidence.

Decision: **ACTIVE - SHARED READING FAMILY WITH A GRADE 2 QUESTION ADAPTER**.

The adapter must remove the direct `Math.random` path. A dataset used for a mode question must have exactly one repeated modal frequency and unique minimum and maximum. Questions and answers must derive from structured category IDs and values. The worksheet may identify the mode and the categories that share it, but the launch contract does not require a written explanation of what the mode indicates.

## Graph Questions

Exact ID: `grade2_data_display_graphing_graph_questions`.

Role today: a mixture of direct reading and interpretation prompts.

Decision: **DEFER - DUPLICATE/CUSTOMIZATION PRESET**.

It has no distinct student action beyond the retained Read and Interpret worksheets. Retaining an eight-question mixture would create a third shell over the same graph and question pools, increase founder proof and maintenance burden, and make resource selection less clear. A future teacher-selected `mixed review` preset could produce the same learning experience without maintaining a separate catalog record.

This record remains Category D now. After founder approval of the deferral it should move to G, not be deleted. Reconsider only if teacher testing shows consistent demand for a named mixed-review worksheet that cannot be met by a simple future question-mix control.

## Complete a Graph

Exact ID: `grade2_data_display_graphing_complete_graph`.

Role: construct missing pictograph symbols from a complete numeral table.

Decision: **ACTIVE - SHARED CONSTRUCTION FAMILY WITH A GRADE 2 ADAPTER**.

The task is one full-size graph, not 12 number blanks. Exactly two rows are incomplete; one row omits two symbols and one omits three symbols, while every label, row, and key remains visible. The answer key completes the same graph from the same truth object.

## Match Data to Graph

Exact ID: `grade2_data_display_graphing_match_data_to_graph`.

Role: select the pictograph that exactly represents a numeral table.

Decision: **ACTIVE - SHARED SELECTION FAMILY WITH NARROWED SCOPE**.

The launch worksheet contains two items with two A/B pictograph choices each. One graph matches exactly; one changes one category by 1 or 2. This is a representation-selection task, not direct category retrieval and not graph construction. If compact two-item proof is not readable at Grade 2 label lengths, reduce to one item rather than shrink symbols or type.

## Grade 1 family reuse map

| Grade 2 need | Approved Grade 1 owner | Reuse | Required boundary |
| --- | --- | --- | --- |
| Topic and scenario variety | `engine/content/grade1GraphTopics.js` | Reuse all validated context metadata and deterministic topic ranking | Treat registry as grade-banded shared content; do not change Grade 1 selection behavior |
| Graph truth | `grade1DataGraph.js` `buildGraphData()` contract | Extract or generalize a grade-neutral builder | Grade 2 values 2-8; Grade 1 fixed 3/5/5/7 default remains unchanged |
| Direct and comparison questions | Grade 1 read/interpret builders | Reuse response metadata and generator-owned answers | Grade 2 uses the exact question mixes below; no Grade 1 prompt changes |
| Pictograph primitive | `pdfRenderer.js` shared data graph function | Direct reuse | Keep symbol cap and readable geometry; no new renderer |
| Response targets | Grade 1 number/category/yes-no line contract | Direct reuse | Add a long category-pair response width only if proof demonstrates need; otherwise phrase mode-category prompt for one response |
| Construction | Grade 1 `complete_pictograph` truth and 504 x 298 geometry | Direct reuse with Grade 2 missing counts | Two and three missing circles; answer key restores the same rows |
| Selection | Grade 1 `match_graph` truth and compact A/B choices | Direct reuse with Grade 2 distractor limits | Two items maximum; one-item fallback if proof fails |
| Runtime normalization | Existing `graphData` / `graphTaskData` pass-through | Direct reuse | Add exact Grade 2 IDs only |
| Layout dispatch | Grade 1 data display flags | Small shared-family alias/extension | Replace grade-specific dispatch naming with shared data task naming without changing Grade 1 output |

Recommended architecture: extract grade-neutral graph truth/question helpers from the Grade 1-named module or wrap those exported helpers behind a new exact Grade 2 adapter. Do not add five new generators and do not put Grade 2 branching in the renderer. The renderer should consume shared display fields and structured truth only.

## Product-fit and duplication matrix

Legend: `D` distinct action; `A` adjacent but independently useful; `H` high overlap/duplicate.

|  | Read | Interpret | Graph Questions | Complete | Match |
| --- | --- | --- | --- | --- | --- |
| Read | - | A: retrieve vs compare | H: Read is a subset of mixed | D: answer vs construct | D: retrieve vs select representation |
| Interpret | A | - | H: Interpret is a subset of mixed | D: analyze vs construct | D: analyze vs select representation |
| Graph Questions | H | H | - | D | D |
| Complete | D | D | D | - | A: both connect table and graph, but draw vs select |
| Match | D | D | D | A | - |

Product decisions:

| Resource | Product-fit classification | Launch decision |
| --- | --- | --- |
| Read | DISTINCT STUDENT TASK | retain |
| Interpret | DISTINCT STUDENT TASK | retain |
| Graph Questions | DUPLICATE / CUSTOMIZATION PRESET | defer |
| Complete | DISTINCT STUDENT TASK | retain |
| Match | DISTINCT STUDENT TASK WITH NARROWED SCOPE | retain |

No retained resource is better as a card set at launch. Match could later support cut-apart cards, but its initial A/B worksheet action is coherent and already has a shared print path.

## Curriculum findings

Ontario Grade 2 D1.3 supports displaying data with one-to-one correspondence in concrete graphs, pictographs, line plots, and bar graphs with proper sources, titles, and labels. D1.4 introduces identifying the mode(s) and explaining what the measure indicates. D1.5 supports asking and answering questions, drawing conclusions, and making arguments from data presented in several ways.

| Resource | Classification under proposed contract | Safety boundary |
| --- | --- | --- |
| Read | **SAFE WITH TITLE OR INSTRUCTION CHANGE** | Read exact pictograph values and key only; do not call it data analysis |
| Interpret | **SAFE WITH NARROWED DEFAULT** | Most, least, one mode, one difference, one two-category total; no written argument or unsupported conclusion claim |
| Graph Questions | **SAFE AS OPTIONAL OVERRIDE** | Curriculum-safe content, but product-duplicate; not a launch resource |
| Complete | **SAFE WITH TITLE OR INSTRUCTION CHANGE** | One-to-one pictograph from a supplied table; proper source/title/labels/key; no scaled or partial symbols |
| Match | **SAFE WITH NARROWED DEFAULT** | Choose between two one-to-one pictographs; do not claim broad graph-type selection |

Reading and construction use whole-number counts only. The key is always one. There are no partial symbols, bar-graph scales, decimal values, or multi-step calculations. A two-category total is permitted only in Interpret and must stay within 16; it is a modest arithmetic demand derived from visible graph truth, not a symbolic worksheet disguised as data literacy.

## Design and print findings

| Resource | Current finding | Planned classification |
| --- | --- | --- |
| Read | Sparse repeated prose; no graph; internal footer | **PRINT-READY AFTER SHARED-FAMILY REUSE** |
| Interpret | Sparse repeated prose; no graph; unseeded item order | **MINOR FAMILY POLISH** after shared reuse |
| Graph Questions | Sparse mixed duplicate with no unique action | **NOT WORTH CORRECTING - DEFER** |
| Complete | No construction surface | **PRINT-READY AFTER SHARED-FAMILY REUSE** |
| Match | No choices or matching surface | **MINOR FAMILY POLISH** after compact-choice reuse |

Every active worksheet uses title -> divider -> student instruction -> source-bearing scenario -> graph/task. Graph labels use the approved Grade 1-readable type and grayscale-safe rules. The graph receives the largest useful area on the page. Student and key pages preserve title, instruction, scenario, data, graph geometry, ordering, and footer. No tiny gray content, internal identifier, or repeated teacher-facing metadata may print.

Teacher controls are deferred: graph type, topic, category count, value range, key/scale, question mix, question count, missing-row count, distractor type, and completed example.

## Proposed founder contracts

All active contracts use footer `Grade 2 • Math • Data & Graphing`, four categories, integer values 2-8, one outlined circle per unit, one student page plus one answer-key page, no subtitle, and no completed example.

### `grade2_data_display_graphing_read_graph`

- Final title: `Read the Pictograph`
- Instruction: `Use the pictograph to answer each question.`
- Graph type: one full-width one-to-one horizontal pictograph
- Graph count: 1
- Dataset: 4 categories; values 2-8; unique minimum and maximum; repeated value optional
- Key: one outlined circle = 1 topic unit
- Questions: exactly 6 - four category-value retrievals, one category-count retrieval, one key-value retrieval
- Layout: source-bearing scenario, 218-point graph, six response rows in two columns by three rows
- Answer format: 64-point numeric lines
- Answer key: same graph and order; generator-owned numeric answers on the same targets
- Completed example: none
- Proof count: 1 default student-plus-key PDF

### `grade2_data_display_graphing_interpret_data`

- Final title: `Interpret the Pictograph`
- Instruction: `Use the pictograph to compare the data and answer each question.`
- Graph type: one full-width one-to-one horizontal pictograph
- Graph count: 1
- Dataset: 4 categories; values 2-8; exactly one repeated modal value; unique minimum and maximum
- Key: one outlined circle = 1 topic unit
- Questions: exactly 6 - most category, least category, modal frequency, one category with the modal frequency, maximum-minus-minimum difference, and total of two named categories
- Layout: source-bearing scenario, 218-point graph, six response rows in two columns by three rows
- Answer format: response-type-aware 64-point numeric or 136-point category lines
- Answer key: same graph and order; all answers stored on the question items
- Completed example: none
- Proof count: 1 default student-plus-key PDF

### `grade2_data_display_graphing_complete_graph`

- Final title: `Complete the Pictograph`
- Instruction: `Use the data table to complete the pictograph.`
- Graph type: one full-width one-to-one horizontal construction pictograph
- Graph count: 1
- Dataset: 4 categories; values 2-8; unique minimum and maximum; repeated value optional
- Key: one outlined circle = 1 topic unit
- Questions: 0; one construction task
- Missing state: exactly two incomplete rows, one missing 2 circles and one missing 3 circles
- Layout: source-bearing scenario, 52-point four-cell numeral table, 504 x 298-point construction graph
- Answer format: draw outlined circles in the incomplete rows
- Answer key: same task with all target circles restored
- Completed example: none
- Proof count: 1 default student-plus-key PDF

### `grade2_data_display_graphing_match_data_to_graph`

- Final title: `Choose the Matching Pictograph`
- Instruction: `Circle the pictograph that matches each data table.`
- Graph type: compact one-to-one horizontal pictograph choices
- Graph count: 4 total choices across 2 items
- Dataset: 2 independently seeded topics; 4 categories per item; values 2-8
- Key: one outlined circle = 1 topic unit, printed once per item
- Item count: exactly 2; exactly 2 A/B graph choices per item
- Choice truth: exactly one correct choice; distractor changes one category by 1 or 2 and remains within range
- Layout: two full-width item bands; title/scenario, compact four-cell table, key, then equal A/B pictographs
- Answer format: circle A or B using the existing 18-point target
- Answer key: same choices and order; correct target outlined with established key emphasis
- Completed example: none
- Proof count: 1 default student-plus-key PDF; use a one-item replacement proof only if the two-item layout fails readability

## Recommended implementation batches

No more than three implementation batches are needed.

| Order | Exact IDs | Shared family / extension | New structured fields | Renderer reuse | Focused tests and proof | Risk / dependencies |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 - Core pictograph reading | `grade2_data_display_graphing_read_graph`; `grade2_data_display_graphing_interpret_data` | Exact Grade 2 adapter over shared topic selection, graph truth, question constructors, and response targets | Grade-banded dataset rules; derived mode/min/max/total facts; exact question references and signatures | Existing full pictograph and response-line paths; shared task flag alias only | 30-seed determinism/variation/truth/uniqueness; exact six-question mixes; student/key parity; 2 proofs | **LOW-MODERATE**; shared helper extraction must freeze Grade 1 output |
| 2 - Pictograph construction | `grade2_data_display_graphing_complete_graph` | Shared `complete_pictograph` task with Grade 2 missing counts | Four-row table; visible/target/missing counts; completion answer state | Existing 504 x 298 construction geometry | 30-seed row truth, exact missing counts, source/graph/key parity, geometry bounds; 1 proof | **MODERATE**; depends on Batch 1 graph model |
| 3 - Graph selection | `grade2_data_display_graphing_match_data_to_graph` | Shared `match_graph` task with Grade 2 value/distractor rules | Stable choices, correct choice ID, one-category distractor metadata | Existing compact A/B pictographs and selection targets | 30-seed one-correct-choice, no duplicate options, plausible distractor, fit/page checks; 1 proof | **MODERATE**; depends on shared model and compact readability proof |

Do not implement Graph Questions in any batch. Founder review should approve the family direction, the four active contracts, and the one deferral before Batch 1 begins.

## Recommended deferrals

| Exact ID | Reason | Deferral type | Duration / trigger | Teacher testing | Reconciliation destination |
| --- | --- | --- | --- | --- | --- |
| `grade2_data_display_graphing_graph_questions` | Mixed direct and interpretation questions duplicate the two retained reading resources; no unique student action | Duplicate and future customization preset | Later-phase, potentially permanent. Reconsider only after launch if teachers consistently seek a named mixed review that cannot be served by a question-mix control | Yes, testing can reopen it | Remain D now; move to G only after founder approval of deferral |

No other whole record is recommended for deferral. Bar graphs, line plots, scaled pictographs, partial symbols, tally-table input, and public controls are deferred variants, not catalog dispositions for these five records.

## Test and validator plan

Eventual shared assertions:

- exact five IDs are accounted for; all remain `generated`, the approved two are Category A, and the other three remain Category D;
- exact public titles, instructions, footers, counts, and page totals;
- no internal IDs, registry keys, or snake_case in printable output;
- same-seed stability and different-seed variation across at least 30 seeds;
- preview/PDF generation uses the same normalized item truth;
- identical student/key graph data, task data, question order, and geometry;
- no blank item, text-only fallback, unsupported output shape, or renderer-side arithmetic;
- Grade 1 output and Grade 3+ fallback isolation;
- no catalog promotion.

Structured graph truth assertions:

- four nonempty uniquely labelled categories and matching integer values in 2-8;
- stable category IDs and no duplicate dataset/question/task signatures;
- one outlined symbol per unit and `symbolValue === 1`;
- proper title, source-bearing scenario, labels, and key;
- unique minimum/maximum where required and one repeated modal value for Interpret;
- derived min/max/mode/total fields agree with category values;
- every answer derives from referenced graph data and matches the answer key;
- no direct `Math.random` in the Grade 2 path and no fixed dataset across all seeds.

Task assertions:

- Read: four category retrievals, one category count, one key value; numeric truth only.
- Interpret: exact six-type mix; correct most, least, mode, modal category, difference, and two-category total.
- Complete: table equals target graph; exactly two incomplete rows; exactly 2 and 3 missing symbols; key restores precisely those symbols.
- Match: two items, two distinct choices each, exactly one correct choice, one controlled distractor, stable choice order for the same seed.
- Deferred Graph Questions: no implementation, proof, status, or promotion change.

Existing regressions retained:

- `scripts/validateGraphTopicRegistry.js`
- `scripts/testGrade1CategoryFBatch2Data.js`
- `scripts/testGrade1CategoryFBatch3Data.js`

Planning-pass results: the 100-topic registry validator and Grade 1 Batch 2 reading suite pass. The Grade 1 Batch 3 suite completes its graph-family assertions, then fails its stale catalog baseline assertion because it expects ready 103 while the authoritative current count is 104. This is a test-maintenance defect, not a graph-family defect; it is documented here and was not changed in this planning task.

All six inspected data-specific JavaScript files pass syntax checks. The full worksheet audit passes Ready 104/104, Generated 213/213, and Partial 5/5 with zero failures; its only failures are the seven established planned `pattern_word_problems` gaps. `git diff --check` passes. The five Grade 2 records remain present exactly once and `generated`; Read and Interpret are Category A while Complete, Match, and Graph Questions remain Category D.

## Reconciliation scenarios

Category E remains 9 in every scenario and is shown so Total 52 is explicit.

| Scenario | A | D | E | G | Total | Assumption |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Current | 24 | 5 | 9 | 14 | 52 | No change |
| A - all five implemented and founder-approved | 29 | 0 | 9 | 14 | 52 | No deferrals |
| B - four active approved; Graph Questions deferral approved | 28 | 0 | 9 | 15 | 52 | Recommended destination |
| C - only Batch 1 approved; Graph Questions deferral approved | 26 | 2 | 9 | 15 | Complete and Match remain D |
| D - all five deferred | 24 | 0 | 9 | 19 | 52 | No implementation |

If the founder approves Batch 1 but has not yet approved the Graph Questions deferral, the temporary state is A26 / D3 / E9 / G14 / Total52. The recommended Scenario C assumes both decisions are taken at the same family gate.

## Risks

- A broad edit to the Grade 1-named module could change approved Grade 1 datasets, prompts, or proofs. Freeze Grade 1 defaults with isolation fixtures before extraction.
- The current renderer dispatch uses Grade 1-specific display names even though its pictograph primitive is shared. Add a shared alias rather than duplicating branches.
- The renderer silently caps pictograph rows at eight symbols. The Grade 2 launch range must therefore stop at 8 unless a separately tested geometry change is approved.
- Interpret can become arithmetic-heavy or overclaim analysis. Keep one small difference and one two-category total, with all other questions graph-focused.
- Mode wording can confuse a modal value with the categories carrying it. Store both explicitly and ask separate unambiguous questions.
- Compact matching can become unreadable with long labels. Use curated fitting labels and reduce item count before reducing type or symbol size.
- A mixed worksheet is easy to build but hard to distinguish. Do not preserve Graph Questions merely for catalog count.
- The generic audit currently treats these prose fallbacks as working. A focused structured-visual gate is mandatory before founder proof or promotion.

## Recommended next action

Ask the founder to approve:

1. one-to-one pictographs as the only launch graph direction;
2. the four active contracts and no-completed-example decision;
3. deferral of `grade2_data_display_graphing_graph_questions` as a duplicate/customization preset;
4. Batch 1 as `Read the Pictograph` plus `Interpret the Pictograph`.

After approval, authorize only Batch 1 implementation and its two default student-plus-key proofs. Do not update reconciliation or promotion state until implementation, focused validation, visual proof review, and a separate checkpoint are complete.
