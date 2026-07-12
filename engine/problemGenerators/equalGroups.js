const { nextMultiplicationModelFactorPair } = require("./multiplicationModelFactors");

function isDivisionFacing(options = {}) {
  return (
    String(options.skillKey || "").toLowerCase() === "division_foundations" ||
    String(options.worksheetId || "").toLowerCase() === "g3_equal_sharing_division"
  );
}

function normalizeResponseMode(value) {
  const mode = String(value || "").trim().toLowerCase();
  return mode === "total_only" ? "total_only" : "multiplication_sentence";
}

function normalizeTaskMode(value) {
  const mode = String(value || "").trim().toLowerCase();
  if (["circle_groups", "both"].includes(mode)) return mode;
  return "distribute";
}

function normalizeEquationSupport(value) {
  const mode = String(value || "").trim().toLowerCase();
  return mode === "independent" ? "independent" : "blanks";
}

function generateEqualGroupsProblem(options = {}) {
  if (!isDivisionFacing(options)) {
    const pair = nextMultiplicationModelFactorPair(options, "equal_groups");
    const groups = pair.factorA;
    const itemsPerGroup = pair.factorB;
    const total = pair.product;
    const responseMode = normalizeResponseMode(options.responseMode);
    const showQuestionSentence = options.showQuestionSentence === true;

    return {
      type: "equation",
      prompt: showQuestionSentence
        ? `${groups} groups of ${itemsPerGroup} dots.`
        : "",
      answer: total,
      responseMode,
      responseValues: responseMode === "multiplication_sentence"
        ? [groups, itemsPerGroup, total]
        : [total],
      showQuestionSentence,
      a: groups,
      b: itemsPerGroup,
      op: "*",
      product: total,
      modelKey: pair.duplicateKey,
      orientation: pair.orientation,
      visual: {
        kind: "equal_groups",
        data: {
          groups,
          itemsPerGroup,
          factorA: groups,
          factorB: itemsPerGroup,
          product: total,
          orientation: pair.orientation
        }
      }
    };
  }

  const pair = nextMultiplicationModelFactorPair(options, "equal_sharing");
  const groups = pair.factorA;
  const itemsPerGroup = pair.factorB;
  const total = pair.product;
  const taskMode = normalizeTaskMode(options.taskMode);
  const equationSupport = normalizeEquationSupport(options.equationSupport);
  const showQuestionSentence = options.showQuestionSentence === true;

  return {
    type: "equation",
    prompt: showQuestionSentence
      ? `Share ${total} dots equally among ${groups} groups.`
      : "",
    answer: itemsPerGroup,
    responseMode: "division_sentence",
    responseValues: [total, groups, itemsPerGroup],
    taskMode,
    equationSupport,
    showQuestionSentence,
    a: total,
    b: groups,
    op: "/",
    product: total,
    quotient: itemsPerGroup,
    modelKey: pair.duplicateKey,
    orientation: "total_groups",
    visual: {
      kind: "equal_sharing",
      data: {
        total,
        groups,
        itemsPerGroup,
        quotient: itemsPerGroup,
        taskMode,
        equationSupport,
        orientation: "total_groups"
      }
    }
  };
}

module.exports = generateEqualGroupsProblem;
