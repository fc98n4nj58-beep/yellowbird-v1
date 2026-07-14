# Grade 1 Category F Batch 3 Data Construction and Application Preflight

Date: 2026-07-14
Status: implementation complete; founder proof review pending; no promotion or reconciliation change

The approved implementation changes the three internal/generated worksheet resources and creates local founder proofs. It does not change catalog status, reconciliation, public UI, Grade 2+ behaviour, or promotion.

## Batch scope

| Resource ID | Current status | Current title | Proposed final title | Proposed instruction | Distinct student action |
| --- | --- | --- | --- | --- | --- |
| `grade1_data_display_graphing_complete_graph` | `generated` / Category F | Complete a Graph — Grade 1 | **Complete the Pictograph** | **Use the data table. Draw circles to complete the pictograph.** | Construct missing parts of a one-to-one pictograph from supplied data. |
| `grade1_data_display_graphing_match_data_to_graph` | `generated` / Category F | Match Data to Graph — Grade 1 | **Choose the Matching Graph** | **Look at each data set. Circle the graph that matches.** | Evaluate two visible representations and select the one matching a data table. |
| `grade1_data_display_graphing_graph_word_problems` | `generated` / Category F | Graph Word Problems — Grade 1 | **Use the Graph to Solve** | **Use the graph and the new information to answer each question.** | Combine one graph value with one small, explicit added fact. |

All three remain internal/generated. Public naming, promotion, and teacher controls require separate decisions.

## Architecture scan

### Current shared path

All three catalog IDs enter the same production route:

`catalog item → worksheetCatalogService → buildWorksheet → normalizeWorksheetLayout → catalogWorksheetRuntimeService → normalizeWorksheetContent → shared preview/PDF routes → pdfRenderer → buildAnswerKeyItems`

- Preview: `/api/catalog-preview/:id` calls `buildCatalogWorksheetRuntime()`.
- PDF: `/api/catalog-pdf/:id` calls the same runtime and the shared worksheet renderer.
- Routes are thin and should remain unchanged.
- Seed creation is centralized in `buildWorksheet()` through `createSeededRandom()`.
- Answer keys are derived from normalized structured items through `buildAnswerKeyItems()`.
- The existing generic Grade 2+ generators must remain unchanged; Batch 3 should branch only for the three Grade 1 IDs, as Batch 2 does.

### Current resource findings

| Resource | Catalog / recipe / generator | Actual current output | Existing coverage | Finding |
| --- | --- | --- | --- | --- |
| Complete a Graph | `data_display_graphing`; `complete_graph`; registered `completeGraph.js`; catalog requests `visual_model` | A generic one-column text prompt describing fixed Cats/Dogs/Birds bar-graph values and asking for a missing numeral. No graph, construction target, scenario, topic package, or structured graph data. The seed changes only which of three fixed labels is blank. | Catalog audit; Batch 2 isolation test checks status only. No task-specific proof or test. | Works only as a text question. Title, description, template promise, and task do not match. |
| Match Data to Graph | `data_display_graphing`; `match_data_to_graph`; registered `matchDataToGraph.js`; catalog requests `matching` | A generic one-column text prompt with fixed Apples/Bananas/Oranges values. The student names the category for one numeral; there are no graph choices and no matching interaction. | Catalog audit; Batch 2 isolation test checks status only. No task-specific proof or test. | Works only as a category lookup. It does not match data to a graph. |
| Graph Word Problems | `data_display_graphing`; `graph_word_problems`; recipe mentions the activity, but `getGenerator()` has no owner | The current activity-selection path returns an empty problem list. The shared renderer produces an empty worksheet shell, and the catalog audit does not flag the missing student items. | Catalog audit reports the entry as working; Batch 2 isolation test checks status only. No proof or task test. | Does not work as a student task. Explicit Grade 1 generator ownership is required. |

The public library label map still describes `complete_graph` and `match_data_to_graph` as text-based graph questions. That is a later public-metadata concern only; this preflight authorizes no route or UI change.

### Reuse and consolidation decision

Batch 3 should extend `engine/problemGenerators/grade1DataGraph.js` and the committed structured graph contract. It should reuse:

