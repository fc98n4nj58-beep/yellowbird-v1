# Grade 2 Architecture and Reconciliation Preflight

Date: 2026-07-14

Scope: architecture inventory and authoritative Grade 2 reconciliation. The current update records founder-approved family evidence without changing catalog status, public UI, curriculum source, or another grade.

## Current project state

- Milestone 8 remains the active milestone.
- Grade 1 is closed at A32 / B0 / C0 / D0 / E0 / F0 / G17, total 49.
- Catalog health at the scan baseline is 104 ready, 213 generated, 5 partial, and 9 planned, total 331.
- The four-resource Addition and Subtraction Category C packet has explicit founder approval. Historical review CSVs remain local evidence and are not part of this production checkpoint.
- Earlier Teacher QA, Curriculum Alignment, promotion, and shared-family decisions remain useful evidence, but they are not silently relabelled as Grade 2 founder approval.
- The explicit shared-family founder closeout covers Expanded Form, Standard Form, Skip Counting, Numeric Patterning, Comparison, compact Assessment, and the final four Addition and Subtraction Category C worksheets. Grade 2 Category A now contains 18 ready records.
- Planning verification passed: the Numeric Patterning focused suite and the relevant shared arrays, data-isolation, fraction-isolation, and number-line regression suites all passed. `npm run audit:worksheets` reported 104/104 ready, 213/213 generated, 5/5 partial, and only the seven known planned `pattern_word_problems` failures.

## Grade 2 catalog inventory

The authoritative inventory is every master-catalog item whose `grades` contains `grade2`. The master contains **52** Grade 2 records. Eleven curated worksheets match `config/worksheetCatalog/grade2.js`; the other 41 records are represented in `data/worksheetCatalog.generated.json` and the master, including promoted generated records and four curated compact resources. No expected record is missing.

None of the 52 master records has a separate `topic` field. The inventory therefore reports the stored `domain`, public title, `skillKey`, and curriculum tag where present rather than inventing topic or expectation metadata.

Common path for every row unless noted:

`data/worksheetCatalog.master.json` -> `services/worksheetCatalogService.js` -> `engine/worksheetBuilder/buildWorksheet.js` -> the named skill recipe -> the named generator -> `engine/layout/normalizeWorksheetLayout.js` -> `services/catalogWorksheetRuntimeService.js` -> `engine/worksheetBuilder/normalizeWorksheetContent.js` -> preview or PDF renderer.

Inventory abbreviations:

- Source `C2`: `config/worksheetCatalog/grade2.js` and master. Source `G`: generated catalog and master.
- Kind `W`: worksheet; `Q`: Quick Check; `X`: Exit Ticket.
- Renderer `W`: `renderers/pdfRenderer.js`; `Q`: `renderers/quickCheckPdfRenderer.js`; `X`: `renderers/exitTicketPdfRenderer.js`.
- Seed `Y`: same-seed stable and different-seed variation observed; `S`: deterministic but effectively static/repetitive; `N`: injected seed is bypassed; `I`: output is invalid/empty; `P`: planned generator missing.
- Public `yes` means ready-catalog browse/detail/preview/PDF availability. Generated and planned records remain internal even though their direct catalog runtime can be called.
- Every record declares `hasAnswerKey: true`; `AK no` below means the generated truth is empty or otherwise not meaningful.
- Curriculum codes are listed where present; most generated records have no expectation code or curriculum tag.

