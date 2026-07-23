# Grade 5 Architecture Reconciliation Preflight

Status: preflight only. Grade 5 implementation has not started. This document proposes, but does not apply, reconciliation movements or lifecycle changes.

Starting checkpoint: `f1b04ee6d7f90789af46419947164fa84d5c320a`

## Guardrails

For every Grade 5 resource, compare the full approved family history across Grades 1–4 and the nearest approved task/layout class. The strongest safe established contract wins unless a Grade 5 instructional, geometric, readability, print-safety, or variable-safety reason is recorded. A Grade 4 divergence is never inherited merely because it is the newest version.

This preflight does not change production code, catalog records, lifecycle status, public customization, proofs, or the closed Grade 2–4 reconciliations.

Closed lower-grade baseline:

- Grade 2: **A35 / D0 / E0 / G17 / Total52**
- Grade 3: **A36 / D0 / E0 / G17 / Total53**
- Grade 4: **A24 / D0 / E0 / G24 / Total48**

## Inventory result

- 46 Grade 5 catalog records
- 46 unique IDs; no duplicate or missing catalog entries detected
- lifecycle snapshot: 11 `ready`, 32 `generated`, 1 `partial`, 2 `planned`
- all 46 default runtimes build except the established planned `grade5_patterning_and_algebra_pattern_word_problems` generator gap
- all successfully built resources include an answer key; the two zero-question placeholders produce one empty student page
- no Grade 5 public customization family is registered
- subject is Math for all 46 records
- renderer is the shared PDF renderer for all records; the generator and layout classes below identify the meaningful family boundary
- current public variables: none. Catalog defaults and raw runtime aliases are not public customization.

Density notation is `questions / columns / questions-per-student-page / total PDF pages`, including the key. `—` means the placeholder has no generated questions.

