# Founder Review Second Portion — Worksheet Corrections

Status: implemented locally, pending founder proof approval and commit  
Baseline: `d115dbde31b51a6ba25bb06ec30bfed4355b6bda`  
Scope: current Grades 1–5 default worksheets from the second founder-review portion

## Controlling decision

This correction pass changes current default output only. It does not add teacher-selectable variables, missing grades, Grade 6 resources, lifecycle movement, or new task roles.

The implementation uses one shared default-output map. Explicit supported request options remain caller-owned. Generator truth, deterministic generation, student/key parity, preview/download behavior, typography tokens, global page geometry, and unrelated resources remain protected.

## Implemented worksheet corrections

- Compare Equations: Grades 1–3 default to 20 questions in two columns; Grades 4–5 default to 30 questions in two columns.
- Compare Fractions: Grade 1 Compare Fair Shares defaults to eight questions; Grade 3 defaults to 20 in two columns; Grades 4–5 default to 30 in three columns. Grade 5 now shares the Grade 4 title and student instruction.
- Compare Numbers: Grade 1 and the two reviewed Grade 2 worksheets default to 20 questions in two columns. Grade 5 remains 30 in three columns. The omitted Grade 4 worksheet remains unchanged.
- One Half and Two Fourths: Grade 1 defaults to six questions.
- Extend Number Patterns: Grades 1–3 default to 30 questions in two columns. The Grade 1 title is `Extend Pattern`.
- Identify Pattern Rule: Grade 1 uses `Add ___ each time.` Grade 2 and Grade 3 use a full-width `Rule:` response line with ten questions per page.
- Missing Addends: the four reviewed worksheets default to 30 questions in three columns.
- Missing Values in Patterns: Grades 1–3 default to 20 questions in two columns.
- Mixed Addition and Subtraction Facts: Grade 3 defaults to 30 questions in three columns.
- Multiplication and Division Fact Families: Grade 3 defaults to 24 questions in three columns.
- Subtraction Facts: the reviewed Grade 1 and Grade 2 worksheets default to 30 questions in three columns.
- Grade 4 Extend Pattern, Identify Pattern Rule, and Missing Values inherit the approved Grade 5 student-only `Work It Out` workspace.
- Write Number Words: Grades 1–4 inherit the approved Grade 5 full-width single-column response geometry. Grades 1–3 default to ten questions per page; Grade 4 retains 12.
- Nineteen explicitly identified public footers no longer expose internal skill slugs.

## Confirmed no-op

The reviewed Grade 3 and Grade 4 Equal Groups worksheets already contain questions 7–12 on a second student page. This pass corrects their public footers but does not reduce or duplicate their questions.

## Deferred from this pass

- Quick Check and Exit Ticket cut-apart architecture, including two-, three-, and four-copy formats.
- Counting With Ten Frames within 20.
- The cross-family Grades 1–3 typography request.
- Number-line interval and cross-grade footer-label policy.
- Missing-grade reconciliation, Grade 6, and customization-variable ideas.

These require separate decision proofs or reconciliation and must not be inferred from this implementation.
