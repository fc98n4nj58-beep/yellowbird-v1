# Grade 5 Founder Review Batch Plan

Status: active founder-review plan. Batches 1 through 5 are founder-approved and closed; Grade 5 remains open for later authorized work.

Current reconciliation: **A21 / D3 / E1 / G21 / Total46**. Batch 5 moved exactly the three Structured Fractions records D → A. Catalog lifecycle statuses remain independent and unchanged.

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

## Later planned batch — Addition and Subtraction Stories

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
4. Batch 4 Place-Value Representations
5. Batch 5 Structured Fractions — founder-approved and closed
6. Addition/Subtraction Stories, after separate authorization and founder count/range decisions
7. Function Table architecture decision
8. final A-resource regression sweep, exact reconciliation closeout, and local commit

The accelerated execution model is one full session per batch: completed-work reconciliation, full lower-grade cross-reference, variable preservation, implementation, adversarial QA, tests, proofs, visual self-review, founder correction if needed, documentation, then one closeout commit.

## Reconciliation scenarios

- initial proposal: **A8 / D16 / E1 / G21 / Total46**
- after founder-approved Batch 1: **A11 / D13 / E1 / G21 / Total46**
- after founder-approved Batch 2: **A13 / D11 / E1 / G21 / Total46**
- after founder-approved Batch 3: **A14 / D10 / E1 / G21 / Total46**
- after founder-approved Batch 4: **A18 / D6 / E1 / G21 / Total46**
- after founder-approved Batch 5 Structured Fractions: **A21 / D3 / E1 / G21 / Total46**
- after the remaining story-family D batch: **A24 / D0 / E1 / G21 / Total46**
- Function Table implemented: **A25 / D0 / E0 / G21 / Total46**
- Function Table deferred: **A24 / D0 / E0 / G22 / Total46**

Catalog lifecycle statuses remain independent and unchanged until separately approved.

## Batch 1 closeout

Founder approval covers all three Numeric Patterning roles, Grade 5 rule/value difficulty, inherited density, raw variable inventory, structured truth, and the student-only `Work It Out` workspace. The approved packet contains three founder proofs and six stress proofs. Batch 1 has no split or deferred resource; the next implementation action belongs to Batch 2 under separate authorization.

## Batch 4 closeout — Place-Value Representations

Founder approval covers all four resources. They move D → A with no split, blocked, or deferred resource; lifecycle statuses remain `generated`.

| Exact ID | Student conversion | Classification | Distinct teacher use |
|---|---|---|---|
| `grade5_place_value_representation_expanded_form` | numeral → expanded form | SHARED-FAMILY EXTENSION NEEDED | decomposes a whole number into nonzero place-value addends |
| `grade5_place_value_representation_standard_form` | expanded form → numeral | SHARED-FAMILY EXTENSION NEEDED | composes canonical place-value addends into one numeral |
| `grade5_place_value_representation_number_word_match` | numeral → number words; optional word → numeral | SHARED-FAMILY EXTENSION NEEDED | practises the linguistic representation in either explicit direction; public copy no longer implies matching |
| `grade5_place_value_representation_number_line_identify` | marked position → numeral | SHARED-FAMILY EXTENSION NEEDED | reads scale, interval, and position rather than converting written forms |

All four remain `generated`. None duplicates another Batch 4 role or the approved Grade 5 Compare Numbers task, and no new visual, renderer, route, or public customization architecture is required.

### Full Grade 1–4 inheritance review

