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
The final small Quick Check batch is implemented, verified, reviewed, and Quick Check expansion is now paused intentionally at 9.

Reason:
The lane grew from 7 to 9 ready Quick Checks through a final small batch while keeping worksheet promotion paused at 84 and preserving normal worksheet PDF rendering.

Rules:
- Do not build more Quick Checks unless explicitly reopened after review.
- Run a read-only Exit Ticket layout feasibility check next.
- Continue deferring two-per-page cut-apart Exit Tickets until layout feasibility is complete.
- Future Quick Checks can resume later after Exit Ticket feasibility and/or teacher testing.

Implementation update:
- Commit: `6b08ca2 feat: add final quick check batch`.
- Backup branch: `backup/milestone-6-final-quick-check-batch`.
- Ready resources are now 93 / 93 working, with 84 ready worksheets and 9 ready Quick Checks.
- The implementation changed catalog data only and did not change routes, renderers, generators, or worksheet behavior.
- Minor limitation: `g4_multiplication_word_problem_quick_check` is Grade 4 review/practice only; do not frame it as deep problem-solving, mastery, assessment, diagnostic, or full Grade 4 multiplication coverage.

Review update:
- Teacher QA approved both final Quick Checks.
- Curriculum Alignment approved both final Quick Checks.
- `g3_expanded_form_to_standard_form_quick_check` is public-ready.
- `g4_multiplication_word_problem_quick_check` is public-ready as equal-groups review/practice with wording/framing caution.
- Catalog wording for `g4_multiplication_word_problem_quick_check` now frames it as equal-groups multiplication review or warm-up practice.

July 2026

Decision:
The first Exit Ticket proof of concept is implemented and verified before scaling the Exit Ticket lane.

Reason:
`g3_expanded_form_to_standard_form_exit_ticket` proves the cut-apart Exit Ticket format while keeping worksheet promotion paused at 84, Quick Check expansion paused at 9, and normal worksheet/Quick Check rendering protected.

Rules:
- Build exactly one Exit Ticket proof of concept before any batch work.
- Use a separate Exit Ticket renderer rather than extending the worksheet renderer or folding Exit Tickets into the Quick Check renderer.
- Keep Exit Tickets framed as lesson-close formative checks, not assessments, diagnostics, mastery checks, summative resources, or full expectation coverage.
- Do not build more Exit Tickets until Teacher QA and Curriculum Alignment review this proof of concept.

Implementation update:
- Commit: `7b568be feat: add first exit ticket resource`.
- Backup branch: `backup/milestone-6-first-exit-ticket`.
- Ready resources are now 94 / 94 working, with 84 ready worksheets, 9 ready Quick Checks, and 1 ready Exit Ticket.
- The implementation added one catalog item, a separate Exit Ticket renderer, a narrow `resourceType === "exit_ticket"` route branch, and small Browse/detail/preview label handling.
- Normal worksheet rendering and Quick Check rendering were not changed.
- The PDF is letter portrait with two identical cut-apart tickets on page 1 and a readable answer key on page 2.
- Minor limitation: the first Exit Ticket uses two identical tickets and one shared answer key because that is safest for proof of concept.

Review update:
- Teacher QA approved the first Exit Ticket proof of concept as public-ready with minor wording/framing caution.
- Curriculum Alignment approved the first Exit Ticket proof of concept as public-ready.
- `g3_expanded_form_to_standard_form_exit_ticket` has strong Grade 3 place-value / Number fit.
- The skill focus is honest and specific.
- Three prompts are enough for a lesson-close formative signal, not mastery.
- Current title, student instructions, teacher note, description, estimated time, and answer key framing are safe.
- No wording change is required.
- Approved public framing: a Grade 3 cut-apart Exit Ticket for writing 3-digit numbers in standard form from expanded form, best used as a 3-5 minute formative lesson-close check after place-value instruction.

Lane decision:
- Exit Ticket lane is approved for cautious continuation.
- Next recommended step is a tiny controlled Exit Ticket batch of 2-3 narrow, low-risk skills.
- Do not build a broad Exit Ticket expansion yet.
- Worksheet promotion remains paused at 84.
- Quick Check expansion remains paused at 9.

July 2026

Decision:
Milestone 6 — Content Expansion / Resource Depth closes at 96 ready resources rather than forcing 100.

