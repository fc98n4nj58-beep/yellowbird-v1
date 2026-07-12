const { nextPlaceValueFormValue } = require("./placeValueFormValues");

function placeLabel(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function expandedParts(value) {
  const digits = String(value).split("").map((d) => Number(d));
  const parts = [];

  digits.forEach((digit, index) => {
    if (!digit) return;
    const place = 10 ** (digits.length - index - 1);
    parts.push(String(digit * place));
  });

  return parts;
}

function generateExpandedFormProblem(options = {}) {

  const answerStyle = String(options.answerStyle || "").trim();
  const usedProblemKeys = options.usedProblemKeys || new Set();
  let fallbackProblem = null;

  for (let attempt = 0; attempt < 120; attempt += 1) {
    const { value, uniqueAvailable } = nextPlaceValueFormValue(options, "expanded_form");
    const key = `expanded_form:${value}`;
    const exhaustedUniqueValues = [...usedProblemKeys].filter((usedKey) =>
      String(usedKey).startsWith("expanded_form:")
    ).length >= uniqueAvailable;

    const hundreds = Math.floor(value / 100);
    const tens = Math.floor((value % 100) / 10);
    const ones = value % 10;

    if (answerStyle === "hundreds_tens_ones") {
      const problem = {
        prompt: `Complete: ${value} = __ hundreds + __ tens + __ ones`,
        answer: [
          placeLabel(hundreds, "hundred", "hundreds"),
          placeLabel(tens, "ten", "tens"),
          placeLabel(ones, "one", "ones")
        ].join(", ")
      };

      fallbackProblem = problem;
      if (!usedProblemKeys.has(key) || exhaustedUniqueValues) {
        usedProblemKeys.add(key);
        return problem;
      }
      continue;
    }

    const expanded = expandedParts(value).join(" + ");
    const problem = {
      prompt: String(value),
      value,
      answer: expanded
    };

    fallbackProblem = problem;
    if (!usedProblemKeys.has(key) || exhaustedUniqueValues) {
      usedProblemKeys.add(key);
      return problem;
    }
  }

  return fallbackProblem;

}

module.exports = generateExpandedFormProblem;
