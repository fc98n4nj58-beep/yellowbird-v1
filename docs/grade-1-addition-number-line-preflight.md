# Grade 1 Addition on a Number Line Preflight

Date: 2026-07-13

## Resource and mismatch

- Resource: `g1_addition_on_number_line_to_20`
- Review number: none
- Catalog status: `partial` (unchanged)
- Reconciliation: Category E — “Existing output is identification, not addition modelling”; wrong activity/runtime (`number_line_identify`).
- Previous path: `addition_strategies` -> `number_line_identify` -> marked-number visual -> identification response line.
- Mismatch: family mapping, task content, number-line model, response target, instruction, completed-example count, and title/task alignment. The answer key faithfully repeated the wrong identification task.

`G1 Review.csv` has no row for this resource ID or title, so there is no exact founder note to apply. The nearest approved sibling is review 6, `g1_number_line_identify_to_20`; its note requests numbered questions, one worksheet-level instruction, uncluttered full-width number lines, matching answer keys, variable support, and optional completed examples. The later approved readability decision permits fewer than ten questions when needed. Those presentation rules are reused without treating the sibling note as approval of this addition task.

## Proposed Grade 1 contract

- Curriculum framing: Ontario Grade 1 B2.4 permits objects, diagrams, and equations for addition and subtraction; this resource remains within 20.
- Intended task: one consistent form — given `start + jump = ___`, use one visible forward jump to find the landing number.
- Proposed title: `Addition on a Number Line`.
- Proposed instruction: `Use the number line to solve each addition question.`
- Visual: fixed 0–20 horizontal scale; visible start dot; single left-to-right curved arrow; `+jump` label; marked landing with its number label hidden; readable tick labels and identical scale across questions.
- Response: short answer line in the addition equation. No repeated prose or work box.
- Default: 6 questions, one column, one student page.
- Completed example: optional completed Question 1, inside the six-question total; no Example heading; only the answer value is emphasized; identical geometry.
- Answer key: identical questions and number-line geometry with all equation answers filled.
- Footer: `Grade 1 • Math • Addition & Subtraction`.
- Supported variables: start range, jump range, maximum total, selected starts/jumps, question count, seed, completed Question 1, and answer key.
- Deferred: mixed task forms, backward subtraction jumps, open number lines, multiple unit arcs, public controls, and promotion.
- Smallest safe path: map this resource to a new `addition_number_line` generator and conditional number-line rendering fields; preserve identification and Grade 2+ behavior when those fields are absent.

## Founder decisions still required

1. Approve the single-jump `start + jump = landing` task form.
2. Approve the six-question density and fixed 0–20 scale.
3. Approve the proposed title, instruction, response line, and optional completed Question 1.
4. Decide any later promotion separately; this correction leaves the resource `partial`.

Proposed post-approval classification: A if committed after approval, otherwise B only if the project uses B for an approved-but-uncommitted checkpoint. The main reconciliation remains unchanged in this task.

## Founder-approved model and full-width recheck

- Founder approved the corrected addition model described above.
- Founder required every Grade 1 addition number line to extend from the left content margin to the right content margin.
- Full-width geometry was applied only to `g1_addition_on_number_line_to_20`; all 21 tick positions now share the complete content width.
- The mathematical task, ranges, six-question count, title, instruction, response target, completed Question 1 behavior, answer-key parity, footer, and design hierarchy are unchanged.
- Grade 2+ number-line identification behavior remains unchanged because it does not enable the family-specific full-width option.
- Founder recheck output is limited to two PDFs: default and completed Question 1, each with its matching answer-key page.