Reason:
The near-closeout checklist passed with 96 / 96 ready resources working, 0 ready failures, no missing ready answer keys, no duplicate ready titles, and no launch-facing overclaim blocker. The remaining content opportunities are future improvements rather than closeout blockers.

Rules:
- Content expansion is paused, not failed.
- Worksheet promotion remains paused at 84.
- Quick Check expansion remains paused at 9.
- Exit Ticket expansion remains paused at 3.
- Preserve the guiding decision: 96 strong launch resources is better than forcing 100.
- Move next into Milestone 7 — Deployment / Controlled Teacher Testing Preparation.
- Do not start accounts, payments, memberships, AI features, lesson slides, Morning Math, unit plans, games, or broad Content Excellence by default.

Scaling cautions:
- Exit Tickets should be lesson-close tools, not mini worksheets.
- Keep teacher notes tied to instruction: "after a lesson on..." or "after practice with...".
- Avoid mastery, diagnostic, test, assessment, summative, and full-coverage language.
- Use precise skill titles.
- Be careful with word problems and explanations because they need more workspace.
- Identical cut-apart tickets and shared answer keys are acceptable for now.
- A/B versions can be considered later, but are not required.

## Decision: Grade 2 Compare 3-Digit Numbers Extension

Decision:
Promote `grade2_place_value_representation_compare_numbers` only with explicit extension/readiness framing.

Reason:
Teacher QA and Curriculum Alignment approved the resource after the builder mapping fix, but only when the 3-digit range is made public-facing and honest. The resource adds a focused upper Grade 2 extension / Grade 3 readiness use case beyond the existing Grade 2 compare-to-100 worksheet.

Rules:
- Title: `Compare 3-Digit Numbers — Grade 2 Extension`.
- Topic: `Place Value: Compare 3-Digit Numbers`.
- Frame as selected printable practice after instruction with hundreds, tens, and ones.
- Do not frame as standard Grade 2 number coverage, mastery, assessment, diagnostic, full place-value unit, or official curriculum coverage.
- Keep `grade3_place_value_representation_compare_numbers` held because it overlaps closely with existing Grade 3 compare-number Quick Check and Exit Ticket coverage.
- Keep `grade4_place_value_representation_compare_numbers` held because its current generated range is too light for Grade 4.

## Decision: Milestone 8 Founder Review Pause

Decision:
Pause broad worksheet promotions while the founder reviews the current 85 ready worksheet PDFs.

Reason:
The founder review will identify patterns that should shape future worksheet batches: title/content mismatch, weak teacher-use cases, repetitive prompts, too-easy or too-hard resources, thin upper-grade resources, layout/spacing issues, answer-key issues, and resources that should be reframed as review/extension, revised, held, or rejected.

Current state:
- Ready resources: 103 / 103 working, 0 failures.
- Ready worksheets: 85.
- Ready Quick Checks: 11.
- Ready Exit Tickets: 7.
- Milestone 8 target remains 250 total ready resources: 180 worksheets, 45 Quick Checks, and 25 Exit Tickets.
- Remaining to target: +147 total resources, +95 worksheets, +34 Quick Checks, and +18 Exit Tickets.
- Local founder review packet exists at `review/worksheet-founder-review/`, is intentionally untracked for now, and should not be treated as production source.
- The packet contains 85 ready worksheet PDFs and excludes Quick Checks, Exit Tickets, and generated/partial/planned resources.

Rules:
- PDF-safe does not equal teacher-useful.
- Future worksheet promotion should require title/content match, clear teacher-use case, grade fit, honest framing, and clean PDF output.
- Codex may continue audits, docs cleanup, review-packet support, generator diagnostics, tiny safe fixes, route/runtime verification, and issue backlog organization.
- Do not promote broad worksheet batches, mass-promote generated resources, add new content lanes, expand visual Quick Checks, implement decimals/geometry/measurement/financial literacy, or change public claims based on future content during the pause.
- Keep Grade 3 compare-number worksheet held due to overlap with existing Grade 3 Quick Check and Exit Ticket.
- Keep Grade 4 compare-number worksheet held because the current range is too light.
- Continue treating equivalent-fractions prompt variety, Grade 5/6 foundational framing, visual Quick Checks, decimal resources, and planned `pattern_word_problems` failures as active cautions/deferred work.

