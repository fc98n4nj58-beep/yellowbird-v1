# Grade 1 Fluency + Comparison Preflight

Status: Founder design preflight, variable contract, runtime implementation, focused tests, and proof packet

Scope: `g1_subtraction_facts_within_20`, `g1_missing_addends_within_20`, and `g1_compare_numbers_to_20`

Workflow stage:

Architecture scan -> Founder Design Preflight -> Variable contract -> Implementation -> Proof packet -> Founder review

Not in scope:

- resource promotion;
- public customization UI;
- staging, commit, or push.

Implementation checkpoint:

- Runtime support is implemented for `g1_subtraction_facts_within_20`, `g1_missing_addends_within_20`, and `g1_compare_numbers_to_20`.
- Public customization UI remains Addition Facts-only; this batch does not wire new Resource Detail controls.
- Proof artifacts are generated under excluded `review/grade-1-fluency-comparison/`.
- Founder PDF review is still required before any public customization decision or resource-promotion decision.

## Executive Recommendation

Use two related foundations, not one broad rewrite:

1. Shared Grade 1 fluency foundation
   - Includes Addition Facts, Subtraction Facts, and Missing Addends.
   - Owns exact student-question counts, 60-per-page dense grids, shared range/selected-number controls, completed examples, answer-key parity, deterministic generation, and the standardized short numeric answer target.

2. Comparison task family
   - Includes Compare Numbers to 20.
   - Reuses the same count/range/selected-number/completed-example/answer-key/pagination infrastructure.
   - Keeps a comparison-specific problem structure, four-column layout, answer-target variant, symbol distribution policy, and equality policy.

Do not fold Compare Numbers into fact fluency merely because it is compact and 60-per-page. It needs a distinct target, spacing, outcome-balance policy, and duplicate policy.

Strong implementation sequence:

1. Extend the Addition Facts runtime foundation into a shared Grade 1 fluency support layer.
2. Add Subtraction Facts and Missing Addends to that layer with proof-only runtime support first.
3. Add the Comparison task family separately, reusing shared variable normalization and answer-target tokens.
4. Generate a proof packet.
5. Ask founder review before any public UI beyond Addition Facts.

## Architecture Scan

### Resource IDs And Status

| Resource | Catalog ID | Status | Current family | Activity | Template |
| --- | --- | --- | --- | --- | --- |
| Addition Facts Within 20 | `g1_addition_facts_within_20` | ready | `fact_fluency` | `math.addition.basic` | `fluency_grid` |
| Subtraction Facts Within 20 | `g1_subtraction_facts_within_20` | ready | `fact_fluency` | `related_subtraction` | `fluency_grid` |
| Missing Addends Within 20 | `g1_missing_addends_within_20` | ready | `relational_thinking` | `missing_addend` | `fluency_grid` |
| Compare Numbers to 20 | `g1_compare_numbers_to_20` | ready | `relational_thinking` | `compare_numbers` | `equation_practice` |
| Fact Families Within 20 | `g1_fact_families_within_20` | ready | `relational_thinking` | `fact_family` | `matching` |

Fact Families are not part of this batch, but the answer-target contract should remain compatible with the approved Fact Families layout.

### Active Production Paths

Shared catalog flow:

Catalog item -> `services/worksheetCatalogService.js` -> `engine/worksheetBuilder/buildWorksheet.js` -> problem generator -> `engine/layout/normalizeWorksheetLayout.js` -> `services/catalogWorksheetRuntimeService.js` -> `engine/worksheetBuilder/normalizeWorksheetContent.js` -> `renderers/pdfRenderer.js`

Subtraction Facts:

- catalog source: `config/worksheetCatalog/grade1.js`
- production master item: `data/worksheetCatalog.master.json`
- recipe: `engine/activityRecipes/addition_subtraction_facts.json`
- generator: `engine/problemGenerators/relatedSubtraction.js`
- underlying arithmetic engine: `engine/engines/arithmeticEngine.js`
- builder mapping: `activityTypes: ["related_subtraction"]`
- layout map: `engine/layout/worksheetTypeMap.json` entry `related_subtraction`
- renderer path: generic inline blank path with `standardShortAnswerTarget`
- answer key: shared answer-key page; answer fills inline blank
- completed example: first generated item marked `isExample` when `includeExample` is true

Missing Addends:

- catalog source: `config/worksheetCatalog/grade1.js`
- production master item: `data/worksheetCatalog.master.json`
- recipe: `engine/activityRecipes/addition_subtraction_facts.json`
- generator: `engine/problemGenerators/missingAddend.js`
- fallback arithmetic engine: `engine/engines/arithmeticEngine.js`
- builder mapping: `activityTypes: ["missing_addend"]`
- layout map: `engine/layout/worksheetTypeMap.json` entry `missing_addend`
- renderer path: generic inline blank path with `standardShortAnswerTarget`
- answer key: shared answer-key page; answer fills inline blank
- completed example: first generated item marked `isExample` when `includeExample` is true

Compare Numbers:

- catalog source: `config/worksheetCatalog/grade1.js`
- production master item: `data/worksheetCatalog.master.json`
- recipe: `engine/activityRecipes/number_relationships.json`
- generator: `engine/problemGenerators/compareNumbers.js`
- builder mapping: `activityTypes: ["compare_numbers"]`
- layout map: `engine/layout/worksheetTypeMap.json` entry `compare_numbers`
- renderer path: generic inline blank path with `standardShortAnswerTarget`
- answer key: shared answer-key page; answer fills inline blank
- completed example: first generated item marked `isExample` when `includeExample` is true

Addition Facts overlap:

- Addition Facts has the strongest current runtime support.
- `config/worksheetCustomization/families/additionFactsWithin20.js` declares canonical controls and adapters.
- `engine/problemGenerators/factFluency.js` has customized Addition Facts pool building, selected-number emphasis, exact counts, deterministic sequence state, duplicate avoidance, and low-variety behavior.
- Subtraction, Missing Addends, and Compare Numbers should inherit the normalization and proof shape where safe, but they should not blindly reuse Addition Facts generation assumptions.

### Current Defaults Observed

Production master defaults:

- Subtraction Facts: `minA: 0`, `maxA: 20`, `minB: 0`, `maxB: 20`, `questionCount: 60`, subtitle hidden, standard short answer target on.
- Missing Addends: `minA: 0`, `maxA: 20`, `minB: 0`, `maxB: 20`, `maxTotal: 20`, `questionCount: 60`, subtitle hidden, standard short answer target on.
- Compare Numbers: `minA: 0`, `maxA: 20`, `questionCount: 60`, `promptStyle: "bare"`, subtitle hidden, standard short answer target on.

Current runtime layout:

- all three resources use 4 columns;
- all three use `maxProblemsPerPage: 60`;
- all three use `denseGridRows: 15`;
- all three preserve exact requested question count at generation time;
- if `includeExample` is true for dense Grade 1 fluency/comparison, the catalog service marks Question 1 as the completed example and keeps the requested printed-question count exact.

### Current Gaps

Subtraction Facts:

- current instruction is `Solve each equation.`; founder-approved instruction should be `Solve each subtraction fact.`
- current generator does not expose structured `a`, `b`, and `op` metadata through `relatedSubtraction.js`;
- current selected-number behavior comes from `onlyNumbers` in the arithmetic engine and is closer to exclusive filtering than Addition Facts emphasis;
- current duplicate avoidance is weaker than Addition Facts because `relatedSubtraction.js` delegates to the arithmetic engine without using `usedProblemKeys`.

Missing Addends:

- current instruction is `Write the missing number.`; founder-approved instruction should be `Write the missing number in each equation.`
- current default is fixed first-addend missing (`__ + known = total`) when `maxTotal` is present;
- current selected-number behavior is not implemented in the `maxTotal` path;
- current generator does not expose structured first addend, second addend, total, or missing-position metadata;
- current duplicate avoidance is weaker than Addition Facts.

Compare Numbers:

- current generator can produce equality because random `a` and `b` can match;
- current default seed can overproduce one symbol direction in a short prefix and does not enforce >/< /= balance;
- current selected-number behavior is exclusive when `selectedNumbers` is present;
- current duplicate avoidance is absent;
- reversed mirror pairs such as `4 < 9` and `9 > 4` are not treated as related variants;
- current inline target uses the generic short blank, but comparison needs a centered symbol target with controlled spacing.

## Reusable Family Decision

### Shared Fluency Foundation

Members:

- Addition Facts Within 20
- Subtraction Facts Within 20
- Missing Addends Within 20

Shared:

