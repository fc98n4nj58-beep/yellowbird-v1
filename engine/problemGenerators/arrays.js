const generateArithmeticProblem = require("../engines/arithmeticEngine");
const generateArraySvg = require("../visuals/arraySvg");

function generateArrayProblem() {

  const problem = generateArithmeticProblem({
    operation: "multiplication",
    format: "array",
    minA: 2,
    maxA: 10,
    minB: 2,
    maxB: 10
  });

  const rows = problem.a;
  const cols = problem.b;

  const svg = generateArraySvg({
    rows,
    cols,
    cellSize: 30
  });

  problem.visual = svg;

  return problem;
}

module.exports = generateArrayProblem;