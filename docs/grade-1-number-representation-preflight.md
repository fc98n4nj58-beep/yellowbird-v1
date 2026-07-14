# Grade 1 Number Representation Preflight

Status: Implementation and founder review complete; `g1_write_the_numeral_to_50` promoted through the separate operational gate on 2026-07-14

Scope:

- Write Number Words to 50
- Write the Numeral to 50
- Base Ten Blocks to 50
- Counting With Ten Frames

Workflow stage:

Architecture scan -> Founder Design Preflight -> Variable contract -> Implementation -> Proof packet

Not in scope:

- route or public UI changes;
- resource promotion;
- staging, commit, or push.

## Implementation Checkpoint

Implemented:

- shared internal Grade 1 number-representation runtime helper for number words, base-ten blocks, and ten frames;
- `Write Number Words to 50` remains the ready public resource and now defaults to 20 questions with a 2-column layout;
- `Write the Numeral to 50` exists as a separate ready public catalog resource, without exposing a public direction toggle;
- both number-word directions support 30-question proof mode with a 3-column layout;
- `Base Ten Blocks to 50` defaults to 0-50, keeps the model in the top third, and supports internal label/selected-value options without public UI;
- `Counting With Ten Frames` defaults to 1-10, supports zero only through explicit internal options, and uses responsive count bands for low, medium, and standard question counts;
- all four target resources use completed Question 1 when `includeExample` is supplied, with the example counted inside the requested total;
- public footer labels are clean and resource-specific, with no internal implementation slugs;
- focused runtime tests, a 36-PDF technical proof packet, and a reduced 6-PDF founder recheck packet are available through `scripts/testGrade1NumberRepresentationRuntime.js` and `scripts/generateGrade1NumberRepresentationProofs.js`.

Correction pass:

- `Write the Numeral to 50` uses `Grade 1 • Math • Number Representation: Write the Numeral to 50` in the public footer and answer-key footer.
- `Counting With Ten Frames` uses responsive count bands: 1-5 questions use the low-count two-column band, 6-8 use a medium full-width band, and 9-10 use the approved standard full-width band.
- Multi-page Ten Frame behavior, including the 18-question proof case, remains on the standard full-width pagination path.
- Founder re-review is reduced to six PDFs under `review/grade-1-number-representation/founder-recheck/`.

Deferred:

- no public customization UI is wired for this family;
- `Write the Numeral to 50` passed founder review and the later separate promotion gate;
- base-ten label controls, selected-value controls, ten-frame zero controls, and number-word direction controls remain internal/runtime-supported only;
- generated legacy resources remain legacy and are not promoted.

## Executive Recommendation

Treat this as consolidation of existing Grade 1 number-representation work, not a new build.

Use two related internal families:

1. Number-word response family
   - Public resources should remain distinct by title and task direction.
   - Runtime can share one internal family with a `numberWordDirection` option.
   - Shared concerns: range, selected values, exact question counts, response-line alignment, answer keys, completed Question 1, and page balancing.

2. Visual number-model family
   - Base Ten Blocks and Counting With Ten Frames should share model-box principles, response-line placement, exact counts, answer-key behavior, and proof metadata.
   - Model drawing and layout rules must remain task-specific.

Do not force base-ten blocks or ten frames into generic text-row layouts. Do not expose public customization controls until the proof packet confirms print safety.

## Architecture Scan

### Resource IDs And Current Status

| User-facing task | Current canonical resource ID | Status | Notes |
| --- | --- | --- | --- |
| Write Number Words to 50 | `g1_number_word_match_to_50` | ready | Curated Grade 1 resource. Current title is already `Write Number Words to 50`. |
| Write the Numeral to 50 | `g1_write_the_numeral_to_50` | ready | Separate public resource; no public direction toggle is exposed. |
| Base Ten Blocks to 50 | `grade1_place_value_representation_base_ten_blocks` | ready | Curated generated-style ID with approved title/task alignment. |
| Counting With Ten Frames | `g1_ten_frame_addition_within_10` | ready | Curated Grade 1 ID; title is `Counting With Ten Frames` even though the ID is legacy addition-strategy wording. |

