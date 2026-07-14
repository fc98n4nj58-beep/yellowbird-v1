# Grade 1 Category F Batch Roadmap

Date: 2026-07-14

Scope: planning only. This document does not change classifications, catalog statuses, production code, promotion, or founder approval.

## Source and coverage

The authoritative reconciliation contains exactly 19 Category F resources: 18 generated/ready worksheet candidates plus one ready Exit Ticket. None has an exact matching ID or title in the 12-row `G1 Review.csv`; direct founder-note coverage is therefore **0 / 19**. Approved sibling notes and later repository decisions are useful design evidence but are not direct approval.

Shared rules that apply to any later batch: complete a Founder Worksheet Design Preflight first; keep Grade 1 text readable; use student-facing instructions; number questions; preserve identical student/answer-key geometry; emphasize answers only; use the dense solved-Question-1 pattern only when the family preflight approves it; keep public UI and promotion separate; and prefer honest Grade 1 framing over catalog count.

## Exact Category F inventory

`Review` is the direct CSV review number. Every `— / no` entry means no direct row and no direct recommendation. Sibling guidance is summarized as inherited evidence only.

| Review / direct row | Resource | Status and active path | Founder evidence and nearest approved sibling | Shared decision / curriculum and public-framing risk | Main design risk | Effort |
| --- | --- | --- | --- | --- | --- | --- |
| — / no | `grade1_addition_subtraction_facts_equation_match` — Equation Match — Grade 1 | generated; `equationMatch` → `matching` → shared PDF | No recommendation. Nearest: Addition Facts and Fact Families; numbered tasks, no separator/response lines, matching answer key, clear title/instruction, controlled Q1 example. | C2.2–C2.3 supports equivalent addition/subtraction expressions. Must be relational matching, not ordinary equation solving. | Current generator emits one arithmetic equation, not a pair/match task. | M |
| — / no | `grade1_addition_subtraction_facts_missing_addend` — Missing Addends — Grade 1 | generated; `missingAddend` → `fluency_grid` → shared PDF | No recommendation. Nearest: review 8 `g1_missing_addends_within_20`; 1–60, no separators/answer lines, selected values, matching key, Q1 example. | B2.1–B2.4; approved dense fluency system is reusable. High duplicate/count-padding risk. | Must establish a distinct scope from the canonical within-20 worksheet or defer it. | L |
| — / no | `grade1_addition_subtraction_facts_word_problems` — Word Problems — Grade 1 | generated; generic `wordProblems` → `equation_practice` → shared PDF | No recommendation. Nearest: reviews 2, 7, and 11; 1–4 questions, equal work space, work boxes, matching key, “show your work” instruction. | B2.4 fits, but the title and operation are unspecified. Existing Grade 1 addition, subtraction, and missing-addend story sheets are approved. | Generic title/task duplicates three canonical resources; current routing can collapse to addition. | M |
| — / no | `grade1_data_display_graphing_complete_graph` — Complete a Graph — Grade 1 | generated; `completeGraph` → `visual_model` → shared PDF, but prompt is text-only | No recommendation and no approved Grade 1 graph sibling. | D1.2–D1.3 supports tally tables, concrete graphs, and one-to-one pictographs. Sprint requires structured graph visuals before graph claims. | Needs a construction response and a genuine Grade 1 display, not a sentence describing a bar graph. | H |
| — / no | `grade1_data_display_graphing_graph_questions` — Graph Questions — Grade 1 | generated; `graphQuestions` → `equation_practice` → shared PDF, text-only | No recommendation and no approved Grade 1 graph sibling. | D1.4–D1.5 supports ordering, questions, and conclusions from tally tables/concrete graphs/pictographs. | One shared display should drive several varied questions without repeated prose. | H |
| — / no | `grade1_data_display_graphing_graph_word_problems` — Graph Word Problems — Grade 1 | generated; recipe fallback → `equation_practice` → shared PDF | No recommendation. No approved Grade 1 graph sibling; word-problem notes support work space only after task ownership is correct. | D1.5 may support contextual data questions. Sprint explicitly lists graph word problems as fix-needed. | No explicit generator ownership; graph context, display, response, and work-space contract are unresolved. | H |
| — / no | `grade1_data_display_graphing_interpret_data` — Interpret Data — Grade 1 | generated; `interpretData` → `equation_practice` → shared PDF, fixed text-only data | No recommendation and no approved Grade 1 graph sibling. | D1.4–D1.5 is a strong fit if a tally table or one-to-one pictograph is actually shown. | Fixed Soccer/Basketball/Baseball prompt pool and no display create repetition and weak worksheet truthfulness. | H |
| — / no | `grade1_data_display_graphing_match_data_to_graph` — Match Data to Graph — Grade 1 | generated; `matchDataToGraph` → `matching` → shared PDF, text-only | No recommendation and no approved Grade 1 graph sibling. | D1.3 supports choosing/reading one-to-one representations. | Requires multiple visible graph choices and a matching answer system; current prompt asks for a category value instead. | H |
| — / no | `grade1_data_display_graphing_read_graph` — Read a Graph — Grade 1 | generated; `readGraph` → `visual_model` → shared PDF, text-only | No recommendation and no approved Grade 1 graph sibling. | D1.3–D1.5 fits when using concrete graphs or one-to-one pictographs with titles/labels/sources. | Title promises a visual graph that the current generator does not supply. | H |
| — / no | `grade1_fraction_equivalence_compare_fractions` — Compare Fractions — Grade 1 | generated; `compareFractions` → `equation_practice` → shared PDF | No recommendation. No approved Grade 1 fraction worksheet sibling; the Grade 4 comparison Quick Check is too distant to imply approval. | B1.8 permits comparing **unit fractions** from fair-sharing drawings. Generic same-denominator symbolic comparisons are not the approved framing. | Must become drawing-led unit-fraction comparison with a clear symbol/choice target. | H |
| — / no | `grade1_fraction_equivalence_fraction_number_line` — Fraction Number Line — Grade 1 | generated; `fractionNumberLine` array-return generator → `equation_practice`; no fraction visual | No recommendation and no approved Grade 1 fraction sibling. | B1.6–B1.8 emphasizes fair sharing and drawings, not number-line placement. Architecture/sprint defer visual fraction work. | Unique geometry, unsupported output shape, and uncertain Grade 1 curriculum framing. | H |
| — / no | `grade1_fraction_equivalence_fraction_word_problems` — Fraction Word Problems — Grade 1 | generated; recipe fallback → `equation_practice` | No recommendation. Word-problem layout guidance is inherited only after a valid fraction task exists. | Only fair-share contexts involving halves, fourths, unit fractions, and up to ten sharers are safe. Sprint lists `fraction_word_problems` as fix-needed. | No explicit generator ownership; sentence, drawing, work area, and expected response are unresolved. | H |
| — / no | `grade1_fraction_equivalence_match_equivalent_fractions` — Match Equivalent Fractions — Grade 1 | generated; `matchEquivalentFractions` → `equation_practice` → shared PDF | No recommendation and no approved Grade 1 fraction sibling. | B1.7 supports the narrow relationship one half = two fourths in fair-sharing contexts, not a general equivalence-facts sheet. | Current arbitrary symbolic equivalence is too broad; needs drawings and a tightly limited task. | H |
| — / no | `grade1_fraction_equivalence_shade_fraction_models` — Shade Fraction Models — Grade 1 | generated; array-return `shadeFractionModels` → `equation_practice`; no model renderer | No recommendation and no approved Grade 1 fraction sibling. | B1.6–B1.8 supports drawing/fair-sharing representations. | Requires a new partitioned-shape interaction and answer-key convention; current output has no model to shade. | H |
| — / no | `grade1_multiplication_facts_missing_factor` — Missing Factors — Grade 1 | generated; `missingFactor` → `fluency_grid` → shared PDF | No recommendation. Nearest: approved Arrays/Equal Groups family with factors 2–5, total ≤10, drawings, and informal `×` number sentences. | B2.5 supports equal-group problems with drawings, not abstract multiplication-fact recall. | Abstract blank-factor equations over generic 2–10 bounds are not Grade 1-safe without a visual model. | H |
| — / no | `grade1_multiplication_facts_word_problems` — Word Problems — Grade 1 | generated; generic `wordProblems` → `equation_practice` → shared PDF | No recommendation. Nearest: approved Equal Groups plus reviewed work-box conventions. | B2.5 supports equal-group stories with totals ≤10, tools, and drawings; avoid mastery/fact-fluency claims. | Needs explicit equal-group story ownership, visual/work-space decision, small bounds, and a non-generic title. | M–H |
| — / no | `grade1_place_value_representation_compare_numbers` — Compare Numbers — Grade 1 | generated; `compareNumbers` → `equation_practice` → shared PDF | No recommendation. Nearest: review 4 `g1_compare_numbers_to_20`; numbered, no separators, light symbol target, variable count/range, matching key, Q1 example. | B1.3 permits comparison to 50; approved canonical resource already covers to 20. | Must establish a distinct to-50 or representation-led contract, otherwise defer as a duplicate. | L |
| — / no | `grade1_place_value_representation_number_line_identify` — Number Line — Grade 1 | generated; `numberLineIdentify` → `visual_model` → shared PDF | No recommendation. Nearest: review 6 `g1_number_line_identify_to_20`; full-width line, worksheet-level instruction, matching key. Later decision permits fewer than ten questions. | Grade 1 number-line bounds should remain conservative unless explicitly reframed. | Existing canonical worksheet already owns the task; title and distinct use case are absent. | L |
| — / no | `g1_compare_numbers_to_20_exit_ticket` — Compare Numbers to 20 Exit Ticket | ready; `compareNumbers` → separate `exit_ticket` renderer; public | Worksheet CSV explicitly does not cover Exit Tickets. Nearest content sibling: review 4 comparison worksheet; nearest format evidence: approved Exit Ticket lane. | Already committed and audit-safe. Exit Tickets are 3–5 minute lesson-close formative checks, not assessments or mini worksheets. | Classification depends on whether founder-review reconciliation includes non-worksheet proof, not implementation. | L/admin |

