const {
  isGrade1DataGraphWorksheet,
  generateGrade1DataGraphProblem
} = require("./grade1DataGraph");
const {
  isGrade2MatchingPictographWorksheet,
  generateGrade2DataGraphProblem
} = require("./grade2DataGraph");

function generateMatchDataToGraphProblem(options = {}) {
  if (isGrade1DataGraphWorksheet(options)) {
    return generateGrade1DataGraphProblem(options);
  }
  if (isGrade2MatchingPictographWorksheet(options)) {
    return generateGrade2DataGraphProblem(options);
  }
  const random = options.random || Math.random;
  const choices = [
    { label: "Apples", value: 3 },
    { label: "Bananas", value: 6 },
    { label: "Oranges", value: 4 }
  ];

  const target = choices[Math.floor(random() * choices.length)];

  return {
    prompt: `A graph shows Apples = 3, Bananas = 6, Oranges = 4. Which category matches the value ${target.value}?`,
    answer: target.label
  };
}

module.exports = generateMatchDataToGraphProblem;
