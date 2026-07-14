# Grade 1 Category C Closure Preflight

Date: 2026-07-13

## Scope reconciliation

The reconciliation file formally contains four Category C rows. Two are stale after the later founder-approved and committed checkpoint `6b41015` and are excluded from new implementation/proof work by this batch's explicit guardrail.

| Review | Resource | Catalog | Runtime / generator | Layout | Founder-note status | Why the reconciliation says C | Closure status |
|---|---|---|---|---|---|---|---|
| — | `grade1_multiplication_facts_arrays` — Arrays — Grade 1 | generated | shared array model / `array` | model interpretation, 2 × 4 visual grid | No direct `G1 Review.csv` row; shared-family geometry approved later | Grade 1 proof was absent when reconciliation was written | Founder-approved and committed in `6b41015`; do not revisit |
| — | `grade1_multiplication_facts_equal_groups` — Equal Groups — Grade 1 | generated | shared equal-groups model / `equal_groups` | model interpretation, 2 × 4 visual grid | No direct `G1 Review.csv` row; shared-family geometry approved later | Grade 1 proof was absent when reconciliation was written | Founder-approved and committed in `6b41015`; do not revisit |
| — | `grade1_multiplication_facts_skip_counting` — Skip Counting — Grade 1 | generated | shared controlled sequence / `skip_counting` | one-column structured sequence rows | No direct `G1 Review.csv` row; closure proofs approved after the CSV | Grade 1 range and fit were unproved | Corrected and founder-approved |
| — | `grade1_place_value_representation_expanded_form` — Expanded Form — Grade 1 | generated | shared place-value pool / `expanded_form` | compact representation grid | No direct `G1 Review.csv` row; closure proofs approved after the CSV | Grade 1 range and fit were unproved | Corrected and founder-approved |

The authoritative CSV has 12 reviewed rows and no matching row for any of these four catalog IDs/titles. No founder approval is inferred from that absence. The later approval directive explicitly approves all four closure PDFs and supersedes the proof-pending state recorded here.

## Operational closure contracts

### Skip Counting

- Grade 1 fit: Ontario B1.5 counting to 50 by 1s, 2s, 5s, and 10s.
- Approved sibling: committed shared skip-counting family (`ea17fb0`).
- Title / instruction: `Skip Counting`; “Write the missing numbers in each skip-counting pattern.”
- Default: 8 numbered rows, 6 terms, one missing value, controlled steps `[1, 2, 5, 10]`, values 0–50, arrows on.
- Layout: one page, one column, sequence rows; subtitle hidden; no repeated prompt prose.
- Completed example: optional completed Question 1, inside the 8-question total, no Example heading, answer value only emphasized.
- Answer key: same rows and baselines, with answer-only emphasis.
- Footer: `Grade 1 • Math • Number Patterns`.
- Existing variables retained: fixed step, selected steps, term count, missing count/placement, start, jump visuals, seed.
- Correction: replaced unsafe random steps 2–10 and totals above 50 with Grade 1 defaults while preserving shared-family behavior for other grades.
- Proof: default plus completed-Question-1 PDFs.

### Expanded Form

- Grade 1 fit: two-digit number representation within 50.
- Approved sibling: committed shared place-value forms family (`ea17fb0`).
- Title / instruction: `Expanded Form`; “Write each numeral in expanded form.”
- Default: 18 unique values from 10–50.
- Layout: one page, 3 columns × 6 rows; subtitle hidden; one prompt/target per item.
- Completed example: optional completed Question 1, inside the 18-question total, no Example heading, answer value only emphasized.
- Answer key: exact value and expanded-form parity.
- Footer: `Grade 1 • Math • Number Sense`.
- Existing variables retained: range, selected values, count, completed example, seed.
- Correction: replaced the shared 3-digit/45-question default with a Grade 1-specific range and capacity.
- Proof: default plus completed-Question-1 PDFs.

## Proof and visual result

Founder packet: `review/grade-1-category-c-closure/founder-review/` (4 PDFs; each contains one student page and one matching answer-key page).

All eight rendered pages passed visual inspection: clear title/instruction, readable type, consistent numbering, unambiguous response targets, balanced one-page use, clean footer/margins, answer-key parity, and no clipping, overlap, missing glyphs, or orphan pages.

## Founder decisions

1. Approved: Grade 1 Skip Counting default with 8 six-term rows, steps 1/2/5/10, values to 50, one missing term, and arrows shown.
2. Approved: Grade 1 Expanded Form default with 18 unique two-digit values from 10–50 in a 3 × 6 grid.
3. Approved: completed Question 1 as the optional example convention for both resources.
4. Promotion remains a separate decision. No catalog status or promotion change is included here.

The reconciliation is updated in the approved commit checkpoint: all four former Category C resources are classified A. Their catalog statuses remain unchanged.
