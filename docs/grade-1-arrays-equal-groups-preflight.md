# Grade 1 Arrays and Equal Groups Preflight Addendum

Date: 2026-07-13
Status: implementation-ready for a reduced founder PDF review; resources remain `generated` and reconciliation class C
Scope: Grade 1 declarations only; the approved shared multiplication-model family is not reopened

## Decision summary

The committed multiplication-model architecture is reusable for Grade 1, but its generic defaults were not Grade 1-safe. The two Grade 1 resources now declare an eight-question, one-page default; factors from 2 through 5; and a maximum total of 10. Public-facing copy uses **number sentence** and **Early Multiplication Thinking**, while the response remains the founder-directed `___ × ___ = ___` representation.

Founder subsequently approved the informal multiplication number sentence for these Grade 1 visual models. The canonical operator is the true mathematical multiplication symbol `×`; a lowercase letter `x` is not acceptable. The correction is applied in the shared multiplication-model renderer and carried as structured `responseOperator` metadata, so student blanks, completed Question 1, answer keys, and Grade 2+ shared models use the same symbol. The computational operator remains `*`, and ordered-pair duplicate keys remain internal implementation identifiers.

This is honest as supported visual representation of equal groups. It is not multiplication-fact fluency, mastery, assessment, or complete Grade 1 multiplication coverage.

## Targets and active paths

| Resource | Catalog declaration | Active implementation |
| --- | --- | --- |
| `grade1_multiplication_facts_arrays` | Catalog title `Arrays — Grade 1`; public PDF title `Arrays`; `generated`; Grade 1; `visual_models`; activity `array`; template `model_interpretation`; answer key supported | `array.js` → shared `multiplicationModelFactors.js` → `buildWorksheet` → `worksheetCatalogService` Grade 1 adapter → shared `model_interpretation` layout → `pdfRenderer` array model cell |
| `grade1_multiplication_facts_equal_groups` | Catalog title `Equal Groups — Grade 1`; public PDF title `Equal Groups`; `generated`; Grade 1; `visual_models`; activity `equal_groups`; template `model_interpretation`; answer key supported | `equalGroups.js` → shared `multiplicationModelFactors.js` → `buildWorksheet` → `worksheetCatalogService` Grade 1 adapter → shared `model_interpretation` layout → `pdfRenderer` equal-groups model cell |

Both are available through the internal catalog runtime, `/api/catalog-preview/:id`, and `/api/catalog-pdf/:id`. Their public detail pages remain status-gated because neither resource is promoted. No customization UI is exposed.

Related Grade 1 catalog candidates are `grade1_multiplication_facts_missing_factor`, `grade1_multiplication_facts_skip_counting`, and `grade1_multiplication_facts_word_problems`. There is no Grade 1 equal-sharing/division target in this batch. None of these related candidates is mapped into the founder packet.

## Founder evidence

`/Users/davidbirnie/Desktop/Project Yellowbird/G1 Review.csv` contains 12 reviewed Grade 1 rows and contains no Arrays or Equal Groups row, title, or ID. Therefore there is no direct CSV mapping to either target and none is silently inferred.

The applicable founder direction is the task brief plus the approved shared-family closeout recorded in `docs/decisions.md` and `docs/YellowBird_Status.md`:

- fixed eight-question, two-column by four-row model grid;
- one standard dot size, adaptive spacing, and stable group boundaries;
- semantic answer order of rows × columns or groups × objects per group;
- three standard answer targets;
- one instruction instead of repeated prompt prose;
- completed Question 1 may count inside the requested total;
- answer-key geometry matches the student worksheet;
- no internal labels in the footer.

The Grade 1 reconciliation correctly records both resources as class C: the shared runtime was approved elsewhere, but Grade 1 defaults and proofs were absent. This addendum does not change that classification.

## Curriculum and public-framing safety

The project-stored Ontario Grade 1 expectation B2.5 says students should “represent and solve equal-group problems where the total number of items is no more than 10 ... using tools and drawings.” This local source is sufficient; no web research is needed.

Safe public language:

- arrays, rows and columns;
- equal groups and objects in each group;
- number sentence;
- visual equal-group reasoning;
- early multiplication thinking;
- repeated addition, only in explanatory copy or a later teaching support—not as a required extra response here.

Unsafe or overstated language:

- multiplication mastery;
- multiplication-fact fluency;
- formal multiplication assessment;
- complete Grade 1 multiplication coverage.

