"use strict";

const assert = require("assert");
const { Writable } = require("stream");
const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderExitTicketPDF, __test } = require("../renderers/exitTicketPdfRenderer");

const SPECS = Object.freeze({
  g4_compare_fractions_exit_ticket: "Write >, <, or = to compare each pair.",
  g3_compare_3_digit_numbers_exit_ticket: "Write >, <, or = to compare each pair.",
  g5_compare_numbers_to_100000_exit_ticket: "Write >, <, or = to compare each pair.",
  g5_equivalent_fractions_exit_ticket: "Write the missing equivalent fraction.",
  g2_missing_addends_within_20_exit_ticket: "Write the missing number.",
  g3_expanded_form_to_standard_form_exit_ticket: "Write each number in standard form."
});

class BufferResponse extends Writable {
  constructor() { super(); this.chunks = []; }
  setHeader() {}
  _write(chunk, encoding, callback) { this.chunks.push(Buffer.from(chunk)); callback(); }
  toBuffer() { return Buffer.concat(this.chunks); }
}

function renderPdf(runtime) {
  return new Promise((resolve, reject) => {
    const res = new BufferResponse();
    res.once("finish", () => resolve(res.toBuffer()));
    res.once("error", reject);
    renderExitTicketPDF({
      res,
      item: runtime.item,
      contentObject: runtime.normalizedContentObject,
      options: { includeAnswerKey: true, filename: "four-up-test.pdf" }
    });
  });
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

async function run() {
  assert.deepStrictEqual(__test.FOUR_UP_EXIT_TICKET_LAYOUT, {
    ticketsPerPage: 4,
    itemsPerTicket: 3,
    titleFontSize: 13,
    promptFontSize: 11.5,
    omitsDate: true
  });

  for (const [id, instruction] of Object.entries(SPECS)) {
    const orders = new Set();
    for (let seedIndex = 0; seedIndex < 30; seedIndex += 1) {
      const query = { worksheetSeed: `four-up-${id}-${seedIndex}` };
      const runtime = buildCatalogWorksheetRuntime(id, query);
      const repeat = buildCatalogWorksheetRuntime(id, query);
      const items = runtime.normalizedContentObject.content.items;
      assert.strictEqual(__test.isFourUpExitTicket(runtime.item), true);
      assert.strictEqual(runtime.item.studentInstructions, instruction);
      assert.strictEqual(runtime.layout.instruction, instruction);
      assert.strictEqual(runtime.layout.display.cutApartTicketCount, 4);
      assert.strictEqual(items.length, 3);
      assert.deepStrictEqual(items, repeat.normalizedContentObject.content.items);
      items.forEach((item) => {
        assert(item.answer !== null && item.answer !== undefined);
        assert(!__test.concisePrompt(item.prompt).match(/^(Compare(?: the numbers)?:|Match the equivalent fractions:)/i));
      });
      orders.add(items.map((item) => `${item.prompt}|${item.answer}`).join(";"));
      if (seedIndex === 0) assert.strictEqual(pageCount(await renderPdf(runtime)), 2);
    }
    assert(orders.size > 1, `${id} did not vary across the deterministic seed sweep`);
  }

  const unaffected = buildCatalogWorksheetRuntime("g1_compare_numbers_to_20_exit_ticket", { worksheetSeed: "two-up-isolation" });
  assert.strictEqual(__test.isFourUpExitTicket(unaffected.item), false);
  assert.strictEqual(pageCount(await renderPdf(unaffected)), 2);
  console.log("Exit Ticket four-up tests passed.");
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