| Contract | Grade 1 | Grade 2 | Grade 3 | Grade 4 | Strongest safe Grade 5 contract |
|---|---|---|---|---|---|
| public action copy | number words/numerals and foundational number-line reading | honest expanded/standard/word/line writing actions | honest representation writing and marked-number reading | task-matched number-line and number-word copy; curated large-number forms | `Expanded Form`, `Standard Form`, `Write Numbers in Words` / `Write the Numeral`, and `Identify Numbers on a Number Line` |
| default count | task-specific early-number counts | forms up to dense 60; line/words task-specific | forms 45; words 12; line 6 | curated forms 45; words 12; line 6 | forms 30; words 12; line 6 |
| maximum / per page | early-grade limits | four-column compact forms where response length permits | forms 45 per page; words 12; line 6 | forms 45 in 3×15; words 20 maximum at 12/page; line 12 maximum at 6/page | forms 60 maximum at 30/page; words 20 at 12/page; line 12 at 6/page |
| geometry | broad early-writing space | compact short-number grids | 3×15 forms; wide words; full-width lines | 3×15 forms, 2×6 words, full-width lines | 2×15 forms for six-digit width; 1×12 full-width word rows; six full-width lines |
| number range | foundational whole numbers | through 200 depending on task | three-digit representations | through 10,000 | default 10,000–100,000; validated runtime range 0–100,000 |
| response target | writing line or short numeral | form-specific line/short numeral | structured form, word, or line response | structured response targets with shared key geometry | written expanded form, short numeral, written number word, or marked-line numeral |
| examples | additional where supported | additional where supported | additional | additional | additional; never replaces a practice item |
| truth | developing exact-family structure | increasingly structured | value/form or interval truth | strongest exact number-line/word truth plus curated form behaviour | complete value, numeral, digits, places, terms/words/line interval and target, expected response, variants, answer state, and signature |
| variable contract | seed/count plus family controls | selected values/ranges and task controls | selected values, ranges, modes, intervals, examples | strict aliases, modes, endpoint policy, selected values, examples | preserves the strongest strict aliases and rejects unsupported or caller-owned truth |

Nearest approved layout classes are the Grade 4 full-width number-line family, wide written-response rows, and the Grade 3/4 dense representation grids. Six-digit expanded expressions are not safe in the inherited 3×15 form grid, so Grade 5 uses the existing two-column grid primitive at 15 rows. Founder review further established that Grade 5 number words require one full-width column rather than the Grade 4 2×6 geometry. These are measured layout extensions, not new renderer architecture.

Lower-grade drift retained for the later K–6 consistency review:

- generic Grade 4 form records were deferred while curated large-number form records were approved;
- older generic form generators retain less complete top-level truth than the new Grade 5 exact-ID adapters;
- Grade 3/4 number-word canonical answer state is less complete than the Grade 5 tokenized contract.

No lower-grade resource is reopened.

### Grade 5 representation and range contract

The default range is 10,000 through 100,000. Runtime range and selected-number inputs accept whole numbers from 0 through 100,000 so teacher-selected remediation remains possible without exceeding the Grade 5 contract. Negative, decimal, reversed, out-of-range, empty, duplicate, conflicting, or insufficient selections throw.

Expanded form uses one canonical descending sum:

`40,000 + 3,000 + 200 + 5`

Zero-value terms are omitted; commas are retained; multiplication notation and powers of ten are unsupported. `100,000` remains `100,000`. Each nonzero term stores its digit, numeric place, place name, place value, and formatted value.

Number words use Canadian English spelling with lowercase words, hyphenated compound tens, one space between tokens, and the approved omission of `and`. Internal and trailing zeros are represented by omission of empty places rather than spoken placeholders. The boundary `100,000` is supported. The canonical answer is the generated word form; reverse mode accepts the numeric value and comma-formatted numeral. Unsupported locale, matching mode, and `includeAnd`/`useAnd` variants throw.

Number lines use ten equal intervals. Safe intervals are 100, 250, 500, 1,000, 2,500, and 5,000. Every item stores start, end, interval, tick count, target index/value, displayed labels, endpoint policy, visual data, answer state, and signature. Endpoints can be allowed or excluded explicitly.

### Defaults, density, variables, and adversarial QA

| Resource | Default / maximum | Page geometry | Default / maximum PDF |
|---|---:|---|---:|
| Expanded Form | 30 / 60 | 2 columns × 15 rows; 30/page | 2 / 4 pages including key |
| Standard Form | 30 / 60 | 2 columns × 15 rows; 30/page | 2 / 4 pages including key |
| Number Words | 12 / 20 | 1 full-width column × 12 rows; 12/page | 2 / 4 pages including key |
| Number Line | 6 / 12 | 1 column × 6 full-width rows; 6/page | 2 / 4 pages including key |