- exact `questionCount`;
- internal `questionsPerPage`;
- 4-column, 60-question dense grid default;
- seeded preview/PDF parity;
- standardized short numeric answer target;
- completed example contract;
- answer-only bolding;
- number range defaults and override notice;
- selected-number emphasis;
- duplicate avoidance and controlled repetition diagnostics;
- proof metadata shape.

Family-specific:

- Addition Facts: total cap and commutative duplicate signature.
- Subtraction Facts: non-negative difference and minuend/subtrahend relation.
- Missing Addends: missing-position distribution and missing-answer semantics.

Resource-specific:

- Grade 1 default range and wording.
- Public title and student instruction.
- Curriculum framing and footer metadata.

### Comparison Task Family

Members:

- Compare Numbers to 20.

Shared with fluency foundation:

- `questionCount`;
- number range;
- selected-number normalization;
- `includeExample`;
- `includeAnswerKey`;
- worksheet seed;
- pagination and proof metadata;
- answer-only bolding;
- public footer labels.

Comparison-specific:

- pair generation;
- equality policy;
- symbol distribution;
- mirror-pair throttling;
- comparison symbol answer target;
- four-column spacing around left value, target, and right value.

### Highest Safe Architecture Level

Recommended level:

1. Shared variable normalization and registry declarations.
2. Shared Grade 1 fluency generator helper for Addition/Subtraction/Missing Addends.
3. Separate comparison generator helper using the same variable contract.
4. Shared answer-target tokens used by renderer paths.
5. Resource-specific title/instruction/defaults.

Do not recommend:

- a broad renderer rewrite;
- a route redesign;
- a public customization panel before runtime/PDF proof;
- folding Compare Numbers into the fact generator;
- exposing layout controls as teacher controls.

## Signed Preflight: Subtraction Facts Within 20

Family: Grade 1 fluency foundation

Activities: `related_subtraction`

Grades: Grade 1

Approved title: `Subtraction Facts Within 20`

Approved header/instruction:

- Title -> divider -> `Solve each subtraction fact.` -> worksheet content.
- Subtitle hidden by default.
- Do not repeat `Solve` in each question.

Layout:

- 4 columns.
- 15 dense rows.
- 60 student questions per page by default.
- Compact equation row.
- Question shape: `14 - 6 = ______`.
- Existing Addition Facts dense layout can be reused if subtraction spacing is measured with two-digit minuends and two-digit differences.

Answer target:

- Use shared `shortNumeric`.
- No extra answer line below the equation.
- Target must fit values 0-20 by default and wider override values when proofed.

Default page capacity:

- 60 printed questions per page by default.
- If completed example is on, Question 1 is solved and the page still contains 60 total questions where capacity permits.

Pagination risks:

- Wider custom ranges above 20 may need a measured target width or lower internal capacity after proof.
- Wider custom ranges above 20 may need a measured target width or lower internal capacity after proof.

Completed example:

- Completed example is Question 1.
- No separate `Example` label.
- Counts within the requested total.
- Question 2 follows normally.
- Example shape: `14 - 6 = 8`, with only `8` emphasized.

Answer key:

- Same numbering as student worksheet.
- Numeric answer appears in the same target position.
- Only the answer is bold.
- Multi-page grouping should mirror student grouping where practical.

Footer:

- Public labels only, for example `Grade 1 • Math • Addition & Subtraction • Addition and Subtraction Facts`.
- No internal activity or generator slugs.

Teacher-facing variables:

- Number of questions.
- Number range.
- Numbers to practise.
- Show one completed example.
- Include answer key.
- Questions per page remains possible but should be public-deferred at first.

Runtime-only variables:

- seed;
- retry limits;
- duplicate signatures;
- candidate-pool size;
- page capacity;
- target dimensions;
- renderer coordinates.

Deferred controls:

- separate minuend range;
- separate subtrahend range;
- difference-only range;
- negative-answer mode.

Known risks:

- current generator lacks structured metadata and robust duplicate avoidance;
- current selected-number behavior is exclusive, not emphasis;
- range override above 20 needs width proof.

Implementation verdict:

Ready for implementation after founder accepts this preflight.

## Signed Preflight: Missing Addends Within 20

Family: Grade 1 fluency foundation with missing-addend-specific placement rules

Activities: `missing_addend`

Grades: Grade 1

Approved title: `Missing Addends Within 20`

Approved header/instruction:

- Title -> divider -> `Write the missing number in each equation.` -> worksheet content.
- Subtitle hidden by default.
- Do not repeat prompt prose in each question.

