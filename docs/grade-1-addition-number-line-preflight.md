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

## Linked range and student-drawn arrows — 2026-09-07 pre-implementation sign-off

Family/activity: the existing addition_number_line operation for g1_addition_on_number_line_to_20 only. Baseline is approved layout checkpoint 1c8d893fa13bf89e988b5757ed29062665aa8673; its shown-arrow default and all three sizes remain accepted. The new range and student-drawn interaction await founder review. Nearest approved model is this exact family; identification and Addition Facts do not supply its mathematical semantics.

Teacher use and thinking: focused representation practice, with a choice between reading a forward jump and constructing that jump from a given start and addend. Students connect a + b = c to equal unit distances; common misconceptions are counting the starting tick as a step or treating the line minimum as the minimum jump. One concept, one column, top-to-bottom numbering; no modular progression or mixed task forms are warranted. The selected 1–6 tasks preserve the approved purposeful practice/drawing density rather than adding filler.

Mathematics/variables: reuse minimumValue and maximumValue as From/To, defaults 0/20. Proposed proof boundary: finite nonnegative integers through 100, with positive span at most 40. Preserve unit ticks, positive jumps 1–10 subject to available room, and the existing shuffled candidate-pool repetition policy. Preserve the exact default start pool 0–10; custom ranges allow starts L through U−1. Every start and landing stays inside the same L/U. Raw start/jump selections remain internal, with unchanged legacy behavior; no independent public diagram endpoints. Canonical aliases that exactly represent endpoints may normalize, but conflicting submitted endpoints must error. The mode numberLineArrows has only shown (default) and student_drawn; the existing skip-counting showJumpVisuals option lacks this family's destination-cue semantics and is not reused.

Header/instruction: preserve default title/instruction. A custom range uses “Addition on a Number Line — L to U”. Student-drawn mode uses one compact page instruction to start at the first number, draw forward by the second number and write the answer. Measure its fit at the existing 11 pt instruction size and reserve the same header/content geometry in both modes. Catalog grade/curriculum/footer stay unchanged; a custom-range notice in the teacher interface does not certify default curriculum alignment for overrides.

Layout/response: preserve the 504 pt full-width line, equation/42 pt answer target, six/five/four capacities at 12/14/16 pt and existing balanced page partitions. Tick fonts remain 8/10/12 pt and jump fonts 9/11/13 pt. Reserve the same full block and drawing space above each line in both modes. Custom scale labels use a measured range/text-size schedule with inset endpoints, without forcing an off-schedule starting-number label; the starting dot and equation supply the scaffold. Unit ticks stay one integer apart. Shown mode retains hidden landing labels; default shown 0–20 stays geometrically identical. Student-drawn labels depend solely on the range/size: no answer-based omission, forced label, landing marker, jump arc, arrowhead or jump annotation.

Examples/key: Q1 is inside the requested total, with the approved exception to the generic unnumbered-example rule. A completed Q1 renders its worked jump and bold answer even in student-drawn mode; later questions remain unworked. Keys use the same generated truth and positions and always render worked jumps/answers. Only equation answers are emphasized. No repeated instruction beside items, ordinary question separators or new Example heading.

Age/print risks: start-marker scaffolding and explicit instructions reduce motor/reading demand. Wider custom ranges are teacher-selected extensions, not new Grade 1 curriculum claims. Prove short unit jumps, widest labels, endpoint answers, nonzero mapping, fixed drawing area and no destination cues. Reject endpoints/spans outside the measured boundary rather than shrinking fonts or clipping mathematics. No physical-print or browser-pixel claim without evidence.

Architecture: family controls and shared normalization, existing generator candidate pool and min/max mapping, family layout specification, optional per-call primitive render flag, shared detail/applied-state and API runtime. No second generator, validator, coordinate system, key pipeline or interactive drawing feature. Mathematics stays identical across text sizes and arrow modes.

Proof gate: baseline 0–20 comparisons at all sizes; combined truth/mode/count/example/key matrix; internal PDF measurements and raster inspection before founder packet exposure. Compact packet: accepted default, 0–10, 10–20 Largest shown/drawn/drawn+Q1, 20–40 Largest, upper-bound density, matching keys. Internal acceptance requires instruction clarity, actual drawing space, cue-free unanswered models, endpoint/label readability, exact totals, even spacing and student/key parity. Implementation may proceed within these recorded bounds; founder approval and physical printing are not implied.


Internal gate result: passed before founder-packet exposure. All 14 candidate pages were raster-inspected; page hierarchy, one clear instruction, equation/start-marker scaffolding, drawing space, worked Q1/key and deliberate even placement are coherent. Numerical checks confirm all supported labels fit, boundary arrows are truthful, unanswered drawn items have exactly one start circle and no destination mark, keys mirror model/response positions, and 18 accepted defaults are unchanged. Minimum measured clear drawing height is 24.656 pt. The founder subsequently approved the bounded range and student-drawn interaction described here; that decision does not extend to other families, wider spans, physical printing, deployment or ten-frame work. Evidence: /Users/davidbirnie/YellowBird-Evidence/addition-number-line-range-arrows-20260907T191156Z/REPORT.md.
