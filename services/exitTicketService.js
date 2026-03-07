const { getCurriculumRecipe } = require("../config/curriculumRecipes");

function buildExitTicket(found, exitTicketType = "general-check") {
  const expectationCode = found?.expectation?.code || "";
  const expectationText = found?.expectation?.text || "";

  const curriculumRecipe = getCurriculumRecipe(expectationCode);
  const resolvedType =
    curriculumRecipe?.exitTicket?.type || exitTicketType || "general-check";

  if (resolvedType === "quick-number-check") {
    return {
      title: `Exit Ticket – ${expectationCode}`,
      instructions: "Complete the three questions below.",
      questions: [
        "Write the number that comes after 24.",
        "Show the number 36 in another way.",
        "Circle the larger number: 41 or 14."
      ]
    };
  }

  if (resolvedType === "array-check") {
    return {
      title: `Exit Ticket – ${expectationCode}`,
      instructions: "Complete the multiplication questions below.",
      questions: [
        "Draw an array for 3 × 4.",
        "Solve: 5 × 2",
        "Write a multiplication sentence that matches an array you know."
      ]
    };
  }

  return {
    title: `Exit Ticket – ${expectationCode}`,
    instructions: "Complete the three questions below.",
    questions: [
      `What did you learn about ${expectationCode}?`,
      expectationText || "Show what you know.",
      "What is one thing you still need help with?"
    ]
  };
}

module.exports = {
  buildExitTicket,
};