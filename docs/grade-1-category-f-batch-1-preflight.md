# Grade 1 Category F Batch 1 Preflight

Date: 2026-07-14
Status: founder approved; approved implementation ready for commit; no promotion change

## Distinct-use gate

`G1 Review.csv` has no direct row for any candidate. Approved sibling notes are design guidance only.

| Candidate | Canonical comparison | Verdict | Product reason |
| --- | --- | --- | --- |
| `grade1_addition_subtraction_facts_equation_match` | Addition Facts, Subtraction Facts, and Fact Families | **PROCEED — DISTINCT STUDENT TASK** | Students compare two complete expressions and decide whether their values match. This is relational equivalence reasoning, not fact recall or completing one open equation. |
| `grade1_addition_subtraction_facts_missing_addend` | `g1_missing_addends_within_20` | **DEFER — NEAR DUPLICATE** | Both ask students to supply one missing addend in an addition equation using the same dense short-number response. The candidate adds no distinct student action or teacher format. |
| `grade1_place_value_representation_compare_numbers` | `g1_compare_numbers_to_20` | **DEFER — NEAR DUPLICATE** | Both ask students to insert `>`, `<`, or `=` between two numerals. A different title and unsafe generic range do not create a distinct resource. |

Only the relational `=` / `≠` task proceeds; the founder approved it as distinct and worth keeping. Deferred candidates receive no implementation or founder PDFs and are classified in reconciliation Category G as deliberate near-duplicate product deferrals.

## Equal or Not Equal? contract

- Curriculum: Ontario Grade 1 C2.2–C2.3, equivalent addition and subtraction expressions; values remain 0–20.
- Title: `Equal or Not Equal?`.
- Instruction: `Solve both sides. Write = if they have the same value. Write ≠ if they have different values.`
- Task: compare one addition expression with one subtraction expression; fill one centred symbol target with `=` or `≠`.
- Default: 12 unique questions, balanced six equivalent and six non-equivalent pairs, two columns by six rows, one student page.
- Layout: numbered questions, hidden subtitle, no repeated prose, no separators, Grade 1-readable type, no extra response line.
- Completed-example mode: Questions 1 and 2 both count inside the 12-question total. Question 1 demonstrates equal and is completed with `=`; Question 2 demonstrates not equal and is completed with `≠`; Questions 3–12 remain unanswered. There is no Example heading, and only the inserted response symbols are emphasized.
- Family-specific exception: using two completed questions is an approved exception to the standard completed Question 1 rule because this task has two distinct response states.
- Answer key: identical order and geometry with only the symbols filled.
- Footer: `Grade 1 • Math • Addition & Subtraction`.
- Runtime: seeded Grade 1-only candidate pool in the shared `equationMatch` generator; generic and Grade 2+ behavior remains unchanged.
- Status: `generated` remains unchanged; no public UI or promotion.

## Risks and founder decisions

Founder approved the expression-pair interpretation, the `=`/`≠` response, the 12-question two-column density, the 0–20 scope, and the two completed response-state examples. Missing Addend remains deferred as a near duplicate, and Compare Numbers remains deferred as a near duplicate. Both are recorded in reconciliation Category G and must not be implemented without a new distinct-use decision.
