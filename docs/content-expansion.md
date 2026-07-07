# Content Expansion Control

## Purpose

This document is the control panel for Milestone 6 content expansion.

Milestone 6 should add more launch-facing worksheet depth without opening new product surfaces or destabilizing the existing catalog/runtime. The guiding phrase is:

More fuel in the same airplane.

## Current Status

* Milestone 6 — Content Expansion / Resource Depth is underway.
* Ready worksheets: 79 / 79 working
* Ready failures: 0
* Milestone 6 gain so far: +33 ready worksheets
* Milestone 6 completion estimate: around 60%
* Patterning & Algebra ready coverage: 9 worksheets
* Target direction: grow toward roughly 100 ready resources in quality-controlled batches
* Recommended target before external testing: 85-90 ready worksheets, 10-15 exit tickets / quick checks, and 5-10 review or mini-quiz resources

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

### Batch 3

* Result: +4 ready worksheets
* Backup branch: `backup/milestone-6-batch-3`
* Ready launch-facing worksheets increased from 60 to 64
* Ready result: 64 / 64 working, 0 failures
* Promoted:
  * `grade3_fraction_equivalence_match_equivalent_fractions`
  * `grade3_place_value_representation_base_ten_blocks`
  * `grade3_place_value_representation_expanded_form`
  * `grade3_place_value_representation_standard_form`
* Not promoted:
  * `grade4_place_value_representation_expanded_form`
  * `grade4_place_value_representation_standard_form`
* Accepted minor issue:
  * Equivalent-fraction prompts may be repetitive
* Quality decision:
  * Did not promote the Grade 4 stretch candidates because quality bar matters more than batch size

### Batch 4

* Result: +6 ready worksheets
* Backup branch: `backup/milestone-6-batch-4`
* Ready launch-facing worksheets increased from 64 to 70
* Ready result: 70 / 70 working, 0 failures
* Patterning & Algebra ready count: 6
* Promoted:
  * `grade3_patterning_and_algebra_extend_pattern`
  * `grade3_patterning_and_algebra_identify_pattern_rule`
  * `grade3_patterning_and_algebra_missing_value_pattern`
  * `grade4_patterning_and_algebra_extend_pattern`
  * `grade4_patterning_and_algebra_identify_pattern_rule`
  * `grade4_patterning_and_algebra_missing_value_pattern`
* Not promoted:
  * `grade3_patterning_and_algebra_function_table`
  * `grade4_patterning_and_algebra_function_table`
  * Grade 5/6 patterning candidates
  * `pattern_word_problems`
  * `g6_pattern_rules`
  * `g6_input_output_tables`
  * Grade 4 place-value stretch candidates
* Accepted minor issue:
  * Duplicate-style pattern prompts may appear
* Quality decision:
  * Promoted Grade 3-4 patterning only because it filled a true domain gap
  * Did not promote Grade 5/6 or function-table patterning candidates because they were too weak or mismatched

### Batch 5

* Result: +2 ready worksheets
* Commit: `5e1b4f7 content: promote fifth milestone 6 worksheet batch`
* Ready launch-facing worksheets increased from 70 to 72
* Ready result: 72 / 72 working, 0 failures
* Promoted:
  * `grade3_multiplication_facts_word_problems`
  * `grade4_multiplication_facts_word_problems`
* Not promoted:
  * `grade5_multiplication_facts_word_problems`
  * `grade6_multiplication_facts_word_problems`
* Routing fix:
  * Multiplication word-problem routing is fixed by `f2168f1 fix: route preferred word problem activities`
  * Old issue: `multiplication_facts` `word_problems` candidates rendered PDFs with 0 problems
  * Root cause: `pickActivitiesFromRecipe` switched preferred activity `word_problems` into heuristic mode `word_problem_focus`, but `multiplication_facts.json` did not include that variant, causing an empty activity list
  * New status: Grade 3-4 equal-groups multiplication word-problem resources are ready; upper-grade versions remain deferred for review/intervention framing or richer complexity
* Verification:
  * JSON parse passed for both catalog files
  * `npm run audit:worksheets` passed
  * `/api/worksheet-catalog?status=ready` returned 72 items
  * Grade 3 and Grade 4 resource detail, preview, and PDF routes returned 200
  * Both PDFs rendered valid 3-page PDFs with 12 problems and 12 answers
  * Answer keys were readable
  * No clipping or overlap observed
* Accepted minor issue:
  * One duplicate prompt appeared but does not block public readiness
* Quality decision:
  * Grade 3 is ready as equal-groups multiplication word-problem practice
  * Grade 4 is ready as multiplication word-problem review/practice
  * Grade 5-6 remain deferred/generated because the equal-groups problems are too basic for public-facing upper-grade depth unless later reframed as review/intervention or upgraded with richer complexity

### Batch 6

* Result: +5 ready worksheets
* Commit: `5f1eb4c content: promote sixth milestone 6 worksheet batch`
* Ready launch-facing worksheets increased from 72 to 77
* Ready result: 77 / 77 working, 0 failures
* Promoted:
  * `grade2_patterning_and_algebra_missing_value_pattern`
  * `grade2_patterning_and_algebra_extend_pattern`
  * `grade2_patterning_and_algebra_identify_pattern_rule`
  * `grade2_addition_subtraction_facts_missing_addend`
  * `grade2_addition_subtraction_facts_related_subtraction`
