# Worksheet Customization Technical Design

Status: Technical design plus Addition Facts public prototype

Product source: Worksheet Customization Product and UX Specification - Version 2

Implementation status: Addition Facts registry runtime and Resource Detail customization UI implemented for `g1_addition_facts_within_20`; Grade 1 Subtraction Facts, Missing Addends, and Compare Numbers runtime/proof support implemented without public UI

Foundation implementation status:

- Global registry, Addition Facts support declaration, normalization service, deterministic serialization, and option hashing have been implemented as a foundation.
- Addition Facts registry normalization is consumed by the active shared catalog runtime for `g1_addition_facts_within_20`.
- The active Addition Facts generator consumes the normalized range, selected-value emphasis, question count, example, seed, and answer-key package settings described below.
- The Resource Detail Page exposes the first public customization prototype for Addition Facts only.
- Grade 1 Subtraction Facts, Missing Addends, and Compare Numbers now have runtime/proof support for the shared variable contract, but no public customization controls are approved or wired.
- Renderer geometry is unchanged.
- PDF proof artifacts were generated under `review/addition-facts-customization-runtime/`; that review directory is intentionally not part of production source.

## Purpose

Yellow Bird customization should start from an approved, classroom-ready worksheet and allow a teacher to adjust a few meaningful, family-supported settings.

This document defines the technical contract for the customization registry, the first implemented family runtime, and the first public Resource Detail prototype. It does not approve broad route redesigns, renderer geometry changes, or customization across all catalog resources.

## Non-Goals

Do not build these in the registry foundation:

- a blank worksheet builder
- a separate public generator page
- universal advanced options
- direct page-count control
- manual columns, spacing, orientation, fonts, dot size, or visual themes
- per-question editing
- accounts, saved presets, dashboards, payments, or student data
- customization across all catalog resources

## Current Architecture Anchor

Customization must preserve the current shared catalog flow:

Catalog item and teacher settings
-> normalized catalog options
-> seeded worksheet generation
-> layout normalization
-> normalized content object
-> shared PDF renderer
-> inline preview or downloaded PDF

The shared catalog runtime remains the single place where customized preview and customized download should meet. Routes should stay thin, generators should generate, layouts should calculate space, and renderers should render.

## Design Preflight Gate

Before a new worksheet family, major worksheet-family redesign, or public customization candidate is implemented, complete `docs/worksheet-design-preflight.md`.

Required workflow:

Architecture scan
-> Founder Design Preflight
-> Variable contract
-> Implementation
-> Proof packet
-> Founder review
-> Commit

The preflight must define the worksheet layout, answer targets, page capacity, completed-example behavior, answer-key behavior, footer wording, teacher-facing variables, runtime-only controls, deferred controls, and proof-packet coverage before code is written.

Addition Facts remains the first complete public customization prototype. Numeric Patterning is the first family completed after applying more formal task-specific layout review. Patterning customization UI, Arrays customization, and Function Tables remain deferred unless a later founder-approved preflight reopens them.

Grade 1 Subtraction Facts, Missing Addends, and Compare Numbers have runtime/proof support only. Future UI code must not infer public readiness from their generator metadata, structured answer metadata, proof artifacts, or shared option adapter support.

## Proposed Future Modules

Implemented foundation modules:

- `config/worksheetCustomization/variables.js`
  - canonical variable definitions
  - public labels, help text, control type, public visibility
- `config/worksheetCustomization/families/*.js`
  - family support declarations
  - defaults, allowed ranges, validation rules, layout risk
- `services/worksheetCustomizationService.js`
  - normalize aliases to canonical settings
  - validate submitted settings
  - reject unsupported controls
  - serialize normalized options for preview and PDF
- existing `services/catalogWorksheetRuntimeService.js`
  - remains the runtime handoff for preview and PDF
  - now receives Addition Facts options through the registry-backed catalog service path
- Resource Detail Page client state
  - owns stale-preview state and applied-settings state

The registry should not contain generation algorithms, drawing instructions, page coordinates, randomization logic, or curriculum claims that belong in approved catalog metadata.

## Ownership Model

