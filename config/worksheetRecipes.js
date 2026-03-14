const WORKSHEET_TEMPLATES = {
  "standard-practice": {
    layout: "standard",
    defaultColumns: 2,
    showNameLine: true,
    showDateLine: true,
    spacing: "md"
  },

  "fluency-grid": {
    layout: "grid",
    defaultColumns: 3,
    showNameLine: true,
    showDateLine: false,
    spacing: "sm"
  },

  "word-problem-set": {
    layout: "stacked",
    defaultColumns: 1,
    showNameLine: true,
    showDateLine: true,
    spacing: "lg"
  }
};

function getWorksheetTemplate(templateId = "standard-practice") {
  return (
    WORKSHEET_TEMPLATES[templateId] ||
    WORKSHEET_TEMPLATES["standard-practice"]
  );
}

module.exports = {
  WORKSHEET_TEMPLATES,
  getWorksheetTemplate
};