* Not promoted:
  * `grade2_addition_subtraction_facts_fact_fluency`
* Verification:
  * JSON parse passed for both catalog files
  * `npm run audit:worksheets` passed
  * Ready worksheets were 77 / 77 working, 0 failures
  * Generated worksheets were 221 / 221 working
  * Partial worksheets were 5 / 5 working
  * Planned failures remained known/deferred `pattern_word_problems`
  * `/api/worksheet-catalog?status=ready` returned 77 items
  * All five promoted detail routes returned 200
  * All five promoted preview routes returned 200
  * All five promoted PDF routes returned 200 `application/pdf`
  * Each promoted PDF generated real content with 12 problems and 12 answers
  * Answer keys were readable
  * No clipping, overlap, empty sections, or unrelated catalog changes were observed
* Accepted minor issues:
  * Patterning sheets may contain minor duplicate-style prompts
* Quality decision:
  * Grade 2 Patterning & Algebra sheets are ready as practice/review resources with minor framing caution
  * Grade 2 Addition/Subtraction relationship sheets are ready as clean fact relationship practice
  * The Grade 2 fact fluency candidate remains backup-only because it may duplicate existing Grade 2 fluency-style resources and could feel like count-padding unless it fills a specific gap
* Framing:
  * Patterning resources should be described as pattern practice, not deep algebra or assessment
  * Addition/subtraction resources should be described as fact relationship practice, not full fluency mastery or assessment
  * All five should be framed as skill practice connected to curriculum, not full expectation coverage

### Batch 7

* Result: +2 ready worksheets
* Commit: `bb866a9 content: promote seventh milestone 6 worksheet batch`
* Ready launch-facing worksheets increased from 77 to 79
* Ready result: 79 / 79 working, 0 failures
* Promoted:
  * `grade3_place_value_representation_number_word_match`
  * `grade2_multiplication_facts_arrays`
* Not promoted:
  * `grade1_patterning_and_algebra_extend_pattern`
  * `grade1_patterning_and_algebra_identify_pattern_rule`
  * `grade1_patterning_and_algebra_missing_value_pattern`
  * `grade2_place_value_representation_number_word_match`
  * `grade1_addition_subtraction_facts_related_subtraction`
  * `grade1_addition_subtraction_facts_fact_fluency`
  * `grade2_addition_subtraction_facts_fact_fluency`
  * `grade2_multiplication_facts_equal_groups`
  * `grade2_multiplication_facts_skip_counting`
  * `grade4_place_value_representation_expanded_form`
* Verification:
  * JSON parse passed for both catalog files
  * `npm run audit:worksheets` passed
  * Ready worksheets were 79 / 79 working, 0 failures
  * Generated worksheets were 219 / 219 working
  * Partial worksheets were 5 / 5 working
  * Planned failures remained known/deferred `pattern_word_problems`
  * `/api/worksheet-catalog?status=ready` returned 79 items
  * Both promoted detail routes returned 200
  * Both promoted preview routes returned 200
  * Both promoted PDF routes returned 200 `application/pdf`
  * Grade 3 number-word match rendered a valid 2-page PDF with 12 problems and 12 answers
  * Grade 2 arrays rendered a valid 2-page PDF with 10 visual problems and 10 answers
  * Answer keys were readable
  * No clipping or overlap was observed
* Accepted minor issues:
  * Grade 3 number-word match has one duplicate number
  * Grade 3 number-word wording omits "and" but remains readable
  * Grade 2 arrays repeat prompt text, but visuals vary
* Quality decision:
  * Grade 3 number-word match is ready as number-word / standard-form matching review or independent practice
  * Grade 2 arrays is ready as early visual multiplication thinking using arrays as equal groups
  * Grade 1 patterning candidates remain deferred/revision-needed because Teacher QA found the number range and rule complexity may be too high for broad public-facing Grade 1 use
* Framing:
  * Avoid claims of assessment, mastery, full expectation coverage, deep problem-solving, or complete curriculum coverage
  * Grade 2 arrays should not be framed as multiplication fact fluency, word problems, or full multiplication mastery

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
* Grade 1 patterning candidates with number ranges or rule complexity that may be too high for broad public-facing Grade 1 use
* `number_line_identify` title/content mismatch
* `equation_match` title/content mismatch
* Upper-grade multiplication word-problem sheets that are too basic unless framed as review/intervention or upgraded with richer complexity
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

Run Batch 8 candidate search using the known blocker list and preferred candidate pools.

Preserve the strategic sequence: 79 ready worksheets -> 85 stronger worksheets -> add exit tickets and quick checks -> reach 100+ ready resources -> test with teachers -> then decide on Morning Math, differentiation packs, small-group lessons, or unit plans.

Target clean promotions if quality allows. Give special attention to quality because the easiest clean candidates are becoming thinner.
