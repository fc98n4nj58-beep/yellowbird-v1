"use strict";

const assert = require("assert");
const { Writable } = require("stream");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderQuickCheckPDF, __test } = require("../renderers/quickCheckPdfRenderer");

const SPECS = {
  g4_pattern_rule_quick_check: [1, 7, "Read each pattern. Write the rule to answer each question."],
  g4_compare_fractions_quick_check: [2, 6, "Write >, <, or = to compare each pair."],
  g3_compare_3_digit_numbers_quick_check: [2, 6, "Write >, <, or = to compare each pair."],
  g5_place_value_to_100000_quick_check: [2, 6, "Write >, <, or = to compare each pair."],
  g5_equivalent_fractions_quick_check: [2, 6, "Write the missing equivalent fraction."],
  g3_place_value_hundreds_tens_ones_quick_check: [2, 6, "Show each number as hundreds, tens, and ones."],
  g2_subtraction_within_20_quick_check: [3, 6, "Subtract."],
  g3_expanded_form_to_standard_form_quick_check: [3, 6, "Write each number in standard form."],
  g2_missing_addends_within_20_quick_check: [4, 5, "Write the missing number."]
};

class BufferResponse extends Writable {
  constructor() {
    super();
    this.chunks = [];
  }

  setHeader() {}

  _write(chunk, encoding, callback) {
    this.chunks.push(Buffer.from(chunk));
    callback();
  }

  buffer() {
    return Buffer.concat(this.chunks);
  }
}

function render(runtime) {
  return new Promise((resolve, reject) => {
    const res = new BufferResponse();
    res.once("finish", () => resolve(res.buffer()));
    res.once("error", reject);
    renderQuickCheckPDF({
      res,
      item: runtime.item,
      contentObject: runtime.normalizedContentObject,
      options: { includeAnswerKey: true }
    });
  });
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function assertPatternRuleTruth(items) {
  items.forEach((question) => {
    assert(Array.isArray(question.sequence));
    assert.strictEqual(question.sequence.length, 5);
    assert(["add", "subtract"].includes(question.patternOperation));
    const direction = question.patternOperation === "subtract" ? -1 : 1;
    question.sequence.slice(1).forEach((value, index) => {
      assert.strictEqual(value - question.sequence[index], direction * question.step);
    });
    assert.strictEqual(question.answer, question.patternRule);
    assert.strictEqual(question.answerState.acceptedAnswerText, question.patternRule);
    assert.strictEqual(question.answerState.responseTarget, "rule");
  });
  assert.strictEqual(new Set(items.map((question) => question.duplicateSignature)).size, items.length);
}

(async () => {
  for (const [id, [copies, count, instruction]] of Object.entries(SPECS)) {
    for (let seed = 0; seed < 30; seed += 1) {
      const query = { worksheetSeed: `cut-apart-${id}-${seed}` };
      const runtime = buildCatalogWorksheetRuntime(id, query);
      const repeat = buildCatalogWorksheetRuntime(id, query);
      const items = runtime.normalizedContentObject.content.items;
      assert.deepStrictEqual(items, repeat.normalizedContentObject.content.items);
      assert.strictEqual(items.length, count);
      assert.strictEqual(runtime.item.studentInstructions, instruction);
      assert.strictEqual(runtime.layout.display.cutApartQuickCheckCount, copies);
      if (id === "g4_pattern_rule_quick_check") assertPatternRuleTruth(items);
      items.forEach((question) => {
        assert.notStrictEqual(question.answer, undefined);
        assert(!/^(Compare(?: the numbers)?:|Match the equivalent fractions:|Complete:)/i.test(__test.concisePrompt(question.prompt)));
      });
      if (seed === 0) assert.strictEqual(pageCount(await render(runtime)), 2);
    }
  }

  const unaffected = buildCatalogWorksheetRuntime("g2_addition_within_20_quick_check", {
    worksheetSeed: "isolation"
  });
  assert.strictEqual(__test.CUT_APART_QUICK_CHECKS.has(unaffected.item.id), false);
  console.log("Quick Check cut-apart tests passed.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
