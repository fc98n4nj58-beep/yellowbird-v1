"use strict";

const PLACE_NAMES = Object.freeze([
  "ones",
  "tens",
  "hundreds",
  "thousands",
  "ten_thousands",
  "hundred_thousands"
]);

function assertGrade5WholeNumber(value) {
  if (!Number.isInteger(value) || value < 0 || value > 100000) {
    throw new Error("Grade 5 place-value truth requires a whole number from 0 through 100,000.");
  }
}

function formatNumeral(value) {
  assertGrade5WholeNumber(value);
  return value.toLocaleString("en-CA");
}

function buildPlaceValueDigits(value) {
  assertGrade5WholeNumber(value);
  const digits = String(value).split("").map(Number);
  return digits.map((digit, index) => {
    const exponent = digits.length - index - 1;
    const place = 10 ** exponent;
    return {
      digit,
      place,
      placeName: PLACE_NAMES[exponent],
      placeValue: digit * place
    };
  });
}

function buildExpandedTerms(value) {
  return buildPlaceValueDigits(value)
    .filter(({ digit }) => digit !== 0)
    .map((term) => ({
      ...term,
      formattedValue: formatNumeral(term.placeValue)
    }));
}

function buildGrade5RepresentationTruth(value) {
  const numeral = formatNumeral(value);
  const placeValueDigits = buildPlaceValueDigits(value);
  const expandedTerms = buildExpandedTerms(value);
  const expandedForm = expandedTerms.map(({ formattedValue }) => formattedValue).join(" + ");
  return {
    representedValue: value,
    numeral,
    placeValueDigits,
    expandedTerms,
    expandedForm
  };
}

module.exports = {
  buildExpandedTerms,
  buildGrade5RepresentationTruth,
  buildPlaceValueDigits,
  formatNumeral
};