Layout:

- 4 columns.
- 15 dense rows.
- 60 student questions per page by default.
- Inline equation row.
- Question shapes:
  - `7 + ______ = 12`
  - `______ + 5 = 12`

Answer target:

- Use shared `shortNumeric`.
- Target appears in the missing-addend position.
- Beginning and middle blanks must remain obvious and aligned.

Default page capacity:

- 60 printed questions per page by default.
- If completed example is on, Question 1 is solved and the page still contains 60 total questions where capacity permits.

Pagination risks:

- Mixed positions may require measuring both starting-target and middle-target rows.
- Two-digit totals plus a starting blank should not crowd the question number gutter.

Completed example:

- Completed example is Question 1.
- No separate `Example` label.
- Counts within the requested total.
- Question 2 follows normally.
- Example should use the same missing position as the generated item.
- Only the missing answer is emphasized.

Answer key:

- Same numbering as student worksheet.
- Missing answer appears in the same target position.
- Only the answer is bold.
- Do not bold the full equation.

Footer:

- Public labels only, for example `Grade 1 • Math • Addition & Subtraction • Addition and Subtraction Facts`.
- No internal `missing_addend` slug.

Teacher-facing variables:

- Number of questions.
- Number range.
- Numbers to practise.
- Where the missing number appears.
- Show one completed example.
- Include answer key.
- Questions per page remains possible but should be public-deferred at first.

Missing-position recommendation:

- Default to deterministic mixed positions after proof.
- Use balanced distribution across first-addend and second-addend positions.
- Avoid random clustering.
- Public labels:
  - First addend
  - Second addend
  - Mixed positions

Runtime-only variables:

- seed;
- retry limits;
- duplicate signatures;
- candidate-pool size;
- page capacity;
- target dimensions;
- renderer coordinates.

Deferred controls:

- separate total range;
- separate visible-addend range;
- missing answer only range;
- multi-blank equations.

Known risks:

- current generator is fixed first-addend missing in the `maxTotal` path;
- current selected-number behavior is not implemented in the `maxTotal` path;
- current generator lacks structured metadata for first addend, second addend, total, and missing position.

Implementation verdict:

Ready for implementation after founder confirms mixed positions as the default.

## Signed Preflight: Compare Numbers To 20

Family: Comparison task family

Activities: `compare_numbers`

Grades: Grade 1

Approved title:

- Keep `Compare Numbers to 20`.

Approved header/instruction:

- Title -> divider -> `Write >, <, or = to compare each pair of numbers.` -> worksheet content.
- Subtitle hidden by default.
- Do not repeat `Compare the numbers:` in every item.

Layout:

- 4 columns.
- 15 dense rows.
- 60 student questions per page by default.
- Compact row structure with left value, centered symbol target, and right value.
- Question shape: `14   ______   9`, or a measured equivalent.
- Improve spacing before and after the target.
- Align targets across all four columns.

Answer target:

- Use a `comparisonSymbol` variant, not the ordinary long arithmetic blank.
- Target must clearly fit `>`, `<`, or `=`.
- Target should be short, centered, and visibly answerable.
- It should not look like a long numeric answer line.

Default page capacity:

- 60 printed questions per page by default.
- If completed example is on, Question 1 is solved and the page still contains 60 total questions where capacity permits.

Pagination risks:

- Four-column layout is required, but the comparison target needs more spacing than raw underscores.
- Widest default values are two-digit numbers on both sides.
- Custom override above 20 must be proofed with wider values before public exposure.

Completed example:

- Completed example is Question 1.
- No separate `Example` label.
- Counts within the requested total.
- Question 2 follows normally.
- Example shape: `14 > 9`, with only the symbol emphasized.

Answer key:

- Same numbering as student worksheet.
- Symbol appears centered in the same target.
- Only the symbol is bold.
- Do not bold the full comparison expression.

Footer:

- Public labels only, for example `Grade 1 • Math • Number Sense • Number Relationships`.
- No internal `compare_numbers` slug.

Teacher-facing variables:

- Number of questions.
- Number range.
- Numbers to practise.
- Include equal pairs.
- Show one completed example.
- Include answer key.
- Questions per page remains possible but should be public-deferred at first.

Equality policy:

- Include equal pairs by default.
- Add a future `includeEqualPairs` control.
- When equality is on, target a balanced but not rigid distribution across `>`, `<`, and `=`.
- When equality is off, generate only `>` and `<` pairs and preserve balance.

