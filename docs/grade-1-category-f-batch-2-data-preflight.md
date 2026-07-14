# Grade 1 Category F Batch 2 Data Preflight

Date: 2026-07-14
Status: founder-approved and reconciled for controlled production commit; no promotion change

## Distinct-use gate

`G1 Review.csv` contains no direct row for these resources. The roadmap and Ontario Grade 1 D1.3-D1.5 expectations provide design guidance, not founder approval.

| Resource | Verdict | Distinct student action |
| --- | --- | --- |
| `grade1_data_display_graphing_read_graph` | **PROCEED - DISTINCT STUDENT TASK** | Directly read category counts, category count, and the one-to-one key. |
| `grade1_data_display_graphing_interpret_data` | **PROCEED - DISTINCT STUDENT TASK** | Compare categories using most, least, more, fewer, same, and one small difference. |
| `grade1_data_display_graphing_graph_questions` | **PROCEED - DISTINCT STUDENT TASK** | Complete a broader mixed practice set combining direct reading and interpretation. |

## Shared graph contract

- Model: one calm horizontal pictograph supplied by a curated topic package; the original classroom package is titled `Favourite Classroom Activities`.
- Categories: four unique, coherent Grade 1 labels supplied by the selected topic package.
- Values: four whole-number counts from 3-7; no empty categories; one equal pair supports `same` questions.
- Key: one outlined circle equals one topic-appropriate unit; no scale above one and no colour dependency.
- Rendering: one shared graph per worksheet, reused unchanged on its answer key; outlined symbols, even spacing, grayscale-safe rules, large labels, safe margins.
- Runtime: seeded Grade 1-only shared graph/question module used by the existing `readGraph`, `interpretData`, and `graphQuestions` entry points; Grade 2+ fallbacks remain unchanged.
- Footer: `Grade 1 • Math • Data & Graphing`.
- Status: all three remain `generated`; no public UI or promotion.

## Founder correction pass: alignment and topic variety

The founder approved the shared one-to-one pictograph concept and the three distinct student tasks. The required correction pass keeps that design while applying these changes:

- The graph title and symbol key now use one explicit 42-point header-row box and share one vertical centerline.
- The graph body now divides its full height evenly among all four category bands. The former `height - 54` calculation left 12 extra points beneath the fourth category; the corrected contract uses the actual body bounds, so all four bands have identical height and padding.
- Exactly 100 curated, validated topic packages now live in `engine/content/grade1GraphTopics.js` across 12 balanced families.
- Task structure and surface context are separate. Read, compare, and mixed-question semantics stay in the generator; titles, labels, and unit grammar come from structured topic packages; the renderer only consumes graph data.
- Topic selection uses deterministic rendezvous hashing over stable topic IDs. Registry order does not affect selection, and later registry expansion causes only limited remapping rather than shifting every seed by array position.
- A shared selection state excludes the immediately previous topic when another valid topic exists, preventing consecutive-page repetition.
- An internal `graphTopicId` option supports deterministic QA and future teacher selection, but no public control has been added.
- Batch 3 construction, matching, and word-problem resources remain out of scope.
- The founder recheck packet is reduced to three two-page PDFs using `Favourite Fruits`, `Playground Activities`, and `Animals Seen at a Pond`.

## Final correction pass: aligned Grade 1 response lines

The response-line correction preserves the approved graph and topic system. Each graph question now carries an explicit `number`, `category`, or `yes_no` response type through worksheet generation, normalized content, completed mode, and answer-key generation.

- Every response line begins 44 points from its local worksheet-column origin, directly beneath the prompt area.
- Number responses use a 64-point line, category responses use a 136-point line, and Yes/No responses use an 84-point line.
- Prompt height is measured in the same post-number-gutter text box used for rendering, so wrapped questions cannot overlap or shift their response lines.
- Completed Question 1 and answer-key values use the same response geometry as unanswered student questions.
- The three replacement founder recheck PDFs retain `Favourite Fruits`, `Playground Activities`, and `Animals Seen at a Pond` so review stays focused on response-line geometry.

Standing rule: Grade 1 response lines should use predictable aligned writing columns and response-type-aware widths rather than being positioned from question-text length.

## Grade-banded graph context follow-up

Every Grade 1 topic package now includes a short public scenario and structured metadata: `scenarioType`, `dataSource`, `collectionAction`, `purpose`, and `readingLevel`. All 100 packages are covered. The scenario types are distributed as 19 votes, 11 surveys, 22 observations, 18 counts, 22 sorting activities, 3 records over time, and 5 experiments.

The Grade 1 page hierarchy is title, instruction, scenario, graph, and questions. The scenario is regular 10-point text, left aligned across the full content width, limited to two rendered lines, and placed without a box between the instruction and the graph. It is supplied by the topic package and carried through the shared runtime; the PDF renderer contains no topic-specific scenario copy. Student, completed-Q1, and answer-key pages reuse the same scenario and graph data.

Scenario validation rejects missing or incompatible metadata, placeholders, answer-revealing comparisons or quantities, repeated graph titles, inaccessible or sensitive assumptions, non-Canadian spelling, topic-unit mismatch, and copy that exceeds the Grade 1 length or two-line limits.

The final founder context recheck packet lives in `review/grade-1-category-f-batch-2-data/founder-context-recheck/` and contains three two-page PDFs:

- `grade1_read_the_graph_context_recheck.pdf` — `Favourite Fruits`, framed as a class vote.
- `grade1_compare_the_data_context_recheck.pdf` — `Playground Activities`, framed as a student survey.
- `grade1_graph_questions_context_recheck.pdf` — `Animals Seen at a Pond`, framed as an observation record.

This follow-up does not change the approved graph geometry, response-line geometry, topic choices, counts, questions, completed Question 1, answer keys, Batch 3 resources, status, public controls, or reconciliation data.

## Resource contracts

| Resource | Title | Instruction | Questions | Answer target | Completed example |
| --- | --- | --- | ---: | --- | --- |
| Read Graph | `Read the Graph` | `Use the graph to answer each question.` | 6 | Short writing line | Q1 completed inside the six; useful as a direct-count demonstration. |
| Interpret Data | `Compare the Data` | `Use the graph to compare the categories and answer each question.` | 6 | Short writing line | Q1 completed inside the six; demonstrates a category-name response. |
| Graph Questions | `Graph Questions` | `Use the graph to answer each question.` | 8 | Short writing line | Q1 completed inside the eight; mixed types remain unanswered after Q1. |

All default worksheets are fully unanswered. Completed mode has no Example heading, adds no question, keeps the same graph and geometry, and emphasizes only the inserted answer. Answer keys preserve graph data, question order, and all answers.

## Accessibility, risks, and founder decisions

- The display is understandable without colour, decorative icons, a legend, or a difficult axis scale.
- Questions avoid ambiguous pronouns, multi-step arithmetic, colour recognition, and repeated graph prose.
- Batch 3 construction, matching, and graph-word-problem resources are unchanged.
- Founder approval confirms the outlined-circle pictograph, topic packages, six/six/eight densities, completed-Q1 choice, and the distinct mixed purpose of Graph Questions. Promotion and public controls remain separate decisions.
