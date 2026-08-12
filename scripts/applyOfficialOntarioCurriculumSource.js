const fs = require("fs");
const path = require("path");

const CURRICULUM_PATH = path.join(__dirname, "..", "data", "curriculum", "ontario", "math_k6.json");
const OFFICIAL_CSV_PATH = path.join(
  __dirname,
  "..",
  "review",
  "grades-1-6-curriculum-source-preflight",
  "official-expectation-keyspace.csv"
);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value !== "")) rows.push(row);
  const [header, ...body] = rows;
  return body.map((values) => Object.fromEntries(header.map((key, index) => [key, values[index] || ""])));
}

function gradeKey(label) {
  return `grade${String(label).replace(/[^0-9]/g, "")}`;
}

function officialRecord(row, recordType) {
  return {
    id: row.official_expectation_code || row.normalized_unique_key,
    stableId: row.normalized_unique_key,
    code: row.official_expectation_code || "",
    recordType,
    text: row.official_expectation_text,
    officialSource: {
      reference: row.official_source_reference,
      pdfPrintPages: row.official_pdf_print_pages,
      cmsItemName: row.official_cms_item_name,
      cmsItemCodename: row.official_cms_item_codename,
    },
  };
}

function main() {
  const curriculum = JSON.parse(fs.readFileSync(CURRICULUM_PATH, "utf8"));
  const rows = parseCsv(fs.readFileSync(OFFICIAL_CSV_PATH, "utf8"));
  const byGrade = new Map();

  for (const row of rows) {
    const key = gradeKey(row.grade);
    if (!byGrade.has(key)) byGrade.set(key, []);
    byGrade.get(key).push(row);
  }

  for (const grade of curriculum.grades) {
    const gradeRows = byGrade.get(grade.grade) || [];
    const strandsById = new Map(grade.strands.map((strand) => [strand.id, strand]));

    for (const strand of grade.strands) {
      const existingByCode = new Map(
        strand.topics.flatMap((topic) => topic.expectations.map((expectation) => [expectation.code, expectation]))
      );
      const specificRows = gradeRows.filter(
        (row) => row.record_type === "specific_expectation" && row.strand_code === strand.id
      );
      for (const row of specificRows) {
        const existing = existingByCode.get(row.official_expectation_code);
        if (!existing) {
          throw new Error(`Missing established specific expectation ${grade.grade}/${row.official_expectation_code}`);
        }
        existing.text = row.official_expectation_text;
        existing.recordType = "specific_expectation";
        existing.stableId = row.normalized_unique_key;
        existing.officialSource = officialRecord(row, "specific_expectation").officialSource;
      }
      strand.overallExpectations = gradeRows
        .filter((row) => row.record_type === "overall_expectation" && row.strand_code === strand.id)
        .map((row) => officialRecord(row, "overall_expectation"));
    }

    const strandARows = gradeRows.filter((row) => row.strand_code === "A");
    const overall = strandARows.filter((row) => row.record_type === "overall_expectation");
    const structural = strandARows.filter((row) => row.record_type !== "overall_expectation");
    if (overall.length !== 1 || structural.length !== 7) {
      throw new Error(`Unexpected official Strand A shape for ${grade.grade}: ${overall.length} overall, ${structural.length} structural`);
    }
    grade.strands = [
      {
        id: "A",
        name: overall[0].strand_name,
        overallExpectations: overall.map((row) => officialRecord(row, "overall_expectation")),
        structuralElements: structural.map((row) => ({
          id: row.normalized_unique_key,
          recordType: row.record_type,
          code: "",
          officialCode: "",
          title: row.specific_focus,
          text: row.official_expectation_text,
          structuralNote: row.structural_note,
          officialSource: officialRecord(row, row.record_type).officialSource,
        })),
        topics: [],
      },
      ...grade.strands.filter((strand) => strand.id !== "A"),
    ];

    for (const strand of grade.strands.filter((item) => item.id !== "A")) {
      if (!strandsById.has(strand.id)) throw new Error(`Unknown strand ${strand.id}`);
    }
  }

  curriculum.version = "2020-official-source-2026-08-12";
  curriculum.source = {
    authority: "Ontario Ministry of Education, The Ontario Curriculum, Grades 1-8: Mathematics, 2020",
    evidence: "review/grades-1-6-curriculum-source-preflight/official-expectation-keyspace.csv",
  };
  fs.writeFileSync(CURRICULUM_PATH, `${JSON.stringify(curriculum, null, 2)}\n`, "utf8");
  console.log(`Updated ${CURRICULUM_PATH} from ${OFFICIAL_CSV_PATH}`);
}

main();