| ID and public title | Kind / source / status | Domain; skill or code | Recipe -> generator | Layout / renderer / AK / seed / public | Nearest approved Grade 1 contract and reuse | Initial category; architecture condition |
| --- | --- | --- | --- | --- | --- | --- |
| `g2_addition_fluency_within_100` - Addition Fluency Within 100 | W / C2 / ready | Addition & Subtraction; `addition_subtraction_facts`; B2 | `addition_subtraction_facts.json` -> `factFluency.js` | `fluency_grid` / W / yes / Y / yes | Addition Facts; parameters | **E** - title says 100, default truth stays within 20; TITLE/TASK MISMATCH |
| `grade2_addition_subtraction_word_problems_addition_word_problem` - Addition Word Problem - Grade 2 | W / G / generated | Addition & Subtraction; `addition_subtraction_word_problems` | `addition_subtraction_word_problems.json` -> `wordProblems.js` | `equation_practice` / W / yes / Y / no | Addition Word Problems; duplicate | **G** - weaker duplicate of the curated addition resource |
| `g2_addition_word_problems_within_100` - Addition Word Problems Within 100 | W / C2 / ready | Addition & Subtraction; `addition_subtraction_application`; B2 | `addition_subtraction_application.json` -> `wordProblems.js` | `equation_practice` / W / yes / Y / yes | Grade 1 contextual word-problem family; extend contexts | **E** - correct arithmetic range but one repeated Maya/stickers shell and catalogue-style instruction; RESOURCE-SPECIFIC CORRECTION |
| `grade2_addition_subtraction_facts_equation_match` - Equation Match - Grade 2 | W / G / generated | Addition & Subtraction; `addition_subtraction_facts` | `addition_subtraction_facts.json` -> `equationMatch.js` | `matching` / W / yes / Y / no | Grade 1 Equal or Not Equal; adapter | **D** - bypasses the controlled relational-equations contract; NEEDS GRADE 2 ADAPTER |
| `grade2_addition_subtraction_facts_fact_family` - Fact Families | W / G / ready | Addition & Subtraction; `addition_subtraction_facts` | `addition_subtraction_facts.json` -> `factFamily.js` | `matching` / W / yes / Y / yes | Grade 1 Fact Families; parameters | **A** - founder-approved 12-group distinct-addend contract; SHARED FAMILY - HEALTHY |
| `grade2_addition_subtraction_facts_fact_fluency` - Fact Fluency - Grade 2 | W / G / generated | Addition & Subtraction; `addition_subtraction_facts` | `addition_subtraction_facts.json` -> `factFluency.js` | `fluency_grid` / W / yes / Y / no | Addition/Subtraction Fluency; duplicate | **G** - prior decision keeps it backup-only because it overlaps existing fluency resources |
| `grade2_addition_subtraction_word_problems_missing_addend_word_problem` - Missing Addend Word Problems | W / G / ready | Addition & Subtraction; `addition_subtraction_word_problems` | `addition_subtraction_word_problems.json` -> `wordProblems.js` | `equation_practice` / W / yes / Y / yes | Missing-addend word problems; parameters | **A** - founder-approved 12-problem student work-box and compact-key contract; SHARED FAMILY - HEALTHY |
| `grade2_addition_subtraction_facts_missing_addend` - Missing Addends Within 20 | W / G / ready | Addition & Subtraction; `addition_subtraction_facts` | `addition_subtraction_facts.json` -> `missingAddend.js` | `fluency_grid` / W / yes / Y / yes | Missing Addends Within 20; direct reuse | **A** - founder-approved within-20, balanced-zero, two-column contract; SHARED FAMILY - HEALTHY |
| `g2_missing_addends_within_100` - Missing Addends Within 100 | W / C2 / ready | Addition & Subtraction; `addition_subtraction_relationships`; B2 | `addition_subtraction_relationships.json` -> `missingAddend.js` | `fluency_grid` / W / yes / Y / yes | Missing Addends; parameters | **E** - no Grade 2 max-total adapter, so default remains within 20; TITLE/TASK MISMATCH |
| `grade2_addition_subtraction_facts_related_subtraction` - Related Subtraction - Grade 2 | W / G / ready | Addition & Subtraction; `addition_subtraction_facts` | `addition_subtraction_facts.json` -> `relatedSubtraction.js` | `fluency_grid` / W / yes / Y / yes | Subtraction Facts; expected family extension | **E** - runtime is ordinary subtraction, not a visible related-facts task; TITLE/TASK MISMATCH |
| `g2_subtraction_fluency_within_100` - Subtraction Fluency Within 100 | W / C2 / ready | Addition & Subtraction; `addition_subtraction_facts`; B2 | `addition_subtraction_facts.json` -> `relatedSubtraction.js` | `fluency_grid` / W / yes / Y / yes | Subtraction Facts; parameters | **E** - title says 100 while default generator remains within 20; TITLE/TASK MISMATCH |
| `grade2_addition_subtraction_word_problems_subtraction_word_problem` - Take Away Word Problems | W / G / ready | Addition & Subtraction; `addition_subtraction_word_problems` | `addition_subtraction_word_problems.json` -> `wordProblems.js` | `equation_practice` / W / yes / Y / yes | Subtraction Word Problems; parameters | **A** - founder-approved take-away language, work-box, and compact-key contract; SHARED FAMILY - HEALTHY |
| `grade2_addition_subtraction_facts_ten_frame` - Ten Frame Practice - Grade 2 | W / G / generated | Addition & Subtraction; `addition_subtraction_facts` | `addition_subtraction_facts.json` -> `tenFrame.js` | `visual_model` / W / yes / Y / no | Counting With Ten Frames; weaker duplicate/review | **G** - default 0-10 shell adds no clear Grade 2 teacher use beyond the approved lower-grade family |
| `grade2_addition_subtraction_facts_word_problems` - Word Problems - Grade 2 | W / G / generated | Addition & Subtraction; `addition_subtraction_facts` | `addition_subtraction_facts.json` -> `wordProblems.js` | `equation_practice` / W / yes / Y / no | Three operation-specific word-problem resources; duplicate | **G** - generic shell duplicates stronger addition, subtraction, and missing-addend tasks |
| `grade2_data_display_graphing_complete_graph` - Complete a Graph - Grade 2 | W / G / generated | Data & Graphing; `data_display_graphing` | `data_display_graphing.json` -> `completeGraph.js` | `visual_model` / W / yes / S / no | Grade 1 data construction; extend | **D** - repeated text describes a graph but carries no structured graph model; MISSING STRUCTURED MODEL |
| `grade2_data_display_graphing_graph_questions` - Graph Questions - Grade 2 | W / G / generated | Data & Graphing; `data_display_graphing` | `data_display_graphing.json` -> `graphQuestions.js` | `equation_practice` / W / yes / S / no | Grade 1 graph questions; extend | **D** - repeated text-only data, no shared pictograph model; NEEDS GRADE 2 ADAPTER |
| `grade2_data_display_graphing_graph_word_problems` - Graph Word Problems - Grade 2 | W / G / generated | Data & Graphing; `data_display_graphing` | `data_display_graphing.json` -> no registered `graph_word_problems` generator | `equation_practice` / W / no / I / no | Grade 1 graph application; extend | **E** - zero problems; MISSING STRUCTURED MODEL |
| `grade2_data_display_graphing_interpret_data` - Interpret Data - Grade 2 | W / G / generated | Data & Graphing; `data_display_graphing` | `data_display_graphing.json` -> `interpretData.js` | `equation_practice` / W / yes / N / no | Grade 1 data interpretation; extend | **D** - uses `Math.random`, repeats one fixed dataset, and has no structured graph; DUPLICATE LOGIC - CONSOLIDATE |
| `grade2_data_display_graphing_match_data_to_graph` - Match Data to Graph - Grade 2 | W / G / generated | Data & Graphing; `data_display_graphing` | `data_display_graphing.json` -> `matchDataToGraph.js` | `matching` / W / yes / S / no | Grade 1 graph matching; extend | **D** - repeated text-only prompt, not a matching visual; NEEDS GRADE 2 ADAPTER |
| `grade2_data_display_graphing_read_graph` - Read a Graph - Grade 2 | W / G / generated | Data & Graphing; `data_display_graphing` | `data_display_graphing.json` -> `readGraph.js` | `visual_model` / W / yes / S / no | Grade 1 data reading; extend | **D** - no graph is rendered; MISSING STRUCTURED MODEL |
| `grade2_fraction_equivalence_compare_fractions` - Compare Fractions - Grade 2 | W / G / generated | Fractions; `fraction_equivalence` | `fraction_equivalence.json` -> `compareFractions.js` | `equation_practice` / W / yes / Y / no | Compare Fair Shares; later/reframe | **G** - prior Curriculum Alignment found symbolic comparison weak for broad Grade 2 use |
| `grade2_fraction_equivalence_fraction_number_line` - Fraction Number Line - Grade 2 | W / G / generated | Fractions; `fraction_equivalence` | `fraction_equivalence.json` -> `fractionNumberLine.js` | `equation_practice` / W / no / I / no | Fraction strip/number-line work; later grade | **G** - generator returns an array where one problem is required, producing blank rows; Grade 3+ reconsideration only |
| `grade2_fraction_equivalence_fraction_word_problems` - Fraction Word Problems - Grade 2 | W / G / generated | Fractions; `fraction_equivalence` | recipe names `word_problems`; current activity has no matching family output | `equation_practice` / W / no / I / no | Share Fairly; extend | **D** - zero problems; reuse the fair-sharing truth model with Grade 2 parameters rather than repair the generic shell |
| `grade2_fraction_equivalence_match_equivalent_fractions` - Match Equivalent Fractions - Grade 2 | W / G / generated | Fractions; `fraction_equivalence` | `fraction_equivalence.json` -> `matchEquivalentFractions.js` | `equation_practice` / W / yes / Y / no | One Half and Two Fourths; later/reframe | **G** - symbolic outputs such as 1/4 = 3/12 exceed the approved Grade 2 launch lane |
| `grade2_fraction_equivalence_shade_fraction_models` - Shade Fraction Models - Grade 2 | W / G / generated | Fractions; `fraction_equivalence` | `fraction_equivalence.json` -> `shadeFractionModels.js` | `equation_practice` / W / no / I / no | Shade Equal Parts; extend | **D** - generator returns arrays and no structured model; extend the Grade 1 strip contract |
| `grade2_multiplication_facts_arrays` - Arrays - Grade 2 | W / G / ready | Multiplication & Division; `multiplication_facts` | `multiplication_facts.json` -> `array.js` | `model_interpretation` / W / yes / Y / yes | Arrays; shared family | **E** - shared equation model is healthy, but default generates 10 items against the founder-approved fixed eight-item family contract; RESOURCE-SPECIFIC CORRECTION |
| `grade2_multiplication_facts_equal_groups` - Equal Groups - Grade 2 | W / G / generated | Multiplication & Division; `multiplication_facts` | `multiplication_facts.json` -> `equalGroups.js` | `model_interpretation` / W / yes / Y / no | Equal Groups; parameters | **D** - now has structured visuals but lacks a Grade 2 eight-item/friendly-factor adapter; NEEDS GRADE 2 ADAPTER |
| `grade2_multiplication_facts_missing_factor` - Missing Factors - Grade 2 | W / G / generated | Multiplication & Division; `multiplication_facts` | `multiplication_facts.json` -> `missingFactor.js` | `fluency_grid` / W / yes / Y / no | Missing-factor family; later grade | **G** - 60 abstract missing-factor items are not an honest Grade 2 default |
| `grade2_multiplication_facts_skip_counting` - Skip Counting - Grade 2 | W / G / generated | Multiplication & Division; `multiplication_facts` | `multiplication_facts.json` -> `skipCounting.js` | `equation_practice` / W / yes / Y / no | Curated by-2/by-5/by-10 resources; duplicate | **G** - teacher customization is preferable to another generic catalog entry |
| `grade2_multiplication_facts_word_problems` - Word Problems - Grade 2 | W / G / generated | Multiplication & Division; `multiplication_facts` | `multiplication_facts.json` -> `wordProblems.js` | `equation_practice` / W / yes / Y / no | Equal-groups word problems; extend | **E** - mathematical task is usable, but it needs Grade 2 factor/context controls and an explicit equal-groups title/instruction; TITLE/TASK MISMATCH |
| `g2_skip_counting_by_10` - Skip Counting by 10 | W / C2 / ready | Number Sense; `counting_patterns`; B1 | `counting_patterns.json` -> `skipCounting.js` | `equation_practice` with structured sequence row / W / yes / Y / yes | Skip Counting; direct parameters | **A** - current shared family is explicitly founder-approved; SHARED FAMILY - HEALTHY |
| `g2_skip_counting_by_2` - Skip Counting by 2 | W / C2 / ready | Number Sense; `counting_patterns`; B1 | `counting_patterns.json` -> `skipCounting.js` | structured sequence row / W / yes / Y / yes | Skip Counting; direct parameters | **A** - current shared family is explicitly founder-approved; SHARED FAMILY - HEALTHY |
| `g2_skip_counting_by_5` - Skip Counting by 5 | W / C2 / ready | Number Sense; `counting_patterns`; B1 | `counting_patterns.json` -> `skipCounting.js` | structured sequence row / W / yes / Y / yes | Skip Counting; direct parameters | **A** - current shared family is explicitly founder-approved; SHARED FAMILY - HEALTHY |
| `grade2_patterning_and_algebra_extend_pattern` - Extend Pattern - Grade 2 | W / G / ready | Patterning & Algebra; `patterning_and_algebra` | `patterning_and_algebra.json` -> `extendPattern.js` | dedicated two-column pattern layout / W / yes / Y / yes | Numeric Patterning; parameters | **A** - founder-approved two-column, six-row continuation contract; SHARED FAMILY - HEALTHY |
| `grade2_patterning_and_algebra_function_table` - Function Table - Grade 2 | W / G / generated | Patterning & Algebra; `patterning_and_algebra` | `patterning_and_algebra.json` -> `functionTable.js` | generic one-column / W / yes / Y / no | Function Table; later grade | **G** - explicitly deferred and not using an approved function-table layout |
| `grade2_patterning_and_algebra_identify_pattern_rule` - Identify Pattern Rule - Grade 2 | W / G / ready | Patterning & Algebra; `patterning_and_algebra` | `patterning_and_algebra.json` -> `identifyPatternRule.js` | dedicated two-column structured numeric response / W / yes / Y / yes | Numeric Patterning; parameters | **A** - founder-approved `Add ______ each time.` contract; SHARED FAMILY - HEALTHY |
| `grade2_patterning_and_algebra_missing_value_pattern` - Missing Value Pattern - Grade 2 | W / G / ready | Patterning & Algebra; `patterning_and_algebra` | `patterning_and_algebra.json` -> `missingValuePattern.js` | dedicated two-column inline target / W / yes / Y / yes | Numeric Patterning; parameters | **A** - founder-approved two-column internal-target contract; SHARED FAMILY - HEALTHY |
| `grade2_patterning_and_algebra_pattern_word_problems` - Pattern Word Problems - Grade 2 | W / G / planned | Patterning & Algebra; `patterning_and_algebra` | recipe -> missing `pattern_word_problems` generator | `equation_practice` / W / no / P / no | None required for launch | **G** - known planned gap; no forced implementation |
| `grade2_place_value_representation_base_ten_blocks` - Base Ten Blocks - Grade 2 | W / G / generated | Place Value; `place_value_representation` | `place_value_representation.json` -> `baseTenBlocks.js` | `visual_model` / W / yes / Y / no | Curated Grade 2 base-ten resource; duplicate | **G** - exact task duplicate of the stronger curated record |
| `g2_base_ten_blocks_representation` - Base Ten Blocks Representation | W / C2 / ready | Place Value; `place_value_representation`; B1 | `place_value_representation.json` -> `baseTenBlocks.js` | `visual_model` / W / yes / Y / yes | Base Ten Blocks; parameters | **E** - structured model is sound, but repeated per-item prose and catalogue-style instruction need Grade 2 design correction |
| `grade2_place_value_representation_compare_numbers` - Compare 3-Digit Numbers | W / G / ready | Place Value: Compare 3-Digit Numbers; `place_value_representation` | `place_value_representation.json` -> `compareNumbers.js` | dedicated two-column comparison layout / W / yes / Y / yes | Compare Numbers; optional readiness override | **A** - founder-approved strict 100-999 comparison contract and public Place Value footer; SHARED FAMILY - HEALTHY |
| `g2_compare_numbers_to_100` - Compare Numbers to 100 | W / C2 / ready | Place Value; `number_relationships`; B1 | `number_relationships.json` -> `compareNumbers.js` | dedicated two-column comparison layout / W / yes / Y / yes | Compare Numbers; parameters | **A** - founder-approved 0-100 comparison contract and public Place Value footer; SHARED FAMILY - HEALTHY |
| `grade2_place_value_representation_expanded_form` - Expanded Form - Grade 2 | W / G / generated | Place Value; `place_value_representation` | `place_value_representation.json` -> `expandedForm.js` | `representation` / W / yes / Y / no | `g2_expanded_form_to_100`; duplicate | **G** - old generated shell is superseded by the curated resource |
| `g2_expanded_form_to_100` - Expanded Form to 100 | W / C2 / ready | Place Value; `place_value_representation`; B1 | `place_value_representation.json` -> `expandedForm.js` | task-specific expanded-form layout / W / yes / Y / yes | Expanded Form; direct parameters | **A** - current shared family is explicitly founder-approved; SHARED FAMILY - HEALTHY |
| `grade2_place_value_representation_number_line_identify` - Number Line - Grade 2 | W / G / generated | Place Value; `place_value_representation` | `place_value_representation.json` -> `numberLineIdentify.js` | `visual_model` / W / yes / Y / no | Number Line Identify; parameters | **D** - generic default is only 0-10 and needs a distinct Grade 2 range/task adapter |
| `grade2_place_value_representation_number_word_match` - Number Word Match - Grade 2 | W / G / generated | Place Value; `place_value_representation` | `place_value_representation.json` -> `numberWordMatch.js` | `matching` / W / yes / Y / no | Number Words/Numerals; parameters | **D** - generic 0-999 matching needs Grade 2 defaults, direction, title, and response contract |
| `grade2_place_value_representation_standard_form` - Standard Form - Grade 2 | W / G / generated | Place Value; `place_value_representation` | `place_value_representation.json` -> `standardForm.js` | `representation` / W / yes / Y / no | `g2_standard_form_to_100`; duplicate | **G** - old generated shell is superseded by the curated resource |
| `g2_standard_form_to_100` - Standard Form to 100 | W / C2 / ready | Place Value; `place_value_representation`; B1 | `place_value_representation.json` -> `standardForm.js` | dense standard-form layout / W / yes / Y / yes | Standard Form; direct parameters | **A** - current shared family is explicitly founder-approved; SHARED FAMILY - HEALTHY |
| `g2_subtraction_within_20_quick_check` - Subtraction Within 20 | Q / G / ready | Addition and Subtraction Facts; `addition_subtraction_facts` | `addition_subtraction_facts.json` -> `factFluency.js` | compact 2x3 quick check / Q / yes / Y / yes | Subtraction Facts plus compact-resource contract | **A** - founder-approved compact assessment contract; SHARED FAMILY - HEALTHY |
| `g2_addition_within_20_quick_check` - Addition Within 20 | Q / G / ready | Addition and Subtraction Facts; `addition_subtraction_facts` | `addition_subtraction_facts.json` -> `factFluency.js` | compact 2x3 quick check / Q / yes / Y / yes | Addition Facts plus compact-resource contract | **A** - founder-approved compact assessment contract; SHARED FAMILY - HEALTHY |
| `g2_missing_addends_within_20_quick_check` - Missing Addends Within 20 | Q / G / ready | Operations: Missing Addends Within 20; `addition_subtraction_facts` | `addition_subtraction_facts.json` -> `missingAddend.js` | compact 2x3 quick check / Q / yes / Y / yes | Missing Addends plus compact-resource contract | **A** - founder-approved compact assessment and zero-balance contract; SHARED FAMILY - HEALTHY |
| `g2_missing_addends_within_20_exit_ticket` - Missing Addends Within 20 | X / G / ready | Operations: Missing Addends Within 20; `addition_subtraction_relationships` | `addition_subtraction_relationships.json` -> `missingAddend.js` | two-up cut-apart exit ticket / X / yes / Y / yes | Missing Addends plus cut-apart contract | **A** - founder-approved cut-apart assessment and zero-balance contract; SHARED FAMILY - HEALTHY |

