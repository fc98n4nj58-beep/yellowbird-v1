function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEqualGroupsProblem() {
  const groups = randInt(2, 10);
  const perGroup = randInt(2, 10);

  return {
    type: "equal_groups",
    prompt: `${groups} groups have ${perGroup} items in each group. How many items are there in all?`,
    equation: `${groups} × ${perGroup} = ___`,
    answer: groups * perGroup,
    meta: {
      groups,
      perGroup
    }
  };
}

module.exports = generateEqualGroupsProblem;