Related legacy/generated resources:

- `grade1_place_value_representation_number_word_match` is generated, not the curated ready resource.
- `grade1_place_value_representation_standard_form` is generated and not the approved Write-the-Numeral-to-50 public resource.
- `grade1_addition_subtraction_facts_ten_frame` is generated and not the curated Counting With Ten Frames resource.

Recommendation: treat the ready curated resources and the runtime reverse mode as canonical for this preflight. Treat generated same-activity resources as legacy/reference only unless a future promotion decision reopens them.

### Active Production Path

All four tasks flow through the shared catalog worksheet path:

Catalog item -> `services/worksheetCatalogService.js` -> `engine/worksheetBuilder/buildWorksheet.js` -> problem generator -> `engine/layout/normalizeWorksheetLayout.js` -> `services/catalogWorksheetRuntimeService.js` -> `engine/worksheetBuilder/normalizeWorksheetContent.js` -> `renderers/pdfRenderer.js`

### Catalog And Generator Mapping

Write Number Words to 50:

- Resource ID: `g1_number_word_match_to_50`
- Catalog source: `data/worksheetCatalog.master.json`; older source in `config/worksheetCatalog/grade1.js` has the same ID with older title/task wording
- Skill: `number_representation`
- Recipe: `engine/activityRecipes/number_representation.json`
- Activity: `number_word_match`
- Generator: `engine/problemGenerators/numberWordMatch.js`
- Current defaults in master: `minA: 0`, `maxA: 50`, `questionCount: 20`, `promptStyle: "number_only"`, `numberWordMode: "numeral_to_word"`
- Current layout: two columns, `maxProblemsPerPage: 20`, writing line, subtitle hidden
- Current instruction: `Write each number in words.`
- Current answer key: shared answer-key page; written word answer is placed on the response line

Write the Numeral to 50:

- Current public status: ready after the separate founder-approved promotion gate
- Runtime mode: `numberWordMode: "word_to_numeral"` inside the shared number-word family
- Runtime title: `Write the Numeral to 50`
- Current instruction: `Write the numeral for each number word.`
- Generator: `engine/problemGenerators/numberWordMatch.js`
- Current reverse-mode layout: derived columns by question count, up to 3 columns and `maxProblemsPerPage: 30`, shorter response line, prompt zone around 70px, sequential column fill
- Current answer key: shared answer-key page; numeral answer is placed on the shorter response line

Base Ten Blocks to 50:

- Resource ID: `grade1_place_value_representation_base_ten_blocks`
- Status: ready
- Skill: `place_value_representation`
- Recipe: `engine/activityRecipes/place_value_representation.json`
- Activity: `base_ten_blocks`
- Generator: `engine/problemGenerators/baseTenBlocks.js`
- Current defaults: `minA: 0`, `maxA: 50`, `questionCount: 10`
- Current layout: one column visual model layout
- Current display: hide prompts, subtitle hidden, short visual answer line, base-ten aligned response
- Current instruction: `Count the base ten blocks. Write the number.`
- Current renderer path: `renderers/pdfRenderer.js` visual kind `base_ten_blocks`, with `baseTenAlignedResponse` handling and optional `baseTenTensOnesBoxes`
- Current answer key: numeral is shown on the response line, or tens/ones boxes if that mode is active

Counting With Ten Frames:

- Resource ID: `g1_ten_frame_addition_within_10`
- Status: ready
- Skill: `addition_strategies`
- Recipe: `engine/activityRecipes/addition_strategies.json`
- Activity: `ten_frame`
- Generator: `engine/problemGenerators/tenFrame.js`
- Current defaults: `minA: 1`, `maxA: 10`, `questionCount: 10`, `tenFramesPerQuestion: 1`
- Current layout: full-width boxes by default; two narrow columns are used for 1-5 question proof mode
- Current display: title-aligned ten-frame counting, subtitle hidden, visual top-third, short visual answer line
- Current instruction: `Count the dots. Write the number.`
- Current renderer path: `renderers/pdfRenderer.js` visual kind `ten_frame`
- Current answer key: numeral answer is shown on the response line