## Current reconciliation

| Category | Count | Evidence-based meaning |
| --- | ---: | --- |
| A - committed or commit-ready, founder-approved, and launch-ready | 18 | Shared place-value, Skip Counting, Numeric Patterning, Comparison, compact Assessment, and final Addition and Subtraction families have explicit founder evidence. |
| B - founder-approved but awaiting promotion | 0 | No generated Grade 2 record has both direct founder approval and a clean promotion-only case. |
| C - implemented but awaiting founder proof or final decision | 0 | No Grade 2 resource remains in Category C. |
| D - requires shared-runtime consolidation | 11 | Existing Grade 1/shared family contracts should be extended instead of approving generic Grade 2 fallbacks. |
| E - requires design, task, title, or print correction | 9 | Current output has an explicit mismatch, missing output, stale instruction pattern, or founder-contract default conflict. |
| F - untouched or not yet reviewed | 0 | This preflight inspected every Grade 2 catalog record; unresolved records are assigned to a concrete action category. |
| G - deferred, duplicate, legacy, later-grade, or out of launch scope | 14 | These records add no distinct launch value, are superseded, or belong in a later grade/decision. |
| **Total** | **52** | Every master-catalog Grade 2 ID appears exactly once. |

Exact IDs by category:

- **A (18):** `g2_expanded_form_to_100`, `g2_skip_counting_by_10`, `g2_skip_counting_by_2`, `g2_skip_counting_by_5`, `g2_standard_form_to_100`, `grade2_patterning_and_algebra_extend_pattern`, `grade2_patterning_and_algebra_identify_pattern_rule`, `grade2_patterning_and_algebra_missing_value_pattern`, `grade2_place_value_representation_compare_numbers`, `g2_compare_numbers_to_100`, `g2_subtraction_within_20_quick_check`, `g2_addition_within_20_quick_check`, `g2_missing_addends_within_20_quick_check`, `g2_missing_addends_within_20_exit_ticket`, `grade2_addition_subtraction_facts_fact_family`, `grade2_addition_subtraction_facts_missing_addend`, `grade2_addition_subtraction_word_problems_missing_addend_word_problem`, `grade2_addition_subtraction_word_problems_subtraction_word_problem`.
- **B (0):** none.
- **C (0):** none.
- **D (11):** `grade2_addition_subtraction_facts_equation_match`, `grade2_data_display_graphing_complete_graph`, `grade2_data_display_graphing_graph_questions`, `grade2_data_display_graphing_interpret_data`, `grade2_data_display_graphing_match_data_to_graph`, `grade2_data_display_graphing_read_graph`, `grade2_fraction_equivalence_fraction_word_problems`, `grade2_fraction_equivalence_shade_fraction_models`, `grade2_multiplication_facts_equal_groups`, `grade2_place_value_representation_number_line_identify`, `grade2_place_value_representation_number_word_match`.
- **E (9):** `g2_addition_fluency_within_100`, `g2_addition_word_problems_within_100`, `g2_missing_addends_within_100`, `g2_subtraction_fluency_within_100`, `grade2_addition_subtraction_facts_related_subtraction`, `grade2_data_display_graphing_graph_word_problems`, `grade2_multiplication_facts_arrays`, `grade2_multiplication_facts_word_problems`, `g2_base_ten_blocks_representation`.
- **F (0):** none.
- **G (14):** `grade2_addition_subtraction_word_problems_addition_word_problem`, `grade2_addition_subtraction_facts_fact_fluency`, `grade2_addition_subtraction_facts_ten_frame`, `grade2_addition_subtraction_facts_word_problems`, `grade2_fraction_equivalence_compare_fractions`, `grade2_fraction_equivalence_fraction_number_line`, `grade2_fraction_equivalence_match_equivalent_fractions`, `grade2_multiplication_facts_missing_factor`, `grade2_multiplication_facts_skip_counting`, `grade2_patterning_and_algebra_function_table`, `grade2_patterning_and_algebra_pattern_word_problems`, `grade2_place_value_representation_base_ten_blocks`, `grade2_place_value_representation_expanded_form`, `grade2_place_value_representation_standard_form`.

