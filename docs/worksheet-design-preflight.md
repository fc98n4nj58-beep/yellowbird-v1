# Founder Worksheet Design Preflight

Status: Authoritative and required before new worksheet activity/family implementation or material task-architecture redesign

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

The preflight predicts founder-likely acceptance; it does not replace or claim founder approval. A technically valid PDF is not automatically ready for founder review.

## When The Preflight Is Required

Complete this preflight before:

- every new worksheet activity type;
- new worksheet families;
- major family redesigns;
- a family extension with a meaningfully different mathematical interaction;
- new or changed task architecture;
- new public customization candidates;
- generators that introduce new answer formats;
- families with new pagination behavior.

Do not treat this as optional because a runtime already exists. Architecture-first implementation is not enough when the worksheet design surface changes.

The preflight is not required for purely mechanical metadata corrections, synchronized public-copy changes, or other changes that preserve the approved mathematical interaction and page architecture.

## Founder-Likely Acceptance Review

Before implementation, answer each area explicitly in the family preflight.

### Nearest approved family

Identify the nearest approved mathematical family, interaction type, and page/layout architecture. State what can safely inherit and what cannot. Do not choose generic `equation_practice` merely because it renders successfully.

### Teacher use

State the resource's role, when a teacher would use it, and whether that purpose is obvious within five seconds. Classify it honestly as practice, review, representation, reasoning, formative checking, or another specific role.

### Mathematical design

Define the exact thinking elicited, progression across the page, useful versus distracting task variety, required representations, likely misconceptions, and whether repetition creates meaningful practice. Sequencing should teach or reinforce a relationship rather than merely randomize examples.

### Age appropriateness

Evaluate reading load, vocabulary, writing and motor demands, number ranges, abstraction, visual support, response space, expected independence, and density. Primary and junior resources should not inherit the same assumptions automatically.

### Student-facing instructions

Use direct student language that states exactly what to do. Prefer one page-level instruction over repeated prompt prose where the task can be expressed structurally. Do not use teacher-facing or catalogue wording.

### Completed model or strategy cue

Decide whether a completed example, visual model, strategy cue, vocabulary cue, midpoint/reference marker, or worked demonstration improves independent success. Include one only when it teaches the interaction without displacing too much practice or revealing the task.

### Page architecture

Specify sections, columns, rows, question count, response positions, visual regions, model position, vertical rhythm, lower-page use, and page-break behavior. Density must have an instructional and print-safety rationale. Large unexplained empty regions and accidental crowding fail preflight.

### Response architecture

For every task mode, name the natural response: numeric, symbolic, written word, selection/circle/check, equation, drawing/model, or explanation. Match response targets to the mathematical demand and student age.

### Answer-key architecture

Preserve recognizable student-page geometry and the same generator-owned truth. Insert answers deliberately at the student response target; only inserted answers are bold and surrounding prompt text remains regular. Generic prose-appended answers and avoidable wrapping fail when a structured answer target is available.

### Founder-likely objection review

Explicitly answer: **What is the founder most likely to object to in this proposed worksheet?**

Check for a generic-looking layout, missing question numbers, repeated instructions, unnecessary subtitle, weak answer space, shallow repetition, childish upper-grade presentation, teacher-facing wording, poorly mirrored keys, underused page space, unnecessary lines or boxes, inconsistent alignment, model sizing/spacing, and task/title mismatch. Revise the proposed contract in response before implementation.

Approved family-specific contracts override a general recommendation here. Record the exception rather than flattening established family behavior into a new global rule.

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

Architecture scan -> Founder-Likely Acceptance Preflight -> Variable contract -> Implementation -> Internal design proof -> Internal acceptance -> Founder review proof -> Founder review -> Commit

This workflow does not retroactively invalidate already approved families.

## Modular Practice And Composition Contract

Apply this section when the mathematics genuinely contains meaningful sub-concepts or stages that benefit from explicit progression, targeted practice, and later mixed application. Simple focused families may remain simple. The family preflight must decide whether modular architecture is warranted; this contract is not permission to overcomplicate every worksheet.

