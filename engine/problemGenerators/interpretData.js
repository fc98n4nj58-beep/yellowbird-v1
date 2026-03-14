function generateInterpretDataProblem() {
  const data = [
    { label: "Soccer", value: 12 },
    { label: "Basketball", value: 9 },
    { label: "Baseball", value: 6 }
  ];

  const questions = [
    {
      prompt: "A graph shows Soccer = 12, Basketball = 9, Baseball = 6. Which sport is the most popular?",
      answer: "Soccer"
    },
    {
      prompt: "A graph shows Soccer = 12, Basketball = 9, Baseball = 6. Which sport is the least popular?",
      answer: "Baseball"
    },
    {
      prompt: "A graph shows Soccer = 12, Basketball = 9, Baseball = 6. How many more students chose Soccer than Basketball?",
      answer: 3
    }
  ];

  return questions[Math.floor(Math.random() * questions.length)];
}

module.exports = generateInterpretDataProblem;