# Grade 3 Founder Review Ledger and Batch Plan

Date: 2026-07-21

Status: canonical 53-resource review ledger. Grade 3 Batch 3 was founder-approved and closed on 2026-07-21; catalog lifecycle status remains separate.

## Grade 2 closeout checkpoint

- Current HEAD is `998b2bd048d82250296aa60790329f6d7901be34` (`feat: complete grade 2 word problem families`) on `main`; the expected commit is the active HEAD and is therefore in active-branch history.
- Its eight committed paths match the Grade 2 closeout brief exactly.
- Grade 2 reconciliation is A35 / D0 / E0 / G17 / Total52. Category E is empty.
- The current audit is Ready 104/104, Generated 213/213, Partial 5/5, Total331. Ready failures are zero. The only seven failures are the established planned `pattern_word_problems` gaps.
- There are no tracked or staged changes at the checkpoint. The existing protected untracked paths are `engine/catalog/`, `engine/visuals/index`, `engine/visuals/renderVisual.js`, `public/styles/images/`, and `review/`.
- No Grade 2 closeout action remains. **GRADE 2 FOUNDER REVIEW CLOSED.**

## Inventory rules and totals

The master catalog contains **53 exact Grade 3 records**: 26 `ready`, 25 `generated`, one `partial`, and one `planned`. The canonical ledger below contains 53 rows and 53 unique IDs. Catalog lifecycle status is not reconciliation status.

The `Status / rec.` column records the reconciliation state, where `UR` means **unreconciled**. The final category in each row is the reviewed row-level classification used by `docs/grade-3-architecture-reconciliation.md`:

- A: complete and should be reconciled as approved/healthy after founder confirmation.
- D: shared-family or structured-truth work remains.
- E: narrow copy/default/layout correction remains.
- G: duplicate, customization-only, planned-gap, or defer candidate.

The pre-Batch-1 scenario was A12 / D13 / E13 / G15 / Total53. Batch 1 moved E3 -> A3; Batch 2 moved E3 -> A3 and Base Ten Blocks E1 -> D1; founder-approved Batch 3 moves E4 -> A4. The current reconciliation is A22 / D14 / E2 / G15 / Total53. Catalog lifecycle status must not be substituted for reconciliation category A.

## Contract and evidence codes

### Variable codes

All Grade 3 variables are **RAW RUNTIME ONLY** unless stated otherwise. No Grade 3 ID is registered in `config/worksheetCustomization/families/`; Addition Facts for Grade 1 remains the only public Resource Detail customization prototype.

| Code | Exact raw inputs and aliases | Current default/valid behavior | Status and safe public candidates |
| --- | --- | --- | --- |
| `VU` | `questionCount`; `questionsPerPage`; `worksheetSeed`; `includeExample` with `completedExample` / `example`; `includeAnswerKey`; route-only `font` / `cols` | Builder default varies by activity; seed is deterministic; answer key uses the generated student truth | `PRESERVED`, `RAW RUNTIME ONLY`; question count, multiple pages, completed example, seed and answer-key choice require family tests before exposure |
| `VA` | `minA`, `maxA`, `minB`, `maxB`, `maxTotal`; `selectedNumbers` / `onlyNumbers`; equation-match `minimumResult`, `maximumResult`, `includeEqualPairs` / `equalPairs`; fact-family `operation`, `mode`, `factFamilyMode`, `factFamilyOperation`, `requireDistinctAddends`; missing-addend/related-subtraction family inputs | Current generic Grade 3 defaults still commonly produce 0-20 facts; not every generator consumes every global option | `PRESERVED` where consumed, otherwise `BYPASSED`; safe candidates are question count, Grade 3 result range, selected numbers and a tested missing-position control |
| `VW` | `minA`, `maxA`, `minB`, `maxB`, `maxTotal`; `selectedNumbers` / `onlyNumbers`; `selectedContexts`, `contexts`, `selectedObjects`, `onlyObjects`; `naturalTakeAwayLanguage` | 12 questions; current Grade 3 operation-specific stories remain largely within 20 | `PRESERVED`, `RAW RUNTIME ONLY`; safe candidates are count, total range, selected numbers, completed example and a small labelled context set |
| `VM` | `minA` / `maxA`, `minB` / `maxB`; `minFactorA` / `maxFactorA`, `minFactorB` / `maxFactorB`; row/column/group/item aliases; `selectedFactors` / `onlyFactors`; side-specific selected aliases; `maxProduct` / `maxTotal`; `responseMode`; `showQuestionSentence`; `taskMode`; `equationSupport` | Grade 3 array/equal-group defaults use factors 2-6; generic multiplication facts use up to 10; model values above 10 are capped | `PRESERVED`, `RAW RUNTIME ONLY`; safe candidates are count, factor range, selected factors, completed example and family-specific response/task mode after proof |
| `VD` | `questionCount`, `worksheetSeed` | Current graph generators consume seed/random but expose no validated scale/category/task contract | `NARROWED`; count is a possible public control only after structured graph truth; scale, categories and graph type are `NOT SUPPORTED` |
| `VF` | `questionCount`, `worksheetSeed` | Existing fraction generators expose little validated teacher control; two activities currently produce zero items or text-only truth | `NARROWED`; denominator/model/task controls are `NOT SUPPORTED` until a structured Grade 3 fraction contract exists |
| `VP` | `operationMode`; `startingValue`; `minStart`, `maxStart`; `sequenceStep`, `minStep`, `maxStep`; `sequenceLength`; `missingTermCount`; `missingTermPlacement` / `missingPlacement`; `questionCount`; `includeExample`; `worksheetSeed` | Arithmetic add/subtract patterns; 12 default student items; examples are additional; task-specific balanced pagination | `PRESERVED`, `RAW RUNTIME ONLY`; safe candidates are count, pattern type, steps, start range, sequence length, write/missing count and completed example |
| `VV` | `minA`, `maxA`; number-line `minValue`, `maxValue`, `allowedIntervals`, `selectedIntervals`, `allowEndpointTargets`, `selectedNumbers`; compare `promptStyle` / `promptType`; number words `numberWordMode` / `mode`; expanded form `answerStyle` | Current Grade 3 forms use 3-digit values; forms default to 45 items; base-ten defaults to 10; number words 12; number line 10 | Mixed `PRESERVED` / `BYPASSED`; safe candidates are count, 3-digit range, selected numbers, completed example and a family-specific representation direction |
| `VC` | Catalog-fixed `questionCount` 6 for Quick Checks or 3 for Exit Tickets, plus skill-specific 100-999 range and answer style | Compact assessment renderers own the approved two-page contract | `PRESERVED`; do not expose raw layout controls. These resources are already approved and are not implementation candidates |