Global registry owns:

- canonical IDs
- generic labels
- control types
- generic serialization rules
- validation-result structure
- public classification

Family declarations own:

- supported controls
- family label overrides
- safe bounds
- alias maps
- family adapters
- layout risk
- public approval/proof status

Addition Facts controls use explicit public-prototype support metadata. Future UI must not infer public exposure for any other family from the existence of a registry variable, a support declaration, or runtime proof artifacts alone.

Resource declarations or catalog metadata own:

- ready-to-use defaults
- title
- grade
- suggested range
- curriculum/public wording
- resource-specific bounds
- resource-level control overrides

## Registry Responsibilities

Each canonical variable definition should contain:

- `id`
- teacher-facing label
- help text
- control type
- control group: `practice`, `studentSupport`, `additional`, or `answerKey`
- allowed values or numeric bounds
- approved default
- suggested curriculum/default range where relevant
- custom override policy
- supported resource kinds
- validation rules
- layout-risk level
- completed-example impact
- answer-key impact
- public visibility
- implementation status

Family support declarations should contain:

- supported canonical variables
- family-specific defaults
- family-specific bounds
- supported aliases during migration
- preview/PDF serialization mapping
- unsupported-option rejection policy
- proof status for preview, PDF, pagination, answer key, and completed examples

## Canonical Variables

| Canonical ID | Public label | Meaning | Initial exposure |
| --- | --- | --- | --- |
| `questionCount` | Number of questions | Student questions requested | Prototype 1 and 2 |
| `questionsPerPage` | Questions per page | Approved family density | Deferred until proof |
| `includeExample` | Show one completed example | Family-specific completed example; dense Grade 1 fluency/comparison uses solved Question 1, while Patterning uses an additional unnumbered example | Prototype 1 and 2 |
| `includeAnswerKey` | Include answer key | Includes answer-key output | Prototype 1 and 2 |
| `minimumValue` | Number range | Lowest generated value | Prototype 1 |
| `maximumValue` | Number range | Highest generated value | Prototype 1 |
| `selectedValues` | Numbers to practise | Specific numbers to emphasize | Prototype 1 |
| `factorValues` | Factors to practise | Factors selected for practice | Prototype 2 |
| `minimumFactor` | Factor range | Lowest factor | Prototype 2 |
| `maximumFactor` | Factor range | Highest factor | Prototype 2 |
| `maximumProduct` | Product limit | Safe product limit | Internal or deferred |
| `operationMode` | Practice direction | Family-supported operation choice | Deferred |
| `numberWordDirection` | Practice direction | Numeral-to-word or word-to-numeral | Future family |
| `responseMode` | How students answer | Family-specific answer structure | Deferred for Arrays |
| `sequenceStep` | Pattern rule | Pattern or counting step | Patterning |
| `sequenceLength` | Numbers in each sequence | Terms in a sequence | Patterning |
| `missingTermCount` | Number of missing values | Missing terms in a sequence | Patterning |
| `missingTermPlacement` | Where the missing number appears | Supported missing-term location | Patterning |
| `startingValue` | Starting number | Sequence starting value | Patterning |

Internal runtime values such as `worksheetSeed`, `random`, `usedProblemKeys`, `generatorState`, `worksheetId`, `worksheetTitle`, `activityType`, `preferredActivityType`, layout flags, and renderer flags must stay outside the public registry.

## Alias Compatibility

Aliases may remain temporarily for route/runtime compatibility, but public interfaces should submit canonical IDs.

Alias precedence:

1. explicitly supplied canonical value
2. resource-specific approved alias
3. family-approved legacy alias
4. catalog/resource default
5. family default
6. registry fallback

Rules:

- canonical wins over aliases
- conflicting scalar aliases do not merge
- alias conflicts create internal diagnostics
- public metadata exposes only canonical IDs
- deprecated aliases remain compatibility inputs, not parallel architecture