- `engine/content/grade1GraphTopics.js`;
- all 100 validated topics and scenarios;
- deterministic rendezvous topic selection and immediate-repeat avoidance;
- adaptive singular/plural units and question nouns;
- the one-to-one outlined-circle pictograph;
- the full-size 42-point header, 176-point body, and four equal 44-point bands;
- shared scenario rendering;
- structured response types and aligned Grade 1 answer targets;
- shared content/layout normalization;
- student, completed, and answer-key parity.

Do not create a separate graph registry, hard-code new topic labels, put scenario prose in the renderer, or change generic Grade 2+ generators. The existing generic `completeGraph.js` and `matchDataToGraph.js` can remain compatibility paths for other grades.

Three real task modes are justified:

- `complete_graph`: construct missing symbols from supplied values.
- `match_graph`: select the representation matching supplied values.
- `graph_application`: combine a displayed value with one explicit contextual change.

Each mode represents a different student action. They should share graph truth data and topic data rather than share one generic question template.

## Duplication and distinct-use gate

| Resource | Comparison with Batch 2 | Classification | Recommendation |
| --- | --- | --- | --- |
| Complete the Pictograph | Batch 2 supplies and reads a complete graph. This task asks the student to construct two missing rows from a data table. | **VIABLE WITH TITLE/TASK CLARIFICATION** | Build in Batch 3 using the shared full-size pictograph. |
| Choose the Matching Graph | Batch 2 asks questions about one graph. This task asks the student to compare representations and select the graph whose values match a supplied table. | **VIABLE WITH TITLE/TASK CLARIFICATION** | Build with a narrow two-choice visual contract and conservative density. |
| Use the Graph to Solve | Batch 2 Graph Questions uses only facts already visible in the graph. This task adds exactly one new fact per question and requires one small addition or subtraction step. | **ARCHITECTURAL CONSOLIDATION REQUIRED** | Build with narrowed scope only after explicit ownership is added to the shared Grade 1 graph runtime. |

The application task is distinct only if every question genuinely combines graph data with one new fact. Direct-count, most/least, ordinary comparison, difference, and same questions belong to Batch 2 and must not be used to pad this resource.

## Curriculum safety

Ontario Grade 1 D1.2 supports collecting and organizing data from observations, experiments, and interviews. D1.3 supports one-to-one concrete graphs and pictographs with sources, titles, and labels. D1.4–D1.5 support ordering, asking and answering questions, and drawing modest conclusions from tally tables, concrete graphs, and pictographs. B2.4 supports simple contextual addition and subtraction situations.

Safe Grade 1 boundaries for this batch:

- Continue using one outlined circle for one unit.
- Keep values from 3–7 and use whole symbols only.
- Do not introduce scales greater than one, fractional symbols, axes, bar graphs, averages, formal sampling language, or multi-step analysis.
- Use the committed short scenarios and familiar collection language: voted, surveyed, counted, sorted, recorded, observed, votes, sightings, and other topic-appropriate units.
- Supply data as a compact numeral table. A tally table is a valid future variant but is not needed for this first construction contract.
- Limit graph construction to completing missing rows rather than drawing an entire graph, title, labels, and key from scratch.
- Keep application changes to adding or removing 1 or 2, with every result non-negative and no greater than 9 under the current 3–7 graph range.
- Make each application question independent and explicitly state the new information; students should never have to carry an updated value into the next question.
- Require only circles, a circled choice, or a short numeral. Do not require written explanations.

No genuine curriculum conflict was found under these limits. The current graph-word-problem title is too broad, and the current construction/matching titles overpromise their text-only implementations; the proposed titles state the actual student actions more honestly.

## Shared data model

The canonical graph truth should remain one structured object containing:

- stable topic ID and topic family;
- scenario and scenario metadata;
- title;
- four category IDs and labels;
- values from 3–7, including one equal pair and unique maximum/minimum where inherited from Batch 2;
- unit singular, unit plural, and question noun;
- key text and `symbolValue: 1`;
- `symbol: circle` and `colorRequired: false`;
- worksheet seed and deterministic selection state.

Task-specific structured data should be added without altering graph truth:

### Construction data

- `taskMode: complete_graph`;
- deterministic `missingCategoryIds` with exactly two distinct rows;
- a four-category numeral data table;
- full expected symbol counts for answer-key rendering;
- student visibility state that masks only the selected rows.

### Matching data