Duplicate policy:

- Signature: left value, right value, expected symbol.
- Treat mirror pairs as related variants; limit immediate/repeated mirror use.
- Avoid excessive self-pairs when equality is on.

Runtime-only variables:

- seed;
- retry limits;
- duplicate signatures;
- candidate-pool size;
- page capacity;
- target dimensions;
- renderer coordinates;
- symbol-balance counters.

Deferred controls:

- columns;
- target width;
- row spacing;
- pair-generation retry limits;
- exact symbol ratios;
- manual pair ordering.

Known risks:

- current generator can overuse one symbol outcome;
- selected numbers currently behave like exclusive filtering;
- duplicate and mirror-pair policies are not enforced.

Implementation verdict:

Ready for implementation after founder accepts equality-on default.

## Shared Answer-Target Contract

Use named target variants.

`shortNumeric`:

- Use for Addition Facts, Subtraction Facts, Missing Addends, and simple fact-family blanks.
- Drawn underline target.
- Baseline aligned to surrounding equation text.
- Current renderer default is a 0.8pt line with a minimum safe width of 24px and a typical short target derived from `___`.
- Must fit default answers 0-20 and proofed custom-range values.
- Answer-key value is centered on the same target.

`comparisonSymbol`:

- Use for Compare Numbers.
- Drawn underline target or compact centered symbol target, not a full arithmetic blank.
- Width should be measured separately from `shortNumeric`; recommended starting range is 28-36px.
- Equal spacing before and after target.
- Answer-key symbol centered in the same position.
- Must remain visible on ordinary school printers.

`writtenResponse`:

- Use for task families that require words or explanations.
- Not part of this implementation batch.

Do not create resource-specific target geometry unless proof shows the shared variants are unsafe.

## Page-Capacity Recommendation

Founder defaults remain approved:

- Subtraction Facts: 60 student questions per page.
- Missing Addends: 60 student questions per page.
- Compare Numbers: 60 student questions per page.

These are physically plausible with the current 4-column, 15-row dense layout when completed example is off and values remain within 0-20.

Implementation must still measure:

- widest default values;
- custom values above 20;
- answer-key pages;
- completed-example-on layouts;
- comparison target spacing.

If any proof is unsafe, do not silently lower the founder default. Recommend the smallest measured adjustment, such as target width, spacing, or a second page when the example is on.

Completed-example behavior:

- example is Question 1;
- exact printed-question total remains;
- no separate `Example` label appears;
- no extra page is created solely because the example is enabled where layout capacity permits.

## Variable Contract

### Shared Variables

| Canonical | Label | Default | Safe range | Aliases | Runtime status | Public status | Layout risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `questionCount` | Number of questions | 60 | 1-180 | `questionCount` | implemented generally | recommended public after proof | medium |
| `questionsPerPage` | Questions per page | 60 | 1-60 for this batch | `questionsPerPage` | implemented generally | public-deferred | high |
| `includeExample` | Show one completed example | false | boolean | `completedExample`, `example` | implemented generally | recommended public after proof | medium |
| `includeAnswerKey` | Include answer key | true | boolean | `answers` | route-supported | recommended public after proof | low |
| `minimumValue` | Number range | 0 | 0-50 first proof target | `minA` | adapter needed for these resources | recommended public after proof | medium |
| `maximumValue` | Number range | 20 | 0-50 first proof target | `maxA`, `maxTotal` where appropriate | adapter needed for these resources | recommended public after proof | medium |
| `selectedValues` | Numbers to practise | [] | within active range | `selectedNumbers`, `onlyNumbers` | partial legacy support | recommended public after proof | medium |
| `worksheetSeed` | Worksheet seed | `yellowbird-default` | string | `worksheetSeed` | implemented generally | internal | none |

Precedence:

1. canonical submitted value;
2. resource-specific alias;
3. family-approved legacy alias;
4. catalog default;
5. family default;
6. registry fallback.

Override behavior:

- Grade 1 default range remains 0-20.
- Deliberate override above 20 is allowed after validation.
- The existing Grade 1 custom-range notice should remain teacher-facing metadata/instruction text, not a renderer-specific warning.
- Selected values outside the active range should be rejected or removed with a clear field error before generation.

### Subtraction-Specific Contract

Internal variables:

- minuend range;
- subtrahend range;
- difference constraints;
- non-negative-only default.

Public recommendation:

- Do not expose separate minuend/subtrahend ranges in the first UI.
- `minimumValue` and `maximumValue` define the safe pool for minuend, subtrahend, and answer values.
- All defaults produce non-negative whole-number differences.

Validation:

- no negative answers by default;
- no invalid subtraction sentence;
- selected values must be within active range;
- custom upper range proof required before public exposure.

### Missing-Addends-Specific Contract

Canonical candidate:

- `missingPosition`

Teacher-facing label:

- Where the missing number appears

Allowed values:

- `first_addend`
- `second_addend`
- `mixed`

Default recommendation:

- `mixed`, with deterministic balance.

Validation:

- exactly one missing addend;
- one unique whole-number answer;
- total and visible addend produce a non-negative missing value;
- missing answer stays within resolved range.

### Compare-Specific Contract

Canonical candidate:

- `includeEqualPairs`

Teacher-facing label:

- Include equal pairs

Allowed values:

- boolean

Default recommendation:

- true

Internal variables:

- symbol-balance counters;
- pair ordering;
- mirror-pair cooldown;
- retry limit.

Validation:

- symbol always correct;
- values stay within resolved range;
- equal pairs excluded when `includeEqualPairs` is false;
- no malformed pair;
- selected values are emphasis, not exclusive filtering.

## Selected-Number Semantics

Keep Addition Facts semantics: emphasis, not exclusive filtering.

Shared rules:

- selected values appear more often;
- other values remain for variety;
- generation remains deterministic;
- narrow selections trigger internal low-variety diagnostics;
- diagnostics do not appear on PDFs.

Subtraction Facts:

- selected values should appear more often as minuends, subtrahends, or answers;
- do not force every value in every fact to be selected;
- preserve non-negative answers.

Missing Addends:

- primary emphasis should be on missing answers;
- secondary emphasis may include visible addends and totals for variety;
- do not make selected values exclusive because that can make valid equation pools too narrow.

Compare Numbers:

- selected values should appear more often on either side;
- pair with varied comparison partners;
- avoid excessive selected-value self-pairs;
- preserve balanced `>`, `<`, and `=` outcomes.

## Mathematical Safety

Subtraction Facts:

- non-negative differences by default;
- no Grade 1 default negative answers;
- values stay within 0-20 unless deliberately overridden;
- custom overrides remain whole-number and print-safe;
- no invalid subtraction sentence.

Missing Addends:

- equations are valid;
- exactly one missing addend;
- missing value is a non-negative whole number;
- answer is unique;
- answer stays inside resolved range.

Compare Numbers:

- symbol is always correct;
- pair distribution is balanced;
- equality is controlled;
- values stay within resolved range;
- no malformed pair.

## Duplicate And Variety Policy

Subtraction signature:

- minuend;
- subtrahend;
- difference.

Missing Addend signature:

- first addend;
- second addend;
- total;
- missing position.

Compare signature:

- left value;
- right value;
- expected symbol.

Compare mirror policy:

- `4 < 9` and `9 > 4` are related variants.
- They may both appear in a large sheet but should not cluster or dominate.

Shared policy:

- prefer unique pool before repetition;
- use controlled deterministic repetition when pool is exhausted;
- avoid unbounded retries;
- record internal low-variety diagnostics;
- do not print diagnostics on PDFs.

## Completed Examples

All three resources use the dense Grade 1 completed-example contract:

- completed example is Question 1;
- no separate `Example` label appears;
- it counts within the requested total;
- Question 2 follows normally;
- same task-family layout;
- only completed answer is emphasized;
- participates in pagination;
- answer key treats Question 1 like the other numbered items.

Examples:

- Subtraction: `14 - 6 = 8`
- Missing Addend: `7 + 5 = 12`, with only the missing answer emphasized in the original target.
- Compare: `14 > 9`, with only `>` emphasized.

## Answer Keys

Requirements:

- numbering matches student worksheet;
- answer-only bolding;
- numeric answer placed in student target location;
- comparison symbol centered in the same target;
- completed Question 1 is numbered normally;
- multi-page grouping preserved where practical;
- no full-equation bolding;
- no metadata-like instruction text.

Structured metadata needed before implementation:

- Subtraction: `a`, `b`, `op`, and answer.
- Missing Addends: first addend, second addend, total, missing position, and answer.
- Compare Numbers: left value, right value, expected symbol.

