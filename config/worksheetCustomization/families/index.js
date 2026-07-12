const { additionFactsWithin20 } = require("./additionFactsWithin20");

const families = Object.freeze({
  [additionFactsWithin20.id]: additionFactsWithin20
});

const resourceToFamily = Object.freeze(
  Object.values(families).reduce((acc, family) => {
    (family.resourceIds || []).forEach((resourceId) => {
      acc[resourceId] = family.id;
    });
    return acc;
  }, {})
);

function getCustomizationFamily(familyId) {
  return families[familyId] || null;
}

function getCustomizationFamilyForResource(resourceId) {
  const familyId = resourceToFamily[resourceId];
  return familyId ? getCustomizationFamily(familyId) : null;
}

function listCustomizationFamilies() {
  return Object.values(families);
}

module.exports = {
  families,
  getCustomizationFamily,
  getCustomizationFamilyForResource,
  listCustomizationFamilies
};
