const assert = require("assert/strict");
const path = require("path");
const fontkit = require("fontkit");
const { buildAdditionNumberLineLayout: profile, additionNumberLinePageGeometry: page } = require("../config/layout/additionNumberLineLayout");
const font = fontkit.openSync(path.join(__dirname, "../public/fonts/SourceSans3/SourceSans3-Regular.ttf"));
const width = (text, size) => font.layout(text).positions.reduce((sum, p) => sum + p.xAdvance, 0) * size / font.unitsPerEm;
for (const size of [12,14,16]) {
  const p = profile(size);
  assert.equal(p.modelWidth, 504);
  assert.equal(p.answerWidth, 42);
  assert(width("20", p.tickTextSize) < p.tickLabelWidth);
  assert(width("+10", p.jumpTextSize) < 24);
  assert(width("6)  10 + 10 = ", size) + 42 < 504);
  for (const count of [1,3,5,6]) {
    const firstCount = Math.min(count, p.capacity), g = page(firstCount, p, 166, 714);
    assert(g.topOffset >= 0);
    assert.equal(g.rows, firstCount);
    for (let row=0; row<firstCount; row++) {
      const top=166+row*g.rowHeight+g.topOffset;
      assert(top >= 166 && top+g.blockHeight <= 714+1e-8);
      if(size>12) {
        const labelBottom=top+p.lineOffset+8+p.tickTextSize*1.3;
        assert(labelBottom < top+g.blockHeight-10);
        assert(p.jumpLabelOffset-p.jumpTextSize*1.3 > 15, "arc/label clearance");
        assert(p.lineOffset-p.jumpLabelOffset > size*1.3, "equation/label clearance");
      }
    }
  }
}
assert.equal(page(6,profile(12),166,714).topOffset,0);
assert.equal(page(3,profile(12),166,714).rowHeight,548/3);
assert.throws(()=>page(5,profile(16),166,714));
console.log("Addition number-line layout: capacities, occupied-row distribution, Source Sans 3 label widths and clearances passed.");