## Proof Packet Plan And Implemented Proofs

Proof artifacts remain under excluded `review/`.

Subtraction Facts:

1. Default 60-question page.
2. Custom range.
3. Selected-number emphasis.
4. Completed example.
5. Answer key.
6. Multi-page exact count.
7. Maximum safe values.
8. Same-seed parity.

Missing Addends:

9. Default 60-question page.
10. First-addend missing.
11. Second-addend missing.
12. Mixed positions.
13. Selected-number emphasis.
14. Completed example.
15. Answer key.
16. Multi-page exact count.
17. Same-seed parity.

Compare Numbers:

18. Default four-column 60-question page.
19. Greater-than examples.
20. Less-than examples.
21. Equality examples.
22. Equality off.
23. Selected-number emphasis.
24. Custom range.
25. Completed example.
26. Answer key.
27. Multi-page exact count.
28. Same-seed parity.

Shared regression proofs:

- widest-value layout proof;
- low-variety stress proof;
- Addition Facts regression;
- standardized answer-target comparison proof;
- Fact Families answer-target compatibility spot check.

Proof metadata should include:

- resource ID;
- grade;
- seed;
- normalized options;
- requested student-question count;
- rendered item count;
- page count;
- page distribution;
- example status;
- answer-key status;
- duplicate count;
- selected-number coverage;
- public-ready status.

Implemented proof generator:

- `scripts/generateGrade1FluencyComparisonProofs.js`
- output directory: `review/grade-1-fluency-comparison/`
- 38 PDF cases covering Addition Facts side-by-side comparison, default worksheets, custom ranges, selected-value emphasis, completed Question 1, answer-key omission, multi-page exact counts, low-variety diagnostics, and same-seed parity across Addition Facts, Subtraction Facts, Missing Addends, and Compare Numbers
- generated summary: `review/grade-1-fluency-comparison/summary.json`

Implemented focused runtime test:

- `scripts/testGrade1FluencyComparisonRuntime.js`
- verifies exact printed-question counts, 60-per-page dense-grid defaults, completed examples as Question 1, structured answer metadata, selected-value emphasis, nonnegative subtraction, balanced mixed missing-addend positions, comparison symbol distribution, equality-off support, low-variety diagnostics, same-seed parity, and compatibility smoke checks for Addition Facts and Fact Families

## Open Decisions With Recommendations

1. Should Compare Numbers include equal pairs by default?
   - Recommendation: yes. The instruction should include `=`, and equality should be part of Grade 1 comparison practice. Add a later `includeEqualPairs` toggle.

2. Should Missing Addends use mixed missing positions by default?
   - Recommendation: yes, but deterministic and balanced. This is stronger practice than a fixed first-addend blank and avoids random clustering.

3. For selected numbers in Missing Addends, what should emphasis target?
   - Recommendation: emphasize missing answers first, then visible addends/totals second for variety.

4. Should Questions per page be runtime-supported now but public-deferred?
   - Recommendation: yes. Keep 60 as the proofed default and internal runtime value. Public exposure can wait until layout proof covers lower capacities and completed examples.

5. Should these resources receive public customization immediately after runtime proof?
   - Recommendation: no. Implement runtime and proof support first. Public UI should remain Addition Facts-only until the founder approves the proof packet for this batch.

No product blocker is severe enough to stop implementation planning. The decisions above should be founder-reviewed with the preflight packet.

## Implementation Boundaries

Implemented after founder approval:

- shared Grade 1 fluency option adapter;
- Subtraction Facts runtime support;
- Missing Addends runtime support;
- Comparison task-family runtime support;
- structured metadata for answer-key placement;
- proof generator and focused tests;
- documentation updates.

Still not allowed in this batch:

- public customization UI;
- route redesign;
- renderer rewrite;
- resource promotion;
- new worksheet family;
- Arrays work;
- Function Table work;
- changing ready resource counts.

## Final Implementation State

Runtime/proof implementation now uses:

- shared fluency foundation for Addition, Subtraction, and Missing Addends;
- separate comparison task family for Compare Numbers;
- shared variable normalization;
- named answer-target variants;
- runtime-only questions-per-page support;
- proof-first validation before public UI.

The implementation proves PDFs and exact-count behavior without exposing a new public customization surface. Founder PDF review should happen before any follow-on public UI decision.