- `taskMode: match_graph`;
- one topic package and one four-category data table per item;
- two structured graph choices with stable choice IDs;
- exactly one correct choice;
- a distractor that changes two category counts while preserving the same labels, units, 3–7 range, and total display clarity;
- deterministic choice order and `correctChoiceId`.

### Application data

- `taskMode: graph_application`;
- one shared full graph per page;
- `changeAction` of `add` or `remove`;
- `changeAmount` of 1 or 2;
- target category ID and original value;
- computed final value and numeric answer;
- topic-aware, unit-aware prompt fields;
- a duplicate signature based on topic, category, operation, amount, and result.

The renderer should consume these structures. It must not choose missing rows, invent distractors, compute answers, select contexts, or write scenario-specific prose.

## Layout proposal

Common page contract:

- Letter portrait; one student page by default.
- Matching answer-key page follows when requested.
- 54-point left/right content margins and the existing safe footer margin.
- Subtitle hidden.
- Title approximately 18–20 points, bold; instruction 11 points; scenario 10 points; graph labels 11 points; key 10 points.
- Footer: `Grade 1 • Math • Data & Graphing`.
- Scenario remains regular, quiet, left aligned, unboxed, and topic-supplied.
- Source Sans 3 and grayscale-safe strokes remain unchanged.

### Complete the Pictograph

- Page hierarchy: title → divider → instruction → scenario → compact four-category numeral table → one full-size graph → footer.
- Use the approved 42-point graph header, 176-point body, and four 44-point category bands.
- All four labels and the key remain visible.
- Exactly two deterministic rows are empty in the student graph. The two other rows remain complete as visual references.
- The numeral table states all four target counts; no question section is needed.
- Each empty 44-point band provides the full symbol area for hand-drawn circles. Do not add tiny circle placeholders or raw underscores.
- Answer key renders the complete graph using the same geometry and may emphasize only the inserted circles through the existing answer style, not by changing counts or positions.
- Default completed example: **none**. The two completed reference rows already demonstrate the symbol convention, and a solved missing row would remove half the task. Completed construction mode remains deferred.

### Choose the Matching Graph

- Page hierarchy: title → divider → instruction → two vertically stacked matching items → footer.
- Each item contains a one-line scenario, a compact four-category numeral table, a shared key, and two side-by-side graph choices labelled A and B.
- Safe default: **2 items per page, 2 choices per item**. Three or four items would force tiny labels and symbols.
- The full-size 42/176/44 geometry remains unchanged for Batch 2 and the other Batch 3 resources. Matching choices require one shared compact pictograph variant, derived from the same geometry function and tokens, with a 26-point header and four equal 28-point category bands. This is a task-specific size variant, not a second graph system.
- Compact choices must retain all four categories, readable labels of at least 9.5 points, outlined symbols, equal bands, a visible choice label, and a key shown once per item.
- Provide an 18–20-point circle target beside A and B. Do not ask students to write a category name.
- Answer key circles the correct choice while preserving both graph choices unchanged.
- Default completed example: **none**. With only two safe items, solving one would remove half the practice. A completed example remains deferred until founder review shows it is needed.

If the compact choice proof cannot keep four labels and seven symbols readable, fall back to one item per page with two larger choices. Do not solve the fit problem by shrinking type below the Grade 1 minimum.

### Use the Graph to Solve

- Page hierarchy: title → divider → instruction → scenario → one full-size graph → four contextual application questions → footer.
- Reuse the approved 42/176/44 full graph unchanged.
- Safe default: **4 questions**, arranged in a calm two-column by two-row area below the graph.
- Each question contains one short added fact and one direct question. No question may require more than one addition or subtraction step.
- Default response type is `number`; use the approved 44-point local start and 64-point response line.
- Do not include Batch 2 direct-reading or comparison questions as filler.
- Completed mode: **Question 1 completed inside the four**, no Example heading, same graph and geometry, only the inserted answer emphasized. This model is useful because it demonstrates how to combine a graph value with new information.
- Answer key uses the same scenario, graph, prompts, response positions, and computed values.

## Density limits

