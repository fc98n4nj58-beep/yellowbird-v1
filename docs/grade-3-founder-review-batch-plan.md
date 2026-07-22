# Grade 3 Founder Review Ledger and Batch Plan

Date: 2026-07-21

Status: canonical 53-resource review ledger. Grade 3 Batch 1 was founder-approved on 2026-07-21 and reconciled through `docs/grade-3-architecture-reconciliation.md`; catalog lifecycle status remains separate.

## Grade 2 closeout checkpoint

- Current HEAD is `998b2bd048d82250296aa60790329f6d7901be34` (`feat: complete grade 2 word problem families`) on `main`; the expected commit is the active HEAD and is therefore in active-branch history.
- Its eight committed paths match the Grade 2 closeout brief exactly.
- Grade 2 reconciliation is A35 / D0 / E0 / G17 / Total52. Category E is empty.
- The current audit is Ready 104/104, Generated 213/213, Partial 5/5, Total331. Ready failures are zero. The only seven failures are the established planned `pattern_word_problems` gaps.
- There are no tracked or staged changes at the checkpoint. The existing protected untracked paths are `engine/catalog/`, `engine/visuals/index`, `engine/visuals/renderVisual.js`, `public/styles/images/`, and `review/`.
- No Grade 2 closeout action remains. **GRADE 2 FOUNDER REVIEW CLOSED.**

## Inventory rules and totals

The master catalog contains **53 exact Grade 3 records**: 26 `ready`, 25 `generated`, one `partial`, and one `planned`. The canonical ledger below contains 53 rows and 53 unique IDs. Catalog lifecycle status is not reconciliation status.

The `Status / rec.` column records the original pre-closeout inventory state, where `UR` meant **unreconciled**. The final category in each row is the reviewed row-level classification used by `docs/grade-3-architecture-reconciliation.md`; Batch 1 is the only movement applied during this closeout:

- A: complete and should be reconciled as approved/healthy after founder confirmation.
- D: shared-family or structured-truth work remains.
- E: narrow copy/default/layout correction remains.
- G: duplicate, customization-only, planned-gap, or defer candidate.

The pre-Batch-1 scenario was A12 / D13 / E13 / G15 / Total53. The founder-approved Batch 1 movement E3 -> A3 produces the current reconciliation A15 / D13 / E10 / G15 / Total53. Catalog `ready` status must not be substituted for reconciliation category A.

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
| `grade3_addition_subtraction_facts_equation_match` | Equation Match — Grade 3 | generated / UR | `df1ae38` | `equationMatch.js`; matching | — (12 current); results about 0-31 | CAS / VA / E0 | stale title/footer and unapproved Grade 3 balance/range; Grade 2 Equal or Not Equal | NARROW CORRECTION NEEDED / Fast / Grade 3 adapter / B3 / 1 / E |
| `grade3_addition_subtraction_facts_fact_family` | Fact Families — Grade 3 | generated / UR | `0a1db99` | `factFamily.js`; matching | — (12 current); generic fact range | CAS / VA / E0 | public copy and Grade 3 operation/range contract unapproved; Grade 2 Fact Families | NARROW CORRECTION NEEDED / Fast / parameter adapter / B3 / 1 / E |
| `grade3_addition_subtraction_facts_fact_fluency` | Fact Fluency — Grade 3 | generated / UR | `3783fd4` | `factFluency.js`; equation-practice | — (12 current); 0-20 | CAS / VA / E0 | current range is too shallow and density/title contract is unapproved; Grade 2 within-100 fluency | NARROW CORRECTION NEEDED / Fast / Grade 3 range/default adapter / B3 / 1 / E |
| `grade3_addition_subtraction_facts_missing_addend` | Missing Addends — Grade 3 | generated / UR | `003584d` | `missingAddend.js`; fluency grid | — (12 current); totals <=20 | CAS / VA / E0 | range too shallow; missing-position control not publicly validated; Grade 2 Missing Addends Within 100 | NARROW CORRECTION NEEDED / Fast / Grade 3 range/balance adapter / B3 / 1 / E |
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
| `grade3_place_value_representation_base_ten_blocks` | Base Ten Blocks — Grade 3 | ready / UR | `8fba970` | `baseTenBlocks.js`; visual model | 10 / 2 pages; current values <=95 | CV / VV / E1 | current range/copy is lighter than an honest Grade 3 hundreds contract | NARROW CORRECTION NEEDED / Fast / verify 3-digit model support before range change / B2 / 1 / E |
| `grade3_place_value_representation_compare_numbers` | Compare Numbers — Grade 3 | generated / UR | `be08da5` | `compareNumbers.js`; fluency grid | — (12 current); 3-digit values | CV / VV / E0 | explicitly held because Quick Check and Exit Ticket already cover this skill | DUPLICATE — DEFER / none / no worksheet implementation / — / none / G |
| `grade3_place_value_representation_expanded_form` | Expanded Form — Grade 3 | ready / UR | `819dc18` | `expandedForm.js`; compact representation | 45 / 2 pages; 100-999 | CV / VV / E5 | truth/layout complete; stale suffix/footer metadata | NARROW CORRECTION NEEDED / Fast / copy-only / B2 / 1 / E |
| `grade3_place_value_representation_number_line_identify` | Number Line — Grade 3 | generated / UR | `df1ae38` | `numberLineIdentify.js`; visual model | — (10 current, 5/page); current small line | CV / VV / E0 | current default does not express an approved Grade 3 number-line range/interval contract | SHARED-FAMILY EXTENSION NEEDED / Standard / Grade 3 parameter adapter / B5 / 1 / D |
| `grade3_place_value_representation_number_word_match` | Number Word Match — Grade 3 | ready / UR | `bebd307` | `numberWordMatch.js`; matching | 12 / 2 pages; 3-digit words | CV / VV / E1 | accepted duplicate/wording caution plus stale suffix/footer | NARROW CORRECTION NEEDED / Fast / copy/duplicate suppression only / B2 / 1 / E |
| `grade3_place_value_representation_standard_form` | Standard Form — Grade 3 | ready / UR | `23dfc06` | `standardForm.js`; compact representation | 45 / 3 pages; 100-999 | CV / VV / E5 | truth/layout complete; stale suffix/footer metadata | NARROW CORRECTION NEEDED / Fast / copy-only / B2 / 1 / E |

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