## Status breakdown

| Catalog status | Count | Resource-kind detail |
| --- | ---: | --- |
| ready | 25 | 21 worksheets, 3 Quick Checks, 1 Exit Ticket |
| generated | 26 | 26 worksheets |
| planned | 1 | 1 worksheet |
| partial / other | 0 | none |
| **Total** | **52** | 48 worksheets, 3 Quick Checks, 1 Exit Ticket |

There are no duplicate IDs in the master, no duplicate active ID records, no config/master mismatch among the 11 curated Grade 2 worksheets, and no generated Grade 2 record missing from the master. Duplication in this document means instructional/product overlap, not duplicate database keys.

## Architecture findings

- **Shared runtime is healthy at the route boundary.** Both `/api/catalog-preview/:id` and `/api/catalog-pdf/:id` call `buildCatalogWorksheetRuntime()`. PDF then selects the worksheet, Quick Check, or Exit Ticket renderer. The older architecture note that preview and PDF independently construct catalog truth is now stale.
- **Routes are thin.** No Grade 2 mathematical logic was found in preview, PDF, or library routes.
- **Renderers do not calculate Grade 2 answers.** `pdfRenderer.js` owns substantial family-specific geometry and answer placement, but structured answers originate in generators. The main risk is missing structured truth reaching a generic renderer, not renderer-owned arithmetic.
- **Generic success is too permissive.** The catalog audit treats any non-throwing generator call as working. It does not reject zero problems, an array returned as one problem, blank prompts, missing answers, repeated fixed prompts, or title/default mismatches.
- **Grade 2 data is a legacy fallback.** Five generators emit repeated prose about a graph without `graphData`/`graphTaskData`; Graph Word Problems yields zero items. `interpretData.js` also bypasses injected randomness with `Math.random`.
- **Grade 2 fractions are split from the approved Grade 1 truth model.** The Grade 1 service intentionally isolates Grade 2. Two legacy generators return arrays where `buildWorksheet()` expects a single problem, Fraction Word Problems returns zero items, and formal symbolic equivalence is not a safe default.
- **Multiplication model primitives are reusable.** Arrays and Equal Groups have structured visuals, `responseValues`, the true `×` symbol, seeded factor pools, and shared geometry. Grade 2 still lacks the family-approved eight-item/friendly-factor default adapter.
- **Numeric Patterning is the strongest unreviewed Grade 2 worksheet family.** It has task-specific layouts, deterministic truth, duplicate control, answer metadata, pagination tests, current proofs, and no generic fallback.
- **Old aliases are contained.** `array`/`arrays` aliases are deliberately resolved in the builder and renderer. No Grade 2 recipe alias is silently selecting another task.
- **Public availability is status-gated.** All 25 ready resources are launch-facing. Generated/planned resources can be invoked through direct internal APIs but do not belong in browse/detail founder claims.