The `×` sentence is treated as an informal representation attached to a concrete visual. The worksheet does not ask students to recall facts from memory. The safer phrase **complete the number sentence** replaces **write a multiplication equation** in the student instruction.

## Shared architecture findings

Already correct and retained:

- deterministic, shuffled ordered-pair pools;
- no duplicate ordered pair until the pool is exhausted;
- arrays preserve `rows_columns` orientation;
- Equal Groups preserves `groups_items` orientation;
- response metadata is `[first factor, second factor, total]`;
- shared dot radius is 2.4 pt (4.8 pt diameter) for every model;
- arrays use adaptive edge spacing without changing dot size;
- Equal Groups uses up to five containers across and a second row only above five;
- fixed two-column/eight-item page geometry;
- equation targets anchored at the lower right of each cell;
- answer keys use the identical model geometry and fill only the answer values;
- optional total-only and question-sentence behavior remains available to other approved family members.

Grade 2+ or generic behavior not inherited as a Grade 1 default:

- generic 2–6 factor bounds;
- recipe-derived 10 or 12 question counts;
- totals above 10;
- the public skill slug `multiplication_facts`;
- the stronger “write a multiplication equation” instruction;
- a separate `Example` heading.

Global behavior that must not change:

- dot and container renderer geometry;
- shared factor-pool and duplicate policy;
- Grade 2+ titles, instructions, ranges, layouts, and example behavior;
- Equal Sharing Division behavior;
- public customization registry or UI.

## Arrays design contract

Title: `Arrays`

Instruction: `Count the rows and columns. Complete the number sentence for each array.`

Question anatomy:

1. normal question number;
2. array model near the number gutter;
3. rows separated vertically and columns separated horizontally;
4. response `___ × ___ = ___` at lower right;
5. no repeated prompt prose and no additional work line by default.

The response order is always `rows × columns = total`. Rotated equivalents such as 2 × 5 and 5 × 2 are distinct because the ordered row/column interpretation changes, but identical ordered pairs are duplicates. Orientation does not vary independently in the current renderer.

Default bounds are 2–5 rows, 2–5 columns, and total no greater than 10. This produces exactly eight unique ordered pairs: 2×2, 2×3, 2×4, 2×5, 3×2, 3×3, 4×2, and 5×2. Factor 1 is excluded by default to keep the task from becoming a set of counting strips, but an explicit teacher/runtime override may include it.

The shared model uses a 2.4 pt dot radius, 4.8 pt diameter, standard 7.2 pt edge gap, and 2.4 pt minimum adaptive edge gap. The question box is the shared equal-height half-width cell in a two-column by four-row printable content grid; its exact dimensions are derived from the current page content box rather than hard-coded per resource.

Completed-example behavior: when requested, Question 1 is completed, remains numbered 1, counts inside the requested total, uses the normal cell geometry, and has no separate Example heading. Only the three inserted values are emphasized. Question 2 follows normally.

## Equal Groups design contract

Title: `Equal Groups`

Instruction: `Count the groups and the objects in each group. Complete the number sentence.`

Question anatomy:

1. normal question number;
2. clearly outlined equal containers;
3. the same number of standard-size dots in every container;
4. response `___ × ___ = ___` at lower right;
5. no repeated prompt sentence and no additional work line by default.

The response order is always `number of groups × objects in each group = total`. It never alternates. The stable duplicate signature is the ordered pair `(groups, objectsPerGroup)`; object arrangement is deterministic renderer geometry and is not a separate content signature.

Default bounds are 2–5 groups, 2–5 objects per group, and total no greater than 10. The same eight ordered pairs form the default pool. Factor 1 is excluded by default but remains an explicit override. At most five groups appear in one row under the Grade 1 bounds, so the model remains immediately distinguishable and uncrowded.

The shared dot size is identical to Arrays. Group containers use adaptive item spacing/padding with a standard 8 pt inter-group gap in measurement and a minimum 2.5 pt gap when fitting. Boundaries remain light, stable, and print-legible.

Completed Question 1 and answer-key behavior match the Arrays contract.

## Counts, capacity, and distribution

| Behavior | Arrays | Equal Groups |
| --- | --- | --- |
| Default requested total | 8 | 8 |
| Student-page capacity | 8 | 8 |
| Grid | 2 columns × 4 rows | 2 columns × 4 rows |
| Completed example | optional Q1, inside total | optional Q1, inside total |
| Default student pages | 1 | 1 |
| Default answer-key pages | 1 matching page | 1 matching page |
| Low count | exact count on one calm page | exact count on one calm page |
| High count | exact count, chunks of at most 8 | exact count, chunks of at most 8 |

