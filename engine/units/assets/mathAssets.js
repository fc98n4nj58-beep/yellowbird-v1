// engine/units/assets/mathAssets.js
'use strict';

const BASE = '/assets/math';

function pad2(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) throw new Error(`pad2: invalid number: ${n}`);
  return String(num).padStart(2, '0');
}

const ASSETS = Object.freeze({
  base: BASE,

  tenFrames: Object.freeze({
    single: (n) => `${BASE}/ten_frames/tf_single_${pad2(n)}_v1.svg`, // 00–10
    double: (n) => `${BASE}/ten_frames/tf_double_${pad2(n)}_v1.svg`, // 00–20
  }),

  baseTen: Object.freeze({
    one: `${BASE}/base_ten/bt_one_v1.svg`,
    ten: `${BASE}/base_ten/bt_ten_v1.svg`,
    hundred: `${BASE}/base_ten/bt_hundred_v1.svg`,
  }),

  numberLines: Object.freeze({
    to10: `${BASE}/number_lines/nl_0_10_v1.svg`,
    to20: `${BASE}/number_lines/nl_0_20_v1.svg`,
    to50: `${BASE}/number_lines/nl_0_50_v1.svg`,
    open: `${BASE}/number_lines/nl_open_blank_v1.svg`,
  }),

  charts: Object.freeze({
    hundred: `${BASE}/charts/chart_100_blank_v1.svg`,
    oneTwenty: `${BASE}/charts/chart_120_blank_v1.svg`,
  }),

  sorting: Object.freeze({
    twoCol: `${BASE}/sorting/sort_2col_v1.svg`,
    threeCol: `${BASE}/sorting/sort_3col_v1.svg`,
  }),

  patterns: Object.freeze({
    strip8: `${BASE}/patterns/pattern_strip_8box_v1.svg`,
    strip10: `${BASE}/patterns/pattern_strip_10box_v1.svg`,
  }),

  calendar: Object.freeze({
    monthBlank: `${BASE}/calendar/calendar_month_blank_v1.svg`,
    daysOfWeekStrip: `${BASE}/calendar/days_of_week_strip_v1.svg`,
  }),

  data: Object.freeze({
    tally: `${BASE}/data/tally_chart_blank_v1.svg`,
    barGraph: `${BASE}/data/bar_graph_blank_v1.svg`,
    countingRecord: `${BASE}/data/counting_collections_record_v1.svg`,
  }),

  ppw: Object.freeze({
    circle2: `${BASE}/ppw/ppw_circle_2part_v1.svg`,
    bar2: `${BASE}/ppw/ppw_bar_2part_v1.svg`,
  }),

  arrays: Object.freeze({
    fiveByFive: `${BASE}/arrays/array_5x5_v1.svg`,
    tenByTen: `${BASE}/arrays/array_10x10_v1.svg`,
  }),

  // Shapes (keep adding as you expand your library)
  shapes: Object.freeze({
    circle: `${BASE}/shapes/shape_circle_outline_v1.svg`,
    square: `${BASE}/shapes/shape_square_outline_v1.svg`,
    rectangle: `${BASE}/shapes/shape_rectangle_outline_v1.svg`,
    triangle: `${BASE}/shapes/shape_triangle_outline_v1.svg`,
    cube: `${BASE}/shapes/shape_cube_outline_v1.svg`,
    sphere: `${BASE}/shapes/shape_sphere_outline_v1.svg`,
    cylinder: `${BASE}/shapes/shape_cylinder_outline_v1.svg`,
    cone: `${BASE}/shapes/shape_cone_outline_v1.svg`,
  }),
});

module.exports = ASSETS;