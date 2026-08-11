const assert = require("assert");
const fs = require("fs");
const { Writable } = require("stream");

const { buildCatalogWorksheetRuntime } = require("../services/catalogWorksheetRuntimeService");
const { renderWorksheetPDF, buildAnswerKeyItems } = require("../renderers/pdfRenderer");

const IDS = Object.freeze({
  equation: "grade3_addition_subtraction_facts_equation_match",
  family: "grade3_addition_subtraction_facts_fact_family",
  fluency: "grade3_addition_subtraction_facts_fact_fluency",
  missing: "grade3_addition_subtraction_facts_missing_addend"
});
const FOOTER = "Grade 3 • Math • Addition and Subtraction";
const SPECS = Object.freeze({
  [IDS.equation]: { title: "Equal or Not Equal?", instruction: "Solve both sides. Write = if they have the same value. Write ≠ if they have different values.", count: 20 },
  [IDS.family]: { title: "Fact Families Within 100", instruction: "Complete the fact family.", count: 12 },
  [IDS.fluency]: { title: "Addition and Subtraction Facts", instruction: "Solve each addition or subtraction fact.", count: 30 },
  [IDS.missing]: { title: "Missing Addends", instruction: "Write the missing number in each equation.", count: 30 }
});

class MemoryResponse extends Writable {
  constructor() { super(); this.chunks = []; }
  setHeader() {}
  _write(chunk, encoding, callback) { this.chunks.push(Buffer.from(chunk)); callback(); }
  buffer() { return Buffer.concat(this.chunks); }
}

function truth(runtime) {
  return runtime.normalizedContentObject.content.items.map((item) => ({
    prompt: item.prompt,
    answer: item.answer,
    operation: item.operation,
    expectedSymbol: item.expectedSymbol,
    leftValue: item.leftValue,
    rightValue: item.rightValue,
    firstAddend: item.firstAddend,
    secondAddend: item.secondAddend,
    total: item.total,
    missingPosition: item.missingPosition,
    isExample: item.isExample
  }));
}

function pageCount(buffer) {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
}

function render(runtime, includeAnswerKey = true) {
  return new Promise((resolve, reject) => {
    const response = new MemoryResponse();
    response.once("finish", () => resolve(response.buffer()));
    response.once("error", reject);
    renderWorksheetPDF({
      res: response,
      contentObject: runtime.normalizedContentObject,
      layoutObject: runtime.layout,
      options: { filename: "grade3-batch3-test.pdf", includeAnswerKey }
    });
  });
}

function assertPublicContract(id, runtime) {
  const spec = SPECS[id];
  assert.strictEqual(runtime.item.status, "generated");
  assert.strictEqual(runtime.layout.header.title, spec.title);
  assert.strictEqual(runtime.contentObject.meta.title, spec.title);
  assert.strictEqual(runtime.layout.header.subtitle, "");
  assert.strictEqual(runtime.layout.instruction, spec.instruction);
  assert.strictEqual(runtime.contentObject.meta.curriculum.footerText, FOOTER);
  assert.strictEqual(runtime.normalizedContentObject.content.items.length, spec.count);
  const publicText = JSON.stringify({
    title: runtime.layout.header.title,
    instruction: runtime.layout.instruction,
    footer: runtime.contentObject.meta.curriculum.footerText,
    prompts: runtime.normalizedContentObject.content.items.map((item) => item.prompt)
  });
  assert(!publicText.includes("— Grade 3"));
  assert(!publicText.includes(id));
  assert(!publicText.includes("addition_subtraction_facts"));
  assert(!publicText.includes("Students "));
  assert(!runtime.normalizedContentObject.content.items.some((item) => item.prompt === spec.instruction));
}

function assertParity(runtime) {
  const student = runtime.normalizedContentObject.content.items;
  const preview = runtime.layout.problems;
  const key = buildAnswerKeyItems(student);
  assert.strictEqual(preview.length, student.length);
  assert.strictEqual(key.length, student.length);
  student.forEach((item, index) => {
    assert.strictEqual(preview[index].prompt, item.prompt);
    assert.deepStrictEqual(preview[index].answer, item.answer);
    assert.strictEqual(key[index].prompt, item.prompt);
    assert.deepStrictEqual(key[index].answer, item.answer);
  });
}

function assertEquationTruth(item) {
  assert(["=", "≠"].includes(item.answer));
  assert.strictEqual(item.expectedSymbol, item.answer);
  assert.strictEqual(item.answer, item.leftValue === item.rightValue ? "=" : "≠");
  assert.strictEqual(item.comparisonResult, item.answer === "=" ? "equivalent" : "not_equivalent");
}

function assertFamilyTruth(item) {
  const lines = item.prompt.split("\n");
  const answers = String(item.answer).split(",").map((value) => Number(value.trim()));
  assert([2, 4].includes(lines.length));
  assert.strictEqual(lines.length, answers.length);
  lines.forEach((line, index) => {
    const match = line.match(/^(\d+) ([+-]) (\d+) = __$/);
    assert(match);
    const a = Number(match[1]);
    const b = Number(match[3]);
    assert.strictEqual(answers[index], match[2] === "+" ? a + b : a - b);
  });
}

