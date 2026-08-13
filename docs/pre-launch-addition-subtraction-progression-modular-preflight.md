# Addition And Subtraction Estimate, Solve, And Check — Modular Family Preflight

Status: Founder-approved modular architecture decision; documentation only

Scope: `g3_addition_subtraction_estimate_solve_check` and `g4_addition_subtraction_estimate_solve_check`

Production boundary: This preflight does not modify or approve a redesign of the current production worksheets. It records the contract for a later bounded redesign. No public selector, composition engine, customization control, route, lifecycle movement, Grade 5 resource, or Grade 6 resource is authorized.

## Modular Architecture Decision

Modular architecture is warranted. Compute, estimate, apply, and reason/check elicit distinct mathematical thinking and natural response interactions. Each can support useful targeted practice after instruction. A fifth integrated module is necessary because teacher-selected mixed review has a different purpose from the short sample of modes in the full learning progression.

The approved family model is:

`compute -> estimate -> apply -> reason_check -> integrated_mixed`

The first four modules are learned/practised deliberately. The integrated module asks students to choose and connect those established ideas. Full progression must not randomly interleave the learning modules.

## Concept Module Contracts

| Module / activity identifier | Mathematical purpose | Grade-band role | Natural interaction | Standalone? | Answer-key behavior |
| --- | --- | --- | --- | --- | --- |
| `compute` | Accurately add and subtract using appropriate algorithms or strategies | Grade 3: whole numbers with regrouping and results to 1,000. Grade 4: whole numbers to 10,000 plus decimal tenths with visible place alignment | Vertically aligned numeric computation with a deliberate answer target | Yes | Mirror alignment; insert only the exact generator-owned answer in bold |
| `estimate` | Estimate sums/differences by an explicitly named rounding method and connect the estimate to reasonableness | Grade 3: nearest ten/hundred. Grade 4: whole-number and decimal-tenths estimates with the rounding place stated | Numeric estimate plus a concise structured check where required | Yes | Show the defensible estimate and any check result at the matching target |
| `apply` | Select addition or subtraction in a short mature context | Grade 3: short whole-number application to 1,000. Grade 4: short context within the approved grade boundary; later decimal context requires separate proof | One contextual problem with a compact equation/work area and clear answer target | Yes | Preserve the context and work geometry; show the exact answer clearly |
| `reason_check` | Explain, verify, compare, or identify/correct a plausible error | Grade 3: compare estimate and exact result. Grade 4: include whole-number and decimal reasonableness across the family | Selection, comparison, or correction plus approximately one bounded explanation line | Yes | Show the selected/corrected result and one concise mathematically valid sample explanation |
| `integrated_mixed` | Choose and use compute, estimate, apply, and reason/check together after those ideas have been taught | Grade-owned mix using only the approved earlier modules and number boundaries | Varied response targets retained from each source module | Yes; explicitly intended as mixed review | Preserve each task's native response target and generator-owned answer; do not collapse to prose-appended answers |

Representation/model metadata is module-owned. The full progression may begin with one concise unnumbered strategy connection; a standalone module includes only a model or cue that directly supports that module. No module inherits a decorative or irrelevant visual.

## Full Progression Recipe

The default full learning sequence remains eight numbered tasks plus one concise unnumbered strategy connection:

1. `compute`: four tasks establish accurate calculation and place alignment.
2. `estimate`: two tasks establish a defined estimation method and reasonableness sense.
3. `apply`: one task transfers the operation choice into context.
4. `reason_check`: one bounded task verifies or corrects thinking.

This current `4 + 2 + 1 + 1` sequence is a coherent compact progression, not sufficient standalone practice for every module. The future redesign should represent the full resource as a progression recipe composed from the four module contracts. `integrated_mixed` is a separate fifth recipe and is not an extra section appended to this already full page by default.

Section whitespace must be stronger than spacing between questions inside a section. Question content should normally sit beside its number. If a later proof shows that the progression needs more practice or response space, use a second page rather than shrinking type, decimal alignment, or explanation targets.

## Standalone Practice Defaults

| Module | Count in compact full sequence | Grade 3 standalone default | Grade 4 standalone default | Density/page intent |
| --- | ---: | ---: | ---: | --- |
| `compute` | 4 | 16: balanced addition/subtraction with regrouping | 12: balanced whole-number and decimal-tenths work | Dense but calm numeric practice; one page if safe, otherwise balanced pages |
| `estimate` | 2 | 12: balanced nearest-ten/hundred estimates | 12: whole-number and decimal estimates with stated rounding places | Group by estimation method; do not randomly mix before section mastery |
| `apply` | 1 | 6 short contextual problems | 6 short contextual problems | Larger work areas; two pages are acceptable and likely preferable |
| `reason_check` | 1 | 8 bounded checks | 8 bounded checks spanning whole-number and decimal reasoning | One structured line or selection-plus-line per task; no essays |
| `integrated_mixed` | Not a learning-sequence section | 12 mixed tasks | 12 mixed tasks | Standalone review recipe; preserve response-specific geometry and meaningful balance |