| Resource | Default capacity | Maximum for initial implementation | Reason |
| --- | ---: | ---: | --- |
| Complete the Pictograph | 1 graph task; 2 incomplete rows | 1 graph task; 2 incomplete rows | Preserves full-size drawing bands and avoids turning construction into tiny symbol work. |
| Choose the Matching Graph | 2 items; 2 choices each | 2 items; 2 choices each | Four compact graphs are already the safe visual maximum on one Grade 1 page. |
| Use the Graph to Solve | 4 application questions | 6 only after a separate proof | Four leaves room for readable added facts and aligned writing targets below the full graph. |

Exact totals must be preserved. No renderer may silently drop an item, row, choice, or question to fit.

## Answer-target contract

- **Drawing area:** the existing graph symbol area within each 44-point incomplete category band; students draw outlined circles freehand.
- **Selection target:** one visible 18–20-point circle beside each A/B choice. Student and key positions are identical.
- **Number response:** approved 64-point line beginning 44 points from the local column origin.
- **Category response:** approved 136-point line if a later validated variant needs it; not used in the initial application task.
- **Yes/No response:** approved 84-point line if a later validated variant needs it; not used initially.
- **Short written answer:** no sentence response in the initial batch. Grade 1 students should not be required to explain their reasoning in writing here.

## Completed examples

| Resource | Recommendation | Reason |
| --- | --- | --- |
| Complete the Pictograph | No completed mode initially | Two already-complete rows model the graph; solving one missing row removes too much construction practice. |
| Choose the Matching Graph | No completed mode initially | The circle interaction is direct, and solving one of two items removes half the practice. |
| Use the Graph to Solve | Optional completed Q1 counted inside 4 | A single solved application demonstrates how the new fact combines with the graph without changing density. |

## Variable plan

No new public controls are approved.

Potential later teacher-facing controls, subject to separate product review:

- Topic/context from the approved registry.
- Number of application questions within a safe 4–6 range.
- One or two incomplete construction rows.
- Include one completed application question.
- Include answer key.

Internal-only controls:

- Worksheet seed and proof seed.
- Explicit `graphTopicId`.
- Missing-row IDs.
- Distractor construction and A/B order.
- Change operation, amount, and target category.
- Compact/full geometry variant.
- Page capacity, retry limits, duplicate signatures, and validation diagnostics.

Deferred controls:

- Scale greater than one.
- Tally-table input.
- Three graph choices.
- More than two matching items per page.
- Full graph drawing from a blank frame.
- Student-written explanations.
- Public topic selection.

## Deterministic validation

Implementation must fail loudly unless all applicable checks pass:

1. Target ID maps to exactly one approved Batch 3 task mode.
2. Topic and scenario come from the validated 100-topic registry.
3. Same seed and options yield identical topic, values, missing rows, distractors, choice order, changes, prompts, and answers.
4. Graph values remain whole numbers from 3–7; one circle equals one unit.
5. Four unique categories, unit grammar, title, key, and scenario remain paired.
6. Construction has exactly two distinct incomplete rows and exposes the correct four numeral values.
7. Construction answer key restores exactly the missing symbol counts without changing visible rows.
8. Matching has exactly two choices and exactly one correct choice.
9. Matching distractor is visibly different, stays in range, uses the same labels/units, and cannot accidentally equal the source data.
10. Matching answer ID remains stable through content normalization and answer-key generation.
11. Compact choice labels and seven-symbol rows fit at the approved minimum type and symbol sizes.
12. Application questions contain exactly one change of 1 or 2 and compute from the original graph independently.
13. Application results are non-negative, no greater than 9, and consistent with the prompt's singular/plural unit.
14. No duplicate task signatures appear within a worksheet.
15. Default/completed/answer-key modes preserve scenario, graph truth, order, geometry, and wrapping.
16. Full graphs retain the 42-point header, 176-point body, and four 44-point bands.
17. Response lines retain the 44-point start and 64/136/84 widths.
18. No clipping, overflow metadata, colour dependency, unsupported placeholders, or renderer-owned mathematics appears.
19. Batch 2 and Grade 2+ graph behaviour remain unchanged.
20. Exact requested item/question totals and catalog status `generated` remain unchanged.

## Risks and mitigations

