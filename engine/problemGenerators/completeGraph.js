function generateCompleteGraphProblem() {
  const categories = ["Cats", "Dogs", "Birds"];
  const values = [4, 7, 5];
  const missingIndex = Math.floor(Math.random() * categories.length);

  const visibleData = categories.map((label, index) => {
    return index === missingIndex
      ? `${label}: ___`
      : `${label}: ${values[index]}`;
  });

  return {
    prompt: `A bar graph has these values: ${visibleData.join(", ")}. What number should go in the blank for ${categories[missingIndex]}?`,
    answer: values[missingIndex]
  };
}

module.exports = generateCompleteGraphProblem;