| Current option | Canonical target | Notes |
| --- | --- | --- |
| `minA` | `minimumValue` or `minimumFactor` | Family decides value vs factor meaning |
| `maxA` | `maximumValue` or `maximumFactor` | Family decides value vs factor meaning |
| `minB`, `maxB` | family-specific | Do not expose broadly without ordered-factor design |
| `selectedNumbers`, `onlyNumbers` | `selectedValues` | Preserve compatibility |
| `selectedFactors`, `onlyFactors` | `factorValues` | Preferred for Arrays |
| `selectedRows`, `onlyRows`, `selectedGroups`, `onlyGroups` | family-specific ordered factor | Hidden in first Arrays prototype |
| `selectedCols`, `onlyCols`, `selectedColumns`, `onlyColumns`, `selectedItemsPerGroup`, `onlyItemsPerGroup` | family-specific ordered factor | Hidden in first Arrays prototype |
| `includeExample`, `completedExample`, `example` | `includeExample` | Public uses `includeExample` |
| `answers` | `includeAnswerKey` | Route query compatibility only |
| `step` | `sequenceStep` | Patterning and skip-counting |
| `termCount`, `sequenceLength` | `sequenceLength` | Canonical keeps `sequenceLength` |
| `missingCount` | `missingTermCount` | Patterning |
| `missingPlacement` | `missingTermPlacement` | Public label avoids "placement" |
| `startNumber` | `startingValue` | Patterning |
| `numberWordMode`, `mode` | `numberWordDirection` | Avoid public `mode` |
| `operation`, `factFamilyOperation` | `operationMode` | Family-specific validation required |
| `responseMode`, `baseTenResponseMode` | `responseMode` | Family-specific meanings must not be collapsed silently |

Alias mapping must be resource-family-aware. The same legacy key can mean different things in different families.

## Normalization Pipeline

Future customization requests should use this pipeline:

1. Load the catalog item.
2. Resolve the item's customization family.
3. Load the family support declaration.
4. Start with approved family defaults.
5. Merge catalog defaults.
6. Merge submitted teacher settings.
7. Translate old aliases to canonical IDs.
8. Reject unsupported submitted controls.
9. Coerce values by variable type.
10. Validate cross-field rules.
11. Produce normalized canonical settings.
12. Map canonical settings to existing generator options.
13. Build the shared catalog worksheet runtime once.
14. Serialize the exact normalized settings with the preview/download response.

Normalization must not silently drop submitted teacher controls. Unsupported controls should return validation errors before generation.

## Validation Contract

Validation should return field-level errors plus a summary.

Implemented foundation shape:

```json
{
  "ok": true,
  "normalizedOptions": {
    "questionCount": 60,
    "minimumValue": 0,
    "maximumValue": 20
  },
  "errors": [],
  "warnings": [],
  "notices": [],
  "unsupportedOptions": [],
  "diagnostics": []
}
```

Definitions:

- `errors`: block generation
- `warnings`: non-blocking risk messages
- `notices`: informational public messages
- `unsupportedOptions`: submitted canonical or alias options not supported by the resolved resource declaration
- `diagnostics`: internal-only normalization and compatibility details

Do not expose raw diagnostics publicly.

Generation failures should use a separate error type and should not describe the issue as a teacher mistake.

## Unsupported Option Rejection

Submitted settings must be rejected when:

- the variable is not declared for the resource or family
- the variable is internal-only
- the value is outside approved bounds
- the combination creates unproven layout pressure
- the resource kind forbids the control

The response should preserve valid selections and keep the last valid preview downloadable only when the applied settings still match that preview.

## Preview Serialization

Preview and download must share the same normalized settings.

The preview response should include:

- catalog item ID
- resource kind
- customization family
- normalized canonical settings
- generator option mapping used by the runtime
- worksheet seed
- preview status
- calculated student page count when available
- calculated answer-key page count when available
- configuration summary
- warnings, such as custom range selected

The client should treat this response as the applied preview state. Download should be enabled only for this applied state.

Canonical serialization must:

- include only supported canonical options
- use stable key ordering
- normalize booleans
- normalize numeric values
- deduplicate numeric arrays
- sort arrays when order has no instructional meaning
- preserve order when the family declaration says order is meaningful
- omit undefined values
- include resource ID
- include effective seed
- include answer-key state
- exclude UI-only state