- **Task duplication:** prohibit Batch 2 question types in the application resource and require a different student action in every mode.
- **Too many tiny graphs:** cap matching at two items/two choices and fall back to one item if compact proof readability fails.
- **Excessive reading:** use registry scenarios and one short added fact; no written explanation.
- **Graph-answer ambiguity:** construction uses a complete numeral table; matching has exactly one correct choice; application questions are independent.
- **Symbol-count mismatch:** derive student masks and key symbols from one immutable graph truth object.
- **Answer-key mismatch:** carry structured missing-row, choice-ID, and application-answer metadata through normalization.
- **Context/data mismatch:** select scenario and units with the topic package and prohibit renderer prose.
- **Cramped drawing space:** retain full 44-point bands and only two missing rows.
- **Renderer duplication:** parameterize the existing pictograph primitive for compact choices; do not create a separate graph renderer.
- **Audit false confidence:** add focused assertions that Graph Word Problems has non-empty structured items; the current generic audit accepts its empty shell.
- **Grade 2+ regression:** keep all new selection and layout branches explicitly scoped to the three Grade 1 IDs.

## AI-readiness check

| Boundary | Batch 3 rule |
| --- | --- |
| Deterministic Yellow Bird owns | Values, correct graph, missing rows, distractors, choice order, application arithmetic, units, layout, pagination, answer keys, and validation. |
| AI may propose later | An approved topic, a registry-compatible scenario alternative, a teacher-intent mapping such as easier/fewer questions, or language alternatives that pass Grade 1 and unit validators. |
| AI must never control directly | Answers, graph counts, distractor correctness, curriculum claims, unsafe context, geometry, pagination, publication, or promotion. |
| Evidence of Yellow Bird quality | Same-seed parity, structured metadata, exact totals, student/key parity, readable print proofs, topic-context agreement, focused regressions, and founder approval. |

AI may propose. Yellow Bird rules decide. No AI implementation belongs in this batch.

## Reduced founder proof plan

Do not generate proofs until the production implementation is explicitly authorized. Proposed packet: four PDFs, each containing the student page(s) and matching answer-key page(s).

1. `grade1_complete_the_pictograph_founder_default.pdf`
   - Observation or count topic.
   - Four-category data table, two incomplete rows, complete answer key.
   - Demonstrates full-size drawing space and exact symbol restoration.
2. `grade1_choose_the_matching_graph_founder_default.pdf`
   - Two items using two distinct topic/scenario types.
   - Two A/B graph choices per item and answer-key selection targets.
   - Demonstrates compact-choice readability at the safe maximum density.
3. `grade1_use_the_graph_to_solve_founder_default.pdf`
   - Observation topic and four independent one-fact application questions.
   - Default fully unanswered; matching key.
4. `grade1_use_the_graph_to_solve_founder_completed_q1.pdf`
   - Survey or vote topic with the same four-question contract.
   - Q1 completed inside the total; Q2–Q4 unanswered; matching key.

If the matching compact variant is not readable, replace its proposed proof with `grade1_choose_the_matching_graph_founder_large_choices.pdf` showing one item with two larger choices. Do not add a fifth PDF merely to preserve an unsafe density.

## Founder decisions required

Implementation is blocked only on these design approvals:

1. Approve the proposed roles, titles, and instructions for all three resources.
2. Approve Complete the Pictograph as one full-size graph with two incomplete rows, a numeral table, no follow-up questions, and no completed mode.
3. Approve Choose the Matching Graph at two items with two compact A/B choices each, with a one-item fallback if the proof is not Grade 1-readable.
4. Approve Use the Graph to Solve as four independent one-fact addition/subtraction questions, with optional completed Q1 inside the four.
5. Approve the four-PDF reduced founder packet.

No decision about promotion, public controls, Grade 2+, scales above one, tally tables, or AI is required for this implementation gate.

## Initial implementation recommendation

| Resource | Title | Count | Example | Answer format | Recommendation |
| --- | --- | ---: | --- | --- | --- |
| `grade1_data_display_graphing_complete_graph` | Complete the Pictograph | 1 graph / 2 incomplete rows | None | Draw outlined circles | **BUILD IN BATCH 3** |
| `grade1_data_display_graphing_match_data_to_graph` | Choose the Matching Graph | 2 items / 2 choices each | None | Circle A or B | **BUILD WITH NARROWED SCOPE** |
| `grade1_data_display_graphing_graph_word_problems` | Use the Graph to Solve | 4 questions | Optional completed Q1 | 64-point numeric line | **BUILD WITH NARROWED SCOPE** |