Raw options enter through `normalizeCatalogWorksheetOptions`, then the catalog builder supplies one content object to preview and PDF. The answer key is derived from the same generated items. That supports parity, but it does not make a raw option public: public use still requires registry declaration, teacher label, validation, normalization, preview/PDF/key tests and family documentation.

### Copy/footer codes

| Code | Current student instruction | Current footer contract |
| --- | --- | --- |
| `CAS` | Activity-specific addition/subtraction instruction; several still use `Students ...` or `Generated worksheet ...` copy | `Grade 3 • Math • Addition & Subtraction • addition_subtraction_facts` or `... • addition_subtraction_word_problems` |
| `CD` | Text-based read/complete/match/interpret/graph-question wording | `Grade 3 • Math • Data & Graphing • data_display_graphing` |
| `CF` | Activity-specific fraction wording; some still say `Generated worksheet ...` | `Grade 3 • Math • Fractions • fraction_equivalence` |
| `CM` | Activity-specific multiplication/division wording | `Grade 3 • Math • Multiplication & Division •` internal skill slug |
| `CP` | `Extend each pattern. Write the next number.` / `Write the rule for each pattern.` / `Write the missing number in each pattern.` | `Grade 3 • Math • Patterning & Algebra` |
| `CV` | Activity-specific place-value instruction | `Grade 3 • Math • Place Value •` internal skill slug |
| `CC` | Catalog-approved Quick Check/Exit Ticket directions | Compact assessment renderer; two-page student/key contract |

Internal footer slugs and unnecessary `— Grade 3` suffixes are real pre-proof copy debt even when mathematical truth is already healthy. A narrow correction must not replace or bypass the family generator or its variables.

### Evidence codes

| Code | Existing evidence |
| --- | --- |
| `E0` | Audit and generic worksheet-builder coverage only; no focused Grade 3 proof |
| `E1` | Current 85-worksheet founder-review packet contains the ready Grade 3 default PDF |
| `E2` | Shared numeric-patterning focused test and `review/numeric-patterning-family/` proof |
| `E3` | Arrays/equal-groups focused family proof, including Grade 3 defaults and isolation |
| `E4` | Multiplication-fluency/missing-factor inheritance proofs, default/example/multipage/range |
| `E5` | Place-value forms founder/inheritance proofs, default/example/layout variants |
| `E6` | Prior Quick Check or Exit Ticket implementation, route/PDF verification, Teacher QA and Curriculum Alignment approval recorded in `/docs`; no current production proof file is required |

## Canonical 53-resource ledger

`Current/approved default` uses `—` when no founder-approved default exists; the parenthetical value is current runtime evidence, not approval. Page counts for ready worksheets come from the existing founder-review packet; compact assessments use their documented two-page contract.

