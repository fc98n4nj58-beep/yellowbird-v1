const generateArithmeticProblem = require("../engines/arithmeticEngine");

function getProblemKey(problem) {
  const op = problem.op || problem.operation || "";
  const a = Number(problem.a);
  const b = Number(problem.b);

  if (op === "+" || op === "addition") {
    const low = Math.min(a, b);
    const high = Math.max(a, b);
    return `${op}:${low}:${high}`;
  }

  return `${op}:${a}:${b}`;
}

function generateFactFluencyProblem(options = {}) {
  const random = options.random || Math.random;
  const usedProblemKeys = options.usedProblemKeys || new Set();

  const activityType = String(options.activityType || "").toLowerCase();
  const preferredActivityType = String(options.preferredActivityType || "").toLowerCase();
  const worksheetId = String(options.worksheetId || "").toLowerCase();
  const worksheetTitle = String(options.worksheetTitle || "").toLowerCase();

  const combinedContext = [
    activityType,
    preferredActivityType,
    worksheetId,
    worksheetTitle
  ].join(" ");

  let operation;

  if (combinedContext.includes("addition")) {
    operation = "addition";
  } else if (combinedContext.includes("subtraction")) {
    operation = "subtraction";
  } else {
    operation = random() < 0.5 ? "addition" : "subtraction";
  }

  let fallbackProblem = null;

  for (let attempt = 0; attempt < 60; attempt++) {
    let problem;

    if (operation === "addition") {
      let a, b;

      do {
        const targetSum = Math.floor(random() * 19) + 2;
        a = Math.floor(random() * (targetSum - 1)) + 1;
        b = targetSum - a;
      } while (
        b === 0 ||
        a === 0 ||
        a === b
      );

      problem = {
        type: "equation",
        prompt: `${a} + ${b} = __`,
        answer: a + b,
        a,
        b,
        op: "+"
      };
    } else {
      let a, b;

      do {
        a = Math.floor(random() * 20) + 1;
        b = Math.floor(random() * a);
      } while (
        b === 0 ||
        a === b
      );

      problem = {
        type: "equation",
        prompt: `${a} - ${b} = __`,
        answer: a - b,
        a,
        b,
        op: "-"
      };
    }

    fallbackProblem = problem;

    const key = getProblemKey(problem);

    if (!usedProblemKeys.has(key)) {
      usedProblemKeys.add(key);
      return problem;
    }
  }

  return fallbackProblem;
}

module.exports = generateFactFluencyProblem;