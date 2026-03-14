const { createContent } = require("../engine/contentFactory");
const { toInt, str } = require("../utils/helpers");
const { normalizeWorksheetLayout } = require("../engine/layout/normalizeWorksheetLayout");

function buildMixedPlan(query) {
  return [
    {
      p: "add",
      label: "Addition",
      mode: "math.addition.basic",
      count: Math.max(0, toInt(query.addCount, 0)),
    },
    {
      p: "sub",
      label: "Subtraction",
      mode: "math.subtraction.nonnegative",
      count: Math.max(0, toInt(query.subCount, 0)),
    },
    {
      p: "mul",
      label: "Multiplication",
      mode: "math.multiplication.basic",
      count: Math.max(0, toInt(query.mulCount, 0)),
    },
    {
      p: "div",
      label: "Division",
      mode: "math.division.integer",
      count: Math.max(0, toInt(query.divCount, 0)),
    },
  ].filter((x) => x.count > 0);
}

function buildSectionParams(query, prefix, count) {
  return {
    aMin: query[`${prefix}AMin`],
    aMax: query[`${prefix}AMax`],
    bMin: query[`${prefix}BMin`],
    bMax: query[`${prefix}BMax`],
    only: query[`${prefix}Only`],
    exclude: query[`${prefix}Exclude`],
    count,
    nonneg: query.nonneg,
    intdiv: query.intdiv,
  };
}

function buildSingleParams(query) {
  return {
    aMin: query.aMin,
    aMax: query.aMax,
    bMin: query.bMin,
    bMax: query.bMax,
    only: query.only,
    exclude: query.exclude,
    count: query.count,
    nonneg: query.nonneg,
    intdiv: query.intdiv,
  };
}

function buildSubheading(query) {
  const aMin = (query.aMin ?? "1").toString();
  const aMax = (query.aMax ?? "20").toString();
  const bMin = (query.bMin ?? "1").toString();
  const bMax = (query.bMax ?? "20").toString();
  const onlyTxt = (query.only ?? "").toString().trim();
  const exclTxt = (query.exclude ?? "").toString().trim();

  const parts = [
    `First Digit: ${aMin}–${aMax}`,
    `Second Digit: ${bMin}–${bMax}`,
  ];

  if (onlyTxt) parts.push(`Only: ${onlyTxt}`);
  if (exclTxt) parts.push(`Exclude: ${exclTxt}`);

  return parts.join("  •  ");
}

function buildMixedContentObject(query) {
  const plan = buildMixedPlan(query);

  if (!plan.length) {
    const err = new Error("Mixed mode: set at least one per-operation count above 0.");
    err.status = 400;
    throw err;
  }

  const mergedItems = [];
  let id = 1;

  for (const section of plan) {
    mergedItems.push({ type: "section", title: section.label });

    const params = buildSectionParams(query, section.p, section.count);
    const sectionContent = createContent({ modeId: section.mode, params });
    const items = sectionContent?.content?.items || [];

    for (const it of items) {
      mergedItems.push({ ...it, id });
      id += 1;
    }
  }

  return {
    meta: {
      modeId: "math.mixed.basic",
      subject: "math",
      title: "Mixed Practice",
    },
    content: {
      instructions: null,
      items: mergedItems,
    },
  };
}

function buildSingleContentObject(modeId, query) {
  const params = buildSingleParams(query);
  const contentObject = createContent({ modeId, params });

  contentObject.meta = contentObject.meta || {};
  contentObject.meta.subheading = buildSubheading(query);

  return contentObject;
}

function extractProblems(contentObject) {
  const items = Array.isArray(contentObject?.content?.items)
    ? contentObject.content.items
    : [];

  return items
    .filter((item) => item.type !== "section")
    .map((item) => ({
      prompt: item.prompt || item.question || item.text || "",
      answer: item.answer || "",
      visual: item.visual || "",
    }));
}

function buildWorksheetLayout({ contentObject, modeId, problems }) {
  return normalizeWorksheetLayout({
    title: contentObject?.meta?.title || "Math Practice",
    subtitle: "",
    meta: {
      gradeLabel: "",
      subjectLabel: "Math",
      strandLabel: "",
      skillLabel: contentObject?.meta?.title || "Math Practice",
    },
    instruction: "Solve each problem.",
    modeId,
    skillKey: modeId,
    problems,
  });
}

function buildWorksheetRuntime(query = {}) {
  const modeId = str(query.mode || "math.addition.basic");

  const contentObject =
    modeId === "mixed"
      ? buildMixedContentObject(query)
      : buildSingleContentObject(modeId, query);

  const problems = extractProblems(contentObject);
  const layout = buildWorksheetLayout({ contentObject, modeId, problems });

  return {
    modeId,
    contentObject,
    problems,
    layout,
  };
}

module.exports = {
  buildWorksheetRuntime,
  buildMixedPlan,
  buildSectionParams,
  buildSingleParams,
  buildSubheading,
  buildMixedContentObject,
  buildSingleContentObject,
  extractProblems,
  buildWorksheetLayout,
};
