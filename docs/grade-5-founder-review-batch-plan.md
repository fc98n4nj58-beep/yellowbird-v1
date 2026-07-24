# Grade 5 Founder Review Batch Plan

Status: active founder-review plan. Batches 1, 2, and 3 are founder-approved and closed; later batches remain planning only.

Current reconciliation: **A14 / D10 / E1 / G21 / Total46**. The three Batch 1 records, two Batch 2 records, and one Batch 3 record moved from D to A; all 10 remaining D records are assigned exactly once. No G or E item is hidden inside a low-risk batch.

## Batch 1 — Numeric Patterning

Exact IDs:

- `grade5_patterning_and_algebra_extend_pattern`
- `grade5_patterning_and_algebra_identify_pattern_rule`
- `grade5_patterning_and_algebra_missing_value_pattern`

Shared family: deterministic numeric sequences with aligned response targets.

Inheritance: approved Grade 3 and Grade 4 numeric-pattern families, checked against Grade 1–2 sequence history. Preserve the strongest two-column sequence and full-width rule-response layouts.

Common correction: replace generic Grade 5 fallback behavior with honest public copy, Grade 5 rule/value difficulty, structured sequence truth, and the established density/target geometry.

Likely reviewed files: shared pattern generators/normalization, layout normalization, PDF renderer only if existing structured rows cannot express the approved geometry, focused tests, proof generator, and the two Grade 5 planning/reconciliation documents.

Variables to preserve: question count/page, seed, start/rule/step, sequence length, missing position, task mode, example aliases, key inclusion. Reject unsupported and conflicting values.

Focused test/proof strategy: 30 deterministic seeds; rule distribution; unique prompts; missing-position truth; widest and largest sequences; default/max counts; student/key parity; one combined founder packet with three default proofs plus stress pages.

Risk: **LOW**. Recommended first.

### Batch 1 closeout — founder approved

Exact resolved records:

| ID | Public title | Status/category | Completed-work classification |
|---|---|---|---|
| `grade5_patterning_and_algebra_extend_pattern` | Extend the Pattern | `generated` / A | **FOUNDER APPROVED** |
| `grade5_patterning_and_algebra_identify_pattern_rule` | Identify the Pattern Rule | `generated` / A | **FOUNDER APPROVED** |
| `grade5_patterning_and_algebra_missing_value_pattern` | Find the Missing Values | `generated` / A | **FOUNDER APPROVED** |

The live records resolve through the shared `patterning_and_algebra` recipe, numeric-pattern generator, task-specific normalization, shared PDF renderer and answer-key path. Grade 5 previously inherited generic titles/copy, lower-grade ranges, incomplete structured truth, permissive aliases and silent-fallback paths. None was a duplicate, stale-reconciliation-only record or new-architecture task. The founder approved the exact-ID-scoped corrections and student workspace; lower-grade defaults, public customization, and catalog lifecycle statuses remain unchanged.

#### Full family and layout inheritance

| Contract | Grade 1 | Grade 2 | Grade 3 | Grade 4 | Grade 5 review candidate |
|---|---|---|---|---|---|
| Family role | controlled extend/rule/missing trio | same three distinct tasks | same trio with add/subtract and completed-example aliases | same trio with Grade 4 value/rule extension | preserve all three roles; do not merge task modes |
| Default density | controlled shared pattern layout | 12 items, 2 columns × 6 rows, 2-page PDF | 12-item family defaults with task-specific pagination | Extend 12, Rule 10, Missing 12; full-width rows; 2-page PDFs | Extend 12, Rule 10, Missing 12; full-width rows; 2-page PDFs |
| Sequence/targets | simple whole-number sequences | four shown; one continuation/internal target; structured additive-rule target | task-owned continuation, rule and missing targets | Extend 5+2; Rule 6+rule line; Missing 7 with 2 internal targets | inherit Grade 4 target counts and geometry |
| Range/rules | controlled early-number scope | starts 0–20, steps 1–5, addition default | established add/subtract engine | starts 50–400, steps 5–25, mixed balanced add/subtract, results 0–1000 | starts 100–700, steps 10–50, mixed balanced add/subtract, results 0–1000 |
| Structured truth | shared deterministic arithmetic | answer metadata and task targets | sequence, operation, step, task answer state | complete task truth, duplicate signature and exact key reconstruction | retain generator-owned truth and expose every Grade 5 task field end to end |
| Examples | controlled/raw | no public example contract | aliases supported; example additional | aliases supported; example additional | aliases supported; example additional; off by default |
| Safe boundary | early-grade controlled scope | 12 default items | family-specific pagination | Extend 12/one student page; Rule 18/two; Missing 20/two | same established boundaries |

