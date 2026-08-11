# Grade 1 Fraction Family Preflight

Date: 2026-07-14

Status: founder approved and implementation complete. Catalog status remains `generated`, no resource is promoted, and Grade 2+ behaviour is unchanged.

Answer-box correction checkpoint, 2026-08-11: Share Fairly retains the approved two-column tray layout and exact structured sharing truth. The current two-sharer student tray establishes a 168 × 98 pt minimum box. Four-sharer questions now use two rows of boxes at that same size and row-aware pagination moves the following question to a second student page instead of halving drawing height. The matching answer key uses identical item grouping and tray geometry. The default is now two student pages plus two answer-key pages; no catalog, customization, lifecycle, or reconciliation state changed.

## Recommendation

The implementation now provides four distinct, drawing-led Grade 1 tasks behind one shared fraction-family truth model:

1. **Shade Equal Parts** — shade a named part of one whole.
2. **One Half and Two Fourths** — decide whether two same-whole models show the same amount.
3. **Compare Fair Shares** — compare unit shares made by different numbers of sharers.
4. **Share Fairly** — draw fair shares for two or four sharers, including the prescribed remainder cases.

Defer **Fraction Number Line** to Grade 2+ or a later, separately justified magnitude family. It has no direct Grade 1 expectation anchor, requires distinct geometry, and its current shell does not produce a number line.

The four viable resources are Category A after founder approval. The number-line resource is Category G and remains outside the implemented runtime.

## Source-of-truth distinction

### Official curriculum expectations

The versioned local Ontario source, `data/curriculum/ontario/math_k6.json` (`version: 2026-03-06`), records:

- **B1.6:** use drawings to represent and solve fair-share problems involving 2 and 4 sharers, respectively, with remainders of 1 or 2;
- **B1.7:** recognize that one half and two fourths of the same whole are equal in fair-sharing contexts;
- **B1.8:** use drawings to compare and order unit fractions representing individual portions when a whole is shared by different numbers of sharers, up to 10.

The repository's `math_k6.normalized.json` currently gives different B1.6 wording. That normalization drift must be resolved separately before implementation; this preflight uses the versioned source above for scope and makes no curriculum-file change.

### Yellow Bird task interpretation

Yellow Bird should interpret those expectations conservatively for print-first Grade 1 work:

- drawings and words lead;
- equal sharing and an explicit whole are the organizing ideas;
- halves and fourths are the primary defaults;
- one third may appear sparingly as a unit share under B1.8, not as generalized equivalence;
- symbolic notation is a secondary label, never the main reasoning mechanism;
- the default visual pool stays at 2, 3, and 4 equal parts even though B1.8 permits more sharers;
- B1.6 remainder situations are shown through sharing drawings, not improper or mixed-number notation.

### Later-grade concepts

General equivalence, formal numerator/denominator terminology, number-line placement, symbolic comparison rules, equivalence chains, improper fractions, mixed numbers, fraction arithmetic, cross-multiplication, values greater than one, negative values, and decimal-fraction work are outside this Grade 1 family.

## Family scope

All five target records are currently `generated`, use the generated catalog family/source, and are Category F. No overlapping Grade 1 fraction resource is currently in A, B, or G.

