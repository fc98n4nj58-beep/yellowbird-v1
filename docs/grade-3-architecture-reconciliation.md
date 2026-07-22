# Grade 3 Architecture Reconciliation

Date: 2026-07-22

Status: Grade 3 architecture reconciliation is founder-approved and closed. Catalog lifecycle status and reconciliation category remain separate concepts.

## Current totals

- A: 36
- D: 0
- E: 0
- G: 17
- Total: 53

The totals reconcile exactly: 36 + 0 + 0 + 17 = 53. No D or E resources remain.

## Founder-approved final reconciliation movement

Applied movement: D1 -> A1 and E1 -> G1.

| Resource ID | Founder disposition | Catalog status | Reconciliation | Final contract or rationale |
| --- | --- | --- | --- | --- |
| `grade3_place_value_representation_base_ten_blocks` | founder-approved | `ready` | A | `Read Base Ten Blocks`; 8 unique values from 100-499; 4 per page; two student and two key pages; exact hundreds/tens/ones truth; selected-number support; measured full-height centring; 50-point flats; 9-point internal hundreds gaps; unchanged 4-point tens/ones and 10-point place-value group gaps |
| `grade3_fraction_equivalence_match_equivalent_fractions` | founder-approved deferral | `ready` | G | `NEW ARCHITECTURE NEEDED — DEFER`; current equation completion has no candidate set, unique correct match, verified distractors or matching response state |

Founder approval date: 2026-07-22.

Base Ten Blocks was completed through the existing shared primitive with a resource-scoped Grade 3 adapter. Each item explicitly stores represented value, hundreds, tens, ones, visual truth, answer truth and duplicate state; `hundreds × 100 + tens × 10 + ones` equals the represented value. Strict range and selected-number validation cover 100-499. The approved one-column layout uses four questions per page and measures the complete model before centring it with at least 14 points of top and bottom breathing room. The final founder corrections preserve flat size, answer-line placement and separator positions while separating adjacent hundreds flats horizontally and vertically by 9 points. Grade 1 and Grade 2 spacing is unchanged.

Match Equivalent Fractions remains the existing equation-completion activity and was not implemented or renamed. A future reconsideration requires a source fraction, candidate fractions, exact integer equivalence truth, exactly one correct equivalent candidate, provably non-equivalent distractors, an approved matching or selection layout and unambiguous answer-key state.

All 53 canonical ledger rows remain unique. Exactly Base Ten Blocks moved D -> A and exactly Match Equivalent Fractions moved E -> G. Catalog lifecycle statuses remain unchanged, no Grade 3 public customization family was registered, and documented G deferrals are not launch failures. Batches 1-7 remain closed; Grade 3 architecture reconciliation is complete.

## Founder-approved Batch 7 movement

Applied movement: D5 -> A5.

| Resource ID | Founder-approved title | Catalog status | Reconciliation | Approved default |
| --- | --- | --- | --- | --- |
| `g3_complete_a_graph` | Complete the Graph | `ready` | A | one four-category source table and partially completed pictograph; exact completed key; values 2-8; 2 pages |
| `g3_graph_questions` | Answer Questions About a Graph | `ready` | A | one pictograph and six exact retrieval/most/least/difference/combined/total questions; 2 pages |
| `g3_interpret_data` | Interpret the Data | `ready` | A | four objective category-neutral statements; two Yes and two No; 2 pages |
| `g3_match_data_to_graph` | Choose the Matching Pictograph | `ready` | A | two table-to-A/B tasks; one exact match and one single-category ±1 distractor; 2 pages |
| `g3_read_a_graph` | Read the Graph | `ready` | A | six direct-reading questions; all four categories before repetition; changed prompt form on repeats; 2 pages |

Founder approval date: 2026-07-22. No resource is split, blocked or deferred.

The shared family owns one canonical pictograph model before wording and rendering, exactly four unique categories, unique whole-number values 2-8, scale 1, whole symbols only, five distinct task actions, generator-owned graph/question/answer truth and renderer-owned geometry only. Student/key parity and deterministic seeded generation are preserved. No Grade 3 public customization family was registered.