### Current Completed-Example Support

The shared catalog runtime can mark the first generated item as `isExample` when `includeExample` is supplied. Dense Grade 1 fluency/comparison now has a special Question 1 example rule. These number-representation resources are not yet explicitly in that dense-family exception.

Recommendation:

- Number-word response family: completed example should be Question 1 and count within the requested total.
- Visual number-model family: completed example should also be Question 1 and use the normal model/question layout, unless founder review asks for a standalone model example.
- Patterning and other task families keep their existing family-specific rules.

## Current State Versus Founder Decisions

### Matches

- Write Number Words current title and instruction match the intended direction.
- Reverse mode already changes the title to `Write the Numeral to 50`.
- Reverse mode already uses shorter response lines and a prompt zone so the answer line sits closer to the number word.
- Base Ten Blocks already hides generic prompt prose and uses a model plus short response line.
- Base Ten Blocks already supports optional TENS/ONES boxes through `baseTenTensOnesBoxes`.
- Counting With Ten Frames already has the approved title and top-third visual alignment.
- Ten-frame runtime supports fixed frames and min/max frame count aliases.
- Existing decisions record Grade 1 defaults: ten frames within 10, number words/base-ten to 50, written number words left-aligned, short numeral answers centered.

### Resolved In This Runtime Checkpoint

- Write Number Words now defaults to 20 questions and a 2-column layout.
- Both number-word directions support the 30-question, 3-column proof layout.
- Write the Numeral has a separate ready catalog resource after its promotion gate.
- Number-word response target variants are named through runtime/layout metadata.
- Base Ten Blocks uses the approved instruction and 0-50 runtime range.
- Ten Frames defaults to 1-10, supports zero only through explicit internal options, and uses the approved instruction.
- Ten Frames switches by requested question count: 1-5 questions use two narrow columns; above 5 uses full-width boxes.

Remaining deferred items:

- no public customization UI is wired;
- no resource promotion is included.

## Shared-Family Recommendation

### Number-Word Response Family

Members:

- `g1_number_word_match_to_50` with `numberWordDirection: "numeral_to_word"`
- `g1_number_word_match_to_50` with `numberWordDirection: "word_to_numeral"`
- Future optional public resource: a separate Write-the-Numeral-to-50 catalog item that reuses the same runtime

Shared:

- exact `questionCount`
- number range
- selected values
- deterministic unique value pool
- response-line layout
- page balancing
- completed Question 1
- answer-key parity
- proof metadata

Family-specific:

- response-target variant: long written response versus short numeral response
- title and instruction by direction
- prompt width and answer-line width

Resource-specific:

- public title
- default direction
- default question count
- curriculum and footer labels

### Visual Number-Model Family

Members:

- Base Ten Blocks to 50
- Counting With Ten Frames

Shared:

- visual model in top third
- response line under/near the model
- exact question count
- completed Question 1 in normal layout
- answer key uses same response position
- multi-page numbering and balanced distribution
- proof metadata

Family-specific:

- base-ten block drawing, grouping, labels, and value decomposition
- ten-frame drawing, dot arrangement, frame-count behavior, and zero policy
- model-specific maximum safe density

Do not generalize:

- dot radius, block scale, frame size, column count, page capacity, model spacing, or label geometry into public controls.

## Signed Preflight: Write Number Words To 50

Resource:

- Current ID: `g1_number_word_match_to_50`
- Direction: `numeral_to_word`
- Current status: ready

Approved design:

- Title: `Write Number Words to 50`
- Instruction: `Write each number in words.`
- Subtitle: hidden
- Prompt: numeral only, with no repeated prompt prose
- Response: long written response line, left-aligned answer on answer key
- Default question count: 20
- Maximum proofed question count: 30
- Layout: 20-question default should use a measured two-column layout unless proof shows the approved three-column grid is calmer; 30-question mode should use 3 columns x 10 rows
- Answer line: begins close to prompt and never underlines the prompt
- Typography: Grade 1 readable body type; do not shrink below approved family size to force density
- Footer: public labels only, recommended `Grade 1 - Math - Number Representation`
- Completed example: Question 1, counts within total, no `Example` heading, only the written answer emphasized
- Answer key: same numbering and page grouping; only inserted answer bold
- Range: default 0-50; deliberate override above 50 allowed only with notice and proof
- Duplicate policy: unique values while available; controlled deterministic repetition when exhausted

