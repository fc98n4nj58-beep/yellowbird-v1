function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateExpandedFormProblem(options = {}) {

  const min = options.minA || 10;
  const max = options.maxA || 999;

  const value = randInt(min, max);

  const hundreds = Math.floor(value / 100);
  const tens = Math.floor((value % 100) / 10);
  const ones = value % 10;

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