Implementation should be one controlled Grade 1 extension of `grade1DataGraph.js`, one shared pictograph rendering system with full and compact size variants, structured normalization fields, one focused Batch 3 test, and one proof generator. Reconciliation changes only after founder approval, implementation, proof review, and commit authorization.

## Files inspected

- `docs/sprint.md`
- `docs/decisions.md`
- `docs/architecture.md`
- `docs/engineering-principles.md`
- `docs/worksheet-design-preflight.md`
- `docs/grade-1-founder-review-reconciliation.md`
- `docs/grade-1-category-f-batch-roadmap.md`
- `docs/grade-1-category-f-batch-2-data-preflight.md`
- `docs/ai-readiness-strategy.md`
- `data/worksheetCatalog.master.json`
- `data/worksheetCatalog.generated.json`
- `data/curriculum/ontario/math_k6.json`
- `engine/activityRecipes/data_display_graphing.json`
- `engine/content/grade1GraphTopics.js`
- `engine/problemGenerators/index.js`
- `engine/problemGenerators/completeGraph.js`
- `engine/problemGenerators/matchDataToGraph.js`
- `engine/problemGenerators/grade1DataGraph.js`
- `engine/worksheetBuilder/buildWorksheet.js`
- `engine/layout/normalizeWorksheetLayout.js`
- `engine/worksheetBuilder/normalizeWorksheetContent.js`
- `services/worksheetCatalogService.js`
- `services/catalogWorksheetRuntimeService.js`
- `routes/worksheetPreviewRoutes.js`
- `routes/worksheetPdfRoutes.js`
- `routes/libraryRoutes.js`
- `renderers/pdfRenderer.js`
- `scripts/testGrade1CategoryFBatch2Data.js`
- `scripts/validateGraphTopicRegistry.js`
- `scripts/generateGrade1CategoryFBatch2DataProofs.js`

## Pre-implementation sign-off

Family: Grade 1 Data Construction, Matching, and Application

Activities: `complete_graph`, `match_graph`, `graph_application`

Grades: Grade 1 only

Approved header/instruction: Pending founder decisions above

Layout: One full construction graph; two compact matching items; one full application graph with four questions

Answer target: Draw circles; circle A/B; aligned numeric line

Default page capacity: 1 construction task; 2 matching items; 4 application questions

Pagination risks: Compact matching readability; application question wrapping; no silent item removal

Completed example: Application Q1 only; none for construction or matching

Answer key: Same scenarios, graphs, data, ordering, wrapping, and answer geometry

Footer: `Grade 1 • Math • Data & Graphing`

Teacher-facing variables: Deferred pending separate product review

Runtime-only variables: Seed, topic, missing rows, choice order/distractors, change action/amount, geometry variant

Deferred controls: Scale, tally input, three choices, full blank graph, public topic control, written explanations

Shared architecture level: Shared Grade 1 graph runtime and shared pictograph renderer variant

Proof packet: Four proposed founder PDFs after implementation authorization

Known risks: Duplication, tiny graphs, reading load, ambiguity, symbol/key mismatch, context mismatch, drawing space, renderer duplication, audit blind spot

Implementation verdict: **IMPLEMENTED; FOUNDER PROOF REVIEW PENDING**

## Implementation record

Implemented on 2026-07-14 as one Grade 1-only extension of the existing data family.

- `engine/problemGenerators/grade1DataGraph.js` now owns the approved `complete_graph`, `match_graph`, and `graph_application` task structures, mathematics, context-compatible wording, topic selection, missing-row selection, and controlled distractors.
- All three modes reuse the validated 100-topic registry, shared one-to-one graph truth, seeded generation state, shared runtime, and answer-key transformation.
- One structured `graphTaskData` payload is carried through layout normalization, content normalization, the catalog runtime, and answer-key items.
- The PDF renderer uses the existing parameterized pictograph geometry. Batch 2 and Graph Application retain the standard 42-point header, 176-point body, and four 44-point bands. Construction and compact matching use the founder-approved variants recorded below.
- Complete the Pictograph renders one numeral table and one full graph with exactly two add-only incomplete rows. Its answer key renders the completed graph.
- Choose the Matching Graph renders two readable items on one page, with different topics when alternatives are available, one data table, two equal A/B graph choices, an 18-point selection target, and one controlled one-category error per distractor.
- Use the Graph to Solve renders one full graph and four independent one-fact questions using exactly `+1`, `+2`, `-1`, and `-2`. Numeric answers use the approved 64-point response geometry. Only this mode supports completed Question 1 inside the four.
- Catalog titles, descriptions, instructions, counts, and layouts are aligned in both catalog files. All three statuses remain `generated`.

