# Exit Ticket Four-Up Decision Proof

Date: 2026-08-11
Baseline: `f8de9b9`
Scope: feasibility only; no production renderer, catalog, lifecycle, or generator changes

## Question

Can the founder-requested Exit Tickets move from two identical tickets per letter page to four identical cut-apart tickets per letter page without compromising readable type, answer space, truthful output, or answer-key parity?

## Resources assessed

- `g4_compare_fractions_exit_ticket`
- `g3_compare_3_digit_numbers_exit_ticket`
- `g5_compare_numbers_to_100000_exit_ticket`
- `g5_equivalent_fractions_exit_ticket`
- `g2_missing_addends_within_20_exit_ticket`
- `g3_expanded_form_to_standard_form_exit_ticket`

## Proof result

Approved for a bounded implementation batch.

The proposed letter-page layout uses four identical tickets in a two-by-two grid, with an explicit horizontal and vertical cut line. Each ticket preserves three generated questions, a Name line, a concise existing catalog short title, a direct student instruction, item numbering, response space, and a public Grade/Math footer. Date is omitted from the four-up format to preserve usable student space.

Repeated prompt wording is removed from individual items where the ticket instruction already provides it. Examples: `Compare the numbers:` becomes the comparison alone, and `Match the equivalent fractions:` becomes the fraction equation alone.

## Evidence

- Six proof PDFs were generated with one student page containing four tickets and one answer-key page.
- All proof pages were rasterized and visually inspected.
- The Grade 5 five-digit comparison proof remained readable without clipping.
- Fraction comparisons and equivalent-fraction responses retained clear notation and answer targets.
- Thirty deterministic seeds per resource produced three items each, with 30 distinct generated orders per resource.
- The maximum observed prompt width was 88.205 pt within a 226 pt ticket prompt capacity; no overflow occurred.
- The proposed answer key uses the same generated questions and answers as all four tickets.

## Bounded implementation authority needed

If authorized, implementation should change only the dedicated Exit Ticket renderer and the six catalog-facing student-instruction/title contracts needed by this format. It must preserve generator truth, deterministic seeding, existing worksheet and Quick Check renderers, preview/PDF/download routing, answer-key parity, resource statuses, and all unrelated Exit Tickets.

The Grade 2 Missing Addends special compact branch should be consolidated into the shared four-up Exit Ticket layout only after focused regression confirms its zero-balance contract remains intact.

## Exclusions

- Quick Checks and their separate two-, three-, and four-up requirements.
- New teacher variables, A/B ticket versions, curriculum expansion, Grade 6 work, and lifecycle changes.
- Broader assessment architecture redesign or changes to normal worksheet PDFs.
