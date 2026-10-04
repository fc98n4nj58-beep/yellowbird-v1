const crypto = require("crypto");

const {
  variables,
  getVariableDefinition,
  getCustomizationFamilyForResource
} = require("../config/worksheetCustomization");

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj || {}, key);
}

function deepClone(value) {
  if (Array.isArray(value)) return value.map(deepClone);
  if (value && typeof value === "object") {
    return Object.keys(value).reduce((acc, key) => {
      acc[key] = deepClone(value[key]);
      return acc;
    }, {});
  }
  return value;
}

function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const normalized = String(value ?? "").trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return null;
}

function parseNumberList(value) {
  const raw = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : value === undefined || value === null || value === ""
        ? []
        : [value];

  const values = [];
  const invalid = [];

  raw.forEach((entry) => {
    const n = Number(String(entry).trim());
    if (Number.isFinite(n)) {
      values.push(Math.round(n));
    } else if (String(entry).trim()) {
      invalid.push(entry);
    }
  });

  const deduped = [...new Set(values)].sort((a, b) => a - b);
  return { values: deduped, invalid };
}

function stableSortObject(value) {
  if (Array.isArray(value)) return value.map(stableSortObject);
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        if (value[key] !== undefined) {
          acc[key] = stableSortObject(value[key]);
        }
        return acc;
      }, {});
  }
  return value;
}

function stableSerialize(value) {
  return JSON.stringify(stableSortObject(value));
}

function getSupportedOptionNames(family) {
  const names = new Set(Object.keys(family.controls || {}));
  Object.values(family.aliases?.resource || {}).flat().forEach((name) => names.add(name));
  Object.values(family.aliases?.legacy || {}).flat().forEach((name) => names.add(name));
  return names;
}

function coerceValue(variableId, value, result, control = {}) {
  const baseDefinition = getVariableDefinition(variableId);
  const definition = baseDefinition && { ...baseDefinition, label: control.label || baseDefinition.label };

  if (!definition) {
    result.errors.push({
      field: variableId,
      code: "unknown_variable",
      message: `Unknown customization option: ${variableId}.`
    });
    return undefined;
  }

  if (definition.type === "boolean") {
    const bool = parseBoolean(value);
    if (bool === null) {
      result.errors.push({
        field: variableId,
        code: "invalid_boolean",
        message: `${definition.label} must be true or false.`
      });
      return undefined;
    }
    return bool;
  }

  if (definition.type === "integer") {
    const n = Number(value);
    if (!Number.isFinite(n) || !Number.isInteger(n) || (control.strictInput &&
        ((typeof value !== "number" && typeof value !== "string") || String(value).trim() === ""))) {
      result.errors.push({
        field: variableId,
        code: "invalid_integer",
        message: `${definition.label} must be a whole number.`
      });
      return undefined;
    }
    return n;
  }

  if (definition.type === "numberList") {
    const parsed = parseNumberList(value);
    if (parsed.invalid.length) {
      result.errors.push({
        field: variableId,
        code: "invalid_number_list",
        message: `${definition.label} must contain numbers only.`
      });
      return undefined;
    }
    return parsed.values;
  }

  if (definition.type === "string") {
    if (control.strictInput && typeof value !== "string") {
      result.errors.push({ field: variableId, code: "invalid_string", message: `${definition.label} must be one of: ${control.allowedValues.join(", ")}.` });
      return undefined;
    }
    return String(value ?? "").trim();
  }

  return value;
}

