# Codex Operating Model

## Purpose

This document expands the root `AGENTS.md` into a practical operating model. It governs how Codex work is sized, separated, verified, and reported. Product truth remains in the applicable architecture, design, family, reconciliation, and release documents.

## Smallest complete task

A good task has one observable outcome and one verification boundary. It names:

- the resource, family, flow, or documentation surface;
- the permitted and protected paths;
- the contract that must remain unchanged;
- the authorized task type;
- the required checks and stop conditions;
- whether proofs, reconciliation, staging, commit, or push are allowed.

Choose the smallest task that can be completed and verified honestly. Do not make a task artificially tiny if that would leave the shared contract inconsistent, but stop when correctness would require an unapproved adjacent change.

Before work, perform the completed-work check in `AGENTS.md`. This avoids replacing an approved adapter, reopening a founder decision, duplicating shared logic, or treating a historical count as current.

## Model-selection risk classes

Use the least expensive model that safely fits the uncertainty and blast radius:

| Model | Default use |
| --- | --- |
| GPT-5.4 Mini | Deterministic, mechanical, low-risk edits with exact instructions and straightforward verification. |
| GPT-5.6 Luna | High-volume, tightly patterned, low-to-moderate-risk work with stable examples and clear acceptance tests. |
| GPT-5.6 Terra | Default for most bounded Yellow Bird engineering, debugging, testing, and documentation tasks. |
| GPT-5.6 Sol | Architecture and shared-system decisions, ambiguous defects, difficult regressions, deployment-critical work, privacy/security, or final milestone reconciliation. |

Availability may vary by environment. If the named model is unavailable, use the closest available model at the same or higher risk class, or report the limitation. Do not silently downgrade high-risk work merely to reduce elapsed time or usage.

## FAST MODE

FAST MODE is off by default. Do not use it just to make ordinary work finish sooner.

Consider it only when all are true:

- the work is urgent;
- scope and diagnosis are already clear;
- the task is tightly bounded and reversible;
- verification is explicit;
- the user values elapsed time over credit efficiency.

Never use FAST MODE to compensate for an unclear prompt, uncertain diagnosis, architecture ambiguity, privacy/security risk, or milestone reconciliation.

## Task types and gates

### Scan

Read-only inspection. Establish current state, completed work, active contracts, likely scope, and risks. A scan may recommend the next action but does not edit, generate proofs, reconcile, stage, or commit.

### Decision Proof

Produce bounded evidence needed for a founder, design, curriculum, or architecture choice. Use existing generation paths and approved seeds. Proof output remains review material; do not treat it as implementation approval or production truth.

### Implementation

Apply an authorized change after the governing contract is known. Preserve unrelated contracts, use the highest safe reusable layer, and verify locally while iterating. Implementation does not imply lifecycle movement, reconciliation, staging, commit, or push.

### Verification

Test or inspect the existing result without modifying it. If verification fails, report the failure and likely scope. Move into implementation only when the prompt explicitly authorizes a fix.

### Reconciliation

After the relevant implementation and review decisions are complete, record exact approved classifications or movements, validate totals and unique IDs, and keep lifecycle changes separate unless explicitly approved.

Scans and implementation should be separate when the architecture, actual defect, completed-work state, founder decision, or affected family is uncertain. They may be combined only for a narrow, reversible task whose prompt defines the implementation gate.

## Verification levels

### Local

Use for isolated documentation, copy, adapter, or generator changes:

- syntax or parser check for changed executable files;
- focused test or assertion;
- deterministic same-seed check where generation is involved;
- targeted content or reference validation;
- `git diff --check`;
- scoped diff and status inspection.

### Family or Flow

Use when a shared family, renderer branch, runtime adapter, or public flow is affected:

- all local checks;
- focused family suite;
- nearest approved lower-/upper-grade or resource-kind regressions;
- preview/PDF/download/answer-key parity as applicable;
- structured-truth, duplicate, range, page-count, and isolation checks;
- authorized default and stress proofs where visual judgment is required.

### Milestone

Use at a shared-system, release, promotion, or reconciliation boundary:

- all relevant family/flow checks;
- worksheet catalog audit;
- affected cross-grade and resource-kind suites;
- reconciliation totals and unique-ID checks;
- public-variable/customization registry checks when relevant;
- applicable route, smoke, start/build, environment, and deployment validation;
- protected-path, staged-diff, and artifact checks.

Milestone verification is impact-based. Record the exact command set for the affected release surface rather than assuming every historical script remains authoritative.

## Focused versus full verification

During implementation, run the narrowest checks that can fail for the current edit. Add broader checks after the local result stabilizes.

Require a milestone-level verification plan for changes to:

- shared PDF or catalog runtime;
- global header/footer behavior;
- common layout primitives;
- answer-key generation or presentation;
- customization/public-variable registration or alias rules;
- resource readiness/status logic;
- global metadata transformation;
- preview, download, or shared route behavior;
- production environment, start, or build scripts;
- shared generators, normalizers, or renderers with broad consumers;
- every resource or every resource of a type;
- milestone, deployment, promotion, or final reconciliation candidates.

A full verification boundary does not automatically authorize mass proof regeneration. Regenerate the full library only when the affected shared output requires it and the task explicitly permits it. For localized corrections, use focused proofs plus related regressions.

## Tests and proof artifacts

Tests should verify contract behavior: deterministic generation, accepted and rejected inputs, structured mathematical truth, counts, pagination, student/key parity, aliases, isolation, and public status. A PDF that opens is not sufficient evidence for a structured visual task.

Proofs answer visual or product questions: readability, density, geometry, hierarchy, response targets, answer-key speed, and print safety. Keep default, boundary, completed-example, and widest-value proofs proportional to the decision under review.

### Internal design proof

For a new activity, substantially new family, meaningfully different mathematical interaction, or task-architecture redesign, first apply `docs/worksheet-design-preflight.md`. An internal design proof is project-side evidence that the proposed resource is mathematically correct, age appropriate, teacher-useful, intentionally composed, coherent across student and key modes, and revised for likely founder objections. It may remain temporary or use a clearly named internal-only proof location. It is not founder-review evidence and must not be labelled `founder-review`.

### Founder review proof

A founder review proof is generated only after the internal design proof passes the authoritative preflight. Successful generation, valid mathematical answers, route success, or a technically clean PDF does not by itself satisfy this gate. Founder review remains the approval step; the internal gate predicts likely acceptance but never claims it.

Required sequence:

`family decision -> documented preflight -> implementation -> internal design proof -> internal acceptance -> founder review proof -> founder decision`

Do not modify approved proofs during verification-only or closeout work. Do not stage PDFs, images, review notes, or raw logs unless the task explicitly authorizes those exact artifacts.

## Parallel-work restrictions

One airplane flies. Use parallel work only for independent read-only investigation or disjoint verification with one clear integrator. Do not allow parallel agents or sessions to:

- edit overlapping files;
- make competing architecture or founder-contract decisions;
- generate into the same proof directory;
- reconcile or stage while implementation is still changing;
- assume another worker has protected uncommitted changes.

If ownership or workspace state is unclear, serialize the work.

## Concise, complete reporting

Lead with the outcome. Report:

- exact changed files;
- exact commands and whether they passed;
- proof paths when created;
- preserved contracts and excluded scope;
- unresolved risks or known failures;
- reconciliation/status movement, or confirmation of none;
- final staged and working-tree state;
- commit/push state.

Compress routine success logs into counts and outcomes. Preserve complete failure evidence: command, exit code, assertion or error, affected seed/resource/path, and the smallest reproducible context. Put very large raw logs in an explicitly reported file rather than flooding the conversation. Never suppress a failure to make a report shorter.

## Stop and escalation rules

Stop and report when:

- expected HEAD, source contract, or reviewed proof does not match;
- tracked changes from another task overlap the scope;
- a protected path would need modification;
- the requested result needs new architecture or a wider family change;
- required tests or audit totals fail unexpectedly;
- a lifecycle, public variable, reconciliation, or deployment change lacks explicit authority;
- the only apparent fix duplicates runtime or renderer logic;
- evidence is insufficient to preserve an approved contract safely.

Recommend the smallest follow-up task, but do not perform it without authorization.