These are design defaults for later implementation proof, not public controls. A later task may adjust a count only with visual evidence that practice sufficiency, page balance, and student independence improve.

Every standalone worksheet must receive a self-contained title and instruction, restart numbering at 1, use intentional page density, include a complete answer key, and avoid references such as “Part 3” or “use your earlier answer” when those parts are absent.

## Integrated Mixed-Practice Contract

The standalone `integrated_mixed` recipe serves: **“I already taught this — give me more mixed practice.”**

Default composition is 12 tasks:

- four `compute`;
- three `estimate`;
- three `apply`;
- two `reason_check`, with their bounded explanation interaction retained.

Grade 3 uses approved whole-number boundaries and balances addition/subtraction. Grade 4 must include both whole-number and decimal-tenths thinking and must not become Grade 3 with larger numbers. The mix may vary deterministically within those quotas, but task modes cannot become unrelated random questions. Integrated items may require students to decide whether an exact computation, estimate, contextual operation, or reasonableness check is appropriate only after that thinking has been established in the source modules.

## Page And Answer-Key Architecture

- Full progression: retain visible ordered sections and the concise opening connection; one student page and mirrored key remain the current target, with multi-page permission if later practice increases.
- Standalone compute/estimate: use task-specific numeric geometry and section labels only where the module contains meaningful subtypes.
- Standalone apply: provide an intentional short work region for every context; do not force six contexts into generic dense rows.
- Standalone reason/check: use structured selections, corrections, and approximately one explanation line.
- Integrated mixed: use visible grouping or calm transitions without implying a new learning sequence; preserve each task's natural response target.
- In every mode, the key mirrors recognizable student geometry, preserves numbering, and bolds only inserted answers.

## Grade-Specific Differences

Grade 3 remains whole-number focused, with results no greater than 1,000, non-negative subtraction, regrouping, and estimation to an appropriate ten or hundred.

Grade 4 combines whole numbers within 10,000 with decimal tenths. Decimal digits remain visibly place aligned and use exact scaled-integer truth. Across a complete Grade 4 recipe, include both whole-number and decimal reasonableness. This family remains bounded addition/subtraction evidence and does not claim the multiplication/division portion of B2.3 or any Grade 4 B2.1 coverage.

## Composition Metadata Contract

Preserve, where relevant:

- `moduleId`: `compute`, `estimate`, `apply`, `reason_check`, or `integrated_mixed`;
- `taskAction`: exact computation, named rounding/check method, operation choice, comparison, verification, or correction;
- `responseType` and `responseTarget`;
- `representation`: whole number, decimal tenths, contextual, model/cue, or another approved representation;
- `progressionRole`: foundation, connection, transfer, verification, or integrated review;
- `isIntegrated` and source-module identity for mixed items;
- grade-owned number boundary, decimal precision, operation, estimation place, answer state, and duplicate signature.

Parity (`classify`, `select`, `rule`) and rounding (`nearest_ten`, `nearest_hundred`, `nearest_thousand`, `midpoint`, `boundary`) are useful structured-metadata precedents. They are not redesigned by this contract.

## Internal Design-Proof Gate For A Later Redesign

Before replacement production or founder-review artifacts:

- prove each standalone module looks complete rather than extracted;
- prove the `4 + 2 + 1 + 1` full sequence remains mathematically coherent;
- prove the 12-task integrated recipe is meaningfully balanced and not random;
- inspect default and longest/widest cases for every standalone mode in both grades;
- verify module-specific counts, response targets, page balance, decimal alignment, and mirrored key behavior;
- verify deterministic composition metadata and same-seed student/key parity;
- confirm no public selector or unsupported customization appears.

## Founder-Likely Objection And Response

Most likely objection: the four brief sections are treated as the only possible worksheet, leaving too little targeted practice and making later teacher choice require a redesign. The modular contracts, separate standalone quantities, integrated-review recipe, preserved response geometry, and multi-page permission address that risk without adding current product complexity.

## Later Implementation Boundary

The smallest safe implementation is a serialized redesign of only the Grade 3–4 `Estimate, Solve, and Check` family: preserve current mathematical truth, split generation into the five documented module/recipe contracts, add internal-only recipe selection for proof generation, and prove full-progression plus standalone modes before considering any public control. Do not combine that task with Grade 5, a generic composition engine, navigation, or public customization.
