"use strict";

const assert = require("assert");
const { Writable } = require("stream");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderQuickCheckPDF, __test: quickCheckTest } = require("../renderers/quickCheckPdfRenderer");
const { renderExitTicketPDF, __test: exitTicketTest } = require("../renderers/exitTicketPdfRenderer");

const QUICK_CHECKS = Object.freeze({
  g2_addition_within_20_quick_check: {
    title: "Addition Within 20",
    instruction: "Add."
  },
  g2_subtraction_within_20_quick_check: {
    title: "Subtraction Within 20",
    instruction: "Subtract."
  },
  g2_missing_addends_within_20_quick_check: {
    title: "Missing Addends Within 20",
    instruction: "Find the missing number in each addition fact."
  }
});

const EXIT_TICKET_ID = "g2_missing_addends_within_20_exit_ticket";

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
  toBuffer() {
    return Buffer.concat(this.chunks);
  }
}

function signatures(runtime) {
  return runtime.normalizedContentObject.content.items.map((item) => `${item.prompt}|${item.answer}`);
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function renderPdf(renderer, runtime) {
  return new Promise((resolve, reject) => {
    const res = new BufferResponse();
    res.once("finish", () => resolve(res.toBuffer()));
    res.once("error", reject);
    renderer({
      res,
      item: runtime.item,
      contentObject: runtime.normalizedContentObject,
      options: { includeAnswerKey: true, filename: "assessment-test.pdf" }
    });
  });
}

function zeroRelatedCount(items) {
  return items.filter((item) => {
    const match = item.prompt.match(/^__ \+ (\d+) = (\d+)$/);
    assert(match, `Malformed missing-addend prompt: ${item.prompt}`);
    const known = Number(match[1]);
    const total = Number(match[2]);
    return known === 0 || item.answer === 0 || total === known;
  }).length;
}

function assertMissingAddendTruth(items) {
  items.forEach((item) => {
    const match = item.prompt.match(/^__ \+ (\d+) = (\d+)$/);
    assert(match);
    const known = Number(match[1]);
    const total = Number(match[2]);
    assert(total >= 1 && total <= 20);
    assert.strictEqual(item.answer, total - known);
  });
}

async function testQuickChecks() {
  const layout = quickCheckTest.GRADE2_QUICK_CHECK_LAYOUT;
  assert.deepStrictEqual(layout, {
    columns: 2,
    rowsPerColumn: 3,
    itemCount: 6,
    equationFontSize: 16,
    targetWidth: 58,
    metadataSubtitle: false,
    preciseTimeEstimate: false,
    teacherPanel: false,
    ratingStrip: false,
    usesSecondaryAnswerLines: false
  });

  for (const [id, spec] of Object.entries(QUICK_CHECKS)) {
    for (let seedIndex = 0; seedIndex < 30; seedIndex += 1) {
      const query = { worksheetSeed: `g2-quick-check-${seedIndex}` };
      const runtime = buildCatalogWorksheetRuntime(id, query);
      const repeat = buildCatalogWorksheetRuntime(id, query);
      const items = runtime.normalizedContentObject.content.items;
      assert.strictEqual(runtime.item.status, "ready");
      assert.strictEqual(runtime.item.title, spec.title);
      assert.strictEqual(runtime.contentObject.meta.title, spec.title);
      assert(!runtime.item.title.includes("Quick Check"));
      assert.strictEqual(runtime.item.studentInstructions, spec.instruction);
      assert.strictEqual(runtime.layout.instruction, spec.instruction);
      assert.strictEqual(runtime.layout.template.columns, 2);
      assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 6);
      assert.strictEqual(runtime.layout.display.resourceKindLabel, "Quick Check");
      assert.strictEqual(runtime.layout.display.showMetadataSubtitle, false);
      assert.strictEqual(runtime.layout.display.showTimeEstimate, false);
      assert.strictEqual(runtime.layout.display.showTeacherPanel, false);
      assert.strictEqual(runtime.layout.display.showRatingStrip, false);
      assert.strictEqual(items.length, 6);
      assert(items.every((item) => !item.isExample));
      assert.deepStrictEqual(signatures(runtime), signatures(repeat));
      items.forEach((item) => {
        const parts = quickCheckTest.inlineEquationParts(item.prompt);
        assert(!parts.prefix.includes("Teacher note"));
        assert.strictEqual(item.prompt.match(/_{2,}/g).length, 1);
        assert(item.answer !== null && item.answer !== undefined);
      });

      if (id.includes("missing_addends")) {
        assertMissingAddendTruth(items);
        assert(zeroRelatedCount(items) <= 1);
        assert(items.length - zeroRelatedCount(items) >= 5);
      }

      if (seedIndex === 0) {
        const pdf = await renderPdf(renderQuickCheckPDF, runtime);
        assert.strictEqual(pageCount(pdf), 2);
      }
    }
  }
}

