# Founder Worksheet Design Preflight

Status: Required before new worksheet-family implementation or major worksheet-family redesign

Source-of-truth role: This document captures founder worksheet design principles that must be applied before code is written.

## Purpose

The Founder Worksheet Design Preflight exists to:

- reduce repeated design corrections;
- apply founder decisions before implementation;
- protect print quality;
- identify teacher variables before implementation;
- avoid generic layouts for task families that need intentional design;
- prevent one-off patches when a shared family rule is needed;
- improve founder review efficiency;
- keep each worksheet family coherent.

The preflight is not a replacement for founder review. It is the entry gate that makes first proofs closer to approval.

## When The Preflight Is Required

Complete this preflight before:

- new worksheet families;
- major family redesigns;
- new task-family layouts;
- new public customization candidates;
- generators that introduce new answer formats;
- families with new pagination behavior.

Do not treat this as optional because a runtime already exists. Architecture-first implementation is not enough when the worksheet design surface changes.

## Required Outputs Before Implementation

Before implementation begins, record:

- the activity family and supported grades;
- the approved header and student instruction;
- the task-specific layout plan;
- the answer-target design;
- the default page capacity and pagination risks;
- completed-example behavior;
- answer-key behavior;
- footer and public metadata wording;
- teacher-facing variables;
- runtime-only and deferred controls;
- the highest safe reusable architecture level;
- proof-packet coverage;
- known risks and founder/product questions.

Future worksheet-family workflow:

Architecture scan -> Founder Design Preflight -> Variable contract -> Implementation -> Proof packet -> Founder review -> Commit

This workflow does not retroactively invalidate already approved families.

## Header And Instruction Rules

Default worksheet hierarchy:

1. worksheet title
2. divider
3. student-facing instruction
4. worksheet content

Acceptance criteria:

- subtitles are hidden by default;
- subtitles require explicit family justification;
- metadata-style sentences do not appear as student instructions;
- the instruction is written once near the top;
- repeated prompt prose does not appear in every question unless genuinely necessary;
- grade and curriculum metadata are not repeated in the instruction.

Good:

- Extend each pattern. Write the next number.
- Write the missing numbers in each pattern.
- Write the rule for each pattern.

Avoid:

- Students extend number patterns for focused Grade 3 patterning practice.
- Repeating "Extend the pattern:" before every question.

## Task-Specific Layout Rules

Each task family must have an intentional layout before implementation.

Before implementing or approving a worksheet, compare both the nearest exact family and the nearest approved task/layout class for title pattern, columns, rows, density, response target, spacing, completed-example behaviour, key layout and maximum capacity. Preserve the densest safe established contract unless a documented instructional or print-safety reason requires otherwise.

Before implementing any Grade 4–6 resource, compare the full approved family history across every lower grade, not only the most recent grade. Also compare the nearest approved task/layout class. Preserve the strongest safe established contract and record any lower-grade drift for later correction rather than inheriting it forward.

Define:

- one-column or two-column structure;
- row height;
- answer-target placement;
- writing-space needs;
- example placement;
- page capacity;
- answer-key layout;
- long-number behavior;
- mobile or web-preview implications where relevant.

Do not default to generic text rows when the task needs:

- tables;
- models;
- diagrams;
- written responses;
- multiple answer targets;
- visual alignment.

Approved examples to keep in mind:

- Skip Counting uses a task-specific visual sequence layout.
- Addition Facts uses a strong dense fluency layout.
- Identify Pattern Rule uses a one-column written-response layout.
- Missing Value Pattern uses structured inline-answer placement.

When a worksheet's task safely occupies only part of the page, consider an opt-in open workspace area rather than leaving unexplained whitespace. The workspace must not reduce approved density, response-target width, or readability, and should appear only where student pencil work is genuinely useful. It is not a global requirement: the family preflight must confirm student-only behavior, print-safe separation, preserved task geometry, and an unchanged full-width answer key where appropriate.

Do not duplicate production implementation details in this document. The preflight defines design intent and acceptance criteria.

## Typography And Readability

Acceptance criteria:

- Source Sans 3 remains the primary typeface;
- body size is grade-appropriate;
- tiny type is not used to force more questions onto a page;
- Grade 1 and Grade 2 generally require larger student text;
- line height supports handwriting and scanning;
- visual hierarchy remains clear;
- light grey text remains readable when printed;
- answer targets remain visible on ordinary school printers;
- worksheet title, instruction, question content, and footer remain distinct.

If readability conflicts with density, reduce density before shrinking text below the approved family range.

## Answer-Target Rules

Before implementation, define the answer target for the family.

Acceptance criteria:

- use a shared answer target where one already exists;
- answer targets match the expected response;
- numeric answers have sufficient width;
- written answers have a proper line or response block;
- multiple targets use consistent spacing and punctuation;
- commas remain visually attached to sequence terms;
- beginning, middle, and end blanks remain obvious;
- drawn targets are preferred over raw underscores when safer;
- boxes are avoided unless the task benefits from them;
- answer targets align in student and answer-key versions.
- letters, numbers, and symbols inside circles or other compact answer targets are optically centred from measured text geometry rather than approximate baseline offsets.

## Page Density And Pagination

Pagination should protect quality over raw count.

Acceptance criteria:

- exact requested student-question totals are preserved;
- questions are not silently removed;
- pages are balanced where safe;
- crowding is not used to force fit;
- final pages are not nearly empty when safe rebalancing is possible;
- completed examples participate in pagination;
- variant-specific capacities are calculated where layouts differ;
- multi-page numbering remains continuous;
- answer keys mirror student grouping where appropriate;
- page capacity remains internal unless intentionally exposed later.