Preserved raw-runtime controls: `worksheetSeed`; `questionCount`; `questionsPerPage`; `minValue` / `minA` / `minimumValue` / `minimumNumber`; `maxValue` / `maxA` / `maximumValue` / `maximumNumber`; `selectedNumbers` / `selectedValues` / `onlyNumbers`; `includeExample` / `completedExample` / `example`; answer-key inclusion. Number lines additionally preserve interval aliases, endpoint aliases, and identify-task aliases. Number words preserve direction aliases. Forms accept only canonical expanded-sum style aliases. All are raw-runtime only; none is publicly registered.

Unsupported inputs include `pageCount`, selected digits/places, arbitrary prompt or representation modes, caller-owned prompt/answer/answer state/representation truth, unsupported word locale or spelling policy, arbitrary line interval/target truth, powers, multiplication forms, and unsafe density. Explicit invalid inputs fail before generation and do not silently fall back.

Focused verification in `scripts/testGrade5PlaceValueRepresentationsBatch4.js` covers 30 deterministic seeds, zero same-seed failures, different-seed variation, default and maximum pagination, examples additional, selected values and aliases, reverse number words, zero-place and 100,000 boundaries, complete structured truth, unique signatures/values, student/key parity, and adversarial rejection.

Proof packet:

- `review/grade-5-place-value-representations-batch-4/founder-review/01_expanded_form.pdf`
- `review/grade-5-place-value-representations-batch-4/founder-review/02_identify_numbers_on_a_number_line.pdf`
- `review/grade-5-place-value-representations-batch-4/founder-review/03_write_numbers_in_words.pdf`
- `review/grade-5-place-value-representations-batch-4/founder-review/04_standard_form.pdf`
- eleven corrected stress proofs in `review/grade-5-place-value-representations-batch-4/stress/` cover zeroes, atomic `100,000`, explicit 45 and maximum 60 form counts, full-width forward word rows, forward maximum 20, completed examples, reverse maximum 20, and the longest validated reverse prompts. The provisionally approved Number Line proofs were not regenerated.

Corrected stress filenames are `01_expanded_form_zeroes_boundary_and_example.pdf`, `02_expanded_form_explicit_45.pdf`, `03_expanded_form_maximum_60.pdf`, `04_standard_form_explicit_45.pdf`, `05_standard_form_maximum_60.pdf`, `06_standard_form_100000_boundary.pdf`, `07_number_words_forward_zeroes_and_boundary.pdf`, `08_number_words_forward_maximum_20.pdf`, `09_number_words_completed_example.pdf`, `10_number_words_reverse_maximum_with_example.pdf`, and `11_number_words_reverse_longest_word_forms.pdf`.

Founder correction changed the Expanded Form and Standard Form defaults from 45 to 30 while preserving explicit 45 and maximum 60 at 30/page. Both defaults now produce one student page and one matching key page. Grade 5 displayed numerals use a display-only atomic Canadian comma rule: Expanded Form prompts, Standard Form key answers, reverse Number Words answers, and examples render `100,000` as one non-wrapping unit without changing stored numeric truth.

Forward Number Words uses one full-width column. On the Letter page the usable task width is 504 pt; 12 pt numerals begin at the normal 44 pt task indent; response rules run from x=98 to x=558 for a measured 460 pt width. Row pitch is 45.67 pt, and the final response rule retains 34.6 pt clearance to the footer rule. The longest validated Canadian word form is `seventy-seven thousand seven hundred seventy-seven`, measuring 272.80 pt at 12 pt, well within the full-width row.

Reverse mode independently uses one full-width column, a 428 pt prompt zone, and a compact 46 pt numeral response rule aligned to the right task margin. Long prompts remain on one natural line. Default 12 remains one student and one key page; maximum 20 plus an additional completed example remains two student and two key pages without a sparse third page.