| Exact ID | Current title | Status / rec. | Last relevant commit | Active generator; renderer/layout | Current/approved default; range | Copy / vars / evidence | Current defect; nearest approved family | Classification / risk / action / batch / proof / projected |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `g3_compare_3_digit_numbers_exit_ticket` | Compare 3-Digit Numbers Exit Ticket | ready / UR | `be08da5` | `compareNumbers.js`; Exit Ticket renderer | 3 / 2 pages; 100-999 | CC / VC / E6 | none; approved Grade 3 compact comparison | ALREADY COMPLETE / none / hold / — / none / A |
| `g3_compare_3_digit_numbers_quick_check` | Compare 3-Digit Numbers Quick Check | ready / UR | `be08da5` | `compareNumbers.js`; Quick Check renderer | 6 / 2 pages; 100-999 | CC / VC / E6 | none; approved Grade 3 compact comparison | ALREADY COMPLETE / none / hold / — / none / A |
| `g3_complete_a_graph` | Grade 3 Data Questions | ready / UR | `003584d` | `completeGraph.js`; equation-practice text layout | 12 / 3 pages; values about 0-10 | CD / VD / E1 | title/task says graph but output is text-data questions; Grade 2 structured pictographs | NEW ARCHITECTURE NEEDED / Full / structured data decision / B7 / 1 / D |
| `g3_equal_groups_multiplication` | Equal Groups for Multiplication | ready / UR | `003584d` | `equalGroups.js`; model interpretation | 12 / 3 pages; factors 2-6, product <=36 | CM / VM / E3 | no current truth defect; approved arrays/equal-groups family | ALREADY COMPLETE / none / hold / — / none / A |
| `g3_equal_sharing_division` | Equal Sharing Division | partial / UR | `3f81c22` | `equalGroups.js`; model interpretation | — (12, 3/page current); factors 2-6 | CM / VM / E3 | multiplication-owned equal-groups path needs explicit division truth and response contract; Grade 2 Share Fairly / equal groups | SHARED-FAMILY EXTENSION NEEDED / Standard / verify-only then adapter / B5 / 1 / D |
| `g3_expanded_form_to_standard_form_exit_ticket` | Expanded Form to Standard Form Exit Ticket | ready / UR | `69fc4b1` | `standardForm.js`; Exit Ticket renderer | 3 / 2 pages; 100-999 | CC / VC / E6 | none; approved compact standard form | ALREADY COMPLETE / none / hold / — / none / A |
| `g3_expanded_form_to_standard_form_quick_check` | Expanded Form to Standard Form Quick Check | ready / UR | `4db2993` | `standardForm.js`; Quick Check renderer | 6 / 2 pages; 100-999 | CC / VC / E6 | none; approved compact standard form | ALREADY COMPLETE / none / hold / — / none / A |
| `g3_fact_families_multiplication_division` | Multiplication and Division Fact Families | ready / UR | `84c8702` | `factFamily.js`; matching | 12 / 3 pages; factors 1-10 | CM / VM / E1 | prior duplicate-prompt polish accepted; approved fact-family resource | ALREADY COMPLETE / none / hold / — / none / A |
| `g3_graph_questions` | Graph Questions | ready / UR | `003584d` | `graphQuestions.js`; equation-practice text layout | 12 / 3 pages; small counts | CD / VD / E1 | no shared visible graph truth; Grade 2 Read/Interpret Pictograph | NEW ARCHITECTURE NEEDED / Full / define distinct graph-question role / B7 / 1 / D |
| `g3_interpret_data` | Interpret Data | ready / UR | `003584d` | `interpretData.js`; equation-practice text layout | 12 / 3 pages; small counts | CD / VD / E1 | text prompt pool lacks a dependable shared data display; Grade 2 Interpret Pictograph | NEW ARCHITECTURE NEEDED / Full / shared structured display / B7 / 1 / D |
| `g3_match_data_to_graph` | Match Data Descriptions | ready / UR | `003584d` | `matchDataToGraph.js`; equation-practice text layout | 12 / 3 pages; text choices | CD / VD / E1 | title/response is not a strong visual match task; Grade 2 Matching Pictograph | NEW ARCHITECTURE NEEDED / Full / structured matching role / B7 / 1 / D |
| `g3_missing_factors` | Missing Factors Within Multiplication Facts | ready / UR | `003584d` | `missingFactor.js`; fluency grid | 60 / 2 pages; factors 1-10 | CM / VM / E4 | no current blocker; approved inheritance proof exists | ALREADY COMPLETE / none / hold / — / none / A |
| `g3_multiplication_arrays` | Multiplication with Arrays | ready / UR | `15625c3` | `array.js`; model interpretation | 10 / 2 pages; factors 2-6 | CM / VM / E3 | no current blocker; approved shared array family | ALREADY COMPLETE / none / hold / — / none / A |
| `g3_multiplication_facts` | Multiplication Facts | ready / UR | `168da63` | `multiplicationBasic.js`; fluency grid | 60 / 3 pages; factors 0-10 | CM / VM / E4 | no current blocker; approved multiplication-fluency family | ALREADY COMPLETE / none / hold / — / none / A |
| `g3_place_value_hundreds_tens_ones_quick_check` | Hundreds, Tens, and Ones Quick Check | ready / UR | `0b0d498` | `expandedForm.js`; Quick Check renderer | 6 / 2 pages; 100-999 | CC / VC / E6 | none; approved compact place value | ALREADY COMPLETE / none / hold / — / none / A |
| `g3_read_a_graph` | Read Data and Answer Questions | ready / UR | `168da63` | `readGraph.js`; equation-practice text layout | 12 / 3 pages; small counts | CD / VD / E1 | text questions do not share a durable visible graph model; Grade 2 Read Pictograph | NEW ARCHITECTURE NEEDED / Full / shared structured display / B7 / 1 / D |
| `grade3_addition_subtraction_facts_equation_match` | Equal or Not Equal? | generated / A | committed in this closeout | `equationMatch.js`; matching | 12 / 2 pages; results 0-100 | CAS / VA / focused B3 | founder-approved exact relational comparison path with balanced truth | FOUNDER-APPROVED / complete / hold / B3 / approved / A |
| `grade3_addition_subtraction_facts_fact_family` | Addition and Subtraction Fact Families | generated / A | committed in this closeout | `factFamily.js`; fact-family grid | 12 / 2 pages; totals <=100 | CAS / VA / focused B3 | founder-approved two-column family truth, distinct defaults and selected numbers | FOUNDER-APPROVED / complete / hold / B3 / approved / A |
| `grade3_addition_subtraction_facts_fact_fluency` | Addition and Subtraction Facts | generated / A | committed in this closeout | `factFluency.js`; equation-practice | 24 / 2 pages; non-negative results <=100 | CAS / VA / focused B3 | founder-approved balanced mixed-operation sequence and density | FOUNDER-APPROVED / complete / hold / B3 / approved / A |
| `grade3_addition_subtraction_facts_missing_addend` | Missing Addends | generated / A | committed in this closeout | `missingAddend.js`; fluency grid | 24 / 2 pages; totals <=100 | CAS / VA / focused B3 | founder-approved balanced positions and side-specific range truth | FOUNDER-APPROVED / complete / hold / B3 / approved / A |
| `grade3_addition_subtraction_facts_related_subtraction` | Related Subtraction — Grade 3 | generated / UR | `3783fd4` | `relatedSubtraction.js`; fluency grid | — (12 current); <=20 | CAS / VA / E0 | output is ordinary subtraction, not a visible related-fact task; Grade 2 approved deferral | DUPLICATE — DEFER / none / future relationship preset only / — / none / G |
| `grade3_addition_subtraction_facts_ten_frame` | Ten Frame Practice — Grade 3 | generated / UR | `003584d` | `tenFrame.js`; visual model | — (10 current); 0-10 | CAS / VU / E0 | lower-grade representation adds little Grade 3 launch value; approved Grade 1 ten-frame family | DUPLICATE — DEFER / none / customization/intervention only / — / none / G |
| `grade3_addition_subtraction_facts_word_problems` | Word Problems — Grade 3 | generated / UR | `003584d` | `wordProblems.js`; word-problem layout | — (12 current); <=20 | CAS / VW / E0 | generic shell duplicates the three operation-specific resources | DUPLICATE — DEFER / none / mixed-review preset only / — / none / G |
| `grade3_addition_subtraction_word_problems_addition_word_problem` | Addition Word Problem — Grade 3 | generated / UR | `003584d` | `wordProblems.js`; word-problem layout | — (12 current, 3/page); totals <=20 | CAS / VW / E0 | internal copy, shallow range and no Grade 3 context contract; Grade 2 Addition Word Problems Within 100 | SHARED-FAMILY EXTENSION NEEDED / Standard / Grade 3 story adapter / B4 / 1 / D |
| `grade3_addition_subtraction_word_problems_missing_addend_word_problem` | Missing Addend Word Problem — Grade 3 | generated / UR | `003584d` | `wordProblems.js`; word-problem layout | — (12 current, 3/page); totals <=20 | CAS / VW / E0 | internal copy, shallow range and repetitive context; Grade 2 Missing Addend Word Problems | SHARED-FAMILY EXTENSION NEEDED / Standard / Grade 3 story adapter / B4 / 1 / D |
| `grade3_addition_subtraction_word_problems_subtraction_word_problem` | Subtraction Word Problem — Grade 3 | generated / UR | `0a1db99` | `wordProblems.js`; word-problem layout | — (12 current, 3/page); <=20 | CAS / VW / E0 | docs already identify within-20 depth as too shallow; Grade 2 Take Away Word Problems | SHARED-FAMILY EXTENSION NEEDED / Standard / Grade 3 story adapter / B4 / 1 / D |
| `grade3_data_display_graphing_complete_graph` | Complete a Graph — Grade 3 | generated / UR | `21fb0b4` | `completeGraph.js`; equation-practice text layout | — (12 current) | CD / VD / E0 | duplicate of `g3_complete_a_graph`, which itself needs structured truth | DUPLICATE — DEFER / none / do not implement / — / none / G |
| `grade3_data_display_graphing_graph_questions` | Graph Questions — Grade 3 | generated / UR | `003584d` | `graphQuestions.js`; equation-practice text layout | — (12 current) | CD / VD / E0 | duplicate of ready `g3_graph_questions` | DUPLICATE — DEFER / none / do not implement / — / none / G |
| `grade3_data_display_graphing_graph_word_problems` | Graph Word Problems — Grade 3 | generated / UR | `003584d` | no registered generator; equation-practice | — (0 items) | CD / VD / E0 | missing generator and overlaps structured interpretation/application | DUPLICATE — DEFER / none / reconsider only with distinct multi-step role / — / none / G |
| `grade3_data_display_graphing_interpret_data` | Interpret Data — Grade 3 | generated / UR | `ae88c6e` | `interpretData.js`; equation-practice text layout | — (12 current) | CD / VD / E0 | duplicate of ready `g3_interpret_data` | DUPLICATE — DEFER / none / do not implement / — / none / G |
| `grade3_data_display_graphing_match_data_to_graph` | Match Data to Graph — Grade 3 | generated / UR | `45399f4` | `matchDataToGraph.js`; equation-practice text layout | — (12 current) | CD / VD / E0 | duplicate of ready `g3_match_data_to_graph` | DUPLICATE — DEFER / none / do not implement / — / none / G |
| `grade3_data_display_graphing_read_graph` | Read a Graph — Grade 3 | generated / UR | `ae88c6e` | `readGraph.js`; equation-practice text layout | — (12 current) | CD / VD / E0 | duplicate of ready `g3_read_a_graph` | DUPLICATE — DEFER / none / do not implement / — / none / G |
| `grade3_fraction_equivalence_compare_fractions` | Compare Fractions — Grade 3 | ready / UR | `003584d` | `compareFractions.js`; equation-practice | 12 / 2 pages; simple fractions | CF / VF / E1 | title/footer and prompt variety need founder confirmation; approved Grade 2 concrete-fraction visual language | NARROW CORRECTION NEEDED / Fast / preserve truth, clean copy/variety / B6 / 1 / E |
| `grade3_fraction_equivalence_fraction_number_line` | Fraction Number Line — Grade 3 | generated / UR | `003584d` | `fractionNumberLine.js`; equation-practice | — (12 current) | CF / VF / E0 | current response is not a dependable structured number-line visual | NEW ARCHITECTURE NEEDED / Standard / structured model or defer / B6 / 1 / D |
| `grade3_fraction_equivalence_fraction_word_problems` | Fraction Word Problems — Grade 3 | generated / UR | `7d372b9` | no registered `fraction_word_problems` generator; equation-practice | — (0 items) | CF / VF / E0 | zero items and no approved Grade 3 fraction-story truth | NEW ARCHITECTURE NEEDED / Standard / define distinct role or defer / B6 / 1 / D |
| `grade3_fraction_equivalence_match_equivalent_fractions` | Match Equivalent Fractions — Grade 3 | ready / UR | `23dfc06` | `matchEquivalentFractions.js`; equation-practice | 12 / 2 pages; equivalent pairs | CF / VF / E1 | accepted prompt repetition plus stale title/footer; nearest approved Grade 3 compare-fraction resource | NARROW CORRECTION NEEDED / Fast / copy/variety only / B6 / 1 / E |
| `grade3_fraction_equivalence_shade_fraction_models` | Shade Fraction Models — Grade 3 | generated / UR | `d41a04d` | `shadeFractionModels.js`; equation-practice | — (12 current) | CF / VF / E0 | current generic path lacks the structured drawable/key model proven in Grade 2 | SHARED-FAMILY EXTENSION NEEDED / Standard / Grade 3 structured visual adapter / B5 / 1 / D |
| `grade3_multiplication_facts_arrays` | Arrays — Grade 3 | generated / UR | `8fba970` | `array.js`; model interpretation | — (10 current); factors 2-6 | CM / VM / E3 | duplicate of ready `g3_multiplication_arrays`; docs explicitly defer overlap | DUPLICATE — DEFER / none / do not implement / — / none / G |
| `grade3_multiplication_facts_equal_groups` | Equal Groups — Grade 3 | ready / UR | `3f81c22` | `equalGroups.js`; model interpretation | 12 / 3 pages; factors 2-6 | CM / VM / E3 | prior founder/shared-family proof is current | ALREADY COMPLETE / none / hold / — / none / A |
| `grade3_multiplication_facts_missing_factor` | Missing Factors — Grade 3 | generated / UR | `ddd9338` | `missingFactor.js`; fluency grid | — (60 current); factors 1-10 | CM / VM / E4 | duplicate of ready `g3_missing_factors` | DUPLICATE — DEFER / none / do not implement / — / none / G |
| `grade3_multiplication_facts_skip_counting` | Skip Counting — Grade 3 | generated / UR | `003584d` | `skipCounting.js`; equation-practice | — (10 current); steps to about 170 | CM / VM / E0 | generic entry is better as selected-step customization/preset | DUPLICATE — DEFER / none / future customization only / — / none / G |
| `grade3_multiplication_facts_word_problems` | Word Problems — Grade 3 | ready / UR | `998b2bd` | `wordProblems.js`; word-problem layout | 12 / 3 approved pages; factors 2-10 | CM / VM / E1 | current equal-groups wording was previously accepted with minor repetition | ALREADY COMPLETE / none / hold unless founder reopens / — / none / A |
| `grade3_patterning_and_algebra_extend_pattern` | Extend the Pattern | ready / A | committed in this closeout | `numericPatternRules.js` via `extendPattern.js`; task layout | 12 / 2 pages; add/subtract arithmetic rules | CP / VP / E2 | founder-approved public copy; mathematics/layout unchanged | FOUNDER-APPROVED / complete / hold / B1 / approved / A |
| `grade3_patterning_and_algebra_function_table` | Function Table — Grade 3 | generated / UR | `feb3bc1` | `functionTable.js`; function-table layout | — (12 current, 6/page) | CP / VP / E2 | docs explicitly keep public Function Table layout deferred/weak | DUPLICATE — DEFER / none / founder decision only / — / none / G |
| `grade3_patterning_and_algebra_identify_pattern_rule` | Identify the Pattern Rule | ready / A | committed in this closeout | `numericPatternRules.js` via `identifyPatternRule.js`; task layout | 12 / 4 pages; add/subtract rules | CP / VP / E2 | founder-approved public copy; mathematics/layout unchanged | FOUNDER-APPROVED / complete / hold / B1 / approved / A |
| `grade3_patterning_and_algebra_missing_value_pattern` | Find the Missing Number | ready / A | committed in this closeout | `numericPatternRules.js` via `missingValuePattern.js`; task layout | 12 / 2 pages; add/subtract rules | CP / VP / E2 | founder-approved public copy; mathematics/layout unchanged | FOUNDER-APPROVED / complete / hold / B1 / approved / A |
| `grade3_patterning_and_algebra_pattern_word_problems` | Pattern Word Problems — Grade 3 | planned / UR | `003584d` | no registered generator; equation-practice | — (0; audit gap) | CP / VP / E0 | one of seven established planned gaps; no distinct launch contract | DUPLICATE — DEFER / none / future founder preflight only / — / none / G |
| `grade3_place_value_representation_base_ten_blocks` | Base Ten Blocks — Grade 3 | ready / D | committed in this closeout | `baseTenBlocks.js`; visual model | 10 / 2 pages; current values 10-99 | CV / VV / E1 | 3-digit requests decompose 345 as 34 tens + 5 ones with no hundreds block; selected-number inputs are bypassed | SHARED-FAMILY EXTENSION NEEDED / Standard / future hundreds-truth preflight; no implementation / B2 split / none / D |
| `grade3_place_value_representation_compare_numbers` | Compare Numbers — Grade 3 | generated / UR | `be08da5` | `compareNumbers.js`; fluency grid | — (12 current); 3-digit values | CV / VV / E0 | explicitly held because Quick Check and Exit Ticket already cover this skill | DUPLICATE — DEFER / none / no worksheet implementation / — / none / G |
| `grade3_place_value_representation_expanded_form` | Expanded Form | ready / A | committed in this closeout | `expandedForm.js`; compact representation | 45 / 2 pages; 100-999 | CV / VV / E5 | founder-approved public title/footer; truth/layout unchanged | FOUNDER-APPROVED / complete / hold / B2 / approved / A |
| `grade3_place_value_representation_number_line_identify` | Number Line — Grade 3 | generated / UR | `df1ae38` | `numberLineIdentify.js`; visual model | — (10 current, 5/page); current small line | CV / VV / E0 | current default does not express an approved Grade 3 number-line range/interval contract | SHARED-FAMILY EXTENSION NEEDED / Standard / Grade 3 parameter adapter / B5 / 1 / D |
| `grade3_place_value_representation_number_word_match` | Write Number Words | ready / A | committed in this closeout | `numberWordMatch.js`; existing number-word writing layout | 12 / 2 pages; 100-999 | CV / VV / E1 | founder-approved writing task, title, instruction and footer | FOUNDER-APPROVED / complete / hold / B2 / approved / A |
| `grade3_place_value_representation_standard_form` | Standard Form | ready / A | committed in this closeout | `standardForm.js`; compact representation | 45 / 2 pages; 100-999 | CV / VV / E5 | founder-approved public title/footer; current default is 2 pages | FOUNDER-APPROVED / complete / hold / B2 / approved / A |