## Matching Download Serialization

The download request must include the same normalized settings that produced the preview, not a fresh uncontrolled form read.

Approved approaches:

- submit canonical settings plus the same `worksheetSeed`
- or submit a short-lived serialized customization payload

Do not rely on hidden stale form fields if the UI can change after the preview updates.

## Normalized Option Hash

The foundation service creates a stable hash from the fully resolved canonical payload.

Rules:

- equivalent configurations produce the same hash
- defaults are included in the hash even when omitted from the submitted input
- answer-key changes produce a different hash
- seed changes produce a different hash
- unsupported options do not enter the canonical payload

The hash is intended for future stale-preview comparison. No client UI is implemented in this pass.

## Stale Preview State

The Resource Detail Page should track two setting objects:

- `draftSettings`: current control values
- `appliedSettings`: values that produced the visible preview

State rules:

- If `draftSettings` equals `appliedSettings`, download may be enabled.
- If they differ, show "Preview not updated" and disable customized download.
- While updating, keep the previous preview visible and disable duplicate submissions.
- On validation error, preserve `draftSettings`, keep previous preview, and keep download disabled for the stale draft.
- On generation error, preserve `draftSettings`, label the old preview as previous, and provide retry.
- On reset, restore approved defaults into `draftSettings`; the preview is stale until updated unless the current applied preview already matches defaults.

## Curriculum and Override Metadata

Family declarations should distinguish:

- approved default range
- suggested public range
- technically safe custom range
- curriculum-honest note when custom settings exceed the suggestion

For Addition Facts Within 20:

- suggested range: 0-20
- custom values above 20 may be allowed if generation and print layout remain safe
- customized summary may say "Custom range selected"
- do not claim the customized result remains fully aligned to the original grade expectation

## Layout Risk Metadata

Each variable should declare layout risk:

- `none`: no layout impact, such as answer key inclusion
- `low`: predictable count or small text changes
- `medium`: affects pagination or density
- `high`: affects model size, response format, or visual layout
- `blocked`: not public until family proof passes

High-risk controls require family-specific PDF proof before public exposure.

## Completed Example Contract

`includeExample` is family-specific.

Default task-family behavior:

- one completed example appears before student questions
- it does not count toward `questionCount`
- it occupies layout space
- it participates in pagination
- it uses the same task structure as student questions
- preview and PDF match
- answer-key treatment is accurate and clearly distinguished

Dense Grade 1 fluency/comparison behavior:

- Addition Facts, Subtraction Facts, Missing Addends, and Compare Numbers use solved Question 1.
- The completed example counts within the requested total.
- No separate `Example` heading appears.
- Question 2 follows normally.
- Only the completed answer or comparison symbol is emphasized.

The registry should mark whether a family supports shared completed examples or requires special family approval.

## Answer Key Contract

`includeAnswerKey` means:

- answer key matches the final generated configuration
- numbering matches the student worksheet
- completed examples are clearly distinguished
- visual families retain enough visual context to mark work
- answer keys do not silently use default settings after customization

Default should be selected for worksheets, Quick Checks, and Exit Tickets.

## Prototype 1 Family Declaration: Addition Facts Within 20

Customization family ID: `additionFactsWithin20`

Resource scope:

- first resource: Addition Facts Within 20
- worksheet resources only for prototype approval

Main controls:

- `questionCount`
- `minimumValue` and `maximumValue`
- `selectedValues`
- `includeExample`
- `includeAnswerKey`

Additional controls:

- `questionsPerPage`, proofed at the fixed internal value of 60 and not approved as a public control

Initial defaults:

- `questionCount`: 60
- `minimumValue`: 0
- `maximumValue`: 20
- `selectedValues`: empty
- `includeExample`: false
- `includeAnswerKey`: true
- `questionsPerPage`: 60 internally, not public until approved
- control support status: public-prototype for the approved Addition Facts controls only

Compatibility mapping:

- `minimumValue` -> `minA` and `minB`
- `maximumValue` -> `maxA`, `maxB`, and `maxTotal`
- `selectedValues` -> `selectedNumbers` / `onlyNumbers`
- `includeExample` -> `includeExample`
- `includeAnswerKey` -> PDF option, not generator option

