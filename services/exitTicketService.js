const { getCurriculumRecipe } = require("../config/curriculumRecipes");

function randInt(min, max) {
  const mn = Number(min ?? 0);
  const mx = Number(max ?? 10);
  return Math.floor(Math.random() * (mx - mn + 1)) + mn;
}

function makeAddQuestion(aMin, aMax, bMin, bMax) {
  const a = randInt(aMin, aMax);
  const b = randInt(bMin, bMax);
  return `${a} + ${b} = ______`;
}

function makeSubQuestion(aMin, aMax, bMin, bMax, nonNegative = true) {
  let a = randInt(aMin, aMax);
  let b = randInt(bMin, bMax);

  if (nonNegative && b > a) {
    [a, b] = [b, a];
  }

  return `${a} - ${b} = ______`;
}

function buildAdditionSubtractionExitTicket(found, curriculumRecipe) {
  const config = curriculumRecipe?.worksheet?.config || {};
  const aMin = Number(config.aMin ?? 0);
  const aMax = Number(config.aMax ?? 50);
  const bMin = Number(config.bMin ?? 0);
  const bMax = Number(config.bMax ?? 50);
  const nonNegative = config.subtractionNonNegative !== false;

  const q1 = makeAddQuestion(aMin, aMax, bMin, bMax);
  const q2 = makeSubQuestion(aMin, aMax, bMin, bMax, nonNegative);

  let strategyA = randInt(aMin, aMax);
  let strategyB = randInt(bMin, bMax);

  if (aMax <= 50) {
    while (strategyA + strategyB > 50) {
      strategyA = randInt(aMin, aMax);
      strategyB = randInt(bMin, bMax);
    }
  }

  return {
    title: `Exit Ticket – ${found?.expectation?.code || ""}`,
    instructions: "Complete the three questions below.",
    questions: [
      q1,
      q2,
      `Solve and show a strategy: ${strategyA} + ${strategyB} = ______`
    ]
  };
}

function buildQuickNumberCheck(found) {
  return {
    title: `Exit Ticket – ${found?.expectation?.code || ""}`,
    instructions: "Complete the three questions below.",
    questions: [
      "Write the number that comes after 24.",
      "Show the number 36 in another way.",
      "Circle the larger number: 41 or 14."
    ]
  };
}

function buildArrayCheck(found) {
  return {
    title: `Exit Ticket – ${found?.expectation?.code || ""}`,
    instructions: "Complete the multiplication questions below.",
    questions: [
      "Draw an array for 3 × 4.",
      "Solve: 5 × 2 = ______",
      "Write a multiplication sentence that matches an array you know."
    ]
  };
}

function buildGeneralCheck(found, curriculumRecipe) {
  const mode = String(curriculumRecipe?.worksheet?.mode || "").toLowerCase();
  const operation = String(curriculumRecipe?.worksheet?.config?.operation || "").toLowerCase();

  if (
    mode.includes("addition") ||
    mode.includes("subtraction") ||
    operation.includes("addition") ||
    operation.includes("subtraction")
  ) {
    return buildAdditionSubtractionExitTicket(found, curriculumRecipe);
  }

  return {
    title: `Exit Ticket – ${found?.expectation?.code || ""}`,
    instructions: "Complete the three questions below.",
    questions: [
      "Show what you know about today’s skill.",
      "Solve one example from today’s lesson.",
      "What is one part you want to practise again?"
    ]
  };
}

function buildExitTicket(found, exitTicketType = "general-check") {
  const curriculumRecipe = getCurriculumRecipe(found);
  const resolvedType =
    curriculumRecipe?.exitTicket?.type || exitTicketType || "general-check";

 if (resolvedType === "quick-number-check") {
  return buildQuickNumberCheck(found);
}

if (resolvedType === "array-check") {
  return buildArrayCheck(found);
}

if (resolvedType === "addition-subtraction-check") {
  return buildAdditionSubtractionExitTicket(found, curriculumRecipe);
}

return buildGeneralCheck(found, curriculumRecipe);
}

module.exports = {
  buildExitTicket,
};