## Completed-work findings

- The 12 projected-A records above are not implementation candidates. Their active paths and prior approval evidence remain current.
- Recent Grade 1/2 shared-family commits changed several Grade 3 paths. The last-relevant-commit column records those changes so later work does not fork or bypass the shared runtime.
- The three ready numeric-patterning resources, Grade 3 forms, arrays/equal-groups resources and multiplication inheritance resources already have working family truth. Where a row is in E, only the documented narrow copy/default issue is in scope.
- The six generated data records, generated arrays/missing-factor records, generic Grade 3 addition/subtraction word-problem shell, ten-frame shell, related-subtraction shell, skip-counting shell, Function Table, Pattern Word Problems and held Compare Numbers worksheet are not forced into implementation.
- The five ready data worksheets have real current defects despite `ready` status: the active output is text-led and lacks the structured visible graph truth required by the present pre-proof standard. They require founder role decisions before code.
- `grade3_patterning_and_algebra_pattern_word_problems` remains one of the seven known planned audit gaps. This plan does not convert that expected gap into a launch obligation.

## Proposed family batches

### B1 — Numeric Patterning Public-Copy Closure (founder-approved and closed)

- Exact IDs: `grade3_patterning_and_algebra_extend_pattern`; `grade3_patterning_and_algebra_identify_pattern_rule`; `grade3_patterning_and_algebra_missing_value_pattern`.
- Shared family: `numericPatternRules.js`, existing task-specific layouts, `VP` contract.
- Completed-work finding: mathematical truth, pagination, examples and focused proof already exist; only public title/copy verification remains.
- Preserve: all `VP` inputs, 12 student questions, task-specific page counts, extra completed example, deterministic seed and key parity.
- Safe future controls: question count, add/subtract pattern type, step choices, starting range, sequence length, missing/continuation count and completed example. Keep diagnostics and raw layout controls hidden.
- Lane/files/tests: Fast; likely catalog/runtime copy adapter, one focused Grade 3 test, proof generator and this ledger. Reuse `scripts/testNumericPatterningRuntime.js`.
- Proof burden: three default PDFs in one packet; one local commit only after founder approval.
- Movement applied: E3 -> A3; current A15 / D13 / E10 / G15 / Total53.
- Stop if any generator, renderer, mathematical truth or public customization registry change becomes necessary.