## Verification results

- `node scripts/testGrade1CategoryFBatch3Data.js`: passed.
- Same-seed parity: passed for all three resources.
- Student/answer-key graph, topic, scenario, and task-data parity: passed.
- Batch 2 full graph geometry and six-question Read the Graph behavior: unchanged in regression checks.
- Generic complete-graph fallback used outside the Grade 1 Batch 3 IDs: unchanged in regression checks.
- Full catalog audit: ready `103 / 103`, generated `213 / 213`, partial `6 / 6`, ready failures `0`, other failures `0`.
- The only catalog generator gaps remain the seven planned `pattern_word_problems` resources.

## Founder proof packet

Exactly four two-page PDFs were generated under `review/grade-1-category-f-batch-3-data/founder-review/`:

1. `grade1_complete_the_pictograph_founder_default.pdf`
2. `grade1_choose_the_matching_graph_founder_default.pdf`
3. `grade1_use_the_graph_to_solve_founder_default.pdf`
4. `grade1_use_the_graph_to_solve_founder_completed_q1.pdf`

All eight pages were rendered to PNG for visual inspection. The two-item matching layout passed the Grade 1 readability gate, so the one-item fallback was not used. No clipping, crowding, footer collision, ambiguous answer, or answer-key mismatch was found. Founder approval remains pending.

## Founder correction pass

Status: implemented on 2026-07-14; corrected founder proof review pending.

### Correction 1: enlarged construction pictograph

Complete the Pictograph now receives a construction-only geometry package through layout metadata. It continues to use the shared pictograph primitive and the same graph truth, data table, topic, scenario, values, incomplete rows, and answer-key path.

| Geometry field | Corrected value |
| --- | ---: |
| Overall width | 504 points |
| Overall height | 298 points |
| Header height | 42 points |
| Body height | 256 points |
| Category-band height | 64 points |
| Label-column width | 112 points |
| Circle diameter | 22 points |
| Circle centre gap | 38 points |
| First-circle inset after label column | 28 points |
| Proof top | 246 points |
| Proof bottom | 544 points |

The graph begins immediately after the one-line scenario and 52-point numeral table. A maximum seven-circle row remains within the 504-point content width with 16 points between adjacent circle edges. The larger bands and symbols provide deliberate Grade 1 drawing room without approaching the footer or changing safe margins. Batch 2 and Use the Graph to Solve remain at 218 points overall, with the standard 42/176/44 geometry and 16-point circles.

### Correction 2: headerless compact matching choices

The compact pictograph primitive now supports a clean zero-height header. The redundant internal `Graph A` and `Graph B` labels are removed; the external 18-point circled A/B targets remain the only choice labels. Each compact choice remains 138 points high, so removing the former 26-point header increases each of the four equal category bands from 28 points to 34.5 points. Student choices remain visually equal. On the answer key only the correct external target receives the established 2-point outline; all other targets retain the 0.8-point outline.

### Correction 3: topic-aware application events

Application wording now comes from a validated generator-level language contract keyed by structured `scenarioType`, with topic unit, family, category, and singular/plural grammar supplied by the existing topic package.

- Votes and surveys use `chose` and `changed from` events.
- Count contexts use items added to or taken from the named group.
- Sorting contexts use `sorted into` and `taken from` events.
- Supported animal, bug, and vehicle observations use direct `seen` and `left` events with category-aware singular/plural labels.
- Experiments use `tested` and `set aside` events.
- Fixed weather records and observation topics without a natural subtractive event are excluded deterministically from Graph Application topic selection. An explicitly requested unsupported topic is rejected rather than forced into unnatural wording.

No application question uses `counted by mistake`, `record was checked`, or `count was checked`. The operation distribution remains exactly one `+1`, one `+2`, one `-1`, and one `-2` question. Questions remain independent and compute from the original graph values; subtraction starts at 3 or more, so results stay non-negative. Completed mode still answers Question 1 only inside the total of four.