### B2 — Place-Value Representation Copy and Default Closure

- Exact IDs: `grade3_place_value_representation_base_ten_blocks`; `grade3_place_value_representation_expanded_form`; `grade3_place_value_representation_number_word_match`; `grade3_place_value_representation_standard_form`.
- Shared family: place-value recipes/generators; compact representation, matching and existing visual-model layouts; `VV` contract.
- Preserve: 45-item forms, 10-item base-ten default unless founder changes it, 12-item number-word match, 3-digit form range, seeds, examples and key truth.
- Safe future controls: question count, 3-digit range, selected numbers, representation direction and completed example. Keep `answerStyle`, raw columns/font and internal prompt modes hidden.
- Lane/files/tests: Fast unless base-ten hundreds require a model extension; likely service adapter/copy metadata, focused Grade 3 place-value test and proof generator.
- Proof burden: four default PDFs in one packet.
- Movement: E4 -> A4; projected A19 / D13 / E6 / G15 / Total53.
- Stop if base-ten work requires new art, a renderer or values the current visual cannot print safely; split that ID to Standard lane instead.

### B3 — Addition/Subtraction Fact Relationships

- Exact IDs: `grade3_addition_subtraction_facts_equation_match`; `grade3_addition_subtraction_facts_fact_family`; `grade3_addition_subtraction_facts_fact_fluency`; `grade3_addition_subtraction_facts_missing_addend`.
- Shared family: existing Grade 2-approved fact/relation generators and matching/fluency layouts; `VA` contract.
- Preserve: exact count, selected-number restrictions where consumed, missing/equality truth, deterministic generation and key parity.
- Safe future controls: count, Grade 3 range, selected numbers and a tested missing-position choice. Keep generator-specific diagnostics and unsupported global aliases hidden.
- Lane/files/tests: Fast; Grade 3 adapters in runtime/catalog service, focused four-resource suite and proof generator; regress Grade 2 fact/relation families.
- Proof burden: four default PDFs in one packet.
- Movement: E4 -> A4; projected A23 / D13 / E2 / G15 / Total53.
- Stop if the proposed range makes the existing density or answer targets unsafe.

### B4 — Grade 3 Addition/Subtraction Story Problems

