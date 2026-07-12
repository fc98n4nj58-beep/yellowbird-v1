# Worksheet Customization Technical Design

Status: Technical design only

Product source: Worksheet Customization Product and UX Specification - Version 2

Implementation status: Not implemented

Foundation implementation status:

- Global registry, Addition Facts support declaration, normalization service, deterministic serialization, and option hashing have been implemented as a foundation.
- No public UI has been built.
- Existing preview/PDF routes are not wired to the new service yet.
- Renderer geometry is unchanged.

## Purpose

Yellow Bird customization should start from an approved, classroom-ready worksheet and allow a teacher to adjust a few meaningful, family-supported settings.

This document defines the technical contract for the future customization registry and runtime flow. It does not implement the registry, public UI, route changes, generators, or renderer changes.

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

In the registry foundation, Addition Facts controls use foundation-only support metadata. Future UI must not infer public exposure from the existence of a registry variable or support declaration alone. Public exposure requires an explicit later UI approval/proof step.

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
| `includeExample` | Show one completed example | Adds one completed example before student questions | Prototype 1 and 2 |
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

`includeExample` means:

- one completed example appears before student questions
- it does not count toward `questionCount`
- it occupies layout space
- it participates in pagination
- it uses the same task structure as student questions
- preview and PDF match
- answer-key treatment is accurate and clearly distinguished

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

- `questionsPerPage`, deferred until proof PDFs pass

Initial defaults:

- `questionCount`: 60
- `minimumValue`: 0
- `maximumValue`: 20
- `selectedValues`: empty
- `includeExample`: false
- `includeAnswerKey`: true
- `questionsPerPage`: 60 internally, not public until approved
- control support status: foundation-only until the Addition Facts public prototype is approved

Compatibility mapping:

- `minimumValue` -> `minA`
- `maximumValue` -> `maxA`, `maxB`, and `maxTotal`
- `selectedValues` -> `selectedNumbers` / `onlyNumbers`
- `includeExample` -> `includeExample`
- `includeAnswerKey` -> PDF option, not generator option

Adapter mapping:

- `minimumValue` maps to both operand minimums: `minA` and `minB`
- `maximumValue` maps to both operand maximums: `maxA` and `maxB`
- `maximumValue` also maps to `maxTotal` so the default "within 20" contract remains a total cap
- `selectedValues` maps to existing selected-number aliases as emphasis groundwork

Runtime gap:

- The active catalog fact-fluency generator does not yet consume `minA`, `maxA`, `minB`, `maxB`, `maxTotal`, or selected-number emphasis.
- This pass implements declaration, validation, serialization, and adapter groundwork only.
- A later Addition Facts runtime pass must connect the adapter output to generation without broad generator rewrites.

Proof required before public approval:

- short question totals
- default 60 questions
- one-, two-, and three-page output
- uneven final pages
- selected values including zero
- custom range above 20
- completed example on and off
- answer key on and off
- preview/download parity
- stale-preview behavior
- mobile and keyboard flow

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

Step 3 registry foundation should build only:

- canonical variable definitions
- family/resource support declarations
- alias normalization
- validation
- serialization

It should not:

- add public controls to every resource
- redesign Browse
- create a standalone generator page
- change renderer geometry
- broaden Quick Check or Exit Ticket behavior
- expose deferred layout controls
- promote resources

## Open Approval Questions

- What exact maximum `questionCount` is approved for Addition Facts before proof?
- Which `questionsPerPage` choices are approved for Addition Facts after proof: fixed set or bounded numeric input?
- Should Addition Facts map `maximumValue` to `maxA`, `maxTotal`, or both?
- Should Arrays expose one shared factor range only, or eventually ordered first/second factor controls?
- Should Arrays default `includeExample` to on for the public prototype?
- What is the first approved title change rule for task-direction changes?
- Should preview/download serialization use canonical settings in query params or a short-lived payload ID?

## Step 1 Deliverable

This document completes the technical design pass requested before implementation. The next step is Project Lead approval of:

- central registry responsibilities
- family-specific boundaries
- alias compatibility
- validation error contract
- preview and download serialization
- migration scope for the registry foundation
