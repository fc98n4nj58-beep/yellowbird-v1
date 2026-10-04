"use strict";

const assert = require("assert");
const fs = require("fs");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { getAnyWorksheetCatalogById } = require("../services/worksheetCatalogService");
const { renderWorksheetPDF, buildAnswerKeyItems } = require("../renderers/pdfRenderer");

const IDS = Object.freeze({
  addition: "g2_addition_fluency_within_100",
  missing: "g2_missing_addends_within_100",
  subtraction: "g2_subtraction_fluency_within_100",
  related: "grade2_addition_subtraction_facts_related_subtraction"
});
const SPECS = Object.freeze({
  [IDS.addition]: {
    title: "Addition Facts Within 100",
    instruction: "Solve each addition fact."
  },
  [IDS.missing]: {
    title: "Missing Addends Within 100",
    instruction: "Write the missing number in each equation."
  },
  [IDS.subtraction]: {
    title: "Subtraction Facts Within 100",
    instruction: "Solve each subtraction fact."
  }
});
const FOOTER = "Grade 2 • Math • Addition and Subtraction";

class MemoryResponse extends Writable {
  constructor() { super(); this.chunks = []; }
  setHeader() {}
  _write(chunk, encoding, callback) { this.chunks.push(Buffer.from(chunk)); callback(); }
  buffer() { return Buffer.concat(this.chunks); }
}

function signature(runtime) {
  return JSON.stringify({
    title: runtime.layout.header.title,
    instruction: runtime.layout.instruction,
    template: runtime.layout.template,
    display: runtime.layout.display,
    items: runtime.normalizedContentObject.content.items
  });
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function renderRuntime(runtime, filename) {
  return new Promise((resolve, reject) => {
    const response = new MemoryResponse();
    response.once("finish", () => resolve(response.buffer()));
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: { filename, disposition: "inline", includeAnswerKey: true }
    });
  });
}

function assertParity(runtime) {
  const preview = runtime.layout.problems;
  const pdf = runtime.normalizedContentObject.content.items;
  assert.strictEqual(preview.length, pdf.length);
  preview.forEach((item, index) => {
    assert.strictEqual(item.prompt, pdf[index].prompt);
    assert.strictEqual(item.answer, pdf[index].answer);
  });
  const key = buildAnswerKeyItems(pdf);
  assert.strictEqual(key.length, pdf.length);
  key.forEach((item, index) => {
    assert.strictEqual(item.answer, pdf[index].answer);
    assert.strictEqual(item.prompt, pdf[index].prompt);
  });
}

function assertShared(runtime, id) {
  const spec = SPECS[id];
  assert.strictEqual(runtime.item.id, id);
  assert.strictEqual(runtime.item.status, "ready");
  assert.strictEqual(runtime.layout.header.title, spec.title);
  assert.strictEqual(runtime.contentObject.meta.title, spec.title);
  assert.strictEqual(runtime.layout.instruction, spec.instruction);
  assert(!runtime.layout.instruction.includes("\n"));
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, FOOTER);
  assert(!runtime.contentObject.meta.curriculum.footerText.includes("_"));
  assert(!runtime.contentObject.meta.curriculum.footerText.includes(runtime.item.skillKey));
  const founderReviewGrid = [IDS.missing, IDS.subtraction].includes(id);
  assert.strictEqual(runtime.normalizedContentObject.content.items.length, founderReviewGrid ? 30 : 12);
  assert.strictEqual(runtime.layout.template.id, "fluency_grid");
  assert.strictEqual(runtime.layout.template.columns, founderReviewGrid ? 3 : 4);
  assert.strictEqual(runtime.layout.template.maxProblemsPerPage, founderReviewGrid ? 30 : 60);
  assert.strictEqual(runtime.layout.display.answerTargetVariant, "shortNumeric");
  assert.strictEqual(runtime.layout.display.standardShortAnswerTarget, true);
  assert.strictEqual(runtime.layout.display.equalHeightItems, true);
  assert.strictEqual(Boolean(runtime.layout.display.includeExample), false);
  assert(runtime.normalizedContentObject.content.items.every((item) => item.isExample === false));
  assert(runtime.normalizedContentObject.content.items.every((item) => item.prompt && item.prompt.includes("__")));
  assert(runtime.normalizedContentObject.content.items.every((item) => !item.prompt.includes(spec.instruction)));
  assertParity(runtime);
}