#### B1 closeout checkpoint — founder-approved and locally committed

- Completed-work check: all three exact IDs remain active `ready` catalog records on the shared `numericPatternRules.js` family and existing task-specific Patterning layouts. Generator truth, 12-question defaults, completed-example aliases, deterministic seeds, student/key parity and pagination were already complete.
- Narrow correction applied: the public titles are now `Extend the Pattern`, `Identify the Pattern Rule` and `Find the Missing Number`; the approved instructions and shared `Grade 3 • Math • Patterning & Algebra` footer remain unchanged.
- Preserved raw-variable contract: `operationMode`, `startingValue`, `minStart`, `maxStart`, `sequenceStep`, `minStep`, `maxStep`, `sequenceLength`, `missingTermCount`, `missingTermPlacement`, `missingPlacement`, `questionCount`, `includeExample`, `completedExample`, `example` and `worksheetSeed` remain runtime-supported where applicable. No public customization controls were registered.
- Verification packet: three default student-and-answer-key PDFs are grouped under `review/grade-3-numeric-patterning-batch-1/founder-review/`, with focused Grade 3 Batch 1 coverage plus the established cross-grade numeric-patterning regression suite.
- Founder verdict on 2026-07-21: `GRADE 3 BATCH 1 FOUNDER-APPROVED`; no correction round required.
- Reconciliation movement applied: E3 -> A3, producing A15 / D13 / E10 / G15 / Total53. The three catalog records remain `ready`; no promotion or demotion occurred.
- Commit record: committed in this closeout; the authoritative commit identifier is retained in git history rather than self-referenced inside the commit.

