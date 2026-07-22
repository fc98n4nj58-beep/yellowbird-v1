# Grade 3 Architecture Reconciliation

Date: 2026-07-21

Status: current Grade 3 reconciliation source of truth after founder-approved Batch 3. Catalog lifecycle status and reconciliation category are separate concepts.

## Current totals

- A: 22
- D: 14
- E: 2
- G: 15
- Total: 53

The totals reconcile exactly: 22 + 14 + 2 + 15 = 53.

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
| `grade3_place_value_representation_base_ten_blocks` | Base Ten Blocks — Grade 3 | `ready` | D |

Founder approval date: 2026-07-21.

Approved instructions for the three completed resources are:

- `Write each numeral in expanded form.`
- `Write each number in words.`
- `Write each number in standard form.`

Approved shared footer: `Grade 3 • Math • Place Value`.

Protected founder proofs: `review/grade-3-place-value-batch-2/founder-review/`.

Base Ten Blocks remains a shared-family extension: a request for 345 currently produces 34 tens and 5 ones with no hundreds block, and `selectedNumbers` is bypassed. No Base Ten production implementation occurred. Future work requires true hundreds/tens/ones truth, selected-number support, density and print-safety verification, student/key parity, Grade 1/2 isolation and a separate founder proof.

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

The canonical 53-resource row-level inventory remains `docs/grade-3-founder-review-batch-plan.md`. Apart from the four Batch 3 rows moved from E to A above, every resource retains the reviewed A, D, E or G classification recorded in the final column of that ledger. No other row moved during this closeout.

Commit record: committed in this closeout; git history is the authoritative commit identifier.
