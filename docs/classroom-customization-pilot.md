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

## Accepted even spacing and question text size — 2026-09-07

The accepted feasibility patch was checkpointed as `6ca11d7cc5b01f20fa612ed0e2c0577490e87bf5` (`fix: validate addition-fact emphasis feasibility`). The founder subsequently approved this bounded Addition Facts-only even-spacing and 12/14/16-point text-size implementation for one local checkpoint. This acceptance resolves the fixed-density capability decision for this resource only; historical status and verification above remain unchanged. It does not confer all-family or general release readiness.

The public “Question text size” selector supports Standard 12 pt, Larger 14 pt and Largest 16 pt, defaulting to 12 and rejecting unsupported values. One normalized presentation setting follows apply, preview and both download entry points. It changes printed question numbers, equations, completed Q1 and matching bold key answers; it does not change the mathematical seed, generator options, questions or answers. Other resources expose no new control.

The family layout helper measures Source Sans 3 regular prompts and bold answers, preserving at least 24 points of answer space, the 504-point content width and 24-point gutters. It prefers four columns and reduces columns when necessary. The 15-row Standard baseline scales to maximum 12 rows at 14 pt and 11 at 16 pt. For the same-12 proof, measured capacities are 60/48/33 at 12/14/16 pt (4/4/3 columns); widest supported three-digit-numbered facts measure 60/36/33 (4/3/3 columns). Capacity therefore depends on content width, not text size alone.

Each page's actual question rows divide the existing question area equally; sparse rows are vertically centred within those cells. One to three questions use occupied columns only, incomplete last rows retain empty cells, and numbering remains across rows by explicit founder instruction. Existing balanced pagination gives 75 questions at 16 pt as 25+25+25 and 180 as six pages of 30, with identical key groups. Completed Q1 remains inside the exact total. The approved 60-question/12-point PDF retains all baseline text, font sizes, character positions, vectors, page count and key geometry.

Verification: registry 22 cases, Addition Facts runtime, resource-detail UI 26 cases, layout 42 count/size boundaries plus three sibling isolation checks, and Grade 1 fluency/comparison runtime pass. Seven candidate PDFs (28 pages) passed actual font-size, equal-spacing, safe-bound, count/truth and student/key-position measurements. The default and subtraction, missing-addend and multiplication sibling PDFs match checkpoint text/geometry exactly. Separately, all 28 pages were visually inspected as rasterized PDF artifacts; no visible clipping or inconsistent page grouping was found. No physical printing is claimed.

The stable catalog audit reports 326/333 generating, including 104/104 ready; seven planned `pattern_word_problems` gaps remain. Nine public smoke routes, 104 ready detail pages, three unchanged non-customizable resource-kind representatives, and all six text-size/key combinations through inline/download endpoints pass. Actual browser interaction covers all sizes, unapplied changes, successful updates, infeasible-selection feedback/preservation/retry, key exclusion/inclusion, restored defaults and keyboard selection. The selector/help/summary fit at 884 × 752 and 390 × 844 with no measured horizontal overflow; the temporary viewport was reset. Browser error logs were empty. No screenshot, screen-recording, physical-device or unseen pixel-level website inspection is claimed.

`testPublicCopyFamilyAlignment.js` still fails at the unchanged Addition Facts non-copy assertion: current actual `2dc0659e0850557f9508a543d4d8a36812f613c3bd3cd9f1401a0e8bc0e0f560`, expected `57ff31bb8e88f4f15b5a2c2f09e75d8f56bc45de8784115cab3122c474c0be38`. The actual hash changed with the new presentation metadata; the pre-existing assertion was not revised and later assertions remain unexecuted. Initial verification-helper assumptions (the old no-select UI assertion and differing preview/PDF error envelopes) were corrected; their failure logs are retained. Wider-range titles/notices and conflicting manual answer-key flags remain outside scope.

Evidence, comparison PDFs, raster images, complete logs and review diff: [layout/font report](/Users/davidbirnie/YellowBird-Evidence/addition-layout-text-20260907T153607Z/REPORT.md). That report remains the historical verified candidate; the subsequent founder acceptance is recorded here. No generator, sampling, catalog identity/status, shared global typography, original-workspace or deployment change is included. The accepted implementation preserves the default/same-question-set guarantees and measured content-dependent capacities above, with the documented public-copy failure and other unresolved issues retained.

The next focus is a read-only handover of existing visual addition/subtraction resources and clearly labelled foundational number-representation alternatives. Their actual tasks, founder decisions, lifecycle, public availability and internal controls must be distinguished before recommending one family for a future customization batch. This focus authorizes no visual-family implementation, promotion or public-control expansion.
