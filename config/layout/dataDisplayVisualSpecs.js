"use strict";

const STANDARD_PICTOGRAPH = Object.freeze({
  role: "standard",
  width: 504,
  height: 218,
  headerHeight: 42,
  minimumCategoryHeight: 44,
  labelWidth: 104,
  titleSize: 12,
  keyFontSize: 10,
  labelSize: 11,
  symbolDiameter: 16,
  symbolGap: 31,
  symbolInset: 24,
  symbolStrokeColor: "#4b5563",
  symbolStrokeWidth: 1.15,
  gapAfter: 14
});

const CONSTRUCTION_PICTOGRAPH = Object.freeze({
  ...STANDARD_PICTOGRAPH,
  role: "construction",
  height: 160,
  headerHeight: 32,
  minimumCategoryHeight: 32,
  tasksPerPage: 2,
  taskGap: 8,
  gapAfter: 10,
  dataTable: Object.freeze({
    height: 38,
    labelSize: 9.5,
    valueSize: 12,
    labelY: 6,
    valueY: 21,
    gapAfter: 8
  })
});

const MATCH_PICTOGRAPH = Object.freeze({
  ...STANDARD_PICTOGRAPH,
  role: "match_compact",
  width: 243,
  height: 138,
  headerHeight: 0,
  minimumCategoryHeight: 34.5,
  labelWidth: 70,
  titleSize: 10,
  keyFontSize: 8.5,
  labelSize: 8.5,
  symbolDiameter: 10,
  symbolGap: 18,
  symbolInset: 14,
  compact: true,
  showHeader: false,
  showKey: false,
  gapAfter: 14,
  dataTable: Object.freeze({
    height: 34,
    labelSize: 8.5,
    valueSize: 11,
    labelY: 5,
    valueY: 18,
    gapAfter: 8
  })
});

const DATA_DISPLAY_VISUAL_SPECS = Object.freeze({
  standard: STANDARD_PICTOGRAPH,
  construction: CONSTRUCTION_PICTOGRAPH,
  match: MATCH_PICTOGRAPH
});

module.exports = { DATA_DISPLAY_VISUAL_SPECS };