function assertCommonPresentation(runtime, id) {
  const spec = SPECS[id];
  assert.strictEqual(runtime.layout.header.title, spec.title);
  assert.strictEqual(runtime.layout.instruction, spec.instruction);
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, FOOTER);
  assert.strictEqual(runtime.layout.template.id, "fluency_grid");
  assert.strictEqual(runtime.layout.template.columns, 4);
  assert.strictEqual(runtime.layout.display.answerTargetVariant, "shortNumeric");
  assert.strictEqual(runtime.layout.display.standardShortAnswerTarget, true);
}

async function assertCompletedExampleCompatibility() {
  const aliases = ["includeExample", "completedExample", "example"];
  for (const id of [IDS.addition, IDS.missing, IDS.subtraction]) {
    for (const alias of aliases) {
      const runtime = buildCatalogWorksheetRuntime(id, {
        worksheetSeed: `grade2-category-e-batch2-${id}-${alias}`,
        questionCount: 12,
        [alias]: true
      });
      const items = runtime.normalizedContentObject.content.items;
      assertCommonPresentation(runtime, id);
      assert.strictEqual(items.length, 13);
      assert.strictEqual(items.filter((item) => item.isExample).length, 1);
      assert.strictEqual(items.filter((item) => !item.isExample).length, 12);
      assert.strictEqual(runtime.layout.display.includeExample, true);
      assert.strictEqual(runtime.layout.display.exampleCountsAsQuestion, false);
      assertParity(runtime);
      const pdf = await renderRuntime(runtime, `${id}-${alias}.pdf`);
      assert.strictEqual(pageCount(pdf), 2);
    }
  }
}

async function assertQuestionCountsAndPagination() {
  const cases = [
    { questionCount: 1, expectedPages: 2 },
    { questionCount: 12, expectedPages: 2 },
    { questionCount: 20, expectedPages: 2 },
    { questionCount: 75, questionsPerPage: 30, expectedPages: 6 }
  ];

  for (const id of [IDS.addition, IDS.missing, IDS.subtraction]) {
    for (const testCase of cases) {
      const runtime = buildCatalogWorksheetRuntime(id, {
        worksheetSeed: `grade2-category-e-batch2-${id}-count-${testCase.questionCount}`,
        questionCount: testCase.questionCount,
        questionsPerPage: testCase.questionsPerPage
      });
      assertCommonPresentation(runtime, id);
      assert.strictEqual(runtime.normalizedContentObject.content.items.length, testCase.questionCount);
      assert.strictEqual(
        runtime.layout.template.maxProblemsPerPage,
        testCase.questionsPerPage || 60
      );
      assertParity(runtime);
      const pdf = await renderRuntime(runtime, `${id}-${testCase.questionCount}.pdf`);
      assert.strictEqual(pageCount(pdf), testCase.expectedPages);
    }
  }
}

function selectedHit(item, selected) {
  return [
    item.a,
    item.b,
    item.firstAddend,
    item.secondAddend,
    item.total,
    item.minuend,
    item.subtrahend,
    item.difference
  ].some((value) => selected.has(value));
}

function assertAdditionWeightedEmphasis() {
  const selected = new Set([7, 23]);
  for (const selection of [
    { onlyNumbers: "7,23" },
    { selectedNumbers: [7, 23] }
  ]) {
    const runtime = buildCatalogWorksheetRuntime(IDS.addition, {
      worksheetSeed: `grade2-category-e-batch2-addition-selection-${Object.keys(selection)[0]}`,
      questionCount: 60,
      ...selection
    });
    const items = runtime.normalizedContentObject.content.items;
    assert.strictEqual(items.length, 60);
    assert(items.filter((item) => selectedHit(item, selected)).length >= 40);
    assert(items.every((item) => item.answer === item.a + item.b && item.answer <= 100));
    assertParity(runtime);
  }
}