## Proposed family batches and risk

Ratings describe a later controlled implementation pass. Curriculum ambiguity and renderer risk are better when **LOW**; the three reuse/clarity ratings are better when **HIGH**.

| Order | Batch | Resources | Implementation reuse | Founder-note clarity | Design reuse | Curriculum ambiguity | Renderer risk | Founder packet | Correction risk |
| ---: | --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| 1 | Relational equations and comparison | equation match; missing addends; place-value compare numbers | HIGH | HIGH via approved siblings, but indirect | HIGH | LOW | LOW | 6 PDFs | MEDIUM: two distinct-use gates and equation-match semantics |
| 2 | Data reading and interpretation | read graph; interpret data; graph questions | HIGH | LOW | HIGH | MEDIUM | HIGH: first structured Grade 1 data display | 6 PDFs | HIGH |
| 3 | Data construction, matching, and application | complete graph; match data to graph; graph word problems | HIGH after Batch 2 | LOW | MEDIUM | MEDIUM | MEDIUM after Batch 2 | 6 PDFs | HIGH |
| 4 | Fair-share fraction models | shade fraction models; compare fractions; match equivalent fractions | MEDIUM | LOW | MEDIUM | HIGH | HIGH: partitioned-shape models/interactions | 6 PDFs | HIGH |