Founder review identified that structured value 9 exceeded the shared renderer's established eight-symbol capacity. The Grade 3 range was narrowed from 2-9 to 2-8; explicit and mixed value-9 inputs now fail in full, valid `[5,6,7,8]` selections remain supported, and matching distractors remain inside the safe range. No renderer expansion was required. Interpretation statements now use category-neutral grammar, and Read the Graph covers every category before any repeat while changing prompt form for repeated categories. Regenerated proofs pass exact table/graph and answer-key parity.

Baseline-only regression maintenance aligned `scripts/testGrade1CategoryFBatch3Data.js` from Ready 103 to 104 and Partial 6 to 5; `scripts/testGrade2PictographReadingBatch.js` from A28 to A35 and G15 to G17; and the Grade 2 Complete and Matching Pictograph suites from A28 to A35. Canonical sources are `docs/grade-2-architecture-reconciliation-preflight.md`, `docs/grade-2-category-d-shared-family-preflight.md` and `docs/grade-3-founder-review-batch-plan.md`. No functional graph expectation changed.

Protected founder and stress proofs: `review/grade-3-data-displays-batch-7/`. No proof is committed.

All five catalog lifecycle statuses remain `ready`; no promotion or demotion occurred.

Commit record: committed in this closeout; git history is the authoritative commit identifier.

## Founder-approved Batch 6 movement

Applied movement: E1 -> A1, D1 -> A1 and D1 -> G1.

| Resource ID | Disposition | Catalog status | Reconciliation | Approved default or rationale |
| --- | --- | --- | --- | --- |
| `grade3_fraction_equivalence_compare_fractions` | founder-approved | `ready` | A | 12 proper-fraction comparisons; four `<`, four `>` and four `=`; denominators 2, 3, 4, 5, 6 and 8; 2 pages |
| `grade3_fraction_equivalence_fraction_number_line` | founder-approved | `generated` | A | 6 full-width 0-to-1 lines; denominators 2, 3, 4, 5, 6 and 8; partition-denominator answers; 2 pages |
| `grade3_fraction_equivalence_fraction_word_problems` | founder-approved deferral | `generated` | G | no distinct approved role; reconsider only after one curriculum-safe fraction-application lane is defined |
| `grade3_fraction_equivalence_match_equivalent_fractions` | founder-approved deferral | `ready` | G | current equation-completion task is not true matching; `NEW ARCHITECTURE NEEDED — DEFER` until a separate matching-set contract is approved |

Founder approval date: 2026-07-22.

Approved public copy is `Compare Fractions`; `Write >, <, or = to compare each pair of fractions.` and `Fractions on a Number Line`; `Write the fraction shown by the point on each number line.` Both use the footer `Grade 3 • Math • Fractions`.

Compare Fractions owns exact integer cross-product truth, balanced comparison symbols, reversal-safe duplicate prevention and student/key parity. Fraction Number Line owns exact partition, tick, target-index, numerator/denominator, label, endpoint and answer truth; partition-denominator answers remain unsimplified. Both preserve deterministic seeds and their documented raw-runtime variables.

Founder review identified a narrow validation defect: unsupported denominator inputs could be filtered away before fallback, and explicit comparison fractions could bypass the safe denominator contract. The corrected path rejects unsupported or mixed selections in full, validates every explicit fraction, preserves valid denominator subsets and endpoint inputs, and rejects duplicate number-line targets. Invalid-input coverage was added. The approved default proofs remained page-for-page raster-identical after correction, and all affected regressions exit successfully.

Protected founder proofs: `review/grade-3-fraction-batch-6/founder-review/`. No proof is committed.

Catalog lifecycle statuses remain `ready`, `generated`, `generated` and `ready` for Compare, Number Line, Fraction Word Problems and Match respectively. No promotion, demotion or Grade 3 public customization registration occurred.

Commit record: committed in this closeout; git history is the authoritative commit identifier.

## Founder-approved Batch 5 movement

Applied movement: D3 -> A3.

| Resource ID | Founder-approved title | Catalog status | Reconciliation | Approved default |
| --- | --- | --- | --- | --- |
| `g3_equal_sharing_division` | Equal Sharing Division | `partial` | A | 8 questions; groups and items per group 2-6; totals no greater than 36; 6 pages |
| `grade3_fraction_equivalence_shade_fraction_models` | Shade the Fraction | `generated` | A | 8 proper-fraction strip models; denominators 2, 3, 4, 5, 6 and 8; 2 pages |
| `grade3_place_value_representation_number_line_identify` | Identify Numbers on a Number Line | `generated` | A | 6 full-width number lines; values 100-1,000; intervals 10, 25, 50 and 100; 2 pages |