function assertStrictMissingAddendSelection() {
  const selected = new Set([7, 23]);
  for (const selection of [
    { onlyNumbers: "7,23" },
    { selectedNumbers: [7, 23] }
  ]) {
    for (const missingPosition of ["first", "second", "mixed"]) {
      const runtime = buildCatalogWorksheetRuntime(IDS.missing, {
        worksheetSeed: `grade2-category-e-batch2-missing-selection-${Object.keys(selection)[0]}-${missingPosition}`,
        questionCount: 20,
        missingPosition,
        ...selection
      });
      const items = runtime.normalizedContentObject.content.items;
      assert.strictEqual(items.length, 20);
      items.forEach((item) => {
        assert(selected.has(item.firstAddend));
        assert(selected.has(item.secondAddend));
        assert.strictEqual(item.firstAddend + item.secondAddend, item.total);
        assert(item.total <= 100);
        assert.strictEqual(item.answer, item.missingValue);
      });
      const positions = new Set(items.map((item) => item.missingPosition));
      if (missingPosition === "first") assert.deepStrictEqual([...positions], ["first_addend"]);
      if (missingPosition === "second") assert.deepStrictEqual([...positions], ["second_addend"]);
      if (missingPosition === "mixed") {
        assert.deepStrictEqual([...positions].sort(), ["first_addend", "second_addend"]);
        assert.strictEqual(items.filter((item) => item.missingPosition === "first_addend").length, 10);
        assert.strictEqual(items.filter((item) => item.missingPosition === "second_addend").length, 10);
      }
      assertParity(runtime);
    }
  }
  assert.throws(
    () => buildCatalogWorksheetRuntime(IDS.missing, { onlyNumbers: "200", questionCount: 12 }),
    /No missing_addend candidates are available/
  );
}

function assertStrictSubtractionSelection() {
  const selected = new Set([7, 23]);
  for (const selection of [
    { onlyNumbers: "7,23" },
    { selectedNumbers: [7, 23] }
  ]) {
    const runtime = buildCatalogWorksheetRuntime(IDS.subtraction, {
      worksheetSeed: `grade2-category-e-batch2-subtraction-selection-${Object.keys(selection)[0]}`,
      questionCount: 20,
      ...selection
    });
    const items = runtime.normalizedContentObject.content.items;
    assert.strictEqual(items.length, 20);
    items.forEach((item) => {
      assert(selected.has(item.minuend));
      assert(selected.has(item.subtrahend));
      assert(item.minuend >= item.subtrahend);
      assert.strictEqual(item.answer, item.minuend - item.subtrahend);
    });
    assertParity(runtime);
  }
  assert.throws(
    () => buildCatalogWorksheetRuntime(IDS.subtraction, { onlyNumbers: "200", questionCount: 12 }),
    /No subtraction candidates are available/
  );
}

function assertAddition(runtime) {
  assertShared(runtime, IDS.addition);
  const items = runtime.normalizedContentObject.content.items;
  items.forEach((item) => {
    assert.strictEqual(item.type, "equation");
    assert.strictEqual(item.op, "+");
    assert(Number.isInteger(item.a) && item.a >= 0 && item.a <= 100);
    assert(Number.isInteger(item.b) && item.b >= 0 && item.b <= 100);
    assert.strictEqual(item.answer, item.a + item.b);
    assert(item.answer >= 0 && item.answer <= 100);
    assert.strictEqual(item.prompt, `${item.a} + ${item.b} = __`);
  });
  assert(items.some((item) => item.answer > 20 || item.a > 20 || item.b > 20));
}

