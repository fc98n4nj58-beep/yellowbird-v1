const RESOURCE_ID = "grade3_fraction_equivalence_shade_fraction_models";
const GRADE4_RESOURCE_ID = "grade4_fraction_equivalence_shade_fraction_models";
const TASK_MODE = "shade_equal_parts";
const DEFAULT_QUESTION_COUNT = 8;
const SAFE_DENOMINATORS = Object.freeze([2, 3, 4, 5, 6, 8]);
const GRADE4_SAFE_DENOMINATORS = Object.freeze([2, 3, 4, 5, 6, 8, 10, 12]);

function resourceProfile(resourceId) {
  if (resourceId === RESOURCE_ID) {
    return { gradeLabel: "Grade 3", denominators: SAFE_DENOMINATORS, signaturePrefix: "grade3_fraction:shade", wholeSizeId: "grade3-standard-strip", wholeIdPrefix: "grade3-shade" };
  }
  if (resourceId === GRADE4_RESOURCE_ID) {
    return { gradeLabel: "Grade 4", denominators: GRADE4_SAFE_DENOMINATORS, signaturePrefix: "grade4_fraction:shade", wholeSizeId: "grade4-standard-strip", wholeIdPrefix: "grade4-shade" };
  }
  return null;
}

function finiteNumber(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function numberList(value) {
  const raw = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];
  return [...new Set(raw
    .map((entry) => finiteNumber(entry))
    .filter((entry) => entry !== null)
    .map((entry) => Math.round(entry))
  )];
}

function fractionList(value) {
  const raw = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];
  return raw.map((entry) => {
    if (entry && typeof entry === "object") {
      return {
        numerator: Math.round(finiteNumber(entry.numerator)),
        denominator: Math.round(finiteNumber(entry.denominator))
      };
    }
    const match = String(entry || "").trim().match(/^(\d+)\s*\/\s*(\d+)$/);
    return match
      ? { numerator: Number(match[1]), denominator: Number(match[2]) }
      : null;
  }).filter(Boolean);
}

