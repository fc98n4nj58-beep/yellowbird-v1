const fs = require("fs");
const path = require("path");

const CURRICULUM_PATH = path.join(
  __dirname,
  "..",
  "data",
  "curriculum",
  "ontario",
  "math_k6.json"
);

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateCurriculum(data) {
  const issues = [];
  const specificKeys = new Set();
  let overallCount = 0;
  let specificCount = 0;
  let structuralCount = 0;

  if (!data || typeof data !== "object") {
    issues.push("Top-level curriculum object is missing or invalid.");
    return issues;
  }

  if (!isNonEmptyString(data.version)) {
    issues.push("Top-level 'version' is missing or empty.");
  }

  if (!data.jurisdiction || typeof data.jurisdiction !== "object") {
    issues.push("Top-level 'jurisdiction' object is missing.");
  } else {
    if (!isNonEmptyString(data.jurisdiction.id)) {
      issues.push("Top-level 'jurisdiction.id' is missing or empty.");
    }

    if (!isNonEmptyString(data.jurisdiction.name)) {
      issues.push("Top-level 'jurisdiction.name' is missing or empty.");
    }
  }

  if (!data.subject || typeof data.subject !== "object") {
    issues.push("Top-level 'subject' object is missing.");
  } else {
    if (!isNonEmptyString(data.subject.id)) {
      issues.push("Top-level 'subject.id' is missing or empty.");
    }

    if (!isNonEmptyString(data.subject.name)) {
      issues.push("Top-level 'subject.name' is missing or empty.");
    }
  }

  if (!Array.isArray(data.grades)) {
    issues.push("Top-level 'grades' array is missing.");
    return issues;
  }

  data.grades.forEach((gradeObj, gradeIndex) => {
    const gradePath = `grades[${gradeIndex}]`;

    if (!gradeObj || typeof gradeObj !== "object") {
      issues.push(`${gradePath} is missing or invalid.`);
      return;
    }

    if (!isNonEmptyString(gradeObj.grade)) {
      issues.push(`${gradePath}.grade is missing or empty.`);
    }

    if (!isNonEmptyString(gradeObj.gradeLabel)) {
      issues.push(`${gradePath}.gradeLabel is missing or empty.`);
    }

    if (!Array.isArray(gradeObj.strands)) {
      issues.push(`${gradePath}.strands is missing or not an array.`);
      return;
    }

    if (gradeObj.strands.length === 0) {
      issues.push(`${gradePath}.strands must contain at least one strand.`);
    }

    gradeObj.strands.forEach((strandObj, strandIndex) => {
      const strandPath = `${gradePath}.strands[${strandIndex}]`;

      if (!strandObj || typeof strandObj !== "object") {
        issues.push(`${strandPath} is missing or invalid.`);
        return;
      }

      if (!isNonEmptyString(strandObj.id)) {
        issues.push(`${strandPath}.id is missing or empty.`);
      }

      if (!isNonEmptyString(strandObj.name)) {
        issues.push(`${strandPath}.name is missing or empty.`);
      }

      if (!Array.isArray(strandObj.topics)) {
        issues.push(`${strandPath}.topics is missing or not an array.`);
        return;
      }

      const isStrandA = String(strandObj.id || "").trim().toUpperCase() === "A";
      const overallExpectations = Array.isArray(strandObj.overallExpectations)
        ? strandObj.overallExpectations
        : [];
      const structuralElements = Array.isArray(strandObj.structuralElements)
        ? strandObj.structuralElements
        : [];

      if (!isStrandA && strandObj.topics.length === 0) {
        issues.push(`${strandPath}.topics must contain at least one topic.`);
      }

      overallExpectations.forEach((overall, overallIndex) => {
        const overallPath = `${strandPath}.overallExpectations[${overallIndex}]`;
        overallCount += 1;
        if (!isNonEmptyString(overall?.id) || !isNonEmptyString(overall?.code) || !isNonEmptyString(overall?.text)) {
          issues.push(`${overallPath} requires id, code, and text.`);
        }
        if (overall?.recordType !== "overall_expectation") {
          issues.push(`${overallPath}.recordType must be 'overall_expectation'.`);
        }
      });

      structuralElements.forEach((element, elementIndex) => {
        const elementPath = `${strandPath}.structuralElements[${elementIndex}]`;
        structuralCount += 1;
        if (!isStrandA) issues.push(`${elementPath} is only valid in Strand A.`);
        if (!isNonEmptyString(element?.id) || !isNonEmptyString(element?.recordType) || !isNonEmptyString(element?.text)) {
          issues.push(`${elementPath} requires id, recordType, and text.`);
        }
        if (isNonEmptyString(element?.code) || isNonEmptyString(element?.officialCode)) {
          issues.push(`${elementPath} must not invent an official code for an uncoded Strand A element.`);
        }
      });

      strandObj.topics.forEach((topicObj, topicIndex) => {
        const topicPath = `${strandPath}.topics[${topicIndex}]`;

        if (!topicObj || typeof topicObj !== "object") {
          issues.push(`${topicPath} is missing or invalid.`);
          return;
        }

        if (!isNonEmptyString(topicObj.id)) {
          issues.push(`${topicPath}.id is missing or empty.`);
        }

        if (!isNonEmptyString(topicObj.name)) {
          issues.push(`${topicPath}.name is missing or empty.`);
        }

        if (!Array.isArray(topicObj.expectations)) {
          issues.push(`${topicPath}.expectations is missing or not an array.`);
          return;
        }

        topicObj.expectations.forEach((expObj, expIndex) => {
          const expPath = `${topicPath}.expectations[${expIndex}]`;

          if (!expObj || typeof expObj !== "object") {
            issues.push(`${expPath} is missing or invalid.`);
            return;
          }

          const id = expObj.id || "";
          const code = expObj.code || "";
          const text = expObj.text || "";

          if (!isNonEmptyString(id)) {
            issues.push(`${expPath}.id is missing or empty.`);
          }

          if (!isNonEmptyString(code)) {
            issues.push(`${expPath}.code is missing or empty.`);
          }

          if (!isNonEmptyString(text)) {
            issues.push(`${expPath}.text is missing or empty.`);
          }

          specificCount += 1;
          if (expObj.recordType && expObj.recordType !== "specific_expectation") {
            issues.push(`${expPath}.recordType must be 'specific_expectation' when supplied.`);
          }
          const gradeScopedKey = `${String(gradeObj.grade || "").toLowerCase()}|${String(code).toUpperCase()}`;
          if (specificKeys.has(gradeScopedKey)) {
            issues.push(`Duplicate grade-scoped specific expectation key '${gradeScopedKey}'.`);
          }
          specificKeys.add(gradeScopedKey);

          // Structural check only:
          // Example: B2.4 should be in strand B, topic B2
          if (isNonEmptyString(code)) {
            const codeMatch = String(code).trim().toUpperCase().match(/^([A-Z])(\d+)\.(\d+)$/);

            if (codeMatch) {
              const expectedStrand = codeMatch[1];
              const expectedTopic = `${codeMatch[1]}${codeMatch[2]}`;

              const actualStrandId = String(strandObj.id || "").trim().toUpperCase();
              const actualTopicId = String(topicObj.id || "").trim().toUpperCase();

              if (actualStrandId && actualStrandId !== expectedStrand) {
                issues.push(
                  `Code '${code}' is in strand '${strandObj.id}' but appears to belong to strand '${expectedStrand}' at ${expPath}.`
                );
              }

              if (actualTopicId && actualTopicId !== expectedTopic) {
                issues.push(
                  `Code '${code}' is in topic '${topicObj.id}' but appears to belong to topic '${expectedTopic}' at ${expPath}.`
                );
              }
            } else {
              issues.push(
                `${expPath}.code '${code}' does not match expected pattern like B2.4.`
              );
            }
          }
        });
      });
    });
  });

  if (overallCount !== 72) issues.push(`Expected 72 official overall expectations, found ${overallCount}.`);
  if (specificCount !== 273) issues.push(`Expected 273 official specific expectations, found ${specificCount}.`);
  if (structuralCount !== 42) issues.push(`Expected 42 official Strand A structural elements, found ${structuralCount}.`);

  return issues;
}

function main() {
  if (!fs.existsSync(CURRICULUM_PATH)) {
    console.error(`Curriculum file not found: ${CURRICULUM_PATH}`);
    process.exit(1);
  }

  let data;
  try {
    data = loadJson(CURRICULUM_PATH);
  } catch (error) {
    console.error(`Failed to parse JSON: ${error.message}`);
    process.exit(1);
  }

  const issues = validateCurriculum(data);

  console.log(`Checked file: ${CURRICULUM_PATH}`);
  console.log(`Issues found: ${issues.length}`);

  if (issues.length) {
    console.log("\n--- Issues ---");
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
    process.exit(1);
  } else {
    console.log("No structural issues found.");
  }
}

main();
