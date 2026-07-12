const CONTROL_GROUPS = Object.freeze({
  PRACTICE: "practice",
  STUDENT_SUPPORT: "studentSupport",
  ADDITIONAL: "additional",
  ANSWER_KEY: "answerKey"
});

const VARIABLE_TYPES = Object.freeze({
  INTEGER: "integer",
  BOOLEAN: "boolean",
  NUMBER_LIST: "numberList",
  STRING: "string"
});

const variables = Object.freeze({
  questionCount: {
    id: "questionCount",
    label: "Number of questions",
    type: VARIABLE_TYPES.INTEGER,
    group: CONTROL_GROUPS.PRACTICE,
    publicClassification: "basic",
    fallback: 12,
    serialization: { includeInHash: true }
  },
  questionsPerPage: {
    id: "questionsPerPage",
    label: "Questions per page",
    type: VARIABLE_TYPES.INTEGER,
    group: CONTROL_GROUPS.ADDITIONAL,
    publicClassification: "additional",
    fallback: null,
    serialization: { includeInHash: true }
  },
  includeExample: {
    id: "includeExample",
    label: "Show one completed example",
    type: VARIABLE_TYPES.BOOLEAN,
    group: CONTROL_GROUPS.STUDENT_SUPPORT,
    publicClassification: "basic",
    fallback: false,
    serialization: { includeInHash: true }
  },
  includeAnswerKey: {
    id: "includeAnswerKey",
    label: "Include answer key",
    type: VARIABLE_TYPES.BOOLEAN,
    group: CONTROL_GROUPS.ANSWER_KEY,
    publicClassification: "basic",
    fallback: true,
    serialization: { includeInHash: true }
  },
  minimumValue: {
    id: "minimumValue",
    label: "Number range",
    type: VARIABLE_TYPES.INTEGER,
    group: CONTROL_GROUPS.PRACTICE,
    publicClassification: "basic",
    fallback: 0,
    serialization: { includeInHash: true }
  },
  maximumValue: {
    id: "maximumValue",
    label: "Number range",
    type: VARIABLE_TYPES.INTEGER,
    group: CONTROL_GROUPS.PRACTICE,
    publicClassification: "basic",
    fallback: 20,
    serialization: { includeInHash: true }
  },
  selectedValues: {
    id: "selectedValues",
    label: "Numbers to practise",
    type: VARIABLE_TYPES.NUMBER_LIST,
    group: CONTROL_GROUPS.PRACTICE,
    publicClassification: "basic",
    fallback: [],
    serialization: {
      includeInHash: true,
      orderMeaningful: false
    }
  },
  worksheetSeed: {
    id: "worksheetSeed",
    label: "Worksheet seed",
    type: VARIABLE_TYPES.STRING,
    group: CONTROL_GROUPS.ADDITIONAL,
    publicClassification: "internal",
    fallback: "yellowbird-default",
    serialization: { includeInHash: true }
  }
});

function getVariableDefinition(id) {
  return variables[id] || null;
}

function listVariableDefinitions() {
  return Object.values(variables);
}

module.exports = {
  CONTROL_GROUPS,
  VARIABLE_TYPES,
  variables,
  getVariableDefinition,
  listVariableDefinitions
};