function assertMissing(runtime) {
  assertShared(runtime, IDS.missing);
  const items = runtime.normalizedContentObject.content.items;
  const positions = new Set();
  items.forEach((item) => {
    assert.strictEqual(item.type, "equation");
    assert.strictEqual(item.op, "+");
    assert(Number.isInteger(item.firstAddend) && item.firstAddend >= 0);
    assert(Number.isInteger(item.secondAddend) && item.secondAddend >= 0);
    assert(Number.isInteger(item.total) && item.total >= 0 && item.total <= 100);
    assert.strictEqual(item.firstAddend + item.secondAddend, item.total);
    assert(Number.isInteger(item.missingValue) && item.missingValue >= 0);
    assert.strictEqual(item.answer, item.missingValue);
    positions.add(item.missingPosition);
    if (item.missingPosition === "first_addend") {
      assert.strictEqual(item.missingValue, item.firstAddend);
      assert.strictEqual(item.prompt, `__ + ${item.secondAddend} = ${item.total}`);
    } else {
      assert.strictEqual(item.missingPosition, "second_addend");
      assert.strictEqual(item.missingValue, item.secondAddend);
      assert.strictEqual(item.prompt, `${item.firstAddend} + __ = ${item.total}`);
    }
    assert.strictEqual((item.prompt.match(/__/g) || []).length, 1);
  });
  assert.deepStrictEqual([...positions].sort(), ["first_addend", "second_addend"]);
  assert(items.some((item) => item.total > 20 || item.missingValue > 20));
}

function assertSubtraction(runtime) {
  assertShared(runtime, IDS.subtraction);
  const items = runtime.normalizedContentObject.content.items;
  items.forEach((item) => {
    assert.strictEqual(item.type, "equation");
    assert.strictEqual(item.operation, "subtraction");
    assert.strictEqual(item.op, "-");
    assert(Number.isInteger(item.minuend) && item.minuend >= 0 && item.minuend <= 100);
    assert(Number.isInteger(item.subtrahend) && item.subtrahend >= 0 && item.subtrahend <= 100);
    assert(Number.isInteger(item.difference) && item.difference >= 0);
    assert.strictEqual(item.answer, item.minuend - item.subtrahend);
    assert.strictEqual(item.answer, item.difference);
    assert.strictEqual(item.prompt, `${item.minuend} - ${item.subtrahend} = __`);
  });
  assert(items.some((item) => item.minuend > 20 || item.subtrahend > 20 || item.answer > 20));
}