| Exact resource ID | Current title | Current path | Current output | Classification | Proposed title | Proposed instruction | Final role |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `grade1_fraction_equivalence_compare_fractions` | Compare Fractions — Grade 1 | `compareFractions` → generic normalization → `equation_practice` → shared PDF | 12 seeded, text-only same-denominator symbol comparisons; duplicates can occur | **VIABLE WITH NARROWED SCOPE**; **ARCHITECTURAL CONSOLIDATION REQUIRED** | Compare Fair Shares | Look at each pair. Circle the share that is greater, or circle Same. | Compare visual unit shares from equal-sized wholes; no `>`, `<`, or denominator rule |
| `grade1_fraction_equivalence_fraction_number_line` | Fraction Number Line — Grade 1 | array-return `fractionNumberLine` → generic normalization → `equation_practice` | Normalizes into blank problem rows; no line or fraction model; generator ignores the seeded random contract | **DEFER TO GRADE 2+** | No Grade 1 title proposed | None | Remove from the Grade 1 implementation packet; revisit only in a later magnitude preflight |
| `grade1_fraction_equivalence_fraction_word_problems` | Fraction Word Problems — Grade 1 | recipe fallback → generic normalization → `equation_practice` | Zero items because no indexed `fraction_word_problems` generator owns the activity | **DISTINCT AND VIABLE**; **ARCHITECTURAL CONSOLIDATION REQUIRED** | Share Fairly | Share the objects equally. You may split one object into equal halves. Draw whole objects and halves where needed. | Concrete B1.6 fair-sharing drawings for 2 or 4 sharers |
| `grade1_fraction_equivalence_match_equivalent_fractions` | Match Equivalent Fractions — Grade 1 | `matchEquivalentFractions` → generic normalization → `equation_practice` | Seeded symbolic equations across arbitrary equivalent fractions, including fifths/sixths; no model | **VIABLE WITH NARROWED SCOPE**; current content is a **CURRICULUM CONFLICT** | One Half and Two Fourths | Look at each pair. Circle Yes if the shaded parts show the same amount. Circle No if they do not. | Only the B1.7 relationship between one half and two fourths of the same whole |
| `grade1_fraction_equivalence_shade_fraction_models` | Shade Fraction Models — Grade 1 | array-return `shadeFractionModels` → generic normalization → `equation_practice` | Normalizes into blank problem rows; no drawable model; generator ignores the seeded random contract | **DISTINCT AND VIABLE**; **ARCHITECTURAL CONSOLIDATION REQUIRED** | Shade Equal Parts | Shade the equal parts to show each fraction. | Shade 1/2, 1/3, 1/4, or 2/4 in exact partitioned strips |

## Architecture scan

### Catalog, skill, and recipe

- `engine/skills/fraction_equivalence.json` describes a broad cross-grade family spanning visual models, number lines, and symbolic work. It is not a safe Grade 1 contract.
- `engine/activityRecipes/fraction_equivalence.json` is a generic cross-grade recipe with a default count of 12. Its challenge mode refers to `word_problems`, while the catalog activity is `fraction_word_problems`.
- `fraction_magnitude` also relies on the same broad recipe base, so Grade 1 narrowing must be ID/grade-owned and must not alter Grade 2+ defaults.

### Generators and seed handling

- `compareFractions.js` and `matchEquivalentFractions.js` return one problem object and use the supplied seeded random source. Their mathematics is deterministic, but their present symbolic scope is not Grade 1-safe.
- `fractionNumberLine.js` and `shadeFractionModels.js` return arrays while the catalog builder expects one object per invocation. Both use global `Math.random`, bypassing the seeded runtime.
- `fraction_word_problems` has no indexed generator, so the preferred activity produces an empty worksheet shell.
- `engine/problemGenerators/index.js` declares `shade_fraction_models` twice. The duplicate key does not create two public resources, but it is legacy registry duplication to remove during a later implementation pass.

### Builder and normalization

The shared catalog builder calls the selected activity generator once per requested item and expects a problem object. Array-return fraction generators therefore become nested arrays and are normalized as blank generic problems. Current normalization has no structured fraction-model field and does not reject empty prompts, nested arrays, missing answers, or a zero-item generated worksheet.

### Visual and renderer path

There is no fraction-specific structured visual path in the current normalizer or PDF renderer. All five resources route to the generic equation layout. The renderer contains no fraction mathematics that needs to move upstream; the problem is the absence of a structured upstream truth model and a parameterized fraction visual primitive.

Preview and PDF already share `buildCatalogWorksheetRuntime`, which is the correct parity boundary. Today both surfaces can agree on an empty or text-only shell, so route parity alone is not a quality guarantee.