| # | Exact resource ID | Current title; strand; kind/status | Generator; layout | Current density | Current finding | Proposed |
|---:|---|---|---|---|---|---|
| 1 | `g5_compare_numbers_to_100000_exit_ticket` | Compare Numbers to 100,000 Exit Ticket; Place Value; exit ticket/ready | compare numbers; compact assessment | 3/4/60/2 | previously curated and print-QA’d; honest bounded role | A |
| 2 | `g5_equivalent_fractions_exit_ticket` | Equivalent Fractions Exit Ticket; Fractions; exit ticket/ready | equivalent-fraction completion; compact assessment | 3/2/20/2 | previously curated and print-QA’d | A |
| 3 | `g5_place_value_to_100000_quick_check` | Compare Numbers to 100,000 Quick Check; Place Value; quick check/ready | compare numbers; compact assessment | 6/4/60/2 | previously curated and print-QA’d; honest bounded role | A |
| 4 | `g5_equivalent_fractions_quick_check` | Equivalent Fractions Quick Check; Fractions; quick check/ready | equivalent-fraction completion; compact assessment | 6/2/20/2 | previously curated and print-QA’d | A |
| 5 | `grade5_addition_subtraction_word_problems_addition_word_problem` | Addition Word Problem — Grade 5; Addition & Subtraction; practice/generated | addition story; full-width work box | 12/1/3/8 | shared-family Grade 5 extension and language/range review needed | D/B5 |
| 6 | `grade5_addition_subtraction_facts_equation_match` | Equation Match — Grade 5; Addition & Subtraction; matching/generated | relation comparison; matching/compact relation | 12/2/12/2 | current generic contract trails approved Grade 4 compare-equations class | D/B2 |
| 7 | `grade5_addition_subtraction_facts_fact_family` | Fact Families — Grade 5; Addition & Subtraction; matching/generated | fact family; matching | 12/3/12/2 | primary-fact task has no natural Grade 5 distinction | G |
| 8 | `grade5_addition_subtraction_facts_fact_fluency` | Fact Fluency — Grade 5; Addition & Subtraction; fluency/generated | fact fluency; fluency grid | 12/2/20/2 | overlaps approved multiplication review and lower-grade remediation | G |
| 9 | `grade5_addition_subtraction_word_problems_missing_addend_word_problem` | Missing Addend Word Problem — Grade 5; Addition & Subtraction; practice/generated | missing-addend story; full-width work box | 12/1/3/8 | shared-family Grade 5 extension and language/range review needed | D/B5 |
| 10 | `grade5_addition_subtraction_facts_missing_addend` | Missing Addends — Grade 5; Addition & Subtraction; fluency/generated | missing addend; fluency grid | 12/4/60/2 | lower-grade fact remediation with weak Grade 5 role | G |
| 11 | `grade5_addition_subtraction_facts_related_subtraction` | Related Subtraction — Grade 5; Addition & Subtraction; fluency/generated | related subtraction; fluency grid | 12/4/60/2 | lower-grade fact remediation with weak Grade 5 role | G |
| 12 | `grade5_addition_subtraction_word_problems_subtraction_word_problem` | Subtraction Word Problem — Grade 5; Addition & Subtraction; practice/generated | subtraction story; full-width work box | 12/1/3/8 | shared-family Grade 5 extension and language/range review needed | D/B5 |
| 13 | `grade5_addition_subtraction_facts_ten_frame` | Ten Frame Practice — Grade 5; Addition & Subtraction; visual/generated | ten frame; full-width visual | 10/1/10/2 | unsupported Grade 5 difficulty; remediation overlap | G |
| 14 | `grade5_addition_subtraction_facts_word_problems` | Word Problems — Grade 5; Addition & Subtraction; practice/generated | generic stories; full-width work box | 12/1/3/8 | duplicates the three explicit story roles | G |
| 15 | `grade5_data_display_graphing_complete_graph` | Complete a Graph — Grade 5; Data & Graphing; visual/generated | text-data fallback; full-width | 12/1/6/4 | duplicate of curated `g5_complete_graphs`; title overclaims a visual | G |
| 16 | `g5_complete_graphs` | Grade 5 Data Questions; Data & Graphing; visual/ready | text-data questions; full-width | 12/1/6/4 | previously browser/print-QA’d with an honest text-based role | A |
| 17 | `grade5_data_display_graphing_graph_questions` | Graph Questions — Grade 5; Data & Graphing; practice/generated | generic data questions; full-width | 12/1/6/4 | overlaps curated data interpretation; title overclaims graph evidence | G |
| 18 | `grade5_data_display_graphing_graph_word_problems` | Graph Word Problems — Grade 5; Data & Graphing; practice/generated | placeholder; generic practice | —/2/20/1 | zero-question output and no distinct approved role | G |
| 19 | `grade5_data_display_graphing_interpret_data` | Interpret Data — Grade 5; Data & Graphing; practice/generated | text-data interpretation; full-width | 12/1/6/4 | duplicate of curated `g5_interpret_graphs` | G |
| 20 | `g5_interpret_graphs` | Grade 5 Data Interpretation; Data & Graphing; practice/ready | text-data interpretation; full-width | 12/1/6/4 | honest text-based role, but same-seed item selection is not deterministic | D/B6 |
| 21 | `grade5_data_display_graphing_match_data_to_graph` | Match Data to Graph — Grade 5; Data & Graphing; matching/generated | text fallback; full-width matching | 12/1/6/4 | needs unsupported genuine graph-choice architecture | G |
| 22 | `grade5_data_display_graphing_read_graph` | Read a Graph — Grade 5; Data & Graphing; visual/generated | text fallback; full-width | 12/1/6/4 | graph title without structured graph truth; overlaps curated role | G |
| 23 | `grade5_fraction_equivalence_compare_fractions` | Compare Fractions — Grade 5; Fractions; practice/ready | fraction comparison; two-column equations | 12/2/20/2 | bounded ready family remains classroom-usable; exact truth retained | A |
| 24 | `g5_fraction_equivalence` | Fraction Equivalence; Fractions; practice/partial | placeholder; generic equations | 12/2/20/2 | blank prompts and overlap with approved equivalent-fraction assessments | G |
| 25 | `grade5_fraction_equivalence_fraction_number_line` | Fraction Number Line — Grade 5; Fractions; practice/generated | fraction number line; currently generic equations | 12/2/20/2 | structured Grade 3/4 number-line extension is needed | D/B4 |
| 26 | `grade5_fraction_equivalence_fraction_word_problems` | Fraction Word Problems — Grade 5; Fractions; practice/generated | placeholder; generic practice | —/2/20/1 | no distinct curriculum-safe application lane | G |
| 27 | `g5_fraction_number_line` | Fractions on a Number Line; Fractions; visual/planned | placeholder; full-width visual | 10/1/5/4 | overlaps ID 25 and currently has blank prompts | G |
| 28 | `grade5_fraction_equivalence_match_equivalent_fractions` | Match Equivalent Fractions — Grade 5; Fractions; practice/ready | equation completion; two-column equations | 12/2/20/2 | output is completion, not matching; narrow honest-role correction needed | D/B4 |
| 29 | `grade5_fraction_equivalence_shade_fraction_models` | Shade Fraction Models — Grade 5; Fractions; practice/generated | fraction model; two-column visual | 12/2/20/2 | shared structured-model extension needed | D/B4 |
| 30 | `grade5_multiplication_facts_arrays` | Arrays — Grade 5; Multiplication & Division; interpretation/generated | array; two-column visual | 10/2/8/4 | basic array task is lower-grade review without a distinct Grade 5 role | G |
| 31 | `grade5_multiplication_facts_equal_groups` | Equal Groups — Grade 5; Multiplication & Division; interpretation/ready | equal groups; two-column visual | 12/2/8/4 | prior documents flag the unchanged basic task as Grade 5 remediation only | G |
| 32 | `grade5_multiplication_facts_missing_factor` | Missing Factors — Grade 5; Multiplication & Division; fluency/ready | missing factor; fluency grid | 60/4/60/2 | promoted and tested as an honest bounded fact-review role | A |
| 33 | `g5_multiplication_fact_review` | Multiplication Fact Review; Multiplication & Division; fluency/ready | multiplication review; fluency grid | 60/4/60/2 | previously manually print-QA’d; distinct mixed review role | A |
| 34 | `grade5_multiplication_facts_skip_counting` | Skip Counting — Grade 5; Multiplication & Division; practice/generated | skip count; full-width sequence | 10/1/10/2 | lower-grade precursor without a natural Grade 5 distinction | G |
| 35 | `grade5_multiplication_facts_word_problems` | Word Problems — Grade 5; Multiplication & Division; practice/generated | equal-groups stories; full-width work box | 12/1/3/8 | documented as too basic for Grade 5 except intervention | G |
| 36 | `grade5_patterning_and_algebra_extend_pattern` | Extend Pattern — Grade 5; Patterning & Algebra; practice/generated | numeric pattern; two-column sequence | 12/2/16/2 | strong Grade 3/4 family exists; Grade 5 rule/range extension needed | D/B1 |
| 37 | `grade5_patterning_and_algebra_function_table` | Function Table — Grade 5; Patterning & Algebra; practice/generated | sentence fallback; full-width | 12/1/6/4 | no approved visible input/output-table architecture | E |
| 38 | `grade5_patterning_and_algebra_identify_pattern_rule` | Identify Pattern Rule — Grade 5; Patterning & Algebra; practice/generated | numeric pattern; full-width rule response | 12/1/8/4 | strong Grade 3/4 family exists; shared extension needed | D/B1 |
| 39 | `grade5_patterning_and_algebra_missing_value_pattern` | Missing Value Pattern — Grade 5; Patterning & Algebra; practice/generated | numeric pattern; two-column sequence | 12/2/12/2 | strong Grade 3/4 family exists; shared extension needed | D/B1 |
| 40 | `grade5_patterning_and_algebra_pattern_word_problems` | Pattern Word Problems — Grade 5; Patterning & Algebra; practice/planned | missing generator; generic practice | — | established planned gap; no approved application architecture | G |
| 41 | `grade5_place_value_representation_base_ten_blocks` | Base Ten Blocks — Grade 5; Place Value; visual/generated | base-ten model; full-width visual | 10/1/10/2 | current shared model does not establish a Grade 5 magnitude role | G |
| 42 | `grade5_place_value_representation_compare_numbers` | Compare Numbers — Grade 5; Place Value; practice/generated | compare numbers; fluency grid | 12/4/60/2 | shared compare-equations density/range correction needed | D/B2 |
| 43 | `grade5_place_value_representation_expanded_form` | Expanded Form — Grade 5; Place Value; representation/generated | expanded form; three-column grid | 45/3/45/2 | reusable representation family; Grade 5 range/format QA needed | D/B3 |
| 44 | `grade5_place_value_representation_number_line_identify` | Number Line — Grade 5; Place Value; visual/generated | place-value number line; full-width | 10/1/5/4 | structured interval family needs Grade 5 extension | D/B3 |
| 45 | `grade5_place_value_representation_number_word_match` | Number Word Match — Grade 5; Place Value; matching/generated | number words; two-column matching | 12/2/12/2 | shared Grade 4 family needs Grade 5 range/format QA | D/B3 |
| 46 | `grade5_place_value_representation_standard_form` | Standard Form — Grade 5; Place Value; representation/generated | standard form; three-column grid | 45/3/45/2 | reusable representation family; Grade 5 range/format QA needed | D/B3 |