Adapter mapping:

- `minimumValue` maps to both operand minimums: `minA` and `minB`
- `maximumValue` maps to both operand maximums: `maxA` and `maxB`
- `maximumValue` also maps to `maxTotal` so the default "within 20" contract remains a total cap
- `selectedValues` maps to selected-number aliases and is consumed as emphasis, not exclusivity

Active runtime path:

- Catalog ID: `g1_addition_facts_within_20`
- activity type: `math.addition.basic`
- skill recipe: `addition_subtraction_facts`
- builder: `engine/worksheetBuilder/buildWorksheet.js`
- active problem generator: `engine/problemGenerators/factFluency.js`
- runtime handoff: `services/catalogWorksheetRuntimeService.js`
- catalog options boundary: `services/worksheetCatalogService.js`
- layout and answer-key output: shared catalog layout plus `renderers/pdfRenderer.js`

The older arithmetic engine is not involved in the active Addition Facts catalog path.

Runtime generation contract:

- Default options remain ready-to-use: operands 0-20, sums capped at 20, 60 student questions, fixed 60-question density, no completed example, answer key requested, and deterministic seeded output.
- Custom ranges use the public `minimumValue` and `maximumValue` as both operand bounds, with `maximumValue` also applied as `maxTotal`.
- The generator builds a finite valid fact pool first. If no facts exist for the range, generation fails clearly instead of retrying indefinitely.
- Repetition is avoided while unused valid facts remain, except selected-value emphasis may intentionally repeat preferred facts to reach its target.
- `selectedValues` means numbers to emphasize. The generator targets about two thirds of student questions from facts where either operand matches a selected value, then fills from the full valid pool.
- `selectedValues` outside the normalized range are rejected during registry validation.
- `questionCount` is the exact number of printed questions for dense Grade 1 fluency customization. A completed example, when included, is Question 1 and is counted within the requested total.
- `questionsPerPage` is consumed only at the fixed internal proof value of 60.
- `includeAnswerKey` affects the PDF package and canonical option hash but is not sent as a problem-generation option.
- Preview and PDF use the same normalized canonical payload and seeded runtime path.
- Custom range notices remain validation metadata and catalog instruction text; they are not embedded as a separate student-facing registry payload.

Public Resource Detail prototype:

- Route: `/resource/worksheet/g1_addition_facts_within_20`
- Template: server-rendered worksheet detail page in `routes/libraryRoutes.js`
- Preview source: embedded `/api/catalog-pdf/g1_addition_facts_within_20?disposition=inline`
- Preview update source: `/api/catalog-preview/g1_addition_facts_within_20`
- Download source: `/api/catalog-pdf/g1_addition_facts_within_20`
- Client enhancement: inline Resource Detail script scoped to the Addition Facts customization model

Exposed controls:

- `questionCount`
- `minimumValue` and `maximumValue`
- `selectedValues`
- `includeExample`
- `includeAnswerKey`

Control layout and range behavior:

- On desktop and wide tablet layouts, practice controls use compact rows with right-aligned labels and one consistent control column.
- On narrow layouts, labels stack above full-width controls.
- Suggested range mode keeps the visible lowest/highest fields disabled and effective at 0-20.
- Custom range mode enables the lowest/highest fields and restores the teacher's most recent valid custom values.
- `selectedValues` uses a compact checkbox selector that is closed by default and summarizes selected numbers.

Hidden controls:

- `questionsPerPage` remains hidden from public use. It is consumed only at the proofed internal value of 60 until a later public-control decision.
- `worksheetSeed` remains internal. No public shuffle or seed control exists.

Preview truth-state contract:

- Ready-to-use worksheet: default preview visible, default download enabled, no stale notice.
- Settings changed: previous preview remains visible, stale notice appears, download is disabled.
- Updating: previous preview remains visible, update button and download are disabled.
- Customized preview: preview and download are enabled only after the server returns normalized successful settings and an option hash.
- Validation error: field messages and a summary are shown; previous preview remains visible; download remains disabled while settings differ from the last successful preview.
- Generation error: previous preview remains visible; settings are preserved; retry is available.

