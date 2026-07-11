function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function pickNumber(options, min, max) {
  const random = options.random || Math.random;
  const selected = Array.isArray(options.selectedNumbers)
    ? options.selectedNumbers
    : [];

  if (selected.length) {
    return selected[Math.floor(random() * selected.length)];
  }

  return randInt(min, max, random);
}

function generateCompareNumbersProblem(options = {}) {
  const random = options.random || Math.random;
  const min = Number.isFinite(options.minA) ? options.minA : 0;
  const max = Number.isFinite(options.maxA) ? options.maxA : 999;
  const promptType = String(options.promptType || "").toLowerCase();
  const promptStyle = String(options.promptStyle || "").toLowerCase();

  const a = pickNumber(options, min, max);
  const b = pickNumber(options, min, max);

  let answer = "=";
  if (a > b) answer = ">";
  if (a < b) answer = "<";

  return {
    prompt: promptStyle === "bare"
      ? `${a}   ___   ${b}`
      : promptType === "sets"
      ? `Compare the sets: ${a}   ___   ${b}`
      : `Compare the numbers: ${a}   ___   ${b}`,
    answer
  };
}

module.exports = generateCompareNumbersProblem;