## Full lower-grade family cross-reference

Every inventory row maps to one family below. “—” means no approved lower-grade exact family; the nearest approved layout class still applies.

| Family code and Grade 5 rows | Grade 1 approved history | Grade 2 approved history | Grade 3 approved history | Grade 4 approved history | Strongest safe Grade 5 inheritance |
|---|---|---|---|---|---|
| Compact compare assessments (1, 3) | compact comparison targets | relational comparison and assessment conventions | whole-number comparison | Grade 4 compare-equations/compact relation geometry | keep curated 3/6 assessment counts; exact comparison truth; concise student copy |
| Equivalent-fraction assessments (2, 4) | concrete equal parts | structured equal parts | exact fraction equivalence | structured fractions | keep curated 3/6 assessment counts and exact integer equivalence; do not claim physical matching |
| Addition/subtraction stories (5, 9, 12, 14) | one-step natural contexts | context diversity and truth | work boxes and deterministic contexts | 8-question, 3-per-page story geometry | Grade 4 workspace and context controls; larger Grade 5 ranges, not denser prose |
| Equation/relational matching (6) | relational equations | relational equation copy/targets | addition/subtraction fact relationships | 30-question 3×10 Compare Equations with exact equality balance and safe maximum | inherit Grade 4 compact relation class, exact structured truth, example additional to count |
| Foundational addition facts/models (7, 8, 10, 11, 13) | core fact/model roles | fact families and models | bounded review | no stronger natural Grade 4/5 progression | defer unless explicitly approved as intervention; do not invent Grade 5 difficulty |
| Structured data (15–22) | structured pictograph truth | read/interpret/finish/match pictographs | structured data displays | confirmed text-only drift was deferred | retain curated honest text-data resources only; do not inherit Grade 4 visual overclaims |
| Fraction comparison/equivalence (23–29) | concrete equal parts | structured fraction models | exact comparisons and full-width number lines | structured compare/model/number-line families | exact integer truth, structured models, full-width six-question number-line class; honest completion role |
| Multiplication facts/models (30–35) | — | concrete equal groups | arrays/equal groups and facts | fact review; basic story/model work explicitly bounded | retain approved 60-item review roles; defer unchanged primary models/stories |
| Numeric patterning (36, 38–40) | simple sequence extension | numeric patterning | aligned extend/rule/missing-value families | same families with founder-approved copy and geometry | reuse strongest aligned sequence layouts; difficulty from rule complexity and values |
| Function table (37) | — | — | — | deferred because visible input/output table architecture was absent | E: founder-approved table semantics, renderer, variables, and truth required first |
| Place-value visual/representation (41, 43–46) | concrete tens/ones and forms | representation/shared families | structured hundreds base-ten and number lines | expanded/standard/word/number-line families; base-ten thousands extension absent | inherit compact representation grids and structured number line; do not inherit missing-magnitude block model |
| Place-value comparison (42) | comparison symbols | compare within grade ranges | compact comparison | 30-question 3×10 relation class | use 3×10 safe density and genuine Grade 5 magnitude |

