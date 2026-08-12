# Project Yellow Bird Operating Agreement

## Purpose and source of truth

Yellow Bird is an Ontario-first, print-first curriculum resource system. Protect teacher usefulness, mathematical truth, print quality, honest public claims, and deployment readiness.

`/docs` is the project source of truth. Before acting, use the most specific current document for the affected grade, family, workflow, or release boundary. When documents disagree, prefer an explicit current task decision, then the newest specific reconciliation or family contract, then durable design and architecture documents. Treat old counts, hashes, milestone notes, and historical status entries as evidence, not current requirements.

See [Codex Operating Model](docs/workflow/codex-operating-model.md) for task sizing, model selection, verification boundaries, and reporting rules.

## Required completed-work check

Before editing:

1. State the exact resource, family, flow, files, and task type in scope.
2. Inspect `git status`, relevant recent history, and the current diff without cleaning or changing unrelated work.
3. Locate the current reconciliation, founder-review decision, family contract, approved variables, tests, and proof conventions.
4. Inspect the active implementation and nearest approved shared family before proposing new logic.
5. Determine what is already complete, stale, duplicated, deferred, or intentionally unsupported.
6. Stop and report if the safe fix requires unapproved scope expansion.

Preserve valid completed work and user changes. Do not rediscover or rebuild an approved system merely because a local task can be solved another way.

## Architecture protections

- One airplane flying.
- Generate once; transform many times.
- Prefer the shared runtime over duplicate construction paths.
- Keep routes thin.
- Renderers render only; they do not choose curriculum, generate problems, or reconstruct mathematical truth.
- Generators and structured models own task truth; preview, PDF, download, and answer key consume the same normalized truth.
- Put reusable design decisions in tokens, layout specifications, or the highest safe shared family layer.
- Preserve seeded determinism, student/key parity, pagination contracts, and approved teacher-variable aliases.
- Do not create duplicate runtime, generator, normalizer, route, or renderer logic.

## Scope and change control

Make the smallest complete, safe, reversible change. Name the allowed paths and protected paths before implementation. Preserve approved titles, instructions, defaults, variables, geometry, statuses, and reconciliation unless the task explicitly authorizes changing them.

Do not mix unrelated cleanup, promotion, redesign, metadata changes, or feature expansion into a bounded task. Founder recommendations take priority when a conflict is documented. If a requested correction exposes a broader defect, fix only the authorized surface or stop with evidence and a scoped follow-up recommendation.

## Keep task types separate

- **Scan:** read-only inventory, diagnosis, or completed-work reconciliation. No implementation.
- **Decision Proof:** create only the approved proof or comparison evidence. No production change or reconciliation movement.
- **Implementation:** make the authorized change and run focused verification. Do not promote, reconcile, or commit unless explicitly requested.
- **Verification:** inspect and run checks without changing the subject under test.
- **Reconciliation:** record approved disposition and exact movements after implementation and review; do not use it to introduce new behavior.

Do not silently turn one task type into another. A prompt may combine types only when it explicitly defines the sequence and gates.

## Verification levels

- **Local:** syntax, lint where available, focused assertions, deterministic checks, and `git diff --check` for the changed unit.
- **Family or Flow:** local checks plus affected-family regressions, nearest shared-family isolation, preview/PDF/key parity, page counts, and bounded proofs where authorized.
- **Milestone:** family/flow checks plus catalog audit, affected cross-grade/shared-system coverage, reconciliation integrity, and applicable route, smoke, build, or deployment checks.

Use focused verification during implementation. Use milestone verification at release boundaries and after shared changes that can affect many resources. Never hide or downgrade a failure to shorten output.

## Full-verification triggers

Plan milestone-level verification after changes to:

- shared catalog or PDF runtime;
- global worksheet headers, footers, layout primitives, or answer-key systems;
- customization registry, public variables, alias normalization, readiness/status logic, or global metadata transforms;
- preview, download, shared-route, build/start, production environment, or deployment infrastructure;
- a shared generator, normalizer, or renderer surface used across a grade, resource kind, or the library;
- milestone/release candidates or final reconciliation.

Full verification means the documented checks appropriate to the affected surfaces, not automatic regeneration of every proof artifact. Do not rerun the full review library after a localized correction unless the shared impact or explicit task requires it.

## Tests, proofs, and output

- For every new worksheet activity/family, materially different mathematical interaction, or task-architecture redesign, complete `docs/worksheet-design-preflight.md` before implementation and pass its internal design-proof gate before creating founder-review artifacts.
- Run syntax checks for changed executable files.
- Prefer focused tests first; add related regressions in proportion to shared impact.
- Preserve deterministic seeds and validate actual structured truth, not only successful PDF creation.
- Proofs support founder/design decisions; they do not replace tests.
- Generate or copy only requested proofs. Keep review PDFs, images, and large logs under their approved excluded locations.
- Do not stage proof artifacts unless explicitly authorized.
- Summarize routine successes. Retain complete failure evidence, including command, exit status, assertion, and relevant path.
- Store large raw output in a file when needed instead of flooding the conversation, and report that file's path.

## Git and documentation hygiene

- Preserve unrelated tracked and untracked work; never clean it by default.
- Inspect unstaged and staged diffs before committing.
- Stage exact paths only. Do not use `git add .` or `git add -A` in controlled closeouts.
- Do not commit, amend, push, promote, demote, or reconcile unless explicitly authorized.
- Keep `/docs` aligned with approved behavior, but do not rewrite historical records to make them appear current.
- Do not put volatile counts, dates, hashes, or temporary task state in this file.

Every handoff reports changed files, commands and results, unresolved risks, Git status, and any action intentionally not taken.

## Prohibited default expansions

Without explicit authorization, do not add or expand accounts, payments, memberships, subscriptions, analytics, AI features, lesson slides, later-phase product lanes, public customization, new visual systems, new resource families, broad catalog promotion, or deployment infrastructure. Prefer cleanup and deployment readiness over speculative features, and quality over raw resource count.

## Documentation map

- Durable principles: `docs/engineering-principles.md`
- Architecture and shared-flow direction: `docs/architecture.md`
- Founder worksheet design and proof gate: `docs/worksheet-design-preflight.md`
- Teacher variables and customization contracts: `docs/worksheet-customization-technical-design.md`
- Product decisions and deferrals: `docs/decisions.md`
- Current milestone/status evidence: `docs/sprint.md` and the newest relevant entries in `docs/YellowBird_Status.md`
- Deployment readiness: `docs/launch-checklist.md`
- Grade reconciliation: `docs/grade-1-founder-review-reconciliation.md`, `docs/grade-2-architecture-reconciliation-preflight.md`, `docs/grade-3-architecture-reconciliation.md`, `docs/grade-4-architecture-reconciliation-preflight.md`, and `docs/grade-5-architecture-reconciliation-preflight.md`
- Grade/family implementation detail: the applicable `docs/grade-*` preflight or founder-review batch plan