### B2 — Place-Value Representation Copy and Default Closure (founder-approved and closed)

- Exact IDs: `grade3_place_value_representation_base_ten_blocks`; `grade3_place_value_representation_expanded_form`; `grade3_place_value_representation_number_word_match`; `grade3_place_value_representation_standard_form`.
- Implemented IDs: `grade3_place_value_representation_expanded_form`; `grade3_place_value_representation_number_word_match`; `grade3_place_value_representation_standard_form`.
- Split ID: `grade3_place_value_representation_base_ten_blocks` — `SHARED-FAMILY EXTENSION NEEDED` because the active generator emits repeated tens instead of hundreds blocks for 3-digit requests and bypasses selected numbers.
- Shared family: existing place-value generators and compact/writing layouts; no generator, renderer, visual-system or public customization registration was added.
- Preserved defaults: 45-item Expanded Form, 12-item Write Number Words, 45-item Standard Form; 100-999; 2/2/2 total default PDF pages; deterministic seeds, extra examples and key truth.
- Public copy: `Expanded Form`, `Write Number Words`, `Standard Form`; task-matched instructions; shared `Grade 3 • Math • Place Value` footer.
- Proof packet: three default PDFs under `review/grade-3-place-value-batch-2/founder-review/`. Base Ten Blocks has no Batch 2 proof.
- Founder-approved movement: the three implemented resources move E3 -> A3 and Base Ten Blocks moves E1 -> D1, producing A18 / D14 / E6 / G15 / Total53.

#### B2 variable checkpoint

All supported controls remain raw-runtime only; no Grade 3 family is publicly registered.

| Input | Alias | Default / valid values | Normalization and consumption | Preview / PDF / key | Status / coverage |
| --- | --- | --- | --- | --- | --- |
| `questionCount` | — | Expanded/Standard 45; Number Words 12; positive integer | global numeric normalization; worksheet builder count | exact item count in all outputs | PRESERVED / RAW RUNTIME ONLY / focused |
| `questionsPerPage` | — | family default; positive integer override | global numeric normalization plus exact B2 layout adapter | layout and PDF paginate from the same value; key follows | PRESERVED / RAW RUNTIME ONLY / focused |
| `minA`, `maxA` | — | 100, 999; numeric range | forms consume through `placeValueFormValues.js`; Number Words through its generator | identical range in preview/PDF/key | PRESERVED / RAW RUNTIME ONLY / focused |
| `minValue`, `maxValue` | — | no contract for these three IDs | reserved for other place-value activities such as number lines | not consumed here | NOT SUPPORTED |
| `selectedNumbers` | `onlyNumbers` | integer list | consumed by Expanded/Standard form value pools; currently bypassed by Number Words and split Base Ten Blocks | forms preserve selected truth in preview/PDF/key | PRESERVED for forms; BYPASSED for Number Words/Base Ten / focused |
| `numberWordMode` | `mode` | `numeral_to_word`, `word_to_numeral` | Grade 3 Number Words adapter and generator | title, instruction, response target and key follow direction | PRESERVED / RAW RUNTIME ONLY / focused |
| `promptStyle` | `promptType` | default `number_only`; current generator-compatible string | exact Number Words option adapter | default removes repeated task prose; PDF/key match | PRESERVED / RAW RUNTIME ONLY / focused |
| `answerStyle` | — | default expanded sum; `hundreds_tens_ones` for Expanded Form | consumed only by `expandedForm.js` and its existing layout mode | prompt and key truth remain paired | PRESERVED for Expanded; NOT SUPPORTED for Standard/Number Words / focused |
| `includeExample` | `completedExample`, `example` | boolean; default false | global boolean normalization; example is additional | preview/PDF/key share the extra example | PRESERVED / RAW RUNTIME ONLY / focused |
| `worksheetSeed` | — | deterministic string | shared seeded generator path | same content in preview/PDF/key | PRESERVED / RAW RUNTIME ONLY / focused |
| `includeAnswerKey` | — | boolean; route/render default true | renderer option, not mathematical generation | toggles key pages without changing student truth | PRESERVED / RAW RUNTIME ONLY / focused |

#### B2 closeout checkpoint — founder-approved and locally committed

- All three implemented catalog records remain `ready`; Base Ten Blocks remains `ready` and unchanged.
- Focused Batch 2 tests cover exact copy, 100-999 defaults, counts, 2/2/2 PDFs, selected form values, number-word direction aliases, `answerStyle`, completed-example aliases, same-seed truth, student/key parity and Grade 1/2 isolation.
- Grade 1 Number Representation and Grade 1 Category C regressions pass. The stale reconciliation-only expectation in `testGrade2CategoryEBatch1.js` was updated from A30/E7 to the approved Grade 2 A35/D0/E0/G17/Total52 source of truth; its runtime assertions pass unchanged.
- Catalog audit remains Ready 104/104, Generated 213/213, Partial 5/5, Total331, with only the seven established planned `pattern_word_problems` gaps.
- Three default proofs were generated; all six letter-size pages were raster-inspected with no clipping, overlap, target misalignment, long-answer overflow or footer pressure.
- Founder verdict on 2026-07-21: `GRADE 3 BATCH 2 FOUNDER-APPROVED — THREE RESOURCES`; no correction round was required.
- Base Ten Blocks is founder-approved for E -> D reclassification only. No Base Ten generator, renderer, visual system or catalog code changed, and no Base Ten proof was generated.
- Final reconciliation is A18 / D14 / E6 / G15 / Total53. All four catalog records remain `ready`; no promotion or demotion occurred.
- No Grade 3 public customization family was registered.
- Commit record: committed in this closeout; git history is the authoritative commit identifier.

### B3 — Addition/Subtraction Fact Relationships (founder-approved and closed)