### Answer key and completed examples

The generic answer-key transform can copy text answers, but it cannot guarantee visual answer parity because no structured fraction geometry exists. Generic completed mode can mark the first normalized problem as an example, but that produces an unusable blank example for the array-return shells and an overly broad symbolic example for the current compare/match tasks.

### Tests, proofs, and audit blind spots

- No focused Grade 1 fraction test or fraction proof script exists.
- No prior Grade 1 fraction founder PDF or review note was found.
- The worksheet audit presently counts all 213 generated records as working even though these resources include blank and zero-item shells. A later validator must fail generated visual resources that lack structured visuals, prompts, answers, or exact requested totals.

### Grade 2+ overlap

The same generic fraction shell IDs recur in later grades. Grade 2 compare/match candidates were already held as revision-needed; Grade 3+ and Grade 4+ resources use broader fraction expectations. Grade 1 implementation must be an explicit Grade 1 adapter/truth contract and must leave those paths unchanged.

## Curriculum boundaries

| Concept | Decision | Boundary |
| --- | --- | --- |
| Equal sharing, equal parts, explicit whole | **SAFE FOR GRADE 1** | Core language and visual rule |
| Halves and fourths | **SAFE FOR GRADE 1** | Primary defaults |
| Thirds | **SAFE WITH NARROWED SCOPE** | At most one item per page by default; unit-share or shade task only |
| Unit fractions with more sharers | **SAFE WITH NARROWED SCOPE** | Officially supported through 10 under B1.8, but omitted from the default packet for readability and visual QA |
| Area/strip models | **SAFE FOR GRADE 1** | Equal rectangles/strips are the default whole |
| Set/share models | **SAFE FOR GRADE 1** | Reserved for B1.6 fair-sharing tasks |
| Length models | **SAFE WITH NARROWED SCOPE** | A strip may represent one whole; it must not be presented as a number line |
| Visual comparison of unit shares | **SAFE FOR GRADE 1** | Compare the same-sized whole; answer with larger/smaller/same selection |
| One half equals two fourths | **SAFE FOR GRADE 1** | Same whole and fair-sharing drawings only |
| General symbolic equivalence | **CURRICULUM CONFLICT** | Defer to later grades |
| Formal number-line placement | **BETTER FOR GRADE 2+** | No direct Grade 1 anchor in B1.6–B1.8 |
| Formal fraction terms and dense notation | **BETTER FOR GRADE 2+** | Omit numerator/denominator terminology |

## Distinct instructional roles

### Shade Equal Parts

Construction task. The student shades a requested amount in an already and exactly partitioned whole. It does not ask the student to identify a pre-shaded fraction or compare two models.

Allowed default pool: one half, one third, one fourth, and two fourths. Weight halves and fourths; permit at most one thirds item on a default page. Do not generate a generic numerator/denominator combination.

### One Half and Two Fourths

Equivalence-recognition task. Each item shows two equal-sized whole strips and asks Yes/No whether they show the same amount. True items show one half and two fourths; false items use visually clear combinations from one half, one fourth, and two fourths. It does not teach a general rule or use symbolic equations as the task.

### Compare Fair Shares

Magnitude task. Each item shows two unit shares produced by different sharer counts and asks the student to circle the larger share or Same. The wholes must have identical dimensions. The default denominator pool is 2, 3, and 4, weighted toward halves and fourths. No comparison signs appear.

### Share Fairly

Context/drawing task. The student shares concrete countable items among exactly two or four sharers and shows how leftover items can be divided fairly. Cases follow the B1.6 pairings: remainder 1 for two sharers and remainder 2 for four sharers. Answers are drawings, not mixed numbers or arithmetic fraction sentences.

### Fraction Number Line

No Grade 1 role is approved. It is not needed to make the other four tasks complete and is not a duplicate to be disguised as a strip model. Defer it.

## Shared visual model