## Grade 1 family reuse map

| Grade 2 lane | Reuse decision | Exact reusable contract/files |
| --- | --- | --- |
| Addition/subtraction fluency | REUSE WITH GRADE-SPECIFIC PARAMETERS | `factFluency.js`, `relatedSubtraction.js`, Grade 1 fluency option normalization, dense arithmetic layout |
| Missing-number relationships | DIRECT REUSE or parameters | `missingAddend.js`, aligned short-answer target, Quick Check/Exit Ticket renderers |
| Compare numbers | REUSE WITH GRADE-SPECIFIC PARAMETERS | `compareNumbers.js`, comparison-symbol answer target, Grade 1 comparison layout |
| Number representation/base ten | REUSE WITH GRADE-SPECIFIC PARAMETERS | `baseTenBlocks.js`, Grade 1 number-representation selection/range contract, base-ten visual renderer |
| Number words/numerals | EXTEND EXISTING FAMILY | `numberWordMatch.js`, Grade 1 two-direction response metadata and response-target contract |
| Place value forms | DIRECT REUSE | `expandedForm.js`, `standardForm.js`, approved value pools and task layouts |
| Number lines | REUSE WITH GRADE-SPECIFIC PARAMETERS | `numberLineIdentify.js`, structured number-line visual and full-width renderer rules |
| Arrays/equal groups | REUSE WITH GRADE-SPECIFIC PARAMETERS | `multiplicationModelFactors.js`, `array.js`, `equalGroups.js`, multiplication-model layout/renderer |
| Relational equations | EXTEND EXISTING FAMILY | Grade 1 controlled `equationMatch.js` pool and `=`/`≠` response contract |
| Word problems | EXTEND EXISTING FAMILY | `wordProblems.js`, shared work-space layout, future curated context registry |
| Data reading/construction | EXTEND EXISTING FAMILY | `grade1DataGraph.js`, context registry, `graphData`/`graphTaskData`, shared pictograph renderer modes |
| Fraction strips/equivalence/fair sharing | EXTEND EXISTING FAMILY only where Grade 2 safe | `grade1Fractions.js`, `fraction_strip` and `fair_share_set` renderer modes; do not reuse formal symbolic legacy defaults |
| Numeric patterning | DIRECT REUSE | `numericPattern.js`, pattern generators, task-specific layout fields, focused test suite |
| Quick Checks | DIRECT REUSE | shared catalog runtime plus `quickCheckPdfRenderer.js` |
| Exit Tickets | DIRECT REUSE | shared catalog runtime plus `exitTicketPdfRenderer.js` |

No genuinely new family is required to start Grade 2 founder review.

## Duplication and supersession findings