### Exact approved lower-grade anchors consulted

These are the exact approved same-family or nearest-layout-class records behind the compact matrix. A generic catalog twin that closed in G is intentionally excluded.

| Grade 5 family | Grade 1 | Grade 2 | Grade 3 | Grade 4 |
|---|---|---|---|---|
| comparison/compact assessment | `g1_compare_numbers_to_20`, `g1_compare_numbers_to_20_exit_ticket` | `g2_compare_numbers_to_100`, `grade2_place_value_representation_compare_numbers` | `g3_compare_3_digit_numbers_quick_check`, `g3_compare_3_digit_numbers_exit_ticket`, `grade3_place_value_representation_compare_numbers` | `grade4_place_value_representation_compare_numbers`, `grade4_addition_subtraction_facts_equation_match` |
| equivalent-fraction assessment/completion | Grade 1 concrete fraction family; `grade1_fraction_equivalence_match_equivalent_fractions` supplies only completion history | Grade 2 concrete fraction family; `grade2_fraction_equivalence_match_equivalent_fractions` supplies only completion history | `grade3_fraction_equivalence_compare_fractions`; Match Equivalent Fractions was split/deferred | `grade4_fraction_equivalence_compare_fractions`; Match Equivalent Fractions was deferred |
| addition/subtraction stories | `grade1_addition_subtraction_word_problems_addition_word_problem`, `grade1_addition_subtraction_word_problems_missing_addend_word_problem`, `grade1_addition_subtraction_word_problems_subtraction_word_problem` | corresponding `grade2_addition_subtraction_word_problems_*` trio | corresponding `grade3_addition_subtraction_word_problems_*` trio | corresponding founder-approved `grade4_addition_subtraction_word_problems_*` trio |
| relational equations | `grade1_addition_subtraction_facts_equation_match` | `grade2_addition_subtraction_facts_equation_match` | `grade3_addition_subtraction_facts_equation_match` | `grade4_addition_subtraction_facts_equation_match` |
| structured data | approved Grade 1 read/interpret/complete pictograph family | approved Grade 2 Read, Interpret, Finish and Choose-the-Matching Pictograph resources | `g3_complete_a_graph`, `g3_interpret_data` and the approved Grade 3 structured-data batch | none: the text-only Grade 4 graph lane closed in G |
| fraction comparison/number line/model | approved Grade 1 concrete fraction family | approved Grade 2 Shade Equal Parts and Share Fairly family | `grade3_fraction_equivalence_compare_fractions`, `grade3_fraction_equivalence_fraction_number_line`, `grade3_fraction_equivalence_shade_fraction_models` | corresponding approved `grade4_fraction_equivalence_*` compare/number-line/shade trio |
| multiplication review/model | no Grade 1 fact-review equivalent | approved Grade 2 Arrays/Equal Groups family | `g3_missing_factors` plus approved Grade 3 concrete visual family | `g4_missing_factors`, `g4_multiplication_fact_fluency`, `g4_array_interpretation`, `g4_equal_groups_interpretation` |
| numeric patterning | approved Grade 1 extend/rule/missing-value family | `grade2_patterning_and_algebra_extend_pattern`, `grade2_patterning_and_algebra_identify_pattern_rule`, `grade2_patterning_and_algebra_missing_value_pattern` | corresponding approved `grade3_patterning_and_algebra_*` trio | corresponding approved `grade4_patterning_and_algebra_*` trio plus `g4_pattern_rule_quick_check` |
| place-value forms/number line/words | `g1_number_line_identify_to_20`, `g1_number_word_match_to_50`, `g1_write_the_numeral_to_50` | `g2_expanded_form_to_100`, `g2_standard_form_to_100` and approved Grade 2 number-line family | `grade3_place_value_representation_expanded_form`, `grade3_place_value_representation_standard_form`, `grade3_place_value_representation_number_line_identify`, `grade3_place_value_representation_number_word_match` | `g4_expanded_form_large_numbers`, `g4_standard_form_large_numbers`, `grade4_place_value_representation_number_line_identify`, `grade4_place_value_representation_number_word_match` |
| function table | — | — | — | `grade4_patterning_and_algebra_function_table` closed in G; it is negative evidence, not an architecture to inherit |