Current implementation:

- Default is 20 questions in two columns.
- 30-question proof mode uses 3 columns x 10 rows.

## Signed Preflight: Write The Numeral To 50

Resource:

- Current ID: `g1_write_the_numeral_to_50`
- Current status: ready after founder review and the separate resource-promotion gate

Approved design:

- Title: `Write the Numeral to 50`
- Instruction: `Write the numeral for each number word.`
- Subtitle: hidden
- Prompt: number word only
- Response: short numeral line close to prompt
- Default question count: 20
- Maximum proofed question count: 30
- Layout: 20-question mode can use two columns; 30-question mode should use 3 columns x 10 rows where proof confirms widest words fit
- Answer line: shorter than number-word response line and not too far right
- Prompt width: must fit hyphenated words such as `twenty-seven`, `thirty-eight`, and `forty-nine`
- Completed example: Question 1, counts within total, no `Example` heading, only the numeral answer emphasized
- Answer key: numeral centered or aligned consistently on the short response line
- Footer: public labels only

Current implementation:

- Title and instruction are aligned to the approved public copy.
- A separate public catalog resource exists as ready, and the runtime remains shared internally.

## Response-Target Contract: Number Words

Named variants:

1. Written-word response
   - Used for numeral-to-word.
   - Long handwriting line.
   - Line begins close to the numeral but after enough prompt spacing that it does not underline the numeral.
   - Answer key places the full number word left-aligned on the line.
   - Hyphenation remains visible for 21-49.

2. Short-numeral response
   - Used for word-to-numeral.
   - Short line, approximately 46px at current runtime scale unless proof requires adjustment.
   - Prompt zone should keep the line close to the number word.
   - Answer key places the numeral cleanly on or above the line.

Shared rules:

- Same-direction rows align vertically.
- Widest prompts do not collide with response targets.
- Multi-column layout uses sequential column fill.
- Answer lines remain drawn targets, not raw underscores.
- No one-off offsets should be added at the resource level unless proof shows a true resource-specific exception.

## Mode Contract

Recommended internal mode values:

- `numeral_to_word`
- `word_to_numeral`

Aliases:

- Existing `numberWordMode`
- Existing generic `mode`

Precedence:

1. canonical `numberWordDirection`
2. current `numberWordMode`
3. legacy `mode`
4. resource default

Public structure recommendation:

- Keep distinct public resource titles/pages.
- Use one shared internal runtime and generator path.
- Do not expose a public mode toggle yet.
- If a separate Write-the-Numeral resource is later created, it should be a catalog declaration that defaults the shared runtime to `word_to_numeral`.

## Signed Preflight: Base Ten Blocks To 50

Resource:

- Current ID: `grade1_place_value_representation_base_ten_blocks`
- Current status: ready

Approved design:

- Title: `Base Ten Blocks to 50`
- Instruction: `Count the base ten blocks. Write the number.`
- Subtitle: hidden
- Layout: visual model question boxes
- Model placement: top third of each question area
- Response: short answer line below/aligned with model, roughly half width
- Optional response mode: TENS/ONES labelled rectangles
- Labels: must not crowd or overlap models
- Default question count: keep 10 until proof supports a higher calm density
- Range: default 0-50
- Maximum safe value: 50 by default; override above 50 requires proof and no hundreds unless explicitly enabled
- Completed example: Question 1, same model/question layout, counts within total, only answer emphasized
- Answer key: numeral or TENS/ONES digits in same response target; surrounding labels regular
- Footer: public labels only
- Multi-page behavior: exact count, continuous numbering, balanced pages where safe

Current implementation:

- Instruction uses the approved wording.
- The active Grade 1 Base Ten Blocks resource keeps the model in the top third while preserving the aligned response target.

## Variable Contract: Base Ten Blocks