All affected proof pages were rendered and visually inspected. Titles, instructions, comma use, atomic boundary numerals, response widths, student/key mirroring, examples, multipage geometry, and footer clearance are print-safe with no clipping, overlap, type reduction, or footer pressure. Number Line remains unchanged.

Final Number Words proof correction reduced `07_number_words_forward_zeroes_and_boundary.pdf` from an accidental 13-value stress set to the approved 12-value set: 40,005; 50,505; 88,008; 30,003; 77,770; 70,040; 60,006; 88,080; 100,000; 80,808; 90,900; and 20,202. The corrected proof is exactly one student page and one answer-key page. Renderer instrumentation now records the page, row bounds, prompt bounds, rule endpoints, rule width, and footer position for every forward student item. Focused assertions confirm all 12 default and selected-value rows use the 460 pt full-width response rule from x=98 to x=558 beneath the numeral and within the same row, with at least 30 pt footer clearance. The regenerated default founder proof remains 12 rows and two pages. The maximum-20 proof remains four pages, balanced 10/10 across two student pages with all 20 response rules present. Reverse Number Words, both form resources, Number Line, structured truth, lifecycle status, reconciliation, and public customization remain unchanged.

The Grade 1–4 family history, Grade 5 exact-ID structured truth, Canadian comma formatting, atomic `100,000`, and the separate forward/reverse Number Words layouts are founder-approved. Expanded Form and Standard Form retain the corrected 30-question defaults, explicit 45 support, and maximum 60. Number Line remains six full-width rows. Forward Number Words remains 12 full-width rows with response rules from x=98 to x=558; its zeroes-and-boundary proof is corrected from 13 to 12 values and maximum 20 remains balanced 10/10. Reverse mode retains its wide prompt zone and compact numeral response.

Batch 4 is closed at **A18 / D6 / E1 / G21 / Total46**. Grade 5 is not closed; later batches and the Function Table decision remain separate.

## Batch 5 closeout — Structured Fractions

Founder approval covers all three exact resources. They move D → A with no split, blocked, or deferred resource, producing **A21 / D3 / E1 / G21 / Total46**. Lifecycle statuses remain `generated`, `ready`, and `generated`.

### Exact records, completed work, and role gate

| Exact ID | Catalog status | Prior output | Classification | Review-candidate role |
|---|---|---|---|---|
| `grade5_fraction_equivalence_fraction_number_line` | `generated` | generic adapter returned blank items in a generic equation grid | SHARED-FAMILY EXTENSION NEEDED | identify a marked proper fraction on a structured 0–1 number line |
| `grade5_fraction_equivalence_match_equivalent_fractions` | `ready` | equation completion mislabeled as matching, without complete structured truth | NARROW HONEST-ROLE CORRECTION | complete one missing numerator or denominator in an equivalent-fraction equation |
| `grade5_fraction_equivalence_shade_fraction_models` | `generated` | generic adapter returned blank items in a generic equation grid | SHARED-FAMILY EXTENSION NEEDED | shade a proper fraction on one partitioned strip |

The three actions are distinct: position-to-fraction reading, multiplicative equivalence completion, and fraction-to-model construction. None duplicates Grade 5 Compare Fractions, the approved equivalent-fraction quick check, or the exit ticket. The `match_equivalent_fractions` slug is retained for catalog compatibility, but the student-facing title is `Complete Equivalent Fractions`; no unsupported two-set matching claim remains. Genuine matching remains a separate architecture question and was not introduced.

### Full Grade 1–4 family cross-reference

