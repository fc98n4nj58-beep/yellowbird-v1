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

function finiteInteger(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

function hasAdditionCustomization(options = {}) {
  return [
    "minA",
    "maxA",
    "minB",
    "maxB",
    "maxTotal",
    "selectedNumbers",
    "onlyNumbers"
  ].some((key) => options[key] !== undefined && options[key] !== null && options[key] !== "");
}

function parseSelectedNumbers(options = {}) {
  const raw = Array.isArray(options.selectedNumbers)
    ? options.selectedNumbers
    : typeof options.onlyNumbers === "string"
      ? options.onlyNumbers.split(",")
      : [];

  return [...new Set(
    raw
      .map((value) => finiteInteger(value))
      .filter((value) => value !== null)
  )].sort((a, b) => a - b);
}

function shuffleCopy(items, random) {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function buildAdditionFactPool(options = {}) {
  const minA = finiteInteger(options.minA, 0);
  const maxA = finiteInteger(options.maxA, 20);
  const minB = finiteInteger(options.minB, minA);
  const maxB = finiteInteger(options.maxB, maxA);
  const maxTotal = finiteInteger(options.maxTotal, Math.max(maxA, maxB));
  const pool = [];
  const seen = new Set();

  for (let a = minA; a <= maxA; a += 1) {
    for (let b = minB; b <= maxB; b += 1) {
      if (a + b > maxTotal) continue;

      const low = Math.min(a, b);
      const high = Math.max(a, b);
      const key = `${low}:${high}`;

      if (seen.has(key)) continue;
      seen.add(key);
      pool.push({ a, b, preferred: false });
    }
  }

  return pool;
}

function buildAdditionFactSequence(options = {}) {
  const random = options.random || Math.random;
  const requestedCount = Math.max(1, finiteInteger(options.questionCount, 1));
  const selected = parseSelectedNumbers(options);
  const selectedSet = new Set(selected);
  const pool = buildAdditionFactPool(options);

  if (!pool.length) {
    throw new Error("No addition facts are available for the selected range.");
  }

  const preferredPool = selected.length
    ? pool.filter((fact) => selectedSet.has(fact.a) || selectedSet.has(fact.b))
    : [];
  const sequence = [];
  const used = new Set();
  const targetPreferred = preferredPool.length
    ? Math.ceil(requestedCount * 2 / 3)
    : 0;

  function addUnique(fact) {
    const key = `${Math.min(fact.a, fact.b)}:${Math.max(fact.a, fact.b)}`;
    if (used.has(key)) return false;
    used.add(key);
    sequence.push(fact);
    return true;
  }

  shuffleCopy(preferredPool, random).forEach((fact) => {
    if (sequence.length < targetPreferred) addUnique(fact);
  });

  while (sequence.length < targetPreferred) {
    shuffleCopy(preferredPool, random).forEach((fact) => {
      if (sequence.length < targetPreferred) {
        sequence.push(fact);
      }
    });
  }

  shuffleCopy(pool, random).forEach((fact) => {
    if (sequence.length < requestedCount) addUnique(fact);
  });

  while (sequence.length < requestedCount) {
    shuffleCopy(pool, random).forEach((fact) => {
      if (sequence.length < requestedCount) {
        sequence.push(fact);
      }
    });
  }

  return {
    index: 0,
    poolSize: pool.length,
    preferredPoolSize: preferredPool.length,
    requestedCount,
    selectedNumbers: selected,
    facts: sequence
  };
}

function getAdditionSequenceState(options = {}) {
  const generatorState = options.generatorState || {};
  const key = JSON.stringify({
    minA: finiteInteger(options.minA, 0),
    maxA: finiteInteger(options.maxA, 20),
    minB: finiteInteger(options.minB, finiteInteger(options.minA, 0)),
    maxB: finiteInteger(options.maxB, finiteInteger(options.maxA, 20)),
    maxTotal: finiteInteger(options.maxTotal, finiteInteger(options.maxA, 20)),
    selectedNumbers: parseSelectedNumbers(options),
    questionCount: finiteInteger(options.questionCount, 1)
  });

  if (!generatorState.additionFactSequences) {
    generatorState.additionFactSequences = {};
  }

  if (!generatorState.additionFactSequences[key]) {
    generatorState.additionFactSequences[key] = buildAdditionFactSequence(options);
  }

  return generatorState.additionFactSequences[key];
}

function generateCustomizedAdditionProblem(options = {}) {
  const state = getAdditionSequenceState(options);
  const fact = state.facts[state.index % state.facts.length];
  state.index += 1;

  return {
    type: "equation",
    prompt: `${fact.a} + ${fact.b} = __`,
    answer: fact.a + fact.b,
    a: fact.a,
    b: fact.b,
    op: "+"
  };
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

  if (operation === "addition" && hasAdditionCustomization(options)) {
    return generateCustomizedAdditionProblem(options);
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
