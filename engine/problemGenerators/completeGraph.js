const {
  isGrade1DataGraphWorksheet,
  generateGrade1DataGraphProblem
} = require("./grade1DataGraph");
const {
  isGrade2CompletePictographWorksheet,
  generateGrade2DataGraphProblem
} = require("./grade2DataGraph");

function generateCompleteGraphProblem(options = {}) {
  if (isGrade1DataGraphWorksheet(options)) {
    return generateGrade1DataGraphProblem(options);
  }
  if (isGrade2CompletePictographWorksheet(options)) {
    return generateGrade2DataGraphProblem(options);
  }
  const random = options.random || Math.random;
  const categories = ["Cats", "Dogs", "Birds"];
  const values = [4, 7, 5];
  const missingIndex = Math.floor(random() * categories.length);

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
