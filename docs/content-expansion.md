# Content Expansion Control

## Purpose

This document is the control panel for Milestone 6 content expansion.

Milestone 6 should add more launch-facing worksheet depth without opening new product surfaces or destabilizing the existing catalog/runtime. The guiding phrase is:

More fuel in the same airplane.

## Current Status

* Milestone 6 — Content Expansion / Resource Depth is underway.
* Ready worksheets: 60 / 60 working
* Ready failures: 0
* Milestone 6 gain so far: +14 ready worksheets
* Target direction: grow toward roughly 100 ready worksheets in quality-controlled batches

Expected untracked files remain visible and documented:

* `engine/catalog/`
* `engine/visuals/index`
* `engine/visuals/renderVisual.js`
* `public/styles/images/`

## Batch History

### Batch 1

* Result: +6 ready worksheets
* Backup branch: `backup/milestone-6-batch-1`
* Docs branch: `backup/milestone-6-batch-1-docs`
* Accepted minor issues:
  * Word-problem sheets are printable but somewhat repetitive
  * Missing-factor sheets have minor duplicate-style practice

### Batch 2

* Result: +8 ready worksheets
* Backup branch: `backup/milestone-6-batch-2`
* Accepted minor issues:
  * Equivalent-fraction prompts may be repetitive
  * Grade 5/6 equal-groups sheets may read as review practice

## Quality Bar

A worksheet can be promoted only if:

* Catalog entry exists
* Current status is non-ready
* Generates successfully
* Renders a valid PDF
* Has real problems, not blank output
* Has an answer key that is present and readable
* Title/content semantics match grade, strand, and activity
* No obvious clipping or overlap appears
* Grade level is appropriate enough for public library use
* Any repetition is acceptable as practice, not confusing
* No known blocker pattern appears

## Known Blocker Patterns / Avoid List

Avoid these unless explicitly doing a focused fix:

* Kindergarten age/range mismatch
* `number_line_identify` title/content mismatch
* `equation_match` title/content mismatch
* Multiplication word-problem PDFs with 0 problems
* `compare_numbers` showing unrelated place-value tasks
* `shade_fraction_models` blank/unsupported output
* `fraction_number_line` blank/unsupported output
* `pattern_word_problems` missing generator
* Graph visuals / `bar_graph`
* Weak upper-grade skip-counting or array sheets
* Generated worksheets that are technically working but pedagogically too weak

## Preferred Next Candidate Pools

Prioritize:

* Grade 5 and Grade 6 depth
* Fractions that are printable and semantically aligned
* Multiplication/division practice that generates real problems
* Grade 3–4 content if stronger than upper-grade options
* Place value only if age-appropriate and semantically aligned

Avoid Kindergarten unless the content is clearly age-appropriate.

## Standard Batch Workflow

1. Candidate search
2. Read-only QA
3. Promote approved IDs only
4. JSON parse check
5. Run `npm run audit:worksheets`
6. Render PDFs for all promoted candidates
7. Spot check Browse/detail/preview/PDF for 2–3 promoted items
8. Commit
9. Push
10. Create backup branch
11. Update docs

## Next Recommended Task

Run Batch 3 candidate search using the known blocker list and preferred candidate pools.

Target 8–12 clean promotions if quality allows.