July 2026

Decision:
New worksheet families and major worksheet-family redesigns require a Founder Worksheet Design Preflight before implementation.

Reason:
Recent Addition Facts and Numeric Patterning work showed that architecture-first implementation is not enough. Founder design decisions about headers, instructions, task-specific layouts, answer targets, typography, pagination, completed examples, answer keys, footers, and teacher variables need to be applied before code is written so first proof packets are closer to approval.

Rules:
- Use `docs/worksheet-design-preflight.md` before implementing any new worksheet family, major family redesign, new task-family layout, public customization candidate, new answer format, or new pagination behavior.
- Follow the workflow: Architecture scan -> Founder Design Preflight -> Variable contract -> Implementation -> Proof packet -> Founder review -> Commit.
- Do not claim this process retroactively invalidates already approved families.
- Addition Facts remains the first complete public customization prototype.
- Numeric Patterning is the first family completed after applying more formal task-specific layout review.
- Function Tables remain deferred.
- Arrays customization remains deferred.
- No new family is selected by this workflow decision.

## Decision: Place Value Forms + Skip Counting Founder Closeout

Decision:
Treat the Expanded Form, Standard Form, and Skip Counting worksheet-family implementation as founder-approved and ready for controlled production commit review.

Reason:
The family work standardizes recurring worksheet behavior at reusable generator, runtime, and renderer levels instead of one-off resource edits. It improves teacher-use quality while preserving the current 103-resource ready baseline.

Rules:
- Expanded Form and Standard Form use shared grade-aware value-pool generation with seeded variation, duplicate avoidance, selected-number support, selected-range support, completed examples, and answer-key parity.
- Standard Form keeps the approved dense layouts and uses blank writing space after the equals sign with no student response line.
- Skip Counting uses structured sequence rows, curved left-to-right arrows, printable progressive fade, visual toggle support, term-count and missing-value controls, beginning/end/random missing placement, seeded parity, completed examples, and aligned answer-key baselines.
- Review artifacts under `review/` remain local QA proofs and should not be included in production commits.
- Counts remain 103 / 103 ready resources working, 0 ready failures, 85 worksheets, 11 Quick Checks, and 7 Exit Tickets.

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

## Decision: Grade 1 Cleanup Pass B

The 12 existing ready Grade 1 worksheets received controlled Teacher QA / print-layout cleanup during the founder review pause.

Rules:
- No resources were promoted, added, or removed.
- Student worksheet directions should be direct to the student, not teacher/catalogue copy.
- Item numbers should be visible on Grade 1 worksheets.
- Number-line and word-problem pages may use fewer prompts per page when readability requires it.
- `g1_ten_frame_addition_within_10`, `g1_number_word_match_to_50`, and `grade1_place_value_representation_base_ten_blocks` keep their title/task alignment fixes from Pass A.
- Updated review PDFs live in `review/grade1-cleanup-pass-b/`.
- Ready counts remain 103 total resources, 85 worksheets, 11 Quick Checks, and 7 Exit Tickets.

## Decision: Grade 1 Founder Review System Closeout

Decision:
Close the approved Grade 1 founder-review implementation as one controlled production/docs commit after staged-file review.

Reason:
The Grade 1 founder review produced reusable improvements that belong in the shared worksheet system before more content is added. The 12 existing ready Grade 1 worksheets are approved, and the shared renderer/runtime now supports the accepted Grade 1 defaults, task-family layouts, answer-key alignment, answer-only bold styling, completed examples, and teacher-variable generation controls.

Rules:
- Do not add, remove, or promote resources as part of the Grade 1 closeout.
- Keep review PDFs, rendered PNGs, CSVs, and QA packets under `review/` out of the production commit.
- Commit only approved production code/config/catalog/docs; do not include older untracked SVG visual experiments or empty preview folders without a separate decision.
- Grade 1 curriculum defaults remain conservative: facts/comparisons/number lines to 20, ten frames within 10 by default, number words/base-ten to 50 where explicitly framed.
- Runtime custom-range options may exceed defaults only with honest teacher-facing range notices.
- Completed examples use the same geometry and answer-style rules as answer keys.
- Answer keys bold only inserted answers; surrounding text remains regular.
- Short numeral/symbol answers center on supported answer targets; written number words remain left-aligned; word-problem work boxes keep their approved behavior.
- Font-size variable controls, public teacher-control UI, and broader number-line label-mode controls remain deferred to later task-family-aware work.
- Ready counts remain 103 total resources, 85 worksheets, 11 Quick Checks, and 7 Exit Tickets.