### Concept modules

List the approved mathematical modules in the family. For each module, define:

- a stable module/activity identifier;
- its mathematical purpose and grade-band role;
- its natural response interaction and practice demand;
- required representation, visual, or model support;
- its answer-key behavior;
- whether it can stand alone pedagogically.

Treat modules as mathematical contracts, not merely page sections. Preserve structured distinctions when they would otherwise need to be rediscovered for targeted practice or future composition.

### Full progression recipe

Define the default learning sequence: what comes first, what understanding it establishes, what follows, why the order is mathematically sensible, and which final task integrates the earlier ideas. Do not randomly interleave concept modules during a learning progression.

The preferred larger-concept model is:

- **Concept 1 -> sufficient practice**
- **Concept 2 -> sufficient practice**
- **Concept 3 -> sufficient practice**
- **Concept 4 -> sufficient practice**
- **Integrated Concept 5 -> use the ideas together**

Concept boundaries should have noticeably stronger whitespace separation than questions within a concept. Multi-page worksheets are acceptable and preferred over cramming. Questions should normally appear beside their question numbers with comfortable spacing.

### Standalone practice mode

Where pedagogically useful, each concept module must be capable of becoming a complete targeted-practice worksheet. A standalone module must have an appropriate title, direct instruction, useful question count, intentional density, response-appropriate space, and complete answer key. It must not refer to absent earlier or later sections or feel like a page removed from a packet.

### Integrated or mixed-practice mode

The final integrated module should also be independently generatable as a mixed-review resource for the teacher need: **“I already taught the component ideas. Give students more practice using them together.”**

Integrated practice must combine only previously established concepts, require students to choose or apply appropriate thinking, provide meaningful variety, remain age appropriate, and avoid becoming a random collection of unrelated questions.

### Practice sufficiency

Define both counts for every standalone-capable module:

- the module's count inside the full progression;
- its default count when generated as standalone targeted practice.

Do not assume that a short sampling inside the full sequence provides sufficient targeted practice. For example, four `compute` tasks may be appropriate inside a progression while standalone computation may require 12–20 tasks depending on grade and interaction. Page count and density follow the standalone learning purpose; they do not have to match the full resource.

### Composition metadata

Where practical, preserve structured internal metadata for:

- concept/module;
- task action;
- response type;
- representation or model;
- difficulty or progression role;
- integrated/mixed status.

Do not flatten these distinctions into generic prompt strings when they can be preserved safely. This metadata supports later teacher-controlled composition without authorizing a composition engine, teacher-facing selector, public controls, routes, or runtime work now.

Long-term product intent: a future teacher may choose an approved topic or model—such as Number Lines, Base Ten Blocks, Ten Frames, Rounding, or Addition/Subtraction strategies—and then request the full learning progression, a selected concept module, or integrated mixed practice. Yellow Bird should compose that resource from approved family/module rules rather than inventing a new sequence at request time.

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

## Internal Design-Proof Gate

Do not label or export a PDF as a `founder-review` proof until an internal design proof confirms:

- mathematical correctness and generator-owned answer truth;
- age appropriateness and expected student independence;
- an obvious, teacher-useful purpose;
- intentional page density, hierarchy, progression, and lower-page use;
- likely founder objections have been addressed;
- answer-key geometry and answer-only bolding satisfy the family contract;
- task, instructions, responses, and visuals form one coherent interaction.

For a modular larger-concept family, the proof must also confirm:

- module boundaries and mathematical purposes are visually clear;
- each standalone-capable module has a viable complete worksheet contract;
- the full progression is coherent rather than randomly interleaved;
- integrated mixed practice combines established concepts meaningfully;
- full-sequence and standalone counts provide sufficient practice for their different roles;
- structured composition metadata survives generation and transformation.

Failure at this gate returns the family to design or implementation. Passing it permits founder exposure but does not imply founder approval.

## Proof-Packet Requirements

After internal acceptance and before founder review, generate representative proofs covering:

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
