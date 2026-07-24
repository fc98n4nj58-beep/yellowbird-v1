const { nextPlaceValueFormValue } = require("./placeValueFormValues");
const { buildGrade5RepresentationTruth } = require("./grade5PlaceValueTruth");

const GRADE5_EXPANDED_FORM_ID = "grade5_place_value_representation_expanded_form";

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

    if (options.worksheetId === GRADE5_EXPANDED_FORM_ID) {
      const truth = buildGrade5RepresentationTruth(value);
      const problem = {
        type: "equation",
        prompt: truth.numeral,
        answer: truth.expandedForm,
        value,
        representedValue: value,
        numeral: truth.numeral,
        taskDirection: "numeral_to_expanded",
        responseMode: "writtenExpandedForm",
        responseType: "expanded_form",
        responseTarget: "expanded_form",
        acceptedAnswerVariants: [truth.expandedForm],
        answerState: {
          kind: "grade5_place_value_representation",
          promptMode: "numeral_to_expanded",
          expectedResponse: truth.expandedForm,
          ...truth
        },
        duplicateSignature: `grade5_expanded_form:${value}`
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
