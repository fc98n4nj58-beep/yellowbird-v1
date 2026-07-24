const { nextPlaceValueFormValue } = require("./placeValueFormValues");
const { buildGrade5RepresentationTruth } = require("./grade5PlaceValueTruth");

const GRADE5_STANDARD_FORM_ID = "grade5_place_value_representation_standard_form";

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
    if (options.worksheetId === GRADE5_STANDARD_FORM_ID) {
      const truth = buildGrade5RepresentationTruth(value);
      const problem = {
        type: "equation",
        prompt: `${truth.expandedForm} = ___`,
        answer: value,
        value,
        representedValue: value,
        numeral: truth.numeral,
        taskDirection: "expanded_to_numeral",
        responseMode: "shortNumeral",
        responseType: "numeral",
        responseTarget: "standard_form",
        acceptedAnswerVariants: [value, truth.numeral],
        answerState: {
          kind: "grade5_place_value_representation",
          promptMode: "expanded_to_numeral",
          expectedResponse: value,
          ...truth
        },
        duplicateSignature: `grade5_standard_form:${value}`
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
