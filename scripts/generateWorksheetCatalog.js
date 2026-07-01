const fs = require("fs");
const path = require("path");

const kindergarten = require("../config/worksheetCatalog/kindergarten");
const grade1 = require("../config/worksheetCatalog/grade1");
const grade2 = require("../config/worksheetCatalog/grade2");
const grade3 = require("../config/worksheetCatalog/grade3");
const grade4 = require("../config/worksheetCatalog/grade4");
const grade5 = require("../config/worksheetCatalog/grade5");
const grade6 = require("../config/worksheetCatalog/grade6");

const skillsDir = path.join(__dirname, "..", "engine", "skills");
const recipesDir = path.join(__dirname, "..", "engine", "activityRecipes");
const outputPath = path.join(__dirname, "..", "data", "worksheetCatalog.generated.json");

const curatedCatalog = [
  ...kindergarten,
  ...grade1,
  ...grade2,
  ...grade3,
  ...grade4,
  ...grade5,
  ...grade6
];

const GRADE_CONFIG = {
  kindergarten: {
    gradeLabel: "Kindergarten",
    domainsBySkill: {
      addition_subtraction_facts: "Number Sense",
      place_value_representation: "Number Sense",
      data_display_graphing: "Data & Graphing",
      multiplication_facts: "Multiplication & Division",
      fraction_equivalence: "Fractions",
      patterning_and_algebra: "Patterning & Algebra",
      addition_subtraction_word_problems: "Addition & Subtraction"
    }
  },
  grade1: {
    gradeLabel: "Grade 1",
    domainsBySkill: {
      addition_subtraction_facts: "Addition & Subtraction",
      place_value_representation: "Number Sense",
      data_display_graphing: "Data & Graphing",
      multiplication_facts: "Multiplication & Division",
      fraction_equivalence: "Fractions",
      patterning_and_algebra: "Patterning & Algebra",
      addition_subtraction_word_problems: "Addition & Subtraction"
    }
  },
  grade2: {
    gradeLabel: "Grade 2",
    domainsBySkill: {
      addition_subtraction_facts: "Addition & Subtraction",
      place_value_representation: "Place Value",
      data_display_graphing: "Data & Graphing",
      multiplication_facts: "Multiplication & Division",
      fraction_equivalence: "Fractions",
      patterning_and_algebra: "Patterning & Algebra",
      addition_subtraction_word_problems: "Addition & Subtraction"
    }
  },
  grade3: {
    gradeLabel: "Grade 3",
    domainsBySkill: {
      addition_subtraction_facts: "Addition & Subtraction",
      place_value_representation: "Place Value",
      data_display_graphing: "Data & Graphing",
      multiplication_facts: "Multiplication & Division",
      fraction_equivalence: "Fractions",
      patterning_and_algebra: "Patterning & Algebra",
      addition_subtraction_word_problems: "Addition & Subtraction"
    }
  },
  grade4: {
    gradeLabel: "Grade 4",
    domainsBySkill: {
      addition_subtraction_facts: "Addition & Subtraction",
      place_value_representation: "Place Value",
      data_display_graphing: "Data & Graphing",
      multiplication_facts: "Multiplication & Division",
      fraction_equivalence: "Fractions",
      patterning_and_algebra: "Patterning & Algebra",
      addition_subtraction_word_problems: "Addition & Subtraction"
    }
  },
  grade5: {
    gradeLabel: "Grade 5",
    domainsBySkill: {
      addition_subtraction_facts: "Addition & Subtraction",
      place_value_representation: "Place Value",
      data_display_graphing: "Data & Graphing",
      multiplication_facts: "Multiplication & Division",
      fraction_equivalence: "Fractions",
      patterning_and_algebra: "Patterning & Algebra",
      addition_subtraction_word_problems: "Addition & Subtraction"
    }
  },
  grade6: {
    gradeLabel: "Grade 6",
    domainsBySkill: {
      addition_subtraction_facts: "Addition & Subtraction",
      place_value_representation: "Place Value",
      data_display_graphing: "Data & Graphing",
      multiplication_facts: "Multiplication & Division",
      fraction_equivalence: "Fractions",
      patterning_and_algebra: "Patterning & Algebra",
      addition_subtraction_word_problems: "Addition & Subtraction"
    }
  }
};

