function generateReadGraphProblem(options = {}) {
  const random = options.random || Math.random;
  const values = [
    { label: "Apples", value: 6 },
    { label: "Bananas", value: 4 },
    { label: "Oranges", value: 8 }
  ];

  const item = values[Math.floor(random() * values.length)];

  return {
    prompt: `A bar graph shows ${values[0].value} apples, ${values[1].value} bananas, and ${values[2].value} oranges. How many ${item.label.toLowerCase()} are there?`,
    answer: item.value
  };
}

module.exports = generateReadGraphProblem;