### Smallest safe architecture

Use one Grade 1 fraction-family generator/truth package with four task modes:

- `shade_equal_parts`
- `match_half_fourths`
- `compare_fair_shares`
- `fair_share_remainders`

The generator owns mathematics, wording, contexts, answer truth, distractors, and duplicate avoidance. Normalization carries structured fraction data unchanged. One parameterized visual renderer owns geometry only.

### Model types

1. **`fraction_strip`** — default for shade, match, and compare. A horizontal rectangle has an explicit outer boundary, exact equal partitions, and a structured shaded-part count.
2. **`fair_share_set`** — default for fair-sharing problems. It shows source items and two or four clearly separated sharer trays; leftover items are visibly subdivided into equal shares on the key.

Circles are not part of the default. Accurate radial partitions, label space, and grayscale legibility add risk without improving the initial family. Decorative or irregular shapes are prohibited.

### Structured truth

At minimum, each item should carry:

- task mode and stable item ID;
- model kind;
- `wholeId`/same-whole relationship;
- whole dimensions or size class;
- part count/denominator;
- shaded-part count;
- word label and optional paired symbol;
- correct selection/answer;
- for sharing: item count, sharer count, remainder, whole items per sharer, leftover fraction per sharer, and tray assignment.

### Visual invariants

- The outer whole boundary is explicit.
- Compared or matched wholes use identical dimensions.
- Partitions are mathematically equal and geometrically exact.
- Partition strokes meet the whole boundary with no gaps or overlaps.
- Shading is clipped inside the whole.
- Grayscale fill or hatch remains distinguishable without colour.
- Unshaded parts remain white with visible outlines.
- Labels sit outside models and do not crowd boundaries.
- The answer key reuses the same model geometry and changes only answer state/shading.
- Perspective, decorative distortion, and misleading unequal areas are prohibited.

## Fraction language contract

- Use **one half**, **one third**, **one fourth**, and **two fourths** in student-facing words.
- Use **fourths** in public titles and instructions because it matches the curriculum wording. **Quarter** may appear later as a teacher-facing synonym, but do not alternate terms inside one student task.
- Prefer **equal parts**, **same amount**, **larger share**, **smaller share**, **more of the same whole**, and **less of the same whole**.
- Words lead. Symbols may appear beside the word label only for `1/2`, `1/3`, `1/4`, and `2/4`.
- If symbols appear, render a stacked fraction at 18–20 pt rather than small slash text. Keep the fraction bar aligned and centered.
- Omit numerator and denominator terminology.
- Never imply that a larger denominator means a larger share; the drawing remains the evidence.

## Task-specific layouts and answer targets

Shared page rules: US Letter; one student page plus one matching answer-key page; 54 pt margins; Source Sans 3; 18–20 pt title; 12–13 pt student instruction/body; footer `Grade 1 • Math • Fractions`; no subtitle; no internal metadata; reduce item count before reducing Grade 1 type or model size.

### Shade Equal Parts

- **Count/density:** 6 student items in a 2-column × 3-row grid.
- **Cell/model:** approximately 234 × 150 pt per cell; strip approximately 176 × 62 pt.
- **Prompt:** word label with optional 18–20 pt stacked symbol.
- **Response:** shade/draw directly in the large strip; no tiny box or answer line.
- **Worked treatment:** **SEPARATE WORKED MODEL APPROVED**. Put a small unnumbered model below the instruction, additional to the six student items, using a fraction not repeated immediately in Question 1.
- **Key:** same six strips, deterministically shaded; only the answer state is emphasized.

### One Half and Two Fourths

- **Count/density:** 4 items in one column.
- **Row:** approximately 120 pt high with two same-sized strip models.
- **Response:** Yes/No circles at least 24 pt across, with at least 12 pt labels and generous separation.
- **Worked treatment:** **NO COMPLETED EXAMPLE**. A worked item would reveal too much of this intentionally narrow relationship.
- **Key:** same models and choices; mark the correct circle without rebuilding the models.

