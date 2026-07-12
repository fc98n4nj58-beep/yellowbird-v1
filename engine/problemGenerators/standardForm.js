const { nextPlaceValueFormValue } = require("./placeValueFormValues");

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

function generateStandardFormProblem(options = {}) {

  const usedProblemKeys = options.usedProblemKeys || new Set();
  let fallbackProblem = null;

  for (let attempt = 0; attempt < 120; attempt += 1) {
    const { value, uniqueAvailable } = nextPlaceValueFormValue(options, "standard_form");
    const key = `standard_form:${value}`;
    const exhaustedUniqueValues = [...usedProblemKeys].filter((usedKey) =>
      String(usedKey).startsWith("standard_form:")
    ).length >= uniqueAvailable;
    const expanded = expandedParts(value).join(" + ");
    const problem = {
      prompt: `${expanded} = ___`,
      value,
      answer: value
    };

    fallbackProblem = problem;
    if (!usedProblemKeys.has(key) || exhaustedUniqueValues) {
      usedProblemKeys.add(key);
      return problem;
    }
  }

  return fallbackProblem;
}

module.exports = generateStandardFormProblem;
