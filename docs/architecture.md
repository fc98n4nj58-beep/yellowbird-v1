# Project Yellow Bird Architecture

## North Star

Project Yellow Bird is a curriculum intelligence engine that outputs print-first teaching resources.

It is not just a worksheet website.

Long-term goal:

Curriculum
↓
Skill
↓
Activity
↓
Resource

The first major output is worksheets, but the same system should eventually support:

- worksheets
- lesson plans
- slides
- exit tickets
- assessments
- manipulatives
- unit packs

---

## Core Product Direction

Initial focus:

Ontario
↓
K–6
↓
Math
↓
Print-first worksheets

Design values:

- fast discovery
- curriculum aligned
- calm/minimal UI
- print friendly
- teacher-speed
- structured enough for future AI features

---

## Long-Term Curriculum Flow

This is the preferred future architecture:

Expectation or Catalog Item
↓
Skill
↓
Activity Recipe
↓
Problem Generator
↓
Worksheet Builder
↓
Layout Normalizer
↓
Content Normalizer
↓
PDF Renderer / Preview Renderer

In code, this currently involves:

- services/worksheetCatalogService.js
- engine/worksheetBuilder/buildWorksheet.js
- engine/skills/
- engine/activityRecipes/
- engine/problemGenerators/
- engine/layout/normalizeWorksheetLayout.js
- engine/worksheetBuilder/normalizeWorksheetContent.js
- renderers/pdfRenderer.js

---

## Legacy Worksheet Flow

This flow still exists and supports simple arithmetic worksheets.

Query Params
↓
contentFactory
↓
worksheetRuntimeService
↓
normalizeWorksheetContent
↓
pdfRenderer

In code, this currently involves:

- services/worksheetRuntimeService.js
- engine/contentFactory.js
- routes/worksheetPreviewRoutes.js
- routes/worksheetPdfRoutes.js
- engine/worksheetBuilder/normalizeWorksheetContent.js
- renderers/pdfRenderer.js

Status:

Still useful.

Do not delete immediately.

Possible future:

contentFactory may eventually become a generator or compatibility layer inside the long-term curriculum flow.

---

## Catalog Worksheet Flow

Current catalog flow:

Catalog Item
↓
skillKey
↓
getSkillDefinition()
↓
buildWorksheet()
↓
getRecipeForSkill()
↓
getGenerator()
↓
worksheet.problems
↓
normalizeWorksheetLayout()

In code:

- data/worksheetCatalog.master.json
- services/worksheetCatalogService.js
- engine/worksheetBuilder/buildWorksheet.js
- engine/skills/
- engine/activityRecipes/
- engine/problemGenerators/
- engine/layout/normalizeWorksheetLayout.js

Status:

This is already connected to the long-term architecture.

Concern:

Catalog PDF and catalog preview do not yet fully share one generated runtime object.

---

## Current PDF Flow

PDF route:

/api/catalog-pdf/:id

Current flow:

worksheetCatalogService.generateWorksheetLayoutFromCatalogId()
↓
manual contentObject construction inside route
↓
normalizeWorksheetContent()
↓
renderWorksheetPDF()

Concern:

The PDF route is doing too much manual construction.

Long-term goal:

Move catalog worksheet object construction into a shared service.

---

## Current Preview Flow

Preview route:

/api/catalog-preview/:id

Current flow:

worksheetCatalogService.generateWorksheetLayoutFromCatalogId()
↓
return layout JSON only

Concern:

Preview returns layout only.

PDF creates a separate contentObject from the layout.

This means preview and PDF are not guaranteed identical.

Long-term goal:

Preview and PDF should use the same generated worksheet runtime object.

---

## Shared Stable Pieces

### normalizeWorksheetContent.js

Role:

Normalizes worksheet items and visual data before rendering.

Current visual normalization:

- arrays → array
- tenframe → ten_frame
- base_ten → base_ten_blocks

Standard visual shapes:

number_line:
- min
- max
- value

ten_frame:
- filled
- frames

array:
- rows
- cols

base_ten_blocks:
- hundreds
- tens
- ones

This file is important because it allows different generators to feed the renderer safely.

---

### pdfRenderer.js

Role:

Final PDF rendering engine.

Responsibilities:

- page setup
- header
- footer
- columns
- visual measurement
- visual placement
- primitive drawing
- answer key
- PDF response

Supported visual types:

- arrays
- ten frames
- number lines
- base ten blocks

Should not handle:

- skill decisions
- curriculum lookup
- activity selection
- problem generation
- catalog logic

Possible legacy code to audit:

- renderVisualBlock()
- generateTenFrameSvg import
- renderVisual import

---

## Current Architecture Problem

The project currently has two worksheet creation systems:

1. Legacy worksheet flow:
   query params → contentFactory → worksheetRuntimeService

2. Long-term curriculum flow:
   expectation/catalog → skill → recipe → generator → buildWorksheet

The normalizer and PDF renderer are shared.

The worksheet creation layer is not fully unified yet.

---

## Immediate Architecture Goal

Create one reliable catalog worksheet runtime.

Proposed future service:

services/catalogWorksheetRuntimeService.js

It should return:

- catalog item
- worksheet
- layout
- contentObject
- normalizedContentObject
- preview data
- PDF options

Then both routes should use it:

/api/catalog-preview/:id
↓
buildCatalogWorksheetRuntime()

/api/catalog-pdf/:id
↓
buildCatalogWorksheetRuntime()

This will reduce duplication and improve preview/PDF parity.

---

## Current Sprint Priority

One airplane flies.

Immediate objective:

Stabilize one complete path:

Catalog Item
↓
Skill
↓
Recipe
↓
Generator
↓
Layout
↓
Preview
↓
PDF

Success criteria:

- one catalog worksheet previews correctly
- same worksheet downloads as PDF
- visuals match between preview and PDF as closely as current browser rendering allows
- no duplicate manual content construction in routes
- renderer only renders
- route files stay thin

---

## Do Not Work On Yet

Paused until worksheet engine is stable:

- accounts
- cart
- subscriptions
- memberships
- TPT automation
- AI tutor
- lesson slide generator
- fractions
- pattern blocks
- graphing
- homepage redesign
- large Browse redesign

---

## Future Expansion Path

After worksheet engine stabilization:

1. Expand catalog coverage
2. Expand expectation → skill mappings
3. Add more activity recipes
4. Add more visual types
5. Improve Browse Library UX
6. Improve Resource Detail page
7. Add lesson slides
8. Add accounts/favorites
9. Add paid products/membership
10. Add AI-assisted planning features