- Exact IDs: `grade3_addition_subtraction_facts_equation_match`; `grade3_addition_subtraction_facts_fact_family`; `grade3_addition_subtraction_facts_fact_fluency`; `grade3_addition_subtraction_facts_missing_addend`.
- Shared family: existing Grade 2-approved fact/relation generators and matching/fluency layouts; `VA` contract.
- Implemented IDs: all four exact IDs above; no resource was split.
- Completed-work finding: all four catalog records remained `generated` and the reported defects were active. Equation Match was inactive relational truth rather than copy-only debt; Fact Fluency was addition-only because its Grade 3 ID contains `addition`; Missing Addends fixed every blank in the first position. Existing generators and renderers were sufficient for exact adapters.
- Public defaults: Equation Match 12 items, balanced 6/6, results 0-100; Fact Families 12 groups, four facts, distinct addends and totals <=100; Fact Fluency 24 mixed facts, balanced 12/12 and non-negative results <=100; Missing Addends 24 items, balanced positions and totals <=100. All four default PDFs remain two pages including the answer key.
- Range/density gate: 100 is the tested safe ceiling for this foundational mental-math family. The 12/12/24/24 counts render without smaller text, truncation, hidden overflow or weakened response targets. Fact Families uses two columns so all four equations and three-digit key values retain dependable separation. Values to 1,000 remain teacher/future scope, not a default.
- Preserve: exact count, side-specific ranges, total/result caps, selected-number restrictions, operation/mode choices, fact-family direction, missing-position aliases, completed examples, deterministic generation and key parity.
- Public registration: none. All controls remain raw-runtime only.
- Lane/files/tests: exact Grade 3 adapters in the existing runtime/catalog services and problem generators, one focused four-resource suite, directly affected Grade 1/2 regressions and one proof generator.
- Proof burden: four default PDFs in `review/grade-3-addition-subtraction-batch-3/founder-review/`; no stress proof was needed after focused override and pagination coverage.
- Movement applied: E4 -> A4; current A22 / D14 / E2 / G15 / Total53.
- Stop if the proposed range makes the existing density or answer targets unsafe.

#### B3 variable checkpoint — founder-approved

No Grade 3 customization family is publicly registered. A raw runtime input is not a public teacher control.

| Input | Aliases | Default / valid behavior | Normalization and generator consumption | Preview / PDF / key | Status / coverage |
| --- | --- | --- | --- | --- | --- |
| `questionCount` | — | 12 Equation/Family; 24 Fluency/Missing; positive integer | exact B3 normalizer; existing worksheet builder | exact generated count; examples remain additional | PRESERVED / RAW RUNTIME ONLY / focused |
| `questionsPerPage` | — | 12 or 24 family default; positive override | global numeric normalization and exact layout adapter | preview layout and student/key pagination share value | PRESERVED / RAW RUNTIME ONLY / focused |
| `minimumResult`, `maximumResult` | `maxTotal` as Equation maximum fallback | 0-100 default; ordered range | Equation Match adapter and relational candidate pool | both expression values and key symbol stay in range | PRESERVED / RAW RUNTIME ONLY / focused |
| `includeEqualPairs` | `equalPairs` | balanced by default; false removes equal pairs; numeric `equalPairs` fixes the count | global boolean normalization plus Grade 3 balanced pool | symbol target and key mirror exact truth | PRESERVED / RAW RUNTIME ONLY / focused |
| `minA`, `maxA`, `minB`, `maxB`, `maxTotal` | — | Fact Family 1-50 sides; Fluency/Missing 0-100 sides; totals/results <=100 | exact B3 normalization; each generator consumes side ranges and cap | preview/PDF/key use identical arithmetic | PRESERVED / RAW RUNTIME ONLY / focused |
| `selectedNumbers` | `onlyNumbers` | integer list; restricts consumed operand pools | global list normalization; Family, Fluency and Missing generators consume it | same restricted facts in preview/PDF/key | PRESERVED / RAW RUNTIME ONLY / focused |
| `operation` | `mode`; Fact Family also `factFamilyOperation`, `factFamilyMode` | Fluency mixed default or addition/subtraction; Family all/addition-only/subtraction-only | exact/default adapter and existing family modes | title describes default mix; overrides retain mathematical truth | PRESERVED / RAW RUNTIME ONLY / focused |
| `requireDistinctAddends` | — | true by default for Grade 3 Fact Families | exact boolean normalization and existing family generator | four related facts remain valid in preview/PDF/key | PRESERVED / RAW RUNTIME ONLY / focused |
| `missingPosition` | `missingAddendPosition` | mixed default; first/second aliases supported | exact adapter and balanced missing-addend sequence | target position and key value remain paired | PRESERVED / RAW RUNTIME ONLY / focused |
| `includeExample` | `completedExample`, `example` | false; true adds one completed item | global and exact boolean normalization; worksheet builder adds one | preview/PDF/key count and example marking agree | PRESERVED / RAW RUNTIME ONLY / focused |
| `worksheetSeed` | — | deterministic string | shared seeded random path | same seed produces identical truth | PRESERVED / RAW RUNTIME ONLY / focused |
| `includeAnswerKey` | — | renderer option; default true | render-time choice, not arithmetic generation | toggles key page without changing student truth | PRESERVED / RAW RUNTIME ONLY / focused |

#### B3 closeout checkpoint — founder-approved and locally committed

- Focused coverage verifies exact titles, instructions, footer, 12/12/24/24 defaults, 0-100 truth, balanced comparison states, balanced operation/blank positions, all four fact-family equations, selected operands, side-specific ranges, mode aliases, completed-example aliases, deterministic seeds, two-page defaults, preview/PDF/key parity and Grade 1/2 isolation.
- Grade 1 Fluency/Comparison, Grade 2 Addition/Subtraction Category C, corrected Grade 2 Category D Low-Risk and corrected Grade 2 Category E Batch 2 regressions pass. The two Grade 2 suites received reconciliation-only maintenance to the approved A35 / D0 / E0 / G17 / Total52 source of truth; their runtime assertions remain unchanged.
- Catalog audit remains Ready 104/104, Generated 213/213, Partial 5/5, Total331, with only the seven established planned `pattern_word_problems` gaps.
- Four default letter-size proofs were generated and all eight pages were raster-inspected. The initial three-column Fact Families key was too tight; the final two-column student/key layout has clear separation. Final proofs have no clipping, overlap, cramped targets or footer pressure.
- Founder verdict on 2026-07-21: `GRADE 3 BATCH 3 FOUNDER-APPROVED — FOUR RESOURCES`; no correction round was required and no resource was split.
- The four records remain `generated`; no lifecycle promotion or demotion occurred. No Grade 3 public customization family was registered.
- Final reconciliation is A22 / D14 / E2 / G15 / Total53.
- Commit record: committed in this closeout; git history is the authoritative commit identifier.