### Inheritance contract fields

| Field | Grades 1–2 | Grade 3 | Grade 4 | Strongest safe Grade 5 contract |
|---|---|---|---|---|
| Public title | short student action | short student action | short student action after founder correction | name the action actually shown; remove internal metadata and unsupported “match/graph” claims |
| Instruction | one concise imperative | one concise imperative | one concise imperative | one imperative near the top; no teacher-facing “Students…” copy |
| Default/max count | family-specific, bounded | family-specific plus safe maxima | densest safe class or documented workspace reduction | inherit family maximum; default from the densest safe comparable class unless Grade 5 writing width requires less |
| Columns/rows | model or response driven | structured family geometry | compact 3×10 relation, 3×15 representation, full-width visual/story | preserve 3×10 relation, 3×15 representation, two-column short equations/sequences, one-column work-box/visual |
| Response geometry | explicit symbol/blank/model | aligned targets and full-width number lines | work boxes and compact circular/blank targets | target must align with action; full-width for number lines/stories; no generic text row for a diagram/table |
| Example | absent unless useful | completed example additional to count | alias-compatible completed example additional to count | preserve aliases and additional-to-count behavior |
| Key | exact student/key parity | compact key with structured truth | exact parity and safe pagination | exact structured data shared by student/key; two-page default where geometry allows |
| Number format | grade range | place separators/unsimplified partition answers where required | exact integer arithmetic and display conventions | Grade 5 magnitude/structure without shrinking type; commas and unsimplified partition answers when instructional |
| Variables | raw family controls | aliases validated/consumed | stronger conflict and invalid-input rejection | preserve every consumed control; no silent fallback, no new public registration |
| Structured truth | visible model equals answer | explicit rows, points, models, equation operands | exact cross-products/comparison pairs and deterministic structured records | generate truth first and render both pages from it |
| Grade-specific deviation | concrete representations | increased structure/range | workspace reductions only when founder-justified | difficulty through magnitude, relation, fraction structure, rule complexity, and unknown position—not cramped layout |

## Grade 4 relationship and drift watchlist

Grade 4’s closed A set is not reopened. These findings constrain Grade 5 inheritance and are retained for a later consistency review.

