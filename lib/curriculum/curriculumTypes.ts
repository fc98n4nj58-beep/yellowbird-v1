export type RelatedResource = {
  type: string;
  title: string;
  href: string;
};

export type CurriculumExpectation = {
  jurisdiction: "on";
  subject: string; // ex: "math"
  grade: string; // ex: "grade3"
  strand: string; // ex: "number"
  code: string; // ex: "B2.4"
  title: string; // ex: "Multiplication within 100"
  description?: string;

  learningGoal?: string;
  successCriteria?: string[];

  overallExpectationCode?: string;
  overallExpectationTitle?: string;

  keywords?: string[];
  relatedResources?: RelatedResource[];
};