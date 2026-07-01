const pdfDesignTokens = {
  page: {
    marginTop: 54,
    marginRight: 54,
    marginBottom: 54,
    marginLeft: 54
  },

  typography: {
    titleSize: 21,
    subtitleSize: 12,
    instructionSize: 11,
    questionSize: 13,
    footerSize: 9,
    labelSize: 9
  },

  spacing: {
    xs: 6,
    sm: 12,
    md: 18,
    lg: 24,
    xl: 36
  },

  rules: {
    thin: 0.6,
    normal: 0.8,
    color: "#d6d3d1"
  },

  colors: {
    text: "#222222",
    muted: "#4b5563",
    lightRule: "#d6d3d1",
    answerRule: "#9ca3af"
  },

  worksheet: {
    questionGap: 18,
    columnGap: 28,
    headerToQuestionsGap: 28,
    footerBuffer: 24
  }
};

module.exports = {
  pdfDesignTokens
};