### Compare Fair Shares

- **Count/density:** 6 items in a 2-column × 3-row grid.
- **Cell/model:** approximately 243 pt wide; two strips approximately 150 × 34 pt, aligned to the same origin/size class.
- **Response:** three circle/select targets—left share, Same, right share—with a minimum 22 pt target and no `<` or `>` symbol.
- **Worked treatment:** **COMPLETED Q1 APPROVED**. Question 1 is solved, counts inside the six-item total, has no `Example` heading, and emphasizes only the selected answer.
- **Key:** identical model geometry and target placement; selected answer only is emphasized.

### Share Fairly

- **Count/density:** 3 items in one column; quality and drawing room take priority over count.
- **Row:** approximately 165–175 pt, with a short context line, source items on the left, and two or four generously sized sharer trays on the right.
- **Reading load:** one short sentence, familiar concrete plural noun, no proper names required, no multi-step operation.
- **Response:** draw/move share marks and divide leftovers visually; no fraction box or written explanation requirement.
- **Worked treatment:** **SEPARATE WORKED MODEL APPROVED**. Put one small unnumbered fair-share model below the instruction, additional to the three student items and using a different approved context.
- **Key:** same item/tray geometry, with complete deterministic assignments and subdivided leftovers shown clearly.

## Validation contract

Implementation is not proof-ready until focused validation checks all of the following:

- exact requested item total, including the special Q1 rule where approved;
- no zero-item worksheet, nested-array problem, blank prompt, missing answer, or required model without structured visual data;
- seeded output is byte-for-byte stable at the structured-content boundary;
- only approved task modes, fractions, sharer counts, contexts, words, and symbols are emitted;
- every whole has an explicit identity and boundary;
- compared/matched wholes have equal dimensions;
- partition widths/heights sum exactly to the whole and differ only within rendering tolerance;
- shaded count equals structured answer truth and remains within `[0, partCount]`;
- B1.6 cases use only 2 sharers/remainder 1 or 4 sharers/remainder 2;
- the total distributed amount equals the source item count;
- true and false equivalence choices have exactly one unambiguous answer;
- compare choices have exactly one correct selection, including intentional Same cases;
- no duplicate model/answer/context signature appears on a page;
- student and answer-key pages reuse the same structured item IDs, order, wording, and geometry;
- answer keys alter only the approved answer state;
- no model, label, selection target, footer, or shading crosses its cell/page boundary;
- required type and selection-target minimums are preserved;
- preview and PDF consume the same normalized structured truth;
- Grade 2+ fraction snapshots and representative non-fraction worksheets remain unchanged;
- the catalog audit rejects generated resources that are visually required but visually empty.

## Risks and mitigations

| Risk | Required mitigation |
| --- | --- |
| Unequal visual parts | Derive every partition from one whole rectangle; validate equal geometry |
| Ambiguous whole | Draw the outer boundary and carry a stable whole identity |
| Tiny fraction notation | Words first; stacked symbols at 18–20 pt only |
| Misleading comparison | Identical whole dimensions and unit-share-only defaults |
| Symbolic work too advanced | Selection/drawing responses; no generic equations or signs |
| Number-line overreach | Defer the resource rather than relabel a strip as a line |
| Equivalence overclaim | Restrict to one half and two fourths of the same whole |
| Cramped shading/drawing | Six large shade models; three fair-share rows; reduce count before size |
| Duplicate resource roles | Preserve the four distinct construction/equivalence/comparison/context roles |
| Grade 2 leakage | Explicit Grade 1 adapter, approved pools, forbidden-concept validator, Grade 2+ regressions |
| False audit success | Reject blanks, nested arrays, zero items, and missing structured visuals |
| Curriculum-source drift | Reconcile normalized B1.6 metadata separately before implementation |

## Founder decisions required

Strong recommendations are embedded above. Only these decisions block implementation:

