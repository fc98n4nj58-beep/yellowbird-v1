function generateMatchDataToGraphProblem() {
  const options = [
    { label: "Apples", value: 3 },
    { label: "Bananas", value: 6 },
    { label: "Oranges", value: 4 }
  ];

  const target = options[Math.floor(Math.random() * options.length)];

  return {
    prompt: `A graph shows Apples = 3, Bananas = 6, Oranges = 4. Which category matches the value ${target.value}?`,
    answer: target.label
  };
}

module.exports = generateMatchDataToGraphProblem;