The strongest exact-family contract is Grade 4's strict arithmetic/variable contract. The strongest layout-class contract is also its full-width fixed-row geometry: two columns are stronger for short Grade 2 terms, but are not print-safe for five to seven three-digit Grade 5 terms, continuation targets or a readable rule-response line. Grade 5 therefore keeps full-width rows rather than reviving the older two-column shell. This is a documented width requirement, not new architecture. Grade 4's full-width correction is not drift, and no new Grade 1–4 consistency-review watchlist item was found.

#### Distinct task decisions and defaults

| ID | Instruction | Default truth/layout | Tested boundary |
|---|---|---|---|
| `grade5_patterning_and_algebra_extend_pattern` | Continue each pattern by writing the next numbers. | 12 questions; 12 per page; 5 visible terms; 2 continuation targets; no internal missing terms or rule response | 4–6 visible terms, 1–3 continuations, at most 7 total terms, 12 questions on one student page |
| `grade5_patterning_and_algebra_identify_pattern_rule` | Write the rule for each pattern. | 10 questions; 10 per page; 6 fully visible terms; one rule-response line; no continuation or hidden terms | 5–7 terms, 18 questions over at most 2 student pages |
| `grade5_patterning_and_algebra_missing_value_pattern` | Write the missing numbers in each pattern. | 12 questions; 12 per page; 7 terms; 2 varied internal missing positions; no rule-writing or continuation task | 5–7 terms, 1–2 missing values, 20 questions over at most 2 student pages |

All use `Grade 5 • Math • Patterning & Algebra`, balanced addition/subtraction by default, integer starts 100–700, integer rule amounts 10–50, and safe whole-number results 0–1000. Grade 5 difficulty comes from larger starts, larger and more varied rule amounts and internal-position reasoning, not smaller type or ambiguous rules.

Supported and safe rule families are constant whole-number addition and subtraction. They are the only defaults and the only raw-runtime selections accepted for this batch. Multiplication, division, alternating, two-step, decimal, fraction and negative-number rules are unsupported/deferred; none was introduced merely to signal Grade 5 difficulty.

#### Structured truth and variable contract

Every Grade 5 item stores `startingValue`, `operation`, `ruleAmount`, `fullSequence`, `duplicateSignature` and `answerState`. Extend additionally stores `visiblePrefix`, `continuationValues`, `continuationCount`, `responseTargets` and `answerList`. Identify additionally stores `fullVisibleSequence`, `studentFacingRule`, `acceptedNormalizedRule` and `answerList`. Missing additionally stores `displayedSequence`, `missingIndexes`, `missingValues`, `responseTargets` and `answerList`. These fields survive layout, content and answer-key normalization; the renderer displays them but does not calculate sequence truth. Worksheet-level validation rejects duplicate signatures and verifies exact task arithmetic and student/key state.

| Variable class | Grade 5 contract |
|---|---|
| Count/density | `questionCount`; `questionsPerPage`; strict task maxima and two-student-page ceiling; Extend remains one student page |
| Start | `startingValue`/`startNumber`; `minStart`/`minimumStart`/`minimumValue`; `maxStart`/`maximumStart`/`maximumValue`; fixed values are genuinely fixed; selected-start lists are **NOT SUPPORTED** |
| Rule amount | `sequenceStep`/`step`; `minStep`/`minimumStep`/`minimumRuleAmount`; `maxStep`/`maximumStep`/`maximumRuleAmount`; `selectedSteps`/`onlySteps`/`selectedRuleAmounts`/`ruleAmounts` |
| Operation | `operationMode`/`operation`/`ruleType`; `selectedOperations`/`onlyOperations`; add, subtract or mixed only |
| Sequence bounds | `minValue`/`minimumSequenceValue`; `maxValue`/`maximumSequenceValue` |
| Extend role | `visibleLength`/`shownTermCount`; `continuationCount`/`extensionCount`/`answerCount` |
| Rule role | `sequenceLength`/`termCount` |
| Missing role | `sequenceLength`/`termCount`; `missingTermCount`/`missingCount`; `missingTermPlacement`/`missingPlacement`; `missingIndexes`/`missingPositions` |
| Shared runtime | `includeExample`/`completedExample`/`example`; `worksheetSeed`; PDF answer-key inclusion |

These remain raw-runtime or internal aliases; none is publicly registered. Valid fixed values, ranges, selected rule amounts and selected operations are consumed rather than merely validated. Unsupported caller-owned sequence, rule, displayed-state, answer, response-target, duplicate-signature and answer-state fields are **UNSAFE — REJECT**.

#### Adversarial QA, tests and proofs

The focused suite rejects decimal/negative starts, zero/invalid rule amounts, empty or duplicate selections, unsupported operations, conflicting aliases, reversed/fixed-range conflicts, unsafe counts/density/width, invalid example modes, irrelevant missing controls, duplicate/out-of-range missing indexes, insufficient visible evidence and caller-owned truth. A fully fixed contract that cannot supply unique questions throws instead of repeating or silently widening its pool.