function resolveSubmittedValue(variableId, input, family, result) {
  const control = family.controls?.[variableId] || {};
  if (control.rejectAliasConflicts) {
    const keys = [variableId, ...(family.aliases?.resource?.[variableId] || []), ...(family.aliases?.legacy?.[variableId] || [])]
      .filter(key => hasOwn(input, key));
    const values = keys.length > 1 ? keys.map(key => coerceValue(variableId, input[key], result, control)) : [];
    if (values.some(value => value !== values[0])) result.errors.push({
      field: variableId, code: "alias_conflict",
      message: `${control.label || variableId} has conflicting values (${keys.join(", ")}). Submit one consistent endpoint.`
    });
  }
  if (hasOwn(input, variableId)) {
    return {
      found: true,
      source: "canonical",
      key: variableId,
      value: input[variableId]
    };
  }

  const resourceAliases = family.aliases?.resource?.[variableId] || [];
  const legacyAliases = family.aliases?.legacy?.[variableId] || [];
  const aliasGroups = [
    { source: "resourceAlias", aliases: resourceAliases },
    { source: "legacyAlias", aliases: legacyAliases }
  ];

  for (const group of aliasGroups) {
    const matches = group.aliases.filter((alias) => hasOwn(input, alias));
    if (!matches.length) continue;

    const first = matches[0];
    const firstValue = input[first];
    const conflict = matches.find((alias) =>
      stableSerialize(input[alias]) !== stableSerialize(firstValue)
    );

    if (conflict) {
      result.diagnostics.push({
        type: "alias_conflict",
        variableId,
        aliases: matches,
        selectedAlias: first
      });
    }

    return {
      found: true,
      source: group.source,
      key: first,
      value: firstValue
    };
  }

  return { found: false };
}

function validateControl(variableId, value, family, resourceDeclaration, result) {
  const control = family.controls?.[variableId] || {};
  const definition = { ...(variables[variableId] || {}), ...(control.label ? { label: control.label } : {}) };

  if (value === undefined) return;

  if (definition.type === "integer") {
    if (Number.isFinite(control.min) && value < control.min) {
      result.errors.push({
        field: variableId,
        code: "below_minimum",
        message: `${definition.label} must be at least ${control.min}.`
      });
    }
    if (Number.isFinite(control.max) && value > control.max) {
      result.errors.push({
        field: variableId,
        code: "above_maximum",
        message: `${definition.label} must be ${control.max} or less.`
      });
    }
  }
  if (Array.isArray(control.allowedValues) && !control.allowedValues.includes(value)) {
    result.errors.push({
      field: variableId,
      code: "unsupported_value",
      message: definition.type === "integer"
        ? `${definition.label} is not approved at that value for this worksheet.`
        : `${definition.label} must be one of: ${control.allowedValues.join(", ")}.`
    });
  }

  if (definition.type === "numberList") {
    const below = value.find((n) => Number.isFinite(control.min) && n < control.min);
    const above = value.find((n) => Number.isFinite(control.max) && n > control.max);

    if (below !== undefined) {
      result.errors.push({
        field: variableId,
        code: "below_minimum",
        message: `${definition.label} must use numbers at least ${control.min}.`
      });
    }

    if (above !== undefined) {
      result.errors.push({
        field: variableId,
        code: "above_maximum",
        message: `${definition.label} must use numbers ${control.max} or less.`
      });
    }
  }

  if (
    family.range?.kind !== "linkedNumberLine" &&
    variableId === "maximumValue" &&
    resourceDeclaration?.suggestedRange &&
    value > resourceDeclaration.suggestedRange.maximumValue
  ) {
    result.notices.push({
      field: variableId,
      code: "custom_range",
      message: resourceDeclaration.notices?.customRange || "Custom range selected"
    });
  }
}

