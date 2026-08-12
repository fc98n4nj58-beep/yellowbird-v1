# Grade 4 Pattern Rule Quick Check Decision Proof

Date: 2026-08-11
Baseline: `a0c5cf7`
Resource: `g4_pattern_rule_quick_check`

## Decision

Approve a one-up, seven-question Quick Check using the existing structured `identify_pattern_rule` generator and the shared Quick Check renderer. Use the founder-approved instruction `Read each pattern. Write the rule to answer each question.`

This is a narrow current-output correction. It does not require new pattern architecture, a new activity type, lifecycle movement, customization, or changes to the related Grade 4 patterning worksheets.

## Evidence

- The generator already owns the complete sequence, start, step, operation, written rule, accepted normalized rule, duplicate signature, and answer state.
- A seven-question request generates seven deterministic, distinct structured questions through the existing runtime.
- Seven question rows fit safely on one letter-size student page with a separate one-page answer key.
- The one-up layout preserves readable sequences, full-width written-rule response space, direct instructions, the teacher note, and the Grade/Math/Quick Check footer.

## Protected scope

Preserve generator-owned mathematics, same-seed determinism, student/key parity, public lifecycle status, existing Quick Checks, Exit Tickets, standard worksheets, Grade 4 pattern-family contracts, and all deferred customization ideas.

## Implementation checkpoint

The resource now defaults to seven questions and uses the approved direct instruction. Shared Quick Check metadata records one copy with seven items. No other Quick Check default or layout assignment changed.

Verification completed:

- 30 deterministic seeds passed with exact seven-question output, distinct duplicate signatures, valid sequence differences, matching pattern-rule truth, accepted answer state, and two-page student/key output.
- The final student and answer-key pages were rasterized and visually inspected; no clipping, overlap, footer pressure, truncated copy, or weakened written-rule space was found.
- Quick Check, Grade 2 compact assessment, Grade 4 reconciliation, founder-review remaining-corrections, and four-up Exit Ticket isolation suites passed.
- Catalog audit: 102/102 ready resources working; the only failures are the seven established planned `pattern_word_problems` gaps.
- Syntax checks, catalog JSON parsing, and diff hygiene passed.
