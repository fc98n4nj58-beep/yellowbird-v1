GET /api/worksheet.pdf --> worksheetPdfRoutes --> contentFactory --> pdfRenderer
GET /api/worksheet-preview --> worksheetPreviewRoutes --> worksheetBuilder
GET /api/generateWorksheet --> worksheetBuilderRoutes --> buildWorksheet
GET /api/curriculum/expectation --> curriculumRoutes --> curriculumService
GET /api/unit.pdf --> unitRoutes --> unitFactory --> unitPdfRenderer