`scripts/testGrade5NumericPatterningBatch1.js` passes 30 deterministic seeds per resource with same-seed failures 0 and different-seed variation. Exact copy, defaults, balanced operations, sequence arithmetic, missing-index truth and variation, normalized rule truth, structured answer state, duplicate prevention, examples-additional behavior, variable consumption, page geometry, student/key parity and Grade 1–4 isolation pass. Shared Grade 2 runtime, Grade 3 Batch 1, Grade 4 Batch 1, Grade 4 final reconciliation, Grade 5 reconciliation preflight and customization-registry regressions pass. The audit remains Ready 104/104, Generated 213/213, Partial 5/5, Total331 with only the seven established planned `pattern_word_problems` gaps.

Founder proofs:

- `review/grade-5-numeric-patterning-batch-1/founder-review/01_extend_the_pattern.pdf`
- `review/grade-5-numeric-patterning-batch-1/founder-review/02_identify_the_pattern_rule.pdf`
- `review/grade-5-numeric-patterning-batch-1/founder-review/03_find_the_missing_values.pdf`

Stress proofs in the sibling `stress/` folder cover largest default starts and rule amounts, addition-only, subtraction-only, zero targets, maximum continuation and visible widths, maximum counts, varied missing positions, longest rule responses and a completed example. All 22 founder/stress pages were rendered and visually inspected: student/key truth is aligned, target lines are clear, defaults use the page efficiently, maximum counts paginate safely, and no clipping, overlap, tiny type or footer pressure was found.

#### Narrow workspace correction

Founder review identified that the right side of the three student worksheets was visually underused. An opt-in, student-only side workspace now uses the heading `Work It Out` once per student page and a subtle 0.8-point light-neutral vertical divider that begins below the instruction and ends above the footer. Default pages assign 35% of the usable width to the open, unboxed and unshaded workspace. The maximum three-continuation variant uses a measured safety override of approximately 30.5% so all three unchanged 62-point targets remain fully inside the left task region; no type, target, term, count or content is reduced.

The workspace is enabled only for the three exact Grade 5 Batch 1 IDs. Answer-key pages remain full-width and do not show the divider or heading. The full 260-point rule-response line, question positions, row heights, examples-additional behavior, counts, density, pagination, variables, structured arithmetic truth, deterministic seeds and lifecycle statuses are unchanged. Regenerated founder and stress proofs confirm that each student page has one workspace heading, keys remain teacher-speed full width, and no sequence wraps or crosses the divider.

Batch 1 is founder-approved and closed. The three records move D → A, producing **A11 / D13 / E1 / G21 / Total46**. There are no split or deferred Batch 1 resources. All three catalog statuses remain `generated`, and no public customization family was registered.

## Batch 2 — Compact Relational Practice

Status: founder-approved and closed. Both resources moved D → A. Reconciliation is **A13 / D11 / E1 / G21 / Total46**.

### Exact records and completed-work classification

| Exact ID | Current role before correction | Status/category | Classification | Resolution |
|---|---|---|---|---|
| `grade5_addition_subtraction_facts_equation_match` | generic single-equation completion under “Equation Match” | `generated` / A | **FOUNDER APPROVED** | honest equation-value comparison in the measured 2×15 layout |
| `grade5_place_value_representation_compare_numbers` | 12 generic comparisons using Grade 3 magnitude inside an oversized 4×15 shell | `generated` / A | **FOUNDER APPROVED** | structured whole-number comparison to 100,000 in the 3×10 layout |

Both IDs already routed through shared generators, normalization, the shared dense-grid renderer and the common key path, but neither current output fulfilled its Grade 5 role. The equation record fell through to ordinary solve-the-equation prompts and had no relational structured truth. The number record had comparison copy but inherited a generic 0–999 generator, only 12 questions, incomplete truth, and a 60-cell layout shell. Previous Grade 1–4 shared-family commits provided the safe engines and renderer primitives but did not correct either exact Grade 5 ID.

### Full Grade 1–4 inheritance cross-reference