| Suspected duplicate | Stronger record | Exact overlap / distinction | Recommendation |
| --- | --- | --- | --- |
| `grade2_addition_subtraction_word_problems_addition_word_problem` | `g2_addition_word_problems_within_100` | Same addition-story task; generated title is weaker | Retire from active review |
| `grade2_addition_subtraction_facts_fact_fluency` | curated addition/subtraction fluency resources | Generic/mixed fact sheet with no clear gap | Keep backup-only; do not promote |
| `grade2_addition_subtraction_facts_word_problems` | three operation-specific word-problem records | Generic title and mixed ownership | Retire from active review |
| `grade2_addition_subtraction_facts_ten_frame` | approved lower-grade ten-frame family | Same 0-10 representation with no Grade 2 distinction | Defer permanently unless a within-20 two-frame task is approved |
| `grade2_place_value_representation_base_ten_blocks` | `g2_base_ten_blocks_representation` | Same generator/task/default range | Retire from active review |
| `grade2_place_value_representation_expanded_form` | `g2_expanded_form_to_100` | Same task; curated record has explicit range | Retire from active review |
| `grade2_place_value_representation_standard_form` | `g2_standard_form_to_100` | Same task; curated record has explicit range | Retire from active review |
| `grade2_multiplication_facts_skip_counting` | `g2_skip_counting_by_2`, `_by_5`, `_by_10` | Generic step choice already represented by precise resources and runtime controls | Treat as customization, not a catalog resource |
| `grade2_addition_subtraction_facts_related_subtraction` | `g2_subtraction_fluency_within_100` | Same current generator/output; title implies a relationship not shown | Consolidate unless founder approves a distinct related-facts design |
| `grade2_addition_subtraction_facts_missing_addend` and `g2_missing_addends_within_100` | `grade2_addition_subtraction_facts_missing_addend` for the within-20 role | Shared generator, but the founder-approved record now has an explicit within-20 title, range, zero-balance, and layout contract; the within-100 record still lacks its adapter | Retain the approved within-20 worksheet; correct or consolidate the within-100 record later |
| `grade2_place_value_representation_compare_numbers` | `g2_compare_numbers_to_100` | Same comparison family but meaningful 3-digit extension framing | Retain both; do not call them duplicates |

## Curriculum-safety findings

- **SAFE AS WRITTEN:** all 18 Category A resources.
- **SAFE WITH NARROWED DEFAULT:** Grade 2 Equal Groups, Shade Fraction Models, Fraction Word Problems/Fair Sharing, and any number-line or number-word extension. Defaults must stay concrete, visual, and grade-banded.
- **SAFE WITH TITLE OR INSTRUCTION CHANGE:** the three `Within 100` fluency/missing-addend records whose runtime is actually within 20; Related Subtraction; Arrays' current count/task contract; Base Ten Blocks' repeated prose; Graph Word Problems; and Multiplication Word Problems.
- **SAFE AS OPTIONAL OVERRIDE:** Compare 3-Digit Numbers, with its optional upper-Grade-2/Grade-3-readiness role retained in teacher-facing framing.
- **DUPLICATE:** the seven superseded/generated shells listed above and generic multiplication Skip Counting.
- **GRADE 3+ DEFERRAL:** symbolic Match Equivalent Fractions, formal Fraction Number Line, Missing Factors, and Function Table. Compare Fractions remains deferred unless redesigned as simple same-whole visual comparison.
- **GENUINE CURRICULUM CONFLICT:** none established. The unsafe cases are default/task/framing problems, not evidence that the catalog must misstate Ontario curriculum.

No official curriculum wording should be rewritten in this preflight. Generated records without curriculum tags must not gain public alignment claims merely because their mathematical topic is plausible.

## Design and print-risk findings

Existing Grade 2 founder-packet PDFs and later excluded family proofs were visually inspected. They show calm typography, clean margins, readable grayscale, stable footers, and no clipping, but the older packet predates several current shared-family decisions and must not be treated as current founder approval.

| Classification | Grade 2 families/resources | Finding |
| --- | --- | --- |
| PRINT-READY | Expanded Form, Standard Form, curated Skip Counting; Numeric Patterning trio; Comparison pair; compact assessments; Fact Families; Missing Addends Within 20; both approved word-problem worksheets | Current proofs use task-specific layouts, readable targets, balanced spacing, public footers, and matching key geometry. |
| MINOR POLISH | none among Category A | Founder-approved Category A proofs have no open typography limitation. |
| FAMILY-LEVEL DESIGN CORRECTION | Grade 2 data; safe Grade 2 fraction extensions; Equal Groups | Generic text rows do not represent the task. Reuse structured graph/fraction/model layouts. |
| RESOURCE-SPECIFIC CORRECTION | Addition/Subtraction `Within 100`, Related Subtraction, Addition Word Problems, Arrays, Base Ten Blocks, Multiplication Word Problems, Graph Word Problems | Fix exact range/copy/count/context/output issue before proof. |
| FOUNDER DESIGN PREFLIGHT REQUIRED | any new Grade 2 data adapter, fraction extension, or materially distinct related-subtraction task | These alter task layouts or answer formats. |
| NOT WORTH CORRECTING - DEFER | duplicate shells, formal symbolic fraction records, Missing Factors, Function Table, planned Pattern Word Problems | No launch-facing value justifies correction now. |

Observed older-packet risks include metadata-style student instructions, visible subtitles, repeated item prose, excess whitespace on low-count generic layouts, repeated single-context word problems, and internal skill slugs in footers. Later shared-family proofs improve several of these, but each reviewed Grade 2 resource still needs a current seeded proof from the committed runtime.

## Existing shared families

Ready for direct Grade 2 founder proof without production implementation:

- Numeric Patterning (three resources).
- Compare Numbers to 100.
- The three Quick Checks and one Exit Ticket.
- The explicitly framed 3-digit comparison extension.

Already founder-approved and launch-ready:

- Expanded Form to 100.
- Standard Form to 100.
- Skip Counting by 2, 5, and 10.
- Fact Families and Missing Addends Within 20.
- Missing Addend Word Problems and Take Away Word Problems.

## New Grade 2 families

**None required for the launch-facing first wave.** All worthwhile Grade 2 work is direct reuse, a grade-parameter adapter, or an extension of an approved family.

Possible later extensions, not new families:

| Extension | IDs | Instructional role / primitives / truth | Renderer and controls | Proofs / risk |
| --- | --- | --- | --- | --- |
| Grade 2 structured data | five D data IDs plus Graph Word Problems after a decision | Read, compare, construct, match, apply; pictograph/bar data package and question truth | Reuse shared data renderer; topic, unit, count, example controls | One default per retained task plus any materially distinct construction mode; MODERATE |
| Grade 2 fraction strips/fair sharing | Shade Fraction Models, Fraction Word Problems | Equal-part shading and concrete fair sharing; structured strip/set truth | Reuse `fraction_strip`/`fair_share_set`; denominator/share/context controls | One default per retained task; MODERATE |
| Grade 2 model multiplication | Arrays, Equal Groups, optional equal-groups word problems | Early multiplication thinking through rows/columns/groups | Reuse multiplication-model renderer; friendly factors, total cap, count, example | Arrays recheck plus Equal Groups default/completed example; LOW-MODERATE |
| Grade 2 number representation | Number Line, Number Word Match | Identify values and connect numerals/words | Reuse number-line and number-word contracts; range/direction/count | One default each after adapter; LOW |

Deterministic mathematics, structured models, answer keys, and validation remain mandatory for all extensions.

## Promotion-only candidates

There are **no promotion-only candidates**.

- All 18 records with explicit founder approval are already ready.
- Category B is zero.
- Generated resources either lack direct Grade 2 founder proof, overlap a stronger record, require an adapter/correction, or are intentionally deferred.
- Category C is empty after the founder-approved four-resource addition/subtraction closeout.

Classification for every non-A record is therefore FOUNDER PROOF STILL REQUIRED, DESIGN RECHECK REQUIRED, METADATA/TASK CLEANUP REQUIRED, or NOT PROMOTION-READY as recorded in the inventory. No status should change during the first review batches.

## Recommended deferrals

| Resource(s) | Reason | Reconsideration trigger |
| --- | --- | --- |
| Three generated place-value duplicates and generated addition-word shell | Superseded by stronger curated records | Permanently defer unless the curated record is retired |
| Generic fact fluency and generic word problems | Weak differentiation/count-padding risk | Founder identifies a distinct mixed-practice teacher use |
| Grade 2 ten-frame shell | Lower-grade duplicate | A distinct two-frame/within-20 representation contract is approved |
| Generic multiplication skip counting | Better as teacher-selected step | Public customization review explicitly needs an all-steps resource |
| Compare Fractions, Match Equivalent Fractions, Fraction Number Line | Formal/symbolic defaults exceed the honest Grade 2 lane or are broken | Grade 3+ review, or founder approves a concrete same-whole visual Grade 2 task |
| Missing Factors | Abstract 60-item multiplication fluency | Grade 3+ founder review |
| Function Table | Explicitly deferred and lacks approved layout | Grade 3+ or a new function-table preflight |
| Pattern Word Problems | Missing generator and no launch gap | A distinct teacher need and generator preflight are approved |

Category G is a disposition record, not a mandatory backlog.

## Resource-kind balance

- 48 worksheets, 3 Quick Checks, and 1 Exit Ticket exist in Grade 2; ready launch-facing mix is 21 worksheets, 3 Quick Checks, and 1 Exit Ticket.
- The inventory is worksheet-heavy, but the compact lane already covers addition, subtraction, and missing-addend formative checks.
- One Exit Ticket is narrow but teacher-relevant and already uses the validated cut-apart renderer.
- The mix is sufficient to proceed. Do not add a resource-kind patch before founder review.
- Reconsider one additional Grade 2 Exit Ticket only after review shows a specific high-value place-value or patterning close-of-lesson gap that directly reuses an approved family.

## Proposed founder-review sequence

No more than six batches are needed.

| Order / batch | Exact IDs | Why together / architecture | Preflight and expected proofs | Risk / dependencies |
| --- | --- | --- | --- | --- |
| 1 - Numeric Patterning, founder approved | `grade2_patterning_and_algebra_extend_pattern`; `grade2_patterning_and_algebra_identify_pattern_rule`; `grade2_patterning_and_algebra_missing_value_pattern` | One mature deterministic family with focused tests and founder-approved task-specific layouts | Focused family preflight and 3 default two-page PDFs complete; completed-Q1 remains deferred | COMPLETE; no dependency |
| 2 - Addition/subtraction relationships, word problems, and formative formats, founder approved | `grade2_addition_subtraction_facts_fact_family`; `grade2_addition_subtraction_facts_missing_addend`; `grade2_addition_subtraction_word_problems_missing_addend_word_problem`; `grade2_addition_subtraction_word_problems_subtraction_word_problem`; three Grade 2 Quick Checks; Grade 2 Exit Ticket | Shared generator truth with worksheet, work-box, compact-key, compact-assessment, and cut-apart renderers | Focused correction, proof packet, and founder review complete | COMPLETE; no dependency |
| 3 - Compare/place-value decisions, partially approved | approved `g2_compare_numbers_to_100`; approved `grade2_place_value_representation_compare_numbers`; `g2_base_ten_blocks_representation`; `grade2_place_value_representation_number_line_identify`; `grade2_place_value_representation_number_word_match` | Shared place-value primitives; preserves meaningful 2-digit/3-digit distinction | Comparison pair complete; adapters/design proof remain for the other three resources | LOW-MODERATE; duplicate place-value shells already excluded |
| 4 - Remaining operation fluency and application decisions | five Category E operation worksheets plus the multiplication word-problem decision | Resolve title/range and context ownership once at family level | Focused correction preflight; one default per retained resource, completed example only where layout changes | MODERATE; settle remaining within-20 vs within-100 roles and context ownership |
| 5 - Structured Grade 2 data extension | six data IDs | Reuse the approved data truth/context/renderer family; do not review prose fallbacks | Founder design preflight required; one default per retained distinct task after adapter | MODERATE; deterministic context and structured-model validators first |
| 6 - Multiplication/fraction close-or-defer decisions | Arrays, Equal Groups, safe fraction-strip/fair-sharing candidates; all G multiplication/fraction records as decision-only rows | Shared model reuse plus explicit deferral of symbolic/later-grade shells | Arrays reduced recheck, Equal Groups default, and one default per retained concrete fraction task; no proof for G rows | MODERATE; Grade 2 default caps and task selection before code |

Numeric Patterning, the six-resource Comparison and Assessment batch, and the final four Category C Addition and Subtraction worksheets are complete. All 18 Category A resources have founder evidence and do not need another broad proof packet.

## Founder CSV plan

Use exactly these columns:

1. Review Number
2. Resource ID
3. Grade
4. Resource
5. Under Review or Reviewed
6. My Recommendations

Plan:

- Order rows by the six family batches, not alphabetically and not by catalog status.
- Put the 18 Category A resources first as reviewed, with their shared-family or focused founder evidence noted; do not ask the founder to re-review identical defaults without a reason.
- Begin the remaining active-review sequence with Batch 2 and keep each family contiguous.
- Separate active review rows from a final decision-only G section. Do not generate proofs for G rows.
- Do not interleave generated/ready merely to balance statuses; status is secondary to family coherence.
- Record suspected duplicates beside their stronger resource and review only the stronger one. Founder recommendations take priority; any conflict with this preflight must be surfaced explicitly, not silently overwritten.
- The existing founder-review packet script can inform row generation, but this planning task does not run or modify it.