function assertFluencyTruth(item) {
  assert(["+", "-"].includes(item.op));
  assert.strictEqual(item.answer, item.op === "+" ? item.a + item.b : item.a - item.b);
  assert(item.answer >= 0 && item.answer <= 100);
}

function assertMissingTruth(item) {
  assert(["first_addend", "second_addend"].includes(item.missingPosition));
  assert.strictEqual(item.total, item.firstAddend + item.secondAddend);
  assert.strictEqual(item.answer, item.missingPosition === "first_addend" ? item.firstAddend : item.secondAddend);
  assert(item.total <= 100);
}

async function testDefaults() {
  for (const id of Object.values(IDS)) {
    const options = { worksheetSeed: `grade3-b3-default-${id}` };
    const first = buildCatalogWorksheetRuntime(id, options);
    const second = buildCatalogWorksheetRuntime(id, options);
    const beforeRender = truth(first);
    assertPublicContract(id, first);
    assert.deepStrictEqual(truth(first), truth(second));
    assertParity(first);
    if (id === IDS.equation) {
      first.normalizedContentObject.content.items.forEach(assertEquationTruth);
      const equalCount = first.normalizedContentObject.content.items.filter((item) => item.answer === "=").length;
      assert.strictEqual(equalCount, 10);
      assert.strictEqual(first.layout.display.answerTargetVariant, "comparisonSymbol");
    }
    if (id === IDS.family) {
      first.normalizedContentObject.content.items.forEach(assertFamilyTruth);
      first.normalizedContentObject.content.items.forEach((item) => {
        const firstLine = item.prompt.split("\n")[0].match(/^(\d+) \+ (\d+)/);
        assert(firstLine && firstLine[1] !== firstLine[2]);
      });
    }
    if (id === IDS.fluency) {
      first.normalizedContentObject.content.items.forEach(assertFluencyTruth);
      assert.strictEqual(first.normalizedContentObject.content.items.filter((item) => item.op === "+").length, 15);
      assert.strictEqual(first.normalizedContentObject.content.items.filter((item) => item.op === "-").length, 15);
    }
    if (id === IDS.missing) {
      first.normalizedContentObject.content.items.forEach(assertMissingTruth);
      assert.strictEqual(first.normalizedContentObject.content.items.filter((item) => item.missingPosition === "first_addend").length, 15);
      assert.strictEqual(first.normalizedContentObject.content.items.filter((item) => item.missingPosition === "second_addend").length, 15);
    }
    const pdf = await render(first, true);
    assert.strictEqual(pageCount(pdf), 2);
    assert.deepStrictEqual(truth(first), beforeRender);
  }
}

function testRangesSelectionsAndModes() {
  const equation = buildCatalogWorksheetRuntime(IDS.equation, {
    worksheetSeed: "grade3-b3-equation-range",
    questionCount: 8,
    minimumResult: 20,
    maximumResult: 40,
    equalPairs: 3,
    questionsPerPage: 8
  });
  assert.strictEqual(equation.normalizedContentObject.content.items.length, 8);
  assert.strictEqual(equation.normalizedContentObject.content.items.filter((item) => item.answer === "=").length, 3);
  equation.normalizedContentObject.content.items.forEach((item) => {
    assert(item.leftValue >= 20 && item.leftValue <= 40);
    assert(item.rightValue >= 20 && item.rightValue <= 40);
  });
  const noEquals = buildCatalogWorksheetRuntime(IDS.equation, {
    worksheetSeed: "grade3-b3-no-equals",
    questionCount: 6,
    includeEqualPairs: false
  });
  assert(noEquals.normalizedContentObject.content.items.every((item) => item.answer === "≠"));

  for (const alias of ["selectedNumbers", "onlyNumbers"]) {
    const family = buildCatalogWorksheetRuntime(IDS.family, {
      worksheetSeed: `grade3-b3-family-${alias}`,
      questionCount: 4,
      [alias]: alias === "selectedNumbers" ? [12, 25] : "12,25",
      maxTotal: 50
    });
    family.normalizedContentObject.content.items.forEach((item) => {
      const match = item.prompt.match(/^(\d+) \+ (\d+)/);
      assert(match && [12, 25].includes(Number(match[1])) && [12, 25].includes(Number(match[2])));
    });

    const fluency = buildCatalogWorksheetRuntime(IDS.fluency, {
      worksheetSeed: `grade3-b3-fluency-${alias}`,
      questionCount: 6,
      [alias]: alias === "selectedNumbers" ? [12, 25] : "12,25",
      maxTotal: 50
    });
    fluency.normalizedContentObject.content.items.forEach((item) => {
      assert([12, 25].includes(item.a) && [12, 25].includes(item.b));
    });

    const missing = buildCatalogWorksheetRuntime(IDS.missing, {
      worksheetSeed: `grade3-b3-missing-${alias}`,
      questionCount: 6,
      [alias]: alias === "selectedNumbers" ? [12, 25] : "12,25",
      maxTotal: 50
    });
    missing.normalizedContentObject.content.items.forEach((item) => {
      assert([12, 25].includes(item.firstAddend) && [12, 25].includes(item.secondAddend));
    });
  }

  for (const [alias, value, expected] of [
    ["operation", "addition", "+"],
    ["mode", "subtraction", "-"]
  ]) {
    const runtime = buildCatalogWorksheetRuntime(IDS.fluency, {
      worksheetSeed: `grade3-b3-operation-${alias}`,
      questionCount: 8,
      [alias]: value
    });
    assert(runtime.normalizedContentObject.content.items.every((item) => item.op === expected));
  }

  for (const position of ["first", "second", "mixed"]) {
    const runtime = buildCatalogWorksheetRuntime(IDS.missing, {
      worksheetSeed: `grade3-b3-position-${position}`,
      questionCount: 8,
      minA: 10,
      maxA: 20,
      minB: 30,
      maxB: 40,
      maxTotal: 60,
      missingPosition: position
    });
    runtime.normalizedContentObject.content.items.forEach((item) => {
      assert(item.firstAddend >= 10 && item.firstAddend <= 20);
      assert(item.secondAddend >= 30 && item.secondAddend <= 40);
      assert(item.total <= 60);
      if (position !== "mixed") assert.strictEqual(item.missingPosition, `${position}_addend`);
    });
  }

  const additionOnly = buildCatalogWorksheetRuntime(IDS.family, {
    worksheetSeed: "grade3-b3-family-addition-only",
    questionCount: 3,
    mode: "addition_only"
  });
  additionOnly.normalizedContentObject.content.items.forEach((item) => {
    assert.strictEqual(item.prompt.split("\n").length, 2);
    assertFamilyTruth(item);
  });
}

