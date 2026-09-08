const assert = require("assert");
const {buildAdditionFactsLayout,additionFactsPageGeometry} = require("../config/layout/additionFactsLayout");
const {buildCatalogWorksheetRuntime} = require("../services/catalogWorksheetRuntimeService");
const id="g1_addition_facts_within_20";
let checks=0;
for (const size of [12,14,16]) {
  const widest=Array.from({length:180},(_,i)=>({id:i+1,prompt:"25 + 25 = __",answer:50}));
  const wideProfile=buildAdditionFactsLayout(widest,size);
  assert(wideProfile.measuredWidth<=wideProfile.columnWidth);
  for (const count of [...new Set([1,2,3,4,5,12,13,59,60,61,75,180,wideProfile.capacity-1,wideProfile.capacity,wideProfile.capacity+1])]) {
    const runtime=buildCatalogWorksheetRuntime(id,{questionTextSize:size,questionCount:count,maximumValue:50,includeExample:true,worksheetSeed:"layout-boundaries"});
    const items=runtime.contentObject.content.items;
    assert.strictEqual(items.length,count);
    assert.strictEqual(items.filter(x=>x.isExample).length,1);
    const profile=runtime.layout.display.additionFactsLayout;
    const pageCount=Math.ceil(count/profile.capacity);
    let remaining=count;
    for (let page=pageCount;page>0;page--) {
      const assigned=Math.ceil(remaining/page);
      const geometry=additionFactsPageGeometry(assigned,profile,166,714);
      assert(geometry.rows<=profile.maxRows);
      assert(geometry.topOffset>=0);
      assert(166+geometry.topOffset+(geometry.rows-1)*geometry.rowHeight+size*1.5<714);
      remaining-=assigned;
    }
    assert.strictEqual(remaining,0);
    checks++;
  }
}
for (const size of [12,14,16]) {
  const runtime=buildCatalogWorksheetRuntime(id,{minimumValue:0,maximumValue:100,selectedValues:[100],questionTextSize:size,questionCount:60,includeExample:true,worksheetSeed:"three-digit-layout"});
  const items=runtime.contentObject.content.items;
  const profile=runtime.layout.display.additionFactsLayout;
  assert(items.some(item=>item.a===100||item.b===100),"expected a three-digit operand");
  assert(items.some(item=>item.answer===100),"expected a three-digit answer");
  assert(profile.measuredWidth<=profile.columnWidth,"three-digit prompt must fit safely");
}
const standard=buildCatalogWorksheetRuntime(id,{}).layout.display.additionFactsLayout;
assert.strictEqual(standard.capacity,60);
assert.strictEqual(standard.columns,4);
assert.strictEqual(additionFactsPageGeometry(60,standard,166,714).topOffset,0);
assert.strictEqual(additionFactsPageGeometry(12,standard,166,714).rows,3);
assert(additionFactsPageGeometry(12,standard,166,714).topOffset>70);
for(const sibling of ["g1_subtraction_facts_within_20","g1_missing_addends_within_20","g3_multiplication_facts"]) {
  assert.strictEqual(buildCatalogWorksheetRuntime(sibling,{}).layout.display.additionFactsLayout,undefined);
}
console.log(`Addition Facts layout tests passed: ${checks} count/size boundaries and three sibling isolation checks.`);