## Recommended first batch

Implement next only after one family preflight confirms distinct product roles:

1. `grade1_addition_subtraction_facts_equation_match` — Equation Match — Grade 1
2. `grade1_addition_subtraction_facts_missing_addend` — Missing Addends — Grade 1
3. `grade1_place_value_representation_compare_numbers` — Compare Numbers — Grade 1

Why these belong together: all are short Grade 1 relational number-sentence tasks, use numeric/symbol answer targets, can share the approved dense full-page/Q1/answer-key conventions, and require no new visual primitive. C2.2–C2.3 and B1.3/B2.1–B2.4 give clear curriculum anchors. The missing-addend and comparison entries must not become clones: the preflight must either approve a distinct scope (for example, a carefully framed to-50 extension where curriculum-safe) or explicitly defer the duplicate to Category G.

Likely runtime: the existing Grade 1 fluency/comparison adapter in `worksheetCatalogService`, seeded `equationMatch`, `missingAddend`, and `compareNumbers` generators, shared short numeric/comparison targets, and dense Question-1 example behavior. Equation Match must be corrected to emit actual paired equivalent/non-equivalent expressions rather than an ordinary solve-the-result equation.

Expected production paths, subject to architecture scan:

- `engine/problemGenerators/equationMatch.js`; existing missing-addend/comparison generators only if a shared option contract is missing;
- `services/worksheetCatalogService.js` for the three-ID Grade 1 adapter;
- `engine/layout/worksheetTypeMap.json` and `renderers/pdfRenderer.js` only if the existing matching/target geometry cannot satisfy the approved contract;
- `data/worksheetCatalog.master.json` and `data/worksheetCatalog.generated.json` for honest copy/defaults, not promotion;
- a family preflight, focused runtime test, and proof generator under `docs/` and `scripts/`.

Expected tests: exact IDs/status preservation; real equation-pair semantics; Grade 1 bounds; requested count; duplicate suppression; mixed relation/unknown positions where approved; Q1 counted inside total; answer-only emphasis; student/key parity; same-seed determinism; approved canonical sibling regressions; Grade 2+ regression; catalog audit.

Expected founder packet: **6 PDFs** — default and completed-Question-1 variants for each resource, each PDF containing student and answer-key pages. If either duplicate candidate fails the distinct-use preflight, omit it from implementation and replace the packet with a decision record rather than manufacturing a filler worksheet.