Recommended public-ready controls after proof:

- Number of questions
- Number range
- Show TENS and ONES labels
- Show one completed example
- Include answer key

Runtime-only or deferred:

- Questions per page
- Model scale
- Block spacing
- Label rectangle dimensions
- Maximum tens/ones visual count
- Worksheet seed

Selected numbers to practise:

- Recommendation: defer public exposure unless proof shows it controls practice usefully without creating poor visual repetition.

## Signed Preflight: Counting With Ten Frames

Resource:

- Current ID: `g1_ten_frame_addition_within_10`
- Current status: ready

Approved design:

- Title: `Counting With Ten Frames`
- Instruction: `Count the dots. Write the number.`
- Subtitle: hidden
- Layout: visual model question boxes
- Frame placement: top third
- Response: short answer line, roughly half width
- Default range: 1-10 unless zero is explicitly approved
- Current runtime default range: 1-10; zero is supported only through explicit internal options
- Frame selection: exact frames or random frames within range
- Completed example: Question 1, normal model/question layout, counts within total, only numeral answer emphasized
- Answer key: numeral on same response line
- Footer: public labels only
- Multi-page behavior: exact count, continuous numbering, balanced pages where safe

Implemented layout rule:

- 1-5 requested questions use two narrow columns with a larger frame and modestly larger centered response target.
- 6-8 requested questions use medium full-width rows that distribute across more of the printable page height.
- 9-10 requested questions keep the approved standard full-width compact layout.
- More than 10 questions keep standard balanced multi-page behavior.
- Frames per question remains an internal/runtime option and is not exposed as public UI.

## Variable Contract: Ten Frames

Recommended public-ready controls after proof:

- Number of questions
- Frames to practise
- Frame selection mode: exact values or random within range
- Show one completed example
- Include answer key

Canonical runtime controls:

- `questionCount`
- `selectedValues` or exact frame values
- `minimumValue` / `maximumValue` for represented dot count
- `minimumFrameCount` / `maximumFrameCount` or existing `minTenFrames` / `maxTenFrames`
- `tenFramesPerQuestion` for exact frame count
- `includeExample`
- `includeAnswerKey`

Do not expose:

- column count
- frame size
- dot radius
- page capacity
- model spacing
- worksheet seed

## Page Capacity And Pagination Recommendations

Number Words:

- Default 20: proof a two-column layout first; use 10 rows per column.
- 30-question mode: proof 3 columns x 10 rows.
- Multi-page: exact counts, sequential column fill, balanced final page where safe.

Write the Numeral:

- Default 20: current reverse-mode two-column layout is a good starting point.
- 30-question mode: current reverse-mode three-column layout is the proof target.
- Widest prompts should be tested with hyphenated 20s, 30s, and 40s.

Base Ten Blocks:

- Default: keep 10 until model/label variants are proofed.
- Labels on: capacity may need to be lower if labels crowd.
- Labels off: may share the same page capacity unless proof shows a safe increase.
- Multi-page: balance without shrinking model clarity.

Ten Frames:

- One frame per question: 9-10 question defaults keep the approved compact full-width layout.
- 1-5 question proof mode uses two narrow columns.
- 6-8 question proof mode uses medium full-width rows.
- More than 10 questions keep standard balanced multi-page behavior.
- Exact selected values and min/max random value range are covered by the proof packet.

Completed examples:

- Use Question 1 for all four resources in this preflight unless founder review asks for a standalone visual example.
- Do not create an extra page solely because an example is enabled where the normal capacity can hold the requested count.

## Mathematical And Content Safety

Number Words:

- Numeral and word must match.
- Use lowercase words.
- Hyphenate compound numbers from 21-49.
- Treat zero consistently as `zero`.
- No ambiguous wording.
- Overrides above 50 require bounded validation and proof.

Base Ten Blocks:

- Tens/ones counts must match the answer.
- No hundreds in the default Grade 1 lane.
- Blocks must not clip or become too small to count.
- Label mode must show correct digits independently.

Ten Frames:

