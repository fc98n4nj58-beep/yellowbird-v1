const {
  GRADE1_GRAPH_TOPICS,
  validateGrade1GraphTopics
} = require("../engine/content/grade1GraphTopics");

function run() {
  const result = validateGrade1GraphTopics(GRADE1_GRAPH_TOPICS);
  console.log(JSON.stringify({
    valid: true,
    ...result
  }, null, 2));
}

try {
  run();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
