May 2026

Decision:
PDF primitives instead of SVG

Reason:
More consistent print output


May 2026

Decision:
Curriculum recipes use contextual keys

Reason:
Ontario expectation codes repeat across grades


May 2026

Decision:
Expectation → Skill → Activity architecture

Reason:
Long-term educational intelligence layer

May 2026

Decision:
Catalog preview and catalog PDF now use a shared runtime service.

Reason:
Reduce duplicated content construction and improve preview/PDF parity.


May 2026

Decision:
Fact fluency generators interpret "within 20" as answer total ≤ 20, not operand values ≤ 20.

Reason:
Educational correctness.


May 2026

Decision:
Question count now accepts URL/teacher inputs through runtime.

Reason:
Teacher control over worksheet density.

July 2026

Decision:
Exit Tickets / Quick Checks become the next Milestone 6 content lane after pausing worksheet promotion at 84 ready worksheets.

Reason:
84 strong worksheets is better than 85 with filler. Short formative resources can deepen the library without reopening broad worksheet promotion or destabilizing the stable worksheet catalog/runtime.

Rules:
- Treat Exit Tickets / Quick Checks as a new resource family, not just smaller worksheets.
- Preserve current worksheet PDFs.
- Start with one compact single-page Quick Check proof of concept.
- Use formative check / review / warm-up / small-group language.
- Do not call these assessments, tests, mastery checks, diagnostics, or summative resources.
## Decision: Worksheet Preview/PDF Parity

Worksheet previews should use the same PDF rendering path as downloads.

Standard flow:

User choices
→ shared runtime
→ seeded worksheet generation
→ PDF renderer
→ inline PDF preview or attachment download

Rules:
- Preview must not use a separate HTML worksheet imitation.
- Preview and downloaded PDF must share the same `worksheetSeed`.
- Random worksheet generation must accept an injected `random` function.
- Routes stay thin.
- Renderer only renders.