The broader decision file was not changed because its existing Grade-Banded Applied-Math Context rule already requires maturity-appropriate wording and renderer-agnostic structured scenario metadata.

### Corrected proof packet and verification

The four stable proof paths remain:

1. `review/grade-1-category-f-batch-3-data/founder-review/grade1_complete_the_pictograph_founder_default.pdf`
2. `review/grade-1-category-f-batch-3-data/founder-review/grade1_choose_the_matching_graph_founder_default.pdf`
3. `review/grade-1-category-f-batch-3-data/founder-review/grade1_use_the_graph_to_solve_founder_default.pdf`
4. `review/grade-1-category-f-batch-3-data/founder-review/grade1_use_the_graph_to_solve_founder_completed_q1.pdf`

All four contain one student page and one matching answer-key page. The corrected eight pages were rendered and inspected. Final automated verification includes the topic-registry validator, Batch 2 and Batch 3 data suites, the requested Grade 1 family regressions, proof generation, the full worksheet audit, syntax checks, and whitespace checks. Catalog statuses remain unchanged, no reconciliation or public UI was updated, and founder review remains pending.

## Final category-noun language correction

Status: implemented on 2026-07-14; founder recheck pending.

Count and sorting application prompts now use category-language metadata instead of the broad graph unit (`item/items`). Each safe category language package carries `singularNoun`, `pluralNoun`, singular/plural `addPhrase`, singular/plural `removePhrase`, and `counterType`. This metadata travels with graph categories into the generator; the renderer remains language-agnostic.

The compact irregular-noun registry includes:

- `paper`: `sheet of paper` / `sheets of paper`, with `was/were used` for subtraction;
- `glue`: `glue stick` / `glue sticks`, with `was/were used`;
- `scissors`: `pair of scissors` / `pairs of scissors`, with `was/were used`;
- `chalk`: `piece of chalk` / `pieces of chalk`, with `was/were used`;
- `bark`, `corn`, `yarn`, `foil`, `bread`, and `fruit`: safe counter nouns;
- `leaves`, `shelves`, and `people`: validated irregular singular/plural forms.

Safe single-word count nouns derive a singular/plural pair deterministically. Compound labels, uncountable labels without metadata, and contexts whose category labels describe an indirect measure rather than the counted object are not guessed. Those topic/application combinations are excluded from seeded selection, and an explicit request is rejected. Selection then falls back deterministically to another validated Graph Application topic. The generator never falls back to `[category] group` or generic `item` wording.

Final classroom-material examples are:

- `One sheet of paper was used. How many sheets of paper are left?`
- `One more pencil was added. How many pencils are there now?`
- `Two glue sticks were used. How many glue sticks are left?`
- `Two more crayons were added. How many crayons are there now?`

The approved pond wording is unchanged. The operation distribution remains exactly `+1`, `+2`, `-1`, and `-2`; all four questions remain independent, numeric, deterministic, and non-negative. Completed mode still answers Question 1 only.

Only the two affected proof files are regenerated for this final pass:

1. `review/grade-1-category-f-batch-3-data/founder-review/grade1_use_the_graph_to_solve_founder_default.pdf`
2. `review/grade-1-category-f-batch-3-data/founder-review/grade1_use_the_graph_to_solve_founder_completed_q1.pdf`

The Complete the Pictograph and Choose the Matching Graph proof files remain untouched. Their approved geometry and content are unchanged. The broader decision file remains unchanged because the existing Curated Context Registries and Grade-Banded Applied-Math Context decisions already require structured, concrete, grade-appropriate generator language.

Final verification passed the 100-topic registry validator, Batch 2 and Batch 3 data suites, all requested Grade 1 family regressions, JavaScript syntax checks, PDF page/text validation, visual inspection of the four regenerated pages, the full worksheet audit, and `git diff --check`. Same-seed failures remain `0`. Catalog health remains ready `103 / 103`, generated `213 / 213`, partial `6 / 6`, ready failures `0`, other failures `0`; only the seven planned `pattern_word_problems` gaps remain. All three Batch 3 resources remain `generated`. Reconciliation, public UI, promotion state, Grade 2+ behaviour, graph geometry, task counts, answer values, and completed-mode behaviour are unchanged.