### B4 — Grade 3 Addition/Subtraction Story Problems

- Exact IDs: `grade3_addition_subtraction_word_problems_addition_word_problem`; `grade3_addition_subtraction_word_problems_missing_addend_word_problem`; `grade3_addition_subtraction_word_problems_subtraction_word_problem`.
- Shared family: `wordProblems.js`, word-problem layout/work boxes and `VW` contract.
- Preserve: 12 questions, range overrides, selected numbers, context selectors, completed-example aliases, seed, pagination and exact key truth.
- Safe future controls: count, Grade 3 total range, selected numbers, completed example and a small context set. Keep sentence-template internals hidden.
- Lane/files/tests: Standard; exact Grade 3 adapters, focused repetition/grammar/range/parity tests and one proof generator; regress Grade 2 Batch 3 and addition/subtraction word problems.
- Proof burden: three default PDFs in one packet.
- Movement: D3 -> A3; projected A25 / D11 / E2 / G15 / Total53.
- Stop if a proposed context is not age-neutral, arithmetic truth cannot be derived first, or page count/work space no longer matches the contract.

### B5 — Concrete Visual Extensions

- Exact IDs: `g3_equal_sharing_division`; `grade3_fraction_equivalence_shade_fraction_models`; `grade3_place_value_representation_number_line_identify`.
- Shared correction type: structured visual truth through existing model/visual layouts; no new visual system is assumed.
- Preserve: `VM`, `VF` and `VV` raw contracts where genuinely consumed; question count, seed, response truth and answer-key mirroring.
- Safe future controls: task-specific count/range/factor choices only after each adapter proves preview/PDF/key parity. Keep renderer geometry and low-level visual controls hidden.
- Lane/files/tests: Standard; likely three exact adapters/generators, existing model renderer/layout, focused per-resource assertions and a combined proof generator.
- Proof burden: three default PDFs in one packet.
- Movement: D3 -> A3; projected A28 / D8 / E2 / G15 / Total53.
- Stop and move an ID to Full Review if it needs a new renderer, new icon/art system or a response structure the existing model layout cannot express.

### B6 — Fraction Relationships and Applications

- Exact IDs: `grade3_fraction_equivalence_compare_fractions`; `grade3_fraction_equivalence_fraction_number_line`; `grade3_fraction_equivalence_fraction_word_problems`; `grade3_fraction_equivalence_match_equivalent_fractions`.
- Shared family: Grade 3 fraction relationship truth; `VF` currently exposes almost no safe teacher controls.
- Preserve: the two ready resources' approved defaults/statuses and all existing fraction truth while deciding distinct roles for number line and word problems.
- Safe future controls: question count, denominator set, model/task mode and completed example only after structured truth exists. Keep arbitrary numerator/denominator builders hidden.
- Lane/files/tests: Standard for copy/variety, Full Review if number-line or story tasks need new visual architecture; focused structured-truth/key/isolation suite and combined proof generator.
- Proof burden: four default PDFs in one packet.
- Movement: E2 + D2 -> A4; projected A32 / D6 / E0 / G15 / Total53.
- Stop if the four roles cannot be made distinct, Grade 3-aligned and visually honest without a new renderer; defer the zero-item story resource rather than create filler.

### B7 — Structured Grade 3 Data Displays

- Exact IDs: `g3_complete_a_graph`; `g3_graph_questions`; `g3_interpret_data`; `g3_match_data_to_graph`; `g3_read_a_graph`.
- Shared family: one structured Grade 3 data model with distinct read, interpret, complete, match and question actions; `VD` contract.
- Preserve: all five ready statuses until founder approval, deterministic truth, count, student/key parity and any useful public titles.
- Safe future controls: question count, graph type, scale and category count only after registry validation and proof. Keep arbitrary graph construction and raw renderer geometry hidden.
- Lane/files/tests: Full Review; short family contract first, then adapters/shared structured model, existing renderer if adequate, focused cross-action truth/parity/isolation test and proof generator.
- Proof burden: five default PDFs in one packet.
- Movement: D5 -> A5; projected A37 / D1 / E0 / G15 / Total53.
- Stop before implementation if founder does not approve five distinct teacher-use cases, or if a new renderer/visual system is required without a separate preflight.

## Completed first batch

**B1 — Numeric Patterning Public-Copy Closure** was founder-approved on 2026-07-21 and closed in one local commit. The three resources retain the shared Grade 3 numeric-patterning family, existing task layouts, documented raw-variable contract and protected three-PDF proof packet. No renderer, generator, visual-system, public customization or catalog lifecycle change was required.

## Pre-proof gate for every future Grade 3 batch

Before generating a founder packet, verify:

- public-safe title with no unnecessary `— Grade 3` suffix;
- public-safe footer with no internal ID or skill slug;
- one clear instruction below the divider; hidden subtitle unless required; no repeated item prompt;
- instruction matches the actual response mechanism;
- compact targets are optically centred and all answer targets are consistently sized/aligned;
- every approved variable still works; selected total count is exact; pagination recalculates safely;
- usable work space; acceptable context/language variety; correct singular/plural agreement;
- student and key share exact truth; preview and PDF match;
- no clipping, overlap or footer pressure;
- catalog status is preserved and cross-grade isolation passes.

Do not send obvious copy, repetition, centring, metadata, variable or layout regressions to founder review.

## Validation checklist

- Grade 2 closeout verified at the expected commit and totals.
- Exactly 53 Grade 3 IDs recorded once in the canonical ledger: 26 ready, 25 generated, one partial, one planned.
- Catalog status and reconciliation are separate; the current reconciliation is A22 / D14 / E2 / G15 / Total53.
- Every row has a completed-work classification, risk/action, variable code, evidence, nearest-family finding and projected result.
- Variables and aliases are inventoried by active family with status, public-registry state, normalization/runtime behavior and safe-candidate guidance.
- Twenty-two reconciled-A resources are excluded from further implementation; fifteen duplicate/defer candidates are excluded from implementation.
- Batches 1, 2 and 3 are closed; the four remaining proposed batches contain only unresolved resources, none exceeds five resources, and all are grouped by shared implementation or correction type.
- Batch 3 is the only Grade 3 implementation and reconciliation movement in this closeout. Protected paths remain outside the commit, and no push occurs.