const ACTIVITY_TYPE_MAP = {
  fact_fluency: {
    worksheetFamily: "fact_fluency",
    templateId: "fluency_grid",
    defaultTitle: "Fact Fluency",
    description: "Students practise facts with fluency and accuracy."
  },
  missing_addend: {
    worksheetFamily: "relational_thinking",
    templateId: "fluency_grid",
    defaultTitle: "Missing Addends",
    description: "Students solve equations with a missing addend."
  },
  related_subtraction: {
    worksheetFamily: "fact_fluency",
    templateId: "fluency_grid",
    defaultTitle: "Related Subtraction",
    description: "Students practise related subtraction facts."
  },
  equation_match: {
    worksheetFamily: "relational_thinking",
    templateId: "matching",
    defaultTitle: "Equation Match",
    description: "Students match related equations."
  },
  fact_family: {
    worksheetFamily: "relational_thinking",
    templateId: "matching",
    defaultTitle: "Fact Families",
    description: "Students connect related fact families."
  },
  ten_frame: {
    worksheetFamily: "visual_models",
    templateId: "visual_model",
    defaultTitle: "Ten Frame Practice",
    description: "Students use ten frames to solve or represent quantities."
  },
  word_problems: {
    worksheetFamily: "problem_solving",
    templateId: "equation_practice",
    defaultTitle: "Word Problems",
    description: "Students solve word problems in context."
  },
  pattern_word_problems: {
    worksheetFamily: "generated",
    templateId: "equation_practice",
    defaultTitle: "Pattern Word Problems",
    status: "planned",
    description: "Deferred until a pattern word-problem generator is implemented."
  },
  compare_numbers: {
    worksheetFamily: "relational_thinking",
    templateId: "equation_practice",
    defaultTitle: "Compare Numbers",
    description: "Students compare numbers using relational symbols."
  },
  skip_counting: {
    worksheetFamily: "daily_review",
    templateId: "equation_practice",
    defaultTitle: "Skip Counting",
    description: "Students complete skip-counting patterns."
  },
  expanded_form: {
    worksheetFamily: "representation",
    templateId: "representation",
    defaultTitle: "Expanded Form",
    description: "Students write numbers in expanded form."
  },
  standard_form: {
    worksheetFamily: "representation",
    templateId: "representation",
    defaultTitle: "Standard Form",
    description: "Students write numbers in standard form."
  },
  number_word_match: {
    worksheetFamily: "representation",
    templateId: "matching",
    defaultTitle: "Number Word Match",
    description: "Students match numerals and number words."
  },
  arrays: {
    worksheetFamily: "visual_models",
    templateId: "model_interpretation",
    defaultTitle: "Arrays",
    description: "Students interpret arrays and connect them to equations."
  },
  equal_groups: {
    worksheetFamily: "visual_models",
    templateId: "model_interpretation",
    defaultTitle: "Equal Groups",
    description: "Students use equal groups to model multiplication or division."
  },
  base_ten_blocks: {
    worksheetFamily: "visual_models",
    templateId: "visual_model",
    defaultTitle: "Base Ten Blocks",
    description: "Students interpret base ten block models."
  },
  number_line_identify: {
    worksheetFamily: "visual_models",
    templateId: "visual_model",
    defaultTitle: "Number Line",
    description: "Students use a number line to identify or model values."
  },
  read_graph: {
    worksheetFamily: "data_graphing",
    templateId: "visual_model",
    defaultTitle: "Read a Graph",
    description: "Students read graphs and answer questions."
  },
  complete_graph: {
    worksheetFamily: "data_graphing",
    templateId: "visual_model",
    defaultTitle: "Complete a Graph",
    description: "Students complete graph displays from data."
  },
  interpret_data: {
    worksheetFamily: "data_graphing",
    templateId: "equation_practice",
    defaultTitle: "Interpret Data",
    description: "Students interpret data and answer questions in context."
  },
  match_data_to_graph: {
    worksheetFamily: "data_graphing",
    templateId: "matching",
    defaultTitle: "Match Data to Graph",
    description: "Students match data sets to graph displays."
  },
  graph_questions: {
    worksheetFamily: "data_graphing",
    templateId: "equation_practice",
    defaultTitle: "Graph Questions",
    description: "Students answer questions about graph data."
  },
  missing_factor: {
    worksheetFamily: "relational_thinking",
    templateId: "fluency_grid",
    defaultTitle: "Missing Factors",
    description: "Students solve multiplication equations with a missing factor."
  },
  fraction_equivalence: {
    worksheetFamily: "relational_thinking",
    templateId: "equation_practice",
    defaultTitle: "Fraction Equivalence",
    description: "Students identify and generate equivalent fractions."
  },
  patterning_and_algebra: {
    worksheetFamily: "relational_thinking",
    templateId: "equation_practice",
    defaultTitle: "Patterns and Algebra",
    description: "Students work with pattern rules and algebraic thinking."
  }
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function listJsonFiles(dirPath) {
  return fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith(".json") && file !== "expectationSkillMap.json");
}