Founder decisions: exact Equation Match interaction; whether Missing Addends has a distinct role from `g1_missing_addends_within_20`; whether Compare Numbers is a to-50 extension or a duplicate; count/density; response target; title/instruction; Q1 behavior; supported variables; and whether any accepted resource remains generated/internal.

Commit boundary: one preflight-approved relational-task adapter, required generator/layout changes, one focused test, one proof generator, and reconciliation only after founder approval. No status promotion or public UI.

## Isolated resources and prerequisites

| Resource | Why separate | Prerequisite | Timing |
| --- | --- | --- | --- |
| `grade1_addition_subtraction_facts_word_problems` | Generic title/operation overlaps three approved Grade 1 story families. | Founder selects a genuinely distinct mixed-operation purpose or explicitly defers it. | Early decision; implement only if distinct, otherwise G. |
| `grade1_place_value_representation_number_line_identify` | Direct duplicate candidate of the approved full-width number-line worksheet. | Distinct-use decision; no code pass until one exists. | Early defer decision, not a normal implementation batch. |
| `g1_compare_numbers_to_20_exit_ticket` | Already implemented, ready, public, and uses a separate renderer; only founder-coverage policy is unresolved. | Decide whether Exit Tickets participate in this founder reconciliation and obtain format-specific approval if required. | Early administrative decision; no implementation. |
| `grade1_fraction_equivalence_fraction_number_line` | Unique geometry and weak fit with Grade 1 fair-sharing expectations. | Curriculum decision plus a dedicated fraction-number-line preflight/renderer. | Late or defer. |
| `grade1_fraction_equivalence_fraction_word_problems` | No explicit generator ownership and materially different workspace/response needs. | Narrow fair-share story contract and structured generator. | Late. |
| `grade1_multiplication_facts_missing_factor` | Abstract missing-factor fluency conflicts with the approved drawing-led Grade 1 equal-group framing. | Founder/curriculum decision on a visual missing-group or missing-items model. | Late or defer. |
| `grade1_multiplication_facts_word_problems` | Needs equal-group stories, totals ≤10, drawings/work area, and a distinct title. | Separate B2.5 story-problem preflight using the approved Equal Groups foundation. | Late. |

## Full completion order

1. **Batch 1 — recommended next (3):** relational equations and comparison. Six founder PDFs. Lowest renderer/curriculum risk; main risk is approving distinct roles rather than duplicates.
2. **Batch 2 (3):** Read a Graph, Interpret Data, Graph Questions. Six founder PDFs. Establish one Grade 1 one-to-one pictograph/concrete-graph visual and question schema; major risk is a new renderer and low direct founder guidance.
3. **Batch 3 (3):** Complete a Graph, Match Data to Graph, Graph Word Problems. Six founder PDFs. Reuse Batch 2 display data/renderer; major risk is three different response interactions and unresolved graph-word-problem ownership.
4. **Batch 4 (3):** Shade Fraction Models, Compare Fractions, Match Equivalent Fractions. Six founder PDFs. Restrict to fair-sharing drawings, unit fractions, and the narrow half/two-fourths relationship; major risk is new interactive visual geometry and over-broad symbolic framing.
5. **Isolated correction/design tasks (3):** generic addition/subtraction Word Problems, duplicate Number Line, and the already-ready comparison Exit Ticket. Resolve product/classification decisions before code. Zero PDFs for explicit defers; at most 2–4 targeted PDFs if a distinct task or format review is authorized.
6. **Late/high-risk items (4):** Fraction Number Line, Fraction Word Problems, Missing Factors, Multiplication Word Problems. Each needs its own preflight or a tightly paired future task; expect 2 PDFs per accepted isolated resource. Major risks are curriculum fit, unsupported generators, unique visuals, and abstract Grade 1 framing.

## Dependencies and what not to build yet

- Batch 2 must define structured Grade 1 display data before Batch 3.
- Batch 4 must define a reusable partitioned-shape model before any fraction number-line decision.
- Do not reuse generic bar-graph framing for Grade 1 without reconciling D1.3’s concrete graph/pictograph requirement.
- Do not build general symbolic equivalent-fraction drills, abstract missing-factor fluency, or unsupported fraction number lines as Grade 1 defaults.
- Do not implement duplicate catalog entries until their distinct teacher use is approved.
- Do not add public controls, change statuses, promote resources, or broaden Grade 2+ behavior inside these family passes.

## Gate for leaving Category F

A resource moves from F to A only after: a Grade 1 family preflight; explicit founder approval of title/task/layout/variables; controlled deterministic runtime; focused and sibling regressions; visually approved student/answer-key proofs; a clean scoped commit; and reconciliation evidence. A duplicate or curriculum-misaligned resource should move from F to G through an explicit defer/legacy decision instead of being implemented to inflate counts. Promotion remains separate.