## Founder proof-packet plan

Reduced first-wave packet for Batch 1:

| Proposed filename | Resource ID | Mode | Reason |
| --- | --- | --- | --- |
| `g2_extend_pattern_default_student_and_key.pdf` | `grade2_patterning_and_algebra_extend_pattern` | default | Confirms two-column continuation targets and key placement |
| `g2_identify_pattern_rule_default_student_and_key.pdf` | `grade2_patterning_and_algebra_identify_pattern_rule` | default | Confirms two-column structured `Add ______ each time.` response and key placement |
| `g2_missing_value_pattern_default_student_and_key.pdf` | `grade2_patterning_and_algebra_missing_value_pattern` | default | Confirms inline middle-position target and key alignment |

Completed-Q1 behavior is not part of the approved family contract and remains deferred.

Each packet should contain one student page plus its matching answer-key page, use one fixed seed, and stay under excluded `review/`. Do not generate later-batch proofs until duplication and adapter decisions are complete.

## Test and validator gaps

| Area | Current evidence | Gap classification and required future safeguard |
| --- | --- | --- |
| Numeric Patterning | Strong focused test covers exact counts, layouts, answer metadata, examples, pagination, same seed, and skip-counting isolation | **EXISTING COVERAGE SUFFICIENT** for first founder proof |
| Multiplication models | Shared test verifies Grade 2 `×` symbol, but not Grade 2 default count/range/title | **ADD FOCUSED FAMILY TEST** for eight-item contract, friendly factors, visuals, key parity, and Grade 3+ isolation |
| Grade 2 data | Grade 1 test explicitly verifies Grade 2 does not use the Grade 1 structured renderer | **ADD VISUAL-MODEL VALIDATION** after adapter; reject missing graph model, repeated pool exhaustion, and `Math.random` |
| Grade 2 fractions | Grade 1 isolation test confirms Grade 2 has no Grade 1 model but does not reject blank array-shaped problems or zero items | **ADD VISUAL-MODEL VALIDATION** and exact-count/answer checks before any proof |
| Arithmetic ranges | No focused assertion proves titles saying 100 actually generate to 100 | **ADD FOCUSED FAMILY TEST** for Grade 2 defaults, different-seed variation, and title/task match |
| Place value/number representation | Shared generators are tested mainly through Grade 1 or audit | **ADD FOCUSED FAMILY TEST** for Grade 2 range, structured model, response target, page count, and duplicates |
| Quick Checks/Exit Ticket | Earlier route and PDF QA exists in milestone docs | **ADD RECONCILIATION ASSERTION** and retain generic public-flow smoke; no new renderer test family needed |
| Promotion | No B candidates | **ADD PROMOTION ASSERTION** only when an explicitly approved generated record reaches a later gate |
| Reconciliation | No Grade 2 reconciliation test exists | **ADD RECONCILIATION ASSERTION** after the founder review becomes authoritative |
| Catalog audit | Only checks whether generation throws | Add a validator for non-empty item count, prompt/model presence, answer presence, same-seed parity, and title/default contract; do not change it in this planning task |

The current direct scan found one clear seed bypass: `interpretData.js` uses `Math.random` instead of the injected random function. Legacy `shadeFractionModels.js` and `fractionNumberLine.js` also use `Math.random`, but their more immediate failure is returning an array as a single problem.

## Grade 2 closure criteria

Grade 2 founder review closes only when:

- all 52 records remain represented exactly once in the authoritative reconciliation;
- every active candidate has an explicit founder disposition and every conflict is recorded;
- all A/C/D/E movements have evidence and all G deferrals have a trigger or permanent rationale;
- retained families use deterministic structured truth, exact counts, answer-key parity, preview/PDF parity, and honest Grade 2 defaults;
- zero-item, blank-item, text-only visual, seed-bypass, title/range, and active-duplicate issues are resolved or deferred;
- current student/key proofs pass visual review with direct instructions, no default subtitle, readable Grade 2 type, adequate work space, and no clipping/collision;
- focused family tests and the strengthened meaningful-output validator pass;
- public promotion remains a separate explicit gate after founder approval and clean public-flow smoke tests;
- no Grade 3+ behavior changes without an isolation test.

## Risks

- Treating 25 ready records as automatically founder-approved would overstate evidence.
- Treating 26 generated records as usable because the audit does not throw would admit blank, zero-item, repetitive, or misleading resources.
- Reviewing duplicates twice would waste founder attention and inflate apparent breadth.
- Broadly wiring Grade 2 into Grade 1 adapters could accidentally change Grade 1 defaults; adapters must be grade-specific and isolation-tested.
- Old founder-packet PDFs contain stale subtitles/instructions and cannot substitute for current seeded proof.
- Ontario alignment claims are sparse on generated records. Do not infer official expectation coverage from a skill name.

## AI-readiness note

For every proposed family, Yellow Bird's deterministic engine remains authoritative for arithmetic, ranges, structured graphs/models, answer computation, duplicate avoidance, pagination, answer keys, and validation.

- **Arithmetic/relationships:** document Grade 2 ranges, operation/unknown-position rules, and response targets. AI may later suggest practice emphasis or context; it must never calculate answers or choose an unsafe range without validation.
- **Patterning:** document allowed operations, steps, sequence lengths, missing positions, and page capacities. AI may propose a teacher-friendly pattern configuration; deterministic sequence validators decide.
- **Place value/representation:** document range bands and model limits. AI may interpret “easier” or “use hundreds”; Yellow Bird validates model capacity and curriculum framing.
- **Data:** document context registry rules, units, graph structure, question types, and unsafe-language rejection. AI may suggest a familiar topic; it must not invent inconsistent graph truth.
- **Fractions/multiplication models:** document safe Grade 2 denominators/factors, same-whole rules, and visual contracts. AI may propose a concrete context; it must never decide equivalence, product, fair-share truth, or public curriculum claims.
- **Compact resources:** document time/use framing and fixed prompt capacity. AI may suggest a lesson-close emphasis; it must not turn the format into an assessment claim.

All AI-proposed configuration must resolve to approved structured options and pass exact-count, range, truth, duplicate, model, key-parity, and layout validators before preview.

## Recommended next action

Begin with the three-resource Numeric Patterning founder-review batch. It is the smallest coherent unreviewed Grade 2 family, has healthy shared architecture and strong tests, requires no production implementation before proof, and will establish the Grade 2 founder process without mixing in duplicate, range, data, fraction, or model-correction decisions.

After that decision, handle addition/subtraction relationships and compact resources as Batch 2. Do not promote anything, generate broad proofs, or implement Grade 2 adapters before the relevant founder preflight authorizes the family contract.
