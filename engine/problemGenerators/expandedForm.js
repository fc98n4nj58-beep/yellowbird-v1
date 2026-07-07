function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function placeLabel(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function generateExpandedFormProblem(options = {}) {

  const random = options.random || Math.random;
  const min = options.minA || 10;
  const max = options.maxA || 999;
  const answerStyle = String(options.answerStyle || "").trim();

  const value = randInt(min, max, random);

  const hundreds = Math.floor(value / 100);
  const tens = Math.floor((value % 100) / 10);
  const ones = value % 10;

  if (answerStyle === "hundreds_tens_ones") {
    return {
      prompt: `Complete: ${value} = __ hundreds + __ tens + __ ones`,
      answer: [
        placeLabel(hundreds, "hundred", "hundreds"),
        placeLabel(tens, "ten", "tens"),
        placeLabel(ones, "one", "ones")
      ].join(", ")
    };
  }

  let parts = [];

  if (hundreds) parts.push(`${hundreds * 100}`);
  if (tens) parts.push(`${tens * 10}`);
  if (ones) parts.push(`${ones}`);

  const expanded = parts.join(" + ");

  return {
    prompt: `Write the number in expanded form: ${value}`,
    answer: expanded
  };

}

module.exports = generateExpandedFormProblem;