## Decision: Multiplication Models Family Closeout

Decision:
Treat the Arrays, Multiplication Equal Groups, and Equal Sharing Division worksheet-family implementation as founder-approved and ready for controlled production commit review.

Reason:
The batch standardizes multiplication model worksheets at reusable generator, runtime, and renderer levels while preserving the current 103-resource ready baseline.

Rules:
- Worksheet subtitles are hidden by default in shared worksheet PDFs; explicit subtitle support is retained for a catalog/family/layout that intentionally requests one.
- Student-facing instructions remain below the divider.
- Arrays and Multiplication Equal Groups use fixed 8-question, 2-column x 4-row visual grids.
- Arrays use canonical dot diameter with adaptive spacing, place models near the question-number gutter, and anchor equations bottom-right.
- Multiplication Equal Groups use canonical dot diameter, up to 5 group containers across with a second row after 5, raised model placement, bottom-right responses, multiplication-sentence default, total-only optional mode, and question-sentence controls.
- Equal Sharing Division is division-facing: total divided by number of groups equals number in each group. It uses source dots on the left, fixed large group boxes on the right, maximum 5 containers per row, and division response support for blanks or independent equations.
- Shared multiplication-model factor pools preserve seeded parity and avoid duplicate model pairs until the available pool is exhausted; explicit single-combination teacher selections may repeat.
- Completed examples and answer keys use the same geometry as student pages.
- The Equal Sharing `both` task mode remains architecture-supported but should receive separate founder/design review before being treated as fully approved interaction behavior.
- Review artifacts under `review/` remain local QA proofs and should not be included in production commits.
- Counts remain 103 / 103 ready resources working, 0 ready failures, 85 worksheets, 11 Quick Checks, and 7 Exit Tickets.

## Decision: Curated Context Registries

Reusable contextual worksheet families must separate task structure from surface context and draw from curated, validated context registries rather than hard-coded repeated topics. Renderers remain context-agnostic; generators receive structured context packages. Public teacher selection requires separate product review before exposure.

## Decision: Aligned Grade 1 Response Lines

Grade 1 response lines should use predictable aligned writing columns and response-type-aware widths rather than being positioned from question-text length. Future worksheet families with short written responses should carry explicit response metadata, measure the complete prompt in its actual text box, and reuse identical geometry for student, completed, and answer-key modes.

## Decision: Grade-Banded Applied-Math Context

Applied-math worksheets should provide brief contextual framing that explains the source and purpose of the data or quantities. The wording must match the maturity and reading level of the grade.

Rules:
- Grades 1-2 use one or two short, concrete sentences with familiar actions and explicit units.
- Grades 3-4 may use a slightly richer real-world purpose while keeping vocabulary direct and the task immediately visible.
- Grades 5-6 may use more authentic constraints and domain language when the worksheet teaches or defines what students need.
- Context must not reveal an answer, repeat the title as filler, rely on sensitive or inaccessible assumptions, or introduce information the task does not use.
- Curated generators carry structured scenario metadata; renderers remain topic-agnostic.
- The higher-grade guidance is a documentation standard only. This Grade 1 follow-up does not implement or change Grade 2-6 worksheets.

## July 14, 2026 — AI-Ready, Launch-First Strategy

Decision:
Adopt an AI-ready, launch-first product strategy. Finish the launch product and stabilize it before implementing public AI features. Deterministic Yellow Bird generation, curriculum constraints, validation, layout, and QA remain authoritative; future AI may make proposals only through structured Yellow Bird rules. AI may propose. Yellow Bird rules decide.

Rules:
- AI-ready, not AI-dependent.
- Remain independent of any one model provider.
- Treat worksheet-family specifications, validated options, and founder, teacher, curriculum, and design QA decisions as a strategic Yellow Bird Knowledge Layer.
- Preserve teacher control, curriculum honesty, print reliability, and human approval for educational judgment and public claims.
- Detailed direction: `docs/ai-readiness-strategy.md`.