| Contract | Grade 1 | Grade 2 | Grade 3 | Grade 4 | Strongest safe Grade 5 contract |
|---|---|---|---|---|---|
| Equation public role | Equal or Not Equal? | Equal or Not Equal? | Equal or Not Equal? | Compare Equations | Compare Equations |
| Equation action | solve both sides; write `=`/`≠` | same | same | compare two supplied expressions | compare two supplied expressions |
| Equation density | 12, 2×6 | 12, 2×6 | 12, 2×6 | 30, 3×10 | 30, 2×15; width-driven |
| Equation range | results to 20 | results to 50 | results to 100 | default 100–1,000; tested to 2,000 | default 1,000–10,000 |
| Equation balance | equal/not-equal | exact 6/6 across templates | caller-controlled exact count | exact equality count; balanced operation templates | exact equality count; mixed/add/subtract modes |
| Equation truth | prompt/answer | relation templates | left/right values | expressions, operations, operands, values, equality, answer state, reversal-safe signature | inherit complete Grade 4 truth |
| Number public role | Compare Numbers to 20 | Compare 3-Digit Numbers | generic Grade 3 comparison | Compare Numbers | Compare Numbers |
| Number action | write `>`, `<`, or `=` | same | same | same | same |
| Number density | 60, 4×15 | 12, 2×6 | 12 inside generic 4×15 capacity | 30, 3×10 | 30, 3×10 |
| Number range | 0–20 | 100–999 | generic 0–999 | default 1,000–10,000 | default 10,000–100,000 |
| Number balance | family-balanced | structured family | incidental | exact 10/10/10 or 15/15 without equality | exact count, then balanced `<`/`>` |
| Number truth | structured comparison fact | left/right/symbol | incomplete generic truth | left/right/symbol, equality state, answer state, reversal-safe signature | complete structured truth with Grade 5 signature |
| Examples | family-specific | family-specific | no distinct contract | additional, off by default | additional, off by default |
| Key geometry | mirrors student grid | mirrors student grid | generic grid | mirrored fixed zones | mirrored fixed zones |
| Variables | bounded range and selected values | family bounded | permissive generic aliases | strict count/page/range/selection/equality/example contract | preserve strict aliases; reject silent fallback |

Nearest approved layout classes were also checked: Grade 5 Missing Factors and Multiplication Fact Review safely use 4×15 because each cell contains one short equation; Grade 4 Compare Numbers and Compare Equations use 3×10 because two operands or expressions share a cell. Six-digit numerals still fit the Grade 4 3×10 comparison geometry after a measured four-point operand-zone increase. Five-digit equation expressions do not fit three columns at the 12-point family minimum, so Grade 5 Compare Equations uses two columns and safely raises vertical density to 15 rows rather than shrinking type.

The Grade 3 place-value comparison record remains a sparse 12-question output inside generic 4×15 capacity and lacks the stronger later structured contract. Record this as a later lower-grade family-consistency watchlist item; Batch 2 does not reopen Grade 3.

### Task-role and duplicate gate

`Compare Equations` shows two addition/subtraction expressions and asks for `=` or `≠`; it measures equivalence after evaluating both sides. `Compare Numbers` shows two whole-number numerals and asks for `>`, `<`, or `=`; it measures place-value magnitude. Neither duplicates Grade 5 Missing Factors or Multiplication Fact Review, which require numeric fact answers. The 30-question number-comparison practice also remains distinct from the existing three-question exit ticket and six-question quick check. No split or deferral is recommended.

### Approved review-candidate defaults and density

| ID | Title/instruction/footer | Default | Maximum | Geometry and measured boundary |
|---|---|---|---|---|
| `grade5_addition_subtraction_facts_equation_match` | Compare Equations; “Write = or ≠ to compare each pair of equations.”; `Grade 5 • Math • Addition & Subtraction` | 30 questions; fifteen `=` and fifteen `≠`; mixed addition/subtraction; results 1,000–10,000 | 60 questions; 30 per student page | 2×15; 12-point expressions; 92-point expression zones; 18-point target; 19-point number gutter |
| `grade5_place_value_representation_compare_numbers` | Compare Numbers; “Write >, <, or = to compare each pair of numbers.”; `Grade 5 • Math • Place Value` | 30 questions; ten each `<`, `>`, `=`; values 10,000–100,000 | 60 questions; 30 per student page | 3×10; 10.5-point numerals; 46-point operand zones; 24-point target; 20-point number gutter; comma-formatted `100,000` fits |

Default PDFs are two pages including the key. Maximum PDFs are four pages. Equation completed examples remain additional inside the two-page default; number-comparison examples remain additional and use the established example-strip pagination. Multipage student and key pages repeat identical grid geometry.

### Compare Equations density correction

The founder rejected the initially submitted 20-question 2×10 default as unnecessarily sparse. The renderer was measured at its actual text placements and page bounds, then tested with five 2×15 prototypes. The founder-approved final decision is **30 questions in a 2×15 grid**, with 15 `=` and 15 `≠`; the maximum is **60 questions**, with 30 per student page.

