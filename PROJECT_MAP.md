# Project Yellow Bird Map

## Main server
- server.js
- Starts app
- Handles routes
- Currently too many responsibilities

## Curriculum data
- data/curriculum/ontario/math_k6.json
- Main curriculum source data

## Curriculum service
- services/curriculumService.js
- Loads curriculum
- Normalizes and searches expectations

## Worksheet PDF system
- public/worksheet.html
- routes/worksheetPdfRoutes.js
- engine/contentFactory.js
- renderers/pdfRenderer.js
- GET /api/worksheet.pdf

## Skill-based worksheet engine
- routes/worksheetBuilderRoutes.js
- engine/worksheetBuilder/buildWorksheet.js
- engine/skills/*
- engine/activityRecipes/*
- engine/problemGenerators/*
- GET /api/generateWorksheet

## Unit generator
- public/units.html
- engine/units/unitFactory.js
- engine/units/modes/*
- renderers/unitPdfRenderer.js
- renderers/lessonWorksheetRenderer.js

## Recipes
- config/curriculumRecipes.js
- Main recipe source

## Likely old or duplicate recipe files