async function testExitTicket() {
  const layout = exitTicketTest.GRADE2_EXIT_TICKET_LAYOUT;
  assert.deepStrictEqual(layout, {
    ticketsPerPage: 2,
    itemsPerTicket: 3,
    equationFontSize: 14,
    targetWidth: 58,
    usesSecondaryAnswerLines: false,
    conciseTitle: true
  });

  for (let seedIndex = 0; seedIndex < 30; seedIndex += 1) {
    const query = { worksheetSeed: `g2-exit-ticket-${seedIndex}` };
    const runtime = buildCatalogWorksheetRuntime(EXIT_TICKET_ID, query);
    const repeat = buildCatalogWorksheetRuntime(EXIT_TICKET_ID, query);
    const items = runtime.normalizedContentObject.content.items;
    assert.strictEqual(runtime.item.status, "ready");
    assert.strictEqual(runtime.item.title, "Missing Addends Within 20");
    assert(!runtime.item.title.includes("Exit Ticket"));
    assert.strictEqual(runtime.item.studentInstructions, "Find the missing number in each addition fact.");
    assert.strictEqual(runtime.layout.instruction, runtime.item.studentInstructions);
    assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 3);
    assert.strictEqual(runtime.layout.display.resourceKindLabel, "Exit Ticket");
    assert.strictEqual(runtime.layout.display.cutApartTicketCount, 2);
    assert.strictEqual(items.length, 3);
    assert(items.every((item) => !item.isExample));
    assert.deepStrictEqual(signatures(runtime), signatures(repeat));
    assertMissingAddendTruth(items);
    assert(zeroRelatedCount(items) <= 1);
    assert(items.length - zeroRelatedCount(items) >= 2);

    if (seedIndex === 0) {
      const pdf = await renderPdf(renderExitTicketPDF, runtime);
      assert.strictEqual(pageCount(pdf), 2);
    }
  }
}

async function testGradeIsolation() {
  const grade1Exit = buildCatalogWorksheetRuntime("g1_compare_numbers_to_20_exit_ticket", {
    worksheetSeed: "g1-exit-ticket-isolation"
  });
  const grade3Quick = buildCatalogWorksheetRuntime("g3_compare_3_digit_numbers_quick_check", {
    worksheetSeed: "g3-quick-check-isolation"
  });
  const grade3Exit = buildCatalogWorksheetRuntime("g3_compare_3_digit_numbers_exit_ticket", {
    worksheetSeed: "g3-exit-ticket-isolation"
  });
  assert.strictEqual(exitTicketTest.isGrade2CompactExitTicket(grade1Exit.item), false);
  assert.strictEqual(quickCheckTest.isGrade2CompactQuickCheck(grade3Quick.item), false);
  assert.strictEqual(exitTicketTest.isGrade2CompactExitTicket(grade3Exit.item), false);
  assert(grade3Quick.item.title.includes("Quick Check"));
  assert(grade3Exit.item.title.includes("Exit Ticket"));
  assert.strictEqual(pageCount(await renderPdf(renderExitTicketPDF, grade1Exit)), 2);
  assert.strictEqual(pageCount(await renderPdf(renderQuickCheckPDF, grade3Quick)), 2);
  assert.strictEqual(pageCount(await renderPdf(renderExitTicketPDF, grade3Exit)), 2);
}

async function run() {
  await testQuickChecks();
  await testExitTicket();
  await testGradeIsolation();
  console.log("Grade 2 compact assessment layout tests passed.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