Download parity rule:

- The enabled download URL is built only from the last successful normalized settings.
- The browser never downloads unsaved form state.
- `includeAnswerKey` is also serialized as the existing `answers` PDF parameter so preview and download use the same answer-key package.
- Stale form state disables the download link and shows explanatory text.

Validation and security boundary:

- The browser uses registry metadata to render controls, but all submitted values are normalized and validated on the server.
- Unsupported controls are rejected by the server and do not enter the canonical payload.
- Public API errors return field, code, and message only; diagnostics and stack traces are not returned.
- Numeric values, arrays, range choices, and selected values are bounded by the family/resource declaration.

Accessibility requirements implemented:

- Visible labels, fieldsets, and legends
- Keyboard-operable disclosure, inputs, select, checkboxes, and buttons
- Field-level errors associated with controls
- Error summary with alert semantics
- Live-region announcements for preview states
- Download action outside the embedded PDF
- Mobile single-column layout with touch-friendly controls

Unsupported-family behavior:

- Families without explicit public-prototype support metadata render the existing Resource Detail page with no customization panel.
- Quick Checks, Exit Tickets, Arrays, Patterning, and other worksheet families remain deferred.

Proof generated before public approval:

- short question totals
- default 60 questions
- one-, two-, and multi-page output
- uneven final pages
- selected values including zero
- custom range above 20
- completed example on and off
- answer key on and off
- preview/download parity
- deterministic same-seed parity
- duplicate and selected-value coverage scans
- answer checks

Still deferred:

- additional public `questionsPerPage` choices
- Arrays customization
- Patterning customization
- deeper cross-browser/mobile device QA

## Prototype 2 Family Declaration: Arrays

Customization family ID: `arrays`

Resource scope:

- Arrays worksheet family after Addition Facts passes

Main controls:

- `questionCount`
- `minimumFactor` and `maximumFactor`
- `factorValues`
- `includeExample`
- `includeAnswerKey`

Possible student support:

- row and column labels, deferred until pedagogy, renderer support, and proof pass

Additional controls:

- `questionsPerPage`, deferred
- `responseMode`, deferred

Initial defaults:

- use approved family defaults from the current Arrays implementation
- `includeExample`: likely true, pending founder approval
- `includeAnswerKey`: true

Compatibility mapping:

- `minimumFactor` -> `minFactorA` and `minFactorB`, unless ordered factors are later approved
- `maximumFactor` -> `maxFactorA` and `maxFactorB`, unless ordered factors are later approved
- `factorValues` -> `selectedFactors` / `onlyFactors`
- `includeExample` -> `includeExample`
- `includeAnswerKey` -> PDF option, not generator option

Keep internal:

- dot size
- model spacing
- models per page
- layout bands
- manual columns
- orientation
- response-space size
- visual density

Proof required before public approval:

- smallest arrays
- widest arrays
- tallest arrays
- mixed array sizes
- completed example on and off
- minimum and maximum question totals
- multi-page output
- uneven final pages
- answer-key mirroring
- actual-size black-and-white print check

## Patterning Alignment

Patterning may be implemented before the public customization UI, but its internal options should align to the canonical contract:

- `operationMode`
- `startingValue`
- `sequenceStep`
- `questionCount`
- `sequenceLength`
- `missingTermCount`
- `missingTermPlacement`
- `includeExample`
- `includeAnswerKey`

Patterning should not create a new public option scheme with local names that conflict with the registry direction.

Numeric Patterning runtime groundwork:

- Shared helper: `engine/problemGenerators/numericPatternRules.js`
- Approved core activities: `extend_pattern`, `missing_value_pattern`, and `identify_pattern_rule`
- Internal-only compatibility: arithmetic `function_table`
- Supported rule family: arithmetic sequences only, using add/subtract steps
- Supported internal options: `operationMode`, `startingValue`, `minStart`, `maxStart`, `sequenceStep`, `minStep`, `maxStep`, `sequenceLength`, `missingTermCount`, `missingTermPlacement`, `questionCount`, `includeExample`, and `worksheetSeed`
- Duplicate policy: the helper builds a deterministic finite candidate pool and avoids duplicate signatures until the pool is exhausted; if a request exceeds the unique pool, it repeats candidates in a controlled deterministic cycle
- Low-variety policy: narrow teacher selections may reduce variety; the runtime records an internal `low_variety_candidate_pool` diagnostic and does not expose that diagnostic on the worksheet PDF
- Range policy: defaults avoid negative values; addition candidates must stay at or below the configured maximum, and subtraction candidates must stay at or above the configured minimum
- Layout policy: Patterning worksheets use task-specific print layouts, not the generic equation prompt layout
- Pagination policy: Patterning PDFs use a reusable balanced paginator that distributes items within the task capacity and avoids one- or two-question final pages when safe
- Extend Pattern layout: two columns where safe, 12-16 student questions per page for one continuation term, 10-12 for multi-continuation variants, large equal-width continuation answer targets, and support for one, two, or three continuation terms
- Missing Value layout: two columns where safe, clearer inline answer targets, 12 questions per page for one missing value, and 10-12 questions per page for two missing values
- Identify Pattern Rule layout: one column only, 6-8 questions per page, or 8 questions plus one completed example where safe, and a labelled `Rule:` response line under each sequence
- Sequence typography: Patterning sequence text uses a task-aware 12-13.5 point size inside existing Yellow Bird typography bounds
- Continuation punctuation: continuation targets render as structured sequence tokens, for example `6, 7, 8, 9, ______, ______`, with the comma attached after the preceding term or target
- Missing Value target token: missing values use a medium-grey underline target (`#8f98a8`, 0.95pt) rather than raw underscores
- Header policy: no marketing or metadata subtitle; the title is followed by the divider and a student-facing instruction
- Footer policy: Patterning PDFs use the public strand label, for example `Grade 3 • Math • Patterning & Algebra`, and must not expose the internal `patterning_and_algebra` slug
- Completed-example policy: examples are additional to the requested student-question count, are labelled `Example`, are not numbered, use a small 6px label-to-sequence spacing step, and the first student question begins at 1
- Answer-key policy: sequences and labels remain regular weight; only answers are bold
- PDF status: proof artifacts are generated under `review/numeric-patterning-family/` for founder re-review
- Public exposure status: no public Patterning customization UI is approved or wired
- Registry status: no public Patterning family declaration is registered yet, so future UI code must not infer readiness from the internal generator option support
- Runtime-supported future labels: Number of questions, Pattern type, Steps to practise, Starting-number range, Numbers in each sequence, Numbers to write, Missing numbers in each pattern, Where the missing numbers appear, Show one completed example, and Include answer key remain runtime-supported only and await a later UI decision
- Deferred: Function Table public layout, visual/geometric patterns, shape patterns, alternating rules, multiplication/division patterns, negative-number defaults, and `pattern_word_problems` remain outside this first public-ready numeric family
- Catalog status: no Patterning resource promotion is included with this runtime groundwork

## Grade 1 Fluency + Comparison Runtime Support

Runtime support is implemented for:

- `g1_subtraction_facts_within_20`
- `g1_missing_addends_within_20`
- `g1_compare_numbers_to_20`

Related public customization status:

- Addition Facts remains the only public Resource Detail customization prototype.
- Subtraction Facts, Missing Addends, and Compare Numbers are runtime-supported and proof-supported only.
- No public controls, route redesign, or Resource Detail UI wiring are approved for this batch.
- Future UI code must not infer public readiness because a resource has structured metadata, generator support, or proof artifacts.

Shared runtime contract:

- canonical `questionCount`
- internal `questionsPerPage`, with 60 as the proofed dense-grid default
- `includeExample`, where this dense family uses solved Question 1 within the requested question count
- `includeAnswerKey`
- `minimumValue` and `maximumValue`
- `selectedValues`, mapped from `selectedNumbers` and `onlyNumbers` aliases when needed
- `worksheetSeed` for deterministic preview/PDF parity

