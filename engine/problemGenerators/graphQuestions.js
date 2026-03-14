function generateGraphQuestionsProblem() {
  const data = [
    { label: "Red", value: 5 },
    { label: "Blue", value: 8 },
    { label: "Green", value: 3 }
  ];

  const questionTypes = [
    {
      prompt: `A graph shows Red = 5, Blue = 8, Green = 3. Which category has the greatest value?`,
      answer: "Blue"
    },
    {
      prompt: `A graph shows Red = 5, Blue = 8, Green = 3. Which category has the least value?`,
      answer: "Green"
    },
    {
      prompt: `A graph shows Red = 5, Blue = 8, Green = 3. How many more does Blue have than Red?`,
      answer: 3
    }
  ];

  return questionTypes[Math.floor(Math.random() * questionTypes.length)];
}

module.exports = generateGraphQuestionsProblem;