function testCompletedExamplesAndPagination() {
  for (const [index, option] of [
    { includeExample: true },
    { completedExample: true },
    { example: true }
  ].entries()) {
    const runtime = buildCatalogWorksheetRuntime(IDS.fluency, {
      worksheetSeed: `grade3-b3-example-${index}`,
      questionCount: 6,
      questionsPerPage: 4,
      ...option
    });
    assert.strictEqual(runtime.normalizedContentObject.content.items.length, 7);
    assert.strictEqual(runtime.normalizedContentObject.content.items.filter((item) => item.isExample).length, 1);
    assert.strictEqual(runtime.layout.template.maxProblemsPerPage, 4);
  }
}

function testCrossGradeIsolationAndRegistration() {
  const grade1Equation = buildCatalogWorksheetRuntime("grade1_addition_subtraction_facts_equation_match", { worksheetSeed: "grade3-b3-isolation" });
  assert.strictEqual(grade1Equation.layout.header.title, "Equal or Not Equal?");
  assert.strictEqual(grade1Equation.normalizedContentObject.content.items.length, 20);
  const grade2Equation = buildCatalogWorksheetRuntime("grade2_addition_subtraction_facts_equation_match", { worksheetSeed: "grade3-b3-isolation" });
  assert.strictEqual(grade2Equation.layout.header.title, "Equal or Not Equal?");
  assert.strictEqual(grade2Equation.normalizedContentObject.content.items.length, 20);
  const grade2Fluency = buildCatalogWorksheetRuntime("g2_addition_fluency_within_100", { worksheetSeed: "grade3-b3-isolation" });
  assert.strictEqual(grade2Fluency.layout.header.title, "Addition Facts Within 100");
  assert.strictEqual(grade2Fluency.normalizedContentObject.content.items.length, 12);
  const registrationText = fs.readdirSync("config/worksheetCustomization/families")
    .filter((name) => name.endsWith(".js") || name.endsWith(".json"))
    .map((name) => fs.readFileSync(`config/worksheetCustomization/families/${name}`, "utf8"))
    .join("\n");
  Object.values(IDS).forEach((id) => assert(!registrationText.includes(id)));
}

async function testAnswerKeyOption() {
  const runtime = buildCatalogWorksheetRuntime(IDS.missing, {
    worksheetSeed: "grade3-b3-answer-key",
    includeAnswerKey: false
  });
  assert.strictEqual(pageCount(await render(runtime, false)), 1);
  assert.strictEqual(pageCount(await render(runtime, true)), 2);
}

async function run() {
  await testDefaults();
  testRangesSelectionsAndModes();
  testCompletedExamplesAndPagination();
  testCrossGradeIsolationAndRegistration();
  await testAnswerKeyOption();
  console.log("Grade 3 Addition/Subtraction Batch 3 checks passed; defaults 12/12/24/24; PDFs 2/2/2/2; same-seed failures: 0.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