1. Approve the four-resource scope and defer `grade1_fraction_equivalence_fraction_number_line` to G/Grade 2+.
2. Approve the proposed titles and exact student instructions.
3. Approve the default model policy: rectangular strips for shade/match/compare and set/tray drawings for fair sharing; no circles in the first pass.
4. Approve the item counts, layouts, and separate-worked/Q1/no-example decisions.
5. Approve words-first fraction labels with `fourths` as the public term and only optional stacked `1/2`, `1/3`, `1/4`, `2/4` labels.

Everything else should follow deterministically from this contract rather than become another founder choice.

## AI-readiness check

### Deterministic Yellow Bird ownership

Approved fraction pool, same-whole identity, partition geometry, shading, fair-share arithmetic, answers, distractors, duplicate avoidance, contexts, layout, pagination, Grade 1 bounds, answer-key parity, and all validation remain deterministic.

### Possible future teacher controls

- approved item count within family-safe capacities;
- include/exclude the one-third option;
- task mode/resource selection;
- for fair sharing, include two-sharer cases, four-sharer cases, or both;
- one approved larger-print layout variant.

### Internal-only controls

Seed, geometry constants, task weighting, shuffle order, duplicate budget, renderer size class, fallback behaviour, and validation tolerances remain internal.

### Safe future AI suggestions

AI may suggest an approved familiar sharing context or a simpler wording variant. The suggestion must resolve to a structured allow-listed option and pass deterministic validation before preview or download.

### AI must never control

Fraction values, mathematical truth, partition geometry, whole identity, answers, curriculum grade, public curriculum claims, validation bypasses, or autonomous publication.

Yellow Bird-quality output means exact equal parts, an unmistakable whole, Grade 1-readable words and targets, no duplicates or ambiguity, same-seed stability, preview/PDF parity, answer-key geometry parity, and clean grayscale printing.

## Founder proof packet

The focused validator passed and exactly five PDFs were generated in `review/grade-1-fraction-family/founder-review/`. Each PDF contains one student page and one matching answer-key page.

1. `grade1_shade_equal_parts_founder_default.pdf` — six large strip models, approved fraction pool, separate `Try this one` model, grayscale shading/key parity.
2. `grade1_one_half_two_fourths_founder_default.pdf` — six same-whole Yes/No pairs, true/false balance, no completed example.
3. `grade1_compare_fair_shares_founder_default.pdf` — eight unit-share comparisons, equal whole sizes, words/selection targets, default Q1 unsolved mode.
4. `grade1_compare_fair_shares_founder_completed_q1.pdf` — the same family with the approved solved Question 1 treatment.
5. `grade1_share_fairly_founder_default.pdf` — three 2-/4-sharer cases, separate `Try this one` model, prescribed remainder cases, student/key drawing parity.

No number-line proof was generated.

## Reconciliation result

| Resource | Current category | Next eligible category |
| --- | --- | --- |
| Compare Fair Shares | A founder approved | Remain generated/internal unless separately promoted |
| Fraction Number Line | G deferred to Grade 2+ | Remain G unless a later magnitude preflight authorizes work |
| Share Fairly | A founder approved | Remain generated/internal unless separately promoted |
| One Half and Two Fourths | A founder approved | Remain generated/internal unless separately promoted |
| Shade Equal Parts | A founder approved | Remain generated/internal unless separately promoted |

Current totals are **A 31 / B 1 / C 0 / D 0 / E 0 / F 5 / G 12 = 49**. All five catalog statuses remain `generated`.

## Implementation result

Implemented architecture:

- shared deterministic truth model: `engine/problemGenerators/grade1Fractions.js`;
- one Grade 1-only catalog activity adapter: `grade1_fraction`;
- structured `fractionModel`, `fractionWorkedModel`, `answerState`, and `layoutVariant` fields preserved through layout/content normalization;
- renderer variants: `fraction_strip` and `fair_share_set` in the shared PDF renderer;
- exact task densities: 6 / 4 / 6 / 3;
- separate worked models for shade/share, no example for match, optional completed Question 1 for compare;
- focused validation: `scripts/testGrade1FractionFamily.js`;
- proof generator: `scripts/generateGrade1FractionFamilyProofs.js`.

