function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateArrayProblem() {
  const rows = randInt(2, 10);
  const cols = randInt(2, 10);

  return {
    type: "arrays",
    prompt: `There are ${rows} rows with ${cols} objects in each row. How many objects are there altogether?`,
    equation: `${rows} × ${cols} = ___`,
    answer: rows * cols,
    meta: {
      rows,
      cols
    }
  };
}

module.exports = generateArrayProblem;