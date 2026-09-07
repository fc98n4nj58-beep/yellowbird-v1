# Classroom Customization Pilot

## Active priority

Variables Phase 1 — Classroom Customization Pilot begins with `g1_addition_facts_within_20`. Work is isolated on `feature/classroom-customization-pilot`; this checkpoint does not broaden the public prototype beyond that resource.

## Paused work

Grade 3–4 Estimate, Solve, and Check remains preserved, uncommitted, in the original workspace and awaits its separate founder-review gate. It was not imported into this pilot or approved by this checkpoint.

## Accepted correction

The resource-detail primary preview and download actions now follow the successfully applied normalized worksheet request. Stale, updating, invalid, and failed states disable those actions and detach the interactive stale viewer. Response ordering prevents obsolete results from restoring stale actions. The interface now accurately states that the completed Question 1 is included in this family's total.

This correction changes no generator, renderer, arithmetic, pagination, catalog, or resource-readiness behavior.

## Verification

Tested baseline: `feature/classroom-customization-pilot` at `8990f06280c44c17f7011cbcc47874d042743ca9`, with verified implementation hashes recorded in the evidence. The registry, Addition Facts runtime, and 22-case resource-detail UI suites passed. The tested pilot's catalog audit found 104/104 ready resources working; relevant public routes and non-customizable representative flows passed. Default, custom-24, and selected-75 PDFs retained matching content, answers, pagination, and geometry. Responsive interaction and layout measurements passed at 390 × 844 CSS pixels.

External evidence: `/Users/davidbirnie/YellowBird-Evidence/customization-download-consistency-20260907T131456Z/REPORT.md` and `/Users/davidbirnie/YellowBird-Evidence/responsive-viewport-20260907T135337Z/REPORT.md`. These counts and results apply to this tested pilot checkout and patch only.

## Exception and limitations

`testPublicCopyFamilyAlignment.js` retains its documented pre-existing Addition Facts signature failure; its isolation evidence remains unresolved and is not counted as a pass. Responsive pixel-level visual inspection, physical-phone/mobile-OS testing, and physical printing were not verified. This checkpoint makes no deployment or general customization-readiness claim.

## Remaining work

- Impossible selected-number emphasis and misleading practice claims.
- Generic empty-pool error feedback.
- Wider-range generated titles and notices.
- Conflicting manual answer-key endpoint parameters.
- Fixed density and a potential roomier layout, as a separate capability decision.

Selected-number feasibility is the recommended next bounded correction. It is not authorized or implemented by this checkpoint.

## Selection feasibility candidate — 2026-09-07

This subsequent implementation candidate starts from clean pilot HEAD `acf20f9b97398c5571c691e8393e7e847ebea1de`. It addresses the first two remaining issues above for `g1_addition_facts_within_20`. The Project Lead subsequently accepted this bounded selection-feasibility correction for one local commit, retaining the known public-copy failure and verification limitations. This acceptance does not claim general classroom or deployment readiness and does not approve the subsequent layout/font implementation, which awaits founder review.

The family-scoped check in `services/worksheetCustomizationService.js` runs after ordinary normalization and range validation. Both addends use the same normalized minimum/maximum, and the maximum also caps sums. A selected in-range value is feasible exactly when it plus the minimum does not exceed the maximum. A range has no valid facts when twice the minimum exceeds the maximum. Invalid selections receive a `selectedValues` field error listing every impossible in-range selection; empty domains receive an actionable `minimumValue` error. Existing out-of-range rejection remains intact. Preview and PDF use this shared path; PDF retains its existing first-message error envelope.

`routes/libraryRoutes.js` preserves draft selections, including selected checkboxes that fall outside a newly edited range, so teachers can remove them explicitly or correct the range. Help text explains emphasis without guaranteed individual appearances. The last applied summary says “Requested emphasis: …”; failed or stale drafts do not replace it. The accepted disabled-action, detached-viewer, request-ordering, and recovery behavior is preserved.

Verification: the new regression failed against the unchanged normalizer, then passed. The registry suite passes 21 cases, the Addition Facts runtime suite passes, and the resource-detail UI suite passes 25 cases, including direct preview/PDF rejection. Before/after structured question, answer, and layout signatures match for default 60, custom 24, and selected 75 with completed Q1. Six inline/download PDFs match prior text, answers, character geometry, typography, and pagination: student/key pages 60/60, 24/no key, and 38+37/38+37 respectively.

The catalog audit reports 326/333 generating entries, including 104/104 ready; seven planned `pattern_word_problems` generator gaps remain. Nine public smoke routes, 104 ready detail routes, and the existing non-customizable Worksheet, Quick Check, and Exit Ticket representatives pass. The public-copy suite still fails with the same documented actual `9341c709cc57918517a3f2068358ae891ab13969cecc172978765a7203074c02` versus expected `57ff31bb8e88f4f15b5a2c2f09e75d8f56bc45de8784115cab3122c474c0be38`; later assertions are not reached. That failure is not counted as a pass.

Permitted browser interaction and 201 element measurements across 12 states cover desktop 1280 × 720 and mobile 390 × 844 feedback, selection preservation, keyboard focus, inert disabled actions, corrected retry, and truthful summaries. No measured page overflow, text clipping, or control overlap was found. The temporary viewport was reset. No screen capture, physical-device, physical-print, or new pixel-level visual claim is made.

Evidence and complete command/failure logs: [selection-feasibility report](/Users/davidbirnie/YellowBird-Evidence/selection-feasibility-20260907T145256Z/REPORT.md). The candidate changes only this note, the shared normalizer, the bounded route UI, and the three existing focused test files. No generator, renderer, catalog identity/status, approved valid output, or public control was changed. Wider-range titles/notices, conflicting manual answer-key flags, fixed density/roomier-layout decisions, and the public-copy assertion remain separate issues. Subsequent Project Lead acceptance of this bounded patch is recorded above; the historical candidate report remains verification evidence.
