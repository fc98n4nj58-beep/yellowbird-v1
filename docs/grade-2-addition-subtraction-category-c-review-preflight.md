# Grade 2 Addition and Subtraction Category C — Founder-Approved Closeout

## Controlled scope

The correction covers exactly these four authoritative records:

1. `grade2_addition_subtraction_facts_fact_family`
2. `grade2_addition_subtraction_facts_missing_addend`
3. `grade2_addition_subtraction_word_problems_missing_addend_word_problem`
4. `grade2_addition_subtraction_word_problems_subtraction_word_problem`

All remain Grade 2 worksheets with catalog status `ready`. The founder approved the corrected packet, so this checkpoint moves the four records from reconciliation Category C to Category A without promotion or a catalog-status change. No resource was added or removed. Category D, E, and G resources; Grade 1; Grade 3+; curriculum maps; routes; public teacher controls; and unrelated interfaces were not changed.

## Architecture and truth

The shared path remains authoritative catalog → catalog worksheet service → `buildCatalogWorksheetRuntime` → activity recipe and problem generator → normalized content/layout → shared preview or PDF renderer. Preview and PDF use the same runtime. Generators own mathematical truth; the renderer owns geometry and styling; answer keys use the same generated item truth as student pages.

Resource-specific behavior is gated by exact catalog IDs or explicit catalog display/generator options. No public teacher control or route-specific mathematical logic was added.

## Corrected resource contracts

### Fact Families

- Public title: `Fact Families`
- Student direction: `Complete each fact family.`
- Exactly 12 groups, three columns by four rows
- Addends 0–10, totals no greater than 20
- Equal addends suppressed so all four related equations remain visibly distinct
- Four internally consistent equations per group, with matching key truth

### Missing Addends Within 20

- Public title: `Missing Addends Within 20`
- Student direction: `Write the missing number in each equation.`
- Exactly 12 items, two columns by six rows
- Addends and totals constrained to 0–20
- Exactly one zero-related item in a default deterministic batch
- Enlarged inline equation type and response targets; matching key geometry

### Missing Addend Word Problems

- Public title: `Missing Addend Word Problems`
- Student direction: `Solve each problem. Show your thinking in the box.`
- Exactly 12 unknown-part problems with totals through 100
- Three student problems per page with bordered work boxes
- Six compact answer rows per key page, with no empty work boxes
- Title and `Answer Key` subheading remain separate and collision-free

### Take Away Word Problems

- Public title: `Take Away Word Problems`
- Uses the shared student word-problem direction
- Exactly 12 positive-result take-away problems with starting amounts through 100
- Natural take-away phrasing; no sharing-language mismatch
- Same three-per-student-page and compact six-per-key-page contract

## Public metadata and completed examples

All four PDFs use the exact public footer `Grade 2 • Math • Addition and Subtraction`. Internal IDs, registry keys, and snake_case values are hidden. Completed Question 1 is not an established contract for these records and remains disabled even if the generic query option is supplied.

## Verification evidence

The checked-in focused regression `scripts/testGrade2AdditionSubtractionCategoryC.js` covers:

- exact catalog identity, status, titles, directions, counts, and public footer;
- deterministic generation across 30 seeds per resource;
- fact-family distinctness and equation truth;
- missing-addend range, zero balance, layout, and response geometry;
- word-problem truth, context variety, take-away language, and key layout;
- no completed example, blank item, or generic fallback;
- student/answer-key parity and shared preview/PDF runtime source;
- exact Grade 1 and Grade 3 isolation; and
- unchanged catalog totals.

The corrected packet contains exactly four PDFs and 16 pages: 2 Fact Families pages, 2 Missing Addends pages, 6 Missing Addend Word Problems pages, and 6 Take Away Word Problems pages. All 16 pages were rendered and visually inspected. Page counts, forbidden public text, clipping risk, and geometry were also checked mechanically.

## Reconciliation and founder closeout

Founder approval is recorded by this controlled checkpoint. The authoritative Grade 2 reconciliation moves from A14, B0, C4, D11, E9, F0, G14 to A18, B0, C0, D11, E9, F0, G14; Total52 is unchanged. All four catalog statuses remain `ready`, no completed-Question-1 contract was added, and no promotion occurs.