function validateCrossFields(options, result, family, resourceDeclaration) {
  if (family.range?.kind === "linkedNumberLine") {
    const min = options.minimumValue, max = options.maximumValue;
    if (Number.isInteger(min) && Number.isInteger(max) &&
        !result.errors.some(error => ["minimumValue", "maximumValue"].includes(error.field))) {
      if (max - min < family.range.minimumSpan) result.errors.push({
        field: "maximumValue", code: "empty_number_line_range", message: "To must be greater than From. Choose a range with at least one forward step."
      });
      if (max - min > family.range.maximumSpan) result.errors.push({
        field: "maximumValue", code: "number_line_span_too_wide", message: `Keep To minus From at ${family.range.maximumSpan} or less so unit ticks and arrows remain readable.`
      });
      if (min !== resourceDeclaration.suggestedRange.minimumValue || max !== resourceDeclaration.suggestedRange.maximumValue) result.notices.push({
        field: "maximumValue", code: "custom_range", message: resourceDeclaration.notices.customRange
      });
    }
  } else if (
    Number.isFinite(options.minimumValue) &&
    Number.isFinite(options.maximumValue) &&
    options.minimumValue > options.maximumValue
  ) {
    result.errors.push({
      field: "minimumValue",
      code: "minimum_exceeds_maximum",
      message: "The minimum value must be less than or equal to the maximum value."
    });
  }

  if (Array.isArray(options.selectedValues) && options.selectedValues.length) {
    const min = Number.isFinite(options.minimumValue) ? options.minimumValue : null;
    const max = Number.isFinite(options.maximumValue) ? options.maximumValue : null;
    const outside = options.selectedValues.filter((value) =>
      (min !== null && value < min) || (max !== null && value > max)
    );

    if (outside.length) {
      result.errors.push({
        field: "selectedValues",
        code: "selected_values_outside_range",
        message: "Numbers to practise must stay inside the selected range."
      });
    }
  }
}

function resolveFamily(resourceId) {
  return getCustomizationFamilyForResource(resourceId);
}

function validateAdditionFactsDomain(options, result) {
  const min = options.minimumValue;
  const max = options.maximumValue;
  if (!Number.isInteger(min) || !Number.isInteger(max) ||
      result.errors.some(error => ["minimumValue", "maximumValue"].includes(error.field))) return;

  // This family's adapter applies one range to both addends and caps sums at
  // maximumValue. The smallest partner is min, so these are domain checks,
  // independent of random selection, weighting, and requested question count.
  if (min + min > max) {
    result.errors.push({
      field: "minimumValue",
      code: "empty_addition_fact_pool",
      message: `No addition facts can use numbers from ${min} to ${max} with sums up to ${max}. Lower the lowest number or raise the highest number.`
    });
  }

  const impossible = (options.selectedValues || []).filter(value =>
    value >= min && value <= max && value + min > max
  );
  if (impossible.length) {
    result.errors.push({
      field: "selectedValues",
      code: "selected_values_infeasible",
      message: `${impossible.join(", ")} cannot be used with numbers from ${min} to ${max} and sums up to ${max}. Remove ${impossible.length === 1 ? "it" : "them"} or change the number range.`
    });
  }
}

function validateExactSelection(options, input, result, family) {
  if (family.controls?.selectedValues?.semantics !== "exact") return;
  const selected = options.selectedValues || [];
  const required = Number(options.questionCount || 0) + (options.includeExample ? 1 : 0);
  if (selected.length && selected.length < required) {
    result.errors.push({
      field: "selectedValues",
      code: "insufficient_exact_values",
      message: `Choose at least ${required} unique numbers for the requested questions${options.includeExample ? " and separate example" : ""}.`
    });
  }

  const keys = ["selectedValues", ...(family.aliases?.legacy?.selectedValues || [])];
  const sourceKey = keys.find(key => hasOwn(input, key));
  if (!sourceKey) return;
  const raw = Array.isArray(input[sourceKey]) ? input[sourceKey] : String(input[sourceKey]).split(",");
  const values = raw.map(value => Number(String(value).trim())).filter(Number.isFinite);
  if (new Set(values).size !== values.length) {
    result.errors.push({
      field: "selectedValues",
      code: "duplicate_exact_values",
      message: "Numbers to practise must be unique for this worksheet."
    });
  }
}