Preferred pagination principle:

1. calculate safe capacity;
2. calculate page count;
3. distribute questions evenly;
4. avoid final pages below roughly one-third of normal capacity where possible.

## Completed-Example Rules

Default acceptance criteria:

- label is `Example`;
- example is unnumbered;
- first student question begins at 1;
- example is additional to the student question total;
- example uses the same family layout;
- only the completed answer is emphasized;
- example does not create excessive whitespace;
- example participates in pagination;
- answer key distinguishes the example from student questions.

Family-specific exceptions must be recorded in the family preflight. Dense Grade 1 fluency/comparison worksheets use a Question 1 completed-example pattern instead:

- the completed example is printed as Question 1;
- it counts within the requested question total;
- no separate `Example` heading appears;
- Question 2 follows in the normal grid;
- only the completed answer is emphasized.

Do not apply the Question 1 pattern to other task families unless the family preflight explicitly approves it.

## Answer-Key Rules

Acceptance criteria:

- numbering matches the student worksheet;
- only answers are bold;
- surrounding labels and prompts remain regular;
- numeric answers occupy the student answer position where practical;
- written answers remain left aligned;
- structured answer metadata is used where available;
- answers are not rebuilt from rendered strings when structured answers exist;
- answer key preserves multi-page grouping and example treatment;
- answer-only bolding is verified visually.

## Footer And Metadata Rules

Acceptance criteria:

- footer uses public labels only;
- no internal slugs;
- no internal IDs;
- no generator names;
- no raw catalog fields;
- footer uses clean public wording such as `Grade 3 • Math • Patterning & Algebra`;
- footer changes happen at the highest safe reusable level;
- broad shared-footer changes require regression checks.

## Teacher-Variable Planning

Before implementation, define the variable contract.

For each proposed variable, record:

- teacher-facing label;
- default;
- allowed values;
- safe minimum and maximum;
- curriculum-suggested range;
- override behavior;
- pagination consequences;
- layout consequences;
- answer-key consequences;
- completed-example interaction;
- whether it is public-ready;
- whether it is runtime-only;
- whether it is deferred.

Typical teacher-useful variables may include:

- Number of questions
- Number range
- Numbers to practise
- Pattern type
- Steps to practise
- Starting-number range
- Numbers in each sequence
- Numbers to write
- Missing numbers in each pattern
- Where missing numbers appear
- Show one completed example
- Include answer key

Do not expose variables merely because the runtime can support them.

Current project note:

- Addition Facts remains the first complete public customization prototype.
- Numeric Patterning is the first family completed after applying more formal task-specific layout review.
- Future families must use this preflight before implementation.
- Function Tables remain deferred.
- Arrays customization remains deferred.
- No new family is selected by this preflight document.

## Internal-Only Controls

These normally remain internal:

- seed;
- retry limits;
- duplicate signatures;
- candidate-pool size;
- page capacity;
- column count;
- answer-target dimensions;
- renderer coordinates;
- line thickness;
- font fallback;
- low-variety diagnostics;
- internal generator variants.

Internal controls may support proof generation and runtime safety without becoming public customization controls.

## Reusable Architecture Decision

Before implementation, identify the highest safe reusable level:

1. shared token or layout rule;
2. shared task-family layout;
3. shared generator or runtime;
4. resource-specific override;
5. one-off correction only when genuinely unique.

Acceptance criteria:

- generated PDFs are not patched individually;
- generation logic is not duplicated;
- renderers render only;
- generators generate only;
- routes remain thin;
- shared completed-example and answer-key systems are used where possible;
- seeded preview/PDF parity is preserved;
- inheritance boundaries are documented.

## Proof-Packet Requirements

Before founder review, generate representative proofs covering:

- default;
- minimum;
- maximum;
- completed example;
- answer key;
- multi-page count;
- narrow candidate pool;
- widest values;
- longest written response;
- major variable combinations;
- same-seed parity;
- nearest related-family regression.

Each proof should include metadata where useful:

- resource or family;
- grade;
- seed;
- normalized options;
- question count;
- page count;
- page distribution;
- example status;
- answer-key status;
- duplicate count;
- public-ready status.

Proof artifacts remain under excluded `review/`.

## Founder-Review Gate

Implementation is not ready to commit until the founder approves:

- layout;
- readability;
- answer targets;
- instructions;
- density;
- pagination;
- example behavior;
- answer-key behavior;
- footer;
- variable plan.

Possible founder verdicts:

- Approved
- Approved with minor corrections
- Not approved
- Needs product decision

## Explicit Anti-Patterns

Avoid:

- metadata as student instruction;
- repeated prompt prose;
- generic text rows for visual tasks;
- tiny text to force density;
- orphan final pages;
- completed example numbered as Question 1;
- example reducing student question count;
- full-answer-line bolding;
- internal footer slugs;
- unsupported public controls;
- silent range overrides;
- silent question removal;
- one-off layout patches when a family rule is needed;
- public claims before founder proof;
- forcing Function Tables or other unfinished layouts into a family.

## Pre-Implementation Sign-Off Template

Copy this block before implementation:

```md
Family:
Activities:
Grades:
Approved header/instruction:
Layout:
Answer target:
Default page capacity:
Pagination risks:
Completed example:
Answer key:
Footer:
Teacher-facing variables:
Runtime-only variables:
Deferred controls:
Shared architecture level:
Proof packet:
Known risks:
Implementation verdict:
```