Founder approval date: 2026-07-22. No correction round was required and no resource was split or blocked.

Approved instructions are:

- `Share the dots equally. Complete the division equation.`
- `Shade each model to show the fraction.`
- `Write the number shown by the point on each number line.`

Approved footers are `Grade 3 • Math • Multiplication and Division`, `Grade 3 • Math • Fractions` and `Grade 3 • Math • Place Value` respectively.

Protected founder proofs: `review/grade-3-concrete-visual-batch-5/founder-review/`.

The renderer-capability gate passed for all three exact IDs. Equal Sharing uses the existing shared equal-sharing visual model, with visible source dots, empty student containers and completed key containers. Shade the Fraction uses equal-part fraction strips, with unshaded student models and key shading equal to the numerator. Number Line uses the existing full-width model with ten intervals, hidden target labels, aligned response lines and exact restored key values. Student/key parity is derived from each stored structured-truth record rather than reconstructed from rendered marks.

Equal Sharing preserves exact total, groups, items-per-group, quotient, distribute task mode, response values and grouping state; its approved density is three questions per page after the pre-approval collision check. Shade the Fraction preserves numerator, denominator, part/shade counts, strip model, answer state and duplicate signature. Number Line preserves bounds, interval, tick count, target index/value, endpoint policy, displayed labels, response and visual data; endpoint targets remain supported.

All documented selectors, ranges, pagination inputs, completed-example aliases, deterministic seed and answer-key inputs remain raw-runtime-only where supported. The catalog records remain `partial`, `generated` and `generated`; no lifecycle promotion or demotion occurred. No Grade 3 public customization family was registered.

Commit record: committed in this closeout; git history is the authoritative commit identifier.

## Founder-approved Batch 4 movement

Applied movement: D3 -> A3.

| Resource ID | Founder-approved title | Catalog status | Reconciliation | Approved default |
| --- | --- | --- | --- | --- |
| `grade3_addition_subtraction_word_problems_addition_word_problem` | Addition Word Problems | `generated` | A | 12 questions; addends 10-90; totals within 100; 6 pages |
| `grade3_addition_subtraction_word_problems_missing_addend_word_problem` | Missing Addend Word Problems | `generated` | A | 12 questions; 6 first-addend and 6 second-addend unknowns; totals within 100; 6 pages |
| `grade3_addition_subtraction_word_problems_subtraction_word_problem` | Subtraction Word Problems | `generated` | A | 12 questions; minuends 20-100; non-negative differences; 6 pages |

Founder approval date: 2026-07-22.

Approved shared footer: `Grade 3 • Math • Addition and Subtraction`.

Protected founder proofs: `review/grade-3-story-problems-batch-4/founder-review/`.

All three resources preserve arithmetic-first structured truth, student/key parity, four student pages with three full-width work-box questions per page, two compact answer-key pages, curated names and objects, seeded determinism, range and selection inputs, context and object selectors, completed-example aliases and pagination controls. Missing Addends preserves explicit missing-position truth and the 6/6 default balance.

The founder-approved correction round revised exactly `g3_add_question_first`, `g3_missing_second_question`, `g3_missing_second_complete`, `g3_sub_checked_out`, `g3_sub_difference` and `g3_sub_remaining`. The approved prompts use direct classroom language with correct `he`, `she` and `they` agreement and exclude the six rejected machine-like forms recorded in the Batch 4 test.

All three catalog records remain `generated`; no lifecycle promotion occurred. No Grade 3 public customization family was registered. The founder-approved proof packet requires no further correction round.

Commit record: committed in this closeout; git history is the authoritative commit identifier.

## Founder-approved Batch 3 movement

Applied movement: E4 -> A4.

