function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function numberToWords(n) {
  const ones = [
    "zero","one","two","three","four","five","six","seven","eight","nine",
    "ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen",
    "seventeen","eighteen","nineteen"
  ];

  const tens = [
    "", "", "twenty", "thirty", "forty", "fifty",
    "sixty", "seventy", "eighty", "ninety"
  ];

  if (n < 20) return ones[n];

  if (n < 100) {
    const ten = Math.floor(n / 10);
    const one = n % 10;
    return one === 0 ? tens[ten] : `${tens[ten]}-${ones[one]}`;
  }

  if (n < 1000) {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    if (rest === 0) return `${ones[hundred]} hundred`;
    return `${ones[hundred]} hundred ${numberToWords(rest)}`;
  }

  return String(n);
}

function generateNumberWordMatchProblem(options = {}) {
  const random = options.random || Math.random;
  const min = Number.isFinite(options.minA) ? options.minA : 0;
  const max = Number.isFinite(options.maxA) ? options.maxA : 999;

  const value = randInt(min, max, random);

  return {
    prompt: `Write this number in words: ${value}`,
    answer: numberToWords(value)
  };
}

module.exports = generateNumberWordMatchProblem;