function assertCatalogReconciliationAndIsolation() {
  for (const id of Object.values(IDS)) {
    const item = getAnyWorksheetCatalogById(id);
    assert(item);
    assert.strictEqual(item.status, "ready");
  }

  const master = JSON.parse(fs.readFileSync("data/worksheetCatalog.master.json", "utf8")).items;
  const counts = master.reduce((result, item) => {
    result[item.status] = (result[item.status] || 0) + 1;
    return result;
  }, {});
  assert.deepStrictEqual(counts, { ready: 106, partial: 4, generated: 213, planned: 11 });
  assert.strictEqual(master.length, 334);

  const reconciliation = fs.readFileSync("docs/grade-2-architecture-reconciliation-preflight.md", "utf8");
  const categoryA = reconciliation.match(/\*\*A \(35\):\*\*[^\n]+/)?.[0] || "";
  const categoryD = reconciliation.match(/\*\*D \(0\):\*\*[^\n]+/)?.[0] || "";
  const categoryE = reconciliation.match(/\*\*E \(0\):\*\*[^\n]+/)?.[0] || "";
  const categoryG = reconciliation.match(/\*\*G \(17\):\*\*[^\n]+/)?.[0] || "";
  assert(categoryA && categoryD.includes("none") && categoryE.includes("none") && categoryG);
  [IDS.addition, IDS.missing, IDS.subtraction].forEach((id) => {
    assert(categoryA.includes(id));
    assert(!categoryE.includes(id));
  });
  assert(categoryG.includes(IDS.related));
  assert(!categoryE.includes(IDS.related));

  const grade1Addition = buildCatalogWorksheetRuntime("g1_addition_facts_within_20", { worksheetSeed: "g2-e2-isolation" });
  assert.strictEqual(grade1Addition.layout.header.title, "Addition Facts to 20");
  assert.strictEqual(grade1Addition.normalizedContentObject.content.items.length, 60);
  assert(grade1Addition.normalizedContentObject.content.items.every((item) => item.answer <= 20));
  const grade1Missing = buildCatalogWorksheetRuntime("g1_missing_addends_within_20", { worksheetSeed: "g2-e2-isolation" });
  assert.strictEqual(grade1Missing.normalizedContentObject.content.items.length, 30);
  assert(grade1Missing.normalizedContentObject.content.items.every((item) => item.total <= 20));
  const grade1Subtraction = buildCatalogWorksheetRuntime("g1_subtraction_facts_within_20", { worksheetSeed: "g2-e2-isolation" });
  assert.strictEqual(grade1Subtraction.normalizedContentObject.content.items.length, 30);
  assert(grade1Subtraction.normalizedContentObject.content.items.every((item) => item.minuend <= 20));

  const grade3Addition = buildCatalogWorksheetRuntime("grade3_addition_subtraction_facts_fact_fluency", { worksheetSeed: "g2-e2-isolation" });
  assert.notStrictEqual(grade3Addition.layout.header.title, SPECS[IDS.addition].title);
  const grade3Subtraction = buildCatalogWorksheetRuntime("grade3_addition_subtraction_facts_related_subtraction", { worksheetSeed: "g2-e2-isolation" });
  assert.notStrictEqual(grade3Subtraction.layout.header.title, SPECS[IDS.subtraction].title);

  const related = buildCatalogWorksheetRuntime(IDS.related, { worksheetSeed: "g2-e2-related-decision" });
  assert.strictEqual(related.layout.instruction, "Solve each subtraction fact.");
  assert(related.normalizedContentObject.content.items.every((item) => /^\d+ - \d+ = __$/.test(item.prompt)));
  assert(related.normalizedContentObject.content.items.every((item) => item.prompt.split("\n").length === 1));
  assert(related.normalizedContentObject.content.items.every((item) => !item.prompt.includes("+")));
}

async function run() {
  assertCatalogReconciliationAndIsolation();
  const variations = {
    [IDS.addition]: new Set(),
    [IDS.missing]: new Set(),
    [IDS.subtraction]: new Set()
  };
  const validators = {
    [IDS.addition]: assertAddition,
    [IDS.missing]: assertMissing,
    [IDS.subtraction]: assertSubtraction
  };

  for (let index = 0; index < 30; index += 1) {
    for (const id of [IDS.addition, IDS.missing, IDS.subtraction]) {
      const options = { worksheetSeed: `grade2-category-e-batch2-${id}-${index}` };
      const first = buildCatalogWorksheetRuntime(id, options);
      const second = buildCatalogWorksheetRuntime(id, options);
      validators[id](first);
      assert.strictEqual(signature(first), signature(second));
      variations[id].add(signature(first));
    }
  }
  Object.entries(variations).forEach(([id, values]) => {
    assert(values.size >= 20, `${id} must vary meaningfully across seeds.`);
  });

  await assertCompletedExampleCompatibility();
  await assertQuestionCountsAndPagination();
  assertAdditionWeightedEmphasis();
  assertStrictMissingAddendSelection();
  assertStrictSubtractionSelection();

  for (const id of [IDS.addition, IDS.missing, IDS.subtraction]) {
    const pdf = await renderRuntime(
      buildCatalogWorksheetRuntime(id, { worksheetSeed: `grade2-category-e-batch2-founder-${id}` }),
      `${id}.pdf`
    );
    assert(pdf.length > 1000);
    assert.strictEqual(pageCount(pdf), 2);
    assert.strictEqual((pdf.toString("latin1").match(/\/MediaBox \[0 0 612 792\]/g) || []).length, 2);
  }

  console.log("Grade 2 Category E Batch 2 checks passed; 30 default seeds per resource; example aliases, variable states, strict selections, pagination, parity, and isolation passed; pages: 2 each; same-seed failures: 0.");
}

run().catch((error) => { console.error(error); process.exit(1); });
