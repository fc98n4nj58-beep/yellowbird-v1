May 2026

Decision:
PDF primitives instead of SVG

Reason:
More consistent print output


May 2026

Decision:
Curriculum recipes use contextual keys

Reason:
Ontario expectation codes repeat across grades


May 2026

Decision:
Expectation → Skill → Activity architecture

Reason:
Long-term educational intelligence layer

May 2026

Decision:
Catalog preview and catalog PDF now use a shared runtime service.

Reason:
Reduce duplicated content construction and improve preview/PDF parity.


May 2026

Decision:
Fact fluency generators interpret "within 20" as answer total ≤ 20, not operand values ≤ 20.

Reason:
Educational correctness.


May 2026

Decision:
Question count now accepts URL/teacher inputs through runtime.

Reason:
Teacher control over worksheet density.

July 2026

Decision:
Exit Tickets / Quick Checks become the next Milestone 6 content lane after pausing worksheet promotion at 84 ready worksheets.

Reason:
84 strong worksheets is better than 85 with filler. Short formative resources can deepen the library without reopening broad worksheet promotion or destabilizing the stable worksheet catalog/runtime.

Rules:
- Treat Exit Tickets / Quick Checks as a new resource family, not just smaller worksheets.
- Preserve current worksheet PDFs.
- Start with one compact single-page Quick Check proof of concept.
- Use formative check / review / warm-up / small-group language.
- Do not call these assessments, tests, mastery checks, diagnostics, or summative resources.

July 2026

Decision:
The first Quick Check proof of concept is implemented and verified before scaling the lane.

Reason:
`g3_place_value_hundreds_tens_ones_quick_check` proves compact Quick Check metadata, routing, preview/PDF flow, and separate rendering while preserving normal worksheet PDFs. Worksheet promotion remains paused at 84; ready resources reached 85 through the first Quick Check rather than a filler worksheet.

Rules:
- Review the first Quick Check with Teacher QA / Resource Review before building more.
- Then review honest Grade 3 Ontario math alignment.
- If both pass, build a small first batch of 3-5 Quick Checks.
- Defer two-per-page Exit Tickets until compact Quick Check behavior is stable.

Review update:
- Teacher QA approved `g3_place_value_hundreds_tens_ones_quick_check` as public-ready.
- Curriculum Alignment approved it with minor wording/framing caution.
- Final positioning: a Grade 3 quick formative check for representing 3-digit numbers using hundreds, tens, and ones, best used after place-value instruction as short review or a progress check.
- Do not frame it as a test, diagnostic, mastery check, summative assessment, or full expectation assessment.

July 2026

Decision:
The first controlled Quick Check batch is implemented and verified, then paused for QA/alignment before more scaling.

Reason:
The lane grew from 1 to 4 ready Quick Checks through a small controlled batch while keeping worksheet promotion paused at 84 and preserving normal worksheet PDF rendering.

Rules:
- Review `g2_subtraction_within_20_quick_check`, `g2_addition_within_20_quick_check`, and `g3_compare_3_digit_numbers_quick_check` with Teacher QA before adding more.
- Then complete Curriculum Alignment review for honest Ontario math framing.
- Do not start another Quick Check batch until both reviews pass.
- Continue deferring two-per-page cut-apart Exit Tickets until compact Quick Checks prove stable through QA/alignment.

Review update:
- Teacher QA approved all 3 new Quick Checks as public-ready.
- Curriculum Alignment approved all 3 as public-ready, with minor wording/framing caution for the Grade 2 fact checks.
- The first controlled Quick Check batch has passed both review gates.
- Lane-level caution: do not over-scale simple fact checks; future Quick Checks should gradually include representation, place value, word problems, and strategy-based skills where safe.
- Next decision: build another controlled Quick Check batch of 3-5 or run a read-only feasibility check for the first cut-apart Exit Ticket layout.

July 2026

Decision:
The second controlled Quick Check batch is implemented and verified, then paused for Teacher QA and Curriculum Alignment before more scaling.

Reason:
The lane grew from 4 to 7 ready Quick Checks through another small controlled batch while keeping worksheet promotion paused at 84 and preserving normal worksheet PDF rendering.

Rules:
- Review `g4_compare_fractions_quick_check`, `g2_missing_addends_within_20_quick_check`, and `g4_pattern_rule_quick_check` with Teacher QA before adding more.
- Then complete Curriculum Alignment review for honest Ontario math framing.
- Do not build the next Quick Check batch until both reviews pass.
- Continue deferring two-per-page cut-apart Exit Tickets until compact Quick Checks prove stable through QA/alignment.

Implementation update:
- Commit: `db6bfa0 feat: add second quick check batch`.
- Backup branch: `backup/milestone-6-second-quick-check-batch`.
- Ready resources are now 91 / 91 working, with 84 ready worksheets and 7 ready Quick Checks.
- The implementation changed catalog data only and did not change routes, renderers, or worksheet behavior.
- Minor risk: `g4_compare_fractions_quick_check` may occasionally repeat an exact comparison with the current generator seed; Teacher QA should review it.

Review update:
- Teacher QA approved the second controlled Quick Check batch with caution.
- Curriculum Alignment approved all 3 as public-ready, with wording/framing cautions for Grade 4 fractions and Grade 4 pattern rules.
- The second controlled Quick Check batch has passed both review gates.
- Lane-level caution: upper-grade Quick Checks need sharper topic labels and clear student instructions.
- Duplicate/repeated item caution for fraction comparisons remains a future cleanup risk.
- Next decision: build one final small Quick Check batch of 2-3 resources or run a feasibility check for the first cut-apart Exit Ticket layout.

July 2026

Decision:
The final small Quick Check batch is implemented and verified, then paused for Teacher QA and Curriculum Alignment before formally pausing Quick Check expansion.

Reason:
The lane grew from 7 to 9 ready Quick Checks through a final small batch while keeping worksheet promotion paused at 84 and preserving normal worksheet PDF rendering.

Rules:
- Review `g3_expanded_form_to_standard_form_quick_check` and `g4_multiplication_word_problem_quick_check` with Teacher QA before any further Quick Check decisions.
- Then complete Curriculum Alignment review for the same 2 resources.
- Do not build more Quick Checks unless explicitly reopened after review.
- If both pass, pause Quick Check expansion at 9 and run a read-only Exit Ticket layout feasibility check.
- Continue deferring two-per-page cut-apart Exit Tickets until layout feasibility is complete.

Implementation update:
- Commit: `6b08ca2 feat: add final quick check batch`.
- Backup branch: `backup/milestone-6-final-quick-check-batch`.
- Ready resources are now 93 / 93 working, with 84 ready worksheets and 9 ready Quick Checks.
- The implementation changed catalog data only and did not change routes, renderers, generators, or worksheet behavior.
- Minor limitation: `g4_multiplication_word_problem_quick_check` is Grade 4 review/practice only; do not frame it as deep problem-solving, mastery, assessment, diagnostic, or full Grade 4 multiplication coverage.

## Decision: Worksheet Preview/PDF Parity

Worksheet previews should use the same PDF rendering path as downloads.

Standard flow:

User choices
→ shared runtime
→ seeded worksheet generation
→ PDF renderer
→ inline PDF preview or attachment download

Rules:
- Preview must not use a separate HTML worksheet imitation.
- Preview and downloaded PDF must share the same `worksheetSeed`.
- Random worksheet generation must accept an injected `random` function.
- Routes stay thin.
- Renderer only renders.