Subtraction Facts behavior:

- uses a deterministic finite candidate pool
- preserves exact student-question counts
- keeps nonnegative subtraction only
- supports selected-number emphasis across minuend, subtrahend, and difference
- emits structured metadata: `minuend`, `subtrahend`, `difference`, `operation`, `answer`, `responseValues`, and duplicate signatures

Missing Addends behavior:

- uses a deterministic finite candidate pool
- preserves exact student-question counts
- defaults to balanced mixed missing positions
- supports explicit first-addend or second-addend missing modes
- supports selected-number emphasis across the missing value, visible addends, and total
- emits structured metadata: `firstAddend`, `secondAddend`, `total`, `missingPosition`, `missingValue`, `answer`, `responseValues`, and duplicate signatures

Compare Numbers behavior:

- uses a deterministic finite candidate pool
- preserves exact student-question counts
- balances `<`, `>`, and `=` where equality pairs are enabled
- supports an internal `includeEqualPairs` option, defaulting to true
- supports selected-number emphasis across the left and right values
- avoids duplicate exact pairs before repetition and records mirror-pair metadata for related variants
- emits structured metadata: `leftValue`, `rightValue`, `expectedSymbol`, `comparisonResult`, `answer`, `responseValues`, duplicate signatures, and related duplicate signatures

Answer-target variants:

- Subtraction Facts and Missing Addends use the `shortNumeric` answer-target variant.
- Compare Numbers uses the `comparisonSymbol` answer-target variant.
- Written-response answer targets remain reserved for later approved families.

Completed examples and answer keys:

- completed examples are solved Question 1 for this dense Grade 1 fluency/comparison batch
- the example counts within the requested total
- no separate `Example` heading appears
- Question 2 follows normally
- answer keys consume structured metadata where available rather than reconstructing answers from prompt text
- answer-only bolding remains the standard; for Compare Numbers only the completed symbol is emphasized

Proof status:

- focused runtime tests: `scripts/testGrade1FluencyComparisonRuntime.js`
- proof generator: `scripts/generateGrade1FluencyComparisonProofs.js`
- proof artifacts: `review/grade-1-fluency-comparison/`
- proof packet currently contains 38 generated PDFs and a JSON summary, including Addition Facts side-by-side comparison cases
- same-seed parity is checked by the proof generator
- Founder PDF review is required before any public customization expansion

## Resource-Kind Boundaries

Worksheets may support the fullest customization after family proof.

Quick Checks should expose only narrow controls:

- answer key
- small question-count range where approved
- one narrow content/range option where approved
- possibly one support option

Exit Tickets should expose the fewest controls:

- answer key
- narrow content choice if approved
- possibly one response-support option

Customization must not turn Quick Checks or Exit Tickets into full worksheets.

## Migration Boundaries

The registry, Addition Facts runtime, and Resource Detail prototype built only:

- canonical variable definitions
- family/resource support declarations
- alias normalization
- validation
- serialization
- narrow catalog-runtime consumption for Addition Facts
- Addition Facts finite-pool generation
- focused runtime/proof tests
- Addition Facts-only Resource Detail customization UI
- stale-preview/download protection for the Addition Facts prototype

It should not:

- add public controls to every resource
- redesign Browse
- create a standalone generator page
- change renderer geometry
- broaden Quick Check or Exit Ticket behavior
- expose deferred layout controls
- promote resources

## Open Approval Questions

- Which `questionsPerPage` choices are approved for Addition Facts after public approval: keep fixed at 60, fixed set, or bounded numeric input?
- Should Arrays expose one shared factor range only, or eventually ordered first/second factor controls?
- Should Arrays default `includeExample` to on for the public prototype?
- What is the first approved title change rule for task-direction changes?
- Should preview/download serialization use canonical settings in query params or a short-lived payload ID?

## Public Prototype Deliverable

This document records the Addition Facts runtime, proof pass, and first public Resource Detail prototype. The next step is founder review of:

- Resource Detail UI behavior in the browser
- stale-preview and applied-settings behavior
- mobile and keyboard flow
- whether to commit the prototype as the public baseline