The layout never adds a question to make an example. A high count not divisible by eight can create a sparse final page; that is preferable to shrinking models or violating the exact requested total. The future public control should guide teachers toward 4 or 8 for one-page use and multiples of 8 for longer packets, but it must not silently round their selection.

## Variable contract

Runtime-supported and teacher-useful:

- `questionCount` (default 8; exact);
- Arrays: `minRows`, `maxRows`, `minCols`/`minColumns`, `maxCols`/`maxColumns`;
- Equal Groups: `minGroups`, `maxGroups`, `minItemsPerGroup`, `maxItemsPerGroup`;
- shared `maxTotal`/`maxProduct` (default 10);
- selected ordered factor lists through existing internal aliases;
- factor 1 through an explicit minimum or selection override;
- `includeExample`/completed example;
- `includeAnswerKey` at PDF render time;
- `questionsPerPage` internally;
- deterministic worksheet seed internally.

For these two Grade 1 declarations, the response mode and per-question sentence are fixed to `multiplication_sentence` and off respectively. Generic family support for total-only responses and repeated question sentences is intentionally not exposed through the Grade 1 runtime contract.

Smallest useful future public set:

- number of questions;
- maximum rows and columns, or groups and objects per group;
- maximum total, with Grade 1 guidance at 10;
- include factor 1;
- show one completed example;
- include answer key.

Deferred from public controls:

- selected factors and separate ordered-factor lists;
- questions per page;
- dot size, spacing, object style, and group shape;
- seed;
- orientation variation/balance;
- response-mode switching;
- layout density.

No public UI is built in this batch.

## Like-minded family comparison

- Addition Facts supplies the header/divider/instruction hierarchy, normal numbering, quiet footer, and completed-Q1 convention.
- Base Ten Blocks supports the balanced visual cell and short, task-specific response treatment; an extra repeated-addition line is omitted because it would compete with the three required targets.
- Ten Frames supports count-aware scaling and the preference for large readable models rather than denser pages.
- Approved multiplication-model resources supply canonical dot size, model placement, equation placement, and answer-key parity.
- Fact Families is comparable only for multiple answer targets; its four-equation grid is not reused.

Both Grade 1 targets therefore retain the Yellow Bird Name/Date header, title, divider, single instruction, hidden subtitle, consistent numbering, calm model grid, and public-only footer.

## Proof and test plan

The original founder packet contained exactly four PDFs:

1. `g1_arrays_default.pdf`
2. `g1_equal_groups_default.pdf`
3. `g1_arrays_completed_question_1.pdf`
4. `g1_equal_groups_completed_question_1.pdf`

Each PDF includes its matching answer key so parity is visible without adding a fifth comparison file. Visual QA must render every PDF page to PNG and inspect student and answer-key pages for dot scale, semantic order, spacing, overflow, footer cleanliness, Question 1 treatment, and print balance.

After founder approval of the informal multiplication sentence, the symbol-only recheck is reduced to exactly two PDFs:

1. `g1_arrays_completed_question_1_multiplication_symbol.pdf`
2. `g1_equal_groups_completed_question_1_multiplication_symbol.pdf`

Each recheck PDF contains one completed-Question-1 student page and its matching answer-key page. The purpose is solely to verify the true `×` glyph and spacing.

Focused automated checks cover IDs, titles, instructions, subtitle/prompt suppression, metadata order, exact counts, default limits, completed Q1, no Example label, answer-only example display declaration, deterministic generation, controlled pool repetition, clean footer, page counts, and answer-key parity. Existing family and catalog regressions remain required.

## Explicit deferrals and founder decision

Deferred:

- promotion or reconciliation reclassification;
- catalog metadata/title/tag cleanup that belongs in a later promotion checkpoint;
- public preview/detail exposure and customization UI;
- a repeated-addition work line;
- factor-1 frequency weighting;
- rotation controls;
- other Grade 1 multiplication candidates;
- changes to Grade 2+ models.

The informal `×` number sentence is founder-approved. The reduced typography recheck requires only `g1_arrays_completed_question_1_multiplication_symbol.pdf` and `g1_equal_groups_completed_question_1_multiplication_symbol.pdf`, each with its matching answer-key page. This correction changes no design, curriculum framing, range, count, layout, footer, example behavior, status, or architecture decision.