- Dot count must match the answer.
- Values should stay within 1-10 unless zero is explicitly approved.
- Empty frames should not appear accidentally.
- Dot arrangement should be deterministic and legible.

## Duplicate And Variety Policy

Number Words signature:

- value
- direction

Base Ten signature:

- value
- label mode

Ten Frame signature:

- represented value
- frames per question
- arrangement variant if arrangements are later varied

Shared policy:

- prefer unique values while the pool permits
- use controlled deterministic repetition when exhausted
- avoid unbounded retries
- record internal low-variety diagnostics
- do not print diagnostics on PDFs

## Teacher-Facing Variable Recommendations

Number Words / Write the Numeral:

- Number of questions
- Number range
- Numbers to practise
- Show one completed example
- Include answer key

Deferred:

- Questions per page
- Direction/mode toggle

Base Ten Blocks:

- Number of questions
- Number range
- Show TENS and ONES labels
- Show one completed example
- Include answer key

Ten Frames:

- Number of questions
- Frames to practise
- Frame selection mode: exact values or random within range
- Show one completed example
- Include answer key

Avoid duplicative or technical controls.

## Proof Packet Plan

Future proof artifacts should stay under excluded `review/`.

Number Words:

1. Numeral-to-word default 20
2. Word-to-numeral default 20
3. Numeral-to-word 30-question layout
4. Word-to-numeral 30-question layout
5. Widest default prompts
6. Completed Question 1
7. Answer key
8. Multi-page exact count
9. Selected-number emphasis
10. Custom range
11. Same-seed parity

Base Ten Blocks:

12. Default
13. TENS/ONES labels on
14. Labels off
15. Completed Question 1
16. Answer key
17. Maximum safe value
18. Multi-page exact count
19. Same-seed parity

Ten Frames:

20. 1-5 two-column mode
21. Above-5 full-width mode
22. Exact selected frames
23. Random min/max range
24. Completed Question 1
25. Answer key
26. Multi-page exact count
27. Same-seed parity

Cross-family:

28. Header/footer comparison
29. Response-target comparison
30. Page-balance comparison
31. Low-variety stress
32. Nearest-family regression proof

Proof metadata should include:

- resource ID
- direction or visual mode
- seed
- normalized options
- requested count
- rendered item count
- page count
- page distribution
- example status
- answer-key status
- response-target variant
- footer label
- duplicate count
- same-seed parity result

## Open Decisions

1. Should completed examples be Question 1 for all four resources?
   - Strong recommendation: yes. It keeps dense response/model sheets aligned with Addition Facts without creating extra example blocks.

2. Should Number Words and Write the Numeral remain separate public resources?
   - Checkpoint decision: yes for public browsing, with shared runtime internally. Write the Numeral is ready after founder review and its separate promotion gate.

3. Should mode switching remain runtime-only?
   - Checkpoint decision: yes. Do not expose a public mode toggle.

4. Should selected numbers be public for Base Ten Blocks?
   - Strong recommendation: defer. It can be useful, but proof must show repetition does not hurt visual variety.

5. Should zero be supported in Ten Frames?
   - Checkpoint decision: default public range is 1-10; zero is internal-only through explicit options.

6. Should questions per page remain public-deferred?
   - Strong recommendation: yes.

7. Are 30-question modes safe for both number-word directions?
   - Checkpoint decision: both directions are proofed with the 30-question layout.

8. Should base-ten default range start at 0 or 10?
   - Checkpoint decision: runtime default starts at 0 and remains capped at 50.

9. Should footers be cleaned now for these resources?
   - Checkpoint decision: yes. Canonical public footers are resource-specific and do not expose internal slugs.

## Recommended Implementation Scope

Future implementation remains limited to founder-approved follow-up checkpoints:

- do not build public customization UI;
- do not promote resources without a separate checkpoint;
- keep model-specific renderers and public footer safeguards intact.

## Explicit Deferrals

- public customization UI
- public mode toggle
- questions-per-page controls
- model scale, dot radius, and block spacing controls
- broad renderer redesign
- resource promotion
- commit

## Final Recommendation

Proceed to founder recheck using the reduced six-PDF packet. Public customization remains deferred.