| Measurement | Result |
|---|---:|
| Student content top / bottom | 166 / 714 points |
| Key content top / bottom | 166 / 714 points |
| Available student / key height | 548 / 548 points |
| Row height at 10 rows | 54.80 points |
| Row height at 15 rows | 36.53 points |
| Completed-example 15-row height | 32.27 points |
| Asserted minimum safe row height | 30.00 points |
| Completed-example displacement | 64.00 points |
| Expression text origin | row top + 3 points |
| Response-line baseline | row top + 20 points |
| Final response-line clearance to content floor | 16.53 points default; 12.27 points with example |
| Final response-line clearance to footer rule | 40.53 points default; 36.27 points with example |
| Expression font / number font | 12 / 11 points |
| Expression zones / relation target | 92 / 18 points |
| Inter-expression gaps | 1 point on each side of the target |
| Number gutter | 19 points |
| Widest measured near-10,000 expression | 64.45 points, leaving 27.55 points in its zone |

All measurements preserve the submitted horizontal geometry. Rendered prototypes retain readable numbering, centred relation targets, distinct rows, unclipped commas and operators, and teacher-speed answer keys. No expression wraps, font size falls, target narrowing, arithmetic change, or structured-truth change occurred. The completed example remains additional without adding a sparse page.

Density-review proofs:

- `review/grade-5-compact-relational-batch-2/density-review/01_compare_equations_default_30.pdf`
- `review/grade-5-compact-relational-batch-2/density-review/02_compare_equations_longest_expressions_30.pdf`
- `review/grade-5-compact-relational-batch-2/density-review/03_compare_equations_completed_example_30.pdf`
- `review/grade-5-compact-relational-batch-2/density-review/04_compare_equations_subtraction_only_30.pdf`
- `review/grade-5-compact-relational-batch-2/density-review/05_compare_equations_maximum_candidate.pdf`

The approved Compare Numbers implementation and proof files were not changed during this correction.

### Variable and structured-truth contract

| Resource | Supported raw inputs and aliases | Classification |
|---|---|---|
| both | `questionCount`; `questionsPerPage`; `includeExample` / `completedExample` / `example`; `worksheetSeed`; answer-key inclusion | **PRESERVED / RAW RUNTIME ONLY** |
| equations | `minimumResult` / `minResult` / `minimumValue`; `maximumResult` / `maxResult` / `maxTotal` / `maximumTotal` / `maximumValue`; `operationMode` / `mode`; `selectedOperations` / `operations`; `includeEqualPairs`; `equalPairs` / `equalityCount` | **PRESERVED AND CONSUMED** |
| numbers | `minValue` / `minA` / `minimumValue` / `minimumNumber`; `maxValue` / `maxA` / `maximumValue` / `maximumNumber`; `selectedNumbers` / `selectedValues` / `onlyNumbers`; `includeEqualPairs`; `equalPairs` / `equalityCount` | **PRESERVED AND CONSUMED** |
| both | caller-owned prompt, expressions/operands, left/right values, relation/equality state, answer, answer state, response target, duplicate signature | **UNSAFE — REJECT** |
| equations | multiplication/division operations, operand selectors, relation selectors, negative/decimal ranges | **NOT SUPPORTED** |
| numbers | operation controls, relation selectors, negative/decimal/out-of-range values | **NOT SUPPORTED** |

Equation items store both expressions, operations, operands, evaluated values, expected relation, equality state, response target, answer state, and canonical reversal-safe signature. Number items store both values, expected symbol, equality state, response target, answer state, and a canonical unordered-pair signature. The renderer only displays these supplied values and answers.

Adversarial QA rejects empty/duplicate selections, conflicting aliases, reversed ranges, decimals, negatives, excessive counts/density, impossible equality counts, insufficient candidate pools, unsupported operations/relations, invalid example aliases, and caller-owned truth. No invalid explicit input silently falls back.

### Focused verification and founder packet

`scripts/testGrade5CompactRelationalPracticeBatch2.js` covers 30 deterministic seeds per resource, same-seed failures 0, different-seed variation, exact equality/relation counts, operation modes, selected-number and range consumption, examples-additional behavior, maximum pagination, actual rendered 15-row positions, the completed-example displacement and footer clearance, fixed-zone width measurements, complete truth, student/key parity, duplicate/reversal rejection, invalid inputs, Grade 1–4 isolation, Batch 1 isolation, lifecycle status, and no public customization.

Founder proofs:

- `review/grade-5-compact-relational-batch-2/founder-review/01_compare_equations.pdf`
- `review/grade-5-compact-relational-batch-2/founder-review/02_compare_numbers.pdf`

Nine stress proofs cover the largest and smallest values, longest expressions, comma-formatted six-digit numerals, addition-only, subtraction-only, no-equality mode, completed examples, equality balance, and both maximum counts. The affected Compare Equations founder and stress proofs were regenerated for 2×15; all approved Compare Numbers proof hashes remained unchanged. Founder approval covers both resources, so each moves D → A, yielding **A13 / D11 / E1 / G21 / Total46**.