| Grade 4 relationship | Classification | Stronger prior/peer contract | Grade 5 consequence |
|---|---|---|---|
| Structured data/graph resources fell back to text while titles implied graphs | CONFIRMED GRADE 4 DRIFT (quarantined in G) | Grade 1–3 structured pictograph/data truth and visible visual models | do not build Grade 5 graph claims on text-only output; keep only the two honest curated text-data resources |
| `grade4_fraction_equivalence_match_equivalent_fractions` performs equation completion | CONFIRMED GRADE 4 DRIFT (quarantined in G) | student action and public title must agree | Grade 5 ID 28 is a narrow honest completion-family correction, not inherited “matching” |
| `grade4_place_value_representation_base_ten_blocks` lacks a genuine thousands extension | POSSIBLE GRADE 4 DRIFT (quarantined in G) | Grade 3 structured hundreds-block truth plus grade-appropriate magnitude progression | Grade 5 base-ten blocks remain G until a genuine magnitude-safe visual is approved |
| Grade 4 multiplication stories were accepted only as bounded review | JUSTIFIED GRADE 4 DEVIATION | Grade 3 equal-groups story architecture | unchanged Grade 5 equal-groups stories/models do not become grade-level merely through relabeling |
| Grade 4 story pages use fewer items because work boxes and longer numbers need width | JUSTIFIED GRADE 4 DEVIATION | earlier one-step story truth with less workspace | inherit the workspace, not a denser lower-grade grid |
| Grade 4 Compare Equations and place-value representation grids | CONSISTENT / stronger same-grade layout class | strongest approved compact relation and representation geometry | use as the nearest layout classes for B2/B3 |

## Completed-work classification

- **ALREADY COMPLETE (A, 8):** the four `g5_*` compact assessments, curated `g5_complete_graphs`, Grade 5 Compare Fractions, Missing Factors, and Multiplication Fact Review. Their ready state is supported by prior test/print evidence and an honest bounded review role.
- **NARROW CORRECTION NEEDED (D):** equation match, equivalent-fraction completion naming, place-value compare, and the representation/form resources whose generator is shared but public copy/range/density must be reconciled.
- **NARROW RELIABILITY CORRECTION NEEDED (D):** `g5_interpret_graphs` has an honest reviewed role and stable answer truth, but its question-template selection bypasses the supplied seed. Its duplicate `grade5_data_display_graphing_interpret_data` exhibits the same defect and stays G.
- **SHARED-FAMILY EXTENSION NEEDED (D):** three stories, three numeric-pattern resources, fraction number line/model, and place-value number line.
- **NEW ARCHITECTURE NEEDED (E):** Function Table only.
- **DUPLICATE or LOW-VALUE / OVERLAPPING — DEFER (G):** 21 records listed below.
- **STALE RECONCILIATION:** none. The proposal is new and no Grade 5 movements have been applied.

## Variable-contract reconciliation

No controls are publicly registered. Implementation batches must inventory exact aliases in focused tests before changing defaults.

| Family | Controls and aliases to preserve/test | Current classification | Consumption risk |
|---|---|---|---|
| all generated families | `questionCount`; `questionsPerPage`; `worksheetSeed`; render-time `includeAnswerKey`; `includeExample` / `completedExample` / `example` | RAW RUNTIME ONLY / INTERNAL ALIAS | count/seed/key are globally normalized; family layout may still bypass page/example inputs unless tested |
| addition/subtraction | `selectedOperations` / `operations`; `minA`, `maxA`, `minB`, `maxB`, `maxTotal`; `minimumResult`, `maximumResult`; `selectedNumbers` / `onlyNumbers`; `includeEqualPairs` / `equalPairs` | PRESERVED where shared generators consume them; otherwise RAW RUNTIME ONLY | conflicting aliases and unsupported operations must reject, never default silently |
| stories | global count/page/seed/example controls plus `selectedContexts` / `contexts`; `selectedObjects` / `onlyObjects`; operand/result ranges; selected operation/numbers; `naturalTakeAwayLanguage` | PRESERVED in shared Grades 2–4 family | Grade 5 correction must not break context selection, deterministic repetition controls, or pagination |
| patterns | `operationMode` / `operation` / `ruleType`; `startingValue` / `startNumber`; start min/max; `sequenceStep` / `step`; step min/max; `sequenceLength` / `termCount`; `visibleLength` / `shownTermCount`; `continuationCount` / `extensionCount` / `answerCount`; `missingTermCount` / `missingCount`; `missingTermPlacement` / `missingPlacement`; sequence-value min/max | PRESERVED in the shared numeric-pattern generator; RAW RUNTIME ONLY | Grade 5 exact IDs need proof that every alias reaches generator truth and layout |
| fractions | `selectedDenominators` / `denominators` / `allowedDenominators`; `selectedFractions` / `fractions`; `selectedNumerators` / `numerators`; numerator min/max; equality controls; endpoint policy; model/task modes | PRESERVED in approved Grade 3/4 generators; Grade 5 current support is mixed | unsupported or mixed valid/invalid selections must fail entirely |
| place value | `minA`, `maxA`; `selectedNumbers` / `onlyNumbers`; `numberWordMode` / `mode`; `promptStyle` / `promptType`; number-line range/interval/endpoint controls; expanded-form `answerStyle` | RAW RUNTIME ONLY; shared aliases must be reconciled | current Grade 5 defaults may be too small or silently inherited |
| multiplication | factor/row/column/group/item min/max; `selectedFactors` / `onlyFactors`; side-specific selected aliases; `maxProduct`; `responseMode`; `showQuestionSentence`; `taskMode`; `equationSupport` | PRESERVED for the two A review resources; RAW RUNTIME ONLY | basic-model G resources must not create public controls |
| structured data | `graphType`; scale/key aliases; category count; selected categories/values/question types; partial-symbol policy | UNSAFE or absent for generic Grade 5 IDs | do not expose until structured visual architecture exists |
| curated text-data interpretation | seed, count/page, key inclusion | seed is BYPASSED in `g5_interpret_graphs` template selection | B6 must consume the supplied seed without changing reviewed copy, data truth, density, or pages |
| function table | input set, rule/operation, output domain, row count, unknown mode | NEW CONTRACT REQUIRED | current sentence fallback does not consume a visible-table contract |

