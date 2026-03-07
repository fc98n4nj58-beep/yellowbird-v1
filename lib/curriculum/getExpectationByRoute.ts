import { curriculumData } from "./curriculumData";
import { CurriculumExpectation } from "./curriculumTypes";

type RouteLookup = {
  subject: string;
  grade: string;
  strand: string;
  expectationCode: string;
};

function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
}

function normalizeCode(value: string) {
  return value.trim().toLowerCase();
}

export async function getExpectationByRoute({
  subject,
  grade,
  strand,
  expectationCode,
}: RouteLookup): Promise<CurriculumExpectation | null> {
  const normalizedSubject = normalizeSlug(subject);
  const normalizedGrade = normalizeSlug(grade);
  const normalizedStrand = normalizeSlug(strand);
  const normalizedCode = normalizeCode(expectationCode);

  const record =
    curriculumData.find((item) => {
      return (
        normalizeSlug(item.subject) === normalizedSubject &&
        normalizeSlug(item.grade) === normalizedGrade &&
        normalizeSlug(item.strand) === normalizedStrand &&
        normalizeCode(item.code) === normalizedCode
      );
    }) ?? null;

  return record;
}