Split, blocked, or deferred Batch 2 resources: **none**. Catalog lifecycle statuses remain `generated`; no public customization family was registered. Grade 1–4 relational history and the nearest dense-grid task classes were reviewed. Grade 5 preserves the Grade 4 structured-truth guarantees, while Grade 3 sparse comparison drift remains on the later K–6 consistency watchlist. No lower-grade resource was reopened.

Risk: **CLOSED — FOUNDER APPROVED**.

## Batch 3 — Place-Value Representations

Exact IDs:

- `grade5_place_value_representation_expanded_form`
- `grade5_place_value_representation_number_line_identify`
- `grade5_place_value_representation_number_word_match`
- `grade5_place_value_representation_standard_form`

Shared family: whole-number representation to Grade 5 magnitude.

Inheritance: approved Grade 1–4 representation history, Grade 3 structured number-line truth, Grade 4 3×15 short-form grids and 2×6 number-word layout. Do not inherit the Grade 4 base-ten magnitude gap.

Common correction: verify/extend Grade 5 ranges, public copy, formatting, interval truth, aliases, and print-safe longest forms while retaining proven geometry.

Likely reviewed files: place-value generators/normalization, representation and number-line layout, renderer only for existing structured rows, services, focused tests, proof generator, documentation.

Variables to preserve: count/page, seed, min/max, selected numbers, representation direction/mode, interval/endpoints, number-word mode, examples, key.

Focused test/proof strategy: 30 seeds; round-trip standard/expanded/word truth; comma and zero-place formatting; selected-number consumption; interval/target truth; maximum-length strings; default/max page geometry; student/key parity. One combined packet with four default proofs plus stress pages.

Risk: **MODERATE**. Recommended third.

## Batch 4 — Structured Fractions

Exact IDs:

- `grade5_fraction_equivalence_fraction_number_line`
- `grade5_fraction_equivalence_match_equivalent_fractions`
- `grade5_fraction_equivalence_shade_fraction_models`

Shared family: exact structured fraction truth rendered as number lines, completion equations, or models.

Inheritance: Grade 1 concrete equal parts, Grade 2 structured parts, Grade 3 exact full-width number lines, Grade 4 fraction comparison/model geometry. Do not inherit the misleading Grade 4 matching label.

Common correction: structured truth and honest action naming, plus a founder decision on number-line range and whether ID 28 remains equation completion.

Likely reviewed files: fraction generators/normalization, structured model/number-line layouts, renderer, services, focused tests, proof generator, documentation.

Variables to preserve: count/page, seed, selected denominators/fractions, numerator/denominator ranges, equivalence mode, endpoint policy, model type, examples, key.

Focused test/proof strategy: exact integer equivalence; selected-value consumption; mixed valid/invalid rejection; endpoint rules; partition-denominator answers; widest model/number line; default/max pages; student/key parity; 30 seeds. One combined packet after the founder resolves the two open role questions.

Risk: **MODERATE**. Recommended fourth.

## Batch 5 — Addition and Subtraction Stories

Exact IDs:

- `grade5_addition_subtraction_word_problems_addition_word_problem`
- `grade5_addition_subtraction_word_problems_missing_addend_word_problem`
- `grade5_addition_subtraction_word_problems_subtraction_word_problem`

Shared family: one-step deterministic arithmetic contexts with full-width work boxes.

Inheritance: Grade 2 context diversity and deterministic controls, Grade 3 arithmetic/context truth, and founder-approved Grade 4 work-box geometry and pagination.

Common correction: Grade 5 ranges and unknown positions, honest titles/instructions, natural context variety, repetition limits, and a founder-approved default count. Do not turn the work into unsupported multi-step problems.

Likely reviewed files: shared story generator/context layer, normalization/layout, services, focused tests, proof generator, documentation.

Variables to preserve: count/page, seed, result and operand ranges, selected operation/numbers, unknown position, context selection, example aliases, key.

Focused test/proof strategy: 30 seeds; arithmetic truth; name/object/template repetition limits; pronoun agreement; selected-input consumption; default/max pagination; widest prompt; student/key parity. One combined packet.

Risk: **MODERATE**. Recommended fifth.

## Batch 6 — Text-Data Interpretation Reliability (executed as Batch 3)

Exact ID:

- `g5_interpret_graphs`

Shared family: curated, honest text-data interpretation. A single-resource batch is necessary because no other implementation candidate shares this generator defect; the generated `grade5_data_display_graphing_interpret_data` is a duplicate and remains G.

Inheritance: preserve the already reviewed public role, 12-question/full-width density, data truth, question mix, four-page PDF, and answer key. This is a reliability correction, not a graph-architecture project.

Common correction: route template/question selection through the supplied seeded random source. Do not change visible output contracts or revive generic graph IDs.