Public readiness remains **none**. Controls become public only in a separate customization review after founder approval.

## Density, layout, and Grade 5 difficulty

| Family | Current Grade 5 | Strongest safe default to prove later | Legitimate Grade 5 distinction | Required safety evidence |
|---|---|---|---|---|
| numeric patterns | 12; mixed 1/2-column | preserve approved 12-question aligned family layouts | multi-operation rules, larger values, varied missing positions | 30 seeds, longest sequence/value, rule balance, no overflow |
| compact relations | 12; 2/4-column | 30 in a 3×10 student grid where expression width permits | larger numbers and stronger equality reasoning | equality balance, reversal uniqueness, maximum 60, target centring |
| place-value forms | 45 in 3×15; number words 12; line 10 over 2 student pages | retain 3×15 short-form grids, 2×6 number words, six full-width number lines | numbers to at least 100,000 and nontrivial intervals | comma/word formatting, widest prompt, interval truth, page count |
| structured fractions | 12 generic; models 12 | six full-width number lines; eight to twelve short/model items according to geometry | richer denominators, equivalence/comparison structure, possibly 0–2 only after approval | exact integer truth, endpoint policy, unsimplified partition answer, no tiny models |
| stories | 12; 3 per student page (four student pages) | founder-approved Grade 4 work-box geometry; proposed default 8 unless proof supports 12 | larger multi-digit one-step arithmetic and varied unknown positions | arithmetic truth, language repetition, work-box fit, maximum pagination |
| ready assessments/review | 3/6 compact; 60 fact review | preserve current bounded roles | assessment/review purpose, not artificial task complexity | regression only; no reimplementation |

Sparse current output is not evidence for a lower density. Conversely, story, number-line, and visual families keep full-width space because the response action needs it.

## Initial reconciliation proposal

Proposed only; no catalog or reconciliation movement has been applied.

### A — 8

- `g5_compare_numbers_to_100000_exit_ticket`
- `g5_equivalent_fractions_exit_ticket`
- `g5_place_value_to_100000_quick_check`
- `g5_equivalent_fractions_quick_check`
- `g5_complete_graphs`
- `grade5_fraction_equivalence_compare_fractions`
- `grade5_multiplication_facts_missing_factor`
- `g5_multiplication_fact_review`

### D — 16

- `grade5_addition_subtraction_word_problems_addition_word_problem` — B5
- `grade5_addition_subtraction_facts_equation_match` — B2
- `grade5_addition_subtraction_word_problems_missing_addend_word_problem` — B5
- `grade5_addition_subtraction_word_problems_subtraction_word_problem` — B5
- `grade5_fraction_equivalence_fraction_number_line` — B4
- `grade5_fraction_equivalence_match_equivalent_fractions` — B4
- `grade5_fraction_equivalence_shade_fraction_models` — B4
- `grade5_patterning_and_algebra_extend_pattern` — B1
- `grade5_patterning_and_algebra_identify_pattern_rule` — B1
- `grade5_patterning_and_algebra_missing_value_pattern` — B1
- `grade5_place_value_representation_compare_numbers` — B2
- `grade5_place_value_representation_expanded_form` — B3
- `grade5_place_value_representation_number_line_identify` — B3
- `grade5_place_value_representation_number_word_match` — B3
- `grade5_place_value_representation_standard_form` — B3
- `g5_interpret_graphs` — B6

