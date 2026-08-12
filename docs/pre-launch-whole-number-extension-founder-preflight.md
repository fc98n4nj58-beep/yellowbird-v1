# Pre-Launch Whole-Number Extension Founder Preflight

Status: Decision proof only; production redesign is not authorized by this document

Scope: `g2_even_and_odd_numbers`, `g3_round_whole_numbers`, and `g4_round_whole_numbers`

## Decision

The current PDFs are mathematically valid internal diagnostics, but they do not pass the Founder-Likely Acceptance gate. They must not be treated as founder-review-ready. The redesign should preserve the localized parity generator and shared rounding truth while replacing the generic, randomly interleaved prose presentation with intentional family architectures.

## Nearest Approved Families

### Existing founder-established rules

- Use the standard title/divider/instruction hierarchy with no subtitle by default.
- State an instruction once at page level where possible.
- Number student questions.
- Use task-specific geometry instead of generic rows when the interaction warrants it.
- Keep student and answer-key truth synchronized.
- On keys, only inserted answers are bold; surrounding prompt text remains regular.
- Keep footers public-facing and preserve calm print readability.

### Recommended design inference

- Parity is nearest to primary relational-thinking practice, but its classify, select, and rule/application responses require explicit sections rather than a randomized mixed grid.
- Rounding is nearest to structured place-value practice. It can inherit two-column page rhythm and short numeric targets, but not repeated full-sentence equation-practice rows.
- Neither family should inherit a visual model mechanically. Each model or cue must teach the specific interaction.

## Teacher Use

Parity is a Grade 2 guided-to-independent practice page used after students have met equal pairing. It should reinforce why numbers are even or odd, not merely test vocabulary.

Rounding is Grade 3-4 focused place-value practice used after explicit instruction. It should help students identify the target place, inspect the digit to its right, and round efficiently. The purpose of all three resources must be evident within five seconds from title, cue, section labels, and task geometry.

## Grade 2 Even and Odd Numbers

### Mathematical progression

Use three visibly separated sections in this order:

1. **Make equal pairs** - one compact completed model showing an even set split into two equal groups and an odd set with one left over.
2. **Even or odd?** - six numbered classification items.
3. **Choose and explain** - four selection items followed by two bounded rule/application items.

Classification comes before application. Do not randomly interleave modes. The page should move from concrete meaning to classification to transfer.

### Instructions and responses

Page instruction: `Use equal pairs to decide whether numbers are even or odd. Complete each section.`

- Classification response: two small labelled choices, `Even` and `Odd`; students circle one. Do not require unnecessary word copying.
- Selection response: circle the requested number in a clearly separated pair.
- Rule/application response: one short word or number in a structured blank. Avoid open-ended prose.

Section-specific action labels may supplement the page instruction: `Circle Even or Odd.`, `Circle the number.`, and `Complete the rule.`

### Page architecture

Use one student page and one mirrored key page. Place the completed model beneath the instruction, then use a two-column six-row practice region with aligned section boundaries. Retain 12 scored questions in addition to the unnumbered model. Use the lower page intentionally through consistent row height and section spacing; do not stretch lines or add decorative boxes merely to fill space.

The model should be compact, grayscale-safe, and directly show pairs/equal groups. It must not become a new decorative visual system. Grade 2 text and selection targets must support independent pencil use.

### Answer key

Reuse section geometry. Bold only `Even`, `Odd`, the circled/selected numeral, or the inserted rule answer. Do not append `= answer` to complete prose. Preserve the model as a reference, not an additional answered question.

### Founder-likely objection and response

Most likely objection: a mixed generic sheet with three unrelated-looking response modes and half an empty page. The sectioned progression, compact model, response-specific targets, and deliberate full-page rhythm address this before proof generation.

## Shared Rounding Family: Grades 3-4

### Mathematical progression

Use one reusable structured rounding family with grade-specific target places and bounds. Each page begins with a short unnumbered worked cue:

`Look at the digit to the right. 5 or more: round up. 4 or less: keep the digit.`

Show one compact worked midpoint example with the target digit and deciding digit visually distinguished. This is a strategy cue, not a number-line lesson.

Group questions by target place rather than randomizing all places:

- Grade 3: `Nearest ten` then `Nearest hundred`, six questions each.
- Grade 4: `Nearest ten`, `Nearest hundred`, then `Nearest thousand`, four questions each.

Within each section, progress from non-boundary cases to at least one exact midpoint and then a case that rounds across a larger place-value boundary. Midpoints belong in normal student practice, not only QA proofs.

### Compact question format and response

Page instruction: `Round each number to the place named in each section.`

Do not repeat `Round ... to the nearest ...` twelve times. Each section names the place once. Use numbered rows with a source numeral, a directional cue or equals sign, and a fixed-width numeric response target, for example:

`3) 347  ->  ______`

Use a proper drawn answer target rather than raw underscores in production. The response is numeric only. Commas remain attached and Grade 4 widths must accommodate `10,000` without wrapping.

### Page architecture

Use one student page and one mirrored key page. Keep two columns where sections remain unmistakable. A compact strategy band sits below the instruction; section headers and consistent row spacing create the page rhythm. Twelve questions should occupy the working region without crowding or leaving a large unexplained lower area.

Grade 3 uses larger type and more vertical breathing room. Grade 4 may be slightly denser but must not look childish; the strategy cue should be concise and the section styling quiet. No default number line is recommended: it would consume space, change the interaction into representation work, and is unnecessary after the short place-value cue. A future number-line rounding family would require its own preflight.

### Answer key

Mirror the student sections and place each bold numeric answer directly in its response target. Keep source numerals, arrows/equality cues, labels, and punctuation regular. The structured target must prevent prose-appended answers and Grade 4 wrapping.

### Founder-likely objection and response

Most likely objection: generic prose rows that repeat the instruction, underuse the page, and create awkward long key lines. Section-owned target places, compact numeral-to-answer rows, a short strategy cue, integrated midpoints, and mirrored answer positions address those risks.

## Age and Density Check

| Family | Reading/writing load | Abstraction and support | Default density |
| --- | --- | --- | --- |
| Grade 2 parity | Short labels; circle/one-word responses | Concrete equal-pair model before symbolic classification | 12 questions plus one compact model; two columns |
| Grade 3 rounding | One page instruction; numeric responses | Brief place-value strategy cue and midpoint example | 6 nearest-ten + 6 nearest-hundred |
| Grade 4 rounding | Same concise language; wider numeric targets | Same cue, larger values, three target places | 4 ten + 4 hundred + 4 thousand |

## Internal Acceptance Checklist

Before any replacement proof enters a `founder-review` folder, confirm:

- parity sections remain ordered and response modes are visually obvious;
- rounding place sections and integrated midpoint/boundary cases are present;
- all answers come from the existing generator-owned truth;
- student and key geometry match, with answer-only bolding;
- Grade 4 answers do not wrap;
- the completed model/cue is unnumbered and additional to 12 questions;
- one student and one key page use the full page intentionally;
- no subtitle, internal slug, teacher-facing wording, or generic prose-appended key answer appears;
- the likely founder objections recorded above are no longer visible.

Only after this internal gate passes may new artifacts be named and placed as founder-review proofs. Founder approval remains a separate decision.

## Implementation Boundary for a Later Task

The smallest implementation is one serialized family batch: preserve existing parity and shared rounding mathematical truth; add task-specific structured response metadata and page architectures; implement the internal proof first; and generate replacement founder-review proofs only after the internal gate passes. Do not add public customization, Grade 6, catalog lifecycle changes, or unrelated renderer redesign.