| Contract | Grade 1 | Grade 2 | Grade 3 | Grade 4 | Grade 5 review candidate |
|---|---|---|---|---|---|
| Number-line role | concrete early fraction support only | no approved general fraction-line family | approved identify-marked-fraction adapter, 0–1 | same structured adapter, extended through tenths | same adapter, extended through twelfths including ninths/elevenths |
| Number-line geometry | early visual | n/a | six full-width rows | six full-width rows | six full-width rows; maximum twelve over two student pages |
| Number-line truth | task-specific | n/a | partition count, target index, labels, endpoint policy | complete answer state and unsimplified partition answer | preserve all Grade 4 truth and answer-key geometry |
| Equivalent role | special visual `One Half and Two Fourths` | generic advanced record deferred | generic equation completion rejected as “matching” | same mislabelled completion quarantined in G | honest equation completion under a corrected public title |
| Equivalent geometry | special strip pair | n/a | no approved matching-set geometry | no approved matching-set geometry | established two-column short-equation grid; no new matching renderer |
| Shade role | equal-parts visual foundation | approved `Shade Equal Parts` | approved proper-fraction strip task | approved proper-fraction strip task through twelfths | proper-fraction strip task with ninths/elevenths added |
| Shade geometry | early two-column visual grid | 2×4 | 2×4 | 2×4 | 2×4, unchanged type and strip width |
| Structured truth | model-owned partition/shading | model and key shading stored | requested fraction, model, shade count, signature | complete student/key answer state | preserve Grade 4 truth with Grade 5 resource identity |
| Examples | family-specific | additional where supported | additional | additional | additional; off by default |
| Public customization | none for this family | none | none | none | none |

Nearest exact-family references are Grade 3/4 Fractions on a Number Line and Shade the Fraction. The nearest layout-class reference for equivalent completion is the approved compact two-column equation grid; the renderer only places generator-owned text and answers. Lower-grade drift remains on the K–6 consistency watchlist: Grade 3 and Grade 4 “Match Equivalent Fractions” records still expose equation completion under a matching label. Batch 5 does not reopen them.

### Grade 5 scope and notation

The safe Grade 5 visual scope is one whole, proper fractions, and denominators `2, 3, 4, 5, 6, 8, 9, 10, 11, 12`. Number lines run from 0 to 1; interior targets are the default and explicit endpoints are supported. Answers intentionally retain the partition denominator (`3/6`, not automatically `1/2`) because the task asks students to read the shown partition. Shade models use one equal-width strip and never ask the renderer to infer a fraction.

Equivalent completion uses proper base fractions with multipliers `2, 3, 4, 5`, producing equivalent denominators up to 60. One value on the right-hand fraction is missing. Slash notation is retained because it is the established compact equation notation and remains readable at 12 points; number-line tick labels use the same unsimplified partition convention. Mixed numbers, improper-fraction models, 0–2 number lines, simplification tasks, fraction-of-a-set tasks, comparison/order controls, and genuine matching sets are not supported by these exact roles.

### Defaults, capacity, and layout

| Resource | Default / maximum | Page geometry | Default / maximum PDF including key | Measured boundary |
|---|---:|---|---:|---|
| Fractions on a Number Line | 6 / 12 | 1 column × 6 full-width rows | 2 / 4 pages | twelfths remain legible; answer line stays beneath the marked target |
| Complete Equivalent Fractions | 36 / 36 | 3 columns × 12 rows per page | 2 / 2 pages | question numbers through 36, denominator 60, and inserted values through 60 fit the unchanged 42-point target at unchanged 12-point type |
| Shade the Fraction | 8 / 8 | 2 columns × 4 rows | 2 / 2 pages | one-twelfth partitions remain visually distinct; key hatching preserves boundaries |

Completed examples are additional. Number-line and equivalent-completion maxima repeat student and answer-key page geometry. Shade models stay at the approved eight-item visual capacity rather than shrinking strips or fraction type.

### Structured truth

Number-line items store whole bounds, numerator/denominator, partition/interval/tick count, target index/value, interval, endpoint policy, displayed fraction labels, unsimplified answer, simplified reference value, response target, visual data, answer state, and a unique signature.

Equivalent-completion items store both numerators and denominators, exact integer cross-products, multiplier, missing position/value, normalized fraction, equality state, accepted answer variant, response target, answer state, and a unique signature. The generator calculates all truth before rendering; the renderer does no fraction arithmetic.

Shade items store requested numerator/denominator, partition and shade counts, model type, unshaded student model, answer-key shaded count, response target, visual data, answer state, and a unique signature. Student and key pages share the same structured model.