function normalizeWorksheetCustomization(resourceId, input = {}) {
  const sourceInput = deepClone(input);
  const family = resolveFamily(resourceId);
  const result = {
    ok: true,
    normalizedOptions: {},
    generatorOptions: {},
    canonicalPayload: null,
    optionHash: "",
    errors: [],
    warnings: [],
    notices: [],
    unsupportedOptions: [],
    diagnostics: []
  };

  if (!family) {
    result.ok = false;
    result.errors.push({
      field: "resourceId",
      code: "unsupported_resource",
      message: "This worksheet does not support customization yet."
    });
    return result;
  }

  const resourceDeclaration = family.resources?.[resourceId] || {};
  const supportedCanonical = Object.keys(family.controls || {});
  const supportedNames = getSupportedOptionNames(family);

  Object.keys(sourceInput).forEach((key) => {
    if (!supportedNames.has(key)) {
      result.unsupportedOptions.push(key);
    }
  });

  if (result.unsupportedOptions.length) {
    result.errors.push({
      field: "unsupportedOptions",
      code: "unsupported_options",
      message: "Some submitted customization options are not supported for this worksheet."
    });
  }

  const defaults = {
    ...(Object.keys(variables).reduce((acc, key) => {
      const definition = variables[key];
      if (definition && definition.fallback !== undefined && definition.fallback !== null) {
        acc[key] = deepClone(definition.fallback);
      }
      return acc;
    }, {})),
    ...(family.defaults || {}),
    ...(resourceDeclaration.defaults || {})
  };

  supportedCanonical.forEach((variableId) => {
    const submitted = resolveSubmittedValue(variableId, sourceInput, family, result);
    const rawValue = submitted.found ? submitted.value : defaults[variableId];
    const coerced = coerceValue(variableId, rawValue, result, family.controls?.[variableId]);

    if (coerced !== undefined) {
      result.normalizedOptions[variableId] = coerced;
      validateControl(variableId, coerced, family, resourceDeclaration, result);

      if (submitted.found && submitted.source !== "canonical") {
        result.diagnostics.push({
          type: "alias_used",
          variableId,
          alias: submitted.key,
          source: submitted.source
        });
      }
    }
  });

  validateCrossFields(result.normalizedOptions, result, family, resourceDeclaration);
  validateExactSelection(result.normalizedOptions, sourceInput, result, family);
  if (family.id === "additionFactsWithin20") {
    validateAdditionFactsDomain(result.normalizedOptions, result);
  }

  if (typeof family.adapter === "function") {
    result.generatorOptions = family.adapter(result.normalizedOptions);
  }

  result.canonicalPayload = buildCanonicalPayload({
    resourceId,
    familyId: family.id,
    normalizedOptions: result.normalizedOptions
  });
  result.optionHash = hashCanonicalPayload(result.canonicalPayload);
  result.ok = !result.errors.length;

  return result;
}

function buildCanonicalPayload({ resourceId, familyId, normalizedOptions = {} }) {
  const sortedOptions = Object.keys(normalizedOptions)
    .sort()
    .reduce((acc, key) => {
      const value = normalizedOptions[key];
      if (value === undefined) return acc;
      const definition = variables[key];
      if (Array.isArray(value)) {
        const deduped = [...new Set(value.map((n) => Number(n)).filter(Number.isFinite))];
        acc[key] = definition?.serialization?.orderMeaningful
          ? deduped
          : deduped.sort((a, b) => a - b);
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});

  return {
    resourceId,
    familyId,
    options: sortedOptions,
    effectiveSeed: sortedOptions.worksheetSeed || "yellowbird-default",
    includeAnswerKey: sortedOptions.includeAnswerKey !== false
  };
}

function hashCanonicalPayload(payload) {
  return crypto
    .createHash("sha256")
    .update(stableSerialize(payload))
    .digest("hex");
}

function serializeCanonicalPayload(payload) {
  return stableSerialize(payload);
}

module.exports = {
  normalizeWorksheetCustomization,
  buildCanonicalPayload,
  serializeCanonicalPayload,
  hashCanonicalPayload,
  stableSerialize
};