- Exact IDs: `grade3_addition_subtraction_word_problems_addition_word_problem`; `grade3_addition_subtraction_word_problems_missing_addend_word_problem`; `grade3_addition_subtraction_word_problems_subtraction_word_problem`.
- Shared family: `wordProblems.js`, word-problem layout/work boxes and `VW` contract.
- Preserve: 12 questions, range overrides, selected numbers, context selectors, completed-example aliases, seed, pagination and exact key truth.
- Safe future controls: count, Grade 3 total range, selected numbers, completed example and a small context set. Keep sentence-template internals hidden.
- Lane/files/tests: Standard; exact Grade 3 adapters, focused repetition/grammar/range/parity tests and one proof generator; regress Grade 2 Batch 3 and addition/subtraction word problems.
- Proof burden: three default PDFs in one packet.
- Movement: D3 -> A3; projected A26 / D10 / E2 / G15 / Total53.
- Stop if a proposed context is not age-neutral, arithmetic truth cannot be derived first, or page count/work space no longer matches the contract.

### B5 — Concrete Visual Extensions

- Exact IDs: `g3_equal_sharing_division`; `grade3_fraction_equivalence_shade_fraction_models`; `grade3_place_value_representation_number_line_identify`.
- Shared correction type: structured visual truth through existing model/visual layouts; no new visual system is assumed.
- Preserve: `VM`, `VF` and `VV` raw contracts where genuinely consumed; question count, seed, response truth and answer-key mirroring.
- Safe future controls: task-specific count/range/factor choices only after each adapter proves preview/PDF/key parity. Keep renderer geometry and low-level visual controls hidden.
- Lane/files/tests: Standard; likely three exact adapters/generators, existing model renderer/layout, focused per-resource assertions and a combined proof generator.
- Proof burden: three default PDFs in one packet.
- Movement: D3 -> A3; projected A29 / D7 / E2 / G15 / Total53.
- Stop and move an ID to Full Review if it needs a new renderer, new icon/art system or a response structure the existing model layout cannot express.

### B6 — Fraction Relationships and Applications

- Exact IDs: `grade3_fraction_equivalence_compare_fractions`; `grade3_fraction_equivalence_fraction_number_line`; `grade3_fraction_equivalence_fraction_word_problems`; `grade3_fraction_equivalence_match_equivalent_fractions`.
- Shared family: Grade 3 fraction relationship truth; `VF` currently exposes almost no safe teacher controls.
- Preserve: the two ready resources' approved defaults/statuses and all existing fraction truth while deciding distinct roles for number line and word problems.
- Safe future controls: question count, denominator set, model/task mode and completed example only after structured truth exists. Keep arbitrary numerator/denominator builders hidden.
- Lane/files/tests: Standard for copy/variety, Full Review if number-line or story tasks need new visual architecture; focused structured-truth/key/isolation suite and combined proof generator.
- Proof burden: four default PDFs in one packet.
- Movement: E2 + D2 -> A4; projected A33 / D5 / E0 / G15 / Total53.
- Stop if the four roles cannot be made distinct, Grade 3-aligned and visually honest without a new renderer; defer the zero-item story resource rather than create filler.

### B7 — Structured Grade 3 Data Displays

- Exact IDs: `g3_complete_a_graph`; `g3_graph_questions`; `g3_interpret_data`; `g3_match_data_to_graph`; `g3_read_a_graph`.
- Shared family: one structured Grade 3 data model with distinct read, interpret, complete, match and question actions; `VD` contract.
- Preserve: all five ready statuses until founder approval, deterministic truth, count, student/key parity and any useful public titles.
- Safe future controls: question count, graph type, scale and category count only after registry validation and proof. Keep arbitrary graph construction and raw renderer geometry hidden.
- Lane/files/tests: Full Review; short family contract first, then adapters/shared structured model, existing renderer if adequate, focused cross-action truth/parity/isolation test and proof generator.
- Proof burden: five default PDFs in one packet.
- Movement: D5 -> A5; projected A38 / D0 / E0 / G15 / Total53.
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
- Catalog status and reconciliation are separate; the current reconciliation is A15 / D13 / E10 / G15 / Total53.
- Every row has a completed-work classification, risk/action, variable code, evidence, nearest-family finding and projected result.
- Variables and aliases are inventoried by active family with status, public-registry state, normalization/runtime behavior and safe-candidate guidance.
- Fifteen reconciled-A resources are excluded from further implementation; fifteen duplicate/defer candidates are excluded from implementation.
- Batch 1 is closed; the six remaining proposed batches contain only unresolved resources, none exceeds five resources, and all are grouped by shared implementation or correction type.
- Batch 1 is the only Grade 3 implementation and reconciliation movement in this closeout. Protected paths remain outside the commit, and no push occurs.
