"use strict";

const ADDITION_FACTS = Object.freeze({
  g1_addition_facts_within_20: Object.freeze({
    title: "Addition Facts Within 20",
    instruction: "Solve each addition fact."
  }),
  g2_addition_fluency_within_100: Object.freeze({
    title: "Addition Facts Within 100",
    instruction: "Solve each addition fact."
  })
});

const FACT_FAMILIES = Object.freeze({
  g1_fact_families_within_20: Object.freeze({
    title: "Fact Families Within 20",
    instruction: "Complete the fact family."
  }),
  grade2_addition_subtraction_facts_fact_family: Object.freeze({
    title: "Fact Families Within 20",
    instruction: "Complete the fact family."
  }),
  grade3_addition_subtraction_facts_fact_family: Object.freeze({
    title: "Fact Families Within 100",
    instruction: "Complete the fact family."
  })
});

const ADDITION_STORY_PROBLEMS = Object.freeze({
  g1_addition_word_problems: Object.freeze({
    title: "Addition Story Problems Within 20",
    instruction: "Read each question. Show your thinking by writing and/or drawing your answer."
  }),
  g2_addition_word_problems_within_100: Object.freeze({
    title: "Addition Story Problems Within 100",
    instruction: "Read each question. Show your thinking by writing and/or drawing your answer."
  }),
  grade3_addition_subtraction_word_problems_addition_word_problem: Object.freeze({
    title: "Addition Story Problems Within 100",
    instruction: "Read each question. Show your thinking by writing and/or drawing your answer."
  }),
  grade4_addition_subtraction_word_problems_addition_word_problem: Object.freeze({
    title: "Addition Story Problems Within 5,000",
    instruction: "Read each question. Show your thinking by writing and/or drawing your answer."
  }),
  grade5_addition_subtraction_word_problems_addition_word_problem: Object.freeze({
    title: "Addition Story Problems Within 100,000",
    instruction: "Read each question. Show your thinking by writing and/or drawing your answer."
  })
});

const ARRAYS = Object.freeze({
  grade1_multiplication_facts_arrays: Object.freeze({
    title: "Arrays",
    instruction: "Use each array to complete the number sentence."
  }),
  grade2_multiplication_facts_arrays: Object.freeze({
    title: "Multiplication with Arrays",
    instruction: "Use each array to write a multiplication equation."
  }),
  g3_multiplication_arrays: Object.freeze({
    title: "Multiplication with Arrays",
    instruction: "Use each array to write a multiplication equation."
  }),
  g4_array_interpretation: Object.freeze({
    title: "Multiplication with Arrays",
    instruction: "Use each array to write a multiplication equation."
  })
});

const WORKSHEET_PUBLIC_COPY = Object.freeze({
  ...ADDITION_FACTS,
  ...FACT_FAMILIES,
  ...ADDITION_STORY_PROBLEMS,
  ...ARRAYS
});

function getWorksheetPublicCopy(id) {
  return WORKSHEET_PUBLIC_COPY[id] || null;
}

function applyWorksheetPublicCopy(item) {
  const copy = getWorksheetPublicCopy(item?.id);
  return copy
    ? { ...item, title: copy.title, studentInstruction: copy.instruction }
    : item;
}

module.exports = {
  ADDITION_FACTS,
  FACT_FAMILIES,
  ADDITION_STORY_PROBLEMS,
  ARRAYS,
  WORKSHEET_PUBLIC_COPY,
  getWorksheetPublicCopy,
  applyWorksheetPublicCopy
};