The focused validator rejects missing structured visuals, unsupported fractions, wrong counts, unequal whole sizes, invalid partitions, ambiguous truth, fair-share reconciliation failures, number-line leakage, same-seed drift, student/key truth drift, and completed-mode violations. The shared renderer refuses Grade 1 fraction tasks whose structured visual kind is absent or mismatched, closing the blank/generic audit blind spot for this family.

All ten proof pages were rendered to images and visually inspected. Models, selection targets, separate examples, remainder halves, margins, footer, grayscale contrast, and student/key geometry passed inspection.

## Founder correction: student-friendly examples and divisible fair sharing

Founder review approved the four-resource family, the shared deterministic truth model, the `fraction_strip` renderer, and the set/tray fair-sharing structure. The controlled example-language and divisible-object correction is complete and approved.

- The final student-facing label is **`Try this one`** on student and answer-key pages. Internal renderer placement stays quiet and visually subordinate to the worksheet title.
- Fractional fair-sharing contexts are allow-listed to naturally divisible objects. The supported contract is apple (`apple_whole` / `apple_semicircle`), sandwich (`sandwich_rectangle` / `sandwich_triangle`), granola bar (`granola_bar_rectangle` / `granola_bar_half_width_rectangle`), and paper strip (`paper_strip_rectangle` / `paper_strip_half_width_rectangle`).
- Every half-sharing prompt explicitly permits one object to be cut or split into equal halves. The proof set uses 3 sandwiches between 2 children as the separate example, followed by 5 apples between 2, 10 granola bars among 4, and 7 paper strips between 2.
- The generator owns object eligibility, wording metadata, totals, sharers, whole objects per sharer, half objects per sharer, remainder truth, and whole-equivalent conservation. The renderer owns only geometry and placement.
- Whole and half visuals are deterministic outline geometry. An apple half is a semicircle with a flat cut edge; a sandwich half is a triangle with half the whole rectangle's area; granola-bar and paper-strip halves are half-width rectangles. A whole outline plus divider is forbidden.
- No Canva, bitmap, SVG, clip-art, external image asset, or new image dependency is used.
- Corrected proof paths are `review/grade-1-fraction-family/founder-review/grade1_shade_equal_parts_founder_default.pdf` and `review/grade-1-fraction-family/founder-review/grade1_share_fairly_founder_default.pdf`. The generator safely retains exactly five two-page PDFs in the folder.
- Focused verification covers the final label, separate-example count, object allow-list and rejection, explicit split language, distinct half-shape geometry, exact whole-equivalent conservation, same-seed stability, answer-key parity, approved family regressions, number-line deferral, and Grade 2+ isolation.

Founder recheck is complete. No resource is promoted and reconciliation is **A 31 / B 1 / C 0 / D 0 / E 0 / F 5 / G 12 = 49**.

Verification passed:

- syntax checks for every changed JavaScript file;
- `scripts/testGrade1FractionFamily.js`, including Grade 2 fraction-path isolation and same-seed checks;
- Grade 1 Category F Batch 2 and Batch 3 data regressions;
- Addition Facts customization, Grade 1 fluency/comparison, number representation, numeric patterning, arrays/equal groups, Category C closure, Addition on a Number Line, and Category F Batch 1 regressions;
- `npm run audit:worksheets`: ready 103/103, generated 213/213, partial 6/6, with only the seven known planned `pattern_word_problems` gaps;
- exactly five Letter-size, two-page founder PDFs;
- `git diff --check` and final working-tree review.

Founder review is complete. No promotion or push occurred; the approved implementation is included in the controlled fraction-family commit checkpoint.