| Resource ID | Founder-approved title | Catalog status | Reconciliation | Approved default |
| --- | --- | --- | --- | --- |
| `grade3_addition_subtraction_facts_equation_match` | Equal or Not Equal? | `generated` | A | 12 questions; 6 equal and 6 not equal; results within 100; 2 pages |
| `grade3_addition_subtraction_facts_fact_family` | Addition and Subtraction Fact Families | `generated` | A | 12 groups; 2 columns; distinct addends; totals within 100; 2 pages |
| `grade3_addition_subtraction_facts_fact_fluency` | Addition and Subtraction Facts | `generated` | A | 24 questions; 12 addition and 12 non-negative subtraction; results within 100; 2 pages |
| `grade3_addition_subtraction_facts_missing_addend` | Missing Addends | `generated` | A | 24 questions; balanced missing positions; totals within 100; 2 pages |

Founder approval date: 2026-07-21.

Approved shared footer: `Grade 3 • Math • Addition and Subtraction`.

Protected founder proofs: `review/grade-3-addition-subtraction-batch-3/founder-review/`.

The closeout records four exact generator corrections: genuine Grade 3 relational pairs, Grade 3-scoped selected-number fact families, exact mixed-operation fluency, and balanced side-specific missing-addend truth. Grade 1, Grade 2 and generic fallback paths remain isolated.

The four catalog records remain `generated`; no lifecycle promotion occurred. No Grade 3 public customization family was registered. The stale reconciliation-only assertions in the Grade 2 Category D Low-Risk and Category E Batch 2 suites were updated to the approved Grade 2 A35 / D0 / E0 / G17 / Total52 source of truth, with runtime assertions preserved.

Commit record: committed in this closeout; git history is the authoritative commit identifier.

## Founder-approved Batch 2 movement

Applied movement: E3 -> A3 and E1 -> D1.

| Resource ID | Founder-approved title | Catalog status | Reconciliation |
| --- | --- | --- | --- |
| `grade3_place_value_representation_expanded_form` | Expanded Form | `ready` | A |
| `grade3_place_value_representation_number_word_match` | Write Number Words | `ready` | A |
| `grade3_place_value_representation_standard_form` | Standard Form | `ready` | A |
| `grade3_place_value_representation_base_ten_blocks` | Read Base Ten Blocks | `ready` | A |

Founder approval date: 2026-07-21.

Approved instructions for the three completed resources are:

- `Write each numeral in expanded form.`
- `Write each number in words.`
- `Write each number in standard form.`

Approved shared footer: `Grade 3 • Math • Place Value`.

Protected founder proofs: `review/grade-3-place-value-batch-2/founder-review/`.

Base Ten Blocks was split here historically and completed in the final reconciliation closeout. It now owns true hundreds/tens/ones decomposition, strict selected-number support, the approved 100-499 range, eight-question/four-per-page default, four-page student/key PDF and founder-approved measured geometry. The final movement is D -> A without lifecycle promotion.

All four catalog records remain `ready`. Catalog lifecycle status remains separate from reconciliation category; no resource was promoted or demoted.

## Founder-approved Batch 1 movement

Applied movement: E3 -> A3.

| Resource ID | Founder-approved title | Catalog status | Reconciliation |
| --- | --- | --- | --- |
| `grade3_patterning_and_algebra_extend_pattern` | Extend the Pattern | `ready` | A |
| `grade3_patterning_and_algebra_identify_pattern_rule` | Identify the Pattern Rule | `ready` | A |
| `grade3_patterning_and_algebra_missing_value_pattern` | Find the Missing Number | `ready` | A |

Founder approval date: 2026-07-21.

Approved instructions remain:

- `Extend each pattern. Write the next number.`
- `Write the rule for each pattern.`
- `Write the missing number in each pattern.`

Approved shared footer: `Grade 3 • Math • Patterning & Algebra`.

Protected founder proofs: `review/grade-3-numeric-patterning-batch-1/founder-review/`.

Commit record: committed in this closeout; git history is the authoritative commit identifier.

## Remaining classifications

The canonical 53-resource row-level inventory remains `docs/grade-3-founder-review-batch-plan.md`. Batch 7 changed exactly the five structured data-display resources from D -> A. Batch 6 changed exactly Compare Fractions E -> A, Fraction Number Line D -> A and Fraction Word Problems D -> G. The final closeout changed exactly Base Ten Blocks D -> A and Match Equivalent Fractions E -> G. Every other resource retains its prior A, D, E or G category; D and E are empty.

Commit record: committed in this closeout; git history is the authoritative commit identifier.