### E — 1

- `grade5_patterning_and_algebra_function_table`

### G — 21

- `grade5_addition_subtraction_facts_fact_family`
- `grade5_addition_subtraction_facts_fact_fluency`
- `grade5_addition_subtraction_facts_missing_addend`
- `grade5_addition_subtraction_facts_related_subtraction`
- `grade5_addition_subtraction_facts_ten_frame`
- `grade5_addition_subtraction_facts_word_problems`
- `grade5_data_display_graphing_complete_graph`
- `grade5_data_display_graphing_graph_questions`
- `grade5_data_display_graphing_graph_word_problems`
- `grade5_data_display_graphing_interpret_data`
- `grade5_data_display_graphing_match_data_to_graph`
- `grade5_data_display_graphing_read_graph`
- `g5_fraction_equivalence`
- `grade5_fraction_equivalence_fraction_word_problems`
- `g5_fraction_number_line`
- `grade5_multiplication_facts_arrays`
- `grade5_multiplication_facts_equal_groups`
- `grade5_multiplication_facts_skip_counting`
- `grade5_multiplication_facts_word_problems`
- `grade5_patterning_and_algebra_pattern_word_problems`
- `grade5_place_value_representation_base_ten_blocks`

Total: **A8 / D16 / E1 / G21 / Total46**.

Projected scenario after the six D batches: **A24 / D0 / E1 / G21 / Total46**. If the founder later approves and implements a genuine Function Table architecture: **A25 / D0 / E0 / G21 / Total46**. A founder decision to defer Function Table instead yields **A24 / D0 / E0 / G22 / Total46**.

## Duplicate and deferred analysis

| Exact ID or group | Overlap/current action | Reason to defer | Reconsideration trigger |
|---|---|---|---|
| facts IDs 7, 8, 10, 11, 13 | primary fact families, fluency, missing addends, ten frames | no natural Grade 5 teacher-use distinction from lower-grade remediation | explicit intervention collection with honest labels |
| ID 14 | generic addition/subtraction stories | duplicates the three explicit operation/unknown-position resources | distinct mixed-review contract approved |
| IDs 15, 17, 19, 22 | text-data questions under graph-like titles | overlap curated IDs 16/20; visual truth absent | structured Grade 5 display family and distinct action approved |
| ID 18 | zero-question graph-word placeholder | no distinct role | curriculum-safe application lane approved |
| ID 21 | “match” without two structured graph choices | new visual choice architecture hidden in a generic ID | shared graph-choice renderer/test contract approved |
| IDs 24, 26, 27 | blank/zero-output fraction resources | overlap approved fraction families or lack application role | distinct role and structured generator approved |
| IDs 30, 31, 34, 35 | basic arrays/groups/skip-counting/equal-group stories | lower-grade content; documented Grade 5 remediation only | honest intervention role or richer Grade 5 multiplicative-reasoning contract |
| ID 40 | missing planned pattern-word generator | one of seven established planned gaps | one-step pattern application lane approved |
| ID 41 | base-ten blocks without Grade 5 magnitude model | unsupported visual extension | approved thousands/ten-thousands visual system |

## Verification contract for future batches

Each implementation batch must run:

1. completed-work and exact lower-grade family reconciliation;
2. focused deterministic tests across at least 30 seeds, including different-seed variation;
3. alias consumption, conflict, invalid-input, and no-silent-fallback assertions;
4. structured student/key truth parity;
5. default and maximum page-count, row/column, target, overflow, and completed-example geometry checks;
6. directly affected Grade 1–4 family regressions and shared renderer isolation;
7. proof generation and visual self-review at default, longest/widest, maximum count, mixed mode, and example settings;
8. Grade 5 inventory/reconciliation verifier, catalog audit, customization registry, and `git diff --check`.

## Founder decisions required

- Approve A8/D16/E1/G21 as the initial reconciliation.
- Approve B1 Numeric Patterning as the first implementation batch.
- Decide whether Grade 5 fraction number lines stay within 0–1 or add an approved 0–2/improper-fraction lane.
- Approve honest “complete the equivalent fraction” positioning for ID 28, or require genuine matching architecture and move it to E.
- Decide the exact Grade 5 story default (recommended 8 for the approved work-box geometry; current runtime is 12).
- Decide whether Function Table should receive new visible-table architecture or move E → G.

The preflight is ready to commit as a documentation checkpoint. Grade 5 implementation remains not started until after that commit and founder approval of Batch 1.