function shuffle(values, random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function balancedFractionOrder(values, random) {
  const groups = new Map();
  values.forEach((value) => {
    if (!groups.has(value.denominator)) groups.set(value.denominator, []);
    groups.get(value.denominator).push(value);
  });
  const denominators = shuffle([...groups.keys()], random);
  denominators.forEach((denominator) => {
    groups.set(denominator, shuffle(groups.get(denominator), random));
  });
  const ordered = [];
  while (ordered.length < values.length) {
    let added = false;
    denominators.forEach((denominator) => {
      const value = groups.get(denominator).shift();
      if (value) {
        ordered.push(value);
        added = true;
      }
    });
    if (!added) break;
  }
  return ordered;
}

function buildStrip(denominator, wholeId, profile) {
  return {
    kind: "fraction_strip",
    wholeId,
    wholeSizeId: profile.wholeSizeId,
    wholeWidthUnits: 1,
    wholeHeightUnits: 1,
    partitionCount: denominator,
    shadedParts: 0
  };
}

function buildCandidates(options = {}, profile = resourceProfile(options.worksheetId || RESOURCE_ID)) {
  const modelTypes = [options.modelType, options.modelSet]
    .flatMap((value) => Array.isArray(value) ? value : value ? [value] : [])
    .map((value) => String(value).trim().toLowerCase());
  if (modelTypes.some((value) => !["strip", "fraction_strip"].includes(value))) {
    throw new Error(`${profile.gradeLabel} Shade the Fraction supports the fraction-strip model only.`);
  }

  const selectedFractions = fractionList(options.selectedFractions || options.fractions);
  const requestedDenominators = numberList(
    options.selectedDenominators || options.denominators || options.allowedDenominators
  );
  const denominators = requestedDenominators.length
    ? requestedDenominators
    : profile.denominators;
  if (denominators.some((value) => !profile.denominators.includes(value))) {
    throw new Error(`${profile.gradeLabel} Shade the Fraction supports denominators ${profile.denominators.join(", ")} only.`);
  }

  const selectedNumerators = numberList(options.selectedNumerators || options.numerators);
  const minNumerator = Math.max(1, Math.round(finiteNumber(options.minNumerator, 1)));
  const maxNumerator = Math.max(minNumerator, Math.round(finiteNumber(options.maxNumerator, 7)));
  const source = selectedFractions.length
    ? selectedFractions
    : denominators.flatMap((denominator) => {
      const numerators = selectedNumerators.length
        ? selectedNumerators
        : Array.from({ length: denominator - 1 }, (_, index) => index + 1);
      return numerators.map((numerator) => ({ numerator, denominator }));
    });

  const candidates = source.filter(({ numerator, denominator }) => (
    profile.denominators.includes(denominator) &&
    denominators.includes(denominator) &&
    Number.isInteger(numerator) &&
    numerator >= minNumerator &&
    numerator <= maxNumerator &&
    numerator > 0 &&
    numerator < denominator
  ));
  const unique = [...new Map(candidates.map((fraction) => [
    `${fraction.numerator}/${fraction.denominator}`,
    fraction
  ])).values()];
  if (!unique.length) {
    throw new Error(`No proper ${profile.gradeLabel} shade-fraction targets match the selected contract.`);
  }
  return unique;
}

function buildItem(target, index, includeWorkedModel = false, profile = resourceProfile(RESOURCE_ID)) {
  const symbol = `${target.numerator}/${target.denominator}`;
  const model = buildStrip(target.denominator, `${profile.wholeIdPrefix}-${index + 1}`, profile);
  const requestedFraction = { ...target, symbol };
  const fractionModel = {
    kind: "fraction_strip",
    modelType: "strip",
    taskMode: TASK_MODE,
    numerator: target.numerator,
    denominator: target.denominator,
    partCount: target.denominator,
    shadeCount: target.numerator,
    requestedFraction,
    models: [model]
  };
  return {
    type: "equation",
    prompt: symbol,
    answer: symbol,
    responseMode: "shade_model",
    responseType: "drawing",
    taskMode: TASK_MODE,
    responseTarget: "shaded_parts",
    layoutVariant: "fraction_strip_grid",
    numerator: target.numerator,
    denominator: target.denominator,
    partCount: target.denominator,
    shadeCount: target.numerator,
    modelType: "strip",
    fractionModel,
    fractionWorkedModel: includeWorkedModel
      ? {
          taskMode: TASK_MODE,
          prompt: symbol,
          requestedFraction,
          model,
          answerState: { shadedParts: target.numerator }
        }
      : null,
    answerState: profile.gradeLabel === "Grade 4"
      ? {
          numerator: target.numerator,
          denominator: target.denominator,
          partitionCount: target.denominator,
          shadeCount: target.numerator,
          modelType: "strip",
          studentShadedParts: 0,
          answerKeyShadedParts: target.numerator,
          shadedParts: target.numerator
        }
      : { shadedParts: target.numerator },
    visual: { kind: "fraction_strip", data: fractionModel },
    duplicateSignature: `${profile.signaturePrefix}:${symbol}`
  };
}

function generateGrade3ShadeFractionProblem(options = {}) {
  const profile = resourceProfile(options.worksheetId);
  if (!profile) throw new Error(`Unsupported shared shade worksheet '${options.worksheetId || ""}'.`);
  const generatorState = options.generatorState || {};
  if (!generatorState.grade3ShadeFractionModels) {
    const random = typeof options.random === "function" ? options.random : () => 0.5;
    const requestedCount = Math.max(1, Math.round(finiteNumber(options.questionCount, DEFAULT_QUESTION_COUNT)));
    const candidates = buildCandidates(options, profile);
    if (candidates.length < requestedCount) {
      throw new Error(
        `${profile.gradeLabel} Shade the Fraction needs ${requestedCount} unique fractions; the selected contract provides ${candidates.length}.`
      );
    }
    generatorState.grade3ShadeFractionModels = {
      index: 0,
      items: balancedFractionOrder(candidates, random).slice(0, requestedCount)
    };
  }
  const state = generatorState.grade3ShadeFractionModels;
  const target = state.items.shift();
  if (!target) throw new Error("No unused Grade 3 shade-fraction targets remain.");
  const item = buildItem(target, state.index, Boolean(options.includeExample) && state.index === 0, profile);
  state.index += 1;
  return item;
}

function validateGrade3ShadeFractionWorksheet(worksheetId, problems = []) {
  const profile = resourceProfile(worksheetId);
  if (!profile) return true;
  if (!Array.isArray(problems) || !problems.length) {
    throw new Error(`${profile.gradeLabel} Shade the Fraction requires structured items.`);
  }
  const signatures = new Set();
  problems.forEach((problem, index) => {
    const truth = problem.fractionModel;
    const model = truth?.models?.[0];
    if (
      truth?.kind !== "fraction_strip" ||
      truth.modelType !== "strip" ||
      problem.visual?.kind !== "fraction_strip" ||
      problem.taskMode !== TASK_MODE ||
      problem.responseTarget !== "shaded_parts"
    ) {
      throw new Error(`${profile.gradeLabel} Shade the Fraction item ${index + 1} is missing structured visual truth.`);
    }
    if (
      !profile.denominators.includes(truth.denominator) ||
      !Number.isInteger(truth.numerator) ||
      truth.numerator < 1 ||
      truth.numerator >= truth.denominator ||
      truth.partCount !== truth.denominator ||
      truth.shadeCount !== truth.numerator ||
      model?.partitionCount !== truth.denominator ||
      model?.shadedParts !== 0 ||
      (worksheetId === GRADE4_RESOURCE_ID
        ? problem.answerState?.answerKeyShadedParts !== truth.numerator ||
          problem.answerState?.shadedParts !== truth.numerator ||
          problem.answerState?.studentShadedParts !== 0
        : problem.answerState?.shadedParts !== truth.numerator) ||
      problem.answer !== `${truth.numerator}/${truth.denominator}`
    ) {
      throw new Error(`${profile.gradeLabel} Shade the Fraction item ${index + 1} has inconsistent fraction truth.`);
    }
    if (signatures.has(problem.duplicateSignature)) {
      throw new Error(`${profile.gradeLabel} Shade the Fraction item ${index + 1} repeats a fraction signature.`);
    }
    signatures.add(problem.duplicateSignature);
  });
  return true;
}

module.exports = {
  RESOURCE_ID,
  GRADE4_RESOURCE_ID,
  TASK_MODE,
  DEFAULT_QUESTION_COUNT,
  SAFE_DENOMINATORS,
  GRADE4_SAFE_DENOMINATORS,
  buildCandidates,
  generateGrade3ShadeFractionProblem,
  validateGrade3ShadeFractionWorksheet
};