function titleCaseFromKey(key = "") {
  return key
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function slugify(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function inferActivityTypesFromRecipe(recipe) {
  const variants = recipe?.variants || {};
  const found = new Set();

  Object.values(variants).forEach((variant) => {
    const activityMix = variant?.activityMix || {};
    Object.keys(activityMix).forEach((activityType) => found.add(activityType));
  });

  return [...found];
}

function inferActivityTypesFromSkill(skill) {
  return Array.isArray(skill?.activities) ? skill.activities : [];
}

function inferAllActivityTypes(skill, recipe) {
  const fromRecipe = inferActivityTypesFromRecipe(recipe);
  const fromSkill = inferActivityTypesFromSkill(skill);
  return [...new Set([...fromRecipe, ...fromSkill])];
}

function buildGeneratedEntry({ grade, gradeLabel, domain, skill, activityType }) {
  const activityConfig =
    ACTIVITY_TYPE_MAP[activityType] || {
      worksheetFamily: "generated",
      templateId: "equation_practice",
      defaultTitle: titleCaseFromKey(activityType),
      description: `Generated worksheet for ${titleCaseFromKey(activityType).toLowerCase()}.`
    };

  const skillKey = skill.skill;
  const baseTitle = activityConfig.defaultTitle;
  const id = `${slugify(grade)}_${slugify(skillKey)}_${slugify(activityType)}`;

  return {
    id,
    title: `${baseTitle} — ${gradeLabel}`,
    shortTitle: baseTitle,
    subject: "Math",
    grades: [grade],
    gradeLabels: [gradeLabel],
    domain,
    skillKey,
    worksheetFamily: activityConfig.worksheetFamily,
    activityTypes: [activityType],
    templateId: activityConfig.templateId,
    status: activityConfig.status || "generated",
    difficulty: "grade-appropriate",
    estimatedTimeMinutes: 10,
    hasAnswerKey: true,
    tags: [
      slugify(gradeLabel).replace(/_/g, " "),
      domain.toLowerCase(),
      skillKey.replace(/_/g, " "),
      activityType.replace(/_/g, " ")
    ],
    curriculumTags: [],
    description: activityConfig.description
  };
}

function getCuratedIdSet(items) {
  return new Set(items.map((item) => item.id));
}

function loadSkills() {
  const files = listJsonFiles(skillsDir);
  return files.map((file) => readJson(path.join(skillsDir, file)));
}

function loadRecipes() {
  const files = listJsonFiles(recipesDir);
  const map = {};

  files.forEach((file) => {
    const recipe = readJson(path.join(recipesDir, file));
    const key = path.basename(file, ".json");
    map[key] = recipe;
  });

  return map;
}

function generateDraftCatalog() {
  const curatedIds = getCuratedIdSet(curatedCatalog);
  const skills = loadSkills();
  const recipes = loadRecipes();

  const generated = [];

  Object.entries(GRADE_CONFIG).forEach(([grade, gradeMeta]) => {
    skills.forEach((skill) => {
      if (!skill?.skill) return;

      const skillKey = skill.skill;
      const recipe = recipes[skillKey] || null;
      const domain =
        gradeMeta.domainsBySkill[skillKey] || "Math";
      const activityTypes = inferAllActivityTypes(skill, recipe);

      activityTypes.forEach((activityType) => {
        const entry = buildGeneratedEntry({
          grade,
          gradeLabel: gradeMeta.gradeLabel,
          domain,
          skill,
          activityType
        });

        if (!curatedIds.has(entry.id)) {
          generated.push(entry);
        }
      });
    });
  });

  generated.sort((a, b) => {
    const gradeCompare = (a.gradeLabels?.[0] || "").localeCompare(b.gradeLabels?.[0] || "");
    if (gradeCompare !== 0) return gradeCompare;

    const domainCompare = (a.domain || "").localeCompare(b.domain || "");
    if (domainCompare !== 0) return domainCompare;

    return (a.title || "").localeCompare(b.title || "");
  });

  return generated;
}

function main() {
  const generated = generateDraftCatalog();

  const output = {
    generatedAt: new Date().toISOString(),
    curatedCount: curatedCatalog.length,
    generatedCount: generated.length,
    totalDraftCount: curatedCatalog.length + generated.length,
    items: generated
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf8");

  console.log(`Generated worksheet catalog draft: ${outputPath}`);
  console.log(`Curated: ${output.curatedCount}`);
  console.log(`Generated draft entries: ${output.generatedCount}`);
  console.log(`Total potential catalog size: ${output.totalDraftCount}`);
}

main();