Likely reviewed files: the existing text-data interpretation generator/random selection seam, one focused regression, proof generator only to confirm page-for-page geometry, and documentation.

Variables to preserve: seed, count/page, key inclusion. No public customization registration.

Focused test/proof strategy: 30 same-seed pairs with zero failures; different-seed variation; question/answer truth; mix bounds; duplicate control; student/key parity; exact four-page PDF; Grade 1–4 structured-data isolation. One default founder proof plus a same-seed signature report.

Risk: **LOW**, but separate because its regression surface is data interpretation. Recommended after Batch 2 and before the larger representation batch.

### Batch 3 closeout — founder approved

Exact resource: `g5_interpret_graphs`. Completed-work classification: **NARROW CONTENT-CONTRACT CORRECTION NEEDED**. The founder accepted the seeded-random reliability correction, then rejected the repetitive three-template worksheet: it repeated one inline data sentence, falsely claimed a graph was shown, used teacher-facing instruction prose, leaked `data_display_graphing` in the footer, and did not provide sufficient Grade 5 interpretation value.

The accepted reliability fix remains exact-ID scoped. Every Grade 5 content decision consumes the runtime-provided seeded random function; the renderer and answer key consume supplied truth only. The corrected public contract is:

- title: **Interpret the Data**
- instruction: **Use the data to answer each question.**
- footer: **Grade 5 • Math • Data & Graphing**
- one quiet text-only **Student Sport Choices** summary per student and key page, listing Soccer 12, Basketball 9, and Baseball 6
- no graph claim, bars, icons, pictograph symbols, axes, shaded card, repeated inline data sentence, or public customization

The validated bank contains **17 semantically distinct tasks**: three category-identification tasks, four differences, four combined/total tasks, two orderings, and four true/false propositions. The three reversed “how many fewer” wordings were not added because each duplicates an existing pairwise difference. The default seeded selection is 12 distinct prompts with the approved 2 category / 3 difference / 3 combined-total / 2 ordering / 2 true-false distribution. It includes one true and one false proposition. The explicit maximum is 17; requests above the available mode capacity throw rather than recycle questions.

The founder accepted this distinct text-data contract and requested one final copy-only correction. Pair totals now use “Soccer **and** Basketball,” “Soccer **and** Baseball,” and “Basketball **and** Baseball” rather than the ambiguous word “or.” The overall-total prompt now asks, “How many student choices are recorded altogether?” rather than “recorded in all.” Arithmetic, answers, question IDs, category order, answer state, duplicate signatures, selection logic, counts, pagination, 17-question maximum, lifecycle status, and reconciliation are unchanged.

Response lines are matched to the supplied response target: compact numeric and true/false lines, a category-name line, and a wider ordering line. The completed example remains additional, always uses “Which sport was chosen by the most students?” → “Soccer,” reserves that duplicate signature, and is rendered as a first-page example strip so 12 practice questions still occupy two student pages rather than creating a sparse third page.

Each item stores dataset ID/title, category IDs/labels/values, question type, prompt, response type/target, expected answer, accepted variants, answer state, deterministic duplicate signature, and example state. Difference truth stores minuend/subtrahend categories and values; combined truth stores selected categories, components, and total; ordering truth stores ordered IDs and labels; true/false truth stores the proposition, boolean truth, expected boolean, and display answer. Caller-owned data or answer truth and unsupported modes fail explicitly.

Lower-grade cross-reference:

- `grade1_data_display_graphing_interpret_data` — approved structured pictograph interpretation, six questions, two-column student/key layout.
- `grade2_data_display_graphing_interpret_data` — approved structured pictograph interpretation, six questions, two-column student/key layout.
- `g3_interpret_data` — approved structured pictograph Yes/No interpretation, four questions, two-column student/key layout.
- `grade3_data_display_graphing_interpret_data` and `grade4_data_display_graphing_interpret_data` — generic text fallbacks with separate seeded-reliability drift; they remain untouched for later K–6 consistency review.

The correction preserves byte-identical normalized content for the three approved Grade 1–3 resources at the recorded guard seed. Grade 5 Batches 1 and 2 remain deterministic and unchanged.

Reliability results: 100 repeated builds at one fixed seed and 30 additional paired seeds produce zero same-seed failures. Thirty different seeds produce meaningful selection/order variation. Normalized PDF bytes, pagination, source truth, answers, answer state, duplicate signatures, example placement, preview/key parity, and repeated-render state remain stable. PDF metadata normalization is limited to the volatile document ID and creation timestamp.

Proof packet:

- `review/grade-5-text-data-interpretation-batch-3/founder-review/01_interpret_the_data.pdf`
- `review/grade-5-text-data-interpretation-batch-3/stress/01_same_seed_a.pdf`
- `review/grade-5-text-data-interpretation-batch-3/stress/02_same_seed_b.pdf`
- `review/grade-5-text-data-interpretation-batch-3/stress/03_different_seed.pdf`
- `review/grade-5-text-data-interpretation-batch-3/stress/04_maximum_unique_question_count.pdf`
- `review/grade-5-text-data-interpretation-batch-3/stress/05_completed_example.pdf`
- `review/grade-5-text-data-interpretation-batch-3/stress/06_all_difference_questions.pdf`
- `review/grade-5-text-data-interpretation-batch-3/stress/07_all_combined_total_questions.pdf`
- `review/grade-5-text-data-interpretation-batch-3/stress/08_ordering_and_true_false_questions.pdf`
- `review/grade-5-text-data-interpretation-batch-3/stress/09_answer_key_included.pdf`
- `review/grade-5-text-data-interpretation-batch-3/stress/10_answer_key_excluded.pdf`

The corrected stress packet exercises real supported question-selection contracts. Misleading largest/smallest/candidate-pool labels were removed; the resource still exposes no public data-set or numeric-range controls.

The final copy correction regenerated only the affected founder/default, same-seed, different-seed, maximum, completed-example, combined-total, and answer-key-inclusion proofs listed above. The difference-only and ordering/true-false proofs contain none of the corrected prompt types and were left unchanged.

Founder approval covers `g5_interpret_graphs`; there are no split, blocked, or deferred Batch 3 resources. The original same-seed defect was reproduced and traced to global `Math.random()` selection. The exact Grade 5 path now consumes seeded runtime randomness: 100 identical builds and 30 paired seeds pass, while renderer and key generation consume no randomness.

The original three-template contract was rejected. The approved closeout removes false graph wording and the internal footer slug, applies the student-facing title and instruction, presents the text-data panel once per student and key page, supplies 12 distinct default prompts and a 17-question unique maximum without recycling, keeps the completed example additional, uses `and` for pair totals, and uses `recorded altogether` for the overall total.

`g5_interpret_graphs` moved D → A. Reconciliation is **A14 / D10 / E1 / G21 / Total46**. Catalog status remains `ready`; no lifecycle movement or public customization occurred.

## Architecture gate — Function Table

`grade5_patterning_and_algebra_function_table` remains E. Its current sentence fallback is not an approved visible input/output table. It must not join Batch 1 merely because its catalog strand is Patterning & Algebra.

Founder decision:

- approve a structured table row model, renderer/layout, input/rule/output variables, unknown modes, answer-key truth, and proof contract; or
- defer it E → G.

If approved, treat it as a separate architecture project rather than a low-risk founder batch.

## Deferred set

The 21 proposed G resources are listed exactly in `grade-5-architecture-reconciliation-preflight.md`. They fall into five lanes:

- lower-grade remediation without an honest Grade 5 distinction;
- aliases/duplicates of approved curated resources;
- graph/fraction/pattern placeholders without structured truth;
- unsupported visual architecture;
- weak or misleading public roles.

No deferred item should be revived during a D batch. Reconsider only when its documented trigger and distinct teacher-use case exist.

## Priority and closeout

1. Batch 1 Numeric Patterning
2. Batch 2 Compact Relational Practice
3. Batch 3 Text-Data Interpretation Reliability — founder-approved and closed
4. Batch 3 Place-Value Representations
5. Batch 4 Structured Fractions, after founder role decisions
6. Batch 5 Addition/Subtraction Stories, after founder count/range decisions
7. Function Table architecture decision
8. final A-resource regression sweep, exact reconciliation closeout, and local commit

The accelerated execution model is one full session per batch: completed-work reconciliation, full lower-grade cross-reference, variable preservation, implementation, adversarial QA, tests, proofs, visual self-review, founder correction if needed, documentation, then one closeout commit.

## Reconciliation scenarios

- initial proposal: **A8 / D16 / E1 / G21 / Total46**
- after founder-approved Batch 1: **A11 / D13 / E1 / G21 / Total46**
- after founder-approved Batch 2: **A13 / D11 / E1 / G21 / Total46**
- after founder-approved Batch 3: **A14 / D10 / E1 / G21 / Total46**
- after Batches 1–6: **A24 / D0 / E1 / G21 / Total46**
- Function Table implemented: **A25 / D0 / E0 / G21 / Total46**
- Function Table deferred: **A24 / D0 / E0 / G22 / Total46**

Catalog lifecycle statuses remain independent and unchanged until separately approved.

## Batch 1 closeout

Founder approval covers all three Numeric Patterning roles, Grade 5 rule/value difficulty, inherited density, raw variable inventory, structured truth, and the student-only `Work It Out` workspace. The approved packet contains three founder proofs and six stress proofs. Batch 1 has no split or deferred resource; the next implementation action belongs to Batch 2 under separate authorization.