### Variable and adversarial contract

Preserved raw-runtime controls are `worksheetSeed`; `questionCount`; `questionsPerPage`; `includeExample` / `completedExample` / `example`; `selectedDenominators` / `denominators` / `allowedDenominators`; `selectedFractions` / `fractions`; and answer-key inclusion. Number lines additionally preserve `allowEndpointTargets` / `allowEndpoints` / `endpointPolicy` and the identify-task alias. Equivalent completion preserves `selectedMultipliers` / `multipliers` / `factors` and `missingPosition` / `missingPositions`. Shade preserves strip model aliases and shade-task aliases. Numerator-selection/range controls remain supported for the two non-line resources. All controls remain raw-runtime/internal; none is publicly registered.

Explicit invalid values reject before generation: zero, negative, decimal, unsupported or mixed-valid/invalid denominators; invalid or improper selected fractions; duplicate/conflicting aliases; reversed numerator ranges; excessive counts or unsafe density; unsupported endpoints, task modes, models, multipliers or missing positions; caller-owned shading; and insufficient unique candidate pools. Number-line numerator ranges are deliberately unsupported in favour of explicit selected fractions. Caller-owned prompt, answer, answer state, cross-product/model/partition truth, and page-count directives are unsafe and are not accepted.

### Tests and proof packet

`scripts/testGrade5StructuredFractionsBatch5.js` passes 30 deterministic seeds across all three resources with same-seed failures 0 and different-seed variation. Exact public copy/footer/status, counts, columns, pages, examples-additional behaviour, partition/equivalence/model truth, duplicate prevention, answer-key parity, alias consumption, invalid-input rejection, Grade 3/4 isolation, and absence of public customization pass.

Founder proofs:

- `review/grade-5-structured-fractions-batch-5/founder-review/01_fractions_on_a_number_line.pdf`
- `review/grade-5-structured-fractions-batch-5/founder-review/02_complete_equivalent_fractions.pdf`
- `review/grade-5-structured-fractions-batch-5/founder-review/03_shade_the_fraction.pdf`

Seven stress proofs in the sibling `stress/` folder cover denominator boundaries, selected ninths/elevenths/twelfths, maximum number-line and completion counts, multiplier extremes, two-digit answers through 60, completed examples, and one-part/all-but-one-part shading boundaries. Fraction labels, response targets, partitions, hatching, student/key alignment, pagination, examples, and footers are print-safe with no clipping, overlap, tiny type, or footer pressure.

Founder density correction: Fractions on a Number Line and Shade the Fraction retain their approved six- and eight-question defaults. After the earlier 12 → 24 correction, the founder requested a final 3-column × 12-row density test for Complete Equivalent Fractions. The measured 36-question result is print-safe on one student page and one mirrored answer-key page: all questions 1–36 are visible, denominator-60 equations and inserted values through 60 remain on one line, the existing 12-point fraction type and 42-point answer target are unchanged, and there is no clipping, collision, wrapping, footer pressure, or type reduction. The completed-example proof keeps the example additional and all 36 practice questions on the same student page. The accepted default and maximum are therefore both 36 with exact mixed-mode balance of 18 missing numerators and 18 missing denominators. No fraction range, multiplier, structured truth, response target, variable alias, lifecycle status, public customization, or reconciliation value changed.

Batch 5 is founder-approved and closed. The Grade 1–4 family history was reviewed; proper-fraction scope and denominators `2, 3, 4, 5, 6, 8, 9, 10, 11, 12` are retained. Structured numerator/denominator truth and exact integer equivalence remain generator-owned; the renderer performs no arithmetic and no new visual architecture was introduced. The original 12-question completion default and interim 24-question default were rejected as sparse. The final approved completion contract is 36 questions in a 3×12 grid on one student page and one key page, with exact 18/18 missing-position balance, unchanged 12-point type and 42-point answer target, an additional completed example, and readable denominator-60 cases. Catalog statuses remain `generated`, `ready`, and `generated`; reconciliation is **A21 / D3 / E1 / G21 / Total46**. Grade 5 remains open.
